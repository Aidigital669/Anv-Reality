'use client';

import React, { useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface PropertyNotFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string;
  selectedLocality?: string;
  selectedBhk?: string;
  onOpenRequirementForm: () => void;
  onResetSearch?: () => void;
}

export function PropertyNotFoundModal({
  isOpen,
  onClose,
  searchQuery,
  onOpenRequirementForm,
}: PropertyNotFoundModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleProceed();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProceed = () => {
    onClose();
    onOpenRequirementForm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleProceed();
      }}
    >
      <div className="relative w-full max-w-sm my-auto bg-zinc-950 text-white rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(217,119,6,0.3)] border border-amber-500/30 overflow-hidden flex flex-col transition-all animate-in zoom-in-95 duration-200 p-6 sm:p-7 text-center space-y-5">
        {/* Close Button */}
        <button
          onClick={handleProceed}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-sm border border-white/10 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-inner">
          <Search className="w-8 h-8" />
        </div>

        {/* Heading & Simple Text */}
        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Property Not Found
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
            {searchQuery
              ? `No verified properties found matching "${searchQuery}".`
              : 'No verified properties found matching your search criteria.'}
          </p>
        </div>

        {/* Clean OK Button */}
        <div className="pt-2">
          <button
            onClick={handleProceed}
            className="w-full py-3.5 px-6 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-black rounded-xl text-sm transition shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:shadow-[0_0_30px_rgba(217,119,6,0.6)] flex items-center justify-center cursor-pointer tracking-wide"
          >
            <span>OK</span>
          </button>
        </div>
      </div>
    </div>
  );
}
