import { AdminTopbar } from "@/components/admin/admin-topbar";
import { RateDomainAdmin } from "@/components/admin/rate-domain-admin";
import { getPublishedRecords, getPendingSubmissions, getDomainHistory, getSystemAdminUser } from "@/lib/data/admin";
import { getActiveSources } from "@/lib/data/reference";

export default async function PrizeBondsAdminPage() {
  const domain = "prize-bonds";

  try {
    const [published, pending, history, sources, systemAdmin] = await Promise.all([
      getPublishedRecords(domain),
      getPendingSubmissions(domain),
      getDomainHistory(domain),
      getActiveSources(),
      getSystemAdminUser(),
    ]);

    return (
      <>
        <AdminTopbar title="Prize Bond Management" description="Draw calendar and draw results." />
        <RateDomainAdmin
          domain={domain}
          published={published}
          pending={pending}
          sources={sources.filter((s) => s.domains.includes("prize_bonds")).map((s) => ({ id: s.id, name: s.name }))}
          history={history}
          currentUserName={systemAdmin.full_name}
        />
      </>
    );
  } catch {
    return (
      <>
        <AdminTopbar title="Prize Bond Management" description="Draw calendar and draw results." />
        <RateDomainAdmin domain={domain} published={[]} pending={[]} sources={[]} history={[]} currentUserName="Admin" loadError />
      </>
    );
  }
}
