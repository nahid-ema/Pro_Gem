import { Language, TabType } from "../types";
import { getTranslation } from "../data/translations";
import React, { useState, useRef, useEffect } from 'react';

interface FilterBarProps {
  selectedYear: string;
  selectedMonth: string;
  searchQuery: string;
  availableYears: string[];
  language: Language;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  onSearchChange: (query: string) => void;
  onClearFilters?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedYear,
  selectedMonth,
  searchQuery,
  availableYears,
  language,
  activeTab,
  onTabChange,
  onYearChange,
  onMonthChange,
  onSearchChange,
}) => {
  const t = getTranslation(language);
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const quickNavRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickNavRef.current && !quickNavRef.current.contains(event.target as Node)) {
        setIsQuickNavOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: TabType; labelEn: string; labelBn: string; icon: React.ReactNode }[] = [
    { id: 'brief', labelEn: 'Summary', labelBn: 'সারসংক্ষেপ', icon: <i className="fi fi-sr-chart-histogram text-[#F4C542]" /> },
    { id: 'rooms', labelEn: 'Rooms', labelBn: 'রুমসমূহ', icon: <i className="fi fi-sr-door-closed text-blue-500" /> },
    { id: 'tenants', labelEn: 'Tenants', labelBn: 'ভাড়াটিয়া', icon: <i className="fi fi-sr-users text-emerald-500" /> },
    { id: 'rent', labelEn: 'Rent Collection', labelBn: 'ভাড়া আদায়', icon: <i className="fi fi-sr-money-bill-wave text-amber-500" /> },
    { id: 'unpaid', labelEn: 'Unpaid Dues', labelBn: 'বকেয়া হিসাব', icon: <i className="fi fi-sr-triangle-warning text-rose-500" /> },
    { id: 'expense', labelEn: 'Expenses', labelBn: 'খরচসমূহ', icon: <i className="fi fi-sr-receipt text-purple-500" /> },
    { id: 'dokan', labelEn: 'Shop Dues', labelBn: 'দোকান বাকি', icon: <i className="fi fi-sr-shop text-orange-500" /> },
    { id: 'analytics', labelEn: 'Analytics', labelBn: 'অ্যানালিটিক্স', icon: <i className="fi fi-sr-chart-line-up text-indigo-500" /> },
  ];

  // Quick navigation helpers
  const handlePrevMonth = () => {
    const now = new Date();
    let yr = selectedYear !== 'all' ? parseInt(selectedYear, 10) : now.getFullYear();
    let mo = selectedMonth !== 'all' ? parseInt(selectedMonth, 10) : now.getMonth() + 1;

    mo -= 1;
    if (mo < 1) {
      mo = 12;
      yr -= 1;
    }

    onYearChange(String(yr));
    onMonthChange(String(mo).padStart(2, '0'));
  };

  const handleNextMonth = () => {
    const now = new Date();
    let yr = selectedYear !== 'all' ? parseInt(selectedYear, 10) : now.getFullYear();
    let mo = selectedMonth !== 'all' ? parseInt(selectedMonth, 10) : now.getMonth() + 1;

    mo += 1;
    if (mo > 12) {
      mo = 1;
      yr += 1;
    }

    onYearChange(String(yr));
    onMonthChange(String(mo).padStart(2, '0'));
  };

  const handleThisMonth = () => {
    const now = new Date();
    const yr = String(now.getFullYear());
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    onYearChange(yr);
    onMonthChange(mo);
    setIsDatePickerOpen(false);
  };

  const handleAllTime = () => {
    onYearChange('all');
    onMonthChange('all');
    setIsDatePickerOpen(false);
  };

  // Get current date label for single button
  const getSelectedDateLabel = () => {
    if (selectedYear === 'all' && selectedMonth === 'all') {
      return language === 'bn' ? 'সকল সময়' : 'All Time';
    }

    const monthIndex = selectedMonth !== 'all' ? parseInt(selectedMonth, 10) - 1 : -1;
    const monthName = monthIndex >= 0 && t?.months ? t.months[monthIndex] : '';
    
    if (selectedMonth !== 'all' && selectedYear !== 'all') {
      return `${monthName} ${selectedYear}`;
    }
    if (selectedMonth !== 'all') {
      return monthName;
    }
    return selectedYear;
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl dark:bg-[#1A1A1A]/80 border border-[#E8E6E1] dark:border-[#333333] rounded-3xl p-3 sm:p-4 mb-3 sm:mb-5 shadow-sm flex flex-col gap-3 no-print relative">
      {/* Top Row: Search & Filters (Single Date Selector & Quick Nav) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        
        {/* Left side: Single Date Selection Button + Quick Nav Button in a row */}
        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
          
          {/* 1. Single Unified Date Selection Button */}
          <div className="relative shrink-0" ref={datePickerRef}>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-[#333333] text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
            >
              <i className="fi fi-sr-calendar text-[#F4C542] shrink-0" />
              <span>{getSelectedDateLabel()}</span>
              <i className={`fi fi-sr-angle-down text-slate-400 shrink-0 transition-transform duration-200 ${isDatePickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Date Selection Popover Dropdown */}
            {isDatePickerOpen && (
              <div className="absolute left-0 mt-2 w-64 sm:w-72 bg-white/80 backdrop-blur-xl dark:bg-[#1A1A1A]/80 border border-slate-200 dark:border-[#333333] rounded-2xl shadow-xl z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                
                {/* Header & Quick Action Buttons */}
                <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleThisMonth}
                    className="flex-1 px-2 py-1 rounded-xl bg-[#F4C542]/10 text-[#F4C542] hover:bg-[#F4C542]/20 text-[11px] font-bold transition-colors cursor-pointer text-center"
                  >
                    {language === 'bn' ? 'চলতি মাস' : 'This Month'}
                  </button>

                  <button
                    type="button"
                    onClick={handleAllTime}
                    className="flex-1 px-2 py-1 rounded-xl bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer text-center"
                  >
                    {language === 'bn' ? 'সকল সময়' : 'All Time'}
                  </button>
                </div>

                {/* Month Stepper Bar */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 rounded-xl p-1.5 border border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    title={language === 'bn' ? 'পূর্ববর্তী মাস' : 'Previous Month'}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <i className="fi fi-sr-angle-left" />
                  </button>

                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {getSelectedDateLabel()}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    title={language === 'bn' ? 'পরবর্তী মাস' : 'Next Month'}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <i className="fi fi-sr-angle-right" />
                  </button>
                </div>

                {/* Year Select Row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {language === 'bn' ? 'বছর:' : 'Year:'}
                  </span>
                  <select
                    value={selectedYear}
                    onChange={(e) => onYearChange(e.target.value)}
                    className="flex-1 bg-slate-100 dark:bg-[#2A2A2A] border border-slate-200/80 dark:border-[#333333] rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="dark:bg-slate-900">{t.yearAllOpt}</option>
                    {(availableYears || []).map((yr) => (
                      <option key={yr} value={yr} className="dark:bg-slate-900">
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month Grid (12 Months) */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    {language === 'bn' ? 'মাস নির্বাচন করুন' : 'Select Month'}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => { onMonthChange('all'); setIsDatePickerOpen(false); }}
                      className={`py-1 px-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        selectedMonth === 'all'
                          ? 'bg-[#F4C542] text-slate-900 shadow-xs'
                          : 'bg-slate-100 dark:bg-[#2A2A2A] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {t.monthAllOpt}
                    </button>
                    {(t?.months || []).map((m, idx) => {
                      const val = String(idx + 1).padStart(2, '0');
                      const isSelected = selectedMonth === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            if (selectedYear === 'all') {
                              onYearChange(String(new Date().getFullYear()));
                            }
                            onMonthChange(val);
                            setIsDatePickerOpen(false);
                          }}
                          className={`py-1 px-1.5 rounded-lg text-[11px] font-semibold truncate transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#F4C542] text-slate-900 font-bold shadow-xs'
                              : 'bg-slate-100 dark:bg-[#2A2A2A] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* 2. Quick Navigation Button with Dropdown Menu */}
          <div className="relative shrink-0" ref={quickNavRef}>
            <button
              type="button"
              onClick={() => setIsQuickNavOpen(!isQuickNavOpen)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4C542]/10 hover:bg-[#F4C542]/20 text-[#F4C542] border border-[#F4C542]/30 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
            >
              <i className="fi fi-sr-compass shrink-0" />
              <span>{language === 'bn' ? 'দ্রুত নেভিগেশন' : 'Quick Navigation'}</span>
              <i className={`fi fi-sr-angle-down shrink-0 transition-transform duration-200 ${isQuickNavOpen ? 'rotate-180' : ''}`} />
            </button>

            {isQuickNavOpen && (
              <div className="absolute left-0 mt-2 w-52 sm:w-56 bg-white/80 backdrop-blur-xl dark:bg-[#1A1A1A]/80 border border-slate-200 dark:border-[#333333] rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800 mb-1">
                  {language === 'bn' ? 'দ্রুত নেভিগেশন' : 'Quick Navigation'}
                </div>
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onTabChange?.(item.id);
                        setIsQuickNavOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#F4C542] text-slate-900 shadow-xs font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className={isActive ? 'text-slate-900' : ''}>{item.icon}</span>
                      <span className="flex-1 truncate">{language === 'bn' ? item.labelBn : item.labelEn}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right side: Search Box with Search Button */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full lg:w-72 shrink">
            <i className="absolute left-3 top-1/2 -translate-y-1/2 fi fi-sr-search text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-7 py-1.5 bg-slate-100 dark:bg-[#2A2A2A] border border-slate-200/80 dark:border-[#333333] rounded-full text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F4C542] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <i className="fi fi-sr-cross" />
              </button>
            )}
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 bg-[#F4C542] text-slate-900 hover:bg-[#e0b233] px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer active:scale-95"
          >
            <i className="fi fi-sr-search" />
            <span>{language === 'bn' ? 'খুঁজুন' : 'Search'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};


