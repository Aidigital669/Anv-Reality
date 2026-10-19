/**
 * Property Matching & Relevance Engine for ANV REEALTY
 * Evaluates user queries against properties with strict category boundaries
 * so users only see accurate, relevant property cards.
 */

export type PropertyTypology =
  | 'residential'
  | 'commercial_office'
  | 'commercial_retail'
  | 'commercial_showroom'
  | 'commercial_shop'
  | 'healthcare_hospital'
  | 'industrial'
  | 'preleased'
  | 'land_plot';

export interface PropertyMatchCriteria {
  isHospital: boolean;
  isShowroom: boolean;
  isOffice: boolean;
  isShop: boolean;
  isWarehouse: boolean;
  isIndustrial: boolean;
  isLand: boolean;
  isPreleased: boolean;
  isResidential: boolean;
  isPenthouse: boolean;
  bhkNum: number | null;
  locality: string | null;
  isExplicitLocality?: boolean;
  minBudget: number | null;
  maxBudget: number | null;
  typologyIntent: PropertyTypology | null;
  nameWords: string[];
  hasSpecificIntent: boolean;
}

export function detectPropertyTypology(prop: {
  name?: string;
  title?: string;
  configuration?: string;
  bhk?: string;
  type_name?: string;
  description?: string;
  isCommercial?: boolean;
}): PropertyTypology {
  const text = `${prop.title || ''} ${prop.name || ''} ${prop.configuration || ''} ${prop.bhk || ''} ${prop.type_name || ''} ${prop.description || ''}`.toLowerCase();

  // 1. Healthcare / Hospital / Medical
  if (/\b(?:hospital|clinic|medical|healthcare|dispensary|doctor|nursing\s*home)\b/i.test(text)) {
    return 'healthcare_hospital';
  }

  // 2. Pre-leased
  if (/\b(?:pre[-_\s]*lease|pre[-_\s]*leased|pre[-_\s]*rented|roi|rental\s*yield)\b/i.test(text)) {
    return 'preleased';
  }

  // 3. Industrial / Warehouse / Factory
  if (/\b(?:warehouse|godown|industrial|factory|logistics|manufacturing|shed)\b/i.test(text)) {
    return 'industrial';
  }

  // 4. Retail / Showroom / Shop
  if (/\b(?:showroom|display\s*center)\b/i.test(text)) {
    return 'commercial_showroom';
  }
  if (/\b(?:shop|retail|store|boutique)\b/i.test(text)) {
    return 'commercial_shop';
  }
  if (/\b(?:restaurant|cafe|dining|lounge|bar|f&b)\b/i.test(text)) {
    return 'commercial_shop';
  }

  // 5. Commercial Office
  if (/\b(?:office|it\s*park|tech\s*park|workspace|corporate|business\s*tower|coworking)\b/i.test(text)) {
    return 'commercial_office';
  }

  // 6. Residential Penthouse / Villa / Bungalow
  if (/\b(?:penthouse|sky\s*villa|sky\s*suite)\b/i.test(text)) {
    return 'residential';
  }
  if (/\b(?:bungalow|bunglow|villa|row\s*house)\b/i.test(text)) {
    return 'residential';
  }
  if (/\b(?:plot|land)\b/i.test(text)) {
    return 'land_plot';
  }

  // 7. Residential Apartment / Flat / BHK
  if (/\b(?:apartment|flat|residence|residential|bhk)\b/i.test(text)) {
    return 'residential';
  }

  if (prop.isCommercial) return 'commercial_office';
  return 'residential';
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
  'kothrud',
  'talegaon',
  'mohammadwadi'
];

/**
 * Extracts numeric budget bounds (in INR) from user search text
 * Handles expressions like "under 2 cr", "below 1.5 crore", "between 2 and 4 cr", "budget 80 lakh"
 */
export function parseBudgetAmounts(text: string): { minBudget: number | null; maxBudget: number | null } {
  if (!text) return { minBudget: null, maxBudget: null };
  const lower = text.toLowerCase();

  const toINR = (val: string, unit?: string): number => {
    const num = parseFloat(val);
    if (isNaN(num)) return 0;
    const u = (unit || '').toLowerCase();
    if (u.startsWith('cr')) return Math.round(num * 10000000);
    if (u.startsWith('l') || u.startsWith('lac')) return Math.round(num * 100000);
    if (u.startsWith('k')) return Math.round(num * 1000);
    // If no unit but number is small like "2", check if "cr" or "crore" was anywhere nearby
    if (num <= 100 && /\b(?:cr|crore|crores)\b/i.test(lower)) return Math.round(num * 10000000);
    if (num <= 999 && /\b(?:lakh|lakhs|lac|lacs)\b/i.test(lower)) return Math.round(num * 100000);
    return Math.round(num);
  };

  // 1. Range: "1 to 2 cr", "1 - 2 cr", "between 1 cr and 2 cr", "1.5 - 3 crore"
  const rangeMatch = lower.match(/(?:between|from)?\s*(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|lakh|lakhs|lac|lacs|l)?\s*(?:to|-|and)\s*(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|lakh|lakhs|lac|lacs|l)\b/i);
  if (rangeMatch) {
    const unit1 = rangeMatch[2] || rangeMatch[4];
    const unit2 = rangeMatch[4];
    const minBudget = toINR(rangeMatch[1], unit1);
    const maxBudget = toINR(rangeMatch[3], unit2);
    return { minBudget, maxBudget };
  }

  // 2. Max: "under 2 cr", "below 2 cr", "less than 2 cr", "max 2 cr", "within 2 cr", "upto 2 cr", "up to 2 cr", "< 2 cr", "budget under 2 cr", "sub-2 cr"
  const maxMatch = lower.match(/(?:under|below|less\s*than|up\s*to|upto|within|sub[-_\s]*|max(?:imum)?|<)\s*(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|lakh|lakhs|lac|lacs|l)?\b/i);
  if (maxMatch) {
    const maxBudget = toINR(maxMatch[1], maxMatch[2]);
    return { minBudget: null, maxBudget };
  }

  // 3. Min: "above 2 cr", "over 2 cr", "more than 2 cr", "min 2 cr", "at least 2 cr", "> 2 cr"
  const minMatch = lower.match(/(?:above|over|more\s*than|min(?:imum)?|at\s*least|>)\s*(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|lakh|lakhs|lac|lacs|l)?\b/i);
  if (minMatch) {
    const minBudget = toINR(minMatch[1], minMatch[2]);
    return { minBudget, maxBudget: null };
  }

  // 4. Exact/Target: "budget 2 cr", "budget of 2 cr", "budget: 2 cr", "around 2 cr", "in 2 cr", "for 2 cr"
  const targetMatch = lower.match(/\b(?:budget\s*(?:is|of|around|:|approx)?|in|for)\s*(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|lakh|lakhs|lac|lacs|l)\b/i);
  if (targetMatch) {
    const target = toINR(targetMatch[1], targetMatch[2]);
    return {
      minBudget: Math.round(target * 0.7),
      maxBudget: Math.round(target * 1.15)
    };
  }

  // 5. Standalone budget: "6cr", "6 cr", "6 crore", "₹6 cr", "around 6 cr"
  const standaloneMatch = lower.match(/(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|lakh|lakhs|lac|lacs|l)\b/i);
  if (standaloneMatch) {
    const target = toINR(standaloneMatch[1], standaloneMatch[2]);
    return {
      minBudget: Math.round(target * 0.7),
      maxBudget: Math.round(target * 1.15)
    };
  }

  return { minBudget: null, maxBudget: null };
}

/**
 * Extracts raw price in INR number from property object
 */
export function getPropertyRawPrice(prop: {
  priceRaw?: number;
  price?: string;
}): number {
  if (typeof prop.priceRaw === 'number' && prop.priceRaw > 0) {
    return prop.priceRaw;
  }
  if (!prop.price) return 0;
  const str = prop.price.toLowerCase().replace(/,/g, '');
  const crMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore)/i);
  if (crMatch) return Math.round(parseFloat(crMatch[1]) * 10000000);
  const lMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)/i);
  if (lMatch) return Math.round(parseFloat(lMatch[1]) * 100000);
  const num = parseFloat(str.replace(/[^\d.]/g, ''));
  return isNaN(num) ? 0 : Math.round(num);
}

const STOP_NAME_WORDS = new Set([
  'i', 'want', 'to', 'buy', 'a', 'an', 'the', 'in', 'at', 'for', 'need', 'property',
  'properties', 'related', 'please', 'provide', 'proivde', 'give', 'show', 'of', 'do', 'you',
  'have', 'with', 'from', 'is', 'are', 'me', 'some', 'any', 'all', 'pune', 'ready',
  'move', 'can', 'cant', "can't", 'see', 'find', 'looking', 'look', 'search', 'around', 'budget',
  'price', 'cost', 'cr', 'crore', 'lakh', 'lakhs', 'lac', 'lacs', 'sqft', 'feet',
  'which', 'fits', 'your', 'requirement', 'explore', 'available', 'options',
  'things', 'correct', 'correctly', 'coreectly', 'filteration', 'filtration', 'filter',
  'according', 'words', 'word', 'using', 'typography', 'typology', 'how', 'many', 'type',
  'types', 'what', 'kind', 'searchbar', 'corrrect', 'searchable', 'sort', 'sortby'
]);

/**
 * Parses user search query into structured criteria flags with strict typology isolation.
 * The latest query takes absolute precedence over historical conversation context.
 */
export function parseQueryCriteria(queryText: string, conversationContext?: string): PropertyMatchCriteria {
  const lowerQuery = queryText.toLowerCase().trim();

  // 1. Strict Typology Detection on Current Query FIRST!
  const hasResidential = /\b(?:residential|apartment|flat|[1-5]\s*bhk|penthouse|villa|bungalow|bunglow|home|house)\b/i.test(lowerQuery);
  const hasHospital = /\b(?:hospital|clinic|medical|healthcare|doctor|nursing\s*home|dispensary)\b/i.test(lowerQuery);
  const hasIndustrial = /\b(?:industrial|warehouse|godown|factory|manufacturing|shed|logistics)\b/i.test(lowerQuery);
  const hasShowroom = /\b(?:showroom|display\s*center)\b/i.test(lowerQuery);
  const hasShop = /\b(?:shop|retail|store|boutique)\b/i.test(lowerQuery) && !hasHospital && !hasShowroom;
  const hasOffice = /\b(?:office|it\s*park|tech\s*park|workspace|corporate|business\s*tower|coworking|commercial\s*space)\b/i.test(lowerQuery) && !hasHospital && !hasShowroom;
  const hasPreleased = /\b(?:pre[-_\s]*leased|prelease|pre[-_\s]*rented|rental\s*yield|roi|yield)\b/i.test(lowerQuery);
  const hasLand = /\b(?:plot|land|agricultural)\b/i.test(lowerQuery);
  const hasPenthouse = /\b(?:penthouse|sky\s*villa|sky\s*suite)\b/i.test(lowerQuery);

  const bhkMatch = lowerQuery.match(/\b([1-5])\s*bhk\b/i);
  const bhkNum = bhkMatch ? parseInt(bhkMatch[1], 10) : null;

  let typologyIntent: PropertyTypology | null = null;
  if (hasResidential) typologyIntent = 'residential';
  else if (hasHospital) typologyIntent = 'healthcare_hospital';
  else if (hasIndustrial) typologyIntent = 'industrial';
  else if (hasShowroom) typologyIntent = 'commercial_showroom';
  else if (hasShop) typologyIntent = 'commercial_shop';
  else if (hasOffice) typologyIntent = 'commercial_office';
  else if (hasPreleased) typologyIntent = 'preleased';
  else if (hasLand) typologyIntent = 'land_plot';

  // Only if current query specifies NO typology, check previous user message (NEVER assistant text!)
  if (!typologyIntent && conversationContext) {
    const userLines = conversationContext
      .split('\n')
      .filter((line) => line.toLowerCase().startsWith('user:'))
      .reverse()
      .map((line) => line.replace(/^user:\s*/i, '').toLowerCase());

    for (const uLine of userLines) {
      if (/\b(?:residential|apartment|flat|[1-5]\s*bhk|penthouse|villa|bungalow|home|house)\b/i.test(uLine)) {
        typologyIntent = 'residential';
        break;
      }
      if (/\b(?:hospital|clinic|medical|healthcare|doctor)\b/i.test(uLine)) {
        typologyIntent = 'healthcare_hospital';
        break;
      }
      if (/\b(?:industrial|warehouse|godown|factory|manufacturing|shed)\b/i.test(uLine)) {
        typologyIntent = 'industrial';
        break;
      }
      if (/\b(?:office|it\s*park|workspace|corporate)\b/i.test(uLine)) {
        typologyIntent = 'commercial_office';
        break;
      }
      if (/\b(?:shop|retail|showroom)\b/i.test(uLine)) {
        typologyIntent = 'commercial_retail';
        break;
      }
    }
  }

  // Locality: prioritize latest query first
  let matchedLocality: string | null = null;
  let isExplicitLocality = false;
  for (const loc of KNOWN_PUNE_LOCALITIES) {
    if (new RegExp(`\\b${loc}\\b`, 'i').test(lowerQuery)) {
      matchedLocality = loc;
      isExplicitLocality = true;
      break;
    }
  }

  if (!matchedLocality && conversationContext) {
    const userLines = conversationContext
      .split('\n')
      .filter((line) => line.toLowerCase().startsWith('user:'))
      .map((line) => line.replace(/^user:\s*/i, ''))
      .join('\n')
      .toLowerCase();

    for (const loc of KNOWN_PUNE_LOCALITIES) {
      if (new RegExp(`\\b${loc}\\b`, 'i').test(userLines)) {
        matchedLocality = loc;
        isExplicitLocality = false;
        break;
      }
    }
  }

  // Budget
  let { minBudget, maxBudget } = parseBudgetAmounts(queryText);
  if (minBudget === null && maxBudget === null && conversationContext) {
    const reversedUserLines = conversationContext
      .split('\n')
      .reverse()
      .filter((line) => line.toLowerCase().startsWith('user:'));
    for (const line of reversedUserLines) {
      const cleanLine = line.replace(/^user:\s*/i, '');
      if (/\b(?:asking|quoting|expected\s*price)\b/i.test(cleanLine)) continue;
      const parsed = parseBudgetAmounts(cleanLine);
      if (parsed.minBudget !== null || parsed.maxBudget !== null) {
        minBudget = parsed.minBudget;
        maxBudget = parsed.maxBudget;
        break;
      }
    }
  }

  // Name words extracted from query
  const nameWords = lowerQuery
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_NAME_WORDS.has(w));

  const isViewOrProvideRequest = /\b(?:prov(?:ide|iede)|show|view|see|give|send|share|details|dossier|walkthrough)\b/i.test(lowerQuery);

  const hasSpecificIntent =
    typologyIntent !== null ||
    matchedLocality !== null ||
    minBudget !== null ||
    maxBudget !== null ||
    nameWords.length > 0 ||
    isViewOrProvideRequest;

  return {
    isHospital: typologyIntent === 'healthcare_hospital',
    isShowroom: typologyIntent === 'commercial_showroom',
    isOffice: typologyIntent === 'commercial_office',
    isShop: typologyIntent === 'commercial_retail',
    isWarehouse: typologyIntent === 'industrial',
    isIndustrial: typologyIntent === 'industrial',
    isLand: typologyIntent === 'land_plot',
    isPreleased: typologyIntent === 'preleased',
    isResidential: typologyIntent === 'residential',
    isPenthouse: hasPenthouse,
    bhkNum,
    locality: matchedLocality,
    isExplicitLocality,
    minBudget,
    maxBudget,
    typologyIntent,
    nameWords,
    hasSpecificIntent
  };
}

/**
 * Calculates a relevance score for a property against query criteria.
 * Strict zero-tolerance disqualification for cross-typology matches (e.g. hospital for residential).
 */
export function scorePropertyMatch(
  prop: {
    name?: string;
    title?: string;
    locality?: string;
    location?: string;
    description?: string;
    configuration?: string;
    bhk?: string;
    type_name?: string;
    bhkNum?: number;
    isCommercial?: boolean;
    priceRaw?: number;
    price?: string;
  },
  criteria: PropertyMatchCriteria
): number {
  if (!criteria.hasSpecificIntent) {
    return 10;
  }

  const pTypology = detectPropertyTypology(prop);
  const titleAndDesc = `${prop.title || ''} ${prop.name || ''} ${prop.configuration || ''} ${prop.bhk || ''} ${prop.type_name || ''} ${prop.locality || ''} ${prop.location || ''} ${prop.description || ''}`.toLowerCase();

  // 0. STRICT TYPOLOGY BOUNDARY ENFORCEMENT (ZERO TOLERANCE)
  if (criteria.typologyIntent) {
    if (criteria.typologyIntent === 'residential') {
      if (pTypology !== 'residential') return -999;
    } else if (criteria.typologyIntent === 'healthcare_hospital') {
      if (pTypology !== 'healthcare_hospital') return -999;
    } else if (criteria.typologyIntent === 'industrial') {
      if (pTypology !== 'industrial') return -999;
    } else if (criteria.typologyIntent === 'commercial_office') {
      if (pTypology !== 'commercial_office') return -999;
    } else if (criteria.typologyIntent === 'commercial_retail' || criteria.typologyIntent === 'commercial_showroom' || criteria.typologyIntent === 'commercial_shop') {
      if (pTypology !== 'commercial_retail' && pTypology !== 'commercial_showroom' && pTypology !== 'commercial_shop') return -999;
    } else if (criteria.typologyIntent === 'preleased') {
      if (pTypology !== 'preleased') return -999;
    } else if (criteria.typologyIntent === 'land_plot') {
      if (pTypology !== 'land_plot') return -999;
    }
  }

  // 1. STRICT BUDGET ENFORCEMENT
  const propPrice = getPropertyRawPrice(prop);
  if (propPrice > 0) {
    if (criteria.maxBudget && propPrice > criteria.maxBudget) {
      return -999;
    }
    if (criteria.minBudget && propPrice < criteria.minBudget) {
      return -999;
    }
  }

  // Base score for matching typology
  let score = 80;

  // 2. NAME WORDS MATCHING (High precision bonus for project, developer, building names)
  if (criteria.nameWords && criteria.nameWords.length > 0) {
    for (const word of criteria.nameWords) {
      if (titleAndDesc.includes(word)) {
        score += 90;
      }
    }
  }

  // 3. LOCALITY MATCHING
  if (criteria.locality) {
    if (titleAndDesc.includes(criteria.locality)) {
      score += 150;
    } else if (criteria.isExplicitLocality) {
      // If user explicitly stated an area (e.g. "in Undri"), disqualify different areas
      return -999;
    } else {
      score -= 50;
    }
  }

  // 4. SPECIFIC BHK (1, 2, 3, 4, 5 BHK)
  if (criteria.bhkNum !== null) {
    if (pTypology !== 'residential') return -999;
    const propBhkMatches =
      prop.bhkNum === criteria.bhkNum ||
      (prop.bhk && new RegExp(`\\b${criteria.bhkNum}\\s*bhk\\b`, 'i').test(prop.bhk)) ||
      (prop.configuration && new RegExp(`\\b${criteria.bhkNum}\\s*bhk\\b`, 'i').test(prop.configuration)) ||
      new RegExp(`\\b${criteria.bhkNum}\\s*bhk\\b`, 'i').test(prop.name || prop.title || '');

    if (propBhkMatches) {
      score += 150;
    } else {
      return -999; // Disqualify wrong BHK
    }
  }

  return score;
}

/**
 * Filter and sort properties to strictly return the most relevant matches.
 * Returns empty array if no properties match the specific user criteria.
 */
export function getBestMatchingProperties<
  T extends {
    name?: string;
    title?: string;
    locality?: string;
    location?: string;
    description?: string;
    configuration?: string;
    bhk?: string;
    type_name?: string;
    bhkNum?: number;
    isCommercial?: boolean;
    priceRaw?: number;
    price?: string;
  }
>(properties: T[], queryText: string, maxResults = 4, conversationContext?: string): T[] {
  if (!Array.isArray(properties) || properties.length === 0) return [];

  const lower = queryText.toLowerCase().trim();

  // If greeting or pure pleasantry, NEVER return property cards
  const isGreeting = /^(?:hi|hello|hey|namaste|pranam|good\s*(?:morning|afternoon|evening)|hola|sup|hii|heyy)\b/i.test(lower);
  if (isGreeting) {
    return [];
  }

  // If general inquiry about types/spectrum of properties, NEVER return property cards
  const isGeneralFAQ = /\b(?:how\s*many\s*types?|what\s*types?|types?\s*of\s*properties|property\s*types|what\s*(?:kind\s*of\s*)?properties|which\s*properties|what\s*do\s*you\s*have|tell\s*me\s*about\s*your\s*properties|which\s*of\s*these\s*fits)\b/i.test(lower);
  if (isGeneralFAQ) {
    return [];
  }

  const criteria = parseQueryCriteria(queryText, conversationContext);

  // Check if user explicitly asked to browse or view properties
  const isExplicitBrowse = /\b(?:show|view|see|browse|list|all|catalog|explore|available)\s*(?:of\s*)?(?:the\s*)?(?:verified\s*)?(?:properties|inventory|listings|projects|flats|offices|units)\b/i.test(lower);

  // If query has no specific intent, only return properties if explicitly asked to view/browse
  if (!criteria.hasSpecificIntent) {
    return isExplicitBrowse ? properties.slice(0, maxResults) : [];
  }

  const scored = properties
    .map((p) => ({ property: p, score: scorePropertyMatch(p, criteria) }))
    .filter((item) => {
      if (item.score <= 0) return false;
      const price = getPropertyRawPrice(item.property);
      if (price > 0) {
        if (criteria.maxBudget && price > criteria.maxBudget) return false;
        if (criteria.minBudget && price < criteria.minBudget) return false;
      }
      return true;
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, maxResults).map((s) => s.property);
}

