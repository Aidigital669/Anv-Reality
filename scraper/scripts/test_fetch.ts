async function testFetch() {
  const url = "https://www.anvrealty.com";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Scrapy/2.11.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    console.log("Status:", res.status, res.statusText);
    console.log("Final URL:", res.url);
    const text = await res.text();
    console.log("Length:", text.length);
  } catch (e) {
    console.error("Fetch Error:", e);
  }
}

testFetch();
