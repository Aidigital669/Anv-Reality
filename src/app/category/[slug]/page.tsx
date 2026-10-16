import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { CATEGORIES_DATA, getCategoryBySlug } from '@/lib/categories-data';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES_DATA.map((cat) => ({
    slug: cat.slug,
  }));
}

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
  const canonicalUrl = `${baseUrl}/${category.slug}`;

  return {
    title: category.metaTitle,
    description: category.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Redirect /category/:slug directly to the top-level URL e.g. /category/hospital ==> /hospital
  redirect(`/${category.slug}`);
}
