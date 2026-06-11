import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, TrendingUp, TrendingDown, Award, Leaf, AlertTriangle, Apple } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { consumptionData, nutrientPie, familyMembers } from "@/lib/mock-data";

const radarData = [
  { dim: "Frutas", v: 78 },
  { dim: "Vegetais", v: 82 },
  { dim: "Proteínas", v: 70 },
  { dim: "Integrais", v: 65 },
  { dim: "Hidratação", v: 88 },
  { dim: "Naturais", v: 74 },
];

const novaData = [
  { label: "NOVA 1", desc: "In natura", value: 42, color: "hsl(var(--success))" },
  { label: "NOVA 2", desc: "Ingredientes culinários", value: 18, color: "hsl(150 45% 55%)" },
  { label: "NOVA 3", desc: "Processados", value: 25, color: "hsl(38 80% 55%)" },
  { label: "NOVA 4", desc: "Ultraprocessados", value: 15, color: "hsl(var(--destructive))" },
];

const monthlySpend = [
  { month: "Jan", saudavel: 480, processado: 620 },
  { month: "Fev", saudavel: 540, processado: 580 },
  { month: "Mar", saudavel: 610, processado: 510 },
  { month: "Abr", saudavel: 690, processado: 440 },
  { month: "Mai", saudavel: 760, processado: 380 },
];

const highlights = [
  { icon: TrendingUp, label: "Maior alta", v: "Frutas frescas", delta: "+24%", tone: "text-success bg-success/10" },
  { icon: TrendingDown, label: "Maior queda", v: "Refrigerantes", delta: "-31%", tone: "text-destructive bg-destructive/10" },
  { icon: Award, label: "Membro destaque", v: "Sofia", delta: "92 pts", tone: "text-accent bg-accent/10" },
];

const NutritionProfile = () => {
  return (
    <div className="p-5 space-y-6">
      <header className="flex items-center gap-3 pt-3">
        <Link
          to="/app"
          className="w-10 h-10 rounded-2xl bg-card shadow-soft flex items-center justify-center"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-xs text-muted-foreground">Análise detalhada</p>
          <h1 className="text-2xl font-display leading-tight">Perfil nutricional da casa</h1>
        </div>
      </header>

      {/* Score */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl gradient-primary p-6 text-primary-foreground shadow-glow"
      >
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-primary-foreground/10" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Pontuação geral
          </div>
          <div className="flex items-end gap-3">
            <span className="text-7xl font-display leading-none">82</span>
            <div className="mb-2">
              <p className="text-sm opacity-80">/ 100</p>
              <p className="text-xs font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +7 vs. mês anterior
              </p>
            </div>
          </div>
          <p className="text-sm opacity-90 mt-3">
            Sua família está acima da média brasileira (média 64). Continue priorizando alimentos in natura.
          </p>
          <div className="grid grid-cols-4 gap-2 mt-5">
            {[
              { l: "Naturais", v: "68%" },
              { l: "Variedade", v: "Alta" },
              { l: "Ultraproc.", v: "15%" },
              { l: "Sódio", v: "Médio" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-primary-foreground/15 backdrop-blur p-2.5">
                <p className="text-[10px] uppercase opacity-70">{s.l}</p>
                <p className="text-sm font-bold">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Highlights */}
      <div className="grid grid-cols-3 gap-3">
        {highlights.map((h) => (
          <div key={h.label} className="bg-card rounded-2xl p-3 shadow-soft">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${h.tone}`}>
              <h.icon className="w-4 h-4" />
            </div>
            <p className="text-[10px] uppercase text-muted-foreground">{h.label}</p>
            <p className="text-sm font-bold leading-tight">{h.v}</p>
            <p className="text-xs font-semibold mt-0.5">{h.delta}</p>
          </div>
        ))}
      </div>

      {/* Evolução mensal */}
      <section className="bg-card rounded-3xl p-5 shadow-soft">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-xl">Evolução mensal</h2>
          <span className="flex items-center gap-1 text-success text-xs font-semibold">
            <TrendingUp className="w-3 h-3" /> +14%
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">% saudável vs. processado · últimos 5 meses</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={consumptionData} margin={{ left: -20, right: 4 }}>
            <defs>
              <linearGradient id="gSaud" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gProc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--shadow-card)" }} />
            <Area type="monotone" dataKey="saudavel" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#gSaud)" />
            <Area type="monotone" dataKey="processado" stroke="hsl(var(--destructive))" strokeWidth={2} fill="url(#gProc)" />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Gastos mensais */}
      <section className="bg-card rounded-3xl p-5 shadow-soft">
        <h2 className="font-display text-xl mb-1">Gasto nas compras</h2>
        <p className="text-xs text-muted-foreground mb-4">R$ saudável vs. processado por mês</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlySpend} margin={{ left: -16, right: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--shadow-card)" }} />
            <Bar dataKey="saudavel" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="processado" stackId="a" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-primary" /> Saudável</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-destructive" /> Processado</span>
        </div>
      </section>

      {/* Radar de equilíbrio */}
      <section className="bg-card rounded-3xl p-5 shadow-soft">
        <h2 className="font-display text-xl mb-1">Equilíbrio nutricional</h2>
        <p className="text-xs text-muted-foreground mb-2">Quanto mais próximo da borda, melhor</p>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData} outerRadius="75%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar dataKey="v" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </section>

      {/* Classificação NOVA */}
      <section className="bg-card rounded-3xl p-5 shadow-soft">
        <h2 className="font-display text-xl mb-1">Classificação NOVA</h2>
        <p className="text-xs text-muted-foreground mb-4">Nível de processamento dos alimentos</p>
        <div className="space-y-3">
          {novaData.map((n) => (
            <div key={n.label}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div>
                  <span className="font-semibold">{n.label}</span>
                  <span className="text-muted-foreground"> · {n.desc}</span>
                </div>
                <span className="font-bold">{n.value}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${n.value}%`, background: n.color }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categorias */}
      <section className="bg-card rounded-3xl p-5 shadow-soft">
        <h2 className="font-display text-xl mb-1">Por categoria</h2>
        <p className="text-xs text-muted-foreground mb-4">Distribuição do carrinho</p>
        <ul className="space-y-2">
          {nutrientPie.map((n) => (
            <li key={n.name} className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: n.color }} />
              <span className="text-sm flex-1">{n.name}</span>
              <span className="text-sm font-bold w-10 text-right">{n.value}%</span>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${n.value * 2.5}%`, background: n.color }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Membros */}
      <section>
        <h2 className="font-display text-xl mb-3">Pontuação por membro</h2>
        <div className="space-y-2.5">
          {familyMembers.map((m, i) => {
            const score = [78, 85, 92, 74][i] ?? 80;
            return (
              <div key={m.id} className="bg-card rounded-2xl p-4 shadow-soft flex items-center gap-3">
                <div className="text-3xl">{m.emoji}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{m.name} · <span className="text-muted-foreground font-normal">{m.role}</span></p>
                  <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                    <div className="h-full gradient-primary rounded-full" style={{ width: `${score}%` }} />
                  </div>
                </div>
                <span className="text-lg font-display">{score}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Insights da IA */}
      <section className="rounded-3xl p-5 bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-accent" />
          <h2 className="font-display text-xl">Insights da IA</h2>
        </div>
        <ul className="space-y-3 text-sm">
          <li className="flex gap-3">
            <Leaf className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <span>Vocês aumentaram em <strong>24% o consumo de frutas</strong> no último mês. Excelente!</span>
          </li>
          <li className="flex gap-3">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <span>Ainda há <strong>15% de ultraprocessados</strong>. Tente substituir biscoitos recheados por frutas secas.</span>
          </li>
          <li className="flex gap-3">
            <Apple className="w-4 h-4 text-accent mt-0.5 shrink-0" />
            <span>O consumo de <strong>fibras está abaixo do ideal</strong> para o Theo. Inclua aveia no café da manhã.</span>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default NutritionProfile;
