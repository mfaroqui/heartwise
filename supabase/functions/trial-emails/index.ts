import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Trial email drip — called by Supabase cron or external scheduler
// Sends lifecycle emails at: 24h into trial, 4h before expiry, 24h after expiry

const RESEND_KEY = "RESEND_API_KEY"; // Set in Supabase secrets if using Resend
const FROM_EMAIL = "HeartWise <noreply@heartwisementor.com>";
const FROM_NAME = "Dr. Mouzam Faroqui";

interface TrialUser {
  id: string;
  email: string;
  name: string;
  tier: string;
  is_trial: boolean;
  trial_end: string;
  created_at: string;
  profile_data?: Record<string, unknown>;
  session_data?: Record<string, unknown>;
}

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

  const supaUrl = Deno.env.get("SUPABASE_URL") || "https://kqyvfykbnboesskxovtw.supabase.co";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) {
    return new Response(JSON.stringify({ error: "No service key" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const sb = createClient(supaUrl, serviceKey);
  const now = new Date();
  const results: string[] = [];

  // Get all trial users
  const { data: trialUsers, error } = await sb
    .from("profiles")
    .select("id, email, name, tier, is_trial, trial_end, created_at, session_data")
    .eq("is_trial", true)
    .not("trial_end", "is", null);

  if (error || !trialUsers) {
    return new Response(JSON.stringify({ error: error?.message || "No data" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  for (const user of trialUsers as TrialUser[]) {
    const trialEnd = new Date(user.trial_end);
    const trialStart = new Date(user.created_at);
    const hoursInTrial = (now.getTime() - trialStart.getTime()) / (1000 * 60 * 60);
    const hoursUntilExpiry = (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60);
    const hoursAfterExpiry = -hoursUntilExpiry;

    // Count tools used from session_data
    let toolsUsed = 0;
    let toolNames: string[] = [];
    if (user.session_data) {
      const sd = typeof user.session_data === "string" ? JSON.parse(user.session_data) : user.session_data;
      if (sd.toolHistory && Array.isArray(sd.toolHistory)) {
        toolsUsed = sd.toolHistory.length;
        const unique = new Set(sd.toolHistory.map((t: {tool: string}) => t.tool));
        toolNames = [...unique].slice(0, 3) as string[];
      }
    }

    const firstName = (user.name || "").split(" ")[0] || "there";

    // Email 1: 24h into trial (22-26h window)
    if (hoursInTrial >= 22 && hoursInTrial <= 26) {
      const alreadySent = await checkSent(sb, user.email, "trial_24h");
      if (!alreadySent) {
        const subject = toolsUsed > 0
          ? `You've already run ${toolsUsed} tool${toolsUsed > 1 ? "s" : ""} — here's what to try next`
          : `${firstName}, your 48-hour access is half over`;
        const body = toolsUsed > 0
          ? `Hi ${firstName},\n\nYou've used ${toolNames.join(", ")} so far — good start.\n\nWith ${Math.round(hoursUntilExpiry)} hours left in your trial, here are the tools most people find valuable:\n\n• Match Competitiveness Calculator — see where you rank\n• Contract Review Tool — find hidden risks in offers\n• Financial Projection Tool — model your 30-year wealth\n\nEach one builds on the last. The more you run, the sharper your career strategy gets.\n\nheartwisementor.com\n\n— Dr. Faroqui`
          : `Hi ${firstName},\n\nYou signed up for HeartWise but haven't run any tools yet.\n\nI built these tools because the decisions you're facing — specialty choice, match strategy, contract terms, financial planning — are too important to guess on.\n\nStart with the one that matches where you are right now:\n\n• Student? → Specialty Fit Assessment\n• Resident? → Match Competitiveness Calculator\n• Fellow? → Contract Review Tool\n• Attending? → RVU Compensation Calculator\n\nYou have ${Math.round(hoursUntilExpiry)} hours left. One tool takes 5 minutes.\n\nheartwisementor.com\n\n— Dr. Faroqui`;
        await sendEmail(sb, user.email, subject, body, "trial_24h");
        results.push(`Sent trial_24h to ${user.email}`);
      }
    }

    // Email 2: 4h before expiry (3-5h window)
    if (hoursUntilExpiry >= 3 && hoursUntilExpiry <= 5) {
      const alreadySent = await checkSent(sb, user.email, "trial_expiring");
      if (!alreadySent) {
        const subject = `Your HeartWise access expires in ${Math.round(hoursUntilExpiry)} hours`;
        const body = `Hi ${firstName},\n\nYour 48-hour Core access ends in about ${Math.round(hoursUntilExpiry)} hours.${toolsUsed > 0 ? `\n\nYou ran ${toolsUsed} tool${toolsUsed > 1 ? "s" : ""} during your trial. Those results — your scores, your gaps, your strategic roadmap — stay in your account when you subscribe.` : ""}\n\nAfter your trial ends, tool results will be locked behind the paywall.\n\nCore is $39/month. Every tool, unlimited runs, data that follows you.\n\nheartwisementor.com\n\nThe physicians who use HeartWise don't guess at career decisions. They model them.\n\n— Dr. Faroqui`;
        await sendEmail(sb, user.email, subject, body, "trial_expiring");
        results.push(`Sent trial_expiring to ${user.email}`);
      }
    }

    // Email 3: 24h after expiry (22-26h window)
    if (hoursAfterExpiry >= 22 && hoursAfterExpiry <= 26) {
      const alreadySent = await checkSent(sb, user.email, "trial_expired");
      if (!alreadySent) {
        const subject = toolsUsed > 0
          ? `Your results are still here, ${firstName}`
          : `${firstName}, you never tried the tools`;
        const body = toolsUsed > 0
          ? `Hi ${firstName},\n\nYour trial ended, but your data is still in your account.\n\nYour scores. Your gaps. The strategic roadmap we built. It's all there — you just need to subscribe to access it again.\n\nCore: $39/month. All 15 tools, unlimited.\n\nheartwisementor.com\n\nMost physicians spend more than that on a single dinner. This is your career.\n\n— Dr. Faroqui`
          : `Hi ${firstName},\n\nYou signed up for HeartWise but your trial ended before you tried any tools.\n\nI get it — you're busy. But the career decisions you're making right now will compound for decades.\n\n5 minutes with one tool can change how you think about:\n• Whether your specialty is actually the right fit\n• Whether your contract is competitive\n• Whether your financial strategy is costing you\n\nSubscribe and try it when you're ready. $39/month, cancel anytime.\n\nheartwisementor.com\n\n— Dr. Faroqui`;
        await sendEmail(sb, user.email, subject, body, "trial_expired");
        results.push(`Sent trial_expired to ${user.email}`);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, processed: trialUsers.length, sent: results }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
});

async function checkSent(sb: ReturnType<typeof createClient>, email: string, emailType: string): Promise<boolean> {
  const { data } = await sb
    .from("messages")
    .select("id")
    .eq("to_email", email)
    .eq("type", emailType)
    .limit(1);
  return !!(data && data.length > 0);
}

async function sendEmail(sb: ReturnType<typeof createClient>, toEmail: string, subject: string, body: string, emailType: string) {
  // Store in messages table as record
  await sb.from("messages").insert([{
    user_name: "HeartWise",
    user_email: "system@heartwisementor.com",
    type: emailType,
    message: body,
    date: new Date().toISOString(),
    read: false,
    to_email: toEmail,
    from_admin: true,
    user_read: false,
  }]);

  // Try sending via Resend if key is configured
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (resendKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "HeartWise <noreply@heartwisementor.com>",
          to: [toEmail],
          subject: subject,
          text: body,
        }),
      });
    } catch (e) {
      console.error("Resend failed:", e);
    }
  }

  // Fallback: use Supabase auth admin to send (basic — no rich templates)
  // For now, the in-app message serves as the notification
}
