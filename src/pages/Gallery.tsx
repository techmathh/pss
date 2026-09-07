import React, { useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import Layout from '../components/ui/Layout';
import { Image as ImageIconSVG, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '../lib/useSettings';

interface GalleryAlbum {
  id: string;
  title: string;
  photos?: string[];
}

export default function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const { settings } = useSettings();

  const { data: galleries = [], isLoading } = useQuery<GalleryAlbum[]>({
    queryKey: ['galleries'],
    queryFn: async () => {
      try {
        const q = query(collection(db, 'galleries'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryAlbum));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'galleries');
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Layout>
      <Helmet>
        <title>Galeri Foto | {settings.name || 'Pencak Silat'}</title>
        <meta property="og:title" content={`Galeri Foto | ${settings.name}`} />
        <meta property="og:description" content={`Galeri kegiatan dokumentasi ${settings.name}.`} />
        <meta property="og:image" content={settings.logoUrl || '/og-default.jpg'} />
        <meta property="og:type" content="website" />
      </Helmet>
      <section className="py-24 px-4 bg-transparent min-h-[80vh] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-6 uppercase tracking-tight">Galeri Dokumentasi</h1>
            <div className="w-24 h-1 bg-red-600 mx-auto rounded-full mb-6 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
            <p className="text-slate-300 font-light max-w-2xl mx-auto text-lg">Dokumentasi kegiatan dan momen berharga yang telah kami lalui bersama.</p>
          </div>
          
          {isLoading ? (
             <div className="space-y-16">
               {[1, 2].map((i) => (
                 <div key={i} className="bg-slate-900/50 backdrop-blur-md rounded-[2rem] p-8 shadow-2xl border border-white/5">
                    <div className="mb-8 border-b border-white/10 pb-6 flex items-center justify-between">
                      <Skeleton className="h-8 w-1/3 bg-slate-800" />
                      <Skeleton className="h-6 w-16 rounded-full bg-slate-800" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="aspect-square">
                           <Skeleton className="w-full h-full rounded-2xl bg-slate-800" />
                        </div>
                      ))}
                    </div>
                 </div>
               ))}
             </div>
          ) : galleries.length > 0 ? (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="space-y-16"
             >
              {galleries.map((gallery) => (
                <div key={gallery.id} className="bg-slate-900/50 backdrop-blur-md rounded-[2rem] p-8 md:p-10 shadow-2xl border border-white/5 hover:border-red-500/20 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] transition-all">
                   <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
                     <h2 className="text-2xl font-display font-bold text-white uppercase tracking-widest leading-tight text-center md:text-left">{gallery.title}</h2>
                     <span className="bg-red-500/10 text-red-400 px-4 py-2 rounded-full text-xs font-bold tracking-widest shrink-0 border border-red-500/20 shadow-[0_0_10px_rgba(220,38,38,0.1)]">{gallery.photos?.length || 0} Foto</span>
                   </div>
                   
                   {gallery.photos && gallery.photos.length > 0 ? (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {gallery.photos.map((photoUrl: string, idx: number) => (
                         <motion.button 
                           initial={{ opacity: 0, scale: 0.8 }}
                           whileInView={{ opacity: 1, scale: 1 }}
                           viewport={{ once: true, amount: 0.2 }}
                           transition={{ duration: 0.5, delay: idx * 0.05 }}
                           type="button"
                           aria-label={`Lihat foto ${idx+1} dari ${gallery.title}`}
                           key={idx} 
                           className="aspect-square cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all relative group w-full p-0 text-left border-none focus:outline-none focus:ring-2 focus:ring-red-500"
                           onClick={() => setSelectedPhoto(photoUrl)}
                         >
                           <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/20 transition-colors z-10 flex items-center justify-center">
                             <ImageIconSVG className="text-white opacity-0 group-hover:opacity-100 transition-opacity scale-50 group-hover:scale-100" size={32} />
                           </div>
                           <img loading="lazy" src={photoUrl} alt={`Foto ${idx+1} ${gallery.title}`} width={400} height={400} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                         </motion.button>
                       ))}
                     </div>
                   ) : (
                     <div className="py-12 text-center text-slate-400 font-light flex flex-col items-center gap-3 bg-slate-900/30 rounded-2xl border border-dashed border-white/10">
                        <ImageIconSVG size={40} className="text-slate-400" />
                        <p>Belum ada foto di album ini</p>
                     </div>
                   )}
                </div>
              ))}
            </motion.div>
          ) : (
             <div className="text-center py-16 bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-white/10 border-dashed">
               <p className="text-lg font-light text-slate-400 tracking-wide">Belum ada dokumentasi galeri saat ini.</p>
             </div>
          )}
        </div>
      </section>

      {/* Lightbox / Image Viewer */}
      <AnimatePresence>
        {selectedPhoto && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex justify-center items-center p-4"
             onClick={() => setSelectedPhoto(null)}
           >
             <button 
                type="button"
                aria-label="Tutup Foto"
                className="absolute top-6 right-6 md:top-10 md:right-10 text-white p-3 bg-white/10 hover:bg-red-600 hover:text-white backdrop-blur-sm border border-white/20 rounded-full transition-all z-10 hover:scale-110"
                onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }}
             >
                <X size={24} />
             </button>
             <img loading="lazy" 
               src={selectedPhoto} 
               alt="Enlarged gallery view" 
               width={1200}
               height={800}
               className="max-w-full max-h-[90vh] object-contain shadow-2xl relative z-0" 
               onClick={(e) => e.stopPropagation()} 
             />
           </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
