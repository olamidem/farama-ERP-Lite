import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { staffService } from "../services/staff.service";

export const useStaffPreferences = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["staff", "preferences", profileId],
    queryFn: () => (profileId ? staffService.getPreferences(profileId) : Promise.resolve(null)),
    enabled: !!profileId,
  });
};

export const useUpdateStaffPreferences = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      profileId,
      preferences,
    }: {
      profileId: string;
      preferences: { theme?: string; language?: string; email_notifications?: boolean };
    }) => staffService.updatePreferences(profileId, preferences),

    onSuccess: (_, variables) => {
      toast.success("Preferences saved");
      queryClient.invalidateQueries({
        queryKey: ["staff", "preferences", variables.profileId],
      });
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to update preferences");
    },
  });

  return {
    updatePreferences: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

