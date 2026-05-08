using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ProqrLi.Models;
using System.Collections.Generic;

namespace ProqrLi.Controllers.Procure
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MarketplaceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MarketplaceController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts()
        {
            try
            {
                var listings = await _context.ProductListings
                    .Include(p => p.VendorTenant)
                    .Include(p => p.ProductCategory)
                    .Where(p => p.Status == "Active")
                    .ToListAsync();

                // Fetch images separately or join
                var imageDict = await _context.ProductImages
                    .Where(img => img.IsPrimary)
                    .GroupBy(img => img.ProductID)
                    .ToDictionaryAsync(g => g.Key, g => g.First().ImagePath);

                var products = listings.Select(p => new
                {
                    id = p.ProductID.ToString(),
                    vendorId = p.VendorTenantID.ToString(),
                    vendorName = p.VendorTenant?.CompanyName ?? "Unknown Vendor",
                    sku = p.SKU ?? "",
                    name = p.ProductName,
                    category = p.ProductCategory?.CategoryName ?? "Uncategorized",
                    price = p.BasePrice,
                    uom = p.UnitOfMeasure ?? "Unit",
                    inStock = p.StockQuantity > 0,
                    stock = p.StockQuantity,
                    reorderPoint = 5,
                    rating = p.AverageRating,
                    image = imageDict.ContainsKey(p.ProductID) ? imageDict[p.ProductID] : null,
                    leadTimeDays = 3, // Dummy, can add to DB later
                    vendorAccredited = true, // We could fetch from VendorStoreProfile or VendorAccreditation
                    minOrder = p.MinOrderQty,
                    description = p.Description
                }).ToList();

                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var categories = await _context.ProductCategories
                    .Where(c => c.IsActive)
                    .Select(c => c.CategoryName)
                    .Distinct()
                    .ToListAsync();

                if (!categories.Any())
                {
                    categories = new List<string> { "Bearings", "Hydraulics", "Chemicals", "Fasteners", "Pneumatics", "Electrical", "Tools" };
                }

                categories.Insert(0, "All");
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
