'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Scale,
  Heart,
  ArrowRight,
  Share2,
  Copy,
  Check,
  Phone,
  Maximize2,
  Video,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Play
} from 'lucide-react';
import { usePropertyComparison } from '@/context/PropertyComparisonContext';
import { useSavedProperties } from '@/context/SavedPropertiesContext';
import { PropertyItem, ALL_FALLBACK_PROPERTIES } from '@/lib/property-data';
import { getPropertySlug, getPropertyUrl, matchesProperty } from '@/lib/slug';
import { PublicHeader } from '@/components/public/PublicHeader';
import { getClientSession } from '@/lib/user-auth';
import { AuthInquiryModal } from '@/components/auth/AuthInquiryModal';

interface PropertyDetailPageClientProps {
  initialProperty?: PropertyItem | null;
  identifier?: string;
}

export function PropertyDetailPageClient({
  initialProperty,
  identifier
}: PropertyDetailPageClientProps) {
  const routeParams = useParams();
  const slugOrId = identifier || (routeParams?.slug as string) || (routeParams?.id as string) || '13';
  const router = useRouter();

  const { isInCompare, toggleCompare } = usePropertyComparison();
  const { isSaved, toggleSave } = useSavedProperties();

  const fallback =
    ALL_FALLBACK_PROPERTIES.find((p) => matchesProperty(p, slugOrId)) ||
    ALL_FALLBACK_PROPERTIES[0];

  const [property, setProperty] = useState<PropertyItem>(initialProperty || fallback);
  const saved = isSaved(property.id);
  const [copiedRera, setCopiedRera] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'amenities' | 'compliance'>('overview');
  const [toastMsg, setToastMsg] = useState<{ text: string; showLink?: boolean } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Multi-Media Showcase State (Photos & Video)
  const [mediaMode, setMediaMode] = useState<'photos' | 'video'>('photos');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('This Saturday (04:00 PM)');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Client-side fetch & slug canonical URL replacement
  useEffect(() => {
    async function loadProperty() {
      try {
        const res = await fetch('/api/properties');
        const data = await res.json();
        if (data.properties && Array.isArray(data.properties)) {
          const match = data.properties.find((p: any) => matchesProperty(p, slugOrId));
          if (match) {
            setProperty(match);
            // If accessed via numeric ID, cleanly update browser address bar to the SEO slug
            const canonicalSlug = match.slug || getPropertySlug(match);
            if (slugOrId !== canonicalSlug && typeof window !== 'undefined') {
              window.history.replaceState(null, '', `/properties/${canonicalSlug}`);
            }
            return;
          }
        }
      } catch (e) {
        console.warn('Live property fetch fallback:', e);
      }

      const matchedFallback = ALL_FALLBACK_PROPERTIES.find((p) => matchesProperty(p, slugOrId)) || ALL_FALLBACK_PROPERTIES[0];
      setProperty(matchedFallback);
      const canonicalSlug = matchedFallback.slug || getPropertySlug(matchedFallback);
      if (slugOrId !== canonicalSlug && typeof window !== 'undefined') {
        window.history.replaceState(null, '', `/properties/${canonicalSlug}`);
      }
    }

    loadProperty();
  }, [slugOrId]);

  // Active media list
  const mediaImages: string[] = (property?.images && property.images.length > 0)
    ? property.images
    : (property?.image ? [property.image] : []);

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhotoIdx((prev) => (prev + 1) % (mediaImages.length || 1));
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhotoIdx((prev) => (prev - 1 + (mediaImages.length || 1)) % (mediaImages.length || 1));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') setActivePhotoIdx((prev) => (prev + 1) % (mediaImages.length || 1));
      if (e.key === 'ArrowLeft') setActivePhotoIdx((prev) => (prev - 1 + (mediaImages.length || 1)) % (mediaImages.length || 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, mediaImages.length]);

  const showToast = (text: string, showLink = false) => {
    setToastMsg({ text, showLink });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleSave = () => {
    if (!property) return;
    const user = getClientSession();
    if (!user) {
      setAuthNotice('Login or Sign Up is compulsory to save properties to your shortlist.');
      setAuthModalOpen(true);
      return;
    }
    const nextSaved = toggleSave(property.id, property.name);
    if (nextSaved) {
      showToast(`Saved "${property.name}" to your shortlist`, true);
    } else {
      showToast(`Removed "${property.name}" from your shortlist`, false);
    }
  };

  const handleToggleCompare = () => {
    if (!property) return;
    const user = getClientSession();
    if (!user) {
      setAuthNotice('Login or Sign Up is compulsory to compare properties.');
      setAuthModalOpen(true);
      return;
    }
    toggleCompare(property);
  };

  const handleCopyRera = () => {
    if (property?.reraNumber) {
      navigator.clipboard.writeText(property.reraNumber);
      setCopiedRera(true);
      showToast(`Copied MahaRERA ID: ${property.reraNumber}`);
      setTimeout(() => setCopiedRera(false), 2500);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}${getPropertyUrl(property)}`;
      navigator.clipboard.writeText(shareUrl);
      showToast('SEO property link copied to clipboard!');
    }
  };

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      showToast('Please provide your name and contact number');
      return;
    }

    setSubmitting(true);
    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName.trim(),
          phone: clientPhone.trim(),
          email: clientEmail.trim(),
          propertyName: property?.name || 'Curated Residence',
          propertyId: property?.id || slugOrId,
          budget: property?.price || '₹1.5 - 2.5 Cr',
          message: `Scheduled site visit request: ${preferredSlot}. Direct page inquiry.`,
          source: `Property Detail Page: ${property?.name}`
        })
      });
      setFormSubmitted(true);
      showToast('Your site visit request is confirmed! We will contact you soon.');
    } catch (err) {
      console.error(err);
      showToast('Unable to submit inquiry. Please call desk directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center text-sm font-semibold">
        Loading property dossier...
      </div>
    );
  }

  // Cost estimates
  const priceRaw = property.priceRaw || 15000000;
  const stampDuty = Math.round(priceRaw * 0.07);
  const registrationFee = 30000;
  const isReady = property.status.toLowerCase().includes('ready');
  const gstRate = isReady ? 0 : 0.05;
  const gstAmount = Math.round(priceRaw * gstRate);
  const totalCost = priceRaw + stampDuty + registrationFee + gstAmount;

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  };

  const isCompared = isInCompare(property.id);

  return (
    <>
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[95] bg-zinc-950 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-zinc-800 animate-in fade-in flex items-center gap-3">
          <span>{toastMsg.text}</span>
          {toastMsg.showLink && (
            <Link
              href="/saved"
              className="text-amber-400 hover:text-amber-300 font-extrabold underline flex items-center gap-1"
            >
              <span>View Shortlist →</span>
            </Link>
          )}
        </div>
      )}

      {/* Top Navbar */}
      <PublicHeader />

      <main className="min-h-screen bg-zinc-50 text-zinc-900 pt-20 sm:pt-24 pb-20">
        {/* BREADCRUMB & TOP CONTROLS */}
        <div className="bg-white border-b border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-500 overflow-x-auto py-0.5">
              <Link href="/" className="hover:text-amber-600 transition flex items-center gap-1 font-semibold shrink-0">
                <span>Home</span>
              </Link>
              <span className="text-zinc-300">/</span>
              <Link href="/properties" className="hover:text-amber-600 transition font-semibold shrink-0">
                <span>Properties</span>
              </Link>
              <span className="text-zinc-300">/</span>
              <Link href={`/properties?locality=${encodeURIComponent(property.locality || 'Pune')}`} className="hover:text-amber-600 transition shrink-0">
                {property.locality || 'Pune'}
              </Link>
              <span className="text-zinc-300">/</span>
              <span className="font-bold text-zinc-900 truncate max-w-[180px] sm:max-w-xs md:max-w-none">
                {property.name}
              </span>
            </nav>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleToggleCompare}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  isCompared
                    ? 'bg-amber-400 text-black border-amber-400 font-extrabold shadow-xs'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{isCompared ? 'Compared ✓' : 'Add to Compare'}</span>
              </button>

              <button
                onClick={handleToggleSave}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  saved
                    ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-xs'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-rose-600'
                }`}
                title={saved ? 'Remove from shortlist' : 'Save property'}
              >
                <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-xl transition cursor-pointer"
                title="Share property link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* HERO SHOWCASE SECTION */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gallery Big Preview & Multi-Media Showcase */}
            <div className="lg:col-span-8 space-y-3">
              <div className="relative h-64 sm:h-80 md:h-[460px] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-950 shadow-md border border-zinc-200 group">
                {/* Mode 1: Photos Carousel */}
                {mediaMode === 'photos' ? (
                  <>
                    {mediaImages.length > 0 ? (
                      <Image
                        src={mediaImages[activePhotoIdx]}
                        alt={`${property.name} - View ${activePhotoIdx + 1}`}
                        fill
                        className="object-cover group-hover:scale-102 transition duration-700 select-none cursor-pointer"
                        priority
                        unoptimized
                        onClick={() => setIsLightboxOpen(true)}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
                        <ImageIcon className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm font-medium opacity-50">No photos uploaded yet</p>
                      </div>
                    )}

                    {/* Prev / Next Controls */}
                    {mediaImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevPhoto}
                          className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center transition border border-white/20 shadow-lg cursor-pointer z-30 opacity-80 hover:opacity-100"
                          aria-label="Previous Photo"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextPhoto}
                          className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center transition border border-white/20 shadow-lg cursor-pointer z-30 opacity-80 hover:opacity-100"
                          aria-label="Next Photo"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  /* Mode 2: Video Walkthrough Player */
                  <div className="w-full h-full relative bg-black flex items-center justify-center">
                    <video
                      key={property.videoUrl}
                      src={property.videoUrl}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                      poster={property.videoThumbnail || mediaImages[0]}
                    >
                      Your browser does not support high-definition video playback.
                    </video>
                  </div>
                )}

                {/* Top Floating Controls Overlay */}
                <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between gap-2 z-30 pointer-events-none">
                  {/* Left: Badges */}
                  <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto flex-wrap">
                    {property.label && (
                      <span className="bg-zinc-950/85 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/20 shadow-sm">
                        {property.label}
                      </span>
                    )}
                    {property.isCommercial && (
                      <span className="bg-amber-400 text-black text-[11px] sm:text-xs font-black px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl shadow-sm">
                        Grade-A Commercial
                      </span>
                    )}
                  </div>

                  {/* Right: Mode Switcher & Score */}
                  <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
                    {(mediaImages.length > 0 || property.videoUrl) && (
                      <div className="flex items-center bg-zinc-950/85 backdrop-blur-md p-1 rounded-xl sm:rounded-2xl border border-white/20 shadow-sm">
                        {mediaImages.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setMediaMode('photos')}
                            className={`px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              mediaMode === 'photos'
                                ? 'bg-amber-400 text-black font-extrabold shadow-xs'
                                : 'text-zinc-300 hover:text-white'
                            }`}
                          >
                            <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>Photos ({mediaImages.length})</span>
                          </button>
                        )}

                        {property.videoUrl && (
                          <button
                            type="button"
                            onClick={() => setMediaMode('video')}
                            className={`px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              mediaMode === 'video'
                                ? 'bg-amber-400 text-black font-extrabold shadow-xs'
                                : 'text-zinc-300 hover:text-white'
                            }`}
                          >
                            <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span className="hidden xs:inline">Video</span>
                          </button>
                        )}
                      </div>
                    )}

                    {property.score && (
                      <div className="hidden md:flex bg-emerald-950/85 backdrop-blur-md text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/30 items-center gap-1.5 shadow-sm">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>RPS: {property.score}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="p-1.5 sm:p-2 rounded-xl bg-zinc-950/85 hover:bg-zinc-900 text-white backdrop-blur-md border border-white/20 transition cursor-pointer shadow-sm"
                      title="Expand Fullscreen Lightbox"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Gradient Metadata Overlay */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3.5 sm:p-5 rounded-2xl text-white pointer-events-none">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                    <div>
                      <div className="text-[11px] sm:text-xs text-amber-400 font-bold uppercase tracking-wider">
                        {property.developer}
                      </div>
                      <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight mt-0.5 leading-tight">
                        {property.name}
                      </h1>
                      <p className="text-[11px] sm:text-xs text-zinc-300 flex items-center gap-1.5 mt-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </p>
                    </div>

                    <div className="self-start sm:self-auto shrink-0 pointer-events-auto">
                      {mediaMode === 'photos' && mediaImages.length > 0 ? (
                        <div className="bg-black/70 backdrop-blur-md text-zinc-200 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-xl border border-white/15 flex items-center gap-1.5">
                          <ImageIcon className="w-3 h-3 text-amber-400" />
                          <span>Photo {activePhotoIdx + 1} of {mediaImages.length}</span>
                        </div>
                      ) : mediaMode === 'video' ? (
                        <div className="bg-amber-400/90 backdrop-blur-md text-black text-[11px] sm:text-xs font-black px-2.5 sm:px-3 py-1 rounded-xl shadow-xs flex items-center gap-1.5">
                          <Play className="w-3 h-3 fill-black" />
                          <span>Video Tour</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Thumbnails rail */}
              {(mediaImages.length > 0 || property.videoUrl) && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {mediaImages.map((imgUrl, idx) => {
                    const isActive = mediaMode === 'photos' && activePhotoIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setMediaMode('photos');
                          setActivePhotoIdx(idx);
                        }}
                        className={`relative w-16 sm:w-24 h-12 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          isActive
                            ? 'border-amber-400 ring-2 ring-amber-400/50 scale-102 shadow-md'
                            : 'border-zinc-200 opacity-70 hover:opacity-100'
                        }`}
                        title={`View photo ${idx + 1}`}
                      >
                        <Image src={imgUrl} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" unoptimized />
                        <span className="absolute bottom-1 right-1 bg-black/75 text-[9px] font-bold text-white px-1 rounded">
                          #{idx + 1}
                        </span>
                      </button>
                    );
                  })}

                  {property.videoUrl && (
                    <button
                      type="button"
                      onClick={() => setMediaMode('video')}
                      className={`relative w-20 sm:w-28 h-12 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-zinc-900 flex flex-col items-center justify-center text-center p-1 ${
                        mediaMode === 'video'
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-102 shadow-md bg-zinc-800'
                          : 'border-zinc-200 opacity-80 hover:opacity-100'
                      }`}
                      title="Play 4K Video Walkthrough"
                    >
                      <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md">
                        <Play className="w-2.5 h-2.5 fill-black ml-0.5" />
                      </div>
                      <span className="text-[9px] font-extrabold text-white mt-1">Video</span>
                    </button>
                  )}
                </div>
              )}

              {/* 4 CORE STATS BAR */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200 shadow-xs">
                <div className="p-2.5 sm:p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Typology</span>
                  <span className="text-xs sm:text-sm font-black text-zinc-900 block mt-0.5 truncate">{property.bhk}</span>
                </div>
                <div className="p-2.5 sm:p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Carpet Area</span>
                  <span className="text-xs sm:text-sm font-black text-zinc-900 block mt-0.5 truncate">{property.sqft}</span>
                </div>
                <div className="p-2.5 sm:p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Possession</span>
                  <span className="text-xs sm:text-sm font-black text-zinc-900 block mt-0.5 truncate">{property.status}</span>
                </div>
                <div className="p-2.5 sm:p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">RPS Status</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-700 block mt-0.5 truncate">MahaRERA Verified ✓</span>
                </div>
              </div>

              {/* TABS NAVIGATION */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto shadow-xs">
                {[
                  { id: 'overview', label: 'Executive Dossier' },
                  { id: 'financials', label: 'Financial Cost Sheet' },
                  { id: 'amenities', label: 'Lifestyle Amenities' },
                  { id: 'compliance', label: 'RERA & Legal Clearance' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT */}
              {activeTab === 'overview' && (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 p-5 sm:p-8 space-y-6 shadow-xs">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-zinc-950 mb-2">Architectural Narrative & Orientation</h3>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      {property.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                      <span className="text-xs font-bold text-zinc-900 block mb-2">Engineering & Architectural Highlights</span>
                      <ul className="space-y-1.5 text-xs text-zinc-600 list-disc list-inside">
                        <li>East/West vastu layout optimizing cross-ventilation</li>
                        <li>Double-glazed soundproof glass with acoustic barrier</li>
                        <li>High ceilings with expansive 8ft entryway</li>
                        <li>Dedicated utility deck separate from private sit-out</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                      <span className="text-xs font-bold text-zinc-900 block mb-2">Location Connectivity Advantage</span>
                      <ul className="space-y-1.5 text-xs text-zinc-600 list-disc list-inside">
                        <li>Direct arterial access to Pune-Mumbai Expressway</li>
                        <li>Within 7 minutes of Metro Line 3 station</li>
                        <li>5-10 mins from top business parks and IT corridors</li>
                        <li>Proximity to reputed hospitals & international schools</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'financials' && (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 p-5 sm:p-8 space-y-6 shadow-xs">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-zinc-950">Statutory Landed Cost Sheet</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Transparent breakdown of all statutory taxes, stamp duties, and direct developer pricing.
                    </p>
                  </div>

                  <div className="border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-200 text-xs">
                    <div className="flex justify-between items-center p-3.5 sm:p-4 bg-zinc-50">
                      <span className="font-bold text-zinc-800">Base Agreement Value</span>
                      <span className="font-black text-zinc-950 text-sm">{formatCurrency(priceRaw)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3.5 sm:p-4">
                      <span className="text-zinc-600">MahaRERA Stamp Duty (7%)</span>
                      <span className="font-semibold text-zinc-900">{formatCurrency(stampDuty)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3.5 sm:p-4">
                      <span className="text-zinc-600">Statutory Registration Charges</span>
                      <span className="font-semibold text-zinc-900">₹30,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3.5 sm:p-4">
                      <span className="text-zinc-600">Goods & Services Tax (GST {isReady ? '0% - OC Issued' : '5%'})</span>
                      <span className="font-semibold text-zinc-900">{isReady ? '₹0 (OC Received)' : formatCurrency(gstAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3.5 sm:p-4">
                      <span className="text-zinc-600">Brokerage & Advisory Fee</span>
                      <span className="font-bold text-emerald-700">₹0 (Zero Brokerage Mandate)</span>
                    </div>
                    <div className="flex justify-between items-center p-4 sm:p-5 bg-zinc-950 text-white font-bold">
                      <span className="text-xs sm:text-sm">Estimated Total Landed Outlay</span>
                      <span className="text-amber-400 text-base sm:text-lg font-black">{formatCurrency(totalCost)}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'amenities' && (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 p-5 sm:p-8 space-y-6 shadow-xs">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-zinc-950">Residential Lifestyle & Wellness Ecosystem</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      World-class amenities maintained to institutional five-star hospitality standards.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { title: 'Infinity Rooftop Pool', desc: 'Temperature-controlled with sundeck' },
                      { title: 'Grand Clubhouse', desc: 'Private banquet & business lounge' },
                      { title: 'Biometric 3-Tier Security', desc: 'Face recognition & RFID vehicle access' },
                      { title: 'Dedicated EV Charging', desc: 'Fast DC charging for electric vehicles' },
                      { title: 'Fitness Sanctuary & Yoga', desc: 'Imported equipment, steam and sauna' },
                      { title: 'Squash & Badminton Courts', desc: 'Indoor air-conditioned sports arena' },
                      { title: 'Landscaped Forest Podium', desc: '400+ native trees with reflexology trail' },
                      { title: 'Children’s Discovery Zone', desc: 'Dedicated safe indoor & outdoor play park' },
                      { title: '100% Power Backup', desc: 'Uninterrupted power support for entire unit' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item.title}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-snug">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'compliance' && (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 p-5 sm:p-8 space-y-6 shadow-xs">
                  <div className="p-4 sm:p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-emerald-950">MahaRERA & RPS Legal Title Vetting</h4>
                      <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                        This property has completed 100% title deed investigation, environmental clearance, and commencement certification as registered under Government of Maharashtra MahaRERA.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase block">MahaRERA Registration ID</span>
                        <span className="font-mono font-bold text-zinc-900 text-sm block mt-0.5">
                          {property.reraNumber || 'PRM/PUN/RERA/2026/0491'}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyRera}
                        className="p-2 hover:bg-zinc-200 rounded-lg text-zinc-600 transition"
                        title="Copy RERA ID"
                      >
                        {copiedRera ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">Title Clearance Status</span>
                      <span className="font-bold text-emerald-700 text-sm block mt-0.5">
                        100% Clear Title &bull; Zero Encumbrances
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STICKY RIGHT COLUMN: PRICE & INSTANT ENQUIRY / VISIT BOOKING */}
            <div className="lg:col-span-4 space-y-5">
              {/* PRICE CARD */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 p-5 sm:p-6 shadow-sm">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  All-Inclusive Quoted Valuation
                </span>
                <div className="text-2xl sm:text-4xl font-black text-zinc-950 mt-1">
                  {property.price}
                </div>
                <div className="text-xs text-zinc-500 font-semibold mt-1 flex items-center gap-2">
                  <span>{property.priceSuffix || 'All Inclusive'}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-700 font-bold">Zero Brokerage</span>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Estimated Rate:</span>
                  <span className="font-bold text-zinc-900">
                    ₹{Math.round(priceRaw / (property.sqftNum || 1100)).toLocaleString('en-IN')} / sq.ft
                  </span>
                </div>

                {/* Quick Save & Compare Actions inside Price Card */}
                <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleSave}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      saved
                        ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-xs'
                        : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{saved ? 'Shortlisted ✓' : 'Save'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCompare(property)}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      isCompared
                        ? 'bg-amber-400 border-amber-400 text-black font-extrabold shadow-xs'
                        : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                    }`}
                  >
                    <Scale className="w-4 h-4 text-zinc-500" />
                    <span>{isCompared ? 'Compared ✓' : 'Compare'}</span>
                  </button>
                </div>
              </div>

              {/* PRIVATE SITE VISIT & ENQUIRY FORM */}
              <div className="bg-zinc-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl border border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Exclusive Viewing Pass
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">Schedule Private Site Visit</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Arrange a private escorted walkthrough with our senior advisor. Complimentary Innova Crysta pickup available.
                </p>

                {formSubmitted ? (
                  <div className="mt-6 p-5 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-center space-y-3 animate-in fade-in zoom-in-95">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-white">
                        Your Site Visit Request is Confirmed!
                      </h4>
                      <p className="text-xs text-emerald-300 font-semibold mt-1">
                        We will contact you shortly.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormSubmitted(false)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold underline pt-1 block mx-auto cursor-pointer"
                    >
                      Book Another Viewing / Modify
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitEnquiry} className="mt-5 space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[11px] text-zinc-400 font-semibold mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Rahul Mehta"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 font-semibold mb-1">Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="+91 98200 00000"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 font-semibold mb-1">Email Address</label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 font-semibold mb-1">Preferred Timing Slot</label>
                      <input
                        type="text"
                        value={preferredSlot}
                        onChange={(e) => setPreferredSlot(e.target.value)}
                        placeholder="e.g. This Saturday (04:00 PM)"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3.5 rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{submitting ? 'Confirming Pass...' : 'Dispatch Viewing Pass'}</span>
                      <ArrowRight className="w-4 h-4 text-black" />
                    </button>
                  </form>
                )}

                {/* Direct Advisor Desk */}
                <div className="mt-5 pt-5 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                      RS
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Rohit Sharma</div>
                      <div className="text-[10px] text-zinc-400">Senior Real Estate Advisor</div>
                    </div>
                  </div>

                  <a
                    href="tel:+919373020701"
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 transition"
                    title="Direct Phone Desk"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-4 text-white pb-3 border-b border-white/10">
            <div>
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
                {property.developer}
              </span>
              <h2 className="text-base sm:text-xl font-bold truncate max-w-md sm:max-w-xl">
                {property.name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
                title="Close Lightbox"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            {mediaImages.length > 0 && (
              <div className="relative w-full h-full max-w-5xl max-h-[75vh]">
                <Image
                  src={mediaImages[activePhotoIdx]}
                  alt={`Photo ${activePhotoIdx + 1}`}
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />

                {mediaImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition cursor-pointer shadow-2xl"
                      title="Previous"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition cursor-pointer shadow-2xl"
                      title="Next"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
                  Photo {activePhotoIdx + 1} of {mediaImages.length}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthInquiryModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthNotice(null);
        }}
        featureNotice={authNotice || undefined}
        onSuccess={(msg) => showToast(msg, false)}
      />
    </>
  );
}
