using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;
using ProqrLi.DTOs;
using System.Security.Claims;

namespace ProqrLi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PurchaseRequisitionsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PurchaseRequisitionsController(ApplicationDbContext db) => _db = db;

      
        private int? GetSessionUserId()
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(idStr, out var id) ? id : null;
        }

        private static RequisitionDto ToDto(PurchaseRequisition r, int itemCount = 0)
        {
            return new RequisitionDto
            {
                Id          = r.PRID.ToString(),
                PrNumber    = r.PRNumber ?? "",
                Title       = r.Title ?? "",
                Justification = r.Justification ?? "",
                RequestedBy = r.RequestedBy?.FullName ?? "",
                Department  = r.Department ?? "",
                Amount      = r.TotalEstimated,
                ItemCount   = itemCount > 0 ? itemCount : r.ManualItemCount,
                Status      = r.Status,
                RaisedAt    = r.RequestDate.ToString("yyyy-MM-dd"),
                NeededBy    = r.RequiredDate?.ToString("yyyy-MM-dd") ?? "",
                IsArchived  = r.IsArchived,
            };
        }

        
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.PurchaseRequisitions
                .Include(r => r.RequestedBy)
                .Include(r => r.Tenant)
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();

           
            var prIds = list.Select(r => r.PRID).ToList();
            var counts = await _db.RequisitionItems
                .Where(ri => prIds.Contains(ri.PRID))
                .GroupBy(ri => ri.PRID)
                .Select(g => new { PRID = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.PRID, g => g.Count);

            var dtos = list.Select(r => ToDto(r, counts.GetValueOrDefault(r.PRID, 0))).ToList();
            return Ok(dtos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var pr = await _db.PurchaseRequisitions
                .Include(r => r.RequestedBy)
                .Include(r => r.Tenant)
                .FirstOrDefaultAsync(r => r.PRID == id);

            if (pr == null) return NotFound();
            var itemCount = await _db.RequisitionItems.CountAsync(ri => ri.PRID == id);
            return Ok(ToDto(pr, itemCount));
        }

       
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRequisitionDto dto)
        {
          
            var tenantId = await _db.Tenants.Select(t => t.TenantID).FirstOrDefaultAsync();
            if (tenantId == 0) tenantId = 1;


            var sessionUserId = GetSessionUserId();
            int requestedByID;

            if (sessionUserId.HasValue)
            {
                
                var sessionUser = await _db.TenantUsers
                    .FirstOrDefaultAsync(u => u.UserID == sessionUserId.Value && u.TenantID == tenantId);
                requestedByID = sessionUser?.UserID
                    ?? await _db.TenantUsers.Where(u => u.TenantID == tenantId).Select(u => u.UserID).FirstOrDefaultAsync();
            }
            else
            {
               
                requestedByID = await _db.TenantUsers.Where(u => u.TenantID == tenantId).Select(u => u.UserID).FirstOrDefaultAsync();
            }

            var pr = new PurchaseRequisition
            {
                PRNumber        = string.IsNullOrWhiteSpace(dto.PrNumber) ? $"PR-{DateTime.UtcNow.Year}-{Guid.NewGuid().ToString()[..4].ToUpper()}" : dto.PrNumber,
                Title           = dto.Title,
                Justification   = dto.Justification,
                ManualItemCount = dto.ItemCount,
                Department      = dto.Department,
                TotalEstimated  = dto.Amount,
                RequestDate     = DateTime.UtcNow,
                RequiredDate    = DateTime.TryParse(dto.NeededBy, out var nb) ? nb : DateTime.UtcNow.AddDays(14),
                Status          = "Draft",
                TenantID        = tenantId,
                RequestedByID   = requestedByID,
            };

            _db.PurchaseRequisitions.Add(pr);
            await _db.SaveChangesAsync();

            if (dto.Items != null && dto.Items.Any())
            {
                foreach (var dtoItem in dto.Items)
                {
                    var localItem = await _db.Items.FirstOrDefaultAsync(i => i.TenantID == tenantId && i.ItemName == dtoItem.Name);
                    if (localItem == null)
                    {
                        localItem = new Item
                        {
                            TenantID = tenantId,
                            ItemName = dtoItem.Name,
                            ItemCode = dtoItem.Sku,
                            Category = dtoItem.Category,
                            UnitOfMeasure = dtoItem.Uom,
                            UnitPrice = dtoItem.Price
                        };
                        _db.Items.Add(localItem);
                        await _db.SaveChangesAsync();
                    }

                    _db.RequisitionItems.Add(new RequisitionItem
                    {
                        PRID = pr.PRID,
                        ItemID = localItem.ItemID,
                        Quantity = dtoItem.Quantity,
                        EstimatedPrice = dtoItem.Price,
                        Specifications = "Sourced from Marketplace"
                    });
                }
                await _db.SaveChangesAsync();
            }

            var saved = await _db.PurchaseRequisitions
                .Include(r => r.RequestedBy)
                .FirstAsync(r => r.PRID == pr.PRID);

            return CreatedAtAction(nameof(GetById), new { id = pr.PRID }, ToDto(saved, 0));
        }

       
        [HttpPatch("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRequisitionDto dto)
        {
            var pr = await _db.PurchaseRequisitions
                .Include(r => r.RequestedBy)
                .FirstOrDefaultAsync(r => r.PRID == id);

            if (pr == null) return NotFound();

            if (dto.Title      != null) pr.Title          = dto.Title;
            if (dto.Justification != null) pr.Justification = dto.Justification;
            if (dto.Department != null) pr.Department     = dto.Department;
            if (dto.Amount     != null) pr.TotalEstimated = dto.Amount.Value;
            if (dto.ItemCount  != null) pr.ManualItemCount = dto.ItemCount.Value;
            if (dto.Status     != null) pr.Status         = dto.Status;
            if (dto.IsArchived != null) pr.IsArchived     = dto.IsArchived.Value;
            if (dto.NeededBy   != null && DateTime.TryParse(dto.NeededBy, out var nb))
                pr.RequiredDate = nb;

            await _db.SaveChangesAsync();

            var itemCount = await _db.RequisitionItems.CountAsync(ri => ri.PRID == id);
            return Ok(ToDto(pr, itemCount));
        }

    
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutUpdate(int id, [FromBody] PurchaseRequisition pr)
        {
            if (id != pr.PRID) return BadRequest("ID mismatch.");

            _db.Entry(pr).State = EntityState.Modified;
            
            _db.Entry(pr).Property(x => x.RequestDate).IsModified = false;
            _db.Entry(pr).Property(x => x.TenantID).IsModified = false;

            await _db.SaveChangesAsync();
            return Ok(pr);
        }

   
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var pr = await _db.PurchaseRequisitions.FindAsync(id);
            if (pr == null) return NotFound();

            // Soft delete
            pr.IsArchived = true;
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
