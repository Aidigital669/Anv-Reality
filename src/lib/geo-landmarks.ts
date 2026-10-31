/**
 * 5 KM Nearest Connectivity & Geospatial Engine
 * Curated high-precision landmark database, coordinate resolver, and Haversine distance calculator.
 */

export type LandmarkCategory = 'transit' | 'highway' | 'tech_park' | 'healthcare' | 'airport' | 'railway';

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface LandmarkItem {
  id: string;
  name: string;
  category: LandmarkCategory;
  categoryLabel: string;
  lat: number;
  lng: number;
  locality?: string;
  description?: string;
}

export interface ConnectivityResult {
  id: string;
  name: string;
  category: LandmarkCategory;
  categoryLabel: string;
  distanceKm: number;
  distanceFormatted: string;
  driveTimeFormatted: string;
  directionsUrl: string;
  lat: number;
  lng: number;
}

// 45+ Pune & PCMC Locality Centroid Coordinates
export const PUNE_LOCALITY_COORDINATES: Record<string, GeoCoordinate> = {
  baner: { lat: 18.559, lng: 73.7868 },
  balewadi: { lat: 18.5752, lng: 73.7707 },
  wakad: { lat: 18.5987, lng: 73.766 },
  hinjewadi: { lat: 18.5913, lng: 73.7389 },
  'hinjawadi': { lat: 18.5913, lng: 73.7389 },
  kharadi: { lat: 18.5529, lng: 73.9392 },
  'koregaon park': { lat: 18.5362, lng: 73.894 },
  'kalyani nagar': { lat: 18.5477, lng: 73.9037 },
  'viman nagar': { lat: 18.5679, lng: 73.9143 },
  bavdhan: { lat: 18.5147, lng: 73.7744 },
  aundh: { lat: 18.558, lng: 73.8077 },
  kothrud: { lat: 18.5074, lng: 73.8077 },
  shivajinagar: { lat: 18.5314, lng: 73.8446 },
  'senapati bapat road': { lat: 18.5326, lng: 73.8298 },
  'sb road': { lat: 18.5326, lng: 73.8298 },
  undri: { lat: 18.4574, lng: 73.9099 },
  hadapsar: { lat: 18.5089, lng: 73.9259 },
  magarpatta: { lat: 18.5158, lng: 73.9272 },
  camp: { lat: 18.5165, lng: 73.8795 },
  swargate: { lat: 18.5018, lng: 73.8586 },
  pimpri: { lat: 18.6298, lng: 73.7997 },
  chinchwad: { lat: 18.6279, lng: 73.7831 },
  bhosari: { lat: 18.6231, lng: 73.8465 },
  talawade: { lat: 18.6811, lng: 73.7891 },
  moshi: { lat: 18.6729, lng: 73.8488 },
  ravet: { lat: 18.6475, lng: 73.7371 },
  punawale: { lat: 18.6272, lng: 73.7439 },
  tathawade: { lat: 18.6148, lng: 73.7538 },
  mahalunge: { lat: 18.5776, lng: 73.7548 },
  sus: { lat: 18.5487, lng: 73.7541 },
  pashan: { lat: 18.5414, lng: 73.7925 },
  dhayari: { lat: 18.4485, lng: 73.8118 },
  katraj: { lat: 18.4482, lng: 73.8587 },
  bibwewadi: { lat: 18.4735, lng: 73.8647 },
  wanowrie: { lat: 18.4905, lng: 73.8997 },
  'fatima nagar': { lat: 18.5029, lng: 73.8967 },
  kondhwa: { lat: 18.4687, lng: 73.8895 },
  wagholi: { lat: 18.5794, lng: 73.9822 },
  'keshav nagar': { lat: 18.5369, lng: 73.9388 },
  mundhwa: { lat: 18.5342, lng: 73.9242 },
  dhanori: { lat: 18.5935, lng: 73.8943 },
  'tingre nagar': { lat: 18.5765, lng: 73.8842 },
  lohegaon: { lat: 18.6049, lng: 73.9264 },
  dighi: { lat: 18.6087, lng: 73.8698 },
  chakan: { lat: 18.7599, lng: 73.8567 },
  talegaon: { lat: 18.7346, lng: 73.6766 }
};

// Curated transit, highway, IT hubs, and infrastructure landmarks
export const CURATED_PUNE_LANDMARKS: LandmarkItem[] = [
  // --- METRO & TRANSIT STATIONS ---
  {
    id: 'metro-hinjewadi-l3',
    name: 'Hinjewadi Metro Line 3 Terminal',
    category: 'transit',
    categoryLabel: 'Metro & Transit',
    lat: 18.5913,
    lng: 73.7389,
    description: 'Upcoming Pune Metro Line 3 connecting Hinjewadi IT Park to Shivajinagar'
  },
  {
    id: 'metro-balewadi-stadium',
    name: 'Balewadi High Street / Stadium Metro',
    category: 'transit',
    categoryLabel: 'Metro & Transit',
    lat: 18.5786,
    lng: 73.7712,
    description: 'Metro Line 3 station on Baner-Balewadi arterial corridor'
  },
  {
    id: 'metro-baner-junction',
    name: 'Baner Phata Metro Station',
    category: 'transit',
    categoryLabel: 'Metro & Transit',
    lat: 18.5585,
    lng: 73.7915,
    description: 'Key transit interchange on Baner Road'
  },
  {
    id: 'metro-wakad-bridge',
    name: 'Wakad Bridge Transit Hub',
    category: 'transit',
    categoryLabel: 'Metro & Transit',
    lat: 18.601,
    lng: 73.7634,
    description: 'Major arterial interchange connecting Hinjewadi, Wakad and Expressway'
  },
  {
    id: 'metro-kalyani-nagar',
    name: 'Kalyani Nagar Metro Station',
    category: 'transit',
    categoryLabel: 'Metro & Transit',
    lat: 18.5485,
    lng: 73.904,
    description: 'Aqua Line Metro Station connecting Kalyani Nagar & Pune Junction'
  },
  {
    id: 'metro-ramwadi',
    name: 'Ramwadi Metro Station',
    category: 'transit',
    categoryLabel: 'Metro & Transit',
    lat: 18.5539,
    lng: 73.9142,
    description: 'Aqua Line Terminal serving Viman Nagar & Nagar Road corridor'
  },
  {
    id: 'metro-civil-court',
    name: 'Civil Court Central Metro Interchange',
    category: 'transit',
    categoryLabel: 'Metro & Transit',
    lat: 18.5285,
    lng: 73.8561,
    description: 'Central mega-interchange connecting Line 1 (Purple), Line 2 (Aqua) & Line 3'
  },
  {
    id: 'metro-ruby-hall',
    name: 'Ruby Hall Clinic Metro Station',
    category: 'transit',
    categoryLabel: 'Metro & Transit',
    lat: 18.5324,
    lng: 73.8821,
    description: 'Aqua Line station serving Central Pune & Railway Station corridor'
  },
  {
    id: 'metro-vanaz',
    name: 'Vanaz Metro Terminal',
    category: 'transit',
    categoryLabel: 'Metro & Transit',
    lat: 18.5065,
    lng: 73.8015,
    description: 'Aqua Line western terminus in Kothrud'
  },
  {
    id: 'metro-swargate',
    name: 'Swargate Multimodal Underground Metro Station',
    category: 'transit',
    categoryLabel: 'Metro & Transit',
    lat: 18.5015,
    lng: 73.8582,
    description: 'Major multimodal southern interchange connecting bus, rail & metro'
  },
  {
    id: 'metro-bhosari',
    name: 'Bhosari (Nashik Phata) Metro Station',
    category: 'transit',
    categoryLabel: 'Metro & Transit',
    lat: 18.6045,
    lng: 73.8219,
    description: 'Purple Line interchange at Nashik Phata'
  },

  // --- HIGHWAYS & ARTERIAL CORRIDORS ---
  {
    id: 'hwy-mumbai-pune-exp',
    name: 'Mumbai-Pune Expressway Toll Plaza',
    category: 'highway',
    categoryLabel: 'Highways & Corridors',
    lat: 18.6738,
    lng: 73.7118,
    description: 'Direct 90-minute expressway gateway to Navi Mumbai & JNPT'
  },
  {
    id: 'hwy-nh48-dehu-katraj',
    name: 'NH48 Mumbai-Bangalore Bypass (Katraj-Dehu)',
    category: 'highway',
    categoryLabel: 'Highways & Corridors',
    lat: 18.5632,
    lng: 73.7745,
    description: 'Arterial western bypass connecting Baner, Balewadi, Wakad & Hinjewadi'
  },
  {
    id: 'hwy-pune-solapur',
    name: 'Pune-Solapur National Highway (NH65)',
    category: 'highway',
    categoryLabel: 'Highways & Corridors',
    lat: 18.4985,
    lng: 73.9385,
    description: 'Eastern arterial corridor connecting Hadapsar, Magarpatta and Solapur'
  },
  {
    id: 'hwy-nagar-road',
    name: 'Ahmednagar State Highway (Nagar Road)',
    category: 'highway',
    categoryLabel: 'Highways & Corridors',
    lat: 18.562,
    lng: 73.9298,
    description: 'Major arterial road serving Viman Nagar, Kharadi & Wagholi'
  },
  {
    id: 'hwy-ring-road-junction',
    name: 'Pune Ring Road Western Arterial Link',
    category: 'highway',
    categoryLabel: 'Highways & Corridors',
    lat: 18.528,
    lng: 73.742,
    description: '14-lane upcoming PMRDA outer ring road junction'
  },
  {
    id: 'hwy-sb-road-artery',
    name: 'Senapati Bapat Corporate Corridor',
    category: 'highway',
    categoryLabel: 'Highways & Corridors',
    lat: 18.5326,
    lng: 73.8298,
    description: 'Prime Central Pune commercial and business spine'
  },

  // --- TECH & BUSINESS HUBS ---
  {
    id: 'it-hinjewadi-rgip-p1',
    name: 'Rajiv Gandhi Infotech Park (Phase 1)',
    category: 'tech_park',
    categoryLabel: 'IT & Business Parks',
    lat: 18.5913,
    lng: 73.7389,
    description: 'Home to Infosys, Wipro, Cognizant, and 200+ multinational tech giants'
  },
  {
    id: 'it-hinjewadi-rgip-p2',
    name: 'Rajiv Gandhi Infotech Park (Phase 2 & 3)',
    category: 'tech_park',
    categoryLabel: 'IT & Business Parks',
    lat: 18.5835,
    lng: 73.712,
    description: 'SEZ IT corridor including Quadron, TCS, Tech Mahindra, and Siemens'
  },
  {
    id: 'it-eon-kharadi',
    name: 'EON Free Zone Kharadi',
    category: 'tech_park',
    categoryLabel: 'IT & Business Parks',
    lat: 18.5525,
    lng: 73.9495,
    description: '45-acre iconic tech hub with Credit Suisse, Barclays, UBS, and Citi'
  },
  {
    id: 'it-wtc-kharadi',
    name: 'World Trade Center (WTC) Kharadi',
    category: 'tech_park',
    categoryLabel: 'IT & Business Parks',
    lat: 18.5505,
    lng: 73.947,
    description: 'Premier multinational corporate center and commercial offices'
  },
  {
    id: 'it-magarpatta-cybercity',
    name: 'Magarpatta Cybercity',
    category: 'tech_park',
    categoryLabel: 'IT & Business Parks',
    lat: 18.5158,
    lng: 73.9272,
    description: 'Integrated 400-acre township with Accenture, Amdocs, and HCL'
  },
  {
    id: 'it-panchshil-business-park',
    name: 'Panchshil Business Park (Baner/Balewadi)',
    category: 'tech_park',
    categoryLabel: 'IT & Business Parks',
    lat: 18.572,
    lng: 73.7745,
    description: 'Grade-A corporate IT park on Balewadi High Street with Veritas & Siemens'
  },
  {
    id: 'it-cerebrum-kalyani-nagar',
    name: 'Cerebrum IT Park (Kalyani Nagar)',
    category: 'tech_park',
    categoryLabel: 'IT & Business Parks',
    lat: 18.5492,
    lng: 73.903,
    description: 'Corporate tech destination next to Koregaon Park'
  },
  {
    id: 'it-weikfield-viman-nagar',
    name: 'Weikfield IT Citi InfoPark (Nagar Road)',
    category: 'tech_park',
    categoryLabel: 'IT & Business Parks',
    lat: 18.5598,
    lng: 73.9102,
    description: 'Grade-A corporate park opposite Phoenix Marketcity'
  },
  {
    id: 'it-icc-trade-tower',
    name: 'ICC Trade Tower (SB Road)',
    category: 'tech_park',
    categoryLabel: 'IT & Business Parks',
    lat: 18.5342,
    lng: 73.829,
    description: 'Iconic Central Pune corporate and financial campus'
  },
  {
    id: 'it-commerzone-yerawada',
    name: 'Commerzone IT Park (Yerawada)',
    category: 'tech_park',
    categoryLabel: 'IT & Business Parks',
    lat: 18.5638,
    lng: 73.8785,
    description: 'Massive corporate IT campus minutes from Airport and Railway Station'
  },
  {
    id: 'it-talawade-it-park',
    name: 'Talawade Mindspace IT Park',
    category: 'tech_park',
    categoryLabel: 'IT & Business Parks',
    lat: 18.6811,
    lng: 73.7891,
    description: 'PCMC technology park with Capgemini and Syntel campuses'
  },

  // --- AIRPORTS & RAILWAYS ---
  {
    id: 'airport-pune-intl',
    name: 'Pune International Airport (PNQ, Lohegaon)',
    category: 'airport',
    categoryLabel: 'Airport & Transit',
    lat: 18.5822,
    lng: 73.9197,
    description: 'Direct national & international flights with modern New Integrated Terminal'
  },
  {
    id: 'railway-pune-junction',
    name: 'Pune Junction Central Railway Station',
    category: 'railway',
    categoryLabel: 'Railways & Terminus',
    lat: 18.5284,
    lng: 73.8744,
    description: 'Primary intercity rail terminal connecting Mumbai, Delhi, Bengaluru & Goa'
  },
  {
    id: 'railway-shivajinagar',
    name: 'Shivajinagar Railway & Bus Terminal',
    category: 'railway',
    categoryLabel: 'Railways & Terminus',
    lat: 18.5314,
    lng: 73.8505,
    description: 'Secondary express train terminal & major city transport interchange'
  },

  // --- HEALTHCARE & SOCIAL INFRASTRUCTURE ---
  {
    id: 'hosp-jupiter-baner',
    name: 'Jupiter Super Specialty Hospital (Baner)',
    category: 'healthcare',
    categoryLabel: 'Healthcare & Social',
    lat: 18.5615,
    lng: 73.7812,
    description: '350-bed tertiary care quaternary multi-specialty medical facility'
  },
  {
    id: 'hosp-manipal-kharadi',
    name: 'Manipal Hospital (Kharadi)',
    category: 'healthcare',
    categoryLabel: 'Healthcare & Social',
    lat: 18.552,
    lng: 73.935,
    description: 'Leading multi-specialty quaternary care hospital in East Pune'
  },
  {
    id: 'hosp-ruby-hall-clinic',
    name: 'Ruby Hall Clinic (Sasoon Road / Pune Station)',
    category: 'healthcare',
    categoryLabel: 'Healthcare & Social',
    lat: 18.5332,
    lng: 73.8812,
    description: 'Nationally renowned multi-specialty healthcare & organ transplant center'
  },
  {
    id: 'hosp-aditya-birla',
    name: 'Aditya Birla Memorial Hospital (Chinchwad)',
    category: 'healthcare',
    categoryLabel: 'Healthcare & Social',
    lat: 18.6255,
    lng: 73.7668,
    description: '500-bed multi-specialty healthcare destination serving Hinjewadi & PCMC'
  },
  {
    id: 'hosp-sahyadri-deccan',
    name: 'Sahyadri Super Specialty Hospital (Deccan)',
    category: 'healthcare',
    categoryLabel: 'Healthcare & Social',
    lat: 18.5145,
    lng: 73.8378,
    description: 'Leading neuro & cardiology tertiary care hospital in central Pune'
  },
  {
    id: 'hosp-jehangir',
    name: 'Jehangir Hospital (Pune Station)',
    category: 'healthcare',
    categoryLabel: 'Healthcare & Social',
    lat: 18.5308,
    lng: 73.8765,
    description: 'NABH-accredited premier healthcare institution'
  }
];

/**
 * Mathematical Haversine Distance Formula
 * Computes exact geodesic distance between two GPS coordinates in kilometers.
 */
export function calculateDistanceKm(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Estimates driving commute time in Pune urban & arterial conditions.
 * Urban corridors avg ~20-25 km/h with signals and intersections.
 */
export function estimateDriveTime(distanceKm: number): string {
  if (distanceKm <= 0.8) return '2-3 mins';
  if (distanceKm <= 1.5) return '4-5 mins';
  if (distanceKm <= 2.5) return '6-8 mins';
  if (distanceKm <= 4.0) return '10-12 mins';
  if (distanceKm <= 5.0) return '12-15 mins';
  if (distanceKm <= 7.0) return '15-18 mins';
  return `${Math.round(distanceKm * 2.8)} mins`;
}

/**
 * Resolves a property's origin GPS coordinates from its locality string or explicit lat/lng.
 */
export function resolveCoordinates(
  locality?: string,
  lat?: number,
  lng?: number
): GeoCoordinate | null {
  if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng) && lat !== 0) {
    return { lat, lng };
  }

  if (!locality) return null;

  const cleanLoc = locality
    .toLowerCase()
    .replace(/,?\s*(pune|pcmc|maharashtra|india)\s*/gi, '')
    .trim();

  // Exact match
  if (PUNE_LOCALITY_COORDINATES[cleanLoc]) {
    return PUNE_LOCALITY_COORDINATES[cleanLoc];
  }

  // Substring match
  const matchKey = Object.keys(PUNE_LOCALITY_COORDINATES).find(
    (key) => cleanLoc.includes(key) || key.includes(cleanLoc)
  );

  if (matchKey) {
    return PUNE_LOCALITY_COORDINATES[matchKey];
  }

  // Fallback to central Pune if locality is generally "Pune"
  if (locality.toLowerCase().includes('pune')) {
    return { lat: 18.5204, lng: 73.8567 };
  }

  return null;
}

/**
 * Finds all curated landmarks within a specified radius (default: 5.0 km) of a property.
 * Sorted by distance (closest first).
 */
export function findNearestLandmarks(
  origin: { locality?: string; lat?: number; lng?: number },
  radiusKm = 5.0,
  categoryFilter?: LandmarkCategory | 'all'
): ConnectivityResult[] {
  const originCoords = resolveCoordinates(origin.locality, origin.lat, origin.lng);
  if (!originCoords) return [];

  const results: ConnectivityResult[] = [];

  for (const landmark of CURATED_PUNE_LANDMARKS) {
    if (categoryFilter && categoryFilter !== 'all' && landmark.category !== categoryFilter) {
      continue;
    }

    const dist = calculateDistanceKm(originCoords, { lat: landmark.lat, lng: landmark.lng });

    if (dist <= radiusKm) {
      const distanceRounded = Math.round(dist * 10) / 10;
      const formattedDistance = distanceRounded < 1 ? `${Math.round(dist * 1000)} m` : `${distanceRounded.toFixed(1)} km`;
      const driveTime = estimateDriveTime(dist);
      const originQuery = origin.locality ? encodeURIComponent(origin.locality) : `${originCoords.lat},${originCoords.lng}`;
      const destinationQuery = encodeURIComponent(landmark.name);
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originQuery}&destination=${destinationQuery}&travelmode=driving`;

      results.push({
        id: landmark.id,
        name: landmark.name,
        category: landmark.category,
        categoryLabel: landmark.categoryLabel,
        distanceKm: distanceRounded,
        distanceFormatted: formattedDistance,
        driveTimeFormatted: driveTime,
        directionsUrl,
        lat: landmark.lat,
        lng: landmark.lng
      });
    }
  }

  // Sort ascending by distance (closest first)
  results.sort((a, b) => a.distanceKm - b.distanceKm);

  return results;
}

/**
 * Auto-generates high-converting marketing bullet points for executive dossiers.
 * Used by Admin Property Editor and Scraper Importer.
 */
export function formatConnectivityBulletPoints(
  origin: { locality?: string; lat?: number; lng?: number },
  limit = 5
): string[] {
  // First search within 5 km
  let landmarks = findNearestLandmarks(origin, 5.0);

  // If few landmarks within 5 km, expand to 8 km
  if (landmarks.length < 3) {
    landmarks = findNearestLandmarks(origin, 8.0);
  }

  if (landmarks.length === 0) {
    const loc = origin.locality || 'Prime Location';
    return [
      `Strategic connectivity to central business corridors in ${loc}`,
      `Under 10-15 mins from key transit hubs & arterial highways`,
      `Close proximity to reputed healthcare facilities & social infra`
    ];
  }

  return landmarks.slice(0, limit).map((l) => {
    if (l.category === 'transit') {
      return `Within ${l.distanceFormatted} (~${l.driveTimeFormatted}) of ${l.name}`;
    }
    if (l.category === 'highway') {
      return `Direct arterial connectivity to ${l.name} (${l.distanceFormatted})`;
    }
    if (l.category === 'tech_park') {
      return `${l.distanceFormatted} from ${l.name} corporate tech hub`;
    }
    if (l.category === 'airport' || l.category === 'railway') {
      return `${l.distanceFormatted} commute to ${l.name}`;
    }
    return `${l.distanceFormatted} (~${l.driveTimeFormatted}) from ${l.name}`;
  });
}

