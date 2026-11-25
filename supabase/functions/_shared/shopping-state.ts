export type ShoppingItem = { id: string; name: string; quantity: string; checked: boolean; original?: string };
export type ShoppingState = { items: ShoppingItem[] };

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
  return { items };
}