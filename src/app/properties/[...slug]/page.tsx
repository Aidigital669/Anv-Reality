import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getPropertyBySlugOrId } from '@/lib/property-data';
import { getPropertyUrl, getPropertyCategorySlug, getPropertySlug } from '@/lib/slug';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    return {
      title: 'Properties in Pune | ANV Reealty',
      description: 'Explore verified luxury and commercial real estate properties across Pune.'
    };
  }

  const identifier = slug[slug.length - 1];
  const property = (await getPropertyBySlugOrId(identifier)) ||
    (slug.length > 1 ? await getPropertyBySlugOrId(slug[0]) : null);

  if (!property) {
    return {
      title: 'Property Dossier | ANV Reealty Pune',
      description: 'Explore verified luxury and commercial real estate properties across Pune Western and Eastern corridors.'
    };
  }

  const category = getPropertyCategorySlug(property);
  const canonicalSlug = property.slug || getPropertySlug(property);
  const title = `${property.name} in ${property.locality || 'Pune'} | ${property.price} | ANV Reealty`;
  const description = `${property.bhk} ${category} in ${property.location} by ${property.developer}. RERA Registered: ${property.reraNumber || 'Verified'}. Quoted Price: ${property.price}. Zero brokerage on developer inventory.`;
  const canonicalUrl = `https://anvreeality.com/${category}/${canonicalSlug}`;

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

export default async function PropertyDetailPageCatchAll({ params }: PageProps) {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    redirect('/properties');
  }

  // 1. Identify property from segments (check last segment first e.g. /properties/hospital/23 or /properties/23)
  const identifier = slug[slug.length - 1];
  let property = await getPropertyBySlugOrId(identifier);

  // 2. If not found by last segment, check earlier segments
  if (!property && slug.length > 1) {
    property = await getPropertyBySlugOrId(slug[0]);
  }
  if (!property && slug.length > 1) {
    property = await getPropertyBySlugOrId(slug.join('-'));
  }

  // 3. If still not found, check if it's a category route like /properties/hospital or /properties/commercial
  if (!property && slug.length === 1) {
    const rawCat = slug[0].toLowerCase();
    if (rawCat === 'hospital' || rawCat === 'medical') {
      redirect('/hospital');
    }
    if (rawCat === 'office' || rawCat === 'commercial') {
      redirect('/office-space');
    }
    if (rawCat === 'preleased' || rawCat === 'prelease') {
      redirect('/preleased-properties');
    }
    if (rawCat === 'showroom' || rawCat === 'shop') {
      redirect('/shop-showroom');
    }
  }

  // 4. Clean direct redirection from legacy /properties/... to direct /[category]/[propertySlug]
  if (property) {
    redirect(getPropertyUrl(property));
  }

  notFound();
}
