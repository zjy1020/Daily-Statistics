import { create } from 'zustand';
import type { ExpenseRecord, Budget, Category } from '../types';
import { getToday, getThisMonth, generateId } from '../utils/helpers';
import { expenseCategories as defaultExpense, incomeCategories as defaultIncome } from '../data/categories';

const STORAGE_KEY = 'apple-expense-data';

interface AppState {
  records: ExpenseRecord[];
  budgets: Budget[];
  darkMode: boolean;
  customExpenseCategories: Category[];
  customIncomeCategories: Category[];
  dailyBudgets: Record<string, number>;
  monthlyBudget: number;
  userName: string;
  avatar: string;
  bio: string;
  wallpaperEnabled: boolean;
  wallpaperUrl: string;
  wallpaperBlur: number;
  wallpaperPositionX: number;
  wallpaperPositionY: number;
  setWallpaperBlur: (blur: number) => void;
  setWallpaperPositionX: (pos: number) => void;
  setWallpaperPositionY: (pos: number) => void;
  addRecord: (r: Omit<ExpenseRecord, 'id' | 'createdAt'>) => void;
  deleteRecord: (id: string) => void;
  updateRecord: (id: string, data: Partial<Omit<ExpenseRecord, 'id' | 'createdAt'>>) => void;
  addBudget: (b: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (id: string, data: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  setDailyBudget: (date: string, amount: number) => void;
  setMonthlyBudget: (amount: number) => void;
  toggleDarkMode: () => void;
  setUserName: (name: string) => void;
  setAvatar: (emoji: string) => void;
  setBio: (bio: string) => void;
  setWallpaperEnabled: (on: boolean) => void;
  setWallpaper: (url: string) => void;
  clearAllData: () => void;
  addCategory: (type: 'expense' | 'income', cat: Category) => void;
  updateCategory: (type: 'expense' | 'income', oldName: string, cat: Category) => void;
  deleteCategory: (type: 'expense' | 'income', name: string) => void;
  getMonthlyExpense: (month?: string) => number;
  getMonthlyIncome: (month?: string) => number;
  getTodayTotal: (type: 'expense' | 'income') => number;
  getCategoryTotals: (month: string, type: 'expense' | 'income') => Record<string, number>;
  getDailyTotals: (month: string) => Record<string, number>;
  getMonthlyTrend: () => { month: string; expense: number; income: number }[];
  getCategoryIcon: (name: string) => string;
  getExpenseCategories: () => Category[];
  getIncomeCategories: () => Category[];
  exportData: () => string;
  exportJSON: () => string;
  importJSON: (json: string) => string;
}

function loadData(): { records: ExpenseRecord[]; budgets: Budget[]; darkMode: boolean; customExpenseCategories: Category[]; customIncomeCategories: Category[]; dailyBudgets: Record<string, number>; monthlyBudget: number; userName: string; avatar: string; bio: string; wallpaperEnabled: boolean; wallpaperUrl: string; wallpaperBlur: number; wallpaperPositionX: number; wallpaperPositionY: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const isEmoji = (s: string) => [...s].some(c => c.codePointAt(0)! > 127);
      const migCats = (cats: Category[]) => cats.map(c => ({
        ...c,
        icon: c.icon && !isEmoji(c.icon) ? c.icon : 'Tag',
      }));
      return {
        records: parsed.records || [],
        budgets: parsed.budgets || [],
        darkMode: parsed.darkMode ?? false,
        customExpenseCategories: migCats(parsed.customExpenseCategories || []),
        customIncomeCategories: migCats(parsed.customIncomeCategories || []),
        dailyBudgets: parsed.dailyBudgets || {},
        monthlyBudget: parsed.monthlyBudget ?? 0,
        userName: parsed.userName || '',
        avatar: parsed.avatar || '👤',
        bio: parsed.bio || '',
        wallpaperEnabled: parsed.wallpaperEnabled ?? true,
        wallpaperUrl: parsed.wallpaperUrl || '/gj.webp',
        wallpaperBlur: parsed.wallpaperBlur ?? 6,
        wallpaperPositionX: parsed.wallpaperPositionX ?? 50,
        wallpaperPositionY: parsed.wallpaperPositionY ?? 50,
      };
    }
  } catch { /* ignore */ }
  return { records: [], budgets: [], darkMode: false, customExpenseCategories: [], customIncomeCategories: [], dailyBudgets: {}, monthlyBudget: 0, userName: '', avatar: '👤', bio: '', wallpaperEnabled: true, wallpaperUrl: '/gj.webp', wallpaperBlur: 6, wallpaperPositionX: 50, wallpaperPositionY: 50 };
}

function saveData(state: { records: ExpenseRecord[]; budgets: Budget[]; darkMode: boolean; customExpenseCategories: Category[]; customIncomeCategories: Category[]; dailyBudgets: Record<string, number>; monthlyBudget: number; userName: string; avatar: string; bio: string; wallpaperEnabled: boolean; wallpaperUrl: string; wallpaperBlur: number; wallpaperPositionX: number; wallpaperPositionY: number }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const initial = loadData();

export const useStore = create<AppState>((set, get) => ({
  records: initial.records,
  budgets: initial.budgets,
  darkMode: initial.darkMode,
  customExpenseCategories: initial.customExpenseCategories,
  customIncomeCategories: initial.customIncomeCategories,
  dailyBudgets: initial.dailyBudgets,
  monthlyBudget: initial.monthlyBudget,
  userName: initial.userName,
  avatar: initial.avatar,
  bio: initial.bio,
  wallpaperEnabled: initial.wallpaperEnabled,
  wallpaperUrl: initial.wallpaperUrl,
  wallpaperBlur: initial.wallpaperBlur,
  wallpaperPositionX: initial.wallpaperPositionX,
  wallpaperPositionY: initial.wallpaperPositionY,

  setWallpaperBlur: (blur) => set((s) => {
    const next = { ...s, wallpaperBlur: blur };
    saveData(next);
    return next;
  }),

  setWallpaperPositionX: (pos) => set((s) => {
    const next = { ...s, wallpaperPositionX: pos };
    saveData(next);
    return next;
  }),

  setWallpaperPositionY: (pos) => set((s) => {
    const next = { ...s, wallpaperPositionY: pos };
    saveData(next);
    return next;
  }),
  addRecord: (r) => set((s) => {
    const record: ExpenseRecord = { ...r as ExpenseRecord, id: generateId(), createdAt: Date.now() };
    const next = { ...s, records: [record, ...s.records] };
    saveData(next);
    return next;
  }),

  deleteRecord: (id) => set((s) => {
    const next = { ...s, records: s.records.filter(r => r.id !== id) };
    saveData(next);
    return next;
  }),

  updateRecord: (id, data) => set((s) => {
    const next = { ...s, records: s.records.map(r => r.id === id ? { ...r, ...data } : r) };
    saveData(next);
    return next;
  }),

  addBudget: (b) => set((s) => {
    const budget: Budget = { ...b, id: generateId(), spent: 0 };
    const next = { ...s, budgets: [...s.budgets, budget] };
    saveData(next);
    return next;
  }),

  updateBudget: (id, data) => set((s) => {
    const next = { ...s, budgets: s.budgets.map(b => b.id === id ? { ...b, ...data } : b) };
    saveData(next);
    return next;
  }),

  deleteBudget: (id) => set((s) => {
    const next = { ...s, budgets: s.budgets.filter(b => b.id !== id) };
    saveData(next);
    return next;
  }),

  toggleDarkMode: () => set((s) => {
    const next = { ...s, darkMode: !s.darkMode };
    saveData(next);
    return next;
  }),

  setDailyBudget: (date, amount) => set((s) => {
    const next = { ...s, dailyBudgets: { ...s.dailyBudgets, [date]: amount } };
    saveData(next);
    return next;
  }),

  setMonthlyBudget: (amount) => set((s) => {
    const next = { ...s, monthlyBudget: amount };
    saveData(next);
    return next;
  }),

  setUserName: (name) => set((s) => {
    const next = { ...s, userName: name };
    saveData(next);
    return next;
  }),

  setAvatar: (emoji) => set((s) => {
    const next = { ...s, avatar: emoji };
    saveData(next);
    return next;
  }),

  setBio: (bio) => set((s) => {
    const next = { ...s, bio };
    saveData(next);
    return next;
  }),

  setWallpaperEnabled: (on) => set((s) => {
    const next = { ...s, wallpaperEnabled: on };
    saveData(next);
    return next;
  }),

  setWallpaper: (url) => set((s) => {
    const next = { ...s, wallpaperUrl: url, wallpaperEnabled: true };
    saveData(next);
    return next;
  }),

  clearAllData: () => set((s) => {
    const next = { ...s, records: [], budgets: [], dailyBudgets: {}, monthlyBudget: 0, customExpenseCategories: [], customIncomeCategories: [], userName: '', avatar: '👤', bio: '', wallpaperEnabled: true, wallpaperUrl: '/gj.webp', wallpaperBlur: 6, wallpaperPositionX: 50, wallpaperPositionY: 50 };
    saveData(next);
    return next;
  }),

  addCategory: (type, cat) => set((s) => {
    const key = type === 'expense' ? 'customExpenseCategories' : 'customIncomeCategories';
    const next = { ...s, [key]: [...s[key], cat] };
    saveData(next);
    return next;
  }),

  updateCategory: (type, oldName, cat) => set((s) => {
    const key = type === 'expense' ? 'customExpenseCategories' : 'customIncomeCategories';
    const next = { ...s, [key]: s[key].map(c => c.name === oldName ? cat : c) };
    saveData(next);
    return next;
  }),

  deleteCategory: (type, name) => set((s) => {
    const key = type === 'expense' ? 'customExpenseCategories' : 'customIncomeCategories';
    const next = { ...s, [key]: s[key].filter(c => c.name !== name) };
    saveData(next);
    return next;
  }),

  getMonthlyExpense: (month) => {
    const m = month || getThisMonth();
    return get().records
      .filter(r => r.type === 'expense' && r.date.startsWith(m))
      .reduce((sum, r) => sum + r.amount, 0);
  },

  getMonthlyIncome: (month) => {
    const m = month || getThisMonth();
    return get().records
      .filter(r => r.type === 'income' && r.date.startsWith(m))
      .reduce((sum, r) => sum + r.amount, 0);
  },

  getTodayTotal: (type) => {
    const today = getToday();
    return get().records
      .filter(r => r.type === type && r.date === today)
      .reduce((sum, r) => sum + r.amount, 0);
  },

  getCategoryTotals: (month, type) => {
    const result: Record<string, number> = {};
    get().records
      .filter(r => r.type === type && r.date.startsWith(month))
      .forEach(r => {
        result[r.category] = (result[r.category] || 0) + r.amount;
      });
    return result;
  },

  getDailyTotals: (month) => {
    const result: Record<string, number> = {};
    get().records
      .filter(r => r.date.startsWith(month))
      .forEach(r => {
        const key = r.type === 'expense' ? `expense_${r.date}` : `income_${r.date}`;
        result[key] = (result[key] || 0) + r.amount;
      });
    return result;
  },

  getMonthlyTrend: () => {
    const months = new Set<string>();
    get().records.forEach(r => {
      const m = r.date.slice(0, 7);
      months.add(m);
    });
    return Array.from(months).sort().slice(-12).map(m => ({
      month: m,
      expense: get().records.filter(r => r.type === 'expense' && r.date.startsWith(m)).reduce((s, r) => s + r.amount, 0),
      income: get().records.filter(r => r.type === 'income' && r.date.startsWith(m)).reduce((s, r) => s + r.amount, 0),
    }));
  },

  exportData: () => {
    const { records, budgets, dailyBudgets } = get();
    const header = '日期,时间,类型,分类,金额,备注';
    const rows = records.map(r =>
      `${r.date},${r.time || ''},${r.type === 'expense' ? '支出' : '收入'},${r.category},${r.amount},${r.note}`
    );
    const parts = ['﻿' + [header, ...rows].join('\n')];
    if (budgets.length > 0) {
      parts.push('\n--- 预算 ---\n分类,预算金额,已使用');
      budgets.forEach(b => parts.push(`${b.category},${b.amount},${b.spent}`));
    }
    if (Object.keys(dailyBudgets).length > 0) {
      parts.push('\n--- 每日预算 ---\n日期,金额');
      Object.entries(dailyBudgets).forEach(([date, amt]) => parts.push(`${date},${amt}`));
    }
    return parts.join('\n');
  },

  exportJSON: () => {
    const { records, budgets, dailyBudgets, monthlyBudget, customExpenseCategories, customIncomeCategories, darkMode, userName, avatar, bio, wallpaperEnabled, wallpaperUrl, wallpaperBlur, wallpaperPositionX, wallpaperPositionY } = get();
    return JSON.stringify({ records, budgets, dailyBudgets, monthlyBudget, customExpenseCategories, customIncomeCategories, darkMode, userName, avatar, bio, wallpaperEnabled, wallpaperUrl, wallpaperBlur, wallpaperPositionX, wallpaperPositionY, exportedAt: Date.now() });
  },

  importJSON: (json) => {
    try {
      const data = JSON.parse(json);
      if (!data.records || !Array.isArray(data.records)) return '无效的备份文件';
      set((s) => {
        const next = {
          ...s,
          records: data.records,
          budgets: data.budgets || [],
          dailyBudgets: data.dailyBudgets || {},
          monthlyBudget: data.monthlyBudget ?? 0,
          customExpenseCategories: data.customExpenseCategories || [],
          customIncomeCategories: data.customIncomeCategories || [],
          darkMode: data.darkMode ?? false,
          userName: data.userName || '',
          avatar: data.avatar || '👤',
          bio: data.bio || '',
          wallpaperEnabled: data.wallpaperEnabled ?? true,
          wallpaperUrl: data.wallpaperUrl || '/gj.webp',
          wallpaperBlur: data.wallpaperBlur ?? 6,
          wallpaperPositionX: data.wallpaperPositionX ?? 50,
          wallpaperPositionY: data.wallpaperPositionY ?? 50,
        };
        saveData(next);
        return next;
      });
      return `成功导入 ${data.records.length} 条记录、${(data.budgets || []).length} 个预算`;
    } catch {
      return '备份文件格式错误';
    }
  },

  getCategoryIcon: (name) => {
    const all: Category[] = [...defaultExpense, ...defaultIncome, ...get().customExpenseCategories, ...get().customIncomeCategories];
    return all.find(c => c.name === name)?.icon || '📦';
  },

  getExpenseCategories: () => {
    return [...defaultExpense, ...get().customExpenseCategories];
  },

  getIncomeCategories: () => {
    return [...defaultIncome, ...get().customIncomeCategories];
  },
}));

// Auto-backup to phone storage when data changes
let backupTimer: ReturnType<typeof setTimeout> | null = null;
const BACKUP_DIR = '每日记账';
const BACKUP_META_KEY = 'apple-expense-backups';

const doAutoBackup = async () => {
  try {
    const s = useStore.getState();
    const json = JSON.stringify({
      records: s.records,
      budgets: s.budgets,
      dailyBudgets: s.dailyBudgets,
      monthlyBudget: s.monthlyBudget,
      customExpenseCategories: s.customExpenseCategories,
      customIncomeCategories: s.customIncomeCategories,
      darkMode: s.darkMode,
      userName: s.userName,
      avatar: s.avatar,
      bio: s.bio,
      wallpaperEnabled: s.wallpaperEnabled,
      wallpaperUrl: s.wallpaperUrl,
      wallpaperBlur: s.wallpaperBlur,
      wallpaperPositionX: s.wallpaperPositionX,
      wallpaperPositionY: s.wallpaperPositionY,
      exportedAt: Date.now(),
    }, null, 2);

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const filename = `每日记账_${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}.json`;

    // Save to Capacitor filesystem (works on device)
    try {
      const fs = await import('@capacitor/filesystem');

      // Try writing to Documents/每日记账/
      try {
        await fs.Filesystem.mkdir({ path: BACKUP_DIR, directory: fs.Directory.Documents, recursive: true });
      } catch (e) {
        console.warn('[AutoBackup] mkdir Documents failed:', e);
        // Directory might already exist, which is fine
      }

      try {
        await fs.Filesystem.writeFile({
          path: `${BACKUP_DIR}/${filename}`,
          data: json,
          directory: fs.Directory.Documents,
          encoding: fs.Encoding.UTF8,
        });
        // Verify the actual path
        try {
          const uriResult = await fs.Filesystem.getUri({
            path: `${BACKUP_DIR}/${filename}`,
            directory: fs.Directory.Documents,
          });
          console.log('[AutoBackup] saved to:', uriResult.uri);
        } catch {}
      } catch (e) {
        console.warn('[AutoBackup] Documents write failed, trying Data directory:', e);
        // Fallback: try app-internal Data directory (always works, but not user-visible)
        try {
          await fs.Filesystem.writeFile({
            path: `${BACKUP_DIR}/${filename}`,
            data: json,
            directory: fs.Directory.Data,
            encoding: fs.Encoding.UTF8,
          });
          const uriResult = await fs.Filesystem.getUri({
            path: `${BACKUP_DIR}/${filename}`,
            directory: fs.Directory.Data,
          });
          console.log('[AutoBackup] saved to (data):', uriResult.uri);
        } catch (e2) {
          console.error('[AutoBackup] both Documents and Data failed:', e2);
        }
      }
    } catch { /* Capacitor not available (browser dev) */ }

    // Also save to localStorage as fallback (works everywhere)
    try {
      const backups = JSON.parse(localStorage.getItem(BACKUP_META_KEY) || '[]');
      const existing = backups.findIndex((b: any) => b.filename === filename);
      const entry = { filename, date: `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`, size: `${(json.length / 1024).toFixed(1)}KB`, data: json };
      if (existing >= 0) backups[existing] = entry;
      else backups.unshift(entry);
      if (backups.length > 30) backups.length = 30;
      localStorage.setItem(BACKUP_META_KEY, JSON.stringify(backups));
    } catch { /* ignore */ }
  } catch {
    // Silently fail - backup is best-effort
  }
};

useStore.subscribe((state, prevState) => {
  const dataChanged =
    state.records !== prevState.records ||
    state.budgets !== prevState.budgets ||
    state.dailyBudgets !== prevState.dailyBudgets ||
    state.customExpenseCategories !== prevState.customExpenseCategories ||
    state.customIncomeCategories !== prevState.customIncomeCategories ||
    state.userName !== prevState.userName ||
    state.avatar !== prevState.avatar ||
    state.bio !== prevState.bio ||
    state.wallpaperEnabled !== prevState.wallpaperEnabled ||
    state.wallpaperUrl !== prevState.wallpaperUrl ||
    state.wallpaperBlur !== prevState.wallpaperBlur ||
    state.wallpaperPositionX !== prevState.wallpaperPositionX ||
    state.wallpaperPositionY !== prevState.wallpaperPositionY;

  if (!dataChanged) return;

  if (backupTimer) clearTimeout(backupTimer);
  backupTimer = setTimeout(() => doAutoBackup(), 500);
});
