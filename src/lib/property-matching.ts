/**
 * Property Matching & Relevance Engine for ANV REEALTY
 * Evaluates user queries against properties with strict category boundaries
 * so users only see accurate, relevant property cards.
 */

export interface PropertyMatchCriteria {
  isHospital: boolean;
  isShowroom: boolean;
  isOffice: boolean;
  isShop: boolean;
  isWarehouse: boolean;
  isLand: boolean;
  isPreleased: boolean;
  isResidential: boolean;
  isPenthouse: boolean;
  bhkNum: number | null;
  locality: string | null;
  hasSpecificIntent: boolean;
}

export const KNOWN_PUNE_LOCALITIES = [
  'koregaon park',
  'baner',
  'balewadi',
  'kalyani nagar',
  'bavdhan',
  'mahalunge',
  'shivajinagar',
  'kharadi',
  'viman nagar',
  'hinjewadi',
  'wakad',
  'undri',
  'nibm',
  'camp',
  'bund garden',
  'magarpatta',
  'hadapsar',
  'wagholi',
  'talegaon',
  'mohammadwadi'
];

/**
 * Parses user search query into structured criteria flags
 */
export function parseQueryCriteria(queryText: string): PropertyMatchCriteria {
  const lower = queryText.toLowerCase();

  const isHospital = /\b(?:hospital|clinic|medical|doctor|healthcare|nursing\s*home|dispensary|bed\s*setup)\b/i.test(lower);
  const isShowroom = /\b(?:showroom|display\s*center)\b/i.test(lower);
  const isOffice = /\b(?:office|it\s*park|coworking|workspace|corporate\s*desk|desk\s*space)\b/i.test(lower);
  const isShop = /\b(?:shop|retail\s*shop|store)\b/i.test(lower) && !isHospital && !isShowroom;
  const isWarehouse = /\b(?:warehouse|godown|storage|logistics)\b/i.test(lower);
  const isLand = /\b(?:plot|land|agricultural|industrial\s*plot)\b/i.test(lower);
  const isPreleased = /\b(?:pre[-_\s]*leased|pre[-_\s]*rented|rental\s*yield|roi|passive\s*income)\b/i.test(lower);
  const isPenthouse = /\b(?:penthouse|sky\s*villa|sky\s*suite)\b/i.test(lower);

  const bhkMatch = lower.match(/\b([1-5])\s*bhk\b/i);
  const bhkNum = bhkMatch ? parseInt(bhkMatch[1], 10) : null;

  const isResidential =
    bhkNum !== null ||
    isPenthouse ||
    /\b(?:apartment|flat|residence|residential|villa|bungalow|home)\b/i.test(lower);

  let matchedLocality: string | null = null;
  for (const loc of KNOWN_PUNE_LOCALITIES) {
    if (new RegExp(`\\b${loc}\\b`, 'i').test(lower)) {
      matchedLocality = loc;
      break;
    }
  }

  const hasSpecificIntent =
    isHospital ||
    isShowroom ||
    isOffice ||
    isShop ||
    isWarehouse ||
    isLand ||
    isPreleased ||
    isPenthouse ||
    bhkNum !== null ||
    isResidential ||
    matchedLocality !== null;

  return {
    isHospital,
    isShowroom,
    isOffice,
    isShop,
    isWarehouse,
    isLand,
    isPreleased,
    isResidential,
    isPenthouse,
    bhkNum,
    locality: matchedLocality,
    hasSpecificIntent
  };
}

/**
 * Calculates a relevance score for a property against query criteria.
 * Returns negative score if property strictly contradicts the query intent.
 */
export function scorePropertyMatch(
  prop: {
    name: string;
    locality?: string;
    location?: string;
    description?: string;
    bhk?: string;
    bhkNum?: number;
    isCommercial?: boolean;
  },
  criteria: PropertyMatchCriteria
): number {
  if (!criteria.hasSpecificIntent) {
    return 10; // Default base score for generic browsing
  }

  const titleAndDesc = `${prop.name || ''} ${prop.locality || ''} ${prop.location || ''} ${prop.description || ''} ${prop.bhk || ''}`.toLowerCase();

  // 1. HOSPITAL & MEDICAL (Strict Exclusion)
  if (criteria.isHospital) {
    const isPropHospital = /\b(?:hospital|medical|clinic|doctor|healthcare|dispensary)\b/i.test(titleAndDesc);
    if (isPropHospital) {
      let score = 150;
      if (criteria.locality && titleAndDesc.includes(criteria.locality)) {
        score += 80;
      }
      return score;
    }
    // STRICT DISQUALIFICATION: Never return general offices or apartments for hospital searches!
    return -999;
  }

  // 2. SHOWROOM
  if (criteria.isShowroom) {
    const isPropShowroom = /\b(?:showroom)\b/i.test(titleAndDesc);
    if (isPropShowroom) {
      let score = 150;
      if (criteria.locality && titleAndDesc.includes(criteria.locality)) score += 80;
      return score;
    }
    // If user asked "Showroom & Office", an office is acceptable as secondary
    if (criteria.isOffice && /\b(?:office|it\s*park|workspace)\b/i.test(titleAndDesc)) {
      return 60;
    }
    return -500;
  }

  // 3. WAREHOUSE & INDUSTRIAL
  if (criteria.isWarehouse) {
    if (/\b(?:warehouse|godown|storage|logistics)\b/i.test(titleAndDesc)) return 150;
    return -999;
  }

  // 4. LAND & PLOT
  if (criteria.isLand) {
    if (/\b(?:plot|land|acre|guntha)\b/i.test(titleAndDesc)) return 150;
    return -999;
  }

  // 5. COMMERCIAL OFFICE
  if (criteria.isOffice) {
    // If it's a hospital or residential, disqualify
    if (/\b(?:hospital|medical|clinic)\b/i.test(titleAndDesc)) return -999;
    if (!prop.isCommercial && (prop.bhkNum || 0) > 0) return -999;

    const isPropOffice = /\b(?:office|it\s*park|commercial\s*space|workspace|corporate)\b/i.test(titleAndDesc);
    if (isPropOffice || prop.isCommercial) {
      let score = 120;
      if (criteria.locality && titleAndDesc.includes(criteria.locality)) score += 80;
      return score;
    }
    return -500;
  }

  // 6. RETAIL SHOP
  if (criteria.isShop) {
    if (/\b(?:hospital|medical|clinic)\b/i.test(titleAndDesc)) return -999;
    if (/\b(?:shop|retail)\b/i.test(titleAndDesc)) {
      let score = 130;
      if (criteria.locality && titleAndDesc.includes(criteria.locality)) score += 80;
      return score;
    }
    return -500;
  }

  // 7. PRE-LEASED INVESTMENT
  if (criteria.isPreleased) {
    const isPropPreleased = /\b(?:pre[-_\s]*leased|prelease|pre[-_\s]*rented|roi|yield|investment)\b/i.test(titleAndDesc);
    if (isPropPreleased) {
      let score = 140;
      if (criteria.locality && titleAndDesc.includes(criteria.locality)) score += 80;
      return score;
    }
    // If not pre-leased, lower priority
    return 10;
  }

  // 8. PENTHOUSE / SKY VILLA
  if (criteria.isPenthouse) {
    if (prop.isCommercial) return -999;
    if (/\b(?:penthouse|sky\s*villa|sky\s*suite)\b/i.test(titleAndDesc)) {
      let score = 150;
      if (criteria.locality && titleAndDesc.includes(criteria.locality)) score += 80;
      return score;
    }
    return -500;
  }

  // 9. SPECIFIC BHK (1, 2, 3, 4, 5 BHK)
  if (criteria.bhkNum !== null) {
    if (prop.isCommercial) return -999;
    const propBhkMatches =
      prop.bhkNum === criteria.bhkNum ||
      (prop.bhk && new RegExp(`\\b${criteria.bhkNum}\\s*bhk\\b`, 'i').test(prop.bhk)) ||
      new RegExp(`\\b${criteria.bhkNum}\\s*bhk\\b`, 'i').test(prop.name);

    if (propBhkMatches) {
      let score = 130;
      if (criteria.locality && titleAndDesc.includes(criteria.locality)) score += 80;
      return score;
    }
    return -999; // Disqualify wrong BHK
  }

  // 10. RESIDENTIAL GENERAL
  if (criteria.isResidential) {
    if (prop.isCommercial) return -999;
    let score = 80;
    if (criteria.locality && titleAndDesc.includes(criteria.locality)) score += 80;
    return score;
  }

  // 11. LOCALITY-ONLY QUERY (e.g. "Baner", "Koregaon Park", "Undri")
  if (criteria.locality) {
    if (titleAndDesc.includes(criteria.locality)) {
      return 100;
    }
    return -50;
  }

  return 10;
}

/**
 * Filter and sort properties to strictly return the most relevant matches.
 * Returns empty array if no properties match the specific user criteria.
 */
export function getBestMatchingProperties<
  T extends {
    name: string;
    locality?: string;
    location?: string;
    description?: string;
    bhk?: string;
    bhkNum?: number;
    isCommercial?: boolean;
  }
>(properties: T[], queryText: string, maxResults = 4): T[] {
  if (!Array.isArray(properties) || properties.length === 0) return [];

  const criteria = parseQueryCriteria(queryText);
  const lower = queryText.toLowerCase().trim();

  // If greeting or pure pleasantry, NEVER return property cards
  const isGreeting = /^(?:hi|hello|hey|namaste|pranam|good\s*(?:morning|afternoon|evening)|hola|sup)\b/i.test(lower);
  if (isGreeting) {
    return [];
  }

  // Check if user explicitly asked to browse or view properties
  const isExplicitBrowse = /\b(?:show|view|see|browse|list|all|catalog|explore|available)\s*(?:of\s*)?(?:the\s*)?(?:verified\s*)?(?:properties|inventory|listings|projects|flats|offices|units)\b/i.test(lower);

  // If query has no specific intent, only return properties if explicitly asked to view/browse
  if (!criteria.hasSpecificIntent) {
    return isExplicitBrowse ? properties.slice(0, maxResults) : [];
  }

  const scored = properties
    .map((p) => ({ property: p, score: scorePropertyMatch(p, criteria) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, maxResults).map((s) => s.property);
}
