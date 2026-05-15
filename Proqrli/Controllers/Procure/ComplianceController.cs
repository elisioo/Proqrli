using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;

namespace ProqrLi.Controllers.Procure
{
    // ─── DTOs ─────────────────────────────────────────────────────────────────
    public class RiskAlertDto
    {
        public string Id         { get; set; } = "";
        public string VendorName { get; set; } = "";
        public string Level      { get; set; } = "Low";
        public string Signal     { get; set; } = "";
        public string Detail     { get; set; } = "";
        public string RaisedAt   { get; set; } = "";
    }

    public class VendorRiskDto
    {
        public string Id                      { get; set; } = "";
        public string VendorName              { get; set; } = "";
        public string Initials                { get; set; } = "??";
        public string Category                { get; set; } = "";
        public string RiskClassification      { get; set; } = "Low";
        public decimal MLRiskScore            { get; set; }
        public decimal OnTimeDeliveryRate     { get; set; }
        public decimal DefectRate             { get; set; }
        public decimal ComplianceViolations   { get; set; }
    }

    public class ComplianceDocDto
    {
        public string Id             { get; set; } = "";
        public string Title          { get; set; } = "";
        public string DocumentNumber { get; set; } = "";
        public string Category       { get; set; } = "";
        public string Status         { get; set; } = "";
        public string? IssuedDate    { get; set; }
        public string? ExpiryDate    { get; set; }
        public string UploadedBy     { get; set; } = "";
        public string UploadedAt     { get; set; } = "";
    }

    public class CreateComplianceDocDto
    {
        public string Title          { get; set; } = "";
        public string? DocumentNumber { get; set; }
        public int CategoryID       { get; set; }
        public string? FilePath      { get; set; }
        public string? IssuedDate    { get; set; }
        public string? ExpiryDate    { get; set; }
        public string? RelatedModule { get; set; }
        public string? RelatedRecordID { get; set; }
    }

    public class UpdateComplianceDocDto
    {
        public string? Title   { get; set; }
        public string? Status  { get; set; }
        public string? ExpiryDate { get; set; }
    }

    // ─── Controller ───────────────────────────────────────────────────────────
    [ApiController]
    [Route("api/[controller]")]
    public class ComplianceController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ComplianceController(ApplicationDbContext db) => _db = db;

        private string GetInitials(string name)
        {
            var parts = (name ?? "").Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 0) return "??";
            return string.Join("", parts.Take(2).Select(w => w[0].ToString().ToUpper()));
        }

        // GET /api/compliance/risk-scores
        [HttpGet("risk-scores")]
        public async Task<IActionResult> GetRiskScores()
        {
            var scores = await _db.VendorRiskScores
                .Include(r => r.VendorTenant)
                .OrderByDescending(r => r.MLRiskScore)
                .ToListAsync();

            // Deduplicate: latest per vendor
            var latest = scores
                .GroupBy(r => r.VendorTenantID)
                .Select(g => g.OrderByDescending(r => r.ScoredAt).First())
                .OrderByDescending(r => r.MLRiskScore)
                .ToList();

            var dtos = latest.Select(r => new VendorRiskDto
            {
                Id                    = r.RiskScoreID.ToString(),
                VendorName            = r.VendorTenant?.CompanyName ?? "",
                Initials              = GetInitials(r.VendorTenant?.CompanyName ?? ""),
                Category              = r.VendorTenant?.Industry ?? "",
                RiskClassification    = r.RiskClassification ?? "Low",
                MLRiskScore           = r.MLRiskScore,
                OnTimeDeliveryRate    = r.OnTimeDeliveryRate,
                DefectRate            = r.DefectRate,
                ComplianceViolations  = r.ComplianceViolations,
            }).ToList();

            return Ok(dtos);
        }

        // GET /api/compliance/alerts — generates alerts from risk scores
        [HttpGet("alerts")]
        public async Task<IActionResult> GetAlerts()
        {
            var scores = await _db.VendorRiskScores
                .Include(r => r.VendorTenant)
                .OrderByDescending(r => r.ScoredAt)
                .ToListAsync();

            var latest = scores
                .GroupBy(r => r.VendorTenantID)
                .Select(g => g.OrderByDescending(r => r.ScoredAt).First())
                .ToList();

            var alerts = new List<RiskAlertDto>();

            foreach (var r in latest)
            {
                var vendorName = r.VendorTenant?.CompanyName ?? "Unknown";

                // High risk ML score
                if (r.MLRiskScore >= 0.7m)
                {
                    alerts.Add(new RiskAlertDto
                    {
                        Id = $"alert-risk-{r.RiskScoreID}",
                        VendorName = vendorName,
                        Level = "High",
                        Signal = $"Risk score {r.MLRiskScore:P0}",
                        Detail = $"ML model flagged this vendor as high risk. Classification: {r.RiskClassification}.",
                        RaisedAt = r.ScoredAt.ToString("yyyy-MM-dd"),
                    });
                }
                else if (r.MLRiskScore >= 0.4m)
                {
                    alerts.Add(new RiskAlertDto
                    {
                        Id = $"alert-risk-{r.RiskScoreID}",
                        VendorName = vendorName,
                        Level = "Medium",
                        Signal = $"Risk score {r.MLRiskScore:P0}",
                        Detail = $"ML model shows elevated risk. On-time: {r.OnTimeDeliveryRate:P0}, Defect: {r.DefectRate:P0}.",
                        RaisedAt = r.ScoredAt.ToString("yyyy-MM-dd"),
                    });
                }

                // Low on-time delivery
                if (r.OnTimeDeliveryRate < 0.80m)
                {
                    alerts.Add(new RiskAlertDto
                    {
                        Id = $"alert-otd-{r.RiskScoreID}",
                        VendorName = vendorName,
                        Level = r.OnTimeDeliveryRate < 0.70m ? "High" : "Medium",
                        Signal = $"On-time delivery dropped to {r.OnTimeDeliveryRate:P0}",
                        Detail = "Delivery performance below acceptable threshold. Consider secondary sourcing.",
                        RaisedAt = r.ScoredAt.ToString("yyyy-MM-dd"),
                    });
                }
            }

            // Check for expired compliance documents
            var expiredDocs = await _db.ComplianceDocuments
                .Include(d => d.Tenant)
                .Where(d => d.ExpiryDate != null && d.ExpiryDate < DateTime.UtcNow && d.Status == "Active")
                .ToListAsync();

            foreach (var doc in expiredDocs)
            {
                alerts.Add(new RiskAlertDto
                {
                    Id = $"alert-doc-{doc.DocID}",
                    VendorName = doc.Tenant?.CompanyName ?? "Unknown",
                    Level = "High",
                    Signal = $"Document expired: {doc.Title}",
                    Detail = $"Document '{doc.DocumentNumber}' expired on {doc.ExpiryDate:yyyy-MM-dd}. Vendor may be auto-blocked.",
                    RaisedAt = doc.ExpiryDate?.ToString("yyyy-MM-dd") ?? "",
                });
            }

            return Ok(alerts.OrderByDescending(a => a.Level == "High" ? 2 : a.Level == "Medium" ? 1 : 0).ToList());
        }

        // ── Compliance Documents CRUD ──────────────────────────────────────────

        // GET /api/compliance/documents
        [HttpGet("documents")]
        public async Task<IActionResult> GetDocuments()
        {
            var docs = await _db.ComplianceDocuments
                .Include(d => d.DocumentCategory)
                .Include(d => d.UploadedBy)
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();

            return Ok(docs.Select(d => new ComplianceDocDto
            {
                Id             = d.DocID.ToString(),
                Title          = d.Title,
                DocumentNumber = d.DocumentNumber ?? "",
                Category       = d.DocumentCategory?.CategoryName ?? "",
                Status         = d.Status,
                IssuedDate     = d.IssuedDate?.ToString("yyyy-MM-dd"),
                ExpiryDate     = d.ExpiryDate?.ToString("yyyy-MM-dd"),
                UploadedBy     = d.UploadedBy?.FullName ?? "",
                UploadedAt     = d.UploadedAt.ToString("yyyy-MM-dd"),
            }).ToList());
        }

        // POST /api/compliance/documents
        [HttpPost("documents")]
        public async Task<IActionResult> CreateDocument([FromBody] CreateComplianceDocDto dto)
        {
            var tenantIdStr = User.FindFirstValue("tenant_id");
            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();
            var userId = await _db.TenantUsers.Select(u => u.UserID).FirstOrDefaultAsync();

            var doc = new ComplianceDocument
            {
                Title          = dto.Title,
                DocumentNumber = dto.DocumentNumber,
                CategoryID     = dto.CategoryID,
                FilePath       = dto.FilePath ?? "",
                IssuedDate     = DateTime.TryParse(dto.IssuedDate, out var id) ? id : null,
                ExpiryDate     = DateTime.TryParse(dto.ExpiryDate, out var ed) ? ed : null,
                RelatedModule  = dto.RelatedModule,
                RelatedRecordID = dto.RelatedRecordID,
                Status         = "Active",
                TenantID       = tenantId,
                UploadedByID   = userId,
            };

            _db.ComplianceDocuments.Add(doc);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDocuments), null, new ComplianceDocDto
            {
                Id = doc.DocID.ToString(),
                Title = doc.Title,
                DocumentNumber = doc.DocumentNumber ?? "",
                Status = doc.Status,
                UploadedAt = doc.UploadedAt.ToString("yyyy-MM-dd"),
            });
        }

        // PATCH /api/compliance/documents/5
        [HttpPatch("documents/{id:int}")]
        public async Task<IActionResult> UpdateDocument(int id, [FromBody] UpdateComplianceDocDto dto)
        {
            var doc = await _db.ComplianceDocuments.FindAsync(id);
            if (doc == null) return NotFound();

            if (dto.Title  != null) doc.Title  = dto.Title;
            if (dto.Status != null) doc.Status = dto.Status;
            if (dto.ExpiryDate != null && DateTime.TryParse(dto.ExpiryDate, out var ed))
                doc.ExpiryDate = ed;

            await _db.SaveChangesAsync();
            return Ok(new ComplianceDocDto
            {
                Id = doc.DocID.ToString(),
                Title = doc.Title,
                Status = doc.Status,
            });
        }

        // DELETE /api/compliance/documents/5
        [HttpDelete("documents/{id:int}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var doc = await _db.ComplianceDocuments.FindAsync(id);
            if (doc == null) return NotFound();

            doc.Status = "Archived";
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // ── Document Categories ────────────────────────────────────────────────

        // GET /api/compliance/categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _db.DocumentCategories
                .Select(c => new { c.CategoryID, c.CategoryName, c.RequiresExpiry })
                .ToListAsync();
            return Ok(categories);
        }
    }
}


