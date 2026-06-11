import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Scale, AlertCircle } from "lucide-react";

const TermsOfUse = () => (
  <div className="min-h-screen bg-background flex justify-center">
    <div className="w-full max-w-md min-h-screen p-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-fresh flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-3xl font-display">Termos de Uso</h1>
      </div>

      <div className="space-y-6 text-sm text-foreground/90">
        <section>
          <h2 className="font-semibold text-base mb-2">1. Aceitação dos termos</h2>
          <p className="text-muted-foreground">
            Ao criar uma conta e usar a NutriCasa, você concorda com estes Termos de Uso. Se não concordar, não utilize a plataforma.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">2. Serviço oferecido</h2>
          <p className="text-muted-foreground">
            A NutriCasa oferece análise nutricional automatizada de produtos alimentícios a partir de notas fiscais e rótulos, usando tecnologia de OCR e inteligência artificial. As análises são informativas e <strong>não substituem orientação médica ou nutricional profissional</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">3. Cadastro e conta</h2>
          <p className="text-muted-foreground">
            Você é responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas na sua conta. Informações falsas ou incompletas podem resultar na suspensão do acesso.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">4. Uso aceitável</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Não use a plataforma para fins ilegais ou não autorizados.</li>
            <li>Não tente acessar dados de outras famílias sem autorização.</li>
            <li>Não envie conteúdo ofensivo, discriminatório ou prejudicial.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" /> 5. Isenção de responsabilidade
          </h2>
          <p className="text-muted-foreground">
            A NutriCasa não se responsabiliza por decisões de saúde baseadas exclusivamente nas análises da plataforma. Sempre consulte um profissional de saúde qualificado para questões médicas, nutricionais ou de segurança alimentar.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">6. Propriedade intelectual</h2>
          <p className="text-muted-foreground">
            Todo o conteúdo, design, marca e código da NutriCasa são de nossa propriedade ou licenciados. É proibida a cópia, distribuição ou modificação sem autorização.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">7. Modificações e rescisão</h2>
          <p className="text-muted-foreground">
            Podemos atualizar estes termos a qualquer momento. Alterações significativas serão notificadas. Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2 flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" /> 8. Legislação aplicável
          </h2>
          <p className="text-muted-foreground">
            Estes termos são regidos pelas leis da República Federativa do Brasil, incluindo a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).
          </p>
        </section>

        <p className="text-xs text-muted-foreground pt-4 border-t border-border">
          Última atualização: 11 de junho de 2026.
        </p>
      </div>
    </div>
  </div>
);

export default TermsOfUse;
