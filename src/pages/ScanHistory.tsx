import { Link } from "react-router-dom";
import { ArrowLeft, Receipt, ScanLine, TrendingUp, Leaf, AlertTriangle, ShoppingCart, Clock, ChevronRight } from "lucide-react";
import { useFamilyData, type ScanRecord } from "@/hooks/use-family-data";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${time}`;
}

type ReceiptResult = {
  store?: string;
  total?: number;
  items?: { name: string; normalized_name: string; category: string; nova_class: number; health_flag: string; reason: string; price?: number }[];
  summary?: { healthy_count: number; warning_count: number; avoid_count: number; score: number; ai_tip: string };
};

type LabelResult = {
  product_name?: string;
  brand?: string;
  nova_class?: number;
  health_flag?: string;
  warnings?: string[];
  ai_tip?: string;
};

function ScanCard({ scan, index }: { scan: ScanRecord; index: number }) {
  const isReceipt = scan.scan_type === "receipt";
  const result = scan.result as ReceiptResult | LabelResult | null;

  const scoreColor =
    scan.score == null ? "text-muted-foreground" :
    scan.score >= 80 ? "text-success" :
    scan.score >= 60 ? "text-warning" : "text-destructive";

  const scoreBg =
    scan.score == null ? "bg-muted" :
    scan.score >= 80 ? "bg-success/10" :
    scan.score >= 60 ? "bg-warning/10" : "bg-destructive/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-card rounded-2xl shadow-soft overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${scoreBg}`}>
            {isReceipt ? <Receipt className={`w-5 h-5 ${scoreColor}`} /> : <ScanLine className={`w-5 h-5 ${scoreColor}`} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                {isReceipt ? "Nota fiscal" : "Rótulo"}
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDate(scan.created_at)}
              </span>
            </div>
            <p className="font-semibold text-sm leading-snug truncate">
              {isReceipt
                ? (scan.store || (result as ReceiptResult)?.store || "Supermercado")
                : ((result as LabelResult)?.product_name || "Produto")}
            </p>
            {isReceipt && scan.total != null && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {scan.item_count} itens · R$ {scan.total.toFixed(2).replace(".", ",")}
              </p>
            )}
            {!isReceipt && (result as LabelResult)?.brand && (
              <p className="text-xs text-muted-foreground mt-0.5">{(result as LabelResult)?.brand}</p>
            )}
          </div>
          {scan.score != null && (
            <div className="text-right shrink-0">
              <span className={`text-2xl font-display ${scoreColor}`}>{scan.score}</span>
              <p className="text-[10px] text-muted-foreground">/100</p>
            </div>
          )}
        </div>

        {isReceipt && (
          <div className="flex gap-2 mt-3">
            <div className="flex-1 rounded-xl bg-success/10 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-success" />
                <span className="text-xs font-bold text-success">{scan.healthy_count}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Saudáveis</p>
            </div>
            <div className="flex-1 rounded-xl bg-warning/10 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                <span className="text-xs font-bold text-warning">{scan.warning_count}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Atenção</p>
            </div>
            <div className="flex-1 rounded-xl bg-destructive/10 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-destructive" />
                <span className="text-xs font-bold text-destructive">{scan.avoid_count}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Evitar</p>
            </div>
          </div>
        )}

        {isReceipt && (result as ReceiptResult)?.summary?.ai_tip && (
          <div className="mt-3 rounded-xl bg-muted/60 px-3 py-2.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Dica: </span>
              {(result as ReceiptResult)?.summary?.ai_tip}
            </p>
          </div>
        )}

        {!isReceipt && (result as LabelResult)?.ai_tip && (
          <div className="mt-3 rounded-xl bg-muted/60 px-3 py-2.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Dica: </span>
              {(result as LabelResult)?.ai_tip}
            </p>
          </div>
        )}

        {!isReceipt && (result as LabelResult)?.warnings && (result as LabelResult)?.warnings!.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(result as LabelResult)?.warnings!.map((w, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-semibold">
                {w}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

const ScanHistory = () => {
  const { scans, loading, avgScore, latestScore, totalScans } = useFamilyData();

  if (loading) {
    return (
      <div className="p-5 space-y-5">
        <header className="flex items-center gap-3 pt-3">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  const hasData = scans.length > 0;

  return (
    <div className="p-5 space-y-5 pb-6">
      <header className="flex items-center gap-3 pt-3">
        <Link to="/app" className="w-10 h-10 rounded-2xl bg-card shadow-soft flex items-center justify-center" aria-label="Voltar">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-xs text-muted-foreground">Histórico</p>
          <h1 className="text-2xl font-display leading-tight">Escaneamentos</h1>
        </div>
      </header>

      {hasData ? (
        <>
          {/* Summary */}
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-5 text-primary-foreground shadow-glow">
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-primary-foreground/10" />
            <div className="relative">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-3xl font-display leading-none">{totalScans}</p>
                  <p className="text-xs opacity-80 mt-1">Total de scans</p>
                </div>
                <div>
                  <p className="text-3xl font-display leading-none">{latestScore}</p>
                  <p className="text-xs opacity-80 mt-1">Último score</p>
                </div>
                <div>
                  <p className="text-3xl font-display leading-none">{avgScore}</p>
                  <p className="text-xs opacity-80 mt-1">Média geral</p>
                </div>
              </div>
            </div>
          </div>

          {latestScore > 0 && avgScore > 0 && latestScore > avgScore && (
            <div className="flex items-center gap-2 text-success text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              Sua última compra pontuou {latestScore - avgScore} pontos acima da média da família!
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-3">
            {scans.map((scan, i) => (
              <ScanCard key={scan.id} scan={scan} index={i} />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-card rounded-3xl p-8 shadow-soft text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl gradient-fresh flex items-center justify-center mx-auto">
            <ScanLine className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display mb-2">Nenhum escaneamento ainda</h2>
            <p className="text-sm text-muted-foreground">
              Escaneie sua primeira nota fiscal ou rótulo para começar a acompanhar a evolução nutricional da sua família.
            </p>
          </div>
          <Link
            to="/app/escanear"
            className="inline-flex items-center gap-2 gradient-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold shadow-glow"
          >
            <ScanLine className="w-5 h-5" /> Escanear agora
          </Link>
        </div>
      )}

      {hasData && (
        <Link to="/app/perfil-nutricional" className="block">
          <div className="bg-card rounded-2xl p-4 shadow-soft flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-fresh flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Ver perfil nutricional completo</p>
              <p className="text-xs text-muted-foreground">Gráficos, evolução e classificação NOVA</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      )}
    </div>
  );
};

export default ScanHistory;
