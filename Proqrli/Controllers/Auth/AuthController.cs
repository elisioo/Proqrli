using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using ProqrLi.Models;
using ProqrLi.Services;

namespace ProqrLi.Controllers.Auth
{
    /// <summary>
    /// Cookie-based auth endpoints for the buyer/vendor SPA.
    /// Base route: /api/auth
    ///
    /// Registration flow:
    ///   1. POST /api/auth/send-otp    — send 6-digit code to email
    ///   2. POST /api/auth/verify-otp  — validate OTP, returns a short-lived verified token
    ///   3. POST /api/auth/register    — create account (email + password only, no company yet)
    ///   4. POST /api/auth/onboarding  — save business profile (company name, size, full name, etc.)
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _auth;
        private readonly OtpService  _otp;

        public AuthController(AuthService auth, OtpService otp)
        {
            _auth = auth;
            _otp  = otp;
        }

        // ─── Step 1: Send OTP ──────────────────────────────────────────────────
        // POST /api/auth/send-otp
        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email))
                return BadRequest(new { error = "Email is required." });

            // Basic email format check
            if (!req.Email.Contains('@') || !req.Email.Contains('.'))
                return BadRequest(new { error = "Enter a valid email address." });

            // Check if email is already registered
            bool taken = await _auth.IsEmailTakenAsync(req.Email);
            if (taken)
                return BadRequest(new { error = "An account with this email already exists. Please sign in." });

            try
            {
                var code = await _otp.GenerateAndSendOtpAsync(req.Email);

                // Return the code in dev mode only so the frontend can pre-fill it
                var isDev = HttpContext.RequestServices
                    .GetRequiredService<IWebHostEnvironment>()
                    .IsDevelopment();

                return Ok(new
                {
                    message = $"A verification code has been sent to {req.Email}.",
                    devCode = isDev ? code : (string?)null      // null in production
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ─── Step 2: Verify OTP ────────────────────────────────────────────────
        // POST /api/auth/verify-otp
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Code))
                return BadRequest(new { error = "Email and code are required." });

            bool valid = await _otp.VerifyAsync(req.Email, req.Code);
            if (!valid)
                return BadRequest(new { error = "Invalid or expired code. Please try again." });

            return Ok(new { verified = true });
        }

        // ─── Step 3: Register (email + password only) ─────────────────────────
        // POST /api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email) ||
                string.IsNullOrWhiteSpace(req.Password))
                return BadRequest(new { error = "Email and password are required." });

            // Password policy: 12+ chars, uppercase, digit, special char
            if (!IsPasswordValid(req.Password, out var pwErr))
                return BadRequest(new { error = pwErr });

            try
            {
                var resp = await _auth.RegisterAsync(req);
                await SignInAsync(resp);
                return StatusCode(201, resp);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ─── Step 4: Save onboarding profile ──────────────────────────────────
        // POST /api/auth/onboarding
        [HttpPost("onboarding")]
        public async Task<IActionResult> Onboarding([FromBody] OnboardingRequest req)
        {
            if (User.Identity?.IsAuthenticated != true)
                return Unauthorized(new { error = "Not authenticated." });

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Unauthorized(new { error = "Invalid session." });

            try
            {
                var resp = await _auth.SaveOnboardingAsync(userId, req);
                return Ok(resp);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ─── Login ────────────────────────────────────────────────────────────
        // POST /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest(new { error = "Email and password are required." });

            try
            {
                var resp = await _auth.LoginAsync(req);
                await SignInAsync(resp);
                return Ok(resp);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }

        // ─── Logout ───────────────────────────────────────────────────────────
        // POST /api/auth/logout
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Signed out." });
        }

        // ─── Me ───────────────────────────────────────────────────────────────
        //  GET /api/auth/me
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            if (User.Identity?.IsAuthenticated != true)
                return Unauthorized(new { error = "Not authenticated." });

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Unauthorized(new { error = "Invalid session." });

            var resp = await _auth.GetByIdAsync(userId);
            return resp is null
                ? Unauthorized(new { error = "User not found." })
                : Ok(resp);
        }

        // ─── Helpers ──────────────────────────────────────────────────────────
        private static bool IsPasswordValid(string pw, out string error)
        {
            error = string.Empty;
            if (pw.Length < 12)               { error = "Password must be at least 12 characters."; return false; }
            if (!pw.Any(char.IsUpper))         { error = "Password must contain at least one uppercase letter."; return false; }
            if (!pw.Any(char.IsDigit))         { error = "Password must contain at least one number."; return false; }
            if (!pw.Any(c => !char.IsLetterOrDigit(c))) { error = "Password must contain at least one special character."; return false; }
            return true;
        }

        private async Task SignInAsync(AuthResponse resp)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, resp.UserId.ToString()),
                new(ClaimTypes.Email,          resp.Email),
                new(ClaimTypes.Name,           resp.FullName),
                new("tenant_id",               resp.TenantId.ToString()),
                new("tenant_name",             resp.CompanyName),
                new("tenant_type",             resp.TenantType),
                new("role_name",               resp.Role),
            };

            var identity  = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc   = DateTimeOffset.UtcNow.AddDays(7),
                    AllowRefresh = true,
                }
            );
        }
    }
}
