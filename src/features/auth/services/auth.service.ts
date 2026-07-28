import type { User } from "@supabase/supabase-js";
import { supabase } from "../../../api/supabase";
import type { LoginRequest, LoginResponse } from "../types/auth";
import type { Profile } from "../types/profile";

/* ============================================================================
 * AUTHENTICATION
 * ========================================================================== */

export const login = async ({
  email,
  password,
}: LoginRequest): Promise<LoginResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!error && data?.session) {
    return data;
  }

  // Fallback: If user exists in profiles but not yet registered in Supabase Auth
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (profile) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (!signUpError && signUpData?.session) {
        return signUpData as LoginResponse;
      }
    }
  } catch {
    // Ignore fallback failure
  }

  throw new Error(error?.message || "Invalid login credentials");
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

/* ============================================================================
 * CURRENT USER
 * ========================================================================== */

export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return user;
};

export const getCurrentProfile = async (
  userId: string,
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      *,
      role:roles (
        id,
        name,
        description,
        role_permissions (
          role_id,
          permission_id,
          permission:permissions (
            id,
            module,
            action,
            code
          )
        )
      )
    `,
    )
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Profile;
};

/* ============================================================================
 * PROFILE
 * ========================================================================== */

export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>,
): Promise<Profile> => {
  const allowedUpdates = { ...updates };
  delete allowedUpdates.role;

  const { error } = await supabase
    .from("profiles")
    .update({
      ...allowedUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  const updatedProfile = await getCurrentProfile(userId);

  if (!updatedProfile) {
    throw new Error("Unable to retrieve updated profile.");
  }

  return updatedProfile;
};

/* ============================================================================
 * PIN
 * ========================================================================== */

export const unlockWithPin = async (
  userId: string,
  pin: string,
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("pin_hash")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error("Unable to locate user profile.");
  }

  if (!data.pin_hash) {
    throw new Error("PIN has not been configured.");
  }

  // Legacy plaintext support
  if (data.pin_hash === pin) {
    return true;
  }

  // SHA256 verification
  const encoder = new TextEncoder();
  const pinData = encoder.encode(pin);

  const hashBuffer = await crypto.subtle.digest("SHA-256", pinData);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  const hashedPin = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return data.pin_hash === hashedPin;
};

export const updatePin = async (
  userId: string,
  plainPin: string,
): Promise<void> => {
  const encoder = new TextEncoder();

  const pinData = encoder.encode(plainPin);

  const hashBuffer = await crypto.subtle.digest("SHA-256", pinData);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  const hashedPin = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const { error } = await supabase
    .from("profiles")
    .update({
      pin_hash: hashedPin,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
};
