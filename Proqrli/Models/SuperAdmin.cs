using Proqrli.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProqrLi.Models
{
   
    [Table("PlatformUser")]
    public class PlatformUser
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PlatformUserID { get; set; }

        [Required, MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Role { get; set; } = "SuperAdmin";

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("PlatformAuditLog")]
    public class PlatformAuditLog
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LogID { get; set; }

        [ForeignKey("PlatformUser")]
        public int PlatformUserID { get; set; }
        public PlatformUser? PlatformUser { get; set; }

        [Required, MaxLength(100)]
        public string Action { get; set; } = string.Empty;

        [MaxLength(45)]
        public string? IPAddress { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

   
    [Table("SubscriptionPlan")]
    public class SubscriptionPlan
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PlanID { get; set; }

        [Required, MaxLength(100)]
        public string PlanName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string ApplicableTo { get; set; } = "BUYER";

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public int MaxUsers { get; set; } = -1;

        public string? Features { get; set; }  // JSON blob

        public bool IsActive { get; set; } = true;
    }

  
    [Table("TenantSubscription")]
    public class TenantSubscription
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SubscriptionID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [ForeignKey("SubscriptionPlan")]
        public int PlanID { get; set; }
        public SubscriptionPlan? SubscriptionPlan { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Active";

        public bool IsTrialPeriod { get; set; } = false;
    }

    [Table("Billing")]
    public class Billing
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BillingID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public DateTime BillingDate { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending";
    }

    
    [Table("SubscriptionPayment")]
    public class SubscriptionPayment
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PaymentID { get; set; }

        [ForeignKey("Billing")]
        public int BillingID { get; set; }
        public Billing? Billing { get; set; }

        [MaxLength(50)]
        public string PaymentMethod { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Reference { get; set; }

        public DateTime PaidAt { get; set; } = DateTime.UtcNow;
    }
}