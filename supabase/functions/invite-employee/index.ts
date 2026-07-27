import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    console.log("Invite Employee Function Started");

    const body = await req.json();

    console.log("Incoming Payload:", body);

    const {
      full_name,
      email,
      phone,
      role_id,
      status,
      avatar_color,
      avatar_url,
    } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("Inviting user:", email);

    const { data: authUser, error: authError } =
      await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name,
        },
      });

    console.log("Auth User:", authUser);
    console.log("Auth Error:", authError);

    if (authError) {
      console.error(authError);

      return new Response(
        JSON.stringify(authError),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const userId = authUser.user?.id;

    if (!userId) {
      return new Response(
        JSON.stringify({
          error: "User ID not returned from Supabase Auth.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Creating profile...");

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name,
        email,
        phone,
        role_id,
        status,
        avatar_color,
        avatar_url,
      });

    console.log("Profile Error:", profileError);

    if (profileError) {
      console.error(profileError);

      return new Response(
        JSON.stringify(profileError),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Employee invited successfully.");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Invitation sent successfully.",
        user: authUser.user,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});