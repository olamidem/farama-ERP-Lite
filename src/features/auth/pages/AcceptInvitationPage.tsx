import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "../../../api/supabase";
import { motion } from "motion/react";
import { Loader2, AlertCircle } from "lucide-react";

/**
 * Production invite flow landing page.
 *
 * When a user clicks the invitation email link, Supabase appends auth tokens
 * as URL hash fragments. This page:
 *   1. Detects the token in the URL hash
 *   2. Lets supabase-js exchange it for a session (via onAuthStateChange)
 *   3. Redirects to /auth/set-password so the user can set their own password
 *
 * If there's no token (e.g. direct navigation), it shows an error.
 */
const AcceptInvitationPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        // Supabase fires PASSWORD_RECOVERY for invite links
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          navigate({ to: "/auth/set-password", replace: true });
        }
      }
    );

    // If no hash fragment exists, show error after a short delay
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) {
      const timer = setTimeout(() => {
        setError(
          "Invalid or expired invitation link. Please contact your administrator."
        );
      }, 3000);

      return () => {
        clearTimeout(timer);
        listener.subscription.unsubscribe();
      };
    }

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-4"
      >
        {error ? (
          <>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-lg font-black text-slate-800">
              Invitation Error
            </h2>
            <p className="text-sm text-slate-500 font-medium">{error}</p>
            <button
              onClick={() => navigate({ to: "/", replace: true })}
              className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer"
            >
              Go to Login
            </button>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <h2 className="text-lg font-black text-slate-800">
              Processing Invitation
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Please wait while we verify your invitation...
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AcceptInvitationPage;
