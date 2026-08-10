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
    <nav className="tab-bar flex gap-2 overflow-x-auto pb-2 mb-5 border-b border-[#E8E6E1] dark:border-[#333333] scrollbar-none no-print">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isUnpaidTab = tab.id === 'unpaid' && unpaidCount > 0;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all border shrink-0 cursor-pointer active:scale-95 ${
              isActive
                ? 'bg-black dark:bg-white text-white dark:text-slate-900 border-[#0EA5E9] shadow-sm font-bold'
                : 'bg-white dark:bg-[#1A1A1A]/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-[#333333] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className={isActive ? 'text-slate-900' : 'text-slate-500 dark:text-slate-400'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>

            {tab.badge !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                  isUnpaidTab
                    ? 'bg-rose-500 text-white animate-pulse'
                    : isActive
                    ? 'bg-black/10 text-slate-900'
                    : 'bg-slate-100 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400'
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
