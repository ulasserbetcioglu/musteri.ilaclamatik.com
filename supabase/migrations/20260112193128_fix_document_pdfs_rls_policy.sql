/*
  # Fix Document PDFs RLS Policy

  1. Changes
    - Drop existing admin policies that check user_type
    - Create new policies that check role field instead
    
  2. Security
    - Policies now correctly check raw_user_meta_data->>'role' = 'admin'
    - All authenticated users can still view PDFs
*/

-- Drop old policies
DROP POLICY IF EXISTS "Admin can insert PDFs" ON document_pdfs;
DROP POLICY IF EXISTS "Admin can update PDFs" ON document_pdfs;
DROP POLICY IF EXISTS "Admin can delete PDFs" ON document_pdfs;

-- Create new policies with correct field name
CREATE POLICY "Admin can insert PDFs"
  ON document_pdfs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin can update PDFs"
  ON document_pdfs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin can delete PDFs"
  ON document_pdfs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
