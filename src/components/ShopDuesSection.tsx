import React, { useState, useMemo } from 'react';
import { ShopDue, Language } from '../types';
import { getTranslation } from '../data/translations';
import { matchesQuery } from '../lib/search';
import { formatShortDate } from '../lib/dateUtils';

interface ShopDuesSectionProps {
  dokanDues: ShopDue[];
  shopNames?: string[];
  language: Language;
  searchQuery: string;
  selectedYear: string;
  selectedMonth: string;
  onAddDokanDue: (due: Omit<ShopDue, 'id'>) => void;
  onUpdateDokanDue: (id: string, due: Omit<ShopDue, 'id'>) => void;
  onDeleteDokanDue: (id: string) => void;
  onAddShopName?: (name: string) => void;
  onDeleteShopName?: (name: string) => void;
}

export const resolveShopName = (dk: ShopDue, lang: Language = 'bn'): string => {
  if (dk.shopName && dk.shopName.trim()) {
    return dk.shopName.trim();
  }
  const rawDesc = (dk.desc || '').trim();
  if (!rawDesc) {
    return lang === 'bn' ? 'সাধারণ দোকান' : 'General Shop';
  }
  if (
    rawDesc === 'সাইফুল' ||
    rawDesc.toLowerCase() === 'saiful' ||
    rawDesc.startsWith('সাইফুল')
  ) {
    return 'সাইফুল দোকান';
  }
  if (rawDesc.includes('—')) {
    return rawDesc.split('—')[0].trim();
  }
  return rawDesc;
};

export const ShopDuesSection: React.FC<ShopDuesSectionProps> = ({
  dokanDues,
  shopNames = [],
  language,
  searchQuery,
  selectedYear,
  selectedMonth,
  onAddDokanDue,
  onUpdateDokanDue,
  onDeleteDokanDue,
  onAddShopName,
  onDeleteShopName,
}) => {
  const t = getTranslation(language);

  const todayStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  const safeDokanDues = Array.isArray(dokanDues) ? dokanDues : [];

  // Combine saved shopNames with any shopName present in records
  const allShops = useMemo(() => {
    const set = new Set<string>();
    (Array.isArray(shopNames) ? shopNames : []).forEach((s) => {
      if (s && s.trim()) set.add(s.trim());
    });
    safeDokanDues.forEach((dk) => {
      if (dk) {
        const resolved = resolveShopName(dk, language);
        if (resolved) set.add(resolved);
      }
    });
    if (set.size === 0) {
      set.add('সাইফুল দোকান');
    }
    return Array.from(set);
  }, [shopNames, safeDokanDues, language]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [date, setDate] = useState(todayStr());
  const [selectedShop, setSelectedShop] = useState<string>(() => allShops[0] || 'সাইফুল দোকান');
  const [newShopInput, setNewShopInput] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedShopFilter, setSelectedShopFilter] = useState<string>('all');

  const resetForm = () => {
    setEditingId(null);
    setDate(todayStr());
    setSelectedShop(allShops[0] || 'সাইফুল দোকান');
    setNewShopInput('');
    setDesc('');
    setAmount('');
    setIsFormOpen(false);
  };

  const handleEditClick = (dk: ShopDue) => {
    setEditingId(dk.id);
    setDate(dk.date);
    const resolvedShop = resolveShopName(dk, language);
    if (allShops.includes(resolvedShop)) {
      setSelectedShop(resolvedShop);
      setNewShopInput('');
    } else {
      setSelectedShop('__NEW__');
      setNewShopInput(resolvedShop);
    }
    setDesc(dk.desc);
    setAmount(String(dk.amount));
    setIsFormOpen(true);
  };

  const handleQuickAddShopInForm = () => {
    const trimmed = newShopInput.trim();
    if (!trimmed) return;
    onAddShopName?.(trimmed);
    setSelectedShop(trimmed);
    setNewShopInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalShopName =
      selectedShop === '__NEW__' ? newShopInput.trim() : selectedShop.trim();

    if (!date || !finalShopName || !amount) return;

    // Save the shop name if it is newly entered
    if (!allShops.includes(finalShopName)) {
      onAddShopName?.(finalShopName);
    }

    const finalDesc = desc.trim() || finalShopName;

    const payload: Omit<ShopDue, 'id'> = {
      date,
      shopName: finalShopName,
      desc: finalDesc,
      amount: Number(amount) || 0,
    };

    if (editingId) {
      onUpdateDokanDue(editingId, payload);
    } else {
      onAddDokanDue(payload);
    }

    resetForm();
  };

  // Period-filtered shop dues (before shop filter)
  const periodDokan = useMemo(() => {
    return safeDokanDues.filter((dk) => {
      if (!dk || !dk.date) return false;
      const parts = dk.date.split('-');
      const matchY = selectedYear === 'all' || parts[0] === selectedYear;
      const matchM = selectedMonth === 'all' || parts[1] === selectedMonth;

      if (!matchY || !matchM) return false;

      const sName = resolveShopName(dk, language);
      return matchesQuery(searchQuery, [dk.desc, dk.shopName, sName, dk.amount, dk.date]);
    });
  }, [safeDokanDues, selectedYear, selectedMonth, searchQuery, language]);

  // Shop summary stats for filter bar
  const shopFilterStats = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    // Include all saved shops so the user can see and filter by any added shop
    allShops.forEach((shop) => {
      map.set(shop, { count: 0, total: 0 });
    });
    periodDokan.forEach((dk) => {
      const sName = resolveShopName(dk, language);
      const prev = map.get(sName) || { count: 0, total: 0 };
      map.set(sName, {
        count: prev.count + 1,
        total: prev.total + (dk.amount || 0),
      });
    });
    return Array.from(map.entries());
  }, [allShops, periodDokan, language]);

  const filteredDokan = useMemo(() => {
    return periodDokan
      .filter((dk) => {
        if (selectedShopFilter === 'all') return true;
        return resolveShopName(dk, language) === selectedShopFilter;
      })
      .sort((a, b) => {
        const dateCmp = (b.date || '').localeCompare(a.date || '');
        if (dateCmp !== 0) return dateCmp;
        return (a.desc || '').localeCompare(b.desc || '');
      });
  }, [periodDokan, selectedShopFilter, language]);

  const totalDokanSum = filteredDokan.reduce((acc, dk) => acc + (dk.amount || 0), 0);

  const formatCurrency = (val: number) => {
    if (val < 0) {
      return `-${t.currencySymbol}${Math.abs(val).toLocaleString()}`;
    }
    return `${t.currencySymbol}${val.toLocaleString()}`;
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 mb-6 shadow-xs">
      {/* Header Title & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {t.dokanTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.dokanSubtitle}</p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className={`fi fi-sr-add transition-transform duration-200 ${isFormOpen ? 'rotate-45' : ''}`} />
            <span>{editingId ? t.dokanUpdateBtn : t.dokanToggleLabel}</span>
          </button>
        </div>
      </div>

      {/* Expandable Due Entry Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 space-y-4 no-print animate-fadeIn"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.thDokDate} *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {/* 2. Shopkeeper / Shop Name Select + Add New */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.dokanShopLbl || 'দোকানদার / দোকানের নাম'} *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedShop === '__NEW__') {
                      setSelectedShop(allShops[0] || 'সাইফুল দোকান');
                    } else {
                      setSelectedShop('__NEW__');
                    }
                  }}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {selectedShop === '__NEW__'
                    ? (language === 'bn' ? 'তালিকা থেকে বাছুন' : 'Select existing')
                    : (t.dokanAddShopBtn || '+ নতুন দোকান')}
                </button>
              </div>

              {selectedShop !== '__NEW__' ? (
                <select
                  value={selectedShop}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedShop(val);
                  }}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  {allShops.map((shop) => (
                    <option key={shop} value={shop}>
                      {shop}
                    </option>
                  ))}
                  <option value="__NEW__">
                    {t.optAddNewShop || '+ নতুন দোকানের নাম যোগ করুন...'}
                  </option>
                </select>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newShopInput}
                    onChange={(e) => setNewShopInput(e.target.value)}
                    placeholder={t.dokanNewShopPh || 'নতুন দোকানদার বা দোকানের নাম...'}
                    className="w-full px-3.5 py-2 rounded-lg border border-indigo-400 dark:border-indigo-500 bg-white dark:bg-slate-900 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  {newShopInput.trim() && (
                    <button
                      type="button"
                      onClick={handleQuickAddShopInForm}
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0 cursor-pointer"
                      title={t.dokanSaveShopBtn || 'দোকান যোগ করুন'}
                    >
                      {language === 'bn' ? 'সেভ' : 'Save'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3. Item / Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.thDokDesc}
              </label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={t.dokanDescPh}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {/* 4. Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.thDokAmt} *
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t.dokanAmtPh}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs md:text-sm font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
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
              {editingId ? t.dokanUpdateBtn : t.dokanSubmitBtn}
            </button>
          </div>
        </form>
      )}

      {/* Segmented Shopkeeper Filter Bar */}
      {shopFilterStats.length > 0 && (
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto mb-5 no-print scrollbar-none w-fit max-w-full">
          <button
            type="button"
            onClick={() => setSelectedShopFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer whitespace-nowrap ${
              selectedShopFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.dokanAllShops || 'সব দোকান'} ({periodDokan.length})
          </button>

          {shopFilterStats.map(([shopName, stats]) => (
            <button
              key={shopName}
              type="button"
              onClick={() => setSelectedShopFilter(shopName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedShopFilter === shopName
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{shopName}</span>
              <span className="text-[11px] font-mono tabular-nums text-amber-600 dark:text-amber-400 font-bold">
                {formatCurrency(stats.total)}
              </span>
              <span className="text-[10px] font-mono tabular-nums text-slate-400 dark:text-slate-500">
                ({stats.count})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs font-semibold border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-4">{t.thDokDate}</th>
              <th className="py-3 px-4">{t.thDokShop || 'দোকানদার / দোকান'}</th>
              <th className="py-3 px-4">{t.thDokDesc}</th>
              <th className="py-3 px-4 text-right">{t.thDokAmt}</th>
              <th className="py-3 px-4 no-print text-right">{t.thDokAct}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
            {filteredDokan.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">
                  {t.noData}
                </td>
              </tr>
            ) : (
              filteredDokan.map((dk) => {
                const sName = resolveShopName(dk, language);
                return (
                  <tr
                    key={dk.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatShortDate(dk.date, language)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {sName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {dk.desc}
                    </td>
                    <td
                      className={`py-3 px-4 font-mono tabular-nums font-bold text-right whitespace-nowrap ${
                        dk.amount < 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {formatCurrency(dk.amount)}
                    </td>
                    <td className="py-3 px-4 no-print text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditClick(dk)}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
                          title={t.edit}
                        >
                          <i className="fi fi-sr-edit text-xs" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t.deleteConfirm)) onDeleteDokanDue(dk.id);
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

          {filteredDokan.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
                <td className="py-3 px-4" colSpan={3}>
                  {t.totalRow} ({filteredDokan.length})
                  {selectedShopFilter !== 'all' ? ` · ${selectedShopFilter}` : ''}
                </td>
                <td className="py-3 px-4 text-amber-600 dark:text-amber-400 font-mono tabular-nums font-bold text-right whitespace-nowrap">
                  {formatCurrency(totalDokanSum)}
                </td>
                <td className="py-3 px-4 no-print"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
