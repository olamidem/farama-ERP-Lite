import type { User } from "@supabase/supabase-js";
import type { Role, Permission } from "./permission";
import type { UserStatus } from "./enums";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  avatar_color: string | null;
  status: UserStatus;
  role_id: string | null;
  pin_hash?: string | null;
  password_set?: boolean | null;
  invited_at?: string | null;
  activated_at?: string | null;
  created_at: string;
  updated_at: string;
  role: Role | null;
}

export interface CurrentUser {
  user: User;
  profile: Profile;
  permissions: Permission[];
}

export interface UnlockRequest {
  pin: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}