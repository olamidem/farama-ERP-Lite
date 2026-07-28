import { USER_STATUS } from "../../auth/types/enums";
import type { Employee } from "../types/staff";
import type { EmployeeQueryResult } from "../types/staff-query.types";

export const mapEmployee = (employee: EmployeeQueryResult): Employee => {
  const roleData = Array.isArray(employee.role)
    ? employee.role[0]
    : employee.role;

  return {
    id: employee.id,
    employee_number: employee.employee_number ?? "",
    full_name: employee.full_name ?? "",
    email: employee.email ?? "",
    phone: employee.phone ?? "",
    role: roleData ? roleData.name : "Unassigned",
    status: (employee.status as Employee["status"]) ?? USER_STATUS.ACTIVE,
    avatar_color: employee.avatar_color ?? "#3b82f6",
    avatar_url: employee.avatar_url ?? "",
    last_login: employee.last_login ?? "",
    created_at: employee.created_at ?? "",
    updated_at: employee.updated_at ?? "",
    joined_at: employee.created_at ? employee.created_at.substring(0, 10) : "",
    pin_hash: employee.pin_hash ?? "",
    password_set: Boolean((employee as unknown as Record<string, unknown>).password_set ?? true),
  };
};
