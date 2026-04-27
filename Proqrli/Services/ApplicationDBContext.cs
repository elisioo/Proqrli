using Microsoft.EntityFrameworkCore;
using ProqrLi.Models;

namespace ProqrLi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // ── Super Admin ──────────────────────────────────────────────────────────
        public DbSet<PlatformUser> PlatformUsers { get; set; }
        public DbSet<PlatformAuditLog> PlatformAuditLogs { get; set; }
        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        public DbSet<TenantSubscription> TenantSubscriptions { get; set; }
        public DbSet<Billing> Billings { get; set; }
        public DbSet<SubscriptionPayment> SubscriptionPayments { get; set; }

        // ── Auth ────────────────────────────────────────────────────────────────
        public DbSet<TenantUser> TenantUsers { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<TenantAuditLog> TenantAuditLogs { get; set; }

        // ── Module 1: Vendor Accreditation ──────────────────────────────────────
        public DbSet<AccreditationLink> AccreditationLinks { get; set; }
        public DbSet<VendorDocument> VendorDocuments { get; set; }
        public DbSet<VendorBankDetail> VendorBankDetails { get; set; }

        // ── Module 2: Procurement ───────────────────────────────────────────────
        public DbSet<Item> Items { get; set; }
        public DbSet<PurchaseRequisition> PurchaseRequisitions { get; set; }
        public DbSet<RequisitionItem> RequisitionItems { get; set; }
        public DbSet<PRApproval> PRApprovals { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        public DbSet<POItem> POItems { get; set; }

        // ── Module 3: Supplier Evaluation ──────────────────────────────────────
        public DbSet<EvaluationCriteria> EvaluationCriterias { get; set; }
        public DbSet<SupplierEvaluation> SupplierEvaluations { get; set; }
        public DbSet<EvaluationScore> EvaluationScores { get; set; }
        public DbSet<VendorRiskScore> VendorRiskScores { get; set; }

        // ── Module 4: Contract & Pricing ────────────────────────────────────────
        public DbSet<Contract> Contracts { get; set; }
        public DbSet<ContractItem> ContractItems { get; set; }
        public DbSet<PriceList> PriceLists { get; set; }
        public DbSet<PriceListItem> PriceListItems { get; set; }

        // ── Module 5: Analytics ─────────────────────────────────────────────────
        public DbSet<AnalyticsSnapshot> AnalyticsSnapshots { get; set; }
        public DbSet<KPIMetric> KPIMetrics { get; set; }

        // ── Module 6: Invoice & Payment ─────────────────────────────────────────
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceLineItem> InvoiceLineItems { get; set; }
        public DbSet<PaymentTenant> PaymentTenants { get; set; }

        // ── Module 7: Delivery & Logistics ──────────────────────────────────────
        public DbSet<Delivery> Deliveries { get; set; }
        public DbSet<DeliveryItem> DeliveryItems { get; set; }
        public DbSet<ShipmentTracking> ShipmentTrackings { get; set; }

        // ── Module 8: Inventory ─────────────────────────────────────────────────
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<StockMovement> StockMovements { get; set; }
        public DbSet<ReorderAlert> ReorderAlerts { get; set; }

        // ── Module 9: Compliance ────────────────────────────────────────────────
        public DbSet<DocumentCategory> DocumentCategories { get; set; }
        public DbSet<ComplianceDocument> ComplianceDocuments { get; set; }
        public DbSet<ComplianceChecklist> ComplianceChecklists { get; set; }
        public DbSet<ChecklistItem> ChecklistItems { get; set; }
        public DbSet<ComplianceCheckResult> ComplianceCheckResults { get; set; }

        // ── Module 11: Marketplace ──────────────────────────────────────────────
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

        // ── Module 12: Messaging ────────────────────────────────────────────────
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<MessageAttachment> MessageAttachments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── AccreditationLink: two FKs to Tenant ──────────────────────────
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

            // ── PurchaseOrder: two FKs to Tenant ──────────────────────────────
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

            // ── Contract: two FKs to Tenant ───────────────────────────────────
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

            // ── PriceList: two FKs to Tenant ──────────────────────────────────
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

            // ── VendorRiskScore: two FKs to Tenant ────────────────────────────
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

            // ── SupplierEvaluation: two FKs to Tenant ─────────────────────────
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

            // ── Invoice: two FKs to Tenant ────────────────────────────────────
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

            // ── MarketplaceOrder: two FKs to Tenant ───────────────────────────
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

            // ── Conversation: two FKs to Tenant ───────────────────────────────
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

            // ── ProductReview FK to Tenant ─────────────────────────────────────
            modelBuilder.Entity<ProductReview>()
                .HasOne(r => r.BuyerTenant)
                .WithMany()
                .HasForeignKey(r => r.BuyerTenantID)
                .OnDelete(DeleteBehavior.Restrict);

            // ── ProductCategory: self-referencing ─────────────────────────────
            modelBuilder.Entity<ProductCategory>()
                .HasOne(p => p.ParentCategory)
                .WithMany()
                .HasForeignKey(p => p.ParentCategoryID)
                .OnDelete(DeleteBehavior.Restrict);

            // ── Unique indexes ─────────────────────────────────────────────────
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
