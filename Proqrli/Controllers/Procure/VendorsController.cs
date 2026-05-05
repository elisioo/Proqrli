using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;

namespace ProqrLi.Controllers.Procure
{
    public class VendorDto
    {
        public string Id           { get; set; } = "";
        public string CompanyName  { get; set; } = "";
        public string Category     { get; set; } = "";
        public string Status       { get; set; } = "Pending";
        public string RiskClass    { get; set; } = "Low";
        public decimal RiskScore   { get; set; }
        public decimal Rating      { get; set; }
        public decimal TotalSpend  { get; set; }
        public int Orders          { get; set; }
        public decimal OnTimeRate  { get; set; }
        public string Initials     { get; set; } = "??";
        public bool Archived       { get; set; }
    }

    public class CreateVendorDto
    {
        public string CompanyName { get; set; } = "";
        public string? Category  { get; set; }
        public string? Status    { get; set; }
    }

    public class UpdateVendorDto
    {
        public string? CompanyName { get; set; }
        public string? Category   { get; set; }
        public string? Status     { get; set; }
        public string? RiskClass  { get; set; }
        public decimal? RiskScore { get; set; }
        public decimal? Rating    { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class VendorsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public VendorsController(ApplicationDbContext db) => _db = db;

        private string GetInitials(string name)
        {
            var parts = (name ?? "").Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 0) return "??";
            return string.Join("", parts.Take(2).Select(w => w[0].ToString().ToUpper()));
        }

        // GET /api/vendors
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Get the current buyer tenant (simplified: first buyer tenant)
            var buyerTenantId = await _db.Tenants
                .Where(t => t.TenantType == "Buyer")
                .Select(t => t.TenantID)
                .FirstOrDefaultAsync();

            // Get all accreditation links for this buyer
            var links = await _db.AccreditationLinks
                .Include(a => a.VendorTenant)
                .Where(a => a.BuyerTenantID == buyerTenantId)
                .ToListAsync();

            // Get vendor risk scores
            var vendorIds = links.Select(l => l.VendorTenantID).Distinct().ToList();
            var riskScores = await _db.VendorRiskScores
                .Where(r => vendorIds.Contains(r.VendorTenantID) && r.BuyerTenantID == buyerTenantId)
                .GroupBy(r => r.VendorTenantID)
                .Select(g => new { VendorTenantID = g.Key, Score = g.OrderByDescending(r => r.ScoredAt).First() })
                .ToDictionaryAsync(g => g.VendorTenantID, g => g.Score);

            // Count POs per vendor
            var poCounts = await _db.PurchaseOrders
                .Where(po => vendorIds.Contains(po.VendorTenantID) && po.TenantID == buyerTenantId)
                .GroupBy(po => po.VendorTenantID)
                .Select(g => new { VendorTenantID = g.Key, Count = g.Count(), Total = g.Sum(po => po.TotalAmount) })
                .ToDictionaryAsync(g => g.VendorTenantID, g => new { g.Count, g.Total });

            var dtos = links.Select(l =>
            {
                var risk = riskScores.GetValueOrDefault(l.VendorTenantID);
                var poData = poCounts.GetValueOrDefault(l.VendorTenantID);
                return new VendorDto
                {
                    Id          = l.LinkID.ToString(),
                    CompanyName = l.VendorTenant?.CompanyName ?? "",
                    Category    = l.VendorTenant?.Industry ?? "",
                    Status      = l.Status,
                    RiskClass   = risk?.RiskClassification ?? "Low",
                    RiskScore   = risk?.MLRiskScore ?? 0,
                    Rating      = 0, // Would come from evaluations
                    TotalSpend  = poData?.Total ?? 0,
                    Orders      = poData?.Count ?? 0,
                    OnTimeRate  = risk?.OnTimeDeliveryRate ?? 0,
                    Initials    = GetInitials(l.VendorTenant?.CompanyName ?? ""),
                    Archived    = l.Status == "Blocked",
                };
            }).ToList();

            // Also include vendor tenants not yet linked (discoverable)
            var linkedVendorIds = links.Select(l => l.VendorTenantID).ToHashSet();
            var unlinkedVendors = await _db.Tenants
                .Where(t => t.TenantType == "Vendor" && !linkedVendorIds.Contains(t.TenantID))
                .ToListAsync();

            // We only return linked vendors for the buyer's accredited list
            return Ok(dtos);
        }

        // GET /api/vendors/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var link = await _db.AccreditationLinks
                .Include(a => a.VendorTenant)
                .FirstOrDefaultAsync(a => a.LinkID == id);

            if (link == null) return NotFound();

            return Ok(new VendorDto
            {
                Id          = link.LinkID.ToString(),
                CompanyName = link.VendorTenant?.CompanyName ?? "",
                Category    = link.VendorTenant?.Industry ?? "",
                Status      = link.Status,
                Initials    = GetInitials(link.VendorTenant?.CompanyName ?? ""),
            });
        }

        // POST /api/vendors — creates an accreditation link to an existing vendor tenant
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateVendorDto dto)
        {
            var buyerTenantId = await _db.Tenants
                .Where(t => t.TenantType == "Buyer")
                .Select(t => t.TenantID)
                .FirstOrDefaultAsync();
            if (buyerTenantId == 0) buyerTenantId = 1;

            // Find or create the vendor tenant
            var vendorTenant = await _db.Tenants
                .FirstOrDefaultAsync(t => t.TenantType == "Vendor" && t.CompanyName == dto.CompanyName);

            if (vendorTenant == null)
            {
                vendorTenant = new Tenant
                {
                    TenantType  = "Vendor",
                    CompanyName = dto.CompanyName,
                    Industry    = dto.Category,
                    Status      = "Active",
                };
                _db.Tenants.Add(vendorTenant);
                await _db.SaveChangesAsync();
            }

            var link = new AccreditationLink
            {
                BuyerTenantID  = buyerTenantId,
                VendorTenantID = vendorTenant.TenantID,
                Status         = dto.Status ?? "Pending",
                AppliedAt      = DateTime.UtcNow,
            };

            _db.AccreditationLinks.Add(link);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = link.LinkID }, new VendorDto
            {
                Id          = link.LinkID.ToString(),
                CompanyName = vendorTenant.CompanyName,
                Category    = vendorTenant.Industry ?? "",
                Status      = link.Status,
                Initials    = GetInitials(vendorTenant.CompanyName),
            });
        }

        // PATCH /api/vendors/5
        [HttpPatch("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateVendorDto dto)
        {
            var link = await _db.AccreditationLinks
                .Include(a => a.VendorTenant)
                .FirstOrDefaultAsync(a => a.LinkID == id);

            if (link == null) return NotFound();

            if (dto.Status     != null) link.Status = dto.Status;
            if (dto.CompanyName != null && link.VendorTenant != null)
                link.VendorTenant.CompanyName = dto.CompanyName;
            if (dto.Category   != null && link.VendorTenant != null)
                link.VendorTenant.Industry = dto.Category;

            if (dto.Status == "Accredited")
                link.ApprovedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new VendorDto
            {
                Id          = link.LinkID.ToString(),
                CompanyName = link.VendorTenant?.CompanyName ?? "",
                Category    = link.VendorTenant?.Industry ?? "",
                Status      = link.Status,
                Initials    = GetInitials(link.VendorTenant?.CompanyName ?? ""),
            });
        }

        // DELETE /api/vendors/5  (blocks the vendor)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var link = await _db.AccreditationLinks.FindAsync(id);
            if (link == null) return NotFound();

            link.Status = "Blocked";
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
