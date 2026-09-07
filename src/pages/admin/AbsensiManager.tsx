import React, { useState, useEffect } from 'react';
import { fetchAllAbsensiData, fetchAnggotaData, apiPost } from '../../lib/absensi';
import { Users, UserPlus, Save, Trash2, Calendar, Clock, AlertCircle, Download, FileText, FileSpreadsheet, X } from 'lucide-react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, parseISO, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';

function getLocalTodayStr() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export default function AbsensiManager() {
  const [tanggal, setTanggal] = useState(getLocalTodayStr());
  const [allAbsensi, setAllAbsensi] = useState<any[]>([]);
  const [anggotaList, setAnggotaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPeriode, setExportPeriode] = useState('harian');
  const [exportDate, setExportDate] = useState(getLocalTodayStr());

  // Formulir Tambah Absensi
  const [inputAnggota, setInputAnggota] = useState('');
  const [inputStatus, setInputStatus] = useState('Hadir');
  const [inputKeterangan, setInputKeterangan] = useState('');

  // Formulir Tambah Anggota
  const [anggotaNama, setAnggotaNama] = useState('');
  const [anggotaDivisi, setAnggotaDivisi] = useState('');

  useEffect(() => {
    loadInitData();
  }, []);

  const loadInitData = async () => {
    setLoading(true);
    try {
      const absensi = await fetchAllAbsensiData();
      const anggota = await fetchAnggotaData();
      
      setAllAbsensi(absensi);
      setAnggotaList(anggota);
      
      if (anggota.length > 0 && !inputAnggota) {
        setInputAnggota(anggota[0].id);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const absensiList = allAbsensi.filter((row: any) => {
    if (!row.tanggal) return false;
    const rowDate = typeof row.tanggal === 'string' ? row.tanggal.split('T')[0] : String(row.tanggal);
    return rowDate === tanggal;
  });

  const handleTambahAbsensi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAnggota) {
      Swal.fire('Perhatian', 'Pilih anggota terlebih dahulu.', 'warning');
      return;
    }

    const selectedAnggota = anggotaList.find(a => String(a.id) === String(inputAnggota));
    
    setSubmitting(true);
    try {
      const res = await apiPost({
        action: 'add_absensi',
        anggota_id: inputAnggota,
        nama: selectedAnggota?.nama || '',
        tanggal: tanggal,
        status: inputStatus,
        jam_masuk: '',
        jam_keluar: '',
        keterangan: inputKeterangan
      });

      if (res.success) {
        Swal.fire('Berhasil', 'Absensi disimpan.', 'success');
        setInputKeterangan('');
        loadInitData();
      } else {
        Swal.fire('Gagal', res.message || 'Gagal menyimpan.', 'error');
      }
    } catch (error) {
      Swal.fire('Gagal', 'Terjadi kesalahan sistem.', 'error');
    }
    setSubmitting(false);
  };

  const handleTambahAnggota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anggotaNama) return;
    
    setSubmitting(true);
    try {
      const res = await apiPost({
        action: 'add_anggota',
        nama: anggotaNama,
        divisi: anggotaDivisi
      });

      if (res.success) {
        Swal.fire('Berhasil', 'Anggota ditambahkan.', 'success');
        setAnggotaNama('');
        setAnggotaDivisi('');
        const anggota = await fetchAnggotaData();
        setAnggotaList(anggota);
      } else {
        Swal.fire('Gagal', res.message || 'Gagal menambah anggota.', 'error');
      }
    } catch (error) {
      Swal.fire('Gagal', 'Terjadi kesalahan sistem.', 'error');
    }
    setSubmitting(false);
  };

  const handleHapusAbsensi = async (id: any) => {
    const result = await Swal.fire({
      title: 'Hapus Absensi?',
      text: 'Data absensi ini akan dihapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const res = await apiPost({ action: 'delete_absensi', id });
        if (res.success) {
          Swal.fire('Berhasil', 'Data dihapus.', 'success');
          loadInitData();
        } else {
          Swal.fire('Gagal', 'Gagal menghapus.', 'error');
        }
      } catch (error) {
         Swal.fire('Gagal', 'Terjadi kesalahan sistem.', 'error');
      }
      setLoading(false);
    }
  };

  const handleExport = (formatType: 'pdf' | 'csv') => {
    let filteredExportData = allAbsensi;
    const targetDate = parseISO(exportDate);
    
    // Filter data based on selected period
    if (exportPeriode === 'harian') {
      filteredExportData = allAbsensi.filter(row => {
        if (!row.tanggal) return false;
        const rowDate = typeof row.tanggal === 'string' ? row.tanggal.split('T')[0] : String(row.tanggal);
        return rowDate === exportDate;
      });
    } else if (exportPeriode === 'mingguan') {
      const start = startOfWeek(targetDate, { weekStartsOn: 1 });
      const end = endOfWeek(targetDate, { weekStartsOn: 1 });
      filteredExportData = allAbsensi.filter(row => {
        if (!row.tanggal) return false;
        const rowDate = typeof row.tanggal === 'string' ? row.tanggal.split('T')[0] : String(row.tanggal);
        try {
          return isWithinInterval(parseISO(rowDate), { start, end });
        } catch(e) { return false; }
      });
    } else if (exportPeriode === 'bulanan') {
      const start = startOfMonth(targetDate);
      const end = endOfMonth(targetDate);
      filteredExportData = allAbsensi.filter(row => {
        if (!row.tanggal) return false;
        const rowDate = typeof row.tanggal === 'string' ? row.tanggal.split('T')[0] : String(row.tanggal);
        try {
          return isWithinInterval(parseISO(rowDate), { start, end });
        } catch(e) { return false; }
      });
    }

    // Map the division (kelas) to the export data and sort by date then name
    filteredExportData = filteredExportData.map(absensi => {
      const anggota = anggotaList.find(a => String(a.id) === String(absensi.anggota_id));
      return {
        ...absensi,
        divisi: anggota ? anggota.divisi : '-',
        nama: anggota ? anggota.nama : absensi.nama
      };
    }).sort((a, b) => {
      if (a.tanggal !== b.tanggal) return a.tanggal.localeCompare(b.tanggal);
      return (a.nama || '').localeCompare(b.nama || '');
    });

    if (filteredExportData.length === 0) {
      Swal.fire('Data Kosong', 'Tidak ada data absensi untuk periode ini.', 'info');
      return;
    }

    let reportTitle = '';
    if (exportPeriode === 'harian') {
      reportTitle = `Laporan Absensi Harian - ${format(targetDate, 'dd MMMM yyyy', { locale: id })}`;
    } else if (exportPeriode === 'mingguan') {
      const start = startOfWeek(targetDate, { weekStartsOn: 1 });
      const end = endOfWeek(targetDate, { weekStartsOn: 1 });
      reportTitle = `Laporan Absensi Mingguan - ${format(start, 'dd MMM', { locale: id })} s/d ${format(end, 'dd MMM yyyy', { locale: id })}`;
    } else {
      reportTitle = `Laporan Absensi Bulanan - ${format(targetDate, 'MMMM yyyy', { locale: id })}`;
    }

    if (formatType === 'csv') {
      // CSV Export
      const headers = ['Tanggal', 'Nama', 'Divisi/Kelas', 'Status', 'Keterangan'];
      const csvContent = [
        headers.join(','),
        ...filteredExportData.map(row => {
          return [
            row.tanggal,
            `"${row.nama || ''}"`,
            `"${row.divisi || ''}"`,
            row.status,
            `"${row.keterangan || ''}"`
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${reportTitle}.csv`;
      link.click();
      setShowExportModal(false);
    } else if (formatType === 'pdf') {
      // PDF Export
      const doc = new jsPDF();
      
      // Add Title
      doc.setFontSize(16);
      doc.setTextColor(20, 30, 50);
      doc.text(reportTitle, 14, 20);

      // Add Subtitle / Gen Date
      doc.setFontSize(10);
      doc.setTextColor(100, 110, 120);
      doc.text(`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}`, 14, 28);

      // Table mapping
      const tableColumn = ["No", "Tanggal", "Nama Lengkap", "Divisi/Kelas", "Status", "Keterangan"];
      const tableRows = filteredExportData.map((row, index) => [
        index + 1,
        row.tanggal,
        row.nama,
        row.divisi,
        row.status,
        row.keterangan || '-'
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 15 }, // No
          1: { cellWidth: 25 }, // Tanggal
          2: { cellWidth: 50 }, // Nama
          3: { cellWidth: 35 }, // Divisi
          4: { cellWidth: 20 }, // Status
          5: { cellWidth: 'auto' } // Keterangan
        }
      });

      doc.save(`${reportTitle}.pdf`);
      setShowExportModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1e2330]/50 border border-blue-500/30 rounded-xl p-4 flex gap-4 items-start">
         <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
           <AlertCircle className="w-5 h-5 text-blue-400" />
         </div>
         <div>
            <h3 className="text-white font-bold text-sm mb-1">Integrasi Google Sheets</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Modul absensi ini menggunakan Google Apps Script & Spreadsheets sebagai media penyimpanan datanya (bukan Firebase Firestore).
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tambah Absensi Form */}
        <div className="bg-[#131722] border border-[#1e2330] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Calendar size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Input Absensi</h2>
          </div>

          <form onSubmit={handleTambahAbsensi} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Anggota</label>
                <select 
                  value={inputAnggota} 
                  onChange={e => setInputAnggota(e.target.value)}
                  className="w-full bg-[#0f1115] border border-[#1e2330] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  required
                >
                  {anggotaList.map(a => (
                    <option key={a.id} value={a.id}>{a.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Tanggal</label>
                <input 
                  type="date"
                  value={tanggal}
                  onChange={e => setTanggal(e.target.value)}
                  className="w-full bg-[#0f1115] border border-[#1e2330] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Status</label>
                <select 
                  value={inputStatus} 
                  onChange={e => setInputStatus(e.target.value)}
                  className="w-full bg-[#0f1115] border border-[#1e2330] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                >
                  <option>Hadir</option>
                  <option>Izin</option>
                  <option>Sakit</option>
                  <option>Alpha</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Keterangan</label>
              <input 
                type="text" 
                value={inputKeterangan}
                onChange={e => setInputKeterangan(e.target.value)}
                placeholder="Keterangan opsional"
                className="w-full bg-[#0f1115] border border-[#1e2330] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !inputAnggota}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {submitting ? 'Menyimpan...' : 'Simpan Absensi'}
            </button>
          </form>
        </div>

        {/* Tambah Anggota Form */}
        <div className="bg-[#131722] border border-[#1e2330] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <UserPlus size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Tambah Anggota Baru</h2>
          </div>

          <form onSubmit={handleTambahAnggota} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Nama Anggota</label>
              <input 
                type="text" 
                value={anggotaNama}
                onChange={e => setAnggotaNama(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full bg-[#0f1115] border border-[#1e2330] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Divisi / Kelas</label>
              <input 
                type="text" 
                value={anggotaDivisi}
                onChange={e => setAnggotaDivisi(e.target.value)}
                placeholder="Contoh: Kelas X-A"
                className="w-full bg-[#0f1115] border border-[#1e2330] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !anggotaNama}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
            >
              <UserPlus size={18} />
              {submitting ? 'Menambahkan...' : 'Tambah Anggota'}
            </button>
          </form>
        </div>
      </div>

      {/* Tabel Absensi */}
      <div className="bg-[#131722] border border-[#1e2330] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#1e2330] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Data Absensi</h2>
              <p className="text-sm text-slate-400">Total data absensi pada tanggal ini.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input 
              type="date"
              value={tanggal}
              onChange={e => setTanggal(e.target.value)}
              className="flex-1 sm:flex-none bg-[#0f1115] border border-[#1e2330] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
            />
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export Data</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f1115]">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-[#1e2330]">Nama</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-[#1e2330]">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-[#1e2330]">Keterangan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-[#1e2330] w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2330]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-400">
                    <div className="flex justify-center mb-2">
                       <div className="w-6 h-6 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                    Memuat data...
                  </td>
                </tr>
              ) : absensiList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400">
                    Belum ada data absensi untuk tanggal {tanggal}.
                  </td>
                </tr>
              ) : (
                absensiList.map((d, i) => (
                  <tr key={d.id || i} className="hover:bg-[#1e2330]/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{d.nama || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                         d.status === 'Hadir' ? 'bg-green-500/20 text-green-400' :
                         d.status === 'Izin' ? 'bg-yellow-500/20 text-yellow-400' :
                         d.status === 'Sakit' ? 'bg-orange-500/20 text-orange-400' :
                         d.status === 'Alpha' ? 'bg-red-500/20 text-red-400' :
                         'bg-slate-500/20 text-slate-400'
                      }`}>
                        {d.status || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{d.keterangan || '-'}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleHapusAbsensi(d.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Export */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131722] border border-[#1e2330] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#1e2330] flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Download size={20} className="text-indigo-400" />
                Export Data Absensi
              </h3>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Pilih Periode Laporan</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setExportPeriode('harian')}
                    className={`py-2 px-3 text-sm font-semibold rounded-lg border transition-all ${exportPeriode === 'harian' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-[#0f1115] border-[#1e2330] text-slate-400 hover:border-slate-600'}`}
                  >
                    Harian
                  </button>
                  <button
                    onClick={() => setExportPeriode('mingguan')}
                    className={`py-2 px-3 text-sm font-semibold rounded-lg border transition-all ${exportPeriode === 'mingguan' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-[#0f1115] border-[#1e2330] text-slate-400 hover:border-slate-600'}`}
                  >
                    Mingguan
                  </button>
                  <button
                    onClick={() => setExportPeriode('bulanan')}
                    className={`py-2 px-3 text-sm font-semibold rounded-lg border transition-all ${exportPeriode === 'bulanan' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-[#0f1115] border-[#1e2330] text-slate-400 hover:border-slate-600'}`}
                  >
                    Bulanan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Tanggal / Bulan Acuan</label>
                <input 
                  type={exportPeriode === 'bulanan' ? 'month' : 'date'}
                  value={exportPeriode === 'bulanan' ? exportDate.substring(0, 7) : exportDate}
                  onChange={e => {
                    if (exportPeriode === 'bulanan') {
                      setExportDate(`${e.target.value}-01`);
                    } else {
                      setExportDate(e.target.value);
                    }
                  }}
                  className="w-full bg-[#0f1115] border border-[#1e2330] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
                <p className="text-xs text-slate-500 mt-2">
                  {exportPeriode === 'mingguan' && "Laporan mingguan akan menarik data 1 minggu penuh yang mencakup tanggal yang dipilih di atas (Mulai hari Senin)."}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-lg font-bold transition-colors"
                >
                  <FileText size={18} />
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white py-2.5 rounded-lg font-bold transition-colors"
                >
                  <FileSpreadsheet size={18} />
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
