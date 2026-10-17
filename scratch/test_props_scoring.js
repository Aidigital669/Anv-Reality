async function testProps() {
  const { parseQueryCriteria, scorePropertyMatch, getPropertyRawPrice } = require('./src/lib/property-matching.ts');
  const res = await fetch('http://localhost:3000/api/properties');
  const data = await res.json();
  const props = data.properties || data;
  const query = 'i need hospital property under 2 Cr';
  const crit = parseQueryCriteria(query);
  console.log('CRITERIA:', crit);

  props.forEach(p => {
    const rawPrice = getPropertyRawPrice(p);
    const score = scorePropertyMatch(p, crit);
    console.log(`[${p.id}] ${p.name} | rawPrice: ${rawPrice} (${p.price}) | score: ${score}`);
  });
}
testProps().catch(console.error);
