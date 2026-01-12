import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, LogOut, Shield, AlertCircle, Image } from 'lucide-react';
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
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);

      const { data: msds, error: msdsError } = await supabase
        .from('documents')
        .select('*')
        .in('document_type', ['msds', 'license', 'ruhsat'])
        .order('created_at', { ascending: false });

      if (msdsError) throw msdsError;

      const { data: reports, error: reportsError } = await supabase
        .from('documents')
        .select('*')
        .eq('document_type', 'report_photo')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      setMsdsDocuments(msds || []);
      setReportPhotos(reports || []);
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
      case 'msds':
        return 'MSDS';
      case 'license':
      case 'ruhsat':
        return 'Ruhsat';
      case 'report_photo':
        return 'Rapor Fotoğrafı';
      default:
        return type;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image size={20} />;
    }
    return <FileText size={20} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={LOGO_URL} alt="Logo" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RUHSAT & MSDS</h1>
                <p className="text-sm text-gray-500">
                  {user.customer_name || user.branch_name || 'Hoş geldiniz'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>{new Date().toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut size={16} />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 border-t pt-2">
            <button
              onClick={() => onNavigate('documents')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <FileText size={16} />
              Belgeler
            </button>
            <button
              onClick={() => onNavigate('visits')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <Calendar size={16} />
              Ziyaretler
            </button>
            <button
              onClick={() => onNavigate('calendar')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <Calendar size={16} />
              Takvim
            </button>
            <button
              onClick={() => onNavigate('msds')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-green-600 bg-green-50 text-green-700"
            >
              <Shield size={16} />
              RUHSAT & MSDS
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab('msds')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'msds'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield size={20} />
              <span>MSDS & Ruhsat Belgeleri ({msdsDocuments.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border'
            }`}
          >
            <div className="flex items-center gap-2">
              <Image size={20} />
              <span>Faaliyet Rapor Görselleri ({reportPhotos.length})</span>
            </div>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span>Belgeler yükleniyor...</span>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'msds' && (
              <div>
                {msdsDocuments.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <Shield size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Henüz belge bulunmuyor
                    </h3>
                    <p className="text-gray-600">
                      MSDS veya ruhsat belgesi henüz yüklenmemiş.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {msdsDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getFileIcon(doc.file_type)}
                                <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded">
                                  {getDocumentTypeLabel(doc.document_type)}
                                </span>
                              </div>
                              <h3 className="font-bold text-gray-900 mb-2">
                                {doc.title}
                              </h3>
                              {doc.description && (
                                <p className="text-sm text-gray-600 mb-3">
                                  {doc.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <span>{formatFileSize(doc.file_size)}</span>
                            <span>
                              {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                              <Eye size={16} />
                              Görüntüle
                            </a>
                            <a
                              href={doc.file_url}
                              download
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                              <Download size={16} />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                {reportPhotos.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <Image size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Henüz rapor görseli bulunmuyor
                    </h3>
                    <p className="text-gray-600">
                      Faaliyet rapor görseli henüz yüklenmemiş.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {reportPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
                        onClick={() => setSelectedImage(photo)}
                      >
                        <div className="aspect-square bg-gray-100 relative">
                          <img
                            src={photo.file_url}
                            alt={photo.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EGörsel yüklenemedi%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {photo.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(photo.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <AlertCircle size={32} />
            </button>
            <img
              src={selectedImage.file_url}
              alt={selectedImage.title}
              className="max-w-full max-h-[90vh] rounded-lg"
            />
            <div className="mt-4 bg-white rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className="text-sm text-gray-600 mb-3">{selectedImage.description}</p>
              )}
              <div className="flex gap-2">
                <a
                  href={selectedImage.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Eye size={16} />
                  Yeni Sekmede Aç
                </a>
                <a
                  href={selectedImage.file_url}
                  download
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Download size={16} />
                  İndir
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

