import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Settings, Sprout, ScanLine, Pencil, Trash2, ChevronRight } from "lucide-react";
import { useFamilyData } from "@/hooks/use-family-data";
import { useFamilyMembers, type FamilyMember } from "@/hooks/use-family-members";
import { useSubscription } from "@/hooks/use-subscription";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";


const ROLE_OPTIONS = ["Mãe", "Pai", "Filha", "Filho", "Avó", "Avô", "Outro"];
const EMOJI_OPTIONS = ["👤", "👩", "👨", "👧", "👦", "👵", "👴", "🧒", "👶"];
const COMMON_RESTRICTIONS = ["Sem glúten", "Sem lactose", "Vegetariano", "Vegano", "Low carb", "Halal", "Kosher"];
const COMMON_ALLERGIES = ["Amendoim", "Frutos do mar", "Ovo", "Leite", "Soja", "Trigo", "Castanhas"];

type EditState = { mode: "add" | "edit"; member?: FamilyMember };

const Family = () => {
  const { family, scans, loading: famLoading } = useFamilyData();
  const { members, loading: membersLoading, addMember, updateMember, deleteMember } = useFamilyMembers();
  const { isPremium } = useSubscription();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editState, setEditState] = useState<EditState>({ mode: "add" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loading = famLoading || membersLoading;

  const receiptScans = scans.filter(s => s.scan_type === "receipt");
  const totalItems = receiptScans.reduce((sum, s) => sum + s.item_count, 0);
  const totalAvoid = receiptScans.reduce((sum, s) => sum + s.avoid_count, 0);
  const avoidedPct = totalItems > 0 ? Math.round((1 - totalAvoid / totalItems) * 100) : 0;

  const openAdd = () => {
    setEditState({ mode: "add" });
    setDialogOpen(true);
  };

  const openEdit = (member: FamilyMember) => {
    setEditState({ mode: "edit", member });
    setDialogOpen(true);
  };

  return (
    <div className="p-5 space-y-5 pb-6">
      <header className="flex items-start justify-between pt-3">
        <div>
          <h1 className="text-3xl font-display">{family?.name ?? "Família"}</h1>
          <p className="text-muted-foreground text-sm">
            {members.length} {members.length === 1 ? "membro" : "membros"} ·{" "}
            {isPremium ? "Premium" : "Plano gratuito"}
          </p>
        </div>
        <Link to="/app/configuracoes" className="w-11 h-11 rounded-2xl bg-card shadow-soft flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </Link>
      </header>

      {receiptScans.length > 0 ? (
        <div className="rounded-3xl p-5 bg-card shadow-soft relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-success/10" />
          <div className="relative">
            <div className="flex items-center gap-2 text-success text-xs font-semibold uppercase tracking-wider mb-2">
              <Sprout className="w-4 h-4" /> Impacto sustentável
            </div>
            <p className="text-4xl font-display text-foreground">{receiptScans.length}</p>
            <p className="text-sm text-muted-foreground">
              {receiptScans.length === 1 ? "escaneamento realizado" : "escaneamentos realizados"}
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="rounded-xl bg-muted p-2.5">
                <p className="text-[10px] uppercase text-muted-foreground">Itens</p>
                <p className="text-base font-bold text-foreground">{totalItems}</p>
              </div>
              <div className="rounded-xl bg-muted p-2.5">
                <p className="text-[10px] uppercase text-muted-foreground">Saudáveis</p>
                <p className="text-base font-bold text-foreground">{avoidedPct}%</p>
              </div>
              <div className="rounded-xl bg-muted p-2.5">
                <p className="text-[10px] uppercase text-muted-foreground">Evitar</p>
                <p className="text-base font-bold text-foreground">{totalAvoid}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Link to="/app/escanear">
          <div className="rounded-3xl p-5 bg-card shadow-soft relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-success/10" />
            <div className="relative">
              <div className="flex items-center gap-2 text-success text-xs font-semibold uppercase tracking-wider mb-2">
                <Sprout className="w-4 h-4" /> Comece a medir
              </div>
              <p className="text-lg font-display text-foreground">Escaneie sua primeira nota fiscal</p>
              <p className="text-sm text-muted-foreground mt-1">Veja o impacto nutricional das suas compras aqui.</p>
              <div className="inline-flex items-center gap-2 mt-3 text-primary text-sm font-semibold">
                <ScanLine className="w-4 h-4" /> Escanear agora
              </div>
            </div>
          </div>
        </Link>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Membros</h2>
          <button
            onClick={openAdd}
            className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shadow-soft"
            aria-label="Adicionar membro"
          >
            <Plus className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2.5">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : members.length > 0 ? (
          <div className="space-y-2.5">
            {members.map((m) => (
              <div key={m.id} className="bg-card rounded-2xl p-4 shadow-soft flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl gradient-fresh flex items-center justify-center text-2xl shrink-0">
                  {m.avatar_emoji || "👤"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{m.display_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.role}{m.age != null ? ` · ${m.age} anos` : ""}
                  </p>
                  {(m.dietary_restrictions.length > 0 || m.allergies.length > 0) && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {m.dietary_restrictions.slice(0, 2).map((r) => (
                        <span key={r} className="px-1.5 py-0.5 rounded-full bg-warning/10 text-warning text-[9px] font-semibold">{r}</span>
                      ))}
                      {m.allergies.slice(0, 1).map((a) => (
                        <span key={a} className="px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-[9px] font-semibold">{a}</span>
                      ))}
                      {(m.dietary_restrictions.length + m.allergies.length) > 3 && (
                        <span className="text-[9px] text-muted-foreground">+{m.dietary_restrictions.length + m.allergies.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(m)}
                    className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center"
                    aria-label="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setDeleteId(m.id)}
                    className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center"
                    aria-label="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                  <Link
                    to={`/app/familia/${m.id}`}
                    className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center"
                    aria-label="Ver perfil"
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-4 shadow-soft text-center">
            <p className="text-sm text-muted-foreground">Nenhum membro cadastrado. Adicione sua família!</p>
          </div>
        )}
      </div>

      {!isPremium && (
        <Link to="/app/premium">
          <div className="rounded-3xl p-5 gradient-warm text-accent-foreground shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-90">NutriCasa Premium</p>
            <h3 className="text-2xl font-display mt-1 mb-1">Análises ilimitadas</h3>
            <p className="text-sm opacity-95 mb-4">Cardápios semanais com IA, relatórios completos e mais.</p>
            <div className="inline-block bg-card text-foreground px-5 py-2.5 rounded-full text-sm font-bold shadow-soft">
              Conhecer Premium
            </div>
          </div>
        </Link>
      )}

      {/* Add/Edit dialog */}
      <MemberFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editState={editState}
        saving={saving}
        onSave={async (data) => {
          setSaving(true);
          let error: string | null = null;
          if (editState.mode === "edit" && editState.member) {
            const res = await updateMember(editState.member.id, data);
            error = res.error;
            if (!error) toast.success("Membro atualizado!");
          } else {
            const res = await addMember(data);
            error = res.error;
            if (!error) toast.success("Membro adicionado!");
          }
          setSaving(false);
          if (!error) setDialogOpen(false);
        }}
      />

      {/* Delete confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">Remover membro?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta ação não pode ser desfeita. O membro será removido da família permanentemente.
          </p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-2xl"
              onClick={async () => {
                if (!deleteId) return;
                const { error } = await deleteMember(deleteId);
                if (error) toast.error(error);
                else toast.success("Membro removido.");
                setDeleteId(null);
              }}
            >
              Remover
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------- Member form dialog ---------- */

type FormData = {
  display_name: string;
  age: string;
  role: string;
  avatar_emoji: string;
  dietary_restrictions: string[];
  allergies: string[];
  nutrition_goals: string;
};

type NewMemberData = {
  display_name: string;
  age: number | null;
  role: string;
  avatar_emoji: string;
  dietary_restrictions: string[];
  allergies: string[];
  nutrition_goals: string | null;
};

function MemberFormDialog({
  open,
  onOpenChange,
  editState,
  saving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editState: EditState;
  saving: boolean;
  onSave: (data: NewMemberData) => Promise<void>;
}) {
  const m = editState.member;
  const [form, setForm] = useState<FormData>({
    display_name: m?.display_name ?? "",
    age: m?.age != null ? String(m.age) : "",
    role: m?.role ?? "Mãe",
    avatar_emoji: m?.avatar_emoji ?? "👤",
    dietary_restrictions: m?.dietary_restrictions ?? [],
    allergies: m?.allergies ?? [],
    nutrition_goals: m?.nutrition_goals ?? "",
  });

  // Reset form when dialog opens with new edit state
  useEffect(() => {
    if (open) {
      setForm({
        display_name: editState.member?.display_name ?? "",
        age: editState.member?.age != null ? String(editState.member.age) : "",
        role: editState.member?.role ?? "Mãe",
        avatar_emoji: editState.member?.avatar_emoji ?? "👤",
        dietary_restrictions: editState.member?.dietary_restrictions ?? [],
        allergies: editState.member?.allergies ?? [],
        nutrition_goals: editState.member?.nutrition_goals ?? "",
      });
    }
  }, [open, editState]);

  const toggleArrayItem = (arr: string[], item: string): string[] =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const handleSubmit = () => {
    if (!form.display_name.trim()) {
      toast.error("Informe o nome do membro.");
      return;
    }
    onSave({
      display_name: form.display_name.trim(),
      age: form.age.trim() ? Math.max(0, Math.min(120, Number(form.age))) || null : null,
      role: form.role,
      avatar_emoji: form.avatar_emoji,
      dietary_restrictions: form.dietary_restrictions,
      allergies: form.allergies,
      nutrition_goals: form.nutrition_goals.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            {editState.mode === "edit" ? "Editar membro" : "Adicionar membro"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Emoji + Name */}
          <div className="flex gap-3">
            <div className="shrink-0">
              <Label className="text-xs mb-1.5 block">Avatar</Label>
              <div className="flex gap-1 flex-wrap w-20">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, avatar_emoji: e }))}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-smooth ${
                      form.avatar_emoji === e ? "gradient-primary ring-2 ring-primary" : "bg-muted"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="name" className="text-xs mb-1.5 block">Nome</Label>
              <Input
                id="name"
                value={form.display_name}
                onChange={(e) => setForm(f => ({ ...f, display_name: e.target.value }))}
                placeholder="Ex: Sofia"
                className="rounded-2xl h-11"
              />
            </div>
          </div>

          {/* Age + Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="age" className="text-xs mb-1.5 block">Idade</Label>
              <Input
                id="age"
                type="number"
                min={0}
                max={120}
                value={form.age}
                onChange={(e) => setForm(f => ({ ...f, age: e.target.value }))}
                placeholder="Ex: 8"
                className="rounded-2xl h-11"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Papel na família</Label>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-smooth ${
                      form.role === r ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dietary restrictions */}
          <div>
            <Label className="text-xs mb-2 block">Restrições alimentares</Label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_RESTRICTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, dietary_restrictions: toggleArrayItem(f.dietary_restrictions, r) }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-smooth ${
                    form.dietary_restrictions.includes(r) ? "bg-warning/20 text-warning ring-1 ring-warning" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <Label className="text-xs mb-2 block">Alergias</Label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ALLERGIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, allergies: toggleArrayItem(f.allergies, a) }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-smooth ${
                    form.allergies.includes(a) ? "bg-destructive/15 text-destructive ring-1 ring-destructive" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Nutrition goals */}
          <div>
            <Label htmlFor="goals" className="text-xs mb-1.5 block">Metas de nutrição</Label>
            <Input
              id="goals"
              value={form.nutrition_goals}
              onChange={(e) => setForm(f => ({ ...f, nutrition_goals: e.target.value }))}
              placeholder="Ex: Energia & menopausa, crescimento saudável..."
              className="rounded-2xl h-11"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1 rounded-2xl h-11" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="flex-1 rounded-2xl h-11"
            disabled={saving}
            onClick={handleSubmit}
          >
            {saving ? "Salvando..." : editState.mode === "edit" ? "Salvar" : "Adicionar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Family;
