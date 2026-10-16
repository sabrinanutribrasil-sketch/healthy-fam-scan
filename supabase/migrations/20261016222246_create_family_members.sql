/*
# Create family_members table

## Purpose
Stores real family members with dietary restrictions, nutrition goals, and age.
This is separate from `profiles` (which represents authenticated user accounts)
because family members like children may not have their own login.

## New Table: family_members
- `id` (uuid, primary key)
- `family_id` (uuid, references families, cascade delete)
- `display_name` (text, not null) — member's name
- `age` (integer, nullable) — member's age
- `role` (text, not null, default 'membro') — e.g. "Mãe", "Pai", "Filha", "Avó"
- `avatar_emoji` (text, not null, default '👤') — emoji used as avatar
- `dietary_restrictions` (text[], default '{}') — e.g. {"sem glúten", "lactose"}
- `allergies` (text[], default '{}') — e.g. {"amendoim", "frutos do mar"}
- `nutrition_goals` (text, nullable) — free-text goal like "Energia & menopausa"
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## Security (RLS)
- Enable RLS.
- Family membership is checked via profiles.family_id: an authenticated user
  can only read/write family_members rows whose family_id matches their own
  profile's family_id.
- Four policies: SELECT, INSERT, UPDATE, DELETE — all TO authenticated.

## Notes
1. Only authenticated users who belong to a family can manage its members.
2. The family_id is taken from the user's profile, so all operations are
   automatically scoped to the correct family.
3. DELETE cascade on family_id means removing a family also removes its members.
*/

CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  age integer,
  role text NOT NULL DEFAULT 'membro',
  avatar_emoji text NOT NULL DEFAULT '👤',
  dietary_restrictions text[] NOT NULL DEFAULT '{}',
  allergies text[] NOT NULL DEFAULT '{}',
  nutrition_goals text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_family_members" ON family_members;
CREATE POLICY "select_own_family_members"
ON family_members FOR SELECT
TO authenticated
USING (
  family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid())
);

DROP POLICY IF EXISTS "insert_own_family_members" ON family_members;
CREATE POLICY "insert_own_family_members"
ON family_members FOR INSERT
TO authenticated
WITH CHECK (
  family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid())
);

DROP POLICY IF EXISTS "update_own_family_members" ON family_members;
CREATE POLICY "update_own_family_members"
ON family_members FOR UPDATE
TO authenticated
USING (
  family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid())
)
WITH CHECK (
  family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid())
);

DROP POLICY IF EXISTS "delete_own_family_members" ON family_members;
CREATE POLICY "delete_own_family_members"
ON family_members FOR DELETE
TO authenticated
USING (
  family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
