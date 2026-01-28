const id = new URLSearchParams(location.search).get("id");

fetch("videos.json")
  .then(res => res.json())
  .then(data => {
    const video = data.find(v => v.id === id);
    player.src = video.embedUrl;
    title.innerText = video.title;
    description.innerText = video.description;

    renderRelated(video, data);
  });

function renderRelated(current, all) {
  const related = all.filter(v =>
    v.id !== current.id &&
    v.tags.some(t => current.tags.includes(t))
  ).slice(0,5);

  related.forEach(v => {
    const d = document.createElement("div");
    d.className = "related-item";
    d.innerHTML = `<img src="${v.thumbnailUrl}"><small>${v.title}</small>`;
    d.onclick = () => location = `watch.html?id=${v.id}`;
    relatedList.appendChild(d);
  });
}
