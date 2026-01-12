import { useState, useEffect } from 'react';
import { Shield, FileText } from 'lucide-react';
import { BRAND_GREEN } from '../../../constants';
import { supabase } from '../../../lib/supabase';
import type { DocumentSettings } from '../../../types';

interface InsurancePolicy {
  id: string;
  policy_no: string;
  sigorta_sirketi: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  teminat_tutari: string;
  para_birimi: string;
  kapsam: string;
  broker_adi: string;
  notlar: string;
  is_active: boolean;
}

interface InsurancePolicyEditorProps {
  settings: DocumentSettings;
  onSettingsChange: (updates: Partial<DocumentSettings>) => void;
}

export function InsurancePolicyEditor({ settings, onSettingsChange }: InsurancePolicyEditorProps) {
  const [policy, setPolicy] = useState<InsurancePolicy>({
    id: '',
    policy_no: '',
    sigorta_sirketi: '',
    baslangic_tarihi: new Date().toISOString().split('T')[0],
    bitis_tarihi: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    teminat_tutari: '0',
    para_birimi: 'TL',
    kapsam: 'Mesleki Sorumluluk, Mal Hasarı, Bedeni Zarar',
    broker_adi: '',
    notlar: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActivePolicy();
  }, []);

  const loadActivePolicy = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('is_active', true)
      .order('bitis_tarihi', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setPolicy(data);
    }
    setLoading(false);
  };

  const updateField = (field: keyof InsurancePolicy, value: string | boolean) => {
    setPolicy(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onSettingsChange({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-3 rounded border border-green-200 text-sm text-green-800 mb-4">
        Mali sorumluluk sigorta poliçesi bilgilerini buradan düzenleyin. Bu bilgi firma geneli (tüm müşteriler) için geçerlidir.
      </div>

      {loading ? (
        <div className="text-center py-8 text-sm text-gray-500">Sigorta bilgileri yükleniyor...</div>
      ) : (
        <>
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: BRAND_GREEN }}>
              <Shield size={16} /> Poliçe Bilgileri
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-500">Poliçe No</label>
                  <input
                    type="text"
                    placeholder="Örn: POL-2024-12345"
                    value={policy.policy_no}
                    onChange={(e) => updateField('policy_no', e.target.value)}
                    className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Sigorta Şirketi</label>
                  <input
                    type="text"
                    placeholder="Örn: Anadolu Sigorta"
                    value={policy.sigorta_sirketi}
                    onChange={(e) => updateField('sigorta_sirketi', e.target.value)}
                    className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-500">Başlangıç Tarihi</label>
                  <input
                    type="date"
                    value={policy.baslangic_tarihi}
                    onChange={(e) => updateField('baslangic_tarihi', e.target.value)}
                    className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={policy.bitis_tarihi}
                    onChange={(e) => updateField('bitis_tarihi', e.target.value)}
                    className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-500">Teminat Tutarı</label>
                  <input
                    type="text"
                    placeholder="Örn: 500.000"
                    value={policy.teminat_tutari}
                    onChange={(e) => updateField('teminat_tutari', e.target.value)}
                    className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Para Birimi</label>
                  <select
                    value={policy.para_birimi}
                    onChange={(e) => updateField('para_birimi', e.target.value)}
                    className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                  >
                    <option>TL</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500">Kapsam</label>
                <textarea
                  placeholder="Sigorta kapsamı (örn: Mesleki Sorumluluk, Mal Hasarı, Bedeni Zarar)"
                  value={policy.kapsam}
                  onChange={(e) => updateField('kapsam', e.target.value)}
                  rows={3}
                  className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500">Broker Adı (Opsiyonel)</label>
                <input
                  type="text"
                  placeholder="Sigorta aracısı/broker"
                  value={policy.broker_adi}
                  onChange={(e) => updateField('broker_adi', e.target.value)}
                  className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500">Notlar (Opsiyonel)</label>
                <textarea
                  placeholder="Ek bilgiler ve açıklamalar"
                  value={policy.notlar}
                  onChange={(e) => updateField('notlar', e.target.value)}
                  rows={2}
                  className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={policy.is_active}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                  className="w-4 h-4 accent-green-700"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Bu poliçe aktif
                </label>
              </div>
            </div>
          </section>

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
        </>
      )}
    </div>
  );
}
