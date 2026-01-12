import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, Filter, LogOut, FileText, Shield, Search, Download, X, User, Building, Loader2, Info, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
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
  customer_name?: string;
  branch_name?: string;
  operator_name?: string;
  customers?: { kisa_isim?: string; cari_isim?: string };
  branches?: { sube_adi?: string };
  operator?: { name?: string };
}

interface VisitDetail {
  id: string;
  visit_date: string;
  status: string;
  visit_type: string | null;
  report_number: string | null;
  notes: string | null;
  yogunluk: string | null;
  aciklama: string | null;
  branch: { sube_adi: string } | null;
  operator: { name: string } | null;
  customer: { kisa_isim?: string; cari_isim?: string } | null;
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
  const statusConfig = {
    planned: { icon: Clock, color: 'border-yellow-500 bg-yellow-50', textColor: 'text-yellow-700', text: 'Planlandı' },
    completed: { icon: CheckCircle, color: 'border-green-500 bg-green-50', textColor: 'text-green-700', text: 'Tamamlandı' },
    cancelled: { icon: X, color: 'border-red-500 bg-red-50', textColor: 'text-red-700', text: 'İptal Edildi' },
    in_progress: { icon: Clock, color: 'border-blue-500 bg-blue-50', textColor: 'text-blue-700', text: 'Devam Ediyor' },
  };
  const currentStatus = statusConfig[visit.status] || { icon: Info, color: 'border-gray-500 bg-gray-50', textColor: 'text-gray-700', text: 'Bilinmiyor' };
  const Icon = currentStatus.icon;

  return (
    <div className={`p-5 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white border-l-4 ${currentStatus.color}`}>
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <p className="font-bold text-lg text-gray-800">
            {visit.branches?.sube_adi || visit.branch_name || visit.customers?.kisa_isim || visit.customers?.cari_isim || visit.customer_name || 'Genel Merkez'}
          </p>
          <p className="text-sm text-gray-500">{format(new Date(visit.visit_date), 'dd MMMM yyyy, HH:mm', { locale: tr })}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${currentStatus.color} ${currentStatus.textColor}`}>
          <Icon size={14} />
          {currentStatus.text}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-400 font-semibold">OPERATÖR</p>
          <p className="flex items-center gap-2 mt-1"><User size={14} /> {visit.operator?.name || visit.operator_name || 'Atanmadı'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-semibold">ZİYARET TÜRÜ</p>
          <p className="mt-1">{visit.visit_type || 'Belirtilmemiş'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-semibold">RAPOR NO</p>
          <p className="flex items-center gap-2 mt-1 font-mono"><FileText size={14} /> {visit.report_number || '-'}</p>
        </div>
      </div>
      {(visit.notes || visit.aciklama) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 font-semibold">NOTLAR</p>
          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded-md">{visit.notes || visit.aciklama}</p>
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
        <button
          onClick={() => onViewDetails(visit.id)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
        >
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
    const fetchVisitDetail = async () => {
      try {
        setLoading(true);
        const { data: visitData, error: visitError } = await supabase
          .from('visits')
          .select(`
            id,
            visit_date,
            status,
            visit_type,
            report_number,
            notes,
            yogunluk,
            aciklama,
            branch:branch_id(sube_adi),
            operator:operator_id(name),
            customer:customer_id(kisa_isim, cari_isim)
          `)
          .eq('id', visitId)
          .maybeSingle();

        if (visitError) throw visitError;

        const { data: salesData } = await supabase
          .from('paid_material_sales')
          .select('id')
          .eq('visit_id', visitId);

        let materialsData: any[] = [];

        if (salesData && salesData.length > 0) {
          const saleIds = salesData.map(s => s.id);
          const { data: itemsData } = await supabase
            .from('paid_material_sale_items')
            .select('id, quantity, unit_price, total_price, product_id')
            .in('sale_id', saleIds);

          if (itemsData) {
            materialsData = await Promise.all(
              itemsData.map(async (item) => {
                const { data: product } = await supabase
                  .from('paid_products')
                  .select('name')
                  .eq('id', item.product_id)
                  .maybeSingle();
                return {
                  id: item.id,
                  material_name: product?.name || 'Bilinmeyen Ürün',
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                  total_price: item.total_price
                };
              })
            );
          }
        }

        setVisitDetail({
          ...visitData,
          paid_materials: materialsData
        });
      } catch (err: any) {
        console.error('Detaylar yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVisitDetail();
  }, [visitId]);

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8"><Loader2 className="animate-spin text-green-600" size={32} /></div>
    </div>
  );

  if (!visitDetail) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Ziyaret Detayları</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={24} /></button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">ŞUBE / MÜŞTERİ</p>
              <p className="text-lg font-semibold">{visitDetail.branch?.sube_adi || visitDetail.customer?.kisa_isim || 'Genel Merkez'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">TARİH</p>
              <p className="text-lg font-semibold">{format(new Date(visitDetail.visit_date), 'dd MMMM yyyy, HH:mm', { locale: tr })}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">OPERATÖR</p>
              <p className="text-lg font-semibold">{visitDetail.operator?.name || 'Atanmadı'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">DURUM</p>
              <p className="text-lg font-semibold">
                {visitDetail.status === 'completed' ? 'Tamamlandı' : visitDetail.status === 'planned' ? 'Planlandı' : 'Devam Ediyor'}
              </p>
            </div>
          </div>
          {(visitDetail.notes || visitDetail.aciklama) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-2">NOTLAR</p>
              <p className="text-sm text-gray-700">{visitDetail.notes || visitDetail.aciklama}</p>
            </div>
          )}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Kullanılan Malzemeler</h3>
            {visitDetail.paid_materials.length > 0 ? (
              <div className="space-y-3">
                {visitDetail.paid_materials.map((m) => (
                  <div key={m.id} className="bg-green-50 p-4 rounded-lg border border-green-200 flex justify-between">
                    <div><p className="font-semibold">{m.material_name}</p><p className="text-sm text-gray-600">{m.quantity} Adet x {m.unit_price} ₺</p></div>
                    <p className="text-lg font-bold text-green-600">{m.total_price.toFixed(2)} ₺</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-center text-gray-500 py-4">Malzeme kaydı bulunamadı.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="p-5 rounded-xl shadow-lg bg-white animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-3 gap-4"><div className="h-10 bg-gray-200 rounded"></div><div className="h-10 bg-gray-200 rounded"></div><div className="h-10 bg-gray-200 rounded"></div></div>
      </div>
    ))}
  </div>
);

export function VisitsPage({ user, onLogout, onNavigate }: VisitsPageProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ searchTerm: '', status: '', startDate: '', endDate: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVisits, setTotalVisits] = useState(0);
  const itemsPerPage = 20;

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

      // GÜVENLİ FİLTRELEME MANTIĞI
      if (user.customer_id) {
        // Müşteri girişi: Kendi customer_id'si olan VEYA bağlı şubelerine ait olan tüm ziyaretler
        const { data: branchData } = await supabase.from('branches').select('id').eq('customer_id', user.customer_id);
        const branchIds = branchData?.map(b => b.id) || [];
        
        if (branchIds.length > 0) {
          query = query.or(`customer_id.eq.${user.customer_id},branch_id.in.(${branchIds.join(',')})`);
        } else {
          query = query.eq('customer_id', user.customer_id);
        }
      } else if (user.branch_id) {
        // Şube girişi: Sadece bu şubeye ait ziyaretler
        query = query.eq('branch_id', user.branch_id);
      } else if (user.id) {
        // Operatör girişi
        query = query.eq('operator_id', user.id);
      }

      if (filters.status) query = query.eq('status', filters.status);
      if (filters.startDate) query = query.gte('visit_date', filters.startDate);
      if (filters.endDate) query = query.lte('visit_date', filters.endDate);
      if (filters.searchTerm) {
        query = query.or(`notes.ilike.%${filters.searchTerm}%,aciklama.ilike.%${filters.searchTerm}%,report_number.ilike.%${filters.searchTerm}%`);
      }

      const { data, error, count } = await query.order('visit_date', { ascending: false }).range(from, to);

      if (error) throw error;
      setVisits(data || []);
      setTotalVisits(count || 0);
    } catch (err) {
      console.error('Ziyaretler yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      // Excel için tüm veriyi çek (sayfalamasız)
      let query = supabase.from('visits').select(`
        visit_date, status, visit_type, report_number, notes, aciklama,
        branches:branch_id(sube_adi),
        customers:customer_id(kisa_isim),
        operator:operator_id(name)
      `);
      
      if (user.customer_id) query = query.eq('customer_id', user.customer_id);
      else if (user.branch_id) query = query.eq('branch_id', user.branch_id);

      const { data } = await query;
      if (!data) return;

      const exportData = data.map((v: any) => ({
        'Tarih': format(new Date(v.visit_date), 'dd.MM.yyyy HH:mm'),
        'Müşteri/Şube': v.branches?.sube_adi || v.customers?.kisa_isim || 'Genel Merkez',
        'Operatör': v.operator?.name || '-',
        'Durum': v.status,
        'Rapor No': v.report_number || '-'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Ziyaretler');
      XLSX.writeFile(wb, `ziyaret_raporu_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    } catch (err) {
      console.error('Excel hatası:', err);
    }
  };

  const totalPages = Math.ceil(totalVisits / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Logo" className="h-10" />
            <h1 className="text-xl font-semibold" style={{ color: BRAND_GREEN }}>Ziyaretler</h1>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"><LogOut size={18} /> Çıkış</button>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex gap-4 overflow-x-auto">
          {['documents', 'visits', 'calendar', 'msds'].map((page) => (
            <button
              key={page}
              onClick={() => onNavigate(page as any)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                page === 'visits' ? 'border-green-600 text-green-700 bg-green-50' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {page.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Ziyaret Geçmişi</h2>
            <p className="text-gray-500">Toplam {totalVisits} kayıt listeleniyor</p>
          </div>
          <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-shadow"><Download size={18} /> Excel</button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative"><Search className="absolute left-3 top-2.5 text-gray-400" size={18} /><input type="text" placeholder="Ara..." className="w-full pl-10 pr-4 py-2 border rounded-lg" value={filters.searchTerm} onChange={e => setFilters({...filters, searchTerm: e.target.value})} /></div>
          <select className="border rounded-lg p-2" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">Tüm Durumlar</option>
            <option value="completed">Tamamlandı</option>
            <option value="planned">Planlandı</option>
            <option value="in_progress">Devam Ediyor</option>
          </select>
          <input type="date" className="border rounded-lg p-2" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
          <input type="date" className="border rounded-lg p-2" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
        </div>

        {loading ? <SkeletonLoader /> : visits.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">Kayıtlı ziyaret bulunamadı.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map(v => <VisitCard key={v.id} visit={v} onViewDetails={setSelectedVisitId} />)}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 border rounded-lg disabled:opacity-30"><ChevronLeft /></button>
                <span className="font-semibold text-gray-600">{currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 border rounded-lg disabled:opacity-30"><ChevronRight /></button>
              </div>
            )}
          </div>
        )}
      </div>
      {selectedVisitId && <VisitDetailModal visitId={selectedVisitId} onClose={() => setSelectedVisitId(null)} />}
    </div>
  );
}