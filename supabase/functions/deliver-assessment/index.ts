import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, email, assessment_id } = body;
    
    const supaUrl = Deno.env.get("SUPABASE_URL") || "https://kqyvfykbnboesskxovtw.supabase.co";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey) {
      return new Response(JSON.stringify({ error: "No service key" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const sb = createClient(supaUrl, serviceKey);

    // ACTION: queue — save a new pending assessment
    if (action === "queue") {
      const { user_email, user_name, tool_name, tool_id, preview_html, preview_text, full_html, full_text } = body;
      
      if (!user_email || !tool_name || !preview_html || !full_html) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Random delay: 18-24 hours (in milliseconds)
      const minDelay = 18 * 60 * 60 * 1000;
      const maxDelay = 24 * 60 * 60 * 1000;
      const delay = minDelay + Math.random() * (maxDelay - minDelay);
      const deliverAt = new Date(Date.now() + delay).toISOString();
      
      const { data, error } = await sb.from("pending_assessments").insert([{
        user_email: user_email.toLowerCase(),
        user_name: user_name || "",
        tool_name,
        tool_id: tool_id || "",
        preview_html,
        preview_text: preview_text || "",
        full_html,
        full_text: full_text || "",
        deliver_at: deliverAt,
        status: "pending",
      }]).select("id, deliver_at");
      
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Notify admin that a new assessment was queued
      try {
        await fetch(`${supaUrl}/functions/v1/notify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": serviceKey },
          body: JSON.stringify({
            user_name: user_name || "Unknown",
            user_email: user_email,
            type: "assessment",
            message: `New ${tool_name} assessment queued for review.\n\nScheduled delivery: ${new Date(deliverAt).toLocaleString("en-US", { timeZone: "America/New_York" })} ET\n\nLog in to Admin → Assessments to review or deliver early.`,
          }),
        });
      } catch (_) { /* best effort */ }
      
      return new Response(JSON.stringify({ 
        success: true, 
        id: data?.[0]?.id,
        deliver_at: data?.[0]?.deliver_at 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // ACTION: check — get pending/delivered assessments for a user
    if (action === "check") {
      if (!email) {
        return new Response(JSON.stringify({ error: "email required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const now = new Date().toISOString();
      
      // Auto-deliver any that are past their deliver_at time
      await sb.from("pending_assessments")
        .update({ status: "delivered", delivered_at: now })
        .eq("status", "pending")
        .eq("user_email", email.toLowerCase())
        .lte("deliver_at", now);
      
      // Fetch all for this user
      const { data, error } = await sb.from("pending_assessments")
        .select("id, tool_name, tool_id, preview_html, full_html, status, created_at, delivered_at, deliver_at")
        .eq("user_email", email.toLowerCase())
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Send delivery emails for newly delivered assessments
      const justDelivered = (data || []).filter((a: any) => 
        a.status === "delivered" && a.delivered_at === now
      );
      for (const a of justDelivered) {
        try {
          await sendDeliveryEmail(supaUrl, serviceKey, email, a.tool_name);
          await sb.from("pending_assessments")
            .update({ email_sent: true, email_sent_at: now })
            .eq("id", a.id);
        } catch (_) { /* best effort */ }
      }
      
      return new Response(JSON.stringify({ assessments: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // ACTION: deliver — admin manually delivers an assessment
    if (action === "deliver") {
      const adminEmail = (body.admin_email || "").toLowerCase();
      if (adminEmail !== "mfaroqui@gmail.com") {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (!assessment_id) {
        return new Response(JSON.stringify({ error: "assessment_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const now = new Date().toISOString();
      const { data, error } = await sb.from("pending_assessments")
        .update({ status: "delivered", delivered_at: now, admin_delivered: true })
        .eq("id", assessment_id)
        .select("user_email, tool_name");
      
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Send email notification
      if (data?.[0]) {
        try {
          await sendDeliveryEmail(supaUrl, serviceKey, data[0].user_email, data[0].tool_name);
          await sb.from("pending_assessments")
            .update({ email_sent: true, email_sent_at: now })
            .eq("id", assessment_id);
        } catch (_) { /* best effort */ }
      }
      
      return new Response(JSON.stringify({ success: true, delivered: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // ACTION: list — admin gets all pending assessments
    if (action === "list") {
      const adminEmail = (body.admin_email || "").toLowerCase();
      if (adminEmail !== "mfaroqui@gmail.com") {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const { data, error } = await sb.from("pending_assessments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ assessments: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // ACTION: viewed — mark assessment as viewed by user
    if (action === "viewed") {
      if (!assessment_id) {
        return new Response(JSON.stringify({ error: "assessment_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      await sb.from("pending_assessments")
        .update({ status: "viewed" })
        .eq("id", assessment_id);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: queue, check, deliver, list, viewed" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Send delivery notification email to user
async function sendDeliveryEmail(supaUrl: string, serviceKey: string, userEmail: string, toolName: string) {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer re_Wzrmyu7Y_3uL6Ks2gh6mESGecy2GJj8Mo",
    },
    body: JSON.stringify({
      from: "HeartWise <noreply@heartwisementor.com>",
      to: userEmail,
      subject: "Your assessment from Dr. Faroqui is ready — HeartWise",
      html: `<div style="font-family:Georgia,'Times New Roman',serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1a1620;padding:24px;border-radius:12px 12px 0 0;color:#f0ece6">
          <h2 style="color:#c8a87c;margin:0 0 6px;font-size:20px;font-family:Georgia,serif">Your Assessment Is Ready</h2>
          <p style="color:#b8b3ac;margin:0;font-size:13px">${toolName}</p>
        </div>
        <div style="padding:28px;background:#f8f6f2;border-radius:0 0 12px 12px;border:1px solid #e8e4de;border-top:none">
          <p style="font-size:15px;line-height:1.8;color:#2a2520;margin:0 0 20px">
            I've finished reviewing your case and your personalized assessment is ready. I've included specific recommendations based on what I'm seeing in your profile.
          </p>
          <p style="font-size:14px;line-height:1.8;color:#2a2520;margin:0 0 24px">
            Log in to HeartWise to read your full assessment.
          </p>
          <div style="text-align:center">
            <a href="https://www.heartwisementor.com" style="display:inline-block;padding:14px 32px;background:#c8a87c;color:#1a1620;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;font-family:system-ui,sans-serif">View Your Assessment →</a>
          </div>
          <p style="font-size:13px;color:#8a8580;margin-top:24px;line-height:1.6;font-style:italic">
            — Dr. Mouzam Faroqui<br>
            Interventional Cardiologist
          </p>
        </div>
        <p style="font-size:11px;color:#999;margin-top:16px;text-align:center">HeartWise — Physician Career Decision Platform</p>
      </div>`,
    }),
  });
}
