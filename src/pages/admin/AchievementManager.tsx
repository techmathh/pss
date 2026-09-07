import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, doc, setDoc, deleteDoc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Trash2, Edit2, Plus } from 'lucide-react';
import UploaderHint from '../../components/ui/UploaderHint';
import ImageUploadInput from '../../components/ui/ImageUploadInput';
import Swal from 'sweetalert2';

interface AchievementItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  year: string;
}

export default function AchievementManager() {
  const [items, setItems] = useState<AchievementItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', title: '', description: '', imageUrl: '', year: '' });

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'achievements'), orderBy('year', 'desc'), limit(100)), (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'achievements'));
    return unsub;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await updateDoc(doc(db, 'achievements', formData.id), {
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          year: formData.year
        });
      } else {
        const newRef = doc(collection(db, 'achievements'));
        await setDoc(newRef, {
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          year: formData.year,
          createdAt: Date.now()
        });
      }
      setIsEditing(false);
      Swal.fire({
        title: 'Berhasil!',
        text: 'Data berhasil disimpan!',
        icon: 'success',
        confirmButtonText: 'Oke'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'achievements');
      Swal.fire({
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menyimpan data.',
        icon: 'error',
        confirmButtonText: 'Oke'
      });
    }
  }

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus prestasi?',
      text: 'Data prestasi ini akan dihapus permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
      try { 
        await deleteDoc(doc(db, 'achievements', id));
        Swal.fire('Berhasil!', 'Data dihapus.', 'success');
      }
      catch(e) { handleFirestoreError(e, OperationType.DELETE, 'achievements'); Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error'); }
    }
  }

  const openEdit = (item: any) => { setFormData(item); setIsEditing(true); }
  const openCreate = () => { setFormData({ id: '', title: '', description: '', imageUrl: '', year: new Date().getFullYear().toString() }); setIsEditing(true); }

  return (
    <div className="space-y-6">
       {!isEditing ? (
         <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden">
            <div className="p-6 md:p-8 border-b border-[#1e2330] flex justify-between items-center bg-transparent">
               <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">Kelola Prestasi</h2>
               <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-2 shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5">
                 <Plus size={16} /> Tambah Prestasi
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
               {items.length === 0 ? (
                 <div className="col-span-1 md:col-span-2 p-12 text-center text-[#94a3b8] font-medium">Belum ada data prestasi.</div>
               ) : (
               items.map(item => (
                 <div key={item.id} className="border-2 border-[#1e2330] bg-[#131722] shadow-sm hover:shadow-md transition-shadow rounded-2xl p-5 flex justify-between items-center gap-4">
                    <div>
                      <span className="bg-yellow-900/20 text-yellow-400 border border-yellow-900/50 text-xs uppercase tracking-widest font-black px-2 py-1 rounded inline-block mb-2">{item.year}</span>
                      <h3 className="font-black text-[#cbd5e1] text-lg uppercase tracking-wide leading-tight">{item.title}</h3>
                      <p className="text-xs font-medium text-[#94a3b8] mt-1 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 border-l-2 border-[#0f1115] pl-4">
                       <button onClick={() => openEdit(item)} className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all inline-flex"><Edit2 size={16}/></button>
                       <button onClick={() => handleDelete(item.id)} className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all inline-flex"><Trash2 size={16}/></button>
                    </div>
                 </div>
               ))
               )}
            </div>
         </div>
       ) : (
         <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden max-w-2xl">
            <div className="p-6 md:p-8 border-b border-[#1e2330] bg-transparent">
               <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">{formData.id ? 'Edit Prestasi' : 'Tambah Prestasi Baru'}</h2>
            </div>
            <div className="p-8">
               <UploaderHint />
               <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Judul Prestasi</label>
                 <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" maxLength={100}/>
               </div>
               <div>
                 <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Tahun Kejuaraan</label>
                 <input type="text" required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" maxLength={10}/>
               </div>
               <div>
                 <ImageUploadInput
                   value={formData.imageUrl}
                   onChange={(value) => setFormData({...formData, imageUrl: value})}
                   label="URL Foto Prestasi (Opsional)"
                   folder="achievements"
                 />
               </div>
               <div>
                 <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Deskripsi/Keterangan</label>
                 <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all resize-none font-medium" rows={3} maxLength={2000}></textarea>
               </div>
               <div className="pt-6 flex justify-end gap-4 border-t-2 border-[#0f1115] mt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 border border-slate-600 rounded-full text-[#94a3b8] hover:bg-slate-800 font-bold uppercase tracking-widest text-xs transition-colors">Batal</button>
                  <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5">Simpan Prestasi</button>
               </div>
            </form>
            </div>
         </div>
       )}
    </div>
  )
}
