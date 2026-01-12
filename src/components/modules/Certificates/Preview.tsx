import { useEffect, useState } from 'react';
import { A4Header } from '../../common/A4Header';
import { BRAND_GREEN } from '../../../constants';
import { supabase } from '../../../lib/supabase';
import type { CustomerData, DocumentSettings, Staff } from '../../../types';

interface CertificatesPreviewProps {
  customerData: CustomerData;
  settings: DocumentSettings;
  selectedCustomerId: string;
}

export function CertificatesPreview({ customerData, settings, selectedCustomerId }: CertificatesPreviewProps) {
  const [certificates, setCertificates] = useState<Staff[]>([]);

  useEffect(() => {
    if (selectedCustomerId) {
      loadCertificates();
    }
  }, [selectedCustomerId]);

  const loadCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_certificates')
        .select('*')
        .eq('customer_id', selectedCustomerId)
        .is('branch_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: Staff[] = (data || []).map((item: any) => ({
        id: parseInt(item.id) || 0,
        adSoyad: item.ad_soyad || '',
        gorev: item.gorev || '',
        sertifikaNo: item.sertifika_no || '',
        gecerlilikTarihi: item.gecerlilik_tarihi || ''
      }));

      setCertificates(formattedData);
    } catch (err) {
      console.error('Error loading certificates:', err);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
    } catch {
      return dateString;
    }
  };

  const mesulMudurler = certificates.filter(c => c.gorev === 'Mesul Müdür');
  const operatorler = certificates.filter(c => c.gorev.includes('Operatör'));

  return (
    <div
      className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[15mm] text-black box-border flex flex-col relative"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <A4Header title="MESUL MÜDÜR VE OPERATÖR SERTİFİKALARI" settings={settings} />

      <div className="flex-grow">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-3" style={{ color: BRAND_GREEN }}>
            {customerData.ticariUnvan || 'MÜŞTERİ FİRMA ADI'}
          </h1>
          <h2 className="text-xl font-bold mb-2">
            MESUL MÜDÜR VE OPERATÖR SERTİFİKALARI
          </h2>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3 pb-2 border-b-2 border-gray-300">
            Firma Bilgileri
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-semibold">Ticari Ünvan:</span>{' '}
              {customerData.ticariUnvan || '-'}
            </div>
            <div>
              <span className="font-semibold">Vergi Dairesi:</span>{' '}
              {customerData.vergiDairesi || '-'}
            </div>
            <div>
              <span className="font-semibold">Adres:</span>{' '}
              {customerData.adres || '-'}
            </div>
            <div>
              <span className="font-semibold">Telefon:</span>{' '}
              {customerData.telefon || '-'}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3 pb-2 border-b-2 border-gray-300">
            Mesul Müdür Sertifikaları
          </h3>

          {mesulMudurler.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-xs bg-gray-50 rounded">
              Henüz mesul müdür kaydı bulunmamaktadır.
            </div>
          ) : (
            <table className="w-full border-collapse text-xs mb-4">
              <thead>
                <tr style={{ backgroundColor: BRAND_GREEN, color: 'white' }}>
                  <th className="border border-gray-300 p-2 text-left">No</th>
                  <th className="border border-gray-300 p-2 text-left">Ad Soyad</th>
                  <th className="border border-gray-300 p-2 text-left">Görev</th>
                  <th className="border border-gray-300 p-2 text-left">Sertifika No</th>
                  <th className="border border-gray-300 p-2 text-left">Geçerlilik Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {mesulMudurler.map((cert, index) => (
                  <tr key={cert.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 p-2">{index + 1}</td>
                    <td className="border border-gray-300 p-2">{cert.adSoyad || '-'}</td>
                    <td className="border border-gray-300 p-2">{cert.gorev || '-'}</td>
                    <td className="border border-gray-300 p-2">{cert.sertifikaNo || '-'}</td>
                    <td className="border border-gray-300 p-2">{formatDate(cert.gecerlilikTarihi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-bold mb-3 pb-2 border-b-2 border-gray-300">
            Biyosidal Ürün Uygulayıcı (Operatör) Sertifikaları
          </h3>

          {operatorler.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-xs bg-gray-50 rounded">
              Henüz operatör kaydı bulunmamaktadır.
            </div>
          ) : (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr style={{ backgroundColor: BRAND_GREEN, color: 'white' }}>
                  <th className="border border-gray-300 p-2 text-left">No</th>
                  <th className="border border-gray-300 p-2 text-left">Ad Soyad</th>
                  <th className="border border-gray-300 p-2 text-left">Görev</th>
                  <th className="border border-gray-300 p-2 text-left">Sertifika No</th>
                  <th className="border border-gray-300 p-2 text-left">Geçerlilik Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {operatorler.map((cert, index) => (
                  <tr key={cert.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 p-2">{index + 1}</td>
                    <td className="border border-gray-300 p-2">{cert.adSoyad || '-'}</td>
                    <td className="border border-gray-300 p-2">{cert.gorev || '-'}</td>
                    <td className="border border-gray-300 p-2">{cert.sertifikaNo || '-'}</td>
                    <td className="border border-gray-300 p-2">{formatDate(cert.gecerlilikTarihi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-12 border-t-2 border-gray-300 pt-6">
          <div className="text-xs space-y-2">
            <p className="font-semibold">Önemli Notlar:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Tüm personelin sertifikaları geçerlilik tarihleri içinde olmalıdır.</li>
              <li>Sertifika yenileme işlemleri süre dolmadan başlatılmalıdır.</li>
              <li>Mesul müdür ve operatörlerin sertifika fotokopileri dosyada saklanmalıdır.</li>
              <li>Personel değişikliklerinde sertifika bilgileri güncellenmelidir.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-black pt-2 text-center text-[9pt] text-gray-500 mt-6">
        Bu belge, MENTOR Çevre Sağlığı Hizmetleri kalite yönetim sisteminin bir parçasıdır. İzinsiz çoğaltılamaz.
      </div>
    </div>
  );
}
