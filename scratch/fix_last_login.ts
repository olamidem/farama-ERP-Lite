import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const envStr = fs.readFileSync(".env", "utf-8");
const env: Record<string, string> = {};
envStr.split("\n").forEach(line => {
  const [key, ...val] = line.split("=");
  if (key && val.length) env[key.trim()] = val.join("=").trim().replace(/['"]/g, '');
});

const supabaseUrl = env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixLastLogin() {
  const { data: profiles, error: fetchError } = await supabase
    .from("profiles")
    .select("id, last_login");

  if (fetchError) {
    console.error("Error fetching profiles:", fetchError);
    return;
  }

  console.log("Profiles in DB:", profiles);

  const now = new Date().toISOString();
  let updatedCount = 0;

  for (const profile of profiles) {
    // If it's literally null, undefined, empty string, or invalid date
    if (!profile.last_login || profile.last_login.trim() === "") {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ last_login: now })
        .eq("id", profile.id);
        
      if (updateError) {
        console.error(`Failed to update profile ${profile.id}:`, updateError);
      } else {
        console.log(`Updated profile ${profile.id}`);
        updatedCount++;
      }
    }
  }
  
  console.log(`Finished. Updated ${updatedCount} profiles.`);
}

fixLastLogin();
