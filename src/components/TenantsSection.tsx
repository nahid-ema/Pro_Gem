import React, { useState } from 'react';
import { Tenant, Room, Language } from '../types';
import { getTranslation } from '../data/translations';
import { Users, Plus, Edit2, Trash2, Phone, MessageSquare } from 'lucide-react';
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
    let clean = p.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '88' + clean;
    return clean;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 mb-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#fdf0ed] dark:bg-slate-800 text-[#e0533c] dark:text-[#f87171] flex items-center justify-center font-bold text-base">
            <Users className="w-4 h-4" />
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
          className="no-print flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#e0533c] hover:bg-[#cb422d] text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
        >
          <Plus className={`w-4 h-4 transition-transform ${isFormOpen ? 'rotate-45' : ''}`} />
          <span className="hidden sm:inline">{editingId ? t.tenantUpdateBtn : t.tenantToggleLabel}</span>
        </button>
      </div>

      {/* Expandable Add/Edit Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 mb-5 space-y-4 no-print animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thName} *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.tNamePh}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.thRoom} *</label>
              <select
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors"
            >
              {editingId ? t.tenantUpdateBtn : t.tenantSubmitBtn}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
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
                <tr key={tn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {tn.name}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span>{tn.phone}</span>
                      <a
                        href={`tel:${tn.phone}`}
                        className="no-print p-1 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 hover:bg-slate-200 transition-colors"
                        title="Call Tenant"
                      >
                        <Phone className="w-3 h-3" />
                      </a>
                      <a
                        href={`https://wa.me/${getCleanPhone(tn.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-print p-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-200 transition-colors"
                        title="Open WhatsApp"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700">
                      {t.roomText}: {tn.room}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-500">{tn.nid || '-'}</td>
                  <td className="p-3 no-print text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEditClick(tn)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={t.edit}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t.deleteConfirm)) onDeleteTenant(tn.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={t.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
