import { NextRequest, NextResponse } from "next/server";
import { scrapeSingleProduct } from "@scraper/single-product-scraper";
import { runScrapyFramework } from "@scraper/scrapy-engine";

export const maxDuration = 60; // 60s execution limit

function formatIndianPrice(price: number): { formatted: string; suffix: string } {
  if (!price || price <= 0) return { formatted: "Price on Request", suffix: "" };
  if (price >= 10000000) {
    const cr = (price / 10000000).toFixed(2).replace(/\.00$/, "");
    return { formatted: `₹${cr} Cr`, suffix: "Onwards" };
  }
  if (price >= 100000) {
    const lakh = (price / 100000).toFixed(1).replace(/\.0$/, "");
    return { formatted: `₹${lakh} Lakh`, suffix: "Onwards" };
  }
  return { formatted: `₹${price.toLocaleString("en-IN")}`, suffix: "" };
}

function extractBhk(title: string, specs: { key: string; value: string }[], desc = "", category = ""): string {
  const combined = `${title} ${desc} ${category} ${specs.map(s => `${s.key} ${s.value}`).join(" ")}`.toLowerCase();

  // Commercial typologies
  if (combined.includes("commercial office") || combined.includes("office space") || combined.includes("corporate office")) return "Commercial Office";
  if (combined.includes("showroom")) return "Retail Showroom";
  if (combined.includes("retail shop") || combined.includes("retail space") || combined.includes("shop")) return "Retail Shop";
  if (combined.includes("hospital") || combined.includes("medical premise") || combined.includes("clinic")) return "Healthcare / Medical";
  if (combined.includes("warehouse") || combined.includes("godown") || combined.includes("industrial")) return "Warehouse / Logistics";
  if (combined.includes("plot") || combined.includes("land") || combined.includes("guntha")) return "Residential / Commercial Plot";
  if (combined.includes("penthouse")) return "Signature Penthouse";
  if (combined.includes("villa") || combined.includes("row house") || combined.includes("bungalow")) return "Sky Villa";
  if (combined.includes("duplex")) return "Duplex Residence";
  if (combined.includes("studio")) return "Studio Apartment";

  // BHK Regex
  const match = title.match(/(\d+(?:\.\d+)?|\d+\/\d+)\s*BHK/i);
  if (match) return `${match[1]} BHK`;

  for (const s of specs) {
    const specMatch = `${s.key} ${s.value}`.match(/(\d+(?:\.\d+)?|\d+\/\d+)\s*BHK/i);
    if (specMatch) return `${specMatch[1]} BHK`;
    if (s.key.toLowerCase().includes("bedroom") || s.key.toLowerCase().includes("configuration")) {
      return s.value;
    }
  }

  const descBhkMatch = desc.match(/(\d+(?:\.\d+)?|\d+\/\d+)\s*BHK/i);
  if (descBhkMatch) return `${descBhkMatch[1]} BHK`;

  if (combined.includes("office") || combined.includes("commercial")) return "Commercial Office";
  return "Luxury Apartment";
}

function extractLocation(title: string, specs: { key: string; value: string }[], desc: string): string {
  // First check explicit location or address spec
  for (const s of specs) {
    const k = s.key.toLowerCase();
    if ((k.includes("location") || k.includes("address") || k.includes("locality") || k.includes("city")) && s.value && s.value.length > 2) {
      return s.value.trim();
    }
  }

  const cities = [
    "Baner", "Balewadi", "Koregaon Park", "Kalyani Nagar", "Viman Nagar", "Kharadi", "Hinjawadi", "Hinjewadi",
    "Wakad", "Bavdhan", "Mahalunge", "Kothrud", "Aundh", "Magarpatta", "Hadapsar", "Undri", "Kondhwa",
    "Pimpri", "Chinchwad", "Ravet", "Camp", "Boat Club Road", "Senapati Bapat Road", "Model Colony",
    "Worli", "Bandra", "Juhu", "Powai", "Andheri", "Lower Parel", "Dadar", "BKC", "Thane", "Navi Mumbai",
    "Whitefield", "Indiranagar", "Koramangala", "Gurgaon", "Golf Course Road", "Noida", "Pune", "Mumbai"
  ];
  const fullText = `${title} ${desc} ${specs.map(s => `${s.key} ${s.value}`).join(" ")}`;

  for (const city of cities) {
    if (new RegExp(`\\b${city}\\b`, "i").test(fullText)) {
      if (city === "Pune" || city === "Mumbai") return `${city}, Maharashtra`;
      if (["Worli", "Bandra", "Juhu", "Powai", "Andheri", "Lower Parel", "Dadar", "BKC", "Thane", "Navi Mumbai"].includes(city)) {
        return `${city}, Mumbai`;
      }
      return `${city}, Pune`;
    }
  }

  return "Pune, Maharashtra";
}

function extractCarpetArea(specs: { key: string; value: string }[], desc: string): string {
  // First check explicit area spec
  for (const s of specs) {
    const k = s.key.toLowerCase();
    if (k.includes("area") || k.includes("sqft") || k.includes("carpet") || k.includes("built-up") || k.includes("size")) {
      const match = s.value.match(/(\d[\d,.]*)\s*(?:sq\.?\s*ft\.?|sqft|sq\.?\s*mtr|acres?|guntha)?/i);
      if (match) return `${match[1].replace(/,/g, "")} Sq.Ft.`;
    }
  }

  const match = `${desc} ${specs.map(s => `${s.key} ${s.value}`).join(" ")}`.match(/(\d[\d,.]*)\s*(?:sq\.?\s*ft\.?|sqft|carpet\s*area)/i);
  if (match) return `${match[1].replace(/,/g, "")} Sq.Ft.`;
  return "1,250 Sq.Ft.";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let url = body?.url?.trim();
    const mode = body?.mode || "single"; // "single" | "deep"

    if (!url) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid property or website URL." },
        { status: 400 }
      );
    }

    // Auto-normalize protocol if user enters domain without http:// or https://
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    if (mode === "deep") {
      // Crawl entire domain
      const crawlRes = await runScrapyFramework(url, 15);
      let properties = (crawlRes.products || []).map((p: any, idx: number) => {
        const { formatted, suffix } = formatIndianPrice(p.price);
        const bhk = extractBhk(p.title, p.specs || [], p.description || "", p.category || "");
        const location = extractLocation(p.title, p.specs || [], p.description || "");

        return {
          id: `scraped-${Date.now()}-${idx}`,
          name: p.title,
          developer: p.brand || crawlRes.company?.name || "ANV Partner Developer",
          location,
          price: formatted,
          priceRaw: p.price,
          priceSuffix: suffix,
          bhk,
          sqft: p.specs?.find((s: any) => s.key.toLowerCase().includes("area"))?.value || "1,150 - 2,400 Sq.Ft.",
          status: "Under-Construction",
          description: p.description || `Luxury residence discovered from ${url}`,
          image: p.primaryImage || "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          images: p.images || [],
          tags: ["Scraped Listing", "Verified Source"],
          sourceUrl: p.sourceUrl || url
        };
      });

      // If deep crawl found 0 items, gracefully fall back to single scrape of root URL
      if (properties.length === 0) {
        const singleResult = await scrapeSingleProduct(url);
        if (singleResult.success && singleResult.product) {
          const sp = singleResult.product;
          const { formatted, suffix } = formatIndianPrice(sp.price);
          const bhk = extractBhk(sp.title, sp.specs || [], sp.description || "", sp.category || "");
          const location = extractLocation(sp.title, sp.specs || [], sp.description || "");
          const carpetArea = extractCarpetArea(sp.specs || [], sp.description || "");

          properties = [{
            id: `scraped-${Date.now()}-0`,
            name: sp.title,
            developer: sp.brand || "",
            location,
            price: formatted,
            priceRaw: sp.price,
            priceSuffix: suffix,
            bhk,
            sqft: carpetArea,
            status: "Ready to Move",
            description: sp.description || `Luxury residence discovered from ${url}`,
            image: sp.primaryImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            images: sp.images || [],
            tags: ["Scraped Listing", "Verified Source"],
            sourceUrl: url
          }];
        }
      }

      return NextResponse.json({
        success: true,
        mode: "deep",
        company: crawlRes.company,
        properties,
        totalFound: properties.length
      });
    }

    // Single Property Scrape
    const result = await scrapeSingleProduct(url);

    if (!result.success || !result.product) {
      return NextResponse.json(
        { success: false, error: result.error || "Unable to extract listing data from target page." },
        { status: 422 }
      );
    }

    const p = result.product;
    const { formatted, suffix } = formatIndianPrice(p.price);
    const bhk = extractBhk(p.title, p.specs || [], p.description || p.shortDesc || "", p.category || "");
    const location = extractLocation(p.title, p.specs || [], p.description || p.shortDesc || "");
    const carpetArea = extractCarpetArea(p.specs || [], p.description || p.shortDesc || "");

    const property = {
      id: `scraped-${Date.now()}`,
      name: p.title,
      developer: p.brand || "Luxury Collection Developer",
      location,
      price: formatted,
      priceRaw: p.price,
      priceSuffix: suffix,
      bhk,
      sqft: carpetArea,
      status: "Ready to Move",
      description: p.description || p.shortDesc || `Exclusive property scraped from ${p.domain}`,
      image: p.primaryImage || (p.images && p.images[0]) || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      images: p.images && p.images.length > 0 ? p.images : [p.primaryImage],
      specs: p.specs || [],
      tags: p.aiKeywords && p.aiKeywords.length > 0 ? p.aiKeywords.slice(0, 4) : ["RERA Registered", "Prime Location"],
      rating: p.ratingSummary?.score || 4.8,
      sourceUrl: url,
      domain: p.domain
    };

    return NextResponse.json({
      success: true,
      mode: "single",
      property
    });
  } catch (error: any) {
    console.error("Link Scraper API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute link scraper." },
      { status: 500 }
    );
  }
}
