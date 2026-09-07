import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthProvider, useAuth } from './lib/auth';
import { useSettings } from './lib/useSettings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Lazy loading pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Profil = lazy(() => import('./pages/Profil'));
const Kegiatan = lazy(() => import('./pages/Kegiatan'));
const Prestasi = lazy(() => import('./pages/Prestasi'));
const Pengurus = lazy(() => import('./pages/Pengurus'));
const Registration = lazy(() => import('./pages/Registration'));
const News = lazy(() => import('./pages/News'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Login = lazy(() => import('./pages/Login'));
const Absensi = lazy(() => import('./pages/Absensi'));

// Admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const RegistrationManager = lazy(() => import('./pages/admin/RegistrationManager'));
const AbsensiManager = lazy(() => import('./pages/admin/AbsensiManager'));
const ActivityManager = lazy(() => import('./pages/admin/ActivityManager'));
const AchievementManager = lazy(() => import('./pages/admin/AchievementManager'));
const BoardManager = lazy(() => import('./pages/admin/BoardManager'));
const SettingsManager = lazy(() => import('./pages/admin/SettingsManager'));
const UsersManager = lazy(() => import('./pages/admin/UsersManager'));
const ProfileSettings = lazy(() => import('./pages/admin/ProfileSettings'));
const NewsManager = lazy(() => import('./pages/admin/NewsManager'));
const GalleryManager = lazy(() => import('./pages/admin/GalleryManager'));

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-transparent to-transparent"></div>
      <div className="w-16 h-16 border-4 border-slate-800 border-t-red-600 rounded-full animate-spin mb-4 relative z-10"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse relative z-10">Memuat Data...</p>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, role, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        gcTime: 1000 * 60 * 15,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profil" element={<Profil />} />
              <Route path="/kegiatan" element={<Kegiatan />} />
              <Route path="/prestasi" element={<Prestasi />} />
              <Route path="/pengurus" element={<Pengurus />} />
              <Route path="/pendaftaran" element={<Registration />} />
              <Route path="/absensi" element={<Absensi />} />
              <Route path="/berita" element={<News />} />
              <Route path="/berita/:id" element={<NewsDetail />} />
              <Route path="/galeri" element={<Gallery />} />
              <Route path="/login" element={<Login />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['developer', 'admin', 'pengurus']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="registrations" element={<RegistrationManager />} />
                <Route path="absensi" element={<AbsensiManager />} />
                <Route path="activities" element={<ActivityManager />} />
                <Route path="achievements" element={<AchievementManager />} />
                <Route path="news" element={<NewsManager />} />
                <Route path="gallery" element={<GalleryManager />} />
                <Route path="board" element={<BoardManager />} />
                <Route path="settings" element={
                  <ProtectedRoute allowedRoles={['developer', 'admin']}>
                    <SettingsManager />
                  </ProtectedRoute>
                } />
                <Route path="users" element={
                  <ProtectedRoute allowedRoles={['developer', 'admin']}>
                    <UsersManager />
                  </ProtectedRoute>
                } />
                <Route path="profile" element={<ProfileSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
}
