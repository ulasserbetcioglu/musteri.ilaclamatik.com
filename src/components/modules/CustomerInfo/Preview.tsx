import { A4Header } from '../../common/A4Header';
import { BRAND_LIGHT_GREEN } from '../../../constants';
import type { CustomerData, DocumentSettings } from '../../../types';

interface CustomerInfoPreviewProps {
  formData: CustomerData;
  settings: DocumentSettings;
}

export function CustomerInfoPreview({ formData, settings }: CustomerInfoPreviewProps) {
  return (
    <div 
      className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[15mm] text-black box-border flex flex-col relative" 
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <A4Header title="MÜŞTERİ BİLGİ FORMU" settings={settings} />
      
      <div className="flex-grow">
        <p className="mb-6 text-sm">
          Aşağıdaki bilgiler, hizmet sözleşmesinin hazırlanması ve yasal bildirimlerin yapılabilmesi için 
          hizmet alan firma (Müşteri) tarafından beyan edilmiştir.
        </p>
        
        <table className="w-full border-collapse border border-black text-sm">
          <tbody>
            <tr>
              <td className="border border-black font-bold p-3 w-1/3 align-top" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                FİRMA TİCARİ ÜNVANI
              </td>
              <td className="border border-black p-3 uppercase font-semibold">
                {formData.ticariUnvan}
              </td>
            </tr>
            <tr>
              <td className="border border-black font-bold p-3 w-1/3 align-top" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                FAALİYET KONUSU
              </td>
              <td className="border border-black p-3">
                {formData.faaliyetKonusu}
              </td>
            </tr>
            <tr>
              <td className="border border-black font-bold p-3 w-1/3 align-top" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                AÇIK ADRES (MERKEZ)
              </td>
              <td className="border border-black p-3">
                {formData.adres}
              </td>
            </tr>
            <tr>
              <td className="border border-black font-bold p-3 w-1/3" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                VERGİ DAİRESİ
              </td>
              <td className="border border-black p-3">
                {formData.vergiDairesi}
              </td>
            </tr>
            <tr>
              <td className="border border-black font-bold p-3 w-1/3" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                VERGİ NUMARASI
              </td>
              <td className="border border-black p-3 font-mono">
                {formData.vergiNo}
              </td>
            </tr>
            <tr>
              <td className="border border-black font-bold p-3 w-1/3" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                MERSİS NUMARASI
              </td>
              <td className="border border-black p-3 font-mono">
                {formData.mersisNo}
              </td>
            </tr>
            <tr>
              <td className="border border-black font-bold p-3 w-1/3" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                TELEFON
              </td>
              <td className="border border-black p-3">
                {formData.telefon}
              </td>
            </tr>
            <tr>
              <td className="border border-black font-bold p-3 w-1/3" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                E-POSTA
              </td>
              <td className="border border-black p-3">
                {formData.eposta}
              </td>
            </tr>
            <tr>
              <td className="border border-black font-bold p-3 w-1/3 align-top py-6" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                YETKİLİ KİŞİ / ÜNVAN
              </td>
              <td className="border border-black p-3 py-6">
                <div className="font-bold">{formData.yetkiliKisi}</div>
                <div className="text-gray-600 italic">{formData.yetkiliUnvan}</div>
              </td>
            </tr>
            <tr>
              <td className="border border-black font-bold p-3 w-1/3" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                YETKİLİ CEP TEL
              </td>
              <td className="border border-black p-3">
                {formData.yetkiliTel}
              </td>
            </tr>
            <tr>
              <td className="border border-black font-bold p-3 w-1/3" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                HİZMET BAŞLANGIÇ
              </td>
              <td className="border border-black p-3">
                {formData.hizmetBaslangicTarihi.split('-').reverse().join('.')}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-16 flex justify-between px-4">
          <div className="text-center w-1/3">
            <h4 className="font-bold mb-1">MÜŞTERİ YETKİLİSİ</h4>
            <div className="text-xs mb-8">(Kaşe - İmza)</div>
            <div className="border-b border-black w-full"></div>
            <div className="text-xs mt-1">{formData.yetkiliKisi}</div>
          </div>
          <div className="text-center w-1/3">
            <h4 className="font-bold mb-1">MENTOR YETKİLİSİ</h4>
            <div className="text-xs mb-8">(Kaşe - İmza)</div>
            <div className="border-b border-black w-full"></div>
            <div className="text-xs mt-1">Operasyon Müdürü</div>
          </div>
        </div>
      </div>
      
      <div className="border-t-2 border-black pt-2 text-center text-xs text-gray-500 mt-4">
        Bu form, Sistem İlaçlama Sanayi ve Ticaret Limited Şirketi (PestMentor) kalite yönetim sisteminin bir parçasıdır. ilaclamatik.com tarafından otomatik olarak oluşturulmuştur. İzinsiz çoğaltılamaz.
      </div>
    </div>
  );
}