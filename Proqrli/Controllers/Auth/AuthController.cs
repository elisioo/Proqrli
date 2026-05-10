using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using ProqrLi.Data;
using ProqrLi.Models;
using ProqrLi.Services;

namespace ProqrLi.Controllers.Auth
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _auth;
        private readonly OtpService  _otp;
        private readonly ApplicationDbContext _db;

        public AuthController(AuthService auth, OtpService otp, ApplicationDbContext db)
        {
            _auth = auth;
            _otp  = otp;
            _db   = db;
        }

    
        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email))
                return BadRequest(new { error = "Email is required." });

            // Basic email format check
            if (!req.Email.Contains('@') || !req.Email.Contains('.'))
                return BadRequest(new { error = "Enter a valid email address." });

            // Allow OTP for new registrations OR invited users who need to change password
            var user = await _auth.GetUserByEmailAsync(req.Email);
            bool isInvitedUser = user?.MustChangePassword == true;

            bool taken = await _auth.IsEmailTakenByActiveUserAsync(req.Email);
            if (taken && !isInvitedUser)
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

       
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest(new { error = "Email and password are required." });

            try
            {
                var (resp, mustChange) = await _auth.LoginAsync(req);
                if (mustChange)
                {
                    // Auto-send OTP for invited user
                    var code = await _otp.GenerateAndSendOtpAsync(req.Email);
                    var isDev = HttpContext.RequestServices
                        .GetRequiredService<IWebHostEnvironment>()
                        .IsDevelopment();

                    return Ok(new
                    {
                        requiresOtp = true,
                        email = req.Email,
                        message = "Please verify your email with the OTP sent to your inbox.",
                        devCode = isDev ? code : (string?)null
                    });
                }

                await SignInAsync(resp);

                // Explicit audit log for login (filter won't catch it because user wasn't auth'd yet)
                await LogAuditAsync(resp.UserId, resp.FullName, resp.Role, "Logged in", "Auth");

                return Ok(resp);
            }
            catch (UnauthorizedAccessException ex)
            {
                // Log failed login attempt (TenantUser fields, not AuthResponse)
                var failUser = await _auth.GetUserByEmailAsync(req.Email);
                if (failUser != null)
                {
                    var failRole = await _auth.GetUserRoleAsync(failUser.UserID) ?? "unknown";
                    await LogAuditWithTenantAsync(
                        failUser.TenantID, failUser.UserID,
                        failUser.FullName ?? failUser.Email, failRole,
                        $"Failed login attempt", "Auth");
                }

                return Unauthorized(new { error = ex.Message });
            }
        }

     
        public record ChangePasswordRequest(string Email, string Otp, string NewPassword);

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email) ||
                string.IsNullOrWhiteSpace(req.Otp) ||
                string.IsNullOrWhiteSpace(req.NewPassword))
                return BadRequest(new { error = "Email, OTP, and new password are required." });

            if (!IsPasswordValid(req.NewPassword, out var pwErr))
                return BadRequest(new { error = pwErr });

            // Verify OTP first
            bool valid = await _otp.VerifyAsync(req.Email, req.Otp);
            if (!valid)
                return BadRequest(new { error = "Invalid or expired code. Please try again." });

            try
            {
                var resp = await _auth.ChangePasswordAsync(req.Email, req.NewPassword);
                await SignInAsync(resp);

                // Log password change (invited user first login)
                await LogAuditAsync(resp.UserId, resp.FullName, resp.Role, "Changed password (first login)", "Auth");

                return Ok(resp);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "Unknown";
            var role = User.FindFirstValue("role_name") ?? "User";
            var tenantIdStr = User.FindFirstValue("tenant_id");

            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            if (int.TryParse(userIdStr, out var userId) && int.TryParse(tenantIdStr, out var tenantId))
            {
                _db.AuditLogs.Add(new AuditLog
                {
                    TenantID = tenantId,
                    UserID = userId,
                    UserName = userName,
                    Role = role,
                    Action = "Logged out",
                    Module = "Auth",
                    IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0",
                    Timestamp = DateTime.UtcNow
                });
                await _db.SaveChangesAsync();
            }

            return Ok(new { message = "Signed out." });
        }

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

        private async Task LogAuditAsync(int userId, string userName, string role, string action, string module, string? entityId = null)
        {
            var tenantIdStr = User.FindFirstValue("tenant_id");
            if (!int.TryParse(tenantIdStr, out var tenantId)) return;
            await LogAuditWithTenantAsync(tenantId, userId, userName, role, action, module, entityId);
        }

        private async Task LogAuditWithTenantAsync(int tenantId, int userId, string userName, string role, string action, string module, string? entityId = null)
        {
            _db.AuditLogs.Add(new AuditLog
            {
                TenantID = tenantId,
                UserID = userId,
                UserName = userName,
                Role = role,
                Action = action,
                Module = module,
                EntityId = entityId,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0",
                Timestamp = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
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
        [HttpPatch("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
        {
            if (User.Identity?.IsAuthenticated != true)
                return Unauthorized(new { error = "Not authenticated." });

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Unauthorized(new { error = "Invalid session." });

            var user = await _db.TenantUsers.FindAsync(userId);
            if (user == null) return NotFound(new { error = "User not found." });

            if (!string.IsNullOrWhiteSpace(req.FullName))   user.FullName      = req.FullName.Trim();
            if (!string.IsNullOrWhiteSpace(req.Position))   user.Position      = req.Position.Trim();
            if (req.ContactNumber != null)                   user.ContactNumber = req.ContactNumber.Trim();

            await _db.SaveChangesAsync();

            // Return the updated user data. No cookie re-issuance needed here—
            // re-signing would overwrite any other user's session in the same browser.
            // The frontend calls /api/auth/me on mount to get fresh data.
            var resp = await _auth.GetByIdAsync(userId);

            await LogAuditAsync(userId, user.FullName ?? user.Email, User.FindFirstValue("role_name") ?? "", "Updated profile", "Auth");

            return Ok(resp);
        }

        [HttpPost("update-password")]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequest req)
        {
            if (User.Identity?.IsAuthenticated != true)
                return Unauthorized(new { error = "Not authenticated." });

            if (string.IsNullOrWhiteSpace(req.OldPassword) || string.IsNullOrWhiteSpace(req.NewPassword))
                return BadRequest(new { error = "Both current and new passwords are required." });

            if (!IsPasswordValid(req.NewPassword, out var pwError))
                return BadRequest(new { error = pwError });

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Unauthorized(new { error = "Invalid session." });

            try
            {
                await _auth.UpdatePasswordAsync(userId, req.OldPassword, req.NewPassword);
                
                var userName = User.FindFirstValue(ClaimTypes.Name) ?? "User";
                var role = User.FindFirstValue("role_name") ?? "";
                await LogAuditAsync(userId, userName, role, "Changed password", "Auth");

                return Ok(new { message = "Password updated successfully." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
