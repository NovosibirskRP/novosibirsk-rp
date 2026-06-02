const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

// --- АВТОРИЗАЦИЯ ---
window.handleAuthLogin = async function(e) {
    if(e) e.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${u}&password=eq.${p}`, { headers });
    const users = await res.json();
    
    if (users.length === 1) {
        localStorage.setItem('currentUser', JSON.stringify(users[0]));
        alert('Вход выполнен!');
        location.reload();
    } else {
        alert('Ошибка: неверный ник или пароль!');
    }
};

window.handleLogout = function() {
    localStorage.removeItem('currentUser');
    location.reload();
};

// --- АДМИН-ПАНЕЛЬ ---
window.loadUsersTable = async function() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const tbody = document.getElementById('users-table-body');
    
    // Если мы не админ или нет таблицы, ничего не делаем
    if (!user || user.role !== 'Разработчик' || !tbody) return;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=username.asc`, { headers });
    const users = await res.json();
    
    tbody.innerHTML = users.map(u => `
        <tr class="border-b border-slate-800">
            <td class="py-3 px-2">${u.username}</td>
            <td class="py-3 px-2">${u.role}</td>
            <td class="py-3 px-2">
                <button onclick="deleteUser(${u.id})" class="text-red-500 hover:text-red-400">Удалить</button>
            </td>
        </tr>
    `).join('');
};

window.deleteUser = async function(id) {
    if(!confirm('Удалить игрока?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    location.reload();
};

// --- ЗАПУСК ---
document.addEventListener('DOMContentLoaded', () => {
    // Если пользователь админ, загружаем таблицу
    loadUsersTable();
});
