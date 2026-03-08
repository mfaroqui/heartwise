// Supabase Edge Function: notify-email
// Sends email notification to admin when a new message is received
// Deploy: supabase functions deploy notify-email
// Set secret: supabase secrets set RESEND_API_KEY=re_xxxxx

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ADMIN_EMAIL = "heartwisementor@gmail.com";
const FROM_EMAIL = "HeartWise <notifications@heartwisemd.com>";

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { user_name, user_email, type, message } = await req.json();

    const typeLabels: Record<string, string> = {
      career: "🎯 Career/Strategy Question",
      finance: "💰 Finance/Compensation Question",
      contract: "📋 Contract/Negotiation Question",
      "pivot-report": "📊 Career Pivot Report",
      audit: "🎯 Strategic Audit Submission",
      bug: "🐛 Bug Report",
      suggestion: "💡 Feature Suggestion",
      feedback: "📝 Feedback",
      other: "📎 Other",
    };

    const subject = `HeartWise: New ${typeLabels[type] || type} from ${user_name}`;

    // Try Resend first (set RESEND_API_KEY in secrets)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject,
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px">
              <div style="background:#1a1620;padding:20px;border-radius:12px;color:#f0ece6">
                <h2 style="color:#c8a87c;margin:0 0 4px;font-size:18px">${typeLabels[type] || type}</h2>
                <p style="color:#b8b3ac;margin:0;font-size:13px">From: ${user_name} (${user_email})</p>
              </div>
              <div style="padding:20px;background:#f8f6f2;border-radius:0 0 12px 12px;border:1px solid #e8e4de;border-top:none">
                <div style="font-size:14px;line-height:1.7;color:#2a2520;white-space:pre-wrap">${
                  message?.startsWith("<") ? message : message?.replace(/</g, "&lt;").replace(/\n/g, "<br>")
                }</div>
              </div>
              <p style="font-size:11px;color:#999;margin-top:16px;text-align:center">
                Log in to HeartWise Admin → Messages to reply.
              </p>
            </div>
          `,
        }),
      });
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, provider: "resend", data }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Fallback: use Supabase's built-in SMTP (if configured)
    return new Response(
      JSON.stringify({ success: false, error: "No email provider configured. Set RESEND_API_KEY." }),
      { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, status: 500 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
