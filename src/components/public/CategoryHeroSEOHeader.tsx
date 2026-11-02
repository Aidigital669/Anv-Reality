'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Home,
  Sparkles,
  ArrowDown,
  Calendar,
  Phone
} from 'lucide-react';
import { CategoryItem } from '@/lib/categories-data';

interface CategoryHeroSEOHeaderProps {
  category: CategoryItem;
  totalPropertiesCount?: number;
}

export function getCategorySeoHeading(category: CategoryItem): { title: string; intentBadge: string; buyRentText: string } {
  switch (category.slug) {
    case 'office-space':
      return {
        title: 'Office Space for Buy & Lease / Rent in Pune',
        intentBadge: 'Grade-A Commercial Offices',
        buyRentText: 'Available for Purchase, Corporate Long-Term Lease & Warm/Bare-Shell Rent'
      };
    case 'preleased-properties':
      return {
        title: 'Preleased Commercial Properties for Sale & High ROI in Pune',
        intentBadge: 'Day-1 Rental Cashflow • 7-9% Yield',
        buyRentText: 'Pre-Rented Commercial Assets with Tier-1 Corporate & Banking Tenants'
      };
    case 'shop-showroom':
      return {
        title: 'Commercial Shops & Showrooms for Sale & Lease in Pune',
        intentBadge: 'High Footfall • Retail Buy & Rent',
        buyRentText: 'High-Visibility Ground Floor Showrooms & Retail Outlets in Prime Commercial Corridors'
      };
    case 'office-in-it-park':
      return {
        title: 'IT Park Offices & Tech Workspaces for Buy & Lease in Pune',
        intentBadge: 'Grade-A Tech Parks • SEZ / Non-SEZ',
        buyRentText: 'Corporate IT Hubs with 100% DG Backup, Fibre Connectivity & LEED Certifications'
      };
    case 'coworking-office-space':
      return {
        title: 'Coworking & Managed Flexible Workspaces in Pune',
        intentBadge: 'Plug & Play Workspaces',
        buyRentText: 'Fully Furnished Flexible Private Suites, Dedicated Desks & Enterprise Floors'
      };
    case 'restaurant':
      return {
        title: 'Commercial Restaurant & F&B Retail Spaces for Lease / Sale in Pune',
        intentBadge: 'F&B / Hospitality Approved',
        buyRentText: 'Kitchen Exhausts, Gas Pipeline, Grease Traps & High Footfall Commercial Zones'
      };
    case 'warehouse':
      return {
        title: 'Industrial Warehouses, Godowns & Logistics Parks in Pune',
        intentBadge: 'MIDC & National Highway Connectivity',
        buyRentText: 'High-Ceiling PEB Warehouses for Long-Term Lease, 3PL Logistics & Cold Storage'
      };
    case 'residential-apartment':
      return {
        title: 'Luxury Residential Apartments & Flats for Sale in Pune',
        intentBadge: 'Verified Luxury Residences',
        buyRentText: '2, 3, 4 & 5 BHK Premium Apartments with Sky Amenities in Top Pune Neighborhoods'
      };
    case 'residential-bungalow':
      return {
        title: 'Luxury Bungalows, Independent Villas & Row Houses for Sale in Pune',
        intentBadge: 'Exclusive Gated Estates',
        buyRentText: 'Private Garden Villas, Duplex Penthouses & Row Houses with Clear Titles'
      };
    case 'pre-launch-projects':
      return {
        title: 'Pre-Launch Projects & New Launches in Pune',
        intentBadge: 'Early Patron Pricing & Priority Inventory',
        buyRentText: 'First-Access Pre-Launch Allotments from Tier-1 Developers with High Capital Upside'
      };
    case 'residential-commercial-land-plot':
      return {
        title: 'Residential & Commercial NA Land & Plots for Sale in Pune',
        intentBadge: 'Clear Title Collector NA Plots',
        buyRentText: 'Sanctioned NA Plots with Demarcated Boundaries, FSI Potential & Clear Search Reports'
      };
    case 'agriculture-farm-land':
      return {
        title: 'Agricultural Land & Managed Farm Plots for Sale near Pune',
        intentBadge: 'Fertile Soil & Highway Access',
        buyRentText: 'Clear 7/12 Extract Farm Land Parcels for Agro-Tourism, Second Homes & Long-Term Wealth'
      };
    case 'industrial-land':
      return {
        title: 'MIDC & Industrial Land / Factory Plots for Sale in Pune',
        intentBadge: 'MIDC Zone Approved',
        buyRentText: 'Industrial Plots with Water, HT Power & Road Infrastructure for Factories & Ancillaries'
      };
    case 'hospital':
      return {
        title: 'Hospital & Healthcare Commercial Properties for Buy & Lease in Pune',
        intentBadge: 'NABH / Clinical Establishment Approved',
        buyRentText: 'Multi-Speciality Hospital Towers, Diagnostic Centres & Daycare Surgery Clinics'
      };
    case 'hotel-resort':
      return {
        title: 'Commercial Hotels & Luxury Resorts for Sale & Lease in Pune',
        intentBadge: 'Turnkey Hospitality Assets',
        buyRentText: 'Boutique Business Hotels & Scenic Hill Station Resorts with High Occupancy'
      };
    case 'tdr':
      return {
        title: 'Transferable Development Rights (TDR) & FSI Advisory in Pune & PCMC',
        intentBadge: 'PMC & PCMC Sanctioned TDR',
        buyRentText: 'Direct Institutional Trading of Slum, Road Widening & Amenity TDR with Zero Friction'
      };
    case 'group-booking':
      return {
        title: 'Institutional Bulk & Group Booking Real Estate Advisory in Pune',
        intentBadge: 'Direct Developer Group Pricing',
        buyRentText: 'Syndicated Real Estate Purchases with Wholesale Discounting for Corporate Buyers & HNIs'
      };
    default:
      return {
        title: `${category.title} for Buy & Lease in Pune`,
        intentBadge: 'Verified Properties',
        buyRentText: 'Curated Verified Assets with MahaRERA Compliance and Direct Advisory'
      };
  }
}

export function CategoryHeroSEOHeader({
  category,
  totalPropertiesCount
}: CategoryHeroSEOHeaderProps) {
  const seo = getCategorySeoHeading(category);

  const scrollToSearch = (filterTerm?: string) => {
    const el = document.getElementById('search-portal-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    if (filterTerm && typeof window !== 'undefined') {
      const input = document.getElementById('main-search-input') as HTMLInputElement | null;
      if (input) {
        input.value = filterTerm;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  return (
    <section className="bg-zinc-950 text-white border-b border-zinc-800 relative overflow-hidden select-none">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-72 h-72 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 sm:pb-12 relative z-10 space-y-6">
        {/* 1. BREADCRUMBS ROW */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-400 flex-wrap">
          <Link href="/" className="hover:text-amber-400 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <Link href="/properties" className="hover:text-amber-400 transition-colors">
            <span>Categories</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <span className="text-amber-400 font-extrabold">{category.title}</span>
        </nav>

        {/* 2. TOP BADGE & CATEGORY GROUP */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-zinc-950" />
            <span>{seo.intentBadge}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{category.groupLabel}</span>
          </span>

          {typeof totalPropertiesCount === 'number' && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-400 bg-zinc-900/80 px-2.5 py-1 rounded-full border border-zinc-800">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{totalPropertiesCount} Verified Properties</span>
            </span>
          )}
        </div>

        {/* 3. PRIMARY SEO H1 HEADLINE & BUY/RENT/LEASE VALUE */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {seo.title}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-amber-400/95 font-bold leading-snug">
            {category.tagline} — <span className="text-zinc-200 font-normal">{seo.buyRentText}</span>
          </p>

          <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed max-w-4xl font-light">
            {category.overview}
          </p>
        </div>

        {/* 4. INTERACTIVE INTENT & PRIME LOCALITY FILTER CHIPS */}
        <div className="pt-2 space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">
            Quick Filter by Intent &amp; Prime Corridors
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Buy / Sale Chip */}
            <button
              type="button"
              onClick={() => scrollToSearch('Sale')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-amber-400 hover:text-black text-white text-xs font-bold border border-zinc-800 hover:border-amber-400 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              🏷️ Buy / Sale
            </button>

            {/* Lease / Rent Chip */}
            <button
              type="button"
              onClick={() => scrollToSearch('Rent')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-amber-400 hover:text-black text-white text-xs font-bold border border-zinc-800 hover:border-amber-400 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              🔑 Lease / Rent
            </button>

            {/* Ready to Move */}
            <button
              type="button"
              onClick={() => scrollToSearch('Ready to Move')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-amber-400 hover:text-black text-white text-xs font-bold border border-zinc-800 hover:border-amber-400 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              ✨ Ready to Move
            </button>

            {/* Under Construction */}
            <button
              type="button"
              onClick={() => scrollToSearch('Under Construction')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-amber-400 hover:text-black text-white text-xs font-bold border border-zinc-800 hover:border-amber-400 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              🏗️ Under Construction
            </button>

            {/* Prime Localities from Category Data */}
            {category.popularLocalities.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => scrollToSearch(loc)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 hover:text-amber-400 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <MapPin className="w-3 h-3 text-amber-500" />
                <span>{loc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. INSTITUTIONAL ASSURANCES BAR */}
        <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>MahaRERA Registered</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero Brokerage Advisory</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>30-Year Title Verified</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <a href="tel:+919373020701" className="hover:text-amber-400 transition">
              +91 93730 20701
            </a>
          </div>
        </div>

        {/* 6. CALL TO ACTION BUTTONS */}
        <div className="pt-1 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => scrollToSearch()}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <span>Explore {category.title} Properties</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>

          <a
            href="https://wa.me/919373020701?text=Hello%20ANV%20Realty%2C%20I%20am%20interested%20in%20verified%20properties%20for%20the%20following%20category%3A"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <svg viewBox="0 0 32 32" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C8.28 2 2 8.28 2 16c0 2.66.75 5.15 2.05 7.29L2.3 29.7l6.63-1.74A13.9 13.9 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm8.17 19.83c-.34.96-1.7 1.76-2.76 1.99-.73.16-1.68.29-4.88-1.04-4.09-1.69-6.72-5.83-6.93-6.1-.2-.28-1.67-2.22-1.67-4.23s1.05-3.01 1.43-3.42c.38-.41.82-.51 1.1-.51.27 0 .55 0 .79.02.25.01.59-.1.92.7.34.82 1.16 2.83 1.26 3.04.1.2.17.44.03.71-.13.27-.2.44-.4.68-.2.24-.43.53-.61.71-.21.21-.43.44-.19.86.25.41 1.09 1.8 2.34 2.91 1.61 1.43 2.97 1.88 3.39 2.09.42.2.67.18.92-.1.25-.28 1.07-1.24 1.35-1.67.28-.43.56-.36.94-.22.38.14 2.42 1.14 2.83 1.35.41.2.69.31.79.48.1.18.1 1.02-.24 1.98z" />
            </svg>
            <span>WhatsApp Direct Advisory</span>
          </a>
        </div>
      </div>
    </section>
  );
}
