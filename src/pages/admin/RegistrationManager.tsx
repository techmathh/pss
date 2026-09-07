import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, doc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Trash2, MessageCircle, Mail, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useSettings } from '../../lib/useSettings';
import Swal from 'sweetalert2';

interface RegistrationItem {
  id: string;
  fullName: string;
  grade: string;
  section: string;
  whatsapp: string;
  email: string;
  reason: string;
  createdAt: number;
}

export default function RegistrationManager() {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const { settings } = useSettings();

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'registrations'), orderBy('createdAt', 'desc'), limit(100)), (snap) => {
      setRegistrations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'registrations'));
    return unsub;
  }, []);

  const contactWA = (reg: any) => {
    const text = encodeURIComponent(`Halo ${reg.fullName}, saya pengurus ${settings.name}. Menindaklanjuti pendaftaran kamu...`);
    window.open(`https://api.whatsapp.com/send?phone=${reg.whatsapp}&text=${text}`, '_blank');
  };

  const contactEmail = (reg: any) => {
    const subject = encodeURIComponent(`Info Pendaftaran ${settings.name}`);
    const body = encodeURIComponent(`Halo ${reg.fullName},\n\nTerima kasih telah mendaftar di ${settings.name}.\n\n...`);
    window.open(`mailto:${reg.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'registrations', id), { status: newStatus });
      Swal.fire({ title: 'Berhasil', text: `Status diubah menjadi ${newStatus}`, icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'registrations');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Hapus data?',
        text: 'Data pendaftaran ini akan dihapus secara permanen!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });
      
      if (result.isConfirmed) {
        await deleteDoc(doc(db, 'registrations', id));
        Swal.fire({
          title: 'Berhasil!',
          text: 'Data berhasil dihapus!',
          icon: 'success',
          confirmButtonText: 'Oke'
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'registrations');
      Swal.fire({
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menghapus data.',
        icon: 'error',
        confirmButtonText: 'Oke'
      });
    }
  };

  return (
    <div className="bg-[#131722] rounded-2xl shadow-xl border border-[#1e2330] overflow-hidden">
      <div className="p-6 md:p-8 border-b border-[#1e2330] bg-transparent flex justify-between items-center">
         <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">Daftar Pendaftaran Masuk</h2>
         <div className="text-xs text-red-400 bg-red-900/20 border border-red-900/50 font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-sm">
            Total data: {registrations.length}
         </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1e2330] text-[#94a3b8] border-b-2 border-[#242b3d] text-xs uppercase tracking-widest font-black">
              <th className="py-4 px-6 font-semibold">Waktu</th>
              <th className="py-4 px-6 font-semibold">Nama Lengkap</th>
              <th className="py-4 px-6 font-semibold">Kelas/Jrsn</th>
              <th className="py-4 px-6 font-semibold">Kontak</th>
              <th className="py-4 px-6 font-semibold w-1/4">Alasan</th>
              <th className="py-4 px-6 font-semibold text-center">Status</th>
              <th className="py-4 px-6 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2330] text-sm">
            {registrations.map(reg => (
              <tr key={reg.id} className="hover:bg-[#0f1115] transition-colors">
                <td className="py-4 px-6 text-[#94a3b8] whitespace-nowrap font-medium text-xs">
                  {format(new Date(reg.createdAt), 'dd MMM yyyy, HH:mm')}
                </td>
                <td className="py-4 px-6 font-black text-[#cbd5e1] uppercase text-xs">{reg.fullName}</td>
                <td className="py-4 px-6 text-[#94a3b8] whitespace-nowrap">{reg.grade} - {reg.section}</td>
                <td className="py-4 px-6 text-[#94a3b8] font-bold">
                  <div className="flex flex-col gap-1">
                    <span className="text-red-400">{reg.whatsapp}</span>
                    <span className="text-xs text-[#94a3b8] font-medium">{reg.email}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-[#94a3b8] text-xs leading-relaxed">{reg.reason}</td>
                <td className="py-4 px-6 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    (reg as any).status === 'approved' ? 'bg-green-900/30 text-green-400 border border-green-800' :
                    (reg as any).status === 'rejected' ? 'bg-red-900/30 text-red-400 border border-red-800' :
                    'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                  }`}>{(reg as any).status || 'pending'}</span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-end gap-2 flex-wrap min-w-[200px]">
                    {(!('status' in reg) || (reg as any).status === 'pending') && (
                      <>
                        <button onClick={() => updateStatus(reg.id, 'approved')} title="Terima" className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all inline-flex">
                          <CheckCircle size={14} />
                        </button>
                        <button onClick={() => updateStatus(reg.id, 'rejected')} title="Tolak" className="p-2 text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-all inline-flex">
                          <XCircle size={14} />
                        </button>
                      </>
                    )}
                    <button onClick={() => contactWA(reg)} title="Hubungi via WhatsApp" className="flex items-center gap-1 px-3 py-2 text-emerald-400 hover:bg-emerald-900/20 rounded-xl transition-all border border-emerald-900/50 bg-emerald-900/30 font-bold text-xs uppercase tracking-widest">
                      <MessageCircle size={14} /> WhatsApp
                    </button>
                    <button onClick={() => contactEmail(reg)} title="Kirim Email" className="flex items-center gap-1 px-3 py-2 text-blue-400 hover:bg-blue-900/20 rounded-xl transition-all border border-blue-900/50 bg-blue-900/30 font-bold text-xs uppercase tracking-widest">
                      <Mail size={14} /> Email
                    </button>
                    <button onClick={() => handleDelete(reg.id)} title="Hapus" className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all inline-flex">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#94a3b8] font-medium border-t-2 border-dashed border-[#242b3d]">
                  Belum ada data pendaftar baru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
