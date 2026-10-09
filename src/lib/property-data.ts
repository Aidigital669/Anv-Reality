import { query } from '@/lib/db';
import { getPropertySlug, matchesProperty } from '@/lib/slug';

export interface PropertyItem {
  id: string;
  slug?: string;
  name: string;
  developer: string;
  locality?: string;
  location: string;
  price: string;
  priceRaw?: number;
  priceSuffix?: string;
  bhk: string;
  bhkNum?: number;
  sqft: string;
  sqftNum?: number;
  status: string;
  description: string;
  image: string;
  images?: string[];
  videoUrl?: string;
  videoThumbnail?: string;
  tags?: string[];
  reraNumber?: string;
  rpsStatus?: string;
  featured?: boolean;
  label?: string;
  score?: string;
  isCommercial?: boolean;
}

export const ALL_FALLBACK_PROPERTIES: PropertyItem[] = [];


export async function fetchAllProperties(): Promise<PropertyItem[]> {
  try {
    const dbProps = await query(`
      SELECT 
        p.id, p.slug, p.title as name, p.description, p.address as location,
        p.price, p."carpetArea" as sqft_num, p.bedrooms as bhk_num, p.status, p."isFeatured" as featured,
        COALESCE(proj.developer, 'ANV Signature Partner') as developer,
        COALESCE(proj."reraNumber", 'PRM/PUN/RERA/2026/0491') as rera_number,
        COALESCE(loc.name, 'Koregaon Park') as locality,
        COALESCE(pt.name, 'Apartment') as type_name,
        COALESCE(img.url, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80') as image,
        imgs.urls as all_images
      FROM "Property" p
      LEFT JOIN "Project" proj ON p."projectId" = proj.id
      LEFT JOIN "Location" loc ON p."locationId" = loc.id
      LEFT JOIN "PropertyType" pt ON p."propertyTypeId" = pt.id
      LEFT JOIN LATERAL (
        SELECT url FROM "PropertyImage" WHERE "propertyId" = p.id ORDER BY "sortOrder" ASC LIMIT 1
      ) img ON true
      LEFT JOIN LATERAL (
        SELECT array_agg(url ORDER BY "sortOrder" ASC) as urls FROM "PropertyImage" WHERE "propertyId" = p.id
      ) imgs ON true
      WHERE p."publishStatus" = 'Published'
      ORDER BY p."isFeatured" DESC, p."createdAt" DESC;
    `);

    if (dbProps && dbProps.length > 0) {
      return dbProps.map((p: any) => {
        const numPrice = Number(p.price) || 15000000;
        const formattedPrice =
          numPrice >= 10000000
            ? `₹${(numPrice / 10000000).toFixed(2)} Cr`
            : `₹${(numPrice / 100000).toFixed(1)} Lakh`;

        const isCommercial =
          (p.type_name && p.type_name.toLowerCase().includes('commercial')) ||
          (p.name && (p.name.toLowerCase().includes('commercial') || p.name.toLowerCase().includes('office'))) ||
          p.bhk_num === null ||
          p.bhk_num === 0;

        const bhkStr = isCommercial
          ? "Commercial Office"
          : (p.bhk_num ? `${p.bhk_num} BHK` : "3 BHK");

        const sqftStr = p.sqft_num ? `${Number(p.sqft_num).toLocaleString()} Sq.Ft. Carpet` : "1,200 Sq.Ft. Carpet";
        const defaultDesc = isCommercial
          ? `Grade-A corporate office space in ${p.locality}, Pune. Landmark business address with optimized workspace efficiency and airport corridor connectivity.`
          : `Spacious and luxurious ${bhkStr} residence in ${p.locality}. High floor inventory with scenic skyline views.`;

        const resolvedImages = (p.all_images && Array.isArray(p.all_images) && p.all_images.length > 1)
          ? p.all_images
          : (p.image ? [p.image] : [ALL_FALLBACK_PROPERTIES[0].image]);

        const videoUrl = isCommercial
          ? "https://assets.mixkit.co/videos/preview/mixkit-modern-office-space-with-desks-and-chairs-41366-large.mp4"
          : "https://assets.mixkit.co/videos/preview/mixkit-view-of-a-luxurious-modern-house-41505-large.mp4";

        const videoThumbnail = isCommercial
          ? "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
          : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

        const tags = isCommercial
          ? ["Grade-A Tower", "Warm Shell", "Airport & KP Connectivity", "100% DG Backup"]
          : ["RPS / RERA Verified", "Vastu Compliant", "Private Balcony"];

        const label = isCommercial
          ? "Commercial Landmark"
          : (p.featured ? "Top Choice" : "New Launch");

        const finalSlug = p.slug || getPropertySlug({ id: p.id, name: p.name, locality: p.locality });

        return {
          id: String(p.id),
          slug: finalSlug,
          name: p.name,
          developer: p.developer,
          locality: p.locality,
          location: p.location || `${p.locality}, Pune, Maharashtra`,
          price: formattedPrice,
          priceRaw: numPrice,
          priceSuffix: "All Inclusive",
          bhk: bhkStr,
          bhkNum: p.bhk_num || 0,
          sqft: sqftStr,
          sqftNum: Number(p.sqft_num) || 1200,
          status: p.status || "Ready to Move",
          reraNumber: p.rera_number || (isCommercial ? "PRM/PUN/COM/2026/0882" : "PRM/PUN/RERA/2026/0491"),
          rpsStatus: isCommercial ? "RPS Verified Commercial" : "RPS & MahaRERA Registered",
          description: p.description || defaultDesc,
          image: p.image,
          images: resolvedImages,
          videoUrl,
          videoThumbnail,
          tags,
          featured: !!p.featured,
          label,
          score: isCommercial ? "9.5/10" : "9.2/10",
          isCommercial
        };
      });
    }
  } catch (err) {
    console.warn("DB property fetch fallback:", err);
  }

  return ALL_FALLBACK_PROPERTIES;
}

export async function getPropertyBySlugOrId(identifier: string): Promise<PropertyItem | null> {
  const all = await fetchAllProperties();
  const found = all.find((p) => matchesProperty(p, identifier));
  if (found) return found;

  const fallbackFound = ALL_FALLBACK_PROPERTIES.find((p) => matchesProperty(p, identifier));
  return fallbackFound || null;
}
