import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Trash2, Edit2, Plus } from 'lucide-react';

export default function ContentManager() {
  const [items, setItems] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', title: '', body: '', type: 'history' });

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'content')), (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'content'));
    return unsub;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await updateDoc(doc(db, 'content', formData.id), {
          title: formData.title,
          body: formData.body,
          type: formData.type,
          updatedAt: Date.now()
        });
      } else {
        const newRef = doc(collection(db, 'content'));
        await setDoc(newRef, {
          title: formData.title,
          body: formData.body,
          type: formData.type,
          updatedAt: Date.now()
        });
      }
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'content');
      alert("Gagal menyimpan data");
    }
  }

  const handleDelete = async (id: string) => {
    if(confirm('Hapus konten ini?')) {
      try { await deleteDoc(doc(db, 'content', id)); }
      catch(e) { handleFirestoreError(e, OperationType.DELETE, 'content'); }
    }
  }

  const openEdit = (item: any) => { setFormData(item); setIsEditing(true); }
  const openCreate = () => { setFormData({ id: '', title: '', body: '', type: 'history' }); setIsEditing(true); }

  return (
    <div className="space-y-6">
       {!isEditing ? (
         <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden">
            <div className="p-6 md:p-8 border-b border-[#1e2330] flex justify-between items-center bg-transparent">
               <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">Kelola Konten Sistem (Sejarah, Visi, Misi)</h2>
               <button onClick={openCreate} className="bg-transparent hover:bg-[#242b3d] text-slate-200 border border-[#404b61] px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-2 shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5">
                 <Plus size={16} /> Tambah Konten
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
               {items.map(item => (
                 <div key={item.id} className="border-2 border-[#1e2330] bg-[#131722] shadow-sm hover:shadow-md transition-shadow rounded-2xl p-5 flex flex-col gap-4">
                    <div>
                      <span className="bg-[#1e2330] text-[#cbd5e1] border border-[#2a3245] text-xs uppercase tracking-widest font-black px-2 py-1 rounded inline-block mb-3 shadow-sm">{item.type}</span>
                      <h3 className="font-black text-[#cbd5e1] text-lg uppercase tracking-wide leading-tight mb-2">{item.title}</h3>
                      <p className="text-xs font-medium text-[#94a3b8] whitespace-pre-wrap line-clamp-4 leading-relaxed">{item.body}</p>
                    </div>
                    <div className="flex justify-end gap-3 mt-auto border-t-2 border-[#0f1115] pt-4">
                       <button onClick={() => openEdit(item)} className="p-2 text-[#94a3b8] hover:text-emerald-400 hover:bg-emerald-900/20 rounded-xl transition-all border border-transparent hover:border-emerald-900/50"><Edit2 size={16}/></button>
                       <button onClick={() => handleDelete(item.id)} className="p-2 text-[#94a3b8] hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all border border-transparent hover:border-red-900/50"><Trash2 size={16}/></button>
                    </div>
                 </div>
               ))}
            </div>
         </div>
       ) : (
         <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden max-w-2xl">
            <div className="p-6 md:p-8 border-b border-[#1e2330] bg-transparent">
               <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">{formData.id ? 'Edit Konten' : 'Tambah Konten Baru'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
               <div>
                 <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Judul Seksi</label>
                 <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" maxLength={100}/>
               </div>
               <div>
                 <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Tipe (history, visi, misi, dll)</label>
                 <input type="text" required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" maxLength={50}/>
               </div>
               <div>
                 <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Isi Konten</label>
                 <textarea value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all resize-y font-medium" rows={8} maxLength={10000}></textarea>
               </div>
               <div className="pt-6 flex justify-end gap-4 border-t-2 border-[#0f1115] mt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 border border-[#242b3d] rounded-full text-[#94a3b8] hover:bg-[#0f1115] font-bold uppercase tracking-widest text-xs transition-colors">Batal</button>
                  <button type="submit" className="px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5">Simpan Konten</button>
               </div>
            </form>
         </div>
       )}
    </div>
  )
}
