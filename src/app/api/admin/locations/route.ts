import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const locations = await query(`
      SELECT 
        loc.id, loc.name, loc.slug, loc.city, loc.state, loc.country, loc.description, loc."createdAt",
        COUNT(p.id)::int as "propertyCount"
      FROM "Location" loc
      LEFT JOIN "Property" p ON p."locationId" = loc.id
      GROUP BY loc.id
      ORDER BY loc.name ASC;
    `);

    return NextResponse.json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error: any) {
    console.error("GET /api/admin/locations error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, city = "Pune", state = "Maharashtra", country = "India", description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Location / Locality name is required." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const slug =
      trimmedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      `-${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    // Check if location already exists
    const existing = await queryOne(
      `SELECT * FROM "Location" WHERE LOWER(name) = LOWER($1);`,
      [trimmedName]
    );

    if (existing) {
      return NextResponse.json({
        success: true,
        message: `Location "${trimmedName}" already exists.`,
        location: existing
      });
    }

    const newLoc = await queryOne(
      `
      INSERT INTO "Location" (name, slug, city, state, country, description, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *;
      `,
      [
        trimmedName,
        slug,
        city.trim(),
        state.trim(),
        country.trim(),
        description ? description.trim() : `Premier real estate corridor in ${city}.`
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Locality "${trimmedName}" added successfully to database!`,
      location: newLoc
    });
  } catch (error: any) {
    console.error("POST /api/admin/locations error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create location" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Location ID is required" }, { status: 400 });
    }

    const numId = parseInt(id, 10);

    // Check if properties are using this location
    const propCount = await queryOne(
      `SELECT COUNT(*)::int as count FROM "Property" WHERE "locationId" = $1;`,
      [numId]
    );

    if (propCount && propCount.count > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete: ${propCount.count} property(ies) are currently linked to this location. Reassign them first.`
        },
        { status: 400 }
      );
    }

    await query(`DELETE FROM "Location" WHERE id = $1;`, [numId]);

    return NextResponse.json({
      success: true,
      message: "Locality deleted successfully from database."
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/locations error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete location" },
      { status: 500 }
    );
  }
}
