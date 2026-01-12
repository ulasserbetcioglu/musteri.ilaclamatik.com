import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, CheckCircle, Clock, AlertCircle, LogOut, FileText, 
  Shield, Search, Download, X, User, Building, Loader2, Info, 
  ChevronLeft, ChevronRight, Eye, Bug, Receipt, Image as ImageIcon, 
  CheckSquare, Maximize2, Activity
} from 'lucide-react';
import { BRAND_GREEN, LOGO_URL } from '../../constants';
import { supabase } from '../../lib/supabase';
import type { AuthUser } from '../../hooks/useAuth';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// --- Arayüz Tanımlamaları ---
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

export function VisitsPage({ user, onLogout, onNavigate }: VisitsPageProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [visitDetail, setVisitDetail] = useState<VisitDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({ searchTerm: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  // --- Veri Yükleme (Liste) ---
  useEffect(() => {
    const loadVisits = async () => {
      try {
        setLoading(true);
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        
        let query = supabase
          .from('visits')
          .select('*, customers(kisa_isim), branches(sube_adi), operator:operator_id(name)', { count: 'exact' });

        if (user.customer_id) {
          const { data: b } = await supabase.from('branches').select('id').eq('customer_id', user.customer_id);
          const bIds = b?.map(x => x.id) || [];
          query = bIds.length > 0 ? query.or(`customer_id.eq.${user.customer_id},branch_id.in.(${bIds.join(',')})`) : query.eq('customer_id', user.customer_id);
        } else if (user.branch_id) {
          query = query.eq('branch_id', user.branch_id);
        }

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.searchTerm) query = query.or(`report_number.ilike.%${filters.searchTerm}%,notes.ilike.%${filters.searchTerm}%,aciklama.ilike.%${filters.searchTerm}%`);
        
        const { data, count, error } = await query.order('visit_date', { ascending: false }).range(from, to);
        if (!error) { setVisits(data || []); setTotalCount(count || 0); }
      } finally { setLoading(false); }
    };
    loadVisits();
  }, [user, filters, currentPage]);

  // --- Detay Yükleme (Modal İçin) ---
  const loadVisitDetail = async (id: string) => {
    try {
      setSelectedVisitId(id);
      setDetailLoading(true);
      const { data: v } = await supabase.from('visits').select('*, customers(kisa_isim), branches(sube_adi), operator:operator_id(name)').eq('id', id).maybeSingle();
      const { data: s } = await supabase.from('paid_material_sales').select('id').eq('visit_id', id);
      
      let materials: any[] = [];
      if (s && s.length > 0) {
        const { data: m } = await supabase.from('paid_material_sale_items').select('*, product:product_id(name)').in('sale_id', s.map(x => x.id));
        materials = m?.map(i => ({ id: i.id, material_name: i.product?.name, quantity: i.quantity, unit_price: i.unit_price, total_price: i.total_price })) || [];
      }
      setVisitDetail({ ...v, paid_materials: materials });
    } finally { setDetailLoading(false); }
  };

  const exportToExcel = () => {
    const data = visits.map(v => ({ Tarih: format(new Date(v.visit_date), 'dd.MM.yyyy'), Şube: v.branches?.sube_adi || 'Merkez', Rapor: v.report_number || v.rapor_no, Operatör: v.operator?.name, Durum: v.status }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ziyaretler");
    XLSX.writeFile(wb, `Ziyaret_Raporu_${Date.now()}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER VE MENÜ - Orijinal Konum */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Logo" className="h-10" />
            <h1 className="text-xl font-black text-gray-800 tracking-tighter">SİSTEM TAKİP</h1>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-gray-500 hover:text-rose-600 font-bold text-sm transition-colors uppercase"><LogOut size={18} /> Çıkış</button>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex gap-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'documents', label: 'Belgeler', icon: FileText },
            { id: 'visits', label: 'Ziyaretler', icon: Calendar },
            { id: 'calendar', label: 'Takvim', icon: Clock },
            { id: 'msds', label: 'Ruhsatlar', icon: Shield },
          ].map(p => (
            <button key={p.id} onClick={() => onNavigate(p.id as any)} className={`py-4 px-4 text-[11px] font-black uppercase tracking-widest border-b-4 transition-all flex items-center gap-2 whitespace-nowrap ${p.id === 'visits' ? 'border-green-600 text-green-700 bg-green-50/40' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
              <p.icon size={14} /> {p.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-wrap justify-between items-end gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic">Operasyon Kayıtları</h2>
            <p className="text-[11px] font-bold text-gray-400 uppercase mt-2 tracking-widest italic">Toplam {totalCount} işlem raporu bulundu</p>
          </div>
          <button onClick={exportToExcel} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-green-700 transition-all active:scale-95 flex items-center gap-2">
            <Download size={20} /> Excel Raporu Al
          </button>
        </div>

        {/* Filtreleme */}
        <div className="bg-white p-5 rounded-3xl shadow-sm mb-10 flex flex-wrap gap-4 border border-gray-100">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
              type="text" 
              placeholder="Rapor no, zararlı türü veya açıklamalarda hızlı tarama..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 font-bold text-xs uppercase outline-none" 
              onChange={e => setFilters({...filters, searchTerm: e.target.value})} 
            />
          </div>
          <select className="p-3 bg-gray-50 border-none rounded-2xl font-black text-[10px] uppercase text-gray-500 outline-none" onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">TÜM DURUMLAR</option>
            <option value="completed">TAMAMLANDI</option>
            <option value="planned">PLANLANDI</option>
            <option value="cancelled">İPTAL EDİLDİ</option>
          </select>
        </div>

        {/* Liste Alanı */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32"><Loader2 className="animate-spin text-green-600" size={64} strokeWidth={3} /></div>
        ) : (
          <div className="grid gap-6">
            {visits.map(v => (
              <div key={v.id} className={`p-6 rounded-3xl shadow-md bg-white border-l-[12px] ${v.status === 'completed' ? 'border-green-500' : 'border-amber-500'} hover:shadow-2xl transition-all`}>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex gap-5">
                    {v.report_photo_url && (
                      <div className="relative group cursor-pointer" onClick={() => setLightboxUrl(v.report_photo_url)}>
                        <img src={v.report_photo_url} className="w-24 h-24 rounded-2xl object-cover border-4 border-gray-50 shadow-md" alt="Rapor" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity"><Maximize2 size={20} className="text-white" /></div>
                      </div>
                    )}
                    <div>
                      <h3 className="font-black text-xl text-gray-800 tracking-tight uppercase leading-none mb-2">{v.branches?.sube_adi || 'Genel Merkez'}</h3>
                      <p className="text-sm text-gray-400 font-bold flex items-center gap-2 uppercase tracking-tighter"><Calendar size={14} className="text-green-600" /> {format(new Date(v.visit_date), 'dd MMMM yyyy, HH:mm', { locale: tr })}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {v.pest_types && (typeof v.pest_types === 'string' ? JSON.parse(v.pest_types) : v.pest_types).map((p: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 italic"><Bug size={10} /> {p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${v.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {v.status === 'completed' ? 'TAMAMLANDI' : 'BEKLİYOR'}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-3 gap-6 text-[13px]">
                  <div><p className="text-[10px] text-gray-300 font-black uppercase mb-1">Uygulayıcı</p><p className="text-gray-700 font-black flex items-center gap-2"><User size={16} className="text-gray-400" /> {v.operator?.name || 'ATANMADI'}</p></div>
                  <div><p className="text-[10px] text-gray-300 font-black uppercase mb-1">Rapor Seri No</p><p className="font-mono font-black text-green-700 text-lg tracking-tighter"># {v.report_number || v.rapor_no || '-'}</p></div>
                  <div><p className="text-[10px] text-gray-300 font-black uppercase mb-1">Kontrol Sayısı</p><p className="text-gray-700 font-black flex items-center gap-2"><CheckSquare size={16} className="text-blue-500" /> {v.equipment_checks ? Object.keys(v.equipment_checks).length : 0} CİHAZ</p></div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button onClick={() => loadVisitDetail(v.id)} className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-2xl hover:bg-green-600 transition-all text-xs font-black uppercase tracking-[0.2em] shadow-xl">
                    <Eye size={18} /> Raporu Görüntüle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sayfalama */}
        {!loading && totalCount > itemsPerPage && (
          <div className="mt-16 flex justify-center items-center gap-6 font-black uppercase text-[11px] tracking-widest">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-4 bg-white border rounded-2xl disabled:opacity-20 transition-all"><ChevronLeft size={24}/></button>
            <div className="bg-gray-900 text-white px-8 py-3 rounded-2xl shadow-xl italic">SAYFA {currentPage} / {Math.ceil(totalCount / itemsPerPage)}</div>
            <button disabled={currentPage * itemsPerPage >= totalCount} onClick={() => setCurrentPage(p => p + 1)} className="p-4 bg-white border rounded-2xl disabled:opacity-20 transition-all"><ChevronRight size={24}/></button>
          </div>
        )}
      </main>

      {/* --- DETAY MODALI (İçeride Render Edilir) --- */}
      {selectedVisitId && visitDetail && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in zoom-in-95 duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden border flex flex-col relative">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/80 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-600 text-white rounded-3xl shadow-lg shadow-green-100"><ClipboardList size={28} /></div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">İşlem Detay Raporu</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">ID: {visitDetail.id}</p>
                </div>
              </div>
              <button onClick={() => { setVisitDetail(null); setSelectedVisitId(null); }} className="p-4 hover:bg-rose-50 hover:text-rose-600 rounded-full transition-all border-none outline-none"><X size={32} /></button>
            </div>

            <div className="p-10 space-y-12 overflow-y-auto custom-scrollbar flex-1">
              {/* Bilgi Kartları */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Uygulama Alanı', val: visitDetail.branches?.sube_adi || 'Genel Merkez', icon: Building, col: 'text-blue-500' },
                  { label: 'Ziyaret Tarihi', val: format(new Date(visitDetail.visit_date), 'dd.MM.yyyy HH:mm'), icon: Calendar, col: 'text-purple-500' },
                  { label: 'Operatör', val: visitDetail.operator?.name || '-', icon: User, col: 'text-amber-500' },
                  { label: 'Rapor No', val: visitDetail.report_number || visitDetail.rapor_no || '-', icon: FileText, col: 'text-emerald-500' },
                ].map((x, i) => (
                  <div key={i} className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                    <x.icon size={16} className={`${x.col} mb-2`} />
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{x.label}</p>
                    <p className="text-sm font-black text-gray-800 break-words italic">{x.val}</p>
                  </div>
                ))}
              </div>

              {/* Ekipman Detay Listesi (CSV'den Dinamik) */}
              <div>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><CheckSquare size={16} className="text-blue-500" /> Cihaz & Ekipman Kontrol Dökümü</h3>
                {visitDetail.equipment_checks && Object.keys(visitDetail.equipment_checks).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Object.entries(visitDetail.equipment_checks).map(([k, v]: [string, any], idx) => (
                      <div key={idx} className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] font-black text-blue-900 uppercase tracking-tighter leading-tight mb-2 h-6 flex items-center">{k.replace(/_/g, ' ')}</span>
                        <span className="text-xl font-black text-blue-600">{v || 0}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center font-bold text-gray-400 uppercase text-xs tracking-widest">Cihaz kontrol verisi bulunmuyor</div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Görsel */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2"><ImageIcon size={16} className="text-purple-500" /> Saha Uygulama Kanıtı</h3>
                  {visitDetail.report_photo_url ? (
                    <div className="rounded-[40px] overflow-hidden shadow-2xl border-[12px] border-gray-50 cursor-zoom-in" onClick={() => setLightboxUrl(visitDetail.report_photo_url)}>
                      <img src={visitDetail.report_photo_url} className="w-full h-80 object-cover hover:scale-110 transition-all duration-1000" alt="Saha" />
                    </div>
                  ) : (
                    <div className="h-80 bg-gray-100 rounded-[40px] flex flex-col items-center justify-center text-gray-300 border-2 border-dashed uppercase text-[10px] font-black">Fotoğraf Bulunamadı</div>
                  )}
                </div>
                {/* Notlar */}
                <div className="space-y-6">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2"><Info size={16} className="text-amber-500" /> Açıklamalar</h3>
                  <div className="p-6 bg-amber-50/40 rounded-3xl border border-amber-100 italic text-sm text-gray-700 leading-relaxed shadow-inner">
                    "{visitDetail.notes || visitDetail.aciklama || 'Raporla ilgili ek not girilmemiş.'}"
                  </div>
                  {visitDetail.musteri_aciklamasi && <div className="p-5 bg-green-50/50 rounded-2xl border border-green-100 text-xs font-medium"><span className="font-black text-green-700 uppercase text-[9px] block mb-1 tracking-widest">Müşteri Açıklaması:</span>{visitDetail.musteri_aciklamasi}</div>}
                  {visitDetail.yonetici_notu && <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs font-medium"><span className="font-black text-indigo-700 uppercase text-[9px] block mb-1 tracking-widest">Yönetici Geri Bildirimi:</span>{visitDetail.yonetici_notu}</div>}
                </div>
              </div>

              {/* Maliyet Tablosu */}
              <div>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><Receipt size={16} className="text-emerald-500" /> Ücretli Malzeme & Operasyon Maliyeti</h3>
                {visitDetail.paid_materials.length > 0 ? (
                  <div className="border border-gray-100 rounded-[30px] overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-900 text-white uppercase text-[9px] tracking-widest">
                        <tr><th className="p-5 font-black">Malzeme Adı</th><th className="p-5 font-black text-center">Miktar</th><th className="p-5 font-black text-right pr-10">Tutar</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {visitDetail.paid_materials.map((m, i) => (
                          <tr key={i} className="font-bold text-gray-700">
                            <td className="p-5">{m.material_name}</td>
                            <td className="p-5 text-center"><span className="bg-gray-100 px-3 py-1 rounded-full">{m.quantity} ADET</span></td>
                            <td className="p-5 text-right pr-10 font-black text-emerald-600">{m.total_price.toFixed(2)} ₺</td>
                          </tr>
                        ))}
                        <tr className="bg-emerald-50/50 italic"><td colSpan={2} className="p-6 text-right font-black text-gray-900 uppercase text-xs tracking-widest">Genel Operasyon Maliyeti</td><td className="p-6 text-right pr-10 font-black text-2xl text-emerald-700">{visitDetail.paid_materials.reduce((s, m) => s + m.total_price, 0).toFixed(2)} ₺</td></tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-10 bg-gray-50 border-2 border-dashed rounded-[30px] text-center italic text-gray-400 font-bold uppercase text-xs">Faturalandırılacak malzeme kullanımı saptanmamıştır.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX (Tam Ekran Fotoğraf) */}
      {lightboxUrl && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-300" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-10 right-10 text-white/40 hover:text-white transition-all"><X size={64} /></button>
          <img src={lightboxUrl} className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain shadow-white/5" alt="Büyük Görsel" />
        </div>
      )}

      {/* Detay Yükleniyor Overlay */}
      {detailLoading && (
        <div className="fixed inset-0 bg-black/20 z-[110] flex items-center justify-center backdrop-blur-[2px]">
          <Loader2 className="animate-spin text-green-600" size={64} strokeWidth={4} />
        </div>
      )}
    </div>
  );
}