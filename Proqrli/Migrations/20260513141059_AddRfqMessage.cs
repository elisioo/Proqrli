using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Proqrli.Migrations
{
    /// <inheritdoc />
    public partial class AddRfqMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RfqMessage",
                columns: table => new
                {
                    MessageID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RFQID = table.Column<int>(type: "int", nullable: false),
                    VendorTenantID = table.Column<int>(type: "int", nullable: false),
                    SenderType = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RfqMessage", x => x.MessageID);
                    table.ForeignKey(
                        name: "FK_RfqMessage_RequestForQuotation_RFQID",
                        column: x => x.RFQID,
                        principalTable: "RequestForQuotation",
                        principalColumn: "RFQID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RfqMessage_Tenant_VendorTenantID",
                        column: x => x.VendorTenantID,
                        principalTable: "Tenant",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RfqMessage_RFQID",
                table: "RfqMessage",
                column: "RFQID");

            migrationBuilder.CreateIndex(
                name: "IX_RfqMessage_VendorTenantID",
                table: "RfqMessage",
                column: "VendorTenantID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RfqMessage");
        }
    }
}
