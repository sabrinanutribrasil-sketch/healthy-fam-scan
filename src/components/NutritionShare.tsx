import { useEffect, useState } from "react";
import { Download, Loader2, Share2, Square, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { downloadNutritionCard, nutritionShareData, renderNutritionCard, shareNutritionCard, type ShareFormat } from "@/lib/nutrition-share";
import type { ScanRecord } from "@/hooks/use-family-data";

export function NutritionShare({ scans, familyName }: { scans: ScanRecord[]; familyName: string }) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ShareFormat>("story");
  const [includeName, setIncludeName] = useState(false);
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const data = nutritionShareData(scans, familyName, includeName);
  const score = data?.score;
  const heading = data?.heading;
  const date = data?.date;

  useEffect(() => {
    setImage(null);
    setError(false);
    if (!open || score == null || !heading || !date) return;
    let active = true;
    let url: string | undefined;
    renderNutritionCard({ score, heading, date }, format).then(blob => {
      if (!active) return;
      url = URL.createObjectURL(blob);
      setImage({ blob, url });
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [open, format, score, heading, date, retry]);

  if (!data) return null;
  const share = async () => {
    if (!image) return;
    setBusy(true);
    try {
      const result = await shareNutritionCard(image.blob);
      if (result === "downloaded") toast.success("Imagem baixada para enviar no WhatsApp ou publicar nos Stories.");
    } catch {
      toast.error("Não foi possível compartilhar. Você ainda pode baixar a imagem.");
    } finally { setBusy(false); }
  };

  return (
    <>
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
        <Share2 /> Compartilhar conquista
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto rounded-lg p-4 w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Nossa conquista</DialogTitle>
            <DialogDescription>Um novo passo no cuidado com a alimentação da casa.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Formato da imagem">
            <Button variant={format === "story" ? "default" : "outline"} aria-pressed={format === "story"} disabled={busy} onClick={() => setFormat("story")}><Smartphone /> Stories</Button>
            <Button variant={format === "square" ? "default" : "outline"} aria-pressed={format === "square"} disabled={busy} onClick={() => setFormat("square")}><Square /> Quadrado</Button>
          </div>
          <div className="flex justify-center bg-muted rounded-lg p-3 min-h-48" aria-busy={!image && !error}>
            {image ? (
              <img src={image.url} alt={`Cartão NutriCasa: ${data.heading}, ${data.score} de 100, nota fiscal de ${data.date}`} className="max-w-full max-h-[42dvh] object-contain" />
            ) : error ? (
              <div className="self-center text-center space-y-3">
                <p className="text-sm text-destructive" role="alert">Não foi possível criar a imagem.</p>
                <Button variant="outline" onClick={() => setRetry(v => v + 1)}>Tentar novamente</Button>
              </div>
            ) : <Loader2 className="self-center animate-spin text-primary" aria-label="Preparando imagem" />}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={includeName} disabled={busy} onCheckedChange={value => setIncludeName(value === true)} />
            Incluir nome da família
          </label>
          <p className="text-xs text-muted-foreground">Sem nomes dos membros, alergias ou detalhes das compras.</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" disabled={!image || busy} onClick={() => { if (image) downloadNutritionCard(image.blob); }}><Download /> Baixar PNG</Button>
            <Button disabled={!image || busy} onClick={share}>{busy ? <Loader2 className="animate-spin" /> : <Share2 />} Compartilhar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}