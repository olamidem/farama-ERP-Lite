import { useQuery } from "@tanstack/react-query";
import { staffService } from "../services/staff.service";

export const useStaffSessions = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["staff", "sessions", profileId],
    queryFn: () => (profileId ? staffService.getSessions(profileId) : Promise.resolve([])),
    enabled: !!profileId,
  });
};
