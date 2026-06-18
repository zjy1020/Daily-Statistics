export type RecordType = 'expense' | 'income';

export interface ExpenseRecord {
  id: string;
  type: RecordType;
  amount: number;
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  createdAt: number; // timestamp
}

export interface Budget {
  id: string;
  category: string;
  amount: number; // monthly limit
  spent: number;
}

export interface Category {
  name: string;
  icon: string;
}

export interface MonthlyData {
  month: string; // YYYY-MM
  income: number;
  expense: number;
}
