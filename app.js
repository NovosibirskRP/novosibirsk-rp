const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

// Функция входа
async function login() {
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${u}&password=eq.${p}`, { headers });
    const users = await res.json();
    if (users.length > 0) {
        localStorage.setItem('currentUser', JSON.stringify(users[0]));
        location.reload();
    } else { alert('Неверный логин или пароль!'); }
}

// Функция выхода
function logout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

// Загрузка таблицы админа
async function loadAdminPanel() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'Разработчик') return;

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

async function deleteUser(id) {
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    location.reload();
}

document.addEventListener('DOMContentLoaded', loadAdminPanel);
