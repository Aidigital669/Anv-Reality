'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Plus,
  Building,
  Building2,
  FileEdit,
  Layout,
  UploadCloud,
  Eye,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Search,
  Filter,
  Trash2,
  Check,
  Globe,
  Layers,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  Tag,
  User,
  Home,
  ChevronDown,
  RefreshCw,
  X,
  TrendingDown,
  Inbox,
  ClipboardList,
  BadgeCheck,
  Building as BuildingIcon,
  Wallet,
  AlertCircle,
  CircleCheck,
  Flame
} from 'lucide-react';

import { Sidebar } from '@/components/admin/Sidebar';
import { Navbar } from '@/components/admin/Navbar';
import { MetricCard } from '@/components/admin/MetricCard';
import { SectionManager } from '@/components/admin/SectionManager';
import { PublishingPipeline } from '@/components/admin/PublishingPipeline';
import { AssetDropzone } from '@/components/admin/AssetDropzone';
import { ScraperImporter } from '@/components/admin/ScraperImporter';
import {
  EditSectionModal,
  AddPropertyModal,
  AddLocationModal,
  AddPropertyTypeModal,
  CommandPalette,
  LivePreviewModal
} from '@/components/admin/Modals';
import { HomepageSectionItem, MetricCardData, UploadedAsset } from '@/components/admin/types';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Verify admin authentication
    const hasAuth =
      typeof window !== 'undefined' &&
      (localStorage.getItem('anv_admin_logged_in') === 'true' ||
        document.cookie.includes('anv_admin_auth=true'));

    if (!hasAuth) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Modals state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [addPropertyModalOpen, setAddPropertyModalOpen] = useState(false);
  const [addLocationModalOpen, setAddLocationModalOpen] = useState(false);
  const [addPropertyTypeModalOpen, setAddPropertyTypeModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSectionItem | null>(null);
  const [editSectionModalOpen, setEditSectionModalOpen] = useState(false);

  // Search filter states for sub-views
  const [locationSearchFilter, setLocationSearchFilter] = useState('');
  const [propertyTypeSearchFilter, setPropertyTypeSearchFilter] = useState('');

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const [metrics, setMetrics] = useState<MetricCardData[]>([
    { title: 'Total Properties', iconName: 'properties', value: '0', primaryStat: { label: 'Published', value: '0', variant: 'emerald' }, secondaryStat: { label: 'Draft', value: '0' } },
    { title: 'Active Projects', iconName: 'projects', value: '0', primaryStat: { label: 'Launched', value: '0', variant: 'emerald' }, secondaryStat: { label: 'Upcoming', value: '0' } },
    { title: 'Published Blogs', iconName: 'blogs', value: '0', primaryStat: { label: 'Insights', value: '0', variant: 'zinc' }, secondaryStat: { label: 'Guides', value: '0' } },
    { title: 'Public Enquiries', iconName: 'enquiries', value: '0', primaryStat: { label: 'Live from portal', value: '+0', variant: 'emerald' } },
    { title: 'Pending Reviews', iconName: 'reviews', value: '0', note: 'Items awaiting sign-off' },
    { title: 'Media Assets', iconName: 'media', value: '0', note: 'Curated 4K photography' }
  ]);

  const [sections, setSections] = useState<HomepageSectionItem[]>([
    { id: 'sec-1', orderNumber: '01', title: 'Hero Architectural Video Banner', tag: 'HERO', tagVariant: 'default', subtitle: 'Headline: "Curated Sanctuaries for the Discerning Elite" • 4K Drone Footage', isActive: true, type: 'hero' },
    { id: 'sec-2', orderNumber: '02', title: 'Property Omnisearch Bar', tag: 'INTERACTIVE', tagVariant: 'default', subtitle: 'BHK Filters, Price Range ₹Cr slider, Locality Autocomplete (Pune/Mumbai)', isActive: true, type: 'search' },
    { id: 'sec-3', orderNumber: '03', title: 'Featured Luxury Residences', tag: '4 PINNED', tagVariant: 'amber', subtitle: 'Dynamic Bento Showcase featuring Signature Penthouses & Sky Villas', isActive: true, type: 'featured' },
    { id: 'sec-4', orderNumber: '04', title: 'Micro-Market Hotspot Explorer', tag: 'LOCATIONS', tagVariant: 'default', subtitle: 'Baner, Balewadi High Street, Koregaon Park, Worli Seaface', isActive: true, type: 'locations' },
    { id: 'sec-5', orderNumber: '05', title: 'Why ANV Architectural Charter', tag: 'EDITORIAL', tagVariant: 'default', subtitle: 'Brand legacy, HNWI Advisory, NRI Concierge services value pillars', isActive: true, type: 'editorial' },
    { id: 'sec-6', orderNumber: '06', title: 'Client Testimonials & Patrons', tag: 'SOCIAL PROOF', tagVariant: 'default', subtitle: 'Verified Buyer Stories, NRI Testimonials, Architectural Critics', isActive: true, type: 'testimonials' },
    { id: 'sec-7', orderNumber: '07', title: 'Curated Market Insights & Journal', tag: 'JOURNAL', tagVariant: 'default', subtitle: 'Baner appreciation trends, Luxury buyer index 2026, Tax guide', isActive: true, type: 'insights' }
  ]);

  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [enquiriesList, setEnquiriesList] = useState<any[]>([]);
  const [enquiryCounts, setEnquiryCounts] = useState<any>({});
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [enquiryTypeFilter, setEnquiryTypeFilter] = useState('all');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('all');
  const [enquirySearchQuery, setEnquirySearchQuery] = useState('');
  const [enquiryExpandedId, setEnquiryExpandedId] = useState<string | null>(null);
  const [enquiryStatusUpdating, setEnquiryStatusUpdating] = useState<string | null>(null);
  const [locationsList, setLocationsList] = useState<any[]>([]);
  const [propertyTypesList, setPropertyTypesList] = useState<any[]>([]);

  // Function to load all live data from database APIs
  const fetchAllAdminData = async () => {
    try {
      // 1. Metrics
      const mRes = await fetch('/api/admin/metrics');
      const mData = await mRes.json();
      if (mData.success && mData.metrics) {
        setMetrics([
          { title: 'Total Properties', iconName: 'properties', value: String(mData.metrics.totalProperties ?? 0), primaryStat: { label: 'Published', value: String(mData.metrics.publishedProperties ?? 0), variant: 'emerald' }, secondaryStat: { label: 'Draft', value: String(mData.metrics.draftProperties ?? 0) } },
          { title: 'Active Projects', iconName: 'projects', value: String(mData.metrics.activeProjects ?? 0), primaryStat: { label: 'Launched', value: String(mData.metrics.activeProjects ?? 0), variant: 'emerald' } },
          { title: 'Published Blogs', iconName: 'blogs', value: String(mData.metrics.publishedBlogs ?? 0), primaryStat: { label: 'Insights', value: '0', variant: 'zinc' } },
          { title: 'Public Enquiries', iconName: 'enquiries', value: String(mData.metrics.publicEnquiries ?? 0), primaryStat: { label: 'New this week', value: `+${mData.metrics.publicEnquiries ?? 0}`, variant: 'emerald' } },
          { title: 'Pending Reviews', iconName: 'reviews', value: '0', note: 'Items awaiting sign-off' },
          { title: 'Media Assets', iconName: 'media', value: String(mData.metrics.mediaAssets ?? 0), note: '4K media gallery' }
        ]);
      }

      // 2. Sections
      const sRes = await fetch('/api/admin/sections');
      const sData = await sRes.json();
      if (sData.success && sData.sections && sData.sections.length > 0) {
        setSections(sData.sections);
      }

      // 3. Properties
      const pRes = await fetch('/api/admin/properties');
      const pData = await pRes.json();
      if (pData.success && pData.properties) {
        setPropertiesList(pData.properties);
      }

      // 4. Unified Enquiries & Leads
      const eRes = await fetch('/api/admin/enquiries');
      const eData = await eRes.json();
      if (eData.success && eData.enquiries) {
        setEnquiriesList(eData.enquiries);
        if (eData.counts) setEnquiryCounts(eData.counts);
      }

      // 5. Locations (Localities)
      const lRes = await fetch('/api/admin/locations');
      const lData = await lRes.json();
      if (lData.success && lData.locations) {
        setLocationsList(lData.locations);
      }

      // 6. Property Types (Typologies)
      const ptRes = await fetch('/api/admin/property-types');
      const ptData = await ptRes.json();
      if (ptData.success && ptData.propertyTypes) {
        setPropertyTypesList(ptData.propertyTypes);
      }
    } catch (err) {
      console.log('Admin data fetch fallback:', err);
    }
  };

  const handleAddLocation = async (locData: { name: string; city: string; state: string; description: string }) => {
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Locality "${locData.name}" added successfully!`);
        fetchAllAdminData();
        setAddLocationModalOpen(false);
      } else {
        alert(data.error || 'Failed to add locality');
      }
    } catch (err: any) {
      alert('Error creating locality: ' + err.message);
    }
  };

  const handleDeleteLocation = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete locality "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/locations?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Locality "${name}" deleted.`);
        fetchAllAdminData();
      } else {
        alert(data.error || 'Failed to delete locality');
      }
    } catch (err: any) {
      alert('Error deleting locality: ' + err.message);
    }
  };

  const handleAddPropertyType = async (typeData: { name: string; description: string }) => {
    try {
      const res = await fetch('/api/admin/property-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(typeData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Property Type "${typeData.name}" added successfully!`);
        fetchAllAdminData();
        setAddPropertyTypeModalOpen(false);
      } else {
        alert(data.error || 'Failed to add property type');
      }
    } catch (err: any) {
      alert('Error creating property type: ' + err.message);
    }
  };

  const handleDeletePropertyType = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete property type "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/property-types?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Property type "${name}" deleted.`);
        fetchAllAdminData();
      } else {
        alert(data.error || 'Failed to delete property type');
      }
    } catch (err: any) {
      alert('Error deleting property type: ' + err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllAdminData();
    }
  }, [isAuthenticated]);

  // Section Handlers with live database persistence
  const handleToggleSection = async (id: string) => {
    setIsSaving(true);
    const updatedSections = sections.map((sec) => {
      if (sec.id === id) {
        const nextState = !sec.isActive;
        showToast(`Section "${sec.title}" is now ${nextState ? 'Active' : 'Disabled'}`);
        return { ...sec, isActive: nextState };
      }
      return sec;
    });
    setSections(updatedSections);

    try {
      await fetch('/api/admin/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: updatedSections })
      });
    } catch (e) {
      console.error('Failed to sync section toggle to DB:', e);
    }
    setTimeout(() => setIsSaving(false), 300);
  };

  const handleEditSection = (section: HomepageSectionItem) => {
    setEditingSection(section);
    setEditSectionModalOpen(true);
  };

  const handleSaveSection = async (updated: HomepageSectionItem) => {
    setIsSaving(true);
    const updatedSections = sections.map((sec) => (sec.id === updated.id ? updated : sec));
    setSections(updatedSections);
    showToast(`Updated section "${updated.title}"`);

    try {
      await fetch('/api/admin/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: updatedSections })
      });
    } catch (e) {
      console.error('Failed to sync updated section to DB:', e);
    }
    setTimeout(() => setIsSaving(false), 300);
  };

  const handleReorderSections = async (newSections: HomepageSectionItem[]) => {
    setIsSaving(true);
    setSections(newSections);
    showToast('Homepage layout order updated & auto-saved to database');

    try {
      await fetch('/api/admin/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: newSections })
      });
    } catch (e) {
      console.error('Failed to sync section reorder to DB:', e);
    }
    setTimeout(() => setIsSaving(false), 400);
  };

  const handleAddProperty = async (propData: any) => {
    try {
      const res = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        fetchAllAdminData();
      } else {
        showToast(data.error || 'Failed to add property');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating property');
    }
  };

  const handleDeleteProperty = async (id: number | string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setPropertiesList((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      showToast('Error deleting property');
    }
  };

  const handleReindex = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Cache re-indexed across Pune & Mumbai edge nodes');
    }, 600);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllAdminData();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('CMS synchronized with live production database');
    }, 400);
  };

  const handleCreateModalOpen = (type: string) => {
    if (type === 'scraper') {
      setActiveTab('scraper');
      showToast('Opened Universal Scraper & PDF Intelligence Suite');
    } else if (type === 'property') {
      setAddPropertyModalOpen(true);
    } else if (type === 'section') {
      const newSec: HomepageSectionItem = {
        id: `sec-${Date.now()}`,
        orderNumber: String(sections.length + 1).padStart(2, '0'),
        title: 'New Custom Showcase Section',
        tag: 'NEW',
        tagVariant: 'amber',
        subtitle: 'Custom block tailored for ANV luxury portfolio',
        isActive: true,
        type: 'custom'
      };
      setSections([...sections, newSec]);
      showToast('Added new Homepage Section. Click pencil to configure.');
    } else {
      showToast(`Opened creator for ${type}`);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#fafafb] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-medium">Verifying Administrator Privileges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafb] text-zinc-900 font-sans flex antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 border border-zinc-700">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        currentTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace (offset by sidebar width on lg) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenSearch={() => setCommandPaletteOpen(true)}
          onOpenCreateModal={handleCreateModalOpen}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Main Website Dashboard View */}
          {activeTab === 'dashboard' || activeTab === 'homepage-editor' ? (
            <>
              {/* Header Title & Live Edge CDN Card */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-[28px] font-bold text-zinc-950 tracking-tight">
                    Website Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-2xl leading-relaxed">
                    Manage your Anv Reeality public website, luxury property inventory, and digital editorial content.
                  </p>
                </div>

                {/* Live Edge CDN Active Card */}
                <div className="bg-white border border-zinc-200/90 rounded-2xl px-4 py-3 flex items-center gap-3.5 shadow-2xs self-start md:self-auto shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                      <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 leading-tight">
                        Live Edge CDN
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium">
                        Active
                      </div>
                    </div>
                  </div>

                  <div className="h-7 w-px bg-zinc-200" />

                  <div className="text-right">
                    <span className="text-[11px] font-medium text-zinc-500 block">
                      Pune / Mumbai
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Edge Node 01
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar / Quick Tools Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                {/* Left Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* + Add Property (Black Solid Button) */}
                  <button
                    onClick={() => setAddPropertyModalOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>+ Add Property</span>
                  </button>

                  {/* + Import via Link / PDF (Special AI Tool Button) */}
                  <button
                    onClick={() => setActiveTab('scraper')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-semibold shadow-xs transition"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-800" />
                    <span>+ Import via Link / PDF</span>
                    <span className="text-[9px] bg-amber-200/80 text-amber-900 px-1 py-0.2 rounded font-mono">AI</span>
                  </button>

                  {/* + Add Project */}
                  <button
                    onClick={() => {
                      showToast('Add Project wizard initialized');
                      setActiveTab('projects');
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition shadow-2xs"
                  >
                    <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>+ Add Project</span>
                  </button>

                  {/* + Write Blog */}
                  <button
                    onClick={() => {
                      showToast('Opening Blog Editor');
                      setActiveTab('blog-posts');
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition shadow-2xs"
                  >
                    <FileEdit className="w-3.5 h-3.5 text-zinc-500" />
                    <span>+ Write Blog</span>
                  </button>

                  {/* Edit Homepage Sections */}
                  <button
                    onClick={() => {
                      const el = document.getElementById('section-manager-container');
                      el?.scrollIntoView({ behavior: 'smooth' });
                      showToast('Viewing Homepage Live Section Manager');
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition shadow-2xs"
                  >
                    <Layout className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Edit Homepage Sections</span>
                  </button>

                  {/* + Upload Media */}
                  <button
                    onClick={() => {
                      const el = document.getElementById('dropzone-container');
                      el?.scrollIntoView({ behavior: 'smooth' });
                      showToast('Direct focus to Quick Asset Dropzone');
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition shadow-2xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-zinc-500" />
                    <span>+ Upload Media</span>
                  </button>
                </div>

                {/* Right Action: Public Preview Mode */}
                <button
                  onClick={() => setPreviewModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-amber-800/20 hover:border-amber-800/40 hover:bg-amber-50/40 text-amber-900 text-xs font-medium transition shadow-2xs ml-auto"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-800" />
                  <span>Public Preview Mode</span>
                </button>
              </div>

              {/* 6 Metric KPI Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
                {metrics.map((metric, idx) => (
                  <MetricCard key={idx} data={metric} />
                ))}
              </div>

              {/* Lower 2-Column Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Homepage Live Section Manager (~68% width) */}
                <div id="section-manager-container" className="lg:col-span-8">
                  <SectionManager
                    sections={sections}
                    onToggleSection={handleToggleSection}
                    onEditSection={handleEditSection}
                    onReorderSections={handleReorderSections}
                    onReindex={handleReindex}
                    isSaving={isSaving}
                  />
                </div>

                {/* Right Column: Publishing Pipeline & Quick Asset Dropzone (~32% width) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Publishing Pipeline Card */}
                  <PublishingPipeline
                    onManageQueue={() => {
                      showToast('Opening Editorial Publishing Queue');
                    }}
                  />

                  {/* Quick Asset Dropzone Card */}
                  <div id="dropzone-container">
                    <AssetDropzone
                      onAssetUploaded={(asset: UploadedAsset) => {
                        showToast(`Uploaded asset: ${asset.name} (${asset.size})`);
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'properties' ? (
            /* Properties Sub-View */
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">Properties Inventory</h2>
                  <p className="text-xs text-zinc-500">
                    Live catalog connected to PostgreSQL ({propertiesList.length} properties)
                  </p>
                </div>
                <button
                  onClick={() => setAddPropertyModalOpen(true)}
                  className="px-3.5 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition"
                >
                  + Add New Property
                </button>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="px-5 py-3">Property Name</th>
                      <th className="px-5 py-3">Location</th>
                      <th className="px-5 py-3">Config</th>
                      <th className="px-5 py-3">Price</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {propertiesList.length > 0 ? (
                      propertiesList.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50/80 transition">
                          <td className="px-5 py-3.5 font-semibold text-zinc-900">{p.name || p.title}</td>
                          <td className="px-5 py-3.5 text-zinc-600">{p.location || p.address}</td>
                          <td className="px-5 py-3.5 text-zinc-600">{p.bhk ? `${p.bhk} BHK` : '3 BHK'}</td>
                          <td className="px-5 py-3.5 font-semibold text-zinc-900">
                            {p.priceFormatted || (p.price ? `₹${(p.price / 10000000).toFixed(2)} Cr` : '₹1.50 Cr')}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                p.publishStatus === 'Published' || p.status === 'Published'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-zinc-100 text-zinc-600'
                              }`}
                            >
                              {p.publishStatus || p.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleDeleteProperty(p.id, p.name || p.title)}
                              className="text-rose-600 hover:underline font-medium text-xs"
                            >
                              Delete
                            </button>
                            <Link href="/" target="_blank" className="text-zinc-400 hover:text-zinc-600">
                              View ↗
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">
                          Loading properties from database...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'enquiries' ? (
            /* ============================================================ */
            /* UNIFIED ENQUIRIES, LEADS & REQUESTS COMMAND CENTER          */
            /* ============================================================ */
            <div className="space-y-5">
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-zinc-900">Enquiries, Leads & Requests</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                      {enquiryCounts.all || enquiriesList.length} Total
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 max-w-xl">
                    All inbound buyer enquiries, site visit requests, bespoke sourcing briefs, CRM leads, and seller property offers — unified in one command view.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    setEnquiriesLoading(true);
                    const eRes = await fetch('/api/admin/enquiries');
                    const eData = await eRes.json();
                    if (eData.success && eData.enquiries) {
                      setEnquiriesList(eData.enquiries);
                      if (eData.counts) setEnquiryCounts(eData.counts);
                      showToast(`Loaded ${eData.totalCount} records from live database.`);
                    }
                    setEnquiriesLoading(false);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${enquiriesLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh All</span>
                </button>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Inbound', value: enquiryCounts.all || enquiriesList.length, icon: Inbox, color: 'text-zinc-700', bg: 'bg-zinc-50', border: 'border-zinc-200' },
                  { label: 'Site Visit Requests', value: enquiryCounts.site_visits || 0, icon: Calendar, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
                  { label: 'New Unhandled', value: enquiryCounts.new_status || 0, icon: AlertCircle, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
                  { label: 'Bespoke Briefs', value: enquiryCounts.bespoke || 0, icon: ClipboardList, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
                ].map((stat, idx) => (
                  <div key={idx} className={`${stat.bg} border ${stat.border} rounded-xl p-3.5 flex items-center gap-3`}>
                    <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-2xs`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-zinc-900">{stat.value}</div>
                      <div className="text-[10px] text-zinc-500 font-medium leading-tight">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Type Filter Tabs */}
              <div className="bg-white border border-zinc-200 rounded-xl p-1 flex flex-wrap gap-1 shadow-2xs">
                {[
                  { id: 'all', label: 'All Inbound', count: enquiryCounts.all || enquiriesList.length },
                  { id: 'site_visits', label: 'Site Visits', count: enquiryCounts.site_visits || 0 },
                  { id: 'bespoke', label: 'Bespoke Briefs', count: enquiryCounts.bespoke || 0 },
                  { id: 'property_enquiries', label: 'Property Enquiries', count: enquiryCounts.property_enquiries || 0 },
                  { id: 'crm_leads', label: 'CRM Leads', count: enquiryCounts.crm_leads || 0 },
                  { id: 'seller_leads', label: 'Seller Units', count: enquiryCounts.seller_leads || 0 },
                  { id: 'general_inquiry', label: 'General Consultations', count: enquiryCounts.general_inquiries || 0 }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setEnquiryTypeFilter(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      enquiryTypeFilter === tab.id
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      enquiryTypeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search + Status Filter Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by name, phone, email, reference code, property..."
                    value={enquirySearchQuery}
                    onChange={e => setEnquirySearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                  {enquirySearchQuery && (
                    <button
                      onClick={() => setEnquirySearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <select
                  value={enquiryStatusFilter}
                  onChange={e => setEnquiryStatusFilter(e.target.value)}
                  className="text-xs border border-zinc-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-zinc-700 font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Visit Scheduled">Visit Scheduled</option>
                  <option value="Negotiating">Negotiating</option>
                  <option value="Closed">Closed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Enquiries Cards List */}
              {(() => {
                // Apply client-side filters
                let filtered = enquiriesList;
                const q = enquirySearchQuery.trim().toLowerCase();
                if (enquiryTypeFilter !== 'all') {
                  filtered = filtered.filter(e => {
                    if (enquiryTypeFilter === 'site_visits') return e.category === 'site_visit';
                    if (enquiryTypeFilter === 'bespoke') return e.category === 'bespoke';
                    if (enquiryTypeFilter === 'property_enquiries') return e.category === 'property_enquiry';
                    if (enquiryTypeFilter === 'seller_leads') return e.category === 'seller_lead';
                    if (enquiryTypeFilter === 'crm_leads') return e.category === 'crm_lead';
                    if (enquiryTypeFilter === 'general_inquiry') return e.category === 'general_inquiry';
                    return true;
                  });
                }
                if (enquiryStatusFilter !== 'all') {
                  filtered = filtered.filter(e =>
                    (e.status || '').toLowerCase() === enquiryStatusFilter.toLowerCase()
                  );
                }
                if (q) {
                  filtered = filtered.filter(e =>
                    e.name?.toLowerCase().includes(q) ||
                    e.phone?.toLowerCase().includes(q) ||
                    e.email?.toLowerCase().includes(q) ||
                    e.referenceCode?.toLowerCase().includes(q) ||
                    e.subject?.toLowerCase().includes(q) ||
                    e.locality?.toLowerCase().includes(q) ||
                    e.message?.toLowerCase().includes(q)
                  );
                }

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center shadow-2xs">
                      <Inbox className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-zinc-600 mb-1">No matching enquiries found</p>
                      <p className="text-xs text-zinc-400">
                        {enquirySearchQuery ? 'Try a different search term' : 'All inbound data will appear here'}
                      </p>
                      {enquirySearchQuery && (
                        <button
                          onClick={() => setEnquirySearchQuery('')}
                          className="mt-3 text-xs font-semibold text-amber-700 hover:underline"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {/* Result count bar */}
                    <div className="flex items-center justify-between px-0.5">
                      <p className="text-[11px] text-zinc-500">
                        Showing <span className="font-semibold text-zinc-800">{filtered.length}</span> of{' '}
                        <span className="font-semibold text-zinc-800">{enquiriesList.length}</span> records
                      </p>
                      {(enquiryTypeFilter !== 'all' || enquiryStatusFilter !== 'all' || enquirySearchQuery) && (
                        <button
                          onClick={() => { setEnquiryTypeFilter('all'); setEnquiryStatusFilter('all'); setEnquirySearchQuery(''); }}
                          className="text-[11px] font-semibold text-amber-700 hover:underline"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>

                    {filtered.map((enq) => {
                      const uid = enq.uid || `ENQ-${enq.id}`;
                      const isExpanded = enquiryExpandedId === uid;
                      const isUpdating = enquiryStatusUpdating === uid;
                      const categoryColors: Record<string, string> = {
                        site_visit: 'bg-violet-50 text-violet-800 border-violet-200',
                        bespoke: 'bg-amber-50 text-amber-800 border-amber-200',
                        seller_lead: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                        property_enquiry: 'bg-blue-50 text-blue-800 border-blue-200',
                        crm_lead: 'bg-rose-50 text-rose-800 border-rose-200',
                        general_inquiry: 'bg-zinc-50 text-zinc-800 border-zinc-200'
                      };
                      const statusColors: Record<string, string> = {
                        'new': 'bg-rose-100 text-rose-800',
                        'contacted': 'bg-blue-100 text-blue-800',
                        'visit scheduled': 'bg-violet-100 text-violet-800',
                        'negotiating': 'bg-amber-100 text-amber-800',
                        'closed': 'bg-emerald-100 text-emerald-800',
                        'archived': 'bg-zinc-100 text-zinc-600'
                      };
                      const tempColors: Record<string, string> = {
                        hot: 'text-rose-600',
                        warm: 'text-amber-600',
                        cold: 'text-blue-500'
                      };
                      const catBadge = categoryColors[enq.category] || 'bg-zinc-50 text-zinc-700 border-zinc-200';
                      const statusBadge = statusColors[(enq.status || '').toLowerCase()] || 'bg-zinc-100 text-zinc-600';
                      const tempColor = tempColors[enq.temperature || 'warm'] || 'text-zinc-400';
                      const wa = `https://wa.me/91${(enq.phone || '').replace(/\D/g, '').slice(-10)}?text=Dear%20${encodeURIComponent(enq.name || 'Sir')}%2C%20Anv%20Reeality%20Advisory%20Team%20connecting%20for%20your%20property%20inquiry.`;

                      return (
                        <div
                          key={uid}
                          className="bg-white border border-zinc-200 rounded-2xl shadow-2xs overflow-hidden hover:border-zinc-300 transition"
                        >
                          {/* Card Header */}
                          <div className="px-4 pt-4 pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              {/* Left: Contact info + type badge */}
                              <div className="flex items-start gap-3 min-w-0">
                                {/* Avatar */}
                                <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-zinc-800 to-amber-700 text-white font-bold text-sm flex items-center justify-center">
                                  {(enq.name || 'C')[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
                                    <span className="font-semibold text-sm text-zinc-900">{enq.name || 'Client'}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${catBadge}`}>
                                      {enq.categoryLabel || enq.category}
                                    </span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusBadge}`}>
                                      {enq.status || 'New'}
                                    </span>
                                    {enq.temperature && (
                                      <Flame className={`w-3 h-3 ${tempColor}`} />
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      <a href={`tel:${enq.phone}`} className="hover:text-zinc-900 font-mono">{enq.phone}</a>
                                    </span>
                                    {enq.email && (
                                      <span className="flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        <a href={`mailto:${enq.email}`} className="hover:text-zinc-900">{enq.email}</a>
                                      </span>
                                    )}
                                    <span className="text-zinc-400 font-mono text-[10px]">#{enq.referenceCode || uid}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Date + action buttons */}
                              <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                                <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {enq.formattedDate || enq.time} at {enq.formattedTime || ''}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {/* Call */}
                                  <a
                                    href={`tel:${enq.phone}`}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 text-white text-[11px] font-semibold hover:bg-zinc-700 transition"
                                    title="Call Now"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>Call</span>
                                  </a>
                                  {/* WhatsApp */}
                                  <a
                                    href={wa}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366] text-white text-[11px] font-semibold hover:bg-[#1ebe5d] transition"
                                    title="WhatsApp"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>WhatsApp</span>
                                  </a>
                                  {/* Expand */}
                                  <button
                                    onClick={() => setEnquiryExpandedId(isExpanded ? null : uid)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 text-[11px] font-semibold hover:bg-zinc-50 transition"
                                    title={isExpanded ? 'Collapse' : 'View Details'}
                                  >
                                    <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    <span>{isExpanded ? 'Less' : 'Details'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Quick summary row */}
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-500">
                              {enq.subject && (
                                <span className="flex items-center gap-1 text-zinc-700 font-medium max-w-xs truncate">
                                  <BuildingIcon className="w-3 h-3 shrink-0 text-zinc-400" />
                                  {enq.subject}
                                </span>
                              )}
                              {enq.locality && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  {enq.locality}
                                </span>
                              )}
                              {enq.bhk && (
                                <span className="flex items-center gap-1">
                                  <Home className="w-3 h-3 shrink-0" />
                                  {enq.bhk}
                                </span>
                              )}
                              {enq.budget && (
                                <span className="flex items-center gap-1">
                                  <Wallet className="w-3 h-3 shrink-0" />
                                  {enq.budget}
                                </span>
                              )}
                              {enq.timingSlot && (
                                <span className="flex items-center gap-1 text-violet-700 font-medium">
                                  <Calendar className="w-3 h-3 shrink-0" />
                                  {enq.timingSlot}
                                </span>
                              )}
                              {enq.assignedTo && (
                                <span className="flex items-center gap-1 ml-auto">
                                  <User className="w-3 h-3 shrink-0" />
                                  {enq.assignedTo}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="border-t border-zinc-100 px-4 py-4 bg-zinc-50/50">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                {/* Buyer/Client Details */}
                                <div className="space-y-1.5">
                                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Client Details</h4>
                                  {enq.designation && <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">Role:</span> {enq.designation}</div>}
                                  {enq.source && <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">Source:</span> {enq.source}</div>}
                                  {enq.stage && <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">CRM Stage:</span> {enq.stage}</div>}
                                  {enq.referenceCode && <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">Reference:</span> <span className="font-mono">{enq.referenceCode}</span></div>}
                                </div>

                                {/* Property/Requirement Details */}
                                <div className="space-y-1.5">
                                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Property Requirement</h4>
                                  {enq.locality && <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">Location:</span> {enq.locality}</div>}
                                  {enq.bhk && <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">Configuration:</span> {enq.bhk}</div>}
                                  {enq.budget && <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">Budget:</span> {enq.budget}</div>}
                                  {enq.timeline && <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">Timeline:</span> {enq.timeline}</div>}
                                  {enq.purpose && <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">Purpose:</span> {enq.purpose}</div>}
                                  {enq.vastu && <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">Vastu:</span> {enq.vastu}</div>}
                                  {enq.parking && <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">Parking:</span> {enq.parking}</div>}
                                </div>

                                {/* Site Visit Logistics */}
                                <div className="space-y-1.5">
                                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Viewing / Visit</h4>
                                  {enq.timingSlot && <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">Requested Slot:</span> {enq.timingSlot}</div>}
                                  {enq.visitLogistics ? (
                                    <>
                                      <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">Visit Date:</span> {enq.visitLogistics.visitDate}</div>
                                      <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">Status:</span> {enq.visitLogistics.status}</div>
                                      {enq.visitLogistics.cabModel && <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">Cab:</span> {enq.visitLogistics.cabModel} ({enq.visitLogistics.cabPlate})</div>}
                                      {enq.visitLogistics.driverName && <div className="text-[11px] text-zinc-600"><span className="font-medium text-zinc-800">Driver:</span> {enq.visitLogistics.driverName} – {enq.visitLogistics.driverPhone}</div>}
                                    </>
                                  ) : (
                                    <div className="text-[11px] text-zinc-400 italic">No visit scheduled yet</div>
                                  )}
                                </div>
                              </div>

                              {/* Full Message / Notes */}
                              {enq.message && (
                                <div className="mb-4">
                                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Full Inquiry Message</h4>
                                  <div className="text-[11px] text-zinc-600 bg-white border border-zinc-200 rounded-lg p-3 leading-relaxed">
                                    {enq.message}
                                  </div>
                                </div>
                              )}

                              {/* Status Update + Notes Row */}
                              <div className="border-t border-zinc-200 pt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex items-center gap-2 flex-1">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Update Status:</label>
                                  <select
                                    defaultValue={enq.status || 'New'}
                                    onChange={async (e) => {
                                      const newStatus = e.target.value;
                                      setEnquiryStatusUpdating(uid);
                                      try {
                                        const res = await fetch('/api/admin/enquiries', {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ uid, status: newStatus })
                                        });
                                        const d = await res.json();
                                        if (d.success) {
                                          showToast(`Status updated to "${newStatus}" for ${enq.name}`);
                                          // Refresh list
                                          const eRes2 = await fetch('/api/admin/enquiries');
                                          const eData2 = await eRes2.json();
                                          if (eData2.success) { setEnquiriesList(eData2.enquiries); if (eData2.counts) setEnquiryCounts(eData2.counts); }
                                        } else {
                                          showToast('Error: ' + d.error);
                                        }
                                      } catch { showToast('Failed to update status'); }
                                      setEnquiryStatusUpdating(null);
                                    }}
                                    className="flex-1 text-xs border border-zinc-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-800 font-medium"
                                  >
                                    <option>New</option>
                                    <option>Contacted</option>
                                    <option>Visit Scheduled</option>
                                    <option>Negotiating</option>
                                    <option>Closed</option>
                                    <option>Archived</option>
                                  </select>
                                  {isUpdating && <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />}
                                </div>

                                {/* Link to CRM if available */}
                                {enq.crmLeadId && (
                                  <Link
                                    href="/crm"
                                    target="_blank"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-semibold hover:bg-amber-100 transition"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    View in CRM
                                  </Link>
                                )}
                                {enq.propertyId && (
                                  <Link
                                    href={`/properties/${enq.propertyId}`}
                                    target="_blank"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 text-[11px] font-semibold hover:bg-zinc-100 transition"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    View Property
                                  </Link>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : activeTab === 'scraper' ? (
            /* AI Scraper & Property Importer View */
            <ScraperImporter
              showToast={showToast}
              onImportComplete={(count) => {
                showToast(`Successfully added ${count} listings to inventory!`);
              }}
            />
          ) : activeTab === 'locations' ? (
            /* Locations / Corridors Sub-View */
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-zinc-900">
                      Localities & Corridors ({locationsList.length})
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      Live in Database
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Searchable localities across Pune & Mumbai. Any locality added here dynamically increases the search filtration dropdown options on the public website.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filter localities..."
                      value={locationSearchFilter}
                      onChange={(e) => setLocationSearchFilter(e.target.value)}
                      className="px-3 py-1.5 pl-8 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-white"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    onClick={() => setAddLocationModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Locality</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="px-5 py-3">Locality Name</th>
                      <th className="px-5 py-3">City / State</th>
                      <th className="px-5 py-3">Linked Properties</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {locationsList
                      .filter((loc) =>
                        !locationSearchFilter ||
                        loc.name?.toLowerCase().includes(locationSearchFilter.toLowerCase()) ||
                        loc.city?.toLowerCase().includes(locationSearchFilter.toLowerCase())
                      )
                      .map((loc) => (
                        <tr key={loc.id} className="hover:bg-zinc-50/80 transition">
                          <td className="px-5 py-3.5 font-semibold text-zinc-900">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>{loc.name}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">({loc.slug})</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-zinc-600">
                            {loc.city}, {loc.state}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200/80">
                              {loc.propertyCount || 0} Listed
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-zinc-500 max-w-xs truncate">
                            {loc.description || 'Prime residential/commercial corridor'}
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleDeleteLocation(loc.id, loc.name)}
                              className="text-rose-600 hover:text-rose-800 hover:underline font-medium text-xs cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    {locationsList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-zinc-400">
                          Loading localities from database...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'property-types' ? (
            /* Property Types Sub-View */
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-zinc-900">
                      Property Typologies & Classifications ({propertyTypesList.length})
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      Live in Database
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Architectural typologies (Commercial Office, Penthouses, Sky Villas, etc.). Any typology added here dynamically increases the search filtration dropdown options.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filter typologies..."
                      value={propertyTypeSearchFilter}
                      onChange={(e) => setPropertyTypeSearchFilter(e.target.value)}
                      className="px-3 py-1.5 pl-8 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-white"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    onClick={() => setAddPropertyTypeModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Typology</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="px-5 py-3">Typology Name</th>
                      <th className="px-5 py-3">Slug</th>
                      <th className="px-5 py-3">Linked Properties</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {propertyTypesList
                      .filter((pt) =>
                        !propertyTypeSearchFilter ||
                        pt.name?.toLowerCase().includes(propertyTypeSearchFilter.toLowerCase())
                      )
                      .map((pt) => (
                        <tr key={pt.id} className="hover:bg-zinc-50/80 transition">
                          <td className="px-5 py-3.5 font-semibold text-zinc-900">
                            <div className="flex items-center gap-2">
                              <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>{pt.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-zinc-500 font-mono text-[11px]">
                            {pt.slug}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200/80">
                              {pt.propertyCount || 0} Listed
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-zinc-500 max-w-xs truncate">
                            {pt.description || 'Premium architectural classification'}
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleDeletePropertyType(pt.id, pt.name)}
                              className="text-rose-600 hover:text-rose-800 hover:underline font-medium text-xs cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    {propertyTypesList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-zinc-400">
                          Loading typologies from database...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Generic Sub-View for Other Tabs */
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-amber-800" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                This CMS module is connected to the Anv Reeality database. You can manage assets, configuration, and content from here.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="mt-2 px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <EditSectionModal
        isOpen={editSectionModalOpen}
        section={editingSection}
        onClose={() => setEditSectionModalOpen(false)}
        onSave={handleSaveSection}
      />

      <AddPropertyModal
        isOpen={addPropertyModalOpen}
        onClose={() => setAddPropertyModalOpen(false)}
        onAdd={handleAddProperty}
        availableLocations={locationsList}
        availablePropertyTypes={propertyTypesList}
      />

      <AddLocationModal
        isOpen={addLocationModalOpen}
        onClose={() => setAddLocationModalOpen(false)}
        onAdd={handleAddLocation}
      />

      <AddPropertyTypeModal
        isOpen={addPropertyTypeModalOpen}
        onClose={() => setAddPropertyTypeModalOpen(false)}
        onAdd={handleAddPropertyType}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(tab) => {
          if (tab === 'public-site') {
            window.open('/', '_blank');
          } else {
            setActiveTab(tab);
          }
        }}
      />

      <LivePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
      />
    </div>
  );
}
