import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      propertyName,
      propertyId,
      locality,
      bhk,
      budget,
      timeline,
      purpose,
      preferredMode,
      preferredTime,
      vastuPreference,
      parkingPreference,
      developerPreference,
      message,
      source
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Please provide your name and phone number." },
        { status: 400 }
      );
    }

    const subject = propertyName
      ? `Enquiry for ${propertyName}`
      : `Bespoke Buying Requirement: ${bhk || '3 BHK'} in ${locality || 'Pune'}`;

    const detailedNotes = [
      locality ? `Preferred Locality: ${locality}` : null,
      bhk ? `Configuration: ${bhk}` : null,
      budget ? `Budget: ${budget}` : null,
      timeline ? `Possession Timeline: ${timeline}` : null,
      purpose ? `Purpose of Buying: ${purpose}` : null,
      vastuPreference ? `Vastu Preference: ${vastuPreference}` : null,
      parkingPreference ? `Parking / Amenities: ${parkingPreference}` : null,
      developerPreference ? `Preferred Builder: ${developerPreference}` : null,
      preferredMode ? `Contact Mode: ${preferredMode}` : null,
      preferredTime ? `Best Time to Contact: ${preferredTime}` : null,
      message ? `Special Remarks: ${message}` : null
    ].filter(Boolean).join(" | ");

    // 1. Insert into WebsiteEnquiry table
    let enquiryId: number | null = null;
    try {
      const enq = await queryOne(`
        INSERT INTO "WebsiteEnquiry" (
          name, email, phone, subject, message, source, status, "propertyId", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'New', $7, NOW(), NOW())
        RETURNING id;
      `, [
        name,
        email || null,
        phone,
        subject,
        detailedNotes,
        source || "Bespoke Requirement Form",
        propertyId ? parseInt(String(propertyId), 10) || null : null
      ]);
      enquiryId = enq?.id || null;
    } catch (dbErr: any) {
      console.error("WebsiteEnquiry insert error:", dbErr.message);
    }

    // 2. Automatically sync to CRM Leads table in real time!
    try {
      const code = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
      await queryOne(`
        INSERT INTO crm_leads (
          code, name, phone, email, designation, residence, is_nri,
          location, property_interest, bhk, budget, source, source_type,
          status, stage, temperature, assigned_to, notes, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, 'Prospective Buyer', $5, false,
          $6, $7, $8, $9, $10, 'website',
          'New', 'new', 'hot', 'Vikram Malhotra', $11, NOW(), NOW()
        )
        ON CONFLICT DO NOTHING;
      `, [
        code,
        name,
        phone,
        email || null,
        locality ? `${locality}, Pune` : 'Pune, Maharashtra',
        locality ? `${locality}, Pune` : 'Pune Western & Eastern Corridors',
        propertyName || `Bespoke Sourcing: ${bhk || '3 BHK'}`,
        bhk || '3 BHK',
        budget || '₹1.5 - 2.5 Cr',
        source || 'Bespoke Property Requirement',
        detailedNotes
      ]);
    } catch (crmErr: any) {
      console.error("CRM lead automatic bridge error:", crmErr.message);
    }

    const refCode = `REQ-PUN-${Math.floor(10000 + Math.random() * 90000)}`;

    return NextResponse.json({
      success: true,
      referenceCode: refCode,
      message: `Thank you, ${name}! Your buying requirement has been registered (Ref: ${refCode}). Our Senior Property Advisor will connect with you at ${phone} with verified off-market matches.`,
      enquiry: {
        id: enquiryId,
        referenceCode: refCode,
        name,
        phone,
        email,
        subject,
        submittedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("Enquiry API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process enquiry." },
      { status: 500 }
    );
  }
}
