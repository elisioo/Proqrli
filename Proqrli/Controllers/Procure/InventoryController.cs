using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;

namespace ProqrLi.Controllers.Procure
{
    public class InventoryItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Uom { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public decimal OnHand { get; set; }
        public decimal OnOrder { get; set; }
        public decimal ReorderPoint { get; set; }
        public decimal ReorderQty { get; set; }
        public decimal UnitCost { get; set; }
        public string? PreferredVendorId { get; set; }
        public string? PreferredVendorName { get; set; }
        public bool Archived { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public InventoryController(ApplicationDbContext db) => _db = db;

        // GET: api/inventory
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            var tenantIdStr = User.FindFirstValue("tenant_id");
            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();

            // Join Item and Inventory
            var query = from item in _db.Items.Where(i => i.TenantID == tenantId)
                        join inv in _db.Inventories on item.ItemID equals inv.ItemID into invGroup
                        from inv in invGroup.DefaultIfEmpty()
                        join wh in _db.Warehouses on (inv != null ? inv.WarehouseID : 0) equals wh.WarehouseID into whGroup
                        from wh in whGroup.DefaultIfEmpty()
                        orderby item.ItemName
                        select new InventoryItemDto
                        {
                            Id = item.ItemID.ToString(),
                            Sku = item.ItemCode ?? "",
                            Name = item.ItemName,
                            Category = item.Category ?? "",
                            Uom = item.UnitOfMeasure ?? "",
                            Location = wh != null ? wh.WarehouseName : "Main Bay",
                            OnHand = inv != null ? inv.QuantityOnHand : 0,
                            OnOrder = 0,
                            ReorderPoint = inv != null ? inv.ReorderPoint : 0,
                            ReorderQty = inv != null ? inv.ReorderQuantity : 0,
                            UnitCost = item.UnitPrice,
                            Archived = !item.IsActive
                        };

            return Ok(await query.ToListAsync());
        }

        // POST: api/inventory
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] InventoryItemDto dto)
        {
            // simplified tenant fallback
            var tenantIdStr = User.FindFirstValue("tenant_id");
            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();

            if (string.IsNullOrWhiteSpace(dto.Sku))
            {
                dto.Sku = $"PRD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";
            }

            var item = new Item
            {
                ItemCode = dto.Sku,
                ItemName = dto.Name,
                Category = dto.Category,
                UnitOfMeasure = dto.Uom,
                UnitPrice = dto.UnitCost,
                IsActive = !dto.Archived,
                TenantID = tenantId
            };

            _db.Items.Add(item);
            await _db.SaveChangesAsync();

            var wh = await _db.Warehouses.FirstOrDefaultAsync(w => w.TenantID == tenantId);
            if (wh == null)
            {
                wh = new Warehouse { WarehouseName = dto.Location ?? "Main Bay", TenantID = tenantId };
                _db.Warehouses.Add(wh);
                await _db.SaveChangesAsync();
            }

            var inv = new Inventory
            {
                ItemID = item.ItemID,
                QuantityOnHand = dto.OnHand,
                ReorderPoint = dto.ReorderPoint,
                ReorderQuantity = dto.ReorderQty,
                TenantID = tenantId,
                WarehouseID = wh.WarehouseID
            };

            _db.Inventories.Add(inv);
            await _db.SaveChangesAsync();

            dto.Id = item.ItemID.ToString();
            return Ok(dto);
        }

        // PATCH: api/inventory/5
        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] InventoryItemDto dto)
        {
            if (!int.TryParse(id, out int itemId)) return BadRequest("Invalid ID format");

            var item = await _db.Items.FindAsync(itemId);
            if (item == null) return NotFound();

            item.ItemCode = dto.Sku;
            item.ItemName = dto.Name;
            item.Category = dto.Category;
            item.UnitOfMeasure = dto.Uom;
            item.UnitPrice = dto.UnitCost;
            item.IsActive = !dto.Archived;

            var inv = await _db.Inventories.FirstOrDefaultAsync(i => i.ItemID == itemId);
            if (inv != null)
            {
                inv.QuantityOnHand = dto.OnHand;
                inv.ReorderPoint = dto.ReorderPoint;
                inv.ReorderQuantity = dto.ReorderQty;
            }
            else
            {
                var wh = await _db.Warehouses.FirstOrDefaultAsync(w => w.TenantID == item.TenantID);
                _db.Inventories.Add(new Inventory
                {
                    ItemID = item.ItemID,
                    QuantityOnHand = dto.OnHand,
                    ReorderPoint = dto.ReorderPoint,
                    ReorderQuantity = dto.ReorderQty,
                    TenantID = item.TenantID,
                    WarehouseID = wh?.WarehouseID ?? 1
                });
            }

            await _db.SaveChangesAsync();
            return Ok(dto);
        }

        // DELETE: api/inventory/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Archive(string id)
        {
            if (!int.TryParse(id, out int itemId)) return BadRequest("Invalid ID format");

            var item = await _db.Items.FindAsync(itemId);
            if (item == null) return NotFound();

            item.IsActive = false; // Soft delete
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}




