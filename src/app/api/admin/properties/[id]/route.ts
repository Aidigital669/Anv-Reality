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
      name: "title",
      title: "title",
      status: "status",
      publishStatus: '"publishStatus"',
      price: "price",
      location: "address",
      address: "address",
      bhk: "bedrooms",
      bedrooms: "bedrooms",
      sqft: '"carpetArea"',
      carpetArea: '"carpetArea"',
      description: "description"
    };

    const updates: string[] = [];
    const values: any[] = [];

    // 1. Process standard fields
    for (const [key, col] of Object.entries(allowedFields)) {
      if (body[key] !== undefined) {
        let val = body[key];
        // Ensure parsing for numeric fields if passed as strings
        if (key === "price") {
          const rawStr = String(val).toLowerCase();
          let parsed = parseFloat(rawStr.replace(/[^0-9.]/g, ""));
          if (rawStr.includes("cr") || rawStr.includes("crore")) {
            parsed = Math.round(parsed * 10000000);
          } else if (rawStr.includes("lakh") || rawStr.includes("lac") || rawStr.includes("l")) {
            parsed = Math.round(parsed * 100000);
          }
          val = isNaN(parsed) ? 15000000 : parsed;
        } else if (key === "bhk" || key === "bedrooms") {
          val = parseInt(String(val).replace(/[^0-9]/g, ""), 10) || 3;
        } else if (key === "sqft" || key === "carpetArea") {
          val = parseFloat(String(val).replace(/[^0-9.]/g, "")) || 1200;
        } else if (key === "status") {
          // Normalize status vs publishStatus
          if (val === "Draft") {
            updates.push(`"publishStatus" = 'Draft'`);
            val = "Ready to Move";
          } else if (val === "Published") {
            updates.push(`"publishStatus" = 'Published'`);
            val = "Ready to Move";
          } else {
            // Keep status as construction state and ensure publishStatus is Published
            updates.push(`"publishStatus" = 'Published'`);
          }
        }

        values.push(val);
        updates.push(`${col} = $${values.length}`);
      }
    }

    // 2. Resolve location / locationId if location was provided
    if (body.location || body.address) {
      const locText = (body.location || body.address).trim();
      const locFirst = locText.split(/[,–-]/)[0].trim();
      const matchedLoc = await queryOne(
        `SELECT id FROM "Location" WHERE LOWER(name) = LOWER($1) OR LOWER(name) = LOWER($2) LIMIT 1;`,
        [locFirst, locText]
      );
      if (matchedLoc) {
        values.push(matchedLoc.id);
        updates.push(`"locationId" = $${values.length}`);
      }
    }

    // 3. Resolve PropertyType if typology / bhk was updated
    if (body.bhk || body.propertyType) {
      const bText = String(body.bhk || body.propertyType).toLowerCase();
      let ptId: number | null = null;
      if (bText.includes("office") || bText.includes("commercial") || bText.includes("showroom")) ptId = 11;
      else if (bText.includes("penthouse")) ptId = 8;
      else if (bText.includes("villa")) ptId = 9;
      else if (bText.includes("estate") || bText.includes("plot")) ptId = 10;
      else if (bText.includes("bhk") || bText.includes("apartment")) ptId = 1;

      if (ptId) {
        values.push(ptId);
        updates.push(`"propertyTypeId" = $${values.length}`);
      }
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
