import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import * as XLSX from "xlsx";

const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  'Hospital': [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80'
  ],
  'Office Space': [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80'
  ],
  'Commercial Office': [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
  ],
  'Office in IT Park': [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80'
  ],
  'Shop/Showroom': [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'
  ],
  'Restaurant': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80'
  ],
  'Hotel / Resort': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
  ],
  'Residential Bunglow': [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  ],
  'Penthouse': [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
  ],
  'Residential Apartment': [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
  ]
};

function getCategoryPhoto(categoryStr: string, idx: number): string {
  const pool = CATEGORY_IMAGE_POOLS[categoryStr] || CATEGORY_IMAGE_POOLS['Commercial Office'];
  return pool[idx % pool.length];
}

const DEVELOPER_PATTERNS = [
  { match: /panchshil/i, name: 'Panchshil Realty' },
  { match: /godrej/i, name: 'Godrej Properties' },
  { match: /bramha/i, name: 'BramhaCorp' },
  { match: /vtp/i, name: 'VTP Realty' },
  { match: /amar\s*madhuban|amar\s*summit|amar/i, name: 'Amar Builders' },
  { match: /ganga|geol\s*ganga/i, name: 'Goel Ganga Developments' },
  { match: /mantra/i, name: 'Mantra Properties' },
  { match: /solitaire/i, name: 'Solitaire Group' },
  { match: /tribeca/i, name: 'Tribeca Developers' },
  { match: /kolte/i, name: 'Kolte Patil Developers' },
  { match: /raheja/i, name: 'K Raheja Corp' },
  { match: /gera/i, name: 'Gera Developments' },
  { match: /pride/i, name: 'Pride Purple Group' },
  { match: /atrium/i, name: 'Atrium Group' },
  { match: /trade\s*park/i, name: 'Trade Park Group' },
  { match: /teerth/i, name: 'Teerth Realties' },
  { match: /kotibhaskar/i, name: 'Kotibhaskar Group' },
  { match: /orville/i, name: 'Orville Realties' }
];

function cleanLocality(raw: any): string {
  if (!raw) return 'Pune, Maharashtra';
  let s = String(raw).trim();
  if (s.toLowerCase() === 'others/pune') return 'Pune, Maharashtra';
  if (/baner\s*mahalunge/i.test(s)) return 'Baner-Mahalunge Road, Pune';
  if (/ganesh\s*kinde|ganeshkhind/i.test(s)) return 'Ganeshkhind Road, Shivaji Nagar, Pune';
  if (/sadhu\s*vaswani/i.test(s)) return 'Sadhu Vaswani Chowk, Camp, Pune';
  if (/magarpatta/i.test(s)) return 'Magarpatta City, Pune';
  if (/nibm/i.test(s)) return 'NIBM Road, Pune';
  if (!s.toLowerCase().includes('pune')) s += ', Pune';
  return s;
}

function normalizeCategory(raw: any): string {
  if (!raw) return 'Commercial Office';
  const s = String(raw).trim();
  if (/medical|hospital|clinic|healthcare/i.test(s)) return 'Hospital';
  if (/office\s*in\s*it\s*park|it park|tech park|cyber/i.test(s)) return 'Office in IT Park';
  if (/office|space|corporate|building/i.test(s)) return 'Office Space';
  if (/showroom|shop|retail|boutique/i.test(s)) return 'Shop/Showroom';
  if (/restaurant|cafe|dining|bar|lounge|f&b/i.test(s)) return 'Restaurant';
  if (/hotel|resort|hospitality/i.test(s)) return 'Hotel / Resort';
  if (/warehouse|godown|logistics/i.test(s)) return 'Warehouse';
  if (/plot|land|farm|agriculture/i.test(s)) return 'Residential/Commercial Land/Plot';
  if (/bungalow|bunglow|villa|row house/i.test(s)) return 'Residential Bunglow';
  if (/penthouse/i.test(s)) return 'Penthouse';
  if (/apartment|flat|bhk|residence/i.test(s)) return 'Residential Apartment';
  return s;
}

function parseAreaNumber(raw: any): number {
  if (typeof raw === 'number' && !isNaN(raw) && raw > 0) return raw;
  if (!raw) return 1200;
  const str = String(raw).replace(/,/g, '');
  const m = str.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!m) return 1200;
  let val = parseFloat(m[1]);
  if (/sq\.?\s*meter|sqm|meter/i.test(str)) {
    val = Math.round(val * 10.7639);
  }
  return val;
}

function parseIndianPriceNumber(priceRaw: any): number {
  if (typeof priceRaw === 'number' && !isNaN(priceRaw)) return priceRaw;
  if (!priceRaw) return 0;
  const str = String(priceRaw).trim().toLowerCase();
  if (str === 'price on request' || str === 'on request' || str === 'n/a') return 0;

  const crMatch = str.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:cr|crore|crores)/i);
  if (crMatch) return Math.round(parseFloat(crMatch[1]) * 10000000);

  const lMatch = str.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b/i);
  if (lMatch) return Math.round(parseFloat(lMatch[1]) * 100000);

  const cleanNum = parseFloat(str.replace(/[^0-9.]/g, ''));
  return !isNaN(cleanNum) ? cleanNum : 0;
}

function calculatePriceData(row: any, area: number): number {
  const directPriceKeys = [
    'Price', 'price', 'Total Price', 'total_price', 'Budget', 'budget',
    'Cost', 'cost', 'TotalCost', 'total_cost', 'Amount', 'amount', 'Total Amount'
  ];
  for (const k of directPriceKeys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      const p = parseIndianPriceNumber(row[k]);
      if (p > 10000) return p;
    }
  }

  const puaKeys = [
    'PricePerUnitArea', 'Price Per Unit Area', 'price_per_unit_area',
    'Price/Sqft', 'Price/Sq.Ft.', 'Rate', 'Rate/Sqft', 'Rate/Sq.Ft.', 'RatePerSqft'
  ];
  for (const k of puaKeys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      const pua = parseFloat(String(row[k]).replace(/[^0-9.]/g, ''));
      if (!isNaN(pua) && pua >= 500 && area > 0) {
        return Math.round(area * pua);
      }
      if (!isNaN(pua) && pua > 0 && pua < 500 && area > 0) {
        return Math.round(area * pua * 100);
      }
    }
  }

  const rentKeys = ['RentPM', 'Rent PM', 'rent_pm', 'Rent', 'Monthly Rent'];
  for (const k of rentKeys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      const r = parseFloat(String(row[k]).replace(/[^0-9.]/g, ''));
      if (!isNaN(r) && r > 0) {
        return Math.round(r * 100);
      }
    }
  }

  return 0;
}

function isCustomerOrAgent(val: string, custFull: string): boolean {
  if (!val) return true;
  const v = val.toLowerCase().replace(/[^a-z]/g, '');
  if (!v) return true;
  if (custFull) {
    const c = custFull.toLowerCase().replace(/[^a-z]/g, '');
    if (v === c || v.includes(c) || c.includes(v)) return true;
  }
  return /^(nikkhil|santosh|jadhav|jain|sharma|patil|gupta|verma|deshmukh|drparmar)$/i.test(v);
}

function formatCleanTitleWithLocation(title: string, location: string): string {
  let clean = title.replace(/[\u2018\u2019\u201c\u201d"'`]/g, '').replace(/\s+/g, ' ').trim();
  const locPure = location.replace(', Pune', '').replace(', Maharashtra', '').trim();
  if (locPure && !clean.toLowerCase().includes(locPure.toLowerCase())) {
    clean += ` in ${location}`;
  } else if (!clean.toLowerCase().includes('pune')) {
    clean += ', Pune';
  }
  return clean;
}

function constructPropertyTitle(row: any, category: string, location: string, area: number): string {
  const directTitleKeys = [
    'Property Name', 'property_name', 'PropertyTitle', 'Title', 'title', 'Project Name'
  ];
  for (const k of directTitleKeys) {
    const val = row[k] ? String(row[k]).trim() : '';
    if (val && !isCustomerOrAgent(val, row.CustomerFullName)) {
      return formatCleanTitleWithLocation(val, location);
    }
  }

  const bldg = (row['BuildingName'] || row['Building Name'] || row['Building'] || '')
    .toString()
    .replace(/[\u2018\u2019\u201c\u201d"'`]/g, '')
    .trim();
  const prop = (row['PropertyName'] || row['Property'] || '')
    .toString()
    .replace(/[\u2018\u2019\u201c\u201d"'`]/g, '')
    .trim();
  const cust = (row['CustomerFullName'] || '').toString().trim();
  const fl = (row['FloorNumber'] || '').toString().trim();
  const areaFormatted = area ? `${area.toLocaleString('en-IN')} Sq.Ft. ` : '';

  let namePart = '';

  if (bldg && !isCustomerOrAgent(bldg, cust)) {
    const bldgLower = bldg.toLowerCase();
    const propLower = prop.toLowerCase();
    if (bldgLower === 'hospital') {
      namePart = prop && !isCustomerOrAgent(prop, cust) ? prop : `${category} Facility`;
    } else if (bldgLower === 'hospital undri') {
      namePart = 'Hospital Facility';
    } else if (bldgLower === 'residences' && propLower === 'mantra') {
      namePart = 'Mantra Residences';
    } else if (bldgLower === 'prelease baner') {
      namePart = 'Pre-Leased Commercial Showroom';
    } else if (bldgLower === 'prelease restaurant') {
      namePart = 'Pre-Leased Restaurant & Commercial Space';
    } else if (bldgLower === 'business') {
      namePart = prop ? prop : 'Commercial Business Bay';
    } else if (bldgLower === 'sbh') {
      namePart = 'Solitaire Business Hub (SBH)';
    } else if (bldgLower === 'poona wala') {
      namePart = 'Poonawalla Business Towers';
    } else if (bldgLower === 'scared world mall') {
      namePart = 'Sacred World Mall';
    } else {
      namePart = bldg;
    }
  } else if (prop && !isCustomerOrAgent(prop, cust)) {
    namePart = prop;
  }

  let fullTitle = '';
  if (namePart) {
    const hasCat = new RegExp(category.replace('/', '|'), 'i').test(namePart);
    const catSuffix = hasCat ? '' : ` ${category}`;
    const flSuffix = (fl && /^\d+(st|nd|rd|th)?\s*floor$/i.test(fl)) ? ` (${fl})` : '';
    fullTitle = `${namePart}${catSuffix}${flSuffix}`;
  } else {
    fullTitle = `${areaFormatted}${category}`;
  }

  return formatCleanTitleWithLocation(fullTitle, location);
}

function detectDeveloper(bldg: string, prop: string, rowDev: string): string {
  if (rowDev && rowDev.trim()) return rowDev.trim();
  const combined = `${bldg} ${prop}`.toLowerCase();
  for (const dev of DEVELOPER_PATTERNS) {
    if (dev.match.test(combined)) return dev.name;
  }
  return 'ANV Realty Partner';
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

      // 1. Resolve Category
      const rawCat = row.category || row["PropertyTypeName"] || row["Category"] || row.configuration || row["Configuration"] || row["Property Type"] || row.type || row["BHK"] || row.bhk;
      const category = normalizeCategory(rawCat);

      // 2. Resolve Location
      const locationRaw = cleanLocality(
        row.location ||
        row["LocationName"] ||
        row["Location"] ||
        row.address ||
        row["Address"] ||
        row.city ||
        row["City"] ||
        row["Locality"]
      );

      // 3. Resolve Area
      const sqftRaw = row.sqft || row["SuperAreaName"] || row["Carpet Area (sqft)"] || row["Carpet Area"] || row["Sqft"] || row["Area"] || 1200;
      const numArea = parseAreaNumber(sqftRaw);

      // 4. Resolve Title
      let title = row.title ? String(row.title).trim() : "";
      if (!title || title.startsWith("Untitled Property")) {
        title = constructPropertyTitle(row, category, locationRaw, numArea);
      }

      if (!title) {
        continue;
      }

      // 5. Resolve Price
      let numPrice = 0;
      if (row.price !== undefined && row.price !== null && row.price !== '') {
        numPrice = parseIndianPriceNumber(row.price);
      }
      if (numPrice === 0) {
        numPrice = calculatePriceData(row, numArea);
      }

      // 6. Resolve Status
      const rawStatus = (row.status || row["TransactionName"] || row["Status"] || row["Construction Status"] || "Ready to Move").toString().trim();
      let status = 'Ready to Move';
      if (/under\s*construction/i.test(rawStatus)) status = 'Under Construction';
      else if (/pre\s*lease/i.test(rawStatus)) status = 'Pre-Leased';
      else if (/new\s*launch/i.test(rawStatus)) status = 'New Launch';

      const publishStatusRaw = (
        row.publishStatus ||
        row["Publish Status"] ||
        row["Publish"] ||
        "Published"
      ).toString().trim();
      const publishStatus = /draft/i.test(publishStatusRaw) ? "Draft" : "Published";

      // 7. Developer
      const bldg = (row['BuildingName'] || row['Building Name'] || '').toString();
      const prop = (row['PropertyName'] || row['Property'] || '').toString();
      const rawDev = (row.developer || row["Developer"] || row.builder || row["Builder"] || "").toString();
      const developer = detectDeveloper(bldg, prop, rawDev);

      // 8. Description & Specifications
      const furnishing = (row["FurnishingName"] || row["furnishing"] || "").toString().trim();
      const floor = (row["FloorNumber"] || row["floor"] || "").toString().trim();
      const parkingRaw = row["ParkingDetails"] || row["parking"];
      const parking = parkingRaw ? parseInt(String(parkingRaw).replace(/[^0-9]/g, ""), 10) || null : null;
      const roi = (row["ROI"] || row["roi"] || "").toString().trim();
      const rentRaw = row["RentPM"] || row["Rent PM"] || row["rent_pm"] || row["Rent"] || row["rent"];
      const rent = rentRaw ? parseFloat(String(rentRaw).replace(/[^0-9.]/g, '')) || null : null;

      const rentInfo = rent && rent > 0 ? `, generating ₹${(rent / 100000).toFixed(2)} Lakh monthly rental income` : '';
      const roiInfo = roi ? `, with ${roi}% verified ROI` : '';

      const description = (
        row.description ||
        row["Description"] ||
        row.details ||
        row["Details"] ||
        `Prime ${category} available in ${locationRaw}. Featuring ${numArea.toLocaleString('en-IN')} Sq.Ft.${furnishing ? ' with ' + furnishing + ' specifications' : ''}${floor ? ', located on ' + floor : ''}${parking ? ', including ' + parking + ' reserved parking spaces' : ''}${rentInfo}${roiInfo}. Verified commercial catalog listing with clear documentation.`
      ).toString().trim();

      let listingType = 'Sale';
      if (status === 'Pre-Leased' || (rent && rent > 0 && numPrice === 0)) {
        listingType = 'Rent';
      }

      const bedroomsRaw = row.bedrooms !== undefined ? row.bedrooms : row["Bedrooms"] || row["Beds"];
      const bedrooms = bedroomsRaw ? parseInt(String(bedroomsRaw).replace(/[^0-9]/g, ""), 10) || null : null;

      const bathroomsRaw = row.bathrooms !== undefined ? row.bathrooms : row["Bathrooms"] || row["Baths"];
      const bathrooms = bathroomsRaw ? parseInt(String(bathroomsRaw).replace(/[^0-9]/g, ""), 10) || null : null;

      const videoUrl = (row.videoUrl || row["Video URL"] || row["video_url"] || "").toString().trim();

      // Image URLs (support single, comma-separated, or category pool)
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
        imageList = [getCategoryPhoto(category, index)];
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
            description, address, price, rent, floor, furnishing, parking, "carpetArea", "areaUnit", bedrooms, bathrooms, "configuration", "videoUrl", "isFeatured",
            "createdAt", "updatedAt"
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15, $16, 'Sq.Ft.', $17, $18, $19, $20, true,
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
            listingType,
            status,
            publishStatus,
            description,
            locationRaw,
            numPrice > 0 ? numPrice : null,
            rent && rent > 0 ? rent : null,
            floor || null,
            furnishing || null,
            parking,
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

export async function DELETE(req: NextRequest) {
  try {
    await query(`DELETE FROM "PropertyImage";`).catch(() => {});
    await query(`DELETE FROM "PropertyDocument";`).catch(() => {});
    await query(`DELETE FROM "PropertyAmenity";`).catch(() => {});
    await query(`DELETE FROM "FeaturedProperty";`).catch(() => {});
    await query(`DELETE FROM "BlogProperty";`).catch(() => {});
    await query(`UPDATE "WebsiteEnquiry" SET "propertyId" = NULL WHERE "propertyId" IS NOT NULL;`).catch(() => {});

    const deleted = await query(`DELETE FROM "Property" RETURNING id;`);
    const count = deleted.length;

    return NextResponse.json({
      success: true,
      message: `Successfully deleted all ${count} properties from database.`,
      deletedCount: count
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/properties/bulk error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to delete properties"
    }, { status: 500 });
  }
}

