import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteEmployee } from "../services/inviteEmployee.service";
import { toast } from "sonner";
import { staffKeys } from "../queryKeys";

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: inviteEmployee,

    onSuccess: () => {
      toast.success("Invitation sent successfully.");

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