// Banco de alimentos NutriCasa
// Classificação NOVA (1-4) + valores nutricionais por 100g
// Usado para alimentar a análise da IA sobre compras e rótulos.

export type NovaGroup = 1 | 2 | 3 | 4;
// 1: in natura/minimamente processado
// 2: ingrediente culinário processado
// 3: processado
// 4: ultraprocessado

export type FoodCategory =
  | "frutas"
  | "vegetais"
  | "cereais"
  | "leguminosas"
  | "proteinas"
  | "laticinios"
  | "bebidas"
  | "snacks"
  | "doces"
  | "molhos"
  | "panificacao"
  | "congelados"
  | "oleos";

export type HealthRating = "good" | "moderate" | "bad";

export interface Nutrients {
  kcal: number;
  protein: number; // g
  carbs: number; // g
  sugar: number; // g
  fiber: number; // g
  fat: number; // g
  saturatedFat: number; // g
  sodium: number; // mg
}

export interface Food {
  id: string;
  name: string;
  aliases?: string[]; // termos que o OCR pode capturar
  category: FoodCategory;
  nova: NovaGroup;
  rating: HealthRating;
  nutrients: Nutrients; // por 100g ou 100ml
  additives?: string[]; // INS / aditivos
  allergens?: string[];
  tags?: string[]; // "vegano", "sem-gluten", "integral", "organico"
  swapSuggestions?: string[]; // ids de alimentos mais saudáveis
  co2PerKg?: number; // kg CO2e por kg do alimento
  tip?: string;
}

// Helper para acesso rápido
export const foodDatabase: Food[] = [
  // ===== FRUTAS =====
  {
    id: "banana",
    name: "Banana",
    aliases: ["banana prata", "banana nanica", "banana caturra"],
    category: "frutas",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 89, protein: 1.1, carbs: 23, sugar: 12, fiber: 2.6, fat: 0.3, saturatedFat: 0.1, sodium: 1 },
    tags: ["vegano", "sem-gluten"],
    co2PerKg: 0.7,
    tip: "Fonte de potássio e energia natural.",
  },
  {
    id: "maca",
    name: "Maçã",
    aliases: ["maca gala", "maca fuji", "maca verde"],
    category: "frutas",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 52, protein: 0.3, carbs: 14, sugar: 10, fiber: 2.4, fat: 0.2, saturatedFat: 0, sodium: 1 },
    tags: ["vegano", "sem-gluten"],
    co2PerKg: 0.4,
    tip: "Rica em pectina, ajuda a saciedade.",
  },
  {
    id: "mamao",
    name: "Mamão",
    aliases: ["mamao papaya", "mamao formosa"],
    category: "frutas",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 43, protein: 0.5, carbs: 11, sugar: 8, fiber: 1.7, fat: 0.3, saturatedFat: 0.1, sodium: 8 },
    tags: ["vegano", "sem-gluten"],
    co2PerKg: 0.6,
    tip: "Fonte de vitamina C e enzimas digestivas.",
  },
  {
    id: "abacate",
    name: "Abacate",
    category: "frutas",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 160, protein: 2, carbs: 9, sugar: 0.7, fiber: 6.7, fat: 15, saturatedFat: 2.1, sodium: 7 },
    tags: ["vegano", "sem-gluten", "gordura-boa"],
    co2PerKg: 2.5,
    tip: "Gorduras monoinsaturadas — coração agradece.",
  },
  {
    id: "laranja",
    name: "Laranja",
    aliases: ["laranja pera", "laranja lima"],
    category: "frutas",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 47, protein: 0.9, carbs: 12, sugar: 9, fiber: 2.4, fat: 0.1, saturatedFat: 0, sodium: 0 },
    tags: ["vegano", "sem-gluten"],
    co2PerKg: 0.3,
  },
  {
    id: "morango",
    name: "Morango",
    category: "frutas",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 32, protein: 0.7, carbs: 7.7, sugar: 4.9, fiber: 2, fat: 0.3, saturatedFat: 0, sodium: 1 },
    tags: ["vegano", "sem-gluten", "antioxidante"],
    co2PerKg: 1.1,
  },

  // ===== VEGETAIS =====
  {
    id: "brocolis",
    name: "Brócolis",
    category: "vegetais",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 34, protein: 2.8, carbs: 7, sugar: 1.7, fiber: 2.6, fat: 0.4, saturatedFat: 0, sodium: 33 },
    tags: ["vegano", "sem-gluten"],
    co2PerKg: 0.4,
  },
  {
    id: "couve",
    name: "Couve",
    aliases: ["couve manteiga"],
    category: "vegetais",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 49, protein: 4.3, carbs: 9, sugar: 2.3, fiber: 3.6, fat: 0.9, saturatedFat: 0.1, sodium: 38 },
    tags: ["vegano", "sem-gluten"],
    co2PerKg: 0.4,
    tip: "Fonte vegetal de cálcio e ferro.",
  },
  {
    id: "cenoura",
    name: "Cenoura",
    category: "vegetais",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 41, protein: 0.9, carbs: 10, sugar: 4.7, fiber: 2.8, fat: 0.2, saturatedFat: 0, sodium: 69 },
    tags: ["vegano", "sem-gluten"],
    co2PerKg: 0.4,
  },
  {
    id: "tomate",
    name: "Tomate",
    category: "vegetais",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 18, protein: 0.9, carbs: 3.9, sugar: 2.6, fiber: 1.2, fat: 0.2, saturatedFat: 0, sodium: 5 },
    tags: ["vegano", "sem-gluten"],
    co2PerKg: 1.4,
  },
  {
    id: "alface",
    name: "Alface",
    category: "vegetais",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 15, protein: 1.4, carbs: 2.9, sugar: 0.8, fiber: 1.3, fat: 0.2, saturatedFat: 0, sodium: 28 },
    tags: ["vegano", "sem-gluten"],
    co2PerKg: 0.3,
  },
  {
    id: "batata-doce",
    name: "Batata-doce",
    category: "vegetais",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 86, protein: 1.6, carbs: 20, sugar: 4.2, fiber: 3, fat: 0.1, saturatedFat: 0, sodium: 55 },
    tags: ["vegano", "sem-gluten", "indice-glicemico-baixo"],
    co2PerKg: 0.3,
  },

  // ===== CEREAIS =====
  {
    id: "arroz-integral",
    name: "Arroz integral",
    category: "cereais",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 123, protein: 2.7, carbs: 26, sugar: 0.4, fiber: 1.8, fat: 1, saturatedFat: 0.3, sodium: 4 },
    tags: ["vegano", "sem-gluten", "integral"],
    co2PerKg: 2.7,
    tip: "Mais fibras que o arroz branco.",
  },
  {
    id: "arroz-branco",
    name: "Arroz branco",
    category: "cereais",
    nova: 1,
    rating: "moderate",
    nutrients: { kcal: 130, protein: 2.7, carbs: 28, sugar: 0.1, fiber: 0.4, fat: 0.3, saturatedFat: 0.1, sodium: 1 },
    tags: ["vegano", "sem-gluten"],
    co2PerKg: 2.7,
    swapSuggestions: ["arroz-integral"],
  },
  {
    id: "aveia",
    name: "Aveia em flocos",
    category: "cereais",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 389, protein: 16.9, carbs: 66, sugar: 0, fiber: 10.6, fat: 6.9, saturatedFat: 1.2, sodium: 2 },
    tags: ["vegano", "integral"],
    allergens: ["aveia"],
    co2PerKg: 2.5,
    tip: "Betaglucana ajuda a reduzir colesterol.",
  },
  {
    id: "quinoa",
    name: "Quinoa",
    category: "cereais",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 368, protein: 14, carbs: 64, sugar: 0, fiber: 7, fat: 6.1, saturatedFat: 0.7, sodium: 5 },
    tags: ["vegano", "sem-gluten", "proteina-completa"],
    co2PerKg: 1.8,
  },

  // ===== LEGUMINOSAS =====
  {
    id: "feijao-preto",
    name: "Feijão preto",
    category: "leguminosas",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 132, protein: 8.9, carbs: 24, sugar: 0.3, fiber: 8.7, fat: 0.5, saturatedFat: 0.1, sodium: 2 },
    tags: ["vegano", "sem-gluten", "ferro"],
    co2PerKg: 0.9,
  },
  {
    id: "lentilha",
    name: "Lentilha",
    category: "leguminosas",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 116, protein: 9, carbs: 20, sugar: 1.8, fiber: 7.9, fat: 0.4, saturatedFat: 0.1, sodium: 2 },
    tags: ["vegano", "sem-gluten"],
    co2PerKg: 0.9,
  },
  {
    id: "grao-de-bico",
    name: "Grão-de-bico",
    category: "leguminosas",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 164, protein: 8.9, carbs: 27, sugar: 4.8, fiber: 7.6, fat: 2.6, saturatedFat: 0.3, sodium: 7 },
    tags: ["vegano", "sem-gluten"],
    co2PerKg: 0.9,
  },

  // ===== PROTEÍNAS =====
  {
    id: "ovo",
    name: "Ovo de galinha",
    category: "proteinas",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 155, protein: 13, carbs: 1.1, sugar: 1.1, fiber: 0, fat: 11, saturatedFat: 3.3, sodium: 124 },
    allergens: ["ovo"],
    co2PerKg: 4.5,
  },
  {
    id: "frango-peito",
    name: "Peito de frango",
    category: "proteinas",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 165, protein: 31, carbs: 0, sugar: 0, fiber: 0, fat: 3.6, saturatedFat: 1, sodium: 74 },
    co2PerKg: 6.9,
  },
  {
    id: "salmao",
    name: "Salmão",
    category: "proteinas",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 208, protein: 20, carbs: 0, sugar: 0, fiber: 0, fat: 13, saturatedFat: 3.1, sodium: 59 },
    tags: ["omega-3"],
    allergens: ["peixe"],
    co2PerKg: 11.9,
    tip: "Excelente fonte de ômega-3.",
  },
  {
    id: "sardinha",
    name: "Sardinha",
    category: "proteinas",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 208, protein: 24, carbs: 0, sugar: 0, fiber: 0, fat: 11, saturatedFat: 1.5, sodium: 307 },
    tags: ["omega-3", "calcio"],
    allergens: ["peixe"],
    co2PerKg: 1.3,
  },
  {
    id: "carne-bovina",
    name: "Carne bovina (acém)",
    category: "proteinas",
    nova: 1,
    rating: "moderate",
    nutrients: { kcal: 250, protein: 26, carbs: 0, sugar: 0, fiber: 0, fat: 15, saturatedFat: 6, sodium: 72 },
    co2PerKg: 60,
    tip: "Maior impacto ambiental — alterne com frango/peixe/leguminosas.",
    swapSuggestions: ["frango-peito", "feijao-preto", "lentilha"],
  },
  {
    id: "tofu",
    name: "Tofu",
    category: "proteinas",
    nova: 3,
    rating: "good",
    nutrients: { kcal: 76, protein: 8, carbs: 1.9, sugar: 0.6, fiber: 0.3, fat: 4.8, saturatedFat: 0.7, sodium: 7 },
    allergens: ["soja"],
    tags: ["vegano", "sem-gluten"],
    co2PerKg: 2,
  },

  // ===== LATICÍNIOS =====
  {
    id: "leite-integral",
    name: "Leite integral",
    category: "laticinios",
    nova: 1,
    rating: "moderate",
    nutrients: { kcal: 61, protein: 3.2, carbs: 4.8, sugar: 4.8, fiber: 0, fat: 3.3, saturatedFat: 1.9, sodium: 43 },
    allergens: ["leite", "lactose"],
    co2PerKg: 3.2,
  },
  {
    id: "iogurte-natural",
    name: "Iogurte natural",
    category: "laticinios",
    nova: 3,
    rating: "good",
    nutrients: { kcal: 61, protein: 3.5, carbs: 4.7, sugar: 4.7, fiber: 0, fat: 3.3, saturatedFat: 2.1, sodium: 46 },
    allergens: ["leite", "lactose"],
    tags: ["probiotico"],
    co2PerKg: 2.2,
    tip: "Probiótico natural — ótimo para a microbiota.",
  },
  {
    id: "iogurte-morango-acucar",
    name: "Iogurte sabor morango",
    aliases: ["iogurte morango", "iogurte com pedaços"],
    category: "laticinios",
    nova: 4,
    rating: "bad",
    nutrients: { kcal: 95, protein: 2.8, carbs: 15, sugar: 13, fiber: 0, fat: 2.5, saturatedFat: 1.6, sodium: 55 },
    allergens: ["leite"],
    additives: ["INS 440 pectina", "aroma idêntico ao natural", "corante carmim"],
    swapSuggestions: ["iogurte-natural", "morango"],
    tip: "13g de açúcar por 100g — quase 3 colheres de chá.",
  },
  {
    id: "queijo-minas",
    name: "Queijo minas frescal",
    category: "laticinios",
    nova: 3,
    rating: "good",
    nutrients: { kcal: 264, protein: 17.4, carbs: 3.2, sugar: 3.2, fiber: 0, fat: 20.2, saturatedFat: 12.6, sodium: 346 },
    allergens: ["leite"],
    co2PerKg: 13.5,
  },

  // ===== BEBIDAS =====
  {
    id: "agua",
    name: "Água mineral",
    category: "bebidas",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 0, protein: 0, carbs: 0, sugar: 0, fiber: 0, fat: 0, saturatedFat: 0, sodium: 5 },
    co2PerKg: 0.2,
  },
  {
    id: "refrigerante-cola",
    name: "Refrigerante de cola",
    aliases: ["coca", "pepsi", "refrigerante"],
    category: "bebidas",
    nova: 4,
    rating: "bad",
    nutrients: { kcal: 42, protein: 0, carbs: 10.6, sugar: 10.6, fiber: 0, fat: 0, saturatedFat: 0, sodium: 4 },
    additives: ["acidulante INS 338", "corante caramelo IV INS 150d", "cafeína", "aroma natural"],
    tip: "Cada 350ml tem ~37g de açúcar (9 colheres de chá).",
    swapSuggestions: ["agua", "suco-laranja-natural"],
  },
  {
    id: "suco-caixinha",
    name: "Suco de caixinha",
    aliases: ["nectar", "suco pronto"],
    category: "bebidas",
    nova: 4,
    rating: "bad",
    nutrients: { kcal: 50, protein: 0.2, carbs: 12, sugar: 11, fiber: 0.1, fat: 0, saturatedFat: 0, sodium: 8 },
    additives: ["açúcar adicionado", "conservante INS 211", "aroma artificial", "acidulante INS 330"],
    swapSuggestions: ["suco-laranja-natural", "agua"],
  },
  {
    id: "suco-laranja-natural",
    name: "Suco de laranja natural",
    category: "bebidas",
    nova: 1,
    rating: "moderate",
    nutrients: { kcal: 45, protein: 0.7, carbs: 10, sugar: 8.4, fiber: 0.2, fat: 0.2, saturatedFat: 0, sodium: 1 },
    tip: "Prefira a fruta inteira para mais fibras.",
  },
  {
    id: "cafe",
    name: "Café coado",
    category: "bebidas",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 2, protein: 0.1, carbs: 0, sugar: 0, fiber: 0, fat: 0, saturatedFat: 0, sodium: 2 },
    co2PerKg: 16.5,
  },

  // ===== SNACKS / ULTRAPROCESSADOS =====
  {
    id: "salgadinho",
    name: "Salgadinho de milho",
    aliases: ["doritos", "fandangos", "cheetos"],
    category: "snacks",
    nova: 4,
    rating: "bad",
    nutrients: { kcal: 525, protein: 6.5, carbs: 58, sugar: 2.5, fiber: 2.5, fat: 29, saturatedFat: 12, sodium: 850 },
    additives: ["realçador de sabor INS 621 glutamato monossódico", "corante INS 160c", "aroma artificial"],
    tip: "Alto em sódio e gorduras saturadas.",
    swapSuggestions: ["pipoca-natural", "castanhas"],
  },
  {
    id: "biscoito-recheado",
    name: "Biscoito recheado",
    aliases: ["bolacha recheada", "oreo", "trakinas"],
    category: "snacks",
    nova: 4,
    rating: "bad",
    nutrients: { kcal: 480, protein: 5, carbs: 70, sugar: 35, fiber: 2, fat: 20, saturatedFat: 9, sodium: 380 },
    additives: ["gordura vegetal hidrogenada", "aroma artificial", "INS 322 lecitina de soja", "INS 500 bicarbonato"],
    allergens: ["glúten", "soja", "leite"],
    swapSuggestions: ["aveia", "frutas-secas"],
  },
  {
    id: "pipoca-natural",
    name: "Pipoca de panela",
    category: "snacks",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 387, protein: 13, carbs: 78, sugar: 0.9, fiber: 14.5, fat: 4.5, saturatedFat: 0.6, sodium: 8 },
    tags: ["vegano", "integral"],
  },
  {
    id: "castanhas",
    name: "Castanhas mistas",
    category: "snacks",
    nova: 1,
    rating: "good",
    nutrients: { kcal: 607, protein: 20, carbs: 21, sugar: 4, fiber: 8, fat: 54, saturatedFat: 7, sodium: 5 },
    tags: ["vegano", "sem-gluten", "gordura-boa"],
    allergens: ["castanhas"],
  },

  // ===== DOCES =====
  {
    id: "chocolate-ao-leite",
    name: "Chocolate ao leite",
    category: "doces",
    nova: 4,
    rating: "bad",
    nutrients: { kcal: 535, protein: 7.6, carbs: 59, sugar: 52, fiber: 3.4, fat: 30, saturatedFat: 18.5, sodium: 79 },
    additives: ["lecitina de soja INS 322", "aromatizante"],
    allergens: ["leite", "soja"],
    swapSuggestions: ["chocolate-70"],
  },
  {
    id: "chocolate-70",
    name: "Chocolate 70% cacau",
    category: "doces",
    nova: 3,
    rating: "moderate",
    nutrients: { kcal: 598, protein: 7.8, carbs: 46, sugar: 24, fiber: 11, fat: 43, saturatedFat: 24, sodium: 20 },
    tags: ["antioxidante"],
  },

  // ===== MOLHOS =====
  {
    id: "ketchup",
    name: "Ketchup",
    category: "molhos",
    nova: 4,
    rating: "bad",
    nutrients: { kcal: 112, protein: 1.7, carbs: 27, sugar: 22, fiber: 0.3, fat: 0.4, saturatedFat: 0.1, sodium: 907 },
    additives: ["conservante INS 211 benzoato de sódio", "espessante INS 415", "açúcar"],
  },
  {
    id: "azeite",
    name: "Azeite de oliva extra virgem",
    category: "oleos",
    nova: 2,
    rating: "good",
    nutrients: { kcal: 884, protein: 0, carbs: 0, sugar: 0, fiber: 0, fat: 100, saturatedFat: 14, sodium: 2 },
    tags: ["gordura-boa"],
    tip: "Use cru para preservar polifenóis.",
  },

  // ===== PANIFICAÇÃO =====
  {
    id: "pao-frances",
    name: "Pão francês",
    category: "panificacao",
    nova: 3,
    rating: "moderate",
    nutrients: { kcal: 300, protein: 8, carbs: 58, sugar: 3, fiber: 2.3, fat: 3, saturatedFat: 0.6, sodium: 540 },
    allergens: ["glúten"],
  },
  {
    id: "pao-forma-integral",
    name: "Pão de forma integral",
    category: "panificacao",
    nova: 4,
    rating: "moderate",
    nutrients: { kcal: 253, protein: 9, carbs: 43, sugar: 5, fiber: 6, fat: 4.5, saturatedFat: 1, sodium: 460 },
    additives: ["INS 282 propionato de cálcio", "INS 471 monoglicerídeos", "açúcar"],
    allergens: ["glúten"],
    tip: "Mesmo integral, contém aditivos — prefira pão de padaria.",
  },
  {
    id: "pao-forma-branco",
    name: "Pão de forma branco",
    category: "panificacao",
    nova: 4,
    rating: "bad",
    nutrients: { kcal: 265, protein: 8, carbs: 50, sugar: 6, fiber: 1.5, fat: 3.5, saturatedFat: 0.8, sodium: 490 },
    additives: ["INS 282", "INS 471", "INS 920", "açúcar"],
    allergens: ["glúten"],
    swapSuggestions: ["pao-forma-integral", "pao-frances"],
  },

  // ===== CONGELADOS =====
  {
    id: "lasanha-congelada",
    name: "Lasanha congelada",
    category: "congelados",
    nova: 4,
    rating: "bad",
    nutrients: { kcal: 175, protein: 7, carbs: 18, sugar: 3, fiber: 1.2, fat: 8, saturatedFat: 4, sodium: 620 },
    additives: ["realçador INS 621", "estabilizante INS 451", "conservante INS 250"],
    allergens: ["glúten", "leite"],
  },
  {
    id: "nuggets",
    name: "Nuggets de frango",
    category: "congelados",
    nova: 4,
    rating: "bad",
    nutrients: { kcal: 296, protein: 15, carbs: 16, sugar: 0.4, fiber: 0.9, fat: 19, saturatedFat: 4, sodium: 600 },
    additives: ["proteína texturizada de soja", "INS 621", "INS 451"],
    swapSuggestions: ["frango-peito"],
  },
];

// ============================================
// Utilidades para a IA
// ============================================

export const novaLabel: Record<NovaGroup, string> = {
  1: "In natura ou minimamente processado",
  2: "Ingrediente culinário processado",
  3: "Processado",
  4: "Ultraprocessado",
};

export const categoryLabel: Record<FoodCategory, string> = {
  frutas: "Frutas",
  vegetais: "Vegetais & Verduras",
  cereais: "Cereais & Grãos",
  leguminosas: "Leguminosas",
  proteinas: "Carnes, Ovos & Peixes",
  laticinios: "Laticínios",
  bebidas: "Bebidas",
  snacks: "Snacks",
  doces: "Doces & Confeitaria",
  molhos: "Molhos & Condimentos",
  panificacao: "Pães & Panificação",
  congelados: "Pratos prontos & Congelados",
  oleos: "Óleos & Gorduras",
};

export const findFood = (query: string): Food | undefined => {
  const q = query.toLowerCase().trim();
  return foodDatabase.find(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.id === q ||
      f.aliases?.some((a) => a.toLowerCase().includes(q))
  );
};

export const foodsByCategory = (cat: FoodCategory): Food[] =>
  foodDatabase.filter((f) => f.category === cat);

export const ultraprocessed = (): Food[] =>
  foodDatabase.filter((f) => f.nova === 4);

export const suggestSwap = (id: string): Food[] => {
  const item = foodDatabase.find((f) => f.id === id);
  if (!item?.swapSuggestions) return [];
  return item.swapSuggestions
    .map((sid) => foodDatabase.find((f) => f.id === sid))
    .filter((f): f is Food => Boolean(f));
};

// Score nutricional simples (0-100) para um conjunto de alimentos
export const computeBasketScore = (ids: string[]): number => {
  const items = ids
    .map((id) => foodDatabase.find((f) => f.id === id))
    .filter((f): f is Food => Boolean(f));
  if (!items.length) return 0;
  const total = items.reduce((acc, f) => {
    const base = f.nova === 1 ? 100 : f.nova === 2 ? 80 : f.nova === 3 ? 60 : 25;
    const penalty =
      (f.nutrients.sugar > 15 ? 10 : 0) +
      (f.nutrients.sodium > 600 ? 10 : 0) +
      (f.nutrients.saturatedFat > 5 ? 5 : 0);
    return acc + Math.max(0, base - penalty);
  }, 0);
  return Math.round(total / items.length);
};
