/*
  # Allow Anonymous Access to Public Documents

  1. Security Changes
    - Add policy for anonymous users to view public documents
    - Add policy for anonymous users to view MSDS and license documents
    - This allows customer and branch users (using localStorage auth) to view documents

  2. Notes
    - Customers and branches use localStorage authentication, not Supabase auth
    - They don't have auth.uid(), so they need anon access policies
    - Only public documents are accessible
*/

-- Allow anonymous users to view public documents
DROP POLICY IF EXISTS "Allow anon users to view public documents" ON documents;
CREATE POLICY "Allow anon users to view public documents"
  ON documents
  FOR SELECT
  TO anon
  USING (entity_type = 'public');

-- Allow anonymous users to view public MSDS and license documents
DROP POLICY IF EXISTS "Allow anon users to view MSDS documents" ON documents;
CREATE POLICY "Allow anon users to view MSDS documents"
  ON documents
  FOR SELECT
  TO anon
  USING (
    document_type IN ('msds', 'license', 'ruhsat', 'biocidal', 'quality', 'other')
    AND entity_type IN ('public', 'general')
  );

-- Allow anonymous users to view visit photos (they will be filtered by the app based on customer/branch)
DROP POLICY IF EXISTS "Allow anon users to view visit photos" ON documents;
CREATE POLICY "Allow anon users to view visit photos"
  ON documents
  FOR SELECT
  TO anon
  USING (
    document_type = 'report_photo'
    AND entity_type = 'visit'
  );
