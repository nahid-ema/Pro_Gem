import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RentRecord, Room, Language } from '../types';
import { getTranslation } from '../data/translations';
import { triggerPrint } from '../lib/printHelper';
import { Printer, X, CheckCircle2, MessageSquare, Copy, Check, ShieldCheck, Home, FileText } from 'lucide-react';

interface ReceiptModalProps {
  rentRecord: RentRecord | null;
  rooms?: Room[];
  language: Language;
  onClose: () => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  rentRecord,
  rooms = [],
  language,
  onClose,
  showToast,
}) => {
  const [copied, setCopied] = useState(false);

  // Add print isolation hook
  useEffect(() => {
    if (rentRecord) {
      document.body.classList.add('receipt-modal-active');
    }
    return () => {
      document.body.classList.remove('receipt-modal-active');
    };
  }, [rentRecord]);

  if (!rentRecord) return null;

  const t = getTranslation(language);

  const formatCurrency = (val: number) => `${t.currencySymbol}${val.toLocaleString()}`;

  // Find matching room details for breakdown
  const matchedRoom = rooms.find(
    (r) => String(r.roomNo).trim().toLowerCase() === String(rentRecord.room).trim().toLowerCase()
  );

  const gasBill = matchedRoom ? (matchedRoom.gasBill || 0) : 0;
  const waterBill = matchedRoom ? (matchedRoom.waterBill || 0) : 0;
  const wasteBill = matchedRoom ? (matchedRoom.wasteBill || 0) : 0;
  const utilitySum = gasBill + waterBill + wasteBill;

  let houseRent = matchedRoom ? (matchedRoom.rentAmount || 0) : rentRecord.rent;
  if (matchedRoom && utilitySum > 0 && rentRecord.rent >= utilitySum) {
    houseRent = rentRecord.rent - utilitySum;
  }

  const hasBillBreakdown = matchedRoom && utilitySum > 0;
  const totalBillPackage = rentRecord.rent;

  const handlePrintReceipt = () => {
    triggerPrint(language, rentRecord.id, showToast);
  };

  const handleShareWhatsApp = () => {
    const cleanPhone = rentRecord.phone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    
    let breakdownText = '';
    if (hasBillBreakdown) {
      breakdownText = language === 'bn'
        ? `\n\n*বিলের বিস্তারিত বিবরণ:*\n• বাসা ভাড়া: ৳${houseRent.toLocaleString()}\n• গ্যাস বিল: ৳${gasBill.toLocaleString()}\n• পানির বিল: ৳${waterBill.toLocaleString()}\n• ময়লার বিল: ৳${wasteBill.toLocaleString()}`
        : `\n\n*Bill Breakdown:*\n• House Rent: ৳${houseRent.toLocaleString()}\n• Gas Bill: ৳${gasBill.toLocaleString()}\n• Water Bill: ৳${waterBill.toLocaleString()}\n• Waste Bill: ৳${wasteBill.toLocaleString()}`;
    }

    const message = language === 'bn'
      ? `*নাহিদ কুটির — ভাড়া পরিশোধের রসিদ*\n\nরসিদ নং: #NK-${rentRecord.id.substring(0, 8).toUpperCase()}\nতারিখ: ${rentRecord.date}\nভাড়াটিয়া: ${rentRecord.tenant}\nরুম: ${rentRecord.room}${breakdownText}\n\n------------------------------\nমোট পাওনা: ৳${totalBillPackage.toLocaleString()}\nজমা দেওয়া হয়েছে: ৳${rentRecord.paid.toLocaleString()}\nঅবশিষ্ট বকেয়া: ৳${rentRecord.due.toLocaleString()}\n\nনাহিদ কুটিরে থাকার জন্য ধন্যবাদ!`
      : `*Nahid Kutir — Rent Payment Receipt*\n\nReceipt No: #NK-${rentRecord.id.substring(0, 8).toUpperCase()}\nDate: ${rentRecord.date}\nTenant: ${rentRecord.tenant}\nRoom: ${rentRecord.room}${breakdownText}\n\n------------------------------\nTotal Payable: ৳${totalBillPackage.toLocaleString()}\nPaid Amount: ৳${rentRecord.paid.toLocaleString()}\nRemaining Due: ৳${rentRecord.due.toLocaleString()}\n\nThank you for staying at Nahid Kutir!`;
    
    window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCopyReceipt = () => {
    let breakdownText = '';
    if (hasBillBreakdown) {
      breakdownText = language === 'bn'
        ? ` | ভাড়া: ৳${houseRent.toLocaleString()}, গ্যাস: ৳${gasBill.toLocaleString()}, পানি: ৳${waterBill.toLocaleString()}, ময়লা: ৳${wasteBill.toLocaleString()}`
        : ` | Rent: ৳${houseRent.toLocaleString()}, Gas: ৳${gasBill.toLocaleString()}, Water: ৳${waterBill.toLocaleString()}, Waste: ৳${wasteBill.toLocaleString()}`;
    }

    const summary = language === 'bn'
      ? `নাহিদ কুটির রসিদ (#NK-${rentRecord.id.substring(0, 8).toUpperCase()})\nতারিখ: ${rentRecord.date}\nভাড়াটিয়া: ${rentRecord.tenant} (রুম ${rentRecord.room})${breakdownText}\nজমা: ৳${rentRecord.paid.toLocaleString()} | বকেয়া: ৳${rentRecord.due.toLocaleString()}`
      : `Nahid Kutir Receipt (#NK-${rentRecord.id.substring(0, 8).toUpperCase()})\nDate: ${rentRecord.date}\nTenant: ${rentRecord.tenant} (Room ${rentRecord.room})${breakdownText}\nPaid: ৳${rentRecord.paid.toLocaleString()} | Due: ৳${rentRecord.due.toLocaleString()}`;
    
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFullyPaid = rentRecord.due <= 0;
  const isPartiallyPaid = rentRecord.paid > 0 && rentRecord.due > 0;

  return createPortal(
    <div id="receiptModalOverlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div id="receiptModalCard" className="bg-white/80 backdrop-blur-xl dark:bg-[#1A1A1A]/80 border border-[#E8E6E1] dark:border-[#333333] rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative overflow-hidden my-auto">
        
        {/* Modal Controls Bar (Screen Only - Hidden in Print) */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 no-print gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F4C542]" />
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t.receiptTitle}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Print Button */}
            <button
              onClick={handlePrintReceipt}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F2F0EB] dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
              title={language === 'bn' ? 'রসিদ প্রিন্ট করুন' : 'Print Receipt'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.printBtn}</span>
            </button>

            {/* WhatsApp Text Message Button */}
            <button
              onClick={handleShareWhatsApp}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#F2F0EB] dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title={language === 'bn' ? 'টেক্সট মেসেজ পাঠান' : 'Text WhatsApp'}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopyReceipt}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#F2F0EB] dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title={language === 'bn' ? 'কপি করুন' : 'Copy Summary'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#F2F0EB] dark:bg-[#2A2A2A] text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT CONTAINER */}
        <div
          className="py-4 sm:py-5 px-3 sm:px-4 space-y-4 text-slate-900 bg-white rounded-2xl border border-slate-200/80 shadow-2xs"
          id="receiptContent"
          style={{ colorScheme: 'light' }}
        >
          
          {/* 1. Header & Brand Title */}
          <div className="text-center border-b pb-3 border-slate-200 relative">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[#F4C542]/10 text-[#F4C542] border border-[#F4C542]/30 mb-1.5 shadow-2xs">
              <Home className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {t.receiptHeader}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t.receiptAddress}
            </p>
            <div className="mt-1.5 inline-block px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 uppercase">
              {language === 'bn' ? 'অফিসিয়াল ভাড়া জমার রসিদ' : 'Official Rent Payment Receipt'}
            </div>
          </div>

          {/* 2. Key Receipt Identifiers & Status Stamp */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                {t.receiptDate}
              </span>
              <span className="font-bold font-mono text-sm text-slate-900">{rentRecord.date}</span>
            </div>
            
            <div className="text-right">
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                {t.receiptNo}
              </span>
              <span className="font-mono font-bold text-sm text-[#F4C542]">
                #NK-{rentRecord.id.substring(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* 3. Tenant & Room Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/60 p-3 rounded-xl border border-slate-200/60">
            <div>
              <span className="text-slate-400 text-[11px] block font-semibold">{t.receivedFrom}</span>
              <span className="font-black text-sm text-slate-900 block mt-0.5">{rentRecord.tenant}</span>
              {rentRecord.phone && (
                <span className="text-[11px] font-mono text-slate-500 block">{rentRecord.phone}</span>
              )}
            </div>

            <div className="text-right">
              <span className="text-slate-400 text-[11px] block font-semibold">{t.roomAssigned}</span>
              <span className="font-black text-sm text-[#F4C542] block mt-0.5">{t.roomText} {rentRecord.room}</span>
            </div>
          </div>

          {/* 4. Itemized Payment Breakdown Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs bg-white">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#F4C542]" />
                {language === 'bn' ? 'বিলের বিস্তারিত বিবরণ' : 'Itemized Bill Breakdown'}
              </span>
              <span>{language === 'bn' ? 'টাকা (TK)' : 'Amount (TK)'}</span>
            </div>

            <table className="w-full text-xs text-left border-collapse bg-white">
              <tbody className="divide-y divide-slate-100">
                {/* 1. House Rent Line */}
                <tr>
                  <td className="p-2.5 font-medium text-slate-700">
                    {language === 'bn' ? '১. মূল ঘর ভাড়া (House Rent)' : '1. House Rent'}
                  </td>
                  <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                    {formatCurrency(houseRent)}
                  </td>
                </tr>

                {/* 2. Gas Bill Line */}
                {gasBill > 0 && (
                  <tr>
                    <td className="p-2.5 font-medium text-slate-700">
                      {language === 'bn' ? '২. গ্যাস বিল (Gas Bill)' : '2. Gas Bill'}
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(gasBill)}
                    </td>
                  </tr>
                )}

                {/* 3. Water Bill Line */}
                {waterBill > 0 && (
                  <tr>
                    <td className="p-2.5 font-medium text-slate-700">
                      {language === 'bn' ? '৩. পানির বিল (Water Bill)' : '3. Water Bill'}
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(waterBill)}
                    </td>
                  </tr>
                )}

                {/* 4. Waste Bill Line */}
                {wasteBill > 0 && (
                  <tr>
                    <td className="p-2.5 font-medium text-slate-700">
                      {language === 'bn' ? '৪. ময়লার বিল (Waste Bill)' : '4. Waste Bill'}
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(wasteBill)}
                    </td>
                  </tr>
                )}

                {/* Total Bill Package Line */}
                <tr className="bg-slate-100/80 font-bold border-t border-slate-200">
                  <td className="p-2.5 text-slate-900 font-bold">
                    {language === 'bn' ? 'সর্বমোট পাওনা (Total Payable Rent)' : 'Total Payable Rent'}
                  </td>
                  <td className="p-2.5 text-right font-black text-slate-900 text-sm font-mono">
                    {formatCurrency(totalBillPackage)}
                  </td>
                </tr>

                {/* Paid Amount Line */}
                <tr className="bg-emerald-50 text-emerald-900 border-t border-emerald-100">
                  <td className="p-2.5 font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{t.paidAmountText}</span>
                  </td>
                  <td className="p-2.5 text-right font-black text-sm text-emerald-600 font-mono">
                    {formatCurrency(rentRecord.paid)}
                  </td>
                </tr>

                {/* Remaining Due Line */}
                <tr className={rentRecord.due > 0 ? "bg-rose-50 text-rose-900 border-t border-rose-100" : "bg-white"}>
                  <td className="p-2.5 font-bold text-slate-700">
                    {t.remainingDueText}
                  </td>
                  <td className={`p-2.5 text-right font-black text-sm font-mono ${rentRecord.due > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                    {formatCurrency(rentRecord.due)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. Payment Remarks / Status Stamp Box */}
          <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">
                {language === 'bn' ? 'পরিশোধের অবস্থা' : 'Payment Status'}
              </div>
              <div className="mt-0.5 font-extrabold flex items-center gap-1.5">
                {isFullyPaid && (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'সম্পূর্ণ পরিশোধিত (PAID)' : 'PAID IN FULL'}
                  </span>
                )}
                {isPartiallyPaid && (
                  <span className="text-amber-600">
                    {language === 'bn' ? `আংশিক জমা (বকেয়া ৳${rentRecord.due.toLocaleString()})` : `PARTIAL PAYMENT (Due ৳${rentRecord.due.toLocaleString()})`}
                  </span>
                )}
                {!isFullyPaid && !isPartiallyPaid && (
                  <span className="text-rose-600">
                    {language === 'bn' ? 'পরিশোধ করা হয়নি (UNPAID)' : 'UNPAID'}
                  </span>
                )}
              </div>
            </div>

            {rentRecord.note && (
              <div className="text-right max-w-[180px]">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  {language === 'bn' ? 'নোট / মন্তব্য' : 'Note'}
                </div>
                <div className="text-slate-600 font-medium italic truncate">
                  "{rentRecord.note}"
                </div>
              </div>
            )}
          </div>

          {/* 6. Thank You Footer Message */}
          <p className="text-center text-xs text-slate-500 font-semibold italic pt-0.5">
            "{t.thankYouMsg}"
          </p>

          {/* 7. Official Signatures Section */}
          <div className="pt-4 sm:pt-6 flex justify-between items-end text-[11px] font-bold text-slate-600">
            <div className="text-center border-t-2 border-slate-300 pt-1.5 w-32">
              <ShieldCheck className="w-4 h-4 mx-auto text-slate-400 mb-0.5 no-print" />
              {t.signatureLandlord}
            </div>
            
            {/* System Stamp Motif */}
            <div className="text-center opacity-80 pointer-events-none">
              <div className="w-11 h-11 rounded-full border-2 border-dashed border-[#F4C542] flex items-center justify-center mx-auto text-[8px] font-black text-[#F4C542] uppercase rotate-[-12deg] p-1">
                {language === 'bn' ? 'যাচাইকৃত' : 'VERIFIED'}
              </div>
            </div>

            <div className="text-center border-t-2 border-slate-300 pt-1.5 w-32">
              {t.signatureTenant}
            </div>
          </div>

          {/* Computer Generated Notice */}
          <div className="text-[9px] text-center text-slate-400 font-mono pt-1.5 border-t border-slate-100">
            {language === 'bn' ? 'কম্পিউটার থেকে স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত রসিদ। কোনো স্বাক্ষরের প্রয়োজন নেই।' : 'Computer generated payment record. Valid without physical seal.'}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};



