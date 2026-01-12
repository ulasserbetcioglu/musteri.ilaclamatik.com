import { useState, useEffect } from 'react';
import { Award, Settings, Building2, Plus, Trash2, Save } from 'lucide-react';
import { BRAND_GREEN } from '../../../constants';
import { supabase } from '../../../lib/supabase';
import type { DocumentSettings, Customer, Permit } from '../../../types';

interface PermitsEditorProps {
  customers: Customer[];
  selectedCustomerId: string;
  onCustomerSelect: (customerId: string) => void;
  settings: DocumentSettings;
  onSettingsChange: (updates: Partial<DocumentSettings>) => void;
  loading: boolean;
}

export function PermitsEditor({
  customers,
  selectedCustomerId,
  onCustomerSelect,
  settings,
  onSettingsChange,
  loading
}: PermitsEditorProps) {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingPermits, setLoadingPermits] = useState(false);

  useEffect(() => {
    if (selectedCustomerId) {
      loadPermits();
    } else {
      setPermits([]);
    }
  }, [selectedCustomerId]);

  const loadPermits = async () => {
    try {
      setLoadingPermits(true);
      const { data, error } = await supabase
        .from('permits')
        .select('*')
        .eq('customer_id', selectedCustomerId)
        .is('branch_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: Permit[] = (data || []).map((item: any) => ({
        id: parseInt(item.id) || 0,
        belgeAdi: item.belge_adi || '',
        belgeNo: item.belge_no || '',
        verilisTarihi: item.verilis_tarihi || '',
        gecerlilikTarihi: item.gecerlilik_tarihi || '',
        verenKurum: item.veren_kurum || ''
      }));

      setPermits(formattedData);
    } catch (err) {
      console.error('Error loading permits:', err);
    } finally {
      setLoadingPermits(false);
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onSettingsChange({ [name]: value });
  };

  const handleAddPermit = () => {
    const newId = permits.length > 0 ? Math.max(...permits.map(p => p.id)) + 1 : 1;
    setPermits([...permits, {
      id: newId,
      belgeAdi: '',
      belgeNo: '',
      verilisTarihi: '',
      gecerlilikTarihi: '',
      verenKurum: ''
    }]);
  };

  const handleDeletePermit = (id: number) => {
    setPermits(permits.filter(p => p.id !== id));
  };

  const handlePermitChange = (id: number, field: keyof Permit, value: string) => {
    setPermits(permits.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSavePermits = async () => {
    if (!selectedCustomerId) {
      alert('Lütfen önce bir müşteri seçin');
      return;
    }

    try {
      setSaving(true);

      await supabase
        .from('permits')
        .delete()
        .eq('customer_id', selectedCustomerId)
        .is('branch_id', null);

      if (permits.length > 0) {
        const { error } = await supabase
          .from('permits')
          .insert(
            permits.map(permit => ({
              customer_id: selectedCustomerId,
              branch_id: null,
              belge_adi: permit.belgeAdi,
              belge_no: permit.belgeNo,
              verilis_tarihi: permit.verilisTarihi || null,
              gecerlilik_tarihi: permit.gecerlilikTarihi || null,
              veren_kurum: permit.verenKurum
            }))
          );

        if (error) throw error;
      }

      alert('İzin ve ruhsatlar başarıyla kaydedildi!');
      loadPermits();
    } catch (err: any) {
      console.error('Error saving permits:', err);
      alert('Kaydetme hatası: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-3 rounded border border-green-200 text-sm text-green-800 mb-4">
        Firmanın sahip olduğu tüm izin ve ruhsatları bu bölümde listeleyebilirsiniz.
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: BRAND_GREEN }}>
          <Building2 size={16} /> Müşteri Seçimi
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Müşteri Seçin</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => onCustomerSelect(e.target.value)}
              className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
              disabled={loading}
            >
              <option value="">-- Müşteri Seçiniz --</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.cari_isim} ({customer.kisa_isim})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {selectedCustomerId && (
        <>
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 border-t pt-4" style={{ color: BRAND_GREEN }}>
              <Award size={16} /> İzin ve Ruhsatlar
            </h2>

            {loadingPermits ? (
              <div className="text-xs text-green-600 text-center py-4">
                İzinler yükleniyor...
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-3">
                  {permits.map((permit) => (
                    <div key={permit.id} className="p-3 border rounded bg-gray-50 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-600">İzin/Ruhsat #{permit.id}</span>
                        <button
                          onClick={() => handleDeletePermit(permit.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Belge Adı"
                        value={permit.belgeAdi}
                        onChange={(e) => handlePermitChange(permit.id, 'belgeAdi', e.target.value)}
                        className="w-full p-2 border rounded text-xs outline-none focus:border-green-600"
                      />
                      <input
                        type="text"
                        placeholder="Belge No"
                        value={permit.belgeNo}
                        onChange={(e) => handlePermitChange(permit.id, 'belgeNo', e.target.value)}
                        className="w-full p-2 border rounded text-xs outline-none focus:border-green-600"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          placeholder="Veriliş Tarihi"
                          value={permit.verilisTarihi}
                          onChange={(e) => handlePermitChange(permit.id, 'verilisTarihi', e.target.value)}
                          className="w-full p-2 border rounded text-xs outline-none focus:border-green-600"
                        />
                        <input
                          type="date"
                          placeholder="Geçerlilik Tarihi"
                          value={permit.gecerlilikTarihi}
                          onChange={(e) => handlePermitChange(permit.id, 'gecerlilikTarihi', e.target.value)}
                          className="w-full p-2 border rounded text-xs outline-none focus:border-green-600"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Veren Kurum"
                        value={permit.verenKurum}
                        onChange={(e) => handlePermitChange(permit.id, 'verenKurum', e.target.value)}
                        className="w-full p-2 border rounded text-xs outline-none focus:border-green-600"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddPermit}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-green-600 text-green-600 rounded text-sm font-medium hover:bg-green-50 transition-colors"
                  >
                    <Plus size={16} />
                    Yeni İzin/Ruhsat Ekle
                  </button>
                  <button
                    onClick={handleSavePermits}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                    style={{ backgroundColor: BRAND_GREEN }}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Kaydet
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 border-t pt-4" style={{ color: BRAND_GREEN }}>
              <Settings size={16} /> Doküman Ayarları
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                name="dokumanNo"
                value={settings.dokumanNo}
                onChange={handleSettingsChange}
                className="p-2 border rounded text-sm outline-none focus:border-green-600"
                placeholder="No"
              />
              <input
                type="text"
                name="yayinTarihi"
                value={settings.yayinTarihi}
                onChange={handleSettingsChange}
                className="p-2 border rounded text-sm outline-none focus:border-green-600"
                placeholder="Tarih"
              />
              <input
                type="text"
                name="revizyonNo"
                value={settings.revizyonNo}
                onChange={handleSettingsChange}
                className="p-2 border rounded text-sm outline-none focus:border-green-600"
                placeholder="Rev"
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
