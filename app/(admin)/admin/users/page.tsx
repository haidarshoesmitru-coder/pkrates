import { AdminTopbar } from "@/components/admin/admin-topbar";
import { UsersRolesManager } from "@/components/admin/users-roles-manager";

export default function UsersAdminPage() {
  return (
    <>
      <AdminTopbar
        title="Users & Roles"
        description="Manage who can submit, review and approve rates — and in which domains."
      />
      <UsersRolesManager />
    </>
  );
}
