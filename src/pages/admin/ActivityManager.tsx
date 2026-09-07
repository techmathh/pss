import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, doc, setDoc, deleteDoc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import UploaderHint from '../../components/ui/UploaderHint';
import ImageUploadInput from '../../components/ui/ImageUploadInput';
import Swal from 'sweetalert2';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
}

export default function ActivityManager() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', title: '', description: '', imageUrl: '', date: '' });

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'activities'), orderBy('createdAt', 'desc'), limit(100)), (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'activities'));
    return unsub;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await updateDoc(doc(db, 'activities', formData.id), {
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          date: formData.date
        });
      } else {
        const newRef = doc(collection(db, 'activities'));
        await setDoc(newRef, {
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          date: formData.date,
          createdAt: Date.now()
        });
      }
      setIsEditing(false);
      setFormData({ id: '', title: '', description: '', imageUrl: '', date: '' });
      Swal.fire({
        title: 'Berhasil!',
        text: 'Data berhasil disimpan!',
        icon: 'success',
        confirmButtonText: 'Oke'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'activities');
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
      title: 'Hapus data?',
      text: 'Kegiatan ini akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
      try { 
        await deleteDoc(doc(db, 'activities', id)); 
        Swal.fire('Berhasil!', 'Data telah dihapus.', 'success');
      }
      catch(e) { 
        handleFirestoreError(e, OperationType.DELETE, 'activities'); 
        Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error');
      }
    }
  }

  const openEdit = (item: any) => {
    setFormData(item);
    setIsEditing(true);
  }

  const openCreate = () => {
    setFormData({ id: '', title: '', description: '', imageUrl: '', date: format(new Date(), 'yyyy-MM-dd') });
    setIsEditing(true);
  }

  return (
    <div className="space-y-6">
       {!isEditing ? (
         <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden">
            <div className="p-6 md:p-8 border-b border-[#1e2330] flex justify-between items-center bg-transparent">
               <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">Kelola Kegiatan (Galeri)</h2>
               <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-2 shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5">
                 <Plus size={16} /> Tambah Kegiatan
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
               {items.map(item => (
                 <div key={item.id} className="border-2 border-[#1e2330] bg-[#131722] shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden flex flex-col">
                    <div className="h-40 bg-[#1e2330] relative">
                       {item.imageUrl ? <img loading="lazy" src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-[#94a3b8] font-bold uppercase tracking-widest text-xs">No Image</div>}
                    </div>
                    <div className="p-5 flex-1">
                      <p className="text-xs text-red-400 font-black uppercase tracking-widest mb-1">{item.date}</p>
                      <h3 className="font-black text-[#cbd5e1] mb-2 truncate leading-tight uppercase tracking-wide text-lg">{item.title}</h3>
                      <p className="text-xs font-medium text-[#94a3b8] line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="p-4 border-t-2 border-[#0f1115] flex justify-end gap-3 items-center">
                       <button onClick={() => openEdit(item)} className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all inline-flex"><Edit2 size={16}/></button>
                       <button onClick={() => handleDelete(item.id)} className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all inline-flex"><Trash2 size={16}/></button>
                    </div>
                 </div>
               ))}
               {items.length === 0 && <div className="col-span-full py-12 text-center text-[#94a3b8] font-medium">Belum ada kegiatan</div>}
            </div>
         </div>
       ) : (
         <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden max-w-2xl">
            <div className="p-6 md:p-8 border-b border-[#1e2330] bg-transparent">
               <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">{formData.id ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}</h2>
            </div>
            <div className="p-8">
               <UploaderHint />
               <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Judul Kegiatan</label>
                 <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" maxLength={100}/>
               </div>
               <div>
                 <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Tanggal (YYYY-MM-DD atau bebas)</label>
                 <input type="text" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" maxLength={50}/>
               </div>
               <div>
                 <ImageUploadInput
                   value={formData.imageUrl}
                   onChange={(value) => setFormData({...formData, imageUrl: value})}
                   label="URL Gambar Kegiatan (Opsional)"
                   folder="activities"
                 />
               </div>
               <div>
                 <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Deskripsi Singkat</label>
                 <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all resize-none font-medium" rows={4} maxLength={2000}></textarea>
               </div>
               <div className="pt-6 flex justify-end gap-4 border-t-2 border-[#0f1115] mt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 border border-slate-600 rounded-full text-[#94a3b8] hover:bg-slate-800 font-bold uppercase tracking-widest text-xs transition-colors">Batal</button>
                  <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5">Simpan Kegiatan</button>
               </div>
            </form>
            </div>
         </div>
       )}
    </div>
  )
}
