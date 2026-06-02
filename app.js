const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

let currentUser = null;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        currentUser = JSON.parse(saved);
        updateAuthZone();
    }
});

window.switchTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
    document.getElementById(`nav-${tab}`).classList.add('active');
    if(tab === 'news') loadNewsFromServer();
};

window.openModal = () => document.getElementById('auth-modal').classList.remove('hidden');
window.closeModal = () => document.getElementById('auth-modal').classList.add('hidden');

window.handleAuthLogin = async (e) => {
    e.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(u)}&password=eq.${encodeURIComponent(p)}`, { headers });
    const users = await res.json();
    if (users.length === 1) {
        currentUser = users[0];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        closeModal();
        updateAuthZone();
    } else { alert('Ошибка!'); }
};

window.updateAuthZone = () => {
    const zone = document.getElementById('auth-zone');
    if (currentUser) {
        zone.innerHTML = `<button onclick="handleLogout()" class="bg-red-600 px-6 py-2 rounded">Выйти (${currentUser.username})</button>`;
        document.getElementById('nav-profile').classList.remove('hidden');
        if (currentUser.role === 'Разработчик') {
            document.getElementById('admin-news-panel').classList.remove('hidden');
            document.getElementById('management-panel').classList.remove('hidden');
            loadUsersTable();
        }
    }
};

window.handleLogout = () => {
    localStorage.removeItem('currentUser');
    location.reload();
};

window.loadUsersTable = async () => {
    const tbody = document.getElementById('users-table-body');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=username.asc`, { headers });
    const users = await res.json();
    tbody.innerHTML = users.map(u => `
        <tr class="border-b border-slate-800">
            <td class="p-2">${u.username}</td>
            <td class="p-2">${u.password}</td>
            <td class="p-2">${u.role}</td>
            <td class="p-2"><button onclick="deleteUser(${u.id})" class="text-red-500">Удалить</button></td>
        </tr>
    `).join('');
};

window.deleteUser = async (id) => {
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    loadUsersTable();
};

window.changeOwnPassword = async () => {
    const p = document.getElementById('profile-new-password').value;
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${currentUser.id}`, {
        method: 'PATCH', headers, body: JSON.stringify({ password: p })
    });
    alert('Пароль обновлен');
};

window.createNews = async () => {
    const title = document.getElementById('news-title').value;
    const text = document.getElementById('news-text').value;
    await fetch(`${SUPABASE_URL}/rest/v1/news`, {
        method: 'POST', headers, body: JSON.stringify({ title, text, tag: 'Важно' })
    });
    alert('Новость создана');
};

window.loadNewsFromServer = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/news?order=created_at.desc`, { headers });
    const news = await res.json();
    document.getElementById('news-feed').innerHTML = news.map(n => `
        <div class="bg-slate-900 p-4 rounded">${n.title}: ${n.text}</div>
    `).join('');
};
