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
}
