import { A4Header } from '../../common/A4Header';
import { BRAND_LIGHT_GREEN } from '../../../constants';
import type { CustomerData, Branch, DocumentSettings } from '../../../types';

interface BranchInfoPreviewProps {
  customerData: CustomerData;
  branches: Branch[];
  settings: DocumentSettings;
}

export function BranchInfoPreview({ customerData, branches, settings }: BranchInfoPreviewProps) {
  return (
    <div 
      className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[15mm] text-black box-border flex flex-col relative" 
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <A4Header title="MÜŞTERİ ŞUBELERİNİN BİLGİLERİ" settings={settings} />
      
      <div className="flex-grow">
        <div className="mb-6 text-sm">
          <strong>Ana Müşteri:</strong> {customerData.ticariUnvan}
        </div>

        <p className="mb-6 text-sm">
          Bu form, zincir işletmelerin şube bilgilerini içermektedir. Her şubenin yetkili kişisi, 
          metrekaresi ve özel konum bilgileri aşağıda detaylandırılmıştır.
        </p>
        
        {branches.length > 0 ? (
          <div className="space-y-6">
            {branches.map((branch, index) => (
              <div key={branch.id} className="border-2 border-black">
                <div 
                  className="text-center font-bold py-2 px-4 text-white text-sm"
                  style={{ backgroundColor: '#006837' }}
                >
                  ŞUBE #{index + 1} BİLGİLERİ
                </div>
                
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    <tr>
                      <td className="border border-black font-bold p-3 w-1/3" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                        ŞUBE ADI
                      </td>
                      <td className="border border-black p-3 font-semibold">
                        {branch.subeAdi || '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black font-bold p-3" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                        YETKİLİ KİŞİ
                      </td>
                      <td className="border border-black p-3">
                        {branch.yetkili || '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black font-bold p-3" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                        METREKARE
                      </td>
                      <td className="border border-black p-3">
                        {branch.metrekare ? `${branch.metrekare} m²` : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black font-bold p-3 align-top" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                        ADRES
                      </td>
                      <td className="border border-black p-3">
                        {branch.adres || '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black font-bold p-3" style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
                        TELEFON
                      </td>
                      <td className="border border-black p-3">
                        {branch.telefon || '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}

            <div className="mt-8 text-center">
              <div className="inline-block border-2 border-black p-4 bg-gray-50">
                <h4 className="font-bold mb-2">TOPLAM ŞUBE SAYISI</h4>
                <div className="text-2xl font-bold">{branches.length}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">Henüz şube bilgisi eklenmemiş</p>
            <p className="text-gray-400 text-sm mt-2">
              Bu müşteri için şube bilgileri düzenleyici panelden eklenebilir.
            </p>
          </div>
        )}

        <div className="mt-12 flex justify-between px-4">
          <div className="text-center w-1/3">
            <h4 className="font-bold mb-1">MÜŞTERİ YETKİLİSİ</h4>
            <div className="text-xs mb-8">(Kaşe - İmza)</div>
            <div className="border-b border-black w-full"></div>
            <div className="text-xs mt-1">{customerData.yetkiliKisi || 'Yetkili Kişi'}</div>
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
        Bu form, MENTOR Çevre Sağlığı Hizmetleri kalite yönetim sisteminin bir parçasıdır. İzinsiz çoğaltılamaz.
      </div>
    </div>
  );
}