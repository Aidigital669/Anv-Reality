import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let sql = `
      SELECT 
        p.id, p.title AS name, p.slug, p.address AS location,
        p.price, p."carpetArea" AS sqft, p.bedrooms AS bhk,
        p.status, p."publishStatus", p."isFeatured",
        p."createdAt",
        loc.name as loc_name,
        pt.name as pt_name,
        proj.developer,
        COALESCE(img.url, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800') as image
      FROM "Property" p
      LEFT JOIN "Location" loc ON p."locationId" = loc.id
      LEFT JOIN "PropertyType" pt ON p."propertyTypeId" = pt.id
      LEFT JOIN "Project" proj ON p."projectId" = proj.id
      LEFT JOIN LATERAL (
        SELECT url FROM "PropertyImage" 
        WHERE "propertyId" = p.id 
        ORDER BY "sortOrder" ASC LIMIT 1
      ) img ON true
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (p.title ILIKE $${params.length} OR p.address ILIKE $${params.length} OR loc.name ILIKE $${params.length})`;
    }

    sql += ` ORDER BY p."createdAt" DESC;`;

    const properties = await query(sql, params);

    return NextResponse.json({
      success: true,
      count: properties.length,
      properties: properties.map((p: any) => ({
        ...p,
        priceFormatted: p.price
          ? p.price >= 10000000
            ? `₹${(p.price / 10000000).toFixed(2)} Cr`
            : `₹${(p.price / 100000).toFixed(1)} Lakh`
          : "Price on Request"
      }))
    });
  } catch (error: any) {
    console.error("GET /api/admin/properties error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title, location, developer, price, bhk, sqft, status, publishStatus, description, imageUrl, propertyType
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Property title is required." },
        { status: 400 }
      );
    }

    const trimmedTitle = title.trim();
    const slug =
      trimmedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") + `-${Date.now().toString().slice(-4)}`;

    // 1. Resolve Location / Locality
    let locationId = 11; // default fallback (Koregaon Park / Baner)
    const rawLoc = (location || "Baner, Pune").trim();
    const locFirst = rawLoc.split(/[,–-]/)[0].trim();

    let matchedLoc = await queryOne(
      `SELECT id FROM "Location" WHERE LOWER(name) = LOWER($1) OR LOWER(name) = LOWER($2) LIMIT 1;`,
      [locFirst, rawLoc]
    );

    if (matchedLoc) {
      locationId = matchedLoc.id;
    } else if (locFirst.length >= 3) {
      // Create new Location record so it immediately becomes a filter option
      const newLocSlug = locFirst.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-pune";
      const createdLoc = await queryOne(
        `INSERT INTO "Location" (name, slug, city, state, country, description, "createdAt", "updatedAt")
         VALUES ($1, $2, 'Pune', 'Maharashtra', 'India', $3, NOW(), NOW())
         RETURNING id;`,
        [locFirst, newLocSlug, `Exclusive luxury & commercial corridor in ${locFirst}, Pune.`]
      );
      if (createdLoc) locationId = createdLoc.id;
    }

    // 2. Resolve PropertyType
    let propertyTypeId = 1; // default fallback
    const rawType = (propertyType || bhk || "").trim();
    const isCommercial = /\b(?:commercial|office|retail|space|workspace)\b/i.test(trimmedTitle + " " + rawType);

    if (isCommercial) {
      const commType = await queryOne(
        `SELECT id FROM "PropertyType" WHERE LOWER(name) LIKE '%commercial%' LIMIT 1;`
      );
      if (commType) {
        propertyTypeId = commType.id;
      }
    } else {
      let matchedPT = await queryOne(
        `SELECT id FROM "PropertyType" WHERE LOWER(name) = LOWER($1) LIMIT 1;`,
        [rawType]
      );
      if (matchedPT) {
        propertyTypeId = matchedPT.id;
      } else if (/\bpenthouse\b/i.test(trimmedTitle + " " + rawType)) {
        const pt = await queryOne(`SELECT id FROM "PropertyType" WHERE LOWER(name) LIKE '%penthouse%' LIMIT 1;`);
        if (pt) propertyTypeId = pt.id;
      } else if (/\bvilla\b/i.test(trimmedTitle + " " + rawType)) {
        const pt = await queryOne(`SELECT id FROM "PropertyType" WHERE LOWER(name) LIKE '%villa%' LIMIT 1;`);
        if (pt) propertyTypeId = pt.id;
      }
    }

    const numPrice = price ? parseFloat(String(price).replace(/[^0-9.]/g, "")) : 15000000;
    const numBedrooms = isCommercial
      ? null
      : (bhk ? parseInt(String(bhk).replace(/[^0-9]/g, ""), 10) || 3 : 3);
    const numArea = sqft ? parseFloat(String(sqft).replace(/[^0-9.]/g, "")) || 1200 : 1200;

    // 3. Resolve Project
    let projectId: number | null = null;
    if (developer && developer.trim()) {
      const proj = await queryOne(
        `SELECT id FROM "Project" WHERE LOWER(developer) = LOWER($1) OR LOWER(name) LIKE $2 LIMIT 1;`,
        [developer.trim(), `%${developer.trim()}%`]
      );
      if (proj) projectId = proj.id;
    }

    const newProp = await queryOne(`
      INSERT INTO "Property" (
        title, slug, "propertyTypeId", "locationId", "projectId", "listingType", status, "publishStatus",
        description, address, price, "carpetArea", "areaUnit", bedrooms, "isFeatured",
        "createdAt", "updatedAt"
      )
      VALUES (
        $1, $2, $3, $4, $5, 'Sale', $6, $7,
        $8, $9, $10, $11, 'Sq.Ft.', $12, true,
        NOW(), NOW()
      )
      RETURNING *;
    `, [
      trimmedTitle,
      slug,
      propertyTypeId,
      locationId,
      projectId,
      status || "Ready to Move",
      publishStatus || "Published",
      description || `Exclusive luxury property curated by Anv Reealty in ${locFirst}.`,
      location || `${locFirst}, Pune, Maharashtra`,
      numPrice,
      numArea,
      numBedrooms
    ]);

    if (imageUrl && newProp) {
      await query(`
        INSERT INTO "PropertyImage" ("propertyId", url, "altText", "sortOrder", "isPrimary", "createdAt")
        VALUES ($1, $2, $3, 1, true, NOW());
      `, [newProp.id, imageUrl, trimmedTitle]);
    }

    return NextResponse.json({
      success: true,
      message: `Property "${trimmedTitle}" published to catalog successfully!`,
      property: newProp
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/properties error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create property" },
      { status: 500 }
    );
  }
}
