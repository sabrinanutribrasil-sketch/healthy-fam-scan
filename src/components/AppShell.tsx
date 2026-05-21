import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, ScanLine, ChefHat, Trophy, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  { to: "/app", icon: Home, label: "Início", end: true },
  { to: "/app/receitas", icon: ChefHat, label: "Receitas" },
  { to: "/app/escanear", icon: ScanLine, label: "Escanear", center: true },
  { to: "/app/gamificacao", icon: Trophy, label: "Desafios" },
  { to: "/app/familia", icon: User, label: "Família" },
];

export const AppShell = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-background relative pb-24 shadow-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4 pt-2 z-50">
          <div className="glass-card rounded-3xl px-2 py-2 flex items-center justify-around">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-smooth ${
                    t.center
                      ? "gradient-primary text-primary-foreground -translate-y-3 shadow-glow scale-110"
                      : isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`
                }
              >
                <t.icon className={t.center ? "w-6 h-6" : "w-5 h-5"} strokeWidth={2.2} />
                <span className={`text-[10px] font-semibold ${t.center ? "sr-only" : ""}`}>{t.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};
