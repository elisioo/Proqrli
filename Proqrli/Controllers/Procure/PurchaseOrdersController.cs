using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;

namespace ProqrLi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseOrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PurchaseOrdersController(ApplicationDbContext db) => _db = db;

        // GET /api/purchaseorders
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.PurchaseOrders
                .Include(p => p.VendorTenant)
                .Include(p => p.PurchaseRequisition)
                .Include(p => p.CreatedByUser)
                .OrderByDescending(p => p.PODate)
                .ToListAsync();

            return Ok(list);
        }

        // GET /api/purchaseorders/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var po = await _db.PurchaseOrders
                .Include(p => p.VendorTenant)
                .Include(p => p.PurchaseRequisition)
                .Include(p => p.CreatedByUser)
                .FirstOrDefaultAsync(p => p.POID == id);

            if (po == null) return NotFound();
            return Ok(po);
        }

        // POST /api/purchaseorders
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PurchaseOrder po)
        {
            if (string.IsNullOrWhiteSpace(po.PONumber))
                po.PONumber = $"PO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

            po.PODate = DateTime.UtcNow;
            po.Status = "Draft";

            _db.PurchaseOrders.Add(po);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = po.POID }, po);
        }

        // PUT /api/purchaseorders/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] PurchaseOrder po)
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
            var po = await _db.PurchaseOrders.FindAsync(id);
            if (po == null) return NotFound();

            po.Status = "Cancelled";
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
