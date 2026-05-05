using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Proqrli.Migrations
{
    /// <inheritdoc />
    public partial class MakePRIDOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseOrder_PurchaseRequisition_PRID",
                table: "PurchaseOrder");

            migrationBuilder.AlterColumn<int>(
                name: "PRID",
                table: "PurchaseOrder",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrder_PurchaseRequisition_PRID",
                table: "PurchaseOrder",
                column: "PRID",
                principalTable: "PurchaseRequisition",
                principalColumn: "PRID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseOrder_PurchaseRequisition_PRID",
                table: "PurchaseOrder");

            migrationBuilder.AlterColumn<int>(
                name: "PRID",
                table: "PurchaseOrder",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrder_PurchaseRequisition_PRID",
                table: "PurchaseOrder",
                column: "PRID",
                principalTable: "PurchaseRequisition",
                principalColumn: "PRID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
