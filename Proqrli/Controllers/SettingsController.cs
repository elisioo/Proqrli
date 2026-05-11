using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;
using ProqrLi.Services;
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
        private readonly CloudinaryService _cloudinary;

        public SettingsController(ApplicationDbContext db, ILogger<SettingsController> logger, CloudinaryService cloudinary)
        {
            _db = db;
            _logger = logger;
            _cloudinary = cloudinary;
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

        // ═══════════════════════════════════════════════════════════════════════════
        // Vendor Store Profile
        // ═══════════════════════════════════════════════════════════════════════════

        [HttpGet("vendor-store")]
        public async Task<IActionResult> GetVendorStoreProfile()
        {
            try
            {
                var tenantId = GetCurrentTenantId();
                var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.TenantID == tenantId);
                if (tenant == null) return NotFound(new { error = "Tenant not found" });

                var profile = await _db.VendorStoreProfiles
                    .FirstOrDefaultAsync(v => v.VendorTenantID == tenantId);

                if (profile == null)
                {
                    // Return a default-shaped response so the UI can still render
                    return Ok(new
                    {
                        storeName = tenant.CompanyName,
                        storeSlug = (string?)null,
                        storeDescription = (string?)null,
                        logoPath = (string?)null,
                        bannerPath = (string?)null,
                        businessAddress = (string?)null,
                        overallRating = 0m,
                        isVerified = false,
                        isActive = true,
                    });
                }

                return Ok(new
                {
                    storeName = profile.StoreName,
                    storeSlug = profile.StoreSlug,
                    storeDescription = profile.StoreDescription,
                    logoPath = profile.LogoPath,
                    bannerPath = profile.BannerPath,
                    businessAddress = profile.BusinessAddress,
                    overallRating = profile.OverallRating,
                    isVerified = profile.IsVerified,
                    isActive = profile.IsActive,
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        public record UpdateVendorStoreRequest(
            string? StoreName,
            string? StoreSlug,
            string? StoreDescription,
            string? BusinessAddress
        );

        [HttpPatch("vendor-store")]
        public async Task<IActionResult> UpdateVendorStoreProfile([FromBody] UpdateVendorStoreRequest req)
        {
            try
            {
                var tenantId = GetCurrentTenantId();
                var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.TenantID == tenantId);
                if (tenant == null) return NotFound(new { error = "Tenant not found" });

                var profile = await _db.VendorStoreProfiles
                    .FirstOrDefaultAsync(v => v.VendorTenantID == tenantId);

                if (profile == null)
                {
                    profile = new VendorStoreProfile
                    {
                        VendorTenantID = tenantId,
                        StoreName = req.StoreName ?? tenant.CompanyName ?? "",
                        StoreSlug = req.StoreSlug,
                        StoreDescription = req.StoreDescription,
                        BusinessAddress = req.BusinessAddress,
                    };
                    _db.VendorStoreProfiles.Add(profile);
                }
                else
                {
                    if (req.StoreName != null) profile.StoreName = req.StoreName;
                    if (req.StoreSlug != null) profile.StoreSlug = req.StoreSlug;
                    if (req.StoreDescription != null) profile.StoreDescription = req.StoreDescription;
                    if (req.BusinessAddress != null) profile.BusinessAddress = req.BusinessAddress;
                }

                await _db.SaveChangesAsync();
                return Ok(new { message = "Vendor store profile updated", profileId = profile.StoreProfileID });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        public record UpdateLogoRequest(string LogoUrl);

        [HttpPost("vendor-logo")]
        public async Task<IActionResult> UpdateVendorLogo([FromBody] UpdateLogoRequest req)
        {
            try
            {
                var tenantId = GetCurrentTenantId();
                var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.TenantID == tenantId);
                if (tenant == null) return NotFound(new { error = "Tenant not found" });

                var profile = await _db.VendorStoreProfiles
                    .FirstOrDefaultAsync(v => v.VendorTenantID == tenantId);

                string? oldLogoPath = profile?.LogoPath;

                if (profile == null)
                {
                    profile = new VendorStoreProfile
                    {
                        VendorTenantID = tenantId,
                        StoreName = tenant.CompanyName ?? "",
                        LogoPath = req.LogoUrl,
                    };
                    _db.VendorStoreProfiles.Add(profile);
                }
                else
                {
                    profile.LogoPath = req.LogoUrl;
                }

                await _db.SaveChangesAsync();

                // Clean up old logo from Cloudinary if it exists
                if (!string.IsNullOrWhiteSpace(oldLogoPath) && oldLogoPath != req.LogoUrl)
                {
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            await _cloudinary.DeleteImageByUrlAsync(oldLogoPath);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to delete old Cloudinary logo: {Url}", oldLogoPath);
                        }
                    });
                }

                return Ok(new { message = "Logo updated successfully", logoPath = profile.LogoPath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        public record UpdateBannerRequest(string BannerUrl);

        [HttpPost("vendor-banner")]
        public async Task<IActionResult> UpdateVendorBanner([FromBody] UpdateBannerRequest req)
        {
            try
            {
                var tenantId = GetCurrentTenantId();
                var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.TenantID == tenantId);
                if (tenant == null) return NotFound(new { error = "Tenant not found" });

                var profile = await _db.VendorStoreProfiles
                    .FirstOrDefaultAsync(v => v.VendorTenantID == tenantId);

                string? oldBannerPath = profile?.BannerPath;

                if (profile == null)
                {
                    profile = new VendorStoreProfile
                    {
                        VendorTenantID = tenantId,
                        StoreName = tenant.CompanyName ?? "",
                        BannerPath = req.BannerUrl,
                    };
                    _db.VendorStoreProfiles.Add(profile);
                }
                else
                {
                    profile.BannerPath = req.BannerUrl;
                }

                await _db.SaveChangesAsync();

                // Clean up old banner from Cloudinary if it exists
                if (!string.IsNullOrWhiteSpace(oldBannerPath) && oldBannerPath != req.BannerUrl)
                {
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            await _cloudinary.DeleteImageByUrlAsync(oldBannerPath);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to delete old Cloudinary banner: {Url}", oldBannerPath);
                        }
                    });
                }

                return Ok(new { message = "Banner updated successfully", bannerPath = profile.BannerPath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
