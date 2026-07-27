import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { staffKeys } from "../queryKeys";
import { useRoles } from "./useRoles";
import type { UpdateEmployeeDto } from "../types/staff-query.types";
import type { Employee } from "../types/staff";
import staffService from "../services/staff.service";

interface UpdatePayload {
  id: string;
  updates: Partial<Employee> & { pin?: string; role_id?: string };
}

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  const { data: roles = [] } = useRoles();

  const mutation = useMutation({
    mutationFn: async ({ id, updates }: UpdatePayload) => {
      const payload: UpdateEmployeeDto = {};

      if (updates.full_name !== undefined) payload.full_name = updates.full_name;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.avatar_color !== undefined) payload.avatar_color = updates.avatar_color;
      if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;
      if (updates.pin_hash !== undefined) payload.pin_hash = updates.pin_hash;
      if (updates.pin !== undefined) payload.pin_hash = updates.pin;

      if (updates.role !== undefined && updates.role !== null) {
        const roleObj = roles.find(
          (r) =>
            r.name.toLowerCase() === String(updates.role).toLowerCase() ||
            r.id === updates.role
        );
        if (roleObj) {
          payload.role_id = roleObj.id;
        }
      }

      if (updates.role_id !== undefined) {
        payload.role_id = updates.role_id;
      }

      return staffService.updateEmployee(id, payload);
    },

    onSuccess: () => {
      toast.success("Employee updated successfully.");

      queryClient.invalidateQueries({
        queryKey: staffKeys.employees,
      });

      queryClient.invalidateQueries({
        queryKey: staffKeys.roles,
      });
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    updateEmployee: async (id: string, updates: Partial<Employee> & { pin?: string; role_id?: string }) => {
      return mutation.mutateAsync({ id, updates });
    },
    isUpdating: mutation.isPending,
  };
};

export default useUpdateEmployee;
