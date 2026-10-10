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

        const numPrice = item.priceRaw ? parseFloat(item.priceRaw) : 15000000;
        const numBedrooms = item.bhk ? parseInt(String(item.bhk).replace(/[^0-9]/g, ""), 10) || 3 : 3;
        const numArea = item.carpetArea ? parseFloat(String(item.carpetArea).replace(/[^0-9.]/g, "")) || 1200 : 1200;

        const newProp = await queryOne(`
          INSERT INTO "Property" (
            title, slug, "propertyTypeId", "listingType", status, "publishStatus",
            description, address, price, "carpetArea", "areaUnit", bedrooms, "isFeatured",
            "createdAt", "updatedAt"
          )
          VALUES (
            $1, $2, 1, 'Sale', $3, 'Published',
            $4, $5, $6, $7, 'Sq.Ft.', $8, true,
            NOW(), NOW()
          )
          RETURNING id;
        `, [
          title,
          slug,
          item.status || "Under-Construction",
          item.description || "AI-extracted luxury listing imported into Anv Reealty Catalog.",
          item.location || "Pune, Maharashtra",
          numPrice,
          numArea,
          numBedrooms
        ]);

        if (newProp && (item.image || item.imageUrl)) {
          await query(`
            INSERT INTO "PropertyImage" ("propertyId", url, "altText", "sortOrder", "isPrimary", "createdAt")
            VALUES ($1, $2, $3, 1, true, NOW());
          `, [newProp.id, item.image || item.imageUrl, title]);
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
