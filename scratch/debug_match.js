const fs = require('fs');

async function debug() {
  const res = await fetch('http://localhost:3000/api/properties');
  const data = await res.json();
  const initialProperties = data.properties || data;

  console.log('Total properties fetched:', initialProperties.length);
  initialProperties.forEach(p => {
    if (p.name.toLowerCase().includes('hospital') || p.name.toLowerCase().includes('medical')) {
      console.log('HOSPITAL PROP IN DB:', {
        id: p.id,
        name: p.name,
        price: p.price,
        priceRaw: p.priceRaw,
        locality: p.locality,
        location: p.location,
        bhk: p.bhk
      });
    }
  });
}

debug().catch(console.error);
