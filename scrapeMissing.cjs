const fs = require('fs');

async function scrapeMissing() {
  const missing = ['london', 'lisbon', 'santorini', 'venice', 'reykjavik', 'berlin', 'hong-kong', 'taipei', 'chiang-mai', 'siem-reap', 'jaipur', 'maldives', 'rio-de-janeiro', 'cusco', 'buenos-aires', 'mexico-city', 'banff', 'auckland', 'cairo', 'petra'];
  
  const results = {};
  for (const place of missing) {
    console.log('Fetching', place);
    try {
      const res = await fetch('https://unsplash.com/napi/search/photos?query=' + encodeURIComponent(place) + '&per_page=20');
      const data = await res.json();
      
      const ids = [];
      for (const item of (data.results || [])) {
        if (item.premium || item.is_premium || (item.slug && item.slug.includes('premium'))) continue;
        const url = item.urls.raw.split('?')[0];
        ids.push(url);
        if (ids.length >= 10) break;
      }
      results[place] = ids;
      
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.error('Failed', place, e);
    }
  }
  
  fs.writeFileSync('missing_urls.json', JSON.stringify(results, null, 2));
  console.log('Done');
}

scrapeMissing();
