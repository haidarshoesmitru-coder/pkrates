import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AuditLogTable } from "@/components/admin/audit-log-table";
import { getAuditLog } from "@/lib/data/admin";

export default async function AuditLogPage() {
  let entries: Awaited<ReturnType<typeof getAuditLog>> = [];
  let loadError = false;
  try {
    entries = await getAuditLog();
  } catch {
    loadError = true;
  }

  return (
    <>
      <AdminTopbar
        title="Audit Log"
        description="Immutable record of every change — who, what, when, and why. Nothing here can be edited or deleted."
      />
      <AuditLogTable entries={entries} loadError={loadError} />
    </>
  );
}
