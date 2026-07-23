import React, { useState, useRef, useEffect } from 'react';
import { TabType, Language } from '../types';
import { getTranslation } from '../data/translations';
import { 
  Search, 
  Calendar, 
  Filter, 
  X, 
  ChevronDown,
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const currentTabObj = tabs.find((t) => t.id === activeTab) || tabs[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-3xl p-3.5 mb-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 no-print relative">
      {/* Left side: Search & Navigation Dropdown Button */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
        {/* Search Input */}
        <div className="relative w-full sm:w-60 md:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-8 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e0533c] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Single Navigation Dropdown Button Next to Search */}
        <div className="relative w-full sm:w-auto" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full sm:w-auto flex items-center justify-between gap-2.5 px-4 py-2 bg-[#e0533c] hover:bg-[#cb422d] text-white rounded-full text-xs md:text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-white/80">{currentTabObj.icon}</span>
              <span>{currentTabObj.label}</span>
              {currentTabObj.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    currentTabObj.id === 'unpaid' && unpaidCount > 0
                      ? 'bg-rose-900 text-white animate-pulse'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {currentTabObj.badge}
                </span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-white/80 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-full sm:w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-1.5 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {language === 'bn' ? 'মেনু সিলেক্ট করুন' : 'Select Section'}
              </div>
              <div className="py-1">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const isUnpaidTab = tab.id === 'unpaid' && unpaidCount > 0;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        onTabChange(tab.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs md:text-sm text-left transition-colors font-medium ${
                        isActive
                          ? 'bg-[#fdf0ed] dark:bg-slate-800 text-[#e0533c] dark:text-[#f87171] font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-[#e0533c] dark:text-[#f87171]' : 'text-slate-400 dark:text-slate-500'}>
                          {tab.icon}
                        </span>
                        <span>{tab.label}</span>
                      </div>

                      {tab.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                            isUnpaidTab
                              ? 'bg-rose-500 text-white animate-pulse'
                              : isActive
                              ? 'bg-[#e0533c]/20 text-[#e0533c] dark:text-[#f87171]'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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
          )}
        </div>
      </div>

      {/* Right side: Selectors (Year & Month) */}
      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3.5 py-1.5 shrink-0">
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

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3.5 py-1.5 shrink-0">
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 text-xs font-semibold transition-colors shrink-0 hover:bg-rose-100"
          >
            <X className="w-3.5 h-3.5" />
            <span>{t.clearFilter}</span>
          </button>
        )}
      </div>
    </div>
  );
};

