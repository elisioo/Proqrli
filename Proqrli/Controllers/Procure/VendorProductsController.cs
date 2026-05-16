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
    public class VendorProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public VendorProductsController(ApplicationDbContext db)
        {
            _db = db;
        }

        private async Task<int> GetVendorTenantId()
        {
            var tenantIdStr = User.FindFirst("tenant_id")?.Value ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(tenantIdStr, out var tenantId)) return 0;
            return tenantId;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var vendorId = await GetVendorTenantId();
            if (vendorId == 0) return Unauthorized();

            var products = await _db.ProductListings
                .Include(p => p.ProductCategory)
                .Where(p => p.VendorTenantID == vendorId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            var productIds = products.Select(p => p.ProductID).ToList();
            var images = await _db.ProductImages
                .Where(img => img.IsPrimary && productIds.Contains(img.ProductID))
                .ToDictionaryAsync(img => img.ProductID, img => img.ImagePath);

            var result = products.Select(p => new
            {
                id = p.ProductID.ToString(),
                sku = p.SKU ?? "",
                name = p.ProductName,
                category = p.ProductCategory?.CategoryName ?? "Uncategorized",
                price = p.BasePrice,
                uom = p.UnitOfMeasure ?? "pc",
                stock = p.StockQuantity,
                status = p.Status,
                views = 0,
                orders = p.TotalSold,
                rating = p.AverageRating,
                image = images.ContainsKey(p.ProductID) ? images[p.ProductID] : "📦",
                archived = p.Status == "Archived"
            });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        {
            var vendorId = await GetVendorTenantId();
            if (vendorId == 0) return Unauthorized();

            var category = await _db.ProductCategories.FirstOrDefaultAsync(c => c.CategoryName == dto.Category);
            if (category == null)
            {
                category = new ProductCategory { CategoryName = dto.Category, IsActive = true };
                _db.ProductCategories.Add(category);
                await _db.SaveChangesAsync();
            }

            var product = new ProductListing
            {
                VendorTenantID = vendorId,
                CategoryID = category.CategoryID,
                ProductName = dto.Name,
                SKU = dto.Sku,
                BasePrice = dto.Price,
                UnitOfMeasure = dto.Uom,
                StockQuantity = dto.Stock,
                Status = dto.Status ?? "Active",
                CreatedAt = DateTime.UtcNow
            };

            _db.ProductListings.Add(product);
            await _db.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(dto.Image) && dto.Image != "📦")
            {
                _db.ProductImages.Add(new ProductImage
                {
                    ProductID = product.ProductID,
                    ImagePath = dto.Image,
                    IsPrimary = true
                });
                await _db.SaveChangesAsync();
            }

            return Ok(new
            {
                id = product.ProductID.ToString(),
                sku = product.SKU,
                name = product.ProductName,
                category = category.CategoryName,
                price = product.BasePrice,
                uom = product.UnitOfMeasure,
                stock = product.StockQuantity,
                status = product.Status,
                views = 0,
                orders = 0,
                rating = 0,
                image = dto.Image ?? "📦"
            });
        }

        [HttpPatch("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateProductDto dto)
        {
            var vendorId = await GetVendorTenantId();
            if (vendorId == 0) return Unauthorized();

            var product = await _db.ProductListings.FirstOrDefaultAsync(p => p.ProductID == id && p.VendorTenantID == vendorId);
            if (product == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.Category))
            {
                var category = await _db.ProductCategories.FirstOrDefaultAsync(c => c.CategoryName == dto.Category);
                if (category == null)
                {
                    category = new ProductCategory { CategoryName = dto.Category, IsActive = true };
                    _db.ProductCategories.Add(category);
                    await _db.SaveChangesAsync();
                }
                product.CategoryID = category.CategoryID;
            }

            if (dto.Name != null) product.ProductName = dto.Name;
            if (dto.Sku != null) product.SKU = dto.Sku;
            if (dto.Price > 0) product.BasePrice = dto.Price;
            if (dto.Uom != null) product.UnitOfMeasure = dto.Uom;
            if (dto.Stock >= 0) product.StockQuantity = dto.Stock;
            if (dto.Status != null) product.Status = dto.Status;

            await _db.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(dto.Image) && dto.Image != "📦")
            {
                var existingImage = await _db.ProductImages.FirstOrDefaultAsync(i => i.ProductID == product.ProductID && i.IsPrimary);
                if (existingImage != null)
                {
                    existingImage.ImagePath = dto.Image;
                }
                else
                {
                    _db.ProductImages.Add(new ProductImage { ProductID = product.ProductID, ImagePath = dto.Image, IsPrimary = true });
                }
                await _db.SaveChangesAsync();
            }

            var currentCategory = await _db.ProductCategories
                .Where(c => c.CategoryID == product.CategoryID)
                .Select(c => c.CategoryName)
                .FirstOrDefaultAsync();
            var currentImage = await _db.ProductImages
                .Where(i => i.ProductID == product.ProductID && i.IsPrimary)
                .Select(i => i.ImagePath)
                .FirstOrDefaultAsync();

            return Ok(new
            {
                id = product.ProductID.ToString(),
                sku = product.SKU ?? "",
                name = product.ProductName,
                category = currentCategory ?? "Uncategorized",
                price = product.BasePrice,
                uom = product.UnitOfMeasure ?? "pc",
                stock = product.StockQuantity,
                status = product.Status,
                views = 0,
                orders = product.TotalSold,
                rating = product.AverageRating,
                image = currentImage ?? "",
                archived = product.Status == "Archived"
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var vendorId = await GetVendorTenantId();
            if (vendorId == 0) return Unauthorized();

            var product = await _db.ProductListings.FirstOrDefaultAsync(p => p.ProductID == id && p.VendorTenantID == vendorId);
            if (product == null) return NotFound();

            product.Status = "Archived";
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }

    public class CreateProductDto
    {
        public string Name { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Uom { get; set; } = string.Empty;
        public int Stock { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
    }
}
