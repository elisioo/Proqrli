using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;
using System.Security.Claims;

namespace ProqrLi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<SettingsController> _logger;

        public SettingsController(ApplicationDbContext db, ILogger<SettingsController> logger)
        {
            _db = db;
            _logger = logger;
        }

        private int GetCurrentTenantId()
        {
            var idStr = User.FindFirstValue("tenant_id");
            if (!int.TryParse(idStr, out var tenantId))
                throw new UnauthorizedAccessException("Invalid tenant.");
            return tenantId;
        }

        private int GetCurrentUserId()
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idStr, out var userId))
                throw new UnauthorizedAccessException("Invalid session.");
            return userId;
        }

        [HttpGet("tenant")]
        public async Task<IActionResult> GetTenantSettings()
        {
            try
            {
                var tenantId = GetCurrentTenantId();
                var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.TenantID == tenantId);
                
                if (tenant == null) return NotFound(new { error = "Tenant not found" });

                return Ok(new
                {
                    companyName = tenant.CompanyName,
                    industry = tenant.Industry,
                    contactEmail = tenant.ContactEmail,
                    taxId = tenant.TaxId,
                    annualBudget = tenant.AnnualBudget,
                    poApprovalThreshold = tenant.PoApprovalThreshold,
                    billAutoPayLimit = tenant.BillAutoPayLimit,
                    requiredApprovers = tenant.RequiredApprovers
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        public record UpdateSettingsRequest(
            string? CompanyName,
            string? Industry,
            string? ContactEmail,
            string? TaxId,
            decimal? AnnualBudget,
            decimal? PoApprovalThreshold,
            decimal? BillAutoPayLimit,
            int? RequiredApprovers
        );

        [HttpPatch("tenant")]
        public async Task<IActionResult> UpdateTenantSettings([FromBody] UpdateSettingsRequest req)
        {
            try
            {
                var tenantId = GetCurrentTenantId();
                var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.TenantID == tenantId);
                
                if (tenant == null) return NotFound(new { error = "Tenant not found" });

                if (req.CompanyName != null) tenant.CompanyName = req.CompanyName;
                if (req.Industry != null) tenant.Industry = req.Industry;
                if (req.ContactEmail != null) tenant.ContactEmail = req.ContactEmail;
                if (req.TaxId != null) tenant.TaxId = req.TaxId;
                if (req.AnnualBudget != null) tenant.AnnualBudget = req.AnnualBudget.Value;
                if (req.PoApprovalThreshold != null) tenant.PoApprovalThreshold = req.PoApprovalThreshold.Value;
                if (req.BillAutoPayLimit != null) tenant.BillAutoPayLimit = req.BillAutoPayLimit.Value;
                if (req.RequiredApprovers != null) tenant.RequiredApprovers = req.RequiredApprovers.Value;

                await _db.SaveChangesAsync();

                return Ok(new { message = "Settings updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var tenantId = GetCurrentTenantId();
                var query = _db.AuditLogs
                    .Where(l => l.TenantID == tenantId)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(search))
                {
                    var s = search.Trim();
                    query = query.Where(l =>
                        l.UserName.Contains(s) ||
                        l.Action.Contains(s) ||
                        l.Module.Contains(s) ||
                        (l.Role != null && l.Role.Contains(s))
                    );
                }

                var total = await query.CountAsync();
                var logs = await query
                    .OrderByDescending(l => l.Timestamp)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(l => new
                    {
                        logID     = l.LogID,
                        tenantID  = l.TenantID,
                        userID    = l.UserID,
                        userName  = l.UserName,
                        role      = l.Role,
                        action    = l.Action,
                        module    = l.Module,
                        entityId  = l.EntityId,
                        ipAddress = l.IpAddress,
                        // Send as ISO-8601 string with Z suffix so the browser
                        // always knows it's UTC and local-time conversion is exact.
                        timestamp = l.Timestamp.ToString("yyyy-MM-ddTHH:mm:ssZ")
                    })
                    .ToListAsync();

                return Ok(new { data = logs, total, page, pageSize });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
