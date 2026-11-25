import { useMemo, useState } from "react";
import { ArrowRightLeft, CalendarClock, Check, Download, Loader2, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { foodKey, predictReplenishment, purchaseHistory, suggestShoppingSwaps, type ShoppingState, type ShoppingItem } from "@/lib/smart-shopping";
import type { ScanRecord } from "@/hooks/use-family-data";
import type { MealPlan, Preferences } from "@/lib/meal-planner";

type Props = { scans: ScanRecord[]; historyLoading: boolean; historyError: string | null; prefs: Preferences; restrictions: string[]; plan: MealPlan | null; state: ShoppingState; onSave: (state: ShoppingState) => Promise<void> };
const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export function SmartShoppingList({ scans, historyLoading, historyError, prefs, restrictions, plan, state, onSave }: Props) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const history = useMemo(() => purchaseHistory(scans), [scans]);
  const predictions = useMemo(() => predictReplenishment(history), [history]);
  const soon = predictions.filter(p => p.daysUntil <= 7);
  const complete = state.items.filter(i => i.checked).length;
  const save = async (items: ShoppingItem[]) => {
    if (items.length > 150) { setError("A lista pode ter até 150 itens."); return false; }
    setSaving(true); setError(null);
    try { await onSave({ items }); return true; }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível salvar sua lista."); return false; }
    finally { setSaving(false); }
  };
  const add = async (food: string, amount = "") => {
    if (!food.trim()) return;
    if (state.items.some(i => foodKey(i.name) === foodKey(food))) { setError("Esse alimento já está na lista."); return; }
    if (await save([...state.items, { id: crypto.randomUUID(), name: food.trim().slice(0, 100), quantity: amount.slice(0, 60), checked: false }])) { setName(""); setQuantity(""); }
  };
  const download = () => {
    const content = ["NutriCasa · Lista de Compras Inteligente", ...state.items.map(i => `${i.checked ? "[x]" : "[ ]"} ${i.name} — ${i.quantity || "Quantidade a conferir"}${i.original ? ` (no lugar de ${i.original})` : ""}`), "", "Previsões baseadas em notas escaneadas, não no estoque real. Confira quantidades, rótulos e alergênicos."].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "nutricasa-compras-inteligentes.txt"; link.click(); URL.revokeObjectURL(url);
  };
  return <section className="space-y-5 border-b pb-6" aria-label="Lista de Compras Inteligente">
    <header className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="text-2xl leading-tight">Lista de Compras Inteligente</h2><p className="text-sm text-muted-foreground mt-2">{complete} de {state.items.length} itens comprados</p></div><Button size="icon" variant="outline" onClick={download} disabled={!state.items.length} aria-label="Baixar lista inteligente" title="Baixar lista inteligente"><Download /></Button></header>
    <section className="space-y-3">
      <h3 className="text-lg flex items-center gap-2"><CalendarClock className="w-5 h-5 text-primary shrink-0" /> Reposição prevista</h3>
      <p className="text-xs text-muted-foreground">Estimativa pelo intervalo entre suas compras. Não mede o estoque nem a validade dos alimentos.</p>
      {historyLoading ? <p role="status" className="text-sm text-muted-foreground">Consultando suas compras...</p> : historyError ? <p role="alert" className="text-sm text-destructive">Não foi possível consultar o histórico. Você ainda pode montar sua lista.</p> : !predictions.length ? <p className="text-sm text-muted-foreground">Escaneie notas de pelo menos duas datas com o mesmo alimento para começar a prever a reposição.</p> : <>
        {!soon.length && <p className="text-sm text-muted-foreground">Nenhuma reposição prevista para os próximos 7 dias.</p>}
        <ul className="divide-y">{soon.map(p => {
          const added = state.items.some(i => foodKey(i.name) === p.key);
          return <li key={p.key} className="flex items-center gap-3 py-3"><div className="min-w-0 flex-1"><p className="text-sm font-semibold break-words">{p.name}</p><p className="text-xs text-primary mt-1">{p.daysUntil < 0 ? "Confira o estoque: reposição prevista já passou" : p.daysUntil === 0 ? "Previsto para hoje" : `Previsto em ${p.daysUntil} dia(s)`}</p><p className="text-xs text-muted-foreground mt-1">A cada ~{p.interval} dias · {p.count} compras{p.confidence === "initial" ? " · previsão inicial" : ""}</p></div><Button size="icon" variant="outline" disabled={saving || added} onClick={() => add(p.name, p.quantity === "Confira a quantidade" ? "" : p.quantity)} aria-label={`Adicionar reposição de ${p.name}`} title={added ? "Já está na lista" : "Adicionar reposição"}>{added ? <Check /> : <Plus />}</Button></li>;
        })}</ul>
        {predictions.some(p => p.daysUntil > 7) && <details><summary className="text-sm cursor-pointer text-primary">Próximas reposições</summary><ul className="divide-y mt-2">{predictions.filter(p => p.daysUntil > 7).map(p => <li key={p.key} className="text-sm py-2 flex justify-between gap-3"><span className="break-words">{p.name}</span><span className="text-xs text-muted-foreground shrink-0">~{p.daysUntil} dias</span></li>)}</ul></details>}
      </>}
    </section>
    <section className="space-y-3">
      <div className="flex items-center gap-2"><ShoppingBasket className="w-5 h-5 text-primary" /><h3 className="text-lg">Minha próxima compra</h3></div>
      <form className="space-y-2" onSubmit={e => { e.preventDefault(); void add(name, quantity); }}><Input aria-label="Alimento da lista inteligente" placeholder="Qual alimento você precisa?" value={name} maxLength={100} disabled={saving} onChange={e => setName(e.target.value)} /><div className="flex gap-2"><Input aria-label="Quantidade para comprar" placeholder="Quantidade: 1 kg, 2 litros..." value={quantity} maxLength={60} disabled={saving} onChange={e => setQuantity(e.target.value)} /><Button type="submit" size="icon" disabled={saving || !name.trim()} aria-label="Adicionar à lista inteligente" title="Adicionar alimento">{saving ? <Loader2 className="animate-spin" /> : <Plus />}</Button></div></form>
      {plan && <Button variant="outline" className="w-full whitespace-normal h-auto min-h-10" disabled={saving || !plan.shopping.some(i => !state.items.some(s => foodKey(s.name) === foodKey(i.name)))} onClick={() => {
        const items = [...state.items];
        for (const i of plan.shopping) if (!items.some(s => foodKey(s.name) === foodKey(i.name))) items.push({ id: crypto.randomUUID(), name: i.name.slice(0, 100), quantity: i.quantity.slice(0, 60), checked: false });
        void save(items);
      }}><Plus />Adicionar ingredientes do cardápio</Button>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {!state.items.length && <p className="text-sm text-muted-foreground py-2">Sua próxima compra começa aqui.</p>}
      <ul className="divide-y">{state.items.map(item => {
        const swaps = item.checked ? [] : suggestShoppingSwaps(item.name, history, prefs, restrictions);
        return <li key={item.id} className="py-4 space-y-3">
          <div className="flex items-start gap-3"><Checkbox className="mt-1" aria-label={`Comprado: ${item.name}`} checked={item.checked} disabled={saving} onCheckedChange={v => void save(state.items.map(i => i.id === item.id ? { ...i, checked: v === true } : i))} /><div className="flex-1 min-w-0"><p className={`text-sm font-semibold break-words ${item.checked ? "line-through text-muted-foreground" : ""}`}>{item.name}</p>{item.original && <p className="text-xs text-primary mt-1 break-words">No lugar de {item.original}</p>}<Input className="mt-2 h-8 text-xs" aria-label={`Quantidade para ${item.name}`} placeholder="Confira a quantidade" maxLength={60} defaultValue={item.quantity} key={`${item.id}-${item.quantity}`} disabled={saving} onBlur={e => { if (e.target.value !== item.quantity) void save(state.items.map(i => i.id === item.id ? { ...i, quantity: e.target.value } : i)); }} /></div><Button size="icon" variant="ghost" disabled={saving} title="Remover alimento" aria-label={`Remover da lista: ${item.name}`} onClick={() => void save(state.items.filter(i => i.id !== item.id))}><Trash2 className="text-muted-foreground" /></Button></div>
          {swaps.length > 0 && <details className="pl-7"><summary className="text-sm text-primary cursor-pointer">Alternativas para esta compra ({swaps.length})</summary><ul className="space-y-3 mt-3">{swaps.map(swap => <li key={swap.food.id} className="border-l-2 border-primary/30 pl-3 space-y-2"><div><p className="text-sm font-medium">{swap.food.name}</p>{swap.healthReason && <p className="text-xs text-primary mt-1">{swap.healthReason}</p>}{swap.savingPercent !== undefined ? <p className="text-xs text-muted-foreground mt-1">~{swap.savingPercent}% menos por {swap.unit} nas suas notas: {money(swap.sourcePrice ?? 0)} → {money(swap.targetPrice ?? 0)}. Preço atual pode variar.</p> : <p className="text-xs text-muted-foreground mt-1">Economia ainda não confirmada nas suas notas.</p>}</div><Button variant="outline" size="sm" disabled={saving || state.items.some(i => i.id !== item.id && foodKey(i.name) === swap.food.id)} onClick={() => void save(state.items.map(i => i.id === item.id ? { ...i, name: swap.food.name, original: i.original ?? i.name, quantity: "" } : i))}><ArrowRightLeft />Usar alternativa</Button></li>)}</ul></details>}
        </li>;
      })}</ul>
      {saving && <p role="status" className="text-xs text-muted-foreground">Salvando para sua família...</p>}
      <p className="text-xs text-muted-foreground">As trocas não alteram receitas nem garantem equivalência nutricional. Ajuste quantidades e preparo; confira rótulos e alergênicos. Só comparamos preços por kg ou litro observados nas notas.</p>
    </section>
  </section>;
}