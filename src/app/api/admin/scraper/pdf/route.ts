import { NextRequest, NextResponse } from "next/server";
import { scrapePdfCatalog } from "@scraper/pdf-scraper";

export const maxDuration = 120; // 120s for deep PDF analysis

function formatIndianPrice(price: number): string {
  if (!price || price <= 0) return "Price on Request";
  if (price >= 10000000) {
    const cr = (price / 10000000).toFixed(2).replace(/\.00$/, "");
    return `₹${cr} Cr`;
  }
  if (price >= 100000) {
    const lakh = (price / 100000).toFixed(1).replace(/\.0$/, "");
    return `₹${lakh} Lakh`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let buffer: Buffer | null = null;
    let filename = "brochure.pdf";
    let fileUrl: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      fileUrl = (formData.get("fileUrl") as string) || undefined;

      if (file) {
        filename = file.name;
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      }
    } else {
      const json = await req.json();
      fileUrl = json.fileUrl;
      filename = json.filename || "online_brochure.pdf";
    }

    if (!buffer && !fileUrl) {
      return NextResponse.json(
        { success: false, error: "Please upload a PDF brochure or provide a valid PDF URL." },
        { status: 400 }
      );
    }

    const scrapeResult = await scrapePdfCatalog({
      buffer: buffer || undefined,
      fileUrl,
      filename,
      sellerSlug: "anvrealty",
      mode: "auto",
      autoImport: false
    });

    if (!scrapeResult.success) {
      return NextResponse.json(
        { success: false, error: scrapeResult.error || "Failed to extract content from PDF brochure." },
        { status: 422 }
      );
    }

    // Transform extracted items into real estate property items
    const properties = (scrapeResult.products || []).map((item: any, idx: number) => {
      const priceFormatted = formatIndianPrice(item.price);
      const bhkMatch = item.title.match(/(\d+(?:\.\d+)?|\d+\/\d+)\s*BHK/i);
      const bhk = bhkMatch ? `${bhkMatch[1]} BHK` : "3 BHK Luxury Residence";

      return {
        id: `pdf-${Date.now()}-${idx}`,
        name: item.title,
        developer: item.brand || "ANV Signature Partner",
        location: "Pune Prime Hub, Maharashtra",
        price: priceFormatted,
        priceRaw: item.price,
        bhk,
        sqft: "1,200 - 1,850 Sq.Ft.",
        status: "Newly Launched",
        description: item.description || `Extracted unit from project brochure: ${filename}`,
        image: item.primaryImage || "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        images: item.images && item.images.length > 0 ? item.images.map((i: any) => typeof i === 'string' ? i : i.url) : [],
        specs: item.specs || [],
        tags: ["Brochure Extracted", "Verified Specs"],
        sourceDocument: filename
      };
    });

    return NextResponse.json({
      success: true,
      filename,
      totalExtracted: properties.length,
      properties,
      stats: scrapeResult.stats,
      logs: scrapeResult.logs
    });
  } catch (error: any) {
    console.error("PDF Scraper API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal error parsing PDF document." },
      { status: 500 }
    );
  }
}
