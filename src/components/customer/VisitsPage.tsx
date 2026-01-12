import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, CheckCircle, Clock, AlertCircle, Filter, LogOut, FileText, 
  Shield, Search, Download, X, User, Building, Loader2, Info, 
  ChevronLeft, ChevronRight, Eye, TrendingUp, Activity, ClipboardList
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

// --- Operasyonel İstatistik Kartı ---
const StatsCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-md">
    <div className={`p-4 rounded-xl ${color} bg-opacity-10`}>
      <Icon className={color.replace('bg-', 'text-')} size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// --- Modern Ziyaret Kartı ---
const VisitCard = ({ visit, onViewDetails }: { visit: Visit; onViewDetails: (visitId: string) => void }) => {
  const statusConfig = {
    planned: { icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200', text: 'Planlandı' },
    completed: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700 border-emerald-200', text: 'Tamamlandı' },
    cancelled: { icon: X, color: 'bg-rose-100 text-rose-700 border-rose-200', text: 'İptal Edildi' },
    in_progress: { icon: Activity, color: 'bg-blue-100 text-blue-700 border-blue-200', text: 'Devam Ediyor' },
  };
  
  const currentStatus = statusConfig[visit.status] || { icon: Info, color: 'bg-gray-100 text-gray-700', text: 'Bilinmiyor' };
  const StatusIcon = currentStatus.icon;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-6 transition-all hover:border-green-200 hover:shadow-xl hover:-translate-y-1">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div className="flex gap-4">
          <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-green-50 transition-colors">
            <Building className="text-gray-400 group-hover:text-green-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              {visit.branches?.sube_adi || visit.customers?.kisa_isim || 'Genel Merkez'}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 font-medium">
              <Calendar size={14} className="text-green-600" />
              {format(new Date(visit.visit_date), 'dd MMMM yyyy, HH:mm', { locale: tr })}
            </div>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${currentStatus.color}`}>
          <StatusIcon size={14} />
          {currentStatus.text}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-50">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Saha Sorumlusu</span>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <User size={16} className="text-gray-400" />
            {visit.operator?.name || 'Atanmadı'}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hizmet Türü</span>
          <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <ClipboardList size={16} className="text-gray-400" />
            {visit.visit_type || 'Periyodik Kontrol'}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Rapor Numarası</span>
          <div className="text-sm font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded w-fit">
            {visit.report_number || 'Yükleniyor...'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
        <div className="flex gap-2">
          {visit.yogunluk && (
            <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded uppercase">
              Yüksek Yoğunluk Tespit Edildi
            </span>
          )}
        </div>
        <button
          onClick={() => onViewDetails(visit.id)}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-green-600 transition-all font-bold text-sm shadow-lg shadow-gray-200"
        >
          <Eye size={18} /> Detayları Gör
        </button>
      </div>
    </div>
  );
};

// --- Ana Sayfa Bileşeni ---
export function VisitsPage({ user, onLogout, onNavigate }: VisitsPageProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [totalVisits, setTotalVisits] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [filters, setFilters] = useState({
    searchTerm: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  // İstatistikleri hesapla (Sorgudan bağımsız client-side özet için)
  const stats = useMemo(() => {
    return {
      total: totalVisits,
      completed: visits.filter(v => v.status === 'completed').length,
      pending: visits.filter(v => v.status === 'planned' || v.status === 'in_progress').length,
      cancelled: visits.filter(v => v.status === 'cancelled').length
    };
  }, [visits, totalVisits]);

  useEffect(() => {
    loadVisits();
  }, [user, filters, currentPage]);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from('visits')
        .select(`
          *,
          customers (kisa_isim, cari_isim),
          branches (id, sube_adi, customer_id),
          operator:operator_id(name)
        `, { count: 'exact' });

      // Güvenlik: Kullanıcının kendi verisini görmesi
      if (user.customer_id) {
        const { data: branches } = await supabase.from('branches').select('id').eq('customer_id', user.customer_id);
        const branchIds = branches?.map(b => b.id) || [];
        if (branchIds.length > 0) {
          query = query.or(`customer_id.eq.${user.customer_id},branch_id.in.(${branchIds.join(',')})`);
        } else {
          query = query.eq('customer_id', user.customer_id);
        }
      } else if (user.branch_id) {
        query = query.eq('branch_id', user.branch_id);
      }

      // Filtreler
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.startDate) query = query.gte('visit_date', filters.startDate);
      if (filters.endDate) query = query.lte('visit_date', filters.endDate);
      if (filters.searchTerm) {
        query = query.or(`notes.ilike.%${filters.searchTerm}%,report_number.ilike.%${filters.searchTerm}%`);
      }

      const { data, error, count } = await query
        .order('visit_date', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setVisits(data || []);
      setTotalVisits(count || 0);
    } catch (err) {
      console.error('Veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    const data = visits.map(v => ({
      'Tarih': format(new Date(v.visit_date), 'dd.MM.yyyy'),
      'Şube': v.branches?.sube_adi || 'Genel Merkez',
      'Operatör': v.operator?.name || '-',
      'Hizmet': v.visit_type || 'İlaçlama',
      'Durum': v.status === 'completed' ? 'Tamamlandı' : 'Bekliyor',
      'Rapor No': v.report_number || '-'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Operasyon_Raporu');
    XLSX.writeFile(wb, `İlaçlama_Ziyaret_Raporu_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* --- Sticky Navbar --- */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <img src={LOGO_URL} alt="Logo" className="h-12 w-auto" />
              <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">OPERASYON PANELİ</h1>
                <p className="text-xs font-bold text-green-600 uppercase tracking-widest">{user.customer_name || 'Müşteri Portalı'}</p>
              </div>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100">
              <LogOut size={18} /> Çıkış Yap
            </button>
          </div>
        </div>
        
        {/* Alt Navigasyon Sekmeleri */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-50 flex gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'documents', label: 'Dökümanlar', icon: FileText },
            { id: 'visits', label: 'Ziyaretler', icon: Calendar },
            { id: 'calendar', label: 'Takvim', icon: Clock },
            { id: 'msds', label: 'Ruhsatlar', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                tab.id === 'visits' ? 'border-green-600 text-green-700 bg-green-50/50' : 'border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} /> {tab.label.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* --- İstatistik Bölümü --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatsCard title="Toplam İşlem" value={stats.total} icon={ClipboardList} color="bg-blue-600" />
          <StatsCard title="Tamamlanan" value={stats.completed} icon={CheckCircle} color="bg-emerald-600" />
          <StatsCard title="Bekleyen" value={stats.pending} icon={Clock} color="bg-amber-600" />
          <StatsCard title="İptal Edilen" value={stats.cancelled} icon={AlertCircle} color="bg-rose-600" />
        </div>

        {/* --- Filtreleme Çubuğu --- */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[280px]">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Arama</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rapor no veya notlarda ara..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 font-medium text-sm transition-all"
                value={filters.searchTerm}
                onChange={e => setFilters(f => ({...f, searchTerm: e.target.value}))}
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Durum</label>
            <select 
              className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 font-bold text-sm"
              value={filters.status}
              onChange={e => setFilters(f => ({...f, status: e.target.value}))}
            >
              <option value="">Tüm Durumlar</option>
              <option value="completed">Tamamlandı</option>
              <option value="planned">Bekliyor</option>
              <option value="cancelled">İptal</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportToExcel}
              className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
            >
              <Download size={18} /> Excel
            </button>
          </div>
        </div>

        {/* --- Liste Bölümü --- */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-white animate-pulse rounded-3xl border border-gray-100"></div>)}
          </div>
        ) : visits.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[40px] shadow-sm border-2 border-dashed border-gray-100">
            <Activity className="w-20 h-20 text-gray-100 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-400">Veri Bulunamadı</h3>
            <p className="text-gray-400 mt-2">Kriterlerinize uygun bir operasyon kaydı yok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visits.map(visit => <VisitCard key={visit.id} visit={visit} onViewDetails={setSelectedVisitId} />)}
          </div>
        )}

        {/* --- Sayfalama --- */}
        {!loading && totalVisits > itemsPerPage && (
          <div className="mt-12 flex justify-center items-center gap-6">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="font-black text-gray-900">SAYFA {currentPage} / {Math.ceil(totalVisits / itemsPerPage)}</span>
            <button 
              disabled={currentPage >= Math.ceil(totalVisits / itemsPerPage)}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </main>

      {/* --- Gelişmiş Detay Modalı --- */}
      {selectedVisitId && (
        <VisitDetailModalWrapper visitId={selectedVisitId} onClose={() => setSelectedVisitId(null)} />
      )}
    </div>
  );
}

// --- Detay Modalı Sarmalayıcısı (Yeni Geliştirilmiş Tasarım) ---
const VisitDetailModalWrapper = ({ visitId, onClose }: { visitId: string; onClose: () => void }) => {
  const [data, setData] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: v } = await supabase.from('visits').select(`*, customers(*), branches(*), operator:operator_id(*)`).eq('id', visitId).single();
      const { data: m } = await supabase.from('paid_material_sale_items').select('*, paid_products(name)').in('sale_id', (await supabase.from('paid_material_sales').select('id').eq('visit_id', visitId)).data?.map(s => s.id) || []);
      
      setData({
        ...v,
        paid_materials: m?.map(item => ({
          id: item.id,
          material_name: item.paid_products?.name || 'Ürün',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        })) || []
      });
      setLoading(false);
    };
    fetch();
  }, [visitId]);

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">HİZMET DETAYLARI</h2>
            <p className="text-sm font-bold text-green-600 mt-1 uppercase">Sistem Rapor Kayıtları</p>
          </div>
          <button onClick={onClose} className="p-4 bg-white rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="p-32 flex justify-center"><Loader2 className="animate-spin text-green-600" size={48} /></div>
        ) : data && (
          <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                { label: 'Hizmet Alanı', value: data.branches?.sube_adi || 'Genel Merkez', icon: Building },
                { label: 'Uygulama Tarihi', value: format(new Date(data.visit_date), 'dd.MM.yyyy HH:mm'), icon: Calendar },
                { label: 'Uygulayıcı', value: data.operator?.name || '-', icon: User },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <item.icon className="text-green-600 mb-3" size={24} />
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{item.label}</p>
                  <p className="text-lg font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mb-10">
              <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="text-green-600" size={20} /> OPERASYONEL ANALİZ & NOTLAR
              </h4>
              <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100 text-gray-700 font-medium leading-relaxed italic">
                "{data.notes || data.aciklama || 'Operatör tarafından detaylı not bırakılmamış.'}"
                {data.yogunluk && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-2xl text-xs font-black">KRİTİK UYARI: {data.yogunluk}</div>}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="text-green-600" size={20} /> KULLANILAN MATERYAL LİSTESİ
              </h4>
              {data.paid_materials.length > 0 ? (
                <div className="overflow-hidden border border-gray-100 rounded-3xl">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-900 text-white">
                      <tr>
                        <th className="p-4 text-xs font-black uppercase">Ürün Adı</th>
                        <th className="p-4 text-xs font-black uppercase text-center">Adet</th>
                        <th className="p-4 text-xs font-black uppercase text-right">Birim Fiyat</th>
                        <th className="p-4 text-xs font-black uppercase text-right">Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.paid_materials.map((m, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-bold text-gray-700">{m.material_name}</td>
                          <td className="p-4 text-center font-black text-gray-900">{m.quantity}</td>
                          <td className="p-4 text-right font-medium">{m.unit_price.toFixed(2)} ₺</td>
                          <td className="p-4 text-right font-black text-green-600">{m.total_price.toFixed(2)} ₺</td>
                        </tr>
                      ))}
                      <tr className="bg-green-50/50">
                        <td colSpan={3} className="p-4 text-right font-black text-gray-900">GENEL TOPLAM</td>
                        <td className="p-4 text-right font-black text-xl text-green-700">
                          {data.paid_materials.reduce((s, m) => s + m.total_price, 0).toFixed(2)} ₺
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 p-10 rounded-3xl text-center font-bold text-gray-400 border border-dashed">
                  Bu operasyon kapsamında ek materyal kullanımı raporlanmamıştır.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};