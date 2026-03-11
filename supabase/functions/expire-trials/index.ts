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
    const supaUrl = Deno.env.get("SUPABASE_URL") || "https://kqyvfykbnboesskxovtw.supabase.co";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey) {
      return new Response(JSON.stringify({ error: "No service key" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const sb = createClient(supaUrl, serviceKey);

    // Find all profiles where trial_end has passed but tier is still 'elite'
    const now = new Date().toISOString();
    const { data: expired, error: fetchErr } = await sb
      .from("profiles")
      .select("id, name, email, tier, trial_end")
      .not("trial_end", "is", null)
      .lt("trial_end", now)
      .neq("tier", "free");

    if (fetchErr) {
      return new Response(JSON.stringify({ error: fetchErr.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (!expired || expired.length === 0) {
      return new Response(JSON.stringify({ success: true, expired: 0, profiles: [] }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Downgrade each expired trial to free
    const results = [];
    for (const profile of expired) {
      const { error: updateErr } = await sb
        .from("profiles")
        .update({ tier: "free" })
        .eq("id", profile.id);

      results.push({
        name: profile.name,
        email: profile.email,
        previousTier: profile.tier,
        trialEnd: profile.trial_end,
        downgraded: !updateErr,
        error: updateErr?.message || null,
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      expired: results.length, 
      profiles: results,
      checkedAt: now,
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
