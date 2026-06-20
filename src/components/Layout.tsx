import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Clock, User as UserIcon, LogOut, CheckSquare, Users, Shield, Database, FileBarChart, PieChart, LineChart, Briefcase, Bell, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Layout() {
  const { user, logout, isLoading } = useAuth();
  const { config } = useConfig();
  const location = useLocation();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const navItems = getNavItems(user.role);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-slate-800 font-sans max-w-md mx-auto shadow-xl relative overflow-hidden bg-white sm:border-x border-slate-200">
      
      {/* Top App Bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          {config.logoUrl ? (
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
              <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {config.appName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-900 leading-none">{config.appName}</h1>
            <p className="text-[10px] text-slate-500 font-medium max-w-[120px] truncate">{config.schoolName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800">{user.name}</p>
            <p className="text-[10px] text-slate-500">{user.role.replace('_', ' ')}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 scroll-smooth relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed sm:absolute bottom-0 w-full bg-white border-t border-slate-200 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-20 overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style dangerouslySetInnerHTML={{ __html: `nav::-webkit-scrollbar { display: none; }` }} />
        <div className="flex sm:justify-around text-center items-center h-16 min-w-max sm:min-w-0 px-2 sm:px-0">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-[60px] sm:w-full h-full gap-0.5 transition-colors relative mx-0.5",
                  isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-medium tracking-wide truncate max-w-full text-center">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute top-0 w-8 h-1 bg-blue-600 rounded-b-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function getNavItems(role: string) {
  const base = [
    { label: 'Dashboard', path: '/', icon: Home },
  ];

  if (role === 'GURU') {
    return [
      ...base,
      { label: 'Jurnal', path: '/journals', icon: BookOpen },
      { label: 'Prakerin', path: '/prakerin', icon: Briefcase },
      { label: 'Profil', path: '/profile', icon: UserIcon },
    ];
  }

  if (role === 'SUPER_ADMIN') {
    return [
      ...base,
      { label: 'User', path: '/users', icon: Users },
      { label: 'Sistem', path: '/system', icon: Shield },
      { label: 'Profil', path: '/profile', icon: UserIcon },
    ];
  }

  if (role === 'ADMIN') {
    return [
      ...base,
      { label: 'Master', path: '/master', icon: Database },
      { label: 'Jurnal Masuk', path: '/journals', icon: BookOpen },
      { label: 'Profil', path: '/profile', icon: UserIcon },
    ];
  }

  if (role === 'WAKA_KURIKULUM') {
    return [
      ...base,
      { label: 'Jurnal', path: '/journals', icon: BookOpen },
      { label: 'Supervisi', path: '/supervision', icon: Shield },
      { label: 'Laporan', path: '/laporan', icon: FileBarChart },
      { label: 'Kalender', path: '/kalender', icon: Calendar },
      { label: 'Notifikasi', path: '/notifikasi', icon: Bell },
      { label: 'Prakerin', path: '/prakerin', icon: Briefcase },
      { label: 'Profil', path: '/profile', icon: UserIcon },
    ];
  }

  if (role === 'KEPALA_SEKOLAH') {
    return [
      ...base,
      { label: 'Supervisi', path: '/supervision', icon: Shield },
      { label: 'Laporan', path: '/laporan', icon: FileBarChart },
      { label: 'Statistik', path: '/statistics', icon: LineChart },
      { label: 'Kalender', path: '/kalender', icon: Calendar },
      { label: 'Notifikasi', path: '/notifikasi', icon: Bell },
      { label: 'Prakerin', path: '/prakerin', icon: Briefcase },
      { label: 'Profil', path: '/profile', icon: UserIcon },
    ];
  }

  return base;
}
