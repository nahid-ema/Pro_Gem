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
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  rents = [],
  expenses = [],
  dokanDues = [],
  language,
}) => {
  const t = getTranslation(language);

  const safeRents = Array.isArray(rents) ? rents : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeDokanDues = Array.isArray(dokanDues) ? dokanDues : [];

  // Group by Month (Jan-Dec) for current year
  const currentYear = new Date().getFullYear();

  const monthlyData = (t.months || []).map((monthName, idx) => {
    const monthKey = String(idx + 1).padStart(2, '0');

    // Filter rent records
    const monthRents = safeRents.filter((r) => {
      if (!r || !r.date) return false;
      const [y, m] = r.date.split('-');
      return y === String(currentYear) && m === monthKey;
    });

    const income = monthRents.reduce((acc, r) => acc + (r.paid || 0), 0);
    const expected = monthRents.reduce((acc, r) => acc + (r.rent || 0), 0);

    // Filter expenses
    const monthExp = safeExpenses.filter((ex) => {
      if (!ex || !ex.date) return false;
      const [y, m] = ex.date.split('-');
      return y === String(currentYear) && m === monthKey;
    }).reduce((acc, ex) => acc + (ex.amount || 0), 0);

    // Filter shop dues
    const monthDok = safeDokanDues.filter((dk) => {
      if (!dk || !dk.date) return false;
      const [y, m] = dk.date.split('-');
      return y === String(currentYear) && m === monthKey;
    }).reduce((acc, dk) => acc + (dk.amount || 0), 0);

    return {
      month: monthName.substring(0, 3),
      [language === 'bn' ? 'আদায় (Income)' : 'Income']: income,
      [language === 'bn' ? 'খরচ (Expenses)' : 'Expenses']: monthExp,
      [language === 'bn' ? 'দোকান বাকি (Shop Dues)' : 'Shop Dues']: monthDok,
      expected,
    };
  });

  // Calculate Distribution Pie Chart
  const totalIncome = safeRents.reduce((acc, r) => acc + (r.paid || 0), 0);
  const totalExpenses = safeExpenses.reduce((acc, ex) => acc + (ex.amount || 0), 0);
  const totalShopDues = safeDokanDues.reduce((acc, dk) => acc + (dk.amount || 0), 0);
  const totalDue = safeRents.reduce((acc, r) => acc + (r.due || 0), 0);

  const pieData = [
    { name: language === 'bn' ? 'আদায়কৃত টাকা' : 'Collected Income', value: totalIncome, color: '#10b981' },
    { name: language === 'bn' ? 'অনাদায়ী বকেয়া' : 'Outstanding Due', value: totalDue, color: '#ef4444' },
    { name: language === 'bn' ? 'পরিচালনা খরচ' : 'Expenses', value: totalExpenses, color: '#3b82f6' },
    { name: language === 'bn' ? 'দোকান বাকি' : 'Shop Credit Dues', value: totalShopDues, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  const formatCurrency = (val: number) => `${t.currencySymbol}${val.toLocaleString()}`;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 mb-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
          <LineChartIcon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
            {t.analyticsTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.analyticsSubtitle} ({currentYear})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expense Bar Chart */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.chartIncomeVsExpense} ({currentYear})
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
    </div>
  );
};
