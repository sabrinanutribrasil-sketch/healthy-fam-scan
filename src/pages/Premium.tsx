import { useState } from "react";
import { Check, X, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Plan = "monthly" | "yearly";

const features: { label: string; free: boolean | string; premium: boolean | string }[] = [
  { label: "Escaneamento de notas fiscais", free: "5 / mês", premium: "Ilimitado" },
  { label: "Escaneamento de rótulos", free: "10 / mês", premium: "Ilimitado" },
  { label: "Dashboard básico", free: true, premium: true },
  { label: "Membros da família", free: "1", premium: "Até 6" },
  { label: "Gamificação básica", free: true, premium: true },
  { label: "Cardápios semanais com IA", free: false, premium: true },
  { label: "Perfil nutricional completo + evolução mensal", free: false, premium: true },
  { label: "Sugestões de troca inteligente", free: false, premium: true },
  { label: "Relatórios em PDF", free: false, premium: true },
  { label: "Receitas premium", free: false, premium: true },
  { label: "Lista de compras automática", free: false, premium: true },
  { label: "Sem anúncios", free: false, premium: true },
];

export default function Premium() {
  const [plan, setPlan] = useState<Plan>("yearly");

  const handleSubscribe = () => {
    toast.info("Checkout em breve! Pagamentos serão ativados no próximo passo.");
  };

  const price = plan === "monthly" ? "R$ 9,90" : "R$ 89,00";
  const period = plan === "monthly" ? "/mês" : "/ano";
  const savings = plan === "yearly" ? "Economize R$ 29,80" : null;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
          <Sparkles className="h-4 w-4" />
          NutriCasa Premium
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Leve sua casa a outro nível nutricional
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Desbloqueie escaneamento ilimitado, cardápios com IA e o perfil nutricional completo da sua família.
        </p>
      </header>

      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border bg-muted/40 p-1">
          <button
            onClick={() => setPlan("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              plan === "monthly" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setPlan("yearly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
              plan === "yearly" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            Anual
            <Badge variant="secondary" className="text-xs">-25%</Badge>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Free</h2>
            <p className="text-sm text-muted-foreground">Para começar e conhecer o app</p>
          </div>
          <div className="text-3xl font-bold">R$ 0<span className="text-base font-normal text-muted-foreground">/mês</span></div>
          <Button variant="outline" className="w-full" disabled>
            Seu plano atual
          </Button>
          <ul className="space-y-2 pt-4">
            {features.map((f) => (
              <li key={f.label} className="flex items-start gap-2 text-sm">
                {f.free ? (
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                )}
                <span className={f.free ? "" : "text-muted-foreground/60"}>
                  {f.label}
                  {typeof f.free === "string" && <span className="text-muted-foreground"> — {f.free}</span>}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 space-y-4 border-primary shadow-lg relative">
          <Badge className="absolute -top-3 right-6">Recomendado</Badge>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Premium
            </h2>
            <p className="text-sm text-muted-foreground">Tudo para sua família comer melhor</p>
          </div>
          <div>
            <div className="text-3xl font-bold">
              {price}<span className="text-base font-normal text-muted-foreground">{period}</span>
            </div>
            {savings && <p className="text-xs text-primary mt-1">{savings}</p>}
          </div>
          <Button className="w-full" onClick={handleSubscribe}>
            Começar teste grátis de 7 dias
          </Button>
          <ul className="space-y-2 pt-4">
            {features.map((f) => (
              <li key={f.label} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>
                  {f.label}
                  {typeof f.premium === "string" && <span className="text-muted-foreground"> — {f.premium}</span>}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Cancele a qualquer momento. Pagamento seguro processado por nosso parceiro.
      </p>
    </div>
  );
}
