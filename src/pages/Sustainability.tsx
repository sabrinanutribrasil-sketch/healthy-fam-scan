import { Link } from "react-router-dom";
import { ArrowLeft, Leaf, Recycle, Sprout, TrendingDown, Award, ScanLine, Droplets, TreePine, Factory } from "lucide-react";
import { motion } from "framer-motion";
import { useFamilyData, type ScanRecord } from "@/hooks/use-family-data";
import { Skeleton } from "@/components/ui/skeleton";
import { foodDatabase } from "@/lib/food-database";

type ScanResult = {
  items?: { name?: string; category?: string; nova_class?: number; health_flag?: string }[];
};

type MonthImpact = {
  label: string;
  co2: number;
  ultraPct: number;
};

type CategoryImpact = {
  category: string;
  count: number;
  co2: number;
  label: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  frutas: "Frutas",
  vegetais: "Vegetais",
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

const SEASONAL_FOODS = [
  { month: "Out", foods: ["Mamão", "Laranja", "Abóbora", "Chuchu", "Beterraba"] },
  { month: "Nov", foods: ["Manga", "Maracujá", "Pêssego", "Cenoura", "Couve"] },
  { month: "Dez", foods: ["Melancia", "Cereja", "Uva", "Pepino", "Tomate"] },
];

function deriveCO2(scans: ScanRecord[]): number {
  let totalCO2 = 0;
  for (const scan of scans) {
    const result = scan.result as ScanResult | null;
    if (!result?.items) continue;
    for (const item of result.items) {
      const food = foodDatabase.find(f =>
        f.name.toLowerCase() === (item.name ?? "").toLowerCase() ||
        f.aliases?.some(a => a.toLowerCase() === (item.name ?? "").toLowerCase())
      );
      if (food?.co2PerKg) {
        totalCO2 += food.co2PerKg;
      } else {
        const cat = item.category ?? "outros";
        const fallback: Record<string, number> = {
          proteinas: 8, laticinios: 3.2, cereais: 2.5, frutas: 0.6,
          vegetais: 0.4, leguminosas: 0.9, bebidas: 1.5, doces: 4,
          snacks: 5, congelados: 6, panificacao: 3, molhos: 3, oleos: 4, outros: 3,
        };
        totalCO2 += fallback[cat] ?? 3;
      }
    }
  }
  return Math.round(totalCO2 * 10) / 10;
}

function deriveMonthlyImpact(scans: ScanRecord[]): MonthImpact[] {
  const receiptScans = scans.filter(s => s.scan_type === "receipt");
  if (receiptScans.length === 0) return [];

  const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const byMonth: Record<string, { co2: number; ultra: number; count: number; label: string }> = {};

  for (const scan of receiptScans) {
    const d = new Date(scan.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = MONTHS[d.getMonth()];
    if (!byMonth[key]) byMonth[key] = { co2: 0, ultra: 0, count: 0, label };

    const result = scan.result as ScanResult | null;
    if (result?.items) {
      for (const item of result.items) {
        const food = foodDatabase.find(f =>
          f.name.toLowerCase() === (item.name ?? "").toLowerCase() ||
          f.aliases?.some(a => a.toLowerCase() === (item.name ?? "").toLowerCase())
        );
        if (food?.co2PerKg) byMonth[key].co2 += food.co2PerKg;
        else byMonth[key].co2 += 3;
        if (item.nova_class === 4) byMonth[key].ultra++;
      }
    }
    const total = scan.healthy_count + scan.warning_count + scan.avoid_count;
    if (total > 0) {
      byMonth[key].ultra = (byMonth[key].ultra / total) * 100;
      byMonth[key].count++;
    }
  }

  return Object.entries(byMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-5)
    .map(([_, v]) => ({
      label: v.label,
      co2: Math.round(v.co2 * 10) / 10,
      ultraPct: Math.round(v.ultra / Math.max(v.count, 1)),
    }));
}

function deriveCategoryImpact(scans: ScanRecord[]): CategoryImpact[] {
  const receiptScans = scans.filter(s => s.scan_type === "receipt");
  if (receiptScans.length === 0) return [];

  const catData: Record<string, { count: number; co2: number }> = {};

  for (const scan of receiptScans) {
    const result = scan.result as ScanResult | null;
    if (!result?.items) continue;
    for (const item of result.items) {
      const cat = item.category ?? "outros";
      if (!catData[cat]) catData[cat] = { count: 0, co2: 0 };
      catData[cat].count++;

      const food = foodDatabase.find(f =>
        f.name.toLowerCase() === (item.name ?? "").toLowerCase() ||
        f.aliases?.some(a => a.toLowerCase() === (item.name ?? "").toLowerCase())
      );
      const co2 = food?.co2PerKg ?? 3;
      catData[cat].co2 += co2;
    }
  }

  return Object.entries(catData)
    .map(([cat, v]) => ({
      category: cat,
      count: v.count,
      co2: Math.round(v.co2 * 10) / 10,
      label: CATEGORY_LABELS[cat] ?? "Outros",
    }))
    .sort((a, b) => b.co2 - a.co2)
    .slice(0, 6);
}

function deriveEcoScore(scans: ScanRecord[]): number {
  const receiptScans = scans.filter(s => s.scan_type === "receipt");
  if (receiptScans.length === 0) return 0;

  let totalItems = 0;
  let plantBased = 0;
  let ultraProcessed = 0;
  let lowCO2Items = 0;

  for (const scan of receiptScans) {
    const result = scan.result as ScanResult | null;
    if (!result?.items) continue;
    for (const item of result.items) {
      totalItems++;
      const cat = item.category ?? "outros";
      if (["frutas", "vegetais", "leguminosas", "cereais"].includes(cat)) {
        plantBased++;
        lowCO2Items++;
      }
      if (item.nova_class === 4) ultraProcessed++;

      const food = foodDatabase.find(f =>
        f.name.toLowerCase() === (item.name ?? "").toLowerCase() ||
        f.aliases?.some(a => a.toLowerCase() === (item.name ?? "").toLowerCase())
      );
      if (food?.co2PerKg && food.co2PerKg < 2) lowCO2Items++;
    }
  }

  if (totalItems === 0) return 0;
  const plantPct = (plantBased / totalItems) * 40;
  const lowCO2Pct = (lowCO2Items / totalItems) * 30;
  const ultraPenalty = (ultraProcessed / totalItems) * 30;
  return Math.round(Math.max(0, Math.min(100, plantPct + lowCO2Pct + 30 - ultraPenalty)));
}

const MAX_CATEGORY_CO2 = 50;

const Sustainability = () => {
  const { scans, loading } = useFamilyData();

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
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    );
  }

  const receiptScans = scans.filter(s => s.scan_type === "receipt");
  const hasData = receiptScans.length > 0;

  const totalCO2 = deriveCO2(receiptScans);
  const monthlyImpact = deriveMonthlyImpact(scans);
  const categoryImpact = deriveCategoryImpact(scans);
  const ecoScore = deriveEcoScore(receiptScans);

  const totalItems = receiptScans.reduce((s, scan) => s + scan.item_count, 0);
  const healthyItems = receiptScans.reduce((s, scan) => s + scan.healthy_count, 0);
  const avoidItems = receiptScans.reduce((s, scan) => s + scan.avoid_count, 0);

  const wasteAvoided = avoidItems > 0 ? Math.round(avoidItems * 0.3 * 10) / 10 : 0;
  const treesEquivalent = Math.round((totalCO2 / 21) * 10) / 10;

  const ultraCount = receiptScans.reduce((s, scan) => {
    const result = scan.result as ScanResult | null;
    return s + (result?.items?.filter(i => i.nova_class === 4).length ?? 0);
  }, 0);

  const currentMonth = SEASONAL_FOODS[0];

  return (
    <div className="p-5 space-y-6 pb-6">
      <header className="flex items-center gap-3 pt-3">
        <Link to="/app" className="w-10 h-10 rounded-2xl bg-card shadow-soft flex items-center justify-center" aria-label="Voltar">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-xs text-muted-foreground">Impacto ambiental</p>
          <h1 className="text-2xl font-display leading-tight">Sustentabilidade</h1>
        </div>
      </header>

      {hasData ? (
        <>
          {/* Eco Score Hero */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-6 shadow-glow"
            style={{ background: "linear-gradient(135deg, hsl(150 45% 45%), hsl(160 50% 38%))" }}
          >
            <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10" />
            <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-white/5" />
            <div className="relative text-white">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80 mb-2">
                <Leaf className="w-3.5 h-3.5" /> Eco Score da família
              </div>
              <div className="flex items-end gap-3">
                <span className="text-7xl font-display leading-none">{ecoScore}</span>
                <div className="mb-2">
                  <p className="text-sm opacity-80">/ 100</p>
                </div>
              </div>
              <p className="text-sm opacity-90 mt-3">
                Baseado em {receiptScans.length} {receiptScans.length === 1 ? "escaneamento" : "escaneamentos"} · {totalItems} itens analisados
              </p>
              <div className="grid grid-cols-3 gap-2 mt-5">
                <div className="rounded-xl bg-white/15 backdrop-blur p-2.5">
                  <p className="text-[10px] uppercase opacity-70">CO₂ estimado</p>
                  <p className="text-sm font-bold">{totalCO2} kg</p>
                </div>
                <div className="rounded-xl bg-white/15 backdrop-blur p-2.5">
                  <p className="text-[10px] uppercase opacity-70">Desperdício evitado</p>
                  <p className="text-sm font-bold">{wasteAvoided} kg</p>
                </div>
                <div className="rounded-xl bg-white/15 backdrop-blur p-2.5">
                  <p className="text-[10px] uppercase opacity-70">Árvores eq.</p>
                  <p className="text-sm font-bold">{treesEquivalent}</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Impact metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl p-4 shadow-soft">
              <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center mb-2">
                <Sprout className="w-4 h-4 text-success" />
              </div>
              <p className="text-xs text-muted-foreground">Itens de origem vegetal</p>
              <p className="text-lg font-bold">{healthyItems}</p>
              <p className="text-xs font-semibold text-success mt-0.5">
                {totalItems > 0 ? Math.round((healthyItems / totalItems) * 100) : 0}% do carrinho
              </p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-soft">
              <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center mb-2">
                <Factory className="w-4 h-4 text-destructive" />
              </div>
              <p className="text-xs text-muted-foreground">Ultraprocessados</p>
              <p className="text-lg font-bold">{ultraCount}</p>
              <p className="text-xs font-semibold text-destructive mt-0.5">
                {totalItems > 0 ? Math.round((ultraCount / totalItems) * 100) : 0}% do carrinho
              </p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-soft">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <TreePine className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Pegada de carbono</p>
              <p className="text-lg font-bold">{totalCO2} kg CO₂e</p>
              <p className="text-xs text-muted-foreground mt-0.5">estimativa por item</p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-soft">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
                <Recycle className="w-4 h-4 text-accent" />
              </div>
              <p className="text-xs text-muted-foreground">Desperdício evitado</p>
              <p className="text-lg font-bold">{wasteAvoided} kg</p>
              <p className="text-xs text-muted-foreground mt-0.5">estimativa por item evitado</p>
            </div>
          </div>

          {/* Monthly CO2 trend */}
          {monthlyImpact.length > 0 && (
            <section className="bg-card rounded-3xl p-5 shadow-soft">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display text-xl">Evolução da pegada de carbono</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4">CO₂e estimado (kg) por mês</p>
              <div className="space-y-3">
                {monthlyImpact.map((m, i) => {
                  const maxCO2 = Math.max(...monthlyImpact.map(x => x.co2), 1);
                  const widthPct = (m.co2 / maxCO2) * 100;
                  const prevCO2 = i > 0 ? monthlyImpact[i - 1].co2 : m.co2;
                  const trend = m.co2 - prevCO2;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold">{m.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{m.co2} kg</span>
                          {i > 0 && trend !== 0 && (
                            <span className={`flex items-center gap-0.5 ${trend < 0 ? "text-success" : "text-destructive"}`}>
                              <TrendingDown className={`w-3 h-3 ${trend > 0 ? "rotate-90" : ""}`} />
                              {Math.abs(Math.round(trend * 10) / 10)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPct}%` }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: "linear-gradient(90deg, hsl(150 45% 45%), hsl(160 50% 38%))" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Category impact */}
          {categoryImpact.length > 0 && (
            <section className="bg-card rounded-3xl p-5 shadow-soft">
              <h2 className="font-display text-xl mb-1">Impacto por categoria</h2>
              <p className="text-xs text-muted-foreground mb-4">Pegada de carbono estimada por grupo alimentar</p>
              <ul className="space-y-2.5">
                {categoryImpact.map((c) => {
                  const widthPct = Math.min((c.co2 / MAX_CATEGORY_CO2) * 100, 100);
                  const intensity = c.co2 > 20 ? "text-destructive" : c.co2 > 10 ? "text-warning" : "text-success";
                  return (
                    <li key={c.category} className="flex items-center gap-3">
                      <span className="text-sm flex-1">{c.label}</span>
                      <span className={`text-sm font-bold w-16 text-right ${intensity}`}>{c.co2} kg</span>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${widthPct}%`,
                            background: c.co2 > 20 ? "hsl(var(--destructive))" : c.co2 > 10 ? "hsl(var(--warning))" : "hsl(var(--success))",
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Sustainability seals */}
          <section className="bg-card rounded-3xl p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-success" />
              <h2 className="font-display text-xl">Selos de sustentabilidade</h2>
            </div>
            <div className="space-y-2.5">
              {ecoScore >= 70 && (
                <div className="flex items-center gap-3 rounded-2xl bg-success/10 p-3">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-success">Eco Família</p>
                    <p className="text-xs text-muted-foreground">Sua família faz escolhas de baixo impacto ambiental</p>
                  </div>
                </div>
              )}
              {healthyItems > 20 && (
                <div className="flex items-center gap-3 rounded-2xl bg-success/10 p-3">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <Sprout className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-success">Carrinho Verde</p>
                    <p className="text-xs text-muted-foreground">{healthyItems} itens de origem vegetal escaneados</p>
                  </div>
                </div>
              )}
              {ultraCount === 0 && totalItems > 0 && (
                <div className="flex items-center gap-3 rounded-2xl bg-success/10 p-3">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <Factory className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-success">Zero Ultraprocessados</p>
                    <p className="text-xs text-muted-foreground">Nenhum item ultraprocessado no carrinho</p>
                  </div>
                </div>
              )}
              {wasteAvoided > 5 && (
                <div className="flex items-center gap-3 rounded-2xl bg-accent/10 p-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Recycle className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-accent">Anti-desperdício</p>
                    <p className="text-xs text-muted-foreground">{wasteAvoided} kg de desperdício evitado</p>
                  </div>
                </div>
              )}
              {ecoScore < 70 && ultraCount > 0 && (
                <div className="flex items-center gap-3 rounded-2xl bg-muted p-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Continue melhorando</p>
                    <p className="text-xs text-muted-foreground">Reduza ultraprocessados para ganhar selos verdes</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Seasonal foods */}
          <section className="bg-card rounded-3xl p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-4 h-4 text-primary" />
              <h2 className="font-display text-xl">Alimentos da época</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Alimentos locais e sazonais têm menor pegada de carbono e são mais baratos.
            </p>
            <div className="space-y-3">
              {SEASONAL_FOODS.map((season) => (
                <div key={season.month}>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">{season.month}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {season.foods.map((food) => (
                      <span
                        key={food}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          season.month === currentMonth.month
                            ? "bg-success/15 text-success ring-1 ring-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tips */}
          <section className="rounded-3xl p-5 border border-success/20 bg-gradient-to-br from-success/5 to-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-4 h-4 text-success" />
              <h2 className="font-display text-xl">Dicas de sustentabilidade</h2>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <Sprout className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <span>Escolha mais frutas e vegetais da estação — eles custam menos e têm menor impacto ambiental.</span>
              </li>
              <li className="flex gap-3">
                <Recycle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span>Reduza ultraprocessados: cada item evitado economiza cerca de 0,3 kg de desperdício de embalagens.</span>
              </li>
              <li className="flex gap-3">
                <TreePine className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Uma árvore absorve cerca de 21 kg de CO₂ por ano. Suas compras equivalem a {treesEquivalent} árvore(s).</span>
              </li>
              <li className="flex gap-3">
                <Droplets className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Leguminosas (feijão, lentilha) têm pegada de carbono até 10x menor que carnes.</span>
              </li>
            </ul>
          </section>
        </>
      ) : (
        <div className="space-y-6">
          <div className="bg-card rounded-3xl p-8 shadow-soft text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
              <Leaf className="w-8 h-8 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-display mb-2">Nenhum escaneamento ainda</h2>
              <p className="text-sm text-muted-foreground">
                Escaneie sua primeira nota fiscal para ver o impacto ambiental das suas compras — pegada de carbono, desperdício evitado, selos verdes e muito mais.
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

export default Sustainability;
