import { useState, useEffect } from 'react';
import { Trash2, Plus, FileText } from 'lucide-react';
import { BRAND_GREEN } from '../../../constants';
import { supabase } from '../../../lib/supabase';
import type { DocumentSettings } from '../../../types';

interface WasteRecord {
  id: string;
  tarih: string;
  atik_turu: string;
  miktar: string;
  bertaraf_firmasi: string;
  belge_no: string;
  notlar: string;
}

interface WasteDisposalEditorProps {
  settings: DocumentSettings;
  onSettingsChange: (updates: Partial<DocumentSettings>) => void;
  customerId?: string;
}

export function WasteDisposalEditor({ settings, onSettingsChange, customerId }: WasteDisposalEditorProps) {
  const [records, setRecords] = useState<WasteRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerId) {
      loadRecords();
    }
  }, [customerId]);

  const loadRecords = async () => {
    if (!customerId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('waste_disposal_records')
      .select('*')
      .eq('customer_id', customerId)
      .order('tarih', { ascending: false });

    if (!error && data) {
      setRecords(data);
    }
    setLoading(false);
  };

  const addRecord = () => {
    const newRecord: WasteRecord = {
      id: `temp-${Date.now()}`,
      tarih: new Date().toISOString().split('T')[0],
      atik_turu: 'Biyosidal Ürün Ambalajı',
      miktar: '',
      bertaraf_firmasi: '',
      belge_no: '',
      notlar: ''
    };
    setRecords([newRecord, ...records]);
  };

  const updateRecord = (id: string, field: keyof WasteRecord, value: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRecord = (id: string) => {
    if (window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onSettingsChange({ [name]: value });
  };

  if (!customerId) {
    return (
      <div className="text-center py-8 text-gray-500 bg-yellow-50 p-6 rounded border border-yellow-200">
        <p className="font-medium">Lütfen önce bir müşteri seçiniz.</p>
        <p className="text-sm mt-1">Atık bertaraf kayıtları müşteri bazlıdır.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-3 rounded border border-green-200 text-sm text-green-800 mb-4">
        Bu müşteriye ait biyosidal atık bertaraf kayıtlarını buradan yönetebilirsiniz. Kayıtlar yasal yükümlülükler için önemlidir.
      </div>

      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: BRAND_GREEN }}>
          <Trash2 size={16} /> Atık Bertaraf Kayıtları
        </h2>
        <button
          onClick={addRecord}
          className="bg-green-600 text-white p-1.5 rounded hover:bg-green-700 transition"
        >
          <Plus size={16} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-sm text-gray-500">Kayıtlar yükleniyor...</div>
      ) : (
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded">
              Henüz atık bertaraf kaydı bulunmuyor. Yeni kayıt ekleyin.
            </div>
          ) : (
            records.map((record, index) => (
              <div key={record.id} className="p-3 bg-white border rounded shadow-sm relative group">
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded font-mono">
                    #{index + 1}
                  </span>
                  <button
                    onClick={() => removeRecord(record.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 pl-1">Tarih</label>
                      <input
                        type="date"
                        value={record.tarih}
                        onChange={(e) => updateRecord(record.id, 'tarih', e.target.value)}
                        className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 pl-1">Atık Türü</label>
                      <select
                        value={record.atik_turu}
                        onChange={(e) => updateRecord(record.id, 'atik_turu', e.target.value)}
                        className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                      >
                        <option>Biyosidal Ürün Ambalajı</option>
                        <option>İlaç Artığı</option>
                        <option>Kontamine Malzeme</option>
                        <option>Diğer Tehlikeli Atık</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 pl-1">Miktar</label>
                      <input
                        type="text"
                        placeholder="Örn: 25 kg"
                        value={record.miktar}
                        onChange={(e) => updateRecord(record.id, 'miktar', e.target.value)}
                        className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 pl-1">Belge No</label>
                      <input
                        type="text"
                        placeholder="Örn: ATIK-2024-001"
                        value={record.belge_no}
                        onChange={(e) => updateRecord(record.id, 'belge_no', e.target.value)}
                        className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 pl-1">Bertaraf Firması</label>
                    <input
                      type="text"
                      placeholder="Atık bertaraf firması adı"
                      value={record.bertaraf_firmasi}
                      onChange={(e) => updateRecord(record.id, 'bertaraf_firmasi', e.target.value)}
                      className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 pl-1">Notlar (Opsiyonel)</label>
                    <textarea
                      placeholder="Ek bilgiler..."
                      value={record.notlar}
                      onChange={(e) => updateRecord(record.id, 'notlar', e.target.value)}
                      rows={2}
                      className="w-full p-2 border rounded text-xs outline-none focus:border-green-600"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
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
