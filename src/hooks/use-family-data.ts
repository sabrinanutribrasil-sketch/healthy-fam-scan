import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type FamilyMember = {
  id: string;
  display_name: string;
  role: string;
  avatar_emoji: string;
};

export type ScanRecord = {
  id: string;
  scan_type: string;
  score: number | null;
  store: string | null;
  total: number | null;
  item_count: number;
  healthy_count: number;
  warning_count: number;
  avoid_count: number;
  created_at: string;
  result: unknown;
};

export type FamilyData = {
  family: { id: string; name: string; join_code: string } | null;
  members: FamilyMember[];
  scans: ScanRecord[];
  latestScore: number;
  totalScans: number;
  avgScore: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useFamilyData(): FamilyData {
  const { user } = useAuth();
  const [family, setFamily] = useState<{ id: string; name: string; join_code: string } | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    if (!user) {
      setFamily(null);
      setMembers([]);
      setScans([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("family_id")
          .eq("id", user.id)
          .maybeSingle();

        if (profileErr) throw profileErr;
        if (!profile?.family_id) {
          if (active) { setLoading(false); return; }
        }

        const familyId = profile?.family_id;

        const [famRes, membersRes, scansRes] = await Promise.all([
          familyId
            ? supabase.from("families").select("id, name, join_code").eq("id", familyId).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          familyId
            ? supabase.from("profiles").select("id, display_name, role, avatar_emoji").eq("family_id", familyId).order("created_at")
            : Promise.resolve({ data: [], error: null }),
          familyId
            ? supabase.from("scan_history")
                .select("id, scan_type, score, store, total, item_count, healthy_count, warning_count, avoid_count, created_at, result")
                .eq("family_id", familyId)
                .order("created_at", { ascending: false })
                .limit(100)
            : Promise.resolve({ data: [], error: null }),
        ]);

        if (famRes.error) throw famRes.error;
        if (membersRes.error) throw membersRes.error;
        if (scansRes.error) throw scansRes.error;

        if (!active) return;

        setFamily(famRes.data as { id: string; name: string; join_code: string } | null);
        setMembers((membersRes.data as FamilyMember[]) ?? []);
        setScans((scansRes.data as ScanRecord[]) ?? []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [user, refreshKey]);

  const receiptScans = scans.filter(s => s.scan_type === "receipt");
  const latestScore = receiptScans[0]?.score ?? 0;
  const totalScans = scans.length;
  const scoredScans = receiptScans.filter(s => s.score != null);
  const avgScore = scoredScans.length > 0
    ? Math.round(scoredScans.reduce((sum, s) => sum + (s.score ?? 0), 0) / scoredScans.length)
    : 0;

  return {
    family,
    members,
    scans,
    latestScore,
    totalScans,
    avgScore,
    loading,
    error,
    refresh,
  };
}
