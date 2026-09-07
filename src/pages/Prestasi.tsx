import React from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import Layout from '../components/ui/Layout';
import { Award, Info } from 'lucide-react';
import { useSettings } from '../lib/useSettings';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../components/ui/Skeleton';
import Swal from 'sweetalert2';
import { Helmet } from 'react-helmet-async';

interface Achievement {
  id: string;
  title: string;
  description: string;
  year: string;
  imageUrl?: string;
}

export default function Prestasi() {
  const { settings } = useSettings();

  const showDetail = (achievement: Achievement) => {
    Swal.fire({
      title: achievement.title,
      html: `
        <div style="text-align: left;">
          <p style="color: #ef4444; font-weight: bold; font-size: 14px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Tahun ${achievement.year}</p>
          <p style="color: #cbd5e1; line-height: 1.6; font-size: 15px;">${achievement.description}</p>
        </div>
      `,
      width: 800,
      imageUrl: achievement.imageUrl || undefined,
      imageAlt: achievement.title,
      background: '#131722',
      color: '#ffffff',
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Tutup',
      customClass: {
        popup: 'border border-[#1e2330] rounded-3xl',
        title: 'text-xl font-bold font-display uppercase tracking-wide',
        image: 'rounded-xl max-h-[70vh] object-contain w-full'
      }
    });
  };

  const { data: achievements = [], isLoading } = useQuery<Achievement[]>({
    queryKey: ['achievements'],
    queryFn: async () => {
      try {
        const q = query(collection(db, 'achievements'), orderBy('year', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'achievements');
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Layout>
      <Helmet>
        <title>Prestasi | {settings.name || 'Pencak Silat SMAN'}</title>
        <meta name="description" content={`Deretan prestasi membanggakan yang telah diraih oleh siswa-siswi tangguh dari ${settings.name || 'sekolah kami'}.`} />
        <meta property="og:title" content={`Prestasi | ${settings.name}`} />
        <meta property="og:description" content={`Deretan prestasi membanggakan dari ${settings.name}.`} />
        <meta property="og:image" content={settings.logoUrl || '/og-default.jpg'} />
        <meta property="og:type" content="website" />
      </Helmet>
      <section className="py-24 px-4 bg-transparent min-h-[80vh] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900/40 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-6 uppercase tracking-tight">Prestasi Kita</h1>
            <div className="w-24 h-1 bg-red-600 mx-auto rounded-full mb-6 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
            <p className="text-slate-300 font-light max-w-2xl mx-auto text-lg">Deretan prestasi membanggakan yang telah diraih oleh siswa-siswi tangguh dari {settings.name}.</p>
          </div>
          
          {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="bg-slate-900/50 backdrop-blur-md rounded-[2rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl">
                   <Skeleton className="w-full h-48 shrink-0 rounded-none bg-slate-800" />
                   <div className="p-8 space-y-4 flex-1">
                     <Skeleton className="h-4 w-1/4 bg-slate-800" />
                     <Skeleton className="h-6 w-3/4 bg-slate-800" />
                     <Skeleton className="h-4 w-full bg-slate-800" />
                     <Skeleton className="h-4 w-full bg-slate-800" />
                   </div>
                 </div>
               ))}
             </div>
          ) : achievements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {achievements.map((item) => (
                <div key={item.id} className="bg-slate-900/50 backdrop-blur-md rounded-[2rem] border border-white/5 flex flex-col hover:border-red-500/20 transition-all group overflow-hidden shadow-2xl hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] hover:-translate-y-2">
                   {item.imageUrl && (
                      <div onClick={() => showDetail(item)} className="w-full h-56 bg-slate-800 overflow-hidden shrink-0 relative cursor-pointer">
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10 hidden sm:block pointer-events-none"></div>
                         <img loading="lazy" src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                      </div>
                   )}
                    <div className="p-8 flex gap-6 items-start flex-1 relative z-10 flex-col sm:flex-row">
                      {!item.imageUrl && (
                        <div className="bg-gradient-to-br from-red-500 to-red-700 p-4 rounded-full text-white shrink-0 shadow-[0_0_15px_rgba(220,38,38,0.3)] group-hover:scale-110 transition-transform hidden sm:block">
                          <Award size={28} />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col h-full w-full">
                        <div className="flex-1 mb-6">
                          <span className="text-red-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-3">Tahun {item.year}</span>
                          <h2 className="font-display font-bold text-xl text-white mb-3 uppercase tracking-wide leading-tight group-hover:text-red-400 transition-colors line-clamp-2">{item.title}</h2>
                          <p className="text-slate-300 text-sm font-light leading-relaxed line-clamp-3">{item.description}</p>
                        </div>
                        <div className="mt-auto">
                          <button onClick={() => showDetail(item)} className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-lg transition-colors group-hover:text-red-400 w-full justify-center sm:w-auto">
                            <Info size={16} /> Info Selengkapnya
                          </button>
                        </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-16 bg-slate-900/30 backdrop-blur-md border border-white/10 border-dashed rounded-[2rem] font-light">Belum ada data prestasi.</div>
          )}
        </div>
      </section>
    </Layout>
  );
}
