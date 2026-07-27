import { useEmployees } from "./useEmployees";
import { useRoles } from "./useRoles";
import { useActivityLogs } from "./useActivityLogs";

export const useStaff = () => {
  const employees = useEmployees();
  const roles = useRoles();
  const logs = useActivityLogs();

  return {
    employees: employees.data ?? [],
    roles: roles.data ?? [],
    logs: logs.data ?? [],

    isLoading:
      employees.isLoading ||
      roles.isLoading ||
      logs.isLoading,

    isFetching:
      employees.isFetching ||
      roles.isFetching ||
      logs.isFetching,

    refetch: async () => {
      await Promise.all([
        employees.refetch(),
        roles.refetch(),
        logs.refetch(),
      ]);
    },
  };
};
