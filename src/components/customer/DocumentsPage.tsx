import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, LogOut, Shield, AlertCircle, Image, Loader2, X } from 'lucide-react';
import { BRAND_GREEN, LOGO_URL } from '../../constants';
import { supabase } from '../../lib/supabase';
import type { AuthUser } from '../../hooks/useAuth';

interface Document {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number;
  document_type: string;
  entity_type: string;
  created_at: string;
}

interface DocumentsPageProps {
  user: AuthUser;
  onLogout: () => void;
  onNavigate: (page: 'documents' | 'visits' | 'calendar' | 'msds') => void;
}

export function DocumentsPage({ user, onLogout, onNavigate }: DocumentsPageProps) {
  const [msdsDocuments, setMsdsDocuments] = useState<Document[]>([]);
  const [reportPhotos, setReportPhotos] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<'msds' | 'reports'>('msds');

  useEffect(() => {
    loadDocuments();
  }, [user]); // Kullanıcı değiştiğinde yeniden yükle

  const loadDocuments = async () => {
    try {
      setLoading(true);

      // MSDS/Ruhsat Sorgusu
      let msdsQuery = supabase
        .from('documents')
        .select('*')
        .in('document_type', ['msds', 'license', 'ruhsat']);

      // Rapor Fotoğrafları Sorgusu
      let reportsQuery = supabase
        .from('documents')
        .select('*')
        .eq('document_type', 'report_photo');

      // KULLANICIYA GÖRE FİLTRELEME (Eksik olan kısım burasıydı)
      if (user.customer_id) {
        // Müşteri girişi: Doğrudan müşteriye atanmış belgeler
        msdsQuery = msdsQuery.eq('customer_id', user.customer_id);
        reportsQuery = reportsQuery.eq('customer_id', user.customer_id);
      } else if (user.branch_id) {
        // Şube girişi: Sadece şubeye atanmış belgeler
        msdsQuery = msdsQuery.eq('branch_id', user.branch_id);
        reportsQuery = reportsQuery.eq('branch_id', user.branch_id);
      }

      // Paralel olarak verileri çek
      const [msdsRes, reportsRes] = await Promise.all([
        msdsQuery.order('created_at', { ascending: false }),
        reportsQuery.order('created_at', { ascending: false })
      ]);

      if (msdsRes.error) throw msdsRes.error;
      if (reportsRes.error) throw reportsRes.error;

      setMsdsDocuments(msdsRes.data || []);
      setReportPhotos(reportsRes.data || []);
    } catch (err) {
      console.error('Belgeler yüklenirken hata oluştu:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      msds: 'MSDS',
      license: 'Ruhsat',
      ruhsat: 'Ruhsat',
      report_photo: 'Rapor Fotoğrafı'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={LOGO_URL} alt="Logo" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RUHSAT & MSDS</h1>
                <p className="text-sm text-gray-500">{user.customer_name || user.branch_name || 'Hoş geldiniz'}</p>
              </div>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium">
              <LogOut size={16} /> Çıkış Yap
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex gap-2">
          {['documents', 'visits', 'calendar', 'msds'].map((page) => (
            <button
              key={page}
              onClick={() => onNavigate(page as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                page === 'msds' ? 'border-green-600 text-green-700 bg-green-50' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {page === 'msds' ? 'RUHSAT & MSDS' : page.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setActiveTab('msds')}
            className={`flex-1 md:flex-none px-6 py-4 rounded-xl font-semibold transition-all shadow-sm border ${
              activeTab === 'msds' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield size={20} />
              <span>Belgeler ({msdsDocuments.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 md:flex-none px-6 py-4 rounded-xl font-semibold transition-all shadow-sm border ${
              activeTab === 'reports' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Image size={20} />
              <span>Görseller ({reportPhotos.length})</span>
            </div>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2 className="animate-spin mb-2" size={32} />
            <span>Belgeleriniz hazırlanıyor...</span>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'msds' ? (
              msdsDocuments.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed">
                  <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Henüz ruhsat veya MSDS belgesi yüklenmemiş.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {msdsDocuments.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow p-5">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                          <FileText size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {getDocumentTypeLabel(doc.document_type)}
                          </span>
                          <h3 className="font-bold text-gray-900 mt-2 truncate">{doc.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">{formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString('tr-TR')}</p>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-2">
                        <a href={doc.file_url} target="_blank" rel="noopener" className="flex-1 bg-gray-900 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors">Görüntüle</a>
                        <a href={doc.file_url} download className="px-3 bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200 transition-colors"><Download size={18} /></a>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              reportPhotos.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed">
                  <Image size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Henüz faaliyet raporu görseli bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {reportPhotos.map((photo) => (
                    <div key={photo.id} className="group relative aspect-square bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer" onClick={() => setSelectedImage(photo)}>
                      <img src={photo.file_url} alt={photo.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                        <p className="text-xs font-medium truncate">{photo.title}</p>
                        <p className="text-[10px] opacity-80">{new Date(photo.created_at).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Görsel Önizleme Modalı */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white hover:rotate-90 transition-transform"><X size={32} /></button>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img src={selectedImage.file_url} alt={selectedImage.title} className="w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="mt-4 p-4 bg-white rounded-xl flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">{selectedImage.title}</h3>
                <p className="text-sm text-gray-500">{new Date(selectedImage.created_at).toLocaleDateString('tr-TR')}</p>
              </div>
              <div className="flex gap-2">
                <a href={selectedImage.file_url} target="_blank" rel="noopener" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"><Eye size={16} /> Aç</a>
                <a href={selectedImage.file_url} download className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2"><Download size={16} /> İndir</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}