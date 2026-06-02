const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n"; 
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

window.currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Регистрация и логин
window.handleAuthAction = async () => {
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    let res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${u}`, { headers });
    let users = await res.json();
    
    if (users.length > 0) {
        if (users[0].password === p) {
            localStorage.setItem('currentUser', JSON.stringify(users[0]));
            location.reload();
        } else alert('Неверный пароль');
    } else {
        await fetch(`${SUPABASE_URL}/rest/v1/users`, { method: 'POST', headers, body: JSON.stringify({username: u, password: p, role: 'Пользователь'}) });
        alert('Регистрация успешна!');
    }
};

// Админ-ранги
const adminRanks = [
    "Главный Владелец", "Заместитель Главного Владельца", "Ассистент Главного Владельца", 
    "Секретарь", "Команда технического администрирования", "Администрация", "Модерация", "Мэр", "Вице Мэр"
];

window.loadUsersTable = async () => {
    let res = await fetch(`${SUPABASE_URL}/rest/v1/users`, { headers });
    let users = await res.json();
    document.getElementById('users-table-body').innerHTML = users.map(u => `
        <tr>
            <td>${u.username}</td><td>${u.password}</td>
            <td><select onchange="changeRole(${u.id}, this.value)">
                ${adminRanks.map(r => `<option ${u.role==r?'selected':''}>${r}</option>`).join('')}
            </select></td>
            <td><button onclick="deleteUser(${u.id})">Удалить</button></td>
        </tr>
    `).join('');
};

window.deleteNewsById = async (id) => {
    await fetch(`${SUPABASE_URL}/rest/v1/news?id=eq.${id}`, { method: 'DELETE', headers });
    location.reload();
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.currentUser) {
        document.getElementById('profile-info').innerHTML = `Ник: ${window.currentUser.username}<br>Пароль: ${window.currentUser.password}`;
        if (window.currentUser.role !== 'Пользователь') {
            document.getElementById('admin-panel').classList.remove('hidden');
            window.loadUsersTable();
        }
    }
});
