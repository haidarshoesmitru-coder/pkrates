import { AdminTopbar } from "@/components/admin/admin-topbar";
import { RateDomainAdmin } from "@/components/admin/rate-domain-admin";
import { PrizeBondWinnersAdmin } from "@/components/admin/prize-bond-winners-admin";
import { getPublishedRecords, getPendingSubmissions, getDomainHistory, getSystemAdminUser, getPrizeBondDrawOptions, getPendingWinnerSubmissions } from "@/lib/data/admin";
import { getActiveSources } from "@/lib/data/reference";

export default async function PrizeBondsAdminPage() {
  const domain = "prize-bonds";

  try {
    const [published, pending, history, sources, systemAdmin, drawOptions, pendingWinners] = await Promise.all([
      getPublishedRecords(domain),
      getPendingSubmissions(domain),
      getDomainHistory(domain),
      getActiveSources(),
      getSystemAdminUser(),
      getPrizeBondDrawOptions(),
      getPendingWinnerSubmissions(),
    ]);
    const prizeBondSources = sources.filter((s) => s.domains.includes("prize_bonds")).map((s) => ({ id: s.id, name: s.name }));

    return (
      <>
        <AdminTopbar title="Prize Bond Management" description="Draw calendar and draw results." />
        <RateDomainAdmin
          domain={domain}
          published={published}
          pending={pending}
          sources={prizeBondSources}
          history={history}
          currentUserName={systemAdmin.full_name}
        />
        <PrizeBondWinnersAdmin draws={drawOptions} pendingWinners={pendingWinners} sources={prizeBondSources} />
      </>
    );
  } catch (err) {
    console.error("[prize-bonds admin page error]", err);
    return (
      <>
        <AdminTopbar title="Prize Bond Management" description="Draw calendar and draw results." />
        <RateDomainAdmin domain={domain} published={[]} pending={[]} sources={[]} history={[]} currentUserName="Admin" loadError />
      </>
    );
  }
}
