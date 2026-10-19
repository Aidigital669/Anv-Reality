'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  MapPin,
  ArrowRight,
  Loader2,
  Plus,
  DownloadCloud,
  FileSpreadsheet,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2
} from 'lucide-react';
import Image from 'next/image';
import { AddPropertyModal, EditPropertyModal } from '@/components/admin/Modals';
import { ScraperModal } from '@/components/crm/ScraperModal';
import { PropertyExcelUploadModal } from '@/components/crm/PropertyExcelUploadModal';
import { CATEGORY_OPTIONS } from '@/lib/categories-data';

export function CrmPropertiesTab() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [locationsList, setLocationsList] = useState<{ name: string }[]>([]);
  const [propertyTypesList, setPropertyTypesList] = useState<{ name: string }[]>([]);
  const [isScraperOpen, setIsScraperOpen] = useState(false);
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const fetchProperties = () => {
    setLoading(true);
    fetch('/api/admin/properties')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.properties) {
          setProperties(data.properties);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching CRM properties:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProperties();
    // Load locations and typologies for edit/add modal autocomplete
    fetch('/api/admin/locations')
      .then((res) => res.json())
      .then((data) => {
        if (data.locations) setLocationsList(data.locations);
      })
      .catch(() => {});

    fetch('/api/admin/property-types')
      .then((res) => res.json())
      .then((data) => {
        if (data.propertyTypes) setPropertyTypesList(data.propertyTypes);
      })
      .catch(() => {});
  }, []);

  const handleAddProperty = async (propData: any) => {
    try {
      const res = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propData)
      });
      if (res.ok) {
        fetchProperties();
        setNotificationMsg('✓ New property added successfully!');
        setTimeout(() => setNotificationMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePublish = async (prop: any) => {
    try {
      const newStatus = prop.publishStatus === 'Published' ? 'Draft' : 'Published';
      const res = await fetch(`/api/admin/properties/${prop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishStatus: newStatus })
      });
      if (res.ok) {
        fetchProperties();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProperty = async (prop: any) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      const res = await fetch(`/api/admin/properties/${prop.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchProperties();
        setNotificationMsg(`✓ Deleted property "${prop.name || 'Listing'}".`);
        setTimeout(() => setNotificationMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAllProperties = async () => {
    setIsDeletingAll(true);
    try {
      const res = await fetch('/api/admin/properties', {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProperties([]);
        setIsDeleteAllOpen(false);
        setNotificationMsg(`✓ Successfully deleted all ${data.deletedCount ?? properties.length} properties.`);
        setTimeout(() => setNotificationMsg(null), 4000);
      } else {
        alert(data.error || 'Failed to delete all properties');
      }
    } catch (err: any) {
      console.error('Error deleting all properties:', err);
      alert(err.message || 'Error deleting all properties');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleEditPropertySubmit = async (id: string | number, updatedData: any) => {
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (data.success) {
        setIsEditOpen(false);
        setEditingProperty(null);
        fetchProperties();
        setNotificationMsg('✓ Property details updated successfully.');
        setTimeout(() => setNotificationMsg(null), 4000);
      } else {
        alert(data.error || 'Failed to update property');
      }
    } catch (e: any) {
      console.error('Error updating property:', e);
      alert(e.message || 'Error updating property');
    }
  };

  const filtered = properties.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.developer?.toLowerCase().includes(searchTerm.toLowerCase());

    const propConfig = (p.configuration || p.bhk || p.pt_name || '').toLowerCase();
    const matchesCategory =
      selectedCategory === 'All' ||
      propConfig.includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Toast Notification Banner */}
      {notificationMsg && (
        <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button
            onClick={() => setNotificationMsg(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Property Inventory Control Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
        {/* Top Tier: Title & Main Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                  Property Inventory
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
                </span>
              </div>
              <p className="text-xs text-zinc-500">Live catalog for sales advisors</p>
            </div>
          </div>

          {/* Action Buttons: Responsive & Flex-wrapped so NO button is ever cut off */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Delete All Button (Danger) */}
            {properties.length > 0 && (
              <button
                onClick={() => setIsDeleteAllOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs whitespace-nowrap"
                title="Delete all properties from database"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete All</span>
              </button>
            )}

            {/* Excel Upload (Green) */}
            <button
              onClick={() => setIsExcelOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs whitespace-nowrap"
              title="Upload properties in bulk via Excel spreadsheet (.xlsx, .xls, .csv)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel Upload</span>
            </button>

            {/* URL Import (Neutral) */}
            <button
              onClick={() => setIsScraperOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200/80 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs whitespace-nowrap"
              title="Import property from MagicBricks, 99acres or Housing URL"
            >
              <DownloadCloud className="w-4 h-4 text-zinc-600" />
              <span>URL Import</span>
            </button>

            {/* Add Property (Black) */}
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs whitespace-nowrap"
              title="Manually create a new property listing"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {/* Bottom Tier: Search & Category Filter */}
        <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search properties by title, developer, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-zinc-50 hover:bg-zinc-50/80 focus:bg-white border border-zinc-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 rounded-md cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-zinc-50 hover:bg-zinc-50/80 focus:bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs cursor-pointer min-w-[180px]"
            >
              <option value="All">All Categories ({properties.length})</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {(searchTerm || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="px-2.5 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition cursor-pointer whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete All Confirmation Modal */}
      {isDeleteAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-zinc-200 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-2xs">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900">
              Delete All Properties?
            </h3>
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
              This will permanently delete all <strong className="text-zinc-900 font-semibold">{properties.length} properties</strong> from your live inventory database, including all associated photos and specifications.
            </p>

            <div className="p-3 my-4 bg-rose-50/80 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> This operation cannot be reversed. All property records will be wiped from your catalog.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteAllOpen(false)}
                disabled={isDeletingAll}
                className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllProperties}
                disabled={isDeletingAll}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isDeletingAll ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting All...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete All ({properties.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <AddPropertyModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onAdd={handleAddProperty} 
      />
      
      <ScraperModal
        isOpen={isScraperOpen}
        onClose={() => {
          setIsScraperOpen(false);
          fetchProperties();
        }}
        onImportComplete={(count) => {
          fetchProperties();
          setNotificationMsg(`✓ Successfully imported ${count} properties from URL!`);
          setTimeout(() => setNotificationMsg(null), 4000);
        }}
      />

      <PropertyExcelUploadModal
        isOpen={isExcelOpen}
        onClose={() => setIsExcelOpen(false)}
        onImportComplete={(count) => {
          fetchProperties();
          setNotificationMsg(`✓ Successfully imported ${count} properties from Excel spreadsheet!`);
          setTimeout(() => setNotificationMsg(null), 4000);
        }}
      />

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-20 bg-white border border-zinc-200 rounded-2xl">
          <Building2 className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-700">No properties found</h3>
          <p className="text-xs text-zinc-500 mt-1">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((prop, idx) => (
            <div key={prop.id || idx} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:shadow-md transition group">
              <div className="relative h-48 w-full bg-zinc-100 overflow-hidden">
                {prop.image ? (
                  <Image
                    src={prop.image}
                    alt={prop.name || 'Property'}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-zinc-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-xs rounded-md text-[10px] font-bold text-zinc-900 border border-black/5 shadow-xs">
                  {prop.configuration || prop.pt_name || 'Commercial'}
                </div>
                {prop.status && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-white rounded-md text-[10px] font-bold shadow-xs">
                    {prop.status}
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 line-clamp-1">{prop.name}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1">
                    <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">{prop.location}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                    <span className="text-zinc-500 block mb-0.5">Price</span>
                    <span className="font-bold text-zinc-900">{prop.priceFormatted || 'Price on Request'}</span>
                  </div>
                  <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                    <span className="text-zinc-500 block mb-0.5">Configuration</span>
                    <span className="font-bold text-zinc-900 truncate block">
                      {(() => {
                        const val = prop.configuration || prop.bhk || prop.pt_name;
                        if (!val) return 'Commercial';
                        const str = String(val).trim();
                        if (/^\d+(\.\d+)?$/.test(str)) return `${str} BHK`;
                        return str;
                      })()}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-medium px-2 py-1 rounded-md border ${
                      prop.publishStatus === 'Published' 
                        ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                        : 'text-amber-600 bg-amber-50 border-amber-100'
                    }`}>
                      {prop.publishStatus === 'Published' ? 'Active on Website' : 'Draft'}
                    </span>
                    <button className="text-[11px] font-bold text-zinc-600 hover:text-zinc-900 flex items-center gap-1 group/btn cursor-pointer">
                      View Specs
                      <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button 
                      onClick={() => handleTogglePublish(prop)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                        prop.publishStatus === 'Published'
                          ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-zinc-200'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
                      }`}
                    >
                      {prop.publishStatus === 'Published' ? 'Unpublish' : 'Publish to Website'}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingProperty(prop);
                        setIsEditOpen(true);
                      }}
                      className="px-3 py-1.5 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center justify-center"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteProperty(prop)}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center justify-center"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Property Modal */}
      <EditPropertyModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingProperty(null);
        }}
        onSave={handleEditPropertySubmit}
        property={editingProperty}
        availableLocations={locationsList}
        availablePropertyTypes={propertyTypesList}
      />
    </div>
  );
}
