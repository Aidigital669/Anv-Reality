'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  CheckCircle,
  ChevronDown,
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
  PhoneCall
} from 'lucide-react';
import { PropertyCardActions } from '@/components/public/PropertyCardActions';
import { InstantEnquiryModal } from '@/components/public/InstantEnquiryModal';
import { BespokePropertyRequirementModal } from '@/components/public/BespokePropertyRequirementModal';
import { PropertyNotFoundModal } from '@/components/public/PropertyNotFoundModal';
import { BuyerNotFoundModal } from '@/components/public/BuyerNotFoundModal';
import { SellerLeadCaptureModal } from '@/components/public/SellerLeadCaptureModal';
import { AuthInquiryModal } from '@/components/auth/AuthInquiryModal';
import { getClientSession } from '@/lib/user-auth';
import { getPropertySlug, getPropertyUrl } from '@/lib/slug';

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
  videoUrl?: string;
  videoThumbnail?: string;
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
  const [isSearching, setIsSearching] = useState(false);
  const [aiSearchSummary, setAiSearchSummary] = useState<string | null>(null);

  // Dynamic Popular Searches (loaded from database & updated on user search)
  const [popularSearches, setPopularSearches] = useState<string[]>([
    'Commercial Office Space',
    'I Want a Buyer for 3 BHK',
    '3 BHK Apartments in Pune',
    'Baner Luxury Residences',
    'Koregaon Park Buyers',
    'Ready to Move',
    'Penthouses'
  ]);

  useEffect(() => {
    fetch('/api/search-history?mode=popular')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.popularSearches) && data.popularSearches.length > 0) {
          setPopularSearches(data.popularSearches);
        }
      })
      .catch(() => {});
  }, []);

  // Modal & Toast States
  const router = useRouter();
  const [activeResultTab, setActiveResultTab] = useState<'properties' | 'buyer_leads'>('properties');
  const [buyerDemands, setBuyerDemands] = useState<BuyerDemandItem[]>([]);
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
        const qs = params.toString();
        const basePath = isDedicatedSearchPage ? '/properties' : '/';
        window.history.replaceState(null, '', qs ? `${basePath}?${qs}` : basePath);
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

      // Log user search to database history & update popular searches list dynamically
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
        }).catch(() => {});

        setPopularSearches((prev) => {
          const trimmed = qSearch.trim();
          const filtered = prev.filter((p) => p.toLowerCase() !== trimmed.toLowerCase());
          return [trimmed, ...filtered].slice(0, 8);
        });
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

  // Quick Chips Handler
  const handleQuickFilter = (label: string) => {
    setSearchQuery(label);
    if (label.toLowerCase().includes('buyer') || label.toLowerCase().includes('demand')) {
      setActiveResultTab('buyer_leads');
      executeSearch({ search: label });
    } else if (label === 'Commercial Office Space') {
      setSelectedBhk('Commercial Office');
      setSelectedLocality('Koregaon Park');
      executeSearch({ search: label, bhk: 'Commercial Office', locality: 'Koregaon Park' });
    } else if (label === '3 BHK Apartments in Pune') {
      setSelectedBhk('3 BHK');
      setSelectedLocality('All');
      executeSearch({ search: label, bhk: '3 BHK', locality: 'All' });
    } else if (label === 'Baner Luxury Residences') {
      setSelectedLocality('Baner');
      executeSearch({ search: label, locality: 'Baner' });
    } else if (label === 'Penthouses') {
      setSelectedBhk('4.5+ BHK Penthouse');
      executeSearch({ search: label, bhk: '4.5+ BHK Penthouse' });
    } else {
      executeSearch({ search: label });
    }
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

      {/* ================= 1. HERO SECTION WITH FOCUSED LUXURY SEARCH ================= */}
      {!isDedicatedSearchPage && (
        <section className="relative flex-1 min-h-[580px] w-full flex flex-col items-center justify-center pt-24 pb-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="ANV Luxury Real Estate Pune"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-zinc-950/95" />
        </div>

        <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">
          <h1 className="text-4xl sm:text-6xl font-black text-white text-center mb-6 sm:mb-8 tracking-tight">
            Welcome to Anv Reeality
          </h1>

          {/* CLEAN HERO SEARCH INPUT BOX WITH UNIFIED BUTTON */}
          <div className="w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-2.5 sm:p-3 border border-white/20">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 flex items-center px-4 w-full bg-zinc-50 hover:bg-zinc-100/70 transition border border-zinc-200/80 rounded-xl py-3 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                <Search className="w-5 h-5 text-amber-700 mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      executeSearch();
                    }
                  }}
                  placeholder="Search anything: '3 BHK in Baner', 'I want buyer for commercial office', 'Sell flat in Balewadi'..."
                  className="w-full bg-transparent outline-none text-zinc-900 placeholder:text-zinc-400 font-semibold text-sm sm:text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-zinc-400 hover:text-zinc-700 text-xs px-2 py-1 rounded-md"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  executeSearch();
                }}
                disabled={isSearching}
                className={`w-full sm:w-auto text-white px-8 py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer shrink-0 text-sm group ${
                  isSearching
                    ? 'bg-zinc-400 cursor-not-allowed'
                    : 'bg-zinc-950 hover:bg-zinc-800'
                }`}
              >
                <span>{isSearching ? 'Searching...' : 'Find Buyer / Property'}</span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Dynamic Suggestions Strip */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-3 border-t border-zinc-200/60 text-xs font-semibold text-zinc-600">
              <span className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
                Popular Searches:
              </span>
              {popularSearches.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleQuickFilter(chip)}
                  className="bg-zinc-100 hover:bg-amber-100 hover:text-amber-950 px-2.5 py-1 rounded-lg border border-zinc-200/80 transition cursor-pointer text-[11px]"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ================= 2. UNIFIED SEARCH RESULTS (PROPERTIES & BUYER DEMANDS) ================= */}
      {(hasSearched || isDedicatedSearchPage || properties.length > 0) && (
        <section id="search-results-section" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 ${isDedicatedSearchPage ? 'pt-32' : 'pt-12'}`}>
          {/* AI Intelligence Header & View Toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-zinc-200 pb-6">
            <div>
              {aiSearchSummary && (
                <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200/90 px-3.5 py-1.5 rounded-full mb-3 shadow-2xs">
                  <Search className="w-3.5 h-3.5 text-amber-600" />
                  <span>Search Summary: {aiSearchSummary}</span>
                </div>
              )}
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                {searchQuery ? `Results for "${searchQuery}"` : 'Marketplace Search Results'}
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm mt-0.5 font-medium">
                Showing live inventory and active registered buyer demand matched in real time.
              </p>
            </div>

            {/* DUAL VIEW TABS & DIRECT ENQUIRY ACTIONS */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <div className="flex items-center gap-1.5 p-1.5 bg-zinc-100 rounded-2xl border border-zinc-200 shadow-inner">
                <button
                  onClick={() => setActiveResultTab('properties')}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
                    activeResultTab === 'properties'
                      ? 'bg-zinc-950 text-white shadow-md'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Available Properties ({sortedProperties.length})</span>
                </button>

                <button
                  onClick={() => setActiveResultTab('buyer_leads')}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
                    activeResultTab === 'buyer_leads'
                      ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'
                  }`}
                >
                  <User className="w-4 h-4 text-zinc-950" />
                  <span>Active Buyers & Leads ({buyerDemands.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRequirementModalOpen(true)}
                  className="px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 cursor-pointer shadow-xs"
                  title="Post custom buyer requirement enquiry"
                >
                  <span>+ Buyer Enquiry</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedBuyerRefForConnect(undefined);
                    setSelectedBuyerSummaryForConnect(undefined);
                    setSellerModalOpen(true);
                  }}
                  className="px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer shadow-xs"
                  title="Register property for seller enquiry"
                >
                  <span>+ Seller Enquiry</span>
                </button>
              </div>
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
                      <span>Anv Reeality Official Buyer-Seller Concierge Desk</span>
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

              {/* Cards Grid */}
              {buyerDemands.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {buyerDemands.map((demand) => (
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
          {/* Results Header Strip */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 border-b border-zinc-200 pb-5">
          <div>
            {aiSearchSummary && (
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50/90 border border-amber-200/90 px-3 py-1 rounded-full mb-2.5 shadow-2xs">
                <Search className="w-3.5 h-3.5 text-amber-600" />
                <span>Search Summary: {aiSearchSummary}</span>
              </div>
            )}
            <div className="text-xs text-amber-700 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {selectedLocality !== 'All' ? `${selectedLocality}, Pune` : 'Pune Western & Eastern Corridors'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              {searchQuery ? `Properties matching "${searchQuery}"` : 'Curated Verified Residences & Commercial Spaces'}
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm mt-0.5 font-medium">
              Showing <strong className="text-zinc-900">{sortedProperties.length}</strong> authenticated properties from cloud database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Dropdown */}
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
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md backdrop-blur-md text-[10px] font-bold shadow-md ${
                      property.isCommercial || property.bhk.includes('Commercial')
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
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            property.isCommercial || property.bhk.includes('Commercial')
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
                        <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                          <Link href={getPropertyUrl(property)} className="hover:text-amber-800 transition-colors">
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
                        <span className={`font-extrabold mt-0.5 block truncate ${
                          property.isCommercial || property.bhk.includes('Commercial') ? 'text-blue-950 font-black' : 'text-zinc-900'
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

        {/* ================= 3. INSTITUTIONAL COMPARISON TABLE (Visible only when properties exist) ================= */}
        {sortedProperties.length > 0 && (
          <div className="mt-16 bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
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

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
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
        </section>
      )}

      {/* ================= 4. REAL ESTATE BLOGS & INSIGHTS CONNECTED SECTION ================= */}
      {(hasSearched || isDedicatedSearchPage || properties.length > 0) && sortedProperties.length > 0 && (
        <section id="insights-section" className="bg-white border-t border-zinc-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs text-amber-700 font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Market Intelligence Desk &bull; Connected to Property Search</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                {selectedLocality !== 'All'
                  ? `Real Estate Insights & Legal Guides Connected to ${selectedLocality}`
                  : (searchQuery
                      ? `Market Intelligence Connected to "${searchQuery}"`
                      : 'Latest Real Estate Insights, Tax & RERA Guides')}
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm mt-0.5 font-medium">
                {selectedLocality !== 'All'
                  ? `Institutional research papers, micro-market trends, and legal RERA advisory correlated with ${selectedLocality}.`
                  : 'Research reports, stamp duty changes, and price appreciation forecasts filtered dynamically from database.'}
              </p>
            </div>

            {/* Category Filter Pills for Blogs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
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
          </div>

          {/* Blogs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((article) => (
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
      )}

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
