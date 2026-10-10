import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PublicHeader } from '@/components/public/PublicHeader';
import { HomepageSearchablePortal, BlogItem } from '@/components/public/HomepageSearchablePortal';
import { fetchAllProperties } from '@/lib/property-data';
import { query } from '@/lib/db';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    query?: string;
    locality?: string;
    location?: string;
    bhk?: string;
    priceRange?: string;
    status?: string;
    type?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const qSearch = params.search || params.query || '';
  const qLocality = params.locality || params.location || '';
  const qBhk = params.bhk || '';

  let pageTitle = 'Properties for Sale in Pune | Verified Real Estate Catalog | ANV Reealty';
  let pageDesc = 'Browse curated luxury residential apartments, penthouses, and Grade-A commercial spaces in Pune. 100% MahaRERA & RPS compliant developer pricing with zero brokerage.';

  if (qLocality && qBhk && qLocality !== 'All' && qBhk !== 'All') {
    pageTitle = `${qBhk} Properties for Sale in ${qLocality}, Pune | ANV Reealty`;
    pageDesc = `Explore verified ${qBhk} homes and apartments in ${qLocality}, Pune. RERA registered projects with direct developer pricing and zero brokerage.`;
  } else if (qLocality && qLocality !== 'All') {
    pageTitle = `Properties for Sale in ${qLocality}, Pune | Verified Residences | ANV Reealty`;
    pageDesc = `Explore premium flats, sky suites, and commercial spaces in ${qLocality}, Pune. Institutional title vetting with zero brokerage.`;
  } else if (qBhk && qBhk !== 'All') {
    pageTitle = `${qBhk} for Sale in Pune | Curated Real Estate | ANV Reealty`;
    pageDesc = `Find authenticated ${qBhk} luxury residences across prime Pune corridors including Baner, Koregaon Park, and Kalyani Nagar.`;
  } else if (qSearch.trim()) {
    pageTitle = `Search Results for "${qSearch.trim()}" | ANV Reealty Pune`;
    pageDesc = `Live verified real estate inventory and active registered buyer leads matching "${qSearch.trim()}" in Pune.`;
  }

  const canonicalUrl = `https://anvreeality.com/properties${qLocality || qBhk || qSearch ? `?${new URLSearchParams(params as any).toString()}` : ''}`;

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: canonicalUrl,
      siteName: 'ANV Reealty',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          width: 1200,
          height: 630,
          alt: 'ANV Reealty Curated Portfolio Pune'
        }
      ],
      type: 'website',
      locale: 'en_IN'
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc
    }
  };
}

export default async function PropertiesIndexPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const initialParams = {
    search: rawParams.search || rawParams.query || '',
    locality: rawParams.locality || rawParams.location || 'All',
    bhk: rawParams.bhk || 'All',
    priceRange: rawParams.priceRange || 'All',
    status: rawParams.status || 'All'
  };

  const properties = await fetchAllProperties();

  // Fetch blogs for correlation
  let insights: BlogItem[] = [
    {
      id: "1",
      title: "Baner Property Market Guide: 2026 Price Appreciation",
      description: "An in-depth analysis of property trends in Baner and what to expect in the next 3 years.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Market Report",
      locality: "Baner",
      connectedTypology: "3 BHK Luxury",
      readTime: "6 min read",
      author: "Unassigned"
    },
    {
      id: "2",
      title: "Guide to Buying a 3 BHK Apartment in Pune: Costs & Taxes",
      description: "Everything you need to know about stamp duty, registration charges, and GST implications in Pune.",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Buying Guide",
      locality: "Pune",
      connectedTypology: "3 BHK",
      readTime: "8 min read",
      author: "Jennifer Desai"
    }
  ];

  try {
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
  } catch (e) {
    // Fallback
  }

  // Schema.org structured data for Real Estate ItemList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Verified Properties in Pune',
    description: 'Explore verified residential apartments, penthouses, and Grade-A commercial office spaces in Pune.',
    numberOfItems: properties.length,
    itemListElement: properties.map((prop, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': prop.isCommercial ? 'CommercialBuilding' : 'SingleFamilyResidence',
        name: prop.name,
        description: prop.description,
        image: prop.image,
        url: `https://anvreeality.com/properties/${prop.slug}`,
        offers: {
          '@type': 'Offer',
          price: prop.priceRaw || 15000000,
          priceCurrency: 'INR'
        }
      }
    }))
  };

  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://anvreeality.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Properties',
        item: 'https://anvreeality.com/properties'
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <PublicHeader />

      <main className="flex-1 flex flex-col">
        <HomepageSearchablePortal
          initialProperties={properties}
          initialBlogs={insights}
          initialSearchParams={initialParams}
          isDedicatedSearchPage={true}
        />
      </main>

      {/* Footer */}
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
              <Link href="/properties" className="hover:text-amber-400 text-amber-400 font-bold transition">All Properties</Link>
              <Link href="/blogs" className="hover:text-amber-400 transition">Market Insights</Link>
              <Link href="/compare" className="hover:text-amber-400 transition">Comparison Matrix</Link>
              <Link href="/saved" className="hover:text-amber-400 transition">Saved Shortlist</Link>
              <Link href="/login" className="hover:text-amber-400 transition">Patron Portal</Link>
              <Link href="/admin" className="hover:text-amber-400 transition">Website Admin</Link>
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
