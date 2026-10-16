/*
# Create gamification tables: family_points and family_achievements

## Purpose
Make the gamification system real and persistent. Instead of hardcoded mock
values, family points and earned achievements are stored in the database and
derived from actual scan history.

## New Tables

### family_points
- `id` (uuid, primary key)
- `family_id` (uuid, references families, cascade delete, unique)
- `total_points` (integer, not null, default 0) — cumulative family points
- `streak_days` (integer, not null, default 0) — consecutive days with activity
- `last_activity_date` (date, nullable) — last day the family earned points
- `updated_at` (timestamptz, default now())

### family_achievements
- `id` (uuid, primary key)
- `family_id` (uuid, references families, cascade delete)
- `achievement_key` (text, not null) — stable identifier e.g. "veg_master"
- `earned_at` (timestamptz, default now())
- Unique constraint on (family_id, achievement_key) to prevent duplicates

## Security (RLS)
- Enable RLS on both tables.
- Family membership checked via profiles.family_id.
- Four policies per table: SELECT, INSERT, UPDATE, DELETE — all TO authenticated.

## Notes
1. Points are earned per scan: healthy items add points, avoid items subtract.
2. Streak is calculated from consecutive days with at least one scan.
3. Achievements are unlocked based on real scan milestones (e.g. 10 scans,
   30-day streak, 70%+ healthy ratio).
4. Challenge progress shown in the UI is derived from actual scan data, not
   stored separately — this avoids stale data and keeps gamification honest.
*/

CREATE TABLE IF NOT EXISTS family_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL UNIQUE REFERENCES families(id) ON DELETE CASCADE,
  total_points integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  last_activity_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE family_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_family_points" ON family_points;
CREATE POLICY "select_own_family_points"
ON family_points FOR SELECT
TO authenticated
USING (family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_family_points" ON family_points;
CREATE POLICY "insert_own_family_points"
ON family_points FOR INSERT
TO authenticated
WITH CHECK (family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid()));

DROP POLICY IF EXISTS "update_own_family_points" ON family_points;
CREATE POLICY "update_own_family_points"
ON family_points FOR UPDATE
TO authenticated
USING (family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid()))
WITH CHECK (family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_family_points" ON family_points;
CREATE POLICY "delete_own_family_points"
ON family_points FOR DELETE
TO authenticated
USING (family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid()));


CREATE TABLE IF NOT EXISTS family_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  achievement_key text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (family_id, achievement_key)
);

ALTER TABLE family_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_family_achievements" ON family_achievements;
CREATE POLICY "select_own_family_achievements"
ON family_achievements FOR SELECT
TO authenticated
USING (family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_family_achievements" ON family_achievements;
CREATE POLICY "insert_own_family_achievements"
ON family_achievements FOR INSERT
TO authenticated
WITH CHECK (family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid()));

DROP POLICY IF EXISTS "update_own_family_achievements" ON family_achievements;
CREATE POLICY "update_own_family_achievements"
ON family_achievements FOR UPDATE
TO authenticated
USING (family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid()))
WITH CHECK (family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_family_achievements" ON family_achievements;
CREATE POLICY "delete_own_family_achievements"
ON family_achievements FOR DELETE
TO authenticated
USING (family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_family_achievements_family_id ON family_achievements(family_id);
