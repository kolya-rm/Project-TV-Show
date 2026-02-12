const EPISODES_LIST_URL = "https://api.tvmaze.com/shows/82/episodes";
const HTTP_PROTOCOL_PREFIX = "http://";
const HTTPS_PROTOCOL_PREFIX = "https://";
const DATA_LOADING_MESSAGE = "Data is fetching. Please wait a moment.";
const DATA_LOADING_ERROR_MESSAGE = "Connection is lost. Please try again later.";
const DATA_PARSING_ERROR_MESSAGE = "Data is corrupted. Please try again.";

let allEpisodes = [];
const root = document.getElementById("root"); // Root container where all episode cards will be rendered




//region prepare
function setup() {

  setupEpisodeSelect();
  setupSearchInput();
  setupEpisodes();
}

function setupEpisodes() {
  showDataLoadingMessage();
  fetch(EPISODES_LIST_URL)
    .then(response => response.json())
    .catch(() => window.alert(DATA_LOADING_ERROR_MESSAGE))
      .then(data => {
        allEpisodes = data;
        render(allEpisodes);
      })
      .catch(() => window.alert(DATA_PARSING_ERROR_MESSAGE));   
}

function setupEpisodeSelect() {
  document.getElementById("episode-select").addEventListener("input", onSelectInput);
}

function setupSearchInput() {
  document.getElementById("search-input").addEventListener("input", onSearchInput);
}
//endregion


//region event listeners
function onSelectInput(event) {
  document.getElementById(event.target.value).scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function onSearchInput(event) {
  const searchTerm = event.target.value.toLowerCase();

  const filteredEpisodes = allEpisodes.filter(
    (episode) =>
      episode.name.toLowerCase().includes(searchTerm) ||
      (episode.summary || "").toLowerCase().includes(searchTerm) || // Use an empty string if summary is null to avoid runtime errors
      getEpisodeCode(episode).toLocaleLowerCase().includes(searchTerm)
  );

  render(filteredEpisodes);
}
//endregion


//region render
function render(episodeList) {
  renderEpisodeSelect(episodeList);
  renderSearchLabel(episodeList);
  renderEpisodeCards(episodeList);
}

function renderEpisodeSelect(episodeList) {
  const selectElement = document.getElementById("episode-select");

  selectElement.options.length = 0;

  episodeList.forEach((episode) => {
    const code = getEpisodeCode(episode);
    selectElement.add(new Option(`${code} – ${episode.name}`, code));
  });
}

function renderSearchLabel(episodeList) {
  const label = document.getElementById("search-label");
  label.textContent = `Displaying ${episodeList.length}/${allEpisodes.length} 
    episode${episodeList.length > 2 ? "s" : ""}`;
}

function renderEpisodeCards(episodeList) {
  root.innerHTML = "";
  episodeList.forEach(renderEpisodeCard);
}

function renderEpisodeCard(episode) {
  const card = document.getElementById("episode-card-template").content.cloneNode(true);

  card.querySelector(".episode-card").id = getEpisodeCode(episode);

  renderCardTitle(card, episode);
  renderCardImage(card, episode);
  renderCardSummary(card, episode);
  renderCardLink(card, episode);
  
  root.append(card);
}

function renderCardTitle(card, episode) {
  const code = getEpisodeCode(episode);
  card.querySelector(".episode-card-title h3").textContent = `${episode.name} - ${code}`;
}

function renderCardImage(card, episode) {
  const image = card.querySelector(".episode-card-image img");
  image.src = updateProtocol(episode.image.medium);
  image.alt = `${episode.name} image`;
}

function renderCardSummary(card, episode) {
  card.querySelector(".summary-text").textContent = removeTags(episode.summary);
}

function renderCardLink(card, episode) {
  card.querySelector(".summary-link a").href = updateProtocol(episode.url);
}
//endregion


//region utils
function showDataLoadingMessage() {
  const messageElement = document.createElement("h1");
  messageElement.textContent = DATA_LOADING_MESSAGE;
  root.append(messageElement);
}

function getEpisodeCode(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
}

function removeTags(text) {
  return text.replace(/<[^>]*>/g, "");
}

function updateProtocol(url) {
  if (url.startsWith(HTTP_PROTOCOL_PREFIX)) {
    return url.replace(HTTP_PROTOCOL_PREFIX, HTTPS_PROTOCOL_PREFIX);
  }
  return url;
}
//endregion


window.onload = setup;
