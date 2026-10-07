'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Building,
  DollarSign,
  MapPin,
  Flame,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { CrmLead } from '@/lib/crm-data';

interface CrmAddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (newLead: CrmLead) => void;
}

export function CrmAddLeadModal({
  isOpen,
  onClose,
  onAddLead
}: CrmAddLeadModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [property, setProperty] = useState('VTP Altair');
  const [bhk, setBhk] = useState('3BHK Sky Suite');
  const [budget, setBudget] = useState('₹1.5 - 2.0 Cr');
  const [location, setLocation] = useState('Baner, Pune');
  const [source, setSource] = useState('Website Discovery');
  const [temperature, setTemperature] = useState<'hot' | 'warm' | 'cold'>('hot');
  const [assignedTo, setAssignedTo] = useState('Prem Sharma');
  const [isNri, setIsNri] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newCode = `ANV-LD-${Math.floor(10000 + Math.random() * 90000)}`;

    const lead: CrmLead = {
      id: `ld-${Date.now()}`,
      code: newCode,
      name: name.trim(),
      designation: 'Luxury Property Seeker',
      residence: location,
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@patron.com`,
      isNri,
      nriTag: isNri ? 'NRI Patron' : undefined,
      reraVerified: true,
      interest: {
        property,
        bhk,
        sqft: '1,450 sq.ft',
        budget,
        rawBudget: 1.8
      },
      location,
      source,
      sourceType: source.includes('Google') ? 'google_ads' : source.includes('WhatsApp') ? 'whatsapp' : 'website',
      status: 'Qualified',
      stage: 'qualified',
      temperature,
      assignedTo,
      followUp: {
        display: 'Today, 4:00 PM',
        subtext: 'Newly Ingested'
      },
      dna: {
        configuration: bhk,
        targetBudget: budget,
        preferredLocations: location,
        purchasePurpose: 'Primary Self-Use',
        possessionHorizon: 'Within 6 Months',
        financingStatus: 'Pre-approved Banking'
      },
      matchedProperties: [
        {
          id: `match-${Date.now()}`,
          name: property,
          subtitle: `${bhk} • ${location} • ${budget}`,
          tag: 'SMART MATCH',
          price: budget.split('-')[0].trim(),
          priceNum: 1.8,
          details: 'Prime orientation with scenic skyline views',
          actionLabel: 'Brochure'
        }
      ],
      callTimeline: [
        {
          id: `call-${Date.now()}`,
          title: 'Lead Ingested into CRM',
          duration: 'System Ingest',
          time: 'Just Now',
          summary: `Lead created by ${assignedTo} for ${property} in ${location}.`,
          recordingFile: ''
        }
      ]
    };

    onAddLead(lead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-amber-500/30 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <span>+ Ingest New Sales Lead</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-400 text-zinc-950 text-[10px] font-bold">
                CRM
              </span>
            </h3>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Add qualified prospect to the Western Pune luxury sales pipeline
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rajesh Singhania"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98200 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-amber-500 focus:outline-hidden font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="patron@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                Target Property
              </label>
              <select
                value={property}
                onChange={(e) => setProperty(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
              >
                <option value="VTP Altair">VTP Altair (Baner)</option>
                <option value="ANV Sky Villas">ANV Sky Villas (Balewadi)</option>
                <option value="The Sovereign Horizon">The Sovereign Horizon</option>
                <option value="Godrej Emerald">Godrej Emerald (Wakad)</option>
                <option value="Kohinoor Presidentia">Kohinoor Presidentia</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                Typology / BHK
              </label>
              <select
                value={bhk}
                onChange={(e) => setBhk(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
              >
                <option value="2BHK">2 BHK</option>
                <option value="3BHK Sky Suite">3 BHK Sky Suite</option>
                <option value="4.5BHK Penthouse">4.5 BHK Penthouse</option>
                <option value="Luxury Villa">Bespoke Villa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                Budget Range
              </label>
              <input
                type="text"
                placeholder="₹1.5 - 2.0 Cr"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="Baner, Pune"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                Lead Priority
              </label>
              <select
                value={temperature}
                onChange={(e) => setTemperature(e.target.value as any)}
                className="w-full px-2.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-amber-500"
              >
                <option value="hot">🔥 Hot Priority</option>
                <option value="warm">☀️ Warm</option>
                <option value="cold">❄️ Cold</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                Source Channel
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-2.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-amber-500"
              >
                <option value="Website Discovery">Website</option>
                <option value="Google Ads (Luxury)">Google Ads</option>
                <option value="WhatsApp Campaign">WhatsApp</option>
                <option value="Referral (HNI Circle)">Referral</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                Assigned Agent
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-2.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-amber-500"
              >
                <option value="Prem Sharma">Prem Sharma</option>
                <option value="Neha Patil">Neha Patil</option>
                <option value="UNASSIGNED">Unassigned</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isNri"
              checked={isNri}
              onChange={(e) => setIsNri(e.target.checked)}
              className="rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="isNri" className="text-xs text-zinc-700 font-medium">
              Flag as NRI / Overseas Patron (Foreign Remittance / NRE Account)
            </label>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-300 text-zinc-700 font-semibold rounded-xl hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl shadow-xs"
            >
              Ingest & Assign Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
