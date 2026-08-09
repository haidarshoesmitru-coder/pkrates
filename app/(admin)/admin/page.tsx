import Link from "next/link";
import { ClipboardList, AlertTriangle, CheckCircle2, Timer, ArrowRight } from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminStatCard } from "@/components/admin/stat-card";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { Card } from "@/components/ui/card";
import { domainConfigs } from "@/lib/domain-config";
import { getDashboardStats, getRecentActivity, getSystemAdminUser } from "@/lib/data/admin";

export default async function AdminDashboardPage() {
  const domains = Object.values(domainConfigs);

  let stats;
  let activity: Awaited<ReturnType<typeof getRecentActivity>> = [];
  let firstName = "Admin";
  let loadError = false;

  try {
    const [statsRes, activityRes, systemAdmin] = await Promise.all([
      getDashboardStats(), getRecentActivity(), getSystemAdminUser(),
    ]);
    stats = statsRes;
    activity = activityRes;
    firstName = systemAdmin.full_name.split(" ")[0];
  } catch {
    loadError = true;
    stats = { totalPending: 0, flagged: 0, publishedToday: 0, staleDomains: [] as { domain: string; hoursStale: number }[], avgApprovalMinutes: null as number | null, pendingByDomain: {} as Record<string, number> };
  }

  return (
    <>
      <AdminTopbar
        title={`Welcome back, ${firstName}`}
        description="Here's what needs attention across all eight data domains."
      />
      <div className="p-5 sm:p-8 space-y-8">
        {loadError && (
          <Card className="p-4 border-fall-500/40 bg-red-50 dark:bg-red-950/30">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-fall-500 shrink-0 mt-0.5" />
              <p className="text-sm text-fall-700 dark:text-red-300">
                Couldn&rsquo;t load live dashboard data. Showing zeros until the connection recovers.
              </p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard icon={ClipboardList} label="Pending submissions" value={stats.totalPending} tone="warning" hint="Across all domains" />
          <AdminStatCard icon={AlertTriangle} label="Flagged — anomaly review" value={stats.flagged} tone="danger" hint="Exceeds deviation threshold" />
          <AdminStatCard icon={CheckCircle2} label="Published today" value={stats.publishedToday} tone="success" />
          <AdminStatCard icon={Timer} label="Avg. approval time" value={stats.avgApprovalMinutes !== null ? `${stats.avgApprovalMinutes}m` : "—"} hint="Submission → published" />
        </div>

        {stats.staleDomains.length > 0 && (
          <Card className="p-4 sm:p-5 border-gold-300 dark:border-gold-800 bg-gold-50/60 dark:bg-gold-900/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-gold-600 dark:text-gold-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gold-800 dark:text-gold-200">Freshness SLA warning</p>
                {stats.staleDomains.map((d) => (
                  <p key={d.domain} className="mt-0.5 text-xs text-gold-700 dark:text-gold-300">
                    {d.domain} hasn&rsquo;t been updated in {d.hoursStale} hours — check for a missed source feed.
                  </p>
                ))}
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-ink-200 dark:border-ink-800">
              <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-ink-100">
                Domains awaiting review
              </h3>
            </div>
            <div className="divide-y divide-ink-200 dark:divide-ink-800">
              {domains.map((domain) => {
                const count = stats.pendingByDomain[domain.slug] ?? 0;
                return (
                  <Link
                    key={domain.slug}
                    href={`/admin/${domain.slug}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-ink-50 dark:hover:bg-ink-900/60 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink-900 dark:text-ink-100">{domain.title}</p>
                      <p className="text-xs text-ink-400">
                        {count === 0 ? "All caught up" : `${count} submission${count > 1 ? "s" : ""} pending`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {count > 0 && (
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gold-500 px-1.5 text-xs font-semibold text-ink-950">
                          {count}
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4 text-ink-300" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          <ActivityFeed entries={activity} />
        </div>
      </div>
    </>
  );
}
