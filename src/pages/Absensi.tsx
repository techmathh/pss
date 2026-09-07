import React, { useState, useEffect } from 'react';
import Layout from '../components/ui/Layout';
import { fetchAllAbsensiData, fetchAnggotaData } from '../lib/absensi';
import { Search, Calendar, Filter, CheckCircle2, UserX, UserMinus, AlertCircle, Info } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

function getLocalTodayStr() {
  const d = new Date();
  // Adjust for local timezone offset
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function formatTanggalIndo(str: string) {
  if (!str) return '';
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const [y, m, d] = str.split('-');
  return `${parseInt(d, 10)} ${bulan[parseInt(m, 10) - 1]} ${y}`;
}

export default function Absensi() {
  const [tanggal, setTanggal] = useState(getLocalTodayStr());
  const [namaFilter, setNamaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [allAbsensi, setAllAbsensi] = useState<any[]>([]);
  const [allAnggota, setAllAnggota] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [catatan, setCatatan] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const fetchCatatan = async () => {
      try {
        const docRef = doc(db, 'absensi_notes', tanggal);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCatatan(docSnap.data().note || '');
        } else {
          setCatatan('');
        }
      } catch (e) {
        console.error("Error loading catatan", e);
        setCatatan('');
      }
    };
    fetchCatatan();
  }, [tanggal]);

  const loadInitialData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const [resData, resAnggota] = await Promise.all([
        fetchAllAbsensiData(forceRefresh),
        fetchAnggotaData(forceRefresh)
      ]);
      setAllAbsensi(resData);
      setAllAnggota(resAnggota);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const currentDayAbsensi = allAbsensi
    .filter((row: any) => {
      if (!row.tanggal) return false;
      const rowDate = typeof row.tanggal === 'string' ? row.tanggal.split('T')[0] : String(row.tanggal);
      return rowDate === tanggal;
    })
    .map(absensi => {
      const anggota = allAnggota.find((a: any) => String(a.id) === String(absensi.anggota_id));
      return {
        ...absensi,
        divisi: anggota ? anggota.divisi : ''
      };
    });

  const filteredData = currentDayAbsensi.filter(d => {
    const cocokNama = (d.nama || '').toLowerCase().includes(namaFilter.toLowerCase());
    const cocokDivisi = (d.divisi || '').toLowerCase().includes(namaFilter.toLowerCase());
    const matchSearch = cocokNama || cocokDivisi;
    const cocokStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && cocokStatus;
  });

  const stats = { Hadir: 0, Izin: 0, Sakit: 0, Alpha: 0 };
  currentDayAbsensi.forEach(d => { 
    if (stats.hasOwnProperty(d.status)) {
      stats[d.status as keyof typeof stats]++; 
    }
  });

  return (
    <Layout>
      <div className="pt-28 pb-16 min-h-screen bg-[#0c0e12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-white/5 pb-8 relative z-10">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">Absensi Harian</h1>
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar size={16} className="text-red-500" />
                <span className="text-sm font-medium tracking-wide uppercase">{formatTanggalIndo(tanggal)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
            <div className="bg-[#131722] border border-white/5 rounded-2xl p-4 md:p-6 relative overflow-hidden group shadow-lg">
              <div className="flex items-center justify-between mb-4">
                 <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                   <CheckCircle2 size={20} />
                 </div>
                 <div className="text-3xl font-black text-white">{stats.Hadir}</div>
              </div>
              <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">Hadir</div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all duration-500"></div>
            </div>

            <div className="bg-[#131722] border border-white/5 rounded-2xl p-4 md:p-6 relative overflow-hidden group shadow-lg">
              <div className="flex items-center justify-between mb-4">
                 <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                   <UserMinus size={20} />
                 </div>
                 <div className="text-3xl font-black text-white">{stats.Izin}</div>
              </div>
              <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">Izin</div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-all duration-500"></div>
            </div>

            <div className="bg-[#131722] border border-white/5 rounded-2xl p-4 md:p-6 relative overflow-hidden group shadow-lg">
              <div className="flex items-center justify-between mb-4">
                 <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                   <AlertCircle size={20} />
                 </div>
                 <div className="text-3xl font-black text-white">{stats.Sakit}</div>
              </div>
              <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">Sakit</div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-all duration-500"></div>
            </div>

            <div className="bg-[#131722] border border-white/5 rounded-2xl p-4 md:p-6 relative overflow-hidden group shadow-lg">
               <div className="flex items-center justify-between mb-4">
                 <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                   <UserX size={20} />
                 </div>
                 <div className="text-3xl font-black text-white">{stats.Alpha}</div>
              </div>
              <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">Alpha</div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-all duration-500"></div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6 bg-[#131722] p-4 border border-white/5 rounded-2xl shadow-lg">
            <div className="flex gap-2 w-full md:w-auto md:min-w-[250px]">
              <div className="relative flex-1">
                <Calendar size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="date" 
                  value={tanggal} 
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full bg-[#0c0e12] border border-white/5 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              <button 
                onClick={() => loadInitialData(true)}
                className="bg-[#0c0e12] border border-white/5 px-4 rounded-xl hover:bg-white/5 transition-colors text-slate-400 group flex-none"
                title="Sinkronisasi Data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`group-hover:text-white transition-colors ${loading ? 'animate-spin text-red-500' : ''}`}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              </button>
            </div>
            
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari nama atau kelas..."
                value={namaFilter}
                onChange={(e) => setNamaFilter(e.target.value)}
                className="w-full bg-[#0c0e12] border border-white/5 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div className="relative w-full md:w-auto md:min-w-[200px]">
              <Filter size={16} className="absolute left-4 top-3.5 text-slate-400" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#0c0e12] border border-white/5 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors appearance-none"
              >
                <option value="">Semua Status</option>
                <option value="Hadir">Hadir</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Alpha">Alpha</option>
              </select>
            </div>
          </div>

          <div className="bg-[#131722] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-[#0c0e12]/50">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Nama Lengkap</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Divisi / Kelas</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Keterangan Tambahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                           <div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                           <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Memuat data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                           <AlertCircle size={32} className="text-slate-600 mb-2" />
                           <span className="text-sm font-medium tracking-wide">Tidak ada data absensi yang ditemukan.</span>
                           <span className="text-xs text-slate-500">Coba ubah tanggal atau filter pencarian.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((d, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-5 text-sm font-bold text-slate-200 group-hover:text-white transition-colors whitespace-nowrap">{d.nama || '-'}</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-400 whitespace-nowrap">{d.divisi || '-'}</td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            d.status === 'Hadir' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            d.status === 'Izin' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                            d.status === 'Sakit' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                            d.status === 'Alpha' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {d.status || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-400 italic">{d.keterangan || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
