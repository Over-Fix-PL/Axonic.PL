// Loader with animation
window.onload = function() {
    setTimeout(() => {
        document.getElementById('loader').classList.add('fade-out');
        setTimeout(() => document.getElementById('loader').style.display = 'none', 900);
    }, 1100);
};

// Admin panel toggle logic
const panelToggle = document.getElementById('panel-toggle');
const adminPanel = document.getElementById('admin-panel');
panelToggle.onclick = () => {
    adminPanel.classList.remove('panel-hidden');
    if (!isLoggedIn()) {
        document.getElementById('admin-login').classList.remove('panel-hidden');
        document.getElementById('admin-dashboard').classList.add('panel-hidden');
    }
};
window.onclick = function(e) {
    if (e.target == adminPanel) adminPanel.classList.add('panel-hidden');
};

// Hash function (SHA-256) for password check
async function sha256(msg) {
    const msgBuffer = new TextEncoder().encode(msg);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
const ADMIN_LOGIN = "Axonic.PL-admin";
const ADMIN_PASS_HASH = "2f7e8c3b68b62b1c3b5c3d7a3f7dbd0a4f0e1a4e6e6b265f2f0a1b7d5c3e2f0e";
const ADMIN_PASS_PLAIN = "Axonic.PL-admin2025";
if (!localStorage.getItem('admin_pass_hash')) {
    sha256(ADMIN_PASS_PLAIN).then(hash => {
        localStorage.setItem('admin_pass_hash', hash);
    });
}
document.getElementById('admin-login-btn').onclick = async function() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('admin-login-error');
    errorDiv.textContent = "";
    if (username !== ADMIN_LOGIN) {
        errorDiv.textContent = "Nieprawidłowy login";
        return;
    }
    const hash = await sha256(password);
    const localHash = localStorage.getItem('admin_pass_hash');
    if (hash === localHash) {
        localStorage.setItem('admin_logged', '1');
        showDashboard();
    } else {
        errorDiv.textContent = "Błędne hasło";
    }
};
function isLoggedIn() { return localStorage.getItem('admin_logged') === '1'; }
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
    let games = JSON.parse(localStorage.getItem('games') || '{}');
    games[id] = { id, title, desc, link, image: imageData };
    localStorage.setItem('games', JSON.stringify(games));
    statusDiv.style.color = "#388e3c";
    statusDiv.textContent = "Gra dodana!";
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

// Szukanie gry po ID: live search i click
const searchInput = document.getElementById('game-search');
const details = document.getElementById('game-details');
const findBtn = document.getElementById('find-btn');
const card = document.getElementById('game-card');
let lastGameId = "";
function showGameById(id, focusInput=false) {
    id = id.trim();
    if (focusInput) searchInput.focus();
    if (!id) {
        details.style.display = 'none';
        card.classList.add('hidden');
        return;
    }
    let games = JSON.parse(localStorage.getItem('games') || '{}');
    if (!games[id]) {
        details.innerHTML = `
            <div class="not-found-msg">Nie znaleziono gry o podanym ID.</div>
            <a href="https://discord.gg/vkFaXxKHJB" target="_blank" class="discord-cta-btn">
                Wbij na Discorda i poproś o dodanie gry!
            </a>
        `;
        details.style.display = 'block';
        card.classList.add('hidden');
        lastGameId = "";
        return;
    }
    const game = games[id];
    details.innerHTML = `
        ${game.image ? `<img src="${game.image}" alt="Obraz gry">` : ""}
        <h3>${game.title}</h3>
        <p>${game.desc || ''}</p>
        ${game.link ? `<a href="${game.link}" target="_blank" class="download-link">POBIERZ</a>` : ""}
    `;
    details.style.display = 'block';
    showMiniCard(game);
    lastGameId = id;
}

// Live search
searchInput.addEventListener('input', e => {
    showGameById(searchInput.value);
});
findBtn.onclick = () => showGameById(searchInput.value, true);
searchInput.onkeydown = function(e) {
    if (e.key === 'Enter') showGameById(searchInput.value, true);
};

// Mini-karta gry na dole
function showMiniCard(game) {
    card.innerHTML = `
        ${game.image ? `<img src="${game.image}" alt="Obraz gry">` : ""}
        <div>
            <div class="game-title">${game.title}</div>
            <div class="game-desc">${game.desc ? game.desc.substring(0,32) : ''}</div>
        </div>
    `;
    card.classList.remove('hidden');
    card.onclick = () => {
        if (game.link) window.open(game.link, "_blank");
    };
    card.onmouseenter = () => card.style.opacity = 1;
    card.onmouseleave = () => card.style.opacity = 0.93;
}

// Panel persistencja
if (isLoggedIn()) showDashboard();

// Discord FAB (zmiana linku)
document.getElementById('discord-fab').onclick = function() {
    window.open('https://discord.gg/vkFaXxKHJB', '_blank');
};

// Pobieranie liczby członków z Discord Widget API
// Uwaga: musi być włączony widget w ustawieniach serwera Discord!
const discordCountDiv = document.getElementById('discord-count');
fetch('https://discord.com/api/guilds/1386014875687325846/widget.json')
.then(response => response.json())
.then(data => {
    if(data && data.presence_count !== undefined) {
        discordCountDiv.innerHTML = `<span style="color:var(--main-accent);font-weight:700;font-size:1.13rem;">${data.presence_count} online</span> / ${data.members.length} osób`;
    } else if (data && data.members) {
        discordCountDiv.innerHTML = `${data.members.length} osób na serwerze`;
    } else {
        discordCountDiv.innerHTML = `Brak danych z Discorda`;
    }
})
.catch(() => {
    discordCountDiv.innerHTML = 'Nie można pobrać liczby online';
});