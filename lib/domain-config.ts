import type { DomainConfig } from "@/types/admin";

/**
 * Field/label/type definitions driving the admin submit form and
 * published-rates table columns for every domain. This is
 * application configuration — it describes the *shape* of a gold
 * or silver rate, not any actual rate value — so unlike
 * lib/mock-data.ts and lib/admin-mock-data.ts, it correctly stays
 * as a static TypeScript module rather than a Supabase query.
 */
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
  silver: {
    slug: "silver",
    title: "Silver Rate Management",
    description: "City-wise silver (chandi) rates — verified against Sarafa Association boards.",
    icon: "gem",
    primaryFieldKey: "ratePerTola",
    fields: [
      { key: "city", label: "City", type: "select", options: ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta"] },
      { key: "purity", label: "Purity", type: "select", options: ["999 Fine", "925 Sterling"] },
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

/** Static role-capability descriptions for the Permission Matrix —
 * documentation of what each role CAN do, not data about any
 * particular user, so it has no Supabase dependency either. */
export const rolePermissions: Record<string, string[]> = {
  super_admin: ["Full platform access", "User & role management", "Billing / infra config", "All data domains", "Approve/reject", "Source management"],
  admin: ["All data domains", "Approve/reject", "Source management", "Cannot manage billing/infra"],
  reviewer: ["Approve/reject within assigned domains", "View audit logs for assigned domains", "Cannot self-approve own submissions"],
  editor: ["Submit new rate entries within assigned domains", "Cannot publish directly"],
  analyst: ["Read-only analytics dashboards", "Historical data export", "No write access"],
};
