const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

// Логин
window.handleAuthLogin = async function() {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${u}&password=eq.${p}`, { headers });
    const users = await res.json();
    if (users.length === 1) {
        localStorage.setItem('currentUser', JSON.stringify(users[0]));
        location.reload();
    } else { alert('Неверно!'); }
};

// Загрузка таблицы
window.loadUsersTable = async function() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const tbody = document.getElementById('users-table-body');
    if (!user || user.role !== 'Разработчик' || !tbody) return;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=username.asc`, { headers });
    const users = await res.json();
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.username}</td>
            <td>${u.role}</td>
            <td><button onclick="deleteUser(${u.id})">Удалить</button></td>
        </tr>
    `).join('');
};

window.deleteUser = async function(id) {
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    location.reload();
};

document.addEventListener('DOMContentLoaded', loadUsersTable);
