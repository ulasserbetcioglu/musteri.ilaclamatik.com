import { Building2, MapPin, User, FileText } from 'lucide-react';
import { BRAND_GREEN } from '../../../constants';
import type { CustomerData, DocumentSettings, Customer } from '../../../types';

interface CustomerInfoEditorProps {
  customers: Customer[];
  selectedCustomerId: string;
  onCustomerSelect: (customerId: string) => void;
  formData: CustomerData;
  settings: DocumentSettings;
  onFormChange: (updates: Partial<CustomerData>) => void;
  onSettingsChange: (updates: Partial<DocumentSettings>) => void;
  loading: boolean;
}

export function CustomerInfoEditor({ 
  customers, 
  selectedCustomerId, 
  onCustomerSelect, 
  formData, 
  settings, 
  onFormChange, 
  onSettingsChange,
  loading 
}: CustomerInfoEditorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFormChange({ [name]: value });
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onSettingsChange({ [name]: value });
  };

  return (
    <div className="space-y-6">
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
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: BRAND_GREEN }}>
          <Building2 size={16} /> Firma Bilgileri
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Ticari Ünvan</label>
            <textarea 
              name="ticariUnvan" 
              value={formData.ticariUnvan} 
              onChange={handleChange} 
              rows={2} 
              className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
              disabled={!selectedCustomerId}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Faaliyet Konusu</label>
            <input 
              type="text" 
              name="faaliyetKonusu" 
              value={formData.faaliyetKonusu} 
              onChange={handleChange} 
              className="w-full p-2 border rounded text-sm outline-none focus:border-green-600" 
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500">Vergi Dairesi</label>
              <input 
                type="text" 
                name="vergiDairesi" 
                value={formData.vergiDairesi} 
                onChange={handleChange} 
                className="w-full p-2 border rounded text-sm outline-none focus:border-green-600" 
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Vergi No</label>
              <input 
                type="text" 
                name="vergiNo" 
                value={formData.vergiNo} 
                onChange={handleChange} 
                className="w-full p-2 border rounded text-sm outline-none focus:border-green-600" 
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Mersis No</label>
            <input 
              type="text" 
              name="mersisNo" 
              value={formData.mersisNo} 
              onChange={handleChange} 
              className="w-full p-2 border rounded text-sm outline-none focus:border-green-600" 
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 border-t pt-4" style={{ color: BRAND_GREEN }}>
          <MapPin size={16} /> İletişim & Adres
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Adres</label>
            <textarea 
              name="adres" 
              value={formData.adres} 
              onChange={handleChange} 
              rows={3} 
              className="w-full p-2 border rounded text-sm outline-none focus:border-green-600" 
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500">Telefon</label>
              <input 
                type="text" 
                name="telefon" 
                value={formData.telefon} 
                onChange={handleChange} 
                className="w-full p-2 border rounded text-sm outline-none focus:border-green-600" 
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">E-posta</label>
              <input 
                type="text" 
                name="eposta" 
                value={formData.eposta} 
                onChange={handleChange} 
                className="w-full p-2 border rounded text-sm outline-none focus:border-green-600" 
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 border-t pt-4" style={{ color: BRAND_GREEN }}>
          <User size={16} /> Yetkili Kişi
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Ad Soyad</label>
            <input 
              type="text" 
              name="yetkiliKisi" 
              value={formData.yetkiliKisi} 
              onChange={handleChange} 
              className="w-full p-2 border rounded text-sm outline-none focus:border-green-600" 
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500">Ünvan</label>
              <input 
                type="text" 
                name="yetkiliUnvan" 
                value={formData.yetkiliUnvan} 
                onChange={handleChange} 
                className="w-full p-2 border rounded text-sm outline-none focus:border-green-600" 
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Cep Tel</label>
              <input 
                type="text" 
                name="yetkiliTel" 
                value={formData.yetkiliTel} 
                onChange={handleChange} 
                className="w-full p-2 border rounded text-sm outline-none focus:border-green-600" 
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Başlangıç Tarihi</label>
            <input 
              type="date" 
              name="hizmetBaslangicTarihi" 
              value={formData.hizmetBaslangicTarihi} 
              onChange={handleChange} 
              className="w-full p-2 border rounded text-sm outline-none focus:border-green-600" 
            />
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
    </div>
  );
}