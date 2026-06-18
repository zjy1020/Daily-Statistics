import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { CalendarDays, ChevronLeft, ChevronRight, Edit3, Trash2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, getThisMonth, getToday } from '../utils/helpers';
import { getCategoryIcon } from '../data/categories';
import type { ExpenseRecord } from '../types';

type Period = 'week' | 'month' | 'year';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function Statistics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('month');
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [clickedRecord, setClickedRecord] = useState<ExpenseRecord | null>(null);

  const records = useStore(s => s.records);
  const deleteRecord = useStore(s => s.deleteRecord);
  const getCategoryTotals = useStore(s => s.getCategoryTotals);
  const getMonthlyExpense = useStore(s => s.getMonthlyExpense);
  const getMonthlyIncome = useStore(s => s.getMonthlyIncome);
  const getMonthlyTrend = useStore(s => s.getMonthlyTrend);
  const darkMode = useStore(s => s.darkMode);

  const month = getThisMonth();
  const expense = getMonthlyExpense();
  const income = getMonthlyIncome();

  // Chart data
  const categoryData = useMemo(() => {
    const cats = getCategoryTotals(month, 'expense') as Record<string, number>;
    const total = Object.values(cats).reduce((s, v) => s + v, 0);
    return Object.keys(cats).sort((a, b) => cats[b] - cats[a]).map(name => ({
      name,
      value: cats[name],
      pct: total > 0 ? ((cats[name] / total) * 100).toFixed(0) + '%' : '0%',
    }));
  }, [records, month]);

  const trendData = useMemo(() => {
    return getMonthlyTrend().map(d => ({
      month: d.month.slice(5),
      expense: d.expense,
      income: d.income,
    }));
  }, [records]);

  // Calendar data
  const dailyMap = useMemo(() => {
    const map: Record<string, { expense: number; income: number }> = {};
    records.forEach(r => {
      if (!map[r.date]) map[r.date] = { expense: 0, income: 0 };
      if (r.type === 'expense') map[r.date].expense += r.amount;
      else map[r.date].income += r.amount;
    });
    return map;
  }, [records]);

  const calendarCells = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const rem = 7 - (cells.length % 7);
    if (rem < 7) for (let i = 0; i < rem; i++) cells.push(null);
    return cells;
  }, [calendarDate]);

  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();

  const toDateStr = (day: number) =>
    `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const selectedRecords = useMemo(() => {
    return records.filter(r => r.date === selectedDate);
  }, [selectedDate, records]);

  const selectedDaily = dailyMap[selectedDate];
  const selectedTotalExpense = selectedDaily?.expense ?? 0;
  const selectedTotalIncome = selectedDaily?.income ?? 0;

  const prevMonth = () => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const COLORS = ['#4f7cff', '#34c759', '#ff9f0a', '#ff3b30', '#5ac8fa', '#af52de', '#ffd60a', '#8e8e93'];

  const tooltipProps = {
    contentStyle: {
      background: darkMode ? 'rgba(44,44,46,0.95)' : 'rgba(255,255,255,0.95)',
      border: 'none',
      borderRadius: 12,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      padding: '8px 14px',
    },
    labelStyle: { color: darkMode ? '#f5f5f7' : '#1d1d1f', fontSize: 13, fontWeight: 600 } as React.CSSProperties,
    itemStyle: { color: darkMode ? '#98989d' : '#6e6e73', fontSize: 12 } as React.CSSProperties,
  };

  return (
    <div className="px-4 pt-12 stagger">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-apple-text dark:text-apple-dark-text">统计</h1>
        <button onClick={() => setShowCalendar(!showCalendar)}
          className={`w-9 h-9 rounded-full flex items-center justify-center apple-btn shadow-sm transition-all ${
            showCalendar ? 'bg-apple-blue text-white' : 'bg-white/80 dark:bg-gray-800 text-apple-subtext dark:text-apple-dark-subtext'
          }`}>
          <CalendarDays size={18} />
        </button>
      </div>
      <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext mb-5">
        总收入 {formatCurrency(income)} · 总支出 {formatCurrency(expense)} · 结余 {formatCurrency(income - expense)}
      </p>

      {/* Period Tabs */}
      <div className="apple-card p-1 flex mb-4">
        {(['week', 'month', 'year'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
              period === p ? 'bg-apple-blue text-white shadow-sm' : 'text-apple-subtext dark:text-apple-dark-subtext'
            }`}>
            {p === 'week' ? '本周' : p === 'month' ? '本月' : '本年'}
          </button>
        ))}
      </div>

      {/* Calendar */}
      {showCalendar && (
        <div className="apple-card p-5 mb-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 apple-btn">
              <ChevronLeft size={18} className="text-apple-text dark:text-apple-dark-text" />
            </button>
            <span className="font-semibold text-apple-text dark:text-apple-dark-text text-sm">
              {calYear}年{calMonth + 1}月
            </span>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 apple-btn">
              <ChevronRight size={18} className="text-apple-text dark:text-apple-dark-text" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs text-apple-subtext dark:text-apple-dark-subtext font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 mb-3">
            {calendarCells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;
              const dateStr = toDateStr(day);
              const data = dailyMap[dateStr];
              const isToday = dateStr === getToday();
              const isSelected = dateStr === selectedDate;
              const hasExpense = data && data.expense > 0;
              const hasIncome = data && data.income > 0;

              return (
                <button key={dateStr} onClick={() => setSelectedDate(dateStr)}
                  className="flex flex-col items-center py-1.5 apple-btn rounded-lg relative">
                  <span className={`text-xs font-medium leading-tight ${
                    isSelected
                      ? 'text-white'
                      : isToday
                        ? 'text-apple-blue'
                        : 'text-apple-text dark:text-apple-dark-text'
                  }`}>
                    {day}
                  </span>
                  {(hasExpense || hasIncome) && !isSelected && (
                    <span className="flex gap-0.5 mt-0.5">
                      {hasExpense && <span className="w-1 h-1 rounded-full bg-expense" />}
                      {hasIncome && <span className="w-1 h-1 rounded-full bg-income" />}
                    </span>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-apple-blue rounded-lg -z-10" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Date Detail */}
          {selectedRecords.length > 0 && (
            <div className="border-t border-apple-separator dark:border-apple-dark-separator pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-apple-subtext dark:text-apple-dark-subtext">
                  {selectedDate} {selectedDate === getToday() ? '(今天)' : ''}
                </span>
                <div className="flex gap-3">
                  {selectedTotalExpense > 0 && (
                    <span className="text-xs text-expense font-medium">支出 {formatCurrency(selectedTotalExpense)}</span>
                  )}
                  {selectedTotalIncome > 0 && (
                    <span className="text-xs text-income font-medium">收入 {formatCurrency(selectedTotalIncome)}</span>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                {selectedRecords.map(r => (
                  <div key={r.id} onClick={() => setClickedRecord(r)} className="flex items-center justify-between apple-btn cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getCategoryIcon(r.category)}</span>
                      {r.time && <span className="text-xs text-apple-subtext">{r.time}</span>}
                      <span className="text-xs text-apple-text dark:text-apple-dark-text">{r.note || r.category}</span>
                    </div>
                    <span className={`text-xs font-medium ${r.type === 'expense' ? 'text-expense' : 'text-income'}`}>
                      {r.type === 'expense' ? '-' : '+'}{formatCurrency(r.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedRecords.length === 0 && (
            <div className="border-t border-apple-separator dark:border-apple-dark-separator pt-3">
              <p className="text-xs text-apple-subtext text-center py-2">当天无记录</p>
            </div>
          )}
        </div>
      )}

      {/* Chart Type Tabs */}
      <div className="flex gap-2 mb-4">
        {(['pie', 'bar', 'line'] as const).map(t => (
          <button key={t} onClick={() => setChartType(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              chartType === t ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900' : 'bg-white/60 dark:bg-gray-800/60 text-apple-subtext'
            }`}>
            {t === 'pie' ? '饼图' : t === 'bar' ? '柱状图' : '趋势'}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="apple-card p-5 mb-4" style={{ minHeight: 260 }}>
        {chartType === 'pie' && (
          categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={3} dataKey="value" nameKey="name">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipProps} formatter={(v: number) => [formatCurrency(v), '金额']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-apple-subtext">暂无数据</div>
          )
        )}

        {chartType === 'bar' && (
          categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,60,67,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip {...tooltipProps} cursor={false} formatter={(v: number) => [formatCurrency(v), '金额']} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} name="金额">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-apple-subtext">暂无数据</div>
          )
        )}

        {chartType === 'line' && (
          trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,60,67,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip {...tooltipProps} cursor={false} formatter={(v: number, n: string) => [formatCurrency(v), n === 'expense' ? '支出' : '收入']} />
                <Line type="monotone" dataKey="expense" stroke="#ff3b30" strokeWidth={2} dot={false} name="支出" />
                <Line type="monotone" dataKey="income" stroke="#34c759" strokeWidth={2} dot={false} name="收入" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-apple-subtext">暂无数据</div>
          )
        )}
      </div>

      {/* Category Legend */}
      <div className="apple-card p-5 mb-4">
        <h3 className="text-sm font-semibold text-apple-text dark:text-apple-dark-text mb-3">分类明细</h3>
        {categoryData.length > 0 ? (
          <div className="space-y-3">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-sm flex-1 text-apple-text dark:text-apple-dark-text">{getCategoryIcon(cat.name)} {cat.name}</span>
                <span className="text-sm text-apple-subtext dark:text-apple-dark-subtext">{cat.pct}</span>
                <span className="text-sm font-semibold text-apple-text dark:text-apple-dark-text">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-apple-subtext text-center py-4">暂无记录</p>
        )}
      </div>

      {/* Record Action Modal */}
      {clickedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-black/20" onClick={() => setClickedRecord(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full overflow-y-auto shadow-xl"
            style={{ maxWidth: 340, maxHeight: '80vh' }}>
            <div className="p-6">
              <button onClick={() => setClickedRecord(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 apple-btn">
                <X size={16} className="text-apple-subtext" />
              </button>
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-apple-separator dark:border-apple-dark-separator">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ background: clickedRecord.type === 'expense' ? 'rgba(255,59,48,0.08)' : 'rgba(52,199,89,0.08)' }}>
                  {getCategoryIcon(clickedRecord.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-apple-text dark:text-apple-dark-text truncate">{clickedRecord.note || clickedRecord.category}</p>
                  <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext">
                    {formatDate(clickedRecord.date)} {clickedRecord.time || ''}
                  </p>
                </div>
                <span className={`text-lg font-bold shrink-0 ${clickedRecord.type === 'expense' ? 'text-expense' : 'text-income'}`}>
                  {clickedRecord.type === 'expense' ? '-' : '+'}{formatCurrency(clickedRecord.amount)}
                </span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => {
                  navigate('/add', { state: { editRecord: clickedRecord } });
                  setClickedRecord(null);
                }}
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 apple-btn"
                  style={{ background: 'rgba(79,124,255,0.1)', color: '#4f7cff' }}>
                  <Edit3 size={16} />
                  编辑
                </button>
                <button onClick={() => {
                  if (confirm('确定删除这条记录吗？')) {
                    deleteRecord(clickedRecord.id);
                    setClickedRecord(null);
                  }
                }}
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 apple-btn"
                  style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30' }}>
                  <Trash2 size={16} />
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
