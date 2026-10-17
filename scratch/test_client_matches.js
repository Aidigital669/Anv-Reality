async function testClientMatches() {
  require('dotenv').config({ path: '.env.local' });
  const { fetchAllProperties } = require('./src/lib/property-data');
  const { getBestMatchingProperties, parseQueryCriteria, scorePropertyMatch } = require('./src/lib/property-matching');

  const initialProperties = await fetchAllProperties();
  const query = 'i need hospital property under 2 Cr';

  console.log('Query:', query);
  const crit = parseQueryCriteria(query);
  console.log('Criteria:', JSON.stringify(crit, null, 2));

  console.log('\n--- SCORING EACH PROPERTY ---');
  initialProperties.forEach(p => {
    const score = scorePropertyMatch(p, crit);
    console.log(`ID: ${p.id} | Name: ${p.name} | Price: ${p.price} | PriceRaw: ${p.priceRaw} | Score: ${score}`);
  });

  const matched = getBestMatchingProperties(initialProperties, query, 4);
  console.log('\n--- MATCHED RESULT ---');
  console.log('Count:', matched.length);
  matched.forEach(p => console.log(`Matched: ${p.id} - ${p.name} - ${p.price}`));
}

testClientMatches().catch(console.error);
