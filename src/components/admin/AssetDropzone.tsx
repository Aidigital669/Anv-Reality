'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, ChevronDown, FileUp, Loader2 } from 'lucide-react';
import { UploadedAsset } from './types';

interface AssetDropzoneProps {
  onAssetUploaded?: (asset: UploadedAsset) => void;
}

export function AssetDropzone({ onAssetUploaded }: AssetDropzoneProps) {
  const [category, setCategory] = useState('Architectural Exterior (High Res)');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recentlyUploaded, setRecentlyUploaded] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Architectural Exterior (High Res)',
    'Interior Staging (4K)',
    'Drone Aerials & Panoramas',
    'Floorplans & Blueprints',
    'Editorial & Press Kit',
    'Legal & RERA Certifications'
  ];

  const handleSimulatedUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(15);
    setRecentlyUploaded(null);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(100);
            setRecentlyUploaded(file.name);

            const newAsset: UploadedAsset = {
              id: Date.now().toString(),
              name: file.name,
              category,
              size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
              url: URL.createObjectURL(file),
              type: file.type.includes('video') ? 'video' : 'image',
              uploadedAt: 'Just now'
            };

            onAssetUploaded?.(newAsset);
          }, 400);
          return 95;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSimulatedUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleSimulatedUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="text-amber-800">
            <FileUp className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-zinc-900 text-[15px] tracking-tight">
            Quick Asset Dropzone
          </h3>
        </div>
        <span className="text-[11px] font-medium text-zinc-400">
          Max 100MB
        </span>
      </div>

      {/* Target Category Selector */}
      <div className="mb-3.5">
        <label className="block text-[11px] font-medium text-zinc-600 mb-1.5">
          Target Media Category
        </label>
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 pr-8 shadow-2xs"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Dropzone Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-amber-600 bg-amber-50/40 scale-[0.99]'
            : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {isUploading ? (
          <div className="py-3 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-amber-800 animate-spin mb-2" />
            <p className="text-xs font-semibold text-zinc-800">
              Uploading asset... {uploadProgress}%
            </p>
            <div className="w-36 h-1.5 bg-zinc-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-amber-700 transition-all duration-200 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : recentlyUploaded ? (
          <div className="py-2 flex flex-col items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-6 h-6 mb-1 text-emerald-600" />
            <p className="text-xs font-semibold text-zinc-800 truncate max-w-[200px]">
              {recentlyUploaded}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Synced to Edge Storage &bull; Ready
            </p>
          </div>
        ) : (
          <div className="py-2 flex flex-col items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 mb-2 shadow-2xs">
              <UploadCloud className="w-4 h-4 text-zinc-500" />
            </div>
            <p className="text-xs font-semibold text-zinc-800">
              Drag & drop asset or <span className="text-amber-800 underline">browse</span>
            </p>
            <p className="text-[10px] text-zinc-400 mt-1">
              Supports WEBP, PNG, MP4, JPG &bull; Auto 4K Web Optimization
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
