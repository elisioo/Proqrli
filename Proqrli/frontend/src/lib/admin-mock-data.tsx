/* eslint-disable prettier/prettier */
// Superadmin / platform owner mock data.
// This data is intentionally separate from buyer/vendor mock data —
// it represents the *system itself* (multi-tenant control plane).

export type AdminRole = "superadmin" | "platform_ops" | "support";

export type AdminUser = {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    avatar?: string;
};

export type Tenant = {
    id: string;
    name: string;
    slug: string;
    plan: "Starter" | "Growth" | "Enterprise";
    status: "Active" | "Trial" | "Suspended" | "Archived";
    industry: string;
    region: string;
    users: number;
    vendors: number;
    mrrUSD: number;
    spendYTD: number;
    createdAt: string; // ISO
    primaryContact: string;
};

export type PlatformUser = {
    id: string;
    name: string;
    email: string;
    tenantId: string | null; // null = platform-level
    role: string; // tenant-scoped role label
    status: "Active" | "Invited" | "Suspended";
    lastSeen: string;
};

export type PlatformVendor = {
    id: string;
    name: string;
    category: string;
    country: string;
    riskClass: "Low" | "Medium" | "High";
    accreditation: "Accredited" | "Pending Review" | "Suspended";
    tenantsServed: number;
    joinedAt: string;
};

export type Module = {
    key: string;
    name: string;
    description: string;
    version: string;
    enabledForPlans: Array<Tenant["plan"]>;
    status: "Stable" | "Beta" | "Deprecated";
};

export type AuditEvent = {
    id: string;
    at: string; // ISO
    actor: string;
    action: string;
    target: string;
    tenantId: string | null;
    severity: "info" | "warn" | "critical";
};

export type SystemMetric = {
    name: string;
    value: string;
    delta?: string;
    ok: boolean;
};

export type IncidentStatus = "Operational" | "Degraded" | "Outage" | "Maintenance";
export type ServiceHealth = {
    service: string;
    status: IncidentStatus;
    uptime: string;
    region: string;
};

export const ADMIN_USER: AdminUser = {
    id: "su-001",
    name: "Eli Sorono",
    email: "eli.sorono@procurli.io",
    role: "superadmin",
};

export const TENANTS: Tenant[] = [
    {
        id: "t-001",
        name: "Northwind Manufacturing",
        slug: "northwind",
        plan: "Enterprise",
        status: "Active",
        industry: "Heavy Equipment",
        region: "NA-East",
        users: 142,
        vendors: 318,
        mrrUSD: 12400,
        spendYTD: 18_420_000,
        createdAt: "2023-04-12",
        primaryContact: "rachel.morris@northwind.com",
    },
    {
        id: "t-002",
        name: "Helix Pharmaceuticals",
        slug: "helix-pharma",
        plan: "Enterprise",
        status: "Active",
        industry: "Pharma",
        region: "EU-West",
        users: 88,
        vendors: 204,
        mrrUSD: 9800,
        spendYTD: 9_120_000,
        createdAt: "2023-09-02",
        primaryContact: "j.koenig@helix.eu",
    },
    {
        id: "t-003",
        name: "Tidepool Foods Co.",
        slug: "tidepool",
        plan: "Growth",
        status: "Active",
        industry: "F&B Processing",
        region: "APAC",
        users: 41,
        vendors: 127,
        mrrUSD: 3200,
        spendYTD: 4_010_000,
        createdAt: "2024-01-18",
        primaryContact: "ops@tidepool.sg",
    },
    {
        id: "t-004",
        name: "Vector Robotics",
        slug: "vector",
        plan: "Growth",
        status: "Trial",
        industry: "Industrial Robotics",
        region: "NA-West",
        users: 12,
        vendors: 22,
        mrrUSD: 0,
        spendYTD: 142_000,
        createdAt: "2026-04-04",
        primaryContact: "nia@vectorrobotics.com",
    },
    {
        id: "t-005",
        name: "Kintsugi Textiles",
        slug: "kintsugi",
        plan: "Starter",
        status: "Suspended",
        industry: "Textiles",
        region: "APAC",
        users: 18,
        vendors: 51,
        mrrUSD: 0,
        spendYTD: 612_000,
        createdAt: "2024-07-22",
        primaryContact: "billing@kintsugi.jp",
    },
    {
        id: "t-006",
        name: "Aster Energy Group",
        slug: "aster-energy",
        plan: "Enterprise",
        status: "Active",
        industry: "Utilities",
        region: "EU-North",
        users: 211,
        vendors: 489,
        mrrUSD: 15600,
        spendYTD: 27_900_000,
        createdAt: "2022-11-30",
        primaryContact: "procurement@aster.no",
    },
];

export const PLATFORM_USERS: PlatformUser[] = [
    { id: "u-001", name: "Eli Sorono", email: "eli.sorono@procurli.io", tenantId: null, role: "Superadmin", status: "Active", lastSeen: "just now" },
    { id: "u-002", name: "Marco Devlin", email: "marco@procurli.io", tenantId: null, role: "Platform Ops", status: "Active", lastSeen: "2h ago" },
    { id: "u-003", name: "Priya Shah", email: "priya@procurli.io", tenantId: null, role: "Support L2", status: "Active", lastSeen: "1d ago" },
    { id: "u-004", name: "Rachel Morris", email: "rachel.morris@northwind.com", tenantId: "t-001", role: "Tenant Admin", status: "Active", lastSeen: "5m ago" },
    { id: "u-005", name: "Jonas Koenig", email: "j.koenig@helix.eu", tenantId: "t-002", role: "Tenant Admin", status: "Active", lastSeen: "32m ago" },
    { id: "u-006", name: "Nia Okafor", email: "nia@vectorrobotics.com", tenantId: "t-004", role: "Tenant Admin", status: "Invited", lastSeen: "—" },
    { id: "u-007", name: "Hideo Tanaka", email: "billing@kintsugi.jp", tenantId: "t-005", role: "Tenant Admin", status: "Suspended", lastSeen: "12d ago" },
];

export const PLATFORM_VENDORS: PlatformVendor[] = [
    { id: "v-001", name: "Steelhaven Forge Co.", category: "Raw Materials", country: "US", riskClass: "Low", accreditation: "Accredited", tenantsServed: 14, joinedAt: "2023-05-09" },
    { id: "v-002", name: "Meridian Logistics", category: "Logistics", country: "DE", riskClass: "Low", accreditation: "Accredited", tenantsServed: 22, joinedAt: "2023-02-14" },
    { id: "v-003", name: "Polaris Components Ltd.", category: "Electronics", country: "TW", riskClass: "Medium", accreditation: "Accredited", tenantsServed: 9, joinedAt: "2024-03-01" },
    { id: "v-004", name: "Verdant Chemicals", category: "Chemicals", country: "NL", riskClass: "High", accreditation: "Pending Review", tenantsServed: 3, joinedAt: "2026-02-20" },
    { id: "v-005", name: "Ironbark Packaging", category: "Packaging", country: "AU", riskClass: "Low", accreditation: "Accredited", tenantsServed: 11, joinedAt: "2024-08-17" },
    { id: "v-006", name: "Quanta Calibration Labs", category: "Services", country: "SG", riskClass: "Medium", accreditation: "Accredited", tenantsServed: 6, joinedAt: "2025-01-03" },
    { id: "v-007", name: "Falconer Tooling", category: "MRO", country: "UK", riskClass: "High", accreditation: "Suspended", tenantsServed: 2, joinedAt: "2024-11-11" },
];

export const MODULES: Module[] = [
    { key: "marketplace", name: "Vendor Marketplace", description: "Public catalogue of accredited suppliers", version: "3.4.1", enabledForPlans: ["Starter", "Growth", "Enterprise"], status: "Stable" },
    { key: "rfq", name: "RFQ Engine", description: "Multi-vendor quotation comparison & award", version: "2.9.0", enabledForPlans: ["Growth", "Enterprise"], status: "Stable" },
    { key: "po", name: "Purchase Orders", description: "PO issuance, acknowledgement, GRN, 3-way match", version: "4.1.2", enabledForPlans: ["Starter", "Growth", "Enterprise"], status: "Stable" },
    { key: "risk-ml", name: "ML Risk Detection", description: "Vendor risk scoring on financial, compliance & delivery", version: "1.6.0", enabledForPlans: ["Enterprise"], status: "Stable" },
    { key: "contracts", name: "Contract Management", description: "Contract repository, renewals & expiry alerts", version: "1.2.0", enabledForPlans: ["Growth", "Enterprise"], status: "Beta" },
    { key: "analytics", name: "Procurement Analytics", description: "Spend cubes, savings, cycle-time dashboards", version: "2.0.3", enabledForPlans: ["Growth", "Enterprise"], status: "Stable" },
    { key: "esign", name: "E-Signatures (legacy)", description: "Inline signing on POs and contracts", version: "0.9.4", enabledForPlans: ["Starter"], status: "Deprecated" },
];

export const AUDIT_EVENTS: AuditEvent[] = [
    { id: "ev-100", at: "2026-04-29T08:42:00Z", actor: "casey@procurli.io", action: "tenant.suspend", target: "Kintsugi Textiles", tenantId: "t-005", severity: "warn" },
    { id: "ev-099", at: "2026-04-29T07:14:00Z", actor: "marco@procurli.io", action: "module.toggle", target: "contracts → Helix Pharmaceuticals", tenantId: "t-002", severity: "info" },
    { id: "ev-098", at: "2026-04-29T05:02:00Z", actor: "system", action: "billing.invoice.generated", target: "Northwind Manufacturing — $12,400", tenantId: "t-001", severity: "info" },
    { id: "ev-097", at: "2026-04-28T22:18:00Z", actor: "priya@procurli.io", action: "user.password.reset", target: "rachel.morris@northwind.com", tenantId: "t-001", severity: "info" },
    { id: "ev-096", at: "2026-04-28T19:47:00Z", actor: "system", action: "vendor.risk.escalated", target: "Verdant Chemicals → High", tenantId: null, severity: "warn" },
    { id: "ev-095", at: "2026-04-28T16:11:00Z", actor: "casey@procurli.io", action: "feature_flag.toggle", target: "ml-risk-v2 → ON (Enterprise)", tenantId: null, severity: "critical" },
    { id: "ev-094", at: "2026-04-28T11:33:00Z", actor: "marco@procurli.io", action: "tenant.create", target: "Vector Robotics (trial)", tenantId: "t-004", severity: "info" },
    { id: "ev-093", at: "2026-04-28T09:01:00Z", actor: "system", action: "deploy.rollout", target: "rfq-engine v2.9.0 → 100%", tenantId: null, severity: "info" },
];

export const SYSTEM_METRICS: SystemMetric[] = [
    { name: "Active tenants", value: "142", delta: "+6 this month", ok: true },
    { name: "Monthly recurring revenue", value: "$418.2K", delta: "+4.1% MoM", ok: true },
    { name: "API p95 latency", value: "212 ms", delta: "−18 ms WoW", ok: true },
    { name: "Error rate (24h)", value: "0.04%", delta: "within SLO", ok: true },
    { name: "Storage used", value: "8.42 TB", delta: "of 16 TB", ok: true },
    { name: "Open incidents", value: "1", delta: "Verdant ingest queue", ok: false },
];

export const SERVICE_HEALTH: ServiceHealth[] = [
    { service: "API Gateway", status: "Operational", uptime: "99.99%", region: "Multi-region" },
    { service: "Auth & SSO", status: "Operational", uptime: "99.98%", region: "Multi-region" },
    { service: "RFQ Engine", status: "Operational", uptime: "99.97%", region: "us-east, eu-west" },
    { service: "ML Risk Service", status: "Degraded", uptime: "99.71%", region: "us-east" },
    { service: "Document Storage", status: "Operational", uptime: "99.99%", region: "Multi-region" },
    { service: "Email Delivery", status: "Operational", uptime: "99.94%", region: "Global" },
    { service: "Background Jobs", status: "Maintenance", uptime: "—", region: "eu-west" },
];

export function formatUSD(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function formatRelative(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
