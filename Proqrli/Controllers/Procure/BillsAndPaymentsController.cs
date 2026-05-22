using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.DTOs;
using ProqrLi.Models;

namespace ProqrLi.Controllers
{
    // ─── Bills (Invoices) ─────────────────────────────────────────────────────
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize]
    public class BillsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public BillsController(ApplicationDbContext db) => _db = db;

        // GET /api/bills
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VendorBillDto>>> GetAll()
        {
            var rows = await _db.Invoices
                .Include(i => i.VendorTenant)
                .Include(i => i.PurchaseOrder)
                .OrderByDescending(i => i.InvoiceDate)
                .ToListAsync();

            return Ok(rows.Select(ToDto));
        }

        // GET /api/bills/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<VendorBillDto>> GetById(int id)
        {
            var inv = await _db.Invoices
                .Include(i => i.VendorTenant)
                .Include(i => i.PurchaseOrder)
                .FirstOrDefaultAsync(i => i.InvoiceID == id);

            return inv is null ? NotFound() : Ok(ToDto(inv));
        }

        // POST /api/bills
        [HttpPost]
        public async Task<ActionResult<VendorBillDto>> Create([FromBody] CreateVendorBillDto dto)
        {
            var po = await _db.PurchaseOrders.FindAsync(dto.POID);
            if (po is null) return BadRequest("Purchase order not found.");

            var inv = new Invoice
            {
                TenantID       = 1,  // TODO: from claims
                POID           = dto.POID,
                VendorTenantID = po.VendorTenantID,
                InvoiceNumber  = string.IsNullOrWhiteSpace(dto.BillNumber)
                                   ? $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}"
                                   : dto.BillNumber,
                InvoiceDate    = DateTime.UtcNow,
                DueDate        = DateTime.TryParse(dto.DueAt, out var d) ? d : DateTime.UtcNow.AddDays(30),
                SubTotal       = dto.SubTotal,
                TaxAmount      = dto.TaxAmount,
                TotalAmount    = dto.SubTotal + dto.TaxAmount,
                Status         = "Pending"
            };

            _db.Invoices.Add(inv);
            await _db.SaveChangesAsync();

            await _db.Entry(inv).Reference(x => x.VendorTenant).LoadAsync();
            await _db.Entry(inv).Reference(x => x.PurchaseOrder).LoadAsync();

            return CreatedAtAction(nameof(GetById), new { id = inv.InvoiceID }, ToDto(inv));
        }

        // PATCH /api/bills/5
        [HttpPatch("{id:int}")]
        public async Task<ActionResult<VendorBillDto>> Update(int id, [FromBody] UpdateVendorBillDto dto)
        {
            var inv = await _db.Invoices
                .Include(i => i.VendorTenant)
                .Include(i => i.PurchaseOrder)
                .FirstOrDefaultAsync(i => i.InvoiceID == id);

            if (inv is null) return NotFound();

            if (dto.Status is not null) inv.Status = dto.Status;
            if (dto.Amount is not null) inv.TotalAmount = dto.Amount.Value;
            if (dto.DueAt is not null && DateTime.TryParse(dto.DueAt, out var d))
                inv.DueDate = d;

            await _db.SaveChangesAsync();
            return Ok(ToDto(inv));
        }

        // DELETE /api/bills/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Cancel(int id)
        {
            var inv = await _db.Invoices.FindAsync(id);
            if (inv is null) return NotFound();

            inv.Status = "Cancelled";
            await _db.SaveChangesAsync();
            return NoContent();
        }

        private static VendorBillDto ToDto(Invoice i) => new()
        {
            Id         = i.InvoiceID.ToString(),
            BillNumber = i.InvoiceNumber ?? "",
            VendorName = i.VendorTenant?.CompanyName ?? "",
            PoRef      = i.PurchaseOrder?.PONumber ?? "",
            Amount     = i.TotalAmount,
            Status     = i.Status,
            ReceivedAt = i.InvoiceDate.ToString("yyyy-MM-dd"),
            DueAt      = i.DueDate.ToString("yyyy-MM-dd"),
        };
    }

    // ─── Payments ─────────────────────────────────────────────────────────────
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PaymentsController(ApplicationDbContext db) => _db = db;

        // GET /api/payments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetAll()
        {
            var rows = await _db.PaymentTenants
                .Include(p => p.Invoice).ThenInclude(i => i!.VendorTenant)
                .Include(p => p.Invoice).ThenInclude(i => i!.PurchaseOrder)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();

            return Ok(rows.Select(ToDto));
        }

        // GET /api/payments/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<PaymentDto>> GetById(int id)
        {
            var p = await _db.PaymentTenants
                .Include(p => p.Invoice).ThenInclude(i => i!.VendorTenant)
                .Include(p => p.Invoice).ThenInclude(i => i!.PurchaseOrder)
                .FirstOrDefaultAsync(p => p.PaymentID == id);

            return p is null ? NotFound() : Ok(ToDto(p));
        }

        // POST /api/payments
        [HttpPost]
        public async Task<ActionResult<PaymentDto>> Create([FromBody] CreatePaymentDto dto)
        {
            var inv = await _db.Invoices
                .Include(i => i.VendorTenant)
                .FirstOrDefaultAsync(i => i.InvoiceID == dto.InvoiceID);

            if (inv is null) return BadRequest("Invoice not found.");

            var payment = new PaymentTenant
            {
                TenantID      = 1,  // TODO: from claims
                InvoiceID     = dto.InvoiceID,
                AmountPaid    = dto.Amount,
                PaymentMethod = dto.Method,
                PaymentDate   = DateTime.TryParse(dto.ScheduledFor, out var d) ? d : DateTime.UtcNow,
                Reference     = $"PAY-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..1].ToUpper()}",
                Status        = "Scheduled"
            };

            _db.PaymentTenants.Add(payment);

            // Update the linked invoice status
            inv.Status = "Scheduled";
            await _db.SaveChangesAsync();

            await _db.Entry(payment).Reference(x => x.Invoice).LoadAsync();

            return CreatedAtAction(nameof(GetById), new { id = payment.PaymentID }, ToDto(payment));
        }

        // PATCH /api/payments/5
        [HttpPatch("{id:int}")]
        public async Task<ActionResult<PaymentDto>> Update(int id, [FromBody] UpdatePaymentDto dto)
        {
            var p = await _db.PaymentTenants
                .Include(x => x.Invoice).ThenInclude(i => i!.VendorTenant)
                .Include(x => x.Invoice).ThenInclude(i => i!.PurchaseOrder)
                .FirstOrDefaultAsync(x => x.PaymentID == id);

            if (p is null) return NotFound();

            if (dto.Status is not null) p.Status = dto.Status;
            if (dto.ScheduledFor is not null && DateTime.TryParse(dto.ScheduledFor, out var d))
                p.PaymentDate = d;

            await _db.SaveChangesAsync();
            return Ok(ToDto(p));
        }

        private static PaymentDto ToDto(PaymentTenant p) => new()
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
}
