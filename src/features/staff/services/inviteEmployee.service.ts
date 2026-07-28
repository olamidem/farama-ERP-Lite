import { supabase } from "../../../api/supabase";

interface InviteEmployeePayload {
  full_name: string;
  email: string;
  phone: string;
  role_id: string;
}

export const inviteEmployee = async (
  payload: InviteEmployeePayload
) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("You are not authenticated.");
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-employee`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? "Invitation failed.");
  }

  return result;
};