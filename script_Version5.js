// Ładowanie wszystkich gier z katalogu 'games/'
let games = {};

async function loadGames() {
    // Pobieranie plików JSON z katalogu 'games/'
    // Uwaga: GitHub Pages nie pozwala listować katalogów – ręcznie wstaw listę plików lub generuj games/index.json!
    // Przykład: w pliku games/index.json jest tablica z ID wszystkich gier
    const res = await fetch('games/index.json');
    const ids = await res.json();
    games = {};
    for (const id of ids) {
        let gameRes = await fetch(`games/${id}.json`);
        games[id] = await gameRes.json();
    }
    showGameList();
}

function showGameList() {
    const listDiv = document.getElementById('game-list');
    listDiv.innerHTML = '<h2>Lista gier:</h2>';
    Object.values(games).forEach(game => {
        listDiv.innerHTML += `
            <div class="game-card-list" data-id="${game.id}">
                <b>${game.title}</b> (${game.id})<br>
                <button onclick="showGameById('${game.id}')">Zobacz</button>
            </div>
        `;
    });
}

function showGameById(id) {
    const details = document.getElementById('game-details');
    const game = games[id];
    if (!game) {
        details.innerHTML = `
            <div class="not-found-msg">Nie znaleziono gry o podanym ID.</div>
            <a href="https://discord.gg/vkFaXxKHJB" target="_blank" class="discord-cta-btn">
                Wbij na Discorda i poproś o dodanie gry!
            </a>
        `;
        return;
    }
    details.innerHTML = `
        <h3>${game.title}</h3>
        <p>${game.desc || ""}</p>
        ${game.link ? `<a href="${game.link}" target="_blank" class="download-link">POBIERZ</a>` : ""}
    `;
}

document.getElementById('find-btn').onclick = () => {
    const id = document.getElementById('game-search').value.trim();
    showGameById(id);
};

window.onload = loadGames;