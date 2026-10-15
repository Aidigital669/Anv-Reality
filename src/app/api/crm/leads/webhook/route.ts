import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { calculateLeadScore } from "@/lib/crm-algorithm";

// CORS headers to permit both server-to-server and client-side browser submissions from any external domain
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, X-Requested-With",
};

// Handle Preflight CORS check
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Health check / Documentation ping
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      service: "AnvReality CRM Inbound Webhook Pipeline",
      status: "operational",
      version: "2.0",
      description: "Send POST requests with lead data from opus1profile.com or any external website to pipe leads directly into AnvReality CRM.",
      expectedPayload: {
        name: "Full Name (string, required)",
        phone: "Contact Number (string, required)",
        email: "Email Address (string, optional)",
        project: "Project or Property Interest (string, optional, e.g. 'Opus 1 Profile')",
        budget: "Budget Range (string, optional, e.g. '₹1.5 - 2.5 Cr')",
        bhk: "Configuration / Space Type (string, optional, e.g. 'Commercial Office' or '3 BHK')",
        location: "City / Locality (string, optional, e.g. 'Baner, Pune')",
        message: "Customer message or requirement (string, optional)",
        source: "Source website identifier (string, e.g. 'opus1profile.com')",
        utm_source: "Optional tracking parameter",
        utm_medium: "Optional tracking parameter",
        utm_campaign: "Optional tracking parameter",
      },
    },
    { headers: corsHeaders }
  );
}

// Main Lead Ingestion Pipeline
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1. Authenticate Request
    const configuredSecret = process.env.CRM_WEBHOOK_API_KEY;
    if (configuredSecret) {
      const headerKey = req.headers.get("x-api-key");
      const authHeader = req.headers.get("authorization");
      const bearerKey = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
      const queryKey = req.nextUrl.searchParams.get("api_key") || req.nextUrl.searchParams.get("apiKey");
      const bodyKey = body?.apiKey || body?.api_key;

      const clientKey = headerKey || bearerKey || queryKey || bodyKey;
      if (clientKey !== configuredSecret) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized: Invalid or missing x-api-key header / Bearer token.",
          },
          { status: 401, headers: corsHeaders }
        );
      }
    }

    // 2. Intelligent Field Normalization (handles varied naming conventions from different landing pages)
    const name = (
      body.name ||
      body.fullName ||
      body.full_name ||
      body.customerName ||
      body.clientName ||
      `${body.firstName || ""} ${body.lastName || ""}`.trim() ||
      "Website Visitor"
    ).trim();

    const rawPhone =
      body.phone ||
      body.mobile ||
      body.phoneNumber ||
      body.phone_number ||
      body.contact ||
      body.tel ||
      body.whatsapp;

    const phone = rawPhone ? String(rawPhone).trim() : null;
    const email = (body.email || body.emailAddress || body.email_address || body.mail || "").trim() || null;

    if (!phone && !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Either phone or email is required to capture a lead into CRM.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const propertyInterest = (
      body.propertyInterest ||
      body.projectName ||
      body.project ||
      body.property ||
      body.interest ||
      body.subject ||
      "Opus 1 Profile"
    ).trim();

    const bhk = (
      body.bhk ||
      body.configuration ||
      body.unitType ||
      body.spaceType ||
      body.officeSize ||
      "Commercial / Office Space"
    ).trim();

    const budget = (body.budget || body.price || body.priceRange || "On Request").trim();
    let budgetRaw = 15000000;
    if (body.budgetRaw) {
      budgetRaw = parseFloat(body.budgetRaw) || 15000000;
    } else if (typeof budget === "string") {
      const numMatch = budget.match(/(\d+(\.\d+)?)/);
      if (numMatch) {
        const val = parseFloat(numMatch[1]);
        if (budget.toLowerCase().includes("cr")) budgetRaw = val * 10000000;
        else if (budget.toLowerCase().includes("l")) budgetRaw = val * 100000;
      }
    }

    const location = (body.location || body.city || body.locality || "Pune, Maharashtra").trim();
    const source = (body.source || body.website || body.origin || "opus1profile.com").trim();
    const message = body.message || body.notes || body.query || body.comments || body.requirementNotes || "";

    // Compile marketing & UTM telemetry
    const telemetryItems = [
      body.utm_source ? `UTM Source: ${body.utm_source}` : null,
      body.utm_medium ? `UTM Medium: ${body.utm_medium}` : null,
      body.utm_campaign ? `UTM Campaign: ${body.utm_campaign}` : null,
      body.utm_term ? `UTM Term: ${body.utm_term}` : null,
      body.utm_content ? `UTM Content: ${body.utm_content}` : null,
      body.pageUrl ? `Landing Page: ${body.pageUrl}` : null,
      body.referrer ? `Referrer: ${body.referrer}` : null,
    ].filter(Boolean);

    const trackingSummary = telemetryItems.length > 0 ? telemetryItems.join(" | ") : "";
    const timestampStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const newEnquiryNote = [
      `[Inbound Webhook from ${source} on ${timestampStr} IST]`,
      propertyInterest ? `Project Interest: ${propertyInterest}` : null,
      bhk ? `Configuration: ${bhk}` : null,
      budget ? `Budget: ${budget}` : null,
      message ? `Remarks: ${message}` : null,
      trackingSummary ? `Marketing Attribution: ${trackingSummary}` : null,
    ].filter(Boolean).join("\n");

    // 3. Deduplication: Check if lead with this phone already exists in CRM
    let existingLead: any = null;
    if (phone) {
      try {
        existingLead = await queryOne(
          `SELECT id, code, name, phone, notes, stage, property_interest FROM crm_leads WHERE phone = $1 LIMIT 1`,
          [phone]
        );
      } catch (err: any) {
        console.error("Error checking existing lead:", err.message);
      }
    }

    let resultLead: any = null;

    if (existingLead) {
      // Append requirement note & refresh lead priority to hot
      const updatedNotes = existingLead.notes
        ? `${existingLead.notes}\n\n---\n${newEnquiryNote}`
        : newEnquiryNote;

      const updated = await queryOne(
        `
        UPDATE crm_leads
        SET 
          notes = $1,
          property_interest = COALESCE($2, property_interest),
          temperature = 'hot',
          updated_at = NOW()
        WHERE id = $3
        RETURNING id, code, name, phone, email, stage, temperature, source, updated_at AS "updatedAt";
        `,
        [updatedNotes, propertyInterest, existingLead.id]
      );

      resultLead = updated || existingLead;
      resultLead.isExisting = true;
    } else {
      // 4. Generate New Lead Code
      const code = `LD-${Math.floor(1000 + Math.random() * 9000)}`;

      // Initial Lead DNA for algorithmic qualification
      const leadDna = JSON.stringify({
        configuration: bhk,
        targetBudget: budget,
        preferredLocations: location,
        purchasePurpose: "Commercial / Investment",
        sourceWebsite: source,
        attribution: trackingSummary || null,
      });

      const inserted = await queryOne(
        `
        INSERT INTO crm_leads (
          code, name, phone, email, designation, company, residence, is_nri, nri_tag,
          location, property_interest, bhk, carpet_sqft, budget, budget_raw,
          source, source_type, status, stage, temperature, assigned_to, notes, dna,
          created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15,
          $16, 'website', 'New Lead', 'new', 'hot', 'Unassigned', $17, $18,
          NOW(), NOW()
        )
        RETURNING 
          id, code, name, phone, email, designation,
          location, property_interest AS "propertyInterest",
          bhk, budget, status, stage, temperature,
          assigned_to AS "assignedTo", notes, created_at AS "createdAt";
        `,
        [
          code,
          name,
          phone || "N/A",
          email,
          "Website Prospect",
          null,
          location,
          false,
          null,
          location,
          propertyInterest,
          bhk,
          "Flexible",
          budget,
          budgetRaw,
          source,
          newEnquiryNote,
          leadDna,
        ]
      );

      resultLead = inserted || { code, name, phone, email, propertyInterest };
      resultLead.isExisting = false;
    }

    // 5. Also bridge to WebsiteEnquiry table for unified administration view
    try {
      const enquirySubject = `Lead from ${source}: ${propertyInterest}`;
      await queryOne(
        `
        INSERT INTO "WebsiteEnquiry" (
          name, email, phone, subject, message, source, status, "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'New', NOW(), NOW())
        RETURNING id;
        `,
        [
          name,
          email,
          phone || "",
          enquirySubject,
          newEnquiryNote,
          source,
        ]
      );
    } catch (enqErr: any) {
      console.warn("Notice: WebsiteEnquiry mirror insert bypassed:", enqErr.message);
    }

    // Calculate lead score for immediate response feedback
    const scoreInfo = calculateLeadScore({
      budgetRaw: budgetRaw,
      budget: budget,
      isNri: false,
      stage: "new",
      lastContactHoursAgo: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: resultLead.isExisting
          ? `Lead ${resultLead.code} recognized. Record updated and marked Hot in AnvReality CRM!`
          : `Lead ${resultLead.code} successfully created and dispatched to AnvReality CRM!`,
        lead: {
          id: resultLead.id,
          code: resultLead.code,
          name: resultLead.name,
          phone: resultLead.phone,
          email: resultLead.email,
          propertyInterest: resultLead.propertyInterest || propertyInterest,
          source: source,
          stage: "new",
          temperature: "hot",
          leadScore: scoreInfo.score,
          scoreTier: scoreInfo.tier,
          assignedTo: "Unassigned",
        },
      },
      { status: resultLead.isExisting ? 200 : 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("POST /api/crm/leads/webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error occurred while processing lead.",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
