using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;

namespace ProqrLi.Controllers.Procure
{
    public class DeliveryDto
    {
        public string Id          { get; set; } = "";
        public string GrnNumber   { get; set; } = "";
        public string PoRef       { get; set; } = "";
        public string VendorName  { get; set; } = "";
        public string ReceivedAt  { get; set; } = "";
        public string ReceivedBy  { get; set; } = "";
        public int    ItemCount   { get; set; }
        public string Status      { get; set; } = "";
        public string? Notes      { get; set; }
        public string? CourierName    { get; set; }
        public string? TrackingNumber { get; set; }
    }

    public class CreateDeliveryDto
    {
        public int     POID            { get; set; }
        public string? GrnNumber       { get; set; }
        public string? ExpectedDate    { get; set; }
        public string? CourierName     { get; set; }
        public string? TrackingNumber  { get; set; }
        public string? DeliveryAddress { get; set; }
        public string? Notes           { get; set; }
    }

    public class UpdateDeliveryDto
    {
        public string? Status         { get; set; }
        public string? Notes          { get; set; }
        public string? CourierName    { get; set; }
        public string? TrackingNumber { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class DeliveriesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public DeliveriesController(ApplicationDbContext db) => _db = db;

        private static DeliveryDto ToDto(Delivery d, int itemCount = 0)
        {
            return new DeliveryDto
            {
                Id             = d.DeliveryID.ToString(),
                GrnNumber      = d.DeliveryNumber ?? "",
                PoRef          = d.PurchaseOrder?.PONumber ?? "",
                VendorName     = d.PurchaseOrder?.VendorTenant?.CompanyName ?? "",
                ReceivedAt     = d.ActualDate?.ToString("yyyy-MM-dd") ?? d.ExpectedDate?.ToString("yyyy-MM-dd") ?? "",
                ReceivedBy     = d.ReceivedBy?.FullName ?? "",
                ItemCount      = itemCount,
                Status         = d.Status,
                Notes          = null,
                CourierName    = d.CourierName,
                TrackingNumber = d.TrackingNumber,
            };
        }

        // GET /api/deliveries
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.Deliveries
                .Include(d => d.PurchaseOrder)
                    .ThenInclude(po => po!.VendorTenant)
                .Include(d => d.ReceivedBy)
                .OrderByDescending(d => d.ActualDate ?? d.ExpectedDate)
                .ToListAsync();

            var ids = list.Select(d => d.DeliveryID).ToList();
            var counts = await _db.DeliveryItems
                .Where(di => ids.Contains(di.DeliveryID))
                .GroupBy(di => di.DeliveryID)
                .Select(g => new { DeliveryID = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.DeliveryID, g => g.Count);

            return Ok(list.Select(d => ToDto(d, counts.GetValueOrDefault(d.DeliveryID, 0))).ToList());
        }

        // GET /api/deliveries/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var d = await _db.Deliveries
                .Include(d => d.PurchaseOrder)
                    .ThenInclude(po => po!.VendorTenant)
                .Include(d => d.ReceivedBy)
                .FirstOrDefaultAsync(d => d.DeliveryID == id);

            if (d == null) return NotFound();
            var count = await _db.DeliveryItems.CountAsync(di => di.DeliveryID == id);
            return Ok(ToDto(d, count));
        }

        // GET /api/deliveries/po-lookup — dropdown data for the frontend
        [HttpGet("po-lookup")]
        public async Task<IActionResult> GetPOLookup()
        {
            var pos = await _db.PurchaseOrders
                .Include(p => p.VendorTenant)
                .Where(p => p.Status != "Cancelled")
                .OrderByDescending(p => p.PODate)
                .Select(p => new { id = p.POID, label = p.PONumber + " — " + (p.VendorTenant != null ? p.VendorTenant.CompanyName : "Unknown") })
                .ToListAsync();
            return Ok(pos);
        }

        // POST /api/deliveries
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateDeliveryDto dto)
        {
            // ── FK validation ──────────────────────────────────────────────
            var po = await _db.PurchaseOrders.FindAsync(dto.POID);
            if (po == null)
                return BadRequest(new { error = $"Purchase Order with ID {dto.POID} does not exist. Please select a valid PO." });

            var tenantId = po.TenantID;

            var delivery = new Delivery
            {
                POID            = dto.POID,
                DeliveryNumber  = string.IsNullOrWhiteSpace(dto.GrnNumber)
                    ? $"GRN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}"
                    : dto.GrnNumber,
                ExpectedDate    = DateTime.TryParse(dto.ExpectedDate, out var ed) ? ed : null,
                CourierName     = dto.CourierName,
                TrackingNumber  = dto.TrackingNumber,
                DeliveryAddress = dto.DeliveryAddress,
                Status          = "Pending",
                TenantID        = tenantId,
            };

            _db.Deliveries.Add(delivery);
            await _db.SaveChangesAsync();

            // ERP Ready: Auto-generate DeliveryItems from POItems
            var poItems = await _db.POItems.Where(pi => pi.POID == dto.POID).ToListAsync();
            foreach (var item in poItems)
            {
                _db.DeliveryItems.Add(new DeliveryItem
                {
                    DeliveryID = delivery.DeliveryID,
                    POItemID = item.POItemID,
                    QuantityOrdered = item.Quantity,
                    QuantityDelivered = item.Quantity, // Assume full delivery for simplified flow
                    QuantityAccepted = 0,
                    QuantityRejected = 0
                });
            }
            await _db.SaveChangesAsync();

            var saved = await _db.Deliveries
                .Include(d => d.PurchaseOrder)
                    .ThenInclude(p => p!.VendorTenant)
                .Include(d => d.ReceivedBy)
                .FirstAsync(d => d.DeliveryID == delivery.DeliveryID);

            return CreatedAtAction(nameof(GetById), new { id = delivery.DeliveryID }, ToDto(saved, poItems.Count));
        }

        // PATCH /api/deliveries/5
        [HttpPatch("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDeliveryDto dto)
        {
            var d = await _db.Deliveries
                .Include(d => d.PurchaseOrder)
                    .ThenInclude(po => po!.VendorTenant)
                .Include(d => d.ReceivedBy)
                .FirstOrDefaultAsync(d => d.DeliveryID == id);

            if (d == null) return NotFound();

            if (dto.Status         != null) d.Status         = dto.Status;
            if (dto.CourierName    != null) d.CourierName     = dto.CourierName;
            if (dto.TrackingNumber != null) d.TrackingNumber  = dto.TrackingNumber;

            // ERP Ready: Auto-update inventory when Accepted
            if (dto.Status != null && (dto.Status == "Accepted" || dto.Status == "Partially Accepted") && d.ActualDate == null)
            {
                d.ActualDate = DateTime.UtcNow;

                var items = await _db.DeliveryItems
                    .Include(di => di.POItem)
                    .Where(di => di.DeliveryID == id)
                    .ToListAsync();

                var defaultWarehouse = await _db.Warehouses.FirstOrDefaultAsync(w => w.TenantID == d.TenantID);

                foreach (var di in items)
                {
                    // For the simplified flow, accept the full delivered amount
                    di.QuantityAccepted = di.QuantityDelivered;

                    if (defaultWarehouse != null && di.POItem != null)
                    {
                        var inventory = await _db.Inventories
                            .FirstOrDefaultAsync(inv => inv.ItemID == di.POItem.ItemID && inv.WarehouseID == defaultWarehouse.WarehouseID);

                        if (inventory == null)
                        {
                            inventory = new Inventory
                            {
                                TenantID = d.TenantID,
                                ItemID = di.POItem.ItemID,
                                WarehouseID = defaultWarehouse.WarehouseID,
                                QuantityOnHand = 0
                            };
                            _db.Inventories.Add(inventory);
                        }

                        inventory.QuantityOnHand += di.QuantityAccepted;
                        inventory.LastUpdated = DateTime.UtcNow;

                        _db.StockMovements.Add(new StockMovement
                        {
                            InventoryID = inventory.InventoryID,
                            UserID = d.ReceivedByID ?? d.PurchaseOrder?.CreatedByUserID ?? 1,
                            MovementType = "IN",
                            Quantity = di.QuantityAccepted,
                            ReferenceType = "GRN",
                            ReferenceID = d.DeliveryNumber,
                            MovedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            await _db.SaveChangesAsync();
            var count = await _db.DeliveryItems.CountAsync(di => di.DeliveryID == id);
            return Ok(ToDto(d, count));
        }

        // DELETE /api/deliveries/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var d = await _db.Deliveries.FindAsync(id);
            if (d == null) return NotFound();

            d.Status = "Cancelled";
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
