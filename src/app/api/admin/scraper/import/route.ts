import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No properties provided for import." },
        { status: 400 }
      );
    }

    let savedCount = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        const title = item.name || item.title || "Luxury Residence";
        const slug =
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") + `-${Date.now().toString().slice(-4)}`;

        const numPrice = item.priceRaw && item.priceRaw > 0 ? parseFloat(item.priceRaw) : (item.price ? parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 15000000 : 15000000);
        const numBedrooms = item.bhk ? parseInt(String(item.bhk).replace(/[^0-9]/g, ""), 10) || 3 : 3;
        const numArea = item.sqft ? parseFloat(String(item.sqft).replace(/[^0-9.]/g, "")) || 1200 : (item.carpetArea ? parseFloat(String(item.carpetArea).replace(/[^0-9.]/g, "")) || 1200 : 1200);

        // 1. Determine Property Type ID dynamically
        let propertyTypeId = 1; // Luxury Apartment
        const bhkLower = (item.bhk || "").toLowerCase();
        const titleLower = title.toLowerCase();
        if (bhkLower.includes("office") || bhkLower.includes("commercial") || bhkLower.includes("showroom") || bhkLower.includes("medical") || titleLower.includes("office") || titleLower.includes("commercial") || titleLower.includes("shop")) {
          propertyTypeId = 11; // Commercial Office
        } else if (bhkLower.includes("penthouse") || titleLower.includes("penthouse")) {
          propertyTypeId = 8; // Signature Penthouse
        } else if (bhkLower.includes("villa") || titleLower.includes("villa")) {
          propertyTypeId = 9; // Sky Villa
        } else if (bhkLower.includes("estate") || bhkLower.includes("plot") || titleLower.includes("estate")) {
          propertyTypeId = 10; // Independent Estate
        }

        // 2. Resolve Location ID
        let locationId = 11; // Koregaon Park default
        const rawLoc = (item.location || "Baner, Pune").trim();
        const locFirst = rawLoc.split(/[,–-]/)[0].trim();
        const matchedLoc = await queryOne(
          `SELECT id FROM "Location" WHERE LOWER(name) = LOWER($1) OR LOWER(name) = LOWER($2) LIMIT 1;`,
          [locFirst, rawLoc]
        );
        if (matchedLoc) {
          locationId = matchedLoc.id;
        }

        // 3. Resolve Project / Developer
        let projectId: number | null = null;
        if (item.developer && item.developer !== "ANV Partner Developer") {
          const projSlug = `proj-${Date.now().toString().slice(-5)}`;
          const newProj = await queryOne(
            `INSERT INTO "Project" (name, slug, developer, "locationId", status, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, 'Active', NOW(), NOW()) RETURNING id;`,
            [`${item.developer} Project`, projSlug, item.developer, locationId]
          );
          if (newProj) projectId = newProj.id;
        }

        const newProp = await queryOne(`
          INSERT INTO "Property" (
            title, slug, "propertyTypeId", "locationId", "projectId", "listingType", status, "publishStatus",
            description, address, price, "carpetArea", "areaUnit", bedrooms, "isFeatured",
            "createdAt", "updatedAt"
          )
          VALUES (
            $1, $2, $3, $4, $5, 'Sale', $6, 'Published',
            $7, $8, $9, $10, 'Sq.Ft.', $11, true,
            NOW(), NOW()
          )
          RETURNING id;
        `, [
          title,
          slug,
          propertyTypeId,
          locationId,
          projectId,
          item.status || "Ready to Move",
          item.description || "AI-extracted luxury listing imported into Anv Reealty Catalog.",
          item.location || "Pune, Maharashtra",
          numPrice,
          numArea,
          numBedrooms
        ]);

        if (newProp) {
          const primaryImgUrl = item.image || item.imageUrl || (item.images && item.images[0]);
          if (primaryImgUrl) {
            await query(`
              INSERT INTO "PropertyImage" ("propertyId", url, "altText", "sortOrder", "isPrimary", "createdAt")
              VALUES ($1, $2, $3, 1, true, NOW());
            `, [newProp.id, primaryImgUrl, title]);
          }

          if (Array.isArray(item.images)) {
            const extraImages = item.images.filter((img: string) => img !== primaryImgUrl && typeof img === 'string' && img.startsWith('http')).slice(0, 5);
            for (let idx = 0; idx < extraImages.length; idx++) {
              await query(`
                INSERT INTO "PropertyImage" ("propertyId", url, "altText", "sortOrder", "isPrimary", "createdAt")
                VALUES ($1, $2, $3, $4, false, NOW());
              `, [newProp.id, extraImages[idx], `${title} Gallery ${idx + 1}`, idx + 2]);
            }
          }
        }

        savedCount++;
      } catch (err: any) {
        errors.push(`Failed to import "${item.name}": ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: savedCount,
      totalRequested: items.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully imported ${savedCount} property listings into Anv Reealty Catalog!`
    });
  } catch (error: any) {
    console.error("Scraper Import API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to commit imported properties." },
      { status: 500 }
    );
  }
}
