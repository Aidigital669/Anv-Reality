'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Search, MapPin, ArrowRight, Loader2, Plus, DownloadCloud } from 'lucide-react';
import Image from 'next/image';
import { AddPropertyModal } from '@/components/admin/Modals';
import { ScraperModal } from '@/components/crm/ScraperModal';

export function CrmPropertiesTab() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isScraperOpen, setIsScraperOpen] = useState(false);

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
        fetchProperties(); // Refresh properties
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
        fetchProperties(); // Refresh properties
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = properties.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200">
        <div className="shrink-0">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            Property Inventory
          </h2>
          <p className="text-xs text-zinc-500">Live catalog for sales advisors</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:flex-1 xl:w-64">
            <input
              type="text"
              placeholder="Search properties by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setIsScraperOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>URL Import</span>
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </button>
          </div>
        </div>
      </div>

      <AddPropertyModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onAdd={handleAddProperty} 
      />
      
      <ScraperModal
        isOpen={isScraperOpen}
        onClose={() => setIsScraperOpen(false)}
        onImportComplete={(count) => {
          fetchProperties();
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
                  {prop.pt_name || 'Luxury Asset'}
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
                    <span className="font-bold text-zinc-900">{prop.bhk} BHK</span>
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
                      onClick={() => alert('Edit Property Modal coming soon')}
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
    </div>
  );
}
