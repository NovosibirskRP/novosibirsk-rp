const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

// Логин
window.handleAuthLogin = async function(e) {
    if (e) e.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${u}&password=eq.${p}`, { headers });
    const users = await res.json();
    
    if (users.length > 0) {
        localStorage.setItem('currentUser', JSON.stringify(users[0]));
        alert('Успешный вход!');
        location.reload();
    } else {
        alert('Ошибка: неверный ник или пароль!');
    }
};

// Выход
window.handleLogout = function() {
    localStorage.removeItem('currentUser');
    location.reload();
};

// Загрузка таблицы админа
window.loadUsersTable = async function() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const tbody = document.getElementById('users-table-body');
    const panel = document.getElementById('management-panel');

    if (!user || user.role !== 'Разработчик') {
        if (panel) panel.classList.add('hidden');
        return;
    }

    if (panel) panel.classList.remove('hidden');
    if (!tbody) return;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=username.asc`, { headers });
    const users = await res.json();
    
    tbody.innerHTML = users.map(u => `
        <tr class="border-b border-slate-800">
            <td class="p-3">${u.username}</td>
            <td class="p-3">${u.role}</td>
            <td class="p-3"><button onclick="deleteUser(${u.id})" class="text-red-500">Удалить</button></td>
        </tr>
    `).join('');
};

window.deleteUser = async function(id) {
    if(!confirm('Удалить пользователя?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    loadUsersTable();
};

document.addEventListener('DOMContentLoaded', loadUsersTable);
