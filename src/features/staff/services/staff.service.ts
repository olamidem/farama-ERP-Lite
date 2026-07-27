import { supabase } from "../../../api/supabase";
import type { Employee, ActivityLog, RoleData } from "../types/staff";
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
  const { data, error } = await supabase.from("roles").select(ROLE_SELECT);

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
  if (!updates || Object.keys(updates).length === 0) {
    const { data, error } = await supabase
      .from("profiles")
      .select(EMPLOYEE_SELECT)
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const employee = data as unknown as EmployeeQueryResult;
    return mapEmployee(employee);
  }

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

export const staffService = {
  getRoles,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getLogs,
  logActivity,
  resetPin,
};

export default staffService;
