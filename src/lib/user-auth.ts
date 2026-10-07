export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'investor' | 'nri';
  preferredCity?: string;
  budget?: string;
  savedPropertyIds?: string[];
}

export const DEMO_BUYERS: UserProfile[] = [
  {
    id: 'usr-prem-sharma',
    name: 'Prem Sharma',
    email: 'prem@aidigital.com',
    phone: '+91 63757 87468',
    role: 'investor',
    preferredCity: 'Pune (Koregaon Park / Kalyani Nagar)',
    budget: '₹10 - 20 Cr',
    savedPropertyIds: ['13', '6']
  },
  {
    id: 'usr-vikram-singhania',
    name: 'Vikramaditya Singhania',
    email: 'vikram@singhania.in',
    phone: '+91 98900 11200',
    role: 'buyer',
    preferredCity: 'Baner / Balewadi High Street',
    budget: '₹2.5 - 5.0 Cr',
    savedPropertyIds: ['1', '2']
  },
  {
    id: 'usr-sneha-joshi',
    name: 'Dr. Sneha Joshi',
    email: 'sneha@kardioclinic.in',
    phone: '+91 94220 77134',
    role: 'buyer',
    preferredCity: 'Mahalunge / Baner',
    budget: '₹1.5 - 2.5 Cr',
    savedPropertyIds: ['4', '5']
  }
];

export const AUTH_STORAGE_KEY = 'anv_client_session';

export function getClientSession(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setClientSession(user: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('anv_auth_change'));
}

export function clearClientSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event('anv_auth_change'));
}
