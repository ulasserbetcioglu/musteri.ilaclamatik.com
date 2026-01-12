/*
  # Şubeler İçin Belge Desteği

  1. Değişiklikler
    - customer_documents tablosuna branch_id alanı eklendi
    - customer_id artık opsiyonel (NULL olabilir)
    - branch_id de opsiyonel (NULL olabilir)
    - En az birinin dolu olması gerekiyor
    
  2. Güvenlik
    - Şubeler kendi belgelerini görebilir
    - Müşteriler kendi belgelerini görebilir
*/

-- Add branch_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customer_documents' AND column_name = 'branch_id'
  ) THEN
    ALTER TABLE customer_documents ADD COLUMN branch_id uuid REFERENCES branches(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Make customer_id nullable
ALTER TABLE customer_documents ALTER COLUMN customer_id DROP NOT NULL;

-- Add check constraint to ensure at least one is filled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'customer_or_branch_required'
  ) THEN
    ALTER TABLE customer_documents
    ADD CONSTRAINT customer_or_branch_required
    CHECK (customer_id IS NOT NULL OR branch_id IS NOT NULL);
  END IF;
END $$;

-- Create index for branch_id
CREATE INDEX IF NOT EXISTS idx_customer_documents_branch_id ON customer_documents(branch_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all customer documents" ON customer_documents;
DROP POLICY IF EXISTS "Admins can insert customer documents" ON customer_documents;
DROP POLICY IF EXISTS "Admins can update customer documents" ON customer_documents;
DROP POLICY IF EXISTS "Admins can delete customer documents" ON customer_documents;

-- Recreate policies with branch support
CREATE POLICY "Admins can view all documents"
  ON customer_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@ilaclamatik.com'
    )
  );

CREATE POLICY "Admins can insert documents"
  ON customer_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@ilaclamatik.com'
    )
  );

CREATE POLICY "Admins can update documents"
  ON customer_documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@ilaclamatik.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@ilaclamatik.com'
    )
  );

CREATE POLICY "Admins can delete documents"
  ON customer_documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@ilaclamatik.com'
    )
  );
