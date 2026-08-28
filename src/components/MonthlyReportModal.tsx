import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Room, Tenant, RentRecord, Expense, ShopDue, Language } from '../types';
import { getTranslation } from '../data/translations';
import { Logo } from './Logo';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  tenants: Tenant[];
  rents: RentRecord[];
  expenses: Expense[];
  dokanDues: ShopDue[];
  language: Language;
  selectedYear: string;
  selectedMonth: string;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  rooms,
  tenants,
  rents,
  expenses,
  dokanDues,
  language,
  selectedYear,
  selectedMonth,
  showToast,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const t = getTranslation(language);

  const evalYear = selectedYear !== 'all' ? selectedYear : String(new Date().getFullYear());
  const evalMonth = selectedMonth !== 'all' ? selectedMonth : String(new Date().getMonth() + 1);
  const monthName = t.months ? t.months[parseInt(evalMonth, 10) - 1] : `Month ${evalMonth}`;

  // Filter records for this period
  const periodRents = useMemo(() => {
    return rents.filter((r) => {
      if (!r.date) return false;
      const [y, m] = r.date.split('-');
      const yMatch = selectedYear === 'all' || y === selectedYear;
      const mMatch = selectedMonth === 'all' || parseInt(m || '0', 10) === parseInt(selectedMonth, 10);
      return yMatch && mMatch;
    });
  }, [rents, selectedYear, selectedMonth]);

  const periodExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (!e.date) return false;
      const [y, m] = e.date.split('-');
      const yMatch = selectedYear === 'all' || y === selectedYear;
      const mMatch = selectedMonth === 'all' || parseInt(m || '0', 10) === parseInt(selectedMonth, 10);
      return yMatch && mMatch;
    });
  }, [expenses, selectedYear, selectedMonth]);

  const periodShopDues = useMemo(() => {
    return dokanDues.filter((d) => {
      if (!d.date) return false;
      const [y, m] = d.date.split('-');
      const yMatch = selectedYear === 'all' || y === selectedYear;
      const mMatch = selectedMonth === 'all' || parseInt(m || '0', 10) === parseInt(selectedMonth, 10);
      return yMatch && mMatch;
    });
  }, [dokanDues, selectedYear, selectedMonth]);

  // Aggregate financials
  const totalGrossRent = useMemo(() => {
    return rooms.reduce((acc, r) => {
      return acc + (r.rentAmount || 0) + (r.gasBill || 0) + (r.waterBill || 0) + (r.wasteBill || 0);
    }, 0);
  }, [rooms]);

  const totalCollectedRent = periodRents.reduce((acc, r) => acc + (r.paid || 0), 0);
  const totalRentDue = periodRents.reduce((acc, r) => acc + (r.due > 0 ? r.due : 0), 0);
  const totalExpensesSum = periodExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalShopDueSum = periodShopDues.reduce((acc, s) => acc + (s.amount || 0), 0);
  const netCashFlow = totalCollectedRent - totalExpensesSum;

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const el = document.getElementById('reportPrintContent');
    if (!el) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const imgWidth = 195;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 7.5, 8, imgWidth, imgHeight);
      pdf.save(`nahid-kutir-financial-report-${evalYear}-${evalMonth}.pdf`);
      showToast?.(
        language === 'bn' ? '✓ মাসিক রিপোর্ট PDF সফলভাবে তৈরি হয়েছে!' : '✓ Monthly report PDF downloaded successfully!'
      );
    } catch (err) {
      console.error('PDF export error:', err);
      showToast?.(language === 'bn' ? 'PDF তৈরি ব্যর্থ হয়েছে' : 'Failed to generate PDF', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += `Nahid Kutir Monthly Statement - ${monthName} ${evalYear}\n\n`;

      // Financial Summary
      csvContent += 'FINANCIAL SUMMARY\n';
      csvContent += `Gross Expected Rent,${totalGrossRent}\n`;
      csvContent += `Total Collected Rent,${totalCollectedRent}\n`;
      csvContent += `Outstanding Rent Due,${totalRentDue}\n`;
      csvContent += `Operating Expenses,${totalExpensesSum}\n`;
      csvContent += `Net Cashflow,${netCashFlow}\n`;
      csvContent += `Shop Credit Balance,${totalShopDueSum}\n\n`;

      // Rent Collection
      csvContent += 'RENT COLLECTION DETAILS\n';
      csvContent += 'Date,Room,Tenant,Phone,Expected Rent,Paid,Due,Note\n';
      periodRents.forEach((r) => {
        csvContent += `"${r.date}","${r.room}","${r.tenant}","${r.phone || ''}",${r.rent},${r.paid},${r.due},"${r.note || ''}"\n`;
      });
      csvContent += '\n';

      // Expenses
      csvContent += 'OPERATING EXPENSES\n';
      csvContent += 'Date,Category,Description,Amount\n';
      periodExpenses.forEach((e) => {
        csvContent += `"${e.date}","${e.category || ''}","${e.desc}",${e.amount}\n`;
      });
      csvContent += '\n';

      // Shop Dues
      csvContent += 'SHOP DUES / HARDWARE CREDIT\n';
      csvContent += 'Date,Shop / Description,Amount\n';
      periodShopDues.forEach((s) => {
        csvContent += `"${s.date}","${s.shopName || s.desc}",${s.amount}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `nahid-kutir-statement-${evalYear}-${evalMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast?.(
        language === 'bn' ? '✓ এক্সেল/CSV রিপোর্ট ডাউনলোড সম্পন্ন হয়েছে!' : '✓ Excel/CSV report downloaded!'
      );
    } catch (err) {
      console.error('CSV export error:', err);
      showToast?.(language === 'bn' ? 'CSV ফাইল তৈরিতে ত্রুটি' : 'Failed to export CSV', 'error');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-[#141414] border border-[#D6D0C4] dark:border-[#262626] rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl relative my-auto flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E4DC] dark:border-[#262626] shrink-0 no-print">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {t.monthlyReportTitle || 'মাসিক আর্থিক বিবরণী ও অডিট রিপোর্ট'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {monthName} {evalYear} — {t.monthlyReportSubtitle || 'আয়, ব্যয়, ভাড়া আদায় ও নেট ক্যাশফ্লোর অফিসিয়াল প্রিন্ট শিট'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* CSV Export */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-emerald-200 dark:border-emerald-800"
            >
              <i className="fi fi-sr-file-excel text-xs text-emerald-600" />
              <span>{t.repExportCSV || 'CSV / এক্সেল'}</span>
            </button>

            {/* PDF Export */}
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-200 dark:border-rose-800 disabled:opacity-50"
            >
              <i className="fi fi-sr-file-pdf text-xs text-rose-600" />
              <span>{t.repDownloadPDF || 'PDF ডাউনলোড'}</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fi fi-sr-print text-xs" />
              <span>{t.repPrintReport || 'প্রিন্ট'}</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#F2EFE8] dark:bg-[#202020] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <i className="fi fi-sr-cross text-sm" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Report Canvas */}
        <div className="flex-1 overflow-y-auto py-4">
          <div
            id="reportPrintContent"
            className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 max-w-4xl mx-auto"
            style={{ colorScheme: 'light' }}
          >
            {/* 1. Official Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Logo className="w-12 h-12" />
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900">
                    {t.appName} 🏠
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'bn' ? 'অফিসিয়াল মাসিক আর্থিক বিবরণী ও নিরীক্ষা প্রতিবেদন' : 'Official Financial Statement & Audit Sheet'}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-600">
                <p className="font-bold text-slate-900 text-sm">{monthName} {evalYear}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'bn' ? 'প্রস্তুতের তারিখ:' : 'Generated:'} {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* 2. Executive Financial KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E4DC]">
                <span className="text-[11px] text-slate-500 font-bold uppercase block">
                  {t.repGrossExpected || 'প্রত্যাশিত ভাড়া'}
                </span>
                <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
                  {t.currencySymbol}{totalGrossRent.toLocaleString()}
                </span>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <span className="text-[11px] text-emerald-800 font-bold uppercase block">
                  {t.repCollected || 'সংগৃহীত রাজস্ব'}
                </span>
                <span className="text-base font-black text-emerald-700 font-mono mt-0.5 block">
                  {t.currencySymbol}{totalCollectedRent.toLocaleString()}
                </span>
              </div>

              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                <span className="text-[11px] text-rose-800 font-bold uppercase block">
                  {t.repOutstanding || 'বকেয়া পাওনা'}
                </span>
                <span className="text-base font-black text-rose-700 font-mono mt-0.5 block">
                  {t.currencySymbol}{totalRentDue.toLocaleString()}
                </span>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <span className="text-[11px] text-amber-800 font-bold uppercase block">
                  {t.repTotalExpenses || 'পরিচালনা ব্যয়'}
                </span>
                <span className="text-base font-black text-amber-700 font-mono mt-0.5 block">
                  {t.currencySymbol}{totalExpensesSum.toLocaleString()}
                </span>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <span className="text-[11px] text-blue-800 font-bold uppercase block">
                  {t.repNetProfit || 'নেট ক্যাশফ্লো (লাভ)'}
                </span>
                <span className={`text-base font-black font-mono mt-0.5 block ${netCashFlow >= 0 ? 'text-blue-700' : 'text-rose-600'}`}>
                  {t.currencySymbol}{netCashFlow.toLocaleString()}
                </span>
              </div>

              <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                <span className="text-[11px] text-purple-800 font-bold uppercase block">
                  {t.repShopCredit || 'দোকান বাকি'}
                </span>
                <span className="text-base font-black text-purple-700 font-mono mt-0.5 block">
                  {t.currencySymbol}{totalShopDueSum.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 3. Section A: Rent Collection Register */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b pb-1.5 border-slate-200">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  ১. ভাড়া আদায়ের বিস্তারিত রেজিস্টার ({periodRents.length} এন্ট্রি)
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  {language === 'bn' ? 'মোট আদায়:' : 'Total:'} {t.currencySymbol}{totalCollectedRent.toLocaleString()}
                </span>
              </div>

              <table className="w-full text-left text-[11px] border border-slate-200">
                <thead className="bg-[#FAF8F5] text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">{t.thRentDate}</th>
                    <th className="p-2">{t.thRoomNo}</th>
                    <th className="p-2">{t.thName}</th>
                    <th className="p-2 text-right">{t.thRentAmount}</th>
                    <th className="p-2 text-right">{t.thPaidAmount}</th>
                    <th className="p-2 text-right">{language === 'bn' ? 'অবশিষ্ট' : 'Due/Adv'}</th>
                    <th className="p-2">{t.rentNote}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {periodRents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-3 text-center text-slate-400 italic">
                        {language === 'bn' ? 'এই মাসে কোনো ভাড়া আদায়ের রেকর্ড নেই' : 'No rent records in this period'}
                      </td>
                    </tr>
                  ) : (
                    periodRents.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-2 font-mono">{r.date}</td>
                        <td className="p-2 font-bold font-mono text-blue-600">{r.room}</td>
                        <td className="p-2 font-semibold">{r.tenant}</td>
                        <td className="p-2 text-right font-mono">{t.currencySymbol}{r.rent.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-600">{t.currencySymbol}{r.paid.toLocaleString()}</td>
                        <td className={`p-2 text-right font-mono font-bold ${r.due > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                          {t.currencySymbol}{r.due.toLocaleString()}
                        </td>
                        <td className="p-2 text-slate-500 italic max-w-[120px] truncate">{r.note || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. Section B: Operating Expenses */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b pb-1.5 border-slate-200">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  ২. পরিচালনা ও মেরামত খরচ ({periodExpenses.length} এন্ট্রি)
                </h3>
                <span className="text-xs font-mono font-bold text-amber-700">
                  {language === 'bn' ? 'মোট খরচ:' : 'Total:'} {t.currencySymbol}{totalExpensesSum.toLocaleString()}
                </span>
              </div>

              <table className="w-full text-left text-[11px] border border-slate-200">
                <thead className="bg-[#FAF8F5] text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">{t.thExpDate}</th>
                    <th className="p-2">{t.thExpCategory}</th>
                    <th className="p-2">{t.thExpDesc}</th>
                    <th className="p-2 text-right">{t.thExpAmt}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {periodExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-slate-400 italic">
                        {language === 'bn' ? 'এই মাসে কোনো খরচের এন্ট্রি নেই' : 'No expenses logged in this period'}
                      </td>
                    </tr>
                  ) : (
                    periodExpenses.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="p-2 font-mono">{e.date}</td>
                        <td className="p-2 font-bold text-amber-700">{e.category || 'সাধারণ'}</td>
                        <td className="p-2">{e.desc}</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">{t.currencySymbol}{e.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 5. Signatures & Official Seal */}
            <div className="pt-8 flex justify-between items-end text-xs font-bold text-slate-600">
              <div className="text-center border-t-2 border-slate-400 pt-2 w-36">
                {language === 'bn' ? 'মালিক / তত্ত্বাবধায়ক' : 'Property Owner'}
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-600 flex items-center justify-center text-[9px] font-black text-blue-600 uppercase rotate-[-10deg]">
                  NAHID KUTIR<br/>VERIFIED
                </div>
              </div>

              <div className="text-center border-t-2 border-slate-400 pt-2 w-36">
                {language === 'bn' ? 'নিরীক্ষক / হিসাবরক্ষক' : 'Auditor / Accountant'}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
