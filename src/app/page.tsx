import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { HomepageSearchablePortal, PropertyItem, BlogItem } from "@/components/public/HomepageSearchablePortal";
import { query } from "@/lib/db";

const fallbackProperties: PropertyItem[] = [
  {
    id: "1",
    name: "VTP Altair Residences",
    developer: "VTP Realty",
    locality: "Baner",
    location: "Baner, Pune, Maharashtra",
    price: "₹1.49 Cr",
    priceRaw: 14900000,
    priceSuffix: "All Inclusive",
    bhk: "3 BHK",
    bhkNum: 3,
    sqft: "1,146 Sq.Ft. Carpet",
    sqftNum: 1146,
    status: "Under-Construction (Mar '26)",
    reraNumber: "PRM/PUN/RERA/2026/0491",
    rpsStatus: "RPS & MahaRERA Registered",
    description: "VTP Altair Residences is an institutional-grade luxury residential enclave situated in prime Baner. Features east-facing panoramic sky suites with floor-to-ceiling double-glazed fenestrations, grand clubhouse, and zero-compromise acoustic isolation.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["RPS / RERA Verified", "Vastu Compliant", "Private Balcony"],
    featured: true,
    label: "Top Choice",
    score: "9.4/10"
  },
  {
    id: "2",
    name: "The Sovereign Horizon Estate",
    developer: "Sovereign Luxury Collection",
    locality: "Kalyani Nagar",
    location: "Kalyani Nagar, Pune, Maharashtra",
    price: "₹2.10 Cr",
    priceRaw: 21000000,
    priceSuffix: "All Inclusive",
    bhk: "4 BHK",
    bhkNum: 4,
    sqft: "1,400 Sq.Ft. Carpet",
    sqftNum: 1400,
    status: "Ready to Move",
    reraNumber: "PRM/PUN/RERA/2026/0812",
    rpsStatus: "RPS & MahaRERA Registered",
    description: "The Sovereign Horizon Estate offers an uncompromising private sanctuary in prestigious Kalyani Nagar. Spacious 4 BHK layout featuring bespoke Italian marble, temperature-controlled master ensuite, and private lift access lobby.",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["RPS / RERA Verified", "OC Received", "Private Deck"],
    featured: true,
    label: "Ready Possession",
    score: "9.6/10"
  },
  {
    id: "3",
    name: "Kohinoor Presidentia",
    developer: "Kohinoor Group",
    locality: "Bavdhan",
    location: "Bavdhan, Pune, Maharashtra",
    price: "₹1.28 Cr",
    priceRaw: 12800000,
    priceSuffix: "All Inclusive",
    bhk: "3 BHK",
    bhkNum: 3,
    sqft: "1,050 Sq.Ft. Carpet",
    sqftNum: 1050,
    status: "Under-Construction (Dec '25)",
    reraNumber: "PRM/PUN/RERA/2026/0334",
    rpsStatus: "RPS & MahaRERA Registered",
    description: "Kohinoor Presidentia brings refined luxury living to prime Bavdhan. Thoughtfully designed 3 BHK homes featuring 3-side open ventilation, unobstructed Sahyadri hill views, and comprehensive lifestyle amenities.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["RPS / RERA Verified", "Green Hill Views", "Clubhouse"],
    featured: false,
    label: "Fast Selling",
    score: "8.9/10"
  },
  {
    id: "4",
    name: "Godrej Hillside Reserve",
    developer: "Godrej Properties",
    locality: "Mahalunge",
    location: "Mahalunge, Pune, Maharashtra",
    price: "₹1.65 Cr",
    priceRaw: 16500000,
    priceSuffix: "All Inclusive",
    bhk: "3 BHK",
    bhkNum: 3,
    sqft: "1,180 Sq.Ft. Carpet",
    sqftNum: 1180,
    status: "Under-Construction (Jun '26)",
    reraNumber: "PRM/PUN/RERA/2026/0995",
    rpsStatus: "RPS & MahaRERA Registered",
    description: "Godrej Hillside Reserve offers holistic resort-style living nestled amid lush nature. 400+ manicured trees on the elevated podium, Olympic-length pool, and IGBC Gold rated eco-engineering.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["RPS / RERA Verified", "IGBC Gold Certified", "Resort Amenities"],
    featured: false,
    label: "Eco Sanctuary",
    score: "9.1/10"
  },
  {
    id: "5",
    name: "ANV Heights Sky Suite",
    developer: "ANV Signature Partner",
    locality: "Baner",
    location: "Baner Western Corridor, Pune, Maharashtra",
    price: "₹1.85 Cr",
    priceRaw: 18500000,
    priceSuffix: "All Inclusive",
    bhk: "3 BHK",
    bhkNum: 3,
    sqft: "1,250 Sq.Ft. Carpet",
    sqftNum: 1250,
    status: "Under-Construction (Mar '26)",
    reraNumber: "PRM/PUN/RERA/2026/0124",
    rpsStatus: "RPS & MahaRERA Registered",
    description: "Tower B corner 3 BHK sky suite boasting dual master suites, smart home automation, high-speed elevators, and 2 dedicated automated parking slots in prime Baner.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["RPS / RERA Verified", "Corner Unit", "Subvention Scheme"],
    featured: true,
    label: "Exclusive",
    score: "9.5/10"
  },
  {
    id: "6",
    name: "Shivajinagar Embassy Penthouse",
    developer: "Emirates Sovereign Assets",
    locality: "Shivajinagar",
    location: "Shivajinagar, Model Colony, Pune",
    price: "₹6.50 Cr",
    priceRaw: 65000000,
    priceSuffix: "Trophy Asset",
    bhk: "4.5+ BHK Penthouse",
    bhkNum: 5,
    sqft: "4,100 Sq.Ft. Carpet",
    sqftNum: 4100,
    status: "Ready to Move",
    reraNumber: "PRM/PUN/RERA/2026/0001",
    rpsStatus: "RPS & MahaRERA Registered",
    description: "Trophy penthouse residence overlooking Model Colony and city panorama. Private plunge pool on terrace, dedicated 4-car private garage, and direct biometric elevator access.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["RPS / RERA Verified", "Private Pool", "360° Panorama"],
    featured: true,
    label: "Trophy Penthouse",
    score: "9.9/10"
  }
];

const fallbackInsights: BlogItem[] = [
  {
    id: "1",
    title: "Baner Property Market Guide: 2026 Price Appreciation",
    description: "An in-depth analysis of property trends in Baner and what to expect in the next 3 years based on upcoming infrastructure and metro expansions.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Market Report",
    locality: "Baner",
    connectedTypology: "3 BHK Luxury",
    readTime: "6 min read",
    author: "Vikram Malhotra"
  },
  {
    id: "2",
    title: "Guide to Buying a 3 BHK Apartment in Pune: Costs & Taxes",
    description: "Everything you need to know about stamp duty, registration charges, GST implications, and hidden costs to watch out for in Baner and Balewadi.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Buying Guide",
    locality: "Pune",
    connectedTypology: "3 BHK",
    readTime: "8 min read",
    author: "Rohit Sharma"
  },
  {
    id: "3",
    title: "Checklist Before Buying an Under-Construction Home: RPS & RERA Rules",
    description: "Ensure you check all legal compliance, MahaRERA & RPS registration details, developer escrow accounts, and structural sanction certificates.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Legal & RERA",
    locality: "Maharashtra",
    connectedTypology: "Under-Construction",
    readTime: "5 min read",
    author: "Legal Advisory Desk"
  },
  {
    id: "4",
    title: "Kalyani Nagar vs Koregaon Park: Luxury Real Estate & Riverfront Enclaves",
    description: "Comparing high-end riverfront developments, price trends per sq.ft., and lifestyle amenities in Eastern Pune's most coveted corridors.",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Market Report",
    locality: "Kalyani Nagar",
    connectedTypology: "4 BHK",
    readTime: "7 min read",
    author: "ANV Research Team"
  },
  {
    id: "5",
    title: "Bavdhan & Mahalunge: Western Pune's Highest Capital Growth Hotspots",
    description: "Connectivity to Hinjewadi IT park, green hill views, and planned ring road infrastructure driving double-digit capital appreciation.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Market Report",
    locality: "Bavdhan",
    connectedTypology: "3 BHK",
    readTime: "5 min read",
    author: "ANV Intelligence Unit"
  },
  {
    id: "6",
    title: "Shivajinagar & Model Colony: The Ultimate Guide to Trophy Penthouses",
    description: "Why ultra-high-net-worth investors and industrialists prioritize central heritage corridors with unrestricted skyline terraces.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Buying Guide",
    locality: "Shivajinagar",
    connectedTypology: "4.5+ BHK Penthouse",
    readTime: "9 min read",
    author: "Aditi Roy"
  }
];

export default async function Home() {
  let properties: PropertyItem[] = fallbackProperties;
  let insights: BlogItem[] = fallbackInsights;

  try {
    // 1. Fetch live properties from PostgreSQL database
    const dbProps = await query(`
      SELECT 
        p.id, p.title as name, p.description, p.address as location,
        p.price, p."carpetArea" as sqft_num, p.bedrooms as bhk_num, p.status, p."isFeatured" as featured,
        COALESCE(proj.developer, 'ANV Verified Developer') as developer,
        COALESCE(proj."reraNumber", 'PRM/PUN/RERA/2026/0491') as rera_number,
        COALESCE(loc.name, 'Koregaon Park') as locality,
        COALESCE(pt.name, 'Apartment') as type_name,
        COALESCE(img.url, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80') as image
      FROM "Property" p
      LEFT JOIN "Project" proj ON p."projectId" = proj.id
      LEFT JOIN "Location" loc ON p."locationId" = loc.id
      LEFT JOIN "PropertyType" pt ON p."propertyTypeId" = pt.id
      LEFT JOIN LATERAL (
        SELECT url FROM "PropertyImage" WHERE "propertyId" = p.id ORDER BY "sortOrder" ASC LIMIT 1
      ) img ON true
      WHERE p."publishStatus" = 'Published'
      ORDER BY p."isFeatured" DESC, p."createdAt" DESC;
    `);

    if (dbProps && dbProps.length > 0) {
      properties = dbProps.map((p: any) => {
        const numPrice = Number(p.price) || 15000000;
        const formattedPrice =
          numPrice >= 10000000
            ? `₹${(numPrice / 10000000).toFixed(2)} Cr`
            : `₹${(numPrice / 100000).toFixed(1)} Lakh`;

        const isCommercial =
          (p.type_name && p.type_name.toLowerCase().includes('commercial')) ||
          (p.name && (p.name.toLowerCase().includes('commercial') || p.name.toLowerCase().includes('office'))) ||
          p.bhk_num === null ||
          p.bhk_num === 0;

        const bhkStr = isCommercial
          ? "Commercial Office"
          : (p.bhk_num ? `${p.bhk_num} BHK` : "3 BHK");

        const sqftStr = p.sqft_num ? `${Number(p.sqft_num).toLocaleString()} Sq.Ft. Carpet` : "1,200 Sq.Ft. Carpet";

        const defaultDesc = isCommercial
          ? `Grade-A corporate office space in ${p.locality}, Pune. Landmark business address with optimized workspace efficiency and airport corridor connectivity.`
          : `Spacious and luxurious ${bhkStr} residence in ${p.locality}. High floor inventory with scenic skyline views.`;

        const tags = isCommercial
          ? ["Grade-A Tower", "Warm Shell", "Airport & KP Connectivity", "100% DG Backup"]
          : ["RPS / RERA Verified", "Vastu Compliant", "Private Balcony"];

        const label = isCommercial
          ? "Commercial Landmark"
          : (p.featured ? "Top Choice" : "New Launch");

        return {
          id: String(p.id),
          name: p.name,
          developer: p.developer,
          locality: p.locality,
          location: p.location || `${p.locality}, Pune, Maharashtra`,
          price: formattedPrice,
          priceRaw: numPrice,
          priceSuffix: "All Inclusive",
          bhk: bhkStr,
          bhkNum: p.bhk_num || 0,
          sqft: sqftStr,
          sqftNum: Number(p.sqft_num) || 1200,
          status: p.status || "Ready to Move",
          reraNumber: p.rera_number || (isCommercial ? "PRM/PUN/COM/2026/0882" : "PRM/PUN/RERA/2026/0491"),
          rpsStatus: isCommercial ? "RPS Verified Commercial" : "RPS & MahaRERA Registered",
          description: p.description || defaultDesc,
          image: p.image,
          tags,
          featured: !!p.featured,
          label,
          score: isCommercial ? "9.5/10" : "9.2/10",
          isCommercial
        };
      });
    }

    // 2. Fetch live blogs from PostgreSQL database
    const dbBlogs = await query(`
      SELECT 
        b.id, b.title, COALESCE(b.excerpt, b.content) as description,
        COALESCE(b."featuredImage", 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80') as image,
        COALESCE(c.name, 'Market Report') as category,
        COALESCE(b."authorName", 'ANV Research') as author
      FROM "Blog" b
      LEFT JOIN "BlogCategory" c ON b."categoryId" = c.id
      ORDER BY b."createdAt" DESC
      LIMIT 6;
    `);

    if (dbBlogs && dbBlogs.length > 0) {
      insights = dbBlogs.map((b: any) => ({
        id: String(b.id),
        title: b.title,
        description: b.description,
        image: b.image,
        category: b.category,
        author: b.author,
        readTime: "6 min read"
      }));
    }
  } catch (error) {
    console.log("Database connection fallback to curated properties & insights:", error);
  }

  // 3. Dynamic Filter Options: automatically increase as per products in database
  const dynamicLocalitiesSet = new Set<string>([
    "Koregaon Park",
    "Baner",
    "Balewadi",
    "Kalyani Nagar",
    "Bavdhan",
    "Mahalunge",
    "Shivajinagar",
    "Kharadi",
    "Worli",
    "Hinjewadi",
    "Wakad"
  ]);

  const dynamicTypologiesList = [
    { value: "Commercial Office", label: "Commercial Office Space" },
    { value: "1 BHK", label: "1 BHK" },
    { value: "2 BHK", label: "2 BHK" },
    { value: "3 BHK", label: "3 BHK" },
    { value: "4 BHK", label: "4 BHK" },
    { value: "4.5+ BHK Penthouse", label: "4.5+ BHK Penthouse" }
  ];

  const dynamicStatusesSet = new Set<string>([
    "Ready to Move",
    "Under-Construction",
    "Newly Launched"
  ]);

  try {
    const [dbLocs, dbTypes, dbStatuses] = await Promise.all([
      query(`SELECT DISTINCT name FROM "Location" WHERE name IS NOT NULL AND TRIM(name) != '' ORDER BY name ASC;`),
      query(`SELECT DISTINCT name FROM "PropertyType" WHERE name IS NOT NULL AND TRIM(name) != '' ORDER BY name ASC;`),
      query(`SELECT DISTINCT status FROM "Property" WHERE status IS NOT NULL AND TRIM(status) != '' AND status != 'Draft';`)
    ]);

    dbLocs?.forEach((r: any) => {
      if (r.name && r.name.trim()) dynamicLocalitiesSet.add(r.name.trim());
    });

    properties.forEach((p) => {
      if (p.locality && p.locality.trim()) dynamicLocalitiesSet.add(p.locality.trim());
    });

    const seenTypes = new Set(dynamicTypologiesList.map((t) => t.value.toLowerCase()));
    dbTypes?.forEach((r: any) => {
      const name = r.name?.trim();
      if (name && !seenTypes.has(name.toLowerCase()) && !name.toLowerCase().includes("commercial")) {
        seenTypes.add(name.toLowerCase());
        dynamicTypologiesList.push({ value: name, label: name });
      }
    });

    dbStatuses?.forEach((r: any) => {
      if (r.status && r.status.trim()) dynamicStatusesSet.add(r.status.trim());
    });

    properties.forEach((p) => {
      if (p.status && p.status.trim()) dynamicStatusesSet.add(p.status.trim());
    });
  } catch (err) {
    console.log("Filter options query fallback:", err);
  }

  const initialFilterOptions = {
    localities: Array.from(dynamicLocalitiesSet),
    typologies: dynamicTypologiesList,
    statuses: Array.from(dynamicStatusesSet),
    priceRanges: [
      { value: "Under ₹1.5 Cr", label: "Under ₹1.5 Cr" },
      { value: "₹1.5 Cr - ₹2.5 Cr", label: "₹1.5 Cr - ₹2.5 Cr" },
      { value: "₹2.5 Cr - ₹4.0 Cr", label: "₹2.5 Cr - ₹4.0 Cr" },
      { value: "₹4.0 Cr+", label: "₹4.0 Cr+ (Ultra-Luxury)" }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900">
      {/* 1. Header with Login & Consultation Integration */}
      <PublicHeader />

      {/* 2. Interactive Searchable Portal with Upper Filtration Dropdowns & Card-in-Card Results */}
      <div className="flex-1 flex flex-col">
        <HomepageSearchablePortal
          initialProperties={properties}
          initialBlogs={insights}
          initialFilterOptions={initialFilterOptions}
        />
      </div>

      {/* 3. Luxury Portal Footer */}
      <footer className="bg-zinc-950 text-zinc-400 py-10 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="bg-amber-600 text-black font-black p-1.5 rounded-lg text-xs tracking-wider">AR</div>
              <span className="font-bold text-lg text-white tracking-tight">ANV REEALITY</span>
            </Link>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-medium text-zinc-400">
              <Link href="/login" className="hover:text-amber-400 transition">Patron Portal</Link>
              <Link href="/admin" className="hover:text-amber-400 transition">Website Admin</Link>
              <Link href="/crm" className="hover:text-amber-400 transition text-amber-500 font-bold">Enterprise CRM</Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-zinc-500">
            <p>
              &copy; {new Date().getFullYear()} Anv Reeality. Verified properties across Pune.
            </p>
            <p className="text-[11px] text-zinc-600">
              MahaRERA & RPS Verified &bull; Zero Brokerage on Developer Inventory
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
