import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Content-Type": "application/json",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const body = await req.json();
    const { email, action, messageIds } = body;

    const supaUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supaUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Config missing" }), { status: 500, headers: CORS });
    }

    const sb = createClient(supaUrl, serviceKey);

    // === MARK READ ===
    if (action === "mark_read" && messageIds && messageIds.length) {
      const now = new Date().toISOString();
      const { error } = await sb
        .from("messages")
        .update({ user_read: true, user_read_at: now })
        .in("id", messageIds);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS });
      }
      return new Response(JSON.stringify({ ok: true, marked: messageIds.length }), { headers: CORS });
    }

    // === GET MESSAGES ===
    if (!email) {
      return new Response(JSON.stringify({ error: "No email" }), { status: 400, headers: CORS });
    }

    const userEmail = email.toLowerCase();

    const { data: messages, error } = await sb
      .from("messages")
      .select("*")
      .or(`user_email.eq.${userEmail},to_email.eq.${userEmail},to_email.eq.__all__`)
      .or("type.eq.notification,from_admin.eq.true")
      .order("date", { ascending: false })
      .limit(50);

    if (error) {
      // Fallback: simpler queries
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

      return new Response(JSON.stringify({ messages: deduped }), { headers: CORS });
    }

    return new Response(JSON.stringify({ messages: messages || [] }), { headers: CORS });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: CORS });
  }
});
