// Edge function: Scan analysis for receipt or food label
// Returns structured nutritional analysis without external AI dependencies.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const mockReceipt = {
  store: "Supermercado Bom Preço",
  total: 127.80,
  items: [
    { name: "Banana Prata", normalized_name: "banana", category: "frutas", nova_class: 1, quantity: 1, unit: "kg", price: 6.50, health_flag: "good", reason: "Fruta in natura, rica em potássio." },
    { name: "Maçã Gala", normalized_name: "maca", category: "frutas", nova_class: 1, quantity: 6, unit: "un", price: 12.90, health_flag: "good", reason: "Fruta fresca, fonte de fibras." },
    { name: "Tomate", normalized_name: "tomate", category: "vegetais", nova_class: 1, quantity: 0.5, unit: "kg", price: 4.99, health_flag: "good", reason: "Vegetal in natura." },
    { name: "Alface Americana", normalized_name: "alface", category: "vegetais", nova_class: 1, quantity: 1, unit: "un", price: 3.50, health_flag: "good", reason: "Vegetal fresco, baixa caloria." },
    { name: "Peito de Frango", normalized_name: "frango peito", category: "proteinas", nova_class: 1, quantity: 1, unit: "kg", price: 22.90, health_flag: "good", reason: "Proteína magra in natura." },
    { name: "Feijão Preto", normalized_name: "feijao preto", category: "leguminosas", nova_class: 1, quantity: 1, unit: "kg", price: 8.99, health_flag: "good", reason: "Leguminosa rica em ferro e fibras." },
    { name: "Arroz Branco", normalized_name: "arroz branco", category: "cereais", nova_class: 1, quantity: 1, unit: "kg", price: 5.49, health_flag: "good", reason: "Cereal básico, preferir integral." },
    { name: "Leite Integral", normalized_name: "leite integral", category: "laticinios", nova_class: 1, quantity: 2, unit: "L", price: 15.80, health_flag: "good", reason: "Fonte de cálcio e proteína." },
    { name: "Refrigerante Cola 2L", normalized_name: "refrigerante cola", category: "bebidas", nova_class: 4, quantity: 1, unit: "un", price: 9.90, health_flag: "bad", reason: "Ultraprocessado, alto em açúcar adicionado." },
    { name: "Biscoito Recheado", normalized_name: "biscoito recheado", category: "snacks", nova_class: 4, quantity: 2, unit: "un", price: 7.80, health_flag: "bad", reason: "Ultraprocessado, rico em gordura e açúcar." },
    { name: "Pão de Forma Branco", normalized_name: "pao forma branco", category: "panificacao", nova_class: 4, quantity: 1, unit: "un", price: 6.50, health_flag: "warn", reason: "Ultraprocessado com aditivos, prefira pão fresco." },
    { name: "Iogurte Sabor Morango", normalized_name: "iogurte morango", category: "laticinios", nova_class: 4, quantity: 4, unit: "un", price: 14.00, health_flag: "warn", reason: "Ultraprocessado com açúcar adicionado e corantes." },
    { name: "Azeite de Oliva", normalized_name: "azeite", category: "oleos", nova_class: 2, quantity: 1, unit: "un", price: 18.90, health_flag: "good", reason: "Gordura boa, ingrediente culinário." },
  ],
  summary: {
    healthy_count: 9,
    warning_count: 2,
    avoid_count: 2,
    score: 72,
    ai_tip: "Sua cesta está boa! Reduza o refrigerante e biscoitos recheados — troque por frutas frescas e castanhas para subir o score.",
  },
};

const mockLabel = {
  product_name: "Biscoito Recheado de Chocolate",
  brand: "Marca Exemplo",
  serving_size: "30g",
  nutrition_per_100: {
    kcal: 480,
    protein: 5,
    carbs: 70,
    sugar: 35,
    fiber: 2,
    fat: 20,
    saturated_fat: 9,
    sodium_mg: 380,
  },
  ingredients: [
    "Farinha de trigo enriquecida",
    "Açúcar",
    "Gordura vegetal hidrogenada",
    "Cacau em pó",
    "Amido de milho",
    "Sal",
    "Fermento químico",
    "Emulsificante lecitina de soja",
    "Aroma artificial de chocolate",
  ],
  additives: ["INS 322 lecitina de soja", "INS 500 bicarbonato de sódio", "aroma artificial"],
  allergens: ["glúten", "soja", "leite"],
  nova_class: 4,
  health_flag: "bad",
  warnings: ["Alto em açúcar", "Alto em gordura saturada", "Contém gordura trans"],
  ai_tip: "Este produto é ultraprocessado. Troque por biscoitos integrais ou frutas secas para um lanche mais saudável.",
  swap_suggestion: "Castanhas com frutas frescas ou biscoito integral sem recheio.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body = await req.json();
    const { type } = body as { image?: string; type?: "receipt" | "label" };

    if (type !== "receipt" && type !== "label") {
      return json({ error: "type deve ser 'receipt' ou 'label'" }, 400);
    }

    await new Promise((r) => setTimeout(r, 1200));

    const result = type === "receipt" ? mockReceipt : mockLabel;
    return json({ type, result });
  } catch (err) {
    console.error("scan-analyze error", err);
    return json({ error: err instanceof Error ? err.message : "Erro desconhecido" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
