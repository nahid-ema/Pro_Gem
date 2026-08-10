import React, { useState, useEffect } from 'react';
import { RentRecord, Tenant, Room, Language } from '../types';
import { getTranslation } from '../data/translations';

import { matchesQuery } from '../lib/search';

interface RentSectionProps {
  rents: RentRecord[];
  tenants: Tenant[];
  rooms: Room[];
  language: Language;
  searchQuery: string;
  selectedYear: string;
  selectedMonth: string;
  initialTenantId?: string | null;
  initialDueAmount?: number | null;
  onClearQuickPay?: () => void;
  onAddRent: (rent: Omit<RentRecord, 'id'>) => void;
  onUpdateRent: (id: string, rent: Omit<RentRecord, 'id'>) => void;
  onDeleteRent: (id: string) => void;
  onSelectReceipt: (rent: RentRecord) => void;
}

export const RentSection: React.FC<RentSectionProps> = ({
  rents,
  tenants,
  rooms,
  language,
  searchQuery,
  selectedYear,
  selectedMonth,
  initialTenantId,
  initialDueAmount,
  onClearQuickPay,
  onAddRent,
  onUpdateRent,
  onDeleteRent,
  onSelectReceipt,
}) => {
  const t = getTranslation(language);

  const todayStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'due'>('all');

  const [date, setDate] = useState(todayStr());
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [dispRoom, setDispRoom] = useState('');
  const [dispPhone, setDispPhone] = useState('');
  const [rent, setRent] = useState('');
  const [paid, setPaid] = useState('');
  const [note, setNote] = useState('');

  const calcDue = () => {
    const r = Number(rent) || 0;
    const p = Number(paid) || 0;
    return Math.max(0, r - p);
  };

  const handleTenantSelect = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    if (!tenantId) {
      setDispRoom('');
      setDispPhone('');
      setRent('');
      return;
    }

    const tn = tenants.find((t) => t.id === tenantId);
    if (tn) {
      setDispRoom(tn.room);
      setDispPhone(tn.phone);

      const rm = rooms.find((r) => (r.roomNo || '').trim() === (tn.room || '').trim());
      if (rm) {
        const totalPkg = rm.rentAmount + rm.gasBill + rm.waterBill + rm.wasteBill;
        setRent(String(totalPkg));
        setPaid(String(totalPkg)); // Default paid to total for quick entry
      } else {
        setRent('');
      }
    }
  };

  useEffect(() => {
    if (initialTenantId) {
      setIsFormOpen(true);
      handleTenantSelect(initialTenantId);
      if (initialDueAmount !== undefined && initialDueAmount !== null && initialDueAmount > 0) {
        setPaid(String(initialDueAmount));
      }
      onClearQuickPay?.();
    }
  }, [initialTenantId]);

  const resetForm = () => {
    setEditingId(null);
    setDate(todayStr());
    setSelectedTenantId('');
    setDispRoom('');
    setDispPhone('');
    setRent('');
    setPaid('');
    setNote('');
    setIsFormOpen(false);
  };

  const handleEditClick = (rt: RentRecord) => {
    setEditingId(rt.id);
    setDate(rt.date);
    const matchedTenant = tenants.find(
      (tn) => (tn.name || '').trim() === (rt.tenant || '').trim() && (tn.room || '').trim() === (rt.room || '').trim()
    );
    setSelectedTenantId(matchedTenant ? matchedTenant.id : '');
    setDispRoom(rt.room || '');
    setDispPhone(rt.phone || '');
    setRent(String(rt.rent || 0));
    setPaid(String(rt.paid || 0));
    setNote(rt.note || '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !rent) return;

    const matchedTenant = tenants.find((tn) => tn.id === selectedTenantId);
    const fallBackRent = rents.find((r) => r.id === editingId);

    const tenantName = matchedTenant ? matchedTenant.name : (fallBackRent ? fallBackRent.tenant : '');
    const rentVal = Number(rent) || 0;
    const paidVal = Number(paid) || 0;
    const dueVal = Math.max(0, rentVal - paidVal);

    const payload = {
      date,
      tenant: tenantName,
      phone: dispPhone.trim(),
      room: dispRoom.trim(),
      rent: rentVal,
      paid: paidVal,
      due: dueVal,
      note: note.trim(),
    };

    if (editingId) {
      onUpdateRent(editingId, payload);
    } else {
      onAddRent(payload);
    }

    resetForm();
  };

  const safeRents = Array.isArray(rents) ? rents : [];
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeRooms = Array.isArray(rooms) ? rooms : [];

  const filteredRents = safeRents
    .filter((rt) => {
      if (!rt || !rt.date) return false;
      const parts = rt.date.split('-');
      const matchY = selectedYear === 'all' || parts[0] === selectedYear;
      const matchM = selectedMonth === 'all' || parts[1] === selectedMonth;

      if (!matchY || !matchM) return false;

      if (statusFilter === 'paid' && rt.due > 0) return false;
      if (statusFilter === 'due' && rt.due <= 0) return false;

      return matchesQuery(searchQuery, [
        rt.tenant,
        rt.room,
        rt.phone,
        rt.note,
        rt.date,
        rt.rent,
        rt.paid,
        rt.due,
      ]);
    })
    .sort((a, b) => {
      const dateCmp = (a.date || '').localeCompare(b.date || '');
      if (dateCmp !== 0) return dateCmp;
      return (a.room || '').localeCompare(b.room || '', undefined, { numeric: true });
    });

  // Calculate totals
  const totalRentAmount = filteredRents.reduce((acc, r) => acc + (r.rent || 0), 0);
  const totalPaidAmount = filteredRents.reduce((acc, r) => acc + (r.paid || 0), 0);
  const totalDueAmount = filteredRents.reduce((acc, r) => acc + (r.due || 0), 0);

  const getWhatsAppLink = (rt: RentRecord) => {
    let phone = (rt.phone || '').trim().replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '88' + phone;
    const msg = t.waMessageTemplate(rt.tenant, rt.room, rt.due);
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const formatCurrency = (val: number) => `${t.currencySymbol}${val.toLocaleString()}`;

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-slate-800 rounded-none md:rounded-none p-5 md:p-6 mb-6 shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-none bg-[#F97316]/10 text-[#F97316] dark:text-[#F97316] flex items-center justify-center font-bold text-base">
            <i className="fi fi-sr-money-bill-wave" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
              {t.rentTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.rentSubtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="no-print flex items-center gap-1.5 px-4 py-2 rounded-none bg-[#F97316] text-slate-900 hover:bg-[#EA580C] font-bold text-xs transition-colors shadow-sm cursor-pointer"
        >
          <i className={`fi fi-sr-add transition-transform ${isFormOpen ? 'rotate-45' : ''}`} />
          <span className="hidden sm:inline">{editingId ? t.rentUpdateBtn : t.rentToggleLabel}</span>
        </button>
      </div>

      {/* Filter Pills Bar */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 no-print">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-none text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-black dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
              : 'bg-slate-100 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {language === 'bn' ? 'সকল লেনদেন' : 'All Transactions'}
        </button>
        <button
          onClick={() => setStatusFilter('paid')}
          className={`px-3 py-1 rounded-none text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'paid'
              ? 'bg-emerald-500 text-white font-bold shadow-xs'
              : 'bg-slate-100 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {language === 'bn' ? 'পরিশোধিত' : 'Fully Paid'}
        </button>
        <button
          onClick={() => setStatusFilter('due')}
          className={`px-3 py-1 rounded-none text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'due'
              ? 'bg-rose-500 text-white font-bold shadow-xs'
              : 'bg-slate-100 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {language === 'bn' ? 'বকেয়া আছে' : 'Has Due'}
        </button>
      </div>

      {/* Expandable Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-[#F9F9F8] dark:bg-[#222222] border border-[#E8E6E1] dark:border-slate-800/80 rounded-none p-4 mb-5 space-y-4 no-print animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thRentDate} *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.rentSelectOpt} *</label>
              <select
                required
                value={selectedTenantId}
                onChange={(e) => handleTenantSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{t.rentSelectOpt}</option>
                {safeTenants.map((tn) => (
                  <option key={tn.id} value={tn.id}>
                    {tn.name} ({t.roomText}: {tn.room})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.dispRoomPlaceholder}</label>
              <input
                type="text"
                readOnly
                value={dispRoom}
                placeholder={t.dispRoomPlaceholder}
                className="w-full px-3 py-2 rounded-none border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-[#2A2A2A]/60 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.dispPhonePlaceholder}</label>
              <input
                type="text"
                readOnly
                value={dispPhone}
                placeholder={t.dispPhonePlaceholder}
                className="w-full px-3 py-2 rounded-none border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-[#2A2A2A]/60 text-xs md:text-sm text-slate-700 dark:text-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thRentAmount} *</label>
              <input
                type="number"
                required
                min="0"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                placeholder={t.rentPlaceholder}
                className="w-full px-3 py-2 rounded-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thPaidAmount} *</label>
              <input
                type="number"
                required
                min="0"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
                placeholder={t.paidPlaceholder}
                className="w-full px-3 py-2 rounded-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.duePlaceholder}</label>
              <input
                type="text"
                readOnly
                value={formatCurrency(calcDue())}
                className="w-full px-3 py-2 rounded-none border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-[#2A2A2A]/60 text-xs md:text-sm font-bold text-rose-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.rentNote || 'নোট / বিবরণ'}</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.rentNotePh || 'যেমন: বিকাশে প্রাপ্ত'}
                className="w-full px-3 py-2 rounded-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E6E1] dark:border-slate-800">
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-1.5 rounded-none bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-none bg-[#F97316] text-slate-900 hover:bg-[#EA580C] font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              {editingId ? t.rentUpdateBtn : t.rentSubmitBtn}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-none border border-[#E8E6E1] dark:border-slate-800 max-h-[500px]">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-[#E8E6E1] dark:border-slate-800 shadow-sm z-10">
            <tr>
              <th className="p-3">{t.thRentDate}</th>
              <th className="p-3">{t.thRentName}</th>
              <th className="p-3">{t.thRentAmount}</th>
              <th className="p-3">{t.thPaidAmount}</th>
              <th className="p-3">{t.thDueStatus}</th>
              <th className="p-3 no-print text-right">{t.thRentAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
            {filteredRents.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400 font-bold">
                  {t.noData}
                </td>
              </tr>
            ) : (
              filteredRents.map((rt) => {
                const isPaid = rt.due <= 0;
                return (
                  <tr key={rt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {rt.date}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {rt.tenant}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {t.roomText}: {rt.room} {rt.note ? `• ${rt.note}` : ''}
                      </div>
                    </td>
                    <td className="p-3 font-bold">{formatCurrency(rt.rent)}</td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(rt.paid)}
                    </td>
                    <td className="p-3">
                      {isPaid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-none bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[10px] uppercase">
                          {t.paidStatus}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-[10px] uppercase">
                            <i className="fi fi-sr-triangle-warning text-xs" />
                            {t.dueStatus} {formatCurrency(rt.due)}
                          </span>
                          <a
                            href={getWhatsAppLink(rt)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-print p-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                            title="Send WhatsApp Reminder"
                          >
                            <i className="fi fi-sr-comment text-xs" />
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="p-3 no-print text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectReceipt(rt)}
                          className="p-1.5 rounded-none text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={t.receiptBtn}
                        >
                          <i className="fi fi-sr-receipt text-sm" />
                        </button>
                        <button
                          onClick={() => handleEditClick(rt)}
                          className="p-1.5 rounded-none text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={t.edit}
                        >
                          <i className="fi fi-sr-edit text-sm" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t.deleteConfirm)) onDeleteRent(rt.id);
                          }}
                          className="p-1.5 rounded-none text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={t.delete}
                        >
                          <i className="fi fi-sr-trash text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {filteredRents.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/90 font-bold text-slate-900 dark:text-white border-t border-[#E8E6E1] dark:border-slate-800">
                <td className="p-3">{t.totalRow} ({filteredRents.length})</td>
                <td className="p-3">-</td>
                <td className="p-3">{formatCurrency(totalRentAmount)}</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPaidAmount)}</td>
                <td className="p-3 text-rose-600 dark:text-rose-400">{formatCurrency(totalDueAmount)}</td>
                <td className="p-3 no-print"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
