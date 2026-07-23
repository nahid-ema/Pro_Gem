import React, { useState, useEffect, useMemo } from 'react';
import { 
  Language, 
  Theme, 
  TabType, 
  Room, 
  Tenant, 
  RentRecord, 
  Expense, 
  ShopDue, 
  UnpaidTenantItem 
} from './types';
import { 
  safeGetItem, 
  safeSetItem, 
  STORAGE_KEYS, 
  loadInitialData, 
  exportBackupJSON, 
  validateAndMergeBackup 
} from './lib/storage';
import { auth, db, isFirebaseInitialized } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { FilterBar } from './components/FilterBar';
import { BriefDashboard } from './components/BriefDashboard';
import { RoomsSection } from './components/RoomsSection';
import { TenantsSection } from './components/TenantsSection';
import { RentSection } from './components/RentSection';
import { UnpaidSection } from './components/UnpaidSection';
import { ExpenseSection } from './components/ExpenseSection';
import { ShopDuesSection } from './components/ShopDuesSection';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { ReceiptModal } from './components/ReceiptModal';
import { AuthModal } from './components/AuthModal';
import { Toast, ToastMessage } from './components/Toast';
import { initialRooms, initialTenants, initialRentRecords, initialExpenses, initialShopDues } from './data/sampleData';

export default function App() {
  // Application Settings State
  const [language, setLanguage] = useState<Language>(() => safeGetItem<Language>(STORAGE_KEYS.LANG, 'bn'));
  const [theme, setTheme] = useState<Theme>(() => safeGetItem<Theme>(STORAGE_KEYS.THEME, 'light'));
  const [activeTab, setActiveTab] = useState<TabType>('brief');

  // Filters State
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<string>(String(today.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState<string>(String(today.getMonth() + 1).padStart(2, '0'));
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core Data State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rents, setRents] = useState<RentRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dokanDues, setDokanDues] = useState<ShopDue[]>([]);

  // Auth & Modal States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [receiptRecord, setReceiptRecord] = useState<RentRecord | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: String(Date.now()), message, type });
  };

  // Initialize theme class on <body>
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-theme');
    }
    safeSetItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Save language preference
  useEffect(() => {
    safeSetItem(STORAGE_KEYS.LANG, language);
  }, [language]);

  // Load local data on boot
  useEffect(() => {
    const { rooms: r, tenants: t, rents: rt, expenses: e, dokan: d } = loadInitialData();
    setRooms(r);
    setTenants(t);
    setRents(rt);
    setExpenses(e);
    setDokanDues(d);
  }, []);

  // Save local data changes
  useEffect(() => { safeSetItem(STORAGE_KEYS.ROOMS, rooms); }, [rooms]);
  useEffect(() => { safeSetItem(STORAGE_KEYS.TENANTS, tenants); }, [tenants]);
  useEffect(() => { safeSetItem(STORAGE_KEYS.RENTS, rents); }, [rents]);
  useEffect(() => { safeSetItem(STORAGE_KEYS.EXPENSES, expenses); }, [expenses]);
  useEffect(() => { safeSetItem(STORAGE_KEYS.DOKAN, dokanDues); }, [dokanDues]);

  // Auth Listener
  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
      });
      return () => unsubscribe();
    }
  }, []);

  // Optional Firestore Live Sync if db is available
  useEffect(() => {
    if (!db || !isFirebaseInitialized) return;

    const unsubRooms = onSnapshot(collection(db, 'rooms'), (snap) => {
      if (!snap.empty) {
        const items: Room[] = [];
        snap.forEach((docSnap) => items.push({ id: docSnap.id, ...docSnap.data() } as Room));
        items.sort((a, b) => (a.roomNo || '').localeCompare(b.roomNo || '', undefined, { numeric: true }));
        setRooms(items);
      }
    }, () => {});

    const unsubTenants = onSnapshot(collection(db, 'tenants'), (snap) => {
      if (!snap.empty) {
        const items: Tenant[] = [];
        snap.forEach((docSnap) => items.push({ id: docSnap.id, ...docSnap.data() } as Tenant));
        items.sort((a, b) => (a.room || '').localeCompare(b.room || '', undefined, { numeric: true }));
        setTenants(items);
      }
    }, () => {});

    const unsubRents = onSnapshot(collection(db, 'rents'), (snap) => {
      if (!snap.empty) {
        const items: RentRecord[] = [];
        snap.forEach((docSnap) => items.push({ id: docSnap.id, ...docSnap.data() } as RentRecord));
        items.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        setRents(items);
      }
    }, () => {});

    const unsubExp = onSnapshot(collection(db, 'expenses'), (snap) => {
      if (!snap.empty) {
        const items: Expense[] = [];
        snap.forEach((docSnap) => items.push({ id: docSnap.id, ...docSnap.data() } as Expense));
        items.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        setExpenses(items);
      }
    }, () => {});

    const unsubDok = onSnapshot(collection(db, 'dokanBaki'), (snap) => {
      if (!snap.empty) {
        const items: ShopDue[] = [];
        snap.forEach((docSnap) => items.push({ id: docSnap.id, ...docSnap.data() } as ShopDue));
        items.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        setDokanDues(items);
      }
    }, () => {});

    return () => {
      unsubRooms();
      unsubTenants();
      unsubRents();
      unsubExp();
      unsubDok();
    };
  }, []);

  // Dynamically calculate available years from records
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    const thisYear = new Date().getFullYear();
    years.add(String(thisYear - 1));
    years.add(String(thisYear));
    years.add(String(thisYear + 1));

    [...(rents || []), ...(expenses || []), ...(dokanDues || [])].forEach((item) => {
      if (item && item.date) {
        const match = item.date.match(/^(\d{4})-/);
        if (match) years.add(match[1]);
      }
    });

    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [rents, expenses, dokanDues]);

  // Calculate Unpaid Tenants for Selected Period
  const unpaidTenantItems = useMemo<UnpaidTenantItem[]>(() => {
    const activeY = selectedYear === 'all' ? String(today.getFullYear()) : selectedYear;
    const activeM = selectedMonth === 'all' ? String(today.getMonth() + 1).padStart(2, '0') : selectedMonth;

    const roomDueMap = new Map<string, number>();
    const roomHasRecordMap = new Map<string, boolean>();

    (rents || [])
      .filter((r) => r && r.date && r.date.startsWith(`${activeY}-${activeM}`))
      .forEach((r) => {
        const key = (r.room || '').trim();
        roomHasRecordMap.set(key, true);
        const prev = roomDueMap.get(key) || 0;
        roomDueMap.set(key, prev + (r.due || 0));
      });

    const items: UnpaidTenantItem[] = [];

    (tenants || []).forEach((tn) => {
      if (!tn) return;
      const roomNoTrim = (tn.room || '').trim();
      const hasRecord = roomHasRecordMap.get(roomNoTrim) || false;
      const due = roomDueMap.get(roomNoTrim) || 0;

      if (!hasRecord || due > 0) {
        const matchedRoom = (rooms || []).find((r) => r && (r.roomNo || '').trim() === roomNoTrim);
        let estDue = due;

        if (!hasRecord) {
          if (matchedRoom) {
            estDue = (matchedRoom.rentAmount || 0) + (matchedRoom.gasBill || 0) + (matchedRoom.waterBill || 0) + (matchedRoom.wasteBill || 0);
          } else {
            estDue = 0;
          }
        }

        items.push({
          tenant: tn,
          room: matchedRoom,
          estimatedDue: estDue,
          hasRecord,
        });
      }
    });

    return items;
  }, [rents, tenants, rooms, selectedYear, selectedMonth]);

  // Executive Dashboard Totals
  const filteredRentsForTotals = useMemo(() => {
    return (rents || []).filter((rt) => {
      if (!rt || !rt.date) return false;
      const [y, m] = rt.date.split('-');
      const matchY = selectedYear === 'all' || y === selectedYear;
      const matchM = selectedMonth === 'all' || m === selectedMonth;
      return matchY && matchM;
    });
  }, [rents, selectedYear, selectedMonth]);

  const filteredExpensesForTotals = useMemo(() => {
    return (expenses || []).filter((ex) => {
      if (!ex || !ex.date) return false;
      const [y, m] = ex.date.split('-');
      const matchY = selectedYear === 'all' || y === selectedYear;
      const matchM = selectedMonth === 'all' || m === selectedMonth;
      return matchY && matchM;
    });
  }, [expenses, selectedYear, selectedMonth]);

  const filteredDokanForTotals = useMemo(() => {
    return (dokanDues || []).filter((dk) => {
      if (!dk || !dk.date) return false;
      const [y, m] = dk.date.split('-');
      const matchY = selectedYear === 'all' || y === selectedYear;
      const matchM = selectedMonth === 'all' || m === selectedMonth;
      return matchY && matchM;
    });
  }, [dokanDues, selectedYear, selectedMonth]);

  const totalCollectedIncome = filteredRentsForTotals.reduce((acc, r) => acc + (r.paid || 0), 0);
  const totalRecordedExpectedRent = filteredRentsForTotals.reduce((acc, r) => acc + (r.rent || 0), 0);

  // Expected capacity calculation from assigned tenants
  const totalTenantCapacity = (tenants || []).reduce((acc, tn) => {
    if (!tn) return acc;
    const rm = (rooms || []).find((r) => r && (r.roomNo || '').trim() === (tn.room || '').trim());
    if (rm) {
      return acc + ((rm.rentAmount || 0) + (rm.gasBill || 0) + (rm.waterBill || 0) + (rm.wasteBill || 0));
    }
    return acc;
  }, 0);

  const totalExpectedRent = (selectedMonth !== 'all' && selectedYear !== 'all')
    ? Math.max(totalRecordedExpectedRent, totalTenantCapacity)
    : totalRecordedExpectedRent;

  const totalOutstandingDue = Math.max(0, totalExpectedRent - totalCollectedIncome);
  const totalExpensesSum = filteredExpensesForTotals.reduce((acc, ex) => acc + (ex.amount || 0), 0);
  const totalShopDuesSum = filteredDokanForTotals.reduce((acc, dk) => acc + (dk.amount || 0), 0);
  const totalEntriesCount = filteredRentsForTotals.length + filteredExpensesForTotals.length + filteredDokanForTotals.length;

  // Handler Functions
  const handleAddRoom = async (roomData: Omit<Room, 'id'>) => {
    const newRoom: Room = { id: `room-${Date.now()}`, ...roomData };
    setRooms((prev) => [...prev, newRoom]);
    showToast(language === 'bn' ? 'রুম সফলভাবে যুক্ত করা হয়েছে!' : 'Room added successfully!');

    if (db) {
      try { await addDoc(collection(db, 'rooms'), roomData); } catch (e) {}
    }
  };

  const handleUpdateRoom = async (id: string, roomData: Omit<Room, 'id'>) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...roomData } : r)));
    showToast(language === 'bn' ? 'রুম আপডেট সম্পন্ন হয়েছে!' : 'Room updated successfully!');

    if (db) {
      try { await updateDoc(doc(db, 'rooms', id), roomData); } catch (e) {}
    }
  };

  const handleDeleteRoom = async (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    showToast(language === 'bn' ? 'রুম মুছে ফেলা হয়েছে!' : 'Room deleted.', 'info');

    if (db) {
      try { await deleteDoc(doc(db, 'rooms', id)); } catch (e) {}
    }
  };

  const handleAddTenant = async (tenantData: Omit<Tenant, 'id'>) => {
    const newTenant: Tenant = { id: `tenant-${Date.now()}`, ...tenantData };
    setTenants((prev) => [...prev, newTenant]);
    showToast(language === 'bn' ? 'ভাড়াটিয়া যুক্ত করা হয়েছে!' : 'Tenant registered successfully!');

    if (db) {
      try { await addDoc(collection(db, 'tenants'), tenantData); } catch (e) {}
    }
  };

  const handleUpdateTenant = async (id: string, tenantData: Omit<Tenant, 'id'>) => {
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, ...tenantData } : t)));
    showToast(language === 'bn' ? 'ভাড়াটিয়ার তথ্য আপডেট করা হয়েছে!' : 'Tenant profile updated!');

    if (db) {
      try { await updateDoc(doc(db, 'tenants', id), tenantData); } catch (e) {}
    }
  };

  const handleDeleteTenant = async (id: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== id));
    showToast(language === 'bn' ? 'ভাড়াটিয়া মুছে ফেলা হয়েছে!' : 'Tenant removed.', 'info');

    if (db) {
      try { await deleteDoc(doc(db, 'tenants', id)); } catch (e) {}
    }
  };

  const handleAddRent = async (rentData: Omit<RentRecord, 'id'>) => {
    const newRent: RentRecord = { id: `rent-${Date.now()}`, ...rentData };
    setRents((prev) => [...prev, newRent]);
    showToast(language === 'bn' ? 'ভাড়া আদায় এন্ট্রি সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Rent collection recorded!');

    if (db) {
      try { await addDoc(collection(db, 'rents'), rentData); } catch (e) {}
    }
  };

  const handleUpdateRent = async (id: string, rentData: Omit<RentRecord, 'id'>) => {
    setRents((prev) => prev.map((r) => (r.id === id ? { ...r, ...rentData } : r)));
    showToast(language === 'bn' ? 'ভাড়ার এন্ট্রি আপডেট করা হয়েছে!' : 'Rent record updated!');

    if (db) {
      try { await updateDoc(doc(db, 'rents', id), rentData); } catch (e) {}
    }
  };

  const handleDeleteRent = async (id: string) => {
    setRents((prev) => prev.filter((r) => r.id !== id));
    showToast(language === 'bn' ? 'ভাড়ার এন্ট্রি মুছে ফেলা হয়েছে!' : 'Rent record deleted.', 'info');

    if (db) {
      try { await deleteDoc(doc(db, 'rents', id)); } catch (e) {}
    }
  };

  const handleAddExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { id: `exp-${Date.now()}`, ...expenseData };
    setExpenses((prev) => [...prev, newExpense]);
    showToast(language === 'bn' ? 'খরচ রেকর্ড করা হয়েছে!' : 'Expense logged!');

    if (db) {
      try { await addDoc(collection(db, 'expenses'), expenseData); } catch (e) {}
    }
  };

  const handleUpdateExpense = async (id: string, expenseData: Omit<Expense, 'id'>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...expenseData } : e)));
    showToast(language === 'bn' ? 'খরচ আপডেট করা হয়েছে!' : 'Expense updated!');

    if (db) {
      try { await updateDoc(doc(db, 'expenses', id), expenseData); } catch (e) {}
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast(language === 'bn' ? 'খরচ মুছে ফেলা হয়েছে!' : 'Expense deleted.', 'info');

    if (db) {
      try { await deleteDoc(doc(db, 'expenses', id)); } catch (e) {}
    }
  };

  const handleAddDokanDue = async (dueData: Omit<ShopDue, 'id'>) => {
    const newDue: ShopDue = { id: `dok-${Date.now()}`, ...dueData };
    setDokanDues((prev) => [...prev, newDue]);
    showToast(language === 'bn' ? 'দোকান বাকি যোগ করা হয়েছে!' : 'Shop credit logged!');

    if (db) {
      try { await addDoc(collection(db, 'dokanBaki'), dueData); } catch (e) {}
    }
  };

  const handleUpdateDokanDue = async (id: string, dueData: Omit<ShopDue, 'id'>) => {
    setDokanDues((prev) => prev.map((d) => (d.id === id ? { ...d, ...dueData } : d)));
    showToast(language === 'bn' ? 'দোকান বাকি আপডেট করা হয়েছে!' : 'Shop credit updated!');

    if (db) {
      try { await updateDoc(doc(db, 'dokanBaki', id), dueData); } catch (e) {}
    }
  };

  const handleDeleteDokanDue = async (id: string) => {
    setDokanDues((prev) => prev.filter((d) => d.id !== id));
    showToast(language === 'bn' ? 'দোকান বাকি মুছে ফেলা হয়েছে!' : 'Shop credit deleted.', 'info');

    if (db) {
      try { await deleteDoc(doc(db, 'dokanBaki', id)); } catch (e) {}
    }
  };

  const handleQuickPay = (item: UnpaidTenantItem) => {
    setActiveTab('rent');
    showToast(
      language === 'bn'
        ? `ভাড়া ফর্ম প্রস্তুত: ${item.tenant.name}`
        : `Ready to record rent for ${item.tenant.name}`,
      'info'
    );
  };

  const handleTriggerBackup = () => {
    exportBackupJSON(rooms, tenants, rents, expenses, dokanDues);
    showToast(language === 'bn' ? 'ব্যাকআপ ফাইল ডাউনলোড হয়েছে!' : 'Backup JSON downloaded successfully!');
  };

  const handleTriggerRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content || !content.trim()) {
          showToast(language === 'bn' ? 'ফাইলটি খালি!' : 'File is empty!', 'error');
          return;
        }

        const json = JSON.parse(content);
        const {
          mergedRooms,
          mergedTenants,
          mergedRents,
          mergedExpenses,
          mergedDokan,
          addedCount,
          updatedCount,
          totalImportedCount
        } = validateAndMergeBackup(json, rooms, tenants, rents, expenses, dokanDues);

        if (totalImportedCount === 0) {
          showToast(
            language === 'bn'
              ? 'ফাইলের ফরম্যাট সঠিক নয় বা কোনো ডাটা পাওয়া যায়নি!'
              : 'Invalid file format or no data found!',
            'error'
          );
          return;
        }

        setRooms(mergedRooms);
        setTenants(mergedTenants);
        setRents(mergedRents);
        setExpenses(mergedExpenses);
        setDokanDues(mergedDokan);

        safeSetItem(STORAGE_KEYS.ROOMS, mergedRooms);
        safeSetItem(STORAGE_KEYS.TENANTS, mergedTenants);
        safeSetItem(STORAGE_KEYS.RENTS, mergedRents);
        safeSetItem(STORAGE_KEYS.EXPENSES, mergedExpenses);
        safeSetItem(STORAGE_KEYS.DOKAN, mergedDokan);

        const totalMerged = addedCount + updatedCount;
        showToast(
          language === 'bn'
            ? `রিস্টোর সম্পূর্ণ! ${totalMerged}টি ডাটা আপডেট/যুক্ত হয়েছে।`
            : `Restore complete! ${totalMerged} items processed (${addedCount} added, ${updatedCount} updated).`,
          'success'
        );
      } catch (err) {
        showToast(
          language === 'bn' ? 'সঠিক ব্যাকআপ JSON ফাইল নির্বাচন করুন!' : 'Invalid backup JSON file!',
          'error'
        );
      }
    };
    reader.readAsText(file);

    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handleLoadDemoData = () => {
    setRooms(initialRooms);
    setTenants(initialTenants);
    setRents(initialRentRecords);
    setExpenses(initialExpenses);
    setDokanDues(initialShopDues);
    showToast(language === 'bn' ? 'ডেমো ডাটা সফলভাবে লোড করা হয়েছে!' : 'Demo data loaded successfully!');
  };

  const handleResetData = () => {
    if (confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে সকল ডাটা মুছে ফেলতে চান?' : 'Are you sure you want to reset all data?')) {
      setRooms([]);
      setTenants([]);
      setRents([]);
      setExpenses([]);
      setDokanDues([]);
      showToast(language === 'bn' ? 'সকল ডাটা রিসেট করা হয়েছে।' : 'Data reset complete.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-3 md:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header
          language={language}
          theme={theme}
          onLanguageToggle={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
          onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onTriggerBackup={handleTriggerBackup}
          onTriggerRestore={handleTriggerRestore}
          onPrint={() => window.print()}
          onLoadDemoData={handleLoadDemoData}
          onResetData={handleResetData}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          userEmail={currentUser?.email}
          isFirebaseActive={isFirebaseInitialized && !!currentUser}
        />

        {/* Global Filter Bar with Navigation Dropdown */}
        <FilterBar
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          searchQuery={searchQuery}
          availableYears={availableYears}
          language={language}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unpaidCount={unpaidTenantItems.length}
          totalRoomsCount={rooms.length}
          totalTenantsCount={tenants.length}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          onSearchChange={setSearchQuery}
          onClearFilters={() => {
            setSelectedYear('all');
            setSelectedMonth('all');
            setSearchQuery('');
          }}
        />

        {/* TAB CONTENTS */}
        <main className="space-y-6">
          {/* 1. Brief Dashboard */}
          {activeTab === 'brief' && (
            <>
              <BriefDashboard
                language={language}
                totalExpectedRent={totalExpectedRent}
                totalCollectedIncome={totalCollectedIncome}
                totalOutstandingDue={totalOutstandingDue}
                totalExpenses={totalExpensesSum}
                totalShopDues={totalShopDuesSum}
                totalEntriesCount={totalEntriesCount}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
              />

              {/* Also show mini Unpaid Alert when there are pending rents */}
              {unpaidTenantItems.length > 0 && (
                <UnpaidSection
                  unpaidItems={unpaidTenantItems}
                  language={language}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  searchQuery={searchQuery}
                  onQuickPay={handleQuickPay}
                />
              )}
            </>
          )}

          {/* 2. Rooms Management */}
          {activeTab === 'rooms' && (
            <RoomsSection
              rooms={rooms}
              language={language}
              searchQuery={searchQuery}
              onAddRoom={handleAddRoom}
              onUpdateRoom={handleUpdateRoom}
              onDeleteRoom={handleDeleteRoom}
            />
          )}

          {/* 3. Tenants Management */}
          {activeTab === 'tenants' && (
            <TenantsSection
              tenants={tenants}
              rooms={rooms}
              language={language}
              searchQuery={searchQuery}
              onAddTenant={handleAddTenant}
              onUpdateTenant={handleUpdateTenant}
              onDeleteTenant={handleDeleteTenant}
            />
          )}

          {/* 4. Rent Collection */}
          {activeTab === 'rent' && (
            <RentSection
              rents={rents}
              tenants={tenants}
              rooms={rooms}
              language={language}
              searchQuery={searchQuery}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onAddRent={handleAddRent}
              onUpdateRent={handleUpdateRent}
              onDeleteRent={handleDeleteRent}
              onSelectReceipt={(rec) => setReceiptRecord(rec)}
            />
          )}

          {/* 5. Unpaid Dues */}
          {activeTab === 'unpaid' && (
            <UnpaidSection
              unpaidItems={unpaidTenantItems}
              language={language}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              searchQuery={searchQuery}
              onQuickPay={handleQuickPay}
            />
          )}

          {/* 6. Expenses */}
          {activeTab === 'expense' && (
            <ExpenseSection
              expenses={expenses}
              language={language}
              searchQuery={searchQuery}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {/* 7. Shop Dues */}
          {activeTab === 'dokan' && (
            <ShopDuesSection
              dokanDues={dokanDues}
              language={language}
              searchQuery={searchQuery}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onAddDokanDue={handleAddDokanDue}
              onUpdateDokanDue={handleUpdateDokanDue}
              onDeleteDokanDue={handleDeleteDokanDue}
            />
          )}

          {/* 8. Analytics */}
          {activeTab === 'analytics' && (
            <AnalyticsCharts
              rents={rents}
              expenses={expenses}
              dokanDues={dokanDues}
              language={language}
            />
          )}
        </main>
      </div>

      {/* Modals & Toasts */}
      <ReceiptModal
        rentRecord={receiptRecord}
        language={language}
        onClose={() => setReceiptRecord(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        userEmail={currentUser?.email}
        language={language}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
