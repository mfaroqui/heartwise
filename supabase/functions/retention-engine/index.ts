import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Retention engine — called by pg_cron
// Handles: goal nudges, score refresh prompts, weekly insights, peer benchmarking, seasonal triggers

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey" },
    });
  }

  try {
    const supaUrl = Deno.env.get("SUPABASE_URL") || "https://kqyvfykbnboesskxovtw.supabase.co";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey) return jsonResp({ error: "No service key" }, 500);

    const sb = createClient(supaUrl, serviceKey);
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0=Sun
    const month = now.getUTCMonth(); // 0=Jan
    const results: Record<string, unknown>[] = [];

    // Get all active users (non-free, or free with recent signup)
    const { data: users, error } = await sb
      .from("profiles")
      .select("id, name, email, stage, specialty, goal, score, tier, trial_end, signup_date, profile_data, created_at")
      .neq("tier", "disabled");

    if (error || !users) return jsonResp({ error: error?.message || "No users" }, 500);

    for (const user of users) {
      if (!user.email) continue;
      const daysSinceSignup = Math.floor((now.getTime() - new Date(user.created_at || user.signup_date).getTime()) / 86400000);
      const emails: { subject: string; html: string; reason: string }[] = [];

      // ========== 1. GOAL TRACKER NUDGES ==========
      // Send on Mondays for core/elite users
      if (dayOfWeek === 1 && (user.tier === "core" || user.tier === "elite" || user.tier === "admin")) {
        const goalNudge = getGoalNudge(user);
        if (goalNudge) emails.push(goalNudge);
      }

      // ========== 2. SCORE REFRESH PROMPTS ==========
      // Every 30 days after signup, prompt a profile refresh
      if (daysSinceSignup > 0 && daysSinceSignup % 30 === 0 && user.tier !== "free") {
        emails.push({
          reason: "score_refresh",
          subject: "Your HeartWise scores are " + daysSinceSignup + " days old — time to refresh?",
          html: buildEmail(user.name, [
            "Your career profile is <strong>" + daysSinceSignup + " days old</strong>. A lot can change in a month — new publications, updated scores, new opportunities.",
            "Physicians who update their profile monthly are <strong>3x more likely</strong> to catch competitive gaps before they become problems.",
            "Take 2 minutes to refresh your scores and see what's changed."
          ], "Update My Profile →", "https://www.heartwisementor.com/"),
        });
      }

      // ========== 3. WEEKLY STRATEGIC INSIGHT ==========
      // Wednesday emails for all non-free users
      if (dayOfWeek === 3 && user.tier !== "free") {
        const insight = getWeeklyInsight(user, now);
        if (insight) emails.push(insight);
      }

      // ========== 5. SEASONAL TRIGGERS ==========
      // Academic calendar-based nudges
      const seasonal = getSeasonalTrigger(user, month, now.getUTCDate());
      if (seasonal) emails.push(seasonal);

      // Send all emails for this user
      for (const email of emails) {
        try {
          await sendEmail(email.subject, email.html, user.email, user.name);
          results.push({ email: user.email, reason: email.reason, sent: true });
        } catch (e) {
          results.push({ email: user.email, reason: email.reason, sent: false, error: String(e) });
        }
      }
    }

    // ========== 4. PEER BENCHMARKING (computed, stored for client) ==========
    await updatePeerBenchmarks(sb, users);

    return jsonResp({ success: true, processed: users.length, emailsSent: results.filter(r => r.sent).length, results });
  } catch (err: unknown) {
    return jsonResp({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

// ===== EMAIL BUILDER =====
function buildEmail(name: string, paragraphs: string[], ctaText: string, ctaUrl: string): string {
  const firstName = (name || "Doctor").split(" ")[0];
  return `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px">
    <div style="background:#0a0a0f;padding:24px 28px;border-radius:12px 12px 0 0">
      <div style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#c8a87c;letter-spacing:1px">HEARTWISE</div>
    </div>
    <div style="padding:28px;background:#faf8f5;border-left:1px solid #e8e4de;border-right:1px solid #e8e4de">
      <div style="font-size:16px;color:#2a2520;margin-bottom:16px">Dr. ${firstName},</div>
      ${paragraphs.map(p => `<p style="font-size:14px;line-height:1.7;color:#3d362c;margin:0 0 14px">${p}</p>`).join("")}
      <a href="${ctaUrl}" style="display:inline-block;margin-top:8px;padding:14px 28px;background:linear-gradient(135deg,#c8a87c,#d4b88a);color:#0a0a0f;text-decoration:none;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:.3px">${ctaText}</a>
    </div>
    <div style="padding:16px 28px;background:#f0ece6;border-radius:0 0 12px 12px;border:1px solid #e8e4de;border-top:none">
      <p style="font-size:11px;color:#8a857e;margin:0">HeartWise — Physician-Built Career Intelligence · <a href="https://www.heartwisementor.com" style="color:#c8a87c">heartwisementor.com</a></p>
    </div>
  </div>`;
}

// ===== GOAL NUDGES =====
function getGoalNudge(user: Record<string, unknown>): { subject: string; html: string; reason: string } | null {
  const stage = (user.stage as string) || "resident";
  const goal = (user.goal as string) || "";
  const name = (user.name as string) || "Doctor";

  const nudges: Record<string, string[]> = {
    student: [
      "Have you identified a research mentor this month?",
      "When's the last time you shadowed a physician in your target specialty?",
      "Your Step 1 prep — on track or slipping? Be honest with yourself.",
    ],
    resident: [
      "How many publications do you have in progress right now?",
      "Have you reached out to a fellowship program director this month?",
      "Your competitiveness score — has it improved since last month?",
    ],
    fellow: [
      "Have you started reviewing contract templates for your upcoming job search?",
      "What's your financial plan for the attending transition?",
      "Have you modeled your expected compensation in the Financial Simulator?",
    ],
    attending: [
      "When's the last time you reviewed your disability insurance coverage?",
      "Have you checked your savings rate this month — are you hitting 20%+?",
      "Is your current role still aligned with your 5-year goals?",
    ],
  };

  const options = nudges[stage] || nudges.resident;
  const pick = options[Math.floor(Math.random() * options.length)];

  return {
    reason: "goal_nudge",
    subject: "Quick check-in: " + pick,
    html: buildEmail(name, [
      pick,
      "Your HeartWise goal tracker is waiting. <strong>Small weekly actions compound into career-defining advantages.</strong>",
      "Log in, check off what you've done, and see what's next.",
    ], "Check My Goals →", "https://www.heartwisementor.com/"),
  };
}

// ===== WEEKLY INSIGHTS =====
function getWeeklyInsight(user: Record<string, unknown>, now: Date): { subject: string; html: string; reason: string } | null {
  const stage = (user.stage as string) || "resident";
  const spec = (user.specialty as string) || "your specialty";
  const goal = (user.goal as string) || "";
  const week = Math.floor(now.getTime() / (7 * 86400000)); // Deterministic weekly rotation

  const insights: Record<string, { subject: string; paragraphs: string[] }[]> = {
    student: [
      { subject: "The #1 thing that separates matched from unmatched", paragraphs: ["Research output is the single strongest modifiable predictor of matching into competitive specialties. Not just quantity — <strong>quality and narrative coherence matter more.</strong>", "This week: Identify one case from your clinical rotations that could become a case report. That's how it starts."] },
      { subject: "Your Step score matters less than you think", paragraphs: ["With Step 1 now pass/fail, program directors are looking at <strong>clinical evaluations, research, and letters</strong> more than ever.", "Use the Match Competitiveness Calculator to see where your real gaps are — they're probably not where you think."] },
      { subject: "The mentor email that actually gets a response", paragraphs: ["Keep it under 4 sentences. Be specific about what you want. Reference their recent work. Suggest a concrete next step.", "\"I read your paper on X in Y journal. I'm a [year] student interested in Z. Would you have 15 minutes to discuss potential research opportunities?\" — That's it."] },
      { subject: "Building your application narrative", paragraphs: ["Every competitive applicant has a <strong>story</strong> — research, clinical interests, and personal statement all point in the same direction.", "This week: Write one sentence that connects your research to your specialty choice. That's the backbone of your personal statement."] },
    ],
    resident: [
      { subject: "What fellowship PDs actually care about", paragraphs: ["Publications, letters from people they know, and evidence you've thought deeply about why " + spec + ". <strong>In that order.</strong>", "Run your profile through the Match Calculator this week. See exactly where you stand."] },
      { subject: "The networking move most residents miss", paragraphs: ["Don't just network at conferences. <strong>Follow up within 48 hours with something specific.</strong> 'It was great meeting you at ACC — your point about X resonated because...'", "One genuine connection beats 50 business cards. Use the Career Strategy Builder to map your network gaps."] },
      { subject: "Your financial decisions NOW impact the next 30 years", paragraphs: ["The difference between starting to invest during residency vs. waiting until attending: <strong>potentially $1-2M+ over a career.</strong>", "Even $500/month in a Roth IRA during training compounds dramatically. Model it in the Financial Trajectory Simulator."] },
      { subject: "Board prep strategy that actually works", paragraphs: ["Spaced repetition > marathon cramming. The data is overwhelming on this.", "This week: Set up a 20-minute daily review habit. Consistency beats intensity every time."] },
    ],
    fellow: [
      { subject: "Your first contract is a $2M+ decision", paragraphs: ["The difference between a well-negotiated and poorly-negotiated first attending contract compounds to <strong>$2-5M over a career.</strong>", "Start reviewing contract templates now — not when you're under pressure to sign. The Financial Simulator can model different scenarios."] },
      { subject: "The attending transition nobody prepares you for", paragraphs: ["Going from $65K to $400K+ sounds great until you realize <strong>taxes, insurance, loans, and lifestyle inflation</strong> can eat most of it.", "Build your financial plan now, while you're still in the mindset of living on less. Model it in HeartWise."] },
      { subject: "Academic vs private — the real math", paragraphs: ["It's not just salary. Factor in: call burden, research time, partnership track, benefits value, non-compete radius, and <strong>quality of life.</strong>", "Use the Career Strategy Builder to map both paths with actual numbers, not assumptions."] },
      { subject: "Negotiation leverage you don't know you have", paragraphs: ["Sign-on bonus, relocation, loan repayment, CME budget, research days, tail coverage — <strong>these are all negotiable.</strong>", "Most new attendings leave $50-100K on the table because they don't know what to ask for."] },
    ],
    attending: [
      { subject: "The physician wealth gap is real", paragraphs: ["Physicians who follow a structured financial plan accumulate <strong>3-5x more wealth</strong> than those who don't. It's not about income — it's about strategy.", "When's the last time you ran your numbers in the Financial Trajectory Simulator?"] },
      { subject: "Burnout isn't weakness — it's a systems problem", paragraphs: ["54% of physicians report burnout symptoms. The ones who recover share a pattern: <strong>they made structural changes, not just mindset shifts.</strong>", "Use the Burnout & Lifestyle Simulator to model what changes would actually move the needle for you."] },
      { subject: "Your contract renewal is a second negotiation", paragraphs: ["Most physicians passively accept renewal terms. But you have <strong>more leverage now than when you were hired</strong> — you have a track record, patients, and referral relationships.", "Review your current terms. Are you being compensated fairly for your actual wRVU production?"] },
      { subject: "Tax strategy is the highest-ROI financial move", paragraphs: ["Proper tax planning can save a physician <strong>$50-100K+ annually.</strong> Retirement account optimization, entity structure, charitable giving strategy.", "This isn't DIY territory. But understanding the landscape makes you a better client for your advisor."] },
    ],
  };

  const options = insights[stage] || insights.resident;
  const idx = week % options.length;
  const insight = options[idx];

  return {
    reason: "weekly_insight",
    subject: insight.subject,
    html: buildEmail((user.name as string) || "Doctor", insight.paragraphs, "Open HeartWise →", "https://www.heartwisementor.com/"),
  };
}

// ===== SEASONAL TRIGGERS =====
function getSeasonalTrigger(user: Record<string, unknown>, month: number, day: number): { subject: string; html: string; reason: string } | null {
  const stage = (user.stage as string) || "resident";
  // Only send on the 1st of relevant months
  if (day !== 1) return null;

  const triggers: { month: number; stages: string[]; subject: string; paragraphs: string[] }[] = [
    { month: 8, stages: ["student", "resident"], subject: "ERAS opens this month — are you ready?", paragraphs: ["September is application season. Your personal statement, CV, and letter writers should be locked in by now.", "If they're not: don't panic, but <strong>move fast.</strong> Run your competitiveness score to see where you stand."] },
    { month: 0, stages: ["student", "resident"], subject: "Interview season is here — make every one count", paragraphs: ["The rank list decision is the most important choice you'll make this year. Don't just go by 'vibes.'", "Use structured frameworks to evaluate each program. The Career Strategy Builder can help you compare systematically."] },
    { month: 2, stages: ["student", "resident"], subject: "Match week — whatever happens, you have a plan", paragraphs: ["Whether you matched your #1 or your safety, <strong>the next 3 months set the trajectory</strong> for the rest of your career.", "Log in to HeartWise and start building your post-match action plan."] },
    { month: 3, stages: ["fellow", "attending"], subject: "Contract season — don't sign anything without modeling it first", paragraphs: ["Spring is when most attending contracts are offered. The excitement of a new job makes it easy to overlook red flags.", "Run every offer through the Financial Simulator before you sign. <strong>One overlooked clause can cost you six figures.</strong>"] },
    { month: 5, stages: ["attending"], subject: "Mid-year financial check — are you on track?", paragraphs: ["Halfway through the year. Are you maxing your retirement accounts? Is your savings rate where it should be?", "A 5-minute check now prevents a painful December surprise. Open the Financial Trajectory Simulator."] },
    { month: 11, stages: ["attending"], subject: "Year-end tax moves — don't leave money on the table", paragraphs: ["December is your last chance for: charitable giving deductions, tax-loss harvesting, retirement account contributions, and HSA maxing.", "Model your year-end strategy in HeartWise before the window closes."] },
  ];

  const match = triggers.find(t => t.month === month && t.stages.includes(stage));
  if (!match) return null;

  return {
    reason: "seasonal_" + month,
    subject: match.subject,
    html: buildEmail((user.name as string) || "Doctor", match.paragraphs, "Open HeartWise →", "https://www.heartwisementor.com/"),
  };
}

// ===== PEER BENCHMARKING =====
async function updatePeerBenchmarks(sb: ReturnType<typeof createClient>, users: Record<string, unknown>[]) {
  // Calculate benchmarks by stage and specialty
  const benchmarks: Record<string, { count: number; avgScore: number; scores: number[] }> = {};

  for (const user of users) {
    const stage = (user.stage as string) || "unknown";
    const spec = (user.specialty as string) || "unknown";
    const score = (user.score as number) || 0;
    const key = stage + "_" + spec;

    if (!benchmarks[key]) benchmarks[key] = { count: 0, avgScore: 0, scores: [] };
    benchmarks[key].count++;
    benchmarks[key].scores.push(score);
  }

  // Calculate averages and percentiles
  for (const key of Object.keys(benchmarks)) {
    const b = benchmarks[key];
    b.avgScore = Math.round(b.scores.reduce((a, b) => a + b, 0) / b.scores.length);
    b.scores.sort((a, b) => a - b);
  }

  // Store benchmarks in a simple table or as a JSON object
  // For now, store as a message that the client can read
  try {
    // Upsert a benchmark record
    await sb.from("messages").insert([{
      user_name: "System",
      user_email: "system@heartwise",
      type: "benchmark",
      message: JSON.stringify(benchmarks),
      read: true,
      date: new Date().toISOString(),
    }]);
  } catch (e) {
    console.warn("Benchmark store failed:", e);
  }
}

// ===== HELPERS =====
async function sendEmail(subject: string, html: string, to: string, name: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer re_Wzrmyu7Y_3uL6Ks2gh6mESGecy2GJj8Mo",
    },
    body: JSON.stringify({
      from: "HeartWise <noreply@heartwisementor.com>",
      to: to,
      subject: subject,
      html: html,
    }),
  });
  if (!res.ok) throw new Error("Email send failed: " + res.status);
  return res.json();
}

function jsonResp(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
