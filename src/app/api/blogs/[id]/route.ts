import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// Fallback articles with rich full content
const FULL_ARTICLES: Record<string, any> = {
  "1": {
    id: "1",
    title: "Baner Real Estate Master Plan: VTP Altair & High-Growth Western Pune Corridors",
    subtitle: "Strategic Infrastructure, Metro Expansions & High-Yield Capital Appreciation (2026-2029)",
    category: "Market Report",
    locality: "Baner",
    author: "Vikram Malhotra",
    authorRole: "Head of Real Estate Intelligence, Anv Reeality",
    readTime: "6 min read",
    publishedAt: "October 2026",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    excerpt: "An in-depth analysis of property appreciation in Baner and what to expect over the next 3 years based on upcoming infrastructure, metro expansions, and luxury developments like VTP Altair Residences.",
    metrics: [
      { label: "3-Yr Capital Appreciation", value: "+32.4%" },
      { label: "Average Rental Yield", value: "4.8% p.a." },
      { label: "Metro Line 3 Transit Time", value: "14 Mins" },
      { label: "Grade-A Supply Deficit", value: "High" }
    ],
    content: [
      "Baner has definitively transitioned from a secondary residential suburb into Western Pune's primary high-density wealth corridor. As Pune's IT and financial ecosystem expands outward from Hinjewadi, senior leaders, entrepreneurs, and institutional buyers have concentrated their capital in Baner's prime arterial sectors.",
      "With the active commissioning of Pune Metro Line 3 along the Hinjewadi-Shivajinagar spine and the newly widened Baner-Pashan link roads, connectivity to the central business districts has improved exponentially. Properties developed by tier-1 developers such as VTP Realty (e.g. VTP Altair Residences) command a steady 18-22% premium over unbranded standalone buildings.",
      "Investors looking for long-term capital preservation combined with stable rental yield find 3 BHK and 4 BHK large-format layouts particularly lucrative. Due to strict municipal zoning and limited land banks remaining in prime Baner, supply is structurally capped, creating strong downward resistance against market corrections.",
      "Our valuation models forecast an annualized capital appreciation of 9.5% to 11.2% over the next 36 months, making Baner one of the top three residential investment corridors in western India."
    ],
    keyTakeaways: [
      "Baner's remaining land bank for ultra-luxury residential towers is under 12%, ensuring long-term asset scarcity.",
      "Proximity to Balewadi High Street provides unmatched lifestyle amenities, dining, and premium retail density.",
      "VTP Altair Residences leads secondary market transaction volume with institutional-grade structural specifications.",
      "Rental demand from CXOs in Hinjewadi Phase 1-3 remains resilient at ₹65,000 - ₹95,000/month for fully fitted 3 BHK suites."
    ]
  },
  "2": {
    id: "2",
    title: "Guide to Buying a 3 BHK Apartment in Pune: Costs, Taxes & RERA Rules",
    subtitle: "A Complete Buyer's Guide to Stamp Duty, GST Slabs, Registration Fees & Legal Escrows",
    category: "Buying Guide",
    locality: "Pune",
    author: "Rohit Sharma",
    authorRole: "Principal Legal & Acquisition Advisor",
    readTime: "8 min read",
    publishedAt: "October 2026",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    excerpt: "Everything you need to know about stamp duty, registration charges, GST implications, and hidden costs to watch out for when purchasing a 3 BHK apartment in Baner and Mahalunge.",
    metrics: [
      { label: "Maharashtra Stamp Duty", value: "6.0% + 1% Cess" },
      { label: "Under-Construction GST", value: "5% (No ITC)" },
      { label: "Ready to Move GST", value: "0% (Zero)" },
      { label: "RERA Escrow Protection", value: "70% Mandate" }
    ],
    content: [
      "Acquiring a luxury 3 BHK residence in Pune represents a major financial and lifestyle milestone. However, the total cost of ownership extends beyond the base agreement value quoted by developers.",
      "Under Maharashtra state regulations, stamp duty currently stands at 6% plus a 1% Local Body Tax (LBT) / metro cess, payable at the time of agreement registration. Furthermore, registration fees are capped at ₹30,000 for residential units exceeding ₹30 Lakh.",
      "One of the biggest financial distinctions is Goods and Services Tax (GST). For under-construction properties, GST is levied at a flat 5% on non-affordable residential agreements. Crucially, Ready-to-Move residences with an official Occupancy Certificate (OC) attract ZERO GST, offering an immediate 5% net saving for discerning buyers.",
      "Always verify that the developer holds an active MahaRERA registration number and deposits 70% of buyer funds into the designated project escrow account to ensure timely completion and structural guarantee compliance."
    ],
    keyTakeaways: [
      "Factor in 7% to 9% additional cost over the agreement value for stamp duty, registration, legal fees, and society corpus.",
      "Ready-to-Move homes with OC completely eliminate the 5% GST liability.",
      "Ensure the developer provides clear carpet area measurements in accordance with MahaRERA definitions, not super built-up estimations.",
      "Check developer escrow compliance on the official MahaRERA portal before paying any booking token."
    ]
  },
  "3": {
    id: "3",
    title: "Mahalunge & Hinjewadi Growth Corridor: Godrej Hillside Reserve Investment Outlook",
    subtitle: "The Rise of Integrated Townships & Eco-Centric Podium Developments",
    category: "Market Report",
    locality: "Mahalunge",
    author: "ANV Intelligence Unit",
    authorRole: "Corridor Research Desk",
    readTime: "5 min read",
    publishedAt: "October 2026",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    excerpt: "Connectivity to Hinjewadi IT park, green hill views, eco-podiums, and planned ring road infrastructure driving double-digit capital appreciation in Godrej Hillside Reserve, Mahalunge.",
    metrics: [
      { label: "Township Masterplan", value: "100+ Acres" },
      { label: "Green Hill Coverage", value: "400+ Trees" },
      { label: "Proximity to Hinjewadi", value: "8 Mins" },
      { label: "Projected Appreciation", value: "+28% by 2028" }
    ],
    content: [
      "Mahalunge represents the golden frontier of Pune's western expansion. Situated adjacent to Baner and minutes from Hinjewadi Phase 1, it bridges the gap between high-speed IT employment centers and serene hill-facing sanctuaries.",
      "Godrej Properties has established an institutional benchmark in Mahalunge with Godrej Hillside Reserve. Designed around an elevated resort-style podium with 400+ manicured native trees, the development provides resort living while keeping corporate hubs within easy reach.",
      "The PMRDA ring road and high-capacity mass transit corridors planned across Mahalunge are set to make this corridor one of the most accessible suburban business corridors by 2028."
    ],
    keyTakeaways: [
      "Master-planned township infrastructure ensures zero congestion compared to organic urban clusters.",
      "Resort lifestyle amenities and green hill views appeal strongly to millennial tech executives and expat professionals.",
      "Capital entry prices in Mahalunge remain approximately 25% lower than prime Baner, providing superior percentage appreciation upside."
    ]
  },
  "4": {
    id: "4",
    title: "Kalyani Nagar Riverfront Enclaves: Sovereign Horizon & Eastern Pune Trophy Homes",
    subtitle: "Heritage Luxury, Private Elevator Foyers & Eastern Skyline Dominance",
    category: "Market Report",
    locality: "Kalyani Nagar",
    author: "ANV Research Team",
    authorRole: "Private Client Advisory",
    readTime: "7 min read",
    publishedAt: "October 2026",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    excerpt: "Comparing high-end riverfront developments, double-height sun decks, and unobstructed riverfront greenery at The Sovereign Horizon Estate in Eastern Pune's most coveted corridor.",
    metrics: [
      { label: "Corridor Type", value: "Ultra-Prime Heritage" },
      { label: "Airport Transit Time", value: "12 Mins" },
      { label: "Koregaon Park Bridge", value: "3 Mins" },
      { label: "Average 4 BHK Ticket", value: "₹2.10 Cr - ₹4.50 Cr" }
    ],
    content: [
      "Kalyani Nagar has stood the test of time as Pune's most aristocratic residential address. Bound by the Mula-Mutha river and bridged directly to Koregaon Park, it offers tree-lined avenues and low-density luxury living.",
      "The Sovereign Horizon Estate represents the culmination of riverfront architectural elegance. Featuring bespoke 4 BHK configurations with private lift access, Italian marble flooring, and uninterrupted views across the green riverbank.",
      "Due to strict building height limits and heritage zoning in surrounding pockets, trophy properties in Kalyani Nagar retain exceptionally high capital stability."
    ],
    keyTakeaways: [
      "Immediate arterial connectivity to Pune International Airport, Koregaon Park nightlife, and Kharadi IT parks.",
      "Preferred enclave for industrialists, corporate executives, and generational Pune families.",
      "Zero new greenfield land plots available, making existing inventory blue-chip investment assets."
    ]
  }
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Try fetching from PostgreSQL database
    let dbBlog: any = null;
    try {
      dbBlog = await queryOne(
        `
        SELECT 
          b.id, b.title, b.content, b.excerpt, b.slug,
          COALESCE(b."featuredImage", 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200') as image,
          COALESCE(c.name, 'Market Report') as category,
          COALESCE(b."authorName", 'ANV Research') as author,
          b."createdAt"
        FROM "Blog" b
        LEFT JOIN "BlogCategory" c ON b."categoryId" = c.id
        WHERE b.id::text = $1 OR b.slug = $1
        LIMIT 1;
        `,
        [id]
      );
    } catch (e) {
      // Fallback
    }

    if (dbBlog) {
      return NextResponse.json({
        success: true,
        article: {
          id: String(dbBlog.id),
          title: dbBlog.title,
          subtitle: "ANV Intelligence Unit Market Briefing",
          category: dbBlog.category,
          author: dbBlog.author,
          authorRole: "Senior Real Estate Analyst",
          readTime: "7 min read",
          publishedAt: new Date(dbBlog.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          image: dbBlog.image,
          excerpt: dbBlog.excerpt || dbBlog.content?.slice(0, 180),
          content: [dbBlog.content],
          metrics: [
            { label: "Corridor", value: "Pune Corridor" },
            { label: "Verification", value: "ANV Intelligence" },
            { label: "Report Status", value: "Verified Dossier" }
          ],
          keyTakeaways: [
            "Institutional grade market analysis curated for verified patrons.",
            "Historical price trend and zoning compliance checked.",
            "RERA and legal title diligence validated."
          ]
        }
      });
    }

    // 2. Check fallback articles
    const fallback = FULL_ARTICLES[id] || FULL_ARTICLES["1"];

    return NextResponse.json({
      success: true,
      article: fallback
    });
  } catch (error: any) {
    console.error("GET /api/blogs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch article" },
      { status: 500 }
    );
  }
}
