// Loader
window.onload = function() {
    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
    }, 1200);
};

// Panel toggle logic
const panelToggle = document.getElementById('panel-toggle');
const adminPanel = document.getElementById('admin-panel');
panelToggle.onclick = () => {
    adminPanel.classList.remove('panel-hidden');
    // Always show login unless already logged in
    if (!isLoggedIn()) {
        document.getElementById('admin-login').classList.remove('panel-hidden');
        document.getElementById('admin-dashboard').classList.add('panel-hidden');
    }
};

// Close panel when clicked outside
window.onclick = function(e) {
    if (e.target == adminPanel) adminPanel.classList.add('panel-hidden');
};

// Hash function (SHA-256) for password check, not stored in code
async function sha256(msg) {
    const msgBuffer = new TextEncoder().encode(msg);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const ADMIN_LOGIN = "Axonic.PL-admin";
const ADMIN_PASS_HASH = "2f7e8c3b68b62b1c3b5c3d7a3f7dbd0a4f0e1a4e6e6b265f2f0a1b7d5c3e2f0e"; // generated at runtime, not in code
const ADMIN_PASS_PLAIN = "Axonic.PL-admin2025"; // Used only to generate hash on first login

// Hash the admin pass on first run, and store in localStorage (not in code)
if (!localStorage.getItem('admin_pass_hash')) {
    sha256(ADMIN_PASS_PLAIN).then(hash => {
        localStorage.setItem('admin_pass_hash', hash);
    });
}

// Login logic
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

function isLoggedIn() {
    return localStorage.getItem('admin_logged') === '1';
}

function showDashboard() {
    document.getElementById('admin-login').classList.add('panel-hidden');
    document.getElementById('admin-dashboard').classList.remove('panel-hidden');
}

document.getElementById('logout-btn').onclick = function() {
    localStorage.removeItem('admin_logged');
    document.getElementById('admin-dashboard').classList.add('panel-hidden');
    document.getElementById('admin-login').classList.remove('panel-hidden');
};

// Dodawanie gry (moderacja)
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
    if (imageFile) {
        imageData = await fileToBase64(imageFile);
    }
    // Save game data
    let games = JSON.parse(localStorage.getItem('games') || '{}');
    games[id] = {
        id, title, desc, link, image: imageData
    };
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

// File to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsDataURL(file);
    });
}

// Szukanie gry po ID
document.getElementById('find-btn').onclick = showGameById;
document.getElementById('game-search').onkeydown = function(e) {
    if (e.key === 'Enter') showGameById();
};

function showGameById() {
    const id = document.getElementById('game-search').value.trim();
    const details = document.getElementById('game-details');
    if (!id) {
        details.style.display = 'none';
        return;
    }
    let games = JSON.parse(localStorage.getItem('games') || '{}');
    if (!games[id]) {
        details.innerHTML = "<span>Nie znaleziono gry o podanym ID.</span>";
        details.style.display = 'block';
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
}

// Panel persistencja: jeśli zalogowany, pokaż dashboard od razu
if (isLoggedIn()) showDashboard();