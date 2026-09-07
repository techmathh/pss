import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Swal from 'sweetalert2';

interface MultiImageUploadInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  folder?: string;
}

export default function MultiImageUploadInput({ value, onChange, label = "URL Foto (Satu URL per baris)", placeholder = "https://...", folder = "uploads" }: MultiImageUploadInputProps) {
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
            reject(new Error('Canvas setup failed'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas toBlob failed'));
          }, 'image/webp', 0.85); // 85% quality webp
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files as FileList || []);
    if (files.length === 0) return;

    const invalidFiles = files.filter(f => !f.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      Swal.fire('Gagal!', 'Pilih hanya file gambar yang valid.', 'error');
      return;
    }

    setUploading(true);
    let uploadedUrls: string[] = [];

    try {
      // Limit to 5 at a time concurrently maybe, or sequence. Sequence is safer
      for (const file of files) {
        const webpBlob = await convertFileToWebp(file);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
        const storageRef = ref(storage, `${folder}/${fileName}`);
        
        await uploadBytes(storageRef, webpBlob, { contentType: 'image/webp' });
        const downloadURL = await getDownloadURL(storageRef);
        uploadedUrls.push(downloadURL);
      }
      
      const newUrls = uploadedUrls.join('\n');
      const updatedValue = value ? `${value}\n${newUrls}` : newUrls;
      onChange(updatedValue);
      
      Swal.fire({
        title: 'Berhasil!',
        text: `${uploadedUrls.length} file berhasil diunggah.`,
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
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
         <div className="relative shrink-0">
           <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleUpload}
              accept="image/*"
              multiple
              disabled={uploading}
              className="hidden" 
           />
           <button 
             type="button" 
             onClick={() => fileInputRef.current?.click()}
             disabled={uploading}
             className="px-4 py-2 bg-[#1e2330] hover:bg-[#242b3d] text-[#cbd5e1] border-2 border-[#2a3245] rounded-lg font-bold tracking-wider uppercase transition-all flex items-center gap-2 text-xs"
           >
             {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} 
             {uploading ? 'Mengunggah...' : 'Upload Gambar'}
           </button>
         </div>
      </div>
      
      <textarea 
         rows={5} 
         value={value} 
         onChange={e => onChange(e.target.value)} 
         className="w-full bg-[#0f1115] text-white px-4 py-3 border-2 border-[#242b3d] rounded-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all font-medium whitespace-pre leading-relaxed font-mono text-sm" 
         placeholder={placeholder} 
      />
      <p className="text-xs text-[#94a3b8] mt-2 font-medium">Anda bisa menempel (paste) URL secara manual atau gunakan tombol <strong className="text-white">Upload Gambar</strong> untuk mengunggah otomatis. Pisahkan setiap URL dengan ENTER (baris baru).</p>
    </div>
  );
}
