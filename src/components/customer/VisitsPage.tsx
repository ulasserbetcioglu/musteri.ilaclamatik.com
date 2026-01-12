import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, CheckCircle, Clock, AlertCircle, LogOut, FileText, 
  Shield, Search, Download, X, User, Building, Loader2, Info, 
  ChevronLeft, ChevronRight, Eye, Bug, Receipt, ImageIcon, 
  CheckSquare, Maximize2 
} from 'lucide-react';
import { BRAND_GREEN, LOGO_URL } from '../../constants';
import { supabase } from '../../lib/supabase';
import type { AuthUser } from '../../hooks/useAuth';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// --- Arayüzler ---
interface Visit {
  id: string;
  customer_id: string | null;
  branch_id: string | null;
  operator_id: string | null;
  visit_date: string;
  status: 'planned' | 'completed' | 'cancelled' | 'in_progress';
  visit_type: string | null;
  notes: string | null;
  report_number: string | null;
  yogunluk: string | null;
  aciklama: string | null;
  rapor_no: string | null;
  pest_types: any | null;
  report_photo_url: string | null;
  is_invoiced: boolean | null;
  invoice_number: string | null;
  equipment_checks: any | null;
  musteri_aciklamasi: string | null;
  yonetici_notu: string | null;
  customers?: { kisa_isim?: string; cari_isim?: string };
  branches?: { sube_adi?: string };
  operator?: { name?: string };
}

interface VisitDetail extends Visit {
  paid_materials: Array<{
    id: string;
    material_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

interface VisitsPageProps {
  user: AuthUser;
  onLogout: () => void;
  onNavigate: (page: 'documents' | 'visits' | 'calendar' | 'msds') => void;
}

// --- Bileşenler ---

const VisitCard = ({ visit, onViewDetails, onImageClick }: { visit: Visit; onViewDetails: (id: string) => void; onImageClick: (url: string) => void }) => {
  const statusConfig: any = {
    planned: { icon: Clock, color: 'border-yellow-500 bg-yellow-50', textColor: 'text-yellow-700', text: 'Planlandı' },
    completed: { icon: CheckCircle, color: 'border-green-500 bg-green-50', textColor: 'text-green-700', text: 'Tamamlandı' },
    cancelled: { icon: X, color: 'border-red-500 bg-red-50', textColor: 'text-red-700', text: 'İptal' },
    in_progress: { icon: Loader2, color: 'border-blue-500 bg-blue-50', textColor: 'text-blue-700', text: 'Devam Ediyor' },
  };

  const currentStatus = statusConfig[visit.status] || { icon: Info, color: 'border-gray-500 bg-gray-50', textColor: 'text-gray-700', text: 'Bilinmiyor' };
  
  const pests = useMemo(() => {
    if (!visit.pest_types) return [];
    try { return typeof visit.pest_types === 'string' ? JSON.parse(visit.pest_types) : visit.pest_types; } catch { return []; }
  }, [visit.pest_types]);

  const equipmentCount = useMemo(() => {
    if (!visit.equipment_checks) return 0;
    return Object.keys(visit.equipment_checks).length;
  }, [visit.equipment_checks]);

  return (
    <div className={`p-5 rounded-xl shadow-md bg-white border-l-4 ${currentStatus.color} hover:shadow-lg transition-all`}>
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div className="flex gap-4">
          {visit.report_photo_url && (
            <div className="relative group cursor-pointer" onClick={() => onImageClick(visit.report_photo_url!)}>
              <img src={visit.report_photo_url} className="w-20 h-20 rounded-lg object-cover border" alt="Rapor" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                <Maximize2 size={16} className="text-white" />
              </div>
            </div>
          )}
          <div>
            <p className="font-bold text-lg text-gray-800 leading-tight">
              {visit.branches?.sube_adi || visit.customers?.kisa_isim || 'Genel Merkez'}
            </p>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
              <Calendar size={14} className="text-green-600" /> {format(new Date(visit.visit_date), 'dd MMMM yyyy, HH:mm', { locale: tr })}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${currentStatus.color} ${currentStatus.textColor}`}>
          {currentStatus.text}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {pests.map((p: string, i: number) => (
          <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[10px] font-bold uppercase flex items-center gap-1 italic">
            <Bug size={10} /> {p}
          </span>
        ))}
        {visit.is_invoiced && (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <Receipt size={10} /> FATURA: {visit.invoice_number}
          </span>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Operatör</p>
          <p className="flex items-center gap-2 mt-1 text-gray-700 font-semibold"><User size={14} /> {visit.operator?.name || 'Atanmadı'}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Rapor No</p>
          <p className="flex items-center gap-2 mt-1 font-mono font-bold text-green-700 uppercase tracking-tighter">
            <FileText size={14} /> {visit.report_number || visit.rapor_no || '-'}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Cihaz Takibi</p>
          <p className="flex items-center gap-2 mt-1 text-gray-700 font-semibold">
            <CheckSquare size={14} className="text-blue-500" /> {equipmentCount} Adet Kontrol
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
        <button onClick={() => onViewDetails(visit.id)} className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-green-600 transition-all text-xs font-black uppercase tracking-widest">
          <Eye size={16} /> Raporu İncele
        </button>
      </div>
    </div>
  );
};

const VisitDetailModal = ({ visitId, onClose }: { visitId: string; onClose: () => void }) => {
  const [data, setData] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data: v } = await supabase.from('visits').select('*, customers(kisa_isim), branches(sube_adi), operator:operator_id(name)').eq('id', visitId).maybeSingle();
        const { data: s } = await supabase.from('paid_material_sales').select('id').eq('visit_id', visitId);
        let mats: any[] = [];
        if (s && s.length > 0) {
          const { data: m } = await supabase.from('paid_material_sale_items').select('*, product:product_id(name)').in('sale_id', s.map(x => x.id));
          mats = m?.map(i => ({ id: i.id, material_name: i.product?.name, quantity: i.quantity, unit_price: i.unit_price, total_price: i.total_price })) || [];
        }
        setData({ ...v, paid_materials: mats });
      } finally { setLoading(false); }
    };
    fetchAll();
  }, [visitId]);

  if (loading) return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center backdrop-blur-sm">
      <Loader2 className="animate-spin text-white" size={48} />
    </div>
  );

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl my-auto shadow-2xl overflow-hidden border">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/80">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Ziyaret Detay Analizi</h2>
            <p className="text-[10px] font-bold text-green-600 uppercase mt-0.5">Sistem UUID: {data.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-full transition-all"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[75vh]">
          {/* Hızlı Bilgi Kartları */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase">Uygulama Alanı</p>
              <p className="text-sm font-bold text-gray-800">{data.branches?.sube_adi || 'Genel Merkez'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase">Ziyaret Tarihi</p>
              <p className="text-sm font-bold text-gray-800">{format(new Date(data.visit_date), 'dd.MM.yyyy HH:mm')}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase">Durum</p>
              <p className="text-sm font-bold text-emerald-600 uppercase italic">{data.status}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase">Resmi Rapor</p>
              <p className="text-sm font-mono font-black text-green-700">{data.report_number || data.rapor_no || '-'}</p>
            </div>
          </div>

          {/* Ekipman Kontrolleri (Açık Hali) */}
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <CheckSquare size={14} className="text-blue-500" /> Cihaz & Ekipman Kontrol Dökümü
            </h3>
            {data.equipment_checks && Object.keys(data.equipment_checks).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(data.equipment_checks).map(([key, val]: [string, any], idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <span className="text-[11px] font-bold text-blue-900 uppercase tracking-tighter leading-none">{key.replace(/_/g, ' ')}</span>
                    <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{val || 0}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Bu ziyarette cihaz kontrolü kaydedilmemiş.</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Fotoğraf Alanı */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <ImageIcon size={14} className="text-purple-500" /> Saha Görseli
              </h3>
              {data.report_photo_url ? (
                <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-gray-50">
                  <img src={data.report_photo_url} className="w-full h-64 object-cover hover:scale-105 transition-transform duration-700" alt="Uygulama" />
                </div>
              ) : (
                <div className="h-64 bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300">
                  <ImageIcon size={48} strokeWidth={1} />
                  <p className="text-[10px] font-bold mt-2">GÖRSEL YÜKLENMEMİŞ</p>
                </div>
              )}
            </div>

            {/* Açıklama Alanı */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Info size={14} className="text-amber-500" /> Operasyonel Notlar
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-amber-50/30 rounded-2xl border border-amber-100 italic text-sm text-gray-700 leading-relaxed shadow-sm">
                  "{data.notes || data.aciklama || 'Operatör açıklaması bulunmuyor.'}"
                </div>
                {data.musteri_aciklamasi && (
                  <div className="p-3 bg-green-50/50 rounded-xl border border-green-100 text-xs font-medium text-gray-600">
                    <span className="font-black text-green-700 uppercase text-[9px] block mb-1">Müşteri Notu:</span>
                    {data.musteri_aciklamasi}
                  </div>
                )}
                {data.yonetici_notu && (
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs font-medium text-gray-600">
                    <span className="font-black text-indigo-700 uppercase text-[9px] block mb-1">Yönetici Geri Bildirimi:</span>
                    {data.yonetici_notu}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Malzeme Tablosu */}
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Receipt size={14} className="text-emerald-500" /> Kullanılan Ek Malzeme Listesi
            </h3>
            {data.paid_materials.length > 0 ? (
              <div className="border rounded-2xl overflow-hidden">
                <table className="w-full text-[12px] text-left border-collapse">
                  <thead className="bg-gray-900 text-white">
                    <tr>
                      <th className="p-3 font-bold">ÜRÜN ADI</th>
                      <th className="p-3 text-center">ADET</th>
                      <th className="p-3 text-right">BİRİM</th>
                      <th className="p-3 text-right">TOPLAM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.paid_materials.map((m, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors font-medium">
                        <td className="p-3 text-gray-800">{m.material_name}</td>
                        <td className="p-3 text-center">{m.quantity}</td>
                        <td className="p-3 text-right">{m.unit_price.toFixed(2)} ₺</td>
                        <td className="p-3 text-right font-black text-emerald-600">{m.total_price.toFixed(2)} ₺</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50/80">
                      <td colSpan={3} className="p-4 text-right font-black text-gray-900 uppercase tracking-wider">GENEL TOPLAM</td>
                      <td className="p-4 text-right font-black text-lg text-emerald-700">
                        {data.paid_materials.reduce((s, m) => s + m.total_price, 0).toFixed(2)} ₺
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 border-2 border-dashed rounded-2xl text-center text-gray-400 text-xs font-bold uppercase italic">
                Bu ziyarette faturalandırılan ek malzeme yoktur.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Ana Sayfa ---
export function VisitsPage({ user, onLogout, onNavigate }: VisitsPageProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [filters, setFilters] = useState({ searchTerm: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      let query = supabase.from('visits').select('*, customers(kisa_isim), branches(sube_adi), operator:operator_id(name)', { count: 'exact' });

      if (user.customer_id) {
        const { data: b } = await supabase.from('branches').select('id').eq('customer_id', user.customer_id);
        const bIds = b?.map(x => x.id) || [];
        query = bIds.length > 0 ? query.or(`customer_id.eq.${user.customer_id},branch_id.in.(${bIds.join(',')})`) : query.eq('customer_id', user.customer_id);
      }

      if (filters.status) query = query.eq('status', filters.status);
      if (filters.searchTerm) query = query.or(`report_number.ilike.%${filters.searchTerm}%,notes.ilike.%${filters.searchTerm}%,aciklama.ilike.%${filters.searchTerm}%`);
      
      const { data, count, error } = await query.order('visit_date', { ascending: false }).range(from, to);
      if (!error) { setVisits(data || []); setTotalCount(count || 0); }
      setLoading(false);
    };
    load();
  }, [user, filters, currentPage]);

  const exportExcel = () => {
    const data = visits.map(v => ({ Tarih: format(new Date(v.visit_date), 'dd.MM.yyyy'), Şube: v.branches?.sube_adi || 'Merkez', Rapor: v.report_number || v.rapor_no, Operatör: v.operator?.name, Durum: v.status }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ziyaretler");
    XLSX.writeFile(wb, "Ziyaret_Gecmisi.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Logo" className="h-10" />
            <h1 className="text-xl font-bold text-gray-800">İlaçlama Takip</h1>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-gray-500 hover:text-rose-600 font-bold text-sm"><LogOut size={18} /> Çıkış</button>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex gap-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'documents', label: 'Belgeler', icon: FileText },
            { id: 'visits', label: 'Ziyaretler', icon: Calendar },
            { id: 'calendar', label: 'Takvim', icon: Clock },
            { id: 'msds', label: 'Ruhsatlar', icon: Shield },
          ].map(p => (
            <button key={p.id} onClick={() => onNavigate(p.id as any)} className={`py-4 px-4 text-xs font-black uppercase tracking-widest border-b-4 transition-all ${p.id === 'visits' ? 'border-green-600 text-green-700 bg-green-50/40' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between items-end gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">Operasyon Kayıtları</h2>
            <p className="text-xs font-bold text-gray-400 uppercase mt-1">Sistemde {totalCount} aktif işlem tespiti yapıldı</p>
          </div>
          <button onClick={exportExcel} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-100 hover:bg-green-700 hover:-translate-y-0.5 transition-all">
            <Download size={18} className="inline mr-2" /> Excel Raporu Al
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 flex flex-wrap gap-4 border border-gray-100">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
              type="text" 
              placeholder="Rapor no, zararlı türü veya açıklamalarda hızlı ara..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 font-medium text-sm outline-none" 
              onChange={e => setFilters({...filters, searchTerm: e.target.value})} 
            />
          </div>
          <select className="p-3 bg-gray-50 border-none rounded-xl font-bold text-xs uppercase text-gray-500 outline-none" onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">Tüm Durumlar</option>
            <option value="completed">Tamamlandı</option>
            <option value="planned">Planlandı</option>
            <option value="cancelled">İptal</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-600" size={64} strokeWidth={3} /></div>
        ) : (
          <div className="grid gap-5">
            {visits.map(v => <VisitCard key={v.id} visit={v} onViewDetails={setSelectedVisitId} onImageClick={setSelectedImageUrl} />)}
          </div>
        )}

        {!loading && totalCount > itemsPerPage && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-3 bg-white border rounded-full hover:shadow-md disabled:opacity-20"><ChevronLeft size={24}/></button>
            <span className="font-black text-gray-900 tracking-widest">SAYFA {currentPage}</span>
            <button disabled={currentPage * itemsPerPage >= totalCount} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white border rounded-full hover:shadow-md disabled:opacity-20"><ChevronRight size={24}/></button>
          </div>
        )}
      </main>

      {/* Fotoğraf Büyütme Modalı (Lightbox) */}
      {selectedImageUrl && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setSelectedImageUrl(null)}>
          <button className="absolute top-8 right-8 text-white/70 hover:text-white"><X size={48} /></button>
          <img src={selectedImageUrl} className="max-w-full max-h-full rounded-lg shadow-2xl object-contain animate-in zoom-in-90 duration-300" alt="Büyük Görsel" />
        </div>
      )}

      {selectedVisitId && <VisitDetailModal visitId={selectedVisitId} onClose={() => setSelectedVisitId(null)} />}
    </div>
  );
}