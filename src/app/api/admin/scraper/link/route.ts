import { NextRequest, NextResponse } from "next/server";
import { scrapeSingleProduct } from "@scraper/single-product-scraper";
import { runScrapyFramework } from "@scraper/scrapy-engine";
import { classifyScrapedProperty } from "@/lib/scraper-real-estate-classifier";

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
  const classified = classifyScrapedProperty(title, desc, specs, category);
  return classified.configuration;
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
        const classified = classifyScrapedProperty(p.title, p.description || "", p.specs || [], p.category || "");
        const location = extractLocation(p.title, p.specs || [], p.description || "");

        return {
          id: `scraped-${Date.now()}-${idx}`,
          name: p.title,
          developer: p.brand || crawlRes.company?.name || "ANV Partner Developer",
          location,
          price: formatted,
          priceRaw: p.price,
          priceSuffix: suffix,
          bhk: classified.configuration,
          configuration: classified.configuration,
          category: classified.category,
          tag: classified.tag,
          sqft: p.specs?.find((s: any) => s.key.toLowerCase().includes("area"))?.value || "1,150 - 2,400 Sq.Ft.",
          status: classified.status,
          description: p.description || `Luxury property discovered from ${url}`,
          image: p.primaryImage || "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          images: p.images || [],
          tags: [classified.tag, classified.category, "Scraped Listing", "Verified Source"],
          sourceUrl: p.sourceUrl || url
        };
      });

      // If deep crawl found 0 items, gracefully fall back to single scrape of root URL
      if (properties.length === 0) {
        const singleResult = await scrapeSingleProduct(url);
        if (singleResult.success && singleResult.product) {
          const sp = singleResult.product;
          const { formatted, suffix } = formatIndianPrice(sp.price);
          const classified = classifyScrapedProperty(sp.title, sp.description || "", sp.specs || [], sp.category || "");
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
            bhk: classified.configuration,
            configuration: classified.configuration,
            category: classified.category,
            tag: classified.tag,
            sqft: carpetArea,
            status: classified.status,
            description: sp.description || `Luxury property discovered from ${url}`,
            image: sp.primaryImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            images: sp.images || [],
            tags: [classified.tag, classified.category, "Scraped Listing", "Verified Source"],
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
    const classified = classifyScrapedProperty(p.title, p.description || p.shortDesc || "", p.specs || [], p.category || "");
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
      bhk: classified.configuration,
      configuration: classified.configuration,
      category: classified.category,
      tag: classified.tag,
      sqft: carpetArea,
      status: classified.status,
      description: p.description || p.shortDesc || `Exclusive property scraped from ${p.domain}`,
      image: p.primaryImage || (p.images && p.images[0]) || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      images: p.images && p.images.length > 0 ? p.images : [p.primaryImage],
      specs: p.specs || [],
      tags: [classified.tag, classified.category, ...(p.aiKeywords && p.aiKeywords.length > 0 ? p.aiKeywords.slice(0, 2) : ["RERA Registered"])],
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
