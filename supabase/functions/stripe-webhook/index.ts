import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

function verifyStripeSignature(payload: string, sigHeader: string, secret: string): boolean {
  const parts = sigHeader.split(",").reduce((acc: Record<string, string>, part: string) => {
    const [key, val] = part.split("=");
    acc[key.trim()] = val;
    return acc;
  }, {});
  const timestamp = parts["t"];
  const sig = parts["v1"];
  if (!timestamp || !sig) return false;
  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");
  return expected === sig;
}

// Map Stripe price IDs to HeartWise tiers
const PRICE_TO_TIER: Record<string, string> = {
  "price_1THHBxFnqN9jbLiUL7VqoQgw": "core",
  "price_1THHElFnqN9jbLiUhoxpf5dq": "core",
  "price_1THHFaFnqN9jbLiUPKJhkKyL": "elite",
  "price_1THHH8FnqN9jbLiUySfLWAen": "elite", // Strategic Intensive gets elite access
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, stripe-signature",
      },
    });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    return new Response(JSON.stringify({ error: "No webhook secret configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  if (!verifyStripeSignature(body, sig, webhookSecret)) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const event = JSON.parse(body);
  const supaUrl = Deno.env.get("SUPABASE_URL") || "https://kqyvfykbnboesskxovtw.supabase.co";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) {
    return new Response(JSON.stringify({ error: "No service key" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const sb = createClient(supaUrl, serviceKey);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = (session.customer_email || session.customer_details?.email || "").toLowerCase();
      if (!email) {
        return new Response(JSON.stringify({ ok: true, skipped: "no email" }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // Determine tier from line items price
      let tier = "core"; // default
      if (session.metadata?.tier) {
        tier = session.metadata.tier;
      } else if (session.amount_total) {
        const amount = session.amount_total; // in cents
        if (amount >= 150000) tier = "elite"; // $1,500 intensive
        else if (amount >= 19000) tier = "elite"; // $199/mo mentorship
        else tier = "core"; // $39/mo or $350/yr
      }

      // Update profile tier
      const { data, error } = await sb
        .from("profiles")
        .update({
          tier: tier,
          is_trial: false,
          stripe_customer_id: session.customer || null,
          paid_at: new Date().toISOString(),
        })
        .eq("email", email)
        .select("id, email, tier");

      if (error) {
        console.error("Profile update failed:", error);
      }

      // Log the payment event
      await sb.from("messages").insert([{
        user_name: "HeartWise System",
        user_email: "system@heartwisementor.com",
        type: "notification",
        message: `Payment confirmed — upgraded to ${tier.toUpperCase()}. Welcome aboard!`,
        date: new Date().toISOString(),
        read: false,
        to_email: email,
        from_admin: true,
        user_read: false,
      }]).catch(() => {});

      return new Response(JSON.stringify({ ok: true, action: "upgraded", email, tier, data }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      const customerId = sub.customer;

      // Find user by stripe customer ID or email
      let email = "";
      const { data: profiles } = await sb
        .from("profiles")
        .select("id, email")
        .eq("stripe_customer_id", customerId)
        .limit(1);

      if (profiles && profiles.length > 0) {
        email = profiles[0].email;
      }

      if (email) {
        await sb
          .from("profiles")
          .update({ tier: "free", is_trial: false })
          .eq("email", email);

        // Notify user
        await sb.from("messages").insert([{
          user_name: "HeartWise System",
          user_email: "system@heartwisementor.com",
          type: "notification",
          message: "Your subscription has ended. You can resubscribe anytime to regain full access.",
          date: new Date().toISOString(),
          read: false,
          to_email: email,
          from_admin: true,
          user_read: false,
        }]).catch(() => {});
      }

      return new Response(JSON.stringify({ ok: true, action: "downgraded", email }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object;
      const customerId = sub.customer;
      const priceId = sub.items?.data?.[0]?.price?.id || "";
      const tier = PRICE_TO_TIER[priceId] || "core";

      const { data: profiles } = await sb
        .from("profiles")
        .select("id, email")
        .eq("stripe_customer_id", customerId)
        .limit(1);

      if (profiles && profiles.length > 0) {
        await sb
          .from("profiles")
          .update({ tier: tier })
          .eq("email", profiles[0].email);
      }

      return new Response(JSON.stringify({ ok: true, action: "updated", tier }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Unhandled event type
    return new Response(JSON.stringify({ ok: true, ignored: event.type }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Webhook error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
