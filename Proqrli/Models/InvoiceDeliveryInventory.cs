using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProqrLi.Models
{
  

    [Table("Invoice")]
    public class Invoice
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int InvoiceID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [ForeignKey("PurchaseOrder")]
        public int POID { get; set; }
        public PurchaseOrder? PurchaseOrder { get; set; }

        public int VendorTenantID { get; set; }
        [ForeignKey("VendorTenantID")]
        public Tenant? VendorTenant { get; set; }

        [MaxLength(50)]
        public string? InvoiceNumber { get; set; }

        public DateTime InvoiceDate { get; set; }
        public DateTime DueDate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending";
    }

    [Table("InvoiceLineItem")]
    public class InvoiceLineItem
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LineItemID { get; set; }

        [ForeignKey("Invoice")]
        public int InvoiceID { get; set; }
        public Invoice? Invoice { get; set; }

        [ForeignKey("Item")]
        public int ItemID { get; set; }
        public Item? Item { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal LineTotal { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal TaxRate { get; set; }
    }

    [Table("PaymentTenant")]
    public class PaymentTenant
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PaymentID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [ForeignKey("Invoice")]
        public int InvoiceID { get; set; }
        public Invoice? Invoice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal AmountPaid { get; set; }

        public DateTime PaymentDate { get; set; }

        [MaxLength(50)]
        public string? PaymentMethod { get; set; }

        [MaxLength(100)]
        public string? Reference { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending";

        public int? ProcessedByID { get; set; }
        [ForeignKey("ProcessedByID")]
        public TenantUser? ProcessedBy { get; set; }
    }

    [Table("Delivery")]
    public class Delivery
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DeliveryID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [ForeignKey("PurchaseOrder")]
        public int POID { get; set; }
        public PurchaseOrder? PurchaseOrder { get; set; }

        [MaxLength(50)]
        public string? DeliveryNumber { get; set; }

        public DateTime? ExpectedDate { get; set; }
        public DateTime? ActualDate { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending";

        [MaxLength(100)]
        public string? CourierName { get; set; }

        [MaxLength(100)]
        public string? TrackingNumber { get; set; }

        [MaxLength(255)]
        public string? DeliveryAddress { get; set; }

        public int? ReceivedByID { get; set; }
        [ForeignKey("ReceivedByID")]
        public TenantUser? ReceivedBy { get; set; }
    }

    [Table("DeliveryItem")]
    public class DeliveryItem
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DeliveryItemID { get; set; }

        [ForeignKey("Delivery")]
        public int DeliveryID { get; set; }
        public Delivery? Delivery { get; set; }

        [ForeignKey("POItem")]
        public int POItemID { get; set; }
        public POItem? POItem { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal QuantityOrdered { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal QuantityDelivered { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal QuantityAccepted { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal QuantityRejected { get; set; }

        [MaxLength(255)]
        public string? RejectionReason { get; set; }
    }

    [Table("ShipmentTracking")]
    public class ShipmentTracking
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TrackingID { get; set; }

        [ForeignKey("Delivery")]
        public int DeliveryID { get; set; }
        public Delivery? Delivery { get; set; }

        [MaxLength(255)]
        public string? Location { get; set; }

        [MaxLength(100)]
        public string? Status { get; set; }

        public string? Notes { get; set; }
        public DateTime TrackedAt { get; set; } = DateTime.UtcNow;
    }

  

    [Table("Warehouse")]
    public class Warehouse
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int WarehouseID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [Required, MaxLength(100)]
        public string WarehouseName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Location { get; set; }

        public bool IsActive { get; set; } = true;
    }

    [Table("Inventory")]
    public class Inventory
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int InventoryID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [ForeignKey("Item")]
        public int ItemID { get; set; }
        public Item? Item { get; set; }

        [ForeignKey("Warehouse")]
        public int WarehouseID { get; set; }
        public Warehouse? Warehouse { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal QuantityOnHand { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal QuantityReserved { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal ReorderPoint { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal ReorderQuantity { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal MinimumStock { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal MaximumStock { get; set; }

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }

    [Table("StockMovement")]
    public class StockMovement
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MovementID { get; set; }

        [ForeignKey("Inventory")]
        public int InventoryID { get; set; }
        public Inventory? Inventory { get; set; }

        [ForeignKey("TenantUser")]
        public int UserID { get; set; }
        public TenantUser? TenantUser { get; set; }

        [MaxLength(50)]
        public string MovementType { get; set; } = "IN";

        [Column(TypeName = "decimal(18,4)")]
        public decimal Quantity { get; set; }

        [MaxLength(50)]
        public string? ReferenceType { get; set; }

        [MaxLength(100)]
        public string? ReferenceID { get; set; }

        public string? Remarks { get; set; }
        public DateTime MovedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("ReorderAlert")]
    public class ReorderAlert
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AlertID { get; set; }

        [ForeignKey("Inventory")]
        public int InventoryID { get; set; }
        public Inventory? Inventory { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [MaxLength(50)]
        public string AlertType { get; set; } = "LowStock";

        [MaxLength(50)]
        public string Status { get; set; } = "Open";

        public DateTime TriggeredAt { get; set; } = DateTime.UtcNow;
        public DateTime? AcknowledgedAt { get; set; }

        public int? AcknowledgedByID { get; set; }
        [ForeignKey("AcknowledgedByID")]
        public TenantUser? AcknowledgedBy { get; set; }
    }
}
