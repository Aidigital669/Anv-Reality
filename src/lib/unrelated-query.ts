/**
 * Pure parsing and intent classification for unrelated / off-topic queries.
 * Safe to import in both Client and Server Components (no node/db dependencies).
 */

/**
 * Detects if a user query is unusual or completely unrelated to real estate (e.g. "i need oil", "pizza", "shoes", "cars", etc.)
 */
export function isUnrelatedRealEstateQuery(input: string): boolean {
  const text = (input || '').trim().toLowerCase();
  if (!text) return false;

  // 1. Explicit non-real-estate items & commodities (checked FIRST so "i need oil", "buy shoes", "sell car" are immediately recognized as unrelated)
  const explicitNonRealEstateTerms = /\b(?:oil|petrol|diesel|kerosene|cooking\s*oil|engine\s*oil|crude\s*oil|fuel|gasoline|gas\s*cylinder|lpg|food|pizza|burger|sandwich|groceries|grocery|vegetable|vegetables|fruit|fruits|milk|bread|butter|cheese|snack|snacks|dinner|lunch|breakfast|biryani|restaurant\s*table|shoe|shoes|sneakers|cloth|clothes|clothing|dress|shirt|tshirt|pant|jeans|jacket|watch|watches|perfume|cosmetics|car|cars|automobile|bike|bikes|motorcycle|scooter|vehicle|vehicles|laptop|mobile|cellphone|iphone|android|samsung|computer|gadget|electronics|tv|television|fridge|refrigerator|washing\s*machine|medicine|medicines|tablet|tablets|drugs|pharma|pill|pills|syrup|shampoo|soap|detergent|movie|cinema|ticket|tickets|flight|flights|airline|train|railway|hotel\s*booking|room\s*booking|staycation|flight\s*ticket|recharge|sim\s*card|data\s*plan|gold\s*coin|silver\s*coin|jewellery|jewelry|diamond|bitcoin|crypto|cryptocurrency|forex|stock\s*trading|shares\s*trading|mutual\s*funds|lottery|gambling|casino|dating|matrimony|bride|groom|job\s*opening|vacancy|resume|interview|salary)\b/i;
  if (explicitNonRealEstateTerms.test(text)) return true;

  // 2. Explicit greetings, pleasantries, or platform help questions (conversational intents, not unrelated products)
  const isGreetingOrIdentity =
    /^(?:hi|hello|hey|namaste|pranam|good\s*(?:morning|afternoon|evening)|hola|sup|hii|heyy|hiii)\b/i.test(text) ||
    /^(?:who\s*are\s*you|what\s*(?:can|do)\s*you\s*do|help|help\s*me|contact|phone|call|email|whatsapp|address|location|office\s*address|where\s*is\s*your\s*office|support|thanks?|thank\s*you)\b/i.test(text);
  if (isGreetingOrIdentity) return false;

  // 3. Clear real estate typologies, features, or property terms
  const realEstateKeywords = /\b(?:propert(?:y|ies)|real\s*estate|realty|flat|flats|apartment|apartments|bhk|rk|penthouse|penthouses|villa|villas|bungalow|bungalows|house|houses|home|homes|residence|residences|residential|commercial|office|offices|showroom|showrooms|retail|shop|shops|store|stores|hospital|hospitals|clinic|clinics|medical|healthcare|doctor|doctors|dispensary|plot|plots|land|acres|guntha|sqft|sq\s*ft|square\s*feet|carpet|builtup|pre[-_\s]*leased|prelease|roi|rental\s*yield|it\s*park|coworking|workspace|godown|warehouse|industrial|building|tower|society|project|developer|builder|rera|possession|token|agreement|stamp\s*duty|zero\s*brokerage)\b/i;
  if (realEstateKeywords.test(text)) return false;

  // 4. Known Pune / PCMC localities & locations
  const puneLocalities = /\b(?:pune|pcmc|baner|balewadi|koregaon|kp|kalyani\s*nagar|viman\s*nagar|kharadi|hinjewadi|hinjawadi|wakad|undri|bavdhan|mahalunge|kothrud|aundh|shivaji\s*nagar|shivajinagar|camp|m\.?g\.?\s*road|mg\s*road|east\s*wing|magarpatta|hadapsar|senapati\s*bapat|sb\s*road|fc\s*road|jm\s*road|kondhwa|wanowrie|nibm|mohammadwadi|pisoli|katraj|dhanori|tingre\s*nagar|yerwada|wadgaon\s*sheri|tathawade|punawale|ravet|marunji|chakan|talegaon|moshi|bhosari|pimpri|chinchwad|nigdi|akurdi|charholi|dighi|alandi|lohegaon|wagholi|mundhwa|keshav\s*nagar|fatima\s*nagar|salunke\s*vihar|ambegaon|dhayari|warje|karve\s*nagar|model\s*colony|prabhat\s*road|law\s*college|bund\s*garden|boat\s*club)\b/i;
  if (puneLocalities.test(text)) return false;

  // 5. Clear real estate actions / intent (buy/sell/rent/lease/invest)
  const hasRealEstateAction = /\b(?:buy|buying|buyer|invest|investing|investment|investor|sell|seller|selling|list\s*(?:my)?\s*property|owner|find\s*buyer|match\s*buyer|rent|renting|rental|lease|leasing|tenant)\b/i.test(text);
  if (hasRealEstateAction) return false;

  // 6. Price / budget patterns (e.g. "under 2 cr", "50 lakh", "1.5 cr")
  const pricePattern = /\b(?:\d+(?:\.\d+)?\s*(?:cr|crore|crores|lakh|lakhs|lac|lacs))\b/i;
  if (pricePattern.test(text)) return false;

  return true;
}
