//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  // const rootElem = document.getElementById("root");
  // rootElem.textContent = `Got ${episodeList.length} episode(s)`;
  const episodeCardTemplate = document.querySelector("#episode-card-template");
  const rootElement = document.querySelector("#root");

  createEpisodeCard(rootElement, episodeCardTemplate, episodeList[0]);
}

function createEpisodeCard(parent, template, data) {
  const card = template.content.cloneNode(true);
  const episodeCode = createEpisodeCode(data);
  
  createEpisodeCardTitle(card, data);
  createEpisodeCardImage(card, data);
  createEpisodeCardSummary(card, data);
  
  parent.append(card);
}
function createEpisodeCode(data) {
  return `S${String(data.season).padStart(2, "0")}E${String(data.number).padStart(2, "0")}`;
}

function createEpisodeCardTitle(card, data) {
  const titleElement = card.querySelector(".episode-card-title h3");
  titleElement.textContent = data.name;
}

function createEpisodeCardImage(card, data) {
  const imageElement = card.querySelector(".episode-card-image img");
  imageElement.src = data.image.medium;
}

function createEpisodeCardSummary(card, data) {
  const summaryElement = card.querySelector(".episode-card-summary p");
  summaryElement.textContent = data.summary;
}

window.onload = setup;
