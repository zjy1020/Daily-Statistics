import { useState } from 'react';
import { Plus, Trash2, PiggyBank } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/helpers';
import { expenseCategories } from '../data/categories';
import { getCategoryIcon } from '../data/categories';
import type { Budget as BudgetType } from '../types';

export default function BudgetPage() {
  const budgets = useStore(s => s.budgets);
  const addBudget = useStore(s => s.addBudget);
  const deleteBudget = useStore(s => s.deleteBudget);
  const getMonthlyExpense = useStore(s => s.getMonthlyExpense);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('餐饮');
  const [amount, setAmount] = useState('');

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = getMonthlyExpense();

  const handleAdd = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    addBudget({ category, amount: val });
    setShowForm(false);
    setAmount('');
  };

  const getBudgetSpent = (budget: BudgetType): number => {
    const spent = getMonthlyExpense();
    const perCategory = budgets.length > 0 ? spent / budgets.length : 0;
    return budget.amount > 0 ? budget.spent || perCategory : 0;
  };

  return (
    <div className="px-4 pt-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-apple-text dark:text-apple-dark-text">预算</h1>
        <button onClick={() => setShowForm(true)}
          className="w-9 h-9 rounded-full bg-apple-blue flex items-center justify-center apple-btn shadow-sm">
          <Plus size={18} color="white" />
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
          <div className="h-full rounded-full bg-apple-blue transition-all duration-500"
            style={{ width: `${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}%` }} />
        </div>
        <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext">
          已使用 {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
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
              const spent = getBudgetSpent(b);
              const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
              return (
                <div key={b.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{getCategoryIcon(b.category)}</span>
                      <span className="text-sm font-medium text-apple-text dark:text-apple-dark-text">{b.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-apple-text dark:text-apple-dark-text">{formatCurrency(b.amount)}</span>
                      <button onClick={() => deleteBudget(b.id)} className="apple-btn">
                        <Trash2 size={14} color="#ff3b30" />
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
                    <span className="text-xs text-apple-subtext">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-apple-subtext text-center py-8">暂无预算，点击右上角 + 添加</p>
        )}
      </div>

      {/* Add Budget Form - Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-black/20" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full overflow-y-auto shadow-xl"
            style={{ maxWidth: 360, maxHeight: '80vh' }}>
            <div className="p-6">
              <h3 className="text-lg font-bold text-apple-text dark:text-apple-dark-text mb-4">新增预算</h3>
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
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="预算金额" className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-sm outline-none mb-4" />
              <button onClick={handleAdd} disabled={amount !== '' && parseFloat(amount) <= 0}
                className="w-full py-3 rounded-2xl bg-apple-blue text-white font-semibold disabled:opacity-40 apple-btn">
                添加预算
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
