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
  parent.append(card);
}

window.onload = setup;
