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
  }, [user]);

  const loadDocuments = async () => {
    try {
      setLoading(true);

      // Tüm belgeleri çekmek için sorgu (Rapor fotoğrafları hariç)
      let msdsQuery = supabase
        .from('documents')
        .select('*')
        .neq('document_type', 'report_photo');

      // Sadece rapor fotoğraflarını çekmek için sorgu
      let reportsQuery = supabase
        .from('documents')
        .select('*')
        .eq('document_type', 'report_photo');

      // Kullanıcı tipine göre filtreleme
      if (user.customer_id) {
        msdsQuery = msdsQuery.eq('customer_id', user.customer_id);
        reportsQuery = reportsQuery.eq('customer_id', user.customer_id);
      } else if (user.branch_id) {
        msdsQuery = msdsQuery.eq('branch_id', user.branch_id);
        reportsQuery = reportsQuery.eq('branch_id', user.branch_id);
      }

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
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'msds': return 'MSDS';
      case 'license':
      case 'ruhsat': return 'Ruhsat';
      case 'report_photo': return 'Rapor Fotoğrafı';
      case 'contract': return 'Sözleşme';
      case 'invoice': return 'Fatura';
      case 'agreement': return 'Anlaşma';
      case 'certificate': return 'Sertifika';
      case 'other': return 'Diğer';
      default: return type;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image size={20} />;
    return <FileText size={20} />;
  };

  const getDocumentTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'msds': return 'bg-green-100 text-green-800';
      case 'license':
      case 'ruhsat': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'invoice': return 'bg-yellow-100 text-yellow-800';
      case 'agreement': return 'bg-indigo-100 text-indigo-800';
      case 'certificate': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={LOGO_URL} alt="Logo" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">BELGE MERKEZİ</h1>
                <p className="text-sm text-gray-500">
                  {user.customer_name || user.branch_name || 'Hoş geldiniz'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium">
                <LogOut size={16} /> Çıkış Yap
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 border-t pt-2">
            <button onClick={() => onNavigate('documents')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <FileText size={16} /> Belgeler
            </button>
            <button onClick={() => onNavigate('visits')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <Calendar size={16} /> Ziyaretler
            </button>
            <button onClick={() => onNavigate('calendar')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <Calendar size={16} /> Takvim
            </button>
            <button onClick={() => onNavigate('msds')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-green-600 bg-green-50 text-green-700">
              <Shield size={16} /> RUHSAT & MSDS
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex gap-4">
          <button onClick={() => setActiveTab('msds')} className={`px-6 py-3 rounded-lg font-medium transition-colors border ${activeTab === 'msds' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Shield size={20} />
              <span>Tüm Belgeler ({msdsDocuments.length})</span>
            </div>
          </button>
          <button onClick={() => setActiveTab('reports')} className={`px-6 py-3 rounded-lg font-medium transition-colors border ${activeTab === 'reports' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Image size={20} />
              <span>Faaliyet Rapor Görselleri ({reportPhotos.length})</span>
            </div>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-600">
            <Loader2 className="animate-spin mb-2" />
            <span>Yükleniyor...</span>
          </div>
        ) : (
          <>
            {activeTab === 'msds' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {msdsDocuments.length === 0 ? (
                  <div className="col-span-full bg-white rounded-lg shadow-md p-12 text-center border-2 border-dashed">
                    <Shield size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Henüz belge bulunmuyor.</p>
                  </div>
                ) : (
                  msdsDocuments.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {getFileIcon(doc.file_type)}
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${getDocumentTypeBadgeColor(doc.document_type)}`}>
                                {getDocumentTypeLabel(doc.document_type)}
                              </span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 truncate" title={doc.title}>{doc.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>{new Date(doc.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex gap-2">
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                            <Eye size={16} /> Görüntüle
                          </a>
                          <a href={doc.file_url} download className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium">
                            <Download size={16} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {reportPhotos.length === 0 ? (
                  <div className="col-span-full bg-white rounded-lg shadow-md p-12 text-center border-2 border-dashed">
                    <Image size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Henüz rapor görseli bulunmuyor.</p>
                  </div>
                ) : (
                  reportPhotos.map((photo) => (
                    <div key={photo.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer border border-gray-100" onClick={() => setSelectedImage(photo)}>
                      <div className="aspect-square bg-gray-100 relative">
                        <img src={photo.file_url} alt={photo.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 truncate">{photo.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(photo.created_at).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300">
              <X size={32} />
            </button>
            <img src={selectedImage.file_url} alt={selectedImage.title} className="max-w-full max-h-[85vh] mx-auto rounded-lg shadow-2xl" />
            <div className="mt-4 bg-white rounded-lg p-4 shadow-xl">
              <h3 className="font-bold text-gray-900 mb-1">{selectedImage.title}</h3>
              {selectedImage.description && <p className="text-sm text-gray-600 mb-3">{selectedImage.description}</p>}
              <div className="flex gap-2">
                <a href={selectedImage.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                  <Eye size={16} /> Yeni Sekmede Aç
                </a>
                <a href={selectedImage.file_url} download className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium">
                  <Download size={16} /> İndir
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}