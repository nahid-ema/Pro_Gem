import React, { useState, useRef, useEffect } from 'react';
import { Language, Theme, TabType } from '../types';
import { getTranslation } from '../data/translations';
import { Logo } from './Logo';
import { AndroidInstallModal } from './AndroidInstallModal';

interface HeaderProps {
  language: Language;
  theme: Theme;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  onLanguageToggle: () => void;
  onThemeToggle: () => void;
  onTriggerBackup: () => void;
  onTriggerRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFirebaseCloudBackup: () => void;
  onFirebaseCloudRestore: () => void;
  onPrint: () => void;
  onOpenAuthModal: () => void;
  onLockApp?: () => void;
  userEmail?: string | null;
  ownerEmail?: string;
  isFirebaseActive: boolean;
  isSyncing?: boolean;
  lastCloudBackupTime?: string | null;

  // Filter & Search props
  selectedYear: string;
  selectedMonth: string;
  searchQuery: string;
  availableYears: string[];
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  onSearchChange: (query: string) => void;
  onClearFilters?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  theme,
  activeTab,
  onTabChange,
  onLanguageToggle,
  onThemeToggle,
  onTriggerBackup,
  onTriggerRestore,
  onFirebaseCloudBackup,
  onFirebaseCloudRestore,
  onPrint,
  onOpenAuthModal,
  onLockApp,
  userEmail,
  ownerEmail,
  isFirebaseActive,
  isSyncing,
  lastCloudBackupTime,
  selectedYear,
  selectedMonth,
  searchQuery,
  availableYears,
  onYearChange,
  onMonthChange,
  onSearchChange,
}) => {
  const t = getTranslation(language);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const quickNavRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (quickNavRef.current && !quickNavRef.current.contains(event.target as Node)) {
        setIsQuickNavOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      
    };
  }, []);

  const navItems: { id: TabType; labelEn: string; labelBn: string; icon: React.ReactNode }[] = [
    { id: 'brief', labelEn: 'Summary', labelBn: 'সারসংক্ষেপ', icon: <i className="fi fi-sr-chart-histogram text-base text-[#2563EB]" /> },
    { id: 'rooms', labelEn: 'Rooms', labelBn: 'রুমসমূহ', icon: <i className="fi fi-sr-door-closed text-base text-blue-500" /> },
    { id: 'tenants', labelEn: 'Tenants', labelBn: 'ভাড়াটিয়া', icon: <i className="fi fi-sr-users text-base text-emerald-500" /> },
    { id: 'rent', labelEn: 'Rent Collection', labelBn: 'ভাড়া আদায়', icon: <i className="fi fi-sr-money-bill-wave text-base text-amber-500" /> },
    { id: 'unpaid', labelEn: 'Unpaid Dues', labelBn: 'বকেয়া হিসাব', icon: <i className="fi fi-sr-triangle-warning text-base text-rose-500" /> },
    { id: 'expense', labelEn: 'Expenses', labelBn: 'খরচসমূহ', icon: <i className="fi fi-sr-receipt text-base text-purple-500" /> },
    { id: 'dokan', labelEn: 'Shop Dues', labelBn: 'দোকান বাকি', icon: <i className="fi fi-sr-shop text-base text-orange-500" /> },
    { id: 'analytics', labelEn: 'Analytics', labelBn: 'অ্যানালিটিক্স', icon: <i className="fi fi-sr-chart-line-up text-base text-indigo-500" /> },
  ];

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
    <header className="header-section no-print rounded-[32px] bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/80 dark:border-white/10 p-4 sm:p-6 mb-6 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.3)] text-slate-800 dark:text-slate-100 relative z-50">
      
      {/* 1. Kalima */}
      <div className="text-center text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 pb-2 mb-3 border-b border-slate-200/60 dark:border-slate-800/80 tracking-wide">
        لَا إِلَٰهَ إِلَّا ٱللَّٰهُ مُحَمَّدٌ رَسُولُ ٱللَّٰهِ
      </div>
      
      {/* 2. Top Bar: Logo Branding + Search + Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 shrink-0">
          <Logo />
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              {t.appName}
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
              {language === 'bn' ? 'ম্যানেজমেন্ট সিস্টেম' : 'Property Management'}
            </p>
          </div>
        </div>

        {/* Search Bar - Pill Style matching reference image */}
        <div className="relative flex-1 w-full max-w-md">
          <i className="fi fi-sr-search text-sm absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-11 pr-9 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-white dark:border-white/10 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 shadow-sm backdrop-blur-md transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
            >
              <i className="fi fi-sr-cross text-xs" />
            </button>
          )}
        </div>

        {/* Control Pill Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end relative z-30">
          {/* Date Selector Pill Button */}
          <div className="relative shrink-0 flex-1 md:flex-none" ref={datePickerRef}>
            <button
              type="button"
              onClick={() => {
                setIsDatePickerOpen((prev) => !prev);
                setIsQuickNavOpen(false);
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-white dark:border-white/10 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 backdrop-blur-md"
            >
              <i className="fi fi-sr-calendar text-sm text-[#2563EB] shrink-0" />
              <span className="truncate max-w-[80px] sm:max-w-none">{getSelectedDateLabel()}</span>
              <i className={`fi fi-sr-angle-down text-xs text-slate-400 shrink-0 transition-transform duration-200 ${isDatePickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Date Selection Popover Dropdown */}
            {isDatePickerOpen && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[24px] shadow-xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                {/* Header & Quick Action Buttons */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleThisMonth}
                    className="flex-1 px-3 py-1.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/20 text-[11px] font-bold transition-colors cursor-pointer text-center"
                  >
                    {language === 'bn' ? 'চলতি মাস' : 'This Month'}
                  </button>

                  <button
                    type="button"
                    onClick={handleAllTime}
                    className="flex-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer text-center"
                  >
                    {language === 'bn' ? 'সকল সময়' : 'All Time'}
                  </button>
                </div>

                {/* Month Stepper Bar */}
                <div className="flex items-center justify-between bg-slate-100/70 dark:bg-slate-800/70 rounded-full p-1.5 border border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    title={language === 'bn' ? 'পূর্ববর্তী মাস' : 'Previous Month'}
                    className="p-1 rounded-full hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 transition-colors cursor-pointer"
                  >
                    <i className="fi fi-sr-angle-left text-xs" />
                  </button>

                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {getSelectedDateLabel()}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    title={language === 'bn' ? 'পরবর্তী মাস' : 'Next Month'}
                    className="p-1 rounded-full hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 transition-colors cursor-pointer"
                  >
                    <i className="fi fi-sr-angle-right text-xs" />
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
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-full px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="dark:bg-slate-900">{t.yearAllOpt}</option>
                    {(availableYears || []).map((yr) => (
                      <option key={yr} value={yr} className="dark:bg-slate-900">
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month Grid */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    {language === 'bn' ? 'মাস নির্বাচন করুন' : 'Select Month'}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => { onMonthChange('all'); setIsDatePickerOpen(false); }}
                      className={`py-1.5 px-2 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        selectedMonth === 'all'
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
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
                          className={`py-1.5 px-2 rounded-full text-[11px] font-semibold truncate transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
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
          
          {/* Quick Navigation Button Pill */}
          <div className="relative shrink-0 flex-1 md:flex-none" ref={quickNavRef}>
            <button
              type="button"
              onClick={() => {
                setIsQuickNavOpen((prev) => !prev);
                setIsDatePickerOpen(false);
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-[#2563EB] dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95 backdrop-blur-md"
            >
              <i className="fi fi-sr-compass-alt text-sm shrink-0" />
              <span className="truncate max-w-[65px] sm:max-w-none">{language === 'bn' ? 'নেভিগেশন' : 'Navigation'}</span>
              <i className={`fi fi-sr-angle-down text-xs shrink-0 transition-transform duration-200 ${isQuickNavOpen ? 'rotate-180' : ''}`} />
            </button>

            {isQuickNavOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[24px] shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
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
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className={isActive ? 'text-white dark:text-slate-900' : ''}>{item.icon}</span>
                      <span className="flex-1 truncate">{language === 'bn' ? item.labelBn : item.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Menu Pill Button */}
          <div className="relative shrink-0 flex-1 md:flex-none" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen((prev) => !prev);
                setIsDatePickerOpen(false);
                setIsQuickNavOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8] px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <i className="fi fi-sr-menu-burger text-sm" />
              <span className="truncate max-w-[40px] sm:max-w-none">{language === 'bn' ? 'মেনু' : 'Menu'}</span>
              <i className={`fi fi-sr-angle-down text-xs transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-[280px] sm:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl text-slate-800 dark:text-slate-100 rounded-[28px] shadow-2xl border border-white/80 dark:border-white/10 z-50 overflow-hidden text-xs divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[85vh] overflow-y-auto">
                
                {/* Online Sync State Banner */}
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isFirebaseActive ? 'bg-emerald-400' : 'bg-amber-400'
                      }`} />
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${
                        isFirebaseActive ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5 truncate">
                        <span>{isFirebaseActive ? (language === 'bn' ? 'অনলাইন সিন্ক সক্রিয়' : 'Online Sync Active') : t.offlineMode}</span>
                        {isSyncing && <i className="fi fi-sr-refresh text-xs animate-spin text-emerald-500 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {isFirebaseActive 
                          ? (language === 'bn' ? 'ফায়ারবেস ক্লাউড ডেটাবেস লাইভ' : 'Firebase Cloud DB Live')
                          : (language === 'bn' ? 'লোকাল স্টোরেজ মোড' : 'Local Storage Mode')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cloud & Data Backup */}
                <div className="p-4 space-y-2">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <i className="fi fi-sr-cloud-upload-alt text-sm text-emerald-500" />
                    <span>{language === 'bn' ? 'ক্লাউড ব্যাকআপ ও রিস্টোর' : 'Cloud Backup & Sync'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); onFirebaseCloudBackup(); }}
                      className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-full font-bold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      <i className="fi fi-sr-cloud-upload-alt text-sm" />
                      <span>{language === 'bn' ? 'ব্যাকআপ নিন' : 'Cloud Backup'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); onFirebaseCloudRestore(); }}
                      className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 py-2 px-3 rounded-full font-bold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <i className="fi fi-sr-cloud-download-alt text-sm text-indigo-500" />
                      <span>{language === 'bn' ? 'রিস্টোর করুন' : 'Cloud Restore'}</span>
                    </button>
                  </div>
                </div>

                {/* Display & Language Options */}
                <div className="p-4 space-y-2">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {language === 'bn' ? 'ডিসপ্লে ও ভাষা' : 'Display & Language'}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Language Switch */}
                    <button
                      type="button"
                      onClick={() => { onLanguageToggle(); }}
                      className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2.5 rounded-full border border-slate-200/80 dark:border-slate-700 cursor-pointer hover:bg-slate-200 transition-colors px-4"
                    >
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-medium">
                        <i className="fi fi-sr-globe text-sm text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[11px] font-bold">{language === 'bn' ? 'বাংলা' : 'English'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">⇄</span>
                    </button>

                    {/* Dark Mode Switch */}
                    <button
                      type="button"
                      onClick={() => { onThemeToggle(); }}
                      className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2.5 rounded-full border border-slate-200/80 dark:border-slate-700 cursor-pointer hover:bg-slate-200 transition-colors px-4"
                    >
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-medium">
                        {theme === 'dark' ? (
                          <i className="fi fi-sr-moon text-sm text-indigo-400" />
                        ) : (
                          <i className="fi fi-sr-sun text-sm text-amber-500" />
                        )}
                        <span className="text-[11px] font-bold">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">⇄</span>
                    </button>
                  </div>

                  {/* Print Action */}
                  <button
                    type="button"
                    onClick={() => { setIsMenuOpen(false); onPrint(); }}
                    className="w-full text-left px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-between text-slate-700 dark:text-slate-100 font-bold transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700 mt-2"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fi fi-sr-print text-sm text-emerald-600 dark:text-emerald-400" />
                      <span>{t.printBtn}</span>
                    </div>
                  </button>
                </div>

                {/* Owner Account & Security */}
                <div className="p-4 bg-slate-50/80 dark:bg-slate-900/90 space-y-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-[11px]">
                      <i className="fi fi-sr-shield-check text-sm text-emerald-500" />
                      {language === 'bn' ? 'মালিক অ্যাকাউন্ট:' : 'Owner Status:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); onOpenAuthModal(); }}
                      className="text-[#2563EB] hover:underline font-extrabold cursor-pointer text-xs"
                    >
                      {userEmail ? (language === 'bn' ? 'অ্যাকাউন্ট সেটিংস' : 'Manage') : t.loginBtn}
                    </button>
                  </div>
                  {userEmail ? (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
                      ✓ {userEmail}
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-600 font-medium">
                      {language === 'bn' ? 'লগইন করা নেই' : 'Not logged in'}
                    </p>
                  )}

                  {onLockApp && (
                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); onLockApp(); }}
                      className="w-full mt-2 py-2 px-4 rounded-full bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-[#2563EB] font-extrabold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-blue-200 dark:border-blue-900"
                    >
                      <i className="fi fi-sr-lock text-xs" />
                      <span>{language === 'bn' ? 'ওয়েবসাইট লক করুন (লগআউট)' : 'Lock Website (Log Out)'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Android Install Modal */}
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        language={language}
      />
    </header>
  );
};



