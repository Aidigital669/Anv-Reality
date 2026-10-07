import 'temporal-polyfill/full/global';
import fs from 'fs';
import postgres from '@prisma/orm-postgres/runtime';

// Parse .env.local
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

const contractJson = JSON.parse(fs.readFileSync('./prisma/schema.json', 'utf8'));

const client = postgres({
  contractJson,
  url: envVars.DATABASE_URL
});

async function seed() {
  console.log('--- Starting Database Seeding for ANV Realty ---');

  try {
    // 1. Roles
    let role = await client.orm.public.Role.where((r) => r.name.eq('SuperAdmin')).all().first();
    if (!role) {
      role = await client.orm.public.Role.create({
        name: 'SuperAdmin',
        description: 'Master administrative access across ANV Realty CMS'
      });
      console.log('Created SuperAdmin Role');
    }

    // 2. Admin User
    let admin = await client.orm.public.AdminUser.where((a) => a.email.eq('admin@anvrealty.com')).all().first();
    if (!admin) {
      admin = await client.orm.public.AdminUser.create({
        roleId: role.id,
        name: 'Rajesh Sharma',
        email: 'admin@anvrealty.com',
        passwordHash: 'admin123',
        phone: '+91 98200 11000',
        isActive: true
      });
      console.log('Created Admin User:', admin.email);
    }

    // 3. Property Types
    const propertyTypesData = [
      { name: 'Luxury Apartment', slug: 'luxury-apartment', description: 'High-rise residential apartments with luxury amenities' },
      { name: 'Sky Villa', slug: 'sky-villa', description: 'Exclusive duplex sky villas with private terrace pools' },
      { name: 'Signature Penthouse', slug: 'signature-penthouse', description: 'Top-floor penthouse suites with panoramic views' },
      { name: 'Independent Estate', slug: 'independent-estate', description: 'Standalone gated estates and bespoke villas' }
    ];

    const typeMap = {};
    for (const pt of propertyTypesData) {
      let existing = await client.orm.public.PropertyType.where((p) => p.slug.eq(pt.slug)).all().first();
      if (!existing) {
        existing = await client.orm.public.PropertyType.create(pt);
      }
      typeMap[pt.slug] = existing.id;
    }
    console.log('Property Types seeded:', Object.keys(typeMap).length);

    // 4. Locations
    const locationsData = [
      { name: 'Baner', slug: 'baner-pune', city: 'Pune', state: 'Maharashtra', country: 'India', description: 'Premium tech corridor and western luxury enclave' },
      { name: 'Kalyani Nagar', slug: 'kalyani-nagar-pune', city: 'Pune', state: 'Maharashtra', country: 'India', description: 'Affluent heritage neighborhood with lush river views' },
      { name: 'Bavdhan', slug: 'bavdhan-pune', city: 'Pune', state: 'Maharashtra', country: 'India', description: 'Scenic hillside valley with rapid luxury development' },
      { name: 'Mahalunge', slug: 'mahalunge-pune', city: 'Pune', state: 'Maharashtra', country: 'India', description: 'Next-generation mega township and green living' },
      { name: 'Koregaon Park', slug: 'koregaon-park-pune', city: 'Pune', state: 'Maharashtra', country: 'India', description: 'Iconic premier destination for Pune luxury lifestyle' },
      { name: 'Worli', slug: 'worli-mumbai', city: 'Mumbai', state: 'Maharashtra', country: 'India', description: 'Bespoke seaface towers and corporate elite sanctuaries' }
    ];

    const locMap = {};
    for (const loc of locationsData) {
      let existing = await client.orm.public.Location.where((l) => l.slug.eq(loc.slug)).all().first();
      if (!existing) {
        existing = await client.orm.public.Location.create(loc);
      }
      locMap[loc.slug] = existing.id;
    }
    console.log('Locations seeded:', Object.keys(locMap).length);

    // 5. Projects
    const projectsData = [
      {
        name: 'VTP Altair Residences',
        slug: 'vtp-altair-residences',
        developer: 'VTP Realty',
        summary: 'Iconic 30-storey luxury towers in prime Baner',
        status: 'Launched',
        locationId: locMap['baner-pune'],
        isFeatured: true,
        address: 'Baner-Pashan Link Road, Pune'
      },
      {
        name: 'The Sovereign Horizon Estate',
        slug: 'the-sovereign-horizon-estate',
        developer: 'Sovereign Luxury Collection',
        summary: 'Low-density riverfront sky residences in Kalyani Nagar',
        status: 'Ready to Move',
        locationId: locMap['kalyani-nagar-pune'],
        isFeatured: true,
        address: 'Central Avenue, Kalyani Nagar, Pune'
      },
      {
        name: 'Kohinoor Presidentia',
        slug: 'kohinoor-presidentia',
        developer: 'Kohinoor Development',
        summary: 'Ultra-modern hillside residential towers in Bavdhan',
        status: 'Under-Construction',
        locationId: locMap['bavdhan-pune'],
        isFeatured: false,
        address: 'Paud Road, Bavdhan, Pune'
      },
      {
        name: 'Godrej Hillside Reserve',
        slug: 'godrej-hillside-reserve',
        developer: 'Godrej Properties',
        summary: 'Resort-style eco luxury residences surrounded by 400+ trees',
        status: 'Under-Construction',
        locationId: locMap['mahalunge-pune'],
        isFeatured: false,
        address: 'Hinjawadi-Mahalunge Road, Pune'
      }
    ];

    const projectMap = {};
    for (const proj of projectsData) {
      let existing = await client.orm.public.Project.where((p) => p.slug.eq(proj.slug)).all().first();
      if (!existing) {
        existing = await client.orm.public.Project.create(proj);
      }
      projectMap[proj.slug] = existing.id;
    }
    console.log('Projects seeded:', Object.keys(projectMap).length);

    // 6. Properties
    const propertiesData = [
      {
        title: 'VTP Altair Residences',
        slug: 'vtp-altair-3bhk-baner',
        projectId: projectMap['vtp-altair-residences'],
        locationId: locMap['baner-pune'],
        propertyTypeId: typeMap['luxury-apartment'],
        listingType: 'Sale',
        status: "Under-Construction (Mar '26)",
        publishStatus: 'Published',
        description: 'VTP Altair Residences is a premium luxury residential project located in Baner. The project offers 2 and 3 BHK spacious apartments with private balconies, imported marble flooring, and smart home automation.',
        address: 'Baner, Pune, Maharashtra',
        price: '14900000',
        carpetArea: '1146',
        areaUnit: 'Sq.Ft.',
        bedrooms: 3,
        bathrooms: 3,
        parking: 2,
        isFeatured: true
      },
      {
        title: 'The Sovereign Horizon Estate',
        slug: 'the-sovereign-horizon-estate-kalyani-nagar',
        projectId: projectMap['the-sovereign-horizon-estate'],
        locationId: locMap['kalyani-nagar-pune'],
        propertyTypeId: typeMap['signature-penthouse'],
        listingType: 'Sale',
        status: 'Ready to Move',
        publishStatus: 'Published',
        description: 'The Sovereign Horizon Estate is a premium luxury residential sanctuary in Kalyani Nagar. Features private elevators, double-height sun decks, and unobstructed riverfront greenery.',
        address: 'Kalyani Nagar, Pune, Maharashtra',
        price: '21000000',
        carpetArea: '1400',
        areaUnit: 'Sq.Ft.',
        bedrooms: 4,
        bathrooms: 4,
        parking: 2,
        isFeatured: true
      },
      {
        title: 'Kohinoor Presidentia',
        slug: 'kohinoor-presidentia-bavdhan',
        projectId: projectMap['kohinoor-presidentia'],
        locationId: locMap['bavdhan-pune'],
        propertyTypeId: typeMap['luxury-apartment'],
        listingType: 'Sale',
        status: "Under-Construction (Dec '24)",
        publishStatus: 'Published',
        description: 'Kohinoor Presidentia brings you the true essence of luxury living in Bavdhan. Thoughtfully designed residences with cross ventilation and 50+ world-class lifestyle amenities.',
        address: 'Bavdhan, Pune, Maharashtra',
        price: '12800000',
        carpetArea: '850',
        areaUnit: 'Sq.Ft.',
        bedrooms: 2,
        bathrooms: 2,
        parking: 1,
        isFeatured: false
      },
      {
        title: 'Godrej Hillside Reserve',
        slug: 'godrej-hillside-reserve-mahalunge',
        projectId: projectMap['godrej-hillside-reserve'],
        locationId: locMap['mahalunge-pune'],
        propertyTypeId: typeMap['luxury-apartment'],
        listingType: 'Sale',
        status: "Under-Construction (Jun '25)",
        publishStatus: 'Published',
        description: 'Godrej Hillside Reserve offers resort-style living nestled in nature. Enjoy 400+ trees on the podium, Olympic-size sports arenas, and IGBC Gold rated green architecture.',
        address: 'Mahalunge, Pune, Maharashtra',
        price: '16500000',
        carpetArea: '950',
        areaUnit: 'Sq.Ft.',
        bedrooms: 3,
        bathrooms: 2,
        parking: 2,
        isFeatured: false
      },
      {
        title: 'Panchshil Towers Sky Penthouse',
        slug: 'panchshil-towers-sky-penthouse-kharadi',
        locationId: locMap['baner-pune'],
        propertyTypeId: typeMap['signature-penthouse'],
        listingType: 'Sale',
        status: 'Ready to Move',
        publishStatus: 'Published',
        description: 'Magnificent glass-facade 4 BHK Sky Penthouse atop Panchshil Towers. Double-height living room with Italian marble, VRF climate control, and concierge reception.',
        address: 'Kharadi, Pune, Maharashtra',
        price: '48000000',
        carpetArea: '3200',
        areaUnit: 'Sq.Ft.',
        bedrooms: 4,
        bathrooms: 5,
        parking: 3,
        isFeatured: true
      },
      {
        title: 'Worli Seaface Presidential Sky Suite',
        slug: 'worli-seaface-presidential-sky-suite-mumbai',
        locationId: locMap['worli-mumbai'],
        propertyTypeId: typeMap['sky-villa'],
        listingType: 'Sale',
        status: 'Ready to Move',
        publishStatus: 'Published',
        description: 'Ultra-exclusive 4 BHK residence overlooking the Arabian Sea in Worli. Helipad access, private infinity pool, and bespoke interior finishes by top European designers.',
        address: 'Worli Seaface, Mumbai, Maharashtra',
        price: '125000000',
        carpetArea: '4500',
        areaUnit: 'Sq.Ft.',
        bedrooms: 5,
        bathrooms: 6,
        parking: 4,
        isFeatured: true
      }
    ];

    for (const prop of propertiesData) {
      let existing = await client.orm.public.Property.where((p) => p.slug.eq(prop.slug)).all().first();
      if (!existing) {
        existing = await client.orm.public.Property.create(prop);
        console.log(`Created Property: "${existing.title}" (ID: ${existing.id})`);
      }
    }

    // 7. Homepage Sections
    const sectionsData = [
      {
        key: 'hero_banner',
        title: 'Hero Architectural Video Banner',
        subtitle: 'Headline: "Curated Sanctuaries for the Discerning Elite" • 4K Drone Footage',
        sortOrder: 1,
        isActive: true,
        content: { type: 'hero', tag: 'HERO', tagVariant: 'default' }
      },
      {
        key: 'search_bar',
        title: 'Property Omnisearch Bar',
        subtitle: 'BHK Filters, Price Range ₹Cr slider, Locality Autocomplete (Pune/Mumbai)',
        sortOrder: 2,
        isActive: true,
        content: { type: 'search', tag: 'INTERACTIVE', tagVariant: 'default' }
      },
      {
        key: 'featured_properties',
        title: 'Featured Luxury Residences',
        subtitle: 'Dynamic Bento Showcase featuring Signature Penthouses & Sky Villas',
        sortOrder: 3,
        isActive: true,
        content: { type: 'featured', tag: '4 PINNED', tagVariant: 'amber' }
      },
      {
        key: 'locations_hotspots',
        title: 'Micro-Market Hotspot Explorer',
        subtitle: 'Baner, Balewadi High Street, Koregaon Park, Worli Seaface',
        sortOrder: 4,
        isActive: true,
        content: { type: 'locations', tag: 'LOCATIONS', tagVariant: 'default' }
      },
      {
        key: 'brand_charter',
        title: 'Why ANV Architectural Charter',
        subtitle: 'Brand legacy, HNWI Advisory, NRI Concierge services value pillars',
        sortOrder: 5,
        isActive: true,
        content: { type: 'editorial', tag: 'EDITORIAL', tagVariant: 'default' }
      },
      {
        key: 'testimonials',
        title: 'Client Testimonials & Patrons',
        subtitle: 'Verified Buyer Stories, NRI Testimonials, Architectural Critics',
        sortOrder: 6,
        isActive: true,
        content: { type: 'testimonials', tag: 'SOCIAL PROOF', tagVariant: 'default' }
      },
      {
        key: 'market_insights',
        title: 'Curated Market Insights & Journal',
        subtitle: 'Baner appreciation trends, Luxury buyer index 2026, Tax guide',
        sortOrder: 7,
        isActive: true,
        content: { type: 'insights', tag: 'JOURNAL', tagVariant: 'default' }
      }
    ];

    for (const sec of sectionsData) {
      let existing = await client.orm.public.HomepageSection.where((s) => s.key.eq(sec.key)).all().first();
      if (!existing) {
        existing = await client.orm.public.HomepageSection.create(sec);
      }
    }
    console.log('Homepage Sections seeded: 7');

    console.log('=== Database Seeding Complete & Verified Successfully! ===');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    process.exit(0);
  }
}

seed();
