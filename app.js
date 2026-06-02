const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) updateAuthZone(user);
    loadNews();
});

window.switchTab = (id) => {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('tab-' + id).classList.remove('hidden');
};

window.openModal = () => document.getElementById('auth-modal').classList.remove('hidden');
window.closeModal = () => document.getElementById('auth-modal').classList.add('hidden');

window.handleAuthLogin = async (e) => {
    e.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${u}&password=eq.${p}`, { headers });
    const users = await res.json();
    if (users.length === 1) {
        localStorage.setItem('currentUser', JSON.stringify(users[0]));
        location.reload();
    } else { alert('Неверно!'); }
};

window.updateAuthZone = (user) => {
    document.getElementById('auth-zone').innerHTML = `<button onclick="localStorage.removeItem('currentUser');location.reload();" class="bg-red-600 px-6 py-2 rounded">Выйти</button>`;
    document.getElementById('nav-profile').classList.remove('hidden');
    if (user.role === 'Разработчик') {
        document.getElementById('management-panel').classList.remove('hidden');
        loadUsers();
    }
};

window.loadUsers = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, { headers });
    const users = await res.json();
    document.getElementById('users-table-body').innerHTML = users.map(u => `
        <tr class="border-b border-slate-800">
            <td class="p-3">${u.username}</td>
            <td class="p-3">
                <select onchange="changeRole(${u.id}, this.value)" class="bg-slate-800 p-1 rounded">
                    <option ${u.role==='Пользователь'?'selected':''}>Пользователь</option>
                    <option ${u.role==='Разработчик'?'selected':''}>Разработчик</option>
                </select>
            </td>
            <td class="p-3"><button onclick="deleteUser(${u.id})" class="text-red-500">Удалить</button></td>
        </tr>
    `).join('');
};

window.changeRole = async (id, role) => {
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'PATCH', headers, body: JSON.stringify({role}) });
    alert('Роль изменена!');
};

window.deleteUser = async (id) => {
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    location.reload();
};

window.loadNews = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/news`, { headers });
    const news = await res.json();
    document.getElementById('news-container').innerHTML = news.map(n => `<div class="bg-slate-900 p-4 rounded">${n.title}</div>`).join('');
};
