import React, { useState } from 'react';
import { ShopDue, Language } from '../types';
import { getTranslation } from '../data/translations';
import { matchesQuery } from '../lib/search';

interface ShopDuesSectionProps {
  dokanDues: ShopDue[];
  language: Language;
  searchQuery: string;
  selectedYear: string;
  selectedMonth: string;
  onAddDokanDue: (due: Omit<ShopDue, 'id'>) => void;
  onUpdateDokanDue: (id: string, due: Omit<ShopDue, 'id'>) => void;
  onDeleteDokanDue: (id: string) => void;
}

export const ShopDuesSection: React.FC<ShopDuesSectionProps> = ({
  dokanDues,
  language,
  searchQuery,
  selectedYear,
  selectedMonth,
  onAddDokanDue,
  onUpdateDokanDue,
  onDeleteDokanDue,
}) => {
  const t = getTranslation(language);

  const todayStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [date, setDate] = useState(todayStr());
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setDate(todayStr());
    setDesc('');
    setAmount('');
    setIsFormOpen(false);
  };

  const handleEditClick = (dk: ShopDue) => {
    setEditingId(dk.id);
    setDate(dk.date);
    setDesc(dk.desc);
    setAmount(String(dk.amount));
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !desc.trim() || !amount) return;

    const payload = {
      date,
      desc: desc.trim(),
      amount: Number(amount) || 0,
      shopName: desc.split('—')[0]?.trim() || '',
    };

    if (editingId) {
      onUpdateDokanDue(editingId, payload);
    } else {
      onAddDokanDue(payload);
    }

    resetForm();
  };

  const safeDokanDues = Array.isArray(dokanDues) ? dokanDues : [];

  const filteredDokan = safeDokanDues
    .filter((dk) => {
      if (!dk || !dk.date) return false;
      const parts = dk.date.split('-');
      const matchY = selectedYear === 'all' || parts[0] === selectedYear;
      const matchM = selectedMonth === 'all' || parts[1] === selectedMonth;

      if (!matchY || !matchM) return false;

      return matchesQuery(searchQuery, [dk.desc, dk.amount, dk.date]);
    })
    .sort((a, b) => {
      const dateCmp = (a.date || '').localeCompare(b.date || '');
      if (dateCmp !== 0) return dateCmp;
      return (a.desc || '').localeCompare(b.desc || '');
    });

  const totalDokanSum = filteredDokan.reduce((acc, dk) => acc + (dk.amount || 0), 0);

  const formatCurrency = (val: number) => {
    if (val < 0) {
      return `-${t.currencySymbol}${Math.abs(val).toLocaleString()}`;
    }
    return `${t.currencySymbol}${val.toLocaleString()}`;
  };

  return (
    <div className="bg-[#F5F5F0] dark:bg-[#1A1A1A] border border-[#D6D0C4] dark:border-slate-800 rounded-sm md:rounded-sm p-5 md:p-6 mb-6 shadow-none">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#D6D0C4] dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#C2410C]/10 text-[#C2410C] dark:text-[#C2410C] flex items-center justify-center font-bold text-base">
            <i className="fi fi-sr-shop" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
              {t.dokanTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.dokanSubtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="no-print flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#C2410C] text-white hover:bg-[#9A3412] font-bold text-xs transition-colors shadow-none cursor-pointer"
        >
          <i className={`fi fi-sr-add transition-transform ${isFormOpen ? 'rotate-45' : ''}`} />
          <span className="hidden sm:inline">{editingId ? t.dokanUpdateBtn : t.dokanToggleLabel}</span>
        </button>
      </div>

      {/* Expandable Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-[#F9F9F8] dark:bg-[#222222] border border-[#D6D0C4] dark:border-slate-800 rounded-sm p-4 mb-5 space-y-4 no-print animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thDokDate} *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-sm border border-slate-300 dark:border-slate-700 bg-[#F5F5F0] dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thDokDesc} *</label>
              <input
                type="text"
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={t.dokanDescPh}
                className="w-full px-3 py-2 rounded-sm border border-slate-300 dark:border-slate-700 bg-[#F5F5F0] dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thDokAmt} *</label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t.dokanAmtPh}
                className="w-full px-3 py-2 rounded-sm border border-slate-300 dark:border-slate-700 bg-[#F5F5F0] dark:bg-slate-800 text-xs md:text-sm font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D6D0C4] dark:border-slate-800">
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-1.5 rounded-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-sm bg-[#C2410C] text-white hover:bg-[#9A3412] font-bold text-xs shadow-none transition-colors cursor-pointer"
            >
              {editingId ? t.dokanUpdateBtn : t.dokanSubmitBtn}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-[#D6D0C4] dark:border-slate-800">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-transparent text-slate-900 dark:text-white uppercase text-[10px] font-black tracking-widest border-b-2 border-slate-900 dark:border-white">
              <th className="p-3">{t.thDokDate}</th>
              <th className="p-3">{t.thDokDesc}</th>
              <th className="p-3">{t.thDokAmt}</th>
              <th className="p-3 no-print text-right">{t.thDokAct}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
            {filteredDokan.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-400 font-bold">
                  {t.noData}
                </td>
              </tr>
            ) : (
              filteredDokan.map((dk) => (
                <tr key={dk.id} className="border-b border-[#E2DDCF] dark:border-slate-800/50 hover:bg-[#EBE7E0] dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-mono text-xs text-slate-500 dark:text-slate-400">{dk.date}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{dk.desc}</td>
                  <td className={`p-3 font-bold ${dk.amount < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {formatCurrency(dk.amount)}
                  </td>
                  <td className="p-3 no-print text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEditClick(dk)}
                        className="p-1.5 rounded-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-[#E2DDCF] dark:hover:bg-slate-800 transition-colors"
                        title={t.edit}
                      >
                        <i className="fi fi-sr-edit text-sm" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t.deleteConfirm)) onDeleteDokanDue(dk.id);
                        }}
                        className="p-1.5 rounded-sm text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-[#E2DDCF] dark:hover:bg-slate-800 transition-colors"
                        title={t.delete}
                      >
                        <i className="fi fi-sr-trash text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {filteredDokan.length > 0 && (
            <tfoot>
              <tr className="bg-transparent border-t-2 border-slate-900 dark:border-white font-bold text-slate-900 dark:text-white border-t border-[#D6D0C4] dark:border-slate-800">
                <td className="p-3">{t.totalRow} ({filteredDokan.length})</td>
                <td className="p-3">-</td>
                <td className="p-3 text-amber-600 dark:text-amber-400">{formatCurrency(totalDokanSum)}</td>
                <td className="p-3 no-print"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
