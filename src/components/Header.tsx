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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
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
    <header className="header-section no-print rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs text-slate-800 dark:text-slate-100 relative z-50">
      {/* Hidden File Input for Local JSON Restore */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={onTriggerRestore}
        className="hidden"
      />

      {/* 1. Kalima */}
      <div className="text-center text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 tracking-wide">
        لَا إِلَٰهَ إِلَّا ٱللَّٰهُ مُحَمَّدٌ رَسُولُ ٱللَّٰهِ
      </div>

      {/* 2. Top Bar: Brand (Mobile) + Search + Date Filter + Menu */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Mobile Brand Logo & Name (Hidden on Desktop) */}
        <div className="flex lg:hidden items-center gap-2.5 shrink-0 self-start md:self-auto">
          <Logo className="w-7 h-7" />
          <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            {t.appName}
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 w-full max-w-xl">
          <i className="fi fi-sr-search text-xs absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
            >
              <i className="fi fi-sr-cross text-xs" />
            </button>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end relative z-30">
          {/* Date Selector with Quick Month Steppers */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 flex-1 md:flex-none">
            <button
              type="button"
              onClick={handlePrevMonth}
              title={language === 'bn' ? 'পূর্ববর্তী মাস' : 'Previous Month'}
              className="p-2 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
            >
              <i className="fi fi-sr-angle-left text-[11px]" />
            </button>

            <div className="relative flex-1 md:flex-none" ref={datePickerRef}>
              <button
                type="button"
                onClick={() => {
                  setIsDatePickerOpen((prev) => !prev);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="fi fi-sr-calendar text-xs text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-none">{getSelectedDateLabel()}</span>
                <i
                  className={`fi fi-sr-angle-down text-[10px] text-slate-400 shrink-0 transition-transform duration-200 ${
                    isDatePickerOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Date Selection Popover Dropdown */}
              {isDatePickerOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 space-y-3">
                  {/* Header & Quick Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleThisMonth}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold transition-colors cursor-pointer text-center whitespace-nowrap"
                    >
                      {language === 'bn' ? 'চলতি মাস' : 'This Month'}
                    </button>

                    <button
                      type="button"
                      onClick={handleAllTime}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer text-center whitespace-nowrap"
                    >
                      {language === 'bn' ? 'সকল সময়' : 'All Time'}
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
                      className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                    >
                      <option value="all" className="dark:bg-slate-900">
                        {t.yearAllOpt}
                      </option>
                      {(availableYears || []).map((yr) => (
                        <option key={yr} value={yr} className="dark:bg-slate-900">
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month Grid */}
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5">
                      {language === 'bn' ? 'মাস নির্বাচন করুন' : 'Select Month'}
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onMonthChange('all');
                          setIsDatePickerOpen(false);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          selectedMonth === 'all'
                            ? 'bg-indigo-600 text-white'
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
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold truncate transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
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

            <button
              type="button"
              onClick={handleNextMonth}
              title={language === 'bn' ? 'পরবর্তী মাস' : 'Next Month'}
              className="p-2 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
            >
              <i className="fi fi-sr-angle-right text-[11px]" />
            </button>
          </div>

          {/* Menu Button */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen((prev) => !prev);
                setIsDatePickerOpen(false);
              }}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="fi fi-sr-menu-burger text-xs" />
              <span>{language === 'bn' ? 'মেনু' : 'Menu'}</span>
              <i
                className={`fi fi-sr-angle-down text-[10px] transition-transform duration-200 ${
                  isMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden text-xs divide-y divide-slate-100 dark:divide-slate-800 max-h-[85vh] overflow-y-auto">
                {/* Online Sync State Banner */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isFirebaseActive ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      <span>
                        {isFirebaseActive
                          ? language === 'bn'
                            ? 'অনলাইন সিন্ক সক্রিয়'
                            : 'Online Sync Active'
                          : t.offlineMode}
                      </span>
                      {isSyncing && (
                        <i className="fi fi-sr-refresh text-xs animate-spin text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {lastCloudBackupTime
                        ? `${language === 'bn' ? 'সর্বশেষ সিন্ক:' : 'Last synced:'} ${lastCloudBackupTime}`
                        : isFirebaseActive
                        ? language === 'bn'
                          ? 'ফায়ারবেস ক্লাউড ডেটাবেস লাইভ'
                          : 'Firebase Cloud DB Live'
                        : language === 'bn'
                        ? 'লোকাল স্টোরেজ মোড'
                        : 'Local Storage Mode'}
                    </div>
                  </div>
                </div>

                {/* Cloud & Local Data Backup */}
                <div className="p-3.5 space-y-2.5">
                  <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    {language === 'bn' ? 'ক্লাউড ও ফাইল ব্যাকআপ' : 'Cloud & File Backup'}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onFirebaseCloudBackup();
                      }}
                      className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <i className="fi fi-sr-cloud-upload-alt text-xs" />
                      <span>{language === 'bn' ? 'ক্লাউড ব্যাকআপ' : 'Cloud Save'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onFirebaseCloudRestore();
                      }}
                      className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 py-2 px-3 rounded-lg font-semibold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <i className="fi fi-sr-cloud-download-alt text-xs text-indigo-500" />
                      <span>{language === 'bn' ? 'ক্লাউড রিস্টোর' : 'Cloud Restore'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onTriggerBackup();
                      }}
                      className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 px-3 rounded-lg font-semibold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <i className="fi fi-sr-download text-xs text-slate-500" />
                      <span>{t.backupBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 px-3 rounded-lg font-semibold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <i className="fi fi-sr-upload text-xs text-slate-500" />
                      <span>{t.restoreBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Display & Language Options */}
                <div className="p-3.5 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    {language === 'bn' ? 'ডিসপ্লে ও ভাষা' : 'Display & Language'}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onLanguageToggle()}
                      className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-semibold">
                        <i className="fi fi-sr-globe text-xs text-indigo-600 dark:text-indigo-400" />
                        <span>{language === 'bn' ? 'বাংলা' : 'English'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">⇄</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onThemeToggle()}
                      className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-semibold">
                        {theme === 'dark' ? (
                          <i className="fi fi-sr-moon text-xs text-indigo-400" />
                        ) : (
                          <i className="fi fi-sr-sun text-xs text-amber-500" />
                        )}
                        <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">⇄</span>
                    </button>
                  </div>

                  {/* Print Action */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onPrint();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-between text-slate-700 dark:text-slate-100 font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fi fi-sr-print text-xs text-emerald-600 dark:text-emerald-400" />
                      <span>{t.printBtn}</span>
                    </div>
                  </button>
                </div>

                {/* Owner Account & Security */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                      {language === 'bn' ? 'মালিক অ্যাকাউন্ট:' : 'Owner Status:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer text-xs"
                    >
                      {userEmail
                        ? language === 'bn'
                          ? 'অ্যাকাউন্ট সেটিংস'
                          : 'Manage'
                        : t.loginBtn}
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
                      onClick={() => {
                        setIsMenuOpen(false);
                        onLockApp();
                      }}
                      className="w-full mt-1 py-2 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-200 dark:border-indigo-900"
                    >
                      <i className="fi fi-sr-lock text-xs" />
                      <span>
                        {language === 'bn' ? 'ওয়েবসাইট লক করুন' : 'Lock Website'}
                      </span>
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
