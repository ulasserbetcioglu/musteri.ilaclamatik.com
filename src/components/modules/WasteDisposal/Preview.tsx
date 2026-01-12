import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BRAND_GREEN, BRAND_LIGHT_GREEN } from '../../../constants';
import type { DocumentSettings } from '../../../types';
import { A4Header } from '../../common/A4Header';

interface WasteRecord {
  id: string;
  tarih: string;
  atik_turu: string;
  miktar: string;
  bertaraf_firmasi: string;
  belge_no: string;
  notlar: string;
}

interface WasteDisposalPreviewProps {
  settings: DocumentSettings;
  customerName: string;
  customerId?: string;
}

export function WasteDisposalPreview({ settings, customerName, customerId }: WasteDisposalPreviewProps) {
  const [records, setRecords] = useState<WasteRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerId) {
      loadRecords();
    }
  }, [customerId]);

  const loadRecords = async () => {
    if (!customerId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('waste_disposal_records')
      .select('*')
      .eq('customer_id', customerId)
      .order('tarih', { ascending: false });

    if (!error && data) {
      setRecords(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: BRAND_GREEN }}></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">Lütfen bir müşteri seçiniz</p>
          <p className="text-sm">Atık bertaraf kayıtları müşteri bazlıdır</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[15mm] text-black box-border flex flex-col relative"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <A4Header title="BİYOSİDAL ATIK BERTARAF KAYITLARI" settings={settings} />

      <div className="flex-grow">
        <div className="mb-4 text-sm font-bold uppercase border-b border-gray-400 pb-1">
          Firma: {customerName}
        </div>

        <div className="mb-4 p-2 bg-gray-50 border text-xs italic">
          Bu belge, müşteri tesislerinde kullanılan biyosidal ürünlerden kaynaklanan atıkların yasal mevzuata uygun
          şekilde bertaraf edildiğini gösteren kayıtları içermektedir.
        </div>

        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
              <th className="border border-black p-2 w-10 text-center">S.NO</th>
              <th className="border border-black p-2 text-center">TARİH</th>
              <th className="border border-black p-2 text-left">ATIK TÜRÜ</th>
              <th className="border border-black p-2 text-center">MİKTAR</th>
              <th className="border border-black p-2 text-left">BERTARAF FİRMASI</th>
              <th className="border border-black p-2 text-center">BELGE NO</th>
              <th className="border border-black p-2 text-left">NOTLAR</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.id}>
                <td className="border border-black p-2 text-center font-bold">{index + 1}</td>
                <td className="border border-black p-2 text-center">
                  {new Date(record.tarih).toLocaleDateString('tr-TR')}
                </td>
                <td className="border border-black p-2">{record.atik_turu}</td>
                <td className="border border-black p-2 text-center font-semibold">{record.miktar}</td>
                <td className="border border-black p-2">{record.bertaraf_firmasi}</td>
                <td className="border border-black p-2 text-center font-mono text-[10px]">{record.belge_no}</td>
                <td className="border border-black p-2 text-[10px]">{record.notlar}</td>
              </tr>
            ))}
            {[...Array(Math.max(0, 15 - records.length))].map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-black p-4 text-center text-gray-300">
                  {records.length + i + 1}
                </td>
                <td className="border border-black p-4"></td>
                <td className="border border-black p-4"></td>
                <td className="border border-black p-4"></td>
                <td className="border border-black p-4"></td>
                <td className="border border-black p-4"></td>
                <td className="border border-black p-4"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 border border-black p-3 bg-gray-50 text-xs">
          <p className="font-bold mb-2">YASAL DAYANAK:</p>
          <p className="mb-1">
            • Atık Yönetimi Yönetmeliği (02.04.2015 tarih ve 29314 sayılı Resmi Gazete)
          </p>
          <p className="mb-1">
            • Tehlikeli Atıkların Kontrolü Yönetmeliği
          </p>
          <p>
            • Biyosidal Ürünler Yönetmeliği (26.12.2009 tarih ve 27449 sayılı Resmi Gazete)
          </p>
        </div>

        <div className="mt-8 flex justify-between px-4">
          <div className="text-center w-1/3">
            <h4 className="font-bold mb-1 text-xs">MÜŞTERİ YETKİLİSİ</h4>
            <div className="text-[10px] mb-6">(Kaşe - İmza)</div>
            <div className="border-b border-black w-full"></div>
          </div>
          <div className="text-center w-1/3">
            <h4 className="font-bold mb-1 text-xs">MENTOR YETKİLİSİ</h4>
            <div className="text-[10px] mb-6">(Kaşe - İmza)</div>
            <div className="border-b border-black w-full"></div>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-black pt-2 text-center text-xs text-gray-500 mt-auto">
        Bu form, MENTOR Çevre Sağlığı Hizmetleri kalite yönetim sisteminin bir parçasıdır. İzinsiz çoğaltılamaz.
      </div>
    </div>
  );
}
