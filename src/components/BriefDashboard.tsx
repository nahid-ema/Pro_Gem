import { Language } from "../types";
import { getTranslation } from "../data/translations";
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
}) => {
  const t = getTranslation(language);

  const netCashFlow = totalCollectedIncome - totalExpenses;
  const isNetPositive = netCashFlow >= 0;

  const collectionPercentage = totalExpectedRent > 0 
    ? Math.min(100, Math.round((totalCollectedIncome / totalExpectedRent) * 100)) 
    : 0;

  const formatCurrency = (amount: number) => {
    return `${t.currencySymbol}${amount.toLocaleString()}`;
  };

  const monthName = selectedMonth !== 'all' && t.months && t.months[parseInt(selectedMonth, 10) - 1]
    ? t.months[parseInt(selectedMonth, 10) - 1]
    : '';

  const periodLabel = selectedYear === 'all' && selectedMonth === 'all'
    ? (language === 'bn' ? 'সকল বছর ও মাসের সামগ্রিক হিসাব' : 'All-Time Financial Overview')
    : `${selectedYear !== 'all' ? selectedYear : ''} ${monthName}`.trim();

  return (
    <div className="space-y-6 animate-fadeIn pb-4">
      
      {/* ROW 1: Greeting & Net Position */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Greeting Card */}
        <div className="lg:col-span-2 relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 dark:bg-blue-500/10 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="flex items-center gap-4 sm:gap-6 z-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full bg-gradient-to-tr from-rose-400 via-pink-300 to-amber-200 shadow-[inset_2px_2px_8px_rgba(255,255,255,0.9),0_10px_30px_rgba(244,114,182,0.4)] flex items-center justify-center p-3">
              <img src="/logo.png" alt="Nahid Kutir" className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
                {language === 'bn' ? (
                  <>শুভ দিন! <span className="text-[#2563EB] dark:text-blue-400 font-black">নাহিদ কুটির</span></>
                ) : (
                  <>Good Day! <span className="text-[#2563EB] dark:text-blue-400 font-black">Nahid Kutir</span></>
                )}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">
                {periodLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Net Cash Flow Card */}
        <div className={`relative rounded-3xl p-6 sm:p-8 shadow-sm overflow-hidden flex flex-col justify-center ${isNetPositive ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 'bg-gradient-to-br from-rose-500 to-pink-600 text-white'}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-2xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="flex items-center justify-between mb-3 z-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-white/90 drop-shadow-sm">
              {t.briefNetLbl}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shadow-sm">
              {isNetPositive ? <i className="fi fi-sr-arrow-trend-up text-sm" /> : <i className="fi fi-sr-arrow-trend-down text-sm" />}
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black tracking-tight z-10 drop-shadow-md">
            {formatCurrency(netCashFlow)}
          </p>
        </div>
      </div>

      {/* ROW 2: Rent Collection Progress & Outstanding Due */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rent Performance Card (Spans 2) */}
        <div className="lg:col-span-2 relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col justify-center">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800/30">
                <i className="fi fi-sr-wallet text-lg" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  {language === 'bn' ? 'ভাড়া আদায়ের অগ্রগতি' : 'Rent Collection Progress'}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'bn' ? 'বাজেটের বিপরীতে আদায়' : 'Performance vs Expected'}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.briefRentLbl}</p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">{formatCurrency(totalExpectedRent)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-6 sm:h-8 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden mb-5 shadow-inner border border-slate-200/60 dark:border-slate-700/60">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-3"
              style={{ width: `${Math.max(5, collectionPercentage)}%` }} // Give at least 5% width so the pill isn't completely hidden if 0
            >
              {collectionPercentage >= 15 && (
                <span className="text-[10px] font-black text-white/90 drop-shadow-sm">{collectionPercentage}%</span>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                <span className="hidden sm:inline">{t.briefIncomeLbl}:</span> <span className="sm:hidden">{language === 'bn' ? 'আদায়:' : 'Income:'}</span> {formatCurrency(totalCollectedIncome)}
              </span>
            </div>
            {collectionPercentage < 15 && (
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full shadow-sm border border-blue-100 dark:border-blue-800/50">
                {collectionPercentage}%
              </span>
            )}
          </div>
        </div>

        {/* Outstanding Due Card */}
        <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-rose-500 dark:text-rose-400">
              {t.briefDueLbl}
            </span>
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 flex items-center justify-center border border-rose-100/50 dark:border-rose-800/30">
              <i className="fi fi-sr-info text-base" />
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black tracking-tight text-slate-800 dark:text-white">
              {formatCurrency(totalOutstandingDue)}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
              {language === 'bn' ? 'মোট অনাদায়ী বকেয়া পরিমাণ' : 'Total Pending Dues'}
            </p>
          </div>
        </div>
      </div>

      {/* ROW 3: Expenses, Shop Dues, Total Entries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        {/* Expenses */}
        <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <div className="w-9 h-9 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100/50 dark:border-purple-800/50 shadow-sm">
              <i className="fi fi-sr-receipt text-sm" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{t.briefExpLbl}</span>
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{formatCurrency(totalExpenses)}</p>
        </div>

        {/* Shop Dues */}
        <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100/50 dark:border-amber-800/50 shadow-sm">
              <i className="fi fi-sr-shop text-sm" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{t.briefDokLbl}</span>
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{formatCurrency(totalShopDues)}</p>
        </div>

        {/* Total Entries */}
        <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <i className="fi fi-sr-list-check text-sm" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{t.briefEntriesLbl}</span>
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{totalEntriesCount}</p>
        </div>
      </div>

    </div>
  );
};


