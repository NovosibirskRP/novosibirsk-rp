const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json"
};
 
// Текущий пользователь
window.currentUser = JSON.parse(localStorage.getItem('currentUser'));
 
// Ранги администрации
const adminRanks = [
    "Пользователь",
    "Главный Владелец",
    "Заместитель Главного Владельца",
    "Ассистент Главного Владельца",
    "Секретарь",
    "Команда технического администрирования",
    "Администрация",
    "Модерация",
    "Мэр",
    "Вице Мэр"
];
 
// ─── НАВИГАЦИЯ ───────────────────────────────────────────────────────────────
 
window.switchTab = function(tab) {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
    const section = document.getElementById('tab-' + tab);
    if (section) { section.classList.add('active'); section.classList.add('animate-fade-in'); }
    const navBtn = document.getElementById('nav-' + tab);
    if (navBtn) navBtn.classList.add('active');
    if (tab === 'news') loadNews();
    if (tab === 'profile') renderProfile();
};
 
// ─── МОДАЛКА ─────────────────────────────────────────────────────────────────
 
window.openModal = function() {
    document.getElementById('auth-modal').classList.remove('hidden');
};
 
window.closeModal = function() {
    document.getElementById('auth-modal').classList.add('hidden');
};
 
window.switchAuthTab = function(tab) {
    const loginForm = document.getElementById('auth-login-form');
    const regForm = document.getElementById('auth-register-form');
    const loginBtn = document.getElementById('auth-tab-login');
    const regBtn = document.getElementById('auth-tab-register');
 
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        regForm.classList.add('hidden');
        loginBtn.classList.add('active');
        regBtn.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        regForm.classList.remove('hidden');
        loginBtn.classList.remove('active');
        regBtn.classList.add('active');
    }
};
 
// Закрыть по клику вне модалки
document.addEventListener('click', function(e) {
    const modal = document.getElementById('auth-modal');
    if (e.target === modal) closeModal();
});
 
// ─── РЕГИСТРАЦИЯ ─────────────────────────────────────────────────────────────
 
window.handleRegister = async function() {
    const u = document.getElementById('reg-username').value.trim();
    const p = document.getElementById('reg-password').value;
    const p2 = document.getElementById('reg-password2').value;
 
    if (!u || !p) return alert('Заполните все поля!');
    if (p !== p2) return alert('Пароли не совпадают!');
    if (p.length < 4) return alert('Пароль должен быть минимум 4 символа!');
 
    // Проверяем что ник не занят
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(u)}`, { headers });
    const existing = await checkRes.json();
    if (existing.length > 0) return alert('Этот ник уже занят!');
 
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({ username: u, password: p, role: 'Пользователь' })
    });
 
    if (res.ok) {
        const newUsers = await res.json();
        localStorage.setItem('currentUser', JSON.stringify(newUsers[0]));
        window.currentUser = newUsers[0];
        closeModal();
        updateAuthZone();
        renderProfile();
        switchTab('profile');
    } else {
        alert('Ошибка при регистрации. Попробуйте позже.');
    }
};
 
// ─── ВХОД ────────────────────────────────────────────────────────────────────
 
window.handleLogin = async function() {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
 
    if (!u || !p) return alert('Заполните все поля!');
 
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(u)}`, { headers });
    const users = await res.json();
 
    if (users.length === 0) return alert('Пользователь не найден!');
    if (users[0].password !== p) return alert('Неверный пароль!');
 
    localStorage.setItem('currentUser', JSON.stringify(users[0]));
    window.currentUser = users[0];
    closeModal();
    updateAuthZone();
    renderProfile();
};
 
// ─── ВЫХОД ───────────────────────────────────────────────────────────────────
 
window.logout = function() {
    localStorage.removeItem('currentUser');
    window.currentUser = null;
    updateAuthZone();
    switchTab('main');
};
 
// ─── ОБНОВЛЕНИЕ КНОПКИ ВОЙТИ/ПРОФИЛЬ ─────────────────────────────────────────
 
function updateAuthZone() {
    const zone = document.getElementById('auth-zone');
    if (window.currentUser) {
        zone.innerHTML = `
            <button onclick="switchTab('profile')" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
                <span class="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs text-cyan-400 font-bold">
                    ${window.currentUser.username.charAt(0).toUpperCase()}
                </span>
                ${window.currentUser.username}
            </button>
        `;
    } else {
        zone.innerHTML = `<button onclick="openModal()" class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg active:scale-95">Войти</button>`;
    }
}
 
// ─── ПРОФИЛЬ ─────────────────────────────────────────────────────────────────
 
window.renderProfile = function() {
    const guestDiv = document.getElementById('profile-guest');
    const userDiv = document.getElementById('profile-user');
    const adminPanel = document.getElementById('admin-panel');
 
    if (!window.currentUser) {
        guestDiv.classList.remove('hidden');
        userDiv.classList.add('hidden');
        adminPanel.classList.add('hidden');
        return;
    }
 
    guestDiv.classList.add('hidden');
    userDiv.classList.remove('hidden');
 
    document.getElementById('profile-username').textContent = window.currentUser.username;
    document.getElementById('profile-role').textContent = window.currentUser.role || 'Пользователь';
 
    // Показать или скрыть пароль — храним, но показываем замаскированным
    const passEl = document.getElementById('profile-password');
    passEl.dataset.real = window.currentUser.password;
    passEl.textContent = '••••••••';
 
    // Админ-панель — для всех кроме обычных пользователей
    if (window.currentUser.role && window.currentUser.role !== 'Пользователь') {
        adminPanel.classList.remove('hidden');
        loadUsersTable();
    } else {
        adminPanel.classList.add('hidden');
    }
};
 
// Показать/скрыть пароль в профиле
window.togglePassword = function() {
    const passEl = document.getElementById('profile-password');
    const btn = document.getElementById('toggle-pass-btn');
    if (passEl.textContent === '••••••••') {
        passEl.textContent = passEl.dataset.real;
        btn.textContent = 'Скрыть';
    } else {
        passEl.textContent = '••••••••';
        btn.textContent = 'Показать';
    }
};
 
// ─── СМЕНА ПАРОЛЯ ────────────────────────────────────────────────────────────
 
window.changePassword = async function() {
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-password').value;
 
    if (!newPass) return alert('Введите новый пароль!');
    if (newPass.length < 4) return alert('Пароль должен быть минимум 4 символа!');
    if (newPass !== confirmPass) return alert('Пароли не совпадают!');
 
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${window.currentUser.id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({ password: newPass })
    });
 
    if (res.ok) {
        window.currentUser.password = newPass;
        localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
        document.getElementById('profile-password').dataset.real = newPass;
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        alert('Пароль успешно изменён!');
        renderProfile();
    } else {
        alert('Ошибка при смене пароля.');
    }
};
 
// ─── ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ ───────────────────────────────────────────────────
 
window.loadUsersTable = async function() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-500">Загрузка...</td></tr>';
 
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=username.asc`, { headers });
    const users = await res.json();
 
    if (!Array.isArray(users) || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-500">Нет пользователей</td></tr>';
        return;
    }
 
    tbody.innerHTML = users.map(u => `
        <tr class="hover:bg-slate-800/30 transition-colors">
            <td class="p-4 font-semibold">${u.username}</td>
            <td class="p-4 font-mono text-slate-300">${u.password}</td>
            <td class="p-4">
                <select onchange="changeRole(${u.id}, this.value)" class="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs">
                    ${adminRanks.map(r => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
            </td>
            <td class="p-4">
                <button onclick="deleteUser(${u.id})" class="bg-red-500/10 hover:bg-red-500/30 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg text-xs transition-all">
                    Удалить
                </button>
            </td>
        </tr>
    `).join('');
};
 
window.changeRole = async function(id, role) {
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ role })
    });
    loadUsersTable();
};
 
window.deleteUser = async function(id) {
    if (!confirm('Удалить этого пользователя?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    loadUsersTable();
};
 
// ─── НОВОСТИ ─────────────────────────────────────────────────────────────────
 
window.loadNews = async function() {
    const feed = document.getElementById('news-feed');
    feed.innerHTML = '<div class="col-span-2 text-center py-10 text-slate-500">Загрузка новостей...</div>';
 
    const res = await fetch(`${SUPABASE_URL}/rest/v1/news?order=created_at.desc`, { headers });
    const news = await res.json();
 
    if (!Array.isArray(news) || news.length === 0) {
        feed.innerHTML = '<div class="col-span-2 text-center py-10 text-slate-500">Новостей пока нет</div>';
        return;
    }
 
    const tagClasses = {
        'Важно': 'tag-important',
        'Обновление': 'tag-update',
        'Мероприятие': 'tag-event',
        'Свой Вариант': 'tag-custom'
    };
 
    const tagIcons = {
        'Важно': '🔴',
        'Обновление': '⚙️',
        'Мероприятие': '🎉',
        'Свой Вариант': '✏️'
    };
 
    const isAdmin = window.currentUser && window.currentUser.role !== 'Пользователь';
 
    feed.innerHTML = news.map(n => {
        const tagClass = tagClasses[n.tag] || 'tag-custom';
        const tagIcon = tagIcons[n.tag] || '📌';
        const date = n.created_at ? new Date(n.created_at).toLocaleDateString('ru-RU') : '';
        return `
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition-all">
            <div class="flex items-center justify-between">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${tagClass}">
                    ${tagIcon} ${n.tag}
                </span>
                <span class="text-slate-500 text-xs">${date}</span>
            </div>
            <h3 class="text-lg font-bold text-white">${n.title}</h3>
            <p class="text-slate-400 text-sm leading-relaxed">${n.text}</p>
            ${isAdmin ? `<div class="pt-2 border-t border-slate-800">
                <button onclick="deleteNewsById(${n.id})" class="text-red-400 hover:text-red-300 text-xs transition-colors">🗑 Удалить новость</button>
            </div>` : ''}
        </div>
        `;
    }).join('');
};
 
window.createNews = async function() {
    const title = document.getElementById('news-title').value.trim();
    const tag = document.getElementById('news-tag').value;
    const text = document.getElementById('news-text').value.trim();
 
    if (!title || !text) return alert('Заполните заголовок и текст!');
 
    const res = await fetch(`${SUPABASE_URL}/rest/v1/news`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, tag, text })
    });
 
    if (res.ok || res.status === 201) {
        document.getElementById('news-title').value = '';
        document.getElementById('news-text').value = '';
        loadNews();
    } else {
        alert('Ошибка при публикации. Проверьте таблицу news в Supabase.');
    }
};
 
window.deleteNewsById = async function(id) {
    if (!confirm('Удалить эту новость?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/news?id=eq.${id}`, { method: 'DELETE', headers });
    loadNews();
};
 
// ─── ИНИЦИАЛИЗАЦИЯ ───────────────────────────────────────────────────────────
 
document.addEventListener('DOMContentLoaded', () => {
    updateAuthZone();
 
    // Показать панель новостей если админ
    if (window.currentUser && window.currentUser.role !== 'Пользователь') {
        const panel = document.getElementById('admin-news-panel');
        if (panel) panel.classList.remove('hidden');
    }
});
