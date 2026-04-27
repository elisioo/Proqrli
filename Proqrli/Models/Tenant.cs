using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProqrLi.Models
{
    
    public enum TenantCategory
    {
        Buyer,
        Vendor
    }

    public enum TenantStatus
    {
        Active,
        Suspended,
        Inactive
    }

    public enum CompanySizeRange
    {
        Micro,       // 1–10
        Small,       // 11–50
        Medium,      // 51–200
        Large,       // 201–500
        Enterprise   // 500+
    }

    
    [Table("Tenant")]
    public class Tenant
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TenantID { get; set; }

        [Required]
        [MaxLength(50)]
        public string TenantType { get; set; } = nameof(TenantCategory.Buyer);
        //public string TenantType { get; set; } = nameof(global::ProqrLi.Models.TenantType.Buyer);

        [Required]
        [MaxLength(150)]
        public string CompanyName { get; set; } = "";

        [MaxLength(100)]
        public string? Industry { get; set; }

        [MaxLength(50)]
        public string? CompanySize { get; set; }

        [MaxLength(100)]
        public string? ContactEmail { get; set; }

        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = nameof(TenantStatus.Active);

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}