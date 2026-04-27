using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProqrLi.Models
{

    [Table("VendorStoreProfile")]
    public class VendorStoreProfile
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int StoreProfileID { get; set; }

        [ForeignKey("Tenant")]
        public int VendorTenantID { get; set; }
        public Tenant? VendorTenant { get; set; }

        [Required, MaxLength(150)]
        public string StoreName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? StoreSlug { get; set; }

        public string? StoreDescription { get; set; }

        [MaxLength(500)]
        public string? LogoPath { get; set; }

        [MaxLength(500)]
        public string? BannerPath { get; set; }

        [MaxLength(255)]
        public string? BusinessAddress { get; set; }

        [Column(TypeName = "decimal(3,2)")]
        public decimal OverallRating { get; set; }

        public bool IsVerified { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }


    [Table("ProductCategory")]
    public class ProductCategory
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CategoryID { get; set; }

        public int? ParentCategoryID { get; set; }
        [ForeignKey("ParentCategoryID")]
        public ProductCategory? ParentCategory { get; set; }

        [Required, MaxLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Description { get; set; }

        [MaxLength(500)]
        public string? IconPath { get; set; }

        public bool IsActive { get; set; } = true;
    }

 
    [Table("ProductListing")]
    public class ProductListing
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProductID { get; set; }

        [ForeignKey("Tenant")]
        public int VendorTenantID { get; set; }
        public Tenant? VendorTenant { get; set; }

        [ForeignKey("ProductCategory")]
        public int CategoryID { get; set; }
        public ProductCategory? ProductCategory { get; set; }

        [Required, MaxLength(150)]
        public string ProductName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? SKU { get; set; }

        public string? Description { get; set; }

        [MaxLength(50)]
        public string? ProductType { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal BasePrice { get; set; }

        [MaxLength(50)]
        public string? UnitOfMeasure { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal MinOrderQty { get; set; } = 1;

        public int StockQuantity { get; set; }

        [Column(TypeName = "decimal(10,3)")]
        public decimal? Weight { get; set; }

        [MaxLength(100)]
        public string? Dimensions { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Active";

        [Column(TypeName = "decimal(3,2)")]
        public decimal AverageRating { get; set; }

        public int TotalSold { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }


    [Table("ProductVariant")]
    public class ProductVariant
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int VariantID { get; set; }

        [ForeignKey("ProductListing")]
        public int ProductID { get; set; }
        public ProductListing? ProductListing { get; set; }

        [Required, MaxLength(100)]
        public string VariantName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? VariantSKU { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PriceAdjustment { get; set; }

        public int StockQuantity { get; set; }
        public bool IsActive { get; set; } = true;
    }

    [Table("ProductImage")]
    public class ProductImage
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ImageID { get; set; }

        [ForeignKey("ProductListing")]
        public int ProductID { get; set; }
        public ProductListing? ProductListing { get; set; }

        [Required, MaxLength(500)]
        public string ImagePath { get; set; } = string.Empty;

        public bool IsPrimary { get; set; } = false;
        public int SortOrder { get; set; }
    }


    [Table("MarketplaceOrder")]
    public class MarketplaceOrder
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int OrderID { get; set; }

        public int BuyerTenantID { get; set; }
        [ForeignKey("BuyerTenantID")]
        public Tenant? BuyerTenant { get; set; }

        public int VendorTenantID { get; set; }
        [ForeignKey("VendorTenantID")]
        public Tenant? VendorTenant { get; set; }

        public int PlacedByUserID { get; set; }
        [ForeignKey("PlacedByUserID")]
        public TenantUser? PlacedByUser { get; set; }

        [MaxLength(50)]
        public string? OrderNumber { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingFee { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(255)]
        public string? ShippingAddress { get; set; }

        [MaxLength(50)]
        public string? PaymentMethod { get; set; }

        [MaxLength(50)]
        public string PaymentStatus { get; set; } = "Pending";

        [MaxLength(50)]
        public string OrderStatus { get; set; } = "Pending";

        public string? BuyerNote { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }


    [Table("OrderItem")]
    public class OrderItem
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int OrderItemID { get; set; }

        [ForeignKey("MarketplaceOrder")]
        public int OrderID { get; set; }
        public MarketplaceOrder? MarketplaceOrder { get; set; }

        [ForeignKey("ProductListing")]
        public int ProductID { get; set; }
        public ProductListing? ProductListing { get; set; }

        public int? VariantID { get; set; }
        [ForeignKey("VariantID")]
        public ProductVariant? ProductVariant { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal LineTotal { get; set; }
    }


    [Table("OrderShipment")]
    public class OrderShipment
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ShipmentID { get; set; }

        [ForeignKey("MarketplaceOrder")]
        public int OrderID { get; set; }
        public MarketplaceOrder? MarketplaceOrder { get; set; }

        public int? PackedByUserID { get; set; }
        [ForeignKey("PackedByUserID")]
        public TenantUser? PackedByUser { get; set; }

        [MaxLength(100)]
        public string? CourierName { get; set; }

        [MaxLength(100)]
        public string? TrackingNumber { get; set; }

        public DateTime? ShippedDate { get; set; }
        public DateTime? EstimatedArrival { get; set; }
        public DateTime? DeliveredDate { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Preparing";
    }

   
    [Table("ShipmentEvent")]
    public class ShipmentEvent
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EventID { get; set; }

        [ForeignKey("OrderShipment")]
        public int ShipmentID { get; set; }
        public OrderShipment? OrderShipment { get; set; }

        [MaxLength(255)]
        public string? Location { get; set; }

        [MaxLength(255)]
        public string? EventDescription { get; set; }

        public DateTime EventAt { get; set; } = DateTime.UtcNow;
    }

    [Table("ProductReview")]
    public class ProductReview
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ReviewID { get; set; }

        [ForeignKey("ProductListing")]
        public int ProductID { get; set; }
        public ProductListing? ProductListing { get; set; }

        [ForeignKey("OrderItem")]
        public int OrderItemID { get; set; }
        public OrderItem? OrderItem { get; set; }

        public int BuyerTenantID { get; set; }
        [ForeignKey("BuyerTenantID")]
        public Tenant? BuyerTenant { get; set; }

        public int ReviewedByUserID { get; set; }
        [ForeignKey("ReviewedByUserID")]
        public TenantUser? ReviewedByUser { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        public string? ReviewText { get; set; }
        public bool IsVerifiedPurchase { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
