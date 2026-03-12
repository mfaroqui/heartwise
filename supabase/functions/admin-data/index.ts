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

    // Fetch all profiles
    const { data: profiles, error: e1 } = await sb
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch all questions
    const { data: questions, error: e2 } = await sb
      .from("questions")
      .select("*")
      .order("date", { ascending: false });

    // Fetch all messages
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
