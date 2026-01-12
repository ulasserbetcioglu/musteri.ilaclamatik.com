import { Store, Plus, Trash2, Settings } from 'lucide-react';
import { BRAND_GREEN } from '../../../constants';
import type { Branch, DocumentSettings, Customer } from '../../../types';

interface BranchInfoEditorProps {
  customers: Customer[];
  selectedCustomerId: string;
  onCustomerSelect: (customerId: string) => void;
  branches: Branch[];
  onBranchesChange: (branches: Branch[]) => void;
  settings: DocumentSettings;
  onSettingsChange: (updates: Partial<DocumentSettings>) => void;
  loading: boolean;
}

export function BranchInfoEditor({ 
  customers, 
  selectedCustomerId, 
  onCustomerSelect, 
  branches, 
  onBranchesChange, 
  settings, 
  onSettingsChange,
  loading 
}: BranchInfoEditorProps) {
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onSettingsChange({ [name]: value });
  };

  const addBranch = () => {
    const newBranch: Branch = {
      id: Date.now(),
      subeAdi: '',
      yetkili: '',
      metrekare: '',
      adres: '',
      telefon: ''
    };
    onBranchesChange([...branches, newBranch]);
  };

  const updateBranch = (id: number, field: keyof Branch, value: string) => {
    const updatedBranches = branches.map(branch =>
      branch.id === id ? { ...branch, [field]: value } : branch
    );
    onBranchesChange(updatedBranches);
  };

  const removeBranch = (id: number) => {
    const updatedBranches = branches.filter(branch => branch.id !== id);
    onBranchesChange(updatedBranches);
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-3 rounded border border-green-200 text-sm text-green-800 mb-4">
        Bu modül müşterinin şube bilgilerini içerir. Zincir işletmeler için her şubenin detayları burada yer alır.
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: BRAND_GREEN }}>
          <Store size={16} /> Müşteri Seçimi
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
            <div className="text-xs text-green-600">Şube bilgileri yükleniyor...</div>
          )}
        </div>
      </section>

      {selectedCustomerId && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 border-t pt-4" style={{ color: BRAND_GREEN }}>
            <Store size={16} /> Şube Bilgileri
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={addBranch}
              className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition"
            >
              <Plus size={14} /> Yeni Şube Ekle
            </button>

            {branches.map((branch, index) => (
              <div key={branch.id} className="border rounded p-4 bg-gray-50 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm">Şube #{index + 1}</h3>
                  <button
                    onClick={() => removeBranch(branch.id)}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Şube Adı</label>
                    <input
                      type="text"
                      value={branch.subeAdi}
                      onChange={(e) => updateBranch(branch.id, 'subeAdi', e.target.value)}
                      className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                      placeholder="Şube adını giriniz"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Yetkili Kişi</label>
                      <input
                        type="text"
                        value={branch.yetkili}
                        onChange={(e) => updateBranch(branch.id, 'yetkili', e.target.value)}
                        className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                        placeholder="Yetkili adı"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Metrekare</label>
                      <input
                        type="text"
                        value={branch.metrekare}
                        onChange={(e) => updateBranch(branch.id, 'metrekare', e.target.value)}
                        className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                        placeholder="m²"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500">Adres</label>
                    <textarea
                      value={branch.adres}
                      onChange={(e) => updateBranch(branch.id, 'adres', e.target.value)}
                      rows={2}
                      className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                      placeholder="Şube adresi"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500">Telefon</label>
                    <input
                      type="text"
                      value={branch.telefon}
                      onChange={(e) => updateBranch(branch.id, 'telefon', e.target.value)}
                      className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                      placeholder="Telefon numarası"
                    />
                  </div>
                </div>
              </div>
            ))}

            {branches.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                Henüz şube eklenmemiş. "Yeni Şube Ekle" butonuna tıklayarak başlayın.
              </div>
            )}
          </div>
        </section>
      )}

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