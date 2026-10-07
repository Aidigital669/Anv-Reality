'use client';

import React from 'react';
import { SlidersHorizontal, ArrowRight } from 'lucide-react';
import { PipelineItem } from './types';

interface PublishingPipelineProps {
  items?: PipelineItem[];
  onManageQueue?: () => void;
}

export function PublishingPipeline({
  items = [
    { id: '1', label: 'Drafts in Progress', count: 0, color: 'bg-zinc-400' },
    { id: '2', label: 'Editorial In Review', count: 0, color: 'bg-amber-500' },
    { id: '3', label: 'Scheduled to Publish', count: 0, color: 'bg-amber-700' },
    { id: '4', label: 'Live Public Pages', count: 0, color: 'bg-emerald-500' }
  ],
  onManageQueue
}: PublishingPipelineProps) {
  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
        <div className="flex items-center gap-2.5">
          <div className="text-amber-800">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-zinc-900 text-[15px] tracking-tight">
            Publishing Pipeline
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-semibold text-zinc-500 tracking-tight">
            CMS Engine <span className="text-emerald-700 font-bold">Active</span>
          </span>
        </div>
      </div>

      {/* Items list */}
      <div className="mt-3.5 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-xs py-1 hover:bg-zinc-50/70 px-2 rounded-lg transition"
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-zinc-600 font-medium">{item.label}</span>
            </div>
            <span className="font-bold text-zinc-900 font-mono text-[13px]">
              {item.count}
            </span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={onManageQueue}
        className="w-full mt-4 py-2.5 px-4 bg-zinc-100/90 hover:bg-zinc-200/80 text-zinc-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition shadow-2xs group"
      >
        <span>Manage Editorial Queue</span>
        <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
