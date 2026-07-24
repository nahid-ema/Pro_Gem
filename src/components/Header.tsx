import React, { useState, useRef, useEffect } from 'react';
import { Language, Theme, TabType } from '../types';
import { getTranslation } from '../data/translations';
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
  BarChart3,
  DoorClosed,
  Users,
  Banknote,
  AlertTriangle,
  Receipt,
  Store,
  LineChart
} from 'lucide-react';

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
  lastCloudBackupTime
}) => {
  const t = getTranslation(language);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigationTabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'brief', label: t.tabBrief, icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'rooms', label: t.tabRooms, icon: <DoorClosed className="w-3.5 h-3.5" /> },
    { id: 'tenants', label: t.tabTenants, icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'rent', label: t.tabRent, icon: <Banknote className="w-3.5 h-3.5" /> },
    { id: 'unpaid', label: t.tabUnpaid, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'expense', label: t.tabExpense, icon: <Receipt className="w-3.5 h-3.5" /> },
    { id: 'dokan', label: t.tabDokan, icon: <Store className="w-3.5 h-3.5" /> },
    { id: 'analytics', label: t.tabAnalytics, icon: <LineChart className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="header-section no-print bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-3.5 sm:p-5 mb-3 sm:mb-5 shadow-sm text-slate-800 dark:text-slate-200 transition-colors relative z-50">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
              {t.appName}
            </h1>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 no-print shrink-0">
          {/* Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 bg-[#e0533c] hover:bg-[#cb422d] text-white px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>{language === 'bn' ? 'মেনু' : 'Menu'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 z-50 overflow-hidden text-xs divide-y divide-slate-100 dark:divide-slate-800 max-h-[85vh] overflow-y-auto">
                
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
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-mono shrink-0">
                      {lastCloudBackupTime}
                    </span>
                  )}
                </div>

                {/* 2. Navigation Sections */}
                {onTabChange && (
                  <div className="p-3 space-y-1.5">
                    <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {language === 'bn' ? 'কুইক নেভিগেশন' : 'Quick Navigation'}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {navigationTabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              onTabChange(tab.id);
                              setIsMenuOpen(false);
                            }}
                            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                              isActive
                                ? 'bg-[#e0533c] text-white shadow-xs'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className={isActive ? 'text-white' : 'text-[#e0533c] dark:text-[#f87171]'}>
                              {tab.icon}
                            </span>
                            <span className="truncate">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Cloud & Data Backup */}
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
                      className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 py-2 px-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/80"
                    >
                      <CloudDownload className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{language === 'bn' ? 'রিস্টোর করুন' : 'Cloud Restore'}</span>
                    </button>
                  </div>
                </div>

                {/* 4. Local File Backup (JSON) */}
                <div className="px-3.5 py-2 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {language === 'bn' ? 'ফাইল ব্যাকআপ (JSON)' : 'File Backup (JSON)'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); onTriggerBackup(); }}
                      className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-1.5 px-2 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>{t.backupBtn}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); fileInputRef.current?.click(); }}
                      className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-1.5 px-2 rounded-xl font-medium text-xs transition-colors cursor-pointer"
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

                {/* 5. Display & Language Options */}
                <div className="px-3.5 py-2.5 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {language === 'bn' ? 'ডিসপ্লে ও ভাষা' : 'Display & Language'}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Language Switch */}
                    <button
                      type="button"
                      onClick={() => { onLanguageToggle(); }}
                      className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/80 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                        <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[11px]">{language === 'bn' ? 'বাংলা' : 'English'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">⇄</span>
                    </button>

                    {/* Dark Mode Switch */}
                    <button
                      type="button"
                      onClick={() => { onThemeToggle(); }}
                      className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/80 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
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
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 flex items-center justify-between text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <div className="flex items-center gap-2">
                      <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{t.printBtn}</span>
                    </div>
                  </button>
                </div>

                {/* 6. Owner Account & Security */}
                <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      {language === 'bn' ? 'মালিক অ্যাকাউন্ট:' : 'Owner Status:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); onOpenAuthModal(); }}
                      className="text-[#e0533c] hover:underline font-bold cursor-pointer text-xs"
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
                      className="w-full mt-1.5 py-1.5 px-3 rounded-full bg-[#e0533c]/10 hover:bg-[#e0533c]/20 text-[#e0533c] font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#e0533c]/30"
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
    </header>
  );
};


