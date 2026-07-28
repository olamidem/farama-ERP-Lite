import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { staffService } from "../services/staff.service";

export const useStaffSessions = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["staff", "sessions", profileId],
    queryFn: () => (profileId ? staffService.getSessions(profileId) : Promise.resolve([])),
    enabled: !!profileId,
  });
};

export const useTerminateSession = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ sessionId }: { sessionId: string; profileId: string }) =>
      staffService.terminateSession(sessionId),

    onSuccess: (_, variables) => {
      toast.success("Session terminated");
      queryClient.invalidateQueries({
        queryKey: ["staff", "sessions", variables.profileId],
      });
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to terminate session");
    },
  });

  return {
    terminateSession: mutation.mutateAsync,
    isTerminating: mutation.isPending,
  };
};

export const useLogoutAllDevices = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (profileId: string) => staffService.terminateAllOtherSessions(profileId),

    onSuccess: (_, profileId) => {
      toast.success("Logged out from other devices");
      queryClient.invalidateQueries({
        queryKey: ["staff", "sessions", profileId],
      });
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to logout from all devices");
    },
  });

  return {
    logoutAllDevices: mutation.mutateAsync,
    isLoggingOut: mutation.isPending,
  };
};

