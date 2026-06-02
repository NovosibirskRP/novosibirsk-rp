// НАСТРОЙКА ПОДКЛЮЧЕНИЯ
const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n"; 
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

let currentUser = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthZone();
    }
});

// АВТОРИЗАЦИЯ
async function handleAuthLogin(e) {
    if(e) e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(username)}&password=eq.${encodeURIComponent(password)}`, { headers });
    const users = await res.json();

    if (users.length === 1) {
        currentUser = users[0];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        alert(`Добро пожаловать, ${currentUser.username}!`);
        closeModal();
        updateAuthZone();
    } else {
        alert('Неверный никнейм или пароль!');
    }
}

function updateAuthZone() {
    const zone = document.getElementById('auth-zone');
    const profileNav = document.getElementById('nav-profile');
    const adminNewsPanel = document.getElementById('admin-news-panel');
    const managementPanel = document.getElementById('management-panel');

    if (currentUser) {
        zone.innerHTML = `
            <div class="flex items-center space-x-4">
                <span class="text-sm font-bold bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-cyan-400 cursor-pointer" onclick="switchTab('profile')">
                    👤 ${currentUser.username} (${currentUser.role})
                </span>
                <button onclick="handleLogout()" class="text-xs text-red-400 hover:text-red-300 transition">Выйти</button>
            </div>
        `;
        if (profileNav) profileNav.classList.remove('hidden');
        
        // Показываем админ-панели, если есть права
        if (currentUser.role === 'Разработчик' || currentUser.role === 'Администратор') {
            if (adminNewsPanel) adminNewsPanel.classList.remove('hidden');
            if (managementPanel) {
                managementPanel.classList.remove('hidden');
                loadUsersTable();
            }
        }
    } else {
        zone.innerHTML = `<button onclick="openModal()" class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-300 shadow-lg">Войти</button>`;
        if (profileNav) profileNav.classList.add('hidden');
        if (adminNewsPanel) adminNewsPanel.classList.add('hidden');
        if (managementPanel) managementPanel.classList.add('hidden');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthZone();
    switchTab('main');
}

// УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
async function loadUsersTable() {
    if (!currentUser || currentUser.role !== 'Разработчик') return;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=username.asc`, { headers });
    const users = await res.json();
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    tbody.innerHTML = users.map(user => `
        <tr class="border-b border-slate-800 text-slate-300">
            <td class="py-3.5 px-2 font-semibold text-white">${user.username}</td>
            <td class="py-3.5 px-2 text-slate-500 text-xs font-mono">${user.password}</td>
            <td class="py-3.5 px-2"><span class="px-2 py-0.5 text-xs rounded font-bold ${user.role === 'Разработчик' ? 'bg-red-500/10 text-red-400' : 'bg-slate-950 text-slate-400'}">${user.role}</span></td>
            <td class="py-3.5 px-2">
                <select onchange="changeUserRole(${user.id}, this.value)" class="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white ${user.username === 'RUBERS_SQ' ? 'hidden' : ''}">
                    <option value="Пользователь" ${user.role === 'Пользователь' ? 'selected' : ''}>Пользователь</option>
                    <option value="Администратор" ${user.role === 'Администратор' ? 'selected' : ''}>Администратор</option>
                </select>
            </td>
            <td class="py-3.5 px-2 text-right">
                <button onclick="deleteUser(${user.id}, '${user.username}')" class="text-xs text-red-500 hover:text-red-400 ${user.username === 'RUBERS_SQ' ? 'hidden' : ''}">Удалить</button>
            </td>
        </tr>
    `).join('');
}

async function changeUserRole(id, newRole) {
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ role: newRole })
    });
    loadUsersTable();
}

async function deleteUser(id, name) {
    if (!confirm(`Удалить игрока ${name}?`)) return;
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    loadUsersTable();
}

// ОСТАЛЬНЫЕ ФУНКЦИИ (переключение вкладок, модалки и т.д. остаются прежними)
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    document.getElementById(`nav-${tabName}`).classList.add('active');
}
function openModal() { document.getElementById('auth-modal').classList.remove('hidden'); }
function closeModal() { document.getElementById('auth-modal').classList.add('hidden'); }
function toggleAuthForm(type) {
    const isLogin = type === 'login';
    document.getElementById('form-login').classList.toggle('hidden', !isLogin);
    document.getElementById('form-register').classList.toggle('hidden', isLogin);
}
