import { Link } from "react-router-dom";
import { ArrowLeft, Bell, Lock, CreditCard, HelpCircle, LogOut, Sprout, ChevronRight } from "lucide-react";

const items = [
  { i: Bell, l: "Notificações", to: "#" },
  { i: Lock, l: "Privacidade & segurança", to: "#" },
  { i: CreditCard, l: "Plano e pagamento", to: "#" },
  { i: Sprout, l: "Preferências sustentáveis", to: "#" },
  { i: HelpCircle, l: "Ajuda e suporte", to: "#" },
];

const Settings = () => (
  <div className="p-5 space-y-5 pb-6">
    <header className="flex items-center gap-3 pt-3">
      <Link to="/app/familia" className="w-10 h-10 rounded-full bg-card shadow-soft flex items-center justify-center">
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <h1 className="text-3xl font-display">Configurações</h1>
    </header>

    <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
      {items.map((it, i) => (
        <Link
          key={it.l}
          to={it.to}
          className={`flex items-center gap-3 p-4 ${i !== items.length - 1 ? "border-b border-border" : ""}`}
        >
          <div className="w-10 h-10 rounded-xl gradient-fresh flex items-center justify-center">
            <it.i className="w-4 h-4 text-primary" />
          </div>
          <span className="flex-1 font-medium">{it.l}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      ))}
    </div>

    <Link to="/" className="flex items-center justify-center gap-2 p-4 text-destructive font-semibold">
      <LogOut className="w-4 h-4" /> Sair da conta
    </Link>

    <p className="text-center text-xs text-muted-foreground">NutriCasa v1.0 · Feito com 💚 no Brasil</p>
  </div>
);

export default Settings;
