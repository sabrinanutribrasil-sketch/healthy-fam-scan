import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Database, Camera, Brain, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DataUsage = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setSent(true);
    toast.success("Mensagem enviada! Responderemos em breve.");
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md min-h-screen p-6 pb-10 space-y-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-fresh flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-display">Uso dos Dados</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Entenda como processamos suas informações para gerar análises nutricionais inteligentes.
          </p>
        </div>

        <div className="space-y-5">
          <section className="bg-card rounded-2xl p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Imagens e OCR</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Quando você fotografa uma nota fiscal ou rótulo, enviamos a imagem para um modelo de IA de visão (Google Gemini) que extrai textos, produtos e tabelas nutricionais. <strong>As imagens não são armazenadas permanentemente</strong> — apenas os dados estruturados extraídos (nome do produto, categoria, valores nutricionais) são salvos para compor o seu histórico de compras e perfil nutricional da família.
            </p>
          </section>

          <section className="bg-card rounded-2xl p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">IA e Análise Nutricional</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Nosso sistema classifica os produtos na escala NOVA (1 a 4), calcula scores de saúde e gera dicas personalizadas. Essas análises são feitas em tempo de execução e os resultados são vinculados à sua família. <strong>Nenhum dado pessoal identificável é usado para treinar modelos de IA de terceiros.</strong>
            </p>
          </section>

          <section className="bg-card rounded-2xl p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Dados da Família</h2>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Produtos escaneados e suas classificações nutricionais.</li>
              <li>Perfil de saúde de cada membro (restrições, objetivos).</li>
              <li>Evolução mensal de compras e pontuação geral.</li>
              <li>Todos os dados são isolados por família via Row Level Security (RLS).</li>
            </ul>
          </section>

          <section className="bg-card rounded-2xl p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Suporte</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tem dúvidas sobre seus dados, privacidade ou como funciona o app? Envie uma mensagem para nossa equipe.
            </p>

            {sent ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-success" />
                <p className="font-semibold">Mensagem enviada!</p>
                <p className="text-xs text-muted-foreground">Responderemos no e-mail informado em até 48h.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label className="text-xs">Nome</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" className="h-11 rounded-xl bg-muted mt-1" />
                </div>
                <div>
                  <Label className="text-xs">E-mail</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="voce@email.com" className="h-11 rounded-xl bg-muted mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Assunto</Label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Dúvida sobre privacidade" className="h-11 rounded-xl bg-muted mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Mensagem</Label>
                  <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Descreva sua dúvida ou solicitação..." className="rounded-xl bg-muted mt-1 min-h-[100px]" />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl gradient-primary shadow-glow gap-2">
                  <Send className="w-4 h-4" /> Enviar mensagem
                </Button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default DataUsage;
