import { create } from 'zustand';
import type { ExpenseRecord, Budget } from '../types';
import { getToday, getThisMonth, generateId } from '../utils/helpers';

const STORAGE_KEY = 'apple-expense-data';

interface AppState {
  records: ExpenseRecord[];
  budgets: Budget[];
  darkMode: boolean;
  addRecord: (r: Omit<ExpenseRecord, 'id' | 'createdAt'>) => void;
  deleteRecord: (id: string) => void;
  updateRecord: (id: string, data: Partial<Omit<ExpenseRecord, 'id' | 'createdAt'>>) => void;
  addBudget: (b: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (id: string, data: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  toggleDarkMode: () => void;
  getMonthlyExpense: (month?: string) => number;
  getMonthlyIncome: (month?: string) => number;
  getTodayTotal: (type: 'expense' | 'income') => number;
  getCategoryTotals: (month: string, type: 'expense' | 'income') => Record<string, number>;
  getDailyTotals: (month: string) => Record<string, number>;
  getMonthlyTrend: () => { month: string; expense: number; income: number }[];
  exportData: () => string;
}

function loadData(): { records: ExpenseRecord[]; budgets: Budget[]; darkMode: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { records: [], budgets: [], darkMode: false };
}

function saveData(state: { records: ExpenseRecord[]; budgets: Budget[]; darkMode: boolean }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const initial = loadData();

export const useStore = create<AppState>((set, get) => ({
  records: initial.records,
  budgets: initial.budgets,
  darkMode: initial.darkMode,

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
}));
