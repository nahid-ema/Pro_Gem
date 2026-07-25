import { Room, Tenant, RentRecord, Expense, ShopDue, BackupData } from '../types';
import { initialRooms, initialTenants, initialRentRecords, initialExpenses, initialShopDues } from '../data/sampleData';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch, getDocs } from 'firebase/firestore';

const STORAGE_KEYS = {
  ROOMS: 'nk_rooms_v3',
  TENANTS: 'nk_tenants_v3',
  RENTS: 'nk_rents_v3',
  EXPENSES: 'nk_expenses_v3',
  DOKAN: 'nk_dokan_v3',
  THEME: 'nk_theme_v2',
  LANG: 'nk_lang_v2',
  MINIMIZED: 'nk_minimized_cards',
  OWNER_EMAIL: 'nk_owner_email_v1',
};

// Safe LocalStorage handler for sandboxed environments
export function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data || data === 'undefined' || data === 'null') return fallback;
    const parsed = JSON.parse(data);
    if (parsed === null || parsed === undefined) return fallback;
    return parsed as T;
  } catch (e) {
    return fallback;
  }
}

export function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Ignore storage quota or iframe security error
  }
}

export function loadInitialData() {
  const rooms = safeGetItem<Room[]>(STORAGE_KEYS.ROOMS, initialRooms);
  const tenants = safeGetItem<Tenant[]>(STORAGE_KEYS.TENANTS, initialTenants);
  const rents = safeGetItem<RentRecord[]>(STORAGE_KEYS.RENTS, initialRentRecords);
  const expenses = safeGetItem<Expense[]>(STORAGE_KEYS.EXPENSES, initialExpenses);
  const dokan = safeGetItem<ShopDue[]>(STORAGE_KEYS.DOKAN, initialShopDues);

  return {
    rooms: Array.isArray(rooms) ? rooms : initialRooms,
    tenants: Array.isArray(tenants) ? tenants : initialTenants,
    rents: Array.isArray(rents) ? rents : initialRentRecords,
    expenses: Array.isArray(expenses) ? expenses : initialExpenses,
    dokan: Array.isArray(dokan) ? dokan : initialShopDues,
  };
}

export function exportBackupJSON(
  rooms: Room[],
  tenants: Tenant[],
  rents: RentRecord[],
  expenses: Expense[],
  dokan: ShopDue[]
) {
  const backup: BackupData = {
    rooms,
    tenants,
    rents,
    expenses,
    dokanBaki: dokan,
    exportDate: new Date().toISOString(),
    version: '2.0-react'
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute("download", `Nahid_Kutir_Backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  setTimeout(() => {
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  }, 100);
}

export function validateAndMergeBackup(
  importedData: any,
  currentRooms: Room[],
  currentTenants: Tenant[],
  currentRents: RentRecord[],
  currentExpenses: Expense[],
  currentDokan: ShopDue[]
): {
  mergedRooms: Room[];
  mergedTenants: Tenant[];
  mergedRents: RentRecord[];
  mergedExpenses: Expense[];
  mergedDokan: ShopDue[];
  addedCount: number;
  updatedCount: number;
  totalImportedCount: number;
} {
  if (!importedData || typeof importedData !== 'object') {
    throw new Error('Invalid JSON data format');
  }

  let addedCount = 0;
  let updatedCount = 0;
  let totalImportedCount = 0;

  function safeIdMatch(id1?: string, id2?: string) {
    return !!(id1 && id2 && String(id1).trim() === String(id2).trim());
  }

  // 1. Merge Rooms
  const importedRooms = Array.isArray(importedData.rooms)
    ? importedData.rooms
    : (Array.isArray(importedData.Rooms) ? importedData.Rooms : []);

  const newRooms = [...currentRooms];
  importedRooms.forEach((r: any) => {
    if (!r) return;
    totalImportedCount++;
    const roomNo = String(r.roomNo || '').trim();
    if (!roomNo) return;

    const existingIdx = newRooms.findIndex((x) =>
      safeIdMatch(x.id, r.id) || x.roomNo.trim().toLowerCase() === roomNo.toLowerCase()
    );

    const roomObj: Room = {
      id: r.id || (existingIdx !== -1 ? newRooms[existingIdx].id : `room-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
      roomNo,
      rentAmount: Number(r.rentAmount) || 0,
      gasBill: Number(r.gasBill) || 0,
      waterBill: Number(r.waterBill) || 0,
      wasteBill: Number(r.wasteBill) || 0,
      meterNo: String(r.meterNo || '0'),
    };

    if (existingIdx !== -1) {
      newRooms[existingIdx] = roomObj;
      updatedCount++;
    } else {
      newRooms.push(roomObj);
      addedCount++;
    }
  });

  // 2. Merge Tenants
  const importedTenants = Array.isArray(importedData.tenants)
    ? importedData.tenants
    : (Array.isArray(importedData.Tenants) ? importedData.Tenants : []);

  const newTenants = [...currentTenants];
  importedTenants.forEach((t: any) => {
    if (!t) return;
    totalImportedCount++;
    const name = String(t.name || '').trim();
    const room = String(t.room || '').trim();
    if (!name) return;

    const existingIdx = newTenants.findIndex((x) =>
      safeIdMatch(x.id, t.id) || (x.name.trim().toLowerCase() === name.toLowerCase() && x.room.trim().toLowerCase() === room.toLowerCase())
    );

    const tenantObj: Tenant = {
      id: t.id || (existingIdx !== -1 ? newTenants[existingIdx].id : `tenant-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
      name,
      room,
      phone: String(t.phone || '0'),
      nid: String(t.nid || '0'),
    };

    if (existingIdx !== -1) {
      newTenants[existingIdx] = tenantObj;
      updatedCount++;
    } else {
      newTenants.push(tenantObj);
      addedCount++;
    }
  });

  // 3. Merge Rents
  const importedRents = Array.isArray(importedData.rents)
    ? importedData.rents
    : (Array.isArray(importedData.rentRecords) ? importedData.rentRecords : (Array.isArray(importedData.Rents) ? importedData.Rents : []));

  const newRents = [...currentRents];
  importedRents.forEach((rt: any) => {
    if (!rt) return;
    totalImportedCount++;
    const date = String(rt.date || '').trim();
    const tenant = String(rt.tenant || '').trim();
    const room = String(rt.room || '').trim();
    if (!date || !tenant) return;

    const rentVal = Number(rt.rent) || 0;
    const paidVal = Number(rt.paid) || 0;
    const dueVal = rt.due !== undefined ? Number(rt.due) : Math.max(0, rentVal - paidVal);

    const existingIdx = newRents.findIndex((x) =>
      safeIdMatch(x.id, rt.id) || (x.date === date && x.tenant.trim().toLowerCase() === tenant.toLowerCase() && x.room.trim().toLowerCase() === room.toLowerCase())
    );

    const rentObj: RentRecord = {
      id: rt.id || (existingIdx !== -1 ? newRents[existingIdx].id : `rent-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
      date,
      tenant,
      room,
      phone: String(rt.phone || '0'),
      rent: rentVal,
      paid: paidVal,
      due: dueVal,
      note: String(rt.note || ''),
    };

    if (existingIdx !== -1) {
      newRents[existingIdx] = rentObj;
      updatedCount++;
    } else {
      newRents.push(rentObj);
      addedCount++;
    }
  });

  // 4. Merge Expenses
  const importedExpenses = Array.isArray(importedData.expenses)
    ? importedData.expenses
    : (Array.isArray(importedData.Expenses) ? importedData.Expenses : []);

  const newExpenses = [...currentExpenses];
  importedExpenses.forEach((ex: any) => {
    if (!ex) return;
    totalImportedCount++;
    const date = String(ex.date || '').trim();
    const desc = String(ex.desc || '').trim();
    const amount = Number(ex.amount) || 0;
    if (!date || !desc) return;

    const existingIdx = newExpenses.findIndex((x) =>
      safeIdMatch(x.id, ex.id) || (x.date === date && x.desc.trim().toLowerCase() === desc.toLowerCase() && x.amount === amount)
    );

    const expObj: Expense = {
      id: ex.id || (existingIdx !== -1 ? newExpenses[existingIdx].id : `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
      date,
      desc,
      amount,
      category: String(ex.category || 'General'),
    };

    if (existingIdx !== -1) {
      newExpenses[existingIdx] = expObj;
      updatedCount++;
    } else {
      newExpenses.push(expObj);
      addedCount++;
    }
  });

  // 5. Merge Shop Dues (dokanBaki / dokan / shopDues)
  const importedDokan = Array.isArray(importedData.dokanBaki)
    ? importedData.dokanBaki
    : (Array.isArray(importedData.dokan) ? importedData.dokan : (Array.isArray(importedData.shopDues) ? importedData.shopDues : []));

  const newDokan = [...currentDokan];
  importedDokan.forEach((dk: any) => {
    if (!dk) return;
    totalImportedCount++;
    const date = String(dk.date || '').trim();
    const desc = String(dk.desc || '').trim();
    const amount = Number(dk.amount) || 0;
    if (!date || !desc) return;

    const existingIdx = newDokan.findIndex((x) =>
      safeIdMatch(x.id, dk.id) || (x.date === date && x.desc.trim().toLowerCase() === desc.toLowerCase() && x.amount === amount)
    );

    const dokObj: ShopDue = {
      id: dk.id || (existingIdx !== -1 ? newDokan[existingIdx].id : `dok-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
      date,
      desc,
      amount,
      shopName: String(dk.shopName || ''),
    };

    if (existingIdx !== -1) {
      newDokan[existingIdx] = dokObj;
      updatedCount++;
    } else {
      newDokan.push(dokObj);
      addedCount++;
    }
  });

  return {
    mergedRooms: newRooms,
    mergedTenants: newTenants,
    mergedRents: newRents,
    mergedExpenses: newExpenses,
    mergedDokan: newDokan,
    addedCount,
    updatedCount,
    totalImportedCount,
  };
}

export { STORAGE_KEYS };
