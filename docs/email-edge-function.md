# HeartWise Email System — Edge Function Documentation

## Overview

HeartWise uses a Supabase Edge Function + Resend to send transactional emails. The client-side code (`js-email.js`) determines **when** to trigger emails. The Edge Function handles **rendering and delivery**.

### Email Types

| Type | Trigger | Frequency |
|------|---------|-----------|
| `welcome` | After signup | Once ever |
| `tool_complete` | First run of any tool | Once per tool, max 1/day |
| `monthly_digest` | First visit each month | Once per month |
| `deadline_reminder` | renderHome, if deadlines within 30 days | Once per week |
| `activity_ping` | Every login (silent) | Daily — no email sent |
| `reengagement` | Server-side cron (14+ days inactive) | Once per 14-day window |

### Architecture

```
Client (js-email.js)
  ↓ POST /functions/v1/send-email
Supabase Edge Function (Deno)
  ↓ Resend API
User's Inbox
```

---

## 1. Setup Instructions

### Prerequisites

- Supabase project: `kqyvfykbnboesskxovtw`
- Resend account (free tier: 100 emails/day, 3,000/month)
- Verified sending domain or use `onboarding@resend.dev` for testing

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your domain (e.g., `heartwisementor.com`) under **Domains**
3. Add DNS records (SPF, DKIM, DMARC) as instructed by Resend
4. Copy your API key from **API Keys** tab

### Step 2: Set Supabase Secrets

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref kqyvfykbnboesskxovtw

# Set the Resend API key as a secret
supabase secrets set RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Optional: set a from address
supabase secrets set EMAIL_FROM="HeartWise <hello@heartwisementor.com>"
```

### Step 3: Create the Edge Function

```bash
supabase functions new send-email
```

This creates `supabase/functions/send-email/index.ts`. Replace its contents with the code below.

---

## 2. Complete Edge Function Code

### `supabase/functions/send-email/index.ts`

```typescript
// HeartWise Email Edge Function
// Receives triggers from js-email.js, renders HTML, sends via Resend

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "HeartWise <hello@heartwisementor.com>";
const RESEND_URL = "https://api.resend.com/emails";

// ===== CORS HEADERS =====
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { type, to } = payload;

    if (!to || !type) {
      return new Response(
        JSON.stringify({ error: "Missing 'to' or 'type'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // activity_ping is silent — just log it, don't send email
    if (type === "activity_ping") {
      // In production, store this in a Supabase table for re-engagement cron
      // For now, just acknowledge
      console.log(`Activity ping: ${to}, days inactive: ${payload.daysSinceActive}`);
      return new Response(
        JSON.stringify({ ok: true, action: "ping_recorded" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build email content
    const email = buildEmail(payload);
    if (!email) {
      return new Response(
        JSON.stringify({ error: `Unknown email type: ${type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send via Resend
    const resendRes = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        subject: email.subject,
        html: email.html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return new Response(
        JSON.stringify({ error: "Email delivery failed", detail: resendData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, id: resendData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});


// ===== EMAIL BUILDER =====

interface EmailResult {
  subject: string;
  html: string;
}

function buildEmail(payload: any): EmailResult | null {
  switch (payload.type) {
    case "welcome":
      return buildWelcome(payload);
    case "tool_complete":
      return buildToolComplete(payload);
    case "monthly_digest":
      return buildMonthlyDigest(payload);
    case "deadline_reminder":
      return buildDeadlineReminder(payload);
    case "reengagement":
      return buildReengagement(payload);
    default:
      return null;
  }
}


// ===== SHARED TEMPLATE WRAPPER =====

function wrapTemplate(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HeartWise</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F5F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#2C2825;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F5F2;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

<!-- Header -->
<tr><td style="padding:32px 40px 24px;text-align:center;border-bottom:2px solid #C6A85E;">
<div style="font-size:24px;font-weight:700;color:#C6A85E;letter-spacing:0.5px;">HeartWise</div>
<div style="font-size:12px;color:#8A8278;margin-top:4px;text-transform:uppercase;letter-spacing:1.5px;">Physician Career Intelligence</div>
</td></tr>

<!-- Body -->
<tr><td style="padding:32px 40px;">
${body}
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 40px 32px;border-top:1px solid #E8E1D8;text-align:center;">
<div style="font-size:12px;color:#8A8278;line-height:1.6;">
<a href="https://heartwisementor.com" style="color:#C6A85E;text-decoration:none;">heartwisementor.com</a><br>
Career intelligence for physicians, by physicians.<br>
<span style="font-size:11px;">You're receiving this because you have a HeartWise account.</span>
</div>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
<tr><td style="background-color:#C6A85E;border-radius:8px;padding:14px 32px;">
<a href="${url}" style="color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.5px;display:inline-block;">${text}</a>
</td></tr>
</table>`;
}


// ===== INDIVIDUAL EMAIL BUILDERS =====

function buildWelcome(p: any): EmailResult {
  const name = p.name || "there";
  const stage = p.stage || "student";

  const stageContent: Record<string, { subject: string; headline: string; body: string; cta: string }> = {
    student: {
      subject: "Welcome to HeartWise — Your Match Strategy Starts Here",
      headline: "Your residency match advantage.",
      body: `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4540;">HeartWise gives you the same strategic edge that students at top programs have — data-driven match positioning, deadline tracking, and evidence-based career planning.</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4540;"><strong>Start here:</strong></p>
<ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.8;color:#4A4540;">
<li><strong>Match Probability Calculator</strong> — See where you stand against matched applicants</li>
<li><strong>Career Timeline</strong> — Every deadline from ERAS to Match Day, personalized</li>
<li><strong>Research Impact Calculator</strong> — Find the highest-ROI projects for your time</li>
</ul>`,
      cta: "Open Your Dashboard",
    },
    resident: {
      subject: "Welcome to HeartWise — Navigate Residency with Clarity",
      headline: "Residency is the foundation. Build it right.",
      body: `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4540;">Whether you're eyeing fellowship or planning your attending career, HeartWise helps you make evidence-based decisions at every step.</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4540;"><strong>Start here:</strong></p>
<ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.8;color:#4A4540;">
<li><strong>Fellowship Competitiveness Tracker</strong> — Benchmark against matched fellows</li>
<li><strong>Financial Roadmap</strong> — PSLF, retirement, disability insurance planning</li>
<li><strong>Career Timeline</strong> — Fellowship apps, ITE dates, board deadlines</li>
</ul>`,
      cta: "Open Your Dashboard",
    },
    fellow: {
      subject: "Welcome to HeartWise — From Fellowship to Attending",
      headline: "The transition to attending is the highest-stakes negotiation of your career.",
      body: `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4540;">HeartWise gives you the data and frameworks to evaluate contracts, negotiate compensation, and plan the financial transition from trainee to attending.</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4540;"><strong>Start here:</strong></p>
<ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.8;color:#4A4540;">
<li><strong>Contract Review Tool</strong> — Score and compare attending offers</li>
<li><strong>Compensation Analyzer</strong> — MGMA benchmarks for your specialty</li>
<li><strong>Financial Transition Planner</strong> — Debt, savings, insurance in one view</li>
</ul>`,
      cta: "Open Your Dashboard",
    },
    attending: {
      subject: "Welcome to HeartWise — Career Intelligence for Attendings",
      headline: "You've arrived. Now optimize.",
      body: `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4540;">HeartWise helps practicing physicians benchmark compensation, review contracts, and build long-term financial strategies grounded in real data.</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4540;"><strong>Start here:</strong></p>
<ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.8;color:#4A4540;">
<li><strong>Compensation Analyzer</strong> — Are you being paid fairly?</li>
<li><strong>Contract Review Tool</strong> — Evaluate renewal terms and negotiate</li>
<li><strong>Wealth Building Dashboard</strong> — Retirement, investments, insurance</li>
</ul>`,
      cta: "Open Your Dashboard",
    },
  };

  const content = stageContent[stage] || stageContent.student;

  const html = wrapTemplate(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#2C2825;">Welcome, Dr. ${name}.</h1>
<p style="margin:0 0 24px;font-size:16px;color:#C6A85E;font-weight:600;">${content.headline}</p>
${content.body}
${ctaButton(content.cta, "https://heartwisementor.com")}
<p style="margin:24px 0 0;font-size:13px;color:#8A8278;line-height:1.6;text-align:center;">Have questions? Reply to this email — a real physician reads every message.</p>
`);

  return { subject: content.subject, html };
}


function buildToolComplete(p: any): EmailResult {
  const name = p.name || "there";
  const toolName = p.toolName || "a career tool";
  const score = p.score;

  let nextSteps = `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4540;">Now that you've completed <strong>${toolName}</strong>, here's how to get the most from your results:</p>
<ol style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.8;color:#4A4540;">
<li>Review your personalized recommendations on the results page</li>
<li>Check your Career Timeline for related upcoming deadlines</li>
<li>Run complementary tools to build a complete career profile</li>
</ol>`;

  if (score !== null && score !== undefined) {
    nextSteps += `<div style="background:#F7F5F2;border-left:3px solid #C6A85E;padding:16px 20px;border-radius:0 8px 8px 0;margin:16px 0;">
<div style="font-size:12px;color:#8A8278;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Your Score</div>
<div style="font-size:28px;font-weight:700;color:#2C2825;">${score}<span style="font-size:14px;color:#8A8278;">/100</span></div>
</div>`;
  }

  const html = wrapTemplate(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#2C2825;">Results Ready, Dr. ${name}.</h1>
<p style="margin:0 0 24px;font-size:14px;color:#8A8278;">You just completed: ${toolName}</p>
${nextSteps}
${ctaButton("View Full Results", "https://heartwisementor.com")}
`);

  return {
    subject: `Your ${toolName} Results Are Ready`,
    html,
  };
}


function buildMonthlyDigest(p: any): EmailResult {
  const name = p.name || "there";
  const month = p.month || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const toolRuns = p.toolRuns || 0;
  const toolsUsed = p.toolsUsed || [];
  const lastMatchScore = p.lastMatchScore;
  const upcomingDeadlines = p.upcomingDeadlines || 0;

  let statsHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
<tr>
<td width="33%" style="text-align:center;padding:16px 8px;background:#F7F5F2;border-radius:8px 0 0 8px;">
<div style="font-size:28px;font-weight:700;color:#C6A85E;">${toolRuns}</div>
<div style="font-size:11px;color:#8A8278;text-transform:uppercase;letter-spacing:1px;">Tools Run</div>
</td>
<td width="34%" style="text-align:center;padding:16px 8px;background:#F7F5F2;">
<div style="font-size:28px;font-weight:700;color:#C6A85E;">${toolsUsed.length}</div>
<div style="font-size:11px;color:#8A8278;text-transform:uppercase;letter-spacing:1px;">Unique Tools</div>
</td>
<td width="33%" style="text-align:center;padding:16px 8px;background:#F7F5F2;border-radius:0 8px 8px 0;">
<div style="font-size:28px;font-weight:700;color:#C6A85E;">${upcomingDeadlines}</div>
<div style="font-size:11px;color:#8A8278;text-transform:uppercase;letter-spacing:1px;">Deadlines (30d)</div>
</td>
</tr>
</table>`;

  if (lastMatchScore !== null && lastMatchScore !== undefined) {
    statsHtml += `<div style="background:#F7F5F2;border-left:3px solid #C6A85E;padding:16px 20px;border-radius:0 8px 8px 0;margin:16px 0;">
<div style="font-size:12px;color:#8A8278;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Latest Match Score</div>
<div style="font-size:28px;font-weight:700;color:#2C2825;">${lastMatchScore}<span style="font-size:14px;color:#8A8278;">/100</span></div>
<div style="font-size:13px;color:#4A4540;margin-top:4px;">Re-run the calculator to track your progress over time.</div>
</div>`;
  }

  let deadlineNote = "";
  if (upcomingDeadlines > 0) {
    deadlineNote = `<p style="margin:16px 0;font-size:14px;line-height:1.7;color:#4A4540;background:#FFF8ED;padding:12px 16px;border-radius:8px;border:1px solid #E8D9B8;">You have <strong>${upcomingDeadlines} deadline${upcomingDeadlines > 1 ? "s" : ""}</strong> coming up in the next 30 days. Open your Career Timeline to review them.</p>`;
  }

  const html = wrapTemplate(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#2C2825;">Your Monthly Report</h1>
<p style="margin:0 0 24px;font-size:14px;color:#8A8278;">${month} — Dr. ${name}</p>
${statsHtml}
${deadlineNote}
<p style="margin:16px 0;font-size:15px;line-height:1.7;color:#4A4540;">Consistency drives outcomes. Even 10 minutes a month with HeartWise keeps you ahead of deadlines and on track for your career goals.</p>
${ctaButton("Open Dashboard", "https://heartwisementor.com")}
`);

  return {
    subject: `Your HeartWise Monthly Report — ${month}`,
    html,
  };
}


function buildDeadlineReminder(p: any): EmailResult {
  const name = p.name || "there";
  const deadlines = p.deadlines || [];

  let deadlineRows = "";
  for (const dl of deadlines) {
    const urgencyColor = dl.urgency === "critical" ? "#B85C5C" : "#C6A85E";
    const urgencyLabel = dl.urgency === "critical" ? "CRITICAL" : "UPCOMING";
    deadlineRows += `<tr>
<td style="padding:16px 0;border-bottom:1px solid #E8E1D8;">
<div style="display:flex;align-items:flex-start;">
<div style="flex:1;">
<div style="font-size:11px;font-weight:700;color:${urgencyColor};text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${urgencyLabel} — ${dl.daysAway} day${dl.daysAway !== 1 ? "s" : ""} away</div>
<div style="font-size:15px;font-weight:600;color:#2C2825;margin-bottom:4px;">${dl.title}</div>
<div style="font-size:13px;color:#4A4540;line-height:1.5;">${dl.desc}</div>
</div>
</div>
</td>
</tr>`;
  }

  const html = wrapTemplate(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#2C2825;">Deadline Alert</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4A4540;">Dr. ${name}, you have important deadlines approaching. Here's what needs your attention:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${deadlineRows}
</table>
<p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:#4A4540;">Open HeartWise to see your full timeline and take action on each deadline.</p>
${ctaButton("View Career Timeline", "https://heartwisementor.com")}
`);

  return {
    subject: `Deadline Approaching: ${deadlines[0]?.title || "Action Required"}`,
    html,
  };
}


function buildReengagement(p: any): EmailResult {
  const name = p.name || "there";
  const daysSince = p.daysSinceActive || 14;

  const html = wrapTemplate(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#2C2825;">Your Career Doesn't Pause</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4540;">Dr. ${name}, it's been ${daysSince} days since your last HeartWise session. Deadlines and opportunities don't wait — here's what may have changed:</p>
<ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.8;color:#4A4540;">
<li>New deadlines may have entered your 30-day window</li>
<li>Your Career Timeline has been updated with the latest dates</li>
<li>Your tools are ready for a fresh run with updated data</li>
</ul>
<div style="background:#F7F5F2;padding:20px;border-radius:8px;margin:16px 0;text-align:center;">
<div style="font-size:14px;color:#4A4540;margin-bottom:4px;">A 5-minute check-in now can save you weeks of scrambling later.</div>
</div>
${ctaButton("Open HeartWise", "https://heartwisementor.com")}
<p style="margin:24px 0 0;font-size:13px;color:#8A8278;line-height:1.6;text-align:center;">If you no longer wish to receive these reminders, simply reply "unsubscribe."</p>
`);

  return {
    subject: "Your Career Deadlines May Have Changed",
    html,
  };
}
```

---

## 3. Deployment Steps

### Deploy the Edge Function

```bash
# From your project root (where supabase/ directory lives)
cd /path/to/heartwise

# Deploy the function
supabase functions deploy send-email --no-verify-jwt

# The --no-verify-jwt flag allows the anon key to call the function.
# The client already sends the apikey header for authentication.
```

### Verify Deployment

```bash
# Test with curl
curl -X POST \
  'https://kqyvfykbnboesskxovtw.supabase.co/functions/v1/send-email' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_ANON_KEY' \
  -d '{
    "type": "welcome",
    "to": "test@example.com",
    "name": "Test",
    "stage": "student"
  }'
```

### Include js-email.js in index.html

Add the script tag **after** `js-app.js` and `js-timeline.js`:

```html
<script src="src/js-timeline.js"></script>
<script src="src/js-email.js"></script>
```

### Add Integration Hooks

In `js-app.js`, add these calls at the appropriate points:

```javascript
// After signup completes (near line ~1621, after U is set):
hwEmailWelcome(U);

// In renderHome() (near line ~3779, after U check):
if (U && U.email) {
  hwEmailReengagement(U);
  hwEmailMonthlyDigest(U);
  hwEmailDeadlineReminder(U);
}

// After any tool completes with a score:
hwEmailToolComplete(U, toolName, score);
```

---

## 4. Re-engagement Cron (Future)

The `activity_ping` type records user activity server-side. To send actual re-engagement emails to inactive users:

1. Create a Supabase table `email_activity_log`:
   ```sql
   CREATE TABLE email_activity_log (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email TEXT NOT NULL,
     last_ping TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     days_since_active INT DEFAULT 0,
     reengagement_sent_at TIMESTAMPTZ
   );
   CREATE INDEX idx_email_activity_email ON email_activity_log(email);
   ```

2. Update the Edge Function's `activity_ping` handler to upsert into this table.

3. Create a separate Edge Function or pg_cron job that:
   - Queries users where `last_ping < NOW() - INTERVAL '14 days'`
   - And `reengagement_sent_at IS NULL OR reengagement_sent_at < NOW() - INTERVAL '14 days'`
   - Sends the re-engagement email via Resend
   - Updates `reengagement_sent_at`

This ensures re-engagement emails go to users who **stopped** visiting, not those who visit regularly.

---

## 5. Email Design Principles

- **From:** `HeartWise <hello@heartwisementor.com>`
- **Brand color:** `#C6A85E` (gold)
- **Background:** `#F7F5F2` (warm off-white)
- **Text:** `#2C2825` (dark charcoal)
- **Secondary text:** `#8A8278` (warm gray)
- **Accent background:** `#F7F5F2` (stat blocks)
- **Critical/urgent:** `#B85C5C` (muted red)
- **Success/positive:** `#5E8B6F` (sage green)
- **No emojis** in subject lines
- **Professional physician tone** — authoritative but not condescending
- **Mobile-first** — max-width 600px, 40px padding collapses gracefully
- **Inline CSS only** — email client compatibility
- **Table-based layout** — for Outlook/Gmail rendering

---

## 6. Monitoring

### Resend Dashboard

Monitor delivery rates, opens, and bounces at [resend.com/emails](https://resend.com/emails).

### Edge Function Logs

```bash
supabase functions logs send-email --follow
```

### Rate Limits

- Resend free tier: 100 emails/day, 3,000/month
- Client-side caps: max 1 email per type per day, max 3 emails per week per user
- Expected volume: With ~50 active users, roughly 10-30 emails/day
