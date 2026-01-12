/*
  # Allow Local Auth Users to Access Visits
  
  ## Problem
  
  The system uses two authentication methods:
  1. Supabase Auth (for admin/operators) - uses auth_id
  2. Local Auth (for customers/branches) - does NOT use auth_id (auth_id is NULL)
  
  The RLS policies created earlier check `auth_id = auth.uid()`, but for local auth users:
  - auth_id is NULL (they don't use Supabase auth)
  - auth.uid() is NULL (they're not logged into Supabase)
  - NULL = NULL returns FALSE in PostgreSQL
  
  This breaks access for all local auth users!
  
  ## Solution
  
  Since local authentication is used for customers/branches, we need to allow PUBLIC
  access to visits for these users. The authentication is handled at the application
  level, not at the database level.
  
  ## Changes
  
  1. Drop the restrictive RLS policies for customers and branches
  2. Add permissive policies that allow public read access
  3. Keep admin/operator policies intact
*/

-- Drop the restrictive policies that don't work with local auth
DROP POLICY IF EXISTS "Customers can view their own visits" ON visits;
DROP POLICY IF EXISTS "Branches can view their own visits" ON visits;

-- Allow public read access for local auth users (customers/branches)
CREATE POLICY "Allow public read access to visits"
  ON visits
  FOR SELECT
  TO public
  USING (true);
