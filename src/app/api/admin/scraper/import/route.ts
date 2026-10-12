import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";

function parseIndianPrice(priceRaw: any, priceStr: any): number {
  if (typeof priceRaw === "number" && priceRaw > 10000) return priceRaw;
  if (typeof priceRaw === "string") {
    const rawNum = parseFloat(priceRaw.replace(/[^0-9.]/g, ""));
    if (rawNum > 10000) return rawNum;
  }
  if (!priceStr) return 15000000;
  const str = String(priceStr).trim();
  const numMatch = str.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!numMatch) return 15000000;
  const val = parseFloat(numMatch[1]);
  if (/cr|crore/i.test(str)) {
    return Math.round(val * 10000000);
  }
  if (/lakh|lac/i.test(str)) {
    return Math.round(val * 100000);
  }
  if (val > 100000) return val;
  return 15000000;
}

function parseSqft(sqftRaw: any, carpetAreaRaw: any): number {
  const val = sqftRaw || carpetAreaRaw;
  if (typeof val === "number" && val > 0) return val;
  if (!val) return 1200;
  const match = String(val).replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
  return match ? parseFloat(match[1]) : 1200;
}

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
    const savedProperties: any[] = [];
    const errors: string[] = [];

    for (const item of items) {
      try {
        const title = (item.name || item.title || "Luxury Residence").trim();
        const slug =
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") +
          `-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;

        const bhkLower = (item.bhk || "").toLowerCase();
        const titleLower = title.toLowerCase();
        const isCommercial = /\b(?:commercial|office|showroom|medical|retail|shop|workspace|warehouse|clinic|hospital)\b/i.test(
          bhkLower + " " + titleLower
        );

        const numPrice = parseIndianPrice(item.priceRaw, item.price);
        const numBedrooms = isCommercial
          ? null
          : item.bhk
          ? parseInt(String(item.bhk).replace(/[^0-9]/g, ""), 10) || 3
          : 3;
        const numArea = parseSqft(item.sqft, item.carpetArea);

        // 1. Determine Property Type ID dynamically from database
        let propertyTypeId: number = 1;
        if (isCommercial) {
          const pt = await queryOne(`SELECT id FROM "PropertyType" WHERE LOWER(name) LIKE '%commercial%' LIMIT 1;`);
          if (pt) propertyTypeId = pt.id;
        } else if (/\bpenthouse\b/i.test(bhkLower + " " + titleLower)) {
          const pt = await queryOne(`SELECT id FROM "PropertyType" WHERE LOWER(name) LIKE '%penthouse%' LIMIT 1;`);
          if (pt) propertyTypeId = pt.id;
        } else if (/\bvilla|bungalow|row house\b/i.test(bhkLower + " " + titleLower)) {
          const pt = await queryOne(`SELECT id FROM "PropertyType" WHERE LOWER(name) LIKE '%villa%' LIMIT 1;`);
          if (pt) propertyTypeId = pt.id;
        } else if (/\bestate|plot|land\b/i.test(bhkLower + " " + titleLower)) {
          const pt = await queryOne(`SELECT id FROM "PropertyType" WHERE LOWER(name) LIKE '%estate%' LIMIT 1;`);
          if (pt) propertyTypeId = pt.id;
        } else {
          const pt = await queryOne(`SELECT id FROM "PropertyType" WHERE LOWER(name) LIKE '%apartment%' LIMIT 1;`);
          if (pt) propertyTypeId = pt.id;
        }

        // Validate propertyTypeId exists in DB, fallback to any valid PropertyType
        const checkPt = await queryOne(`SELECT id FROM "PropertyType" WHERE id = $1 LIMIT 1;`, [propertyTypeId]);
        if (!checkPt) {
          const fallbackPt = await queryOne(`SELECT id FROM "PropertyType" ORDER BY id ASC LIMIT 1;`);
          if (fallbackPt) propertyTypeId = fallbackPt.id;
        }

        // 2. Resolve Location ID dynamically (and auto-insert if new location)
        let locationId: number | null = null;
        const rawLoc = (item.location || "Baner, Pune").trim();
        const locFirst = rawLoc.split(/[,–-]/)[0].trim();

        const matchedLoc = await queryOne(
          `SELECT id FROM "Location" WHERE LOWER(name) = LOWER($1) OR LOWER(name) = LOWER($2) OR LOWER(name) LIKE $3 LIMIT 1;`,
          [locFirst, rawLoc, `%${locFirst.toLowerCase()}%`]
        );
        if (matchedLoc) {
          locationId = matchedLoc.id;
        } else if (locFirst && locFirst.length >= 3 && !/^(pune|maharashtra|india)$/i.test(locFirst)) {
          const newLocSlug =
            locFirst.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
            `-pune-${Date.now().toString().slice(-4)}`;
          const createdLoc = await queryOne(
            `INSERT INTO "Location" (name, slug, city, state, country, description, "createdAt", "updatedAt")
             VALUES ($1, $2, 'Pune', 'Maharashtra', 'India', $3, NOW(), NOW())
             RETURNING id;`,
            [locFirst, newLocSlug, `Exclusive luxury & commercial enclave in ${locFirst}, Pune.`]
          );
          if (createdLoc) locationId = createdLoc.id;
        }

        if (!locationId) {
          const fallbackLoc = await queryOne(`SELECT id FROM "Location" ORDER BY id ASC LIMIT 1;`);
          if (fallbackLoc) locationId = fallbackLoc.id;
        }

        // 3. Resolve Project / Developer (avoid duplicate projects & enforce isFeatured: false)
        let projectId: number | null = null;
        const devName = (item.developer || "").trim();
        if (devName && devName !== "ANV Partner Developer" && devName !== "Luxury Collection Developer") {
          const existingProj = await queryOne(
            `SELECT id FROM "Project" WHERE LOWER(developer) = LOWER($1) OR LOWER(name) = LOWER($2) LIMIT 1;`,
            [devName, `${devName} Project`]
          );
          if (existingProj) {
            projectId = existingProj.id;
          } else {
            const projSlug = `proj-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 1000)}`;
            const newProj = await queryOne(
              `INSERT INTO "Project" (name, slug, developer, "locationId", status, "isFeatured", "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, 'Active', false, NOW(), NOW()) RETURNING id;`,
              [`${devName} Project`, projSlug, devName, locationId]
            );
            if (newProj) projectId = newProj.id;
          }
        }

        // Sanitize status: "Published" or "Draft" is publishStatus, not construction status
        let propStatus = (item.status || "").trim();
        if (!propStatus || propStatus === "Published" || propStatus === "Draft") {
          propStatus = "Ready to Move";
        }

        const newProp = await queryOne(
          `
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
          RETURNING id, title, slug;
        `,
          [
            title,
            slug,
            propertyTypeId,
            locationId,
            projectId,
            propStatus,
            item.description ||
              `AI-extracted luxury listing imported into Anv Reealty Catalog in ${locFirst}.`,
            rawLoc,
            numPrice,
            numArea,
            numBedrooms
          ]
        );

        if (newProp) {
          const primaryImgUrl =
            item.image ||
            item.imageUrl ||
            (Array.isArray(item.images) && item.images[0]) ||
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800";

          await query(
            `
              INSERT INTO "PropertyImage" ("propertyId", url, "altText", "sortOrder", "isPrimary", "createdAt")
              VALUES ($1, $2, $3, 1, true, NOW());
            `,
            [newProp.id, primaryImgUrl, title]
          );

          if (Array.isArray(item.images)) {
            const extraImages = item.images
              .map((img: any) => (typeof img === "string" ? img : img?.url))
              .filter(
                (img: any) =>
                  typeof img === "string" && img.startsWith("http") && img !== primaryImgUrl
              )
              .slice(0, 5);

            for (let idx = 0; idx < extraImages.length; idx++) {
              await query(
                `
                INSERT INTO "PropertyImage" ("propertyId", url, "altText", "sortOrder", "isPrimary", "createdAt")
                VALUES ($1, $2, $3, $4, false, NOW());
              `,
                [newProp.id, extraImages[idx], `${title} Gallery ${idx + 1}`, idx + 2]
              );
            }
          }

          savedProperties.push(newProp);
          savedCount++;
        }
      } catch (err: any) {
        console.error("Error importing individual item:", err);
        errors.push(`Failed to import "${item.name || item.title}": ${err.message}`);
      }
    }

    if (savedCount === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to import property listings: ${errors.join("; ")}`,
          errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      importedCount: savedCount,
      totalRequested: items.length,
      importedProperties: savedProperties,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully imported ${savedCount} property listings into Anv Reealty Catalog!`
    });
  } catch (error: any) {
    console.error("Scraper Import API Fatal Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to commit imported properties." },
      { status: 500 }
    );
  }
}
