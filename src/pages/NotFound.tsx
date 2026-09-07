import React from 'react';
import Layout from '../components/ui/Layout';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 font-sans">
        <p className="text-8xl font-display font-black text-red-600 mb-4 drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]">404</p>
        <h1 className="text-2xl font-black text-white uppercase mb-6 tracking-widest">Halaman Tidak Ditemukan</h1>
        <p className="text-slate-400 mb-8 font-medium max-w-sm">Maaf, halaman yang Anda cari tidak ada atau mungkin telah dipindahkan.</p>
        <Link to="/" className="bg-red-600 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 hover:-translate-y-1">
          Kembali ke Beranda
        </Link>
      </div>
    </Layout>
  );
}
