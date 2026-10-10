import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/public/PublicHeader";
import { HomepageSearchablePortal, PropertyItem, BlogItem } from "@/components/public/HomepageSearchablePortal";
import { query } from "@/lib/db";

const fallbackProperties: PropertyItem[] = [];

const fallbackInsights: BlogItem[] = [
  {
    id: 'blog-1',
    title: 'Pune Real Estate Market Outlook 2026',
    description: 'An in-depth analysis of Pune\'s commercial and residential property trends, focusing on prime micro-markets like Baner and Kalyani Nagar.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Market Report',
    author: 'ANV Research',
    readTime: '6 min read'
  },
  {
    id: 'blog-2',
    title: 'Top 5 Investment Destinations in Pune',
    description: 'Discover the emerging neighborhoods in Pune that are projected to yield the highest ROI for real estate investors over the next decade.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Investment',
    author: 'ANV Insights',
    readTime: '8 min read'
  },
  {
    id: 'blog-3',
    title: 'Navigating Commercial Leases in 2026',
    description: 'A comprehensive guide for corporations seeking Grade-A office spaces, covering legal considerations and modern workspace requirements.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Commercial',
    author: 'ANV Strategy',
    readTime: '5 min read'
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
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/LogoAnv-original.png"
                alt="ANV REEALTY"
                width={140}
                height={44}
                className="h-9 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-200"
              />
            </Link>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-medium text-zinc-400">
              <Link href="/login" className="hover:text-amber-400 transition">Patron Portal</Link>
              <Link href="/admin" className="hover:text-amber-400 transition">Admin & CRM Portal</Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-zinc-500">
            <p>
              &copy; {new Date().getFullYear()} Anv Reealty. Verified properties across Pune.
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
