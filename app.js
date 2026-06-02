const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

// Глобальная функция логина - привяжи ее к кнопке в HTML
window.login = async function() {
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
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

// Функция удаления
window.deleteUser = async function(id) {
    if(!confirm('Удалить игрока?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    location.reload();
};

// Админка
async function loadAdminPanel() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    if (user.role === 'Разработчик') {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=username.asc`, { headers });
        const users = await res.json();
        const container = document.getElementById('users-table-body');
        if (container) {
            container.innerHTML = users.map(u => `
                <tr>
                    <td>${u.username}</td>
                    <td>${u.role}</td>
                    <td><button onclick="deleteUser(${u.id})">Удалить</button></td>
                </tr>
            `).join('');
        }
    }
}

document.addEventListener('DOMContentLoaded', loadAdminPanel);
