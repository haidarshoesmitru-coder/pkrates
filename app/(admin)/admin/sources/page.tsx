import { AdminTopbar } from "@/components/admin/admin-topbar";
import { SourcesManager } from "@/components/admin/sources-manager";
import { getAllSources } from "@/lib/data/admin";

export default async function SourcesAdminPage() {
  let sources: Awaited<ReturnType<typeof getAllSources>> = [];
  let loadError = false;
  try {
    sources = await getAllSources();
  } catch (err) {
    console.error("[sources admin page error]", err);
    loadError = true;
  }

  return (
    <>
      <AdminTopbar
        title="Data Source Tracking"
        description="Every rate is traceable to a named source — manage trust tiers and auto-publish rules here."
      />
      <SourcesManager sources={sources} loadError={loadError} />
    </>
  );
}
