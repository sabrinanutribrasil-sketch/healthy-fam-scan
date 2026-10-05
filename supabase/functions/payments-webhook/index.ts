import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";

const backendUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!backendUrl || !serviceRoleKey) throw new Error("Backend is not configured");
const backend = createClient(backendUrl, serviceRoleKey);

function subscriptionRow(subscription: any, environment: StripeEnv) {
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.lookup_key || item?.price?.metadata?.lovable_external_id || item?.price?.id;
  const product = item?.price?.product;
  const productId = typeof product === "string" ? product : product?.id;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  return {
    user_id: subscription.metadata?.userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
    product_id: productId,
    price_id: priceId,
    status: subscription.status,
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    environment,
    updated_at: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const rawEnvironment = new URL(req.url).searchParams.get("env");
  if (rawEnvironment !== "sandbox" && rawEnvironment !== "live") {
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), { status: 200 });
  }

  try {
    const event = await verifyWebhook(req, rawEnvironment);
    if (["customer.subscription.created", "customer.subscription.updated", "subscription.created", "subscription.updated"].includes(event.type)) {
      const row = subscriptionRow(event.data.object, rawEnvironment);
      if (!row.user_id || !row.price_id || !row.product_id || !row.stripe_customer_id) {
        throw new Error("Subscription is missing required metadata");
      }
      const { error } = await backend.from("subscriptions").upsert(row, { onConflict: "stripe_subscription_id" });
      if (error) throw error;
    } else if (["customer.subscription.deleted", "customer.subscription.canceled", "subscription.deleted", "subscription.canceled"].includes(event.type)) {
      const { error } = await backend
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", event.data.object.id)
        .eq("environment", rawEnvironment);
      if (error) throw error;
    }
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Webhook error", error);
    return new Response("Webhook error", { status: 400 });
  }
});