const SHOW_LIST_URL = "https://api.tvmaze.com/shows";
const EPISODES_LIST_URL_TEMPLATE = "https://api.tvmaze.com/shows/{id}/episodes";
const ID_TOKEN = "{id}";

const HTTP_PROTOCOL_PREFIX = "http://";
const HTTPS_PROTOCOL_PREFIX = "https://";

const DATA_LOADING_MESSAGE = "Data is fetching. Please wait a moment.";
const DATA_LOADING_ERROR_MESSAGE = "Connection is lost. Please try again later.";

const PAGE_TYPE_CATALOGUE = "catalogue";
const PAGE_TYPE_SHOW = "show";

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

let current_page_type = PAGE_TYPE_CATALOGUE;

//region prepare
function setup() {
  setupHeaderButton();
  setupHeaderInput();
  setupHeaderSelect();
  setupCataloguePage();
}

function setupHeaderButton() {
  document.getElementById("header-button-back-img").addEventListener("click", onClickHeaderButton);
}

function setupHeaderInput() {
  document.getElementById("header-input").addEventListener("input", onInputHeaderInput);
}

function setupHeaderSelect() {
  document.getElementById("header-select").addEventListener("input", onInputHeaderSelect);
}

function setupCataloguePage() {
  current_page_type = PAGE_TYPE_CATALOGUE;
  showDataLoadingMessage();
  clearHeaderInput();

  if (CACHE.catalogue.length) {
    renderCataloguePage(CACHE.catalogue);
  } else {
    fetch(SHOW_LIST_URL)
      .then((response) => response.json())
      .then((data) => {
        CACHE.catalogue = data.sort(showComparatorByName);
        renderCataloguePage(CACHE.catalogue);
      })
      .catch(showDataLoadingErrorMessage);
  }
}

function setupShowPage() {
  current_page_type = PAGE_TYPE_SHOW;
  showDataLoadingMessage();
  clearHeaderInput();

  if (CACHE.getCurrentShow()) {
    renderShowPage(CACHE.getCurrentShow());
  } else {
    fetch(CACHE.getCurrentShowURL())
      .then((response) => response.json())
      .then((data) => {
        CACHE.addCurrentShow(data);
        renderShowPage(data);
      })
      .catch(showDataLoadingErrorMessage);
  }
}
//endregion


//region render
function renderCataloguePage(list) {
  renderHeaderButton();
  renderHeaderSelectLabel(list);
  renderHeaderSelect(list);
  renderShowCards(list);
}

function renderShowCards(list) {
  clearRootElement();
  list.forEach(renderShowCard);
}

function renderShowCard(show) {
  const cardFragment = document.getElementById("show-card-template").content.cloneNode(true);
  const cardElement = cardFragment.querySelector(".show-card")
  
  cardElement.id = show.id || "";
  cardElement.addEventListener("click", onClickShowCard);

  renderShowCardTitle(show, cardFragment);
  renderShowCardImage(show, cardFragment);
  renderShowCardSummary(show, cardFragment);
  renderShowCardDetails(show, cardFragment);

  document.getElementById("root").appendChild(cardFragment);
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


function renderShowPage(list) {
  renderHeaderButton();
  renderHeaderSelectLabel(list);
  renderHeaderSelect(list);
  renderEpisodeCards(list);
}

function renderEpisodeCards(list) {
  clearRootElement();
  list.forEach(renderEpisodeCard);
}

function renderEpisodeCard(episode) {
  const card = document.getElementById("episode-card-template").content.cloneNode(true);

  card.querySelector(".episode-card").id = getEpisodeCode(episode);

  renderEpisodeCardTitle(card, episode);
  renderEpisodeCardImage(card, episode);
  renderEpisodeCardSummary(card, episode);
  renderEpisodeCardLink(card, episode);

  document.getElementById("root").append(card);
}

function renderEpisodeCardTitle(card, episode) {
  const code = getEpisodeCode(episode);
  card.querySelector(".episode-card-title h3").textContent = `${episode.name || ""} - ${code}`;
}

function renderEpisodeCardImage(card, episode) {
  const image = card.querySelector(".episode-card-image img");
  image.src = updateProtocol(episode.image.medium || "");
  image.alt = `${episode.name || ""} image`;
}

function renderEpisodeCardSummary(card, episode) {
  card.querySelector(".summary-text").innerHTML = episode.summary || "";
}

function renderEpisodeCardLink(card, episode) {
  card.querySelector(".summary-link a").href = updateProtocol(episode.url || "");
}


function renderHeaderButton() {
  headerButton = document.getElementById("header-button-back-img");
  switch (current_page_type) {
    case PAGE_TYPE_CATALOGUE:
      headerButton.style.visibility = "hidden";
      break;
    case PAGE_TYPE_SHOW:
      headerButton.style.visibility = "visible";
      break;
  }
}

function renderHeaderSelectLabel(list) {
  const selectLabel = document.getElementById("header-select-label");
  let item;

  switch (current_page_type) {
    case PAGE_TYPE_CATALOGUE:
      item = "show";
      break;
    case PAGE_TYPE_SHOW:
      item = "episode";
      break;
  }

  selectLabel.textContent = `Found ${list.length} ${item}${list.length === 1 ? "" : "s"}:`;
}

function renderHeaderSelect(list) {
  const select = document.getElementById("header-select");

  select.options.length = 0;

  list.forEach((item) => {
    let value;

    switch (current_page_type) {
      case PAGE_TYPE_CATALOGUE:
        value = item.id;
        break;
      case PAGE_TYPE_SHOW:
        value = getEpisodeCode(item);
        break;
    }

    select.add(new Option(item.name || "", value || ""));
  });
}
//endregion


//region event listeners
function onClickHeaderButton() {
  setupCataloguePage();
}

function onInputHeaderSelect(event) {
  document.getElementById(event.target.value).scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function onInputHeaderInput(event) {
  const searchTerm = event.target.value.toLowerCase();

  switch (current_page_type) {
    case PAGE_TYPE_CATALOGUE:
      renderCataloguePage(filterItemsByNameSummaryGenreCode(CACHE.catalogue, searchTerm));
      break;
    case PAGE_TYPE_SHOW:
      renderShowPage(filterItemsByNameSummaryGenreCode(CACHE.getCurrentShow(), searchTerm));
      break;
  }
}

function onClickShowCard(event) {
  CACHE.updateCurrent(event.target.id);
  setupShowPage();
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

function updateProtocol(url) {
  if (url.startsWith(HTTP_PROTOCOL_PREFIX)) {
    return url.replace(HTTP_PROTOCOL_PREFIX, HTTPS_PROTOCOL_PREFIX);
  }
  return url;
}

function clearRootElement() {
  document.getElementById("root").innerHTML = "";
}

function clearHeaderInput() {
  document.getElementById("header-input").value = "";
}

function showComparatorByName(show1, show2) {
  return show1.name.toLowerCase().localeCompare(show2.name.toLowerCase());
}

function filterItemsByNameSummaryGenreCode(list, searchTerm) {
  return list.filter(
    (item) =>
      (item.name || "").toLowerCase().includes(searchTerm) ||
      (item.summary || "").toLowerCase().includes(searchTerm) ||
      (item.genres.join() || "").toLowerCase().includes(searchTerm) ||
      (getEpisodeCode(item) || "").toLowerCase().includes(searchTerm),
  );
}
//endregion


window.onload = setup;
