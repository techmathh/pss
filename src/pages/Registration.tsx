import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import Layout from '../components/ui/Layout';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { useSettings } from '../lib/useSettings';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const registrationSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap harus minimal 2 karakter').max(100),
  grade: z.string().min(1),
  section: z.string().min(1),
  whatsapp: z.string().min(5, 'Nomor telepon terlalu pendek'),
  email: z.string().email('Format email tidak valid').max(100),
  reason: z.string().min(10, 'Alasan minimal 10 karakter').max(1000)
});

type RegistrationFormInputs = z.infer<typeof registrationSchema>;

export default function Registration() {
  const navigate = useNavigate();
  const { settings, loading } = useSettings();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegistrationFormInputs>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      grade: 'X',
      section: 'A',
      whatsapp: '',
      email: '',
      reason: ''
    }
  });

  if (loading) {
    return <Layout><div className="flex justify-center items-center h-[50vh]">Memuat...</div></Layout>;
  }

  if (settings.registrationOpen === false) {
    return (
      <Layout>
        <div className="min-h-[80vh] bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-transparent to-transparent"></div>
          <div className="sm:mx-auto sm:w-full sm:max-w-md bg-slate-900/50 p-8 rounded-[2rem] shadow-2xl border border-white/5 text-center backdrop-blur-md relative z-10">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Pendaftaran Ditutup</h1>
            <p className="text-slate-300 mb-6">
              Mohon maaf, pendaftaran anggota baru saat ini sedang ditutup.
              {settings.registrationOpenDate && (
                <span className="block mt-2 font-medium text-red-500">
                  Akan dibuka kembali pada: {settings.registrationOpenDate}
                </span>
              )}
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-full transition-all w-full shadow-[0_0_15px_rgba(220,38,38,0.4)]"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const onSubmit = async (data: RegistrationFormInputs) => {
    let phoneNum = data.whatsapp.replace(/\D/g, '');
    if (phoneNum.startsWith('0')) {
       phoneNum = '62' + phoneNum.substring(1);
    }
    
    try {
      const regRef = doc(db, 'registrations', phoneNum);
      await setDoc(regRef, {
        fullName: data.fullName,
        grade: data.grade,
        section: data.section,
        email: data.email,
        whatsapp: phoneNum,
        reason: data.reason,
        status: 'pending',
        createdAt: Date.now()
      });
      Swal.fire({
        title: 'Berhasil!',
        text: 'Pendaftaran berhasil terkirim! Silakan tunggu pengurus menghubungi Anda.',
        icon: 'success',
        confirmButtonText: 'Oke'
      }).then(() => {
        navigate('/');
      });
    } catch (error: any) {
      if (error.message && error.message.includes('permission')) {
        Swal.fire({
          title: 'Perhatian!',
          text: 'Nomor WhatsApp ini sudah terdaftar. Silakan tunggu informasi dari pengurus.',
          icon: 'warning',
          confirmButtonText: 'Oke'
        });
      } else {
        console.error('Registration failed:', error);
        Swal.fire({
          title: 'Gagal!',
          text: 'Gagal mengirim pendaftaran.',
          icon: 'error',
          confirmButtonText: 'Oke'
        });
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-24 w-full relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-md rounded-[2rem] shadow-2xl overflow-hidden border border-white/5">
          <div className="bg-slate-950 p-10 text-white text-center border-b border-t-red-600 border-t-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/30 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-display font-black mb-3 uppercase tracking-widest text-shadow-sm">Formulir Pendaftaran</h1>
              <p className="text-slate-400 font-light text-lg">Bergabunglah dan kembangkan prestasimu bersama kami</p>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide" htmlFor="fullName">Nama Lengkap</label>
                <input 
                  type="text" 
                  id="fullName"
                  {...register('fullName')}
                  className="w-full px-5 py-4 rounded-xl bg-slate-800 border border-white/10 focus:ring-0 focus:border-red-500 outline-none transition-all font-medium text-white placeholder-slate-500"
                  placeholder="Contoh: Budi Santoso"
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-2 font-bold">{errors.fullName.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide" htmlFor="grade">Kelas</label>
                  <select 
                    id="grade"
                    {...register('grade')}
                    className="w-full px-5 py-4 rounded-xl bg-slate-800 border border-white/10 focus:ring-0 focus:border-red-500 outline-none transition-all font-medium text-white"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide" htmlFor="section">Bagian/Jurusan</label>
                  <select 
                    id="section"
                    {...register('section')}
                    className="w-full px-5 py-4 rounded-xl bg-slate-800 border border-white/10 focus:ring-0 focus:border-red-500 outline-none transition-all font-medium text-white"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide" htmlFor="whatsapp">Nomor WhatsApp</label>
                  <input 
                     type="tel" 
                     id="whatsapp"
                     {...register('whatsapp')}
                     className="w-full px-5 py-4 rounded-xl bg-slate-800 border border-white/10 focus:ring-0 focus:border-red-500 outline-none transition-all font-medium text-white placeholder-slate-500"
                     placeholder="081234567890"
                  />
                  {errors.whatsapp && <p className="text-red-500 text-xs mt-2 font-bold">{errors.whatsapp.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide" htmlFor="email">Email Aktif</label>
                  <input 
                     type="email" 
                     id="email"
                     {...register('email')}
                     className="w-full px-5 py-4 rounded-xl bg-slate-800 border border-white/10 focus:ring-0 focus:border-red-500 outline-none transition-all font-medium text-white placeholder-slate-500"
                     placeholder="emailanda@gmail.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-2 font-bold">{errors.email.message}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide" htmlFor="reason">Alasan Ingin Bergabung</label>
                <textarea 
                   id="reason"
                   {...register('reason')}
                   rows={4}
                   className="w-full px-5 py-4 rounded-xl bg-slate-800 border border-white/10 focus:ring-0 focus:border-red-500 outline-none transition-all resize-none font-medium text-white placeholder-slate-500"
                   placeholder="Tuliskan motivasi kamu bergabung dengan organisasi ini..."
                ></textarea>
                {errors.reason && <p className="text-red-500 text-xs mt-2 font-bold">{errors.reason.message}</p>}
              </div>
              
              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-sm py-5 rounded-full transition-all shadow-[0_0_20px_rgba(255,50,50,0.4)] disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
                >
                  {isSubmitting ? 'Mengirim Data...' : 'Kirim Pendaftaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
