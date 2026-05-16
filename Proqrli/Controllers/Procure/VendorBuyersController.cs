using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ProqrLi.Models;

namespace ProqrLi.Controllers.Procure
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VendorBuyersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public VendorBuyersController(ApplicationDbContext db)
        {
            _db = db;
        }

        private int GetVendorTenantId()
        {
            var tenantIdStr = User.FindFirstValue("tenant_id") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(tenantIdStr, out var tenantId)) return 0;
            return tenantId;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var vendorId = GetVendorTenantId();
            if (vendorId == 0) return Unauthorized();

            var links = await _db.AccreditationLinks
                .Include(a => a.BuyerTenant)
                .Where(a => a.VendorTenantID == vendorId)
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();

            // Calculate spend and order count for approved buyers
            var buyerIds = links.Where(l => l.Status == "Accredited").Select(l => l.BuyerTenantID).ToList();
            
            var poCounts = await _db.PurchaseOrders
                .Where(po => po.VendorTenantID == vendorId && buyerIds.Contains(po.TenantID))
                .GroupBy(po => po.TenantID)
                .Select(g => new { BuyerTenantID = g.Key, Count = g.Count(), Total = g.Sum(po => po.TotalAmount) })
                .ToDictionaryAsync(g => g.BuyerTenantID, g => new { g.Count, g.Total });

            var result = links.Select(l => 
            {
                var poData = poCounts.GetValueOrDefault(l.BuyerTenantID);
                return new 
                {
                    id = l.LinkID.ToString(),
                    companyName = l.BuyerTenant?.CompanyName ?? "Unknown Buyer",
                    industry = l.BuyerTenant?.Industry ?? "Unknown",
                    status = l.Status == "Accredited" ? "Approved" : l.Status,
                    appliedAt = l.AppliedAt.ToString("MMM dd, yyyy"),
                    orderCount = poData?.Count ?? 0,
                    totalSpend = poData?.Total ?? 0,
                    initials = l.BuyerTenant?.CompanyName?.Substring(0, 2).ToUpper() ?? "??"
                };
            });

            return Ok(result);
        }

        [HttpPost("{id:int}/accept")]
        public async Task<IActionResult> Accept(int id)
        {
            var vendorId = GetVendorTenantId();
            if (vendorId == 0) return Unauthorized();

            var link = await _db.AccreditationLinks.FirstOrDefaultAsync(l => l.LinkID == id && l.VendorTenantID == vendorId);
            if (link == null) return NotFound();

            link.Status = "Accredited";
            link.ApprovedAt = DateTime.UtcNow;
            
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(userIdStr, out var userId)) {
                link.ApprovedByUserID = userId;
            }

            await _db.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpPost("{id:int}/reject")]
        public async Task<IActionResult> Reject(int id)
        {
            var vendorId = GetVendorTenantId();
            if (vendorId == 0) return Unauthorized();

            var link = await _db.AccreditationLinks.FirstOrDefaultAsync(l => l.LinkID == id && l.VendorTenantID == vendorId);
            if (link == null) return NotFound();

            link.Status = "Rejected"; 
            await _db.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }
}
