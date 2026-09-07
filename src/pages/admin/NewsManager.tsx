import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Trash2, Edit2, Plus } from 'lucide-react';
import UploaderHint from '../../components/ui/UploaderHint';
import ImageUploadInput from '../../components/ui/ImageUploadInput';
import Swal from 'sweetalert2';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
  createdAt: number;
}

export default function NewsManager() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    content: '',
    date: '',
    imageUrl: ''
  });

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(100)), (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'news');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docId = isEditing ? formData.id : doc(collection(db, 'news')).id;
      
      const payload: any = {
        title: formData.title,
        content: formData.content,
        date: formData.date,
        createdAt: isEditing ? (items.find(i => i.id === formData.id)?.createdAt || Date.now()) : Date.now(),
      };
      
      if (formData.imageUrl) {
        payload.imageUrl = formData.imageUrl;
      }
      
      await setDoc(doc(db, 'news', docId), payload);
      setShowAddForm(false);
      setIsEditing(false);
      setFormData({ id: '', title: '', content: '', imageUrl: '', date: '' });
      Swal.fire('Berhasil!', 'Data berita berhasil disimpan!', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'news');
      Swal.fire('Gagal!', 'Terjadi kesalahan saat menyimpan data.', 'error');
    }
  }

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus berita?',
      text: 'Berita ini akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
      try { 
        await deleteDoc(doc(db, 'news', id)); 
        Swal.fire('Berhasil!', 'Data telah dihapus.', 'success');
      }
      catch(e) { handleFirestoreError(e, OperationType.DELETE, 'news'); Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error'); }
    }
  }

  const editItem = (item: any) => {
    setFormData(item);
    setIsEditing(true);
    setShowAddForm(true);
  }

  if (loading) return <div className="p-8">Memuat...</div>;

  return (
    <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden">
      <div className="p-6 md:p-8 border-b border-[#1e2330] bg-transparent flex justify-between items-center">
         <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">Kelola Berita & Pengumuman</h2>
         <button onClick={() => { setShowAddForm(!showAddForm); setIsEditing(false); setFormData({ id: '', title: '', content: '', imageUrl: '', date: '' }); }} className={`px-5 py-2 rounded-full font-bold flex items-center gap-2 text-xs uppercase tracking-widest transition-all shadow-md hover:-translate-y-0.5 ${showAddForm ? 'border border-slate-600 hover:bg-slate-800 text-slate-300' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10'}`}>
            {showAddForm ? 'Batal' : <><Plus size={16} /> Tambah Baru</>}
         </button>
      </div>

      {showAddForm && (
        <div className="p-6 bg-[#0f1115] border-b border-[#242b3d]">
           <UploaderHint />
           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-1">Judul Berita</label>
                   <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" />
                </div>
                <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-1">Tanggal Publikasi</label>
                   <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" />
                </div>
              </div>
              <div>
                 <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-1">Isi Berita</label>
                 <textarea rows={5} required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" />
              </div>
              <div>
                 <ImageUploadInput
                   value={formData.imageUrl}
                   onChange={(value) => setFormData({...formData, imageUrl: value})}
                   label="URL Gambar Berita (Opsional)"
                   folder="news"
                 />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                 <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5">Simpan</button>
              </div>
           </form>
        </div>
      )}

      <div className="p-0">
        <ul className="divide-y divide-[#1e2330]">
          {items.map((item) => (
            <li key={item.id} className="p-6 hover:bg-[#0f1115] transition-colors flex justify-between items-center group">
               <div className="flex items-start gap-4">
                 {item.imageUrl ? (
                   <img loading="lazy" src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded-xl shadow-sm" />
                 ) : (
                   <div className="w-20 h-20 bg-[#1e2330] rounded-xl flex items-center justify-center border border-[#242b3d]">
                      <span className="text-xs text-[#94a3b8] font-medium">No Img</span>
                   </div>
                 )}
                 <div>
                    <h3 className="font-bold text-[#cbd5e1] text-lg mb-1 leading-tight">{item.title}</h3>
                    <p className="text-sm text-[#94a3b8] mb-2 font-medium">{item.date}</p>
                    <p className="text-sm text-[#94a3b8] line-clamp-2 max-w-2xl">{item.content}</p>
                 </div>
               </div>
               <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => editItem(item)} className="p-2 text-blue-400 bg-blue-900/20 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"><Trash2 size={16} /></button>
               </div>
            </li>
          ))}
          {items.length === 0 && (
             <div className="p-12 text-center text-[#94a3b8] font-medium">Belum ada berita tersimpan.</div>
          )}
        </ul>
      </div>
    </div>
  );
}
