import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, CalendarDays, ShoppingBasket, Plus, Trash2, Sparkles, Loader2, Save, Clock, Download, AlertTriangle, Users, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { defaultPreferences, mealSlots, diets, validateInput, validatePlan, type PantryItem, type Preferences, type MealPlan } from "@/lib/meal-planner";
import mealPhoto from "@/assets/hero-meal.jpg";

async function request(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("meal-planner", { body });
  if (error) {
    let message = "Não foi possível concluir. Tente novamente.";
    if ("context" in error && error.context instanceof Response) {
      try { const details = await error.context.json(); message = details.error ?? message; } catch { /* use fallback */ }
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export default function MealPlanner() {
  const { user } = useAuth();
  const location = useLocation();
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [prefs, setPrefs] = useState<Preferences>({ ...defaultPreferences });
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState<"save" | "generate" | null>(null);
  const [tab, setTab] = useState("casa");
  const [day, setDay] = useState(0);
  const [generated, setGenerated] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [checking, setChecking] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [memberInfo, setMemberInfo] = useState<{ restrictions: string[]; allergies: string[]; goals: string[]; count: number }>({ restrictions: [], allergies: [], goals: [], count: 0 });
  useEffect(() => {
    let active = true;
    setLoading(true); setLoadFailed(false);
    request({ action: "load" }).then(data => {
      if (!active) return;
      const state = data.state;
      let items: PantryItem[] = state?.pantry ?? [];
      const savedPrefs = { ...defaultPreferences, ...state?.preferences };
      const imported = location.state?.pantry;
      if (Array.isArray(imported)) {
        const merged = [...items];
        for (const item of imported) if (typeof item.name === "string" && !merged.some(i => i.name.toLowerCase() === item.name.toLowerCase())) merged.push({ name: item.name.slice(0, 100), quantity: String(item.quantity ?? "").slice(0, 60) });
        items = merged.slice(0, 80); setDirty(true);
      }
      setPantry(items); setPrefs(savedPrefs); setChecked(state?.checked_items ?? []); setGenerated(state?.generated_at ?? null);
      if (data.members) {
        setMemberInfo({ restrictions: data.members.restrictions ?? [], allergies: data.members.allergies ?? [], goals: data.members.goals ?? [], count: data.members.list?.length ?? 0 });
        if ((!savedPrefs.allergies || savedPrefs.allergies === "") && (data.members.allergies?.length || data.members.restrictions?.length)) {
          const combined = [...new Set([...(data.members.allergies ?? []), ...(data.members.restrictions ?? [])])];
          setPrefs(p => ({ ...p, allergies: combined.join(", ") }));
          setDirty(true);
        }
      }
      if (state?.plan) { try { setPlan(validatePlan(state.plan, savedPrefs)); if (!imported) setTab("semana"); } catch { toast.error("O cardápio salvo precisa ser gerado novamente."); } }
    }).catch(e => { if (active) { toast.error(e.message); setLoadFailed(true); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id, attempt]);
  const changePrefs = (update: Partial<Preferences>) => { setPrefs(p => ({ ...p, ...update })); setDirty(true); };
  const add = () => {
    if (!name.trim()) return;
    if (pantry.length >= 80) { toast.error("Máximo de 80 alimentos."); return; }
    if (pantry.some(i => i.name.toLowerCase() === name.trim().toLowerCase())) { toast.error("Esse alimento já está na lista."); return; }
    setPantry(p => [...p, { name: name.trim(), quantity: quantity.trim() }]); setName(""); setQuantity(""); setDirty(true);
  };
  const submit = async (action: "save" | "generate") => {
    try {
      validateInput(pantry, prefs); setBusy(action);
      const data = await request({ action, pantry, preferences: prefs });
      if (action === "generate") { setPlan(validatePlan(data.plan, prefs)); setGenerated(data.generated_at); setChecked([]); setDay(0); setTab("semana"); }
      setDirty(false); toast.success(action === "save" ? "Preferências salvas!" : "Seu cardápio está pronto!");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Tente novamente."); }
    finally { setBusy(null); }
  };
  const toggleItem = async (id: string) => {
    const next = checked.includes(id) ? checked.filter(i => i !== id) : [...checked, id];
    setChecking(true);
    try { await request({ action: "check", checked_items: next }); setChecked(next); }
    catch (e) { toast.error((e as Error).message); } finally { setChecking(false); }
  };
  const download = () => {
    if (!plan) return;
    const content = ["NutriCasa · Lista de compras", ...plan.shopping.map((i, n) => `${checked.includes(String(n)) ? "[x]" : "[ ]"} ${i.category}: ${i.name} — ${i.quantity}`), "", "Confira estoques, quantidades e rótulos antes da compra."].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "nutricasa-lista-de-compras.txt"; a.click(); URL.revokeObjectURL(url);
  };
  const categories = [...new Set(plan?.shopping.map(i => i.category) ?? [])];
  return <div className="p-5 pb-8 space-y-5">
    <Button asChild variant="ghost" size="sm"><Link to="/app/receitas"><ArrowLeft /> Receitas</Link></Button>
    <header><h1 className="text-3xl font-display">Cardápio da casa</h1><p className="text-sm text-muted-foreground mt-1">Sua semana, do café ao jantar</p></header>
    <img src={mealPhoto} alt="Refeição com vegetais frescos e alimentos variados" className="w-full h-32 object-cover rounded-xl" />
    {loading ? <div role="status" className="flex items-center justify-center gap-2 py-12"><Loader2 className="animate-spin w-5 h-5" /> Abrindo seu cardápio...</div> : loadFailed ? <div className="space-y-3"><p>Não foi possível abrir os dados da sua família.</p><Button onClick={() => setAttempt(a => a + 1)}>Tentar novamente</Button></div> : <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="w-full grid grid-cols-3"><TabsTrigger value="casa">Minha casa</TabsTrigger><TabsTrigger value="semana" disabled={!plan}>Semana</TabsTrigger><TabsTrigger value="compras" disabled={!plan}>Compras</TabsTrigger></TabsList>
      <TabsContent value="casa" className="space-y-6 pt-3">
        <fieldset disabled={!!busy} className="space-y-6 min-w-0">
          <section className="space-y-3"><h2 className="text-xl flex items-center gap-2"><ShoppingBasket className="w-5 h-5 text-primary" /> Alimentos disponíveis</h2>
            <div className="space-y-2"><Label htmlFor="food-name">Alimento</Label><Input id="food-name" placeholder="Ex.: arroz, feijão, cenoura" maxLength={100} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }} /><div className="flex gap-2"><Input aria-label="Quantidade disponível" placeholder="Quantidade: 1 kg, 6 unidades..." maxLength={60} value={quantity} onChange={e => setQuantity(e.target.value)} /><Button size="icon" title="Adicionar alimento" aria-label="Adicionar alimento" onClick={add}><Plus /></Button></div></div>
            {!pantry.length && <p className="text-sm text-muted-foreground">Nenhum alimento informado.</p>}
            <ul className="divide-y border-y">{pantry.map((i, n) => <li key={`${i.name}-${n}`} className="flex items-center gap-2 py-2"><div className="flex-1 min-w-0"><p className="text-sm font-medium break-words">{i.name}</p><Input aria-label={`Quantidade de ${i.name}`} className="h-8 mt-1 text-xs" placeholder="Quantidade não informada" value={i.quantity} maxLength={60} onChange={e => { setPantry(p => p.map((item, idx) => idx === n ? { ...item, quantity: e.target.value } : item)); setDirty(true); }} /></div><Button variant="ghost" size="icon" aria-label={`Remover ${i.name}`} title="Remover alimento" onClick={() => { setPantry(p => p.filter((_, idx) => idx !== n)); setDirty(true); }}><Trash2 className="text-muted-foreground" /></Button></li>)}</ul>
          </section>
          <section className="space-y-4"><h2 className="text-xl">Preferências da família</h2>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="people">Pessoas</Label><Input id="people" type="number" min={1} max={12} value={prefs.people} onChange={e => changePrefs({ people: Number(e.target.value) })} /></div><div className="space-y-2"><Label htmlFor="budget">Compras extras (R$)</Label><Input id="budget" type="number" min={0} max={10000} value={prefs.budget} onChange={e => changePrefs({ budget: Number(e.target.value) })} /></div></div>
            <div className="space-y-2"><Label htmlFor="minutes">Tempo por receita (minutos)</Label><Input id="minutes" type="number" min={10} max={120} value={prefs.minutes} onChange={e => changePrefs({ minutes: Number(e.target.value) })} /></div>
            <div className="space-y-2"><Label htmlFor="diet">Alimentação</Label><select id="diet" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={prefs.diet} onChange={e => changePrefs({ diet: e.target.value })}>{diets.map(d => <option key={d}>{d}</option>)}</select></div>
            {(memberInfo.restrictions.length > 0 || memberInfo.allergies.length > 0) && (
              <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary"><Users className="w-4 h-4" /> Vindos dos membros da família ({memberInfo.count})</div>
                <div className="flex flex-wrap gap-1.5">
                  {memberInfo.restrictions.map(r => <span key={r} className="px-2.5 py-1 rounded-full bg-warning/10 text-warning text-xs font-semibold">{r}</span>)}
                  {memberInfo.allergies.map(a => <span key={a} className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold flex items-center gap-1"><ShieldAlert className="w-3 h-3" />{a}</span>)}
                </div>
                <p className="text-xs text-muted-foreground">Estas restrições e alergias dos membros cadastrados são incluídas automaticamente ao gerar o cardápio.</p>
              </div>
            )}
            <div className="space-y-2"><Label htmlFor="allergies">Alergias e restrições adicionais</Label><Textarea id="allergies" placeholder="Ex.: amendoim, leite, glúten. Se não houver, escreva nenhuma." maxLength={500} value={prefs.allergies} onChange={e => changePrefs({ allergies: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="dislikes">Alimentos que a família não gosta</Label><Textarea id="dislikes" placeholder="Ex.: quiabo, berinjela" maxLength={500} value={prefs.dislikes} onChange={e => changePrefs({ dislikes: e.target.value })} /></div>
            <div className="space-y-3"><Label>Refeições da semana</Label>{mealSlots.map(slot => <label key={slot} className="flex items-center gap-3 text-sm"><Checkbox checked={prefs.meals.includes(slot)} onCheckedChange={v => changePrefs({ meals: v === true ? [...prefs.meals, slot] : prefs.meals.filter(m => m !== slot) })} />{slot}</label>)}</div>
          </section>
        </fieldset>
        <p className="text-xs text-muted-foreground">Os alimentos e preferências serão usados pela IA e salvos para sua família. Evite informar dados médicos pessoais.</p>
        <div className="space-y-2"><Button className="w-full h-12" disabled={!!busy || !pantry.length} onClick={() => submit("generate")}>{busy === "generate" ? <Loader2 className="animate-spin" /> : <Sparkles />}{busy === "generate" ? "Preparando sua semana..." : plan ? "Gerar novo cardápio" : "Gerar cardápio de 7 dias"}</Button><Button variant="outline" className="w-full" disabled={!!busy || !pantry.length} onClick={() => submit("save")}>{busy === "save" ? <Loader2 className="animate-spin" /> : <Save />}Salvar alimentos e preferências</Button></div>
        {busy === "generate" && <p role="status" className="text-sm text-muted-foreground">Planejando as refeições e reunindo os ingredientes. Pode levar alguns instantes.</p>}
      </TabsContent>
      {plan && <><TabsContent value="semana" className="space-y-4 pt-3">
        <div className="flex items-center gap-2 text-sm text-primary"><CalendarDays className="w-4 h-4" />{prefs.people} pessoas{generated && <span className="ml-auto text-xs text-muted-foreground">{new Date(generated).toLocaleDateString("pt-BR")}</span>}</div>
        {dirty && <p className="text-sm text-warning-foreground bg-warning/10 p-3 rounded-lg">As preferências mudaram. Gere novamente para atualizar este cardápio.</p>}
        <div className="grid grid-cols-7 gap-1" role="group" aria-label="Dia da semana">{plan.days.map((d, n) => <Button key={d.day} variant={day === n ? "default" : "outline"} className="px-0 text-xs" aria-label={d.day} aria-pressed={day === n} onClick={() => setDay(n)}>{d.day.slice(0, 3)}</Button>)}</div>
        <h2 className="text-2xl">{plan.days[day]?.day}</h2>
        {plan.days[day]?.meals.map(m => <article key={m.slot} className="border bg-card rounded-lg p-4 space-y-3"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-primary">{m.slot}</span><span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{m.minutes} min</span></div><h3 className="text-xl leading-snug break-words">{m.title}</h3><details><summary className="text-sm font-medium cursor-pointer">Ingredientes e preparo</summary><ul className="space-y-2 text-sm my-3">{m.ingredients.map((i, idx) => <li key={idx} className="flex justify-between gap-2"><span className="break-words">{i.quantity} · {i.name}</span><span className={`text-xs shrink-0 ${i.available ? "text-primary" : "text-muted-foreground"}`}>{i.available ? "Em casa" : "Comprar"}</span></li>)}</ul><ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">{m.steps.map((s, idx) => <li key={idx}>{s}</li>)}</ol></details></article>)}
        {plan.tips.length > 0 && <section className="border-t pt-4 space-y-2"><h2 className="text-xl">Para aproveitar melhor</h2>{plan.tips.map((tip, n) => <p key={n} className="text-sm text-muted-foreground">{tip}</p>)}</section>}
        <Button variant="outline" className="w-full" onClick={() => setTab("compras")}><ShoppingBasket />Ver lista de compras</Button>
      </TabsContent><TabsContent value="compras" className="space-y-5 pt-3"><div className="flex items-start justify-between gap-2"><div><h2 className="text-xl">O que falta comprar</h2><p className="text-xs text-muted-foreground mt-1">{checked.length} de {plan.shopping.length} itens marcados</p></div><Button variant="outline" size="icon" title="Baixar lista" aria-label="Baixar lista" onClick={download}><Download /></Button></div>
        <div className="bg-secondary text-secondary-foreground p-3 rounded-lg"><p className="font-semibold">Estimativa: {money(plan.estimated_cost)}</p><p className="text-xs mt-1">Preços variam por região. Orçamento informado: {money(prefs.budget)}.</p>{plan.estimated_cost > prefs.budget && <p className="text-xs mt-2 font-semibold">A estimativa ultrapassa o orçamento; revise as compras.</p>}</div>
        {!plan.shopping.length && <p className="text-sm text-muted-foreground">Nenhum ingrediente adicional indicado. Confira as quantidades em casa.</p>}
        {categories.map(category => <section key={category}><h3 className="text-lg mb-2">{category}</h3><ul className="divide-y">{plan.shopping.map((i, n) => i.category !== category ? null : <li key={n}><label className="flex items-start gap-3 py-3 cursor-pointer"><Checkbox className="mt-1" disabled={checking} checked={checked.includes(String(n))} onCheckedChange={() => toggleItem(String(n))} /><span className={`text-sm break-words ${checked.includes(String(n)) ? "line-through text-muted-foreground" : ""}`}>{i.name}<span className="block text-xs text-muted-foreground mt-1">{i.quantity}</span></span></label></li>)}</ul></section>)}
      </TabsContent></>}
    </Tabs>}
    <aside className="flex items-start gap-2 border-t pt-4 text-xs text-muted-foreground"><AlertTriangle className="w-4 h-4 shrink-0" /><p>Sugestões educativas, não prescrições nutricionais. A IA pode errar: confira ingredientes, quantidades, rótulos e contaminação cruzada, especialmente em caso de alergias. Para necessidades médicas ou infantis, consulte um profissional.</p></aside>
  </div>;
}