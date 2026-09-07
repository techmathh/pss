import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface SiteSettings {
  name: string;
  motto: string;
  aboutText: string;
  vision: string;
  mission: string;
  logoUrl: string;
  email: string;
  whatsapp: string;
  instagram: string;
  establishedYear: string;
  registrationOpen: boolean;
  registrationOpenDate: string;
  scheduleDays: string;
  scheduleTime: string;
  scheduleLocation: string;
  [key: string]: any;
}

export const defaultSettings: SiteSettings = {
  name: '',
  motto: '',
  aboutText: '',
  vision: '',
  mission: '',
  logoUrl: '',
  email: '',
  whatsapp: '',
  instagram: '',
  establishedYear: '',
  registrationOpen: true,
  registrationOpenDate: '',
  scheduleDays: '',
  scheduleTime: '',
  scheduleLocation: ''
};

export function useSettings() {
  const { data: settings = defaultSettings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const docSnap = await getDoc(doc(db, 'settings', 'general'));
      if (docSnap.exists()) {
        return { ...defaultSettings, ...docSnap.data() } as SiteSettings;
      }
      return defaultSettings;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return { settings, loading: isLoading };
}
