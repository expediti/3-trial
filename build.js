const fs = require("fs");
const data = JSON.parse(fs.readFileSync("videos.json","utf8"));
const template = fs.readFileSync("watch-template.html","utf8");

if (!fs.existsSync("watch")) fs.mkdirSync("watch");

let urls = [];

data.forEach(v=>{
  const html = template
    .replace(/{{TITLE}}/g, v.title)
    .replace(/{{DESCRIPTION}}/g, v.description)
    .replace(/{{THUMB}}/g, v.thumbnailUrl)
    .replace(/{{VIDEO}}/g, v.embedUrl)
    .replace(/{{TAGS}}/g, v.tags.join(", "));

  const filename = `watch/${v.id}.html`;
  fs.writeFileSync(filename, html);

  urls.push(`https://xshiver.site/${filename}`);
});

// Delete removed pages
fs.readdirSync("watch").forEach(f=>{
  if(!data.find(v=>`${v.id}.html`===f)){
    fs.unlinkSync("watch/"+f);
  }
});

// Build sitemap
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
urls.forEach(u=>{
  sitemap+=`<url><loc>${u}</loc></url>\n`;
});
sitemap += "</urlset>";

fs.writeFileSync("sitemap.xml", sitemap);

console.log("Pages + Sitemap built successfully");
