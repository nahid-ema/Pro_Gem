import React, { useState, useRef, useEffect } from 'react';
import { Language, Theme } from '../types';
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
  Sparkles, 
  RefreshCw,
  ChevronDown,
  CloudUpload,
  CloudDownload,
  Lock,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  language: Language;
  theme: Theme;
  onLanguageToggle: () => void;
  onThemeToggle: () => void;
  onTriggerBackup: () => void;
  onTriggerRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFirebaseCloudBackup: () => void;
  onFirebaseCloudRestore: () => void;
  onPrint: () => void;
  onLoadDemoData: () => void;
  onResetData: () => void;
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
  onLanguageToggle,
  onThemeToggle,
  onTriggerBackup,
  onTriggerRestore,
  onFirebaseCloudBackup,
  onFirebaseCloudRestore,
  onPrint,
  onLoadDemoData,
  onResetData,
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

  return (
    <header className="header-section bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-3xl p-3 sm:p-5 mb-3 sm:mb-5 shadow-sm dark:shadow-xl text-slate-800 dark:text-slate-200 transition-colors">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md text-base sm:text-lg font-black shrink-0 tracking-tighter">
            A
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {t.appName}
              </h1>
              <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${
                isFirebaseActive 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
              }`}>
                {isFirebaseActive ? (language === 'bn' ? '✓ ক্লাউড' : '✓ Connected') : t.offlineMode}
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 no-print shrink-0">
          {/* Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 bg-[#e0533c] hover:bg-[#cb422d] text-white px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>{language === 'bn' ? 'মেনু' : 'Menu'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 z-50 overflow-hidden py-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                
                {/* Firebase Cloud Console Backup Section */}
                <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CloudUpload className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ফায়ারবেস ক্লাউড ব্যাকআপ' : 'Firebase Cloud Backup'}</span>
                    </div>
                    {lastCloudBackupTime && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {lastCloudBackupTime}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => { setIsMenuOpen(false); onFirebaseCloudBackup(); }}
                      className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      <CloudUpload className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ব্যাকআপ নিন' : 'Cloud Backup'}</span>
                    </button>
                    <button
                      onClick={() => { setIsMenuOpen(false); onFirebaseCloudRestore(); }}
                      className="flex items-center justify-center gap-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 py-2 px-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      <CloudDownload className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{language === 'bn' ? 'রিস্টোর করুন' : 'Cloud Restore'}</span>
                    </button>
                  </div>
                </div>

                {/* Display & Language Options */}
                <div className="px-3.5 py-2.5 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                    {language === 'bn' ? 'ডিসপ্লে ও ভাষা' : 'Display & Language'}
                  </div>

                  {/* Language Switch */}
                  <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                      <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>{language === 'bn' ? 'ভাষা / Language' : 'Language'}</span>
                    </div>
                    <button
                      onClick={() => { onLanguageToggle(); }}
                      className="bg-[#e0533c] hover:bg-[#cb422d] text-white px-2.5 py-1 rounded-full font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      {language === 'bn' ? 'English' : 'বাংলা'}
                    </button>
                  </div>

                  {/* Dark Mode Switch */}
                  <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                      {theme === 'dark' ? (
                        <Moon className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-500" />
                      )}
                      <span>{language === 'bn' ? 'থিম / Theme' : 'Theme'}</span>
                    </div>
                    <button
                      onClick={() => { onThemeToggle(); }}
                      className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 px-2.5 py-1 rounded-full font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                          <span>Light</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Dark</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Print Action */}
                <div className="py-1">
                  <button
                    onClick={() => { setIsMenuOpen(false); onPrint(); }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.printBtn}</span>
                  </button>
                </div>

                {/* Owner Account & Security */}
                <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      {language === 'bn' ? 'মালিক অ্যাকাউন্ট:' : 'Owner Status:'}
                    </span>
                    <button
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
                      onClick={() => { setIsMenuOpen(false); onLockApp(); }}
                      className="w-full mt-2 py-1.5 px-3 rounded-full bg-[#e0533c]/10 hover:bg-[#e0533c]/20 text-[#e0533c] font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#e0533c]/30"
                    >
                      <Lock className="w-3 h-3" />
                      <span>{language === 'bn' ? 'ওয়েবসাইট লক করুন (লগআউট)' : 'Lock Website (Log Out)'}</span>
                    </button>
                  )}
                </div>

                {/* Local Data Backup & Restore */}
                <div className="py-1">
                  <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {language === 'bn' ? 'ফাইল ব্যাকআপ (JSON)' : 'JSON File Backup'}
                  </div>
                  <button
                    onClick={() => { setIsMenuOpen(false); onTriggerBackup(); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>{t.backupBtn}</span>
                  </button>

                  <button
                    onClick={() => { setIsMenuOpen(false); fileInputRef.current?.click(); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
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

                {/* Demo Data & Reset */}
                <div className="py-1">
                  <button
                    onClick={() => { setIsMenuOpen(false); onLoadDemoData(); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-medium transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t.demoDataBtn}</span>
                  </button>

                  <button
                    onClick={() => { setIsMenuOpen(false); onResetData(); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-medium transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{t.resetDataBtn}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

