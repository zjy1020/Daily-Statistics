import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddRecord from './pages/AddRecord';
import Statistics from './pages/Statistics';
import Budget from './pages/Budget';
import Profile from './pages/Profile';
import { useStore } from './store/useStore';
import { useEffect } from 'react';

function AppContent() {
  const darkMode = useStore(s => s.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddRecord />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return <AppContent />;
}
