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

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AuthUser = {
    userId: number;
    email: string;
    fullName: string;
    tenantId: number;
    companyName: string;
    tenantType: string;   // "Buyer" | "Vendor"
    role: string;         // e.g. "buyer_owner", "inventory_manager"
};

export type RegisterPayload = {
    companyName: string;
    fullName: string;
    email: string;
    password: string;
    industry?: string;
    companySize?: string;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export const authApi = {
    register: (body: RegisterPayload) =>
        req<AuthUser>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
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
    status: "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Converted to RFQ" | "Converted to PO";
    raisedAt: string;
    neededBy: string;
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
    status: Requisition["status"];
    neededBy: string;
}>;

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
    status: PurchaseOrder["status"];
    expectedDelivery: string;
    paymentTerms: string;
    total: number;
}>;

export type VendorBill = {
    id: string;
    billNumber: string;
    vendorName: string;
    poRef: string;
    amount: number;
    status: "Pending" | "Approved" | "Scheduled" | "Paid" | "Disputed" | "Overdue" | "Cancelled";
    receivedAt: string;
    dueAt: string;
};

export type CreateVendorBillPayload = {
    billNumber?: string;
    pOID: number;
    subTotal: number;
    taxAmount: number;
    dueAt: string;
};

export type BuyerPayment = {
    id: string;
    reference: string;
    vendorName: string;
    billRef: string;
    amount: number;
    status: "Scheduled" | "Processing" | "Paid" | "Failed";
    scheduledFor: string;
    method: string;
};

export type CreatePaymentPayload = {
    invoiceID: number;
    amount: number;
    method: string;
    scheduledFor: string;
};

// ─── Requisitions

export const requisitionsApi = {
    getAll:  ()                              => req<Requisition[]>("/purchaserequisitions"),
    getById: (id: string)                    => req<Requisition>(`/purchaserequisitions/${id}`),
    create:  (body: CreateRequisitionPayload)=> req<Requisition>("/purchaserequisitions", { method: "POST", body: JSON.stringify(body) }),
    update:  (id: string, body: UpdateRequisitionPayload) =>
                                               req<Requisition>(`/purchaserequisitions/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    archive: (id: string)                    => req<void>(`/purchaserequisitions/${id}`, { method: "DELETE" }),
};

// ─── Purchase Orders 

export const purchaseOrdersApi = {
    getAll:  ()                                => req<PurchaseOrder[]>("/purchaseorders"),
    getById: (id: string)                      => req<PurchaseOrder>(`/purchaseorders/${id}`),
    create:  (body: CreatePurchaseOrderPayload)=> req<PurchaseOrder>("/purchaseorders", { method: "POST", body: JSON.stringify(body) }),
    update:  (id: string, body: UpdatePurchaseOrderPayload) =>
                                                 req<PurchaseOrder>(`/purchaseorders/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    cancel:  (id: string)                      => req<void>(`/purchaseorders/${id}`, { method: "DELETE" }),
};

// ─── Bills

export const billsApi = {
    getAll:  ()                              => req<VendorBill[]>("/bills"),
    getById: (id: string)                    => req<VendorBill>(`/bills/${id}`),
    create:  (body: CreateVendorBillPayload) => req<VendorBill>("/bills", { method: "POST", body: JSON.stringify(body) }),
    update:  (id: string, body: Partial<{ status: string; amount: number; dueAt: string }>) =>
                                               req<VendorBill>(`/bills/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    cancel:  (id: string)                    => req<void>(`/bills/${id}`, { method: "DELETE" }),
};

// ─── Payments 

export const paymentsApi = {
    getAll:  ()                              => req<BuyerPayment[]>("/payments"),
    getById: (id: string)                    => req<BuyerPayment>(`/payments/${id}`),
    create:  (body: CreatePaymentPayload)    => req<BuyerPayment>("/payments", { method: "POST", body: JSON.stringify(body) }),
    update:  (id: string, body: Partial<{ status: string; scheduledFor: string }>) =>
                                               req<BuyerPayment>(`/payments/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
};
