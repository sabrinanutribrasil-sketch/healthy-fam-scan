import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setReady(true);
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => { if (s.session) setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("A senha precisa ter no mínimo 8 caracteres");
    if (password !== confirm) return toast.error("As senhas não conferem");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Senha alterada com sucesso!");
    navigate("/app", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md min-h-screen gradient-fresh p-6 flex flex-col justify-center">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
          <Leaf className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-display mb-2">Nova senha</h1>
        {!ready ? (
          <p className="text-muted-foreground">Abra esta página pelo link enviado ao seu e-mail.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4 mt-6">
            <div>
              <Label>Nova senha</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 mt-1.5 rounded-xl bg-card" />
            </div>
            <div>
              <Label>Confirme a nova senha</Label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-12 mt-1.5 rounded-xl bg-card" />
            </div>
            <Button type="submit" size="lg" disabled={loading} className="w-full h-14 rounded-2xl gradient-primary shadow-glow">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar nova senha"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
