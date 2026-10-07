'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  User,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

interface SellerLeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: string;
  initialBhk?: string;
  buyerRef?: string;
  buyerDemandSummary?: string;
  onSuccessToast?: (msg: string) => void;
}

export function SellerLeadCaptureModal({
  isOpen,
  onClose,
  initialLocation = '',
  initialBhk = '',
  buyerRef,
  buyerDemandSummary,
  onSuccessToast
}: SellerLeadCaptureModalProps) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState(initialLocation);
  const [bhk, setBhk] = useState(initialBhk);
  const [askingPrice, setAskingPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (initialLocation && initialLocation !== 'All') {
        setLocation(initialLocation);
      }
      if (initialBhk && initialBhk !== 'All') {
        setBhk(initialBhk);
      }
    }
  }, [isOpen, initialLocation, initialBhk]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!location.trim()) {
      setError('Please enter the location of your property.');
      return;
    }
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!number.trim() || number.trim().length < 10) {
      setError('Please provide a valid 10-digit contact number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/buyer-demands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: location.trim(),
          name: name.trim(),
          number: number.trim(),
          email: email.trim(),
          bhk: bhk ? bhk.trim() : undefined,
          askingPrice: askingPrice.trim() || undefined,
          buyerRef: buyerRef || undefined,
          notes: notes.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      onClose();
      // Show toaster as requested: "Thank you for enquiry"
      if (onSuccessToast) {
        onSuccessToast('Thank you for enquiry');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl my-auto bg-zinc-950 text-white rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(217,119,6,0.25)] border border-amber-500/30 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] transition-all animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-sm border border-white/10 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-amber-500/20 bg-gradient-to-b from-zinc-900 to-zinc-950 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{buyerRef ? `Match with Buyer ${buyerRef}` : 'Seller Property Registration Desk'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {buyerRef ? 'Connect With Verified Buyer' : 'Register Your Property to Find Buyers'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-lg">
            {buyerRef
              ? `Submit your unit details to match with buyer demand ${buyerRef}. Our senior desk at 93730 20701 will facilitate the closing.`
              : 'No matching buyer active right now for your exact search. Leave your property details and our luxury desk will find buyers for you immediately.'}
          </p>

          {buyerDemandSummary && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="line-clamp-2">{buyerDemandSummary}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold animate-in fade-in">
              {error}
            </div>
          )}

          {/* Location field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Property Location *</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Baner, Koregaon Park, Balewadi, Pune"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition"
            />
          </div>

          {/* Name & Phone Number fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Your Name *</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Contact Number *</span>
              </label>
              <input
                type="tel"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Email Address *</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. seller@example.com"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition"
            />
          </div>

          {/* Typology / BHK & Asking Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-400" />
                <span>Property Typology / BHK</span>
              </label>
              <input
                type="text"
                value={bhk}
                onChange={(e) => setBhk(e.target.value)}
                placeholder="e.g. 3 BHK, 4 BHK, Commercial Office"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <span>Expected Price / Budget</span>
              </label>
              <input
                type="text"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                placeholder="e.g. ₹2.25 Cr / Negotiable"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">
              Additional Details / Society Name
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Project name, floor number, car parking, carpet area..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 outline-none resize-none transition"
            />
          </div>

          {/* ANV Helpline Notice */}
          <div className="p-3 rounded-2xl bg-zinc-900/90 border border-amber-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-zinc-300">
                Direct Anv Reeality Lead Desk: <strong className="text-white font-mono">93730 20701</strong>
              </span>
            </div>
            <a
              href="tel:+919373020701"
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2"
            >
              Call Now
            </a>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-zinc-950 font-black py-3.5 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(217,119,6,0.3)] disabled:opacity-60 cursor-pointer text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit Property Enquiry</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
