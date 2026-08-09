import { AdminTopbar } from "@/components/admin/admin-topbar";
import { RateDomainAdmin } from "@/components/admin/rate-domain-admin";
import { getPublishedRecords, getPendingSubmissions, getDomainHistory, getSystemAdminUser } from "@/lib/data/admin";
import { getActiveSources } from "@/lib/data/reference";

export default async function SteelAdminPage() {
  const domain = "steel";

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
        <AdminTopbar title="Steel / Saria Rate Management" description="Grade-wise pricing per maund and per ton." />
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
  } catch {
    return (
      <>
        <AdminTopbar title="Steel / Saria Rate Management" description="Grade-wise pricing per maund and per ton." />
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
