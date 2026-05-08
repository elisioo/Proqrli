using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Proqrli.Migrations
{
    /// <inheritdoc />
    public partial class addedSourcing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RequestForQuotation",
                columns: table => new
                {
                    RFQID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    LinkedPRID = table.Column<int>(type: "int", nullable: true),
                    CreatedByUserID = table.Column<int>(type: "int", nullable: false),
                    RFQNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClosesAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SourcingRoute = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestForQuotation", x => x.RFQID);
                    table.ForeignKey(
                        name: "FK_RequestForQuotation_PurchaseRequisition_LinkedPRID",
                        column: x => x.LinkedPRID,
                        principalTable: "PurchaseRequisition",
                        principalColumn: "PRID");
                    table.ForeignKey(
                        name: "FK_RequestForQuotation_TenantUser_CreatedByUserID",
                        column: x => x.CreatedByUserID,
                        principalTable: "TenantUser",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestForQuotation_Tenant_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RfqResponse",
                columns: table => new
                {
                    ResponseID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RFQID = table.Column<int>(type: "int", nullable: false),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RfqResponse", x => x.ResponseID);
                    table.ForeignKey(
                        name: "FK_RfqResponse_RequestForQuotation_RFQID",
                        column: x => x.RFQID,
                        principalTable: "RequestForQuotation",
                        principalColumn: "RFQID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RfqResponse_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RfqVendorInvitation",
                columns: table => new
                {
                    InvitationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RFQID = table.Column<int>(type: "int", nullable: false),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    InvitedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    HasResponded = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RfqVendorInvitation", x => x.InvitationID);
                    table.ForeignKey(
                        name: "FK_RfqVendorInvitation_RequestForQuotation_RFQID",
                        column: x => x.RFQID,
                        principalTable: "RequestForQuotation",
                        principalColumn: "RFQID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RfqVendorInvitation_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RequestForQuotation_CreatedByUserID",
                table: "RequestForQuotation",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_RequestForQuotation_LinkedPRID",
                table: "RequestForQuotation",
                column: "LinkedPRID");

            migrationBuilder.CreateIndex(
                name: "IX_RequestForQuotation_TenantID",
                table: "RequestForQuotation",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_RfqResponse_RFQID",
                table: "RfqResponse",
                column: "RFQID");

            migrationBuilder.CreateIndex(
                name: "IX_RfqResponse_VendorTenantID",
                table: "RfqResponse",
                column: "VendorTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_RfqVendorInvitation_RFQID",
                table: "RfqVendorInvitation",
                column: "RFQID");

            migrationBuilder.CreateIndex(
                name: "IX_RfqVendorInvitation_VendorTenantID",
                table: "RfqVendorInvitation",
                column: "VendorTenantID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RfqResponse");

            migrationBuilder.DropTable(
                name: "RfqVendorInvitation");

            migrationBuilder.DropTable(
                name: "RequestForQuotation");
        }
    }
}
