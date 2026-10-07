import { NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";

export async function GET() {
  try {
    const leadsCount = await queryOne(`SELECT COUNT(*) as count FROM crm_leads;`);
    const customersCount = await queryOne(`SELECT COUNT(*) as count FROM crm_customers;`);
    const visitsCount = await queryOne(`SELECT COUNT(*) as count FROM crm_site_visits WHERE status = 'CONFIRMED';`);
    const callsCount = await queryOne(`SELECT COUNT(*) as count FROM crm_calls;`);
    const employeesCount = await queryOne(`SELECT COUNT(*) as count FROM crm_employees;`);

    // Stage breakdown for pipeline
    const stages = await query(`
      SELECT stage, COUNT(*) as count
      FROM crm_leads
      GROUP BY stage;
    `);

    const stageMap: Record<string, number> = {
      new: 0,
      contacted: 0,
      qualified: 0,
      shortlisted: 0,
      site_visit: 0,
      negotiation: 0,
      converted: 0,
      lost: 0
    };

    stages.forEach((r: any) => {
      if (stageMap[r.stage] !== undefined) {
        stageMap[r.stage] = parseInt(r.count, 10);
      }
    });

    return NextResponse.json({
      success: true,
      kpis: {
        totalLeads: parseInt(leadsCount?.count || "0", 10),
        activeCustomers: parseInt(customersCount?.count || "0", 10),
        scheduledVisits: parseInt(visitsCount?.count || "0", 10),
        callsLogged: parseInt(callsCount?.count || "0", 10),
        totalEmployees: parseInt(employeesCount?.count || "0", 10),
        stages: stageMap
      }
    });
  } catch (error: any) {
    console.error("GET /api/crm/metrics error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch CRM metrics" },
      { status: 500 }
    );
  }
}
