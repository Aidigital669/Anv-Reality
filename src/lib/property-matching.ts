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
  isExplicitLocality?: boolean;
  minBudget: number | null;
  maxBudget: number | null;
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

/**
 * Parses user search query into structured criteria flags, optionally augmented by conversation context
 */
export function parseQueryCriteria(queryText: string, conversationContext?: string): PropertyMatchCriteria {
  const lowerQuery = queryText.toLowerCase();
  const combined = conversationContext ? `${conversationContext}\n${queryText}` : queryText;
  const lowerCombined = combined.toLowerCase();

  const isHospital = /\b(?:hospital|clinic|medical|doctor|healthcare|nursing\s*home|dispensary|bed\s*setup)\b/i.test(lowerCombined);
  const isShowroom = /\b(?:showroom|display\s*center)\b/i.test(lowerCombined);
  const isOffice = /\b(?:office|it\s*park|coworking|workspace|corporate\s*desk|desk\s*space)\b/i.test(lowerCombined);
  const isShop = /\b(?:shop|retail\s*shop|store)\b/i.test(lowerCombined) && !isHospital && !isShowroom;
  const isWarehouse = /\b(?:warehouse|godown|storage|logistics)\b/i.test(lowerCombined);
  const isLand = /\b(?:plot|land|agricultural|industrial\s*plot)\b/i.test(lowerCombined);
  const isPreleased = /\b(?:pre[-_\s]*leased|pre[-_\s]*rented|rental\s*yield|roi|passive\s*income)\b/i.test(lowerCombined);
  const isPenthouse = /\b(?:penthouse|sky\s*villa|sky\s*suite)\b/i.test(lowerCombined);

  // BHK: inspect latest user query first, fallback to conversation
  const bhkMatch = lowerQuery.match(/\b([1-5])\s*bhk\b/i) || lowerCombined.match(/\b([1-5])\s*bhk\b/i);
  const bhkNum = bhkMatch ? parseInt(bhkMatch[1], 10) : null;

  const isResidential =
    bhkNum !== null ||
    isPenthouse ||
    /\b(?:apartment|flat|residence|residential|villa|bungalow|home)\b/i.test(lowerCombined);

  // Locality: prioritize latest query first, fallback to previous user messages
  let matchedLocality: string | null = null;
  let isExplicitLocality = false;
  for (const loc of KNOWN_PUNE_LOCALITIES) {
    if (new RegExp(`\\b${loc}\\b`, 'i').test(lowerQuery)) {
      matchedLocality = loc;
      isExplicitLocality = true;
      break;
    }
  }
  // Only look in user messages in conversationContext, NEVER from assistant messages!
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

  // Budget: inspect latest query first, fallback to most recent user message in conversation
  let { minBudget, maxBudget } = parseBudgetAmounts(queryText);
  if (minBudget === null && maxBudget === null && conversationContext) {
    const reversedUserLines = conversationContext
      .split('\n')
      .reverse()
      .filter((line) => line.toLowerCase().startsWith('user:'));
    for (const line of reversedUserLines) {
      const parsed = parseBudgetAmounts(line.replace(/^user:\s*/i, ''));
      if (parsed.minBudget !== null || parsed.maxBudget !== null) {
        minBudget = parsed.minBudget;
        maxBudget = parsed.maxBudget;
        break;
      }
    }
  }

  // Check if user is following up to view, provide, or share details of the discussed property
  const isViewOrProvideRequest = /\b(?:prov(?:ide|iede)|show|view|see|give|send|share|details|dossier|walkthrough)\b/i.test(lowerQuery);

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
    matchedLocality !== null ||
    minBudget !== null ||
    maxBudget !== null ||
    isViewOrProvideRequest;

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
    isExplicitLocality,
    minBudget,
    maxBudget,
    hasSpecificIntent
  };
}

/**
 * Calculates a relevance score for a property against query criteria.
 * Returns negative score if property strictly contradicts the query intent or budget.
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
    priceRaw?: number;
    price?: string;
  },
  criteria: PropertyMatchCriteria
): number {
  if (!criteria.hasSpecificIntent) {
    return 10; // Default base score for generic browsing
  }

  const titleAndDesc = `${prop.name || ''} ${prop.locality || ''} ${prop.location || ''} ${prop.description || ''} ${prop.bhk || ''}`.toLowerCase();

  // 0. STRICT BUDGET ENFORCEMENT
  const propPrice = getPropertyRawPrice(prop);
  if (propPrice > 0) {
    if (criteria.maxBudget && propPrice > criteria.maxBudget) {
      // Strictly exceeds maximum budget (e.g. 6 Cr when user asks for under 2 Cr) -> DISQUALIFY
      return -999;
    }
    if (criteria.minBudget && propPrice < criteria.minBudget) {
      // Strictly below minimum budget -> DISQUALIFY
      return -999;
    }
  }

  // 1. HOSPITAL & MEDICAL (Strict Exclusion)
  if (criteria.isHospital) {
    const isPropHospital = /\b(?:hospital|medical|clinic|doctor|healthcare|dispensary)\b/i.test(titleAndDesc);
    if (isPropHospital) {
      let score = 150;
      if (criteria.locality) {
        if (titleAndDesc.includes(criteria.locality)) {
          score += 100;
        } else if (criteria.isExplicitLocality) {
          // If user specifically asked for an area in current query (e.g. "Undri"), other areas are disqualified!
          return -999;
        }
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
      if (criteria.locality) {
        if (titleAndDesc.includes(criteria.locality)) score += 100;
        else if (criteria.isExplicitLocality) return -999;
      }
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
      if (criteria.locality) {
        if (titleAndDesc.includes(criteria.locality)) score += 100;
        else if (criteria.isExplicitLocality) return -999;
      }
      return score;
    }
    return -500;
  }

  // 6. RETAIL SHOP
  if (criteria.isShop) {
    if (/\b(?:hospital|medical|clinic)\b/i.test(titleAndDesc)) return -999;
    if (/\b(?:shop|retail)\b/i.test(titleAndDesc)) {
      let score = 130;
      if (criteria.locality) {
        if (titleAndDesc.includes(criteria.locality)) score += 100;
        else if (criteria.isExplicitLocality) return -999;
      }
      return score;
    }
    return -500;
  }

  // 7. PRE-LEASED INVESTMENT
  if (criteria.isPreleased) {
    const isPropPreleased = /\b(?:pre[-_\s]*leased|prelease|pre[-_\s]*rented|roi|yield|investment)\b/i.test(titleAndDesc);
    if (isPropPreleased) {
      let score = 140;
      if (criteria.locality) {
        if (titleAndDesc.includes(criteria.locality)) score += 100;
        else if (criteria.isExplicitLocality) return -999;
      }
      return score;
    }
    return 10;
  }

  // 8. PENTHOUSE / SKY VILLA
  if (criteria.isPenthouse) {
    if (prop.isCommercial) return -999;
    if (/\b(?:penthouse|sky\s*villa|sky\s*suite)\b/i.test(titleAndDesc)) {
      let score = 150;
      if (criteria.locality) {
        if (titleAndDesc.includes(criteria.locality)) score += 100;
        else if (criteria.isExplicitLocality) return -999;
      }
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
      if (criteria.locality) {
        if (titleAndDesc.includes(criteria.locality)) score += 100;
        else if (criteria.isExplicitLocality) return -999;
      }
      return score;
    }
    return -999; // Disqualify wrong BHK
  }

  // 10. RESIDENTIAL GENERAL
  if (criteria.isResidential) {
    if (prop.isCommercial) return -999;
    let score = 80;
    if (criteria.locality) {
      if (titleAndDesc.includes(criteria.locality)) score += 100;
      else if (criteria.isExplicitLocality) return -999;
    }
    return score;
  }

  // 11. LOCALITY-ONLY QUERY (e.g. "Baner", "Koregaon Park", "Undri")
  if (criteria.locality) {
    if (titleAndDesc.includes(criteria.locality)) {
      return 100;
    }
    return criteria.isExplicitLocality ? -50 : 10;
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
    priceRaw?: number;
    price?: string;
  }
>(properties: T[], queryText: string, maxResults = 4, conversationContext?: string): T[] {
  if (!Array.isArray(properties) || properties.length === 0) return [];

  const criteria = parseQueryCriteria(queryText, conversationContext);
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
