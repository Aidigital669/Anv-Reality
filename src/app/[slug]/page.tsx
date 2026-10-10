import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPropertyBySlugOrId, ALL_FALLBACK_PROPERTIES } from '@/lib/property-data';
import { getPropertySlug, getPropertyUrl } from '@/lib/slug';
import { PropertyDetailPageClient } from '@/components/public/PropertyDetailPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlugOrId(slug);

  if (!property) {
    return {
      title: 'Property Dossier | ANV Reealty Pune',
      description: 'Explore verified luxury and commercial real estate properties across Pune Western and Eastern corridors.'
    };
  }

  const title = `${property.name} in ${property.locality || 'Pune'} | ${property.price} | ANV Reealty`;
  const description = `${property.bhk} luxury residence in ${property.location} by ${property.developer}. RERA Registered: ${property.reraNumber || 'Verified'}. Quoted Price: ${property.price}. Zero brokerage on developer inventory.`;
  const canonicalUrl = `https://anvreeality.com${getPropertyUrl(property)}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'ANV Reealty',
      images: [
        {
          url: property.image,
          width: 1200,
          height: 630,
          alt: property.name,
        }
      ],
      type: 'website',
      locale: 'en_IN'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [property.image]
    }
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlugOrId(slug);

  const activeProperty = property || ALL_FALLBACK_PROPERTIES[0];

  const canonicalSlug = activeProperty ? (activeProperty.slug || getPropertySlug(activeProperty)) : slug;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': activeProperty.isCommercial ? 'CommercialBuilding' : 'SingleFamilyResidence',
    name: activeProperty.name,
    description: activeProperty.description,
    image: activeProperty.images && activeProperty.images.length > 0 ? activeProperty.images : [activeProperty.image],
    address: {
      '@type': 'PostalAddress',
      streetAddress: activeProperty.location,
      addressLocality: activeProperty.locality || 'Pune',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 18.5204,
      longitude: 73.8567
    },
    offers: {
      '@type': 'Offer',
      price: activeProperty.priceRaw || 15000000,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `https://anvreeality.com/properties/${canonicalSlug}`
    }
  };

  const breadcrumbJsonLd = {
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
        name: 'Properties in Pune',
        item: 'https://anvreeality.com/properties'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: activeProperty.locality || 'Pune',
        item: `https://anvreeality.com/properties?locality=${encodeURIComponent(activeProperty.locality || 'Pune')}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: activeProperty.name,
        item: `https://anvreeality.com/properties/${canonicalSlug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PropertyDetailPageClient initialProperty={activeProperty} identifier={slug} />
    </>
  );
}
