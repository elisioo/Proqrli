using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;
using ProqrLi.DTOs;

namespace ProqrLi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PaymentsController(ApplicationDbContext db) => _db = db;

        private static PaymentDto ToDto(PaymentTenant p)
        {
            return new PaymentDto
            {
                Id           = p.PaymentID.ToString(),
                Reference    = p.Reference ?? "",
                VendorName   = p.Invoice?.VendorTenant?.CompanyName ?? "",
                BillRef      = p.Invoice?.InvoiceNumber ?? "",
                Amount       = p.AmountPaid,
                Status       = p.Status,
                ScheduledFor = p.PaymentDate.ToString("yyyy-MM-dd"),
                Method       = p.PaymentMethod ?? "",
            };
        }

        // GET /api/payments
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.PaymentTenants
                .Include(p => p.Invoice)
                    .ThenInclude(i => i!.VendorTenant)
                .Include(p => p.Tenant)
                .Include(p => p.ProcessedBy)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();

            return Ok(list.Select(ToDto).ToList());
        }

        // GET /api/payments/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var payment = await _db.PaymentTenants
                .Include(p => p.Invoice)
                    .ThenInclude(i => i!.VendorTenant)
                .Include(p => p.Tenant)
                .Include(p => p.ProcessedBy)
                .FirstOrDefaultAsync(p => p.PaymentID == id);

            if (payment == null) return NotFound();
            return Ok(ToDto(payment));
        }

        // GET /api/payments/invoice-lookup — dropdown data for the frontend
        [HttpGet("invoice-lookup")]
        public async Task<IActionResult> GetInvoiceLookup()
        {
            var invoices = await _db.Invoices
                .Include(i => i.VendorTenant)
                .Where(i => i.Status != "Cancelled")
                .OrderByDescending(i => i.InvoiceDate)
                .Select(i => new { id = i.InvoiceID, label = i.InvoiceNumber + " — " + (i.VendorTenant != null ? i.VendorTenant.CompanyName : "Unknown") })
                .ToListAsync();
            return Ok(invoices);
        }

        // POST /api/payments
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePaymentDto dto)
        {
            // ── FK validation ──────────────────────────────────────────────
            var invoice = await _db.Invoices.FindAsync(dto.InvoiceID);
            if (invoice == null)
                return BadRequest(new { error = $"Invoice with ID {dto.InvoiceID} does not exist. Please select a valid invoice." });

            var tenantId = invoice.TenantID;

            var payment = new PaymentTenant
            {
                InvoiceID     = dto.InvoiceID,
                AmountPaid    = dto.Amount,
                PaymentMethod = dto.Method,
                PaymentDate   = DateTime.TryParse(dto.ScheduledFor, out var sf) ? sf : DateTime.UtcNow,
                Status        = "Pending",
                Reference     = $"PAY-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}",
                TenantID      = tenantId,
            };

            _db.PaymentTenants.Add(payment);
            await _db.SaveChangesAsync();

            var saved = await _db.PaymentTenants
                .Include(p => p.Invoice)
                    .ThenInclude(i => i!.VendorTenant)
                .FirstAsync(p => p.PaymentID == payment.PaymentID);

            return CreatedAtAction(nameof(GetById), new { id = payment.PaymentID }, ToDto(saved));
        }

        // PATCH /api/payments/5
        [HttpPatch("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePaymentDto dto)
        {
            var payment = await _db.PaymentTenants
                .Include(p => p.Invoice)
                    .ThenInclude(i => i!.VendorTenant)
                .FirstOrDefaultAsync(p => p.PaymentID == id);

            if (payment == null) return NotFound();

            if (dto.Status       != null) payment.Status = dto.Status;
            if (dto.ScheduledFor != null && DateTime.TryParse(dto.ScheduledFor, out var sf))
                payment.PaymentDate = sf;

            await _db.SaveChangesAsync();
            return Ok(ToDto(payment));
        }

        // PUT /api/payments/5 (backwards compat)
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutUpdate(int id, [FromBody] PaymentTenant payment)
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
