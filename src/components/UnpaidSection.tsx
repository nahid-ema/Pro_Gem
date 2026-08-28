import React, { useState, useMemo } from 'react';
import { UnpaidTenantItem, Language } from '../types';
import { getTranslation } from '../data/translations';
import { matchesQuery } from '../lib/search';

interface UnpaidSectionProps {
  unpaidItems: UnpaidTenantItem[];
  language: Language;
  selectedYear: string;
  selectedMonth: string;
  searchQuery?: string;
  onQuickPay: (item: UnpaidTenantItem) => void;
}

type SortOption = 'dueDesc' | 'ageDesc' | 'roomAsc';

export const UnpaidSection: React.FC<UnpaidSectionProps> = ({
  unpaidItems,
  language,
  selectedYear,
  selectedMonth,
  searchQuery = '',
  onQuickPay,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('dueDesc');
  const t = getTranslation(language);

  // Helper to compute overdue age tag
  const getOverdueTag = (item: UnpaidTenantItem) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const evalYear = selectedYear !== 'all' ? parseInt(selectedYear, 10) : currentYear;
    const evalMonth = selectedMonth !== 'all' ? parseInt(selectedMonth, 10) : currentMonth;

    const monthDiff = (currentYear - evalYear) * 12 + (currentMonth - evalMonth);

    if (monthDiff >= 2) {
      return {
        label: language === 'bn' ? `${monthDiff}+ মাস বকেয়া` : `${monthDiff}+ months overdue`,
        badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        severity: 3,
        days: monthDiff * 30 + currentDay,
      };
    } else if (monthDiff === 1) {
      return {
        label: language === 'bn' ? 'গত মাসের বকেয়া' : 'Previous month due',
        badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        severity: 2,
        days: 30 + currentDay,
      };
    } else {
      // Current month -> days past rent cutoff (5th of month)
      const daysPastDue = Math.max(1, currentDay);
      return {
        label: language === 'bn' ? `${daysPastDue} দিন অতিক্রান্ত` : `${daysPastDue} days active`,
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        severity: 1,
        days: daysPastDue,
      };
    }
  };

  const safeUnpaidItems = useMemo(() => {
    const list = (Array.isArray(unpaidItems) ? unpaidItems : []).filter((item) => {
      if (!item || !item.tenant) return false;
      return matchesQuery(searchQuery, [
        item.tenant.name,
        item.tenant.room,
        item.tenant.phone,
        item.tenant.nid,
        item.estimatedDue,
      ]);
    });

    return list.sort((a, b) => {
      if (sortBy === 'dueDesc') {
        return (b.estimatedDue || 0) - (a.estimatedDue || 0);
      } else if (sortBy === 'ageDesc') {
        const ageA = getOverdueTag(a).days;
        const ageB = getOverdueTag(b).days;
        return ageB - ageA;
      } else {
        return (a.tenant.room || '').localeCompare(b.tenant.room || '', undefined, { numeric: true });
      }
    });
  }, [unpaidItems, searchQuery, sortBy, selectedYear, selectedMonth, language]);

  const totalUnpaidSum = safeUnpaidItems.reduce((acc, item) => acc + (item?.estimatedDue || 0), 0);

  const formatCurrency = (val: number) => `${t.currencySymbol}${val.toLocaleString()}`;

  const getCleanPhone = (p: string) => {
    let clean = (p || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '88' + clean;
    return clean;
  };

  const sendSms = (item: UnpaidTenantItem) => {
    if (!item?.tenant) return;
    const msg = t.waMessageTemplate(item.tenant.name, item.tenant.room, item.estimatedDue);
    window.location.href = `sms:${item.tenant.phone}?body=${encodeURIComponent(msg)}`;
  };

  const sendWhatsApp = (item: UnpaidTenantItem) => {
    if (!item?.tenant) return;
    const clean = getCleanPhone(item.tenant.phone);
    const msg = t.waMessageTemplate(item.tenant.name, item.tenant.room, item.estimatedDue);
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const monthName = selectedMonth !== 'all' && t.months && t.months[parseInt(selectedMonth, 10) - 1]
    ? t.months[parseInt(selectedMonth, 10) - 1]
    : '';

  return (
    <div className="rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 mb-6 shadow-sm">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center font-bold text-lg shrink-0 border border-rose-100 dark:border-rose-800/30">
            <i className="fi fi-sr-triangle-warning" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.unpaidTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t.unpaidSubtitle} ({selectedYear !== 'all' ? selectedYear : ''} {monthName})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sorting Dropdown / Chips */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSortBy('dueDesc')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                sortBy === 'dueDesc' ? 'bg-white dark:bg-slate-900 text-rose-600 font-bold shadow-xs' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t.sortByDueDesc || 'সর্বাধিক বকেয়া'}
            </button>
            <button
              onClick={() => setSortBy('ageDesc')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                sortBy === 'ageDesc' ? 'bg-white dark:bg-slate-900 text-orange-600 font-bold shadow-xs' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t.sortByAgeDesc || 'পুরোনো বকেয়া'}
            </button>
            <button
              onClick={() => setSortBy('roomAsc')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                sortBy === 'roomAsc' ? 'bg-white dark:bg-slate-900 text-blue-600 font-bold shadow-xs' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t.sortByRoomAsc || 'রুম অনুযায়ী'}
            </button>
          </div>

          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide shrink-0">
            {t.unpaidTotalLabel} <span className="font-mono">{formatCurrency(totalUnpaidSum)}</span>
          </div>
        </div>
      </div>

      {/* Table / Status */}
      {safeUnpaidItems.length === 0 ? (
        <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-[24px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <i className="fi fi-sr-check-circle text-xl" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                {t.unpaidClear}
              </h4>
              <p className="text-xs text-emerald-600/90 dark:text-emerald-400/90 font-semibold">
                {language === 'bn' ? 'সকল ভাড়াটিয়ার চলতি হিসাব শতভাগ পরিশোধিত রয়েছে।' : 'All occupants are up to date on rent payments.'}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs shrink-0">
            {language === 'bn' ? '(পরিশোধিত)' : '(Paid)'}
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5 pl-4">{t.thUnpaidRoom}</th>
                <th className="p-3.5">{t.thUnpaidName}</th>
                <th className="p-3.5">{language === 'bn' ? 'বকেয়ার সময়কাল' : 'Due Period / Age'}</th>
                <th className="p-3.5 text-right">{t.thUnpaidPhone}</th>
                <th className="p-3.5 text-right">{t.thUnpaidAmount}</th>
                <th className="p-3.5 pr-4 no-print text-right">{t.thUnpaidAction || 'যোগাযোগ ও জমা'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
              {safeUnpaidItems.map((item) => {
                const overdueTag = getOverdueTag(item);
                return (
                  <tr key={item.tenant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Room */}
                    <td className="p-3.5 pl-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                        {t.roomText}: {item.tenant.room}
                      </span>
                    </td>

                    {/* Tenant Name */}
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {item.tenant.name}
                    </td>

                    {/* Overdue Age / Tag Badge */}
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${overdueTag.badgeClass}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        <span>{overdueTag.label}</span>
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="p-3.5 font-mono text-xs text-slate-500 dark:text-slate-400 text-right">
                      {item.tenant.phone}
                    </td>

                    {/* Estimated Due */}
                    <td className="p-3.5 font-mono font-black text-rose-600 dark:text-rose-400 text-right text-sm">
                      {formatCurrency(item.estimatedDue)}
                    </td>

                    {/* Quick Actions */}
                    <td className="p-3.5 pr-4 no-print text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => sendSms(item)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title={t.actionSms}
                        >
                          <i className="fi fi-sr-phone-call text-xs" />
                        </button>

                        <button
                          onClick={() => sendWhatsApp(item)}
                          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                          title={t.actionWa}
                        >
                          <i className="fi fi-sr-comment text-xs" />
                        </button>

                        <button
                          onClick={() => onQuickPay(item)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs transition-all cursor-pointer active:scale-95 ml-1.5 shadow-xs"
                        >
                          <i className="fi fi-sr-bolt text-xs" />
                          <span>{t.quickPay}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
                <td colSpan={4} className="p-3.5 pl-4 text-right">
                  {language === 'bn' 
                    ? `মোট অনাদায়ী (${safeUnpaidItems.length} টি রুম/ভাড়াটিয়া):` 
                    : `Total Unpaid Dues (${safeUnpaidItems.length} Tenants):`
                  }
                </td>
                <td className="p-3.5 font-black text-rose-600 dark:text-rose-400 text-sm sm:text-base font-mono text-right">
                  {formatCurrency(totalUnpaidSum)}
                </td>
                <td className="p-3.5 pr-4 no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
