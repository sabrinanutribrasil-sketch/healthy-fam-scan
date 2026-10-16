import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useFamilyData, type ScanRecord } from "@/hooks/use-family-data";

export type Challenge = {
  id: string;
  title: string;
  emoji: string;
  points: number;
  progress: number;
  current: number;
  target: number;
};

export type Achievement = {
  key: string;
  emoji: string;
  title: string;
  desc: string;
  earned: boolean;
};

const ALL_ACHIEVEMENTS: Omit<Achievement, "earned">[] = [
  { key: "first_scan", emoji: "📸", title: "Primeiro passo", desc: "1º escaneamento" },
  { key: "ten_scans", emoji: "🔍", title: "Explorador", desc: "10 escaneamentos" },
  { key: "veg_master", emoji: "🥗", title: "Mestre dos vegetais", desc: "Score 80+" },
  { key: "streak_7", emoji: "🔥", title: "Pegando fogo", desc: "7 dias seguidos" },
  { key: "streak_30", emoji: "💪", title: "Constância", desc: "30 dias seguidos" },
  { key: "healthy_50", emoji: "🌱", title: "Eco hero", desc: "50 itens saudáveis" },
  { key: "zero_process", emoji: "🍎", title: "Zero processados", desc: "Scan sem evitar" },
  { key: "score_90", emoji: "🏆", title: "Top nutricional", desc: "Score 90+" },
  { key: "fifty_scans", emoji: "👨‍🍳", title: "Chef da casa", desc: "50 escaneamentos" },
];

function computePoints(scans: ScanRecord[]): number {
  let pts = 0;
  for (const s of scans) {
    if (s.scan_type !== "receipt") continue;
    pts += s.healthy_count * 10;
    pts += s.warning_count * 5;
    pts -= s.avoid_count * 3;
    if (s.score != null && s.score >= 80) pts += 50;
    if (s.score != null && s.score >= 90) pts += 50;
  }
  return Math.max(0, pts);
}

function computeStreak(scans: ScanRecord[]): number {
  const receiptScans = scans.filter(s => s.scan_type === "receipt");
  if (receiptScans.length === 0) return 0;

  const days = new Set<string>();
  for (const s of receiptScans) {
    const d = new Date(s.created_at);
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (days.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function computeChallenges(scans: ScanRecord[]): Challenge[] {
  const receiptScans = scans.filter(s => s.scan_type === "receipt");
  const totalHealthy = receiptScans.reduce((sum, s) => sum + s.healthy_count, 0);
  const totalAvoid = receiptScans.reduce((sum, s) => sum + s.avoid_count, 0);
  const totalItems = receiptScans.reduce((sum, s) => sum + s.item_count, 0);
  const streak = computeStreak(scans);
  const scoredScans = receiptScans.filter(s => s.score != null);
  const avgScore = scoredScans.length > 0
    ? Math.round(scoredScans.reduce((sum, s) => sum + (s.score ?? 0), 0) / scoredScans.length)
    : 0;

  return [
    { id: "ultraprocess", title: "Reduzir ultraprocessados", emoji: "🥗", points: 150, progress: totalItems > 0 ? Math.round((1 - totalAvoid / Math.max(totalItems, 1)) * 100) : 0, current: totalItems - totalAvoid, target: totalItems },
    { id: "fruits", title: "Itens saudáveis no carrinho", emoji: "🍎", points: 100, progress: Math.min(100, Math.round((totalHealthy / 50) * 100)), current: totalHealthy, target: 50 },
    { id: "water", title: "Dias ativos na semana", emoji: "💧", points: 80, progress: Math.min(100, Math.round((streak / 7) * 100)), current: Math.min(streak, 7), target: 7 },
    { id: "score", title: "Melhorar score nutricional", emoji: "📊", points: 200, progress: Math.min(100, Math.round((avgScore / 90) * 100)), current: avgScore, target: 90 },
  ];
}

function computeEarnedAchievements(scans: ScanRecord[], points: number, streak: number): Set<string> {
  const earned = new Set<string>();
  const receiptScans = scans.filter(s => s.scan_type === "receipt");
  const totalHealthy = receiptScans.reduce((sum, s) => sum + s.healthy_count, 0);
  const scoredScans = receiptScans.filter(s => s.score != null);
  const bestScore = scoredScans.length > 0 ? Math.max(...scoredScans.map(s => s.score ?? 0)) : 0;
  const hasZeroAvoid = receiptScans.some(s => s.avoid_count === 0 && s.item_count > 0);

  if (receiptScans.length >= 1) earned.add("first_scan");
  if (receiptScans.length >= 10) earned.add("ten_scans");
  if (receiptScans.length >= 50) earned.add("fifty_scans");
  if (bestScore >= 80) earned.add("veg_master");
  if (bestScore >= 90) earned.add("score_90");
  if (streak >= 7) earned.add("streak_7");
  if (streak >= 30) earned.add("streak_30");
  if (totalHealthy >= 50) earned.add("healthy_50");
  if (hasZeroAvoid) earned.add("zero_process");

  return earned;
}

export function useGamification() {
  const { user } = useAuth();
  const { scans, family, loading: famLoading } = useFamilyData();
  const [dbPoints, setDbPoints] = useState<number | null>(null);
  const [earnedKeys, setEarnedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const computedPoints = computePoints(scans);
  const streak = computeStreak(scans);
  const challenges = computeChallenges(scans);
  const earnedSet = computeEarnedAchievements(scans, computedPoints, streak);

  const achievements: Achievement[] = ALL_ACHIEVEMENTS.map(a => ({
    ...a,
    earned: earnedSet.has(a.key),
  }));

  const refresh = useCallback(() => setDbPoints(null), []);

  // Sync computed points and achievements to DB
  useEffect(() => {
    if (!user || !family?.id || famLoading) return;

    let active = true;
    (async () => {
      try {
        // Upsert family_points
        const { error: ptsError } = await supabase
          .from("family_points")
          .upsert({
            family_id: family.id,
            total_points: computedPoints,
            streak_days: streak,
            last_activity_date: scans.length > 0
              ? new Date(scans[0].created_at).toISOString().split("T")[0]
              : null,
            updated_at: new Date().toISOString(),
          }, { onConflict: "family_id" });

        if (ptsError) console.warn("Failed to sync points:", ptsError.message);
        if (active) setDbPoints(computedPoints);

        // Sync achievements — insert any newly earned ones
        const earnedArr = [...earnedSet];
        if (earnedArr.length > 0) {
          // Fetch existing to avoid duplicates
          const { data: existing } = await supabase
            .from("family_achievements")
            .select("achievement_key")
            .eq("family_id", family.id);

          const existingKeys = new Set((existing ?? []).map(a => a.achievement_key));
          const newOnes = earnedArr.filter(k => !existingKeys.has(k));

          if (newOnes.length > 0) {
            await supabase.from("family_achievements").insert(
              newOnes.map(key => ({ family_id: family.id, achievement_key: key }))
            );
          }
          if (active) setEarnedKeys(earnedArr);
        } else {
          if (active) setEarnedKeys([]);
        }

        if (active) setLoading(false);
      } catch {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [user, family?.id, computedPoints, streak, scans, famLoading]);

  return {
    points: dbPoints ?? computedPoints,
    streak,
    challenges,
    achievements,
    earnedAchievementKeys: earnedKeys,
    loading: loading || famLoading,
    refresh,
  };
}
