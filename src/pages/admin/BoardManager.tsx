import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, doc, setDoc, deleteDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Trash2, Edit2, Plus, Users, Shield } from 'lucide-react';
import UploaderHint from '../../components/ui/UploaderHint';
import ImageUploadInput from '../../components/ui/ImageUploadInput';
import Swal from 'sweetalert2';

interface BoardMember {
  id: string;
  name: string;
  position: string;
  imageUrl: string;
  order: number;
}

interface BoardRole {
  id: string;
  name: string;
  order: number;
}

export default function BoardManager() {
  const [activeTab, setActiveTab] = useState<'members' | 'roles'>('members');
  
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [roles, setRoles] = useState<BoardRole[]>([]);
  
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [memberForm, setMemberForm] = useState({ id: '', name: '', position: '', imageUrl: '', order: 1 });
  
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [roleForm, setRoleForm] = useState({ id: '', name: '', order: 1 });

  useEffect(() => {
    const unsubMembers = onSnapshot(query(collection(db, 'board_members'), orderBy('order', 'asc')), (snap) => {
      setMembers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'board_members'));
    
    const unsubRoles = onSnapshot(query(collection(db, 'board_roles'), orderBy('order', 'asc')), (snap) => {
      setRoles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'board_roles'));

    return () => { unsubMembers(); unsubRoles(); };
  }, []);

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (memberForm.id) {
        await updateDoc(doc(db, 'board_members', memberForm.id), {
          name: memberForm.name,
          position: memberForm.position || roles[0]?.name || '',
          imageUrl: memberForm.imageUrl,
          order: Number(memberForm.order)
        });
      } else {
        const newRef = doc(collection(db, 'board_members'));
        await setDoc(newRef, {
          name: memberForm.name,
          position: memberForm.position || roles[0]?.name || '',
          imageUrl: memberForm.imageUrl,
          order: Number(memberForm.order),
          createdAt: Date.now()
        });
      }
      setIsEditingMember(false);
      Swal.fire({ title: 'Berhasil!', text: 'Data pengurus disimpan!', icon: 'success', confirmButtonText: 'Oke' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'board_members');
      Swal.fire({ title: 'Gagal!', text: 'Terjadi kesalahan saat menyimpan data.', icon: 'error', confirmButtonText: 'Oke' });
    }
  }

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (roleForm.id) {
        await updateDoc(doc(db, 'board_roles', roleForm.id), {
          name: roleForm.name,
          order: Number(roleForm.order)
        });
      } else {
        const newRef = doc(collection(db, 'board_roles'));
        await setDoc(newRef, {
          name: roleForm.name,
          order: Number(roleForm.order),
          createdAt: Date.now()
        });
      }
      setIsEditingRole(false);
      Swal.fire({ title: 'Berhasil!', text: 'Jabatan berhasil disimpan!', icon: 'success', confirmButtonText: 'Oke' });
    } catch (error) {
       handleFirestoreError(error, OperationType.WRITE, 'board_roles');
       Swal.fire({ title: 'Gagal!', text: 'Terjadi kesalahan.', icon: 'error', confirmButtonText: 'Oke' });
    }
  }

  const handleDeleteMember = async (id: string) => {
    const result = await Swal.fire({ title: 'Hapus pengurus?', text: 'Data ini akan dihapus permanen!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8', confirmButtonText: 'Ya, hapus!', cancelButtonText: 'Batal' });
    if (result.isConfirmed) {
      try { 
        await deleteDoc(doc(db, 'board_members', id)); 
        Swal.fire('Berhasil!', 'Data dihapus.', 'success');
      } catch(e) { handleFirestoreError(e, OperationType.DELETE, 'board_members'); Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error'); }
    }
  }

  const handleDeleteRole = async (id: string) => {
    const result = await Swal.fire({ title: 'Hapus jabatan?', text: 'Jabatan ini akan dihapus permanen!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8', confirmButtonText: 'Ya, hapus!', cancelButtonText: 'Batal' });
    if (result.isConfirmed) {
      try { 
        await deleteDoc(doc(db, 'board_roles', id)); 
        Swal.fire('Berhasil!', 'Jabatan dihapus.', 'success');
      } catch(e) { handleFirestoreError(e, OperationType.DELETE, 'board_roles'); Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error'); }
    }
  }

  const openEditMember = (item: any) => { setMemberForm(item); setIsEditingMember(true); }
  const openCreateMember = () => { 
     if (roles.length === 0) {
        Swal.fire('Peringatan!', 'Harap buat opsi Jabatan terlebih dahulu di tab Jabatan.', 'warning');
        return;
     }
     setMemberForm({ id: '', name: '', position: roles[0]?.name || '', imageUrl: '', order: members.length + 1 }); setIsEditingMember(true); 
  }

  const openEditRole = (item: any) => { setRoleForm(item); setIsEditingRole(true); }
  const openCreateRole = () => { setRoleForm({ id: '', name: '', order: roles.length + 1 }); setIsEditingRole(true); }

  return (
    <div className="space-y-6">
       {/* Tab Navigation */}
       <div className="flex gap-4 border-b-2 border-[#242b3d] mb-6">
          <button 
             onClick={() => { setActiveTab('members'); setIsEditingMember(false); }} 
             className={`px-4 py-3 font-bold uppercase tracking-widest text-xs flex items-center gap-2 border-b-2 transition-all ${activeTab === 'members' ? 'border-red-600 text-red-400' : 'border-transparent text-[#94a3b8] hover:text-[#cbd5e1]'}`}
          >
             <Users size={16} /> Anggota Pengurus
          </button>
          <button 
             onClick={() => { setActiveTab('roles'); setIsEditingRole(false); }} 
             className={`px-4 py-3 font-bold uppercase tracking-widest text-xs flex items-center gap-2 border-b-2 transition-all ${activeTab === 'roles' ? 'border-red-600 text-red-400' : 'border-transparent text-[#94a3b8] hover:text-[#cbd5e1]'}`}
          >
             <Shield size={16} /> Daftar Jabatan
          </button>
       </div>

       {activeTab === 'members' && (
         <>
           {!isEditingMember ? (
             <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden">
                <div className="p-6 md:p-8 border-b border-[#1e2330] flex justify-between items-center bg-transparent">
                   <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">Kelola Anggota Pengurus</h2>
                   <button onClick={openCreateMember} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-2 shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5">
                     <Plus size={16} /> Tambah Pengurus
                   </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1e2330] text-[#94a3b8] border-b-2 border-[#242b3d] text-xs uppercase tracking-widest font-black">
                        <th className="py-3 px-6 font-semibold">Urutan</th>
                        <th className="py-3 px-6 font-semibold">Foto</th>
                        <th className="py-3 px-6 font-semibold">Nama Lengkap</th>
                        <th className="py-3 px-6 font-semibold">Jabatan</th>
                        <th className="py-3 px-6 font-semibold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2330]">
                       {members.map(item => (
                          <tr key={item.id} className="hover:bg-[#0f1115]">
                             <td className="py-3 px-6 font-medium text-[#94a3b8]">{item.order}</td>
                             <td className="py-3 px-6">
                                <div className="w-10 h-10 rounded-full bg-[#242b3d] overflow-hidden border border-[#2a3245]">
                                   {item.imageUrl && <img loading="lazy" src={item.imageUrl} alt="" className="w-full h-full object-cover"/>}
                                </div>
                             </td>
                             <td className="py-3 px-6 font-black text-[#cbd5e1] uppercase text-sm">{item.name}</td>
                             <td className="py-3 px-6 text-red-400 font-bold uppercase tracking-widest text-xs">{item.position}</td>
                             <td className="py-3 px-6">
                               <div className="flex justify-end gap-2">
                                 <button onClick={() => openEditMember(item)} className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all inline-flex"><Edit2 size={16}/></button>
                                 <button onClick={() => handleDeleteMember(item.id)} className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all inline-flex"><Trash2 size={16}/></button>
                               </div>
                             </td>
                          </tr>
                       ))}
                       {members.length === 0 && (
                          <tr><td colSpan={5} className="py-8 text-center text-[#94a3b8] font-medium">Belum ada data pengurus.</td></tr>
                       )}
                    </tbody>
                  </table>
                </div>
             </div>
           ) : (
             <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden max-w-2xl">
                <div className="p-6 md:p-8 border-b border-[#1e2330] bg-transparent">
                   <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">{memberForm.id ? 'Edit Pengurus' : 'Tambah Pengurus Baru'}</h2>
                </div>
                <div className="p-8">
                   <UploaderHint />
                   <form onSubmit={handleMemberSubmit} className="space-y-5">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Nama Lengkap</label>
                        <input type="text" required value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" maxLength={100}/>
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Jabatan</label>
                        <select required value={memberForm.position} onChange={e => setMemberForm({...memberForm, position: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium bg-[#131722]">
                           {roles.map(r => (
                              <option key={r.id} value={r.name}>{r.name}</option>
                           ))}
                        </select>
                      </div>
                      <div>
                        <ImageUploadInput
                          value={memberForm.imageUrl}
                          onChange={(value) => setMemberForm({...memberForm, imageUrl: value})}
                          label="Foto Profile (Url Atau Upload Langsung)"
                          folder="board_members"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Urutan Tampil (Makin kecil makin awal)</label>
                        <input type="number" required min="1" value={memberForm.order} onChange={e => setMemberForm({...memberForm, order: Number(e.target.value)})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium"/>
                      </div>
                      <div className="pt-6 flex justify-end gap-4 border-t-2 border-[#0f1115] mt-2">
                         <button type="button" onClick={() => setIsEditingMember(false)} className="px-6 py-3 border border-slate-600 rounded-full text-[#94a3b8] hover:bg-slate-800 font-bold uppercase tracking-widest text-xs transition-colors">Batal</button>
                         <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5">Simpan Data</button>
                      </div>
                   </form>
                </div>
             </div>
           )}
         </>
       )}

       {activeTab === 'roles' && (
          <>
            {!isEditingRole ? (
               <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden max-w-3xl">
                  <div className="p-6 md:p-8 border-b border-[#1e2330] flex justify-between items-center bg-transparent">
                     <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">Kelola Jabatan</h2>
                     <button onClick={openCreateRole} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-2 shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5">
                       <Plus size={16} /> Tambah Jabatan
                     </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#1e2330] text-[#94a3b8] border-b-2 border-[#242b3d] text-xs uppercase tracking-widest font-black">
                          <th className="py-3 px-6 font-semibold w-24">Urutan</th>
                          <th className="py-3 px-6 font-semibold">Nama Jabatan</th>
                          <th className="py-3 px-6 font-semibold text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2330]">
                         {roles.map(item => (
                            <tr key={item.id} className="hover:bg-[#0f1115]">
                               <td className="py-3 px-6 font-medium text-[#94a3b8]">{item.order}</td>
                               <td className="py-3 px-6 font-black text-[#cbd5e1] uppercase text-sm">{item.name}</td>
                               <td className="py-3 px-6">
                                 <div className="flex justify-end gap-2">
                                   <button onClick={() => openEditRole(item)} className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all inline-flex"><Edit2 size={16}/></button>
                                   <button onClick={() => handleDeleteRole(item.id)} className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all inline-flex"><Trash2 size={16}/></button>
                                 </div>
                               </td>
                            </tr>
                         ))}
                         {roles.length === 0 && (
                            <tr><td colSpan={3} className="py-8 text-center text-[#94a3b8] font-medium">Belum ada data jabatan.</td></tr>
                         )}
                      </tbody>
                    </table>
                  </div>
               </div>
            ) : (
               <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden max-w-xl">
                  <div className="p-6 md:p-8 border-b border-[#1e2330] bg-transparent">
                     <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">{roleForm.id ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}</h2>
                  </div>
                  <div className="p-8">
                     <form onSubmit={handleRoleSubmit} className="space-y-5">
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Nama Jabatan (Misal: Ketua Umum)</label>
                          <input type="text" required value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" maxLength={100}/>
                        </div>
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Urutan Tampil (Digunakan juga untuk urutan di struktur)</label>
                          <input type="number" required min="1" value={roleForm.order} onChange={e => setRoleForm({...roleForm, order: Number(e.target.value)})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium"/>
                        </div>
                        <div className="pt-6 flex justify-end gap-4 border-t-2 border-[#0f1115] mt-2">
                           <button type="button" onClick={() => setIsEditingRole(false)} className="px-6 py-3 border border-slate-600 rounded-full text-[#94a3b8] hover:bg-slate-800 font-bold uppercase tracking-widest text-xs transition-colors">Batal</button>
                           <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5">Simpan Jabatan</button>
                        </div>
                     </form>
                  </div>
               </div>
            )}
          </>
       )}
    </div>
  )
}

