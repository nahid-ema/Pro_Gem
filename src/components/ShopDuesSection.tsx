import React, { useState } from 'react';
import { ShopDue, Language } from '../types';
import { getTranslation } from '../data/translations';
import { Store, Plus, Edit2, Trash2 } from 'lucide-react';
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

  const filteredDokan = safeDokanDues.filter((dk) => {
    if (!dk || !dk.date) return false;
    const parts = dk.date.split('-');
    const matchY = selectedYear === 'all' || parts[0] === selectedYear;
    const matchM = selectedMonth === 'all' || parts[1] === selectedMonth;

    if (!matchY || !matchM) return false;

    return matchesQuery(searchQuery, [dk.desc, dk.amount, dk.date]);
  });

  const totalDokanSum = filteredDokan.reduce((acc, dk) => acc + (dk.amount || 0), 0);

  const formatCurrency = (val: number) => `${t.currencySymbol}${val.toLocaleString()}`;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 mb-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
            <Store className="w-4 h-4" />
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
          className="no-print flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <Plus className={`w-4 h-4 transition-transform ${isFormOpen ? 'rotate-45' : ''}`} />
          <span className="hidden sm:inline">{editingId ? t.dokanUpdateBtn : t.dokanToggleLabel}</span>
        </button>
      </div>

      {/* Expandable Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 mb-5 space-y-4 no-print animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thDokDate} *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thDokAmt} *</label>
              <input
                type="number"
                required
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t.dokanAmtPh}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
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
              {editingId ? t.dokanUpdateBtn : t.dokanSubmitBtn}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
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
                <tr key={dk.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-mono text-xs text-slate-500">{dk.date}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{dk.desc}</td>
                  <td className="p-3 font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(dk.amount)}
                  </td>
                  <td className="p-3 no-print text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEditClick(dk)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={t.edit}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t.deleteConfirm)) onDeleteDokanDue(dk.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={t.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {filteredDokan.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/90 font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
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
