import { useQuery } from "@tanstack/react-query";
import { staffService } from "../services/staff.service";

export const useStaffPreferences = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["staff", "preferences", profileId],
    queryFn: () => (profileId ? staffService.getPreferences(profileId) : Promise.resolve(null)),
    enabled: !!profileId,
  });
};
