import React from 'react';
import { TabType, Language } from '../types';
import { getTranslation } from '../data/translations';
import { Logo } from './Logo';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  language: Language;
  unpaidCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  language,
  unpaidCount,
}) => {
  const t = getTranslation(language);

  const navItems: {
    id: TabType;
    labelEn: string;
    labelBn: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: 'brief',
      labelEn: 'Summary',
      labelBn: 'সারসংক্ষেপ',
      icon: <i className="fi fi-sr-chart-histogram text-base" />,
    },
    {
      id: 'rooms',
      labelEn: 'Rooms',
      labelBn: 'রুমসমূহ',
      icon: <i className="fi fi-sr-door-closed text-base" />,
    },
    {
      id: 'tenants',
      labelEn: 'Tenants',
      labelBn: 'ভাড়াটিয়া',
      icon: <i className="fi fi-sr-users text-base" />,
    },
    {
      id: 'rent',
      labelEn: 'Rent Collection',
      labelBn: 'ভাড়া আদায়',
      icon: <i className="fi fi-sr-money-bill-wave text-base" />,
    },
    {
      id: 'unpaid',
      labelEn: 'Unpaid Dues',
      labelBn: 'বকেয়া হিসাব',
      icon: <i className="fi fi-sr-triangle-warning text-base" />,
      badge: unpaidCount > 0 ? unpaidCount : undefined,
    },
    {
      id: 'expense',
      labelEn: 'Expenses',
      labelBn: 'খরচসমূহ',
      icon: <i className="fi fi-sr-receipt text-base" />,
    },
    {
      id: 'dokan',
      labelEn: 'Shop Dues',
      labelBn: 'দোকান বাকি',
      icon: <i className="fi fi-sr-shop text-base" />,
    },
    {
      id: 'analytics',
      labelEn: 'Analytics',
      labelBn: 'অ্যানালিটিক্স',
      icon: <i className="fi fi-sr-chart-line-up text-base" />,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 no-print shrink-0">
      {/* Kalima & Brand Header */}
      <div className="px-5 pt-3.5 pb-4 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
        <p
          dir="rtl"
          className="text-center text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide pb-2 border-b border-slate-100 dark:border-slate-800/80"
        >
          لَا إِلَٰهَ إِلَّا ٱللَّٰهُ مُحَمَّدٌ رَسُولُ ٱللَّٰهِ
        </p>
        <div className="flex items-center gap-3 px-1">
          <Logo className="w-9 h-9" />
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
              {t.appName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {language === 'bn' ? 'প্রপার্টি ম্যানেজমেন্ট' : 'Property Management'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isUnpaidTab = item.id === 'unpaid' && (item.badge || 0) > 0;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`font-mono tabular-nums text-xs font-bold ${
                    isUnpaidTab
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  ({item.badge})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
