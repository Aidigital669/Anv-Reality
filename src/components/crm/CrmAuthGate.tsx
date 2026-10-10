'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  ShieldCheck,
  ArrowRight,
  User,
  Building2,
  KeyRound,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { VALID_CRM_PASSWORDS, CRM_SALES_EXECUTIVES, CrmSalesExecutive } from '@/lib/crm-data';

interface CrmAuthGateProps {
  onAuthenticated: () => void;
}

export function CrmAuthGate({ onAuthenticated }: CrmAuthGateProps) {
  const [selectedExecutive, setSelectedExecutive] = useState<CrmSalesExecutive>(CRM_SALES_EXECUTIVES[0]);
  const [email, setEmail] = useState(CRM_SALES_EXECUTIVES[0].email);
  const [password, setPassword] = useState(CRM_SALES_EXECUTIVES[0].password);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSelectExecutive = (exec: CrmSalesExecutive) => {
    setSelectedExecutive(exec);
    setEmail(exec.email);
    setPassword(exec.password);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      // Check if matches either registered Sales Executive
      const matchedExec = CRM_SALES_EXECUTIVES.find(
        (exec) =>
          exec.email.toLowerCase() === cleanEmail ||
          cleanEmail.includes(exec.initials.toLowerCase()) ||
          cleanEmail.includes(exec.name.toLowerCase().split(' ')[0])
      );

      const isValidPassword =
        VALID_CRM_PASSWORDS.includes(cleanPass.toLowerCase()) ||
        (matchedExec && matchedExec.password === cleanPass);

      if (matchedExec && isValidPassword) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('anv_crm_auth', 'true');
          localStorage.setItem('anv_crm_user', matchedExec.name);
          localStorage.setItem('anv_crm_email', matchedExec.email);
          localStorage.setItem('anv_crm_initials', matchedExec.initials);
          localStorage.setItem('anv_crm_title', matchedExec.title);
          localStorage.setItem('anv_crm_role', matchedExec.role);
        }
        setLoading(false);
        onAuthenticated();
      } else if (VALID_CRM_PASSWORDS.includes(cleanPass.toLowerCase())) {
        // Fallback generic CRM password
        const activeUser = matchedExec || selectedExecutive;
        if (typeof window !== 'undefined') {
          localStorage.setItem('anv_crm_auth', 'true');
          localStorage.setItem('anv_crm_user', activeUser.name);
          localStorage.setItem('anv_crm_email', activeUser.email);
          localStorage.setItem('anv_crm_initials', activeUser.initials);
          localStorage.setItem('anv_crm_title', activeUser.title);
          localStorage.setItem('anv_crm_role', activeUser.role);
        }
        setLoading(false);
        onAuthenticated();
      } else {
        setLoading(false);
        setError('Invalid credentials. Use rohit.sharma@anvrealty.com or priya.patil@anvrealty.com with password "sales123".');
      }
    }, 350);
  };

  const handleQuickUnlockExecutive = (exec: CrmSalesExecutive) => {
    handleSelectExecutive(exec);
    setLoading(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('anv_crm_auth', 'true');
        localStorage.setItem('anv_crm_user', exec.name);
        localStorage.setItem('anv_crm_email', exec.email);
        localStorage.setItem('anv_crm_initials', exec.initials);
        localStorage.setItem('anv_crm_title', exec.title);
        localStorage.setItem('anv_crm_role', exec.role);
      }
      setLoading(false);
      onAuthenticated();
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/40 flex items-center justify-center p-4 relative antialiased">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Top Brand Marker */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center mb-3 group">
            <div className="w-16 h-16 rounded-2xl bg-zinc-950 p-2 border border-zinc-800 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
              <Image
                src="/LogoAnv-original.png"
                alt="ANV REEALTY"
                width={56}
                height={56}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-white tracking-tight">Anv Reeality</h1>
            <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold tracking-wider">
              CRM PORTAL
            </span>
          </div>
          <p className="text-xs text-amber-200/80 font-medium">
            Enterprise Real Estate Sales Operating System
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>MahaRERA: A52100034988 Verified Corridor</span>
          </div>
        </div>

        {/* Card Box */}
        <div className="bg-white/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.6)]">
          <div className="text-center mb-4 pb-3 border-b border-zinc-100">
            <h2 className="text-base font-bold text-zinc-900">Sales Executive Portal Unlock</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Select your sales advisor profile or enter email & password to sign in
            </p>
          </div>

          {/* Quick Select Sales Executive Cards */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Choose Sales Executive Account
              </label>
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Password: sales123
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {CRM_SALES_EXECUTIVES.map((exec) => {
                const isSelected = selectedExecutive.id === exec.id;
                return (
                  <button
                    key={exec.id}
                    type="button"
                    onClick={() => handleSelectExecutive(exec)}
                    className={`p-3 rounded-2xl border text-left transition relative cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-500/20'
                        : 'border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${exec.avatarBg || 'bg-zinc-950 text-white'}`}>
                        {exec.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-zinc-900 truncate">{exec.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{exec.title}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-600 truncate font-mono bg-white/70 px-1.5 py-0.5 rounded border border-zinc-200/50">
                      {exec.email}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {exec.status}
                      </span>
                      <span className="text-amber-800 font-semibold">
                        {exec.activeLeadsCount} Leads
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Sales Executive Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="executive@anvrealty.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition"
                />
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-amber-700 font-medium">
                  Default: <code className="bg-amber-50 px-1 py-0.5 rounded text-amber-900 font-mono">sales123</code>
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter executive password (e.g. sales123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition"
                />
                <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Quick 1-Click Fast Unlock */}
            <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
              <span>Quick Unlock As:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickUnlockExecutive(CRM_SALES_EXECUTIVES[0])}
                  className="text-amber-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Rohit</span>
                </button>
                <span className="text-zinc-300">•</span>
                <button
                  type="button"
                  onClick={() => handleQuickUnlockExecutive(CRM_SALES_EXECUTIVES[1])}
                  className="text-amber-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Priya</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 hover:from-amber-600 hover:to-amber-500 hover:text-zinc-950 text-white text-xs font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Authenticating Executive...' : `Sign In as ${selectedExecutive.name}`}</span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:text-zinc-950 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-4 pt-3.5 text-center border-t border-zinc-100">
            <p className="text-[11px] text-zinc-400">
              Need Super Admin CMS instead?{' '}
              <Link href="/admin/login" className="text-zinc-600 hover:text-zinc-900 font-semibold underline">
                Switch to Admin CMS
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-200 transition">
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
