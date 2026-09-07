import React, { useState, useEffect } from 'react';
import Layout from '../components/ui/Layout';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSettings } from '../lib/useSettings';
import { ChevronDown, Calendar, MapPin, Clock, Trophy, ChevronRight, Award, Info } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, getCountFromServer } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import Swal from 'sweetalert2';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

interface Achievement {
  id: string;
  title: string;
  description: string;
  year: string;
  imageUrl?: string;
}

export default function Home() {
  const { settings, loading } = useSettings();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 1000], [0, 300]);

  useEffect(() => {
    const q = query(collection(db, 'achievements'), orderBy('year', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const achs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
      setAchievements(achs);
      setLoadingAchievements(false);
    }, (error) => {
      console.error("Error fetching real-time achievements:", error);
      // We do not throw or alert here to prevent crashing the homepage if rules or network fail briefly.
      setLoadingAchievements(false);
    });
    return () => unsubscribe();
  }, []);

  const { data: stats = { achievements: 0, members: 0 } } = useQuery({
    queryKey: ['stats_counts'],
    queryFn: async () => {
      let achCount = 0;
      let membersCount = 0;
      try {
        const achSnap = await getCountFromServer(collection(db, 'achievements'));
        achCount = achSnap.data().count;
      } catch (err) {}
      
      try {
        const usersSnap = await getCountFromServer(collection(db, 'users'));
        membersCount = usersSnap.data().count;
      } catch (err) {}
      
      return { achievements: achCount, members: membersCount };
    },
    staleTime: 1000 * 60 * 10,
  });

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

  return (
    <Layout>
      <Helmet>
        <title>Pencak Silat SMAN 1 Kemangkon</title>
        <meta name="description" content="Website resmi ekstrakurikuler Pencak Silat SMAN 1 KEMANGKON..." />
        <meta property="og:title" content="Pencak Silat SMAN 1 Kemangkon" />
        <meta property="og:description" content="Website resmi ekstrakurikuler Pencak Silat SMAN 1 KEMANGKON..." />
        <meta property="og:image" content={settings.logoUrl || '/og-default.jpg'} />
        <meta property="og:type" content="website" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative bg-[#0f1115] text-white min-h-screen flex items-center justify-center px-4 font-sans border-b border-white/5 overflow-hidden">
        {/* Parallax Background */}
        <motion.div 
          style={{ y: yBg, backgroundImage: 'url("https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=2070&auto=format&fit=crop")' }} 
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity grayscale-[50%]"
        ></motion.div>
        
        {/* Gradient Overlay for Fade out */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/80 to-transparent z-0"></div>

        {/* Abstract Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-red-900/10 rounded-full blur-[150px] mix-blend-screen"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center z-10 pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8 inline-block bg-red-900/30 border border-red-500/30 px-6 py-2 rounded-full"
          >
            <span className="text-red-400 font-bold tracking-[0.2em] text-xs uppercase">Ekskul Pencak Silat Resmi</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-[7.5rem] font-display font-black mb-8 tracking-tighter uppercase leading-[0.9] flex flex-col items-center"
          >
            {loading ? (
              <>
                <div className="h-16 md:h-24 lg:h-32 w-3/4 bg-slate-800 rounded animate-pulse mb-4"></div>
                <div className="h-16 md:h-24 lg:h-32 w-full bg-slate-800 rounded animate-pulse"></div>
              </>
            ) : (
              <>
                <span className="text-white drop-shadow-[0_4px_24px_rgba(255,255,255,0.1)]">{settings.name.split(' ')[0] || 'PENCAK'}</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 drop-shadow-[0_4px_24px_rgba(220,38,38,0.3)] filter">{settings.name.split(' ').slice(1).join(' ') || 'SILAT SMAN'}</span>
              </>
            )}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed font-light tracking-wide"
          >
            {loading ? (
              <>
                <span className="block h-6 md:h-8 w-full bg-slate-800 rounded animate-pulse mb-3"></span>
                <span className="block h-6 md:h-8 w-5/6 mx-auto bg-slate-800 rounded animate-pulse mb-3"></span>
                <span className="block h-6 md:h-8 w-4/6 mx-auto bg-slate-800 rounded animate-pulse"></span>
              </>
            ) : (
               <>Wadah bagi siswa-siswi <strong>SMAN 1 KEMANGKON</strong> untuk melestarikan budaya bangsa, melatih kedisiplinan, dan meraih prestasi gemilang di bidang bela diri. {settings.motto}</>
            )}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link to="/pendaftaran" className="w-full sm:w-auto inline-flex justify-center items-center bg-red-600 hover:bg-red-500 text-white text-sm tracking-[0.15em] uppercase font-bold px-12 py-5 rounded-full transition-all shadow-[0_0_40px_rgba(220,38,38,0.4)] border border-red-500/50 hover:shadow-[0_0_60px_rgba(220,38,38,0.6)] hover:-translate-y-1">
              Bergabung Sekarang
            </Link>
            <Link to="/profil" className="w-full sm:w-auto inline-flex justify-center items-center bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm tracking-[0.15em] uppercase font-bold px-12 py-5 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.02)] transition-all hover:border-white/20 hover:-translate-y-1">
              Pelajari Lebih Lanjut
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Jadwal Latihan Section */}
      <section className="py-20 md:py-40 bg-[#0a0c10] border-b border-white/5 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-white uppercase tracking-tighter mb-4 md:mb-6 leading-[1.1]">Informasi <span className="text-red-500">Latihan</span></h2>
            <p className="text-slate-400 font-light text-base sm:text-lg md:text-xl max-w-2xl mx-auto">Waktu dan tempat pelaksanaan kegiatan ekstrakurikuler rutin kami.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              <motion.article 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true, amount: 0.3 }}
               transition={{ duration: 0.6, ease: "easeOut" }}
               className="bg-[#131722] p-8 md:p-10 rounded-3xl border border-[#1e2330] flex flex-col items-center text-center hover:border-red-500/50 transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] group">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0a0c10] border border-[#1e2330] text-red-500 rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-red-500/10 group-hover:scale-110 transition-all duration-300">
                 <Calendar size={32} strokeWidth={1.5} className="md:w-9 md:h-9" />
               </div>
               <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-4 uppercase tracking-widest">Hari Latihan</h3>
               <p className="text-slate-400 font-medium text-base md:text-lg leading-relaxed whitespace-pre-line min-h-[3rem]">{settings.scheduleDays || 'Jumat, Sabtu, Minggu'}</p>
             </motion.article>
             
             <motion.article 
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, amount: 0.3 }}
               transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
               className="bg-[#131722] p-8 md:p-10 rounded-3xl border border-[#1e2330] flex flex-col items-center text-center hover:border-red-500/50 transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] group">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0a0c10] border border-[#1e2330] text-red-500 rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-red-500/10 group-hover:scale-110 transition-all duration-300">
                 <Clock size={32} strokeWidth={1.5} className="md:w-9 md:h-9" />
               </div>
               <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-4 uppercase tracking-widest">Waktu</h3>
               <p className="text-slate-400 font-medium text-base md:text-lg leading-relaxed whitespace-pre-line min-h-[3rem]">{settings.scheduleTime || '15:00 - 17:00 WIB'}</p>
             </motion.article>

             <motion.article 
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true, amount: 0.3 }}
               transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
               className="bg-[#131722] p-8 md:p-10 rounded-3xl border border-[#1e2330] flex flex-col items-center text-center hover:border-red-500/50 transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] group sm:col-span-2 md:col-span-1">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0a0c10] border border-[#1e2330] text-red-500 rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-red-500/10 group-hover:scale-110 transition-all duration-300">
                 <MapPin size={32} strokeWidth={1.5} className="md:w-9 md:h-9" />
               </div>
               <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-4 uppercase tracking-widest">Tempat</h3>
               <p className="text-slate-400 font-medium text-base md:text-lg leading-relaxed whitespace-pre-line min-h-[3rem]">{settings.scheduleLocation || 'Lapangan Utama'}</p>
             </motion.article>
          </div>
        </div>
      </section>



      {/* Cara Daftar Section */}
      <section className="py-24 md:py-40 relative overflow-hidden border-b border-white/5 bg-[#0f1115]">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-900/10 text-red-400 font-bold tracking-widest text-xs uppercase mb-8">
               <Award size={16} /> Bergabung Bersama Kami
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-black text-white uppercase tracking-tighter mb-8 leading-[1.1]">Cara Daftar <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">Ekskul Silat</span></h2>
            <p className="text-slate-400 font-light text-xl mb-12 leading-relaxed">
              Tertarik untuk bergabung dan mengukir prestasi? Ikuti langkah mudah pendaftaran online berikut ini.
            </p>
            
            <ul className="space-y-10 mb-12">
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
                className="flex gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-[#131722] border border-[#1e2330] text-red-500 flex items-center justify-center font-black text-xl shrink-0 shadow-lg group-hover:border-red-500/50 group-hover:bg-red-500/10 transition-all duration-300">1</div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-2 tracking-wide uppercase">Siapkan Data Diri</h3>
                  <p className="text-slate-400 text-base leading-relaxed">Siapkan identitas lengkap, pas foto, serta informasi darurat untuk keperluan pendaftaran anggota baru.</p>
                </div>
              </motion.li>
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-[#131722] border border-[#1e2330] text-red-500 flex items-center justify-center font-black text-xl shrink-0 shadow-lg group-hover:border-red-500/50 group-hover:bg-red-500/10 transition-all duration-300">2</div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-2 tracking-wide uppercase">Isi Formulir Online</h3>
                  <p className="text-slate-400 text-base leading-relaxed">Klik tombol pendaftaran di bawah dan lengkapi seluruh data pada sistem administrasi kami.</p>
                </div>
              </motion.li>
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-[#131722] border border-[#1e2330] text-red-500 flex items-center justify-center font-black text-xl shrink-0 shadow-lg group-hover:border-red-500/50 group-hover:bg-red-500/10 transition-all duration-300">3</div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-2 tracking-wide uppercase">Hadir Latihan Perdana</h3>
                  <p className="text-slate-400 text-base leading-relaxed">Kamu akan dihubungi oleh pengurus resmi untuk mengikuti jadwal orientasi atau latihan perdana.</p>
                </div>
              </motion.li>
            </ul>

            <Link to="/pendaftaran" className="inline-flex items-center gap-3 bg-white text-black hover:bg-slate-200 px-10 py-5 rounded-full font-black uppercase tracking-[0.15em] text-sm transition-all shadow-xl hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 relative z-20">
              Isi Formulir Sekarang <ChevronRight size={18} strokeWidth={3} />
            </Link>
          </div>
          
          <div className="lg:w-1/2 w-full relative z-0">
            <div className="absolute inset-0 bg-red-600/20 blur-[100px] rounded-full filter pointer-events-none"></div>
            <div className="relative max-w-lg mx-auto grid grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-[#131722] border border-[#1e2330] rounded-[2rem] p-8 flex flex-col justify-center items-center text-center shadow-2xl hover:border-red-500/30 transition-colors aspect-square">
                <span className="text-5xl font-display font-black text-white mb-2">{settings.establishedYear || '2005'}</span>
                <span className="text-red-500 font-bold text-xs uppercase tracking-widest">Berdiri Sejak</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                className="bg-[#131722] border border-[#1e2330] rounded-[2rem] p-8 flex flex-col justify-center items-center text-center shadow-2xl hover:border-red-500/30 transition-colors aspect-square mt-8">
                <span className="text-5xl font-display font-black text-white mb-2">
                  <AnimatedNumber value={stats.members > 0 ? stats.members : 50} suffix="+" />
                </span>
                <span className="text-red-500 font-bold text-xs uppercase tracking-widest">Anggota Aktif</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                className="bg-[#131722] border border-[#1e2330] rounded-[2rem] p-8 flex flex-col justify-center items-center text-center shadow-2xl hover:border-red-500/30 transition-colors aspect-square -mt-8">
                <span className="text-5xl font-display font-black text-white mb-2">
                  {loadingAchievements ? '...' : <AnimatedNumber value={achievements.length > 0 ? achievements.length : 15} suffix="+" />}
                </span>
                <span className="text-red-500 font-bold text-xs uppercase tracking-widest">Prestasi</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
                className="bg-gradient-to-br from-red-600 to-red-800 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center shadow-2xl shadow-red-600/20 aspect-square">
                <span className="text-5xl font-display font-black text-white mb-2">3</span>
                <span className="text-red-200 font-bold text-xs uppercase tracking-widest">Hari Latihan</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Prestasi Section */}
      <section className="py-20 md:py-40 bg-[#0a0c10] border-b border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-12 md:mb-20">
            <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-white uppercase tracking-tighter mb-4 md:mb-6 leading-[1.1]">Prestasi <br className="hidden md:block"/><span className="text-red-500">Membanggakan</span></h2>
              <p className="text-slate-400 font-light text-base sm:text-lg md:text-xl">Bukti nyata hasil dedikasi dan kerja keras anggota kami di berbagai kejuaraan dari tingkat daerah hingga nasional.</p>
            </div>
            <Link to="/prestasi" className="hidden md:inline-flex items-center gap-3 bg-white/5 border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-full font-bold uppercase tracking-[0.15em] text-xs transition-all hover:bg-white/10 shrink-0">
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>

          <div className={`grid sm:grid-cols-2 ${achievements.length >= 3 ? 'lg:grid-cols-3' : ''} gap-8 md:gap-10 max-w-7xl mx-auto`}>
            {loadingAchievements ? (
              [1, 2].map(i => (
                <div key={i} className="bg-[#131722] rounded-[2rem] overflow-hidden border border-[#1e2330] h-96 animate-pulse flex flex-col">
                  <div className="h-2/3 bg-[#1e2330]"></div>
                  <div className="p-8 h-1/3 bg-[#0f1115]"></div>
                </div>
              ))
            ) : achievements.length > 0 ? (
              achievements.map((item, index) => (
                <motion.article 
                  key={item.id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="bg-[#131722] rounded-[2rem] overflow-hidden border border-[#1e2330] hover:border-red-500/40 transition-all hover:shadow-[0_20px_60px_rgba(220,38,38,0.1)] group flex flex-col h-full transform hover:-translate-y-2 duration-500"
                >
                  <div onClick={() => showDetail(item)} className="aspect-[16/10] bg-[#0a0c10] relative overflow-hidden flex items-center justify-center shrink-0 cursor-pointer">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} width={600} height={400} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    ) : (
                      <Trophy size={80} className="text-[#1e2330]" strokeWidth={1} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-[#131722]/50 to-transparent opacity-90 pointer-events-none"></div>
                  </div>
                  <div className="px-10 pb-10 pt-4 flex-1 flex flex-col bg-[#131722] relative z-10 -mt-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-red-400 font-black text-[10px] sm:text-xs uppercase tracking-widest bg-red-950/40 border border-red-900/30 px-4 py-2 rounded-lg inline-flex items-center gap-2">
                           <Award size={14} /> Tahun {item.year}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-display font-black text-white mb-4 leading-tight group-hover:text-red-400 transition-colors line-clamp-2 uppercase tracking-wide">{item.title}</h3>
                      <p className="text-slate-400 leading-relaxed text-base font-light line-clamp-3 mb-8">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-auto">
                      <button onClick={() => showDetail(item)} className="inline-flex items-center gap-3 text-sm font-black tracking-widest uppercase text-white bg-[#1e2330] hover:bg-red-600 px-8 py-4 rounded-xl transition-all duration-300 w-full justify-center shadow-lg group-hover:shadow-red-600/20">
                        <Info size={18} /> Detail Pencapaian
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="col-span-2 text-center text-slate-500 py-20 bg-[#131722] border border-[#1e2330] border-dashed rounded-[2rem] font-light text-lg">
                 Belum ada data prestasi.
              </div>
            )}
          </div>
          
          <div className="text-center mt-12 md:hidden">
            <Link to="/prestasi" className="inline-flex items-center gap-3 bg-white/5 border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-full font-bold uppercase tracking-[0.15em] text-xs transition-all hover:bg-white/10">
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>



      {/* FAQ Section */}
      <section className="py-24 md:py-40 bg-[#0f1115]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-display font-black text-white uppercase tracking-tighter mb-6 leading-[1.1]">FAQ <br/><span className="text-red-500">Tanya Jawab</span></h2>
            <p className="text-slate-400 font-light text-xl">Informasi tambahan seputar ekstrakurikuler pencak silat SMAN 1 KEMANGKON.</p>
          </div>

          <div className="space-y-6">
            <details className="group bg-[#131722] border border-[#1e2330] rounded-2xl overflow-hidden cursor-pointer marker:content-none hover:border-[#404b61] transition-colors shadow-lg">
              <summary className="flex items-center justify-between gap-6 p-8 text-white font-bold text-lg md:text-xl select-none list-none uppercase tracking-wide">
                <span>Apakah harus punya dasar beladiri?</span>
                <ChevronDown className="shrink-0 transition-transform duration-300 group-open:rotate-180 text-red-500" size={24} />
              </summary>
              <div className="px-8 pb-8 pt-0 text-slate-400 leading-relaxed text-lg font-light border-t border-[#1e2330]/50 mt-4 pt-6 mx-8">
                Tidak perlu. Ekstrakurikuler pencak silat SMAN 1 KEMANGKON terbuka untuk semua tingkatan, mulai dari sabuk putih (pemula) yang sama sekali belum pernah belajar beladiri, hingga mereka yang sudah berpengalaman. Pelatih kami akan memberikan pembinaan dari teknik dasar hingga mahir.
              </div>
            </details>

            <details className="group bg-[#131722] border border-[#1e2330] rounded-2xl overflow-hidden cursor-pointer marker:content-none hover:border-[#404b61] transition-colors shadow-lg">
              <summary className="flex items-center justify-between gap-6 p-8 text-white font-bold text-lg md:text-xl select-none list-none uppercase tracking-wide">
                <span>Apa saja perlengkapan latihan perdana?</span>
                <ChevronDown className="shrink-0 transition-transform duration-300 group-open:rotate-180 text-red-500" size={24} />
              </summary>
              <div className="px-8 pb-8 pt-0 text-slate-400 leading-relaxed text-lg font-light border-t border-[#1e2330]/50 mt-4 pt-6 mx-8">
                Untuk latihan perdana, cukup menggunakan pakaian olahraga sekolah yang nyaman dan menyerap keringat. Setelah resmi bergabung, kelak anggota akan diarahkan untuk memiliki seragam resmi pencak silat yang bisa dikoordinasikan.
              </div>
            </details>

            <details className="group bg-[#131722] border border-[#1e2330] rounded-2xl overflow-hidden cursor-pointer marker:content-none hover:border-[#404b61] transition-colors shadow-lg">
              <summary className="flex items-center justify-between gap-6 p-8 text-white font-bold text-lg md:text-xl select-none list-none uppercase tracking-wide">
                <span>Bagaimana spesifik latihan fisik & teknik?</span>
                <ChevronDown className="shrink-0 transition-transform duration-300 group-open:rotate-180 text-red-500" size={24} />
              </summary>
              <div className="px-8 pb-8 pt-0 text-slate-400 leading-relaxed text-lg font-light border-t border-[#1e2330]/50 mt-4 pt-6 mx-8">
                Latihan dirancang seimbang. Biasanya mencakup pemanasan fisik, kelenturan, pembentukan kuda-kuda dasar, pukulan, tangkisan, serta fokus pada olah jurus dan sesi tanding (dengan porsi aman dan pengawasan ketat).
              </div>
            </details>
            
            <details className="group bg-[#131722] border border-[#1e2330] rounded-2xl overflow-hidden cursor-pointer marker:content-none hover:border-[#404b61] transition-colors shadow-lg">
              <summary className="flex items-center justify-between gap-6 p-8 text-white font-bold text-lg md:text-xl select-none list-none uppercase tracking-wide">
                <span>Apakah ada seleksi untuk kompetisi?</span>
                <ChevronDown className="shrink-0 transition-transform duration-300 group-open:rotate-180 text-red-500" size={24} />
              </summary>
              <div className="px-8 pb-8 pt-0 text-slate-400 leading-relaxed text-lg font-light border-t border-[#1e2330]/50 mt-4 pt-6 mx-8">
                Iya, bagi yang ingin mewakili sekolah dalam kompetisi (O2SN, POPDA, Kejurda), kami akan mengadakan seleksi internal berdasarkan tingkat kerajinan, kebugaran fisik, teknik beladiri, serta perilaku di lingkungan disiplin sekolah.
              </div>
            </details>
          </div>
        </div>
      </section>

    </Layout>
  );
}
