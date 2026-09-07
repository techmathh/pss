import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, FileText, Calendar, Image as ImageIcon } from 'lucide-react';

export default function Dashboard() {
  const { user, role, userData } = useAuth();
  const [stats, setStats] = useState({
    pendingRegistrations: 0,
    totalNews: 0,
    totalActivities: 0,
    totalGalleries: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const pendingRegSnap = await getCountFromServer(query(collection(db, 'registrations'), where('status', '==', 'pending')));
        const newsSnap = await getCountFromServer(collection(db, 'news'));
        const activitiesSnap = await getCountFromServer(collection(db, 'activities'));
        const galleriesSnap = await getCountFromServer(collection(db, 'galleries'));

        setStats({
          pendingRegistrations: pendingRegSnap.data().count,
          totalNews: newsSnap.data().count,
          totalActivities: activitiesSnap.data().count,
          totalGalleries: galleriesSnap.data().count
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }
    fetchStats();
  }, []);
  
  return (
    <div>
      <div className="bg-[#131722] rounded-2xl shadow-xl overflow-hidden border border-[#1e2330] mb-8">
         <div className="p-8 border-l-4 border-red-500">
             <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 uppercase tracking-tight">Selamat Datang, {userData?.displayName || user?.displayName}!</h2>
             <p className="text-slate-400 font-medium">
               Anda login sebagai <span className="font-black text-red-500 uppercase tracking-widest">{role}</span>. Gunakan menu di sebelah kiri untuk mengelola konten website.
             </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         <div className="bg-[#131722] rounded-xl shadow-lg border border-[#1e2330] p-6 flex flex-col items-center justify-center text-center">
            <Users className="text-blue-500 mb-3" size={32} />
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Pendaftar Pending</h3>
            <p className="text-3xl font-black text-white">{stats.pendingRegistrations}</p>
         </div>
         <div className="bg-[#131722] rounded-xl shadow-lg border border-[#1e2330] p-6 flex flex-col items-center justify-center text-center">
            <FileText className="text-green-500 mb-3" size={32} />
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total Berita</h3>
            <p className="text-3xl font-black text-white">{stats.totalNews}</p>
         </div>
         <div className="bg-[#131722] rounded-xl shadow-lg border border-[#1e2330] p-6 flex flex-col items-center justify-center text-center">
            <Calendar className="text-purple-500 mb-3" size={32} />
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total Kegiatan</h3>
            <p className="text-3xl font-black text-white">{stats.totalActivities}</p>
         </div>
         <div className="bg-[#131722] rounded-xl shadow-lg border border-[#1e2330] p-6 flex flex-col items-center justify-center text-center">
            <ImageIcon className="text-yellow-500 mb-3" size={32} />
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total Galeri</h3>
            <p className="text-3xl font-black text-white">{stats.totalGalleries}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <div className="bg-[#131722] rounded-xl shadow-lg border border-[#1e2330] p-6">
            <h3 className="text-red-500 font-bold text-xs uppercase tracking-widest mb-1">Akses Terbatas</h3>
            <p className="text-slate-300 text-sm mt-3 border-t border-[#1e2330] pt-3 font-medium">
               Pastikan untuk tidak membagikan akun Anda kepada siapapun karena panel ini memuat data pribadi pendaftar.
            </p>
         </div>
      </div>
    </div>
  )
}
