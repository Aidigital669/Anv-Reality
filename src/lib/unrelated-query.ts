/**
 * Pure parsing and intent classification for unrelated / off-topic queries and conversational intent.
 * Safe to import in both Client and Server Components (no node/db dependencies).
 */

/**
 * Detects conversational affirmative intents (e.g. "yes", "sure", "ok", "arrange details", "connect me", "interested")
 */
export function isConversationalAffirmative(input: string): boolean {
  const text = (input || '').trim().toLowerCase();
  if (!text) return false;
  return (
    /^(?:yes|yeah|yep|yup|sure|ok|okay|k|definitely|absolutely|certainly|please|yes\s*please|go\s*ahead|arrange\s*(?:it|details)?|connect\s*(?:me)?|proceed|interested|i\s*am\s*interested|sounds\s*good|done|perfect|fine|callback|call\s*me|contact\s*me|share\s*details|schedule|schedule\s*visit)\b/i.test(text) ||
    /\b(?:arrange\s*details|connect\s*with\s*advisory|talk\s*to\s*advisor|speak\s*with\s*advisor|connect\s*me\s*with\s*advisory|arrange\s*a\s*call|arrange\s*visit|share\s*contact|call\s*me\s*back)\b/i.test(text)
  );
}

/**
 * Detects conversational negative intents (e.g. "no", "not now", "later", "no thanks")
 */
export function isConversationalNegative(input: string): boolean {
  const text = (input || '').trim().toLowerCase();
  if (!text) return false;
  return /^(?:no|nope|nah|not\s*now|no\s*thanks|not\s*interested|later|cancel|neither|none)\b/i.test(text);
}

/**
 * Detects if a user query is unusual or completely unrelated to real estate (e.g. "i need oil", "pizza", "shoes", "cars", etc.)
 * NEVER flags conversational responses ("yes", "sure", "no", "ok", greetings, or dialogue questions) as unrelated.
 */
export function isUnrelatedRealEstateQuery(input: string, hasChatHistory?: boolean): boolean {
  const text = (input || '').trim().toLowerCase();
  if (!text) return false;

  // 1. Explicit non-real-estate commodities & consumer goods (checked FIRST: "i need oil", "pizza", "buy shoes", "sell car")
  const explicitNonRealEstateTerms = /\b(?:oil|petrol|diesel|kerosene|cooking\s*oil|engine\s*oil|crude\s*oil|fuel|gasoline|gas\s*cylinder|lpg|food|pizza|burger|sandwich|groceries|grocery|vegetable|vegetables|fruit|fruits|milk|bread|butter|cheese|snack|snacks|dinner|lunch|breakfast|biryani|restaurant\s*table|shoe|shoes|sneakers|cloth|clothes|clothing|dress|shirt|tshirt|pant|jeans|jacket|watch|watches|perfume|cosmetics|car|cars|automobile|bike|bikes|motorcycle|scooter|vehicle|vehicles|laptop|mobile|cellphone|iphone|android|samsung|computer|gadget|electronics|tv|television|fridge|refrigerator|washing\s*machine|medicine|medicines|tablet|tablets|drugs|pharma|pill|pills|syrup|shampoo|soap|detergent|movie|cinema|ticket|tickets|flight|flights|airline|train|railway|hotel\s*booking|room\s*booking|staycation|flight\s*ticket|recharge|sim\s*card|data\s*plan|gold\s*coin|silver\s*coin|jewellery|jewelry|diamond|bitcoin|crypto|cryptocurrency|forex|stock\s*trading|shares\s*trading|mutual\s*funds|lottery|gambling|casino|dating|matrimony|bride|groom|job\s*opening|vacancy|resume|interview|salary)\b/i;
  if (explicitNonRealEstateTerms.test(text)) return true;

  // 2. In an ongoing conversation (messages.length > 1), if it does NOT match explicitNonRealEstateTerms,
  // it is part of conversational dialogue (answering questions, preferences, contact info, etc.) -> NEVER unrelated!
  if (hasChatHistory) return false;

  // 3. Conversational affirmative or negative intents (e.g. "yes", "sure", "ok", "no", "later")
  if (isConversationalAffirmative(text) || isConversationalNegative(text)) return false;

  // 4. Explicit greetings, pleasantries, or platform help questions (conversational intents, not unrelated products)
  const isGreetingOrIdentity =
    /^(?:hi|hello|hey|namaste|pranam|good\s*(?:morning|afternoon|evening)|hola|sup|hii|heyy|hiii)\b/i.test(text) ||
    /^(?:who\s*are\s*you|what\s*(?:can|do)\s*you\s*do|help|help\s*me|contact|phone|call|email|whatsapp|address|location|office\s*address|where\s*is\s*your\s*office|support|thanks?|thank\s*you)\b/i.test(text);
  if (isGreetingOrIdentity) return false;

  // 5. Conversational questions, qualifiers, and choices (e.g. "both", "self use", "investment", "tell me more")
  const isConversationalDialogue =
    /\b(?:both|either|self\s*use|own\s*use|for\s*myself|for\s*my\s*own|end\s*user|investment|invest|rental|lease|pre[-_\s]*leased|tell\s*me|explain|how|what|when|where|why|which|can\s*you|could\s*you|would\s*you|details|more|info|information|option\s*[1-3]|\d)\b/i.test(text);
  if (isConversationalDialogue) return false;

  // 6. Clear real estate typologies, features, or property terms
  const hasRealEstateKeyword = /\b(?:propert(?:y|ies)|real\s*estate|realty|flat|flats|apartment|apartments|bhk|rk|penthouse|penthouses|villa|villas|bungalow|bungalows|house|houses|home|homes|residence|residences|residential|commercial|office|offices|showroom|showrooms|retail|shop|shops|store|stores|hospital|hospitals|clinic|clinics|medical|healthcare|doctor|doctors|dispensary|plot|plots|land|acres|guntha|sqft|sq\s*ft|square\s*feet|carpet|builtup|pre[-_\s]*leased|prelease|roi|rental\s*yield|it\s*park|coworking|workspace|godown|warehouse|industrial|building|tower|society|project|developer|builder|rera|possession|token|agreement|stamp\s*duty|zero\s*brokerage)\b/i.test(text);
  if (hasRealEstateKeyword) return false;

  // 7. Known Pune / PCMC localities & locations
  const hasPuneLocality = /\b(?:pune|pcmc|baner|balewadi|koregaon|kp|kalyani\s*nagar|viman\s*nagar|kharadi|hinjewadi|hinjawadi|wakad|undri|bavdhan|mahalunge|kothrud|aundh|shivaji\s*nagar|shivajinagar|camp|m\.?g\.?\s*road|mg\s*road|east\s*wing|magarpatta|hadapsar|senapati\s*bapat|sb\s*road|fc\s*road|jm\s*road|kondhwa|wanowrie|nibm|mohammadwadi|pisoli|katraj|dhanori|tingre\s*nagar|yerwada|wadgaon\s*sheri|tathawade|punawale|ravet|marunji|chakan|talegaon|moshi|bhosari|pimpri|chinchwad|nigdi|akurdi|charholi|dighi|alandi|lohegaon|wagholi|mundhwa|keshav\s*nagar|fatima\s*nagar|salunke\s*vihar|ambegaon|dhayari|warje|karve\s*nagar|model\s*colony|prabhat\s*road|law\s*college|bund\s*garden|boat\s*club)\b/i.test(text);
  if (hasPuneLocality) return false;

  // 8. Clear real estate actions / intent (buy/sell/rent/lease/invest)
  const hasRealEstateAction = /\b(?:buy|buying|buyer|invest|investing|investment|investor|sell|seller|selling|list\s*(?:my)?\s*property|owner|find\s*buyer|match\s*buyer|rent|renting|rental|lease|leasing|tenant)\b/i.test(text);
  if (hasRealEstateAction) return false;

  // 9. Price / budget patterns (e.g. "under 2 cr", "50 lakh", "1.5 cr")
  const hasPricePattern = /\b(?:\d+(?:\.\d+)?\s*(?:cr|crore|crores|lakh|lakhs|lac|lacs))\b/i.test(text);
  if (hasPricePattern) return false;

  return true;
}

/**
 * Strips repetitive property list bullets (markdown links, arrows '-> :', or property metadata)
 * from assistant chat messages when property cards are already rendered below.
 */
export function stripDuplicatePropertyBulletLinks(content: string): string {
  if (!content) return '';
  const lines = content.split('\n');
  const cleaned = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return true;

    const isBullet = /^\s*(?:[*•\-+]|\d+\.)\s+/.test(trimmed);
    const hasLinkOrArrow =
      /\[([^\]]+)\]\(([^)]+)\)/.test(trimmed) ||
      /(?:->|→)\s*:?/.test(trimmed) ||
      /\/properties\//i.test(trimmed);
    const hasPropertyMeta =
      /\b(?:\d+(?:\.\d+)?\s*(?:cr|crore|crores|lakh|lakhs|lac|lacs|k)|sq\.?ft|sqft|carpet|built[-_\s]*up|ready\s*to\s*move|under\s*construction|roi|rental\s*yield)\b/i.test(trimmed);

    // 1. Bullet lines with links, arrows, or property metadata (e.g. price, sqft, carpet)
    if (isBullet && (hasLinkOrArrow || hasPropertyMeta)) {
      return false;
    }

    // 2. Lines that start with a markdown link to a property or containing property details
    const startsWithLink = /^\s*(?:\*\*)?\[([^\]]+)\]\(([^)]+)\)/.test(trimmed);
    if (startsWithLink && (hasPropertyMeta || /\/properties\//i.test(trimmed) || hasLinkOrArrow)) {
      return false;
    }

    // 3. Standalone lines that are just property URLs or arrows
    if (/^\s*(?:->|→|https?:\/\/[^\s]+|\/properties\/[^\s]+)\s*$/i.test(trimmed)) {
      return false;
    }

    return true;
  });

  let res = cleaned.join('\n');

  // Convert any remaining inline markdown links to properties into clean plain text
  // e.g. [Prelease Commercial Hospital Premise](/properties/123) -> Prelease Commercial Hospital Premise
  res = res.replace(/\[([^\]]+)\]\((?:https?:\/\/[^\/]+)?\/properties\/[^)]+\)/gi, '$1');

  // If a line ended with ':' right before the removed bullets, convert to '.' so it reads naturally
  res = res.replace(/:\s*(\n\s*\n|\n?$)/g, '.$1');

  // Clean excessive blank lines
  res = res.replace(/\n{3,}/g, '\n\n').trim();

  if (!res) {
    return 'Here are verified property options in our Pune portfolio matching your search. Explore full details and pricing below:';
  }
  return res;
}
