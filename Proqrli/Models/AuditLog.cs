using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProqrLi.Models
{
    [Table("AuditLog")]
    public class AuditLog
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LogID { get; set; }

        public int TenantID { get; set; }

        public int UserID { get; set; }

        [Required]
        [MaxLength(150)]
        public string UserName { get; set; } = "";

        [Required]
        [MaxLength(50)]
        public string Role { get; set; } = "";

        [Required]
        [MaxLength(200)]
        public string Action { get; set; } = "";

        [Required]
        [MaxLength(50)]
        public string Module { get; set; } = "";

        [MaxLength(50)]
        public string? EntityId { get; set; }

        [MaxLength(50)]
        public string IpAddress { get; set; } = "";

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
