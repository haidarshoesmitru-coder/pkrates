import type {
  AdminUser,
  AuditLogEntry,
  DataSource,
  DomainConfig,
  PublishedRecord,
  Submission,
} from "@/types/admin";

// ---------------------------------------------------------------------
// Current signed-in admin (mock — no auth wired up yet)
// ---------------------------------------------------------------------
export const currentAdminUser: AdminUser = {
  id: "u-1",
  name: "Ayesha Khan",
  email: "ayesha.khan@pkrates.pk",
  role: "reviewer",
  domains: ["gold", "currency"],
  isActive: true,
  lastActive: "Just now",
};

// ---------------------------------------------------------------------
// Domain configs — one entry per commodity, drives the generic
// RateDomainAdmin UI (table columns, submit form fields).
// ---------------------------------------------------------------------
export const domainConfigs: Record<string, DomainConfig> = {
  gold: {
    slug: "gold",
    title: "Gold Rate Management",
    description: "City-wise, karat-wise gold rates — verified against Sarafa Association boards.",
    icon: "coins",
    primaryFieldKey: "ratePerTola",
    fields: [
      { key: "city", label: "City", type: "select", options: ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta"] },
      { key: "karat", label: "Karat", type: "select", options: ["24K", "22K", "21K", "18K"] },
      { key: "ratePerTola", label: "Rate per Tola", type: "number", suffix: "PKR" },
    ],
  },
  currency: {
    slug: "currency",
    title: "Currency Rate Management",
    description: "Interbank and open-market buy/sell rates for 15+ currencies.",
    icon: "banknote",
    primaryFieldKey: "sellRate",
    fields: [
      { key: "currency", label: "Currency", type: "select", options: ["USD", "AED", "GBP", "EUR", "SAR", "CNY"] },
      { key: "rateType", label: "Rate Type", type: "select", options: ["Interbank", "Open Market"] },
      { key: "buyRate", label: "Buy Rate", type: "number", suffix: "PKR" },
      { key: "sellRate", label: "Sell Rate", type: "number", suffix: "PKR" },
    ],
  },
  petrol: {
    slug: "petrol",
    title: "Petrol Price Management",
    description: "Official OGRA-notified fuel prices, event-driven rather than continuous.",
    icon: "fuel",
    primaryFieldKey: "pricePerLiter",
    fields: [
      { key: "fuelType", label: "Fuel Type", type: "select", options: ["Petrol", "High Speed Diesel", "Kerosene Oil", "LDO"] },
      { key: "pricePerLiter", label: "Price per Litre", type: "number", suffix: "PKR" },
      { key: "notificationRef", label: "OGRA Notification Ref.", type: "text" },
      { key: "effectiveFrom", label: "Effective From", type: "date" },
    ],
  },
  "prize-bonds": {
    slug: "prize-bonds",
    title: "Prize Bond Management",
    description: "Draw calendar, draw results and winning bond numbers by denomination.",
    icon: "ticket",
    primaryFieldKey: "denomination",
    fields: [
      { key: "denomination", label: "Denomination", type: "select", options: ["Rs. 100", "Rs. 200", "Rs. 750", "Rs. 1,500", "Rs. 7,500", "Rs. 15,000", "Rs. 25,000", "Rs. 40,000"] },
      { key: "drawNumber", label: "Draw Number", type: "number" },
      { key: "city", label: "Draw City", type: "select", options: ["Karachi", "Lahore", "Islamabad", "Peshawar", "Multan", "Hyderabad"] },
      { key: "drawDate", label: "Draw Date", type: "date" },
    ],
  },
  cement: {
    slug: "cement",
    title: "Cement Rate Management",
    description: "Per-bag pricing by brand and city, sourced from dealer networks.",
    icon: "package",
    primaryFieldKey: "pricePerBag",
    fields: [
      { key: "brand", label: "Brand", type: "select", options: ["Lucky Cement", "DG Cement", "Bestway", "Fauji Cement", "Maple Leaf"] },
      { key: "city", label: "City", type: "select", options: ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta"] },
      { key: "pricePerBag", label: "Price per Bag (50kg)", type: "number", suffix: "PKR" },
    ],
  },
  steel: {
    slug: "steel",
    title: "Steel / Saria Rate Management",
    description: "Grade-wise pricing per maund and per ton, sourced from re-rolling mills.",
    icon: "layers",
    primaryFieldKey: "pricePerTon",
    fields: [
      { key: "grade", label: "Grade", type: "select", options: ["Grade 40", "Grade 60"] },
      { key: "city", label: "City", type: "select", options: ["Karachi", "Lahore", "Islamabad", "Peshawar"] },
      { key: "pricePerMaund", label: "Price per Maund", type: "number", suffix: "PKR" },
      { key: "pricePerTon", label: "Price per Ton", type: "number", suffix: "PKR" },
    ],
  },
};

// ---------------------------------------------------------------------
// Published records (what's currently live) per domain
// ---------------------------------------------------------------------
export const publishedRecords: Record<string, PublishedRecord[]> = {
  gold: [
    { id: "g-1", fields: [{ key: "city", value: "Karachi" }, { key: "karat", value: "24K" }, { key: "ratePerTola", value: "285,500" }], status: "published", sourceName: "Karachi Sarafa Association", approvedBy: "Ayesha Khan", effectiveAt: "Today, 4:12 PM" },
    { id: "g-2", fields: [{ key: "city", value: "Lahore" }, { key: "karat", value: "24K" }, { key: "ratePerTola", value: "285,600" }], status: "published", sourceName: "Lahore Sarafa Association", approvedBy: "Ayesha Khan", effectiveAt: "Today, 4:10 PM" },
    { id: "g-3", fields: [{ key: "city", value: "Islamabad" }, { key: "karat", value: "24K" }, { key: "ratePerTola", value: "285,550" }], status: "published", sourceName: "Islamabad Sarafa Association", approvedBy: "Bilal Ahmed", effectiveAt: "Today, 4:09 PM" },
    { id: "g-4", fields: [{ key: "city", value: "Peshawar" }, { key: "karat", value: "24K" }, { key: "ratePerTola", value: "285,700" }], status: "published", sourceName: "Peshawar Sarafa Association", approvedBy: "Ayesha Khan", effectiveAt: "Today, 3:58 PM" },
    { id: "g-5", fields: [{ key: "city", value: "Quetta" }, { key: "karat", value: "24K" }, { key: "ratePerTola", value: "285,450" }], status: "published", sourceName: "Quetta Sarafa Association", approvedBy: "Bilal Ahmed", effectiveAt: "Today, 3:55 PM" },
  ],
  currency: [
    { id: "c-1", fields: [{ key: "currency", value: "USD" }, { key: "rateType", value: "Interbank" }, { key: "buyRate", value: "278.20" }, { key: "sellRate", value: "278.80" }], status: "published", sourceName: "State Bank of Pakistan", approvedBy: "Ayesha Khan", effectiveAt: "Today, 2:30 PM" },
    { id: "c-2", fields: [{ key: "currency", value: "USD" }, { key: "rateType", value: "Open Market" }, { key: "buyRate", value: "278.90" }, { key: "sellRate", value: "279.60" }], status: "published", sourceName: "Forex Association of Pakistan", approvedBy: "Bilal Ahmed", effectiveAt: "Today, 2:15 PM" },
    { id: "c-3", fields: [{ key: "currency", value: "AED" }, { key: "rateType", value: "Interbank" }, { key: "buyRate", value: "75.65" }, { key: "sellRate", value: "75.95" }], status: "published", sourceName: "State Bank of Pakistan", approvedBy: "Ayesha Khan", effectiveAt: "Today, 2:30 PM" },
  ],
  petrol: [
    { id: "p-1", fields: [{ key: "fuelType", value: "Petrol" }, { key: "pricePerLiter", value: "272.50" }, { key: "notificationRef", value: "OGRA/PSO-2026-14" }, { key: "effectiveFrom", value: "16 Jul 2026" }], status: "published", sourceName: "OGRA", approvedBy: "Ayesha Khan", effectiveAt: "16 Jul 2026" },
    { id: "p-2", fields: [{ key: "fuelType", value: "High Speed Diesel" }, { key: "pricePerLiter", value: "278.90" }, { key: "notificationRef", value: "OGRA/PSO-2026-14" }, { key: "effectiveFrom", value: "16 Jul 2026" }], status: "published", sourceName: "OGRA", approvedBy: "Ayesha Khan", effectiveAt: "16 Jul 2026" },
  ],
  "prize-bonds": [
    { id: "pb-1", fields: [{ key: "denomination", value: "Rs. 750" }, { key: "drawNumber", value: "121" }, { key: "city", value: "Peshawar" }, { key: "drawDate", value: "16 Jul 2026" }], status: "published", sourceName: "National Savings", approvedBy: "Bilal Ahmed", effectiveAt: "16 Jul 2026" },
  ],
  cement: [
    { id: "cm-1", fields: [{ key: "brand", value: "Lucky Cement" }, { key: "city", value: "Lahore" }, { key: "pricePerBag", value: "1,570" }], status: "published", sourceName: "Lahore Dealer Network", approvedBy: "Ayesha Khan", effectiveAt: "Today, 11:20 AM" },
    { id: "cm-2", fields: [{ key: "brand", value: "DG Cement" }, { key: "city", value: "Karachi" }, { key: "pricePerBag", value: "1,545" }], status: "published", sourceName: "Karachi Dealer Network", approvedBy: "Bilal Ahmed", effectiveAt: "Today, 10:50 AM" },
  ],
  steel: [
    { id: "s-1", fields: [{ key: "grade", value: "Grade 60" }, { key: "city", value: "Karachi" }, { key: "pricePerMaund", value: "10,050" }, { key: "pricePerTon", value: "268,400" }], status: "published", sourceName: "Karachi Steel Melters Association", approvedBy: "Ayesha Khan", effectiveAt: "Today, 9:40 AM" },
  ],
};

// ---------------------------------------------------------------------
// Pending / flagged submissions awaiting review, per domain
// ---------------------------------------------------------------------
export const pendingSubmissions: Record<string, Submission[]> = {
  gold: [
    {
      id: "sub-g-1",
      fields: [{ key: "city", value: "Karachi" }, { key: "karat", value: "24K" }, { key: "ratePerTola", value: "289,900" }],
      sourceName: "Karachi Sarafa Association",
      submittedBy: "Bilal Ahmed",
      submittedAt: "2 minutes ago",
      status: "flagged_anomaly",
      deviationNote: "+4.5% vs last published value — exceeds 4% auto-review threshold",
    },
    {
      id: "sub-g-2",
      fields: [{ key: "city", value: "Quetta" }, { key: "karat", value: "22K" }, { key: "ratePerTola", value: "261,900" }],
      sourceName: "Quetta Sarafa Association",
      submittedBy: "Bilal Ahmed",
      submittedAt: "18 minutes ago",
      status: "pending",
    },
  ],
  currency: [
    {
      id: "sub-c-1",
      fields: [{ key: "currency", value: "GBP" }, { key: "rateType", value: "Open Market" }, { key: "buyRate", value: "355.10" }, { key: "sellRate", value: "356.90" }],
      sourceName: "Licensed Exchange Co. — Clifton Branch",
      submittedBy: "Hamza Tariq",
      submittedAt: "40 minutes ago",
      status: "pending",
    },
  ],
  petrol: [],
  "prize-bonds": [
    {
      id: "sub-pb-1",
      fields: [{ key: "denomination", value: "Rs. 40,000" }, { key: "drawNumber", value: "112" }, { key: "city", value: "Multan" }, { key: "drawDate", value: "1 Sep 2026" }],
      sourceName: "National Savings",
      submittedBy: "Ayesha Khan",
      submittedAt: "1 hour ago",
      status: "pending",
    },
  ],
  cement: [
    {
      id: "sub-cm-1",
      fields: [{ key: "brand", value: "Bestway" }, { key: "city", value: "Islamabad" }, { key: "pricePerBag", value: "1,610" }],
      sourceName: "Islamabad Dealer Network",
      submittedBy: "Hamza Tariq",
      submittedAt: "3 hours ago",
      status: "pending",
    },
  ],
  steel: [
    {
      id: "sub-s-1",
      fields: [{ key: "grade", value: "Grade 60" }, { key: "city", value: "Lahore" }, { key: "pricePerMaund", value: "9,780" }, { key: "pricePerTon", value: "261,100" }],
      sourceName: "Lahore Re-Rolling Mills Assoc.",
      submittedBy: "Bilal Ahmed",
      submittedAt: "5 hours ago",
      status: "pending",
    },
  ],
};

// ---------------------------------------------------------------------
// Data sources
// ---------------------------------------------------------------------
export const dataSources: DataSource[] = [
  { id: "src-1", name: "Karachi Sarafa Association", type: "association", reliabilityTier: 1, autoPublishAllowed: false, domains: ["gold"], contact: "gold-desk@karachisarafa.pk", lastFedAt: "4 minutes ago" },
  { id: "src-2", name: "Lahore Sarafa Association", type: "association", reliabilityTier: 1, autoPublishAllowed: false, domains: ["gold"], contact: "info@lahoresarafa.pk", lastFedAt: "6 minutes ago" },
  { id: "src-3", name: "State Bank of Pakistan", type: "official", reliabilityTier: 1, autoPublishAllowed: true, domains: ["currency"], contact: "forex-data@sbp.org.pk", lastFedAt: "12 minutes ago" },
  { id: "src-4", name: "OGRA", type: "official", reliabilityTier: 1, autoPublishAllowed: true, domains: ["petrol"], contact: "notifications@ogra.org.pk", lastFedAt: "2 days ago" },
  { id: "src-5", name: "National Savings", type: "official", reliabilityTier: 1, autoPublishAllowed: false, domains: ["prize-bonds"], contact: "draws@savings.gov.pk", lastFedAt: "16 hours ago" },
  { id: "src-6", name: "Licensed Exchange Co. — Clifton Branch", type: "exchange_api", reliabilityTier: 2, autoPublishAllowed: false, domains: ["currency"], contact: "ops@cliftonexchange.pk", lastFedAt: "40 minutes ago" },
  { id: "src-7", name: "Karachi Dealer Network", type: "dealer_network", reliabilityTier: 3, autoPublishAllowed: false, domains: ["cement", "steel"], contact: "n/a — manual field team", lastFedAt: "50 minutes ago" },
  { id: "src-8", name: "Karachi Steel Melters Association", type: "association", reliabilityTier: 2, autoPublishAllowed: false, domains: ["steel"], contact: "secretary@ksma.pk", lastFedAt: "3 hours ago" },
];

// ---------------------------------------------------------------------
// Audit log (global, filterable by domain/action/user)
// ---------------------------------------------------------------------
export const auditLog: AuditLogEntry[] = [
  { id: "a-1", entityTable: "gold_rates", action: "approve", domain: "gold", summary: "Lahore · 24K approved at Rs 285,600", performedBy: "Ayesha Khan", performedAt: "Today, 4:10 PM", newValue: "285,600" },
  { id: "a-2", entityTable: "gold_rate_submissions", action: "insert", domain: "gold", summary: "Karachi · 24K submitted at Rs 289,900", performedBy: "Bilal Ahmed", performedAt: "Today, 4:08 PM", newValue: "289,900" },
  { id: "a-3", entityTable: "currency_rates", action: "approve", domain: "currency", summary: "USD Interbank sell approved at 278.80", performedBy: "Ayesha Khan", performedAt: "Today, 2:30 PM", newValue: "278.80" },
  { id: "a-4", entityTable: "cement_rates", action: "reject", domain: "cement", summary: "Fauji Cement · Quetta rejected — source unverifiable", performedBy: "Ayesha Khan", performedAt: "Today, 1:05 PM", notes: "Dealer contact could not confirm figure by phone." },
  { id: "a-5", entityTable: "fuel_prices", action: "approve", domain: "petrol", summary: "Petrol price approved at Rs 272.50/L (OGRA notification)", performedBy: "System (auto-publish)", performedAt: "16 Jul 2026, 12:01 AM", newValue: "272.50" },
  { id: "a-6", entityTable: "steel_rates", action: "correct", domain: "steel", summary: "Karachi · Grade 60 corrected: 267,900 → 268,400", performedBy: "Bilal Ahmed", performedAt: "Today, 9:40 AM", oldValue: "267,900", newValue: "268,400", notes: "Original entry had a transposed digit." },
  { id: "a-7", entityTable: "prize_bond_draws", action: "insert", domain: "prize-bonds", summary: "Rs. 40,000 draw #112 (Multan, 1 Sep 2026) submitted", performedBy: "Ayesha Khan", performedAt: "Today, 3:12 PM" },
  { id: "a-8", entityTable: "users", action: "update", domain: "system", summary: "Role changed for Hamza Tariq: Analyst → Editor", performedBy: "Ayesha Khan", performedAt: "Yesterday, 5:45 PM" },
];

// ---------------------------------------------------------------------
// Users & roles
// ---------------------------------------------------------------------
export const adminUsers: AdminUser[] = [
  { id: "u-1", name: "Ayesha Khan", email: "ayesha.khan@pkrates.pk", role: "reviewer", domains: ["gold", "currency"], isActive: true, lastActive: "Just now" },
  { id: "u-2", name: "Bilal Ahmed", email: "bilal.ahmed@pkrates.pk", role: "editor", domains: ["gold", "steel", "cement"], isActive: true, lastActive: "12 minutes ago" },
  { id: "u-3", name: "Hamza Tariq", email: "hamza.tariq@pkrates.pk", role: "editor", domains: ["currency", "cement"], isActive: true, lastActive: "40 minutes ago" },
  { id: "u-4", name: "Sara Malik", email: "sara.malik@pkrates.pk", role: "admin", domains: ["gold", "currency", "petrol", "prize-bonds", "cement", "steel"], isActive: true, lastActive: "1 hour ago" },
  { id: "u-5", name: "Usman Raza", email: "usman.raza@pkrates.pk", role: "analyst", domains: [], isActive: true, lastActive: "Yesterday" },
  { id: "u-6", name: "Fatima Sheikh", email: "fatima.sheikh@pkrates.pk", role: "super_admin", domains: ["gold", "currency", "petrol", "prize-bonds", "cement", "steel"], isActive: true, lastActive: "3 days ago" },
];

export const rolePermissions: Record<string, string[]> = {
  super_admin: ["Full platform access", "User & role management", "Billing / infra config", "All data domains", "Approve/reject", "Source management"],
  admin: ["All data domains", "Approve/reject", "Source management", "Cannot manage billing/infra"],
  reviewer: ["Approve/reject within assigned domains", "View audit logs for assigned domains", "Cannot self-approve own submissions"],
  editor: ["Submit new rate entries within assigned domains", "Cannot publish directly"],
  analyst: ["Read-only analytics dashboards", "Historical data export", "No write access"],
};

// ---------------------------------------------------------------------
// Dashboard summary stats
// ---------------------------------------------------------------------
export const dashboardStats = {
  totalPending: Object.values(pendingSubmissions).flat().length,
  flagged: Object.values(pendingSubmissions).flat().filter((s) => s.status === "flagged_anomaly").length,
  publishedToday: 14,
  staleDomains: [{ domain: "Prize Bonds", hoursStale: 16 }],
  avgApprovalMinutes: 22,
};
