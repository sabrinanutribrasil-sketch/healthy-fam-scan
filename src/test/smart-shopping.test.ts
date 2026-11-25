import { describe, expect, it } from "vitest";
import { foodAllowed, matchFood, predictReplenishment, purchaseHistory, suggestShoppingSwaps, validateShoppingState } from "@/lib/smart-shopping";
import { defaultPreferences } from "@/lib/meal-planner";
import type { ScanRecord } from "@/hooks/use-family-data";
import { mergeShoppingState } from "../../supabase/functions/_shared/shopping-state";
const day = 86400000;
const today = Math.floor(Date.now() / day) * day;
const receipt = (ago: number, items: unknown[], type = "receipt"): ScanRecord => ({ id: String(ago), scan_type: type, created_at: new Date(today - ago * day).toISOString(), result: { items }, score: null, store: null, total: null, item_count: items.length, healthy_count: 0, warning_count: 0, avoid_count: 0 });
const food = (name: string, quantity = 1, unit = "kg", price = 10) => ({ name, normalized_name: name, category: "frutas", quantity, unit, price });

describe("replenishment predictions", () => {
  it("uses the family's 14-day interval instead of the observed seven days", () => {
    const h = purchaseHistory([receipt(10, [food("banana")]), receipt(3, [food("banana")])]);
    expect(predictReplenishment(h, today, [{ key: "banana", name: "Banana", intervalDays: 14, excluded: false }])[0]).toMatchObject({ interval: 14, daysUntil: 11, confidence: "custom" });
  });
  it("excludes only the selected food from predictions without changing purchase history", () => {
    const h = purchaseHistory([receipt(7, [food("banana"), food("tomate")]), receipt(0, [food("banana"), food("tomate")])]);
    expect(predictReplenishment(h, today, [{ key: "banana", name: "Banana", intervalDays: null, excluded: true }]).map(p => p.key)).toEqual(["tomate"]);
    expect(h.find(p => p.key === "banana")?.purchases.length).toBe(2);
  });
  it("restores an excluded food and retains its custom interval", () => {
    const h = purchaseHistory([receipt(3, [food("banana")])]);
    expect(predictReplenishment(h, today, [{ key: "banana", name: "Banana", intervalDays: 14, excluded: false }])[0]).toMatchObject({ key: "banana", interval: 14, daysUntil: 11 });
  });
  it("resetting to automatic uses observed intervals again", () => {
    const h = purchaseHistory([receipt(10, [food("banana")]), receipt(3, [food("banana")])]);
    expect(predictReplenishment(h, today, [{ key: "banana", name: "Banana", intervalDays: null, excluded: false }])[0]).toMatchObject({ interval: 7, daysUntil: 4, confidence: "initial" });
  });
  it("manual intervals need a real past purchase but not two receipts", () => {
    const setting = [{ key: "banana", name: "Banana", intervalDays: 10, excluded: false }];
    expect(predictReplenishment(purchaseHistory([receipt(2, [food("banana")])]), today, setting)[0]).toMatchObject({ daysUntil: 8, count: 1 });
    expect(predictReplenishment([], today, setting)).toEqual([]);
    expect(predictReplenishment(purchaseHistory([receipt(-2, [food("banana")])]), today, setting)).toEqual([]);
  });
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
  it("validates and persists frequency and exclusion together", () => {
    const state = { items: [], replenishment: [{ key: "banana", name: "Banana", intervalDays: 14, excluded: true }] };
    expect(validateShoppingState(state)).toEqual(state);
  });
  it("rejects invalid consumption intervals while accepting automatic mode and boundaries", () => {
    const setting = { key: "banana", name: "Banana", intervalDays: 14, excluded: false };
    for (const intervalDays of [0, -1, 366, 1.5, "7", undefined]) expect(() => validateShoppingState({ items: [], replenishment: [{ ...setting, intervalDays }] })).toThrow();
    for (const intervalDays of [null, 1, 365]) expect(validateShoppingState({ items: [], replenishment: [{ ...setting, intervalDays }] }).replenishment?.[0].intervalDays).toBe(intervalDays);
  });
  it("preserves saved forecast preferences when older Android clients update the checklist", () => {
    const current = { items: [], replenishment: [{ key: "banana", name: "Banana", intervalDays: 14, excluded: true }] };
    const items = [{ id: "1", name: "Banana", quantity: "1 kg", checked: true }];
    expect(mergeShoppingState(current, { items })).toEqual({ items, replenishment: current.replenishment });
  });
  it("accepts explicit clearing of forecast settings without erasing checklist items", () => {
    const items = [{ id: "1", name: "Banana", quantity: "1 kg", checked: false }];
    expect(mergeShoppingState({ items, replenishment: [{ key: "banana", name: "Banana", intervalDays: 14, excluded: true }] }, { items, replenishment: [] })).toEqual({ items, replenishment: [] });
  });
  it("rejects duplicate food controls", () => {
    const setting = { key: "banana", name: "Banana", intervalDays: 7, excluded: false };
    expect(() => validateShoppingState({ items: [], replenishment: [setting, setting] })).toThrow();
  });
  it("preserves checked status, quantity and the accepted substitution", () => {
    expect(validateShoppingState({ items: [{ id: "1", name: "Arroz integral", quantity: "1 kg", checked: true, original: "Arroz branco" }] }).items[0]).toEqual({ id: "1", name: "Arroz integral", quantity: "1 kg", checked: true, original: "Arroz branco" });
  });
  it("rejects duplicate IDs and more than 150 items", () => {
    const item = { id: "1", name: "Banana", quantity: "1 kg", checked: false };
    expect(() => validateShoppingState({ items: [item, item] })).toThrow();
    expect(() => validateShoppingState({ items: Array.from({ length: 151 }, (_, i) => ({ ...item, id: String(i) })) })).toThrow();
  });
});