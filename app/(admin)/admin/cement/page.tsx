import { AdminTopbar } from "@/components/admin/admin-topbar";
import { RateDomainAdmin } from "@/components/admin/rate-domain-admin";

export default function CementAdminPage() {
  return (
    <>
      <AdminTopbar title="Cement Rate Management" description="Per-bag pricing by brand and city." />
      <RateDomainAdmin domain="cement" />
    </>
  );
}
