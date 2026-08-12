import React, { useState } from 'react';
import { Tenant, Room, Language } from '../types';
import { getTranslation } from '../data/translations';
import { matchesQuery } from '../lib/search';

interface TenantsSectionProps {
  tenants: Tenant[];
  rooms: Room[];
  language: Language;
  searchQuery: string;
  onAddTenant: (tenant: Omit<Tenant, 'id'>) => void;
  onUpdateTenant: (id: string, tenant: Omit<Tenant, 'id'>) => void;
  onDeleteTenant: (id: string) => void;
}

export const TenantsSection: React.FC<TenantsSectionProps> = ({
  tenants,
  rooms,
  language,
  searchQuery,
  onAddTenant,
  onUpdateTenant,
  onDeleteTenant,
}) => {
  const t = getTranslation(language);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [room, setRoom] = useState('');
  const [nid, setNid] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setRoom('');
    setNid('');
    setIsFormOpen(false);
  };

  const handleEditClick = (tn: Tenant) => {
    setEditingId(tn.id);
    setName(tn.name);
    setPhone(tn.phone);
    setRoom(tn.room);
    setNid(tn.nid || '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !room.trim()) return;

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      room: room.trim(),
      nid: nid.trim(),
    };

    if (editingId) {
      onUpdateTenant(editingId, payload);
    } else {
      onAddTenant(payload);
    }

    resetForm();
  };

  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeRooms = Array.isArray(rooms) ? rooms : [];

  const filteredTenants = safeTenants
    .filter((tn) => {
      if (!tn) return false;
      return matchesQuery(searchQuery, [
        tn.name,
        tn.phone,
        tn.room,
        tn.nid,
        tn.advance,
        tn.address,
        tn.occupation,
      ]);
    })
    .sort((a, b) => (a.room || '').localeCompare(b.room || '', undefined, { numeric: true }));

  const getCleanPhone = (p: string) => {
    let clean = (p || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '88' + clean;
    return clean;
  };

  return (
    <div className="rounded-[32px] bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/80 dark:border-white/10 p-6 sm:p-8 mb-6 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.3)]">
      {/* Title */}
      <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-sm">
            <i className="fi fi-sr-users" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.tenantTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t.tenantSubtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="no-print flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <i className={`fi fi-sr-add transition-transform duration-200 ${isFormOpen ? 'rotate-45' : ''}`} />
          <span className="hidden sm:inline">{editingId ? t.tenantUpdateBtn : t.tenantToggleLabel}</span>
        </button>
      </div>

      {/* Expandable Add/Edit Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-[24px] p-5 mb-6 space-y-4 no-print animate-fadeIn shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.thName} *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.tNamePh}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.thPhone} *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.tPhonePh}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.thRoom} *</label>
              <select
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
              >
                <option value="">{t.tRoomPh}</option>
                {safeRooms.map((rm) => (
                  <option key={rm.id} value={rm.roomNo}>
                    {rm.roomNo} ({t.currencySymbol}{rm.rentAmount})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.thNid}</label>
              <input
                type="text"
                value={nid}
                onChange={(e) => setNid(e.target.value)}
                placeholder={t.tNidPh}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              {editingId ? t.tenantUpdateBtn : t.tenantSubmitBtn}
            </button>
          </div>
        </form>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-[24px] border border-white/80 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-900 dark:text-white uppercase text-[10px] font-black tracking-widest border-b border-slate-200 dark:border-slate-700">
              <th className="p-3.5 pl-4">{t.thName}</th>
              <th className="p-3.5">{t.thPhone}</th>
              <th className="p-3.5">{t.thRoom}</th>
              <th className="p-3.5">{t.thNid}</th>
              <th className="p-3.5 pr-4 no-print text-right">{t.thAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
            {filteredTenants.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                  {t.noData}
                </td>
              </tr>
            ) : (
              filteredTenants.map((tn) => (
                <tr key={tn.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 pl-4 font-bold text-slate-900 dark:text-white">
                    {tn.name}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span>{tn.phone}</span>
                      <a
                        href={`tel:${tn.phone}`}
                        className="no-print p-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 hover:bg-indigo-100 transition-colors"
                        title="Call Tenant"
                      >
                        <i className="fi fi-sr-phone-call text-xs" />
                      </a>
                      <a
                        href={`https://wa.me/${getCleanPhone(tn.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-print p-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        title="Open WhatsApp"
                      >
                        <i className="fi fi-sr-comment text-xs" />
                      </a>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200/60 dark:border-slate-700">
                      {t.roomText}: {tn.room}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">{tn.nid || '-'}</td>
                  <td className="p-3.5 pr-4 no-print text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEditClick(tn)}
                        className="p-2 rounded-full text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={t.edit}
                      >
                        <i className="fi fi-sr-edit text-sm" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t.deleteConfirm)) onDeleteTenant(tn.id);
                        }}
                        className="p-2 rounded-full text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={t.delete}
                      >
                        <i className="fi fi-sr-trash text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
