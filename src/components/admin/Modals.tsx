'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  Building2,
  FileEdit,
  Layout,
  Upload,
  Search,
  Check,
  Laptop,
  Tablet,
  Smartphone,
  ExternalLink,
  MapPin,
  Layers,
  Loader2,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  ArrowUp
} from 'lucide-react';
import { HomepageSectionItem } from './types';
import { CATEGORY_OPTIONS } from '@/lib/categories-data';
import { BusinessPurposesMultiSelect } from './BusinessPurposesMultiSelect';

// ================= EDIT SECTION MODAL =================
export function EditSectionModal({
  section,
  isOpen,
  onClose,
  onSave
}: {
  section: HomepageSectionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: HomepageSectionItem) => void;
}) {
  const [formData, setFormData] = useState<HomepageSectionItem | null>(null);

  useEffect(() => {
    if (section) setFormData({ ...section });
  }, [section]);

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-zinc-200 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="font-bold text-zinc-900 text-base">Edit Homepage Section</h3>
            <p className="text-xs text-zinc-500">Configure section title, metadata tag and visibility</p>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Section Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Badge Tag</label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-400 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Tag Styling</label>
              <select
                value={formData.tagVariant || 'default'}
                onChange={(e) => setFormData({ ...formData, tagVariant: e.target.value as any })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
              >
                <option value="default">Default Neutral</option>
                <option value="amber">Amber / Pinned</option>
                <option value="blue">Blue / Locations</option>
                <option value="emerald">Emerald / Active</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Subtitle / Headline Summary</label>
            <textarea
              rows={3}
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="font-medium text-zinc-700">Display on Public Website</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                formData.isActive ? 'bg-zinc-900' : 'bg-zinc-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  formData.isActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(formData);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-black hover:bg-zinc-800 rounded-lg transition shadow-xs"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= ADD PROPERTY MODAL =================
export function AddPropertyModal({
  isOpen,
  onClose,
  onAdd,
  availableLocations = [],
  availablePropertyTypes = []
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (property: any) => void;
  availableLocations?: { name: string }[];
  availablePropertyTypes?: { name: string }[];
}) {
  const [name, setName] = useState('');
  const [developer, setDeveloper] = useState('ANV Signature Collection');
  const [location, setLocation] = useState('Baner, Pune');
  const [price, setPrice] = useState('₹1.85 Cr');
  const [bhk, setBhk] = useState('Office Space');
  const [customConfig, setCustomConfig] = useState('');
  const [isCustomConfig, setIsCustomConfig] = useState(false);
  const [sqft, setSqft] = useState('1,250 Sq.Ft.');
  const [status, setStatus] = useState('Under-Construction');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>(['']);
  const [videoUrl, setVideoUrl] = useState('');
  const [listingType, setListingType] = useState<'Buy' | 'Rent'>('Buy');
  const [publishOnWebsite, setPublishOnWebsite] = useState(true);
  const [selectedPurposes, setSelectedPurposes] = useState<number[]>([]);

  if (!isOpen) return null;

  const handleAddImageSlot = () => setImages((prev) => [...prev, '']);
  const handleRemoveImageSlot = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [''];
    });
  };
  const handleImageChange = (index: number, val: string) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };
  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const item = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [item, ...rest];
    });
  };
  const handleFileUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleImageChange(index, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-zinc-200 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-800" />
            <div>
              <h3 className="font-bold text-zinc-900 text-base">Add Luxury Property / Product</h3>
              <p className="text-[11px] text-zinc-500">Provide real details, multiple gallery photos, and walkthrough video</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs overflow-y-auto pr-1 flex-1">
          {/* Listing Purpose Tab: Buy vs Rent */}
          <div>
            <label className="block font-semibold text-zinc-800 mb-1.5">Listing Purpose / Intent *</label>
            <div className="flex items-center gap-2 p-1.5 bg-zinc-100 rounded-xl border border-zinc-200">
              <button
                type="button"
                onClick={() => setListingType('Buy')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  listingType === 'Buy'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm font-black'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                }`}
              >
                <span>🏠 For Buy / Sale</span>
              </button>
              <button
                type="button"
                onClick={() => setListingType('Rent')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  listingType === 'Rent'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm font-black'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                }`}
              >
                <span>🔑 For Rent / Lease</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Property Name *</label>
            <input
              type="text"
              placeholder="e.g. The Lumina Sky Penthouse / Commercial Office Suite"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Developer</label>
              <input
                type="text"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Location / Locality (Pick or Type New)
              </label>
              <input
                type="text"
                list="admin-available-locations"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Koregaon Park, Baner, Viman Nagar"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
              />
              <datalist id="admin-available-locations">
                {availableLocations.map((l, i) => (
                  <option key={i} value={l.name} />
                ))}
                <option value="Koregaon Park, Pune" />
                <option value="Baner, Pune" />
                <option value="Balewadi, Pune" />
                <option value="Kalyani Nagar, Pune" />
                <option value="Bavdhan, Pune" />
                <option value="Mahalunge, Pune" />
                <option value="Shivajinagar, Pune" />
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Price (₹)</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. ₹1.85 Cr"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Category / Configuration *
              </label>
              <select
                value={isCustomConfig ? '__custom__' : bhk}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__custom__') {
                    setIsCustomConfig(true);
                    setBhk(customConfig || '');
                  } else {
                    setIsCustomConfig(false);
                    setBhk(val);
                  }
                }}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-400 bg-white font-medium text-zinc-900"
              >
                <option value="">-- Select Category / Configuration --</option>
                <optgroup label="Official 17 Real Estate Categories">
                  {CATEGORY_OPTIONS.map((catTitle) => (
                    <option key={catTitle} value={catTitle}>
                      {catTitle}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Residential Unit Typologies">
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="4.5+ BHK Penthouse">4.5+ BHK Penthouse</option>
                  <option value="Sky Villa">Sky Villa</option>
                </optgroup>
                <optgroup label="Custom / Other">
                  <option value="__custom__">+ Custom Configuration...</option>
                </optgroup>
              </select>
              {isCustomConfig && (
                <input
                  type="text"
                  placeholder="Type custom configuration..."
                  value={customConfig}
                  onChange={(e) => {
                    setCustomConfig(e.target.value);
                    setBhk(e.target.value);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-xs"
                />
              )}
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Carpet Area</label>
              <input
                type="text"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                placeholder="e.g. 1,250 Sq.Ft."
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Possession Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-400 bg-white"
            >
              <option value="Ready to Move">Ready to Move</option>
              <option value="Under-Construction">Under-Construction</option>
              <option value="Newly Launched">Newly Launched</option>
              <option value="Pre-Launch">Pre-Launch</option>
              <option value="Draft">Draft (Unpublished)</option>
            </select>
          </div>

          {/* Suitable Business Purposes (Multi-Select) */}
          <BusinessPurposesMultiSelect
            selectedIds={selectedPurposes}
            onChange={setSelectedPurposes}
          />

          {/* Multiple Photos Manager */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-zinc-800">Property Photos ({images.filter(Boolean).length} added)</span>
              </div>
              <button
                type="button"
                onClick={handleAddImageSlot}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Another Photo</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">
              Add multiple photos (Photo #1 is the primary cover image). Only uploaded photos will be displayed on the property page.
            </p>

            {/* Thumbnail Preview Strip */}
            {images.filter(Boolean).length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 bg-zinc-50 rounded-xl border border-zinc-200">
                {images.map((url, idx) => {
                  if (!url) return null;
                  return (
                    <div key={idx} className="relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100">
                      <img src={url} alt={`Photo #${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[8px] font-bold text-white px-1 py-0.2 rounded">
                        {idx === 0 ? 'Cover' : `#${idx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Image Inputs */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {images.map((url, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-200">
                  <div className="w-12 h-10 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-200 shrink-0 flex items-center justify-center relative">
                    {url ? (
                      <img src={url} alt={`#${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-zinc-400" />
                    )}
                    <span className="absolute top-0.5 left-0.5 bg-zinc-900/80 text-[8px] font-bold text-white px-1 rounded">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="relative flex-1 flex items-center">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder={index === 0 ? "Cover Photo URL / Upload (https://...)" : `Photo #${index + 1} URL / Upload (https://...)`}
                      className="w-full pl-3 pr-8 py-1.5 text-xs border border-zinc-200 bg-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                    <label className="absolute right-1 cursor-pointer p-1 text-zinc-400 hover:text-amber-600 rounded" title="Upload Local Photo">
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(index, file);
                        }}
                      />
                    </label>
                  </div>

                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMakeCover(index)}
                      className="p-1.5 text-zinc-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition shrink-0 cursor-pointer"
                      title="Set as Cover Photo"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveImageSlot(index)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 1 Video Walkthrough */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-zinc-800">Video Walkthrough (1 Video)</span>
              </div>
              {videoUrl && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Video Attached
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500">
              Paste a YouTube walkthrough link, Vimeo, or direct MP4 URL. If empty, no video tour button will appear.
            </p>

            <div className="relative flex items-center">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="e.g. https://www.youtube.com/watch?v=... or https://.../walkthrough.mp4"
                className="w-full pl-3 pr-8 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-400 bg-white"
              />
              {videoUrl && (
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="absolute right-2 text-zinc-400 hover:text-rose-600"
                  title="Clear video"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Description Overview</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Exclusive luxury property curated by Anv Reealty..."
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="font-medium text-zinc-700">Publish immediately on website</span>
            <button
              type="button"
              onClick={() => setPublishOnWebsite(!publishOnWebsite)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                publishOnWebsite ? 'bg-zinc-900' : 'bg-zinc-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  publishOnWebsite ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!name.trim()) return alert('Please enter property name');
              const cleanImages = images.map((u) => u.trim()).filter(Boolean);
              const finalConfig = (isCustomConfig ? customConfig : bhk).trim() || 'Commercial';
              onAdd({ 
                title: name, 
                name, 
                developer, 
                location, 
                price, 
                bhk: finalConfig, 
                configuration: finalConfig,
                propertyType: finalConfig,
                sqft, 
                status, 
                listingType: listingType === 'Rent' ? 'Rent' : 'Sale',
                businessPurposeIds: selectedPurposes,
                businessPurposes: selectedPurposes,
                description, 
                imageUrl: cleanImages[0] || '',
                image: cleanImages[0] || '',
                images: cleanImages,
                videoUrl: videoUrl.trim(),
                publishStatus: publishOnWebsite ? 'Published' : 'Draft' 
              });
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-black hover:bg-zinc-800 rounded-lg transition shadow-xs cursor-pointer"
          >
            {publishOnWebsite ? 'Publish Property' : 'Save as Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= EDIT PROPERTY MODAL =================
export function EditPropertyModal({
  isOpen,
  onClose,
  onSave,
  property,
  availableLocations = [],
  availablePropertyTypes = []
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string | number, data: any) => Promise<void> | void;
  property: any;
  availableLocations?: { name: string }[];
  availablePropertyTypes?: { name: string }[];
}) {
  const [name, setName] = useState('');
  const [developer, setDeveloper] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [bhk, setBhk] = useState('');
  const [customConfig, setCustomConfig] = useState('');
  const [isCustomConfig, setIsCustomConfig] = useState(false);
  const [sqft, setSqft] = useState('');
  const [status, setStatus] = useState('Ready to Move');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>(['']);
  const [videoUrl, setVideoUrl] = useState('');
  const [listingType, setListingType] = useState<'Buy' | 'Rent'>('Buy');
  const [selectedPurposes, setSelectedPurposes] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Update states when property changes
  React.useEffect(() => {
    if (property) {
      setName(property.name || property.title || '');
      setDeveloper(property.developer || '');
      setLocation(property.location || property.address || '');
      setPrice(property.priceFormatted || (property.price ? String(property.price) : ''));
      
      const bStr = String(property.configuration || property.bhk || property.pt_name || '').trim();
      const isKnown = CATEGORY_OPTIONS.some((c) => c.toLowerCase() === bStr.toLowerCase()) ||
        ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4.5+ BHK Penthouse', 'Sky Villa'].some((t) => t.toLowerCase() === bStr.toLowerCase());
      
      if (bStr && !isKnown) {
        setIsCustomConfig(true);
        setCustomConfig(bStr);
        setBhk(bStr);
      } else {
        setIsCustomConfig(false);
        setCustomConfig('');
        setBhk(bStr || 'Office Space');
      }
      
      const sStr = String(property.sqft || property.carpetArea || '');
      setSqft(sStr.toLowerCase().includes('sq') ? sStr : (sStr ? `${sStr} Sq.Ft.` : ''));
      
      setStatus(property.status || property.publishStatus || 'Ready to Move');
      setDescription(property.description || '');

      // Extract existing images
      let propImages: string[] = [];
      if (Array.isArray(property.images) && property.images.length > 0) {
        propImages = property.images
          .map((img: any) => (typeof img === 'string' ? img : img?.url || ''))
          .filter(Boolean);
      }
      if (propImages.length === 0 && Array.isArray(property.all_images) && property.all_images.length > 0) {
        propImages = property.all_images.filter(Boolean);
      }
      if (propImages.length === 0) {
        const single = property.image || property.imageUrl;
        if (single) propImages = [single];
      }
      setImages(propImages.length > 0 ? propImages : ['']);

      // Extract existing videoUrl
      setVideoUrl(property.videoUrl || property.video || '');

      // Extract existing listingType (Buy vs Rent)
      const rawLt = String(property.listingType || property.listing_type || property.type || '').toLowerCase();
      if (rawLt.includes('rent') || rawLt.includes('lease')) {
        setListingType('Rent');
      } else {
        setListingType('Buy');
      }

      // Extract existing business purposes
      const existingPIds = Array.isArray(property.businessPurposeIds)
        ? property.businessPurposeIds
        : (Array.isArray(property.businessPurposes) ? property.businessPurposes.map((bp: any) => bp.id || bp) : []);
      setSelectedPurposes(existingPIds);
    }
  }, [property]);

  if (!isOpen || !property) return null;

  const handleAddImageSlot = () => setImages((prev) => [...prev, '']);
  const handleRemoveImageSlot = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [''];
    });
  };
  const handleImageChange = (index: number, val: string) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };
  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const item = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [item, ...rest];
    });
  };
  const handleFileUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleImageChange(index, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) return alert('Please enter property name');
    setIsSaving(true);
    try {
      const cleanImages = images.map((u) => u.trim()).filter(Boolean);
      const cleanVideo = videoUrl.trim();
      const finalConfig = (isCustomConfig ? customConfig : bhk).trim() || 'Commercial';
      await onSave(property.id, {
        name: name.trim(),
        title: name.trim(),
        developer: developer.trim(),
        location: location.trim(),
        address: location.trim(),
        price,
        bhk: finalConfig,
        configuration: finalConfig,
        propertyType: finalConfig,
        sqft,
        listingType: listingType === 'Rent' ? 'Rent' : 'Sale',
        status,
        publishStatus: status === 'Draft' ? 'Draft' : 'Published',
        businessPurposeIds: selectedPurposes,
        businessPurposes: selectedPurposes,
        description: description.trim(),
        imageUrl: cleanImages[0] || '',
        image: cleanImages[0] || '',
        images: cleanImages,
        videoUrl: cleanVideo
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-zinc-200 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-base">Edit Property Listing</h3>
              <p className="text-[11px] text-zinc-500">Edit listing specifications, multiple photos, and video walkthrough</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSaving} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs overflow-y-auto pr-1 flex-1">
          {/* Listing Purpose Tab: Buy vs Rent */}
          <div>
            <label className="block font-semibold text-zinc-800 mb-1.5">Listing Purpose / Intent *</label>
            <div className="flex items-center gap-2 p-1.5 bg-zinc-100 rounded-xl border border-zinc-200">
              <button
                type="button"
                onClick={() => setListingType('Buy')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  listingType === 'Buy'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm font-black'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                }`}
              >
                <span>🏠 For Buy / Sale</span>
              </button>
              <button
                type="button"
                onClick={() => setListingType('Rent')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  listingType === 'Rent'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm font-black'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                }`}
              >
                <span>🔑 For Rent / Lease</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-800 mb-1">Property Name / Title *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
              placeholder="e.g. Signature Sky Suites"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">Developer / Brand</label>
              <input
                type="text"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
                placeholder="e.g. ANV Reealty"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">Location / Locality</label>
              <input
                type="text"
                list="admin-available-locations-edit"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
                placeholder="e.g. Baner, Pune"
              />
              <datalist id="admin-available-locations-edit">
                {availableLocations.map((l, i) => (
                  <option key={i} value={l.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">
                {listingType === 'Rent' ? 'Rent (₹ / Month) *' : 'Sale Price (₹) *'}
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
                placeholder={listingType === 'Rent' ? 'e.g. ₹45,000 / month' : 'e.g. ₹1.85 Cr'}
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">
                Category / Configuration *
              </label>
              <select
                value={isCustomConfig ? '__custom__' : bhk}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__custom__') {
                    setIsCustomConfig(true);
                    setBhk(customConfig || '');
                  } else {
                    setIsCustomConfig(false);
                    setBhk(val);
                  }
                }}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition bg-white text-zinc-900 font-medium"
              >
                <option value="">-- Choose Category / Configuration --</option>
                <optgroup label="Official 17 Real Estate Categories">
                  {CATEGORY_OPTIONS.map((catTitle) => (
                    <option key={catTitle} value={catTitle}>
                      {catTitle}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Residential Unit Typologies">
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="4.5+ BHK Penthouse">4.5+ BHK Penthouse</option>
                  <option value="Sky Villa">Sky Villa</option>
                </optgroup>
                {bhk &&
                  !CATEGORY_OPTIONS.includes(bhk as any) &&
                  !['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4.5+ BHK Penthouse', 'Sky Villa'].includes(bhk) &&
                  !isCustomConfig && (
                    <optgroup label="Current Value">
                      <option value={bhk}>{bhk}</option>
                    </optgroup>
                  )}
                <optgroup label="Custom / Other">
                  <option value="__custom__">+ Custom Configuration...</option>
                </optgroup>
              </select>

              {isCustomConfig && (
                <input
                  type="text"
                  placeholder="Type custom configuration..."
                  value={customConfig}
                  onChange={(e) => {
                    setCustomConfig(e.target.value);
                    setBhk(e.target.value);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 text-xs"
                />
              )}
            </div>
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">Carpet Area</label>
              <input
                type="text"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
                placeholder="e.g. 1,450 Sq.Ft."
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-800 mb-1">Status / Listing Stage</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition bg-white"
            >
              <option value="Ready to Move">Ready to Move</option>
              <option value="Under-Construction">Under-Construction</option>
              <option value="Newly Launched">Newly Launched</option>
              <option value="Pre-Launch">Pre-Launch</option>
              <option value="Draft">Draft (Unpublished)</option>
              <option value="Published">Published (Active)</option>
            </select>
          </div>

          {/* Suitable Business Purposes (Multi-Select) */}
          <BusinessPurposesMultiSelect
            selectedIds={selectedPurposes}
            onChange={setSelectedPurposes}
          />

          {/* Multiple Photos Manager */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-zinc-800">Property Photos ({images.filter(Boolean).length} added)</span>
              </div>
              <button
                type="button"
                onClick={handleAddImageSlot}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Another Photo</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">
              Upload local photos or paste URLs. Photo #1 is the primary cover image. You can reorder or add more than 1 photo.
            </p>

            {/* Thumbnail Preview Strip */}
            {images.filter(Boolean).length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 bg-zinc-50 rounded-xl border border-zinc-200">
                {images.map((url, idx) => {
                  if (!url) return null;
                  return (
                    <div key={idx} className="relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100">
                      <img src={url} alt={`Photo #${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[8px] font-bold text-white px-1 py-0.2 rounded">
                        {idx === 0 ? 'Cover' : `#${idx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Image Inputs List */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {images.map((url, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-200">
                  <div className="w-12 h-10 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-200 shrink-0 flex items-center justify-center relative">
                    {url ? (
                      <img src={url} alt={`#${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-zinc-400" />
                    )}
                    <span className="absolute top-0.5 left-0.5 bg-zinc-900/80 text-[8px] font-bold text-white px-1 rounded">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="relative flex-1 flex items-center">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder={index === 0 ? "Cover Photo URL / Upload (https://...)" : `Photo #${index + 1} URL / Upload (https://...)`}
                      className="w-full pl-3 pr-8 py-1.5 text-xs border border-zinc-200 bg-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                    <label className="absolute right-1 cursor-pointer p-1 text-zinc-400 hover:text-amber-600 rounded" title="Upload Local Photo">
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(index, file);
                        }}
                      />
                    </label>
                  </div>

                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMakeCover(index)}
                      className="p-1.5 text-zinc-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition shrink-0 cursor-pointer"
                      title="Set as Cover Photo"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveImageSlot(index)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 1 Video Walkthrough Tour */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-zinc-800">Video Walkthrough (1 Video)</span>
              </div>
              {videoUrl ? (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Video Attached
                </span>
              ) : (
                <span className="text-[10px] font-medium text-zinc-400">
                  No video
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500">
              Paste a YouTube walkthrough link, Vimeo, or direct MP4 URL. If left empty, no video tour button will be shown.
            </p>

            <div className="relative flex items-center">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="e.g. https://www.youtube.com/watch?v=... or https://.../walkthrough.mp4"
                className="w-full pl-3 pr-8 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-400 bg-white"
              />
              {videoUrl && (
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="absolute right-2 text-zinc-400 hover:text-rose-600"
                  title="Clear video"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-800 mb-1">Description Overview</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 resize-none transition"
              placeholder="Overview of layout, amenities, and connectivity..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 shrink-0">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-white bg-black hover:bg-zinc-800 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= ADD LOCALITY MODAL =================
export function AddLocationModal({
  isOpen,
  onClose,
  onAdd
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; city: string; state: string; description: string }) => void;
}) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-zinc-200 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="font-bold text-zinc-900 text-base">Add Locality / Corridor</h3>
              <p className="text-[11px] text-zinc-500">Adds new geographical filter option to public website</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Locality / Area Name *</label>
            <input
              type="text"
              placeholder="e.g. Viman Nagar, Kharadi, Hinjewadi, Model Colony"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Corridor Description</label>
            <textarea
              rows={2}
              placeholder="e.g. Affluent IT hub & residential corridor..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!name.trim()) return alert('Please enter locality name');
              onAdd({ name: name.trim(), city: city.trim(), state: state.trim(), description: description.trim() });
              setName('');
              setDescription('');
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-black hover:bg-zinc-800 rounded-lg transition shadow-xs"
          >
            Save Locality
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= ADD PROPERTY TYPE MODAL =================
export function AddPropertyTypeModal({
  isOpen,
  onClose,
  onAdd
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; description: string }) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-zinc-200 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="font-bold text-zinc-900 text-base">Add Typology / Property Type</h3>
              <p className="text-[11px] text-zinc-500">Adds new classification filter to public website</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Typology Name *</label>
            <input
              type="text"
              placeholder="e.g. Commercial Office, Luxury Penthouse, Sky Villa, Duplex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="e.g. Grade-A commercial workspace, duplex sky residence..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!name.trim()) return alert('Please enter typology name');
              onAdd({ name: name.trim(), description: description.trim() });
              setName('');
              setDescription('');
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-black hover:bg-zinc-800 rounded-lg transition shadow-xs"
          >
            Save Typology
          </button>
        </div>
      </div>
    </div>
  );
}


// ================= COMMAND PALETTE (⌘K) =================
export function CommandPalette({
  isOpen,
  onClose,
  onNavigate
}: {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (target: string) => void;
}) {
  const [query, setQuery] = useState('');

  const commands = [
    { id: 'dashboard', title: 'Dashboard Overview', category: 'Navigation', icon: Layout },
    { id: 'properties', title: 'Properties (248)', category: 'Navigation', icon: Building },
    { id: 'projects', title: 'Active Projects (24)', category: 'Navigation', icon: Building2 },
    { id: 'homepage-editor', title: 'Homepage Live Section Manager', category: 'CMS', icon: Layout },
    { id: 'blog-posts', title: 'Published Blogs & Insights', category: 'Editorial', icon: FileEdit },
    { id: 'enquiries', title: 'Public Enquiries (128)', category: 'CRM', icon: Search },
    { id: 'public-site', title: 'Visit Public Site (anvrealty.com)', category: 'Quick Action', icon: ExternalLink }
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggling
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-zinc-200 shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Type a command, search properties, sections, or pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 text-sm bg-transparent outline-hidden text-zinc-900 placeholder-zinc-400"
          />
          <span className="text-[10px] font-mono text-zinc-400 border border-zinc-200 px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No matching commands or pages found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-zinc-100 group-hover:bg-white text-zinc-600 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">{item.title}</p>
                      <p className="text-[10px] text-zinc-400">{item.category}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">Jump →</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ================= LIVE PREVIEW MODAL =================
export function LivePreviewModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/80 backdrop-blur-md animate-in fade-in">
      {/* Modal Top Bar */}
      <div className="h-14 bg-zinc-900 border-b border-zinc-800 px-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm tracking-tight text-white">ANV Live Preview</span>
          <span className="text-xs text-zinc-400 border-l border-zinc-800 pl-3">
            Public Website Sandbox
          </span>
        </div>

        {/* Viewport switchers */}
        <div className="flex items-center gap-1 bg-zinc-800/80 p-1 rounded-lg border border-zinc-700">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded text-xs flex items-center gap-1.5 transition ${
              device === 'desktop' ? 'bg-zinc-700 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-1.5 rounded text-xs flex items-center gap-1.5 transition ${
              device === 'tablet' ? 'bg-zinc-700 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded text-xs flex items-center gap-1.5 transition ${
              device === 'mobile' ? 'bg-zinc-700 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            className="text-xs text-zinc-300 hover:text-white px-2.5 py-1 rounded bg-zinc-800 flex items-center gap-1"
          >
            <span>Open in Tab</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-zinc-950">
        <div
          className={`transition-all duration-300 bg-white h-full rounded-xl overflow-hidden shadow-2xl border border-zinc-800 ${
            device === 'desktop'
              ? 'w-full max-w-7xl'
              : device === 'tablet'
              ? 'w-[768px]'
              : 'w-[390px]'
          }`}
        >
          <iframe
            src="/"
            title="Anv Reealty Preview"
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
}
