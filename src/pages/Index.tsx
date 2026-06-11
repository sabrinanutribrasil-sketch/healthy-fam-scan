import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Leaf, ScanLine, Sparkles, Trophy } from "lucide-react";
import hero from "@/assets/hero-meal.jpg";

const features = [
  { icon: ScanLine, title: "Escaneie notas e rótulos", desc: "IA lê suas compras em segundos" },
  { icon: Sparkles, title: "Sugestões personalizadas", desc: "Para cada membro da família" },
  { icon: Trophy, title: "Desafios e gamificação", desc: "Saúde com leveza e diversão" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md min-h-screen relative overflow-hidden">
        {/* Hero */}
        <div className="relative h-[62vh] min-h-[480px]">
          <img src={hero} alt="Refeição saudável brasileira" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

          <div className="relative h-full flex flex-col justify-between p-6 text-primary-foreground">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-primary-foreground/15 backdrop-blur flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-semibold tracking-tight text-lg">NutriCasa</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <p className="text-sm font-medium uppercase tracking-widest opacity-80 mb-3">Nutrição inteligente</p>
              <h1 className="text-5xl font-display leading-[1.05] mb-4">
                A saúde da sua família começa no carrinho.
              </h1>
              <p className="text-base opacity-90 max-w-sm">
                Escaneie notas fiscais, descubra o que vocês comem de verdade e receba sugestões com IA.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Features */}
        <div className="px-6 pt-8 pb-6 space-y-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-card shadow-soft"
            >
              <div className="w-12 h-12 rounded-xl gradient-fresh flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground font-sans text-base">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 space-y-3">
          <Button asChild size="lg" className="w-full h-14 rounded-2xl text-base gradient-primary shadow-glow hover:opacity-95">
            <Link to="/app">Começar agora</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full h-12 rounded-2xl text-muted-foreground">
            <Link to="/login">Já tenho conta</Link>
          </Button>
        </div>

        {/* Legal footer */}
        <footer className="px-6 pb-8 pt-2 border-t border-border/50">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <Link to="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link to="/termos" className="hover:text-foreground transition-colors">Termos</Link>
            <Link to="/uso-de-dados" className="hover:text-foreground transition-colors">Dados & Suporte</Link>
          </div>
          <p className="text-center text-[10px] text-muted-foreground/60 mt-2">
            NutriCasa v1.0 · Seus dados são protegidos pela LGPD
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
