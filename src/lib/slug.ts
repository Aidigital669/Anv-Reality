/**
 * SEO-Friendly Slug & URL Utilities for Properties and Search Routing
 */

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace slash, parenthetical content, and special symbols
    .replace(/[/\\]+/g, '-')
    .replace(/[()\[\]{}]+/g, ' ')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const KNOWN_PROPERTY_SLUGS: Record<string, string> = {
  '24': 'commercial-office-in-it-park-for-sale-in-kalyani-nagar-pune',
  '23': 'prelease-commercial-medical-hospital-premise-for-sale-in-undri-pune',
  '22': 'westview-by-panchshil-realty-commercial-office-space',
  '21': '2480-sq-ft-commercial-office-space-for-sale-in-wakad',
  '20': 'commercial-medical-hospital-premise-for-sale-in-undri-pune',
  '18': 'vtp-altair-residences-3-bhk',
  '14': 'commercial-office-in-it-park-for-sale-in-kalyani-nagar-pune-5731-102',
  '13': 'commercial-office-space-koregaon-park-pune',
  '12': 'worli-seaface-presidential-sky-suite',
  '11': 'panchshil-sky-penthouse-kharadi',
  '10': 'godrej-hillside-reserve-mahalunge',
  '9': 'kohinoor-presidentia-bavdhan',
  '8': 'the-sovereign-horizon-estate-kalyani-nagar',
  '7': 'vtp-altair-residences-baner',
  '6': 'shivajinagar-embassy-penthouse-model-colony',
  '5': 'anv-heights-sky-suite-baner',
  '4': 'godrej-hillside-reserve-mahalunge',
  '3': 'kohinoor-presidentia-bavdhan',
  '2': 'the-sovereign-horizon-estate-kalyani-nagar',
  '1': 'vtp-altair-residences-baner',
};

export function getPropertySlug(property: {
  id?: string | number;
  name?: string;
  slug?: string | null;
  locality?: string;
}): string {
  if (property.slug && typeof property.slug === 'string' && property.slug.trim()) {
    return slugify(property.slug);
  }

  const idStr = property.id !== undefined && property.id !== null ? String(property.id) : '';
  if (idStr && KNOWN_PROPERTY_SLUGS[idStr]) {
    return KNOWN_PROPERTY_SLUGS[idStr];
  }

  if (property.name) {
    const baseSlug = slugify(property.name);
    if (property.locality && !baseSlug.includes(slugify(property.locality))) {
      return `${baseSlug}-${slugify(property.locality)}`;
    }
    return baseSlug;
  }

  return idStr ? `property-${idStr}` : 'curated-residence';
}

export function getPropertyCategorySlug(property: {
  name?: string;
  bhk?: string;
  isCommercial?: boolean;
  type_name?: string;
  description?: string;
}): string {
  const text = `${property.name || ''} ${property.bhk || ''} ${property.type_name || ''} ${property.description || ''}`.toLowerCase();
  
  if (/\b(?:hospital|medical|clinic|healthcare|doctor)\b/i.test(text)) {
    return 'hospital';
  }
  if (/\b(?:prelease|pre-lease|preleased|pre-leased|roi|rented)\b/i.test(text)) {
    return 'preleased';
  }
  if (/\b(?:showroom|retail|shop|store)\b/i.test(text)) {
    return 'showroom';
  }
  if (/\b(?:office|commercial|it park|workspace|corporate)\b/i.test(text)) {
    return 'commercial-office';
  }
  if (/\b(?:penthouse)\b/i.test(text)) {
    return 'penthouse';
  }
  if (/\b(?:land|plot)\b/i.test(text)) {
    return 'land';
  }
  if (/\b(?:bhk|apartment|flat|residence|villa)\b/i.test(text)) {
    return 'residential';
  }
  return property.isCommercial ? 'commercial' : 'residential';
}

export function getPropertyUrl(property: {
  id?: string | number;
  name?: string;
  slug?: string | null;
  locality?: string;
  bhk?: string;
  isCommercial?: boolean;
}): string {
  const category = getPropertyCategorySlug(property);
  const slug = getPropertySlug(property);
  return `/${category}/${slug}`;
}

export function matchesProperty(property: any, identifier: string): boolean {
  if (!property || !identifier) return false;
  const decoded = decodeURIComponent(identifier).trim().toLowerCase();
  
  // 1. Direct ID match
  if (String(property.id) === decoded) return true;

  // 2. Direct database slug match
  if (property.slug && String(property.slug).toLowerCase() === decoded) return true;

  // 3. Computed slug match
  const computedSlug = getPropertySlug(property).toLowerCase();
  if (computedSlug === decoded) return true;

  // 4. Name slug match
  if (property.name && slugify(property.name) === decoded) return true;

  // 5. Check if known slug maps to property ID
  const knownId = Object.entries(KNOWN_PROPERTY_SLUGS).find(([_, slug]) => slug === decoded)?.[0];
  if (knownId && String(property.id) === knownId) return true;

  // 6. Substring match for slugs with random hash suffixes
  if (property.slug) {
    const dbSlug = String(property.slug).toLowerCase();
    if (dbSlug.startsWith(decoded) || decoded.startsWith(dbSlug)) return true;
  }
  if (computedSlug) {
    if (computedSlug.startsWith(decoded) || decoded.startsWith(computedSlug)) return true;
  }

  return false;
}
