import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteEmployee } from "../services/inviteEmployee.service";
import { toast } from "sonner";
import { staffKeys } from "../queryKeys";

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: inviteEmployee,

    onSuccess: (result) => {
      if (result?.temp_password) {
        // Dev mode: show the temp password so admin can share it
        toast.success(
          `Employee created! Temp password: ${result.temp_password}`,
          { duration: 10000 }
        );
      } else {
        // Production mode: invitation email was sent
        toast.success("Invitation email sent successfully.");
      }

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