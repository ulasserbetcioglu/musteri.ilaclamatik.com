import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, CheckCircle, Clock, AlertCircle, LogOut, FileText, 
  Shield, Search, Download, X, User, Building, Loader2, Info, 
  ChevronLeft, ChevronRight, Eye, Bug, Receipt, Image as ImageIcon, CheckSquare
} from 'lucide-react';
import { BRAND_GREEN, LOGO_URL } from '../../constants';
import { supabase } from '../../lib/supabase';
import type { AuthUser } from '../../hooks/useAuth';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

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
  pest_types: string[] | string | null;
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

const VisitCard = ({ visit, onViewDetails }: { visit: Visit; onViewDetails: (visitId: string) => void }) => {
  const statusConfig: any = {
    planned: { icon: Clock, color: 'border-yellow-500 bg-yellow-50', textColor: 'text-yellow-700', text: 'Planlandı' },
    completed: { icon: CheckCircle, color: 'border-green-500 bg-green-50', textColor: 'text-green-700', text: 'Tamamlandı' },
    cancelled: { icon: X, color: 'border-red-500 bg-red-50', textColor: 'text-red-700', text: 'İptal Edildi' },
    in_progress: { icon: Clock, color: 'border-blue-500 bg-blue-50', textColor: 'text-blue-700', text: 'Devam Ediyor' },
  };

  const currentStatus = statusConfig[visit.status] || { icon: Info, color: 'border-gray-500 bg-gray-50', textColor: 'text-gray-700', text: 'Bilinmiyor' };
  const Icon = currentStatus.icon;

  const pests = useMemo(() => {
    if (!visit.pest_types) return [];
    try { return typeof visit.pest_types === 'string' ? JSON.parse(visit.pest_types) : visit.pest_types; } catch { return []; }
  }, [visit.pest_types]);

  return (
    <div className={`p-5 rounded-xl shadow-lg bg-white border-l-4 ${currentStatus.color} hover:shadow-xl transition-all`}>
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div className="flex gap-4">
          {visit.report_photo_url && (
            <img src={visit.report_photo_url} className="w-16 h-16 rounded-lg object-cover border shadow-sm" alt="Rapor" />
          )}
          <div>
            <p className="font-bold text-lg text-gray-800">
              {visit.branches?.sube_adi || visit.customers?.kisa_isim || 'Genel Merkez'}
            </p>
            <p className="text-sm text-gray-500">{format(new Date(visit.visit_date), 'dd MMMM yyyy, HH:mm', { locale: tr })}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${currentStatus.color} ${currentStatus.textColor}`}>
          <Icon size={14} /> {currentStatus.text}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {pests.map((p: string, i: number) => (
          <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <Bug size={10} /> {p}
          </span>
        ))}
        {visit.is_invoiced && (
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <Receipt size={10} /> FATURALANDI ({visit.invoice_number})
          </span>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase">Operatör</p>
          <p className="flex items-center gap-2 mt-1 font-medium"><User size={14} /> {visit.operator?.name || 'Atanmadı'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase">Rapor No</p>
          <p className="flex items-center gap-2 mt-1 font-mono font-bold text-green-700"><FileText size={14} /> {visit.report_number || visit.rapor_no || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase">Ekipman</p>
          <p className="flex items-center gap-2 mt-1 font-medium"><CheckSquare size={14} /> {visit.equipment_checks ? Object.keys(visit.equipment_checks).length : 0} Kontrol</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
        <button onClick={() => onViewDetails(visit.id)} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold">
          <Eye size={16} /> Detaylı İncele
        </button>
      </div>
    </div>
  );
};

const VisitDetailModal = ({ visitId, onClose }: { visitId: string; onClose: () => void }) => {
  const [visitDetail, setVisitDetail] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data: v } = await supabase.from('visits').select('*, customers(kisa_isim), branches(sube_adi), operator:operator_id(name)').eq('id', visitId).maybeSingle();
        const { data: s } = await supabase.from('paid_material_sales').select('id').eq('visit_id', visitId);
        
        let materials: any[] = [];
        if (s && s.length > 0) {
          const { data: m } = await supabase.from('paid_material_sale_items').select('*, product:product_id(name)').in('sale_id', s.map(x => x.id));
          materials = m?.map(item => ({ id: item.id, material_name: item.product?.name || 'Ürün', quantity: item.quantity, unit_price: item.unit_price, total_price: item.total_price })) || [];
        }
        setVisitDetail({ ...v, paid_materials: materials });
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchDetail();
  }, [visitId]);

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8"><Loader2 className="animate-spin text-green-600" size={32} /></div>
    </div>
  );

  if (!visitDetail) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl my-8 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Ziyaret Rapor Detayı</h2>
            <p className="text-xs text-green-600 font-bold uppercase mt-1">Sistem Kayıt No: {visitDetail.id.slice(0,8)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-medium">
            <div className="bg-gray-50 p-3 rounded-lg border">
              <p className="text-gray-400 text-[10px] uppercase font-bold mb-1">Uygulama Alanı</p>
              {visitDetail.branches?.sube_adi || 'Genel Merkez'}
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border">
              <p className="text-gray-400 text-[10px] uppercase font-bold mb-1">Ziyaret Tarihi</p>
              {format(new Date(visitDetail.visit_date), 'dd.MM.yyyy HH:mm')}
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border">
              <p className="text-gray-400 text-[10px] uppercase font-bold mb-1">Sorumlu Operatör</p>
              {visitDetail.operator?.name || '-'}
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border">
              <p className="text-gray-400 text-[10px] uppercase font-bold mb-1">Resmi Rapor No</p>
              <span className="font-mono text-green-700 font-bold">{visitDetail.report_number || visitDetail.rapor_no || '-'}</span>
            </div>
          </div>

          {visitDetail.report_photo_url && (
            <div className="space-y-2">
              <h3 className="font-bold text-gray-700 flex items-center gap-2"><ImageIcon size={18} className="text-blue-500"/> Saha Uygulama Fotoğrafı</h3>
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <img src={visitDetail.report_photo_url} className="w-full h-72 object-contain bg-black" alt="Saha Fotoğrafı" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-bold border-b pb-2 flex items-center gap-2 text-gray-800"><Info size={18} className="text-blue-500"/> Operasyon Notları</h3>
              <div className="text-sm text-gray-600 bg-blue-50/30 p-4 rounded-lg italic leading-relaxed border border-blue-100">
                "{visitDetail.notes || visitDetail.aciklama || 'Operatör notu bulunmuyor.'}"
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold border-b pb-2 flex items-center gap-2 text-gray-800"><AlertCircle size={18} className="text-rose-500"/> Geri Bildirimler</h3>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg border">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">Yönetici Notu</p>
                   <p className="text-sm text-gray-700">{visitDetail.yonetici_notu || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">Müşteri Açıklaması</p>
                   <p className="text-sm text-gray-700">{visitDetail.musteri_aciklamasi || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold border-b pb-2 flex items-center gap-2 text-gray-800"><Receipt size={18} className="text-green-500"/> Kullanılan Malzeme ve Maliyet Tablosu</h3>
            {visitDetail.paid_materials.length > 0 ? (
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 uppercase text-[10px] text-gray-500">
                    <tr>
                      <th className="p-3">Malzeme Adı</th>
                      <th className="p-3 text-center">Miktar</th>
                      <th className="p-3 text-right">Birim Fiyat</th>
                      <th className="p-3 text-right">Toplam (KDV Dahil)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {visitDetail.paid_materials.map((m, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-700">{m.material_name}</td>
                        <td className="p-3 text-center font-bold">{m.quantity} Adet</td>
                        <td className="p-3 text-right">{m.unit_price.toFixed(2)} ₺</td>
                        <td className="p-3 text-right font-bold text-green-600">{m.total_price.toFixed(2)} ₺</td>
                      </tr>
                    ))}
                    <tr className="bg-green-50/50">
                      <td colSpan={3} className="p-4 text-right font-black text-gray-800 text-sm uppercase tracking-wider">Genel Toplam</td>
                      <td className="p-4 text-right font-black text-green-700 text-lg">
                        {visitDetail.paid_materials.reduce((sum, m) => sum + m.total_price, 0).toFixed(2)} ₺
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm italic">
                Bu ziyaret kapsamında faturalandırılan ek malzeme kullanımı bulunmamaktadır.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export function VisitsPage({ user, onLogout, onNavigate }: VisitsPageProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ searchTerm: '', status: '', startDate: '', endDate: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 15;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        
        let query = supabase.from('visits').select('*, customers(kisa_isim), branches(sube_adi), operator:operator_id(name)', { count: 'exact' });

        if (user.customer_id) {
          const { data: b } = await supabase.from('branches').select('id').eq('customer_id', user.customer_id);
          const bIds = b?.map(x => x.id) || [];
          query = bIds.length > 0 ? query.or(`customer_id.eq.${user.customer_id},branch_id.in.(${bIds.join(',')})`) : query.eq('customer_id', user.customer_id);
        } else if (user.branch_id) {
          query = query.eq('branch_id', user.branch_id);
        }

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.searchTerm) query = query.or(`report_number.ilike.%${filters.searchTerm}%,rapor_no.ilike.%${filters.searchTerm}%,notes.ilike.%${filters.searchTerm}%`);
        
        const { data, count, error } = await query.order('visit_date', { ascending: false }).range(from, to);
        if (error) throw error;

        setVisits(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, filters, currentPage]);

  const exportExcel = () => {
    const data = visits.map(v => ({
      Tarih: format(new Date(v.visit_date), 'dd.MM.yyyy'),
      Şube: v.branches?.sube_adi || 'Merkez',
      Operatör: v.operator?.name || '-',
      Durum: v.status,
      'Rapor No': v.report_number || v.rapor_no || '-',
      Fatura: v.is_invoiced ? 'Evet' : 'Hayır'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ziyaretler");
    XLSX.writeFile(wb, `Ziyaret_Gecmisi_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Orijinal Header ve Menü Yapısı */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Logo" className="h-10" />
            <h1 className="text-xl font-semibold" style={{ color: BRAND_GREEN }}>Ziyaretler</h1>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-medium transition-colors">
            <LogOut size={18} /> Çıkış Yap
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex gap-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'documents', label: 'Belgeler', icon: FileText },
            { id: 'visits', label: 'Ziyaretler', icon: Calendar },
            { id: 'calendar', label: 'Takvim', icon: Clock },
            { id: 'msds', label: 'Ruhsat & MSDS', icon: Shield },
          ].map(p => (
            <button 
              key={p.id} 
              onClick={() => onNavigate(p.id as any)} 
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${p.id === 'visits' ? 'border-green-600 text-green-700 bg-green-50' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
            >
              <p.icon size={16} /> {p.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight text-shadow-sm">Ziyaret Geçmişi</h2>
            <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-widest">Sistemde {totalCount} kayıtlı operasyon listeleniyor</p>
          </div>
          <button onClick={exportExcel} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-green-700 transition-all active:scale-95">
            <Download size={20}/> EXCEL AKTAR
          </button>
        </div>

        {/* Gelişmiş Filtreleme */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 border border-gray-100">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rapor no, notlar veya açıklamalarda ara..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium" 
              onChange={e => setFilters({...filters, searchTerm: e.target.value})} 
            />
          </div>
          <select className="p-2 border rounded-lg bg-gray-50 font-bold text-gray-700 outline-none" onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">Tüm Durumlar</option>
            <option value="completed">Tamamlandı</option>
            <option value="planned">Planlandı</option>
            <option value="cancelled">İptal Edildi</option>
            <option value="in_progress">Devam Ediyor</option>
          </select>
        </div>

        {/* Dinamik Liste Bölümü */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-green-600 mb-4" size={48} />
            <p className="text-gray-400 font-bold animate-pulse">VERİLER ÇEKİLİYOR...</p>
          </div>
        ) : visits.length === 0 ? (
          <div className="bg-white border-2 border-dashed rounded-2xl py-20 text-center">
            <Info size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Kayıtlı ziyaret bulunamadı</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {visits.map(v => <VisitCard key={v.id} visit={v} onViewDetails={setSelectedVisitId} />)}
          </div>
        )}

        {/* Orijinal Sayfalama Yapısı */}
        {!loading && totalCount > itemsPerPage && (
          <div className="mt-10 flex justify-center items-center gap-6">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              className="p-3 bg-white border rounded-full hover:bg-gray-100 disabled:opacity-30 shadow-sm transition-all"
            >
              <ChevronLeft size={20}/>
            </button>
            <div className="bg-white px-6 py-2 rounded-full border shadow-sm">
              <span className="font-black text-gray-700 text-sm tracking-widest uppercase">Sayfa {currentPage} / {Math.ceil(totalCount / itemsPerPage)}</span>
            </div>
            <button 
              disabled={currentPage * itemsPerPage >= totalCount} 
              onClick={() => setCurrentPage(p => p + 1)} 
              className="p-3 bg-white border rounded-full hover:bg-gray-100 disabled:opacity-30 shadow-sm transition-all"
            >
              <ChevronRight size={20}/>
            </button>
          </div>
        )}
      </main>

      {/* Dinamik Detay Modalı */}
      {selectedVisitId && <VisitDetailModal visitId={selectedVisitId} onClose={() => setSelectedVisitId(null)} />}
    </div>
  );
}