import { useState } from "react";
import { RotateCcw, Save, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { ReplenishmentSetting } from "@/lib/smart-shopping";

type FoodControl = { key: string; name: string; hasPurchase: boolean; automaticInterval?: number };
type Props = { foods: FoodControl[]; settings: ReplenishmentSetting[]; saving: boolean; onSave: (settings: ReplenishmentSetting[]) => Promise<boolean> };
function FoodFrequency({ food, setting, saving, onChange }: { food: FoodControl; setting?: ReplenishmentSetting; saving: boolean; onChange: (setting: ReplenishmentSetting) => Promise<boolean> }) {
  const [days, setDays] = useState(setting?.intervalDays?.toString() ?? "");
  const [invalid, setInvalid] = useState(false);
  const included = !setting?.excluded;
  const updateInterval = async () => {
    const interval = days.trim() ? Number(days) : null;
    if (interval !== null && (!Number.isInteger(interval) || interval < 1 || interval > 365)) { setInvalid(true); return; }
    setInvalid(false);
    await onChange({ key: food.key, name: food.name, intervalDays: interval, excluded: !included });
  };
  return <li className="py-3 space-y-2">
    <label className="flex items-start gap-3 text-sm"><Checkbox className="mt-1" checked={included} disabled={saving} aria-label={`Incluir ${food.name} nas previsões`} onCheckedChange={v => void onChange({ key: food.key, name: food.name, intervalDays: setting?.intervalDays ?? null, excluded: v !== true })} /><span className="min-w-0 break-words font-medium">{food.name}<span className="block text-xs font-normal text-muted-foreground mt-1">{included ? "Incluído nas previsões" : "Excluído das previsões"}</span></span></label>
    <div className="pl-7 space-y-2">
      <label className="block text-xs text-muted-foreground" htmlFor={`frequency-${food.key}`}>Reposição a cada (dias)</label>
      <div className="flex gap-2"><Input id={`frequency-${food.key}`} aria-label={`Intervalo de reposição de ${food.name}`} type="number" min={1} max={365} step={1} placeholder="Automático" value={days} disabled={saving || !included} aria-invalid={invalid} onChange={e => { setDays(e.target.value); setInvalid(false); }} /><Button size="icon" variant="outline" disabled={saving || !included} aria-label={`Salvar intervalo de ${food.name}`} title="Salvar intervalo" onClick={() => void updateInterval()}><Save /></Button><Button size="icon" variant="ghost" disabled={saving || !included || setting?.intervalDays == null} aria-label={`Usar intervalo automático de ${food.name}`} title="Voltar ao intervalo automático" onClick={async () => { if (await onChange({ key: food.key, name: food.name, intervalDays: null, excluded: false })) { setDays(""); setInvalid(false); } }}><RotateCcw /></Button></div>
      {invalid && <p role="alert" className="text-xs text-destructive">Informe um número inteiro de 1 a 365 dias.</p>}
      {!food.hasPurchase ? <p className="text-xs text-muted-foreground">A previsão começa após uma nota escaneada com este alimento.</p> : <p className="text-xs text-muted-foreground">{setting?.intervalDays ? `Intervalo definido pela família: ${setting.intervalDays} dias.` : food.automaticInterval ? `Intervalo automático: ~${food.automaticInterval} dias.` : "O intervalo automático precisa de compras em duas datas."}</p>}
    </div>
  </li>;
}
export function ReplenishmentControls({ foods, settings, saving, onSave }: Props) {
  const update = (setting: ReplenishmentSetting) => {
    const next = settings.filter(s => s.key !== setting.key);
    if (setting.excluded || setting.intervalDays !== null) next.push(setting);
    return onSave(next);
  };
  return <details className="border-y py-3">
    <summary className="text-sm font-medium cursor-pointer text-primary"><span className="inline-flex items-center gap-2"><Settings2 className="w-4 h-4" />Ajustar consumo e previsões</span></summary>
    <p className="text-xs text-muted-foreground mt-3">Intervalo contado desde a última compra registrada. Desmarcar exclui apenas a previsão, sem apagar alimentos ou compras.</p>
    {!foods.length ? <p className="text-sm text-muted-foreground mt-3">Adicione um alimento à lista ou escaneie uma nota para ajustar sua reposição.</p> : <ul className="divide-y mt-2">{foods.map(food => {
      const setting = settings.find(s => s.key === food.key);
      return <FoodFrequency key={`${food.key}-${setting?.intervalDays ?? "auto"}-${setting?.excluded ?? false}`} food={food} setting={setting} saving={saving} onChange={update} />;
    })}</ul>}
  </details>;
}