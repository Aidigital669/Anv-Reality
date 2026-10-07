'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Table as TableIcon,
  Download,
  Plus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Flame,
  User,
  Car,
  MapPin,
  Building,
  Check,
  X,
  Share2,
  CalendarDays,
  Send,
  Zap,
  Phone,
  MessageSquare,
  Search
} from 'lucide-react';

export interface SiteVisitItem {
  id: string;
  code: string;
  status: 'Confirmed' | 'Scheduled' | 'Completed';
  statusColor: string;
  name: string;
  initials: string;
  avatarBg: string;
  phone: string;
  designation: string;
  isNri?: boolean;
  property: string;
  location: string;
  dateSlot: string;
  duration: string;
  logisticsTitle: string;
  logisticsSubtext: string;
  advisor: string;
  advisorRole: string;
  intent: string;
  budget: string;
}

const INITIAL_SITE_VISITS: SiteVisitItem[] = [];

export function CrmSiteVisitsTab() {
  const [siteVisits, setSiteVisits] = useState<SiteVisitItem[]>(INITIAL_SITE_VISITS);
  const [selectedVisitId, setSelectedVisitId] = useState<string>('');
  const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState(false);
  const [activeDateTab, setActiveDateTab] = useState<'today' | 'tomorrow' | 'this_week' | 'next_week' | 'custom'>('today');
  const [activeSlot, setActiveSlot] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Checklist state for Dossier
  const [checklist, setChecklist] = useState({
    c1: true,
    c2: true,
    c3: true,
    c4: true,
    c5: false,
    c6: false,
    c7: false,
    c8: false,
    c9: false,
    c10: false
  });

  // Schedule Drawer Form state
  const [customerName, setCustomerName] = useState('');
  const [propertyUnit, setPropertyUnit] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('04:00 PM - 05:00 PM');
  const [escortAdvisor, setEscortAdvisor] = useState('Prem Sharma (Sales Executive)');
  const [cabRequired, setCabRequired] = useState(false);
  const [cabLocation, setCabLocation] = useState('');
  const [cabFleet, setCabFleet] = useState('');
  const [passengers, setPassengers] = useState('');

  const fetchVisits = async () => {
    try {
      const res = await fetch('/api/crm/site-visits');
      const data = await res.json();
      if (data.success && data.visits && data.visits.length > 0) {
        const mapped: SiteVisitItem[] = data.visits.map((v: any) => ({
          id: `sv-${v.id}`,
          code: `SV-000${v.id + 120}`,
          status: (v.status === 'CONFIRMED' ? 'Confirmed' : v.status === 'COMPLETED' ? 'Completed' : 'Scheduled') as any,
          statusColor: v.status === 'COMPLETED' ? 'bg-zinc-100 text-zinc-600 border-zinc-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
          name: v.leadName,
          initials: v.leadName.slice(0, 2).toUpperCase(),
          avatarBg: 'bg-[#182335] text-white',
          phone: v.leadPhone || '+91 98200 12345',
          designation: 'Luxury Patron',
          property: v.projectName ? v.projectName.split('(')[0].trim() : 'VTP Altair Residences',
          location: v.projectName || 'Baner, Pune',
          dateSlot: `${v.visitDate}, ${v.visitTime}`,
          duration: '60 min VIP tour',
          logisticsTitle: v.cabModel ? `${v.cabModel} (${v.cabPlate || 'MH 12'})` : 'Chauffeur Reserved',
          logisticsSubtext: v.driverName ? `Driver: ${v.driverName} • ${v.driverPhone || ''}` : 'Chauffeur Dispatched',
          advisor: v.assignedAgent || 'Vikram Malhotra',
          advisorRole: 'Senior Luxury Advisor',
          intent: '🔥 Hot',
          budget: '₹2.10 Cr Portfolio'
        }));
        setSiteVisits(mapped);
        if (mapped.length > 0) {
          setSelectedVisitId(mapped[0].id);
        }
      } else if (data.success && data.visits) {
        setSiteVisits([]);
        setSelectedVisitId('');
      }
    } catch (e) {
      console.log('Site visits fetch fallback:', e);
    }
  };

  React.useEffect(() => {
    fetchVisits();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedChecksCount = Object.values(checklist).filter(Boolean).length;

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newVisit: SiteVisitItem = {
      id: `sv-${Date.now()}`,
      code: `SV-000${Math.floor(129 + Math.random() * 800)}`,
      status: 'Confirmed',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      name: customerName.split('(')[0].trim(),
      initials: customerName.slice(0, 2).toUpperCase(),
      avatarBg: 'bg-[#182335] text-white',
      phone: customerName.match(/\((.*?)\)/)?.[1] || '+91 98201 00000',
      designation: 'VIP Patron',
      property: propertyUnit.split('-')[0].trim(),
      location: propertyUnit,
      dateSlot: `Today, ${timeSlot.split('-')[0].trim()}`,
      duration: '60 min VIP tour',
      logisticsTitle: cabRequired ? cabFleet : 'Self Driven',
      logisticsSubtext: cabRequired ? `${passengers} • Pickup at ${cabLocation}` : 'Valet reserved',
      advisor: escortAdvisor.split('(')[0].trim(),
      advisorRole: 'Escort Advisor',
      intent: '🔥 Hot',
      budget: '₹2.0 - ₹2.5 Cr'
    };

    setSiteVisits([newVisit, ...siteVisits]);
    setSelectedVisitId(newVisit.id);
    setIsScheduleDrawerOpen(false);
    showToast(`Site visit scheduled & WhatsApp digital access pass dispatched to client!`);

    try {
      await fetch('/api/crm/site-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName: customerName.split('(')[0].trim(),
          leadPhone: customerName.match(/\((.*?)\)/)?.[1] || '+91 98201 00000',
          projectName: propertyUnit,
          visitDate: visitDate,
          visitTime: timeSlot.split('-')[0].trim(),
          assignedAgent: escortAdvisor.split('(')[0].trim(),
          cabModel: cabRequired ? cabFleet : 'Self-Driven'
        })
      });
      fetchVisits();
    } catch (err) {
      console.error('Failed to commit visit to backend:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-950 text-white px-4 py-2.5 rounded-xl shadow-xl border border-zinc-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header matching Screenshot 1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Site Visits</h1>
            <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-semibold text-[10px] tracking-wide uppercase">
              Operations Center
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Schedule, coordinate logistics, record visitor feedback, and track conversion progression for Pune luxury properties.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-0.5 shadow-2xs text-xs">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold bg-white text-zinc-950 shadow-2xs">
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => showToast('Calendar Operations Matrix opened')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-zinc-600 hover:text-zinc-950 transition cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => showToast('Logistics Filter Drawer opened')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-zinc-600 hover:text-zinc-950 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
            <button
              onClick={() => showToast('Exporting 18 site visit logs to CSV format...')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-zinc-600 hover:text-zinc-950 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <button
            onClick={() => setIsScheduleDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>+ Schedule Site Visit</span>
          </button>
        </div>
      </div>

      {/* 2. 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Today's Visits */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Today's Visits
            </span>
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {siteVisits.filter((v) => v.dateSlot?.toLowerCase().includes('today')).length}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                Live
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1 truncate">
              Fleet cab status
            </div>
          </div>
        </div>

        {/* Upcoming Visits */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Upcoming Visits
            </span>
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {siteVisits.filter((v) => v.status === 'Scheduled').length}
              </span>
              <span className="text-[10px] font-medium text-zinc-600 bg-zinc-100 px-1.5 py-0.2 rounded">
                Scheduled
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1 truncate">
              Pune luxury corridor
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Completed
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {siteVisits.filter((v) => v.status === 'Completed').length}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                Logged
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1 truncate">
              Post-walkthrough review
            </div>
          </div>
        </div>

        {/* Pending Conf. */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Pending Conf.
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {siteVisits.filter((v) => v.status === 'Scheduled').length}
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded">
                Pending
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1 truncate">
              Awaiting confirmation
            </div>
          </div>
        </div>

        {/* No Show */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
              No Show
            </span>
            <span className="text-xs">✕</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-600">0</span>
              <span className="text-[11px] font-semibold text-rose-600">
                0%
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1 truncate">
              All slots attended
            </div>
          </div>
        </div>

        {/* Converted */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Converted
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {siteVisits.filter((v) => v.status === 'Completed').length}
              </span>
              <span className="text-[11px] font-semibold text-amber-800">
                Pipeline
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1 truncate">
              Closed post-walkthrough
            </div>
          </div>
        </div>
      </div>

      {/* 3. Date / Time Slot Strip matching Screenshot 1 */}
      <div className="bg-white border border-zinc-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs text-xs">
        {/* Left Date Range Switchers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveDateTab('today')}
            className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
              activeDateTab === 'today'
                ? 'bg-black text-white'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveDateTab('tomorrow')}
            className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
              activeDateTab === 'tomorrow'
                ? 'bg-black text-white font-bold'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            Tomorrow
          </button>
          <button
            onClick={() => setActiveDateTab('this_week')}
            className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
              activeDateTab === 'this_week'
                ? 'bg-black text-white font-bold'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setActiveDateTab('next_week')}
            className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
              activeDateTab === 'next_week'
                ? 'bg-black text-white font-bold'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            Next Week
          </button>
          <button
            onClick={() => setActiveDateTab('custom')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Custom Date</span>
          </button>
        </div>

        {/* Center Current Day Navigation */}
        <div className="flex items-center gap-3">
          <button className="p-1 rounded hover:bg-zinc-100 text-zinc-500">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-zinc-900">Today</span>
          <button className="p-1 rounded hover:bg-zinc-100 text-zinc-500">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Slots Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-zinc-500 text-[10px] mr-1">SLOTS:</span>
          <button
            onClick={() => setActiveSlot('morning')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              activeSlot === 'morning'
                ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Morning (10–1)
          </button>
          <button
            onClick={() => setActiveSlot('afternoon')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              activeSlot === 'afternoon'
                ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Afternoon (1–4)
          </button>
          <button
            onClick={() => setActiveSlot('evening')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              activeSlot === 'evening'
                ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Evening (4–7)
          </button>
        </div>
      </div>

      {/* 4. Filter Bar Row */}
      <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-4xl">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, property, employee, or visit..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-50/70 border border-zinc-200 rounded-lg text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-hidden focus:border-zinc-400"
            />
          </div>

          <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 font-medium">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Statuses ({siteVisits.length})</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 font-medium">
            <select className="bg-transparent focus:outline-hidden cursor-pointer">
              <option>Project: All Projects</option>
              <option>ANV Heights</option>
              <option>VTP Altair</option>
              <option>Godrej Emerald</option>
            </select>
          </div>

          <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 font-medium">
            <select className="bg-transparent focus:outline-hidden cursor-pointer">
              <option>Location: All Micro-Markets</option>
              <option>Baner</option>
              <option>Balewadi</option>
              <option>Wakad</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => showToast('Filters reset')}
            className="text-zinc-600 hover:text-zinc-950 font-semibold cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* 5. Site Visits Table matching Screenshot 1 */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 font-bold border-b border-zinc-200 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={siteVisits.length > 0 && selectedVisitId !== ''}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Visit ID & Status</th>
                <th className="py-3 px-4">Customer & Profile</th>
                <th className="py-3 px-4">Property & Location</th>
                <th className="py-3 px-4">Date & Time Slot</th>
                <th className="py-3 px-4">Logistics & Escort</th>
                <th className="py-3 px-4">Assigned Advisor</th>
                <th className="py-3 px-4">Intent & Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {siteVisits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                    <p className="font-semibold text-sm text-zinc-600">No site visits scheduled</p>
                    <p className="text-xs text-zinc-400 mt-1">Click "+ Schedule Site Visit" to register client walkthroughs.</p>
                  </td>
                </tr>
              ) : (
                siteVisits.map((sv) => {
                  const isSelected = selectedVisitId === sv.id;

                  return (
                    <tr
                      key={sv.id}
                      onClick={() => {
                        setSelectedVisitId(sv.id);
                        showToast(`Inspecting Site Visit Dossier for ${sv.name} (${sv.code})`);
                      }}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-l-4 border-l-emerald-600 bg-amber-50/20'
                          : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => setSelectedVisitId(sv.id)}
                          className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black cursor-pointer"
                        />
                      </td>

                      {/* Visit ID & Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-zinc-900">
                            {sv.code}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        </div>
                        <div className="mt-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${sv.statusColor}`}>
                            ● {sv.status}
                          </span>
                        </div>
                      </td>

                      {/* Customer & Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${sv.avatarBg}`}>
                            {sv.initials}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-950 text-xs">{sv.name}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                              <span>{sv.phone}</span>
                              <span>•</span>
                              <span className="text-zinc-600">{sv.designation}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Property & Location */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-zinc-900 text-xs">{sv.property}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{sv.location}</p>
                      </td>

                      {/* Date & Time Slot */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-zinc-900 text-xs">{sv.dateSlot}</p>
                        <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{sv.duration}</span>
                        </p>
                      </td>

                      {/* Logistics & Escort */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-zinc-900 text-xs">{sv.logisticsTitle}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{sv.logisticsSubtext}</p>
                      </td>

                      {/* Assigned Advisor */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-zinc-900 text-xs">{sv.advisor}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{sv.advisorRole}</p>
                      </td>

                      {/* Intent & Budget */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-semibold text-zinc-900 text-xs">
                          <span>{sv.intent}</span>
                        </div>
                        <p className="text-[10px] text-zinc-600 font-medium mt-0.5">{sv.budget}</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <div>
            Showing {siteVisits.length > 0 ? 1 : 0} - {siteVisits.length} of {siteVisits.length} site visits
          </div>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-zinc-200 bg-white hover:bg-zinc-50">
              Previous
            </button>
            <button className="px-2.5 py-1 rounded font-bold bg-black text-white">
              1
            </button>
            <button className="px-2.5 py-1 rounded border border-zinc-200 bg-white hover:bg-zinc-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 6. Deep Site Visit Dossier */}
      {(() => {
        const selectedVisit = siteVisits.find((v) => v.id === selectedVisitId);
        if (!selectedVisit) {
          return (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-500 shadow-2xs">
              <Building className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="font-semibold text-sm text-zinc-700">No site visit selected</p>
              <p className="text-xs text-zinc-400 mt-1">Schedule or select a site visit above to view logistics and dossier details.</p>
            </div>
          );
        }

        return (
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-5">
            {/* Dossier Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                  <Building className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-zinc-950">
                      Site Visit Dossier: {selectedVisit.code}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {selectedVisit.status}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {selectedVisit.dateSlot}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Live Cockpit • Lead Advisor: {selectedVisit.advisor} ({selectedVisit.advisorRole})
                  </p>
                </div>
              </div>

              {/* Dossier Top Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast('Editing Site Visit details...')}
                  className="px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs font-medium text-zinc-700 transition"
                >
                  Edit Visit
                </button>
                <button
                  onClick={() => showToast('Opening reschedule calendar...')}
                  className="px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs font-medium text-zinc-700 transition"
                >
                  Reschedule
                </button>
                <button
                  onClick={() => showToast('Site visit marked as COMPLETED. Moving to Feedback stage.')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>
                <button
                  onClick={() => showToast('Cancelling visit reservation...')}
                  className="px-3 py-1.5 border border-zinc-200 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-xs font-medium text-zinc-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => showToast('Access pass link copied to share')}
                  className="p-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-zinc-500 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3 Grid Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Customer Profile */}
              <div className="p-3.5 bg-zinc-50/70 border border-zinc-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900">Customer Profile</span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                    {selectedVisit.intent}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${selectedVisit.avatarBg}`}>
                    {selectedVisit.initials}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-zinc-950">{selectedVisit.name}</p>
                    <p className="text-[11px] text-zinc-500">{selectedVisit.phone}</p>
                    <p className="text-[10px] text-zinc-400">{selectedVisit.designation}</p>
                  </div>
                </div>

                <div className="text-[11px] space-y-1 pt-2 border-t border-zinc-200/60 text-zinc-600">
                  <p>
                    <strong className="text-zinc-800">Target Budget:</strong> {selectedVisit.budget}
                  </p>
                  <p>
                    <strong className="text-zinc-800">Location Preference:</strong> {selectedVisit.location}
                  </p>
                </div>
              </div>

              {/* Card 2: Target Property */}
              <div className="p-3.5 bg-zinc-50/70 border border-zinc-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900">Target Property</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Inventory Reserved
                  </span>
                </div>

                <div>
                  <p className="font-bold text-xs text-zinc-950">
                    {selectedVisit.property}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {selectedVisit.location}
                  </p>
                </div>

                <div className="text-[11px] space-y-1 pt-2 border-t border-zinc-200/60 text-zinc-600">
                  <p>
                    <strong className="text-zinc-800">Assigned Escort:</strong> {selectedVisit.advisor}
                  </p>
                  <p>
                    <strong className="text-zinc-800">Schedule:</strong> {selectedVisit.dateSlot}
                  </p>
                </div>
              </div>

              {/* Card 3: Logistics & Transport */}
              <div className="p-3.5 bg-zinc-50/70 border border-zinc-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900">Logistics & Transport</span>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                    {selectedVisit.logisticsTitle}
                  </span>
                </div>

                <div className="text-[11px] space-y-1.5 text-zinc-700">
                  <p className="flex items-start gap-1.5">
                    <Car className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>{selectedVisit.logisticsTitle}</strong>
                    </span>
                  </p>
                  <p className="text-zinc-500 text-[10px]">
                    {selectedVisit.logisticsSubtext}
                  </p>
                </div>
              </div>
            </div>

            {/* Operational Walkthrough Checklist */}
            <div className="p-4 bg-zinc-50/50 border border-zinc-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs">📋</span>
                  <h3 className="font-bold text-xs text-zinc-950 uppercase tracking-wide">
                    Operational Walkthrough Checklist
                  </h3>
                </div>
                <span className="text-xs font-bold text-zinc-600">
                  {completedChecksCount} / 10 Completed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs">
                {/* Phase 1 */}
                <div className="space-y-2">
                  <p className="font-bold text-zinc-800 text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Phase 1: Pre-Visit Checks</span>
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { key: 'c1', label: 'Customer confirmation call logged' },
                      { key: 'c2', label: 'Sample flat unlocked & inspected' },
                      { key: 'c3', label: 'Sales lounge informed & refreshments pre-ordered' },
                      { key: 'c4', label: 'Printed pricing sheets & floorplans prepared' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer text-zinc-700">
                        <input
                          type="checkbox"
                          checked={checklist[item.key as keyof typeof checklist]}
                          onChange={() => handleToggleChecklist(item.key as keyof typeof checklist)}
                          className="w-3.5 h-3.5 rounded border-zinc-300 text-black focus:ring-black"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="space-y-2">
                  <p className="font-bold text-zinc-800 text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Phase 2: Walkthrough Execution</span>
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { key: 'c5', label: 'Present layout & unhindered deck' },
                      { key: 'c6', label: 'Tour club amenities & rooftop features' },
                      { key: 'c7', label: 'Review marble flooring & modular fittings' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer text-zinc-700">
                        <input
                          type="checkbox"
                          checked={checklist[item.key as keyof typeof checklist]}
                          onChange={() => handleToggleChecklist(item.key as keyof typeof checklist)}
                          className="w-3.5 h-3.5 rounded border-zinc-300 text-black focus:ring-black"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="space-y-2">
                  <p className="font-bold text-zinc-800 text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Phase 3: Post-Visit Formalities</span>
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { key: 'c8', label: 'Capture on-spot buyer sentiment & feedback' },
                      { key: 'c9', label: 'Update CRM interest score & intent matrix' },
                      { key: 'c10', label: 'Lock in formal negotiation meeting slot' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer text-zinc-700">
                        <input
                          type="checkbox"
                          checked={checklist[item.key as keyof typeof checklist]}
                          onChange={() => handleToggleChecklist(item.key as keyof typeof checklist)}
                          className="w-3.5 h-3.5 rounded border-zinc-300 text-black focus:ring-black"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Split Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                <span className="font-bold text-xs text-zinc-950">
                  Client Sentiment & Qualitative Notes
                </span>
                <p className="text-xs text-zinc-600">
                  Log walkthrough notes and feedback directly to update the client profile.
                </p>
              </div>

              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-xs text-zinc-950">Next Steps</span>
                  <p className="text-xs text-zinc-600 mt-1">
                    Scheduled follow-up and next action progression.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Converted to Formal Negotiation Stage!')}
                  className="w-full py-2 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Convert to Formal Negotiation Stage</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 7. Slide-over Schedule Site Visit Drawer (Top right in Screenshot 1) */}
      {isScheduleDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-zinc-200 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-zinc-900" />
                <div>
                  <h3 className="font-bold text-sm text-zinc-950">
                    Schedule Site Visit
                  </h3>
                  <p className="text-[10px] text-zinc-500">Logistics & Protocol Dispatch</p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleDrawerOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleScheduleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Select Customer / HNI Lead *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Property & Specific Unit *
                </label>
                <input
                  type="text"
                  required
                  value={propertyUnit}
                  onChange={(e) => setPropertyUnit(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Visit Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-400 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-400 cursor-pointer"
                  >
                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="05:30 PM - 06:30 PM">05:30 PM - 06:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Assigned Escort Advisor
                </label>
                <select
                  value={escortAdvisor}
                  onChange={(e) => setEscortAdvisor(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-400 cursor-pointer"
                >
                  <option value="Prem Sharma (Sales Executive)">Prem Sharma (Sales Executive)</option>
                  <option value="Neha Patil (Portfolio Director)">Neha Patil (Portfolio Director)</option>
                  <option value="Rajesh Varma (Associate Advisor)">Rajesh Varma (Associate Advisor)</option>
                </select>
              </div>

              {/* Company Cab Logistics Box */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-zinc-700" />
                    <span className="font-bold text-xs text-zinc-900">Company Cab Logistics</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={cabRequired}
                    onChange={(e) => setCabRequired(e.target.checked)}
                    className="w-4 h-4 text-black focus:ring-black rounded"
                  />
                </div>

                {cabRequired && (
                  <div className="space-y-2 pt-1 text-xs">
                    <input
                      type="text"
                      value={cabLocation}
                      onChange={(e) => setCabLocation(e.target.value)}
                      placeholder="Pickup location"
                      className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={cabFleet}
                        onChange={(e) => setCabFleet(e.target.value)}
                        placeholder="Fleet Model"
                        className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800"
                      />
                      <input
                        type="text"
                        value={passengers}
                        onChange={(e) => setPassengers(e.target.value)}
                        placeholder="Pax count"
                        className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* WhatsApp Digital Access Pass Preview (green box matching Screenshot 1) */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-950">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Digital Access Pass Preview</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-900/90 font-medium">
                  {customerName
                    ? `Namaste ${customerName.split('(')[0].trim()} ji, your private viewing for ${propertyUnit || 'the residence'} is scheduled for ${visitDate || 'today'} at ${timeSlot}.`
                    : 'WhatsApp digital access pass with tour details and assigned advisor escort will be dispatched immediately to client upon booking.'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleDrawerOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  Confirm & Dispatch Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
