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
    <div className="rounded-[32px] bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/80 dark:border-white/10 p-6 sm:p-8 mb-6 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.3)]">
      {/* Header Title */}
      <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-sm">
            <i className="fi fi-sr-shop" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.dokanTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t.dokanSubtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="no-print flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <i className={`fi fi-sr-add transition-transform duration-200 ${isFormOpen ? 'rotate-45' : ''}`} />
          <span className="hidden sm:inline">{editingId ? t.dokanUpdateBtn : t.dokanToggleLabel}</span>
        </button>
      </div>

      {/* Expandable Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-[24px] p-5 mb-6 space-y-4 no-print animate-fadeIn shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.thDokDate} *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.thDokDesc} *</label>
              <input
                type="text"
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={t.dokanDescPh}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.thDokAmt} *</label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t.dokanAmtPh}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
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
              {editingId ? t.dokanUpdateBtn : t.dokanSubmitBtn}
            </button>
          </div>
        </form>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-[24px] border border-white/80 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-900 dark:text-white uppercase text-[10px] font-black tracking-widest border-b border-slate-200 dark:border-slate-700">
              <th className="p-3.5 pl-4">{t.thDokDate}</th>
              <th className="p-3.5">{t.thDokDesc}</th>
              <th className="p-3.5">{t.thDokAmt}</th>
              <th className="p-3.5 pr-4 no-print text-right">{t.thDokAct}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
            {filteredDokan.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400 font-bold">
                  {t.noData}
                </td>
              </tr>
            ) : (
              filteredDokan.map((dk) => (
                <tr key={dk.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 pl-4 font-mono text-xs text-slate-500 dark:text-slate-400">{dk.date}</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{dk.desc}</td>
                  <td className={`p-3.5 font-bold ${dk.amount < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {formatCurrency(dk.amount)}
                  </td>
                  <td className="p-3.5 pr-4 no-print text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEditClick(dk)}
                        className="p-2 rounded-full text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={t.edit}
                      >
                        <i className="fi fi-sr-edit text-sm" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t.deleteConfirm)) onDeleteDokanDue(dk.id);
                        }}
                        className="p-2 rounded-full text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700">
                <td className="p-3.5 pl-4">{t.totalRow} ({filteredDokan.length})</td>
                <td className="p-3.5">-</td>
                <td className="p-3.5 text-amber-600 dark:text-amber-400 font-extrabold">{formatCurrency(totalDokanSum)}</td>
                <td className="p-3.5 pr-4 no-print"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
