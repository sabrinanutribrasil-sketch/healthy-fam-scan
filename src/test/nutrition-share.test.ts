import { describe, it, expect } from "vitest";
import { nutritionShareData } from "@/lib/nutrition-share";
import type { ScanRecord } from "@/hooks/use-family-data";

const receipt: ScanRecord = { id: "1", scan_type: "receipt", score: 85, store: "Loja", total: 100, item_count: 3, healthy_count: 2, warning_count: 1, avoid_count: 0, created_at: "2026-11-25T12:00:00Z", result: { private: "details" } };
describe("nutrition sharing data", () => {
  it("uses an observed receipt score and not a label score", () => {
    expect(nutritionShareData([{ ...receipt, scan_type: "label", score: 99 }, receipt], "Família", false)?.score).toBe(85);
  });
  it("does not disclose family name or receipt details by default", () => {
    const data = nutritionShareData([receipt], "Nome privado", false);
    expect(data?.heading).toBe("Nossa casa");
    expect(JSON.stringify(data)).not.toMatch(/Nome privado|Loja|private/);
  });
  it("only includes the family name when opted in", () => {
    expect(nutritionShareData([receipt], "Família Silva", true)?.heading).toBe("Família Silva");
  });
  it("does not invent a score for empty or unscored receipts", () => {
    expect(nutritionShareData([], "", false)).toBeNull();
    expect(nutritionShareData([{ ...receipt, score: null }], "", false)).toBeNull();
  });
});