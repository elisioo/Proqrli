using Microsoft.EntityFrameworkCore;
using ProqrLi.Models;

namespace ProqrLi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // ── Super Admin
        public DbSet<PlatformUser> PlatformUsers { get; set; }
        public DbSet<PlatformAuditLog> PlatformAuditLogs { get; set; }
        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        public DbSet<TenantSubscription> TenantSubscriptions { get; set; }
        public DbSet<Billing> Billings { get; set; }
        public DbSet<SubscriptionPayment> SubscriptionPayments { get; set; }

        // ── Auth
        public DbSet<TenantUser> TenantUsers { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<TenantAuditLog> TenantAuditLogs { get; set; }

        // ── Module 1: Vendor Accreditation
        public DbSet<AccreditationLink> AccreditationLinks { get; set; }
        public DbSet<VendorDocument> VendorDocuments { get; set; }
        public DbSet<VendorBankDetail> VendorBankDetails { get; set; }

        // ── Module 2: Procurement
        public DbSet<Item> Items { get; set; }
        public DbSet<PurchaseRequisition> PurchaseRequisitions { get; set; }
        public DbSet<RequisitionItem> RequisitionItems { get; set; }
        public DbSet<PRApproval> PRApprovals { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        public DbSet<POItem> POItems { get; set; }

        // ── Module 3: Supplier Evaluation
        public DbSet<EvaluationCriteria> EvaluationCriterias { get; set; }
        public DbSet<SupplierEvaluation> SupplierEvaluations { get; set; }
        public DbSet<EvaluationScore> EvaluationScores { get; set; }
        public DbSet<VendorRiskScore> VendorRiskScores { get; set; }

        // ── Module 4: Contract & Pricing
        public DbSet<Contract> Contracts { get; set; }
        public DbSet<ContractItem> ContractItems { get; set; }
        public DbSet<PriceList> PriceLists { get; set; }
        public DbSet<PriceListItem> PriceListItems { get; set; }

        // ── Module 5: Analytics
        public DbSet<AnalyticsSnapshot> AnalyticsSnapshots { get; set; }
        public DbSet<KPIMetric> KPIMetrics { get; set; }

        // ── Module 6: Invoice & Payment
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceLineItem> InvoiceLineItems { get; set; }
        public DbSet<PaymentTenant> PaymentTenants { get; set; }

        // ── Module 7: Delivery & Logistics
        public DbSet<Delivery> Deliveries { get; set; }
        public DbSet<DeliveryItem> DeliveryItems { get; set; }
        public DbSet<ShipmentTracking> ShipmentTrackings { get; set; }

        // ── Module 8: Inventory
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<StockMovement> StockMovements { get; set; }
        public DbSet<ReorderAlert> ReorderAlerts { get; set; }

        // ── Module 9: Compliance
        public DbSet<DocumentCategory> DocumentCategories { get; set; }
        public DbSet<ComplianceDocument> ComplianceDocuments { get; set; }
        public DbSet<ComplianceChecklist> ComplianceChecklists { get; set; }
        public DbSet<ChecklistItem> ChecklistItems { get; set; }
        public DbSet<ComplianceCheckResult> ComplianceCheckResults { get; set; }

        // ── Module 11: Marketplace
        public DbSet<VendorStoreProfile> VendorStoreProfiles { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }
        public DbSet<ProductListing> ProductListings { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<MarketplaceOrder> MarketplaceOrders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<OrderShipment> OrderShipments { get; set; }
        public DbSet<ShipmentEvent> ShipmentEvents { get; set; }
        public DbSet<ProductReview> ProductReviews { get; set; }

        // ── Module 12: Messaging
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<MessageAttachment> MessageAttachments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ════════════════════════════════════════════════════════════════════
            // SECTION 1 — TenantUser references
            // Any FK pointing at TenantUser must be Restrict if the same table
            // also has another path back to Tenant through cascade.
            // ════════════════════════════════════════════════════════════════════

            modelBuilder.Entity<AccreditationLink>()
                .HasOne(a => a.ApprovedByUser)
                .WithMany()
                .HasForeignKey(a => a.ApprovedByUserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ComplianceDocument>()
                .HasOne(d => d.UploadedBy)
                .WithMany()
                .HasForeignKey(d => d.UploadedByID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ComplianceDocument>()
                .HasOne(d => d.Tenant)
                .WithMany()
                .HasForeignKey(d => d.TenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Contract>()
                .HasOne(c => c.CreatedByUser)
                .WithMany()
                .HasForeignKey(c => c.CreatedByUserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MarketplaceOrder>()
                .HasOne(o => o.PlacedByUser)
                .WithMany()
                .HasForeignKey(o => o.PlacedByUserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PurchaseRequisition>()
                .HasOne(p => p.RequestedBy)
                .WithMany()
                .HasForeignKey(p => p.RequestedByID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SupplierEvaluation>()
                .HasOne(s => s.EvaluatedBy)
                .WithMany()
                .HasForeignKey(s => s.EvaluatedByID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TenantAuditLog>()
                .HasOne(l => l.TenantUser)
                .WithMany()
                .HasForeignKey(l => l.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.TenantUser)
                .WithMany()
                .HasForeignKey(ur => ur.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PaymentTenant>()
                .HasOne(p => p.ProcessedBy)
                .WithMany()
                .HasForeignKey(p => p.ProcessedByID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Delivery>()
                .HasOne(d => d.ReceivedBy)
                .WithMany()
                .HasForeignKey(d => d.ReceivedByID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StockMovement>()
                .HasOne(s => s.TenantUser)
                .WithMany()
                .HasForeignKey(s => s.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ReorderAlert>()
                .HasOne(r => r.AcknowledgedBy)
                .WithMany()
                .HasForeignKey(r => r.AcknowledgedByID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderShipment>()
                .HasOne(o => o.PackedByUser)
                .WithMany()
                .HasForeignKey(o => o.PackedByUserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.SenderUser)
                .WithMany()
                .HasForeignKey(m => m.SenderUserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProductReview>()
                .HasOne(r => r.ReviewedByUser)
                .WithMany()
                .HasForeignKey(r => r.ReviewedByUserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ComplianceCheckResult>()
                .HasOne(r => r.CheckedBy)
                .WithMany()
                .HasForeignKey(r => r.CheckedByID)
                .OnDelete(DeleteBehavior.Restrict);

            // PRApproval — paths: Tenant→PR→PRApproval  AND  Tenant→TenantUser→PRApproval
            modelBuilder.Entity<PRApproval>()
                .HasOne(p => p.Approver)
                .WithMany()
                .HasForeignKey(p => p.ApproverUserID)
                .OnDelete(DeleteBehavior.Restrict);

            // PurchaseOrder — paths: Tenant→PR→PO  AND  Tenant→TenantUser→PO
            modelBuilder.Entity<PurchaseOrder>()
                .HasOne(p => p.CreatedByUser)
                .WithMany()
                .HasForeignKey(p => p.CreatedByUserID)
                .OnDelete(DeleteBehavior.Restrict);

            // ════════════════════════════════════════════════════════════════════
            // SECTION 2 — Tables with two or more FKs pointing at Tenant
            // ════════════════════════════════════════════════════════════════════

            modelBuilder.Entity<AccreditationLink>()
                .HasOne(a => a.BuyerTenant)
                .WithMany()
                .HasForeignKey(a => a.BuyerTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AccreditationLink>()
                .HasOne(a => a.VendorTenant)
                .WithMany()
                .HasForeignKey(a => a.VendorTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PurchaseOrder>()
                .HasOne(p => p.Tenant)
                .WithMany()
                .HasForeignKey(p => p.TenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PurchaseOrder>()
                .HasOne(p => p.VendorTenant)
                .WithMany()
                .HasForeignKey(p => p.VendorTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Contract>()
                .HasOne(c => c.Tenant)
                .WithMany()
                .HasForeignKey(c => c.TenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Contract>()
                .HasOne(c => c.VendorTenant)
                .WithMany()
                .HasForeignKey(c => c.VendorTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PriceList>()
                .HasOne(p => p.BuyerTenant)
                .WithMany()
                .HasForeignKey(p => p.BuyerTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PriceList>()
                .HasOne(p => p.VendorTenant)
                .WithMany()
                .HasForeignKey(p => p.VendorTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VendorRiskScore>()
                .HasOne(v => v.VendorTenant)
                .WithMany()
                .HasForeignKey(v => v.VendorTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VendorRiskScore>()
                .HasOne(v => v.BuyerTenant)
                .WithMany()
                .HasForeignKey(v => v.BuyerTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SupplierEvaluation>()
                .HasOne(s => s.Tenant)
                .WithMany()
                .HasForeignKey(s => s.TenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SupplierEvaluation>()
                .HasOne(s => s.VendorTenant)
                .WithMany()
                .HasForeignKey(s => s.VendorTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Tenant)
                .WithMany()
                .HasForeignKey(i => i.TenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.VendorTenant)
                .WithMany()
                .HasForeignKey(i => i.VendorTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MarketplaceOrder>()
                .HasOne(o => o.BuyerTenant)
                .WithMany()
                .HasForeignKey(o => o.BuyerTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MarketplaceOrder>()
                .HasOne(o => o.VendorTenant)
                .WithMany()
                .HasForeignKey(o => o.VendorTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Conversation>()
                .HasOne(c => c.BuyerTenant)
                .WithMany()
                .HasForeignKey(c => c.BuyerTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Conversation>()
                .HasOne(c => c.VendorTenant)
                .WithMany()
                .HasForeignKey(c => c.VendorTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProductReview>()
                .HasOne(r => r.BuyerTenant)
                .WithMany()
                .HasForeignKey(r => r.BuyerTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            // PaymentTenant — paths: Tenant→PaymentTenant direct  AND  Tenant→PR→PO→Invoice→PaymentTenant
            modelBuilder.Entity<PaymentTenant>()
                .HasOne(p => p.Tenant)
                .WithMany()
                .HasForeignKey(p => p.TenantID)
                .OnDelete(DeleteBehavior.Restrict);

            // Delivery — paths: Tenant→Delivery direct  AND  Tenant→PR→PO→Delivery
            modelBuilder.Entity<Delivery>()
                .HasOne(d => d.Tenant)
                .WithMany()
                .HasForeignKey(d => d.TenantID)
                .OnDelete(DeleteBehavior.Restrict);

            // ════════════════════════════════════════════════════════════════════
            // SECTION 3 — Inventory (three FKs all cascade back to Tenant)
            // Tenant→Item→Inventory  AND  Tenant→Warehouse→Inventory  AND  direct
            // ════════════════════════════════════════════════════════════════════

            modelBuilder.Entity<Inventory>()
                .HasOne(i => i.Tenant)
                .WithMany()
                .HasForeignKey(i => i.TenantID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Inventory>()
                .HasOne(i => i.Item)
                .WithMany()
                .HasForeignKey(i => i.ItemID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Inventory>()
                .HasOne(i => i.Warehouse)
                .WithMany()
                .HasForeignKey(i => i.WarehouseID)
                .OnDelete(DeleteBehavior.Restrict);

            // ════════════════════════════════════════════════════════════════════
            // SECTION 4 — ReorderAlert (TenantID + InventoryID both reach Tenant)
            // ════════════════════════════════════════════════════════════════════

            modelBuilder.Entity<ReorderAlert>()
                .HasOne(r => r.Tenant)
                .WithMany()
                .HasForeignKey(r => r.TenantID)
                .OnDelete(DeleteBehavior.Restrict);

            // ════════════════════════════════════════════════════════════════════
            // SECTION 5 — ComplianceCheckResult
            // Two paths from ComplianceChecklist:
            //   direct via ChecklistID  AND  via ChecklistItem→ChecklistID
            // ════════════════════════════════════════════════════════════════════

            modelBuilder.Entity<ComplianceCheckResult>()
                .HasOne(r => r.ComplianceChecklist)
                .WithMany()
                .HasForeignKey(r => r.ChecklistID)
                .OnDelete(DeleteBehavior.Restrict);

            // ════════════════════════════════════════════════════════════════════
            // SECTION 6 — Procurement children (Item + PR both cascade from Tenant)
            // ════════════════════════════════════════════════════════════════════

            // RequisitionItem: Tenant→PR→RequisitionItem  AND  Tenant→Item→RequisitionItem
            modelBuilder.Entity<RequisitionItem>()
                .HasOne(r => r.Item)
                .WithMany()
                .HasForeignKey(r => r.ItemID)
                .OnDelete(DeleteBehavior.Restrict);

            // POItem: Tenant→PR→PO→POItem  AND  Tenant→Item→POItem
            modelBuilder.Entity<POItem>()
                .HasOne(p => p.Item)
                .WithMany()
                .HasForeignKey(p => p.ItemID)
                .OnDelete(DeleteBehavior.Restrict);

            // ════════════════════════════════════════════════════════════════════
            // SECTION 7 — Invoice & Delivery children
            // ════════════════════════════════════════════════════════════════════

            // InvoiceLineItem: Tenant→PR→PO→Invoice→InvoiceLineItem  AND  Tenant→Item→InvoiceLineItem
            modelBuilder.Entity<InvoiceLineItem>()
                .HasOne(i => i.Item)
                .WithMany()
                .HasForeignKey(i => i.ItemID)
                .OnDelete(DeleteBehavior.Restrict);

            // DeliveryItem: PO→Delivery→DeliveryItem  AND  PO→POItem→DeliveryItem
            modelBuilder.Entity<DeliveryItem>()
                .HasOne(d => d.POItem)
                .WithMany()
                .HasForeignKey(d => d.POItemID)
                .OnDelete(DeleteBehavior.Restrict);

            // ════════════════════════════════════════════════════════════════════
            // SECTION 8 — ProductReview
            // Two paths from ProductListing:
            //   direct via ProductID  AND  ProductListing→OrderItem→ProductReview
            // ════════════════════════════════════════════════════════════════════

            modelBuilder.Entity<ProductReview>()
                .HasOne(r => r.ProductListing)
                .WithMany()
                .HasForeignKey(r => r.ProductID)
                .OnDelete(DeleteBehavior.Restrict);

            // ════════════════════════════════════════════════════════════════════
            // SECTION 9 — Self-referencing
            // ════════════════════════════════════════════════════════════════════

            modelBuilder.Entity<ProductCategory>()
                .HasOne(p => p.ParentCategory)
                .WithMany()
                .HasForeignKey(p => p.ParentCategoryID)
                .OnDelete(DeleteBehavior.Restrict);

            // ════════════════════════════════════════════════════════════════════
            // SECTION 10 — Unique indexes
            // ════════════════════════════════════════════════════════════════════

            modelBuilder.Entity<PlatformUser>()
                .HasIndex(p => p.Email).IsUnique();

            modelBuilder.Entity<TenantUser>()
                .HasIndex(u => new { u.TenantID, u.Email }).IsUnique();

            modelBuilder.Entity<VendorStoreProfile>()
                .HasIndex(v => v.StoreSlug).IsUnique();

            modelBuilder.Entity<PurchaseRequisition>()
                .HasIndex(p => p.PRNumber).IsUnique();

            modelBuilder.Entity<PurchaseOrder>()
                .HasIndex(p => p.PONumber).IsUnique();
        }
    }
}