# HeartWise Membership System Spec
> Build after Stripe is live. Saved Mar 20, 2026.

## Build Order
1. Access control logic (foundational)
2. Cancel flow + reason collection
3. Locked state overlay
4. Retention logic (branching by cancel reason)
5. Pause flow (Stripe `pause_collection`)
6. Email automation (needs external email provider)

## Components

### Membership Dashboard Card
- Plan name, status, next billing date
- Buttons: Manage Membership, Upgrade Plan
- Context-aware: "Switch to Annual" only for monthly Core users

### Manage Membership Panel (Modal)
- Pause Membership
- Cancel Membership
- Switch to Annual

### Pause Flow
- Uses Stripe `pause_collection` (not cancel + re-create)
- Data saved, resume anytime, no charges while paused
- Cap: 2 pauses per year

### Cancel Intercept
- "Before you cancel — most users leave before fully using the platform"
- Options: Pause Membership / Continue Until End Date / Confirm Cancellation

### Cancel Reason Form
- Options: got_value, too_early, not_using, too_expensive, other
- Stored on user profile + Supabase

### Retention Logic
- too_early / not_using → show pause prompt + "You've used X of 16 tools"
- too_expensive → show annual option (save over $100)
- got_value → thank you + return message

### Final Cancel Screen
- "Membership canceled. Access available until {{billing_end_date}}"
- CTA: Restart Membership

### Locked State Overlay
- "Continue Your Career Strategy — Your work is saved"
- CTAs: Resume Membership / View Plans

### Access Control Logic
- trial → full access
- active → full access
- paused → block new actions, show resume prompt
- canceled + before billing_end → full access
- expired → lock all tools

### User Data Model Additions
- subscription_type, billing_cycle, status
- trial_end_date, billing_end_date
- pause_flag, pause_count (per year)
- cancel_reason
- analyses_used_this_month (resets monthly)
- last_login

### Email Automation (Dependency: email provider like Resend/SendGrid)
- Cancel follow-up: 3-5 days after cancellation
- Subject: "When you're ready again"
- Tone: low-pressure, professional
