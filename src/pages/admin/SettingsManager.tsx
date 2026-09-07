import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import UploaderHint from '../../components/ui/UploaderHint';
import ImageUploadInput from '../../components/ui/ImageUploadInput';
import Swal from 'sweetalert2';
import { useQueryClient } from '@tanstack/react-query';

export default function SettingsManager() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    motto: '',
    aboutText: '',
    vision: '',
    mission: '',
    logoUrl: '',
    email: '',
    whatsapp: '',
    instagram: '',
    establishedYear: '',
    registrationOpen: true,
    registrationOpenDate: '',
    scheduleDays: '',
    scheduleTime: '',
    scheduleLocation: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setFormData((prev) => ({ ...prev, ...docSnap.data() }));
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/general');
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        ...formData,
        updatedAt: Date.now()
      });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      Swal.fire({
        title: 'Berhasil!',
        text: 'Pengaturan website berhasil disimpan!',
        icon: 'success',
        confirmButtonText: 'Oke'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/general');
      Swal.fire({
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menyimpan pengaturan.',
        icon: 'error',
        confirmButtonText: 'Oke'
      });
    }
  };

  if (loading) return <div className="p-8">Memuat pengaturan...</div>;

  return (
    <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden max-w-4xl">
      <div className="p-6 md:p-8 border-b border-[#1e2330] bg-transparent flex justify-between items-center">
         <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">Pengaturan Website</h2>
      </div>
      <div className="p-8">
         <UploaderHint />
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Nama Organisasi/Website</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" />
               </div>
               <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Tahun Berdiri</label>
                  <input type="text" required value={formData.establishedYear} onChange={e => setFormData({...formData, establishedYear: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" />
               </div>
            </div>
            
            <div>
               <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Motto / Deskripsi Singkat</label>
               <textarea rows={2} required value={formData.motto} onChange={e => setFormData({...formData, motto: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium"></textarea>
            </div>

            <div>
               <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Profil Singkat / Tentang Organisasi</label>
               <textarea rows={3} required value={formData.aboutText} onChange={e => setFormData({...formData, aboutText: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium"></textarea>
            </div>

            <div>
               <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Visi</label>
               <textarea rows={3} required value={formData.vision} onChange={e => setFormData({...formData, vision: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium"></textarea>
            </div>

            <div>
               <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Misi</label>
               <textarea rows={4} required value={formData.mission} onChange={e => setFormData({...formData, mission: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" placeholder="Pisahkan dengan angka atau enter"></textarea>
            </div>

            <div>
               <ImageUploadInput
                 value={formData.logoUrl}
                 onChange={(value) => setFormData({...formData, logoUrl: value})}
                 label="URL Logo Website (Opsional)"
                 folder="settings"
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Email Kontak</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" />
                </div>
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">WhatsApp Kontak</label>
                    <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" placeholder="Contoh: 62812..."/>
                </div>
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Link Instagram</label>
                    <input type="text" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" placeholder="https://instagram.com/..."/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-[#1e2330]">
                <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Hari Latihan</label>
                   <input type="text" value={formData.scheduleDays || ''} onChange={e => setFormData({...formData, scheduleDays: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" placeholder="Jumat, Sabtu, Minggu"/>
                </div>
                <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Waktu Latihan</label>
                   <textarea rows={2} value={formData.scheduleTime || ''} onChange={e => setFormData({...formData, scheduleTime: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" placeholder="15:00 - 17:00 WIB"></textarea>
                </div>
                <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Tempat Latihan</label>
                   <textarea rows={2} value={formData.scheduleLocation || ''} onChange={e => setFormData({...formData, scheduleLocation: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" placeholder="Lapangan Utama"></textarea>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-[#1e2330]">
               <div className="flex items-center gap-4 bg-[#0f1115] p-4 rounded-xl border border-[#242b3d]">
                   <div className="flex-1">
                      <label className="block text-sm font-black uppercase tracking-widest text-[#cbd5e1]">Status Pendaftaran</label>
                      <p className="text-xs text-[#94a3b8] font-medium mt-1">Buka atau tutup form pendaftaran anggota baru.</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" className="sr-only peer" checked={formData.registrationOpen !== false} onChange={e => setFormData({...formData, registrationOpen: e.target.checked})} />
                     <div className="w-14 h-7 bg-[#2a3245] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#131722] after:border-[#2a3245] after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                   </label>
               </div>
               
               {!formData.registrationOpen && (
                 <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Info Kapan Dibuka Kembali</label>
                    <input type="text" value={formData.registrationOpenDate || ''} onChange={e => setFormData({...formData, registrationOpenDate: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" placeholder="Contoh: Semester ganjil tahun depan"/>
                 </div>
               )}
            </div>

            <div className="pt-6 border-t-2 border-[#0f1115] mt-8 flex justify-end">
               <button type="submit" className="px-8 py-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5">Simpan Pengaturan</button>
            </div>
         </form>
      </div>
    </div>
  );
}
