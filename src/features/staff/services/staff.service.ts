import { supabase } from "../../../api/supabase";
import type { Employee, ActivityLog, RoleData, UserSession, UserPreferences } from "../types/staff";
import {
  ROLE_SELECT,
  EMPLOYEE_SELECT,
  AUDIT_LOG_SELECT,
} from "../constants/staffQueries";
import type {
  EmployeeQueryResult,
  RoleQueryResult,
  AuditLogQueryResult,
  CreateActivityLogDto,
  UpdateEmployeeDto,
  CreateEmployeeDto,
} from "../types/staff-query.types";
import { mapEmployee } from "../utils/mapEmployee";
import { mapAuditLog } from "../utils/mapAuditLog";
import { mapRole } from "../utils/mapRole";

const getRoles = async (): Promise<RoleData[]> => {
  const { data, error } = await supabase.from("roles").select(ROLE_SELECT)

  if (error) {
    throw new Error(error.message);
  }
  const roles = (data ?? []) as unknown as RoleQueryResult[];
  return roles.map(mapRole);
};

const getEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select(EMPLOYEE_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const employees = (data ?? []) as unknown as EmployeeQueryResult[];
  return employees.map(mapEmployee);
};


const createEmployee = async (
  payload: CreateEmployeeDto,
): Promise<Employee> => {
  const { data, error } = await supabase
    .from("profiles")
    .insert(payload)
    .select(EMPLOYEE_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const employee = data as unknown as EmployeeQueryResult;
  
return mapEmployee(employee);
};

const updateEmployee = async (
  id: string,
  updates: UpdateEmployeeDto,
): Promise<Employee> => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select(EMPLOYEE_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

 const employee = data as unknown as EmployeeQueryResult;
return mapEmployee(employee);
};

const deleteEmployee = async (id: string): Promise<void> => {
  const { error } = await supabase.from("profiles").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

const getLogs = async (): Promise<ActivityLog[]> => {
  const { data, error } = await supabase
    .from("audit_logs")
    .select(AUDIT_LOG_SELECT)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }
  const logs = (data ?? []) as unknown as AuditLogQueryResult[];
 return logs.map(mapAuditLog);
};

const logActivity = async (payload: CreateActivityLogDto): Promise<void> => {
  const { error } = await supabase.from("audit_logs").insert({
    operator_id: payload.operator_id,
    operator_name: payload.operator_name,
    role: payload.role,
    action: payload.action,
    details: payload.details,
    ip_address: payload.ip_address,
  });

  if (error) {
    throw new Error(error.message);
  }
};

const resetPin = async (
  id: string,
  pin_hash: string,
): Promise<void> => {
  const { error } = await supabase
    .from("profiles")
    .update({
      pin_hash,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

const getSessions = async (profileId: string): Promise<UserSession[]> => {
  const { data, error } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("profile_id", profileId)
    .order("last_active", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as unknown as UserSession[];
};

const terminateSession = async (sessionId: string): Promise<void> => {
  const { error } = await supabase
    .from("user_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) {
    throw new Error(error.message);
  }
};

const terminateAllOtherSessions = async (profileId: string): Promise<void> => {
  const { error } = await supabase
    .from("user_sessions")
    .delete()
    .eq("profile_id", profileId)
    .eq("is_current", false);

  if (error) {
    throw new Error(error.message);
  }
};

const LOCAL_PREFS_KEY = (profileId: string) => `farama_user_prefs_${profileId}`;

const getPreferences = async (profileId: string): Promise<UserPreferences | null> => {
  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle();

    if (!error && data) {
      return data as unknown as UserPreferences;
    }
  } catch {
    // Ignore DB error and fallback
  }

  // Fallback to local storage
  const local = localStorage.getItem(LOCAL_PREFS_KEY(profileId));
  if (local) {
    try {
      return JSON.parse(local) as UserPreferences;
    } catch {
      // Ignore parse error
    }
  }

  return {
    id: profileId,
    profile_id: profileId,
    theme: "Light",
    language: "English",
    email_notifications: true,
    updated_at: new Date().toISOString(),
  } as unknown as UserPreferences;
};

const updatePreferences = async (
  profileId: string,
  preferences: { theme?: string; language?: string; email_notifications?: boolean }
): Promise<UserPreferences> => {
  const localKey = LOCAL_PREFS_KEY(profileId);
  const existingLocal = localStorage.getItem(localKey);
  let parsedLocal: Record<string, unknown> = {};
  if (existingLocal) {
    try {
      parsedLocal = JSON.parse(existingLocal);
    } catch {
      // ignore
    }
  }

  const updatedPayload = {
    id: profileId,
    profile_id: profileId,
    ...parsedLocal,
    ...preferences,
    updated_at: new Date().toISOString(),
  };

  // Always update local storage for immediate UI persistence
  localStorage.setItem(localKey, JSON.stringify(updatedPayload));

  try {
    // Try update first
    const { data: updateData, error: updateError } = await supabase
      .from("user_preferences")
      .update({
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .eq("profile_id", profileId)
      .select()
      .maybeSingle();

    if (!updateError && updateData) {
      return updateData as unknown as UserPreferences;
    }

    // Try upsert if update didn't match a row
    const { data: upsertData, error: upsertError } = await supabase
      .from("user_preferences")
      .upsert(
        {
          profile_id: profileId,
          ...preferences,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "profile_id" }
      )
      .select()
      .maybeSingle();

    if (!upsertError && upsertData) {
      return upsertData as unknown as UserPreferences;
    }
  } catch (err) {
    console.warn("Supabase user_preferences RLS fallback engaged:", err);
  }

  return updatedPayload as unknown as UserPreferences;
};

const changePassword = async (
  profileId: string,
  newPassword: string
): Promise<void> => {
  // Update auth password if user is current session or update profile state
  const { error: authError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  // Always reflect password_set in profiles table as shown in DB schema
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      password_set: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (profileError && authError) {
    throw new Error(authError.message || profileError.message);
  }
};

export const staffService = {
  getRoles,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getLogs,
  logActivity,
  resetPin,
  getSessions,
  terminateSession,
  terminateAllOtherSessions,
  getPreferences,
  updatePreferences,
  changePassword,
};

export default staffService;