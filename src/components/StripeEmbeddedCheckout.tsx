import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";

export function StripeEmbeddedCheckout({ priceId }: { priceId: string }) {
  const fetchClientSecret = async () => {
    const returnUrl = `${window.location.origin}/app/premium/confirmacao?session_id={CHECKOUT_SESSION_ID}`;
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId, returnUrl, environment: getStripeEnvironment() },
    });
    if (error || !data?.clientSecret) throw new Error(data?.error || error?.message || "Não foi possível iniciar o pagamento.");
    return data.clientSecret as string;
  };

  return (
    <div className="min-h-[520px] overflow-hidden rounded-lg border bg-card">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}