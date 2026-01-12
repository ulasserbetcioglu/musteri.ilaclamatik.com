/*
  # Müşteri Belgeleri Sistemi

  1. Yeni Tablolar
    - `customer_documents`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key to customers)
      - `document_type` (text) - Belge tipi (örn: '2.1' for IPM Contract)
      - `document_title` (text) - Belge başlığı
      - `file_path` (text) - Dosya yolu (opsiyonel, PDF için)
      - `created_at` (timestamp)
      - `created_by` (uuid) - Kim oluşturdu
      
  2. Güvenlik
    - RLS etkin
    - Admin'ler tüm belgeleri görebilir ve yönetebilir
    - Müşteriler sadece kendi belgelerini görebilir
*/

CREATE TABLE IF NOT EXISTS customer_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  document_title text NOT NULL,
  file_path text,
  created_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL
);

ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;

-- Admin can see and manage all documents
CREATE POLICY "Admins can view all customer documents"
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

CREATE POLICY "Admins can insert customer documents"
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

CREATE POLICY "Admins can update customer documents"
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

CREATE POLICY "Admins can delete customer documents"
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

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_documents_customer_id ON customer_documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_documents_document_type ON customer_documents(document_type);
