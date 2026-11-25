import { describe, expect, it } from "vitest";
import { foodAllowed, matchFood, predictReplenishment, purchaseHistory, suggestShoppingSwaps, validateShoppingState } from "@/lib/smart-shopping";
import { defaultPreferences } from "@/lib/meal-planner";
import type { ScanRecord } from "@/hooks/use-family-data";
const day = 86400000;
const today = Math.floor(Date.now() / day) * day;
const receipt = (ago: number, items: unknown[], type = "receipt"): ScanRecord => ({ id: String(ago), scan_type: type, created_at: new Date(today - ago * day).toISOString(), result: { items }, score: null, store: null, total: null, item_count: items.length, healthy_count: 0, warning_count: 0, avoid_count: 0 });
const food = (name: string, quantity = 1, unit = "kg", price = 10) => ({ name, normalized_name: name, category: "frutas", quantity, unit, price });

describe("replenishment predictions", () => {
  it("predicts weekly replenishment from three purchases seven days apart", () => {
    const result = predictReplenishment(purchaseHistory([receipt(17, [food("banana")]), receipt(10, [food("banana")]), receipt(3, [food("banana")])]), today);
    expect(result[0]).toMatchObject({ key: "banana", interval: 7, daysUntil: 4, count: 3, confidence: "pattern" });
  });
  it("does not invent a prediction from a single purchase", () => {
    expect(predictReplenishment(purchaseHistory([receipt(1, [food("banana")])]), today)).toEqual([]);
  });
  it("counts repeated receipts on one day only once", () => {
    const h = purchaseHistory([receipt(7, [food("banana")]), receipt(7, [food("banana")]), receipt(0, [food("banana")])]);
    expect(predictReplenishment(h, today)[0]).toMatchObject({ interval: 7, count: 2, confidence: "initial" });
  });
  it("excludes labels, non-food items, invalid dates and future purchases", () => {
    const scans = [receipt(7, [food("banana")]), receipt(0, [food("banana")], "label"), receipt(-7, [food("banana")]), receipt(0, [{ ...food("sabao"), category: "limpeza" }]), { ...receipt(0, [food("banana")]), created_at: "invalid" }];
    expect(predictReplenishment(purchaseHistory(scans), today)).toEqual([]);
    expect(purchaseHistory(scans).some(h => h.key === "sabao")).toBe(false);
  });
});
describe("healthier and economical substitutions", () => {
  it("suggests integral rice as a healthier substitution for white rice", () => {
    expect(suggestShoppingSwaps("Arroz branco", [], defaultPreferences).some(s => s.food.id === "arroz-integral" && s.healthReason && s.savingPercent === undefined)).toBe(true);
  });
  it("compares observed line totals at equivalent kg units", () => {
    const history = purchaseHistory([receipt(1, [food("arroz branco", 2, "kg", 20), food("arroz integral", 500, "g", 4)])]);
    expect(suggestShoppingSwaps("Arroz branco", history, defaultPreferences)[0]).toMatchObject({ food: { id: "arroz-integral" }, savingPercent: 20, sourcePrice: 10, targetPrice: 8, unit: "kg" });
  });
  it("does not claim savings for mismatched units or unknown package sizes", () => {
    for (const unit of ["un", "L"]) {
      const h = purchaseHistory([receipt(1, [food("arroz branco", 1, "kg", 20), food("arroz integral", 1, unit, 4)])]);
      expect(suggestShoppingSwaps("Arroz branco", h, defaultPreferences)[0].savingPercent).toBeUndefined();
    }
  });
  it("does not claim savings from stale prices", () => {
    const h = purchaseHistory([receipt(100, [food("arroz branco", 1, "kg", 20), food("arroz integral", 1, "kg", 4)])]);
    expect(suggestShoppingSwaps("Arroz branco", h, defaultPreferences)[0].savingPercent).toBeUndefined();
  });
  it("excludes family milk allergy sources even if the editable preferences omit them", () => {
    expect(suggestShoppingSwaps("Iogurte sabor morango", [], defaultPreferences, ["leite"]).some(s => s.food.id === "iogurte-natural")).toBe(false);
  });
  it("excludes oats when gluten is declared", () => {
    expect(suggestShoppingSwaps("Biscoito recheado", [], { ...defaultPreferences, allergies: "glúten" }).some(s => s.food.id === "aveia")).toBe(false);
  });
  it("does not recommend fish or chicken to a vegetarian household", () => {
    expect(suggestShoppingSwaps("Carne bovina (acém)", [], { ...defaultPreferences, diet: "Vegetariana" }).some(s => ["salmao", "frango-peito"].includes(s.food.id))).toBe(false);
  });
  it("only recommends catalog-confirmed vegan alternatives and respects dislikes", () => {
    const banana = matchFood("banana");
    if (!banana) throw new Error("Missing catalog banana");
    expect(foodAllowed(banana, { ...defaultPreferences, diet: "Vegana", dislikes: "banana" })).toBe(false);
    expect(suggestShoppingSwaps("Iogurte sabor morango", [], { ...defaultPreferences, diet: "Vegana" }).some(s => s.food.id === "iogurte-natural")).toBe(false);
  });
  it("withholds swaps for unknown restrictions rather than guaranteeing safety", () => {
    expect(suggestShoppingSwaps("Arroz branco", [], defaultPreferences, ["alergia rara"])).toEqual([]);
  });
});
describe("shared checklist validation", () => {
  it("preserves checked status, quantity and the accepted substitution", () => {
    expect(validateShoppingState({ items: [{ id: "1", name: "Arroz integral", quantity: "1 kg", checked: true, original: "Arroz branco" }] }).items[0]).toEqual({ id: "1", name: "Arroz integral", quantity: "1 kg", checked: true, original: "Arroz branco" });
  });
  it("rejects duplicate IDs and more than 150 items", () => {
    const item = { id: "1", name: "Banana", quantity: "1 kg", checked: false };
    expect(() => validateShoppingState({ items: [item, item] })).toThrow();
    expect(() => validateShoppingState({ items: Array.from({ length: 151 }, (_, i) => ({ ...item, id: String(i) })) })).toThrow();
  });
});