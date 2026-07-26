import { useMemo, useState } from "react";
import type { Employee } from "../types/staff";

export const useEmployeeFilters = (employees: Employee[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended"
  >("all");

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const search = searchQuery.toLowerCase();

      const matchesSearch =
        employee.full_name.toLowerCase().includes(search) ||
        employee.email.toLowerCase().includes(search) ||
        employee.phone?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        employee.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, searchQuery, statusFilter]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredEmployees,
  };
};