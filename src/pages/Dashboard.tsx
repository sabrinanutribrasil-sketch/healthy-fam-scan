import { Link } from "react-router-dom";
import { Bell, TrendingUp, ChevronRight, Sparkles, Droplet, Apple, Leaf } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts";
import { consumptionData, nutrientPie, challenges, recipes } from "@/lib/mock-data";
import { motion } from "framer-motion";

const Dashboard = () => {
  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between pt-3">
        <div>
          <p className="text-sm text-muted-foreground">Olá, família Silva 👋</p>
          <h1 className="text-2xl font-display">Sua casa hoje</h1>
        </div>
        <button className="relative w-11 h-11 rounded-2xl bg-card shadow-soft flex items-center justify-center">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
        </button>
      </header>

      {/* Score card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl gradient-primary p-6 text-primary-foreground shadow-glow">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-primary-foreground/10" />
        <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-primary-foreground/5" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Perfil nutricional da casa
          </div>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-6xl font-display leading-none">82</span>
            <span className="text-sm opacity-80 mb-2">/ 100</span>
          </div>
          <p className="text-sm opacity-90 mb-4">Boa qualidade alimentar. +7 pts vs. mês anterior.</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "Naturais", v: "68%" },
              { l: "Variedade", v: "Alta" },
              { l: "Ultraproc.", v: "15%" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-primary-foreground/15 backdrop-blur p-2.5">
                <p className="text-[10px] uppercase opacity-70">{s.l}</p>
                <p className="text-sm font-bold">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Apple, label: "Frutas", v: "6/sem", c: "bg-accent/10 text-accent" },
          { icon: Droplet, label: "Água", v: "1.7L", c: "bg-primary/10 text-primary" },
          { icon: Leaf, label: "Vegetais", v: "Alta", c: "bg-success/10 text-success" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl p-3 shadow-soft">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${s.c}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-base font-bold">{s.v}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card rounded-3xl p-5 shadow-soft">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-xl">Evolução das compras</h2>
          <span className="flex items-center gap-1 text-success text-xs font-semibold"><TrendingUp className="w-3 h-3" /> +14%</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Saudável vs. processado · últimos 5 meses</p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={consumptionData}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--shadow-card)" }} />
            <Line type="monotone" dataKey="saudavel" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
            <Line type="monotone" dataKey="processado" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Composition pie */}
      <div className="bg-card rounded-3xl p-5 shadow-soft">
        <h2 className="font-display text-xl mb-1">Composição do carrinho</h2>
        <p className="text-xs text-muted-foreground mb-3">Distribuição por categoria</p>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="50%" height={140}>
            <PieChart>
              <Pie data={nutrientPie} dataKey="value" innerRadius={36} outerRadius={62} paddingAngle={2}>
                {nutrientPie.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <ul className="flex-1 space-y-1.5">
            {nutrientPie.map((n) => (
              <li key={n.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: n.color }} />
                <span className="flex-1 text-foreground">{n.name}</span>
                <span className="font-semibold">{n.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Active challenge */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Desafios ativos</h2>
          <Link to="/app/gamificacao" className="text-xs text-primary font-semibold flex items-center">Ver tudo <ChevronRight className="w-3 h-3" /></Link>
        </div>
        <div className="space-y-2.5">
          {challenges.slice(0, 2).map((c) => (
            <div key={c.id} className="bg-card rounded-2xl p-4 shadow-soft flex items-center gap-3">
              <div className="text-3xl">{c.emoji}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{c.title}</p>
                <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                  <div className="h-full gradient-primary rounded-full" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
              <span className="text-xs font-bold text-accent">+{c.points}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recipes preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Receitas para você</h2>
          <Link to="/app/receitas" className="text-xs text-primary font-semibold flex items-center">Ver tudo <ChevronRight className="w-3 h-3" /></Link>
        </div>
        <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 snap-x">
          {recipes.slice(0, 3).map((r) => (
            <Link key={r.id} to="/app/receitas" className="shrink-0 w-44 snap-start">
              <div className="rounded-2xl overflow-hidden bg-card shadow-soft">
                <img src={r.img} alt={r.title} loading="lazy" className="w-full h-28 object-cover" />
                <div className="p-3">
                  <p className="text-sm font-semibold leading-snug line-clamp-2">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.time}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
