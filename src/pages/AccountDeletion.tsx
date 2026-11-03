import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Trash2,
  Clock,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Send,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AccountDeletion = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.message) {
      toast.error("Preencha e-mail e mensagem para enviar a solicitação.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Informe um endereço de e-mail válido.");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("support_requests").insert({
        email: form.email,
        name: form.name || null,
        request_type: "account_deletion",
        subject: "Solicitação de exclusão de conta",
        message: form.message,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Solicitação registrada com sucesso.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Não foi possível registrar a solicitação: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-2xl px-5 py-8 sm:py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8 hover:text-foreground transition-smooth"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao início
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl gradient-fresh flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-display leading-tight">
                Exclusão de Conta
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Solicite a exclusão da sua conta e dados pessoais
              </p>
            </div>
          </div>

          <div className="mt-6 mb-8 p-4 rounded-2xl bg-destructive/5 border border-destructive/20">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-sm text-foreground/90">
                <p className="font-semibold text-destructive">
                  Atenção: esta ação é permanente
                </p>
                <p>
                  A exclusão da conta remove permanentemente seus dados pessoais,
                  histórico de escaneamentos, perfil nutricional e membros da
                  família (se você for o responsável pela família). Esta ação
                  não pode ser desfeita.
                </p>
              </div>
            </div>
          </div>

          {/* What gets deleted */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold mb-4">
              <span className="w-9 h-9 rounded-xl gradient-fresh flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-primary" />
              </span>
              <span>O que será excluído</span>
            </h2>
            <ul className="space-y-2 text-sm text-foreground/90 pl-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                Sua conta de acesso (e-mail e senha)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                Seu perfil pessoal e preferências
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                Histórico de escaneamentos de notas fiscais e rótulos
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                Membros da família e perfis nutricionais (se você for o responsável)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                Pontos e conquistas de gamificação
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                Planejamento alimentar semanal
              </li>
            </ul>
          </section>

          {/* What may be retained */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold mb-4">
              <span className="w-9 h-9 rounded-xl gradient-fresh flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-primary" />
              </span>
              <span>O que pode ser conservado</span>
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground pl-1">
              <li>
                Dados de pagamento (Stripe) podem ser mantidos pelo período
                exigido por obrigações legais ou regulatórias.
              </li>
              <li>
                Registros eventualmente mantidos por provedores terceiros (como
                OpenAI) ficam sujeitos às políticas de retenção de cada serviço.
              </li>
              <li>
                Se você for membro (não responsável) de uma família, os dados da
                família serão mantidos para os demais membros.
              </li>
            </ul>
          </section>

          {/* Processing time */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold mb-4">
              <span className="w-9 h-9 rounded-xl gradient-fresh flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </span>
              <span>Prazo de processamento</span>
            </h2>
            <p className="text-sm text-foreground/90 pl-1">
              Sua solicitação será processada em até{" "}
              <strong>15 dias úteis</strong>. Você receberá uma confirmação no
              e-mail informado.
            </p>
          </section>

          {/* Two ways to request */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold mb-4">
              <span className="w-9 h-9 rounded-xl gradient-fresh flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </span>
              <span>Como solicitar</span>
            </h2>
            <div className="space-y-3 pl-1">
              <div className="p-4 rounded-2xl bg-card border border-border shadow-soft">
                <p className="text-sm font-semibold mb-1">No aplicativo</p>
                <p className="text-sm text-muted-foreground">
                  Acesse Configurações no app e toque em "Excluir minha conta".
                  A exclusão é processada automaticamente após confirmação.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border shadow-soft">
                <p className="text-sm font-semibold mb-1">Por e-mail</p>
                <p className="text-sm text-muted-foreground">
                  Envie uma mensagem para{" "}
                  <a
                    href="mailto:sabrinanutribrasil@gmail.com"
                    className="text-primary underline"
                  >
                    sabrinanutribrasil@gmail.com
                  </a>{" "}
                  com o assunto "Exclusão de conta".
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border shadow-soft">
                <p className="text-sm font-semibold mb-1">Pelo formulário abaixo</p>
                <p className="text-sm text-muted-foreground">
                  Preencha o formulário para registrar sua solicitação
                  formalmente.
                </p>
              </div>
            </div>
          </section>

          {/* Form */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold mb-4">
              <span className="w-9 h-9 rounded-xl gradient-fresh flex items-center justify-center shrink-0">
                <Send className="w-4 h-4 text-primary" />
              </span>
              <span>Formulário de solicitação</span>
            </h2>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-card border border-border shadow-soft text-center">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                <p className="font-semibold text-lg mb-1">Solicitação registrada!</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Sua solicitação foi registrada e será processada em até 15 dias
                  úteis. Uma confirmação será enviada para o e-mail informado.
                </p>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/">Voltar ao início</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 p-5 rounded-2xl bg-card border border-border shadow-soft">
                <div>
                  <Label className="text-xs">Nome (opcional)</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Seu nome"
                    className="h-11 rounded-xl bg-muted mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">E-mail *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="h-11 rounded-xl bg-muted mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Mensagem *</Label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Confirme que deseja excluir sua conta e todos os dados associados."
                    className="rounded-xl bg-muted mt-1 min-h-[100px]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-xl gradient-primary shadow-glow gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "Enviando..." : "Enviar solicitação"}
                </Button>
              </form>
            )}
          </section>

          <div className="mt-12 pt-6 border-t border-border text-xs text-muted-foreground space-y-1">
            <p>
              NutriCasa · Responsável: Sabrina Rodrigues ·{" "}
              <a
                href="mailto:sabrinanutribrasil@gmail.com"
                className="underline hover:text-foreground"
              >
                sabrinanutribrasil@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-card/50">
        <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">© 2026 NutriCasa · Sabrina Rodrigues</p>
          <div className="flex items-center gap-4">
            <Link to="/privacidade" className="text-muted-foreground hover:text-foreground transition-smooth">
              Política de Privacidade
            </Link>
            <Link to="/termos" className="text-muted-foreground hover:text-foreground transition-smooth">
              Termos de Uso
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AccountDeletion;
