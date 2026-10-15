import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIES_DATA, getCategoryBySlug } from '@/lib/categories-data';
import { query } from '@/lib/db';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { CategoryDetailPageClient } from '@/components/public/CategoryDetailPageClient';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all 17 categories to enable instant static rendering
export async function generateStaticParams() {
  return CATEGORIES_DATA.map((cat) => ({
    slug: cat.slug,
  }));
}

// Generate rich SEO metadata for Google
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Real Estate Categories | ANV Reealty Pune',
      description: 'Explore verified commercial, residential, and investment real estate assets in Pune.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://anvreeality.com';
  const canonicalUrl = `${baseUrl}/category/${category.slug}`;

  return {
    title: category.metaTitle,
    description: category.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: category.metaTitle,
      description: category.metaDescription,
      url: canonicalUrl,
      siteName: 'ANV REEALTY',
      type: 'website',
      locale: 'en_IN',
      images: [
        {
          url: category.heroImage,
          width: 1200,
          height: 630,
          alt: `${category.title} in Pune - ANV Reealty`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: category.metaTitle,
      description: category.metaDescription,
      images: [category.heroImage],
    },
    keywords: [
      `${category.title} in Pune`,
      `Pune ${category.title} for sale`,
      `${category.shortTitle} real estate Pune`,
      'ANV Reealty',
      'MahaRERA verified properties',
      'commercial real estate Pune',
      'zero brokerage properties'
    ]
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Fetch live properties from PostgreSQL database matching this category
  let matchingProperties: any[] = [];
  try {
    const isComm = category.group === 'commercial' || category.group === 'specialized';
    
    // Search database for matching inventory
    const searchTerms = [category.title, category.shortTitle, category.slug.replace(/-/g, ' ')];
    const ilikePatterns = searchTerms.map(t => `%${t}%`);

    const dbProps = await query(`
      SELECT 
        p.id, p.slug, p.title as name, p.description, p.address as location,
        p.price, p."carpetArea" as sqft_num, p.bedrooms as bhk_num, p.configuration, p.status, p."isFeatured" as featured,
        COALESCE(proj.developer, 'ANV Verified Developer') as developer,
        COALESCE(proj."reraNumber", 'PRM/PUN/RERA/2026/0491') as rera_number,
        COALESCE(loc.name, 'Koregaon Park') as locality,
        COALESCE(pt.name, 'Commercial') as type_name,
        COALESCE(img.url, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80') as image
      FROM "Property" p
      LEFT JOIN "Project" proj ON p."projectId" = proj.id
      LEFT JOIN "Location" loc ON p."locationId" = loc.id
      LEFT JOIN "PropertyType" pt ON p."propertyTypeId" = pt.id
      LEFT JOIN LATERAL (
        SELECT url FROM "PropertyImage" WHERE "propertyId" = p.id ORDER BY "sortOrder" ASC LIMIT 1
      ) img ON true
      WHERE p."publishStatus" = 'Published'
        AND (
          pt.name ILIKE ANY($1)
          OR p.title ILIKE ANY($1)
          OR p.configuration ILIKE ANY($1)
          OR ($2 = true AND (pt.name ILIKE '%commercial%' OR p.title ILIKE '%office%' OR p.title ILIKE '%commercial%'))
          OR ($2 = false AND (pt.name ILIKE '%residential%' OR pt.name ILIKE '%apartment%' OR p.bedrooms > 0))
        )
      ORDER BY p."isFeatured" DESC, p."createdAt" DESC
      LIMIT 6;
    `, [ilikePatterns, isComm]);

    if (dbProps && dbProps.length > 0) {
      matchingProperties = dbProps.map((p: any) => {
        const numPrice = Number(p.price) || 15000000;
        const formattedPrice =
          numPrice >= 10000000
            ? `₹${(numPrice / 10000000).toFixed(2)} Cr`
            : `₹${(numPrice / 100000).toFixed(1)} Lakh`;

        return {
          id: String(p.id),
          name: p.name,
          developer: p.developer,
          locality: p.locality,
          location: p.location || `${p.locality}, Pune, Maharashtra`,
          price: formattedPrice,
          bhk: p.configuration || (p.bhk_num ? `${p.bhk_num} BHK` : category.shortTitle),
          sqft: p.sqft_num ? `${Number(p.sqft_num).toLocaleString()} Sq.Ft. Carpet` : '1,200 Sq.Ft.',
          status: p.status || 'Ready to Move',
          description: p.description,
          image: p.image,
          featured: !!p.featured
        };
      });
    }
  } catch (err) {
    console.warn(`Database query notice for category ${category.slug}:`, err);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://anvreeality.com';

  // Schema.org JSON-LD Structured Data for Breadcrumbs, CollectionPage, and FAQs
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Categories',
            item: `${baseUrl}/properties`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: category.title,
            item: `${baseUrl}/category/${category.slug}`,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: category.metaTitle,
        description: category.metaDescription,
        url: `${baseUrl}/category/${category.slug}`,
        provider: {
          '@type': 'RealEstateAgent',
          name: 'ANV REEALTY',
          url: baseUrl,
          telephone: '+919766137115',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'East Wing, M.G. Road, Camp',
            addressLocality: 'Pune',
            addressRegion: 'Maharashtra',
            postalCode: '411001',
            addressCountry: 'IN',
          },
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: category.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900">
        <PublicHeader />
        <main className="flex-1">
          <CategoryDetailPageClient
            category={category}
            matchingProperties={matchingProperties}
          />
        </main>
        <PublicFooter />
      </div>
    </>
  );
}
