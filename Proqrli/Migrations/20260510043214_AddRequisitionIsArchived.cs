using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Proqrli.Migrations
{
    /// <inheritdoc />
    public partial class AddRequisitionIsArchived : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "PurchaseRequisition",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "PurchaseRequisition");
        }
    }
}
