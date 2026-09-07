import React, { useState } from 'react';
import { updatePassword, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import Swal from 'sweetalert2';
import { Key } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export default function ProfileSettings() {
  const { user, userData, setRole } = useAuth();
  const [formData, setFormData] = useState({
    displayName: userData?.displayName || '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  // Re-sync form when user data loads
  React.useEffect(() => {
    if (userData?.displayName) {
      setFormData(prev => ({ ...prev, displayName: userData.displayName }));
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      Swal.fire('Gagal!', 'Password dan Konfirmasi Password tidak cocok!', 'error');
      return;
    }

    setLoading(true);
    try {
      let updated = false;

      // Update Display Name
      if (formData.displayName !== userData?.displayName) {
        await updateProfile(user, { displayName: formData.displayName });
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: formData.displayName
        });
        updated = true;
      }

      // Update Password
      if (formData.password) {
        await updatePassword(user, formData.password);
        updated = true;
      }

      if (updated) {
        Swal.fire('Berhasil!', 'Profil pengguna berhasil diperbarui.', 'success');
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        Swal.fire('Info', 'Tidak ada data yang diubah.', 'info');
      }

    } catch (error: any) {
      console.error(error);
      let errorMsg = error.message;
      if (error.code === 'auth/requires-recent-login') {
         errorMsg = 'Aksi ini memerlukan login ulang untuk alasan keamanan sistem. Silahkan logout dan login kembali untuk mengubah password.';
      }
      Swal.fire('Gagal!', errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#0f1115] to-[#13161c] p-6 md:p-8 rounded-3xl border-2 border-[#1e2330] shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5">
           <Key size={100} />
         </div>
         <div className="relative z-10">
           <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
             <Key className="text-[#3b82f6]" size={32} />
             Pengaturan Akun Pribadi
           </h1>
           <p className="text-[#94a3b8] font-bold tracking-widest uppercase text-xs mt-2 max-w-xl leading-relaxed">
             Ubah Nama Tampilan Atau Password Anda Disini.
           </p>
         </div>
      </div>

      <div className="bg-[#0f1115] border-2 border-[#1e2330] rounded-3xl p-6 lg:p-8 shadow-xl max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2 text-left w-full pl-1">
              Username Pengguna (Login)
            </label>
            <input 
              type="text" 
              disabled
              value={user?.email?.replace('@admin.com', '') || ''} 
              className="w-full bg-[#0a0b0d] text-[#94a3b8] px-4 py-3 border-2 border-[#1e2330] rounded-xl outline-none transition-all font-medium cursor-not-allowed" 
            />
            <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mt-2 px-1 text-left">Username login tidak bisa diubah.</p>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2 text-left w-full pl-1">
              Nama Tampilan (Display Name)
            </label>
            <input 
              type="text" 
              required
              value={formData.displayName} 
              onChange={e => setFormData({...formData, displayName: e.target.value})}
              className="w-full bg-[#13161c] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" 
            />
          </div>

          <div className="pt-4 border-t-2 border-[#1e2330]">
             <h2 className="text-lg font-black text-white tracking-widest uppercase mb-4 text-left">Ganti Password</h2>
             
             <div className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2 w-full pl-1">
                    Password Baru (Biarkan kosong jika tidak ingin mengubah)
                  </label>
                  <input 
                    type="password" 
                    minLength={6}
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-[#13161c] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-2 w-full pl-1">
                    Konfirmasi Password Baru
                  </label>
                  <input 
                    type="password" 
                    minLength={6}
                    value={formData.confirmPassword} 
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full bg-[#13161c] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" 
                  />
                </div>
             </div>
          </div>

          <div className="pt-6 border-t-2 border-[#1e2330] mt-4 flex gap-4 justify-end">
            <button 
              type="submit" 
              disabled={loading} 
              className="px-8 py-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/10 transition-all hover:-translate-y-1 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan Akun'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
