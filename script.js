const HTTP_PROTOCOL_PREFIX = "http://";
const HTTPS_PROTOCOL_PREFIX = "https://";

let allEpisodes = [];

function setup() {
  allEpisodes = getAllEpisodes();
  setupSearch();
  render(allEpisodes); // first render all episodes
}

function setupSearch() {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", (event) => { // input update immediately after each keystroke
    const searchTerm = event.target.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      return (
        episode.name.toLowerCase().includes(searchTerm) ||
        removeTags(episode.summary).toLowerCase().includes(searchTerm)
      );
    });

    render(filteredEpisodes);
  });
}

function render(episodeList) {
  renderSearchLabel(episodeList);
  renderEpisodeCards(episodeList);
}

function renderSearchLabel(episodeList) {
  const label = document.getElementById("search-label");
  label.textContent = `Displaying ${episodeList.length}/${allEpisodes.length} episode(s)`;
}

function renderEpisodeCards(episodeList) {
  const root = document.getElementById("root");
  const template = document.getElementById("episode-card-template");

  root.innerHTML = "";

  episodeList.forEach((episode) => {
    const card = template.content.cloneNode(true);

    const code = getEpisodeCode(episode);

    card.querySelector(".episode-card-title h3").textContent =
      `${episode.name} - ${code}`;

    const image = card.querySelector(".episode-card-image img");
    image.src = fixProtocol(episode.image.medium);
    image.alt = `${episode.name} image`;

    card.querySelector(".summary-text").textContent =
      removeTags(episode.summary);

    card.querySelector(".summary-link a").href =
      fixProtocol(episode.url);

    root.append(card);
  });
}

function getEpisodeCode(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number
  ).padStart(2, "0")}`;
}

function removeTags(text) {
  return text.replace(/<[^>]*>/g, "");
}

function fixProtocol(url) {
  if (url.startsWith(HTTP_PROTOCOL_PREFIX)) {
    return url.replace(HTTP_PROTOCOL_PREFIX, HTTPS_PROTOCOL_PREFIX);
  }
  return url;
}

window.onload = setup;
