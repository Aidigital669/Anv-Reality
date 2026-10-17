'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Heart,
  User,
  Filter,
  ArrowRight,
  Grid,
  Scale,
  Building2,
  ShieldCheck,
  SlidersHorizontal,
  RotateCcw,
  Calendar,
  FileText,
  BadgeCheck,
  Check,
  Lock,
  Phone,
  PhoneCall,
  Sparkles,
  MessageSquare,
  Bot,
  Send,
  Store,
  ArrowUp,
  ExternalLink,
  X
} from 'lucide-react';
import {
  renderFormattedContent,
  MatchedPropertyPreview
} from '@/components/public/FloatingChatbot';
import { PropertyCardActions } from '@/components/public/PropertyCardActions';
import { InstantEnquiryModal } from '@/components/public/InstantEnquiryModal';
import { BespokePropertyRequirementModal } from '@/components/public/BespokePropertyRequirementModal';
import { PropertyNotFoundModal } from '@/components/public/PropertyNotFoundModal';
import { BuyerNotFoundModal } from '@/components/public/BuyerNotFoundModal';
import { SellerLeadCaptureModal } from '@/components/public/SellerLeadCaptureModal';
import { AuthInquiryModal } from '@/components/auth/AuthInquiryModal';
import { getClientSession } from '@/lib/user-auth';
import { getPropertySlug, getPropertyUrl } from '@/lib/slug';
import { getBestMatchingProperties } from '@/lib/property-matching';
import { findMatchingCategorySlug } from '@/lib/categories-data';
import { detectSellerTypologyAndLocality } from '@/lib/seller-intent';
import { isUnrelatedRealEstateQuery } from '@/lib/unrelated-query';

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

export interface HeroChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  actionType?: 'buyer_enquiry' | 'seller_enquiry' | 'whatsapp' | 'unrelated_search';
  matchedProperties?: MatchedPropertyPreview[];
  matchedBuyerDemands?: BuyerDemandItem[];
  sellerCategoryLabel?: string;
  sellerUnrecognizedTerm?: string;
  unrelatedQuery?: string;
  suggestedSearches?: string[];
}

export const REAL_ESTATE_SEARCH_SUGGESTIONS = [
  { label: '🏢 Commercial Office Spaces', query: 'Show me verified Grade-A Commercial Office spaces in Pune' },
  { label: '🏥 Medical & Hospital Premises', query: 'Show me verified Medical and Hospital premises in Pune' },
  { label: '🏠 3 & 4 BHK Luxury Residences', query: 'Show me verified 3 BHK and 4 BHK luxury residences in Pune' },
  { label: '🛍️ Prime Retail Showrooms', query: 'Show verified commercial showroom spaces in Pune' },
  { label: '📈 High-ROI Pre-Leased Assets', query: 'Show pre-leased commercial properties with guaranteed rental return in Pune' },
  { label: '📋 Sell Property / Match Buyers', query: 'I want to sell my property in Pune and match with active verified buyers' },
  { label: '📍 Baner & Balewadi Properties', query: 'Show verified properties available in Baner and Balewadi' },
  { label: '📍 Koregaon Park Luxury Homes', query: 'Show luxury properties and penthouses in Koregaon Park' }
];

export const QUICK_QUALIFYING_CHIPS = [
  {
    label: 'Showroom & Office',
    query: 'Show me verified Grade-A Showroom and Office spaces in Pune',
    bhk: 'Commercial Office',
    icon: 'Store',
    intent: 'commercial'
  },
  {
    label: '3 & 4 BHK Luxury',
    query: 'Show me verified 3 BHK and 4 BHK luxury residences in Pune',
    bhk: '3 BHK',
    icon: 'Building2',
    intent: 'residential'
  },
  {
    label: 'Sell Property / Match Buyers',
    query: 'I want to sell my property in Pune and match with active verified buyers',
    bhk: 'All',
    icon: 'User',
    intent: 'seller'
  },
  {
    label: 'High-ROI Pre-Leased',
    query: 'Show pre-leased commercial properties with guaranteed rental return in Pune',
    bhk: 'Commercial Office',
    icon: 'Sparkles',
    intent: 'investment'
  },
  {
    label: 'Baner & Balewadi',
    query: 'Show verified properties available in Baner and Balewadi',
    locality: 'Baner',
    icon: 'MapPin',
    intent: 'locality'
  },
  {
    label: 'Koregaon Park',
    query: 'Show luxury properties and penthouses in Koregaon Park',
    locality: 'Koregaon Park',
    icon: 'MapPin',
    intent: 'locality'
  }
];

export const CHATGPT_FEATURED_PROMPTS = [
  {
    title: 'Showroom & Office',
    desc: 'Explore Grade-A commercial workspaces, IT offices & retail showrooms in Pune',
    query: 'Show me verified Grade-A Showroom and Office spaces in Pune',
    bhk: 'Commercial Office',
    icon: 'Store',
    intent: 'commercial'
  },
  {
    title: '3 & 4 BHK Luxury Homes',
    desc: 'Browse verified high-end residences, sky villas & penthouses across Pune',
    query: 'Show me verified 3 BHK and 4 BHK luxury residences in Pune',
    bhk: '3 BHK',
    icon: 'Building2',
    intent: 'residential'
  },
  {
    title: 'Sell Property / Match Buyers',
    desc: 'Connect directly with verified active buyers seeking homes and commercial units',
    query: 'I want to sell my property in Pune and match with active verified buyers',
    bhk: 'All',
    icon: 'User',
    intent: 'seller'
  },
  {
    title: 'High-ROI Pre-Leased Assets',
    desc: 'Discover pre-rented commercial properties with guaranteed rental returns',
    query: 'Show pre-leased commercial properties with guaranteed rental return in Pune',
    bhk: 'Commercial Office',
    icon: 'Sparkles',
    intent: 'investment'
  }
];

interface HeroBuyerDemandsCardSectionProps {
  initialDemands: BuyerDemandItem[];
  allDemands: BuyerDemandItem[];
  categoryLabel?: string;
  unrecognizedTerm?: string;
  onConnectBuyer: (refCode: string, summary: string) => void;
}

function HeroBuyerDemandsCardSection({
  initialDemands,
  allDemands,
  categoryLabel,
  unrecognizedTerm,
  onConnectBuyer
}: HeroBuyerDemandsCardSectionProps) {
  const [filterQuery, setFilterQuery] = useState('');

  // Combined pool of all available verified buyer demands (initial matched + global database demands, deduplicated by referenceCode or id)
  const allAvailableDemands = useMemo(() => {
    const map = new Map<string, BuyerDemandItem>();
    (initialDemands || []).forEach((d) => map.set(d.referenceCode || d.id, d));
    (allDemands || []).forEach((d) => {
      const key = d.referenceCode || d.id;
      if (!map.has(key)) map.set(key, d);
    });
    return Array.from(map.values());
  }, [initialDemands, allDemands]);

  // Dynamically filter results when user searches
  const filteredDemands = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) {
      return initialDemands || [];
    }

    const tokens = q.split(/\s+/).filter(Boolean);

    return allAvailableDemands.filter((demand) => {
      const haystack = `${demand.referenceCode} ${demand.maskedName} ${demand.locality} ${demand.bhk} ${demand.budget} ${demand.requirements || ''} ${demand.purpose || ''}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }, [filterQuery, initialDemands, allAvailableDemands]);

  return (
    <div className="space-y-2.5 pt-1 w-full">
      {/* Header with Title & Live Match Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs font-bold text-zinc-700">
        <span className="flex items-center gap-1.5 text-amber-900">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            {categoryLabel
              ? `Active Verified Buyers Seeking ${categoryLabel}:`
              : initialDemands.length > 0
              ? 'Active Verified Buyer Mandates in Pune Database:'
              : 'Active Verified Buyers in Database:'}
          </span>
        </span>
        <span className="text-[11px] text-zinc-500 font-semibold shrink-0">
          {filteredDemands.length} {filteredDemands.length === 1 ? 'buyer' : 'buyers'} ready
          {filterQuery.trim() && ` for "${filterQuery.trim()}"`}
        </span>
      </div>

      {/* Small Search Bar on Top of These Cards */}
      <div className="relative flex items-center bg-zinc-50 hover:bg-zinc-100/90 focus-within:bg-white border border-amber-300/90 focus-within:border-amber-600 focus-within:ring-1 focus-within:ring-amber-500/20 rounded-xl px-2.5 py-1.5 transition-all shadow-2xs w-full">
        <Search className="w-3.5 h-3.5 text-amber-600 mr-2 shrink-0" />
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Search buyers by location (e.g. JM Road, Baner), typology (Office, 3 BHK), or budget..."
          className="w-full bg-transparent outline-none text-zinc-900 font-medium text-xs placeholder:text-zinc-400 py-0.5"
        />
        {filterQuery && (
          <button
            type="button"
            onClick={() => setFilterQuery('')}
            className="p-0.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition cursor-pointer shrink-0 ml-1.5"
            title="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Cards Grid: Instant results after search */}
      {filteredDemands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
          {filteredDemands.slice(0, 6).map((demand) => (
            <div
              key={demand.id}
              className="rounded-xl bg-white border border-amber-200/90 hover:border-amber-400 p-3 transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md">
                    Ref: {demand.referenceCode}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Verified Buyer</span>
                  </span>
                </div>
                <h4 className="text-xs font-bold text-zinc-950">
                  {demand.maskedName}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-0.5">
                  <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Seeking in {demand.locality}, Pune</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px]">
                  <div className="p-1.5 bg-zinc-50 rounded-lg border border-zinc-100">
                    <span className="text-[9px] text-zinc-400 uppercase font-bold block">Type</span>
                    <span className="font-black text-zinc-900 line-clamp-1">{demand.bhk}</span>
                  </div>
                  <div className="p-1.5 bg-amber-50/60 rounded-lg border border-amber-100">
                    <span className="text-[9px] text-amber-800 uppercase font-bold block">Budget</span>
                    <span className="font-black text-amber-800 line-clamp-1">{demand.budget}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onConnectBuyer(demand.referenceCode, `${demand.bhk} in ${demand.locality} (${demand.budget})`)}
                className="mt-2.5 w-full text-center text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
              >
                <span>Connect With This Buyer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-amber-50/40 rounded-xl border border-dashed border-amber-300 text-center space-y-1.5 w-full">
          <p className="text-xs text-zinc-700">
            No verified buyers found matching &ldquo;<span className="font-bold text-zinc-950">{filterQuery}</span>&rdquo;.
          </p>
          <div className="flex items-center justify-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setFilterQuery('')}
              className="text-[11px] font-bold text-amber-900 underline hover:text-amber-700 cursor-pointer"
            >
              Show all buyers
            </button>
            <span className="text-zinc-300">&bull;</span>
            <button
              type="button"
              onClick={() => onConnectBuyer('', '')}
              className="text-[11px] font-bold text-zinc-900 hover:text-amber-700 underline cursor-pointer"
            >
              Register property anyway
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface HeroMatchedPropertiesCardSectionProps {
  initialProperties: MatchedPropertyPreview[];
  onEnquire: (prop: MatchedPropertyPreview) => void;
}

function HeroMatchedPropertiesCardSection({
  initialProperties,
  onEnquire
}: HeroMatchedPropertiesCardSectionProps) {
  const [filterQuery, setFilterQuery] = useState('');

  // Quick localities present in these specific matched properties for one-click pill filtering
  const quickLocalities = useMemo(() => {
    const locs = new Set<string>();
    (initialProperties || []).forEach((p) => {
      if (p.locality) locs.add(p.locality.trim());
    });
    return Array.from(locs);
  }, [initialProperties]);

  // Dynamically filter STRICTLY between these properties only (zero extra results outside this list)
  const filteredProperties = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) {
      return initialProperties || [];
    }

    const tokens = q.split(/\s+/).filter(Boolean);

    return (initialProperties || []).filter((prop) => {
      const haystack = `${prop.name || ''} ${prop.locality || ''} ${prop.bhk || ''} ${prop.price || ''} ${prop.status || ''} ${prop.sqft || ''}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }, [filterQuery, initialProperties]);

  return (
    <div className="space-y-2.5 pt-1 w-full">
      {/* Header with Title & Live Match Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs font-bold text-zinc-700">
        <span className="flex items-center gap-1.5 text-zinc-900">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Verified Properties in Portfolio:</span>
        </span>
        <span className="text-[11px] text-zinc-500 font-semibold shrink-0">
          {filterQuery.trim()
            ? `${filteredProperties.length} of ${initialProperties.length} ${
                filteredProperties.length === 1 ? 'property' : 'properties'
              } ready for "${filterQuery.trim()}"`
            : `${initialProperties.length} ${
                initialProperties.length === 1 ? 'property' : 'properties'
              } ready`}
        </span>
      </div>

      {/* Medium Size Search Bar to filter strictly between these properties */}
      <div className="relative flex items-center bg-white hover:bg-zinc-50/70 focus-within:bg-white border border-zinc-200 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 rounded-xl px-3.5 py-2.5 transition-all shadow-2xs focus-within:shadow-xs w-full">
        <Search className="w-4 h-4 text-amber-600 mr-2.5 shrink-0" />
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter between these properties by location, type, or price..."
          className="w-full bg-transparent outline-none text-zinc-900 font-medium text-xs sm:text-sm placeholder:text-zinc-400 py-0.5"
        />
        {filterQuery && (
          <button
            type="button"
            onClick={() => setFilterQuery('')}
            className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition cursor-pointer shrink-0 ml-1.5"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Filter Localities (if multiple localities are available in these properties) */}
      {quickLocalities.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-zinc-400 font-semibold">Quick filter:</span>
          {quickLocalities.map((loc) => {
            const isActive = filterQuery.toLowerCase() === loc.toLowerCase();
            return (
              <button
                key={loc}
                type="button"
                onClick={() => setFilterQuery(isActive ? '' : loc)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-2xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                <MapPin className="w-2.5 h-2.5 text-amber-600" />
                <span>{loc}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Property Cards Grid (Only the filtered subset of these exact properties) */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              className="group rounded-xl bg-white border border-zinc-200 hover:border-amber-400 p-2.5 transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs"
            >
              <div className="flex gap-2.5">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-zinc-100 border border-zinc-100">
                  <Image
                    src={prop.image || '/LogoAnv-original.png'}
                    alt={prop.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="56px"
                  />
                  {prop.status && (
                    <span className="absolute bottom-0 inset-x-0 bg-zinc-950/85 text-[8px] text-amber-300 text-center font-bold py-0.5 truncate px-0.5">
                      {prop.status}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                      {prop.name}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{prop.locality}</span>
                    </div>
                  </div>
                  <div className="text-xs font-extrabold text-amber-700 mt-0.5">
                    {prop.price}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-1.5 border-t border-zinc-100 mt-1.5">
                <Link
                  href={prop.url}
                  className="flex-1 text-center text-[10px] font-bold px-2 py-1 rounded-md bg-zinc-900 hover:bg-black text-white transition flex items-center justify-center gap-1 shadow-2xs"
                >
                  <span>View</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => onEnquire(prop)}
                  className="flex-1 text-center text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 transition cursor-pointer shadow-2xs"
                >
                  Enquire
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-amber-50/40 rounded-xl border border-dashed border-amber-300 text-center space-y-1.5 w-full">
          <p className="text-xs text-zinc-700">
            No properties found matching &ldquo;<span className="font-bold text-zinc-950">{filterQuery}</span>&rdquo; among these results.
          </p>
          <div className="flex items-center justify-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setFilterQuery('')}
              className="text-[11px] font-bold text-amber-900 underline hover:text-amber-700 cursor-pointer"
            >
              Show all {initialProperties.length} properties
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function HomepageSearchablePortal({
  initialProperties,
  initialBlogs,
  initialFilterOptions,
  initialSearchParams,
  isDedicatedSearchPage = false
}: HomepageSearchablePortalProps) {
  const hasInitialSearch = Boolean(
    isDedicatedSearchPage ||
    (initialSearchParams && (
      initialSearchParams.search ||
      (initialSearchParams.locality && initialSearchParams.locality !== 'All') ||
      (initialSearchParams.bhk && initialSearchParams.bhk !== 'All') ||
      (initialSearchParams.priceRange && initialSearchParams.priceRange !== 'All') ||
      (initialSearchParams.status && initialSearchParams.status !== 'All')
    ))
  );

  // Main Search & Filter States
  const [hasSearched, setHasSearched] = useState(hasInitialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearchParams?.search || '');
  const [selectedLocality, setSelectedLocality] = useState(initialSearchParams?.locality || 'All');
  const [selectedBhk, setSelectedBhk] = useState(initialSearchParams?.bhk || 'All');
  const [selectedPriceRange, setSelectedPriceRange] = useState(initialSearchParams?.priceRange || 'All');
  const [selectedStatus, setSelectedStatus] = useState(initialSearchParams?.status || 'All');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'size'>('relevance');

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

  useEffect(() => {
    if (initialSearchParams && (
      initialSearchParams.search ||
      (initialSearchParams.locality && initialSearchParams.locality !== 'All') ||
      (initialSearchParams.bhk && initialSearchParams.bhk !== 'All') ||
      (initialSearchParams.priceRange && initialSearchParams.priceRange !== 'All') ||
      (initialSearchParams.status && initialSearchParams.status !== 'All')
    )) {
      executeSearch({
        search: initialSearchParams.search,
        locality: initialSearchParams.locality,
        bhk: initialSearchParams.bhk,
        priceRange: initialSearchParams.priceRange,
        status: initialSearchParams.status
      });
    }
  }, []);
  const [blogs, setBlogs] = useState<BlogItem[]>(initialBlogs);
  const [blogCategory, setBlogCategory] = useState('All');
  const [showAllBlogs, setShowAllBlogs] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSearchSummary, setAiSearchSummary] = useState<string | null>(null);


  // Modal & Toast States
  const router = useRouter();
  const [activeResultTab, setActiveResultTab] = useState<'properties' | 'buyer_leads'>('properties');
  const [buyerDemands, setBuyerDemands] = useState<BuyerDemandItem[]>([]);
  const [catalogueBuyerFilter, setCatalogueBuyerFilter] = useState('');

  const filteredCatalogueBuyerDemands = useMemo(() => {
    const q = catalogueBuyerFilter.trim().toLowerCase();
    if (!q) return buyerDemands;
    const tokens = q.split(/\s+/).filter(Boolean);
    return buyerDemands.filter((demand) => {
      const haystack = `${demand.referenceCode} ${demand.maskedName} ${demand.locality} ${demand.bhk} ${demand.budget} ${demand.requirements || ''} ${demand.purpose || ''}`.toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    });
  }, [catalogueBuyerFilter, buyerDemands]);

  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [selectedBuyerRefForConnect, setSelectedBuyerRefForConnect] = useState<string | undefined>(undefined);
  const [selectedBuyerSummaryForConnect, setSelectedBuyerSummaryForConnect] = useState<string | undefined>(undefined);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [requirementModalOpen, setRequirementModalOpen] = useState(false);
  const [propertyNotFoundModalOpen, setPropertyNotFoundModalOpen] = useState(false);
  const [buyerNotFoundModalOpen, setBuyerNotFoundModalOpen] = useState(false);
  const [blogAuthModalOpen, setBlogAuthModalOpen] = useState(false);
  const [targetBlogForAuth, setTargetBlogForAuth] = useState<BlogItem | null>(null);
  const [selectedPropertyForEnquiry, setSelectedPropertyForEnquiry] = useState<PropertyItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Hero Embedded Chatbot & Dynamic Filter States (ChatGPT Style)
  const [heroChatMessages, setHeroChatMessages] = useState<HeroChatMessage[]>([]);
  const [heroChatInput, setHeroChatInput] = useState('');
  const [isHeroChatTyping, setIsHeroChatTyping] = useState(false);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ONLY the inner chat scrollable container — NEVER scroll the outer browser window!
  useEffect(() => {
    if (heroChatMessages.length > 0 && chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [heroChatMessages, isHeroChatTyping]);

  // Open Full Blog: Enforces COMPULSORY LOGIN before opening
  const handleOpenFullBlog = (article: BlogItem) => {
    const session = getClientSession();
    if (!session) {
      setTargetBlogForAuth(article);
      setBlogAuthModalOpen(true);
      showToast('Patron login is compulsory to view full editorial articles.');
    } else {
      router.push(`/blogs/${encodeURIComponent(article.id)}`);
    }
  };

  // 1. Available Localities: dynamically increases as per products & locations in database
  const availableLocalities = useMemo(() => {
    const set = new Set<string>(filterOptions.localities);
    initialProperties.forEach((p) => {
      if (p.locality?.trim()) set.add(p.locality.trim());
      else if (p.location) {
        const first = p.location.split(',')[0].trim();
        if (first && first.length >= 3) set.add(first);
      }
    });
    properties.forEach((p) => {
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

    initialProperties.forEach((p) => checkAndAdd(p.bhk));
    properties.forEach((p) => checkAndAdd(p.bhk));

    return list;
  }, [filterOptions.typologies, initialProperties, properties]);

  // 3. Available Statuses: dynamically increases as per products in database
  const availableStatuses = useMemo(() => {
    const set = new Set<string>(filterOptions.statuses);
    initialProperties.forEach((p) => {
      if (p.status?.trim() && p.status !== 'Draft' && p.status !== 'Published') {
        set.add(p.status.trim());
      }
    });
    properties.forEach((p) => {
      if (p.status?.trim() && p.status !== 'Draft' && p.status !== 'Published') {
        set.add(p.status.trim());
      }
    });
    return Array.from(set);
  }, [filterOptions.statuses, initialProperties, properties]);

  const availablePriceRanges = filterOptions.priceRanges;

  // Unified Intelligent Search (queries /api/unified-search powered by ChatGPT)
  const executeSearch = async (overrideParams?: {
    search?: string;
    locality?: string;
    bhk?: string;
    priceRange?: string;
    status?: string;
  }) => {
    // Guard: don't search if nothing has been entered
    const effectiveSearch = overrideParams?.search !== undefined ? overrideParams.search : searchQuery;
    const effectiveLocality = overrideParams?.locality !== undefined ? overrideParams.locality : selectedLocality;
    const effectiveBhkCheck = overrideParams?.bhk !== undefined ? overrideParams.bhk : selectedBhk;
    const effectivePrice = overrideParams?.priceRange !== undefined ? overrideParams.priceRange : selectedPriceRange;
    const effectiveStatus = overrideParams?.status !== undefined ? overrideParams.status : selectedStatus;

    const hasNoInput =
      !effectiveSearch.trim() &&
      (!effectiveLocality || effectiveLocality === 'All') &&
      (!effectiveBhkCheck || effectiveBhkCheck === 'All') &&
      (!effectivePrice || effectivePrice === 'All') &&
      (!effectiveStatus || effectiveStatus === 'All');

    if (hasNoInput) {
      showToast('Please type a search query or select a filter to find properties.');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setShowAllBlogs(false);

    const isDirectBarSearch = overrideParams === undefined || (overrideParams.search !== undefined && overrideParams.bhk === undefined && overrideParams.locality === undefined);

    let qSearch = overrideParams?.search !== undefined ? overrideParams.search : searchQuery;
    let qLocality = overrideParams?.locality !== undefined ? overrideParams.locality : selectedLocality;
    let qBhk = overrideParams?.bhk !== undefined ? overrideParams.bhk : selectedBhk;
    let qPrice = overrideParams?.priceRange !== undefined ? overrideParams.priceRange : selectedPriceRange;
    let qStatus = overrideParams?.status !== undefined ? overrideParams.status : selectedStatus;

    const normalizedSearch = qSearch
      .replace(/[-_/\(\)\[\]]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();

    // If search was submitted from search bar or quick pill without explicit dropdown filters:
    // Extract filters fresh from the search query and reset previous sticky filters!
    if (isDirectBarSearch) {
      // 1. BHK / Typology extraction
      let detectedBhk = 'All';
      if (/\b(?:commercial|office|workspace|retail)\b/i.test(normalizedSearch)) {
        detectedBhk = 'Commercial Office';
      } else {
        const bhkMatch = normalizedSearch.match(/\b([1-9])\s*(?:bhk|bedroom|bed)s?\b/i) || normalizedSearch.match(/\b(?:bhk|bedroom|bed)s?\s*([1-9])\b/i);
        if (bhkMatch) {
          detectedBhk = `${bhkMatch[1]} BHK`;
        } else if (/\bpenthouses?\b/i.test(normalizedSearch)) {
          detectedBhk = '4.5+ BHK Penthouse';
        }
      }
      qBhk = detectedBhk;
      setSelectedBhk(detectedBhk);

      // 2. Locality extraction
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
      qLocality = detectedLoc;
      setSelectedLocality(detectedLoc);

      // 3. Reset price & status if not in text
      qPrice = 'All';
      setSelectedPriceRange('All');
      qStatus = 'All';
      setSelectedStatus('All');

      // 4. Client-side Instant Intent Routing
      const isSellerText = /\b(?:want|need|find|get|looking for|look for|search for|connect with|require|seeking)\s+(?:a\s+|an\s+|the\s+|some\s+|any\s+|me\s+)?buyers?\b/i.test(normalizedSearch) ||
        /\bbuyers?\s+(?:for|needed|required|wanted)\b/i.test(normalizedSearch) ||
        /\b(?:sell|selling)\s+(?:my\s+|a\s+|an\s+)?(?:flat|apartment|property|home|house|plot|land|commercial|office|unit|penthouse)\b/i.test(normalizedSearch) ||
        /\b(?:i want to sell|want to sell|willing to sell|plan to sell|looking to sell|sell property|sell flat)\b/i.test(normalizedSearch);

      const isBuyerText = /\b(?:want to buy|looking to buy|plan to buy|wish to buy|ready to buy)\b/i.test(normalizedSearch) ||
        /\b(?:buy|buying|purchase|purchasing)\s+(?:a\s+|an\s+|the\s+|i\s+|\d+\s*)?(?:flat|apartment|property|home|house|commercial|office|unit|penthouse|\d+\s*bhk)\b/i.test(normalizedSearch) ||
        /\b(?:find|looking for|search for)\s+(?:a\s+|an\s+|the\s+)?(?:flat|apartment|property|home|house|commercial|office|penthouse|\d+\s*bhk)\b/i.test(normalizedSearch);

      if (isSellerText && !isBuyerText) {
        setActiveResultTab('buyer_leads');
      } else if (isBuyerText) {
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

      // Sync query params in browser URL bar for shareable SEO link without reloading the page
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

      // Fetch from ChatGPT Unified Search API
      const res = await fetch(`/api/unified-search?${params.toString()}`);
      const data = await res.json();

      let fetchedProperties: PropertyItem[] = [];
      let fetchedDemands: BuyerDemandItem[] = [];
      let currentTab: 'properties' | 'buyer_leads' = activeResultTab;

      if (data.success) {
        if (Array.isArray(data.properties)) fetchedProperties = data.properties;
        if (Array.isArray(data.buyerDemands)) fetchedDemands = data.buyerDemands;
        if (data.ai) {
          setAiSearchSummary(data.ai.summary || null);
          // ChatGPT Intent Routing: If user query indicates a seller wanting buyers, switch to buyer leads tab!
          if (data.ai.primaryView === 'buyer_leads' || data.ai.intent === 'seller') {
            currentTab = 'buyer_leads';
            setActiveResultTab('buyer_leads');
          } else if (data.ai.primaryView === 'properties' || data.ai.intent === 'buyer') {
            currentTab = 'properties';
            setActiveResultTab('properties');
          }
        }
      } else {
        fetchedProperties = filterClientSide(qSearch, qLocality, qBhk, qPrice, qStatus);
      }

      setProperties(fetchedProperties);
      setBuyerDemands(fetchedDemands);

      // Log user search to database history
      if (qSearch.trim()) {
        fetch('/api/search-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: qSearch.trim(),
            locality: qLocality,
            bhk: qBhk,
            priceRange: qPrice,
            intent: currentTab === 'buyer_leads' ? 'seller' : 'buyer',
            resultsCount: currentTab === 'buyer_leads' ? fetchedDemands.length : fetchedProperties.length
          })
        }).catch(() => { });
      }

      // Trigger Not Found popups if 0 matching items found
      if (currentTab === 'buyer_leads') {
        if (fetchedDemands.length === 0) {
          setBuyerNotFoundModalOpen(true);
        }
      } else {
        if (fetchedProperties.length === 0) {
          setPropertyNotFoundModalOpen(true);
        }
      }

      // Scroll smoothly to results
      setTimeout(() => {
        document.getElementById('search-results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 120);

      // Correlation blogs
      const bParams = new URLSearchParams();
      if (qSearch.trim()) bParams.set('search', qSearch.trim());
      if (qLocality && qLocality !== 'All') bParams.set('locality', qLocality);
      if (qBhk && qBhk !== 'All') bParams.set('bhk', qBhk);
      if (fetchedProperties.length > 0) {
        bParams.set('properties', fetchedProperties.map((p) => p.name).join(','));
      }
      const bRes = await fetch(`/api/blogs?${bParams.toString()}`);
      const bData = await bRes.json();
      if (bData.success && Array.isArray(bData.blogs)) {
        setBlogs(bData.blogs);
      }
    } catch (err) {
      console.log('Unified search fallback:', err);
      const fallbackMatched = filterClientSide(qSearch, qLocality, qBhk, qPrice, qStatus);
      setProperties(fallbackMatched);
      if (activeResultTab === 'buyer_leads') {
        if (buyerDemands.length === 0) {
          setBuyerNotFoundModalOpen(true);
        }
      } else {
        setActiveResultTab('properties');
        if (fallbackMatched.length === 0) {
          setPropertyNotFoundModalOpen(true);
        }
      }
    } finally {
      setIsSearching(false);
    }
  };

  // ================= HERO EMBEDDED CONCIERGE & DYNAMIC FILTER HANDLERS =================
  const handleScrollToCatalogue = () => {
    setHasSearched(true);
    setTimeout(() => {
      const el = document.getElementById('search-results-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleResetHeroChat = () => {
    setHeroChatMessages([]);
    setHeroChatInput('');
    setSearchQuery('');
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('anv_hero_chat_history');
        sessionStorage.removeItem('anv_hero_chat_input');
      } catch {}
      window.history.replaceState(null, '', '/');
    }
  };

  // Client buyer demands matcher with strict category boundaries
  const getClientMatchedBuyerDemands = (queryText: string): BuyerDemandItem[] => {
    const analysis = detectSellerTypologyAndLocality(queryText);
    if (analysis.isUnrecognized) return [];
    if (analysis.isGeneralSellerQuery) return buyerDemands.slice(0, 3);

    const lower = queryText.toLowerCase();
    const isHospital = /\b(?:hospital|medical|clinic|doctor|healthcare|dispensary)\b/i.test(lower);
    const isShowroom = /\b(?:showroom|display\s*center)\b/i.test(lower);
    const isOffice = /\b(?:office|it\s*park|coworking|workspace|corporate|commercial\s*office|business\s*center)\b/i.test(lower);
    const isShop = /\b(?:shop|retail|commercial\s*shop)\b/i.test(lower);
    const isPreleased = /\b(?:pre[-_\s]*leased|prelease|roi|yield|investment)\b/i.test(lower);
    const isCommercialGeneral = !isOffice && !isShowroom && !isShop && !isHospital && !isPreleased && /\b(?:commercial|commercial\s*property|commercial\s*space|commercial\s*unit|commercial\s*real\s*estate)\b/i.test(lower);
    const bhkMatch = lower.match(/\b([1-5])\s*bhk\b/i);
    const bhkNum = bhkMatch ? bhkMatch[1] : null;

    const scored = buyerDemands.map((demand) => {
      let score = 0;
      const text = `${demand.bhk} ${demand.locality} ${demand.requirements} ${demand.purpose}`.toLowerCase();
      const isDemandCommercial = /\b(?:commercial|office|workspace|corporate|showroom|retail|shop|pre[-_\s]*leased|it\s*park)\b/i.test(text);
      const isDemandResidential = /\b(?:bhk|residential|flat|apartment|penthouse|villa)\b/i.test(text);

      if (isHospital) {
        if (/\b(?:hospital|medical|clinic|healthcare)\b/i.test(text)) score += 160;
        else score -= 100;
      }
      if (isOffice) {
        if (/\b(?:office|workspace|corporate|it\s*park)\b/i.test(text)) score += 160;
        else if (isDemandCommercial) score += 90;
        else if (isDemandResidential) score -= 100;
      }
      if (isShowroom) {
        if (/\b(?:showroom|retail|display)\b/i.test(text)) score += 160;
        else if (isDemandCommercial) score += 90;
        else if (isDemandResidential) score -= 100;
      }
      if (isShop) {
        if (/\b(?:shop|retail|store)\b/i.test(text)) score += 160;
        else if (isDemandCommercial) score += 90;
        else if (isDemandResidential) score -= 100;
      }
      if (isPreleased) {
        if (/\b(?:pre[-_\s]*leased|prelease|yield|roi|invest)\b/i.test(text)) score += 160;
        else if (isDemandCommercial) score += 90;
        else if (isDemandResidential) score -= 100;
      }
      if (isCommercialGeneral) {
        if (isDemandCommercial) score += 140;
        else if (isDemandResidential) score -= 100;
      }
      if (bhkNum) {
        if (text.includes(`${bhkNum} bhk`)) score += 140;
        else if (isDemandCommercial) score -= 100;
      }

      const localities = ['baner', 'balewadi', 'kalyani nagar', 'koregaon park', 'undri', 'nibm', 'hinjewadi', 'wakad', 'camp', 'viman nagar', 'kharadi', 'jm road', 'shivaji nagar', 'sb road', 'fc road'];
      for (const loc of localities) {
        if (lower.includes(loc) && text.includes(loc)) {
          score += 80;
          break;
        }
      }

      return { demand, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.demand)
      .slice(0, 3);
  };

  // Client property matcher with strict category boundaries powered by property-matching engine
  const getClientMatchedProperties = (queryText: string): MatchedPropertyPreview[] => {
    const matched = getBestMatchingProperties(initialProperties, queryText, 4);
    return matched.map((p) => ({
      id: p.id,
      name: p.name,
      locality: p.locality || p.location.split(',')[0].trim(),
      price: p.price,
      bhk: p.bhk,
      status: p.status,
      image: p.image || (p.images && p.images[0]) || '/LogoAnv-original.png',
      url: getPropertyUrl(p)
    }));
  };

  // High-contrast, clean markdown text and link renderer for ChatGPT interface
  const renderFormattedChatContent = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-1.5">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={`empty-${lineIdx}`} className="h-1.5" />;
          }

          // Check if line is a bullet item (*, •, -, or numbered)
          const isBullet = /^\s*(?:[*•\-+]|\d+\.)\s+/.test(line);
          const cleanLine = line
            .replace(/^\s*(?:[*•\-+]|\d+\.)\s+/, '')
            .replace(/(\]\([^)]+\))\s*(?:->|→)\s*:?/g, '$1:')
            .replace(/(\*\*\s*(?:->|→)\s*:?)/g, ':');

          // Tokenizer matching:
          // 1. Bold links: **[Text](url)**
          // 2. Standard links: [Text](url)
          // 3. Bold text: **Text**
          const TOKEN_REGEX = /(?:\*\*\[([^\]]+)\]\(([^)]+)\)\*\*|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/g;
          const parts: React.ReactNode[] = [];
          let lastIndex = 0;
          let match: RegExpExecArray | null;

          while ((match = TOKEN_REGEX.exec(cleanLine)) !== null) {
            if (match.index > lastIndex) {
              const rawText = cleanLine.substring(lastIndex, match.index).replace(/\*\*/g, '');
              if (rawText) parts.push(rawText);
            }

            if (match[1] && match[2]) {
              // **[Text](url)**
              parts.push(
                <Link
                  key={`blink-${lineIdx}-${match.index}`}
                  href={match[2]}
                  className="text-amber-700 hover:text-amber-900 font-bold underline underline-offset-2 transition-colors cursor-pointer inline-flex items-center gap-0.5 mx-0.5"
                >
                  <span>{match[1]}</span>
                  <ArrowRight className="w-2.5 h-2.5 inline shrink-0 opacity-80" />
                </Link>
              );
            } else if (match[3] && match[4]) {
              // [Text](url)
              parts.push(
                <Link
                  key={`link-${lineIdx}-${match.index}`}
                  href={match[4]}
                  className="text-amber-700 hover:text-amber-900 font-bold underline underline-offset-2 transition-colors cursor-pointer inline-flex items-center gap-0.5 mx-0.5"
                >
                  <span>{match[3]}</span>
                  <ArrowRight className="w-2.5 h-2.5 inline shrink-0 opacity-80" />
                </Link>
              );
            } else if (match[5]) {
              // **Text**
              parts.push(
                <strong key={`bold-${lineIdx}-${match.index}`} className="font-bold text-zinc-950">
                  {match[5]}
                </strong>
              );
            }

            lastIndex = match.index + match[0].length;
          }

          if (lastIndex < cleanLine.length) {
            const remaining = cleanLine.substring(lastIndex).replace(/\*\*/g, '');
            if (remaining) parts.push(remaining);
          }

          if (isBullet) {
            return (
              <div key={`line-${lineIdx}`} className="flex items-start gap-2 pl-1">
                <span className="text-amber-600 font-bold text-sm leading-tight mt-0.5 shrink-0">•</span>
                <div className="flex-1 leading-relaxed text-zinc-800">{parts}</div>
              </div>
            );
          }

          return (
            <p key={`line-${lineIdx}`} className="leading-relaxed text-zinc-800">
              {parts}
            </p>
          );
        })}
      </div>
    );
  };

  const handleHeroChatSubmit = async (
    overrideText?: string,
    explicitFilter?: { bhk?: string; locality?: string; intent?: string }
  ) => {
    const text = (overrideText || heroChatInput).trim();
    if (!text || isHeroChatTyping) return;

    const userMsg: HeroChatMessage = {
      id: `hero-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...heroChatMessages, userMsg];
    setHeroChatMessages(newHistory);
    setHeroChatInput('');
    try {
      sessionStorage.removeItem('anv_hero_chat_input');
    } catch {}
    setSearchQuery(text);
    setIsHeroChatTyping(true);

    const lower = text.toLowerCase().trim();
    const isGreeting = /^(?:hi|hello|hey|namaste|pranam|good\s*(?:morning|afternoon|evening)|hola|sup|hii|heyy|hiii)\b/i.test(lower);
    const isSeller =
      explicitFilter?.intent === 'seller' ||
      /\b(?:sell|selling|seller|owner|list\s*(?:my)?\s*property|(?:want|need|looking\s*for|find|match|get)\s*(?:a\s*)?buyers?|have\s*a\s*(?:flat|apartment|office|property|commercial)\s*to\s*sell|i\s*want\s*buyer)\b/i.test(lower) ||
      ((lower.includes('buyer') || lower.includes('buyers')) && (lower.includes('commercial') || lower.includes('flat') || lower.includes('office') || lower.includes('property') || lower.includes('for my')));
    const isUnrelated = isUnrelatedRealEstateQuery(text);

    // Browser URL bar synchronization:
    // Only update address bar for genuine category or property searches, NEVER for simple greetings or unrelated terms!
    if (typeof window !== 'undefined' && !isGreeting && !isUnrelated) {
      const matchedCategorySlug = findMatchingCategorySlug(text);
      if (matchedCategorySlug) {
        window.history.replaceState(null, '', `/${matchedCategorySlug}`);
      } else {
        window.history.replaceState(null, '', `/?search=${encodeURIComponent(text)}`);
      }
    }

    // Guaranteed strictly relevant property options directly inside chat stream (never on greeting, seller, or unrelated)
    const clientMatches = (!isSeller && !isGreeting && !isUnrelated) ? getClientMatchedProperties(text) : [];

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await res.json();
      const rawReply =
        data?.reply ||
        'Thank you for reaching ANV REEALTY. Our central advisory desk (+91 93730 20701) is ready to assist you.';

      // Strip any accidental website URL
      const replyContent = rawReply
        .replace(/\(?https?:\/\/(?:www\.)?anvreealty\.com\/?\)?/gi, '')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();

      let actionType: 'buyer_enquiry' | 'seller_enquiry' | 'whatsapp' | 'unrelated_search' | undefined = data?.actionType;
      const apiMatched: MatchedPropertyPreview[] = data?.matchedProperties || [];
      const apiBuyerDemands: BuyerDemandItem[] = data?.matchedBuyerDemands || [];

      // STRICT ACCURACY & INTENT ENFORCEMENT:
      // If the visitor is a SELLER, sending a GREETING, or UNRELATED, strictly ZERO property cards should be returned!
      let finalMatched: MatchedPropertyPreview[] = [];
      let finalBuyerDemands: BuyerDemandItem[] = [];

      if (actionType === 'unrelated_search' || isUnrelated) {
        actionType = 'unrelated_search';
        finalMatched = [];
        finalBuyerDemands = [];
      } else if (isSeller || actionType === 'seller_enquiry') {
        actionType = 'seller_enquiry';
        finalMatched = []; // Strictly zero property cards for sellers!
        // Strictly use API results or client matcher. NEVER fallback to slicing random buyers!
        if (apiBuyerDemands.length > 0) {
          finalBuyerDemands = apiBuyerDemands.slice(0, 3);
        } else {
          finalBuyerDemands = getClientMatchedBuyerDemands(text);
        }
      } else if (isGreeting) {
        finalMatched = []; // Strictly zero property cards on greetings!
      } else {
        if (apiMatched.length > 0) {
          finalMatched = apiMatched.slice(0, 4);
        } else if (clientMatches.length > 0) {
          finalMatched = clientMatches.slice(0, 4);
        }
      }

      if (!actionType) {
        if (isUnrelated) {
          actionType = 'unrelated_search';
        } else if (isSeller) {
          actionType = 'seller_enquiry';
        } else if (finalMatched.length > 0 || /\b(?:buy|flat|bhk|office|showroom|hospital)\b/i.test(lower)) {
          actionType = 'buyer_enquiry';
        } else {
          actionType = 'whatsapp';
        }
      }

      const sellerAnalysis = isSeller ? detectSellerTypologyAndLocality(text) : undefined;
      const botMsg: HeroChatMessage = {
        id: `hero-bot-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType,
        matchedProperties: finalMatched,
        matchedBuyerDemands: finalBuyerDemands,
        sellerCategoryLabel: sellerAnalysis?.categoryLabel,
        sellerUnrecognizedTerm: sellerAnalysis?.unrecognizedTerm,
        unrelatedQuery: data?.unrelatedQuery || (actionType === 'unrelated_search' ? text : undefined),
        suggestedSearches:
          data?.suggestedSearches && data.suggestedSearches.length > 0
            ? data.suggestedSearches
            : actionType === 'unrelated_search'
            ? REAL_ESTATE_SEARCH_SUGGESTIONS.map((s) => s.label)
            : undefined
      };

      setHeroChatMessages((prev) => [...prev, botMsg]);
    } catch {
      let fallbackMatched: MatchedPropertyPreview[] = [];
      let fallbackDemands: BuyerDemandItem[] = [];

      const sellerAnalysis = isSeller ? detectSellerTypologyAndLocality(text) : undefined;
      if (isSeller) {
        fallbackDemands = getClientMatchedBuyerDemands(text);
      } else if (!isGreeting && !isUnrelated) {
        fallbackMatched = clientMatches.slice(0, 4);
      }

      const fallbackMsg: HeroChatMessage = {
        id: `hero-bot-${Date.now()}`,
        role: 'assistant',
        content: isUnrelated
          ? `No real estate results found for **"${text.trim()}"**.\n\n**ANV REEALTY** is an exclusive luxury & commercial real estate advisory firm in Pune. We do not provide non-real-estate items or services.\n\nPlease explore verified property options in our Pune portfolio using the suggested searches below:`
          : isGreeting
          ? 'Hello! Welcome to **ANV REEALTY**. I am your dedicated AI Property Concierge.\n\nHow may I assist you today?\n• **Buy or Invest**: Residential (2/3/4 BHK, Luxury Penthouse) or Commercial (IT Park Office, Showroom, Medical)?\n• **Sell or List**: Connect your property with verified pre-qualified buyers in Pune?\n• **Lease**: Corporate office or retail space?\n\nTell me what you have in mind, or select an option below!'
          : isSeller
          ? sellerAnalysis?.isUnrecognized
            ? `We searched our Pune database, but could not identify active buyer mandates matching **"${sellerAnalysis.unrecognizedTerm}"**.\n\nPlease let us know what property type you would like to sell (e.g. Commercial Office, Residential 2/3/4 BHK, Showroom, Hospital, or Plot) and in which locality, or tap **'Register Property Details'** below so our luxury desk can assist you directly.`
            : sellerAnalysis?.isCommercialGeneral
            ? `Yes! ANV REEALTY maintains an active Private Client Network of verified corporate and investor buyers seeking **Commercial Properties** across Pune (Offices, Showrooms, Retail & Pre-Leased Assets).\n\nActive commercial buyer mandates from our Pune database are displayed below.\n\nTo match your commercial property with pre-qualified buyers, please specify your commercial typology:\n• **Commercial Office / Corporate Workspace**\n• **Retail Showroom or High-Street Shop**\n• **Pre-Leased Commercial Unit (Guaranteed ROI)**\n• **Medical Premise or Hospital Space**\n\nOr reply with your locality, carpet area (sq.ft.), and asking price, or tap **'Register Property Details'** below.`
            : sellerAnalysis?.isOffice
            ? `Yes! ANV REEALTY connects commercial property owners directly with verified corporate and enterprise buyers actively acquiring **Commercial Office Spaces & Workspaces** in Pune.\n\nActive corporate office buyer mandates matching your typology are displayed below.\n\nTo match your commercial office directly with pre-qualified buyers, please share:\n1. **Locality & Building / IT Park Name** (e.g. Kalyani Nagar, Baner, Kharadi, SB Road, Hinjewadi)\n2. **Carpet / Built-up Area** (sq.ft.) & **Furnishing Status** (Bare Shell / Furnished)\n3. **Expected Asking Price**\n\nYou can reply directly here with these details, or tap **'Register Property Details'** below.`
            : sellerAnalysis?.hasSpecificCriteria && sellerAnalysis.categoryLabel
            ? `ANV REEALTY maintains an active Private Client Network of verified buyers seeking **${sellerAnalysis.categoryLabel}** across Pune. Matching buyer mandates are displayed below. Register your property below to connect with these pre-qualified buyers.`
            : 'ANV REEALTY connects property owners directly with verified active buyers across Pune. Register your property below; as soon as a pre-qualified buyer matches your property, our advisory team will notify you immediately: "Congratulations! We have matched a verified buyer for your property."'
          : 'Here are verified property options in our Pune portfolio. Our central advisory desk (East Wing, M.G. Road, Camp, Pune) is also available at WhatsApp / Call **+91 93730 20701** to arrange an exclusive site visit.',
        timestamp: 'Just now',
        actionType: isUnrelated ? 'unrelated_search' : isSeller ? 'seller_enquiry' : 'whatsapp',
        matchedProperties: fallbackMatched,
        matchedBuyerDemands: fallbackDemands,
        sellerCategoryLabel: sellerAnalysis?.categoryLabel,
        sellerUnrecognizedTerm: sellerAnalysis?.unrecognizedTerm,
        unrelatedQuery: isUnrelated ? text.trim() : undefined,
        suggestedSearches: isUnrelated ? REAL_ESTATE_SEARCH_SUGGESTIONS.map((s) => s.label) : undefined
      };
      setHeroChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsHeroChatTyping(false);
    }
  };

  // 1. Restore previous chat when user returns back from property detail page or reloads,
  // BUT if the user explicitly navigates to or clears the URL bar to root (localhost:3000),
  // strictly reset to clean initial home state!
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const searchFromUrl = urlParams.get('search') || initialSearchParams?.search || '';
    const isCategoryRoute = window.location.pathname !== '/' && !window.location.pathname.startsWith('/properties') && !window.location.pathname.startsWith('/blogs');

    // ACCURACY IN ROUTING:
    // If the user navigates directly to or removes the search query from the address bar (so URL is clean localhost:3000):
    // The portal MUST be in its clean default state without lingering previous chat!
    if (window.location.pathname === '/' && !searchFromUrl) {
      try {
        sessionStorage.removeItem('anv_hero_chat_history');
        sessionStorage.removeItem('anv_hero_chat_input');
      } catch {}
      setHeroChatMessages([]);
      setHeroChatInput('');
      setSearchQuery('');
      setHasSearched(false);
      return;
    }

    // If on an active search URL (?search=...) or category page (/hospital), restore chat session:
    try {
      const savedMessages = sessionStorage.getItem('anv_hero_chat_history');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHeroChatMessages(parsed);
          setHeroChatInput('');
          return;
        }
      }
    } catch {}

    // If no previous chat was saved, but navigated directly to category/search URL (e.g. /hospital or /?search=...):
    if ((searchFromUrl || isCategoryRoute) && heroChatMessages.length === 0) {
      const initialSearchTerm = (searchFromUrl || (isCategoryRoute ? window.location.pathname.replace(/^\/+/, '') : '')).trim();
      if (initialSearchTerm) {
        setHeroChatInput('');
        setSearchQuery(initialSearchTerm);
        handleHeroChatSubmit(initialSearchTerm);
      }
    }
  }, []);

  // Listen to browser Back/Forward (popstate) to keep chat synchronized with the address bar!
  useEffect(() => {
    const handlePopState = () => {
      const searchParam = new URLSearchParams(window.location.search).get('search');
      if (window.location.pathname === '/' && !searchParam) {
        try {
          sessionStorage.removeItem('anv_hero_chat_history');
          sessionStorage.removeItem('anv_hero_chat_input');
        } catch {}
        setHeroChatMessages([]);
        setHeroChatInput('');
        setSearchQuery('');
        setHasSearched(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 2. Automatically save active chat history to sessionStorage so it persists when opening property pages
  useEffect(() => {
    try {
      if (heroChatMessages.length > 0) {
        sessionStorage.setItem('anv_hero_chat_history', JSON.stringify(heroChatMessages));
      } else {
        sessionStorage.removeItem('anv_hero_chat_history');
      }
    } catch {}
  }, [heroChatMessages]);

  const handleQuickChipClick = (chip: {
    label: string;
    query: string;
    bhk?: string;
    locality?: string;
    intent?: string;
  }) => {
    handleHeroChatSubmit(chip.query, {
      bhk: chip.bhk,
      locality: chip.locality,
      intent: chip.intent
    });
  };

  const filterClientSide = (
    qSearch: string,
    qLocality: string,
    qBhk: string,
    qPrice: string,
    qStatus: string
  ): PropertyItem[] => {
    let filtered = [...initialProperties];
    let effectiveBhk = qBhk;
    let effectiveLocality = qLocality;

    const normalized = qSearch
      .replace(/[-_/\(\)\[\]]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();

    // Detect BHK or Commercial from search query if not specified in dropdown
    if (!effectiveBhk || effectiveBhk === 'All') {
      if (/\b(?:commercial|office|workspace|retail)\b/i.test(normalized)) {
        effectiveBhk = 'Commercial Office';
      } else if (/^[1-9]$/.test(normalized)) {
        effectiveBhk = `${normalized} BHK`;
      } else {
        const bhkMatch = normalized.match(/\b([1-9])\s*(?:bhk|bedroom|bed)s?\b/i) || normalized.match(/\b(?:bhk|bedroom|bed)s?\s*([1-9])\b/i);
        if (bhkMatch) {
          effectiveBhk = `${bhkMatch[1]} BHK`;
        } else if (/\bpenthouses?\b/i.test(normalized)) {
          effectiveBhk = '4.5+ BHK Penthouse';
        }
      }
    }

    // Detect Locality from search query if not specified in dropdown
    if (!effectiveLocality || effectiveLocality === 'All') {
      const knownLocs = ['Koregaon Park', 'Baner', 'Balewadi', 'Kalyani Nagar', 'Bavdhan', 'Mahalunge', 'Shivajinagar', 'Kharadi', 'Worli', 'Hinjewadi', 'Wakad'];
      for (const loc of knownLocs) {
        if (new RegExp(`\\b${loc.replace(/\\s+/g, '[\\s-]+')}\\b`, 'i').test(qSearch) || new RegExp(`\\b${loc}\\b`, 'i').test(normalized)) {
          effectiveLocality = loc;
          break;
        }
      }
    }

    // Strict BHK & Commercial filtering
    if (effectiveBhk && effectiveBhk !== 'All') {
      if (effectiveBhk.toLowerCase().includes('commercial') || effectiveBhk.toLowerCase().includes('office')) {
        filtered = filtered.filter(
          (p) =>
            p.isCommercial ||
            p.bhk.toLowerCase().includes('commercial') ||
            p.name.toLowerCase().includes('commercial') ||
            p.name.toLowerCase().includes('office') ||
            p.bhkNum === 0 ||
            !p.bhkNum
        );
      } else if (effectiveBhk.includes('4.5') || effectiveBhk.toLowerCase().includes('penthouse') || effectiveBhk.includes('5')) {
        filtered = filtered.filter((p) => !p.isCommercial && ((p.bhkNum || 0) >= 4 || p.name.toLowerCase().includes('penthouse')));
      } else {
        const digit = effectiveBhk.match(/\d+/)?.[0];
        if (digit) {
          const reqNum = parseInt(digit, 10);
          filtered = filtered.filter((p) => !p.isCommercial && (p.bhkNum === reqNum || p.bhk.includes(`${digit} BHK`)));
        }
      }
    }

    // Locality filtering
    if (effectiveLocality && effectiveLocality !== 'All') {
      filtered = filtered.filter((p) =>
        (p.locality && p.locality.toLowerCase().includes(effectiveLocality.toLowerCase())) ||
        p.location.toLowerCase().includes(effectiveLocality.toLowerCase()) ||
        p.name.toLowerCase().includes(effectiveLocality.toLowerCase())
      );
    }

    // Status filtering
    if (qStatus && qStatus !== 'All') {
      if (qStatus.toLowerCase().includes('ready')) {
        filtered = filtered.filter((p) => p.status.toLowerCase().includes('ready'));
      } else if (qStatus.toLowerCase().includes('under')) {
        filtered = filtered.filter((p) => p.status.toLowerCase().includes('under') || p.status.toLowerCase().includes('construction'));
      } else {
        filtered = filtered.filter((p) => p.status.toLowerCase().includes(qStatus.toLowerCase()));
      }
    }

    // Price filtering
    if (qPrice && qPrice !== 'All') {
      if (qPrice.includes('Under ₹1.5')) {
        filtered = filtered.filter((p) => (p.priceRaw || 15000000) <= 15000000);
      } else if (qPrice.includes('1.5') && qPrice.includes('2.5')) {
        filtered = filtered.filter((p) => (p.priceRaw || 20000000) >= 15000000 && (p.priceRaw || 20000000) <= 25000000);
      } else if (qPrice.includes('2.5') && qPrice.includes('4.0')) {
        filtered = filtered.filter((p) => (p.priceRaw || 30000000) >= 25000000 && (p.priceRaw || 30000000) <= 40000000);
      } else if (qPrice.includes('4.0')) {
        filtered = filtered.filter((p) => (p.priceRaw || 50000000) >= 40000000);
      }
    }

    // Specific remaining keywords (builder, project name, etc.)
    if (normalized.trim()) {
      const stopWords = ['i', 'a', 'an', 'in', 'the', 'and', 'for', 'at', 'to', 'of', 'pune', 'luxury', 'verified', 'property', 'properties', 'apartment', 'apartments', 'flat', 'flats', 'residence', 'residences', 'home', 'homes', 'sale', 'buy', 'best', 'want', 'need', 'find', 'get', 'looking', 'buyer', 'buyers', 'seller', 'sellers'];
      let cleanQuery = normalized
        .replace(/\b[1-9]\s*(?:bhk|bedroom|bed)s?\b/gi, ' ')
        .replace(/^[1-9]$/, ' ');

      const words = cleanQuery
        .toLowerCase()
        .split(/[\s,]+/)
        .map((w) => w.trim())
        .filter((w) => w.length > 1 && !stopWords.includes(w));

      if (words.length > 0) {
        filtered = filtered.filter((p) => {
          const text = `${p.name} ${p.developer} ${p.locality || ''} ${p.location} ${p.description}`.toLowerCase();
          return words.every((w) => text.includes(w));
        });
      }
    }

    return filtered;
  };


  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLocality('All');
    setSelectedBhk('All');
    setSelectedPriceRange('All');
    setSelectedStatus('All');
    setProperties(initialProperties);
    setBuyerDemands([]);
    setBlogs(initialBlogs);
    setHasSearched(false);
    setPropertyNotFoundModalOpen(false);
    setBuyerNotFoundModalOpen(false);
    setSellerModalOpen(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', isDedicatedSearchPage ? '/properties' : '/');
    }
    showToast('Filters cleared.');
  };

  // Sorting
  const sortedProperties = useMemo(() => {
    const list = [...properties];
    if (sortBy === 'price_low') {
      list.sort((a, b) => (a.priceRaw || 0) - (b.priceRaw || 0));
    } else if (sortBy === 'price_high') {
      list.sort((a, b) => (b.priceRaw || 0) - (a.priceRaw || 0));
    } else if (sortBy === 'size') {
      list.sort((a, b) => (b.sqftNum || 0) - (a.sqftNum || 0));
    }
    return list;
  }, [properties, sortBy]);

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

      {/* ================= 1. COMPACT CHATGPT-STYLE AI REAL ESTATE CONCIERGE ================= */}
      {!isDedicatedSearchPage && (
        <section
          style={{
            height: '640px',
            maxHeight: 'calc(100vh - 80px)',
            minHeight: '520px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          className="relative w-full py-1.5 bg-white text-zinc-900 border-b border-zinc-200 shadow-2xs"
        >
          
          {/* Top ChatGPT Model Bar */}
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between border-b border-zinc-100 shrink-0 select-none">
            {/* Model Switcher Pill (ChatGPT style) */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center shrink-0 shadow-2xs">
                <MessageSquare className="w-3 h-3 text-zinc-950 fill-zinc-950" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-zinc-900">
                ANV AI Concierge
              </span>
            </div>

            {/* Right Control: New Chat */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetHeroChat}
                className="px-2.5 py-1 rounded-xl hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950 text-xs font-semibold border border-zinc-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Start a new conversation"
              >
                <RotateCcw className="w-3 h-3 text-amber-600" />
                <span>New chat</span>
              </button>
            </div>
          </div>

          {/* ChatGPT Main Scrollable Workspace - Strictly Bounded & Scrollable */}
          <div
            ref={chatScrollContainerRef}
            style={{
              flex: '1 1 0%',
              minHeight: 0,
              overflowY: 'auto'
            }}
            className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 md:px-8 py-3 w-full max-w-6xl mx-auto space-y-3.5 [scrollbar-width:thin] scrollbar-thumb-zinc-300"
          >
            {heroChatMessages.length === 0 ? (
              /* ICONIC CHATGPT START SCREEN (Compact & Centered) */
              <div className="h-full flex flex-col items-center justify-center text-center py-4 animate-in fade-in duration-300 w-full">
                {/* Center Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center shadow-[0_4px_16px_rgba(245,158,11,0.22)] ring-4 ring-amber-100/90 mb-3">
                  <MessageSquare className="w-6 h-6 text-zinc-950 fill-zinc-950" />
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight">
                  Welcome to ANV REEALTY
                </h1>
              </div>
            ) : (
              /* CHATGPT ACTIVE CONVERSATION THREAD */
              <div className="space-y-3 pb-1 w-full">
                {heroChatMessages.map((msg) => (
                  <div key={msg.id} className="w-full">
                    {msg.role === 'user' ? (
                      /* User Bubble - Right Aligned (ChatGPT style) */
                      <div className="flex justify-end">
                        <div className="max-w-[85%] sm:max-w-xl md:max-w-2xl bg-zinc-100 border border-zinc-200 text-zinc-900 font-medium rounded-2xl rounded-br-sm px-3.5 py-2 text-xs sm:text-sm leading-relaxed shadow-2xs">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      /* Assistant Message - Full Width with Avatar */
                      <div className="flex items-start gap-2.5 w-full">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <MessageSquare className="w-3 h-3 text-zinc-950 fill-zinc-950" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-2.5">
                          <div className="text-zinc-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
                            {renderFormattedChatContent(msg.content)}
                          </div>

                          {/* A. SELLER WORKFLOW: Registration Card & Verified Buyer Demand Cards */}
                          {msg.actionType === 'seller_enquiry' && (
                            <div className="space-y-2.5 pt-0.5 w-full">
                              {/* Prominent Interactive Seller Property Registration Banner */}
                              <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-3.5 sm:p-4 shadow-xs w-full">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                                      <Sparkles className="w-3 h-3 text-amber-600" />
                                      <span>Seller & Owner Matchmaking Desk</span>
                                    </div>
                                    <h4 className="text-xs sm:text-sm font-bold text-zinc-950">
                                      Register Your Property to Match Verified Active Buyers
                                    </h4>
                                    <p className="text-xs text-zinc-600 leading-relaxed max-w-xl">
                                      Leave your property details with our luxury advisory desk. As soon as a pre-qualified buyer matches your property specifications, you will be notified: <strong className="text-zinc-900">“Congratulations! We have matched a verified buyer for your property.”</strong>
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setSelectedBuyerRefForConnect(undefined);
                                      setSelectedBuyerSummaryForConnect(undefined);
                                      setSellerModalOpen(true);
                                    }}
                                    className="shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                                  >
                                    <User className="w-3.5 h-3.5" />
                                    <span>Register Property Details</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Active Verified Buyer Cards in Database with Small Search Bar on Top */}
                              {/* Only show buyer demands section when active buyer mandates actually matched */}
                              {msg.matchedBuyerDemands && msg.matchedBuyerDemands.length > 0 && (
                                <HeroBuyerDemandsCardSection
                                  initialDemands={msg.matchedBuyerDemands}
                                  allDemands={buyerDemands}
                                  categoryLabel={msg.sellerCategoryLabel}
                                  unrecognizedTerm={msg.sellerUnrecognizedTerm}
                                  onConnectBuyer={(refCode, summary) => {
                                    setSelectedBuyerRefForConnect(refCode || undefined);
                                    setSelectedBuyerSummaryForConnect(summary || undefined);
                                    setSellerModalOpen(true);
                                  }}
                                />
                              )}
                            </div>
                          )}

                          {/* B. BUYER WORKFLOW: Matched Property Cards Grid with Medium Search Bar (Only for buyers, NEVER for sellers!) */}
                          {msg.actionType !== 'seller_enquiry' && msg.matchedProperties && msg.matchedProperties.length > 0 && (
                            <HeroMatchedPropertiesCardSection
                              initialProperties={msg.matchedProperties}
                              onEnquire={(prop) => {
                                const found =
                                  initialProperties.find((p) => p.id === prop.id) ||
                                  properties.find((p) => p.id === prop.id);
                                setSelectedPropertyForEnquiry(found || null);
                                setConsultationModalOpen(true);
                              }}
                            />
                          )}

                          {/* 1.5 UNRELATED / NO RESULTS FOUND SUGGESTIONS BLOCK */}
                          {msg.actionType === 'unrelated_search' && (
                            <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 p-3.5 sm:p-4 space-y-3 w-full shadow-2xs">
                              <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Suggested Real Estate Searches in Pune:</span>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {REAL_ESTATE_SEARCH_SUGGESTIONS.map((suggestion, sIdx) => (
                                  <button
                                    key={sIdx}
                                    type="button"
                                    onClick={() => handleHeroChatSubmit(suggestion.query)}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-amber-500 hover:text-zinc-950 text-zinc-800 border border-amber-300 hover:border-amber-500 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 group"
                                  >
                                    <span>{suggestion.label}</span>
                                    <ArrowRight className="w-3 h-3 text-amber-600 group-hover:text-zinc-950 transition-colors" />
                                  </button>
                                ))}
                              </div>

                              <div className="pt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-600">
                                <span>Need custom assistance?</span>
                                <button
                                  type="button"
                                  onClick={() => setConsultationModalOpen(true)}
                                  className="font-bold text-amber-800 hover:text-amber-900 underline cursor-pointer"
                                >
                                  Connect with Central Advisory Desk (+91 93730 20701)
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Action Shortcuts & Interactive Quick Reply Options */}
                          <div className="space-y-1.5 pt-0.5">
                            {/* 2. Seller Interactive Action Pills */}
                            {msg.actionType === 'seller_enquiry' && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                <button
                                  onClick={() => {
                                    setSelectedBuyerRefForConnect(undefined);
                                    setSelectedBuyerSummaryForConnect(undefined);
                                    setSellerModalOpen(true);
                                  }}
                                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <User className="w-3.5 h-3.5" />
                                  <span>
                                    {msg.sellerCategoryLabel?.includes('Commercial')
                                      ? '📋 Register Commercial Property Details'
                                      : '📋 Register Property Details (Direct Form)'}
                                  </span>
                                </button>

                                {msg.sellerCategoryLabel?.includes('Commercial') ? (
                                  <>
                                    <button
                                      onClick={() => handleHeroChatSubmit('I want to sell a commercial office space in Pune')}
                                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                    >
                                      <span>🏢 Commercial Office</span>
                                    </button>
                                    <button
                                      onClick={() => handleHeroChatSubmit('I want to sell a commercial showroom in Pune')}
                                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                    >
                                      <span>🛍️ Retail Showroom</span>
                                    </button>
                                    <button
                                      onClick={() => handleHeroChatSubmit('I want to sell pre-leased commercial property in Pune')}
                                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                    >
                                      <span>💼 Pre-Leased Asset</span>
                                    </button>
                                    <button
                                      onClick={() => handleHeroChatSubmit('I want to sell a medical or hospital premise in Pune')}
                                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                    >
                                      <span>🏥 Medical / Hospital</span>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleHeroChatSubmit('I want to sell a commercial office space in Pune')}
                                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                    >
                                      <span>🏢 Sell Commercial Office</span>
                                    </button>
                                    <button
                                      onClick={() => handleHeroChatSubmit('I want to sell a residential flat or apartment in Pune')}
                                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                    >
                                      <span>🏠 Sell Residential Flat</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}

                            {/* 3. Global Advisory Buttons */}
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              <button
                                onClick={() => setConsultationModalOpen(true)}
                                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <Calendar className="w-3 h-3 text-amber-600" />
                                <span>Schedule Advisory Consultation</span>
                              </button>
                              <a
                                href="https://wa.me/919373020701?text=Hello%20ANV%20REEALTY,%20I%20am%20inquiring%20via%20the%20AI%20Concierge."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <PhoneCall className="w-3 h-3 text-emerald-600" />
                                <span>WhatsApp: +91 93730 20701</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Assistant Typing Indicator */}
                {isHeroChatTyping && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-3 h-3 fill-zinc-950 text-zinc-950" />
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-200" />
                      <span className="ml-1 text-[11px]">Searching Pune database...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* C. SIGNATURE CHATGPT FLOATING INPUT BAR - Perfectly Proportioned & Accurate */}
          <div className="w-full max-w-3xl sm:max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-4 shrink-0 bg-white">
            {/* Input Capsule with Accurate Spacing */}
            <div className="group relative flex items-center bg-white border border-zinc-300 hover:border-zinc-400 focus-within:border-zinc-900 focus-within:ring-4 focus-within:ring-zinc-900/5 rounded-full py-2 sm:py-2.5 pl-6 pr-2 sm:pr-2.5 gap-3.5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.08)] transition-all duration-200 w-full">
              {/* Left Search Icon with Dedicated Breathing Room */}
              <div className="flex items-center justify-center shrink-0 text-zinc-400 group-focus-within:text-zinc-800 transition-colors">
                <Search className="w-5 h-5 stroke-[2]" />
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={heroChatInput}
                onChange={(e) => {
                  setHeroChatInput(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleHeroChatSubmit();
                  }
                }}
                placeholder="Please search property/buyer..."
                className="flex-1 min-w-0 bg-transparent outline-none text-zinc-950 font-normal text-sm sm:text-base placeholder:text-zinc-400 py-1"
              />

              {/* Clear Button */}
              {heroChatInput && (
                <button
                  onClick={() => {
                    setHeroChatInput('');
                    setSearchQuery('');
                    if (typeof window !== 'undefined') {
                      window.history.replaceState(null, '', '/');
                    }
                  }}
                  className="w-7 h-7 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-800 text-xs transition-colors cursor-pointer shrink-0"
                  title="Clear search"
                >
                  ✕
                </button>
              )}

              {/* Signature Circle Up-Arrow Send Button */}
              <button
                onClick={() => handleHeroChatSubmit()}
                disabled={!heroChatInput.trim() || isHeroChatTyping}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-900 hover:bg-black text-white flex items-center justify-center transition-all duration-150 disabled:bg-zinc-100 disabled:text-zinc-300 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:scale-105 active:scale-95 shrink-0"
                title="Send search"
              >
                <ArrowUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Disclaimer Footer Note */}
            <p className="text-[11px] sm:text-xs text-zinc-500 font-normal text-center mt-2 select-none">
              ANV AI Concierge searches live Pune inventory • Call central desk:{' '}
              <a href="tel:+919373020701" className="text-zinc-800 font-semibold hover:underline">
                +91 93730 20701
              </a>
            </p>
          </div>
        </section>
      )}

      {/* ================= 2. UNIFIED SEARCH RESULTS (PROPERTIES & BUYER DEMANDS) ================= */}
      {(hasSearched || isDedicatedSearchPage) && (
        <section id="search-results-section" className={`w-full max-w-[100vw] overflow-x-hidden ${isDedicatedSearchPage ? 'pt-32' : 'pt-12'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            {/* Results Header */}
            <div className="mb-8 border-b border-zinc-200 pb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                {activeResultTab === 'properties'
                  ? `${sortedProperties.length} ${
                      /projects?/i.test(searchQuery)
                        ? sortedProperties.length === 1 ? 'Project' : 'Projects'
                        : sortedProperties.length === 1 ? 'Property' : 'Properties'
                    } Available`
                  : `${buyerDemands.length} ${
                      buyerDemands.length === 1 ? 'Active Buyer' : 'Active Buyers'
                    } Available`}
              </h2>
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
                        Helpline Number: <a href="tel:+919373020701" className="text-amber-400 font-mono tracking-wider hover:underline">93730 20701</a>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
                        Buyer phone numbers are protected. Call our central desk <strong className="text-white">93730 20701</strong> to introduce your property or arrange buyer viewings.
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

                {/* Small Search Bar & Counter on Top of Cards */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs">
                  <div className="relative flex-1 flex items-center bg-zinc-50 hover:bg-zinc-100/90 focus-within:bg-white border border-zinc-300 focus-within:border-amber-600 focus-within:ring-1 focus-within:ring-amber-500/20 rounded-xl px-3 py-2 transition-all">
                    <Search className="w-4 h-4 text-amber-600 mr-2.5 shrink-0" />
                    <input
                      type="text"
                      value={catalogueBuyerFilter}
                      onChange={(e) => setCatalogueBuyerFilter(e.target.value)}
                      placeholder="Search active buyers by locality (e.g. JM Road, Baner), typology, or budget..."
                      className="w-full bg-transparent outline-none text-zinc-900 font-medium text-xs sm:text-sm placeholder:text-zinc-400"
                    />
                    {catalogueBuyerFilter && (
                      <button
                        type="button"
                        onClick={() => setCatalogueBuyerFilter('')}
                        className="p-1 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition cursor-pointer shrink-0 ml-1.5"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="text-xs font-bold text-zinc-600 px-1 shrink-0">
                    {filteredCatalogueBuyerDemands.length} {filteredCatalogueBuyerDemands.length === 1 ? 'buyer' : 'buyers'} ready
                    {catalogueBuyerFilter.trim() && ` for "${catalogueBuyerFilter.trim()}"`}
                  </div>
                </div>

                {/* Cards Grid */}
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
                  <div className="py-16 text-center max-w-lg mx-auto bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
                    <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 mb-4">
                      <MapPin className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-950">
                      No Matching Active Buyers Found
                    </h3>
                    <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                      Leave your property details with our acquisition desk and we will notify qualified buyers immediately.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedBuyerRefForConnect(undefined);
                        setSelectedBuyerSummaryForConnect(undefined);
                        setSellerModalOpen(true);
                      }}
                      className="mt-6 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-black px-6 py-3 rounded-xl text-xs shadow-md hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
                    >
                      Register Property for Buyer Matching
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW B: BUYER'S VIEW - AVAILABLE PROPERTIES */}
            {activeResultTab === 'properties' && (
              sortedProperties.length > 0 ? (
                <div id="properties-section" className="space-y-6 animate-in fade-in duration-300">
                  {/* Results Sort Controls */}
                  <div className="flex items-center justify-end mb-2">
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 shadow-2xs focus:outline-none cursor-pointer pr-8"
                      >
                        <option value="relevance">Sort: Relevance</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="size">Carpet Area: Largest</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* ================= 2.1 EXACT UPPER FILTRATION BAR (Directly Above Property Cards) ================= */}
                  <div className="w-full bg-white rounded-2xl shadow-sm border border-zinc-200/90 p-4 sm:p-5 mb-8 transition">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                      {/* 1. Locality Dropdown */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                          LOCALITY / AREA
                        </label>
                        <div className="relative">
                          <select
                            value={selectedLocality}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedLocality(val);
                              executeSearch({ locality: val });
                            }}
                            className="w-full bg-white border border-zinc-200 hover:border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-800 shadow-2xs transition cursor-pointer pr-10 appearance-none"
                          >
                            <option value="All">All Localities (Pune)</option>
                            {availableLocalities
                              .filter((loc) => loc !== 'All')
                              .map((loc) => (
                                <option key={loc} value={loc}>
                                  {loc}
                                </option>
                              ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-zinc-400">
                            <ChevronDown className="w-4 h-4 text-zinc-500" />
                          </div>
                        </div>
                      </div>

                      {/* 2. Typology Dropdown */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                          TYPOLOGY / PROPERTY TYPE
                        </label>
                        <div className="relative">
                          <select
                            value={selectedBhk}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedBhk(val);
                              executeSearch({ bhk: val });
                            }}
                            className="w-full bg-white border border-zinc-200 hover:border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-800 shadow-2xs transition cursor-pointer pr-10 appearance-none"
                          >
                            <option value="All">All Typologies</option>
                            {availableTypologies
                              .filter((t) => t.value !== 'All')
                              .map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-zinc-400">
                            <ChevronDown className="w-4 h-4 text-zinc-500" />
                          </div>
                        </div>
                      </div>

                      {/* 3. Price Range Dropdown */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                          PRICE RANGE
                        </label>
                        <div className="relative">
                          <select
                            value={selectedPriceRange}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedPriceRange(val);
                              executeSearch({ priceRange: val });
                            }}
                            className="w-full bg-white border border-zinc-200 hover:border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-800 shadow-2xs transition cursor-pointer pr-10 appearance-none"
                          >
                            <option value="All">Any Budget</option>
                            {availablePriceRanges.map((p) => (
                              <option key={p.value} value={p.value}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-zinc-400">
                            <ChevronDown className="w-4 h-4 text-zinc-500" />
                          </div>
                        </div>
                      </div>

                      {/* 4. Possession Status Dropdown */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                          POSSESSION STATUS
                        </label>
                        <div className="relative">
                          <select
                            value={selectedStatus}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedStatus(val);
                              executeSearch({ status: val });
                            }}
                            className="w-full bg-white border border-zinc-200 hover:border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-800 shadow-2xs transition cursor-pointer pr-10 appearance-none"
                          >
                            <option value="All">All Statuses</option>
                            {availableStatuses
                              .filter((s) => s !== 'All')
                              .map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-zinc-400">
                            <ChevronDown className="w-4 h-4 text-zinc-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Applied Filters Strip & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3.5 border-t border-zinc-100 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-zinc-400 font-semibold text-[11px]">Active Filters:</span>
                        {selectedLocality !== 'All' && (
                          <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 border border-amber-200 text-[11px]">
                            Locality: {selectedLocality}
                            <button
                              onClick={() => {
                                setSelectedLocality('All');
                                executeSearch({ locality: 'All' });
                              }}
                              className="hover:text-amber-950 font-black cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        )}
                        {selectedBhk !== 'All' && (
                          <span className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 border border-zinc-200 text-[11px]">
                            Typology: {selectedBhk}
                            <button
                              onClick={() => {
                                setSelectedBhk('All');
                                executeSearch({ bhk: 'All' });
                              }}
                              className="hover:text-zinc-950 font-black cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        )}
                        {selectedPriceRange !== 'All' && (
                          <span className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 border border-zinc-200 text-[11px]">
                            Budget: {selectedPriceRange}
                            <button
                              onClick={() => {
                                setSelectedPriceRange('All');
                                executeSearch({ priceRange: 'All' });
                              }}
                              className="hover:text-zinc-950 font-black cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        )}
                        {selectedStatus !== 'All' && (
                          <span className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 border border-zinc-200 text-[11px]">
                            Status: {selectedStatus}
                            <button
                              onClick={() => {
                                setSelectedStatus('All');
                                executeSearch({ status: 'All' });
                              }}
                              className="hover:text-zinc-950 font-black cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        )}
                        {(selectedLocality !== 'All' || selectedBhk !== 'All' || selectedPriceRange !== 'All' || selectedStatus !== 'All') ? (
                          <button
                            onClick={handleResetFilters}
                            className="text-amber-800 hover:text-amber-950 font-bold hover:underline ml-1 cursor-pointer text-[11px] flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset Filters</span>
                          </button>
                        ) : (
                          <span className="text-zinc-400 text-[11px] italic">Showing all available parameters</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Real-time cloud database filter active</span>
                      </div>
                    </div>
                  </div>

                  {/* PROPERTY RESULTS: 2 PER ROW GRID ARCHITECTURE */}
                  {sortedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sortedProperties.map((property) => (
                        /* OUTER CARD */
                        <div
                          key={property.id}
                          className="bg-white rounded-3xl shadow-sm border border-zinc-200/90 overflow-hidden flex flex-col hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 group"
                        >
                          {/* Visual Top Showcase */}
                          <Link
                            href={getPropertyUrl(property)}
                            className="relative block w-full h-60 sm:h-64 shrink-0 overflow-hidden bg-zinc-950 focus:outline-none"
                            title={`View details for ${property.name}`}
                          >
                            <Image
                              src={property.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                              alt={property.name}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />

                            {/* Gradient Overlay for Top Badges */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

                            {/* TOP BADGES: RERA / RPS GUARANTEE */}
                            <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md backdrop-blur-md text-[10px] font-bold shadow-md ${property.isCommercial || property.bhk.includes('Commercial')
                                  ? 'bg-blue-950/90 text-blue-300 border border-blue-500/40'
                                  : 'bg-zinc-950/90 text-amber-300 border border-amber-500/40'
                                }`}>
                                {property.isCommercial || property.bhk.includes('Commercial') ? (
                                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                                ) : (
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                                <span>{property.rpsStatus || `RPS: ${property.reraNumber || 'PRM/PUN/2026/0491'}`}</span>
                              </div>

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
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${property.isCommercial || property.bhk.includes('Commercial')
                                        ? 'text-blue-900 bg-blue-50 border-blue-200/60'
                                        : 'text-amber-800 bg-amber-50 border-amber-200/60'
                                      }`}>
                                      {property.developer}
                                    </span>
                                    <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-amber-600" />
                                      <span>{property.location}</span>
                                    </span>
                                  </div>
                                  <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight break-words whitespace-normal">
                                    <Link href={getPropertyUrl(property)} className="hover:text-amber-800 transition-colors block w-full">
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
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5 p-3.5 bg-zinc-50/80 rounded-2xl border border-zinc-200/70 text-xs">
                                {/* 1. Typology */}
                                <div>
                                  <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">
                                    Configuration
                                  </span>
                                  <span className={`font-extrabold mt-0.5 block truncate ${property.isCommercial || property.bhk.includes('Commercial') ? 'text-blue-950 font-black' : 'text-zinc-900'
                                    }`}>
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

                                {/* 3. RPS / RERA */}
                                <div>
                                  <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">
                                    RPS & RERA
                                  </span>
                                  <span className="font-bold text-emerald-700 mt-0.5 block truncate" title={property.reraNumber}>
                                    {property.reraNumber ? 'Registered ✓' : 'RPS Compliant'}
                                  </span>
                                </div>

                                {/* 4. Possession */}
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
                                  <span>{property.rpsStatus || 'MahaRERA / RPS Verified'}</span>
                                </span>
                                {(property.tags && property.tags.length > 0 ? property.tags : ['Vastu Compliant', 'Prime Location']).map((tag, idx) => (
                                  <span key={idx} className="text-[11px] font-semibold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200 flex items-center gap-1">
                                    <span>{tag}</span>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Bottom Action Strip: Responsive 4 Action Buttons */}
                            <div className="pt-4 border-t border-zinc-100">
                              <PropertyCardActions
                                property={property}
                                onInstantEnquiry={(p) => {
                                  setSelectedPropertyForEnquiry(p);
                                  setConsultationModalOpen(true);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-zinc-200/90 p-8 sm:p-12 text-center space-y-4 shadow-sm w-full">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                        <Search className="w-7 h-7 text-amber-600" />
                      </div>
                      <div className="space-y-1.5 max-w-lg mx-auto">
                        <h3 className="text-lg sm:text-xl font-bold text-zinc-950">
                          No properties found matching &ldquo;<span className="text-amber-700">{searchQuery || 'your criteria'}</span>&rdquo;
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                          We could not locate verified listings for this term in our Pune catalogue. Please explore one of our popular suggested searches below:
                        </p>
                      </div>

                      {/* Clickable Suggestion Searches */}
                      <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto pt-2">
                        {REAL_ESTATE_SEARCH_SUGGESTIONS.map((pill, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              handleHeroChatSubmit(pill.query);
                              handleScrollToCatalogue();
                            }}
                            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-zinc-50 hover:bg-amber-500 hover:text-zinc-950 text-zinc-800 border border-zinc-200 hover:border-amber-500 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 group"
                          >
                            <span>{pill.label}</span>
                            <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                          </button>
                        ))}
                      </div>

                      <div className="pt-3 flex items-center justify-center gap-3">
                        <button
                          onClick={handleResetFilters}
                          className="text-xs font-bold px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-black transition cursor-pointer"
                        >
                          Reset All Filters
                        </button>
                        <button
                          onClick={() => setConsultationModalOpen(true)}
                          className="text-xs font-bold px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition cursor-pointer"
                        >
                          Request Off-Market Options
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ================= 3. INSTITUTIONAL COMPARISON TABLE (Visible only when properties exist) ================= */}
                  {sortedProperties.length > 0 && (
                    <div className="mt-16 bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden w-full max-w-full">
                      <div className="bg-zinc-950 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight text-white">
                            <Grid className="w-5 h-5 text-amber-400" />
                            <span>Institutional Property Comparison & Valuation Sheet</span>
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1">
                            Comparative metrics filtered dynamically from database records.
                          </p>
                        </div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <Link
                            href="/compare"
                            className="text-xs bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>Open Comparison Matrix</span>
                          </Link>
                          <button
                            onClick={() => showToast('Institutional comparison brief prepared.')}
                            className="text-xs bg-zinc-800 hover:bg-zinc-700 font-bold px-4 py-2 rounded-xl border border-zinc-700 transition"
                          >
                            Export Brief
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto text-xs w-full">
                        <table className="w-full text-left min-w-[800px]">
                          <thead className="bg-zinc-50 text-zinc-500 font-bold border-b border-zinc-200">
                            <tr>
                              <th className="px-5 py-4">Property & Developer</th>
                              <th className="px-5 py-4">Locality</th>
                              <th className="px-5 py-4">Typology & Carpet</th>
                              <th className="px-5 py-4">Price & Status</th>
                              <th className="px-5 py-4">RPS & RERA Identifier</th>
                              <th className="px-5 py-4 text-right">Analytical Score</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {sortedProperties.map((row) => (
                              <tr key={row.id} className="hover:bg-zinc-50/70 transition">
                                <td className="px-5 py-3.5">
                                  <Link href={getPropertyUrl(row)} className="font-bold text-zinc-900 hover:text-amber-700 hover:underline block">
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
                                <td className="px-5 py-3.5">
                                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-mono text-[10px] font-bold">
                                    {row.reraNumber || 'PRM/PUN/RERA/2026/0491'}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                  <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md text-xs">
                                    {row.score || '9.2/10'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-16 text-center max-w-lg mx-auto bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
                  <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 mb-4">
                    <Building2 className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950">
                    No Matching Properties in Inventory
                  </h3>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    We don't currently have active inventory matching your exact criteria. Our private acquisition team can source off-market units or you can review active buyer demand.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                    <button
                      onClick={() => setRequirementModalOpen(true)}
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-black px-6 py-3 rounded-xl text-xs shadow-md hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
                    >
                      Submit Custom Requirement
                    </button>
                    {buyerDemands.length > 0 && (
                      <button
                        onClick={() => setActiveResultTab('buyer_leads')}
                        className="w-full sm:w-auto bg-zinc-900 text-white font-bold px-6 py-3 rounded-xl text-xs hover:bg-zinc-800 transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Active Buyers ({buyerDemands.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* ================= 4. REAL ESTATE BLOGS & INSIGHTS CONNECTED SECTION ================= */}
      <section id="insights-section" className="bg-white border-t border-zinc-200 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Blogs
              </h2>
            </div>

            {/* Upper Area: Category Filters & Option to View All Blogs */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              {/* Category Filter Pills for Blogs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'Market Report', 'Buying Guide', 'Legal & RERA'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setBlogCategory(cat);
                      const filtered = initialBlogs.filter(
                        (b) => cat === 'All' || b.category.toLowerCase() === cat.toLowerCase()
                      );
                      setBlogs(filtered);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${blogCategory === cat
                        ? 'bg-zinc-950 text-white shadow-2xs'
                        : 'bg-zinc-100 text-zinc-600 hover:text-zinc-950'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* View All Blogs Option */}
              <button
                onClick={() => setShowAllBlogs(!showAllBlogs)}
                className="px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-1.5 shadow-2xs"
              >
                <span>{showAllBlogs ? 'Show Fewer' : `View All Blogs (${blogs.length})`}</span>
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
                      src={article.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
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
                    {/* Connected Property / Locality Pill */}
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

      {/* Bespoke Property Buying Requirement Popup Modal */}
      <BespokePropertyRequirementModal
        isOpen={requirementModalOpen}
        onClose={() => setRequirementModalOpen(false)}
        initialLocality={selectedLocality}
        initialBhk={selectedBhk}
        initialBudget={selectedPriceRange}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Seller Lead Capture Modal (Used when no buyer matches or when connecting with a buyer) */}
      <SellerLeadCaptureModal
        isOpen={sellerModalOpen}
        onClose={() => setSellerModalOpen(false)}
        initialLocation={selectedLocality !== 'All' ? selectedLocality : searchQuery}
        initialBhk={selectedBhk !== 'All' ? selectedBhk : ''}
        buyerRef={selectedBuyerRefForConnect}
        buyerDemandSummary={selectedBuyerSummaryForConnect}
        onSuccessToast={(msg) => showToast(msg)}
      />

      {/* Property Not Found Popup Modal */}
      <PropertyNotFoundModal
        isOpen={propertyNotFoundModalOpen}
        onClose={() => setPropertyNotFoundModalOpen(false)}
        searchQuery={searchQuery}
        selectedLocality={selectedLocality}
        selectedBhk={selectedBhk}
        onOpenRequirementForm={() => setRequirementModalOpen(true)}
        onResetSearch={handleResetFilters}
      />

      {/* Buyer Not Found Popup Modal */}
      <BuyerNotFoundModal
        isOpen={buyerNotFoundModalOpen}
        onClose={() => setBuyerNotFoundModalOpen(false)}
        searchQuery={searchQuery}
        selectedLocality={selectedLocality}
        selectedBhk={selectedBhk}
        onOpenSellerForm={() => {
          setSelectedBuyerRefForConnect(undefined);
          setSelectedBuyerSummaryForConnect(undefined);
          setSellerModalOpen(true);
        }}
        onResetSearch={handleResetFilters}
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
    </>
  );
}
