const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

// 1. ВХОД
window.handleAuthLogin = async function(event) {
    if (event) event.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    
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

// 2. ВЫХОД
window.handleLogout = function() {
    localStorage.removeItem('currentUser');
    location.reload();
};

// 3. ЗАГРУЗКА ТАБЛИЦЫ (Только для Разработчика)
window.loadUsersTable = async function() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const tbody = document.getElementById('users-table-body');
    const panel = document.getElementById('management-panel');
    
    if (!user || user.role !== 'Разработчик' || !tbody) {
        if (panel) panel.classList.add('hidden');
        return;
    }

    if (panel) panel.classList.remove('hidden');
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=username.asc`, { headers });
    const users = await res.json();
    
    tbody.innerHTML = users.map(u => `
        <tr class="border-b border-slate-700">
            <td class="p-3">${u.username}</td>
            <td class="p-3">${u.role}</td>
            <td class="p-3">
                <button onclick="deleteUser(${u.id})" class="text-red-500 hover:text-red-400">Удалить</button>
            </td>
        </tr>
    `).join('');
};

// 4. УДАЛЕНИЕ
window.deleteUser = async function(id) {
    if(!confirm('Точно удалить игрока?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    location.reload();
};

// 5. ВКЛАДКИ
window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tabName}`)?.classList.remove('hidden');
};

// ЗАПУСК ПРИ ЗАГРУЗКЕ
document.addEventListener('DOMContentLoaded', () => {
    window.loadUsersTable();
});
