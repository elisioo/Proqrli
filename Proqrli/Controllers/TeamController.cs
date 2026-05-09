using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProqrLi.Services;

namespace ProqrLi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TeamController : ControllerBase
    {
        private readonly AuthService _auth;
        private readonly OtpService _otp;
        private readonly IConfiguration _config;
        private readonly ILogger<TeamController> _logger;
        private readonly IWebHostEnvironment _env;

        public TeamController(AuthService auth, OtpService otp, IConfiguration config, ILogger<TeamController> logger, IWebHostEnvironment env)
        {
            _auth = auth;
            _otp = otp;
            _config = config;
            _logger = logger;
            _env = env;
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        private int GetCurrentUserId()
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idStr, out var userId))
                throw new UnauthorizedAccessException("Invalid session.");
            return userId;
        }

        private int GetCurrentTenantId()
        {
            var idStr = User.FindFirstValue("tenant_id");
            if (!int.TryParse(idStr, out var tenantId))
                throw new UnauthorizedAccessException("Invalid tenant.");
            return tenantId;
        }

        private bool IsOwner()
        {
            var role = User.FindFirstValue("role_name") ?? "";
            return role.EndsWith("_owner");
        }

        // ── GET /api/team ──────────────────────────────────────────────────────

        [HttpGet]
        public async Task<IActionResult> GetTeam()
        {
            if (!IsOwner())
                return StatusCode(403, new { error = "Only workspace owners can manage the team." });

            try
            {
                var tenantId = GetCurrentTenantId();
                var members = await _auth.GetTeamMembersAsync(tenantId);
                return Ok(members);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get team members");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ── POST /api/team/invite ─────────────────────────────────────────────

        public record InviteRequest(string Email, string Role, string? FullName, string? Position);

        [HttpPost("invite")]
        public async Task<IActionResult> Invite([FromBody] InviteRequest req)
        {
            if (!IsOwner())
                return StatusCode(403, new { error = "Only workspace owners can invite team members." });

            if (string.IsNullOrWhiteSpace(req.Email) || !req.Email.Contains('@'))
                return BadRequest(new { error = "A valid email is required." });

            if (string.IsNullOrWhiteSpace(req.Role))
                return BadRequest(new { error = "A role is required." });

            try
            {
                var tenantId = GetCurrentTenantId();
                var invitedBy = GetCurrentUserId();

                var (user, tempPassword) = await _auth.InviteUserAsync(
                    tenantId, invitedBy, req.Email, req.Role.Trim(), req.FullName, req.Position);

                // Send invitation email
                await SendInvitationEmailAsync(req.Email, tempPassword);

                return Ok(new
                {
                    message = $"Invitation sent to {req.Email}.",
                    userId = user.UserID,
                    devPassword = _env.IsDevelopment() ? tempPassword : null
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to invite user");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ── PUT /api/team/{id}/role ────────────────────────────────────────────

        public record UpdateRoleRequest(string Role);

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleRequest req)
        {
            if (!IsOwner())
                return StatusCode(403, new { error = "Only workspace owners can change roles." });

            if (id == GetCurrentUserId())
                return BadRequest(new { error = "You cannot change your own role." });

            try
            {
                var tenantId = GetCurrentTenantId();
                await _auth.UpdateUserRoleAsync(tenantId, id, req.Role.Trim());
                return Ok(new { message = "Role updated." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update role for user {UserId}", id);
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ── DELETE /api/team/{id} ──────────────────────────────────────────────

        [HttpDelete("{id}")]
        public async Task<IActionResult> Deactivate(int id)
        {
            if (!IsOwner())
                return StatusCode(403, new { error = "Only workspace owners can remove team members." });

            if (id == GetCurrentUserId())
                return BadRequest(new { error = "You cannot deactivate yourself." });

            try
            {
                var tenantId = GetCurrentTenantId();
                await _auth.DeactivateUserAsync(tenantId, id);
                return Ok(new { message = "Team member deactivated." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to deactivate user {UserId}", id);
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ── Email helper ───────────────────────────────────────────────────────

        private async Task SendInvitationEmailAsync(string email, string tempPassword)
        {
            try
            {
                var apiKey = _config["SendGrid:ApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    _logger.LogWarning("SendGrid API key is missing. Invitation email not sent.");
                    return;
                }

                var senderEmail = _config["SendGrid:SenderEmail"] ?? "noreply@proqrli.com";
                var senderName = _config["SendGrid:SenderName"] ?? "ProqrLi Team";
                var appUrl = _config["AppUrl"] ?? "https://proqrli.com";

                var client = new SendGrid.SendGridClient(apiKey);
                var from = new SendGrid.Helpers.Mail.EmailAddress(senderEmail, senderName);
                var to = new SendGrid.Helpers.Mail.EmailAddress(email);

                var subject = "You're invited to join a ProqrLi workspace";
                var plainText = $@"You've been invited to join a workspace on ProqrLi.

Your temporary login credentials:
Email: {email}
Temporary password: {tempPassword}

Please sign in at {appUrl}/login and you'll be asked to verify your email and set a permanent password.

This invitation expires in 7 days.";

                var html = $@"
<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:10px;'>
    <h2 style='color:#000;text-align:center;'>Workspace Invitation</h2>
    <p style='color:#555;font-size:16px;text-align:center;'>You've been invited to join a team on ProqrLi.</p>
    <div style='background:#f4f4f5;border-radius:8px;padding:20px;margin:20px 0;'>
        <p style='margin:4px 0;font-size:14px;'><strong>Email:</strong> {email}</p>
        <p style='margin:4px 0;font-size:14px;'><strong>Temporary password:</strong> <code style='background:#fff;padding:2px 6px;border-radius:4px;font-size:16px;'>{tempPassword}</code></p>
    </div>
    <p style='text-align:center;'>
        <a href='{appUrl}/login' style='display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;'>Sign in to ProqrLi</a>
    </p>
    <p style='color:#888;font-size:12px;text-align:center;'>You'll be asked to verify your email and set a permanent password on first login.</p>
</div>";

                var msg = SendGrid.Helpers.Mail.MailHelper.CreateSingleEmail(from, to, subject, plainText, html);
                var response = await client.SendEmailAsync(msg);

                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Body.ReadAsStringAsync();
                    _logger.LogError("Failed to send invitation email. Status: {Status}. Error: {Error}", response.StatusCode, errorBody);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception sending invitation email to {Email}", email);
            }
        }
    }
}
