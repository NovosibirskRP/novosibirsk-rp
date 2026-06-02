const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

// 1. АВТОРИЗАЦИЯ (Имена функций как у тебя в HTML)
window.handleAuthLogin = async function(e) {
    if(e) e.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${u}&password=eq.${p}`, { headers });
    const users = await res.json();
    if (users.length === 1) {
        localStorage.setItem('currentUser', JSON.stringify(users[0]));
        alert('Вход выполнен!');
        location.reload();
    } else { alert('Ошибка: неверный ник или пароль!'); }
};

window.handleLogout = function() {
    localStorage.removeItem('currentUser');
    location.reload();
};

// 2. АДМИНКА (Таблица пользователей)
window.loadUsersTable = async function() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'Разработчик') return;

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
};

window.deleteUser = async function(id) {
    if(!confirm('Удалить игрока?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    location.reload();
};

// 3. АВТО-ЗАПУСК
document.addEventListener('DOMContentLoaded', () => {
    loadUsersTable();
});
