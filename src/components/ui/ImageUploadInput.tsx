import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Swal from 'sweetalert2';

interface ImageUploadInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  folder?: string;
}

export default function ImageUploadInput({ value, onChange, label = "URL Gambar (Opsional)", placeholder = "https://...", folder = "uploads" }: ImageUploadInputProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertFileToWebp = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 1920;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            } else {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Konteks kanvas gagal dimuat'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Gagal mengkonversi ke WebP'));
          }, 'image/webp', 0.85);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire('Gagal!', 'Hanya format gambar yang diperbolehkan.', 'error');
      return;
    }

    setUploading(true);
    try {
      const webpBlob = await convertFileToWebp(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      await uploadBytes(storageRef, webpBlob, { contentType: 'image/webp' });
      const downloadURL = await getDownloadURL(storageRef);
      
      onChange(downloadURL);
      setMode('url');
    } catch (error) {
      console.error(error);
      Swal.fire('Gagal!', 'Terjadi kesalahan saat mengunggah gambar ke server.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-2">
         <label className="block text-xs font-black uppercase tracking-widest text-[#94a3b8]">{label}</label>
         <div className="flex bg-[#242b3d] rounded-lg overflow-hidden shrink-0">
            <button 
              type="button" 
              onClick={() => setMode('url')} 
              className={`px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${mode === 'url' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8] hover:text-white'}`}
            >
              <LinkIcon size={12} /> URL
            </button>
            <button 
              type="button" 
              onClick={() => setMode('upload')} 
              className={`px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${mode === 'upload' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8] hover:text-white'}`}
            >
              <Upload size={12} /> Upload File
            </button>
         </div>
      </div>
      
      {mode === 'url' ? (
        <input 
          type="text" 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium" 
          placeholder={placeholder} 
        />
      ) : (
        <div className="relative">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*"
            disabled={uploading}
            className="hidden" 
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full bg-[#0f1115] text-[#94a3b8] px-4 py-6 border-2 border-[#242b3d] border-dashed rounded-xl outline-none transition-all font-medium sm:hover:bg-[#13161c] hover:border-[#3b82f6]/50 flex flex-col items-center justify-center gap-3 cursor-pointer group disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={28} className="animate-spin text-[#3b82f6]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#cbd5e1]">Mengunggah & Mengompresi...</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-[#242b3d] group-hover:bg-[#3b82f6]/10 flex items-center justify-center transition-colors">
                  <Upload size={24} className="text-[#cbd5e1] group-hover:text-[#3b82f6] transition-colors" />
                </div>
                <div className="text-center mt-1">
                   <p className="text-sm font-bold text-white mb-1">Pilih Gambar Dari Perangkat</p>
                   <p className="text-[10px] text-[#64748b] tracking-wider uppercase font-bold">Otomatis Dikonversi ke WebP</p>
                </div>
              </>
            )}
          </button>
          
          {/* Tampilkan preview kecil jika sudah ada URL dari upload sebelumnya (dan kita di tab upload) */}
          {value && !uploading && value.startsWith('http') && (
            <div className="mt-3 flex gap-3 overflow-hidden items-center group relative border border-[#1e2330] p-2 pr-4 rounded-xl bg-[#0a0c10]">
              <img src={value} alt="Preview" className="w-12 h-12 object-cover rounded-lg bg-[#242b3d]" />
              <div className="flex flex-col overflow-hidden">
                 <span className="text-[10px] font-bold text-white uppercase tracking-widest mb-0.5">Berhasil Diunggah</span>
                 <span className="text-[10px] text-[#64748b] truncate">{value}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
