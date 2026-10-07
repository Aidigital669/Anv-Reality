import fs from 'fs';
import pg from 'pg';

const envLocal = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envLocal.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim().replace(/^["']|["']$/g, '');
    envVars[key] = val;
  }
});

const client = new pg.Client({
  connectionString: envVars.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  await client.connect();
  console.log('Connected to Postgres Cloud Database.');

  // 1. Property Types
  console.log('Seeding Property Types...');
  await client.query(`
    INSERT INTO "PropertyType" (name, slug, description, "createdAt", "updatedAt")
    VALUES 
      ('Luxury Apartment', 'luxury-apartment', 'Ultra-luxury high rise apartments', NOW(), NOW()),
      ('Signature Penthouse', 'signature-penthouse', 'Top-floor sky penthouses with private decks', NOW(), NOW()),
      ('Sky Villa', 'sky-villa', 'Exclusive duplex sky residences', NOW(), NOW()),
      ('Independent Estate', 'independent-estate', 'Bespoke gated estates', NOW(), NOW())
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW();
  `);

  // 2. Locations
  console.log('Seeding Locations...');
  await client.query(`
    INSERT INTO "Location" (name, slug, city, state, country, description, "createdAt", "updatedAt")
    VALUES 
      ('Baner', 'baner-pune', 'Pune', 'Maharashtra', 'India', 'Premier western luxury enclave & IT hub', NOW(), NOW()),
      ('Kalyani Nagar', 'kalyani-nagar-pune', 'Pune', 'Maharashtra', 'India', 'Heritage affluent neighborhood with green riverfront', NOW(), NOW()),
      ('Bavdhan', 'bavdhan-pune', 'Pune', 'Maharashtra', 'India', 'Scenic hill-facing residential valley', NOW(), NOW()),
      ('Mahalunge', 'mahalunge-pune', 'Pune', 'Maharashtra', 'India', 'Future township & eco-luxury living', NOW(), NOW()),
      ('Koregaon Park', 'koregaon-park-pune', 'Pune', 'Maharashtra', 'India', 'Iconic cultural & luxury epicenter of Pune', NOW(), NOW()),
      ('Worli', 'worli-mumbai', 'Mumbai', 'Maharashtra', 'India', 'Ultra-prime seaface towers & business elite hub', NOW(), NOW())
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW();
  `);

  // 3. Projects
  console.log('Seeding Projects...');
  await client.query(`
    INSERT INTO "Project" (name, slug, developer, summary, status, address, "isFeatured", "createdAt", "updatedAt")
    VALUES 
      ('VTP Altair Residences', 'vtp-altair-residences', 'VTP Realty', 'Iconic 30-storey luxury towers in prime Baner', 'Launched', 'Baner-Pashan Link Road, Pune', true, NOW(), NOW()),
      ('The Sovereign Horizon Estate', 'the-sovereign-horizon-estate', 'Sovereign Luxury', 'Low-density riverfront sky residences in Kalyani Nagar', 'Ready to Move', 'Central Avenue, Kalyani Nagar, Pune', true, NOW(), NOW()),
      ('Kohinoor Presidentia', 'kohinoor-presidentia', 'Kohinoor Development', 'Modern hillside residential towers in Bavdhan', 'Under-Construction', 'Paud Road, Bavdhan, Pune', false, NOW(), NOW()),
      ('Godrej Hillside Reserve', 'godrej-hillside-reserve', 'Godrej Properties', 'Resort-style eco luxury residences surrounded by 400+ trees', 'Under-Construction', 'Hinjawadi-Mahalunge Road, Pune', false, NOW(), NOW())
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW();
  `);

  // 4. Properties
  console.log('Seeding Properties...');
  await client.query(`
    INSERT INTO "Property" (
      title, slug, "propertyTypeId", "listingType", status, "publishStatus", 
      description, address, price, "carpetArea", "areaUnit", bedrooms, bathrooms, "isFeatured", "createdAt", "updatedAt"
    )
    VALUES 
      (
        'VTP Altair Residences', 
        'vtp-altair-3bhk-baner', 
        1, 'Sale', 'Under-Construction (Mar ''26)', 'Published',
        'VTP Altair Residences is a premium luxury residential project located in Baner. 3 BHK spacious residences with private decks, Italian marble flooring, and smart automation.',
        'Baner, Pune, Maharashtra', 14900000, 1146, 'Sq.Ft.', 3, 3, true, NOW(), NOW()
      ),
      (
        'The Sovereign Horizon Estate', 
        'the-sovereign-horizon-kalyani-nagar', 
        2, 'Sale', 'Ready to Move', 'Published',
        'The Sovereign Horizon Estate is a premium luxury residential sanctuary in Kalyani Nagar. Features private elevators, double-height sun decks, and unobstructed riverfront greenery.',
        'Kalyani Nagar, Pune, Maharashtra', 21000000, 1400, 'Sq.Ft.', 4, 4, true, NOW(), NOW()
      ),
      (
        'Kohinoor Presidentia', 
        'kohinoor-presidentia-bavdhan', 
        1, 'Sale', 'Under-Construction (Dec ''24)', 'Published',
        'Kohinoor Presidentia brings you the true essence of luxury living in Bavdhan. Thoughtfully designed residences with cross ventilation and 50+ world-class lifestyle amenities.',
        'Bavdhan, Pune, Maharashtra', 12800000, 850, 'Sq.Ft.', 2, 2, false, NOW(), NOW()
      ),
      (
        'Godrej Hillside Reserve', 
        'godrej-hillside-reserve-mahalunge', 
        1, 'Sale', 'Under-Construction (Jun ''25)', 'Published',
        'Godrej Hillside Reserve offers resort-style living nestled in nature. Enjoy 400+ trees on the podium, multiple sports facilities, and IGBC Gold certified green homes.',
        'Mahalunge, Pune, Maharashtra', 16500000, 950, 'Sq.Ft.', 3, 2, false, NOW(), NOW()
      ),
      (
        'Panchshil Sky Penthouse', 
        'panchshil-sky-penthouse-kharadi', 
        2, 'Sale', 'Ready to Move', 'Published',
        'Magnificent glass-facade 4 BHK Sky Penthouse atop Panchshil Towers. Double-height living room with Italian marble, VRF climate control, and concierge reception.',
        'Kharadi, Pune, Maharashtra', 48000000, 3200, 'Sq.Ft.', 4, 5, true, NOW(), NOW()
      ),
      (
        'Worli Seaface Presidential Sky Suite', 
        'worli-seaface-presidential-mumbai', 
        3, 'Sale', 'Ready to Move', 'Published',
        'Ultra-exclusive 4 BHK residence overlooking the Arabian Sea in Worli. Helipad access, private infinity pool, and bespoke interior finishes by top European designers.',
        'Worli Seaface, Mumbai, Maharashtra', 125000000, 4500, 'Sq.Ft.', 5, 6, true, NOW(), NOW()
      )
    ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, price = EXCLUDED.price, "updatedAt" = NOW();
  `);

  // 5. Property Images
  console.log('Seeding Property Images...');
  const propRes = await client.query('SELECT id, slug FROM "Property";');
  const propMap = {};
  propRes.rows.forEach(r => propMap[r.slug] = r.id);

  const imagesData = [
    { slug: 'vtp-altair-3bhk-baner', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'VTP Altair Façade' },
    { slug: 'the-sovereign-horizon-kalyani-nagar', url: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'The Sovereign Horizon View' },
    { slug: 'kohinoor-presidentia-bavdhan', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Kohinoor Presidentia Clubhouse' },
    { slug: 'godrej-hillside-reserve-mahalunge', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Godrej Hillside Reserve Nature' },
    { slug: 'panchshil-sky-penthouse-kharadi', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Panchshil Penthouse Interior' },
    { slug: 'worli-seaface-presidential-mumbai', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Worli Seaface Skyline' }
  ];

  for (const img of imagesData) {
    const pid = propMap[img.slug];
    if (pid) {
      await client.query(`
        DELETE FROM "PropertyImage" WHERE "propertyId" = $1;
        INSERT INTO "PropertyImage" ("propertyId", url, "altText", "sortOrder", "isPrimary", "createdAt")
        VALUES ($1, $2, $3, 1, true, NOW());
      `, [pid, img.url, img.alt]);
    }
  }

  // 6. Homepage Sections
  console.log('Seeding Homepage Sections...');
  await client.query(`
    INSERT INTO "HomepageSection" (key, title, subtitle, "sortOrder", "isActive", content, "createdAt", "updatedAt")
    VALUES 
      ('hero_banner', 'Hero Architectural Video Banner', 'Headline: "Curated Sanctuaries for the Discerning Elite" • 4K Drone Footage', 1, true, '{"type": "hero"}', NOW(), NOW()),
      ('search_bar', 'Property Omnisearch Bar', 'BHK Filters, Price Range ₹Cr slider, Locality Autocomplete (Pune/Mumbai)', 2, true, '{"type": "search"}', NOW(), NOW()),
      ('featured_properties', 'Featured Luxury Residences', 'Dynamic Bento Showcase featuring Signature Penthouses & Sky Villas', 3, true, '{"type": "featured"}', NOW(), NOW()),
      ('locations_hotspots', 'Micro-Market Hotspot Explorer', 'Baner, Balewadi High Street, Koregaon Park, Worli Seaface', 4, true, '{"type": "locations"}', NOW(), NOW()),
      ('brand_charter', 'Why ANV Architectural Charter', 'Brand legacy, HNWI Advisory, NRI Concierge services value pillars', 5, true, '{"type": "editorial"}', NOW(), NOW()),
      ('testimonials', 'Client Testimonials & Patrons', 'Verified Buyer Stories, NRI Testimonials, Architectural Critics', 6, true, '{"type": "testimonials"}', NOW(), NOW()),
      ('market_insights', 'Curated Market Insights & Journal', 'Baner appreciation trends, Luxury buyer index 2026, Tax guide', 7, true, '{"type": "insights"}', NOW(), NOW())
    ON CONFLICT (key) DO UPDATE SET title = EXCLUDED.title, "isActive" = EXCLUDED."isActive", "updatedAt" = NOW();
  `);

  console.log('========================================================');
  console.log('🎉 REAL PROPERTY PORTFOLIO & SECTIONS SEEDED SUCCESSFULLY!');
  console.log('========================================================');

  await client.end();
}

seed().catch(err => {
  console.error('Master Seed Error:', err);
  process.exit(1);
});
