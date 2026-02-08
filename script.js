const HTTP_PROTOCOL_PREFIX = "http://";
const HTTPS_PROTOCOL_PREFIX = "https://";

let allEpisodes = [];

//region prepare
function setup() {
  allEpisodes = getAllEpisodes();
  setupEpisodeSelect();
  setupSearchInput();
  render(allEpisodes);
}

function setupEpisodeSelect() {
  document.getElementById("search-input").addEventListener("input", onSearchInput);
}

function setupSearchInput() {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", onSearchInput);
}
//endregion


//region event listeners
function onSearchInput(event) {
  const searchTerm = event.target.value.toLowerCase();

  const filteredEpisodes = allEpisodes.filter(episode =>
      episode.name.toLowerCase().includes(searchTerm) ||
      episode.summary.toLowerCase().includes(searchTerm)
  );

  render(filteredEpisodes);
}
//endregion


//region render
function render(episodeList) {
  renderSearchLabel(episodeList);
  renderEpisodeCards(episodeList);
  renderEpisodeSelect(episodeList);
}

function renderSearchLabel(episodeList) {
  const label = document.getElementById("search-label");
  label.textContent = `Displaying ${episodeList.length}/${allEpisodes.length} episode(s)`;
}

function renderEpisodeCards(episodeList) {
  root.innerHTML = "";
  episodeList.forEach(renderEpisodeCard);
}

function renderEpisodeCard(episode) {
  const card = document.getElementById("episode-card-template").content.cloneNode(true);

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

function renderEpisodeSelect(episodeList) {
  const selectElement = document.getElementById("episode-select");

  selectElement.options.length = 0;

  episodeList.forEach((episode) => {
    const code = getEpisodeCode(episode);
    selectElement.add(new Option(`${code} – ${episode.name}`, code));
  });
}
//endregion
  

//region utils
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
