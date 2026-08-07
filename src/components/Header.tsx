import React, { useState, useRef, useEffect } from 'react';
import { Language, Theme, TabType } from '../types';
import { getTranslation } from '../data/translations';
import { Logo } from './Logo';
import { 
  Building2, 
  Menu, 
  Download, 
  Upload, 
  Printer, 
  Sun, 
  Moon, 
  Globe, 
  RefreshCw,
  ChevronDown,
  CloudUpload,
  CloudDownload,
  Lock,
  ShieldCheck,
  Search,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Compass,
  BarChart3,
  DoorClosed,
  Users,
  Banknote,
  AlertTriangle,
  Receipt,
  Store,
  LineChart,
  Smartphone
} from 'lucide-react';
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
    function handleClickOutside(event: MouseEvent) {
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: TabType; labelEn: string; labelBn: string; icon: React.ReactNode }[] = [
    { id: 'brief', labelEn: 'Summary', labelBn: 'সারসংক্ষেপ', icon: <BarChart3 className="w-4 h-4 text-[#F4C542]" /> },
    { id: 'rooms', labelEn: 'Rooms', labelBn: 'রুমসমূহ', icon: <DoorClosed className="w-4 h-4 text-blue-500" /> },
    { id: 'tenants', labelEn: 'Tenants', labelBn: 'ভাড়াটিয়া', icon: <Users className="w-4 h-4 text-emerald-500" /> },
    { id: 'rent', labelEn: 'Rent Collection', labelBn: 'ভাড়া আদায়', icon: <Banknote className="w-4 h-4 text-amber-500" /> },
    { id: 'unpaid', labelEn: 'Unpaid Dues', labelBn: 'বকেয়া হিসাব', icon: <AlertTriangle className="w-4 h-4 text-rose-500" /> },
    { id: 'expense', labelEn: 'Expenses', labelBn: 'খরচসমূহ', icon: <Receipt className="w-4 h-4 text-purple-500" /> },
    { id: 'dokan', labelEn: 'Shop Dues', labelBn: 'দোকান বাকি', icon: <Store className="w-4 h-4 text-orange-500" /> },
    { id: 'analytics', labelEn: 'Analytics', labelBn: 'অ্যানালিটিক্স', icon: <LineChart className="w-4 h-4 text-indigo-500" /> },
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
    <header className="header-section no-print bg-white/80 backdrop-blur-xl dark:bg-[#1A1A1A]/80 border-none rounded-3xl p-3.5 sm:p-5 mb-4 shadow-xl shadow-slate-200/50 dark:shadow-none text-slate-800 dark:text-slate-100 relative z-50">
      <div className="text-center text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 tracking-wide">
        لَا إِلَٰهَ إِلَّا ٱللَّٰهُ مُحَمَّدٌ رَسُولُ ٱللَّٰهِ
      </div>
      {/* Row 1: App Name & Status (Left) + Nav Button & Menu Button (Right) */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Branding & Sync Status */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate flex items-center gap-2.5">
              <Logo />
              {t.appName}
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/5 text-[11px] font-medium text-slate-600 dark:text-slate-300 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isFirebaseActive ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isFirebaseActive ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
            <span>{isFirebaseActive ? (language === 'bn' ? 'অনলাইন' : 'Online') : (language === 'bn' ? 'অফলাইন' : 'Offline')}</span>
          </div>
        </div>

        {/* Right Actions: Quick Navigation + Menu Dropdown side by side */}
        <div className="flex items-center gap-2 no-print shrink-0">
          
          {/* Quick Navigation Button */}
          <div className="relative shrink-0" ref={quickNavRef}>
            <button
              type="button"
              onClick={() => setIsQuickNavOpen(!isQuickNavOpen)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F4C542]/10 hover:bg-[#F4C542]/20 text-[#F4C542] border border-[#F4C542]/30 text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline sm:inline">{language === 'bn' ? 'দ্রুত নেভিগেশন' : 'Quick Navigation'}</span>
              <span className="inline xs:hidden sm:hidden">{language === 'bn' ? 'নেভিগেশন' : 'Nav'}</span>
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isQuickNavOpen ? 'rotate-180' : ''}`} />
            </button>

            {isQuickNavOpen && (
              <div className="absolute right-0 mt-2 w-52 sm:w-56 bg-white/80 backdrop-blur-xl dark:bg-[#1A1A1A]/80 border border-[#E8E6E1] dark:border-[#333333] rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
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
                          ? 'bg-[#F4C542] text-slate-900 shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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

          {/* Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 bg-[#F4C542] text-slate-900 hover:bg-[#e0b233] px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>{language === 'bn' ? 'মেনু' : 'Menu'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white/80 backdrop-blur-xl dark:bg-[#1A1A1A]/80 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-[#E8E6E1] dark:border-[#333333] z-50 overflow-hidden text-xs divide-y divide-slate-100 dark:divide-slate-800 max-h-[85vh] overflow-y-auto">
                
                {/* 1. Online Sync State Banner */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isFirebaseActive ? 'bg-emerald-400' : 'bg-amber-400'
                      }`} />
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isFirebaseActive ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5 truncate">
                        <span>{isFirebaseActive ? (language === 'bn' ? 'অনলাইন সিন্ক সক্রিয়' : 'Online Sync Active') : t.offlineMode}</span>
                        {isSyncing && <RefreshCw className="w-3 h-3 animate-spin text-emerald-500 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {isFirebaseActive 
                          ? (language === 'bn' ? 'ফায়ারবেস ক্লাউড ডেটাবেস লাইভ' : 'Firebase Cloud DB Live')
                          : (language === 'bn' ? 'লোকাল স্টোরেজ মোড' : 'Local Storage Mode')}
                      </div>
                    </div>
                  </div>
                  {lastCloudBackupTime && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400 font-mono shrink-0">
                      {lastCloudBackupTime}
                    </span>
                  )}
                </div>

                {/* 2. Cloud & Data Backup */}
                <div className="px-3.5 py-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1">
                      <CloudUpload className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{language === 'bn' ? 'ক্লাউড ব্যাকআপ ও রিস্টোর' : 'Cloud Backup & Sync'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); onFirebaseCloudBackup(); }}
                      className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      <CloudUpload className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ব্যাকআপ নিন' : 'Cloud Backup'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); onFirebaseCloudRestore(); }}
                      className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 py-2 px-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/80"
                    >
                      <CloudDownload className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{language === 'bn' ? 'রিস্টোর করুন' : 'Cloud Restore'}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Local File Backup (JSON) */}
                <div className="px-3.5 py-2 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {language === 'bn' ? 'ফাইল ব্যাকআপ (JSON)' : 'File Backup (JSON)'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); onTriggerBackup(); }}
                      className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 py-1.5 px-2 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>{t.backupBtn}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); fileInputRef.current?.click(); }}
                      className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 py-1.5 px-2 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>{t.restoreBtn}</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => { onTriggerRestore(e); setIsMenuOpen(false); }}
                      accept=".json"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* 4. Display & Language Options */}
                <div className="px-3.5 py-2.5 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {language === 'bn' ? 'ডিসপ্লে ও ভাষা' : 'Display & Language'}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Language Switch */}
                    <button
                      type="button"
                      onClick={() => { onLanguageToggle(); }}
                      className="flex items-center justify-between bg-slate-100 dark:bg-[#2A2A2A]/80 p-2 rounded-xl border border-slate-200/80 dark:border-[#333333] cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/80 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-medium">
                        <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[11px]">{language === 'bn' ? 'বাংলা' : 'English'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">⇄</span>
                    </button>

                    {/* Dark Mode Switch */}
                    <button
                      type="button"
                      onClick={() => { onThemeToggle(); }}
                      className="flex items-center justify-between bg-slate-100 dark:bg-[#2A2A2A]/80 p-2 rounded-xl border border-slate-200/80 dark:border-[#333333] cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/80 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-medium">
                        {theme === 'dark' ? (
                          <Moon className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span className="text-[11px]">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">⇄</span>
                    </button>
                  </div>

                  {/* Print Action */}
                  <button
                    type="button"
                    onClick={() => { setIsMenuOpen(false); onPrint(); }}
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#2A2A2A]/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 flex items-center justify-between text-slate-700 dark:text-slate-100 font-medium transition-colors cursor-pointer border border-slate-200/80 dark:border-[#333333]"
                  >
                    <div className="flex items-center gap-2">
                      <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{t.printBtn}</span>
                    </div>
                  </button>
                </div>

                {/* 5. Owner Account & Security */}
                <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      {language === 'bn' ? 'মালিক অ্যাকাউন্ট:' : 'Owner Status:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); onOpenAuthModal(); }}
                      className="text-[#F4C542] hover:underline font-bold cursor-pointer text-xs"
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
                      className="w-full mt-1.5 py-1.5 px-3 rounded-full bg-[#F4C542]/10 hover:bg-[#F4C542]/20 text-[#F4C542] font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#F4C542]/30"
                    >
                      <Lock className="w-3 h-3" />
                      <span>{language === 'bn' ? 'ওয়েবসাইট লক করুন (লগআউট)' : 'Lock Website (Log Out)'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Divider between Title/Menu & Date/Search */}
      <div className="my-3 sm:my-3.5 border-t border-slate-100 dark:border-slate-800/80" />

      {/* Row 2: Date Selector next to Search Box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Date Selector Button */}
        <div className="relative shrink-0" ref={datePickerRef}>
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-[#333333] text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
          >
            <Calendar className="w-4 h-4 text-[#F4C542] shrink-0" />
            <span>{getSelectedDateLabel()}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isDatePickerOpen ? 'rotate-180' : ''}`} />
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
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {getSelectedDateLabel()}
                </span>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  title={language === 'bn' ? 'পরবর্তী মাস' : 'Next Month'}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
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

        {/* Search Input Box right next to Date Selector */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-8 py-2 bg-slate-100 dark:bg-[#2A2A2A] border border-slate-200/80 dark:border-none rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F4C542] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
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



