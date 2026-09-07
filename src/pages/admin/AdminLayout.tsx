import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/auth';
import { useSettings } from '../../lib/useSettings';
import { 
  CreditCard, 
  Users, 
  User,
  Image as ImageIcon, 
  Award, 
  Globe, 
  Database,
  ArrowLeft,
  Menu,
  X,
  Settings,
  Bell,
  Activity
} from 'lucide-react';

export default function AdminLayout() {
  const { role } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const roleBadgeColor: Record<string, string> = {
    developer: 'text-purple-400 bg-purple-900/30 border-purple-800/50',
    admin:     'text-blue-400   bg-blue-900/30   border-blue-800/50',
    pengurus:  'text-green-400  bg-green-900/30  border-green-800/50',
  };

  useEffect(() => {
    if (['developer', 'admin', 'pengurus'].includes(role || '')) {
      async function fetchCount() {
        try {
          const q = query(collection(db, 'registrations'), where('status', '==', 'pending'));
          const snap = await getCountFromServer(q);
          setPendingCount(snap.data().count);
        } catch (error) {
          console.error("Error fetching pending count", error);
        }
      }
      
      fetchCount();
      const interval = setInterval(fetchCount, 60000);
      return () => clearInterval(interval);
    }
  }, [role]);

  useEffect(() => {
    document.title = settings.name ? `${settings.name} - Admin` : 'Admin Panel';
  }, [settings.name]);
  
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <Database size={20}/>, roles: ['developer', 'admin', 'pengurus'] },
    { name: 'Pendaftar Baru', path: '/admin/registrations', icon: <Users size={20}/>, roles: ['developer', 'admin', 'pengurus'] },
    { name: 'Kelola Absensi', path: '/admin/absensi', icon: <Users size={20}/>, roles: ['developer', 'admin', 'pengurus'] },
    { name: 'Kelola Berita', path: '/admin/news', icon: <Globe size={20}/>, roles: ['developer', 'admin', 'pengurus'] },
    { name: 'Kelola Galeri', path: '/admin/gallery', icon: <ImageIcon size={20}/>, roles: ['developer', 'admin', 'pengurus'] },
    { name: 'Kelola Kegiatan', path: '/admin/activities', icon: <Activity size={20}/>, roles: ['developer', 'admin', 'pengurus'] },
    { name: 'Kelola Prestasi', path: '/admin/achievements', icon: <Award size={20}/>, roles: ['developer', 'admin', 'pengurus'] },
    { name: 'Kelola Kepengurusan', path: '/admin/board', icon: <CreditCard size={20}/>, roles: ['developer', 'admin', 'pengurus'] },
    { name: 'Pengaturan Web', path: '/admin/settings', icon: <Settings size={20}/>, roles: ['developer', 'admin'] },
    { name: 'Kelola Users', path: '/admin/users', icon: <Users size={20}/>, roles: ['developer', 'admin'] },
    { name: 'Profil Akun', path: '/admin/profile', icon: <User size={20}/>, roles: ['developer', 'admin', 'pengurus'] },
  ];

  const visibleNavs = navItems.filter(item => item.roles.includes(role || ''));

  return (
    <div className="flex h-screen bg-[#0f1115] font-sans">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out w-64 bg-[#131722] border-r border-[#1e2330] flex flex-col z-30 shrink-0`}>
        <div className="p-6 border-b border-[#1e2330] flex justify-between items-center">
          <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <div className="w-8 h-8 bg-[#0f1115] border border-[#1e2330] rounded-lg flex items-center justify-center p-0.5 text-white shadow-lg">
                  <img fetchPriority="high" src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-[#0f1115] border border-[#1e2330] rounded-lg flex items-center justify-center text-white shadow-lg">
                  <span className="font-bold text-sm tracking-tighter">
                    {settings.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'PS'}
                  </span>
                </div>
              )}
             <div>
                <h2 className="text-sm font-bold text-white tracking-wide leading-tight line-clamp-1">{settings.name}</h2>
                <h2 className="text-xs font-medium text-slate-400 tracking-wide leading-none mt-0.5">Admin Area</h2>
             </div>
          </div>
          <button type="button" aria-label="Tutup navigasi" className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="px-6 mt-4">
          <div className="bg-[#1e2330]/50 rounded-lg p-3 border border-[#1e2330] flex flex-col items-center gap-2">
             <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center">Your Role</span>
             <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-widest ${roleBadgeColor[role || ''] || 'text-slate-400 bg-slate-800 border-slate-700'}`}>
               {role}
             </span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-4">
            {visibleNavs.map(nav => {
               const isActive = location.pathname === nav.path;
               return (
                 <li key={nav.path}>
                   <Link 
                     to={nav.path}
                     onClick={() => setMobileMenuOpen(false)}
                     className={`flex items-center gap-3 py-2.5 rounded-lg transition-all font-medium text-sm tracking-wide ${isActive ? 'bg-[#1a2236] text-white border-l-2 border-blue-500 pl-[10px] pr-3 shadow-sm' : 'text-slate-400 border-l-2 border-transparent pl-[10px] pr-3 hover:bg-[#1e2330]/80 hover:text-white'}`}
                   >
                     {nav.icon}
                     <span className="font-medium text-sm">{nav.name}</span>
                   </Link>
                 </li>
               )
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-[#1e2330]">
           <Link to="/" className="flex items-center justify-center py-2.5 bg-[#1e2330]/50 hover:bg-[#1e2330] rounded-lg gap-2 font-medium text-xs tracking-wide text-slate-300 transition-all border border-[#1e2330]">
              <ArrowLeft size={16}/> Ke Website
           </Link>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#0f1115] h-[100dvh] overflow-hidden">
         <header className="bg-[#131722] shadow-sm border-b border-[#1e2330] h-16 flex items-center justify-between px-4 md:px-8 shrink-0">
            <div className="flex items-center gap-4">
              <button type="button" aria-label="Buka navigasi" className="md:hidden p-2 -ml-2 text-slate-400 hover:bg-[#1e2330] rounded-lg" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={20} />
              </button>
              <h1 className="text-xl font-bold text-white tracking-wide line-clamp-1">
                  {visibleNavs.find(n => n.path === location.pathname)?.name || 'Admin Panel'}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
               {['developer', 'admin', 'pengurus'].includes(role || '') && (
                 <Link to="/admin/registrations" className="relative p-2 text-slate-400 hover:text-white hover:bg-[#1e2330] rounded-full transition-colors group">
                    <Bell size={20} />
                    {pendingCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#131722] rounded-full group-hover:animate-ping"></span>
                    )}
                 </Link>
               )}
            </div>
         </header>
         <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <Outlet />
         </div>
      </main>
    </div>
  )
}
