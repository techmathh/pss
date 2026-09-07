import React from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import Layout from '../components/ui/Layout';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../components/ui/Skeleton';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '../lib/useSettings';

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl?: string;
}

export default function Kegiatan() {
  const { settings } = useSettings();
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: async () => {
      try {
        const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'activities');
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <Layout>
      <Helmet>
        <title>Kegiatan | {settings.name || 'Pencak Silat SMAN'}</title>
        <meta name="description" content={`Momen-momen berharga dari berbagai aktivitas rutin dan acara khusus organisasi ${settings.name || 'kami'}.`} />
        <meta property="og:title" content={`Program Kegiatan | ${settings.name}`} />
        <meta property="og:description" content={`Agenda dan program latihan dari ${settings.name}.`} />
        <meta property="og:image" content={settings.logoUrl || '/og-default.jpg'} />
        <meta property="og:type" content="website" />
      </Helmet>
      <section className="py-24 px-4 bg-transparent min-h-[80vh] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-6 uppercase tracking-tight">Galeri Kegiatan</h1>
            <div className="w-24 h-1 bg-red-600 mx-auto rounded-full mb-6 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
            <p className="text-slate-300 font-light max-w-2xl mx-auto text-lg">Momen-momen berharga dari berbagai aktivitas rutin dan acara khusus organisasi kami.</p>
          </motion.div>
          
          {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="bg-slate-900/50 backdrop-blur-md rounded-[2rem] shadow-2xl border border-white/5 overflow-hidden">
                   <Skeleton className="aspect-video w-full rounded-none bg-slate-800" />
                   <div className="p-8 space-y-4">
                     <Skeleton className="h-4 w-1/4 bg-slate-800" />
                     <Skeleton className="h-6 w-3/4 bg-slate-800" />
                     <Skeleton className="h-4 w-full bg-slate-800" />
                     <Skeleton className="h-4 w-full bg-slate-800" />
                   </div>
                 </div>
               ))}
             </div>
          ) : activities.length > 0 ? (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
             >
              {activities.map((act) => (
                <div key={act.id} className="bg-slate-900/50 backdrop-blur-md rounded-[2rem] shadow-2xl border border-white/5 overflow-hidden group hover:border-red-500/20 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] transition-all hover:-translate-y-2">
                   {act.imageUrl ? (
                     <div className="aspect-video w-full relative overflow-hidden bg-slate-800">
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                       <img loading="lazy" src={act.imageUrl} alt={act.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out" />
                     </div>
                   ) : (
                     <div className="aspect-video w-full bg-slate-800 flex items-center justify-center">
                       <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Image</span>
                     </div>
                   )}
                   <div className="p-8 relative z-20">
                     <p className="text-xs text-red-500 font-bold uppercase tracking-widest mb-3">{act.date}</p>
                     <h2 className="text-xl font-display font-bold text-white mb-3 uppercase tracking-wide leading-tight group-hover:text-red-400 transition-colors">{act.title}</h2>
                     <p className="text-slate-300 text-sm font-light leading-relaxed line-clamp-3">{act.description}</p>
                   </div>
                </div>
              ))}
            </motion.div>
          ) : (
             <div className="text-center text-slate-400 py-16 bg-slate-900/30 rounded-[2rem] border border-white/10 border-dashed font-light backdrop-blur-sm">Belum ada kegiatan yang dipublikasikan.</div>
          )}
        </div>
      </section>
    </Layout>
  );
}
