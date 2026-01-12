import { useState, useEffect } from 'react';
import { Beaker, Plus, Trash2, FileText } from 'lucide-react';
import { BRAND_GREEN } from '../../../constants';
import { supabase } from '../../../lib/supabase';
import type { DocumentSettings } from '../../../types';

interface Product {
  id: string;
  urunAdi: string;
  aktifMadde: string;
  ruhsatNo: string;
  hedefHasere: string;
  antidot: string;
}

interface ProductMSDSEditorProps {
  settings: DocumentSettings;
  onSettingsChange: (updates: Partial<DocumentSettings>) => void;
  customerId?: string;
}

export function ProductMSDSEditor({ settings, onSettingsChange, customerId }: ProductMSDSEditorProps) {
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

  const addProduct = () => {
    setProducts([
      ...products,
      {
        id: `temp-${Date.now()}`,
        urunAdi: 'Yeni Ürün',
        aktifMadde: '',
        ruhsatNo: '',
        hedefHasere: '',
        antidot: ''
      }
    ]);
  };

  const updateProduct = (id: string, field: keyof Product, value: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeProduct = (id: string) => {
    if (window.confirm('Bu ürünü listeden çıkarmak istediğinize emin misiniz?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onSettingsChange({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-3 rounded border border-green-200 text-sm text-green-800 mb-4">
        Ürün listesi veritabanındaki "pesticide" kategorisindeki ürünlerden otomatik çekilmiştir. Gerekirse manuel ekleme yapabilirsiniz.
      </div>

      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: BRAND_GREEN }}>
          <Beaker size={16} /> Onaylı Ürün Listesi
        </h2>
        <button
          onClick={addProduct}
          className="bg-green-600 text-white p-1.5 rounded hover:bg-green-700 transition"
        >
          <Plus size={16} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-sm text-gray-500">Ürünler yükleniyor...</div>
      ) : (
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={product.id} className="p-3 bg-white border rounded shadow-sm relative group">
              <div className="absolute top-2 right-2 flex gap-2">
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded font-mono">
                  #{index + 1}
                </span>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="space-y-2 mt-2">
                <input
                  type="text"
                  placeholder="Ürün Ticari Adı (Örn: K-Othrine)"
                  value={product.urunAdi}
                  onChange={(e) => updateProduct(product.id, 'urunAdi', e.target.value)}
                  className="w-full p-2 border rounded text-sm font-semibold outline-none focus:border-green-600"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 pl-1">Aktif Madde</label>
                    <input
                      type="text"
                      placeholder="Örn: Deltamethrin %5"
                      value={product.aktifMadde}
                      onChange={(e) => updateProduct(product.id, 'aktifMadde', e.target.value)}
                      className="w-full p-2 border rounded text-xs outline-none focus:border-green-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 pl-1">Ruhsat No / Tarih</label>
                    <input
                      type="text"
                      placeholder="Örn: 2011/123"
                      value={product.ruhsatNo}
                      onChange={(e) => updateProduct(product.id, 'ruhsatNo', e.target.value)}
                      className="w-full p-2 border rounded text-xs outline-none focus:border-green-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 pl-1">Hedef Haşere</label>
                    <input
                      type="text"
                      placeholder="Örn: Yürüyen Haşere"
                      value={product.hedefHasere}
                      onChange={(e) => updateProduct(product.id, 'hedefHasere', e.target.value)}
                      className="w-full p-2 border rounded text-xs outline-none focus:border-green-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 pl-1">Antidotu</label>
                    <input
                      type="text"
                      placeholder="Örn: Semptomatik"
                      value={product.antidot}
                      onChange={(e) => updateProduct(product.id, 'antidot', e.target.value)}
                      className="w-full p-2 border rounded text-xs outline-none focus:border-green-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 border-t pt-4" style={{ color: BRAND_GREEN }}>
          <FileText size={16} /> Doküman Ayarları
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            name="dokumanNo"
            value={settings.dokumanNo}
            onChange={handleSettingsChange}
            className="p-2 border rounded text-sm"
            placeholder="No"
          />
          <input
            type="text"
            name="yayinTarihi"
            value={settings.yayinTarihi}
            onChange={handleSettingsChange}
            className="p-2 border rounded text-sm"
            placeholder="Tarih"
          />
          <input
            type="text"
            name="revizyonNo"
            value={settings.revizyonNo}
            onChange={handleSettingsChange}
            className="p-2 border rounded text-sm"
            placeholder="Rev"
          />
        </div>
      </section>
    </div>
  );
}
