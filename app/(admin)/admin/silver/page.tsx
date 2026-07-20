import { AdminTopbar } from "@/components/admin/admin-topbar";
import { RateDomainAdmin } from "@/components/admin/rate-domain-admin";

export default function SilverAdminPage() {
  return (
    <>
      <AdminTopbar title="Silver Rate Management" description="City-wise, purity-wise — submit, review and publish." />
      <RateDomainAdmin domain="silver" />
    </>
  );
}
