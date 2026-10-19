import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import * as XLSX from "xlsx";

function parseIndianPrice(priceRaw: any): number {
  if (typeof priceRaw === "number" && !isNaN(priceRaw)) {
    return priceRaw;
  }
  if (!priceRaw) return 0;

  const str = String(priceRaw).trim().toLowerCase();
  if (str === "price on request" || str === "on request" || str === "n/a") {
    return 0;
  }

  // Check Crore pattern (e.g. "1.5 Cr", "2.75 Crore")
  const crMatch = str.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:cr|crore|crores)/i);
  if (crMatch) {
    return Math.round(parseFloat(crMatch[1]) * 10000000);
  }

  // Check Lakh pattern (e.g. "85 Lakh", "90 Lac", "75L")
  const lMatch = str.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b/i);
  if (lMatch) {
    return Math.round(parseFloat(lMatch[1]) * 100000);
  }

  // Remove commas, rupee symbols, spaces
  const cleanNum = parseFloat(str.replace(/[^0-9.]/g, ""));
  if (!isNaN(cleanNum)) {
    return cleanNum;
  }

  return 0;
}

function parseSqft(sqftRaw: any): number {
  if (typeof sqftRaw === "number" && !isNaN(sqftRaw) && sqftRaw > 0) return sqftRaw;
  if (!sqftRaw) return 1200;
  const match = String(sqftRaw).replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
  return match ? parseFloat(match[1]) : 1200;
}

function getFallbackImageForCategory(categoryStr: string): string {
  const lower = (categoryStr || "").toLowerCase();
  if (lower.includes("hospital") || lower.includes("clinic") || lower.includes("medical")) {
    return "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80";
  }
  if (lower.includes("it park") || lower.includes("tech park") || lower.includes("cyber")) {
    return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";
  }
  if (lower.includes("commercial office") || lower.includes("office space") || lower.includes("office") || lower.includes("coworking")) {
    return "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80";
  }
  if (lower.includes("shop") || lower.includes("showroom") || lower.includes("retail")) {
    return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80";
  }
  if (lower.includes("restaurant") || lower.includes("cafe") || lower.includes("dining")) {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";
  }
  if (lower.includes("hotel") || lower.includes("resort") || lower.includes("hospitality")) {
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";
  }
  if (lower.includes("bungalow") || lower.includes("bunglow") || lower.includes("villa") || lower.includes("row house")) {
    return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";
  }
  if (lower.includes("warehouse") || lower.includes("godown") || lower.includes("logistics")) {
    return "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80";
  }
  if (lower.includes("land") || lower.includes("plot") || lower.includes("agriculture")) {
    return "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80";
  }
  if (lower.includes("penthouse")) {
    return "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";
  }
  // Default luxury apartment / residence
  return "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80";
}

export async function POST(req: NextRequest) {
  try {
    let rawItems: any[] = [];

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ success: false, error: "No file uploaded in form data." }, { status: 400 });
      }

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      rawItems = XLSX.utils.sheet_to_json(sheet);
    } else {
      const body = await req.json();
      rawItems = body.properties || body.items || [];
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No property rows found to import. Please check your Excel sheet."
      }, { status: 400 });
    }

    let savedCount = 0;
    const savedProperties: any[] = [];
    const errors: string[] = [];

    for (let index = 0; index < rawItems.length; index++) {
      const row = rawItems[index];

      // Flexible property extraction matching various column headers
      const title = (
        row.title ||
        row["Property Name"] ||
        row["property_name"] ||
        row.name ||
        row["Name"] ||
        row["Project Name"] ||
        row["Title"] ||
        ""
      ).toString().trim();

      if (!title) {
        // Skip empty row
        continue;
      }

      const category = (
        row.category ||
        row["Category"] ||
        row.configuration ||
        row["Configuration"] ||
        row.type ||
        row["Property Type"] ||
        row["propertyType"] ||
        row.bhk ||
        row["BHK"] ||
        "Commercial Office"
      ).toString().trim();

      const locationRaw = (
        row.location ||
        row["Location"] ||
        row.address ||
        row["Address"] ||
        row.city ||
        row["City"] ||
        row["Locality"] ||
        "Baner, Pune"
      ).toString().trim();

      const priceRaw = row.price !== undefined ? row.price : (row["Price"] !== undefined ? row["Price"] : row["Budget"]);
      const numPrice = parseIndianPrice(priceRaw);

      const statusRaw = (
        row.status ||
        row["Status"] ||
        row["Construction Status"] ||
        "Ready to Move"
      ).toString().trim();
      const status = /under\s*construction/i.test(statusRaw)
        ? "Under Construction"
        : /new\s*launch/i.test(statusRaw)
        ? "New Launch"
        : "Ready to Move";

      const publishStatusRaw = (
        row.publishStatus ||
        row["Publish Status"] ||
        row["Publish"] ||
        "Published"
      ).toString().trim();
      const publishStatus = /draft/i.test(publishStatusRaw) ? "Draft" : "Published";

      const sqftRaw = row.sqft || row["Sqft"] || row["Carpet Area"] || row["Carpet Area (sqft)"] || row["Area"] || row["Carpet Area (Sq.Ft.)"];
      const numArea = parseSqft(sqftRaw);

      const developer = (
        row.developer ||
        row["Developer"] ||
        row.builder ||
        row["Builder"] ||
        ""
      ).toString().trim();

      const description = (
        row.description ||
        row["Description"] ||
        row.details ||
        row["Details"] ||
        `Prime ${category} available in ${locationRaw}. Verified catalog listing with clear documentation and modern amenities.`
      ).toString().trim();

      const bedroomsRaw = row.bedrooms !== undefined ? row.bedrooms : row["Bedrooms"] || row["Beds"];
      const bedrooms = bedroomsRaw ? parseInt(String(bedroomsRaw).replace(/[^0-9]/g, ""), 10) || null : null;

      const bathroomsRaw = row.bathrooms !== undefined ? row.bathrooms : row["Bathrooms"] || row["Baths"];
      const bathrooms = bathroomsRaw ? parseInt(String(bathroomsRaw).replace(/[^0-9]/g, ""), 10) || null : null;

      const videoUrl = (row.videoUrl || row["Video URL"] || row["video_url"] || "").toString().trim();

      // Image URLs (support single or comma-separated images)
      const imageRaw = (
        row.imageUrl ||
        row["Image URL"] ||
        row.image ||
        row["Image"] ||
        row.images ||
        row["Images"] ||
        row["Photo"] ||
        ""
      ).toString().trim();

      let imageList: string[] = [];
      if (imageRaw) {
        imageList = imageRaw
          .split(/[,;\n]+/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.startsWith("http"));
      }

      if (imageList.length === 0) {
        imageList = [getFallbackImageForCategory(category)];
      }

      try {
        // 1. Resolve Location
        let locationId = 11;
        const locFirst = locationRaw.split(/[,–-]/)[0].trim() || "Baner";

        let matchedLoc = await queryOne(
          `SELECT id FROM "Location" WHERE LOWER(name) = LOWER($1) OR LOWER(name) = LOWER($2) LIMIT 1;`,
          [locFirst, locationRaw]
        );

        if (matchedLoc) {
          locationId = matchedLoc.id;
        } else if (locFirst.length >= 2) {
          const newLocSlug =
            locFirst.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
            `-pune-${Date.now().toString().slice(-4)}`;
          const createdLoc = await queryOne(
            `INSERT INTO "Location" (name, slug, city, state, country, description, "createdAt", "updatedAt")
             VALUES ($1, $2, 'Pune', 'Maharashtra', 'India', $3, NOW(), NOW())
             RETURNING id;`,
            [locFirst, newLocSlug, `Exclusive luxury & commercial corridor in ${locFirst}, Pune.`]
          );
          if (createdLoc) locationId = createdLoc.id;
        }

        // 2. Resolve PropertyType
        let propertyTypeId = 1;
        const cleanTypeSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

        let matchedPT = await queryOne(
          `SELECT id FROM "PropertyType" WHERE LOWER(name) = LOWER($1) OR slug = $2 LIMIT 1;`,
          [category, cleanTypeSlug]
        );

        if (!matchedPT && category.length >= 2) {
          try {
            matchedPT = await queryOne(
              `INSERT INTO "PropertyType" (name, slug, description, "createdAt", "updatedAt")
               VALUES ($1, $2, $3, NOW(), NOW())
               ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
               RETURNING id;`,
              [
                category.charAt(0).toUpperCase() + category.slice(1),
                cleanTypeSlug,
                `Verified ${category} properties in Pune & Mumbai.`
              ]
            );
          } catch (e) {
            console.warn("PropertyType insert notice:", e);
          }
        }

        if (matchedPT?.id) {
          propertyTypeId = matchedPT.id;
        } else {
          const fallbackPt = await queryOne(`SELECT id FROM "PropertyType" ORDER BY id ASC LIMIT 1;`);
          if (fallbackPt) propertyTypeId = fallbackPt.id;
        }

        // 3. Resolve Project
        let projectId: number | null = null;
        if (developer) {
          const proj = await queryOne(
            `SELECT id FROM "Project" WHERE LOWER(developer) = LOWER($1) OR LOWER(name) LIKE $2 LIMIT 1;`,
            [developer, `%${developer}%`]
          );
          if (proj) {
            projectId = proj.id;
          } else {
            const projSlug = `proj-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;
            const newProj = await queryOne(
              `INSERT INTO "Project" (name, slug, developer, "locationId", status, "isFeatured", "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, 'Active', false, NOW(), NOW()) RETURNING id;`,
              [`${developer} Project`, projSlug, developer, locationId]
            );
            if (newProj) projectId = newProj.id;
          }
        }

        // 4. Generate unique slug
        const slug =
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") +
          `-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;

        // 5. Insert Property Record
        const newProp = await queryOne(
          `
          INSERT INTO "Property" (
            title, slug, "propertyTypeId", "locationId", "projectId", "listingType", status, "publishStatus",
            description, address, price, "carpetArea", "areaUnit", bedrooms, bathrooms, "configuration", "videoUrl", "isFeatured",
            "createdAt", "updatedAt"
          )
          VALUES (
            $1, $2, $3, $4, $5, 'Sale', $6, $7,
            $8, $9, $10, $11, 'Sq.Ft.', $12, $13, $14, $15, true,
            NOW(), NOW()
          )
          RETURNING *;
        `,
          [
            title,
            slug,
            propertyTypeId,
            locationId,
            projectId,
            status,
            publishStatus,
            description,
            locationRaw,
            numPrice,
            numArea,
            bedrooms,
            bathrooms,
            category,
            videoUrl || null
          ]
        );

        // 6. Insert Images
        if (newProp && imageList.length > 0) {
          for (let i = 0; i < imageList.length; i++) {
            await query(
              `
              INSERT INTO "PropertyImage" ("propertyId", url, "altText", "sortOrder", "isPrimary", "createdAt")
              VALUES ($1, $2, $3, $4, $5, NOW());
            `,
              [newProp.id, imageList[i], `${title} Image ${i + 1}`, i + 1, i === 0]
            );
          }
        }

        savedProperties.push(newProp);
        savedCount++;
      } catch (rowErr: any) {
        console.error(`Error importing row #${index + 1} (${title}):`, rowErr);
        errors.push(`Row ${index + 1} ("${title}"): ${rowErr.message}`);
      }
    }

    if (savedCount === 0 && errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Failed to import rows: ${errors.join("; ")}`,
        errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      count: savedCount,
      totalReceived: rawItems.length,
      properties: savedProperties,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully imported ${savedCount} property listings into database!`
    });
  } catch (error: any) {
    console.error("Bulk Property Import Fatal Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to process property bulk import."
    }, { status: 500 });
  }
}
