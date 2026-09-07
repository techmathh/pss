const API_URL = "https://script.google.com/macros/s/AKfycbxwzwIhm5NrvF4P3pWsSkGEIpmUWBplMRWXNnqKqEWiAEfBm8-NWuS0cPScCAO_gCYI/exec";

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
  try {
    const json = await fetchWithRetry(`${API_URL}?action=list_all_absensi`);
    
    if (json && json.success && json.data) {
      // Pastikan kita HANYA mengembalikan data yang tanggalnya benar-benar cocok
      return json.data.filter((row: any) => {
        if (!row.tanggal) return false;
        
        // Terkadang Google Sheets mereturn tanggal dengan jam (ISO string)
        const rowDate = typeof row.tanggal === 'string' ? row.tanggal.split('T')[0] : String(row.tanggal);
        
        return rowDate === tanggal;
      });
    }
  } catch (error) {
    console.error("Error fetching absensi:", error);
  }
  return [];
}

export async function fetchAllAbsensiData() {
  try {
    const json = await fetchWithRetry(`${API_URL}?action=list_all_absensi`);
    if (json && json.success && json.data) {
      return json.data;
    }
  } catch (error) {
    console.error("Error fetching all absensi:", error);
  }
  return [];
}

export async function fetchAnggotaData() {
  try {
    const json = await fetchWithRetry(`${API_URL}?action=list_anggota`);
    if (json && json.success) {
      return json.data;
    }
  } catch (error) {
    console.error("Error fetching anggota:", error);
  }
  return [];
}

export async function apiPost(payload: any) {
  return await fetchWithRetry(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  }, 2, 500); // 2 retries, 500ms delay for POST
}
