// НАСТРОЙКИ
const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n"; 
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

let currentUser = null;

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthZone();
    }
});

// АВТОРИЗАЦИЯ
window.handleAuthLogin = async function(e) {
    if (e) e.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(u)}&password=eq.${encodeURIComponent(p)}`, { headers });
    const users = await res.json();

    if (users.length === 1) {
        currentUser = users[0];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        alert('Вход выполнен!');
        location.reload(); 
    } else {
        alert('Неверный ник или пароль!');
    }
};

window.handleLogout = function() {
    localStorage.removeItem('currentUser');
    location.reload();
};

// ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
function updateAuthZone() {
    const zone = document.getElementById('auth-zone');
    const panel = document.getElementById('management-panel');
    
    if (currentUser && zone) {
        zone.innerHTML = `
            <div class="flex items-center space-x-4">
                <span class="text-sm font-bold bg-slate-800 px-3 py-1.5 rounded-lg text-cyan-400 cursor-pointer" onclick="switchTab('profile')">
                    👤 ${currentUser.username}
                </span>
                <button onclick="handleLogout()" class="text-xs text-red-400">Выйти</button>
            </div>
        `;
        
        // Показываем админку, если админ
        if ((currentUser.role === 'Разработчик' || currentUser.role === 'Администратор') && panel) {
            panel.classList.remove('hidden');
            loadUsersTable();
        }
    }
}

// ТАБЛИЦА
window.loadUsersTable = async function() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody || !currentUser || currentUser.role !== 'Разработчик') return;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=username.asc`, { headers });
    const users = await res.json();

    tbody.innerHTML = users.map(u => `
        <tr class="border-b border-slate-800">
            <td class="p-3">${u.username}</td>
            <td class="p-3">${u.role}</td>
            <td class="p-3">
                <button onclick="deleteUser(${u.id})" class="text-red-500 hover:text-red-400">Удалить</button>
            </td>
        </tr>
    `).join('');
};

window.deleteUser = async function(id) {
    if(!confirm('Удалить игрока?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    loadUsersTable();
};

// ПЕРЕКЛЮЧАТЕЛЬ Вкладок
window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    const tab = document.getElementById(`tab-${tabName}`);
    if (tab) tab.classList.remove('hidden');
};

// МОДАЛКА
window.openModal = () => document.getElementById('auth-modal')?.classList.remove('hidden');
window.closeModal = () => document.getElementById('auth-modal')?.classList.add('hidden');
