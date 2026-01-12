export const BRAND_GREEN = '#006837';
export const BRAND_LIGHT_GREEN = '#e6f4ea';
export const LOGO_URL = "https://pestmentor.com.tr/pestmentor-logo-png-297x97.webp";

export const MODULE_TITLES = {
  '0.1': 'BELGE ATAMA YÖNETİMİ',
  '1.1': 'FAALİYET DOSYASI İÇERİĞİ',
  '1.2': 'MÜŞTERİ BİLGİ FORMU',
  '1.3': 'MÜŞTERİ ŞUBELERİNİN BİLGİLERİ',
  '2.1': 'HİZMET SÖZLEŞMESİ',
  '3.1': 'İZİN VE RUHSATLAR',
  '3.2': 'MESUL MÜDÜR VE OPERATÖR SERTİFİKALARI',
  '3.3': 'FUMİGASYON RUHSATI',
  '4.1': 'ZARARLI MÜCADELESİ EKİPMAN KROKİSİ',
  '4.2': 'EKİPMAN TAKİP VE KONTROL FORMU',
  '4.3a': 'TREND ANALİZ, RİSK DEĞERLENDİRME, EYLEM AKSİYON PLANI',
  '4.3b': 'MALİ SORUMLULUK SİGORTA POLİÇESİ',
  '4.3c': 'MÜŞTERİ ŞİKAYET, ÖNERİ VE/VEYA MEMNUNİYET FORMLARI',
  '4.3d': 'ACİL ÇAĞRI BİLGİLERİ, ACİL DURUM BİLGİLENDİRME METNİ',
  '5.1': 'EK-1 BİYOSİDAL ÜRÜN UYGULAMA İŞLEM FORMU (FAALİYET RAPORU)',
  '5.2': 'ONAYLI BİYOSİDAL ÜRÜN LİSTESİ',
  '5.3': 'BİYOSİDAL ÜRÜN KULLANIM KARTI',
  '5.4': 'BİYOSİDAL ÜRÜN RUHSATLARI, MSDS VE ETİKET BİLGİLERİ',
  '5.5': 'BİYOSİDAL ÜRÜN GRUPLARI LİSTESİ',
  '6.1': 'ATIK İMHA BELGESİ',
  '6.2': 'FUMİGASYON RUHSATI',
  '6.4': 'ZARARLI KONTROLÜ ACİL EYLEM PLANI'
};

export const NAVIGATION_ITEMS = [
  { id: '0.1', title: 'Belge Atama', icon: 'UserCheck' },
  { id: '1.1', title: 'Faaliyet Dosyası İçeriği', icon: 'FileText' },
  { id: '1.2', title: 'Müşteri Bilgileri', icon: 'Building2' },
  { id: '1.3', title: 'Şube Bilgileri', icon: 'Store' },
  { id: '2.1', title: 'Hizmet Sözleşmesi', icon: 'FileSignature' },
  { id: '3.1', title: 'İzin ve Ruhsatlar', icon: 'Award' },
  { id: '3.2', title: 'Sertifikalar', icon: 'Users' },
  { id: '3.3', title: 'Fumigasyon Ruhsatı', icon: 'ShieldCheck' },
  { id: '4.1', title: 'Ekipman Krokisi', icon: 'Map' },
  { id: '4.2', title: 'Ekipman Takip', icon: 'ClipboardList' },
  { id: '4.3a', title: 'Trend Analiz & Risk', icon: 'TrendingUp' },
  { id: '4.3b', title: 'Sigorta Poliçesi', icon: 'Shield' },
  { id: '4.3c', title: 'Müşteri Şikayet', icon: 'MessageSquare' },
  { id: '4.3d', title: 'Acil Durum Bilgileri', icon: 'Phone' },
  { id: '5.1', title: 'Faaliyet Raporu', icon: 'FileCheck' },
  { id: '5.2', title: 'Biyosidal Ürünler', icon: 'Beaker' },
  { id: '5.3', title: 'Ürün Kullanım Kartı', icon: 'CreditCard' },
  { id: '5.4', title: 'Ürün Ruhsat & MSDS', icon: 'FileImage' },
  { id: '5.5', title: 'Ürün Grupları', icon: 'Package' },
  { id: '6.1', title: 'Atık İmha Belgesi', icon: 'Trash2' },
  { id: '6.2', title: 'Fumigasyon Ruhsatı', icon: 'Zap' },
  { id: '6.4', title: 'Acil Eylem Planı', icon: 'AlertTriangle' }
] as const;

export const ICON_COMPONENTS = {
  FileText: 'FileText',
  Building2: 'Building2',
  Store: 'Store',
  FileSignature: 'FileSignature',
  Award: 'Award',
  Users: 'Users',
  ShieldCheck: 'ShieldCheck',
  Map: 'Map',
  ClipboardList: 'ClipboardList',
  TrendingUp: 'TrendingUp',
  Shield: 'Shield',
  MessageSquare: 'MessageSquare',
  Phone: 'Phone',
  FileCheck: 'FileCheck',
  Beaker: 'Beaker',
  CreditCard: 'CreditCard',
  FileImage: 'FileImage',
  Package: 'Package',
  Trash2: 'Trash2',
  Zap: 'Zap',
  AlertTriangle: 'AlertTriangle',
  UserCheck: 'UserCheck'
} as const;

export const DEFAULT_GENERATOR = {
  prefix: 'Kİ',
  start: 1,
  end: 10,
  type: 'Kemirgen İstasyonu'
};

export const STATION_TYPES = [
  'Kemirgen İstasyonu',
  'Yürüyen Haşere İstasyonu',
  'Sinek Tutucu Cihaz (EFC)',
  'Feromon Tuzak'
];

export const CURRENCY_OPTIONS = ['TL', 'USD', 'EUR'];

export const STAFF_ROLES = [
  'Mesul Müdür',
  'Biyosidal Ürün Uygulayıcı (Operatör)'
];

export const LEGEND_SHAPES = ['Kare', 'Daire', 'Üçgen', 'Yıldız'];

export const DEFAULT_LEGEND_ITEMS = [
  { id: 1, kod: 'Kİ', aciklama: 'Kemirgen İstasyonu (Rodent Station)', renk: '#000000', sekil: 'Kare' },
  { id: 2, kod: 'Yİ', aciklama: 'Yürüyen Haşere İstasyonu (Monitor)', renk: '#000000', sekil: 'Daire' },
  { id: 3, kod: 'ILT', aciklama: 'Sinek Tutucu Cihaz (EFC)', renk: '#000000', sekil: 'Üçgen' },
  { id: 4, kod: 'FT', aciklama: 'Feromon Tuzak', renk: '#000000', sekil: 'Yıldız' },
];

export const RISK_LEVELS = ['Düşük', 'Orta', 'Yüksek', 'Kritik'];
export const ACTION_STATUS = ['Planlandı', 'Devam Ediyor', 'Tamamlandı', 'İptal Edildi'];
export const COMPLAINT_STATUS = ['Açık', 'İnceleniyor', 'Çözüldü', 'Kapatıldı'];
export const WASTE_TYPES = ['Boş İlaç Ambalajı', 'Kemirgen Ölüleri', 'Kontamine Malzeme', 'Diğer'];