'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  UserProfile,
  DEMO_BUYERS,
  DEMO_SALES_EXECUTIVES,
  ALL_DEMO_USERS,
  getClientSession,
  setClientSession
} from '@/lib/user-auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>(
    tabParam === 'register' ? 'register' : 'signin'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cityInterest, setCityInterest] = useState('Pune');
  const [budget, setBudget] = useState('₹1.5 - 2.5 Cr');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = getClientSession();
    if (existing) {
      // User is already logged in
    }
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      // Check if logging in as Sales Executive
      const foundExecutive = DEMO_SALES_EXECUTIVES.find(
        (exec) => exec.email.toLowerCase() === cleanEmail
      );

      if (foundExecutive) {
        if (cleanPass && cleanPass !== 'sales123' && cleanPass !== 'crm123' && cleanPass !== 'admin123') {
          setLoading(false);
          setError('Invalid password for Sales Executive. Please enter "sales123".');
          return;
        }

        setClientSession(foundExecutive);
        if (typeof window !== 'undefined') {
          localStorage.setItem('anv_crm_auth', 'true');
          localStorage.setItem('anv_crm_user', foundExecutive.name);
          localStorage.setItem('anv_crm_email', foundExecutive.email);
          localStorage.setItem('anv_crm_initials', foundExecutive.initials || 'SE');
          localStorage.setItem('anv_crm_title', foundExecutive.title || 'Sales Executive');
          localStorage.setItem('anv_crm_role', 'Sales Executive');
        }
        setLoading(false);
        router.push(redirectUrl !== '/' ? redirectUrl : '/crm');
        return;
      }

      const foundBuyer = DEMO_BUYERS.find(
        (b) => b.email.toLowerCase() === cleanEmail
      );

      const user: UserProfile = foundBuyer || {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0].replace(/[._]/g, ' ') || 'Luxury Patron',
        email: email.trim(),
        phone: phone.trim() || '+91 98200 12345',
        role: 'buyer',
        preferredCity: 'Pune',
        budget: '₹2 - 4 Cr'
      };

      setClientSession(user);
      setLoading(false);
      router.push(redirectUrl);
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const user: UserProfile = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: 'buyer',
        preferredCity: cityInterest,
        budget: budget
      };

      try {
        fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            budget: budget,
            source: 'Portal Registration',
            message: `New account registered. Preferred city: ${cityInterest}. Target budget: ${budget}.`
          })
        }).catch(() => {});
      } catch (e) {}

      setClientSession(user);
      setLoading(false);
      router.push(redirectUrl);
    }, 450);
  };

  const handleDemoSignIn = (buyer: UserProfile) => {
    setClientSession(buyer);
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col justify-center items-center p-4 relative antialiased">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-zinc-900/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-3 group">
            <div className="bg-zinc-950 p-2 rounded-2xl border border-zinc-800 shadow-md group-hover:scale-105 transition-transform">
              <Image
                src="/LogoAnv-original.png"
                alt="ANV REEALTY"
                width={150}
                height={48}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
          </Link>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
            {activeTab === 'signin' ? 'Sign In to Your Patron Portal' : 'Create Your Luxury Account'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Access verified luxury properties, price trends, and private portfolios
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* Tabs */}
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl mb-5 text-xs">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'signin'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'register'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Email Address or Mobile
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 focus:bg-white transition"
                  />
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-zinc-700">
                    Password
                  </label>
                  <a href="#" className="text-[11px] text-amber-800 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 focus:bg-white transition"
                  />
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Signing in...' : 'Sign In to Portal'}
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>

              {/* Demo Logins for Sales Executives */}
              <div className="pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Demo Sales Executives:
                  </span>
                  <span className="text-[10px] text-amber-700 font-mono bg-amber-50 px-1.5 py-0.5 rounded">
                    Pass: sales123
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_SALES_EXECUTIVES.map((exec) => (
                    <button
                      key={exec.id}
                      type="button"
                      onClick={() => {
                        setEmail(exec.email);
                        setPassword('sales123');
                      }}
                      className="p-2 rounded-xl border border-zinc-200 bg-zinc-50/70 hover:bg-amber-50 hover:border-amber-300 text-left transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {exec.initials || 'SE'}
                        </span>
                        <span className="text-xs font-bold text-zinc-800 group-hover:text-amber-900 truncate">
                          {exec.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5 font-mono">
                        {exec.email}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
                  />
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Phone</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="+91 98200 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 font-mono"
                    />
                    <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Preferred City</label>
                  <select
                    value={cityInterest}
                    onChange={(e) => setCityInterest(e.target.value)}
                    className="w-full px-2.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="NRI Advisory">NRI Advisory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Budget</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-2.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900"
                  >
                    <option value="₹1.5 - 2.5 Cr">₹1.5 - 2.5 Cr</option>
                    <option value="₹2.5 - 5 Cr">₹2.5 - 5 Cr</option>
                    <option value="₹5+ Cr Ultra-Luxury">₹5+ Cr Ultra-Luxury</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </button>
            </form>
          )}

          {/* Admin link footnote */}
          <div className="border-t border-zinc-100 mt-5 pt-4 text-center">
            <span className="text-[11px] text-zinc-400">
              Staff or CMS Admin?{' '}
              <Link href="/admin/login" className="text-amber-800 font-semibold hover:underline">
                Admin Panel Login →
              </Link>
            </span>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-800 transition">
            ← Return to Anv Reeality Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafb] flex items-center justify-center text-xs text-zinc-500">Loading portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
