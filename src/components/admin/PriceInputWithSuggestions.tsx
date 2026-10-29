'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Tag, Sparkles, Check } from 'lucide-react';

export interface PriceSuggestion {
  value: string;
  label: string;
  numericWords: string;
  badge: 'Cr' | 'Lakh' | 'TH' | 'Rent';
  badgeColor: string;
}

interface PriceInputWithSuggestionsProps {
  value: string;
  onChange: (val: string) => void;
  listingType?: 'Buy' | 'Rent' | 'Sale' | string;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
}

export function formatIndianNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n);
}

export function generatePriceSuggestions(input: string, listingType: string = 'Buy'): PriceSuggestion[] {
  const isRent = listingType === 'Rent';
  const clean = (input || '').trim();

  // Extract number part
  const match = clean.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!match) {
    if (isRent) {
      return [
        {
          value: '₹25,000 / month',
          label: '₹25,000 / month',
          numericWords: '₹25,000 • Twenty-Five Thousand',
          badge: 'TH',
          badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
        },
        {
          value: '₹45,000 / month',
          label: '₹45,000 / month',
          numericWords: '₹45,000 • Forty-Five Thousand',
          badge: 'TH',
          badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
        },
        {
          value: '₹1.2 Lakh / month',
          label: '₹1.2 Lakh / month',
          numericWords: '₹1,20,000 • One Lakh Twenty Thousand',
          badge: 'Lakh',
          badgeColor: 'bg-blue-100 text-blue-900 border-blue-300'
        },
        {
          value: '₹2.5 Lakh / month',
          label: '₹2.5 Lakh / month',
          numericWords: '₹2,50,000 • Two Lakh Fifty Thousand',
          badge: 'Lakh',
          badgeColor: 'bg-blue-100 text-blue-900 border-blue-300'
        }
      ];
    }
    return [
      {
        value: '₹85 Lakh',
        label: '₹85 Lakh',
        numericWords: '₹85,00,000 • Eighty-Five Lakhs',
        badge: 'Lakh',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300'
      },
      {
        value: '₹1.25 Cr',
        label: '₹1.25 Cr',
        numericWords: '₹1,25,00,000 • One Point Two Five Crore',
        badge: 'Cr',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
      },
      {
        value: '₹2.50 Cr',
        label: '₹2.50 Cr',
        numericWords: '₹2,50,00,000 • Two Point Five Crore',
        badge: 'Cr',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
      },
      {
        value: '₹4.75 Cr',
        label: '₹4.75 Cr',
        numericWords: '₹4,75,00,000 • Four Point Seven Five Crore',
        badge: 'Cr',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
      }
    ];
  }

  const num = parseFloat(match[1]);
  if (isNaN(num) || num <= 0) return [];

  const suggestions: PriceSuggestion[] = [];

  // Helper for crore
  suggestions.push({
    value: `₹${num} Cr`,
    label: `₹${num} Cr`,
    numericWords: `${num} Crore • ₹${formatIndianNumber(Math.round(num * 10000000))}`,
    badge: 'Cr',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
  });

  // Helper for lakh
  suggestions.push({
    value: `₹${num} Lakh`,
    label: `₹${num} Lakh`,
    numericWords: `${num} Lakh • ₹${formatIndianNumber(Math.round(num * 100000))}`,
    badge: 'Lakh',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300'
  });

  // Helper for thousand (TH)
  const thousandsNumber = num < 1000 ? Math.round(num * 1000) : Math.round(num);
  suggestions.push({
    value: isRent ? `₹${formatIndianNumber(thousandsNumber)} / month` : `₹${num} Thousand`,
    label: `₹${num} Thousand (TH)`,
    numericWords: `${num} Thousand • ₹${formatIndianNumber(thousandsNumber)}`,
    badge: 'TH',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  });

  // If num >= 10 and integer, suggest decimal Crore (e.g. typing 12 suggests 1.2 Cr, 85 suggests 8.5 Cr)
  if (num >= 10 && Number.isInteger(num)) {
    const decimalCr = (num / 10).toFixed(1).replace(/\.0$/, '');
    const numDec = parseFloat(decimalCr);
    suggestions.push({
      value: `₹${decimalCr} Cr`,
      label: `₹${decimalCr} Cr`,
      numericWords: `${decimalCr} Crore • ₹${formatIndianNumber(Math.round(numDec * 10000000))}`,
      badge: 'Cr',
      badgeColor: 'bg-amber-50 text-amber-950 border-amber-200'
    });
  }

  // If Rent mode, also suggest rent formatting
  if (isRent) {
    const rentAmount = num < 1000 ? Math.round(num * 1000) : Math.round(num);
    suggestions.push({
      value: `₹${formatIndianNumber(rentAmount)} / month`,
      label: `₹${formatIndianNumber(rentAmount)} / month`,
      numericWords: `Monthly Lease Rental`,
      badge: 'Rent',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300'
    });
  }

  return suggestions;
}

export function PriceInputWithSuggestions({
  value,
  onChange,
  listingType = 'Buy',
  placeholder,
  className,
  id,
  required
}: PriceInputWithSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = generatePriceSuggestions(value, listingType);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestedValue: string) => {
    onChange(suggestedValue);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex].value);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  // Quick unit shortcuts
  const applyQuickUnit = (unit: 'Cr' | 'Lakh' | 'TH' | 'Month') => {
    const match = (value || '').match(/([0-9]+(?:\.[0-9]+)?)/);
    const numStr = match ? match[1] : '1';
    let newValue = `₹${numStr} Cr`;

    if (unit === 'Cr') {
      newValue = `₹${numStr} Cr`;
    } else if (unit === 'Lakh') {
      newValue = `₹${numStr} Lakh`;
    } else if (unit === 'TH') {
      newValue = `₹${numStr} Thousand`;
    } else if (unit === 'Month') {
      const num = parseFloat(numStr);
      const formatted = num < 1000 ? formatIndianNumber(Math.round(num * 1000)) : formatIndianNumber(Math.round(num));
      newValue = `₹${formatted} / month`;
    }

    onChange(newValue);
    setIsOpen(false);
  };

  const defaultPlaceholder =
    placeholder || (listingType === 'Rent' ? 'e.g. ₹45,000 / month' : 'e.g. ₹1.85 Cr');

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          required={required}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={defaultPlaceholder}
          className={
            className ||
            'w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition'
          }
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center cursor-pointer"
            title="Clear price"
          >
            ×
          </button>
        )}
      </div>

      {/* Quick Unit Format Chips directly below input */}
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Quick:</span>
        <button
          type="button"
          onClick={() => applyQuickUnit('Cr')}
          className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 transition cursor-pointer active:scale-95 shadow-2xs"
          title="Format as Crore"
        >
          Cr
        </button>
        <button
          type="button"
          onClick={() => applyQuickUnit('Lakh')}
          className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/90 transition cursor-pointer active:scale-95 shadow-2xs"
          title="Format as Lakh"
        >
          Lakh
        </button>
        <button
          type="button"
          onClick={() => applyQuickUnit('TH')}
          className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/90 transition cursor-pointer active:scale-95 shadow-2xs"
          title="Format as Thousand (TH)"
        >
          TH
        </button>
        {listingType === 'Rent' && (
          <button
            type="button"
            onClick={() => applyQuickUnit('Month')}
            className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/90 transition cursor-pointer active:scale-95 shadow-2xs"
            title="Format as Monthly Rent"
          >
            / Month
          </button>
        )}
      </div>

      {/* Floating Auto-suggestions Popover */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.18)] border border-zinc-200 ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-zinc-100 bg-zinc-50/80 flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Suggested Price Formats</span>
            </span>
            <span className="font-normal text-[9px] text-zinc-400">Use ↑ ↓ & Enter</span>
          </div>

          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-zinc-50">
            {suggestions.map((suggestion, idx) => {
              const isSelected = selectedIndex === idx;
              const isCurrent = value.trim().toLowerCase() === suggestion.value.trim().toLowerCase();
              return (
                <button
                  key={suggestion.value + idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion.value)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-2.5 py-2 text-left rounded-lg transition flex items-center justify-between gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 text-zinc-950 font-bold'
                      : isCurrent
                      ? 'bg-amber-50 text-amber-950 font-semibold'
                      : 'hover:bg-zinc-100/80 text-zinc-800'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                        <span>{suggestion.label}</span>
                        {isCurrent && <Check className="w-3 h-3 text-emerald-600" />}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate mt-0.5 font-medium">
                        {suggestion.numericWords}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${suggestion.badgeColor}`}
                  >
                    {suggestion.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

