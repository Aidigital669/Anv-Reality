export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'investor' | 'nri' | 'sales_executive' | 'admin';
  password?: string;
  title?: string;
  territory?: string;
  initials?: string;
  preferredCity?: string;
  budget?: string;
  savedPropertyIds?: string[];
}

export const DEMO_SALES_EXECUTIVES: UserProfile[] = [
  {
    id: 'exec-rohit-sharma',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@anvrealty.com',
    password: 'sales123',
    phone: '+91 98200 45678',
    role: 'sales_executive',
    title: 'Senior Sales Executive',
    territory: 'Pune West (Baner / Balewadi / Mahalunge)',
    initials: 'RS',
    preferredCity: 'Baner / Balewadi',
    budget: '₹2.5 - 15 Cr Portfolio'
  },
  {
    id: 'exec-priya-patil',
    name: 'Priya Patil',
    email: 'priya.patil@anvrealty.com',
    password: 'sales123',
    phone: '+91 98220 54321',
    role: 'sales_executive',
    title: 'Luxury Sales Executive',
    territory: 'Pune East (Koregaon Park / Kalyani Nagar)',
    initials: 'PP',
    preferredCity: 'Koregaon Park / Kalyani Nagar',
    budget: '₹3 - 25 Cr Portfolio'
  }
];

export const DEMO_BUYERS: UserProfile[] = [
  {
    id: 'usr-prem-sharma',
    name: 'Prem Sharma',
    email: 'prem@aidigital.com',
    password: 'buyer123',
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
    password: 'buyer123',
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
    password: 'buyer123',
    phone: '+91 94220 77134',
    role: 'buyer',
    preferredCity: 'Mahalunge / Baner',
    budget: '₹1.5 - 2.5 Cr',
    savedPropertyIds: ['4', '5']
  }
];

export const ALL_DEMO_USERS: UserProfile[] = [
  ...DEMO_SALES_EXECUTIVES,
  ...DEMO_BUYERS
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
