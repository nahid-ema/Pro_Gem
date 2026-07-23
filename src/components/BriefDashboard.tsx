import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { 
  Building2, 
  Wallet, 
  AlertCircle, 
  Receipt, 
  Store, 
  Hash, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2 
} from 'lucide-react';

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

  const netCashFlow = totalCollectedIncome - totalExpenses - totalShopDues;
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-3xl p-3.5 sm:p-5 md:p-6 mb-4 sm:mb-6 shadow-sm relative overflow-hidden">
      {/* Header Title & Period indicator */}
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-[#fdf0ed] dark:bg-slate-800 text-[#e0533c] dark:text-[#f87171] flex items-center justify-center font-bold text-sm sm:text-base shrink-0">
            📊
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
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 sm:px-3.5 py-1 rounded-full shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
          <div className="text-right">
            <span className="block text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.collectionProgress}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {collectionPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Collection Progress Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="w-full h-1.5 sm:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e0533c] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${collectionPercentage}%` }}
          />
        </div>
      </div>

      {/* 6 Key Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5">
        {/* Total Rent Expected */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mb-1 truncate">
            {t.briefRentLbl}
          </div>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate">
            {formatCurrency(totalExpectedRent)}
          </p>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 sm:mt-3 overflow-hidden">
            <div className="w-full h-full bg-[#e0533c]"></div>
          </div>
        </div>

        {/* Total Collected Income */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mb-1 truncate">
            {t.briefIncomeLbl}
          </div>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
            {formatCurrency(totalCollectedIncome)}
          </p>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 sm:mt-3 overflow-hidden">
            <div className="w-full h-full bg-emerald-500" style={{ width: `${collectionPercentage}%` }}></div>
          </div>
        </div>

        {/* Total Outstanding Due */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mb-1 truncate">
            {t.briefDueLbl}
          </div>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-rose-600 dark:text-rose-400 truncate">
            {formatCurrency(totalOutstandingDue)}
          </p>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 sm:mt-3 overflow-hidden">
            <div className="w-full h-full bg-rose-500"></div>
          </div>
        </div>

        {/* Total Operating Expenses */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mb-1 truncate">
            {t.briefExpLbl}
          </div>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate">
            {formatCurrency(totalExpenses)}
          </p>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 sm:mt-3 overflow-hidden">
            <div className="w-full h-full bg-amber-500"></div>
          </div>
        </div>

        {/* Total Shop Dues */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mb-1 truncate">
            {t.briefDokLbl}
          </div>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate">
            {formatCurrency(totalShopDues)}
          </p>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 sm:mt-3 overflow-hidden">
            <div className="w-full h-full bg-orange-500"></div>
          </div>
        </div>

        {/* Total Entries Count */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mb-1 truncate">
            {t.briefEntriesLbl}
          </div>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate">
            {totalEntriesCount}
          </p>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 sm:mt-3 overflow-hidden">
            <div className="w-full h-full bg-blue-500"></div>
          </div>
        </div>
      </div>

      {/* Net Position Banner */}
      <div className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm ${
        isNetPositive 
          ? 'bg-slate-900 text-white border-slate-800' 
          : 'bg-rose-950/90 text-white border-rose-800'
      }`}>
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-base ${
            isNetPositive ? 'bg-[#e0533c] text-white' : 'bg-rose-500 text-white'
          }`}>
            {isNetPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
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

        <div className="text-xl md:text-2xl font-bold font-mono tracking-tight shrink-0 text-emerald-400">
          {formatCurrency(netCashFlow)}
        </div>
      </div>
    </div>
  );
};
