import { Trophy, Flame, Award, Crown } from "lucide-react";
import { challenges, familyMembers } from "@/lib/mock-data";
import { motion } from "framer-motion";

const medals = [
  { emoji: "🥇", title: "Mestre dos vegetais", desc: "30 dias seguidos", earned: true },
  { emoji: "💧", title: "Hidratação master", desc: "Meta 7 dias", earned: true },
  { emoji: "🌱", title: "Eco hero", desc: "Reduziu 50% lixo", earned: true },
  { emoji: "🥗", title: "Zero processados", desc: "Em progresso", earned: false },
  { emoji: "🍎", title: "5 ao dia", desc: "Em progresso", earned: false },
  { emoji: "👨‍🍳", title: "Chef da casa", desc: "Bloqueado", earned: false },
];

const Gamification = () => {
  return (
    <div className="p-5 space-y-5 pb-6">
      <header className="pt-3">
        <h1 className="text-3xl font-display">Desafios</h1>
        <p className="text-muted-foreground text-sm">Saúde com leveza e diversão</p>
      </header>

      {/* Points card */}
      <div className="rounded-3xl p-5 gradient-primary text-primary-foreground shadow-glow relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-primary-foreground/10" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase opacity-80 tracking-wider">Pontos da família</p>
            <p className="text-4xl font-display leading-none">2.840</p>
            <div className="flex items-center gap-1 mt-1 text-xs opacity-90">
              <Flame className="w-3 h-3" /> 12 dias de sequência
            </div>
          </div>
        </div>
      </div>

      {/* Active challenges */}
      <div>
        <h2 className="font-display text-xl mb-3">Metas da semana</h2>
        <div className="space-y-2.5">
          {challenges.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-4 shadow-soft"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">{c.emoji}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.progress}% concluído</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Recompensa</p>
                  <p className="text-sm font-bold text-accent">+{c.points} pts</p>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${c.progress}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                  className="h-full gradient-primary rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Family ranking */}
      <div>
        <h2 className="font-display text-xl mb-3">Ranking da família</h2>
        <div className="bg-card rounded-2xl p-3 shadow-soft space-y-1">
          {familyMembers
            .map((m, i) => ({ ...m, points: 950 - i * 120 }))
            .sort((a, b) => b.points - a.points)
            .map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === 0 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {i === 0 ? <Crown className="w-4 h-4" /> : i + 1}
                </div>
                <div className="text-2xl">{m.emoji}</div>
                <p className="font-semibold flex-1">{m.name}</p>
                <p className="text-sm font-bold text-primary">{m.points} pts</p>
              </div>
            ))}
        </div>
      </div>

      {/* Medals */}
      <div>
        <h2 className="font-display text-xl mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-accent" /> Conquistas
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {medals.map((m) => (
            <div
              key={m.title}
              className={`bg-card rounded-2xl p-3 shadow-soft text-center ${!m.earned && "opacity-40 grayscale"}`}
            >
              <div className="text-4xl mb-1">{m.emoji}</div>
              <p className="text-[11px] font-bold leading-tight">{m.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gamification;
