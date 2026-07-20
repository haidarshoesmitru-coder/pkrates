import { AdminTopbar } from "@/components/admin/admin-topbar";
import { RateDomainAdmin } from "@/components/admin/rate-domain-admin";

export default function PrizeBondsAdminPage() {
  return (
    <>
      <AdminTopbar title="Prize Bond Management" description="Draw calendar and draw results." />
      <RateDomainAdmin domain="prize-bonds" />
    </>
  );
}
