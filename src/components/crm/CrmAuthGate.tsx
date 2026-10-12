'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  Briefcase,
  MapPin,
  Sparkles
} from 'lucide-react';
import { VALID_CRM_PASSWORDS, CRM_SALES_EXECUTIVES, CrmSalesExecutive } from '@/lib/crm-data';

interface CrmAuthGateProps {
  onAuthenticated?: () => void;
  initialMode?: 'login' | 'signup';
}

export function CrmAuthGate({ onAuthenticated, initialMode = 'login' }: CrmAuthGateProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupRole, setSignupRole] = useState('Senior Sales Executive');
  const [signupTerritory, setSignupTerritory] = useState('Pune West (Baner • Balewadi • Mahalunge)');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick 1-click credential presets for demo testing
  const handleSelectPreset = (name: 'muskan' | 'jennifer') => {
    setError(null);
    setSelectedPreset(name);
    if (name === 'muskan') {
      setLoginEmail('muskan@anvrealty.com');
      setLoginPassword('sales123');
    } else if (name === 'jennifer') {
      setLoginEmail('jennifer@anvrealty.com');
      setLoginPassword('sales123');
    }
  };

  // Helper to load dynamic registered executives from localStorage
  const getStoredExecutives = (): CrmSalesExecutive[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('anv_crm_registered_executives');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    setTimeout(() => {
      const cleanEmail = loginEmail.trim().toLowerCase();
      const cleanPass = loginPassword.trim();

      if (!cleanEmail || !cleanPass) {
        setLoading(false);
        setError('Please enter both work email and password.');
        return;
      }

      const registered = getStoredExecutives();
      const allExecutives = [...CRM_SALES_EXECUTIVES, ...registered];

      // Check against registered Sales Executives
      const matchedExec = allExecutives.find((exec) => {
        const execEmail = (exec.email || '').toLowerCase().trim();
        return (
          execEmail === cleanEmail ||
          cleanEmail === 'jennifer' && exec.email === 'jennifer@anvrealty.com' ||
          cleanEmail === 'muskan' && exec.email === 'muskan@anvrealty.com' ||
          (exec.id === 'exec-jennifer' && (cleanEmail === 'jennifer@anvrealty.com' || cleanEmail === 'jennifer.desai@anvrealty.com' || cleanEmail === 'rohit.sharma@anvrealty.com')) ||
          (exec.id === 'exec-muskan' && (cleanEmail === 'muskan@anvrealty.com' || cleanEmail === 'muskan.kapoor@anvrealty.com' || cleanEmail === 'priya.patil@anvrealty.com'))
        );
      });

      const isMatchingPass =
        (matchedExec && matchedExec.password === cleanPass) ||
        cleanPass === 'sales123' ||
        cleanPass === 'crm123' ||
        VALID_CRM_PASSWORDS.includes(cleanPass.toLowerCase());

      if (matchedExec && isMatchingPass) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('anv_crm_auth', 'true');
          localStorage.setItem('anv_crm_user', matchedExec.name);
          localStorage.setItem('anv_crm_email', matchedExec.email);
          localStorage.setItem('anv_crm_initials', matchedExec.initials || matchedExec.name.slice(0, 1).toUpperCase());
          localStorage.setItem('anv_crm_title', matchedExec.title || 'Sales Executive');
          localStorage.setItem('anv_crm_role', matchedExec.role || 'Sales Executive');
          if (matchedExec.territory) {
            localStorage.setItem('anv_crm_territory', matchedExec.territory);
          }
        }
        setLoading(false);
        setSuccessMessage(`Welcome back, ${matchedExec.name}! Opening CRM workspace...`);
        setTimeout(() => {
          if (onAuthenticated) {
            onAuthenticated();
          } else {
            router.push('/crm');
          }
        }, 500);
        return;
      }

      // Allow Super Admin login into CRM
      if (
        (cleanEmail === 'admin@anvrealty.com' || cleanEmail === 'rajesh.sharma@anvrealty.com' || cleanEmail === 'admin') &&
        (cleanPass === 'admin123' || cleanPass === 'anvrealty2026' || cleanPass === 'sales123' || cleanPass === 'admin')
      ) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('anv_crm_auth', 'true');
          localStorage.setItem('anv_crm_user', 'Rajesh Sharma');
          localStorage.setItem('anv_crm_email', cleanEmail === 'admin' ? 'admin@anvrealty.com' : cleanEmail);
          localStorage.setItem('anv_crm_initials', 'RS');
          localStorage.setItem('anv_crm_title', 'Managing Director');
          localStorage.setItem('anv_crm_role', 'Super Admin');
        }
        setLoading(false);
        setSuccessMessage('Admin credentials verified. Opening CRM workspace...');
        setTimeout(() => {
          if (onAuthenticated) {
            onAuthenticated();
          } else {
            router.push('/crm');
          }
        }, 500);
        return;
      }

      setLoading(false);
      setError('Invalid email or password. Use muskan@anvrealty.com or jennifer@anvrealty.com (password: sales123).');
    }, 350);
  };

  // Handle Signup submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const cleanName = signupName.trim();
    const cleanEmail = signupEmail.trim().toLowerCase();
    const cleanPhone = signupPhone.trim();
    const cleanPass = signupPassword.trim();
    const cleanConfirm = signupConfirmPassword.trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      setLoading(false);
      setError('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    if (cleanPass.length < 6) {
      setLoading(false);
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setLoading(false);
      setError('Passwords do not match. Please verify.');
      return;
    }

    // Check if already registered
    const existingRegistered = getStoredExecutives();
    const isEmailTaken = [...CRM_SALES_EXECUTIVES, ...existingRegistered].some(
      (u) => (u.email || '').toLowerCase() === cleanEmail
    );

    if (isEmailTaken) {
      setLoading(false);
      setError(`An account with email "${cleanEmail}" already exists. Please switch to Sign In.`);
      return;
    }

    const initials =
      cleanName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'SE';

    const newExecutive: CrmSalesExecutive = {
      id: `exec-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      phone: cleanPhone || '+91 98200 00000',
      role: 'Sales Executive',
      title: signupRole,
      territory: signupTerritory,
      initials,
      avatarBg: 'bg-zinc-950 text-white',
      activeLeadsCount: 0,
      status: 'Active'
    };

    // Save to local storage registry
    if (typeof window !== 'undefined') {
      const updatedList = [...existingRegistered, newExecutive];
      localStorage.setItem('anv_crm_registered_executives', JSON.stringify(updatedList));

      // Also set as active authenticated session
      localStorage.setItem('anv_crm_auth', 'true');
      localStorage.setItem('anv_crm_user', newExecutive.name);
      localStorage.setItem('anv_crm_email', newExecutive.email);
      localStorage.setItem('anv_crm_initials', newExecutive.initials);
      localStorage.setItem('anv_crm_title', newExecutive.title);
      localStorage.setItem('anv_crm_role', 'Sales Executive');
      localStorage.setItem('anv_crm_territory', newExecutive.territory);
    }

    // Sync to database backend if available
    try {
      await fetch('/api/crm/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newExecutive.name,
          email: newExecutive.email,
          phone: newExecutive.phone,
          role: newExecutive.title,
          territory: newExecutive.territory
        })
      });
    } catch (err) {
      console.warn('Backend employee registration sync notice:', err);
    }

    setLoading(false);
    setSuccessMessage(`Account created successfully for ${newExecutive.name}! Entering CRM portal...`);

    setTimeout(() => {
      if (onAuthenticated) {
        onAuthenticated();
      } else {
        router.push('/crm');
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/40 flex items-center justify-center p-4 sm:p-6 relative antialiased select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Top Brand Header */}
        <div className="text-center mb-5">
          <Link href="/" className="inline-flex items-center justify-center mb-2.5 group">
            <div className="w-14 h-14 rounded-2xl bg-zinc-950 p-2 border border-zinc-800 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
              <Image
                src="/LogoAnv-original.png"
                alt="ANV REEALTY"
                width={50}
                height={50}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-white tracking-tight">Anv Reealty</h1>
            <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold tracking-wider">
              CRM PORTAL
            </span>
          </div>
          <p className="text-xs text-amber-200/80 font-medium">
            Enterprise Real Estate Sales Operating System
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>MahaRERA: A52100034988 Verified Corridor</span>
          </div>
        </div>

        {/* Card Box */}
        <div className="bg-white/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.6)]">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-zinc-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Sales Executive Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Create Account (Sign Up)
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="flex-1 font-semibold">{successMessage}</div>
            </div>
          )}

          {/* ==================== 1. SIGN IN FORM ==================== */}
          {mode === 'login' && (
            <div>
              {/* One-Click Presets for Muskan and Jennifer */}
              <div className="mb-5 p-3.5 bg-gradient-to-r from-amber-50/70 to-zinc-50 border border-amber-200/60 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-950 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Quick 1-Click Executive Fill</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-medium">Password: sales123</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('muskan')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPreset === 'muskan'
                        ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white/80 border-zinc-200 hover:border-amber-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-900 text-amber-100 flex items-center justify-center font-bold text-[10px]">
                        M
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-900 leading-tight">Muskan</div>
                        <div className="text-[10px] text-zinc-500 truncate">muskan@anvrealty.com</div>
                      </div>
                    </div>
                    <div className="mt-1 text-[9px] text-amber-800 font-semibold">
                      Luxury Sales Executive
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset('jennifer')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPreset === 'jennifer'
                        ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white/80 border-zinc-200 hover:border-amber-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-[10px]">
                        J
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-900 leading-tight">Jennifer</div>
                        <div className="text-[10px] text-zinc-500 truncate">jennifer@anvrealty.com</div>
                      </div>
                    </div>
                    <div className="mt-1 text-[9px] text-amber-800 font-semibold">
                      Senior Sales Executive
                    </div>
                  </button>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Official Work Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="e.g. muskan@anvrealty.com or jennifer@anvrealty.com"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        setSelectedPreset(null);
                      }}
                      className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition"
                    />
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-[11px] text-zinc-400">Default: sales123</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition"
                    />
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-zinc-600">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>Remember this session</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginPassword('sales123');
                      setSuccessMessage('Demo password autofilled: "sales123"');
                    }}
                    className="text-amber-800 hover:text-amber-900 font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 hover:from-amber-600 hover:to-amber-500 hover:text-zinc-950 text-white text-xs font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Sales CRM'}</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:text-zinc-950 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* Footnote for Switch to Sign Up */}
              <div className="mt-5 pt-4 text-center border-t border-zinc-100 space-y-2">
                <p className="text-xs text-zinc-500">
                  New sales executive joining Anv Reealty?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                  >
                    Sign Up here
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ==================== 2. SIGN UP FORM ==================== */}
          {mode === 'signup' && (
            <div>
              <div className="mb-4 pb-3 border-b border-zinc-100">
                <h3 className="text-sm font-bold text-zinc-900">New Sales Executive Registration</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Set up your official sales advisor account to manage leads, calls, and site visits
                </p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muskan or Jennifer or Aarav Sharma"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition"
                    />
                    <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Email and Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                      Work Email *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="name@anvrealty.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition"
                      />
                      <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="+91 98220 12345"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition"
                      />
                      <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Role and Territory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                      Designation
                    </label>
                    <div className="relative">
                      <select
                        value={signupRole}
                        onChange={(e) => setSignupRole(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition appearance-none cursor-pointer"
                      >
                        <option value="Senior Sales Executive">Senior Sales Executive</option>
                        <option value="Luxury Sales Executive">Luxury Sales Executive</option>
                        <option value="Commercial Sales Executive">Commercial Sales Executive</option>
                        <option value="Sales Executive">Sales Executive</option>
                        <option value="Wealth Real Estate Advisor">Wealth Real Estate Advisor</option>
                      </select>
                      <Briefcase className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                      Territory / Micro-Market
                    </label>
                    <div className="relative">
                      <select
                        value={signupTerritory}
                        onChange={(e) => setSignupTerritory(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition appearance-none cursor-pointer"
                      >
                        <option value="Pune West (Baner • Balewadi • Mahalunge)">Pune West (Baner / Balewadi)</option>
                        <option value="Pune East (Koregaon Park • Kalyani Nagar)">Pune East (Koregaon Park)</option>
                        <option value="Pune Central (Shivajinagar • Model Colony)">Pune Central (Shivajinagar)</option>
                        <option value="Mumbai Luxury Corridor (Bandra • Worli)">Mumbai Luxury Corridor</option>
                        <option value="All Micro-Markets">All Micro-Markets</option>
                      </select>
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Password and Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        placeholder="Min 6 characters"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition"
                      />
                      <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
                        tabIndex={-1}
                      >
                        {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition"
                      />
                      <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 text-[11px] text-zinc-500 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      defaultChecked
                      className="mt-0.5 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>
                      I agree to MahaRERA compliance protocols and ANV REEALTY confidentiality guidelines.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-zinc-950 hover:to-zinc-900 text-zinc-950 hover:text-white text-xs font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? 'Creating Executive Workspace...' : 'Complete Executive Registration'}</span>
                  <ArrowRight className="w-4 h-4 text-zinc-950 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* Footnote for Switch to Sign In */}
              <div className="mt-5 pt-4 text-center border-t border-zinc-100">
                <p className="text-xs text-zinc-500">
                  Already have an executive account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                  >
                    Sign In here
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Admin CMS Footnote */}
          <div className="mt-4 pt-3 text-center border-t border-zinc-100">
            <p className="text-[11px] text-zinc-400">
              Need Master Admin CMS?{' '}
              <Link href="/admin/login" className="text-zinc-600 hover:text-zinc-900 font-semibold underline">
                Switch to Admin CMS
              </Link>
            </p>
          </div>
        </div>

        {/* Return to Public Website */}
        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-200 transition">
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
