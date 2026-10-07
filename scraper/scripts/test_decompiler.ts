import * as cheerio from "cheerio";

const FRAMEWORK_JUNK_TITLES = new Set([
  "robots", "next-router", "viewport", "manifest", "utf-8", "description",
  "keywords", "author", "theme-color", "icon", "apple-touch-icon", "og:image",
  "twitter:card", "preload", "prefetch", "stylesheet", "main", "app", "layout",
  "page", "react", "webpack", "chunk", "undefined", "null", "boolean", "string",
  "object", "array", "function", "component", "about property", "property details",
  "contact us", "privacy policy", "terms and conditions", "disclaimer", "all rights reserved"
]);

function isFrameworkJunkTitle(title: string): boolean {
  if (!title || typeof title !== "string") return true;
  const clean = title.trim().toLowerCase();
  if (clean.length < 4 || clean.length > 120) return true;
  if (FRAMEWORK_JUNK_TITLES.has(clean)) return true;
  if (clean.startsWith("next-") || clean.startsWith("_next") || clean.startsWith("react-")) return true;
  return false;
}

async function testDecompiler() {
  const url = "https://ayurmor.com/_next/static/chunks/app/page-4d581f7bdccaf316.js";
  const res = await fetch(url);
  const code = await res.text();

  const productObjectRegex = /\{[^{}]*?(?:title|name|productName)\s*:\s*["']([^"']{4,120})["'][^{}]*?\}/g;
  let match;
  const products: any[] = [];

  while ((match = productObjectRegex.exec(code)) !== null) {
    const block = match[0];
    const rawTitleMatch = block.match(/(?:title|name|productName)\s*:\s*["']([^"']{4,120})["']/);
    if (!rawTitleMatch) continue;
    const title = rawTitleMatch[1].trim();

    if (isFrameworkJunkTitle(title)) continue;

    const subtitleMatch = block.match(/(?:subtitle|tagline|desc|description|shortDesc)\s*:\s*["']([^"']+)["']/);
    const subtitle = subtitleMatch ? subtitleMatch[1] : "";

    const catMatch = block.match(/(?:category|type|group)\s*:\s*["']([^"']+)["']/);
    const category = catMatch ? catMatch[1] : "Catalog Items";

    const imgMatch = block.match(/(?:image|img|photo|src|thumbnail)\s*:\s*["']([^"']+\.(?:png|jpe?g|webp|avif))["']/i);
    const image = imgMatch ? imgMatch[1] : "";

    const priceMatch = block.match(/(?:price|cost|mrp|amount)\s*:\s*["']?([\d,.]+)["']?/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

    if (!products.some(p => p.title.toLowerCase() === title.toLowerCase())) {
      products.push({
        title,
        subtitle,
        category,
        image,
        price
      });
    }
  }

  console.log(`\n=== EXTRACTED ${products.length} PRODUCTS FROM AYURMOR JS BUNDLE ===`);
  for (const p of products) {
    console.log(`- Title: ${p.title}`);
    console.log(`  Category: ${p.category}`);
    console.log(`  Subtitle: ${p.subtitle}`);
    console.log(`  Image: https://ayurmor.com${p.image}`);
    console.log(`  Price: ₹ ${p.price}\n`);
  }
}

testDecompiler().catch(console.error);
