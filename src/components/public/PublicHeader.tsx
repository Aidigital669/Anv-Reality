'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  Scale,
  User,
  ShieldCheck,
  LogOut,
  Calendar,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { usePropertyComparison } from '@/context/PropertyComparisonContext';
import { useSavedProperties } from '@/context/SavedPropertiesContext';
import {
  UserProfile,
  getClientSession,
  clearClientSession
} from '@/lib/user-auth';
import { AuthInquiryModal } from '@/components/auth/AuthInquiryModal';
import { InstantEnquiryModal } from '@/components/public/InstantEnquiryModal';

export function PublicHeader() {
  const { compareList } = usePropertyComparison();
  const { savedCount } = useSavedProperties();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const checkSession = () => {
    setCurrentUser(getClientSession());
  };

  useEffect(() => {
    checkSession();
    window.addEventListener('anv_auth_change', checkSession);
    return () => window.removeEventListener('anv_auth_change', checkSession);
  }, []);

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSignOut = () => {
    clearClientSession();
    setCurrentUser(null);
    setUserDropdownOpen(false);
    showToast('Signed out successfully.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  return (
    <>
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-950 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl border border-zinc-800 animate-in fade-in">
          {toastMessage}
        </div>
      )}

      <header className="absolute top-0 w-full z-50 px-4 sm:px-8 py-4 flex items-center justify-between text-white border-b border-white/10 backdrop-blur-xs">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-amber-500 text-black font-bold p-1 rounded text-sm shadow-xs">
            AR
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight">
            ANV REEALITY
          </span>
        </Link>



        {/* Right User & Consultation Controls */}
        <div className="flex items-center gap-3 sm:gap-6 text-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Compare Link with counter */}
            <Link
              href="/compare"
              className="text-zinc-200 hover:text-amber-400 transition p-1 relative flex items-center"
              title="Compare Properties"
            >
              <Scale className="w-5 h-5" />
              {compareList.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {compareList.length}
                </span>
              )}
            </Link>

            {/* Saved Favorites / Shortlist Page Link */}
            <Link
              href="/saved"
              title="View Saved Shortlist"
              className="text-zinc-200 hover:text-amber-400 transition p-1 relative flex items-center"
            >
              <Heart className={`w-5 h-5 ${savedCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {savedCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {savedCount}
                </span>
              )}
            </Link>

            {/* User Login / Profile Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full py-1 pl-1.5 pr-3 text-xs font-semibold transition"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-black font-bold text-[10px] flex items-center justify-center">
                    {currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 text-xs text-zinc-300 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                      <p className="font-bold text-white text-sm">{currentUser.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Verified Patron &bull; {currentUser.preferredCity || 'Pune'}
                      </span>
                    </div>

                    <Link
                      href="/saved"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-800 text-zinc-200 hover:text-white transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30" />
                        <span>My Saved Shortlist</span>
                      </div>
                      {savedCount > 0 && (
                        <span className="bg-amber-400 text-black font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                          {savedCount}
                        </span>
                      )}
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setConsultationModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-800 text-zinc-200 hover:text-white transition cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>Book Consultation</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        showToast(`Displaying inquiries submitted for ${currentUser.name}`);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-800 text-zinc-200 hover:text-white transition"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>My Active Enquiries</span>
                    </button>

                    <div className="border-t border-zinc-800 my-1" />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-950/40 text-rose-400 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="hover:text-amber-400 font-medium transition cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </button>
              </div>
            )}
          </div>

          {/* Schedule Consultation Button */}
          <button
            onClick={() => setConsultationModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition text-xs font-bold shadow-md hover:shadow-amber-500/20 shrink-0 cursor-pointer"
          >
            Schedule Consultation
          </button>
        </div>
      </header>

      {/* Global Consultation / Enquiry Modal */}
      <InstantEnquiryModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Global Auth Modal */}
      <AuthInquiryModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={(msg) => showToast(msg)}
      />
    </>
  );
}
