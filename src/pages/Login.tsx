import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, ArrowLeft } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md min-h-screen gradient-fresh p-6 flex flex-col">
        <Link to="/" className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-soft">
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex-1 flex flex-col justify-center">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-display mb-2">{mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}</h1>
          <p className="text-muted-foreground mb-8">
            {mode === "login" ? "Continue cuidando da sua família." : "Comece sua jornada saudável hoje."}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/app");
            }}
            className="space-y-4"
          >
            {mode === "signup" && (
              <div>
                <Label>Nome</Label>
                <Input placeholder="Como devemos te chamar?" className="h-12 mt-1.5 rounded-xl bg-card" />
              </div>
            )}
            <div>
              <Label>E-mail</Label>
              <Input type="email" placeholder="voce@email.com" className="h-12 mt-1.5 rounded-xl bg-card" />
            </div>
            <div>
              <Label>Senha</Label>
              <Input type="password" placeholder="••••••••" className="h-12 mt-1.5 rounded-xl bg-card" />
            </div>

            <Button type="submit" size="lg" className="w-full h-14 rounded-2xl gradient-primary shadow-glow mt-2">
              {mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-sm text-muted-foreground mt-6 text-center"
          >
            {mode === "login" ? (
              <>Novo aqui? <span className="text-primary font-semibold">Criar conta</span></>
            ) : (
              <>Já tem conta? <span className="text-primary font-semibold">Entrar</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
