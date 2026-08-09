import { AdminTopbar } from "@/components/admin/admin-topbar";
import { UsersRolesManager, type UserRow } from "@/components/admin/users-roles-manager";
import { getAllUsers } from "@/lib/data/admin";

export default async function UsersAdminPage() {
  let users: UserRow[] = [];
  let loadError = false;
  try {
    const raw = await getAllUsers();
    users = raw.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as UserRow["role"],
      domains: u.domains as string[],
      isActive: u.isActive,
      lastActive: u.lastActive,
    }));
  } catch {
    loadError = true;
  }

  return (
    <>
      <AdminTopbar
        title="Users & Roles"
        description="Manage who can submit, review and approve rates — and in which domains."
      />
      <UsersRolesManager users={users} loadError={loadError} />
    </>
  );
}
