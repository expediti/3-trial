const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync("videos.json","utf8"));
const template = fs.readFileSync("watch-template.html","utf8");

const outDir = "watch";

// Create watch folder if missing
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Remove old pages
for (const f of fs.readdirSync(outDir)) {
  fs.unlinkSync(path.join(outDir, f));
}

let urls = [];

data.forEach(v => {

  // Build suggestion cards
  let suggestHTML = "";
  (v.suggestions || []).slice(0,8).forEach(id => {
    const s = data.find(x => x.id === id);
    if (!s) return;

    suggestHTML += `
      <div class="suggest-card" onclick="location.href='/watch/${s.id}.html'">
        <img src="${s.thumbnailUrl}" class="suggest-thumb">
        <div class="suggest-title-small">${s.title}</div>
      </div>
    `;
  });

  // Build final page
  const html = template
    .replace(/{{TITLE}}/g, v.title)
    .replace(/{{DESCRIPTION}}/g, v.description)
    .replace(/{{THUMB}}/g, v.thumbnailUrl)
    .replace(/{{VIDEO}}/g, v.embedUrl)
    .replace(/{{TAGS}}/g, (v.tags || []).join(", "))
    .replace(/{{SUGGESTIONS}}/g, suggestHTML);

  const file = path.join(outDir, `${v.id}.html`);
  fs.writeFileSync(file, html);

  urls.push(`https://expediti.github.io/xshiver3-trial/watch/${v.id}.html`);
});

// Generate sitemap
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
urls.forEach(u => {
  sitemap += `<url><loc>${u}</loc></url>\n`;
});
sitemap += "</urlset>";

fs.writeFileSync("sitemap.xml", sitemap);

console.log("All pages, suggestions, and sitemap generated successfully.");
