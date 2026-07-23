import React from 'react';
import { RentRecord, Language } from '../types';
import { getTranslation } from '../data/translations';
import { Printer, X, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  rentRecord: RentRecord | null;
  language: Language;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  rentRecord,
  language,
  onClose,
}) => {
  if (!rentRecord) return null;

  const t = getTranslation(language);

  const formatCurrency = (val: number) => `${t.currencySymbol}${val.toLocaleString()}`;

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div id="receiptModalOverlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div id="receiptModalCard" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl relative overflow-hidden">
        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 no-print">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t.receiptTitle}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintReceipt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printBtn}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RECEIPT BODY (Printable) */}
        <div className="py-6 space-y-6 text-slate-900 dark:text-slate-100" id="receiptContent">
          {/* Header */}
          <div className="text-center border-b pb-4 border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xl mx-auto mb-2 shadow-sm">
              🏠
            </div>
            <h2 className="text-lg font-bold tracking-tight">{t.receiptHeader}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.receiptAddress}</p>
          </div>

          {/* Key Identifiers */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider text-[10px]">
                {t.receiptDate}
              </span>
              <span className="font-bold font-mono text-sm">{rentRecord.date}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider text-[10px]">
                {t.receiptNo}
              </span>
              <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                #NK-{rentRecord.id.substring(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">{t.receivedFrom}:</span>
              <span className="font-bold text-sm">{rentRecord.tenant}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">{t.roomAssigned}:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{t.roomText} {rentRecord.room}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">{t.totalRentDue}:</span>
              <span className="font-bold">{formatCurrency(rentRecord.rent)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-emerald-600 dark:text-emerald-400">
              <span className="font-bold">{t.paidAmountText}:</span>
              <span className="font-bold text-base">{formatCurrency(rentRecord.paid)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-rose-600">
              <span className="font-bold">{t.remainingDueText}:</span>
              <span className="font-bold text-base">{formatCurrency(rentRecord.due)}</span>
            </div>
          </div>

          {/* Note / Status */}
          <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span>{rentRecord.due <= 0 ? t.paidStatus : `${t.dueStatus} ${formatCurrency(rentRecord.due)}`}</span>
            </div>
            {rentRecord.note && (
              <span className="text-slate-500 italic">"{rentRecord.note}"</span>
            )}
          </div>

          <p className="text-center text-[11px] text-slate-400 font-medium italic">
            "{t.thankYouMsg}"
          </p>

          {/* Signatures */}
          <div className="pt-8 flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <div className="text-center border-t border-slate-300 dark:border-slate-700 pt-1 w-32">
              {t.signatureLandlord}
            </div>
            <div className="text-center border-t border-slate-300 dark:border-slate-700 pt-1 w-32">
              {t.signatureTenant}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
