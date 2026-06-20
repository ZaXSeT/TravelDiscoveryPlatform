const fs = require('fs');

const path = 'src/lib/cloudinary/url.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace watermarked plus.unsplash.com links with regular ones
content = content.replace(
  '"https://plus.unsplash.com/premium_photo-1676496046182-356a6a0ed002"',
  '"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"' // nice landscape
);

content = content.replace(
  '"https://plus.unsplash.com/premium_photo-1681488277609-1806135d1126"',
  '"https://images.unsplash.com/photo-1451187580459-43490279c0fa"' // globe-like or generic
);

// To fix the substring matching bug where "singapore/hero" matches "hero" instead of "singapore",
// let's change the loop to sort the keys by length descending so longer matches (e.g. cities) win,
// OR just sort the keys so 'hero' and 'globe' etc. are at the end.
// Actually, fixing the loop logic directly is safer and cleaner than reordering the object literal.

const loopLogicToReplace = `  // Find the first matching keyword
  for (const [key, urls] of Object.entries(idMap)) {
    if (lowerId.includes(key)) {
      baseUrl = urls[hash % urls.length] ?? baseUrl;
      matched = true;
      break;
    }
  }`;

const newLoopLogic = `  // Find the best matching keyword (prioritize longer keys like city names over generic 'hero')
  const keys = Object.keys(idMap).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lowerId.includes(key)) {
      const urls = idMap[key];
      baseUrl = urls[hash % urls.length] ?? baseUrl;
      matched = true;
      break;
    }
  }`;

if (content.includes(loopLogicToReplace)) {
  content = content.replace(loopLogicToReplace, newLoopLogic);
  console.log("Updated loop logic successfully.");
} else {
  console.log("Failed to find loop logic to replace.");
}

fs.writeFileSync(path, content);
console.log("Fixed watermarks and substring matching bug in url.ts");
