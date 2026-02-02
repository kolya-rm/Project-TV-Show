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
  
  createEpisodeCardTitle(card, data);
  createEpisodeCardImage(card, data);
  
  parent.append(card);
}

function createEpisodeCardTitle(card, data) {
  const titleElement = card.querySelector(".episode-card-title h3");
  titleElement.textContent = data.name;
}

function createEpisodeCardImage(card, data) {
  const imageElement = card.querySelector(".episode-card-image img");
  imageElement.src = data.image.medium;
}

window.onload = setup;
