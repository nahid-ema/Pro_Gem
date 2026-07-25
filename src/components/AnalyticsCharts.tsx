import React from 'react';
import { RentRecord, Expense, ShopDue, Language } from '../types';
import { getTranslation } from '../data/translations';
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
import { LineChart as LineChartIcon, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

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
    const cat = ex.category || 'General';
    const prev = categoryMap.get(cat) || 0;
    categoryMap.set(cat, prev + (ex.amount || 0));
  });

  const categoryColors = ['#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6', '#06b6d4', '#eab308', '#3b82f6', '#a855f7'];

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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 mb-6 shadow-sm space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-9 h-9 rounded-2xl bg-[#fdf0ed] dark:bg-slate-800 text-[#e0533c] dark:text-[#f87171] flex items-center justify-center font-bold text-base">
          <LineChartIcon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
            {t.analyticsTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.analyticsSubtitle} ({periodLabel})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expense Bar Chart */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.chartIncomeVsExpense} ({activeYear})
            </h4>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                />
                <Bar dataKey={language === 'bn' ? 'আদায় (Income)' : 'Income'} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey={language === 'bn' ? 'খরচ (Expenses)' : 'Expenses'} fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey={language === 'bn' ? 'দোকান বাকি (Shop Dues)' : 'Shop Dues'} fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Breakdown Pie Chart */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <PieChartIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
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
                  paddingAngle={4}
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
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expense Type / Category Breakdown Chart */}
      {expenseCategoryData.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#e0533c]" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t.chartExpenseCategories} ({language === 'bn' ? 'খাতভিত্তিক খরচ' : 'Expense Category Breakdown'})
              </h4>
            </div>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
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
                    paddingAngle={3}
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
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
              {expenseCategoryData.map((catItem) => {
                const pct = totalExpenses > 0 ? ((catItem.value / totalExpenses) * 100).toFixed(1) : '0';
                return (
                  <div key={catItem.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: catItem.color }} />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{catItem.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(catItem.value)}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
