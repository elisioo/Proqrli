using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;

namespace ProqrLi.Controllers.Procure
{
    public class ContractDto
    {
        public string Id              { get; set; } = "";
        public string ContractNumber  { get; set; } = "";
        public string VendorName      { get; set; } = "";
        public string VendorId        { get; set; } = "";
        public string ContractType    { get; set; } = "";
        public string StartDate       { get; set; } = "";
        public string EndDate         { get; set; } = "";
        public string Status          { get; set; } = "";
        public decimal TotalValue     { get; set; }
        public string? Terms          { get; set; }
        public string CreatedBy       { get; set; } = "";
        public bool Archived          { get; set; }
    }

    public class CreateContractDto
    {
        public string? ContractNumber  { get; set; }
        public int VendorTenantID      { get; set; }
        public string? ContractType    { get; set; }
        public string StartDate        { get; set; } = "";
        public string EndDate          { get; set; } = "";
        public decimal TotalValue      { get; set; }
        public string? Terms           { get; set; }
    }

    public class UpdateContractDto
    {
        public string? Status     { get; set; }
        public string? EndDate    { get; set; }
        public decimal? TotalValue{ get; set; }
        public string? Terms      { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class ContractsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ContractsController(ApplicationDbContext db) => _db = db;

        private static ContractDto ToDto(Contract c)
        {
            return new ContractDto
            {
                Id             = c.ContractID.ToString(),
                ContractNumber = c.ContractNumber ?? "",
                VendorName     = c.VendorTenant?.CompanyName ?? "",
                VendorId       = c.VendorTenantID.ToString(),
                ContractType   = c.ContractType,
                StartDate      = c.StartDate.ToString("yyyy-MM-dd"),
                EndDate        = c.EndDate.ToString("yyyy-MM-dd"),
                Status         = c.Status,
                TotalValue     = c.TotalValue,
                Terms          = c.Terms,
                CreatedBy      = c.CreatedByUser?.FullName ?? "",
                Archived       = c.Status == "Cancelled",
            };
        }

        // GET /api/contracts
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.Contracts
                .Include(c => c.VendorTenant)
                .Include(c => c.CreatedByUser)
                .OrderByDescending(c => c.StartDate)
                .ToListAsync();

            return Ok(list.Select(ToDto).ToList());
        }

        // GET /api/contracts/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var c = await _db.Contracts
                .Include(c => c.VendorTenant)
                .Include(c => c.CreatedByUser)
                .FirstOrDefaultAsync(c => c.ContractID == id);

            if (c == null) return NotFound();
            return Ok(ToDto(c));
        }

        // GET /api/contracts/vendor-lookup — dropdown data for the frontend
        [HttpGet("vendor-lookup")]
        public async Task<IActionResult> GetVendorLookup()
        {
            var vendors = await _db.Tenants
                .Where(t => t.TenantType == "Vendor" && t.Status != "Archived")
                .Select(t => new { id = t.TenantID, label = t.CompanyName })
                .ToListAsync();
            return Ok(vendors);
        }

        // POST /api/contracts
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateContractDto dto)
        {
            // ── FK validation ──────────────────────────────────────────────
            var vendor = await _db.Tenants.FirstOrDefaultAsync(t => t.TenantID == dto.VendorTenantID && t.TenantType == "Vendor");
            if (vendor == null)
                return BadRequest(new { error = $"Vendor with ID {dto.VendorTenantID} does not exist. Please select a valid vendor." });

            var tenantIdStr = User.FindFirstValue("tenant_id");
            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();
            var userId = await _db.TenantUsers.Select(u => u.UserID).FirstOrDefaultAsync();

            var contract = new Contract
            {
                ContractNumber  = string.IsNullOrWhiteSpace(dto.ContractNumber)
                    ? $"CTR-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}"
                    : dto.ContractNumber,
                VendorTenantID   = dto.VendorTenantID,
                ContractType     = dto.ContractType ?? "Fixed",
                StartDate        = DateTime.TryParse(dto.StartDate, out var sd) ? sd : DateTime.UtcNow,
                EndDate          = DateTime.TryParse(dto.EndDate, out var ed) ? ed : DateTime.UtcNow.AddYears(1),
                TotalValue       = dto.TotalValue,
                Terms            = dto.Terms,
                Status           = "Draft",
                TenantID         = tenantId,
                CreatedByUserID  = userId,
            };

            _db.Contracts.Add(contract);
            await _db.SaveChangesAsync();

            var saved = await _db.Contracts
                .Include(c => c.VendorTenant)
                .Include(c => c.CreatedByUser)
                .FirstAsync(c => c.ContractID == contract.ContractID);

            return CreatedAtAction(nameof(GetById), new { id = contract.ContractID }, ToDto(saved));
        }

        // PATCH /api/contracts/5
        [HttpPatch("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateContractDto dto)
        {
            var c = await _db.Contracts
                .Include(c => c.VendorTenant)
                .Include(c => c.CreatedByUser)
                .FirstOrDefaultAsync(c => c.ContractID == id);

            if (c == null) return NotFound();

            if (dto.Status     != null) c.Status     = dto.Status;
            if (dto.TotalValue != null) c.TotalValue  = dto.TotalValue.Value;
            if (dto.Terms      != null) c.Terms       = dto.Terms;
            if (dto.EndDate    != null && DateTime.TryParse(dto.EndDate, out var ed))
                c.EndDate = ed;

            await _db.SaveChangesAsync();
            return Ok(ToDto(c));
        }

        // DELETE /api/contracts/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var c = await _db.Contracts.FindAsync(id);
            if (c == null) return NotFound();

            c.Status = "Cancelled";
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}


