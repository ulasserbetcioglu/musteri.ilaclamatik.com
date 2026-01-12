import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BRAND_GREEN, BRAND_LIGHT_GREEN } from '../../../constants';
import type { DocumentSettings, ContingencyPlanEntry } from '../../../types';
import { A4Header } from '../../common/A4Header';

interface ContingencyPlanData {
  date: string;
  entries: ContingencyPlanEntry[];
}

interface ContingencyPlanPreviewProps {
  settings: DocumentSettings;
  customerName: string;
  customerId?: string;
}

export function ContingencyPlanPreview({
  settings,
  customerName,
  customerId
}: ContingencyPlanPreviewProps) {
  const [planData, setPlanData] = useState<ContingencyPlanData>({
    date: new Date().toISOString().split('T')[0],
    entries: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerId) {
      loadPlan();
    }
  }, [customerId]);

  const loadPlan = async () => {
    if (!customerId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('contingency_plans')
      .select('*')
      .eq('customer_id', customerId)
      .maybeSingle();

    if (!error && data) {
      setPlanData({
        date: data.date || new Date().toISOString().split('T')[0],
        entries: data.entries || []
      });
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
          <p className="text-sm">Acil eylem planı müşteri bazlıdır</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[15mm] text-black box-border flex flex-col relative"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <A4Header title="ZARARLI KONTROLÜ ACİL EYLEM PLANI" subtitle="Pest Control Contingency Plan" settings={settings} />

      <div className="flex-grow">
        <div className="mb-3 flex justify-between items-center">
          <div className="text-sm font-bold uppercase">
            Firma: {customerName}
          </div>
          <div className="text-xs">
            <span className="font-semibold">Tarih / Date: </span>
            {new Date(planData.date).toLocaleDateString('tr-TR')}
          </div>
        </div>

        <div className="mb-4 p-2 border text-[10px] italic" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
          Bu plan, zararlı kontrolü faaliyetleri sırasında karşılaşılabilecek kritik durumlar ve uygulanacak acil
          eylem prosedürlerini tanımlamaktadır.
        </div>

        <table className="w-full border-collapse border border-black text-[9px]">
          <thead>
            <tr style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
              <th className="border border-black p-1.5 w-8 text-center">
                <div className="font-bold">No</div>
              </th>
              <th className="border border-black p-1.5 text-center w-24">
                <div className="font-bold">Tehlike</div>
                <div className="font-normal italic text-[8px]">Danger</div>
              </th>
              <th className="border border-black p-1.5 text-center w-24">
                <div className="font-bold">Tespit Yöntemi</div>
                <div className="font-normal italic text-[8px]">Detection Method</div>
              </th>
              <th className="border border-black p-1.5 text-center w-20">
                <div className="font-bold">Kritik Limit</div>
                <div className="font-normal italic text-[8px]">Critical Limit</div>
              </th>
              <th className="border border-black p-1.5 text-center w-20">
                <div className="font-bold">Sorumlu</div>
                <div className="font-normal italic text-[8px]">Responsible</div>
              </th>
              <th className="border border-black p-1.5 text-center">
                <div className="font-bold">Düzeltici Faaliyet</div>
                <div className="font-normal italic text-[8px]">Corrective Action</div>
              </th>
              <th className="border border-black p-1.5 text-center w-20">
                <div className="font-bold">Kayıt</div>
                <div className="font-normal italic text-[8px]">Record</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {planData.entries.map((entry) => (
              <tr key={entry.id}>
                <td className="border border-black p-1.5 text-center font-bold">{entry.no}</td>
                <td className="border border-black p-1.5 text-[8px] align-top">{entry.hazard}</td>
                <td className="border border-black p-1.5 text-[8px] align-top">{entry.detectionMethod}</td>
                <td className="border border-black p-1.5 text-[8px] align-top">{entry.criticalLimit}</td>
                <td className="border border-black p-1.5 text-[8px] text-center align-top">
                  {entry.responsible}
                </td>
                <td className="border border-black p-1.5 text-[8px] align-top">{entry.correctiveAction}</td>
                <td className="border border-black p-1.5 text-[8px] text-center align-top">
                  {entry.record}
                </td>
              </tr>
            ))}
            {planData.entries.length === 0 && [...Array(10)].map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-black p-3 text-center text-gray-300">{i + 1}</td>
                <td className="border border-black p-3"></td>
                <td className="border border-black p-3"></td>
                <td className="border border-black p-3"></td>
                <td className="border border-black p-3"></td>
                <td className="border border-black p-3"></td>
                <td className="border border-black p-3"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 border border-black p-2 bg-gray-50 text-[9px]">
          <p className="font-bold mb-1">NOTLAR / NOTES:</p>
          <p className="mb-1">
            • Bu plan, kritik kontrol noktalarında tespit edilen sapmaların düzeltilmesi için uygulanır.
          </p>
          <p className="mb-1">
            • Acil eylem prosedürleri, tüm operatörlere eğitim ile aktarılmış olup anında uygulanmalıdır.
          </p>
          <p>
            • Tüm düzeltici faaliyetler kayıt altına alınır ve yönetim tarafından gözden geçirilir.
          </p>
        </div>

        <div className="mt-8 flex justify-between px-4">
          <div className="text-center w-1/3">
            <h4 className="font-bold mb-1 text-xs">MÜŞTERİ YETKİLİSİ</h4>
            <div className="text-[10px] mb-10">(İsim - İmza)</div>
            <div className="border-b border-black w-full"></div>
          </div>
          <div className="text-center w-1/3">
            <h4 className="font-bold mb-1 text-xs">MENTOR YETKİLİSİ</h4>
            <div className="text-[10px] mb-10">(İsim - İmza)</div>
            <div className="border-b border-black w-full"></div>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-black pt-2 text-center text-[10px] text-gray-500 mt-auto">
        Bu belge, MENTOR Çevre Sağlığı Hizmetleri kalite yönetim sisteminin bir parçasıdır. İzinsiz çoğaltılamaz.
      </div>
    </div>
  );
}
