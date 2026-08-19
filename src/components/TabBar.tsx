import React from 'react';
import { TabType, Language } from '../types';
import { getTranslation } from '../data/translations';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  language: Language;
  unpaidCount: number;
  totalRoomsCount: number;
  totalTenantsCount: number;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
  language,
  unpaidCount,
  totalRoomsCount,
  totalTenantsCount
}) => {
  const t = getTranslation(language);

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'brief', label: t.tabBrief, icon: <i className="fi fi-sr-chart-histogram text-sm" /> },
    { id: 'rooms', label: t.tabRooms, icon: <i className="fi fi-sr-door-closed text-sm" />, badge: totalRoomsCount },
    { id: 'tenants', label: t.tabTenants, icon: <i className="fi fi-sr-users text-sm" />, badge: totalTenantsCount },
    { id: 'rent', label: t.tabRent, icon: <i className="fi fi-sr-money-bill-wave text-sm" /> },
    { id: 'unpaid', label: t.tabUnpaid, icon: <i className="fi fi-sr-triangle-warning text-sm" />, badge: unpaidCount > 0 ? unpaidCount : undefined },
    { id: 'expense', label: t.tabExpense, icon: <i className="fi fi-sr-receipt text-sm" /> },
    { id: 'dokan', label: t.tabDokan, icon: <i className="fi fi-sr-shop text-sm" /> },
    { id: 'analytics', label: t.tabAnalytics, icon: <i className="fi fi-sr-chart-line-up text-sm" /> },
  ];

  return (
    <nav className="tab-bar flex items-center gap-1.5 p-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-none no-print mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isUnpaidTab = tab.id === 'unpaid' && unpaidCount > 0;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold text-xs md:text-sm whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer active:scale-95 ${
              isActive
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm scale-[1.02]'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span className={isActive ? 'text-[#2563EB] dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>

            {tab.badge !== undefined && (
              <span
                className={`ml-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                  isUnpaidTab
                    ? 'bg-rose-500 text-white animate-pulse'
                    : isActive
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

