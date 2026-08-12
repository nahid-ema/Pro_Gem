import React from 'react';
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

export const UnpaidSection: React.FC<UnpaidSectionProps> = ({
  unpaidItems,
  language,
  selectedYear,
  selectedMonth,
  searchQuery = '',
  onQuickPay,
}) => {
  const t = getTranslation(language);

  const safeUnpaidItems = (Array.isArray(unpaidItems) ? unpaidItems : [])
    .filter((item) => {
      if (!item || !item.tenant) return false;
      return matchesQuery(searchQuery, [
        item.tenant.name,
        item.tenant.room,
        item.tenant.phone,
        item.tenant.nid,
        item.estimatedDue,
      ]);
    })
    .sort((a, b) => (a.tenant.room || '').localeCompare(b.tenant.room || '', undefined, { numeric: true }));

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
    <div className="rounded-[32px] bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/80 dark:border-white/10 p-6 sm:p-8 mb-6 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.3)]">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center font-bold text-lg shrink-0 border border-rose-100 dark:border-rose-900/40 shadow-sm">
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

        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-full text-xs font-black tracking-wide shrink-0 shadow-sm">
          {t.unpaidTotalLabel} {formatCurrency(totalUnpaidSum)}
        </div>
      </div>

      {/* Table / Status */}
      {safeUnpaidItems.length === 0 ? (
        <div className="p-5 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-[24px] flex items-center justify-between gap-3">
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
          <span className="hidden sm:inline-flex px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs shrink-0">
            {language === 'bn' ? '(পরিশোধিত)' : '(Paid)'}
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[24px] border border-white/80 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-900 dark:text-white uppercase text-[10px] font-black tracking-widest border-b border-slate-200 dark:border-slate-700">
                <th className="p-3.5 pl-4">{t.thUnpaidRoom}</th>
                <th className="p-3.5">{t.thUnpaidName}</th>
                <th className="p-3.5">{t.thUnpaidPhone}</th>
                <th className="p-3.5">{t.thUnpaidAmount}</th>
                <th className="p-3.5 pr-4 no-print text-right">{t.thUnpaidAction || 'যোগাযোগ ও জমা'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
              {safeUnpaidItems.map((item) => (
                <tr key={item.tenant.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 pl-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200/60 dark:border-slate-700">
                      {t.roomText}: {item.tenant.room}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {item.tenant.name}
                  </td>
                  <td className="p-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">{item.tenant.phone}</td>
                  <td className="p-3.5 font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(item.estimatedDue)}
                  </td>
                  <td className="p-3.5 pr-4 no-print text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => sendSms(item)}
                        className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
                        title={t.actionSms}
                      >
                        <i className="fi fi-sr-phone-call text-xs" />
                      </button>

                      <button
                        onClick={() => sendWhatsApp(item)}
                        className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-colors"
                        title={t.actionWa}
                      >
                        <i className="fi fi-sr-comment text-xs" />
                      </button>

                      <button
                        onClick={() => onQuickPay(item)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs shadow-sm transition-colors cursor-pointer active:scale-95"
                      >
                        <i className="fi fi-sr-dollar text-xs" />
                        <span>{t.quickPay}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700">
                <td colSpan={3} className="p-3.5 pl-4 text-right">
                  {language === 'bn' 
                    ? `মোট অনাদায়ী (${safeUnpaidItems.length} টি রুম/ভাড়াটিয়া):` 
                    : `Total Unpaid Dues (${safeUnpaidItems.length} Tenants):`
                  }
                </td>
                <td className="p-3.5 font-bold text-rose-600 dark:text-rose-400 text-sm sm:text-base font-mono">
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
