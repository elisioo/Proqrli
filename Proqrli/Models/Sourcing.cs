using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProqrLi.Models
{
    [Table("RequestForQuotation")]
    public class RequestForQuotation
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RFQID { get; set; }

        [ForeignKey("Tenant")]
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        [ForeignKey("PurchaseRequisition")]
        public int? LinkedPRID { get; set; }
        public PurchaseRequisition? PurchaseRequisition { get; set; }

        public int CreatedByUserID { get; set; }
        [ForeignKey("CreatedByUserID")]
        public TenantUser? CreatedByUser { get; set; }

        [MaxLength(50)]
        public string? RFQNumber { get; set; }

        [Required, MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Category { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime ClosesAt { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Draft"; // Draft, Open, Closed, Awarded, Cancelled

        public string? Notes { get; set; }
        
        [MaxLength(50)]
        public string SourcingRoute { get; set; } = "rfq"; // rfq, direct-po

        public ICollection<RfqVendorInvitation> VendorInvitations { get; set; } = new List<RfqVendorInvitation>();
        public ICollection<RfqMessage> Messages { get; set; } = new List<RfqMessage>();
    }

    /// <summary>
    /// Private per-RFQ, per-vendor message thread between buyer and one vendor.
    /// Key: RFQID + VendorTenantID — identifies which conversation this belongs to.
    /// SenderType is "buyer" | "vendor" so the UI can render left/right bubbles.
    /// </summary>
    [Table("RfqMessage")]
    public class RfqMessage
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MessageID { get; set; }

        [ForeignKey("RequestForQuotation")]
        public int RFQID { get; set; }
        public RequestForQuotation? RequestForQuotation { get; set; }

        /// <summary>The vendor side of this thread (scopes the message to one vendor).</summary>
        public int VendorTenantID { get; set; }
        [ForeignKey("VendorTenantID")]
        public Tenant? VendorTenant { get; set; }

        /// <summary>"buyer" or "vendor" — determines message bubble alignment in the UI.</summary>
        [Required, MaxLength(10)]
        public string SenderType { get; set; } = "buyer";

        [Required]
        public string Body { get; set; } = string.Empty;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }

    [Table("RfqVendorInvitation")]
    public class RfqVendorInvitation
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int InvitationID { get; set; }

        [ForeignKey("RequestForQuotation")]
        public int RFQID { get; set; }
        public RequestForQuotation? RequestForQuotation { get; set; }

        public int VendorTenantID { get; set; }
        [ForeignKey("VendorTenantID")]
        public Tenant? VendorTenant { get; set; }

        public DateTime InvitedAt { get; set; } = DateTime.UtcNow;
        
        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Quoted, Declined

        public bool HasResponded { get; set; } = false;
    }

    [Table("RfqResponse")]
    public class RfqResponse
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ResponseID { get; set; }

        [ForeignKey("RequestForQuotation")]
        public int RFQID { get; set; }
        public RequestForQuotation? RequestForQuotation { get; set; }

        public int VendorTenantID { get; set; }
        [ForeignKey("VendorTenantID")]
        public Tenant? VendorTenant { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(50)]
        public string Status { get; set; } = "Submitted"; // Submitted, Shortlisted, Awarded, Rejected

        public string? Remarks { get; set; }
    }
}
