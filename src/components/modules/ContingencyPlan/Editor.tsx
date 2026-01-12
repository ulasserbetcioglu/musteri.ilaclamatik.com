import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Trash2, FileText } from 'lucide-react';
import { BRAND_GREEN } from '../../../constants';
import { supabase } from '../../../lib/supabase';
import type { DocumentSettings, ContingencyPlanEntry } from '../../../types';

interface ContingencyPlanData {
  id: string;
  date: string;
  entries: ContingencyPlanEntry[];
}

interface ContingencyPlanEditorProps {
  settings: DocumentSettings;
  onSettingsChange: (updates: Partial<DocumentSettings>) => void;
  customerId?: string;
}

export function ContingencyPlanEditor({
  settings,
  onSettingsChange,
  customerId
}: ContingencyPlanEditorProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<ContingencyPlanEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerId) {
      loadPlan();
    }
  }, [customerId]);

  const loadPlan = async () => {
    if (!customerId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('contingency_plans')
      .select('*')
      .eq('customer_id', customerId)
      .maybeSingle();

    if (!error && data) {
      setDate(data.date || new Date().toISOString().split('T')[0]);
      setEntries(data.entries || []);
    }
    setLoading(false);
  };

  const addEntry = () => {
    const newEntry: ContingencyPlanEntry = {
      id: Date.now(),
      no: String(entries.length + 1),
      hazard: '',
      detectionMethod: '',
      criticalLimit: '',
      responsible: 'REPELLENT & MKP SÜT',
      correctiveAction: '',
      record: 'SERVİS RAPORU'
    };
    setEntries([...entries, newEntry]);
  };

  const updateEntry = (id: number, field: keyof ContingencyPlanEntry, value: string) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEntry = (id: number) => {
    if (window.confirm('Bu maddeyi silmek istediğinize emin misiniz?')) {
      setEntries(entries.filter(e => e.id !== id));
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
        <p className="text-sm mt-1">Acil eylem planı müşteri bazlıdır.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-3 rounded border border-green-200 text-sm text-green-800 mb-4">
        Zararlı Kontrolü Acil Eylem Planı - Kritik durumlarda uygulanacak acil eylem adımlarını tanımlayın.
      </div>

      <div className="grid grid-cols-1 gap-3 p-3 bg-gray-50 rounded border">
        <div>
          <label className="text-xs text-gray-600 pl-1 block mb-1">Form Tarihi</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
          />
        </div>
      </div>

      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: BRAND_GREEN }}>
          <AlertTriangle size={16} /> Acil Eylem Planı Maddeleri
        </h2>
        <button
          onClick={addEntry}
          className="bg-green-600 text-white p-1.5 rounded hover:bg-green-700 transition"
        >
          <Plus size={16} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-sm text-gray-500">Plan yükleniyor...</div>
      ) : (
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded">
              Henüz acil eylem planı maddesi bulunmuyor. Yeni madde ekleyin.
            </div>
          ) : (
            entries.map((entry, index) => (
              <div key={entry.id} className="p-4 bg-white border rounded shadow-sm relative group">
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded font-mono">
                    #{entry.no}
                  </span>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-500 pl-1">No</label>
                      <input
                        type="text"
                        value={entry.no}
                        onChange={(e) => updateEntry(entry.id, 'no', e.target.value)}
                        className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 pl-1">Sorumlu</label>
                      <input
                        type="text"
                        value={entry.responsible}
                        onChange={(e) => updateEntry(entry.id, 'responsible', e.target.value)}
                        className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 pl-1">Tehlike / Danger</label>
                    <textarea
                      placeholder="Tehlike tanımı..."
                      value={entry.hazard}
                      onChange={(e) => updateEntry(entry.id, 'hazard', e.target.value)}
                      rows={2}
                      className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 pl-1">Tespit Yöntemi / Detection Method</label>
                    <textarea
                      placeholder="Nasıl tespit edilir..."
                      value={entry.detectionMethod}
                      onChange={(e) => updateEntry(entry.id, 'detectionMethod', e.target.value)}
                      rows={2}
                      className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 pl-1">Kritik Limit / Critical Limit</label>
                    <textarea
                      placeholder="Kritik eşik değeri..."
                      value={entry.criticalLimit}
                      onChange={(e) => updateEntry(entry.id, 'criticalLimit', e.target.value)}
                      rows={2}
                      className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 pl-1">Düzeltici Faaliyet / Corrective Action</label>
                    <textarea
                      placeholder="Alınacak önlemler..."
                      value={entry.correctiveAction}
                      onChange={(e) => updateEntry(entry.id, 'correctiveAction', e.target.value)}
                      rows={3}
                      className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 pl-1">Kayıt / Record</label>
                    <input
                      type="text"
                      value={entry.record}
                      onChange={(e) => updateEntry(entry.id, 'record', e.target.value)}
                      className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
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
