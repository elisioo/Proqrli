using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProqrLi.Models
{
    
    [Table("Conversation")]
    public class Conversation
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ConversationID { get; set; }

        public int BuyerTenantID { get; set; }
        [ForeignKey("BuyerTenantID")]
        public Tenant? BuyerTenant { get; set; }

        public int VendorTenantID { get; set; }
        [ForeignKey("VendorTenantID")]
        public Tenant? VendorTenant { get; set; }

        public int? ProductID { get; set; }
        [ForeignKey("ProductID")]
        public ProductListing? ProductListing { get; set; }

        [MaxLength(255)]
        public string? Subject { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Open";

        public DateTime? LastMessageAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

   
    [Table("Message")]
    public class Message
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MessageID { get; set; }

        [ForeignKey("Conversation")]
        public int ConversationID { get; set; }
        public Conversation? Conversation { get; set; }

        public int SenderUserID { get; set; }
        [ForeignKey("SenderUserID")]
        public TenantUser? SenderUser { get; set; }

        [MaxLength(50)]
        public string? SenderTenantType { get; set; }

        public string? Body { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }

 
    [Table("MessageAttachment")]
    public class MessageAttachment
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AttachmentID { get; set; }

        [ForeignKey("Message")]
        public int MessageID { get; set; }
        public Message? Message { get; set; }

        [Required, MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required, MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? FileType { get; set; }

        public int FileSizeBytes { get; set; }
    }
}
