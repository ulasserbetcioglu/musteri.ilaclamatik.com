import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LogOut, FileText, Shield } from 'lucide-react';
import { BRAND_GREEN, LOGO_URL } from '../../constants';
import { supabase } from '../../lib/supabase';
import type { AuthUser } from '../../hooks/useAuth';

interface Visit {
  id: string;
  customer_id: string | null;
  branch_id: string | null;
  visit_date: string;
  status: string;
  visit_type: string | null;
  notes: string | null;
  report_number: string | null;
  customer_name?: string;
  branch_name?: string;
}

interface CalendarPageProps {
  user: AuthUser;
  onLogout: () => void;
  onNavigate: (page: 'documents' | 'visits' | 'calendar' | 'msds') => void;
}

export function CalendarPage({ user, onLogout, onNavigate }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadVisits();
  }, [user, currentDate]);

  const loadVisits = async () => {
    try {
      setLoading(true);

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

      let query = supabase
        .from('visits')
        .select(`
          *,
          customers (
            kisa_isim,
            cari_isim
          ),
          branches (
            sube_adi
          )
        `)
        .gte('visit_date', startOfMonth.toISOString())
        .lte('visit_date', endOfMonth.toISOString());

      if (user.customer_id) {
        query = query.eq('customer_id', user.customer_id);
      } else if (user.branch_id) {
        query = query.eq('branch_id', user.branch_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedVisits = data?.map((visit: any) => ({
        ...visit,
        customer_name: visit.customers?.kisa_isim || visit.customers?.cari_isim || 'Bilinmiyor',
        branch_name: visit.branches?.sube_adi || null
      })) || [];

      setVisits(mappedVisits);
    } catch (err) {
      console.error('Error loading visits:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getVisitsForDate = (date: Date | null) => {
    if (!date) return [];

    return visits.filter((visit) => {
      const visitDate = new Date(visit.visit_date);
      return (
        visitDate.getDate() === date.getDate() &&
        visitDate.getMonth() === date.getMonth() &&
        visitDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'planned':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'in_progress':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'planned':
        return 'Planlandı';
      case 'cancelled':
        return 'İptal';
      case 'in_progress':
        return 'Devam Ediyor';
      default:
        return status;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const selectedDateVisits = selectedDate ? getVisitsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={LOGO_URL} alt="Logo" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ziyaret Takvimi</h1>
                <p className="text-sm text-gray-500">
                  {user.customer_name || user.branch_name || 'Hoş geldiniz'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon size={16} />
                <span>{new Date().toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut size={16} />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 border-t pt-2">
            <button
              onClick={() => onNavigate('documents')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <FileText size={16} />
              Belgeler
            </button>
            <button
              onClick={() => onNavigate('visits')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <CalendarIcon size={16} />
              Ziyaretler
            </button>
            <button
              onClick={() => onNavigate('calendar')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-green-600 bg-green-50 text-green-700"
            >
              <CalendarIcon size={16} />
              Takvim
            </button>
            <button
              onClick={() => onNavigate('msds')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <Shield size={16} />
              RUHSAT & MSDS
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-2xl font-bold capitalize">{monthName}</h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: BRAND_GREEN }}
            >
              Bugün
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span>Takvim yükleniyor...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-4 text-center font-semibold text-gray-700 bg-gray-50 border-b"
                >
                  {day}
                </div>
              ))}

              {days.map((date, index) => {
                const dayVisits = date ? getVisitsForDate(date) : [];
                const isToday =
                  date &&
                  date.getDate() === new Date().getDate() &&
                  date.getMonth() === new Date().getMonth() &&
                  date.getFullYear() === new Date().getFullYear();
                const isSelected =
                  selectedDate &&
                  date &&
                  date.getDate() === selectedDate.getDate() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear();

                return (
                  <div
                    key={index}
                    onClick={() => date && setSelectedDate(date)}
                    className={`min-h-[120px] border-b border-r p-2 cursor-pointer transition-colors ${
                      !date ? 'bg-gray-50' : 'hover:bg-gray-50'
                    } ${isSelected ? 'bg-blue-50 ring-2 ring-blue-500' : ''}`}
                  >
                    {date && (
                      <>
                        <div
                          className={`text-sm font-semibold mb-2 ${
                            isToday
                              ? 'bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                              : 'text-gray-700'
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayVisits.slice(0, 3).map((visit) => (
                            <div
                              key={visit.id}
                              className={`text-xs p-1 rounded text-white truncate ${getStatusColor(
                                visit.status
                              )}`}
                              title={`${formatTime(visit.visit_date)} - ${
                                visit.branch_name || visit.customer_name
                              }`}
                            >
                              {formatTime(visit.visit_date)} - {visit.branch_name || visit.customer_name}
                            </div>
                          ))}
                          {dayVisits.length > 3 && (
                            <div className="text-xs text-gray-500 font-medium">
                              +{dayVisits.length - 3} daha
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedDate && selectedDateVisits.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon size={24} style={{ color: BRAND_GREEN }} />
              <h3 className="text-xl font-bold">
                {selectedDate.toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </h3>
            </div>
            <div className="space-y-3">
              {selectedDateVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {visit.branch_name || visit.customer_name}
                      </h4>
                      <p className="text-sm text-gray-600">{formatTime(visit.visit_date)}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(
                        visit.status
                      )}`}
                    >
                      {getStatusText(visit.status)}
                    </span>
                  </div>
                  {visit.visit_type && (
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Tip:</strong> {visit.visit_type}
                    </p>
                  )}
                  {visit.report_number && (
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Rapor No:</strong> {visit.report_number}
                    </p>
                  )}
                  {visit.notes && (
                    <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                      {visit.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedDate && selectedDateVisits.length === 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-8 text-center">
            <CalendarIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bu tarihte ziyaret yok
            </h3>
            <p className="text-gray-600">
              {selectedDate.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}{' '}
              tarihinde planlanmış bir ziyaret bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
