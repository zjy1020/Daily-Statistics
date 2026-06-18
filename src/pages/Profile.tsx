import { Moon, Sun, Download, Upload, Info, ChevronRight, Plus, X, Check, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/helpers';
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
  const exportJSON = useStore(s => s.exportJSON);
  const importJSON = useStore(s => s.importJSON);
  const addRecord = useStore(s => s.addRecord);
  const fileRef = useRef<HTMLInputElement>(null);
  const jsonFileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState('');
  const userName = useStore(s => s.userName);
  const setUserName = useStore(s => s.setUserName);
  const avatar = useStore(s => s.avatar);
  const setAvatar = useStore(s => s.setAvatar);
  const clearAllData = useStore(s => s.clearAllData);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const bio = useStore(s => s.bio);
  const setBio = useStore(s => s.setBio);
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');

  const AVATAR_EMOJIS = ['👤', '😀', '😎', '🤩', '😺', '🐶', '🐼', '🦊', '🐯', '🦄', '🌈', '⭐', '🔥', '💪', '🎵', '🎨', '🌸', '🍀', '🌊', '🏔️', '🚀', '🏀', '⚽', '🎮', '📚', '💻', '📷', '🎧'];

  // Category management
  const records = useStore(s => s.records);
  const budgets = useStore(s => s.budgets);
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

  let capFilesystem: any = null;
  let capShare: any = null;
  const getCap = async () => {
    if (!capFilesystem) capFilesystem = await import('@capacitor/filesystem');
    if (!capShare) capShare = await import('@capacitor/share');
    return { Filesystem: capFilesystem.Filesystem, Directory: capFilesystem.Directory, Encoding: capFilesystem.Encoding, Share: capShare.Share };
  };

  const handleExport = async () => {
    const csv = exportData();
    try {
      const { Filesystem, Directory, Encoding, Share } = await getCap();
      const r = await Filesystem.writeFile({ path: 'export.csv', data: csv, directory: Directory.Cache, encoding: Encoding.UTF8 });
      await Share.share({ files: [r.uri] });
    } catch {
      window.location.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    }
  };

  const handleExportJSON = async () => {
    const json = '﻿' + exportJSON();
    try {
      const { Filesystem, Directory, Encoding, Share } = await getCap();
      const r = await Filesystem.writeFile({ path: 'export.json', data: json, directory: Directory.Cache, encoding: Encoding.UTF8 });
      await Share.share({ files: [r.uri] });
    } catch {
      window.location.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(exportJSON());
    }
  };

  const handleImportJSON = () => {
    jsonFileRef.current?.click();
  };

  const handleJSONFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = importJSON(text);
      setImportMsg(result);
      e.target.value = '';
    };
    reader.readAsText(file, 'UTF-8');
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
      icon: Download,
      label: '备份数据',
      right: <button onClick={handleExportJSON} className="text-apple-blue text-sm font-medium">备份 JSON</button>,
    },
    {
      icon: Upload,
      label: '恢复数据',
      right: <button onClick={handleImportJSON} className="text-apple-blue text-sm font-medium">恢复 JSON</button>,
    },
    {
      icon: Trash2,
      label: '清除所有数据',
      right: <button onClick={() => setShowClearConfirm(true)} className="text-apple-red text-sm font-medium">清除</button>,
    },
    {
      icon: BookOpen,
      label: '使用教程',
      right: <ChevronRight size={16} color="#6e6e73" />,
      onClick: () => setShowTutorial(true),
    },
    {
      icon: Info,
      label: '关于应用',
      right: <ChevronRight size={16} color="#6e6e73" />,
      onClick: () => setShowAbout(true),
    },
  ];

  return (
    <div className="px-4 pt-12 stagger">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-8">
        <button onClick={() => setShowAvatarPicker(true)}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-apple-blue to-blue-400 flex items-center justify-center text-3xl text-white shadow-lg mb-3 apple-btn relative group overflow-hidden">
          {avatar.startsWith('data:') ? (
            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            avatar || '👤'
          )}
          <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <Pencil size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
        {editingName ? (
          <div className="flex items-center gap-2">
            <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
              className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-700 text-lg font-bold text-apple-text dark:text-apple-dark-text outline-none text-center w-40"
              autoFocus onKeyDown={e => { if (e.key === 'Enter') { setUserName(nameInput); setEditingName(false); } }} />
            <button onClick={() => { setUserName(nameInput); setEditingName(false); }}
              className="p-1.5 rounded-full bg-apple-blue text-white apple-btn">
              <Check size={14} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-apple-text dark:text-apple-dark-text">{userName || '用户'}</h2>
            <button onClick={() => { setNameInput(userName); setEditingName(true); }}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 apple-btn">
              <Pencil size={14} color="#6e6e73" />
            </button>
          </div>
        )}
        {/* Bio */}
        {editingBio ? (
          <div className="flex flex-col items-center gap-2 mt-2 w-full max-w-xs">
            <textarea value={bioInput} onChange={e => setBioInput(e.target.value)}
              className="w-full px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-700 text-sm text-apple-text dark:text-apple-dark-text outline-none resize-none text-center"
              rows={2} maxLength={100}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setBio(bioInput); setEditingBio(false); } }} />
            <button onClick={() => { setBio(bioInput); setEditingBio(false); }}
              className="px-4 py-1.5 rounded-full bg-apple-blue text-white text-xs font-semibold apple-btn">
              保存
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mt-1 max-w-xs">
            <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext text-center">{bio || '添加个人简介...'}</p>
            <button onClick={() => { setBioInput(bio); setEditingBio(true); }}
              className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 apple-btn shrink-0">
              <Pencil size={12} color="#6e6e73" />
            </button>
          </div>
        )}
      </div>

      {/* Settings */}
      <input ref={fileRef} type="file" accept="text/csv,text/comma-separated-values,application/csv,.csv,text/plain" onChange={handleFileChange} className="hidden" />
      <input ref={jsonFileRef} type="file" accept="application/json,.json" onChange={handleJSONFileChange} className="hidden" />
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
            <div key={i} onClick={item.onClick || undefined}
              className={`flex items-center justify-between px-4 py-3.5 border-b border-apple-separator dark:border-apple-dark-separator last:border-b-0 ${item.onClick ? 'apple-btn cursor-pointer' : ''}`}>
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
        记账 App v1.0.0
      </p>

      {/* Category Add/Edit Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ paddingTop: '6vh', paddingBottom: 'calc(6vh + 80px)' }}>
          <div className="fixed inset-0 bg-black/20 fade-enter" onClick={() => { setShowCatModal(false); setEditCat(null); }} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full shadow-xl modal-enter flex flex-col overflow-hidden"
            style={{ maxWidth: 360, maxHeight: '75vh' }}>
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
            <div className="px-6 overflow-y-auto min-h-0 flex-1">
              <p className="text-xs text-apple-subtext mb-2 font-medium text-center">选择图标</p>
              <div className="grid grid-cols-6 gap-2 pb-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ paddingTop: '6vh', paddingBottom: 'calc(6vh + 80px)' }}>
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

      {/* Clear Data Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ paddingTop: '6vh', paddingBottom: 'calc(6vh + 80px)' }}>
          <div className="fixed inset-0 bg-black/20 fade-enter" onClick={() => setShowClearConfirm(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full shadow-xl modal-enter" style={{ maxWidth: 320 }}>
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-sm text-apple-text dark:text-apple-dark-text mb-1 font-semibold">确定清除所有数据？</p>
              <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext mb-4">此操作不可恢复，所有记录、预算、分类将被删除</p>
              <div className="flex gap-3">
                <button onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm bg-gray-100 dark:bg-gray-700 text-apple-text apple-btn">
                  取消
                </button>
                <button onClick={() => { clearAllData(); setShowClearConfirm(false); }}
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white bg-expense apple-btn">
                  确认清除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Picker */}
      <input ref={avatarFileRef} type="file" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          setAvatar(dataUrl);
          setShowAvatarPicker(false);
          e.target.value = '';
        };
        reader.readAsDataURL(file);
      }} className="hidden" />
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ paddingTop: '6vh', paddingBottom: 'calc(6vh + 80px)' }}>
          <div className="fixed inset-0 bg-black/20 fade-enter" onClick={() => setShowAvatarPicker(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full shadow-xl modal-enter flex flex-col overflow-hidden"
            style={{ maxWidth: 360, maxHeight: '60vh' }}>
            <div className="p-6 pb-0 shrink-0">
              <h3 className="text-lg font-bold text-apple-text dark:text-apple-dark-text mb-4 text-center">选择头像</h3>
              <button onClick={() => avatarFileRef.current?.click()}
                className="w-full py-2.5 rounded-2xl text-sm font-semibold text-white apple-btn mb-4 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #4f7cff, #6b9bff)',
                  boxShadow: '0 4px 12px rgba(79,124,255,0.3)',
                }}>
                <Upload size={16} />
                上传图片
              </button>
              <p className="text-xs text-apple-subtext text-center mb-2 font-medium">或选择表情</p>
            </div>
            <div className="px-6 overflow-y-auto min-h-0 flex-1 pb-6">
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_EMOJIS.map(e => (
                  <button key={e} onClick={() => { setAvatar(e); setShowAvatarPicker(false); }}
                    className={`w-full aspect-square rounded-xl flex items-center justify-center text-xl apple-btn ${
                      avatar === e ? 'bg-apple-blue/10 border border-apple-blue/30 ring-2 ring-apple-blue/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ paddingTop: '4vh', paddingBottom: 'calc(4vh + 80px)' }}>
          <div className="fixed inset-0 bg-black/20 fade-enter" onClick={() => setShowTutorial(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full shadow-xl modal-enter flex flex-col overflow-hidden" style={{ maxWidth: 380, maxHeight: '82vh' }}>
            <div className="p-6 pb-0 shrink-0">
              <h3 className="text-xl font-bold text-apple-text dark:text-apple-dark-text text-center mb-1">使用教程</h3>
              <p className="text-xs text-apple-subtext text-center">快速上手每日记账</p>
            </div>
            <div className="p-6 overflow-y-auto min-h-0 flex-1 text-sm text-apple-text dark:text-apple-dark-text space-y-5 leading-relaxed">
              <section>
                <h4 className="font-semibold text-base mb-1">📝 记账</h4>
                <p className="text-apple-subtext dark:text-apple-dark-subtext">点击底部导航栏「<strong>+</strong>」按钮，选择支出或收入，填写金额、分类、备注即可完成记账。支持记录具体日期和时间。</p>
              </section>
              <section>
                <h4 className="font-semibold text-base mb-1">📊 仪表盘</h4>
                <p className="text-apple-subtext dark:text-apple-dark-subtext">首页展示月度概览、今日支出、预算进度、分类统计和最近记录。点击记录可查看详情或编辑删除。左右滑动日期可切换查看不同日期的数据。</p>
              </section>
              <section>
                <h4 className="font-semibold text-base mb-1">💰 预算管理</h4>
                <p className="text-apple-subtext dark:text-apple-dark-subtext">在预算页设置月度总预算和各分类预算。也可设置每日预算限额。支持选择日期查看或修改历史预算。</p>
              </section>
              <section>
                <h4 className="font-semibold text-base mb-1">📈 数据统计</h4>
                <p className="text-apple-subtext dark:text-apple-dark-subtext">统计页支持按周/月/年切换查看收支趋势，包含饼图（分类占比）、柱状图（每日收支）、折线图（月度趋势）。点击图表分类可查看对应记录详情。</p>
              </section>
              <section>
                <h4 className="font-semibold text-base mb-1">🔍 搜索筛选</h4>
                <p className="text-apple-subtext dark:text-apple-dark-subtext">在首页点击搜索图标，可按关键词、分类、日期范围筛选记录。</p>
              </section>
              <section>
                <h4 className="font-semibold text-base mb-1">🏷️ 分类管理</h4>
                <p className="text-apple-subtext dark:text-apple-dark-subtext">在「我的」页面可以添加、编辑、删除自定义分类（支出和收入分别管理），支持选择图标。</p>
              </section>
              <section>
                <h4 className="font-semibold text-base mb-1">💾 数据导出与备份</h4>
                <p className="text-apple-subtext dark:text-apple-dark-subtext">
                  · <strong>导出 CSV</strong> — 导出所有记录为表格文件，可用 Excel 打开<br />
                  · <strong>导入 CSV</strong> — 从 CSV 文件导入记录<br />
                  · <strong>备份 JSON</strong> — 完整备份所有数据（含记录、预算、分类等）<br />
                  · <strong>恢复 JSON</strong> — 从备份文件恢复完整数据
                </p>
              </section>
              <section>
                <h4 className="font-semibold text-base mb-1">🌙 深色模式</h4>
                <p className="text-apple-subtext dark:text-apple-dark-subtext">在「我的」页面切换深色/浅色模式，或跟随系统设置。</p>
              </section>
              <section>
                <h4 className="font-semibold text-base mb-1">📱 关于应用</h4>
                <p className="text-apple-subtext dark:text-apple-dark-subtext">所有数据存储在设备本地，不会上传到任何服务器。全离线可用，无需网络。</p>
              </section>
            </div>
            <div className="p-6 shrink-0 pt-0">
              <button onClick={() => setShowTutorial(false)}
                className="w-full py-3 rounded-2xl font-semibold text-sm text-white apple-btn"
                style={{
                  background: 'linear-gradient(135deg, #4f7cff, #6b9bff)',
                  boxShadow: '0 4px 12px rgba(79,124,255,0.3)',
                }}>
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (() => {
        const totalExpense = records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
        const totalIncome = records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
        const firstRecord = records.length > 0 ? records.reduce((a, b) => a.createdAt < b.createdAt ? a : b) : null;
        const daysSince = firstRecord ? Math.floor((Date.now() - firstRecord.createdAt) / 86400000) : 0;
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ paddingTop: '6vh', paddingBottom: 'calc(6vh + 80px)' }}>
          <div className="fixed inset-0 bg-black/20 fade-enter" onClick={() => setShowAbout(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full shadow-xl modal-enter overflow-hidden" style={{ maxWidth: 340 }}>
            <div className="pt-8 pb-2 px-6 text-center">
              <img src="/favicon.png" alt="icon" className="w-16 h-16 mx-auto mb-3 rounded-2xl shadow-lg object-cover" />
              <h3 className="text-xl font-bold text-apple-text dark:text-apple-dark-text mb-0.5">每日记账</h3>
              <p className="text-xs text-apple-subtext mb-5">v1.0.0</p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 mb-4 text-left space-y-3">
                {firstRecord && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-apple-subtext">已记账</span>
                    <span className="text-apple-text dark:text-apple-dark-text font-semibold">{daysSince} 天</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-apple-subtext">总支出</span>
                  <span className="text-expense font-semibold">{formatCurrency(totalExpense)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-apple-subtext">总收入</span>
                  <span className="text-income font-semibold">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="border-t border-apple-separator dark:border-apple-dark-separator pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-apple-subtext">记录</span>
                    <span className="text-apple-text dark:text-apple-dark-text font-medium">{records.length} 笔</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1.5">
                    <span className="text-apple-subtext">预算</span>
                    <span className="text-apple-text dark:text-apple-dark-text font-medium">{budgets.length} 个</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => setShowAbout(false)}
                className="w-full py-3 rounded-2xl font-semibold text-sm text-white apple-btn"
                style={{
                  background: 'linear-gradient(135deg, #4f7cff, #6b9bff)',
                  boxShadow: '0 4px 12px rgba(79,124,255,0.3)',
                }}>
                知道了
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
