const SHOW_LIST_URL = "https://api.tvmaze.com/shows";
const EPISODES_LIST_URL_TEMPLATE = "https://api.tvmaze.com/shows/{id}/episodes";
const ID_TOKEN = "{id}";

const HTTP_PROTOCOL_PREFIX = "http://";
const HTTPS_PROTOCOL_PREFIX = "https://";

const DATA_LOADING_MESSAGE = "Data is fetching. Please wait a moment.";
const DATA_LOADING_ERROR_MESSAGE = "Connection is lost. Please try again later.";

const CACHE = {
  shows: [],
  episodes: {},
  current: "",

  addCurrentEpisodes(episodes) {
    this.episodes[this.current] = episodes;
    return episodes;
  },

  getCurrentEpisodes() {
    return this.episodes[this.current];
  },

  updateCurrent(current) {
    this.current = current;
    return current;
  },

  getCurrentShowURL() {
    return EPISODES_LIST_URL_TEMPLATE.replace(ID_TOKEN, this.current);
  },
};


//region prepare
function setup() {
  setupShowSelect();
  setupEpisodeSelect();
  setupSearchInput();
  setupShowList();
}

function setupShowSelect() {
  document.getElementById("show-select").addEventListener("input", onInputShowSelect);
}

function setupEpisodeSelect() {
  document.getElementById("episode-select").addEventListener("input", onInputEpisodeSelect);
}

function setupSearchInput() {
  document.getElementById("search-input").addEventListener("input", onSearchInput);
}

function setupShowList() {
  showDataLoadingMessage();

  fetch(SHOW_LIST_URL)
    .then((res) => res.json())
    .then((data) => {
      CACHE.shows = data.sort(showComparatorByName);
      renderShowSelect();
      document.getElementById("show-select").dispatchEvent(new Event("input"));
    })
    .catch(showDataLoadingErrorMessage);
}

function setupShow() {
  showDataLoadingMessage();

  fetch(CACHE.getCurrentShowURL())
    .then((response) => response.json())
    .then((episodes) => {
      render(CACHE.addCurrentEpisodes(episodes));
    })
    .catch(showDataLoadingErrorMessage);
}
//endregion


//region event listeners
function onInputShowSelect(event) {
  CACHE.updateCurrent(event.target.value);
  if (CACHE.getCurrentEpisodes()) {
    render(CACHE.getCurrentEpisodes());
  } else {
    setupShow();
  }
}

function onInputEpisodeSelect(event) {
  document.getElementById(event.target.value).scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function onSearchInput(event) {
  const searchTerm = event.target.value.toLowerCase();
  const filteredEpisodes = CACHE.getCurrentEpisodes().filter(
    (episode) =>
      (episode.name || "").toLowerCase().includes(searchTerm) ||
      (episode.summary || "").toLowerCase().includes(searchTerm) ||
      (getEpisodeCode(episode) || "").toLowerCase().includes(searchTerm),
  );

  render(filteredEpisodes);
}
//endregion


//region render
function renderShowSelect() {
  const select = document.getElementById("show-select");
  
  select.options.length = 0;

  CACHE.shows.forEach(show => select.add(new Option(show.name, show.id)));
}

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
  label.textContent = `Displaying ${episodeList.length}/${CACHE.getCurrentEpisodes().length} 
    episode${episodeList.length > 2 ? "s" : ""}`;
}

function renderEpisodeCards(episodeList) {
  document.getElementById("root").innerHTML = "";
  episodeList.forEach(renderEpisodeCard);
}

function renderEpisodeCard(episode) {
  const card = document.getElementById("episode-card-template").content.cloneNode(true);

  card.querySelector(".episode-card").id = getEpisodeCode(episode);

  renderCardTitle(card, episode);
  renderCardImage(card, episode);
  renderCardSummary(card, episode);
  renderCardLink(card, episode);

  document.getElementById("root").append(card);
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
  const rootElement = document.getElementById("root");
  const messageElement = document.createElement("h1");
  
  rootElement.innerHTML = "";
  messageElement.textContent = DATA_LOADING_MESSAGE;
  rootElement.append(messageElement);
}

function showDataLoadingErrorMessage() {
  const rootElement = document.getElementById("root");
  const messageElement = document.createElement("h1");

  rootElement.innerHTML = "";
  messageElement.textContent = DATA_LOADING_ERROR_MESSAGE;
  rootElement.append(messageElement);
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

function showComparatorByName(show1, show2) {
  return show1.name.toLowerCase().localeCompare(show2.name.toLowerCase());
}
//endregion

window.onload = setup;