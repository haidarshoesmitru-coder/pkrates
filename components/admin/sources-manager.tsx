"use client";

import * as React from "react";
import { Plus, Star, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { dataSources as initialSources } from "@/lib/admin-mock-data";
import type { DataSource } from "@/types/admin";

const typeLabel: Record<DataSource["type"], string> = {
  official: "Official / Government",
  association: "Industry Association",
  exchange_api: "Exchange / API",
  manual: "Manual Field Team",
  dealer_network: "Dealer Network",
};

function ReliabilityStars({ tier }: { tier: number }) {
  return (
    <div className="flex items-center gap-0.5" title={`Reliability tier ${tier} of 5 (1 = highest trust)`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i <= 6 - tier ? "fill-gold-500 text-gold-500" : "text-ink-200 dark:text-ink-700"
          )}
        />
      ))}
    </div>
  );
}

export function SourcesManager() {
  const [sources, setSources] = React.useState<DataSource[]>(initialSources);

  function toggleAutoPublish(id: string) {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, autoPublishAllowed: !s.autoPublishAllowed } : s))
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((source) => (
          <Card key={source.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400 shrink-0">
                  <Building2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink-900 dark:text-ink-100 leading-tight">
                    {source.name}
                  </p>
                  <p className="text-xs text-ink-400">{typeLabel[source.type]}</p>
                </div>
              </div>
              <ReliabilityStars tier={source.reliabilityTier} />
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {source.domains.map((d) => (
                <Badge key={d} variant="outline" className="capitalize">{d.replace("-", " ")}</Badge>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-ink-400">Contact</p>
                <p className="mt-0.5 text-ink-700 dark:text-ink-300 truncate">{source.contact}</p>
              </div>
              <div>
                <p className="text-ink-400">Last fed data</p>
                <p className="mt-0.5 text-ink-700 dark:text-ink-300">{source.lastFedAt}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-ink-200 dark:border-ink-800 pt-3.5">
              <div>
                <p className="text-xs font-medium text-ink-700 dark:text-ink-300">Auto-publish</p>
                <p className="text-[11px] text-ink-400">Skip human review when within threshold</p>
              </div>
              <button
                role="switch"
                aria-checked={source.autoPublishAllowed}
                onClick={() => toggleAutoPublish(source.id)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors shrink-0",
                  source.autoPublishAllowed ? "bg-pulse-600" : "bg-ink-200 dark:bg-ink-700"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                    source.autoPublishAllowed ? "translate-x-[22px]" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
