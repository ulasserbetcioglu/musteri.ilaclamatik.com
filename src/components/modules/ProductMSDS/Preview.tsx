import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BRAND_GREEN, BRAND_LIGHT_GREEN, LOGO_URL } from '../../../constants';
import type { DocumentSettings } from '../../../types';
import { A4Header } from '../../common/A4Header';

interface Product {
  id: string;
  urunAdi: string;
  aktifMadde: string;
  ruhsatNo: string;
  hedefHasere: string;
  antidot: string;
}

interface ProductMSDSPreviewProps {
  settings: DocumentSettings;
  customerName: string;
}

export function ProductMSDSPreview({ settings, customerName }: ProductMSDSPreviewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'pesticide')
      .order('name');

    if (!error && data) {
      const mappedProducts: Product[] = data.map((p: any) => ({
        id: p.id,
        urunAdi: p.name || '',
        aktifMadde: p.active_ingredient || '',
        ruhsatNo: p.registration_number || '',
        hedefHasere: p.target_pests || '',
        antidot: p.antidote || ''
      }));
      setProducts(mappedProducts);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: BRAND_GREEN }}></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[15mm] text-black box-border flex flex-col relative"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <A4Header title="ONAYLI BİYOSİDAL ÜRÜN LİSTESİ" settings={settings} />

      <div className="flex-grow">
        <div className="mb-4 text-sm font-bold uppercase border-b border-gray-400 pb-1">
          Firma: {customerName}
        </div>

        <div className="mb-4 p-2 bg-gray-50 border text-xs italic">
          Bu liste, işletmede haşere mücadelesi kapsamında kullanılması planlanan ve T.C. Sağlık Bakanlığı
          tarafından ruhsatlandırılmış biyosidal ürünleri içerir.
        </div>

        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
              <th className="border border-black p-2 w-10 text-center">S.NO</th>
              <th className="border border-black p-2 text-left">ÜRÜN TİCARİ ADI</th>
              <th className="border border-black p-2 text-left">AKTİF MADDESİ</th>
              <th className="border border-black p-2 text-left">RUHSAT NO</th>
              <th className="border border-black p-2 text-left">HEDEF HAŞERE</th>
              <th className="border border-black p-2 text-left">ANTİDOTU</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id}>
                <td className="border border-black p-2 text-center font-bold">{index + 1}</td>
                <td className="border border-black p-2 font-semibold">{product.urunAdi}</td>
                <td className="border border-black p-2">{product.aktifMadde}</td>
                <td className="border border-black p-2 font-mono">{product.ruhsatNo}</td>
                <td className="border border-black p-2">{product.hedefHasere}</td>
                <td className="border border-black p-2">{product.antidot}</td>
              </tr>
            ))}
            {[...Array(Math.max(0, 15 - products.length))].map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-black p-4 text-center text-gray-300">
                  {products.length + i + 1}
                </td>
                <td className="border border-black p-4"></td>
                <td className="border border-black p-4"></td>
                <td className="border border-black p-4"></td>
                <td className="border border-black p-4"></td>
                <td className="border border-black p-4"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 text-xs text-gray-600">
          * Listede belirtilen ürünlerin Malzeme Güvenlik Bilgi Formları (MSDS) ve Etiket örnekleri dosya ekinde
          mevcuttur.
        </div>
      </div>

      <div className="border-t-2 border-black pt-2 text-center text-xs text-gray-500 mt-auto">
        Bu form, MENTOR Çevre Sağlığı Hizmetleri kalite yönetim sisteminin bir parçasıdır. İzinsiz çoğaltılamaz.
      </div>
    </div>
  );
}
