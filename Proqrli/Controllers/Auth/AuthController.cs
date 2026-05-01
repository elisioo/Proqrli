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
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _auth;

        public AuthController(AuthService auth) => _auth = auth;

        // ─── POST /api/auth/register ──────────────────────────────────────
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.CompanyName) ||
                string.IsNullOrWhiteSpace(req.FullName) ||
                string.IsNullOrWhiteSpace(req.Email) ||
                string.IsNullOrWhiteSpace(req.Password))
            {
                return BadRequest(new { error = "All fields are required." });
            }

            if (req.Password.Length < 8)
                return BadRequest(new { error = "Password must be at least 8 characters." });

            try
            {
                var resp = await _auth.RegisterBuyerAsync(req);
                await SignInAsync(resp);
                // 201 Created — frontend can read the body for user info
                return StatusCode(201, resp);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ─── POST /api/auth/login ─────────────────────────────────────────
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
                // Return 401 — frontend shows the error message from the body
                return Unauthorized(new { error = ex.Message });
            }
        }

        // ─── POST /api/auth/logout ────────────────────────────────────────
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Signed out." });
        }

        // ─── GET /api/auth/me ─────────────────────────────────────────────
        /// <summary>
        /// Returns the current session user. Called by the frontend on mount
        /// to rehydrate auth state from the HttpOnly cookie.
        /// </summary>
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

        // ─── Private helper ───────────────────────────────────────────────
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
