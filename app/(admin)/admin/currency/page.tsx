import { AdminTopbar } from "@/components/admin/admin-topbar";
import { RateDomainAdmin } from "@/components/admin/rate-domain-admin";

export default function CurrencyAdminPage() {
  return (
    <>
      <AdminTopbar title="Currency Rate Management" description="Interbank and open market — buy/sell rates." />
      <RateDomainAdmin domain="currency" />
    </>
  );
}
