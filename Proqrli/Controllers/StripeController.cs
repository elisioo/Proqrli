using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;
using ProqrLi.Services;

namespace ProqrLi.Controllers
{
    [ApiController]
    [Route("api/stripe")]
    public class StripeController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly AuthService _auth;
        private readonly StripeCheckoutService _stripe;

        public StripeController(ApplicationDbContext db, AuthService auth, StripeCheckoutService stripe)
        {
            _db = db;
            _auth = auth;
            _stripe = stripe;
        }

        [HttpPost("onboarding-checkout")]
        public async Task<IActionResult> CreateOnboardingCheckout([FromBody] StripeOnboardingCheckoutRequest req)
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
                    return BadRequest(new { error = "Free plans do not require Stripe checkout." });

                if (!string.Equals(plan.ApplicableTo, tenant.TenantType, StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { error = "Selected plan does not match this account type." });

                var origin = $"{Request.Scheme}://{Request.Host}";
                var portal = tenant.TenantType.Equals("Vendor", StringComparison.OrdinalIgnoreCase) ? "vendor" : "buyer";
                var successUrl = $"{origin}/onboarding?portal={portal}&stripe=success&session_id={{CHECKOUT_SESSION_ID}}";
                var cancelUrl = $"{origin}/onboarding?portal={portal}&stripe=cancelled";

                var session = await _stripe.CreateCheckoutSessionAsync(new StripeCheckoutRequest(
                    CustomerEmail: user.Email,
                    Description: $"{tenant.TenantType} workspace subscription",
                    SuccessUrl: successUrl,
                    CancelUrl: cancelUrl,
                    Currency: "php",
                    ProductName: $"ProqrLi {plan.PlanName}",
                    UnitAmount: checked((long)Math.Round(plan.Price * 100m)),
                    Metadata: new Dictionary<string, string>
                    {
                        ["user_id"] = user.UserID.ToString(),
                        ["tenant_id"] = tenant.TenantID.ToString(),
                        ["plan_id"] = plan.PlanID.ToString(),
                        ["portal"] = portal
                    }
                ));

                return Ok(new StripeOnboardingCheckoutResponse(session.Id, session.CheckoutUrl));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("onboarding-confirm")]
        public async Task<IActionResult> ConfirmOnboardingCheckout([FromBody] StripeOnboardingConfirmRequest req)
        {
            if (User.Identity?.IsAuthenticated != true)
                return Unauthorized(new { error = "Not authenticated." });

            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { error = "Invalid session." });

            if (string.IsNullOrWhiteSpace(req.CheckoutSessionId))
                return BadRequest(new { error = "Missing Stripe checkout session." });

            try
            {
                var verification = await _stripe.RetrieveCheckoutSessionAsync(req.CheckoutSessionId);
                if (!verification.IsPaid)
                    return BadRequest(new { error = "Stripe has not confirmed this checkout as paid yet." });

                if (!verification.Metadata.TryGetValue("user_id", out var metadataUserId) ||
                    metadataUserId != userId.Value.ToString())
                    return BadRequest(new { error = "This Stripe checkout does not belong to your session." });

                if (req.Onboarding.PlanId is null ||
                    !verification.Metadata.TryGetValue("plan_id", out var metadataPlanId) ||
                    metadataPlanId != req.Onboarding.PlanId.Value.ToString())
                    return BadRequest(new { error = "This Stripe checkout does not match the selected plan." });

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
                    paymentMethod: "Stripe");

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
    }
}
