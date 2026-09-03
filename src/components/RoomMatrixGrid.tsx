import React, { useState, useMemo } from 'react';
import { Room, Tenant, RentRecord, Language, TabType } from '../types';
import { getTranslation } from '../data/translations';

interface RoomMatrixGridProps {
  rooms: Room[];
  tenants: Tenant[];
  rents: RentRecord[];
  language: Language;
  selectedYear: string;
  selectedMonth: string;
  onQuickPay?: (tenantId: string, dueAmount?: number, rentRecordId?: string) => void;
  onMarkVacant?: (roomNo: string, tenantName?: string) => void;
  onUndoVacant?: (rentRecordId: string) => void;
  onSelectReceipt?: (rec: RentRecord) => void;
  onNavigateTab?: (tab: TabType) => void;
}

type FilterStatus = 'all' | 'occupied' | 'vacant' | 'paid' | 'due';

export const RoomMatrixGrid: React.FC<RoomMatrixGridProps> = ({
  rooms,
  tenants,
  rents,
  language,
  selectedYear,
  selectedMonth,
  onQuickPay,
  onMarkVacant,
  onUndoVacant,
  onSelectReceipt,
  onNavigateTab,
}) => {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const t = getTranslation(language);

  // Compute status for each room based on selected year/month or active month
  const roomStatusList = useMemo(() => {
    return rooms.map((room) => {
      // Find tenant currently assigned to this room
      const tenant = tenants.find(
        (t) => String(t.room).trim().toLowerCase() === String(room.roomNo).trim().toLowerCase()
      );

      const totalPackage = (room.rentAmount || 0) + (room.gasBill || 0) + (room.waterBill || 0) + (room.wasteBill || 0);

      // Find rent record for this room matching year/month
      const matchedRents = rents.filter((r) => {
        const matchesRoom = String(r.room).trim().toLowerCase() === String(room.roomNo).trim().toLowerCase();
        
        let matchesPeriod = true;
        if (selectedYear !== 'all' || selectedMonth !== 'all') {
          const [rYear, rMonth] = (r.date || '').split('-');
          if (selectedYear !== 'all' && rYear !== selectedYear) matchesPeriod = false;
          if (selectedMonth !== 'all' && parseInt(rMonth || '0', 10) !== parseInt(selectedMonth, 10)) matchesPeriod = false;
        }
        return matchesRoom && matchesPeriod;
      });

      // Pick the latest rent record if multiple
      const latestRecord = matchedRents.length > 0 ? matchedRents[matchedRents.length - 1] : null;

      if (latestRecord) {
        if (latestRecord.isVacant) {
          return {
            room,
            tenant,
            isVacant: true,
            status: 'vacant' as const,
            paidAmount: 0,
            dueAmount: 0,
            rentRecord: latestRecord,
            totalPackage,
          };
        }
        const isPaid = latestRecord.due <= 0;
        return {
          room,
          tenant,
          isVacant: false,
          status: (isPaid ? 'paid' : 'due') as 'paid' | 'due',
          paidAmount: latestRecord.paid,
          dueAmount: latestRecord.due,
          rentRecord: latestRecord,
          totalPackage: latestRecord.rent || totalPackage,
        };
      } else {
        if (!tenant) {
          return {
            room,
            tenant: null,
            isVacant: true,
            status: 'vacant' as const,
            paidAmount: 0,
            dueAmount: 0,
            rentRecord: null,
            totalPackage,
          };
        }
        // No payment recorded for this period -> full package is due
        return {
          room,
          tenant,
          isVacant: false,
          status: 'due' as const,
          paidAmount: 0,
          dueAmount: totalPackage,
          rentRecord: null,
          totalPackage,
        };
      }
    });
  }, [rooms, tenants, rents, selectedYear, selectedMonth]);

  // Aggregate stats
  const totalRooms = rooms.length;
  const occupiedCount = roomStatusList.filter((r) => !r.isVacant).length;
  const vacantCount = totalRooms - occupiedCount;
  const paidCount = roomStatusList.filter((r) => r.status === 'paid').length;
  const dueCount = roomStatusList.filter((r) => r.status === 'due').length;
  const totalDueSum = roomStatusList.reduce((acc, curr) => acc + (curr.dueAmount > 0 ? curr.dueAmount : 0), 0);
  const occupancyPercent = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return roomStatusList.filter((item) => {
      // Filter status
      if (filter === 'occupied' && item.isVacant) return false;
      if (filter === 'vacant' && !item.isVacant) return false;
      if (filter === 'paid' && item.status !== 'paid') return false;
      if (filter === 'due' && item.status !== 'due') return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const rMatch = item.room.roomNo.toLowerCase().includes(term);
        const tMatch = item.tenant?.name.toLowerCase().includes(term);
        const pMatch = item.tenant?.phone.toLowerCase().includes(term);
        const mMatch = item.room.meterNo.toLowerCase().includes(term);
        if (!rMatch && !tMatch && !pMatch && !mMatch) return false;
      }

      return true;
    });
  }, [roomStatusList, filter, searchTerm]);

  return (
    <div id="roomMatrixWidget" className="bg-white dark:bg-[#141414] border border-[#D6D0C4] dark:border-[#262626] rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4DC] dark:border-[#262626] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {t.matrixTitle || 'রুমের অবস্থান ও পেমেন্ট স্ট্যাটাস গ্রিড'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            {t.matrixSubtitle || 'বাসার সকল রুমের বুকিং ও চলতি মাসের ভাড়া পরিশোধের দৃশ্যমান চিত্র'}
          </p>
        </div>

        {/* Action button to manage rooms */}
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('rooms')}
            className="self-start sm:self-auto text-xs font-bold px-3 py-1.5 rounded-lg bg-[#F5F2EB] dark:bg-[#202020] text-slate-700 dark:text-slate-200 hover:bg-[#EAE5DA] dark:hover:bg-[#2A2A2A] border border-[#D6D0C4] dark:border-[#333] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <i className="fi fi-sr-apps text-xs text-blue-600 dark:text-blue-400" />
            <span>{language === 'bn' ? 'রুম তালিকা পরিচালনা' : 'Manage Units'}</span>
          </button>
        )}
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-medium">
        {/* Total Rooms */}
        <div className="bg-[#FAF8F5] dark:bg-[#1A1A1A] p-3 rounded-xl border border-[#E8E4DC] dark:border-[#262626]">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">
            {t.matrixTotalRooms || 'সর্বমোট রুম'}
          </span>
          <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
            {totalRooms} {language === 'bn' ? 'টি' : 'units'}
          </span>
        </div>

        {/* Occupied */}
        <div className="bg-blue-50/60 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-blue-800 dark:text-blue-300 font-semibold">
              {t.matrixOccupied || 'ভাড়াকৃত'}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200/70 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {occupancyPercent}%
            </span>
          </div>
          <span className="text-lg font-black text-blue-700 dark:text-blue-400 font-mono mt-0.5 block">
            {occupiedCount} {language === 'bn' ? 'টি' : 'units'}
          </span>
        </div>

        {/* Vacant */}
        <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/40">
          <span className="text-[11px] text-amber-800 dark:text-amber-300 block font-semibold">
            {t.matrixVacant || 'খালি রুম'}
          </span>
          <span className="text-lg font-black text-amber-700 dark:text-amber-400 font-mono mt-0.5 block">
            {vacantCount} {language === 'bn' ? 'টি' : 'units'}
          </span>
        </div>

        {/* Paid in Full */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
          <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block font-semibold">
            {t.matrixPaidRooms || 'পরিশোধিত'}
          </span>
          <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5 block">
            {paidCount} {language === 'bn' ? 'টি' : 'units'}
          </span>
        </div>

        {/* Due */}
        <div className="col-span-2 sm:col-span-1 bg-rose-50/60 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/40">
          <span className="text-[11px] text-rose-800 dark:text-rose-300 block font-semibold">
            {t.matrixDueRooms || 'বকেয়া'}
          </span>
          <span className="text-lg font-black text-rose-700 dark:text-rose-400 font-mono mt-0.5 block">
            {dueCount} <span className="text-xs font-normal">({t.currencySymbol}{totalDueSum.toLocaleString()})</span>
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: t.filterAll || 'সকল রুম', count: totalRooms },
            { id: 'paid', label: t.filterPaid || 'পরিশোধিত', count: paidCount, color: 'text-emerald-700 dark:text-emerald-400' },
            { id: 'due', label: t.filterDue || 'বকেয়া', count: dueCount, color: 'text-rose-700 dark:text-rose-400' },
            { id: 'vacant', label: t.filterVacant || 'খালি', count: vacantCount, color: 'text-amber-700 dark:text-amber-400' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as FilterStatus)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-[#F2EFE8] dark:bg-[#202020] text-slate-600 dark:text-slate-300 hover:bg-[#E6E2D8] dark:hover:bg-[#2A2A2A]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filter === tab.id ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900' : 'bg-black/5 dark:bg-white/10'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[200px] sm:w-64">
          <i className="fi fi-sr-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'bn' ? 'গ্রিডে রুম বা ভাড়াটিয়া খুঁজুন...' : 'Search matrix...'}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#1A1A1A] border border-[#D6D0C4] dark:border-[#333] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Visual Room Cards Grid */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#D6D0C4] dark:border-[#333] rounded-xl text-slate-400 text-xs">
          <i className="fi fi-sr-box-open text-2xl mb-1 block" />
          {language === 'bn' ? 'কোনো রুমের তথ্য পাওয়া যায়নি' : 'No units match current filter'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredRooms.map((item) => {
            const isVacant = item.isVacant;
            const isPaid = item.status === 'paid';
            const isDue = item.status === 'due';

            return (
              <div
                key={item.room.id}
                className={`relative rounded-xl p-3.5 border transition-all duration-200 flex flex-col justify-between ${
                  isVacant
                    ? 'bg-slate-50/50 dark:bg-white/[0.02] border-dashed border-slate-300 dark:border-slate-700'
                    : isPaid
                    ? 'bg-white dark:bg-[#1A1A1A] border-emerald-200 dark:border-emerald-900/60 shadow-sm hover:shadow-md'
                    : 'bg-white dark:bg-[#1A1A1A] border-rose-200 dark:border-rose-900/60 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Status Indicator Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
                    isVacant
                      ? 'bg-amber-400'
                      : isPaid
                      ? 'bg-emerald-500'
                      : 'bg-rose-500'
                  }`}
                />

                {/* Top: Room No, Meter No, Status Badge */}
                <div className="pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-base text-slate-900 dark:text-white">
                          {t.roomText} {item.room.roomNo}
                        </span>
                        {item.room.meterNo && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#252525] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            ⚡ {item.room.meterNo}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isVacant && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {t.matrixVacant || 'খালি'}
                        </span>
                      )}
                      {isPaid && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          <i className="fi fi-sr-check text-[10px]" />
                          {t.matrixPaidRooms || 'পরিশোধিত'}
                        </span>
                      )}
                      {isDue && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          {t.matrixDueRooms || 'বকেয়া'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Occupant / Tenant Info */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#262626]">
                    {item.tenant ? (
                      <div>
                        <div className="flex items-center gap-1 text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                          <i className="fi fi-sr-user text-[11px] text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="truncate">{item.tenant.name}</span>
                        </div>
                        {item.tenant.phone && (
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                            📞 {item.tenant.phone}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 dark:text-slate-500 italic py-0.5">
                        {t.vacantText || 'খালি রুম (ভাড়া প্রস্তুত)'}
                      </div>
                    )}
                  </div>

                  {/* Pricing Breakdown Summary */}
                  <div className="mt-2 text-[11px] bg-[#FAF8F5] dark:bg-[#202020] p-2 rounded-lg border border-[#E8E4DC] dark:border-[#2C2C2C]">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>{language === 'bn' ? 'প্যাকেজ ভাড়া:' : 'Package Rent:'}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {t.currencySymbol}{item.totalPackage.toLocaleString()}
                      </span>
                    </div>

                    {!isVacant && (
                      <div className="flex justify-between mt-1 pt-1 border-t border-slate-200 dark:border-[#333] font-bold">
                        <span>{isPaid ? (language === 'bn' ? 'জমা:' : 'Paid:') : (language === 'bn' ? 'বকেয়া:' : 'Due:')}</span>
                        <span className={`font-mono ${isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {t.currencySymbol}{isPaid ? item.paidAmount.toLocaleString() : item.dueAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-3 pt-2">
                  {isVacant ? (
                    item.rentRecord && onUndoVacant ? (
                      <button
                        onClick={() => onUndoVacant(item.rentRecord!.id)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <i className="fi fi-sr-undo text-xs" />
                        <span>{language === 'bn' ? 'খালি বাতিল করুন' : 'Undo Vacant'}</span>
                      </button>
                    ) : (
                      onNavigateTab && (
                        <button
                          onClick={() => onNavigateTab('tenants')}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <i className="fi fi-sr-user-add text-xs" />
                          <span>{t.assignTenantBtn || 'ভাড়াটিয়া বসান'}</span>
                        </button>
                      )
                    )
                  ) : isPaid ? (
                    item.rentRecord && onSelectReceipt ? (
                      <button
                        onClick={() => onSelectReceipt(item.rentRecord!)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-200/60 dark:border-emerald-800/40"
                      >
                        <i className="fi fi-sr-receipt text-xs text-emerald-600" />
                        <span>{t.receiptBtn || 'রসিদ দেখুন'}</span>
                      </button>
                    ) : (
                      <div className="text-center text-[10px] text-emerald-600 font-bold py-1">
                        ✓ {language === 'bn' ? 'পরিশোধ সম্পন্ন' : 'Settled in Full'}
                      </div>
                    )
                  ) : (
                    item.tenant && onQuickPay ? (
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => onQuickPay(item.tenant!.id, item.dueAmount, item.rentRecord?.id)}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <i className="fi fi-sr-bolt text-xs" />
                          <span>{t.quickPay || 'দ্রুত জমা'} ({t.currencySymbol}{item.dueAmount.toLocaleString()})</span>
                        </button>
                        {onMarkVacant && (
                          <button
                            onClick={() => onMarkVacant(item.room.roomNo, item.tenant?.name)}
                            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 text-[10px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <i className="fi fi-sr-bed-alt text-[10px]" />
                            <span>{language === 'bn' ? 'এই মাসে খালি দেখান' : 'Mark Vacant this month'}</span>
                          </button>
                        )}
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
