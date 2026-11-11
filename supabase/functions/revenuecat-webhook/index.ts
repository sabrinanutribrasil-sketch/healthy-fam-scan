import { createClient } from "npm:@supabase/supabase-js@2";

// RevenueCat (Google Play) purchases -> subscriptions table, same table Stripe uses.
const uuid = /^[0-9a-f-]{36}$/i;
const statusFor: Record<string, string> = {
  INITIAL_PURCHASE: "active", RENEWAL: "active", UNCANCELLATION: "active", PRODUCT_CHANGE: "active",
  CANCELLATION: "canceled", EXPIRATION: "expired", BILLING_ISSUE: "past_due",
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const secret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
  if (!secret || req.headers.get("Authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const e = body?.event;
  if (!e || typeof e.type !== "string") return new Response("Bad request", { status: 400 });
  let status = statusFor[e.type];
  if (!status) return Response.json({ ignored: e.type });
  if (e.period_type === "TRIAL" && status === "active") status = "trialing";
  const userId = String(e.app_user_id ?? "");
  if (!uuid.test(userId)) return Response.json({ ignored: "anonymous user" });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const productId = String(e.product_id ?? "");
  const { error } = await supabase.from("subscriptions").upsert({
    user_id: userId,
    stripe_subscription_id: `rc_${e.original_transaction_id ?? e.transaction_id}`,
    stripe_customer_id: `rc_${userId}`,
    product_id: "nutricasa_premium",
    price_id: productId.includes("year") || productId.includes("anual") ? "nutricasa_premium_yearly" : "nutricasa_premium_monthly",
    status,
    current_period_start: e.purchased_at_ms ? new Date(e.purchased_at_ms).toISOString() : null,
    current_period_end: e.expiration_at_ms ? new Date(e.expiration_at_ms).toISOString() : null,
    cancel_at_period_end: e.type === "CANCELLATION",
    environment: e.environment === "PRODUCTION" ? "live" : "sandbox",
  }, { onConflict: "stripe_subscription_id" });
  if (error) { console.error(error); return new Response("DB error", { status: 500 }); }
  return Response.json({ ok: true });
});
