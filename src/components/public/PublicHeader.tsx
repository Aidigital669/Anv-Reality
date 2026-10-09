'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Heart,
  Scale,
  User,
  ShieldCheck,
  LogOut,
  Calendar,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Building2,
  BookOpen,
  Phone
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
  const router = useRouter();
  const pathname = usePathname();
  const { compareList } = usePropertyComparison();
  const { savedCount } = useSavedProperties();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleOpenAuth = (
    mode: 'login' | 'signup' = 'login',
    notice?: string,
    redirect?: string
  ) => {
    setAuthModalMode(mode);
    setAuthNotice(notice || null);
    setPendingRedirect(redirect || null);
    setAuthModalOpen(true);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    if (!currentUser) {
      e.preventDefault();
      handleOpenAuth(
        'login',
        'Login or Sign Up is compulsory to access Property Comparison.',
        '/compare'
      );
    }
  };

  const handleSavedClick = (e: React.MouseEvent) => {
    if (!currentUser) {
      e.preventDefault();
      handleOpenAuth(
        'login',
        'Login or Sign Up is compulsory to access your Saved Shortlist.',
        '/saved'
      );
    }
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

  const isNavActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-950 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl border border-zinc-800 animate-in fade-in">
          {toastMessage}
        </div>
      )}

      <header className="absolute top-0 w-full z-50 px-3.5 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between text-white border-b border-white/10 backdrop-blur-md bg-zinc-950/60">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <Image
            src="/LogoAnv.png"
            alt="ANV REEALTY"
            width={160}
            height={60}
            className="h-8 sm:h-11 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-200"
            priority
          />
        </Link>


        {/* Right User & Consultation Controls */}
        <div className="flex items-center gap-2 sm:gap-4 text-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Compare Link with counter */}
            <Link
              href="/compare"
              onClick={handleCompareClick}
              className="text-zinc-200 hover:text-amber-400 transition p-1.5 relative flex items-center cursor-pointer"
              title="Compare Properties (Login/Signup Required)"
            >
              <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
              {compareList.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {compareList.length}
                </span>
              )}
            </Link>

            {/* Saved Favorites / Shortlist */}
            <Link
              href="/saved"
              onClick={handleSavedClick}
              title="View Saved Shortlist (Login/Signup Required)"
              className="text-zinc-200 hover:text-amber-400 transition p-1.5 relative flex items-center cursor-pointer"
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${savedCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {savedCount}
                </span>
              )}
            </Link>

            {/* User Login / Profile Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full py-1 pl-1 pr-2 sm:pr-3 text-xs font-semibold transition"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-black font-bold text-[10px] flex items-center justify-center">
                    {currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">
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
                      href="/properties"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-800 text-zinc-200 hover:text-white transition cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>Browse Properties</span>
                    </Link>

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

                    <Link
                      href="/compare"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-800 text-zinc-200 hover:text-white transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-amber-400" />
                        <span>Property Comparison</span>
                      </div>
                      {compareList.length > 0 && (
                        <span className="bg-amber-400 text-black font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                          {compareList.length}
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
              <button
                onClick={() => handleOpenAuth('login')}
                className="hover:text-amber-400 font-medium transition cursor-pointer flex items-center gap-1 text-xs sm:text-sm px-2 py-1"
              >
                <User className="w-4 h-4" />
                <span className="hidden xs:inline">Login</span>
              </button>
            )}
          </div>

          {/* Schedule Consultation Button */}
          <button
            onClick={() => setConsultationModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl transition text-xs font-extrabold shadow-md hover:shadow-amber-500/20 shrink-0 cursor-pointer"
          >
            <span className="hidden sm:inline">Schedule Consultation</span>
            <span className="sm:hidden">Consult</span>
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-zinc-950/95 backdrop-blur-xl lg:hidden pt-24 px-5 pb-8 flex flex-col justify-between overflow-y-auto animate-in fade-in slide-in-from-top-6 duration-200">
          <div className="space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Navigation Menu
            </div>


            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setConsultationModalOpen(true);
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black p-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Private Consultation</span>
              </button>

              <a
                href="tel:+919373020701"
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold p-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 border border-zinc-800"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call Helpline: +91 93730 20701</span>
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>&copy; {new Date().getFullYear()} Anv Reeality</span>
            <span className="text-amber-400 font-semibold">Pune Verified</span>
          </div>
        </div>
      )}

      {/* Global Consultation / Enquiry Modal */}
      <InstantEnquiryModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Global Auth Modal */}
      <AuthInquiryModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthNotice(null);
          setPendingRedirect(null);
        }}
        initialMode={authModalMode}
        featureNotice={authNotice || undefined}
        onSuccess={(msg) => showToast(msg)}
        onAuthenticated={() => {
          if (pendingRedirect) {
            const dest = pendingRedirect;
            setPendingRedirect(null);
            router.push(dest);
          }
        }}
      />
    </>
  );
}
