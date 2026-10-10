'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneForwarded,
  PhoneMissed,
  CheckCircle2,
  Clock,
  Calendar,
  Download,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit2,
  Share2,
  Flame,
  Check,
  X,
  Building,
  User,
  AlertCircle,
  FileText,
  MessageSquare
} from 'lucide-react';

export interface CallRecordItem {
  id: string;
  code: string;
  type: 'Outgoing' | 'Incoming IVR' | 'Dialer Bot' | 'Direct Outbound';
  time: string;
  duration: string;
  outcome: 'Interested' | 'Callback Requested' | 'Not Connected' | 'Connected';
  customerName: string;
  customerPhone: string;
  subtext: string;
  leadCode: string;
  leadProperty: string;
  advisor: string;
  iconType: 'out' | 'in' | 'bot';
}

const INITIAL_CALLS: CallRecordItem[] = [];

export function CrmCallsTab() {
  const [calls, setCalls] = useState<CallRecordItem[]>(INITIAL_CALLS);
  const [selectedCallId, setSelectedCallId] = useState<string>('');
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [activeDateTab, setActiveDateTab] = useState<'today' | 'yesterday' | 'week' | 'month' | 'custom'>('today');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live fetch from backend API
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const res = await fetch('/api/crm/calls');
        const data = await res.json();
        if (data.success && Array.isArray(data.calls)) {
          const mapped: CallRecordItem[] = data.calls.map((c: any) => ({
            id: String(c.id),
            code: `CALL-00${c.id}`,
            type: c.direction === 'INBOUND' ? 'Incoming IVR' : 'Outgoing',
            time: c.callTime || '11:30 AM',
            duration: c.duration || '04:12',
            outcome: c.status === 'COMPLETED' ? 'Connected' : c.status === 'INTERESTED' ? 'Interested' : 'Callback Requested',
            customerName: c.leadName || 'Private Patron',
            customerPhone: c.phone || '+91 98200 00000',
            subtext: c.summary ? (c.summary.length > 35 ? c.summary.slice(0, 35) + '...' : c.summary) : 'Call Logged',
            leadCode: `LD-00${c.id}`,
            leadProperty: 'Curated Residence',
            advisor: c.agentName || 'Sales Advisor',
            iconType: c.direction === 'INBOUND' ? 'in' : 'out'
          }));
          setCalls(mapped);
          if (mapped.length > 0) {
            setSelectedCallId(mapped[0].id);
          }
        }
      } catch (err) {
        console.log('CRM calls fallback to initial data:', err);
      }
    };
    fetchCalls();
  }, []);

  // Filter states
  const [typeFilter, setTypeFilter] = useState('All');
  const [outcomeFilter, setOutcomeFilter] = useState('All');
  const [advisorFilter, setAdvisorFilter] = useState('All');
  const [tempFilter, setTempFilter] = useState('All');
  const [durationFilter, setDurationFilter] = useState('All');

  // Log Call Drawer Form State
  const [logCustomer, setLogCustomer] = useState('');
  const [logLead, setLogLead] = useState('');
  const [logDirection, setLogDirection] = useState<'Outgoing' | 'Incoming'>('Outgoing');
  const [logDateTime, setLogDateTime] = useState('Today, 11:30 AM');
  const [logDuration, setLogDuration] = useState('05m 00s');
  const [logOutcome, setLogOutcome] = useState('Interested 🔥');
  const [logNotes, setLogNotes] = useState('');
  const [logNextAction, setLogNextAction] = useState('Schedule Site Visit');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveCall = async (andSchedule = false) => {
    const custName = logCustomer.split('(')[0].trim() || 'Patron';
    const custPhone = logCustomer.match(/\((.*?)\)/)?.[1] || '+91 98200 00000';
    const newCall: CallRecordItem = {
      id: `c-${Date.now()}`,
      code: `CALL-00${Math.floor(1000 + Math.random() * 9000)}`,
      type: logDirection === 'Outgoing' ? 'Outgoing' : 'Incoming IVR',
      time: logDateTime.split(',')[1]?.trim() || '11:45 AM',
      duration: logDuration.replace('m ', ':').replace('s', ''),
      outcome: logOutcome.includes('Interested')
        ? 'Interested'
        : logOutcome.includes('Connected')
        ? 'Connected'
        : 'Callback Requested',
      customerName: custName,
      customerPhone: custPhone,
      subtext: andSchedule ? 'Site Visit Requisition Sent' : 'Call Logged Manually',
      leadCode: logLead.split('—')[0].trim() || 'LD-001',
      leadProperty: logLead.split('—')[1]?.trim() || 'Curated Residence',
      advisor: 'Sales Advisor',
      iconType: logDirection === 'Outgoing' ? 'out' : 'in'
    };

    setCalls([newCall, ...calls]);
    setSelectedCallId(newCall.id);
    setIsLogCallOpen(false);

    try {
      await fetch('/api/crm/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName: custName,
          phone: custPhone,
          direction: logDirection === 'Outgoing' ? 'OUTBOUND' : 'INBOUND',
          duration: logDuration,
          summary: logNotes,
          agentName: 'Rohit Sharma',
          status: logOutcome.includes('Interested') ? 'INTERESTED' : 'COMPLETED'
        })
      });

      if (andSchedule) {
        await fetch('/api/crm/site-visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadName: custName,
            leadPhone: custPhone,
            projectName: logLead.split('—')[1]?.trim() || 'ANV Heights 3 BHK',
            visitDate: '26 Oct 2026',
            visitTime: '04:00 PM',
            assignedAgent: 'Rohit Sharma'
          })
        });
      }
    } catch (err) {
      console.error('Failed to commit call log to backend:', err);
    }

    showToast(
      andSchedule
        ? `Saved call & scheduled visit for ${newCall.customerName}!`
        : `Call logged successfully for ${newCall.customerName}`
    );
  };

  const selectedCall = calls.find((c) => c.id === selectedCallId) || (calls.length > 0 ? calls[0] : null);

  const totalCallsCount = calls.length;
  const outgoingCallsCount = calls.filter((c) => c.type === 'Outgoing' || c.type === 'Direct Outbound').length;
  const incomingCallsCount = calls.filter((c) => c.type === 'Incoming IVR').length;
  const connectedCallsCount = calls.filter((c) => c.outcome === 'Connected').length;
  const callbackCallsCount = calls.filter((c) => c.outcome === 'Callback Requested').length;
  const interestedCallsCount = calls.filter((c) => c.outcome === 'Interested').length;

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-950 text-white px-4 py-2.5 rounded-xl shadow-xl border border-zinc-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Title & Top Controls matching Screenshot 1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Calls</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Track customer communication, call outcomes, Exotel recordings, and pipeline next actions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast(`Exporting ${calls.length} call logs to CSV format...`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => showToast('Call filter parameters drawer opened')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <span>Filter</span>
          </button>

          <button
            onClick={() => setIsLogCallOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>+ Log Call</span>
          </button>
        </div>
      </div>

      {/* 2. 6 KPI Metric Cards matching Screenshot 1 */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* TOTAL LOGGED CALLS */}
        <div 
          className={`bg-white border ${typeFilter === 'All' && outcomeFilter === 'All' ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-300'} rounded-xl p-3.5 shadow-2xs flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98]`} 
          onClick={() => { setTypeFilter('All'); setOutcomeFilter('All'); }}
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${typeFilter === 'All' && outcomeFilter === 'All' ? 'text-zinc-900' : 'text-zinc-500'}`}>
              TOTAL LOGGED CALLS
            </span>
            <Phone className={`w-3.5 h-3.5 ${typeFilter === 'All' && outcomeFilter === 'All' ? 'text-zinc-900' : 'text-zinc-400'}`} />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900">{totalCallsCount}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
              All registered CRM logs
            </div>
          </div>
        </div>

        {/* OUTGOING CALLS */}
        <div 
          className={`bg-white border ${typeFilter === 'Outgoing' ? 'border-sky-500 ring-1 ring-sky-500' : 'border-zinc-200 hover:border-sky-300'} rounded-xl p-3.5 shadow-2xs flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98]`} 
          onClick={() => setTypeFilter(typeFilter === 'Outgoing' ? 'All' : 'Outgoing')}
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${typeFilter === 'Outgoing' ? 'text-sky-700' : 'text-zinc-500'}`}>
              OUTGOING CALLS
            </span>
            <ArrowUpRight className={`w-3.5 h-3.5 ${typeFilter === 'Outgoing' ? 'text-sky-600' : 'text-zinc-400'}`} />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900">{outgoingCallsCount}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
              Manually initiated
            </div>
          </div>
        </div>

        {/* INCOMING LOGGED */}
        <div 
          className={`bg-white border ${typeFilter === 'Incoming IVR' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-zinc-200 hover:border-emerald-300'} rounded-xl p-3.5 shadow-2xs flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98]`} 
          onClick={() => setTypeFilter(typeFilter === 'Incoming IVR' ? 'All' : 'Incoming IVR')}
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${typeFilter === 'Incoming IVR' ? 'text-emerald-700' : 'text-zinc-500'}`}>
              INCOMING LOGGED
            </span>
            <Check className={`w-3.5 h-3.5 ${typeFilter === 'Incoming IVR' ? 'text-emerald-600' : 'text-emerald-500'}`} />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900">{incomingCallsCount}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
              Manual inbound entries
            </div>
          </div>
        </div>

        {/* CONNECTED */}
        <div 
          className={`bg-white border ${outcomeFilter === 'Connected' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-zinc-200 hover:border-emerald-300'} rounded-xl p-3.5 shadow-2xs flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98]`} 
          onClick={() => setOutcomeFilter(outcomeFilter === 'Connected' ? 'All' : 'Connected')}
        >
          <div className="flex items-center justify-between text-emerald-600">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${outcomeFilter === 'Connected' ? 'text-emerald-700' : 'text-zinc-500'}`}>
              CONNECTED
            </span>
            <PhoneCall className={`w-3.5 h-3.5 ${outcomeFilter === 'Connected' ? 'text-emerald-600' : 'text-emerald-500'}`} />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900">{connectedCallsCount}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
              Successful connects
            </div>
          </div>
        </div>

        {/* CALLBACK REQUESTED */}
        <div 
          className={`bg-white border ${outcomeFilter === 'Callback Requested' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-zinc-200 hover:border-amber-300'} rounded-xl p-3.5 shadow-2xs flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98]`} 
          onClick={() => setOutcomeFilter(outcomeFilter === 'Callback Requested' ? 'All' : 'Callback Requested')}
        >
          <div className="flex items-center justify-between text-amber-500">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${outcomeFilter === 'Callback Requested' ? 'text-amber-700' : 'text-zinc-500'}`}>
              CALLBACK REQUESTED
            </span>
            <Clock className={`w-3.5 h-3.5 ${outcomeFilter === 'Callback Requested' ? 'text-amber-600' : 'text-amber-500'}`} />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900">{callbackCallsCount}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
              Pending follow-ups
            </div>
          </div>
        </div>

        {/* FOLLOW-UPS CREATED */}
        <div className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98]" onClick={() => showToast('Dashboard filtered')}>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              FOLLOW-UPS CREATED
            </span>
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900">{interestedCallsCount}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
              Post-call pipeline actions
            </div>
          </div>
        </div>
      </div>

      {/* 3. Information Strip */}
      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-2 text-xs text-zinc-600">
        <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
        <span>
          <strong className="text-zinc-800">Phone tracking:</strong> The CRM currently stores calls logged by employees. Automatic incoming-call detection and call recording require a supported telephony integration.
        </span>
      </div>

      {/* 4. Date Filter Strip & Dropdowns matching Screenshot 1 */}
      <div className="bg-white border border-zinc-200 rounded-xl p-3 space-y-3 shadow-2xs text-xs">
        {/* Top date pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'custom', label: 'Custom Range' }
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDateTab(d.id as any)}
                className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                  activeDateTab === d.id
                    ? 'bg-black text-white font-bold'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-zinc-100 rounded text-zinc-500">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-zinc-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>24 Oct 2024</span>
            </span>
            <button className="p-1 hover:bg-zinc-100 rounded text-zinc-500">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dropdowns row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customer, phone, lead ID..."
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 font-medium cursor-pointer"
            >
              <option>Type: All</option>
              <option>Outgoing</option>
              <option>Incoming IVR</option>
              <option>Dialer Bot</option>
            </select>

            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 font-medium cursor-pointer"
            >
              <option>Outcome: All</option>
              <option>Interested</option>
              <option>Connected</option>
              <option>Callback Requested</option>
              <option>Not Connected</option>
            </select>

            <select
              value={advisorFilter}
              onChange={(e) => setAdvisorFilter(e.target.value)}
              className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 font-medium cursor-pointer"
            >
              <option>Advisor: Rohit Sharma</option>
              <option>Advisor: Neha Patil</option>
              <option>Advisor: Rajesh Varma</option>
            </select>

            <select
              value={tempFilter}
              onChange={(e) => setTempFilter(e.target.value)}
              className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 font-medium cursor-pointer"
            >
              <option>Temperature: All</option>
              <option>Hot</option>
              <option>Warm</option>
              <option>Cold</option>
            </select>

            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 font-medium cursor-pointer"
            >
              <option>Duration: All</option>
              <option>&gt; 5 mins</option>
              <option>&lt; 2 mins</option>
            </select>
          </div>

          <button
            onClick={() => {
              setTypeFilter('All');
              setOutcomeFilter('All');
              setAdvisorFilter('Rohit Sharma');
              setTempFilter('All');
              setDurationFilter('All');
              showToast('Call filters cleared');
            }}
            className="text-zinc-500 hover:text-zinc-950 font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* 5. Main 2-Column Split: Recent Records & Deep Dossier matching Screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 of 12): Call Records List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium px-1">
            <span>RECENT CALL RECORDS (SHOWING {calls.length} CALLS)</span>
            <span>Sort by: Time (Newest)</span>
          </div>

          <div className="space-y-2.5">
            {(() => {
              const filteredCalls = calls.filter((c) => {
                if (typeFilter !== 'All' && c.type !== typeFilter) return false;
                if (outcomeFilter !== 'All' && c.outcome !== outcomeFilter) return false;
                return true;
              });

              if (filteredCalls.length === 0) {
                return (
                  <div className="p-8 bg-white border border-zinc-200 rounded-xl text-center space-y-2">
                    <Phone className="w-8 h-8 text-zinc-300 mx-auto" />
                    <p className="text-sm font-semibold text-zinc-700">No Call Records Found</p>
                    <p className="text-xs text-zinc-400">Adjust filters or click &quot;+ Log Call&quot; above to log your first call interaction.</p>
                  </div>
                );
              }

              return filteredCalls.map((c) => {
              const isSelected = selectedCallId === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCallId(c.id)}
                  className={`p-3.5 bg-white border rounded-xl shadow-2xs hover:shadow-md transition cursor-pointer ${
                    isSelected
                      ? 'border-zinc-950 ring-1 ring-zinc-950'
                      : 'border-zinc-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
                        {c.iconType === 'out' && <ArrowUpRight className="w-4 h-4" />}
                        {c.iconType === 'in' && <Check className="w-4 h-4 text-emerald-400" />}
                        {c.iconType === 'bot' && <PhoneMissed className="w-4 h-4 text-rose-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-zinc-950">{c.code}</span>
                          <span className="text-[10px] text-zinc-400">{c.type}</span>
                          <span className="text-[10px] text-zinc-500">
                            {c.time} ({c.duration})
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-zinc-900 mt-0.5">
                          {c.customerName}{' '}
                          <span className="font-normal text-zinc-400">{c.customerPhone}</span>
                        </h4>
                      </div>
                    </div>

                    <div className="text-right">
                      {c.outcome === 'Interested' && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[10px]">
                          Interested 🔥
                        </span>
                      )}
                      {c.outcome === 'Callback Requested' && (
                        <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-bold text-[10px]">
                          Callback Requested
                        </span>
                      )}
                      {c.outcome === 'Not Connected' && (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                          Not Connected ✕
                        </span>
                      )}
                      {c.outcome === 'Connected' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                          Connected ✓
                        </span>
                      )}
                      <p className="text-[10px] text-zinc-400 mt-1">{c.subtext}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-100 text-[10px] text-zinc-500">
                    <span>
                      Lead: <strong className="text-zinc-800">{c.leadCode}</strong> ({c.leadProperty}) • Advisor: {c.advisor}
                    </span>
                    <button className="font-bold text-zinc-900 hover:underline">
                      {isSelected ? 'Active Dossier' : 'View'}
                    </button>
                  </div>
                </div>
              );
            });
          })()}
          </div>
        </div>

        {/* Right Column (7 of 12): Deep Call Dossier */}
        {!selectedCall ? (
          <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-12 text-center shadow-2xs space-y-3 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">No Call Selected</h3>
            <p className="text-xs text-zinc-500 max-w-sm">
              Select a call record from the left list to review detailed conversation notes, advisor information, and follow-up history.
            </p>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-4">
          {/* Dossier Header */}
          <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-zinc-950">{selectedCall.code}</h3>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[10px]">
                  Interested 🔥
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px]">
                  {selectedCall.type} Call
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Today, {selectedCall.time} • Duration: {selectedCall.duration}s • Method: Manual CRM Entry
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button className="flex items-center gap-1 px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs font-semibold text-zinc-700">
                <Edit2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Edit</span>
              </button>
              <button className="p-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-zinc-500">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3 Summary Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase text-zinc-400">CUSTOMER</span>
              <p className="font-bold text-zinc-950">{selectedCall.customerName}</p>
              <p className="text-[10px] text-zinc-500">{selectedCall.customerPhone}</p>
              <p className="text-[10px] text-zinc-400">VP Eng • TechCorp</p>
              <button className="text-[10px] font-bold text-zinc-900 hover:underline pt-1 flex items-center gap-0.5">
                <span>View Customer</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase text-zinc-400">LINKED LEAD</span>
              <p className="font-bold text-zinc-950">{selectedCall.leadCode} (Hot)</p>
              <p className="text-[10px] text-zinc-500">ANV Heights 3 BHK</p>
              <p className="text-[10px] text-zinc-400">₹1.50 Cr - ₹2.00 Cr</p>
              <button className="text-[10px] font-bold text-zinc-900 hover:underline pt-1 flex items-center gap-0.5">
                <span>View Lead</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase text-zinc-400">ADVISOR</span>
              <p className="font-bold text-zinc-950">{selectedCall.advisor}</p>
              <p className="text-[10px] text-zinc-500">Sales Executive</p>
              <p className="text-[10px] text-emerald-600 font-medium">Online • Active</p>
              <button className="text-[10px] font-bold text-zinc-900 hover:underline pt-1 flex items-center gap-0.5">
                <span>View Profile</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Call Recording Box */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 text-xs">CALL RECORDING</span>
              <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-200/80 px-2 py-0.5 rounded">
                Not Available
              </span>
            </div>
            <p className="text-zinc-500 text-[11px] pt-1">
              No call recording available — Call recordings require a supported telephony integration.
            </p>
          </div>

          {/* Executive Call Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-zinc-900 uppercase">
                EXECUTIVE CALL SUMMARY
              </span>
              <span className="text-[10px] text-zinc-400">
                Logged manually by {selectedCall.advisor}
              </span>
            </div>
            <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50/70 p-3 rounded-xl border border-zinc-200">
              "Client confirmed keen interest in ANV Heights 3 BHK Sky Suites. Specifically looking for Tower B, east-facing corner unit located on or above the 14th floor. Discussed the developer's 20:80 bank subvention scheme. Client holds an existing pre-sanctioned home loan letter from HDFC Bank for ₹1.20 Cr. Confirmed attendance for private site walkthrough this coming Saturday, 26 Oct at 4:00 PM along with his spouse."
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2 bg-zinc-50 rounded-lg">
                <span className="text-[10px] text-zinc-400 block">Config:</span>
                <span className="font-semibold text-zinc-800">3 BHK (1,840 sq.ft)</span>
              </div>
              <div className="p-2 bg-zinc-50 rounded-lg">
                <span className="text-[10px] text-zinc-400 block">Budget:</span>
                <span className="font-semibold text-zinc-800">₹1.85 Cr Max</span>
              </div>
              <div className="p-2 bg-zinc-50 rounded-lg">
                <span className="text-[10px] text-zinc-400 block">Location:</span>
                <span className="font-semibold text-zinc-800">Baner / Balewadi</span>
              </div>
              <div className="p-2 bg-zinc-50 rounded-lg">
                <span className="text-[10px] text-zinc-400 block">Timeline:</span>
                <span className="font-semibold text-zinc-800">Within 12 Months</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100">
            <button
              onClick={() => showToast('Opening Site Visit Scheduler for this client')}
              className="px-3.5 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              + Schedule Site Visit
            </button>
            <button
              onClick={() => showToast('Created follow-up reminder in CRM')}
              className="px-3.5 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-semibold transition"
            >
              + Create Follow-up
            </button>
            <button
              onClick={() => showToast('Generating recommendation brief')}
              className="px-3.5 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-semibold transition"
            >
              Recommend
            </button>
          </div>

          {/* Communication Audit Trail */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <span className="font-bold text-xs text-zinc-950 uppercase">
              COMMUNICATION AUDIT TRAIL
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <p className="font-bold text-zinc-900">Site visit requisition dispatched</p>
                  <p className="text-[10px] text-zinc-400">11:38 AM • Automated SMS & WhatsApp invite sent to {selectedCall.customerName}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <p className="font-bold text-zinc-900">Outcome marked Interested 🔥</p>
                  <p className="text-[10px] text-zinc-400">11:37 AM • Logged by Advisor {selectedCall.advisor}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <p className="font-bold text-zinc-900">Exotel call session ended (06m 42s)</p>
                  <p className="text-[10px] text-zinc-400">11:36 AM • Webhook received from Exotel Gateway</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <p className="font-bold text-zinc-900">Outbound dial initiated</p>
                  <p className="text-[10px] text-zinc-400">11:30 AM • Click-to-call by {selectedCall.advisor} via CTI</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call History With Rahul */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-950 uppercase">
                CALL HISTORY WITH {selectedCall.customerName.toUpperCase()}
              </span>
              <span className="text-[10px] text-zinc-400">3 total interactions</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-zinc-900">30 Sep 2024 • Outgoing (03:21)</p>
                  <p className="text-[10px] text-zinc-500">Connected • Initial requirement briefing</p>
                </div>
                <button className="text-zinc-400 hover:text-zinc-900 p-1">↗</button>
              </div>

              <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-zinc-900">28 Sep 2024 • Incoming IVR (05:10)</p>
                  <p className="text-[10px] text-zinc-500">Callback Requested • Requested project brochure</p>
                </div>
                <button className="text-zinc-400 hover:text-zinc-900 p-1">↗</button>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* 6. Operational Performance & Analytics Overview (Bottom matching Screenshot 1) */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">📈</span>
            <span className="font-bold text-zinc-950 uppercase tracking-wide">
              OPERATIONAL PERFORMANCE & CALL ANALYTICS OVERVIEW
            </span>
          </div>
          <span className="text-zinc-400 text-[11px]">
            Real-time operational distribution (Zero-gamification)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Card 1: Call Outcomes Breakdown */}
          <div className="p-3.5 bg-zinc-50/70 border border-zinc-200 rounded-xl space-y-2">
            <span className="font-bold text-[10px] uppercase text-zinc-500">
              CALL OUTCOMES BREAKDOWN
            </span>
            <div className="space-y-1.5 pt-1">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-zinc-800">
                  <span>Interested ({calls.length > 0 ? Math.round((interestedCallsCount / calls.length) * 100) : 0}%)</span>
                  <span>{interestedCallsCount} calls</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden mt-1">
                  <div style={{ width: `${calls.length > 0 ? (interestedCallsCount / calls.length) * 100 : 0}%` }} className="h-full bg-emerald-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-zinc-800">
                  <span>Connected ({calls.length > 0 ? Math.round((connectedCallsCount / calls.length) * 100) : 0}%)</span>
                  <span>{connectedCallsCount} calls</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden mt-1">
                  <div style={{ width: `${calls.length > 0 ? (connectedCallsCount / calls.length) * 100 : 0}%` }} className="h-full bg-blue-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-zinc-800">
                  <span>Callbacks / Missed ({calls.length > 0 ? Math.round((callbackCallsCount / calls.length) * 100) : 0}%)</span>
                  <span>{callbackCallsCount} calls</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden mt-1">
                  <div style={{ width: `${calls.length > 0 ? (callbackCallsCount / calls.length) * 100 : 0}%` }} className="h-full bg-amber-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Call Direction Distribution */}
          <div className="p-3.5 bg-zinc-50/70 border border-zinc-200 rounded-xl space-y-2 flex flex-col justify-between">
            <span className="font-bold text-[10px] uppercase text-zinc-500">
              CALL DIRECTION DISTRIBUTION
            </span>
            <div className="flex items-center justify-between text-center pt-1">
              <div>
                <span className="text-2xl font-bold text-zinc-900">{outgoingCallsCount}</span>
                <p className="text-[10px] text-zinc-400">Outbound ({calls.length > 0 ? Math.round((outgoingCallsCount / calls.length) * 100) : 0}%)</p>
              </div>
              <div className="h-8 w-px bg-zinc-200" />
              <div>
                <span className="text-2xl font-bold text-zinc-900">{incomingCallsCount}</span>
                <p className="text-[10px] text-zinc-400">Inbound IVR ({calls.length > 0 ? Math.round((incomingCallsCount / calls.length) * 100) : 0}%)</p>
              </div>
            </div>
            <div className="text-[10px] text-zinc-500 border-t border-zinc-200 pt-2 text-center">
              Telephony sync active
            </div>
          </div>

          {/* Card 3: Advisor Distribution */}
          <div className="p-3.5 bg-zinc-50/70 border border-zinc-200 rounded-xl space-y-2">
            <span className="font-bold text-[10px] uppercase text-zinc-500">
              ADVISOR DISTRIBUTION
            </span>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-800 font-semibold">Logged Calls</span>
                <span className="font-bold text-zinc-950">{calls.length} calls</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Active Advisors</span>
                <span className="font-medium text-zinc-800">
                  {new Set(calls.map((c) => c.advisor)).size} active
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Operational Metrics */}
          <div className="p-3.5 bg-zinc-50/70 border border-zinc-200 rounded-xl space-y-2">
            <span className="font-bold text-[10px] uppercase text-zinc-500">
              OPERATIONAL METRICS
            </span>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Follow-ups Generated:</span>
                <span className="font-bold text-zinc-900">{interestedCallsCount} Actions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Site Visits Requisitioned:</span>
                <span className="font-bold text-emerald-600">{interestedCallsCount} Visits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Telephony Status:</span>
                <span className="font-bold text-zinc-900">Active Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Slide-over Drawer: Log New Call (Top right in Screenshot 1) */}
      {isLogCallOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-zinc-200 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-900" />
                <div>
                  <h3 className="font-bold text-sm text-zinc-950">Log New Call</h3>
                  <p className="text-[10px] text-zinc-500">
                    Record inbound or outbound conversation details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLogCallOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Customer *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={logCustomer}
                    onChange={(e) => setLogCustomer(e.target.value)}
                    placeholder="Enter customer name or phone..."
                    className="w-full p-2.5 pr-8 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Associated Lead
                </label>
                <select
                  value={logLead}
                  onChange={(e) => setLogLead(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 cursor-pointer"
                >
                  <option value="">Select Associated Lead (Optional)</option>
                  <option value="LD-00124 — ANV Heights 3 BHK Sky Suite (Baner)">
                    LD-00124 — ANV Heights 3 BHK Sky Suite (Baner)
                  </option>
                  <option value="LD-00118 — VTP Altair Duplex (Balewadi)">
                    LD-00118 — VTP Altair Duplex (Balewadi)
                  </option>
                  <option value="LD-00109 — Godrej Emerald 3 BHK (Wakad)">
                    LD-00109 — Godrej Emerald 3 BHK (Wakad)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Call Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogDirection('Outgoing')}
                    className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                      logDirection === 'Outgoing'
                        ? 'bg-black text-white'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Outgoing</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogDirection('Incoming')}
                    className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                      logDirection === 'Incoming'
                        ? 'bg-black text-white'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Incoming</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="text"
                    value={logDateTime}
                    onChange={(e) => setLogDateTime(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={logDuration}
                    onChange={(e) => setLogDuration(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Call Outcome
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Interested 🔥',
                    'Connected',
                    'Callback Req.',
                    'Not Connected',
                    'Not Interested'
                  ].map((oc) => (
                    <button
                      key={oc}
                      type="button"
                      onClick={() => setLogOutcome(oc)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                        logOutcome === oc
                          ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {oc}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Key Conversation Highlights
                </label>
                <textarea
                  rows={3}
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Enter conversation highlights, customer requirements, budget, etc..."
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Immediate Next Action
                </label>
                <select
                  value={logNextAction}
                  onChange={(e) => setLogNextAction(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs cursor-pointer"
                >
                  <option value="Schedule Site Visit">Schedule Site Visit</option>
                  <option value="Send Brochure via WhatsApp">Send Brochure via WhatsApp</option>
                  <option value="Follow-up Call">Follow-up Call</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Assigned Advisor
                </label>
                <div className="p-2.5 bg-zinc-100/70 border border-zinc-200 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-zinc-950 text-white font-bold text-[10px] flex items-center justify-center">
                      RS
                    </span>
                    <span className="font-bold text-zinc-900">Rohit Sharma</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Current Session</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsLogCallOpen(false)}
                className="px-3.5 py-2 font-medium text-zinc-600 hover:text-zinc-950"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveCall(false)}
                className="px-3.5 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 font-bold text-zinc-900 rounded-lg transition"
              >
                Save Call
              </button>
              <button
                type="button"
                onClick={() => handleSaveCall(true)}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white font-bold rounded-lg transition shadow-xs"
              >
                Save & Schedule Visit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
