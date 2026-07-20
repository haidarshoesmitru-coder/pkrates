import { AdminTopbar } from "@/components/admin/admin-topbar";
import { RateDomainAdmin } from "@/components/admin/rate-domain-admin";

export default function GoldAdminPage() {
  return (
    <>
      <AdminTopbar title="Gold Rate Management" description="City-wise, karat-wise — submit, review and publish." />
      <RateDomainAdmin domain="gold" />
    </>
  );
}
