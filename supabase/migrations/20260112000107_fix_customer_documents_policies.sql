/*
  # RLS Policy Düzeltmesi - customer_documents

  1. Değişiklikler
    - Mevcut admin policy'leri daha esnek hale getiriliyor
    - @ilaclamatik.com uzantılı tüm kullanıcılara admin yetkisi veriliyor
    - Bu sayede admin@ilaclamatik.com, admin1@ilaclamatik.com vs. tüm admin hesapları çalışabilir
    
  2. Güvenlik
    - Sadece @ilaclamatik.com uzantılı authenticated kullanıcılar belge yönetimi yapabilir
    - Diğer kullanıcılar kendi belgelerini görebilir (ileride eklenecek)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all documents" ON customer_documents;
DROP POLICY IF EXISTS "Admins can insert documents" ON customer_documents;
DROP POLICY IF EXISTS "Admins can update documents" ON customer_documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON customer_documents;

-- Recreate policies with flexible admin check
CREATE POLICY "Admins can view all documents"
  ON customer_documents
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt()->>'email' LIKE '%@ilaclamatik.com'
  );

CREATE POLICY "Admins can insert documents"
  ON customer_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'email' LIKE '%@ilaclamatik.com'
  );

CREATE POLICY "Admins can update documents"
  ON customer_documents
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt()->>'email' LIKE '%@ilaclamatik.com'
  )
  WITH CHECK (
    auth.jwt()->>'email' LIKE '%@ilaclamatik.com'
  );

CREATE POLICY "Admins can delete documents"
  ON customer_documents
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt()->>'email' LIKE '%@ilaclamatik.com'
  );
