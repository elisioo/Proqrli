using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;
using ProqrLi.DTOs;

namespace ProqrLi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseOrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PurchaseOrdersController(ApplicationDbContext db) => _db = db;

        private static PurchaseOrderDto ToDto(PurchaseOrder po, int itemCount = 0)
        {
            return new PurchaseOrderDto
            {
                Id               = po.POID.ToString(),
                PoNumber         = po.PONumber ?? "",
                VendorName       = po.VendorTenant?.CompanyName ?? "",
                VendorId         = po.VendorTenantID.ToString(),
                Status           = po.Status,
                Total            = po.TotalAmount,
                ItemCount        = itemCount,
                PoDate           = po.PODate.ToString("yyyy-MM-dd"),
                ExpectedDelivery = po.ExpectedDelivery?.ToString("yyyy-MM-dd") ?? "",
                PaymentTerms     = po.PaymentTerms ?? "",
                RaisedBy         = po.CreatedByUser?.FullName ?? "",
                PrRef            = po.PurchaseRequisition?.PRNumber,
                Archived         = po.Status == "Archived"
            };
        }

        // GET /api/purchaseorders
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            var tenantIdStr = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirstValue("tenant_id");
            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();

            var list = await _db.PurchaseOrders
                .Where(x => x.TenantID == tenantId || x.VendorTenantID == tenantId)
                .Include(p => p.Tenant)
                .Include(p => p.VendorTenant)
                .Include(p => p.PurchaseRequisition)
                .Include(p => p.CreatedByUser)
                .OrderByDescending(p => p.PODate)
                .ToListAsync();

            var poIds = list.Select(p => p.POID).ToList();
            var counts = await _db.POItems
                .Where(pi => poIds.Contains(pi.POID))
                .GroupBy(pi => pi.POID)
                .Select(g => new { POID = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.POID, g => g.Count);

            var dtos = list.Select(p => ToDto(p, counts.GetValueOrDefault(p.POID, 0))).ToList();
            return Ok(dtos);
        }

        // GET /api/purchaseorders/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var tenantIdStr = User.FindFirstValue("tenant_id") ?? User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();

            var po = await _db.PurchaseOrders
                .Include(p => p.Tenant)
                .Include(p => p.VendorTenant)
                .Include(p => p.PurchaseRequisition)
                .Include(p => p.CreatedByUser)
                .FirstOrDefaultAsync(p => p.POID == id && (p.TenantID == tenantId || p.VendorTenantID == tenantId));

            if (po == null) return NotFound();
            var itemCount = await _db.POItems.CountAsync(pi => pi.POID == id);
            return Ok(ToDto(po, itemCount));
        }

        // GET /api/purchaseorders/pr-lookup
        [HttpGet("pr-lookup")]
        public async Task<IActionResult> GetPRLookup()
        {
            var tenantIdStr = User.FindFirstValue("tenant_id") ?? User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();

            var prs = await _db.PurchaseRequisitions
                .Where(pr => pr.Status == "Approved" && pr.TenantID == tenantId)
                .OrderByDescending(pr => pr.RequestDate)
                .Select(pr => new { id = pr.PRID, label = pr.PRNumber + " — " + pr.Title })
                .ToListAsync();
            return Ok(prs);
        }

        // GET /api/purchaseorders/vendor-lookup
        [HttpGet("vendor-lookup")]
        public async Task<IActionResult> GetVendorLookup()
        {
            var tenantIdStr = User.FindFirstValue("tenant_id") ?? User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();

            var vendors = await _db.AccreditationLinks
                .Where(a => a.BuyerTenantID == tenantId && a.Status == "Accredited")
                .Select(a => new { id = a.VendorTenantID, label = a.VendorTenant.CompanyName })
                .ToListAsync();
            return Ok(vendors);
        }

        // POST /api/purchaseorders
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePurchaseOrderDto dto)
        {
            // ── FK validation ──────────────────────────────────────────────
            var vendor = await _db.Tenants.FirstOrDefaultAsync(t => t.TenantID == dto.VendorTenantID && t.TenantType == "Vendor");
            if (vendor == null)
                return BadRequest(new { error = $"Vendor with ID {dto.VendorTenantID} does not exist. Please select a valid vendor." });

            if (dto.PRID > 0)
            {
                var pr = await _db.PurchaseRequisitions.FindAsync(dto.PRID);
                if (pr == null)
                    return BadRequest(new { error = $"Purchase Requisition with ID {dto.PRID} does not exist." });
                
                pr.Status = "Converted to PO";
            }

            var tenantIdStr = User.FindFirstValue("tenant_id");
            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();

            var userIdStr = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            int.TryParse(userIdStr ?? "1", out var userId);

            var po = new PurchaseOrder
            {
                PONumber        = string.IsNullOrWhiteSpace(dto.PoNumber) ? $"PO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}" : dto.PoNumber,
                PRID            = dto.PRID > 0 ? dto.PRID : null,
                VendorTenantID  = dto.VendorTenantID,
                TotalAmount     = dto.Total,
                ExpectedDelivery = DateTime.TryParse(dto.ExpectedDelivery, out var ed) ? ed : DateTime.UtcNow.AddDays(14),
                PaymentTerms    = dto.PaymentTerms ?? "Net30",
                PODate          = DateTime.UtcNow,
                Status          = "Draft",
                TenantID        = tenantId,
                CreatedByUserID = userId,
            };

            _db.PurchaseOrders.Add(po);
            await _db.SaveChangesAsync();

            var saved = await _db.PurchaseOrders
                .Include(p => p.VendorTenant)
                .Include(p => p.PurchaseRequisition)
                .Include(p => p.CreatedByUser)
                .FirstAsync(p => p.POID == po.POID);

            return CreatedAtAction(nameof(GetById), new { id = po.POID }, ToDto(saved, 0));
        }

        // PATCH /api/purchaseorders/5
        [HttpPatch("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePurchaseOrderDto dto)
        {
            var tenantIdStr = User.FindFirstValue("tenant_id") ?? User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();

            var po = await _db.PurchaseOrders
                .Include(p => p.VendorTenant)
                .Include(p => p.PurchaseRequisition)
                .Include(p => p.CreatedByUser)
                .FirstOrDefaultAsync(p => p.POID == id && (p.TenantID == tenantId || p.VendorTenantID == tenantId));

            if (po == null) return NotFound();

            if (dto.Status           != null) po.Status          = dto.Status;
            if (dto.ExpectedDelivery != null && DateTime.TryParse(dto.ExpectedDelivery, out var ed))
                po.ExpectedDelivery = ed;
            if (dto.PaymentTerms     != null) po.PaymentTerms    = dto.PaymentTerms;
            if (dto.Total            != null) po.TotalAmount     = dto.Total.Value;

            await _db.SaveChangesAsync();

            var itemCount = await _db.POItems.CountAsync(pi => pi.POID == id);
            return Ok(ToDto(po, itemCount));
        }

        // PUT /api/purchaseorders/5 (backwards compat)
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutUpdate(int id, [FromBody] PurchaseOrder po)
        {
            if (id != po.POID) return BadRequest("ID mismatch.");

            _db.Entry(po).State = EntityState.Modified;
            _db.Entry(po).Property(x => x.PODate).IsModified = false;
            _db.Entry(po).Property(x => x.TenantID).IsModified = false;

            await _db.SaveChangesAsync();
            return Ok(po);
        }

        // DELETE /api/purchaseorders/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tenantIdStr = User.FindFirstValue("tenant_id") ?? User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();

            var po = await _db.PurchaseOrders.FirstOrDefaultAsync(p => p.POID == id && (p.TenantID == tenantId || p.VendorTenantID == tenantId));
            if (po == null) return NotFound();

            po.Status = "Archived";
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}




