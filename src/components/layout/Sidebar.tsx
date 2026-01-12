import {
  Home, Building2, Store, Ligature as FileSignature, Award, Users, Map, ClipboardList, Beaker, Printer,
  FileText, Shield, UserCheck, TrendingUp, ShieldCheck, MessageSquare, Phone, Trash2, Zap,
  FileCheck, CreditCard, FileImage, Package, AlertTriangle
} from 'lucide-react';
import { LOGO_URL, BRAND_GREEN, NAVIGATION_ITEMS } from '../../constants';
import type { ActiveTab } from '../../types';

interface AuthUser {
  id: string;
  email: string;
  userType: 'admin' | 'operator' | 'customer' | 'branch';
  userData: any;
}

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onPrint: () => void;
  user: AuthUser | null;
  onLogout: () => void;
}

const iconMap = {
  Building2,
  Store,
  FileSignature,
  Award,
  Users,
  Map,
  ClipboardList,
  Beaker,
  FileText,
  Shield,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  MessageSquare,
  Phone,
  Trash2,
  Zap,
  FileCheck,
  CreditCard,
  FileImage,
  Package,
  AlertTriangle
};

export function Sidebar({ activeTab, onTabChange, onPrint, user, onLogout }: SidebarProps) {
  const getUserDisplayName = () => {
    if (!user) return '';
    
    switch (user.userType) {
      case 'admin':
        return 'Admin';
      case 'operator':
        return user.userData.name || 'Operatör';
      case 'customer':
        return user.userData.kisa_isim || 'Müşteri';
      case 'branch':
        return user.userData.sube_adi || 'Şube';
      default:
        return user.email;
    }
  };

  const getUserTypeLabel = () => {
    switch (user?.userType) {
      case 'admin': return 'Sistem Yöneticisi';
      case 'operator': return 'Saha Operatörü';
      case 'customer': return 'Müşteri';
      case 'branch': return 'Şube';
      default: return '';
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col print:hidden z-20 shadow-lg">
      <div 
        className="p-6 border-b border-gray-100 flex items-center gap-2 cursor-pointer" 
        onClick={() => onTabChange('home')}
      >
        <img src={LOGO_URL} alt="Mentor Logo" className="h-10" />
        <div>
          <h1 className="font-bold text-gray-800">MENTOR</h1>
          <p className="text-[10px] italic font-bold" style={{ color: BRAND_GREEN }}>
            Leave pest to us.
          </p>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-100 bg-green-50">
        <div className="text-sm">
          <div className="font-semibold text-gray-800 truncate">
            {getUserDisplayName()}
          </div>
          <div className="text-xs text-green-600">
            {getUserTypeLabel()}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <button 
          onClick={() => onTabChange('home')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'home' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Home size={18} /> Ana Sayfa
        </button>
        
        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Modüller
        </div>
        
        {NAVIGATION_ITEMS.map((item) => {
          const IconComponent = iconMap[item.icon as keyof typeof iconMap];
          return (
            <button 
              key={item.id}
              onClick={() => onTabChange(item.id as ActiveTab)} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <IconComponent size={18} /> {item.id} {item.title}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={onLogout}
          className="w-full flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg shadow transition text-sm font-medium mb-3"
        >
          Çıkış Yap
        </button>
        {activeTab !== 'home' && (
          <button 
            onClick={onPrint} 
            className="w-full flex justify-center items-center gap-2 bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-lg shadow transition text-sm font-medium"
          >
            <Printer size={16} /> Yazdır (PDF)
          </button>
        )}
      </div>
    </aside>
  );
}