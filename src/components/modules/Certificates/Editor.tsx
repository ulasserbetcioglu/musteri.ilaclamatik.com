import { useState, useEffect } from 'react';
import { Users, Settings, Building2, Plus, Trash2, Save } from 'lucide-react';
import { BRAND_GREEN, STAFF_ROLES } from '../../../constants';
import { supabase } from '../../../lib/supabase';
import type { DocumentSettings, Customer, Staff } from '../../../types';

interface CertificatesEditorProps {
  customers: Customer[];
  selectedCustomerId: string;
  onCustomerSelect: (customerId: string) => void;
  settings: DocumentSettings;
  onSettingsChange: (updates: Partial<DocumentSettings>) => void;
  loading: boolean;
}

export function CertificatesEditor({
  customers,
  selectedCustomerId,
  onCustomerSelect,
  settings,
  onSettingsChange,
  loading
}: CertificatesEditorProps) {
  const [certificates, setCertificates] = useState<Staff[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingCertificates, setLoadingCertificates] = useState(false);

  useEffect(() => {
    if (selectedCustomerId) {
      loadCertificates();
    } else {
      setCertificates([]);
    }
  }, [selectedCustomerId]);

  const loadCertificates = async () => {
    try {
      setLoadingCertificates(true);
      const { data, error } = await supabase
        .from('staff_certificates')
        .select('*')
        .eq('customer_id', selectedCustomerId)
        .is('branch_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: Staff[] = (data || []).map((item: any) => ({
        id: parseInt(item.id) || 0,
        adSoyad: item.ad_soyad || '',
        gorev: item.gorev || '',
        sertifikaNo: item.sertifika_no || '',
        gecerlilikTarihi: item.gecerlilik_tarihi || ''
      }));

      setCertificates(formattedData);
    } catch (err) {
      console.error('Error loading certificates:', err);
    } finally {
      setLoadingCertificates(false);
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onSettingsChange({ [name]: value });
  };

  const handleAddCertificate = () => {
    const newId = certificates.length > 0 ? Math.max(...certificates.map(c => c.id)) + 1 : 1;
    setCertificates([...certificates, {
      id: newId,
      adSoyad: '',
      gorev: STAFF_ROLES[0],
      sertifikaNo: '',
      gecerlilikTarihi: ''
    }]);
  };

  const handleDeleteCertificate = (id: number) => {
    setCertificates(certificates.filter(c => c.id !== id));
  };

  const handleCertificateChange = (id: number, field: keyof Staff, value: string) => {
    setCertificates(certificates.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleSaveCertificates = async () => {
    if (!selectedCustomerId) {
      alert('Lütfen önce bir müşteri seçin');
      return;
    }

    try {
      setSaving(true);

      await supabase
        .from('staff_certificates')
        .delete()
        .eq('customer_id', selectedCustomerId)
        .is('branch_id', null);

      if (certificates.length > 0) {
        const { error } = await supabase
          .from('staff_certificates')
          .insert(
            certificates.map(cert => ({
              customer_id: selectedCustomerId,
              branch_id: null,
              ad_soyad: cert.adSoyad,
              gorev: cert.gorev,
              sertifika_no: cert.sertifikaNo,
              gecerlilik_tarihi: cert.gecerlilikTarihi || null
            }))
          );

        if (error) throw error;
      }

      alert('Sertifikalar başarıyla kaydedildi!');
      loadCertificates();
    } catch (err: any) {
      console.error('Error saving certificates:', err);
      alert('Kaydetme hatası: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-3 rounded border border-green-200 text-sm text-green-800 mb-4">
        Mesul müdür ve operatör sertifikalarını bu bölümde yönetebilirsiniz.
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
              <Users size={16} /> Mesul Müdür ve Operatör Sertifikaları
            </h2>

            {loadingCertificates ? (
              <div className="text-xs text-green-600 text-center py-4">
                Sertifikalar yükleniyor...
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-3">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="p-3 border rounded bg-gray-50 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-600">Personel #{cert.id}</span>
                        <button
                          onClick={() => handleDeleteCertificate(cert.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Ad Soyad"
                        value={cert.adSoyad}
                        onChange={(e) => handleCertificateChange(cert.id, 'adSoyad', e.target.value)}
                        className="w-full p-2 border rounded text-xs outline-none focus:border-green-600"
                      />
                      <select
                        value={cert.gorev}
                        onChange={(e) => handleCertificateChange(cert.id, 'gorev', e.target.value)}
                        className="w-full p-2 border rounded text-xs outline-none focus:border-green-600"
                      >
                        {STAFF_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Sertifika No"
                          value={cert.sertifikaNo}
                          onChange={(e) => handleCertificateChange(cert.id, 'sertifikaNo', e.target.value)}
                          className="w-full p-2 border rounded text-xs outline-none focus:border-green-600"
                        />
                        <input
                          type="date"
                          placeholder="Geçerlilik Tarihi"
                          value={cert.gecerlilikTarihi}
                          onChange={(e) => handleCertificateChange(cert.id, 'gecerlilikTarihi', e.target.value)}
                          className="w-full p-2 border rounded text-xs outline-none focus:border-green-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddCertificate}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-green-600 text-green-600 rounded text-sm font-medium hover:bg-green-50 transition-colors"
                  >
                    <Plus size={16} />
                    Yeni Personel Ekle
                  </button>
                  <button
                    onClick={handleSaveCertificates}
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
