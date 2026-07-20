import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AuditLogTable } from "@/components/admin/audit-log-table";

export default function AuditLogPage() {
  return (
    <>
      <AdminTopbar
        title="Audit Log"
        description="Immutable record of every change — who, what, when, and why. Nothing here can be edited or deleted."
      />
      <AuditLogTable />
    </>
  );
}
