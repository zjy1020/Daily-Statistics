import { Moon, Sun, Download, Upload, Info, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { useStore } from '../store/useStore';

export default function Profile() {
  const darkMode = useStore(s => s.darkMode);
  const toggleDarkMode = useStore(s => s.toggleDarkMode);
  const exportData = useStore(s => s.exportData);
  const addRecord = useStore(s => s.addRecord);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState('');

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
    </div>
  );
}
