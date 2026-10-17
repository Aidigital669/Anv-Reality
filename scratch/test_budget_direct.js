// Test budget parser and scoring directly
function toINR(val, unit, lower) {
  const num = parseFloat(val);
  if (isNaN(num)) return 0;
  const u = (unit || '').toLowerCase();
  if (u.startsWith('cr')) return Math.round(num * 10000000);
  if (u.startsWith('l') || u.startsWith('lac')) return Math.round(num * 100000);
  if (u.startsWith('k')) return Math.round(num * 1000);
  if (num <= 100 && /\b(?:cr|crore|crores)\b/i.test(lower)) return Math.round(num * 10000000);
  if (num <= 999 && /\b(?:lakh|lakhs|lac|lacs)\b/i.test(lower)) return Math.round(num * 100000);
  return Math.round(num);
}

function parseBudgetAmounts(text) {
  if (!text) return { minBudget: null, maxBudget: null };
  const lower = text.toLowerCase();
  const maxMatch = lower.match(/(?:under|below|less\s*than|up\s*to|upto|within|max(?:imum)?|<)\s*(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|lakh|lakhs|lac|lacs|l)?\b/i);
  if (maxMatch) {
    const maxBudget = toINR(maxMatch[1], maxMatch[2], lower);
    return { minBudget: null, maxBudget };
  }
  return { minBudget: null, maxBudget: null };
}

const budget = parseBudgetAmounts('i need hospital property under 2 Cr');
console.log('Parsed budget:', budget);

const p23 = { name: 'Prelease Commercial Medical/Hospital Premise for Sale in Undri, Pune', price: '₹6.00 Cr', priceRaw: 60000000 };
const p20 = { name: 'Commercial Medical/Hospital Premise for Sale in Undri, Pune', price: '₹6.00 Cr', priceRaw: 60000000 };
const p14 = { name: 'Commercial Medical/Hospital Premise for Sale in Undri, Pune', price: '₹1.85 Cr', priceRaw: 18500000 };

console.log('P23 price > maxBudget * 1.25?', p23.priceRaw > budget.maxBudget * 1.25);
console.log('P14 price > maxBudget * 1.25?', p14.priceRaw > budget.maxBudget * 1.25);
