// ═══════════════════════════════════════════════
//  NOVOSIBIRSK RP — app.js
// ═══════════════════════════════════════════════
 
const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const H = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
};
 
// Discord webhooks
const WEBHOOK_PASSPORT_LICENSE = "https://discord.com/api/webhooks/1512820632058986547/OniZFPqznfcU7vdI2vdRVWrpJ8k5JBL6v5BJZpLVLXYYa6p0TW5fs8TGuzklSAu18dlc";
const WEBHOOK_MEDBOOK          = "https://discord.com/api/webhooks/1512820863924310270/8NT6tTfotF0iOlfavrKNVeSN4BF3Z1WgTDEa8EoVHZiVfgdrXdH8EfVqBc1qSrvTqZyQ";
 
// Роли администрации (всё кроме Пользователь — считается не-юзером)
const ADMIN_RANKS = [
    "Пользователь",
    "Вице Мэр","Мэр","Модерация","Администрация",
    "Команда технического администрирования","Секретарь",
    "Ассистент Главного Владельца","Заместитель Главного Владельца","Главный Владелец"
];
const POLICE_FACTIONS = ["ФСБ","СОБР","Патрульная Полиция (ДПС)"];
 
window.currentUser = JSON.parse(localStorage.getItem('nrp_user') || 'null');
 
// ─── HELPERS ──────────────────────────────────
 
function isAdmin(u) { return u && u.role && u.role !== 'Пользователь'; }
function isPolice(u) { return u && POLICE_FACTIONS.includes(u.faction); }
 
function db(path, opts) {
    return fetch(SUPABASE_URL + '/rest/v1/' + path, { headers: H, ...opts }).then(r => r.json());
}
 
async function sendDiscordWebhook(url, embed) {
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
    } catch(e) { console.warn('Webhook error:', e); }
}
 
function notify(msg, ok = true) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;padding:14px 22px;border-radius:14px;font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:600;letter-spacing:0.5px;color:#fff;background:${ok?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)'};border:1px solid ${ok?'rgba(34,197,94,0.4)':'rgba(239,68,68,0.4)'};backdrop-filter:blur(12px);animation:slideIn 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.4)`;
    el.textContent = (ok ? '✓ ' : '✕ ') + msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}
 
// ─── NAV / TABS ───────────────────────────────
 
window.switchTab = function(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const t = document.getElementById('tab-' + tab);
    if (t) t.classList.add('active');
    const b = document.getElementById('nav-' + tab);
    if (b) b.classList.add('active');
    if (tab === 'news') loadNews();
    if (tab === 'profile') renderProfile();
    if (tab === 'portal') initPortal();
};
 
window.switchPortal = function(section) {
    document.querySelectorAll('[id^="portal-"]').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.portal-nav-btn').forEach(b => b.classList.remove('active'));
    const el = document.getElementById('portal-' + section);
    if (el) el.style.display = 'block';
    // активная кнопка
    document.querySelectorAll('.portal-nav-btn').forEach(b => {
        if (b.textContent.toLowerCase().includes(section.replace('-',' ').split(' ')[0].toLowerCase())) b.classList.add('active');
    });
    if (section === 'mydocs') loadMyDocs();
    if (section === 'admin-requests') loadAdminRequests();
    if (section === 'passports') loadPassports();
};
 
function initPortal() {
    // показать/скрыть спец-кнопки
    const btnAdmin = document.getElementById('btn-admin-requests');
    const btnPolice = document.getElementById('btn-passports');
    if (btnAdmin) btnAdmin.style.display = isAdmin(window.currentUser) ? '' : 'none';
    if (btnPolice) btnPolice.style.display = isPolice(window.currentUser) ? '' : 'none';
}
 
// ─── MODALS ───────────────────────────────────
 
window.openModal = function(id) {
    const m = document.getElementById('modal-' + id);
    if (m) m.classList.add('open');
    // автозаполнение никнейма
    if (window.currentUser) {
        const fields = ['passport-username','medbook-username','license-username',
                        'faction-username','court-plaintiff','gov-username','lawyer-username'];
        fields.forEach(f => { const el = document.getElementById(f); if (el) el.value = window.currentUser.username; });
    }
};
 
window.closeModal = function(id) {
    const m = document.getElementById('modal-' + id);
    if (m) m.classList.remove('open');
};
 
// Закрыть по клику вне
document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
    }
});
 
window.requireAuth = function(fn) {
    if (!window.currentUser) { notify('Войдите в аккаунт', false); openModal('auth'); return; }
    fn();
};
 
// ─── AUTH TABS ────────────────────────────────
 
window.switchAuthTab = function(tab) {
    document.getElementById('auth-login-form').style.display = tab === 'login' ? '' : 'none';
    document.getElementById('auth-register-form').style.display = tab === 'register' ? '' : 'none';
    document.getElementById('auth-tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('auth-tab-register').classList.toggle('active', tab === 'register');
};
 
// ─── REGISTER ─────────────────────────────────
 
window.handleRegister = async function() {
    const u = document.getElementById('reg-username').value.trim();
    const p = document.getElementById('reg-password').value;
    const p2 = document.getElementById('reg-password2').value;
    if (!u || !p) return notify('Заполните все поля', false);
    if (p !== p2) return notify('Пароли не совпадают', false);
    if (p.length < 4) return notify('Пароль минимум 4 символа', false);
    const exists = await db(`users?username=eq.${encodeURIComponent(u)}`);
    if (exists.length) return notify('Ник уже занят', false);
    const res = await db('users', {
        method: 'POST',
        body: JSON.stringify({ username: u, password: p, role: 'Пользователь', faction: '' })
    });
    if (res && res[0]) {
        window.currentUser = res[0];
        localStorage.setItem('nrp_user', JSON.stringify(res[0]));
        closeModal('auth');
        updateAuthZone();
        notify('Добро пожаловать, ' + u + '!');
        switchTab('profile');
    } else { notify('Ошибка регистрации', false); }
};
 
// ─── LOGIN ────────────────────────────────────
 
window.handleLogin = async function() {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    if (!u || !p) return notify('Заполните все поля', false);
    const users = await db(`users?username=eq.${encodeURIComponent(u)}`);
    if (!users.length) return notify('Пользователь не найден', false);
    if (users[0].password !== p) return notify('Неверный пароль', false);
    window.currentUser = users[0];
    localStorage.setItem('nrp_user', JSON.stringify(users[0]));
    closeModal('auth');
    updateAuthZone();
    notify('Добро пожаловать, ' + u + '!');
    renderProfile();
};
 
// ─── LOGOUT ───────────────────────────────────
 
window.logout = function() {
    localStorage.removeItem('nrp_user');
    window.currentUser = null;
    updateAuthZone();
    switchTab('main');
    notify('Вы вышли из аккаунта');
};
 
// ─── AUTH ZONE ────────────────────────────────
 
function updateAuthZone() {
    const zone = document.getElementById('auth-zone');
    if (!zone) return;
    if (window.currentUser) {
        zone.innerHTML = `<button onclick="switchTab('profile')" style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.05);border:1px solid var(--border);color:#fff;font-family:'Rajdhani',sans-serif;font-weight:600;font-size:14px;padding:8px 16px;border-radius:12px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
            <span style="width:30px;height:30px;border-radius:8px;background:rgba(0,245,255,0.15);border:1px solid rgba(0,245,255,0.3);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--cyan)">${window.currentUser.username.charAt(0).toUpperCase()}</span>
            ${window.currentUser.username}
        </button>`;
    } else {
        zone.innerHTML = `<button class="btn-primary" onclick="openModal('auth')">Войти</button>`;
    }
}
 
// ─── PROFILE ──────────────────────────────────
 
window.renderProfile = function() {
    const guest = document.getElementById('profile-guest');
    const user = document.getElementById('profile-user');
    const adminP = document.getElementById('admin-users-panel');
    const adminNews = document.getElementById('admin-news-panel');
    if (!guest || !user) return;
 
    if (!window.currentUser) {
        guest.style.display = '';
        user.style.display = 'none';
        if (adminP) adminP.style.display = 'none';
        if (adminNews) adminNews.style.display = 'none';
        return;
    }
 
    guest.style.display = 'none';
    user.style.display = '';
 
    document.getElementById('profile-avatar').textContent = window.currentUser.username.charAt(0).toUpperCase();
    document.getElementById('profile-username').textContent = window.currentUser.username;
    document.getElementById('profile-role').textContent = window.currentUser.role || 'Пользователь';
    const pp = document.getElementById('profile-password');
    if (pp) { pp.dataset.real = window.currentUser.password; pp.textContent = '••••••••'; }
 
    if (isAdmin(window.currentUser)) {
        if (adminP) adminP.style.display = '';
        if (adminNews) adminNews.style.display = '';
        loadUsersTable();
    } else {
        if (adminP) adminP.style.display = 'none';
        if (adminNews) adminNews.style.display = 'none';
    }
};
 
window.togglePassword = function() {
    const el = document.getElementById('profile-password');
    const btn = document.getElementById('toggle-pass-btn');
    if (!el) return;
    if (el.textContent === '••••••••') {
        el.textContent = el.dataset.real;
        btn.textContent = 'СКРЫТЬ';
    } else {
        el.textContent = '••••••••';
        btn.textContent = 'ПОКАЗАТЬ';
    }
};
 
window.changePassword = async function() {
    const np = document.getElementById('new-password').value;
    const cp = document.getElementById('confirm-password').value;
    if (!np) return notify('Введите новый пароль', false);
    if (np.length < 4) return notify('Пароль минимум 4 символа', false);
    if (np !== cp) return notify('Пароли не совпадают', false);
    const res = await db(`users?id=eq.${window.currentUser.id}`, {
        method: 'PATCH', body: JSON.stringify({ password: np })
    });
    if (res) {
        window.currentUser.password = np;
        localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        notify('Пароль изменён!');
        renderProfile();
    }
};
 
// ─── USERS TABLE ──────────────────────────────
 
window.loadUsersTable = async function() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="padding:20px;text-align:center;color:var(--text)">Загрузка...</td></tr>';
    const users = await db('users?order=username.asc');
    if (!Array.isArray(users) || !users.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="padding:20px;text-align:center;color:var(--text)">Нет пользователей</td></tr>';
        return;
    }
    tbody.innerHTML = users.map(u => `
        <tr>
            <td style="padding:12px 16px;font-weight:600">${u.username}</td>
            <td style="padding:12px 16px;font-family:'JetBrains Mono',monospace;font-size:13px;color:#94a3b8">${u.password}</td>
            <td style="padding:12px 16px">
                <select onchange="changeRole(${u.id},this.value)" style="background:#1e293b;border:1px solid var(--border);color:#fff;padding:5px 10px;border-radius:8px;font-size:13px;font-family:'Rajdhani',sans-serif">
                    ${ADMIN_RANKS.map(r => `<option value="${r}" ${u.role===r?'selected':''}>${r}</option>`).join('')}
                </select>
            </td>
            <td style="padding:12px 16px">
                <button onclick="deleteUser(${u.id})" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;padding:6px 14px;border-radius:8px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600">Удалить</button>
            </td>
        </tr>
    `).join('');
};
 
window.changeRole = async function(id, role) {
    await db(`users?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ role }) });
    notify('Роль обновлена');
    loadUsersTable();
};
 
window.deleteUser = async function(id) {
    if (!confirm('Удалить этого пользователя?')) return;
    await db(`users?id=eq.${id}`, { method: 'DELETE' });
    notify('Пользователь удалён');
    loadUsersTable();
};
 
// ─── NEWS ─────────────────────────────────────
 
const TAG_STYLES = {
    'Важно':       'tag-important',
    'Обновление':  'tag-update',
    'Мероприятие': 'tag-event',
    'Свой Вариант':'tag-custom'
};
const TAG_ICONS = { 'Важно':'🔴','Обновление':'⚙️','Мероприятие':'🎉','Свой Вариант':'✏️' };
 
window.loadNews = async function() {
    const feed = document.getElementById('news-feed');
    if (!feed) return;
    feed.innerHTML = '<div class="loading-text">Загрузка новостей...</div>';
    const news = await db('news?order=created_at.desc');
    if (!Array.isArray(news) || !news.length) {
        feed.innerHTML = '<div class="loading-text" style="opacity:0.5">Новостей пока нет</div>';
        return;
    }
    feed.innerHTML = news.map(n => {
        const tc = TAG_STYLES[n.tag] || 'tag-custom';
        const ti = TAG_ICONS[n.tag] || '📌';
        const date = n.created_at ? new Date(n.created_at).toLocaleDateString('ru-RU') : '';
        const del = isAdmin(window.currentUser)
            ? `<button onclick="deleteNews(${n.id})" style="background:none;border:none;color:#f87171;font-family:'Rajdhani',sans-serif;font-size:13px;cursor:pointer;margin-top:12px;padding:0;letter-spacing:0.5px">🗑 Удалить новость</button>` : '';
        return `<div class="news-card">
            <span class="news-tag ${tc}">${ti} ${n.tag}</span>
            <div class="news-title">${n.title}</div>
            <div class="news-text">${n.text}</div>
            <div class="news-date">${date}</div>
            ${del}
        </div>`;
    }).join('');
};
 
window.createNews = async function() {
    const title = document.getElementById('news-title').value.trim();
    const tag   = document.getElementById('news-tag').value;
    const text  = document.getElementById('news-text').value.trim();
    if (!title || !text) return notify('Заполните заголовок и текст', false);
    const res = await db('news', { method: 'POST', body: JSON.stringify({ title, tag, text }) });
    if (res) {
        document.getElementById('news-title').value = '';
        document.getElementById('news-text').value = '';
        notify('Новость опубликована');
        loadNews();
    }
};
 
window.deleteNews = async function(id) {
    if (!confirm('Удалить новость?')) return;
    await db(`news?id=eq.${id}`, { method: 'DELETE' });
    notify('Новость удалена');
    loadNews();
};
 
// ─── PORTAL FORMS ─────────────────────────────
 
window.submitForm = async function(type) {
    let data = {};
    let webhookUrl = WEBHOOK_PASSPORT_LICENSE;
    let embedColor = 0x00f5ff;
    let embedTitle = '';
    let embedFields = [];
 
    if (type === 'passport') {
        const u = document.getElementById('passport-username').value.trim();
        const n = document.getElementById('passport-name').value.trim();
        const d = document.getElementById('passport-dob').value;
        const b = document.getElementById('passport-birthplace').value.trim();
        const a = document.getElementById('passport-address').value.trim();
        if (!u || !n || !d || !b || !a) return notify('Заполните все поля', false);
        data = { type: 'passport', username: u, char_name: n, dob: d, birthplace: b, address: a, status: 'pending', user_id: window.currentUser?.id };
        embedTitle = '🪪 Новая заявка на Паспорт';
        embedColor = 0x00f5ff;
        embedFields = [
            { name: '👤 Игрок', value: u, inline: true },
            { name: '📛 Имя персонажа', value: n, inline: true },
            { name: '🎂 Дата рождения', value: d, inline: true },
            { name: '📍 Место рождения', value: b, inline: true },
            { name: '🏠 Адрес', value: a, inline: false },
        ];
        webhookUrl = WEBHOOK_PASSPORT_LICENSE;
 
    } else if (type === 'medbook') {
        const u = document.getElementById('medbook-username').value.trim();
        const n = document.getElementById('medbook-name').value.trim();
        const r = document.getElementById('medbook-reason').value;
        const nt = document.getElementById('medbook-note').value.trim();
        if (!u || !n) return notify('Заполните все поля', false);
        data = { type: 'medbook', username: u, char_name: n, reason: r, note: nt, status: 'pending', user_id: window.currentUser?.id };
        embedTitle = '🏥 Новая заявка на Мед. книжку';
        embedColor = 0x22c55e;
        embedFields = [
            { name: '👤 Игрок', value: u, inline: true },
            { name: '📛 Имя персонажа', value: n, inline: true },
            { name: '📋 Цель', value: r, inline: false },
            { name: '💬 Примечание', value: nt || '—', inline: false },
        ];
        webhookUrl = WEBHOOK_MEDBOOK;
 
    } else if (type === 'license') {
        const u = document.getElementById('license-username').value.trim();
        const n = document.getElementById('license-name').value.trim();
        const t = document.getElementById('license-type').value;
        const r = document.getElementById('license-reason').value.trim();
        if (!u || !n || !r) return notify('Заполните все поля', false);
        data = { type: 'license', username: u, char_name: n, weapon_type: t, reason: r, status: 'pending', user_id: window.currentUser?.id };
        embedTitle = '🔫 Новая заявка на Лицензию';
        embedColor = 0xf59e0b;
        embedFields = [
            { name: '👤 Игрок', value: u, inline: true },
            { name: '📛 Имя персонажа', value: n, inline: true },
            { name: '🔫 Тип оружия', value: t, inline: true },
            { name: '📋 Причина', value: r, inline: false },
        ];
        webhookUrl = WEBHOOK_PASSPORT_LICENSE;
 
    } else if (type === 'faction-join') {
        const u = document.getElementById('faction-username').value.trim();
        const f = document.getElementById('faction-name').value;
        const r = document.getElementById('faction-reason').value.trim();
        const ex = document.getElementById('faction-exp').value.trim();
        if (!u || !r) return notify('Заполните все поля', false);
        data = { type: 'faction_join', username: u, faction: f, reason: r, experience: ex, status: 'pending', user_id: window.currentUser?.id };
        embedTitle = '🏛️ Заявление во фракцию';
        embedColor = 0x8b5cf6;
        embedFields = [
            { name: '👤 Игрок', value: u, inline: true },
            { name: '🏛️ Фракция', value: f, inline: true },
            { name: '💬 Мотивация', value: r, inline: false },
            { name: '🎮 Опыт', value: ex || '—', inline: false },
        ];
        webhookUrl = WEBHOOK_PASSPORT_LICENSE;
 
    } else if (type === 'court') {
        const pl = document.getElementById('court-plaintiff').value.trim();
        const df = document.getElementById('court-defendant').value.trim();
        const cl = document.getElementById('court-claim').value.trim();
        const ev = document.getElementById('court-evidence').value.trim();
        if (!pl || !df || !cl) return notify('Заполните все поля', false);
        data = { type: 'court', username: pl, defendant: df, claim: cl, evidence: ev, status: 'pending', user_id: window.currentUser?.id };
        embedTitle = '⚖️ Новый судебный иск';
        embedColor = 0xef4444;
        embedFields = [
            { name: '📋 Истец', value: pl, inline: true },
            { name: '📋 Ответчик', value: df, inline: true },
            { name: '📜 Суть иска', value: cl, inline: false },
            { name: '🔍 Доказательства', value: ev || '—', inline: false },
        ];
        webhookUrl = WEBHOOK_PASSPORT_LICENSE;
 
    } else if (type === 'government') {
        const u = document.getElementById('gov-username').value.trim();
        const t = document.getElementById('gov-type').value;
        const tx = document.getElementById('gov-text').value.trim();
        if (!u || !tx) return notify('Заполните все поля', false);
        data = { type: 'government', username: u, request_type: t, text: tx, status: 'pending', user_id: window.currentUser?.id };
        embedTitle = '📋 Обращение в Правительство';
        embedColor = 0x0ea5e9;
        embedFields = [
            { name: '👤 Игрок', value: u, inline: true },
            { name: '📋 Тема', value: t, inline: true },
            { name: '💬 Текст', value: tx, inline: false },
        ];
        webhookUrl = WEBHOOK_PASSPORT_LICENSE;
 
    } else if (type === 'lawyer') {
        const u = document.getElementById('lawyer-username').value.trim();
        const s = document.getElementById('lawyer-situation').value;
        const tx = document.getElementById('lawyer-text').value.trim();
        if (!u || !tx) return notify('Заполните все поля', false);
        data = { type: 'lawyer', username: u, situation: s, text: tx, status: 'pending', user_id: window.currentUser?.id };
        embedTitle = '👨‍⚖️ Запрос к Адвокату';
        embedColor = 0x22c55e;
        embedFields = [
            { name: '👤 Игрок', value: u, inline: true },
            { name: '⚠️ Ситуация', value: s, inline: true },
            { name: '💬 Описание', value: tx, inline: false },
        ];
        webhookUrl = WEBHOOK_MEDBOOK;
    }
 
    // Сохраняем в Supabase
    await db('requests', { method: 'POST', body: JSON.stringify(data) });
 
    // Отправляем в Discord
    await sendDiscordWebhook(webhookUrl, {
        title: embedTitle,
        color: embedColor,
        fields: embedFields,
        footer: { text: 'Novosibirsk RP • Ожидает рассмотрения' },
        timestamp: new Date().toISOString()
    });
 
    closeModal(type);
    notify('Заявка отправлена! Ожидайте рассмотрения.');
};
 
// ─── MY DOCS ──────────────────────────────────
 
window.loadMyDocs = async function() {
    const guestDiv = document.getElementById('mydocs-guest');
    const listDiv  = document.getElementById('mydocs-list');
    if (!window.currentUser) {
        if (guestDiv) guestDiv.style.display = '';
        if (listDiv)  listDiv.innerHTML = '';
        return;
    }
    if (guestDiv) guestDiv.style.display = 'none';
    if (!listDiv) return;
    listDiv.innerHTML = '<div class="loading-text">Загрузка...</div>';
 
    const reqs = await db(`requests?user_id=eq.${window.currentUser.id}&order=created_at.desc`);
 
    if (!Array.isArray(reqs) || !reqs.length) {
        listDiv.innerHTML = '<div class="loading-text" style="opacity:0.5">У вас нет заявок</div>';
        return;
    }
 
    const typeLabels = {
        passport: '🪪 Паспорт', medbook: '🏥 Мед. книжка', license: '🔫 Лицензия',
        faction_join: '🏛️ Вступление во фракцию', court: '⚖️ Судебный иск',
        government: '📋 Обращение в правительство', lawyer: '👨‍⚖️ Адвокат'
    };
 
    listDiv.innerHTML = reqs.map(r => {
        const badge = r.status === 'approved' ? '<span class="badge badge-approved">✓ Одобрено</span>'
                    : r.status === 'rejected' ? '<span class="badge badge-rejected">✕ Отклонено</span>'
                    : '<span class="badge badge-pending">⏳ На рассмотрении</span>';
        const date = r.created_at ? new Date(r.created_at).toLocaleDateString('ru-RU') : '';
        return `<div class="doc-card">
            <div style="display:flex;align-items:center;gap:14px">
                <div class="doc-icon">${(typeLabels[r.type] || '📄').charAt(0)}</div>
                <div>
                    <div style="font-weight:700;color:#fff;font-size:16px">${typeLabels[r.type] || r.type}</div>
                    <div style="color:var(--text);font-size:13px;margin-top:2px">${date}</div>
                </div>
            </div>
            ${badge}
        </div>`;
    }).join('');
};
 
// ─── ADMIN REQUESTS ───────────────────────────
 
window.loadAdminRequests = async function() {
    const listEl   = document.getElementById('admin-requests-list');
    const loadEl   = document.getElementById('requests-loading');
    if (!isAdmin(window.currentUser)) return;
    if (loadEl) loadEl.style.display = '';
    if (listEl) listEl.innerHTML = '';
 
    const reqs = await db('requests?status=eq.pending&order=created_at.desc');
    if (loadEl) loadEl.style.display = 'none';
    if (!Array.isArray(reqs) || !reqs.length) {
        if (listEl) listEl.innerHTML = '<div class="loading-text" style="opacity:0.5">Новых заявок нет</div>';
        return;
    }
 
    const typeLabels = {
        passport: '🪪 Паспорт', medbook: '🏥 Мед. книжка', license: '🔫 Лицензия',
        faction_join: '🏛️ Вступление во фракцию', court: '⚖️ Судебный иск',
        government: '📋 Обращение в правительство', lawyer: '👨‍⚖️ Адвокат'
    };
 
    listEl.innerHTML = reqs.map(r => {
        const date = r.created_at ? new Date(r.created_at).toLocaleDateString('ru-RU') : '';
        // Формируем читаемые данные
        const details = Object.entries(r)
            .filter(([k]) => !['id','type','status','user_id','created_at'].includes(k))
            .map(([k, v]) => v ? `<b>${k}:</b> ${v}` : null)
            .filter(Boolean).join('<br>');
        return `<div class="request-card">
            <div class="request-type">${typeLabels[r.type] || r.type} • ${date}</div>
            <div class="request-player">${r.username || '—'}</div>
            <div class="request-data">${details}</div>
            <div class="request-actions">
                <button class="btn-approve" onclick="reviewRequest(${r.id},'approved')">✓ Одобрить</button>
                <button class="btn-reject"  onclick="reviewRequest(${r.id},'rejected')">✕ Отклонить</button>
            </div>
        </div>`;
    }).join('');
};
 
window.reviewRequest = async function(id, status) {
    await db(`requests?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
 
    // Отправить уведомление в Discord
    const emoji = status === 'approved' ? '✅' : '❌';
    const label = status === 'approved' ? 'Одобрено' : 'Отклонено';
    await sendDiscordWebhook(WEBHOOK_PASSPORT_LICENSE, {
        title: `${emoji} Заявка ${label}`,
        color: status === 'approved' ? 0x22c55e : 0xef4444,
        description: `Администратор **${window.currentUser.username}** ${label.toLowerCase()} заявку #${id}`,
        footer: { text: 'Novosibirsk RP' },
        timestamp: new Date().toISOString()
    });
 
    notify(label + '!');
    loadAdminRequests();
};
 
// ─── POLICE: PASSPORTS ────────────────────────
 
window.loadPassports = async function() {
    const listEl  = document.getElementById('passports-list');
    const loadEl  = document.getElementById('passports-loading');
    if (!isPolice(window.currentUser) && !isAdmin(window.currentUser)) return;
    if (loadEl) loadEl.style.display = '';
 
    const reqs = await db("requests?type=eq.passport&status=eq.approved&order=created_at.desc");
    if (loadEl) loadEl.style.display = 'none';
    if (!Array.isArray(reqs) || !reqs.length) {
        if (listEl) listEl.innerHTML = '<div class="loading-text" style="opacity:0.5">Одобренных паспортов нет</div>';
        return;
    }
    listEl.innerHTML = reqs.map(r => `
        <div class="doc-card" style="flex-direction:column;align-items:flex-start;gap:10px">
            <div style="display:flex;justify-content:space-between;width:100%;align-items:center">
                <div style="font-weight:700;color:#fff;font-size:16px">🪪 ${r.char_name || r.username}</div>
                <span class="badge badge-approved">✓ Действителен</span>
            </div>
            <div style="color:var(--text);font-size:14px;line-height:1.8">
                <b>Игрок:</b> ${r.username}<br>
                <b>Дата рождения:</b> ${r.dob || '—'}<br>
                <b>Место рождения:</b> ${r.birthplace || '—'}<br>
                <b>Адрес:</b> ${r.address || '—'}
            </div>
        </div>
    `).join('');
};
 
// ─── INIT ─────────────────────────────────────
 
document.addEventListener('DOMContentLoaded', () => {
    updateAuthZone();
    renderProfile();
    loadNews();
 
    // Enter key для форм
    document.getElementById('login-password')?.addEventListener('keydown', e => { if(e.key==='Enter') handleLogin(); });
    document.getElementById('reg-password2')?.addEventListener('keydown', e => { if(e.key==='Enter') handleRegister(); });
});
 
