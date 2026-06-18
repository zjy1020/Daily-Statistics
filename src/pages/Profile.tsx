import { Moon, Sun, Download, Upload, Info, ChevronRight, Plus, X, Check } from 'lucide-react';
import { useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import type { Category } from '../types';

const CATEGORY_EMOJIS = [
  '🍽️', '🛍️', '🚗', '🎬', '📚', '🏠', '💊', '📦',
  '💼', '🧧', '🏆', '💻', '💰', '🎮', '☕', '🍺',
  '✈️', '🏥', '🎓', '👕', '🐱', '🐶', '🎁', '💄',
  '🚌', '🏋️', '🎵', '📱', '💡', '🔧', '🎨', '🌮',
  '🍜', '🎯', '🎪', '🏖️', '🏔️', '🎭', '📷', '🎧',
];

export default function Profile() {
  const darkMode = useStore(s => s.darkMode);
  const toggleDarkMode = useStore(s => s.toggleDarkMode);
  const exportData = useStore(s => s.exportData);
  const addRecord = useStore(s => s.addRecord);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState('');

  // Category management
  const records = useStore(s => s.records);
  const customExpenseCategories = useStore(s => s.customExpenseCategories);
  const customIncomeCategories = useStore(s => s.customIncomeCategories);
  const addCategory = useStore(s => s.addCategory);
  const updateCategory = useStore(s => s.updateCategory);
  const deleteCategory = useStore(s => s.deleteCategory);
  const getExpenseCategories = useStore(s => s.getExpenseCategories);
  const getIncomeCategories = useStore(s => s.getIncomeCategories);
  const [catTab, setCatTab] = useState<'expense' | 'income'>('expense');
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ name: string; count: number } | null>(null);

  const allCats = catTab === 'expense' ? getExpenseCategories() : getIncomeCategories();
  const customCats = catTab === 'expense' ? customExpenseCategories : customIncomeCategories;
  const isCustom = (name: string) => customCats.some(c => c.name === name);

  const openAddCat = () => {
    setEditCat(null);
    setCatName('');
    setCatIcon('📦');
    setShowCatModal(true);
  };

  const openEditCat = (c: Category) => {
    setEditCat(c);
    setCatName(c.name);
    setCatIcon(c.icon);
    setShowCatModal(true);
  };

  const handleSaveCat = () => {
    const name = catName.trim();
    if (!name || !catIcon) return;
    // Check duplicate name
    const exists = allCats.some(c => c.name === name && (!editCat || c.name !== editCat.name));
    if (exists) { setImportMsg(`分类「${name}」已存在`); return; }
    if (editCat) {
      updateCategory(catTab, editCat.name, { name, icon: catIcon });
    } else {
      addCategory(catTab, { name, icon: catIcon });
    }
    setShowCatModal(false);
    setEditCat(null);
  };

  const handleDeleteCat = (name: string) => {
    const inUse = records.filter(r => r.category === name).length;
    if (inUse > 0) {
      setDeleteConfirm({ name, count: inUse });
    } else {
      deleteCategory(catTab, name);
    }
  };

  const handleExport = () => {
    const csv = exportData();
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `记账数据_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMsg('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        setImportMsg('文件为空或格式不正确');
        return;
      }

      let success = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length < 4) continue;

        let date, time, typeLabel, category, amountStr, note;

        if (cols.length >= 6) {
          // New format: 日期,时间,类型,分类,金额,备注
          [date, time, typeLabel, category, amountStr, ...note] = cols;
        } else {
          // Old format: 日期,类型,分类,金额,备注
          time = '';
          [date, typeLabel, category, amountStr, ...note] = cols;
        }

        const amount = parseFloat(amountStr);
        if (!amount || amount <= 0) continue;
        const type = typeLabel === '收入' ? 'income' : 'expense';
        addRecord({ type, amount, category, note: note.join(',').trim(), date, time: time || undefined });
        success++;
      }

      setImportMsg(`成功导入 ${success} 条记录`);
      e.target.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  };

  const items = [
    {
      icon: darkMode ? Moon : Sun,
      label: '深色模式',
      right: (
        <button onClick={toggleDarkMode}
          className={`w-11 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-apple-blue' : 'bg-gray-300'}`}>
          <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${
            darkMode ? 'left-[22px]' : 'left-0.5'
          }`} />
        </button>
      ),
    },
    {
      icon: Download,
      label: '导出数据',
      right: <button onClick={handleExport} className="text-apple-blue text-sm font-medium">导出 CSV</button>,
    },
    {
      icon: Upload,
      label: '导入数据',
      right: <button onClick={handleImport} className="text-apple-blue text-sm font-medium">导入 CSV</button>,
    },
    {
      icon: Info,
      label: '关于应用',
      right: <ChevronRight size={16} color="#6e6e73" />,
    },
  ];

  return (
    <div className="px-4 pt-12 stagger">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-apple-blue to-blue-400 flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-3">
          U
        </div>
        <h2 className="text-xl font-bold text-apple-text dark:text-apple-dark-text">用户</h2>
        <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext">user@email.com</p>
      </div>

      {/* Settings */}
      <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
      {importMsg && (
        <div className="apple-card p-4 mb-4 text-center">
          <p className="text-sm text-apple-text dark:text-apple-dark-text font-medium">{importMsg}</p>
        </div>
      )}
      {/* Category Management */}
      <div className="apple-card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-apple-text dark:text-apple-dark-text">分类管理</h3>
          <button onClick={openAddCat}
            className="px-3.5 py-1.5 rounded-full bg-apple-blue text-white text-xs font-semibold flex items-center gap-1 apple-btn shadow-sm"
            style={{ boxShadow: '0 3px 10px rgba(79,124,255,0.3)' }}>
            <Plus size={13} strokeWidth={3} />
            添加
          </button>
        </div>
        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 mb-4">
          {(['expense', 'income'] as const).map(t => (
            <button key={t} onClick={() => setCatTab(t)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                catTab === t ? 'bg-white dark:bg-gray-600 text-apple-text dark:text-apple-dark-text shadow-sm' : 'text-apple-subtext dark:text-apple-dark-subtext'
              }`}>
              {t === 'expense' ? '支出' : '收入'}
            </button>
          ))}
        </div>
        {/* Categories grid */}
        {allCats.length > 0 ? (
          <div className="grid grid-cols-4 gap-2.5">
            {allCats.map(c => {
              const custom = isCustom(c.name);
              return (
                <div key={c.name} className="relative flex flex-col items-center gap-1 py-2 rounded-xl apple-btn"
                  onClick={() => custom ? openEditCat(c) : null}
                  style={{ cursor: custom ? 'pointer' : 'default' }}>
                  <span className="text-lg">{c.icon}</span>
                  <span className="text-[11px] text-apple-subtext dark:text-apple-dark-subtext truncate max-w-full">{c.name}</span>
                  {custom && (
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCat(c.name); }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center apple-btn shadow-sm">
                      <X size={9} strokeWidth={3} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-apple-subtext text-center py-4">暂无分类</p>
        )}
      </div>

      <div className="apple-card px-1 py-2 mb-4">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center justify-between px-4 py-3.5 border-b border-apple-separator dark:border-apple-dark-separator last:border-b-0">
              <div className="flex items-center gap-3">
                <Icon size={20} color="#4f7cff" />
                <span className="text-sm text-apple-text dark:text-apple-dark-text">{item.label}</span>
              </div>
              {item.right}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-apple-subtext dark:text-apple-dark-subtext">
        记账 App v1.0.0 · 数据存储于本地
      </p>

      {/* Category Add/Edit Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-black/20 fade-enter" onClick={() => { setShowCatModal(false); setEditCat(null); }} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full shadow-xl modal-enter flex flex-col"
            style={{ maxWidth: 360, maxHeight: '85vh' }}>
            {/* Fixed header */}
            <div className="p-6 pb-0 shrink-0">
              <h3 className="text-lg font-bold text-apple-text dark:text-apple-dark-text mb-4">
                {editCat ? '编辑分类' : '添加分类'}
              </h3>
              <input type="text" value={catName} onChange={e => setCatName(e.target.value)}
                placeholder="分类名称"
                className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-sm text-apple-text dark:text-apple-dark-text outline-none mb-4 text-center" />
            </div>

            {/* Scrollable emoji picker */}
            <div className="px-6 overflow-y-auto min-h-0">
              <p className="text-xs text-apple-subtext mb-2 font-medium text-center">选择图标</p>
              <div className="grid grid-cols-6 gap-2">
                {CATEGORY_EMOJIS.map(e => (
                  <button key={e} onClick={() => setCatIcon(e)}
                    className={`w-full aspect-square rounded-xl flex items-center justify-center text-lg apple-btn ${
                      catIcon === e ? 'bg-apple-blue/10 border border-apple-blue/30 ring-2 ring-apple-blue/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Fixed actions */}
            <div className="p-6 shrink-0">
              <div className="flex gap-3">
                <button onClick={() => { setShowCatModal(false); setEditCat(null); }}
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm bg-gray-100 dark:bg-gray-700 text-apple-text dark:text-apple-dark-text apple-btn">
                  取消
                </button>
                <button onClick={handleSaveCat} disabled={!catName.trim() || !catIcon}
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white apple-btn disabled:opacity-40 flex items-center justify-center gap-1.5"
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

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-black/20 fade-enter" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full shadow-xl modal-enter" style={{ maxWidth: 320 }}>
            <div className="p-6 text-center">
              <p className="text-sm text-apple-text dark:text-apple-dark-text mb-4">
                分类「{deleteConfirm.name}」已被 <span className="font-semibold">{deleteConfirm.count}</span> 条记录使用，确定删除？
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm bg-gray-100 dark:bg-gray-700 text-apple-text apple-btn">
                  取消
                </button>
                <button onClick={() => {
                  deleteCategory(catTab, deleteConfirm.name);
                  setDeleteConfirm(null);
                }}
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white bg-expense apple-btn">
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
