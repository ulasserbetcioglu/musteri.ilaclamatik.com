import { useEffect, useState } from 'react';
import { A4Header } from '../../common/A4Header';
import { BRAND_GREEN } from '../../../constants';
import { supabase } from '../../../lib/supabase';
import type { CustomerData, DocumentSettings, Permit } from '../../../types';

interface PermitsPreviewProps {
  customerData: CustomerData;
  settings: DocumentSettings;
  selectedCustomerId: string;
}

export function PermitsPreview({ customerData, settings, selectedCustomerId }: PermitsPreviewProps) {
  const [permits, setPermits] = useState<Permit[]>([]);

  useEffect(() => {
    if (selectedCustomerId) {
      loadPermits();
    }
  }, [selectedCustomerId]);

  const loadPermits = async () => {
    try {
      const { data, error } = await supabase
        .from('permits')
        .select('*')
        .eq('customer_id', selectedCustomerId)
        .is('branch_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: Permit[] = (data || []).map((item: any) => ({
        id: parseInt(item.id) || 0,
        belgeAdi: item.belge_adi || '',
        belgeNo: item.belge_no || '',
        verilisTarihi: item.verilis_tarihi || '',
        gecerlilikTarihi: item.gecerlilik_tarihi || '',
        verenKurum: item.veren_kurum || ''
      }));

      setPermits(formattedData);
    } catch (err) {
      console.error('Error loading permits:', err);
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
      <A4Header title="İZİN VE RUHSATLAR" settings={settings} />

      <div className="flex-grow">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-3" style={{ color: BRAND_GREEN }}>
            {customerData.ticariUnvan || 'MÜŞTERİ FİRMA ADI'}
          </h1>
          <h2 className="text-xl font-bold mb-2">
            İZİN VE RUHSATLAR
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

        <div className="mb-4">
          <h3 className="text-sm font-bold mb-3 pb-2 border-b-2 border-gray-300">
            İzin ve Ruhsat Listesi
          </h3>

          {permits.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              Henüz izin veya ruhsat kaydı bulunmamaktadır.
            </div>
          ) : (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr style={{ backgroundColor: BRAND_GREEN, color: 'white' }}>
                  <th className="border border-gray-300 p-2 text-left">No</th>
                  <th className="border border-gray-300 p-2 text-left">Belge Adı</th>
                  <th className="border border-gray-300 p-2 text-left">Belge No</th>
                  <th className="border border-gray-300 p-2 text-left">Veriliş Tarihi</th>
                  <th className="border border-gray-300 p-2 text-left">Geçerlilik Tarihi</th>
                  <th className="border border-gray-300 p-2 text-left">Veren Kurum</th>
                </tr>
              </thead>
              <tbody>
                {permits.map((permit, index) => (
                  <tr key={permit.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 p-2">{index + 1}</td>
                    <td className="border border-gray-300 p-2">{permit.belgeAdi || '-'}</td>
                    <td className="border border-gray-300 p-2">{permit.belgeNo || '-'}</td>
                    <td className="border border-gray-300 p-2">{formatDate(permit.verilisTarihi)}</td>
                    <td className="border border-gray-300 p-2">{formatDate(permit.gecerlilikTarihi)}</td>
                    <td className="border border-gray-300 p-2">{permit.verenKurum || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-12 border-t-2 border-gray-300 pt-6">
          <div className="text-xs space-y-2">
            <p className="font-semibold">Notlar:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Tüm izin ve ruhsatlar geçerlilik tarihleri içinde olmalıdır.</li>
              <li>Süresi dolacak belgeler için yenileme işlemleri zamanında başlatılmalıdır.</li>
              <li>Belge fotokopileri dosyada saklanmalı ve yetkili kurumlara ibraz edilmelidir.</li>
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
