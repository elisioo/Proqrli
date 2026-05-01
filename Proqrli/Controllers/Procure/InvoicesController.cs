using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;

namespace ProqrLi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoicesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public InvoicesController(ApplicationDbContext db) => _db = db;

        // GET /api/invoices
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.Invoices
                .Include(i => i.VendorTenant)
                .Include(i => i.PurchaseOrder)
                .OrderByDescending(i => i.InvoiceDate)
                .ToListAsync();

            return Ok(list);
        }

        // GET /api/invoices/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var invoice = await _db.Invoices
                .Include(i => i.VendorTenant)
                .Include(i => i.PurchaseOrder)
                .FirstOrDefaultAsync(i => i.InvoiceID == id);

            if (invoice == null) return NotFound();
            return Ok(invoice);
        }

        // POST /api/invoices
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Invoice invoice)
        {
            if (string.IsNullOrWhiteSpace(invoice.InvoiceNumber))
                invoice.InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

            invoice.InvoiceDate = DateTime.UtcNow;
            invoice.TotalAmount = invoice.SubTotal + invoice.TaxAmount;
            invoice.Status = "Pending";

            _db.Invoices.Add(invoice);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = invoice.InvoiceID }, invoice);
        }

        // PUT /api/invoices/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Invoice invoice)
        {
            if (id != invoice.InvoiceID) return BadRequest("ID mismatch.");

            // Recalculate total in case sub/tax changed
            invoice.TotalAmount = invoice.SubTotal + invoice.TaxAmount;

            _db.Entry(invoice).State = EntityState.Modified;
            _db.Entry(invoice).Property(x => x.InvoiceDate).IsModified = false;
            _db.Entry(invoice).Property(x => x.TenantID).IsModified = false;

            await _db.SaveChangesAsync();
            return Ok(invoice);
        }

        // DELETE /api/invoices/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var invoice = await _db.Invoices.FindAsync(id);
            if (invoice == null) return NotFound();

            invoice.Status = "Cancelled";
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
