const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync("videos.json","utf8"));
const template = fs.readFileSync("watch-template.html","utf8");

const outDir = "watch";

// Ensure folder exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Clean old pages
for (const f of fs.readdirSync(outDir)) {
  fs.unlinkSync(path.join(outDir, f));
}

// Utility: get related videos
function getAutoRelated(video, limit = 8) {
  const words = video.title.toLowerCase().split(/\s+/);

  return data
    .filter(v => v.id !== video.id)
    .map(v => {
      let score = 0;

      // same tag boost
      (v.tags || []).forEach(t => {
        if ((video.tags || []).includes(t)) score += 5;
      });

      // title word matching
      words.forEach(w => {
        if (v.title.toLowerCase().includes(w)) score += 1;
      });

      return { v, score };
    })
    .sort((a,b)=>b.score-a.score)
    .slice(0,limit)
    .map(x=>x.v);
}

let urls = [];

data.forEach(video => {

  let suggestions = [];

  // Use manual suggestions if available
  if (video.suggestions && video.suggestions.length) {
    suggestions = video.suggestions
      .map(id => data.find(v => v.id === id))
      .filter(Boolean);
  }

  // Auto-related fallback
  if (!suggestions.length) {
    suggestions = getAutoRelated(video);
  }

  // Build suggestion cards
  let suggestHTML = "";
  suggestions.forEach(s => {
    suggestHTML += `
      <div class="suggest-card" onclick="location.href='/watch/${s.id}.html'">
        <img src="${s.thumbnailUrl}" class="suggest-thumb">
        <div class="suggest-title-small">${s.title}</div>
      </div>
    `;
  });

  // Build final page
  const html = template
    .replace(/{{TITLE}}/g, video.title)
    .replace(/{{DESCRIPTION}}/g, video.description)
    .replace(/{{THUMB}}/g, video.thumbnailUrl)
    .replace(/{{VIDEO}}/g, video.embedUrl)
    .replace(/{{TAGS}}/g, (video.tags || []).join(", "))
    .replace(/{{SUGGESTIONS}}/g, suggestHTML);

  fs.writeFileSync(path.join(outDir, `${video.id}.html`), html);

  urls.push(`https://expediti.github.io/xshiver3-trial/watch/${video.id}.html`);
});

// Build sitemap
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
urls.forEach(u => sitemap += `<url><loc>${u}</loc></url>\n`);
sitemap += "</urlset>";

fs.writeFileSync("sitemap.xml", sitemap);

console.log("All pages, auto-related videos, and sitemap generated.");
