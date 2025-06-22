// Loader/animacja można dodać według uznania

// PANEL MODERATORA
const panelToggle = document.getElementById('panel-toggle');
const adminPanel = document.getElementById('admin-panel');
panelToggle.onclick = () => {
  adminPanel.classList.remove('panel-hidden');
  if (!isLoggedIn()) {
    document.getElementById('admin-login').classList.remove('panel-hidden');
    document.getElementById('admin-dashboard').classList.add('panel-hidden');
  } else {
    showDashboard();
  }
};
window.onclick = function(e) {
  if (e.target === adminPanel) adminPanel.classList.add('panel-hidden');
};
document.getElementById('admin-login-btn').onclick = async function() {
  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value;
  const errorDiv = document.getElementById('admin-login-error');
  errorDiv.textContent = "";
  try {
    // Pobierz index loginów
    const loginsRes = await fetch('login/index.json');
    const loginIDs = await loginsRes.json();
    let found = false;
    for (const loginID of loginIDs) {
      let loginData = await fetch(`login/${loginID}.json`).then(r => r.json());
      if (loginData.login === username && loginData.password === password) {
        localStorage.setItem('admin_logged', loginID);
        showDashboard();
        found = true;
        break;
      }
    }
    if (!found) errorDiv.textContent = "Nieprawidłowy login lub hasło";
  } catch (e) {
    errorDiv.textContent = "Błąd połączenia z listą loginów";
  }
};
function isLoggedIn() { return !!localStorage.getItem('admin_logged'); }
function showDashboard() {
  document.getElementById('admin-login').classList.add('panel-hidden');
  document.getElementById('admin-dashboard').classList.remove('panel-hidden');
}
document.getElementById('logout-btn').onclick = function() {
  localStorage.removeItem('admin_logged');
  document.getElementById('admin-dashboard').classList.add('panel-hidden');
  document.getElementById('admin-login').classList.remove('panel-hidden');
};

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
  const blob = new Blob([JSON.stringify(gameObj, null, 2)], {type: "application/json"});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  statusDiv.style.color = "#388e3c";
  statusDiv.textContent = "Plik gry wygenerowany! Dodaj go do katalogu games/ w repozytorium oraz zaktualizuj index.json.";
  clearGameInputs();
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

// LISTA GIER / SZUKAJKA
let games = {};
async function loadGames() {
  try {
    const res = await fetch('games/index.json');
    const ids = await res.json();
    games = {};
    for (const id of ids) {
      let gameRes = await fetch(`games/${id}.json`);
      games[id] = await gameRes.json();
    }
    showGameList();
  } catch (e) {
    document.getElementById('game-list').innerHTML = "<div style='color:#ff3263;font-weight:700; text-align:center; margin-top:40px;'>Nie można pobrać listy gier.</div>";
  }
}
function showGameList() {
  const listDiv = document.getElementById('game-list');
  listDiv.innerHTML = '<h2 style="margin-bottom:18px; color:#00ffe7;">Lista gier</h2>';
  Object.values(games).forEach(game => {
    listDiv.innerHTML += `
      <div class="game-card-list" data-id="${game.id}">
        <b>${game.title}</b> <span style="color:#00ffe7;font-size:0.97em;">(${game.id})</span><br>
        <button onclick="showGameById('${game.id}')">Zobacz</button>
      </div>
    `;
  });
}
window.showGameById = function(id) {
  const details = document.getElementById('game-details');
  const game = games[id];
  if (!game) {
    details.innerHTML = `
      <div class="not-found-msg">Nie znaleziono gry o podanym ID.</div>
      <a href="https://discord.gg/vkFaXxKHJB" target="_blank" class="download-link" style="background:#5865f2;margin-top:10px;">Wbij na Discorda i poproś o dodanie gry!</a>
    `;
    details.classList.add('active');
    return;
  }
  details.innerHTML = `
    ${game.image ? `<img src="${game.image}" alt="Obraz gry">` : ""}
    <h3 style="color:#00ffe7;">${game.title}</h3>
    <p>${game.desc || ""}</p>
    ${game.link ? `<a href="${game.link}" target="_blank" class="download-link">POBIERZ</a>` : ""}
  `;
  details.classList.add('active');
};
document.getElementById('find-btn').onclick = () => {
  const id = document.getElementById('game-search').value.trim();
  showGameById(id);
};
window.onload = loadGames;
