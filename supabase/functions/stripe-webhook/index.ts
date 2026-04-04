import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  try {
    const parts = sigHeader.split(",").reduce((acc: Record<string, string>, part: string) => {
      const [key, val] = part.split("=");
      acc[key.trim()] = val;
      return acc;
    }, {});
    const timestamp = parts["t"];
    const sig = parts["v1"];
    if (!timestamp || !sig) return false;
    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
    const expected = Array.from(new Uint8Array(sigBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return expected === sig;
  } catch (e) {
    console.error("Signature verification error:", e);
    return false;
  }
}

// Map Stripe price IDs to HeartWise tiers
const PRICE_TO_TIER: Record<string, string> = {
  "price_1TIVVHFnqN9jbLiU4shlBjq7": "student",
  "price_1TIVXpFnqN9jbLiUV24moAHu": "student",
  "price_1THHBxFnqN9jbLiUL7VqoQgw": "core",
  "price_1THHElFnqN9jbLiUhoxpf5dq": "core",
  "price_1THHFaFnqN9jbLiUPKJhkKyL": "elite",
  "price_1THHH8FnqN9jbLiUySfLWAen": "elite",
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

  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not set");
      return new Response(JSON.stringify({ error: "No webhook secret configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    const sig = req.headers.get("stripe-signature") || "";

    const valid = await verifyStripeSignature(body, sig, webhookSecret);
    if (!valid) {
      console.error("Invalid signature. Header:", sig.substring(0, 50));
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(body);
    console.log("Received event:", event.type);

    const supaUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supaUrl || !serviceKey) {
      console.error("Missing env vars. SUPABASE_URL:", !!supaUrl, "SERVICE_KEY:", !!serviceKey);
      return new Response(JSON.stringify({ error: "Missing Supabase config" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sb = createClient(supaUrl, serviceKey);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = (session.customer_email || session.customer_details?.email || "").toLowerCase();
      console.log("Checkout completed. Email:", email, "Amount:", session.amount_total);

      if (!email) {
        return new Response(JSON.stringify({ ok: true, skipped: "no email" }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // Determine tier
      let tier = "core";
      if (session.metadata?.tier) {
        tier = session.metadata.tier;
      } else if (session.amount_total) {
        const amount = session.amount_total;
        if (amount >= 150000) tier = "elite";
        else if (amount >= 19000) tier = "elite";
        else if (amount <= 1200) tier = "student";
        else tier = "core";
      }
      console.log("Determined tier:", tier);

      // Update profile
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
        console.error("Profile update error:", JSON.stringify(error));
      } else {
        console.log("Profile updated:", JSON.stringify(data));
      }

      // Log payment (non-critical, don't fail on this)
      try {
        await sb.from("messages").insert([{
          user_name: "HeartWise System",
          user_email: email,
          type: "notification",
          message: `Payment confirmed — upgraded to ${tier.toUpperCase()}. Welcome aboard!`,
          date: new Date().toISOString(),
          read: false,
          to_email: email,
          from_admin: true,
        }]);
      } catch (msgErr) {
        console.warn("Message insert failed (non-critical):", msgErr);
      }

      return new Response(JSON.stringify({ ok: true, action: "upgraded", email, tier }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      const customerId = sub.customer;

      const { data: profiles } = await sb
        .from("profiles")
        .select("id, email")
        .eq("stripe_customer_id", customerId)
        .limit(1);

      const email = profiles?.[0]?.email || "";
      if (email) {
        await sb.from("profiles").update({ tier: "free", is_trial: false }).eq("email", email);
        console.log("Subscription deleted, downgraded:", email);
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

      if (profiles?.[0]) {
        await sb.from("profiles").update({ tier }).eq("email", profiles[0].email);
        console.log("Subscription updated:", profiles[0].email, "->", tier);
      }

      return new Response(JSON.stringify({ ok: true, action: "updated", tier }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Unhandled event type:", event.type);
    return new Response(JSON.stringify({ ok: true, ignored: event.type }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : "";
    console.error("Top-level error:", msg, stack);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
