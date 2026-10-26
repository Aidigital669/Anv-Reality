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
  bhkNums?: number[];
  locality: string | null;
  localities?: string[];
  isExplicitLocality?: boolean;
  minBudget: number | null;
  maxBudget: number | null;
  typologyIntent: PropertyTypology | null;
  typologyIntents?: PropertyTypology[];
  purposeSlugs?: string[];
  nameWords: string[];
  hasSpecificIntent: boolean;
  isMultiCategory?: boolean;
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
  'types', 'what', 'kind', 'searchbar', 'corrrect', 'searchable', 'sort', 'sortby',
  // Typology, category and junction terms (filtered semantically, not as project name words)
  'shop', 'shops', 'showroom', 'showrooms', 'office', 'offices', 'commercial', 'residential',
  'apartment', 'apartments', 'flat', 'flats', 'villa', 'villas', 'bungalow', 'bunglow', 'bungalows',
  'penthouse', 'penthouses', 'hospital', 'hospitals', 'clinic', 'clinics', 'medical', 'healthcare',
  'industrial', 'warehouse', 'warehouses', 'factory', 'godown', 'shed', 'land', 'plot', 'plots',
  'preleased', 'pre-leased', 'retail', 'store', 'stores', 'and', 'or', 'both', 'plus', '&', 'also',
  'suitable', 'jewellery', 'jewelry', 'clothing', 'clothes', 'restaurant', 'restaurants', 'cafe',
  'cafes', 'dining', 'gym', 'salon', 'spa', 'pharmacy', 'supermarket', 'grocery', 'bakery', 'bank',
  'furniture', 'hardware', 'decor', 'footwear', 'shoes', 'optical', 'coaching'
]);

/**
 * Parses user search query into structured criteria flags with multi-category and multi-typology support.
 * The latest query takes absolute precedence over historical conversation context.
 */
export function parseQueryCriteria(queryText: string, conversationContext?: string): PropertyMatchCriteria {
  const lowerQuery = queryText.toLowerCase().trim();

  // 1. Strict Typology Detection on Current Query (collect ALL matched typologies)
  const typologyIntents: PropertyTypology[] = [];

  const hasResidential = /\b(?:residential|apartment|flat|home|house|villa|bungalow|bunglow|row\s*house)\b/i.test(lowerQuery);
  const hasApartment = /\b(?:apartment|apartments|flat|flats)\b/i.test(lowerQuery);
  const hasBungalow = /\b(?:bungalow|bunglow|villa|row\s*house)\b/i.test(lowerQuery);
  const hasHospital = /\b(?:hospital|clinic|medical|healthcare|doctor|nursing\s*home|dispensary)\b/i.test(lowerQuery);
  const hasIndustrial = /\b(?:industrial|warehouse|godown|factory|manufacturing|shed|logistics)\b/i.test(lowerQuery);
  const hasShowroom = /\b(?:showroom|display\s*center)\b/i.test(lowerQuery);
  const hasShop = /\b(?:shop|retail|store|boutique)\b/i.test(lowerQuery);
  const hasOffice = /\b(?:office|it\s*park|tech\s*park|workspace|corporate|business\s*tower|coworking|commercial\s*space)\b/i.test(lowerQuery);
  const hasPreleased = /\b(?:pre[-_\s]*leased|prelease|pre[-_\s]*rented|rental\s*yield|roi|yield)\b/i.test(lowerQuery);
  const hasLand = /\b(?:plot|land|agricultural)\b/i.test(lowerQuery);
  const hasPenthouse = /\b(?:penthouse|sky\s*villa|sky\s*suite)\b/i.test(lowerQuery);

  if (hasResidential || hasPenthouse) typologyIntents.push('residential');
  if (hasHospital) typologyIntents.push('healthcare_hospital');
  if (hasIndustrial) typologyIntents.push('industrial');
  if (hasShowroom) typologyIntents.push('commercial_showroom');
  if (hasShop) typologyIntents.push('commercial_shop');
  if (hasOffice) typologyIntents.push('commercial_office');
  if (hasPreleased) typologyIntents.push('preleased');
  if (hasLand) typologyIntents.push('land_plot');

  // If user searched general "commercial" without specifying office/shop/etc.
  if (/\bcommercial\b/i.test(lowerQuery) && !hasOffice && !hasShop && !hasShowroom && !hasIndustrial) {
    typologyIntents.push('commercial_office', 'commercial_showroom', 'commercial_shop');
  }

  // Multi-BHK detection: e.g. "2 bhk and 3 bhk", "2, 3 bhk", "2 or 3 bhk", "2 bhk 3 bhk"
  const bhkNums: number[] = [];
  const individualBhkMatches = Array.from(lowerQuery.matchAll(/\b([1-5])\s*(?:bhk|bed|bedroom)s?\b/gi));
  for (const m of individualBhkMatches) {
    const val = parseInt(m[1], 10);
    if (!bhkNums.includes(val)) bhkNums.push(val);
  }

  const multiBhkRegex = /\b([1-5])\s*(?:,|\/|-|and|or|\&)\s*([1-5])\s*(?:bhk|bed|bedroom)s?\b/gi;
  let mb;
  while ((mb = multiBhkRegex.exec(lowerQuery)) !== null) {
    const v1 = parseInt(mb[1], 10);
    const v2 = parseInt(mb[2], 10);
    if (!bhkNums.includes(v1)) bhkNums.push(v1);
    if (!bhkNums.includes(v2)) bhkNums.push(v2);
  }

  if (bhkNums.length > 0 && !typologyIntents.includes('residential')) {
    typologyIntents.push('residential');
  }

  const bhkNum = bhkNums.length === 1 ? bhkNums[0] : null;
  const typologyIntent = typologyIntents.length === 1 ? typologyIntents[0] : null;
  const isMultiCategory =
    typologyIntents.length > 1 ||
    bhkNums.length > 1 ||
    (hasPenthouse && hasApartment) ||
    (hasBungalow && hasApartment) ||
    (hasPenthouse && hasBungalow);

  // Business purpose slugs detection
  const purposeSlugs: string[] = [];
  if (/\b(?:jewellery|jewelry|gold|diamond)\b/i.test(lowerQuery)) purposeSlugs.push('jewellery-showroom');
  if (/\b(?:clothing|clothes|apparel|fashion|garment)\b/i.test(lowerQuery)) purposeSlugs.push('clothing-store');
  if (/\b(?:car\s*showroom|dealership|automobile)\b/i.test(lowerQuery)) purposeSlugs.push('car-showroom');
  if (/\b(?:two[-_\s]*wheeler|bike\s*showroom)\b/i.test(lowerQuery)) purposeSlugs.push('two-wheeler-showroom');
  if (/\b(?:electronics|mobile\s*store|gadgets)\b/i.test(lowerQuery)) purposeSlugs.push('electronics-store');
  if (/\b(?:furniture)\b/i.test(lowerQuery)) purposeSlugs.push('furniture-showroom');
  if (/\b(?:grocery|supermarket|mart|daily\s*needs)\b/i.test(lowerQuery)) purposeSlugs.push('grocery-supermarket');
  if (/\b(?:restaurant|cafe|dining|coffee\s*shop|food\s*joint|bistro|eatery)\b/i.test(lowerQuery)) purposeSlugs.push('restaurant-cafe');
  if (/\b(?:bakery|sweet\s*shop|sweets|pastry)\b/i.test(lowerQuery)) purposeSlugs.push('bakery-sweet-shop');
  if (/\b(?:pharmacy|medical\s*store|chemist)\b/i.test(lowerQuery)) purposeSlugs.push('pharmacy-medical-store');
  if (/\b(?:salon|beauty\s*parlour|parlor|spa)\b/i.test(lowerQuery)) purposeSlugs.push('salon-beauty-parlour');
  if (/\b(?:gym|fitness|crossfit)\b/i.test(lowerQuery)) purposeSlugs.push('gym-fitness-centre');
  if (/\b(?:bank|financial|atm)\b/i.test(lowerQuery)) purposeSlugs.push('bank-financial-services');
  if (/\b(?:consultancy|corporate\s*office)\b/i.test(lowerQuery)) purposeSlugs.push('office-consultancy');
  if (/\b(?:hardware|building\s*material)\b/i.test(lowerQuery)) purposeSlugs.push('hardware-building-materials');
  if (/\b(?:home\s*decor|interior)\b/i.test(lowerQuery)) purposeSlugs.push('home-decor-interior-showroom');
  if (/\b(?:footwear|shoes)\b/i.test(lowerQuery)) purposeSlugs.push('footwear-store');
  if (/\b(?:optical|optician|eyewear|glasses)\b/i.test(lowerQuery)) purposeSlugs.push('optical-store');
  if (/\b(?:coaching|tuition|educational|classes|institute)\b/i.test(lowerQuery)) purposeSlugs.push('educational-coaching-centre');
  if (/\b(?:clinic|diagnostic|pathology|lab|dentist)\b/i.test(lowerQuery)) purposeSlugs.push('clinic-diagnostic-centre');

  // Only if current query specifies NO typology, check previous user message (NEVER assistant text!)
  if (typologyIntents.length === 0 && conversationContext) {
    const userLines = conversationContext
      .split('\n')
      .filter((line) => line.toLowerCase().startsWith('user:'))
      .reverse()
      .map((line) => line.replace(/^user:\s*/i, '').toLowerCase());

    for (const uLine of userLines) {
      if (/\b(?:residential|apartment|flat|[1-5]\s*bhk|penthouse|villa|bungalow|home|house)\b/i.test(uLine)) {
        typologyIntents.push('residential');
        break;
      }
      if (/\b(?:hospital|clinic|medical|healthcare|doctor)\b/i.test(uLine)) {
        typologyIntents.push('healthcare_hospital');
        break;
      }
      if (/\b(?:industrial|warehouse|godown|factory|manufacturing|shed)\b/i.test(uLine)) {
        typologyIntents.push('industrial');
        break;
      }
      if (/\b(?:office|it\s*park|workspace|corporate)\b/i.test(uLine)) {
        typologyIntents.push('commercial_office');
        break;
      }
      if (/\b(?:shop|retail|showroom)\b/i.test(uLine)) {
        typologyIntents.push('commercial_retail');
        break;
      }
    }
  }

  // Locality: prioritize latest query first (collect all matches for multi-locality e.g. "Baner and Wakad")
  const matchedLocalities: string[] = [];
  let isExplicitLocality = false;
  for (const loc of KNOWN_PUNE_LOCALITIES) {
    if (new RegExp(`\\b${loc}\\b`, 'i').test(lowerQuery)) {
      matchedLocalities.push(loc);
      isExplicitLocality = true;
    }
  }

  let matchedLocality: string | null = matchedLocalities.length > 0 ? matchedLocalities[0] : null;

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
        matchedLocalities.push(loc);
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
    typologyIntents.length > 0 ||
    bhkNums.length > 0 ||
    matchedLocality !== null ||
    minBudget !== null ||
    maxBudget !== null ||
    purposeSlugs.length > 0 ||
    nameWords.length > 0 ||
    isViewOrProvideRequest;

  return {
    isHospital: typologyIntents.includes('healthcare_hospital'),
    isShowroom: typologyIntents.includes('commercial_showroom'),
    isOffice: typologyIntents.includes('commercial_office'),
    isShop: typologyIntents.includes('commercial_shop'),
    isWarehouse: typologyIntents.includes('industrial'),
    isIndustrial: typologyIntents.includes('industrial'),
    isLand: typologyIntents.includes('land_plot'),
    isPreleased: typologyIntents.includes('preleased'),
    isResidential: typologyIntents.includes('residential'),
    isPenthouse: hasPenthouse,
    bhkNum,
    bhkNums,
    locality: matchedLocality,
    localities: matchedLocalities,
    isExplicitLocality,
    minBudget,
    maxBudget,
    typologyIntent,
    typologyIntents,
    purposeSlugs,
    nameWords,
    hasSpecificIntent,
    isMultiCategory
  };
}

/**
 * Calculates a relevance score for a property against query criteria.
 * Strict zero-tolerance disqualification for cross-typology matches (e.g. hospital for residential).
 * Supports union / OR matching when multiple categories, typologies, or BHKs are searched.
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
    businessPurposes?: { id: number; name: string; slug: string }[];
  },
  criteria: PropertyMatchCriteria
): number {
  if (!criteria.hasSpecificIntent) {
    return 10;
  }

  const pTypology = detectPropertyTypology(prop);
  const titleAndDesc = `${prop.title || ''} ${prop.name || ''} ${prop.configuration || ''} ${prop.bhk || ''} ${prop.type_name || ''} ${prop.locality || ''} ${prop.location || ''} ${prop.description || ''}`.toLowerCase();

  // 0. STRICT TYPOLOGY BOUNDARY ENFORCEMENT (UNION / OR MATCHING ACROSS ALL INTENTS)
  const intentsToCheck = criteria.typologyIntents && criteria.typologyIntents.length > 0
    ? criteria.typologyIntents
    : (criteria.typologyIntent ? [criteria.typologyIntent] : []);

  if (intentsToCheck.length > 0) {
    const matchesAnyTypology = intentsToCheck.some((intent) => {
      if (intent === 'residential') return pTypology === 'residential';
      if (intent === 'healthcare_hospital') return pTypology === 'healthcare_hospital';
      if (intent === 'industrial') return pTypology === 'industrial';
      if (intent === 'commercial_office') return pTypology === 'commercial_office';
      if (intent === 'commercial_showroom') {
        return pTypology === 'commercial_showroom' || pTypology === 'commercial_shop';
      }
      if (intent === 'commercial_shop') {
        return pTypology === 'commercial_shop' || pTypology === 'commercial_showroom';
      }
      if (intent === 'commercial_retail') {
        return pTypology === 'commercial_retail' || pTypology === 'commercial_showroom' || pTypology === 'commercial_shop';
      }
      if (intent === 'preleased') return pTypology === 'preleased';
      if (intent === 'land_plot') return pTypology === 'land_plot';
      return false;
    });

    if (!matchesAnyTypology) {
      return -999;
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
    let matchedNameWordsCount = 0;
    for (const word of criteria.nameWords) {
      if (titleAndDesc.includes(word)) {
        matchedNameWordsCount++;
        score += 90;
      }
    }
    // If specific name/project keywords were typed, but this property doesn't match any of them
    if (matchedNameWordsCount === 0) {
      const hasOtherFilters =
        criteria.locality ||
        (criteria.localities && criteria.localities.length > 0) ||
        criteria.isExplicitLocality ||
        criteria.bhkNum !== null ||
        (criteria.bhkNums && criteria.bhkNums.length > 0) ||
        intentsToCheck.length > 0 ||
        (criteria.purposeSlugs && criteria.purposeSlugs.length > 0);

      if (!hasOtherFilters) {
        return -999;
      }
      score -= 100;
      if (score <= 0) return -999;
    }
  }

  // 3. LOCALITY MATCHING (UNION MATCHING)
  const locsToCheck = criteria.localities && criteria.localities.length > 0
    ? criteria.localities
    : (criteria.locality ? [criteria.locality] : []);

  if (locsToCheck.length > 0) {
    const matchesAnyLoc = locsToCheck.some((loc) => titleAndDesc.includes(loc));
    if (matchesAnyLoc) {
      score += 150;
    } else if (criteria.isExplicitLocality) {
      return -999;
    } else {
      score -= 50;
    }
  }

  // 4. SPECIFIC BHK (1, 2, 3, 4, 5 BHK - UNION MATCHING)
  const bhksToCheck = criteria.bhkNums && criteria.bhkNums.length > 0
    ? criteria.bhkNums
    : (criteria.bhkNum !== null ? [criteria.bhkNum] : []);

  if (bhksToCheck.length > 0) {
    if (pTypology !== 'residential') return -999;
    const propBhkMatches = bhksToCheck.some((bhkVal) => {
      return (
        prop.bhkNum === bhkVal ||
        (prop.bhk && new RegExp(`\\b${bhkVal}\\s*bhk\\b`, 'i').test(prop.bhk)) ||
        (prop.configuration && new RegExp(`\\b${bhkVal}\\s*bhk\\b`, 'i').test(prop.configuration)) ||
        new RegExp(`\\b${bhkVal}\\s*bhk\\b`, 'i').test(prop.name || prop.title || '')
      );
    });

    if (propBhkMatches) {
      score += 150;
    } else {
      return -999; // Disqualify wrong BHK
    }
  }

  // 5. BUSINESS PURPOSE MATCHING (e.g. jewellery, restaurant, clothing)
  if (criteria.purposeSlugs && criteria.purposeSlugs.length > 0) {
    const propPurposes = prop.businessPurposes || [];
    const propPurposesText = propPurposes.map((bp) => `${bp.slug} ${bp.name}`).join(' ').toLowerCase();
    const matchesAnyPurpose = criteria.purposeSlugs.some(
      (slug) => propPurposesText.includes(slug) || titleAndDesc.includes(slug.replace(/-/g, ' '))
    );
    if (matchesAnyPurpose) {
      score += 180;
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
>(properties: T[], queryText: string, maxResults = 8, conversationContext?: string): T[] {
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

