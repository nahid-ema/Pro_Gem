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
  initialRentRecordId?: string | null;
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
  initialRentRecordId,
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

  const safeRents = Array.isArray(rents) ? rents : [];
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeRooms = Array.isArray(rooms) ? rooms : [];

  const getPreviousDues = () => {
    if (!selectedTenantId) return 0;
    const tn = safeTenants.find((t) => t && t.id === selectedTenantId);
    if (!tn) return 0;
    
    let prev = 0;
    safeRents.forEach((r) => {
      if (!r) return;
      if ((r.room || '').trim() === (tn.room || '').trim()) {
        if (r.id !== editingId) {
          prev += (r.due || 0);
        }
      }
    });
    return prev;
  };

  const prevDues = getPreviousDues();
  const currentRent = Number(rent) || 0;
  const currentPaid = Number(paid) || 0;
  const totalPayable = currentRent + prevDues;
  const remainingDue = totalPayable - currentPaid;

  const handleTenantSelect = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    if (!tenantId) {
      setDispRoom('');
      setDispPhone('');
      setRent('');
      return;
    }

    const tn = safeTenants.find((t) => t && t.id === tenantId);
    if (tn) {
      setDispRoom(tn.room);
      setDispPhone(tn.phone);

      const rm = safeRooms.find((r) => r && (r.roomNo || '').trim() === (tn.room || '').trim());
      if (rm) {
        let previousDues = 0;
        safeRents.forEach((r) => {
          if (!r) return;
          if ((r.room || "").trim() === (tn.room || "").trim()) {
            if (r.id !== editingId) {
              previousDues += (r.due || 0);
            }
          }
        });
        const currentPkg = rm.rentAmount + rm.gasBill + rm.waterBill + rm.wasteBill;
        const suggestedPaid = Math.max(0, currentPkg + previousDues);
        
        setNote('');
        
        setRent(String(currentPkg));
        setPaid(String(suggestedPaid)); // Default paid to suggested total for quick entry
      } else {
        setRent('');
      }
    }
  };

  useEffect(() => {
    if (initialTenantId) {
      setIsFormOpen(true);
      handleTenantSelect(initialTenantId);
      
      if (initialRentRecordId) {
        const rt = safeRents.find((r) => r && r.id === initialRentRecordId);
        if (rt) {
          setEditingId(rt.id);
          setDate(rt.date);
          setRent(String(rt.rent || 0));
          // Pre-fill paid with the full rent amount to clear the due
          setPaid(String(rt.rent || 0));
          setNote(rt.note || '');
        }
      }
      onClearQuickPay?.();
    }
  }, [initialTenantId]);

  useEffect(() => {
    if (!selectedTenantId || !date) return;
    
    const tn = safeTenants.find((t) => t && t.id === selectedTenantId);
    if (!tn) return;

    const [y, m] = date.split('-');
    const existingRecord = safeRents.find((r) => {
      if (!r || !r.date) return false;
      const [ey, em] = r.date.split('-');
      return ey === y && em === m && (r.room || '').trim() === (tn.room || '').trim();
    });

    if (existingRecord) {
      if (existingRecord.id !== editingId) {
        setEditingId(existingRecord.id);
        setRent(String(existingRecord.rent || 0));
        setPaid(String(existingRecord.paid || 0));
        setNote(existingRecord.note || '');
      }
    } else {
      if (editingId) {
        setEditingId(null);
        // Recalculate default values for new entry
        const rm = safeRooms.find((r) => r && (r.roomNo || '').trim() === (tn.room || '').trim());
        if (rm) {
          let previousDues = 0;
          safeRents.forEach((r) => {
            if (!r) return;
            if ((r.room || "").trim() === (tn.room || "").trim()) {
              previousDues += (r.due || 0);
            }
          });
          const currentPkg = rm.rentAmount + rm.gasBill + rm.waterBill + rm.wasteBill;
          const suggestedPaid = Math.max(0, currentPkg + previousDues);
          setRent(String(currentPkg));
          setPaid(String(suggestedPaid));
          setNote('');
        }
      }
    }
  }, [date, selectedTenantId, rents, editingId, rooms, tenants, language]);

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
      if (initialRentRecordId) setEditingId(initialRentRecordId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !rent) return;

    const matchedTenant = tenants.find((tn) => tn.id === selectedTenantId);
    const fallBackRent = rents.find((r) => r.id === editingId);

    const tenantName = matchedTenant ? matchedTenant.name : (fallBackRent ? fallBackRent.tenant : '');
    const rentVal = Number(rent) || 0;
    const paidVal = Number(paid) || 0;
    const dueVal = rentVal - paidVal;

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
    <div className="rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0 border border-blue-100 dark:border-blue-800/30">
            <i className="fi fi-sr-money-bill-wave" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.rentTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t.rentSubtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="no-print flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs transition-all active:scale-95 cursor-pointer"
        >
          <i className={`fi fi-sr-add transition-transform duration-200 ${isFormOpen ? 'rotate-45' : ''}`} />
          <span className="hidden sm:inline">{editingId ? t.rentUpdateBtn : t.rentToggleLabel}</span>
        </button>
      </div>

      {/* Filter Pills Bar */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 no-print">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm scale-105'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {language === 'bn' ? 'সকল লেনদেন' : 'All Transactions'}
        </button>
        <button
          onClick={() => setStatusFilter('paid')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'paid'
              ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm scale-105'
              : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
          }`}
        >
          {language === 'bn' ? 'পরিশোধিত' : 'Fully Paid'}
        </button>
        <button
          onClick={() => setStatusFilter('due')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'due'
              ? 'bg-rose-600 dark:bg-rose-500 text-white shadow-sm scale-105'
              : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50'
          }`}
        >
          {language === 'bn' ? 'বকেয়া আছে' : 'Has Due'}
        </button>
      </div>

      {/* Expandable Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-[24px] p-5 mb-6 space-y-4 no-print animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.thRentDate} *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.rentSelectOpt} *</label>
              <select
                required
                value={selectedTenantId}
                onChange={(e) => handleTenantSelect(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.dispRoomPlaceholder}</label>
              <input
                type="text"
                readOnly
                value={dispRoom}
                placeholder={t.dispRoomPlaceholder}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.dispPhonePlaceholder}</label>
              <input
                type="text"
                readOnly
                value={dispPhone}
                placeholder={t.dispPhonePlaceholder}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'চলতি মাসের ভাড়া *' : 'Current Rent *'}
              </label>
              <input
                type="number"
                required
                min="0"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                placeholder={t.rentPlaceholder}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {prevDues < 0 ? (language === 'bn' ? 'পূর্বের অগ্রিম' : 'Previous Advance') : (language === 'bn' ? 'পূর্বের বকেয়া' : 'Previous Due')}
              </label>
              <input
                type="text"
                readOnly
                value={formatCurrency(Math.abs(prevDues))}
                className={`w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs md:text-sm font-bold ${prevDues < 0 ? 'text-emerald-600' : (prevDues > 0 ? 'text-rose-600' : 'text-slate-500')}`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'সর্বমোট প্রদেয়' : 'Total Payable'}
              </label>
              <input
                type="text"
                readOnly
                value={formatCurrency(Math.max(0, totalPayable))}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs md:text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.thPaidAmount} *</label>
              <input
                type="number"
                required
                min="0"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
                placeholder={t.paidPlaceholder}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {remainingDue < 0 ? (language === 'bn' ? 'বর্তমান অগ্রিম' : 'Current Advance') : (language === 'bn' ? 'বর্তমান বকেয়া' : 'Current Due')}
              </label>
              <input
                type="text"
                readOnly
                value={formatCurrency(Math.abs(remainingDue))}
                className={`w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs md:text-sm font-bold ${remainingDue < 0 ? 'text-emerald-600' : (remainingDue > 0 ? 'text-rose-600' : 'text-slate-500')}`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.rentNote || 'নোট / বিবরণ'}</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.rentNotePh || 'যেমন: বিকাশে প্রাপ্ত'}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              {editingId ? t.rentUpdateBtn : t.rentSubmitBtn}
            </button>
          </div>
        </form>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-[500px]">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200 dark:border-slate-800 z-10">
            <tr>
              <th className="p-3.5 pl-4">{t.thRentDate}</th>
              <th className="p-3.5">{t.thRentName}</th>
              <th className="p-3.5 text-right">{t.thRentAmount}</th>
              <th className="p-3.5 text-right">{t.thPaidAmount}</th>
              <th className="p-3.5 text-right">{t.thDueStatus}</th>
              <th className="p-3.5 pr-4 no-print text-right">{t.thRentAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
            {filteredRents.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                  {t.noData}
                </td>
              </tr>
            ) : (
              filteredRents.map((rt) => {
                const isPaid = rt.due <= 0;
                return (
                  <tr key={rt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 pl-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {rt.date}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {rt.tenant}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {t.roomText}: {rt.room} {rt.note ? `• ${rt.note}` : ''}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-600 dark:text-slate-300 text-right">{formatCurrency(rt.rent)}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right">
                      {formatCurrency(rt.paid)}
                    </td>
                    <td className="p-3.5 text-right">
                      {isPaid ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider">
                          {rt.due < 0 ? (language === 'bn' ? `অগ্রিম ${formatCurrency(Math.abs(rt.due))}` : `Advance ${formatCurrency(Math.abs(rt.due))}`) : t.paidStatus}
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 font-extrabold text-[10px] uppercase tracking-wider">
                            <i className="fi fi-sr-triangle-warning text-xs" />
                            {t.dueStatus} <span className="font-mono">{formatCurrency(rt.due)}</span>
                          </span>
                          <a
                            href={getWhatsAppLink(rt)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-print p-1.5 rounded-full text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                            title="Send WhatsApp Reminder"
                          >
                            <i className="fi fi-sr-comment text-sm" />
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 pr-4 no-print text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectReceipt(rt)}
                          className="p-2 rounded-full text-slate-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                          title={t.receiptBtn}
                        >
                          <i className="fi fi-sr-receipt text-sm" />
                        </button>
                        <button
                          onClick={() => handleEditClick(rt)}
                          className="p-2 rounded-full text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          title={t.edit}
                        >
                          <i className="fi fi-sr-edit text-sm" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t.deleteConfirm)) onDeleteRent(rt.id);
                          }}
                          className="p-2 rounded-full text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
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
            <tfoot className="sticky bottom-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
                <td className="p-3.5 pl-4">{t.totalRow} ({filteredRents.length})</td>
                <td className="p-3.5">-</td>
                <td className="p-3.5 font-mono font-extrabold text-slate-600 dark:text-slate-300 text-right">{formatCurrency(totalRentAmount)}</td>
                <td className="p-3.5 font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-right">{formatCurrency(totalPaidAmount)}</td>
                <td className={`p-3.5 font-mono font-extrabold text-right ${totalDueAmount < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  <div className="flex justify-end">
                    {totalDueAmount !== 0 ? (totalDueAmount < 0 ? `(অগ্রিম) ${formatCurrency(Math.abs(totalDueAmount))}` : formatCurrency(totalDueAmount)) : '-'}
                  </div>
                </td>
                <td className="p-3.5 pr-4 no-print"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
