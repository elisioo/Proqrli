using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Proqrli.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PlatformUser",
                columns: table => new
                {
                    PlatformUserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlatformUser", x => x.PlatformUserID);
                });

            migrationBuilder.CreateTable(
                name: "ProductCategory",
                columns: table => new
                {
                    CategoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParentCategoryID = table.Column<int>(type: "int", nullable: true),
                    CategoryName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IconPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductCategory", x => x.CategoryID);
                    table.ForeignKey(
                        name: "FK_ProductCategory_ProductCategory_ParentCategoryID",
                        column: x => x.ParentCategoryID,
                        principalTable: "ProductCategory",
                        principalColumn: "CategoryID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionPlan",
                columns: table => new
                {
                    PlanID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlanName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ApplicableTo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaxUsers = table.Column<int>(type: "int", nullable: false),
                    Features = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionPlan", x => x.PlanID);
                });

            migrationBuilder.CreateTable(
                name: "Tenant",
                columns: table => new
                {
                    TenantID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Industry = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CompanySize = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ContactEmail = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ContactPhone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenant", x => x.TenantID);
                });

            migrationBuilder.CreateTable(
                name: "PlatformAuditLog",
                columns: table => new
                {
                    LogID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlatformUserID = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IPAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlatformAuditLog", x => x.LogID);
                    table.ForeignKey(
                        name: "FK_PlatformAuditLog_PlatformUser_PlatformUserID",
                        column: x => x.PlatformUserID,
                        principalTable: "PlatformUser",
                        principalColumn: "PlatformUserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AnalyticsSnapshot",
                columns: table => new
                {
                    SnapshotID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    SnapshotType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Period = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TotalPRs = table.Column<int>(type: "int", nullable: false),
                    TotalPOs = table.Column<int>(type: "int", nullable: false),
                    TotalSpend = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AvgLeadTimeDays = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    PRApprovalRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    OnTimeDeliveryRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    ActiveVendors = table.Column<int>(type: "int", nullable: false),
                    GeneratedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnalyticsSnapshot", x => x.SnapshotID);
                    table.ForeignKey(
                        name: "FK_AnalyticsSnapshot_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Billing",
                columns: table => new
                {
                    BillingID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BillingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Billing", x => x.BillingID);
                    table.ForeignKey(
                        name: "FK_Billing_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ComplianceChecklist",
                columns: table => new
                {
                    ChecklistID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    ChecklistName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ApplicableTo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComplianceChecklist", x => x.ChecklistID);
                    table.ForeignKey(
                        name: "FK_ComplianceChecklist_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentCategory",
                columns: table => new
                {
                    CategoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    CategoryName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    RequiresExpiry = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentCategory", x => x.CategoryID);
                    table.ForeignKey(
                        name: "FK_DocumentCategory_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EvaluationCriteria",
                columns: table => new
                {
                    CriteriaID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    CriteriaName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Weight = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluationCriteria", x => x.CriteriaID);
                    table.ForeignKey(
                        name: "FK_EvaluationCriteria_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Item",
                columns: table => new
                {
                    ItemID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    ItemCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ItemName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UnitOfMeasure = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Item", x => x.ItemID);
                    table.ForeignKey(
                        name: "FK_Item_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KPIMetric",
                columns: table => new
                {
                    MetricID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    MetricName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Module = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MetricValue = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Period = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RecordedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KPIMetric", x => x.MetricID);
                    table.ForeignKey(
                        name: "FK_KPIMetric_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PriceList",
                columns: table => new
                {
                    PriceListID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BuyerTenantID = table.Column<int>(type: "int", nullable: false),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    PriceListName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceList", x => x.PriceListID);
                    table.ForeignKey(
                        name: "FK_PriceList_Tenant_BuyerTenantID",
                        column: x => x.BuyerTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PriceList_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductListing",
                columns: table => new
                {
                    ProductID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    CategoryID = table.Column<int>(type: "int", nullable: false),
                    ProductName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    SKU = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProductType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BasePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UnitOfMeasure = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MinOrderQty = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    StockQuantity = table.Column<int>(type: "int", nullable: false),
                    Weight = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    Dimensions = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AverageRating = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    TotalSold = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductListing", x => x.ProductID);
                    table.ForeignKey(
                        name: "FK_ProductListing_ProductCategory_CategoryID",
                        column: x => x.CategoryID,
                        principalTable: "ProductCategory",
                        principalColumn: "CategoryID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductListing_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Role",
                columns: table => new
                {
                    RoleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    RoleName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Role", x => x.RoleID);
                    table.ForeignKey(
                        name: "FK_Role_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantSubscription",
                columns: table => new
                {
                    SubscriptionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    PlanID = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsTrialPeriod = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSubscription", x => x.SubscriptionID);
                    table.ForeignKey(
                        name: "FK_TenantSubscription_SubscriptionPlan_PlanID",
                        column: x => x.PlanID,
                        principalTable: "SubscriptionPlan",
                        principalColumn: "PlanID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TenantSubscription_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantUser",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantUser", x => x.UserID);
                    table.ForeignKey(
                        name: "FK_TenantUser_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VendorBankDetail",
                columns: table => new
                {
                    BankDetailID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    BankName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AccountNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AccountName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BranchCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VendorBankDetail", x => x.BankDetailID);
                    table.ForeignKey(
                        name: "FK_VendorBankDetail_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VendorDocument",
                columns: table => new
                {
                    DocumentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    DocumentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VendorDocument", x => x.DocumentID);
                    table.ForeignKey(
                        name: "FK_VendorDocument_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VendorRiskScore",
                columns: table => new
                {
                    RiskScoreID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    BuyerTenantID = table.Column<int>(type: "int", nullable: false),
                    OnTimeDeliveryRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    DefectRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    PriceVariance = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    ComplianceViolations = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    ContractFulfillmentRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    MLRiskScore = table.Column<decimal>(type: "decimal(5,4)", nullable: false),
                    RiskClassification = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ScoredAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VendorRiskScore", x => x.RiskScoreID);
                    table.ForeignKey(
                        name: "FK_VendorRiskScore_Tenant_BuyerTenantID",
                        column: x => x.BuyerTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VendorRiskScore_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VendorStoreProfile",
                columns: table => new
                {
                    StoreProfileID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    StoreName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    StoreSlug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    StoreDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LogoPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    BannerPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    BusinessAddress = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    OverallRating = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VendorStoreProfile", x => x.StoreProfileID);
                    table.ForeignKey(
                        name: "FK_VendorStoreProfile_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Warehouse",
                columns: table => new
                {
                    WarehouseID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    WarehouseName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Warehouse", x => x.WarehouseID);
                    table.ForeignKey(
                        name: "FK_Warehouse_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionPayment",
                columns: table => new
                {
                    PaymentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BillingID = table.Column<int>(type: "int", nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionPayment", x => x.PaymentID);
                    table.ForeignKey(
                        name: "FK_SubscriptionPayment_Billing_BillingID",
                        column: x => x.BillingID,
                        principalTable: "Billing",
                        principalColumn: "BillingID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChecklistItem",
                columns: table => new
                {
                    CheckItemID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChecklistID = table.Column<int>(type: "int", nullable: false),
                    ItemDescription = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChecklistItem", x => x.CheckItemID);
                    table.ForeignKey(
                        name: "FK_ChecklistItem_ComplianceChecklist_ChecklistID",
                        column: x => x.ChecklistID,
                        principalTable: "ComplianceChecklist",
                        principalColumn: "ChecklistID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PriceListItem",
                columns: table => new
                {
                    PriceListItemID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PriceListID = table.Column<int>(type: "int", nullable: false),
                    ItemID = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    NetPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceListItem", x => x.PriceListItemID);
                    table.ForeignKey(
                        name: "FK_PriceListItem_Item_ItemID",
                        column: x => x.ItemID,
                        principalTable: "Item",
                        principalColumn: "ItemID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PriceListItem_PriceList_PriceListID",
                        column: x => x.PriceListID,
                        principalTable: "PriceList",
                        principalColumn: "PriceListID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Conversation",
                columns: table => new
                {
                    ConversationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BuyerTenantID = table.Column<int>(type: "int", nullable: false),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    ProductID = table.Column<int>(type: "int", nullable: true),
                    Subject = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LastMessageAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conversation", x => x.ConversationID);
                    table.ForeignKey(
                        name: "FK_Conversation_ProductListing_ProductID",
                        column: x => x.ProductID,
                        principalTable: "ProductListing",
                        principalColumn: "ProductID");
                    table.ForeignKey(
                        name: "FK_Conversation_Tenant_BuyerTenantID",
                        column: x => x.BuyerTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Conversation_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductImage",
                columns: table => new
                {
                    ImageID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductID = table.Column<int>(type: "int", nullable: false),
                    ImagePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductImage", x => x.ImageID);
                    table.ForeignKey(
                        name: "FK_ProductImage_ProductListing_ProductID",
                        column: x => x.ProductID,
                        principalTable: "ProductListing",
                        principalColumn: "ProductID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductVariant",
                columns: table => new
                {
                    VariantID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductID = table.Column<int>(type: "int", nullable: false),
                    VariantName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    VariantSKU = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PriceAdjustment = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StockQuantity = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductVariant", x => x.VariantID);
                    table.ForeignKey(
                        name: "FK_ProductVariant_ProductListing_ProductID",
                        column: x => x.ProductID,
                        principalTable: "ProductListing",
                        principalColumn: "ProductID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AccreditationLink",
                columns: table => new
                {
                    LinkID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BuyerTenantID = table.Column<int>(type: "int", nullable: false),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AppliedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedByUserID = table.Column<int>(type: "int", nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccreditationLink", x => x.LinkID);
                    table.ForeignKey(
                        name: "FK_AccreditationLink_TenantUser_ApprovedByUserID",
                        column: x => x.ApprovedByUserID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AccreditationLink_Tenant_BuyerTenantID",
                        column: x => x.BuyerTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AccreditationLink_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ComplianceDocument",
                columns: table => new
                {
                    DocID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    CategoryID = table.Column<int>(type: "int", nullable: false),
                    UploadedByID = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    DocumentNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RelatedModule = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RelatedRecordID = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IssuedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComplianceDocument", x => x.DocID);
                    table.ForeignKey(
                        name: "FK_ComplianceDocument_DocumentCategory_CategoryID",
                        column: x => x.CategoryID,
                        principalTable: "DocumentCategory",
                        principalColumn: "CategoryID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ComplianceDocument_TenantUser_UploadedByID",
                        column: x => x.UploadedByID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ComplianceDocument_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Contract",
                columns: table => new
                {
                    ContractID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    ContractNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ContractType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TotalValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Terms = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contract", x => x.ContractID);
                    table.ForeignKey(
                        name: "FK_Contract_TenantUser_CreatedByUserID",
                        column: x => x.CreatedByUserID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Contract_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Contract_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MarketplaceOrder",
                columns: table => new
                {
                    OrderID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BuyerTenantID = table.Column<int>(type: "int", nullable: false),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    PlacedByUserID = table.Column<int>(type: "int", nullable: false),
                    OrderNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SubTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ShippingFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ShippingAddress = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PaymentStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OrderStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BuyerNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketplaceOrder", x => x.OrderID);
                    table.ForeignKey(
                        name: "FK_MarketplaceOrder_TenantUser_PlacedByUserID",
                        column: x => x.PlacedByUserID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MarketplaceOrder_Tenant_BuyerTenantID",
                        column: x => x.BuyerTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MarketplaceOrder_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseRequisition",
                columns: table => new
                {
                    PRID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    RequestedByID = table.Column<int>(type: "int", nullable: false),
                    PRNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RequestDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RequiredDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CostCenter = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Purpose = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TotalEstimated = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseRequisition", x => x.PRID);
                    table.ForeignKey(
                        name: "FK_PurchaseRequisition_TenantUser_RequestedByID",
                        column: x => x.RequestedByID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PurchaseRequisition_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SupplierEvaluation",
                columns: table => new
                {
                    EvaluationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    EvaluatedByID = table.Column<int>(type: "int", nullable: false),
                    EvaluationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Period = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TotalScore = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    Rating = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplierEvaluation", x => x.EvaluationID);
                    table.ForeignKey(
                        name: "FK_SupplierEvaluation_TenantUser_EvaluatedByID",
                        column: x => x.EvaluatedByID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SupplierEvaluation_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SupplierEvaluation_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TenantAuditLog",
                columns: table => new
                {
                    LogID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    Module = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RecordID = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantAuditLog", x => x.LogID);
                    table.ForeignKey(
                        name: "FK_TenantAuditLog_TenantUser_UserID",
                        column: x => x.UserID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TenantAuditLog_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRole",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    RoleID = table.Column<int>(type: "int", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRole", x => x.ID);
                    table.ForeignKey(
                        name: "FK_UserRole_Role_RoleID",
                        column: x => x.RoleID,
                        principalTable: "Role",
                        principalColumn: "RoleID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRole_TenantUser_UserID",
                        column: x => x.UserID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Inventory",
                columns: table => new
                {
                    InventoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    ItemID = table.Column<int>(type: "int", nullable: false),
                    WarehouseID = table.Column<int>(type: "int", nullable: false),
                    QuantityOnHand = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    QuantityReserved = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    ReorderPoint = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    ReorderQuantity = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    MinimumStock = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    MaximumStock = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inventory", x => x.InventoryID);
                    table.ForeignKey(
                        name: "FK_Inventory_Item_ItemID",
                        column: x => x.ItemID,
                        principalTable: "Item",
                        principalColumn: "ItemID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Inventory_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Inventory_Warehouse_WarehouseID",
                        column: x => x.WarehouseID,
                        principalTable: "Warehouse",
                        principalColumn: "WarehouseID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ComplianceCheckResult",
                columns: table => new
                {
                    ResultID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChecklistID = table.Column<int>(type: "int", nullable: false),
                    CheckItemID = table.Column<int>(type: "int", nullable: false),
                    RelatedRecordID = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsCompliant = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CheckedByID = table.Column<int>(type: "int", nullable: false),
                    CheckedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComplianceCheckResult", x => x.ResultID);
                    table.ForeignKey(
                        name: "FK_ComplianceCheckResult_ChecklistItem_CheckItemID",
                        column: x => x.CheckItemID,
                        principalTable: "ChecklistItem",
                        principalColumn: "CheckItemID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ComplianceCheckResult_ComplianceChecklist_ChecklistID",
                        column: x => x.ChecklistID,
                        principalTable: "ComplianceChecklist",
                        principalColumn: "ChecklistID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ComplianceCheckResult_TenantUser_CheckedByID",
                        column: x => x.CheckedByID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Message",
                columns: table => new
                {
                    MessageID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ConversationID = table.Column<int>(type: "int", nullable: false),
                    SenderUserID = table.Column<int>(type: "int", nullable: false),
                    SenderTenantType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Message", x => x.MessageID);
                    table.ForeignKey(
                        name: "FK_Message_Conversation_ConversationID",
                        column: x => x.ConversationID,
                        principalTable: "Conversation",
                        principalColumn: "ConversationID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Message_TenantUser_SenderUserID",
                        column: x => x.SenderUserID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ContractItem",
                columns: table => new
                {
                    ContractItemID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ContractID = table.Column<int>(type: "int", nullable: false),
                    ItemID = table.Column<int>(type: "int", nullable: false),
                    AgreedUnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaxQuantity = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    UnitOfMeasure = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractItem", x => x.ContractItemID);
                    table.ForeignKey(
                        name: "FK_ContractItem_Contract_ContractID",
                        column: x => x.ContractID,
                        principalTable: "Contract",
                        principalColumn: "ContractID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ContractItem_Item_ItemID",
                        column: x => x.ItemID,
                        principalTable: "Item",
                        principalColumn: "ItemID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderItem",
                columns: table => new
                {
                    OrderItemID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderID = table.Column<int>(type: "int", nullable: false),
                    ProductID = table.Column<int>(type: "int", nullable: false),
                    VariantID = table.Column<int>(type: "int", nullable: true),
                    Quantity = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LineTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItem", x => x.OrderItemID);
                    table.ForeignKey(
                        name: "FK_OrderItem_MarketplaceOrder_OrderID",
                        column: x => x.OrderID,
                        principalTable: "MarketplaceOrder",
                        principalColumn: "OrderID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderItem_ProductListing_ProductID",
                        column: x => x.ProductID,
                        principalTable: "ProductListing",
                        principalColumn: "ProductID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderItem_ProductVariant_VariantID",
                        column: x => x.VariantID,
                        principalTable: "ProductVariant",
                        principalColumn: "VariantID");
                });

            migrationBuilder.CreateTable(
                name: "OrderShipment",
                columns: table => new
                {
                    ShipmentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderID = table.Column<int>(type: "int", nullable: false),
                    PackedByUserID = table.Column<int>(type: "int", nullable: true),
                    CourierName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TrackingNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ShippedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EstimatedArrival = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeliveredDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderShipment", x => x.ShipmentID);
                    table.ForeignKey(
                        name: "FK_OrderShipment_MarketplaceOrder_OrderID",
                        column: x => x.OrderID,
                        principalTable: "MarketplaceOrder",
                        principalColumn: "OrderID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderShipment_TenantUser_PackedByUserID",
                        column: x => x.PackedByUserID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PRApproval",
                columns: table => new
                {
                    ApprovalID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PRID = table.Column<int>(type: "int", nullable: false),
                    ApproverUserID = table.Column<int>(type: "int", nullable: false),
                    ApprovalLevel = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActionAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PRApproval", x => x.ApprovalID);
                    table.ForeignKey(
                        name: "FK_PRApproval_PurchaseRequisition_PRID",
                        column: x => x.PRID,
                        principalTable: "PurchaseRequisition",
                        principalColumn: "PRID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PRApproval_TenantUser_ApproverUserID",
                        column: x => x.ApproverUserID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseOrder",
                columns: table => new
                {
                    POID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    PRID = table.Column<int>(type: "int", nullable: false),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    PONumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PODate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpectedDelivery = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentTerms = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseOrder", x => x.POID);
                    table.ForeignKey(
                        name: "FK_PurchaseOrder_PurchaseRequisition_PRID",
                        column: x => x.PRID,
                        principalTable: "PurchaseRequisition",
                        principalColumn: "PRID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PurchaseOrder_TenantUser_CreatedByUserID",
                        column: x => x.CreatedByUserID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PurchaseOrder_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PurchaseOrder_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequisitionItem",
                columns: table => new
                {
                    ReqItemID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PRID = table.Column<int>(type: "int", nullable: false),
                    ItemID = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    EstimatedPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Specifications = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequisitionItem", x => x.ReqItemID);
                    table.ForeignKey(
                        name: "FK_RequisitionItem_Item_ItemID",
                        column: x => x.ItemID,
                        principalTable: "Item",
                        principalColumn: "ItemID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequisitionItem_PurchaseRequisition_PRID",
                        column: x => x.PRID,
                        principalTable: "PurchaseRequisition",
                        principalColumn: "PRID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EvaluationScore",
                columns: table => new
                {
                    ScoreID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EvaluationID = table.Column<int>(type: "int", nullable: false),
                    CriteriaID = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    WeightedScore = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluationScore", x => x.ScoreID);
                    table.ForeignKey(
                        name: "FK_EvaluationScore_EvaluationCriteria_CriteriaID",
                        column: x => x.CriteriaID,
                        principalTable: "EvaluationCriteria",
                        principalColumn: "CriteriaID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EvaluationScore_SupplierEvaluation_EvaluationID",
                        column: x => x.EvaluationID,
                        principalTable: "SupplierEvaluation",
                        principalColumn: "EvaluationID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReorderAlert",
                columns: table => new
                {
                    AlertID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InventoryID = table.Column<int>(type: "int", nullable: false),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    AlertType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TriggeredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AcknowledgedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AcknowledgedByID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReorderAlert", x => x.AlertID);
                    table.ForeignKey(
                        name: "FK_ReorderAlert_Inventory_InventoryID",
                        column: x => x.InventoryID,
                        principalTable: "Inventory",
                        principalColumn: "InventoryID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReorderAlert_TenantUser_AcknowledgedByID",
                        column: x => x.AcknowledgedByID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReorderAlert_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StockMovement",
                columns: table => new
                {
                    MovementID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InventoryID = table.Column<int>(type: "int", nullable: false),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    MovementType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    ReferenceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ReferenceID = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MovedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockMovement", x => x.MovementID);
                    table.ForeignKey(
                        name: "FK_StockMovement_Inventory_InventoryID",
                        column: x => x.InventoryID,
                        principalTable: "Inventory",
                        principalColumn: "InventoryID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StockMovement_TenantUser_UserID",
                        column: x => x.UserID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MessageAttachment",
                columns: table => new
                {
                    AttachmentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MessageID = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FileType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FileSizeBytes = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageAttachment", x => x.AttachmentID);
                    table.ForeignKey(
                        name: "FK_MessageAttachment_Message_MessageID",
                        column: x => x.MessageID,
                        principalTable: "Message",
                        principalColumn: "MessageID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductReview",
                columns: table => new
                {
                    ReviewID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductID = table.Column<int>(type: "int", nullable: false),
                    OrderItemID = table.Column<int>(type: "int", nullable: false),
                    BuyerTenantID = table.Column<int>(type: "int", nullable: false),
                    ReviewedByUserID = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    ReviewText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsVerifiedPurchase = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductReview", x => x.ReviewID);
                    table.ForeignKey(
                        name: "FK_ProductReview_OrderItem_OrderItemID",
                        column: x => x.OrderItemID,
                        principalTable: "OrderItem",
                        principalColumn: "OrderItemID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductReview_ProductListing_ProductID",
                        column: x => x.ProductID,
                        principalTable: "ProductListing",
                        principalColumn: "ProductID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductReview_TenantUser_ReviewedByUserID",
                        column: x => x.ReviewedByUserID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductReview_Tenant_BuyerTenantID",
                        column: x => x.BuyerTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ShipmentEvent",
                columns: table => new
                {
                    EventID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShipmentID = table.Column<int>(type: "int", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    EventDescription = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    EventAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShipmentEvent", x => x.EventID);
                    table.ForeignKey(
                        name: "FK_ShipmentEvent_OrderShipment_ShipmentID",
                        column: x => x.ShipmentID,
                        principalTable: "OrderShipment",
                        principalColumn: "ShipmentID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Delivery",
                columns: table => new
                {
                    DeliveryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    POID = table.Column<int>(type: "int", nullable: false),
                    DeliveryNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ExpectedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CourierName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TrackingNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DeliveryAddress = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ReceivedByID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Delivery", x => x.DeliveryID);
                    table.ForeignKey(
                        name: "FK_Delivery_PurchaseOrder_POID",
                        column: x => x.POID,
                        principalTable: "PurchaseOrder",
                        principalColumn: "POID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Delivery_TenantUser_ReceivedByID",
                        column: x => x.ReceivedByID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Delivery_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Invoice",
                columns: table => new
                {
                    InvoiceID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    POID = table.Column<int>(type: "int", nullable: false),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SubTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoice", x => x.InvoiceID);
                    table.ForeignKey(
                        name: "FK_Invoice_PurchaseOrder_POID",
                        column: x => x.POID,
                        principalTable: "PurchaseOrder",
                        principalColumn: "POID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Invoice_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Invoice_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "POItem",
                columns: table => new
                {
                    POItemID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    POID = table.Column<int>(type: "int", nullable: false),
                    ItemID = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LineTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_POItem", x => x.POItemID);
                    table.ForeignKey(
                        name: "FK_POItem_Item_ItemID",
                        column: x => x.ItemID,
                        principalTable: "Item",
                        principalColumn: "ItemID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_POItem_PurchaseOrder_POID",
                        column: x => x.POID,
                        principalTable: "PurchaseOrder",
                        principalColumn: "POID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ShipmentTracking",
                columns: table => new
                {
                    TrackingID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DeliveryID = table.Column<int>(type: "int", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrackedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShipmentTracking", x => x.TrackingID);
                    table.ForeignKey(
                        name: "FK_ShipmentTracking_Delivery_DeliveryID",
                        column: x => x.DeliveryID,
                        principalTable: "Delivery",
                        principalColumn: "DeliveryID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InvoiceLineItem",
                columns: table => new
                {
                    LineItemID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvoiceID = table.Column<int>(type: "int", nullable: false),
                    ItemID = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LineTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceLineItem", x => x.LineItemID);
                    table.ForeignKey(
                        name: "FK_InvoiceLineItem_Invoice_InvoiceID",
                        column: x => x.InvoiceID,
                        principalTable: "Invoice",
                        principalColumn: "InvoiceID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InvoiceLineItem_Item_ItemID",
                        column: x => x.ItemID,
                        principalTable: "Item",
                        principalColumn: "ItemID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PaymentTenant",
                columns: table => new
                {
                    PaymentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    InvoiceID = table.Column<int>(type: "int", nullable: false),
                    AmountPaid = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Reference = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProcessedByID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentTenant", x => x.PaymentID);
                    table.ForeignKey(
                        name: "FK_PaymentTenant_Invoice_InvoiceID",
                        column: x => x.InvoiceID,
                        principalTable: "Invoice",
                        principalColumn: "InvoiceID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PaymentTenant_TenantUser_ProcessedByID",
                        column: x => x.ProcessedByID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PaymentTenant_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DeliveryItem",
                columns: table => new
                {
                    DeliveryItemID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DeliveryID = table.Column<int>(type: "int", nullable: false),
                    POItemID = table.Column<int>(type: "int", nullable: false),
                    QuantityOrdered = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    QuantityDelivered = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    QuantityAccepted = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    QuantityRejected = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryItem", x => x.DeliveryItemID);
                    table.ForeignKey(
                        name: "FK_DeliveryItem_Delivery_DeliveryID",
                        column: x => x.DeliveryID,
                        principalTable: "Delivery",
                        principalColumn: "DeliveryID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DeliveryItem_POItem_POItemID",
                        column: x => x.POItemID,
                        principalTable: "POItem",
                        principalColumn: "POItemID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccreditationLink_ApprovedByUserID",
                table: "AccreditationLink",
                column: "ApprovedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_AccreditationLink_BuyerTenantID",
                table: "AccreditationLink",
                column: "BuyerTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_AccreditationLink_VendorTenantID",
                table: "AccreditationLink",
                column: "VendorTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_AnalyticsSnapshot_TenantID",
                table: "AnalyticsSnapshot",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_Billing_TenantID",
                table: "Billing",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_ChecklistItem_ChecklistID",
                table: "ChecklistItem",
                column: "ChecklistID");

            migrationBuilder.CreateIndex(
                name: "IX_ComplianceChecklist_TenantID",
                table: "ComplianceChecklist",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_ComplianceCheckResult_CheckedByID",
                table: "ComplianceCheckResult",
                column: "CheckedByID");

            migrationBuilder.CreateIndex(
                name: "IX_ComplianceCheckResult_CheckItemID",
                table: "ComplianceCheckResult",
                column: "CheckItemID");

            migrationBuilder.CreateIndex(
                name: "IX_ComplianceCheckResult_ChecklistID",
                table: "ComplianceCheckResult",
                column: "ChecklistID");

            migrationBuilder.CreateIndex(
                name: "IX_ComplianceDocument_CategoryID",
                table: "ComplianceDocument",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "IX_ComplianceDocument_TenantID",
                table: "ComplianceDocument",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_ComplianceDocument_UploadedByID",
                table: "ComplianceDocument",
                column: "UploadedByID");

            migrationBuilder.CreateIndex(
                name: "IX_Contract_CreatedByUserID",
                table: "Contract",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Contract_TenantID",
                table: "Contract",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_Contract_VendorTenantID",
                table: "Contract",
                column: "VendorTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_ContractItem_ContractID",
                table: "ContractItem",
                column: "ContractID");

            migrationBuilder.CreateIndex(
                name: "IX_ContractItem_ItemID",
                table: "ContractItem",
                column: "ItemID");

            migrationBuilder.CreateIndex(
                name: "IX_Conversation_BuyerTenantID",
                table: "Conversation",
                column: "BuyerTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_Conversation_ProductID",
                table: "Conversation",
                column: "ProductID");

            migrationBuilder.CreateIndex(
                name: "IX_Conversation_VendorTenantID",
                table: "Conversation",
                column: "VendorTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_Delivery_POID",
                table: "Delivery",
                column: "POID");

            migrationBuilder.CreateIndex(
                name: "IX_Delivery_ReceivedByID",
                table: "Delivery",
                column: "ReceivedByID");

            migrationBuilder.CreateIndex(
                name: "IX_Delivery_TenantID",
                table: "Delivery",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryItem_DeliveryID",
                table: "DeliveryItem",
                column: "DeliveryID");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryItem_POItemID",
                table: "DeliveryItem",
                column: "POItemID");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentCategory_TenantID",
                table: "DocumentCategory",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationCriteria_TenantID",
                table: "EvaluationCriteria",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationScore_CriteriaID",
                table: "EvaluationScore",
                column: "CriteriaID");

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationScore_EvaluationID",
                table: "EvaluationScore",
                column: "EvaluationID");

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_ItemID",
                table: "Inventory",
                column: "ItemID");

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_TenantID",
                table: "Inventory",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_WarehouseID",
                table: "Inventory",
                column: "WarehouseID");

            migrationBuilder.CreateIndex(
                name: "IX_Invoice_POID",
                table: "Invoice",
                column: "POID");

            migrationBuilder.CreateIndex(
                name: "IX_Invoice_TenantID",
                table: "Invoice",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_Invoice_VendorTenantID",
                table: "Invoice",
                column: "VendorTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLineItem_InvoiceID",
                table: "InvoiceLineItem",
                column: "InvoiceID");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLineItem_ItemID",
                table: "InvoiceLineItem",
                column: "ItemID");

            migrationBuilder.CreateIndex(
                name: "IX_Item_TenantID",
                table: "Item",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_KPIMetric_TenantID",
                table: "KPIMetric",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceOrder_BuyerTenantID",
                table: "MarketplaceOrder",
                column: "BuyerTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceOrder_PlacedByUserID",
                table: "MarketplaceOrder",
                column: "PlacedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceOrder_VendorTenantID",
                table: "MarketplaceOrder",
                column: "VendorTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_Message_ConversationID",
                table: "Message",
                column: "ConversationID");

            migrationBuilder.CreateIndex(
                name: "IX_Message_SenderUserID",
                table: "Message",
                column: "SenderUserID");

            migrationBuilder.CreateIndex(
                name: "IX_MessageAttachment_MessageID",
                table: "MessageAttachment",
                column: "MessageID");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItem_OrderID",
                table: "OrderItem",
                column: "OrderID");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItem_ProductID",
                table: "OrderItem",
                column: "ProductID");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItem_VariantID",
                table: "OrderItem",
                column: "VariantID");

            migrationBuilder.CreateIndex(
                name: "IX_OrderShipment_OrderID",
                table: "OrderShipment",
                column: "OrderID");

            migrationBuilder.CreateIndex(
                name: "IX_OrderShipment_PackedByUserID",
                table: "OrderShipment",
                column: "PackedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTenant_InvoiceID",
                table: "PaymentTenant",
                column: "InvoiceID");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTenant_ProcessedByID",
                table: "PaymentTenant",
                column: "ProcessedByID");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTenant_TenantID",
                table: "PaymentTenant",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_PlatformAuditLog_PlatformUserID",
                table: "PlatformAuditLog",
                column: "PlatformUserID");

            migrationBuilder.CreateIndex(
                name: "IX_PlatformUser_Email",
                table: "PlatformUser",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_POItem_ItemID",
                table: "POItem",
                column: "ItemID");

            migrationBuilder.CreateIndex(
                name: "IX_POItem_POID",
                table: "POItem",
                column: "POID");

            migrationBuilder.CreateIndex(
                name: "IX_PRApproval_ApproverUserID",
                table: "PRApproval",
                column: "ApproverUserID");

            migrationBuilder.CreateIndex(
                name: "IX_PRApproval_PRID",
                table: "PRApproval",
                column: "PRID");

            migrationBuilder.CreateIndex(
                name: "IX_PriceList_BuyerTenantID",
                table: "PriceList",
                column: "BuyerTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_PriceList_VendorTenantID",
                table: "PriceList",
                column: "VendorTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItem_ItemID",
                table: "PriceListItem",
                column: "ItemID");

            migrationBuilder.CreateIndex(
                name: "IX_PriceListItem_PriceListID",
                table: "PriceListItem",
                column: "PriceListID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductCategory_ParentCategoryID",
                table: "ProductCategory",
                column: "ParentCategoryID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductImage_ProductID",
                table: "ProductImage",
                column: "ProductID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductListing_CategoryID",
                table: "ProductListing",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductListing_VendorTenantID",
                table: "ProductListing",
                column: "VendorTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductReview_BuyerTenantID",
                table: "ProductReview",
                column: "BuyerTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductReview_OrderItemID",
                table: "ProductReview",
                column: "OrderItemID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductReview_ProductID",
                table: "ProductReview",
                column: "ProductID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductReview_ReviewedByUserID",
                table: "ProductReview",
                column: "ReviewedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariant_ProductID",
                table: "ProductVariant",
                column: "ProductID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrder_CreatedByUserID",
                table: "PurchaseOrder",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrder_PONumber",
                table: "PurchaseOrder",
                column: "PONumber",
                unique: true,
                filter: "[PONumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrder_PRID",
                table: "PurchaseOrder",
                column: "PRID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrder_TenantID",
                table: "PurchaseOrder",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrder_VendorTenantID",
                table: "PurchaseOrder",
                column: "VendorTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequisition_PRNumber",
                table: "PurchaseRequisition",
                column: "PRNumber",
                unique: true,
                filter: "[PRNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequisition_RequestedByID",
                table: "PurchaseRequisition",
                column: "RequestedByID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequisition_TenantID",
                table: "PurchaseRequisition",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_ReorderAlert_AcknowledgedByID",
                table: "ReorderAlert",
                column: "AcknowledgedByID");

            migrationBuilder.CreateIndex(
                name: "IX_ReorderAlert_InventoryID",
                table: "ReorderAlert",
                column: "InventoryID");

            migrationBuilder.CreateIndex(
                name: "IX_ReorderAlert_TenantID",
                table: "ReorderAlert",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_RequisitionItem_ItemID",
                table: "RequisitionItem",
                column: "ItemID");

            migrationBuilder.CreateIndex(
                name: "IX_RequisitionItem_PRID",
                table: "RequisitionItem",
                column: "PRID");

            migrationBuilder.CreateIndex(
                name: "IX_Role_TenantID",
                table: "Role",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentEvent_ShipmentID",
                table: "ShipmentEvent",
                column: "ShipmentID");

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentTracking_DeliveryID",
                table: "ShipmentTracking",
                column: "DeliveryID");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovement_InventoryID",
                table: "StockMovement",
                column: "InventoryID");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovement_UserID",
                table: "StockMovement",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionPayment_BillingID",
                table: "SubscriptionPayment",
                column: "BillingID");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierEvaluation_EvaluatedByID",
                table: "SupplierEvaluation",
                column: "EvaluatedByID");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierEvaluation_TenantID",
                table: "SupplierEvaluation",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierEvaluation_VendorTenantID",
                table: "SupplierEvaluation",
                column: "VendorTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_TenantAuditLog_TenantID",
                table: "TenantAuditLog",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_TenantAuditLog_UserID",
                table: "TenantAuditLog",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSubscription_PlanID",
                table: "TenantSubscription",
                column: "PlanID");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSubscription_TenantID",
                table: "TenantSubscription",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUser_TenantID_Email",
                table: "TenantUser",
                columns: new[] { "TenantID", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRole_RoleID",
                table: "UserRole",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_UserRole_UserID",
                table: "UserRole",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_VendorBankDetail_VendorTenantID",
                table: "VendorBankDetail",
                column: "VendorTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_VendorDocument_VendorTenantID",
                table: "VendorDocument",
                column: "VendorTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_VendorRiskScore_BuyerTenantID",
                table: "VendorRiskScore",
                column: "BuyerTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_VendorRiskScore_VendorTenantID",
                table: "VendorRiskScore",
                column: "VendorTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_VendorStoreProfile_StoreSlug",
                table: "VendorStoreProfile",
                column: "StoreSlug",
                unique: true,
                filter: "[StoreSlug] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_VendorStoreProfile_VendorTenantID",
                table: "VendorStoreProfile",
                column: "VendorTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_Warehouse_TenantID",
                table: "Warehouse",
                column: "TenantID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccreditationLink");

            migrationBuilder.DropTable(
                name: "AnalyticsSnapshot");

            migrationBuilder.DropTable(
                name: "ComplianceCheckResult");

            migrationBuilder.DropTable(
                name: "ComplianceDocument");

            migrationBuilder.DropTable(
                name: "ContractItem");

            migrationBuilder.DropTable(
                name: "DeliveryItem");

            migrationBuilder.DropTable(
                name: "EvaluationScore");

            migrationBuilder.DropTable(
                name: "InvoiceLineItem");

            migrationBuilder.DropTable(
                name: "KPIMetric");

            migrationBuilder.DropTable(
                name: "MessageAttachment");

            migrationBuilder.DropTable(
                name: "PaymentTenant");

            migrationBuilder.DropTable(
                name: "PlatformAuditLog");

            migrationBuilder.DropTable(
                name: "PRApproval");

            migrationBuilder.DropTable(
                name: "PriceListItem");

            migrationBuilder.DropTable(
                name: "ProductImage");

            migrationBuilder.DropTable(
                name: "ProductReview");

            migrationBuilder.DropTable(
                name: "ReorderAlert");

            migrationBuilder.DropTable(
                name: "RequisitionItem");

            migrationBuilder.DropTable(
                name: "ShipmentEvent");

            migrationBuilder.DropTable(
                name: "ShipmentTracking");

            migrationBuilder.DropTable(
                name: "StockMovement");

            migrationBuilder.DropTable(
                name: "SubscriptionPayment");

            migrationBuilder.DropTable(
                name: "TenantAuditLog");

            migrationBuilder.DropTable(
                name: "TenantSubscription");

            migrationBuilder.DropTable(
                name: "UserRole");

            migrationBuilder.DropTable(
                name: "VendorBankDetail");

            migrationBuilder.DropTable(
                name: "VendorDocument");

            migrationBuilder.DropTable(
                name: "VendorRiskScore");

            migrationBuilder.DropTable(
                name: "VendorStoreProfile");

            migrationBuilder.DropTable(
                name: "ChecklistItem");

            migrationBuilder.DropTable(
                name: "DocumentCategory");

            migrationBuilder.DropTable(
                name: "Contract");

            migrationBuilder.DropTable(
                name: "POItem");

            migrationBuilder.DropTable(
                name: "EvaluationCriteria");

            migrationBuilder.DropTable(
                name: "SupplierEvaluation");

            migrationBuilder.DropTable(
                name: "Message");

            migrationBuilder.DropTable(
                name: "Invoice");

            migrationBuilder.DropTable(
                name: "PlatformUser");

            migrationBuilder.DropTable(
                name: "PriceList");

            migrationBuilder.DropTable(
                name: "OrderItem");

            migrationBuilder.DropTable(
                name: "OrderShipment");

            migrationBuilder.DropTable(
                name: "Delivery");

            migrationBuilder.DropTable(
                name: "Inventory");

            migrationBuilder.DropTable(
                name: "Billing");

            migrationBuilder.DropTable(
                name: "SubscriptionPlan");

            migrationBuilder.DropTable(
                name: "Role");

            migrationBuilder.DropTable(
                name: "ComplianceChecklist");

            migrationBuilder.DropTable(
                name: "Conversation");

            migrationBuilder.DropTable(
                name: "ProductVariant");

            migrationBuilder.DropTable(
                name: "MarketplaceOrder");

            migrationBuilder.DropTable(
                name: "PurchaseOrder");

            migrationBuilder.DropTable(
                name: "Item");

            migrationBuilder.DropTable(
                name: "Warehouse");

            migrationBuilder.DropTable(
                name: "ProductListing");

            migrationBuilder.DropTable(
                name: "PurchaseRequisition");

            migrationBuilder.DropTable(
                name: "ProductCategory");

            migrationBuilder.DropTable(
                name: "TenantUser");

            migrationBuilder.DropTable(
                name: "Tenant");
        }
    }
}
