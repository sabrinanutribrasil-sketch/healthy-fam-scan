import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { usePrivacyConsent } from "@/hooks/use-privacy-consent";
import { toast } from "sonner";

const signupSchema = z.object({
  displayName: z.string().trim().min(2, "Mínimo 2 caracteres").max(60),
  familyName: z.string().trim().min(2, "Informe o nome da família").max(60),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(1, "Informe sua senha").max(72),
});

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveConsent } = usePrivacyConsent();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ displayName: "", familyName: "", email: "", password: "" });
  const [consents, setConsents] = useState({ privacy: false, terms: false, data: false });

  useEffect(() => {
    if (user) navigate("/app", { replace: true });
  }, [user, navigate]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!consents.privacy || !consents.terms || !consents.data) {
          toast.error("Aceite os termos e a política de privacidade para continuar.");
          setLoading(false);
          return;
        }
        const parsed = signupSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: {
              display_name: parsed.data.displayName,
              family_name: parsed.data.familyName,
            },
          },
        });
        if (error) throw error;
        saveConsent({ privacyPolicy: true, termsOfUse: true, dataProcessing: true, cameraAccess: false });
        toast.success("Conta criada! Bem-vindo à NutriCasa 🌱");
        navigate("/app", { replace: true });
      } else {
        const parsed = loginSchema.safeParse({ email: form.email, password: form.password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        navigate("/app", { replace: true });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Algo deu errado");
    } finally {
      setLoading(false);
    }
  };

  const oauth = async (provider: "google" | "apple") => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: `${window.location.origin}/app`,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Falha no login social");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate("/app", { replace: true });
  };

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
          <h1 className="text-4xl font-display mb-2">{mode === "login" ? "Bem-vindo de volta" : "Crie sua família"}</h1>
          <p className="text-muted-foreground mb-8">
            {mode === "login" ? "Continue cuidando da sua família." : "Cadastre sua família e comece hoje."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <Label>Seu nome</Label>
                  <Input value={form.displayName} onChange={set("displayName")} placeholder="Ana Silva" className="h-12 mt-1.5 rounded-xl bg-card" />
                </div>
                <div>
                  <Label>Nome da família</Label>
                  <Input value={form.familyName} onChange={set("familyName")} placeholder="Família Silva" className="h-12 mt-1.5 rounded-xl bg-card" />
                </div>
              </>
            )}
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={set("email")} placeholder="voce@email.com" className="h-12 mt-1.5 rounded-xl bg-card" />
            </div>
            <div>
              <Label>Senha</Label>
              <Input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" className="h-12 mt-1.5 rounded-xl bg-card" />
            </div>

            <Button type="submit" size="lg" disabled={loading} className="w-full h-14 rounded-2xl gradient-primary shadow-glow mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">ou</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="space-y-3">
            <Button type="button" variant="outline" disabled={loading} onClick={() => oauth("google")} className="w-full h-12 rounded-2xl bg-card">
              Continuar com Google
            </Button>
            <Button type="button" variant="outline" disabled={loading} onClick={() => oauth("apple")} className="w-full h-12 rounded-2xl bg-card">
              Continuar com Apple
            </Button>
          </div>

          <button
            type="button"
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
