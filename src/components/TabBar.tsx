import React from 'react';
import { TabType, Language } from '../types';
import { getTranslation } from '../data/translations';
import { 
  BarChart3, 
  DoorClosed, 
  Users, 
  Banknote, 
  AlertTriangle, 
  Receipt, 
  Store, 
  LineChart 
} from 'lucide-react';

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
    { id: 'brief', label: t.tabBrief, icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'rooms', label: t.tabRooms, icon: <DoorClosed className="w-4 h-4" />, badge: totalRoomsCount },
    { id: 'tenants', label: t.tabTenants, icon: <Users className="w-4 h-4" />, badge: totalTenantsCount },
    { id: 'rent', label: t.tabRent, icon: <Banknote className="w-4 h-4" /> },
    { id: 'unpaid', label: t.tabUnpaid, icon: <AlertTriangle className="w-4 h-4" />, badge: unpaidCount > 0 ? unpaidCount : undefined },
    { id: 'expense', label: t.tabExpense, icon: <Receipt className="w-4 h-4" /> },
    { id: 'dokan', label: t.tabDokan, icon: <Store className="w-4 h-4" /> },
    { id: 'analytics', label: t.tabAnalytics, icon: <LineChart className="w-4 h-4" /> },
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs md:text-sm whitespace-nowrap transition-colors border shrink-0 ${
              isActive
                ? 'bg-[#282A2C] dark:bg-[#F4C542] text-white dark:text-slate-900 border-[#282A2C] dark:border-[#F4C542] shadow-xs'
                : 'bg-white/80 backdrop-blur-xl dark:bg-[#1A1A1A]/80 text-slate-700 dark:text-slate-300 border-[#E8E6E1] dark:border-[#333333] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>

            {tab.badge !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                  isUnpaidTab
                    ? 'bg-rose-500 text-white animate-pulse'
                    : isActive
                    ? 'bg-white/20 text-white dark:bg-black/10 dark:text-slate-900'
                    : 'bg-[#F2F0EB] dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400'
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
