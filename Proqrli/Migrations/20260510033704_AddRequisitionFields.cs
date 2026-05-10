using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Proqrli.Migrations
{
    /// <inheritdoc />
    public partial class AddRequisitionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Justification",
                table: "PurchaseRequisition",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ManualItemCount",
                table: "PurchaseRequisition",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "PurchaseRequisition",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Justification",
                table: "PurchaseRequisition");

            migrationBuilder.DropColumn(
                name: "ManualItemCount",
                table: "PurchaseRequisition");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "PurchaseRequisition");
        }
    }
}
