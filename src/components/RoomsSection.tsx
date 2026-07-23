import React, { useState } from 'react';
import { Room, Language } from '../types';
import { getTranslation } from '../data/translations';
import { DoorClosed, Plus, Edit2, Trash2, ChevronDown, Check, X } from 'lucide-react';
import { matchesQuery } from '../lib/search';

interface RoomsSectionProps {
  rooms: Room[];
  language: Language;
  searchQuery: string;
  onAddRoom: (room: Omit<Room, 'id'>) => void;
  onUpdateRoom: (id: string, room: Omit<Room, 'id'>) => void;
  onDeleteRoom: (id: string) => void;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({
  rooms,
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

  // Calculate Column Totals
  const totalRent = safeRooms.reduce((acc, r) => acc + (r?.rentAmount || 0), 0);
  const totalGas = safeRooms.reduce((acc, r) => acc + (r?.gasBill || 0), 0);
  const totalWater = safeRooms.reduce((acc, r) => acc + (r?.waterBill || 0), 0);
  const totalWaste = safeRooms.reduce((acc, r) => acc + (r?.wasteBill || 0), 0);
  const grandTotalAll = totalRent + totalGas + totalWater + totalWaste;

  const formatCurrency = (val: number) => `${t.currencySymbol}${val.toLocaleString()}`;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 mb-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
            <DoorClosed className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
              {t.roomTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.roomSubtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="no-print flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <Plus className={`w-4 h-4 transition-transform ${isFormOpen ? 'rotate-45' : ''}`} />
          <span className="hidden sm:inline">{editingId ? t.roomUpdateBtn : t.roomToggleLabel}</span>
        </button>
      </div>

      {/* Expandable Add/Edit Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 mb-5 space-y-4 no-print animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thRoomNo} *</label>
              <input
                type="text"
                required
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                placeholder={t.rNoPh}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thRentAmt} *</label>
              <input
                type="number"
                required
                min="0"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                placeholder={t.rRentPh}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thGasBill}</label>
              <input
                type="number"
                min="0"
                value={gasBill}
                onChange={(e) => setGasBill(e.target.value)}
                placeholder={t.rGasPh}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thWaterBill}</label>
              <input
                type="number"
                min="0"
                value={waterBill}
                onChange={(e) => setWaterBill(e.target.value)}
                placeholder={t.rWaterPh}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thWasteBill}</label>
              <input
                type="number"
                min="0"
                value={wasteBill}
                onChange={(e) => setWasteBill(e.target.value)}
                placeholder={t.rWastePh}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thMeterNo}</label>
              <input
                type="text"
                value={meterNo}
                onChange={(e) => setMeterNo(e.target.value)}
                placeholder={t.rMeterPh}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {t.thTotalRoomBill}: {formatCurrency(currentPackageSum)}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
              >
                {t.cancelBtn}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                {editingId ? t.roomUpdateBtn : t.roomSubmitBtn}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="p-3">{t.thRoomNo}</th>
              <th className="p-3">{t.thRentAmt}</th>
              <th className="p-3">{t.thGasBill}</th>
              <th className="p-3">{t.thWaterBill}</th>
              <th className="p-3">{t.thWasteBill}</th>
              <th className="p-3">{t.thTotalRoomBill}</th>
              <th className="p-3">{t.thMeterNo}</th>
              <th className="p-3 no-print text-right">{t.thRoomAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
            {filteredRooms.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-400 font-bold">
                  {t.noData}
                </td>
              </tr>
            ) : (
              filteredRooms.map((rm) => {
                const pkg = calcPackageTotal(rm.rentAmount, rm.gasBill, rm.waterBill, rm.wasteBill);
                return (
                  <tr key={rm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">
                      {rm.roomNo}
                    </td>
                    <td className="p-3">{formatCurrency(rm.rentAmount)}</td>
                    <td className="p-3">{formatCurrency(rm.gasBill)}</td>
                    <td className="p-3">{formatCurrency(rm.waterBill)}</td>
                    <td className="p-3">{formatCurrency(rm.wasteBill)}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(pkg)}
                    </td>
                    <td className="p-3 font-mono text-slate-500">{rm.meterNo || '-'}</td>
                    <td className="p-3 no-print text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(rm)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={t.edit}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t.deleteConfirm)) onDeleteRoom(rm.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
              <tr className="bg-slate-50 dark:bg-slate-800/90 font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
                <td className="p-3">{t.totalRow} ({rooms.length})</td>
                <td className="p-3">{formatCurrency(totalRent)}</td>
                <td className="p-3">{formatCurrency(totalGas)}</td>
                <td className="p-3">{formatCurrency(totalWater)}</td>
                <td className="p-3">{formatCurrency(totalWaste)}</td>
                <td className="p-3 text-indigo-600 dark:text-indigo-400 font-bold">{formatCurrency(grandTotalAll)}</td>
                <td className="p-3">-</td>
                <td className="p-3 no-print"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
