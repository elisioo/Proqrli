using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProqrLi.Models
{

    [Table("Item")]
    public class Item
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ItemID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [MaxLength(50)]
        public string? ItemCode { get; set; }

        [Required, MaxLength(150)]
        public string ItemName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Category { get; set; }

        [MaxLength(50)]
        public string? UnitOfMeasure { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        public bool IsActive { get; set; } = true;
    }

   
    [Table("PurchaseRequisition")]
    public class PurchaseRequisition
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PRID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        public int RequestedByID { get; set; }
        [ForeignKey("RequestedByID")]
        public TenantUser? RequestedBy { get; set; }

        [MaxLength(50)]
        public string? PRNumber { get; set; }

        public DateTime RequestDate { get; set; } = DateTime.UtcNow;
        public DateTime? RequiredDate { get; set; }

        [MaxLength(100)]
        public string? Department { get; set; }

        [MaxLength(50)]
        public string? CostCenter { get; set; }

        [MaxLength(500)]
        public string? Purpose { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Draft";

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalEstimated { get; set; }
    }

 
    [Table("RequisitionItem")]
    public class RequisitionItem
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ReqItemID { get; set; }

        [ForeignKey("PurchaseRequisition")]
        public int PRID { get; set; }
        public PurchaseRequisition? PurchaseRequisition { get; set; }

        [ForeignKey("Item")]
        public int ItemID { get; set; }
        public Item? Item { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal EstimatedPrice { get; set; }

        [MaxLength(500)]
        public string? Specifications { get; set; }
    }

  
    [Table("PRApproval")]
    public class PRApproval
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ApprovalID { get; set; }

        [ForeignKey("PurchaseRequisition")]
        public int PRID { get; set; }
        public PurchaseRequisition? PurchaseRequisition { get; set; }

        public int ApproverUserID { get; set; }
        [ForeignKey("ApproverUserID")]
        public TenantUser? Approver { get; set; }

        public int ApprovalLevel { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending";

        public string? Remarks { get; set; }
        public DateTime? ActionAt { get; set; }
    }


    [Table("PurchaseOrder")]
    public class PurchaseOrder
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int POID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [ForeignKey("PurchaseRequisition")]
        public int PRID { get; set; }
        public PurchaseRequisition? PurchaseRequisition { get; set; }

        public int VendorTenantID { get; set; }
        [ForeignKey("VendorTenantID")]
        public Tenant? VendorTenant { get; set; }

        public int CreatedByUserID { get; set; }
        [ForeignKey("CreatedByUserID")]
        public TenantUser? CreatedByUser { get; set; }

        [MaxLength(50)]
        public string? PONumber { get; set; }

        public DateTime PODate { get; set; } = DateTime.UtcNow;
        public DateTime? ExpectedDelivery { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Draft";

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(100)]
        public string? PaymentTerms { get; set; }
    }


    [Table("POItem")]
    public class POItem
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int POItemID { get; set; }

        [ForeignKey("PurchaseOrder")]
        public int POID { get; set; }
        public PurchaseOrder? PurchaseOrder { get; set; }

        [ForeignKey("Item")]
        public int ItemID { get; set; }
        public Item? Item { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal LineTotal { get; set; }
    }
}
