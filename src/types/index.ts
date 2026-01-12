export interface CustomerData {
  ticariUnvan: string;
  faaliyetKonusu: string;
  vergiDairesi: string;
  vergiNo: string;
  mersisNo: string;
  adres: string;
  telefon: string;
  faks: string;
  eposta: string;
  webSitesi: string;
  yetkiliKisi: string;
  yetkiliUnvan: string;
  yetkiliTel: string;
  hizmetBaslangicTarihi: string;
}

export interface Customer {
  id: string;
  kisa_isim: string;
  cari_isim: string;
  email: string;
}

export interface Branch {
  id: number;
  subeAdi: string;
  yetkili: string;
  metrekare: string;
  adres: string;
  telefon: string;
}

export interface DocumentSettings {
  dokumanNo: string;
  revizyonNo: string;
  yayinTarihi: string;
}

export interface ContractData {
  sozlesmeTarihi: string;
  sozlesmeNo: string;
  hizmetPeriyodu: string;
  hizmetBedeli: string;
  paraBirimi: string;
  sozlesmeSuresi: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  odemeSekli: string;
  kapsam: {
    kemirgen: boolean;
    yuruyenHasere: boolean;
    ucanHasere: boolean;
    dezenfeksiyon: boolean;
  };
}

export interface Permit {
  id: number;
  belgeAdi: string;
  belgeNo: string;
  verilisTarihi: string;
  gecerlilikTarihi: string;
  verenKurum: string;
}

export interface Staff {
  id: number;
  adSoyad: string;
  gorev: string;
  sertifikaNo: string;
  gecerlilikTarihi: string;
}

export interface LegendItem {
  id: number;
  kod: string;
  aciklama: string;
  renk: string;
  sekil: string;
}

export interface Station {
  id: number;
  no: string;
  location: string;
  type: string;
}

export interface Generator {
  prefix: string;
  start: number | string;
  end: number | string;
  type: string;
}

export interface Product {
  id: number;
  urunAdi: string;
  aktifMadde: string;
  ruhsatNo: string;
  hedefHasere: string;
  antidot: string;
}

export interface ActivityReport {
  id: number;
  tarih: string;
  operator: string;
  uygulananAlan: string;
  kullanılanUrun: string;
  miktar: string;
  yontem: string;
  hedefZararli: string;
  sonrakiZiyaret: string;
  aciklama: string;
}

export interface ProductUsageCard {
  id: number;
  urunAdi: string;
  toplamKullanim: string;
  sonKullanim: string;
  stokDurumu: string;
  notlar: string;
}

export interface ProductGroup {
  id: number;
  grupAdi: string;
  aciklama: string;
  urunler: string[];
}

export interface TrendAnalysis {
  id: number;
  donem: string;
  zararlıTuru: string;
  aktiviteSeviyesi: string;
  trend: string;
  oneriler: string;
}

export interface RiskAssessment {
  id: number;
  riskTuru: string;
  olasilik: string;
  etki: string;
  riskSeviyesi: string;
  onlemler: string;
}

export interface ActionPlan {
  id: number;
  aksiyon: string;
  sorumlu: string;
  hedefTarih: string;
  durum: string;
  aciklama: string;
}

export interface InsurancePolicy {
  id: number;
  policeNo: string;
  sigortaSirketi: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  teminatTutari: string;
  kapsamAciklamasi: string;
}

export interface CustomerComplaint {
  id: number;
  tarih: string;
  sikayetTuru: string;
  aciklama: string;
  alinanAksiyon: string;
  cozumTarihi: string;
  durum: string;
}

export interface EmergencyContact {
  id: number;
  kisiAdi: string;
  gorev: string;
  telefon: string;
  email: string;
  acilDurumTuru: string;
}

export interface WasteDisposal {
  id: number;
  tarih: string;
  atikTuru: string;
  miktar: string;
  bertarafFirmasi: string;
  belgeNo: string;
  imhaTarihi: string;
}

export interface FumigationLicense {
  id: number;
  ruhsatNo: string;
  verilisTarihi: string;
  gecerlilikTarihi: string;
  kapsamAciklamasi: string;
  kisitlamalar: string;
}

export type ActiveTab =
  | 'home'
  | '0.1'
  | '1.1' | '1.2' | '1.3'
  | '2.1'
  | '3.1' | '3.2' | '3.3'
  | '4.1' | '4.2' | '4.3a' | '4.3b' | '4.3c' | '4.3d'
  | '5.1' | '5.2' | '5.3' | '5.4' | '5.5'
  | '6.1' | '6.2';

export interface ModuleData {
  customerData: CustomerData;
  branches: Branch[];
  contractData: ContractData;
  permits: Permit[];
  staff: Staff[];
  legendItems: LegendItem[];
  stations: Station[];
  products: Product[];
  activityReports: ActivityReport[];
  productUsageCards: ProductUsageCard[];
  productGroups: ProductGroup[];
  trendAnalysis: TrendAnalysis[];
  riskAssessments: RiskAssessment[];
  actionPlans: ActionPlan[];
  insurancePolicy: InsurancePolicy[];
  customerComplaints: CustomerComplaint[];
  emergencyContacts: EmergencyContact[];
  wasteDisposals: WasteDisposal[];
  fumigationLicense: FumigationLicense[];
  krokiImage: string | null;
  generator: Generator;
}