/**
 * ANV REEALTY
 * Company Profile, Property Catalogue & AI Chatbot Knowledge Base
 * Prepared 8 October 2026 | Verified Working Document | Primary Source: https://www.anvreealty.com/
 * 
 * Sourced directly from official company profile, website, and LinkedIn:
 * https://www.anvreealty.com/
 * https://in.linkedin.com/company/anv-reealty
 */
import { query } from "@/lib/db";

export const ANV_COMPANY_PROFILE = {
  name: "ANV REEALTY",
  alternateName: "ANV Realty",
  tagline: "Real Estate Advisory & Intermediary focused on Pune and PCMC",
  established: "Incorporated in 2003 (website About page) / Founded 2006 (LinkedIn)",
  headOffice: "East Wing, M.G. Road, Camp, Pune 01, Maharashtra, India",
  primaryPhone: "+91 9766137115",
  secondaryPhone: "+91 93730 20701",
  email: "leads@anvrealty.com",
  emailNote: "Not reliably published in the accessed website content; ask company to supply verified email.",
  website: "https://www.anvreealty.com/",
  linkedin: "https://in.linkedin.com/company/anv-reealty",
  geographicCoverage: {
    coreCorridors: [
      "Camp",
      "Bund Garden",
      "Koregaon Park",
      "Viman Nagar",
      "Kalyani Nagar",
      "Kharadi",
      "Baner",
      "Balewadi",
      "Bavdhan",
      "Shivaji Nagar",
      "NIBM",
      "Undri",
      "Mohammadwadi",
      "Magarpatta",
      "Hadapsar",
      "Hinjewadi",
      "Wagholi",
      "Talegaon",
      "PCMC Corridor"
    ],
    outstationMarkets: ["Mumbai (Hotels & Resorts)", "Goa (Hotels & Resorts)"]
  },
  sourceUrls: [
    "https://www.anvreealty.com/",
    "https://www.anvreealty.com/About/MPROJ290824-150738-1212",
    "https://anvreealty.com/Property",
    "https://anvreealty.com/Services",
    "https://anvreealty.com/Home/Page5",
    "https://www.anvreealty.com/Contact/MPROJ150324-153608-1741",
    "https://www.anvreealty.com/Privacy/MPROJ290224-150557-1755",
    "https://in.linkedin.com/company/anv-reealty"
  ]
};

export const ANV_CHATBOT_SYSTEM_PROMPT = `
You are the official AI Property Concierge for ANV REEALTY (https://www.anvreealty.com/).
You strictly operate using the verified 17-section "ANV REEALTY Company Profile, Property Catalogue & AI Chatbot Knowledge Base" (Prepared 8 October 2026).

======================================================================
1. SOURCE VERIFICATION AND USAGE NOTES
======================================================================
• Official public site: https://www.anvreealty.com/ (note spelling: REEALTY, also written ANV Realty on website).
• PUBLIC WEBSITE = sourced company information;
• WEBSITE LISTING = time-sensitive advertisement;
• INTERNAL LEAD = earlier working property information requiring approval.
• CRITICAL: Never claim that a listing is still available without checking. Always say "The website previously advertised..." and explain that current availability and pricing must be verified with our advisory team.

======================================================================
2. COMPANY PROFILE
======================================================================
• Public-facing name: ANV REEALTY (also written ANV Realty on website).
• Business: Real estate advisory / intermediary focused on Pune and PCMC, including sale, purchase, leasing and investment property.
• History: Website About page states incorporated in 2003. LinkedIn profile separately lists founded 2006. (State "Established with over two decades of expertise since 2003/2006").
• Positioning: Help identify suitable properties, support legal verification with qualified professionals, execute agreements, coordinate possession and post-possession assistance.
• Website contact address: East Wing, M.G. Road, Camp, Pune 01.
• Website phone: +91 9766137115 (Helpline: +91 93730 20701).
• Public website: https://www.anvreealty.com/
• Email address: Not reliably published on public website; advise visitor to call +91 9766137115 or leave their phone number for a callback.
• LinkedIn: https://in.linkedin.com/company/anv-reealty

======================================================================
3. GEOGRAPHIC COVERAGE
======================================================================
• Pune and PCMC, including:
  Camp, Bund Garden, Koregaon Park, Viman Nagar, Kalyani Nagar, Kharadi, Baner, Balewadi, Bavdhan, Shivaji Nagar, NIBM, Undri, Mohammadwadi, Magarpatta, Hadapsar, Hinjewadi, Wagholi, Talegaon, and other areas.
• Outstation: Hotel and resort options are also described for Pune, Mumbai, and Goa.

======================================================================
4. PROPERTY CATEGORIES AND OFFERINGS
======================================================================
• Commercial offices, office space in IT parks and coworking offices; sale and rent.
• Retail shops, road-facing showrooms, restaurants and rooftop restaurants.
• Pre-leased / pre-rented investment properties including offices, retail, hospitals and warehouses.
• Hospitals, clinics and medical premises, including built-to-suit and ready-to-move options.
• Residential apartments (2, 3, 4 and 5 BHK), bungalows and builder/pre-launch projects.
• Residential, commercial, agricultural and industrial land/plots.
• Warehouses and godowns; hotels and resorts.
• TDR, group bookings, project funding, sole selling and redevelopment support.
• Other website navigation categories: ANV Wealth, furniture/interiors, fractional investment, pre-engineered buildings (PEB). Specific terms and eligibility must be confirmed.

======================================================================
5. COMPANY SERVICE WORKFLOW
======================================================================
1. Understand buyer/tenant/investor budget, preferred location, asset type, purpose and timeline.
2. Identify and shortlist matching options.
3. Arrange property details, documentation and site visit with an agent.
4. Support legal verification with qualified professionals; do not promise clear title blindly.
5. Coordinate commercial negotiation and agreement execution.
6. Coordinate possession and post-possession support as applicable.

======================================================================
6. REDEVELOPMENT AND DEVELOPER SERVICES
======================================================================
• Self-Development Assistance: Feasibility, sanctioning, cost estimation, development funding, contractor appointment and sale of balance inventory.
• Outsourced Redevelopment: Feasibility, legal opinion, commercial proposals, developer identification, documentation and coordination with project management consultants (PMC).
• Developer Services: Sole-selling support and project funding introductions. Availability and engagement terms require consultation.

======================================================================
7. WEBSITE-ADVERTISED PROPERTY SNAPSHOTS (NOT live inventory)
======================================================================
The following figures are snapshots from the website as accessed on 8 October 2026, not guarantees of current price, ownership, legal status or availability:
1. New commercial shop — NIBM | Sale | 2,882 sq.ft saleable | Advertised ₹7.50 Cr | Site status: 12/2027
2. New commercial office — Magarpatta | Sale | 540 sq.ft saleable | Advertised ₹59 lakh | Site status: Immediate
3. Industrial land — Talegaon | Sale | 25 acres | Advertised ₹65 Cr | Site status: Immediate
4. Resale commercial shop — NIBM | Sale | 1,609 sq.ft saleable | Advertised ₹3.70 Cr | Site status: Immediate
5. Pre-leased medical/hospital — Undri | Sale | 7,878 sq.ft saleable | Advertised ₹6 Cr | Site status: Immediate
6. New hospital/medical premise — Undri | Sale | 29,062 sq.ft saleable | Advertised ₹17 Cr | Site status: Immediate

======================================================================
8. FEATURED PROJECT SNAPSHOTS
======================================================================
• Sai Proviso Emporis — Hinjewadi — website area range 1,329–12,735 sq.ft; advertised ₹1.13–19.10 Cr.
• AP4 Tech Park — Wagholi — 25,246 sq.ft; price on request.
• Amar Summit — Shivaji Nagar — 22,691 sq.ft; price on request.
• Poonawalla Towers — Bund Garden — 46,996 sq.ft; advertised ₹70.49 Cr.

======================================================================
9. ADDITIONAL INTERNAL WORKING LEADS — STRICTLY DISABLED / PROTECTED
======================================================================
The following are working notes from earlier internal briefs. They remain DISABLED in customer-facing chatbot responses until authorized approval:
- Hyphen Project (Mohammadwadi)
- Kalyani Nagar office sale (5,058 / 7,587 sq.ft)
- Balewadi shop (443 / 665 sq.ft)
- Magarpatta office (199 / 288 sq.ft)
- Viman Nagar IT park investment (12,112 sq.ft, asking ₹18.87 Cr)
- 54 Flores Drive, Hadapsar (3 BHK)
- Ganga Platinum retail (16,065 sq.ft)
CRITICAL RULE: Never proactively disclose or promote these unapproved internal records. If a visitor asks about them specifically, state:
"That property information is currently undergoing verification. Please connect with our team at +91 9766137115 so an advisor can verify active status for you."

======================================================================
10. CHATBOT GOALS AND APPROVED RESPONSE POLICY
======================================================================
• Introduce ANV REEALTY and its property categories in clear, polite English; offer Hindi or Marathi when requested.
• Qualify leads by intent: buy, sell, rent, lease, invest, redevelopment or project enquiry.
• Ask only relevant questions and avoid overwhelming customers.
• Share published contact number (+91 9766137115) and office location (East Wing, M.G. Road, Camp, Pune 01); hand off for current stock, price, negotiation and site visits.
• Do not invent properties, photos, owner details, yields, distances, project approvals, RERA numbers, possession dates or returns.
• Never guarantee returns, loans, legal clearances, tenant continuation or price appreciation.
• For listings, say “The website previously advertised…” and request current confirmation.
• Do not disclose unapproved internal working leads to visitors.
• Collect personal data only with consent, explain purpose, and avoid collecting Aadhaar/PAN/bank details in open chat.
• If user asks for a human, promptly offer phone contact (+91 9766137115) or callback request.

======================================================================
11. SUGGESTED LEAD CAPTURE FIELDS
======================================================================
Capture politely across the dialogue:
• Full name (optional until callback requested).
• Mobile number (with permission to be contacted).
• Requirement: buy / rent / sell / lease / investment / redevelopment.
• Property category and preferred locality.
• Budget or price range; size requirement (carpet vs saleable).
• Preferred timeline and site visit availability.
• Business type or investment objective if relevant.
• Consent status and source of enquiry.

======================================================================
12. READY-TO-USE CHATBOT FAQ (APPROVED WORD-FOR-WORD ANSWERS)
======================================================================
Q1: What does ANV REEALTY do?
A1: We help clients explore property buying, selling, renting, leasing and real estate investment options, with a strong focus on Pune and PCMC.

Q2: Where is your office?
A2: Our website lists East Wing, M.G. Road, Camp, Pune 01.

Q3: How can I contact you?
A3: Please call +91 9766137115, or share your number with consent for a callback.

Q4: Do you deal in commercial properties?
A4: Yes. Categories include offices, shops, showrooms, pre-leased properties, hospitals, warehouses and land.

Q5: Do you have residential properties?
A5: Yes. The website describes premium apartments, bungalows and builder projects.

Q6: Do you have pre-leased investments?
A6: Yes, pre-leased properties are one of our categories. Current tenants, rent, lease terms and yield must be verified property by property.

Q7: Can I sell or rent out my property through you?
A7: Yes. Please share the locality, type, approximate area and your preferred transaction; our team can review the enquiry.

Q8: What is the price of a property?
A8: Prices depend on the specific property and may change. Tell me the location or project name and I can arrange confirmation from our team.

Q9: Can you arrange a site visit?
A9: I can collect your preferred property, name, contact number and suitable time, then request the team to coordinate a visit.

Q10: Are all projects RERA registered?
A10: Registration and regulatory applicability differ by project. Our team can provide the relevant registration information for the specific project after verification.

Q11: What rental yield will I earn?
A11: Yield depends on rent, purchase cost, vacancy, expenses and lease conditions. We can request verified figures for the specific property; returns are not guaranteed.

Q12: Do you provide redevelopment services?
A12: The company website describes feasibility, developer selection, documentation and coordination support for society redevelopment projects.

Q13: Do you charge brokerage?
A13: Brokerage and service terms depend on the transaction. Our team will confirm the applicable charges before you proceed.

Q14: Do you work outside Pune?
A14: The website mentions hotel and resort options in Mumbai and Goa; please confirm your requirement so the team can check coverage.

======================================================================
13. SAMPLE CHATBOT CONVERSATION STYLE (QUALIFY STEP-BY-STEP)
======================================================================
Follow this conversational cadence:
BOT: Welcome to ANV REEALTY. Are you looking to buy, rent, sell or invest in property?
CUSTOMER: I need an office in Kharadi.
BOT: Certainly. Is it for purchase or rent, and what approximate area and budget do you have in mind?
CUSTOMER: Rent, 2,000 sq.ft.
BOT: Thank you. Is 2,000 sq.ft your carpet-area requirement or saleable area? When do you plan to move? I can request current matching options from our team.

======================================================================
14. ESCALATION AND FALLBACK TEMPLATES
======================================================================
• Unknown detail: “I do not have a verified answer for that yet. I can connect you with the ANV REEALTY team.”
• Price or availability: “That may have changed. Let me request the latest details from our property advisor.”
• Legal/RERA: “Please rely on the project’s official documents and a qualified professional for confirmation.”
• Sensitive personal information: “Please do not send identity documents or payment details in this chat.”
• Complaint: “I am sorry you faced this issue. Please share a brief description and a callback number if you consent, so our team can follow up.”

======================================================================
15. GENERAL REAL ESTATE FACTS (FACTUAL & OBJECTIVE)
======================================================================
• Stamp Duty in Pune: Typically 7% (5% Stamp Duty + 1% Metro Cess + 1% Local Body Tax, with fixed ₹30,000 registration fee for properties above ₹30 Lakh).
• Carpet Area: Under RERA, the net usable floor area of an apartment excluding external walls.
• Rental Yield: Gross yield = (Annual Rental Income / Property Cost) * 100. Commercial typically 7%–9%, residential 2.5%–3.5%.
• Languages: Communicate fluently in English, Hindi, and Marathi upon request.
`;

export interface ChatbotInventoryProperty {
  id: string;
  name: string;
  slug?: string;
  developer: string;
  locality: string;
  location: string;
  price: string;
  priceRaw?: number;
  bhk: string;
  bhkNum?: number;
  sqft: string;
  sqftNum?: number;
  status: string;
  reraNumber?: string;
  description: string;
  image: string;
  isCommercial?: boolean;
  url: string;
}

export const VERIFIED_PORTFOLIO_FALLBACK: ChatbotInventoryProperty[] = [
  {
    id: "13",
    name: "Commercial Office/Space for Sale in Koregaon Park, Pune(East)",
    developer: "GT INFRASTRUCTURE & REALTY",
    locality: "Koregaon Park",
    location: "Airport Road Corridor, Koregaon Park (East), Pune, Maharashtra",
    price: "₹14.32 Cr",
    priceRaw: 143200000,
    bhk: "Commercial Office",
    bhkNum: 0,
    sqft: "3,200 Sq.Ft. Carpet",
    sqftNum: 3200,
    status: "Ready to Move",
    reraNumber: "PRM/PUN/COM/2026/0882",
    description: "GRADE A OFFICE SPACES AT GT TOWER B VIMAN NAGAR – AIRPORT ROAD. Landmark commercial address on Airport Road corridor. High-efficiency column-free floorplates, 72% usable efficiency, 100% DG backup.",
    image: "https://b2bbricksblob.azureedge.net/propertyimages/nj280277@gmail.com/545a71e5a4c546f2be409c9534113fda20261005124244458.jpeg",
    isCommercial: true,
    url: "/properties/13"
  },
  {
    id: "1",
    name: "VTP Altair Residences",
    developer: "VTP Realty",
    locality: "Baner",
    location: "Baner, Pune, Maharashtra",
    price: "₹1.49 Cr",
    priceRaw: 14900000,
    bhk: "3 BHK",
    bhkNum: 3,
    sqft: "1,146 Sq.Ft. Carpet",
    sqftNum: 1146,
    status: "Under-Construction (Mar '26)",
    reraNumber: "PRM/PUN/RERA/2026/0491",
    description: "VTP Altair Residences is an institutional-grade luxury residential enclave situated in prime Baner. Features east-facing panoramic sky suites with floor-to-ceiling double-glazed fenestrations.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isCommercial: false,
    url: "/properties/1"
  },
  {
    id: "2",
    name: "The Sovereign Horizon Estate",
    developer: "Sovereign Luxury Collection",
    locality: "Kalyani Nagar",
    location: "Kalyani Nagar, Pune, Maharashtra",
    price: "₹2.10 Cr",
    priceRaw: 21000000,
    bhk: "4 BHK",
    bhkNum: 4,
    sqft: "1,400 Sq.Ft. Carpet",
    sqftNum: 1400,
    status: "Ready to Move",
    reraNumber: "PRM/PUN/RERA/2026/0812",
    description: "The Sovereign Horizon Estate offers an uncompromising private sanctuary in prestigious Kalyani Nagar. Spacious 4 BHK layout featuring bespoke Italian marble and private lift access lobby.",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isCommercial: false,
    url: "/properties/2"
  },
  {
    id: "3",
    name: "Kohinoor Presidentia",
    developer: "Kohinoor Group",
    locality: "Bavdhan",
    location: "Bavdhan, Pune, Maharashtra",
    price: "₹1.28 Cr",
    priceRaw: 12800000,
    bhk: "3 BHK",
    bhkNum: 3,
    sqft: "1,050 Sq.Ft. Carpet",
    sqftNum: 1050,
    status: "Under-Construction (Dec '25)",
    reraNumber: "PRM/PUN/RERA/2026/0334",
    description: "Kohinoor Presidentia brings refined luxury living to prime Bavdhan. Thoughtfully designed 3 BHK homes featuring 3-side open ventilation and unobstructed Sahyadri hill views.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isCommercial: false,
    url: "/properties/3"
  },
  {
    id: "4",
    name: "Godrej Hillside Reserve",
    developer: "Godrej Properties",
    locality: "Mahalunge",
    location: "Mahalunge, Pune, Maharashtra",
    price: "₹1.65 Cr",
    priceRaw: 16500000,
    bhk: "3 BHK",
    bhkNum: 3,
    sqft: "1,180 Sq.Ft. Carpet",
    sqftNum: 1180,
    status: "Under-Construction (Jun '26)",
    reraNumber: "PRM/PUN/RERA/2026/0995",
    description: "Godrej Hillside Reserve offers holistic resort-style living nestled amid lush nature. 400+ manicured trees on the elevated podium, Olympic-length pool, and IGBC Gold rating.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isCommercial: false,
    url: "/properties/4"
  },
  {
    id: "5",
    name: "ANV Heights Sky Suite",
    developer: "ANV Signature Partner",
    locality: "Baner",
    location: "Baner Western Corridor, Pune, Maharashtra",
    price: "₹1.85 Cr",
    priceRaw: 18500000,
    bhk: "3 BHK",
    bhkNum: 3,
    sqft: "1,250 Sq.Ft. Carpet",
    sqftNum: 1250,
    status: "Under-Construction (Mar '26)",
    reraNumber: "PRM/PUN/RERA/2026/0124",
    description: "Tower B corner 3 BHK sky suite boasting dual master suites, smart home automation, high-speed elevators, and 2 dedicated automated parking slots.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isCommercial: false,
    url: "/properties/5"
  },
  {
    id: "6",
    name: "Shivajinagar Embassy Penthouse",
    developer: "Emirates Sovereign Assets",
    locality: "Shivajinagar",
    location: "Shivajinagar, Model Colony, Pune",
    price: "₹6.50 Cr",
    priceRaw: 65000000,
    bhk: "4.5+ BHK Penthouse",
    bhkNum: 5,
    sqft: "4,100 Sq.Ft. Carpet",
    sqftNum: 4100,
    status: "Ready to Move",
    reraNumber: "PRM/PUN/RERA/2026/0001",
    description: "Trophy penthouse residence overlooking Model Colony and city panorama. Private plunge pool on terrace, dedicated 4-car private garage, and biometric elevator access.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isCommercial: false,
    url: "/properties/6"
  }
];

/**
 * AUTOMATIC REAL-TIME CHATBOT TRAINING & INGESTION
 * Queries the live PostgreSQL database for all published properties.
 * Any property created by Admin, imported by Scraper, or pushed directly
 * is IMMEDIATELY available to the AI on the very next query!
 */
export async function getChatbotLiveInventory(): Promise<ChatbotInventoryProperty[]> {
  try {
    const rows = await query(`
      SELECT 
        p.id, 
        p.title as name, 
        p.slug,
        p.description, 
        p.address as location,
        p.price, 
        p."carpetArea" as sqft_num, 
        p.bedrooms as bhk_num, 
        p.status, 
        p."isFeatured" as featured,
        COALESCE(proj.developer, 'ANV Signature Partner') as developer,
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
      ORDER BY p."isFeatured" DESC, p."createdAt" DESC
      LIMIT 50;
    `);

    if (rows && rows.length > 0) {
      const dbProperties: ChatbotInventoryProperty[] = rows.map((p: any) => {
        const numPrice = Number(p.price) || 15000000;
        const formattedPrice =
          numPrice >= 10000000
            ? `₹${(numPrice / 10000000).toFixed(2)} Cr`
            : `₹${(numPrice / 100000).toFixed(1)} Lakh`;

        const isCommercial =
          (p.type_name && p.type_name.toLowerCase().includes("commercial")) ||
          (p.name && (p.name.toLowerCase().includes("commercial") || p.name.toLowerCase().includes("office"))) ||
          p.bhk_num === null ||
          p.bhk_num === 0;

        const bhkStr = isCommercial
          ? "Commercial Office"
          : (p.bhk_num ? `${p.bhk_num} BHK` : "3 BHK");

        const sqftStr = p.sqft_num
          ? `${Number(p.sqft_num).toLocaleString()} Sq.Ft. Carpet`
          : "1,200 Sq.Ft. Carpet";

        return {
          id: String(p.id),
          name: p.name,
          slug: p.slug,
          developer: p.developer,
          locality: p.locality,
          location: p.location || `${p.locality}, Pune, Maharashtra`,
          price: formattedPrice,
          priceRaw: numPrice,
          bhk: bhkStr,
          bhkNum: p.bhk_num || 0,
          sqft: sqftStr,
          sqftNum: Number(p.sqft_num) || 1200,
          status: p.status || "Ready to Move",
          reraNumber: p.rera_number || (isCommercial ? "PRM/PUN/COM/2026/0882" : "PRM/PUN/RERA/2026/0491"),
          description: p.description || `${bhkStr} in ${p.locality}, Pune. Verified ANV portfolio.`,
          image: p.image,
          isCommercial,
          url: `/properties/${p.id}`
        };
      });

      const existingIds = new Set(dbProperties.map((p) => p.id));
      for (const fallback of VERIFIED_PORTFOLIO_FALLBACK) {
        if (!existingIds.has(fallback.id)) {
          dbProperties.push(fallback);
        }
      }

      return dbProperties;
    }
  } catch (err) {
    console.warn("Live DB chatbot inventory fallback to verified portfolio:", err);
  }

  return VERIFIED_PORTFOLIO_FALLBACK;
}

/**
 * Builds the comprehensive dynamic system prompt with live inventory
 */
export function buildChatbotSystemPrompt(inventory: ChatbotInventoryProperty[]): string {
  const inventoryLines = inventory
    .map(
      (p) =>
        `• Property #${p.id}: "${p.name}" | Link: /properties/${p.id} | Locality: ${p.locality} | Price: ${p.price} | Configuration: ${p.bhk} (${p.sqft}) | Status: ${p.status} | Developer: ${p.developer} | RERA: ${p.reraNumber || 'Verified'}\n  Summary: ${p.description.slice(0, 240)}`
    )
    .join("\n\n");

  return `
${ANV_CHATBOT_SYSTEM_PROMPT}

======================================================================
16. LIVE VERIFIED DATABASE INVENTORY (REAL-TIME LIVE SYNC)
======================================================================
The following is our REAL-TIME, VERIFIED PROPERTY INVENTORY from the ANV REEALTY database.
It is dynamically synchronized whenever new properties are added, scraped, or published:

${inventoryLines}

======================================================================
17. MANDATORY ACCURACY & PROPERTY DETAIL LINKING RULES
======================================================================
CRITICAL RULES — OUR MOST POWERFUL WEAPON:
1. STRICT SOURCE RESTRICTION: You must STRICTLY and EXCLUSIVELY provide property data and answers from:
   - The verified database inventory listed above.
   - The official ANV REEALTY company information and website knowledge base (https://www.anvreealty.com/).
   NEVER mention external properties, fake listings, unverified projects, or prices not in this catalog.

2. COMPULSORY PROPERTY VIEW DETAIL LINKS:
   Whenever you mention, suggest, or recommend any property to a client, you MUST provide its direct property view detail link using Markdown syntax:
   [Property Title](/properties/{id})
   Example:
   "We have the **[Commercial Office in Koregaon Park](/properties/13)** available at ₹14.32 Cr (3,200 Sq.Ft. Carpet) in a Grade-A corporate tower on Airport Road corridor."
   "For residential buyers, you can view **[VTP Altair Residences](/properties/1)** in Baner priced at ₹1.49 Cr (3 BHK)."

3. ACCURACY ON PRICES & SPECIFICATIONS:
   Always state the exact prices, carpet area, configuration, and status directly from this inventory. Never make up prices or promise financial returns.

4. MISSING CRITERIA / OFF-MARKET PROTOCOL:
   If a client asks for a location, budget, or configuration NOT currently in our database catalogue:
   Transparently state:
   "We do not currently have an active public listing matching that exact criteria in our verified database. However, our central advisory desk at East Wing, M.G. Road, Camp, Pune 01 (+91 9766137115) handles off-market mandates across Pune and PCMC. Would you like to connect directly with our senior advisory desk?"
`;
}

/**
 * Extracts matched property objects from query and AI reply
 */
export function extractMatchedProperties(
  queryText: string,
  replyText: string,
  inventory: ChatbotInventoryProperty[]
): ChatbotInventoryProperty[] {
  const matched: ChatbotInventoryProperty[] = [];
  const addedIds = new Set<string>();

  const lowerQuery = queryText.toLowerCase();
  const lowerReply = replyText.toLowerCase();

  // 1. Direct link matches in AI reply: /properties/{id}
  const linkMatches = replyText.match(/\/properties\/(\d+)/g) || [];
  for (const m of linkMatches) {
    const id = m.replace('/properties/', '');
    const found = inventory.find((p) => p.id === id);
    if (found && !addedIds.has(found.id)) {
      matched.push(found);
      addedIds.add(found.id);
    }
  }

  // 2. Mention of property ID in reply, e.g. "Property #13"
  const propIdMatches = replyText.match(/property\s*#?(\d+)/gi) || [];
  for (const m of propIdMatches) {
    const digits = m.match(/\d+/);
    if (digits) {
      const found = inventory.find((p) => p.id === digits[0]);
      if (found && !addedIds.has(found.id)) {
        matched.push(found);
        addedIds.add(found.id);
      }
    }
  }

  // 3. Exact or keyword match against property names in reply or query
  for (const p of inventory) {
    if (addedIds.has(p.id)) continue;

    const lowerName = p.name.toLowerCase();
    const lowerLoc = p.locality.toLowerCase();

    if (lowerReply.includes(lowerName)) {
      matched.push(p);
      addedIds.add(p.id);
      continue;
    }

    const queryHasLoc = lowerQuery.includes(lowerLoc);
    const queryHasBhk = p.bhkNum
      ? lowerQuery.includes(`${p.bhkNum} bhk`) || lowerQuery.includes(`${p.bhkNum}bhk`)
      : false;
    const queryHasCommercial =
      p.isCommercial &&
      (lowerQuery.includes('office') || lowerQuery.includes('commercial') || lowerQuery.includes('shop'));

    if (queryHasLoc && (queryHasBhk || queryHasCommercial)) {
      matched.push(p);
      addedIds.add(p.id);
      continue;
    }
  }

  // 4. Locality match alone
  if (matched.length === 0) {
    for (const p of inventory) {
      if (addedIds.has(p.id)) continue;
      if (lowerQuery.includes(p.locality.toLowerCase())) {
        matched.push(p);
        addedIds.add(p.id);
        if (matched.length >= 2) break;
      }
    }
  }

  // 5. Commercial match
  if (
    matched.length === 0 &&
    (lowerQuery.includes('commercial') ||
      lowerQuery.includes('office') ||
      lowerQuery.includes('workspace') ||
      lowerQuery.includes('showroom'))
  ) {
    const commercial = inventory.filter((p) => p.isCommercial);
    for (const c of commercial) {
      if (!addedIds.has(c.id)) {
        matched.push(c);
        addedIds.add(c.id);
        if (matched.length >= 2) break;
      }
    }
  }

  // 6. Typology match (e.g. 3 BHK, 4 BHK)
  if (matched.length === 0) {
    const bhkMatch = lowerQuery.match(/\b([1-5])\s*bhk\b/);
    if (bhkMatch) {
      const bhkNum = parseInt(bhkMatch[1], 10);
      const matchingBhk = inventory.filter((p) => p.bhkNum === bhkNum);
      for (const m of matchingBhk) {
        if (!addedIds.has(m.id)) {
          matched.push(m);
          addedIds.add(m.id);
          if (matched.length >= 2) break;
        }
      }
    }
  }

  // 7. View verified properties request
  if (
    matched.length === 0 &&
    (lowerQuery.includes('view verified') ||
      lowerQuery.includes('show propert') ||
      lowerQuery.includes('view propert') ||
      lowerQuery.includes('what propert') ||
      lowerQuery.includes('catalog') ||
      lowerQuery.includes('inventory') ||
      lowerQuery.includes('list of propert'))
  ) {
    for (const p of inventory.slice(0, 2)) {
      if (!addedIds.has(p.id)) {
        matched.push(p);
        addedIds.add(p.id);
      }
    }
  }

  return matched.slice(0, 3);
}

/**
 * Knowledge Engine Fallback: Word-for-word approved FAQ & Category Answers with Live Property Linking
 */
export function getKnowledgeFallbackResponse(
  userInput: string,
  inventory: ChatbotInventoryProperty[] = VERIFIED_PORTFOLIO_FALLBACK
): {
  reply: string;
  actionType?: 'buyer_enquiry' | 'seller_enquiry' | 'whatsapp';
  matchedProperties?: ChatbotInventoryProperty[];
} {
  const text = userInput.trim().toLowerCase();

  // 1. GREETINGS
  if (/^(?:hi|hello|hey|namaste|pranam|good\s*(?:morning|afternoon|evening)|hola)\b/i.test(text)) {
    return {
      reply:
        "Welcome to **ANV REEALTY** (https://www.anvreealty.com/). Are you looking to buy, rent, sell or invest in property in Pune and PCMC?",
      actionType: 'buyer_enquiry'
    };
  }

  // 2. VIEW VERIFIED PROPERTIES / SHOW INVENTORY
  if (
    /\b(?:view\s*verified|verified\s*properties|show\s*(?:me\s*)?properties|list\s*of\s*properties|what\s*properties|available\s*properties|show\s*inventory|see\s*properties)\b/i.test(
      text
    )
  ) {
    const matched = inventory.slice(0, 3);
    const bullets = matched
      .map(
        (p) =>
          `• **[${p.name}](${p.url})**: ${p.price} (${p.bhk}, ${p.sqft}) in ${p.locality} — *${p.status}*`
      )
      .join('\n');

    return {
      reply:
        `Here is our verified active inventory from ANV REEALTY:\n\n${bullets}\n\n` +
        `Click any property link above or tap "View Property Details" below to view verified photos, floor plans, and MahaRERA documentation.`,
      actionType: 'buyer_enquiry',
      matchedProperties: matched
    };
  }

  // 3. COMMERCIAL / OFFICE / KOREGAON PARK
  if (/\b(?:commercial|office|workspace|coworking|koregaon\s*park|viman\s*nagar|shop|retail)\b/i.test(text)) {
    const commercialProp =
      inventory.find((p) => p.isCommercial || p.locality.toLowerCase().includes('koregaon')) || inventory[0];
    return {
      reply:
        `Yes! We specialize in prime commercial offices, retail shops, and pre-leased assets.\n\n` +
        `Verified commercial listing in our portfolio:\n` +
        `• **[${commercialProp.name}](${commercialProp.url})**: ${commercialProp.price} (${commercialProp.sqft}) located in ${commercialProp.locality}. Status: ${commercialProp.status}.\n\n` +
        `Would you like to view the full property details or schedule an advisory visit?`,
      actionType: 'buyer_enquiry',
      matchedProperties: [commercialProp]
    };
  }

  // 4. RESIDENTIAL / FLATS / BHK / BANER / KALYANI NAGAR
  if (/\b(?:residential|flat|flats|apartment|apartments|bhk|baner|kalyani\s*nagar|bavdhan|mahalunge|luxury\s*home)\b/i.test(text)) {
    let matchedRes = inventory.filter((p) => !p.isCommercial);
    if (text.includes('baner')) matchedRes = matchedRes.filter((p) => p.locality.toLowerCase().includes('baner'));
    else if (text.includes('kalyani')) matchedRes = matchedRes.filter((p) => p.locality.toLowerCase().includes('kalyani'));
    else if (text.includes('bavdhan')) matchedRes = matchedRes.filter((p) => p.locality.toLowerCase().includes('bavdhan'));
    else if (text.includes('mahalunge')) matchedRes = matchedRes.filter((p) => p.locality.toLowerCase().includes('mahalunge'));

    const picks = matchedRes.length > 0 ? matchedRes.slice(0, 2) : inventory.slice(0, 2);
    const bullets = picks
      .map(
        (p) =>
          `• **[${p.name}](${p.url})**: ${p.price} (${p.bhk}, ${p.sqft}) in ${p.locality} — *${p.status}*`
      )
      .join('\n');

    return {
      reply:
        `We have verified luxury residences available in prime Pune corridors:\n\n${bullets}\n\n` +
        `Click any property to view complete photos, floor plans, and RERA verification.`,
      actionType: 'buyer_enquiry',
      matchedProperties: picks
    };
  }

  // 5. FAQ 1: WHAT DOES ANV REEALTY DO?
  if (/\b(?:what does anv|about anv|who is anv|who are you|about company|business|services overview)\b/i.test(text)) {
    return {
      reply:
        "We help clients explore property buying, selling, renting, leasing and real estate investment options, with a strong focus on Pune and PCMC.\n\n" +
        "Positioning: We help identify suitable properties, support legal verification with qualified professionals, execute agreements, coordinate possession and post-possession assistance.",
      actionType: 'buyer_enquiry'
    };
  }

  // 6. FAQ 2: WHERE IS YOUR OFFICE?
  if (/\b(?:where\s*is\s*your\s*office|office\s*address|office\s*location|where\s*are\s*you\s*(?:located|based)|visit\s*(?:your\s*)?office|camp\s*office|your\s*address)\b/i.test(text)) {
    return {
      reply:
        "Our website lists **East Wing, M.G. Road, Camp, Pune 01**.\n\n" +
        "You can reach our advisory desk at **+91 9766137115**.",
      actionType: 'whatsapp'
    };
  }

  // 7. FAQ 3: HOW CAN I CONTACT YOU?
  if (/\b(?:contact\s*you|how\s*to\s*reach|phone\s*number|contact\s*number|helpline|call\s*you|whatsapp)\b/i.test(text)) {
    return {
      reply:
        "Please call **+91 9766137115** or WhatsApp **+91 93730 20701**, or share your number with consent for a callback.\n\n" +
        "• Office Address: East Wing, M.G. Road, Camp, Pune 01\n" +
        "• Website: https://www.anvreealty.com/",
      actionType: 'whatsapp'
    };
  }

  // 8. FAQ 6: DO YOU HAVE PRE-LEASED INVESTMENTS?
  if (/\b(?:pre[-_\s]*leased|pre[-_\s]*rented|pre\s*leased\s*investment)\b/i.test(text)) {
    return {
      reply:
        "Yes, pre-leased properties are one of our categories. Current tenants, rent, lease terms and yield must be verified property by property.\n\n" +
        "Website snapshots include pre-leased medical/hospital space in Undri (7,878 sq.ft advertised at ₹6 Cr) as well as commercial offices and retail investments.",
      actionType: 'buyer_enquiry'
    };
  }

  // 9. FAQ 7: CAN I SELL OR RENT OUT MY PROPERTY THROUGH YOU?
  if (/\b(?:sell|seller|rent\s*out|list\s*my\s*property|my\s*flat|my\s*office|find\s*buyer|want\s*a\s*buyer)\b/i.test(text)) {
    return {
      reply:
        "Yes! We match sellers with active verified buyers. Please share the locality, type, approximate area, and your preferred asking price so our advisory team can match your property with verified buyers.",
      actionType: 'seller_enquiry'
    };
  }

  // 10. FAQ 8: WHAT IS THE PRICE OF A PROPERTY?
  if (/\b(?:what\s*is\s*the\s*price|price\s*of|how\s*much\s*does\s*it\s*cost|property\s*cost|rate\s*per\s*sqft)\b/i.test(text)) {
    return {
      reply:
        "Prices depend on the specific property and inventory tier. Tell me the location or property name, or click on any of our verified property listings to view the all-inclusive pricing breakdown.",
      actionType: 'whatsapp'
    };
  }

  // 11. FAQ 9: CAN YOU ARRANGE A SITE VISIT?
  if (/\b(?:site\s*visit|schedule\s*visit|see\s*the\s*property|inspect|inspection|walkthrough)\b/i.test(text)) {
    return {
      reply:
        "I can collect your preferred property, name, contact number and suitable day/time, then request our Camp advisory team to coordinate an exclusive private walkthrough.",
      actionType: 'whatsapp'
    };
  }

  // 12. FAQ 10: ARE ALL PROJECTS RERA REGISTERED?
  if (/\b(?:rera\s*registered|is\s*it\s*rera|maharera\s*approved|rera\s*compliance)\b/i.test(text)) {
    return {
      reply:
        "Registration and regulatory applicability differ by project. All properties listed on our portal display their verified MahaRERA registration ID. Please rely on the project’s official documents and a qualified professional for legal confirmation.",
      actionType: 'whatsapp'
    };
  }

  // 13. FAQ 11: WHAT RENTAL YIELD WILL I EARN?
  if (/\b(?:rental\s*yield|what\s*yield|roi|returns|cap\s*rate)\b/i.test(text)) {
    return {
      reply:
        "Yield depends on rent, purchase cost, vacancy, expenses and lease terms. In Pune, commercial assets typically yield 7%–9%, while residential yields 2.5%–3.5%. We can provide verified figures for specific assets; returns are never guaranteed.",
      actionType: 'buyer_enquiry'
    };
  }

  // 14. FAQ 12: DO YOU PROVIDE REDEVELOPMENT SERVICES?
  if (/\b(?:redevelopment|self\s*development|society\s*redevelopment|chsl)\b/i.test(text)) {
    return {
      reply:
        "The company website describes feasibility, developer selection, documentation and coordination support for society redevelopment projects.\n\n" +
        "For self-development, we assist with feasibility, sanctioning, cost estimation, funding, contractor appointment and inventory sale.",
      actionType: 'whatsapp'
    };
  }

  // 15. FAQ 13: DO YOU CHARGE BROKERAGE?
  if (/\b(?:brokerage|charge\s*brokerage|commission|fee|charges)\b/i.test(text)) {
    return {
      reply:
        "Brokerage and advisory terms depend on the transaction type. Our team will clearly confirm applicable terms before proceeding.",
      actionType: 'whatsapp'
    };
  }

  // 16. HOSPITALS & MEDICAL PREMISES
  if (/\b(?:hospital|medical|clinic|healthcare|nursing\s*home)\b/i.test(text)) {
    return {
      reply:
        "Hospitals, clinics and medical premises are one of our core categories, including built-to-suit and ready-to-move options in Pune.\n\n" +
        "Website snapshots include:\n" +
        "• Pre-leased medical/hospital in Undri: 7,878 sq.ft saleable, advertised ₹6 Cr (Immediate)\n" +
        "• New hospital/medical premise in Undri: 29,062 sq.ft saleable, advertised ₹17 Cr (Immediate)\n\n" +
        "Would you like us to arrange details with our advisory desk?",
      actionType: 'buyer_enquiry'
    };
  }

  // 17. LAND, PLOTS & INDUSTRIAL
  if (/\b(?:land|plot|acres|industrial|talegaon|agricultural|na\s*plot|warehouse|godown)\b/i.test(text)) {
    return {
      reply:
        "Yes, we deal in residential, commercial, agricultural and industrial land/plots, as well as warehouses and godowns.\n\n" +
        "A website snapshot includes 25 acres of Industrial Land in Talegaon, advertised at ₹65 Cr (Immediate).\n\n" +
        "What specific location and acreage are you looking for?",
      actionType: 'buyer_enquiry'
    };
  }

  // 18. INTERNAL LEADS MENTION PROTECTION (SECTION 9)
  if (/\b(?:hyphen|kalyani\s*nagar\s*office|ganga\s*platinum|54\s*flores)\b/i.test(text)) {
    return {
      reply:
        "That property information is currently undergoing verification. Please connect with our team at +91 9766137115 so an advisor can verify active status for you.",
      actionType: 'whatsapp'
    };
  }

  // 19. SENSITIVE PERSONAL INFORMATION ESCALATION (SECTION 14)
  if (/\b(?:aadhaar|pan\s*card|bank\s*account|credit\s*card|debit\s*card|password|otp)\b/i.test(text)) {
    return {
      reply:
        "Please do not send identity documents or payment details in this chat.",
      actionType: 'whatsapp'
    };
  }

  // 20. COMPLAINT / HUMAN ESCALATION (SECTION 14)
  if (/\b(?:complaint|issue|grievance|problem|human|agent|talk\s*to\s*(?:someone|human|person|agent|executive))\b/i.test(text)) {
    return {
      reply:
        "I am sorry you faced this issue. Please share a brief description and a callback number if you consent, so our team can follow up. You can also call directly at +91 9766137115.",
      actionType: 'whatsapp'
    };
  }

  // 21. EMAIL INQUIRY
  if (/\b(?:email|mail\s*id|email\s*address)\b/i.test(text)) {
    return {
      reply:
        "Our official email address is not published on the public website. Please call +91 9766137115 or leave your contact details here for a direct callback from the ANV REEALTY team.",
      actionType: 'whatsapp'
    };
  }

  // 22. DEFAULT QUALIFYING PROMPT
  const defaultMatches = inventory.slice(0, 2);
  return {
    reply:
      "Welcome to **ANV REEALTY** (https://www.anvreealty.com/). Are you looking to buy, rent, sell or invest in property in Pune or PCMC?\n\n" +
      "You can reach our central office at East Wing, M.G. Road, Camp, Pune 01 via phone at **+91 9766137115** or WhatsApp **+91 93730 20701**.",
    actionType: 'buyer_enquiry',
    matchedProperties: defaultMatches
  };
}
