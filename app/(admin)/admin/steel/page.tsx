import { AdminTopbar } from "@/components/admin/admin-topbar";
import { RateDomainAdmin } from "@/components/admin/rate-domain-admin";

export default function SteelAdminPage() {
  return (
    <>
      <AdminTopbar title="Steel / Saria Rate Management" description="Grade-wise pricing per maund and per ton." />
      <RateDomainAdmin domain="steel" />
    </>
  );
}
