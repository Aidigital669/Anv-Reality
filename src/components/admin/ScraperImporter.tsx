'use client';

import React, { useState, useRef } from 'react';
import {
  Globe,
  FileText,
  UploadCloud,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Layers,
  Building,
  MapPin,
  Tag,
  DollarSign,
  Maximize2,
  Trash2,
  Check,
  Terminal,
  RefreshCw,
  Search
} from 'lucide-react';

interface ScrapedProperty {
  id: string;
  name: string;
  developer: string;
  location: string;
  price: string;
  priceRaw?: number;
  priceSuffix?: string;
  bhk: string;
  sqft: string;
  status: string;
  description: string;
  image: string;
  images?: string[];
  specs?: { key: string; value: string }[];
  tags?: string[];
  sourceUrl?: string;
  sourceDocument?: string;
}

interface ScraperImporterProps {
  onImportComplete?: (count: number) => void;
  showToast?: (msg: string) => void;
}

export function ScraperImporter({ onImportComplete, showToast }: ScraperImporterProps) {
  const [activeMode, setActiveMode] = useState<'link' | 'pdf' | 'inventory'>('link');

  // Link Scraper State
  const [url, setUrl] = useState('');
  const [scrapeMode, setScrapeMode] = useState<'single' | 'deep'>('single');
  const [isScrapingLink, setIsScrapingLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkLogs, setLinkLogs] = useState<string[]>([]);
  const [scrapedSingle, setScrapedSingle] = useState<ScrapedProperty | null>(null);
  const [scrapedDeepList, setScrapedDeepList] = useState<ScrapedProperty[]>([]);

  // PDF Scraper State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [isScrapingPdf, setIsScrapingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfLogs, setPdfLogs] = useState<string[]>([]);
  const [extractedPdfItems, setExtractedPdfItems] = useState<ScrapedProperty[]>([]);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Imported Inventory State
  const [importedItems, setImportedItems] = useState<ScrapedProperty[]>([
    {
      id: 'demo-1',
      name: 'VTP Altair Residences (3 BHK)',
      developer: 'VTP Realty Group',
      location: 'Baner, Pune',
      price: '₹1.49 Cr',
      bhk: '3 BHK',
      sqft: '1,146 Sq.Ft. Carpet',
      status: 'Published',
      description: 'Extracted high-rise residential inventory in prime Baner hotspot.',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      sourceUrl: 'https://anvrealty.com/properties/vtp-altair'
    },
    {
      id: 'demo-2',
      name: 'The Sovereign Horizon Sky Villa',
      developer: 'Sovereign Developers',
      location: 'Kalyani Nagar, Pune',
      price: '₹2.10 Cr',
      bhk: '4 BHK',
      sqft: '1,850 Sq.Ft. Carpet',
      status: 'Published',
      description: 'Extracted from PDF brochure with private sky deck amenities.',
      image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      sourceDocument: 'The_Sovereign_Horizon_Brochure.pdf'
    }
  ]);

  const [isImporting, setIsImporting] = useState(false);

  // Quick URL Presets for instant testing
  const presets = [
    { label: 'ANV Luxury Listing', url: 'https://anvrealty.com/property/3bhk-luxury-apartment-kondhwa-pune' },
    { label: 'Ayurmor Catalog', url: 'https://ayurmor.com/products/ayurmor-herbal-soup-mix' },
    { label: 'VPS Hardware & Specs', url: 'https://contabo.com/en/vps/cloud-vps-m/' }
  ];

  // Execute Web Link Scrape
  const handleScrapeLink = async () => {
    if (!url.trim()) {
      setLinkError('Please enter a website or listing URL.');
      return;
    }

    setIsScrapingLink(true);
    setLinkError(null);
    setScrapedSingle(null);
    setScrapedDeepList([]);
    setLinkLogs([
      `[Init] Connecting to target: ${url}`,
      `[Engine] Inspecting HTML & Next.js AST chunks...`,
      `[AI Heuristics] Scanning for Indian Lakh/Crore patterns...`
    ]);

    try {
      const res = await fetch('/api/admin/scraper/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), mode: scrapeMode })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Scraping failed');
      }

      setLinkLogs((prev) => [
        ...prev,
        `[CDN Upgrader] Extracted full-resolution visual assets.`,
        `[Success] Scraped successfully in ${data.mode} mode!`
      ]);

      if (data.mode === 'deep') {
        setScrapedDeepList(data.properties || []);
        showToast?.(`Extracted ${data.properties?.length || 0} listings from domain!`);
      } else {
        setScrapedSingle(data.property);
        showToast?.(`Successfully scraped "${data.property.name}"!`);
      }
    } catch (err: any) {
      setLinkError(err.message || 'Scraping failed');
      setLinkLogs((prev) => [...prev, `[Error] ${err.message}`]);
    } finally {
      setIsScrapingLink(false);
    }
  };

  // Execute PDF Brochure Scrape
  const handleScrapePdf = async () => {
    if (!pdfFile && !pdfUrl.trim()) {
      setPdfError('Please upload a PDF file or enter a PDF URL.');
      return;
    }

    setIsScrapingPdf(true);
    setPdfError(null);
    setExtractedPdfItems([]);
    setPdfLogs([
      `[Init] Initializing PDF document reader...`,
      `[Engine] Multi-tiered parsing with pdf-parse and Gemini Multimodal AI...`,
      `[Extraction] Identifying unit layouts, carpet areas, and RERA numbers...`
    ]);

    try {
      let res;
      if (pdfFile) {
        const formData = new FormData();
        formData.append('file', pdfFile);
        res = await fetch('/api/admin/scraper/pdf', {
          method: 'POST',
          body: formData
        });
      } else {
        res = await fetch('/api/admin/scraper/pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileUrl: pdfUrl.trim() })
        });
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'PDF extraction failed');
      }

      setPdfLogs((prev) => [
        ...prev,
        `[Result] Extracted ${data.totalExtracted || 0} unit layouts from ${data.filename}`,
        `[Success] PDF parsing finished successfully!`
      ]);

      setExtractedPdfItems(data.properties || []);
      showToast?.(`Extracted ${data.properties?.length || 0} properties from brochure!`);
    } catch (err: any) {
      setPdfError(err.message || 'PDF extraction failed');
      setPdfLogs((prev) => [...prev, `[Error] ${err.message}`]);
    } finally {
      setIsScrapingPdf(false);
    }
  };

  // Import to Database Action
  const handleImportToDatabase = async (items: ScrapedProperty[]) => {
    if (items.length === 0) return;

    setIsImporting(true);
    try {
      const res = await fetch('/api/admin/scraper/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Import failed');
      }

      setImportedItems((prev) => [...items, ...prev]);
      onImportComplete?.(items.length);
      showToast?.(`Successfully imported ${items.length} property listings into Anv Reeality!`);
      setActiveMode('inventory');
    } catch (err: any) {
      showToast?.(`Import Error: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universal Scraper & PDF Intelligence Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Scrape & Import Luxury Properties
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
            Extract listings from any real estate portal, developer website, or upload complete PDF project brochures to automatically generate verified Anv Reeality catalog items.
          </p>

          {/* Engine Highlights */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] font-mono text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60">
              ⚡ Cheerio & Next.js AST
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60">
              🌐 Playwright Chromium
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60">
              📄 PDF-Parse & Gemini AI
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60">
              💎 2048px CDN Upgrader
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
        <button
          onClick={() => setActiveMode('link')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeMode === 'link'
              ? 'bg-black text-white shadow-xs'
              : 'bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Import via Link (Web URL)</span>
        </button>

        <button
          onClick={() => setActiveMode('pdf')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeMode === 'pdf'
              ? 'bg-black text-white shadow-xs'
              : 'bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Import via Brochure (PDF)</span>
        </button>

        <button
          onClick={() => setActiveMode('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeMode === 'inventory'
              ? 'bg-black text-white shadow-xs'
              : 'bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Scraped Inventory ({importedItems.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: WEB LINK SCRAPER ================= */}
      {activeMode === 'link' && (
        <div className="space-y-6 animate-in fade-in">
          {/* URL Input Form Card */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-zinc-900 text-base">Web Page Scraper</h3>
                <p className="text-xs text-zinc-500">Enter a property URL or portal link to extract data and images</p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl text-xs self-start sm:self-auto border border-zinc-200/80">
                <button
                  type="button"
                  onClick={() => setScrapeMode('single')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    scrapeMode === 'single' ? 'bg-white text-zinc-900 font-semibold shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Single Listing
                </button>
                <button
                  type="button"
                  onClick={() => setScrapeMode('deep')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    scrapeMode === 'deep' ? 'bg-white text-zinc-900 font-semibold shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Deep Domain Crawl
                </button>
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <input
                  type="url"
                  placeholder="https://anvrealty.com/property/3bhk-luxury-apartment-kondhwa-pune"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 focus:bg-white"
                />
                <Globe className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <button
                type="button"
                disabled={isScrapingLink}
                onClick={handleScrapeLink}
                className="px-5 py-2.5 bg-black hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition shrink-0"
              >
                {isScrapingLink ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Scrape & Extract</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Test Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-zinc-500 font-medium">Test Samples:</span>
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setUrl(preset.url)}
                  className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-[11px] text-zinc-700 font-medium transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {linkError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{linkError}</span>
              </div>
            )}
          </div>

          {/* Terminal Console Logs */}
          {linkLogs.length > 0 && (
            <div className="bg-zinc-950 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] shadow-sm space-y-1 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 pb-2 border-b border-zinc-800 text-[10px]">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-300">
                  <Terminal className="w-3.5 h-3.5" /> Scraper Engine Terminal Output
                </span>
                <span>Active</span>
              </div>
              <div className="pt-1 space-y-0.5 max-h-36 overflow-y-auto">
                {linkLogs.map((log, i) => (
                  <p key={i} className="leading-snug">{log}</p>
                ))}
              </div>
            </div>
          )}

          {/* Single Scraped Property Result Card */}
          {scrapedSingle && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-zinc-900 text-sm">Listing Data Extracted</span>
                </div>
                <button
                  onClick={() => handleImportToDatabase([scrapedSingle])}
                  disabled={isImporting}
                  className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition shadow-xs"
                >
                  {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Import Directly into ANV Database</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Photo Preview */}
                <div className="md:col-span-5 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 aspect-4/3 relative">
                  <img
                    src={scrapedSingle.image}
                    alt={scrapedSingle.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {scrapedSingle.bhk}
                  </div>
                </div>

                {/* Details */}
                <div className="md:col-span-7 space-y-3">
                  <div>
                    <h4 className="text-lg font-bold text-zinc-950 leading-snug">
                      {scrapedSingle.name}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{scrapedSingle.developer}</span>
                      <span>&bull;</span>
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{scrapedSingle.location}</span>
                    </p>
                  </div>

                  <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-medium">Price</span>
                      <p className="font-bold text-zinc-900 text-sm">{scrapedSingle.price}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-medium">Configuration</span>
                      <p className="font-semibold text-zinc-900">{scrapedSingle.bhk}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-medium">Carpet Area</span>
                      <p className="font-semibold text-zinc-900">{scrapedSingle.sqft}</p>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {scrapedSingle.description}
                  </p>

                  {/* Specs / Amenities */}
                  {scrapedSingle.specs && scrapedSingle.specs.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-zinc-700">Specifications:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {scrapedSingle.specs.slice(0, 6).map((sp, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-md"
                          >
                            <strong>{sp.key}:</strong> {sp.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {scrapedSingle.sourceUrl && (
                    <div className="pt-2">
                      <a
                        href={scrapedSingle.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-amber-800 hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Original Source Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Deep Scrape Grid Results */}
          {scrapedDeepList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-zinc-900 text-sm">
                  Discovered Catalog ({scrapedDeepList.length} items)
                </h4>
                <button
                  onClick={() => handleImportToDatabase(scrapedDeepList)}
                  disabled={isImporting}
                  className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Import All ({scrapedDeepList.length}) to Database</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scrapedDeepList.map((p) => (
                  <div key={p.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition p-3 space-y-2">
                    <div className="h-36 rounded-xl overflow-hidden bg-zinc-100">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h5 className="font-bold text-zinc-900 text-xs truncate">{p.name}</h5>
                      <p className="text-[11px] text-zinc-500 truncate">{p.location}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="font-bold text-zinc-900">{p.price}</span>
                      <button
                        onClick={() => handleImportToDatabase([p])}
                        className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded text-[10px] font-semibold"
                      >
                        + Import
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PDF BROCHURE SCRAPER ================= */}
      {activeMode === 'pdf' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-zinc-900 text-base">PDF Brochure & Catalog Parser</h3>
              <p className="text-xs text-zinc-500">
                Upload real estate project decks, brochures, and floorplan catalogs (PDF) to auto-extract units
              </p>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => pdfInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-200 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-50 rounded-2xl p-8 text-center transition cursor-pointer"
            >
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setPdfFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 mx-auto mb-2 shadow-2xs">
                <UploadCloud className="w-6 h-6 text-amber-800" />
              </div>
              {pdfFile ? (
                <div>
                  <p className="text-xs font-bold text-zinc-900">{pdfFile.name}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for AI extraction
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-zinc-800">
                    Click to select or drag & drop luxury PDF brochure
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Supports high-res brochures, price sheets & floorplan catalogs up to 200MB
                  </p>
                </div>
              )}
            </div>

            {/* Or enter PDF URL */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Or PDF Web URL:</span>
              <input
                type="url"
                placeholder="https://developer.com/brochures/signature-estate.pdf"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={isScrapingPdf}
                onClick={handleScrapePdf}
                className="px-5 py-2.5 bg-black hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition"
              >
                {isScrapingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Parsing PDF Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Extract Units from PDF</span>
                  </>
                )}
              </button>
            </div>

            {pdfError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pdfError}</span>
              </div>
            )}
          </div>

          {/* PDF Console Logs */}
          {pdfLogs.length > 0 && (
            <div className="bg-zinc-950 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] shadow-sm space-y-1 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 pb-2 border-b border-zinc-800 text-[10px]">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-300">
                  <Terminal className="w-3.5 h-3.5" /> PDF Scraper Engine Logs
                </span>
                <span>Active</span>
              </div>
              <div className="pt-1 space-y-0.5 max-h-36 overflow-y-auto">
                {pdfLogs.map((log, i) => (
                  <p key={i} className="leading-snug">{log}</p>
                ))}
              </div>
            </div>
          )}

          {/* Extracted PDF Units Table */}
          {extractedPdfItems.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">
                    Brochure Units Discovered ({extractedPdfItems.length})
                  </h4>
                  <p className="text-xs text-zinc-500">Verified configurations ready for catalog commit</p>
                </div>
                <button
                  onClick={() => handleImportToDatabase(extractedPdfItems)}
                  disabled={isImporting}
                  className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Import All to ANV Catalog</span>
                </button>
              </div>

              <div className="divide-y divide-zinc-100">
                {extractedPdfItems.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">{item.name}</p>
                        <p className="text-zinc-500 text-[11px]">{item.bhk} &bull; {item.sqft}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-zinc-900">{item.price}</p>
                      <button
                        onClick={() => handleImportToDatabase([item])}
                        className="text-[10px] font-semibold text-amber-800 hover:underline"
                      >
                        + Import Unit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: IMPORTED INVENTORY ================= */}
      {activeMode === 'inventory' && (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs space-y-4 p-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-zinc-900 text-base">Scraped Property Inventory</h3>
              <p className="text-xs text-zinc-500">Listings imported directly from web links and PDF brochures</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              {importedItems.length} Verified Listings
            </span>
          </div>

          <div className="divide-y divide-zinc-100">
            {importedItems.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-14 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-900 text-sm">{item.name}</h5>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {item.developer} &bull; {item.location} &bull; {item.bhk}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 font-mono text-zinc-600">
                        {item.sourceDocument ? `📄 ${item.sourceDocument}` : `🌐 ${item.sourceUrl?.slice(0, 30)}...`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-sm font-bold text-zinc-900">{item.price}</span>
                    <span className="block text-[10px] text-emerald-600 font-semibold">Active in Catalog</span>
                  </div>
                  <button
                    onClick={() => {
                      showToast?.(`Viewing ${item.name} in preview`);
                    }}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-lg transition"
                  >
                    View Listing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
