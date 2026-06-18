import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useStore } from '../store/useStore';

export default function Layout() {
  const darkMode = useStore(s => s.darkMode);

  return (
    <>
      {/* Wallpaper Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: darkMode
            ? 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(/gj.png)'
            : 'url(/gj.png)',
        }}
      />
      {/* Content */}
      <div className="relative min-h-screen" style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 100 }}>
        <div className="page-enter">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </>
  );
}
