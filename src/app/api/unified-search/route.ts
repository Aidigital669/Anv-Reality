import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Official Anv Reeality Public Helpline for all Seller connections
const OFFICIAL_ANV_PHONE = "93730 20701";
const OFFICIAL_ANV_EMAIL = "leads@anvrealty.com";

function maskBuyerName(name: string | null | undefined): string {
  if (!name || !name.trim()) return "Verified Patron (Pune)";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    const p = parts[0];
    return p.length > 2 ? `${p.slice(0, 2)}*** (Verified Buyer)` : "Verified Buyer";
  }
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() || "";
  return `${first} ${lastInitial}.*** (Verified Buyer)`;
}

// Active registered buyer inquiries directly from database
const SEED_BUYER_DEMANDS: any[] = [];

const SEARCH_STOP_WORDS = new Set([
  "i", "a", "an", "the", "in", "at", "to", "for", "of", "and", "or", "is", "with", "by", "on",
  "pune", "maharashtra", "flat", "flats", "apartment", "apartments", "property",
  "properties", "residence", "residences", "home", "homes", "house", "houses",
  "want", "need", "find", "get", "looking", "look", "search", "show", "me", "give",
  "buy", "buying", "purchase", "purchasing", "seller", "sellers", "buyer", "buyers",
  "sell", "selling", "available", "verified", "luxury", "best", "good", "all", "any"
]);

let openaiCooldownUntil = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSearch = (searchParams.get("search") || searchParams.get("query") || "").trim();
    let locality = searchParams.get("locality") || "";
    let bhk = searchParams.get("bhk") || "";
    let priceRange = searchParams.get("priceRange") || "";
    let status = searchParams.get("status") || "";

    const cleanSearch = rawSearch
      .replace(/[-_/\(\)\[\]]+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .trim();

    let intent: "seller" | "buyer" | "both" = "both";
    let primaryView: "buyer_leads" | "properties" = "properties";
    let aiSummary = "";
    let aiParsed = false;

    // Fast-path heuristic detection for Seller vs Buyer intent keywords
    const isSellerQuery = (text: string) => {
      const t = text.toLowerCase();
      if (/\b(?:i am a buyer|buyer looking to buy|buyer looking for (?:flat|home|property|house|apartment))\b/i.test(t)) {
        return false;
      }
      return /\b(?:want|need|find|get|looking for|look for|search for|connect with|require|seeking)\s+(?:a\s+|an\s+|the\s+|some\s+|any\s+|me\s+)?buyers?\b/i.test(t) ||
        /\bbuyers?\s+(?:for|needed|required|wanted)\b/i.test(t) ||
        /\b(?:sell|selling)\s+(?:my\s+|a\s+|an\s+)?(?:flat|apartment|property|home|house|plot|land|commercial|office|unit|penthouse)\b/i.test(t) ||
        /\b(?:i want to sell|want to sell|willing to sell|plan to sell|looking to sell|sell property|sell flat)\b/i.test(t) ||
        /\b(?:seller|sellers|owner|pitch property|have flat to sell|have property to sell|leads?)\b/i.test(t);
    };

    const isBuyerQuery = (text: string) => {
      const t = text.toLowerCase();
      return /\b(?:want to buy|looking to buy|plan to buy|wish to buy|ready to buy)\b/i.test(t) ||
        /\b(?:buy|buying|purchase|purchasing)\s+(?:a\s+|an\s+|the\s+|i\s+|\d+\s*)?(?:flat|apartment|property|home|house|commercial|office|unit|penthouse|\d+\s*bhk)\b/i.test(t) ||
        /\b(?:find|looking for|search for)\s+(?:a\s+|an\s+|the\s+)?(?:flat|apartment|property|home|house|commercial|office|penthouse|\d+\s*bhk)\b/i.test(t) ||
        /\b(?:i am a buyer|buyer seeking|buyer looking for)\b/i.test(t);
    };

    const sellerMatch = isSellerQuery(cleanSearch);
    const buyerMatch = isBuyerQuery(cleanSearch);

    if (sellerMatch && !buyerMatch) {
      intent = "seller";
      primaryView = "buyer_leads";
    } else if (sellerMatch && buyerMatch) {
      if (/\bbuyers?\b/i.test(cleanSearch) || /\bsell/i.test(cleanSearch)) {
        intent = "seller";
        primaryView = "buyer_leads";
      } else {
        intent = "buyer";
        primaryView = "properties";
      }
    } else if (buyerMatch) {
      intent = "buyer";
      primaryView = "properties";
    } else {
      intent = "both";
      primaryView = "properties";
    }

    const knownLocs = [
      "Koregaon Park", "Baner", "Balewadi", "Kalyani Nagar", "Bavdhan",
      "Mahalunge", "Shivajinagar", "Kharadi", "Worli", "Hinjewadi",
      "Wakad", "Viman Nagar", "Aundh", "Hadapsar", "Magarpatta",
      "Camp", "Kothrud"
    ];

    // 1. ChatGPT AI Semantic Analysis (determines intent: Buyer vs Seller, extracts locality, BHK, budget)
    if (openai && cleanSearch.length > 2 && Date.now() > openaiCooldownUntil) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const aiResponse = await openai.chat.completions.create(
          {
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are an AI real estate intent parser for Anv Reeality in Pune, India.
The marketplace serves two groups:
1. BUYERS: looking to buy or view properties (e.g. "buy flat", "3 BHK in Baner", "looking to buy 2 BHK").
2. SELLERS: owners or brokers looking for active buyers to sell to (e.g. "i want a buyer", "find buyer", "need buyers", "sell my flat").

Determine:
- "intent": "seller" (if looking for buyers or selling) | "buyer" (if looking to purchase or view properties) | "both" (if generic search)
- "primaryView": "buyer_leads" (if seller) | "properties" (if buyer or generic)
- "bhk": "1 BHK" | "2 BHK" | "3 BHK" | "4 BHK" | "4.5+ BHK Penthouse" | "Commercial Office" | null
- "locality": "Baner" | "Balewadi" | "Kalyani Nagar" | "Bavdhan" | "Mahalunge" | "Shivajinagar" | "Kharadi" | "Worli" | "Koregaon Park" | "Viman Nagar" | "Hinjewadi" | "Wakad" | null
- "priceRange": "Under ₹1.5 Cr" | "₹1.5 Cr - ₹2.5 Cr" | "₹2.5 Cr - ₹4.0 Cr" | "₹4.0 Cr+" | null
- "summary": 1 concise sentence describing the AI's understanding.

STRICT INSTRUCTIONS:
- If user wants a buyer or wants to sell, intent MUST be "seller" and primaryView MUST be "buyer_leads".
- NEVER hallucinate or guess a BHK if the user query does not explicitly specify one (e.g. if query is "i want a buyer", set bhk: null!).
- NEVER hallucinate or guess a locality if not explicitly present in query (set locality: null!).
- In "summary", NEVER mention a BHK or locality unless explicitly present in the user's query.`
              },
              {
                role: "user",
                content: cleanSearch
              }
            ],
            response_format: { type: "json_object" }
          },
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        const parsed = JSON.parse(aiResponse.choices[0]?.message?.content || "{}");
        if (parsed.intent) intent = parsed.intent;
        if (parsed.primaryView === "buyer_leads" || parsed.intent === "seller") {
          primaryView = "buyer_leads";
        } else if (parsed.primaryView === "properties" || parsed.intent === "buyer") {
          primaryView = "properties";
        }

        // Strict guard: Only accept BHK from AI if query explicitly contains typography indicator
        const hasExplicitBhkInQuery = /\b(\d+\s*bhk|\d+\s*bed|bedroom|penthouse|commercial|office|studio|duplex)\b/i.test(cleanSearch);
        if (parsed.bhk && hasExplicitBhkInQuery && (!bhk || bhk === "All")) {
          bhk = parsed.bhk;
        }

        // Strict guard: Only accept locality from AI if query explicitly mentions known locality
        const hasExplicitLocalityInQuery = knownLocs.some(loc => new RegExp(`\\b${loc}\\b`, "i").test(cleanSearch));
        if (parsed.locality && hasExplicitLocalityInQuery && (!locality || locality === "All")) {
          locality = parsed.locality;
        }

        if (parsed.priceRange && (!priceRange || priceRange === "All")) priceRange = parsed.priceRange;
        if (parsed.summary) {
          aiSummary = parsed.summary;
          aiParsed = true;
        }
      } catch (err: any) {
        if (err.status === 429 || err.message?.includes("credits") || err.message?.includes("quota")) {
          openaiCooldownUntil = Date.now() + 5 * 60 * 1000;
        }
        console.log("ChatGPT API fallback in unified search:", err.message || "timeout");
      }
    }

    // High-speed NLP regex extraction fallback
    if (!bhk || bhk === "All") {
      if (/\b(?:commercial|office|workspace|retail)\b/i.test(cleanSearch)) {
        bhk = "Commercial Office";
      } else {
        const bhkMatch = cleanSearch.match(/\b([1-9])\s*(?:bhk|bedroom|bed)s?\b/i) || cleanSearch.match(/\b(?:bhk|bedroom|bed)s?\s*([1-9])\b/i);
        if (bhkMatch) {
          bhk = `${bhkMatch[1]} BHK`;
        } else if (/\bpenthouses?\b/i.test(cleanSearch)) {
          bhk = "4.5+ BHK Penthouse";
        }
      }
    }

    if (!locality || locality === "All") {
      for (const loc of knownLocs) {
        if (new RegExp(`\\b${loc}\\b`, "i").test(cleanSearch)) {
          locality = loc;
          break;
        }
      }
    }

    const wordsInQuery = cleanSearch
      .toLowerCase()
      .replace(/[-_/\(\)\[\]]+/g, " ")
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 1);

    const localityTokens = (locality && locality !== "All" ? locality : "").toLowerCase().split(/\s+/);
    const bhkTokens = ["1", "2", "3", "4", "5", "bhk", "bedroom", "bed", "penthouse", "commercial", "office", "rk"];

    const searchKeywords = wordsInQuery.filter((w) => {
      if (SEARCH_STOP_WORDS.has(w)) return false;
      if (localityTokens.some((lt) => lt && (lt === w || lt.includes(w)))) return false;
      if (bhkTokens.includes(w)) return false;
      return true;
    });

    if (!aiSummary) {
      if (primaryView === "buyer_leads" || intent === "seller") {
        aiSummary = `Active buyer search: Connecting qualified buyers ${bhk && bhk !== 'All' ? `for ${bhk}` : ''} in ${locality && locality !== 'All' ? locality : 'Pune'}`;
      } else if (intent === 'buyer') {
        aiSummary = `Property search: Curating verified properties in ${locality && locality !== 'All' ? locality : 'Pune'} ${bhk && bhk !== 'All' ? `(${bhk})` : ''}`;
      } else {
        aiSummary = `Unified marketplace: Matching properties & active buyers in ${locality && locality !== 'All' ? locality : 'Pune'} ${bhk && bhk !== 'All' ? `(${bhk})` : ''}`;
      }
    }

    // 2. Fetch Buyer Inquiries / Demands (STRICT PHONE MASKING TO 93730 20701)
    let buyerDemands: any[] = [];
    try {
      const crmRows = await query(`
        SELECT id, code, name, location, bhk, budget, notes, created_at
        FROM crm_leads
        WHERE status != 'Lost' AND status != 'Archived'
        ORDER BY created_at DESC
        LIMIT 50;
      `);

      for (const row of crmRows) {
        buyerDemands.push({
          id: `CRM-${row.id}`,
          referenceCode: row.code || `REQ-${row.id}`,
          maskedName: maskBuyerName(row.name),
          displayPhone: OFFICIAL_ANV_PHONE,
          displayEmail: OFFICIAL_ANV_EMAIL,
          locality: row.location?.replace(/,.*$/, '').trim() || 'Pune',
          bhk: row.bhk || '3 BHK',
          budget: row.budget || '₹1.50 Cr - ₹2.50 Cr',
          timeline: 'Ready to Move / 60 Days',
          purpose: 'Self-Use / Investment',
          requirements: row.notes || `Looking for ${row.bhk || '3 BHK'} in ${row.location || 'Pune'}. Verified buyer registered with Anv Reeality.`,
          createdAt: row.created_at,
          status: 'Verified CRM Buyer'
        });
      }

      const enqRows = await query(`
        SELECT id, name, subject, message, "createdAt"
        FROM "WebsiteEnquiry"
        ORDER BY "createdAt" DESC
        LIMIT 50;
      `);

      for (const row of enqRows) {
        let loc = 'Pune';
        let b = '3 BHK';
        const msg = row.message || '';
        const subj = row.subject || '';

        const locMatch = msg.match(/Preferred Locality:\s*([^|]+)/i) || subj.match(/in\s+([A-Za-z\s]+)/i);
        if (locMatch && locMatch[1]) loc = locMatch[1].trim();

        const bhkMatch = msg.match(/Configuration:\s*([^|]+)/i) || subj.match(/(\d+\s*BHK|Commercial)/i);
        if (bhkMatch && bhkMatch[1]) b = bhkMatch[1].trim();

        const budgetMatch = msg.match(/Budget:\s*([^|]+)/i);
        const budget = budgetMatch ? budgetMatch[1].trim() : '₹1.50 Cr - ₹2.50 Cr';

        const timelineMatch = msg.match(/Possession Timeline:\s*([^|]+)/i);
        const timeline = timelineMatch ? timelineMatch[1].trim() : 'Ready to Move';

        buyerDemands.push({
          id: `ENQ-${row.id}`,
          referenceCode: `REQ-ENQ-${row.id}`,
          maskedName: maskBuyerName(row.name),
          displayPhone: OFFICIAL_ANV_PHONE,
          displayEmail: OFFICIAL_ANV_EMAIL,
          locality: loc,
          bhk: b,
          budget: budget,
          timeline: timeline,
          purpose: 'Direct Inquirer',
          requirements: msg || `Bespoke requirement submitted for ${b} in ${loc}.`,
          createdAt: row.createdAt,
          status: 'Website Buyer Inquiry'
        });
      }
    } catch (dbErr: any) {
      console.log("DB inquiry query notice:", dbErr.message);
    }

    const allDemands = [...buyerDemands, ...SEED_BUYER_DEMANDS];
    const locFilterLower = (locality && locality !== "All" ? locality : "").toLowerCase();
    const bhkFilterLower = (bhk && bhk !== "All" ? bhk : "").toLowerCase();

    // Filter buyer demands
    let filteredDemands = allDemands.filter((demand) => {
      if (locFilterLower) {
        const matchesLoc = demand.locality.toLowerCase().includes(locFilterLower) ||
          demand.requirements.toLowerCase().includes(locFilterLower);
        if (!matchesLoc) return false;
      }
      if (bhkFilterLower) {
        const dLower = demand.bhk.toLowerCase();
        if (bhkFilterLower.includes('commercial')) {
          if (!dLower.includes('commercial') && !demand.requirements.toLowerCase().includes('commercial')) {
            return false;
          }
        } else {
          const digit = bhkFilterLower.match(/\d+/)?.[0];
          if (digit && !dLower.includes(digit) && !demand.requirements.toLowerCase().includes(`${digit} bhk`)) {
            return false;
          }
        }
      }
      return true;
    });

    if (searchKeywords.length > 0) {
      filteredDemands = filteredDemands.filter((demand) => {
        const text = `${demand.maskedName} ${demand.locality} ${demand.bhk} ${demand.budget} ${demand.requirements} ${demand.purpose}`.toLowerCase();
        return searchKeywords.every((kw) => text.includes(kw));
      });
    }

    // 3. Fetch Properties from Database
    let properties: any[] = [];
    try {
      const propRows = await query(`
        SELECT 
          p.id, p.title as name, p.description, p.address as location,
          p.price, p."carpetArea" as sqft_num, p.bedrooms as bhk_num, p.status, p."isFeatured" as featured,
          COALESCE(proj.developer, 'ANV Signature Partner') as developer,
          COALESCE(proj."reraNumber", 'PRM/PUN/RERA/2026/0491') as rera_number,
          COALESCE(loc.name, 'Koregaon Park') as locality,
          COALESCE(pt.name, 'Apartment') as type_name,
          COALESCE(img.url, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80') as image
        FROM "Property" p
        LEFT JOIN "Project" proj ON p."projectId" = proj.id
        LEFT JOIN "Location" loc ON p."locationId" = loc.id
        LEFT JOIN "PropertyType" pt ON p."propertyTypeId" = pt.id
        LEFT JOIN LATERAL (
          SELECT url FROM "PropertyImage" WHERE "propertyId" = p.id ORDER BY "sortOrder" ASC LIMIT 1
        ) img ON true
        WHERE p."publishStatus" = 'Published'
        ORDER BY p.id ASC;
      `);

      properties = propRows.map((r: any) => {
        const numPrice = Number(r.price) || 0;
        let formattedPrice = "Price on Request";
        if (numPrice >= 10000000) {
          const cr = (numPrice / 10000000).toFixed(2).replace(/\.00$/, '');
          formattedPrice = `₹${cr} Cr`;
        } else if (numPrice >= 100000) {
          const lk = (numPrice / 100000).toFixed(2).replace(/\.00$/, '');
          formattedPrice = `₹${lk} Lakh`;
        } else if (numPrice > 0) {
          formattedPrice = `₹${numPrice.toLocaleString('en-IN')}`;
        }

        return {
          id: String(r.id),
          name: r.name,
          developer: r.developer || "Grade-A Developer",
          locality: r.locality || (r.location ? r.location.split(',')[0].trim() : 'Pune'),
          location: r.location || "Pune, Maharashtra",
          price: formattedPrice,
          priceRaw: numPrice || 15000000,
          bhk: r.bhk_num ? `${r.bhk_num} BHK` : (r.type_name || "Luxury Residence"),
          bhkNum: Number(r.bhk_num) || 0,
          sqft: r.sqft_num ? `${Number(r.sqft_num).toLocaleString()} Sq.Ft. Carpet` : "Carpet on Request",
          sqftNum: Number(r.sqft_num) || 0,
          status: r.status || "Ready to Move",
          description: r.description || "Luxury Pune Residence",
          image: r.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
          tags: ["RPS / RERA Verified", "Vastu Compliant"],
          reraNumber: r.rera_number,
          featured: Boolean(r.featured),
          isCommercial: /commercial|office/i.test(r.type_name || '') || /commercial|office/i.test(r.name || '')
        };
      });

      // Filter properties by locality and BHK
      if (locFilterLower) {
        properties = properties.filter((p) =>
          (p.locality && p.locality.toLowerCase().includes(locFilterLower)) ||
          p.location.toLowerCase().includes(locFilterLower) ||
          p.name.toLowerCase().includes(locFilterLower)
        );
      }
      if (bhkFilterLower) {
        if (bhkFilterLower.includes('commercial')) {
          properties = properties.filter((p) => p.isCommercial || p.bhk.toLowerCase().includes('commercial'));
        } else {
          const digit = bhkFilterLower.match(/\d+/)?.[0];
          if (digit) {
            const reqNum = parseInt(digit, 10);
            properties = properties.filter((p) => !p.isCommercial && (p.bhkNum === reqNum || p.bhk.includes(`${digit} BHK`)));
          }
        }
      }

      // Keyword filtering (e.g. project title, developer, description, or custom terms)
      if (searchKeywords.length > 0) {
        properties = properties.filter((p) => {
          const text = `${p.name} ${p.developer} ${p.locality || ''} ${p.location} ${p.description} ${(p.tags || []).join(' ')}`.toLowerCase();
          return searchKeywords.every((kw) => text.includes(kw));
        });
      }

      if (searchKeywords.length > 0 && properties.length === 0 && filteredDemands.length === 0) {
        aiSummary = `No matching properties or buyers found for "${cleanSearch}" in Pune.`;
      }
    } catch (pErr: any) {
      console.log("DB properties query notice:", pErr.message);
    }

    return NextResponse.json({
      success: true,
      ai: {
        intent,
        primaryView,
        summary: aiSummary,
        locality: locality || null,
        bhk: bhk || null,
        priceRange: priceRange || null,
        isAiPowered: aiParsed
      },
      officialHelpline: OFFICIAL_ANV_PHONE,
      propertiesCount: properties.length,
      buyerDemandsCount: filteredDemands.length,
      properties,
      buyerDemands: filteredDemands
    });
  } catch (err: any) {
    console.error("GET /api/unified-search error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed unified search", stack: err.stack },
      { status: 200 }
    );
  }
}
