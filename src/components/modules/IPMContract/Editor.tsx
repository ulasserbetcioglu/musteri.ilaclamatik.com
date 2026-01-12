import { Ligature as FileSignature, Settings, Building2 } from 'lucide-react';
import { BRAND_GREEN } from '../../../constants';
import type { DocumentSettings, Customer } from '../../../types';

interface IPMContractEditorProps {
  customers: Customer[];
  selectedCustomerId: string;
  onCustomerSelect: (customerId: string) => void;
  settings: DocumentSettings;
  onSettingsChange: (updates: Partial<DocumentSettings>) => void;
  loading: boolean;
}

export function IPMContractEditor({ 
  customers, 
  selectedCustomerId, 
  onCustomerSelect, 
  settings, 
  onSettingsChange,
  loading 
}: IPMContractEditorProps) {
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onSettingsChange({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-3 rounded border border-green-200 text-sm text-green-800 mb-4">
        Bu modül Entegre Zararlı Yönetimi (IPM) sözleşmesini içerir. Müşteri ile yapılan hizmet sözleşmesinin detaylarını gösterir.
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
          {loading && (
            <div className="text-xs text-green-600">Müşteri bilgileri yükleniyor...</div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 border-t pt-4" style={{ color: BRAND_GREEN }}>
          <FileSignature size={16} /> IPM Sözleşmesi Bilgileri
        </h2>
        <div className="bg-gray-50 p-4 rounded border text-sm">
          <p className="mb-2">Bu sözleşme aşağıdaki konuları kapsar:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Entegre Zararlı Yönetimi (IPM) programı</li>
            <li>Hedef zararlılar ve kontrol yöntemleri</li>
            <li>Rutin kontroller ve acil çağrı sistemi</li>
            <li>Kimyasal uygulama prosedürleri</li>
            <li>Personel ve ekipman gereksinimleri</li>
            <li>Dokümantasyon ve raporlama</li>
            <li>Eğitim ve sertifikasyon</li>
          </ul>
        </div>
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
    </div>
  );
}