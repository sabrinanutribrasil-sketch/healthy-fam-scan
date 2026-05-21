// Edge function: OCR + AI extraction from receipt or food label image
// Uses Lovable AI Gateway (Gemini vision) with structured tool-calling output.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const receiptTool = {
  type: "function",
  function: {
    name: "extract_receipt",
    description: "Extract all food/grocery items from a Brazilian supermarket receipt (nota fiscal).",
    parameters: {
      type: "object",
      properties: {
        store: { type: "string", description: "Supermarket / store name if visible" },
        total: { type: "number", description: "Total amount in BRL" },
        purchased_at: { type: "string", description: "ISO date if visible" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Product name as read" },
              normalized_name: { type: "string", description: "Lowercase canonical name without brand" },
              category: {
                type: "string",
                enum: [
                  "frutas","vegetais","cereais","leguminosas","proteinas","laticinios",
                  "bebidas","snacks","doces","molhos","panificacao","congelados","oleos","outros",
                ],
              },
              nova_class: { type: "integer", minimum: 1, maximum: 4, description: "NOVA classification 1-4" },
              quantity: { type: "number" },
              unit: { type: "string", description: "kg, un, L, g..." },
              price: { type: "number" },
              health_flag: { type: "string", enum: ["good","warn","bad"] },
              reason: { type: "string", description: "Short reason for the health flag in Portuguese" },
            },
            required: ["name","normalized_name","category","nova_class","health_flag","reason"],
            additionalProperties: false,
          },
        },
        summary: {
          type: "object",
          properties: {
            healthy_count: { type: "integer" },
            warning_count: { type: "integer" },
            avoid_count: { type: "integer" },
            score: { type: "integer", minimum: 0, maximum: 100, description: "Overall basket score 0-100" },
            ai_tip: { type: "string", description: "One actionable tip in Brazilian Portuguese" },
          },
          required: ["healthy_count","warning_count","avoid_count","score","ai_tip"],
          additionalProperties: false,
        },
      },
      required: ["items","summary"],
      additionalProperties: false,
    },
  },
};

const labelTool = {
  type: "function",
  function: {
    name: "extract_label",
    description: "Extract the nutrition facts table and ingredients from a food product label.",
    parameters: {
      type: "object",
      properties: {
        product_name: { type: "string" },
        brand: { type: "string" },
        serving_size: { type: "string", description: "e.g. 30g, 200ml" },
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
        additives: { type: "array", items: { type: "string" }, description: "INS codes if present" },
        allergens: { type: "array", items: { type: "string" } },
        nova_class: { type: "integer", minimum: 1, maximum: 4 },
        health_flag: { type: "string", enum: ["good","warn","bad"] },
        warnings: { type: "array", items: { type: "string" }, description: "Brazilian front-label warnings such as 'alto em açúcar'" },
        ai_tip: { type: "string", description: "One actionable suggestion in Brazilian Portuguese" },
        swap_suggestion: { type: "string", description: "Healthier swap suggestion" },
      },
      required: ["product_name","nova_class","health_flag","ai_tip"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return json({ error: "LOVABLE_API_KEY is not configured" }, 500);
    }

    const body = await req.json();
    const { image, type } = body as { image?: string; type?: "receipt" | "label" };

    if (!image || typeof image !== "string" || image.length < 100) {
      return json({ error: "Imagem inválida" }, 400);
    }
    if (type !== "receipt" && type !== "label") {
      return json({ error: "type deve ser 'receipt' ou 'label'" }, 400);
    }

    // Accept either data URL or raw base64; normalize to data URL
    const dataUrl = image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;

    const tool = type === "receipt" ? receiptTool : labelTool;
    const fnName = tool.function.name;

    const systemPrompt =
      type === "receipt"
        ? "Você é um assistente nutricional brasileiro. Analise a foto da nota fiscal de supermercado, extraia TODOS os itens alimentícios, classifique cada um na escala NOVA (1=in natura, 2=culinário, 3=processado, 4=ultraprocessado), atribua um sinal de saúde (good/warn/bad) e gere um resumo. Use português do Brasil. Se houver itens não-alimentícios, ignore-os."
        : "Você é um assistente nutricional brasileiro. Analise a foto do rótulo do alimento (tabela nutricional e lista de ingredientes). Extraia valores por 100g, ingredientes, aditivos (INS), alegações de saúde e classifique na escala NOVA. Use português do Brasil.";

    const userPrompt =
      type === "receipt"
        ? "Extraia todos os produtos desta nota fiscal e preencha a função."
        : "Extraia a tabela nutricional, ingredientes e classificação deste rótulo.";

    const payload = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: fnName } },
    };

    const resp = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (resp.status === 429) return json({ error: "Limite de requisições atingido. Tente novamente em instantes." }, 429);
    if (resp.status === 402) return json({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }, 402);
    if (!resp.ok) {
      const txt = await resp.text();
      console.error("AI gateway error", resp.status, txt);
      return json({ error: "Falha ao processar imagem com IA" }, 500);
    }

    const data = await resp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) {
      return json({ error: "IA não retornou dados estruturados" }, 502);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(call.function.arguments);
    } catch {
      return json({ error: "Resposta da IA inválida" }, 502);
    }

    return json({ type, result: parsed });
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
