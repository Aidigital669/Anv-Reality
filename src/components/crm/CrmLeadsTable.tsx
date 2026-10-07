'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Table as TableIcon,
  Columns3,
  GitBranch,
  Phone,
  MessageSquare,
  ChevronRight,
  Flame,
  Sun,
  Snowflake,
  ExternalLink,
  ShieldCheck,
  Globe,
  Share2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CrmLead } from '@/lib/crm-data';

interface CrmLeadsTableProps {
  leads: CrmLead[];
  selectedLeadId: string;
  onSelectLead: (lead: CrmLead) => void;
  onOpenAddLead: () => void;
}

export function CrmLeadsTable({
  leads,
  selectedLeadId,
  onSelectLead,
  onOpenAddLead
}: CrmLeadsTableProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [tempFilter, setTempFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'pipeline'>('table');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchFilter === '' ||
      lead.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      lead.phone.includes(searchFilter) ||
      lead.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      lead.interest.property.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesTemp = tempFilter === 'all' || lead.temperature === tempFilter;
    const matchesSource = sourceFilter === 'all' || lead.sourceType === sourceFilter;
    const matchesAssigned =
      assignedFilter === 'all' ||
      (assignedFilter === 'prem' && lead.assignedTo === 'Prem Sharma') ||
      (assignedFilter === 'unassigned' && lead.assignedTo === 'UNASSIGNED');

    return matchesSearch && matchesTemp && matchesSource && matchesAssigned;
  });

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl shadow-2xs overflow-hidden">
      {actionNotice && (
        <div className="bg-zinc-950 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between border-b border-zinc-800 animate-in fade-in">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header and View Controls */}
      <div className="p-4 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
            Active Leads & Pipeline Management
          </h2>
          <p className="text-[11px] text-zinc-500">
            Showing prioritized qualified leads in Baner, Balewadi, and Wakad
          </p>
        </div>

        {/* View Switchers & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'kanban'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'pipeline'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
          </div>

          <button
            onClick={() => showNotice('Exporting verified active leads to CSV format...')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddLead}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Row: 5 Filter Controls matching screenshot */}
      <div className="p-3 bg-zinc-50/70 border-b border-zinc-200/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by name, phone..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Temp Filter */}
        <select
          value={tempFilter}
          onChange={(e) => setTempFilter(e.target.value)}
          className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 font-medium focus:outline-hidden focus:border-amber-500 cursor-pointer"
        >
          <option value="all">Temp: All Temperatures</option>
          <option value="hot">🔥 Hot Priority</option>
          <option value="warm">☀️ Warm Leads</option>
          <option value="cold">❄️ Cold Inquiries</option>
        </select>

        {/* Source Filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 font-medium focus:outline-hidden focus:border-amber-500 cursor-pointer"
        >
          <option value="all">Source: All Channels</option>
          <option value="website">Website Discovery</option>
          <option value="google_ads">Google Ads (Luxury)</option>
          <option value="whatsapp">WhatsApp Campaign</option>
          <option value="referral">Referral (HNI Circle)</option>
          <option value="walk_in">Walk-in Gallery</option>
        </select>

        {/* Typology / Budget Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 font-medium focus:outline-hidden focus:border-amber-500 cursor-pointer"
        >
          <option value="all">Type: 3 BHK, 4 BHK, Villa</option>
          <option value="2bhk">2 BHK Executive</option>
          <option value="3bhk">3 BHK Sky Suite</option>
          <option value="4bhk">4.5 BHK Penthouse</option>
          <option value="commercial">Commercial Office</option>
        </select>

        {/* Assigned Filter */}
        <select
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value)}
          className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 font-medium focus:outline-hidden focus:border-amber-500 cursor-pointer"
        >
          <option value="prem">Assigned: Prem Sharma</option>
          <option value="all">Assigned: All Advisors</option>
          <option value="unassigned">Unassigned (Pool)</option>
        </select>
      </div>

      {/* Main Leads Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50 text-zinc-500 font-bold border-b border-zinc-200 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Lead Details</th>
              <th className="py-3 px-4">Interest & Budget</th>
              <th className="py-3 px-4">Location & Source</th>
              <th className="py-3 px-4">Status & Temp</th>
              <th className="py-3 px-4">Follow-up</th>
              <th className="py-3 px-4 text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Filter className="w-8 h-8 text-zinc-300" />
                    <p className="text-sm font-semibold text-zinc-700">No Leads Found</p>
                    <p className="text-xs text-zinc-400">No leads registered yet or matching the selected filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
              const isSelected = lead.id === selectedLeadId;
              const initials = lead.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2);

              return (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className={`group transition-colors duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/80 hover:bg-amber-50'
                      : 'hover:bg-zinc-50/80'
                  }`}
                >
                  {/* Lead Details */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-zinc-950 text-amber-400 ring-2 ring-amber-400'
                            : 'bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-zinc-950 text-xs">
                            {lead.name}
                          </span>
                          {isSelected && (
                            <span className="px-1.5 py-0.2 bg-zinc-950 text-amber-300 font-bold text-[8px] rounded uppercase">
                              SELECTED
                            </span>
                          )}
                          {lead.isNri && (
                            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300/60 font-bold text-[8px] rounded uppercase">
                              {lead.nriTag || 'NRI'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                          <span className="font-mono text-zinc-500 font-medium">
                            {lead.code}
                          </span>
                          <span>&bull;</span>
                          <span>{lead.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Interest & Budget */}
                  <td className="py-3 px-4">
                    <p className="font-semibold text-zinc-900 text-xs">
                      {lead.interest.property} ({lead.interest.bhk})
                    </p>
                    <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                      <strong className="text-zinc-800">{lead.interest.budget}</strong> &bull; {lead.interest.sqft}
                    </p>
                  </td>

                  {/* Location & Source */}
                  <td className="py-3 px-4">
                    <p className="font-medium text-zinc-800 text-xs">
                      {lead.location}
                    </p>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Globe className="w-3 h-3 text-zinc-400" />
                      <span>{lead.source}</span>
                    </p>
                  </td>

                  {/* Status & Temp */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200/80 font-bold text-[10px]">
                        {lead.status}
                      </span>
                      {lead.temperature === 'hot' && (
                        <span className="flex items-center gap-0.5 text-rose-600 font-bold text-[10px]">
                          <Flame className="w-3 h-3 fill-rose-500 text-rose-500" />
                          <span>Hot</span>
                        </span>
                      )}
                      {lead.temperature === 'warm' && (
                        <span className="flex items-center gap-0.5 text-amber-600 font-bold text-[10px]">
                          <Sun className="w-3 h-3 text-amber-500" />
                          <span>Warm</span>
                        </span>
                      )}
                      {lead.temperature === 'cold' && (
                        <span className="flex items-center gap-0.5 text-blue-500 font-bold text-[10px]">
                          <Snowflake className="w-3 h-3 text-blue-400" />
                          <span>Cold</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500">
                      {lead.assignedTo === 'UNASSIGNED' ? (
                        <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded">UNASSIGNED</span>
                      ) : (
                        lead.assignedTo
                      )}
                    </p>
                  </td>

                  {/* Follow-up */}
                  <td className="py-3 px-4">
                    <p className={`font-bold text-xs ${lead.followUp.isOverdue ? 'text-rose-600' : 'text-zinc-900'}`}>
                      {lead.followUp.display}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {lead.followUp.subtext}
                    </p>
                  </td>

                  {/* Quick Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => showNotice(`Initiating direct outbound call to ${lead.name} (${lead.phone})...`)}
                        title="Call Lead"
                        className="p-1.5 rounded-lg border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50 text-zinc-600 hover:text-emerald-700 transition cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => showNotice(`Opening WhatsApp chat link for ${lead.name}...`)}
                        title="Send WhatsApp"
                        className="p-1.5 rounded-lg border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50 text-zinc-600 hover:text-emerald-700 transition cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      {lead.assignedTo === 'UNASSIGNED' ? (
                        <button
                          onClick={() => {
                            lead.assignedTo = 'Prem Sharma';
                            lead.status = 'Contacted';
                            showNotice(`Lead ${lead.name} claimed and assigned to Prem Sharma!`);
                          }}
                          className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg font-bold text-[10px] transition cursor-pointer"
                        >
                          Claim / Assign
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectLead(lead)}
                          className="px-2.5 py-1 bg-amber-100/80 hover:bg-amber-200 text-amber-950 border border-amber-300/80 rounded-lg font-bold text-[10px] transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching screenshot */}
      <div className="p-3 border-t border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
        <div>
          Showing <strong className="text-zinc-900">{filteredLeads.length > 0 ? 1 : 0} – {filteredLeads.length}</strong> of <strong className="text-zinc-900">{filteredLeads.length}</strong> qualified leads
        </div>

        <div className="flex items-center gap-1">
          <button disabled className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white text-zinc-400 disabled:opacity-50 text-xs">
            Previous
          </button>
          <button className="px-2.5 py-1 rounded-lg bg-zinc-950 text-white font-bold text-xs shadow-2xs">
            1
          </button>
          <button disabled className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white text-zinc-400 disabled:opacity-50 text-xs">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
