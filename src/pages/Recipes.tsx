import { useState } from "react";
import { Search, Heart, Clock, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { recipes } from "@/lib/mock-data";
import { motion } from "framer-motion";

const filters = ["Tudo", "Café", "Almoço", "Jantar", "Vegano", "Infantil"];

const Recipes = () => {
  const [active, setActive] = useState("Tudo");
  const [favs, setFavs] = useState<string[]>([]);

  return (
    <div className="p-5 space-y-4 pb-6">
      <header className="pt-3">
        <h1 className="text-3xl font-display">Receitas</h1>
        <p className="text-muted-foreground text-sm">Refeições reais para sua rotina</p>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar receita..." className="h-12 pl-11 rounded-2xl bg-card border-transparent shadow-soft" />
      </div>

      {/* AI suggestion */}
      <div className="rounded-2xl p-4 gradient-fresh border border-primary/10 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">O que cozinhar hoje?</p>
          <p className="text-xs text-muted-foreground">IA sugere com o que você já tem em casa</p>
        </div>
        <button className="text-xs font-bold text-primary">Gerar →</button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-smooth ${
              active === f ? "gradient-primary text-primary-foreground shadow-soft" : "bg-card text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {recipes.map((r, i) => {
          const fav = favs.includes(r.id);
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl overflow-hidden shadow-soft"
            >
              <div className="relative">
                <img src={r.img} alt={r.title} loading="lazy" className="w-full aspect-square object-cover" />
                <button
                  onClick={() => setFavs((p) => (fav ? p.filter((x) => x !== r.id) : [...p, r.id]))}
                  className="absolute top-2 right-2 w-9 h-9 rounded-full bg-card/90 backdrop-blur flex items-center justify-center"
                >
                  <Heart className={`w-4 h-4 ${fav ? "fill-destructive text-destructive" : "text-foreground"}`} />
                </button>
                <div className="absolute bottom-2 left-2 bg-card/90 backdrop-blur px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-success rounded-full" /> {r.score}
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">{r.title}</p>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{r.time}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Recipes;
