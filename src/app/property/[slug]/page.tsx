import { redirect } from 'next/navigation';
import { getPropertyBySlugOrId } from '@/lib/property-data';
import { getPropertyUrl } from '@/lib/slug';

export default async function PropertySingularRedirect({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlugOrId(slug);
  if (property) {
    redirect(getPropertyUrl(property));
  }
  redirect(`/properties/${slug}`);
}
