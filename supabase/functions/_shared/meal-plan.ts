export type PantryItem = { name: string; quantity: string };
export type Preferences = { people: number; budget: number; minutes: number; diet: string; allergies: string; dislikes: string; meals: string[] };
export type Meal = { slot: string; title: string; minutes: number; ingredients: { name: string; quantity: string; available: boolean }[]; steps: string[] };
export type MealPlan = { days: { day: string; meals: Meal[] }[]; shopping: { name: string; quantity: string; category: string }[]; tips: string[]; estimated_cost: number };
export const defaultPreferences: Preferences = { people: 4, budget: 200, minutes: 30, diet: "Onívora", allergies: "", dislikes: "", meals: ["Café da manhã", "Almoço", "Jantar"] };
export const mealSlots = ["Café da manhã", "Almoço", "Jantar"];
export const diets = ["Onívora", "Vegetariana", "Vegana"];
const text = (v: unknown, max = 160): v is string => typeof v === "string" && v.trim().length > 0 && v.length <= max;
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
export function validateInput(pantry: unknown, preferences: unknown): asserts preferences is Preferences {
  if (!Array.isArray(pantry) || pantry.length < 1 || pantry.length > 80 || pantry.some(i => !record(i) || !text(i.name, 100) || typeof i.quantity !== "string" || i.quantity.length > 60)) throw new Error("Informe de 1 a 80 alimentos com quantidades válidas.");
  if (!record(preferences) || !Number.isInteger(preferences.people) || Number(preferences.people) < 1 || Number(preferences.people) > 12 || !Number.isFinite(preferences.budget) || Number(preferences.budget) < 0 || Number(preferences.budget) > 10000 || !Number.isInteger(preferences.minutes) || Number(preferences.minutes) < 10 || Number(preferences.minutes) > 120 || !diets.includes(String(preferences.diet)) || typeof preferences.allergies !== "string" || preferences.allergies.length > 500 || typeof preferences.dislikes !== "string" || preferences.dislikes.length > 500 || !Array.isArray(preferences.meals) || preferences.meals.length < 1 || preferences.meals.length > 3 || new Set(preferences.meals).size !== preferences.meals.length || preferences.meals.some(m => !mealSlots.includes(m))) throw new Error("Confira as preferências, pessoas, orçamento e refeições.");
}
const normalize = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function validatePlan(value: unknown, prefs: Preferences): MealPlan {
  if (!record(value) || !Array.isArray(value.days) || value.days.length !== 7 || !Array.isArray(value.shopping) || value.shopping.length > 150 || !Array.isArray(value.tips) || value.tips.length > 8 || value.tips.some(t => !text(t, 600)) || !Number.isFinite(value.estimated_cost) || Number(value.estimated_cost) < 0) throw new Error("A IA retornou um cardápio incompleto. Tente novamente.");
  const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  for (let index = 0; index < 7; index++) {
    const d = value.days[index];
    if (!record(d) || d.day !== days[index] || !Array.isArray(d.meals) || d.meals.length !== prefs.meals.length) throw new Error("A IA não completou os sete dias e refeições.");
    const slots = new Set<string>();
    for (const m of d.meals) {
      if (!record(m) || !text(m.slot) || !prefs.meals.includes(m.slot) || slots.has(m.slot) || !text(m.title) || !Number.isFinite(m.minutes) || Number(m.minutes) <= 0 || Number(m.minutes) > prefs.minutes || !Array.isArray(m.ingredients) || m.ingredients.length < 1 || m.ingredients.length > 30 || m.ingredients.some(i => !record(i) || !text(i.name) || !text(i.quantity, 100) || typeof i.available !== "boolean") || !Array.isArray(m.steps) || m.steps.length < 1 || m.steps.length > 15 || m.steps.some(s => !text(s, 1000))) throw new Error("Uma receita precisa ser revisada pela IA. Tente novamente.");
      slots.add(m.slot);
    }
  }
  if (value.shopping.some(i => !record(i) || !text(i.name) || !text(i.quantity, 100) || !text(i.category, 100))) throw new Error("A lista de compras veio incompleta.");
  // Supplement model exclusions with a deterministic check for common allergen sources.
  const aliases: Record<string, string[]> = { leite: ["leite", "queijo", "iogurte", "manteiga", "creme de leite", "requeijao"], lactose: ["leite", "queijo", "iogurte", "manteiga", "requeijao"], ovo: ["ovo", "ovos", "maionese"], ovos: ["ovo", "ovos", "maionese"], gluten: ["trigo", "centeio", "cevada", "pao", "macarrao", "cuscuz de trigo", "aveia"], amendoim: ["amendoim", "pasta de amendoim"], soja: ["soja", "tofu", "shoyu"], peixe: ["peixe", "atum", "sardinha", "salmao", "tilapia"], crustaceos: ["camarao", "caranguejo", "lagosta"] };
  const excluded = normalize(prefs.allergies).split(/[,;\n]/).map(s => s.trim()).filter(s => s && s !== "nenhuma" && s !== "nenhum");
  const names = (value.days as MealPlan["days"]).flatMap(d => d.meals.flatMap(m => m.ingredients.map(i => normalize(i.name)))).concat((value.shopping as MealPlan["shopping"]).map(i => normalize(i.name)));
  for (const allergy of excluded) {
    const terms = Object.keys(aliases).filter(key => allergy.includes(key)).flatMap(key => aliases[key]);
    terms.push(allergy);
    if (names.some(n => terms.some(t => new RegExp(`(^|[^a-z])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`).test(n)))) throw new Error("A IA sugeriu um ingrediente incompatível com as restrições. Revise as alergias e gere novamente.");
  }
  return value as MealPlan;
}
const str = { type: "string" };
export const planSchema = {
  type: "object", properties: {
    days: { type: "array", minItems: 7, maxItems: 7, items: { type: "object", properties: { day: str, meals: { type: "array", items: { type: "object", properties: { slot: str, title: str, minutes: { type: "number" }, ingredients: { type: "array", items: { type: "object", properties: { name: str, quantity: str, available: { type: "boolean" } }, required: ["name", "quantity", "available"] } }, steps: { type: "array", items: str } }, required: ["slot", "title", "minutes", "ingredients", "steps"] } } }, required: ["day", "meals"] } },
    shopping: { type: "array", items: { type: "object", properties: { name: str, quantity: str, category: str }, required: ["name", "quantity", "category"] } }, tips: { type: "array", items: str }, estimated_cost: { type: "number" }
  }, required: ["days", "shopping", "tips", "estimated_cost"]
};