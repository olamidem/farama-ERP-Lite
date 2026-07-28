import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { staffKeys } from "../queryKeys";
import { staffService } from "../services/staff.service";

interface ChangePasswordPayload {
  profileId: string;
  newPassword: string;
}

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ profileId, newPassword }: ChangePasswordPayload) =>
      staffService.changePassword(profileId, newPassword),

    onSuccess: () => {
      toast.success("Password updated successfully.");
      queryClient.invalidateQueries({
        queryKey: staffKeys.employees,
      });
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to update password.");
    },
  });

  return {
    changePassword: (payload: ChangePasswordPayload) =>
      mutation.mutateAsync(payload),

    isChangingPassword: mutation.isPending,
  };
};

export default useChangePassword;
