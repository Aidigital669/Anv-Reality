'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ExternalLink,
  ChevronDown,
  Bell,
  RefreshCw,
  Menu,
  Plus,
  Building,
  Building2,
  FileEdit,
  Layout,
  Upload,
  Check,
  Sparkles,
  Globe
} from 'lucide-react';

interface NavbarProps {
  onOpenMobileSidebar?: () => void;
  onOpenSearch?: () => void;
  onOpenCreateModal?: (type: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Navbar({
  onOpenMobileSidebar,
  onOpenSearch,
  onOpenCreateModal,
  onRefresh,
  isRefreshing = false
}: NavbarProps) {
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'New Public Enquiry',
      desc: 'Siddharth R. requested callback for The Sovereign Horizon Estate (Baner)',
      time: '12m ago',
      unread: true
    },
    {
      id: 2,
      title: 'Automated Cache Purge',
      desc: 'Edge CDN nodes in Pune & Mumbai refreshed successfully',
      time: '45m ago',
      unread: true
    },
    {
      id: 3,
      title: 'Review Awaiting Approval',
      desc: 'Baner 2026 Price Appreciation draft awaiting super-admin sign-off',
      time: '2h ago',
      unread: false
    }
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-zinc-200/90 px-4 lg:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-zinc-500">
          <span className="text-zinc-500">Website Admin</span>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-900 font-semibold">Dashboard Overview</span>
        </div>

        {/* Production Version Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-700 ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Production v4.2.1</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Search Bar with ⌘K badge */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100/80 hover:bg-zinc-100 border border-zinc-200/70 text-zinc-400 hover:text-zinc-600 text-xs transition min-w-[140px] md:min-w-[190px]"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500 text-xs font-normal">Search</span>
          <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded border border-zinc-300 bg-white text-[10px] font-mono text-zinc-500 shadow-2xs">
            ⌘K
          </span>
        </button>

        {/* anvrealty.com ↗ Public site button */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition shadow-2xs"
        >
          <span>anvrealty.com</span>
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </Link>

        {/* + Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {createDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  onOpenCreateModal?.('scraper');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-amber-900 bg-amber-50/70 hover:bg-amber-100/70 transition font-semibold"
              >
                <Globe className="w-4 h-4 text-amber-800" />
                <span>Import via Link / PDF</span>
                <span className="ml-auto text-[9px] bg-amber-200/80 text-amber-900 px-1 py-0.5 rounded font-mono">AI</span>
              </button>
              <div className="border-t border-zinc-100 my-1"></div>
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  onOpenCreateModal?.('property');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition font-medium"
              >
                <Building className="w-4 h-4 text-zinc-500" />
                <span>New Property</span>
              </button>
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  onOpenCreateModal?.('project');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition font-medium"
              >
                <Building2 className="w-4 h-4 text-zinc-500" />
                <span>New Project</span>
              </button>
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  onOpenCreateModal?.('blog');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition font-medium"
              >
                <FileEdit className="w-4 h-4 text-zinc-500" />
                <span>Write Blog / Insight</span>
              </button>
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  onOpenCreateModal?.('section');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition font-medium"
              >
                <Layout className="w-4 h-4 text-zinc-500" />
                <span>Homepage Section</span>
              </button>
              <div className="border-t border-zinc-100 my-1"></div>
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  onOpenCreateModal?.('media');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition font-medium"
              >
                <Upload className="w-4 h-4 text-zinc-500" />
                <span>Upload Media Asset</span>
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 relative transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 mb-2">
                <span className="font-semibold text-xs text-zinc-900">Notifications</span>
                <span className="text-[11px] text-amber-700 font-medium cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2 rounded-lg text-xs transition ${
                      item.unread ? 'bg-amber-50/60 border border-amber-100/60' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-zinc-800">
                      <span>{item.title}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Refresh / Sync Button */}
        <button
          onClick={onRefresh}
          className={`p-2 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition ${
            isRefreshing ? 'animate-spin text-amber-700' : ''
          }`}
          title="Sync & Refresh Data"
          aria-label="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
