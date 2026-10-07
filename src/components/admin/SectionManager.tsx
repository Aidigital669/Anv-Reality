'use client';

import React, { useState } from 'react';
import {
  GripVertical,
  Pencil,
  Check,
  RefreshCw,
  Layout,
  ChevronUp,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { HomepageSectionItem } from './types';

interface SectionManagerProps {
  sections: HomepageSectionItem[];
  onToggleSection: (id: string) => void;
  onEditSection: (section: HomepageSectionItem) => void;
  onReorderSections: (newSections: HomepageSectionItem[]) => void;
  onReindex: () => void;
  isSaving?: boolean;
}

export function SectionManager({
  sections,
  onToggleSection,
  onEditSection,
  onReorderSections,
  onReindex,
  isSaving = false
}: SectionManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...sections];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved);

    // Re-assign sequence numbers
    const renumbered = updated.map((item, idx) => ({
      ...item,
      orderNumber: String(idx + 1).padStart(2, '0')
    }));

    onReorderSections(renumbered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    const renumbered = updated.map((item, idx) => ({
      ...item,
      orderNumber: String(idx + 1).padStart(2, '0')
    }));

    onReorderSections(renumbered);
  };

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-800 shrink-0">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-zinc-900 tracking-tight">
              Homepage Live Section Manager
            </h2>
            <p className="text-[12px] text-zinc-500 mt-0.5">
              Drag to reorder layout sequence on anvrealty.com public landing page
            </p>
          </div>
        </div>

        {/* Status Badge & Re-index Button */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Sync Status: Auto-saved</span>
              </>
            )}
          </div>

          <button
            onClick={onReindex}
            className="px-3 py-1 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition shadow-2xs"
          >
            Re-index
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="divide-y divide-zinc-100">
        {sections.map((section, index) => {
          const isOver = dragOverIndex === index;
          const isDragging = draggedIndex === index;

          return (
            <div
              key={section.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              className={`p-3.5 sm:px-5 sm:py-4 flex items-center justify-between gap-3 transition-colors ${
                isDragging ? 'opacity-40 bg-zinc-50' : ''
              } ${isOver ? 'bg-amber-50/50 border-t-2 border-amber-600' : 'hover:bg-zinc-50/60'}`}
            >
              {/* Left Details */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Drag handle & Move Arrows */}
                <div className="flex items-center gap-1 text-zinc-400">
                  <div
                    className="cursor-grab active:cursor-grabbing p-1 hover:text-zinc-700 rounded transition"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <button
                      disabled={index === 0}
                      onClick={() => moveItem(index, 'up')}
                      className="p-0.5 text-zinc-300 hover:text-zinc-600 disabled:opacity-20"
                      aria-label="Move Up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      disabled={index === sections.length - 1}
                      onClick={() => moveItem(index, 'down')}
                      className="p-0.5 text-zinc-300 hover:text-zinc-600 disabled:opacity-20"
                      aria-label="Move Down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Index Number */}
                <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center font-mono font-semibold text-xs text-zinc-700 shrink-0">
                  {section.orderNumber}
                </div>

                {/* Title & Tag & Subtitle */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-zinc-900 text-sm tracking-tight truncate">
                      {section.title}
                    </span>

                    {/* Tag Badge */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        section.tagVariant === 'amber'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : section.tagVariant === 'blue'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200/70'
                      }`}
                    >
                      {section.tag}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-xl">
                    {section.subtitle}
                  </p>
                </div>
              </div>

              {/* Right Controls: Switch + Edit */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Custom Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={section.isActive}
                  onClick={() => onToggleSection(section.id)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    section.isActive ? 'bg-zinc-900' : 'bg-zinc-300'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      section.isActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => onEditSection(section)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition"
                  title="Edit section content"
                  aria-label="Edit section"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
