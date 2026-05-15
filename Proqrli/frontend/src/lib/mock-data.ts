/* eslint-disable prettier/prettier */
// ProcurLi vendor portal — mock data mirroring the ERD.
// Every entity here maps to a table in proqrliv2 (TENANT_USER, PRODUCT_LISTING,
// MARKETPLACE_ORDER, PURCHASE_ORDER, etc.). When we wire Lovable Cloud later,
// these shapes stay; only the source flips from in-memory to Supabase.

export type VendorRole =
  | "vendor_owner"
  | "vendor_admin"
  | "vendor_staff"
  | "vendor_finance";

export const ROLE_LABELS: Record<VendorRole, string> = {
  vendor_owner: "Admin",
  vendor_admin: "Admin",
  vendor_staff: "Sales",
  vendor_finance: "Finance",
};

export const ROLE_DESCRIPTIONS: Record<VendorRole, string> = {
  vendor_owner: "Full access, including billing, team, and store deletion.",
  vendor_admin: "Full access, including billing, team, and store deletion.",
  vendor_staff: "Manage products and orders. No billing or team access.",
  vendor_finance: "Read orders. Manage invoices, payouts, and bank details.",
};

// Module-level permissions (used by RBAC guards across the portal).
export const PERMISSIONS = [
  "dashboard:view",
  "orders:view",
  "orders:fulfill",
  "po:view",
  "po:acknowledge",
  "rfq:view",
  "rfq:respond",
  "products:view",
  "products:manage",
  "storefront:view",
  "storefront:edit",
  "deliveries:view",
  "deliveries:manage",
  "invoices:view",
  "invoices:manage",
  "payouts:view",
  "payouts:manage",
  "compliance:view",
  "compliance:upload",
  "buyers:view",
  "buyers:manage",
  "messages:view",
  "messages:send",
  "reviews:view",
  "team:view",
  "team:manage",
  "settings:view",
  "settings:edit",
  "billing:view",
  "billing:manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<VendorRole, Permission[]> = {
  vendor_owner: [...PERMISSIONS],
  vendor_admin: [...PERMISSIONS],
  vendor_staff: [
    "dashboard:view",
    "orders:view", "orders:fulfill",
    "po:view", "po:acknowledge",
    "rfq:view", "rfq:respond",
    "products:view", "products:manage",
    "storefront:view",
    "deliveries:view", "deliveries:manage",
    "messages:view", "messages:send",
    "reviews:view",
    "settings:view",
  ],
  vendor_finance: [
    "dashboard:view",
    "orders:view",
    "po:view",
    "rfq:view",
    "invoices:view", "invoices:manage",
    "payouts:view", "payouts:manage",
    "compliance:view",
    "settings:view",
    "billing:view", "billing:manage",
  ],
};

export type VendorTenant = {
  id: string;
  companyName: string;
  industry: string;
  contactEmail: string;
  status: "Active" | "Suspended";
  riskScore: number; // 0-1, ML output
  riskClass: "Low" | "Medium" | "High";
  storeSlug: string;
  tagline: string;
  storeBio: string;
  certifiedBadge: boolean;
  logoPath?: string;
  bannerPath?: string;
};

export const CURRENT_TENANT: VendorTenant = {
  id: "tnt_acme",
  companyName: "Acme Industrial Supply",
  industry: "Industrial Equipment",
  contactEmail: "ops@acme-supply.com",
  status: "Active",
  riskScore: 0.18,
  riskClass: "Low",
  storeSlug: "acme-industrial-supply",
  tagline: "Heavy machinery & MRO supplies, shipped fast.",
  storeBio:
    "Family-run since 1987. ISO 9001 certified. Serving manufacturers across SE Asia with industrial bearings, hydraulics, and replacement parts.",
  certifiedBadge: true,
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: VendorRole;
  department: string;
  active: boolean;
  joinedAt: string;
  initials: string;
};

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "u1", name: "Shane Sorono", email: "shane@acme-supply.com", role: "vendor_owner", department: "Executive", active: true, joinedAt: "2023-04-12", initials: "SS" },
  { id: "u2", name: "Mira Tan", email: "mira@acme-supply.com", role: "vendor_admin", department: "Operations", active: true, joinedAt: "2023-06-02", initials: "MT" },
  { id: "u3", name: "Diego Rivera", email: "diego@acme-supply.com", role: "vendor_staff", department: "Sales", active: true, joinedAt: "2024-01-18", initials: "DR" },
  { id: "u4", name: "Anya Petrova", email: "anya@acme-supply.com", role: "vendor_staff", department: "Warehouse", active: true, joinedAt: "2024-03-04", initials: "AP" },
  { id: "u5", name: "Linh Nguyen", email: "linh@acme-supply.com", role: "vendor_finance", department: "Finance", active: true, joinedAt: "2024-07-22", initials: "LN" },
  { id: "u6", name: "Jorge Cruz", email: "jorge@acme-supply.com", role: "vendor_staff", department: "Sales", active: false, joinedAt: "2023-11-09", initials: "JC" },
];

export type ProductListing = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  uom: string;
  stock: number;
  status: "Active" | "Draft" | "Out of stock";
  views: number;
  orders: number;
  rating: number;
  image: string; // emoji or Cloudinary URL
};

export const PRODUCTS: ProductListing[] = [
  { id: "p1", sku: "ACM-BRG-6204", name: "Deep Groove Ball Bearing 6204", category: "Bearings", price: 12.5, uom: "pc", stock: 480, status: "Active", views: 1245, orders: 84, rating: 4.7, image: "⚙️" },
  { id: "p2", sku: "ACM-HYD-25M", name: "Hydraulic Hose 25mm × 5m", category: "Hydraulics", price: 84.0, uom: "pc", stock: 62, status: "Active", views: 880, orders: 42, rating: 4.6, image: "🔧" },
  { id: "p3", sku: "ACM-LUB-20L", name: "Industrial Lubricant ISO VG 68", category: "Chemicals", price: 145.0, uom: "drum", stock: 18, status: "Active", views: 612, orders: 27, rating: 4.8, image: "🛢️" },
  { id: "p4", sku: "ACM-FAS-M12", name: "Hex Bolt M12 × 60 Grade 8.8", category: "Fasteners", price: 0.42, uom: "pc", stock: 12000, status: "Active", views: 2105, orders: 198, rating: 4.9, image: "🔩" },
  { id: "p5", sku: "ACM-ELC-CB16", name: "Circuit Breaker 16A 1P", category: "Electrical", price: 22.5, uom: "pc", stock: 0, status: "Out of stock", views: 540, orders: 31, rating: 4.5, image: "⚡" },
  { id: "p6", sku: "ACM-SAF-HLM", name: "Hard Hat Type 1 Class E", category: "Safety", price: 18.9, uom: "pc", stock: 240, status: "Active", views: 720, orders: 55, rating: 4.7, image: "⛑️" },
  { id: "p7", sku: "ACM-MRO-WD40", name: "Multi-Use Lubricant 400ml", category: "MRO", price: 9.5, uom: "can", stock: 360, status: "Active", views: 1880, orders: 142, rating: 4.9, image: "🧴" },
  { id: "p8", sku: "ACM-BRG-6307", name: "Deep Groove Ball Bearing 6307", category: "Bearings", price: 18.4, uom: "pc", stock: 145, status: "Draft", views: 14, orders: 0, rating: 0, image: "⚙️" },
];

export const PRODUCT_CATEGORIES = [
  "Bearings", "Hydraulics", "Chemicals", "Fasteners",
  "Electrical", "Safety", "MRO", "Tools", "Raw Materials",
];

export type Buyer = {
  id: string;
  companyName: string;
  industry: string;
  status: "Approved" | "Pending" | "Rejected" | "Suspended";
  appliedAt: string;
  totalSpend: number;
  orderCount: number;
  initials: string;
};

export const BUYERS: Buyer[] = [
  { id: "b1", companyName: "Pacific Manufacturing Corp", industry: "Heavy Equipment", status: "Approved", appliedAt: "2024-02-04", totalSpend: 184500, orderCount: 32, initials: "PM" },
  { id: "b2", companyName: "Northwind Logistics", industry: "Logistics", status: "Approved", appliedAt: "2024-05-18", totalSpend: 92300, orderCount: 21, initials: "NL" },
  { id: "b3", companyName: "Coastal Energy Holdings", industry: "Oil & Gas", status: "Approved", appliedAt: "2024-07-09", totalSpend: 256800, orderCount: 41, initials: "CE" },
  { id: "b4", companyName: "Highland Steel Works", industry: "Manufacturing", status: "Pending", appliedAt: "2026-04-12", totalSpend: 0, orderCount: 0, initials: "HS" },
  { id: "b5", companyName: "Southport Construction", industry: "Construction", status: "Approved", appliedAt: "2024-11-22", totalSpend: 67900, orderCount: 14, initials: "SC" },
  { id: "b6", companyName: "Vertex Pharmaceuticals", industry: "Chemical & Pharma", status: "Pending", appliedAt: "2026-04-19", totalSpend: 0, orderCount: 0, initials: "VP" },
  { id: "b7", companyName: "Old Republic Mining", industry: "Mining", status: "Suspended", appliedAt: "2023-09-01", totalSpend: 12400, orderCount: 3, initials: "OR" },
];

export type MarketplaceOrder = {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  status: "New" | "Acknowledged" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
  total: number;
  itemCount: number;
  placedAt: string;
  expectedBy: string;
  paymentMethod: string;
  shippingAddress: string;
  lines: { sku: string; name: string; qty: number; unitPrice: number }[];
};

export const MARKETPLACE_ORDERS: MarketplaceOrder[] = [
  { id: "mo1", orderNumber: "MO-2026-0421", buyerId: "b1", buyerName: "Pacific Manufacturing Corp", status: "New", total: 1842.5, itemCount: 4, placedAt: "2026-04-22", expectedBy: "2026-04-29", paymentMethod: "PayMongo Card", shippingAddress: "Bay 4, Pacific Industrial Park, Cebu", lines: [
    { sku: "ACM-BRG-6204", name: "Deep Groove Ball Bearing 6204", qty: 80, unitPrice: 12.5 },
    { sku: "ACM-HYD-25M", name: "Hydraulic Hose 25mm × 5m", qty: 6, unitPrice: 84 },
    { sku: "ACM-LUB-20L", name: "Industrial Lubricant ISO VG 68", qty: 2, unitPrice: 145 },
    { sku: "ACM-FAS-M12", name: "Hex Bolt M12 × 60", qty: 200, unitPrice: 0.42 },
  ]},
  { id: "mo2", orderNumber: "MO-2026-0420", buyerId: "b3", buyerName: "Coastal Energy Holdings", status: "Acknowledged", total: 4350.0, itemCount: 2, placedAt: "2026-04-21", expectedBy: "2026-04-28", paymentMethod: "Net30", shippingAddress: "Wharf 12, Coastal Refinery, Batangas", lines: [
    { sku: "ACM-LUB-20L", name: "Industrial Lubricant ISO VG 68", qty: 30, unitPrice: 145 },
  ]},
  { id: "mo3", orderNumber: "MO-2026-0418", buyerId: "b2", buyerName: "Northwind Logistics", status: "Packed", total: 980.0, itemCount: 3, placedAt: "2026-04-20", expectedBy: "2026-04-25", paymentMethod: "PayMongo GCash", shippingAddress: "Hub A, Northwind DC, Quezon City", lines: [] },
  { id: "mo4", orderNumber: "MO-2026-0415", buyerId: "b5", buyerName: "Southport Construction", status: "Shipped", total: 2240.0, itemCount: 5, placedAt: "2026-04-18", expectedBy: "2026-04-24", paymentMethod: "PayMongo Card", shippingAddress: "Site B-7, Southport Tower, Davao", lines: [] },
  { id: "mo5", orderNumber: "MO-2026-0410", buyerId: "b1", buyerName: "Pacific Manufacturing Corp", status: "Delivered", total: 5680.0, itemCount: 12, placedAt: "2026-04-12", expectedBy: "2026-04-19", paymentMethod: "Net30", shippingAddress: "Bay 4, Pacific Industrial Park", lines: [] },
  { id: "mo6", orderNumber: "MO-2026-0408", buyerId: "b3", buyerName: "Coastal Energy Holdings", status: "Delivered", total: 980.0, itemCount: 2, placedAt: "2026-04-10", expectedBy: "2026-04-17", paymentMethod: "Net30", shippingAddress: "Wharf 12, Coastal Refinery", lines: [] },
  { id: "mo7", orderNumber: "MO-2026-0405", buyerId: "b2", buyerName: "Northwind Logistics", status: "Cancelled", total: 320.0, itemCount: 1, placedAt: "2026-04-08", expectedBy: "2026-04-15", paymentMethod: "PayMongo Card", shippingAddress: "Hub A, Northwind DC", lines: [] },
];

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  buyerName: string;
  status: "Issued" | "Acknowledged" | "Partially Received" | "Received" | "Cancelled";
  total: number;
  poDate: string;
  expectedDelivery: string;
  paymentTerms: string;
  itemCount: number;
};

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: "po1", poNumber: "PO-PMC-008412", buyerName: "Pacific Manufacturing Corp", status: "Issued", total: 12480.0, poDate: "2026-04-22", expectedDelivery: "2026-05-06", paymentTerms: "Net30", itemCount: 8 },
  { id: "po2", poNumber: "PO-CEH-002201", buyerName: "Coastal Energy Holdings", status: "Acknowledged", total: 24800.0, poDate: "2026-04-19", expectedDelivery: "2026-05-03", paymentTerms: "Net45", itemCount: 12 },
  { id: "po3", poNumber: "PO-NWL-000932", buyerName: "Northwind Logistics", status: "Partially Received", total: 6720.0, poDate: "2026-04-15", expectedDelivery: "2026-04-29", paymentTerms: "Net30", itemCount: 5 },
  { id: "po4", poNumber: "PO-PMC-008401", buyerName: "Pacific Manufacturing Corp", status: "Received", total: 9650.0, poDate: "2026-04-08", expectedDelivery: "2026-04-22", paymentTerms: "Net30", itemCount: 6 },
  { id: "po5", poNumber: "PO-SPC-001154", buyerName: "Southport Construction", status: "Received", total: 4280.0, poDate: "2026-04-04", expectedDelivery: "2026-04-18", paymentTerms: "COD", itemCount: 4 },
];

export type Delivery = {
  id: string;
  deliveryNumber: string;
  orderRef: string; // PO or MO number
  buyerName: string;
  status: "Preparing" | "In Transit" | "Out for Delivery" | "Delivered" | "Failed";
  carrier: string;
  trackingNumber: string;
  shippedAt: string;
  expectedAt: string;
  itemCount: number;
};

export const DELIVERIES: Delivery[] = [
  { id: "d1", deliveryNumber: "DLV-2026-0421-A", orderRef: "MO-2026-0418", buyerName: "Northwind Logistics", status: "Preparing", carrier: "Acme Internal Fleet", trackingNumber: "ACME-78421", shippedAt: "2026-04-22", expectedAt: "2026-04-25", itemCount: 3 },
  { id: "d2", deliveryNumber: "DLV-2026-0420-B", orderRef: "MO-2026-0415", buyerName: "Southport Construction", status: "In Transit", carrier: "LBC Express", trackingNumber: "LBC-9923-4421", shippedAt: "2026-04-21", expectedAt: "2026-04-24", itemCount: 5 },
  { id: "d3", deliveryNumber: "DLV-2026-0418-C", orderRef: "PO-NWL-000932", buyerName: "Northwind Logistics", status: "Out for Delivery", carrier: "J&T Express", trackingNumber: "JT-42100-8821", shippedAt: "2026-04-20", expectedAt: "2026-04-23", itemCount: 5 },
  { id: "d4", deliveryNumber: "DLV-2026-0412-D", orderRef: "MO-2026-0410", buyerName: "Pacific Manufacturing Corp", status: "Delivered", carrier: "Acme Internal Fleet", trackingNumber: "ACME-78340", shippedAt: "2026-04-13", expectedAt: "2026-04-18", itemCount: 12 },
  { id: "d5", deliveryNumber: "DLV-2026-0410-E", orderRef: "MO-2026-0408", buyerName: "Coastal Energy Holdings", status: "Delivered", carrier: "2GO Express", trackingNumber: "2GO-55-4421", shippedAt: "2026-04-11", expectedAt: "2026-04-16", itemCount: 2 },
  { id: "d6", deliveryNumber: "DLV-2026-0405-F", orderRef: "PO-PMC-008401", buyerName: "Pacific Manufacturing Corp", status: "Failed", carrier: "LBC Express", trackingNumber: "LBC-9921-1188", shippedAt: "2026-04-09", expectedAt: "2026-04-14", itemCount: 1 },
];

export type Invoice = {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  amount: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  issuedAt: string;
  dueAt: string;
  reference: string; // PO or MO
};

export const INVOICES: Invoice[] = [
  { id: "i1", invoiceNumber: "INV-2026-04-0042", buyerName: "Pacific Manufacturing Corp", amount: 12480, status: "Sent", issuedAt: "2026-04-22", dueAt: "2026-05-22", reference: "PO-PMC-008412" },
  { id: "i2", invoiceNumber: "INV-2026-04-0041", buyerName: "Coastal Energy Holdings", amount: 4350, status: "Paid", issuedAt: "2026-04-21", dueAt: "2026-05-21", reference: "MO-2026-0420" },
  { id: "i3", invoiceNumber: "INV-2026-04-0038", buyerName: "Northwind Logistics", amount: 6720, status: "Sent", issuedAt: "2026-04-15", dueAt: "2026-05-15", reference: "PO-NWL-000932" },
  { id: "i4", invoiceNumber: "INV-2026-03-0029", buyerName: "Pacific Manufacturing Corp", amount: 9650, status: "Paid", issuedAt: "2026-03-28", dueAt: "2026-04-27", reference: "PO-PMC-008401" },
  { id: "i5", invoiceNumber: "INV-2026-03-0021", buyerName: "Old Republic Mining", amount: 2400, status: "Overdue", issuedAt: "2026-03-12", dueAt: "2026-04-11", reference: "PO-ORM-000088" },
  { id: "i6", invoiceNumber: "INV-2026-04-0044", buyerName: "Southport Construction", amount: 2240, status: "Draft", issuedAt: "2026-04-22", dueAt: "2026-05-22", reference: "MO-2026-0415" },
];

export type Payout = {
  id: string;
  reference: string;
  amount: number;
  status: "Scheduled" | "Processing" | "Paid" | "Failed";
  scheduledFor: string;
  method: string;
  invoiceCount: number;
};

export const PAYOUTS: Payout[] = [
  { id: "py1", reference: "PYT-2026-0428", amount: 16830, status: "Scheduled", scheduledFor: "2026-04-28", method: "PayMongo → BPI ****4421", invoiceCount: 3 },
  { id: "py2", reference: "PYT-2026-0421", amount: 4350, status: "Paid", scheduledFor: "2026-04-21", method: "PayMongo → BPI ****4421", invoiceCount: 1 },
  { id: "py3", reference: "PYT-2026-0414", amount: 9650, status: "Paid", scheduledFor: "2026-04-14", method: "PayMongo → BPI ****4421", invoiceCount: 1 },
  { id: "py4", reference: "PYT-2026-0407", amount: 12300, status: "Paid", scheduledFor: "2026-04-07", method: "PayMongo → BPI ****4421", invoiceCount: 4 },
];

export type ComplianceDoc = {
  id: string;
  type: string;
  fileName: string;
  status: "Valid" | "Expiring" | "Expired" | "Pending Review";
  expiresAt?: string;
  uploadedAt: string;
};

export const COMPLIANCE_DOCS: ComplianceDoc[] = [
  { id: "c1", type: "BIR Certificate", fileName: "BIR-2316-2025.pdf", status: "Valid", expiresAt: "2026-12-31", uploadedAt: "2025-01-12" },
  { id: "c2", type: "Business Permit", fileName: "MayorPermit-2026.pdf", status: "Valid", expiresAt: "2026-12-31", uploadedAt: "2026-01-05" },
  { id: "c3", type: "ISO 9001", fileName: "ISO-9001-2024.pdf", status: "Valid", expiresAt: "2027-03-15", uploadedAt: "2024-03-15" },
  { id: "c4", type: "DTI Registration", fileName: "DTI-Reg.pdf", status: "Valid", uploadedAt: "2023-04-12" },
  { id: "c5", type: "Product Catalogue", fileName: "Catalogue-2026-Q2.pdf", status: "Valid", uploadedAt: "2026-04-01" },
  { id: "c6", type: "Fire Safety Inspection", fileName: "FSI-2026.pdf", status: "Expiring", expiresAt: "2026-05-30", uploadedAt: "2025-05-30" },
  { id: "c7", type: "PCAB License", fileName: "PCAB-2024.pdf", status: "Expired", expiresAt: "2025-12-31", uploadedAt: "2024-01-08" },
];

export type Conversation = {
  id: string;
  buyerName: string;
  initials: string;
  preview: string;
  unread: number;
  lastAt: string;
  pinned?: boolean;
  messages: { from: "buyer" | "vendor"; text: string; at: string }[];
};

export const CONVERSATIONS: Conversation[] = [
  { id: "cv1", buyerName: "Pacific Manufacturing Corp", initials: "PM", preview: "Can you split the M12 bolts into two pallets?", unread: 2, lastAt: "10:24", pinned: true, messages: [
    { from: "buyer", text: "Hi! We just placed MO-2026-0421.", at: "Yesterday 16:02" },
    { from: "vendor", text: "Got it — confirming stock now.", at: "Yesterday 16:08" },
    { from: "buyer", text: "Can you split the M12 bolts into two pallets?", at: "10:24" },
  ]},
  { id: "cv2", buyerName: "Coastal Energy Holdings", initials: "CE", preview: "Invoice INV-2026-04-0041 paid.", unread: 0, lastAt: "Yesterday", messages: [
    { from: "buyer", text: "Invoice INV-2026-04-0041 paid.", at: "Yesterday 14:11" },
  ]},
  { id: "cv3", buyerName: "Northwind Logistics", initials: "NL", preview: "Tracking number please?", unread: 1, lastAt: "Mon", messages: [
    { from: "buyer", text: "Tracking number please?", at: "Mon 09:30" },
  ]},
  { id: "cv4", buyerName: "Highland Steel Works", initials: "HS", preview: "We submitted an accreditation request.", unread: 0, lastAt: "Apr 12", messages: [
    { from: "buyer", text: "We submitted an accreditation request — let us know if you need more docs.", at: "Apr 12 11:00" },
  ]},
];

export type Review = {
  id: string;
  buyerName: string;
  initials: string;
  productName: string;
  rating: number;
  text: string;
  at: string;
};

export const REVIEWS: Review[] = [
  { id: "r1", buyerName: "Pacific Manufacturing Corp", initials: "PM", productName: "Hex Bolt M12 × 60", rating: 5, text: "Consistent quality, fast dispatch. Our preferred bearings supplier now.", at: "2026-04-18" },
  { id: "r2", buyerName: "Coastal Energy Holdings", initials: "CE", productName: "Industrial Lubricant ISO VG 68", rating: 5, text: "Lubricant shipped on time and properly sealed. Will reorder.", at: "2026-04-15" },
  { id: "r3", buyerName: "Northwind Logistics", initials: "NL", productName: "Hydraulic Hose 25mm × 5m", rating: 4, text: "Good product. One hose had minor packaging damage but still usable.", at: "2026-04-09" },
  { id: "r4", buyerName: "Southport Construction", initials: "SC", productName: "Hard Hat Type 1 Class E", rating: 5, text: "Solid hats. Comfortable for 8-hour shifts.", at: "2026-04-02" },
];

// 14-day revenue + orders timeseries for dashboard charts
export const REVENUE_SERIES = [
  { day: "Apr 09", revenue: 1240, orders: 4 },
  { day: "Apr 10", revenue: 5680, orders: 9 },
  { day: "Apr 11", revenue: 980, orders: 3 },
  { day: "Apr 12", revenue: 2120, orders: 5 },
  { day: "Apr 13", revenue: 4480, orders: 7 },
  { day: "Apr 14", revenue: 3210, orders: 6 },
  { day: "Apr 15", revenue: 6920, orders: 11 },
  { day: "Apr 16", revenue: 1840, orders: 4 },
  { day: "Apr 17", revenue: 2950, orders: 6 },
  { day: "Apr 18", revenue: 4220, orders: 8 },
  { day: "Apr 19", revenue: 5410, orders: 9 },
  { day: "Apr 20", revenue: 3680, orders: 7 },
  { day: "Apr 21", revenue: 4720, orders: 8 },
  { day: "Apr 22", revenue: 6180, orders: 10 },
];

export function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(n);
}

export function formatCurrencyDecimal(n: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n);
}

// ─── RFQs received from buyers (vendor inbox view) ───
// The current vendor (Acme) is "v1".
export const CURRENT_VENDOR_ID = "v1";

export type IncomingRFQ = {
  id: string;
  rfqNumber: string;
  buyerName: string;
  buyerInitials: string;
  title: string;
  category: string;
  receivedAt: string;
  closesAt: string;
  status: "New" | "Viewed" | "Quoted" | "Awarded" | "Lost" | "Declined" | "Closed";
  competingVendors: number;
  estTotal: number;
  unread: number;
  lines: { sku?: string; description: string; qty: number; uom: string; targetPrice?: number; notes?: string }[];
  thread: { from: "buyer" | "vendor"; text: string; at: string }[];
  myQuote?: {
    total: number;
    leadTimeDays: number;
    validUntil: string;
    submittedAt: string;
    rank?: number;
  };
};

export const INCOMING_RFQS: IncomingRFQ[] = [
  {
    id: "irfq1",
    rfqNumber: "RFQ-2026-0420",
    buyerName: "Pacific Manufacturing Corp",
    buyerInitials: "PM",
    title: "Hydraulic line overhaul materials",
    category: "Hydraulics",
    receivedAt: "2026-04-21",
    closesAt: "2026-04-28",
    status: "Quoted",
    competingVendors: 4,
    estTotal: 18620,
    unread: 0,
    lines: [
      { sku: "HYD-HSE-25M", description: "Hydraulic Hose 25mm × 5m, 4000psi", qty: 12, uom: "pc", targetPrice: 80, notes: "EN 853 2SN compliant" },
      { sku: "HYD-CYL-50T", description: "Hydraulic Cylinder 50-ton, double-acting", qty: 2, uom: "pc", targetPrice: 2600 },
      { sku: "HYD-PMP-15HP", description: "Hydraulic Pump 15HP, gear-type", qty: 1, uom: "pc", targetPrice: 1800 },
      { description: "Installation labour & commissioning", qty: 1, uom: "lot", targetPrice: 4200 },
    ],
    thread: [
      { from: "vendor", text: "Submitted quotation. Pricing in USD, FOB Cebu.", at: "Apr 22 14:11" },
      { from: "buyer", text: "Thanks — do you offer 30-day payment terms?", at: "Apr 23 07:50" },
    ],
    myQuote: { total: 18620, leadTimeDays: 6, validUntil: "2026-05-15", submittedAt: "2026-04-22", rank: 2 },
  },
  {
    id: "irfq2",
    rfqNumber: "RFQ-2026-0416",
    buyerName: "Pacific Manufacturing Corp",
    buyerInitials: "PM",
    title: "Chemicals quarterly bulk",
    category: "Chemicals",
    receivedAt: "2026-04-16",
    closesAt: "2026-04-23",
    status: "Lost",
    competingVendors: 3,
    estTotal: 2440,
    unread: 0,
    lines: [
      { sku: "CHM-LUB-200L", description: "Industrial Lubricant 200L Drum, ISO VG 68", qty: 4, uom: "drum", targetPrice: 470 },
      { sku: "CHM-DEG-25L", description: "Industrial Degreaser 25L", qty: 3, uom: "pail", targetPrice: 140 },
    ],
    thread: [
      { from: "vendor", text: "Quote submitted, valid 30 days.", at: "Apr 17 10:00" },
      { from: "buyer", text: "Awarded to Vertex Chemicals — thank you for bidding.", at: "Apr 23 09:00" },
    ],
    myQuote: { total: 2440, leadTimeDays: 4, validUntil: "2026-05-10", submittedAt: "2026-04-17", rank: 2 },
  },
  {
    id: "irfq3",
    rfqNumber: "RFQ-2026-0426",
    buyerName: "Coastal Energy Holdings",
    buyerInitials: "CE",
    title: "Bearings annual blanket order",
    category: "Bearings",
    receivedAt: "2026-04-22",
    closesAt: "2026-05-02",
    status: "New",
    competingVendors: 5,
    estTotal: 0,
    unread: 2,
    lines: [
      { sku: "BRG-6204", description: "Deep Groove Ball Bearing 6204 (SKF or equivalent)", qty: 600, uom: "pc", targetPrice: 11.5 },
      { sku: "BRG-6307", description: "Deep Groove Ball Bearing 6307 (SKF or equivalent)", qty: 240, uom: "pc", targetPrice: 17.0 },
      { sku: "BRG-6206", description: "Deep Groove Ball Bearing 6206", qty: 320, uom: "pc", targetPrice: 13.0 },
    ],
    thread: [
      { from: "buyer", text: "Annual blanket — please quote unit price plus 12-month commitment discount.", at: "Apr 22 09:00" },
      { from: "buyer", text: "Need ISO 9001 cert attached with quote.", at: "Apr 22 09:02" },
    ],
  },
  {
    id: "irfq4",
    rfqNumber: "RFQ-2026-0425",
    buyerName: "Northwind Logistics",
    buyerInitials: "NL",
    title: "MRO consumables Q3",
    category: "MRO",
    receivedAt: "2026-04-22",
    closesAt: "2026-04-30",
    status: "Viewed",
    competingVendors: 4,
    estTotal: 0,
    unread: 1,
    lines: [
      { sku: "MRO-WD40", description: "Multi-Use Lubricant 400ml", qty: 240, uom: "can", targetPrice: 9 },
      { sku: "MRO-RAG-CTN", description: "Workshop Rags (10kg carton)", qty: 30, uom: "carton", targetPrice: 22 },
    ],
    thread: [
      { from: "buyer", text: "Please confirm if you can hold price for 60 days.", at: "Apr 22 11:30" },
    ],
  },
  {
    id: "irfq5",
    rfqNumber: "RFQ-2026-0418",
    buyerName: "Southport Construction",
    buyerInitials: "SC",
    title: "Fasteners site delivery — Tower B",
    category: "Fasteners",
    receivedAt: "2026-04-18",
    closesAt: "2026-04-26",
    status: "Awarded",
    competingVendors: 3,
    estTotal: 1680,
    unread: 0,
    lines: [
      { sku: "FAS-M12", description: "Hex Bolt M12 × 60 Grade 8.8 (100pk)", qty: 40, uom: "pack", targetPrice: 42 },
    ],
    thread: [
      { from: "vendor", text: "Quote sent — can deliver to site in 2 days.", at: "Apr 18 14:00" },
      { from: "buyer", text: "Awarded — PO incoming.", at: "Apr 20 10:15" },
    ],
    myQuote: { total: 1680, leadTimeDays: 2, validUntil: "2026-05-02", submittedAt: "2026-04-18", rank: 1 },
  },
];
