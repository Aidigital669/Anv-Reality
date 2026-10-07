import * as dotenv from "dotenv";
dotenv.config();

import { runScrapyFramework } from "./src/lib/scrapy-engine";

async function testFullCrawl() {
  const url = "https://anvreealty.com";
  console.log("Starting Full Deep Crawl on:", url);

  const result = await runScrapyFramework(url, 25);
  console.log("\n=== LOGS ===");
  console.log(result.logs.join("\n"));

  console.log("\n=== FULL CRAWL RESULTS ===");
  console.log("Success:", result.success);
  console.log("Company Name:", result.company.name);
  console.log("Company Tagline:", result.company.tagline);
  console.log("Company Email:", result.company.email);
  console.log("Company Phone:", result.company.phone);
  console.log("Company Address:", result.company.address);
  console.log("Company Logo:", result.company.logo);
  console.log("Total Pages Crawled:", result.stats.totalPagesCrawled);
  console.log("Total Products/Properties Scraped:", result.products.length);

  for (let i = 0; i < Math.min(result.products.length, 15); i++) {
    const p = result.products[i];
    console.log(`\n#${i + 1}: ${p.title}`);
    console.log(`   Price: ₹ ${p.price.toLocaleString("en-IN")}`);
    console.log(`   Category: ${p.category}`);
    console.log(`   Primary Image: ${p.primaryImage}`);
    console.log(`   Images Count: ${p.images.length}`);
    console.log(`   Source URL: ${p.sourceUrl}`);
  }
}

testFullCrawl().catch(console.error);
