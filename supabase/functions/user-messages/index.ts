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
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "No email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const supaUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supaUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Config missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const sb = createClient(supaUrl, serviceKey);
    const userEmail = email.toLowerCase();

    // Get messages for this user: notifications, admin messages, and broadcasts
    const { data: messages, error } = await sb
      .from("messages")
      .select("*")
      .or(`user_email.eq.${userEmail},to_email.eq.${userEmail},to_email.eq.__all__`)
      .or("type.eq.notification,from_admin.eq.true")
      .order("date", { ascending: false })
      .limit(50);

    if (error) {
      // Fallback: try simpler queries
      const r1 = await sb.from("messages").select("*").eq("to_email", userEmail).eq("from_admin", true).order("date", { ascending: false }).limit(30);
      const r2 = await sb.from("messages").select("*").eq("to_email", "__all__").eq("from_admin", true).order("date", { ascending: false }).limit(20);
      const r3 = await sb.from("messages").select("*").eq("user_email", userEmail).eq("type", "notification").order("date", { ascending: false }).limit(20);
      
      const all = [...(r1.data || []), ...(r2.data || []), ...(r3.data || [])];
      const seen: Record<string, boolean> = {};
      const deduped = all.filter((m: { id: string }) => {
        if (!m.id || seen[m.id]) return false;
        seen[m.id] = true;
        return true;
      });

      return new Response(JSON.stringify({ messages: deduped }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ messages: messages || [] }), {
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
