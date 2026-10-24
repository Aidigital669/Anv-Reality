import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const visits = await query(`
      SELECT 
        id, lead_name AS "leadName", lead_phone AS "leadPhone",
        project_name AS "projectName", visit_date AS "visitDate",
        visit_time AS "visitTime", status,
        assigned_agent AS "assignedAgent",
        cab_model AS "cabModel", cab_plate AS "cabPlate",
        driver_name AS "driverName", driver_phone AS "driverPhone",
        feedback, created_at AS "createdAt"
      FROM crm_site_visits
      ORDER BY visit_date ASC, created_at DESC;
    `);

    return NextResponse.json({
      success: true,
      count: visits.length,
      visits
    });
  } catch (error: any) {
    console.error("GET /api/site-visits error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch site visits" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      address,
      visitorAddress,
      projectName,
      propertyId,
      locality,
      bhk,
      budget,
      visitDate,
      visitTime,
      cabRequired,
      pickupLocation,
      passengers,
      notes
    } = body;

    const leadName = (name || "").trim();
    const leadPhone = (phone || "").trim();
    const clientAddress = (address || visitorAddress || pickupLocation || "").trim();
    const project = (projectName || "Curated Pune Luxury Residence").trim();
    const formattedDate = visitDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const formattedTime = visitTime || "11:00 AM - 01:00 PM";

    if (!leadName || !leadPhone) {
      return NextResponse.json(
        { success: false, error: "Please provide your name and phone number for the site visit." },
        { status: 400 }
      );
    }

    // Default chauffeur logistics if requested
    const cabModel = cabRequired ? "Mercedes-Benz E-Class (Chauffeur Pick)" : "Self Transit";
    const cabPlate = cabRequired ? "MH 12 QX 4040" : null;
    const driverName = cabRequired ? "Suresh Shinde (VIP Chauffeur)" : null;
    const driverPhone = cabRequired ? "+91 98230 44100" : null;

    const feedbackNotes = [
      clientAddress ? `Visitor Address: "${clientAddress}"` : null,
      cabRequired ? `Complimentary Chauffeur Requested: Pickup at "${clientAddress || 'Client Residence'}"` : `Transit: Direct Visit`,
      passengers ? `Attendees: ${passengers} Person(s)` : null,
      notes ? `Client Remarks: ${notes}` : null
    ].filter(Boolean).join(" | ");

    // 1. Insert into crm_site_visits table (For Sales Dashboard & CRM Site Visits tab)
    let newVisit: any = null;
    try {
      newVisit = await queryOne(`
        INSERT INTO crm_site_visits (
          lead_name, lead_phone, project_name, visit_date, visit_time,
          status, assigned_agent, cab_model, cab_plate, driver_name,
          driver_phone, feedback, created_at
        )
        VALUES ($1, $2, $3, $4, $5, 'CONFIRMED', $6, $7, $8, $9, $10, $11, NOW())
        RETURNING 
          id, lead_name AS "leadName", lead_phone AS "leadPhone",
          project_name AS "projectName", visit_date AS "visitDate",
          visit_time AS "visitTime", status, assigned_agent AS "assignedAgent",
          cab_model AS "cabModel", cab_plate AS "cabPlate",
          driver_name AS "driverName", driver_phone AS "driverPhone",
          feedback, created_at AS "createdAt";
      `, [
        leadName,
        leadPhone,
        project,
        formattedDate,
        formattedTime,
        "Prem Sharma (Senior Advisory)",
        cabModel,
        cabPlate,
        driverName,
        driverPhone,
        feedbackNotes
      ]);
    } catch (dbErr: any) {
      console.error("crm_site_visits insert error:", dbErr.message);
    }

    // 2. Insert / Sync into crm_leads table (For Sales Dashboard Leads Pipeline under 'Site Visit' stage)
    try {
      const code = `SV-${Math.floor(1000 + Math.random() * 9000)}`;
      await queryOne(`
        INSERT INTO crm_leads (
          code, name, phone, email, designation, residence, is_nri,
          location, property_interest, bhk, budget, source, source_type,
          status, stage, temperature, assigned_to, notes, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, 'VIP Site Visitor', $5, false,
          $6, $7, $8, $9, 'Website Site Visit Form', 'website',
          'Site Visit Sched', 'site_visit', 'hot', 'Prem Sharma (Senior Advisory)', $10, NOW(), NOW()
        )
        ON CONFLICT DO NOTHING;
      `, [
        code,
        leadName,
        leadPhone,
        email || null,
        clientAddress || (locality ? `${locality}, Pune` : 'Pune, Maharashtra'),
        locality ? `${locality}, Pune` : 'Pune, Maharashtra',
        project,
        bhk || '3 BHK',
        budget || '₹1.5 - 2.5 Cr',
        `Site Visit Confirmed on ${formattedDate} at ${formattedTime}. Property: ${project}. Logistics: ${feedbackNotes}`
      ]);
    } catch (leadErr: any) {
      console.error("crm_leads insert error:", leadErr.message);
    }

    // 3. Insert into WebsiteEnquiry table (For Admin Dashboard Enquiries & Leads tab under Site Visits)
    try {
      const subject = `Site Visit Request: ${project}`;
      const detailedMessage = [
        `Confirmed Site Visit Date: ${formattedDate}`,
        `Preferred Slot: ${formattedTime}`,
        `Property: ${project}`,
        locality ? `Locality: ${locality}` : null,
        clientAddress ? `Visitor Address: ${clientAddress}` : null,
        cabRequired ? `Chauffeur Cab: Requested` : null,
        passengers ? `Attendees: ${passengers}` : null,
        notes ? `Special Notes: ${notes}` : null
      ].filter(Boolean).join(" | ");

      await queryOne(`
        INSERT INTO "WebsiteEnquiry" (
          name, email, phone, subject, message, source, status, "propertyId", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, 'Website Site Visit Form', 'New', $6, NOW(), NOW())
        RETURNING id;
      `, [
        leadName,
        email || null,
        leadPhone,
        subject,
        detailedMessage,
        propertyId ? parseInt(String(propertyId), 10) || null : null
      ]);
    } catch (enqErr: any) {
      console.error("WebsiteEnquiry insert error:", enqErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Your site visit request is successfully confirmed!",
      visit: newVisit || {
        leadName,
        leadPhone,
        projectName: project,
        visitDate: formattedDate,
        visitTime: formattedTime,
        status: "CONFIRMED"
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("POST /api/site-visits error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to schedule site visit" },
      { status: 500 }
    );
  }
}
