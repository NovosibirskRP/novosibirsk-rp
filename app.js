const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

let currentUser = null;

// При загрузке страницы пробуем найти сохраненного юзера
window.onload = async () => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        currentUser = JSON.parse(saved);
        updateAuthZone();
        loadNewsFromServer();
    }
};

async function handleAuthLogin(e) {
    if (e) e.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(u)}&password=eq.${encodeURIComponent(p)}`, { headers });
    const users = await res.json();
    if (users.length === 1) {
        currentUser = users[0];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        location.reload();
    } else {
        alert('Неверный логин или пароль!');
    }
}

function updateAuthZone() {
    const zone = document.getElementById('auth-zone');
    if (currentUser) {
        zone.innerHTML = `<span class="text-cyan-400 font-bold">👤 ${currentUser.username}</span> <button onclick="handleLogout()" class="text-red-400">Выйти</button>`;
        if (currentUser.role === 'Разработчик') {
            document.getElementById('admin-news-panel')?.classList.remove('hidden');
            loadUsersTable();
        }
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

async function loadNewsFromServer() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/news?order=created_at.desc`, { headers });
    const news = await res.json();
    const feed = document.getElementById('news-feed');
    if (feed) {
        feed.innerHTML = news.map(n => `<div class="bg-slate-900 p-4 rounded mb-2"><h3>${n.title}</h3><p>${n.text}</p></div>`).join('');
    }
}

async function loadUsersTable() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=username.asc`, { headers });
    const users = await res.json();
    const tbody = document.getElementById('users-table-body');
    if (tbody) {
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${u.username}</td>
                <td>${u.role}</td>
                <td><button onclick="deleteUser(${u.id})">Удалить</button></td>
            </tr>
        `).join('');
    }
}

async function deleteUser(id) {
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    loadUsersTable();
}
