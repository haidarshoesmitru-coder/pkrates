export type SubmissionStatus = "pending" | "approved" | "rejected" | "flagged_anomaly";
export type RecordStatus = "published" | "corrected" | "void";
export type UserRole = "super_admin" | "admin" | "reviewer" | "editor" | "analyst";
export type SourceType = "official" | "association" | "exchange_api" | "manual" | "dealer_network";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  domains: string[];
  isActive: boolean;
  lastActive: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: SourceType;
  reliabilityTier: 1 | 2 | 3 | 4 | 5;
  autoPublishAllowed: boolean;
  domains: string[];
  contact: string;
  lastFedAt: string;
}

export interface AuditLogEntry {
  id: string;
  entityTable: string;
  action: "insert" | "update" | "approve" | "reject" | "correct";
  domain: string;
  summary: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedAt: string;
  notes?: string;
}

/** A field-value pair used generically to render domain-agnostic tables and forms. */
export interface FieldValue {
  key: string;
  value: string;
}

export interface PublishedRecord {
  id: string;
  fields: FieldValue[];
  status: RecordStatus;
  sourceName: string;
  approvedBy: string;
  effectiveAt: string;
}

export interface Submission {
  id: string;
  fields: FieldValue[];
  sourceName: string;
  submittedBy: string;
  submittedAt: string;
  status: SubmissionStatus;
  reviewerNotes?: string;
  deviationNote?: string;
}

export interface DomainField {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "date";
  options?: string[];
  suffix?: string;
}

export interface DomainConfig {
  slug: string;
  title: string;
  description: string;
  icon: string;
  fields: DomainField[];
  primaryFieldKey: string;
}
