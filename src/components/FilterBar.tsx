import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { 
  Search, 
  Calendar, 
  Filter, 
  X
} from 'lucide-react';

interface FilterBarProps {
  selectedYear: string;
  selectedMonth: string;
  searchQuery: string;
  availableYears: string[];
  language: Language;
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
  onYearChange,
  onMonthChange,
  onSearchChange,
}) => {
  const t = getTranslation(language);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-3 sm:p-4 mb-3 sm:mb-5 shadow-sm flex flex-col gap-3 no-print relative">
      {/* Top Row: Search & Filters (Year & Month) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        
        {/* Left side: Selectors (Year & Month) */}
        <div className="flex items-center gap-2 overflow-x-auto shrink-0">
          {/* Year Selector */}
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

          {/* Month Selector */}
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
        </div>

        {/* Right side: Search Box with Search Button */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72 shrink">
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
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 bg-[#e0533c] hover:bg-[#cb422d] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer active:scale-95"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'খুঁজুন' : 'Search'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

