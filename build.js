const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync("videos.json","utf8"));
const template = fs.readFileSync("watch-template.html","utf8");

const outDir = "watch";

// Ensure watch folder exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Clean old pages
for (const f of fs.readdirSync(outDir)) {
  fs.unlinkSync(path.join(outDir, f));
}

let urls = [];

data.forEach(v=>{
  const html = template
    .replace(/{{TITLE}}/g, v.title)
    .replace(/{{DESCRIPTION}}/g, v.description)
    .replace(/{{THUMB}}/g, v.thumbnailUrl)
    .replace(/{{VIDEO}}/g, v.embedUrl)
    .replace(/{{TAGS}}/g, (v.tags || []).join(", "));

  const file = path.join(outDir, `${v.id}.html`);
  fs.writeFileSync(file, html);

  urls.push(`https://expediti.github.io/xshiver3-trial/watch/${v.id}.html`);
});

// Build sitemap
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
urls.forEach(u=>{
  sitemap+=`<url><loc>${u}</loc></url>\n`;
});
sitemap += "</urlset>";

fs.writeFileSync("sitemap.xml", sitemap);

console.log("All pages and sitemap built successfully.");
