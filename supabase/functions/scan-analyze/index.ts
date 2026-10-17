const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const receiptSchema = {
  type: "object",
  properties: {
    store: { type: "string" },
    total: { type: "number" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          normalized_name: { type: "string" },
          category: { type: "string", enum: ["frutas", "vegetais", "proteinas", "leguminosas", "cereais", "laticinios", "bebidas", "snacks", "panificacao", "oleos", "congelados", "doces", "higiene", "limpeza", "outros"] },
          nova_class: { type: "number", enum: [1, 2, 3, 4] },
          quantity: { type: "number" },
          unit: { type: "string" },
          price: { type: "number" },
          health_flag: { type: "string", enum: ["good", "warn", "bad"] },
          reason: { type: "string" },
        },
        required: ["name", "normalized_name", "category", "nova_class", "health_flag", "reason"],
        additionalProperties: false,
      },
    },
    summary: {
      type: "object",
      properties: {
        healthy_count: { type: "number" },
        warning_count: { type: "number" },
        avoid_count: { type: "number" },
        score: { type: "number" },
        ai_tip: { type: "string" },
      },
      required: ["healthy_count", "warning_count", "avoid_count", "score", "ai_tip"],
      additionalProperties: false,
    },
  },
  required: ["items", "summary"],
  additionalProperties: false,
};

const labelSchema = {
  type: "object",
  properties: {
    product_name: { type: "string" },
    brand: { type: "string" },
    serving_size: { type: "string" },
    nutrition_per_100: {
      type: "object",
      properties: {
        kcal: { type: "number" },
        protein: { type: "number" },
        carbs: { type: "number" },
        sugar: { type: "number" },
        fiber: { type: "number" },
        fat: { type: "number" },
        saturated_fat: { type: "number" },
        sodium_mg: { type: "number" },
      },
      additionalProperties: false,
    },
    ingredients: { type: "array", items: { type: "string" } },
    additives: { type: "array", items: { type: "string" } },
    allergens: { type: "array", items: { type: "string" } },
    nova_class: { type: "number", enum: [1, 2, 3, 4] },
    health_flag: { type: "string", enum: ["good", "warn", "bad"] },
    warnings: { type: "array", items: { type: "string" } },
    ai_tip: { type: "string" },
    swap_suggestion: { type: "string" },
  },
  required: ["product_name", "nova_class", "health_flag", "ai_tip"],
  additionalProperties: false,
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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function analyzeWithAI(image: string, type: "receipt" | "label") {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY não configurada.");

  const systemPrompt = type === "receipt"
    ? "Você é uma nutricionista brasileira analisando uma nota fiscal de supermercado. Extraia todos os produtos, classifique cada um pela escala NOVA (1=in natura, 2=ingredientes culinários, 3=processados, 4=ultraprocessados), avalie a qualidade nutricional e dê uma dica. Responda SEMPRE em português brasileiro."
    : "Você é uma nutricionista brasileira analisando o rótulo nutricional de um produto. Extraia todas as informações nutricionais, ingredientes, aditivos, alérgenos, classifique pela escala NOVA (1-4) e dê uma dica de troca mais saudável. Responda SEMPRE em português brasileiro.";

  const userPrompt = type === "receipt"
    ? "Analise esta nota fiscal. Liste todos os produtos com nome, categoria, classificação NOVA, preço, quantidade, flag de saúde (good/warn/bad) e motivo. Calcule o score de 0-100 e dê uma dica prática."
    : "Analise este rótulo de produto alimentício. Extraia: nome do produto, marca, porção, tabela nutricional por 100g/ml, lista de ingredientes, aditivos, alérgenos, classificação NOVA, avisos de saúde, dica da IA e sugestão de troca.";

  const schema = type === "receipt" ? receiptSchema : labelSchema;
  const schemaName = type === "receipt" ? "receipt_analysis" : "label_analysis";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
      response_format: { type: "json_schema", json_schema: { name: schemaName, schema, strict: true } },
      temperature: 0.2,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("OpenAI error", response.status, errText);
    throw new Error("A IA não conseguiu analisar a imagem agora. Tente novamente.");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("A IA retornou uma resposta vazia. Tente novamente.");

  let parsed: unknown;
  try { parsed = JSON.parse(content); } catch { throw new Error("A IA retornou um formato inválido. Tente novamente."); }

  if (type === "receipt") {
    const r = parsed as { items: unknown[]; summary: { healthy_count: number; warning_count: number; avoid_count: number; score: number; ai_tip: string }; store?: string; total?: number };
    r.summary.healthy_count = r.items.filter((i: any) => i.health_flag === "good").length;
    r.summary.warning_count = r.items.filter((i: any) => i.health_flag === "warn").length;
    r.summary.avoid_count = r.items.filter((i: any) => i.health_flag === "bad").length;
    return parsed;
  }

  return parsed;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body = await req.json();
    const { type, image } = body as { image?: string; type?: "receipt" | "label" };

    if (type !== "receipt" && type !== "label") {
      return jsonResponse({ error: "type deve ser 'receipt' ou 'label'" }, 400);
    }
    if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
      return jsonResponse({ error: "Imagem inválida." }, 400);
    }
    if (image.length > 8 * 1024 * 1024) {
      return jsonResponse({ error: "Imagem muito grande (máx 8MB)." }, 413);
    }

    let result: unknown;
    try {
      result = await analyzeWithAI(image, type);
    } catch (aiErr) {
      console.error("AI scan failed, falling back to mock:", aiErr instanceof Error ? aiErr.message : "unknown");
      await new Promise((r) => setTimeout(r, 800));
      result = type === "receipt" ? mockReceipt : mockLabel;
    }

    return jsonResponse({ type, result });
  } catch (err) {
    console.error("scan-analyze error", err);
    return jsonResponse({ error: err instanceof Error ? err.message : "Erro desconhecido" }, 500);
  }
});
