/*
  # Create Document PDFs Table

  ## 1. New Tables

  ### `document_pdfs` table
    - `id` (uuid, primary key)
    - `document_type` (text, document type like '3.1', '3.2', '3.3')
    - `document_title` (text, document title)
    - `file_name` (text, PDF file name)
    - `file_url` (text, PDF file URL or path)
    - `uploaded_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## 2. Security
    - Enable RLS on document_pdfs table
    - Add policies for authenticated admin users to manage PDFs
    - Add policies for all authenticated users to view PDFs
*/

-- Create document_pdfs table
CREATE TABLE IF NOT EXISTS document_pdfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type text NOT NULL DEFAULT '',
  document_title text NOT NULL DEFAULT '',
  file_name text NOT NULL DEFAULT '',
  file_url text NOT NULL DEFAULT '',
  uploaded_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE document_pdfs ENABLE ROW LEVEL SECURITY;

-- Policies for viewing PDFs (all authenticated users)
CREATE POLICY "All authenticated users can view PDFs"
  ON document_pdfs FOR SELECT
  TO authenticated
  USING (true);

-- Policies for managing PDFs (admin only)
CREATE POLICY "Admin can insert PDFs"
  ON document_pdfs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' = 'admin'
    )
  );

CREATE POLICY "Admin can update PDFs"
  ON document_pdfs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' = 'admin'
    )
  );

CREATE POLICY "Admin can delete PDFs"
  ON document_pdfs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'user_type' = 'admin'
    )
  );