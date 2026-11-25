export type ShoppingItem = { id: string; name: string; quantity: string; checked: boolean; original?: string };
export type ReplenishmentSetting = { key: string; name: string; intervalDays: number | null; excluded: boolean };
export type ShoppingState = { items: ShoppingItem[]; replenishment?: ReplenishmentSetting[] };

export function validateShoppingState(value: unknown): ShoppingState {
  if (!value || typeof value !== "object" || !("items" in value) || !Array.isArray(value.items) || value.items.length > 150) throw new Error("A lista pode ter até 150 itens.");
  const ids = new Set<string>();
  const items: ShoppingItem[] = value.items.map((item: unknown) => {
    if (!item || typeof item !== "object") throw new Error("Item inválido.");
    const i = item as Record<string, unknown>;
    if (typeof i.id !== "string" || !i.id.trim() || i.id.length > 100 || ids.has(i.id) || typeof i.name !== "string" || !i.name.trim() || i.name.length > 100 || typeof i.quantity !== "string" || i.quantity.length > 60 || typeof i.checked !== "boolean" || (i.original !== undefined && (typeof i.original !== "string" || i.original.length > 100))) throw new Error("Confira os alimentos e quantidades da lista.");
    ids.add(i.id);
    return { id: i.id, name: i.name.trim(), quantity: i.quantity.trim(), checked: i.checked, ...(typeof i.original === "string" ? { original: i.original } : {}) };
  });
  if (!("replenishment" in value)) return { items };
  if (!Array.isArray(value.replenishment) || value.replenishment.length > 150) throw new Error("Confira as preferências de reposição.");
  const keys = new Set<string>();
  const replenishment: ReplenishmentSetting[] = value.replenishment.map((entry: unknown) => {
    if (!entry || typeof entry !== "object") throw new Error("Preferência de reposição inválida.");
    const r = entry as Record<string, unknown>;
    if (typeof r.key !== "string" || !r.key.trim() || r.key.length > 100 || keys.has(r.key) || typeof r.name !== "string" || !r.name.trim() || r.name.length > 100 || typeof r.excluded !== "boolean" || (r.intervalDays !== null && (!Number.isInteger(r.intervalDays) || Number(r.intervalDays) < 1 || Number(r.intervalDays) > 365))) throw new Error("O intervalo de reposição deve ser de 1 a 365 dias, ou automático.");
    keys.add(r.key);
    return { key: r.key, name: r.name.trim(), intervalDays: r.intervalDays as number | null, excluded: r.excluded };
  });
  return { items, replenishment };
}

// Older installed clients send only items; preserve the family's saved forecast controls.
export function mergeShoppingState(current: unknown, incoming: unknown): ShoppingState {
  const next = validateShoppingState(incoming);
  if (next.replenishment !== undefined) return next;
  const previous = validateShoppingState(current ?? { items: [] });
  return { ...next, ...(previous.replenishment !== undefined ? { replenishment: previous.replenishment } : {}) };
}