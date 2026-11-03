/*
# Create support_requests table

## Purpose
Stores requests submitted through the public contact/deletion forms.
Used by the /exclusao-de-conta page (account deletion requests) and the
/uso-de-dados page (general support and data privacy requests).

## New Tables
- `support_requests`
  - `id` (uuid, primary key)
  - `email` (text, not null) — email of the requester
  - `name` (text, nullable) — optional name
  - `request_type` (text, not null) — one of: 'account_deletion', 'data_request', 'general_support'
  - `subject` (text, nullable) — optional subject line
  - `message` (text, not null) — the request body
  - `status` (text, not null, default 'pending') — 'pending', 'processing', 'completed', 'rejected'
  - `created_at` (timestamptz, default now())
  - `processed_at` (timestamptz, nullable)

## Security
- RLS enabled on `support_requests`.
- INSERT granted to `anon, authenticated` so the public form (no login) can submit.
- SELECT, UPDATE, DELETE granted only to `service_role` (admin/Sabrina processes requests).
- INSERT policy allows anyone to create a request (public form).
- No SELECT/UPDATE/DELETE policies for anon or authenticated — only service_role can read/process.
*/

CREATE TABLE IF NOT EXISTS support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  request_type text NOT NULL DEFAULT 'general_support',
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON support_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON support_requests TO service_role;

DROP POLICY IF EXISTS "anon_can_insert_support_request" ON support_requests;
CREATE POLICY "anon_can_insert_support_request"
ON support_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_support_requests" ON support_requests;
CREATE POLICY "service_role_all_support_requests"
ON support_requests FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
