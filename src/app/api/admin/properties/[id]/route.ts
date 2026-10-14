import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const colUpdates = new Map<string, any>();

    // 1. Title / Name
    const titleVal = body.title !== undefined ? body.title : body.name;
    if (titleVal !== undefined && typeof titleVal === "string" && titleVal.trim()) {
      colUpdates.set("title", titleVal.trim());
    }

    // 2. Price
    if (body.price !== undefined && body.price !== null && body.price !== "") {
      const rawStr = String(body.price).toLowerCase();
      let parsed = parseFloat(rawStr.replace(/[^0-9.]/g, ""));
      if (rawStr.includes("cr") || rawStr.includes("crore")) {
        parsed = Math.round(parsed * 10000000);
      } else if (rawStr.includes("lakh") || rawStr.includes("lac") || rawStr.includes("l")) {
        parsed = Math.round(parsed * 100000);
      }
      colUpdates.set("price", isNaN(parsed) ? 15000000 : parsed);
    }

    // 3. Location / Address & locationId
    const addressVal = body.address !== undefined ? body.address : body.location;
    if (addressVal !== undefined && typeof addressVal === "string" && addressVal.trim()) {
      const trimmedAddress = addressVal.trim();
      colUpdates.set("address", trimmedAddress);

      const locFirst = trimmedAddress.split(/[,–-]/)[0].trim();
      let matchedLoc = await queryOne(
        `SELECT id FROM "Location" WHERE LOWER(name) = LOWER($1) OR LOWER(name) = LOWER($2) LIMIT 1;`,
        [locFirst, trimmedAddress]
      );
      if (!matchedLoc && locFirst) {
        const newLocSlug = locFirst.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        matchedLoc = await queryOne(
          `INSERT INTO "Location" (name, slug, city, state, country, description, "createdAt", "updatedAt")
           VALUES ($1, $2, 'Pune', 'Maharashtra', 'India', $3, NOW(), NOW())
           ON CONFLICT DO NOTHING
           RETURNING id;`,
          [locFirst, newLocSlug || `loc-${Date.now()}`, `Exclusive corridor in ${locFirst}, Pune.`]
        );
        if (!matchedLoc) {
          matchedLoc = await queryOne(
            `SELECT id FROM "Location" WHERE LOWER(name) = LOWER($1) LIMIT 1;`,
            [locFirst]
          );
        }
      }
      if (matchedLoc?.id) {
        colUpdates.set('"locationId"', matchedLoc.id);
      }
    }

    // 4. Typology / BHK / Bedrooms & propertyTypeId
    const rawType = String(body.bhk || body.propertyType || body.bedrooms || "").trim();
    const rawTitle = String(titleVal || "").trim();
    const isCommercial = /\b(?:commercial|office|retail|hospital|clinic|showroom|space|warehouse|industrial)\b/i.test(
      rawTitle + " " + rawType
    );

    if (body.bhk !== undefined || body.bedrooms !== undefined) {
      if (isCommercial) {
        const digits = rawType.replace(/[^0-9]/g, "");
        colUpdates.set("bedrooms", digits ? parseInt(digits, 10) : null);
      } else {
        const digits = rawType.replace(/[^0-9]/g, "");
        colUpdates.set("bedrooms", digits ? parseInt(digits, 10) : 3);
      }
    }

    if (body.bhk !== undefined || body.propertyType !== undefined) {
      if (isCommercial) {
        const commType = await queryOne(
          `SELECT id FROM "PropertyType" WHERE LOWER(name) LIKE '%commercial%' OR LOWER(name) LIKE '%office%' LIMIT 1;`
        );
        if (commType?.id) {
          colUpdates.set('"propertyTypeId"', commType.id);
        }
      } else {
        const lowerType = rawType.toLowerCase();
        let ptId: number | null = null;
        if (lowerType.includes("penthouse")) ptId = 8;
        else if (lowerType.includes("villa")) ptId = 9;
        else if (lowerType.includes("estate") || lowerType.includes("plot")) ptId = 10;
        else if (lowerType.includes("bhk") || lowerType.includes("apartment")) ptId = 1;

        if (ptId) {
          colUpdates.set('"propertyTypeId"', ptId);
        }
      }
    }

    // 5. Carpet Area / Sqft
    const rawSqft = body.carpetArea !== undefined ? body.carpetArea : body.sqft;
    if (rawSqft !== undefined && rawSqft !== null && rawSqft !== "") {
      const parsedSqft = parseFloat(String(rawSqft).replace(/[^0-9.]/g, ""));
      colUpdates.set('"carpetArea"', isNaN(parsedSqft) ? 1200 : parsedSqft);
    }

    // 6. Description
    if (body.description !== undefined && typeof body.description === "string") {
      colUpdates.set("description", body.description.trim());
    }

    // 7. Status & PublishStatus
    if (body.status !== undefined) {
      const s = String(body.status).trim();
      if (s === "Draft") {
        colUpdates.set('"publishStatus"', "Draft");
        colUpdates.set("status", "Ready to Move");
      } else if (s === "Published") {
        colUpdates.set('"publishStatus"', "Published");
        colUpdates.set("status", "Ready to Move");
      } else {
        colUpdates.set("status", s || "Ready to Move");
        colUpdates.set('"publishStatus"', "Published");
      }
    } else if (body.publishStatus !== undefined) {
      colUpdates.set('"publishStatus"', body.publishStatus === "Draft" ? "Draft" : "Published");
    }

    // Build unique SET statements
    const updates: string[] = [];
    const values: any[] = [];

    for (const [col, val] of colUpdates.entries()) {
      values.push(val);
      updates.push(`${col} = $${values.length}`);
    }

    if (updates.length > 0) {
      values.push(id);
      await queryOne(`
        UPDATE "Property"
        SET ${updates.join(", ")}, "updatedAt" = NOW()
        WHERE id = $${values.length};
      `, values);
    }

    // 4. Update or Insert Cover Image
    const newImageUrl = body.imageUrl || body.image;
    if (newImageUrl && typeof newImageUrl === "string" && newImageUrl.trim()) {
      const existingImg = await queryOne(
        `SELECT id FROM "PropertyImage" WHERE "propertyId" = $1 ORDER BY "isPrimary" DESC, "sortOrder" ASC LIMIT 1;`,
        [id]
      );
      if (existingImg) {
        await query(
          `UPDATE "PropertyImage" SET url = $1, "altText" = $2 WHERE id = $3;`,
          [newImageUrl.trim(), body.name || body.title || "Property Cover", existingImg.id]
        );
      } else {
        await query(
          `INSERT INTO "PropertyImage" ("propertyId", url, "altText", "sortOrder", "isPrimary", "createdAt")
           VALUES ($1, $2, $3, 1, true, NOW());`,
          [id, newImageUrl.trim(), body.name || body.title || "Property Cover"]
        );
      }
    }

    // 5. Update Developer in linked Project
    if (body.developer && typeof body.developer === "string") {
      const propRecord = await queryOne(
        `SELECT "projectId" FROM "Property" WHERE id = $1;`,
        [id]
      );
      if (propRecord?.projectId) {
        await query(
          `UPDATE "Project" SET developer = $1, "updatedAt" = NOW() WHERE id = $2;`,
          [body.developer.trim(), propRecord.projectId]
        );
      } else {
        const projSlug = `proj-${Date.now().toString().slice(-5)}`;
        const newProj = await queryOne(
          `INSERT INTO "Project" (name, slug, developer, status, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, 'Active', NOW(), NOW()) RETURNING id;`,
          [`${body.developer} Project`, projSlug, body.developer.trim()]
        );
        if (newProj) {
          await query(
            `UPDATE "Property" SET "projectId" = $1 WHERE id = $2;`,
            [newProj.id, id]
          );
        }
      }
    }

    // 6. Fetch Full Updated Property with joined image, location, and developer
    const updatedFull = await queryOne(`
      SELECT 
        p.id, p.title AS name, p.title, p.slug, p.address AS location,
        p.price, p."carpetArea" AS sqft, p.bedrooms AS bhk,
        p.status, p."publishStatus", p."isFeatured",
        p."createdAt", p."updatedAt",
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
      WHERE p.id = $1;
    `, [id]);

    const formattedPrice = updatedFull?.price
      ? updatedFull.price >= 10000000
        ? `₹${(updatedFull.price / 10000000).toFixed(2)} Cr`
        : `₹${(updatedFull.price / 100000).toFixed(1)} Lakh`
      : "Price on Request";

    return NextResponse.json({
      success: true,
      message: `Property "${updatedFull?.name || id}" updated successfully!`,
      property: {
        ...updatedFull,
        priceFormatted: formattedPrice
      }
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
