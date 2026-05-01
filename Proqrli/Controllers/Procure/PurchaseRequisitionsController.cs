using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;

namespace ProqrLi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseRequisitionsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PurchaseRequisitionsController(ApplicationDbContext db) => _db = db;

        // GET /api/purchaserequisitions
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.PurchaseRequisitions
                .Include(r => r.RequestedBy)
                .Include(r => r.Tenant)
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();

            return Ok(list);
        }

        // GET /api/purchaserequisitions/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var pr = await _db.PurchaseRequisitions
                .Include(r => r.RequestedBy)
                .Include(r => r.Tenant)
                .FirstOrDefaultAsync(r => r.PRID == id);

            if (pr == null) return NotFound();
            return Ok(pr);
        }

        // POST /api/purchaserequisitions
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PurchaseRequisition pr)
        {
            // Auto-generate PR number if not provided
            if (string.IsNullOrWhiteSpace(pr.PRNumber))
                pr.PRNumber = $"PR-{DateTime.UtcNow.Year}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

            pr.RequestDate = DateTime.UtcNow;
            pr.Status = "Draft";

            _db.PurchaseRequisitions.Add(pr);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = pr.PRID }, pr);
        }

        // PUT /api/purchaserequisitions/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] PurchaseRequisition pr)
        {
            if (id != pr.PRID) return BadRequest("ID mismatch.");

            _db.Entry(pr).State = EntityState.Modified;

            // Prevent overwriting these auto-set fields
            _db.Entry(pr).Property(x => x.RequestDate).IsModified = false;
            _db.Entry(pr).Property(x => x.TenantID).IsModified = false;

            await _db.SaveChangesAsync();
            return Ok(pr);
        }

        // DELETE /api/purchaserequisitions/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var pr = await _db.PurchaseRequisitions.FindAsync(id);
            if (pr == null) return NotFound();

            // Soft delete — just cancel it, don't remove the record
            pr.Status = "Cancelled";
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
