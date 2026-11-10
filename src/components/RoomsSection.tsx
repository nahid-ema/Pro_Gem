import React, { useState } from 'react';
import { Room, Tenant, Language } from '../types';
import { getTranslation } from '../data/translations';
import { matchesQuery } from '../lib/search';

interface RoomsSectionProps {
  rooms: Room[];
  tenants?: Tenant[];
  language: Language;
  searchQuery: string;
  onAddRoom: (room: Omit<Room, 'id'>) => void;
  onUpdateRoom: (id: string, room: Omit<Room, 'id'>) => void;
  onDeleteRoom: (id: string) => void;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({
  rooms,
  tenants = [],
  language,
  searchQuery,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
}) => {
  const t = getTranslation(language);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [roomNo, setRoomNo] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [gasBill, setGasBill] = useState('');
  const [waterBill, setWaterBill] = useState('');
  const [wasteBill, setWasteBill] = useState('');
  const [meterNo, setMeterNo] = useState('');

  const calcPackageTotal = (
    rent: number = 0,
    gas: number = 0,
    water: number = 0,
    waste: number = 0
  ) => rent + gas + water + waste;

  const currentPackageSum = calcPackageTotal(
    Number(rentAmount) || 0,
    Number(gasBill) || 0,
    Number(waterBill) || 0,
    Number(wasteBill) || 0
  );

  const resetForm = () => {
    setEditingId(null);
    setRoomNo('');
    setRentAmount('');
    setGasBill('');
    setWaterBill('');
    setWasteBill('');
    setMeterNo('');
    setIsFormOpen(false);
  };

  const handleEditClick = (rm: Room) => {
    setEditingId(rm.id);
    setRoomNo(rm.roomNo);
    setRentAmount(String(rm.rentAmount || ''));
    setGasBill(String(rm.gasBill || ''));
    setWaterBill(String(rm.waterBill || ''));
    setWasteBill(String(rm.wasteBill || ''));
    setMeterNo(rm.meterNo || '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNo.trim()) return;

    const payload = {
      roomNo: roomNo.trim(),
      rentAmount: Number(rentAmount) || 0,
      gasBill: Number(gasBill) || 0,
      waterBill: Number(waterBill) || 0,
      wasteBill: Number(wasteBill) || 0,
      meterNo: meterNo.trim(),
    };

    if (editingId) {
      onUpdateRoom(editingId, payload);
    } else {
      onAddRoom(payload);
    }

    resetForm();
  };

  const safeRooms = Array.isArray(rooms) ? rooms : [];

  const filteredRooms = safeRooms
    .filter((rm) => {
      if (!rm) return false;
      return matchesQuery(searchQuery, [
        rm.roomNo,
        rm.meterNo,
        rm.rentAmount,
        rm.gasBill,
        rm.waterBill,
        rm.wasteBill,
      ]);
    })
    .sort((a, b) => (a.roomNo || '').localeCompare(b.roomNo || '', undefined, { numeric: true }));

  const totalRent = safeRooms.reduce((acc, r) => acc + (r?.rentAmount || 0), 0);
  const totalGas = safeRooms.reduce((acc, r) => acc + (r?.gasBill || 0), 0);
  const totalWater = safeRooms.reduce((acc, r) => acc + (r?.waterBill || 0), 0);
  const totalWaste = safeRooms.reduce((acc, r) => acc + (r?.wasteBill || 0), 0);
  const grandTotalAll = totalRent + totalGas + totalWater + totalWaste;

  const formatCurrency = (val: number) => `${t.currencySymbol}${val.toLocaleString()}`;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 mb-6 shadow-xs">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {t.roomTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.roomSubtitle}</p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="no-print flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className={`fi fi-sr-add transition-transform duration-200 ${isFormOpen ? 'rotate-45' : ''}`} />
          <span>{editingId ? t.roomUpdateBtn : t.roomToggleLabel}</span>
        </button>
      </div>

      {/* Expandable Add/Edit Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 space-y-4 no-print animate-fadeIn"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.thRoomNo} *
              </label>
              <input
                type="text"
                required
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                placeholder={t.rNoPh}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.thRentAmt} *
              </label>
              <input
                type="number"
                required
                min="0"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                placeholder={t.rRentPh}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-mono tabular-nums font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.thGasBill}
              </label>
              <input
                type="number"
                min="0"
                value={gasBill}
                onChange={(e) => setGasBill(e.target.value)}
                placeholder={t.rGasPh}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-mono tabular-nums font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.thWaterBill}
              </label>
              <input
                type="number"
                min="0"
                value={waterBill}
                onChange={(e) => setWaterBill(e.target.value)}
                placeholder={t.rWaterPh}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-mono tabular-nums font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.thWasteBill}
              </label>
              <input
                type="number"
                min="0"
                value={wasteBill}
                onChange={(e) => setWasteBill(e.target.value)}
                placeholder={t.rWastePh}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-mono tabular-nums font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.thMeterNo}
              </label>
              <input
                type="text"
                value={meterNo}
                onChange={(e) => setMeterNo(e.target.value)}
                placeholder={t.rMeterPh}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-mono tabular-nums text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="text-xs font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {t.thTotalRoomBill}: {formatCurrency(currentPackageSum)}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                {editingId ? t.roomUpdateBtn : t.roomSubmitBtn}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs font-semibold border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-4">{t.thRoomNo}</th>
              <th className="py-3 px-4 text-right">{t.thRentAmt}</th>
              <th className="py-3 px-4 text-right">{t.thGasBill}</th>
              <th className="py-3 px-4 text-right">{t.thWaterBill}</th>
              <th className="py-3 px-4 text-right">{t.thWasteBill}</th>
              <th className="py-3 px-4 text-right">{t.thTotalRoomBill}</th>
              <th className="py-3 px-4">{t.thMeterNo}</th>
              <th className="py-3 px-4 no-print text-right">{t.thRoomAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
            {filteredRooms.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">
                  {t.noData}
                </td>
              </tr>
            ) : (
              filteredRooms.map((rm) => {
                const pkg = calcPackageTotal(rm.rentAmount, rm.gasBill, rm.waterBill, rm.wasteBill);
                const assignedTenant = tenants.find(
                  (tn) =>
                    String(tn.room).trim().toLowerCase() === String(rm.roomNo).trim().toLowerCase()
                );

                return (
                  <tr
                    key={rm.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{rm.roomNo}</div>
                      <div className="text-[11px] mt-0.5">
                        {assignedTenant ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {assignedTenant.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">
                            {language === 'bn' ? 'খালি' : 'Vacant'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-600 dark:text-slate-300 text-right">
                      {formatCurrency(rm.rentAmount)}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-600 dark:text-slate-300 text-right">
                      {formatCurrency(rm.gasBill)}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-600 dark:text-slate-300 text-right">
                      {formatCurrency(rm.waterBill)}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-600 dark:text-slate-300 text-right">
                      {formatCurrency(rm.wasteBill)}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900 dark:text-white text-right">
                      {formatCurrency(pkg)}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {rm.meterNo || '-'}
                    </td>
                    <td className="py-3 px-4 no-print text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditClick(rm)}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
                          title={t.edit}
                        >
                          <i className="fi fi-sr-edit text-xs" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t.deleteConfirm)) onDeleteRoom(rm.id);
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer"
                          title={t.delete}
                        >
                          <i className="fi fi-sr-trash text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Column Summary Footer */}
          {rooms.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
                <td className="py-3 px-4">
                  {t.totalRow} ({rooms.length})
                </td>
                <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-600 dark:text-slate-300 text-right">
                  {formatCurrency(totalRent)}
                </td>
                <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-600 dark:text-slate-300 text-right">
                  {formatCurrency(totalGas)}
                </td>
                <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-600 dark:text-slate-300 text-right">
                  {formatCurrency(totalWater)}
                </td>
                <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-600 dark:text-slate-300 text-right">
                  {formatCurrency(totalWaste)}
                </td>
                <td className="py-3 px-4 font-mono tabular-nums text-indigo-600 dark:text-indigo-400 font-bold text-right">
                  {formatCurrency(grandTotalAll)}
                </td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4 no-print"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
