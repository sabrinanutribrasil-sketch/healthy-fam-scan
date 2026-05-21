import { Plus, Settings, Leaf, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { familyMembers } from "@/lib/mock-data";

const Family = () => {
  return (
    <div className="p-5 space-y-5 pb-6">
      <header className="flex items-start justify-between pt-3">
        <div>
          <h1 className="text-3xl font-display">Família Silva</h1>
          <p className="text-muted-foreground text-sm">4 membros · Plano gratuito</p>
        </div>
        <Link to="/app/configuracoes" className="w-11 h-11 rounded-2xl bg-card shadow-soft flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </Link>
      </header>

      {/* Sustainability card */}
      <div className="rounded-3xl p-5 bg-card shadow-soft relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-success/10" />
        <div className="relative">
          <div className="flex items-center gap-2 text-success text-xs font-semibold uppercase tracking-wider mb-2">
            <Sprout className="w-4 h-4" /> Impacto sustentável
          </div>
          <p className="text-4xl font-display text-foreground">12,4 kg</p>
          <p className="text-sm text-muted-foreground">de CO₂ evitados este mês</p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { l: "Locais", v: "8" },
              { l: "Sazonais", v: "12" },
              { l: "Desperdício", v: "-30%" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-muted p-2.5">
                <p className="text-[10px] uppercase text-muted-foreground">{s.l}</p>
                <p className="text-base font-bold text-foreground">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Membros</h2>
          <button className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shadow-soft">
            <Plus className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
        <div className="space-y-2.5">
          {familyMembers.map((m) => (
            <div key={m.id} className="bg-card rounded-2xl p-4 shadow-soft flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-fresh flex items-center justify-center text-2xl">
                {m.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{m.name}</p>
                  <span className="text-xs text-muted-foreground">· {m.age} anos</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Leaf className="w-3 h-3 text-primary" />
                  <p className="text-xs text-muted-foreground truncate">{m.goal}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-lg font-bold text-primary">{75 + parseInt(m.id) * 4}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium */}
      <div className="rounded-3xl p-5 gradient-warm text-accent-foreground shadow-glow">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-90">NutriCasa Premium</p>
        <h3 className="text-2xl font-display mt-1 mb-1">Análises ilimitadas</h3>
        <p className="text-sm opacity-95 mb-4">Cardápios semanais com IA, relatórios completos e mais.</p>
        <button className="bg-card text-foreground px-5 py-2.5 rounded-full text-sm font-bold shadow-soft">
          Conhecer Premium
        </button>
      </div>
    </div>
  );
};

export default Family;
