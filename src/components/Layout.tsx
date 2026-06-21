import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useStore } from '../store/useStore';

export default function Layout() {
  const darkMode = useStore(s => s.darkMode);
  const wallpaperEnabled = useStore(s => s.wallpaperEnabled);
  const wallpaperUrl = useStore(s => s.wallpaperUrl);
  const wallpaperBlur = useStore(s => s.wallpaperBlur);
  const wallpaperPositionX = useStore(s => s.wallpaperPositionX);
  const wallpaperPositionY = useStore(s => s.wallpaperPositionY);
  const location = useLocation();

  return (
    <>
      {wallpaperEnabled ? (
        <div className="fixed inset-0 overflow-hidden">
          <img
            src={wallpaperUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: `blur(${wallpaperBlur}px)`,
              transform: 'scale(1.15)',
              objectPosition: `${wallpaperPositionX}% ${wallpaperPositionY}%`,
            }}
          />
          {darkMode && <div className="absolute inset-0 bg-black/45" />}
        </div>
      ) : (
        <div className="fixed inset-0 bg-apple-bg dark:bg-apple-dark-bg" />
      )}
      {/* Content */}
      <div className="relative min-h-screen" style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 100 }}>
        <div className="page-enter" key={location.pathname}>
          <Outlet />
        </div>
        {location.pathname !== '/profile/edit' && <BottomNav />}
      </div>
    </>
  );
}
