import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export interface BlogData {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  locality: string;
  connectedTypology: string;
  connectedProperty?: string;
  readTime: string;
  author: string;
}

const DEFAULT_BLOGS: BlogData[] = [
  {
    id: "1",
    title: "Baner Real Estate Master Plan: VTP Altair & High-Growth Western Pune Corridors",
    description: "An in-depth analysis of property appreciation in Baner and what to expect over the next 3 years based on upcoming infrastructure, metro expansions, and luxury developments like VTP Altair Residences.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Market Report",
    locality: "Baner",
    connectedTypology: "3 BHK Luxury",
    connectedProperty: "VTP Altair Residences",
    readTime: "6 min read",
    author: "Unassigned"
  },
  {
    id: "2",
    title: "Guide to Buying a 3 BHK Apartment in Pune: Costs, Taxes & RERA Rules",
    description: "Everything you need to know about stamp duty, registration charges, GST implications, and hidden costs to watch out for when purchasing a 3 BHK apartment in Baner and Mahalunge.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Buying Guide",
    locality: "Pune",
    connectedTypology: "3 BHK",
    connectedProperty: "3 BHK Luxury Residences",
    readTime: "8 min read",
    author: "Rohit Sharma"
  },
  {
    id: "3",
    title: "Mahalunge & Hinjewadi Growth Corridor: Godrej Hillside Reserve Investment Outlook",
    description: "Connectivity to Hinjewadi IT park, green hill views, eco-podiums, and planned ring road infrastructure driving double-digit capital appreciation in Godrej Hillside Reserve, Mahalunge.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Market Report",
    locality: "Mahalunge",
    connectedTypology: "3 BHK",
    connectedProperty: "Godrej Hillside Reserve",
    readTime: "5 min read",
    author: "ANV Intelligence Unit"
  },
  {
    id: "4",
    title: "Kalyani Nagar Riverfront Enclaves: Sovereign Horizon & Eastern Pune Trophy Homes",
    description: "Comparing high-end riverfront developments, double-height sun decks, and unobstructed riverfront greenery at The Sovereign Horizon Estate in Eastern Pune's most coveted corridor.",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Market Report",
    locality: "Kalyani Nagar",
    connectedTypology: "4 BHK",
    connectedProperty: "The Sovereign Horizon Estate",
    readTime: "7 min read",
    author: "ANV Research Team"
  },
  {
    id: "5",
    title: "Bavdhan Property Blueprint: Kohinoor Presidentia & Pune-Bangalore Corridor Yields",
    description: "Why investors and end-users are targeting Bavdhan: strategic highway access, scenic hills, top educational institutions, and high rental yield at Kohinoor Presidentia.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Market Report",
    locality: "Bavdhan",
    connectedTypology: "2 BHK",
    connectedProperty: "Kohinoor Presidentia",
    readTime: "5 min read",
    author: "ANV Intelligence Unit"
  },
  {
    id: "6",
    title: "The Architecture of Sky Penthouses: Panchshil Towers & Ultra-HNI Luxury Living",
    description: "Inside Pune's most iconic glass-facade penthouses. Double-height ceilings, Italian marble, private elevator foyers, and unrestricted skyline views atop Panchshil Towers.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Buying Guide",
    locality: "Baner",
    connectedTypology: "4.5+ BHK Penthouse",
    connectedProperty: "Panchshil Sky Penthouse",
    readTime: "9 min read",
    author: "Aditi Roy"
  },
  {
    id: "7",
    title: "Checklist Before Buying an Under-Construction Home: RPS & MahaRERA Rules",
    description: "Ensure you check legal compliance, developer escrow accounts, structural sanction certificates, and delivery milestones for under-construction residences.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Legal & RERA",
    locality: "Maharashtra",
    connectedTypology: "Under-Construction",
    connectedProperty: "Under-Construction Projects",
    readTime: "5 min read",
    author: "Legal Advisory Desk"
  },
  {
    id: "8",
    title: "Arabian Seafront Trophy Assets: Worli Seaface & Coastal Wealth Reallocation",
    description: "Ultra-exclusive presidential sky suites overlooking the Arabian Sea in Worli. Helipad access, private infinity pools, and prime real estate portfolio valuation.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Market Report",
    locality: "Worli",
    connectedTypology: "5 BHK",
    connectedProperty: "Worli Seaface Presidential Sky Suite",
    readTime: "10 min read",
    author: "Unassigned"
  },
  {
    id: "9",
    title: "Ready to Move Luxury Residences: Immediate Possession, OCs & Zero GST Advantages",
    description: "Comparing the financial and psychological advantages of Ready-to-Move luxury properties with verified Occupancy Certificates (OC) versus new launches in Pune.",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Buying Guide",
    locality: "Pune",
    connectedTypology: "Ready to Move",
    connectedProperty: "Ready to Move Residences",
    readTime: "6 min read",
    author: "Rohit Sharma"
  }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || searchParams.get("query") || "";
    const locality = searchParams.get("locality") || "";
    const bhk = searchParams.get("bhk") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const propertiesParam = searchParams.get("properties") || "";

    // Array of searched property names
    const searchedPropertyNames = propertiesParam
      ? propertiesParam.split(",").map((p) => p.trim().toLowerCase()).filter(Boolean)
      : [];

    let blogs: BlogData[] = [];

    try {
      let sql = `
        SELECT 
          b.id, b.title, COALESCE(b.excerpt, b.content) as description,
          COALESCE(b."featuredImage", 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80') as image,
          COALESCE(c.name, 'Market Report') as category,
          COALESCE(b."authorName", 'ANV Editorial Desk') as author,
          b.slug
        FROM "Blog" b
        LEFT JOIN "BlogCategory" c ON b."categoryId" = c.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIdx = 1;

      if (category && category !== "All" && category !== "All Categories") {
        sql += ` AND LOWER(COALESCE(c.name, '')) = $${paramIdx}`;
        params.push(category.toLowerCase());
        paramIdx++;
      }

      sql += ` ORDER BY b."createdAt" DESC LIMIT 12;`;
      const dbRows = await query(sql, params);

      if (dbRows && dbRows.length > 0) {
        blogs = dbRows.map((r: any) => ({
          id: String(r.id),
          title: r.title,
          description: r.description,
          image: r.image,
          category: r.category,
          author: r.author,
          locality: locality || "Pune",
          connectedTypology: bhk || "Verified Properties",
          connectedProperty: searchedPropertyNames[0] || undefined,
          readTime: "6 min read"
        }));
      }
    } catch (dbErr) {
      console.log("Blog table query fallback to curated default blogs:", dbErr);
    }

    // If database blogs are empty or we want to use the rich product-correlated catalog
    const baseBlogs = blogs.length > 0 ? blogs : DEFAULT_BLOGS;

    // --- Dynamic Product & Search Relevance Scoring Engine ---
    const scoredBlogs = baseBlogs.map((b) => {
      let score = 0;
      const bTitle = b.title.toLowerCase();
      const bDesc = b.description.toLowerCase();
      const bLoc = (b.locality || "").toLowerCase();
      const bTypo = (b.connectedTypology || "").toLowerCase();
      const bProp = (b.connectedProperty || "").toLowerCase();

      // 1. Exact match with searched products/properties (+100 points)
      for (const propName of searchedPropertyNames) {
        if (bProp.includes(propName) || propName.includes(bProp) || bTitle.includes(propName) || bDesc.includes(propName)) {
          score += 100;
        }
      }

      // 2. Locality match (+50 points)
      if (locality && locality !== "All") {
        const locLower = locality.toLowerCase();
        if (bLoc.includes(locLower) || bTitle.includes(locLower) || bDesc.includes(locLower)) {
          score += 50;
        }
      }

      // 3. Typology / BHK match (+40 points)
      if (bhk && bhk !== "All") {
        const bhkDigit = bhk.match(/\d+/)?.[0];
        if (bhkDigit && bTypo.includes(bhkDigit)) {
          score += 40;
        }
        if (bhk.toLowerCase().includes("penthouse") && (bTypo.includes("penthouse") || bTitle.includes("penthouse"))) {
          score += 45;
        }
      }

      // 4. Status match (+30 points)
      if (status && status !== "All") {
        const statusLower = status.toLowerCase();
        if (statusLower.includes("under") && (bTypo.includes("under") || bTitle.includes("under"))) {
          score += 30;
        }
        if (statusLower.includes("ready") && (bTypo.includes("ready") || bTitle.includes("ready"))) {
          score += 30;
        }
      }

      // 5. Search query keywords match (+20 points per keyword)
      if (search.trim()) {
        const searchWords = search
          .toLowerCase()
          .split(/[\s,]+/)
          .filter((w) => w.length > 2 && !["in", "the", "and", "for", "at", "to", "of", "with"].includes(w));

        for (const w of searchWords) {
          if (bTitle.includes(w) || bDesc.includes(w) || bProp.includes(w)) {
            score += 20;
          }
        }
      }

      // 6. Category match (+10 points)
      if (category && category !== "All") {
        if (b.category.toLowerCase() === category.toLowerCase()) {
          score += 10;
        }
      }

      return { blog: b, score };
    });

    // Filter by category if explicitly chosen
    let filtered = scoredBlogs;
    if (category && category !== "All" && category !== "All Categories") {
      filtered = filtered.filter((item) => item.blog.category.toLowerCase() === category.toLowerCase());
    }

    // Sort descending by relevance score
    filtered.sort((a, b) => b.score - a.score);

    // Return the top relevant blogs
    const finalBlogs = filtered.map((item) => item.blog);

    return NextResponse.json({
      success: true,
      count: finalBlogs.length,
      correlatedToProperties: searchedPropertyNames,
      blogs: finalBlogs
    });
  } catch (error: any) {
    console.error("GET /api/blogs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
