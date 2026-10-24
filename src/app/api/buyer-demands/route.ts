import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export const dynamic = 'force-dynamic';

// Official Anv Reealty Public Helpline for all Seller connections
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

import { getAllLiveBuyerDemands } from "@/lib/buyer-demands-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();
    const localityFilter = (searchParams.get("locality") || "").trim().toLowerCase();
    const bhkFilter = (searchParams.get("bhk") || "").trim().toLowerCase();
    const budgetFilter = (searchParams.get("budget") || "").trim().toLowerCase();

    // Fetch live buyer requirements from DB and verified patron network
    const allDemands = await getAllLiveBuyerDemands();

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
        const STOP_WORDS = new Set([
          "i", "want", "a", "an", "the", "for", "my", "me", "property", "properties",
          "buyer", "buyers", "sell", "selling", "need", "find", "looking", "require",
          "seeking", "please", "to", "in", "at", "with", "and", "or", "is"
        ]);
        const words = searchQuery.split(/\s+/).filter((w) => !STOP_WORDS.has(w));

        if (words.length > 0) {
          const fullText = `${demand.locality} ${demand.bhk} ${demand.budget} ${demand.requirements} ${demand.referenceCode}`.toLowerCase();
          
          // If query mentions commercial
          if (searchQuery.includes('commercial') && !fullText.includes('commercial')) {
            return false;
          }

          // Must match meaningful keywords
          const matches = words.every((w) => fullText.includes(w));
          if (!matches) return false;
        }
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
          'New', 'new', 'hot', 'Unassigned', $10, NOW(), NOW()
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
