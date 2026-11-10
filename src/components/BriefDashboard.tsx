import { Language } from '../types';
import { getTranslation } from '../data/translations';
import React from 'react';

interface BriefDashboardProps {
  language: Language;
  totalExpectedRent: number;
  totalCollectedIncome: number;
  totalOutstandingDue: number;
  totalExpenses: number;
  totalShopDues: number;
  totalEntriesCount: number;
  selectedYear: string;
  selectedMonth: string;
  onOpenBatchChecklist?: () => void;
  onOpenMonthlyReport?: () => void;
}

export const BriefDashboard: React.FC<BriefDashboardProps> = ({
  language,
  totalExpectedRent,
  totalCollectedIncome,
  totalOutstandingDue,
  totalExpenses,
  totalShopDues,
  totalEntriesCount,
  selectedYear,
  selectedMonth,
  onOpenBatchChecklist,
  onOpenMonthlyReport,
}) => {
  const t = getTranslation(language);

  const netCashFlow = totalCollectedIncome - totalExpenses;
  const isNetPositive = netCashFlow >= 0;

  const collectionPercentage =
    totalExpectedRent > 0
      ? Math.min(100, Math.round((totalCollectedIncome / totalExpectedRent) * 100))
      : 0;

  const formatCurrency = (amount: number) => {
    return `${t.currencySymbol}${amount.toLocaleString()}`;
  };

  const monthName =
    selectedMonth !== 'all' && t.months && t.months[parseInt(selectedMonth, 10) - 1]
      ? t.months[parseInt(selectedMonth, 10) - 1]
      : '';

  const periodLabel =
    selectedYear === 'all' && selectedMonth === 'all'
      ? language === 'bn'
        ? 'সকল বছর ও মাসের সামগ্রিক হিসাব'
        : 'All-Time Financial Overview'
      : `${selectedYear !== 'all' ? selectedYear : ''} ${monthName}`.trim();

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Row 1: Executive Overview Header + Primary Action Toolbar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center p-2">
            <img
              src="/logo.png"
              alt="Nahid Kutir"
              className="w-8 h-8 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {language === 'bn' ? 'নাহিদ কুটির' : 'Nahid Kutir'}
              </h2>
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                ·
              </span>
              <span className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {periodLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'প্রপার্টি ভাড়া আদায়, বকেয়া পর্যবেক্ষণ এবং নিট ক্যাশফ্লো স্টেটমেন্ট'
                : 'Property rent collection, due monitoring, and net cashflow statement'}
            </p>
          </div>
        </div>

        {/* Workspace Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 no-print">
          {onOpenBatchChecklist && (
            <button
              onClick={onOpenBatchChecklist}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs"
            >
              <i className="fi fi-sr-bolt text-xs" />
              <span>{t.batchChecklistTitle || '১-ক্লিক মাসিক ভাড়া চেকশিট'}</span>
            </button>
          )}
          {onOpenMonthlyReport && (
            <button
              onClick={onOpenMonthlyReport}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <i className="fi fi-sr-file-invoice text-xs text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'bn' ? 'মাসিক অডিট স্টেটমেন্ট' : 'Monthly Audit Statement'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Rent Collection Progress & Net Cashflow Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Collection Progress Bar Card (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {language === 'bn' ? 'ভাড়া আদায়ের অগ্রগতি' : 'Rent Collection Progress'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'মাসিক লক্ষ্যমাত্রার বিপরীতে আদায়ের হার' : 'Collected revenue vs. monthly target'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 mr-2">
                {t.briefRentLbl}:
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {formatCurrency(totalExpectedRent)}
              </span>
            </div>
          </div>

          {/* Clean Progress Track */}
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, collectionPercentage)}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <span>
                {language === 'bn' ? 'আদায়কৃত:' : 'Collected:'}{' '}
                <strong className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalCollectedIncome)}
                </strong>
              </span>
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                ·
              </span>
              <span>
                {language === 'bn' ? 'বকেয়া:' : 'Pending:'}{' '}
                <strong className="font-mono tabular-nums text-rose-600 dark:text-rose-400">
                  {formatCurrency(totalOutstandingDue)}
                </strong>
              </span>
            </div>
            <span className="font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400">
              {collectionPercentage}% {language === 'bn' ? 'সম্পন্ন' : 'Complete'}
            </span>
          </div>
        </div>

        {/* Net Cashflow Position (1 col) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.briefNetLbl}
            </span>
            <span
              className={`text-xs font-semibold ${
                isNetPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isNetPositive
                ? language === 'bn'
                  ? 'উদ্বৃত্ত'
                  : 'Surplus'
                : language === 'bn'
                ? 'ঘাটতি'
                : 'Deficit'}
            </span>
          </div>

          <div className="my-3">
            <p
              className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight ${
                isNetPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(netCashFlow)}
            </p>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between font-mono tabular-nums">
            <span>
              +{formatCurrency(totalCollectedIncome)}
            </span>
            <span>−</span>
            <span className="text-rose-600 dark:text-rose-400">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: 4-Column Financial Ledger Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding Due */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.briefDueLbl}
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1.5">
            {formatCurrency(totalOutstandingDue)}
          </p>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {language === 'bn' ? 'চলতি সময়কালের অনাদায়ী ভাড়া' : 'Pending rent for period'}
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.briefExpLbl}
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1.5">
            {formatCurrency(totalExpenses)}
          </p>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {language === 'bn' ? 'রক্ষণাবেক্ষণ ও বিল খরচ' : 'Maintenance & utilities'}
          </div>
        </div>

        {/* Shop Credit Dues */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.briefDokLbl}
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1.5">
            {formatCurrency(totalShopDues)}
          </p>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {language === 'bn' ? 'হার্ডওয়্যার ও মালামাল বাকি' : 'Hardware & material credit'}
          </div>
        </div>

        {/* Total Ledger Entries */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.briefEntriesLbl}
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1.5">
            {totalEntriesCount}
          </p>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {language === 'bn' ? 'মোট ভাড়া, খরচ ও দোকান রেকর্ড' : 'Total logged transactions'}
          </div>
        </div>
      </div>
    </div>
  );
};
