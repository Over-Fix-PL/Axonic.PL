const tabSearch = document.getElementById('tab-search');
const tabList = document.getElementById('tab-list');
const searchSection = document.getElementById('search-section');
const listSection = document.getElementById('list-section');

tabSearch.onclick = () => {
  tabSearch.classList.add('active');
  tabList.classList.remove('active');
  searchSection.style.display = "";
  listSection.style.display = "none";
};
tabList.onclick = () => {
  tabSearch.classList.remove('active');
  tabList.classList.add('active');
  searchSection.style.display = "none";
  listSection.style.display = "";
};

let games = {};
async function loadGames() {
  let baseGames = {};
  try {
    const res = await fetch('games/index.json');
    const ids = await res.json();
    for (const id of ids) {
      let gameRes = await fetch(`games/${id}.json`);
      baseGames[id] = await gameRes.json();
    }
  } catch (e) { }
  games = {...baseGames};
  showGameList();
}
function showGameList() {
  const listDiv = document.getElementById('game-list');
  if (!Object.keys(games).length) {
    listDiv.innerHTML = '<div style="color:#7b38f7;font-weight:700; text-align:center; margin-top:40px;">Brak gier w bazie!</div>';
    return;
  }
  listDiv.innerHTML = '<h2 style="margin-bottom:18px; color:#00bfff;">Lista gier</h2>';
  Object.values(games).forEach(game => {
    listDiv.innerHTML += `
      <div class="game-card-list" data-id="${game.id}">
        <span>
        <b>${game.title}</b> <span style="color:#00bfff;font-size:0.97em;">(${game.id})</span>
        </span>
        <button onclick="showGameById('${game.id}')">Zobacz</button>
      </div>
    `;
  });
}
window.showGameById = function(id) {
  tabSearch.click();
  const details = document.getElementById('game-details');
  const game = games[id];
  if (!game) {
    details.innerHTML = `
      <div class="not-found-msg">Nie znaleziono gry o podanym ID.</div>
      <a href="https://discord.gg/vkFaXxKHJB" target="_blank" class="download-link" style="background:#232341;margin-top:10px;">Wbij na Discorda i poproś o dodanie gry!</a>
    `;
    details.classList.add('active');
    details.style.display = "block";
    return;
  }
  details.innerHTML = `
    ${game.image ? `<img src="${game.image}" alt="Obraz gry">` : ""}
    <h3 style="color:#00bfff;">${game.title}</h3>
    <p>${game.desc || ""}</p>
    ${game.link ? `<a href="${game.link}" target="_blank" class="download-link">POBIERZ</a>` : ""}
  `;
  details.classList.add('active');
  details.style.display = "block";
};
document.getElementById('find-btn').onclick = () => {
  const id = document.getElementById('game-search').value.trim();
  showGameById(id);
};
window.onload = loadGames;
