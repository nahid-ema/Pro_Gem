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
    <div className="bg-[#F5F5F0] dark:bg-[#1A1A1A] border border-[#D6D0C4] dark:border-slate-800 rounded-sm md:rounded-sm p-5 md:p-6 mb-6 shadow-none">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#D6D0C4] dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#2563EB]/10 text-[#2563EB] dark:text-[#2563EB] flex items-center justify-center font-bold text-base">
            <i className="fi fi-sr-users" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
              {t.tenantTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.tenantSubtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="no-print flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs transition-colors shadow-none cursor-pointer"
        >
          <i className={`fi fi-sr-add transition-transform ${isFormOpen ? 'rotate-45' : ''}`} />
          <span className="hidden sm:inline">{editingId ? t.tenantUpdateBtn : t.tenantToggleLabel}</span>
        </button>
      </div>

      {/* Expandable Add/Edit Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-[#F9F9F8] dark:bg-[#222222] border border-[#D6D0C4] dark:border-slate-800 rounded-sm p-4 mb-5 space-y-4 no-print animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thName} *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.tNamePh}
                className="w-full px-3 py-2 rounded-sm border border-slate-300 dark:border-slate-700 bg-[#F5F5F0] dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thPhone} *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.tPhonePh}
                className="w-full px-3 py-2 rounded-sm border border-slate-300 dark:border-slate-700 bg-[#F5F5F0] dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thRoom} *</label>
              <select
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 rounded-sm border border-slate-300 dark:border-slate-700 bg-[#F5F5F0] dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thNid}</label>
              <input
                type="text"
                value={nid}
                onChange={(e) => setNid(e.target.value)}
                placeholder={t.tNidPh}
                className="w-full px-3 py-2 rounded-sm border border-slate-300 dark:border-slate-700 bg-[#F5F5F0] dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D6D0C4] dark:border-slate-800">
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-1.5 rounded-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-sm bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs shadow-none transition-colors cursor-pointer"
            >
              {editingId ? t.tenantUpdateBtn : t.tenantSubmitBtn}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-[#D6D0C4] dark:border-slate-800">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-transparent text-slate-900 dark:text-white uppercase text-[10px] font-black tracking-widest border-b-2 border-slate-900 dark:border-white">
              <th className="p-3">{t.thName}</th>
              <th className="p-3">{t.thPhone}</th>
              <th className="p-3">{t.thRoom}</th>
              <th className="p-3">{t.thNid}</th>
              <th className="p-3 no-print text-right">{t.thAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
            {filteredTenants.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400 font-bold">
                  {t.noData}
                </td>
              </tr>
            ) : (
              filteredTenants.map((tn) => (
                <tr key={tn.id} className="border-b border-[#E2DDCF] dark:border-slate-800/50 hover:bg-[#EBE7E0] dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {tn.name}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span>{tn.phone}</span>
                      <a
                        href={`tel:${tn.phone}`}
                        className="no-print p-1 rounded bg-[#E2DDCF] dark:bg-[#2A2A2A] text-indigo-600 hover:bg-slate-200 transition-colors"
                        title="Call Tenant"
                      >
                        <i className="fi fi-sr-phone-call text-xs" />
                      </a>
                      <a
                        href={`https://wa.me/${getCleanPhone(tn.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-print p-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-200 transition-colors"
                        title="Open WhatsApp"
                      >
                        <i className="fi fi-sr-comment text-xs" />
                      </a>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#E2DDCF] dark:bg-[#2A2A2A] text-slate-700 dark:text-slate-300 font-semibold text-xs border border-[#D6D0C4]/80 dark:border-slate-800">
                      {t.roomText}: {tn.room}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{tn.nid || '-'}</td>
                  <td className="p-3 no-print text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEditClick(tn)}
                        className="p-1.5 rounded-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-[#E2DDCF] dark:hover:bg-slate-800 transition-colors"
                        title={t.edit}
                      >
                        <i className="fi fi-sr-edit text-sm" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t.deleteConfirm)) onDeleteTenant(tn.id);
                        }}
                        className="p-1.5 rounded-sm text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-[#E2DDCF] dark:hover:bg-slate-800 transition-colors"
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
