import type { UserStatus } from "../../auth/types/enums";

export interface Employee {
  id: string;
  employee_number: string | null;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  status: UserStatus;
  avatar_color: string | null;
  avatar_url: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  joined_at: string;
  pin_hash: string | null;
}

export interface ActivityLog {
  id: string;
  operator_id: string;
  operator_name: string;
  operator: string;
  role: string;
  action: string;
  details: string;
  ip_address: string | null;
  ipAddress: string;
  created_at: string;
  timestamp: string;
}

export interface RoleData {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  memberCount: number;
  permissions: string[];
}
