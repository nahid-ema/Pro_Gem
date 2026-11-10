import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Tenant, Room, RentRecord, Language } from '../types';
import { getTranslation } from '../data/translations';
import { formatShortDate } from '../lib/dateUtils';
import { exportElementToPDF } from '../lib/pdfHelper';

interface TenantLedgerModalProps {
  tenant: Tenant | null;
  room?: Room;
  rents: RentRecord[];
  language: Language;
  onClose: () => void;
  onSelectReceipt: (record: RentRecord) => void;
  onQuickPay: (tenantId: string, dueAmount?: number, rentRecordId?: string) => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TenantLedgerModal: React.FC<TenantLedgerModalProps> = ({
  tenant,
  room,
  rents,
  language,
  onClose,
  onSelectReceipt,
  onQuickPay,
  showToast,
}) => {
  const t = getTranslation(language);

  const ledgerRecords = useMemo(() => {
    if (!tenant) return [];
    const roomNo = (tenant.room || '').trim().toLowerCase();
    const tenantName = (tenant.name || '').trim().toLowerCase();

    return (rents || [])
      .filter((r) => {
        if (!r || r.isVacant) return false;
        const rRoom = (r.room || '').trim().toLowerCase();
        const rTenant = (r.tenant || '').trim().toLowerCase();
        return rRoom === roomNo && rTenant === tenantName;
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [tenant, rents]);

  if (!tenant) return null;

  const totalBilled = ledgerRecords.reduce((acc, r) => acc + (r.rent || 0), 0);
  const totalPaid = ledgerRecords.reduce((acc, r) => acc + (r.paid || 0), 0);
  const netBalance = totalBilled - totalPaid;

  const packageTotal = room
    ? (room.rentAmount || 0) + (room.gasBill || 0) + (room.waterBill || 0) + (room.wasteBill || 0)
    : 0;

  const formatCurrency = (val: number) => `${t.currencySymbol}${val.toLocaleString()}`;

  const getCleanPhone = (p: string) => {
    let clean = (p || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '88' + clean;
    return clean;
  };

  const handleShareWhatsAppLedger = () => {
    const cleanPhone = getCleanPhone(tenant.phone);
    const balanceLine =
      netBalance > 0
        ? language === 'bn'
          ? `মোট বকেয়া: ৳${netBalance.toLocaleString()}`
          : `Total Outstanding Due: ৳${netBalance.toLocaleString()}`
        : netBalance < 0
        ? language === 'bn'
          ? `অগ্রিম জমা: ৳${Math.abs(netBalance).toLocaleString()}`
          : `Advance Balance: ৳${Math.abs(netBalance).toLocaleString()}`
        : language === 'bn'
        ? 'বকেয়া: ৳০ (সম্পূর্ণ পরিশোধিত)'
        : 'Balance: ৳0 (Paid in Full)';

    const recentLines = ledgerRecords
      .slice(0, 5)
      .map(
        (r) =>
          `• ${r.date}: ${language === 'bn' ? 'ভাড়া' : 'Rent'} ৳${r.rent.toLocaleString()} | ${
            language === 'bn' ? 'জমা' : 'Paid'
          } ৳${r.paid.toLocaleString()}`
      )
      .join('\n');

    const msg =
      language === 'bn'
        ? `*নাহিদ কুটির — ভাড়াটিয়া লেজার স্টেটমেন্ট*\nভাড়াটিয়া: ${tenant.name} (রুম ${tenant.room})\nমোট বিল: ৳${totalBilled.toLocaleString()}\nমোট পরিশোধ: ৳${totalPaid.toLocaleString()}\n*${balanceLine}*\n\nসাম্প্রতিক লেনদেন:\n${recentLines || 'কোনো রেকর্ড নেই'}`
        : `*Nahid Kutir — Tenant Ledger Statement*\nTenant: ${tenant.name} (Room ${tenant.room})\nTotal Billed: ৳${totalBilled.toLocaleString()}\nTotal Paid: ৳${totalPaid.toLocaleString()}\n*${balanceLine}*\n\nRecent Transactions:\n${recentLines || 'No records'}`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDownloadLedgerPDF = async () => {
    const el = document.getElementById('tenantLedgerPrintable');
    if (!el) return;
    try {
      await exportElementToPDF(el, {
        fileName: `nahid-kutir-ledger-room-${tenant.room}.pdf`,
        format: 'a4',
        orientation: 'portrait',
        scale: 2,
      });
      showToast?.(
        language === 'bn'
          ? '✓ ভাড়াটিয়ার লেজার PDF ডাউনলোড হয়েছে!'
          : '✓ Tenant ledger PDF downloaded!'
      );
    } catch (e) {
      showToast?.(language === 'bn' ? 'PDF তৈরিতে সমস্যা হয়েছে' : 'Failed to export PDF', 'error');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative my-auto flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0 no-print">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {language === 'bn' ? 'ভাড়াটিয়া প্রোফাইল ও সম্পূর্ণ হিসাব খতিয়ান' : 'Tenant Profile & Complete Payment Ledger'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tenant.name} · {t.roomText} {tenant.room} {tenant.phone ? `· ${tenant.phone}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsAppLedger}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <i className="fi fi-sr-comment text-xs text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadLedgerPDF}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <i className="fi fi-sr-file-pdf text-xs text-rose-600" />
              <span>PDF</span>
            </button>

            {netBalance > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onQuickPay(tenant.id, netBalance, ledgerRecords[0]?.id);
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <i className="fi fi-sr-bolt text-xs" />
                <span>{t.quickPay}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <i className="fi fi-sr-cross text-xs" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div id="tenantLedgerPrintable" className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Profile & Unit Package Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div className="space-y-1.5">
              <div className="text-slate-400 dark:text-slate-500 font-semibold">
                {language === 'bn' ? 'ভাড়াটিয়ার তথ্য' : 'Occupant Information'}
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{tenant.name}</div>
              <div className="text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{t.roomText} {tenant.room}</span>
                {tenant.phone && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{tenant.phone}</span>
                  </>
                )}
                {tenant.nid && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">NID: {tenant.nid}</span>
                  </>
                )}
              </div>
            </div>

            {room && (
              <div className="space-y-1.5 sm:text-right">
                <div className="text-slate-400 dark:text-slate-500 font-semibold">
                  {language === 'bn' ? 'মাসিক নির্ধারিত প্যাকেজ' : 'Monthly Configured Package'}
                </div>
                <div className="text-sm font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(packageTotal)} / {language === 'bn' ? 'মাস' : 'mo'}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono tabular-nums">
                  {language === 'bn' ? 'ভাড়া' : 'Rent'} {formatCurrency(room.rentAmount)} ·{' '}
                  {language === 'bn' ? 'গ্যাস' : 'Gas'} {formatCurrency(room.gasBill)} ·{' '}
                  {language === 'bn' ? 'পানি' : 'Water'} {formatCurrency(room.waterBill)} ·{' '}
                  {language === 'bn' ? 'ময়লা' : 'Waste'} {formatCurrency(room.wasteBill)}
                  {room.meterNo ? ` · ⚡ ${room.meterNo}` : ''}
                </div>
              </div>
            )}
          </div>

          {/* Summary KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'মোট মাসের রেকর্ড' : 'Recorded Months'}
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                {ledgerRecords.length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'সর্বমোট ধার্যকৃত ভাড়া' : 'Total Billed Rent'}
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(totalBilled)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'সর্বমোট পরিশোধিত' : 'Total Paid'}
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatCurrency(totalPaid)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {netBalance < 0
                  ? language === 'bn'
                    ? 'অগ্রিম জমা'
                    : 'Advance Credit'
                  : language === 'bn'
                  ? 'বর্তমান নিট বকেয়া'
                  : 'Net Balance Due'}
              </div>
              <div
                className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                  netBalance > 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : netBalance < 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {formatCurrency(Math.abs(netBalance))}
              </div>
            </div>
          </div>

          {/* Transaction History Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2.5 px-3.5">{t.thRentDate}</th>
                  <th className="py-2.5 px-3.5 text-right">{t.thRentAmount}</th>
                  <th className="py-2.5 px-3.5 text-right">{t.thPaidAmount}</th>
                  <th className="py-2.5 px-3.5 text-right">{t.thDueStatus}</th>
                  <th className="py-2.5 px-3.5">{t.rentNote}</th>
                  <th className="py-2.5 px-3.5 text-right no-print">{t.receiptBtn}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                {ledgerRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      {language === 'bn'
                        ? 'এই ভাড়াটিয়ার কোনো ভাড়া লেনদেনের রেকর্ড পাওয়া যায়নি'
                        : 'No payment records found for this tenant'}
                    </td>
                  </tr>
                ) : (
                  ledgerRecords.map((rec) => {
                    const isPaid = rec.due <= 0;
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3.5 font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {formatShortDate(rec.date, language)}{' '}
                          <span className="text-slate-400">({rec.date.slice(0, 4)})</span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono tabular-nums font-medium">
                          {formatCurrency(rec.rent)}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(rec.paid)}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono tabular-nums font-semibold">
                          {isPaid ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {rec.due < 0
                                ? `${language === 'bn' ? 'অগ্রিম' : 'Adv'} ${formatCurrency(Math.abs(rec.due))}`
                                : language === 'bn'
                                ? 'পরিশোধিত'
                                : 'Paid'}
                            </span>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400">
                              {formatCurrency(rec.due)}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500 dark:text-slate-400 max-w-[160px] truncate">
                          {rec.note || '-'}
                        </td>
                        <td className="py-2.5 px-3.5 text-right no-print">
                          <button
                            onClick={() => onSelectReceipt(rec)}
                            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
                          >
                            {t.receiptBtn}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
