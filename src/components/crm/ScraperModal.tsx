'use client';

import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { ScraperImporter } from '@/components/admin/ScraperImporter';

interface ScraperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

export function ScraperModal({ isOpen, onClose, onImportComplete }: ScraperModalProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleShowToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-50/95 backdrop-blur-md animate-in fade-in">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-6 z-50 bg-zinc-950 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-zinc-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-zinc-900">Universal Scraper Tool</h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
            Web & PDF Catalog Pipeline
          </span>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <ScraperImporter 
            onImportComplete={(count) => {
              onImportComplete(count);
              handleShowToast(`Imported ${count} listings to database!`);
            }} 
            showToast={handleShowToast}
          />
        </div>
      </div>
    </div>
  );
}
