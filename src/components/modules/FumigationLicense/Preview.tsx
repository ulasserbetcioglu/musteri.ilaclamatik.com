import { useEffect, useState } from 'react';
import { A4Header } from '../../common/A4Header';
import { BRAND_GREEN } from '../../../constants';
import { supabase } from '../../../lib/supabase';
import type { CustomerData, DocumentSettings, FumigationLicense } from '../../../types';

interface FumigationLicensePreviewProps {
  customerData: CustomerData;
  settings: DocumentSettings;
  selectedCustomerId: string;
}

export function FumigationLicensePreview({ customerData, settings, selectedCustomerId }: FumigationLicensePreviewProps) {
  const [license, setLicense] = useState<FumigationLicense | null>(null);

  useEffect(() => {
    if (selectedCustomerId) {
      loadLicense();
    }
  }, [selectedCustomerId]);

  const loadLicense = async () => {
    try {
      const { data, error } = await supabase
        .from('fumigation_licenses')
        .select('*')
        .eq('customer_id', selectedCustomerId)
        .is('branch_id', null)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setLicense({
          id: parseInt(data.id) || 1,
          ruhsatNo: data.ruhsat_no || '',
          verilisTarihi: data.verilis_tarihi || '',
          gecerlilikTarihi: data.gecerlilik_tarihi || '',
          kapsamAciklamasi: data.kapsam_aciklamasi || '',
          kisitlamalar: data.kisitlamalar || ''
        });
      } else {
        setLicense(null);
      }
    } catch (err) {
      console.error('Error loading license:', err);
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

  return (
    <div
      className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[15mm] text-black box-border flex flex-col relative"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <A4Header title="FUMİGASYON RUHSATI" settings={settings} />

      <div className="flex-grow">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-3" style={{ color: BRAND_GREEN }}>
            {customerData.ticariUnvan || 'MÜŞTERİ FİRMA ADI'}
          </h1>
          <h2 className="text-xl font-bold mb-2">
            FUMİGASYON RUHSATI
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
              <span className="font-semibold">Vergi No:</span>{' '}
              {customerData.vergiNo || '-'}
            </div>
            <div>
              <span className="font-semibold">Telefon:</span>{' '}
              {customerData.telefon || '-'}
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Adres:</span>{' '}
              {customerData.adres || '-'}
            </div>
          </div>
        </div>

        {!license ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            Henüz fumigasyon ruhsat bilgisi kaydedilmemiştir.
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-4 pb-2 border-b-2 border-gray-300">
                Ruhsat Bilgileri
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex border-b pb-2">
                  <div className="w-1/3 font-semibold text-gray-700">Ruhsat No:</div>
                  <div className="w-2/3">{license.ruhsatNo || '-'}</div>
                </div>
                <div className="flex border-b pb-2">
                  <div className="w-1/3 font-semibold text-gray-700">Veriliş Tarihi:</div>
                  <div className="w-2/3">{formatDate(license.verilisTarihi)}</div>
                </div>
                <div className="flex border-b pb-2">
                  <div className="w-1/3 font-semibold text-gray-700">Geçerlilik Tarihi:</div>
                  <div className="w-2/3 font-semibold" style={{ color: BRAND_GREEN }}>
                    {formatDate(license.gecerlilikTarihi)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3 pb-2 border-b-2 border-gray-300">
                Kapsam Açıklaması
              </h3>
              <div className="text-xs text-justify leading-relaxed bg-gray-50 p-4 rounded">
                {license.kapsamAciklamasi || 'Kapsam açıklaması belirtilmemiştir.'}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3 pb-2 border-b-2 border-gray-300">
                Kısıtlamalar ve Özel Şartlar
              </h3>
              <div className="text-xs text-justify leading-relaxed bg-gray-50 p-4 rounded">
                {license.kisitlamalar || 'Kısıtlama belirtilmemiştir.'}
              </div>
            </div>

            <div className="mt-12 border-t-2 border-gray-300 pt-6">
              <div className="text-xs space-y-2">
                <p className="font-semibold">Önemli Bilgilendirme:</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Bu ruhsat fumigasyon işlemlerinin yürütülmesi için gerekli yasal belgedir.</li>
                  <li>Ruhsat kapsamında belirtilen hizmetler dışında fumigasyon yapılamaz.</li>
                  <li>Ruhsatın geçerlilik süresi dolmadan yenileme işlemleri başlatılmalıdır.</li>
                  <li>Fumigasyon işlemleri sadece sertifikalı personel tarafından gerçekleştirilmelidir.</li>
                  <li>İlgili mevzuat ve güvenlik prosedürlerine tam uyum sağlanmalıdır.</li>
                </ul>
              </div>
            </div>

            <div className="mt-12 flex justify-between px-8">
              <div className="text-center">
                <div className="text-xs font-semibold mb-12">FİRMA YETKİLİSİ</div>
                <div className="border-b-2 border-black w-48 mb-2"></div>
                <div className="text-xs">{customerData.yetkiliKisi || 'Yetkili Kişi'}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold mb-12">MENTOR YETKİLİSİ</div>
                <div className="border-b-2 border-black w-48 mb-2"></div>
                <div className="text-xs">Mesul Müdür</div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="border-t-2 border-black pt-2 text-center text-[9pt] text-gray-500 mt-6">
        Bu belge, MENTOR Çevre Sağlığı Hizmetleri kalite yönetim sisteminin bir parçasıdır. İzinsiz çoğaltılamaz.
      </div>
    </div>
  );
}
