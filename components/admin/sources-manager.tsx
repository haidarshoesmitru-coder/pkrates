"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Star, Building2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toggleSourceAutoPublishAction } from "@/lib/data/admin-actions";

export interface SourceRow {
  id: string;
  name: string;
  type: "official" | "association" | "exchange_api" | "dealer_network" | "manual_field_team";
  domains: string[];
  reliability_tier: number;
  ingestion_mode: string;
  contact_info: string | null;
  onboarded_at: string;
}

const typeLabel: Record<SourceRow["type"], string> = {
  official: "Official / Government",
  association: "Industry Association",
  exchange_api: "Exchange / API",
  dealer_network: "Dealer Network",
  manual_field_team: "Manual Field Team",
};

function ReliabilityStars({ tier }: { tier: number }) {
  return (
    <div className="flex items-center gap-0.5" title={`Reliability tier ${tier} of 5 (1 = highest trust)`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn("h-3 w-3", i <= 6 - tier ? "fill-gold-500 text-gold-500" : "text-ink-200 dark:text-ink-700")}
        />
      ))}
    </div>
  );
}

export function SourcesManager({ sources, loadError }: { sources: SourceRow[]; loadError?: boolean }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function toggleAutoPublish(id: string, current: boolean) {
    setPendingId(id);
    try {
      await toggleSourceAutoPublishAction(id, !current);
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  if (loadError) {
    return (
      <div className="p-5 sm:p-8">
        <Card className="p-10 text-center border-fall-500/40">
          <p className="text-sm text-ink-500 dark:text-ink-400">Couldn&rsquo;t load sources. Please refresh the page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500 dark:text-ink-400">
          {sources.length} registered sources across all domains
        </p>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Register New Source
        </Button>
      </div>

      {sources.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-ink-400">No sources registered yet.</p>
        </Card>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((source) => {
          const autoPublishAllowed = source.ingestion_mode === "api_auto";
          const isBusy = pendingId === source.id;
          return (
            <Card key={source.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400 shrink-0">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink-900 dark:text-ink-100 leading-tight">{source.name}</p>
                    <p className="text-xs text-ink-400">{typeLabel[source.type]}</p>
                  </div>
                </div>
                <ReliabilityStars tier={source.reliability_tier} />
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {source.domains.map((d) => (
                  <Badge key={d} variant="outline" className="capitalize">{d.replace("_", " ")}</Badge>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-ink-400">Contact</p>
                  <p className="mt-0.5 text-ink-700 dark:text-ink-300 truncate">{source.contact_info ?? "—"}</p>
                </div>
                <div>
                  <p className="text-ink-400">Onboarded</p>
                  <p className="mt-0.5 text-ink-700 dark:text-ink-300">{new Date(source.onboarded_at).toLocaleDateString("en-GB")}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-ink-200 dark:border-ink-800 pt-3.5">
                <div>
                  <p className="text-xs font-medium text-ink-700 dark:text-ink-300">Auto-publish</p>
                  <p className="text-[11px] text-ink-400">Skip human review when within threshold</p>
                </div>
                <button
                  role="switch"
                  aria-checked={autoPublishAllowed}
                  disabled={isBusy}
                  onClick={() => toggleAutoPublish(source.id, autoPublishAllowed)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors shrink-0",
                    autoPublishAllowed ? "bg-pulse-600" : "bg-ink-200 dark:bg-ink-700"
                  )}
                >
                  {isBusy ? (
                    <Loader2 className="absolute top-1 left-1 h-4 w-4 animate-spin text-white" />
                  ) : (
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                        autoPublishAllowed ? "translate-x-[22px]" : "translate-x-0.5"
                      )}
                    />
                  )}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
      )}
    </div>
  );
}
