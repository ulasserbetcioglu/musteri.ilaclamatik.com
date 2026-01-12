import { A4Header } from '../../common/A4Header';
import { BRAND_GREEN } from '../../../constants';
import type { CustomerData, DocumentSettings } from '../../../types';

interface IPMContractPreviewProps {
  customerData: CustomerData;
  settings: DocumentSettings;
}

export function IPMContractPreview({ customerData, settings }: IPMContractPreviewProps) {
  const currentDate = new Date().toLocaleDateString('tr-TR');

  return (
    <div className="space-y-8">
      {/* Page 1 */}
      <div
        className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[15mm] text-black box-border flex flex-col relative"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        <A4Header title="ENTEGRE ZARARLI YÖNETİMİ (IPM) SÖZLEŞMESİ" settings={settings} />

        <div className="flex-grow text-[11pt] leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2" style={{ color: BRAND_GREEN }}>
              {customerData.ticariUnvan || 'MÜŞTERİ FİRMA ADI'}
            </h1>
            <h2 className="text-lg font-bold mb-3">
              ENTEGRE ZARARLI YÖNETİMİ<br />
              (IPM)
            </h2>
            <div className="text-base font-semibold">
              {currentDate}
            </div>
          </div>

          <div className="space-y-4">
            <section>
              <h3 className="font-bold text-sm mb-2">1- AMAÇ:</h3>
              <p className="text-justify text-xs">
                Bu program, {customerData.adres || 'işletme adresi'} adresinde kurulu {customerData.ticariUnvan || 'işletme'}
                insan sağlığını, hammadde ve ürün kalitesini bozacak, olumsuz yönde etkileyecek zararlılara karşı yürütülecek
                entegre zararlı yönetimi (Integrated Pest Management-IPM) çalışmalarını kapsar.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-sm mb-2">2- KISALTMALAR ve KAVRAMLAR</h3>
              <div className="space-y-1 text-[10pt]">
                <p><strong>İŞLETME:</strong> {customerData.ticariUnvan || 'Müşteri Firması'} kısaltılmış adı olarak kullanılmıştır.</p>
                <p><strong>SÖZLEŞMELİ FİRMA:</strong> MENTOR Çevre Sağlığı Hizmetleri'nin kısaltılmış adı olarak kullanılmıştır.</p>
                <p><strong>MENTOR:</strong> IPM'den sorumlu sözleşmeli firmanın kısaltılmış adı olarak kullanılmıştır.</p>
                <p><strong>PEST KONTROL:</strong> Genel olarak zararlılara karşı yapılan tüm faaliyetler.</p>
                <p><strong>ZARARLI:</strong> Haşere, pest</p>
                <p><strong>RUTİN:</strong> Sözleşme kapsamında yer alan aylık ziyaret periyodu veya sözleşme kapsamındaki uygulamalar.</p>
                <p><strong>GMP:</strong> Good Manufacturing Practices – İyi Üretim Uygulamaları</p>
                <p><strong>IPM:</strong> Integrated Pest Management: Kimyasal olmayan yöntemlerin de kullanıldığı Entegre Zararlı Mücadelesi yaklaşımı.</p>
                <p><strong>PESTİSİT:</strong> Zararlılara karşı kullanılan genellikle kimyasal ilaçların genel adı.</p>
                <p><strong>İNSEKTİSİT:</strong> Böcek öldürücü pestisit grubu kimyasalları.</p>
                <p><strong>RODENTİSİT:</strong> Kemirgen öldürücü pestisit grubu kimyasalları.</p>
                <p><strong>BİYOSİT:</strong> Sağlık Bakanlığı onaylı zararlı kontrol kimyasallarının ve malzemelerinin genel adı</p>
                <p><strong>LFT:</strong> Işıklı Sinek Tutucu – Yapışkanlı levhalı</p>
                <p><strong>SORUMLU:</strong> IPM'den sorumlu ürün güvenliği yetkilisi: {customerData.yetkiliKisi || 'Yetkili Kişi'}</p>
                <p><strong>ACİL ÇAĞRI:</strong> Programın 5. Maddesinde ayrıntılara yer verilmiştir.</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-sm mb-2">3- HEDEF ZARARLILAR</h3>
              <p className="mb-2 text-xs">
                Gıda ve ürün güvenliği açısından rutin kontrol, acil müdahale, takip, teşhis veya denetleme faaliyetlerinde
                aşağıda yer alan zararlılarla ilgili faaliyetler IPM perspektifinde gerçekleştirilir.
              </p>

              <div className="grid grid-cols-2 gap-3 text-[9pt]">
                <div>
                  <h4 className="font-bold mb-1">3.1- KEMİRGENLER</h4>
                  <div className="ml-4 space-y-0.5">
                    <p>3.1.1- Fındık faresi / Mus musculus</p>
                    <p>3.1.2- Çatı sıçanı / Rattus rattus</p>
                    <p>3.1.3- Lağım sıçanı / Rattus norvegicus</p>
                    <p>3.1.4- Tarla faresi / Microtus spp.</p>
                  </div>

                  <h4 className="font-bold mb-1 mt-3">3.2- SİNEKLER</h4>
                  <div className="ml-4 space-y-0.5">
                    <p>3.2.1- Karasinek / Musca domestica</p>
                    <p>3.2.2- Sivrisinek / Culex spp.</p>
                    <p>3.2.3- Drenaj sinekleri / Psychodidae spp.</p>
                    <p>3.2.4- Meyve sinekleri / Drosophila spp.</p>
                    <p>3.2.5- Diğer sinekler / Diptera grubunun diğer üyeleri</p>
                  </div>

                  <h4 className="font-bold mb-1 mt-3">3.3- DEPOLANMIŞ ÜRÜN ZARARLILARI</h4>
                  <div className="ml-4 space-y-0.5">
                    <p>3.3.1- Un bitleri / Tribolium spp.</p>
                    <p>3.3.2- Kağıt biti / Psocoptera spp.</p>
                    <p>3.3.3- Gıda güveleri / Plodia interpunctella, Ephestia spp.</p>
                    <p>3.3.4- Pirinç/Buğday bitleri / Sitophilus spp.</p>
                    <p>3.3.5- Testereli bitler / Oryzaephilus spp.</p>
                  </div>

                  <h4 className="font-bold mb-1 mt-3">3.4- BÖCEKLER</h4>
                  <div className="ml-4 space-y-0.5">
                    <p>3.4.1- Alman hamamböceği / Blatella germanica</p>
                    <p>3.4.2- Amerikan hamamböceği / Periplaneta americana</p>
                    <p>3.4.3- Şark hamamböceği / Blatta orientalis</p>
                    <p>3.4.4- Depo zararlıları dışında Kınkanatlı böcekler / Coleoptera spp.</p>
                    <p>3.4.5- Karıncalar</p>
                    <p>3.4.6- Tespih böcekleri</p>
                    <p>3.4.7- Örümcekler</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-1">3.5- DİĞER UÇKUNLAR</h4>
                  <div className="ml-4 space-y-0.5">
                    <p>3.5.1- Bal arıları</p>
                    <p>3.5.2- Yaban arıları</p>
                    <p>3.5.3- Kelebekler, Gece kelebekleri</p>
                    <p>3.5.4- Kınkanatlı uçkunlar</p>
                    <p>3.5.5- Uçan karıncalar</p>
                  </div>

                  <h4 className="font-bold mb-1 mt-3">3.6- KUŞLAR</h4>
                  <div className="ml-4 space-y-0.5">
                    <p>3.6.1- Güvercin</p>
                    <p>3.6.2- Serçe</p>
                    <p>3.6.3- Kırlangıç</p>
                    <p>3.6.4- Karga</p>
                  </div>

                  <h4 className="font-bold mb-1 mt-3">3.7- DİĞER ZARARLILAR</h4>
                  <div className="ml-4 space-y-0.5">
                    <p>3.7.1- Kedi</p>
                    <p>3.7.2- Köpek</p>
                    <p>3.7.3- Kertenkele</p>
                    <p>3.7.4- Pireler</p>
                    <p>3.7.5- Keneler</p>
                  </div>

                  <h4 className="font-bold mb-1 mt-3">3.8- DOĞAL YAŞAMA AİT CANLILAR</h4>
                  <div className="ml-4 space-y-0.5">
                    <p>3.8.1- Yılan</p>
                    <p>3.8.2- Baykuş</p>
                    <p>3.8.3- Yırtıcı Kuşlar (Şahin, Doğan, Atmaca)</p>
                    <p>3.8.4- Yarasa</p>
                    <p>3.8.5- Tilki, Yabani tavşan, Sincap</p>
                    <p>3.8.6- Zararlı grubu dışındaki kuş türleri</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="border-t-2 border-black pt-2 text-center text-[9pt] text-gray-500 mt-3">
          Bu sözleşme, MENTOR Çevre Sağlığı Hizmetleri kalite yönetim sisteminin bir parçasıdır. İzinsiz çoğaltılamaz.
        </div>
      </div>

      {/* Page 2 */}
      <div
        className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[15mm] text-black box-border flex flex-col relative page-break-before"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        <A4Header title="ENTEGRE ZARARLI YÖNETİMİ (IPM) SÖZLEŞMESİ" settings={settings} />

        <div className="flex-grow text-[11pt] leading-relaxed">
          <div className="space-y-4">
            <section>
              <h3 className="font-bold text-sm mb-2">4. İLGİLİ DOKÜMANLAR</h3>
              <p className="text-xs mb-2">Entegre Zararlı Yönetimine ilişkin tüm dokümantasyon, özel olarak ayrıca belirtilenler dışında, sözleşmeli firma tarafından hazırlanır. Bu evraklar şu şekildedir:</p>
              <div className="text-[9pt] ml-4 space-y-0.5">
                <p>4.1- Entegre Zararlı Yönetimi – IPM Sözleşmesi</p>
                <p>4.2- Yazılı Entegre Zararlı Yönetimi – IPM Programı</p>
                <p>4.3- Acil Durum Bilgileri</p>
                <p>4.4- Sözleşmeli Firma İletişim ve Adres Bilgileri</p>
                <p>4.5- Yıllık Rutin Ziyaret Programı</p>
                <p>4.6- Sağlık Bakanlığı Uygulama İzin Belgesi</p>
                <p>4.7- Mesul Müdürlük Belgesi</p>
                <p>4.8- Mesul Müdür Sertifikası</p>
                <p>4.9- Mesul Müdür Hizmet Sözleşmesi</p>
                <p>4.10- TSE-8358 Hizmet Yeterlilik Belgesi</p>
                <p>4.11- ISO 9001:2008 Kalite Belgesi</p>
                <p>4.12- Mali Mesuliyet Sigortası</p>
                <p>4.13- Zararlı Risk Analizi</p>
                <p>4.14- İzleme Aparatları Yerleşim Planları</p>
                <p>4.15- Servis Raporları</p>
                <p>4.16- Sağlık Bakanlığı Uygulama Formları (Uygulama Yapılmışsa)</p>
                <p>4.17- Aylık/Sezonluk Değerlendirme Raporları</p>
                <p>4.18- Yem İstasyonları Takip Formları, Trend Analizleri, Aktivite Haritaları</p>
                <p>4.19- Canlı Kapanlar Takip Formları, Trend Analizleri, Aktivite Haritaları</p>
                <p>4.20- ILT Takip Formları, Trend Analizleri, Aktivite Haritaları</p>
                <p>4.21- Böcek İzleme Formları, Trend Analizleri, Aktivite Haritaları</p>
                <p>4.22- Feromonlu Tuzaklar İzleme Formları, Trend Analizleri, Aktivite Haritaları</p>
                <p>4.23- Geçici Yerleşim Planı ve Bu Plandaki Aparatların Formları ve Analizleri</p>
                <p>4.24- Onaylı Pestisit Listesi</p>
                <p>4.25- Pestisit Kullanım Kartı</p>
                <p>4.26- Kullanılan Pestisitlere Ait MSDS ve Etiketler</p>
                <p>4.27- Sözleşmeli Firma Teknisyenleri Sertifika ve Eğitim Belgeleri</p>
                <p>4.28- İşletmenin Eğitim Belgeleri</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-sm mb-2">5. IPM UYGULAMALARI</h3>
              <p className="text-xs mb-2">Uygun kontrol, zararlıların varlığının işaretinin çok çabuk görülmesi ve zararlı çoğalıp yayılmadan önce yok edilmesi şeklinde yapılır. Bu operasyon önce gözlem, tespit sonra uygulama olarak gerçekleşir.</p>
              <p className="text-xs mb-2">Entegre Zararlı Yönetimi Sistemi aşağıdaki ana maddelerden oluşur:</p>
              <div className="text-[10pt] ml-4 mb-2">
                <p>1- Gözlem, inceleme, tespit.</p>
                <p>2- Kimyasal Olmayan Yöntemlerin Öncelikli Olduğu Uygulamalar</p>
                <p>3- Önleyici ve Düzenleyici İçerikli Raporlama</p>
              </div>

              <h4 className="font-bold text-xs mb-1 mt-3">5.1- GÖZLEM UYGULAMALARI:</h4>
              <p className="text-[10pt] text-justify mb-2">
                Kontrol çalışmalarından önce zararlı popülasyonunun türü ve yoğunluğu saptanarak hayata geçirilecek mücadelenin yöntemi ve zamanı belirlenir. Daha önceki uygulamaların etkinlikleri test edilir.
              </p>
              <p className="text-[10pt] text-justify mb-2">
                Gözlem uygulamaları, işletmelerin dış çevreleri ve iç alanlarının tamamını içerir. Bu kapsamda, üretim alanları, ambalaj, hammadde ve ürün depo alanları, sosyal birimler ve bina dış çevreleri yer alır.
              </p>
              <p className="text-[10pt] text-justify mb-2">
                Belirlenen alanlarda kuvvetli bir el feneri yardımı ile yapılan inceleme sırasındaki gözlemlere ek olarak; yapışkanlı sinek tutucu cihazlardan (LFT), canlı fare yakalama kapanlarından, böcek tuzaklarından, feromonlu güve traplarından, yem istasyonlarından ve diğer izleme aparatlarından yararlanılır.
              </p>

              <p className="text-[10pt] mb-1"><strong>Gözlemlerin Amacı:</strong></p>
              <div className="text-[9pt] ml-4 mb-2">
                <p>a) Her bir kapan ve gözlem noktasını kontrol ederek herhangi bir zararlı varlığını teşhis ve rapor etmek,</p>
                <p>b) Zararlı varsa kaynağını ve yayılma alanını bulmak,</p>
                <p>c) Belirlenen zararlı problemini yok etmek için alınacak önlemi belirlemek</p>
              </div>

              <p className="text-[10pt] text-justify mb-2">
                <strong>Takip gözlemleri:</strong> Herhangi bir zararlı izi görüldüğünde, sorunlu alana daha fazla odaklanarak sorunun giderilmesi için rutin çalışmalara ek olarak yapılan gözlemlerdir.
              </p>
              <p className="text-[10pt] text-justify mb-2">
                Takip gözlemlerinin sözleşmeli firmanın rutin kontrolleri dışında yapılması gerektiği durumlarda işletme personeli eğitilerek gerekli desteği vermesi sağlanır.
              </p>

              <p className="text-[10pt] text-justify mb-2">
                <strong>Acil Çağrılar:</strong> Yapılan yakın takipler sırasında sıklıkla zararlı görülmesi veya işletmenin herhangi bir yerinde zararlılarla ilgili bir sorun ile karşılaşıldığında sözleşmeli firmaya yapılan çağrılardır. Acil çağrılar insan sağlığı, zehirlenmeler, çalışma koşulları ve ürün güvenliğine yönelik zararlılar veya zararlılara karşı uygulanan yöntemlerden kaynaklandığı düşünülen birinci dereceden tehlikelerde uygulanır. Sözleşmeli firma 24 saat içerisinde çağrıya cevap vererek zararlı sorununu gidermek için gerekli çalışmaları başlatır.
              </p>
            </section>
          </div>
        </div>

        <div className="border-t-2 border-black pt-2 text-center text-[9pt] text-gray-500 mt-3">
          Bu sözleşme, MENTOR Çevre Sağlığı Hizmetleri kalite yönetim sisteminin bir parçasıdır. İzinsiz çoğaltılamaz.
        </div>
      </div>

      {/* Page 3 */}
      <div
        className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[15mm] text-black box-border flex flex-col relative page-break-before"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        <A4Header title="ENTEGRE ZARARLI YÖNETİMİ (IPM) SÖZLEŞMESİ" settings={settings} />

        <div className="flex-grow text-[11pt] leading-relaxed">
          <div className="space-y-4">
            <section>
              <h4 className="font-bold text-xs mb-2">5.2- ÖNLEYİCİ UYGULAMALAR</h4>
              <p className="text-[10pt] text-justify mb-2">
                Zararlı kontrolü öncelikle korunma yoluyladır. Zararlıların söz konusu bölgenin dışında bırakılmaları en iyi yoldur ve bunu sağlamanın en uygun şekli: zararlıların yaşayamayacağı şartları barındıran iyi bina dizaynı, zararlıların işletme içerisine girişini engelleyecek düzeyde yalıtım, zamanında gerektiği şekilde yapılan tamiratların/bakımlar, zararlı yönetimi konusunda eğitimli personel, titizlikle hayata geçirilen temizlik uygulamaları, işletme yönetiminin gıda güvenliği politikalarını sürdürmedeki kararlılığı ve katkılarıdır.
              </p>
              <p className="text-[10pt] text-justify mb-2">
                Önleyici bu uygulamalar IPM'in özü olan minimum kimyasal kullanımına olanak sağlar.
              </p>
            </section>

            <section>
              <h4 className="font-bold text-xs mb-2">5.3- RUTİN KONTROLLER</h4>
              <p className="text-xs mb-2">Sözleşmeli firma gıda/ürün güvenliği açısından gözlemlerini aşağıda belirtilen zararlılarla ilgili olarak IPM perspektifinde gerçekleştirecektir.</p>

              <h5 className="font-bold text-[10pt] mb-1 mt-2">5.3.1- KEMİRGENLER</h5>
              <p className="text-[9pt] text-justify mb-2">
                Dış alanda bulunan yem istasyonları, iç alanlarda bulunan canlı kapanlar, diğer fiziksel önlemler gözden geçirilecek; aktif yuvalar varsa müdahale edilecektir. Aktivite durumu ve risk görülen noktalarda alınması gereken önlemler raporlarda belirtilecektir. Yem istasyonları ve canlı kapanların kontrol tarihleri aparatlar üzerinde bulunmalıdır.
              </p>

              <h5 className="font-bold text-[10pt] mb-1 mt-2">5.3.2- SİNEKLER</h5>
              <p className="text-[9pt] text-justify mb-2">
                Dış alanlarda sineklerin ve diğer uçucu zararlıların üremesine imkan veren koşulların kaldırılması için işletme yönetimine sözleşmeli firma tarafından raporlama yapılır. İç alanlara sinek girişini engelleyecek önlemler belirlenir ve rapor edilir. İç alanda kaynak bulan küçük sinekler için kanal içleri ve giderler rutin olarak kontrol edilir.
              </p>
              <p className="text-[9pt] text-justify mb-2">
                Kanal sineklerinin kontrolünde kanal ve gider içlerinin temizliği büyük rol oynadığı için söz konusu temizlikler aksatılmadan işletme tarafından sürdürülür. Sineklere karşı izleme veya kontrol amacıyla kullanılan aparatlar bu gözlemler sırasında kontrol edilmelidir. Kontrol tarihleri aparatlar üzerinde yer almalıdır.
              </p>
              <p className="text-[9pt] text-justify mb-2">
                Tüm gözlemlerden ve tespitlerden sonra sineklere karşı ilaçlamaya karar verilir; bu ilaçlamanın zamanının uygunluğu işletme IPM sorumlusu tarafından onaylandıktan sonra geçerlilik taşır.
              </p>

              <h5 className="font-bold text-[10pt] mb-1 mt-2">5.3.3- DEPOLANMIŞ ÜRÜN ZARARLILARI</h5>
              <p className="text-[9pt] text-justify mb-2">
                Depolanmış ürün zararlıları monitörlerde ve/veya incelemelerde tespit edildikten sonra kontrol için gerekli öneriler ve çözümler sözleşmeli firma tarafından sunulur. Depolanmış ürün zararlılarının tespitinde ve takibinde feromonlu tuzaklar kullanılıyorsa feromonların değişimi zamanında yapılır. Bu süre 45 günü geçemez. Feromonlu tuzakların kontrol tarihleri aparat üzerinde yer gösterilir. Gözlemler, tespitler ve ürün riskine bağlı olarak yapılacak fümigasyona kararı İşletmedeki sorumlular karar verir.
              </p>

              <h5 className="font-bold text-[10pt] mb-1 mt-2">5.3.4- BÖCEKLER</h5>
              <p className="text-[9pt] text-justify mb-2">
                Sözleşmeli firma tarafından iç alanlarda ve bina dış çevresinde böceklere karşı rutin kontrollerde gözlem ve gerekli görüldüğünde ilaçlamalar yapılır. Alınması gereken aksiyonlar rapor edilir. Böceklerin ürüne bulaşma riskleri, alınan ve alınacak önlemler değerlendirilir. Böcek popülasyonu takibinde bağlı olarak gerekiyorsa böceğin türüne göre (depo zararlıları dışındaki) gerekli monitör aparatları kullanılır ve kayıtları tutulur.
              </p>
              <p className="text-[9pt] text-justify mb-2">
                İç ve dış alanlarda ilaçlamaya karar verildiğinde, zamanı ve uygulama bölgeleri işletme IPM sorumlusu tarafından onay verildiğinde geçerli hale gelir.
              </p>

              <h5 className="font-bold text-[10pt] mb-1 mt-2">5.3.5- DİĞER UÇKUNLAR</h5>
              <p className="text-[9pt] text-justify mb-2">
                Diğer uçucuların işletmeye ve ürüne yönelik tehdit oluşturmaması için gerekli aksiyonlar sözleşmeli firma tarafından rapor edilecektir. Alınacak önlemlerin ve ilaçlamaların sineklere karşı yürütülen çalışmalarla eşgüdümü sağlanacaktır.
              </p>

              <h5 className="font-bold text-[10pt] mb-1 mt-2">5.3.6- KUŞLAR</h5>
              <p className="text-[9pt] text-justify mb-2">
                Gözlemler her ziyaret sırasında içeride ve dışarıda gerçekleştirilir. Zararlı kuş türü tespiti, alınması gereken önlemler ve riskler sözleşmeli firma tarafından servis raporlarında belirtilecektir. Kuş kontrolüne ilişkin uygulamalar sözleşmede belirtilen rutin faaliyetler içerisinde olmadığı için işletme önerilen aksiyonlardan uygun gördüklerini en kısa sürede hayata geçirmek için çaba gösterir.
              </p>

              <h5 className="font-bold text-[10pt] mb-1 mt-2">5.3.7- DİĞER ZARARLILAR</h5>
              <p className="text-[9pt] text-justify mb-2">
                Dönem dönem karşılaşılan bu tür zararlılara karşı önlemler görüldükçe alınacaktır. Her tür için ayrı ayrı canlı kapanlar ve irrite edici malzemeler kullanılacaktır. Servis, malzeme temini ve ücretlendirme soruna bağlı olarak ayrıca yapılır.
              </p>

              <h5 className="font-bold text-[10pt] mb-1 mt-2">5.3.8- DOĞAL YAŞAMA AİT CANLILAR</h5>
              <p className="text-[9pt] text-justify mb-2">
                Doğal yaşama ait olup, herhangi bir nedenle işletme alanına giren canlılarla ilgili ülkemiz yasalarına göre ve uluslar arası uygulamalara ve teamüllere göre önlemler belirlenir. Bu canlıların öldürülerek eliminasyonu yerine dışarıda tutma ve/veya uzaklaştırma yöntemleri kullanılır. Gerektiğinde yerel ve ulusal yetkili organizasyonlardan destek sağlanması yoluna gidilir.
              </p>
            </section>
          </div>
        </div>

        <div className="border-t-2 border-black pt-2 text-center text-[9pt] text-gray-500 mt-3">
          Bu sözleşme, MENTOR Çevre Sağlığı Hizmetleri kalite yönetim sisteminin bir parçasıdır. İzinsiz çoğaltılamaz.
        </div>
      </div>

      {/* Page 4 */}
      <div
        className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[15mm] text-black box-border flex flex-col relative page-break-before"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        <A4Header title="ENTEGRE ZARARLI YÖNETİMİ (IPM) SÖZLEŞMESİ" settings={settings} />

        <div className="flex-grow text-[11pt] leading-relaxed">
          <div className="space-y-4">
            <section>
              <h3 className="font-bold text-sm mb-2">6- IPM UYGULAMALARININ YÜRÜTÜLMESİ</h3>

              <p className="text-[10pt] mb-2">
                <strong>6.1- IPM:</strong> sözleşmeli firma zararlı kontrolünü entegre bir şekilde ele almayı; çevre, ürün ve insan sağlığı açısından en az kimyasal kullanarak kontrolü sağlamayı (IPM) benimser.
              </p>

              <p className="text-[10pt] mb-2">
                <strong>6.2- ZARARLI TAKİP SİSTEMİ:</strong> Sözleşmeli firma işletmenin iç ve dış alanında zararlıları izlemek ve/veya kontrol etmek için uygun aparatlar kullanarak bir izleme sistemi oluşturur.
              </p>

              <p className="text-[10pt] mb-2 text-justify">
                <strong>6.3- İÇ ALAN APARATLARI:</strong> Kapalı alanlardaki popülasyon takibi toksik materyal içermeyen canlı yakalama kapanları, yapışkan tuzaklar, böcek izleme tuzakları, feromon traplar, EFK/ILT-ışıklı sinek tutucuları v.b. ile sağlanır. Kullanılan aparatların güncellenmiş ve gerçek yerleşim haritaları her zaman dosyada bulundurulur. Kısa vadeli ve geçici yerleşimler yapılmışsa bunlar ayrı bir plan üzerinde gösterilmelidir.
              </p>

              <p className="text-[10pt] mb-2 text-justify">
                <strong>6.4- DIŞ ALAN APARATLARI:</strong> İşletme dış sahasında kemirgen popülasyonunun izlenmesi ve kontrolü için kilitli, iklim değişikliklerine karşı dayanıklı, zehirli yemler için tehlike uyarısı bulunan, numaralandırılmış, duvar etiketleri takılı, bakımlı ve temiz kemirgen yem istasyonu kullanılır. Kullanılan kemirgen yem istasyonlarının aparatların güncellenmiş ve gerçek yerleşim haritaları her zaman dosyada bulundurulur. Kısa vadeli ve geçici yerleşimler yapılmışsa bunlar ayrı bir plan üzerinde gösterilir.
              </p>

              <p className="text-[10pt] mb-2 text-justify">
                <strong>6.5- PESTİSİT KULLANIM İZNİ:</strong> Pest kontrol uygulamalarında işletme IPM sorumlu onayı ve gerekli hazırlıklar olmaksızın, dış alandaki kemirgen yem istasyonlarında kullanılan rodentisitler hariç, pestisit kullanılmayacaktır. Kullanılacak pestisitler onaylı listede bulunmak zorundadır. Yeni bir pestisit kullanılacak ise uygulama tarihinden en az bir gün önceden onayı işletme IPM sorumlusundan alınmış olmalıdır.
              </p>

              <p className="text-[10pt] mb-2 text-justify">
                <strong>6.6- IŞIKLI SİNEK TUTUCULAR:</strong> Sözleşmeli firma tarafından gerekli görülerek önerilen ışıklı sinek tutucu cihazların(LFT) takılması durumunda lambaları en az yılda bir kez değiştirilir. Lambalar kırılmaya/dağılmaya karşı korumalı olmalıdır. Cihazların doldukça ve/veya sayım yapıldıkça değişmesi gereken yapışkan levhaları, gerektiğinde yenilenmelidir.
              </p>

              <p className="text-[10pt] mb-2">
                <strong>6.7- KIRILAN HASAR GÖREN APARATLAR:</strong> İşletmede kullanılan pest kontrol sistemine ait aparatlardan kırılan ve kaybolanlar Sözleşmeli Firma tarafından en kısa sürede işletme IPM sorumlusu bilgilendirilerek yenilenecektir.
              </p>

              <p className="text-[10pt] mb-2">
                <strong>6.8- FEROMONLU TUZAKLAR:</strong> Feromonlu tuzaklar kullanma ihtiyacı doğduğunda feromonlar ve bu feromonların kullanıldığı tuzaklar sözleşmeye uygun olarak değiştirilecektir.
              </p>

              <p className="text-[10pt] mb-2">
                <strong>6.9- YALITIM ÖNERİLERİ:</strong> Zararlıların işletme binasına giriş çıkış yapabilecekleri noktalar sözleşmeli firma tarafından saptanıp gerekli yalıtımların ve onarımların yapılması işletme IPM sorumlusuna yazılı olarak bildirilecektir.
              </p>

              <p className="text-[10pt] mb-2">
                <strong>6.10- RUTİN PERİYOTLAR:</strong> Rutin ziyaretler, ayda 2 kez, olacak şekilde yapılacaktır.
              </p>

              <p className="text-[10pt] mb-2">
                <strong>6.11- ACİL ÇAĞRILAR:</strong> Sözleşmeli Firma acil çağrılarda 24 saat içerisinde işletme alanında gözlem, müdahale, tespit veya değerlendirme için bulunacaktır.
              </p>

              <p className="text-[10pt] mb-2 text-justify">
                <strong>6.12- SERVİS KAYITLARI:</strong> Sözleşmeli Firma tarafından hazırlanan pest kontrol dosyasında bulunması gereken zorunlu belgeler dışında; her servis sonrası hazırlanması gereken raporlar da bu dosyaya konulmalıdır. Servis raporlarında zararlı aktivitesine ilişkin bilgiler ve alınması gereken aksiyonlar mutlaka belirtilmelidir.
              </p>

              <p className="text-[10pt] mb-2">
                <strong>6.13- EĞİTİM:</strong> Sözleşmeli firma sözleşme konusuyla ilgili, içeriği karşılıklı olarak belirlenecek konularda yılda 1 kez eğitim verecektir.
              </p>

              <p className="text-[10pt] mb-2">
                <strong>6.14- PEST KONTROL DOSYASI:</strong> Zararlı kontrolüne ilişkin yerleşim planları, takip formları ve diğer belgeleri içeren dosya sözleşmeli firma tarafından hazırlanacaktır.
              </p>

              <p className="text-[10pt] mb-2 text-justify">
                <strong>6.15- ZİYARET PROGRAMI:</strong> Rutin ziyaretlerin tarihleri en az üç ay önceden işletmeye bildirilecektir. Ayrıca, Rutin ziyaretten 24 saat önce işletmede sorumlu personel haberli kılınarak işletmenin ziyarete uygun olup olmadığı sözleşmeli firma tarafından teyit edilecektir.
              </p>
            </section>
          </div>
        </div>

        <div className="border-t-2 border-black pt-2 text-center text-[9pt] text-gray-500 mt-3">
          Bu sözleşme, MENTOR Çevre Sağlığı Hizmetleri kalite yönetim sisteminin bir parçasıdır. İzinsiz çoğaltılamaz.
        </div>
      </div>

      {/* Page 5 */}
      <div
        className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[15mm] text-black box-border flex flex-col relative page-break-before"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        <A4Header title="ENTEGRE ZARARLI YÖNETİMİ (IPM) SÖZLEŞMESİ" settings={settings} />

        <div className="flex-grow text-[11pt] leading-relaxed">
          <div className="space-y-4">
            <section>
              <h3 className="font-bold text-sm mb-2">7- KİMYASAL UYGULAMASI</h3>
              <p className="text-[10pt] mb-2 text-justify">
                <strong>Kimyasal Mücadele:</strong> Pestisit/biyosit adı verilen yemler/zehirler/ilaçlarla zararlıların kontrol altına alınmasıdır. Kemirgenler için kullanılan yemler uygun yem istasyonları ile yuvaların çevresine, gezinti yolları üzerine ve besin kaynakları yakınlarına konarak fareler tarafından tüketilmesi sağlanır.
              </p>
              <p className="text-[10pt] mb-2 text-justify">
                Uçan ve yürüyen haşereler için potansiyel yuvalandıkları alanlarda kimyasallar gözlemlere ve tespitlere bağlı olarak gerektiğinde kullanılır. Gıda üretim alanlarının içinde toksik rodentisitler ve yemler kullanılmaz, canlı yakalama kapanları kullanılır.
              </p>
              <p className="text-[10pt] mb-2">
                İşletmelerde görülen farklı zararlı aktivasyonları için anlaşmalı firma MENTOR, yasal şartlara uygun olmak koşulu ile farklı kontrol yolları geliştirebilir.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-sm mb-2">8- UYGULAMA PERSONELİ</h3>
              <p className="text-[10pt] mb-2">
                <strong>8.1-</strong> Zararlı kontrol çalışmalarında görevli personel sözleşmeli firma MENTOR tarafından temin edilir. Bu çalışmalarda yer alacak elemanlar ekip sorumlusu statüsünde imza yetkili ve sigortalı olacak, aldıkları eğitimi gösteren belgeleri ibraz edeceklerdir.
              </p>
              <p className="text-[10pt] mb-2">
                <strong>8.2-</strong> Sözleşmeli firma personelinin uygulama esnasında vereceği zararlar Sözleşmeli Firma MENTOR tarafından tazmin edilecektir. Sözleşmeli Firma üçüncü kişilere karşı yeterli güvenceyi sağlayacak Mali Mesuliyet Sigortası'na sahip olacaktır.
              </p>
              <p className="text-[10pt] mb-2">
                <strong>8.3-</strong> Sözleşmeli Firma personeli işletme ve ürün güvenliği kurallarına uymak zorundadır.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-sm mb-2">9- UYGULAMA ARAÇ GEREÇLERİ, KİMYASALLAR</h3>
              <p className="text-[10pt] mb-2 text-justify">
                Sözleşme konusu zararlılarla mücadelede kullanılacak kimyasalların temini sözleşmeli firmaya aittir. Fabrika sahası içerisinde kesinlikle pestisit depolanmayacaktır. Sözleşmeli firma MENTOR her seferinde yanında getirdiği pestisitleri aracında muhafaza edecektir.
              </p>
              <p className="text-[10pt] mb-2 text-justify">
                Uygulamalarda kullanılacak insektisit ve rodentisitler Dünya Sağlık Örgütü'nün önerilerine uygun olacak ve Sağlık Bakanlığı tarafından Halk Sağlığı alanında kullanılmak üzere ruhsatlandırılmış olacaktır. Kullanılması olası pestisitlerin listesi hazırlanarak işletme tarafından onaylanacaktır.
              </p>
              <p className="text-[10pt] mb-2 text-justify">
                Kullanılacak yöntemlerin sağlıklı olmasına özen gösterilecek ve kimyasalların bitmiş ürün, yarı mamul, hammadde ve ambalaj malzemeleri ile ekipmanlarına kontaminasyonuna izin verilmeyecektir.
              </p>
              <p className="text-[10pt] mb-2">
                Pest kontrol takip sisteminde yer alan aparatların bozulma ve kırılma durumlarında gerekli yenilemeler MENTOR tarafından yapılacaktır.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-sm mb-2">10- GEÇERLİLİK</h3>
              <p className="text-[10pt] mb-2 text-justify">
                Bu program hizmet alım şekline bağlı olarak MENTOR ile yapılan sözleşmeye göre düzenlenmiştir. Esas alınan sözleşme maddelerinde ve yasal düzenlemelerde bir değişiklik olursa programe revizyon olarak yansıtılacak ve sözleşmede gereken değişikliğe Sorumlu onayından sonra gidilecektir.
              </p>
            </section>

            <div className="mt-12 flex justify-between px-4">
              <div className="text-center w-1/3">
                <h4 className="font-bold mb-1 text-sm">MÜŞTERİ YETKİLİSİ</h4>
                <div className="text-[10pt] mb-12">(Kaşe - İmza)</div>
                <div className="border-b-2 border-black w-full mb-1"></div>
                <div className="text-[10pt]">{customerData.yetkiliKisi || 'Yetkili Kişi'}</div>
              </div>
              <div className="text-center w-1/3">
                <h4 className="font-bold mb-1 text-sm">MENTOR YETKİLİSİ</h4>
                <div className="text-[10pt] mb-12">(Kaşe - İmza)</div>
                <div className="border-b-2 border-black w-full mb-1"></div>
                <div className="text-[10pt]">Operasyon Müdürü</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-black pt-2 text-center text-[9pt] text-gray-500 mt-3">
          Bu sözleşme, MENTOR Çevre Sağlığı Hizmetleri kalite yönetim sisteminin bir parçasıdır. İzinsiz çoğaltılamaz.
        </div>
      </div>

      <style>{`
        @media print {
          .page-break-before {
            page-break-before: always;
            break-before: page;
          }
        }
      `}</style>
    </div>
  );
}
