'use client';

import React from 'react';
import { X } from 'lucide-react';
import { ScraperImporter } from '@/components/admin/ScraperImporter';

interface ScraperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

export function ScraperModal({ isOpen, onClose, onImportComplete }: ScraperModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-50/95 backdrop-blur-md animate-in fade-in">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200">
        <h2 className="text-lg font-bold text-zinc-900">Universal Scraper Tool</h2>
        <button 
          onClick={onClose} 
          className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <ScraperImporter 
            onImportComplete={(count) => {
              onImportComplete(count);
              // Wait briefly before closing so they can see the success state
              setTimeout(() => {
                onClose();
              }, 2000);
            }} 
            showToast={(msg) => console.log('Scraper:', msg)}
          />
        </div>
      </div>
    </div>
  );
}
