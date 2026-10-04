import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";

export default function CheckoutReturn() {
  const [params] = useSearchParams();
  const hasSession = Boolean(params.get("session_id"));
  const { isPremium, loading } = useSubscription();

  useEffect(() => {
    if (!loading && !isPremium && hasSession) {
      const timer = window.setTimeout(() => window.location.reload(), 2500);
      return () => window.clearTimeout(timer);
    }
  }, [hasSession, isPremium, loading]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 text-center">
      <div className="max-w-sm space-y-5">
        {isPremium ? (
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
        ) : (
          <LoaderCircle className="mx-auto h-14 w-14 animate-spin text-primary" />
        )}
        <h1 className="text-3xl font-bold">{isPremium ? "Premium ativado" : "Confirmando assinatura"}</h1>
        <p className="text-muted-foreground">
          {isPremium ? "Sua família já pode aproveitar todos os recursos Premium." : "O pagamento foi recebido. A liberação pode levar alguns segundos."}
        </p>
        <Button asChild className="w-full"><Link to="/app">Ir para o início</Link></Button>
      </div>
    </main>
  );
}