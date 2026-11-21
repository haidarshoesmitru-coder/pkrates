import { AdminTopbar } from "@/components/admin/admin-topbar";
import { RateDomainAdmin } from "@/components/admin/rate-domain-admin";
import { getPublishedRecords, getPendingSubmissions, getDomainHistory, getSystemAdminUser } from "@/lib/data/admin";
import { getActiveSources } from "@/lib/data/reference";

export default async function GoldAdminPage() {
  const domain = "gold";

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
        <AdminTopbar title="Gold Rate Management" description="City-wise, karat-wise — submit, review and publish." />
        <RateDomainAdmin
          domain={domain}
          published={published}
          pending={pending}
          sources={sources.filter((s) => s.domains.includes(domain)).map((s) => ({ id: s.id, name: s.name }))}
          history={history}
          currentUserName={systemAdmin.full_name}
        />
      </>
    );
  } catch (err) {
    console.error("[gold admin page error]", err);
    return (
      <>
        <AdminTopbar title="Gold Rate Management" description="City-wise, karat-wise — submit, review and publish." />
        <RateDomainAdmin
          domain={domain}
          published={[]}
          pending={[]}
          sources={[]}
          history={[]}
          currentUserName="Admin"
          loadError
        />
      </>
    );
  }
}
