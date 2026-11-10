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
    <div className="fixed bottom-18 lg:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end no-print">
      {/* Backdrop overlay when speed dial is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/25 backdrop-blur-2xs z-30 animate-fadeIn"
        />
      )}

      {/* Speed Dial Action Items */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2 mb-3 z-40 animate-slideUp">
          {/* 1. Monthly Batch Checklist (1-Click) */}
          <button
            onClick={() => handleAction(onOpenBatchChecklist)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-colors text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            <span>{t.qaBatchChecklist || 'মাসের চেকশিট (১-ক্লিক)'}</span>
            <i className="fi fi-sr-bolt text-xs" />
          </button>

          {/* 2. Monthly Financial Statement Report */}
          <button
            onClick={() => handleAction(onOpenMonthlyReport)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-colors text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            <span>{t.qaMonthlyReport || 'মাসিক অডিট রিপোর্ট'}</span>
            <i className="fi fi-sr-file-invoice text-xs" />
          </button>

          {/* 3. Record Rent */}
          <button
            onClick={() => handleAction(() => onNavigateTab('rent'))}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg transition-colors text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            <span>{t.qaAddRent || 'ভাড়া আদায় এন্ট্রি'}</span>
            <i className="fi fi-sr-hand-holding-usd text-xs" />
          </button>

          {/* 4. Log Expense */}
          <button
            onClick={() => handleAction(() => onNavigateTab('expense'))}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-lg transition-colors text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            <span>{t.qaAddExpense || 'খরচের হিসাব লিখুন'}</span>
            <i className="fi fi-sr-receipt text-xs text-amber-600 dark:text-amber-400" />
          </button>

          {/* 5. Add Tenant */}
          <button
            onClick={() => handleAction(() => onNavigateTab('tenants'))}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-lg transition-colors text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            <span>{t.qaAddTenant || 'নতুন ভাড়াটিয়া যোগ'}</span>
            <i className="fi fi-sr-user-add text-xs text-indigo-600 dark:text-indigo-400" />
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick Actions"
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-200 cursor-pointer z-40 relative ${
          isOpen
            ? 'bg-slate-800 rotate-45'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        <i className="fi fi-sr-plus text-base" />
      </button>
    </div>
  );
};
