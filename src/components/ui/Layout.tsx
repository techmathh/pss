import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { LogOut, LogIn, Menu, X, ExternalLink } from 'lucide-react';
import { useSettings } from '../../lib/useSettings';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);
  const { settings, loading } = useSettings();
  const location = useLocation();

  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (settings.name) {
      document.title = settings.name;
    }
  }, [settings.name]);

  const navLinks = [
    { to: '/', label: 'Beranda', exact: true },
    { to: '/profil', label: 'Profil' },
    { to: '/berita', label: 'Berita' },
    { to: '/kegiatan', label: 'Kegiatan' },
    { to: '/galeri', label: 'Galeri' },
    { to: '/prestasi', label: 'Prestasi' },
    { to: '/pengurus', label: 'Pengurus' },
    { to: '/absensi', label: 'Absensi' },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col font-sans bg-[#0c0e12] text-slate-300 selection:bg-red-500 selection:text-white relative">
        {/* Global Background Elements */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/10 via-[#0c0e12] to-[#0c0e12] pointer-events-none z-0"></div>
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\\' fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'/%3E%3C/svg%3E')", backgroundSize: '100px 100px' }}></div>
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none z-0" style={{ backgroundImage: "linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
      
      <header className={`text-white z-[105] transition-all duration-300 font-display sticky top-0 ${(isScrolled && !mobileMenuOpen) ? 'bg-[#0c0e12]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-transparent border-b border-transparent'} ${isVisible || mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            {/* Logo - Left Side */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3">
                {loading ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse shrink-0"></div>
                    <div className="hidden sm:flex flex-col gap-2">
                      <div className="h-3 w-24 bg-slate-800 rounded animate-pulse"></div>
                      <div className="h-3 w-32 bg-slate-800 rounded animate-pulse"></div>
                    </div>
                  </>
                ) : settings.logoUrl ? (
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <img fetchPriority="high" src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="font-black text-3xl tracking-tighter italic shrink-0 text-[#ff2a2a]">
                     {settings.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'P'}
                  </div>
                )}
                {!loading && !settings.logoUrl && (
                  <div className="hidden sm:flex flex-col overflow-hidden text-left">
                    <span className="font-bold text-xs uppercase tracking-widest leading-none mb-1 text-[#ff2a2a] truncate">
                      {settings.name?.split(' ')[0] || 'PENCAK'}
                    </span>
                    <span className="font-bold text-xs uppercase tracking-widest leading-none text-slate-200 truncate">
                      {settings.name?.split(' ').slice(1).join(' ') || 'SILAT'}
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Actions & Navigation - Right Side */}
            <div className="flex items-center gap-4 sm:gap-6 justify-end">
              <nav className="hidden lg:flex items-center space-x-1 bg-[#131722]/80 border border-white/10 p-1 rounded-full backdrop-blur-md">
                {navLinks.map(link => {
                  const isActive = link.exact 
                    ? location.pathname === link.to 
                    : location.pathname.startsWith(link.to);
                  return (
                    <Link key={link.to} to={link.to} className={`px-4 xl:px-5 py-2 xl:py-2.5 rounded-full text-[10px] xl:text-[11px] font-black uppercase tracking-widest transition-all duration-300
                      ${isActive ? 'bg-[#ff2a2a] text-white shadow-[0_0_20px_rgba(255,42,42,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden lg:flex items-center gap-2 xl:gap-3">
                <Link to="/pendaftaran" className="bg-white/5 hover:bg-white/10 text-white px-5 xl:px-6 py-2.5 xl:py-3 rounded-full font-bold transition-all border border-white/10 uppercase tracking-widest text-[10px] xl:text-[11px] backdrop-blur-md">
                  Daftar
                </Link>
                
                {user ? (
                   <div className="flex items-center gap-2">
                     {['developer', 'admin', 'pengurus'].includes(role || '') && (
                       <Link to="/admin" className="p-3 rounded-full border border-white/10 bg-[#131722]/80 hover:bg-white/10 transition-all text-white backdrop-blur-md" title="Admin Dashboard">
                          <ExternalLink size={16} />
                       </Link>
                     )}
                     <button type="button" aria-label="Logout Akun" onClick={logout} title="Logout" className="p-3 rounded-full border border-white/10 bg-[#131722]/80 hover:bg-white/10 transition-all text-white backdrop-blur-md">
                       <LogOut size={16} />
                     </button>
                   </div>
                ) : (
                  <Link to="/login" className="p-3 rounded-full border border-white/10 bg-[#131722]/80 hover:bg-white/10 transition-all text-white backdrop-blur-md" title="Login">
                    <LogIn size={16} />
                  </Link>
                )}
              </div>

              <button type="button" aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'} className="lg:hidden p-2 -mr-2 text-slate-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[#0c0e12]/95 backdrop-blur-xl flex flex-col pt-24 pb-6 lg:hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#ff2a2a]/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="flex-1 flex flex-col items-center justify-start space-y-6 px-4 relative z-10 w-full overflow-y-auto">
              {navLinks.map(link => {
                const isActive = link.exact 
                  ? location.pathname === link.to 
                  : location.pathname.startsWith(link.to);
                return (
                  <Link 
                     key={link.to} 
                     to={link.to} 
                     className={`block font-display font-medium text-2xl transition-all duration-300 ${isActive ? 'text-[#ff2a2a] font-bold scale-105' : 'text-slate-300 hover:text-white'}`} 
                     onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              
              <Link
                to="/pendaftaran"
                className={`block font-display font-medium text-2xl transition-all duration-300 ${location.pathname === '/pendaftaran' ? 'text-[#ff2a2a] font-bold scale-105' : 'text-slate-300 hover:text-white'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pendaftaran
              </Link>
              
              {['developer', 'admin', 'pengurus'].includes(role || '') && (
                <Link 
                   to="/admin" 
                   className={`block font-display font-medium text-2xl transition-all duration-300 ${location.pathname.startsWith('/admin') ? 'text-[#ff2a2a] font-bold scale-105' : 'text-slate-300 hover:text-white'}`} 
                   onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              
              {user ? (
                 <button 
                    onClick={() => { logout(); setMobileMenuOpen(false); }} 
                    className="block font-display font-medium text-2xl transition-all text-[#ff2a2a] hover:text-red-400 mt-2"
                 >
                   Logout
                 </button>
              ) : (
                 <Link 
                    to="/login" 
                    className="block font-display font-medium text-2xl transition-all text-[#ff2a2a] hover:text-red-400 mt-2 hover:scale-105" 
                    onClick={() => setMobileMenuOpen(false)}
                 >
                   Login
                 </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="flex-1 flex flex-col w-full relative z-0">
        {children}
      </main>
      
      <footer className="bg-[#0f1115] text-white py-10 md:py-12 mt-auto border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 justify-between items-center md:items-start text-center md:text-left">
           <div className="w-full flex flex-col items-center md:items-start md:col-span-2">
              {loading ? (
                <>
                  <div className="h-4 w-48 bg-slate-800 rounded animate-pulse mb-3"></div>
                  <div className="h-3 w-64 bg-slate-800 rounded animate-pulse"></div>
                </>
              ) : (
                <>
                  <span className="block font-display font-bold uppercase tracking-widest text-sm text-slate-100 mb-1">{settings.name || 'Loading...'}</span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold max-w-sm leading-relaxed">{settings.motto || 'BELUM ADA MOTTO.'}</p>
                </>
              )}
           </div>

           <div className="flex flex-col gap-3 items-center md:items-start">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Navigasi</span>
             <div className="flex flex-col gap-2">
               {[['/', 'Beranda'], ['/profil', 'Profil'], ['/berita', 'Berita'], ['/prestasi', 'Prestasi'], ['/absensi', 'Absensi'], ['/pendaftaran', 'Daftar']].map(([to, label]) => (
                 <Link key={to} to={to} className="text-[10px] sm:text-xs text-slate-400 hover:text-white transition-colors uppercase tracking-widest font-medium">{label}</Link>
               ))}
             </div>
           </div>

           <div className="flex flex-col items-center md:items-start justify-center md:justify-start gap-3">
             <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Hubungi Kami</div>
             <div className="flex items-center gap-4">
               {settings.email && (
                 <a href={`mailto:${settings.email}`} className="text-slate-400 hover:text-white transition-colors" title="Email">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                 </a>
               )}
               {settings.whatsapp && (
                 <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#25D366] transition-colors" title="WhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                 </a>
               )}
               {settings.instagram && (
                 <a href={settings.instagram?.startsWith('http') ? settings.instagram : `https://instagram.com/${settings.instagram?.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E1306C] transition-colors" title="Instagram">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                 </a>
               )}
             </div>
           </div>

           <div className="md:col-span-4 text-[10px] sm:text-xs font-medium tracking-widest md:tracking-wide text-slate-500 text-center md:text-right pt-4 border-t border-white/5 md:border-t-0 md:pt-0 mt-4 md:mt-0">
             &copy; {new Date().getFullYear()} {loading ? '...' : settings.name}. All rights reserved.
           </div>
        </div>
      </footer>

      {/* Floating CTA */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Link 
              to="/pendaftaran" 
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs shadow-[0_4px_20px_rgba(220,38,38,0.5)] hover:shadow-[0_4px_30px_rgba(220,38,38,0.7)] hover:-translate-y-1 transition-all border border-red-500/50"
            >
              <span>Daftar</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  )
}
