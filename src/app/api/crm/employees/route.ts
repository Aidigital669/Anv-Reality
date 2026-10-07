import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const employees = await query(`
      SELECT 
        id, name, email, phone, role, avatar,
        active_leads_count AS "activeLeadsCount",
        monthly_target AS "monthlyTarget",
        achieved_value AS "achievedValue",
        conversion_rate AS "conversionRate",
        status, created_at AS "createdAt"
      FROM crm_employees
      ORDER BY id ASC;
    `);

    return NextResponse.json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error: any) {
    console.error("GET /api/crm/employees error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch employees" },
      { status: 500 }
    );
  }
}
