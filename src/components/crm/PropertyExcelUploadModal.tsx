'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Search,
  Building2,
  MapPin,
  Eye,
  Table as TableIcon,
  LayoutGrid,
  Check,
  RefreshCw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';
import * as XLSX from 'xlsx';

export interface ParsedPropertyRow {
  id: string;
  title: string;
  category: string;
  location: string;
  price: string | number;
  priceFormatted: string;
  status: string;
  sqft: string | number;
  developer: string;
  imageUrl: string;
  description: string;
  publishStatus: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  videoUrl?: string;
  isValid: boolean;
  errors?: string[];
}

interface PropertyExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

const SAMPLE_TEMPLATE_PROPERTIES = [
  {
    "Property Name": "Giga Space IT Park Grade-A Commercial Office",
    "Category": "Commercial Office",
    "Location": "Viman Nagar, Pune",
    "Price": "₹1.58 Cr",
    "Status": "Ready to Move",
    "Carpet Area (sqft)": 2480,
    "Developer": "Giga Group",
    "Image URL": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    "Description": "Prime Grade-A commercial corporate office space in Giga Space IT Park with 100% power backup and multi-level car parking.",
    "Publish Status": "Published",
    "Bedrooms": "",
    "Bathrooms": 2,
    "Video URL": ""
  },
  {
    "Property Name": "Commercial Medical / Hospital Facility",
    "Category": "Hospital",
    "Location": "Undri, Pune",
    "Price": "₹6.00 Cr",
    "Status": "Ready to Move",
    "Carpet Area (sqft)": 6200,
    "Developer": "Undri MediCorp",
    "Image URL": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    "Description": "High-yield healthcare & multi-specialty hospital infrastructure with oxygen lines, stretcher elevators, and clear approvals.",
    "Publish Status": "Published",
    "Bedrooms": "",
    "Bathrooms": 6,
    "Video URL": ""
  },
  {
    "Property Name": "WestView Corporate Office Space by Panchshil",
    "Category": "Office Space",
    "Location": "Koregaon Park, Pune",
    "Price": "₹14.32 Cr",
    "Status": "Ready to Move",
    "Carpet Area (sqft)": 11500,
    "Developer": "Panchshil Realty",
    "Image URL": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    "Description": "Iconic glass-facade LEED certified commercial tower overlooking lush greenery in Koregaon Park.",
    "Publish Status": "Published",
    "Bedrooms": "",
    "Bathrooms": 4,
    "Video URL": ""
  },
  {
    "Property Name": "Skyline Presidential Penthouse with Private Deck",
    "Category": "Penthouse",
    "Location": "Baner, Pune",
    "Price": "₹3.85 Cr",
    "Status": "Ready to Move",
    "Carpet Area (sqft)": 3800,
    "Developer": "VTP Realty",
    "Image URL": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    "Description": "Ultra-luxury duplex penthouse with wrap-around private sundeck, Italian marble flooring, and smart home automation.",
    "Publish Status": "Published",
    "Bedrooms": 4,
    "Bathrooms": 5,
    "Video URL": ""
  },
  {
    "Property Name": "High-Street Retail Showroom & Commercial Boutique",
    "Category": "Shop/Showroom",
    "Location": "Kalyani Nagar, Pune",
    "Price": "₹2.90 Cr",
    "Status": "Ready to Move",
    "Carpet Area (sqft)": 1850,
    "Developer": "K Raheja Corp",
    "Image URL": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    "Description": "Road-facing high-visibility commercial showroom ideal for jewelry, automobile, or luxury flagship stores.",
    "Publish Status": "Published",
    "Bedrooms": "",
    "Bathrooms": 2,
    "Video URL": ""
  }
];

function formatPriceForDisplay(rawPrice: any): string {
  if (typeof rawPrice === 'number' && !isNaN(rawPrice)) {
    if (rawPrice >= 10000000) return `₹${(rawPrice / 10000000).toFixed(2)} Cr`;
    if (rawPrice >= 100000) return `₹${(rawPrice / 100000).toFixed(1)} Lakh`;
    if (rawPrice > 0) return `₹${rawPrice.toLocaleString('en-IN')}`;
    return 'Price on Request';
  }
  if (!rawPrice) return 'Price on Request';
  const str = String(rawPrice).trim();
  if (/on request/i.test(str)) return 'Price on Request';
  if (/^₹/.test(str)) return str;
  if (/cr|crore|lakh|lac/i.test(str)) return `₹${str}`;
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (!isNaN(num)) {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} Lakh`;
    if (num > 0) return `₹${num.toLocaleString('en-IN')}`;
  }
  return str || 'Price on Request';
}

function getFallbackImage(categoryStr: string): string {
  const lower = (categoryStr || '').toLowerCase();
  if (lower.includes('hospital') || lower.includes('clinic') || lower.includes('medical')) {
    return 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80';
  }
  if (lower.includes('commercial office') || lower.includes('office space') || lower.includes('it park') || lower.includes('office')) {
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';
  }
  if (lower.includes('shop') || lower.includes('showroom') || lower.includes('retail')) {
    return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80';
  }
  if (lower.includes('restaurant') || lower.includes('cafe')) {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80';
  }
  if (lower.includes('hotel') || lower.includes('resort')) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
  }
  if (lower.includes('bungalow') || lower.includes('villa')) {
    return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
  }
  if (lower.includes('penthouse')) {
    return 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
  }
  return 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';
}

export function PropertyExcelUploadModal({
  isOpen,
  onClose,
  onImportComplete
}: PropertyExcelUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedPropertyRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'cards' | 'table'>('cards');
  const [searchPreview, setSearchPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Download Sample Template (.xlsx)
  const handleDownloadTemplate = (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      const ws = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_PROPERTIES);

      // Auto-size columns for clean presentation
      ws['!cols'] = [
        { wch: 45 }, // Property Name
        { wch: 22 }, // Category
        { wch: 24 }, // Location
        { wch: 15 }, // Price
        { wch: 18 }, // Status
        { wch: 18 }, // Carpet Area (sqft)
        { wch: 22 }, // Developer
        { wch: 40 }, // Image URL
        { wch: 45 }, // Description
        { wch: 16 }, // Publish Status
        { wch: 10 }, // Bedrooms
        { wch: 10 }, // Bathrooms
        { wch: 30 }  // Video URL
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Property_Catalog");

      if (format === 'csv') {
        XLSX.writeFile(wb, "ANV_Properties_Upload_Template.csv", { bookType: 'csv' });
      } else {
        XLSX.writeFile(wb, "ANV_Properties_Upload_Template.xlsx");
      }
    } catch (e: any) {
      console.error("Error downloading template:", e);
      setErrorMessage("Could not generate template: " + e.message);
    }
  };

  // Process File buffer & parse rows
  const processUploadedFile = (uploadedFile: File) => {
    setIsParsing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) throw new Error("Could not read file data");

        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) throw new Error("Excel sheet contains no pages");

        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (!rawJson || rawJson.length === 0) {
          throw new Error("No data rows found in the uploaded spreadsheet.");
        }

        const normalized: ParsedPropertyRow[] = rawJson
          .map((row, idx) => {
            const title = (
              row["Property Name"] ||
              row["property_name"] ||
              row["Title"] ||
              row.title ||
              row["Name"] ||
              row.name ||
              row["Project Name"] ||
              ""
            ).toString().trim();

            const category = (
              row["Category"] ||
              row.category ||
              row["Configuration"] ||
              row.configuration ||
              row["Property Type"] ||
              row.type ||
              row["BHK"] ||
              row.bhk ||
              "Commercial Office"
            ).toString().trim();

            const location = (
              row["Location"] ||
              row.location ||
              row["Address"] ||
              row.address ||
              row["City"] ||
              row.city ||
              row["Locality"] ||
              "Baner, Pune"
            ).toString().trim();

            const priceRaw = row["Price"] !== undefined && row["Price"] !== "" ? row["Price"] : row.price;
            const statusRaw = (row["Status"] || row.status || "Ready to Move").toString().trim();
            const sqftRaw = row["Carpet Area (sqft)"] || row["Carpet Area"] || row["Sqft"] || row.sqft || 1200;
            const developer = (row["Developer"] || row.developer || row["Builder"] || row.builder || "").toString().trim();
            const imageRaw = (row["Image URL"] || row["ImageUrl"] || row.image || row["Image"] || "").toString().trim();
            const description = (row["Description"] || row.description || "").toString().trim();
            const publishStatus = (row["Publish Status"] || row.publishStatus || "Published").toString().trim();

            const rowErrors: string[] = [];
            if (!title) rowErrors.push("Property Name is missing");

            return {
              id: `row-${idx}-${Date.now()}`,
              title: title || `Untitled Property #${idx + 1}`,
              category: category || "Commercial Office",
              location: location || "Pune, Maharashtra",
              price: priceRaw,
              priceFormatted: formatPriceForDisplay(priceRaw),
              status: statusRaw || "Ready to Move",
              sqft: sqftRaw,
              developer: developer || "ANV Realty Partner",
              imageUrl: imageRaw || getFallbackImage(category),
              description,
              publishStatus: /draft/i.test(publishStatus) ? "Draft" : "Published",
              bedrooms: row["Bedrooms"] || row.bedrooms || "",
              bathrooms: row["Bathrooms"] || row.bathrooms || "",
              videoUrl: row["Video URL"] || row.videoUrl || "",
              isValid: rowErrors.length === 0,
              errors: rowErrors
            };
          })
          .filter(r => r.title.length > 0);

        if (normalized.length === 0) {
          throw new Error("No valid property records found in spreadsheet.");
        }

        setParsedRows(normalized);
      } catch (err: any) {
        console.error("Parse error:", err);
        setErrorMessage(err.message || "Failed to parse spreadsheet");
        setParsedRows([]);
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setIsParsing(false);
      setErrorMessage("Failed to read the file. Please ensure it is a valid .xlsx or .csv file.");
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveRow = (id: string) => {
    setParsedRows(prev => prev.filter(r => r.id !== id));
  };

  // Import to Database
  const handleImportToDatabase = async () => {
    if (parsedRows.length === 0) {
      setErrorMessage("No properties to import.");
      return;
    }

    setIsImporting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Map to payload expected by bulk API
      const payload = {
        properties: parsedRows.map(r => ({
          title: r.title,
          category: r.category,
          location: r.location,
          price: r.price,
          status: r.status,
          sqft: r.sqft,
          developer: r.developer,
          imageUrl: r.imageUrl,
          description: r.description,
          publishStatus: r.publishStatus,
          bedrooms: r.bedrooms,
          bathrooms: r.bathrooms,
          videoUrl: r.videoUrl
        }))
      };

      const res = await fetch('/api/admin/properties/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to commit properties to database");
      }

      const count = data.count || parsedRows.length;
      setSuccessMessage(`✓ Successfully added ${count} properties to your live catalog!`);

      setTimeout(() => {
        onImportComplete(count);
        onClose();
      }, 1500);
    } catch (e: any) {
      console.error("Bulk commit error:", e);
      setErrorMessage(e.message || "Bulk import failed. Please check your data.");
    } finally {
      setIsImporting(false);
    }
  };

  const filteredPreview = parsedRows.filter(r =>
    !searchPreview ||
    r.title.toLowerCase().includes(searchPreview.toLowerCase()) ||
    r.location.toLowerCase().includes(searchPreview.toLowerCase()) ||
    r.category.toLowerCase().includes(searchPreview.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                  Excel Sheet Property Upload
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Bulk Catalog Importer
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Upload your Excel spreadsheet (.xlsx, .xls, .csv) to generate live property inventory cards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadTemplate('xlsx')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="Download pre-filled Excel template (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Excel Template</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Notifications */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-3 text-xs animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Error Processing Sheet</p>
                <p className="mt-0.5 text-rose-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="font-bold">{successMessage}</div>
            </div>
          )}

          {/* Upload Dropzone & Template Download Card */}
          {parsedRows.length === 0 ? (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/60 scale-[0.99]'
                    : 'border-zinc-300 hover:border-emerald-500 bg-zinc-50/50 hover:bg-emerald-50/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 shadow-sm group-hover:scale-105 transition">
                  {isParsing ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <UploadCloud className="w-8 h-8" />
                  )}
                </div>

                <h3 className="text-base font-bold text-zinc-900 mb-1">
                  {isParsing ? 'Analyzing Excel Spreadsheet...' : 'Drop your Excel or CSV file here'}
                </h3>
                <p className="text-xs text-zinc-500 max-w-md mb-4">
                  Supports <strong className="text-zinc-700">.xlsx, .xls, or .csv</strong> spreadsheets.
                  We automatically map columns for Title, Category, Location, Price, Status, Carpet Area, and Images!
                </p>

                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition">
                    Browse File on Device
                  </span>
                </div>
              </div>

              {/* Step-by-step guidance & sample download */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                    <h4 className="text-xs font-bold text-zinc-900">Get the Template</h4>
                  </div>
                  <p className="text-[11px] text-zinc-500 mb-3 leading-relaxed">
                    Download our ready-made template formatted with the exact headers needed for cards.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadTemplate('xlsx')}
                      className="flex-1 py-1.5 px-2 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>.XLSX Template</span>
                    </button>
                    <button
                      onClick={() => handleDownloadTemplate('csv')}
                      className="py-1.5 px-2 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 shadow-2xs transition"
                    >
                      <span>.CSV</span>
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                    <h4 className="text-xs font-bold text-zinc-900">Supported Columns</h4>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    <strong>Property Name</strong>, <strong>Category</strong> (Commercial Office, Hospital, etc.), <strong>Location</strong>, <strong>Price</strong> (e.g. ₹1.5 Cr), <strong>Status</strong>, <strong>Carpet Area</strong>, <strong>Image URL</strong>.
                  </p>
                </div>

                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
                    <h4 className="text-xs font-bold text-zinc-900">Automatic Card Creation</h4>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Missing images automatically get high-res architectural photos matching the category. Preview cards live before saving!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Parsed Records View */
            <div className="space-y-4">
              {/* File Info Bar & View Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900 truncate max-w-[200px] sm:max-w-xs">
                        {file?.name || 'Uploaded Spreadsheet'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {parsedRows.length} {parsedRows.length === 1 ? 'property' : 'properties'} loaded
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      All properties verified and ready for live inventory catalog
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mode switcher: Card View vs Table View */}
                  <div className="flex items-center bg-white border border-zinc-200 rounded-xl p-1 shadow-2xs">
                    <button
                      onClick={() => setPreviewMode('cards')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        previewMode === 'cards'
                          ? 'bg-zinc-900 text-white shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Card View</span>
                    </button>
                    <button
                      onClick={() => setPreviewMode('table')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        previewMode === 'table'
                          ? 'bg-zinc-900 text-white shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                      <span>Table View</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setParsedRows([]);
                      setFile(null);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Upload New</span>
                  </button>
                </div>
              </div>

              {/* Search in preview */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter parsed properties by name, location, or category..."
                  value={searchPreview}
                  onChange={(e) => setSearchPreview(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* CARD PREVIEW: Exact copy of Property Inventory cards */}
              {previewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto p-1">
                  {filteredPreview.map((prop) => (
                    <div
                      key={prop.id}
                      className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:shadow-md transition relative group"
                    >
                      <div className="relative h-44 w-full bg-zinc-100 overflow-hidden">
                        {prop.imageUrl ? (
                          <img
                            src={prop.imageUrl}
                            alt={prop.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            onError={(e) => {
                              // Fallback on broken image link
                              (e.target as HTMLImageElement).src = getFallbackImage(prop.category);
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-10 h-10 text-zinc-300" />
                          </div>
                        )}

                        {/* Category Badge on Top-Left (Identical to screenshot) */}
                        <div className="absolute top-3 left-3 px-2 py-1 bg-white/95 backdrop-blur-xs rounded-md text-[10px] font-bold text-zinc-900 border border-black/5 shadow-xs">
                          {prop.category}
                        </div>

                        {/* Status Badge on Top-Right (Identical to screenshot: Amber Ready to Move) */}
                        <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-white rounded-md text-[10px] font-bold shadow-xs">
                          {prop.status}
                        </div>

                        {/* Delete preview row button */}
                        <button
                          onClick={() => handleRemoveRow(prop.id)}
                          className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                          title="Remove from import"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-bold text-sm text-zinc-900 line-clamp-1">{prop.title}</h3>
                          <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1">
                            <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate">{prop.location}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                            <span className="text-zinc-500 block mb-0.5">Price</span>
                            <span className="font-bold text-zinc-900">{prop.priceFormatted}</span>
                          </div>
                          <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                            <span className="text-zinc-500 block mb-0.5">Configuration</span>
                            <span className="font-bold text-zinc-900 truncate block">
                              {prop.category}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md border text-emerald-600 bg-emerald-50 border-emerald-100">
                            Active on Website
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {prop.sqft ? `${prop.sqft} Sq.Ft.` : '1,200 Sq.Ft.'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TABLE PREVIEW */}
              {previewMode === 'table' && (
                <div className="border border-zinc-200 rounded-2xl overflow-hidden max-h-[50vh] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 sticky top-0 z-10 text-[11px] font-bold text-zinc-600">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Property Name</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Location</th>
                        <th className="py-2.5 px-3">Price</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Carpet Area</th>
                        <th className="py-2.5 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {filteredPreview.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-zinc-50/80 transition">
                          <td className="py-2.5 px-3 font-mono text-[10px] text-zinc-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-zinc-900 max-w-[220px] truncate">
                            {row.title}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 bg-zinc-100 rounded text-[11px] font-medium text-zinc-700">
                              {row.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-zinc-600 truncate max-w-[150px]">{row.location}</td>
                          <td className="py-2.5 px-3 font-bold text-zinc-900">{row.priceFormatted}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              {row.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-zinc-600">{row.sqft} sqft</td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => handleRemoveRow(row.id)}
                              className="p-1 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 rounded transition cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 bg-zinc-50/80 shrink-0">
          <div className="text-xs text-zinc-500">
            {parsedRows.length > 0 ? (
              <span>
                Ready to import <strong className="text-zinc-900">{parsedRows.length}</strong> verified properties to inventory.
              </span>
            ) : (
              <span>Upload an Excel or CSV file to begin.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>

            {parsedRows.length > 0 && (
              <button
                onClick={handleImportToDatabase}
                disabled={isImporting}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing to Catalog...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Publish {parsedRows.length} Properties to Catalog</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
