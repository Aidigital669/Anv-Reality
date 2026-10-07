import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const propertyTypes = await query(`
      SELECT 
        pt.id, pt.name, pt.slug, pt.description, pt."createdAt",
        COUNT(p.id)::int as "propertyCount"
      FROM "PropertyType" pt
      LEFT JOIN "Property" p ON p."propertyTypeId" = pt.id
      GROUP BY pt.id
      ORDER BY pt.name ASC;
    `);

    return NextResponse.json({
      success: true,
      count: propertyTypes.length,
      propertyTypes
    });
  } catch (error: any) {
    console.error("GET /api/admin/property-types error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch property types" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Property Type name is required." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if property type already exists
    const existing = await queryOne(
      `SELECT * FROM "PropertyType" WHERE LOWER(name) = LOWER($1);`,
      [trimmedName]
    );

    if (existing) {
      return NextResponse.json({
        success: true,
        message: `Property Type "${trimmedName}" already exists.`,
        propertyType: existing
      });
    }

    const newPT = await queryOne(
      `
      INSERT INTO "PropertyType" (name, slug, description, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *;
      `,
      [
        trimmedName,
        slug,
        description ? description.trim() : `Exclusive ${trimmedName} properties in Pune & Mumbai.`
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Property Type "${trimmedName}" added successfully to database!`,
      propertyType: newPT
    });
  } catch (error: any) {
    console.error("POST /api/admin/property-types error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create property type" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Property Type ID is required" }, { status: 400 });
    }

    const numId = parseInt(id, 10);

    // Check if properties are using this property type
    const propCount = await queryOne(
      `SELECT COUNT(*)::int as count FROM "Property" WHERE "propertyTypeId" = $1;`,
      [numId]
    );

    if (propCount && propCount.count > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete: ${propCount.count} property(ies) are currently linked to this property type. Reassign them first.`
        },
        { status: 400 }
      );
    }

    await query(`DELETE FROM "PropertyType" WHERE id = $1;`, [numId]);

    return NextResponse.json({
      success: true,
      message: "Property Type deleted successfully from database."
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/property-types error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete property type" },
      { status: 500 }
    );
  }
}
