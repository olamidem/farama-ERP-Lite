import type { RoleQueryResult } from "../types/staff-query.types";
import type { RoleData } from "../types/staff";

export const mapRole = (role: RoleQueryResult): RoleData => ({
  id: role.id,
  name: role.name,
  description: role.description,
  member_count: 0,
  memberCount: 0,
  permissions: role.role_permissions
    ?.map((rp) => rp.permission?.code)
    .filter(Boolean) as string[],
});
