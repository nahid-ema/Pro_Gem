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

  const navItems: { id: TabType; labelEn: string; labelBn: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'brief', labelEn: 'Summary', labelBn: 'সারসংক্ষেপ', icon: <i className="fi fi-sr-chart-histogram text-lg" /> },
    { id: 'rooms', labelEn: 'Rooms', labelBn: 'রুমসমূহ', icon: <i className="fi fi-sr-door-closed text-lg" /> },
    { id: 'tenants', labelEn: 'Tenants', labelBn: 'ভাড়াটিয়া', icon: <i className="fi fi-sr-users text-lg" /> },
    { id: 'rent', labelEn: 'Rent Collection', labelBn: 'ভাড়া আদায়', icon: <i className="fi fi-sr-money-bill-wave text-lg" /> },
    { id: 'unpaid', labelEn: 'Unpaid Dues', labelBn: 'বকেয়া হিসাব', icon: <i className="fi fi-sr-triangle-warning text-lg" />, badge: unpaidCount > 0 ? unpaidCount : undefined },
    { id: 'expense', labelEn: 'Expenses', labelBn: 'খরচসমূহ', icon: <i className="fi fi-sr-receipt text-lg" /> },
    { id: 'dokan', labelEn: 'Shop Dues', labelBn: 'দোকান বাকি', icon: <i className="fi fi-sr-shop text-lg" /> },
    { id: 'analytics', labelEn: 'Analytics', labelBn: 'অ্যানালিটিক্স', icon: <i className="fi fi-sr-chart-line-up text-lg" /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm z-40 no-print flex-shrink-0">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100 dark:border-slate-800/60">
        <Logo className="w-10 h-10" />
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            {t.appName}
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
            {language === 'bn' ? 'ম্যানেজমেন্ট সিস্টেম' : 'Property Management'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isUnpaidTab = item.id === 'unpaid' && (item.badge || 0) > 0;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.icon}
                </span>
                <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
              </div>
              
              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                  isUnpaidTab
                    ? 'bg-rose-500 text-white animate-pulse shadow-sm shadow-rose-500/20'
                    : isActive
                      ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
