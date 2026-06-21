import { useState, useRef } from 'react';
import { Plus, Trash2, PiggyBank, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import CategoryIcon from '../components/CategoryIcon';
import { useStore } from '../store/useStore';
import { formatCurrency, getThisMonth, getToday } from '../utils/helpers';
import type { Budget as BudgetType } from '../types';

export default function BudgetPage() {
  const budgets = useStore(s => s.budgets);
  const addBudget = useStore(s => s.addBudget);
  const updateBudget = useStore(s => s.updateBudget);
  const deleteBudget = useStore(s => s.deleteBudget);
  const getMonthlyExpense = useStore(s => s.getMonthlyExpense);
  const getCategoryTotals = useStore(s => s.getCategoryTotals);
  const getExpenseCategories = useStore(s => s.getExpenseCategories);
  const records = useStore(s => s.records);
  const monthlyBudget = useStore(s => s.monthlyBudget);
  const setMonthlyBudget = useStore(s => s.setMonthlyBudget);
  const [showForm, setShowForm] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupInput, setSetupInput] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [category, setCategory] = useState('餐饮');
  const [amount, setAmount] = useState('');
  const [showAllCats, setShowAllCats] = useState(false);

  const month = getThisMonth();
  const totalBudget = monthlyBudget > 0 ? monthlyBudget : budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = getMonthlyExpense();
  const catTotals = getCategoryTotals(month, 'expense') as Record<string, number>;

  const catSpent = (cat: string) => catTotals[cat] || 0;

  // Budget setup state
  const openSetup = () => {
    setSetupInput(monthlyBudget > 0 ? String(monthlyBudget) : '');
    setShowSetup(true);
  };
  const saveSetup = () => {
    const val = parseFloat(setupInput);
    setMonthlyBudget(val > 0 ? val : 0);
    setShowSetup(false);
  };

  // Daily budget
  const today = getToday();
  const dailyBudgets = useStore(s => s.dailyBudgets);
  const setDailyBudget = useStore(s => s.setDailyBudget);
  const [selectedDate, setSelectedDate] = useState(today);
  const dailyBudgetAmt = dailyBudgets[selectedDate] || 0;
  const dailyExpense = records
    .filter(r => r.type === 'expense' && r.date === selectedDate && !r.excludeFromBudget)
    .reduce((s, r) => s + r.amount, 0);
  const [dailyInput, setDailyInput] = useState(dailyBudgetAmt > 0 ? String(dailyBudgetAmt) : '');

  // Reset input when selectedDate changes
  const prevDateRef = useRef(selectedDate);
  if (prevDateRef.current !== selectedDate) {
    prevDateRef.current = selectedDate;
    const amt = dailyBudgets[selectedDate] || 0;
    setDailyInput(amt > 0 ? String(amt) : '');
  }

  const handleSaveDaily = () => {
    const val = parseFloat(dailyInput);
    if (!val || val <= 0) return;
    setDailyBudget(selectedDate, val);
  };

  const dailyPct = dailyBudgetAmt > 0 ? Math.min((dailyExpense / dailyBudgetAmt) * 100, 100) : 0;
  const dailyRemaining = dailyBudgetAmt - dailyExpense;

  const goPrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };

  const goNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };

  const isToday = selectedDate === today;

  const openAdd = () => {
    setEditId(null);
    setCategory('餐饮');
    setAmount('');
    setShowForm(true);
  };

  const openEdit = (b: BudgetType) => {
    setEditId(b.id);
    setCategory(b.category);
    setAmount(String(b.amount));
    setShowForm(true);
  };

  const handleSave = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    if (editId) {
      updateBudget(editId, { category, amount: val });
    } else {
      addBudget({ category, amount: val });
    }
    setShowForm(false);
    setEditId(null);
    setAmount('');
  };

  return (
    <div className="px-4 pt-12 stagger">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-apple-text dark:text-apple-dark-text">预算</h1>
        <button onClick={openAdd}
          className="px-4 py-2 rounded-full bg-apple-blue text-white text-sm font-semibold flex items-center gap-1.5 apple-btn shadow-md"
          style={{ boxShadow: '0 4px 12px rgba(79,124,255,0.3)' }}>
          <Plus size={16} strokeWidth={3} />
          预算
        </button>
      </div>

      {/* Daily Budget Card */}
      <div className="apple-card p-5 mb-3">
        {/* Date navigator */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={goPrevDay} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 apple-btn">
            <ChevronLeft size={16} className="text-apple-text dark:text-apple-dark-text" />
          </button>
          <div className="text-center">
            <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext">
              {isToday ? '今日预算' : '预算'} · {selectedDate}
            </p>
            <p className="text-lg font-bold text-apple-text dark:text-apple-dark-text mt-0.5">
              {dailyBudgetAmt > 0 ? formatCurrency(dailyBudgetAmt) : '未设置'}
            </p>
          </div>
          <button onClick={goNextDay} disabled={isToday}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 apple-btn disabled:opacity-30">
            <ChevronRight size={16} className="text-apple-text dark:text-apple-dark-text" />
          </button>
        </div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-center flex-1">
            <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext mb-0.5">已花费</p>
            <p className="text-lg font-bold" style={{ color: dailyRemaining < 0 ? '#ff2222' : '#1d1d1f' }}>
              {formatCurrency(dailyExpense)}
            </p>
          </div>
          {dailyBudgetAmt > 0 && (
            <div className="text-center flex-1">
              <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext mb-0.5">剩余</p>
              <p className={`text-lg font-bold ${dailyRemaining >= 0 ? 'text-apple-blue' : 'text-expense'}`}>
                {dailyRemaining >= 0 ? formatCurrency(dailyRemaining) : '-' + formatCurrency(Math.abs(dailyRemaining))}
              </p>
            </div>
          )}
        </div>
        {dailyBudgetAmt > 0 && (
          <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${dailyPct}%`,
                background: dailyPct >= 100
                  ? 'linear-gradient(90deg, #ff9f0a, #ff2222)'
                  : 'linear-gradient(90deg, #4f7cff, #6b9bff)',
              }} />
          </div>
        )}
        <div className="flex gap-2">
          <input type="number" value={dailyInput} onChange={e => setDailyInput(e.target.value)}
            placeholder={`输入${isToday ? '今日' : '当日'}预算`}
            className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-xs text-center outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
          <button onClick={handleSaveDaily} disabled={!dailyInput || parseFloat(dailyInput) <= 0}
            className="px-4 py-2 rounded-xl bg-apple-blue text-white text-xs font-semibold apple-btn disabled:opacity-40 flex items-center gap-1 shrink-0 whitespace-nowrap"
            style={{ boxShadow: '0 3px 10px rgba(79,124,255,0.3)' }}>
            <Check size={13} strokeWidth={3} />
            设定
          </button>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="apple-card p-6 mb-4 text-center apple-btn hover:bg-black/[0.02] dark:hover:bg-white/[0.02] active:bg-black/[0.05] dark:active:bg-white/[0.05] transition-colors cursor-pointer"
        onClick={openSetup}>
        <div className="w-14 h-14 rounded-full bg-apple-blue/10 flex items-center justify-center mx-auto mb-3">
          <PiggyBank size={28} color="#4f7cff" />
        </div>
        <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext mb-1">预算总额</p>
        <p className="text-3xl font-bold text-apple-text dark:text-apple-dark-text mb-3">{formatCurrency(totalBudget)}</p>
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-2">
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}%`,
              background: totalBudget > 0 && totalSpent > totalBudget
                ? 'linear-gradient(90deg, #ff9f0a, #ff2222)'
                : 'linear-gradient(90deg, #4f7cff, #6b9bff)',
            }} />
        </div>
        <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext">
          已使用 {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
          {totalBudget > 0 && totalSpent > totalBudget && (
            <span className="text-expense font-medium"> · 超支 {formatCurrency(totalSpent - totalBudget)}</span>
          )}
        </p>
      </div>

      {/* Budget Alerts */}
      {(totalBudget > 0 && totalSpent / totalBudget >= 0.8) || budgets.some(b => { const p = catSpent(b.category); return b.amount > 0 && (p / b.amount) * 100 >= 80; }) ? (
        <div className="apple-card p-4 mb-3" style={{ background: 'rgba(255,59,48,0.06)', borderColor: 'rgba(255,59,48,0.15)' }}>
          <p className="text-xs font-semibold text-expense mb-1.5">⚠️ 预算提醒</p>
          <div className="space-y-1">
            {totalBudget > 0 && totalSpent / totalBudget >= 0.8 && (
              <p className="text-xs text-apple-text dark:text-apple-dark-text">
                总预算已使用 <span className="font-semibold">{((totalSpent / totalBudget) * 100).toFixed(0)}%</span>
                {totalSpent >= totalBudget && <span className="text-expense font-semibold">（超支 {formatCurrency(totalSpent - totalBudget)}）</span>}
              </p>
            )}
            {budgets.map(b => {
              const spent = catSpent(b.category);
              const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
              if (pct < 80) return null;
              return (
                <p key={b.id} className="text-xs text-apple-text dark:text-apple-dark-text">
                  <CategoryIcon name={b.category} size={14} /> {b.category} 已使用 <span className="font-semibold">{pct.toFixed(0)}%</span>
                  {pct >= 100 && <span className="text-expense font-semibold">（超支 {formatCurrency(spent - b.amount)}）</span>}
                </p>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Budget List */}
      <div className="apple-card px-1 py-2 mb-4">
        <div className="px-4 py-2">
          <h3 className="text-sm font-semibold text-apple-text dark:text-apple-dark-text">预算明细</h3>
        </div>
        {budgets.length > 0 ? (
          <div className="divide-y divide-apple-separator dark:divide-apple-dark-separator">
            {budgets.map(b => {
              const spent = catSpent(b.category);
              const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
              return (
                <div key={b.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <button onClick={() => openEdit(b)} className="flex items-center gap-2 apple-btn flex-1 min-w-0 text-left px-2 py-1 -mx-2 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04] active:bg-black/[0.06] dark:active:bg-white/[0.08] transition-colors">
                      <CategoryIcon name={b.category} size={16} />
                      <span className="text-sm font-medium text-apple-text dark:text-apple-dark-text">{b.category}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-apple-text dark:text-apple-dark-text">{formatCurrency(b.amount)}</span>
                      <button onClick={() => deleteBudget(b.id)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 apple-btn">
                        <Trash2 size={13} color="#ff3b30" />
                      </button>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${
                      pct > 90 ? 'bg-expense' : pct > 70 ? 'bg-apple-orange' : 'bg-apple-blue'
                    }`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-apple-subtext">已用 {formatCurrency(spent)}</span>
                    <div className="flex items-center gap-1.5">
                      {pct >= 100 && (
                        <span className="text-[10px] font-semibold text-white bg-expense px-1.5 py-0.5 rounded-full">已超支</span>
                      )}
                      {pct >= 80 && pct < 100 && (
                        <span className="text-[10px] font-semibold text-white bg-apple-orange px-1.5 py-0.5 rounded-full">即将超支</span>
                      )}
                      <span className={`text-xs font-medium ${pct > 90 ? 'text-expense' : 'text-apple-subtext'}`}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-apple-subtext text-center py-8">暂无预算，点击上方 + 添加</p>
        )}
      </div>

      {/* Add/Edit Budget Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-black/20 fade-enter" onClick={() => { setShowForm(false); setEditId(null); }} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full overflow-y-auto shadow-xl modal-enter"
            style={{ maxWidth: 360, maxHeight: '80vh' }}>
            <div className="p-6">
              <h3 className="text-lg font-bold text-apple-text dark:text-apple-dark-text mb-4">
                {editId ? '编辑预算' : '新增预算'}
              </h3>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {(showAllCats ? getExpenseCategories() : getExpenseCategories().slice(0, 8)).map(c => (
                  <button key={c.name} onClick={() => setCategory(c.name)}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                      category === c.name ? 'bg-apple-blue/10 border border-apple-blue/30' : ''
                    }`}>
                    <CategoryIcon name={c.name} size={18} />
                    <span className={`text-xs ${category === c.name ? 'text-apple-blue font-semibold' : 'text-apple-subtext'}`}>{c.name}</span>
                  </button>
                ))}
              </div>
              {getExpenseCategories().length > 8 && (
                <button onClick={() => setShowAllCats(!showAllCats)}
                  className="w-full mb-3 py-1.5 rounded-xl text-xs font-medium text-apple-blue apple-btn hover:bg-apple-blue/5 transition-colors">
                  {showAllCats ? '收起' : `展开全部 ${getExpenseCategories().length} 个分类`}
                </button>
              )}

              {/* Spend info for selected category */}
              {catSpent(category) > 0 && (
                <p className="text-xs text-apple-subtext mb-3 text-center">
                  本月已花费 {formatCurrency(catSpent(category))}
                </p>
              )}

              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => {
                  const v = parseFloat(amount) || 0;
                  const dec = v >= 100 ? 100 : v >= 10 ? 10 : 1;
                  setAmount(String(Math.max(0, v - dec)));
                }}
                  className="w-9 h-9 rounded-full flex items-center justify-center apple-btn shrink-0"
                  style={{ background: 'rgba(60,60,67,0.06)' }}>
                  <span className="text-lg text-apple-text dark:text-apple-dark-text leading-none">−</span>
                </button>
                <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="预算金额"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-sm text-center outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                <button onClick={() => {
                  const v = parseFloat(amount) || 0;
                  const inc = v >= 100 ? 100 : v >= 10 ? 10 : 1;
                  setAmount(String(v + inc));
                }}
                  className="w-9 h-9 rounded-full flex items-center justify-center apple-btn shrink-0"
                  style={{ background: 'rgba(60,60,67,0.06)' }}>
                  <span className="text-lg text-apple-text dark:text-apple-dark-text leading-none">+</span>
                </button>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setShowForm(false); setEditId(null); }}
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm bg-gray-100 dark:bg-gray-700 text-apple-text dark:text-apple-dark-text apple-btn">
                  取消
                </button>
                <button onClick={handleSave} disabled={amount !== '' && parseFloat(amount) <= 0}
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white apple-btn disabled:opacity-40 flex items-center justify-center gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, #4f7cff, #6b9bff)',
                    boxShadow: '0 4px 12px rgba(79,124,255,0.3)',
                  }}>
                  <Check size={16} strokeWidth={3} />
                  {editId ? '保存' : '添加'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-black/20 fade-enter" onClick={() => setShowSetup(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full overflow-y-auto shadow-xl modal-enter"
            style={{ maxWidth: 320, maxHeight: '80vh' }}>
            <div className="p-6">
              <h3 className="text-lg font-bold text-apple-text dark:text-apple-dark-text text-center mb-4">设置月预算总额</h3>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-apple-subtext font-medium">¥</span>
                <input type="number" value={setupInput} onChange={e => setSetupInput(e.target.value)}
                  placeholder="输入月预算总额"
                  autoFocus
                  className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-lg text-center font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              </div>
              <p className="text-xs text-apple-subtext text-center mb-4">
                本月已支出 {formatCurrency(totalSpent)}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowSetup(false)}
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm bg-gray-100 dark:bg-gray-700 text-apple-text dark:text-apple-dark-text apple-btn">
                  取消
                </button>
                <button onClick={saveSetup}
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white apple-btn flex items-center justify-center gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, #4f7cff, #6b9bff)',
                    boxShadow: '0 4px 12px rgba(79,124,255,0.3)',
                  }}>
                  <Check size={16} strokeWidth={3} />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
