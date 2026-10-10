import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

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
    console.error("GET /api/crm/site-visits error:", error);
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
      leadName, leadPhone, projectName, visitDate, visitTime,
      assignedAgent, cabModel, cabPlate, driverName, driverPhone, feedback
    } = body;

    if (!leadName || !projectName || !visitDate) {
      return NextResponse.json(
        { success: false, error: "Lead name, project, and visit date are required." },
        { status: 400 }
      );
    }

    const newVisit = await queryOne(`
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
      leadName, leadPhone || "+91 98200 12345", projectName,
      visitDate, visitTime || "11:00 AM", assignedAgent || "Unassigned",
      cabModel || "Mercedes-Benz E-Class", cabPlate || "MH 12 QX 4040",
      driverName || "Suresh Shinde", driverPhone || "+91 98230 44100", feedback || ""
    ]);

    return NextResponse.json({
      success: true,
      message: `Site visit scheduled for ${leadName}`,
      visit: newVisit
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/crm/site-visits error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to schedule site visit" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, feedback } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Visit ID is required." },
        { status: 400 }
      );
    }

    const updated = await queryOne(`
      UPDATE crm_site_visits
      SET status = COALESCE($2, status), feedback = COALESCE($3, feedback)
      WHERE id = $1
      RETURNING *;
    `, [id, status, feedback]);

    return NextResponse.json({
      success: true,
      visit: updated
    });
  } catch (error: any) {
    console.error("PATCH /api/crm/site-visits error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update visit" },
      { status: 500 }
    );
  }
}
