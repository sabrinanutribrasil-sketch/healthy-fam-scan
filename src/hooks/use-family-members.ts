import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type FamilyMember = {
  id: string;
  family_id: string;
  display_name: string;
  age: number | null;
  role: string;
  avatar_emoji: string;
  dietary_restrictions: string[];
  allergies: string[];
  nutrition_goals: string | null;
  created_at: string;
};

type NewMember = {
  display_name: string;
  age: number | null;
  role: string;
  avatar_emoji: string;
  dietary_restrictions: string[];
  allergies: string[];
  nutrition_goals: string | null;
};

export function useFamilyMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    if (!user) {
      setMembers([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data: profile, error: pErr } = await supabase
          .from("profiles")
          .select("family_id")
          .eq("id", user.id)
          .maybeSingle();

        if (pErr) throw pErr;
        if (!profile?.family_id) {
          if (active) { setMembers([]); setFamilyId(null); setLoading(false); return; }
        }

        const fid = profile!.family_id;
        if (active) setFamilyId(fid);

        const { data, error: mErr } = await supabase
          .from("family_members")
          .select("id, family_id, display_name, age, role, avatar_emoji, dietary_restrictions, allergies, nutrition_goals, created_at")
          .eq("family_id", fid)
          .order("created_at", { ascending: true });

        if (mErr) throw mErr;
        if (active) setMembers((data as FamilyMember[]) ?? []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar membros");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [user, refreshKey]);

  const addMember = useCallback(async (member: NewMember): Promise<{ error: string | null }> => {
    if (!familyId) return { error: "Nenhuma família vinculada." };
    const { error: insertErr } = await supabase
      .from("family_members")
      .insert({ ...member, family_id: familyId });
    if (insertErr) return { error: "Não foi possível adicionar o membro." };
    refresh();
    return { error: null };
  }, [familyId, refresh]);

  const updateMember = useCallback(async (id: string, updates: Partial<NewMember>): Promise<{ error: string | null }> => {
    const { error: updErr } = await supabase
      .from("family_members")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (updErr) return { error: "Não foi possível salvar as alterações." };
    refresh();
    return { error: null };
  }, [refresh]);

  const deleteMember = useCallback(async (id: string): Promise<{ error: string | null }> => {
    const { error: delErr } = await supabase
      .from("family_members")
      .delete()
      .eq("id", id);
    if (delErr) return { error: "Não foi possível remover o membro." };
    refresh();
    return { error: null };
  }, [refresh]);

  return {
    members,
    familyId,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
    refresh,
  };
}
