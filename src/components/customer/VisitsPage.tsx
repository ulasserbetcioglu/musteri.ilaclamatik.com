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
      {visit.yogunluk && (
        <div className="mt-2">
          <p className="text-xs text-gray-400 font-semibold">YOĞUNLUK</p>
          <p className="text-sm text-gray-600 mt-1">{visit.yogunluk}</p>
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

        const { data: salesData, error: salesError } = await supabase
          .from('paid_material_sales')
          .select('id')
          .eq('visit_id', visitId);

        if (salesError) throw salesError;

        let materialsData: any[] = [];

        if (salesData && salesData.length > 0) {
          const saleIds = salesData.map(s => s.id);

          const { data: itemsData, error: itemsError } = await supabase
            .from('paid_material_sale_items')
            .select(`
              id,
              quantity,
              unit_price,
              total_price,
              product_id
            `)
            .in('sale_id', saleIds);

          if (itemsError) throw itemsError;

          materialsData = await Promise.all(
            (itemsData || []).map(async (item) => {
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

        setVisitDetail({
          ...visitData,
          paid_materials: materialsData
        });
      } catch (err: any) {
        console.error('Detaylar yüklenirken hata:', err);
        alert(`Detaylar yüklenirken hata: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitDetail();
  }, [visitId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-2xl w-full">
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin" size={32} />
          </div>
        </div>
      </div>
    );
  }

  if (!visitDetail) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Ziyaret Detayları</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">ŞUBE</p>
              <p className="text-lg font-semibold">{visitDetail.branch?.sube_adi || visitDetail.customer?.kisa_isim || visitDetail.customer?.cari_isim || 'Genel Merkez'}</p>
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
              <p className="text-xs text-gray-500 font-semibold mb-1">ZİYARET TÜRÜ</p>
              <p className="text-lg font-semibold">{visitDetail.visit_type || 'Belirtilmemiş'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">RAPOR NO</p>
              <p className="text-lg font-semibold font-mono">{visitDetail.report_number || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">DURUM</p>
              <p className="text-lg font-semibold capitalize">
                {visitDetail.status === 'completed' ? 'Tamamlandı' : visitDetail.status === 'planned' ? 'Planlandı' : visitDetail.status === 'cancelled' ? 'İptal Edildi' : 'Devam Ediyor'}
              </p>
            </div>
          </div>

          {visitDetail.yogunluk && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-2">YOĞUNLUK</p>
              <p className="text-sm text-gray-700">{visitDetail.yogunluk}</p>
            </div>
          )}

          {(visitDetail.notes || visitDetail.aciklama) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-2">NOTLAR</p>
              <p className="text-sm text-gray-700">{visitDetail.notes || visitDetail.aciklama}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Kullanılan Ücretli Malzemeler</h3>
            {visitDetail.paid_materials.length > 0 ? (
              <div className="space-y-3">
                {visitDetail.paid_materials.map((material) => (
                  <div key={material.id} className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{material.material_name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-semibold">Adet:</span> {material.quantity} |
                          <span className="font-semibold ml-2">Birim Fiyat:</span> {material.unit_price.toFixed(2)} ₺
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Toplam</p>
                        <p className="text-lg font-bold text-green-600">{material.total_price.toFixed(2)} ₺</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="bg-gray-800 p-4 rounded-lg text-white flex justify-between items-center">
                  <p className="font-semibold">GENEL TOPLAM</p>
                  <p className="text-2xl font-bold">
                    {visitDetail.paid_materials.reduce((sum, m) => sum + m.total_price, 0).toFixed(2)} ₺
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Bu ziyarette ücretli malzeme kullanılmamış</p>
              </div>
            )}
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
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded-full w-24"></div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export function VisitsPage({ user, onLogout, onNavigate }: VisitsPageProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalVisits, setTotalVisits] = useState(0);

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
          customers (
            kisa_isim,
            cari_isim
          ),
          branches (
            sube_adi,
            customer_id
          ),
          operator:operator_id(name)
        `, { count: 'exact' });

      if (user.customer_id) {
        const { data: branchesData } = await supabase
          .from('branches')
          .select('id')
          .eq('customer_id', user.customer_id);

        const branchIds = branchesData?.map(b => b.id) || [];

        if (branchIds.length > 0) {
          query = query.or(`customer_id.eq.${user.customer_id},branch_id.in.(${branchIds.join(',')})`);
        } else {
          query = query.eq('customer_id', user.customer_id);
        }
      } else if (user.branch_id) {
        query = query.eq('branch_id', user.branch_id);
      } else if (user.id) {
        query = query.eq('operator_id', user.id);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.startDate) {
        query = query.gte('visit_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('visit_date', filters.endDate);
      }
      if (filters.searchTerm) {
        query = query.or(`branches.sube_adi.ilike.%${filters.searchTerm}%,operator.name.ilike.%${filters.searchTerm}%,notes.ilike.%${filters.searchTerm}%`);
      }

      query = query.order('visit_date', { ascending: false }).range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setVisits(data || []);
      setTotalVisits(count || 0);
    } catch (err) {
      console.error('Error loading visits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setCurrentPage(1);
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const exportToExcel = async () => {
    try {
      let query = supabase
        .from('visits')
        .select(`
          visit_date,
          status,
          visit_type,
          report_number,
          notes,
          aciklama,
          yogunluk,
          branches:branch_id(sube_adi, customer_id),
          operator:operator_id(name),
          customers:customer_id(kisa_isim, cari_isim)
        `)
        .order('visit_date', { ascending: false });

      if (user.customer_id) {
        const { data: branchesData } = await supabase
          .from('branches')
          .select('id')
          .eq('customer_id', user.customer_id);

        const branchIds = branchesData?.map(b => b.id) || [];

        if (branchIds.length > 0) {
          query = query.or(`customer_id.eq.${user.customer_id},branch_id.in.(${branchIds.join(',')})`);
        } else {
          query = query.eq('customer_id', user.customer_id);
        }
      } else if (user.branch_id) {
        query = query.eq('branch_id', user.branch_id);
      } else if (user.id) {
        query = query.eq('operator_id', user.id);
      }

      if (filters.status) query = query.eq('status', filters.status);
      if (filters.startDate) query = query.gte('visit_date', filters.startDate);
      if (filters.endDate) query = query.lte('visit_date', filters.endDate);

      const { data: allVisits, error } = await query;
      if (error) throw error;

      if (!allVisits || allVisits.length === 0) {
        alert('Dışa aktarılacak veri bulunamadı.');
        return;
      }

      const data = allVisits.map((visit: any) => ({
        'Tarih': format(new Date(visit.visit_date), 'dd.MM.yyyy HH:mm'),
        'Şube': visit.branches?.sube_adi || visit.customers?.kisa_isim || visit.customers?.cari_isim || 'Genel Merkez',
        'Operatör': visit.operator?.name || 'Atanmamış',
        'Tür': visit.visit_type || '-',
        'Durum': { planned: 'Planlandı', completed: 'Tamamlandı', cancelled: 'İptal Edildi', in_progress: 'Devam Ediyor' }[visit.status] || 'Bilinmiyor',
        'Rapor No': visit.report_number || '-',
        'Yoğunluk': visit.yogunluk || '-',
        'Notlar': visit.notes || visit.aciklama || ''
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Ziyaretler');
      XLSX.writeFile(wb, `ziyaret_raporu_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    } catch (err: any) {
      console.error("Excel'e aktarma hatası:", err);
      alert("Excel'e aktarma sırasında bir hata oluştu.");
    }
  };

  const totalPages = Math.ceil(totalVisits / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Logo" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-semibold" style={{ color: BRAND_GREEN }}>Ziyaretler</h1>
                <p className="text-sm text-gray-600">{user.customer_name || user.branch_name || 'Hoş geldiniz'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(), 'dd MMMM yyyy', { locale: tr })}</span>
              </div>
              <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 -mb-px">
            <button onClick={() => onNavigate('documents')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <FileText className="w-4 h-4" />
              Belgeler
            </button>
            <button onClick={() => onNavigate('visits')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-green-600 bg-green-50 text-green-700">
              <Calendar className="w-4 h-4" />
              Ziyaretler
            </button>
            <button onClick={() => onNavigate('calendar')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <Calendar className="w-4 h-4" />
              Takvim
            </button>
            <button onClick={() => onNavigate('msds')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <Shield className="w-4 h-4" />
              RUHSAT & MSDS
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Ziyaret Geçmişi</h2>
            <p className="text-sm text-gray-600 mt-1">Toplam {totalVisits} ziyaret bulundu</p>
          </div>
          <button onClick={exportToExcel} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors">
            <Download size={20} /> Excel'e Aktar
          </button>
        </header>

        <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Ara..."
                value={filters.searchTerm}
                onChange={e => handleFilterChange('searchTerm', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="w-full p-2 border rounded-lg bg-white">
              <option value="">Tüm Durumlar</option>
              <option value="planned">Planlandı</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal Edildi</option>
              <option value="in_progress">Devam Ediyor</option>
            </select>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => handleFilterChange('startDate', e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="Başlangıç Tarihi"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={e => handleFilterChange('endDate', e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="Bitiş Tarihi"
            />
          </div>
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : visits.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-lg shadow">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">Ziyaret Bulunamadı</h3>
            <p className="text-gray-500 mt-2">Seçtiğiniz kriterlere uygun ziyaret bulunamadı.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {visits.map(visit => (
                <VisitCard key={visit.id} visit={visit} onViewDetails={setSelectedVisitId} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} /> Önceki
                </button>
                <span className="text-sm font-semibold text-gray-600">
                  Sayfa {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedVisitId && (
        <VisitDetailModal visitId={selectedVisitId} onClose={() => setSelectedVisitId(null)} />
      )}
    </div>
  );
}