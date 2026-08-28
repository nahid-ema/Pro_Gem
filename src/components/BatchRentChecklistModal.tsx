import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Room, Tenant, RentRecord, Language } from '../types';
import { getTranslation } from '../data/translations';

interface BatchRentChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  tenants: Tenant[];
  rents: RentRecord[];
  language: Language;
  selectedYear: string;
  selectedMonth: string;
  onBatchCollectAll: (records: Omit<RentRecord, 'id'>[]) => void;
  onSingleCollect: (record: Omit<RentRecord, 'id'>) => void;
  onSelectReceipt: (record: RentRecord) => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const BatchRentChecklistModal: React.FC<BatchRentChecklistModalProps> = ({
  isOpen,
  onClose,
  rooms,
  tenants,
  rents,
  language,
  selectedYear,
  selectedMonth,
  onBatchCollectAll,
  onSingleCollect,
  onSelectReceipt,
  showToast,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [collectionDate, setCollectionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchFilter, setSearchFilter] = useState('');

  const t = getTranslation(language);

  // Month and Year to evaluate
  const currentEvalYear = selectedYear !== 'all' ? selectedYear : String(new Date().getFullYear());
  const currentEvalMonth = selectedMonth !== 'all' ? selectedMonth : String(new Date().getMonth() + 1);
  const monthName = t.months ? t.months[parseInt(currentEvalMonth, 10) - 1] : `Month ${currentEvalMonth}`;

  // Build checklist rows
  const checklistRows = useMemo(() => {
    return tenants.map((tenant) => {
      const room = rooms.find(
        (r) => String(r.roomNo).trim().toLowerCase() === String(tenant.room).trim().toLowerCase()
      );

      const baseRent = room ? room.rentAmount || 0 : 0;
      const gasBill = room ? room.gasBill || 0 : 0;
      const waterBill = room ? room.waterBill || 0 : 0;
      const wasteBill = room ? room.wasteBill || 0 : 0;
      const monthlyTotal = baseRent + gasBill + waterBill + wasteBill;

      // Find if this tenant already has a rent record for this year & month
      const currentPeriodRecord = rents.find((r) => {
        const matchesTenant = String(r.tenant).trim().toLowerCase() === String(tenant.name).trim().toLowerCase();
        const matchesRoom = String(r.room).trim().toLowerCase() === String(tenant.room).trim().toLowerCase();
        if (!matchesTenant && !matchesRoom) return false;

        const [rYear, rMonth] = (r.date || '').split('-');
        return rYear === currentEvalYear && parseInt(rMonth || '0', 10) === parseInt(currentEvalMonth, 10);
      });

      const isPaid = !!currentPeriodRecord && currentPeriodRecord.due <= 0;
      const payableAmount = currentPeriodRecord ? currentPeriodRecord.rent : (monthlyTotal > 0 ? monthlyTotal : 5000);
      const paidAmount = currentPeriodRecord ? currentPeriodRecord.paid : 0;
      const dueAmount = currentPeriodRecord ? currentPeriodRecord.due : payableAmount;

      return {
        tenant,
        room,
        isPaid,
        payableAmount,
        paidAmount,
        dueAmount,
        record: currentPeriodRecord || null,
      };
    });
  }, [tenants, rooms, rents, currentEvalYear, currentEvalMonth]);

  // Filtered rows for search
  const filteredRows = useMemo(() => {
    if (!searchFilter.trim()) return checklistRows;
    const q = searchFilter.toLowerCase();
    return checklistRows.filter(
      (row) =>
        row.tenant.name.toLowerCase().includes(q) ||
        row.tenant.room.toLowerCase().includes(q) ||
        row.tenant.phone.toLowerCase().includes(q)
    );
  }, [checklistRows, searchFilter]);

  // Summary figures
  const totalTenants = checklistRows.length;
  const paidCount = checklistRows.filter((r) => r.isPaid).length;
  const unpaidCount = totalTenants - paidCount;
  const totalExpectedSum = checklistRows.reduce((acc, curr) => acc + curr.payableAmount, 0);
  const totalCollectedSum = checklistRows.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalOutstandingDue = checklistRows.reduce((acc, curr) => acc + (curr.dueAmount > 0 ? curr.dueAmount : 0), 0);
  const percentCollected = totalExpectedSum > 0 ? Math.round((totalCollectedSum / totalExpectedSum) * 100) : 0;

  if (!isOpen) return null;

  const handleCollectSingle = (row: typeof checklistRows[0]) => {
    const newRecord: Omit<RentRecord, 'id'> = {
      date: collectionDate,
      tenant: row.tenant.name,
      phone: row.tenant.phone,
      room: row.tenant.room,
      rent: row.payableAmount,
      paid: row.payableAmount,
      due: 0,
      note: language === 'bn' ? `${monthName} ${currentEvalYear} ভাড়া (১-ক্লিকে আদায়)` : `${monthName} ${currentEvalYear} Rent (1-Click)`,
    };

    onSingleCollect(newRecord);
    showToast?.(
      language === 'bn'
        ? `✓ ${row.tenant.name} (${t.roomText} ${row.tenant.room}) এর ভাড়া আদায় সম্পন্ন!`
        : `✓ Rent recorded for ${row.tenant.name} (Room ${row.tenant.room})!`,
      'success'
    );
  };

  const handleExecuteBatchAll = () => {
    const unpaidRows = checklistRows.filter((r) => !r.isPaid);
    if (unpaidRows.length === 0) {
      showToast?.(language === 'bn' ? 'সকল ভাড়াটিয়ার ভাড়া ইতিমধ্যে পরিশোধিত রয়েছে!' : 'All tenants are already paid!', 'info');
      setShowConfirmModal(false);
      return;
    }

    setIsProcessing(true);
    const newRecords: Omit<RentRecord, 'id'>[] = unpaidRows.map((row) => ({
      date: collectionDate,
      tenant: row.tenant.name,
      phone: row.tenant.phone,
      room: row.tenant.room,
      rent: row.payableAmount,
      paid: row.payableAmount,
      due: 0,
      note: language === 'bn' ? `${monthName} ${currentEvalYear} মাসিক ভাড়া কালেকশন` : `${monthName} ${currentEvalYear} Monthly Batch Rent`,
    }));

    onBatchCollectAll(newRecords);
    setIsProcessing(false);
    setShowConfirmModal(false);
    showToast?.(
      language === 'bn'
        ? `✓ ${newRecords.length}টি রুমের বকেয়া ভাড়া সফলভাবে ১-ক্লিকে আদায় ও রেকর্ড হয়েছে!`
        : `✓ Batch collected and recorded for ${newRecords.length} units successfully!`,
      'success'
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-[#141414] border border-[#D6D0C4] dark:border-[#262626] rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative my-auto flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DC] dark:border-[#262626] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {t.batchChecklistTitle || 'মাসিক ভাড়া আদায়ের চেকশিট'}
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                {monthName} {currentEvalYear}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.batchChecklistSubtitle || 'চলতি মাসের সকল ভাড়াটিয়ার ভাড়া এক ক্লিকে আদায় ও পর্যবেক্ষণ'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#F2EFE8] dark:bg-[#202020] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <i className="fi fi-sr-cross text-sm" />
          </button>
        </div>

        {/* Progress & Summary Bar */}
        <div className="py-3.5 px-4 bg-[#FAF8F5] dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E4DC] dark:border-[#262626] mt-4 shrink-0 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {language === 'bn' ? 'সংগ্রহের অগ্রগতি:' : 'Collection Progress:'}
              </span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {paidCount} / {totalTenants} {language === 'bn' ? 'রুম সম্পন্ন' : 'units paid'} ({percentCollected}%)
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-600 font-bold">
                {language === 'bn' ? 'আদায়:' : 'Collected:'} {t.currencySymbol}{totalCollectedSum.toLocaleString()}
              </span>
              <span className="text-rose-600 font-bold">
                {language === 'bn' ? 'বকেয়া:' : 'Due:'} {t.currencySymbol}{totalOutstandingDue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-[#2A2A2A] h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${percentCollected}%` }}
            />
          </div>
        </div>

        {/* Action Controls & Batch Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <i className="fi fi-sr-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={language === 'bn' ? 'ভাড়াটিয়া বা রুম খুঁজুন...' : 'Search tenant or room...'}
                className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#1A1A1A] border border-[#D6D0C4] dark:border-[#333] rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 text-[11px] font-medium">{language === 'bn' ? 'জমার তারিখ:' : 'Date:'}</span>
              <input
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="px-2 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#1A1A1A] border border-[#D6D0C4] dark:border-[#333] rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Master 1-Click Collect All Button */}
          {unpaidCount > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <i className="fi fi-sr-bolt text-xs text-amber-300" />
              <span>{t.batchCollectAllBtn || 'সকল বকেয়া ১-ক্লিকে আদায় করুন'} ({unpaidCount})</span>
            </button>
          )}
        </div>

        {/* Tenants Checklist Table */}
        <div className="flex-1 overflow-y-auto border border-[#E8E4DC] dark:border-[#262626] rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAF8F5] dark:bg-[#1A1A1A] text-slate-500 dark:text-slate-400 font-bold sticky top-0 border-b border-[#E8E4DC] dark:border-[#262626] z-10">
              <tr>
                <th className="p-3">{t.thRoomNo}</th>
                <th className="p-3">{t.thName}</th>
                <th className="p-3">{language === 'bn' ? 'প্যাকেজ বিল' : 'Package'}</th>
                <th className="p-3 text-right">{language === 'bn' ? 'পাওনা / বকেয়া' : 'Payable'}</th>
                <th className="p-3 text-center">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="p-3 text-right">{t.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#222]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 text-xs">
                    {language === 'bn' ? 'কোনো তথ্য পাওয়া যায়নি' : 'No tenants found'}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr
                    key={row.tenant.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors ${
                      row.isPaid ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                    }`}
                  >
                    {/* Room */}
                    <td className="p-3 font-bold font-mono text-slate-900 dark:text-white">
                      {t.roomText} {row.tenant.room}
                    </td>

                    {/* Tenant Info */}
                    <td className="p-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {row.tenant.name}
                      </div>
                      {row.tenant.phone && (
                        <div className="text-[11px] font-mono text-slate-400">
                          {row.tenant.phone}
                        </div>
                      )}
                    </td>

                    {/* Package */}
                    <td className="p-3 text-slate-600 dark:text-slate-400 font-mono">
                      {t.currencySymbol}{row.payableAmount.toLocaleString()}
                    </td>

                    {/* Payable / Due */}
                    <td className="p-3 text-right font-black font-mono">
                      {row.isPaid ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {t.currencySymbol}{row.paidAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400">
                          {t.currencySymbol}{row.dueAmount.toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 text-center">
                      {row.isPaid ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          <i className="fi fi-sr-check text-[10px]" />
                          {t.batchAlreadyPaid || 'পরিশোধিত'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          {t.dueStatus || 'বকেয়া'}
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="p-3 text-right">
                      {row.isPaid && row.record ? (
                        <button
                          onClick={() => onSelectReceipt(row.record!)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <i className="fi fi-sr-receipt text-xs mr-1 text-emerald-600" />
                          {t.receiptBtn}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCollectSingle(row)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <i className="fi fi-sr-check text-xs" />
                          <span>{t.batchMarkPaid || 'পরিশোধ গ্রহণ'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Confirmation Modal Overlay */}
        {showConfirmModal && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-20 rounded-3xl animate-fadeIn">
            <div className="bg-white dark:bg-[#1A1A1A] border border-[#D6D0C4] dark:border-[#333] p-5 rounded-2xl max-w-md w-full shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                <i className="fi fi-sr-bolt" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {language === 'bn' ? 'সকল বকেয়া ১-ক্লিকে আদায় নিশ্চিতকরণ' : 'Confirm Batch Collect'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t.batchCollectConfirm || 'আপনি কি সকল বকেয়া ভাড়াটিয়ার সম্পূর্ণ ভাড়া এই মাসের জন্য পরিশোধিত হিসেবে রেকর্ড করতে চান?'}
                </p>
                <div className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 py-1.5 rounded-lg">
                  {unpaidCount} {language === 'bn' ? 'টি রুমের মোট' : 'units totaling'} {t.currencySymbol}{totalOutstandingDue.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#2A2A2A] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  onClick={handleExecuteBatchAll}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? '...' : (language === 'bn' ? 'হ্যাঁ, সম্পূর্ণ আদায় করুন' : 'Confirm & Collect All')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};
