// DTOs — these are the JSON shapes your React frontend expects.
// Property names match the TypeScript types in buyer-mock-data.ts exactly
// so no mapping is needed on the frontend side.

namespace ProqrLi.DTOs
{
    // ─── Requisition ──────────────────────────────────────────────────────────
    // Matches: type Requisition in buyer-mock-data.ts
    public class RequisitionDto
    {
        public string Id          { get; set; } = "";   // PRID cast to string
        public string PrNumber    { get; set; } = "";
        public string Title       { get; set; } = "";   // maps to Purpose
        public string RequestedBy { get; set; } = "";   // RequestedBy.FullName
        public string Department  { get; set; } = "";
        public decimal Amount     { get; set; }         // TotalEstimated
        public int ItemCount      { get; set; }         // count of RequisitionItems
        public string Status      { get; set; } = "";
        public string RaisedAt    { get; set; } = "";   // RequestDate ISO
        public string NeededBy    { get; set; } = "";   // RequiredDate ISO
    }

    public class CreateRequisitionDto
    {
        public string? PrNumber    { get; set; }
        public string Title        { get; set; } = "";
        public string? RequestedBy { get; set; }
        public string? Department  { get; set; }
        public decimal Amount      { get; set; }
        public int ItemCount       { get; set; } = 1;
        public string NeededBy     { get; set; } = "";
    }

    public class UpdateRequisitionDto
    {
        public string? Title      { get; set; }
        public string? Department { get; set; }
        public decimal? Amount    { get; set; }
        public int? ItemCount     { get; set; }
        public string? Status     { get; set; }
        public string? NeededBy   { get; set; }
    }

    // ─── Purchase Order ───────────────────────────────────────────────────────
    // Matches: type BuyerPurchaseOrder in buyer-mock-data.ts
    public class PurchaseOrderDto
    {
        public string Id               { get; set; } = "";  // POID as string
        public string PoNumber         { get; set; } = "";
        public string VendorName       { get; set; } = "";
        public string VendorId         { get; set; } = "";  // VendorTenantID as string
        public string Status           { get; set; } = "";
        public decimal Total           { get; set; }
        public int ItemCount           { get; set; }
        public string PoDate           { get; set; } = "";
        public string ExpectedDelivery { get; set; } = "";
        public string PaymentTerms     { get; set; } = "";
        public string RaisedBy         { get; set; } = "";
        public string? PrRef           { get; set; }        // PR number or null
        public bool Archived           { get; set; }
    }

    public class CreatePurchaseOrderDto
    {
        public string? PoNumber        { get; set; }
        public int PRID                { get; set; }
        public int VendorTenantID      { get; set; }
        public string? ExpectedDelivery{ get; set; }
        public string? PaymentTerms    { get; set; }
        public decimal Total           { get; set; }
    }

    public class UpdatePurchaseOrderDto
    {
        public string? Status          { get; set; }
        public string? ExpectedDelivery{ get; set; }
        public string? PaymentTerms    { get; set; }
        public decimal? Total          { get; set; }
    }

    // ─── Vendor Bill (Invoice) ────────────────────────────────────────────────
    // Matches: type VendorBill in buyer-mock-data.ts
    public class VendorBillDto
    {
        public string Id         { get; set; } = "";  // InvoiceID as string
        public string BillNumber { get; set; } = "";  // InvoiceNumber
        public string VendorName { get; set; } = "";
        public string PoRef      { get; set; } = "";  // linked PO number
        public decimal Amount    { get; set; }        // TotalAmount
        public string Status     { get; set; } = "";
        public string ReceivedAt { get; set; } = "";  // InvoiceDate ISO
        public string DueAt      { get; set; } = "";  // DueDate ISO
    }

    public class CreateVendorBillDto
    {
        public string? BillNumber { get; set; }
        public int POID           { get; set; }
        public decimal SubTotal   { get; set; }
        public decimal TaxAmount  { get; set; }
        public string DueAt       { get; set; } = "";
    }

    public class UpdateVendorBillDto
    {
        public string? Status  { get; set; }
        public decimal? Amount { get; set; }
        public string? DueAt   { get; set; }
    }

    // ─── Payment ──────────────────────────────────────────────────────────────
    // Matches: type BuyerPayment in buyer-mock-data.ts
    public class PaymentDto
    {
        public string Id           { get; set; } = "";  // PaymentID as string
        public string Reference    { get; set; } = "";
        public string VendorName   { get; set; } = "";
        public string BillRef      { get; set; } = "";  // linked invoice number
        public decimal Amount      { get; set; }
        public string Status       { get; set; } = "";
        public string ScheduledFor { get; set; } = "";
        public string Method       { get; set; } = "";
    }

    public class CreatePaymentDto
    {
        public int InvoiceID      { get; set; }
        public decimal Amount     { get; set; }
        public string Method      { get; set; } = "";
        public string ScheduledFor{ get; set; } = "";
    }

    public class UpdatePaymentDto
    {
        public string? Status      { get; set; }
        public string? ScheduledFor{ get; set; }
    }

    // ─── Request For Quotation ─────────────────────────────────────────────────
    public class RfqDto
    {
        public string Id { get; set; } = "";
        public string RfqNumber { get; set; } = "";
        public string Title { get; set; } = "";
        public string Category { get; set; } = "";
        public string PrRef { get; set; } = "";
        public int ResponsesReceived { get; set; }
        public int InvitedVendors { get; set; }
        public string ClosesAt { get; set; } = "";
        public string Status { get; set; } = "";
        public string LinkedPrId { get; set; } = "";
        public string Notes { get; set; } = "";
        public string SourcingRoute { get; set; } = "rfq";
    }

    public class CreateRfqDto
    {
        public string Title { get; set; } = "";
        public string Category { get; set; } = "";
        public string ClosesAt { get; set; } = "";
        public string Notes { get; set; } = "";
        public string LinkedPrId { get; set; } = "";
        public string? SourcingRoute { get; set; }
    }

    public class UpdateRfqDto
    {
        public string? Title { get; set; }
        public string? Category { get; set; }
        public string? ClosesAt { get; set; }
        public string? Notes { get; set; }
        public string? SourcingRoute { get; set; }
        public string? Status { get; set; }
    }

    public class RfqLineDto
    {
        public string Id { get; set; } = "";
        public string Sku { get; set; } = "";
        public string Description { get; set; } = "";
        public decimal Qty { get; set; }
        public string Uom { get; set; } = "";
        public decimal TargetPrice { get; set; }
        public string Notes { get; set; } = "";
    }

    public class RfqInvitationDto
    {
        public string Id { get; set; } = "";
        public string VendorId { get; set; } = "";
        public string VendorName { get; set; } = "";
        public string VendorStatus { get; set; } = "";
        public string InvitedAt { get; set; } = "";
    }

    public class RfqQuoteDto
    {
        public string Id { get; set; } = "";
        public string VendorId { get; set; } = "";
        public string VendorName { get; set; } = "";
        public decimal Total { get; set; }
        public int Rank { get; set; }
        public string Status { get; set; } = "";
        public string SubmittedAt { get; set; } = "";
    }

    public class RfqDetailDto
    {
        public RfqDto Rfq { get; set; } = new();
        public List<RfqLineDto> Lines { get; set; } = new();
        public List<RfqInvitationDto> Invitations { get; set; } = new();
        public List<RfqQuoteDto> Quotes { get; set; } = new();
    }

    public class InviteVendorsDto
    {
        public List<int> VendorIds { get; set; } = new();
    }
}
