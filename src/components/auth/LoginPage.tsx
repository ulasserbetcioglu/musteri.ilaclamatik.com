import React, { useState } from 'react';
import { Building2, User, Users, Store, Eye, EyeOff, LogIn } from 'lucide-react';
import { LOGO_URL, BRAND_GREEN } from '../../constants';

interface LoginPageProps {
  onLogin: (userType: 'admin' | 'operator' | 'customer' | 'branch', userData: any) => void;
  loading: boolean;
  error: string | null;
}

type UserType = 'admin' | 'operator' | 'customer' | 'branch';

export function LoginPage({ onLogin, loading, error }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<UserType>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(activeTab, { email, password });
  };

  const tabs = [
    { id: 'admin' as UserType, label: 'Admin', icon: User, description: 'Sistem Yöneticisi' },
    { id: 'operator' as UserType, label: 'Operatör', icon: Users, description: 'Saha Operatörü' },
    { id: 'customer' as UserType, label: 'Müşteri', icon: Building2, description: 'Müşteri Firması' },
    { id: 'branch' as UserType, label: 'Şube', icon: Store, description: 'Müşteri Şubesi' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-white p-6 text-center border-b border-gray-100">
          <img src={LOGO_URL} alt="Mentor Logo" className="h-16 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-800">MENTOR</h1>
          <p className="text-sm italic font-bold" style={{ color: BRAND_GREEN }}>
            Leave pest to us.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50 p-1 m-4 rounded-lg grid grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-md text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  activeTab === tab.id
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active Tab Info */}
        <div className="px-6 pb-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {tabs.find(t => t.id === activeTab)?.description}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'admin' && 'Sistem yönetimi ve tüm verilere erişim'}
              {activeTab === 'operator' && 'Saha operasyonları ve raporlama'}
              {activeTab === 'customer' && 'Müşteri paneli ve raporlar'}
              {activeTab === 'branch' && 'Şube bazlı veri görüntüleme'}
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {activeTab === 'admin' || activeTab === 'operator' ? 'E-posta' : 'Kullanıcı Adı / E-posta'}
            </label>
            <input
              type={activeTab === 'admin' || activeTab === 'operator' ? 'email' : 'text'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder={
                activeTab === 'admin' ? 'admin@ilaclamatik.com' :
                activeTab === 'operator' ? 'operator@example.com' :
                activeTab === 'customer' ? 'Müşteri e-posta' :
                'Şube e-posta'
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn size={20} />
                Giriş Yap
              </>
            )}
          </button>
        </form>

        {/* Auth Type Info */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <strong>Bilgi:</strong> {' '}
            {(activeTab === 'admin' || activeTab === 'operator') 
              ? 'Supabase Authentication kullanılıyor'
              : 'Local Authentication kullanılıyor'
            }
          </div>
        </div>
      </div>
    </div>
  );
}