import { Loader2 } from 'lucide-react';
import { LOGO_URL, BRAND_GREEN, NAVIGATION_ITEMS } from '../../constants';
import type { ActiveTab } from '../../types';

interface HomePageProps {
  loading: boolean;
  onTabChange: (tab: ActiveTab) => void;
}

const iconMap = {
  Building2: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">B</div>,
  Store: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">S</div>,
  FileSignature: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">F</div>,
  Award: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>,
  Users: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">U</div>,
  Map: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">M</div>,
  ClipboardList: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">C</div>,
  Beaker: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">B</div>,
  FileText: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">T</div>,
  Shield: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">S</div>,
  UserCheck: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">UC</div>,
  TrendingUp: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">T</div>,
  ShieldCheck: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">SC</div>,
  MessageSquare: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">M</div>,
  Phone: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">P</div>,
  Trash2: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">T</div>,
  Zap: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">Z</div>,
  FileCheck: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">FC</div>,
  CreditCard: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">CC</div>,
  FileImage: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">FI</div>,
  Package: () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">P</div>
};

export function HomePage({ loading, onTabChange }: HomePageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-10 bg-gray-50 text-gray-800 overflow-y-auto">
      <div className="flex flex-col items-center mb-10">
        <img src={LOGO_URL} alt="Mentor Logo" className="h-20 mb-2" />
        <p className="text-xl italic font-bold" style={{ color: BRAND_GREEN }}>
          "Leave pest to us."
        </p>
        {loading && (
          <div className="mt-4 flex items-center text-green-600 gap-2">
            <Loader2 className="animate-spin" /> Veriler Yükleniyor...
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {NAVIGATION_ITEMS.map((item) => {
          const IconComponent = iconMap[item.icon as keyof typeof iconMap];
          return (
            <button 
              key={item.id}
              onClick={() => onTabChange(item.id as ActiveTab)} 
              className="group bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-green-600 flex flex-col items-center text-center h-full"
            >
              <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <IconComponent />
              </div>
              <h2 className="text-sm font-bold mb-2 text-gray-800">
                {item.id}. {item.title}
              </h2>
            </button>
          );
        })}
      </div>
    </div>
  );
}