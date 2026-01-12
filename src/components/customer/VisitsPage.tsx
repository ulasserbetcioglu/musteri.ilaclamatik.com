import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, CheckCircle, Clock, AlertCircle, LogOut, FileText, 
  Shield, Search, Download, X, User, Building, Loader2, Info, 
  ChevronLeft, ChevronRight, Eye, Bug, Receipt, Image as ImageIcon, 
  CheckSquare, Maximize2 
} from 'lucide-react';
import { BRAND_GREEN, LOGO_URL } from '../../constants';
import { supabase } from '../../lib/supabase';
import type { AuthUser } from '../../hooks/useAuth';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// --- Veri Modelleri ---
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

// --- Alt Bileşen: Ziyaret Kartı ---
const VisitCard = ({ visit, onViewDetails }: { visit: Visit; onViewDetails: (id: string) => void }) => {
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

  return (
    <div className={`p-5 rounded-xl shadow-md bg-white border-l-4 ${currentStatus.color} hover:shadow-lg transition-all`}>
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div className="flex gap-4">
          {visit.report_photo_url && (
            <img src={visit.report_photo_url} className="w-16 h-16 rounded-lg object-cover border shadow-sm" alt="Rapor" />
          )}
          <div>
            <p className="font-bold text-lg text-gray-800">
              {visit.branches?.sube_adi || visit.customers?.kisa_isim || 'Genel Merkez'}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 font-medium">
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
          <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <Bug size={10} /> {p}
          </span>
        ))}
        {visit.is_invoiced && (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <Receipt size={10} /> FATURALANDI
          </span>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Operatör</p>
          <p className="flex items-center gap-2 mt-1 text-gray-700 font-semibold"><User size={14} /> {visit.operator?.name || 'Atanmadı'}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Rapor No</p>
          <p className="flex items-center gap-2 mt-1 font-mono font-bold text-green-700 italic underline">
            <FileText size={14} /> {visit.report_number || visit.rapor_no || '-'}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Ekipman Takibi</p>
          <p className="flex items-center gap-2 mt-1 text-gray-700 font-semibold">
            <CheckSquare size={14} className="text-blue-500" /> {visit.equipment_checks ? Object.keys(visit.equipment_checks).length : 0} Kontrol Noktası
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
        <button 
          onClick={() => onViewDetails(visit.id)} 
          className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-bold shadow-md active:scale-95"
        >
          <Eye size={16} /> Detaylı Raporu Aç
        </button>
      </div>
    </div>
  );
};

// --- Alt Bileşen: Detay Modalı ---
const VisitDetailModal = ({ visitId, onClose }: { visitId: string; onClose: () => void }) => {
  const [data, setData] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // Ana ziyaret verisi
        const { data: v, error: vErr } = await supabase
          .from('visits')
          .select('*, customers(kisa_isim), branches(sube_adi), operator:operator_id(name)')
          .eq('id', visitId)
          .maybeSingle();
        
        if (vErr) throw vErr;

        // Ücretli malzeme verisi
        const { data: s } = await supabase.from('paid_material_sales').select('id').eq('visit_id', visitId);
        let materials: any[] = [];
        if (s && s.length > 0) {
          const { data: m } = await supabase
            .from('paid_material_sale_items')
            .select('*, product:product_id(name)')
            .in('sale_id', s.map(x => x.id));
          materials = m?.map(i => ({ 
            id: i.id, 
            material_name: i.product?.name || 'Ürün', 
            quantity: i.quantity, 
            unit_price: i.unit_price, 
            total_price: i.total_price 
          })) || [];
        }

        setData({ ...v, paid_materials: materials });
      } catch (err) {
        console.error('Modal yükleme hatası:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [visitId]);

  if (loading) return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl flex flex-col items-center gap-4 shadow-2xl">
        <Loader2 className="animate-spin text-green-600" size={48} />
        <p className="font-bold text-gray-500 uppercase text-xs tracking-widest">Rapor Verileri Hazırlanıyor...</p>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-5xl my-auto shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-100">
              <ClipboardList size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">OPERASYON DETAYI</h2>
              <p className="text-[10px] font-bold text-green-600 uppercase mt-0.5 tracking-tighter">SİSTEM KAYDI: {data.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all border border-transparent hover:border-rose-100 group">
            <X size={28} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          {/* 1. Üst Özet Bilgiler */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Şube / Müşteri', val: data.branches?.sube_adi || 'Genel Merkez', icon: Building, color: 'text-blue-600' },
              { label: 'Ziyaret Zamanı', val: format(new Date(data.visit_date), 'dd.MM.yyyy HH:mm'), icon: Calendar, color: 'text-purple-600' },
              { label: 'Sorumlu Operatör', val: data.operator?.name || '-', icon: User, color: 'text-amber-600' },
              { label: 'Rapor No', val: data.report_number || data.rapor_no || '-', icon: FileText, color: 'text-emerald-600' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 shadow-sm transition-hover hover:bg-white">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                  <item.icon size={12} className={item.color} /> {item.label}
                </p>
                <p className="text-sm font-black text-gray-800 break-words">{item.val}</p>
              </div>
            ))}
          </div>

          {/* 2. Ekipman Kontrolleri (Açık Liste) */}
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckSquare size={16} className="text-blue-500" /> Cihaz Kontrol Dökümü
            </h3>
            {data.equipment_checks && Object.keys(data.equipment_checks).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(data.equipment_checks).map(([key, val]: [string, any], idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-blue-50/30 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors">
                    <span className="text-[11px] font-black text-blue-900 uppercase tracking-tighter leading-none pr-2">{key.replace(/_/g, ' ')}</span>
                    <span className="bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded-full font-black shadow-sm">{val || 0}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Bu ziyarette cihaz kontrolü yapılmadı.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* 3. Fotoğraf Alanı */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <ImageIcon size={16} className="text-purple-500" /> Uygulama Görseli
              </h3>
              {data.report_photo_url ? (
                <div className="relative group rounded-3xl overflow-hidden shadow-2xl border-8 border-gray-50 cursor-zoom-in" onClick={() => setLightboxUrl(data.report_photo_url)}>
                  <img src={data.report_photo_url} className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-1000" alt="Saha Görseli" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 size={32} className="text-white" />
                  </div>
                </div>
              ) : (
                <div className="h-80 bg-gray-50 rounded-3xl flex flex-col items-center justify-center text-gray-200 border-2 border-dashed">
                  <ImageIcon size={64} strokeWidth={1} />
                  <p className="text-[10px] font-black mt-4 uppercase tracking-widest">Görsel Kaydı Mevcut Değil</p>
                </div>
              )}
            </div>

            {/* 4. Açıklamalar */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Info size={16} className="text-amber-500" /> Operasyonel Açıklamalar
              </h3>
              <div className="space-y-4">
                <div className="p-5 bg-amber-50/40 rounded-2xl border border-amber-100 italic text-sm text-gray-700 leading-relaxed shadow-sm relative">
                  <span className="absolute -top-3 left-4 bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Operatör Notu</span>
                  "{data.notes || data.aciklama || 'Raporla ilgili bir açıklama girilmemiş.'}"
                </div>
                
                {data.musteri_aciklamasi && (
                  <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100 text-xs font-medium text-gray-600 relative">
                    <span className="absolute -top-3 left-4 bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Müşteri Açıklaması</span>
                    {data.musteri_aciklamasi}
                  </div>
                )}
                
                {data.yonetici_notu && (
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs font-medium text-gray-600 relative">
                    <span className="absolute -top-3 left-4 bg-indigo-100 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Yönetici Geri Bildirimi</span>
                    {data.yonetici_notu}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 5. Malzeme Maliyet Tablosu */}
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Receipt size={16} className="text-emerald-500" /> Ücretli Malzeme & Maliyet Detayı
            </h3>
            {data.paid_materials.length > 0 ? (
              <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-[12px] text-left border-collapse">
                  <thead className="bg-gray-900 text-white uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="p-4 font-black">Malzeme Adı</th>
                      <th className="p-4 font-black text-center">Miktar</th>
                      <th className="p-4 font-black text-right">Birim Fiyat</th>
                      <th className="p-4 font-black text-right pr-6">Toplam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.paid_materials.map((m, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors font-bold text-gray-700">
                        <td className="p-4">{m.material_name}</td>
                        <td className="p-4 text-center"><span className="bg-gray-100 px-2 py-1 rounded-lg">{m.quantity} Adet</span></td>
                        <td className="p-4 text-right">{m.unit_price.toFixed(2)} ₺</td>
                        <td className="p-4 text-right pr-6 text-green-600 font-black">{m.total_price.toFixed(2)} ₺</td>
                      </tr>
                    ))}
                    <tr className="bg-green-50/50">
                      <td colSpan={3} className="p-5 text-right font-black text-gray-900 uppercase text-[11px] tracking-widest">Genel Operasyon Tutarı</td>
                      <td className="p-5 text-right pr-6 font-black text-xl text-green-700">
                        {data.paid_materials.reduce((s, m) => s + m.total_price, 0).toFixed(2)} ₺
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 bg-gray-50 border-2 border-dashed rounded-3xl text-center flex flex-col items-center gap-2">
                <Receipt size={32} className="text-gray-200" />
                <p className="text-xs text-gray-400 font-black uppercase tracking-widest italic">Bu operasyon kapsamında faturalandırılan ek malzeme yoktur.</p>
              </div>
            )}
          </div>
        </div>

        {/* Lightbox (Fotoğraf Büyütme) */}
        {lightboxUrl && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
            <button className="absolute top-10 right-10 text-white/50 hover:text-white transition-all"><X size={48} /></button>
            <img src={lightboxUrl} className="max-w-full max-h-full rounded-xl shadow-2xl object-contain animate-in zoom-in-95" alt="Büyük Görsel" />
          </div>
        )}
      </div>
    </div>
  );
};

// --- Ana Sayfa Bileşeni ---
export function VisitsPage({ user, onLogout, onNavigate }: VisitsPageProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ searchTerm: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    const load = async () => {
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
        }

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.searchTerm) query = query.or(`report_number.ilike.%${filters.searchTerm}%,notes.ilike.%${filters.searchTerm}%,aciklama.ilike.%${filters.searchTerm}%`);
        
        const { data, count, error } = await query.order('visit_date', { ascending: false }).range(from, to);
        if (!error) { 
          setVisits(data || []); 
          setTotalCount(count || 0); 
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, filters, currentPage]);

  const exportExcel = () => {
    const data = visits.map(v => ({ Tarih: format(new Date(v.visit_date), 'dd.MM.yyyy'), Şube: v.branches?.sube_adi || 'Merkez', Rapor: v.report_number || v.rapor_no, Operatör: v.operator?.name, Durum: v.status }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ziyaretler");
    XLSX.writeFile(wb, `Ziyaret_Raporu_${Date.now()}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Orijinal Header */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Logo" className="h-10" />
            <h1 className="text-xl font-black text-gray-800 tracking-tighter">TAKİP PANELİ</h1>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-gray-500 hover:text-rose-600 font-bold text-sm transition-colors uppercase tracking-widest"><LogOut size={18} /> Çıkış</button>
        </div>
        
        {/* Orijinal Menü Düzeni */}
        <div className="max-w-7xl mx-auto px-4 flex gap-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'documents', label: 'Belgeler', icon: FileText },
            { id: 'visits', label: 'Ziyaretler', icon: Calendar },
            { id: 'calendar', label: 'Takvim', icon: Clock },
            { id: 'msds', label: 'Ruhsatlar', icon: Shield },
          ].map(p => (
            <button key={p.id} onClick={() => onNavigate(p.id as any)} className={`py-4 px-4 text-[11px] font-black uppercase tracking-widest border-b-4 transition-all flex items-center gap-2 whitespace-nowrap ${p.id === 'visits' ? 'border-green-600 text-green-700 bg-green-50/30' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
              <p.icon size={14} /> {p.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-wrap justify-between items-end gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none italic">Operasyon Kayıtları</h2>
            <p className="text-[11px] font-bold text-gray-400 uppercase mt-2 tracking-widest">Sistemde {totalCount} aktif işlem raporu listeleniyor</p>
          </div>
          <button onClick={exportExcel} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-green-200 hover:bg-green-700 hover:-translate-y-1 transition-all active:scale-95">
            <Download size={20} className="inline mr-2" /> Excel Listesini Al
          </button>
        </div>

        {/* Filtreleme */}
        <div className="bg-white p-5 rounded-3xl shadow-sm mb-10 flex flex-wrap gap-4 border border-gray-100">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
              type="text" 
              placeholder="Rapor no, zararlı türü veya açıklamalarda hızlı tarama..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 font-bold text-xs uppercase outline-none transition-all placeholder:text-gray-300" 
              onChange={e => setFilters({...filters, searchTerm: e.target.value})} 
            />
          </div>
          <select className="p-3 bg-gray-50 border-none rounded-2xl font-black text-[10px] uppercase text-gray-500 outline-none cursor-pointer hover:bg-gray-100 transition-colors" onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">TÜM DURUMLAR</option>
            <option value="completed">TAMAMLANDI</option>
            <option value="planned">PLANLANDI</option>
            <option value="cancelled">İPTAL EDİLDİ</option>
          </select>
        </div>

        {/* Liste Alanı */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-green-600" size={64} strokeWidth={3} />
            <p className="font-black text-gray-300 text-xs tracking-widest uppercase animate-pulse">Saha Verileri Senkronize Ediliyor...</p>
          </div>
        ) : visits.length === 0 ? (
          <div className="bg-white border-4 border-dashed border-gray-50 rounded-[40px] py-32 text-center shadow-inner">
            <Info size={64} className="text-gray-100 mx-auto mb-6" />
            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-sm">Kayıtlı operasyon verisi bulunamadı</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {visits.map(v => <VisitCard key={v.id} visit={v} onViewDetails={setSelectedVisitId} onImageClick={(url) => {}} />)}
          </div>
        )}

        {/* Sayfalama */}
        {!loading && totalCount > itemsPerPage && (
          <div className="mt-16 flex justify-center items-center gap-6">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-x-1 disabled:opacity-20 transition-all"><ChevronLeft size={24}/></button>
            <div className="bg-gray-900 px-8 py-3 rounded-2xl shadow-xl">
               <span className="font-black text-white text-xs tracking-[0.3em] uppercase">Sayfa {currentPage} / {Math.ceil(totalCount / itemsPerPage)}</span>
            </div>
            <button disabled={currentPage * itemsPerPage >= totalCount} onClick={() => setCurrentPage(p => p + 1)} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:translate-x-1 disabled:opacity-20 transition-all"><ChevronRight size={24}/></button>
          </div>
        )}
      </main>

      {/* Dinamik Detay Modalı */}
      {selectedVisitId && <VisitDetailModal visitId={selectedVisitId} onClose={() => setSelectedVisitId(null)} />}
    </div>
  );
}