import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Lock, User } from 'lucide-react';
import { useSettings } from '../lib/useSettings';

export default function Login() {
  const { login, user, role } = useAuth();
  const { settings } = useSettings();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user && role) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Gagal login. Periksa kembali username dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-transparent to-transparent"></div>
      <div className="absolute top-4 left-4 z-10">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full shadow-sm font-bold text-xs uppercase tracking-widest border border-white/10 hover:bg-white/10">
          <ArrowLeft size={16} /> Ke Website
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-2xl mb-4 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
           {settings.logoUrl ? (
             <img loading="lazy" src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-full" />
           ) : (
             <span className="font-display font-black text-2xl tracking-tighter">
               {settings.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'WE'}
             </span>
           )}
        </div>
        <h2 className="text-center text-3xl font-display font-black text-white uppercase tracking-widest">Admin Login</h2>
        <p className="mt-2 text-center text-xs text-slate-400 uppercase font-bold tracking-widest">
          Website {settings.name}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-md py-8 px-4 shadow-2xl rounded-[2rem] border border-white/5 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <p className="text-sm font-bold text-red-500 uppercase tracking-wide">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-800 border border-white/10 rounded-2xl focus:ring-0 focus:border-red-500 font-medium text-white transition-all outline-none placeholder-slate-500"
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-800 border border-white/10 rounded-2xl focus:ring-0 focus:border-red-500 font-medium text-white transition-all outline-none placeholder-slate-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-[0_0_20px_rgba(255,50,50,0.4)] text-sm font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 focus:outline-none transition-all hover:shadow-[0_0_30px_rgba(255,50,50,0.5)] hover:-translate-y-1 disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Masuk Panel Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
