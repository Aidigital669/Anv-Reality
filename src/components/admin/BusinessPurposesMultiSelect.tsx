'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Check, Briefcase, ChevronDown } from 'lucide-react';
import { INITIAL_BUSINESS_PURPOSES, BusinessPurpose } from '@/lib/business-purposes-constants';

interface BusinessPurposesMultiSelectProps {
  selectedIds: (number | string)[];
  onChange: (ids: number[]) => void;
  label?: string;
}

export function BusinessPurposesMultiSelect({
  selectedIds = [],
  onChange,
  label = 'Suitable Business Purposes'
}: BusinessPurposesMultiSelectProps) {
  const [purposes, setPurposes] = useState<BusinessPurpose[]>(() =>
    INITIAL_BUSINESS_PURPOSES.map((p, idx) => ({
      id: idx + 1,
      name: p.name,
      slug: p.slug,
      isActive: true
    }))
  );
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch live purposes from backend if available
  useEffect(() => {
    fetch('/api/business-purposes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.purposes) && data.purposes.length > 0) {
          setPurposes(data.purposes);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Normalize selected IDs as numbers
  const numericSelected = useMemo(() => {
    return selectedIds
      .map((id) => {
        if (typeof id === 'number') return id;
        const parsed = parseInt(String(id), 10);
        if (!isNaN(parsed)) return parsed;
        const matched = purposes.find((p) => p.slug === id);
        return matched ? matched.id : null;
      })
      .filter((id): id is number => id !== null);
  }, [selectedIds, purposes]);

  const selectedPurposes = useMemo(() => {
    return purposes.filter((p) => numericSelected.includes(p.id));
  }, [purposes, numericSelected]);

  const filteredPurposes = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return purposes;
    return purposes.filter(
      (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    );
  }, [purposes, search]);

  const handleToggle = (id: number) => {
    if (numericSelected.includes(id)) {
      onChange(numericSelected.filter((item) => item !== id));
    } else {
      onChange([...numericSelected, id]);
    }
  };

  const handleRemove = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(numericSelected.filter((item) => item !== id));
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(purposes.map((p) => p.id));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="block font-medium text-zinc-700 text-xs">
          {label}
          <span className="text-[10px] text-zinc-400 font-normal ml-1">
            (Select suitable commercial operations)
          </span>
        </label>
        {numericSelected.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[11px] text-rose-600 hover:underline cursor-pointer font-medium"
          >
            Clear all ({numericSelected.length})
          </button>
        )}
      </div>

      {/* Selected Chips / Tags */}
      {selectedPurposes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-amber-50/50 rounded-xl border border-amber-200/70 max-h-28 overflow-y-auto">
          {selectedPurposes.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white text-zinc-900 border border-amber-300 shadow-2xs group"
            >
              <span>{p.name}</span>
              <button
                type="button"
                onClick={(e) => handleRemove(p.id, e)}
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 transition cursor-pointer"
                title={`Remove ${p.name}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Trigger Box */}
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full min-h-[38px] px-3 py-2 border rounded-lg bg-white cursor-pointer flex items-center justify-between gap-2 text-xs transition ${
            isOpen ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center gap-2 text-zinc-600 truncate">
            <Briefcase className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            {numericSelected.length === 0 ? (
              <span className="text-zinc-400">Select Business Purposes (e.g. Jewellery, Restaurant)...</span>
            ) : (
              <span className="font-semibold text-zinc-900">
                {numericSelected.length} {numericSelected.length === 1 ? 'Purpose' : 'Purposes'} Selected
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-amber-600' : ''
            }`}
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-zinc-200 rounded-xl shadow-xl p-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search business purpose..."
                autoFocus
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between px-1 text-[11px] text-zinc-500 border-b border-zinc-100 pb-1.5">
              <span>{filteredPurposes.length} options</span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-amber-700 hover:underline font-medium cursor-pointer"
                >
                  Select All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-zinc-500 hover:underline cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Checkbox Options List */}
            <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1">
              {filteredPurposes.length === 0 ? (
                <div className="py-4 text-center text-xs text-zinc-400">
                  No matching business purposes
                </div>
              ) : (
                filteredPurposes.map((p) => {
                  const isChecked = numericSelected.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      onClick={() => handleToggle(p.id)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition select-none ${
                        isChecked
                          ? 'bg-amber-50 text-amber-950 font-semibold'
                          : 'hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                            isChecked
                              ? 'bg-amber-500 border-amber-600 text-zinc-950 shadow-2xs'
                              : 'border-zinc-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{p.name}</span>
                      </div>
                      {isChecked && (
                        <span className="text-[10px] text-amber-700 font-bold">Selected</span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
