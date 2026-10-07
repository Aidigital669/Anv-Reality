'use client';

import React from 'react';
import {
  Building,
  Building2,
  BookOpen,
  Inbox,
  ClipboardList,
  Image as ImageIcon
} from 'lucide-react';
import { MetricCardData } from './types';

interface MetricCardProps {
  data: MetricCardData;
}

export function MetricCard({ data }: MetricCardProps) {
  const renderIcon = () => {
    switch (data.iconName) {
      case 'properties':
        return <Building className="w-4 h-4 text-amber-900/70" />;
      case 'projects':
        return <Building2 className="w-4 h-4 text-amber-900/70" />;
      case 'blogs':
        return <BookOpen className="w-4 h-4 text-amber-900/70" />;
      case 'enquiries':
        return <Inbox className="w-4 h-4 text-amber-900/70" />;
      case 'reviews':
        return <ClipboardList className="w-4 h-4 text-amber-900/70" />;
      case 'media':
        return <ImageIcon className="w-4 h-4 text-amber-900/70" />;
      default:
        return <Building className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-4.5 flex flex-col justify-between hover:shadow-xs transition duration-150">
      {/* Top row: Title + Icon */}
      <div className="flex items-center justify-between text-zinc-600 mb-2">
        <span className="text-[13px] font-medium text-zinc-700 tracking-tight">
          {data.title}
        </span>
        <div className="opacity-80">
          {renderIcon()}
        </div>
      </div>

      {/* Middle row: Big Metric Number */}
      <div className="my-1">
        <span className="text-[26px] sm:text-[28px] font-bold text-zinc-900 tracking-tight leading-none">
          {data.value}
        </span>
      </div>

      {/* Bottom row: Breakdown */}
      <div className="mt-2 pt-1 text-[11px] font-medium flex items-center gap-1.5 flex-wrap">
        {data.primaryStat && (
          <span
            className={
              data.primaryStat.variant === 'emerald'
                ? 'text-emerald-700 font-semibold'
                : data.primaryStat.variant === 'amber'
                ? 'text-amber-800 font-semibold'
                : 'text-zinc-700 font-medium'
            }
          >
            {data.primaryStat.value} {data.primaryStat.label}
          </span>
        )}
        {data.secondaryStat && (
          <span className="text-zinc-500">
            {data.secondaryStat.value} {data.secondaryStat.label}
          </span>
        )}
        {data.note && (
          <span className="text-zinc-500">
            {data.note}
          </span>
        )}
      </div>
    </div>
  );
}
