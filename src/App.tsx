import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { HomePage } from './components/home/HomePage';
import { ActivityFilesPage } from './components/customer/ActivityFilesPage';
import { VisitsPage } from './components/customer/VisitsPage';
import { CalendarPage } from './components/customer/CalendarPage';
import { DocumentsPage } from './components/customer/DocumentsPage';
import { ActivityFileContentEditor } from './components/modules/ActivityFileContent/Editor';
import { ActivityFileContentPreview } from './components/modules/ActivityFileContent/Preview';
import { CustomerInfoEditor } from './components/modules/CustomerInfo/Editor';
import { CustomerInfoPreview } from './components/modules/CustomerInfo/Preview';
import { BranchInfoEditor } from './components/modules/BranchInfo/Editor';
import { BranchInfoPreview } from './components/modules/BranchInfo/Preview';
import { IPMContractEditor } from './components/modules/IPMContract/Editor';
import { IPMContractPreview } from './components/modules/IPMContract/Preview';
import { PermitsEditor } from './components/modules/Permits/Editor';
import { PermitsPreview } from './components/modules/Permits/Preview';
import { CertificatesEditor } from './components/modules/Certificates/Editor';
import { CertificatesPreview } from './components/modules/Certificates/Preview';
import { FumigationLicenseEditor } from './components/modules/FumigationLicense/Editor';
import { FumigationLicensePreview } from './components/modules/FumigationLicense/Preview';
import { ProductMSDSEditor } from './components/modules/ProductMSDS/Editor';
import { ProductMSDSPreview } from './components/modules/ProductMSDS/Preview';
import { WasteDisposalEditor } from './components/modules/WasteDisposal/Editor';
import { WasteDisposalPreview } from './components/modules/WasteDisposal/Preview';
import { InsurancePolicyEditor } from './components/modules/InsurancePolicy/Editor';
import { InsurancePolicyPreview } from './components/modules/InsurancePolicy/Preview';
import { DocumentAssignment } from './components/admin/DocumentAssignment';
import { useCustomerData } from './hooks/useCustomerData';
import type { ActiveTab, DocumentSettings } from './types';

type CustomerPage = 'documents' | 'visits' | 'calendar' | 'msds';

export default function MentorModule() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [customerPage, setCustomerPage] = useState<CustomerPage>('documents');
  const { user, loading: authLoading, error: authError, login, logout, isAuthenticated } = useAuth();
  const { 
    customers, 
    selectedCustomerId, 
    setSelectedCustomerId, 
    customerData, 
    setCustomerData, 
    branches, 
    setBranches, 
    loading 
  } = useCustomerData();

  // Document settings for each module
  const [settings11, setSettings11] = useState<DocumentSettings>({
    dokumanNo: '1.1',
    revizyonNo: '00',
    yayinTarihi: '01.01.2024'
  });

  const [settings12, setSettings12] = useState<DocumentSettings>({
    dokumanNo: '1.2',
    revizyonNo: '00',
    yayinTarihi: '01.01.2024'
  });

  const [settings13, setSettings13] = useState<DocumentSettings>({
    dokumanNo: '1.3',
    revizyonNo: '00',
    yayinTarihi: '01.01.2024'
  });

  const [settings21, setSettings21] = useState<DocumentSettings>({
    dokumanNo: '2.1',
    revizyonNo: '00',
    yayinTarihi: '01.01.2024'
  });

  const [settings31, setSettings31] = useState<DocumentSettings>({
    dokumanNo: '3.1',
    revizyonNo: '00',
    yayinTarihi: '01.01.2024'
  });

  const [settings32, setSettings32] = useState<DocumentSettings>({
    dokumanNo: '3.2',
    revizyonNo: '00',
    yayinTarihi: '01.01.2024'
  });

  const [settings33, setSettings33] = useState<DocumentSettings>({
    dokumanNo: '3.3',
    revizyonNo: '00',
    yayinTarihi: '01.01.2024'
  });

  const [settings43b, setSettings43b] = useState<DocumentSettings>({
    dokumanNo: '4.3b',
    revizyonNo: '00',
    yayinTarihi: '01.01.2024'
  });

  const [settings54, setSettings54] = useState<DocumentSettings>({
    dokumanNo: '5.4',
    revizyonNo: '00',
    yayinTarihi: '01.01.2024'
  });

  const [settings61, setSettings61] = useState<DocumentSettings>({
    dokumanNo: '6.1',
    revizyonNo: '00',
    yayinTarihi: '01.01.2024'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCustomerDataChange = (updates: Partial<typeof customerData>) => {
    setCustomerData(updates);
  };

  const handleSettings12Change = (updates: Partial<DocumentSettings>) => {
    setSettings12(prev => ({ ...prev, ...updates }));
  };

  const handleSettings11Change = (updates: Partial<DocumentSettings>) => {
    setSettings11(prev => ({ ...prev, ...updates }));
  };

  const handleSettings13Change = (updates: Partial<DocumentSettings>) => {
    setSettings13(prev => ({ ...prev, ...updates }));
  };

  const handleSettings21Change = (updates: Partial<DocumentSettings>) => {
    setSettings21(prev => ({ ...prev, ...updates }));
  };

  const handleSettings31Change = (updates: Partial<DocumentSettings>) => {
    setSettings31(prev => ({ ...prev, ...updates }));
  };

  const handleSettings32Change = (updates: Partial<DocumentSettings>) => {
    setSettings32(prev => ({ ...prev, ...updates }));
  };

  const handleSettings33Change = (updates: Partial<DocumentSettings>) => {
    setSettings33(prev => ({ ...prev, ...updates }));
  };

  const handleSettings43bChange = (updates: Partial<DocumentSettings>) => {
    setSettings43b(prev => ({ ...prev, ...updates }));
  };

  const handleSettings54Change = (updates: Partial<DocumentSettings>) => {
    setSettings54(prev => ({ ...prev, ...updates }));
  };

  const handleSettings61Change = (updates: Partial<DocumentSettings>) => {
    setSettings61(prev => ({ ...prev, ...updates }));
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={login}
        loading={authLoading}
        error={authError}
      />
    );
  }

  // Show customer/branch pages
  if (user && (user.userType === 'customer' || user.userType === 'branch')) {
    if (customerPage === 'documents') {
      return <ActivityFilesPage user={user} onLogout={logout} onNavigate={setCustomerPage} />;
    } else if (customerPage === 'visits') {
      return <VisitsPage user={user} onLogout={logout} onNavigate={setCustomerPage} />;
    } else if (customerPage === 'calendar') {
      return <CalendarPage user={user} onLogout={logout} onNavigate={setCustomerPage} />;
    } else if (customerPage === 'msds') {
      return <DocumentsPage user={user} onLogout={logout} onNavigate={setCustomerPage} />;
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onPrint={handlePrint} 
        user={user}
        onLogout={logout}
      />

      <main className="flex-1 flex overflow-hidden relative">
        {/* Editor Panel */}
        {activeTab !== 'home' && (
          <div className="w-[400px] bg-white border-r border-gray-200 overflow-y-auto h-full p-6 print:hidden z-10 animate-in slide-in-from-left duration-300">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b">
              {activeTab === '0.1' && 'Belge Atama Yönetimi'}
              {activeTab === '1.1' && 'Faaliyet Dosyası İçeriği'}
              {activeTab === '1.2' && 'Müşteri Bilgileri Düzenle'}
              {activeTab === '1.3' && 'Şube Bilgileri Düzenle'}
              {activeTab === '2.1' && 'IPM Sözleşmesi Düzenle'}
              {activeTab === '3.1' && 'İzin ve Ruhsatlar Düzenle'}
              {activeTab === '3.2' && 'Sertifikalar Düzenle'}
              {activeTab === '3.3' && 'Fumigasyon Ruhsatı Düzenle'}
              {activeTab === '4.3b' && 'Sigorta Poliçesi Düzenle'}
              {activeTab === '5.4' && 'Ürün Ruhsat & MSDS Düzenle'}
              {activeTab === '6.1' && 'Atık İmha Belgesi Düzenle'}
            </h2>

            {activeTab === '0.1' && (
              <DocumentAssignment />
            )}
            {activeTab === '1.1' && (
              <ActivityFileContentEditor
                settings={settings11}
                onSettingsChange={handleSettings11Change}
              />
            )}
            {activeTab === '1.2' && (
              <CustomerInfoEditor
                customers={customers}
                selectedCustomerId={selectedCustomerId}
                onCustomerSelect={setSelectedCustomerId}
                formData={customerData}
                settings={settings12}
                onFormChange={handleCustomerDataChange}
                onSettingsChange={handleSettings12Change}
                loading={loading}
              />
            )}
            {activeTab === '1.3' && (
              <BranchInfoEditor
                customers={customers}
                selectedCustomerId={selectedCustomerId}
                onCustomerSelect={setSelectedCustomerId}
                branches={branches}
                onBranchesChange={setBranches}
                settings={settings13}
                onSettingsChange={handleSettings13Change}
                loading={loading}
              />
            )}
            {activeTab === '2.1' && (
              <IPMContractEditor
                customers={customers}
                selectedCustomerId={selectedCustomerId}
                onCustomerSelect={setSelectedCustomerId}
                settings={settings21}
                onSettingsChange={handleSettings21Change}
                loading={loading}
              />
            )}
            {activeTab === '3.1' && (
              <PermitsEditor
                settings={settings31}
                onSettingsChange={handleSettings31Change}
              />
            )}
            {activeTab === '3.2' && (
              <CertificatesEditor
                settings={settings32}
                onSettingsChange={handleSettings32Change}
              />
            )}
            {activeTab === '3.3' && (
              <FumigationLicenseEditor
                settings={settings33}
                onSettingsChange={handleSettings33Change}
              />
            )}
            {activeTab === '4.3b' && (
              <InsurancePolicyEditor
                settings={settings43b}
                onSettingsChange={handleSettings43bChange}
              />
            )}
            {activeTab === '5.4' && (
              <ProductMSDSEditor
                settings={settings54}
                onSettingsChange={handleSettings54Change}
              />
            )}
            {activeTab === '6.1' && (
              <WasteDisposalEditor
                settings={settings61}
                onSettingsChange={handleSettings61Change}
              />
            )}
          </div>
        )}

        {/* Preview Panel */}
        <div className="flex-1 bg-gray-500 overflow-auto flex justify-center items-start p-8 print:p-0 print:absolute print:inset-0 print:bg-white print:z-50 print:block">
          {activeTab === 'home' && (
            <HomePage loading={loading} onTabChange={setActiveTab} />
          )}
          {activeTab === '0.1' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-white text-center">
                <p className="text-lg">Belge atama işlemleri sol panelden yapılabilir</p>
              </div>
            </div>
          )}
          {activeTab === '1.1' && (
            <ActivityFileContentPreview customerData={customerData} settings={settings11} />
          )}
          {activeTab === '1.2' && (
            <CustomerInfoPreview formData={customerData} settings={settings12} />
          )}
          {activeTab === '1.3' && (
            <BranchInfoPreview customerData={customerData} branches={branches} settings={settings13} />
          )}
          {activeTab === '2.1' && (
            <IPMContractPreview customerData={customerData} settings={settings21} />
          )}
          {activeTab === '3.1' && (
            <PermitsPreview settings={settings31} />
          )}
          {activeTab === '3.2' && (
            <CertificatesPreview settings={settings32} />
          )}
          {activeTab === '3.3' && (
            <FumigationLicensePreview settings={settings33} />
          )}
          {activeTab === '4.3b' && (
            <InsurancePolicyPreview settings={settings43b} />
          )}
          {activeTab === '5.4' && (
            <ProductMSDSPreview settings={settings54} />
          )}
          {activeTab === '6.1' && (
            <WasteDisposalPreview settings={settings61} />
          )}
        </div>
      </main>

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .flex-1.bg-gray-500 {
            background-color: white !important;
            padding: 0 !important;
            overflow: visible !important;
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
          .shadow-2xl { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}