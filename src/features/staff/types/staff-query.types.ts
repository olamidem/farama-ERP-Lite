import type { RoleName } from "../../auth/types/enums";
import type { Employee } from "./staff";

export interface PermissionQuery {
  code: string;
}

export interface RolePermissionQuery {
  permission: PermissionQuery | null;
}

export interface RoleQueryResult {
  id: string;
  name: string;
  description: string | null;
  role_permissions: RolePermissionQuery[] | null;
}

export interface EmployeeRole {
  id: string;
  name: RoleName;
  description: string | null;
}

export interface EmployeeQueryResult {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  avatar_color: string | null;
  pin_hash: string | null;
  status: string | null;
  last_login: string | null;
  created_at: string | null;
  updated_at: string | null;
  role: EmployeeRole | null;
}

export interface AuditLogQueryResult {
  id: string;
  operator_id: string | null;
  operator_name: string | null;
  role: string | null;
  action: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: string | null;
}

export interface CreateActivityLogDto {
  operator_id: string;
  operator_name: string;
  role: string;
  action: string;
  details: string;
  ip_address: string;
}

export interface UpdateEmployeeDto {
  full_name?: string;
  email?: string;
  phone?: string;
  role_id?: string;
  status?: Employee["status"];
  avatar_color?: string | null;
  avatar_url?: string | null;
  pin_hash?: string | null;
}

export interface CreateEmployeeDto {
  full_name: string;
  email: string;
  phone: string;
  role_id: string;
  status?: Employee["status"];
  avatar_color?: string | null;
  avatar_url?: string | null;
  pin_hash: string;
}