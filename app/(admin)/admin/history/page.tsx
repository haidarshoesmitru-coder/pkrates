import { AdminTopbar } from "@/components/admin/admin-topbar";
import { UpdateHistoryTimeline, type TimelineEntry } from "@/components/admin/update-history-timeline";
import { getUpdateHistory } from "@/lib/data/admin";

export default async function HistoryPage() {
  let entries: TimelineEntry[] = [];
  let loadError = false;
  try {
    const raw = await getUpdateHistory();
    const todayStr = new Date().toDateString();
    entries = raw.map((entry) => {
      const newVal = entry.new_value as Record<string, unknown> | null;
      const summary = newVal
        ? Object.entries(newVal)
            .filter(([k]) => !["__table__", "published_id"].includes(k))
            .map(([, v]) => String(v))
            .slice(0, 4)
            .join(" · ")
        : entry.entity_table;
      return {
        id: String(entry.id),
        domain: entry.domain === "prize_bonds" ? "prize-bonds" : (entry.domain ?? "gold"),
        summary,
        performedBy: entry.performedByName,
        performedAt: new Date(entry.performed_at).toLocaleString("en-GB"),
        isToday: new Date(entry.performed_at).toDateString() === todayStr,
      };
    });
  } catch {
    loadError = true;
  }

  return (
    <>
      <AdminTopbar
        title="Update History"
        description="A chronological timeline of what actually changed and went live — for a quick 'what happened today' view."
      />
      <UpdateHistoryTimeline entries={entries} loadError={loadError} />
    </>
  );
}
