import { useRef, useState, useEffect } from "react";
import { ScanLine, FileText, Tag, Camera, Sparkles, CheckCircle2, AlertTriangle, Loader2, RotateCcw, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { usePrivacyConsent } from "@/hooks/use-privacy-consent";
import { toast } from "sonner";

type ReceiptItem = {
  name: string;
  normalized_name: string;
  category: string;
  nova_class: number;
  quantity?: number;
  unit?: string;
  price?: number;
  health_flag: "good" | "warn" | "bad";
  reason: string;
};

type ReceiptResult = {
  store?: string;
  total?: number;
  items: ReceiptItem[];
  summary: {
    healthy_count: number;
    warning_count: number;
    avoid_count: number;
    score: number;
    ai_tip: string;
  };
};

type LabelResult = {
  product_name: string;
  brand?: string;
  serving_size?: string;
  nutrition_per_100?: Record<string, number>;
  ingredients?: string[];
  additives?: string[];
  allergens?: string[];
  nova_class: number;
  health_flag: "good" | "warn" | "bad";
  warnings?: string[];
  ai_tip: string;
  swap_suggestion?: string;
};

const flagColor = (f: string) =>
  f === "good" ? "text-success" : f === "warn" ? "text-warning" : "text-destructive";

const Scan = () => {
  const [mode, setMode] = useState<"nota" | "rotulo">("nota");
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptResult | null>(null);
  const [label, setLabel] = useState<LabelResult | null>(null);
  const [showCameraConsent, setShowCameraConsent] = useState(false);
  const [cameraAccepted, setCameraAccepted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { cameraConsent, saveCameraConsent } = usePrivacyConsent();

  useEffect(() => {
    if (!cameraConsent) setShowCameraConsent(true);
  }, [cameraConsent]);

  const reset = () => {
    setReceipt(null);
    setLabel(null);
    setPreview(null);
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 8MB)");
      return;
    }
    reset();
    setAnalyzing(true);
    try {
      const dataUrl = await toBase64(file);
      setPreview(dataUrl);

      const { data, error } = await supabase.functions.invoke("scan-analyze", {
        body: { image: dataUrl, type: mode === "nota" ? "receipt" : "label" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (mode === "nota") setReceipt(data.result as ReceiptResult);
      else setLabel(data.result as LabelResult);
      toast.success("Análise concluída!");
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao analisar imagem");
      reset();
    } finally {
      setAnalyzing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const done = !!receipt || !!label;

  return (
    <div className="p-5 pb-6 space-y-5">
      <header className="pt-3">
        <h1 className="text-3xl font-display">Escanear</h1>
        <p className="text-muted-foreground text-sm">OCR + IA para análise nutricional</p>
      </header>

      <div className="bg-muted rounded-2xl p-1 grid grid-cols-2 gap-1">
        {([
          { k: "nota", l: "Nota fiscal", i: FileText },
          { k: "rotulo", l: "Rótulo", i: Tag },
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => { setMode(t.k); reset(); }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-smooth ${
              mode === t.k ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"
            }`}
          >
            <t.i className="w-4 h-4" /> {t.l}
          </button>
        ))}
      </div>

      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-br from-foreground to-primary/40 shadow-card">
        {preview && (
          <img src={preview} alt="Captura" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6))]" />
        {["top-6 left-6 border-t-4 border-l-4 rounded-tl-2xl","top-6 right-6 border-t-4 border-r-4 rounded-tr-2xl","bottom-6 left-6 border-b-4 border-l-4 rounded-bl-2xl","bottom-6 right-6 border-b-4 border-r-4 rounded-br-2xl"].map((c) => (
          <div key={c} className={`absolute w-14 h-14 border-primary-foreground/80 ${c}`} />
        ))}

        {analyzing && (
          <motion.div
            initial={{ top: "10%" }}
            animate={{ top: "85%" }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            className="absolute left-6 right-6 h-1 bg-primary-glow shadow-glow rounded-full"
          />
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground gap-2 px-6 text-center">
          {analyzing ? <Loader2 className="w-12 h-12 animate-spin" /> : <ScanLine className="w-12 h-12 opacity-90" />}
          <p className="font-semibold">
            {analyzing ? "Lendo com IA..." : mode === "nota" ? "Posicione a nota fiscal" : "Aproxime o rótulo"}
          </p>
          <p className="text-xs opacity-80 max-w-[240px]">
            {mode === "nota"
              ? "Reconhecemos os itens e classificamos pela escala NOVA."
              : "Extraímos tabela nutricional, ingredientes e aditivos."}
          </p>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFile}
      />

      {!done && (
        <Button
          onClick={() => fileRef.current?.click()}
          disabled={analyzing}
          size="lg"
          className="w-full h-14 rounded-2xl gradient-primary shadow-glow gap-2"
        >
          {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          {analyzing ? "Processando..." : "Capturar imagem"}
        </Button>
      )}

      <AnimatePresence>
        {receipt && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="bg-card rounded-2xl p-5 shadow-soft">
              <div className="flex items-center gap-2 text-success mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <p className="font-semibold">Análise concluída</p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {receipt.items.length} produtos · {receipt.store ?? "—"}
                {receipt.total ? ` · R$ ${receipt.total.toFixed(2)}` : ""}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <Stat n={receipt.summary.healthy_count} label="Saudáveis" tone="success" />
                <Stat n={receipt.summary.warning_count} label="Atenção" tone="warning" />
                <Stat n={receipt.summary.avoid_count} label="Evite" tone="destructive" />
              </div>

              <div className="space-y-2 max-h-80 overflow-auto">
                {receipt.items.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50">
                    {p.health_flag === "good" ? (
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${flagColor(p.health_flag)}`} />
                    ) : (
                      <AlertTriangle className={`w-4 h-4 shrink-0 ${flagColor(p.health_flag)}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        NOVA {p.nova_class} · {p.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-4 gradient-warm text-accent-foreground flex items-start gap-3">
              <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Dica da IA · Pontuação {receipt.summary.score}/100</p>
                <p className="text-xs opacity-95 mt-0.5">{receipt.summary.ai_tip}</p>
              </div>
            </div>

            <Button onClick={reset} variant="outline" size="lg" className="w-full h-12 rounded-2xl gap-2">
              <RotateCcw className="w-4 h-4" /> Escanear novamente
            </Button>
          </motion.div>
        )}

        {label && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="bg-card rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{label.brand ?? "Produto"}</p>
                  <h2 className="text-xl font-display">{label.product_name}</h2>
                </div>
                <span className={`text-xs font-bold uppercase px-2 py-1 rounded-lg bg-muted ${flagColor(label.health_flag)}`}>
                  NOVA {label.nova_class}
                </span>
              </div>

              {label.nutrition_per_100 && (
                <div className="grid grid-cols-4 gap-2 my-4 text-center">
                  {Object.entries(label.nutrition_per_100).slice(0, 8).map(([k, v]) => (
                    <div key={k} className="p-2 rounded-xl bg-muted/50">
                      <p className="text-sm font-bold">{Number(v).toFixed(1)}</p>
                      <p className="text-[10px] uppercase text-muted-foreground truncate">{k.replace(/_/g, " ")}</p>
                    </div>
                  ))}
                </div>
              )}

              {label.warnings && label.warnings.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {label.warnings.map((w) => (
                    <div key={w} className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" /> {w}
                    </div>
                  ))}
                </div>
              )}

              {label.ingredients && label.ingredients.length > 0 && (
                <details className="text-sm">
                  <summary className="font-medium cursor-pointer">Ingredientes ({label.ingredients.length})</summary>
                  <p className="text-xs text-muted-foreground mt-2">{label.ingredients.join(", ")}</p>
                </details>
              )}
            </div>

            <div className="rounded-2xl p-4 gradient-warm text-accent-foreground flex items-start gap-3">
              <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Dica da IA</p>
                <p className="text-xs opacity-95 mt-0.5">{label.ai_tip}</p>
                {label.swap_suggestion && (
                  <p className="text-xs opacity-95 mt-1">🔁 {label.swap_suggestion}</p>
                )}
              </div>
            </div>

            <Button onClick={reset} variant="outline" size="lg" className="w-full h-12 rounded-2xl gap-2">
              <RotateCcw className="w-4 h-4" /> Escanear novamente
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Stat = ({ n, label, tone }: { n: number; label: string; tone: "success" | "warning" | "destructive" }) => (
  <div className={`text-center p-3 rounded-xl bg-${tone}/10`}>
    <p className={`text-2xl font-display text-${tone}`}>{n}</p>
    <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
  </div>
);

export default Scan;
