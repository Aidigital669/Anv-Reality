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
  Check,
  Lock,
  Phone,
  PhoneCall,
  Sparkles,
  Eye,
  X,
  Briefcase,
  Store,
  Tag
} from 'lucide-react';
import { PropertyCardActions } from '@/components/public/PropertyCardActions';
import { InstantEnquiryModal } from '@/components/public/InstantEnquiryModal';
import { SiteVisitModal } from '@/components/public/SiteVisitModal';
import { BespokePropertyRequirementModal } from '@/components/public/BespokePropertyRequirementModal';
import { SellerLeadCaptureModal } from '@/components/public/SellerLeadCaptureModal';
import { AuthInquiryModal } from '@/components/auth/AuthInquiryModal';
import { PropertyDetailsModal } from '@/components/public/PropertyDetailsModal';
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
  configuration?: string;
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
  listingType?: 'Sale' | 'Rent' | 'Buy' | string;
  businessPurposes?: { id: number; name: string; slug: string }[];
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
    purpose?: string;
    transactionType?: string;
    type?: string;
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

export function cleanSqft(sqft?: string): string {
  if (!sqft) return '1,200 Sq.Ft.';
  return sqft.replace(/\s*carpet\s*/gi, '').trim();
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
  onQuickView?: (p: PropertyItem) => void;
}

const PropertyCard = React.memo(function PropertyCard({
  property,
  onInstantEnquiry,
  onQuickView
}: PropertyCardProps) {
  return (
    <div
      className="bg-white rounded-3xl shadow-sm border border-zinc-200/90 overflow-hidden flex flex-col hover:shadow-2xl hover:border-amber-400/60 hover:-translate-y-1 transition-all duration-300 group"
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
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10">
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
      </Link>

      {/* INNER CARD (CARD IN CARD CONTENT ARCHITECTURE) */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        {/* Inner Card Top Row: Title, Location & Price */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {property.developer &&
                  !/anv\s*(signature\s*partner|verified\s*developer|partner\s*developer)/i.test(property.developer) && (
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      property.isCommercial || property.bhk.includes('Commercial')
                        ? 'text-blue-950 bg-blue-50 border-blue-200/60'
                        : 'text-amber-800 bg-amber-50 border-amber-200/60'
                    }`}
                  >
                    {property.developer}
                  </span>
                )}
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
                {cleanSqft(property.sqft)}
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
            {property.businessPurposes && property.businessPurposes.length > 0 && (
              <span className="text-[11px] font-bold text-amber-950 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                <Briefcase className="w-3 h-3 text-amber-600" />
                <span>
                  Suitable: {property.businessPurposes.slice(0, 2).map((bp) => bp.name).join(', ')}
                  {property.businessPurposes.length > 2 ? ` +${property.businessPurposes.length - 2}` : ''}
                </span>
              </span>
            )}
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
  const [selectedBhk, setSelectedBhk] = useState(
    initialSearchParams?.bhk && initialSearchParams.bhk !== 'All'
      ? initialSearchParams.bhk
      : (initialSearchParams?.type || 'All')
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState(initialSearchParams?.priceRange || 'All');
  const [selectedStatus, setSelectedStatus] = useState(initialSearchParams?.status || 'All');
  const [selectedPurpose, setSelectedPurpose] = useState<string>(initialSearchParams?.purpose || 'All');
  const [selectedTransactionType, setSelectedTransactionType] = useState<string>(initialSearchParams?.transactionType || 'All');
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
          'Hinjewadi',
          'Wakad',
          'Talawade',
          'Gultekadi',
          'Undri',
          'Viman Nagar'
        ],
        typologies: [
          { value: 'Office in IT Park', label: 'Office in IT Park' },
          { value: 'Commercial Office', label: 'Commercial Office Space' },
          { value: 'Hospital / Healthcare', label: 'Hospital / Healthcare' },
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
  const [buyerSortBy, setBuyerSortBy] = useState<string>('relevance');
  const [buyerBhkFilter, setBuyerBhkFilter] = useState<string>('All');
  const [buyerLocalityFilter, setBuyerLocalityFilter] = useState<string>('All');
  const [showAllBuyerComparison, setShowAllBuyerComparison] = useState(false);
  const [showAllBuyerCards, setShowAllBuyerCards] = useState(false);

  const filteredCatalogueBuyerDemands = useMemo(() => {
    let list = buyerDemands;

    if (buyerBhkFilter && buyerBhkFilter !== 'All') {
      const bLower = buyerBhkFilter.toLowerCase();
      list = list.filter((demand) => {
        const text = `${demand.bhk} ${demand.requirements} ${demand.purpose}`.toLowerCase();
        if (bLower.includes('it park') || bLower.includes('tech park')) {
          return text.includes('it park') || text.includes('tech park') || text.includes('commercial') || text.includes('office');
        }
        if (bLower.includes('commercial') || bLower.includes('office')) {
          return text.includes('commercial') || text.includes('office') || text.includes('workspace');
        }
        if (bLower.includes('hospital') || bLower.includes('medical') || bLower.includes('healthcare')) {
          return text.includes('hospital') || text.includes('medical') || text.includes('clinic');
        }
        if (bLower.includes('shop') || bLower.includes('showroom') || bLower.includes('retail')) {
          return text.includes('shop') || text.includes('showroom') || text.includes('retail') || text.includes('store');
        }
        if (bLower.includes('industrial') || bLower.includes('warehouse') || bLower.includes('factory')) {
          return text.includes('industrial') || text.includes('warehouse') || text.includes('factory') || text.includes('godown');
        }
        const digit = bLower.match(/\d+/)?.[0];
        if (digit) {
          return text.includes(`${digit} bhk`) || text.includes(`${digit}bhk`) || text.includes(`${digit} &`) || text.includes(`& ${digit}`);
        }
        return text.includes(bLower);
      });
    }

    if (buyerLocalityFilter && buyerLocalityFilter !== 'All') {
      const locLower = buyerLocalityFilter.toLowerCase();
      list = list.filter((demand) => {
        const text = `${demand.locality} ${demand.requirements}`.toLowerCase();
        return text.includes(locLower);
      });
    }

    const rawSearchInput = (catalogueBuyerFilter || deferredQuery).trim();
    if (!rawSearchInput) return list;

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
      return list;
    }

    return list.filter((demand) => {
      const haystack = `${demand.referenceCode} ${demand.maskedName} ${demand.locality} ${demand.bhk} ${demand.budget} ${demand.requirements || ''} ${demand.purpose || ''}`.toLowerCase();
      return meaningfulTokens.every((t) => haystack.includes(t));
    });
  }, [deferredQuery, buyerDemands, catalogueBuyerFilter, buyerBhkFilter, buyerLocalityFilter]);

  const sortedBuyerDemands = useMemo(() => {
    const list = [...filteredCatalogueBuyerDemands];
    if (buyerSortBy === 'locality_asc') {
      list.sort((a, b) => a.locality.localeCompare(b.locality));
    } else if (buyerSortBy === 'locality_desc') {
      list.sort((a, b) => b.locality.localeCompare(a.locality));
    } else if (buyerSortBy === 'bhk_asc' || buyerSortBy === 'typography_asc') {
      list.sort((a, b) => a.bhk.localeCompare(b.bhk, undefined, { numeric: true, sensitivity: 'base' }));
    } else if (buyerSortBy === 'bhk_desc' || buyerSortBy === 'typography_desc') {
      list.sort((a, b) => b.bhk.localeCompare(a.bhk, undefined, { numeric: true, sensitivity: 'base' }));
    }
    return list;
  }, [filteredCatalogueBuyerDemands, buyerSortBy]);

  const displayedComparisonBuyers = useMemo(() => {
    if (showAllBuyerComparison) return sortedBuyerDemands;
    return sortedBuyerDemands.slice(0, 5);
  }, [sortedBuyerDemands, showAllBuyerComparison]);

  const displayedCardBuyers = useMemo(() => {
    if (showAllBuyerCards) return sortedBuyerDemands;
    return sortedBuyerDemands.slice(0, 3);
  }, [sortedBuyerDemands, showAllBuyerCards]);

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

  // Property Details Specs Modal & Table Hover Card States
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDetailsProperty, setSelectedDetailsProperty] = useState<PropertyItem | null>(null);
  const [hoveredTableProperty, setHoveredTableProperty] = useState<{
    property: PropertyItem;
    x: number;
    y: number;
  } | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTablePropertyHover = (e: React.MouseEvent<HTMLTableRowElement>, property: PropertyItem) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    const cardWidth = 350;
    const cardHeight = 390;

    let left = e.clientX + 16;
    if (typeof window !== 'undefined' && left + cardWidth > window.innerWidth - 16) {
      left = Math.max(16, e.clientX - cardWidth - 16);
    }

    let top = rect.top - 20;
    if (typeof window !== 'undefined' && top + cardHeight > window.innerHeight - 16) {
      top = Math.max(16, window.innerHeight - cardHeight - 16);
    }
    if (top < 16) {
      top = 16;
    }

    setHoveredTableProperty({
      property,
      x: left,
      y: top
    });
  };

  const handleTablePropertyLeave = () => {
    hoverTimerRef.current = setTimeout(() => {
      setHoveredTableProperty(null);
    }, 220);
  };

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
    (buyerDemands || []).forEach((d) => {
      if (d.locality?.trim()) {
        const parts = d.locality.split(/[/,]/);
        parts.forEach((part) => {
          const t = part.trim();
          if (t && t.length >= 3 && !t.toLowerCase().includes('corridor') && !t.toLowerCase().includes('pune')) {
            set.add(t);
          }
        });
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [filterOptions.localities, initialProperties, properties, buyerDemands]);

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

    (initialProperties || []).forEach((p) => {
      checkAndAdd(p.bhk);
      checkAndAdd(p.configuration);
    });
    (properties || []).forEach((p) => {
      checkAndAdd(p.bhk);
      checkAndAdd(p.configuration);
    });

    return list;
  }, [filterOptions.typologies, initialProperties, properties]);

  const otherTypologies = useMemo(() => {
    const standardKeys = new Set([
      'all',
      '1 bhk', '2 bhk', '3 bhk', '4 bhk', '4.5+ bhk penthouse',
      'residential apartment', 'residential bunglow', 'residential bungalow',
      'office in it park', 'commercial office', 'commercial office space', 'office space',
      'shop/showroom', 'shop', 'showroom', 'preleased properties', 'restaurant',
      'hospital', 'hospital / healthcare', 'industrial factory', 'warehouse', 'plot/land', 'land/plot'
    ]);
    return availableTypologies
      .filter((t) => !standardKeys.has(t.value.toLowerCase().trim()))
      .sort((a, b) => (a.label || a.value).localeCompare(b.label || b.value));
  }, [availableTypologies]);

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
    qStatus: string,
    qPurpose?: string,
    qTransactionType?: string
  ): PropertyItem[] => {
    let list = [...(initialProperties && initialProperties.length > 0 ? initialProperties : properties)];

    const criteria = parseQueryCriteria(qSearch);
    if (qLocality && qLocality !== 'All' && (!criteria.locality || criteria.locality === 'All')) {
      criteria.locality = qLocality.toLowerCase();
      criteria.isExplicitLocality = true;
    }
    if (qBhk && qBhk !== 'All') {
      const d = qBhk.match(/\d+(?:\.5)?/)?.[0];
      if (d) criteria.bhkNum = parseFloat(d);
      const bLower = qBhk.toLowerCase().trim();
      if (bLower.includes('it park') || bLower.includes('tech park')) {
        criteria.typologyIntent = 'commercial_office';
      } else if (bLower.includes('hospital') || bLower.includes('medical') || bLower.includes('healthcare') || bLower.includes('clinic')) {
        criteria.typologyIntent = 'healthcare_hospital';
      } else if (bLower.includes('shop') || bLower.includes('showroom') || bLower.includes('retail') || bLower.includes('store') || bLower.includes('boutique')) {
        criteria.typologyIntent = 'commercial_showroom';
      } else if (bLower.includes('industrial') || bLower.includes('factory') || bLower.includes('warehouse') || bLower.includes('godown') || bLower.includes('shed')) {
        criteria.typologyIntent = 'industrial';
      } else if (bLower.includes('plot') || bLower.includes('land')) {
        criteria.typologyIntent = 'land_plot';
      } else if (bLower.includes('prelease') || bLower.includes('pre-lease') || bLower.includes('preleased') || bLower.includes('pre-rented')) {
        criteria.typologyIntent = 'preleased';
      } else if (bLower.includes('office') || bLower.includes('commercial office') || bLower.includes('coworking')) {
        criteria.typologyIntent = 'commercial_office';
      } else if (bLower.includes('bhk') || bLower.includes('apartment') || bLower.includes('flat') || bLower.includes('penthouse') || bLower.includes('villa') || bLower.includes('bungalow') || bLower.includes('bunglow')) {
        criteria.typologyIntent = 'residential';
      }
      criteria.hasSpecificIntent = true;
    }

    if (criteria.hasSpecificIntent || qSearch.trim() || (qLocality && qLocality !== 'All') || (qBhk && qBhk !== 'All')) {
      const qTokens = qSearch.toLowerCase().trim().split(/\s+/).filter(Boolean);
      list = list
        .map((p) => ({ p, score: scorePropertyMatch(p, criteria) }))
        .filter((item) => {
          if (item.score <= 0) return false;
          if (qTokens.length > 0 && !criteria.locality && !criteria.bhkNum) {
            const bpText = (item.p.businessPurposes || []).map((bp) => `${bp.name} ${bp.slug}`).join(' ');
            const text = `${item.p.name || ''} ${item.p.developer || ''} ${item.p.locality || ''} ${item.p.location || ''} ${item.p.description || ''} ${item.p.bhk || ''} ${bpText}`.toLowerCase();
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

    // Direct Typography / Configuration exact filtering
    if (qBhk && qBhk !== 'All') {
      const lower = qBhk.toLowerCase().trim();
      if (lower.includes('it park') || lower.includes('tech park')) {
        list = list.filter((p) => {
          const full = `${p.configuration || ''} ${p.bhk || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
          return full.includes('it park') || full.includes('tech park');
        });
      } else if (lower.includes('hospital') || lower.includes('medical') || lower.includes('healthcare') || lower.includes('clinic')) {
        list = list.filter((p) => {
          const full = `${p.configuration || ''} ${p.bhk || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
          return full.includes('hospital') || full.includes('medical') || full.includes('clinic') || full.includes('healthcare');
        });
      } else if (lower.includes('shop') || lower.includes('showroom') || lower.includes('retail') || lower.includes('store') || lower.includes('boutique')) {
        list = list.filter((p) => {
          const full = `${p.configuration || ''} ${p.bhk || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
          return (
            full.includes('shop') ||
            full.includes('showroom') ||
            full.includes('retail') ||
            full.includes('store') ||
            full.includes('boutique') ||
            (p.isCommercial && (p.configuration?.toLowerCase().includes('shop') || p.bhk?.toLowerCase().includes('shop')))
          );
        });
      } else if (lower.includes('industrial') || lower.includes('factory') || lower.includes('warehouse') || lower.includes('godown') || lower.includes('shed') || lower.includes('manufacturing')) {
        list = list.filter((p) => {
          const full = `${p.configuration || ''} ${p.bhk || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
          return (
            full.includes('industrial') ||
            full.includes('factory') ||
            full.includes('warehouse') ||
            full.includes('godown') ||
            full.includes('shed') ||
            full.includes('manufacturing')
          );
        });
      } else if (lower.includes('office') || lower.includes('commercial office') || lower.includes('coworking')) {
        list = list.filter((p) => {
          const full = `${p.configuration || ''} ${p.bhk || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
          return (
            full.includes('office') ||
            full.includes('commercial office') ||
            full.includes('coworking') ||
            (p.isCommercial &&
              !full.includes('shop') &&
              !full.includes('showroom') &&
              !full.includes('industrial') &&
              !full.includes('factory') &&
              !full.includes('warehouse') &&
              !full.includes('hospital'))
          );
        });
      } else if (lower.includes('penthouse')) {
        list = list.filter((p) => {
          const full = `${p.configuration || ''} ${p.bhk || ''} ${p.name || ''}`.toLowerCase();
          return full.includes('penthouse') || full.includes('sky suite');
        });
      } else if (lower.includes('villa') || lower.includes('bungalow') || lower.includes('bunglow') || lower.includes('row house')) {
        list = list.filter((p) => {
          const full = `${p.configuration || ''} ${p.bhk || ''} ${p.name || ''}`.toLowerCase();
          return full.includes('villa') || full.includes('bungalow') || full.includes('bunglow') || full.includes('row house');
        });
      } else if (lower.includes('plot') || lower.includes('land')) {
        list = list.filter((p) => {
          const full = `${p.configuration || ''} ${p.bhk || ''} ${p.name || ''}`.toLowerCase();
          return full.includes('plot') || full.includes('land');
        });
      } else if (lower.includes('prelease') || lower.includes('pre-lease') || lower.includes('preleased') || lower.includes('pre-rented')) {
        list = list.filter((p) => {
          const full = `${p.configuration || ''} ${p.bhk || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
          return full.includes('prelease') || full.includes('pre-lease') || full.includes('preleased') || full.includes('pre-rented') || full.includes('yield');
        });
      } else {
        const num = lower.match(/\d+(?:\.5)?/)?.[0];
        if (num) {
          const parsed = parseFloat(num);
          list = list.filter((p) => {
            const full = `${p.configuration || ''} ${p.bhk || ''}`.toLowerCase();
            return p.bhkNum === parsed || full.includes(`${num} bhk`) || full.includes(`${num}bhk`);
          });
        } else {
          // Robust token match for any other custom category
          const cleanTokens = lower.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter((t) => t.length >= 3);
          if (cleanTokens.length > 0) {
            list = list.filter((p) => {
              const full = `${p.configuration || ''} ${p.bhk || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
              return cleanTokens.some((t) => full.includes(t));
            });
          }
        }
      }
    }

    // Direct Locality exact/substring filtering
    if (qLocality && qLocality !== 'All') {
      const lowerLoc = qLocality.toLowerCase();
      list = list.filter((p) => {
        const full = `${p.locality || ''} ${p.location || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
        return full.includes(lowerLoc);
      });
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

    // Business Purpose Filtering (Exact slug, ID, or name match)
    if (qPurpose && qPurpose !== 'All' && qPurpose !== 'all') {
      const pLower = qPurpose.toLowerCase().trim();
      list = list.filter((p) => {
        if (!p.businessPurposes || p.businessPurposes.length === 0) return false;
        return p.businessPurposes.some(
          (bp) =>
            bp.slug.toLowerCase() === pLower ||
            String(bp.id) === pLower ||
            bp.name.toLowerCase() === pLower
        );
      });
    }

    // Transaction Type Filtering (Buy vs Rent)
    if (qTransactionType && qTransactionType !== 'All' && qTransactionType !== 'all') {
      const ttLower = qTransactionType.toLowerCase().trim();
      if (ttLower.includes('rent') || ttLower.includes('lease')) {
        list = list.filter((p) => {
          const lt = String(p.listingType || '').toLowerCase();
          return lt.includes('rent') || lt.includes('lease');
        });
      } else if (ttLower.includes('buy') || ttLower.includes('sale')) {
        list = list.filter((p) => {
          const lt = String(p.listingType || '').toLowerCase();
          return lt.includes('sale') || lt.includes('buy') || !p.listingType;
        });
      }
    }

    return list;
  };

  // Helper rank function for configuration / typography sorting
  const getTypologySortRank = (p: PropertyItem): number => {
    if (p.bhkNum && p.bhkNum > 0) return p.bhkNum;
    const str = `${p.configuration || ''} ${p.bhk || ''}`.toLowerCase();
    if (str.includes('1 bhk') || str.includes('1bhk')) return 1;
    if (str.includes('2 bhk') || str.includes('2bhk')) return 2;
    if (str.includes('3 bhk') || str.includes('3bhk')) return 3;
    if (str.includes('4 bhk') || str.includes('4bhk')) return 4;
    if (str.includes('penthouse') || str.includes('sky')) return 5;
    if (str.includes('villa') || str.includes('bungalow') || str.includes('bunglow') || str.includes('estate')) return 6;
    if (str.includes('office')) return 10;
    if (str.includes('shop') || str.includes('showroom') || str.includes('retail')) return 11;
    if (str.includes('restaurant')) return 12;
    if (str.includes('hotel') || str.includes('resort')) return 13;
    if (str.includes('hospital') || str.includes('medical') || str.includes('clinic')) return 14;
    if (str.includes('industrial') || str.includes('factory') || str.includes('shed') || str.includes('manufacturing')) return 15;
    if (str.includes('warehouse') || str.includes('godown')) return 16;
    if (str.includes('plot') || str.includes('land')) return 17;
    return 25;
  };

  // Live Instant Filtering: When ANY search or filter dropdown changes, immediately filter and show properties in front!
  const sortedProperties = useMemo(() => {
    const q = (deferredQuery || '').trim();
    let list = filterClientSide(q, selectedLocality, selectedBhk, selectedPriceRange, selectedStatus, selectedPurpose, selectedTransactionType);

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
    } else if (sortBy === 'typography_asc') {
      list.sort((a, b) => {
        const valA = (a.configuration || a.bhk || '').trim();
        const valB = (b.configuration || b.bhk || '').trim();
        return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
      });
    } else if (sortBy === 'typography_desc') {
      list.sort((a, b) => {
        const valA = (a.configuration || a.bhk || '').trim();
        const valB = (b.configuration || b.bhk || '').trim();
        return valB.localeCompare(valA, undefined, { numeric: true, sensitivity: 'base' });
      });
    } else if (sortBy === 'bhk_asc') {
      list.sort((a, b) => {
        const rankA = getTypologySortRank(a);
        const rankB = getTypologySortRank(b);
        if (rankA !== rankB) return rankA - rankB;
        return (a.configuration || a.bhk || '').localeCompare(b.configuration || b.bhk || '');
      });
    } else if (sortBy === 'bhk_desc') {
      list.sort((a, b) => {
        const rankA = getTypologySortRank(a);
        const rankB = getTypologySortRank(b);
        if (rankA !== rankB) return rankB - rankA;
        return (b.configuration || b.bhk || '').localeCompare(a.configuration || a.bhk || '');
      });
    } else if (sortBy === 'status_ready') {
      list.sort((a, b) => (b.status?.toLowerCase().includes('ready') ? 1 : 0) - (a.status?.toLowerCase().includes('ready') ? 1 : 0));
    }
    return list;
  }, [initialProperties, properties, deferredQuery, selectedLocality, selectedBhk, selectedPriceRange, selectedStatus, selectedPurpose, selectedTransactionType, sortBy]);

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
    purpose?: string;
    transactionType?: string;
  }) => {
    setIsSearching(true);
    setShowAllBlogs(false);

    const isDirectBarSearch =
      overrideParams === undefined ||
      (overrideParams.search !== undefined && overrideParams.bhk === undefined && overrideParams.locality === undefined && overrideParams.purpose === undefined);

    let qSearch = overrideParams?.search !== undefined ? overrideParams.search : (catalogueSearch || searchQuery);
    setActiveFilterQuery(qSearch.trim());
    let qLocality = overrideParams?.locality !== undefined ? overrideParams.locality : selectedLocality;
    let qBhk = overrideParams?.bhk !== undefined ? overrideParams.bhk : selectedBhk;
    let qPrice = overrideParams?.priceRange !== undefined ? overrideParams.priceRange : selectedPriceRange;
    let qStatus = overrideParams?.status !== undefined ? overrideParams.status : selectedStatus;
    let qPurpose = overrideParams?.purpose !== undefined ? overrideParams.purpose : selectedPurpose;
    let qTransactionType = overrideParams?.transactionType !== undefined ? overrideParams.transactionType : selectedTransactionType;

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
      if (qPurpose && qPurpose !== 'All') params.set('purpose', qPurpose);
      if (qTransactionType && qTransactionType !== 'All') params.set('transactionType', qTransactionType);

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
        const fallbackMatched = filterClientSide(qSearch, qLocality, qBhk, qPrice, qStatus, qPurpose, qTransactionType);
        setProperties(fallbackMatched);
      }

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('search-results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.log('Search fallback:', err);
      const fallbackMatched = filterClientSide(qSearch, qLocality, qBhk, qPrice, qStatus, qPurpose, qTransactionType);
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
    setBuyerLocalityFilter('All');
    setSelectedBhk('All');
    setBuyerBhkFilter('All');
    setSelectedPriceRange('All');
    setSelectedStatus('All');
    setSelectedPurpose('All');
    setSelectedTransactionType('All');
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
        className={`w-full max-w-full ${isDedicatedSearchPage ? 'pt-32' : 'pt-6 sm:pt-8'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          {/* ================= SEARCH BAR ONLY ================= */}
          <div
            id="properties-search-bar"
            className="sticky top-[58px] sm:top-[74px] z-40 w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-md hover:shadow-lg border border-zinc-200/90 p-3 sm:p-4 mb-8 transition-all"
          >
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-950 text-white select-none cursor-default shadow-xs"
                  title="Total properties matching search"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Properties ({sortedProperties.length})</span>
                </span>

                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-zinc-950 select-none cursor-default shadow-xs"
                  title="Total buyers registered in Pune"
                >
                  <Users className="w-3.5 h-3.5 text-zinc-950" />
                  <span>Buyers ({filteredCatalogueBuyerDemands.length})</span>
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

          {/* ================= SECTION 1: VERIFIED PROPERTIES ================= */}
          <div id="properties-section" className="space-y-6">
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
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-zinc-700 whitespace-nowrap">Property & Developer</span>
                              <div className="relative inline-flex items-center justify-center cursor-pointer group">
                                <select
                                  value={['name_asc', 'name_desc', 'developer_asc'].includes(sortBy) ? sortBy : ''}
                                  onChange={(e) => setSortBy(e.target.value || 'relevance')}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  title="Sort by Property Name or Developer"
                                >
                                  <option value="">Default Sort</option>
                                  <option value="name_asc">Name: A → Z</option>
                                  <option value="name_desc">Name: Z → A</option>
                                  <option value="developer_asc">Developer: A → Z</option>
                                </select>
                                <ChevronDown className={`w-3.5 h-3.5 transition pointer-events-none ${
                                  ['name_asc', 'name_desc', 'developer_asc'].includes(sortBy)
                                    ? 'text-amber-600'
                                    : 'text-zinc-400 group-hover:text-zinc-700'
                                }`} />
                              </div>
                            </div>
                          </th>

                          {/* 2. Locality */}
                          <th className="px-5 py-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-zinc-700 whitespace-nowrap">Locality</span>
                              <div className="relative inline-flex items-center justify-center cursor-pointer group">
                                <select
                                  value={
                                    selectedLocality !== 'All'
                                      ? `filter:${selectedLocality}`
                                      : ['locality_asc', 'locality_desc'].includes(sortBy)
                                      ? `sort:${sortBy}`
                                      : ''
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val.startsWith('filter:')) {
                                      const loc = val.replace('filter:', '');
                                      setSelectedLocality(loc);
                                    } else if (val.startsWith('sort:')) {
                                      const sortVal = val.replace('sort:', '');
                                      setSortBy(sortVal);
                                    } else {
                                      setSelectedLocality('All');
                                      if (['locality_asc', 'locality_desc'].includes(sortBy)) {
                                        setSortBy('relevance');
                                      }
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  title="Select Locality or Sort Properties"
                                >
                                  <option value="">All Locations (Default)</option>

                                  <optgroup label="Locations in Catalog">
                                    {availableLocalities
                                      .filter((loc) => loc !== 'All')
                                      .map((loc) => (
                                        <option key={loc} value={`filter:${loc}`}>
                                          {loc}
                                        </option>
                                      ))}
                                  </optgroup>

                                  <optgroup label="Sort by Locality">
                                    <option value="sort:locality_asc">Locality: A → Z</option>
                                    <option value="sort:locality_desc">Locality: Z → A</option>
                                  </optgroup>
                                </select>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition pointer-events-none ${
                                    selectedLocality !== 'All' ||
                                    ['locality_asc', 'locality_desc'].includes(sortBy)
                                      ? 'text-amber-600 font-bold'
                                      : 'text-zinc-400 group-hover:text-zinc-700'
                                  }`}
                                />
                              </div>
                              {selectedLocality !== 'All' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                  <span>{selectedLocality}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedLocality('All');
                                    }}
                                    className="text-amber-700 hover:text-black cursor-pointer font-black"
                                    title="Clear location filter"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                            </div>
                          </th>

                          {/* 3. Typography */}
                          <th className="px-5 py-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-zinc-700 whitespace-nowrap">Typography</span>
                              <div className="relative inline-flex items-center justify-center cursor-pointer group">
                                <select
                                  value={
                                    selectedBhk !== 'All'
                                      ? `filter:${selectedBhk}`
                                      : ['bhk_asc', 'bhk_desc', 'typography_asc', 'typography_desc', 'size_high', 'size_low'].includes(sortBy)
                                      ? `sort:${sortBy}`
                                      : ''
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val.startsWith('filter:')) {
                                      const bhkVal = val.replace('filter:', '');
                                      setSelectedBhk(bhkVal);
                                    } else if (val.startsWith('sort:')) {
                                      const sortVal = val.replace('sort:', '');
                                      setSortBy(sortVal);
                                    } else {
                                      setSelectedBhk('All');
                                      if (['bhk_asc', 'bhk_desc', 'typography_asc', 'typography_desc', 'size_high', 'size_low'].includes(sortBy)) {
                                        setSortBy('relevance');
                                      }
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  title="Select Configuration or Sort Properties"
                                >
                                  <option value="">All Configurations (Default)</option>

                                  <optgroup label="Residential Configurations">
                                    <option value="filter:1 BHK">1 BHK</option>
                                    <option value="filter:2 BHK">2 BHK</option>
                                    <option value="filter:3 BHK">3 BHK</option>
                                    <option value="filter:4 BHK">4 BHK</option>
                                    <option value="filter:4.5+ BHK Penthouse">4.5+ BHK Penthouse</option>
                                    <option value="filter:Residential Apartment">Residential Apartment</option>
                                    <option value="filter:Residential Bunglow">Residential Bungalow / Villa</option>
                                  </optgroup>

                                  <optgroup label="Commercial & Retail">
                                    <option value="filter:Office in IT Park">Office in IT Park</option>
                                    <option value="filter:Commercial Office">Commercial Office Space</option>
                                    <option value="filter:Shop/Showroom">Shop / Showroom</option>
                                    <option value="filter:Preleased Properties">Preleased Properties</option>
                                    <option value="filter:Restaurant">Restaurant / F&B</option>
                                  </optgroup>

                                  <optgroup label="Healthcare & Industrial">
                                    <option value="filter:Hospital / Healthcare">Hospital / Healthcare</option>
                                    <option value="filter:Industrial Factory">Industrial Factory</option>
                                    <option value="filter:Warehouse">Warehouse / Logistics</option>
                                    <option value="filter:Plot/Land">Land / Plot</option>
                                  </optgroup>

                                  {otherTypologies.length > 0 && (
                                    <optgroup label="Other Typologies in Catalog">
                                      {otherTypologies.map((t) => (
                                        <option key={t.value} value={`filter:${t.value}`}>
                                          {t.label || t.value}
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}

                                  <optgroup label="Sort Configuration & Typography">
                                    <option value="sort:typography_asc">Typography: A → Z</option>
                                    <option value="sort:typography_desc">Typography: Z → A</option>
                                    <option value="sort:bhk_asc">Configuration: 1 BHK → Penthouse</option>
                                    <option value="sort:bhk_desc">Configuration: Penthouse → 1 BHK</option>
                                    <option value="sort:size_high">Carpet Area: Largest First</option>
                                    <option value="sort:size_low">Carpet Area: Smallest First</option>
                                  </optgroup>
                                </select>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition pointer-events-none ${
                                    selectedBhk !== 'All' ||
                                    ['size_high', 'size_low', 'bhk_asc', 'bhk_desc', 'typography_asc', 'typography_desc'].includes(sortBy)
                                      ? 'text-amber-600 font-bold'
                                      : 'text-zinc-400 group-hover:text-zinc-700'
                                  }`}
                                />
                              </div>
                              {selectedBhk !== 'All' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                  <span>{selectedBhk}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedBhk('All');
                                    }}
                                    className="text-amber-700 hover:text-black cursor-pointer font-black"
                                    title="Clear configuration filter"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                            </div>
                          </th>

                          {/* 4. Price & Status */}
                          <th className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-zinc-700 whitespace-nowrap">Price & Status</span>
                              <div className="relative inline-flex items-center justify-center cursor-pointer group">
                                <select
                                  value={['price_low', 'price_high'].includes(sortBy) ? sortBy : ''}
                                  onChange={(e) => setSortBy(e.target.value || 'relevance')}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  title="Sort by Price"
                                >
                                  <option value="">Default Sort</option>
                                  <option value="price_low">Price: Low to High</option>
                                  <option value="price_high">Price: High to Low</option>
                                </select>
                                <ChevronDown className={`w-3.5 h-3.5 transition pointer-events-none ${
                                  ['price_low', 'price_high'].includes(sortBy)
                                    ? 'text-amber-600'
                                    : 'text-zinc-400 group-hover:text-zinc-700'
                                }`} />
                              </div>
                            </div>
                          </th>

                          {/* 5. Site Visit */}
                          <th className="px-5 py-3 text-right font-bold text-zinc-700 whitespace-nowrap">Site Visit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {displayedComparisonProperties.map((row) => (
                          <tr
                            key={row.id}
                            onMouseEnter={(e) => handleTablePropertyHover(e, row)}
                            onMouseLeave={handleTablePropertyLeave}
                            className="hover:bg-amber-50/50 transition-colors group cursor-pointer"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <Link
                                  href={getPropertyUrl(row)}
                                  className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-zinc-200 group-hover:border-amber-400/80 shadow-2xs bg-zinc-100 block"
                                  title={`View details for ${row.name}`}
                                >
                                  <Image
                                    src={
                                      row.image ||
                                      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                    }
                                    alt={row.name}
                                    fill
                                    unoptimized
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                </Link>
                                <div className="min-w-0">
                                  <Link
                                    href={getPropertyUrl(row)}
                                    className="font-bold text-zinc-900 group-hover:text-amber-700 hover:underline block truncate max-w-xs sm:max-w-sm"
                                  >
                                    {row.name}
                                  </Link>
                                  {row.developer &&
                                    !/anv\s*(signature\s*partner|verified\s*developer|partner\s*developer)/i.test(row.developer) && (
                                    <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                                      {row.developer}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="font-semibold text-zinc-800">{row.locality || 'Pune'}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-zinc-800">{row.configuration || row.bhk}</div>
                              <div className="text-[10px] text-zinc-400 font-medium">{cleanSqft(row.sqft)}</div>
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

                  {/* FLOATING HOVER DETAILS PREVIEW CARD */}
                  {hoveredTableProperty && (
                    <div
                      style={{
                        position: 'fixed',
                        top: `${hoveredTableProperty.y}px`,
                        left: `${hoveredTableProperty.x}px`,
                        width: '350px'
                      }}
                      className="hidden sm:flex z-[75] bg-white rounded-2xl shadow-2xl border border-amber-300/90 ring-1 ring-black/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex-col pointer-events-auto"
                      onMouseEnter={() => {
                        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                      }}
                      onMouseLeave={() => {
                        hoverTimerRef.current = setTimeout(() => {
                          setHoveredTableProperty(null);
                        }, 220);
                      }}
                    >
                      {/* Top Preview Image */}
                      <div className="relative w-full h-36 bg-zinc-950 overflow-hidden shrink-0">
                        <Image
                          src={
                            hoveredTableProperty.property.image ||
                            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                          }
                          alt={hoveredTableProperty.property.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                        {/* Badges on preview image */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md shadow-xs ${
                              hoveredTableProperty.property.isCommercial ||
                              hoveredTableProperty.property.bhk.includes('Commercial')
                                ? 'bg-blue-950/90 text-blue-200 border border-blue-400/40'
                                : 'bg-zinc-950/90 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {hoveredTableProperty.property.isCommercial ||
                            hoveredTableProperty.property.bhk.includes('Commercial')
                              ? 'Commercial'
                              : 'Verified Listing'}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-900/90 text-white backdrop-blur-md uppercase tracking-wider">
                            {hoveredTableProperty.property.status}
                          </span>
                        </div>

                        {/* Price on preview image */}
                        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
                          <div className="text-lg font-black text-white tracking-tight drop-shadow-sm">
                            {formatPriceDisplay(hoveredTableProperty.property.price)}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                            Zero Brokerage
                          </span>
                        </div>
                      </div>

                      {/* Details Content Body */}
                      <div className="p-3.5 flex flex-col gap-2.5">
                        <div>
                          <h4 className="font-extrabold text-sm text-zinc-950 line-clamp-1">
                            {hoveredTableProperty.property.name}
                          </h4>
                          <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-0.5">
                            <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{hoveredTableProperty.property.location}</span>
                          </div>
                        </div>

                        {/* Specifications Grid */}
                        <div className="grid grid-cols-2 gap-2 p-2 bg-zinc-50 rounded-xl border border-zinc-100 text-xs">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">Typology</span>
                            <span className="font-extrabold text-zinc-900 truncate block text-[11px]">
                              {hoveredTableProperty.property.configuration || hoveredTableProperty.property.bhk}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">Carpet Area</span>
                            <span className="font-extrabold text-zinc-900 block text-[11px]">
                              {cleanSqft(hoveredTableProperty.property.sqft)}
                            </span>
                          </div>
                          {hoveredTableProperty.property.developer &&
                            !/anv\s*(signature\s*partner|verified\s*developer|partner\s*developer)/i.test(hoveredTableProperty.property.developer) && (
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">Developer</span>
                              <span className="font-semibold text-zinc-800 truncate block text-[11px]">
                                {hoveredTableProperty.property.developer}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">MahaRERA</span>
                            <span className="font-mono font-bold text-emerald-700 text-[10px] truncate block">
                              {hoveredTableProperty.property.reraNumber || 'Verified Registered'}
                            </span>
                          </div>
                        </div>

                        {/* Short Description */}
                        <p className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed">
                          {hoveredTableProperty.property.description}
                        </p>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDetailsProperty(hoveredTableProperty.property);
                              setDetailsModalOpen(true);
                              setHoveredTableProperty(null);
                            }}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Quick Specs</span>
                          </button>
                          <Link
                            href={getPropertyUrl(hoveredTableProperty.property)}
                            className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition flex items-center justify-center gap-1 shadow-xs"
                          >
                            <span>Explore</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

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
                        onQuickView={(p) => {
                          setSelectedDetailsProperty(p);
                          setDetailsModalOpen(true);
                        }}
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
              ) : isUserSeller(catalogueSearch || searchQuery) ? (
                <div className="bg-amber-50/70 rounded-3xl border border-amber-300/80 p-8 sm:p-10 text-center space-y-4 shadow-sm w-full max-w-2xl mx-auto my-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
                    <Users className="w-7 h-7 text-amber-700" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                      Seller Query Detected
                    </h3>
                    <p className="text-zinc-600 text-xs sm:text-sm font-medium">
                      Looking for buyers for your property? Active buyers are displayed in the <strong>Buyers Table</strong> right below.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href="#buyers-section"
                      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-6 py-3 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Scroll to Buyer Table ({filteredCatalogueBuyerDemands.length} Buyers)</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBuyerRefForConnect(undefined);
                        setSelectedBuyerSummaryForConnect(undefined);
                        setSellerModalOpen(true);
                      }}
                      className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-6 py-3 rounded-xl text-xs transition cursor-pointer"
                    >
                      Register My Property
                    </button>
                  </div>
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

          {/* ================= SECTION 2: BUYERS ================= */}
          <div id="buyers-section" className="space-y-8 pt-12 border-t border-zinc-200/90">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                  Active Buyers
                </h3>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBuyerRefForConnect(undefined);
                    setSelectedBuyerSummaryForConnect(undefined);
                    setSellerModalOpen(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Register Property to Match Buyers</span>
                </button>

                <a
                  href="tel:+919373020701"
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>93730 20701</span>
                </a>
              </div>
            </div>

            {/* ================= BUYERS COMPARISON TABLE ================= */}
            {sortedBuyerDemands.length > 0 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden w-full max-w-full">
                <div className="bg-zinc-950 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight text-white">
                      <Users className="w-5 h-5 text-amber-400" />
                      <span>
                        {sortedBuyerDemands.length} {sortedBuyerDemands.length === 1 ? 'Buyer' : 'Buyers'} Found
                      </span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBuyerRefForConnect(undefined);
                        setSelectedBuyerSummaryForConnect(undefined);
                        setSellerModalOpen(true);
                      }}
                      className="text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Match My Property</span>
                    </button>

                    <a
                      href="tel:+919373020701"
                      className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Helpline</span>
                    </a>
                  </div>
                </div>

                <div className="overflow-x-auto text-xs w-full">
                  <table className="w-full text-left min-w-[760px]">
                    <thead className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
                      <tr>
                        {/* 1. Buyer & Reference */}
                        <th className="px-5 py-3">
                          <span className="font-bold text-zinc-700 whitespace-nowrap">Buyer & Reference</span>
                        </th>

                        {/* 2. Target Locality */}
                        <th className="px-5 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-zinc-700 whitespace-nowrap">Target Locality</span>
                            <div className="relative inline-flex items-center justify-center cursor-pointer group">
                              <select
                                value={
                                  buyerLocalityFilter !== 'All'
                                    ? `filter:${buyerLocalityFilter}`
                                    : ['locality_asc', 'locality_desc'].includes(buyerSortBy)
                                    ? `sort:${buyerSortBy}`
                                    : ''
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val.startsWith('filter:')) {
                                    setBuyerLocalityFilter(val.replace('filter:', ''));
                                  } else if (val.startsWith('sort:')) {
                                    setBuyerSortBy(val.replace('sort:', ''));
                                  } else {
                                    setBuyerLocalityFilter('All');
                                    if (['locality_asc', 'locality_desc'].includes(buyerSortBy)) {
                                      setBuyerSortBy('relevance');
                                    }
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                title="Filter or Sort by Target Locality"
                              >
                                <option value="all">All Locations (Default)</option>
                                <optgroup label="Locations in Demand">
                                  {availableLocalities
                                    .filter((loc) => loc !== 'All')
                                    .map((loc) => (
                                      <option key={loc} value={`filter:${loc}`}>
                                        {loc}
                                      </option>
                                    ))}
                                </optgroup>
                                <optgroup label="Sort by Locality">
                                  <option value="sort:locality_asc">Locality: A → Z</option>
                                  <option value="sort:locality_desc">Locality: Z → A</option>
                                </optgroup>
                              </select>
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition pointer-events-none ${
                                  buyerLocalityFilter !== 'All' ||
                                  ['locality_asc', 'locality_desc'].includes(buyerSortBy)
                                    ? 'text-amber-600 font-bold'
                                    : 'text-zinc-400 group-hover:text-zinc-700'
                                }`}
                              />
                            </div>
                            {buyerLocalityFilter !== 'All' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                <span>{buyerLocalityFilter}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setBuyerLocalityFilter('All');
                                  }}
                                  className="text-amber-700 hover:text-black cursor-pointer font-black"
                                  title="Clear location filter"
                                >
                                  ×
                                </button>
                              </span>
                            )}
                          </div>
                        </th>

                        {/* 3. Typography */}
                        <th className="px-5 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-zinc-700 whitespace-nowrap">Typography</span>
                            <div className="relative inline-flex items-center justify-center cursor-pointer group">
                              <select
                                value={
                                  buyerBhkFilter !== 'All'
                                    ? `filter:${buyerBhkFilter}`
                                    : ['bhk_asc', 'bhk_desc', 'typography_asc', 'typography_desc'].includes(buyerSortBy)
                                    ? `sort:${buyerSortBy}`
                                    : ''
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val.startsWith('filter:')) {
                                    setBuyerBhkFilter(val.replace('filter:', ''));
                                  } else if (val.startsWith('sort:')) {
                                    setBuyerSortBy(val.replace('sort:', ''));
                                  } else {
                                    setBuyerBhkFilter('All');
                                    if (['bhk_asc', 'bhk_desc', 'typography_asc', 'typography_desc'].includes(buyerSortBy)) {
                                      setBuyerSortBy('relevance');
                                    }
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                title="Filter or Sort by Typography / Configuration"
                              >
                                <option value="all">All Configurations (Default)</option>
                                <optgroup label="Configuration / Typology">
                                  <option value="filter:Office in IT Park">Office in IT Park / Commercial</option>
                                  <option value="filter:Commercial Office">Commercial Office / Workspace</option>
                                  <option value="filter:Shop/Showroom">Shop / Showroom</option>
                                  <option value="filter:Hospital / Healthcare">Hospital / Healthcare</option>
                                  <option value="filter:Industrial Factory">Industrial / Warehouse</option>
                                  <option value="filter:1 BHK">1 BHK</option>
                                  <option value="filter:2 BHK">2 BHK</option>
                                  <option value="filter:3 BHK">3 BHK</option>
                                  <option value="filter:4 BHK">4 BHK / Luxury Penthouse</option>
                                </optgroup>
                                <optgroup label="Sort Configuration & Typography">
                                  <option value="sort:typography_asc">Typography: A → Z</option>
                                  <option value="sort:typography_desc">Typography: Z → A</option>
                                  <option value="sort:bhk_asc">Configuration: Low → High</option>
                                  <option value="sort:bhk_desc">Configuration: High → Low</option>
                                </optgroup>
                              </select>
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition pointer-events-none ${
                                  buyerBhkFilter !== 'All' || ['bhk_asc', 'bhk_desc', 'typography_asc', 'typography_desc'].includes(buyerSortBy)
                                    ? 'text-amber-600 font-bold'
                                    : 'text-zinc-400 group-hover:text-zinc-700'
                                }`}
                              />
                            </div>
                            {buyerBhkFilter !== 'All' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                <span>{buyerBhkFilter}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setBuyerBhkFilter('All');
                                  }}
                                  className="text-amber-700 hover:text-black cursor-pointer font-black"
                                  title="Clear configuration filter"
                                >
                                  ×
                                </button>
                              </span>
                            )}
                          </div>
                        </th>

                        {/* 4. Budget & Purpose */}
                        <th className="px-5 py-3">
                          <span className="font-bold text-zinc-700 whitespace-nowrap">Budget & Purpose</span>
                        </th>

                        {/* 5. Requirement Brief */}
                        <th className="px-5 py-3">
                          <span className="font-bold text-zinc-700 whitespace-nowrap">Requirement Brief</span>
                        </th>

                        {/* 6. Action */}
                        <th className="px-5 py-3 text-right font-bold text-zinc-700 whitespace-nowrap">Match / Connect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {displayedComparisonBuyers.map((demand) => (
                        <tr key={demand.id} className="hover:bg-amber-50/30 transition">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-zinc-900">{demand.maskedName}</div>
                            <div className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded mt-0.5">
                              Ref: {demand.referenceCode}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-zinc-800">{demand.locality}</div>
                            <div className="text-[10px] text-zinc-400">Pune</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-zinc-900">{demand.bhk}</div>
                            <div className="text-[10px] text-zinc-500">Timeline: {demand.timeline}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-black text-amber-700">{demand.budget}</div>
                            <div className="text-[10px] text-zinc-500">{demand.purpose}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-zinc-600 text-xs line-clamp-2 max-w-xs leading-snug">
                              {demand.requirements}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBuyerRefForConnect(demand.referenceCode);
                                  setSelectedBuyerSummaryForConnect(`${demand.bhk} in ${demand.locality} (${demand.budget})`);
                                  setSellerModalOpen(true);
                                }}
                                className="bg-zinc-950 hover:bg-amber-600 hover:text-zinc-950 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition inline-flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                              >
                                <span>Connect</span>
                                <ArrowRight className="w-3 h-3 text-amber-400" />
                              </button>
                              <a
                                href="tel:+919373020701"
                                className="bg-amber-100 hover:bg-amber-200 text-zinc-900 p-1.5 rounded-lg transition"
                                title="Call helpline for this buyer"
                              >
                                <Phone className="w-3 h-3 text-zinc-800" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {sortedBuyerDemands.length > 5 && (
                  <div className="p-4 bg-zinc-50 border-t border-zinc-200 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllBuyerComparison(!showAllBuyerComparison)}
                      className="text-xs font-bold text-zinc-700 hover:text-zinc-950 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-zinc-200/90 shadow-2xs hover:bg-zinc-100 transition cursor-pointer"
                    >
                      <span>
                        {showAllBuyerComparison
                          ? 'Show Top 5 Buyers in Table'
                          : `Show All Buyers in Table (${sortedBuyerDemands.length - 5} More Available)`}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-zinc-600 transition-transform duration-200 ${
                          showAllBuyerComparison ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-zinc-200/90 p-10 text-center space-y-4 shadow-sm w-full max-w-xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <Search className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-zinc-950">0 Buyers Found</h4>
                  <p className="text-zinc-500 text-xs mt-1">Please modify your search or register your property to reach active buyers.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBuyerRefForConnect(undefined);
                    setSelectedBuyerSummaryForConnect(undefined);
                    setSellerModalOpen(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow transition cursor-pointer"
                >
                  Register Property for Buyer Matching
                </button>
              </div>
            )}

            {/* Helpline Banner */}
            <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-7 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 mx-auto md:mx-0">
                  <Phone className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Direct Seller & Buyer Desk</span>
                  <h4 className="text-base sm:text-lg font-bold text-white">Have a property matching these buyer profiles?</h4>
                  <p className="text-xs text-zinc-400">Our advisory team verifies and conducts confidential introductions between genuine property owners and ready buyers.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
                <a
                  href="tel:+919373020701"
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-6 py-3 rounded-xl text-xs transition flex items-center gap-2 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 93730 20701</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBuyerRefForConnect(undefined);
                    setSelectedBuyerSummaryForConnect(undefined);
                    setSellerModalOpen(true);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-xl text-xs transition border border-white/10 cursor-pointer"
                >
                  Register Property
                </button>
              </div>
            </div>

            {/* Buyer Showcase Cards */}
            {sortedBuyerDemands.length > 0 && (
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-extrabold text-zinc-950 tracking-tight">
                      Buyer Showcase
                    </h4>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      Detailed requirement briefs from genuine, pre-screened home buyers.
                    </p>
                  </div>
                  {sortedBuyerDemands.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllBuyerCards(!showAllBuyerCards)}
                      className="text-xs font-bold text-zinc-700 hover:text-zinc-950 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition cursor-pointer"
                    >
                      <span>{showAllBuyerCards ? 'Show Top 3 Cards' : `View All Cards (${sortedBuyerDemands.length})`}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-zinc-600 transition-transform duration-200 ${
                          showAllBuyerCards ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedCardBuyers.map((demand) => (
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

                {sortedBuyerDemands.length > 3 && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAllBuyerCards(!showAllBuyerCards)}
                      className="text-xs font-bold text-zinc-700 hover:text-zinc-950 inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-white border border-zinc-200/90 shadow-sm hover:bg-zinc-50 transition cursor-pointer"
                    >
                      <span>
                        {showAllBuyerCards
                          ? 'Show Top 3 Buyer Cards'
                          : `Show All Buyer Cards (${sortedBuyerDemands.length - 3} More Available)`}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-950 transition-transform duration-200 ${
                          showAllBuyerCards ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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

      {/* Property Full Specifications & Financials Modal */}
      <PropertyDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedDetailsProperty(null);
        }}
        property={selectedDetailsProperty}
        onInstantEnquiryClick={() => {
          if (selectedDetailsProperty) {
            setSelectedPropertyForEnquiry(selectedDetailsProperty);
            setConsultationModalOpen(true);
          }
        }}
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
