import { useState } from 'react';
import { Plus, Trash2, PiggyBank, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, getThisMonth } from '../utils/helpers';
import { expenseCategories } from '../data/categories';
import { getCategoryIcon } from '../data/categories';
import type { Budget as BudgetType } from '../types';

export default function BudgetPage() {
  const budgets = useStore(s => s.budgets);
  const addBudget = useStore(s => s.addBudget);
  const updateBudget = useStore(s => s.updateBudget);
  const deleteBudget = useStore(s => s.deleteBudget);
  const getMonthlyExpense = useStore(s => s.getMonthlyExpense);
  const getCategoryTotals = useStore(s => s.getCategoryTotals);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [category, setCategory] = useState('餐饮');
  const [amount, setAmount] = useState('');

  const month = getThisMonth();
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = getMonthlyExpense();
  const catTotals = getCategoryTotals(month, 'expense') as Record<string, number>;

  const catSpent = (cat: string) => catTotals[cat] || 0;

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

      {/* Budget Overview */}
      <div className="apple-card p-6 mb-4 text-center">
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
                ? 'linear-gradient(90deg, #ff9f0a, #ff3b30)'
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
                      <span>{getCategoryIcon(b.category)}</span>
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
                    <span className={`text-xs font-medium ${pct > 90 ? 'text-expense' : 'text-apple-subtext'}`}>
                      {pct.toFixed(0)}%
                    </span>
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
                {expenseCategories.map(c => (
                  <button key={c.name} onClick={() => setCategory(c.name)}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                      category === c.name ? 'bg-apple-blue/10 border border-apple-blue/30' : ''
                    }`}>
                    <span className="text-lg">{c.icon}</span>
                    <span className={`text-xs ${category === c.name ? 'text-apple-blue font-semibold' : 'text-apple-subtext'}`}>{c.name}</span>
                  </button>
                ))}
              </div>

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
    </div>
  );
}
