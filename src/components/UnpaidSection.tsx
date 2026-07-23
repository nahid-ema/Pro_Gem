import React from 'react';
import { UnpaidTenantItem, Language } from '../types';
import { getTranslation } from '../data/translations';
import { AlertTriangle, MessageSquare, PhoneCall, CheckCircle2, DollarSign } from 'lucide-react';
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 mb-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#fdf0ed] dark:bg-slate-800 text-[#e0533c] dark:text-[#f87171] flex items-center justify-center font-bold text-base">
            <AlertTriangle className="w-4 h-4" />
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

        {safeUnpaidItems.length > 0 && (
          <div className="bg-[#fdf0ed] dark:bg-slate-800 border border-[#e0533c]/30 text-[#e0533c] dark:text-[#f87171] px-3.5 py-1.5 rounded-full text-xs font-semibold">
            {t.unpaidTotalLabel} {formatCurrency(totalUnpaidSum)}
          </div>
        )}
      </div>

      {/* Table / Status */}
      {safeUnpaidItems.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            {t.unpaidClear}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'bn' ? 'সকল ভাড়াটিয়ার চলতি হিসাব শতভাগ পরিশোধিত রয়েছে।' : 'All occupants are up to date on rent payments.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">{t.thUnpaidRoom}</th>
                <th className="p-3">{t.thUnpaidName}</th>
                <th className="p-3">{t.thUnpaidPhone}</th>
                <th className="p-3">{t.thUnpaidAmount}</th>
                <th className="p-3 no-print text-right">যোগাযোগ ও জমা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
              {safeUnpaidItems.map((item) => (
                <tr key={item.tenant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700">
                      {t.roomText}: {item.tenant.room}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {item.tenant.name}
                  </td>
                  <td className="p-3 font-mono text-xs text-slate-500">{item.tenant.phone}</td>
                  <td className="p-3 font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(item.estimatedDue)}
                  </td>
                  <td className="p-3 no-print text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => sendSms(item)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        title={t.actionSms}
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => sendWhatsApp(item)}
                        className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-colors"
                        title={t.actionWa}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onQuickPay(item)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{t.quickPay}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
