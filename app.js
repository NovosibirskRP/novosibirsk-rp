// ═══════════════════════════════════════════════
//  NOVOSIBIRSK RP — app.js v3.0
// ═══════════════════════════════════════════════

const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const H = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
};

const WEBHOOK_PASSPORT_LICENSE = "https://discord.com/api/webhooks/1512820632058986547/OniZFPqznfcU7vdI2vdRVWrpJ8k5JBL6v5BJZpLVLXYYa6p0TW5fs8TGuzklSAu18dlc";
const WEBHOOK_MEDBOOK           = "https://discord.com/api/webhooks/1512820863924310270/8NT6tTfotF0iOlfavrKNVeSN4BF3Z1WgTDEa8EoVHZiVfgdrXdH8EfVqBc1qSrvTqZyQ";

const WEBHOOK_BY_TYPE = {
    passport:     WEBHOOK_PASSPORT_LICENSE,
    license:      WEBHOOK_PASSPORT_LICENSE,
    medbook:      WEBHOOK_MEDBOOK,
    faction_join: WEBHOOK_MEDBOOK,
    court:        WEBHOOK_MEDBOOK,
    government:   WEBHOOK_PASSPORT_LICENSE,
    lawyer:       WEBHOOK_MEDBOOK,
};

const ADMIN_RANKS = [
    "Пользователь",
    "Вице Мэр","Мэр","Модерация","Администрация",
    "Команда технического администрирования","Секретарь",
    "Ассистент Главного Владельца","Заместитель Главного Владельца","Главный Владелец"
];
const POLICE_FACTIONS = ["ФСБ","СОБР","Патрульная Полиция (ДПС)"];
const MEDIC_FACTIONS  = ["МЧС"];

const EXPIRY_DAYS_DEFAULT = { passport: 30, medbook: 60, license: 14 };

window.currentUser = JSON.parse(localStorage.getItem('nrp_user') || 'null');

// ─── HELPERS ──────────────────────────────────

function isAdmin(u)  { return u && u.role && u.role !== 'Пользователь'; }
function isPolice(u) { return u && POLICE_FACTIONS.includes(u.faction); }
function isMedic(u)  { return u && MEDIC_FACTIONS.includes(u.faction); }
function canManageDocs(u) { return isAdmin(u) || isPolice(u); }

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
    el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;padding:14px 22px;border-radius:14px;font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:600;letter-spacing:0.5px;color:#fff;background:${ok?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)'};border:1px solid ${ok?'rgba(34,197,94,0.4)':'rgba(239,68,68,0.4)'};backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.4);transition:all 0.3s`;
    el.textContent = (ok ? '✓ ' : '✕ ') + msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity='0'; setTimeout(()=>el.remove(),300); }, 3200);
}

// ─── NAV ──────────────────────────────────────

window.switchTab = function(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const t = document.getElementById('tab-' + tab);
    if (t) t.classList.add('active');
    const b = document.getElementById('nav-' + tab);
    if (b) b.classList.add('active');
    if (tab === 'news')    loadNews();
    if (tab === 'profile') renderProfile();
    if (tab === 'portal')  initPortal();
};

window.switchPortal = function(section) {
    document.querySelectorAll('[id^="portal-"]').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.portal-nav-btn').forEach(b => b.classList.remove('active'));
    const el = document.getElementById('portal-' + section);
    if (el) el.style.display = 'block';
    document.querySelectorAll('.portal-nav-btn').forEach(b => {
        if (b.dataset.section === section) b.classList.add('active');
    });
    if (section === 'mydocs')          loadMyDocs();
    if (section === 'admin-requests')  loadAdminRequests();
    if (section === 'passports')       loadPassports();
};

function initPortal() {
    const btnAdmin  = document.getElementById('btn-admin-requests');
    const btnDocs   = document.getElementById('btn-passports');
    if (btnAdmin) btnAdmin.style.display = isAdmin(window.currentUser) ? '' : 'none';
    const canSeeDocs = canManageDocs(window.currentUser) || isMedic(window.currentUser);
    if (btnDocs) {
        btnDocs.style.display = canSeeDocs ? '' : 'none';
        btnDocs.textContent = (isMedic(window.currentUser) && !canManageDocs(window.currentUser))
            ? '🏥 Мед. книжки' : '📋 Документы';
    }
}

// ─── MODALS ───────────────────────────────────

window.openModal = function(id) {
    const m = document.getElementById('modal-' + id);
    if (m) m.classList.add('open');
    if (window.currentUser) {
        ['passport','medbook','license','faction','court','gov','lawyer'].forEach(p => {
            const el = document.getElementById(p + '-username');
            if (el) el.value = window.currentUser.username;
        });
    }
};

window.closeModal = function(id) {
    const m = document.getElementById('modal-' + id);
    if (m) m.classList.remove('open');
};

document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});

window.requireAuth = function(fn) {
    if (!window.currentUser) { notify('Войдите в аккаунт', false); openModal('auth'); return; }
    fn();
};

window.showComingSoon = function() { openModal('coming-soon'); };

window.switchAuthTab = function(tab) {
    document.getElementById('auth-login-form').style.display    = tab === 'login'    ? '' : 'none';
    document.getElementById('auth-register-form').style.display = tab === 'register' ? '' : 'none';
    document.getElementById('auth-tab-login').classList.toggle('active',    tab === 'login');
    document.getElementById('auth-tab-register').classList.toggle('active', tab === 'register');
};

// ─── AUTH ─────────────────────────────────────

window.handleRegister = async function() {
    const u  = document.getElementById('reg-username').value.trim();
    const p  = document.getElementById('reg-password').value;
    const p2 = document.getElementById('reg-password2').value;
    if (!u || !p)    return notify('Заполните все поля', false);
    if (p !== p2)    return notify('Пароли не совпадают', false);
    if (p.length < 4) return notify('Пароль минимум 4 символа', false);
    const exists = await db(`users?username=eq.${encodeURIComponent(u)}`);
    if (exists.length) return notify('Ник уже занят', false);
    const res = await db('users', { method:'POST', body: JSON.stringify({ username:u, password:p, role:'Пользователь', faction:'' }) });
    if (res && res[0]) {
        window.currentUser = res[0];
        localStorage.setItem('nrp_user', JSON.stringify(res[0]));
        closeModal('auth'); updateAuthZone(); notify('Добро пожаловать, ' + u + '!');
        switchTab('profile');
    } else notify('Ошибка регистрации', false);
};

window.handleLogin = async function() {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    if (!u || !p) return notify('Заполните все поля', false);
    const users = await db(`users?username=eq.${encodeURIComponent(u)}`);
    if (!users.length)         return notify('Пользователь не найден', false);
    if (users[0].password !== p) return notify('Неверный пароль', false);
    window.currentUser = users[0];
    localStorage.setItem('nrp_user', JSON.stringify(users[0]));
    closeModal('auth'); updateAuthZone(); notify('Добро пожаловать, ' + u + '!'); renderProfile();
};

window.logout = function() {
    localStorage.removeItem('nrp_user');
    window.currentUser = null;
    updateAuthZone(); switchTab('main'); notify('Вы вышли из аккаунта');
};

function updateAuthZone() {
    const zone = document.getElementById('auth-zone');
    if (!zone) return;
    if (window.currentUser) {
        zone.innerHTML = `<button onclick="switchTab('profile')" style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.05);border:1px solid var(--border);color:#fff;font-family:'Rajdhani',sans-serif;font-weight:600;font-size:14px;padding:8px 16px;border-radius:12px;cursor:pointer">
            <span style="width:30px;height:30px;border-radius:8px;background:rgba(0,245,255,0.15);border:1px solid rgba(0,245,255,0.3);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--cyan)">${window.currentUser.username.charAt(0).toUpperCase()}</span>
            ${window.currentUser.username}
        </button>`;
    } else {
        zone.innerHTML = `<button class="btn-primary" onclick="openModal('auth')">Войти</button>`;
    }
}

// ─── PROFILE ──────────────────────────────────

window.renderProfile = function() {
    const guest  = document.getElementById('profile-guest');
    const user   = document.getElementById('profile-user');
    const adminP = document.getElementById('admin-users-panel');
    const adminN = document.getElementById('admin-news-panel');
    if (!guest || !user) return;
    if (!window.currentUser) {
        guest.style.display = ''; user.style.display = 'none';
        if (adminP) adminP.style.display = 'none';
        if (adminN) adminN.style.display = 'none';
        return;
    }
    guest.style.display = 'none'; user.style.display = '';
    document.getElementById('profile-avatar').textContent   = window.currentUser.username.charAt(0).toUpperCase();
    document.getElementById('profile-username').textContent = window.currentUser.username;
    document.getElementById('profile-role').textContent     = window.currentUser.role || 'Пользователь';
    const pp = document.getElementById('profile-password');
    if (pp) { pp.dataset.real = window.currentUser.password; pp.textContent = '••••••••'; }
    if (isAdmin(window.currentUser)) {
        if (adminP) adminP.style.display = '';
        if (adminN) adminN.style.display = '';
        loadUsersTable();
    } else {
        if (adminP) adminP.style.display = 'none';
        if (adminN) adminN.style.display = 'none';
    }
};

window.togglePassword = function() {
    const el  = document.getElementById('profile-password');
    const btn = document.getElementById('toggle-pass-btn');
    if (!el) return;
    if (el.textContent === '••••••••') { el.textContent = el.dataset.real; btn.textContent = 'СКРЫТЬ'; }
    else { el.textContent = '••••••••'; btn.textContent = 'ПОКАЗАТЬ'; }
};

window.changePassword = async function() {
    const np = document.getElementById('new-password').value;
    const cp = document.getElementById('confirm-password').value;
    if (!np)          return notify('Введите новый пароль', false);
    if (np.length < 4) return notify('Пароль минимум 4 символа', false);
    if (np !== cp)    return notify('Пароли не совпадают', false);
    await db(`users?id=eq.${window.currentUser.id}`, { method:'PATCH', body: JSON.stringify({ password:np }) });
    window.currentUser.password = np;
    localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    notify('Пароль изменён!'); renderProfile();
};

// ─── USERS TABLE ──────────────────────────────

const ALL_FACTIONS = ['—','ФСБ','СОБР','Патрульная Полиция (ДПС)','Прокуратура','Адвокатура','Верховный Суд','ГТРК','МЧС','ОПГ (RUCH)','Правительство'];
const SEL = `background:#1e293b;border:1px solid var(--border);color:#fff;padding:5px 8px;border-radius:8px;font-size:12px;font-family:'Rajdhani',sans-serif;max-width:160px`;

window.loadUsersTable = async function() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" style="padding:20px;text-align:center;color:var(--text)">Загрузка...</td></tr>`;
    const users = await db('users?order=username.asc');
    if (!Array.isArray(users) || !users.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding:20px;text-align:center;color:var(--text)">Нет пользователей</td></tr>`;
        return;
    }
    tbody.innerHTML = users.map(u => `
        <tr>
            <td style="padding:10px 14px;font-weight:600;color:#fff">${u.username}</td>
            <td style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#64748b">${u.password}</td>
            <td style="padding:10px 14px">
                <select onchange="changeRole(${u.id},this.value)" style="${SEL}">
                    ${ADMIN_RANKS.map(r=>`<option value="${r}" ${u.role===r?'selected':''}>${r}</option>`).join('')}
                </select>
            </td>
            <td style="padding:10px 14px">
                <select onchange="changeFaction(${u.id},this.value)" style="${SEL}">
                    ${ALL_FACTIONS.map(f=>`<option value="${f==='—'?'':f}" ${(u.faction||'')===(f==='—'?'':f)?'selected':''}>${f}</option>`).join('')}
                </select>
            </td>
            <td style="padding:10px 14px">
                <button onclick="deleteUser(${u.id})" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;padding:5px 12px;border-radius:8px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:600">Удалить</button>
            </td>
        </tr>`).join('');
};

window.changeRole = async function(id, role) {
    await db(`users?id=eq.${id}`, { method:'PATCH', body: JSON.stringify({ role }) });
    notify('Роль обновлена');
};
window.changeFaction = async function(id, faction) {
    await db(`users?id=eq.${id}`, { method:'PATCH', body: JSON.stringify({ faction }) });
    if (window.currentUser && window.currentUser.id === id) {
        window.currentUser.faction = faction;
        localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
    }
    notify('Фракция обновлена');
};
window.deleteUser = async function(id) {
    if (!confirm('Удалить пользователя?')) return;
    await db(`users?id=eq.${id}`, { method:'DELETE' });
    notify('Пользователь удалён'); loadUsersTable();
};

// ─── NEWS ─────────────────────────────────────

const TAG_STYLES = { 'Важно':'tag-important','Обновление':'tag-update','Мероприятие':'tag-event','Свой Вариант':'tag-custom' };
const TAG_ICONS  = { 'Важно':'🔴','Обновление':'⚙️','Мероприятие':'🎉','Свой Вариант':'✏️' };

window.loadNews = async function() {
    const feed = document.getElementById('news-feed');
    if (!feed) return;
    feed.innerHTML = '<div class="loading-text">Загрузка...</div>';
    const news = await db('news?order=created_at.desc');
    if (!Array.isArray(news) || !news.length) {
        feed.innerHTML = '<div class="loading-text" style="opacity:0.5">Новостей пока нет</div>'; return;
    }
    feed.innerHTML = news.map(n => {
        const tc   = TAG_STYLES[n.tag] || 'tag-custom';
        const ti   = TAG_ICONS[n.tag]  || '📌';
        const date = n.created_at ? new Date(n.created_at).toLocaleDateString('ru-RU') : '';
        const del  = isAdmin(window.currentUser)
            ? `<button onclick="deleteNews(${n.id})" style="background:none;border:none;color:#f87171;font-family:'Rajdhani',sans-serif;font-size:13px;cursor:pointer;margin-top:12px;padding:0">🗑 Удалить</button>` : '';
        return `<div class="news-card"><span class="news-tag ${tc}">${ti} ${n.tag}</span><div class="news-title">${n.title}</div><div class="news-text">${n.text}</div><div class="news-date">${date}</div>${del}</div>`;
    }).join('');
};

window.createNews = async function() {
    const title = document.getElementById('news-title').value.trim();
    const tag   = document.getElementById('news-tag').value;
    const text  = document.getElementById('news-text').value.trim();
    if (!title || !text) return notify('Заполните заголовок и текст', false);
    await db('news', { method:'POST', body: JSON.stringify({ title, tag, text }) });
    document.getElementById('news-title').value = '';
    document.getElementById('news-text').value  = '';
    notify('Новость опубликована'); loadNews();
};

window.deleteNews = async function(id) {
    if (!confirm('Удалить новость?')) return;
    await db(`news?id=eq.${id}`, { method:'DELETE' });
    notify('Удалено'); loadNews();
};

// ─── SUBMIT FORM ──────────────────────────────

window.submitForm = async function(type) {
    let data = {};

    if (type === 'passport') {
        const u   = document.getElementById('passport-username').value.trim();
        const n   = document.getElementById('passport-name').value.trim();
        const d   = document.getElementById('passport-dob').value;
        const job = document.getElementById('passport-job').value.trim();
        const gen = document.getElementById('passport-gender').value;
        const bio = document.getElementById('passport-bio').value.trim();
        const adr = document.getElementById('passport-address').value.trim();
        const sgn = document.getElementById('passport-sign').value.trim();
        if (!u||!n||!d||!job||!gen) return notify('Заполните обязательные поля', false);
        data = { type:'passport', username:u, char_name:n, dob:d, address:job, reason:gen, note:bio, experience:adr, faction:sgn, status:'pending', user_id:window.currentUser?.id };

    } else if (type === 'medbook') {
        const u   = document.getElementById('medbook-username').value.trim();
        const n   = document.getElementById('medbook-name').value.trim();
        const dob = document.getElementById('medbook-dob').value;
        const job = document.getElementById('medbook-job').value.trim();
        const pos = document.getElementById('medbook-position').value.trim();
        const gl  = document.getElementById('medbook-goal').value.trim();
        const dis = document.getElementById('medbook-disease').value;
        const nt  = document.getElementById('medbook-note').value.trim();
        if (!u||!n||!job||!pos||!gl) return notify('Заполните обязательные поля', false);
        data = { type:'medbook', username:u, char_name:n, dob, address:job, reason:pos, note:gl+'|'+dis+(nt?'|'+nt:''), status:'pending', user_id:window.currentUser?.id };

    } else if (type === 'license') {
        const u   = document.getElementById('license-username').value.trim();
        const n   = document.getElementById('license-name').value.trim();
        const dob = document.getElementById('license-dob').value;
        const job = document.getElementById('license-job').value.trim();
        const fac = document.getElementById('license-faction').value;
        const rsn = document.getElementById('license-reason').value.trim();
        const wpn = document.getElementById('license-weapons').value;
        const sgn = document.getElementById('license-sign').value.trim();
        if (!u||!n||!job||!rsn) return notify('Заполните обязательные поля', false);
        data = { type:'license', username:u, char_name:n, dob, address:job, faction:fac, reason:rsn, weapon_type:wpn, note:sgn, status:'pending', user_id:window.currentUser?.id };

    } else if (type === 'faction-join') {
        const u   = document.getElementById('faction-username').value.trim();
        const rb  = document.getElementById('faction-roblox').value.trim();
        const rn  = document.getElementById('faction-realname').value.trim();
        const mb  = document.getElementById('faction-medbook').value;
        const fac = document.getElementById('faction-name').value;
        const bio = document.getElementById('faction-bio').value.trim();
        if (!u||!rb||!rn) return notify('Заполните обязательные поля', false);
        data = { type:'faction_join', username:u, char_name:rn, faction:fac, reason:rb, note:mb, experience:bio, status:'pending', user_id:window.currentUser?.id };

    } else if (type === 'court') {
        const pl = document.getElementById('court-plaintiff').value.trim();
        const df = document.getElementById('court-defendant').value.trim();
        const cl = document.getElementById('court-claim').value.trim();
        const ev = document.getElementById('court-evidence').value.trim();
        if (!pl||!df||!cl) return notify('Заполните обязательные поля', false);
        data = { type:'court', username:pl, defendant:df, claim:cl, evidence:ev, status:'pending', user_id:window.currentUser?.id };

    } else if (type === 'government') {
        const u  = document.getElementById('gov-username').value.trim();
        const t  = document.getElementById('gov-type').value;
        const tx = document.getElementById('gov-text').value.trim();
        if (!u||!tx) return notify('Заполните обязательные поля', false);
        data = { type:'government', username:u, request_type:t, text:tx, status:'pending', user_id:window.currentUser?.id };

    } else if (type === 'lawyer') {
        const u  = document.getElementById('lawyer-username').value.trim();
        const s  = document.getElementById('lawyer-situation').value;
        const tx = document.getElementById('lawyer-text').value.trim();
        if (!u||!tx) return notify('Заполните обязательные поля', false);
        data = { type:'lawyer', username:u, situation:s, text:tx, status:'pending', user_id:window.currentUser?.id };
    }

    await db('requests', { method:'POST', body: JSON.stringify(data) });
    closeModal(type);
    notify('Заявка отправлена! Ожидайте рассмотрения.');
};

// ─── EXPIRY HELPERS ───────────────────────────

function docExpiryLine(r) {
    const dt = r.expires_at;
    if (!dt) return '';
    const exp  = new Date(dt);
    const diff = Math.ceil((exp - new Date()) / 86400000);
    if (diff < 0)  return `<span class="badge badge-rejected" style="margin-top:6px;display:inline-flex">⏰ Истёк ${exp.toLocaleDateString('ru-RU')}</span>`;
    if (diff <= 5) return `<span class="badge badge-pending"  style="margin-top:6px;display:inline-flex">⚠️ До ${exp.toLocaleDateString('ru-RU')} (${diff} дн.)</span>`;
    return `<span class="badge badge-approved" style="margin-top:6px;display:inline-flex">📅 До ${exp.toLocaleDateString('ru-RU')}</span>`;
}

function expiryBadge(r) {
    if (!r.expires_at) return '';
    const exp  = new Date(r.expires_at);
    const diff = Math.ceil((exp - new Date()) / 86400000);
    if (diff < 0)  return `<span class="badge badge-rejected">⏰ Истёк</span>`;
    if (diff <= 5) return `<span class="badge badge-pending">⚠️ ${diff} дн.</span>`;
    return `<span class="badge badge-approved">📅 До ${exp.toLocaleDateString('ru-RU')}</span>`;
}

// ─── MY DOCS ──────────────────────────────────

window.loadMyDocs = async function() {
    const guestDiv = document.getElementById('mydocs-guest');
    const listDiv  = document.getElementById('mydocs-list');
    if (!window.currentUser) {
        if (guestDiv) guestDiv.style.display = '';
        if (listDiv)  listDiv.innerHTML = ''; return;
    }
    if (guestDiv) guestDiv.style.display = 'none';
    if (!listDiv) return;
    listDiv.innerHTML = '<div class="loading-text">Загрузка...</div>';
    const reqs = await db(`requests?user_id=eq.${window.currentUser.id}&order=created_at.desc`);
    if (!Array.isArray(reqs) || !reqs.length) {
        listDiv.innerHTML = '<div class="loading-text" style="opacity:0.5">У вас нет заявок</div>'; return;
    }
    const typeLabels = { passport:'🪪 Паспорт', medbook:'🏥 Мед. книжка', license:'🔫 Лицензия', faction_join:'🏛️ Вступление во фракцию', court:'⚖️ Судебный иск', government:'📋 Обращение в правительство', lawyer:'👨‍⚖️ Адвокат' };
    const typeIcons  = { passport:'🪪', medbook:'🏥', license:'🔫', faction_join:'🏛️', court:'⚖️', government:'📋', lawyer:'👨‍⚖️' };
    const canM = canManageDocs(window.currentUser);
    listDiv.innerHTML = reqs.map(r => {
        const sb   = r.status==='approved' ? '<span class="badge badge-approved">✓ Одобрено</span>'
                   : r.status==='rejected' ? '<span class="badge badge-rejected">✕ Отклонено</span>'
                   : '<span class="badge badge-pending">⏳ На рассмотрении</span>';
        const exp  = r.status==='approved' ? expiryBadge(r) : '';
        const date = r.created_at ? new Date(r.created_at).toLocaleDateString('ru-RU') : '';
        const btns = canM ? `<div style="display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
            <button onclick="deleteRequest(${r.id},'mydocs')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer">🗑 Удалить</button>
            ${r.status==='approved'?`<button onclick="setExpiry(${r.id},'mydocs')" style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);color:#fbbf24;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer">📅 Изменить срок</button>`:''}
        </div>` : '';
        return `<div class="doc-card" style="flex-direction:column;align-items:stretch;gap:0">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
                <div style="display:flex;align-items:center;gap:14px">
                    <div class="doc-icon">${typeIcons[r.type]||'📄'}</div>
                    <div><div style="font-weight:700;color:#fff;font-size:16px">${typeLabels[r.type]||r.type}</div>
                    <div style="color:var(--text);font-size:13px;margin-top:2px">${date} • ${r.char_name||r.username||''}</div></div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">${sb}${exp}</div>
            </div>${btns}</div>`;
    }).join('');
};

window.deleteRequest = async function(id, section) {
    if (!confirm('Удалить этот документ?')) return;
    await db(`requests?id=eq.${id}`, { method:'DELETE' });
    notify('Документ удалён');
    if (section==='passports') loadPassports(); else loadMyDocs();
};

window.setExpiry = async function(id, section) {
    const days = prompt('Установить срок годности (дней от сегодня):');
    if (!days || isNaN(days)) return;
    const exp = new Date();
    exp.setDate(exp.getDate() + parseInt(days));
    await db(`requests?id=eq.${id}`, { method:'PATCH', body: JSON.stringify({ expires_at: exp.toISOString() }) });
    notify(`Срок установлен до ${exp.toLocaleDateString('ru-RU')}`);
    if (section==='passports') loadPassports(); else loadMyDocs();
};

// ─── ADMIN REQUESTS ───────────────────────────

window.loadAdminRequests = async function() {
    const listEl = document.getElementById('admin-requests-list');
    const loadEl = document.getElementById('requests-loading');
    if (!isAdmin(window.currentUser)) return;
    if (loadEl) loadEl.style.display = '';
    if (listEl) listEl.innerHTML = '';
    const reqs = await db('requests?status=eq.pending&order=created_at.desc');
    if (loadEl) loadEl.style.display = 'none';
    if (!Array.isArray(reqs)||!reqs.length) {
        if (listEl) listEl.innerHTML = '<div class="loading-text" style="opacity:0.5">Новых заявок нет</div>'; return;
    }
    const typeNames = { passport:'🪪 Паспорт', medbook:'🏥 Мед. книжка', license:'🔫 Лицензия', faction_join:'🏛️ Вступление во фракцию', court:'⚖️ Судебный иск', government:'📋 Правительство', lawyer:'👨‍⚖️ Адвокат' };
    listEl.innerHTML = reqs.map(r => {
        const date    = r.created_at ? new Date(r.created_at).toLocaleDateString('ru-RU') : '';
        const details = Object.entries(r).filter(([k])=>!['id','type','status','user_id','created_at','expires_at'].includes(k)).map(([k,v])=>v?`<b>${k}:</b> ${v}`:null).filter(Boolean).join('<br>');
        // Поле для стоимости (UnbelievaBoat)
        const costField = `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
            <label style="font-size:11px;color:var(--text);letter-spacing:1px;text-transform:uppercase;display:block;margin-bottom:6px">💰 Стоимость (UnbelievaBoat)</label>
            <div style="display:flex;gap:8px;align-items:center">
                <input type="number" id="cost-${r.id}" placeholder="0" min="0" style="background:#0d1117;border:1px solid var(--border);color:#fff;padding:7px 12px;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:13px;width:120px;outline:none">
                <span style="color:var(--text);font-size:13px">€</span>
            </div>
        </div>`;
        return `<div class="request-card">
            <div class="request-type">${typeNames[r.type]||r.type} • ${date}</div>
            <div class="request-player">${r.username||'—'}</div>
            <div class="request-data">${details}</div>
            ${costField}
            <div class="request-actions">
                <button class="btn-approve" onclick="reviewRequest(${r.id},'approved')">✓ Одобрить</button>
                <button class="btn-reject"  onclick="reviewRequest(${r.id},'rejected')">✕ Отклонить</button>
            </div>
        </div>`;
    }).join('');
};

window.reviewRequest = async function(id, status) {
    const reqs = await db(`requests?id=eq.${id}`);
    const req  = reqs?.[0];
    if (!req) return notify('Заявка не найдена', false);

    const cost = document.getElementById('cost-' + id)?.value || '0';

    let expiresAt = null;
    if (status==='approved' && EXPIRY_DAYS_DEFAULT[req.type]) {
        const exp = new Date();
        exp.setDate(exp.getDate() + EXPIRY_DAYS_DEFAULT[req.type]);
        expiresAt = exp.toISOString();
    }

    await db(`requests?id=eq.${id}`, {
        method:'PATCH',
        body: JSON.stringify({ status, ...(expiresAt?{expires_at:expiresAt}:{}) })
    });

    const webhook    = WEBHOOK_BY_TYPE[req.type] || WEBHOOK_PASSPORT_LICENSE;
    const typeNames  = { passport:'🪪 Паспорт', medbook:'🏥 Мед. книжка', license:'🔫 Лицензия', faction_join:'🏛️ Вступление во фракцию', court:'⚖️ Судебный иск', government:'📋 Правительство', lawyer:'👨‍⚖️ Адвокат' };
    const emoji      = status==='approved' ? '✅' : '❌';
    const label      = status==='approved' ? 'ОДОБРЕНО' : 'ОТКЛОНЕНО';

    const dataFields = [];
    if (req.char_name)   dataFields.push({ name:'📛 ФИО',           value:req.char_name,   inline:true });
    if (req.dob)         dataFields.push({ name:'🎂 Дата рождения', value:req.dob,         inline:true });
    if (req.reason)      dataFields.push({ name:'ℹ️ Доп. инфо',     value:req.reason,      inline:true });
    if (req.address)     dataFields.push({ name:'💼 Место работы',  value:req.address,     inline:true });
    if (req.faction)     dataFields.push({ name:'🏛️ Фракция',       value:req.faction,     inline:true });
    if (req.weapon_type) dataFields.push({ name:'🔫 Оружие',        value:req.weapon_type, inline:true });
    if (req.note)        dataFields.push({ name:'📋 Примечание',    value:req.note,        inline:false });
    if (expiresAt)       dataFields.push({ name:'📅 Действителен до', value:new Date(expiresAt).toLocaleDateString('ru-RU'), inline:true });

    // Стоимость для UnbelievaBoat
    if (status==='approved' && cost && cost !== '0') {
        dataFields.push({ name:'💰 Стоимость', value:`${cost}€ — используй: \`/eco add ${req.username} ${cost}\``, inline:false });
    }

    await sendDiscordWebhook(webhook, {
        title:  `${emoji} ${typeNames[req.type]||req.type} — ${label}`,
        color:  status==='approved' ? 0x22c55e : 0xef4444,
        fields: [
            { name:'👤 Игрок',         value:req.username||'—',             inline:true },
            { name:'👮 Администратор', value:window.currentUser.username,   inline:true },
            ...dataFields
        ],
        footer:    { text:`Novosibirsk RP • ID: ${id}` },
        timestamp: new Date().toISOString()
    });

    notify(status==='approved' ? 'Одобрено!' : 'Отклонено!');
    loadAdminRequests();
};

// ─── DOCUMENTS VIEWER ─────────────────────────

function renderDocCard(r, fields, icon, section) {
    const expLine    = docExpiryLine(r);
    const isExpired  = r.expires_at && new Date(r.expires_at) < new Date();
    const statusBadge = isExpired
        ? '<span class="badge badge-rejected">⏰ Истёк</span>'
        : '<span class="badge badge-approved">✓ Действителен</span>';
    const canM = canManageDocs(window.currentUser);
    const btns = canM ? `<div style="display:flex;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
        <button onclick="deleteRequest(${r.id},'${section}')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer">🗑 Удалить</button>
        <button onclick="setExpiry(${r.id},'${section}')" style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);color:#fbbf24;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer">📅 Изменить срок</button>
    </div>` : '';
    return `<div class="doc-card" style="flex-direction:column;align-items:stretch;gap:0;${isExpired?'opacity:0.6':''}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;color:#fff">${icon} ${r.char_name||r.username}</div>
            <div style="text-align:right">${statusBadge}${expLine?'<br>'+expLine:''}</div>
        </div>
        <div style="color:var(--text);font-size:14px;line-height:1.9;margin-top:12px;border-top:1px solid var(--border);padding-top:12px">${fields}</div>
        ${btns}
    </div>`;
}

window.loadPassports = async function() {
    const listEl = document.getElementById('passports-list');
    const loadEl = document.getElementById('passports-loading');
    const u = window.currentUser;
    if (!u) return;
    const canSeeAll = isAdmin(u) || isPolice(u);
    const canMedbok = isMedic(u);
    if (!canSeeAll && !canMedbok) {
        if (listEl) listEl.innerHTML = '<div class="empty"><div class="empty-icon">🔒</div><p>Нет доступа</p></div>'; return;
    }
    if (loadEl) loadEl.style.display = '';
    let html = '';

    if (canSeeAll) {
        const passports = await db('requests?type=eq.passport&status=eq.approved&order=created_at.desc');
        html += `<div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:3px;color:#fff;margin-bottom:16px">🪪 Паспорта граждан</div>`;
        html += !passports?.length ? '<div class="loading-text" style="opacity:0.5;margin-bottom:32px">Нет одобренных паспортов</div>'
            : '<div style="display:grid;gap:12px;margin-bottom:40px">' + passports.map(r=>renderDocCard(r,
                `<b>👤 Игрок:</b> ${r.username}<br><b>📛 ФИО:</b> ${r.char_name||'—'}<br><b>🎂 Дата рождения:</b> ${r.dob||'—'}<br><b>⚧ Пол:</b> ${r.reason||'—'}<br><b>💼 Место работы:</b> ${r.address||'—'}<br><b>🏠 Адрес:</b> ${r.experience||'—'}`,
                '🪪','passports')).join('') + '</div>';

        const licenses = await db('requests?type=eq.license&status=eq.approved&order=created_at.desc');
        html += `<div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:3px;color:#fff;margin-bottom:16px">🔫 Лицензии на оружие</div>`;
        html += !licenses?.length ? '<div class="loading-text" style="opacity:0.5;margin-bottom:32px">Нет одобренных лицензий</div>'
            : '<div style="display:grid;gap:12px;margin-bottom:40px">' + licenses.map(r=>renderDocCard(r,
                `<b>👤 Игрок:</b> ${r.username}<br><b>📛 ФИО:</b> ${r.char_name||'—'}<br><b>🏛️ Фракция:</b> ${r.faction||'—'}<br><b>🔫 Оружие:</b> ${r.weapon_type||'—'}`,
                '🔫','passports')).join('') + '</div>';
    }

    if (canSeeAll || canMedbok) {
        const medbooks = await db('requests?type=eq.medbook&status=eq.approved&order=created_at.desc');
        html += `<div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:3px;color:#fff;margin-bottom:16px">🏥 Медицинские книжки</div>`;
        html += !medbooks?.length ? '<div class="loading-text" style="opacity:0.5">Нет мед. книжек</div>'
            : '<div style="display:grid;gap:12px">' + medbooks.map(r=>renderDocCard(r,
                `<b>👤 Игрок:</b> ${r.username}<br><b>📛 ФИО:</b> ${r.char_name||'—'}<br><b>💼 Место работы:</b> ${r.address||'—'}<br><b>🏥 Болезнь:</b> ${r.note||'—'}`,
                '🏥','passports')).join('') + '</div>';
    }

    if (loadEl) loadEl.style.display = 'none';
    if (listEl) listEl.innerHTML = html;
};

// ─── INIT ─────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    updateAuthZone();
    renderProfile();
    loadNews();
    document.getElementById('login-password')?.addEventListener('keydown', e=>{ if(e.key==='Enter') handleLogin(); });
    document.getElementById('reg-password2')?.addEventListener('keydown',  e=>{ if(e.key==='Enter') handleRegister(); });
});
