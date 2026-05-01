using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;

namespace ProqrLi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PaymentsController(ApplicationDbContext db) => _db = db;

        // GET /api/payments
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.PaymentTenants
                .Include(p => p.Invoice)
                .Include(p => p.Tenant)
                .Include(p => p.ProcessedBy)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();

            return Ok(list);
        }

        // GET /api/payments/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var payment = await _db.PaymentTenants
                .Include(p => p.Invoice)
                .Include(p => p.Tenant)
                .Include(p => p.ProcessedBy)
                .FirstOrDefaultAsync(p => p.PaymentID == id);

            if (payment == null) return NotFound();
            return Ok(payment);
        }

        // POST /api/payments
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PaymentTenant payment)
        {
            payment.PaymentDate = DateTime.UtcNow;
            payment.Status = "Pending";

            if (string.IsNullOrWhiteSpace(payment.Reference))
                payment.Reference = $"PAY-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

            _db.PaymentTenants.Add(payment);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = payment.PaymentID }, payment);
        }

        // PUT /api/payments/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] PaymentTenant payment)
        {
            if (id != payment.PaymentID) return BadRequest("ID mismatch.");

            _db.Entry(payment).State = EntityState.Modified;
            _db.Entry(payment).Property(x => x.PaymentDate).IsModified = false;
            _db.Entry(payment).Property(x => x.TenantID).IsModified = false;

            await _db.SaveChangesAsync();
            return Ok(payment);
        }

        // DELETE /api/payments/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var payment = await _db.PaymentTenants.FindAsync(id);
            if (payment == null) return NotFound();

            // Payments can't be "cancelled" like others — just hard delete if still Pending
            if (payment.Status != "Pending")
                return BadRequest("Only Pending payments can be deleted.");

            _db.PaymentTenants.Remove(payment);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
