import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Eye, Lock, Trash2, Mail } from "lucide-react";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background flex justify-center">
    <div className="w-full max-w-md min-h-screen p-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-fresh flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-3xl font-display">Política de Privacidade</h1>
      </div>

      <div className="space-y-6 text-sm text-foreground/90">
        <section>
          <h2 className="font-semibold text-base mb-2 flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" /> Quem somos
          </h2>
          <p className="text-muted-foreground">
            A <strong>NutriCasa</strong> é uma plataforma de análise nutricional familiar. Nosso objetivo é ajudar famílias a entenderem melhor suas compras e hábitos alimentares com o apoio de inteligência artificial.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" /> Dados que coletamos
          </h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Dados de cadastro:</strong> nome, e-mail, nome da família.</li>
            <li><strong>Dados de perfil:</strong> restrições alimentares, preferências, objetivos de saúde dos membros da família.</li>
            <li><strong>Imagens:</strong> fotos de notas fiscais e rótulos enviadas para análise via OCR e IA.</li>
            <li><strong>Dados de uso:</strong> produtos escaneados, categorias de compra, pontuações nutricionais.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">Como usamos seus dados</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Processar e analisar notas fiscais e rótulos alimentícios.</li>
            <li>Gerar perfis nutricionais e recomendações personalizadas para a família.</li>
            <li>Melhorar a precisão dos nossos algoritmos de classificação (de forma agregada e anonimizada).</li>
            <li>Enviar notificações relevantes sobre saúde e sustentabilidade, quando autorizado.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">Base legal (LGPD/GDPR)</h2>
          <p className="text-muted-foreground">
            O tratamento dos seus dados pessoais é realizado com base no <strong>consentimento</strong> (art. 7º, I da LGPD) e na <strong>execução do contrato/prestação de serviço</strong> (art. 7º, V). Você pode revogar o consentimento a qualquer momento nas configurações da conta.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">Compartilhamento</h2>
          <p className="text-muted-foreground">
            Não vendemos seus dados. As imagens enviadas são processadas por modelos de IA seguros (Google Gemini) e não são usadas para treinar modelos públicos. Os dados da família são visíveis apenas aos membros convidados da mesma família.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-primary" /> Seus direitos
          </h2>
          <p className="text-muted-foreground mb-2">Você tem os seguintes direitos sob a LGPD/GDPR:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Acesso, correção e exclusão dos seus dados.</li>
            <li>Portabilidade dos dados.</li>
            <li>Revogação do consentimento.</li>
            <li>Informação sobre compartilhamento.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> Contato
          </h2>
          <p className="text-muted-foreground">
            Dúvidas sobre privacidade? Envie um e-mail para <strong>privacidade@nutricasa.app</strong> ou use o formulário em nossa página de contato.
          </p>
        </section>

        <p className="text-xs text-muted-foreground pt-4 border-t border-border">
          Última atualização: 11 de junho de 2026.
        </p>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
