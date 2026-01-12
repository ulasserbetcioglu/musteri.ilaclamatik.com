/*
  # Müşteri ve Şube Belge Görüntüleme Policy'leri

  1. Yeni Policy'ler
    - Müşteriler kendi belgelerini görebilir
      - customer_documents.customer_id eşleşmesi kontrol edilir
      - customers.auth_id ile auth.uid() eşleşmesi kontrol edilir
    
    - Şubeler kendi belgelerini görebilir
      - customer_documents.branch_id eşleşmesi kontrol edilir
      - branches.auth_id ile auth.uid() eşleşmesi kontrol edilir
    
  2. Güvenlik
    - Her kullanıcı sadece kendine atanan belgeleri görebilir
    - Admin kullanıcılar tüm belgeleri görebilir (mevcut policy korunuyor)
*/

-- Müşterilerin kendi belgelerini görmesi için policy
CREATE POLICY "Customers can view their own documents"
  ON customer_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = customer_documents.customer_id
      AND customers.auth_id = auth.uid()
    )
  );

-- Şubelerin kendi belgelerini görmesi için policy
CREATE POLICY "Branches can view their own documents"
  ON customer_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM branches
      WHERE branches.id = customer_documents.branch_id
      AND branches.auth_id = auth.uid()
    )
  );
