/*
# Create scan_history table for storing receipt and label scan results

## Purpose
When a user scans a receipt or food label, the AI analysis result is currently
shown on screen but never persisted. This table stores every scan so the
Dashboard, Nutrition Profile, and Family pages can display real data derived
from actual household purchases instead of hardcoded mock values.

## New Tables
- `scan_history`
  - `id` (uuid, primary key)
  - `family_id` (uuid, references families — which household this scan belongs to)
  - `user_id` (uuid, references auth.users — who performed the scan, defaults to auth.uid())
  - `scan_type` (text: 'receipt' or 'label')
  - `result` (jsonb — full AI-returned analysis object)
  - `score` (integer 0-100 — basket health score for receipts, extracted for quick querying)
  - `store` (text — store name if available from receipt)
  - `total` (numeric — total amount in BRL if available from receipt)
  - `item_count` (integer — number of items in the scan)
  - `healthy_count` (integer — items flagged 'good')
  - `warning_count` (integer — items flagged 'warn')
  - `avoid_count` (integer — items flagged 'bad')
  - `created_at` (timestamptz, defaults to now())

## Security
- RLS enabled on scan_history.
- SELECT: authenticated users can view scans belonging to their own family (verified via profiles table).
- INSERT: authenticated users can insert scans for their own family.
- UPDATE/DELETE: not needed — scans are append-only.

## Indexes
- `idx_scan_history_family_created` — family_id + created_at DESC for dashboard queries.
*/

CREATE TABLE IF NOT EXISTS public.scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_type text NOT NULL CHECK (scan_type IN ('receipt', 'label')),
  result jsonb NOT NULL,
  score integer,
  store text,
  total numeric(10,2),
  item_count integer DEFAULT 0,
  healthy_count integer DEFAULT 0,
  warning_count integer DEFAULT 0,
  avoid_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_family_scans" ON public.scan_history;
CREATE POLICY "select_own_family_scans"
  ON public.scan_history FOR SELECT TO authenticated
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_family_scans" ON public.scan_history;
CREATE POLICY "insert_own_family_scans"
  ON public.scan_history FOR INSERT TO authenticated
  WITH CHECK (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
    AND user_id = auth.uid()
  );

CREATE INDEX IF NOT EXISTS idx_scan_history_family_created
  ON public.scan_history(family_id, created_at DESC);

CREATE TRIGGER trg_scan_history_updated
  BEFORE UPDATE ON public.scan_history
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
