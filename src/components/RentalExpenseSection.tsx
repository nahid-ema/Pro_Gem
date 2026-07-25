import React, { useState } from 'react';
import { RentalExpense, Language } from '../types';
import { getTranslation } from '../data/translations';
import { Wallet, Plus, Edit2, Trash2 } from 'lucide-react';
import { matchesQuery } from '../lib/search';

interface RentalExpenseSectionProps {
  rentalExpenses: RentalExpense[];
  language: Language;
  searchQuery: string;
  selectedYear: string;
  selectedMonth: string;
  onAddRentalExpense: (expense: Omit<RentalExpense, 'id'>) => void;
  onUpdateRentalExpense: (id: string, expense: Omit<RentalExpense, 'id'>) => void;
  onDeleteRentalExpense: (id: string) => void;
}

export const RentalExpenseSection: React.FC<RentalExpenseSectionProps> = ({
  rentalExpenses,
  language,
  searchQuery,
  selectedYear,
  selectedMonth,
  onAddRentalExpense,
  onUpdateRentalExpense,
  onDeleteRentalExpense,
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

  const handleEditClick = (ex: RentalExpense) => {
    setEditingId(ex.id);
    setDate(ex.date);
    setDesc(ex.desc);
    setAmount(String(ex.amount));
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !desc.trim() || !amount) return;

    const payload = {
      date,
      desc: desc.trim(),
      amount: Number(amount) || 0,
    };

    if (editingId) {
      onUpdateRentalExpense(editingId, payload);
    } else {
      onAddRentalExpense(payload);
    }

    resetForm();
  };

  const safeRentalExpenses = Array.isArray(rentalExpenses) ? rentalExpenses : [];

  const filteredRentalExpenses = safeRentalExpenses
    .filter((ex) => {
      if (!ex || !ex.date) return false;
      const parts = ex.date.split('-');
      const matchY = selectedYear === 'all' || parts[0] === selectedYear;
      const matchM = selectedMonth === 'all' || parts[1] === selectedMonth;

      if (!matchY || !matchM) return false;

      return matchesQuery(searchQuery, [ex.desc, ex.amount, ex.date]);
    })
    .sort((a, b) => {
      const dateCmp = (a.date || '').localeCompare(b.date || '');
      if (dateCmp !== 0) return dateCmp;
      return (a.desc || '').localeCompare(b.desc || '');
    });

  const totalRentalExpenseSum = filteredRentalExpenses.reduce((acc, ex) => acc + (ex.amount || 0), 0);

  const formatCurrency = (val: number) => `${t.currencySymbol}${val.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">
              {t.rentalExpTitle}
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.rentalExpSubtitle}
          </p>
        </div>

        <button
          onClick={() => {
            if (isFormOpen) {
              resetForm();
            } else {
              setIsFormOpen(true);
            }
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#e0533c] hover:bg-[#cb422d] text-white font-semibold text-xs md:text-sm shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className={`w-4 h-4 transition-transform ${isFormOpen ? 'rotate-45' : ''}`} />
          <span>{isFormOpen ? t.cancelBtn : t.rentalExpToggleLabel}</span>
        </button>
      </div>

      {/* Form Card */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-200"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.thRentalExpDate}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#e0533c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিবরণ (Description)
              </label>
              <input
                type="text"
                required
                placeholder={t.rentalExpDescPh}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#e0533c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                টাকা (Amount in BDT)
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder={t.rentalExpAmtPh}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#e0533c]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#e0533c] hover:bg-[#cb422d] text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
            >
              {editingId ? t.rentalExpUpdateBtn : t.rentalExpSubmitBtn}
            </button>
          </div>
        </form>
      )}

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">{t.thRentalExpDate}</th>
                <th className="py-3 px-4">বিবরণ</th>
                <th className="py-3 px-4 text-right">টাকা</th>
                <th className="py-3 px-4 text-center no-print">{t.thRentalExpAct}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredRentalExpenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filteredRentalExpenses.map((ex) => (
                  <tr
                    key={ex.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">
                      {ex.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {ex.desc}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      {formatCurrency(ex.amount || 0)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditClick(ex)}
                          title={t.edit}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t.deleteConfirm)) {
                              onDeleteRentalExpense(ex.id);
                            }
                          }}
                          title={t.delete}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredRentalExpenses.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                  <td colSpan={2} className="py-3.5 px-4 text-right text-xs uppercase tracking-wider">
                    {t.totalRow}:
                  </td>
                  <td className="py-3.5 px-4 text-right text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                    {formatCurrency(totalRentalExpenseSum)}
                  </td>
                  <td className="py-3.5 px-4 no-print"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
