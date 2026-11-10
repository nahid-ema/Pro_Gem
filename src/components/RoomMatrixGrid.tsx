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
  onSelectTenantLedger?: (tenant: Tenant, room?: Room) => void;
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
  onSelectTenantLedger,
  onNavigateTab,
}) => {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const t = getTranslation(language);

  // Compute status for each room based on selected year/month or active month
  const roomStatusList = useMemo(() => {
    return rooms.map((room) => {
      const tenant = tenants.find(
        (t) => String(t.room).trim().toLowerCase() === String(room.roomNo).trim().toLowerCase()
      );

      const totalPackage =
        (room.rentAmount || 0) +
        (room.gasBill || 0) +
        (room.waterBill || 0) +
        (room.wasteBill || 0);

      const matchedRents = rents.filter((r) => {
        const matchesRoom =
          String(r.room).trim().toLowerCase() === String(room.roomNo).trim().toLowerCase();

        let matchesPeriod = true;
        if (selectedYear !== 'all' || selectedMonth !== 'all') {
          const [rYear, rMonth] = (r.date || '').split('-');
          if (selectedYear !== 'all' && rYear !== selectedYear) matchesPeriod = false;
          if (
            selectedMonth !== 'all' &&
            parseInt(rMonth || '0', 10) !== parseInt(selectedMonth, 10)
          )
            matchesPeriod = false;
        }
        return matchesRoom && matchesPeriod;
      });

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
        const yy = selectedYear === 'all' ? new Date().getFullYear().toString() : selectedYear;
        const mm =
          selectedMonth === 'all'
            ? String(new Date().getMonth() + 1).padStart(2, '0')
            : selectedMonth.padStart(2, '0');
        const targetDateStr = `${yy}-${mm}-01`;

        let priorRentSum = 0;
        let priorPaidSum = 0;
        const rRoom = String(room.roomNo).trim().toLowerCase();
        const rTenant = String(tenant.name).trim().toLowerCase();

        rents.forEach((r) => {
          if (r.date && r.date < targetDateStr) {
            if (
              (r.room || '').trim().toLowerCase() === rRoom &&
              (r.tenant || '').trim().toLowerCase() === rTenant
            ) {
              priorRentSum += r.rent || 0;
              priorPaidSum += r.paid || 0;
            }
          }
        });
        const prevDues = priorRentSum - priorPaidSum;
        const estDue = totalPackage + prevDues;

        const isActuallyPaid = estDue <= 0;

        return {
          room,
          tenant,
          isVacant: false,
          status: (isActuallyPaid ? 'paid' : 'due') as 'paid' | 'due',
          paidAmount: 0,
          dueAmount: isActuallyPaid ? 0 : estDue,
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
  const totalDueSum = roomStatusList.reduce(
    (acc, curr) => acc + (curr.dueAmount > 0 ? curr.dueAmount : 0),
    0
  );
  const occupancyPercent = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return roomStatusList.filter((item) => {
      if (filter === 'occupied' && item.isVacant) return false;
      if (filter === 'vacant' && !item.isVacant) return false;
      if (filter === 'paid' && item.status !== 'paid') return false;
      if (filter === 'due' && item.status !== 'due') return false;

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
    <div
      id="roomMatrixWidget"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {t.matrixTitle || 'রুমের অবস্থান ও পেমেন্ট স্ট্যাটাস গ্রিড'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.matrixSubtitle ||
              'বাসার সকল রুমের বুকিং ও চলতি মাসের ভাড়া পরিশোধের দৃশ্যমান চিত্র'}
          </p>
        </div>

        {/* Action button to manage rooms */}
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('rooms')}
            className="self-start sm:self-auto text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <i className="fi fi-sr-apps text-xs text-indigo-600 dark:text-indigo-400" />
            <span>{language === 'bn' ? 'রুম তালিকা পরিচালনা' : 'Manage Units'}</span>
          </button>
        )}
      </div>

      {/* Summary KPI Bar (Divider Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 text-xs">
        {/* Total Rooms */}
        <div className="p-3.5">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            {t.matrixTotalRooms || 'সর্বমোট রুম'}
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5 block">
            {totalRooms} {language === 'bn' ? 'টি' : 'units'}
          </span>
        </div>

        {/* Occupied */}
        <div className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {t.matrixOccupied || 'ভাড়াকৃত'}
            </span>
            <span className="text-[11px] font-mono tabular-nums font-semibold text-indigo-600 dark:text-indigo-400">
              {occupancyPercent}%
            </span>
          </div>
          <span className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums mt-0.5 block">
            {occupiedCount} {language === 'bn' ? 'টি' : 'units'}
          </span>
        </div>

        {/* Vacant */}
        <div className="p-3.5">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            {t.matrixVacant || 'খালি রুম'}
          </span>
          <span className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums mt-0.5 block">
            {vacantCount} {language === 'bn' ? 'টি' : 'units'}
          </span>
        </div>

        {/* Paid in Full */}
        <div className="p-3.5">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            {t.matrixPaidRooms || 'পরিশোধিত'}
          </span>
          <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-0.5 block">
            {paidCount} {language === 'bn' ? 'টি' : 'units'}
          </span>
        </div>

        {/* Due */}
        <div className="col-span-2 sm:col-span-1 p-3.5">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            {t.matrixDueRooms || 'বকেয়া'}
          </span>
          <span className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums mt-0.5 block">
            {dueCount}{' '}
            <span className="text-xs font-normal">
              ({t.currencySymbol}
              {totalDueSum.toLocaleString()})
            </span>
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: t.filterAll || 'সকল রুম', count: totalRooms },
            { id: 'paid', label: t.filterPaid || 'পরিশোধিত', count: paidCount },
            { id: 'due', label: t.filterDue || 'বকেয়া', count: dueCount },
            { id: 'vacant', label: t.filterVacant || 'খালি', count: vacantCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as FilterStatus)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                filter === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[11px] font-mono tabular-nums text-slate-400 dark:text-slate-500">
                ({tab.count})
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
            placeholder={
              language === 'bn' ? 'গ্রিডে রুম বা ভাড়াটিয়া খুঁজুন...' : 'Search matrix...'
            }
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Visual Room Cards Grid */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
          <i className="fi fi-sr-box-open text-2xl mb-1 block" />
          {language === 'bn'
            ? 'কোনো রুমের তথ্য পাওয়া যায়নি'
            : 'No units match current filter'}
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
                className={`rounded-xl p-4 border transition-colors flex flex-col justify-between ${
                  isVacant
                    ? 'bg-slate-50/40 dark:bg-slate-800/20 border-dashed border-slate-300 dark:border-slate-700'
                    : isPaid
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800'
                }`}
              >
                {/* Top: Room No, Meter No, Status Label */}
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-1.5 min-w-0">
                      <span className="font-bold text-base text-slate-900 dark:text-white whitespace-nowrap">
                        {t.roomText} {item.room.roomNo}
                      </span>
                      {item.room.meterNo && (
                        <span className="text-[11px] font-mono tabular-nums text-slate-400 dark:text-slate-500 truncate">
                          · ⚡ {item.room.meterNo}
                        </span>
                      )}
                    </div>

                    {/* Clean Unboxed Status Text */}
                    <div className="shrink-0 text-xs font-semibold">
                      {isVacant && (
                        <span className="text-amber-600 dark:text-amber-400">
                          {t.matrixVacant || 'খালি'}
                        </span>
                      )}
                      {isPaid && (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <i className="fi fi-sr-check text-[10px]" />
                          <span>{t.matrixPaidRooms || 'পরিশোধিত'}</span>
                        </span>
                      )}
                      {isDue && (
                        <span className="text-rose-600 dark:text-rose-400">
                          {t.matrixDueRooms || 'বকেয়া'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Occupant / Tenant Info */}
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                    {item.tenant ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          {onSelectTenantLedger ? (
                            <button
                              type="button"
                              onClick={() => onSelectTenantLedger(item.tenant!, item.room)}
                              className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate block text-left cursor-pointer transition-colors"
                              title={
                                language === 'bn'
                                  ? 'ভাড়াটিয়ার সম্পূর্ণ লেজার দেখুন'
                                  : 'View Tenant Ledger'
                              }
                            >
                              {item.tenant.name}
                            </button>
                          ) : (
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.tenant.name}
                            </div>
                          )}
                          {item.tenant.phone && (
                            <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.tenant.phone}
                            </div>
                          )}
                        </div>

                        {onSelectTenantLedger && (
                          <button
                            type="button"
                            onClick={() => onSelectTenantLedger(item.tenant!, item.room)}
                            className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shrink-0 cursor-pointer transition-colors"
                            title={
                              language === 'bn'
                                ? 'সম্পূর্ণ খতিয়ান / লেজার'
                                : 'Full Payment Ledger'
                            }
                          >
                            {language === 'bn' ? 'খতিয়ান' : 'Ledger'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 dark:text-slate-500 py-1">
                        {t.vacantText || 'খালি রুম (ভাড়া প্রস্তুত)'}
                      </div>
                    )}
                  </div>

                  {/* Pricing Breakdown Summary (Hairline Divider, No Nested Card) */}
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>{language === 'bn' ? 'প্যাকেজ ভাড়া:' : 'Package Rent:'}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
                        {t.currencySymbol}
                        {item.totalPackage.toLocaleString()}
                      </span>
                    </div>

                    {!isVacant && (
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {isPaid
                            ? language === 'bn'
                              ? 'জমা:'
                              : 'Paid:'
                            : language === 'bn'
                            ? 'বকেয়া:'
                            : 'Due:'}
                        </span>
                        <span
                          className={`font-mono tabular-nums ${
                            isPaid
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {t.currencySymbol}
                          {isPaid
                            ? item.paidAmount.toLocaleString()
                            : item.dueAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  {isVacant ? (
                    item.rentRecord && onUndoVacant ? (
                      <button
                        onClick={() => onUndoVacant(item.rentRecord!.id)}
                        className="w-full py-1.5 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <i className="fi fi-sr-undo text-xs" />
                        <span>{language === 'bn' ? 'খালি বাতিল করুন' : 'Undo Vacant'}</span>
                      </button>
                    ) : (
                      onNavigateTab && (
                        <button
                          onClick={() => onNavigateTab('tenants')}
                          className="w-full py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <i className="fi fi-sr-receipt text-xs" />
                        <span>{t.receiptBtn || 'রসিদ দেখুন'}</span>
                      </button>
                    ) : (
                      <div className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold py-1">
                        ✓ {language === 'bn' ? 'পরিশোধ সম্পন্ন' : 'Settled in Full'}
                      </div>
                    )
                  ) : item.tenant && onQuickPay ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          onQuickPay(item.tenant!.id, item.dueAmount, item.rentRecord?.id)
                        }
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <i className="fi fi-sr-bolt text-xs" />
                        <span>
                          {t.quickPay || 'দ্রুত জমা'} ({t.currencySymbol}
                          {item.dueAmount.toLocaleString()})
                        </span>
                      </button>
                      {onMarkVacant && (
                        <button
                          onClick={() => onMarkVacant(item.room.roomNo, item.tenant?.name)}
                          title={
                            language === 'bn' ? 'এই মাসে খালি দেখান' : 'Mark Vacant this month'
                          }
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                        >
                          <i className="fi fi-sr-bed-alt text-xs" />
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
