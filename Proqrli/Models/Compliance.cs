using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProqrLi.Models
{
    
    [Table("DocumentCategory")]
    public class DocumentCategory
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CategoryID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [Required, MaxLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Description { get; set; }

        public bool RequiresExpiry { get; set; } = false;
    }

   
    [Table("ComplianceDocument")]
    public class ComplianceDocument
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DocID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [ForeignKey("DocumentCategory")]
        public int CategoryID { get; set; }
        public DocumentCategory? DocumentCategory { get; set; }

        public int UploadedByID { get; set; }
        [ForeignKey("UploadedByID")]
        public TenantUser? UploadedBy { get; set; }

        [Required, MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? DocumentNumber { get; set; }

        [MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? RelatedModule { get; set; }

        [MaxLength(100)]
        public string? RelatedRecordID { get; set; }

        public DateTime? IssuedDate { get; set; }
        public DateTime? ExpiryDate { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Active";

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("ComplianceChecklist")]
    public class ComplianceChecklist
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ChecklistID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [Required, MaxLength(100)]
        public string ChecklistName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? ApplicableTo { get; set; }

        public bool IsActive { get; set; } = true;
    }


    [Table("ChecklistItem")]
    public class ChecklistItem
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CheckItemID { get; set; }

        [ForeignKey("ComplianceChecklist")]
        public int ChecklistID { get; set; }
        public ComplianceChecklist? ComplianceChecklist { get; set; }

        [Required, MaxLength(255)]
        public string ItemDescription { get; set; } = string.Empty;

        public bool IsRequired { get; set; } = true;
        public int SortOrder { get; set; }
    }


    [Table("ComplianceCheckResult")]
    public class ComplianceCheckResult
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ResultID { get; set; }

        [ForeignKey("ComplianceChecklist")]
        public int ChecklistID { get; set; }
        public ComplianceChecklist? ComplianceChecklist { get; set; }

        [ForeignKey("ChecklistItem")]
        public int CheckItemID { get; set; }
        public ChecklistItem? ChecklistItem { get; set; }

        [MaxLength(100)]
        public string? RelatedRecordID { get; set; }

        public bool IsCompliant { get; set; }
        public string? Notes { get; set; }

        public int CheckedByID { get; set; }
        [ForeignKey("CheckedByID")]
        public TenantUser? CheckedBy { get; set; }

        public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
    }
}
