using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Proqrli.Migrations
{
    /// <inheritdoc />
    public partial class FixCascadePaths : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AccreditationLink_TenantUser_ApprovedByUserID",
                table: "AccreditationLink");

            migrationBuilder.DropForeignKey(
                name: "FK_ComplianceCheckResult_TenantUser_CheckedByID",
                table: "ComplianceCheckResult");

            migrationBuilder.DropForeignKey(
                name: "FK_ComplianceDocument_TenantUser_UploadedByID",
                table: "ComplianceDocument");

            migrationBuilder.DropForeignKey(
                name: "FK_Contract_TenantUser_CreatedByUserID",
                table: "Contract");

            migrationBuilder.DropForeignKey(
                name: "FK_Delivery_TenantUser_ReceivedByID",
                table: "Delivery");

            migrationBuilder.DropForeignKey(
                name: "FK_MarketplaceOrder_TenantUser_PlacedByUserID",
                table: "MarketplaceOrder");

            migrationBuilder.DropForeignKey(
                name: "FK_Message_TenantUser_SenderUserID",
                table: "Message");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderShipment_TenantUser_PackedByUserID",
                table: "OrderShipment");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTenant_TenantUser_ProcessedByID",
                table: "PaymentTenant");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductReview_TenantUser_ReviewedByUserID",
                table: "ProductReview");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequisition_TenantUser_RequestedByID",
                table: "PurchaseRequisition");

            migrationBuilder.DropForeignKey(
                name: "FK_ReorderAlert_TenantUser_AcknowledgedByID",
                table: "ReorderAlert");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovement_TenantUser_UserID",
                table: "StockMovement");

            migrationBuilder.DropForeignKey(
                name: "FK_SupplierEvaluation_TenantUser_EvaluatedByID",
                table: "SupplierEvaluation");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantAuditLog_TenantUser_UserID",
                table: "TenantAuditLog");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRole_TenantUser_UserID",
                table: "UserRole");

            migrationBuilder.AddForeignKey(
                name: "FK_AccreditationLink_TenantUser_ApprovedByUserID",
                table: "AccreditationLink",
                column: "ApprovedByUserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ComplianceCheckResult_TenantUser_CheckedByID",
                table: "ComplianceCheckResult",
                column: "CheckedByID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ComplianceDocument_TenantUser_UploadedByID",
                table: "ComplianceDocument",
                column: "UploadedByID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Contract_TenantUser_CreatedByUserID",
                table: "Contract",
                column: "CreatedByUserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Delivery_TenantUser_ReceivedByID",
                table: "Delivery",
                column: "ReceivedByID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MarketplaceOrder_TenantUser_PlacedByUserID",
                table: "MarketplaceOrder",
                column: "PlacedByUserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Message_TenantUser_SenderUserID",
                table: "Message",
                column: "SenderUserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderShipment_TenantUser_PackedByUserID",
                table: "OrderShipment",
                column: "PackedByUserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTenant_TenantUser_ProcessedByID",
                table: "PaymentTenant",
                column: "ProcessedByID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductReview_TenantUser_ReviewedByUserID",
                table: "ProductReview",
                column: "ReviewedByUserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseRequisition_TenantUser_RequestedByID",
                table: "PurchaseRequisition",
                column: "RequestedByID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ReorderAlert_TenantUser_AcknowledgedByID",
                table: "ReorderAlert",
                column: "AcknowledgedByID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovement_TenantUser_UserID",
                table: "StockMovement",
                column: "UserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SupplierEvaluation_TenantUser_EvaluatedByID",
                table: "SupplierEvaluation",
                column: "EvaluatedByID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TenantAuditLog_TenantUser_UserID",
                table: "TenantAuditLog",
                column: "UserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRole_TenantUser_UserID",
                table: "UserRole",
                column: "UserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AccreditationLink_TenantUser_ApprovedByUserID",
                table: "AccreditationLink");

            migrationBuilder.DropForeignKey(
                name: "FK_ComplianceCheckResult_TenantUser_CheckedByID",
                table: "ComplianceCheckResult");

            migrationBuilder.DropForeignKey(
                name: "FK_ComplianceDocument_TenantUser_UploadedByID",
                table: "ComplianceDocument");

            migrationBuilder.DropForeignKey(
                name: "FK_Contract_TenantUser_CreatedByUserID",
                table: "Contract");

            migrationBuilder.DropForeignKey(
                name: "FK_Delivery_TenantUser_ReceivedByID",
                table: "Delivery");

            migrationBuilder.DropForeignKey(
                name: "FK_MarketplaceOrder_TenantUser_PlacedByUserID",
                table: "MarketplaceOrder");

            migrationBuilder.DropForeignKey(
                name: "FK_Message_TenantUser_SenderUserID",
                table: "Message");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderShipment_TenantUser_PackedByUserID",
                table: "OrderShipment");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTenant_TenantUser_ProcessedByID",
                table: "PaymentTenant");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductReview_TenantUser_ReviewedByUserID",
                table: "ProductReview");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequisition_TenantUser_RequestedByID",
                table: "PurchaseRequisition");

            migrationBuilder.DropForeignKey(
                name: "FK_ReorderAlert_TenantUser_AcknowledgedByID",
                table: "ReorderAlert");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovement_TenantUser_UserID",
                table: "StockMovement");

            migrationBuilder.DropForeignKey(
                name: "FK_SupplierEvaluation_TenantUser_EvaluatedByID",
                table: "SupplierEvaluation");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantAuditLog_TenantUser_UserID",
                table: "TenantAuditLog");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRole_TenantUser_UserID",
                table: "UserRole");

            migrationBuilder.AddForeignKey(
                name: "FK_AccreditationLink_TenantUser_ApprovedByUserID",
                table: "AccreditationLink",
                column: "ApprovedByUserID",
                principalTable: "TenantUser",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ComplianceCheckResult_TenantUser_CheckedByID",
                table: "ComplianceCheckResult",
                column: "CheckedByID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ComplianceDocument_TenantUser_UploadedByID",
                table: "ComplianceDocument",
                column: "UploadedByID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Contract_TenantUser_CreatedByUserID",
                table: "Contract",
                column: "CreatedByUserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Delivery_TenantUser_ReceivedByID",
                table: "Delivery",
                column: "ReceivedByID",
                principalTable: "TenantUser",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MarketplaceOrder_TenantUser_PlacedByUserID",
                table: "MarketplaceOrder",
                column: "PlacedByUserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Message_TenantUser_SenderUserID",
                table: "Message",
                column: "SenderUserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderShipment_TenantUser_PackedByUserID",
                table: "OrderShipment",
                column: "PackedByUserID",
                principalTable: "TenantUser",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTenant_TenantUser_ProcessedByID",
                table: "PaymentTenant",
                column: "ProcessedByID",
                principalTable: "TenantUser",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductReview_TenantUser_ReviewedByUserID",
                table: "ProductReview",
                column: "ReviewedByUserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseRequisition_TenantUser_RequestedByID",
                table: "PurchaseRequisition",
                column: "RequestedByID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ReorderAlert_TenantUser_AcknowledgedByID",
                table: "ReorderAlert",
                column: "AcknowledgedByID",
                principalTable: "TenantUser",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovement_TenantUser_UserID",
                table: "StockMovement",
                column: "UserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SupplierEvaluation_TenantUser_EvaluatedByID",
                table: "SupplierEvaluation",
                column: "EvaluatedByID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TenantAuditLog_TenantUser_UserID",
                table: "TenantAuditLog",
                column: "UserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRole_TenantUser_UserID",
                table: "UserRole",
                column: "UserID",
                principalTable: "TenantUser",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
