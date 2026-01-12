import { useState, useEffect } from 'react';
import { ShieldCheck, Settings, Building2, Save } from 'lucide-react';
import { BRAND_GREEN } from '../../../constants';
import { supabase } from '../../../lib/supabase';
import type { DocumentSettings, Customer, FumigationLicense } from '../../../types';

interface FumigationLicenseEditorProps {
  customers: Customer[];
  selectedCustomerId: string;
  onCustomerSelect: (customerId: string) => void;
  settings: DocumentSettings;
  onSettingsChange: (updates: Partial<DocumentSettings>) => void;
  loading: boolean;
}

export function FumigationLicenseEditor({
  customers,
  selectedCustomerId,
  onCustomerSelect,
  settings,
  onSettingsChange,
  loading
}: FumigationLicenseEditorProps) {
  const [license, setLicense] = useState<FumigationLicense>({
    id: 1,
    ruhsatNo: '',
    verilisTarihi: '',
    gecerlilikTarihi: '',
    kapsamAciklamasi: '',
    kisitlamalar: ''
  });
  const [saving, setSaving] = useState(false);
  const [loadingLicense, setLoadingLicense] = useState(false);

  useEffect(() => {
    if (selectedCustomerId) {
      loadLicense();
    } else {
      resetLicense();
    }
  }, [selectedCustomerId]);

  const resetLicense = () => {
    setLicense({
      id: 1,
      ruhsatNo: '',
      verilisTarihi: '',
      gecerlilikTarihi: '',
      kapsamAciklamasi: '',
      kisitlamalar: ''
    });
  };

  const loadLicense = async () => {
    try {
      setLoadingLicense(true);
      const { data, error } = await supabase
        .from('fumigation_licenses')
        .select('*')
        .eq('customer_id', selectedCustomerId)
        .is('branch_id', null)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setLicense({
          id: parseInt(data.id) || 1,
          ruhsatNo: data.ruhsat_no || '',
          verilisTarihi: data.verilis_tarihi || '',
          gecerlilikTarihi: data.gecerlilik_tarihi || '',
          kapsamAciklamasi: data.kapsam_aciklamasi || '',
          kisitlamalar: data.kisitlamalar || ''
        });
      } else {
        resetLicense();
      }
    } catch (err) {
      console.error('Error loading license:', err);
    } finally {
      setLoadingLicense(false);
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onSettingsChange({ [name]: value });
  };

  const handleLicenseChange = (field: keyof FumigationLicense, value: string) => {
    setLicense(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveLicense = async () => {
    if (!selectedCustomerId) {
      alert('Lütfen önce bir müşteri seçin');
      return;
    }

    try {
      setSaving(true);

      await supabase
        .from('fumigation_licenses')
        .delete()
        .eq('customer_id', selectedCustomerId)
        .is('branch_id', null);

      const { error } = await supabase
        .from('fumigation_licenses')
        .insert({
          customer_id: selectedCustomerId,
          branch_id: null,
          ruhsat_no: license.ruhsatNo,
          verilis_tarihi: license.verilisTarihi || null,
          gecerlilik_tarihi: license.gecerlilikTarihi || null,
          kapsam_aciklamasi: license.kapsamAciklamasi,
          kisitlamalar: license.kisitlamalar
        });

      if (error) throw error;

      alert('Fumigasyon ruhsatı başarıyla kaydedildi!');
      loadLicense();
    } catch (err: any) {
      console.error('Error saving license:', err);
      alert('Kaydetme hatası: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-3 rounded border border-green-200 text-sm text-green-800 mb-4">
        Firmanın fumigasyon ruhsat bilgilerini bu bölümde düzenleyebilirsiniz.
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
              <ShieldCheck size={16} /> Fumigasyon Ruhsat Bilgileri
            </h2>

            {loadingLicense ? (
              <div className="text-xs text-green-600 text-center py-4">
                Ruhsat bilgileri yükleniyor...
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Ruhsat No</label>
                  <input
                    type="text"
                    placeholder="Ruhsat Numarası"
                    value={license.ruhsatNo}
                    onChange={(e) => handleLicenseChange('ruhsatNo', e.target.value)}
                    className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Veriliş Tarihi</label>
                    <input
                      type="date"
                      value={license.verilisTarihi}
                      onChange={(e) => handleLicenseChange('verilisTarihi', e.target.value)}
                      className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Geçerlilik Tarihi</label>
                    <input
                      type="date"
                      value={license.gecerlilikTarihi}
                      onChange={(e) => handleLicenseChange('gecerlilikTarihi', e.target.value)}
                      className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500">Kapsam Açıklaması</label>
                  <textarea
                    placeholder="Ruhsatın kapsadığı hizmetler ve alanlar..."
                    value={license.kapsamAciklamasi}
                    onChange={(e) => handleLicenseChange('kapsamAciklamasi', e.target.value)}
                    rows={4}
                    className="w-full p-2 border rounded text-sm outline-none focus:border-green-600 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500">Kısıtlamalar</label>
                  <textarea
                    placeholder="Ruhsata ilişkin kısıtlamalar ve özel şartlar..."
                    value={license.kisitlamalar}
                    onChange={(e) => handleLicenseChange('kisitlamalar', e.target.value)}
                    rows={4}
                    className="w-full p-2 border rounded text-sm outline-none focus:border-green-600 resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveLicense}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
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
