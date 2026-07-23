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
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  language: Language;
  theme: Theme;
  onLanguageToggle: () => void;
  onThemeToggle: () => void;
  onTriggerBackup: () => void;
  onTriggerRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrint: () => void;
  onLoadDemoData: () => void;
  onResetData: () => void;
  onOpenAuthModal: () => void;
  userEmail?: string | null;
  isFirebaseActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  theme,
  onLanguageToggle,
  onThemeToggle,
  onTriggerBackup,
  onTriggerRestore,
  onPrint,
  onLoadDemoData,
  onResetData,
  onOpenAuthModal,
  userEmail,
  isFirebaseActive
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
    <header className="header-section bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 mb-5 shadow-xl text-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md text-xl font-bold shrink-0">
            A
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                {t.appName}
              </h1>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                isFirebaseActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {isFirebaseActive ? t.firebaseConnected : t.offlineMode}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Right: Single Menu Dropdown Button */}
        <div className="flex items-center gap-2 no-print self-end md:self-auto">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500/30 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>{language === 'bn' ? 'মেনু' : 'Menu'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-800 z-50 overflow-hidden py-2 text-xs divide-y divide-slate-800">
                {/* Display & Language Options */}
                <div className="px-3.5 py-2.5 space-y-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {language === 'bn' ? 'ডিসপ্লে ও ভাষা' : 'Display & Language'}
                  </div>

                  {/* Language Switch */}
                  <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                    <div className="flex items-center gap-2 text-slate-200 font-medium">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <span>{language === 'bn' ? 'ভাষা / Language' : 'Language'}</span>
                    </div>
                    <button
                      onClick={() => { onLanguageToggle(); }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      {language === 'bn' ? 'English' : 'বাংলা'}
                    </button>
                  </div>

                  {/* Dark Mode Switch */}
                  <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                    <div className="flex items-center gap-2 text-slate-200 font-medium">
                      {theme === 'dark' ? (
                        <Moon className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-400" />
                      )}
                      <span>{language === 'bn' ? 'থিম / Theme' : 'Theme'}</span>
                    </div>
                    <button
                      onClick={() => { onThemeToggle(); }}
                      className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-100 px-2.5 py-1 rounded font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="w-3 h-3 text-amber-400" />
                          <span>Light</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3 h-3 text-indigo-400" />
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
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200 font-medium transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <span>{t.printBtn}</span>
                  </button>
                </div>

                {/* Account & Cloud Sync */}
                <div className="px-3.5 py-2.5 bg-slate-900/90">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-400">{language === 'bn' ? 'অ্যাকাউন্ট:' : 'Account:'}</span>
                    <button
                      onClick={() => { setIsMenuOpen(false); onOpenAuthModal(); }}
                      className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                    >
                      {userEmail ? (language === 'bn' ? 'ম্যানেজ' : 'Manage') : t.loginBtn}
                    </button>
                  </div>
                  {userEmail && (
                    <p className="text-[11px] text-emerald-400 font-mono truncate mt-0.5">
                      ✓ {userEmail}
                    </p>
                  )}
                </div>

                {/* Data Backup & Restore */}
                <div className="py-1">
                  <button
                    onClick={() => { setIsMenuOpen(false); onTriggerBackup(); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200 font-medium transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-sky-400" />
                    <span>{t.backupBtn}</span>
                  </button>

                  <button
                    onClick={() => { setIsMenuOpen(false); fileInputRef.current?.click(); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200 font-medium transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-teal-400" />
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
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-amber-400 font-medium transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t.demoDataBtn}</span>
                  </button>

                  <button
                    onClick={() => { setIsMenuOpen(false); onResetData(); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-rose-400 font-medium transition-colors cursor-pointer"
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
