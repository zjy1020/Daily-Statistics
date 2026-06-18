export function formatCurrency(amount: number): string {
  const hasDecimal = amount % 1 !== 0;
  return `¥${amount.toLocaleString('zh-CN', {
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${month}月${day}日 ${weekdays[d.getDay()]}`;
}

export function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getThisMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function getCurrentTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function getWeekRange(date?: Date): { start: string; end: string } {
  const d = date ? new Date(date) : new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  return { start: fmt(mon), end: fmt(sun) };
}

export function getYear(): string {
  return String(new Date().getFullYear());
}

export function getLastPeriod(period: 'week' | 'month' | 'year'): string {
  const now = new Date();
  if (period === 'month') {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  if (period === 'year') {
    return String(now.getFullYear() - 1);
  }
  // week: last week
  const d = new Date(now);
  d.setDate(d.getDate() - 7);
  const range = getWeekRange(d);
  return `${range.start}~${range.end}`;
}
