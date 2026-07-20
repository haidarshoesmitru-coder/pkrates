import { AdminTopbar } from "@/components/admin/admin-topbar";
import { SourcesManager } from "@/components/admin/sources-manager";

export default function SourcesAdminPage() {
  return (
    <>
      <AdminTopbar
        title="Data Source Tracking"
        description="Every rate is traceable to a named source — manage trust tiers and auto-publish rules here."
      />
      <SourcesManager />
    </>
  );
}
