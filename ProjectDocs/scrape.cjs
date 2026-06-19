fetch('https://unsplash.com/s/photos/mount-fuji')
  .then(r => r.text())
  .then(t => {
    const matches = [...t.matchAll(/"id":"([a-zA-Z0-9\-]+)","slug":".*?","created_at".*?"alt_description":"(.*?)",/g)];
    matches.slice(0, 10).forEach(m => console.log(m[1], m[2]));
  });
