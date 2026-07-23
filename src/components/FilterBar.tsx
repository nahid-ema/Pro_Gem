import React from 'react';
import { TabType, Language } from '../types';
import { getTranslation } from '../data/translations';
import { 
  Search, 
  Calendar, 
  Filter, 
  X, 
  BarChart3, 
  DoorClosed, 
  Users, 
  Banknote, 
  AlertTriangle, 
  Receipt, 
  Store, 
  LineChart 
} from 'lucide-react';

interface FilterBarProps {
  selectedYear: string;
  selectedMonth: string;
  searchQuery: string;
  availableYears: string[];
  language: Language;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unpaidCount: number;
  totalRoomsCount: number;
  totalTenantsCount: number;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedYear,
  selectedMonth,
  searchQuery,
  availableYears,
  language,
  activeTab,
  onTabChange,
  unpaidCount,
  totalRoomsCount,
  totalTenantsCount,
  onYearChange,
  onMonthChange,
  onSearchChange,
  onClearFilters,
}) => {
  const t = getTranslation(language);

  const isFiltered = selectedYear !== 'all' || selectedMonth !== 'all' || searchQuery.trim() !== '';

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'brief', label: t.tabBrief, icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'rooms', label: t.tabRooms, icon: <DoorClosed className="w-4 h-4" />, badge: totalRoomsCount },
    { id: 'tenants', label: t.tabTenants, icon: <Users className="w-4 h-4" />, badge: totalTenantsCount },
    { id: 'rent', label: t.tabRent, icon: <Banknote className="w-4 h-4" /> },
    { id: 'unpaid', label: t.tabUnpaid, icon: <AlertTriangle className="w-4 h-4" />, badge: unpaidCount > 0 ? unpaidCount : undefined },
    { id: 'expense', label: t.tabExpense, icon: <Receipt className="w-4 h-4" /> },
    { id: 'dokan', label: t.tabDokan, icon: <Store className="w-4 h-4" /> },
    { id: 'analytics', label: t.tabAnalytics, icon: <LineChart className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-3xl p-3 sm:p-4 mb-3 sm:mb-5 shadow-sm flex flex-col gap-3 no-print relative">
      {/* Top Row: Search & Filters (Year & Month) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left side: Search Input */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-7 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e0533c] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right side: Selectors (Year & Month) */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#e0533c]" />
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="all" className="dark:bg-slate-900">{t.yearAllOpt}</option>
              {(availableYears || []).map((yr) => (
                <option key={yr} value={yr} className="dark:bg-slate-900">
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#e0533c]" />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="all" className="dark:bg-slate-900">{t.monthAllOpt}</option>
              {(t?.months || []).map((m, idx) => {
                const val = String(idx + 1).padStart(2, '0');
                return (
                  <option key={val} value={val} className="dark:bg-slate-900">
                    {m}
                  </option>
                );
              })}
            </select>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 text-xs font-semibold transition-colors shrink-0 hover:bg-rose-100"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.clearFilter}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="w-full overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 scrollbar-none no-print -mx-1 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isUnpaidTab = tab.id === 'unpaid' && unpaidCount > 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-[#e0533c] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>

              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded-full ${
                    isUnpaidTab
                      ? 'bg-rose-500 text-white animate-pulse'
                      : isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

