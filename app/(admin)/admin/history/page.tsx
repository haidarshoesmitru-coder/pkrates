import { AdminTopbar } from "@/components/admin/admin-topbar";
import { UpdateHistoryTimeline } from "@/components/admin/update-history-timeline";

export default function HistoryPage() {
  return (
    <>
      <AdminTopbar
        title="Update History"
        description="A chronological timeline of what actually changed and went live — for a quick 'what happened today' view."
      />
      <UpdateHistoryTimeline />
    </>
  );
}
