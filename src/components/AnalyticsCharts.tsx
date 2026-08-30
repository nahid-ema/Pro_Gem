import React, { useState } from 'react';
import { RentRecord, Expense, ShopDue, Language } from '../types';
import { getTranslation } from '../data/translations';
import { formatCategory } from './ExpenseSection';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

interface AnalyticsChartsProps {
  rents: RentRecord[];
  expenses: Expense[];
  dokanDues: ShopDue[];
  language: Language;
  selectedYear?: string;
  selectedMonth?: string;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  rents = [],
  expenses = [],
  dokanDues = [],
  language,
  selectedYear = 'all',
  selectedMonth = 'all',
}) => {
  const [expenseSortBy, setExpenseSortBy] = useState<'amount' | 'date'>('amount');
  const t = getTranslation(language);

  const safeRents = Array.isArray(rents) ? rents : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeDokanDues = Array.isArray(dokanDues) ? dokanDues : [];

  // Determine active year for monthly comparison bar chart
  const activeYear = selectedYear !== 'all' ? selectedYear : String(new Date().getFullYear());

  // Filter records based on selectedYear and selectedMonth for overall distribution pie charts
  const filteredRents = safeRents.filter((r) => {
    if (!r || !r.date) return false;
    const [y, m] = r.date.split('-');
    const matchY = selectedYear === 'all' || y === selectedYear;
    const matchM = selectedMonth === 'all' || m === selectedMonth;
    return matchY && matchM;
  });

  const filteredExpenses = safeExpenses.filter((ex) => {
    if (!ex || !ex.date) return false;
    const [y, m] = ex.date.split('-');
    const matchY = selectedYear === 'all' || y === selectedYear;
    const matchM = selectedMonth === 'all' || m === selectedMonth;
    return matchY && matchM;
  });

  const filteredDokanDues = safeDokanDues.filter((dk) => {
    if (!dk || !dk.date) return false;
    const [y, m] = dk.date.split('-');
    const matchY = selectedYear === 'all' || y === selectedYear;
    const matchM = selectedMonth === 'all' || m === selectedMonth;
    return matchY && matchM;
  });

  // Group by Month (Jan-Dec) for activeYear
  const monthlyData = (t.months || []).map((monthName, idx) => {
    const monthKey = String(idx + 1).padStart(2, '0');

    // Filter rent records
    const monthRents = safeRents.filter((r) => {
      if (!r || !r.date) return false;
      const [y, m] = r.date.split('-');
      return y === activeYear && m === monthKey;
    });

    const income = monthRents.reduce((acc, r) => acc + (r.paid || 0), 0);
    const expected = monthRents.reduce((acc, r) => acc + (r.rent || 0), 0);

    // Filter expenses
    const monthExp = safeExpenses.filter((ex) => {
      if (!ex || !ex.date) return false;
      const [y, m] = ex.date.split('-');
      return y === activeYear && m === monthKey;
    }).reduce((acc, ex) => acc + (ex.amount || 0), 0);

    // Filter shop dues
    const monthDok = safeDokanDues.filter((dk) => {
      if (!dk || !dk.date) return false;
      const [y, m] = dk.date.split('-');
      return y === activeYear && m === monthKey;
    }).reduce((acc, dk) => acc + (dk.amount || 0), 0);

    return {
      month: monthName.substring(0, 3),
      [language === 'bn' ? 'আদায় (Income)' : 'Income']: income,
      [language === 'bn' ? 'খরচ (Expenses)' : 'Expenses']: monthExp,
      [language === 'bn' ? 'দোকান বাকি (Shop Dues)' : 'Shop Dues']: monthDok,
      expected,
    };
  });

  // Calculate Distribution Pie Chart (respecting active filter)
  const totalIncome = filteredRents.reduce((acc, r) => acc + (r.paid || 0), 0);
  const totalExpenses = filteredExpenses.reduce((acc, ex) => acc + (ex.amount || 0), 0);
  const totalShopDues = filteredDokanDues.reduce((acc, dk) => acc + (dk.amount || 0), 0);
  const totalDue = filteredRents.reduce((acc, r) => acc + (r.due || 0), 0);

  const pieData = [
    { name: language === 'bn' ? 'আদায়কৃত টাকা' : 'Collected Income', value: totalIncome, color: '#10b981' },
    { name: language === 'bn' ? 'অনাদায়ী বকেয়া' : 'Outstanding Due', value: totalDue, color: '#ef4444' },
    { name: language === 'bn' ? 'পরিচালনা খরচ' : 'Expenses', value: totalExpenses, color: '#3b82f6' },
    { name: language === 'bn' ? 'দোকান বাকি' : 'Shop Credit Dues', value: totalShopDues, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  // Calculate Expense Categories Breakdown (respecting active filter)
  const categoryMap = new Map<string, number>();
  filteredExpenses.forEach((ex) => {
    const cat = formatCategory(ex.category, language);
    const prev = categoryMap.get(cat) || 0;
    categoryMap.set(cat, prev + (ex.amount || 0));
  });

  const categoryColors = ['#6366f1', '#ec4899', '#14b8a6', '#2563EB', '#8b5cf6', '#06b6d4', '#eab308', '#3b82f6', '#a855f7'];

  const expenseCategoryData = Array.from(categoryMap.entries())
    .map(([name, value], idx) => ({
      name,
      value,
      color: categoryColors[idx % categoryColors.length],
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const formatCurrency = (val: number) => `${t.currencySymbol}${val.toLocaleString()}`;

  // Format label for active period display
  const periodLabel = `${selectedYear !== 'all' ? selectedYear : (language === 'bn' ? 'সকল বছর' : 'All Years')} ${selectedMonth !== 'all' ? (t.months ? t.months[parseInt(selectedMonth, 10) - 1] : selectedMonth) : ''}`.trim();

  return (
    <div className="rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-6 shadow-sm space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0 border border-blue-100 dark:border-blue-800/30">
          <i className="fi fi-sr-chart-line-up text-lg" />
        </div>
        <div>
          <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.analyticsTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t.analyticsSubtitle} ({periodLabel})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expense Bar Chart */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <i className="fi fi-sr-arrow-trend-up text-base text-[#2563EB] dark:text-blue-400" />
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {t.chartIncomeVsExpense} ({activeYear})
            </h4>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                />
                <Bar dataKey={language === 'bn' ? 'আদায় (Income)' : 'Income'} fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey={language === 'bn' ? 'খরচ (Expenses)' : 'Expenses'} fill="#f43f5e" radius={[8, 8, 0, 0]} />
                <Bar dataKey={language === 'bn' ? 'দোকান বাকি (Shop Dues)' : 'Shop Dues'} fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Breakdown Pie Chart */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <i className="fi fi-sr-chart-pie text-base text-[#2563EB] dark:text-blue-400" />
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {language === 'bn' ? 'অর্থসংস্থানের সার্বিক বন্টন' : 'Overall Financial Breakdown'}
            </h4>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expense Type / Category Breakdown Chart */}
      {expenseCategoryData.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fi fi-sr-chart-pie text-base text-[#2563EB] dark:text-blue-400" />
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {t.chartExpenseCategories} ({language === 'bn' ? 'খাতভিত্তিক খরচ' : 'Expense Category Breakdown'})
              </h4>
            </div>
            <span className="text-xs font-black text-rose-600 dark:text-rose-400 px-3 py-1 bg-rose-50 dark:bg-rose-900/30 rounded-full border border-rose-100 dark:border-rose-800/30">
              {formatCurrency(totalExpenses)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {expenseCategoryData.map((entry, index) => (
                      <Cell key={`cat-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 'bold',
                    }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-2 scrollbar-none">
              {expenseCategoryData.map((catItem) => {
                const pct = totalExpenses > 0 ? ((catItem.value / totalExpenses) * 100).toFixed(1) : '0';
                return (
                  <div key={catItem.name} className="flex items-center justify-between text-xs p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0 pl-1">
                      <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: catItem.color }} />
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{catItem.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pr-1">
                      <span className="font-black text-slate-900 dark:text-white">{formatCurrency(catItem.value)}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Expenses Ledger */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fi fi-sr-clipboard-list text-slate-400" />
                {language === 'bn' ? 'বিস্তারিত খরচের তালিকা' : 'Detailed Expense List'}
              </h4>
              <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  onClick={() => setExpenseSortBy('amount')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    expenseSortBy === 'amount'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {language === 'bn' ? 'সর্বোচ্চ খরচ' : 'Highest Amount'}
                </button>
                <button
                  onClick={() => setExpenseSortBy('date')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    expenseSortBy === 'date'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {language === 'bn' ? 'সাম্প্রতিক' : 'Recent First'}
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {filteredExpenses
                .slice()
                .sort((a, b) => {
                  if (expenseSortBy === 'amount') {
                    return (b.amount || 0) - (a.amount || 0);
                  }
                  return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
                })
                .slice(0, 10) // Show top 10 largest or most recent expenses
                .map((ex, idx) => (
                  <div key={ex.id || idx} className="flex items-start justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700/50">
                         {ex.category === 'electricity' ? <i className="fi fi-sr-bolt text-amber-500" /> : 
                          ex.category === 'water' ? <i className="fi fi-sr-raindrops text-blue-500" /> :
                          ex.category === 'gas' ? <i className="fi fi-sr-flame text-orange-500" /> :
                          ex.category === 'waste' ? <i className="fi fi-sr-trash text-slate-500" /> :
                          ex.category === 'wifi' ? <i className="fi fi-sr-wifi text-emerald-500" /> :
                          ex.category === 'cleaning' ? <i className="fi fi-sr-broom text-teal-500" /> :
                          ex.category === 'maintenance' ? <i className="fi fi-sr-tools text-slate-600 dark:text-slate-400" /> :
                          <i className="fi fi-sr-box text-slate-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatCategory(ex.category, language)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {ex.details || (language === 'bn' ? 'কোনো বিবরণ নেই' : 'No details provided')}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          <i className="fi fi-sr-calendar text-[8px] mr-1" />
                          {ex.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-rose-600 dark:text-rose-400">
                        -{formatCurrency(ex.amount || 0)}
                      </p>
                    </div>
                  </div>
              ))}
              
              {filteredExpenses.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-sm">
                  {language === 'bn' ? 'কোনো খরচের রেকর্ড পাওয়া যায়নি' : 'No expense records found'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
