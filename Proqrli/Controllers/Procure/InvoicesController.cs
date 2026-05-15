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
    public class InvoicesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;

        public InvoicesController(ApplicationDbContext db, IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _db = db;
            _config = config;
            _httpClientFactory = httpClientFactory;
        }

        private static VendorBillDto ToDto(Invoice inv)
        {
            return new VendorBillDto
            {
                Id         = inv.InvoiceID.ToString(),
                BillNumber = inv.InvoiceNumber ?? "",
                VendorName = inv.VendorTenant?.CompanyName ?? "",
                PoRef      = inv.PurchaseOrder?.PONumber ?? "",
                Amount     = inv.TotalAmount,
                Status     = inv.Status,
                ReceivedAt = inv.InvoiceDate.ToString("yyyy-MM-dd"),
                DueAt      = inv.DueDate.ToString("yyyy-MM-dd"),
            };
        }

        // GET /api/invoices
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            var tenantIdStr = User.FindFirstValue("tenant_id");
            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();

            var list = await _db.Invoices
                .Where(x => x.TenantID == tenantId || x.VendorTenantID == tenantId)
                .Include(i => i.VendorTenant)
                .Include(i => i.PurchaseOrder)
                .OrderByDescending(i => i.InvoiceDate)
                .ToListAsync();

            return Ok(list.Select(ToDto).ToList());
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
            return Ok(ToDto(invoice));
        }

        // GET /api/invoices/po-lookup — dropdown data for the frontend
        [HttpGet("po-lookup")]
        public async Task<IActionResult> GetPOLookup()
        {
            var pos = await _db.PurchaseOrders
                .Include(p => p.VendorTenant)
                .Where(p => p.Status != "Cancelled")
                .OrderByDescending(p => p.PODate)
                .Select(p => new { id = p.POID, label = p.PONumber + " — " + (p.VendorTenant != null ? p.VendorTenant.CompanyName : "Unknown"), vendorName = p.VendorTenant != null ? p.VendorTenant.CompanyName : "" })
                .ToListAsync();
            return Ok(pos);
        }

        // POST /api/invoices
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateVendorBillDto dto)
        {
            // ── FK validation ──────────────────────────────────────────────
            var po = await _db.PurchaseOrders.FindAsync(dto.POID);
            if (po == null)
                return BadRequest(new { error = $"Purchase Order with ID {dto.POID} does not exist. Please select a valid PO." });

            var tenantId = po.TenantID;
            var vendorTenantId = po.VendorTenantID;

            var invoice = new Invoice
            {
                InvoiceNumber = string.IsNullOrWhiteSpace(dto.BillNumber)
                    ? $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}"
                    : dto.BillNumber,
                POID            = dto.POID,
                SubTotal        = dto.SubTotal,
                TaxAmount       = dto.TaxAmount,
                TotalAmount     = dto.SubTotal + dto.TaxAmount,
                InvoiceDate     = DateTime.UtcNow,
                DueDate         = DateTime.TryParse(dto.DueAt, out var da) ? da : DateTime.UtcNow.AddDays(30),
                Status          = "Pending",
                TenantID        = tenantId,
                VendorTenantID  = vendorTenantId,
            };

            _db.Invoices.Add(invoice);
            await _db.SaveChangesAsync();

            var saved = await _db.Invoices
                .Include(i => i.VendorTenant)
                .Include(i => i.PurchaseOrder)
                .FirstAsync(i => i.InvoiceID == invoice.InvoiceID);

            return CreatedAtAction(nameof(GetById), new { id = invoice.InvoiceID }, ToDto(saved));
        }

        // PATCH /api/invoices/5
        [HttpPatch("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateVendorBillDto dto)
        {
            var invoice = await _db.Invoices
                .Include(i => i.VendorTenant)
                .Include(i => i.PurchaseOrder)
                .FirstOrDefaultAsync(i => i.InvoiceID == id);

            if (invoice == null) return NotFound();

            if (dto.Status != null) invoice.Status = dto.Status;
            if (dto.Amount != null) invoice.TotalAmount = dto.Amount.Value;
            if (dto.DueAt  != null && DateTime.TryParse(dto.DueAt, out var da))
                invoice.DueDate = da;

            await _db.SaveChangesAsync();
            return Ok(ToDto(invoice));
        }

        // PUT /api/invoices/5 (backwards compat)
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutUpdate(int id, [FromBody] Invoice invoice)
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

        // GET /api/invoices/tax-rate?country=US
        [HttpGet("tax-rate")]
        public async Task<IActionResult> GetTaxRate([FromQuery] string country)
        {
            if (string.IsNullOrWhiteSpace(country))
                country = "US"; // Default fallback

            var apiKey = _config["TaxApi:ApiKey"];
            
            // If key is missing or is the default placeholder, return a mock response
            if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "YOUR_TAX_API_KEY_HERE")
            {
                return Ok(new { 
                    success = true, 
                    standard_rate = new { rate = 0.12 } // 12% default VAT/Tax fallback
                });
            }

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("apikey", apiKey);

            try 
            {
                var response = await client.GetAsync($"https://api.apilayer.com/tax_data/tax_rates?country={country}");
                var content = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    return Content(content, "application/json");
                }

                // If external API fails, return the 12% fallback instead of an error
                return Ok(new { 
                    success = true, 
                    standard_rate = new { rate = 0.12 } 
                });
            }
            catch (Exception ex)
            {
                // Fallback on exception too
                return Ok(new { 
                    success = true, 
                    standard_rate = new { rate = 0.12 } 
                });
            }
        }
    }
}




