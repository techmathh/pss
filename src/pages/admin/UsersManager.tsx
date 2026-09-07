import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, doc, updateDoc, deleteDoc, setDoc, limit } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, secondaryAuth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { format } from 'date-fns';
import { Trash2, UserPlus, X } from 'lucide-react';
import { useAuth, UserData } from '../../lib/auth';
import { isDeveloperEmail } from '../../lib/utils';
import Swal from 'sweetalert2';

interface UserItem extends UserData {
  id: string;
}

export default function UsersManager() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'pengurus' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'users'), limit(100)), (snap) => {
      setUsers(snap.docs.map(doc => {
        const data = doc.data() as UserData;
        let currentRole = data.role;
        if (isDeveloperEmail(data.email)) {
          currentRole = 'developer';
        }
        return { id: doc.id, ...data, role: currentRole };
      }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'users'));
    return unsub;
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const result = await Swal.fire({
      title: 'Ubah Role?',
      text: `Yakin mengubah role user ini menjadi ${newRole}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, ubah!',
      cancelButtonText: 'Batal'
    });
    
    if(result.isConfirmed) {
       try {
         await updateDoc(doc(db, 'users', userId), { role: newRole });
         Swal.fire('Berhasil!', 'Role berhasil diubah.', 'success');
       } catch (error) {
         handleFirestoreError(error, OperationType.UPDATE, 'users');
         Swal.fire('Gagal!', 'Anda mungkin tidak memiliki izin mengubah role ini.', 'error');
       }
    }
  }

  const handleDelete = async (userId: string) => {
    if(userId === user?.uid) {
       Swal.fire('Peringatan!', 'Tidak dapat menghapus akun sendiri.', 'warning');
       return;
    }
    
    // Explicitly allow deletion and clarify it handles session
    const result = await Swal.fire({
      title: 'Hapus User?',
      text: 'User ini akan dihapus secara permanen dari database! Mereka juga akan otomatis logout.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });
    
    if(result.isConfirmed) {
      try { 
        await deleteDoc(doc(db, 'users', userId)); 
        Swal.fire('Berhasil!', 'User berhasil dihapus dan sesi mereka akan berakhir.', 'success');
      }
      catch(e) { handleFirestoreError(e, OperationType.DELETE, 'users'); Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus.', 'error'); }
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = formData.username.toLowerCase() + '@admin.com';
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, formData.password);
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        displayName: formData.username,
        role: formData.role,
        createdAt: Date.now()
      });
      
      setShowAddForm(false);
      setFormData({ username: '', password: '', role: 'pengurus' });
      Swal.fire({
        title: 'Berhasil!',
        text: `User ${formData.username} berhasil dibuat sebagai ${formData.role}!`,
        icon: 'success',
        confirmButtonText: 'Oke'
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
         Swal.fire({
           title: 'Gagal!',
           text: 'Username sudah digunakan, silakan buat username lain.',
           icon: 'error',
           confirmButtonText: 'Oke'
         });
      } else {
         Swal.fire({
           title: 'Gagal!',
           text: "Gagal membuat user: " + error.message,
           icon: 'error',
           confirmButtonText: 'Oke'
         });
      }
    } finally {
      secondaryAuth.signOut(); // Clean up session for secondary instance
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {showAddForm && (
        <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden max-w-2xl">
           <div className="p-6 md:p-8 border-b border-[#1e2330] bg-transparent flex justify-between items-center">
              <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">Tambah Pengguna Baru</h2>
              <button onClick={() => setShowAddForm(false)} className="text-[#94a3b8] hover:text-red-400 transition-colors bg-[#131722] rounded-full p-2 border border-[#242b3d]"><X size={18}/></button>
           </div>
           <form onSubmit={handleAddUser} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Username Baru</label>
                <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" placeholder="hanya huruf kecil & angka, tanpa spasi"/>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Password Baru</label>
                <input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" placeholder="Minimal 6 karakter"/>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2">Pilih Role Sistem</label>
                <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium">
                  <option value="pengurus">Pengurus</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-[#94a3b8] font-bold mt-2 uppercase tracking-widest leading-relaxed">Catatan: Pengurus memiliki akses menambah konten tapi tidak bisa mengubah pengaturan pengguna lainnya. Admin memiliki akses penuh ke sistem.</p>
              </div>
              <div className="pt-6 border-t-2 border-[#0f1115] mt-4 flex gap-4 justify-end">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-3 border border-slate-600 rounded-full text-[#94a3b8] hover:bg-slate-800 font-bold uppercase tracking-widest text-xs transition-colors">Batal</button>
                <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5 disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Buat Pengguna'}
                </button>
              </div>
           </form>
        </div>
      )}

      <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[#1e2330] bg-transparent flex justify-between items-center">
           <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">Manajemen Pengguna</h2>
           <div className="flex gap-4 items-center">
             <div className="text-xs text-red-400 bg-red-900/20 border border-red-900/50 font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                Total Pengguna: {users.length}
             </div>
             {!showAddForm && (
               <button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-2 shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5">
                 <UserPlus size={16}/> Tambah
               </button>
             )}
           </div>
        </div>
      
      <div className="overflow-x-auto">
        {users.length === 0 ? (
          <div className="p-12 text-center text-[#94a3b8]">
            <p className="font-medium text-sm">Belum ada pengguna terdaftar.</p>
          </div>
        ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1e2330] text-[#94a3b8] border-b-2 border-[#242b3d] text-xs uppercase tracking-widest font-black">
              <th className="py-4 px-6 font-semibold">Nama / Email</th>
              <th className="py-4 px-6 font-semibold">Tgl Daftar</th>
              <th className="py-4 px-6 font-semibold">Role Sistem</th>
              <th className="py-4 px-6 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2330] text-sm">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-[#0f1115] transition-colors">
                <td className="py-4 px-6">
                  <div className="font-black text-[#cbd5e1] uppercase tracking-wide">{u.displayName}</div>
                  <div className="text-[#94a3b8] text-xs font-bold uppercase tracking-widest">{u.email}</div>
                </td>
                <td className="py-4 px-6 text-[#94a3b8] font-bold text-xs uppercase tracking-widest">
                  {format(new Date(u.createdAt), 'dd MMM yyyy')}
                </td>
                <td className="py-4 px-6">
                   <select 
                     disabled={u.id === user?.uid || u.role === 'developer'}
                     value={u.role} 
                     onChange={(e) => handleRoleChange(u.id, e.target.value)}
                     className="bg-[#0f1115] border-2 border-[#1e2330] text-[#94a3b8] text-xs font-bold uppercase tracking-widest rounded-xl focus:ring-0 focus:border-[#3b82f6] block p-2 disabled:bg-[#0f1115] disabled:text-[#94a3b8] disabled:border-[#1e2330] transition-all"
                   >
                     <option value="guest">Guest</option>
                     <option value="anggota">Anggota</option>
                     <option value="pengurus">Pengurus</option>
                     <option value="admin">Admin</option>
                     <option value="developer" disabled>Developer</option>
                   </select>
                </td>
                <td className="py-4 px-6 text-right">
                  <button 
                     disabled={u.id === user?.uid || u.role === 'developer'}
                     onClick={() => handleDelete(u.id)} 
                     className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex"
                     title="Hapus Pengguna"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
    </div>
  )
}
