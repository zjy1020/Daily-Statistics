import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { expenseCategories, incomeCategories } from '../data/categories';
import { getToday, getCurrentTime } from '../utils/helpers';
import type { RecordType } from '../types';

export default function AddRecord() {
  const navigate = useNavigate();
  const location = useLocation();
  const editRecord = (location.state as any)?.editRecord;
  const addRecord = useStore(s => s.addRecord);
  const updateRecord = useStore(s => s.updateRecord);
  const isEdit = !!editRecord;

  const [type, setType] = useState<RecordType>(editRecord?.type || 'expense');
  const [amount, setAmount] = useState(editRecord?.amount ? String(editRecord.amount) : '');
  const [category, setCategory] = useState(editRecord?.category || '餐饮');
  const [note, setNote] = useState(editRecord?.note || '');
  const [date, setDate] = useState(editRecord?.date || getToday());
  const [time, setTime] = useState(editRecord?.time || getCurrentTime());

  const cats = type === 'expense' ? expenseCategories : incomeCategories;

  const handleSave = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    if (isEdit) {
      updateRecord(editRecord.id, { type, amount: val, category, note: note.trim(), date, time: time || getCurrentTime() });
    } else {
      addRecord({ type, amount: val, category, note: note.trim(), date, time: time || getCurrentTime() });
    }
    navigate('/');
  };

  return (
    <div className="px-4 pt-12 stagger">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/80 dark:bg-gray-800 flex items-center justify-center apple-btn shadow-sm">
          <ArrowLeft size={18} className="text-apple-text dark:text-apple-dark-text" />
        </button>
        <h1 className="text-lg font-bold text-apple-text dark:text-apple-dark-text">{isEdit ? '编辑' : '记一笔'}</h1>
        <div className="w-9" />
      </div>

      {/* Type Toggle */}
      <div className="apple-card p-1 flex mb-4">
        {(['expense', 'income'] as const).map(t => (
          <button key={t} onClick={() => { setType(t); setCategory(t === 'expense' ? '餐饮' : '工资'); }}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors ${
              type === t ? 'bg-apple-blue text-white shadow-sm' : 'text-apple-subtext dark:text-apple-dark-subtext'
            }`}>
            {t === 'expense' ? '支出' : '收入'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="apple-card p-6 mb-4">
        <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext mb-4 text-center">金额</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => {
            const v = parseFloat(amount) || 0;
            const dec = v >= 100 ? 100 : v >= 10 ? 10 : 1;
            setAmount(String(Math.max(0, v - dec)));
          }}
            className="w-11 h-11 rounded-full flex items-center justify-center text-xl font-medium apple-btn select-none"
            style={{ background: 'rgba(60,60,67,0.06)' }}>
            <span className="text-apple-text dark:text-apple-dark-text leading-none" style={{ fontSize: 22 }}>−</span>
          </button>
          <div className="relative flex items-center">
            <span className="text-2xl font-bold text-apple-text dark:text-apple-dark-text">¥</span>
            <input autoFocus type="number" step="0.01" value={amount}
              onChange={e => setAmount(e.target.value)}
              className="text-4xl font-bold text-center bg-transparent outline-none w-44 text-apple-text dark:text-apple-dark-text [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="0" />
          </div>
          <button onClick={() => {
            const v = parseFloat(amount) || 0;
            const inc = v >= 100 ? 100 : v >= 10 ? 10 : 1;
            setAmount(String(v + inc));
          }}
            className="w-11 h-11 rounded-full flex items-center justify-center text-xl font-medium apple-btn select-none"
            style={{ background: 'rgba(60,60,67,0.06)' }}>
            <span className="text-apple-text dark:text-apple-dark-text leading-none" style={{ fontSize: 22 }}>+</span>
          </button>
        </div>
      </div>

      {/* Category */}
      <div className="apple-card p-5 mb-4">
        <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext mb-3 font-medium">分类</p>
        <div className="grid grid-cols-4 gap-3">
          {cats.map(c => (
            <button key={c.name} onClick={() => setCategory(c.name)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all apple-btn ${
                category === c.name
                  ? 'bg-apple-blue/10 border border-apple-blue/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              <span className="text-xl">{c.icon}</span>
              <span className={`text-xs ${category === c.name ? 'text-apple-blue font-semibold' : 'text-apple-subtext dark:text-apple-dark-subtext'}`}>
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Note + Date */}
      <div className="apple-card p-5 mb-6">
        <input type="text" value={note} onChange={e => setNote(e.target.value)}
          placeholder="添加备注..."
          className="w-full bg-transparent text-sm text-apple-text dark:text-apple-dark-text outline-none pb-3 mb-3 border-b border-apple-separator dark:border-apple-dark-separator" />
        <div className="flex items-center gap-3">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="flex-1 bg-transparent text-sm text-apple-text dark:text-apple-dark-text outline-none" />
          <input type="time" value={time} onChange={e => setTime(e.target.value)}
            className="bg-transparent text-sm text-apple-text dark:text-apple-dark-text outline-none" />
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={amount !== '' && parseFloat(amount) <= 0}
        className="w-full py-3.5 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 apple-btn disabled:opacity-40"
        style={{
          background: 'linear-gradient(135deg, #4f7cff, #6b9bff)',
          color: 'white',
          boxShadow: '0 4px 14px rgba(79,124,255,0.35)',
        }}>
        <Check size={20} strokeWidth={3} />
        保存
      </button>
    </div>
  );
}
