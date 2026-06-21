import type { Category } from '../types';

export const expenseCategories: Category[] = [
  { name: '餐饮', icon: '🍽️' },
  { name: '零食', icon: '🍿' },
  { name: '水果', icon: '🍎' },
  { name: '饮品', icon: '☕' },
  { name: '烟酒', icon: '🚬' },
  { name: '购物', icon: '🛍️' },
  { name: '服饰', icon: '👗' },
  { name: '美妆', icon: '💄' },
  { name: '交通', icon: '🚗' },
  { name: '通讯', icon: '📱' },
  { name: '水电', icon: '💡' },
  { name: '还贷', icon: '🏦' },
  { name: '家居', icon: '🪴' },
  { name: '娱乐', icon: '🎬' },
  { name: '游戏', icon: '🎮' },
  { name: '运动', icon: '⚽' },
  { name: '健身', icon: '💪' },
  { name: '社交', icon: '🍻' },
  { name: '学习', icon: '📚' },
  { name: '数码', icon: '💻' },
  { name: '医疗', icon: '💊' },
  { name: '宠物', icon: '🐾' },
  { name: '理发', icon: '💇' },
  { name: '礼物', icon: '🎁' },
  { name: '旅行', icon: '✈️' },
  { name: '维修', icon: '🔧' },
  { name: '快递', icon: '📦' },
  { name: '母婴', icon: '👶' },
  { name: '保险', icon: '🛡️' },
  { name: '其他', icon: '📦' },
];

export const incomeCategories: Category[] = [
  { name: '工资', icon: '💼' },
  { name: '奖金', icon: '🏆' },
  { name: '兼职', icon: '💻' },
  { name: '理财', icon: '📈' },
  { name: '投资', icon: '📊' },
  { name: '租金', icon: '🏘️' },
  { name: '红包', icon: '🧧' },
  { name: '退款', icon: '↩️' },
  { name: '报销', icon: '📋' },
  { name: '稿费', icon: '✍️' },
  { name: '礼金', icon: '🎉' },
  { name: '补贴', icon: '🎟️' },
  { name: '分红', icon: '💵' },
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
