'use client';

import React, { useState, useMemo } from 'react';
import {
  Flame,
  ShieldCheck,
  Maximize2,
  MoreVertical,
  Phone,
  MessageSquare,
  Mail,
  Share2,
  Edit3,
  Building,
  Star,
  Calendar,
  Car,
  Play,
  Pause,
  Volume2,
  ArrowRight,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';
import { CrmLead } from '@/lib/crm-data';
import { calculatePropertyMatch } from '@/lib/crm-algorithm';

interface CrmLeadDossierProps {
  lead: CrmLead;
  onUpdateStage?: (leadId: string, newStage: string) => void;
  onClose?: () => void;
}

const CRM_AVAILABLE_INVENTORY = [
  {
    id: 'prop-1',
    name: 'ANV Heights Sky Suite',
    developer: 'ANV Signature Partner',
    price: '₹1.85 Cr',
    priceRaw: 18500000,
    bhk: '3 BHK',
    location: 'Baner Western Corridor, Pune',
    locality: 'Baner',
    sqft: '1,250 sq.ft',
    status: "Under-Construction (Mar '26)",
    details: 'East Facing Corner Unit, High Floor, 2 Reserved Car Parks'
  },
  {
    id: 'prop-2',
    name: 'VTP Altair Residences',
    developer: 'VTP Realty',
    price: '₹1.49 Cr',
    priceRaw: 14900000,
    bhk: '3 BHK',
    location: 'Baner, Pune',
    locality: 'Baner',
    sqft: '1,146 sq.ft',
    status: "Under-Construction (Mar '26)",
    details: 'Italian Marble, Private Sky Deck, Smart Home Automation'
  },
  {
    id: 'prop-3',
    name: 'The Sovereign Horizon Estate',
    developer: 'Sovereign Luxury',
    price: '₹2.10 Cr',
    priceRaw: 21000000,
    bhk: '4 BHK',
    location: 'Kalyani Nagar, Pune',
    locality: 'Kalyani Nagar',
    sqft: '1,400 sq.ft',
    status: 'Ready to Move',
    details: 'Direct Biometric Lift Access, Double-Height Sun Deck'
  },
  {
    id: 'prop-4',
    name: 'Godrej Hillside Reserve',
    developer: 'Godrej Properties',
    price: '₹1.65 Cr',
    priceRaw: 16500000,
    bhk: '3 BHK',
    location: 'Mahalunge, Pune',
    locality: 'Mahalunge',
    sqft: '1,180 sq.ft',
    status: "Under-Construction (Jun '26)",
    details: '400+ Trees, Olympic-length pool, Resort Amenities'
  },
  {
    id: 'prop-5',
    name: 'Shivajinagar Embassy Penthouse',
    developer: 'Emirates Sovereign Assets',
    price: '₹6.50 Cr',
    priceRaw: 65000000,
    bhk: '4.5+ BHK Penthouse',
    location: 'Shivajinagar, Model Colony, Pune',
    locality: 'Shivajinagar',
    sqft: '4,100 sq.ft',
    status: 'Ready to Move',
    details: 'Private Plunge Pool, 4-Car Garage, 360° Hill & Skyline Views'
  }
];

export function CrmLeadDossier({
  lead,
  onUpdateStage,
  onClose
}: CrmLeadDossierProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Algorithm 3: Real-time Property DNA Vector Matches
  const propertyMatches = useMemo(() => {
    return CRM_AVAILABLE_INVENTORY.map((prop) => {
      const match = calculatePropertyMatch(lead.dna || {}, prop);
      return {
        ...prop,
        matchScore: match.matchScore,
        isGoldMatch: match.isGoldMatch,
        highlights: match.compatibilityHighlights
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [lead.dna]);

  const handleExecuteNba = () => {
    if (lead.nextBestActionType === 'call') {
      showToast(`Initiating direct CTI call to ${lead.name} (${lead.phone})...`);
    } else if (lead.nextBestActionType === 'whatsapp') {
      showToast(`Preparing WhatsApp brochure dispatch for ${lead.name}...`);
    } else if (lead.nextBestActionType === 'visit') {
      showToast(`Opening site visit scheduling console for ${lead.name}...`);
    } else {
      showToast(`Dispatched: ${lead.nextBestAction || 'Action executed'}`);
    }
  };

  const handleSendWhatsAppPitch = (propertyName: string, price: string) => {
    const message = `Namaste ${lead.name} ji,\n\nFollowing our discussion regarding luxury residences in Pune, here is the curated factsheet for *${propertyName}* (${price}). East-facing unit with verified MahaRERA certification.\n\nWould this Saturday at 4 PM suit you for a private preview?`;
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(message);
      showToast(`WhatsApp pitch copied! Ready to paste into WhatsApp Web.`);
    }
  };

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl shadow-sm overflow-hidden animate-in fade-in">
      {toastMsg && (
        <div className="bg-zinc-950 text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-between border-b border-zinc-800">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Header Row matching design */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Top Pill Badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-md font-extrabold text-[10px] flex items-center gap-1 shadow-2xs ${
              (lead.leadScore ?? 80) >= 75
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-200 text-zinc-800'
            }`}>
              <Flame className="w-3 h-3 fill-current" />
              <span>{(lead.leadScore ?? 80) >= 75 ? 'HOT LEAD' : 'WARM LEAD'}</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-mono text-[10px] font-semibold border border-zinc-200">
              {lead.code}
            </span>
            {lead.isNri && (
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 font-bold text-[10px] border border-indigo-200">
                NRI PATRON
              </span>
            )}
            {lead.reraVerified && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200/70 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>RERA Verified</span>
              </span>
            )}
          </div>

          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            {lead.name}
          </h2>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            {lead.designation} &bull; {lead.residence}
          </p>
          <div className="flex items-center gap-3 text-xs text-zinc-600 mt-1">
            <span className="font-semibold text-zinc-800">{lead.phone}</span>
            <span>&bull;</span>
            <span className="text-zinc-500">{lead.email}</span>
          </div>
        </div>

        {/* Action icons on top right */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => showToast(`Initiating direct call to ${lead.phone}...`)}
            title="Call Lead"
            className="w-8 h-8 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
          </button>
          <button
            onClick={() => handleSendWhatsAppPitch('ANV Heights Sky Suite', '₹1.85 Cr')}
            title="Send WhatsApp Pitch"
            className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => showToast(`Drafting luxury property proposal email to ${lead.email}...`)}
            title="Send Email"
            className="w-8 h-8 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 flex items-center justify-center transition cursor-pointer"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            onClick={() => showToast(`Share link copied to clipboard!`)}
            title="Share"
            className="w-8 h-8 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 flex items-center justify-center transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            title="Options"
            className="w-8 h-8 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* NEXT BEST ACTION PRESCRIPTIVE BANNER (Algorithm 5) */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950 text-white rounded-xl p-4 border border-amber-500/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider">
                Prescriptive Action (Algorithm 5)
              </span>
              <span className="text-[11px] text-amber-200/80 font-medium">
                Next Best Step
              </span>
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              {lead.nextBestAction || 'Initiate Immediate Contact via CTI'}
            </h4>
            <p className="text-xs text-zinc-300 mt-0.5 max-w-xl leading-relaxed">
              {lead.nextBestActionSubtext || 'High-score patron with active purchasing intent.'}
            </p>
          </div>
          <button
            onClick={handleExecuteNba}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Execute Action</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ALGORITHMIC INTENT & VELOCITY COCKPIT (Algorithms 1 & 4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Algorithm 1: Lead Score */}
          <div className="p-3.5 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Dynamic Intent Score (Algorithm 1)
                </span>
                <span className="text-lg font-black text-zinc-900 mt-0.5 flex items-center gap-1.5">
                  <span>{lead.leadScore ?? 84}</span>
                  <span className="text-xs text-zinc-400 font-semibold">/ 100</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold">
                    {(lead.leadScore ?? 84) >= 75 ? '🔥 HOT' : '⚡ WARM'}
                  </span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-1 rounded-md block">
                  {lead.slaLabel || 'SLA: Contact in 15 mins'}
                </span>
              </div>
            </div>
            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${lead.leadScore ?? 84}%` }}
              />
            </div>
            <div className="grid grid-cols-4 gap-1 text-[10px] text-zinc-500 pt-1 border-t border-zinc-100 text-center">
              <div>Budget: <strong className="text-zinc-800">+{lead.scoreBreakdown?.budgetPower ?? 20}</strong></div>
              <div>Urgency: <strong className="text-zinc-800">+{lead.scoreBreakdown?.timelineUrgency ?? 15}</strong></div>
              <div>Finance: <strong className="text-zinc-800">+{lead.scoreBreakdown?.financingHealth ?? 12}</strong></div>
              <div>Engage: <strong className="text-zinc-800">+{lead.scoreBreakdown?.engagementLevel ?? 18}</strong></div>
            </div>
          </div>

          {/* Algorithm 4: Pipeline Churn Risk & Velocity */}
          <div className="p-3.5 bg-white border border-zinc-200 rounded-xl shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Stage Velocity & Churn Risk (Algorithm 4)
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                (lead.churnRisk ?? 0.15) > 0.5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-50 text-emerald-800'
              }`}>
                {(lead.churnRisk ?? 0.15) > 0.5 ? '⚠️ AT RISK' : '✓ HEALTHY PACE'}
              </span>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-zinc-900">
                  {Math.round(((lead.churnRisk ?? 0.15) * 100))}%
                </span>
                <span className="text-xs text-zinc-500 font-medium">Stagnation Churn Probability</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                {lead.churnRisk && lead.churnRisk > 0.5
                  ? 'Lead has exceeded standard stage duration. Immediate touchpoint recommended.'
                  : 'Lead progressing within optimal SLA velocity thresholds for current pipeline stage.'}
              </p>
            </div>
          </div>
        </div>

        {/* 1. CLIENT REQUIREMENT DNA */}
        <div className="border border-zinc-200/80 rounded-xl p-4 bg-zinc-50/40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>Client Requirement DNA</span>
            </h3>
            <button
              onClick={() => showToast('Opening client profile editor...')}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 bg-white border border-zinc-200/70 rounded-lg">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                Configuration
              </span>
              <span className="font-bold text-zinc-900 text-xs mt-0.5 block">
                {lead.dna?.configuration || lead.interest?.bhk || '3 BHK Luxury'}
              </span>
            </div>
            <div className="p-2.5 bg-white border border-zinc-200/70 rounded-lg">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                Target Budget
              </span>
              <span className="font-bold text-amber-800 text-xs mt-0.5 block">
                {lead.dna?.targetBudget || lead.interest?.budget || '₹1.85 Cr'}
              </span>
            </div>
            <div className="p-2.5 bg-white border border-zinc-200/70 rounded-lg">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                Preferred Locations
              </span>
              <span className="font-bold text-zinc-900 text-xs mt-0.5 block">
                {lead.dna?.preferredLocations || lead.location || 'Baner, Pune'}
              </span>
            </div>
            <div className="p-2.5 bg-white border border-zinc-200/70 rounded-lg">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                Purchase Purpose
              </span>
              <span className="font-bold text-zinc-900 text-xs mt-0.5 block">
                {lead.dna?.purchasePurpose || 'Primary Luxury Residence'}
              </span>
            </div>
            <div className="p-2.5 bg-white border border-zinc-200/70 rounded-lg">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                Possession Horizon
              </span>
              <span className="font-bold text-zinc-900 text-xs mt-0.5 block">
                {lead.dna?.possessionHorizon || 'Within 6-12 Months'}
              </span>
            </div>
            <div className="p-2.5 bg-white border border-zinc-200/70 rounded-lg">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                Financing Status
              </span>
              <span className="font-bold text-zinc-900 text-xs mt-0.5 block">
                {lead.dna?.financingStatus || 'Pre-Sanctioned HDFC Bank'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. ALGORITHMIC PROPERTY MATCHES (Algorithm 3) */}
        <div className="border border-zinc-200/80 rounded-xl p-4 bg-zinc-50/40">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>Algorithmic Property Matches (Algorithm 3)</span>
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Vector compatibility based on Budget, Typology, Micro-market, and Possession Status.
              </p>
            </div>
            <span className="text-[11px] text-zinc-600 font-bold bg-white border border-zinc-200 px-2 py-1 rounded-md">
              {propertyMatches.length} Evaluated
            </span>
          </div>

          <div className="space-y-2.5">
            {propertyMatches.slice(0, 3).map((prop) => (
              <div
                key={prop.id}
                className="p-3.5 bg-white border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400 transition"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    prop.isGoldMatch
                      ? 'bg-amber-400 text-black border-amber-500 font-black'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}>
                    {prop.isGoldMatch ? '★' : '🏛'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-zinc-900 text-xs">{prop.name}</span>
                      {prop.isGoldMatch && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-400 text-black font-extrabold text-[9px] shadow-2xs">
                          GOLD MATCH PITCH ({prop.matchScore}%)
                        </span>
                      )}
                      {!prop.isGoldMatch && (
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-bold text-[9px]">
                          {prop.matchScore}% Compatibility
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {prop.developer} &bull; {prop.bhk} ({prop.sqft}) &bull; {prop.location}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {prop.highlights.map((h, i) => (
                        <span key={i} className="text-[10px] text-zinc-600 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded">
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-zinc-100">
                  <div className="text-right">
                    <p className="font-black text-zinc-900 text-xs">{prop.price}</p>
                    <span className="text-[10px] text-zinc-400 block">{prop.status}</span>
                  </div>
                  <button
                    onClick={() => handleSendWhatsAppPitch(prop.name, prop.price)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-2xs cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp Pitch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. UPCOMING SITE VISIT SCHEDULE */}
        {lead.siteVisit && (
          <div className="border border-emerald-200/80 rounded-xl p-4 bg-emerald-50/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Upcoming Site Visit Schedule</span>
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300/60">
                {lead.siteVisit.status}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-3">
              <div>
                <p className="font-bold text-zinc-900">
                  {lead.siteVisit.scheduledDate} at {lead.siteVisit.time}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Location: {lead.siteVisit.location}
                </p>
              </div>
              <p className="text-[11px] text-zinc-600 font-medium">
                Assigned: <strong className="text-zinc-900">{lead.siteVisit.assignedAgent}</strong>
              </p>
            </div>

            {/* Cab Scheduled Box */}
            <div className="p-2.5 bg-white border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-zinc-700 text-[11px]">
                  Cab Scheduled:{' '}
                  <strong className="text-zinc-900">{lead.siteVisit.cab?.model || 'Innova Crysta'}</strong>{' '}
                  ({lead.siteVisit.cab?.plate || 'MH 12 QX 4490'}) &bull; Driver: {lead.siteVisit.cab?.driver || 'Ramesh Kumar'}
                </span>
              </div>
              <button
                onClick={() => showToast('Opening cab scheduling & dispatch console...')}
                className="text-[11px] font-bold text-zinc-700 hover:text-zinc-950 underline cursor-pointer"
              >
                Modify
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3">
              <button
                onClick={() => showToast('Rescheduling dialog opened')}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold cursor-pointer"
              >
                Reschedule
              </button>
              <button
                onClick={() => showToast('Logging feedback for completed visit...')}
                className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-2xs cursor-pointer"
              >
                Log Visit Feedback
              </button>
            </div>
          </div>
        )}

        {/* 4. OMNI-CHANNEL ACTIVITY TIMELINE */}
        <div className="border border-zinc-200/80 rounded-xl p-4 bg-zinc-50/40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Omni-Channel Activity Timeline</span>
            </h3>
            <span className="text-[11px] text-zinc-400 font-medium">Recorded interactions</span>
          </div>

          <div className="space-y-3">
            {(lead.callTimeline && lead.callTimeline.length > 0 ? lead.callTimeline : [
              {
                id: 'tl-1',
                title: 'Outbound Discovery Call (CTI Exotel)',
                duration: '06m 42s',
                time: 'Today, 11:30 AM',
                summary: 'Client confirmed keen interest in higher floor Tower B unit. Pre-sanctioned HDFC letter verified.',
                recordingFile: 'REC_EXOTEL_20261007_001245.mp3'
              },
              {
                id: 'tl-2',
                title: 'Automated WhatsApp Dossier Dispatched',
                duration: 'Delivered',
                time: 'Yesterday, 04:15 PM',
                summary: 'MahaRERA factsheet and architectural deck delivered. Read receipt logged within 4 minutes.',
                recordingFile: ''
              }
            ]).map((item) => (
              <div key={item.id} className="p-3 bg-white border border-zinc-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900">{item.title}</span>
                    <span className="px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 font-mono text-[10px]">
                      {item.duration}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">{item.time}</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  {item.summary}
                </p>

                {/* Audio Recording Player */}
                {item.recordingFile && (
                  <div className="p-2 bg-zinc-50 border border-zinc-200/80 rounded-lg flex items-center justify-between gap-3 text-[11px]">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-6 h-6 rounded-full bg-zinc-950 text-white flex items-center justify-center hover:bg-zinc-800 transition cursor-pointer shrink-0"
                      >
                        {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                      </button>
                      <span className="font-mono text-zinc-600 text-[10px] truncate">
                        {item.recordingFile}
                      </span>
                      {/* Audio Waveform */}
                      <div className="flex items-center gap-0.5 h-3 flex-1 max-w-[120px]">
                        {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 30, 65, 85].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full ${
                              isPlayingAudio ? 'bg-amber-500 animate-pulse' : 'bg-zinc-300'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="font-mono text-zinc-400 text-[10px] shrink-0">
                      06:42
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-100">
          <button
            onClick={() => showToast(`Lead ${lead.name} marked as lost.`)}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
          >
            Mark as Lost
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast(`Generating VIP Patron PDF Dossier for ${lead.name}...`)}
              className="px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition cursor-pointer"
            >
              Share Dossier (PDF)
            </button>
            <button
              onClick={() => {
                onUpdateStage?.(lead.id, 'negotiation');
                showToast(`Lead ${lead.name} successfully moved to Negotiation Stage!`);
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
            >
              Move to Negotiation Stage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
