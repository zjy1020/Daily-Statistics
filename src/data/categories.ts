import type { Category } from '../types';

export const expenseCategories: Category[] = [
  { name: '餐饮', icon: '🍽️' },
  { name: '购物', icon: '🛍️' },
  { name: '交通', icon: '🚗' },
  { name: '娱乐', icon: '🎬' },
  { name: '学习', icon: '📚' },
  { name: '生活', icon: '🏠' },
  { name: '医疗', icon: '💊' },
  { name: '其他', icon: '📦' },
];

export const incomeCategories: Category[] = [
  { name: '工资', icon: '💼' },
  { name: '红包', icon: '🧧' },
  { name: '奖金', icon: '🏆' },
  { name: '兼职', icon: '💻' },
  { name: '其他', icon: '💰' },
];

export const allCategories: Record<string, Category[]> = {
  expense: expenseCategories,
  income: incomeCategories,
};

export function getCategoryIcon(name: string): string {
  const all = [...expenseCategories, ...incomeCategories];
  return all.find(c => c.name === name)?.icon || '📦';
}
