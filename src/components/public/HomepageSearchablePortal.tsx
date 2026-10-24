'use client';

import React, { useState, useEffect, useMemo, useDeferredValue, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  CheckCircle,
  ChevronDown,
  User,
  Users,
  Filter,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  Home,
  Grid,
  Scale,
  Building2,
  ShieldCheck,
  RotateCcw,
  Calendar,
  FileText,
  BadgeCheck,
  Check,
  Lock,
  Phone,
  PhoneCall,
  Sparkles,
  X
} from 'lucide-react';
import { PropertyCardActions } from '@/components/public/PropertyCardActions';
import { InstantEnquiryModal } from '@/components/public/InstantEnquiryModal';
import { SiteVisitModal } from '@/components/public/SiteVisitModal';
import { BespokePropertyRequirementModal } from '@/components/public/BespokePropertyRequirementModal';
import { SellerLeadCaptureModal } from '@/components/public/SellerLeadCaptureModal';
import { AuthInquiryModal } from '@/components/auth/AuthInquiryModal';
import { getClientSession } from '@/lib/user-auth';
import { getPropertyUrl } from '@/lib/slug';
import { parseQueryCriteria, getPropertyRawPrice, scorePropertyMatch } from '@/lib/property-matching';
import { findMatchingCategorySlug } from '@/lib/categories-data';
import { isUserSeller } from '@/lib/seller-intent';

export interface BuyerDemandItem {
  id: string;
  referenceCode: string;
  maskedName: string;
  displayPhone: string;
  displayEmail: string;
  locality: string;
  bhk: string;
  budget: string;
  timeline: string;
  purpose: string;
  requirements: string;
  createdAt: string;
  status: string;
}

export interface PropertyItem {
  id: string;
  slug?: string;
  name: string;
  developer: string;
  locality?: string;
  location: string;
  price: string;
  priceRaw?: number;
  priceSuffix?: string;
  bhk: string;
  bhkNum?: number;
  sqft: string;
  sqftNum?: number;
  status: string;
  description: string;
  image: string;
  images?: string[];
  videoUrl?: string | null;
  videoThumbnail?: string | null;
  tags?: string[];
  reraNumber?: string;
  rpsStatus?: string;
  featured?: boolean;
  label?: string;
  score?: string;
  isCommercial?: boolean;
}

export interface BlogItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  locality?: string;
  connectedTypology?: string;
  connectedProperty?: string;
  readTime?: string;
  author?: string;
}

export interface DynamicFilterOptions {
  localities: string[];
  typologies: { value: string; label: string }[];
  statuses: string[];
  priceRanges: { value: string; label: string }[];
}

export interface HomepageSearchablePortalProps {
  initialProperties: PropertyItem[];
  initialBlogs: BlogItem[];
  initialFilterOptions?: DynamicFilterOptions;
  initialSearchParams?: {
    search?: string;
    locality?: string;
    bhk?: string;
    priceRange?: string;
    status?: string;
  };
  isDedicatedSearchPage?: boolean;
}

export function formatPriceDisplay(val: string | number | undefined | null): string {
  if (!val) return 'Price on Request';
  const str = String(val).trim();
  if (str.startsWith('₹') || /cr|lakh|crore/i.test(str)) return str;
  const num = Number(str.replace(/[^0-9.]/g, ''));
  if (isNaN(num) || num <= 0) return str || 'Price on Request';
  if (num >= 10000000) {
    const cr = (num / 10000000).toFixed(2).replace(/\.00$/, '');
    return `₹${cr} Cr`;
  }
  if (num >= 100000) {
    const lk = (num / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹${lk} Lakh`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

export const REAL_ESTATE_SEARCH_SUGGESTIONS = [
  { label: '🏢 Commercial Office Spaces', query: 'Commercial Office Space Pune' },
  { label: '🏥 Medical & Hospital Premises', query: 'Hospital' },
  { label: '🏠 3 & 4 BHK Luxury Residences', query: '3 BHK Apartments in Pune' },
  { label: '🛍️ Prime Retail Showrooms', query: 'Retail Showroom' },
  { label: '📈 High-ROI Pre-Leased Assets', query: 'Pre-Leased Commercial' },
  { label: '📍 Baner & Balewadi Properties', query: 'Baner' },
  { label: '📍 Koregaon Park Luxury Homes', query: 'Koregaon Park' }
];

interface PropertyCardProps {
  property: PropertyItem;
  onInstantEnquiry: (p: PropertyItem) => void;
}

const PropertyCard = React.memo(function PropertyCard({ property, onInstantEnquiry }: PropertyCardProps) {
  return (
    <div
      className="bg-white rounded-3xl shadow-sm border border-zinc-200/90 overflow-hidden flex flex-col hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 group"
    >
      {/* Visual Top Showcase */}
      <Link
        href={getPropertyUrl(property)}
        className="relative block w-full h-60 sm:h-64 shrink-0 overflow-hidden bg-zinc-950 focus:outline-none"
        title={`View details for ${property.name}`}
      >
        <Image
          src={
            property.image ||
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          }
          alt={property.name}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

        {/* TOP BADGES */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
          {property.isCommercial || property.bhk.includes('Commercial') ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md backdrop-blur-md text-[10px] font-bold shadow-md bg-blue-950/90 text-blue-300 border border-blue-500/40">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Commercial</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md backdrop-blur-md text-[10px] font-bold shadow-md bg-zinc-950/90 text-amber-300 border border-amber-500/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Listing</span>
            </div>
          )}

          <span className="px-2.5 py-1 rounded-md bg-zinc-900/90 backdrop-blur-md text-white text-[10px] font-bold shadow-md uppercase tracking-wider">
            {property.status}
          </span>
        </div>

        {/* BOTTOM HOVER BADGE */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white text-xs">
          <span className="font-bold text-[11px] text-amber-200/90 flex items-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{property.developer}</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
            Score: {property.score || '9.4/10'}
          </span>
        </div>
      </Link>

      {/* INNER CARD (CARD IN CARD CONTENT ARCHITECTURE) */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        {/* Inner Card Top Row: Title, Location & Price */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    property.isCommercial || property.bhk.includes('Commercial')
                      ? 'text-blue-950 bg-blue-50 border-blue-200/60'
                      : 'text-amber-800 bg-amber-50 border-amber-200/60'
                  }`}
                >
                  {property.developer}
                </span>
                <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-600" />
                  <span>{property.location}</span>
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight break-words whitespace-normal">
                <Link
                  href={getPropertyUrl(property)}
                  className="hover:text-amber-800 transition-colors block w-full"
                >
                  {property.name}
                </Link>
              </h3>
            </div>

            {/* Prominent Price Box */}
            <div className="text-left sm:text-right shrink-0 bg-amber-50/50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
              <div className="text-2xl font-black text-zinc-950 tracking-tight">
                {formatPriceDisplay(property.price)}
              </div>
              <div className="text-[10px] text-zinc-500 font-semibold mt-0.5 flex items-center sm:justify-end gap-1">
                <span>{property.priceSuffix || 'All Inclusive'}</span>
                <span className="text-zinc-300">&bull;</span>
                <span className="text-emerald-700 font-bold">Zero Brokerage</span>
              </div>
            </div>
          </div>

          {/* INNER SPECIFICATION CARD (Card in Card Grid) */}
          <div className="grid grid-cols-3 gap-2.5 my-3.5 p-3.5 bg-zinc-50/80 rounded-2xl border border-zinc-200/70 text-xs">
            {/* 1. Typology */}
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">
                Configuration
              </span>
              <span
                className={`font-extrabold mt-0.5 block truncate ${
                  property.isCommercial || property.bhk.includes('Commercial')
                    ? 'text-blue-950 font-black'
                    : 'text-zinc-900'
                }`}
              >
                {property.bhk}
              </span>
            </div>

            {/* 2. Carpet Area */}
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">
                Carpet Area
              </span>
              <span className="font-extrabold text-zinc-900 mt-0.5 block">
                {property.sqft}
              </span>
            </div>

            {/* 3. Possession / Status */}
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">
                Status
              </span>
              <span className="font-extrabold text-zinc-900 mt-0.5 block">
                {property.status}
              </span>
            </div>
          </div>

          {/* ABOUT THIS PROPERTY PARAGRAPH */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              About This Property:
            </span>
            <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">
              {property.description}
            </p>
          </div>

          {/* Verified Specs Pills */}
          <div className="flex flex-wrap gap-1.5 pt-3">
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Verified Direct Listing</span>
            </span>
            {(property.tags && property.tags.length > 0 ? property.tags : ['Vastu Compliant', 'Prime Location'])
              .filter((tag) => !/rps|rera/i.test(tag))
              .map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-semibold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200 flex items-center gap-1"
                >
                  <span>{tag}</span>
                </span>
              ))}
          </div>
        </div>

        {/* Bottom Action Strip: Responsive Action Buttons */}
        <div className="pt-4 border-t border-zinc-100">
          <PropertyCardActions
            property={property}
            onInstantEnquiry={onInstantEnquiry}
          />
        </div>
      </div>
    </div>
  );
});

export function HomepageSearchablePortal({
  initialProperties,
  initialBlogs,
  initialFilterOptions,
  initialSearchParams,
  isDedicatedSearchPage = false
}: HomepageSearchablePortalProps) {
  const router = useRouter();

  // Main Search & Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearchParams?.search || '');
  const [catalogueSearch, setCatalogueSearch] = useState(initialSearchParams?.search || '');
  // Debounced search query for 60+ FPS zero-latency typing
  const [activeFilterQuery, setActiveFilterQuery] = useState(initialSearchParams?.search || '');
  const [selectedLocality, setSelectedLocality] = useState(initialSearchParams?.locality || 'All');
  const [selectedBhk, setSelectedBhk] = useState(initialSearchParams?.bhk || 'All');
  const [selectedPriceRange, setSelectedPriceRange] = useState(initialSearchParams?.priceRange || 'All');
  const [selectedStatus, setSelectedStatus] = useState(initialSearchParams?.status || 'All');
  const [sortBy, setSortBy] = useState<string>('relevance');

  // Debounce the heavy property filtering by 150ms so typing never lags
  useEffect(() => {
    const raw = (catalogueSearch || searchQuery || '').trim();
    const timer = setTimeout(() => {
      setActiveFilterQuery(raw);
      if (raw.length >= 3) {
        if (isUserSeller(raw)) {
          setActiveResultTab('buyer_leads');
        } else {
          setActiveResultTab('properties');
        }
      } else {
        setActiveResultTab('properties');
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, catalogueSearch]);

  const deferredQuery = useDeferredValue(activeFilterQuery);

  const handleInstantEnquiry = useCallback((p: PropertyItem) => {
    setSelectedPropertyForEnquiry(p);
    setConsultationModalOpen(true);
  }, []);

  // Dynamic Filter Options state (initialized from server & syncs automatically with database)
  const [filterOptions, setFilterOptions] = useState<DynamicFilterOptions>(() => {
    return (
      initialFilterOptions || {
        localities: [
          'Koregaon Park',
          'Baner',
          'Balewadi',
          'Kalyani Nagar',
          'Bavdhan',
          'Mahalunge',
          'Shivajinagar',
          'Kharadi',
          'Worli',
          'Hinjewadi',
          'Wakad'
        ],
        typologies: [
          { value: 'Commercial Office', label: 'Commercial Office Space' },
          { value: '1 BHK', label: '1 BHK' },
          { value: '2 BHK', label: '2 BHK' },
          { value: '3 BHK', label: '3 BHK' },
          { value: '4 BHK', label: '4 BHK' },
          { value: '4.5+ BHK Penthouse', label: '4.5+ BHK Penthouse' }
        ],
        statuses: ['Ready to Move', 'Under-Construction', 'Newly Launched'],
        priceRanges: [
          { value: 'Under ₹1.5 Cr', label: 'Under ₹1.5 Cr' },
          { value: '₹1.5 Cr - ₹2.5 Cr', label: '₹1.5 Cr - ₹2.5 Cr' },
          { value: '₹2.5 Cr - ₹4.0 Cr', label: '₹2.5 Cr - ₹4.0 Cr' },
          { value: '₹4.0 Cr+', label: '₹4.0 Cr+ (Ultra-Luxury)' }
        ]
      }
    );
  });

  // Automatically refresh dynamic filter options from backend API so options increase as products/admin add items
  useEffect(() => {
    fetch('/api/filter-options')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFilterOptions((prev) => ({
            localities: Array.from(new Set([...prev.localities, ...(data.localities || [])])),
            typologies: data.typologies || prev.typologies,
            statuses: Array.from(new Set([...prev.statuses, ...(data.statuses || [])])),
            priceRanges: data.priceRanges || prev.priceRanges
          }));
        }
      })
      .catch((err) => console.log('Filter options fetch fallback:', err));

    // Preload verified active buyer demands so seller matchmaking is instantaneous
    fetch('/api/buyer-demands')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.demands)) {
          setBuyerDemands(data.demands);
        }
      })
      .catch(() => {});
  }, []);

  const [properties, setProperties] = useState<PropertyItem[]>(() => {
    return initialProperties || [];
  });

  const [blogs, setBlogs] = useState<BlogItem[]>(initialBlogs || []);
  const [blogCategory, setBlogCategory] = useState('All');
  const [showAllBlogs, setShowAllBlogs] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Tab State: Properties vs Active Registered Buyer Demands
  const [activeResultTab, setActiveResultTab] = useState<'properties' | 'buyer_leads'>(() => {
    const initQ = (initialSearchParams?.search || '').trim();
    if (initQ && isUserSeller(initQ)) {
      return 'buyer_leads';
    }
    return 'properties';
  });
  const [buyerDemands, setBuyerDemands] = useState<BuyerDemandItem[]>([]);
  const [catalogueBuyerFilter, setCatalogueBuyerFilter] = useState('');
  const deferredBuyerFilter = useDeferredValue(catalogueBuyerFilter);

  const filteredCatalogueBuyerDemands = useMemo(() => {
    const rawSearchInput = (catalogueBuyerFilter || (activeResultTab === 'buyer_leads' ? deferredQuery : '')).trim();
    if (!rawSearchInput) return buyerDemands;

    const isSeller = isUserSeller(rawSearchInput);
    const SELLER_STOP_WORDS = new Set([
      'i', 'want', 'a', 'an', 'the', 'buyer', 'buyers', 'for', 'my', 'me', 'we', 'our',
      'property', 'properties', 'sell', 'selling', 'seller', 'sellers', 'need', 'needs',
      'find', 'get', 'looking', 'look', 'seeking', 'seek', 'require', 'required', 'leads',
      'lead', 'clients', 'client', 'to', 'in', 'at', 'with', 'and', 'or', 'is', 'am', 'are',
      'please', 'show', 'give', 'help', 'connect', 'interested', 'available', 'have'
    ]);

    const words = rawSearchInput.toLowerCase().split(/\s+/).filter(Boolean);
    const meaningfulTokens = isSeller
      ? words.filter((w) => !SELLER_STOP_WORDS.has(w))
      : words;

    // For a general seller query like "i want a buyer for my property", meaningfulTokens will be empty.
    // Return all verified active buyers!
    if (meaningfulTokens.length === 0) {
      return buyerDemands;
    }

    return buyerDemands.filter((demand) => {
      const haystack = `${demand.referenceCode} ${demand.maskedName} ${demand.locality} ${demand.bhk} ${demand.budget} ${demand.requirements || ''} ${demand.purpose || ''}`.toLowerCase();
      return meaningfulTokens.every((t) => haystack.includes(t));
    });
  }, [deferredBuyerFilter, deferredQuery, activeResultTab, buyerDemands, catalogueBuyerFilter]);

  // Modal & Toast States
  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [selectedBuyerRefForConnect, setSelectedBuyerRefForConnect] = useState<string | undefined>(undefined);
  const [selectedBuyerSummaryForConnect, setSelectedBuyerSummaryForConnect] = useState<string | undefined>(undefined);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [requirementModalOpen, setRequirementModalOpen] = useState(false);
  const [blogAuthModalOpen, setBlogAuthModalOpen] = useState(false);
  const [targetBlogForAuth, setTargetBlogForAuth] = useState<BlogItem | null>(null);
  const [siteVisitModalOpen, setSiteVisitModalOpen] = useState(false);
  const [selectedPropertyForSiteVisit, setSelectedPropertyForSiteVisit] = useState<PropertyItem | null>(null);
  const [selectedPropertyForEnquiry, setSelectedPropertyForEnquiry] = useState<PropertyItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBackToSearch, setShowBackToSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowBackToSearch(window.scrollY > 300);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSearchBar = () => {
    const searchSection = document.getElementById('properties-search-bar') || document.getElementById('search-results-section');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      const searchInput = document.getElementById('main-search-input') as HTMLInputElement | null;
      searchInput?.focus();
    }, 350);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Open Full Blog: Enforces login before opening
  const handleOpenFullBlog = (article: BlogItem) => {
    const session = getClientSession();
    if (!session) {
      setTargetBlogForAuth(article);
      setBlogAuthModalOpen(true);
      showToast('Patron login is required to view full editorial articles.');
    } else {
      router.push(`/blogs/${encodeURIComponent(article.id)}`);
    }
  };

  // 1. Available Localities: dynamically increases as per products & locations in database
  const availableLocalities = useMemo(() => {
    const set = new Set<string>(filterOptions.localities);
    (initialProperties || []).forEach((p) => {
      if (p.locality?.trim()) set.add(p.locality.trim());
      else if (p.location) {
        const first = p.location.split(',')[0].trim();
        if (first && first.length >= 3) set.add(first);
      }
    });
    (properties || []).forEach((p) => {
      if (p.locality?.trim()) set.add(p.locality.trim());
      else if (p.location) {
        const first = p.location.split(',')[0].trim();
        if (first && first.length >= 3) set.add(first);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [filterOptions.localities, initialProperties, properties]);

  // 2. Available Typologies: dynamically increases as per products & property types in database
  const availableTypologies = useMemo(() => {
    const list = [...filterOptions.typologies];
    const seen = new Set(list.map((t) => t.value.toLowerCase()));

    const checkAndAdd = (bhkVal?: string) => {
      if (!bhkVal) return;
      const trimmed = bhkVal.trim();
      const lower = trimmed.toLowerCase();
      if (!seen.has(lower) && trimmed !== 'All') {
        seen.add(lower);
        list.push({ value: trimmed, label: trimmed });
      }
    };

    (initialProperties || []).forEach((p) => checkAndAdd(p.bhk));
    (properties || []).forEach((p) => checkAndAdd(p.bhk));

    return list;
  }, [filterOptions.typologies, initialProperties, properties]);

  // 3. Available Statuses: dynamically increases as per products in database
  const availableStatuses = useMemo(() => {
    const set = new Set<string>(filterOptions.statuses);
    (initialProperties || []).forEach((p) => {
      if (p.status?.trim() && p.status !== 'Draft' && p.status !== 'Published') {
        set.add(p.status.trim());
      }
    });
    (properties || []).forEach((p) => {
      if (p.status?.trim() && p.status !== 'Draft' && p.status !== 'Published') {
        set.add(p.status.trim());
      }
    });
    return Array.from(set);
  }, [filterOptions.statuses, initialProperties, properties]);

  const availablePriceRanges = filterOptions.priceRanges;

  // Client-Side Filtering Algorithm
  const filterClientSide = (
    qSearch: string,
    qLocality: string,
    qBhk: string,
    qPrice: string,
    qStatus: string
  ): PropertyItem[] => {
    let list = [...(initialProperties && initialProperties.length > 0 ? initialProperties : properties)];

    const criteria = parseQueryCriteria(qSearch);
    if (qLocality && qLocality !== 'All' && (!criteria.locality || criteria.locality === 'All')) {
      criteria.locality = qLocality.toLowerCase();
      criteria.isExplicitLocality = true;
    }
    if (qBhk && qBhk !== 'All') {
      const d = qBhk.match(/\d+/)?.[0];
      if (d) criteria.bhkNum = parseInt(d, 10);
      if (qBhk.toLowerCase().includes('commercial')) criteria.typologyIntent = 'commercial_office';
    }

    if (criteria.hasSpecificIntent || qSearch.trim() || (qLocality && qLocality !== 'All') || (qBhk && qBhk !== 'All')) {
      const qTokens = qSearch.toLowerCase().trim().split(/\s+/).filter(Boolean);
      list = list
        .map((p) => ({ p, score: scorePropertyMatch(p, criteria) }))
        .filter((item) => {
          if (item.score <= 0) return false;
          if (qTokens.length > 0 && !criteria.locality && !criteria.bhkNum) {
            const text = `${item.p.name || ''} ${item.p.developer || ''} ${item.p.locality || ''} ${item.p.location || ''} ${item.p.description || ''} ${item.p.bhk || ''}`.toLowerCase();
            const someMatch = qTokens.some((t) => text.includes(t));
            if (!someMatch) return false;
          }
          const price = getPropertyRawPrice(item.p);
          if (price > 0) {
            if (criteria.maxBudget && price > criteria.maxBudget) return false;
            if (criteria.minBudget && price < criteria.minBudget) return false;
          }
          return true;
        })
        .sort((a, b) => b.score - a.score)
        .map((item) => item.p);
    }

    // Status filtering
    if (qStatus && qStatus !== 'All') {
      if (qStatus.toLowerCase().includes('ready')) {
        list = list.filter((p) => p.status.toLowerCase().includes('ready'));
      } else if (qStatus.toLowerCase().includes('under')) {
        list = list.filter((p) => p.status.toLowerCase().includes('under') || p.status.toLowerCase().includes('construction'));
      } else {
        list = list.filter((p) => p.status.toLowerCase().includes(qStatus.toLowerCase()));
      }
    }

    // Price filtering
    if (qPrice && qPrice !== 'All') {
      if (qPrice.includes('Under ₹1.5')) {
        list = list.filter((p) => (p.priceRaw || 15000000) <= 15000000);
      } else if (qPrice.includes('1.5') && qPrice.includes('2.5')) {
        list = list.filter((p) => (p.priceRaw || 20000000) >= 15000000 && (p.priceRaw || 20000000) <= 25000000);
      } else if (qPrice.includes('2.5') && qPrice.includes('4.0')) {
        list = list.filter((p) => (p.priceRaw || 30000000) >= 25000000 && (p.priceRaw || 30000000) <= 40000000);
      } else if (qPrice.includes('4.0')) {
        list = list.filter((p) => (p.priceRaw || 50000000) >= 40000000);
      }
    }

    return list;
  };

  // Live Instant Filtering: When ANY search or filter dropdown changes, immediately filter and show properties in front!
  const sortedProperties = useMemo(() => {
    const q = (deferredQuery || '').trim();
    let list = filterClientSide(q, selectedLocality, selectedBhk, selectedPriceRange, selectedStatus);

    if (sortBy === 'price_low') {
      list.sort((a, b) => (a.priceRaw || 0) - (b.priceRaw || 0));
    } else if (sortBy === 'price_high') {
      list.sort((a, b) => (b.priceRaw || 0) - (a.priceRaw || 0));
    } else if (sortBy === 'size_high' || sortBy === 'size') {
      list.sort((a, b) => (b.sqftNum || 0) - (a.sqftNum || 0));
    } else if (sortBy === 'size_low') {
      list.sort((a, b) => (a.sqftNum || 0) - (b.sqftNum || 0));
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'name_desc') {
      list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (sortBy === 'developer_asc') {
      list.sort((a, b) => (a.developer || '').localeCompare(b.developer || ''));
    } else if (sortBy === 'locality_asc') {
      list.sort((a, b) => (a.locality || a.location || '').localeCompare(b.locality || b.location || ''));
    } else if (sortBy === 'locality_desc') {
      list.sort((a, b) => (b.locality || b.location || '').localeCompare(a.locality || a.location || ''));
    } else if (sortBy === 'bhk_asc') {
      list.sort((a, b) => (a.bhkNum || 0) - (b.bhkNum || 0));
    } else if (sortBy === 'status_ready') {
      list.sort((a, b) => (b.status?.toLowerCase().includes('ready') ? 1 : 0) - (a.status?.toLowerCase().includes('ready') ? 1 : 0));
    }
    return list;
  }, [initialProperties, properties, deferredQuery, selectedLocality, selectedBhk, selectedPriceRange, selectedStatus, sortBy]);

  // Initial State Display Limits: 4 for Comparison Table, 2 for Property Cards
  const [showAllComparison, setShowAllComparison] = useState(false);
  const [showAllCards, setShowAllCards] = useState(false);

  const displayedComparisonProperties = useMemo(() => {
    if (showAllComparison) return sortedProperties;
    return sortedProperties.slice(0, 4);
  }, [sortedProperties, showAllComparison]);

  const displayedCardProperties = useMemo(() => {
    if (showAllCards) return sortedProperties;
    return sortedProperties.slice(0, 2);
  }, [sortedProperties, showAllCards]);

  const handleShareWhatsApp = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://anvreeality.com';
    const queryTerm = (catalogueSearch || searchQuery || '').trim();
    const queryDesc = queryTerm ? `matching "${queryTerm}"` : 'in prime Pune corridors';

    let propertiesListText = '';
    if (sortedProperties && sortedProperties.length > 0) {
      propertiesListText = sortedProperties.slice(0, 3).map((p, i) =>
        `${i + 1}. *${p.name}* - ${p.bhk} in ${p.locality || 'Pune'} (${formatPriceDisplay(p.price)})`
      ).join('\n');
    }

    const shareText = `🏢 *ANV REEALTY - Verified Properties Portfolio*\n` +
      `Explore verified properties ${queryDesc}:\n\n` +
      (propertiesListText ? `${propertiesListText}\n\n` : '') +
      `🔗 *View All Properties*: ${currentUrl}\n\n` +
      `📞 *ANV REEALTY Central Advisory Desk*: +91 93730 20701`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Execute Search: Synchronizes browser URL & fetches unified search if needed
  const executeSearch = async (overrideParams?: {
    search?: string;
    locality?: string;
    bhk?: string;
    priceRange?: string;
    status?: string;
  }) => {
    setIsSearching(true);
    setShowAllBlogs(false);

    const isDirectBarSearch =
      overrideParams === undefined ||
      (overrideParams.search !== undefined && overrideParams.bhk === undefined && overrideParams.locality === undefined);

    let qSearch = overrideParams?.search !== undefined ? overrideParams.search : (catalogueSearch || searchQuery);
    setActiveFilterQuery(qSearch.trim());
    let qLocality = overrideParams?.locality !== undefined ? overrideParams.locality : selectedLocality;
    let qBhk = overrideParams?.bhk !== undefined ? overrideParams.bhk : selectedBhk;
    let qPrice = overrideParams?.priceRange !== undefined ? overrideParams.priceRange : selectedPriceRange;
    let qStatus = overrideParams?.status !== undefined ? overrideParams.status : selectedStatus;

    const normalizedSearch = qSearch
      .replace(/[-_/\(\)\[\]]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();

    const isSellerText =
      isUserSeller(normalizedSearch) ||
      /\b(?:want|need|find|get|looking for|require|seeking)\s+(?:a\s+|an\s+|the\s+)?buyers?\b/i.test(normalizedSearch) ||
      /\bbuyers?\s+(?:for|needed|required|wanted)\b/i.test(normalizedSearch) ||
      /\b(?:sell|selling)\s+(?:my\s+|a\s+)?(?:flat|apartment|property|home|house|plot|commercial|office)\b/i.test(normalizedSearch);

    if (isDirectBarSearch && normalizedSearch) {
      // BHK / Typology extraction
      let detectedBhk = 'All';
      if (/\b(?:commercial|office|workspace|retail)\b/i.test(normalizedSearch)) {
        detectedBhk = 'Commercial Office';
      } else {
        const bhkMatch =
          normalizedSearch.match(/\b([1-9])\s*(?:bhk|bedroom|bed)s?\b/i) ||
          normalizedSearch.match(/\b(?:bhk|bedroom|bed)s?\s*([1-9])\b/i);
        if (bhkMatch) {
          detectedBhk = `${bhkMatch[1]} BHK`;
        } else if (/\bpenthouses?\b/i.test(normalizedSearch)) {
          detectedBhk = '4.5+ BHK Penthouse';
        }
      }
      if (detectedBhk !== 'All') {
        qBhk = detectedBhk;
        setSelectedBhk(detectedBhk);
      }

      // Locality extraction
      let detectedLoc = 'All';
      for (const loc of availableLocalities) {
        if (loc === 'All') continue;
        if (
          new RegExp(`\\b${loc.replace(/\\s+/g, '[\\s-]+')}\\b`, 'i').test(qSearch) ||
          new RegExp(`\\b${loc}\\b`, 'i').test(normalizedSearch)
        ) {
          detectedLoc = loc;
          break;
        }
      }
      if (detectedLoc !== 'All') {
        qLocality = detectedLoc;
        setSelectedLocality(detectedLoc);
      }

      if (isSellerText) {
        setActiveResultTab('buyer_leads');
      } else {
        setActiveResultTab('properties');
      }
    }

    try {
      const params = new URLSearchParams();
      if (qSearch.trim()) params.set('search', qSearch.trim());
      if (qLocality && qLocality !== 'All') params.set('locality', qLocality);
      if (qBhk && qBhk !== 'All') params.set('bhk', qBhk);
      if (qPrice && qPrice !== 'All') params.set('priceRange', qPrice);
      if (qStatus && qStatus !== 'All') params.set('status', qStatus);

      // Sync URL without page reload
      if (typeof window !== 'undefined') {
        const matchedCategorySlug = findMatchingCategorySlug(qSearch);
        if (
          matchedCategorySlug &&
          (!qLocality || qLocality === 'All') &&
          (!qBhk || qBhk === 'All') &&
          (!qPrice || qPrice === 'All') &&
          (!qStatus || qStatus === 'All')
        ) {
          window.history.replaceState(null, '', `/${matchedCategorySlug}`);
        } else {
          const qs = params.toString();
          const basePath = isDedicatedSearchPage ? '/properties' : '/';
          window.history.replaceState(null, '', qs ? `${basePath}?${qs}` : basePath);
        }
      }

      // Fetch from search API
      const res = await fetch(`/api/unified-search?${params.toString()}`);
      const data = await res.json();

      let fetchedProperties: PropertyItem[] = [];
      let fetchedDemands: BuyerDemandItem[] = [];

      if (data.success) {
        if (Array.isArray(data.properties)) fetchedProperties = data.properties;
        if (Array.isArray(data.buyerDemands)) fetchedDemands = data.buyerDemands;
        if (isSellerText || data.ai?.primaryView === 'buyer_leads' || data.ai?.intent === 'seller') {
          setActiveResultTab('buyer_leads');
        } else {
          setActiveResultTab('properties');
        }
        setProperties(fetchedProperties);
        setBuyerDemands(fetchedDemands);
      } else {
        const fallbackMatched = filterClientSide(qSearch, qLocality, qBhk, qPrice, qStatus);
        setProperties(fallbackMatched);
      }

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('search-results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.log('Search fallback:', err);
      const fallbackMatched = filterClientSide(qSearch, qLocality, qBhk, qPrice, qStatus);
      setProperties(fallbackMatched);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCatalogueSearch('');
    setActiveFilterQuery('');
    setCatalogueBuyerFilter('');
    setSelectedLocality('All');
    setSelectedBhk('All');
    setSelectedPriceRange('All');
    setSelectedStatus('All');
    setSortBy('relevance');
    setProperties(initialProperties || []);
    setActiveResultTab('properties');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', isDedicatedSearchPage ? '/properties' : '/');
    }
    showToast('Filters cleared. Showing all verified properties.');
  };

  return (
    <>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-zinc-950/95 backdrop-blur-xl text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.3)] border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40 shadow-inner">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-white font-bold">{toastMessage}</div>
          </div>
        </div>
      )}

      {/* ================= UNIFIED SEARCH RESULTS (PROPERTIES & BUYER DEMANDS) ================= */}
      <section
        id="search-results-section"
        className={`w-full max-w-[100vw] overflow-x-hidden ${isDedicatedSearchPage ? 'pt-32' : 'pt-6 sm:pt-8'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          {/* ================= SEARCH BAR ONLY ================= */}
          <div id="properties-search-bar" className="w-full bg-white rounded-2xl shadow-sm border border-zinc-200/90 p-3 sm:p-4 mb-8 transition">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="main-search-input"
                  type="text"
                  value={catalogueSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCatalogueSearch(val);
                    setSearchQuery(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      executeSearch();
                    }
                  }}
                  placeholder="Search verified properties by location, type, project, or price (e.g. Baner, 3 BHK, Hospital, Undri)..."
                  className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 rounded-xl pl-10 pr-9 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none transition"
                />
                {catalogueSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogueSearch('');
                      setSearchQuery('');
                      setActiveFilterQuery('');
                      setCatalogueBuyerFilter('');
                      setActiveResultTab('properties');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white hover:text-amber-400 px-6 py-2.5 sm:py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0 text-xs sm:text-sm group active:scale-95"
                title="Reset search and show all verified properties"
              >
                <RotateCcw className="w-4 h-4 text-amber-400 group-hover:-rotate-90 transition-transform duration-300" />
                <span>Reset Properties</span>
              </button>
            </div>

            {/* Real-time Counts (Informative non-clickable badges) */}
            <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 text-xs">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold select-none cursor-default ${
                    activeResultTab === 'properties'
                      ? 'bg-zinc-950 text-amber-400 shadow-xs'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                  title="Total verified properties matching search"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Properties ({sortedProperties.length})</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold select-none cursor-default ${
                    activeResultTab === 'buyer_leads'
                      ? 'bg-amber-500 text-zinc-950 font-black shadow-xs'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                  title="Total active buyers registered in Pune"
                >
                  <Users className="w-3.5 h-3.5 text-zinc-900" />
                  <span>Active Buyers ({filteredCatalogueBuyerDemands.length})</span>
                </span>
              </div>

              {isUserSeller(catalogueSearch || searchQuery) && (
                <div className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-in fade-in select-none cursor-default">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Showing registered buyers for your property query</span>
                </div>
              )}
            </div>
          </div>

          {/* VIEW A: SELLER'S VIEW - ACTIVE BUYER DEMANDS & INQUIRIES */}
          {activeResultTab === 'buyer_leads' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Official Helpline Bar */}
              <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                    <PhoneCall className="w-7 h-7 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-extrabold uppercase tracking-widest border border-amber-500/30 mb-1">
                      <span>Anv Reealty Official Buyer-Seller Concierge Desk</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Helpline Number:{' '}
                      <a href="tel:+919373020701" className="text-amber-400 font-mono tracking-wider hover:underline">
                        93730 20701
                      </a>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
                      Buyer phone numbers are protected. Call our central desk{' '}
                      <strong className="text-white">93730 20701</strong> to introduce your property or arrange buyer viewings.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0 w-full md:w-auto">
                  <a
                    href="tel:+919373020701"
                    className="flex-1 md:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black px-6 py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(217,119,6,0.3)] transition cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call 93730 20701</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBuyerRefForConnect(undefined);
                      setSelectedBuyerSummaryForConnect(undefined);
                      setSellerModalOpen(true);
                    }}
                    className="flex-1 md:flex-none bg-zinc-800/80 hover:bg-zinc-800 text-white font-bold px-5 py-3.5 rounded-xl text-xs sm:text-sm border border-zinc-700/80 transition cursor-pointer text-center"
                  >
                    <span>Register My Property</span>
                  </button>
                </div>
              </div>

              {/* Active Buyers Count Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-zinc-950">
                      {filteredCatalogueBuyerDemands.length} Active {filteredCatalogueBuyerDemands.length === 1 ? 'Buyer' : 'Buyers'} Found
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      Pre-qualified verified buyers actively seeking properties in Pune
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedBuyerRefForConnect(undefined);
                    setSelectedBuyerSummaryForConnect(undefined);
                    setSellerModalOpen(true);
                  }}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Register My Property
                </button>
              </div>

              {/* Buyer Cards Grid */}
              {filteredCatalogueBuyerDemands.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCatalogueBuyerDemands.map((demand) => (
                    <div
                      key={demand.id}
                      className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Top Bar */}
                      <div className="p-5 pb-4 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100/80 border border-amber-200 px-2.5 py-1 rounded-lg">
                            Ref: {demand.referenceCode}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Verified Buyer</span>
                          </span>
                        </div>

                        <h4 className="font-extrabold text-base text-zinc-950 group-hover:text-amber-800 transition">
                          {demand.maskedName}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Target Area: <strong className="text-zinc-800">{demand.locality}, Pune</strong>
                        </p>
                      </div>

                      {/* Core Specs Grid */}
                      <div className="p-5 space-y-3.5 flex-1">
                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                          <div className="p-2.5 bg-zinc-50 border border-zinc-100 rounded-xl">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">Configuration</span>
                            <span className="font-black text-zinc-900">{demand.bhk}</span>
                          </div>
                          <div className="p-2.5 bg-zinc-50 border border-zinc-100 rounded-xl">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">Budget</span>
                            <span className="font-black text-amber-700">{demand.budget}</span>
                          </div>
                          <div className="p-2.5 bg-zinc-50 border border-zinc-100 rounded-xl">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">Timeline</span>
                            <span className="font-bold text-zinc-800">{demand.timeline}</span>
                          </div>
                          <div className="p-2.5 bg-zinc-50 border border-zinc-100 rounded-xl">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">Purpose</span>
                            <span className="font-bold text-zinc-800">{demand.purpose}</span>
                          </div>
                        </div>

                        {/* Requirements Brief */}
                        <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-2xl">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900 block mb-1">
                            Buyer Requirements Brief
                          </span>
                          <p className="text-xs text-zinc-700 leading-relaxed line-clamp-3">
                            {demand.requirements}
                          </p>
                        </div>

                        {/* Official Contact Phone Badge */}
                        <div className="p-3 rounded-2xl bg-zinc-950 text-white flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Helpline to Connect</span>
                            <span className="font-mono font-bold text-amber-400 text-sm tracking-wide">
                              93730 20701
                            </span>
                          </div>
                          <a
                            href="tel:+919373020701"
                            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        </div>
                      </div>

                      {/* Card Bottom CTA */}
                      <div className="p-5 pt-3 border-t border-zinc-100 bg-zinc-50/70">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBuyerRefForConnect(demand.referenceCode);
                            setSelectedBuyerSummaryForConnect(`${demand.bhk} in ${demand.locality} (${demand.budget})`);
                            setSellerModalOpen(true);
                          }}
                          className="w-full bg-zinc-950 hover:bg-amber-600 hover:text-zinc-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow"
                        >
                          <span>Match My Property to this Buyer</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-zinc-200/90 p-10 sm:p-14 text-center space-y-6 shadow-sm w-full max-w-xl mx-auto my-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Search className="w-8 h-8 text-amber-600" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                      0 Buyers Found
                    </h3>
                    <p className="text-zinc-500 text-sm font-medium">
                      Please modify your search
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBuyerRefForConnect(undefined);
                        setSelectedBuyerSummaryForConnect(undefined);
                        setSellerModalOpen(true);
                      }}
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black px-8 py-3.5 rounded-xl text-sm shadow-md hover:shadow-lg transition cursor-pointer"
                    >
                      Register Property for Buyer Matching
                    </button>
                    {catalogueBuyerFilter && (
                      <button
                        type="button"
                        onClick={() => setCatalogueBuyerFilter('')}
                        className="text-xs font-bold text-zinc-500 hover:text-zinc-900 px-4 py-2 transition cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW B: BUYER'S VIEW - AVAILABLE PROPERTIES WITH EXACT UPPER FILTRATION BAR */}
          {activeResultTab === 'properties' && (
            <div id="properties-section" className="space-y-6 animate-in fade-in duration-300">
              {/* ================= 1. INSTITUTIONAL COMPARISON TABLE (SEEN FIRST) ================= */}
              {sortedProperties.length > 0 && (
                <div className="mb-10 bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden w-full max-w-full">
                  <div className="bg-zinc-950 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight text-white">
                        <Building2 className="w-5 h-5 text-amber-400" />
                        <span>
                          {sortedProperties.length} {sortedProperties.length === 1 ? 'Property' : 'Properties'} Found
                        </span>
                      </h3>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Link
                        href="/compare"
                        className="text-xs bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Compare</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleShareWhatsApp}
                        className="text-xs bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                        title="Share on WhatsApp"
                      >
                        <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 2C8.28 2 2 8.28 2 16c0 2.66.75 5.15 2.05 7.29L2.3 29.7l6.63-1.74A13.9 13.9 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm8.17 19.83c-.34.96-1.7 1.76-2.76 1.99-.73.16-1.68.29-4.88-1.04-4.09-1.69-6.72-5.83-6.93-6.1-.2-.28-1.67-2.22-1.67-4.23s1.05-3.01 1.43-3.42c.38-.41.82-.51 1.1-.51.27 0 .55 0 .79.02.25.01.59-.1.92.7.34.82 1.16 2.83 1.26 3.04.1.2.17.44.03.71-.13.27-.2.44-.4.68-.2.24-.43.53-.61.71-.21.21-.43.44-.19.86.25.41 1.09 1.8 2.34 2.91 1.61 1.43 2.97 1.88 3.39 2.09.42.2.67.18.92-.1.25-.28 1.07-1.24 1.35-1.67.28-.43.56-.36.94-.22.38.14 2.42 1.14 2.83 1.35.41.2.69.31.79.48.1.18.1 1.02-.24 1.98z" />
                        </svg>
                        <span>Share</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto text-xs w-full">
                    <table className="w-full text-left min-w-[700px]">
                      <thead className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
                        <tr>
                          {/* 1. Property & Developer */}
                          <th className="px-5 py-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-zinc-700 whitespace-nowrap">Property & Developer</span>
                              <div className="relative inline-flex items-center">
                                <select
                                  value={['name_asc', 'name_desc', 'developer_asc'].includes(sortBy) ? sortBy : ''}
                                  onChange={(e) => setSortBy(e.target.value || 'relevance')}
                                  className="bg-white hover:bg-zinc-100 border border-zinc-200 text-[10px] font-medium text-zinc-600 rounded pl-1.5 pr-4 py-0.5 leading-tight cursor-pointer outline-none transition appearance-none shadow-xs hover:border-zinc-300"
                                  title="Sort by Property Name or Developer"
                                >
                                  <option value="">Sort</option>
                                  <option value="name_asc">Name: A → Z</option>
                                  <option value="name_desc">Name: Z → A</option>
                                  <option value="developer_asc">Developer: A → Z</option>
                                </select>
                                <ChevronDown className="w-2.5 h-2.5 text-zinc-400 absolute right-1 pointer-events-none" />
                              </div>
                            </div>
                          </th>

                          {/* 2. Locality */}
                          <th className="px-5 py-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-zinc-700 whitespace-nowrap">Locality</span>
                              <div className="relative inline-flex items-center">
                                <select
                                  value={['locality_asc', 'locality_desc'].includes(sortBy) ? sortBy : ''}
                                  onChange={(e) => setSortBy(e.target.value || 'relevance')}
                                  className="bg-white hover:bg-zinc-100 border border-zinc-200 text-[10px] font-medium text-zinc-600 rounded pl-1.5 pr-4 py-0.5 leading-tight cursor-pointer outline-none transition appearance-none shadow-xs hover:border-zinc-300"
                                  title="Sort by Locality"
                                >
                                  <option value="">Sort</option>
                                  <option value="locality_asc">Locality: A → Z</option>
                                  <option value="locality_desc">Locality: Z → A</option>
                                </select>
                                <ChevronDown className="w-2.5 h-2.5 text-zinc-400 absolute right-1 pointer-events-none" />
                              </div>
                            </div>
                          </th>

                          {/* 3. Typology & Carpet */}
                          <th className="px-5 py-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-zinc-700 whitespace-nowrap">Typology & Carpet</span>
                              <div className="relative inline-flex items-center">
                                <select
                                  value={['size_high', 'size_low', 'bhk_asc'].includes(sortBy) ? sortBy : ''}
                                  onChange={(e) => setSortBy(e.target.value || 'relevance')}
                                  className="bg-white hover:bg-zinc-100 border border-zinc-200 text-[10px] font-medium text-zinc-600 rounded pl-1.5 pr-4 py-0.5 leading-tight cursor-pointer outline-none transition appearance-none shadow-xs hover:border-zinc-300"
                                  title="Sort by Typology or Carpet Area"
                                >
                                  <option value="">Sort</option>
                                  <option value="size_high">Carpet: Largest</option>
                                  <option value="size_low">Carpet: Smallest</option>
                                  <option value="bhk_asc">Typology: Low → High</option>
                                </select>
                                <ChevronDown className="w-2.5 h-2.5 text-zinc-400 absolute right-1 pointer-events-none" />
                              </div>
                            </div>
                          </th>

                          {/* 4. Price & Status */}
                          <th className="px-5 py-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-zinc-700 whitespace-nowrap">Price & Status</span>
                              <div className="relative inline-flex items-center">
                                <select
                                  value={['price_low', 'price_high', 'status_ready'].includes(sortBy) ? sortBy : ''}
                                  onChange={(e) => setSortBy(e.target.value || 'relevance')}
                                  className="bg-white hover:bg-zinc-100 border border-zinc-200 text-[10px] font-medium text-zinc-600 rounded pl-1.5 pr-4 py-0.5 leading-tight cursor-pointer outline-none transition appearance-none shadow-xs hover:border-zinc-300"
                                  title="Sort by Price or Status"
                                >
                                  <option value="">Sort</option>
                                  <option value="price_low">Price: Low to High</option>
                                  <option value="price_high">Price: High to Low</option>
                                  <option value="status_ready">Ready to Move</option>
                                </select>
                                <ChevronDown className="w-2.5 h-2.5 text-zinc-400 absolute right-1 pointer-events-none" />
                              </div>
                            </div>
                          </th>

                          {/* 5. Site Visit */}
                          <th className="px-5 py-3 text-right font-bold text-zinc-700 whitespace-nowrap">Site Visit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {displayedComparisonProperties.map((row) => (
                          <tr key={row.id} className="hover:bg-zinc-50/70 transition">
                            <td className="px-5 py-3.5">
                              <Link
                                href={getPropertyUrl(row)}
                                className="font-bold text-zinc-900 hover:text-amber-700 hover:underline block"
                              >
                                {row.name}
                              </Link>
                              <div className="text-[10px] text-zinc-400">{row.developer}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="font-semibold text-zinc-800">{row.locality || 'Pune'}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-zinc-800">{row.bhk}</div>
                              <div className="text-[10px] text-zinc-400">{row.sqft}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="font-black text-zinc-950">{formatPriceDisplay(row.price)}</div>
                              <div className="text-[10px] text-zinc-400">{row.status}</div>
                            </td>
                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPropertyForSiteVisit(row);
                                  setSiteVisitModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 group"
                                title={`Book VIP Site Visit for ${row.name}`}
                              >
                                <Calendar className="w-3.5 h-3.5 text-zinc-950 stroke-[2.5]" />
                                <span>Site Visit</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Show More / Show Less for Comparison Table (Top 4 initially) */}
                  {sortedProperties.length > 4 && (
                    <div className="p-4 bg-zinc-50 border-t border-zinc-200 text-center flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setShowAllComparison(!showAllComparison)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm cursor-pointer group"
                      >
                        <span>
                          {showAllComparison
                            ? 'Show Less Comparison (Show Top 4)'
                            : `Show More Comparison (${sortedProperties.length - 4} More Properties)`}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-amber-400 transition-transform duration-200 ${
                            showAllComparison ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ================= 2. PROPERTY PREVIEW CARDS (SEEN SECOND, 2 INITIALLY + SHOW MORE) ================= */}
              {sortedProperties.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-200/80">
                    <h3 className="text-sm sm:text-base font-extrabold text-zinc-950 tracking-tight flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-500" />
                      <span>Property Showcase</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {sortedProperties.length} Available
                      </span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayedCardProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onInstantEnquiry={handleInstantEnquiry}
                      />
                    ))}
                  </div>

                  {/* Show More / Show Less for Property Cards (Top 2 initially) */}
                  {sortedProperties.length > 2 && (
                    <div className="pt-2 text-center flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setShowAllCards(!showAllCards)}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-sm font-black transition shadow-md hover:shadow-lg cursor-pointer group"
                      >
                        <span>
                          {showAllCards
                            ? 'Show Less Properties (Show Top 2)'
                            : `Show All Properties (${sortedProperties.length - 2} More Available)`}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-zinc-950 transition-transform duration-200 ${
                            showAllCards ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-zinc-200/90 p-10 sm:p-14 text-center space-y-6 shadow-sm w-full max-w-xl mx-auto my-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Search className="w-8 h-8 text-amber-600" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                      0 Properties Found
                    </h3>
                    <p className="text-zinc-500 text-sm font-medium">
                      Please modify your search
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRequirementModalOpen(true)}
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black px-8 py-3.5 rounded-xl text-sm shadow-md hover:shadow-lg transition cursor-pointer"
                    >
                      Please Fill Your Requirement
                    </button>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-900 px-4 py-2 transition cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ================= 4. REAL ESTATE BLOGS & INSIGHTS CONNECTED SECTION ================= */}
      <section id="insights-section" className="bg-white border-t border-zinc-200 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Market Insights & Guides
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1 font-medium">
                In-depth market research, investment analyses and Pune real estate intelligence.
              </p>
            </div>

            {/* Category Filter Pills for Blogs */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'Market Report', 'Buying Guide', 'Legal & RERA'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setBlogCategory(cat);
                      const filtered = (initialBlogs || []).filter(
                        (b) => cat === 'All' || b.category.toLowerCase() === cat.toLowerCase()
                      );
                      setBlogs(filtered);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      blogCategory === cat
                        ? 'bg-zinc-950 text-white shadow-2xs'
                        : 'bg-zinc-100 text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowAllBlogs(!showAllBlogs)}
                className="px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-1.5 shadow-2xs"
              >
                <span>{showAllBlogs ? 'Show Fewer' : `View All (${blogs.length})`}</span>
                <ArrowRight className={`w-3.5 h-3.5 transition-transform ${showAllBlogs ? '-rotate-90' : ''}`} />
              </button>
            </div>
          </div>

          {/* Blogs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(showAllBlogs ? blogs : blogs.slice(0, 3)).map((article) => (
              <div
                key={article.id}
                className="bg-zinc-50/70 rounded-2xl shadow-2xs border border-zinc-200 overflow-hidden group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                    <Image
                      src={
                        article.image ||
                        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                      }
                      alt={article.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 bg-zinc-950/90 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm border border-amber-500/30">
                      {article.category}
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80">
                        <FileText className="w-3 h-3 text-amber-600" />
                        <span>
                          {article.connectedProperty
                            ? `Connected Product: ${article.connectedProperty}`
                            : `Connected: ${article.locality || selectedLocality || 'Pune'} Market`}
                        </span>
                      </span>
                      {article.connectedTypology && (
                        <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
                          {article.connectedTypology}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>By {article.author || 'ANV Research'}</span>
                      <span>{article.readTime || '6 min read'}</span>
                    </div>

                    <h3 className="font-bold text-base text-zinc-950 group-hover:text-amber-800 transition leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                      {article.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-3 flex items-center justify-between gap-2 border-t border-zinc-100/80">
                  <button
                    type="button"
                    onClick={() => handleOpenFullBlog(article)}
                    className="text-amber-800 hover:text-amber-950 text-xs font-bold flex items-center gap-1.5 group-hover:gap-2.5 transition-all uppercase tracking-wider cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Read Full Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 border border-zinc-200/80 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Patron Login Required
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Property Enquiry Modal */}
      <InstantEnquiryModal
        isOpen={consultationModalOpen}
        onClose={() => {
          setConsultationModalOpen(false);
          setSelectedPropertyForEnquiry(null);
        }}
        property={selectedPropertyForEnquiry || undefined}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Institutional Table Site Visit Modal */}
      <SiteVisitModal
        isOpen={siteVisitModalOpen}
        onClose={() => {
          setSiteVisitModalOpen(false);
          setSelectedPropertyForSiteVisit(null);
        }}
        property={selectedPropertyForSiteVisit || undefined}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Bespoke Property Buying Requirement Popup Modal */}
      <BespokePropertyRequirementModal
        isOpen={requirementModalOpen}
        onClose={() => setRequirementModalOpen(false)}
        initialLocality={selectedLocality !== 'All' ? selectedLocality : (catalogueSearch || searchQuery || 'Baner')}
        initialBhk={selectedBhk !== 'All' ? selectedBhk : '3 BHK'}
        initialBudget={selectedPriceRange !== 'All' ? selectedPriceRange : '₹1.5 Cr - ₹2.5 Cr'}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Seller Lead Capture Modal */}
      <SellerLeadCaptureModal
        isOpen={sellerModalOpen}
        onClose={() => setSellerModalOpen(false)}
        initialLocation={selectedLocality !== 'All' ? selectedLocality : (catalogueSearch || searchQuery)}
        initialBhk={selectedBhk !== 'All' ? selectedBhk : ''}
        buyerRef={selectedBuyerRefForConnect}
        buyerDemandSummary={selectedBuyerSummaryForConnect}
        onSuccessToast={(msg) => showToast(msg)}
      />



      {/* Patron Auth Modal for Full Blog Access */}
      <AuthInquiryModal
        isOpen={blogAuthModalOpen}
        onClose={() => setBlogAuthModalOpen(false)}
        initialMode="login"
        onSuccess={(msg) => {
          showToast(msg);
          setBlogAuthModalOpen(false);
          if (targetBlogForAuth) {
            router.push(`/blogs/${encodeURIComponent(targetBlogForAuth.id)}`);
          }
        }}
      />
      {/* Floating "Back to Search Bar" & "Back to Home" Quick Action Pill */}
      {showBackToSearch && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-zinc-950/95 backdrop-blur-xl p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-amber-500/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            type="button"
            onClick={scrollToSearchBar}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs transition shadow-sm cursor-pointer group active:scale-95"
            title="Go back up to the search bar"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Back to Search Bar</span>
          </button>
          <Link
            href="/"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition border border-zinc-700/60 active:scale-95 cursor-pointer"
            title="Go back to Home Page"
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span>Home</span>
          </Link>
        </div>
      )}
    </>
  );
}
