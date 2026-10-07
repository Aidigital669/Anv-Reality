import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  try {
    const customers = await query(`
      SELECT 
        id, code, name, phone, email,
        unit_booked AS "unitBooked", project_name AS "projectName",
        total_value AS "totalValue", total_value_raw AS "totalValueRaw",
        payment_status AS "paymentStatus", kyc_status AS "kycStatus",
        possession_date AS "possessionDate",
        relationship_manager AS "relationshipManager",
        created_at AS "createdAt"
      FROM crm_customers
      ORDER BY created_at DESC;
    `);

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers
    });
  } catch (error: any) {
    console.error("GET /api/crm/customers error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, phone, email, unitBooked, projectName, totalValue,
      totalValueRaw, paymentStatus, kycStatus, possessionDate, relationshipManager
    } = body;

    if (!name || !phone || !unitBooked) {
      return NextResponse.json(
        { success: false, error: "Name, phone, and unit booked are required." },
        { status: 400 }
      );
    }

    const code = `CUST-${Math.floor(100 + Math.random() * 900)}`;

    const newCustomer = await queryOne(`
      INSERT INTO crm_customers (
        code, name, phone, email, unit_booked, project_name, total_value,
        total_value_raw, payment_status, kyc_status, possession_date,
        relationship_manager, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING 
        id, code, name, phone, email, unit_booked AS "unitBooked",
        project_name AS "projectName", total_value AS "totalValue",
        payment_status AS "paymentStatus", kyc_status AS "kycStatus",
        possession_date AS "possessionDate",
        relationship_manager AS "relationshipManager", created_at AS "createdAt";
    `, [
      code, name, phone, email || null, unitBooked, projectName || "VTP Altair Residences",
      totalValue || "₹1.80 Cr", totalValueRaw ? parseFloat(totalValueRaw) : 18000000,
      paymentStatus || "Booking Advance Paid", kycStatus || "Verified",
      possessionDate || "Mar 2026", relationshipManager || "Vikram Malhotra"
    ]);

    return NextResponse.json({
      success: true,
      message: `Customer ${code} created successfully`,
      customer: newCustomer
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/crm/customers error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}
