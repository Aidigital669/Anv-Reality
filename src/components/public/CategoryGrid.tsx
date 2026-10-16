'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  BadgePercent,
  Store,
  Laptop,
  Users,
  Home,
  Castle,
  Rocket,
  UtensilsCrossed,
  HeartPulse,
  Hotel,
  MapPin,
  Trees,
  Factory,
  Warehouse,
  Coins,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { CATEGORIES_DATA, CategoryItem } from '@/lib/categories-data';

// Map icon name to Lucide Icon component
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  BadgePercent,
  Store,
  Laptop,
  Users,
  Home,
  Castle,
  Rocket,
  UtensilsCrossed,
  HeartPulse,
  Hotel,
  MapPin,
  Trees,
  Factory,
  Warehouse,
  Coins,
  Briefcase
};

interface CategoryGridProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function CategoryGrid({
  title = "Explore Real Estate by Category",
  subtitle = "Institutional advisory across 17 specialized asset classes in Pune & Western India",
  className = ""
}: CategoryGridProps) {
  return (
    <section className={`py-12 sm:py-16 bg-white border-y border-zinc-200/80 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-900 text-xs font-semibold tracking-wide uppercase mb-3">
            <span>Specialized Asset Portfolios</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-zinc-900 tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 font-light">
            {subtitle}
          </p>
        </div>

        {/* 17 Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {CATEGORIES_DATA.map((cat) => {
            const IconComponent = iconMap[cat.iconName] || Building2;

            return (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="group relative flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl bg-zinc-50 hover:bg-white border border-zinc-200/70 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer"
              >
                {/* Circular Icon Container */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white group-hover:bg-amber-50 border border-zinc-200/80 group-hover:border-amber-300 flex items-center justify-center shadow-xs group-hover:shadow-md transition-all duration-300 mb-3.5 relative">
                  <IconComponent className="w-7 h-7 sm:w-9 sm:h-9 text-zinc-800 group-hover:text-amber-700 transition-colors duration-300 stroke-[1.5]" />

                  {/* Micro badge indicator */}
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500/10 border-2 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  </span>
                </div>

                {/* Category Title */}
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-amber-900 leading-snug transition-colors line-clamp-2">
                  {cat.title}
                </h3>

                {/* Subtitle / Category Group */}
                <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-medium group-hover:text-amber-700/80">
                  {cat.badge}
                </span>

                {/* Subtle Hover Arrow */}
                <span className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
