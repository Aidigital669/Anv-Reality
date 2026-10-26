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
  videoUrl?: string | null;
  videoThumbnail?: string | null;
  tags?: string[];
  reraNumber?: string;
  rpsStatus?: string;
  featured?: boolean;
  label?: string;
  score?: string;
  isCommercial?: boolean;
  listingType?: 'Sale' | 'Rent' | 'Buy' | string;
  businessPurposes?: { id: number; name: string; slug: string }[];
}

export const ALL_FALLBACK_PROPERTIES: PropertyItem[] = [];
