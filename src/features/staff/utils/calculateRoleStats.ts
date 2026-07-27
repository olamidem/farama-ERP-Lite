import type { Employee } from "../types/staff";
import { USER_STATUS } from "../../auth/types/enums";

export interface RoleStat {
  name: string;
  count: number;
  percent: number;
}

export const calculateRoleStats = (employees: Employee[]): RoleStat[] => {
  const total = employees.length;

  const percentage = (count: number) =>
    total === 0 ? 0 : Math.round((count / total) * 100);

  const getRoleName = (role: unknown) => typeof role === "object" && role !== null ? (role as { name?: string }).name || "" : (role as string) || "";

  const administrators = employees.filter(
    (e) =>
      ["Super Admin", "Administrator", "Admin"].includes(getRoleName(e.role)) &&
      e.status === USER_STATUS.ACTIVE,
  ).length;

  const managers = employees.filter(
    (e) => getRoleName(e.role) === "Manager" && e.status === USER_STATUS.ACTIVE,
  ).length;

  const cashiers = employees.filter(
    (e) => getRoleName(e.role) === "Cashier" && e.status === USER_STATUS.ACTIVE,
  ).length;

  const storekeepers = employees.filter(
    (e) =>
      ["Inventory Clerk", "Storekeeper"].includes(getRoleName(e.role)) &&
      e.status === USER_STATUS.ACTIVE,
  ).length;

  const inactive = employees.filter((e) => e.status === USER_STATUS.SUSPENDED).length;

  return [
    {
      name: "Administrator",
      count: administrators,
      percent: percentage(administrators),
    },
    {
      name: "Manager",
      count: managers,
      percent: percentage(managers),
    },
    {
      name: "Cashier",
      count: cashiers,
      percent: percentage(cashiers),
    },
    {
      name: "Storekeeper",
      count: storekeepers,
      percent: percentage(storekeepers),
    },
    {
      name: "Inactive",
      count: inactive,
      percent: percentage(inactive),
    },
  ];
};
