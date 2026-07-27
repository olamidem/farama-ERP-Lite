import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { staffKeys } from "../queryKeys";
import { useRoles } from "./useRoles";
import { USER_STATUS } from "../../auth/types/enums";
import staffService from "../services/staff.service";

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  const { data: roles = [] } = useRoles();

  const mutation = useMutation({
    mutationFn: async (data: {
      full_name: string;
      email: string;
      phone: string;
      role: string;
      pin: string;
    }) => {
      const roleObj = roles.find(
        (r) =>
          r.name.toLowerCase() === data.role.toLowerCase() ||
          r.id === data.role
      );
      if (!roleObj) {
        throw new Error(`Role "${data.role}" not found in database roles.`);
      }

      const avatar_color = [
        "#4f46e5",
        "#10b981",
        "#f59e0b",
        "#ec4899",
        "#8b5cf6",
        "#06b6d4",
      ][Math.floor(Math.random() * 6)];

      return staffService.createEmployee({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || "",
        role_id: roleObj.id,
        status: USER_STATUS.ACTIVE,
        avatar_color,
        avatar_url: "",
        pin_hash: data.pin,
      });
    },

    onSuccess: (data) => {
      toast.success(`${data.full_name} successfully registered!`);

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
    createEmployee: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export default useCreateEmployee;
