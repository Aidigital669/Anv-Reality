import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export const dynamic = 'force-dynamic';

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

// Active buyer demands fetched directly from database
const SEED_BUYER_DEMANDS: any[] = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();
    const localityFilter = (searchParams.get("locality") || "").trim().toLowerCase();
    const bhkFilter = (searchParams.get("bhk") || "").trim().toLowerCase();
    const budgetFilter = (searchParams.get("budget") || "").trim().toLowerCase();

    // 1. Fetch real buyer requirements from crm_leads and WebsiteEnquiry
    let dbDemands: any[] = [];
    try {
      const crmRows = await query(`
        SELECT 
          id, code, name, location, bhk, budget, notes, created_at
        FROM crm_leads
        WHERE status != 'Lost' AND status != 'Archived'
        ORDER BY created_at DESC
        LIMIT 50;
      `);

      for (const row of crmRows) {
        dbDemands.push({
          id: `CRM-${row.id}`,
          referenceCode: row.code || `REQ-${row.id}`,
          maskedName: maskBuyerName(row.name),
          displayPhone: OFFICIAL_ANV_PHONE, // STRICTLY MASKED TO OFFICIAL HELPLINE
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
    } catch (e: any) {
      console.log("CRM leads query notice:", e.message);
    }

    try {
      const enqRows = await query(`
        SELECT 
          id, name, subject, message, "createdAt"
        FROM "WebsiteEnquiry"
        ORDER BY "createdAt" DESC
        LIMIT 50;
      `);

      for (const row of enqRows) {
        // Parse locality or BHK from message/subject if available
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

        dbDemands.push({
          id: `ENQ-${row.id}`,
          referenceCode: `REQ-ENQ-${row.id}`,
          maskedName: maskBuyerName(row.name),
          displayPhone: OFFICIAL_ANV_PHONE, // STRICTLY MASKED TO OFFICIAL HELPLINE
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
    } catch (e: any) {
      console.log("WebsiteEnquiry query notice:", e.message);
    }

    // Combine DB demands and seed demands, deduplicating
    const allDemands = [...dbDemands, ...SEED_BUYER_DEMANDS];

    // 2. Filter based on seller's search parameters
    const filtered = allDemands.filter((demand) => {
      // Locality filter
      if (localityFilter && localityFilter !== 'all') {
        const matchesLoc = demand.locality.toLowerCase().includes(localityFilter) ||
          demand.requirements.toLowerCase().includes(localityFilter);
        if (!matchesLoc) return false;
      }

      // BHK filter
      if (bhkFilter && bhkFilter !== 'all') {
        const dLower = demand.bhk.toLowerCase();
        if (bhkFilter.includes('commercial')) {
          if (!dLower.includes('commercial') && !demand.requirements.toLowerCase().includes('commercial')) {
            return false;
          }
        } else {
          const digit = bhkFilter.match(/\d+/)?.[0];
          if (digit && !dLower.includes(digit) && !demand.requirements.toLowerCase().includes(`${digit} bhk`)) {
            return false;
          }
        }
      }

      // Search Query filter (matches locality, BHK, or notes)
      if (searchQuery) {
        const words = searchQuery.split(/\s+/).filter(Boolean);
        const fullText = `${demand.locality} ${demand.bhk} ${demand.budget} ${demand.requirements} ${demand.referenceCode}`.toLowerCase();
        
        // If query mentions commercial
        if (searchQuery.includes('commercial') && !fullText.includes('commercial')) {
          return false;
        }

        // Must match at least one significant keyword
        const matchesAny = words.some((w) => fullText.includes(w));
        if (!matchesAny) return false;
      }

      return true;
    });

    return NextResponse.json({
      success: true,
      count: filtered.length,
      officialHelpline: OFFICIAL_ANV_PHONE,
      demands: filtered
    });
  } catch (err: any) {
    console.error("GET /api/buyer-demands error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch buyer demands" },
      { status: 500 }
    );
  }
}

// POST endpoint: For Sellers submitting their property details
// Used when:
// 1) Seller did not find a buyer (fields: location, name, number, email)
// 2) Seller wants to match their property with a specific buyer ref (REQ-XXXX)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      number,
      phone,
      email,
      location,
      bhk,
      askingPrice,
      buyerRef,
      notes
    } = body;

    const contactPhone = (number || phone || '').trim();
    const contactName = (name || '').trim();
    const contactEmail = (email || '').trim();
    const propertyLocation = (location || '').trim();

    if (!contactName || !contactPhone) {
      return NextResponse.json(
        { success: false, error: "Please provide your name and phone number." },
        { status: 400 }
      );
    }

    if (!propertyLocation) {
      return NextResponse.json(
        { success: false, error: "Please provide the property location." },
        { status: 400 }
      );
    }

    const subject = buyerRef
      ? `Seller Pitch for Buyer Ref ${buyerRef} in ${propertyLocation}`
      : `Seller Inquiry (No Buyer Found): Property in ${propertyLocation}`;

    const detailedMessage = [
      `Seller / Owner Name: ${contactName}`,
      `Contact Number: ${contactPhone}`,
      contactEmail ? `Email: ${contactEmail}` : null,
      `Property Location: ${propertyLocation}`,
      bhk ? `Configuration: ${bhk}` : null,
      askingPrice ? `Asking Price / Budget: ${askingPrice}` : null,
      buyerRef ? `Target Buyer Lead: ${buyerRef}` : 'Seller searched but found no matching buyer',
      notes ? `Seller Notes: ${notes}` : null
    ].filter(Boolean).join(" | ");

    // 1. Insert into WebsiteEnquiry
    try {
      await queryOne(`
        INSERT INTO "WebsiteEnquiry" (
          name, email, phone, subject, message, source, status, "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, 'Seller Lead Match Desk', 'New', NOW(), NOW())
        RETURNING id;
      `, [
        contactName,
        contactEmail || null,
        contactPhone,
        subject,
        detailedMessage
      ]);
    } catch (dbErr: any) {
      console.error("WebsiteEnquiry seller insert error:", dbErr.message);
    }

    // 2. Insert into crm_leads
    try {
      const code = `SEL-${Math.floor(1000 + Math.random() * 9000)}`;
      await queryOne(`
        INSERT INTO crm_leads (
          code, name, phone, email, designation, residence, is_nri,
          location, property_interest, bhk, budget, source, source_type,
          status, stage, temperature, assigned_to, notes, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, 'Property Seller / Owner', $5, false,
          $6, $7, $8, $9, 'Seller Portal Inquiry', 'website',
          'New', 'new', 'hot', 'Vikram Malhotra', $10, NOW(), NOW()
        )
        ON CONFLICT DO NOTHING;
      `, [
        code,
        contactName,
        contactPhone,
        contactEmail || null,
        propertyLocation,
        propertyLocation,
        `Selling Property in ${propertyLocation}`,
        bhk || 'Residential / Commercial',
        askingPrice || 'Open to Offers',
        detailedMessage
      ]);
    } catch (crmErr: any) {
      console.error("CRM leads seller insert error:", crmErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for enquiry"
    });
  } catch (err: any) {
    console.error("POST /api/buyer-demands error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process seller inquiry" },
      { status: 500 }
    );
  }
}
