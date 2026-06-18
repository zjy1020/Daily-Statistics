import { useNavigate } from 'react-router-dom';
import { Search, Settings, TrendingUp, TrendingDown, Edit3, Trash2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/helpers';
import { getCategoryIcon } from '../data/categories';
import { getToday } from '../utils/helpers';
import { useState } from 'react';
import type { ExpenseRecord } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const records = useStore(s => s.records);
  const getMonthlyExpense = useStore(s => s.getMonthlyExpense);
  const getMonthlyIncome = useStore(s => s.getMonthlyIncome);
  const getTodayTotal = useStore(s => s.getTodayTotal);
  const getCategoryTotals = useStore(s => s.getCategoryTotals);
  const deleteRecord = useStore(s => s.deleteRecord);
  const [selectedRecord, setSelectedRecord] = useState<ExpenseRecord | null>(null);

  const monthExpense = getMonthlyExpense();
  const monthIncome = getMonthlyIncome();
  const todayExpense = getTodayTotal('expense');
  const budgetTotal = 3000;
  const budgetRemaining = Math.max(budgetTotal - monthExpense, 0);
  const catTotals = getCategoryTotals(getToday().slice(0, 7), 'expense') as Record<string, number>;
  const catKeys = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a]).slice(0, 5);

  return (
    <div className="px-4 pt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext">欢迎回来</p>
          <h1 className="text-2xl font-bold text-apple-text dark:text-apple-dark-text" style={{ fontWeight: 700 }}>
            我的账单
          </h1>
        </div>
        <div className="flex gap-3">
          <button className="w-9 h-9 rounded-full bg-white/80 dark:bg-gray-800 flex items-center justify-center apple-btn shadow-sm"
            style={{ border: '0.5px solid rgba(60,60,67,0.08)' }}>
            <Search size={18} color="#6e6e73" />
          </button>
          <button onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-white/80 dark:bg-gray-800 flex items-center justify-center apple-btn shadow-sm"
            style={{ border: '0.5px solid rgba(60,60,67,0.08)' }}>
            <Settings size={18} color="#6e6e73" />
          </button>
        </div>
      </div>

      {/* Month Overview Card */}
      <div className="apple-card p-6 mb-3">
        <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext mb-1">本月总支出</p>
        <p className="text-4xl font-bold text-apple-text dark:text-apple-dark-text mb-4"
          style={{ fontWeight: 700, letterSpacing: -1 }}>
          {formatCurrency(monthExpense)}
        </p>
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
              <TrendingDown size={14} color="#ff3b30" />
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

      {/* Category Stats */}
      <div className="apple-card p-5 mb-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-apple-text dark:text-apple-dark-text">消费分类</h3>
        </div>
        <div className="space-y-3">
          {catKeys.length > 0 ? catKeys.map(cat => {
            const total = catTotals[cat];
            const pct = monthExpense > 0 ? (total / monthExpense) * 100 : 0;
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{getCategoryIcon(cat)}</span>
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
          <h3 className="font-semibold text-apple-text dark:text-apple-dark-text">最近记录</h3>
          <button onClick={() => navigate('/statistics')} className="text-xs text-apple-blue font-medium">查看全部</button>
        </div>
        <div className="divide-y divide-apple-separator dark:divide-apple-dark-separator">
          {records.slice(0, 10).map(r => (
            <div key={r.id} onClick={() => setSelectedRecord(r)} className="flex items-center gap-3 px-4 py-3 apple-btn"
              style={{ cursor: 'pointer' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ background: r.type === 'expense' ? 'rgba(255,59,48,0.08)' : 'rgba(52,199,89,0.08)' }}>
                {getCategoryIcon(r.category)}
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
          {records.length === 0 && (
            <p className="text-sm text-apple-subtext text-center py-8">还没有记录，点击下方 + 记一笔吧</p>
          )}
        </div>
      </div>

      {/* Record Action Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-black/20" onClick={() => setSelectedRecord(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full overflow-y-auto shadow-xl"
            style={{ maxWidth: 340, maxHeight: '80vh' }}>
            <div className="p-6">
              <button onClick={() => setSelectedRecord(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 apple-btn">
                <X size={16} className="text-apple-subtext" />
              </button>
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-apple-separator dark:border-apple-dark-separator">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ background: selectedRecord.type === 'expense' ? 'rgba(255,59,48,0.08)' : 'rgba(52,199,89,0.08)' }}>
                  {getCategoryIcon(selectedRecord.category)}
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
                  navigate('/add', { state: { editRecord: selectedRecord } });
                  setSelectedRecord(null);
                }}
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 apple-btn"
                  style={{ background: 'rgba(79,124,255,0.1)', color: '#4f7cff' }}>
                  <Edit3 size={16} />
                  编辑
                </button>
                <button onClick={() => {
                  if (confirm('确定删除这条记录吗？')) {
                    deleteRecord(selectedRecord.id);
                    setSelectedRecord(null);
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
