export type Language = 'bn' | 'en';
export type Theme = 'light' | 'dark';
export type TabType = 'brief' | 'rooms' | 'tenants' | 'rent' | 'unpaid' | 'expense' | 'dokan' | 'analytics';

export interface Room {
  id: string;
  roomNo: string;
  rentAmount: number;
  gasBill: number;
  waterBill: number;
  wasteBill: number;
  meterNo: string;
  createdAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  room: string;
  nid: string;
  createdAt?: string;
}

export interface RentRecord {
  id: string;
  date: string; // YYYY-MM-DD
  tenant: string;
  phone: string;
  room: string;
  rent: number;
  paid: number;
  due: number;
  note?: string;
  createdAt?: string;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  desc: string;
  amount: number;
  category?: string;
  createdAt?: string;
}

export interface ShopDue {
  id: string;
  date: string; // YYYY-MM-DD
  desc: string;
  amount: number;
  shopName?: string;
  createdAt?: string;
}

export interface BackupData {
  rooms: Omit<Room, 'id'>[] | Room[];
  tenants: Omit<Tenant, 'id'>[] | Tenant[];
  rents: Omit<RentRecord, 'id'>[] | RentRecord[];
  expenses: Omit<Expense, 'id'>[] | Expense[];
  dokanBaki: Omit<ShopDue, 'id'>[] | ShopDue[];
  exportDate?: string;
  version?: string;
}

export interface UnpaidTenantItem {
  tenant: Tenant;
  room?: Room;
  estimatedDue: number;
  hasRecord: boolean;
  partiallyPaidAmount?: number;
}
