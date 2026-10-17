/**
 * Pure parsing and intent classification for seller queries.
 * Safe to import in both Client and Server Components (no node/db dependencies).
 */

export interface SellerIntentAnalysis {
  isGeneralSellerQuery: boolean;
  isUnrecognized: boolean;
  unrecognizedTerm?: string;
  categoryLabel?: string;
  hasSpecificCriteria: boolean;
  matchedLocality?: string;
  isCommercialGeneral?: boolean;
  isOffice?: boolean;
}

export function detectSellerTypologyAndLocality(queryText: string): SellerIntentAnalysis {
  const lower = queryText.toLowerCase().trim();

  // Strip common seller and intent boilerplate words to isolate genuine typologies or unrecognized subjects
  const stripped = lower
    .replace(
      /\b(?:i|we|my|me|please|can|you|want|need|looking|seek|would|like|to|sell|selling|seller|list|listing|have|a|an|the|in|at|for|pune|maharashtra|property|properties|real\s*estate|buyer|buyers|client|clients|mandate|mandates|investor|investors|customer|customers|lead|leads|find|match|matching|get|connect|give|show|provide|space|spaces|unit|units|premise|premises|commercial|residential)\b/gi,
      ' '
    )
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const isHospital = /\b(?:hospital|medical|clinic|doctor|healthcare|dispensary)\b/i.test(lower);
  const isShowroom = /\b(?:showroom|display\s*center)\b/i.test(lower);
  const isOffice = /\b(?:office|it\s*park|coworking|workspace|corporate|commercial\s*office|business\s*center)\b/i.test(lower);
  const isShop = /\b(?:shop|retail|commercial\s*shop)\b/i.test(lower);
  const isPreleased = /\b(?:pre[-_\s]*leased|prelease|roi|yield|investment)\b/i.test(lower);
  const isCommercialGeneral = !isOffice && !isShowroom && !isShop && !isHospital && !isPreleased && /\b(?:commercial|commercial\s*property|commercial\s*space|commercial\s*unit|commercial\s*real\s*estate)\b/i.test(lower);
  const bhkMatch = lower.match(/\b([1-5])\s*bhk\b/i);
  const isResidential = bhkMatch || /\b(?:flat|apartment|penthouse|villa|residence|residential)\b/i.test(lower);
  const isPlot = /\b(?:plot|land|industrial\s*land|na\s*plot)\b/i.test(lower);

  const localities = [
    'baner', 'balewadi', 'kalyani nagar', 'koregaon park', 'undri', 'nibm',
    'hinjewadi', 'wakad', 'camp', 'viman nagar', 'kharadi', 'jm road',
    'shivaji nagar', 'magarpatta', 'hadapsar', 'kothrud', 'bavdhan', 'aundh',
    'pashan', 'senapati bapat', 'sb road', 'wanowrie', 'kondhwa', 'fatima nagar'
  ];
  const matchedLocality = localities.find((loc) => lower.includes(loc));

  const hasSpecificCriteria = Boolean(
    isHospital || isShowroom || isOffice || isShop || isPreleased ||
    isCommercialGeneral || bhkMatch || isPlot || matchedLocality
  );

  let categoryLabel: string | undefined;
  if (isOffice) categoryLabel = 'Commercial Office Space';
  else if (isHospital) categoryLabel = 'Commercial Medical / Hospital';
  else if (isShowroom) categoryLabel = 'Commercial Showroom';
  else if (isShop) categoryLabel = 'Commercial Retail Shop';
  else if (isPreleased) categoryLabel = 'Pre-Leased Commercial';
  else if (isCommercialGeneral) categoryLabel = 'Commercial Properties (Offices, Showrooms & Pre-Leased)';
  else if (bhkMatch) categoryLabel = `${bhkMatch[1]} BHK Residential`;
  else if (isPlot) categoryLabel = 'Plot & Land';
  else if (matchedLocality) categoryLabel = `Properties in ${matchedLocality.toUpperCase()}`;

  // If there are words left over that don't match any criteria
  const isUnrecognized = !hasSpecificCriteria && stripped.length > 1;

  return {
    isGeneralSellerQuery: !hasSpecificCriteria && !isUnrecognized,
    isUnrecognized,
    unrecognizedTerm: isUnrecognized ? stripped : undefined,
    categoryLabel,
    hasSpecificCriteria,
    matchedLocality,
    isCommercialGeneral,
    isOffice
  };
}
