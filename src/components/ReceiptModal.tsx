import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RentRecord, Room, Language } from '../types';
import { getTranslation } from '../data/translations';
import { Printer, X, CheckCircle2, MessageSquare, Copy, Check, ShieldCheck, Home, Receipt, FileText, Download, Loader2, Share2 } from 'lucide-react';
import { generateElementPDF, shareOrDownloadPDF } from '../lib/pdfGenerator';

interface ReceiptModalProps {
  rentRecord: RentRecord | null;
  rooms?: Room[];
  language: Language;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  rentRecord,
  rooms = [],
  language,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatusMsg, setPdfStatusMsg] = useState<string | null>(null);

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
    window.print();
  };

  const handleSharePdfWhatsApp = async () => {
    if (!rentRecord || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfStatusMsg(null);
    try {
      const receiptNo = rentRecord.id.substring(0, 8).toUpperCase();
      const filename = `Nahid_Kutir_Receipt_NK-${receiptNo}.pdf`;
      const title = language === 'bn' ? 'নাহিদ কুটির — ভাড়া পরিশোধের রসিদ' : 'Nahid Kutir Rent Receipt';
      const text = language === 'bn'
        ? `*নাহিদ কুটির — ভাড়া পরিশোধের পিডিএফ রসিদ*\nরসিদ নং: #NK-${receiptNo}\nতারিখ: ${rentRecord.date}\nভাড়াটিয়া: ${rentRecord.tenant} (রুম: ${rentRecord.room})\nজমা: ৳${rentRecord.paid.toLocaleString()} | বকেয়া: ৳${rentRecord.due.toLocaleString()}`
        : `*Nahid Kutir — Rent Payment PDF Receipt*\nReceipt No: #NK-${receiptNo}\nDate: ${rentRecord.date}\nTenant: ${rentRecord.tenant} (Room: ${rentRecord.room})\nPaid: ৳${rentRecord.paid.toLocaleString()} | Due: ৳${rentRecord.due.toLocaleString()}`;

      const res = await shareOrDownloadPDF({
        elementId: 'receiptPdfDocument',
        filename,
        phone: rentRecord.phone,
        title,
        text,
      });

      if (res === 'downloaded') {
        setPdfStatusMsg(
          language === 'bn'
            ? 'পিডিএফ ফাইল ডাউনলোড হয়েছে এবং হোয়াটসঅ্যাপ ওপেন করা হয়েছে। চ্যাটে পেপারক্লিপ (📎) চাপ দিয়ে পিডিএফ ফাইলটি সংযুক্ত করুন।'
            : 'PDF receipt downloaded and WhatsApp opened! Please attach the downloaded PDF file in WhatsApp chat.'
        );
      } else {
        setPdfStatusMsg(
          language === 'bn' ? 'পিডিএফ রসিদ সফলভাবে শেয়ার করা হয়েছে!' : 'PDF receipt shared successfully!'
        );
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(language === 'bn' ? 'পিডিএফ তৈরি করতে সমস্যা হয়েছে।' : 'Failed to generate PDF receipt.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!rentRecord || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const receiptNo = rentRecord.id.substring(0, 8).toUpperCase();
      const filename = `Nahid_Kutir_Receipt_NK-${receiptNo}.pdf`;
      const { downloadUrl } = await generateElementPDF({
        elementId: 'receiptPdfDocument',
        filename,
      });

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(language === 'bn' ? 'পিডিএফ ডাউনলোড করতে সমস্যা হয়েছে।' : 'Failed to download PDF receipt.');
    } finally {
      setIsGeneratingPdf(false);
    }
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
      <div id="receiptModalCard" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative overflow-hidden my-auto">
        
        {/* Modal Controls Bar (Screen Only - Hidden in Print) */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 no-print gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#e0533c]" />
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t.receiptTitle}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* WhatsApp PDF Button (Primary) */}
            <button
              onClick={handleSharePdfWhatsApp}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              title={language === 'bn' ? 'হোয়াটসঅ্যাপে পিডিএফ রসিদ পাঠান' : 'Share PDF on WhatsApp'}
            >
              {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{language === 'bn' ? 'পিডিএফ হোয়াটসঅ্যাপ' : 'PDF WhatsApp'}</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              title={language === 'bn' ? 'পিডিএফ ডাউনলোড করুন' : 'Download PDF'}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrintReceipt}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
              title={language === 'bn' ? 'রসিদ প্রিন্ট করুন' : 'Print Receipt'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.printBtn}</span>
            </button>

            {/* WhatsApp Text Message Button */}
            <button
              onClick={handleShareWhatsApp}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title={language === 'bn' ? 'টেক্সট মেসেজ পাঠান' : 'Text WhatsApp'}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopyReceipt}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title={language === 'bn' ? 'কপি করুন' : 'Copy Summary'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
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
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[#e0533c]/10 text-[#e0533c] border border-[#e0533c]/30 mb-1.5 shadow-2xs">
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
              <span className="font-mono font-bold text-sm text-[#e0533c]">
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
              <span className="font-black text-sm text-[#e0533c] block mt-0.5">{t.roomText} {rentRecord.room}</span>
            </div>
          </div>

          {/* 4. Itemized Payment Breakdown Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs bg-white">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-[#e0533c]" />
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
              <div className="w-11 h-11 rounded-full border-2 border-dashed border-[#e0533c] flex items-center justify-center mx-auto text-[8px] font-black text-[#e0533c] uppercase rotate-[-12deg] p-1">
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

        {/* PDF Status Alert Banner */}
        {pdfStatusMsg && (
          <div className="no-print mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{pdfStatusMsg}</p>
            </div>
            <button
              onClick={() => setPdfStatusMsg(null)}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* STANDALONE OFF-SCREEN PDF DOCUMENT TEMPLATE (NOT TOUCHED BY UI MODAL STYLES) */}
      <div
        id="receiptPdfDocument"
        style={{
          position: 'fixed',
          top: '0',
          left: '-9999px',
          width: '794px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: '32px 16px',
          boxSizing: 'border-box',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
          zIndex: -9999,
          pointerEvents: 'none',
        }}
      >
        <div>
          {/* Document Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #cbd5e1', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'inline-block', width: '44px', height: '44px', lineHeight: '42px', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', textAlign: 'center', marginBottom: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e0533c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="#e0533c" strokeWidth="2.5" />
              <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="#e0533c" strokeWidth="2.5" />
            </svg>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '0 0 4px 0', lineHeight: '1.3' }}>
            {language === 'bn' ? 'নাহিদ কুটির' : 'Nahid Kutir'}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 10px 0', fontWeight: '500', lineHeight: '1.4' }}>
            {language === 'bn' ? 'আবাসিক এলাকা, টঙ্গী, ঢাকা, বাংলাদেশ' : 'Residential Area, Tongi, Dhaka, Bangladesh'}
          </p>
          <span style={{ display: 'inline-block', padding: '5px 20px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '20px', fontSize: '11px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {language === 'bn' ? 'অফিসিয়াল ভাড়া জমার রসিদ' : 'OFFICIAL RENT PAYMENT RECEIPT'}
          </span>
        </div>

        {/* Receipt Identifiers */}
        <table style={{ width: '100%', marginBottom: '18px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', borderCollapse: 'separate' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', verticalAlign: 'top' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', lineHeight: '1.3' }}>{t.receiptDate}</span>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', fontFamily: 'monospace', display: 'block', marginTop: '3px' }}>{rentRecord.date}</span>
              </td>
              <td style={{ width: '50%', textAlign: 'right', verticalAlign: 'top' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', lineHeight: '1.3' }}>{t.receiptNo}</span>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#e0533c', fontFamily: 'monospace', display: 'block', marginTop: '3px' }}>#NK-{rentRecord.id.substring(0, 8).toUpperCase()}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Tenant & Room Info */}
        <table style={{ width: '100%', marginBottom: '22px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', borderCollapse: 'separate' }}>
          <tbody>
            <tr>
              <td style={{ width: '60%', verticalAlign: 'top' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block', lineHeight: '1.3' }}>{t.receivedFrom}</span>
                <span style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', display: 'block', marginTop: '3px', lineHeight: '1.3' }}>{rentRecord.tenant}</span>
                {rentRecord.phone && <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace', display: 'block', marginTop: '3px' }}>{rentRecord.phone}</span>}
              </td>
              <td style={{ width: '40%', textAlign: 'right', verticalAlign: 'top' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block', lineHeight: '1.3' }}>{t.roomAssigned}</span>
                <span style={{ fontSize: '16px', fontWeight: '900', color: '#e0533c', display: 'block', marginTop: '3px', lineHeight: '1.3' }}>{t.roomText} {rentRecord.room}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Itemized Table */}
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginBottom: '22px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#334155', fontWeight: '800', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>{language === 'bn' ? 'বিলের বিবরণ' : 'Bill Description'}</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>{language === 'bn' ? 'টাকা (TK)' : 'Amount (TK)'}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '11px 16px', color: '#334155', fontWeight: '600' }}>{language === 'bn' ? '১. মূল ঘর ভাড়া (House Rent)' : '1. House Rent'}</td>
                <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: '800', color: '#0f172a', fontFamily: 'monospace' }}>{formatCurrency(houseRent)}</td>
              </tr>
              {gasBill > 0 && (
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '11px 16px', color: '#334155', fontWeight: '600' }}>{language === 'bn' ? '২. গ্যাস বিল (Gas Bill)' : '2. Gas Bill'}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: '800', color: '#0f172a', fontFamily: 'monospace' }}>{formatCurrency(gasBill)}</td>
                </tr>
              )}
              {waterBill > 0 && (
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '11px 16px', color: '#334155', fontWeight: '600' }}>{language === 'bn' ? '৩. পানির বিল (Water Bill)' : '3. Water Bill'}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: '800', color: '#0f172a', fontFamily: 'monospace' }}>{formatCurrency(waterBill)}</td>
                </tr>
              )}
              {wasteBill > 0 && (
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '11px 16px', color: '#334155', fontWeight: '600' }}>{language === 'bn' ? '৪. ময়লার বিল (Waste Bill)' : '4. Waste Bill'}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: '800', color: '#0f172a', fontFamily: 'monospace' }}>{formatCurrency(wasteBill)}</td>
                </tr>
              )}
              <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #cbd5e1', fontWeight: '800' }}>
                <td style={{ padding: '13px 16px', color: '#0f172a' }}>{language === 'bn' ? 'সর্বমোট পাওনা (Total Payable)' : 'Total Payable'}</td>
                <td style={{ padding: '13px 16px', textAlign: 'right', fontSize: '15px', color: '#0f172a', fontFamily: 'monospace' }}>{formatCurrency(totalBillPackage)}</td>
              </tr>
              <tr style={{ backgroundColor: '#f0fdf4', borderTop: '1px solid #bbf7d0', color: '#166534', fontWeight: '800' }}>
                <td style={{ padding: '13px 16px' }}>✔ {t.paidAmountText}</td>
                <td style={{ padding: '13px 16px', textAlign: 'right', fontSize: '15px', color: '#15803d', fontFamily: 'monospace' }}>{formatCurrency(rentRecord.paid)}</td>
              </tr>
              <tr style={{ backgroundColor: rentRecord.due > 0 ? '#fff1f2' : '#ffffff', borderTop: '1px solid #e2e8f0', color: rentRecord.due > 0 ? '#9f1239' : '#64748b', fontWeight: '800' }}>
                <td style={{ padding: '13px 16px' }}>{t.remainingDueText}</td>
                <td style={{ padding: '13px 16px', textAlign: 'right', fontSize: '15px', fontFamily: 'monospace' }}>{formatCurrency(rentRecord.due)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Status Box */}
        <table style={{ width: '100%', marginBottom: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', borderCollapse: 'separate' }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', lineHeight: '1.3' }}>{language === 'bn' ? 'পরিশোধের অবস্থা' : 'Payment Status'}</span>
                <span style={{ fontSize: '15px', fontWeight: '900', marginTop: '4px', display: 'block', color: isFullyPaid ? '#15803d' : isPartiallyPaid ? '#d97706' : '#dc2626', lineHeight: '1.3' }}>
                  {isFullyPaid ? (language === 'bn' ? '✔ সম্পূর্ণ পরিশোধিত (PAID IN FULL)' : '✔ PAID IN FULL') : isPartiallyPaid ? (language === 'bn' ? `আংশিক জমা (বকেয়া ৳${rentRecord.due.toLocaleString()})` : `PARTIAL PAYMENT (Due ৳${rentRecord.due.toLocaleString()})`) : (language === 'bn' ? 'পরিশোধ করা হয়নি (UNPAID)' : 'UNPAID')}
                </span>
              </td>
              {rentRecord.note && (
                <td style={{ textAlign: 'right', verticalAlign: 'top', maxWidth: '220px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', lineHeight: '1.3' }}>{language === 'bn' ? 'নোট / মন্তব্য' : 'Note'}</span>
                  <span style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic', display: 'block', marginTop: '3px', lineHeight: '1.3' }}>"{rentRecord.note}"</span>
                </td>
              )}
            </tr>
          </tbody>
        </table>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '10px' }}>
        {/* Thank you */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: '600', fontStyle: 'italic', margin: '0 0 28px 0', lineHeight: '1.4' }}>
          "{t.thankYouMsg}"
        </p>

        {/* Signatures */}
        <table style={{ width: '100%', marginTop: '32px', marginBottom: '22px' }}>
          <tbody>
            <tr>
              <td style={{ width: '33%', textAlign: 'center', verticalAlign: 'bottom' }}>
                <div style={{ borderTop: '2px solid #cbd5e1', paddingTop: '8px', fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                  {t.signatureLandlord}
                </div>
              </td>
              <td style={{ width: '34%', textAlign: 'center', verticalAlign: 'middle' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: '2px dashed #e0533c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '900', color: '#e0533c', textTransform: 'uppercase', transform: 'rotate(-12deg)', padding: '2px' }}>
                  {language === 'bn' ? 'যাচাইকৃত' : 'VERIFIED'}
                </div>
              </td>
              <td style={{ width: '33%', textAlign: 'center', verticalAlign: 'bottom' }}>
                <div style={{ borderTop: '2px solid #cbd5e1', paddingTop: '8px', fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                  {t.signatureTenant}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Disclaimer */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', textAlign: 'center', fontSize: '10px', color: '#94a3b8', fontFamily: 'system-ui, sans-serif' }}>
          {language === 'bn' ? 'কম্পিউটার থেকে স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত রসিদ। কোনো স্বাক্ষরের প্রয়োজন নেই।' : 'Computer generated payment record. Valid without physical seal.'}
        </div>
        </div>
      </div>
    </div>,
    document.body
  );
};



