import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, ShieldAlert, Target, Heart, Cake } from "lucide-react";
import { useFamilyMembers } from "@/hooks/use-family-members";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";

const MemberProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { members, loading, deleteMember } = useFamilyMembers();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const member = members.find(m => m.id === id);

  if (loading) {
    return (
      <div className="p-5 space-y-5">
        <div className="flex items-center gap-3 pt-3">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-5 pt-10 text-center space-y-4">
        <p className="text-muted-foreground">Membro não encontrado.</p>
        <Link to="/app/familia" className="text-primary font-semibold">Voltar para a família</Link>
      </div>
    );
  }

  const restrictions = member.dietary_restrictions;
  const allergies = member.allergies;

  return (
    <div className="pb-6">
      {/* Header with avatar */}
      <div className="relative overflow-hidden">
        <div className="h-32 gradient-primary" />
        <div className="px-5 -mt-12 relative">
          <div className="flex items-start justify-between">
            <div className="w-20 h-20 rounded-3xl bg-card shadow-glow flex items-center justify-center text-4xl border-4 border-background">
              {member.avatar_emoji || "👤"}
            </div>
            <button
              onClick={() => navigate("/app/familia")}
              className="w-10 h-10 rounded-2xl bg-card/90 backdrop-blur shadow-soft flex items-center justify-center mt-2"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 space-y-1"
          >
            <h1 className="text-2xl font-display">{member.display_name}</h1>
            <p className="text-sm text-muted-foreground">
              {member.role}
              {member.age != null ? ` · ${member.age} anos` : ""}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Nutrition goal */}
        {member.nutrition_goals && (
          <div className="bg-card rounded-3xl p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl gradient-fresh flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-display text-lg">Meta de nutrição</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{member.nutrition_goals}</p>
          </div>
        )}

        {/* Dietary restrictions */}
        <section>
          <h2 className="font-display text-lg mb-3">Restrições alimentares</h2>
          {restrictions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {restrictions.map((r) => (
                <span
                  key={r}
                  className="px-3 py-2 rounded-2xl bg-warning/10 text-warning text-sm font-semibold flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> {r}
                </span>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-4 shadow-soft">
              <p className="text-sm text-muted-foreground">Nenhuma restrição cadastrada.</p>
            </div>
          )}
        </section>

        {/* Allergies */}
        <section>
          <h2 className="font-display text-lg mb-3">Alergias</h2>
          {allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {allergies.map((a) => (
                <span
                  key={a}
                  className="px-3 py-2 rounded-2xl bg-destructive/10 text-destructive text-sm font-semibold flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> {a}
                </span>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-4 shadow-soft">
              <p className="text-sm text-muted-foreground">Nenhuma alergia cadastrada.</p>
            </div>
          )}
        </section>

        {/* Quick info cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 shadow-soft">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Cake className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Idade</p>
            <p className="text-lg font-bold">{member.age != null ? `${member.age} anos` : "—"}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-soft">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Papel</p>
            <p className="text-lg font-bold">{member.role}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <Link to="/app/familia">
            <Button variant="outline" className="w-full h-12 rounded-2xl bg-card">
              <Pencil className="w-4 h-4 mr-2" /> Editar na página da família
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/5"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Remover membro
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">Remover {member.display_name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta ação não pode ser desfeita. O membro será removido da família permanentemente.
          </p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-2xl"
              onClick={async () => {
                const { error } = await deleteMember(member.id);
                if (error) {
                  toast.error(error);
                  setDeleteOpen(false);
                } else {
                  toast.success("Membro removido.");
                  navigate("/app/familia");
                }
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

export default MemberProfile;
