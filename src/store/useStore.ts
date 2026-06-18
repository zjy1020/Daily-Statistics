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
  userName: string;
  avatar: string;
  bio: string;
  addRecord: (r: Omit<ExpenseRecord, 'id' | 'createdAt'>) => void;
  deleteRecord: (id: string) => void;
  updateRecord: (id: string, data: Partial<Omit<ExpenseRecord, 'id' | 'createdAt'>>) => void;
  addBudget: (b: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (id: string, data: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  setDailyBudget: (date: string, amount: number) => void;
  toggleDarkMode: () => void;
  setUserName: (name: string) => void;
  setAvatar: (emoji: string) => void;
  setBio: (bio: string) => void;
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

function loadData(): { records: ExpenseRecord[]; budgets: Budget[]; darkMode: boolean; customExpenseCategories: Category[]; customIncomeCategories: Category[]; dailyBudgets: Record<string, number>; userName: string; avatar: string; bio: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        records: parsed.records || [],
        budgets: parsed.budgets || [],
        darkMode: parsed.darkMode ?? false,
        customExpenseCategories: parsed.customExpenseCategories || [],
        customIncomeCategories: parsed.customIncomeCategories || [],
        dailyBudgets: parsed.dailyBudgets || {},
        userName: parsed.userName || '',
        avatar: parsed.avatar || '👤',
        bio: parsed.bio || '',
      };
    }
  } catch { /* ignore */ }
  return { records: [], budgets: [], darkMode: false, customExpenseCategories: [], customIncomeCategories: [], dailyBudgets: {}, userName: '', avatar: '👤', bio: '' };
}

function saveData(state: { records: ExpenseRecord[]; budgets: Budget[]; darkMode: boolean; customExpenseCategories: Category[]; customIncomeCategories: Category[]; dailyBudgets: Record<string, number>; userName: string; avatar: string; bio: string }) {
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
  userName: initial.userName,
  avatar: initial.avatar,
  bio: initial.bio,

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

  clearAllData: () => set((s) => {
    const next = { ...s, records: [], budgets: [], dailyBudgets: {}, customExpenseCategories: [], customIncomeCategories: [], userName: '', avatar: '👤', bio: '' };
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
    const { records } = get();
    const header = '日期,时间,类型,分类,金额,备注';
    const rows = records.map(r =>
      `${r.date},${r.time || ''},${r.type === 'expense' ? '支出' : '收入'},${r.category},${r.amount},${r.note}`
    );
    return [header, ...rows].join('\n');
  },

  exportJSON: () => {
    const { records, budgets, dailyBudgets, customExpenseCategories, customIncomeCategories, darkMode, userName, avatar, bio } = get();
    return JSON.stringify({ records, budgets, dailyBudgets, customExpenseCategories, customIncomeCategories, darkMode, userName, avatar, bio, exportedAt: Date.now() });
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
          customExpenseCategories: data.customExpenseCategories || [],
          customIncomeCategories: data.customIncomeCategories || [],
          darkMode: data.darkMode ?? false,
          userName: data.userName || '',
          avatar: data.avatar || '👤',
          bio: data.bio || '',
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
