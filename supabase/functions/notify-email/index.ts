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
    const { user_name, user_email, type, message, store } = await req.json();

    // If store flag is set, insert message into database server-side
    if (store) {
      try {
        const supaUrl = Deno.env.get("SUPABASE_URL") || "https://kqyvfykbnboesskxovtw.supabase.co";
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (serviceKey) {
          const sb = createClient(supaUrl, serviceKey);
          await sb.from("messages").insert([{
            user_name: user_name || "Unknown",
            user_email: user_email || "",
            type: type || "other",
            message: message || "",
            replies: [],
            read: false,
            date: new Date().toISOString(),
          }]);
        }
      } catch (dbErr) {
        console.error("DB insert failed:", dbErr);
        // Continue to send email even if DB insert fails
      }
    }

    // Skip email for progress-type messages (goal completions etc.)
    if (type === "progress") {
      return new Response(JSON.stringify({ success: true, skipped: "progress" }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const TL: Record<string, string> = {
      career: "🎯 Career/Strategy",
      finance: "💰 Finance/Comp",
      contract: "📋 Contract/Negotiation",
      "pivot-report": "📊 Career Pivot Report",
      audit: "🎯 Strategic Audit",
      bug: "🐛 Bug Report",
      suggestion: "💡 Suggestion",
      feedback: "📝 Feedback",
      other: "📎 Other",
    };
    const label = TL[type] || type || "Message";
    const safe = message?.startsWith("<") ? message : (message || "").replace(/</g, "&lt;").replace(/\n/g, "<br>");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer re_Wzrmyu7Y_3uL6Ks2gh6mESGecy2GJj8Mo",
      },
      body: JSON.stringify({
        from: "HeartWise <noreply@heartwisementor.com>",
        to: "heartwisementor@gmail.com",
        subject: "HeartWise: " + label + " from " + (user_name || "Unknown"),
        html: '<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px"><div style="background:#1a1620;padding:20px;border-radius:12px 12px 0 0;color:#f0ece6"><h2 style="color:#c8a87c;margin:0 0 4px;font-size:18px">' + label + '</h2><p style="color:#b8b3ac;margin:0;font-size:13px">From: ' + (user_name || "Unknown") + " (" + (user_email || "") + ')</p></div><div style="padding:20px;background:#f8f6f2;border-radius:0 0 12px 12px;border:1px solid #e8e4de;border-top:none"><div style="font-size:14px;line-height:1.7;color:#2a2520;white-space:pre-wrap">' + safe + '</div></div><p style="font-size:11px;color:#999;margin-top:16px;text-align:center">Log in to HeartWise Admin → Messages to reply.</p></div>',
      }),
    });
    const data = await res.json();
    return new Response(JSON.stringify({ success: true, data }), {
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
