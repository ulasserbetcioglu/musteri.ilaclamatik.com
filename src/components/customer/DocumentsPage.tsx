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

      // MSDS ve Ruhsat sorgusu
      let msdsQuery = supabase
        .from('documents')
        .select('*')
        .neq('document_type', 'report_photo');

      // Rapor fotoğrafları sorgusu
      let reportsQuery = supabase
        .from('documents')
        .select('*')
        .eq('document_type', 'report_photo');

      // Kullanıcı tipine göre filtreleme ekle
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
      console.error('Error loading documents:', err);
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={LOGO_URL} alt="Logo" className="h-12" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BELGE MERKEZİ</h1>
              <p className="text-sm text-gray-500">{user.customer_name || user.branch_name || 'Hoş geldiniz'}</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium">
            <LogOut size={16} /> Çıkış Yap
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex gap-2 border-t pt-2">
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
        <div className="mb-6 flex gap-4">
          <button onClick={() => setActiveTab('msds')} className={`px-6 py-3 rounded-lg font-medium border transition-all ${activeTab === 'msds' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <Shield size={20} className="inline mr-2" /> Tüm Belgeler ({msdsDocuments.length})
          </button>
          <button onClick={() => setActiveTab('reports')} className={`px-6 py-3 rounded-lg font-medium border transition-all ${activeTab === 'reports' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <Image size={20} className="inline mr-2" /> Rapor Görselleri ({reportPhotos.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500"><Loader2 className="animate-spin mr-2" /> Belgeler yükleniyor...</div>
        ) : (
          <>
            {activeTab === 'msds' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {msdsDocuments.length === 0 ? (
                  <div className="col-span-full text-center p-12 bg-white rounded-lg border-2 border-dashed">Belge bulunamadı.</div>
                ) : (
                  msdsDocuments.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        {getFileIcon(doc.file_type)}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getDocumentTypeBadgeColor(doc.document_type)}`}>
                          {getDocumentTypeLabel(doc.document_type)}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 truncate">{doc.title}</h3>
                      <div className="flex justify-between text-xs text-gray-500 mb-4">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>{new Date(doc.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex gap-2">
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                          <Eye size={16} /> Görüntüle
                        </a>
                        <a href={doc.file_url} download className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                          <Download size={18} />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {reportPhotos.length === 0 ? (
                  <div className="col-span-full text-center p-12 bg-white rounded-lg border-2 border-dashed">Görsel bulunamadı.</div>
                ) : (
                  reportPhotos.map((photo) => (
                    <div key={photo.id} className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer border" onClick={() => setSelectedImage(photo)}>
                      <img src={photo.file_url} alt={photo.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <p className="text-white text-xs truncate">{photo.title}</p>
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
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white"><X size={32} /></button>
          <div className="max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <img src={selectedImage.file_url} className="w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="mt-4 bg-white p-4 rounded-xl flex justify-between items-center">
              <h3 className="font-bold">{selectedImage.title}</h3>
              <div className="flex gap-2">
                <a href={selectedImage.file_url} target="_blank" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Tam Ekran</a>
                <a href={selectedImage.file_url} download className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">İndir</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}