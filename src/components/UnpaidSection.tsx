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
  onSelectTenantLedger?: (item: UnpaidTenantItem) => void;
}

type SortOption = 'dueDesc' | 'ageDesc' | 'roomAsc';

export const UnpaidSection: React.FC<UnpaidSectionProps> = ({
  unpaidItems,
  language,
  selectedYear,
  selectedMonth,
  searchQuery = '',
  onQuickPay,
  onSelectTenantLedger,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('dueDesc');
  const t = getTranslation(language);

  // Helper to compute overdue age label
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
        textClass: 'text-rose-600 dark:text-rose-400',
        severity: 3,
        days: monthDiff * 30 + currentDay,
      };
    } else if (monthDiff === 1) {
      return {
        label: language === 'bn' ? 'গত মাসের বকেয়া' : 'Previous month due',
        textClass: 'text-amber-600 dark:text-amber-400',
        severity: 2,
        days: 30 + currentDay,
      };
    } else {
      const daysPastDue = Math.max(1, currentDay);
      return {
        label: language === 'bn' ? `${daysPastDue} দিন অতিক্রান্ত` : `${daysPastDue} days active`,
        textClass: 'text-slate-600 dark:text-slate-400',
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
        return (a.tenant.room || '').localeCompare(b.tenant.room || '', undefined, {
          numeric: true,
        });
      }
    });
  }, [unpaidItems, searchQuery, sortBy, selectedYear, selectedMonth, language]);

  const totalUnpaidSum = safeUnpaidItems.reduce(
    (acc, item) => acc + (item?.estimatedDue || 0),
    0
  );

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

  const monthName =
    selectedMonth !== 'all' && t.months && t.months[parseInt(selectedMonth, 10) - 1]
      ? t.months[parseInt(selectedMonth, 10) - 1]
      : '';

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 mb-6 shadow-xs">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {t.unpaidTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.unpaidSubtitle} · {selectedYear !== 'all' ? selectedYear : ''} {monthName}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Segmented Sort Control */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSortBy('dueDesc')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                sortBy === 'dueDesc'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t.sortByDueDesc || 'সর্বাধিক বকেয়া'}
            </button>
            <button
              onClick={() => setSortBy('ageDesc')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                sortBy === 'ageDesc'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t.sortByAgeDesc || 'পুরোনো বকেয়া'}
            </button>
            <button
              onClick={() => setSortBy('roomAsc')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                sortBy === 'roomAsc'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t.sortByRoomAsc || 'রুম অনুযায়ী'}
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
            {t.unpaidTotalLabel}{' '}
            <strong className="font-mono tabular-nums text-rose-600 dark:text-rose-400">
              {formatCurrency(totalUnpaidSum)}
            </strong>
          </div>
        </div>
      </div>

      {/* Table / Status */}
      {safeUnpaidItems.length === 0 ? (
        <div className="p-5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <i className="fi fi-sr-check-circle text-lg text-emerald-600 dark:text-emerald-400" />
            <div>
              <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                {t.unpaidClear}
              </h4>
              <p className="text-xs text-emerald-600/90 dark:text-emerald-400/90">
                {language === 'bn'
                  ? 'সকল ভাড়াটিয়ার চলতি হিসাব শতভাগ পরিশোধিত রয়েছে।'
                  : 'All occupants are up to date on rent payments.'}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline text-emerald-700 dark:text-emerald-300 font-semibold text-xs shrink-0">
            {language === 'bn' ? 'পরিশোধিত' : 'Paid in Full'}
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">{t.thUnpaidRoom}</th>
                <th className="py-3 px-4">{t.thUnpaidName}</th>
                <th className="py-3 px-4">
                  {language === 'bn' ? 'বকেয়ার সময়কাল' : 'Due Period / Age'}
                </th>
                <th className="py-3 px-4 text-right">{t.thUnpaidPhone}</th>
                <th className="py-3 px-4 text-right">{t.thUnpaidAmount}</th>
                <th className="py-3 px-4 no-print text-right">
                  {t.thUnpaidAction || 'যোগাযোগ ও জমা'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {safeUnpaidItems.map((item) => {
                const overdueTag = getOverdueTag(item);
                return (
                  <tr
                    key={item.tenant.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Room (Unboxed clean text) */}
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {t.roomText} {item.tenant.room}
                    </td>

                    {/* Tenant Name */}
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {onSelectTenantLedger ? (
                        <button
                          type="button"
                          onClick={() => onSelectTenantLedger(item)}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-left"
                        >
                          {item.tenant.name}
                        </button>
                      ) : (
                        item.tenant.name
                      )}
                    </td>

                    {/* Overdue Age / Unboxed Text */}
                    <td className={`py-3 px-4 text-xs font-semibold ${overdueTag.textClass}`}>
                      {overdueTag.label}
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400 text-right">
                      {item.tenant.phone}
                    </td>

                    {/* Estimated Due */}
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-rose-600 dark:text-rose-400 text-right text-sm">
                      {formatCurrency(item.estimatedDue)}
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3 px-4 no-print text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => sendSms(item)}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title={t.actionSms}
                        >
                          <i className="fi fi-sr-phone-call text-xs" />
                        </button>

                        <button
                          onClick={() => sendWhatsApp(item)}
                          className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                          title={t.actionWa}
                        >
                          <i className="fi fi-sr-comment text-xs" />
                        </button>

                        <button
                          onClick={() => onQuickPay(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap ml-1"
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
                <td colSpan={4} className="py-3 px-4 text-right">
                  {language === 'bn'
                    ? `মোট অনাদায়ী (${safeUnpaidItems.length} টি রুম/ভাড়াটিয়া):`
                    : `Total Unpaid Dues (${safeUnpaidItems.length} Tenants):`}
                </td>
                <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400 text-sm sm:text-base font-mono tabular-nums text-right">
                  {formatCurrency(totalUnpaidSum)}
                </td>
                <td className="py-3 px-4 no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
