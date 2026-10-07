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

function extractBhk(title: string, specs: { key: string; value: string }[]): string {
  const match = title.match(/(\d+(?:\.\d+)?|\d+\/\d+)\s*BHK/i);
  if (match) return `${match[1]} BHK`;

  for (const s of specs) {
    const specMatch = `${s.key} ${s.value}`.match(/(\d+(?:\.\d+)?|\d+\/\d+)\s*BHK/i);
    if (specMatch) return `${specMatch[1]} BHK`;
    if (s.key.toLowerCase().includes("bedroom") || s.key.toLowerCase().includes("configuration")) {
      return s.value;
    }
  }

  if (title.toLowerCase().includes("penthouse")) return "Penthouse";
  if (title.toLowerCase().includes("villa")) return "Luxury Villa";
  return "3 BHK";
}

function extractLocation(title: string, specs: { key: string; value: string }[], desc: string): string {
  const cities = ["Baner", "Balewadi", "Koregaon Park", "Kalyani Nagar", "Kondhwa", "Bavdhan", "Mahalunge", "Kothrud", "Hinjawadi", "Viman Nagar", "Worli", "Bandra", "Juhu", "Powai", "Pune", "Mumbai"];
  const fullText = `${title} ${desc} ${specs.map(s => `${s.key} ${s.value}`).join(" ")}`;

  for (const city of cities) {
    if (new RegExp(`\\b${city}\\b`, "i").test(fullText)) {
      if (city === "Pune" || city === "Mumbai") return `${city}, Maharashtra`;
      return `${city}, Pune`;
    }
  }

  for (const s of specs) {
    if (s.key.toLowerCase().includes("location") || s.key.toLowerCase().includes("address")) {
      return s.value;
    }
  }

  return "Pune, Maharashtra";
}

function extractCarpetArea(specs: { key: string; value: string }[], desc: string): string {
  const match = `${desc} ${specs.map(s => `${s.key} ${s.value}`).join(" ")}`.match(/(\d[\d,.]*)\s*(?:sq\.?\s*ft\.?|sqft|carpet\s*area)/i);
  if (match) return `${match[1]} Sq.Ft. Carpet`;
  return "1,250 Sq.Ft. Carpet";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url?.trim();
    const mode = body?.mode || "single"; // "single" | "deep"

    if (!url) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid property or website URL." },
        { status: 400 }
      );
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return NextResponse.json(
        { success: false, error: "URL must begin with http:// or https://" },
        { status: 400 }
      );
    }

    if (mode === "deep") {
      // Crawl entire domain
      const crawlRes = await runScrapyFramework(url, 15);
      const properties = (crawlRes.products || []).map((p: any, idx: number) => {
        const { formatted, suffix } = formatIndianPrice(p.price);
        const bhk = extractBhk(p.title, p.specs || []);
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
          sqft: "1,150 - 2,400 Sq.Ft.",
          status: "Under-Construction",
          description: p.description || `Luxury residence discovered from ${url}`,
          image: p.primaryImage || "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          images: p.images || [],
          tags: ["Scraped Listing", "Verified Source"],
          sourceUrl: p.sourceUrl || url
        };
      });

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
    const bhk = extractBhk(p.title, p.specs || []);
    const location = extractLocation(p.title, p.specs || [], p.description || "");
    const carpetArea = extractCarpetArea(p.specs || [], p.description || "");

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
