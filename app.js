const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n"; 
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

window.switchTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById('tab-' + tab).classList.remove('hidden');
};

// ЛОГИН И РЕГИСТРАЦИЯ
window.handleAuth = async () => {
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
        alert('Регистрация прошла успешно!');
    }
};

// АДМИН ПАНЕЛЬ: ФРАКЦИИ И РАНГИ
async function loadAdminPanel() {
    let res = await fetch(`${SUPABASE_URL}/rest/v1/users`, { headers });
    let users = await res.json();
    document.getElementById('users-table-body').innerHTML = users.map(u => `
        <tr>
            <td>${u.username}</td><td>${u.password}</td>
            <td>
                <select onchange="updateRole(${u.id}, this.value)">
                    <option ${u.role=='Главный Владелец'?'selected':''}>Главный Владелец</option>
                    <option ${u.role=='Администрация'?'selected':''}>Администрация</option>
                    <option ${u.role=='Мэр'?'selected':''}>Мэр</option>
                </select>
            </td>
            <td><button onclick="deleteUser(${u.id})">Удалить</button></td>
        </tr>
    `).join('');
}

// УДАЛЕНИЕ НОВОСТЕЙ
window.deleteNews = async (id) => {
    await fetch(`${SUPABASE_URL}/rest/v1/news?id=eq.${id}`, { method: 'DELETE', headers });
    location.reload();
};

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        document.getElementById('profile-info').innerHTML = `Ник: ${user.username}<br>Пароль: ${user.password}<br>Роль: ${user.role}`;
        if (user.role !== 'Пользователь') {
            document.getElementById('admin-panel').classList.remove('hidden');
            loadAdminPanel();
        }
    }
});
