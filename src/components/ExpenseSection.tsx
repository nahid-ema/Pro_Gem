import React, { useState } from 'react';
import { Expense, Language } from '../types';
import { getTranslation } from '../data/translations';
import { Receipt, Plus, Edit2, Trash2, Tag, Filter } from 'lucide-react';
import { matchesQuery } from '../lib/search';

interface ExpenseSectionProps {
  expenses: Expense[];
  language: Language;
  searchQuery: string;
  selectedYear: string;
  selectedMonth: string;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseSection: React.FC<ExpenseSectionProps> = ({
  expenses,
  language,
  searchQuery,
  selectedYear,
  selectedMonth,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}) => {
  const t = getTranslation(language);

  const predefinedCategories = language === 'bn' 
    ? [
        "রক্ষণাবেক্ষণ ও মেরামত",
        "ইউটিলিটি ও বিল",
        "রং ও ডেকোরেশন",
        "প্লাম্বিং ও সেনেটারি",
        "ইলেকট্রিক ও সরঞ্জাম",
        "বাজার ও কেনাকাটা",
        "সার্ভিস চার্জ",
        "সাধারণ",
      ]
    : [
        "Maintenance & Repair",
        "Utilities & Bills",
        "Painting & Renovation",
        "Plumbing & Sanitary",
        "Electrical & Supplies",
        "Groceries & Household",
        "Service Charge",
        "General",
      ];

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
  const [category, setCategory] = useState(predefinedCategories[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const resetForm = () => {
    setEditingId(null);
    setDate(todayStr());
    setDesc('');
    setAmount('');
    setCategory(predefinedCategories[0]);
    setCustomCategory('');
    setIsFormOpen(false);
  };

  const handleEditClick = (ex: Expense) => {
    setEditingId(ex.id);
    setDate(ex.date);
    setDesc(ex.desc);
    setAmount(String(ex.amount));
    
    const cat = ex.category || predefinedCategories[0];
    if (predefinedCategories.includes(cat)) {
      setCategory(cat);
      setCustomCategory('');
    } else {
      setCategory('CUSTOM');
      setCustomCategory(cat);
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !desc.trim() || !amount) return;

    const finalCategory = category === 'CUSTOM' ? (customCategory.trim() || 'General') : category;

    const payload = {
      date,
      desc: desc.trim(),
      amount: Number(amount) || 0,
      category: finalCategory,
    };

    if (editingId) {
      onUpdateExpense(editingId, payload);
    } else {
      onAddExpense(payload);
    }

    resetForm();
  };

  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  // Get list of all existing unique categories for filter tabs
  const existingCategories = Array.from(
    new Set(safeExpenses.map((ex) => ex.category || 'General').filter(Boolean))
  );

  const filteredExpenses = safeExpenses
    .filter((ex) => {
      if (!ex || !ex.date) return false;
      const parts = ex.date.split('-');
      const matchY = selectedYear === 'all' || parts[0] === selectedYear;
      const matchM = selectedMonth === 'all' || parts[1] === selectedMonth;

      if (!matchY || !matchM) return false;

      const exCategory = ex.category || 'General';
      if (selectedCategoryFilter !== 'all' && exCategory !== selectedCategoryFilter) {
        return false;
      }

      return matchesQuery(searchQuery, [ex.desc, ex.amount, ex.date, ex.category]);
    })
    .sort((a, b) => {
      const dateCmp = (b.date || '').localeCompare(a.date || '');
      if (dateCmp !== 0) return dateCmp;
      return (a.desc || '').localeCompare(b.desc || '');
    });

  const totalExpenseSum = filteredExpenses.reduce((acc, ex) => acc + (ex.amount || 0), 0);

  const formatCurrency = (val: number) => `${t.currencySymbol}${val.toLocaleString()}`;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 mb-6 shadow-sm">
      {/* Header Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#fdf0ed] dark:bg-slate-800 text-[#e0533c] dark:text-[#f87171] flex items-center justify-center font-bold text-base">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
              {t.expenseTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.expenseSubtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="no-print flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#e0533c] hover:bg-[#cb422d] text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
        >
          <Plus className={`w-4 h-4 transition-transform ${isFormOpen ? 'rotate-45' : ''}`} />
          <span className="hidden sm:inline">{editingId ? t.expUpdateBtn : t.expToggleLabel}</span>
        </button>
      </div>

      {/* Expandable Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 mb-5 space-y-4 no-print animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Date Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thExpDate} *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Expense Type / Category Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.thExpCategory} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {predefinedCategories.map((catOption) => (
                  <option key={catOption} value={catOption}>
                    {catOption}
                  </option>
                ))}
                <option value="CUSTOM">{t.optCustomCategory}</option>
              </select>
            </div>

            {/* Custom Category Field (if selected) */}
            {category === 'CUSTOM' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.expCategoryLbl} *
                </label>
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder={t.customCategoryPh}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : null}

            {/* Description Field */}
            <div className={category === 'CUSTOM' ? '' : 'sm:col-span-1'}>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thExpDesc} *</label>
              <input
                type="text"
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={t.expDescPh}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Amount Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thExpAmt} *</label>
              <input
                type="number"
                required
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t.expAmtPh}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="px-4 py-1.5 rounded-lg bg-[#e0533c] hover:bg-[#cb422d] text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
            >
              {editingId ? t.expUpdateBtn : t.expSubmitBtn}
            </button>
          </div>
        </form>
      )}

      {/* Expense Type Category Filter Pills */}
      {existingCategories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 no-print scrollbar-none border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold pr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.thExpCategory}:</span>
          </div>

          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              selectedCategoryFilter === 'all'
                ? 'bg-[#e0533c] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t.expCategoryAll}
          </button>

          {existingCategories.map((cat) => {
            const count = safeExpenses.filter((e) => (e.category || 'General') === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  selectedCategoryFilter === cat
                    ? 'bg-[#e0533c] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  selectedCategoryFilter === cat ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Expenses Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="p-3">{t.thExpDate}</th>
              <th className="p-3">{t.thExpCategory}</th>
              <th className="p-3">{t.thExpDesc}</th>
              <th className="p-3">{t.thExpAmt}</th>
              <th className="p-3 no-print text-right">{t.thExpAct}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400 font-bold">
                  {t.noData}
                </td>
              </tr>
            ) : (
              filteredExpenses.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-mono text-xs text-slate-500 whitespace-nowrap">{ex.date}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
                      <Tag className="w-3 h-3 text-indigo-500" />
                      {ex.category || 'General'}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{ex.desc}</td>
                  <td className="p-3 font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                    -{formatCurrency(ex.amount)}
                  </td>
                  <td className="p-3 no-print text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEditClick(ex)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={t.edit}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t.deleteConfirm)) onDeleteExpense(ex.id);
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

          {filteredExpenses.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/90 font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
                <td className="p-3" colSpan={2}>
                  {t.totalRow} ({filteredExpenses.length})
                  {selectedCategoryFilter !== 'all' ? ` • ${selectedCategoryFilter}` : ''}
                </td>
                <td className="p-3">-</td>
                <td className="p-3 text-rose-600 dark:text-rose-400">-{formatCurrency(totalExpenseSum)}</td>
                <td className="p-3 no-print"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
