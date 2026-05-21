import acai from "@/assets/recipe-acai.jpg";
import salmon from "@/assets/recipe-salmon.jpg";
import feijoada from "@/assets/recipe-feijoada.jpg";
import smoothie from "@/assets/recipe-smoothie.jpg";

export const familyMembers = [
  { id: "1", name: "Ana", age: 36, role: "Mãe", goal: "Energia & menopausa", emoji: "👩" },
  { id: "2", name: "Carlos", age: 39, role: "Pai", goal: "Saúde cardiovascular", emoji: "👨" },
  { id: "3", name: "Sofia", age: 8, role: "Filha", goal: "Alimentação infantil", emoji: "👧" },
  { id: "4", name: "Theo", age: 5, role: "Filho", goal: "Crescimento saudável", emoji: "👦" },
];

export const recipes = [
  { id: "1", title: "Bowl de Açaí com Granola", time: "10 min", tags: ["Café", "Vegano"], img: acai, score: 92 },
  { id: "2", title: "Salmão Grelhado com Quinoa", time: "25 min", tags: ["Jantar", "Proteína"], img: salmon, score: 96 },
  { id: "3", title: "Feijoada Leve & Couve", time: "45 min", tags: ["Brasileiro", "Almoço"], img: feijoada, score: 84 },
  { id: "4", title: "Smoothie Verde Detox", time: "5 min", tags: ["Bebida", "Fibras"], img: smoothie, score: 89 },
];

export const challenges = [
  { id: "1", title: "Reduzir ultraprocessados", progress: 70, points: 150, emoji: "🥗" },
  { id: "2", title: "5 frutas por dia", progress: 45, points: 100, emoji: "🍎" },
  { id: "3", title: "2L de água diários", progress: 85, points: 80, emoji: "💧" },
  { id: "4", title: "Zero desperdício", progress: 30, points: 200, emoji: "♻️" },
];

export const consumptionData = [
  { month: "Jan", saudavel: 45, processado: 55 },
  { month: "Fev", saudavel: 52, processado: 48 },
  { month: "Mar", saudavel: 58, processado: 42 },
  { month: "Abr", saudavel: 65, processado: 35 },
  { month: "Mai", saudavel: 71, processado: 29 },
];

export const nutrientPie = [
  { name: "Frutas & Vegetais", value: 32, color: "hsl(150 45% 45%)" },
  { name: "Proteínas", value: 22, color: "hsl(28 90% 62%)" },
  { name: "Cereais Integrais", value: 18, color: "hsl(38 80% 55%)" },
  { name: "Laticínios", value: 13, color: "hsl(200 50% 65%)" },
  { name: "Ultraprocessados", value: 15, color: "hsl(358 60% 60%)" },
];
