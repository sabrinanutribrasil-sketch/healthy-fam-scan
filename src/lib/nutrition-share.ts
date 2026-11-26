import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import mealImage from "@/assets/hero-meal.jpg";
import type { ScanRecord } from "@/hooks/use-family-data";

export type ShareFormat = "story" | "square";
export function nutritionShareData(scans: ScanRecord[], familyName: string, includeName: boolean) {
  const scan = scans.find(s => s.scan_type === "receipt" && s.score !== null);
  if (!scan) return null;
  return {
    score: scan.score,
    date: new Date(scan.created_at).toLocaleDateString("pt-BR"),
    heading: includeName && familyName.trim() ? familyName.trim() : "Nossa casa",
  };
}

export async function renderNutritionCard(data: NonNullable<ReturnType<typeof nutritionShareData>>, format: ShareFormat): Promise<Blob> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = format === "story" ? 1920 : 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível criar a imagem.");
  const tokens = getComputedStyle(document.documentElement);
  const color = (name: string) => `hsl(${tokens.getPropertyValue(`--${name}`).trim()})`;
  const h = canvas.height;
  ctx.fillStyle = color("background");
  ctx.fillRect(0, 0, 1080, h);
  const image = new Image();
  image.src = mealImage;
  await image.decode();
  const photoHeight = format === "story" ? 570 : 240;
  const scale = Math.max(1080 / image.width, photoHeight / image.height);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, 1080, photoHeight); ctx.clip();
  ctx.drawImage(image, (1080 - image.width * scale) / 2, (photoHeight - image.height * scale) / 2, image.width * scale, image.height * scale);
  ctx.restore();
  ctx.textAlign = "center";
  const text = (value: string, y: number, size: number, token = "foreground", serif = false) => {
    ctx.fillStyle = color(token);
    ctx.font = `${serif ? "400" : "700"} ${size}px ${serif ? '"DM Serif Display", Georgia' : '"Plus Jakarta Sans", sans-serif'}`;
    ctx.fillText(value, 540, y, 920);
  };
  const base = photoHeight;
  text("NutriCasa", base + 100, 64, "primary", true);
  text(data.heading, base + 170, 38);
  text("Cada compra, um novo passo.", base + 225, 30, "muted-foreground");
  const scoreY = base + (format === "story" ? 440 : 385);
  text(String(data.score), scoreY, format === "story" ? 180 : 140, "primary", true);
  text("de 100 • pontuação das compras", scoreY + 62, 30, "muted-foreground");
  text("Cuidando da alimentação em família", scoreY + 145, 35, "foreground", true);
  text(`Nota fiscal analisada em ${data.date}`, scoreY + 205, 26, "muted-foreground");
  ctx.fillStyle = color("primary");
  ctx.fillRect(0, h - 145, 1080, 145);
  text("nutricasascan.app", h - 83, 34, "primary-foreground");
  text("Análise das compras • não é avaliação médica", h - 35, 22, "primary-foreground");
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Não foi possível salvar a imagem.")), "image/png"));
}

export function downloadNutritionCard(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "nutricasa-conquista.png";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareNutritionCard(blob: Blob): Promise<"shared" | "downloaded" | "cancelled"> {
  if (Capacitor.isNativePlatform()) {
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === "string" ? resolve(reader.result.split(",")[1]) : reject(new Error("Imagem inválida."));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const path = `nutricasa-conquista-${Date.now()}.png`;
    const file = await Filesystem.writeFile({ path, data, directory: Directory.Cache });
    try {
      await Share.share({ title: "Nossa conquista no NutriCasa", files: [file.uri], dialogTitle: "Compartilhar conquista" });
    } finally {
      await Filesystem.deleteFile({ path, directory: Directory.Cache }).catch(() => undefined);
    }
    return "shared";
  }
  const file = new File([blob], "nutricasa-conquista.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Nossa conquista no NutriCasa" });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return "cancelled";
      throw error;
    }
  }
  downloadNutritionCard(blob);
  return "downloaded";
}