import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const TEMP_PASSWORD = "TempPassword123!";
const PROD_REDIRECT_URL = "https://ts-farama-store.vercel.app/auth/accept-invite";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { full_name, email, phone, role_id } = body;

    if (!email || !full_name || !role_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: full_name, email, role_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Determine environment — defaults to "production" if not set
    const appEnv = Deno.env.get("APP_ENV") ?? "production";
    const isDev = appEnv === "development";

    let userId: string;

    if (isDev) {
      // -------------------------------------------------------
      // DEVELOPMENT: Create user with known temporary password
      // -------------------------------------------------------
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: TEMP_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name },
      });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!data?.user) {
        return new Response(
          JSON.stringify({ success: false, error: "User creation failed." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = data.user.id;
    } else {
      // -------------------------------------------------------
      // PRODUCTION: Send invitation email — user sets own password
      // -------------------------------------------------------
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { full_name },
        redirectTo: PROD_REDIRECT_URL,
      });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!data?.user) {
        return new Response(
          JSON.stringify({ success: false, error: "Invitation failed." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = data.user.id;
    }

    // Create profile record (same for both environments)
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name,
        email,
        phone: phone ?? null,
        role_id,
        status: "PENDING",
        avatar_url: null,
        avatar_color: null,
        pin_hash: null,
        password_set: false,
        invited_at: new Date().toISOString(),
        activated_at: null,
        last_login: null,
      });

    if (profileError) {
      // Clean up orphaned auth user if profile insert fails
      await supabase.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ success: false, error: profileError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        dev_mode: isDev,
        // Only expose temp password in dev mode for the admin toast
        temp_password: isDev ? TEMP_PASSWORD : null,
        user_id: userId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});