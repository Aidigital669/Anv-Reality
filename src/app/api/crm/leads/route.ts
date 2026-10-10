import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { calculateLeadScore, calculateChurnRisk, calculateNextBestAction } from "@/lib/crm-algorithm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const stage = searchParams.get("stage");

    let sql = `
      SELECT 
        id, code, name, phone, email, avatar, designation, company, residence,
        is_nri AS "isNri", nri_tag AS "nriTag", rera_verified AS "reraVerified",
        location, property_interest AS "propertyInterest", bhk, carpet_sqft AS "carpetSqft",
        budget, budget_raw AS "budgetRaw", source, source_type AS "sourceType",
        status, stage, temperature, assigned_to AS "assignedTo", notes,
        follow_up AS "followUp", dna, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM crm_leads
      WHERE 1=1
    `;
    const params: any[] = [];

    if (stage && stage !== "all") {
      params.push(stage);
      sql += ` AND stage = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (name ILIKE $${params.length} OR code ILIKE $${params.length} OR phone ILIKE $${params.length} OR location ILIKE $${params.length})`;
    }

    sql += ` ORDER BY created_at DESC;`;

    const leads = await query(sql, params);

    // Apply Real-time Algorithmic Formulations (Algorithms 1, 4, 5)
    const enrichedLeads = leads.map((l: any) => {
      const createdAt = new Date(l.createdAt || Date.now()).getTime();
      const now = Date.now();
      const hoursAgo = Math.max(1, Math.floor((now - createdAt) / (1000 * 60 * 60)));
      const daysInStage = Math.max(1, Math.floor(hoursAgo / 24));

      const scoreData = calculateLeadScore({
        budgetRaw: l.budgetRaw ? Number(l.budgetRaw) : 17500000,
        budget: l.budget,
        timeline: l.dna?.possessionHorizon,
        dna: l.dna,
        isNri: l.isNri,
        financingStatus: l.dna?.financingStatus,
        stage: l.stage,
        lastContactHoursAgo: hoursAgo
      });

      const churnData = calculateChurnRisk(l.stage || 'new', daysInStage);
      const nbaData = calculateNextBestAction({
        stage: l.stage || 'new',
        score: scoreData.score,
        daysInStage,
        name: l.name || 'Patron'
      });

      return {
        ...l,
        leadScore: scoreData.score,
        scoreTier: scoreData.tier,
        scoreBreakdown: scoreData.breakdown,
        slaLabel: scoreData.recommendedSla,
        churnRisk: churnData.riskScore,
        churnRiskLevel: churnData.riskLevel,
        isStagnant: churnData.isStagnant,
        churnAlert: churnData.alertMessage,
        nextBestAction: nbaData.headline,
        nextBestActionSubtext: nbaData.subtext,
        nextBestActionType: nbaData.actionType,
        nextBestActionButton: nbaData.buttonLabel
      };
    });

    return NextResponse.json({
      success: true,
      count: enrichedLeads.length,
      leads: enrichedLeads
    });
  } catch (error: any) {
    console.error("GET /api/crm/leads error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch CRM leads" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, phone, email, designation, company, residence, isNri, nriTag,
      location, propertyInterest, bhk, carpetSqft, budget, budgetRaw,
      source, sourceType, stage, temperature, assignedTo, notes
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Name and phone are required for a lead." },
        { status: 400 }
      );
    }

    const code = `LD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLead = await queryOne(`
      INSERT INTO crm_leads (
        code, name, phone, email, designation, company, residence, is_nri, nri_tag,
        location, property_interest, bhk, carpet_sqft, budget, budget_raw,
        source, source_type, status, stage, temperature, assigned_to, notes,
        created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22,
        NOW(), NOW()
      )
      RETURNING 
        id, code, name, phone, email, designation, company, residence,
        is_nri AS "isNri", location, property_interest AS "propertyInterest",
        bhk, carpet_sqft AS "carpetSqft", budget, status, stage, temperature,
        assigned_to AS "assignedTo", notes, created_at AS "createdAt";
    `, [
      code, name, phone, email || null, designation || "Private Investor", company || null, residence || "Pune, Maharashtra",
      !!isNri, nriTag || null, location || "Baner, Pune", propertyInterest || "VTP Altair Residences",
      bhk || "3 BHK", carpetSqft || "1,146 Sq.Ft.", budget || "₹1.5 - 2.5 Cr", budgetRaw ? parseFloat(budgetRaw) : 17500000,
      source || "Direct Intake", sourceType || "walk_in", "New Lead", stage || "new",
      temperature || "hot", assignedTo || "Unassigned", notes || ""
    ]);

    return NextResponse.json({
      success: true,
      message: `Lead ${code} created successfully!`,
      lead: newLead
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/crm/leads error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create CRM lead" },
      { status: 500 }
    );
  }
}
