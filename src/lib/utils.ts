export const DEV_EMAIL = import.meta.env.VITE_DEVELOPER_EMAIL || 'dapiddev@admin.com';

export function isDeveloperEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email === DEV_EMAIL || 
         email === `${DEV_EMAIL}@admin.com` || 
         email.startsWith(DEV_EMAIL);
}
