'use client';

import React, { useState, useEffect } from 'react';
import { Filter, Layers, Loader2 } from 'lucide-react';
import { CRM_PIPELINE_STAGES } from '@/lib/crm-data';

interface CrmPipelineStagesProps {
  selectedStage: string;
  onSelectStage: (stageId: string) => void;
}

export function CrmPipelineStages({
  selectedStage,
  onSelectStage
}: CrmPipelineStagesProps) {
  const [stagesData, setStagesData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/crm/metrics');
        const data = await res.json();
        if (data.success && data.kpis && data.kpis.stages) {
          setStagesData(data.kpis.stages);
        }
      } catch (err) {
        console.error('Failed to fetch pipeline stages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // Map the static config to the live counts
  const liveStages = CRM_PIPELINE_STAGES.map(stage => {
    // stage.id matches the keys in stageMap from the backend (new, contacted, qualified, etc.)
    const count = stagesData[stage.id] || 0;
    return { ...stage, leadsCount: count };
  });

  const totalProspects = liveStages.reduce((acc, s) => acc + s.leadsCount, 0);

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" />
          <h3 className="text-xs font-bold text-zinc-900">
            Comprehensive Sales Pipeline Stages
          </h3>
          <span className="text-[11px] text-zinc-400 font-normal">
            ({totalProspects} active prospects)
          </span>
        </div>

        <button className="self-start sm:self-auto flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-2.5 py-1 rounded-lg hover:bg-zinc-50 transition cursor-pointer">
          <Filter className="w-3 h-3 text-amber-600" />
          <span>Filter Pipeline View</span>
        </button>
      </div>

      {/* 8 Horizontal Stages Grid */}
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {liveStages.map((stage) => {
            const isSelected = selectedStage === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage(stage.id)}
              className={`relative p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-zinc-950 bg-amber-50/70 shadow-xs ring-1 ring-zinc-950'
                  : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-50'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-2 right-2 px-1.5 py-0.2 bg-zinc-950 text-amber-300 font-bold text-[8px] rounded uppercase tracking-wider shadow-2xs">
                  SELECTED
                </span>
              )}
              <div>
                <p className="text-[11px] font-bold text-zinc-800 truncate mb-1">
                  {stage.name}
                </p>
                <p className="text-xs font-extrabold text-zinc-950">
                  {stage.leadsCount} leads
                </p>
              </div>
              <p className="text-[10px] text-zinc-500 font-medium mt-1 truncate">
                {stage.grossValue}
              </p>
            </button>
          );
        })}
        </div>
      )}
    </div>
  );
}
