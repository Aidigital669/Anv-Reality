import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const allowedFields: Record<string, string> = {
      stage: "stage",
      status: "status",
      temperature: "temperature",
      assignedTo: "assigned_to",
      notes: "notes",
      propertyInterest: "property_interest",
      budget: "budget"
    };

    const updates: string[] = [];
    const values: any[] = [];

    for (const [key, col] of Object.entries(allowedFields)) {
      if (body[key] !== undefined) {
        values.push(body[key]);
        updates.push(`${col} = $${values.length}`);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields provided to update." },
        { status: 400 }
      );
    }

    values.push(id);
    const sql = `
      UPDATE crm_leads
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE id = $${values.length} OR code = $${values.length}
      RETURNING 
        id, code, name, phone, email, designation, company,
        location, property_interest AS "propertyInterest",
        bhk, carpet_sqft AS "carpetSqft", budget, status, stage, temperature,
        assigned_to AS "assignedTo", notes, updated_at AS "updatedAt";
    `;

    const updated = await queryOne(sql, values);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Lead ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Lead ${updated.code} updated successfully`,
      lead: updated
    });
  } catch (error: any) {
    console.error("PATCH /api/crm/leads/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await queryOne(
      `DELETE FROM crm_leads WHERE id = $1 OR code = $1 RETURNING id, code, name;`,
      [id]
    );

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Lead ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Lead ${deleted.code} deleted successfully`
    });
  } catch (error: any) {
    console.error("DELETE /api/crm/leads/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete lead" },
      { status: 500 }
    );
  }
}
