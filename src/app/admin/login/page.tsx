'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validEmails = ['admin@anvrealty.com', 'rajesh.sharma@anvrealty.com', 'admin'];
    const validPasswords = ['admin123', 'admin', 'anvrealty2026'];

    setTimeout(() => {
      if (
        validEmails.includes(email.trim().toLowerCase()) &&
        validPasswords.includes(password.trim())
      ) {
        // Set admin session in localStorage and cookie
        localStorage.setItem('anv_admin_logged_in', 'true');
        document.cookie = 'anv_admin_auth=true; path=/; max-age=86400';
        router.push('/admin');
      } else {
        setLoading(false);
        setError('Invalid credentials. Please enter authorized admin email and password.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col justify-center items-center p-4 antialiased">
      {/* Container */}
      <div className="w-full max-w-md">
        {/* Brand Card Header */}
        <div className="text-center mb-6">
          {/* ANV Logo */}
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-bold text-base tracking-tighter mx-auto shadow-md mb-3">
            ANV
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="font-bold text-xl text-zinc-900 tracking-tight">
              Anv Reeality
            </h1>
            <div className="w-4 h-4 rounded-full bg-amber-700/80 text-white flex items-center justify-center text-[10px]">
              ✓
            </div>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Website Admin Panel & CMS Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@anvrealty.com"
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
                <span className="text-[11px] text-zinc-400">
                  Rajesh Sharma (Super Admin)
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 focus:bg-white transition"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Navigation Footnotes */}
        <div className="flex items-center justify-between mt-5 px-1 text-xs text-zinc-500">
          <Link
            href="/"
            className="hover:text-zinc-800 transition"
          >
            ← Public Website
          </Link>
          <Link
            href="/crm"
            className="text-amber-800 hover:text-amber-950 font-bold hover:underline"
          >
            Enterprise CRM Portal →
          </Link>
        </div>
      </div>
    </div>
  );
}
