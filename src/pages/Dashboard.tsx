import { Link } from "react-router-dom";
import { Bell, TrendingUp, ChevronRight, Sparkles, Droplet, Apple, Leaf, ScanLine, ShoppingBasket } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { useFamilyData, type ScanRecord } from "@/hooks/use-family-data";
import { useSubscription } from "@/hooks/use-subscription";
import { recipes } from "@/lib/mock-data";
import { useGamification } from "@/hooks/use-gamification";
import { Skeleton } from "@/components/ui/skeleton";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function deriveConsumptionData(scans: ScanRecord[]) {
  const receiptScans = scans.filter(s => s.scan_type === "receipt" && s.score != null);
  if (receiptScans.length === 0) return [];

  const byMonth: Record<string, { saudavel: number; processado: number; count: number }> = {};
  for (const scan of receiptScans) {
    const d = new Date(scan.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = MONTHS[d.getMonth()];
    if (!byMonth[key]) byMonth[key] = { saudavel: 0, processado: 0, count: 0, label };
    const total = scan.healthy_count + scan.warning_count + scan.avoid_count;
    if (total > 0) {
      byMonth[key].saudavel += ((scan.healthy_count + scan.warning_count) / total) * 100;
      byMonth[key].processado += (scan.avoid_count / total) * 100;
      byMonth[key].count++;
    }
  }

  return Object.entries(byMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-5)
    .map(([_, v]) => ({
      month: (v as { label: string }).label,
      saudavel: Math.round((v as { saudavel: number; count: number }).saudavel / (v as { count: number }).count),
      processado: Math.round((v as { processado: number; count: number }).processado / (v as { count: number }).count),
    }));
}

function derivePieData(scans: ScanRecord[]) {
  const receiptScans = scans.filter(s => s.scan_type === "receipt");
  if (receiptScans.length === 0) return [];

  const categories: Record<string, number> = {};
  let total = 0;
  for (const scan of receiptScans) {
    const result = scan.result as { items?: { category?: string; nova_class?: number }[] } | null;
    if (!result?.items) continue;
    for (const item of result.items) {
      const cat = item.category ?? "outros";
      categories[cat] = (categories[cat] ?? 0) + 1;
      total++;
    }
  }
  if (total === 0) return [];

  const colorMap: Record<string, string> = {
    frutas: "hsl(150 45% 45%)",
    vegetais: "hsl(145 55% 42%)",
    cereais: "hsl(38 80% 55%)",
    leguminosas: "hsl(28 90% 62%)",
    proteinas: "hsl(15 85% 60%)",
    laticinios: "hsl(200 50% 65%)",
    bebidas: "hsl(190 60% 55%)",
    snacks: "hsl(358 60% 60%)",
    doces: "hsl(340 70% 58%)",
    molhos: "hsl(260 40% 55%)",
    panificacao: "hsl(30 70% 50%)",
    congelados: "hsl(210 50% 60%)",
    oleos: "hsl(50 80% 50%)",
    outros: "hsl(0 0% 60%)",
  };

  const labelMap: Record<string, string> = {
    frutas: "Frutas & Vegetais",
    vegetais: "Frutas & Vegetais",
    cereais: "Cereais",
    leguminosas: "Leguminosas",
    proteinas: "Proteínas",
    laticinios: "Laticínios",
    bebidas: "Bebidas",
    snacks: "Snacks",
    doces: "Doces",
    molhos: "Molhos",
    panificacao: "Panificação",
    congelados: "Congelados",
    oleos: "Óleos",
    outros: "Outros",
  };

  const merged: Record<string, number> = {};
  for (const [cat, count] of Object.entries(categories)) {
    const label = labelMap[cat] ?? "Outros";
    merged[label] = (merged[label] ?? 0) + count;
  }

  return Object.entries(merged)
    .map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      color: colorMap[Object.keys(categories).find(k => labelMap[k] === name) ?? "outros"] ?? "hsl(0 0% 60%)",
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

const Dashboard = () => {
  const { family, members, scans, latestScore, avgScore, totalScans, loading } = useFamilyData();
  const { isPremium } = useSubscription();
  const { challenges: realChallenges } = useGamification();

  const consumptionData = deriveConsumptionData(scans);
  const pieData = derivePieData(scans);
  const receiptScans = scans.filter(s => s.scan_type === "receipt");
  const lastScan = receiptScans[0];
  const hasData = receiptScans.length > 0;
  const score = hasData ? (lastScan?.score ?? avgScore) : 0;

  const trendPct = consumptionData.length >= 2
    ? consumptionData[consumptionData.length - 1].saudavel - consumptionData[0].saudavel
    : 0;

  if (loading) {
    return (
      <div className="p-5 space-y-6">
        <header className="flex items-center justify-between pt-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="w-11 h-11 rounded-2xl" />
        </header>
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      <header className="flex items-center justify-between pt-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {family ? `Olá, ${family.name} 👋` : "Bem-vindo 👋"}
          </p>
          <h1 className="text-2xl font-display">Sua casa hoje</h1>
        </div>
        <button className="relative w-11 h-11 rounded-2xl bg-card shadow-soft flex items-center justify-center">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
        </button>
      </header>

      {hasData ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <Link to="/app/historico" className="block relative overflow-hidden rounded-3xl gradient-primary p-6 text-primary-foreground shadow-glow">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-primary-foreground/10" />
            <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-primary-foreground/5" />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Perfil nutricional da casa
              </div>
              <div className="flex items-end gap-3 mb-1">
                <span className="text-6xl font-display leading-none">{score}</span>
                <span className="text-sm opacity-80 mb-2">/ 100</span>
              </div>
              <p className="text-sm opacity-90 mb-4">
                {totalScans} {totalScans === 1 ? "escaneamento" : "escaneamentos"} realizados
                {trendPct > 0 && ` · +${trendPct}% vs. início`}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { l: "Saudáveis", v: lastScan ? `${lastScan.healthy_count}` : "—" },
                  { l: "Atenção", v: lastScan ? `${lastScan.warning_count}` : "—" },
                  { l: "Evite", v: lastScan ? `${lastScan.avoid_count}` : "—" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-primary-foreground/15 backdrop-blur p-2.5">
                    <p className="text-[10px] uppercase opacity-70">{s.l}</p>
                    <p className="text-sm font-bold">{s.v}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs opacity-80 mt-3">
                Ver histórico completo <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/app/escanear" className="block relative overflow-hidden rounded-3xl gradient-primary p-6 text-primary-foreground shadow-glow">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-primary-foreground/10" />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Comece a analisar
              </div>
              <h2 className="text-2xl font-display mb-2">Escaneie sua primeira nota fiscal</h2>
              <p className="text-sm opacity-90 mb-4">A IA lê seus produtos e calcula o score nutricional da sua casa.</p>
              <div className="inline-flex items-center gap-2 bg-primary-foreground/15 backdrop-blur px-4 py-2.5 rounded-xl">
                <ScanLine className="w-4 h-4" />
                <span className="text-sm font-semibold">Escanear agora</span>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {hasData && lastScan && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Apple, label: "Saudáveis", v: `${lastScan.healthy_count}`, c: "bg-success/10 text-success" },
            { icon: Leaf, label: "Atenção", v: `${lastScan.warning_count}`, c: "bg-warning/10 text-warning" },
            { icon: Droplet, label: "Evitar", v: `${lastScan.avoid_count}`, c: "bg-destructive/10 text-destructive" },
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
      )}

      {consumptionData.length > 0 ? (
        <div className="bg-card rounded-3xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display text-xl">Evolução das compras</h2>
            {trendPct > 0 && (
              <span className="flex items-center gap-1 text-success text-xs font-semibold">
                <TrendingUp className="w-3 h-3" /> +{trendPct}%
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-4">Saudável vs. processado · últimos scans</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={consumptionData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--shadow-card)" }} />
              <Line type="monotone" dataKey="saudavel" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              <Line type="monotone" dataKey="processado" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : hasData ? null : (
        <div className="bg-card rounded-3xl p-5 shadow-soft text-center">
          <p className="text-sm text-muted-foreground">Escaneie notas fiscais para ver a evolução das suas compras aqui.</p>
        </div>
      )}

      {pieData.length > 0 && (
        <div className="bg-card rounded-3xl p-5 shadow-soft">
          <h2 className="font-display text-xl mb-1">Composição do carrinho</h2>
          <p className="text-xs text-muted-foreground mb-3">Distribuição por categoria</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={140}>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={36} outerRadius={62} paddingAngle={2}>
                  {pieData.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <ul className="flex-1 space-y-1.5">
              {pieData.map((n) => (
                <li key={n.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: n.color }} />
                  <span className="flex-1 text-foreground">{n.name}</span>
                  <span className="font-semibold">{n.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Desafios ativos</h2>
          <Link to="/app/gamificacao" className="text-xs text-primary font-semibold flex items-center">Ver tudo <ChevronRight className="w-3 h-3" /></Link>
        </div>
        <div className="space-y-2.5">
          {realChallenges.slice(0, 2).map((c) => (
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

      <Link to="/app/sustentabilidade" className="block">
        <div className="rounded-3xl p-5 shadow-soft relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(150 45% 45%), hsl(160 50% 38%))" }}>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative text-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
              <Leaf className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-display text-lg">Sustentabilidade</p>
              <p className="text-sm opacity-90">Veja o impacto ambiental das suas compras</p>
            </div>
            <ChevronRight className="w-5 h-5 opacity-80" />
          </div>
        </div>
      </Link>

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

      {!isPremium && (
        <Link to="/app/premium" className="block">
          <div className="rounded-2xl p-4 gradient-warm text-accent-foreground flex items-center gap-3 shadow-glow">
            <ShoppingBasket className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Desbloqueie cardápios semanais com IA</p>
              <p className="text-xs opacity-90">Conheça o NutriCasa Premium</p>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </div>
        </Link>
      )}
    </div>
  );
};

export default Dashboard;
