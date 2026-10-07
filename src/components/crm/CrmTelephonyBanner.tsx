'use client';

import React from 'react';
import { PhoneCall, ArrowRight, Radio } from 'lucide-react';

interface CrmTelephonyBannerProps {
  onOpenLogs?: () => void;
}

export function CrmTelephonyBanner({ onOpenLogs }: CrmTelephonyBannerProps) {
  return (
    <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 sm:px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <PhoneCall className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-950">
              Cloud Telephony Integration (Exotel / Knowlarity)
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-200/70 text-emerald-900 text-[9px] font-bold tracking-wider uppercase">
              <Radio className="w-2.5 h-2.5 text-emerald-700 animate-pulse" />
              LIVE SYNC
            </span>
          </div>
          <p className="text-[11px] text-emerald-800/90 mt-0.5">
            Cloud telephony synchronization ready &bull; All outbound & inbound logs sync directly with CRM customer records.
          </p>
        </div>
      </div>

      <button
        onClick={onOpenLogs}
        className="self-end sm:self-auto text-xs font-bold text-emerald-900 hover:text-emerald-950 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-200 hover:border-emerald-300 transition shadow-2xs cursor-pointer shrink-0"
      >
        <span>View Call Logs</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
