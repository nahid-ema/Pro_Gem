import React, { useState } from 'react';
import { TabType, Language } from '../types';
import { getTranslation } from '../data/translations';

interface QuickActionBarProps {
  language: Language;
  unpaidCount: number;
  onNavigateTab: (tab: TabType) => void;
  onOpenBatchChecklist: () => void;
  onOpenMonthlyReport: () => void;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  language,
  unpaidCount,
  onNavigateTab,
  onOpenBatchChecklist,
  onOpenMonthlyReport,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = getTranslation(language);

  const handleAction = (cb: () => void) => {
    cb();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-4 sm:right-6 z-40 flex flex-col items-end">
      {/* Backdrop overlay when speed dial is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-2xs z-30 animate-fadeIn"
        />
      )}

      {/* Speed Dial Action Items */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 mb-3 z-40 animate-slideUp">
          
          {/* 1. Monthly Batch Checklist (1-Click) */}
          <button
            onClick={() => handleAction(onOpenBatchChecklist)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:scale-105 transition-all text-xs font-bold cursor-pointer group"
          >
            <span className="bg-emerald-700/80 px-2 py-0.5 rounded-lg text-[10px] text-amber-300">
              ⚡ 1-Click
            </span>
            <span>{t.qaBatchChecklist || 'মাসের চেকশিট (১-ক্লিক)'}</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <i className="fi fi-sr-bolt text-sm text-amber-300" />
            </div>
          </button>

          {/* 2. Monthly Financial Statement Report */}
          <button
            onClick={() => handleAction(onOpenMonthlyReport)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:scale-105 transition-all text-xs font-bold cursor-pointer group"
          >
            <span>{t.qaMonthlyReport || 'মাসিক অডিট রিপোর্ট'}</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <i className="fi fi-sr-file-invoice text-sm" />
            </div>
          </button>

          {/* 3. Record Rent */}
          <button
            onClick={() => handleAction(() => onNavigateTab('rent'))}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:scale-105 transition-all text-xs font-bold cursor-pointer group"
          >
            <span>{t.qaAddRent || 'ভাড়া আদায় এন্ট্রি'}</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 dark:bg-slate-900/20 flex items-center justify-center">
              <i className="fi fi-sr-hand-holding-usd text-sm text-emerald-400 dark:text-emerald-600" />
            </div>
          </button>

          {/* 4. Log Expense */}
          <button
            onClick={() => handleAction(() => onNavigateTab('expense'))}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#202020] text-slate-800 dark:text-white border border-[#D6D0C4] dark:border-[#333] shadow-xl hover:scale-105 transition-all text-xs font-bold cursor-pointer group"
          >
            <span>{t.qaAddExpense || 'খরচের হিসাব লিখুন'}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <i className="fi fi-sr-receipt text-sm" />
            </div>
          </button>

          {/* 5. Add Tenant */}
          <button
            onClick={() => handleAction(() => onNavigateTab('tenants'))}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#202020] text-slate-800 dark:text-white border border-[#D6D0C4] dark:border-[#333] shadow-xl hover:scale-105 transition-all text-xs font-bold cursor-pointer group"
          >
            <span>{t.qaAddTenant || 'নতুন ভাড়াটিয়া যোগ'}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <i className="fi fi-sr-user-add text-sm" />
            </div>
          </button>

        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick Actions"
        className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-300 cursor-pointer z-40 relative ${
          isOpen
            ? 'bg-slate-800 rotate-45 scale-95 ring-4 ring-slate-800/30'
            : 'bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-700 dark:from-blue-600 dark:to-emerald-600 hover:scale-105 shadow-blue-500/25 ring-4 ring-blue-500/20'
        }`}
      >
        <i className="fi fi-sr-plus text-xl transition-transform duration-300" />

        {/* Unpaid Badge Indicator if closed */}
        {!isOpen && unpaidCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unpaidCount}
          </span>
        )}
      </button>
    </div>
  );
};
