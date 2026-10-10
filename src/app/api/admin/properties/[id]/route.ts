import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const allowedFields: Record<string, string> = {
      name: "title",
      title: "title",
      status: "status",
      publishStatus: '"publishStatus"',
      price: "price",
      location: "address",
      bhk: "bedrooms",
      sqft: '"carpetArea"',
      description: "description"
    };

    const updates: string[] = [];
    const values: any[] = [];

    for (const [key, col] of Object.entries(allowedFields)) {
      if (body[key] !== undefined) {
        let val = body[key];
        // Ensure parsing for numeric fields if passed as strings
        if (key === "price") {
          val = parseFloat(String(val).replace(/[^0-9.]/g, ""));
          if (String(body[key]).toLowerCase().includes('cr')) val *= 10000000;
          else if (String(body[key]).toLowerCase().includes('lakh')) val *= 100000;
        } else if (key === "bhk") {
          val = parseInt(String(val).replace(/[^0-9]/g, ""), 10) || 3;
        } else if (key === "sqft") {
          val = parseFloat(String(val).replace(/[^0-9.]/g, "")) || 1200;
        }
        values.push(val);
        updates.push(`${col} = $${values.length}`);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update." },
        { status: 400 }
      );
    }

    values.push(id);
    const updated = await queryOne(`
      UPDATE "Property"
      SET ${updates.join(", ")}, "updatedAt" = NOW()
      WHERE id = $${values.length}
      RETURNING *;
    `, values);

    return NextResponse.json({
      success: true,
      message: "Property updated successfully",
      property: updated
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/properties/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update property" },
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
    const deleted = await queryOne(`
      DELETE FROM "Property" WHERE id = $1 RETURNING id, title;
    `, [id]);

    return NextResponse.json({
      success: true,
      message: `Property "${deleted?.title || id}" deleted successfully.`
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/properties/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete property" },
      { status: 500 }
    );
  }
}
