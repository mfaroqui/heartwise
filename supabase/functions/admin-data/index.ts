import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
      },
    });
  }

  try {
    const payload = await req.json();
    const adminEmail = (payload.email || "").toLowerCase();

    // Only allow admin
    if (adminEmail !== "mfaroqui@gmail.com") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const supaUrl = Deno.env.get("SUPABASE_URL") || "https://kqyvfykbnboesskxovtw.supabase.co";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey) {
      return new Response(JSON.stringify({ error: "No service key" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const sb = createClient(supaUrl, serviceKey);
    const action = payload.action || "fetch";

    // Admin migration action — add columns to profiles
    if (action === "migrate") {
      const { data, error } = await sb.rpc("exec_migration", {
        sql_text: `
          ALTER TABLE profiles ADD COLUMN IF NOT EXISTS session_data JSONB DEFAULT NULL;
          ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_sync TIMESTAMPTZ DEFAULT NULL;
        `
      });
      if (error) {
        // Try direct approach — create a simple function first
        const createFn = await fetch(`${supaUrl}/rest/v1/rpc/exec_migration`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceKey}`,
            "apikey": serviceKey,
          },
          body: JSON.stringify({ sql_text: "SELECT 1" }),
        });
        return new Response(JSON.stringify({ 
          error: "Migration RPC not available. Please run this SQL in the Supabase SQL Editor:",
          sql: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS session_data JSONB DEFAULT NULL; ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_sync TIMESTAMPTZ DEFAULT NULL;"
        }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
      return new Response(JSON.stringify({ action: "migrated", success: true }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Default: Fetch all data
    const { data: profiles, error: e1 } = await sb
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: questions, error: e2 } = await sb
      .from("questions")
      .select("*")
      .order("date", { ascending: false });

    const { data: messages, error: e3 } = await sb
      .from("messages")
      .select("*")
      .order("date", { ascending: false });

    return new Response(JSON.stringify({
      profiles: profiles || [],
      questions: questions || [],
      messages: messages || [],
    }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
