import React, { useState } from 'react';
import { Expense, Language } from '../types';
import { getTranslation } from '../data/translations';
import { matchesQuery } from '../lib/search';
import { autoDetectCategory } from '../lib/autoCategory';

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

export const formatCategory = (cat: string | undefined, lang: Language) => {
  if (!cat) return lang === 'bn' ? 'সাধারণ' : 'General';
  if (lang === 'bn') {
    if (cat === 'General') return 'সাধারণ';
    if (cat === 'Maintenance & Repair') return 'রক্ষণাবেক্ষণ ও মেরামত';
    if (cat === 'Utilities & Bills') return 'ইউটিলিটি ও বিল';
    if (cat === 'Painting & Renovation') return 'রং ও ডেকোরেশন';
    if (cat === 'Plumbing & Sanitary') return 'প্লাম্বিং ও সেনেটারি';
    if (cat === 'Electrical & Supplies') return 'ইলেকট্রিক ও সরঞ্জাম';
    if (cat === 'Groceries & Household') return 'বাজার ও কেনাকাটা';
    if (cat === 'Service Charge') return 'সার্ভিস চার্জ';
  } else {
    if (cat === 'সাধারণ') return 'General';
    if (cat === 'রক্ষণাবেক্ষণ ও মেরামত') return 'Maintenance & Repair';
    if (cat === 'ইউটিলিটি ও বিল') return 'Utilities & Bills';
    if (cat === 'রং ও ডেকোরেশন') return 'Painting & Renovation';
    if (cat === 'প্লাম্বিং ও সেনেটারি') return 'Plumbing & Sanitary';
    if (cat === 'ইলেকট্রিক ও সরঞ্জাম') return 'Electrical & Supplies';
    if (cat === 'বাজার ও কেনাকাটা') return 'Groceries & Household';
    if (cat === 'সার্ভিস চার্জ') return 'Service Charge';
  }
  return cat;
};

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
  const [userManuallySelectedCategory, setUserManuallySelectedCategory] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setDate(todayStr());
    setDesc('');
    setAmount('');
    setCategory(predefinedCategories[0]);
    setCustomCategory('');
    setUserManuallySelectedCategory(false);
    setIsFormOpen(false);
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDesc = e.target.value;
    setDesc(newDesc);
    
    if (!userManuallySelectedCategory) {
      const detected = autoDetectCategory(newDesc, language);
      if (detected) {
        if (predefinedCategories.includes(detected)) {
          setCategory(detected);
          setCustomCategory('');
        } else {
          setCategory('CUSTOM');
          setCustomCategory(detected);
        }
      }
    }
  };

  const handleEditClick = (ex: Expense) => {
    setEditingId(ex.id);
    setDate(ex.date);
    setDesc(ex.desc);
    setAmount(String(ex.amount));
    setUserManuallySelectedCategory(true);
    
    const cat = formatCategory(ex.category, language) || predefinedCategories[0];
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

  // Filter expenses by active time period (selectedYear and selectedMonth) and search query
  const periodExpenses = safeExpenses.filter((ex) => {
    if (!ex || !ex.date) return false;
    const parts = ex.date.split('-');
    const matchY = selectedYear === 'all' || parts[0] === selectedYear;
    const matchM = selectedMonth === 'all' || parts[1] === selectedMonth;

    if (!matchY || !matchM) return false;

    const formattedCat = formatCategory(ex.category, language);
    return matchesQuery(searchQuery, [ex.desc, ex.amount, ex.date, ex.category, formattedCat]);
  });

  // Get list of unique categories actually present in the filtered time period
  const existingCategories = Array.from(
    new Set(periodExpenses.map((ex) => formatCategory(ex.category, language)).filter(Boolean))
  );

  // Filter expenses by selected category pill
  const filteredExpenses = periodExpenses
    .filter((ex) => {
      if (selectedCategoryFilter === 'all') return true;
      const formattedCat = formatCategory(ex.category, language);
      return formattedCat === selectedCategoryFilter;
    })
    .sort((a, b) => {
      const dateCmp = (b.date || '').localeCompare(a.date || '');
      if (dateCmp !== 0) return dateCmp;
      return (a.desc || '').localeCompare(b.desc || '');
    });

  const totalExpenseSum = filteredExpenses.reduce((acc, ex) => acc + (ex.amount || 0), 0);

  const formatCurrency = (val: number) => `${t.currencySymbol}${val.toLocaleString()}`;

  return (
    <div className="rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-6 shadow-sm">
      {/* Header Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0 border border-blue-100 dark:border-blue-800/30">
            <i className="fi fi-sr-receipt" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.expenseTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t.expenseSubtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="no-print flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs transition-all active:scale-95 cursor-pointer"
        >
          <i className={`fi fi-sr-add transition-transform duration-200 ${isFormOpen ? 'rotate-45' : ''}`} />
          <span className="hidden sm:inline">{editingId ? t.expUpdateBtn : t.expToggleLabel}</span>
        </button>
      </div>

      {/* Expandable Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-[24px] p-5 mb-6 space-y-4 no-print animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.thExpDate} *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
              />
            </div>

            {/* Description Field */}
            <div className={category === 'CUSTOM' ? '' : 'sm:col-span-1'}>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.thExpDesc} *</label>
              <input
                type="text"
                required
                value={desc}
                onChange={handleDescChange}
                placeholder={t.expDescPh}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
              />
            </div>

            {/* Amount Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.thExpAmt} *</label>
              <input
                type="number"
                required
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t.expAmtPh}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
              />
            </div>

            {/* Expense Type / Category Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.thExpCategory} *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setUserManuallySelectedCategory(true);
                }}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.expCategoryLbl} *
                </label>
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder={t.customCategoryPh}
                  className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
                />
              </div>
            ) : null}
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
              {editingId ? t.expUpdateBtn : t.expSubmitBtn}
            </button>
          </div>
        </form>
      )}

      {/* Expense Type Category Filter Pills */}
      {existingCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 no-print scrollbar-none border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold pr-1 shrink-0">
            <i className="fi fi-sr-filter text-xs" />
            <span className="hidden sm:inline">{t.thExpCategory}:</span>
          </div>

          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
              selectedCategoryFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md scale-105'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700'
            }`}
          >
            {t.expCategoryAll}
          </button>

          {existingCategories.map((cat) => {
            const count = periodExpenses.filter((e) => formatCategory(e.category, language) === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  selectedCategoryFilter === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md scale-105'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  selectedCategoryFilter === cat ? 'bg-white/20 dark:bg-slate-900/20 text-current' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Expenses Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200 dark:border-slate-800">
              <th className="p-3.5 pl-4">{t.thExpDate}</th>
              <th className="p-3.5">{t.thExpDesc}</th>
              <th className="p-3.5 text-right">{t.thExpAmt}</th>
              <th className="p-3.5">{t.thExpCategory}</th>
              <th className="p-3.5 pr-4 no-print text-right">{t.thExpAct}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                  {t.noData}
                </td>
              </tr>
            ) : (
              filteredExpenses.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 pl-4 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{ex.date}</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{ex.desc}</td>
                  <td className="p-3.5 font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap text-right">
                    -{formatCurrency(ex.amount)}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {formatCategory(ex.category, language)}
                    </span>
                  </td>
                  <td className="p-3.5 pr-4 no-print text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEditClick(ex)}
                        className="p-2 rounded-full text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title={t.edit}
                      >
                        <i className="fi fi-sr-edit text-sm" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t.deleteConfirm)) onDeleteExpense(ex.id);
                        }}
                        className="p-2 rounded-full text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
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

          {filteredExpenses.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
                <td className="p-3.5 pl-4" colSpan={2}>
                  {t.totalRow} ({filteredExpenses.length})
                  {selectedCategoryFilter !== 'all' ? ` • ${selectedCategoryFilter}` : ''}
                </td>
                <td className="p-3.5 text-rose-600 dark:text-rose-400 font-mono font-extrabold text-right">-{formatCurrency(totalExpenseSum)}</td>
                <td className="p-3.5">-</td>
                <td className="p-3.5 pr-4 no-print"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
