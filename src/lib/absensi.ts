const API_URL = "https://script.google.com/macros/s/AKfycbxwzwIhm5NrvF4P3pWsSkGEIpmUWBplMRWXNnqKqEWiAEfBm8-NWuS0cPScCAO_gCYI/exec";

// Cache in memory for instant navigation transitions
let memCache: any = { absensi: null, anggota: null };

// Helper function to fetch with retry logic
async function fetchWithRetry(url: string, options: any = {}, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export async function fetchAbsensiData(tanggal: string) {
  const allAbsensi = await fetchAllAbsensiData();
  return allAbsensi.filter((row: any) => {
    if (!row.tanggal) return false;
    const rowDate = typeof row.tanggal === 'string' ? row.tanggal.split('T')[0] : String(row.tanggal);
    return rowDate === tanggal;
  });
}

export async function fetchAllAbsensiData(forceRefresh = false) {
  if (!forceRefresh && memCache.absensi) return memCache.absensi;
  
  if (!forceRefresh) {
    const cached = sessionStorage.getItem('cache_absensi');
    if (cached) {
      memCache.absensi = JSON.parse(cached);
      return memCache.absensi;
    }
  }

  try {
    const json = await fetchWithRetry(`${API_URL}?action=list_all_absensi`);
    if (json && json.success && json.data) {
      memCache.absensi = json.data;
      sessionStorage.setItem('cache_absensi', JSON.stringify(json.data));
      return json.data;
    }
  } catch (error) {
    console.error("Error fetching all absensi:", error);
  }
  return [];
}

export async function fetchAnggotaData(forceRefresh = false) {
  if (!forceRefresh && memCache.anggota) return memCache.anggota;
  
  if (!forceRefresh) {
    const cached = localStorage.getItem('cache_anggota');
    if (cached) {
      memCache.anggota = JSON.parse(cached);
      return memCache.anggota;
    }
  }

  try {
    // Beri sedikit jeda jika tidak ada di cache untuk mencegah tabrakan (429) dengan fetch absensi
    await new Promise(r => setTimeout(r, 600));
    
    const json = await fetchWithRetry(`${API_URL}?action=list_anggota`);
    if (json && json.success) {
      memCache.anggota = json.data;
      localStorage.setItem('cache_anggota', JSON.stringify(json.data));
      return json.data;
    }
  } catch (error) {
    console.error("Error fetching anggota:", error);
  }
  return [];
}

export async function apiPost(payload: any) {
  const res = await fetchWithRetry(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  }, 2, 500); // 2 retries, 500ms delay for POST
  
  if (res && res.success) {
     // Auto invalidate cache upon mutations
     if (payload.action === 'add_absensi' || payload.action === 'update_absensi' || payload.action === 'delete_absensi') {
        memCache.absensi = null;
        sessionStorage.removeItem('cache_absensi');
     } else if (payload.action === 'add_anggota' || payload.action === 'delete_anggota') {
        memCache.anggota = null;
        localStorage.removeItem('cache_anggota');
     }
  }
  return res;
}
