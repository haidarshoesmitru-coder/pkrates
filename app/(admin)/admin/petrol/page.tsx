import { AdminTopbar } from "@/components/admin/admin-topbar";
import { RateDomainAdmin } from "@/components/admin/rate-domain-admin";

export default function PetrolAdminPage() {
  return (
    <>
      <AdminTopbar title="Petrol Price Management" description="Official, OGRA-notified fuel prices." />
      <RateDomainAdmin domain="petrol" />
    </>
  );
}
