import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "../store/authStore";

/**
 * Redirects unauthenticated users to the login page.
 */
export function requireAuth() {
  const { session, profile } = useAuthStore.getState();
  if (!session) {
    throw redirect({
      to: "/",
    });
  }

  if (profile && profile.password_set === false) {
    throw redirect({
      to: "/auth/set-password",
    });
  }
}

