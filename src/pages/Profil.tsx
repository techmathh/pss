import React from 'react';
import Layout from '../components/ui/Layout';
import { useSettings } from '../lib/useSettings';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

export default function Profil() {
  const { settings, loading } = useSettings();

  return (
    <Layout>
      <Helmet>
        <title>Profil | {settings.name || 'Pencak Silat SMAN'}</title>
        <meta name="description" content={settings.aboutText ? (settings.aboutText.substring(0, 155) + (settings.aboutText.length > 155 ? '...' : '')) : 'Profil ekstrakurikuler pencak silat'} />
        <meta property="og:title" content={`Profil | ${settings.name}`} />
        <meta property="og:description" content={settings.aboutText ? (settings.aboutText.substring(0, 155) + (settings.aboutText.length > 155 ? '...' : '')) : 'Profil organisasi'} />
        <meta property="og:image" content={settings.logoUrl || '/og-default.jpg'} />
        <meta property="og:type" content="website" />
      </Helmet>
      <section className="py-24 px-4 bg-transparent min-h-[80vh] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/30 via-transparent to-transparent"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
             <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-6 uppercase tracking-tight">Profil Organisasi</h1>
            <div className="w-24 h-1 bg-red-600 mx-auto rounded-full mb-8 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
            <div className="text-lg md:text-2xl text-slate-300 leading-relaxed font-light max-w-3xl mx-auto whitespace-pre-line justify-center">
              {loading ? (
                <>
                  <div className="h-6 md:h-8 w-full bg-slate-800 rounded animate-pulse mb-3"></div>
                  <div className="h-6 md:h-8 w-5/6 mx-auto bg-slate-800 rounded animate-pulse mb-3"></div>
                  <div className="h-6 md:h-8 w-4/6 mx-auto bg-slate-800 rounded animate-pulse"></div>
                </>
              ) : (
                <p>{settings.aboutText}</p>
              )}
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <motion.div 
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
               className="bg-slate-900/50 backdrop-blur-md p-10 md:p-14 rounded-[2rem] shadow-2xl border border-white/5"
             >
               <h2 className="text-red-500 font-display font-black text-3xl uppercase tracking-widest mb-6">Visi</h2>
               {loading ? (
                 <>
                   <div className="h-4 w-full bg-slate-800 rounded animate-pulse mb-2"></div>
                   <div className="h-4 w-3/4 bg-slate-800 rounded animate-pulse mb-2"></div>
                   <div className="h-4 w-5/6 bg-slate-800 rounded animate-pulse"></div>
                 </>
               ) : (
                 <p className="text-slate-300 font-light whitespace-pre-line leading-relaxed text-lg">{settings.vision}</p>
               )}
             </motion.div>
             <motion.div 
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
               className="bg-red-900/10 backdrop-blur-md p-10 md:p-14 rounded-[2rem] shadow-2xl border border-red-500/20 relative overflow-hidden"
             >
               <div className="absolute top-0 right-0 p-32 bg-red-600/10 blur-3xl rounded-full"></div>
               <h2 className="text-white font-display font-black text-3xl uppercase tracking-widest mb-6 relative z-10">Misi</h2>
               <p className="text-slate-300 font-light whitespace-pre-line leading-relaxed text-lg relative z-10">
                 {loading ? (
                   <>
                     <span className="block h-4 w-full bg-slate-800 rounded animate-pulse mb-2"></span>
                     <span className="block h-4 w-full bg-slate-800 rounded animate-pulse mb-2"></span>
                     <span className="block h-4 w-4/5 bg-slate-800 rounded animate-pulse"></span>
                   </>
                 ) : (
                   settings.mission
                 )}
               </p>
             </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
