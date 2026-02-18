const SHOW_LIST_URL = "https://api.tvmaze.com/shows";
const EPISODES_LIST_URL_TEMPLATE = "https://api.tvmaze.com/shows/{id}/episodes";
const ID_TOKEN = "{id}";

const HTTP_PROTOCOL_PREFIX = "http://";
const HTTPS_PROTOCOL_PREFIX = "https://";

const DATA_LOADING_MESSAGE = "Data is fetching. Please wait a moment.";
const DATA_LOADING_ERROR_MESSAGE = "Connection is lost. Please try again later.";

const CACHE = {
  catalogue: [],
  shows: {},
  current: "",

  addCurrentShow(episodes) {
    this.shows[this.current] = episodes;
    return episodes;
  },

  getCurrentShow() {
    return this.shows[this.current];
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
  setupCataloguePage();
}

function setupCataloguePage() {
  showDataLoadingMessage();

  if (CACHE.catalogue.length === 0) {
    fetch(SHOW_LIST_URL)
      .then((response) => response.json())
      .then((data) => {
        CACHE.catalogue = data.sort(showComparatorByName);
        renderCataloguePage(CACHE.catalogue);
      })
      .catch(showDataLoadingErrorMessage);
  } else {
    renderCataloguePage(CACHE.catalogue);
  }
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
      CACHE.catalogue = data.sort(showComparatorByName);
      renderHeaderSelect();
      document.getElementById("show-select").dispatchEvent(new Event("input"));
    })
    .catch(showDataLoadingErrorMessage);
}

function setupShow() {
  showDataLoadingMessage();

  fetch(CACHE.getCurrentShowURL())
    .then((response) => response.json())
    .then((episodes) => {
      render(CACHE.addCurrentShow(episodes));
    })
    .catch(showDataLoadingErrorMessage);
}
//endregion


//region event listeners
function onInputShowSelect(event) {
  CACHE.updateCurrent(event.target.value);
  if (CACHE.getCurrentShow()) {
    render(CACHE.getCurrentShow());
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
  const filteredEpisodes = CACHE.getCurrentShow().filter(
    (episode) =>
      (episode.name || "").toLowerCase().includes(searchTerm) ||
      (episode.summary || "").toLowerCase().includes(searchTerm) ||
      (getEpisodeCode(episode) || "").toLowerCase().includes(searchTerm),
  );

  render(filteredEpisodes);
}
//endregion


//region render
function renderCataloguePage(list) {
  console.log("render catalogue page: ", list)
  renderHeaderSelectLabel(list);
  renderHeaderSelect(list);
  renderShowCards(list);
}

function renderHeaderSelectLabel(list) {
  const selectLabel = document.getElementById("header-select-label");

  selectLabel.textContent = `Found ${list.length} show${list.length === 1 ? "" : "s"}:`;
}

function renderHeaderSelect(list) {
  const select = document.getElementById("header-select");
  
  select.options.length = 0;
  
  list.forEach(show => select.add(new Option(show.name || "", show.id || "")));
}

function renderShowCards(list) {
  console.log("render show cards");
  clearRootElement();
  list.forEach(renderShowCard);
}

function renderShowCard(show) {
  const card = document.getElementById("show-card-template").content.cloneNode(true);
  card.querySelector(".show-card").id = show.id || "";

  renderShowCardTitle(show, card);
  renderShowCardImage(show, card);
  renderShowCardSummary(show, card);
  renderShowCardDetails(show, card);

  document.getElementById("root").appendChild(card);
}

function renderShowCardTitle(show, card) {
  card.querySelector(".show-card-header h1").textContent = `${show.name || ""}`;
}

function renderShowCardImage(show, card) {
  const image = card.querySelector(".show-card-image img");

  image.src = show.image.medium || "";
  image.alt = `${show.name || ""} cover image`;
}

function renderShowCardSummary(show, card) {
  card.querySelector(".show-card-summary").innerHTML = show.summary || "";
}

function renderShowCardDetails(show, card) {
  card.querySelector(".show-card-details-rating p").innerHTML =
    `<b>Rating: </b>${show.rating.average || ""}`;
  card.querySelector(".show-card-details-genres p").innerHTML =
    `<b>Genres:  </b>${show.genres.join(" | ") || ""}`;
  card.querySelector(".show-card-details-status p").innerHTML =
    `<b>Status:  </b>${show.status || ""}`;
  card.querySelector(".show-card-details-runtime p").innerHTML =
    `<b>Runtime:  </b>${show.runtime || ""}`;
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
    selectElement.add(new Option(`${code} – ${episode.name || ""}`, code));
  });
}

function renderSearchLabel(episodeList) {
  const label = document.getElementById("search-label");
  label.textContent = `Displaying ${episodeList.length}/${CACHE.getCurrentShow().length} 
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
  card.querySelector(".episode-card-title h3").textContent = `${episode.name || ""} - ${code}`;
}

function renderCardImage(card, episode) {
  const image = card.querySelector(".episode-card-image img");
  image.src = updateProtocol(episode.image.medium || "");
  image.alt = `${episode.name || ""} image`;
}

function renderCardSummary(card, episode) {
  card.querySelector(".summary-text").textContent = removeTags(episode.summary || "");
}

function renderCardLink(card, episode) {
  card.querySelector(".summary-link a").href = updateProtocol(episode.url || "");
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
  return `S${String(episode.season || "").padStart(2, "0")}E${String(episode.number || "").padStart(2, "0")}`;
}

function getShowCode(show) {
  return `show-${String(show.id || "").padStart(4, "0")}`;
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

function clearRootElement() {
  console.log("clear root element");
  document.getElementById("root").innerHTML = "";
}

function clearHeaderInput() {
  document.getElementById("header-input").value = "";
}
//endregion

window.onload = setup;