import acai from "@/assets/recipe-acai.jpg";
import salmon from "@/assets/recipe-salmon.jpg";
import feijoada from "@/assets/recipe-feijoada.jpg";
import smoothie from "@/assets/recipe-smoothie.jpg";

export type Recipe = {
  id: string;
  title: string;
  time: string;
  servings: number;
  difficulty: "Fácil" | "Médio" | "Difícil";
  tags: string[];
  img: string;
  score: number;
  description: string;
  ingredients: { name: string; quantity: string }[];
  steps: string[];
  nutrition: { kcal: number; protein: number; carbs: number; fat: number; fiber: number; sodium: number };
  tips: string[];
};

export const recipes: Recipe[] = [
  {
    id: "1",
    title: "Bowl de Açaí com Granola",
    time: "10 min",
    servings: 2,
    difficulty: "Fácil",
    tags: ["Café", "Vegano"],
    img: acai,
    score: 92,
    description: "Tigela cremosa de açaí com banana, granola crocante e mel — energia e antioxidantes para começar o dia.",
    ingredients: [
      { name: "Polpa de açaí congelada", quantity: "200g" },
      { name: "Banana", quantity: "1 unidade" },
      { name: "Granola", quantity: "4 colheres de sopa" },
      { name: "Mel", quantity: "1 colher de chá" },
      { name: "Morango", quantity: "3 unidades" },
    ],
    steps: [
      "Bata o açaí com a banana no liquidificador até ficar cremoso.",
      "Despeje em duas tigelas.",
      "Corte o morango em fatias e disponha por cima.",
      "Adicione a granola e regue com o mel.",
      "Sirva imediatamente.",
    ],
    nutrition: { kcal: 280, protein: 6, carbs: 48, fat: 8, fiber: 7, sodium: 15 },
    tips: ["Substitua o mel por agave para uma versão 100% vegana.", "Adicione chia ou linhaça para mais ômega-3."],
  },
  {
    id: "2",
    title: "Salmão Grelhado com Quinoa",
    time: "25 min",
    servings: 4,
    difficulty: "Médio",
    tags: ["Jantar", "Proteína"],
    img: salmon,
    score: 96,
    description: "Filé de salmão dourado servido sobre quinoa fofa com brócolis no vapor — rico em ômega-3 e proteína completa.",
    ingredients: [
      { name: "Filé de salmão", quantity: "4 unidades (150g cada)" },
      { name: "Quinoa", quantity: "1 xícara" },
      { name: "Brócolis", quantity: "1 maço" },
      { name: "Azeite de oliva", quantity: "2 colheres de sopa" },
      { name: "Limão", quantity: "1 unidade" },
      { name: "Alho", quantity: "2 dentes" },
      { name: "Sal e pimenta-do-reino", quantity: "a gosto" },
    ],
    steps: [
      "Cozinhe a quinoa com 2 xícaras de água por 15 minutos.",
      "Corte o brócolis em floretes e cozinhe no vapor por 5 minutos.",
      "Tempere o salmão com sal, pimenta e suco de meio limão.",
      "Aqueça o azeite em uma frigideira e grelhe o salmão 4 minutos de cada lado.",
      "Refogue o alho no azeite e misture com a quinoa.",
      "Sirva o salmão sobre a quinoa com brócolis ao lado.",
    ],
    nutrition: { kcal: 420, protein: 35, carbs: 28, fat: 18, fiber: 5, sodium: 320 },
    tips: ["Não cozinhe demais o salmão — o centro deve ficar levemente rosado.", "Troque a quinoa por arroz integral se preferir."],
  },
  {
    id: "3",
    title: "Feijoada Leve & Couve",
    time: "45 min",
    servings: 6,
    difficulty: "Médio",
    tags: ["Brasileiro", "Almoço"],
    img: feijoada,
    score: 84,
    description: "Versão leve da clássica feijoada brasileira com feijão preto, carnes magras e couve refogada — sabor de casa sem culpa.",
    ingredients: [
      { name: "Feijão preto", quantity: "500g (cozido)" },
      { name: "Lombo suíno magro", quantity: "300g" },
      { name: "Linguiça de frango", quantity: "200g" },
      { name: "Couve manteiga", quantity: "2 maços" },
      { name: "Alho", quantity: "4 dentes" },
      { name: "Cebola", quantity: "1 unidade" },
      { name: "Louro", quantity: "2 folhas" },
      { name: "Azeite", quantity: "2 colheres de sopa" },
      { name: "Sal", quantity: "a gosto" },
    ],
    steps: [
      "Em uma panela, refogue a cebola e o alho no azeite.",
      "Adicione o lombo em cubos e doure levemente.",
      "Acrescente a linguiça em rodelas e refogue por 3 minutos.",
      "Junte o feijão cozido, o louro e água suficiente para cobrir.",
      "Cozinhe em fogo baixo por 25 minutos, mexendo de vez em quando.",
      "Refogue a couve com alho em uma frigideira separada.",
      "Sirva a feijoada com a couve ao lado.",
    ],
    nutrition: { kcal: 380, protein: 28, carbs: 32, fat: 14, fiber: 12, sodium: 580 },
    tips: ["Deixe o feijão de molho por 8 horas antes de cozinhar para melhor digestão.", "Sirva com laranja em rodelas para ajudar na absorção do ferro."],
  },
  {
    id: "4",
    title: "Smoothie Verde Detox",
    time: "5 min",
    servings: 1,
    difficulty: "Fácil",
    tags: ["Bebida", "Fibras"],
    img: smoothie,
    score: 89,
    description: "Bebida refrescante com couve, maçã, gengibre e limão — vitaminas e fibras em menos de 5 minutos.",
    ingredients: [
      { name: "Couve manteiga", quantity: "2 folhas" },
      { name: "Maçã verde", quantity: "1 unidade" },
      { name: "Gengibre", quantity: "1 cm" },
      { name: "Limão", quantity: "1/2 unidade" },
      { name: "Água gelada", quantity: "200ml" },
      { name: "Gelo", quantity: "4 cubos" },
    ],
    steps: [
      "Lave bem a couve e corte em tiras.",
      "Corte a maçã em pedaços (com casca).",
      "Bata tudo no liquidificador com a água e o gelo.",
      "Coe se preferir mais suave.",
      "Beba imediatamente para preservar os nutrientes.",
    ],
    nutrition: { kcal: 120, protein: 3, carbs: 24, fat: 1, fiber: 5, sodium: 25 },
    tips: ["Adicione hortelã para um toque refrescante.", "Use água de coco no lugar da água para mais eletrólitos."],
  },
];

