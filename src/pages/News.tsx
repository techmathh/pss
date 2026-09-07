import React from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import Layout from '../components/ui/Layout';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '../lib/useSettings';
import { Newspaper } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
}

export default function News() {
  const { settings } = useSettings();
  const { data: news = [], isLoading } = useQuery<NewsItem[]>({
    queryKey: ['news'],
    queryFn: async () => {
      try {
        const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'news');
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Layout>
      <Helmet>
        <title>Berita | {settings.name || 'Pencak Silat SMAN'}</title>
        <meta name="description" content="Kumpulan berita & pengumuman terbaru seputar kegiatan ekstrakurikuler pencak silat." />
        <meta property="og:title" content={`Berita | ${settings.name}`} />
        <meta property="og:description" content="Kumpulan berita & pengumuman terbaru seputar kegiatan kami." />
        <meta property="og:image" content={settings.logoUrl || '/og-default.jpg'} />
        <meta property="og:type" content="website" />
      </Helmet>
      <section className="py-24 px-4 bg-transparent min-h-[80vh] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-slate-900/40 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-6 uppercase tracking-tight">Berita & Pengumuman</h1>
            <div className="w-24 h-1 bg-red-600 mx-auto rounded-full mb-6 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
            <p className="text-slate-300 font-light max-w-2xl mx-auto text-lg">Informasi terkini dan pengumuman penting seputar kegiatan kami.</p>
          </div>
          
          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="bg-slate-900/50 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl border border-white/5">
                   <Skeleton className="h-48 w-full rounded-none bg-slate-800" />
                   <div className="p-8 space-y-4">
                     <Skeleton className="h-4 w-1/4 bg-slate-800" />
                     <Skeleton className="h-6 w-3/4 bg-slate-800" />
                     <Skeleton className="h-4 w-full bg-slate-800" />
                     <Skeleton className="h-4 w-full bg-slate-800" />
                   </div>
                 </div>
               ))}
             </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item) => (
                <Link to={`/berita/${item.id}`} key={item.id} className="bg-slate-900/50 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 hover:border-red-500/20 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] transition-all hover:-translate-y-2 group block">
                  <div className="h-56 overflow-hidden bg-slate-800 relative">
                     {item.imageUrl ? (
                       <img loading="lazy" src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                     ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 gap-3">
                         <Newspaper size={40} className="text-slate-600" strokeWidth={1} />
                         <span className="text-slate-600 text-[10px] uppercase tracking-[0.2em] font-bold">Belum Ada Foto</span>
                       </div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="p-8 relative z-20">
                    <p className="text-xs text-red-500 font-bold mb-4 uppercase tracking-widest">{item.date}</p>
                    <h2 className="text-xl font-display font-bold text-white mb-4 uppercase tracking-wide line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">{item.title}</h2>
                    <p className="text-slate-300 font-light line-clamp-3 mb-8 leading-relaxed">{item.content}</p>
                    <span className="text-red-400 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all uppercase tracking-wider">Baca Selengkapnya →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
             <div className="text-center py-16 bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-white/10 border-dashed">
               <p className="text-lg font-light text-slate-400 tracking-wide">Belum ada berita yang dipublikasikan saat ini.</p>
             </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
