using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;

namespace ProqrLi.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            var guard = RequirePlatformAdmin();
            if (guard != null) return guard;

            var tenants = await BuildTenantsQuery().Take(5).ToListAsync();
            var audit = await BuildAuditAsync(null, 6);
            var activeTenants = await _db.Tenants.CountAsync(t => t.Status == "Active");
            var trialTenants = await _db.TenantSubscriptions.CountAsync(s => s.IsTrialPeriod && s.Status == "Active");
            var platformUsers = await _db.PlatformUsers.CountAsync(u => u.IsActive);
            var tenantUsers = await _db.TenantUsers.CountAsync(u => u.IsActive);
            var mrr = await ActiveSubscriptionsQuery()
                .SumAsync(s => (decimal?)s.SubscriptionPlan!.Price) ?? 0m;

            return Ok(new
            {
                activeTenants,
                trialTenants,
                platformUsers = platformUsers + tenantUsers,
                mrr,
                recentTenants = tenants,
                recentAudit = audit,
                system = await BuildSystemSummaryAsync()
            });
        }

        [HttpGet("tenants")]
        public async Task<IActionResult> Tenants([FromQuery] string? search, [FromQuery] string? status)
        {
            var guard = RequirePlatformAdmin();
            if (guard != null) return guard;

            var query = BuildTenantsQuery();
            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim();
                query = query.Where(t =>
                    t.Name.Contains(s) ||
                    t.Slug.Contains(s) ||
                    t.Industry.Contains(s) ||
                    t.Type.Contains(s));
            }

            if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(t => t.Status == status);
            }

            return Ok(await query.ToListAsync());
        }

        public record UpdateTenantStatusRequest(string Status);

        [HttpPatch("tenants/{id:int}/status")]
        public async Task<IActionResult> UpdateTenantStatus(int id, [FromBody] UpdateTenantStatusRequest req)
        {
            var guard = RequirePlatformAdmin();
            if (guard != null) return guard;

            var normalized = NormalizeStatus(req.Status);
            if (normalized is null)
                return BadRequest(new { error = "Status must be Active, Suspended, or Inactive." });

            var tenant = await _db.Tenants.FindAsync(id);
            if (tenant == null) return NotFound(new { error = "Tenant not found." });

            tenant.Status = normalized;
            await _db.SaveChangesAsync();
            await LogPlatformActionAsync($"tenant.status.{normalized.ToLowerInvariant()}:{tenant.TenantID}");

            return Ok(new { message = "Tenant status updated." });
        }

        [HttpGet("users")]
        public async Task<IActionResult> Users([FromQuery] string? search)
        {
            var guard = RequirePlatformAdmin();
            if (guard != null) return guard;

            var platformUsers = _db.PlatformUsers.Select(u => new AdminUserDto(
                $"platform:{u.PlatformUserID}",
                u.PlatformUserID,
                u.Email == "admin@procurli.io" ? "Super Admin" : u.Email,
                u.Email,
                null,
                "Platform",
                u.Role,
                u.IsActive ? "Active" : "Suspended",
                u.CreatedAt,
                "Platform"
            ));

            var tenantUsers =
                from u in _db.TenantUsers
                join t in _db.Tenants on u.TenantID equals t.TenantID
                join ur in _db.UserRoles on u.UserID equals ur.UserID into urs
                from ur in urs.DefaultIfEmpty()
                join r in _db.Roles on ur.RoleID equals r.RoleID into rs
                from r in rs.DefaultIfEmpty()
                select new AdminUserDto(
                    $"tenant:{u.UserID}",
                    u.UserID,
                    u.FullName ?? u.Email,
                    u.Email,
                    t.TenantID,
                    t.CompanyName,
                    r != null ? r.RoleName : "user",
                    !u.IsActive ? "Suspended" : u.MustChangePassword ? "Invited" : "Active",
                    u.CreatedAt,
                    t.TenantType
                );

            var users = platformUsers.Concat(tenantUsers);
            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim();
                users = users.Where(u =>
                    u.Name.Contains(s) ||
                    u.Email.Contains(s) ||
                    u.TenantName.Contains(s) ||
                    u.Role.Contains(s));
            }

            return Ok(await users.OrderBy(u => u.TenantName).ThenBy(u => u.Name).ToListAsync());
        }

        public record UpdateUserStatusRequest(string Scope, int UserId, bool IsActive);

        [HttpPatch("users/status")]
        public async Task<IActionResult> UpdateUserStatus([FromBody] UpdateUserStatusRequest req)
        {
            var guard = RequirePlatformAdmin();
            if (guard != null) return guard;

            if (req.Scope.Equals("platform", StringComparison.OrdinalIgnoreCase))
            {
                var currentPlatformId = GetCurrentPlatformUserId();
                if (currentPlatformId == req.UserId)
                    return BadRequest(new { error = "You cannot deactivate your own platform account." });

                var user = await _db.PlatformUsers.FindAsync(req.UserId);
                if (user == null) return NotFound(new { error = "Platform user not found." });
                user.IsActive = req.IsActive;
            }
            else if (req.Scope.Equals("tenant", StringComparison.OrdinalIgnoreCase))
            {
                var user = await _db.TenantUsers.FindAsync(req.UserId);
                if (user == null) return NotFound(new { error = "Tenant user not found." });
                user.IsActive = req.IsActive;
            }
            else
            {
                return BadRequest(new { error = "Scope must be platform or tenant." });
            }

            await _db.SaveChangesAsync();
            await LogPlatformActionAsync($"user.status.{(req.IsActive ? "active" : "suspended")}:{req.Scope}:{req.UserId}");

            return Ok(new { message = "User status updated." });
        }

        [HttpGet("vendors")]
        public async Task<IActionResult> Vendors([FromQuery] string? search)
        {
            var guard = RequirePlatformAdmin();
            if (guard != null) return guard;

            var query =
                from v in _db.Tenants
                where v.TenantType == "Vendor"
                select new VendorAdminDto(
                    v.TenantID,
                    v.CompanyName,
                    v.Industry ?? "Uncategorized",
                    v.ContactEmail ?? "",
                    _db.VendorRiskScores
                        .Where(r => r.VendorTenantID == v.TenantID)
                        .OrderByDescending(r => r.ScoredAt)
                        .Select(r => r.RiskClassification ?? "Low")
                        .FirstOrDefault() ?? "Low",
                    _db.AccreditationLinks.Any(a => a.VendorTenantID == v.TenantID && a.Status == "Blocked")
                        ? "Blocked"
                        : _db.AccreditationLinks.Any(a => a.VendorTenantID == v.TenantID && a.Status == "Accredited")
                            ? "Accredited"
                            : _db.AccreditationLinks.Any(a => a.VendorTenantID == v.TenantID)
                                ? "Pending"
                                : "Unlisted",
                    _db.AccreditationLinks.Where(a => a.VendorTenantID == v.TenantID).Select(a => a.BuyerTenantID).Distinct().Count(),
                    v.Status,
                    v.CreatedAt
                );

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim();
                query = query.Where(v => v.Name.Contains(s) || v.Category.Contains(s) || v.Email.Contains(s));
            }

            return Ok(await query.OrderBy(v => v.Name).ToListAsync());
        }

        [HttpGet("audit")]
        public async Task<IActionResult> Audit([FromQuery] string? search)
        {
            var guard = RequirePlatformAdmin();
            if (guard != null) return guard;

            return Ok(await BuildAuditAsync(search, 100));
        }

        [HttpGet("system")]
        public async Task<IActionResult> System()
        {
            var guard = RequirePlatformAdmin();
            if (guard != null) return guard;

            return Ok(await BuildSystemSummaryAsync());
        }

        [HttpGet("modules")]
        public async Task<IActionResult> Modules()
        {
            var guard = RequirePlatformAdmin();
            if (guard != null) return guard;

            var modules = new[]
            {
                new AdminModuleDto("tenants", "Tenant management", "Buyer and vendor tenant records.", "Stable", await _db.Tenants.CountAsync()),
                new AdminModuleDto("sourcing", "RFQ sourcing", "Request for quotation workflow and vendor responses.", "Stable", await _db.RequestForQuotations.CountAsync()),
                new AdminModuleDto("procurement", "Procurement", "Requisitions, purchase orders, invoices, and payments.", "Stable", await _db.PurchaseOrders.CountAsync()),
                new AdminModuleDto("marketplace", "Marketplace", "Vendor storefronts, products, orders, and reviews.", "Stable", await _db.ProductListings.CountAsync()),
                new AdminModuleDto("compliance", "Compliance", "Compliance documents, checklists, and vendor documents.", "Stable", await _db.ComplianceDocuments.CountAsync() + await _db.VendorDocuments.CountAsync()),
                new AdminModuleDto("messaging", "Messaging", "Tenant conversations and RFQ message streams.", "Stable", await _db.Messages.CountAsync() + await _db.RfqMessages.CountAsync()),
                new AdminModuleDto("risk", "Risk scoring", "Vendor risk scores and evaluation data.", "Stable", await _db.VendorRiskScores.CountAsync()),
                new AdminModuleDto("audit", "Audit logging", "Tenant and platform audit events.", "Stable", await _db.AuditLogs.CountAsync() + await _db.PlatformAuditLogs.CountAsync()),
            };

            return Ok(modules);
        }

        [HttpGet("settings")]
        public async Task<IActionResult> Settings()
        {
            var guard = RequirePlatformAdmin();
            if (guard != null) return guard;

            return Ok(new[]
            {
                new AdminSettingSectionDto("Platform", new[]
                {
                    new AdminSettingDto("Platform name", "ProcurLi"),
                    new AdminSettingDto("Primary auth", "Cookie authentication"),
                    new AdminSettingDto("Tenant records", (await _db.Tenants.CountAsync()).ToString("N0")),
                }),
                new AdminSettingSectionDto("Security", new[]
                {
                    new AdminSettingDto("Admin role", "superadmin"),
                    new AdminSettingDto("Session lifetime", "7 days"),
                    new AdminSettingDto("Active platform admins", (await _db.PlatformUsers.CountAsync(u => u.IsActive)).ToString("N0")),
                }),
                new AdminSettingSectionDto("Billing", new[]
                {
                    new AdminSettingDto("Subscription plans", (await _db.SubscriptionPlans.CountAsync()).ToString("N0")),
                    new AdminSettingDto("Active subscriptions", (await _db.TenantSubscriptions.CountAsync(s => s.Status == "Active")).ToString("N0")),
                    new AdminSettingDto("Billing records", (await _db.Billings.CountAsync()).ToString("N0")),
                }),
                new AdminSettingSectionDto("Data", new[]
                {
                    new AdminSettingDto("Audit events", ((await _db.AuditLogs.CountAsync()) + (await _db.PlatformAuditLogs.CountAsync())).ToString("N0")),
                    new AdminSettingDto("Vendor records", (await _db.Tenants.CountAsync(t => t.TenantType == "Vendor")).ToString("N0")),
                    new AdminSettingDto("Buyer records", (await _db.Tenants.CountAsync(t => t.TenantType == "Buyer")).ToString("N0")),
                }),
            });
        }

        private IQueryable<TenantAdminDto> BuildTenantsQuery()
        {
            var activeSubscriptions = ActiveSubscriptionsQuery();

            return
                from t in _db.Tenants
                join s in activeSubscriptions on t.TenantID equals s.TenantID into subs
                from s in subs.DefaultIfEmpty()
                orderby t.CreatedAt descending
                select new TenantAdminDto(
                    t.TenantID,
                    t.TenantType,
                    t.CompanyName,
                    t.CompanyName.ToLower().Replace(" ", "-").Replace(".", ""),
                    t.Industry ?? "Unspecified",
                    s != null && s.SubscriptionPlan != null ? s.SubscriptionPlan.PlanName : "Free",
                    s != null && s.IsTrialPeriod ? "Trial" : t.Status,
                    _db.TenantUsers.Count(u => u.TenantID == t.TenantID && u.IsActive),
                    t.TenantType == "Buyer"
                        ? _db.AccreditationLinks.Where(a => a.BuyerTenantID == t.TenantID).Select(a => a.VendorTenantID).Distinct().Count()
                        : _db.AccreditationLinks.Where(a => a.VendorTenantID == t.TenantID).Select(a => a.BuyerTenantID).Distinct().Count(),
                    s != null && s.SubscriptionPlan != null ? s.SubscriptionPlan.Price : 0m,
                    _db.PurchaseOrders
                        .Where(p => p.TenantID == t.TenantID && p.PODate.Year == DateTime.UtcNow.Year)
                        .Sum(p => (decimal?)p.TotalAmount) ?? 0m,
                    t.ContactEmail ?? "",
                    t.ContactPhone ?? "",
                    t.CreatedAt
                );
        }

        private IQueryable<TenantSubscription> ActiveSubscriptionsQuery()
            => _db.TenantSubscriptions
                .Include(s => s.SubscriptionPlan)
                .Where(s => s.Status == "Active" && s.EndDate >= DateTime.UtcNow);

        private async Task<List<AuditAdminDto>> BuildAuditAsync(string? search, int take)
        {
            var hasSearch = !string.IsNullOrWhiteSpace(search);
            var s = search?.Trim() ?? "";

            var tenantLogs =
                from l in _db.AuditLogs
                join t in _db.Tenants on l.TenantID equals t.TenantID into ts
                from t in ts.DefaultIfEmpty()
                where !hasSearch ||
                    l.UserName.Contains(s) ||
                    l.Action.Contains(s) ||
                    l.Module.Contains(s) ||
                    (t != null && t.CompanyName.Contains(s))
                orderby l.Timestamp descending
                select new
                {
                    l.LogID,
                    l.Timestamp,
                    l.UserName,
                    l.Action,
                    l.Module,
                    TenantId = t != null ? (int?)t.TenantID : null,
                    TenantName = t != null ? t.CompanyName : null,
                    l.IpAddress
                };

            var platformLogs =
                from l in _db.PlatformAuditLogs
                join u in _db.PlatformUsers on l.PlatformUserID equals u.PlatformUserID into us
                from u in us.DefaultIfEmpty()
                where !hasSearch ||
                    l.Action.Contains(s) ||
                    (u != null && u.Email.Contains(s))
                orderby l.CreatedAt descending
                select new
                {
                    l.LogID,
                    l.CreatedAt,
                    Actor = u != null ? u.Email : "platform",
                    l.Action,
                    IpAddress = l.IPAddress ?? ""
                };

            var tenantItems = await tenantLogs
                .Take(take)
                .ToListAsync();
            var platformItems = await platformLogs
                .Take(take)
                .ToListAsync();

            return tenantItems
                .Select(l => new AuditAdminDto(
                    $"tenant:{l.LogID}",
                    l.Timestamp,
                    l.UserName,
                    l.Action,
                    l.Module,
                    l.TenantId,
                    l.TenantName,
                    l.IpAddress,
                    l.Action.Contains("Failed") || l.Action.Contains("Deleted") ? "warn" : "info"))
                .Concat(platformItems.Select(l => new AuditAdminDto(
                    $"platform:{l.LogID}",
                    l.CreatedAt,
                    l.Actor,
                    l.Action,
                    "Platform",
                    null,
                    null,
                    l.IpAddress,
                    l.Action.Contains("suspended") || l.Action.Contains("failed") ? "warn" : "info")))
                .OrderByDescending(l => l.At)
                .Take(take)
                .ToList();
        }

        private async Task<object> BuildSystemSummaryAsync()
        {
            var tenantCount = await _db.Tenants.CountAsync();
            var tenantUserCount = await _db.TenantUsers.CountAsync();
            var platformUserCount = await _db.PlatformUsers.CountAsync();
            var vendorCount = await _db.Tenants.CountAsync(t => t.TenantType == "Vendor");
            var rfqCount = await _db.RequestForQuotations.CountAsync();
            var poCount = await _db.PurchaseOrders.CountAsync();
            var messageCount = await _db.RfqMessages.CountAsync();
            var auditCount = await _db.AuditLogs.CountAsync() + await _db.PlatformAuditLogs.CountAsync();

            return new
            {
                metrics = new[]
                {
                    new { name = "Tenants", value = tenantCount.ToString("N0"), delta = $"{vendorCount:N0} vendors", ok = true },
                    new { name = "Users", value = (tenantUserCount + platformUserCount).ToString("N0"), delta = $"{platformUserCount:N0} platform admins", ok = true },
                    new { name = "RFQs", value = rfqCount.ToString("N0"), delta = $"{messageCount:N0} RFQ messages", ok = true },
                    new { name = "Purchase orders", value = poCount.ToString("N0"), delta = $"{auditCount:N0} audit events", ok = true },
                },
                services = new[]
                {
                    new { service = "Database", region = "Default connection", uptime = "Online", status = "Operational" },
                    new { service = "Authentication", region = "Cookie auth", uptime = "Online", status = "Operational" },
                    new { service = "RFQ message stream", region = "In-memory channels", uptime = $"{messageCount:N0} messages", status = "Operational" },
                    new { service = "Audit logging", region = "Tenant + platform", uptime = $"{auditCount:N0} events", status = "Operational" },
                }
            };
        }

        private IActionResult? RequirePlatformAdmin()
        {
            var accountType = User.FindFirstValue("account_type");
            var role = User.FindFirstValue("role_name");

            if (accountType == "platform" && (role == "superadmin" || role == "super_admin"))
                return null;

            return Forbid();
        }

        private int GetCurrentPlatformUserId()
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(id, out var platformUserId) ? platformUserId : 0;
        }

        private async Task LogPlatformActionAsync(string action)
        {
            var platformUserId = GetCurrentPlatformUserId();
            if (platformUserId == 0) return;

            _db.PlatformAuditLogs.Add(new PlatformAuditLog
            {
                PlatformUserID = platformUserId,
                Action = action,
                IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0",
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }

        private static string? NormalizeStatus(string status)
        {
            var s = status.Trim();
            if (s.Equals("Active", StringComparison.OrdinalIgnoreCase)) return "Active";
            if (s.Equals("Suspended", StringComparison.OrdinalIgnoreCase)) return "Suspended";
            if (s.Equals("Inactive", StringComparison.OrdinalIgnoreCase)) return "Inactive";
            return null;
        }

        public record TenantAdminDto(
            int Id,
            string Type,
            string Name,
            string Slug,
            string Industry,
            string Plan,
            string Status,
            int Users,
            int Vendors,
            decimal Mrr,
            decimal SpendYtd,
            string Email,
            string Phone,
            DateTime CreatedAt);

        public record AdminUserDto(
            string Id,
            int UserId,
            string Name,
            string Email,
            int? TenantId,
            string TenantName,
            string Role,
            string Status,
            DateTime CreatedAt,
            string Scope);

        public record VendorAdminDto(
            int Id,
            string Name,
            string Category,
            string Email,
            string RiskClass,
            string Accreditation,
            int TenantsServed,
            string Status,
            DateTime JoinedAt);

        public record AuditAdminDto(
            string Id,
            DateTime At,
            string Actor,
            string Action,
            string Target,
            int? TenantId,
            string? TenantName,
            string IpAddress,
            string Severity);

        public record AdminModuleDto(
            string Key,
            string Name,
            string Description,
            string Status,
            int Records);

        public record AdminSettingSectionDto(
            string Title,
            AdminSettingDto[] Fields);

        public record AdminSettingDto(
            string Label,
            string Value);
    }
}
