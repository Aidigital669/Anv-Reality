import Image from "next/image";
import { Search, MapPin, CheckCircle, ChevronDown, Heart, User, Filter, ArrowRight, Grid, Key, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

const fallbackProperties = [
  {
    id: "1",
    name: "VTP Altair Residences",
    developer: "Premium Developer",
    location: "Baner, Pune",
    price: "₹1.49 Cr",
    priceSuffix: "Onwards",
    bhk: "3 BHK",
    sqft: "1146 Sq.Ft. Carpet",
    status: "Under-Construction (Mar '26)",
    description: "VTP Altair Residences is a premium luxury residential project located in Baner. The project offers 2 and 3 BHK spacious apartments. It has a beautiful facade and stunning elevation. The project has top class amenities.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["OC Received", "Vastu Compliant"],
    featured: true,
    label: "Top Choice",
    score: "8.5/10"
  },
  {
    id: "2",
    name: "The Sovereign Horizon Estate",
    developer: "Luxury Collection",
    location: "Kalyani Nagar, Pune",
    price: "₹2.10 Cr",
    priceSuffix: "All Inclusive",
    bhk: "3/4 BHK",
    sqft: "1400 Sq.Ft. Carpet",
    status: "Ready to Move",
    description: "The Sovereign Horizon Estate is a premium luxury residential project located in Kalyani Nagar. The project offers 3 and 4 BHK spacious apartments with private decks. It has a beautiful facade and stunning elevation.",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Private Deck", "Smart Home"],
    featured: false,
    label: "New Launch",
    score: "9.2/10"
  },
  {
    id: "3",
    name: "Kohinoor Presidentia",
    developer: "Premium Developer",
    location: "Bavdhan, Pune",
    price: "₹1.28 Cr",
    priceSuffix: "Onwards",
    bhk: "2/3 BHK",
    sqft: "850 Sq.Ft. Carpet",
    status: "Under-Construction (Dec '24)",
    description: "Kohinoor Presidentia brings you the true essence of luxury living in Bavdhan. The thoughtfully designed residences ensure maximum natural light and cross ventilation.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Premium Clubhouse", "Green Views"],
    featured: false,
    label: "Fast Selling",
    score: "8.1/10"
  },
  {
    id: "4",
    name: "Godrej Hillside Reserve",
    developer: "Top Tier Developer",
    location: "Mahalunge, Pune",
    price: "₹1.65 Cr",
    priceSuffix: "All Inclusive",
    bhk: "2/3 BHK",
    sqft: "950 Sq.Ft. Carpet",
    status: "Under-Construction (Jun '25)",
    description: "Godrej Hillside Reserve offers resort-style living nestled in nature. Enjoy 400+ trees on the podium, multiple sports facilities, and premium fittings in every home.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Resort Style", "IGBC Gold"],
    featured: false,
    label: "Eco Friendly",
    score: "8.8/10"
  }
];

const fallbackInsights = [
  {
    id: "1",
    title: "Baner Property Market Guide: 2026 Price Appreciation",
    description: "An in-depth analysis of property trends in Baner and what to expect in the next 3 years based on upcoming infrastructure.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Market Report"
  },
  {
    id: "2",
    title: "Guide to Buying a 3 BHK Apartment in Pune: Costs & Taxes",
    description: "Everything you need to know about stamp duty, registration charges, GST implications, and hidden costs to watch out for.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Buying Guide"
  },
  {
    id: "3",
    title: "Checklist Before Buying an Under-Construction Home in Maharashtra",
    description: "Ensure you check all legal compliance, RERA registration details, developer track record, and necessary approvals.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Legal & RERA"
  }
];

export default async function Home() {
  let properties = [];
  let insights = [];
  
  try {
    // Attempt to fetch from database using Prisma 8 ORM
    properties = await prisma.orm.public.Property
      .orderBy((p) => p.createdAt.desc())
      .all();
    
    // Insights aren't in the schema yet, use fallback
    insights = fallbackInsights;
    
    // If DB is empty, use fallback data
    if (!properties || properties.length === 0) {
      properties = fallbackProperties;
    }
  } catch (error) {
    // If database connection fails, gracefully fallback to mock data
    console.log("Database connection error or empty, using fallback mock data.");
    properties = fallbackProperties;
    insights = fallbackInsights;
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Header */}
      <header className="absolute top-0 w-full z-50 px-8 py-4 flex items-center justify-between text-white border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500 text-black font-bold p-1 rounded text-sm">AR</div>
          <span className="font-bold text-xl tracking-tight">ANV REALTY</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#" className="hover:text-amber-400 transition">Explore</a>
          <a href="#" className="hover:text-amber-400 transition">Advisors</a>
          <a href="#" className="hover:text-amber-400 transition">Market Insights</a>
        </nav>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-4">
            <Heart className="w-5 h-5 cursor-pointer hover:text-amber-400" />
            <User className="w-5 h-5 cursor-pointer hover:text-amber-400" />
            <a href="#" className="hover:text-amber-400 font-medium">Sign in</a>
          </div>
          <button className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition text-xs font-semibold shadow-sm">
            Schedule Consultation
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[650px] w-full flex flex-col items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-zinc-950/90"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center mt-10">
          <div className="bg-zinc-900/60 backdrop-blur-md text-zinc-300 text-[10px] sm:text-xs font-semibold px-4 py-1.5 rounded-full mb-8 flex items-center gap-2 border border-zinc-700/50 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            AI-POWERED SEARCH, MATCHING 1,000+ PREMIUM LISTINGS
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center mb-6 tracking-tight leading-tight">
            Find a Property That <br/>Fits Your Next Move
          </h1>
          <p className="text-zinc-300 text-center mb-12 max-w-2xl text-base md:text-lg">
            Search real estate and premium off-market properties across all property types.
            By post and more with verified sovereign advisors.
          </p>

          <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-2 mb-10 flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 flex items-center px-4 w-full border-b md:border-b-0 md:border-r border-zinc-200 py-3 md:py-0">
              <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search Location, Property or Builder..."
                className="w-full bg-transparent outline-none text-zinc-900 placeholder:text-zinc-400 h-10 font-medium"
                defaultValue="3 BHK Apartments in Pune"
              />
            </div>
            <button className="bg-zinc-900 text-white px-8 py-4 rounded-lg font-medium hover:bg-zinc-800 transition w-full md:w-auto flex items-center justify-center gap-2 whitespace-nowrap shadow-md">
              Search Properties <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="text-zinc-400 font-medium mr-2">Quick Filters:</span>
            {['Luxury Villas in Pune', 'Baner Urban', 'Commercial Spaces', 'Ready to Move In'].map(tag => (
              <span key={tag} className="bg-zinc-800/40 backdrop-blur text-zinc-200 px-4 py-2 rounded-full border border-zinc-700/50 cursor-pointer hover:bg-zinc-700/60 hover:text-white transition font-medium text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 w-full flex flex-wrap justify-center gap-x-12 gap-y-4 items-center py-6 px-10 bg-gradient-to-t from-zinc-50 to-transparent border-t border-white/5 mt-20">
          <div className="flex items-center gap-3 text-sm font-semibold text-zinc-800"><div className="p-2 bg-amber-500/20 rounded-lg text-amber-600"><Building2 className="w-4 h-4"/></div> ₹10,000+ Cr Curated Portfolio</div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-zinc-300"></div>
          <div className="flex items-center gap-3 text-sm font-semibold text-zinc-800"><div className="p-2 bg-amber-500/20 rounded-lg text-amber-600"><CheckCircle className="w-4 h-4"/></div> 100% Verified Developers</div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-zinc-300"></div>
          <div className="flex items-center gap-3 text-sm font-semibold text-zinc-800"><div className="p-2 bg-amber-500/20 rounded-lg text-amber-600"><User className="w-4 h-4"/></div> 15K+ Happy Buyers</div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Listing Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <div className="text-xs text-amber-600 font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Pune, Maharashtra
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">Properties matching 3BHK Apartments in Baner</h2>
            <p className="text-zinc-500 text-sm font-medium">Viewing your handpicked and curated matches in your preferred locations.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-sm p-1">
              <button className="px-5 py-2 text-sm font-semibold bg-zinc-100 text-zinc-900 rounded-md">For Buy</button>
              <button className="px-5 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition">For Rent</button>
            </div>
            <button className="flex items-center gap-2 border border-zinc-200 bg-white px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 transition">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <button className="flex items-center gap-2 border border-zinc-200 bg-white px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 transition">
              Sort: Relevance <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Applied Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-10 border-b border-zinc-200 pb-8">
          <span className="text-sm text-zinc-500 font-medium mr-2">Applied:</span>
          <span className="bg-amber-100/50 text-amber-800 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border border-amber-200/50">Baner, Pune <button className="hover:text-amber-950">×</button></span>
          <span className="bg-white text-zinc-700 px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 border border-zinc-200 shadow-sm">3BHK <button className="hover:text-zinc-900">×</button></span>
          <span className="bg-white text-zinc-700 px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 border border-zinc-200 shadow-sm">Ready to Move <button className="hover:text-zinc-900">×</button></span>
          <button className="text-sm text-amber-600 font-medium hover:underline ml-2">Clear All</button>
        </div>

        {/* Property Cards */}
        <div className="space-y-6">
          {properties.map((property: any) => (
            <div key={property.id} className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition duration-300 group">
              <div className="relative w-full md:w-80 h-64 md:h-auto shrink-0 overflow-hidden">
                <Image
                  src={property.image}
                  alt={property.name}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-700"
                />
                {property.label && (
                  <div className="absolute top-4 left-4 bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md">
                    {property.label}
                  </div>
                )}
                <button className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur rounded-full text-zinc-600 hover:text-rose-500 hover:bg-white transition shadow-sm">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/50">{property.developer}</span>
                        <span className="text-xs font-medium text-zinc-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {property.location}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">{property.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-zinc-900 tracking-tight">{property.price}</div>
                      <div className="text-xs font-medium text-zinc-500 mt-1">{property.priceSuffix}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-5 py-5 border-y border-zinc-100 my-5 bg-zinc-50/50 rounded-xl px-4">
                    <div className="flex items-center gap-2.5 text-sm text-zinc-800 font-semibold">
                      <Grid className="w-4 h-4 text-amber-600" /> {property.bhk}
                    </div>
                    <div className="w-px h-5 bg-zinc-200"></div>
                    <div className="flex items-center gap-2.5 text-sm text-zinc-800 font-semibold">
                      <Grid className="w-4 h-4 text-amber-600" /> {property.sqft}
                    </div>
                    <div className="w-px h-5 bg-zinc-200"></div>
                    <div className="flex items-center gap-2.5 text-sm text-zinc-800 font-semibold">
                      <Key className="w-4 h-4 text-amber-600" /> {property.status}
                    </div>
                  </div>

                  <p className="text-sm text-zinc-600 leading-relaxed line-clamp-2 mb-5">
                    {property.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6 md:mb-0">
                    {property.tags && property.tags.map((tag: string) => (
                      <span key={tag} className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200/50 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-4 mt-6">
                  <button className="px-6 py-3 border border-zinc-300 rounded-lg text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition">
                    View Details
                  </button>
                  <button className="px-6 py-3 bg-zinc-900 rounded-lg text-sm font-semibold text-white hover:bg-zinc-800 transition shadow-md hover:shadow-lg flex items-center gap-2">
                    Instant Enquiry <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-20 bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="bg-zinc-950 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight">
                <Grid className="w-5 h-5 text-amber-500" /> Institutional Comparison & Evaluation Sheet
              </h3>
              <p className="text-sm text-zinc-400 mt-1">Compare upto 4 properties simultaneously. Evaluation is based on 40+ analytical metrics.</p>
            </div>
            <button className="text-sm bg-zinc-800 hover:bg-zinc-700 font-semibold px-5 py-2.5 rounded-lg border border-zinc-700 transition shadow-sm">
              Compare Selected Properties
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-5 w-12"><input type="checkbox" className="rounded border-zinc-300 text-zinc-900 w-4 h-4" /></th>
                  <th className="px-6 py-5">Property & Developer</th>
                  <th className="px-6 py-5">Typology & Size</th>
                  <th className="px-6 py-5">Base Price & Status</th>
                  <th className="px-6 py-5">Additional Info</th>
                  <th className="px-6 py-5 text-right">Final Score (0-10)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {properties.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-zinc-50/80 transition group">
                    <td className="px-6 py-5"><input type="checkbox" className="rounded border-zinc-300 text-zinc-900 w-4 h-4 cursor-pointer" /></td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-zinc-900 text-base">{row.name}</div>
                      <div className="text-xs text-zinc-500 mt-1 font-medium">{row.developer}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-semibold text-zinc-800">{row.bhk}</div>
                      <div className="text-xs text-zinc-500 mt-1">{row.sqft}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-zinc-900 text-base">{row.price}</div>
                      <div className="text-xs text-zinc-500 mt-1">{row.status}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-block bg-zinc-100 text-zinc-700 px-3 py-1.5 rounded-md text-xs font-semibold border border-zinc-200/60">{row.tags?.[0] || 'Premium'}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 inline-block px-4 py-1.5 rounded-lg text-base">{row.score || "8.0/10"}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Insights Section */}
      <section className="bg-white border-t border-zinc-200 py-20 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 mb-3 tracking-tight">Latest Real Estate Insights for Baner & 3 BHK Apartments</h2>
              <p className="text-zinc-500 font-medium text-lg">Read market trends, guides, and investment insights to make informed decisions.</p>
            </div>
            <button className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 group">
              View All Articles <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {insights.map((article: any, i: number) => (
              <div key={i} className="bg-zinc-50 rounded-2xl shadow-sm border border-zinc-200 overflow-hidden group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition duration-300">
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-zinc-900/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md shadow-md">
                    {article.category}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="font-bold text-xl text-zinc-900 mb-3 group-hover:text-amber-600 transition leading-tight">{article.title}</h3>
                  <p className="text-sm text-zinc-600 mb-6 line-clamp-3 leading-relaxed">{article.description}</p>
                  <div className="text-amber-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-wide">
                    Read Report <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="bg-zinc-900 py-20 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Need tailored sovereign advice or private off-market listings?</h3>
              <p className="text-zinc-400 text-lg max-w-xl">Connect directly with our dedicated real estate advisors. No spam, just curated recommendations tailored to your bespoke requirements.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <button className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-zinc-950 px-8 py-4 rounded-xl font-bold transition shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)]">
                Schedule A Call
              </button>
              <button className="w-full sm:w-auto border-2 border-zinc-600 hover:border-zinc-500 hover:bg-zinc-700/50 text-white px-8 py-4 rounded-xl font-bold transition">
                WhatsApp Advisory
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-zinc-950 text-zinc-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-600 text-black font-bold p-1.5 rounded-md text-xs">AR</div>
              <span className="font-bold text-xl text-white tracking-tight">ANV REALTY</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-zinc-500">
              <a href="#" className="hover:text-amber-500 transition">Curated Portfolio</a>
              <a href="#" className="hover:text-amber-500 transition">Verify and Advisory</a>
              <a href="#" className="hover:text-amber-500 transition">RERA Compliance & Norms</a>
              <a href="#" className="hover:text-amber-500 transition">Privacy Console</a>
              <a href="#" className="hover:text-amber-500 transition">Internal Guidelines</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-zinc-600 text-center md:text-left font-medium">
              We exclusively handle premium and luxury real estate in bespoke tier-1 cities. All information is for reference only.
              <br/>&copy; {new Date().getFullYear()} ANV Realty. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <button className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 border border-zinc-700 transition">
                <Grid className="w-3.5 h-3.5" /> Compare (Max 4 Properties)
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
