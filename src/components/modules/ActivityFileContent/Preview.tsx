import { A4Header } from '../../common/A4Header';
import { BRAND_GREEN, BRAND_LIGHT_GREEN } from '../../../constants';
import type { CustomerData, DocumentSettings } from '../../../types';

interface ActivityFileContentPreviewProps {
  customerData: CustomerData;
  settings: DocumentSettings;
}

const contentItems = [
  {
    no: 1,
    title: '1.1. FAALIYET DOSYASI İÇERİĞİ',
    description: 'Dosyanın "İçindekiler" kısmıdır. Denetçinin aradığı belgeyi hızlıca bulmasını sağlayan sayfa numaralarının veya bölüm adlarının olduğu listedir.',
    required: true
  },
  {
    no: 2,
    title: '1.2. MÜŞTERİ BİLGİLERİ',
    description: 'Hizmeti alan firmanın (müşterinin) resmi ticari ünvanı, vergidairesi, vergi numarası, açık adresi ve iletişim bilgilerinin bulunduğu bilgi formudur.',
    required: true
  },
  {
    no: 3,
    title: '1.3. MÜŞTERİ ŞUBELERİNİN BİLGİLERİ',
    description: 'Eğer hizmet alan firma zincir bir işletmeyse (örneğin bir market zincirinin X şubesi), hizmetin verildiği o spesifik şubenin yetkilisi, metrekaresi ve özel konum bilgilerini içerir.',
    required: true
  },
  {
    no: 4,
    title: '2.1. HİZMET SÖZLEŞMESİ',
    description: 'Hizmeti veren (Pestmentor) ile Müşteri arasında imzalanmış, hizmetin kapsamını, süresini, bedelini, garanti koşullarını ve yasal yükümlülükleri belirleyen, her iki tarafça kaşelenip imzalanmış resmi hukuki belgedir.',
    required: true
  },
  {
    no: 5,
    title: '3.1. İZİN VE RUHSATLARI',
    description: 'Hizmet veren firmanın (Pestmentor) Sağlık Bakanlığı\'ndan aldığı "Biyosidal Ürün Uygulama İzin Belgesi"dir. Bu belge olmadan yapılan ilaçlama yasaktır. Ayrıca firmanın vergi levhası ve ticaret sicil gazetesi de burada bulunabilir.',
    required: true
  },
  {
    no: 6,
    title: '3.2. MESUL MÜDÜR VE OPERATÖR SERTİFİKALARI',
    description: 'Mesul Müdür: İlaçlamayı planlayan yetkili kişinin diploması ve bakanlık sertifikası. Operatör: Sahada fiilen ilaçlamayı yapan personelin "Biyosidal Ürün Uygulayıcı Sertifikası". Uygulamayı yapan kişinin yetkinliğini kanıtlar.',
    required: true
  },
  {
    no: 7,
    title: '4.1. ZARARLI MÜCADELESİ EKİPMAN KROKİSİ',
    description: 'İşletmenin kuş bakışı planı üzerinde; kemirgen istasyonlarının, feromon tuzakların veya LFT (Sinek tutucu) cihazlarının nerede olduğunu gösteren numaralandırılmış yerleşim planıdır (Harita).',
    required: true
  },
  {
    no: 8,
    title: '4.2. EKİPMAN TAKİP FORMLARI',
    description: 'Krokide yer alan istasyonların (örneğin 1\'den 50\'ye kadar) kontrol edildiğini, hangisinin kırık olduğunu, hangisinde aktivite (fare yemi yenmiş mi?) görüldüğünü gösteren kontrol çizelgeleridir.',
    required: true
  },
  {
    no: 9,
    title: '5.1. EK-1 BİYOSİDAL ÜRÜN UYGULAMA İŞLEM FORMU (FAALİYET RAPORU)',
    description: 'Mevzuata göre her ilaçlama sonrası doldurulması zorunlu olan resmi formdur. Hangi ilacın, ne miktarda, hangi yöntemle, nereye uygulandığını ve hangi haşereye karşı yapıldığını gösterir. Uygulayıcı ve müşteri tarafından imzalanmalıdır.',
    required: true
  },
  {
    no: 10,
    title: '5.2. ONAYLI BİYOSİDAL ÜRÜN LİSTESİ',
    description: 'İşletmede kullanılması planlanan tüm ilaçların (insektisit, rontentisit vb.) toplu listesidir.',
    required: true
  },
  {
    no: 11,
    title: '5.3. BİYOSİDAL ÜRÜN KULLANIM KARTI',
    description: 'Genellikle stok takibi veya spesifik bir ürünün işletmede kümülatif olarak ne kadar kullanıldığını (Yıllık toplam kullanım miktarı vb.) gösteren takip kartıdır.',
    required: false
  },
  {
    no: 12,
    title: '5.4. BİYOSİDAL ÜRÜN RUHSATLARI, MSDS VE ETİKET BİLGİLERİ',
    description: 'Ruhsat: İlacın Sağlık Bakanlığı tarafından onaylandığını gösteren belge. MSDS (GBF - Güvenlik Bilgi Formu): İlacın içerdiği kimyasal riskleri, zehirlenme anında yapılacak ilk yardımı ve depolama koşullarını anlatan teknik belge. Etiket: İlaç ambalajının fotokopisi.',
    required: true
  },
  {
    no: 13,
    title: '6.1. ATIK İMHA BELGESİ',
    description: 'Boşalan ilaç ambalajlarının veya toplanan kemirgen ölülerinin rastgele çöpe atılmadığını, lisanslı atık bertaraf firmalarına teslim edildiğini kanıtlayan belgelerdir. Çevre mevzuatı açısından önemlidir.',
    required: true
  },
  {
    no: 14,
    title: '3.3. FUMİGASYON RUHSATI',
    description: 'Eğer hizmet alan firma zincir bir işletmeyse (örneğin bir market zincirinin X şubesi), hizmetin verildiği o spesifik şubenin yetkilisi, metrekaresi ve özel konum bilgilerini içerir.',
    required: false
  },
  {
    no: 15,
    title: '5.5. BİYOSİDAL ÜRÜN GRUPLARI LİSTESİ',
    description: '',
    required: false
  },
  {
    no: 16,
    title: '4.3. TREND ANALİZ, RİSK DEĞERLENDİRME, EYLEM AKSİYON PLANI',
    description: '',
    required: false
  },
  {
    no: 17,
    title: '4.3. MALİ SORUMLULUK SİGORTA POLİÇESİ',
    description: 'İlaçlama sırasında bir müşterinin eşyasına zarar verilirse sigortanın karşılayacağına dair belge.',
    required: false
  },
  {
    no: 18,
    title: '4.3. MÜŞTERİ ŞİKAYET, ÖNERİ VE/VEYA MEMNUNİYET FORMLARI',
    description: 'Müşterinin geçmiş şikayetlerinin nasıl çözüldüğünü gösteren kayıtlar.',
    required: false
  },
  {
    no: 19,
    title: '4.3. ACİL ÇAĞRI BİLGİLERİ, ACİL DURUM BİLGİLENDİRME METNİ',
    description: '',
    required: false
  }
];

export function ActivityFileContentPreview({ customerData, settings }: ActivityFileContentPreviewProps) {
  return (
    <div 
      className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[15mm] text-black box-border flex flex-col relative" 
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <A4Header title="FAALİYET DOSYASI İÇERİĞİ" settings={settings} />
      
      <div className="flex-grow">
        <div className="mb-4 text-sm">
          <strong>Müşteri:</strong> {customerData.ticariUnvan}
        </div>
        
        <div className="mb-6 text-center">
          <h2 
            className="text-lg font-bold text-white py-2 px-4 uppercase" 
            style={{ backgroundColor: BRAND_GREEN }}
          >
            ZARARLI MÜCADELESİ FAALİYET DOSYASI - İÇİNDEKİLER
          </h2>
        </div>

        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr style={{ backgroundColor: BRAND_LIGHT_GREEN }}>
              <th className="border border-black p-2 w-8 text-center font-bold">NO</th>
              <th className="border border-black p-2 text-left font-bold">EVRAK ADI</th>
              <th className="border border-black p-2 text-left font-bold">EVRAK AÇIKLAMALARI</th>
              <th className="border border-black p-2 w-20 text-center font-bold">BULUNMA ZORUNLULUĞU</th>
            </tr>
          </thead>
          <tbody>
            {contentItems.map((item) => (
              <tr key={item.no} className={item.no % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="border border-black p-2 text-center font-bold">{item.no}</td>
                <td className="border border-black p-2 font-semibold text-[10px]">{item.title}</td>
                <td className="border border-black p-2 text-[9px] leading-tight">{item.description}</td>
                <td className="border border-black p-2 text-center">
                  {item.required ? (
                    <span className="text-red-600 font-bold">✓</span>
                  ) : (
                    <span className="text-gray-400">○</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 text-xs text-gray-600">
          <p><strong>Not:</strong> ✓ işareti bulunan evraklar yasal olarak bulundurulması zorunlu belgelerdir.</p>
          <p className="mt-1">○ işareti bulunan evraklar isteğe bağlı olarak dosyaya eklenebilir.</p>
        </div>
      </div>
      
      <div className="border-t-2 border-black pt-2 text-center text-xs text-gray-500 mt-4">
        Bu form, Sistem İlaçlama Sanayi ve Ticaret Limited Şirketi (PestMentor) kalite yönetim sisteminin bir parçasıdır. ilaclamatik.com tarafından otomatik olarak oluşturulmuştur. İzinsiz çoğaltılamaz.
      </div>
    </div>
  );
}