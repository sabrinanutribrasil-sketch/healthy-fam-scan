import { foodDatabase, type Food } from "./food-database";
import type { ScanRecord } from "@/hooks/use-family-data";
import type { Preferences } from "./meal-planner";
export { validateShoppingState } from "../../supabase/functions/_shared/shopping-state";
export type { ShoppingItem, ShoppingState, ReplenishmentSetting } from "../../supabase/functions/_shared/shopping-state";
import type { ReplenishmentSetting } from "../../supabase/functions/_shared/shopping-state";

export const normalizeFood = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export function matchFood(name: string): Food | undefined {
  const q = normalizeFood(name);
  if (!q) return;
  const tokens = q.split(" ");
  return foodDatabase.find(f => [f.id, f.name, ...(f.aliases ?? [])].some(alias => normalizeFood(alias) === q))
    ?? foodDatabase.find(f => [f.id, f.name, ...(f.aliases ?? [])].some(alias => {
      const words = normalizeFood(alias).split(" ");
      return words.length >= 2 && words.every(w => tokens.includes(w));
    }));
}
export const foodKey = (name: string) => matchFood(name)?.id ?? normalizeFood(name);
const DAY = 86400000;
const lastOf = <T,>(items: T[]): T | undefined => items[items.length - 1];
type Purchase = { date: number; quantity: string; unitPrice?: number; unit?: string };
export type PurchaseHistory = { key: string; name: string; purchases: Purchase[] };
const unitKey = (unit: string) => {
  const s = normalizeFood(unit);
  if (["kg", "quilograma", "quilogramas"].includes(s)) return { unit: "kg", factor: 1 };
  if (["g", "gramas", "grama"].includes(s)) return { unit: "kg", factor: 0.001 };
  if (["l", "litro", "litros"].includes(s)) return { unit: "L", factor: 1 };
  if (["ml", "mililitros"].includes(s)) return { unit: "L", factor: 0.001 };
  // Packages/units have unknown sizes: never compare their prices across foods.
  return undefined;
};
const obj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
export function purchaseHistory(scans: ScanRecord[]): PurchaseHistory[] {
  const history = new Map<string, PurchaseHistory>();
  for (const scan of scans) {
    if (scan.scan_type !== "receipt" || !obj(scan.result) || !Array.isArray(scan.result.items)) continue;
    const time = Date.parse(scan.created_at);
    if (!Number.isFinite(time)) continue;
    const date = Math.floor(time / DAY) * DAY;
    for (const item of scan.result.items) {
      if (!obj(item) || typeof item.name !== "string" || !item.name.trim() || ["higiene", "limpeza", "outros"].includes(String(item.category))) continue;
      const name = typeof item.normalized_name === "string" && item.normalized_name.trim() ? item.normalized_name : item.name;
      const food = matchFood(name) ?? matchFood(item.name);
      const key = food?.id ?? normalizeFood(name);
      const entry = history.get(key) ?? { key, name: food?.name ?? item.name, purchases: [] };
      const unit = typeof item.unit === "string" ? unitKey(item.unit) : undefined;
      const quantity = typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : undefined;
      const price = typeof item.price === "number" && item.price > 0 ? item.price : undefined;
      // Receipt price is the line total; divide by its quantity, not a guessed package size.
      const purchase: Purchase = { date, quantity: quantity ? `${quantity} ${typeof item.unit === "string" ? item.unit : ""}`.trim() : "Confira a quantidade", ...(unit && quantity && price ? { unitPrice: price / (quantity * unit.factor), unit: unit.unit } : {}) };
      if (!entry.purchases.some(p => p.date === date)) entry.purchases.push(purchase);
      history.set(key, entry);
    }
  }
  return [...history.values()].map(h => ({ ...h, purchases: h.purchases.sort((a, b) => a.date - b.date) }));
}
export type Replenishment = { key: string; name: string; quantity: string; interval: number; daysUntil: number; date: number; confidence: "initial" | "pattern" | "custom"; count: number };
export function predictReplenishment(history: PurchaseHistory[], now = Date.now(), settings: ReplenishmentSetting[] = []): Replenishment[] {
  const today = Math.floor(now / DAY) * DAY;
  return history.flatMap(h => {
    const setting = settings.find(s => s.key === h.key);
    if (setting?.excluded) return [];
    const custom = setting?.intervalDays;
    const customInterval = typeof custom === "number" && Number.isInteger(custom) && custom >= 1 && custom <= 365 ? custom : undefined;
    const past = h.purchases.filter(p => p.date <= today);
    const last = lastOf(past);
    if (!last || (!customInterval && (past.length < 2 || today - last.date > 90 * DAY))) return [];
    const recent = past.slice(-6);
    const intervals = recent.slice(1).map((p, i) => (p.date - recent[i].date) / DAY).filter(n => n > 0);
    if (!customInterval && !intervals.length) return [];
    const interval = customInterval ?? Math.max(1, Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length));
    const date = last.date + interval * DAY;
    return [{ key: h.key, name: h.name, quantity: last.quantity, interval, date, daysUntil: Math.round((date - today) / DAY), confidence: customInterval ? "custom" as const : past.length >= 3 ? "pattern" as const : "initial" as const, count: past.length }];
  }).sort((a, b) => a.daysUntil - b.daysUntil);
}

export type Swap = { food: Food; healthReason?: string; savingPercent?: number; sourcePrice?: number; targetPrice?: number; unit?: string };
const allergySources: Record<string, string[]> = {
  leite: ["leite", "lactose"], lactose: ["leite", "lactose"], ovo: ["ovo"], ovos: ["ovo"], gluten: ["gluten", "aveia"], trigo: ["gluten", "aveia"], soja: ["soja"], peixe: ["peixe"], peixes: ["peixe"], castanhas: ["castanhas"], amendoim: ["amendoim", "castanhas"], oleaginosas: ["castanhas", "amendoim"], crustaceos: ["crustaceos"], camarao: ["crustaceos"]
};
export function foodAllowed(food: Food, prefs: Preferences, restrictions: string[] = []): boolean {
  const raw = [prefs.allergies, ...restrictions].join(",").split(/[,;\n]/).map(normalizeFood).filter(s => s && !["nenhuma", "nenhum", "sem restricoes"].includes(s));
  const vegetarian = prefs.diet === "Vegetariana" || raw.some(s => s.includes("vegetarian"));
  const vegan = prefs.diet === "Vegana" || raw.some(s => s.includes("vegan"));
  if ((vegan && !food.tags?.includes("vegano")) || (vegetarian && food.category === "proteinas" && !["ovo", "tofu"].includes(food.id))) return false;
  const allergens = (food.allergens ?? []).map(normalizeFood);
  // A dietary declaration outside the catalog is not a basis for declaring a swap safe.
  for (const r of raw) {
    if (r.includes("vegetarian") || r.includes("vegan") || r === "onivora") continue;
    const keys = Object.keys(allergySources).filter(k => r.split(" ").includes(k));
    if (!keys.length) return false;
    if (keys.flatMap(k => allergySources[k]).some(a => allergens.includes(a) || normalizeFood(food.name).includes(a))) return false;
    if (keys.includes("gluten") || keys.includes("trigo")) { if (!food.tags?.includes("sem-gluten")) return false; }
  }
  const dislikes = prefs.dislikes.split(/[,;\n]/).map(normalizeFood).filter(Boolean);
  return !dislikes.some(d => normalizeFood(food.name).includes(d) || (food.aliases ?? []).some(a => normalizeFood(a).includes(d)));
}
const rating = { bad: 0, moderate: 1, good: 2 };
export function suggestShoppingSwaps(name: string, history: PurchaseHistory[], prefs: Preferences, restrictions: string[] = []): Swap[] {
  const source = matchFood(name);
  if (!source) return [];
  const sourceHistory = history.find(h => h.key === source.id);
  const sourcePurchase = sourceHistory ? lastOf(sourceHistory.purchases) : undefined;
  return foodDatabase.flatMap(food => {
    if (food.id === source.id || !foodAllowed(food, prefs, restrictions)) return [];
    const curated = source.swapSuggestions?.includes(food.id);
    const sameCategory = food.category === source.category;
    if (!curated && !sameCategory) return [];
    const healthier = curated && (rating[food.rating] > rating[source.rating] || food.nova < source.nova);
    const targetHistory = history.find(h => h.key === food.id);
    const target = targetHistory ? lastOf(targetHistory.purchases) : undefined;
    const recentPrices = sourcePurchase && target && Math.abs(sourcePurchase.date - target.date) <= 30 * DAY && Date.now() - Math.min(sourcePurchase.date, target.date) <= 90 * DAY;
    const cheaper = sameCategory && recentPrices && sourcePurchase.unit && sourcePurchase.unit === target.unit && sourcePurchase.unitPrice && target.unitPrice && target.unitPrice < sourcePurchase.unitPrice && rating[food.rating] >= rating[source.rating] && food.nova <= source.nova;
    if (!healthier && !cheaper) return [];
    return [{ food, ...(healthier ? { healthReason: food.nova < source.nova ? "Menos processado" : "Melhor avaliação nutricional" } : {}), ...(cheaper ? { savingPercent: Math.round((1 - target.unitPrice / sourcePurchase.unitPrice) * 100), sourcePrice: sourcePurchase.unitPrice, targetPrice: target.unitPrice, unit: target.unit } : {}) }];
  }).sort((a, b) => (b.savingPercent ?? -1) - (a.savingPercent ?? -1)).slice(0, 3);
}