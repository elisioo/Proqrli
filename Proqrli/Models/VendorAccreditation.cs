using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProqrLi.Models
{

    [Table("AccreditationLink")]
    public class AccreditationLink
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LinkID { get; set; }

        public int BuyerTenantID { get; set; }
        [ForeignKey("BuyerTenantID")]
        public Tenant? BuyerTenant { get; set; }

        public int VendorTenantID { get; set; }
        [ForeignKey("VendorTenantID")]
        public Tenant? VendorTenant { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending";

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ApprovedAt { get; set; }

        public int? ApprovedByUserID { get; set; }
        [ForeignKey("ApprovedByUserID")]
        public TenantUser? ApprovedByUser { get; set; }

        public string? Remarks { get; set; }
    }

    [Table("VendorDocument")]
    public class VendorDocument
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DocumentID { get; set; }

        [ForeignKey("Tenant")]
        public int VendorTenantID { get; set; }
        public Tenant? VendorTenant { get; set; }

        [MaxLength(100)]
        public string DocumentType { get; set; } = string.Empty;

        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;

        public DateTime? ExpiryDate { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending";

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }


    [Table("VendorBankDetail")]
    public class VendorBankDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BankDetailID { get; set; }

        [ForeignKey("Tenant")]
        public int VendorTenantID { get; set; }
        public Tenant? VendorTenant { get; set; }

        [MaxLength(100)]
        public string BankName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string AccountNumber { get; set; } = string.Empty;

        [MaxLength(100)]
        public string AccountName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? BranchCode { get; set; }
    }
}
