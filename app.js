const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// 1. ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    updateAuthZone();
    if (currentUser && (currentUser.role === 'Разработчик')) {
        loadUsersTable();
    }
});

// 2. АВТОРИЗАЦИЯ
async function handleAuthLogin(e) {
    e.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${u}&password=eq.${p}`, { headers });
    const users = await res.json();
    if (users.length === 1) {
        localStorage.setItem('currentUser', JSON.stringify(users[0]));
        location.reload();
    } else {
        alert('Неверный логин или пароль!');
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

// 3. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (ТО, ЧТО ТЫ ИСКАЛ!)
async function loadUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return; // Если на странице нет этой таблицы, код не падает

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=username.asc`, { headers });
    const users = await res.json();

    tbody.innerHTML = users.map(user => `
        <tr class="border-b border-slate-800">
            <td class="py-2">${user.username}</td>
            <td class="py-2">${user.role}</td>
            <td class="py-2">
                <select onchange="changeRole(${user.id}, this.value)">
                    <option value="Пользователь" ${user.role === 'Пользователь' ? 'selected' : ''}>Пользователь</option>
                    <option value="Разработчик" ${user.role === 'Разработчик' ? 'selected' : ''}>Разработчик</option>
                </select>
            </td>
            <td class="py-2"><button onclick="deleteUser(${user.id})" class="text-red-500">Удалить</button></td>
        </tr>
    `).join('');
}

async function changeRole(id, newRole) {
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ role: newRole })
    });
    loadUsersTable();
}

async function deleteUser(id) {
    if(!confirm('Удалить игрока?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    loadUsersTable();
}

function updateAuthZone() {
    const zone = document.getElementById('auth-zone');
    if (currentUser && zone) {
        zone.innerHTML = `<span>${currentUser.username} (${currentUser.role})</span> <button onclick="handleLogout()">Выйти</button>`;
    }
}
