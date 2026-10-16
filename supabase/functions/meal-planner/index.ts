import { createClient } from "npm:@supabase/supabase-js@2";
import { planSchema, validateInput, validatePlan, type Preferences, type MealPlan } from "../_shared/meal-plan.ts";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

function generateMockPlan(pantry: { name: string; quantity: string }[], prefs: Preferences): MealPlan {
  const available = pantry.map(p => p.name);
  const shopping: { name: string; quantity: string; category: string }[] = [];

  const baseMeals: Record<string, { title: string; minutes: number; ingredients: { name: string; quantity: string; available: boolean }[]; steps: string[] }> = {
    "Café da manhã": {
      title: "Vitamina de frutas com aveia",
      minutes: 10,
      ingredients: [
        { name: "banana", quantity: "1 unidade", available: available.some(a => a.toLowerCase().includes("banana")) },
        { name: "aveia", quantity: "3 colheres de sopa", available: available.some(a => a.toLowerCase().includes("aveia")) },
        { name: "leite", quantity: "200ml", available: available.some(a => a.toLowerCase().includes("leite")) },
        { name: "mel", quantity: "1 colher de chá", available: false },
      ],
      steps: ["Bata todos os ingredientes no liquidificador.", "Sirva imediatamente."],
    },
    "Almoço": {
      title: "Arroz, feijão e frango grelhado com salada",
      minutes: 30,
      ingredients: [
        { name: "arroz", quantity: "2 xícaras", available: available.some(a => a.toLowerCase().includes("arroz")) },
        { name: "feijão", quantity: "1 concha", available: available.some(a => a.toLowerCase().includes("feijão")) },
        { name: "frango", quantity: "300g", available: available.some(a => a.toLowerCase().includes("frango")) },
        { name: "alface", quantity: "à vontade", available: available.some(a => a.toLowerCase().includes("alface")) },
        { name: "tomate", quantity: "1 unidade", available: available.some(a => a.toLowerCase().includes("tomate")) },
      ],
      steps: ["Cozinhe o arroz.", "Aqueça o feijão.", "Grelhe o frango temperado.", "Monte a salada e sirva."],
    },
    "Jantar": {
      title: "Sopa de legumes com ovo",
      minutes: 25,
      ingredients: [
        { name: "cenoura", quantity: "1 unidade", available: available.some(a => a.toLowerCase().includes("cenoura")) },
        { name: "batata", quantity: "1 unidade", available: available.some(a => a.toLowerCase().includes("batata")) },
        { name: "ovo", quantity: "2 unidades", available: available.some(a => a.toLowerCase().includes("ovo")) },
        { name: "cebola", quantity: "1/2 unidade", available: false },
      ],
      steps: ["Refogue a cebola.", "Adicione os legumes picados e água.", "Cozinhe até amaciar.", "Adicione os ovos cozidos e sirva."],
    },
  };

  const meals = prefs.meals.map(slot => {
    const base = baseMeals[slot] ?? baseMeals["Almoço"];
    return {
      slot,
      title: base.title,
      minutes: Math.min(base.minutes, prefs.minutes),
      ingredients: base.ingredients,
      steps: base.steps,
    };
  });

  const days = DAYS.map(day => ({ day, meals }));

  if (!available.some(a => a.toLowerCase().includes("mel"))) shopping.push({ name: "Mel", quantity: "1 pote pequeno", category: "Outros" });
  if (!available.some(a => a.toLowerCase().includes("cebola"))) shopping.push({ name: "Cebola", quantity: "1 kg", category: "Vegetais" });
  if (!available.some(a => a.toLowerCase().includes("cenoura"))) shopping.push({ name: "Cenoura", quantity: "1 kg", category: "Vegetais" });
  if (!available.some(a => a.toLowerCase().includes("batata"))) shopping.push({ name: "Batata", quantity: "1 kg", category: "Vegetais" });

  return {
    days,
    shopping,
    tips: [
      "Ajuste as quantidades conforme o apetite de cada membro da família.",
      "Reaproveite sobras para evitar desperdício.",
      "Confira os rótulos dos produtos antes de comprar.",
    ],
    estimated_cost: Math.min(prefs.budget, 80 * prefs.people),
  };
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Método inválido." }, 405);
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "Entre na sua conta para continuar." }, 401);
  try {
    const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_ANON_KEY");
    if (!url || !key) return json({ error: "Serviço indisponível." }, 503);
    const db = createClient(url, key, { global: { headers: { Authorization: authorization } } });
    const { data: auth, error: authError } = await db.auth.getUser();
    if (authError || !auth.user) return json({ error: "Entre novamente na sua conta." }, 401);
    const { data: profile } = await db.from("profiles").select("family_id").eq("id", auth.user.id).single();
    if (!profile?.family_id) return json({ error: "Sua conta precisa estar vinculada a uma família." }, 403);
    const { data: dbMembers } = await db.from("family_members")
      .select("display_name, dietary_restrictions, allergies, nutrition_goals")
      .eq("family_id", profile.family_id);
    const members = Array.isArray(dbMembers) ? dbMembers as { display_name: string; dietary_restrictions: string[]; allergies: string[]; nutrition_goals: string | null }[] : [];
    const memberRestrictions = [...new Set(members.flatMap(m => (m.dietary_restrictions ?? []).map(r => r.toLowerCase())))];
    const memberAllergies = [...new Set(members.flatMap(m => (m.allergies ?? []).map(a => a.toLowerCase())))];
    const memberGoals = members.map(m => m.nutrition_goals).filter(Boolean) as string[];
    if (Number(req.headers.get("content-length")) > 30000) return json({ error: "Dados muito extensos." }, 413);
    const raw = await req.text();
    if (raw.length > 30000) return json({ error: "Dados muito extensos." }, 413);
    let body;
    try { body = JSON.parse(raw); } catch { return json({ error: "Dados inválidos." }, 400); }
    const { data: existing, error: loadError } = await db.from("family_meal_planning").select("*").eq("family_id", profile.family_id).maybeSingle();
    if (loadError) throw new Error("Não foi possível abrir o cardápio.");
    if (body.action === "load") return json({ state: existing, members: { list: members, restrictions: memberRestrictions, allergies: memberAllergies, goals: memberGoals } });
    if (body.action === "check") {
      if (!Array.isArray(body.checked_items) || body.checked_items.length > 150 || body.checked_items.some((v: unknown) => typeof v !== "string" || v.length > 200)) return json({ error: "Lista inválida." }, 400);
      const { error } = await db.from("family_meal_planning").update({ checked_items: body.checked_items }).eq("family_id", profile.family_id);
      if (error) throw new Error("Não foi possível salvar a lista.");
      return json({ ok: true });
    }
    if (body.action !== "save" && body.action !== "generate") return json({ error: "Ação inválida." }, 400);
    try { validateInput(body.pantry, body.preferences); } catch (e) { return json({ error: (e as Error).message }, 400); }
    const { pantry } = body;
    // Merge member-derived restrictions/allergies into preferences for plan generation
    const userAllergies = String(body.preferences.allergies ?? "").trim();
    const mergedAllergies = [...new Set([
      ...userAllergies.split(/[,;\n]/).map(s => s.trim()).filter(s => s && s.toLowerCase() !== "nenhuma" && s.toLowerCase() !== "nenhum"),
      ...memberAllergies,
      ...memberRestrictions,
    ])];
    const userDislikes = String(body.preferences.dislikes ?? "").trim();
    const mergedDislikes = [...new Set([
      ...userDislikes.split(/[,;\n]/).map(s => s.trim()).filter(s => s),
      ...memberGoals,
    ])];
    const preferences = { ...body.preferences, allergies: mergedAllergies.join(", "), dislikes: mergedDislikes.join(", ") };
    if (body.action === "save") {
      const { error } = await db.from("family_meal_planning").upsert({ family_id: profile.family_id, pantry, preferences: body.preferences });
      if (error) throw new Error("Não foi possível salvar as preferências.");
      return json({ ok: true });
    }
    if (existing?.generated_at && Date.now() - new Date(existing.generated_at).getTime() < 30000) return json({ error: "Aguarde alguns segundos antes de gerar novamente." }, 429);

    await new Promise(r => setTimeout(r, 1500));
    const plan = validatePlan(generateMockPlan(pantry, preferences), preferences);
    const generated_at = new Date().toISOString();
    const { error } = await db.from("family_meal_planning").upsert({ family_id: profile.family_id, pantry, preferences: body.preferences, plan, generated_at, checked_items: [] });
    if (error) throw new Error("O cardápio não pôde ser salvo. Tente novamente.");
    return json({ plan, generated_at });
  } catch (e) {
    console.error("meal-planner failed", e instanceof Error ? e.name : "unknown");
    return json({ error: e instanceof Error && e.name === "TimeoutError" ? "A geração demorou mais que o esperado. Tente novamente." : "Não foi possível concluir. Tente novamente." }, 500);
  }
});

function strictSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(strictSchema);
  if (value && typeof value === "object") {
    const obj = Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, strictSchema(entry)]));
    if (obj.type === "object") obj.additionalProperties = false;
    return obj;
  }
  return value;
}
