import { query } from "../src/lib/db.ts";

async function main() {
  const rows = await query(`
    SELECT 
      p.id, 
      p.title as name, 
      p.description, 
      p.address as location,
      p.price, 
      p."carpetArea" as sqft_num, 
      p.bedrooms as bhk_num, 
      p.status, 
      p."isFeatured" as featured,
      COALESCE(proj.developer, 'ANV Signature Partner') as developer,
      COALESCE(proj."reraNumber", 'PRM/PUN/RERA/2026/0491') as rera_number,
      COALESCE(loc.name, 'Pune') as locality,
      COALESCE(pt.name, 'Apartment') as type_name,
      COALESCE(img.url, '') as image
    FROM "Property" p
    LEFT JOIN "Project" proj ON p."projectId" = proj.id
    LEFT JOIN "Location" loc ON p."locationId" = loc.id
    LEFT JOIN "PropertyType" pt ON p."propertyTypeId" = pt.id
    LEFT JOIN LATERAL (
      SELECT url FROM "PropertyImage" WHERE "propertyId" = p.id ORDER BY "sortOrder" ASC LIMIT 1
    ) img ON true
    WHERE p."publishStatus" = 'Published'
    ORDER BY p."updatedAt" DESC
  `);

  console.log("Total published properties in DB:", rows.length);
  rows.forEach(r => {
    console.log(`[ID ${r.id}] ${r.name} | Locality: ${r.locality} | Price: ₹${r.price} | Type: ${r.type_name} | Carpet: ${r.sqft_num} sq.ft | URL: /properties/${r.id}`);
  });
}

main().catch(console.error);
