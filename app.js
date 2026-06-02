const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n"; 
const headers = { 
    "apikey": SUPABASE_KEY, 
    "Authorization": `Bearer ${SUPABASE_KEY}`, 
    "Content-Type": "application/json" 
};

// Глобальная переменная пользователя
window.currentUser = JSON.parse(localStorage.getItem('currentUser'));

// 1. АВТОРИЗАЦИЯ
window.handleAuthLogin = async function(event) {
    if(event) event.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${u}&password=eq.${p}`, { headers });
    const users = await res.json();
    
    if (users.length === 1) {
        localStorage.setItem('currentUser', JSON.stringify(users[0]));
        location.reload();
    } else {
        alert('Ошибка: неверный ник или пароль!');
    }
};

// 2. ЗАГРУЗКА ТАБЛИЦЫ
window.loadUsersTable = async function() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=username.asc`, { headers });
    const users = await res.json();
    
    tbody.innerHTML = users.map(u => `
        <tr class="border-b border-slate-800">
            <td class="p-3">${u.username}</td>
            <td class="p-3">
                <select onchange="window.changeRole(${u.id}, this.value)" class="bg-slate-900 p-1 rounded">
                    <option ${u.role === 'Пользователь' ? 'selected' : ''}>Пользователь</option>
                    <option ${u.role === 'Разработчик' ? 'selected' : ''}>Разработчик</option>
                </select>
            </td>
            <td class="p-3"><button onclick="window.deleteUser(${u.id})" class="text-red-500">Удалить</button></td>
        </tr>
    `).join('');
};

// 3. СМЕНА РОЛИ
window.changeRole = async function(id, role) {
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ role: role })
    });
    alert('Роль обновлена!');
    window.loadUsersTable();
};

// 4. УДАЛЕНИЕ
window.deleteUser = async function(id) {
    if(!confirm('Точно удалить игрока?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    location.reload();
};

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    if (window.currentUser && window.currentUser.role === 'Разработчик') {
        window.loadUsersTable();
    }
});
