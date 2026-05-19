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

        private int GetCurrentTenantId()
        {
            var tenantIdStr = User.FindFirst("tenant_id")?.Value ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(tenantIdStr, out var tenantId) ? tenantId : 0;
        }

        private async Task<IActionResult> BuildStorefrontResponse(int vendorTenantId)
        {
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.TenantID == vendorTenantId && t.TenantType == "Vendor");

            if (tenant == null) return NotFound(new { error = "Vendor storefront not found" });

            var profile = await _context.VendorStoreProfiles
                .FirstOrDefaultAsync(p => p.VendorTenantID == vendorTenantId);

            if (profile != null && !profile.IsActive)
            {
                return NotFound(new { error = "Vendor storefront is not active" });
            }

            var listings = await _context.ProductListings
                .Include(p => p.ProductCategory)
                .Where(p => p.VendorTenantID == vendorTenantId && p.Status == "Active")
                .OrderByDescending(p => p.TotalSold)
                .ThenBy(p => p.ProductName)
                .ToListAsync();

            var productIds = listings.Select(p => p.ProductID).ToList();
            var imageDict = await _context.ProductImages
                .Where(img => img.IsPrimary && productIds.Contains(img.ProductID))
                .GroupBy(img => img.ProductID)
                .ToDictionaryAsync(g => g.Key, g => g.First().ImagePath);

            var reviewCount = await _context.ProductReviews
                .Where(r => productIds.Contains(r.ProductID))
                .CountAsync();

            var productRating = await _context.ProductReviews
                .Where(r => productIds.Contains(r.ProductID))
                .Select(r => (decimal?)r.Rating)
                .AverageAsync() ?? 0m;

            var rating = profile?.OverallRating > 0 ? profile.OverallRating : productRating;

            var categories = listings
                .Select(p => p.ProductCategory?.CategoryName)
                .Where(c => !string.IsNullOrWhiteSpace(c))
                .Distinct()
                .Take(8)
                .ToList();

            var products = listings.Select(p => new
            {
                id = p.ProductID.ToString(),
                vendorId = p.VendorTenantID.ToString(),
                vendorName = profile?.StoreName ?? tenant.CompanyName,
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
                leadTimeDays = 3,
                vendorAccredited = profile?.IsVerified ?? false,
                minOrder = p.MinOrderQty,
                description = p.Description
            }).ToList();

            return Ok(new
            {
                vendorId = tenant.TenantID.ToString(),
                companyName = tenant.CompanyName,
                industry = tenant.Industry ?? "General supplier",
                contactEmail = tenant.ContactEmail,
                contactPhone = tenant.ContactPhone,
                storeName = profile?.StoreName ?? tenant.CompanyName,
                storeSlug = profile?.StoreSlug,
                storeDescription = profile?.StoreDescription,
                logoPath = profile?.LogoPath,
                bannerPath = profile?.BannerPath,
                businessAddress = profile?.BusinessAddress,
                overallRating = rating,
                reviewCount,
                isVerified = profile?.IsVerified ?? false,
                isActive = profile?.IsActive ?? true,
                categories,
                products
            });
        }

        [HttpGet("storefront/current")]
        public async Task<IActionResult> GetCurrentStorefront()
        {
            var vendorId = GetCurrentTenantId();
            if (vendorId == 0) return Unauthorized();

            return await BuildStorefrontResponse(vendorId);
        }

        [AllowAnonymous]
        [HttpGet("storefront/{vendorKey}")]
        public async Task<IActionResult> GetStorefront(string vendorKey)
        {
            if (int.TryParse(vendorKey, out var vendorTenantId))
            {
                return await BuildStorefrontResponse(vendorTenantId);
            }

            var profile = await _context.VendorStoreProfiles
                .FirstOrDefaultAsync(p => p.StoreSlug == vendorKey);

            if (profile == null) return NotFound(new { error = "Vendor storefront not found" });

            return await BuildStorefrontResponse(profile.VendorTenantID);
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string? category = null,
            [FromQuery] string? search = null)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 12;
                if (pageSize > 100) pageSize = 100;

                var query = _context.ProductListings
                    .Include(p => p.VendorTenant)
                    .Include(p => p.ProductCategory)
                    .Where(p => p.Status == "Active")
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(category) && category != "All")
                {
                    query = query.Where(p => p.ProductCategory != null && p.ProductCategory.CategoryName == category);
                }

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var s = search.Trim().ToLower();
                    query = query.Where(p =>
                        (p.ProductName != null && p.ProductName.ToLower().Contains(s)) ||
                        (p.SKU != null && p.SKU.ToLower().Contains(s)));
                }

                var totalCount = await query.CountAsync();

                var listings = await query
                    .OrderByDescending(p => p.TotalSold)
                    .ThenBy(p => p.ProductName)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var productIds = listings.Select(p => p.ProductID).ToList();
                var imageDict = await _context.ProductImages
                    .Where(img => img.IsPrimary && productIds.Contains(img.ProductID))
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
                    leadTimeDays = 3,
                    vendorAccredited = true,
                    minOrder = p.MinOrderQty,
                    description = p.Description
                }).ToList();

                return Ok(new
                {
                    items = products,
                    totalCount,
                    page,
                    pageSize
                });
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
