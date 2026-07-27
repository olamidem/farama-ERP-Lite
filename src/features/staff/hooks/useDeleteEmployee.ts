import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { staffKeys } from "../queryKeys";
import staffService from "../services/staff.service";

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) =>
      staffService.deleteEmployee(id),

    onSuccess: () => {
      toast.success("Employee deleted successfully.");

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
    deleteEmployee: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
};

export default useDeleteEmployee;
