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

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-slate-800 rounded-none p-3.5 sm:p-5 md:p-6 mb-4 sm:mb-6 shadow-none relative overflow-hidden">
      {/* Header Title & Period indicator */}
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-none sm:rounded-none bg-[#F97316]/10 text-[#F97316] dark:text-[#F97316] flex items-center justify-center font-bold text-sm sm:text-base shrink-0">
            <i className="fi fi-sr-chart-histogram text-base sm:text-lg" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 dark:text-white tracking-tight truncate">
              {t.briefTitle}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              {selectedYear === 'all' && selectedMonth === 'all'
                ? (language === 'bn' ? 'সকল বছর ও মাসের সামগ্রিক হিসাব' : 'All-Time Financial Overview')
                : `${selectedYear !== 'all' ? selectedYear : ''} ${monthName}`
              }
            </p>
          </div>
        </div>

        {/* Collection Efficiency Gauge Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2.5 sm:px-3.5 py-1.5 rounded-none shrink-0 text-xs font-semibold">
          <i className="fi fi-sr-check-circle text-sm sm:text-base text-emerald-500 shrink-0" />
          <span className="hidden sm:inline">{t.collectionProgress}:</span>
          <span className="sm:hidden">{language === 'bn' ? 'আদায় অগ্রগতি:' : 'Collection:'}</span>
          <span className="font-bold text-white">{collectionPercentage}%</span>
        </div>
      </div>

      {/* Collection Progress Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="w-full h-1.5 sm:h-2 bg-[#F2F0EB] dark:bg-[#2A2A2A] rounded-none overflow-hidden">
          <div
            className="h-full bg-[#F97316] rounded-none transition-all duration-500 ease-out"
            style={{ width: `${collectionPercentage}%` }}
          />
        </div>
      </div>

      {/* 6 Key Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 mb-4 sm:mb-5">
        {/* Total Rent Expected */}
        <div className="hover-lift bg-white/60 dark:bg-white/5 backdrop-blur-md border border-[#E8E6E1] dark:border-slate-800 rounded-none p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate">
              {t.briefRentLbl}
            </span>
            <div className="w-5 h-5 rounded-none bg-[#F97316]/20 text-[#F97316] flex items-center justify-center shrink-0">
              <i className="fi fi-sr-wallet text-xs" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white truncate">
            {formatCurrency(totalExpectedRent)}
          </p>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700/80 rounded-none mt-2 sm:mt-3 overflow-hidden">
            <div className="w-full h-full bg-[#F97316]"></div>
          </div>
        </div>

        {/* Total Collected Income */}
        <div className="hover-lift bg-white/60 dark:bg-white/5 backdrop-blur-md border border-[#E8E6E1] dark:border-slate-800 rounded-none p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate">
              {t.briefIncomeLbl}
            </span>
            <div className="w-5 h-5 rounded-none bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <i className="fi fi-sr-chart-line-up text-xs" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white truncate">
            {formatCurrency(totalCollectedIncome)}
          </p>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700/80 rounded-none mt-2 sm:mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${collectionPercentage}%` }}></div>
          </div>
        </div>

        {/* Total Outstanding Due */}
        <div className="hover-lift bg-white/60 dark:bg-white/5 backdrop-blur-md border border-[#E8E6E1] dark:border-slate-800 rounded-none p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate">
              {t.briefDueLbl}
            </span>
            <div className="w-5 h-5 rounded-none bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <i className="fi fi-sr-info text-xs" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white truncate">
            {formatCurrency(totalOutstandingDue)}
          </p>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700/80 rounded-none mt-2 sm:mt-3 overflow-hidden">
            <div className="w-full h-full bg-rose-500"></div>
          </div>
        </div>

        {/* Total Operating Expenses */}
        <div className="hover-lift bg-white/60 dark:bg-white/5 backdrop-blur-md border border-[#E8E6E1] dark:border-slate-800 rounded-none p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate">
              {t.briefExpLbl}
            </span>
            <div className="w-5 h-5 rounded-none bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
              <i className="fi fi-sr-receipt text-xs" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white truncate">
            {formatCurrency(totalExpenses)}
          </p>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700/80 rounded-none mt-2 sm:mt-3 overflow-hidden">
            <div className="w-full h-full bg-purple-500"></div>
          </div>
        </div>

        {/* Total Shop Dues */}
        <div className="hover-lift bg-white/60 dark:bg-white/5 backdrop-blur-md border border-[#E8E6E1] dark:border-slate-800 rounded-none p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate">
              {t.briefDokLbl}
            </span>
            <div className="w-5 h-5 rounded-none bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
              <i className="fi fi-sr-shop text-xs" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white truncate">
            {formatCurrency(totalShopDues)}
          </p>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700/80 rounded-none mt-2 sm:mt-3 overflow-hidden">
            <div className="w-full h-full bg-orange-500"></div>
          </div>
        </div>

        {/* Total Entries Count */}
        <div className="hover-lift bg-white/60 dark:bg-white/5 backdrop-blur-md border border-[#E8E6E1] dark:border-slate-800 rounded-none p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate">
              {t.briefEntriesLbl}
            </span>
            <div className="w-5 h-5 rounded-none bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
              <i className="fi fi-sr-list-check text-xs" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white truncate">
            {totalEntriesCount}
          </p>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700/80 rounded-none mt-2 sm:mt-3 overflow-hidden">
            <div className="w-full h-full bg-blue-500"></div>
          </div>
        </div>
      </div>

      {/* Net Position Banner */}
      <div className={`p-4 md:p-5 rounded-none md:rounded-none border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm ${
        isNetPositive 
          ? 'bg-gradient-to-r from-[#F97316] to-[#34D399] text-white border-none shadow-[0_8px_30px_rgb(249,115,22,0.3)]' 
          : 'bg-gradient-to-r from-rose-500 to-rose-400 text-white border-none shadow-[0_8px_30px_rgb(244,63,94,0.3)]'
      }`}>
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 font-bold text-base ${
            isNetPositive ? 'bg-black dark:bg-white text-white dark:text-slate-900' : 'bg-rose-500 text-white'
          }`}>
            {isNetPositive ? <i className="fi fi-sr-arrow-trend-up text-lg" /> : <i className="fi fi-sr-arrow-trend-down text-lg" />}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80">
              {t.briefNetLbl}
            </span>
            <p className="text-xs font-medium opacity-70">
              {isNetPositive
                ? (language === 'bn' ? 'ইতিবাচক ক্যাশফ্লো অবস্থান' : 'Positive Liquid Balance')
                : (language === 'bn' ? 'সতর্কতা: খরচ জমার চেয়ে বেশি' : 'Operating deficit alert')
              }
            </p>
          </div>
        </div>

        <div className={`text-3xl md:text-4xl font-black font-mono tracking-tight shrink-0 ${
          isNetPositive ? 'text-white' : 'text-white'
        }`}>
          {formatCurrency(netCashFlow)}
        </div>
      </div>
    </div>
  );
};
