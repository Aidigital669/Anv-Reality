/**
 * Real Estate Scraper Intelligence & Classifier
 * Accurately extracts the 10 Primary Categories and 3 Property Tags (Preleased, New, PreLaunch)
 */

export type ScrapedPropertyTag = 'Preleased' | 'New' | 'PreLaunch';

export const REAL_ESTATE_CATEGORIES = [
  'Shop',
  'Office',
  'Showroom',
  'Hospital',
  'AgriLand',
  'Industrial Land',
  'Restaurant',
  'Hotel',
  'Resort',
  'Warehouse'
] as const;

export interface ExtractedRealEstateInfo {
  category: string;
  tag: ScrapedPropertyTag;
  configuration: string; // e.g. "Office (Preleased)"
  status: string;        // 'Ready to Move' | 'Pre-Launch' | 'Under-Construction'
  isCommercial: boolean;
}

/**
 * Classifies raw scraped text, title, specifications, and descriptions into
 * the 10 Real Estate Categories and 3 Tags (Preleased, New, PreLaunch).
 */
export function classifyScrapedProperty(
  title: string = '',
  description: string = '',
  specs: { key: string; value: string }[] = [],
  categoryHint: string = ''
): ExtractedRealEstateInfo {
  const specText = specs.map((s) => `${s.key}: ${s.value}`).join(' ');
  const fullText = `${title} ${description} ${categoryHint} ${specText}`.toLowerCase();

  // ----------------------------------------------------
  // 1. Detect Tag (Preleased, PreLaunch, or New)
  // ----------------------------------------------------
  let tag: ScrapedPropertyTag = 'New'; // default

  const isPreleased = /\b(?:pre[-_\s]*leased|prelease|preleased|pre[-_\s]*rented|prerented|pre rented|rental yield|rent yield|leased to|rented to|active tenant|active lease|tenanted|high roi)\b/i.test(
    fullText
  );

  const isPreLaunch = /\b(?:pre[-_\s]*launch|prelaunch|upcoming launch|launching soon|new launch|newly launched|booking open|inaugural offer|expression of interest|eoi|pre booking)\b/i.test(
    fullText
  );

  if (isPreleased) {
    tag = 'Preleased';
  } else if (isPreLaunch) {
    tag = 'PreLaunch';
  } else {
    tag = 'New';
  }

  // ----------------------------------------------------
  // 2. Detect Category (10 Primary Categories or Residential)
  // ----------------------------------------------------
  let category: string = '';
  let isCommercial = true;

  // Hospital & Healthcare
  if (/\b(?:hospital|hospitals|clinic|clinics|medical centre|medical center|nursing home|healthcare|medical premise|doctor clinic|opd)\b/i.test(fullText)) {
    category = 'Hospital';
  }
  // Warehouse & Logistics
  else if (/\b(?:warehouse|warehouses|godown|godowns|logistics hub|industrial shed|storage unit|distribution centre|distribution center|cold storage|fulfillment centre|fulfillment center)\b/i.test(fullText)) {
    category = 'Warehouse';
  }
  // Showroom
  else if (/\b(?:showroom|showrooms|retail showroom|auto showroom|car showroom|display showroom|brand showroom|flagship showroom)\b/i.test(fullText)) {
    category = 'Showroom';
  }
  // Shop & Retail Store
  else if (/\b(?:shop|shops|retail shop|retail store|commercial shop|convenience store|high street retail|retail space|retail unit)\b/i.test(fullText)) {
    category = 'Shop';
  }
  // Restaurant & F&B
  else if (/\b(?:restaurant|restaurants|cafe|cafeteria|dining space|food court|rooftop lounge|f&b space|bar & diner|pub|bistro|eatery)\b/i.test(fullText)) {
    category = 'Restaurant';
  }
  // Resort
  else if (/\b(?:resort|resorts|luxury resort|holiday resort|eco resort|nature retreat|wellness resort|beach resort|hill resort|spa resort)\b/i.test(fullText)) {
    category = 'Resort';
  }
  // Hotel
  else if (/\b(?:hotel|hotels|boutique hotel|business hotel|guest house|inn|lodging|hospitality property)\b/i.test(fullText)) {
    category = 'Hotel';
  }
  // AgriLand / Farm Land
  else if (/\b(?:agriland|agri land|agriculture land|agricultural land|farm land|farmland|farmhouse plot|farm plot|plantation land|orchard)\b/i.test(fullText)) {
    category = 'AgriLand';
  }
  // Industrial Land
  else if (/\b(?:industrial land|industrial plot|midc plot|midc land|factory land|manufacturing plot|industrial estate|industrial zone|factory shed)\b/i.test(fullText)) {
    category = 'Industrial Land';
  }
  // Office Space
  else if (/\b(?:office|offices|commercial office|office space|corporate office|it office|it park|tech park|cybercity|business park|coworking|co-working|plug and play|bare shell|warm shell)\b/i.test(fullText)) {
    category = 'Office';
  }
  // Residential: Penthouse
  else if (/\b(?:penthouse|sky penthouse|duplex penthouse)\b/i.test(fullText)) {
    category = '4.5+ BHK Penthouse';
    isCommercial = false;
  }
  // Residential: Villa / Bungalow
  else if (/\b(?:villa|villas|bungalow|bunglow|row house|independent house|sky villa)\b/i.test(fullText)) {
    category = 'Sky Villa';
    isCommercial = false;
  }
  // Land / Plot
  else if (/\b(?:land|plot|plots|guntha|na plot|residential plot)\b/i.test(fullText)) {
    category = 'Residential/Commercial Land/Plot';
    isCommercial = false;
  }
  // Residential: BHK Pattern check
  else {
    const bhkMatch = title.match(/(\d+(?:\.\d+)?|\d+\/\d+)\s*bhk/i) ||
      description.match(/(\d+(?:\.\d+)?|\d+\/\d+)\s*bhk/i) ||
      specText.match(/(\d+(?:\.\d+)?|\d+\/\d+)\s*bhk/i);

    if (bhkMatch) {
      category = `${bhkMatch[1]} BHK`;
      isCommercial = false;
    } else if (/\b(?:commercial|workspace|business|retail|corp)\b/i.test(fullText)) {
      category = 'Office';
      isCommercial = true;
    } else {
      category = '3 BHK';
      isCommercial = false;
    }
  }

  // ----------------------------------------------------
  // 3. Status Derivation
  // ----------------------------------------------------
  let status = 'Ready to Move';
  if (tag === 'PreLaunch') {
    status = 'Pre-Launch';
  } else if (/\b(?:under[-_\s]*construction|ongoing|under work)\b/i.test(fullText)) {
    status = 'Under-Construction';
  } else if (/\b(?:ready[-_\s]*to[-_\s]*move|ready possession|immediate possession|completed)\b/i.test(fullText)) {
    status = 'Ready to Move';
  }

  // ----------------------------------------------------
  // 4. Combined Configuration e.g. "Office (Preleased)"
  // ----------------------------------------------------
  const configuration = `${category} (${tag})`;

  return {
    category,
    tag,
    configuration,
    status,
    isCommercial
  };
}

