const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const H = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json"
};
 
// Все роли
const ALL_ROLES = [
    "Пользователь",
    // Фракции
    "ФСБ", "СОБР", "Прокуратура", "Адвокатура", "Верховный Суд",
    "Государственная Телерадиокомпания", "ОПГ (RUCH)", "Патрульная Полиция (ДПС)",
    // Администрация
    "Мэр", "Вице Мэр",
    "Модерация", "Администрация",
    "Команда технического администрирования",
    "Секретарь",
    "Ассистент Главного Владельца",
    "Заместитель Главного Владельца",
    "Главный Владелец"
];
 
// Роли у которых есть доступ к панели пользователей
const ADMIN_ROLES = [
    "Главный Владелец",
    "Заместитель Главного Владельца",
    "Ассистент Главного Владельца",
    "Секретарь",
    "Команда технического администрирования"
];
 
window.currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('currentUser')); }
    catch(e) { return null; }
})();
 
// ─── TOAST ───────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'show ' + type;
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => { t.className = ''; }, 3000);
}
 
// ─── НАВИГАЦИЯ ───────────────────────────────────────────────────────────────
window.showPage = function(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const page = document.getElementById('page-' + name);
    const btn  = document.getElementById('nav-' + name);
    if (page) page.classList.add('active');
    if (btn)  btn.classList.add('active');
    if (name === 'news')    loadNews();
    if (name === 'profile') renderProfile();
};
 
// ─── МОДАЛКА ─────────────────────────────────────────────────────────────────
window.openModal = function() {
    document.getElementById('auth-modal').classList.add('open');
};
window.closeModal = function() {
    document.getElementById('auth-modal').classList.remove('open');
};
window.modalOverlayClick = function(e) {
    if (e.target === document.getElementById('auth-modal')) closeModal();
};
window.switchAuthTab = function(tab) {
    document.getElementById('form-login').style.display    = tab === 'login'    ? 'block' : 'none';
    document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('tab-login').classList.toggle('active',    tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');
};
 
// ─── AUTH ZONE ────────────────────────────────────────────────────────────────
function updateAuthZone() {
    const zone = document.getElementById('auth-zone');
    if (window.currentUser) {
        const initial = window.currentUser.username.charAt(0).toUpperCase();
        zone.innerHTML = `
            <button class="user-chip" onclick="showPage('profile')">
                <div class="user-avatar">${initial}</div>
                ${window.currentUser.username}
            </button>`;
    } else {
        zone.innerHTML = `<button class="auth-btn" onclick="openModal()">Войти</button>`;
    }
}
 
// ─── ВХОД ────────────────────────────────────────────────────────────────────
window.handleLogin = async function() {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    if (!u || !p) return toast('Заполните все поля!', 'error');
    try {
        const res   = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(u)}`, { headers: H });
        const users = await res.json();
        if (!users.length)           return toast('Пользователь не найден!', 'error');
        if (users[0].password !== p) return toast('Неверный пароль!', 'error');
        localStorage.setItem('currentUser', JSON.stringify(users[0]));
        window.currentUser = users[0];
        closeModal();
        updateAuthZone();
        toast('Добро пожаловать, ' + users[0].username + '!');
    } catch(e) { toast('Ошибка соединения', 'error'); }
};
 
// ─── РЕГИСТРАЦИЯ ─────────────────────────────────────────────────────────────
window.handleRegister = async function() {
    const u  = document.getElementById('reg-username').value.trim();
    const p  = document.getElementById('reg-password').value;
    const p2 = document.getElementById('reg-password2').value;
    if (!u || !p)    return toast('Заполните все поля!', 'error');
    if (p.length < 4) return toast('Пароль минимум 4 символа!', 'error');
    if (p !== p2)    return toast('Пароли не совпадают!', 'error');
    try {
        const check  = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(u)}`, { headers: H });
        const exists = await check.json();
        if (exists.length) return toast('Этот ник уже занят!', 'error');
 
        const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
            method: 'POST',
            headers: { ...H, 'Prefer': 'return=representation' },
            body: JSON.stringify({ username: u, password: p, role: 'Пользователь' })
        });
        if (!res.ok) return toast('Ошибка регистрации. Попробуйте позже.', 'error');
        const newUser = (await res.json())[0];
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        window.currentUser = newUser;
        closeModal();
        updateAuthZone();
        showPage('profile');
        toast('Аккаунт создан! Добро пожаловать, ' + u + '!');
    } catch(e) { toast('Ошибка соединения', 'error'); }
};
 
// ─── ВЫХОД ───────────────────────────────────────────────────────────────────
window.logout = function() {
    localStorage.removeItem('currentUser');
    window.currentUser = null;
    updateAuthZone();
    showPage('main');
    toast('Вы вышли из аккаунта');
};
 
// ─── ПРОФИЛЬ ─────────────────────────────────────────────────────────────────
window.renderProfile = function() {
    const guest = document.getElementById('profile-guest');
    const user  = document.getElementById('profile-user');
    const admin = document.getElementById('admin-panel');
 
    if (!window.currentUser) {
        guest.style.display = 'block';
        user.style.display  = 'none';
        return;
    }
    guest.style.display = 'none';
    user.style.display  = 'block';
 
    document.getElementById('profile-username').textContent = window.currentUser.username;
    document.getElementById('profile-role').textContent     = window.currentUser.role || 'Пользователь';
 
    const passEl = document.getElementById('profile-password');
    passEl.dataset.real = window.currentUser.password;
    passEl.textContent  = '••••••••';
    document.getElementById('toggle-pass-btn').textContent = 'Показать';
 
    const isAdmin = ADMIN_ROLES.includes(window.currentUser.role);
    admin.style.display = isAdmin ? 'block' : 'none';
    if (isAdmin) loadUsersTable();
};
 
window.togglePassword = function() {
    const el  = document.getElementById('profile-password');
    const btn = document.getElementById('toggle-pass-btn');
    if (el.textContent === '••••••••') {
        el.textContent  = el.dataset.real;
        btn.textContent = 'Скрыть';
    } else {
        el.textContent  = '••••••••';
        btn.textContent = 'Показать';
    }
};
 
// ─── СМЕНА ПАРОЛЯ ────────────────────────────────────────────────────────────
window.changePassword = async function() {
    const np = document.getElementById('new-password').value;
    const cp = document.getElementById('confirm-password').value;
    if (!np)          return toast('Введите новый пароль!', 'error');
    if (np.length < 4) return toast('Пароль минимум 4 символа!', 'error');
    if (np !== cp)    return toast('Пароли не совпадают!', 'error');
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${window.currentUser.id}`, {
            method: 'PATCH', headers: H,
            body: JSON.stringify({ password: np })
        });
        if (!res.ok) return toast('Ошибка при смене пароля', 'error');
        window.currentUser.password = np;
        localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
        document.getElementById('new-password').value    = '';
        document.getElementById('confirm-password').value = '';
        renderProfile();
        toast('Пароль успешно изменён!');
    } catch(e) { toast('Ошибка соединения', 'error'); }
};
 
// ─── ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ ───────────────────────────────────────────────────
window.loadUsersTable = async function() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#334155;padding:24px;">Загрузка...</td></tr>`;
    try {
        const res   = await fetch(`${SUPABASE_URL}/rest/v1/users?order=username.asc`, { headers: H });
        const users = await res.json();
        if (!users.length) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#334155;padding:24px;">Нет пользователей</td></tr>`;
            return;
        }
        tbody.innerHTML = users.map(u => `
            <tr>
                <td><span class="username-cell">${u.username}</span></td>
                <td><span class="pass-cell">${u.password}</span></td>
                <td>
                    <select class="role-select" onchange="changeRole(${u.id}, this.value)">
                        ${ALL_ROLES.map(r => `<option value="${r}"${u.role === r ? ' selected' : ''}>${r}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <button class="btn-danger" onclick="deleteUser(${u.id}, '${u.username}')">Удалить</button>
                </td>
            </tr>
        `).join('');
    } catch(e) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#ef4444;padding:24px;">Ошибка загрузки</td></tr>`;
    }
};
 
window.changeRole = async function(id, role) {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, {
            method: 'PATCH', headers: H,
            body: JSON.stringify({ role })
        });
        // Обновить локально если это текущий пользователь
        if (window.currentUser && window.currentUser.id === id) {
            window.currentUser.role = role;
            localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
        }
        toast('Роль обновлена');
    } catch(e) { toast('Ошибка', 'error'); }
};
 
window.deleteUser = async function(id, username) {
    if (!confirm(`Удалить пользователя "${username}"?`)) return;
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers: H });
        toast('Пользователь удалён');
        loadUsersTable();
    } catch(e) { toast('Ошибка', 'error'); }
};
 
// ─── НОВОСТИ ─────────────────────────────────────────────────────────────────
const TAG_CLASSES = {
    'Важно':        'tag-important',
    'Обновление':   'tag-update',
    'Мероприятие':  'tag-event',
    'Свой Вариант': 'tag-custom'
};
const TAG_ICONS = {
    'Важно':        '🔴',
    'Обновление':   '⚙️',
    'Мероприятие':  '🎉',
    'Свой Вариант': '✏️'
};
 
window.loadNews = async function() {
    const feed = document.getElementById('news-feed');
    feed.innerHTML = `<div class="empty"><div class="empty-icon">⏳</div><p>Загрузка...</p></div>`;
    try {
        const res  = await fetch(`${SUPABASE_URL}/rest/v1/news?order=created_at.desc`, { headers: H });
        const news = await res.json();
        if (!news.length) {
            feed.innerHTML = `<div class="empty"><div class="empty-icon">📭</div><p>Новостей пока нет</p></div>`;
            return;
        }
        const canDelete = window.currentUser && ADMIN_ROLES.includes(window.currentUser.role);
        feed.innerHTML = news.map(n => {
            const tagCls  = TAG_CLASSES[n.tag] || 'tag-custom';
            const tagIcon = TAG_ICONS[n.tag]   || '📌';
            const date    = n.created_at ? new Date(n.created_at).toLocaleDateString('ru-RU') : '';
            return `
            <div class="news-card">
                <div class="news-meta">
                    <span class="tag ${tagCls}">${tagIcon} ${n.tag}</span>
                    <span class="news-date">${date}</span>
                </div>
                <h3>${n.title}</h3>
                <p>${n.text}</p>
                ${canDelete ? `<div style="border-top:1px solid var(--border);padding-top:12px;">
                    <button class="delete-news-btn" onclick="deleteNewsById(${n.id})">🗑 Удалить новость</button>
                </div>` : ''}
            </div>`;
        }).join('');
    } catch(e) {
        feed.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><p>Ошибка загрузки новостей</p></div>`;
    }
};
 
window.createNews = async function() {
    const title = document.getElementById('news-title').value.trim();
    const tag   = document.getElementById('news-tag').value;
    const text  = document.getElementById('news-text').value.trim();
    if (!title || !text) return toast('Заполните заголовок и текст!', 'error');
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/news`, {
            method: 'POST', headers: H,
            body: JSON.stringify({ title, tag, text })
        });
        if (!res.ok) return toast('Ошибка публикации. Проверьте таблицу news в Supabase.', 'error');
        document.getElementById('news-title').value = '';
        document.getElementById('news-text').value  = '';
        toast('Новость опубликована!');
        loadNews();
    } catch(e) { toast('Ошибка соединения', 'error'); }
};
 
window.deleteNewsById = async function(id) {
    if (!confirm('Удалить эту новость?')) return;
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/news?id=eq.${id}`, { method: 'DELETE', headers: H });
        toast('Новость удалена');
        loadNews();
    } catch(e) { toast('Ошибка', 'error'); }
};
 
// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateAuthZone();
    // Показать панель новостей для администраторов
    if (window.currentUser && ADMIN_ROLES.includes(window.currentUser.role)) {
        const p = document.getElementById('admin-news-panel');
        if (p) p.style.display = 'block';
    }
});
