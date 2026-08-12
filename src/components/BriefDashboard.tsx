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
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Greeting & Overview Card - Matching "Sense" Centerpiece in Reference Image */}
      <div className="relative rounded-[32px] bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/80 dark:border-white/10 p-6 sm:p-8 md:p-10 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.3)] overflow-hidden text-center flex flex-col items-center justify-center">
        {/* Subtle Background Mesh Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-pink-300/30 dark:bg-pink-900/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-purple-300/30 dark:bg-purple-900/20 blur-3xl pointer-events-none" />

        {/* 3D Orb Logo Accent */}
        <div className="relative mb-4 z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-rose-400 via-pink-300 to-amber-200 shadow-[inset_2px_2px_8px_rgba(255,255,255,0.9),0_10px_30px_rgba(244,114,182,0.4)] flex items-center justify-center p-3 animate-pulse">
            <img src="/logo.png" alt="Nahid Kutir" className="w-9 h-9 object-contain drop-shadow" referrerPolicy="no-referrer" />
          </div>
        </div>

        {/* Hero Greeting Headline */}
        <h2 className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight max-w-xl leading-tight">
          {language === 'bn' ? (
            <>শুভ দিন! <span className="text-[#2563EB] dark:text-blue-400 font-black">নাহিদ কুটির</span> এর আর্থিক বিবরণী</>
          ) : (
            <>Good Day! Overview for <span className="text-[#2563EB] dark:text-blue-400 font-black">Nahid Kutir</span></>
          )}
        </h2>

        <p className="relative z-10 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
          {selectedYear === 'all' && selectedMonth === 'all'
            ? (language === 'bn' ? 'সকল বছর ও মাসের সামগ্রিক রিয়েল-টাইম হিসাব' : 'All-Time Financial Performance & Realtime Stats')
            : `${selectedYear !== 'all' ? selectedYear : ''} ${monthName}`
          }
        </p>

        {/* Collection Efficiency Pill */}
        <div className="relative z-10 mt-5 inline-flex items-center gap-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-white dark:border-white/10 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>{t.collectionProgress}:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">{collectionPercentage}%</span>
        </div>
      </div>

      {/* 6 Soft Pastel Gradient Cards Grid - Inspired by "Meditate", "Music", "Move", "Sleep" in Reference Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* 1. Expected Rent */}
        <div className="group relative rounded-[28px] p-6 bg-gradient-to-br from-blue-50/80 via-sky-50/50 to-indigo-50/40 dark:from-slate-900/90 dark:via-blue-950/20 dark:to-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_-10px_rgba(37,99,235,0.12)] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600/80 dark:text-blue-400">
              {t.briefRentLbl}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-white/10 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shadow-sm">
              <i className="fi fi-sr-wallet text-sm" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalExpectedRent)}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{language === 'bn' ? 'মোট বাজেট' : 'Total Expected'}</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
        </div>

        {/* 2. Collected Income */}
        <div className="group relative rounded-[28px] p-6 bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-emerald-50/30 dark:from-slate-900/90 dark:via-emerald-950/20 dark:to-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_-10px_rgba(16,185,129,0.12)] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600/80 dark:text-emerald-400">
              {t.briefIncomeLbl}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <i className="fi fi-sr-chart-line-up text-sm" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalCollectedIncome)}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{language === 'bn' ? 'সংগ্রহ সফল' : 'Collected'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{collectionPercentage}%</span>
          </div>
        </div>

        {/* 3. Outstanding Due */}
        <div className="group relative rounded-[28px] p-6 bg-gradient-to-br from-rose-50/80 via-pink-50/50 to-orange-50/30 dark:from-slate-900/90 dark:via-rose-950/20 dark:to-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_-10px_rgba(244,63,94,0.12)] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-rose-600/80 dark:text-rose-400">
              {t.briefDueLbl}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-white/10 text-rose-500 flex items-center justify-center shadow-sm">
              <i className="fi fi-sr-info text-sm" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalOutstandingDue)}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{language === 'bn' ? 'অনাদায়ী বকেয়া' : 'Pending Dues'}</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
        </div>

        {/* 4. Operating Expenses */}
        <div className="group relative rounded-[28px] p-6 bg-gradient-to-br from-purple-50/80 via-fuchsia-50/40 to-indigo-50/30 dark:from-slate-900/90 dark:via-purple-950/20 dark:to-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_-10px_rgba(168,85,247,0.12)] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-purple-600/80 dark:text-purple-400">
              {t.briefExpLbl}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-white/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
              <i className="fi fi-sr-receipt text-sm" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalExpenses)}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{language === 'bn' ? 'রক্ষণাবেক্ষণ ও খরচ' : 'Expenses'}</span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
        </div>

        {/* 5. Shop Dues */}
        <div className="group relative rounded-[28px] p-6 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-yellow-50/30 dark:from-slate-900/90 dark:via-amber-950/20 dark:to-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_-10px_rgba(245,158,11,0.12)] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600/80 dark:text-amber-400">
              {t.briefDokLbl}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-white/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm">
              <i className="fi fi-sr-shop text-sm" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalShopDues)}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{language === 'bn' ? 'দোকান হিসাব বাকি' : 'Shop Dues'}</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
        </div>

        {/* 6. Total Records */}
        <div className="group relative rounded-[28px] p-6 bg-gradient-to-br from-slate-100/80 via-slate-50/50 to-zinc-100/40 dark:from-slate-900/90 dark:via-slate-800/40 dark:to-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_-10px_rgba(100,116,139,0.12)] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
              {t.briefEntriesLbl}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-sm">
              <i className="fi fi-sr-list-check text-sm" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {totalEntriesCount}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{language === 'bn' ? 'মোট ডাটা এন্ট্রি' : 'Total Entries'}</span>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
        </div>
      </div>

      {/* Net Position Banner Card */}
      <div className={`rounded-[32px] p-6 sm:p-8 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_12px_36px_-12px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
        isNetPositive 
          ? 'bg-gradient-to-r from-emerald-500/90 via-teal-500/90 to-blue-600/90 text-white shadow-emerald-500/10' 
          : 'bg-gradient-to-r from-rose-500/90 via-pink-500/90 to-amber-500/90 text-white shadow-rose-500/10'
      }`}>
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 font-bold text-white shadow-inner">
            {isNetPositive ? <i className="fi fi-sr-arrow-trend-up text-xl" /> : <i className="fi fi-sr-arrow-trend-down text-xl" />}
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest block text-white/80">
              {t.briefNetLbl}
            </span>
            <p className="text-xs sm:text-sm font-medium text-white/90">
              {isNetPositive
                ? (language === 'bn' ? 'ইতিবাচক আর্থিক স্থিতি (আদায় - খরচ)' : 'Positive Liquid Cash Balance')
                : (language === 'bn' ? 'সতর্কতা: খরচ জমার চেয়ে বেশি' : 'Operating deficit alert')
              }
            </p>
          </div>
        </div>

        <div className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight shrink-0 text-white drop-shadow-sm">
          {formatCurrency(netCashFlow)}
        </div>
      </div>
    </div>
  );
};

