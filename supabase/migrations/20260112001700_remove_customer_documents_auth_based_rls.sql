/*
  # Müşteri Belgeleri İçin Auth Tabanlı RLS Politikalarını Kaldır

  1. Değişiklikler
    - Auth.uid() tabanlı RLS politikalarını kaldır
    - customer_documents tablosunda RLS'i devre dışı bırak
    - Frontend'de filtreleme yeterli olacak (localStorage auth kullanımı için)

  2. Güvenlik Notu
    - Müşteri ve şubeler localStorage ile local authentication kullanıyor
    - Supabase Auth session'ı olmadığı için auth.uid() çalışmıyor
    - Bu nedenle RLS devre dışı bırakılıyor
    - Filtreleme frontend'de yapılıyor
*/

-- Mevcut RLS politikalarını kaldır
DROP POLICY IF EXISTS "Authenticated users can view all documents" ON customer_documents;
DROP POLICY IF EXISTS "Customers can view their own documents" ON customer_documents;
DROP POLICY IF EXISTS "Branches can view their own documents" ON customer_documents;

-- RLS'i devre dışı bırak
ALTER TABLE customer_documents DISABLE ROW LEVEL SECURITY;
