import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export const dynamic = 'force-dynamic';

function normalizePhone(p: string | null | undefined): string {
  if (!p) return "";
  return p.replace(/\D/g, "").slice(-10);
}

function extractDetail(text: string | null | undefined, label: string): string | null {
  if (!text) return null;
  const regex = new RegExp(`${label}:\\s*([^|\\n]+)`, "i");
  const match = text.match(regex);
  return match && match[1] ? match[1].trim() : null;
}

function detectCategory(source: string = "", subject: string = "", message: string = "", designation: string = ""): {
  category: 'site_visit' | 'bespoke' | 'seller_lead' | 'property_enquiry' | 'crm_lead' | 'general_inquiry';
  label: string;
} {
  const s = (source || "").toLowerCase();
  const subj = (subject || "").toLowerCase();
  const msg = (message || "").toLowerCase();
  const des = (designation || "").toLowerCase();

  // 1. Site Visit Requests
  if (
    s.includes("property detail") ||
    s.includes("site visit") ||
    s.includes("viewing pass") ||
    s.includes("instant enquiry") ||
    msg.includes("site visit request") ||
    msg.includes("scheduled site visit") ||
    subj.includes("site visit")
  ) {
    return { category: 'site_visit', label: 'Private Site Visit Request' };
  }

  // 2. Seller Property Submissions
  if (
    s.includes("seller") ||
    des.includes("seller") ||
    des.includes("owner") ||
    subj.includes("selling property") ||
    msg.includes("selling property")
  ) {
    return { category: 'seller_lead', label: 'Seller Property Offer' };
  }

  // 3. Bespoke Buying Requirements / Demands
  if (
    s.includes("bespoke") ||
    subj.includes("bespoke") ||
    msg.includes("configuration:") ||
    msg.includes("preferred locality:") ||
    msg.includes("vastu preference:")
  ) {
    return { category: 'bespoke', label: 'Bespoke Property Requirement' };
  }

  // 4. Specific Property Enquiries
  if (
    subj.includes("enquiry for") ||
    subj.includes("property:") ||
    msg.includes("direct page inquiry")
  ) {
    return { category: 'property_enquiry', label: 'Property Enquiry' };
  }

  // 5. CRM Leads
  if (s.includes("crm") || s.includes("walk_in") || s.includes("direct intake") || s.includes("phone")) {
    return { category: 'crm_lead', label: 'CRM Client Lead' };
  }

  return { category: 'general_inquiry', label: 'Public Consultation' };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get("type"); // all | site_visit | bespoke | seller_lead | property_enquiry | crm_lead
    const filterStatus = searchParams.get("status");
    const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();

    // 1. Fetch WebsiteEnquiry rows
    let webEnquiries: any[] = [];
    try {
      webEnquiries = await query(`
        SELECT 
          id, name, phone, email, subject, message, source, status,
          "assignedTo", notes, "propertyId", "projectId", "createdAt", "updatedAt"
        FROM "WebsiteEnquiry"
        ORDER BY "createdAt" DESC;
      `);
    } catch (e: any) {
      console.warn("WebsiteEnquiry fetch warning:", e.message);
    }

    // 2. Fetch crm_leads rows
    let crmLeads: any[] = [];
    try {
      crmLeads = await query(`
        SELECT 
          id, code, name, phone, email, designation, company, residence,
          location, property_interest AS "propertyInterest", bhk, budget,
          source, source_type AS "sourceType", status, stage, temperature,
          assigned_to AS "assignedTo", notes, created_at AS "createdAt", updated_at AS "updatedAt"
        FROM crm_leads
        ORDER BY created_at DESC;
      `);
    } catch (e: any) {
      console.warn("crm_leads fetch warning:", e.message);
    }

    // 3. Fetch crm_site_visits rows
    let siteVisits: any[] = [];
    try {
      siteVisits = await query(`
        SELECT 
          id, lead_name AS "leadName", lead_phone AS "leadPhone",
          project_name AS "projectName", visit_date AS "visitDate",
          visit_time AS "visitTime", status, assigned_agent AS "assignedAgent",
          cab_model AS "cabModel", cab_plate AS "cabPlate",
          driver_name AS "driverName", driver_phone AS "driverPhone",
          feedback, created_at AS "createdAt"
        FROM crm_site_visits
        ORDER BY created_at DESC;
      `);
    } catch (e: any) {
      console.warn("crm_site_visits fetch warning:", e.message);
    }

    // Map site visits by phone for enrichment
    const visitMap = new Map<string, any>();
    for (const v of siteVisits) {
      const p = normalizePhone(v.leadPhone);
      if (p && !visitMap.has(p)) {
        visitMap.set(p, v);
      }
    }

    // Map CRM leads by phone for merging with WebsiteEnquiry
    const matchedLeadIds = new Set<number>();
    const unified: any[] = [];

    // Process WebsiteEnquiry items
    for (const enq of webEnquiries) {
      const normPhone = normalizePhone(enq.phone);
      // Find matching CRM lead if bridged
      const matchLead = crmLeads.find(l => normalizePhone(l.phone) === normPhone);
      if (matchLead) {
        matchedLeadIds.add(matchLead.id);
      }

      const matchVisit = normPhone ? visitMap.get(normPhone) : null;

      const fullMessage = enq.message || matchLead?.notes || "";
      const locality = extractDetail(fullMessage, "Preferred Locality") || matchLead?.location || null;
      const bhk = extractDetail(fullMessage, "Configuration") || matchLead?.bhk || null;
      const budget = extractDetail(fullMessage, "Budget") || matchLead?.budget || null;
      const timeline = extractDetail(fullMessage, "Possession Timeline") || null;
      const purpose = extractDetail(fullMessage, "Purpose of Buying") || null;
      const vastu = extractDetail(fullMessage, "Vastu Preference") || null;
      const parking = extractDetail(fullMessage, "Parking / Amenities") || null;
      const remarks = extractDetail(fullMessage, "Special Remarks") || null;
      const timeSlot = extractDetail(fullMessage, "Best Time to Contact") || 
                       (remarks && remarks.includes("Scheduled site visit request:") 
                         ? remarks.replace(/Scheduled site visit request:\s*/i, '').replace(/\.\s*Direct.*$/i, '').trim() 
                         : null) ||
                       (matchVisit ? `${matchVisit.visitDate} (${matchVisit.visitTime})` : null);

      const detection = detectCategory(
        enq.source || matchLead?.source,
        enq.subject || matchLead?.propertyInterest,
        fullMessage,
        matchLead?.designation
      );

      const refCode = matchLead?.code || `REQ-${1000 + enq.id}`;

      unified.push({
        id: enq.id,
        uid: `ENQ-${enq.id}`,
        dbSource: 'WebsiteEnquiry',
        crmLeadId: matchLead ? matchLead.id : null,
        referenceCode: refCode,
        name: enq.name || matchLead?.name || "Client",
        phone: enq.phone || matchLead?.phone || "",
        email: enq.email || matchLead?.email || "",
        designation: matchLead?.designation || (detection.category === 'seller_lead' ? 'Property Owner / Seller' : 'Prospective Buyer'),
        category: detection.category,
        categoryLabel: detection.label,
        subject: enq.subject || matchLead?.propertyInterest || "Luxury Property Inquiry",
        propertyInterest: matchLead?.propertyInterest || enq.subject || "Luxury Residence",
        propertyId: enq.propertyId || null,
        locality,
        bhk,
        budget,
        timeline,
        purpose,
        vastu,
        parking,
        timingSlot: timeSlot,
        message: fullMessage,
        rawNotes: enq.notes || matchLead?.notes || null,
        source: enq.source || matchLead?.source || "Website Inbound",
        status: enq.status || matchLead?.status || "New",
        stage: matchLead?.stage || "new",
        temperature: matchLead?.temperature || (detection.category === 'site_visit' ? 'hot' : 'warm'),
        assignedTo: enq.assignedTo || matchLead?.assignedTo || "Vikram Malhotra (Lead Advisory)",
        createdAt: enq.createdAt || matchLead?.createdAt || new Date().toISOString(),
        formattedDate: new Date(enq.createdAt || Date.now()).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }),
        formattedTime: new Date(enq.createdAt || Date.now()).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        visitLogistics: matchVisit ? {
          visitDate: matchVisit.visitDate,
          visitTime: matchVisit.visitTime,
          status: matchVisit.status,
          cabModel: matchVisit.cabModel,
          cabPlate: matchVisit.cabPlate,
          driverName: matchVisit.driverName,
          driverPhone: matchVisit.driverPhone,
          feedback: matchVisit.feedback
        } : null
      });
    }

    // Process remaining CRM leads not yet matched
    for (const lead of crmLeads) {
      if (matchedLeadIds.has(lead.id)) continue;

      const normPhone = normalizePhone(lead.phone);
      const matchVisit = normPhone ? visitMap.get(normPhone) : null;
      const fullNotes = lead.notes || "";

      const detection = detectCategory(lead.source, lead.propertyInterest, fullNotes, lead.designation);

      unified.push({
        id: lead.id,
        uid: `CRM-${lead.id}`,
        dbSource: 'crm_leads',
        crmLeadId: lead.id,
        referenceCode: lead.code || `LD-${lead.id}`,
        name: lead.name || "Client",
        phone: lead.phone || "",
        email: lead.email || "",
        designation: lead.designation || "Private Investor",
        category: detection.category,
        categoryLabel: detection.label,
        subject: lead.propertyInterest || `Lead Portfolio: ${lead.name}`,
        propertyInterest: lead.propertyInterest || "Luxury Inventory",
        propertyId: null,
        locality: lead.location || extractDetail(fullNotes, "Preferred Locality"),
        bhk: lead.bhk || extractDetail(fullNotes, "Configuration"),
        budget: lead.budget || extractDetail(fullNotes, "Budget"),
        timeline: extractDetail(fullNotes, "Possession Timeline") || "Ready to Move",
        purpose: extractDetail(fullNotes, "Purpose of Buying") || "Self-Use / Investment",
        vastu: extractDetail(fullNotes, "Vastu Preference"),
        parking: extractDetail(fullNotes, "Parking / Amenities"),
        timingSlot: extractDetail(fullNotes, "Best Time to Contact") || (matchVisit ? `${matchVisit.visitDate} (${matchVisit.visitTime})` : null),
        message: fullNotes,
        rawNotes: lead.notes,
        source: lead.source || "CRM Direct Intake",
        status: lead.status || "New",
        stage: lead.stage || "new",
        temperature: lead.temperature || "warm",
        assignedTo: lead.assignedTo || "Vikram Malhotra",
        createdAt: lead.createdAt || new Date().toISOString(),
        formattedDate: new Date(lead.createdAt || Date.now()).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }),
        formattedTime: new Date(lead.createdAt || Date.now()).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        visitLogistics: matchVisit ? {
          visitDate: matchVisit.visitDate,
          visitTime: matchVisit.visitTime,
          status: matchVisit.status,
          cabModel: matchVisit.cabModel,
          cabPlate: matchVisit.cabPlate,
          driverName: matchVisit.driverName,
          driverPhone: matchVisit.driverPhone,
          feedback: matchVisit.feedback
        } : null
      });
    }

    // Sort by created date descending (newest first)
    unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate category breakdown counters
    const counts = {
      all: unified.length,
      site_visits: unified.filter(item => item.category === 'site_visit').length,
      bespoke: unified.filter(item => item.category === 'bespoke').length,
      property_enquiries: unified.filter(item => item.category === 'property_enquiry').length,
      seller_leads: unified.filter(item => item.category === 'seller_lead').length,
      crm_leads: unified.filter(item => item.category === 'crm_lead').length,
      general_inquiries: unified.filter(item => item.category === 'general_inquiry').length,
      new_status: unified.filter(item => (item.status || "").toLowerCase() === 'new').length,
      contacted: unified.filter(item => (item.status || "").toLowerCase().includes('contact')).length,
      scheduled: unified.filter(item => (item.status || "").toLowerCase().includes('schedul') || (item.status || "").toLowerCase().includes('visit')).length,
      closed: unified.filter(item => (item.status || "").toLowerCase().includes('close') || (item.status || "").toLowerCase().includes('won')).length
    };

    // Apply filtration if requested in query parameters
    let filtered = unified;
    if (filterType && filterType !== 'all') {
      filtered = filtered.filter(item => {
        if (filterType === 'site_visits') return item.category === 'site_visit';
        if (filterType === 'bespoke') return item.category === 'bespoke';
        if (filterType === 'property_enquiries') return item.category === 'property_enquiry';
        if (filterType === 'seller_leads') return item.category === 'seller_lead';
        if (filterType === 'crm_leads') return item.category === 'crm_lead';
        return item.category === filterType;
      });
    }

    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter(item => (item.status || "").toLowerCase() === filterStatus.toLowerCase());
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchQuery) ||
        item.phone?.toLowerCase().includes(searchQuery) ||
        item.email?.toLowerCase().includes(searchQuery) ||
        item.referenceCode?.toLowerCase().includes(searchQuery) ||
        item.subject?.toLowerCase().includes(searchQuery) ||
        item.locality?.toLowerCase().includes(searchQuery) ||
        item.message?.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({
      success: true,
      totalCount: unified.length,
      filteredCount: filtered.length,
      counts,
      enquiries: filtered
    });
  } catch (error: any) {
    console.error("GET /api/admin/enquiries error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, uid, status, notes, assignedTo } = body;

    if (!id && !uid) {
      return NextResponse.json(
        { success: false, error: "Record identifier (id or uid) is required" },
        { status: 400 }
      );
    }

    const targetUid = String(uid || id);
    let updatedRecord: any = null;

    if (targetUid.startsWith('CRM-')) {
      const crmId = parseInt(targetUid.replace('CRM-', ''), 10);
      updatedRecord = await queryOne(`
        UPDATE crm_leads
        SET 
          status = COALESCE($2, status),
          notes = COALESCE($3, notes),
          assigned_to = COALESCE($4, assigned_to),
          updated_at = NOW()
        WHERE id = $1
        RETURNING *;
      `, [crmId, status, notes, assignedTo]);
    } else {
      const enqId = parseInt(targetUid.replace('ENQ-', ''), 10);
      updatedRecord = await queryOne(`
        UPDATE "WebsiteEnquiry"
        SET 
          status = COALESCE($2, status),
          notes = COALESCE($3, notes),
          "assignedTo" = COALESCE($4, "assignedTo"),
          "updatedAt" = NOW()
        WHERE id = $1
        RETURNING *;
      `, [enqId, status, notes, assignedTo]);

      // If there is an associated CRM lead with matching phone, sync status
      if (updatedRecord?.phone) {
        try {
          const normPhone = normalizePhone(updatedRecord.phone);
          await queryOne(`
            UPDATE crm_leads
            SET status = $2, updated_at = NOW()
            WHERE phone LIKE $1;
          `, [`%${normPhone}%`, status]);
        } catch (e: any) {
          console.warn("CRM lead status bridge sync warning:", e.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Lead status updated successfully",
      enquiry: updatedRecord
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/enquiries error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update enquiry" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const uid = searchParams.get("uid") || id;

    if (!uid) {
      return NextResponse.json(
        { success: false, error: "Record identifier is required for deletion" },
        { status: 400 }
      );
    }

    if (uid.startsWith('CRM-')) {
      const crmId = parseInt(uid.replace('CRM-', ''), 10);
      await queryOne(`DELETE FROM crm_leads WHERE id = $1 RETURNING id;`, [crmId]);
    } else {
      const enqId = parseInt(uid.replace('ENQ-', ''), 10);
      await queryOne(`DELETE FROM "WebsiteEnquiry" WHERE id = $1 RETURNING id;`, [enqId]);
    }

    return NextResponse.json({
      success: true,
      message: `Enquiry/Lead ${uid} removed successfully.`
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/enquiries error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete record" },
      { status: 500 }
    );
  }
}
