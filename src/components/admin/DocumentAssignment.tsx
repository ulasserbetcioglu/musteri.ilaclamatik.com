import { useState, useEffect } from 'react';
import { FileCheck, Plus, Trash2, Building2, Store, FileText, Download, Eye } from 'lucide-react';
import { BRAND_GREEN, MODULE_TITLES, NAVIGATION_ITEMS } from '../../constants';
import { supabase } from '../../lib/supabase';
import type { Customer, Branch } from '../../types';

interface AssignedDocument {
  id: string;
  customer_id: string | null;
  branch_id: string | null;
  document_type: string;
  document_title: string;
  created_at: string;
}

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
}

export function DocumentAssignment() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [assignTarget, setAssignTarget] = useState<'customer' | 'branch'>('customer');
  const [assignedDocs, setAssignedDocs] = useState<AssignedDocument[]>([]);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
    loadStorageFiles();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      loadBranches(selectedCustomerId);
      if (assignTarget === 'customer') {
        loadAssignedDocuments();
      }
    } else {
      setBranches([]);
      setSelectedBranchId('');
      setAssignedDocs([]);
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    if (selectedBranchId && assignTarget === 'branch') {
      loadAssignedDocuments();
    } else if (assignTarget === 'customer' && selectedCustomerId) {
      loadAssignedDocuments();
    }
  }, [selectedBranchId, assignTarget]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('kisa_isim');

      if (error) {
        console.error('Error loading customers:', error);
        alert('Müşteriler yüklenirken hata: ' + error.message);
        return;
      }

      console.log('Loaded customers:', data);
      setCustomers(data || []);
    } catch (err: any) {
      console.error('Error loading customers:', err);
      alert('Müşteriler yüklenirken hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('customer_id', customerId)
        .order('sube_adi');

      if (error) {
        console.error('Error loading branches:', error);
        return;
      }

      console.log('Loaded branches:', data);
      setBranches(data || []);
    } catch (err) {
      console.error('Error loading branches:', err);
    }
  };

  const loadAssignedDocuments = async () => {
    try {
      setLoading(true);

      const query = supabase
        .from('customer_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (assignTarget === 'customer' && selectedCustomerId) {
        query.eq('customer_id', selectedCustomerId).is('branch_id', null);
      } else if (assignTarget === 'branch' && selectedBranchId) {
        query.eq('branch_id', selectedBranchId).is('customer_id', null);
      } else {
        setAssignedDocs([]);
        return;
      }

      const { data, error } = await query;

      if (error) throw error;
      setAssignedDocs(data || []);
    } catch (err) {
      console.error('Error loading assigned documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCustomerId(value);
    setSelectedBranchId('');
    setAssignTarget('customer');
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedBranchId(value);
    setAssignTarget(value ? 'branch' : 'customer');
  };

  const handleAssignDocument = async () => {
    if (!selectedDocType) {
      alert('Lütfen belge tipi seçiniz');
      return;
    }

    if (assignTarget === 'customer' && !selectedCustomerId) {
      alert('Lütfen müşteri seçiniz');
      return;
    }

    if (assignTarget === 'branch' && !selectedBranchId) {
      alert('Lütfen şube seçiniz');
      return;
    }

    try {
      setSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const documentTitle = MODULE_TITLES[selectedDocType as keyof typeof MODULE_TITLES] || selectedDocType;

      const insertData: any = {
        document_type: selectedDocType,
        document_title: documentTitle,
        created_by: user.id
      };

      if (assignTarget === 'customer') {
        insertData.customer_id = selectedCustomerId;
        insertData.branch_id = null;
      } else {
        insertData.branch_id = selectedBranchId;
        insertData.customer_id = null;
      }

      const { error } = await supabase
        .from('customer_documents')
        .insert(insertData);

      if (error) throw error;

      alert('Belge başarıyla atandı!');
      setSelectedDocType('');
      loadAssignedDocuments();
    } catch (err: any) {
      console.error('Error assigning document:', err);
      alert('Belge atanırken hata oluştu: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Bu belgeyi silmek istediğinize emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('customer_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      alert('Belge başarıyla silindi!');
      loadAssignedDocuments();
    } catch (err: any) {
      console.error('Error deleting document:', err);
      alert('Belge silinirken hata oluştu: ' + err.message);
    }
  };

  const loadStorageFiles = async () => {
    try {
      setLoadingFiles(true);
      const { data, error } = await supabase.storage
        .from('documents')
        .list('public', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Error loading storage files:', error);
        return;
      }

      setStorageFiles(data || []);
    } catch (err) {
      console.error('Error loading storage files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(`public/${fileName}`);
    return data.publicUrl;
  };

  const handleViewPdf = (fileName: string) => {
    const url = getPublicUrl(fileName);
    setSelectedPdfUrl(url);
  };

  const handleDownloadPdf = (fileName: string) => {
    const url = getPublicUrl(fileName);
    window.open(url, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-3 rounded border border-green-200 text-sm text-green-800 mb-4">
        <strong>Belge Atama:</strong> Önce müşteri seçin, ardından müşteriye veya şubeye belge atayın.
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: BRAND_GREEN }}>
          <Building2 size={16} /> 1. Adım: Müşteri Seçimi
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Müşteri Seçin</label>
            <select
              value={selectedCustomerId}
              onChange={handleCustomerChange}
              className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
              disabled={loading}
            >
              <option value="">-- Müşteri Seçiniz --</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.cari_isim} ({customer.kisa_isim})
                </option>
              ))}
            </select>
            {customers.length === 0 && !loading && (
              <p className="text-xs text-red-600 mt-1">Henüz müşteri bulunmuyor.</p>
            )}
          </div>

          {selectedCustomer && (
            <div className="text-xs bg-blue-50 border border-blue-200 rounded p-3">
              <div className="flex items-center gap-2 font-medium text-blue-800 mb-1">
                <Building2 size={14} className="text-blue-600" />
                Seçili Müşteri
              </div>
              <div className="text-blue-700">
                {selectedCustomer.cari_isim} ({selectedCustomer.kisa_isim})
              </div>
            </div>
          )}
        </div>
      </section>

      {selectedCustomerId && (
        <>
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 border-t pt-4" style={{ color: BRAND_GREEN }}>
              <Store size={16} /> 2. Adım: Şube Seçimi (Opsiyonel)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Şube Seçin (veya müşteriye atama için boş bırakın)</label>
                <select
                  value={selectedBranchId}
                  onChange={handleBranchChange}
                  className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                  disabled={loading}
                >
                  <option value="">-- Müşteriye Atama Yap --</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.sube_adi}
                    </option>
                  ))}
                </select>
                {branches.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">Bu müşterinin şubesi bulunmuyor.</p>
                )}
              </div>

              {selectedBranch && (
                <div className="text-xs bg-purple-50 border border-purple-200 rounded p-3">
                  <div className="flex items-center gap-2 font-medium text-purple-800 mb-1">
                    <Store size={14} className="text-purple-600" />
                    Seçili Şube
                  </div>
                  <div className="text-purple-700">
                    {selectedBranch.sube_adi}
                  </div>
                </div>
              )}

              {!selectedBranchId && (
                <div className="text-xs bg-green-50 border border-green-200 rounded p-3">
                  <div className="flex items-center gap-2 font-medium text-green-800">
                    <Building2 size={14} className="text-green-600" />
                    Belge müşteriye atanacak
                  </div>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 border-t pt-4" style={{ color: BRAND_GREEN }}>
              <Plus size={16} /> 3. Adım: Belge Ata
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Belge Tipi</label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full p-2 border rounded text-sm outline-none focus:border-green-600"
                  disabled={saving}
                >
                  <option value="">-- Belge Tipi Seçiniz --</option>
                  {NAVIGATION_ITEMS.filter(item => item.id !== '0.1').map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} - {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAssignDocument}
                disabled={!selectedDocType || saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: BRAND_GREEN }}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Atanıyor...
                  </>
                ) : (
                  <>
                    <FileCheck size={16} />
                    Belge Ata
                  </>
                )}
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 border-t pt-4" style={{ color: BRAND_GREEN }}>
              <FileCheck size={16} /> Atanmış Belgeler ({assignedDocs.length})
            </h2>
            {loading ? (
              <div className="text-xs text-green-600 text-center py-4">
                Belgeler yükleniyor...
              </div>
            ) : assignedDocs.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-8 bg-gray-50 rounded">
                Bu {assignTarget === 'customer' ? 'müşteriye' : 'şubeye'} henüz belge atanmamış.
              </div>
            ) : (
              <div className="space-y-2">
                {assignedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-white border rounded hover:border-green-600 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {doc.document_title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {doc.document_type} • {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Belgeyi Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <section className="border-t pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: BRAND_GREEN }}>
          <FileText size={16} /> PDF Dosyaları (Storage)
        </h2>
        {loadingFiles ? (
          <div className="text-xs text-green-600 text-center py-4">
            PDF dosyaları yükleniyor...
          </div>
        ) : storageFiles.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-8 bg-gray-50 rounded">
            Henüz yüklenmiş PDF dosyası bulunmuyor.
          </div>
        ) : (
          <div className="space-y-2">
            {storageFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-white border rounded hover:border-green-600 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <FileText size={16} className="text-red-600" />
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(file.metadata.size)} • {new Date(file.created_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewPdf(file.name)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="PDF'i Görüntüle"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleDownloadPdf(file.name)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="PDF'i İndir"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedPdfUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPdfUrl(null)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">PDF Görüntüleyici</h3>
              <button
                onClick={() => setSelectedPdfUrl(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={selectedPdfUrl}
                className="w-full h-full"
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
