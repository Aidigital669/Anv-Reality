'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckSquare,
  UserCog,
  PhoneCall,
  BarChart3,
  Settings,
  Plus,
  MoreVertical,
  ExternalLink,
  Globe
} from 'lucide-react';

interface CrmSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenAddLead: () => void;
  onLogout: () => void;
}

export function CrmSidebar({
  currentTab,
  onTabChange,
  onOpenAddLead,
  onLogout
}: CrmSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'leads', label: 'Leads', icon: Users, badge: '86', badgeColor: 'bg-zinc-100 text-zinc-600' },
    { id: 'customers', label: 'Customers', icon: Briefcase, badge: '846', badgeColor: 'bg-zinc-100 text-zinc-600' },
    { id: 'site_visits', label: 'Site Visits', icon: CalendarCheck, badge: '18', badgeColor: 'bg-zinc-100 text-zinc-600' },
    { id: 'employees', label: 'Employees', icon: UserCog, badge: '32 Total', badgeColor: 'bg-amber-100 text-amber-900 border border-amber-200/60 font-bold' },
    { id: 'calls', label: 'Calls', icon: PhoneCall, badge: '86 Today', badgeColor: 'bg-amber-100 text-amber-900 border border-amber-200/60 font-bold' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, badge: null },
  ];

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header matching screenshot */}
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-black text-white font-black text-xs flex items-center justify-center tracking-tight shadow-xs">
            ANV
          </div>
          <div>
            <div className="font-bold text-sm text-zinc-900 tracking-tight leading-tight">
              Anv Reeality
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">Enterprise Real Estate CRM</p>
          </div>
        </div>
      </div>

      {/* Primary Action Button: Schedule Site Visit matching screenshot */}
      <div className="p-3">
        <button
          onClick={onOpenAddLead}
          className="w-full py-2.5 px-3 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <CalendarCheck className="w-4 h-4 text-white" />
          <span>Schedule Site Visit</span>
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-zinc-100 text-zinc-950 font-bold border-l-2 border-zinc-950'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md ${
                    isActive && (item.id === 'employees' || item.id === 'calls')
                      ? 'bg-amber-100 text-amber-900 border border-amber-200/80 font-bold'
                      : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Portal Cross-Navigation Bridges */}
      <div className="p-3 border-t border-zinc-100 bg-zinc-50/50 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[9px]">Active Portals</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg text-[11px] font-semibold text-zinc-700 hover:text-zinc-950 shadow-2xs transition"
          >
            <Globe className="w-3 h-3 text-zinc-500" />
            <span>Website</span>
            <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
          </Link>
          <Link
            href="/admin"
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200/80 hover:bg-amber-100/70 rounded-lg text-[11px] font-bold text-amber-950 shadow-2xs transition"
          >
            <span>Admin CMS</span>
            <ExternalLink className="w-2.5 h-2.5 text-amber-700" />
          </Link>
        </div>
      </div>

      {/* Bottom Profile Bar matching screenshot (Rohit Sharma) */}
      <div className="p-3 border-t border-zinc-100 bg-white">
        <div className="flex items-center justify-between p-2 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-zinc-100/60 transition cursor-pointer">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white font-bold text-xs flex items-center justify-center shrink-0">
              RS
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">Rohit Sharma</p>
              <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                <span className="truncate">Sales Executive</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-emerald-700 font-medium">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Account Options / Sign Out"
            className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
