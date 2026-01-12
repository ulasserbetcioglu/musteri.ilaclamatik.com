import { useState, useEffect, useRef } from 'react';
import { FileText, Download, Eye, Calendar, Folder, LogOut, X, Printer, Shield } from 'lucide-react';
import { BRAND_GREEN, LOGO_URL, MODULE_TITLES } from '../../constants';
import { supabase } from '../../lib/supabase';
import { AuthUser } from '../../hooks/useAuth';
import type { CustomerData, Branch, DocumentSettings } from '../../types';
import { CustomerInfoPreview } from '../modules/CustomerInfo/Preview';
import { IPMContractPreview } from '../modules/IPMContract/Preview';
import { ActivityFileContentPreview } from '../modules/ActivityFileContent/Preview';
import { BranchInfoPreview } from '../modules/BranchInfo/Preview';
import { PermitsPreview } from '../modules/Permits/Preview';
import { CertificatesPreview } from '../modules/Certificates/Preview';
import { FumigationLicensePreview } from '../modules/FumigationLicense/Preview';
import { InsurancePolicyPreview } from '../modules/InsurancePolicy/Preview';
import { ProductMSDSPreview } from '../modules/ProductMSDS/Preview';
import { WasteDisposalPreview } from '../modules/WasteDisposal/Preview';

interface CustomerDocument {
  id: string;
  document_type: string;
  document_title: string;
  file_path: string | null;
  created_at: string;
  customer_id: string | null;
  branch_id: string | null;
}

interface ActivityFilesPageProps {
  user: AuthUser;
  onLogout: () => void;
  onNavigate: (page: 'documents' | 'visits' | 'calendar' | 'msds') => void;
}

export function ActivityFilesPage({ user, onLogout, onNavigate }: ActivityFilesPageProps) {
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<CustomerDocument | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const documentSettings: DocumentSettings = {
    dokumanNo: 'FD-001',
    revizyonNo: '01',
    yayinTarihi: new Date().toLocaleDateString('tr-TR')
  };

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('customer_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (user.userType === 'customer') {
        query = query.eq('customer_id', user.id).is('branch_id', null);
      } else if (user.userType === 'branch') {
        query = query.eq('branch_id', user.id).is('customer_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      setDocuments(data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerOrBranchData = async (doc: CustomerDocument) => {
    try {
      setLoadingPreview(true);

      if (doc.customer_id) {
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', doc.customer_id)
          .maybeSingle();

        if (customerError) throw customerError;

        if (customer) {
          const mappedData: CustomerData = {
            ticariUnvan: customer.cari_isim || customer.kisa_isim || '',
            faaliyetKonusu: customer.faaliyet_konusu || '',
            vergiDairesi: customer.tax_office || '',
            vergiNo: customer.tax_number || '',
            mersisNo: customer.mersis_no || '',
            adres: customer.adres || '',
            telefon: customer.telefon || '',
            faks: '',
            eposta: customer.email || '',
            webSitesi: '',
            yetkiliKisi: '',
            yetkiliUnvan: '',
            yetkiliTel: '',
            hizmetBaslangicTarihi: customer.hizmet_baslangic_tarihi || new Date().toISOString().split('T')[0]
          };
          setCustomerData(mappedData);

          const { data: branchesData, error: branchesError } = await supabase
            .from('branches')
            .select('*')
            .eq('customer_id', doc.customer_id);

          if (!branchesError && branchesData) {
            const mappedBranches = branchesData.map((b: any) => ({
              id: b.id,
              subeAdi: b.sube_adi || '',
              yetkili: '',
              metrekare: '',
              adres: b.adres || '',
              telefon: b.telefon || ''
            }));
            setBranches(mappedBranches);
          }
        }
      } else if (doc.branch_id) {
        const { data: branch, error: branchError } = await supabase
          .from('branches')
          .select('*, customers(*)')
          .eq('id', doc.branch_id)
          .maybeSingle();

        if (branchError) throw branchError;

        if (branch) {
          const mappedData: CustomerData = {
            ticariUnvan: branch.customers?.cari_isim || branch.customers?.kisa_isim || '',
            faaliyetKonusu: branch.customers?.faaliyet_konusu || '',
            vergiDairesi: branch.customers?.tax_office || '',
            vergiNo: branch.customers?.tax_number || '',
            mersisNo: branch.customers?.mersis_no || '',
            adres: branch.adres || '',
            telefon: branch.telefon || '',
            faks: '',
            eposta: branch.email || '',
            webSitesi: '',
            yetkiliKisi: '',
            yetkiliUnvan: '',
            yetkiliTel: '',
            hizmetBaslangicTarihi: branch.customers?.hizmet_baslangic_tarihi || new Date().toISOString().split('T')[0]
          };
          setCustomerData(mappedData);

          const mappedBranch: Branch = {
            id: branch.id,
            subeAdi: branch.sube_adi || '',
            yetkili: '',
            metrekare: '',
            adres: branch.adres || '',
            telefon: branch.telefon || ''
          };
          setBranches([mappedBranch]);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePreview = async (doc: CustomerDocument) => {
    setSelectedDoc(doc);
    await loadCustomerOrBranchData(doc);
  };

  const handleDownload = () => {
    if (previewRef.current) {
      window.print();
    }
  };

  const closePreview = () => {
    setSelectedDoc(null);
    setCustomerData(null);
    setBranches([]);
  };

  const renderPreview = () => {
    if (!selectedDoc || !customerData) return null;

    const customerName = customerData.ticariUnvan || 'Müşteri';
    const customerId = selectedDoc.customer_id || selectedDoc.branch_id;

    switch (selectedDoc.document_type) {
      case '1.1':
        return (
          <ActivityFileContentPreview
            customerData={customerData}
            settings={documentSettings}
          />
        );
      case '1.2':
        return (
          <CustomerInfoPreview
            formData={customerData}
            settings={documentSettings}
          />
        );
      case '1.3':
        return (
          <BranchInfoPreview
            customerData={customerData}
            branches={branches}
            settings={documentSettings}
          />
        );
      case '2.1':
        return (
          <IPMContractPreview
            customerData={customerData}
            settings={documentSettings}
          />
        );
      case '3.1':
        return (
          <PermitsPreview
            settings={documentSettings}
            customerName={customerName}
          />
        );
      case '3.2':
        return (
          <CertificatesPreview
            settings={documentSettings}
            customerName={customerName}
          />
        );
      case '3.3':
        return (
          <FumigationLicensePreview
            settings={documentSettings}
            customerName={customerName}
          />
        );
      case '4.3b':
        return (
          <InsurancePolicyPreview
            settings={documentSettings}
            customerName={customerName}
          />
        );
      case '5.4':
        return (
          <ProductMSDSPreview
            settings={documentSettings}
            customerName={customerName}
          />
        );
      case '6.1':
        return (
          <WasteDisposalPreview
            settings={documentSettings}
            customerName={customerName}
            customerId={customerId}
          />
        );
      default:
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Bu belge tipi için önizleme henüz hazırlanmamıştır.
            </p>
            <p className="text-sm text-gray-500">
              Belge Tipi: {selectedDoc.document_type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={LOGO_URL} alt="Mentor Logo" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Faaliyet Dosyası</h1>
                <p className="text-sm text-gray-500">
                  {user.userType === 'customer' ? user.userData.kisa_isim : user.userData.sube_adi}
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

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 border-t pt-2">
            <button
              onClick={() => onNavigate('documents')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-green-600 bg-green-50 text-green-700"
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
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <Shield size={16} />
              RUHSAT & MSDS
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span>Belgeler yükleniyor...</span>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Folder size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz Belge Bulunmuyor</h3>
            <p className="text-gray-500">
              Size atanmış belgeler burada görüntülenecektir.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
              >
                <div
                  className="h-2"
                  style={{ backgroundColor: BRAND_GREEN }}
                ></div>

                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${BRAND_GREEN}15` }}
                    >
                      <FileText size={24} style={{ color: BRAND_GREEN }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {doc.document_title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {MODULE_TITLES[doc.document_type as keyof typeof MODULE_TITLES] || doc.document_type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Calendar size={14} />
                    <span>
                      {new Date(doc.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(doc)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
                      style={{ backgroundColor: BRAND_GREEN }}
                    >
                      <Eye size={16} />
                      Görüntüle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:p-0 print:bg-white"
          onClick={closePreview}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] max-h-[95vh] overflow-auto print:max-w-full print:max-h-full print:shadow-none print:rounded-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10 print:hidden"
              style={{ borderColor: BRAND_GREEN }}
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedDoc.document_title}
                </h2>
                <p className="text-sm text-gray-500">
                  {MODULE_TITLES[selectedDoc.document_type as keyof typeof MODULE_TITLES]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={loadingPreview}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: BRAND_GREEN }}
                  title="PDF olarak indir"
                >
                  <Printer size={16} />
                  İndir (PDF)
                </button>
                <button
                  onClick={closePreview}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Kapat"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div ref={previewRef} className="p-6 flex items-center justify-center bg-gray-100 print:p-0 print:bg-white">
              {loadingPreview ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span>Belge yükleniyor...</span>
                  </div>
                </div>
              ) : (
                renderPreview()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
