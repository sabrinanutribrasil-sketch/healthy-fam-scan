import { useState } from "react";
import { ScanLine, FileText, Tag, Camera, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const Scan = () => {
  const [mode, setMode] = useState<"nota" | "rotulo">("nota");
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);

  const handleScan = () => {
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setDone(true); }, 2200);
  };

  return (
    <div className="p-5 pb-6 space-y-5">
      <header className="pt-3">
        <h1 className="text-3xl font-display">Escanear</h1>
        <p className="text-muted-foreground text-sm">Use a câmera para analisar com IA</p>
      </header>

      {/* Toggle */}
      <div className="bg-muted rounded-2xl p-1 grid grid-cols-2 gap-1">
        {([
          { k: "nota", l: "Nota fiscal", i: FileText },
          { k: "rotulo", l: "Rótulo", i: Tag },
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => { setMode(t.k); setDone(false); }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-smooth ${
              mode === t.k ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"
            }`}
          >
            <t.i className="w-4 h-4" /> {t.l}
          </button>
        ))}
      </div>

      {/* Camera viewfinder */}
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-br from-foreground to-primary/40 shadow-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6))]" />
        {/* Corner brackets */}
        {[
          "top-6 left-6 border-t-4 border-l-4 rounded-tl-2xl",
          "top-6 right-6 border-t-4 border-r-4 rounded-tr-2xl",
          "bottom-6 left-6 border-b-4 border-l-4 rounded-bl-2xl",
          "bottom-6 right-6 border-b-4 border-r-4 rounded-br-2xl",
        ].map((c) => (
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
          <ScanLine className="w-12 h-12 opacity-90" />
          <p className="font-semibold">
            {analyzing ? "Analisando com IA..." : mode === "nota" ? "Posicione a nota fiscal" : "Aproxime o rótulo"}
          </p>
          <p className="text-xs opacity-80 max-w-[220px]">
            {mode === "nota" ? "Vamos reconhecer todos os produtos automaticamente." : "Vamos identificar açúcar, sódio e aditivos."}
          </p>
        </div>
      </div>

      {!done && (
        <Button onClick={handleScan} disabled={analyzing} size="lg" className="w-full h-14 rounded-2xl gradient-primary shadow-glow gap-2">
          <Camera className="w-5 h-5" /> {analyzing ? "Processando..." : "Capturar"}
        </Button>
      )}

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="bg-card rounded-2xl p-5 shadow-soft">
              <div className="flex items-center gap-2 text-success mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <p className="font-semibold">Análise concluída</p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">23 produtos reconhecidos · R$ 287,40</p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-success/10 rounded-xl">
                  <p className="text-2xl font-display text-success">14</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Saudáveis</p>
                </div>
                <div className="text-center p-3 bg-warning/10 rounded-xl">
                  <p className="text-2xl font-display text-warning">6</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Atenção</p>
                </div>
                <div className="text-center p-3 bg-destructive/10 rounded-xl">
                  <p className="text-2xl font-display text-destructive">3</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Evite</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { n: "Aveia em flocos", s: "good", t: "Rica em fibras" },
                  { n: "Refrigerante 2L", s: "bad", t: "Excesso de açúcar" },
                  { n: "Iogurte natural", s: "good", t: "Probiótico" },
                  { n: "Salgadinho", s: "bad", t: "Ultraprocessado" },
                ].map((p) => (
                  <div key={p.n} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50">
                    {p.s === "good" ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.n}</p>
                      <p className="text-xs text-muted-foreground">{p.t}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-4 gradient-warm text-accent-foreground flex items-start gap-3">
              <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Dica da IA</p>
                <p className="text-xs opacity-95 mt-0.5">Troque o refrigerante por água com gás + limão. Sua família reduz 240g de açúcar por semana.</p>
              </div>
            </div>

            <Button onClick={() => setDone(false)} variant="outline" size="lg" className="w-full h-12 rounded-2xl">
              Escanear novamente
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Scan;
