using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProqrLi.Models
{
  

    [Table("EvaluationCriteria")]
    public class EvaluationCriteria
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CriteriaID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [Required, MaxLength(100)]
        public string CriteriaName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Category { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal Weight { get; set; }

        public bool IsActive { get; set; } = true;
    }

    [Table("SupplierEvaluation")]
    public class SupplierEvaluation
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EvaluationID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        public int VendorTenantID { get; set; }
        [ForeignKey("VendorTenantID")]
        public Tenant? VendorTenant { get; set; }

        public int EvaluatedByID { get; set; }
        [ForeignKey("EvaluatedByID")]
        public TenantUser? EvaluatedBy { get; set; }

        public DateTime EvaluationDate { get; set; }

        [MaxLength(50)]
        public string? Period { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal TotalScore { get; set; }

        [MaxLength(50)]
        public string? Rating { get; set; }

        public string? Remarks { get; set; }
    }

    [Table("EvaluationScore")]
    public class EvaluationScore
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ScoreID { get; set; }

        [ForeignKey("SupplierEvaluation")]
        public int EvaluationID { get; set; }
        public SupplierEvaluation? SupplierEvaluation { get; set; }

        [ForeignKey("EvaluationCriteria")]
        public int CriteriaID { get; set; }
        public EvaluationCriteria? EvaluationCriteria { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal Score { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal WeightedScore { get; set; }

        public string? Notes { get; set; }
    }

    [Table("VendorRiskScore")]
    public class VendorRiskScore
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RiskScoreID { get; set; }

        public int VendorTenantID { get; set; }
        [ForeignKey("VendorTenantID")]
        public Tenant? VendorTenant { get; set; }

        public int BuyerTenantID { get; set; }
        [ForeignKey("BuyerTenantID")]
        public Tenant? BuyerTenant { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal OnTimeDeliveryRate { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal DefectRate { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal PriceVariance { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal ComplianceViolations { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal ContractFulfillmentRate { get; set; }

        [Column(TypeName = "decimal(5,4)")]
        public decimal MLRiskScore { get; set; }

        [MaxLength(50)]
        public string? RiskClassification { get; set; }

        public DateTime ScoredAt { get; set; } = DateTime.UtcNow;
    }

    

    [Table("Contract")]
    public class Contract
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ContractID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        public int VendorTenantID { get; set; }
        [ForeignKey("VendorTenantID")]
        public Tenant? VendorTenant { get; set; }

        public int CreatedByUserID { get; set; }
        [ForeignKey("CreatedByUserID")]
        public TenantUser? CreatedByUser { get; set; }

        [MaxLength(50)]
        public string? ContractNumber { get; set; }

        [MaxLength(50)]
        public string ContractType { get; set; } = "Fixed";

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Draft";

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalValue { get; set; }

        public string? Terms { get; set; }

        [MaxLength(500)]
        public string? FilePath { get; set; }
    }

    [Table("ContractItem")]
    public class ContractItem
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ContractItemID { get; set; }

        [ForeignKey("Contract")]
        public int ContractID { get; set; }
        public Contract? Contract { get; set; }

        [ForeignKey("Item")]
        public int ItemID { get; set; }
        public Item? Item { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal AgreedUnitPrice { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal MaxQuantity { get; set; }

        [MaxLength(50)]
        public string? UnitOfMeasure { get; set; }
    }

    [Table("PriceList")]
    public class PriceList
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PriceListID { get; set; }

        public int BuyerTenantID { get; set; }
        [ForeignKey("BuyerTenantID")]
        public Tenant? BuyerTenant { get; set; }

        public int VendorTenantID { get; set; }
        [ForeignKey("VendorTenantID")]
        public Tenant? VendorTenant { get; set; }

        [MaxLength(100)]
        public string PriceListName { get; set; } = string.Empty;

        public DateTime EffectiveDate { get; set; }
        public DateTime? ExpiryDate { get; set; }

        public bool IsActive { get; set; } = true;
    }

    [Table("PriceListItem")]
    public class PriceListItem
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PriceListItemID { get; set; }

        [ForeignKey("PriceList")]
        public int PriceListID { get; set; }
        public PriceList? PriceList { get; set; }

        [ForeignKey("Item")]
        public int ItemID { get; set; }
        public Item? Item { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal DiscountPercent { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal NetPrice { get; set; }
    }


    [Table("AnalyticsSnapshot")]
    public class AnalyticsSnapshot
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SnapshotID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [MaxLength(50)]
        public string SnapshotType { get; set; } = "Monthly";

        [MaxLength(50)]
        public string? Period { get; set; }

        public int TotalPRs { get; set; }
        public int TotalPOs { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalSpend { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal AvgLeadTimeDays { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal PRApprovalRate { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal OnTimeDeliveryRate { get; set; }

        public int ActiveVendors { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("KPIMetric")]
    public class KPIMetric
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MetricID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [MaxLength(100)]
        public string MetricName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Module { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal MetricValue { get; set; }

        [MaxLength(50)]
        public string? Unit { get; set; }

        [MaxLength(50)]
        public string? Period { get; set; }

        public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    }
}
