import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  try {
    const calls = await query(`
      SELECT 
        id, lead_name AS "leadName", phone, direction,
        duration, call_time AS "callTime", status,
        summary, recording_url AS "recordingUrl",
        agent_name AS "agentName", created_at AS "createdAt"
      FROM crm_calls
      ORDER BY created_at DESC;
    `);

    return NextResponse.json({
      success: true,
      count: calls.length,
      calls
    });
  } catch (error: any) {
    console.error("GET /api/crm/calls error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch calls" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadName, phone, direction, duration, summary, agentName, status } = body;

    if (!leadName || !phone) {
      return NextResponse.json(
        { success: false, error: "Lead name and phone are required to log call." },
        { status: 400 }
      );
    }

    const newCall = await queryOne(`
      INSERT INTO crm_calls (
        lead_name, phone, direction, duration, call_time, status,
        summary, agent_name, created_at
      )
      VALUES ($1, $2, $3, $4, 'Just now', $5, $6, $7, NOW())
      RETURNING 
        id, lead_name AS "leadName", phone, direction, duration,
        call_time AS "callTime", status, summary, agent_name AS "agentName",
        created_at AS "createdAt";
    `, [
      leadName, phone, direction || "OUTBOUND", duration || "04m 12s",
      status || "COMPLETED", summary || "Call completed with patron.", agentName || "Vikram Malhotra"
    ]);

    return NextResponse.json({
      success: true,
      message: "Call logged successfully",
      call: newCall
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/crm/calls error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to log call" },
      { status: 500 }
    );
  }
}
