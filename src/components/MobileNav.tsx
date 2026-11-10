import React from 'react';
import { TabType, Language } from '../types';

interface MobileNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  language: Language;
  unpaidCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  language,
  unpaidCount,
}) => {
  const tabs: {
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
      labelEn: 'Rent',
      labelBn: 'ভাড়া',
      icon: <i className="fi fi-sr-money-bill-wave text-base" />,
    },
    {
      id: 'unpaid',
      labelEn: 'Dues',
      labelBn: 'বকেয়া',
      icon: <i className="fi fi-sr-triangle-warning text-base" />,
      badge: unpaidCount > 0 ? unpaidCount : undefined,
    },
    {
      id: 'expense',
      labelEn: 'Expenses',
      labelBn: 'খরচ',
      icon: <i className="fi fi-sr-receipt text-base" />,
    },
    {
      id: 'dokan',
      labelEn: 'Shop',
      labelBn: 'দোকান',
      icon: <i className="fi fi-sr-shop text-base" />,
    },
    {
      id: 'analytics',
      labelEn: 'Chart',
      labelBn: 'অ্যানালিটিক্স',
      icon: <i className="fi fi-sr-chart-line-up text-base" />,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe no-print">
      <div className="flex items-center overflow-x-auto scrollbar-none px-1.5 py-1.5 gap-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isUnpaidTab = tab.id === 'unpaid' && (tab.badge || 0) > 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[66px] px-2 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative mb-0.5">{tab.icon}</div>
              <span
                className={`text-[10px] font-semibold truncate w-full text-center ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : ''
                }`}
              >
                {language === 'bn' ? tab.labelBn : tab.labelEn}
                {tab.badge !== undefined && (
                  <span
                    className={`ml-0.5 font-mono tabular-nums font-bold ${
                      isUnpaidTab ? 'text-rose-600 dark:text-rose-400' : ''
                    }`}
                  >
                    ({tab.badge})
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
