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
    const supaUrl = Deno.env.get("SUPABASE_URL") || "https://kqyvfykbnboesskxovtw.supabase.co";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey) {
      return new Response(JSON.stringify({ error: "No service key" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const sb = createClient(supaUrl, serviceKey);

    // Check if profile already exists
    const { data: existing } = await sb
      .from("profiles")
      .select("id")
      .eq("email", (payload.email || "").toLowerCase())
      .limit(1);

    if (existing && existing.length > 0) {
      // Profile exists — update it instead of inserting
      const updateData: Record<string, unknown> = {
        name: payload.name,
        role: payload.role,
        tier: payload.tier,
        institution: payload.institution || "",
        stage: payload.stage || "",
        specialty: payload.specialty || "",
        goal: payload.goal || "",
        score: payload.score,
        grade: payload.grade,
        strengths: payload.strengths || [],
        gaps: payload.gaps || [],
        profile_data: payload.profile_data || {},
      };
      if (payload.trial_end) updateData.trial_end = payload.trial_end;
      const { data, error } = await sb
        .from("profiles")
        .update(updateData)
        .eq("id", existing[0].id)
        .select();

      return new Response(JSON.stringify({ success: true, action: "updated", data }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Insert new profile
    const insertData: Record<string, unknown> = {
      user_id: payload.user_id || null,
      name: payload.name,
      email: (payload.email || "").toLowerCase(),
      role: payload.role || "student",
      tier: payload.tier || "free",
      institution: payload.institution || "",
      stage: payload.stage || "",
      specialty: payload.specialty || "",
      goal: payload.goal || "",
      score: payload.score || 0,
      grade: payload.grade || "",
      strengths: payload.strengths || [],
      gaps: payload.gaps || [],
      profile_data: payload.profile_data || {},
      notes: payload.notes || [],
    };
    if (payload.trial_end) insertData.trial_end = payload.trial_end;
    const { data, error } = await sb.from("profiles").insert([insertData]).select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ success: true, action: "inserted", data }), {
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
