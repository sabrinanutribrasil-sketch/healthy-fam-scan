import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Eye,
  Database,
  Receipt,
  Target,
  Cpu,
  Lock,
  UserCheck,
  Trash2,
  Mail,
  ChevronRight,
} from "lucide-react";

type Section = {
  id: string;
  icon: typeof Shield;
  title: string;
  body: React.ReactNode;
};

const sections: Section[] = [
  {
    id: "identificacao",
    icon: Shield,
    title: "1. Identificação do aplicativo e responsável",
    body: (
      <p>
        Este aplicativo, <strong>NutriCasa</strong>, é uma plataforma de
        análise nutricional familiar que auxilia na compreensão de hábitos de
        compra e alimentação por meio da leitura de notas fiscais e rótulos.
      </p>
    ),
  },
  {
    id: "dados-pessoais",
    icon: Eye,
    title: "2. Dados pessoais coletados",
    body: (
      <ul>
        <li>
          <strong>Dados de cadastro:</strong> nome, endereço de e-mail e nome da
          família.
        </li>
        <li>
          <strong>Dados de perfil dos membros:</strong> nome, idade, sexo, peso,
          altura, nível de atividade, ocupação, restrições alimentares,
          alergias, condições médicas e objetivos nutricionais.
        </li>
        <li>
          <strong>Dados de uso:</strong> produtos escaneados, categorias de
          compra, pontuações nutricionais, histórico de escaneamentos e marcos
          de gamificação (pontos e conquistas).
        </li>
      </ul>
    ),
  },
  {
    id: "notas-fiscais",
    icon: Receipt,
    title: "3. Dados de notas fiscais e informações alimentares",
    body: (
      <>
        <p>
          Ao utilizar a função de escaneamento, o aplicativo processa:
        </p>
        <ul>
          <li>
            <strong>Imagens de notas fiscais</strong> enviadas pelo usuário,
            que são analisadas por tecnologia de reconhecimento óptico de
            caracteres (OCR) para extrair a lista de produtos.
          </li>
          <li>
            <strong>Imagens de rótulos de alimentos</strong> para identificar
            informações nutricionais e ingredientes.
          </li>
          <li>
            Os dados extraídos (nome do produto, quantidade, estabelecimento,
            total da compra) são armazenados associados à família do usuário
            para permitir o acompanhamento histórico.
          </li>
        </ul>
        <p>
          As imagens enviadas são processadas para análise e{" "}
          <strong>não são utilizadas para treinamento de modelos públicos</strong>.
        </p>
      </>
    ),
  },
  {
    id: "finalidades",
    icon: Target,
    title: "4. Finalidades do tratamento",
    body: (
      <ul>
        <li>Processar e analisar notas fiscais e rótulos alimentícios.</li>
        <li>
          Gerar perfis nutricionais e recomendações personalizadas para a
          família.
        </li>
        <li>
          Produzir cardápios semanalmente por meio de inteligência artificial.
        </li>
        <li>Calcular pontuações nutricionais e de sustentabilidade.</li>
        <li>Manter histórico de escaneamentos e evolução da família.</li>
        <li>
          Permitir a gamificação (pontos e conquistas) vinculada à família.
        </li>
        <li>
          Melhorar a precisão dos algoritmos de classificação de forma agregada
          e anonimizada.
        </li>
      </ul>
    ),
  },
  {
    id: "ia-terceiros",
    icon: Cpu,
    title: "5. Uso de inteligência artificial e serviços de terceiros",
    body: (
      <ul>
        <li>
          <strong>OpenAI</strong> é utilizada para analisar as imagens de notas
          fiscais e rótulos e para gerar recomendações e cardápios.
        </li>
        <li>
          <strong>Supabase</strong> é utilizada como infraestrutura de banco de
          dados, autenticação e armazenamento.
        </li>
        <li>
          <strong>Stripe</strong> é utilizada para processamento de pagamentos
          das assinaturas Premium.
        </li>
        <li>
          As imagens enviadas para análise são repassadas ao provedor de IA
          apenas para o processamento solicitado e não são usadas para treinar
          modelos públicos.
        </li>
      </ul>
    ),
  },
  {
    id: "armazenamento",
    icon: Lock,
    title: "6. Armazenamento e segurança",
    body: (
      <ul>
        <li>
          Os dados são armazenados em provedores de nuvem com criptografia em
          trânsito (TLS) e em repouso.
        </li>
        <li>
          O acesso aos dados é controlado por políticas de segurança em nível
          de linha (RLS), garantindo que cada família acesse apenas seus
          próprios dados.
        </li>
        <li>
          As credenciais de autenticação são protegidas e nunca armazenadas em
          texto plano.
        </li>
        <li>
          Apesar das medidas adotadas, nenhum sistema é totalmente seguro, e a
          Sabrina Rodrigues não pode garantir segurança absoluta.
        </li>
      </ul>
    ),
  },
  {
    id: "direitos",
    icon: UserCheck,
    title: "7. Direitos dos titulares",
    body: (
      <>
        <p>
          Conforme a LGPD (Lei 13.709/2018), você tem direito a:
        </p>
        <ul>
          <li><strong>Acesso</strong> aos seus dados pessoais.</li>
          <li>
            <strong>Correção</strong> de dados incompletos, inexatos ou
            desatualizados.
          </li>
          <li><strong>Eliminação</strong> dos dados pessoais tratados.</li>
          <li><strong>Portabilidade</strong> dos dados a outro fornecedor.</li>
          <li><strong>Revogação do consentimento</strong> a qualquer momento.</li>
          <li>
            <strong>Informação</strong> sobre o compartilhamento de dados com
            terceiros.
          </li>
          <li><strong>Oposição</strong> ao tratamento em determinadas situações.</li>
        </ul>
        <p>
          Para exercer qualquer direito, entre em contato pelo e-mail indicado
          na Seção 1.
        </p>
      </>
    ),
  },
  {
    id: "exclusao",
    icon: Trash2,
    title: "8. Exclusão de conta e dados",
    body: (
      <>
        <p className="font-semibold text-foreground">
          Retenção do histórico alimentar
        </p>
        <ul>
          <li>
            O NutriCasa tem como finalidade acompanhar a evolução dos hábitos
            alimentares e contribuir para a construção de um estilo de vida
            saudável ao longo do tempo.
          </li>
          <li>
            Por isso, os dados e históricos alimentares{" "}
            <strong>não são excluídos automaticamente</strong> após determinado
            período.
          </li>
          <li>
            Enquanto sua conta estiver ativa, suas informações poderão
            permanecer armazenadas para permitir o acompanhamento de sua
            evolução e a continuidade da experiência no aplicativo.
          </li>
        </ul>
        <p className="font-semibold text-foreground">
          Solicitação de exclusão de conta
        </p>
        <ul>
          <li>
            Você poderá solicitar a exclusão de sua conta e dos dados pessoais
            associados a qualquer momento.
          </li>
          <li>
            O NutriCasa prevê o prazo operacional de até{" "}
            <strong>15 dias úteis</strong> para processar as solicitações de
            exclusão, observadas as exigências legais aplicáveis.
          </li>
          <li>
            A exclusão respeitará as hipóteses legais de conservação de dados
            previstas na LGPD. Determinadas informações poderão ser mantidas
            pelo período necessário quando houver obrigação legal ou outra
            hipótese legítima de conservação.
          </li>
        </ul>
        <p className="font-semibold text-foreground">
          Exclusão de conta e exclusão de registros individuais
        </p>
        <ul>
          <li>
            A exclusão de conta e a exclusão de registros individuais são
            operações distintas.
          </li>
          <li>
            Quando disponíveis no aplicativo, registros individuais, como
            escaneamentos de notas fiscais ou informações de membros da família,
            poderão ser excluídos sem que isso implique o encerramento da conta.
          </li>
          <li>
            A solicitação de exclusão da conta abrangerá os dados pessoais e
            registros associados, conforme os limites técnicos e legais
            aplicáveis.
          </li>
        </ul>
        <p className="font-semibold text-foreground">
          Dados processados por terceiros
        </p>
        <ul>
          <li>
            Alguns recursos do NutriCasa podem utilizar serviços de terceiros
            para processamento de informações, como ferramentas de inteligência
            artificial para análise de imagens.
          </li>
          <li>
            O compartilhamento de informações ocorrerá apenas na medida
            necessária para a prestação dos serviços, observadas as finalidades
            informadas e as condições aplicáveis a cada provedor.
          </li>
          <li>
            O tratamento, a retenção e a eventual exclusão de dados por esses
            fornecedores estarão sujeitos às condições contratuais e políticas
            de privacidade correspondentes.
          </li>
          <li>
            A exclusão da conta no NutriCasa não significa necessariamente a
            eliminação imediata de eventuais registros mantidos por terceiros,
            quando houver retenção aplicável.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "contato",
    icon: Mail,
    title: "9. Contato e solicitações relacionadas à privacidade",
    body: (
      <>
        <p>
          Para dúvidas, solicitações de acesso, correção, exclusão ou revogação
          de consentimento:
        </p>
        <ul>
          <li>
            <strong>Responsável:</strong> Sabrina Rodrigues
          </li>
          <li>
            <strong>E-mail:</strong>{" "}
            <a
              href="mailto:sabrinanutribrasil@gmail.com"
              className="text-primary underline"
            >
              sabrinanutribrasil@gmail.com
            </a>
          </li>
        </ul>
        <p>
          Você também pode registrar reclamações junto à{" "}
          <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>{" "}
          caso entenda que seus direitos foram violados.
        </p>
      </>
    ),
  },
];

const PrivacyPolicy = () => {
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
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-display leading-tight">
                Política de Privacidade
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Última atualização: 3 de novembro de 2026
              </p>
            </div>
          </div>

          <div className="mt-6 mb-10 p-4 rounded-2xl bg-card border border-border">
            <p className="text-sm text-foreground/90">
              Esta política descreve como o <strong>NutriCasa</strong> coleta,
              usa e protege seus dados pessoais, em conformidade com a{" "}
              <strong>Lei Geral de Proteção de Dados (LGPD — Lei
              13.709/2018)</strong>.
            </p>
          </div>

          <nav aria-label="Sumário" className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Sumário
            </p>
            <ul className="space-y-1.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="flex items-center gap-2 text-sm text-foreground/80 hover:text-primary transition-smooth"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-10">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="flex items-center gap-2.5 text-lg sm:text-xl font-semibold mb-3">
                  <span className="w-9 h-9 rounded-xl gradient-fresh flex items-center justify-center shrink-0">
                    <s.icon className="w-4 h-4 text-primary" />
                  </span>
                  <span>{s.title}</span>
                </h2>
                <div className="prose prose-sm sm:prose-base max-w-none text-foreground/90 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_p]:leading-relaxed [&_p]:mb-3 pl-1">
                  {s.body}
                </div>
              </section>
            ))}
          </div>

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
            <p>Última atualização: 3 de novembro de 2026.</p>
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-card/50">
        <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">© 2026 NutriCasa · Sabrina Rodrigues</p>
          <div className="flex items-center gap-4">
            <Link to="/termos" className="text-muted-foreground hover:text-foreground transition-smooth">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="text-muted-foreground hover:text-foreground transition-smooth">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
