import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart3, PlusCircle, PiggyBank, User } from 'lucide-react';

const TABS = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/statistics', icon: BarChart3, label: '统计' },
  { path: '/add', icon: PlusCircle, label: '记账' },
  { path: '/budget', icon: PiggyBank, label: '预算' },
  { path: '/profile', icon: User, label: '我的' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 pb-6 pt-2 bg-white/40 dark:bg-gray-900/45 backdrop-blur-2xl border-t border-white/30 dark:border-white/10">
      {TABS.map(tab => {
        const active = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            className="flex flex-col items-center gap-0.5 py-1 apple-btn"
            style={{ minWidth: 56 }}>
            {tab.path === '/add' ? (
              <div className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #4f7cff, #6b9bff)', boxShadow: '0 4px 12px rgba(79, 124, 255, 0.35)' }}>
                <Icon size={22} color="white" strokeWidth={2.5} />
              </div>
            ) : (
              <Icon size={24} strokeWidth={active ? 2.5 : 1.5}
                color={active ? '#4f7cff' : '#6e6e73'} />
            )}
            {tab.path !== '/add' && (
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? '#4f7cff' : '#6e6e73' }}>
                {tab.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
