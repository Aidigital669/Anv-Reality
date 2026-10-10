'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Zap,
  Clock,
  Car,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { CRM_KPI_METRICS } from '@/lib/crm-data';

export function CrmKpiGrid() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [region, setRegion] = useState('Baner, Balewadi, Wakad');
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    newLeads: 0,
    followUps: 0,
    siteVisits: 0,
    convertedDeals: 0,
    conversionRate: '0.0%'
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/crm/metrics');
        const data = await res.json();
        if (data.success && data.kpis) {
          const total = data.kpis.totalLeads ?? 0;
          const visits = data.kpis.scheduledVisits ?? 0;
          const nw = data.kpis.stages?.new ?? 0;
          const converted = data.kpis.activeCustomers ?? 0;
          const followUps = data.kpis.pendingFollowUps ?? 0;
          const rate = total > 0 ? ((converted / total) * 100).toFixed(1) + '%' : '0.0%';
          setMetrics({
            totalLeads: total,
            siteVisits: visits,
            newLeads: nw,
            followUps: followUps,
            convertedDeals: converted,
            conversionRate: rate
          });
        }
      } catch (err) {
        console.log('CRM metrics fetch fallback:', err);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-4">
      {/* Welcome Row with filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              Good Morning, Prem 👋
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-bold tracking-wider">
              Sales Operating System 4.2
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Here is your sales activity and conversion pipeline for today, 12 Oct 2026.
          </p>
        </div>

        {/* Date Filters & Region Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time range switcher */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 text-xs">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'custom', label: 'Custom' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id as any)}
                className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                  timeRange === t.id
                    ? 'bg-white text-zinc-950 font-bold shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Region selector */}
          <div className="relative">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 transition cursor-pointer">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Pune Region: {region}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* 1. TOTAL LEADS */}
        <div className="bg-white border border-zinc-200/90 hover:border-zinc-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-[0.98]" onClick={() => console.log('Dashboard filtered')}>
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Total Leads
            </span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 tracking-tight">{metrics.totalLeads.toLocaleString()}</div>
            <div className="text-[11px] text-zinc-500 font-medium flex items-center gap-1 mt-0.5">
              <span>{metrics.totalLeads} active prospects</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-100 text-[10px] text-zinc-400 truncate">
            Active in Western Corridor
          </div>
        </div>

        {/* 2. NEW LEADS */}
        <div className="bg-white border border-zinc-200/90 hover:border-zinc-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-[0.98]" onClick={() => console.log('Dashboard filtered')}>
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              New Leads
            </span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 tracking-tight">{metrics.newLeads}</div>
            <div className="text-[11px] text-zinc-600 flex items-center gap-1.5 mt-0.5">
              <span className="text-amber-800 font-semibold">{metrics.newLeads} new registered</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-100 text-[10px] text-zinc-400 truncate">
            New lead pipeline
          </div>
        </div>

        {/* 3. FOLLOW-UPS TODAY */}
        <div className="bg-white border border-zinc-200/90 hover:border-zinc-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-[0.98]" onClick={() => console.log('Dashboard filtered')}>
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Follow-ups Today
            </span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 tracking-tight">{metrics.followUps}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-zinc-500">{metrics.followUps} pending actions</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-100 text-[10px] text-zinc-400 truncate font-medium">
            Pipeline action items
          </div>
        </div>

        {/* 4. SITE VISITS */}
        <div className="bg-white border border-zinc-200/90 hover:border-zinc-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-[0.98]" onClick={() => console.log('Dashboard filtered')}>
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Site Visits
            </span>
            <Car className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 tracking-tight">{metrics.siteVisits}</div>
            <div className="text-[11px] text-zinc-600 mt-0.5">
              <span className="font-semibold text-zinc-800">{metrics.siteVisits} Scheduled</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-100 text-[10px] text-zinc-400 truncate">
            Site walkthroughs active
          </div>
        </div>

        {/* 5. CONVERTED DEALS */}
        <div className="bg-white border border-zinc-200/90 hover:border-zinc-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-[0.98]" onClick={() => console.log('Dashboard filtered')}>
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Converted Deals
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 tracking-tight">{metrics.convertedDeals}</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5 truncate">
              {metrics.convertedDeals} Customers closed
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-100 text-[10px] text-zinc-400 truncate">
            Customer acquisitions
          </div>
        </div>

        {/* 6. CONVERSION RATE */}
        <div className="bg-white border border-zinc-200/90 hover:border-zinc-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-[0.98]" onClick={() => console.log('Dashboard filtered')}>
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Conversion Rate
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 tracking-tight">{metrics.conversionRate}</div>
            <div className="text-[11px] text-zinc-500 font-medium mt-0.5">
              Live conversion ratio
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-100 text-[10px] text-zinc-500 font-medium truncate">
            Computed from CRM data
          </div>
        </div>
      </div>
    </div>
  );
}
