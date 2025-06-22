// --- Loader ---
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('loader').style.display = 'none';
  }, 1100); // minimum 1.1s dla lepszej animacji
});

// --- Zakładki ---
const tabSearch = document.getElementById('tab-search');
const tabList = document.getElementById('tab-list');
const tabAdmin = document.getElementById('tab-admin');
const searchSection = document.getElementById('search-section');
const listSection = document.getElementById('list-section');
const adminSection = document.getElementById('admin-section');

tabSearch.onclick = () => {
  tabSearch.classList.add('active');
  tabList.classList.remove('active');
  tabAdmin.classList.remove('active');
  searchSection.style.display = "";
  listSection.style.display = "none";
  adminSection.style.display = "none";
};
tabList.onclick = () => {
  tabSearch.classList.remove('active');
  tabList.classList.add('active');
  tabAdmin.classList.remove('active');
  searchSection.style.display = "none";
  listSection.style.display = "";
  adminSection.style.display = "none";
};
tabAdmin.onclick = () => {
  tabSearch.classList.remove('active');
  tabList.classList.remove('active');
  tabAdmin.classList.add('active');
  searchSection.style.display = "none";
  listSection.style.display = "none";
  adminSection.style.display = "";
};

// --- Gry: Pobieranie + LocalStorage jako baza (moderator dodaje do LocalStorage) ---
let games = {};
function getGamesFromStorage() {
  let base = {};
  try {
    base = JSON.parse(localStorage.getItem('games') || '{}');
  } catch {}
  return base;
}
function saveGamesToStorage(obj) {
  localStorage.setItem('games', JSON.stringify(obj));
}
async function loadGames() {
  // Pobierz z plików (dla odwiedzających) oraz LocalStorage (dla moderatora)
  let baseGames = {};
  try {
    const res = await fetch('games/index.json');
    const ids = await res.json();
    for (const id of ids) {
      let gameRes = await fetch(`games/${id}.json`);
      baseGames[id] = await gameRes.json();
    }
  } catch (e) { /* brak plików = pusta lista */ }
  // Nadpisz localStorage jeśli są gry dodane przez moderatora
  games = {...baseGames, ...getGamesFromStorage()};
  showGameList();
}
function showGameList() {
  const listDiv = document.getElementById('game-list');
  if (!Object.keys(games).length) {
    listDiv.innerHTML = '<div style="color:#b17cff;font-weight:700; text-align:center; margin-top:40px;">Brak gier w bazie!</div>';
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

// --- Panel moderatora: dodawanie gier do LocalStorage + odświeżanie listy ---
document.getElementById('add-game-btn').onclick = async function() {
  const id = document.getElementById('game-id').value.trim();
  const title = document.getElementById('game-title').value.trim();
  const desc = document.getElementById('game-desc').value.trim();
  const link = document.getElementById('game-link').value.trim();
  const imageFile = document.getElementById('game-image').files[0];
  const statusDiv = document.getElementById('add-game-status');
  statusDiv.textContent = "";

  if (!id || !title) {
    statusDiv.style.color = "#d32f2f";
    statusDiv.textContent = "Uzupełnij wymagane pola";
    return;
  }
  let imageData = "";
  if (imageFile) imageData = await fileToBase64(imageFile);

  const gameObj = { id, title, desc, link, image: imageData };
  let current = getGamesFromStorage();
  current[id] = gameObj;
  saveGamesToStorage(current);

  statusDiv.style.color = "#388e3c";
  statusDiv.textContent = "Gra dodana! Widoczna od razu na liście na tym urządzeniu.";
  clearGameInputs();
  loadGames();
};
function clearGameInputs() {
  document.getElementById('game-id').value = "";
  document.getElementById('game-title').value = "";
  document.getElementById('game-desc').value = "";
  document.getElementById('game-link').value = "";
  document.getElementById('game-image').value = "";
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(file);
  });
}
