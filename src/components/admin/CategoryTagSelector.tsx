'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

export type PropertyTag = 'Preleased' | 'New' | 'PreLaunch';

export const PRIMARY_CATEGORIES = [
  'Shop',
  'Office',
  'Showroom',
  'Hospital',
  'AgriLand',
  'Industrial Land',
  'Restaurant',
  'Hotel',
  'Resort',
  'Warehouse'
] as const;

export const RESIDENTIAL_TYPOLOGIES = [
  '1 BHK',
  '2 BHK',
  '3 BHK',
  '4 BHK',
  '4.5+ BHK Penthouse',
  'Sky Villa',
  'Residential Bungalow',
  'Residential/Commercial Land/Plot'
] as const;

export const SUB_MENUS: { id: PropertyTag; label: string }[] = [
  { id: 'Preleased', label: '1. Preleased' },
  { id: 'New', label: '2. New' },
  { id: 'PreLaunch', label: '3. PreLaunch' }
];

export interface CategoryTagSelectorProps {
  value: string;
  onChange: (finalValue: string, tag?: PropertyTag | null, category?: string) => void;
  onTagSelected?: (tag: PropertyTag, category: string) => void;
  className?: string;
  placeholder?: string;
}

export function CategoryTagSelector({
  value,
  onChange,
  onTagSelected,
  className = '',
  placeholder = '-- Choose Category / Configuration --'
}: CategoryTagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [showOtherTypologies, setShowOtherTypologies] = useState(false);
  const [customText, setCustomText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse existing value to extract Category and Tag
  const parsed = React.useMemo(() => {
    if (!value || !value.trim()) {
      return { category: '', tag: null as PropertyTag | null };
    }

    const val = value.trim();
    let tag: PropertyTag | null = null;
    let category = val;

    if (/\b(?:preleased|pre-leased|prelease|pre-lease|prerented)\b/i.test(val)) {
      tag = 'Preleased';
    } else if (/\b(?:prelaunch|pre-launch|newly launched)\b/i.test(val)) {
      tag = 'PreLaunch';
    } else if (/\b(?:new)\b/i.test(val)) {
      tag = 'New';
    }

    // Clean category name by stripping the tag part in parentheses or prefixes
    const cleanCat = val
      .replace(/\s*\((?:Preleased|New|PreLaunch|Pre-Launch)\)\s*/gi, '')
      .replace(/^(?:Preleased|Pre-Leased|New|PreLaunch|Pre-Launch)\s+/gi, '')
      .trim();

    const matchedPrimary = PRIMARY_CATEGORIES.find(
      (c) => c.toLowerCase() === cleanCat.toLowerCase()
    );

    if (matchedPrimary) {
      category = matchedPrimary;
    } else {
      category = cleanCat || val;
    }

    return { category, tag };
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTag = (categoryName: string, selectedTag: PropertyTag) => {
    const finalValue = `${categoryName} (${selectedTag})`;
    onChange(finalValue, selectedTag, categoryName);
    if (onTagSelected) {
      onTagSelected(selectedTag, categoryName);
    }
    setIsOpen(false);
    setExpandedCat(null);
  };

  const handleSelectResidentialOrCustom = (typologyName: string, selectedTag?: PropertyTag) => {
    const finalTag = selectedTag || 'New';
    const finalValue = `${typologyName} (${finalTag})`;
    onChange(finalValue, finalTag, typologyName);
    if (onTagSelected) {
      onTagSelected(finalTag, typologyName);
    }
    setIsOpen(false);
  };

  const getTagBadgeStyle = (tag: PropertyTag | null) => {
    if (tag === 'Preleased') {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    if (tag === 'PreLaunch') {
      return 'bg-purple-100 text-purple-900 border-purple-300';
    }
    return 'bg-emerald-100 text-emerald-900 border-emerald-300';
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* 1. Main Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && parsed.category) {
            setExpandedCat(parsed.category);
          }
        }}
        className={`w-full px-3 py-2 border rounded-lg text-left transition flex items-center justify-between cursor-pointer bg-white text-zinc-900 shadow-2xs ${
          isOpen
            ? 'border-amber-500 ring-2 ring-amber-400/20'
            : 'border-zinc-200 hover:border-zinc-300'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {parsed.category ? (
            <>
              <span className="font-semibold text-zinc-900 text-sm truncate">
                {parsed.category}
              </span>
              {parsed.tag && (
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getTagBadgeStyle(
                    parsed.tag
                  )}`}
                >
                  {parsed.tag}
                </span>
              )}
            </>
          ) : (
            <span className="text-zinc-500 font-normal text-sm">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {parsed.category && (
            <span className="text-xs font-semibold text-amber-700 hover:underline">
              {isOpen ? 'Close' : 'Change'}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-amber-600' : ''
            }`}
          />
        </div>
      </button>

      {/* 2. Active Property Tag Notice */}
      {parsed.category && parsed.tag && (
        <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-zinc-500">Property Tag:</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getTagBadgeStyle(
                parsed.tag
              )}`}
            >
              {parsed.tag}
            </span>
            <span className="text-zinc-600 font-medium">({parsed.category})</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            ✓ Tag Active
          </span>
        </div>
      )}

      {/* 3. Dropdown Menu List with Normal Names */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl border border-zinc-200 shadow-xl p-2 text-zinc-900 animate-in fade-in zoom-in-95 duration-150 max-h-[420px] overflow-y-auto space-y-1">
          {/* Header */}
          <div className="px-2 py-1.5 border-b border-zinc-100 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Select Category
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-zinc-400 hover:text-zinc-700 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 10 Categories List with Normal Names */}
          <div className="space-y-1 pt-1">
            {PRIMARY_CATEGORIES.map((catName) => {
              const isCatSelected = parsed.category.toLowerCase() === catName.toLowerCase();
              const isCatExpanded = expandedCat === catName;

              return (
                <div
                  key={catName}
                  className={`rounded-lg border transition ${
                    isCatExpanded
                      ? 'border-amber-400 bg-amber-50/30'
                      : isCatSelected
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-zinc-100 hover:border-zinc-200 bg-white'
                  }`}
                >
                  {/* Category Name Row */}
                  <button
                    type="button"
                    onClick={() => setExpandedCat(isCatExpanded ? null : catName)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span
                      className={`text-sm ${
                        isCatSelected || isCatExpanded
                          ? 'font-bold text-zinc-950'
                          : 'font-medium text-zinc-800 group-hover:text-amber-700'
                      }`}
                    >
                      {catName}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCatSelected && parsed.tag && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getTagBadgeStyle(
                            parsed.tag
                          )}`}
                        >
                          {parsed.tag}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                          isCatExpanded ? 'rotate-180 text-amber-600' : 'group-hover:text-zinc-600'
                        }`}
                      />
                    </div>
                  </button>

                  {/* 3 Sub-Menus: Preleased, New, PreLaunch */}
                  {isCatExpanded && (
                    <div className="px-3 pb-2.5 pt-1 border-t border-amber-100 space-y-1.5 animate-in fade-in duration-150">
                      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
                        Choose option for {catName}:
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {SUB_MENUS.map((sub) => {
                          const isThisTagActive = isCatSelected && parsed.tag === sub.id;

                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => handleSelectTag(catName, sub.id)}
                              className={`py-1.5 px-2 rounded-md text-xs text-center transition cursor-pointer border ${
                                isThisTagActive
                                  ? 'bg-amber-500 text-zinc-950 border-amber-600 font-extrabold shadow-2xs'
                                  : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-200 font-semibold'
                              }`}
                            >
                              <span>{sub.id}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Collapsible: Residential Typologies & Custom Option */}
          <div className="pt-1.5 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setShowOtherTypologies(!showOtherTypologies)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-zinc-600 hover:text-amber-700 cursor-pointer"
            >
              <span>Residential &amp; Other Typologies</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showOtherTypologies ? 'rotate-180 text-amber-600' : ''
                }`}
              />
            </button>

            {showOtherTypologies && (
              <div className="pt-1.5 space-y-2 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-1">
                  {RESIDENTIAL_TYPOLOGIES.map((typology) => {
                    const isSelected = parsed.category.toLowerCase() === typology.toLowerCase();
                    return (
                      <button
                        key={typology}
                        type="button"
                        onClick={() => handleSelectResidentialOrCustom(typology, parsed.tag || 'New')}
                        className={`px-2.5 py-1.5 rounded text-xs text-left transition flex items-center justify-between cursor-pointer border ${
                          isSelected
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                            : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200/80'
                        }`}
                      >
                        <span className="truncate">{typology}</span>
                        {isSelected && <Check className="w-3 h-3 text-amber-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Configuration Input */}
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="Type custom configuration..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customText.trim()) {
                        e.preventDefault();
                        handleSelectResidentialOrCustom(customText.trim(), parsed.tag || 'New');
                      }
                    }}
                    className="flex-1 px-2.5 py-1 text-xs border border-zinc-200 rounded focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-white"
                  />
                  <button
                    type="button"
                    disabled={!customText.trim()}
                    onClick={() => {
                      if (customText.trim()) {
                        handleSelectResidentialOrCustom(customText.trim(), parsed.tag || 'New');
                      }
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded disabled:opacity-40 transition cursor-pointer shrink-0"
                  >
                    Set
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
