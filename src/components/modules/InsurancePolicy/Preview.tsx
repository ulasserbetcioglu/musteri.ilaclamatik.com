import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BRAND_GREEN, BRAND_LIGHT_GREEN } from '../../../constants';
import type { DocumentSettings } from '../../../types';
import { A4Header } from '../../common/A4Header';
import { Shield } from 'lucide-react';

interface InsurancePolicy {
  id: string;
  policy_no: string;
  sigorta_sirketi: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  teminat_tutari: string;
  para_birimi: string;
  kapsam: string;
  broker_adi: string;
  notlar: string;
  is_active: boolean;
}

interface InsurancePolicyPreviewProps {
  settings: DocumentSettings;
  customerName: string;
}

export function InsurancePolicyPreview({ settings, customerName }: InsurancePolicyPreviewProps) {
  const [policy, setPolicy] = useState<InsurancePolicy | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActivePolicy();
  }, []);

  const loadActivePolicy = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('is_active', true)
      .order('bitis_tarihi', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setPolicy(data);
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

  if (!policy) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <Shield size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg mb-2">Aktif sigorta poliçesi bulunamadı</p>
          <p className="text-sm">Sol panelden sigorta bilgilerini girebilirsiniz</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[15mm] text-black box-border flex flex-col relative"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <A4Header title="MALİ MESULİYET SİGORTA POLİÇESİ" settings={settings} />

      <div className="flex-grow">
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 text-sm">
          <p className="mb-2">
            <strong>MENTOR Çevre Sağlığı Hizmetleri,</strong> verdiği pest kontrol ve dezenfeksiyon hizmetleri sırasında
            oluşabilecek olası zararları karşılamak üzere aşağıdaki sigorta poliçesine sahiptir.
          </p>
          <p className="text-xs italic text-gray-600">
            Bu belge, müşterilerimize sunduğumuz güvenceyi ve profesyonel hizmet anlayışımızı göstermektedir.
          </p>
        </div>

        <table className="w-full border-collapse border-2 border-black text-sm mb-6">
          <tbody>
            <tr>
              <td
                className="border border-black p-3 font-bold w-1/3"
                style={{ backgroundColor: BRAND_LIGHT_GREEN }}
              >
                POLİÇE NUMARASI
              </td>
              <td className="border border-black p-3 font-mono text-base font-semibold">
                {policy.policy_no}
              </td>
            </tr>
            <tr>
              <td
                className="border border-black p-3 font-bold"
                style={{ backgroundColor: BRAND_LIGHT_GREEN }}
              >
                SİGORTA ŞİRKETİ
              </td>
              <td className="border border-black p-3 uppercase font-bold">{policy.sigorta_sirketi}</td>
            </tr>
            <tr>
              <td
                className="border border-black p-3 font-bold"
                style={{ backgroundColor: BRAND_LIGHT_GREEN }}
              >
                POLİÇE DÖNEMİ
              </td>
              <td className="border border-black p-3">
                <div className="font-semibold">
                  {new Date(policy.baslangic_tarihi).toLocaleDateString('tr-TR')} -{' '}
                  {new Date(policy.bitis_tarihi).toLocaleDateString('tr-TR')}
                </div>
              </td>
            </tr>
            <tr>
              <td
                className="border border-black p-3 font-bold"
                style={{ backgroundColor: BRAND_LIGHT_GREEN }}
              >
                TEMİNAT TUTARI
              </td>
              <td className="border border-black p-3">
                <div className="text-lg font-bold" style={{ color: BRAND_GREEN }}>
                  {policy.teminat_tutari} {policy.para_birimi}
                </div>
              </td>
            </tr>
            <tr>
              <td
                className="border border-black p-3 font-bold align-top"
                style={{ backgroundColor: BRAND_LIGHT_GREEN }}
              >
                SİGORTA KAPSAMI
              </td>
              <td className="border border-black p-3">
                <div className="whitespace-pre-line">{policy.kapsam}</div>
              </td>
            </tr>
            {policy.broker_adi && (
              <tr>
                <td
                  className="border border-black p-3 font-bold"
                  style={{ backgroundColor: BRAND_LIGHT_GREEN }}
                >
                  BROKER / ARACI
                </td>
                <td className="border border-black p-3">{policy.broker_adi}</td>
              </tr>
            )}
            {policy.notlar && (
              <tr>
                <td
                  className="border border-black p-3 font-bold align-top"
                  style={{ backgroundColor: BRAND_LIGHT_GREEN }}
                >
                  EK BİLGİLER
                </td>
                <td className="border border-black p-3 text-xs">
                  <div className="whitespace-pre-line">{policy.notlar}</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="border-2 border-black p-4 bg-gray-50 mb-8">
          <h3 className="font-bold text-center mb-3 text-base">SİGORTA TAAHHÜDÜNAMESİ</h3>
          <p className="text-xs leading-relaxed text-justify">
            MENTOR Çevre Sağlığı Hizmetleri, yukarıda belirtilen poliçe kapsamında, hizmet verdiği tüm müşterilerde
            oluşabilecek mal ve can güvenliği zararlarını karşılamayı taahhüt eder. Poliçe kapsamında gerçekleşen her
            türlü hasar talebi, sigorta şirketi tarafından en kısa sürede değerlendirilecektir.
          </p>
          <p className="text-xs leading-relaxed text-justify mt-2">
            Müşterilerimiz, olası bir hasar durumunda doğrudan firmamızla veya sigorta şirketi ile irtibata geçebilir.
          </p>
        </div>

        <div className="mt-12 text-center border-t border-b border-black py-6 bg-gray-50">
          <p className="text-xs font-bold mb-1">POLİÇE DURUMU</p>
          <p className="text-2xl font-bold" style={{ color: BRAND_GREEN }}>
            ✓ AKTİF
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Bu poliçe {new Date(policy.bitis_tarihi).toLocaleDateString('tr-TR')} tarihine kadar geçerlidir
          </p>
        </div>
      </div>

      <div className="border-t-2 border-black pt-2 text-center text-xs text-gray-500 mt-auto">
        Bu form, MENTOR Çevre Sağlığı Hizmetleri kalite yönetim sisteminin bir parçasıdır. İzinsiz çoğaltılamaz.
      </div>
    </div>
  );
}
