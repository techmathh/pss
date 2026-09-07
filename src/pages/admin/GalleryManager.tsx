import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Trash2, Edit2, Plus, Image as ImageIconSVG } from 'lucide-react';
import UploaderHint from '../../components/ui/UploaderHint';
import MultiImageUploadInput from '../../components/ui/MultiImageUploadInput';
import Swal from 'sweetalert2';

interface GalleryItem {
  id: string;
  title: string;
  activityId: string;
  photos: string[];
  createdAt: number;
}

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    activityId: '',
    photosInput: ''
  });

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'galleries'), orderBy('createdAt', 'desc'), limit(100)), (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'galleries');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docId = isEditing ? formData.id : doc(collection(db, 'galleries')).id;
      
      const photoUrls = formData.photosInput.split('\n').map(url => url.trim()).filter(url => url.length > 0);
      
      if (photoUrls.length === 0) {
         Swal.fire('Peringatan!', 'Mohon masukkan setidaknya satu URL foto.', 'warning');
         return;
      }

      await setDoc(doc(db, 'galleries', docId), {
        title: formData.title,
        activityId: formData.activityId || 'umum',
        photos: photoUrls,
        createdAt: isEditing ? (items.find(i => i.id === formData.id)?.createdAt || Date.now()) : Date.now(),
      });
      
      setShowAddForm(false);
      setIsEditing(false);
      setFormData({ id: '', title: '', activityId: '', photosInput: '' });
      Swal.fire('Berhasil!', 'Galeri foto berhasil disimpan!', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'galleries');
      Swal.fire('Gagal!', 'Terjadi kesalahan saat menyimpan data.', 'error');
    }
  }

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus galeri?',
      text: 'Semua foto di galeri ini akan dihapus secara permanen dari website!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
      try { 
        await deleteDoc(doc(db, 'galleries', id)); 
        Swal.fire('Berhasil!', 'Data telah dihapus.', 'success');
      }
      catch(e) { handleFirestoreError(e, OperationType.DELETE, 'galleries'); Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error'); }
    }
  }

  const editItem = (item: any) => {
    setFormData({
      id: item.id,
      title: item.title,
      activityId: item.activityId,
      photosInput: Array.isArray(item.photos) ? item.photos.join('\n') : ''
    });
    setIsEditing(true);
    setShowAddForm(true);
  }

  if (loading) return <div className="p-8">Memuat...</div>;

  return (
    <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden">
      <div className="p-6 md:p-8 border-b border-[#1e2330] bg-transparent flex justify-between items-center">
         <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">Kelola Galeri Foto</h2>
         <button onClick={() => { setShowAddForm(!showAddForm); setIsEditing(false); setFormData({ id: '', title: '', activityId: '', photosInput: '' }); }} className={`px-5 py-2 rounded-full font-bold flex items-center gap-2 text-xs uppercase tracking-widest transition-all shadow-md hover:-translate-y-0.5 ${showAddForm ? 'border border-slate-600 hover:bg-slate-800 text-slate-300' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10'}`}>
            {showAddForm ? 'Batal' : <><Plus size={16} /> Buat Galeri</>}
         </button>
      </div>

      {showAddForm && (
        <div className="p-6 bg-[#0f1115] border-b border-[#242b3d]">
           <UploaderHint />
           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-1">Nama Album / Kegiatan</label>
                   <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" />
                </div>
              </div>
              <div>
                 <MultiImageUploadInput
                   value={formData.photosInput}
                   onChange={(value) => setFormData({...formData, photosInput: value})}
                   placeholder="https://url-foto-1.jpg&#10;https://url-foto-2.jpg"
                   folder="galleries"
                 />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                 <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5">Simpan Galeri</button>
              </div>
           </form>
        </div>
      )}

      <div className="p-0">
        <ul className="divide-y divide-[#1e2330]">
          {items.map((item) => (
            <li key={item.id} className="p-6 hover:bg-[#0f1115] transition-colors flex justify-between items-center group">
               <div className="flex items-start gap-4">
                 <div className="w-20 h-20 bg-[#242b3d] rounded-xl flex items-center justify-center border border-[#2a3245] relative overflow-hidden">
                    {item.photos && item.photos.length > 0 ? (
                       <img loading="lazy" src={item.photos[0]} className="w-full h-full object-cover" alt="Cover" />
                    ) : (
                       <ImageIconSVG size={24} className="text-[#94a3b8]" />
                    )}
                 </div>
                 <div>
                    <h3 className="font-bold text-[#cbd5e1] text-lg mb-1 leading-tight">{item.title}</h3>
                    <p className="text-xs bg-[#242b3d] text-[#94a3b8] px-2 py-1 rounded inline-block font-bold tracking-widest uppercase mb-2">{item.photos?.length || 0} Foto</p>
                 </div>
               </div>
               <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => editItem(item)} className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all inline-flex"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all inline-flex"><Trash2 size={16} /></button>
               </div>
            </li>
          ))}
          {items.length === 0 && (
             <div className="p-12 text-center text-[#94a3b8] font-medium">Belum ada galeri foto.</div>
          )}
        </ul>
      </div>
    </div>
  );
}
