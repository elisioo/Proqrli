/* eslint-disable prettier/prettier */
// lib/api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Typed API client for ProqrLi backend.
// All types mirror the C# DTOs exactly so no runtime mapping is needed.
// Replace VITE_API_BASE in your .env:  VITE_API_BASE=https://localhost:7xxx/api
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_BASE ?? "/api";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",          // sends the auth cookie
        ...init,
    });
    if (!res.ok) {
        // Try to parse a structured error body ({ error: "..." })
        const body = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
        throw new Error(body.error ?? res.statusText);
    }
    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
}


export type AuthUser = {
    userId: number;
    email: string;
    fullName: string;
    position: string;
    contactNumber: string;
    tenantId: number;
    companyName: string;
    tenantType: string;   // "Buyer" | "Vendor"
    role: string;         // e.g. "buyer_owner", "inventory_manager"
    onboardingComplete: boolean;
};

export type SendOtpPayload = { email: string };
export type VerifyOtpPayload = { email: string; code: string };

export type RegisterPayload = {
    email: string;
    password: string;
    portal?: string;   // "buyer" | "vendor"
};

export type OnboardingPayload = {
    companyName: string;
    companySize: string;
    fullName: string;
    contactNumber: string;
    position: string;
    industry?: string;
    hasBuyerProfile?: boolean;
    buyerCompanyName?: string;
    buyerContactName?: string;
    buyerEmail?: string;
    buyerPhone?: string;
    planId?: number;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export const authApi = {
    sendOtp: (body: SendOtpPayload) =>
        req<{ message: string; devCode?: string }>("/auth/send-otp", { method: "POST", body: JSON.stringify(body) }),
    verifyOtp: (body: VerifyOtpPayload) =>
        req<{ verified: boolean }>("/auth/verify-otp", { method: "POST", body: JSON.stringify(body) }),
    register: (body: RegisterPayload) =>
        req<AuthUser>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
    onboarding: (body: OnboardingPayload) =>
        req<AuthUser>("/auth/onboarding", { method: "POST", body: JSON.stringify(body) }),
    login: (body: LoginPayload) =>
        req<AuthUser>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    logout: () =>
        req<void>("/auth/logout", { method: "POST" }),
    me: () =>
        req<AuthUser>("/auth/me"),
};


export type Requisition = {
    id: string;
    prNumber: string;
    title: string;
    requestedBy: string;
    department: string;
    amount: number;
    itemCount: number;
    status: "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Converted to RFQ" | "Converted to PO" | "Cancelled";
    raisedAt: string;
    neededBy: string;
    archived?: boolean;
};

export type CreateRequisitionPayload = {
    prNumber?: string;
    title: string;
    requestedBy?: string;
    department?: string;
    amount: number;
    itemCount?: number;
    neededBy: string;
};

export type UpdateRequisitionPayload = Partial<{
    title: string;
    department: string;
    amount: number;
    itemCount: number;
    status: string;
    neededBy: string;
}>;

export const requisitionsApi = {
    getAll: () => req<Requisition[]>("/purchaserequisitions"),
    getById: (id: string) => req<Requisition>(`/purchaserequisitions/${id}`),
    create: (body: CreateRequisitionPayload) => req<Requisition>("/purchaserequisitions", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: UpdateRequisitionPayload) =>
        req<Requisition>(`/purchaserequisitions/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    archive: (id: string) => req<void>(`/purchaserequisitions/${id}`, { method: "DELETE" }),
};

export type PurchaseOrder = {
    id: string;
    poNumber: string;
    vendorName: string;
    vendorId: string;
    status: "Draft" | "Pending Approval" | "Issued" | "Acknowledged" | "Partially Received" | "Received" | "Closed" | "Cancelled";
    total: number;
    itemCount: number;
    poDate: string;
    expectedDelivery: string;
    paymentTerms: string;
    raisedBy: string;
    prRef?: string;
    archived?: boolean;
};

export type CreatePurchaseOrderPayload = {
    poNumber?: string;
    pRID: number;
    vendorTenantID: number;
    expectedDelivery?: string;
    paymentTerms?: string;
    total: number;
};

export type UpdatePurchaseOrderPayload = Partial<{
    status: string;
    expectedDelivery: string;
    paymentTerms: string;
    total: number;
}>;

export const purchaseOrdersApi = {
    getAll: () => req<PurchaseOrder[]>("/purchaseorders"),
    getById: (id: string) => req<PurchaseOrder>(`/purchaseorders/${id}`),
    create: (body: CreatePurchaseOrderPayload) => req<PurchaseOrder>("/purchaseorders", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: UpdatePurchaseOrderPayload) =>
        req<PurchaseOrder>(`/purchaseorders/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    archive: (id: string) => req<void>(`/purchaseorders/${id}`, { method: "DELETE" }),
    getPRLookup: () => req<{ id: number; label: string }[]>("/purchaseorders/pr-lookup"),
    getVendorLookup: () => req<{ id: number; label: string }[]>("/purchaseorders/vendor-lookup"),
};


export type VendorBill = {
    id: string;
    billNumber: string;
    vendorName: string;
    poRef: string;
    amount: number;
    status: "Pending" | "Approved" | "Scheduled" | "Paid" | "Disputed" | "Overdue" | "Cancelled";
    receivedAt: string;
    dueAt: string;
    archived?: boolean;
};

export type CreateVendorBillPayload = {
    billNumber?: string;
    pOID: number;
    subTotal: number;
    taxAmount: number;
    dueAt: string;
};

export type UpdateVendorBillPayload = Partial<{
    status: string;
    amount: number;
    dueAt: string;
}>;

export const billsApi = {
    getAll: () => req<VendorBill[]>("/invoices"),
    getById: (id: string) => req<VendorBill>(`/invoices/${id}`),
    create: (body: CreateVendorBillPayload) => req<VendorBill>("/invoices", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: UpdateVendorBillPayload) =>
        req<VendorBill>(`/invoices/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    archive: (id: string) => req<void>(`/invoices/${id}`, { method: "DELETE" }),
    getPOLookup: () => req<{ id: number; label: string; vendorName: string }[]>("/invoices/po-lookup"),
    getTaxRate: (countryCode: string) => req<{ success: boolean, standard_rate?: { rate: number } }>(`/invoices/tax-rate?country=${countryCode}`),
};


export type BuyerPayment = {
    id: string;
    reference: string;
    vendorName: string;
    billRef: string;
    amount: number;
    status: "Scheduled" | "Processing" | "Paid" | "Failed" | "Pending";
    scheduledFor: string;
    method: string;
    archived?: boolean;
};

export type CreatePaymentPayload = {
    invoiceID: number;
    amount: number;
    method: string;
    scheduledFor: string;
};

export type UpdatePaymentPayload = Partial<{
    status: string;
    scheduledFor: string;
}>;

export const paymentsApi = {
    getAll: () => req<BuyerPayment[]>("/payments"),
    getById: (id: string) => req<BuyerPayment>(`/payments/${id}`),
    create: (body: CreatePaymentPayload) => req<BuyerPayment>("/payments", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: UpdatePaymentPayload) =>
        req<BuyerPayment>(`/payments/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    archive: (id: string) => req<void>(`/payments/${id}`, { method: "DELETE" }),
    getInvoiceLookup: () => req<{ id: number; label: string }[]>("/payments/invoice-lookup"),
};


export type InventoryItemDto = {
    id: string;
    sku: string;
    name: string;
    category: string;
    uom: string;
    location: string;
    onHand: number;
    onOrder: number;
    reorderPoint: number;
    reorderQty: number;
    unitCost: number;
    preferredVendorId?: string;
    preferredVendorName?: string;
    archived?: boolean;
};

export const inventoryApi = {
    getAll: () => req<InventoryItemDto[]>("/inventory"),
    create: (body: Omit<InventoryItemDto, "id">) => req<InventoryItemDto>("/inventory", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<InventoryItemDto>) => req<InventoryItemDto>(`/inventory/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    archive: (id: string) => req<void>(`/inventory/${id}`, { method: "DELETE" }),
};


export type VendorRecord = {
    id: string;
    companyName: string;
    category: string;
    status: "Accredited" | "Pending" | "Blocked";
    riskClass: "Low" | "Medium" | "High";
    riskScore: number;
    rating: number;
    totalSpend: number;
    orders: number;
    onTimeRate: number;
    initials: string;
    archived?: boolean;
};

export type CreateVendorPayload = {
    companyName: string;
    category?: string;
    status?: string;
};

export type UpdateVendorPayload = Partial<{
    companyName: string;
    category: string;
    status: string;
    riskClass: string;
    riskScore: number;
    rating: number;
}>;

export type MarketplaceVendorDto = {
    id: string;
    companyName: string;
    initials: string;
    avatarColor: string;
    category: string;
    location: string;
    description: string;
    tags: string[];
    rating: number;
    reviewCount: number;
    onTimeRate: number;
    verified: boolean;
    yearsActive: number;
    minOrderValue: number;
};

export const vendorsApi = {
    getAll: () => req<VendorRecord[]>("/vendors"),
    getById: (id: string) => req<VendorRecord>(`/vendors/${id}`),
    create: (body: CreateVendorPayload) => req<VendorRecord>("/vendors", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: UpdateVendorPayload) =>
        req<VendorRecord>(`/vendors/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    archive: (id: string) => req<void>(`/vendors/${id}`, { method: "DELETE" }),
    getMarketplace: (page: number = 1, pageSize: number = 10, search: string = "", category: string = "") => {
        const query = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString(), search, category });
        return req<{ data: MarketplaceVendorDto[], total: number, page: number, pageSize: number }>(`/vendors/marketplace?${query.toString()}`);
    },
};


export type DeliveryRecord = {
    id: string;
    grnNumber: string;
    poRef: string;
    vendorName: string;
    receivedAt: string;
    receivedBy: string;
    itemCount: number;
    status: "Pending" | "Pending Inspection" | "Accepted" | "Partially Accepted" | "Rejected" | "Cancelled";
    notes?: string;
    courierName?: string;
    trackingNumber?: string;
    archived?: boolean;
};

export type CreateDeliveryPayload = {
    pOID: number;
    grnNumber?: string;
    expectedDate?: string;
    courierName?: string;
    trackingNumber?: string;
    deliveryAddress?: string;
    notes?: string;
};

export type UpdateDeliveryPayload = Partial<{
    status: string;
    notes: string;
    courierName: string;
    trackingNumber: string;
}>;

export const deliveriesApi = {
    getAll: () => req<DeliveryRecord[]>("/deliveries"),
    getById: (id: string) => req<DeliveryRecord>(`/deliveries/${id}`),
    create: (body: CreateDeliveryPayload) => req<DeliveryRecord>("/deliveries", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: UpdateDeliveryPayload) =>
        req<DeliveryRecord>(`/deliveries/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    archive: (id: string) => req<void>(`/deliveries/${id}`, { method: "DELETE" }),
    getPOLookup: () => req<{ id: number; label: string }[]>("/deliveries/po-lookup"),
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Compliance & Risk ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export type RiskAlert = {
    id: string;
    vendorName: string;
    level: "Low" | "Medium" | "High";
    signal: string;
    detail: string;
    raisedAt: string;
};

export type VendorRisk = {
    id: string;
    vendorName: string;
    initials: string;
    category: string;
    riskClassification: "Low" | "Medium" | "High";
    mlRiskScore: number;
    onTimeDeliveryRate: number;
    defectRate: number;
    complianceViolations: number;
};

export type ComplianceDoc = {
    id: string;
    title: string;
    documentNumber: string;
    category: string;
    status: string;
    issuedDate?: string;
    expiryDate?: string;
    uploadedBy: string;
    uploadedAt: string;
    archived?: boolean;
};

export type CreateComplianceDocPayload = {
    title: string;
    documentNumber?: string;
    categoryID: number;
    filePath?: string;
    issuedDate?: string;
    expiryDate?: string;
    relatedModule?: string;
    relatedRecordID?: string;
};

export type UpdateComplianceDocPayload = Partial<{
    title: string;
    status: string;
    expiryDate: string;
}>;

export const complianceApi = {
    getRiskScores: () => req<VendorRisk[]>("/compliance/risk-scores"),
    getAlerts: () => req<RiskAlert[]>("/compliance/alerts"),
    getDocuments: () => req<ComplianceDoc[]>("/compliance/documents"),
    createDocument: (body: CreateComplianceDocPayload) => req<ComplianceDoc>("/compliance/documents", { method: "POST", body: JSON.stringify(body) }),
    updateDocument: (id: string, body: UpdateComplianceDocPayload) =>
        req<ComplianceDoc>(`/compliance/documents/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    archiveDocument: (id: string) => req<void>(`/compliance/documents/${id}`, { method: "DELETE" }),
    getCategories: () => req<{ categoryID: number; categoryName: string; requiresExpiry: boolean }[]>("/compliance/categories"),
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Contracts ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export type ContractRecord = {
    id: string;
    contractNumber: string;
    vendorName: string;
    vendorId: string;
    contractType: string;
    startDate: string;
    endDate: string;
    status: "Draft" | "Active" | "Expired" | "Terminated" | "Cancelled";
    totalValue: number;
    terms?: string;
    createdBy: string;
    archived?: boolean;
};

export type CreateContractPayload = {
    contractNumber?: string;
    vendorTenantID: number;
    contractType?: string;
    startDate: string;
    endDate: string;
    totalValue: number;
    terms?: string;
};

export type UpdateContractPayload = Partial<{
    status: string;
    endDate: string;
    totalValue: number;
    terms: string;
}>;

export const contractsApi = {
    getAll: () => req<ContractRecord[]>("/contracts"),
    getById: (id: string) => req<ContractRecord>(`/contracts/${id}`),
    create: (body: CreateContractPayload) => req<ContractRecord>("/contracts", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: UpdateContractPayload) =>
        req<ContractRecord>(`/contracts/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    archive: (id: string) => req<void>(`/contracts/${id}`, { method: "DELETE" }),
    getVendorLookup: () => req<{ id: number; label: string }[]>("/contracts/vendor-lookup"),
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── RFQs ──────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export type RfqDto = {
    id: string;
    rfqNumber: string;
    title: string;
    category: string;
    prRef: string;
    responsesReceived: number;
    invitedVendors: number;
    closesAt: string;
    status: string;
    linkedPrId: string;
    notes: string;
    sourcingRoute: string;
    archived?: boolean;
};

export type CreateRfqDto = {
    title: string;
    category: string;
    closesAt: string;
    notes: string;
    linkedPrId: string;
    sourcingRoute?: string;
};

export type UpdateRfqDto = Partial<{
    title: string;
    category: string;
    closesAt: string;
    notes: string;
    sourcingRoute: string;
    status: string;
}>;

export type RfqLineDto = {
    id: string;
    sku: string;
    description: string;
    qty: number;
    uom: string;
    targetPrice: number;
    notes: string;
};

export type RfqInvitationDto = {
    id: string;
    vendorId: string;
    vendorName: string;
    vendorStatus: string;
    invitedAt: string;
};

export type RfqQuoteDto = {
    id: string;
    vendorId: string;
    vendorName: string;
    total: number;
    rank: number;
    status: string;
    submittedAt: string;
};

export type RfqDetailDto = {
    rfq: RfqDto;
    lines: RfqLineDto[];
    invitations: RfqInvitationDto[];
    quotes: RfqQuoteDto[];
};

export const rfqsApi = {
    getAll: (page: number = 1, pageSize: number = 10, search: string = "", status: string = "") => {
        const query = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString(), search, status });
        return req<{ data: RfqDto[], total: number, page: number, pageSize: number }>(`/rfqs?${query.toString()}`);
    },
    getById: (id: string) => req<RfqDto>(`/rfqs/${id}`),
    getDetail: (id: string) => req<RfqDetailDto>(`/rfqs/${id}/detail`),
    create: (body: CreateRfqDto) => req<{ id: string }>("/rfqs", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: UpdateRfqDto) =>
        req<{ id: string }>(`/rfqs/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    archive: (id: string) => req<void>(`/rfqs/${id}`, { method: "DELETE" }),
    inviteVendors: (id: string, vendorIds: number[]) => req<{ message: string }>(`/rfqs/${id}/invite`, { method: "POST", body: JSON.stringify({ vendorIds }) }),
    awardQuote: (id: string, responseId: string) => req<{ poId: string, poNumber: string }>(`/rfqs/${id}/award/${responseId}`, { method: "POST" }),
};

