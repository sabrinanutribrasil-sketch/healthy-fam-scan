import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Users, Flame, Heart, ChefHat, Sparkles, ChevronRight } from "lucide-react";
import { useState } from "react";
import { recipes } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recipe = recipes.find((r) => r.id === id);
  const [checked, setChecked] = useState<number[]>([]);
  const [fav, setFav] = useState(false);

  if (!recipe) {
    return (
      <div className="p-5 pt-10 text-center space-y-4">
        <p className="text-muted-foreground">Receita não encontrada.</p>
        <Link to="/app/receitas" className="text-primary font-semibold">Voltar para receitas</Link>
      </div>
    );
  }

  const toggleStep = (i: number) =>
    setChecked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));

  const nutritionItems = [
    { label: "Calorias", value: `${recipe.nutrition.kcal}`, unit: "kcal", icon: Flame },
    { label: "Proteína", value: `${recipe.nutrition.protein}`, unit: "g", icon: ChefHat },
    { label: "Carbs", value: `${recipe.nutrition.carbs}`, unit: "g", icon: Sparkles },
    { label: "Gordura", value: `${recipe.nutrition.fat}`, unit: "g", icon: Sparkles },
    { label: "Fibras", value: `${recipe.nutrition.fiber}`, unit: "g", icon: Sparkles },
    { label: "Sódio", value: `${recipe.nutrition.sodium}`, unit: "mg", icon: Sparkles },
  ];

  return (
    <div className="pb-6">
      {/* Hero image */}
      <div className="relative h-64 overflow-hidden">
        <img src={recipe.img} alt={recipe.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-2xl bg-card/90 backdrop-blur shadow-soft flex items-center justify-center"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setFav((f) => !f)}
          className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-card/90 backdrop-blur shadow-soft flex items-center justify-center"
          aria-label="Favoritar"
        >
          <Heart className={`w-5 h-5 ${fav ? "fill-destructive text-destructive" : "text-foreground"}`} />
        </button>
      </div>

      <div className="p-5 space-y-6 -mt-4 relative">
        {/* Title + tags */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex gap-1.5 mb-2">
            {recipe.tags.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wide">
                {t}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-display leading-tight">{recipe.title}</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{recipe.description}</p>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-3 shadow-soft text-center">
            <Clock className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-[10px] uppercase text-muted-foreground">Tempo</p>
            <p className="text-sm font-bold">{recipe.time}</p>
          </div>
          <div className="bg-card rounded-2xl p-3 shadow-soft text-center">
            <Users className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-[10px] uppercase text-muted-foreground">Porções</p>
            <p className="text-sm font-bold">{recipe.servings}</p>
          </div>
          <div className="bg-card rounded-2xl p-3 shadow-soft text-center">
            <Flame className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-[10px] uppercase text-muted-foreground">Dificuldade</p>
            <p className="text-sm font-bold">{recipe.difficulty}</p>
          </div>
        </div>

        {/* Nutritional info */}
        <section className="bg-card rounded-3xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Informação nutricional</h2>
            <span className="text-xs text-muted-foreground">por porção</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {nutritionItems.map((n) => (
              <div key={n.label} className="rounded-xl bg-muted/60 p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground mb-1">{n.label}</p>
                <p className="text-lg font-bold leading-tight">{n.value}<span className="text-xs font-normal text-muted-foreground ml-0.5">{n.unit}</span></p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-2.5 h-2.5 bg-success rounded-full" />
            <span className="text-xs font-semibold text-success">Score NutriCasa: {recipe.score}/100</span>
          </div>
        </section>

        {/* Ingredients */}
        <section>
          <h2 className="font-display text-xl mb-3">Ingredientes</h2>
          <div className="bg-card rounded-3xl shadow-soft divide-y divide-border">
            {recipe.ingredients.map((ing, i) => {
              const isChecked = checked.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleStep(i)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-smooth ${isChecked ? "bg-primary border-primary" : "border-border"}`}>
                    {isChecked && <span className="text-primary-foreground text-xs">✓</span>}
                  </div>
                  <span className={`text-sm flex-1 ${isChecked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {ing.name}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">{ing.quantity}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Steps */}
        <section>
          <h2 className="font-display text-xl mb-3">Modo de preparo</h2>
          <div className="space-y-3">
            {recipe.steps.map((step, i) => {
              const isChecked = checked.includes(i + 100);
              return (
                <button
                  key={i}
                  onClick={() => toggleStep(i + 100)}
                  className="w-full flex gap-4 text-left"
                >
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold transition-smooth ${isChecked ? "bg-success text-success-foreground" : "gradient-primary text-primary-foreground"}`}>
                    {isChecked ? "✓" : i + 1}
                  </div>
                  <p className={`text-sm leading-relaxed pt-1 ${isChecked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {step}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Tips */}
        {recipe.tips.length > 0 && (
          <section className="rounded-3xl p-5 gradient-fresh border border-primary/10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="font-display text-xl">Dicas</h2>
            </div>
            <ul className="space-y-2.5">
              {recipe.tips.map((tip, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                  <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <Link to="/app/receitas" className="block">
          <Button variant="outline" className="w-full h-12 rounded-2xl bg-card">
            Ver mais receitas
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default RecipeDetail;
