import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, CheckCircle, Clock, AlertCircle, LogOut, FileText, 
  Shield, Search, Download, X, User, Building, Loader2, Info, 
  ChevronLeft, ChevronRight, Eye, Activity, ClipboardList, 
  Bug, Receipt, Image as ImageIcon, CheckSquare
} from 'lucide-react';
import { BRAND_GREEN, LOGO_URL } from '../../constants';
import { supabase } from '../../lib/supabase';
import type { AuthUser } from '../../hooks/useAuth';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// --- Gelişmiş Arayüz Tanımlamaları ---
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
  pest_types: string[] | string | null; // CSV'den gelen haşere türleri
  report_photo_url: string | null; // CSV'den gelen rapor fotoğrafı
  is_invoiced: boolean | null; // Fatura durumu
  invoice_number: string | null;
  equipment_checks: any | null; // Ekipman kontrolleri
  musteri_aciklamasi: string | null;
  yonetici_notu: string | null;
  customers?: { kisa_isim?: string; cari_isim?: string };
  branches?: { sube_adi?: string };
  operator?: { name?: string };
}

// --- Bileşenler ---

const PestBadge = ({ type }: { type: string }) => (
  <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[10px] font-bold uppercase flex items-center gap-1">
    <Bug size={10} /> {type.replace(/"/g, '')}
  </span>
);

const VisitCard = ({ visit, onViewDetails }: { visit: Visit; onViewDetails: (visitId: string) => void }) => {
  const statusConfig = {
    planned: { color: 'bg-amber-500', text: 'Planlandı' },
    completed: { color: 'bg-emerald-500', text: 'Tamamlandı' },
    cancelled: { color: 'bg-rose-500', text: 'İptal' },
    in_progress: { color: 'bg-blue-500', text: 'Devam Ediyor' },
  };

  // CSV'deki pest_types verisini parse etme
  const pests = useMemo(() => {
    if (!visit.pest_types) return [];
    try {
      return typeof visit.pest_types === 'string' ? JSON.parse(visit.pest_types) : visit.pest_types;
    } catch { return []; }
  }, [visit.pest_types]);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden group">
      <div className="flex flex-col md:flex-row">
        {/* Sol Tarafta Görsel Kanıt (Eğer varsa) */}
        <div className="md:w-48 w-full h-48 md:h-auto bg-gray-100 relative overflow-hidden">
          {visit.report_photo_url ? (
            <img src={visit.report_photo_url} alt="Rapor" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
              <ImageIcon size={32} />
              <span className="text-[10px] font-bold mt-2">GÖRSEL YOK</span>
            </div>
          )}
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-lg ${statusConfig[visit.status]?.color || 'bg-gray-500'}`}>
            {statusConfig[visit.status]?.text.toUpperCase()}
          </div>
        </div>

        {/* İçerik Alanı */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-black text-xl text-gray-900 leading-tight">
                {visit.branches?.sube_adi || visit.customers?.kisa_isim || 'MERKEZ ŞUBE'}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-sm font-bold text-gray-400">
                <Calendar size={14} className="text-green-600" />
                {format(new Date(visit.visit_date), 'dd MMMM yyyy, HH:mm', { locale: tr })}
              </div>
            </div>
            {visit.is_invoiced && (
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100" title={`Fatura No: ${visit.invoice_number}`}>
                <Receipt size={14} />
                <span className="text-[10px] font-black underline uppercase">Faturalı</span>
              </div>
            )}
          </div>

          {/* Dinamik Zararlı Türleri */}
          <div className="flex flex-wrap gap-2 mb-6">
            {pests.length > 0 ? pests.map((p: string, i: number) => <PestBadge key={i} type={p} />) : (
              <span className="text-[10px] font-bold text-gray-400 uppercase italic">Zararlı Tespiti Yapılmadı</span>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Operatör</p>
              <p className="text-xs font-bold text-gray-700 truncate">{visit.operator?.name || 'BELİRTİLMEDİ'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Rapor No</p>
              <p className="text-xs font-mono font-black text-green-700">{visit.report_number || visit.rapor_no || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Ekipman Kontrol</p>
              <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <CheckSquare size={12} className="text-blue-500" /> 
                {visit.equipment_checks ? Object.keys(visit.equipment_checks).length : 0} Adet
              </p>
            </div>
            <button 
              onClick={() => onViewDetails(visit.id)}
              className="bg-gray-900 text-white rounded-2xl p-2 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
            >
              <Eye size={16} />
              <span className="text-[10px] font-black">DETAY</span>
            </button>
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
  const [totalVisits, setTotalVisits] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ searchTerm: '', status: '', startDate: '', endDate: '' });
  const itemsPerPage = 10;

  useEffect(() => { loadVisits(); }, [user, filters, currentPage]);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from('visits')
        .select('*, customers(kisa_isim), branches(sube_adi), operator:operator_id(name)', { count: 'exact' });

      // Güvenlik Kısıtlamaları
      if (user.customer_id) {
        const { data: b } = await supabase.from('branches').select('id').eq('customer_id', user.customer_id);
        const bIds = b?.map(x => x.id) || [];
        query = bIds.length > 0 
          ? query.or(`customer_id.eq.${user.customer_id},branch_id.in.(${bIds.join(',')})`)
          : query.eq('customer_id', user.customer_id);
      }

      // Dinamik Filtreleme
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.searchTerm) query = query.or(`report_number.ilike.%${filters.searchTerm}%,rapor_no.ilike.%${filters.searchTerm}%,notes.ilike.%${filters.searchTerm}%`);

      const { data, error, count } = await query.order('visit_date', { ascending: false }).range(from, to);
      if (error) throw error;
      setVisits(data || []);
      setTotalVisits(count || 0);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900">
      {/* Header Bölümü */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <img src={LOGO_URL} alt="Logo" className="h-10" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-black tracking-tighter leading-none">AKILLI TAKİP SİSTEMİ</h1>
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{user.customer_name}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onLogout} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors"><LogOut size={20} /></button>
        </div>
      </header>

      {/* Menü */}
      <div className="bg-white border-b border-gray-50 flex gap-4 px-6 overflow-x-auto no-scrollbar">
        {['documents', 'visits', 'calendar', 'msds'].map(m => (
          <button key={m} onClick={() => onNavigate(m as any)} className={`py-4 text-xs font-black uppercase tracking-widest transition-all border-b-4 ${m === 'visits' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-300'}`}>
            {m}
          </button>
        ))}
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-wrap justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-gray-900">Ziyaret Geçmişi</h2>
            <p className="text-gray-400 font-medium mt-2">Sistemde toplam <span className="text-gray-900 font-bold">{totalVisits}</span> kayıtlı operasyon bulunuyor.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                placeholder="Rapor veya notlarda ara..." 
                className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-green-500 outline-none w-64 transition-all"
                onChange={e => setFilters({...filters, searchTerm: e.target.value})}
              />
            </div>
            <button className="px-6 py-3 bg-green-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center gap-2">
              <Download size={18} /> EXCEL
            </button>
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="grid gap-6">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-3xl" />)}
          </div>
        ) : (
          <div className="grid gap-8">
            {visits.map(v => <VisitCard key={v.id} visit={v} onViewDetails={setSelectedVisitId} />)}
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div className="mt-16 flex justify-center items-center gap-8">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-4 bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md disabled:opacity-20"><ChevronLeft /></button>
            <span className="font-black text-gray-900 uppercase text-sm tracking-widest">SAYFA {currentPage}</span>
            <button disabled={currentPage * itemsPerPage >= totalVisits} onClick={() => setCurrentPage(p => p + 1)} className="p-4 bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md disabled:opacity-20"><ChevronRight /></button>
          </div>
        )}
      </main>

      {/* Detay Modalı Buraya Gelecek */}
    </div>
  );
}