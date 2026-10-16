import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, TrendingUp, Award, Leaf, AlertTriangle, Apple, ScanLine } from "lucide-react";
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
} from "recharts";
import { motion } from "framer-motion";
import { useFamilyData, type ScanRecord } from "@/hooks/use-family-data";
import { Skeleton } from "@/components/ui/skeleton";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function deriveMonthlyData(scans: ScanRecord[]) {
  const receiptScans = scans.filter(s => s.scan_type === "receipt" && s.score != null);
  if (receiptScans.length === 0) return [];

  const byMonth: Record<string, { saudavel: number; processado: number; count: number; label: string }> = {};
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
    .map(([_, v]) => {
      const val = v as { saudavel: number; processado: number; count: number; label: string };
      return {
        month: val.label,
        saudavel: Math.round(val.saudavel / val.count),
        processado: Math.round(val.processado / val.count),
      };
    });
}

function deriveNovaData(scans: ScanRecord[]) {
  const receiptScans = scans.filter(s => s.scan_type === "receipt");
  if (receiptScans.length === 0) return [];

  const novaCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  let total = 0;
  for (const scan of receiptScans) {
    const result = scan.result as { items?: { nova_class?: number }[] } | null;
    if (!result?.items) continue;
    for (const item of result.items) {
      const cls = item.nova_class;
      if (cls && cls >= 1 && cls <= 4) {
        novaCounts[cls]++;
        total++;
      }
    }
  }
  if (total === 0) return [];

  return [
    { label: "NOVA 1", desc: "In natura", value: Math.round((novaCounts[1] / total) * 100), color: "hsl(var(--success))" },
    { label: "NOVA 2", desc: "Ingredientes culinários", value: Math.round((novaCounts[2] / total) * 100), color: "hsl(150 45% 55%)" },
    { label: "NOVA 3", desc: "Processados", value: Math.round((novaCounts[3] / total) * 100), color: "hsl(38 80% 55%)" },
    { label: "NOVA 4", desc: "Ultraprocessados", value: Math.round((novaCounts[4] / total) * 100), color: "hsl(var(--destructive))" },
  ].filter(d => d.value > 0);
}

function deriveRadarData(scans: ScanRecord[]) {
  const receiptScans = scans.filter(s => s.scan_type === "receipt");
  if (receiptScans.length === 0) return [];

  const categories: Record<string, number> = {};
  let total = 0;
  for (const scan of receiptScans) {
    const result = scan.result as { items?: { category?: string; health_flag?: string }[] } | null;
    if (!result?.items) continue;
    for (const item of result.items) {
      const cat = item.category ?? "outros";
      categories[cat] = (categories[cat] ?? 0) + 1;
      total++;
    }
  }
  if (total === 0) return [];

  const dims = [
    { dim: "Frutas", cats: ["frutas"] },
    { dim: "Vegetais", cats: ["vegetais"] },
    { dim: "Proteínas", cats: ["proteinas", "leguminosas"] },
    { dim: "Cereais", cats: ["cereais"] },
    { dim: "Laticínios", cats: ["laticinios"] },
    { dim: "Bebidas", cats: ["bebidas"] },
  ];

  return dims.map(d => {
    const count = d.cats.reduce((sum, c) => sum + (categories[c] ?? 0), 0);
    return { dim: d.dim, v: total > 0 ? Math.round((count / total) * 100) : 0 };
  });
}

function deriveCategoryData(scans: ScanRecord[]) {
  const receiptScans = scans.filter(s => s.scan_type === "receipt");
  if (receiptScans.length === 0) return [];

  const categories: Record<string, number> = {};
  let total = 0;
  for (const scan of receiptScans) {
    const result = scan.result as { items?: { category?: string }[] } | null;
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
    .sort((a, b) => b.value - a.value);
}

const NutritionProfile = () => {
  const { scans, members, latestScore, avgScore, totalScans, loading } = useFamilyData();

  if (loading) {
    return (
      <div className="p-5 space-y-6">
        <header className="flex items-center gap-3 pt-3">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <Skeleton className="h-52 w-full rounded-3xl" />
        <Skeleton className="h-56 w-full rounded-3xl" />
        <Skeleton className="h-56 w-full rounded-3xl" />
      </div>
    );
  }

  const receiptScans = scans.filter(s => s.scan_type === "receipt");
  const hasData = receiptScans.length > 0;
  const score = hasData ? (receiptScans[0]?.score ?? avgScore) : 0;

  const monthlyData = deriveMonthlyData(scans);
  const novaData = deriveNovaData(scans);
  const radarData = deriveRadarData(scans);
  const categoryData = deriveCategoryData(scans);

  const trendPct = monthlyData.length >= 2
    ? monthlyData[monthlyData.length - 1].saudavel - monthlyData[0].saudavel
    : 0;

  const totalHealthy = receiptScans.reduce((s, scan) => s + scan.healthy_count, 0);
  const totalAvoid = receiptScans.reduce((s, scan) => s + scan.avoid_count, 0);
  const totalWarning = receiptScans.reduce((s, scan) => s + scan.warning_count, 0);
  const totalItems = totalHealthy + totalWarning + totalAvoid;
  const healthyPct = totalItems > 0 ? Math.round((totalHealthy / totalItems) * 100) : 0;
  const ultraPct = totalItems > 0 ? Math.round((totalAvoid / totalItems) * 100) : 0;

  const highlights = hasData ? [
    { icon: TrendingUp, label: "Saudáveis", v: `${healthyPct}%`, delta: `${totalHealthy} itens`, tone: "text-success bg-success/10" },
    { icon: AlertTriangle, label: "Atenção", v: `${totalWarning}`, delta: "itens", tone: "text-warning bg-warning/10" },
    { icon: Award, label: "Scans", v: `${totalScans}`, delta: "realizados", tone: "text-accent bg-accent/10" },
  ] : [];

  return (
    <div className="p-5 space-y-6">
      <header className="flex items-center gap-3 pt-3">
        <Link to="/app" className="w-10 h-10 rounded-2xl bg-card shadow-soft flex items-center justify-center" aria-label="Voltar">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-xs text-muted-foreground">Análise detalhada</p>
          <h1 className="text-2xl font-display leading-tight">Perfil nutricional da casa</h1>
        </div>
      </header>

      {hasData ? (
        <>
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
                <span className="text-7xl font-display leading-none">{score}</span>
                <div className="mb-2">
                  <p className="text-sm opacity-80">/ 100</p>
                  {trendPct > 0 && (
                    <p className="text-xs font-semibold flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" /> +{trendPct}% vs. início
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm opacity-90 mt-3">
                Baseado em {totalScans} {totalScans === 1 ? "escaneamento" : "escaneamentos"} reais da sua família.
              </p>
              <div className="grid grid-cols-4 gap-2 mt-5">
                {[
                  { l: "Naturais", v: `${healthyPct}%` },
                  { l: "Variedade", v: radarData.length > 0 ? `${radarData.filter(d => d.v > 10).length}` : "—" },
                  { l: "Ultraproc.", v: `${ultraPct}%` },
                  { l: "Scans", v: `${totalScans}` },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-primary-foreground/15 backdrop-blur p-2.5">
                    <p className="text-[10px] uppercase opacity-70">{s.l}</p>
                    <p className="text-sm font-bold">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {highlights.length > 0 && (
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
          )}

          {monthlyData.length > 0 && (
            <section className="bg-card rounded-3xl p-5 shadow-soft">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display text-xl">Evolução mensal</h2>
                {trendPct > 0 && (
                  <span className="flex items-center gap-1 text-success text-xs font-semibold">
                    <TrendingUp className="w-3 h-3" /> +{trendPct}%
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-4">% saudável vs. processado</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData} margin={{ left: -20, right: 4 }}>
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
          )}

          {radarData.length > 0 && (
            <section className="bg-card rounded-3xl p-5 shadow-soft">
              <h2 className="font-display text-xl mb-1">Equilíbrio nutricional</h2>
              <p className="text-xs text-muted-foreground mb-2">Distribuição por grupo alimentar</p>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="v" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </section>
          )}

          {novaData.length > 0 && (
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
          )}

          {categoryData.length > 0 && (
            <section className="bg-card rounded-3xl p-5 shadow-soft">
              <h2 className="font-display text-xl mb-1">Por categoria</h2>
              <p className="text-xs text-muted-foreground mb-4">Distribuição do carrinho</p>
              <ul className="space-y-2">
                {categoryData.map((n) => (
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
          )}

          {members.length > 0 && (
            <section>
              <h2 className="font-display text-xl mb-3">Membros da família</h2>
              <div className="space-y-2.5">
                {members.map((m) => (
                  <div key={m.id} className="bg-card rounded-2xl p-4 shadow-soft flex items-center gap-3">
                    <div className="text-3xl">{m.avatar_emoji || "👤"}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{m.display_name || "Membro"}</p>
                      <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {ultraPct > 0 && (
            <section className="rounded-3xl p-5 bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-accent" />
                <h2 className="font-display text-xl">Insights da IA</h2>
              </div>
              <ul className="space-y-3 text-sm">
                {healthyPct >= 60 && (
                  <li className="flex gap-3">
                    <Leaf className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span>{healthyPct}% dos itens escaneados são saudáveis. Continue assim!</span>
                  </li>
                )}
                {ultraPct > 15 && (
                  <li className="flex gap-3">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    <span>Ainda há <strong>{ultraPct}% de ultraprocessados</strong>. Tente substituir por alternativas naturais.</span>
                  </li>
                )}
                {trendPct > 0 && (
                  <li className="flex gap-3">
                    <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Sua família melhorou <strong>{trendPct}%</strong> a qualidade das compras ao longo do tempo.</span>
                  </li>
                )}
              </ul>
            </section>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <div className="bg-card rounded-3xl p-8 shadow-soft text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl gradient-fresh flex items-center justify-center mx-auto">
              <ScanLine className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display mb-2">Nenhum escaneamento ainda</h2>
              <p className="text-sm text-muted-foreground">
                Escaneie sua primeira nota fiscal para ver aqui o perfil nutricional completo da sua casa — score, evolução, classificação NOVA e muito mais.
              </p>
            </div>
            <Link
              to="/app/escanear"
              className="inline-flex items-center gap-2 gradient-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold shadow-glow"
            >
              <ScanLine className="w-5 h-5" /> Escanear agora
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionProfile;
