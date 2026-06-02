// НАСТРОЙКА ПОДКЛЮЧЕНИЯ К СЕРВЕРУ SUPABASE
const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n"; 

// Базовые заголовки для запросов к серверу
const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json"
};

// Переключение вкладок на сайте
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    
    const activeTab = document.getElementById(`tab-${tabName}`);
    const activeNav = document.getElementById(`nav-${tabName}`);
    
    if (activeTab) activeTab.classList.remove('hidden');
    if (activeNav) activeNav.classList.add('active');
    
    if (tabName === 'news') {
        loadNewsFromServer();
    }
}

// МОДАЛЬНОЕ ОКНО
function openModal() { document.getElementById('auth-modal').classList.remove('hidden'); }
function closeModal() { document.getElementById('auth-modal').classList.add('hidden'); }

function toggleAuthForm(type) {
    const isLogin = type === 'login';
    document.getElementById('form-login').classList.toggle('hidden', !isLogin);
    document.getElementById('form-register').classList.toggle('hidden', isLogin);
    
    document.getElementById('tab-btn-login').className = isLogin ? 'flex-1 text-center py-2 text-sm font-bold rounded-lg text-cyan-400 bg-slate-900' : 'flex-1 text-center py-2 text-sm font-bold rounded-lg text-slate-400 hover:text-white';
    document.getElementById('tab-btn-register').className = !isLogin ? 'flex-1 text-center py-2 text-sm font-bold rounded-lg text-cyan-400 bg-slate-900' : 'flex-1 text-center py-2 text-sm font-bold rounded-lg text-slate-400 hover:text-white';
}

// СЕРВЕРНАЯ АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ
let currentUser = null;

async function handleAuthRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;

    if(!username || !password) return alert('Заполните все поля!');

    // Проверяем, нет ли уже такого игрока на сервере
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(username)}`, { headers });
    const existingUsers = await checkRes.json();

    if (existingUsers.length > 0) {
        return alert('Этот никнейм уже занят другим игроком!');
    }

    // Сохраняем нового игрока в общую базу данных
    const regRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ username, password, role: 'Пользователь' })
    });

    if (regRes.ok) {
        alert('Аккаунт успешно создан! Теперь войдите.');
        toggleAuthForm('login');
    } else {
        alert('Ошибка при регистрации на сервере.');
    }
}

async function handleAuthLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    // Запрашиваем игрока из базы данных
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(username)}&password=eq.${encodeURIComponent(password)}`, { headers });
    const users = await res.json();

    if (users.length === 1) {
        currentUser = users[0];
        alert(`Добро пожаловать, ${currentUser.username}! Ваша роль: ${currentUser.role}`);
        closeModal();
        updateAuthZone();
    } else {
        alert('Неверный никнейм или пароль!');
    }
}

function updateAuthZone() {
    const zone = document.getElementById('auth-zone');
    if (currentUser) {
        zone.innerHTML = `
            <div class="flex items-center space-x-4">
                <span class="text-sm font-bold bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-cyan-400 cursor-pointer" onclick="switchTab('profile')">
                    👤 ${currentUser.username} (${currentUser.role})
                </span>
                <button onclick="handleLogout()" class="text-xs text-red-400 hover:text-red-300 transition">Выйти</button>
            </div>
        `;
        document.getElementById('nav-profile').classList.remove('hidden');
        if (currentUser.role === 'Разработчик' || currentUser.role === 'Администратор') {
            document.getElementById('admin-news-panel').classList.remove('hidden');
            loadUsersTable();
        }
    } else {
        zone.innerHTML = `<button onclick="openModal()" class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-300 shadow-lg">Войти</button>`;
        document.getElementById('nav-profile').classList.add('hidden');
        document.getElementById('admin-news-panel').classList.add('hidden');
    }
}

function handleLogout() {
    currentUser = null;
    updateAuthZone();
    switchTab('main');
}

// СЕРВЕРНЫЕ НОВОСТИ
function toggleCustomTagInput() {
    const select = document.getElementById('news-tag-select');
    const customInput = document.getElementById('news-tag-custom');
    customInput.classList.toggle('hidden', select.value !== 'CUSTOM');
}

async function createNews() {
    if (!currentUser || (currentUser.role !== 'Разработчик' && currentUser.role !== 'Администратор')) return;

    const title = document.getElementById('news-title').value.trim();
    const text = document.getElementById('news-text').value.trim();
    const selectTag = document.getElementById('news-tag-select').value;
    const customTag = document.getElementById('news-tag-custom').value.trim();
    
    const tag = selectTag === 'CUSTOM' ? customTag : selectTag;

    if (!title || !text || !tag) return alert('Заполните все поля новости!');

    const res = await fetch(`${SUPABASE_URL}/rest/v1/news`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ title, text, tag })
    });

    if (res.ok) {
        document.getElementById('news-title').value = '';
        document.getElementById('news-text').value = '';
        document.getElementById('news-tag-custom').value = '';
        loadNewsFromServer();
    } else {
        alert('Ошибка при публикации новости.');
    }
}

async function loadNewsFromServer() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/news?order=created_at.desc`, { headers });
    const newsList = await res.json();

    const feed = document.getElementById('news-feed');
    feed.innerHTML = '';

    if (newsList.length === 0) {
        feed.innerHTML = `<p class="text-slate-500 col-span-2 text-center py-8">Новостей пока нет.</p>`;
        return;
    }

    newsList.forEach(item => {
        const card = document.createElement('div');
        card.className = "bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-all relative";
        
        // Кнопка удаления новости для admin-ов
        let deleteBtn = '';
        if (currentUser && (currentUser.role === 'Разработчик' || currentUser.role === 'Администратор')) {
            deleteBtn = `<button onclick="deleteNews(${item.id})" class="absolute top-4 right-4 text-xs text-red-500 hover:text-red-400">Удалить</button>`;
        }

        card.innerHTML = `
            ${deleteBtn}
            <div class="flex items-center space-x-2">
                <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300">${item.tag}</span>
            </div>
            <h3 class="text-xl font-bold text-white">${item.title}</h3>
            <p class="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">${item.text}</p>
        `;
        feed.appendChild(card);
    });
}

async function deleteNews(id) {
    if (!confirm('Удалить эту новость для всех игроков?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/news?id=eq.${id}`, { method: 'DELETE', headers });
    loadNewsFromServer();
}

// УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ (БАЗА ДАННЫХ)
async function loadUsersTable() {
    if (!currentUser || currentUser.role !== 'Разработчик') return;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=username.asc`, { headers });
    const users = await res.json();

    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-slate-800 text-slate-300 hover:bg-slate-850/50";
        
        tr.innerHTML = `
            <td class="py-3.5 px-2 font-semibold text-white">${user.username}</td>
            <td class="py-3.5 px-2 text-slate-500 text-xs font-mono">${user.password}</td>
            <td class="py-3.5 px-2">
                <span class="px-2 py-0.5 text-xs rounded font-bold ${user.role === 'Разработчик' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : user.role === 'Администратор' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-950 text-slate-400'}">${user.role}</span>
            </td>
            <td class="py-3.5 px-2">
                <select onchange="changeUserRole(${user.id}, this.value)" class="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none text-white ${user.username === 'RUBERS_SQ' ? 'hidden' : ''}">
                    <option value="Пользователь" ${user.role === 'Пользователь' ? 'selected' : ''}>Пользователь</option>
                    <option value="Администратор" ${user.role === 'Администратор' ? 'selected' : ''}>Администратор</option>
                </select>
            </td>
            <td class="py-3.5 px-2 text-right">
                <button onclick="deleteUser(${user.id}, '${user.username}')" class="text-xs text-red-500 hover:text-red-400 font-medium ${user.username === 'RUBERS_SQ' ? 'hidden' : ''}">Удалить</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function changeUserRole(id, newRole) {
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ role: newRole })
    });
    alert('Роль игрока успешно обновлена на сервере!');
    loadUsersTable();
}

async function deleteUser(id, name) {
    if (!confirm(`Вы действительно хотите НАВСЕГДА удалить аккаунт игрока ${name}?`)) return;
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    loadUsersTable();
}

async function changeOwnPassword() {
    const newPass = document.getElementById('profile-new-password').value;
    if (!newPass) return alert('Введите новый пароль!');

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${currentUser.id}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ password: newPass })
    });

    if (res.ok) {
        currentUser.password = newPass;
        document.getElementById('profile-new-password').value = '';
        alert('Ваш пароль успешно изменен в базе данных!');
        loadUsersTable();
    }
}
