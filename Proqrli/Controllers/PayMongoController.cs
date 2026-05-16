using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;
using ProqrLi.Services;

namespace ProqrLi.Controllers
{
    [ApiController]
    [Route("api/paymongo")]
    public class PayMongoController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly AuthService _auth;
        private readonly PayMongoService _payMongo;

        public PayMongoController(ApplicationDbContext db, AuthService auth, PayMongoService payMongo)
        {
            _db = db;
            _auth = auth;
            _payMongo = payMongo;
        }

        [HttpGet("plans")]
        public async Task<IActionResult> GetPlans([FromQuery] string portal = "buyer")
        {
            var applicableTo = portal.Equals("vendor", StringComparison.OrdinalIgnoreCase) ? "VENDOR" : "BUYER";
            var plans = await _db.SubscriptionPlans
                .Where(p => p.IsActive && p.ApplicableTo == applicableTo)
                .OrderBy(p => p.Price)
                .Select(p => new
                {
                    id = p.PlanID,
                    name = p.PlanName,
                    price = p.Price,
                    applicableTo = p.ApplicableTo,
                    maxUsers = p.MaxUsers,
                    features = p.Features,
                    featured = p.PlanName.Contains("Pro")
                })
                .ToListAsync();

            return Ok(plans);
        }

        [HttpGet("payment-methods")]
        public async Task<IActionResult> GetPaymentMethods()
        {
            try
            {
                var methods = await _payMongo.RetrieveAvailablePaymentMethodsAsync();
                return Ok(new
                {
                    paymentMethods = methods.Select(method => new
                    {
                        id = ToClientPaymentMethod(method),
                        payMongoType = method,
                        label = DisplayPaymentMethod(method)
                    })
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("onboarding-checkout")]
        public async Task<IActionResult> CreateOnboardingCheckout([FromBody] PayMongoOnboardingCheckoutRequest req)
        {
            if (User.Identity?.IsAuthenticated != true)
                return Unauthorized(new { error = "Not authenticated." });

            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { error = "Invalid session." });

            if (req.Onboarding.PlanId is null)
                return BadRequest(new { error = "Select a subscription plan before checkout." });

            try
            {
                var (user, tenant) = await _auth.GetTenantUserWithTenantAsync(userId.Value);
                var plan = await _auth.GetSubscriptionPlanAsync(req.Onboarding.PlanId.Value);

                if (plan.Price <= 0)
                    return BadRequest(new { error = "Free plans do not require PayMongo checkout." });

                if (!string.Equals(plan.ApplicableTo, tenant.TenantType, StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { error = "Selected plan does not match this account type." });

                var selectedMethod = NormalizePaymentMethod(req.PaymentMethod);
                var availableMethods = await _payMongo.RetrieveAvailablePaymentMethodsAsync();
                if (!availableMethods.Any())
                    return BadRequest(new { error = "No PayMongo payment methods are enabled for this account yet. Enable QR Ph, card, GCash, or Maya in your PayMongo dashboard." });

                if (!availableMethods.Contains(selectedMethod, StringComparer.OrdinalIgnoreCase))
                {
                    var enabledLabels = string.Join(", ", availableMethods.Select(DisplayPaymentMethod));
                    return BadRequest(new
                    {
                        error = $"{DisplayPaymentMethod(selectedMethod)} is not enabled in PayMongo for this account. Choose {enabledLabels}, or enable that method in your PayMongo dashboard."
                    });
                }

                var origin = $"{Request.Scheme}://{Request.Host}";
                var portal = tenant.TenantType.Equals("Vendor", StringComparison.OrdinalIgnoreCase) ? "vendor" : "buyer";
                var successUrl = $"{origin}/onboarding?portal={portal}&payment=success";
                var cancelUrl = $"{origin}/onboarding?portal={portal}&payment=cancelled";

                var session = await _payMongo.CreateCheckoutSessionAsync(new PayMongoCheckoutRequest(
                    CustomerName: req.Onboarding.FullName,
                    CustomerEmail: user.Email,
                    CustomerPhone: req.Onboarding.ContactNumber,
                    Description: $"ProqrLi {plan.PlanName} monthly subscription",
                    SuccessUrl: successUrl,
                    CancelUrl: cancelUrl,
                    PaymentMethodTypes: new[] { selectedMethod },
                    LineItems: new[]
                    {
                        new PayMongoCheckoutLineItem(
                            Name: $"ProqrLi {plan.PlanName}",
                            Description: $"{tenant.TenantType} workspace subscription",
                            AmountInCentavos: checked((int)Math.Round(plan.Price * 100m)),
                            Quantity: 1)
                    },
                    Metadata: new Dictionary<string, string>
                    {
                        ["user_id"] = user.UserID.ToString(),
                        ["tenant_id"] = tenant.TenantID.ToString(),
                        ["plan_id"] = plan.PlanID.ToString(),
                        ["portal"] = portal
                    }
                ));

                return Ok(new PayMongoOnboardingCheckoutResponse(session.Id, session.CheckoutUrl));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("onboarding-confirm")]
        public async Task<IActionResult> ConfirmOnboardingCheckout([FromBody] PayMongoOnboardingConfirmRequest req)
        {
            if (User.Identity?.IsAuthenticated != true)
                return Unauthorized(new { error = "Not authenticated." });

            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { error = "Invalid session." });

            if (string.IsNullOrWhiteSpace(req.CheckoutSessionId))
                return BadRequest(new { error = "Missing PayMongo checkout session." });

            try
            {
                var verification = await _payMongo.RetrieveCheckoutSessionAsync(req.CheckoutSessionId);
                if (!verification.IsPaid)
                    return BadRequest(new { error = "PayMongo has not confirmed this checkout as paid yet." });

                if (!verification.Metadata.TryGetValue("user_id", out var metadataUserId) ||
                    metadataUserId != userId.Value.ToString())
                    return BadRequest(new { error = "This PayMongo checkout does not belong to your session." });

                if (req.Onboarding.PlanId is null ||
                    !verification.Metadata.TryGetValue("plan_id", out var metadataPlanId) ||
                    metadataPlanId != req.Onboarding.PlanId.Value.ToString())
                    return BadRequest(new { error = "This PayMongo checkout does not match the selected plan." });

                var existingPayment = await _db.SubscriptionPayments
                    .Include(p => p.Billing)
                    .FirstOrDefaultAsync(p => p.Reference == verification.Id);

                if (existingPayment?.Billing != null)
                {
                    var existingResp = await _auth.GetByIdAsync(userId.Value);
                    return existingResp is null ? BadRequest(new { error = "Unable to load user after payment." }) : Ok(existingResp);
                }

                var resp = await _auth.SaveOnboardingAsync(
                    userId.Value,
                    req.Onboarding,
                    paidReference: verification.Id,
                    paymentMethod: verification.PaymentMethod);

                return Ok(resp);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        private int? GetUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(userIdStr, out var userId) ? userId : null;
        }

        private static string NormalizePaymentMethod(string method)
        {
            var normalized = method.Trim().ToLowerInvariant();
            return normalized switch
            {
                "gcash" => "gcash",
                "maya" or "paymaya" => "paymaya",
                "qrph" or "qr_ph" or "qr-ph" => "qrph",
                _ => "card"
            };
        }

        private static string ToClientPaymentMethod(string method) =>
            method.Equals("paymaya", StringComparison.OrdinalIgnoreCase) ? "maya" : method;

        private static string DisplayPaymentMethod(string method)
        {
            return method.ToLowerInvariant() switch
            {
                "card" => "Credit / Debit Card",
                "gcash" => "GCash",
                "paymaya" => "Maya",
                "qrph" => "QR Ph",
                _ => method
            };
        }
    }
}
