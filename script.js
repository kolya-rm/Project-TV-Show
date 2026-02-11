//You can edit ALL of the code here
const HTTP_PROTOCOL_PREFIX = "http://";
const HTTPS_PROTOCOL_PREFIX = "https://";

function setup() {

  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);

}

function makePageForEpisodes(episodeList) {
  // const rootElem = document.getElementById("root");
  // rootElem.textContent = `Got ${episodeList.length} episode(s)`;
  const episodeCardTemplate = document.querySelector("#episode-card-template");
  const rootElement = document.querySelector("#root");
  for (const episodeData of episodeList) {
    createEpisodeCard(rootElement, episodeCardTemplate, episodeData);
  }
}

function createEpisodeCard(parent, template, data) {
  const card = template.content.cloneNode(true);
  const episodeCode = createEpisodeCode(data);

  createEpisodeCardTitle(card, data, episodeCode);
  createEpisodeCardImage(card, data, episodeCode);
  createEpisodeCardSummary(card, data);
  createEpisodeCardSummaryLink(card, data);
  
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
  imageElement.src = updateProtocol(data.image.medium);
  imageElement.alt = `Episode ${data.name} - ${code} image`;
}

function createEpisodeCardSummary(card, data) {
  const summaryElement = card.querySelector(".episode-card-summary p");
  summaryElement.textContent = removeTags(data.summary);
}

function createEpisodeCardSummaryLink(card, data) {
  const linkElement = card.querySelector(".summary-link a");
  linkElement.href = updateProtocol(data.url);
}

function updateProtocol(url) {
  if (url.indexOf(HTTP_PROTOCOL_PREFIX) === 0 && url.indexOf(HTTPS_PROTOCOL_PREFIX) < 0) {
    return url.replace(HTTP_PROTOCOL_PREFIX, HTTPS_PROTOCOL_PREFIX);
  }
  return url;
}

function removeTags(text) {
  return text.replace(/<[^>]*>/g, "");
}

window.onload = setup;