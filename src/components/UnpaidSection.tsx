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
    <div className="bg-[#F5F5F0] dark:bg-[#1A1A1A] border border-[#D6D0C4] dark:border-slate-800 rounded-sm md:rounded-sm p-5 md:p-6 mb-6 shadow-none">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#D6D0C4] dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#C2410C]/10 text-[#C2410C] dark:text-[#C2410C] flex items-center justify-center font-bold text-base shrink-0">
            <i className="fi fi-sr-triangle-warning" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
              {t.unpaidTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.unpaidSubtitle} ({selectedYear !== 'all' ? selectedYear : ''} {monthName})
            </p>
          </div>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded-sm text-xs font-bold shrink-0">
          {t.unpaidTotalLabel} {formatCurrency(totalUnpaidSum)}
        </div>
      </div>

      {/* Table / Status */}
      {safeUnpaidItems.length === 0 ? (
        <div className="p-3.5 sm:p-4 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-none">
              <i className="fi fi-sr-check-circle text-base sm:text-lg" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                {t.unpaidClear}
              </h4>
              <p className="text-[11px] sm:text-xs text-emerald-600/90 dark:text-emerald-400/90 font-medium">
                {language === 'bn' ? 'সকল ভাড়াটিয়ার চলতি হিসাব শতভাগ পরিশোধিত রয়েছে।' : 'All occupants are up to date on rent payments.'}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 rounded-sm bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs shrink-0">
            {language === 'bn' ? '(পরিশোধিত)' : '(Paid)'}
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-[#D6D0C4] dark:border-slate-800">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="bg-transparent text-slate-900 dark:text-white uppercase text-[10px] font-black tracking-widest border-b-2 border-slate-900 dark:border-white">
                <th className="p-3">{t.thUnpaidRoom}</th>
                <th className="p-3">{t.thUnpaidName}</th>
                <th className="p-3">{t.thUnpaidPhone}</th>
                <th className="p-3">{t.thUnpaidAmount}</th>
                <th className="p-3 no-print text-right">{t.thUnpaidAction || 'যোগাযোগ ও জমা'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
              {safeUnpaidItems.map((item) => (
                <tr key={item.tenant.id} className="border-b border-[#E2DDCF] dark:border-slate-800/50 hover:bg-[#EBE7E0] dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#E2DDCF] dark:bg-[#2A2A2A] text-slate-700 dark:text-slate-300 font-semibold text-xs border border-[#D6D0C4]/80 dark:border-slate-800">
                      {t.roomText}: {item.tenant.room}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {item.tenant.name}
                  </td>
                  <td className="p-3 font-mono text-xs text-slate-500 dark:text-slate-400">{item.tenant.phone}</td>
                  <td className="p-3 font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(item.estimatedDue)}
                  </td>
                  <td className="p-3 no-print text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => sendSms(item)}
                        className="p-1.5 rounded-sm bg-[#E2DDCF] dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
                        title={t.actionSms}
                      >
                        <i className="fi fi-sr-phone-call text-sm" />
                      </button>

                      <button
                        onClick={() => sendWhatsApp(item)}
                        className="p-1.5 rounded-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-none transition-colors"
                        title={t.actionWa}
                      >
                        <i className="fi fi-sr-comment text-sm" />
                      </button>

                      <button
                        onClick={() => onQuickPay(item)}
                        className="flex items-center gap-1 px-3 py-1 rounded-sm bg-[#C2410C] text-white hover:bg-[#9A3412] font-bold text-xs shadow-none transition-colors cursor-pointer"
                      >
                        <i className="fi fi-sr-dollar" />
                        <span>{t.quickPay}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-transparent border-t-2 border-slate-900 dark:border-white font-bold text-slate-900 dark:text-white border-t border-[#D6D0C4] dark:border-slate-800">
                <td colSpan={3} className="p-3 text-right">
                  {language === 'bn' 
                    ? `মোট অনাদায়ী (${safeUnpaidItems.length} টি রুম/ভাড়াটিয়া):` 
                    : `Total Unpaid Dues (${safeUnpaidItems.length} Tenants):`
                  }
                </td>
                <td className="p-3 font-bold text-rose-600 dark:text-rose-400 text-sm sm:text-base font-mono">
                  {formatCurrency(totalUnpaidSum)}
                </td>
                <td className="p-3 no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
