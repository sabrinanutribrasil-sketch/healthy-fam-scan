import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Lock,
  CreditCard,
  HelpCircle,
  LogOut,
  Sprout,
  ChevronRight,
  Shield,
  FileText,
  Database,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const items = [
  { i: Bell, l: "Notificações", to: "#" },
  { i: Lock, l: "Privacidade & segurança", to: "#" },
  { i: CreditCard, l: "Plano e pagamento", to: "#" },
  { i: Sprout, l: "Preferências sustentáveis", to: "#" },
  { i: HelpCircle, l: "Ajuda e suporte", to: "#" },
];

const legalItems = [
  { i: Shield, l: "Política de Privacidade", to: "/privacidade" },
  { i: FileText, l: "Termos de Uso", to: "/termos" },
  { i: Database, l: "Uso dos Dados", to: "/uso-de-dados" },
];

const Settings = () => {
  const { signOut, user, session } = useAuth();
  const navigate = useNavigate();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "EXCLUIR") {
      toast.error('Digite "EXCLUIR" para confirmar a exclusão.');
      return;
    }

    setDeleting(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const accessToken = session?.access_token;

      if (!accessToken) {
        toast.error("Sessão expirada. Faça login novamente antes de excluir a conta.");
        setDeleting(false);
        return;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: deletePassword || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao excluir conta.");
      }

      if (response.status === 207) {
        toast.warning("A exclusão foi parcialmente concluída. Contate o suporte se necessário.");
      } else {
        toast.success("Conta excluída com sucesso.");
      }

      await signOut();
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Não foi possível excluir a conta: ${msg}`);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = () => {
    setDeletePassword("");
    setDeleteConfirmText("");
    setShowDeleteDialog(true);
  };

  return (
    <div className="p-5 space-y-5 pb-6">
      <header className="flex items-center gap-3 pt-3">
        <Link to="/app/familia" className="w-10 h-10 rounded-full bg-card shadow-soft flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-3xl font-display">Configurações</h1>
      </header>

      {user && (
        <div className="bg-card rounded-2xl p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">Conectado como</p>
          <p className="font-semibold truncate">{user.email}</p>
        </div>
      )}

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

      <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
        {legalItems.map((it, i) => (
          <Link
            key={it.l}
            to={it.to}
            target="_blank"
            className={`flex items-center gap-3 p-4 ${i !== legalItems.length - 1 ? "border-b border-border" : ""}`}
          >
            <div className="w-10 h-10 rounded-xl gradient-fresh flex items-center justify-center">
              <it.i className="w-4 h-4 text-primary" />
            </div>
            <span className="flex-1 font-medium">{it.l}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 text-destructive font-semibold">
        <LogOut className="w-4 h-4" /> Sair da conta
      </button>

      {/* Account deletion */}
      <div className="pt-2">
        <button
          onClick={openDeleteDialog}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-destructive/5 border border-destructive/20 text-destructive"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Trash2 className="w-4 h-4" />
          </div>
          <span className="flex-1 text-left font-medium text-sm">
            Excluir minha conta
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
        <p className="text-xs text-muted-foreground mt-1.5 px-1">
          Remove permanentemente sua conta e todos os dados associados.
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground">NutriCasa v1.0 · Feito com 💚 no Brasil</p>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Excluir conta permanentemente
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-3">
              <span className="block">
                Esta ação é <strong>irreversível</strong>. Todos os seus dados
                serão removidos:
              </span>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Conta de acesso (e-mail e senha)</li>
                <li>Perfil pessoal e preferências</li>
                <li>Histórico de escaneamentos</li>
                <li>Membros da família e perfis nutricionais</li>
                <li>Pontos e conquistas</li>
                <li>Planejamento alimentar</li>
              </ul>
              <span className="block">
                Para confirmar, digite <strong>EXCLUIR</strong> abaixo e, se
                quiser, sua senha para reconfirmar sua identidade.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">Confirmação</Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder='Digite EXCLUIR'
                className="h-11 rounded-xl bg-muted mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Sua senha (reconfirmação)</Label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-xl bg-muted mt-1"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirmText !== "EXCLUIR"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Excluir conta
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
