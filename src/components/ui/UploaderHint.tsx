import React, { useState } from 'react';
import { ExternalLink, Info, UploadCloud } from 'lucide-react';

export default function UploaderHint() {
  const [showIframe, setShowIframe] = useState(false);

  return (
    <div className="bg-[#131722] border-2 border-[#1e2330] rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="bg-[#1e2330] p-3 rounded-xl text-blue-400">
          <UploadCloud size={24} />
        </div>
        <div className="flex-1">
          <p className="font-black text-white uppercase tracking-widest text-sm mb-1">Panduan Upload Media (Gambar/Video)</p>
          <p className="text-[#94a3b8] text-xs font-bold leading-relaxed mb-4">
            Untuk mengunggah gambar atau video, kami merekomendasikan menggunakan platform pihak ketiga untuk mengubah file menjadi link URL agar performa website tetap cepat. 
          </p>
          <div className="flex flex-wrap gap-3">
             <button 
                type="button"
                onClick={() => setShowIframe(!showIframe)} 
                className="bg-[#242b3d] hover:bg-[#323b4f] text-slate-200 border border-[#404b61] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md transition-all"
             >
                {showIframe ? 'Tutup Uploader' : 'Buka Panel Upload KaiDev'}
             </button>
             <button 
                type="button"
                onClick={() => window.open('https://tourl.kaidev.my.id/', '_blank')} 
                className="bg-transparent hover:bg-[#242b3d] text-[#94a3b8] border border-[#1e2330] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
             >
                Buka di Tab Baru <ExternalLink size={14} />
             </button>
          </div>
        </div>
      </div>
      
      {showIframe && (
        <div className="mt-6 border-2 border-[#1e2330] rounded-2xl overflow-hidden bg-[#0c0e12] shadow-inner">
          <div className="bg-[#131722] text-[#cbd5e1] border-b border-[#1e2330] p-3 text-center text-[10px] font-black uppercase tracking-widest">
            KaiDev Cloud & Link Platform
          </div>
          <iframe 
             src="https://tourl.kaidev.my.id/" 
             className="w-full h-[500px] border-none" 
             title="Uploader Platform"
          />
          <div className="p-3 bg-[#0f1115] text-center border-t border-[#1e2330]">
             <p className="text-xs text-[#94a3b8] font-bold">1. Upload file<br/>2. Copy (salin) link URL yang diberikan<br/>3. Paste (tempel) di form "URL Foto/Video"</p>
          </div>
        </div>
      )}
    </div>
  );
}
