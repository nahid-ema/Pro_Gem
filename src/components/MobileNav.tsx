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
  const tabs: { id: TabType; labelEn: string; labelBn: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'brief', labelEn: 'Summary', labelBn: 'সারসংক্ষেপ', icon: <i className="fi fi-sr-chart-histogram text-xl" /> },
    { id: 'rooms', labelEn: 'Rooms', labelBn: 'রুমসমূহ', icon: <i className="fi fi-sr-door-closed text-xl" /> },
    { id: 'tenants', labelEn: 'Tenants', labelBn: 'ভাড়াটিয়া', icon: <i className="fi fi-sr-users text-xl" /> },
    { id: 'rent', labelEn: 'Rent', labelBn: 'ভাড়া', icon: <i className="fi fi-sr-money-bill-wave text-xl" /> },
    { id: 'unpaid', labelEn: 'Dues', labelBn: 'বকেয়া', icon: <i className="fi fi-sr-triangle-warning text-xl" />, badge: unpaidCount > 0 ? unpaidCount : undefined },
    { id: 'expense', labelEn: 'Expenses', labelBn: 'খরচ', icon: <i className="fi fi-sr-receipt text-xl" /> },
    { id: 'dokan', labelEn: 'Shop', labelBn: 'দোকান', icon: <i className="fi fi-sr-shop text-xl" /> },
    { id: 'analytics', labelEn: 'Chart', labelBn: 'অ্যানালিটিক্স', icon: <i className="fi fi-sr-chart-line-up text-xl" /> },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe shadow-sm no-print">
      <div className="flex items-center overflow-x-auto scrollbar-none px-2 py-2 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isUnpaidTab = tab.id === 'unpaid' && (tab.badge || 0) > 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[72px] px-2 py-1.5 rounded-2xl transition-all cursor-pointer flex-shrink-0 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative mb-1">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className={`absolute -top-2 -right-3 px-1.5 py-0.5 text-[9px] font-black rounded-full flex items-center justify-center min-w-[18px] ${
                    isUnpaidTab
                      ? 'bg-rose-500 text-white animate-pulse shadow-sm'
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold truncate w-full text-center ${isActive ? 'text-blue-700 dark:text-blue-400' : ''}`}>
                {language === 'bn' ? tab.labelBn : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
