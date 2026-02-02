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

  createEpisodeCardTitle(card, data, episodeCode);
  createEpisodeCardImage(card, data, episodeCode);
  createEpisodeCardSummary(card, data);
  
  parent.append(card);
}

function createEpisodeCode(data) {
  return `S${String(data.season).padStart(2, "0")}E${String(data.number).padStart(2, "0")}`;
}

function createEpisodeCardTitle(card, data, code) {
  const titleElement = card.querySelector(".episode-card-title h3");
  titleElement.textContent = `${data.name} - ${code}`;
}

function createEpisodeCardImage(card, data, code) {
  const imageElement = card.querySelector(".episode-card-image img");
  imageElement.src = data.image.medium;
  imageElement.alt = `Episode ${data.name} - ${code} image`;
}

function createEpisodeCardSummary(card, data) {
  const summaryElement = card.querySelector(".episode-card-summary p");
  summaryElement.textContent = removeTags(data.summary);
}

function removeTags(text) {
  return text.replace(/<[^>]*>/g, "");
}

window.onload = setup;
