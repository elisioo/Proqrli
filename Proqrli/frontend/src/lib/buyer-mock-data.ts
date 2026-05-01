/* eslint-disable prettier/prettier */
// ProcurLi BUYER portal — mock data mirroring the ERD (procurement side).
// Maps to: TENANT (buyer org), TENANT_USER, VENDOR_PROFILE,
// REQUISITION, RFQ, QUOTATION, PURCHASE_ORDER, GOODS_RECEIPT,
// VENDOR_INVOICE (bill), PAYMENT, VENDOR_RISK_SCORE.

export type BuyerRole =
  | "buyer_owner"          // CFO / Procurement Director
  | "buyer_procurement"    // Buyer / Procurement officer
  | "buyer_approver"       // Approves PRs and POs over threshold
  | "buyer_finance"        // Pays bills, manages cash
  | "inventory_staff"      // Stock in / out operations
  | "inventory_manager";   // Inventory control & warehouse management

export const BUYER_ROLE_LABELS: Record<BuyerRole, string> = {
  buyer_owner: "Owner",
  buyer_procurement: "Procurement",
  buyer_approver: "Approver",
  buyer_finance: "Finance",
  inventory_staff: "Inventory Staff",
  inventory_manager: "Inventory Manager",
};

export const BUYER_ROLE_DESCRIPTIONS: Record<BuyerRole, string> = {
  buyer_owner: "Full access — billing, team, vendors, approvals, payments.",
  buyer_procurement: "Browse marketplace, raise PRs, RFQs, POs. No payment access.",
  buyer_approver: "Approve / reject PRs and POs. Read-only on payments.",
  buyer_finance: "Approve bills, schedule payments, manage budgets.",
  inventory_staff: "Stock in / out operations. View and update inventory levels.",
  inventory_manager: "Inventory control — manage stock, reorder alerts, and warehouse settings.",
};

export const BUYER_PERMISSIONS = [
  "dashboard:view",
  "marketplace:browse",
  "vendors:view", "vendors:manage",
  "requisitions:view", "requisitions:create", "requisitions:approve",
  "rfq:view", "rfq:create",
  "quotations:view", "quotations:award",
  "po:view", "po:create", "po:approve",
  "receipts:view", "receipts:create",
  "bills:view", "bills:approve",
  "payments:view", "payments:schedule",
  "inventory:view", "inventory:manage",
  "risk:view",
  "messages:view", "messages:send",
  "team:view", "team:manage",
  "settings:view", "settings:edit",
  "billing:view", "billing:manage",
  "budget:view", "budget:manage",
] as const;
export type BuyerPermission = (typeof BUYER_PERMISSIONS)[number];

export const BUYER_ROLE_PERMISSIONS: Record<BuyerRole, BuyerPermission[]> = {
  buyer_owner: [...BUYER_PERMISSIONS],
  buyer_procurement: [
    "dashboard:view",
    "marketplace:browse",
    "vendors:view", "vendors:manage",
    "requisitions:view", "requisitions:create",
    "rfq:view", "rfq:create",
    "quotations:view", "quotations:award",
    "po:view", "po:create",
    "receipts:view", "receipts:create",
    "bills:view",
    "payments:view",
    "inventory:view", "inventory:manage",
    "risk:view",
    "messages:view", "messages:send",
    "settings:view",
  ],
  buyer_approver: [
    "dashboard:view",
    "vendors:view",
    "requisitions:view", "requisitions:approve",
    "rfq:view",
    "quotations:view",
    "po:view", "po:approve",
    "receipts:view",
    "bills:view",
    "payments:view",
    "inventory:view",
    "risk:view",
    "messages:view", "messages:send",
    "settings:view",
  ],
  buyer_finance: [
    "dashboard:view",
    "vendors:view",
    "requisitions:view",
    "po:view",
    "receipts:view",
    "bills:view", "bills:approve",
    "payments:view", "payments:schedule",
    "risk:view",
    "settings:view",
    "billing:view", "billing:manage",
    "budget:view", "budget:manage",
  ],
  inventory_staff: [
    "dashboard:view",
    "inventory:view", "inventory:manage",
    "receipts:view", "receipts:create",
    "messages:view", "messages:send",
    "settings:view",
  ],
  inventory_manager: [
    "dashboard:view",
    "inventory:view", "inventory:manage",
    "requisitions:view", "requisitions:create",
    "po:view",
    "receipts:view", "receipts:create",
    "vendors:view",
    "risk:view",
    "messages:view", "messages:send",
    "settings:view",
  ],
};

export type BuyerTenant = {
  id: string;
  companyName: string;
  industry: string;
  contactEmail: string;
  budgetYTD: number;
  budgetLimit: number;
  certifiedBadge: boolean;
};

export const CURRENT_BUYER_TENANT: BuyerTenant = {
  id: "tnt_pacific",
  companyName: "Pacific Manufacturing Corp",
  industry: "Heavy Equipment",
  contactEmail: "procurement@pacificmfg.com",
  budgetYTD: 482300,
  budgetLimit: 850000,
  certifiedBadge: true,
};

export type BuyerTeamMember = {
  id: string;
  name: string;
  email: string;
  role: BuyerRole;
  department: string;
  active: boolean;
  joinedAt: string;
  initials: string;
};

export const BUYER_TEAM: BuyerTeamMember[] = [
  { id: "bu1", name: "Sun Shane", email: "sunshane@pacificmfg.com", role: "buyer_owner", department: "Executive", active: true, joinedAt: "2022-09-01", initials: "EM" },
  { id: "bu2", name: "Raj Bhatt", email: "raj@pacificmfg.com", role: "buyer_procurement", department: "Procurement", active: true, joinedAt: "2023-02-14", initials: "RB" },
  { id: "bu3", name: "Sara Lim", email: "sara@pacificmfg.com", role: "buyer_procurement", department: "Procurement", active: true, joinedAt: "2023-08-30", initials: "SL" },
  { id: "bu4", name: "Marco Velasquez", email: "marco@pacificmfg.com", role: "buyer_approver", department: "Operations", active: true, joinedAt: "2022-11-04", initials: "MV" },
  { id: "bu5", name: "Yuki Tanaka", email: "yuki@pacificmfg.com", role: "buyer_finance", department: "Finance", active: true, joinedAt: "2024-01-22", initials: "YT" },
  { id: "bu6", name: "Tomás Reyes", email: "tomas@pacificmfg.com", role: "buyer_procurement", department: "Procurement", active: false, joinedAt: "2023-05-10", initials: "TR" },
];

// ─── Vendors visible to this buyer (accredited + marketplace) ───
export type BuyerVendor = {
  id: string;
  companyName: string;
  category: string;
  status: "Accredited" | "Pending" | "Blocked";
  riskClass: "Low" | "Medium" | "High";
  riskScore: number;
  rating: number;
  totalSpend: number;
  orders: number;
  onTimeRate: number; // %
  initials: string;
};

export const BUYER_VENDORS: BuyerVendor[] = [
  { id: "v1", companyName: "Acme Industrial Supply", category: "Industrial Equipment", status: "Accredited", riskClass: "Low", riskScore: 0.18, rating: 4.7, totalSpend: 184500, orders: 32, onTimeRate: 96, initials: "AI" },
  { id: "v2", companyName: "Northstar Hydraulics", category: "Hydraulics", status: "Accredited", riskClass: "Low", riskScore: 0.22, rating: 4.5, totalSpend: 92300, orders: 18, onTimeRate: 92, initials: "NH" },
  { id: "v3", companyName: "Vertex Chemicals", category: "Chemicals", status: "Accredited", riskClass: "Medium", riskScore: 0.45, rating: 4.2, totalSpend: 56400, orders: 11, onTimeRate: 84, initials: "VC" },
  { id: "v4", companyName: "Bolt & Nut Co.", category: "Fasteners", status: "Accredited", riskClass: "Low", riskScore: 0.12, rating: 4.8, totalSpend: 38900, orders: 47, onTimeRate: 99, initials: "BN" },
  { id: "v5", companyName: "Volt Electrical Trading", category: "Electrical", status: "Pending", riskClass: "Medium", riskScore: 0.51, rating: 4.0, totalSpend: 0, orders: 0, onTimeRate: 0, initials: "VE" },
  { id: "v6", companyName: "SafeGear PH", category: "Safety", status: "Accredited", riskClass: "Low", riskScore: 0.20, rating: 4.6, totalSpend: 27800, orders: 15, onTimeRate: 95, initials: "SG" },
  { id: "v7", companyName: "Eastern Steel Mills", category: "Raw Materials", status: "Accredited", riskClass: "High", riskScore: 0.71, rating: 3.6, totalSpend: 142000, orders: 9, onTimeRate: 67, initials: "ES" },
  { id: "v8", companyName: "OldRep Mining Supplies", category: "MRO", status: "Blocked", riskClass: "High", riskScore: 0.82, rating: 2.9, totalSpend: 12400, orders: 3, onTimeRate: 50, initials: "OR" },
];

// ─── Marketplace catalogue (products from accredited vendors) ───
export type MarketplaceProduct = {
  id: string;
  vendorId: string;
  vendorName: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  uom: string;
  inStock: boolean;
  rating: number;
  image: string;
  leadTimeDays: number;
};

export const MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  { id: "mp1", vendorId: "v1", vendorName: "Acme Industrial Supply", sku: "ACM-BRG-6204", name: "Deep Groove Ball Bearing 6204", category: "Bearings", price: 12.5, uom: "pc", inStock: true, rating: 4.7, image: "⚙️", leadTimeDays: 3 },
  { id: "mp2", vendorId: "v1", vendorName: "Acme Industrial Supply", sku: "ACM-HYD-25M", name: "Hydraulic Hose 25mm × 5m", category: "Hydraulics", price: 84.0, uom: "pc", inStock: true, rating: 4.6, image: "🔧", leadTimeDays: 5 },
  { id: "mp3", vendorId: "v2", vendorName: "Northstar Hydraulics", sku: "NS-PMP-15HP", name: "Hydraulic Pump 15HP", category: "Hydraulics", price: 1840, uom: "pc", inStock: true, rating: 4.5, image: "🛠️", leadTimeDays: 10 },
  { id: "mp4", vendorId: "v3", vendorName: "Vertex Chemicals", sku: "VC-LUB-200L", name: "Industrial Lubricant 200L Drum", category: "Chemicals", price: 480, uom: "drum", inStock: true, rating: 4.2, image: "🛢️", leadTimeDays: 7 },
  { id: "mp5", vendorId: "v4", vendorName: "Bolt & Nut Co.", sku: "BN-FAS-M12", name: "Hex Bolt M12 × 60 Grade 8.8 (100pk)", category: "Fasteners", price: 42, uom: "pack", inStock: true, rating: 4.8, image: "🔩", leadTimeDays: 2 },
  { id: "mp6", vendorId: "v6", vendorName: "SafeGear PH", sku: "SG-HLM-T1E", name: "Hard Hat Type 1 Class E (Yellow)", category: "Safety", price: 18.9, uom: "pc", inStock: true, rating: 4.6, image: "⛑️", leadTimeDays: 3 },
  { id: "mp7", vendorId: "v6", vendorName: "SafeGear PH", sku: "SG-GLV-CUT5", name: "Cut-Resistant Gloves Level 5", category: "Safety", price: 9.5, uom: "pair", inStock: true, rating: 4.7, image: "🧤", leadTimeDays: 4 },
  { id: "mp8", vendorId: "v7", vendorName: "Eastern Steel Mills", sku: "ES-PLT-10MM", name: "Steel Plate 10mm 1220×2440", category: "Raw Materials", price: 312, uom: "sheet", inStock: false, rating: 3.6, image: "🪨", leadTimeDays: 14 },
  { id: "mp9", vendorId: "v1", vendorName: "Acme Industrial Supply", sku: "ACM-MRO-WD40", name: "Multi-Use Lubricant 400ml", category: "MRO", price: 9.5, uom: "can", inStock: true, rating: 4.9, image: "🧴", leadTimeDays: 2 },
  { id: "mp10", vendorId: "v2", vendorName: "Northstar Hydraulics", sku: "NS-CYL-50T", name: "Hydraulic Cylinder 50-ton", category: "Hydraulics", price: 2640, uom: "pc", inStock: true, rating: 4.4, image: "⚒️", leadTimeDays: 12 },
  { id: "mp11", vendorId: "v4", vendorName: "Bolt & Nut Co.", sku: "BN-NUT-M16", name: "Hex Nut M16 Grade 8 (100pk)", category: "Fasteners", price: 28, uom: "pack", inStock: true, rating: 4.7, image: "🔩", leadTimeDays: 2 },
  { id: "mp12", vendorId: "v3", vendorName: "Vertex Chemicals", sku: "VC-DEG-25L", name: "Industrial Degreaser 25L", category: "Chemicals", price: 145, uom: "pail", inStock: true, rating: 4.0, image: "🧪", leadTimeDays: 5 },
];

export const MARKETPLACE_CATEGORIES = [
  "All", "Bearings", "Hydraulics", "Chemicals", "Fasteners",
  "Electrical", "Safety", "MRO", "Raw Materials",
];

// ─── Purchase Requisitions (PR) ───
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

export const REQUISITIONS: Requisition[] = [
  { id: "pr1", prNumber: "PR-2026-0421", title: "Q2 Bearings restock — Bay 4", requestedBy: "Raj Bhatt", department: "Maintenance", amount: 4280, itemCount: 6, status: "Pending Approval", raisedAt: "2026-04-22", neededBy: "2026-05-06" },
  { id: "pr2", prNumber: "PR-2026-0420", title: "Hydraulic line overhaul — Press 2", requestedBy: "Sara Lim", department: "Production", amount: 18420, itemCount: 4, status: "Approved", raisedAt: "2026-04-21", neededBy: "2026-05-12" },
  { id: "pr3", prNumber: "PR-2026-0418", title: "Safety PPE quarterly issue", requestedBy: "Raj Bhatt", department: "EHS", amount: 6240, itemCount: 8, status: "Converted to PO", raisedAt: "2026-04-19", neededBy: "2026-04-30" },
  { id: "pr4", prNumber: "PR-2026-0415", title: "Chemicals — Lubricant + degreaser", requestedBy: "Sara Lim", department: "Maintenance", amount: 2410, itemCount: 3, status: "Converted to RFQ", raisedAt: "2026-04-16", neededBy: "2026-05-02" },
  { id: "pr5", prNumber: "PR-2026-0410", title: "Steel plate 10mm — Project Atlas", requestedBy: "Raj Bhatt", department: "Engineering", amount: 9360, itemCount: 30, status: "Approved", raisedAt: "2026-04-12", neededBy: "2026-05-20" },
  { id: "pr6", prNumber: "PR-2026-0408", title: "Office MRO consumables", requestedBy: "Sara Lim", department: "Facilities", amount: 480, itemCount: 12, status: "Rejected", raisedAt: "2026-04-09", neededBy: "2026-04-20" },
  { id: "pr7", prNumber: "PR-2026-0405", title: "Fasteners — assembly line top-up", requestedBy: "Raj Bhatt", department: "Production", amount: 1680, itemCount: 4, status: "Draft", raisedAt: "2026-04-23", neededBy: "2026-05-08" },
];

// ─── RFQ ───
export type RFQ = {
  id: string;
  rfqNumber: string;
  title: string;
  category: string;
  invitedVendors: number;
  responsesReceived: number;
  status: "Draft" | "Open" | "Closed" | "Awarded" | "Cancelled";
  createdAt: string;
  closesAt: string;
  prRef: string;
};

export const RFQS: RFQ[] = [
  { id: "rfq1", rfqNumber: "RFQ-2026-0420", title: "Hydraulic line overhaul materials", category: "Hydraulics", invitedVendors: 4, responsesReceived: 3, status: "Open", createdAt: "2026-04-21", closesAt: "2026-04-28", prRef: "PR-2026-0420" },
  { id: "rfq2", rfqNumber: "RFQ-2026-0416", title: "Chemicals quarterly bulk", category: "Chemicals", invitedVendors: 3, responsesReceived: 3, status: "Closed", createdAt: "2026-04-16", closesAt: "2026-04-23", prRef: "PR-2026-0415" },
  { id: "rfq3", rfqNumber: "RFQ-2026-0410", title: "Steel plate 10mm — Project Atlas", category: "Raw Materials", invitedVendors: 5, responsesReceived: 4, status: "Awarded", createdAt: "2026-04-12", closesAt: "2026-04-20", prRef: "PR-2026-0410" },
  { id: "rfq4", rfqNumber: "RFQ-2026-0405", title: "Annual safety PPE contract", category: "Safety", invitedVendors: 6, responsesReceived: 5, status: "Awarded", createdAt: "2026-04-05", closesAt: "2026-04-15", prRef: "PR-2026-0418" },
  { id: "rfq5", rfqNumber: "RFQ-2026-0422", title: "Fasteners blanket order Q3", category: "Fasteners", invitedVendors: 0, responsesReceived: 0, status: "Draft", createdAt: "2026-04-22", closesAt: "2026-05-05", prRef: "PR-2026-0405" },
];

// ─── Quotations (vendor responses) ───
export type Quotation = {
  id: string;
  rfqRef: string;
  vendorName: string;
  vendorId: string;
  total: number;
  leadTimeDays: number;
  validUntil: string;
  status: "Submitted" | "Awarded" | "Rejected" | "Withdrawn";
  rank: number; // 1 = best
};

export const QUOTATIONS: Quotation[] = [
  { id: "q1", rfqRef: "RFQ-2026-0420", vendorId: "v2", vendorName: "Northstar Hydraulics", total: 17920, leadTimeDays: 8, validUntil: "2026-05-15", status: "Submitted", rank: 1 },
  { id: "q2", rfqRef: "RFQ-2026-0420", vendorId: "v1", vendorName: "Acme Industrial Supply", total: 18620, leadTimeDays: 6, validUntil: "2026-05-15", status: "Submitted", rank: 2 },
  { id: "q3", rfqRef: "RFQ-2026-0420", vendorId: "v3", vendorName: "Vertex Chemicals", total: 19840, leadTimeDays: 12, validUntil: "2026-05-15", status: "Submitted", rank: 3 },
  { id: "q4", rfqRef: "RFQ-2026-0416", vendorId: "v3", vendorName: "Vertex Chemicals", total: 2290, leadTimeDays: 5, validUntil: "2026-05-10", status: "Awarded", rank: 1 },
  { id: "q5", rfqRef: "RFQ-2026-0416", vendorId: "v1", vendorName: "Acme Industrial Supply", total: 2440, leadTimeDays: 4, validUntil: "2026-05-10", status: "Submitted", rank: 2 },
  { id: "q6", rfqRef: "RFQ-2026-0410", vendorId: "v7", vendorName: "Eastern Steel Mills", total: 9120, leadTimeDays: 14, validUntil: "2026-05-05", status: "Awarded", rank: 1 },
  { id: "q7", rfqRef: "RFQ-2026-0405", vendorId: "v6", vendorName: "SafeGear PH", total: 6080, leadTimeDays: 5, validUntil: "2026-05-01", status: "Awarded", rank: 1 },
];

// ─── Purchase Orders (issued by buyer) ───
export type BuyerPurchaseOrder = {
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

export const BUYER_PURCHASE_ORDERS: BuyerPurchaseOrder[] = [
  { id: "bpo1", poNumber: "PO-PMC-008420", vendorName: "Acme Industrial Supply", vendorId: "v1", status: "Pending Approval", total: 6240, itemCount: 8, poDate: "2026-04-22", expectedDelivery: "2026-05-06", paymentTerms: "Net30", raisedBy: "Raj Bhatt", prRef: "PR-2026-0418" },
  { id: "bpo2", poNumber: "PO-PMC-008419", vendorName: "Vertex Chemicals", vendorId: "v3", status: "Acknowledged", total: 2290, itemCount: 3, poDate: "2026-04-21", expectedDelivery: "2026-04-28", paymentTerms: "Net30", raisedBy: "Sara Lim", prRef: "PR-2026-0415" },
  { id: "bpo3", poNumber: "PO-PMC-008412", vendorName: "Acme Industrial Supply", vendorId: "v1", status: "Issued", total: 12480, itemCount: 8, poDate: "2026-04-22", expectedDelivery: "2026-05-06", paymentTerms: "Net30", raisedBy: "Raj Bhatt" },
  { id: "bpo4", poNumber: "PO-PMC-008410", vendorName: "Eastern Steel Mills", vendorId: "v7", status: "Partially Received", total: 9120, itemCount: 30, poDate: "2026-04-15", expectedDelivery: "2026-05-02", paymentTerms: "Net45", raisedBy: "Raj Bhatt", prRef: "PR-2026-0410" },
  { id: "bpo5", poNumber: "PO-PMC-008405", vendorName: "Northstar Hydraulics", vendorId: "v2", status: "Received", total: 3680, itemCount: 4, poDate: "2026-04-10", expectedDelivery: "2026-04-20", paymentTerms: "Net30", raisedBy: "Sara Lim" },
  { id: "bpo6", poNumber: "PO-PMC-008401", vendorName: "Bolt & Nut Co.", vendorId: "v4", status: "Closed", total: 1680, itemCount: 40, poDate: "2026-04-04", expectedDelivery: "2026-04-12", paymentTerms: "COD", raisedBy: "Raj Bhatt" },
  { id: "bpo7", poNumber: "PO-PMC-008398", vendorName: "SafeGear PH", vendorId: "v6", status: "Closed", total: 6080, itemCount: 60, poDate: "2026-03-28", expectedDelivery: "2026-04-08", paymentTerms: "Net30", raisedBy: "Sara Lim" },
];

// ─── Goods Receipts (GRN) ───
export type GoodsReceipt = {
  id: string;
  grnNumber: string;
  poRef: string;
  vendorName: string;
  receivedAt: string;
  receivedBy: string;
  itemCount: number;
  status: "Pending Inspection" | "Accepted" | "Partially Accepted" | "Rejected";
  notes?: string;
};

export const GOODS_RECEIPTS: GoodsReceipt[] = [
  { id: "gr1", grnNumber: "GRN-2026-0422-A", poRef: "PO-PMC-008405", vendorName: "Northstar Hydraulics", receivedAt: "2026-04-22", receivedBy: "Anya Petrova", itemCount: 4, status: "Accepted" },
  { id: "gr2", grnNumber: "GRN-2026-0421-B", poRef: "PO-PMC-008410", vendorName: "Eastern Steel Mills", receivedAt: "2026-04-21", receivedBy: "Diego Rivera", itemCount: 18, status: "Partially Accepted", notes: "12 sheets back-ordered, ETA 2 weeks." },
  { id: "gr3", grnNumber: "GRN-2026-0418-C", poRef: "PO-PMC-008401", vendorName: "Bolt & Nut Co.", receivedAt: "2026-04-12", receivedBy: "Anya Petrova", itemCount: 40, status: "Accepted" },
  { id: "gr4", grnNumber: "GRN-2026-0410-D", poRef: "PO-PMC-008398", vendorName: "SafeGear PH", receivedAt: "2026-04-08", receivedBy: "Diego Rivera", itemCount: 60, status: "Accepted" },
  { id: "gr5", grnNumber: "GRN-2026-0420-E", poRef: "PO-PMC-008419", vendorName: "Vertex Chemicals", receivedAt: "2026-04-23", receivedBy: "Anya Petrova", itemCount: 3, status: "Pending Inspection" },
];

// ─── Bills (vendor invoices received) ───
export type VendorBill = {
  id: string;
  billNumber: string;
  vendorName: string;
  poRef: string;
  amount: number;
  status: "Pending" | "Approved" | "Scheduled" | "Paid" | "Disputed" | "Overdue";
  receivedAt: string;
  dueAt: string;
};

export const VENDOR_BILLS: VendorBill[] = [
  { id: "vb1", billNumber: "INV-NS-001124", vendorName: "Northstar Hydraulics", poRef: "PO-PMC-008405", amount: 3680, status: "Approved", receivedAt: "2026-04-22", dueAt: "2026-05-22" },
  { id: "vb2", billNumber: "INV-ES-002201", vendorName: "Eastern Steel Mills", poRef: "PO-PMC-008410", amount: 5472, status: "Pending", receivedAt: "2026-04-22", dueAt: "2026-06-06" },
  { id: "vb3", billNumber: "INV-BN-005512", vendorName: "Bolt & Nut Co.", poRef: "PO-PMC-008401", amount: 1680, status: "Paid", receivedAt: "2026-04-12", dueAt: "2026-04-12" },
  { id: "vb4", billNumber: "INV-SG-009941", vendorName: "SafeGear PH", poRef: "PO-PMC-008398", amount: 6080, status: "Paid", receivedAt: "2026-04-08", dueAt: "2026-05-08" },
  { id: "vb5", billNumber: "INV-VC-006621", vendorName: "Vertex Chemicals", poRef: "PO-PMC-008419", amount: 2290, status: "Scheduled", receivedAt: "2026-04-23", dueAt: "2026-05-23" },
  { id: "vb6", billNumber: "INV-AC-008412", vendorName: "Acme Industrial Supply", poRef: "PO-PMC-008412", amount: 12480, status: "Pending", receivedAt: "2026-04-22", dueAt: "2026-05-22" },
  { id: "vb7", billNumber: "INV-ES-001990", vendorName: "Eastern Steel Mills", poRef: "PO-PMC-008390", amount: 4200, status: "Overdue", receivedAt: "2026-03-12", dueAt: "2026-04-11" },
  { id: "vb8", billNumber: "INV-OR-000088", vendorName: "OldRep Mining Supplies", poRef: "PO-PMC-008321", amount: 1840, status: "Disputed", receivedAt: "2026-03-22", dueAt: "2026-04-22" },
];

// ─── Payments ───
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

export const BUYER_PAYMENTS: BuyerPayment[] = [
  { id: "pay1", reference: "PAY-2026-0428-A", vendorName: "Northstar Hydraulics", billRef: "INV-NS-001124", amount: 3680, status: "Scheduled", scheduledFor: "2026-04-28", method: "Bank transfer" },
  { id: "pay2", reference: "PAY-2026-0423-B", vendorName: "Vertex Chemicals", billRef: "INV-VC-006621", amount: 2290, status: "Processing", scheduledFor: "2026-04-23", method: "PayMongo" },
  { id: "pay3", reference: "PAY-2026-0412-C", vendorName: "Bolt & Nut Co.", billRef: "INV-BN-005512", amount: 1680, status: "Paid", scheduledFor: "2026-04-12", method: "COD" },
  { id: "pay4", reference: "PAY-2026-0408-D", vendorName: "SafeGear PH", billRef: "INV-SG-009941", amount: 6080, status: "Paid", scheduledFor: "2026-04-08", method: "Bank transfer" },
  { id: "pay5", reference: "PAY-2026-0322-E", vendorName: "Acme Industrial Supply", billRef: "INV-AC-008321", amount: 9650, status: "Paid", scheduledFor: "2026-03-22", method: "Bank transfer" },
];

// ─── Spend by category — for dashboard ───
export const SPEND_BY_CATEGORY = [
  { category: "Hydraulics", spend: 96200 },
  { category: "Raw Materials", spend: 142000 },
  { category: "Industrial Eq.", spend: 184500 },
  { category: "Chemicals", spend: 56400 },
  { category: "Fasteners", spend: 38900 },
  { category: "Safety", spend: 27800 },
];

// ─── Monthly spend timeseries — dashboard ───
export const SPEND_SERIES = [
  { month: "Nov 25", spend: 38400, orders: 18 },
  { month: "Dec 25", spend: 52100, orders: 22 },
  { month: "Jan 26", spend: 41800, orders: 17 },
  { month: "Feb 26", spend: 67300, orders: 28 },
  { month: "Mar 26", spend: 78400, orders: 32 },
  { month: "Apr 26", spend: 92200, orders: 38 },
];

// ─── Buyer ↔ vendor messages ───
export type BuyerConversation = {
  id: string;
  vendorName: string;
  initials: string;
  preview: string;
  unread: number;
  lastAt: string;
  pinned?: boolean;
  messages: { from: "vendor" | "buyer"; text: string; at: string }[];
};

export const BUYER_CONVERSATIONS: BuyerConversation[] = [
  { id: "bcv1", vendorName: "Acme Industrial Supply", initials: "AI", preview: "Confirming PO-PMC-008412 — ships Apr 26.", unread: 1, lastAt: "11:02", pinned: true, messages: [
    { from: "buyer", text: "Hi, can you split the M12 bolts into two pallets?", at: "10:24" },
    { from: "vendor", text: "Yes — 2 pallets, separate carriers. Confirming PO-PMC-008412 — ships Apr 26.", at: "11:02" },
  ]},
  { id: "bcv2", vendorName: "Northstar Hydraulics", initials: "NH", preview: "GRN received — anything pending?", unread: 0, lastAt: "Yesterday", messages: [
    { from: "vendor", text: "GRN received — anything pending?", at: "Yesterday 16:40" },
  ]},
  { id: "bcv3", vendorName: "Eastern Steel Mills", initials: "ES", preview: "Back-order ETA on the 12 missing sheets?", unread: 2, lastAt: "Mon", messages: [
    { from: "buyer", text: "Back-order ETA on the 12 missing sheets?", at: "Mon 09:30" },
    { from: "vendor", text: "Mill rolling schedule confirmed for May 4-5. Ship by May 7.", at: "Mon 14:11" },
  ]},
  { id: "bcv4", vendorName: "Vertex Chemicals", initials: "VC", preview: "MSDS attached for the new degreaser SKU.", unread: 0, lastAt: "Apr 19", messages: [
    { from: "vendor", text: "MSDS attached for the new degreaser SKU.", at: "Apr 19 11:00" },
  ]},
];

// ─── Risk alerts (cross-vendor, ML-driven) ───
export type RiskAlert = {
  id: string;
  vendorName: string;
  level: "Low" | "Medium" | "High";
  signal: string;
  detail: string;
  raisedAt: string;
};

export const RISK_ALERTS: RiskAlert[] = [
  { id: "ra1", vendorName: "Eastern Steel Mills", level: "High", signal: "On-time delivery dropped to 67%", detail: "8 of last 12 deliveries late by ≥3 days. Recommend secondary source.", raisedAt: "2026-04-22" },
  { id: "ra2", vendorName: "OldRep Mining Supplies", level: "High", signal: "Compliance docs expired", detail: "PCAB License expired 2025-12-31. Auto-blocked from new POs.", raisedAt: "2026-04-20" },
  { id: "ra3", vendorName: "Vertex Chemicals", level: "Medium", signal: "Quality variance detected", detail: "2 GRNs flagged for off-spec viscosity in last 30 days.", raisedAt: "2026-04-18" },
  { id: "ra4", vendorName: "Volt Electrical Trading", level: "Medium", signal: "Pending accreditation > 14d", detail: "DTI registration uploaded but ISO 9001 still missing.", raisedAt: "2026-04-15" },
];

export function formatBuyerCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

// ─── RFQ line items (specs the vendor will quote against) ───
export type RFQLine = {
  id: string;
  rfqRef: string;
  sku?: string;
  description: string;
  qty: number;
  uom: string;
  targetPrice?: number;
  notes?: string;
};

export const RFQ_LINES: RFQLine[] = [
  // RFQ-2026-0420 — Hydraulic line overhaul
  { id: "rl1", rfqRef: "RFQ-2026-0420", sku: "HYD-HSE-25M", description: "Hydraulic Hose 25mm × 5m, 4000psi", qty: 12, uom: "pc", targetPrice: 80, notes: "EN 853 2SN compliant" },
  { id: "rl2", rfqRef: "RFQ-2026-0420", sku: "HYD-CYL-50T", description: "Hydraulic Cylinder 50-ton, double-acting", qty: 2, uom: "pc", targetPrice: 2600 },
  { id: "rl3", rfqRef: "RFQ-2026-0420", sku: "HYD-PMP-15HP", description: "Hydraulic Pump 15HP, gear-type", qty: 1, uom: "pc", targetPrice: 1800 },
  { id: "rl4", rfqRef: "RFQ-2026-0420", description: "Installation labour & commissioning", qty: 1, uom: "lot", targetPrice: 4200 },
  // RFQ-2026-0422 — Fasteners blanket
  { id: "rl5", rfqRef: "RFQ-2026-0422", sku: "FAS-M12", description: "Hex Bolt M12 × 60 Grade 8.8 (100pk)", qty: 40, uom: "pack", targetPrice: 40 },
  { id: "rl6", rfqRef: "RFQ-2026-0422", sku: "FAS-NUT-M16", description: "Hex Nut M16 Grade 8 (100pk)", qty: 25, uom: "pack", targetPrice: 26 },
  // RFQ-2026-0416 — Chemicals
  { id: "rl7", rfqRef: "RFQ-2026-0416", sku: "CHM-LUB-200L", description: "Industrial Lubricant 200L Drum, ISO VG 68", qty: 4, uom: "drum", targetPrice: 470 },
  { id: "rl8", rfqRef: "RFQ-2026-0416", sku: "CHM-DEG-25L", description: "Industrial Degreaser 25L", qty: 3, uom: "pail", targetPrice: 140 },
  // RFQ-2026-0410 — Steel
  { id: "rl9", rfqRef: "RFQ-2026-0410", sku: "STL-PLT-10MM", description: "Steel Plate 10mm 1220×2440 ASTM A36", qty: 30, uom: "sheet", targetPrice: 310 },
  // RFQ-2026-0405 — Safety PPE
  { id: "rl10", rfqRef: "RFQ-2026-0405", sku: "SAF-HLM", description: "Hard Hat Type 1 Class E (Yellow)", qty: 200, uom: "pc", targetPrice: 18 },
  { id: "rl11", rfqRef: "RFQ-2026-0405", sku: "SAF-GLV", description: "Cut-Resistant Gloves Level 5", qty: 300, uom: "pair", targetPrice: 9 },
];

// ─── RFQ invitations (which vendors were asked) ───
export type RFQInvitation = {
  id: string;
  rfqRef: string;
  vendorId: string;
  vendorName: string;
  invitedAt: string;
  vendorStatus: "Invited" | "Viewed" | "Quoted" | "Declined";
  quotationId?: string;
};

export const RFQ_INVITATIONS: RFQInvitation[] = [
  // RFQ-2026-0420
  { id: "ri1", rfqRef: "RFQ-2026-0420", vendorId: "v2", vendorName: "Northstar Hydraulics", invitedAt: "2026-04-21", vendorStatus: "Quoted", quotationId: "q1" },
  { id: "ri2", rfqRef: "RFQ-2026-0420", vendorId: "v1", vendorName: "Acme Industrial Supply", invitedAt: "2026-04-21", vendorStatus: "Quoted", quotationId: "q2" },
  { id: "ri3", rfqRef: "RFQ-2026-0420", vendorId: "v3", vendorName: "Vertex Chemicals", invitedAt: "2026-04-21", vendorStatus: "Quoted", quotationId: "q3" },
  { id: "ri4", rfqRef: "RFQ-2026-0420", vendorId: "v7", vendorName: "Eastern Steel Mills", invitedAt: "2026-04-21", vendorStatus: "Viewed" },
  // RFQ-2026-0416
  { id: "ri5", rfqRef: "RFQ-2026-0416", vendorId: "v3", vendorName: "Vertex Chemicals", invitedAt: "2026-04-16", vendorStatus: "Quoted", quotationId: "q4" },
  { id: "ri6", rfqRef: "RFQ-2026-0416", vendorId: "v1", vendorName: "Acme Industrial Supply", invitedAt: "2026-04-16", vendorStatus: "Quoted", quotationId: "q5" },
  { id: "ri7", rfqRef: "RFQ-2026-0416", vendorId: "v6", vendorName: "SafeGear PH", invitedAt: "2026-04-16", vendorStatus: "Declined" },
  // RFQ-2026-0410
  { id: "ri8", rfqRef: "RFQ-2026-0410", vendorId: "v7", vendorName: "Eastern Steel Mills", invitedAt: "2026-04-12", vendorStatus: "Quoted", quotationId: "q6" },
  // RFQ-2026-0405
  { id: "ri9", rfqRef: "RFQ-2026-0405", vendorId: "v6", vendorName: "SafeGear PH", invitedAt: "2026-04-05", vendorStatus: "Quoted", quotationId: "q7" },
  // RFQ-2026-0422 (draft, no invites yet)
];

// ─── Per-RFQ private chat threads (buyer ↔ each invited vendor) ───
export type RFQChatMessage = {
  from: "buyer" | "vendor";
  text: string;
  at: string;
};

export type RFQThread = {
  rfqRef: string;
  vendorId: string;
  unreadForBuyer: number;
  unreadForVendor: number;
  messages: RFQChatMessage[];
};

export const RFQ_THREADS: RFQThread[] = [
  {
    rfqRef: "RFQ-2026-0420",
    vendorId: "v2",
    unreadForBuyer: 1,
    unreadForVendor: 0,
    messages: [
      { from: "buyer", text: "Can you confirm the cylinder bore is 100mm?", at: "Apr 22 09:14" },
      { from: "vendor", text: "Yes — 100mm bore × 200mm stroke. Quote attached.", at: "Apr 22 11:30" },
      { from: "vendor", text: "Lead time can be cut to 6 days if you confirm by Apr 25.", at: "Apr 23 08:02" },
    ],
  },
  {
    rfqRef: "RFQ-2026-0420",
    vendorId: "v1",
    unreadForBuyer: 0,
    unreadForVendor: 1,
    messages: [
      { from: "vendor", text: "Submitted quotation. Pricing in USD, FOB Cebu.", at: "Apr 22 14:11" },
      { from: "buyer", text: "Thanks — do you offer 30-day payment terms?", at: "Apr 23 07:50" },
    ],
  },
  {
    rfqRef: "RFQ-2026-0420",
    vendorId: "v3",
    unreadForBuyer: 0,
    unreadForVendor: 0,
    messages: [
      { from: "vendor", text: "Quote sent. Note: lubricant included as bonus.", at: "Apr 22 16:00" },
    ],
  },
  {
    rfqRef: "RFQ-2026-0420",
    vendorId: "v7",
    unreadForBuyer: 0,
    unreadForVendor: 0,
    messages: [
      { from: "buyer", text: "RFQ closes Apr 28 — please confirm if you'll bid.", at: "Apr 23 09:00" },
    ],
  },
];

// ─── Inventory ───
// On hand = physically in warehouse. On order = sum of open PO qty for SKU.
// Available = on hand - reserved (treated as 0 here since no demand engine yet).
export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  uom: string;
  location: string;
  onHand: number;
  onOrder: number;     // open POs
  reorderPoint: number;
  reorderQty: number;
  lastReceivedAt?: string;
  preferredVendorId?: string;
  preferredVendorName?: string;
  unitCost: number;
};

export const INVENTORY: InventoryItem[] = [
  { id: "iv1", sku: "ACM-BRG-6204", name: "Deep Groove Ball Bearing 6204", category: "Bearings", uom: "pc", location: "Bay 4 · Rack A1", onHand: 28, onOrder: 100, reorderPoint: 60, reorderQty: 200, lastReceivedAt: "2026-03-28", preferredVendorId: "v1", preferredVendorName: "Acme Industrial Supply", unitCost: 12.5 },
  { id: "iv2", sku: "ACM-HYD-25M", name: "Hydraulic Hose 25mm × 5m", category: "Hydraulics", uom: "pc", location: "Bay 4 · Rack B2", onHand: 4, onOrder: 12, reorderPoint: 10, reorderQty: 24, lastReceivedAt: "2026-04-02", preferredVendorId: "v2", preferredVendorName: "Northstar Hydraulics", unitCost: 84 },
  { id: "iv3", sku: "VC-LUB-200L", name: "Industrial Lubricant 200L Drum", category: "Chemicals", uom: "drum", location: "Chem Store · Pad 1", onHand: 6, onOrder: 4, reorderPoint: 4, reorderQty: 8, lastReceivedAt: "2026-03-20", preferredVendorId: "v3", preferredVendorName: "Vertex Chemicals", unitCost: 480 },
  { id: "iv4", sku: "BN-FAS-M12", name: "Hex Bolt M12 × 60 Grade 8.8 (100pk)", category: "Fasteners", uom: "pack", location: "Bay 2 · Bin C5", onHand: 22, onOrder: 0, reorderPoint: 15, reorderQty: 40, lastReceivedAt: "2026-04-12", preferredVendorId: "v4", preferredVendorName: "Bolt & Nut Co.", unitCost: 42 },
  { id: "iv5", sku: "SG-HLM-T1E", name: "Hard Hat Type 1 Class E (Yellow)", category: "Safety", uom: "pc", location: "PPE Store · Shelf D1", onHand: 0, onOrder: 200, reorderPoint: 60, reorderQty: 200, lastReceivedAt: "2026-03-15", preferredVendorId: "v6", preferredVendorName: "SafeGear PH", unitCost: 18.9 },
  { id: "iv6", sku: "SG-GLV-CUT5", name: "Cut-Resistant Gloves Level 5", category: "Safety", uom: "pair", location: "PPE Store · Shelf D2", onHand: 84, onOrder: 0, reorderPoint: 50, reorderQty: 100, lastReceivedAt: "2026-04-08", preferredVendorId: "v6", preferredVendorName: "SafeGear PH", unitCost: 9.5 },
  { id: "iv7", sku: "ES-PLT-10MM", name: "Steel Plate 10mm 1220×2440", category: "Raw Materials", uom: "sheet", location: "Yard · Stack 3", onHand: 8, onOrder: 12, reorderPoint: 12, reorderQty: 30, lastReceivedAt: "2026-04-21", preferredVendorId: "v7", preferredVendorName: "Eastern Steel Mills", unitCost: 312 },
  { id: "iv8", sku: "ACM-MRO-WD40", name: "Multi-Use Lubricant 400ml", category: "MRO", uom: "can", location: "Tool Crib · Shelf E", onHand: 142, onOrder: 0, reorderPoint: 40, reorderQty: 120, lastReceivedAt: "2026-04-10", preferredVendorId: "v1", preferredVendorName: "Acme Industrial Supply", unitCost: 9.5 },
  { id: "iv9", sku: "NS-CYL-50T", name: "Hydraulic Cylinder 50-ton", category: "Hydraulics", uom: "pc", location: "Bay 4 · Heavy Rack", onHand: 1, onOrder: 2, reorderPoint: 2, reorderQty: 2, lastReceivedAt: "2026-02-18", preferredVendorId: "v2", preferredVendorName: "Northstar Hydraulics", unitCost: 2640 },
  { id: "iv10", sku: "VC-DEG-25L", name: "Industrial Degreaser 25L", category: "Chemicals", uom: "pail", location: "Chem Store · Pad 2", onHand: 12, onOrder: 0, reorderPoint: 8, reorderQty: 24, lastReceivedAt: "2026-04-05", preferredVendorId: "v3", preferredVendorName: "Vertex Chemicals", unitCost: 145 },
  { id: "iv11", sku: "BN-NUT-M16", name: "Hex Nut M16 Grade 8 (100pk)", category: "Fasteners", uom: "pack", location: "Bay 2 · Bin C6", onHand: 9, onOrder: 0, reorderPoint: 12, reorderQty: 25, lastReceivedAt: "2026-03-30", preferredVendorId: "v4", preferredVendorName: "Bolt & Nut Co.", unitCost: 28 },
  { id: "iv12", sku: "ACM-BRG-6307", name: "Deep Groove Ball Bearing 6307", category: "Bearings", uom: "pc", location: "Bay 4 · Rack A2", onHand: 64, onOrder: 0, reorderPoint: 30, reorderQty: 120, lastReceivedAt: "2026-04-01", preferredVendorId: "v1", preferredVendorName: "Acme Industrial Supply", unitCost: 18.4 },
];

export type StockState = "In stock" | "Low stock" | "Out of stock";

export function getStockState(item: InventoryItem): StockState {
  if (item.onHand <= 0) return "Out of stock";
  if (item.onHand <= item.reorderPoint) return "Low stock";
  return "In stock";
}

