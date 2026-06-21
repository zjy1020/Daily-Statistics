import { useNavigate } from 'react-router-dom';
import { Search, Settings, TrendingUp, TrendingDown, Edit3, Trash2, X, SlidersHorizontal, ChevronLeft, ChevronRight, Check, Quote, Copy, Circle, CheckCircle2 } from 'lucide-react';
import CategoryIcon from '../components/CategoryIcon';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, getToday, getCurrentTime } from '../utils/helpers';
import { useState, useMemo, useRef, useEffect } from 'react';
import type { ExpenseRecord } from '../types';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const QUOTES = [
  '理性消费，从每一笔开始',
  '记账是最好的理财习惯',
  '每一分钱都值得被记录',
  '量入为出，生活更从容',
  '省钱不是目的，过好生活才是',
  '清晰每一笔账，掌控每一天',
  '消费有度，生活有品',
  '精打细算，日子更甜',
  '会花不如会记，会记不如会省',
  '收支心中有数，生活更有底气',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const records = useStore(s => s.records);
  const getCategoryIcon = useStore(s => s.getCategoryIcon);
  const getMonthlyExpense = useStore(s => s.getMonthlyExpense);
  const getMonthlyIncome = useStore(s => s.getMonthlyIncome);
  const getTodayTotal = useStore(s => s.getTodayTotal);
  const getCategoryTotals = useStore(s => s.getCategoryTotals);
  const deleteRecord = useStore(s => s.deleteRecord);
  const updateRecord = useStore(s => s.updateRecord);
  const addRecord = useStore(s => s.addRecord);
  const budgets = useStore(s => s.budgets);
  const getExpenseCategories = useStore(s => s.getExpenseCategories);
  const dailyBudgets = useStore(s => s.dailyBudgets);
  const setDailyBudget = useStore(s => s.setDailyBudget);
  const monthlyBudget = useStore(s => s.monthlyBudget);
  const userName = useStore(s => s.userName);
  const [selectedRecord, setSelectedRecord] = useState<ExpenseRecord | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [showAllFilterCats, setShowAllFilterCats] = useState(false);
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(() => new Date());
  const [selectingPhase, setSelectingPhase] = useState<'start' | 'end'>('start');
  const [catType, setCatType] = useState<'expense' | 'income'>('expense');
  const searchRef = useRef<HTMLDivElement>(null);
  const [dailyInput, setDailyInput] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editShowAllCats, setEditShowAllCats] = useState(false);
  const [editNote, setEditNote] = useState('');

  // Reset edit state when selected record changes
  useEffect(() => { setEditMode(false); }, [selectedRecord]);

  useEffect(() => {
    if (!showSearch) return;
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSearch]);

  const calendarCells = useMemo(() => {
    const y = pickerMonth.getFullYear();
    const m = pickerMonth.getMonth();
    const fd = new Date(y, m, 1).getDay();
    const dim = new Date(y, m + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < fd; i++) cells.push(null);
    for (let d = 1; d <= dim; d++) cells.push(d);
    return cells;
  }, [pickerMonth]);

  const filteredRecords = useMemo(() => {
    let result = [...records];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.note.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        String(r.amount).includes(q)
      );
    }
    if (filterCategory) result = result.filter(r => r.category === filterCategory);
    if (filterDateFrom) result = result.filter(r => r.date >= filterDateFrom);
    if (filterDateTo) result = result.filter(r => r.date <= filterDateTo);
    return result.sort((a, b) => b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || ''));
  }, [records, searchQuery, filterCategory, filterDateFrom, filterDateTo]);

  const hasActiveFilter = !!(searchQuery || filterCategory || filterDateFrom || filterDateTo);

  const monthExpense = getMonthlyExpense();
  const monthIncome = getMonthlyIncome();
  const todayExpense = getTodayTotal('expense');
  const budgetTotal = monthlyBudget > 0 ? monthlyBudget : budgets.reduce((s, b) => s + b.amount, 0);
  const budgetRemaining = Math.max(budgetTotal - monthExpense, 0);
  const dailyAvg = monthExpense / new Date().getDate();
  const balance = monthIncome - monthExpense;
  const monthPrefix = getToday().slice(0, 7);
  const catTotals = getCategoryTotals(monthPrefix, catType) as Record<string, number>;
  const catKeys = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a]);

  // Daily budget
  const today = getToday();
  const todayBudgetExpense = records
    .filter(r => r.type === 'expense' && r.date === today && !r.excludeFromBudget)
    .reduce((sum, r) => sum + r.amount, 0);
  const dailyBudgetAmt = dailyBudgets[today] || 0;
  const dailyPct = dailyBudgetAmt > 0 ? Math.min((todayBudgetExpense / dailyBudgetAmt) * 100, 100) : 0;
  const dailyRemaining = dailyBudgetAmt - todayBudgetExpense;
  const handleSaveDaily = () => {
    const val = parseFloat(dailyInput);
    if (!val || val <= 0) return;
    setDailyBudget(today, val);
    setDailyInput('');
  };

  return (
    <div className="px-4 pt-12 stagger">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext">欢迎回来</p>
          <h1 className="text-2xl font-bold text-apple-text dark:text-apple-dark-text" style={{ fontWeight: 700 }}>
            {userName ? `${userName} 的账单` : '我的账单'}
          </h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowSearch(v => !v)}
            className={`w-9 h-9 rounded-full flex items-center justify-center apple-btn shadow-sm transition-all ${
              showSearch || hasActiveFilter ? 'bg-apple-blue' : 'bg-white/80 dark:bg-gray-800'
            }`}
            style={{ border: '0.5px solid rgba(60,60,67,0.08)' }}>
            <Search size={18} color={showSearch || hasActiveFilter ? 'white' : '#6e6e73'} />
          </button>
          <button onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-white/80 dark:bg-gray-800 flex items-center justify-center apple-btn shadow-sm"
            style={{ border: '0.5px solid rgba(60,60,67,0.08)' }}>
            <Settings size={18} color="#6e6e73" />
          </button>
        </div>
      </div>

      {/* Daily Quote */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <Quote size={14} className="text-apple-subtext/50 shrink-0" />
        <p className="text-xs text-apple-subtext/70 dark:text-apple-dark-subtext/70 italic">
          {QUOTES[new Date().getDate() % QUOTES.length]}
        </p>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div ref={searchRef} className="mb-4 space-y-3">
          <div className="apple-card flex items-center gap-3 px-4 py-3">
            <Search size={16} className="text-apple-subtext shrink-0" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索备注、分类或金额..."
              className="flex-1 bg-transparent text-sm text-apple-text dark:text-apple-dark-text outline-none"
              autoFocus />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/5 apple-btn shrink-0">
                <X size={14} className="text-apple-subtext" />
              </button>
            )}
            <button onClick={() => setShowFilters(v => !v)} className="apple-btn shrink-0">
              <SlidersHorizontal size={16} color={showFilters || filterCategory || filterDateFrom || filterDateTo ? '#4f7cff' : '#6e6e73'} />
            </button>
          </div>
          {showFilters && (
            <div className="apple-card p-4 space-y-3">
              <div>
                <p className="text-xs text-apple-subtext mb-2 font-medium">分类筛选</p>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setFilterCategory('')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      !filterCategory ? 'bg-apple-blue text-white' : 'bg-gray-100 dark:bg-gray-700 text-apple-subtext'
                    }`}>
                    全部
                  </button>
                  {(showAllFilterCats ? getExpenseCategories() : getExpenseCategories().slice(0, 10)).map(c => (
                    <button key={c.name} onClick={() => setFilterCategory(filterCategory === c.name ? '' : c.name)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        filterCategory === c.name ? 'bg-apple-blue text-white' : 'bg-gray-100 dark:bg-gray-700 text-apple-subtext dark:text-apple-dark-subtext'
                      }`}>
                      <CategoryIcon name={c.name} icon={c.icon} size={14} /> {c.name}
                    </button>
                  ))}
                  {getExpenseCategories().length > 10 && (
                    <button onClick={() => setShowAllFilterCats(!showAllFilterCats)}
                      className="px-3 py-1 rounded-full text-xs font-medium text-apple-blue bg-apple-blue/10 transition-all">
                      {showAllFilterCats ? '收起' : `+${getExpenseCategories().length - 10}`}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-apple-subtext font-medium">日期范围</p>
                  {(filterDateFrom || filterDateTo) && (
                    <button onClick={() => { setFilterDateFrom(''); setFilterDateTo(''); }}
                      className="text-xs text-apple-blue font-medium apple-btn">清除</button>
                  )}
                </div>
                {/* Phase toggle */}
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setSelectingPhase('start')}
                    className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs text-center font-medium transition-all ${
                      selectingPhase === 'start'
                        ? 'bg-apple-blue text-white shadow-sm'
                        : filterDateFrom
                          ? 'bg-apple-blue/10 text-apple-blue'
                          : 'bg-gray-100 dark:bg-gray-700 text-apple-subtext'
                    }`}>
                    {filterDateFrom || '开始日期'}
                  </button>
                  <span className="text-xs text-apple-subtext">→</span>
                  <button onClick={() => setSelectingPhase('end')}
                    className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs text-center font-medium transition-all ${
                      selectingPhase === 'end'
                        ? 'bg-apple-blue text-white shadow-sm'
                        : filterDateTo
                          ? 'bg-apple-blue/10 text-apple-blue'
                          : 'bg-gray-100 dark:bg-gray-700 text-apple-subtext'
                    }`}>
                    {filterDateTo || '结束日期'}
                  </button>
                </div>
                <div className="apple-card p-3">
                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-2">
                    <button onClick={() => setPickerMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 apple-btn">
                      <ChevronLeft size={14} className="text-apple-text dark:text-apple-dark-text" />
                    </button>
                    <span className="text-sm font-semibold text-apple-text dark:text-apple-dark-text">
                      {pickerMonth.getFullYear()}年{pickerMonth.getMonth() + 1}月
                    </span>
                    <button onClick={() => setPickerMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 apple-btn">
                      <ChevronRight size={14} className="text-apple-text dark:text-apple-dark-text" />
                    </button>
                  </div>
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 mb-1">
                    {WEEKDAYS.map(d => (
                      <div key={d} className="text-center text-[10px] text-apple-subtext font-medium py-0.5">{d}</div>
                    ))}
                  </div>
                  {/* Day grid */}
                  <div className="grid grid-cols-7">
                    {calendarCells.map((day, i) => {
                      if (day === null) return <div key={`e-${i}`} />;
                      const y = pickerMonth.getFullYear();
                      const m = pickerMonth.getMonth();
                      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isStart = dateStr === filterDateFrom;
                      const isEnd = dateStr === filterDateTo;
                      const inRange = filterDateFrom && filterDateTo && dateStr >= filterDateFrom && dateStr <= filterDateTo;
                      const isToday = dateStr === getToday();
                      return (
                        <button key={dateStr} onClick={() => {
                          if (selectingPhase === 'start') {
                            setFilterDateFrom(dateStr);
                            if (filterDateTo && dateStr > filterDateTo) setFilterDateTo('');
                          } else {
                            setFilterDateTo(dateStr);
                            if (filterDateFrom && dateStr < filterDateFrom) setFilterDateFrom('');
                          }
                        }}
                          className="flex items-center justify-center py-1 apple-btn relative">
                          <span className={`text-xs leading-tight w-7 h-7 flex items-center justify-center ${
                            isStart
                              ? 'bg-apple-blue text-white font-semibold rounded-full'
                              : isEnd
                                ? 'border-2 border-apple-blue text-apple-blue font-semibold rounded-full bg-white dark:bg-transparent'
                                : inRange
                                  ? 'bg-apple-blue/10 text-apple-blue font-medium rounded-full'
                                  : isToday
                                    ? 'text-apple-blue font-medium rounded-full'
                                    : 'text-apple-text dark:text-apple-dark-text rounded-full'
                          }`}>
                            {day}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter summary — visible when search is closed but filters are active */}
      {hasActiveFilter && !showSearch && (
        <div className="flex items-center gap-2 mb-3 apple-card px-4 py-2.5">
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            {searchQuery && (
              <span className="text-xs bg-apple-blue/10 text-apple-blue px-2 py-0.5 rounded-full font-medium">
                "{searchQuery}"
              </span>
            )}
            {filterCategory && (
              <span className="text-xs bg-apple-blue/10 text-apple-blue px-2 py-0.5 rounded-full font-medium">
                {filterCategory}
              </span>
            )}
            {filterDateFrom && filterDateTo && (
              <span className="text-xs bg-apple-blue/10 text-apple-blue px-2 py-0.5 rounded-full font-medium">
                {filterDateFrom.slice(5)}~{filterDateTo.slice(5)}
              </span>
            )}
            {filterDateFrom && !filterDateTo && (
              <span className="text-xs bg-apple-blue/10 text-apple-blue px-2 py-0.5 rounded-full font-medium">
                {filterDateFrom}起
              </span>
            )}
            {!filterDateFrom && filterDateTo && (
              <span className="text-xs bg-apple-blue/10 text-apple-blue px-2 py-0.5 rounded-full font-medium">
                {filterDateTo}止
              </span>
            )}
            <span className="text-xs text-apple-subtext ml-1">{filteredRecords.length} 条</span>
          </div>
          <button onClick={() => { setSearchQuery(''); setFilterCategory(''); setFilterDateFrom(''); setFilterDateTo(''); }}
            className="text-xs text-apple-blue font-medium shrink-0 apple-btn">清除</button>
        </div>
      )}

            {/* Month Overview Card */}
      <div className="apple-card p-6 mb-3">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 max-w-full">
            <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext mb-1">本月总支出</p>
            <p className="text-2xl sm:text-4xl font-bold text-apple-text dark:text-apple-dark-text"
              style={{ fontWeight: 700, letterSpacing: -1 }}>
              {formatCurrency(monthExpense)}
            </p>
          </div>
          <div className="flex gap-4 shrink-0 self-start">
            <div className="text-right">
              <p className="text-[11px] text-apple-subtext mb-0.5">本月结余</p>
              <p className={`text-base font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}
                style={{ fontWeight: 700 }}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-apple-subtext mb-0.5">日均支出</p>
              <p className="text-lg font-bold text-apple-text dark:text-apple-dark-text"
                style={{ fontWeight: 700 }}>
                {formatCurrency(dailyAvg)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-income/10 flex items-center justify-center">
              <TrendingUp size={14} color="#34c759" />
            </div>
            <div>
              <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext">收入</p>
              <p className="text-sm font-semibold text-apple-text dark:text-apple-dark-text">{formatCurrency(monthIncome)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-expense/10 flex items-center justify-center">
              <TrendingDown size={14} color="#ff2222" />
            </div>
            <div>
              <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext">支出</p>
              <p className="text-sm font-semibold text-apple-text dark:text-apple-dark-text">{formatCurrency(monthExpense)}</p>
            </div>
          </div>
        </div>
      </div>


      {/* Today & Budget Cards */}
      <div className="flex gap-3 mb-3">
        <div className="flex-1 apple-card p-4">
          <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext mb-1">今日支出</p>
          <p className="text-xl font-bold text-expense">{formatCurrency(todayExpense)}</p>
        </div>
        <div className="flex-1 apple-card p-4">
          <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext mb-1">预算剩余</p>
          <p className="text-xl font-bold text-apple-blue">{formatCurrency(budgetRemaining)}</p>
          <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div className="h-full rounded-full bg-apple-blue transition-all duration-500"
              style={{ width: `${Math.min((monthExpense / budgetTotal) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Daily Budget Card */}
      <div className="apple-card p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext">今日预算</p>
          {dailyBudgetAmt > 0 && (
            <p className={`text-xs font-medium ${dailyRemaining >= 0 ? 'text-apple-subtext' : 'text-expense'}`}>
              {dailyRemaining >= 0 ? `剩余 ${formatCurrency(dailyRemaining)}` : `超支 ${formatCurrency(Math.abs(dailyRemaining))}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            {dailyBudgetAmt > 0 ? (
              <p className="text-lg font-bold text-apple-text dark:text-apple-dark-text">{formatCurrency(dailyBudgetAmt)}</p>
            ) : (
              <p className="text-sm text-apple-subtext">未设置今日预算</p>
            )}
            {dailyBudgetAmt > 0 && (
              <div className="mt-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${dailyPct}%`,
                    background: dailyPct >= 100 ? 'linear-gradient(90deg, #ff9f0a, #ff2222)' : 'linear-gradient(90deg, #4f7cff, #6b9bff)',
                  }} />
              </div>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0">
            <input type="number" value={dailyInput} onChange={e => setDailyInput(e.target.value)}
              placeholder="额度"
              className="w-20 px-2.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-xs text-center outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
            <button onClick={handleSaveDaily} disabled={!dailyInput || parseFloat(dailyInput) <= 0}
              className="px-3 py-2 rounded-xl bg-apple-blue text-white text-xs font-semibold apple-btn disabled:opacity-40 flex items-center gap-1 shrink-0 whitespace-nowrap"
              style={{ boxShadow: '0 3px 10px rgba(79,124,255,0.3)' }}>
              <Check size={12} strokeWidth={3} />
              设定
            </button>
          </div>
        </div>
      </div>

      {/* Budget Alerts on Dashboard */}
      {(budgetTotal > 0 && monthExpense / budgetTotal >= 0.8) || budgets.some(b => { const p = getCategoryTotals(getToday().slice(0, 7), 'expense')[b.category] || 0; return b.amount > 0 && (p / b.amount) * 100 >= 80; }) ? (
        <div className="apple-card p-4 mb-3" style={{ background: 'rgba(255,59,48,0.06)', borderColor: 'rgba(255,59,48,0.15)' }}>
          <p className="text-xs font-semibold text-expense mb-1.5">⚠️ 预算提醒</p>
          <div className="space-y-1">
            {budgetTotal > 0 && monthExpense / budgetTotal >= 0.8 && (
              <p className="text-xs text-apple-text dark:text-apple-dark-text">
                总预算已使用 <span className="font-semibold">{((monthExpense / budgetTotal) * 100).toFixed(0)}%</span>
                {monthExpense >= budgetTotal && <span className="text-expense font-semibold">（超支 {formatCurrency(monthExpense - budgetTotal)}）</span>}
              </p>
            )}
            {budgets.map(b => {
              const spent = getCategoryTotals(getToday().slice(0, 7), 'expense')[b.category] || 0;
              const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
              if (pct < 80) return null;
              return (
                <p key={b.id} className="text-xs text-apple-text dark:text-apple-dark-text">
                  <CategoryIcon name={b.category} icon={getCategoryIcon(b.category)} size={14} /> {b.category} 已使用 <span className="font-semibold">{pct.toFixed(0)}%</span>
                  {pct >= 100 && <span className="text-expense font-semibold">（超支 {formatCurrency(spent - b.amount)}）</span>}
                </p>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Category Stats */}
      <div className="apple-card p-5 mb-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-apple-text dark:text-apple-dark-text">分类统计</h3>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <button onClick={() => setCatType('expense')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                catType === 'expense' ? 'bg-white dark:bg-gray-600 text-apple-text dark:text-apple-dark-text shadow-sm' : 'text-apple-subtext'
              }`}>支出</button>
            <button onClick={() => setCatType('income')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                catType === 'income' ? 'bg-white dark:bg-gray-600 text-apple-text dark:text-apple-dark-text shadow-sm' : 'text-apple-subtext'
              }`}>收入</button>
          </div>
        </div>
        <div className="space-y-3">
          {catKeys.length > 0 ? catKeys.map(cat => {
            const total = catTotals[cat];
            const catTotal = catType === 'expense' ? monthExpense : monthIncome;
            const pct = catTotal > 0 ? (total / catTotal) * 100 : 0;
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <CategoryIcon name={cat} icon={getCategoryIcon(cat)} size={16} />
                    <span className="text-sm text-apple-text dark:text-apple-dark-text">{cat}</span>
                  </div>
                  <span className="text-sm font-semibold text-apple-text dark:text-apple-dark-text">{formatCurrency(total)}</span>
                </div>
                <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div className="h-full rounded-full bg-apple-blue transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          }) : <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext text-center py-4">暂无记录</p>}
        </div>
      </div>

      {/* Recent Records */}
      <div className="apple-card px-1 py-2 mb-3">
        <div className="flex items-center justify-between px-4 py-2">
          <h3 className="font-semibold text-apple-text dark:text-apple-dark-text">{hasActiveFilter ? '筛选结果' : '最近记录'}</h3>
          <button onClick={() => navigate('/statistics')} className="text-xs text-apple-blue font-medium">查看全部</button>
        </div>
        {(showSearch || searchQuery || filterCategory || filterDateFrom || filterDateTo) && (
          <p className="px-4 pt-2 pb-1 text-xs text-apple-subtext">
            筛选结果 {filteredRecords.length} 条
          </p>
        )}
        <div className="divide-y divide-apple-separator dark:divide-apple-dark-separator">
          {(searchQuery || filterCategory || filterDateFrom || filterDateTo ? filteredRecords : records.slice(0, 10)).map(r => (
            <div key={r.id} onClick={() => setSelectedRecord(r)} className="flex items-center gap-3 px-4 py-3 apple-btn hover:bg-black/[0.03] dark:hover:bg-white/[0.04] active:bg-black/[0.06] dark:active:bg-white/[0.08] transition-colors"
              style={{ cursor: 'pointer' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ background: r.type === 'expense' ? 'rgba(255,59,48,0.08)' : 'rgba(52,199,89,0.08)' }}>
                <CategoryIcon name={r.category} icon={getCategoryIcon(r.category)} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-apple-text dark:text-apple-dark-text truncate">{r.note || r.category}</p>
                <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext">{formatDate(r.date)} {r.time || ''}</p>
              </div>
              <span className={`text-sm font-semibold ${r.type === 'expense' ? 'text-expense' : 'text-income'}`}>
                {r.type === 'expense' ? '-' : '+'}{formatCurrency(r.amount)}
              </span>
            </div>
          ))}
          {(searchQuery || filterCategory || filterDateFrom || filterDateTo) && filteredRecords.length === 0 && (
            <p className="text-sm text-apple-subtext text-center py-8">没有找到匹配的记录</p>
          )}
          {records.length === 0 && !searchQuery && !filterCategory && !filterDateFrom && !filterDateTo && (
            <p className="text-sm text-apple-subtext text-center py-8">还没有记录，点击下方 + 记一笔吧</p>
          )}
        </div>
      </div>

      {/* Record Action Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-black/20 fade-enter" onClick={() => { setSelectedRecord(null); setEditMode(false); }} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full overflow-y-auto shadow-xl modal-enter"
            style={{ maxWidth: 340, maxHeight: '80vh' }}>
            <div className="p-6">
              <button onClick={() => { setSelectedRecord(null); setEditMode(false); }} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 apple-btn">
                <X size={16} className="text-apple-subtext" />
              </button>
              {!editMode ? (
                <>
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-apple-separator dark:border-apple-dark-separator">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{ background: selectedRecord.type === 'expense' ? 'rgba(255,59,48,0.08)' : 'rgba(52,199,89,0.08)' }}>
                      <CategoryIcon name={selectedRecord.category} icon={getCategoryIcon(selectedRecord.category)} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-apple-text dark:text-apple-dark-text truncate">{selectedRecord.note || selectedRecord.category}</p>
                      <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext">
                        {formatDate(selectedRecord.date)} {selectedRecord.time || ''}
                      </p>
                    </div>
                    <span className={`text-lg font-bold shrink-0 ${selectedRecord.type === 'expense' ? 'text-expense' : 'text-income'}`}>
                      {selectedRecord.type === 'expense' ? '-' : '+'}{formatCurrency(selectedRecord.amount)}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => {
                      addRecord({
                        type: selectedRecord.type,
                        amount: selectedRecord.amount,
                        category: selectedRecord.category,
                        note: selectedRecord.note,
                        date: getToday(),
                        time: getCurrentTime(),
                      });
                      setSelectedRecord(null);
                    }}
                      className="flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 apple-btn"
                      style={{ background: 'rgba(52,199,89,0.1)', color: '#34c759' }}>
                      <Copy size={16} />
                      再来一笔
                    </button>
                  </div>
                  {/* 不记录当天预算 toggle */}
                  <button onClick={() => {
                    updateRecord(selectedRecord.id, { excludeFromBudget: !selectedRecord.excludeFromBudget });
                    setSelectedRecord({ ...selectedRecord, excludeFromBudget: !selectedRecord.excludeFromBudget });
                  }}
                    className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-2xl text-sm font-medium apple-btn transition-all"
                    style={{
                      background: selectedRecord.excludeFromBudget ? 'rgba(255,159,10,0.1)' : 'transparent',
                      color: selectedRecord.excludeFromBudget ? '#ff9f0a' : '#8e8e93',
                    }}>
                    {selectedRecord.excludeFromBudget
                      ? <><CheckCircle2 size={16} /> 不记入预算</>
                      : <><Circle size={16} strokeWidth={1.5} /> 不记入预算</>
                    }
                  </button>
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => { setEditAmount(String(selectedRecord.amount)); setEditCategory(selectedRecord.category); setEditNote(selectedRecord.note); setEditMode(true); }}
                      className="flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 apple-btn"
                      style={{ background: 'rgba(79,124,255,0.1)', color: '#4f7cff' }}>
                      <Edit3 size={16} />
                      编辑
                    </button>
                    <button onClick={() => {
                      if (confirm('确定删除这条记录吗？')) {
                        deleteRecord(selectedRecord.id);
                        setSelectedRecord(null);
                        setEditMode(false);
                      }
                    }}
                      className="flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 apple-btn"
                      style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30' }}>
                      <Trash2 size={16} />
                      删除
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-base font-bold text-apple-text dark:text-apple-dark-text mb-4">编辑记录</h3>
                  {/* Amount */}
                  <div className="mb-3">
                    <p className="text-xs text-apple-subtext mb-1.5 font-medium">金额</p>
                    <input type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-sm text-apple-text dark:text-apple-dark-text text-center outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                  </div>
                  {/* Category */}
                  <div className="mb-3">
                    <p className="text-xs text-apple-subtext mb-1.5 font-medium">分类</p>
                    <div className="overflow-y-auto" style={{ maxHeight: 160 }}>
                      <div className="grid grid-cols-4 gap-2">
                        {(editShowAllCats ? getExpenseCategories() : getExpenseCategories().slice(0, 8)).map(c => (
                          <button key={c.name} onClick={() => setEditCategory(c.name)}
                            className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all ${
                              editCategory === c.name ? 'bg-apple-blue/10 border border-apple-blue/30' : ''
                            }`}>
                            <CategoryIcon name={c.name} icon={c.icon} size={16} />
                            <span className={`text-[10px] ${editCategory === c.name ? 'text-apple-blue font-semibold' : 'text-apple-subtext'}`}>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {getExpenseCategories().length > 8 && (
                      <button onClick={() => setEditShowAllCats(!editShowAllCats)}
                        className="w-full mt-2 py-1.5 rounded-xl text-xs font-medium text-apple-blue apple-btn hover:bg-apple-blue/5 transition-colors">
                        {editShowAllCats ? '收起' : `展开全部 ${getExpenseCategories().length} 个分类`}
                      </button>
                    )}
                  </div>
                  {/* Note */}
                  <div className="mb-4">
                    <p className="text-xs text-apple-subtext mb-1.5 font-medium">备注</p>
                    <input type="text" value={editNote} onChange={e => setEditNote(e.target.value)}
                      placeholder="备注"
                      className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-sm text-apple-text dark:text-apple-dark-text outline-none text-center" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setEditMode(false)}
                      className="flex-1 py-3 rounded-2xl font-semibold text-sm bg-gray-100 dark:bg-gray-700 text-apple-text dark:text-apple-dark-text apple-btn">
                      取消
                    </button>
                    <button onClick={() => {
                      const val = parseFloat(editAmount);
                      if (!val || val <= 0) return;
                      updateRecord(selectedRecord.id, { amount: val, category: editCategory, note: editNote.trim() });
                      setSelectedRecord(null);
                      setEditMode(false);
                    }}
                      className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white apple-btn flex items-center justify-center gap-1.5"
                      style={{ background: 'linear-gradient(135deg, #4f7cff, #6b9bff)', boxShadow: '0 4px 12px rgba(79,124,255,0.3)' }}>
                      <Check size={16} strokeWidth={3} />
                      保存
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
