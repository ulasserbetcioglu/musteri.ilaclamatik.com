import { FileText, Settings } from 'lucide-react';
import { BRAND_GREEN } from '../../../constants';
import type { DocumentSettings } from '../../../types';

interface ActivityFileContentEditorProps {
  settings: DocumentSettings;
  onSettingsChange: (updates: Partial<DocumentSettings>) => void;
}

export function ActivityFileContentEditor({ settings, onSettingsChange }: ActivityFileContentEditorProps) {
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onSettingsChange({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-3 rounded border border-green-200 text-sm text-green-800 mb-4">
        Bu modül faaliyet dosyasının içindekiler sayfasıdır. Denetçinin aradığı belgeyi hızlıca bulmasını sağlayan sayfa numaralarının veya bölüm adlarının olduğu listedir.
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: BRAND_GREEN }}>
          <FileText size={16} /> İçindekiler Tablosu
        </h2>
        <div className="bg-gray-50 p-4 rounded border text-sm">
          <p className="mb-2">Bu sayfa otomatik olarak oluşturulur ve aşağıdaki bölümleri içerir:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>1.1. Faaliyet Dosyası İçeriği</li>
            <li>1.2. Müşteri Bilgileri</li>
            <li>1.3. Müşteri Şubelerinin Bilgileri</li>
            <li>2.1. Hizmet Sözleşmesi</li>
            <li>3.1. İzin ve Ruhsatları</li>
            <li>3.2. Mesul Müdür ve Operatör Sertifikaları</li>
            <li>3.3. Fumigasyon Ruhsatı</li>
            <li>4.1. Zararlı Mücadelesi Ekipman Krokisi</li>
            <li>4.2. Ekipman Takip Formları</li>
            <li>4.3. Trend Analiz, Risk Değerlendirme, Eylem Aksiyon Planı</li>
            <li>4.3. Mali Sorumluluk Sigorta Poliçesi</li>
            <li>4.3. Müşteri Şikayet, Öneri ve/veya Memnuniyet Formları</li>
            <li>4.3. Acil Çağrı Bilgileri, Acil Durum Bilgilendirme Metni</li>
            <li>5.1. EK-1 Biyosidal Ürün Uygulama İşlem Formu</li>
            <li>5.2. Onaylı Biyosidal Ürün Listesi</li>
            <li>5.3. Biyosidal Ürün Kullanım Kartı</li>
            <li>5.4. Biyosidal Ürün Ruhsatları, MSDS ve Etiket Bilgileri</li>
            <li>5.5. Biyosidal Ürün Grupları Listesi</li>
            <li>6.1. Atık İmha Belgesi</li>
            <li>6.2. Fumigasyon Ruhsatı</li>
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