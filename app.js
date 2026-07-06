// ═══════════════════════════════════════════════
//  NOVOSIBIRSK RP — app.js v4.1 (bugfix)
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
    opg_create:   WEBHOOK_MEDBOOK,
    opg_join:     WEBHOOK_MEDBOOK,
    mafia_create: WEBHOOK_MEDBOOK,
    mafia_join:   WEBHOOK_MEDBOOK,
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

// FIX 1: Кто может публиковать новости — Администрация (от Ассистента) и ГТРК
const NEWS_ALLOWED_ROLES = [
    "Ассистент Главного Владельца",
    "Заместитель Главного Владельца",
    "Главный Владелец"
];
const NEWS_ALLOWED_FACTIONS = ["ГТРК"];

function canPublishNews(u) {
    if (!u) return false;
    if (NEWS_ALLOWED_ROLES.includes(u.role)) return true;
    if (NEWS_ALLOWED_FACTIONS.includes(u.faction)) return true;
    return false;
}

const POLICE_FACTIONS  = ["ФСБ","ФСО","СОБР","Патрульная Полиция (ДПС)"];
const MEDIC_FACTIONS   = ["МЧС","Городская Больница"];
const SERVICE_FACTIONS = ["ХАРС"];

const ALL_FACTIONS = [
    '—',
    'ФСБ','ФСО','СОБР','Патрульная Полиция (ДПС)',
    'Прокуратура','Адвокатура','Верховный Суд','ГТРК',
    'МЧС','Городская Больница','ХАРС',
    'ОПГ','Мафия','Правительство'
];

const EXPIRY_DAYS_DEFAULT = { passport: 30, medbook: 60, license: 14 };
const OPG_MAX   = 2;
const MAFIA_MAX = 1;

window.currentUser = JSON.parse(localStorage.getItem('nrp_user') || 'null');

// ─── HELPERS ──────────────────────────────────

// FIX 7: Мэр/Вице Мэр — это городская власть (RP-роль), а не администрация сайта.
// Админ-доступ (заявки, документы, панель пользователей) — только у реального стаффа.
const ADMIN_STAFF_ROLES = [
    "Модерация",
    "Администрация",
    "Команда технического администрирования",
    "Секретарь",
    "Ассистент Главного Владельца",
    "Заместитель Главного Владельца",
    "Главный Владелец"
];
function isAdmin(u)      { return u && u.role && ADMIN_STAFF_ROLES.includes(u.role); }
function isPolice(u)     { return u && POLICE_FACTIONS.includes(u.faction); }
function isMedic(u)      { return u && MEDIC_FACTIONS.includes(u.faction); }
function isService(u)    { return u && SERVICE_FACTIONS.includes(u.faction); }
function canManageDocs(u){ return isAdmin(u) || isPolice(u); }

// FIX 5: Панель Владельца — доступна только Главному Владельцу и Заместителю
const OWNER_ROLES = ["Главный Владелец", "Заместитель Главного Владельца"];
function isOwner(u) { return u && OWNER_ROLES.includes(u.role); }

// ─── SITE SETTINGS (экстренное отключение разделов) ──
const DEFAULT_SITE_FLAGS = {
    tabs: { portal:true, news:true, team:true, rules:true },
    services: { passport:true, medbook:true, license:true, 'faction-join':true, court:true, government:true, lawyer:true, home:true, credit:true, 'opg-mafia':true },
    registration_open: true
};
window.siteFlags = DEFAULT_SITE_FLAGS;

async function loadSiteSettings() {
    try {
        const rows = await db('site_settings?id=eq.1');
        if (Array.isArray(rows) && rows[0] && rows[0].flags) {
            window.siteFlags = Object.assign({}, DEFAULT_SITE_FLAGS, rows[0].flags, {
                tabs: Object.assign({}, DEFAULT_SITE_FLAGS.tabs, rows[0].flags.tabs || {}),
                services: Object.assign({}, DEFAULT_SITE_FLAGS.services, rows[0].flags.services || {})
            });
        } else {
            await db('site_settings', { method:'POST', body: JSON.stringify({ id:1, flags: DEFAULT_SITE_FLAGS }) }).catch(()=>{});
        }
    } catch(e) { console.warn('site_settings load error', e); }
    applySiteFlags();
}

function applySiteFlags() {
    const f = window.siteFlags || DEFAULT_SITE_FLAGS;
    document.querySelectorAll('.nav-btn[data-flag-tab], .mobile-nav-btn[data-flag-tab]').forEach(el => {
        const key = el.dataset.flagTab;
        const enabled = f.tabs ? f.tabs[key] !== false : true;
        el.style.display = enabled ? '' : 'none';
    });
    document.querySelectorAll('.portal-card[data-flag-service]').forEach(el => {
        const key = el.dataset.flagService;
        const enabled = f.services ? f.services[key] !== false : true;
        el.style.display = enabled ? '' : 'none';
    });
    const canRegister = f.registration_open !== false;
    const regTabBtn = document.getElementById('auth-tab-register');
    if (regTabBtn) regTabBtn.style.display = canRegister ? '' : 'none';
    // Если владелец отключил вкладку, в которой сейчас находится обычный пользователь — вернуть на главную
    const activeTab = document.querySelector('.tab.active');
    if (activeTab && !isOwner(window.currentUser)) {
        const tabId = activeTab.id.replace('tab-', '');
        if (f.tabs && f.tabs[tabId] === false) switchTab('main');
    }
}

function canRegisterNow() {
    const f = window.siteFlags || DEFAULT_SITE_FLAGS;
    return f.registration_open !== false;
}

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

// ─── URL ROUTING ──────────────────────────────

const VALID_TABS = ['main','portal','news','team','rules','profile'];

window.navigateTo = function(tab, section) {
    let hash = '#' + tab;
    if (section) hash += '/' + section;
    history.pushState({ tab, section: section||null }, '', hash);
    switchTab(tab, false);
    if (section && tab === 'portal') setTimeout(() => switchPortal(section), 50);
};

function readHash() {
    const hash = location.hash.replace('#','');
    if (!hash) return;
    const [tab, section] = hash.split('/');
    if (VALID_TABS.includes(tab)) {
        switchTab(tab, false);
        if (section && tab === 'portal') setTimeout(() => switchPortal(section), 50);
    }
}

window.addEventListener('popstate', () => readHash());

// ─── MOBILE MENU ──────────────────────────────

window.toggleMobileMenu = function() {
    const nav = document.getElementById('mobile-nav');
    const btn = document.getElementById('burger-btn');
    const open = nav.classList.toggle('open');
    btn.textContent = open ? '✕' : '☰';
};

window.closeMobileMenu = function() {
    const nav = document.getElementById('mobile-nav');
    const btn = document.getElementById('burger-btn');
    if (nav) nav.classList.remove('open');
    if (btn) btn.textContent = '☰';
};

// ─── NAV / TAB SWITCHING ──────────────────────

window.switchTab = function(tab, updateHistory = true) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));

    const t = document.getElementById('tab-' + tab);
    if (t) t.classList.add('active');
    const b = document.getElementById('nav-' + tab);
    if (b) b.classList.add('active');
    const mb = document.getElementById('mnav-' + tab);
    if (mb) mb.classList.add('active');

    if (updateHistory) history.pushState({ tab }, '', '#' + tab);

    if (tab === 'news')    loadNews();
    if (tab === 'profile') renderProfile();
    if (tab === 'portal')  initPortal();
    if (tab === 'main')    loadCriminalCounters();
    if (tab === 'rules')   renderRuleSection('discord', 'rules-discord-list');
};

window.switchPortal = function(section) {
    document.querySelectorAll('[id^="portal-"]').forEach(el => {
        if (el.id !== 'portal-main-view' && el.id !== 'portal-faction-view') el.style.display = 'none';
    });
    document.querySelectorAll('.portal-nav-btn').forEach(b => b.classList.remove('active'));

    const mainView    = document.getElementById('portal-main-view');
    const factionView = document.getElementById('portal-faction-view');
    if (mainView)    mainView.style.display = '';
    if (factionView) factionView.style.display = 'none';

    const el = document.getElementById('portal-' + section);
    if (el) el.style.display = 'block';
    document.querySelectorAll('.portal-nav-btn').forEach(b => {
        if (b.dataset.section === section) b.classList.add('active');
    });

    if (section === 'mydocs')         loadMyDocs();
    if (section === 'admin-requests') loadAdminRequests();
    if (section === 'passports')      loadPassports();
};

function initPortal() {
    const btnAdmin = document.getElementById('btn-admin-requests');
    const btnDocs  = document.getElementById('btn-passports');
    if (btnAdmin) btnAdmin.style.display = isAdmin(window.currentUser) ? '' : 'none';
    const canSeeDocs = canManageDocs(window.currentUser) || isMedic(window.currentUser) || isService(window.currentUser);
    if (btnDocs) {
        btnDocs.style.display = canSeeDocs ? '' : 'none';
        btnDocs.textContent = (isMedic(window.currentUser) && !canManageDocs(window.currentUser)) ? '🏥 Мед. книжки' : '📋 Документы';
    }
}

// ─── FACTION PORTAL ───────────────────────────

const FACTION_INFO = {
    fsb:        { icon:'🕵️', name:'ФСБ',               sub:'Федеральная служба безопасности',    type:'gov' },
    fso:        { icon:'🛡️', name:'ФСО',               sub:'Федеральная служба охраны',           type:'gov' },
    sobr:       { icon:'🪖', name:'СОБР',               sub:'Спецотряд быстрого реагирования',    type:'gov' },
    police:     { icon:'🚔', name:'Патрульная Полиция', sub:'Правопорядок и патрулирование',      type:'gov' },
    prokuratura:{ icon:'⚖️', name:'Прокуратура',        sub:'Надзор за законностью',              type:'gov' },
    advokatura: { icon:'👨‍⚖️',name:'Адвокатура',        sub:'Защита прав граждан',               type:'gov' },
    court:      { icon:'🏛️', name:'Верховный Суд',      sub:'Высшая судебная инстанция',          type:'gov' },
    gtrk:       { icon:'📺', name:'ГТРК',               sub:'Государственная телерадиокомпания',  type:'gov' },
    mchs:       { icon:'🚑', name:'МЧС',                sub:'Министерство чрезвычайных ситуаций', type:'service' },
    hospital:   { icon:'🏥', name:'Городская Больница', sub:'Стационарное лечение и мед. книжки', type:'service' },
    hars:       { icon:'🔧', name:'ХАРС',               sub:'Служба дорожной помощи и эвакуации', type:'service' },
    opg:        { icon:'💀', name:'ОПГ',                sub:'Организованная преступная группа',   type:'criminal' },
    mafia:      { icon:'🤵', name:'Мафия',              sub:'Итальянская криминальная организация',type:'criminal'},
};

const FACTION_PORTAL_ACTIONS = {
    gov: [
        { icon:'🏛️', title:'Вступить во фракцию', desc:'Подать заявление на вступление', action:"requireAuth(function(){openModal('faction-join')})" },
        { icon:'🪪', title:'Оформить паспорт', desc:'Гражданский паспорт', action:"requireAuth(function(){openModal('passport')})" },
        { icon:'📋', title:'Обращение в Правительство', desc:'Жалоба или предложение', action:"requireAuth(function(){openModal('government')})" },
    ],
    service: [
        { icon:'🏛️', title:'Вступить во фракцию', desc:'Подать заявление', action:"requireAuth(function(){openModal('faction-join')})" },
        { icon:'🏥', title:'Мед. книжка', desc:'Получить медицинскую книжку', action:"requireAuth(function(){openModal('medbook')})" },
    ],
};

window.goToFaction = function(factionKey) {
    const info = FACTION_INFO[factionKey];
    if (!info) return;
    navigateTo('portal');
    setTimeout(() => {
        const mainView    = document.getElementById('portal-main-view');
        const factionView = document.getElementById('portal-faction-view');
        if (mainView)    mainView.style.display = 'none';
        if (factionView) factionView.style.display = 'block';
        document.getElementById('faction-portal-icon').textContent = info.icon;
        document.getElementById('faction-portal-name').textContent = info.name;
        document.getElementById('faction-portal-sub').textContent  = info.sub;
        const content = document.getElementById('faction-portal-content');
        if (info.type === 'criminal') {
            renderCriminalPortal(factionKey, content);
        } else {
            const actions = FACTION_PORTAL_ACTIONS[info.type] || FACTION_PORTAL_ACTIONS.gov;
            content.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-top:8px">${actions.map(a=>`<div class="portal-card" onclick="${a.action}"><span class="portal-icon">${a.icon}</span><div class="portal-title">${a.title}</div><div class="portal-desc">${a.desc}</div></div>`).join('')}</div>`;
        }
    }, 60);
};

async function renderCriminalPortal(factionKey, container) {
    const isMafia = factionKey === 'mafia';
    const limit   = isMafia ? MAFIA_MAX : OPG_MAX;
    const type    = isMafia ? 'mafia' : 'opg';
    let count = 0;
    try { const rows = await db(`criminal_gangs?type=eq.${type}&status=eq.active`); count = Array.isArray(rows) ? rows.length : 0; } catch(e) {}
    const canCreate = count < limit;
    const limitText = isMafia ? `Максимум ${MAFIA_MAX} Мафия на сервере` : `Максимум ${OPG_MAX} ОПГ банды на сервере`;
    let gangsList = '';
    try {
        const gangs = await db(`criminal_gangs?type=eq.${type}&status=eq.active&order=created_at.asc`);
        if (Array.isArray(gangs) && gangs.length) {
            gangsList = `<div style="margin-top:24px"><div style="font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;color:#fff;margin-bottom:12px">${isMafia ? '🤵 Активные организации' : '💀 Активные банды'}</div><div style="display:grid;gap:10px">${gangs.map(g=>`<div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px"><div><div style="font-weight:700;color:#fff;font-size:16px">${escHtml(g.name)} ${g.tag?`<span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--cyan);background:rgba(0,245,255,0.1);padding:2px 8px;border-radius:4px">[${escHtml(g.tag)}]</span>`:''}</div><div style="color:var(--text);font-size:13px;margin-top:2px">${escHtml(g.description||'')}</div><div style="color:#334155;font-family:'JetBrains Mono',monospace;font-size:11px;margin-top:4px">Основатель: ${escHtml(g.founder||'—')}</div></div><button onclick="requireAuth(function(){openOPGJoin(${g.id},'${type}')})" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:8px 14px;border-radius:10px;cursor:pointer;white-space:nowrap;flex-shrink:0">Вступить →</button></div>`).join('')}</div></div>`;
        }
    } catch(e) {}
    container.innerHTML = `<div class="opg-counter" style="margin-top:8px"><div class="opg-counter-item"><div class="opg-counter-num ${count >= limit ? 'red' : ''}">${count}/${limit}</div><div class="opg-counter-label">${isMafia ? 'Мафий' : 'ОПГ банд'}</div></div><div class="opg-counter-item" style="flex:3;text-align:left;padding:16px 20px"><div style="color:${count >= limit ? '#f87171' : '#22c55e'};font-weight:600;font-size:15px">${count >= limit ? '⛔ Лимит достигнут — создание недоступно' : '✓ Можно создать новую ' + (isMafia ? 'Мафию' : 'ОПГ')}</div><div style="color:var(--text);font-size:13px;margin-top:2px">${limitText}</div></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:4px"><div class="portal-card ${canCreate?'':'disabled-card'}" onclick="${canCreate?`requireAuth(function(){openCriminalCreate('${type}')})`:'notify(\'Лимит банд достигнут\',false)'}" style="${!canCreate?'opacity:0.45;cursor:not-allowed':''}"><span class="portal-icon">${isMafia?'🤵':'💀'}</span><div class="portal-title">Создать</div><div class="portal-desc">${canCreate?'Основать новую '+(isMafia?'Мафию':'ОПГ'):'Лимит исчерпан'}</div></div><div class="portal-card" onclick="requireAuth(function(){openCriminalJoin('${type}')})"><span class="portal-icon">📋</span><div class="portal-title">Вступить</div><div class="portal-desc">Подать заявку в существующую ${isMafia?'организацию':'банду'}</div></div></div>${gangsList}`;
}

window.closeFactionPortal = function() {
    const mainView    = document.getElementById('portal-main-view');
    const factionView = document.getElementById('portal-faction-view');
    if (mainView)    mainView.style.display = '';
    if (factionView) factionView.style.display = 'none';
    switchPortal('services');
};

// ─── CRIMINAL GANG ACTIONS ────────────────────

window.openCriminalCreate = function(type) {
    if (type === 'mafia') openModal('mafia-create');
    else openModal('opg-create');
    const field = document.getElementById(type === 'mafia' ? 'mafia-create-username' : 'opg-create-username');
    if (field && window.currentUser) field.value = window.currentUser.username;
};

window.openCriminalJoin = async function(type) {
    if (type === 'mafia') {
        if (window.currentUser) { const f = document.getElementById('mafia-join-username'); if (f) f.value = window.currentUser.username; }
        openModal('mafia-join');
    } else {
        const sel = document.getElementById('opg-join-select');
        if (sel) {
            sel.innerHTML = '<option>Загрузка...</option>';
            const gangs = await db('criminal_gangs?type=eq.opg&status=eq.active');
            sel.innerHTML = (Array.isArray(gangs) && gangs.length) ? gangs.map(g=>`<option value="${g.id}">${escHtml(g.name)}</option>`).join('') : '<option value="">Нет активных ОПГ</option>';
        }
        if (window.currentUser) { const f = document.getElementById('opg-join-username'); if (f) f.value = window.currentUser.username; }
        openModal('opg-join');
    }
};

window.openOPGJoin = function(gangId, type) {
    openCriminalJoin(type);
    setTimeout(() => { const sel = document.getElementById('opg-join-select'); if (sel) sel.value = gangId; }, 300);
};

window.submitCreateOpg = async function() {
    const u = document.getElementById('opg-create-username').value.trim();
    const name = document.getElementById('opg-create-name').value.trim();
    const desc = document.getElementById('opg-create-desc').value.trim();
    const tag  = document.getElementById('opg-create-tag').value.trim().toUpperCase();
    if (!u || !name) return notify('Заполните обязательные поля', false);
    const existing = await db('criminal_gangs?type=eq.opg&status=eq.active');
    if (Array.isArray(existing) && existing.length >= OPG_MAX) return notify(`Лимит ОПГ (${OPG_MAX}) достигнут!`, false);
    const res = await db('criminal_gangs', { method:'POST', body: JSON.stringify({ type:'opg', name, description:desc, tag, founder:u, status:'active', created_by: window.currentUser?.id }) });
    if (res && res[0]) {
        await db('requests', { method:'POST', body: JSON.stringify({ type:'opg_create', username:u, char_name:name, note:desc, faction:tag, status:'pending', user_id: window.currentUser?.id }) });
        closeModal('opg-create'); notify('ОПГ «' + name + '» создана! Ожидайте подтверждения администрации.'); loadCriminalCounters();
    } else notify('Ошибка при создании ОПГ', false);
};

window.submitCreateMafia = async function() {
    const u = document.getElementById('mafia-create-username').value.trim();
    const name = document.getElementById('mafia-create-name').value.trim();
    const desc = document.getElementById('mafia-create-desc').value.trim();
    if (!u || !name) return notify('Заполните обязательные поля', false);
    const existing = await db('criminal_gangs?type=eq.mafia&status=eq.active');
    if (Array.isArray(existing) && existing.length >= MAFIA_MAX) return notify(`Лимит Мафий (${MAFIA_MAX}) достигнут!`, false);
    const res = await db('criminal_gangs', { method:'POST', body: JSON.stringify({ type:'mafia', name, description:desc, tag:'', founder:u, status:'active', created_by: window.currentUser?.id }) });
    if (res && res[0]) {
        await db('requests', { method:'POST', body: JSON.stringify({ type:'mafia_create', username:u, char_name:name, note:desc, status:'pending', user_id: window.currentUser?.id }) });
        closeModal('mafia-create'); notify('Мафия «' + name + '» создана! Ожидайте подтверждения.'); loadCriminalCounters();
    } else notify('Ошибка при создании', false);
};

window.submitJoinOpg = async function() {
    const u = document.getElementById('opg-join-username').value.trim();
    const gangId = document.getElementById('opg-join-select').value;
    const reason = document.getElementById('opg-join-reason').value.trim();
    if (!u || !gangId) return notify('Заполните все поля', false);
    await db('requests', { method:'POST', body: JSON.stringify({ type:'opg_join', username:u, note:reason, experience:String(gangId), status:'pending', user_id: window.currentUser?.id }) });
    closeModal('opg-join'); notify('Заявка на вступление в ОПГ отправлена!');
};

window.submitJoinMafia = async function() {
    const u = document.getElementById('mafia-join-username').value.trim();
    const reason = document.getElementById('mafia-join-reason').value.trim();
    if (!u) return notify('Введите никнейм', false);
    await db('requests', { method:'POST', body: JSON.stringify({ type:'mafia_join', username:u, note:reason, status:'pending', user_id: window.currentUser?.id }) });
    closeModal('mafia-join'); notify('Заявка на вступление в Мафию отправлена!');
};

// ─── CRIMINAL COUNTERS ────────────────────────

window.loadCriminalCounters = async function() {
    try {
        const [opgs, mafias] = await Promise.all([db('criminal_gangs?type=eq.opg&status=eq.active'), db('criminal_gangs?type=eq.mafia&status=eq.active')]);
        const opgCount = Array.isArray(opgs) ? opgs.length : 0;
        const mafiaCount = Array.isArray(mafias) ? mafias.length : 0;
        const opgBadge = document.getElementById('opg-counter-badge');
        const mafiaBadge = document.getElementById('mafia-counter-badge');
        if (opgBadge)   opgBadge.innerHTML   = `<span style="color:${opgCount >= OPG_MAX ? '#f87171' : 'var(--text)'}">${opgCount}/${OPG_MAX} банды активны</span>`;
        if (mafiaBadge) mafiaBadge.innerHTML = `<span style="color:${mafiaCount >= MAFIA_MAX ? '#f87171' : 'var(--text)'}">${mafiaCount}/${MAFIA_MAX} организаций</span>`;
    } catch(e) {}
};

// ─── MODALS ───────────────────────────────────

window.openModal = function(id) {
    const m = document.getElementById('modal-' + id);
    if (m) m.classList.add('open');
    if (window.currentUser) {
        ['passport','medbook','license','faction','court','gov','lawyer','opg-create','opg-join','mafia-create','mafia-join'].forEach(p => {
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

const COMING_SOON_INFO = {
    home:   { icon:'🏠', title:'Скоро!', desc:'Приобретение и управление недвижимостью появится на портале в ближайших обновлениях.' },
    credit: { icon:'💳', title:'Скоро!', desc:'Оформление кредита на жильё, авто или бизнес появится на портале в ближайших обновлениях.' },
};

window.showComingSoon = function(key) {
    const info = COMING_SOON_INFO[key] || { icon:'🏗️', title:'Скоро!', desc:'Раздел в разработке.' };
    const el = document.getElementById('fullscreen-cs');
    if (!el) return;
    const iconEl  = document.getElementById('fs-cs-icon');
    const titleEl = document.getElementById('fs-cs-title');
    const descEl  = document.getElementById('fs-cs-desc');
    if (iconEl)  iconEl.textContent  = info.icon;
    if (titleEl) titleEl.textContent = info.title;
    if (descEl)  descEl.textContent  = info.desc;
    el.classList.add('open');
};

window.closeComingSoon = function() {
    document.getElementById('fullscreen-cs')?.classList.remove('open');
};

window.switchAuthTab = function(tab) {
    document.getElementById('auth-login-form').style.display    = tab === 'login'    ? '' : 'none';
    document.getElementById('auth-register-form').style.display = tab === 'register' ? '' : 'none';
    document.getElementById('auth-tab-login').classList.toggle('active',    tab === 'login');
    document.getElementById('auth-tab-register').classList.toggle('active', tab === 'register');
};

// ─── AUTH ─────────────────────────────────────

window.handleRegister = async function() {
    if (!canRegisterNow()) return notify('Регистрация временно отключена администрацией', false);
    const u  = document.getElementById('reg-username').value.trim();
    const p  = document.getElementById('reg-password').value;
    const p2 = document.getElementById('reg-password2').value;
    if (!u || !p)     return notify('Заполните все поля', false);
    if (p !== p2)     return notify('Пароли не совпадают', false);
    if (p.length < 4) return notify('Пароль минимум 4 символа', false);
    const exists = await db(`users?username=eq.${encodeURIComponent(u)}`);
    if (exists.length) return notify('Ник уже занят', false);
    const res = await db('users', { method:'POST', body: JSON.stringify({ username:u, password:p, role:'Пользователь', faction:'' }) });
    if (res && res[0]) {
        window.currentUser = res[0];
        localStorage.setItem('nrp_user', JSON.stringify(res[0]));
        closeModal('auth'); updateAuthZone(); notify('Добро пожаловать, ' + u + '!'); navigateTo('profile');
    } else notify('Ошибка регистрации', false);
};

window.handleLogin = async function() {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    if (!u || !p) return notify('Заполните все поля', false);
    const users = await db(`users?username=eq.${encodeURIComponent(u)}`);
    if (!users.length)           return notify('Пользователь не найден', false);
    if (users[0].password !== p) return notify('Неверный пароль', false);
    window.currentUser = users[0];
    localStorage.setItem('nrp_user', JSON.stringify(users[0]));
    closeModal('auth'); updateAuthZone(); notify('Добро пожаловать, ' + u + '!'); renderProfile();
};

window.logout = function() {
    localStorage.removeItem('nrp_user');
    window.currentUser = null;
    updateAuthZone(); navigateTo('main'); notify('Вы вышли из аккаунта');
};

// FIX 3: В кнопке профиля показывается ник + роль + фракция
function updateAuthZone() {
    const zone = document.getElementById('auth-zone');
    if (!zone) return;
    if (window.currentUser) {
        const role    = window.currentUser.role    || 'Пользователь';
        const faction = window.currentUser.faction || '';
        const roleColor = role !== 'Пользователь' ? 'var(--cyan)' : '#64748b';
        zone.innerHTML = `<button onclick="navigateTo('profile')" style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.05);border:1px solid var(--border);color:#fff;font-family:'Rajdhani',sans-serif;font-weight:600;font-size:14px;padding:8px 14px;border-radius:12px;cursor:pointer;text-align:left">
            <span style="width:36px;height:36px;border-radius:10px;background:rgba(0,245,255,0.15);border:1px solid rgba(0,245,255,0.3);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--cyan);flex-shrink:0">${window.currentUser.username.charAt(0).toUpperCase()}</span>
            <div style="display:flex;flex-direction:column;align-items:flex-start;gap:1px;min-width:0">
                <span style="font-size:14px;font-weight:700;color:#fff;line-height:1.1">${escHtml(window.currentUser.username)}</span>
                <span style="font-size:11px;color:${roleColor};font-family:'JetBrains Mono',monospace;line-height:1.1">${escHtml(role)}</span>
                ${faction ? `<span style="font-size:10px;color:#c084fc;font-family:'JetBrains Mono',monospace;line-height:1.1">${escHtml(faction)}</span>` : ''}
            </div>
        </button>`;
    } else {
        zone.innerHTML = `<button class="btn-primary" onclick="openModal('auth')">Войти</button>`;
    }
}

// ─── PROFILE ──────────────────────────────────

window.renderProfile = async function() {
    const guest  = document.getElementById('profile-guest');
    const user   = document.getElementById('profile-user');
    const adminP = document.getElementById('admin-users-panel');
    if (!guest || !user) return;
    if (!window.currentUser) {
        guest.style.display = ''; user.style.display = 'none';
        if (adminP) adminP.style.display = 'none'; return;
    }
    guest.style.display = 'none'; user.style.display = '';
    loadUserNotifications();

    const avatarLetter = document.getElementById('profile-avatar-letter');
    const avatarImg    = document.getElementById('profile-avatar-img');
    if (avatarLetter) avatarLetter.textContent = window.currentUser.username.charAt(0).toUpperCase();
    if (avatarImg) {
        const savedAvatar = localStorage.getItem('nrp_avatar_' + window.currentUser.id);
        if (savedAvatar) { avatarImg.src = savedAvatar; avatarImg.style.display = 'block'; if (avatarLetter) avatarLetter.style.display = 'none'; }
        else { avatarImg.style.display = 'none'; if (avatarLetter) avatarLetter.style.display = ''; }
    }

    const unEl = document.getElementById('profile-username');
    if (unEl) unEl.textContent = window.currentUser.username;
    const roleEl    = document.getElementById('profile-role-value');
    const roleBadge = document.getElementById('profile-role-badge');
    const role      = window.currentUser.role || 'Пользователь';
    if (roleEl)    roleEl.textContent    = role;
    if (roleBadge) roleBadge.textContent = '⭐ ' + role;
    const faction       = window.currentUser.faction || '';
    const factionEl     = document.getElementById('profile-faction-value');
    const factionBadge  = document.getElementById('profile-faction-badge');
    if (factionEl) factionEl.textContent = faction || '—';
    if (factionBadge) { if (faction) { factionBadge.textContent = '🏛️ ' + faction; factionBadge.style.display = 'inline-flex'; } else { factionBadge.style.display = 'none'; } }

    const pp = document.getElementById('profile-password');
    if (pp) { pp.dataset.real = window.currentUser.password; pp.textContent = '••••••••'; }
    const createdEl = document.getElementById('profile-created');
    if (createdEl) createdEl.textContent = window.currentUser.created_at ? new Date(window.currentUser.created_at).toLocaleDateString('ru-RU') : '—';

    try {
        const docs = await db(`requests?user_id=eq.${window.currentUser.id}`);
        if (Array.isArray(docs)) {
            const sd = document.getElementById('stat-docs');
            const sa = document.getElementById('stat-approved');
            const sp = document.getElementById('stat-pending');
            if (sd) sd.textContent = docs.length;
            if (sa) sa.textContent = docs.filter(d => d.status === 'approved').length;
            if (sp) sp.textContent = docs.filter(d => d.status === 'pending').length;
        }
    } catch(e) {}

    if (isAdmin(window.currentUser)) { if (adminP) adminP.style.display = ''; loadUsersTable(); }
    else { if (adminP) adminP.style.display = 'none'; }

    showOwnerPanelIfNeeded();
};

window.triggerAvatarUpload = function() { document.getElementById('avatar-file-input')?.click(); };

window.handleAvatarUpload = function(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const dataUrl = e.target.result;
        localStorage.setItem('nrp_avatar_' + window.currentUser.id, dataUrl);
        const avatarImg = document.getElementById('profile-avatar-img');
        const avatarLetter = document.getElementById('profile-avatar-letter');
        if (avatarImg)    { avatarImg.src = dataUrl; avatarImg.style.display = 'block'; }
        if (avatarLetter) avatarLetter.style.display = 'none';
        notify('Фото профиля обновлено!');
    };
    reader.readAsDataURL(file);
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
    if (!np)           return notify('Введите новый пароль', false);
    if (np.length < 4) return notify('Пароль минимум 4 символа', false);
    if (np !== cp)     return notify('Пароли не совпадают', false);
    await db(`users?id=eq.${window.currentUser.id}`, { method:'PATCH', body: JSON.stringify({ password:np }) });
    window.currentUser.password = np;
    localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    notify('Пароль изменён!'); renderProfile();
};

// ─── USERS TABLE ──────────────────────────────

const SEL = `background:#1e293b;border:1px solid var(--border);color:#fff;padding:5px 8px;border-radius:8px;font-size:12px;font-family:'Rajdhani',sans-serif;max-width:160px`;

window.loadUsersTable = async function() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" style="padding:20px;text-align:center;color:var(--text)">Загрузка...</td></tr>`;
    const users = await db('users?order=username.asc');
    if (!Array.isArray(users) || !users.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding:20px;text-align:center;color:var(--text)">Нет пользователей</td></tr>`; return;
    }
    tbody.innerHTML = users.map(u => `<tr>
        <td style="padding:10px 14px;font-weight:600;color:#fff">${escHtml(u.username)}</td>
        <td style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#64748b">${escHtml(u.password||'')}</td>
        <td style="padding:10px 14px"><select onchange="changeRole(${u.id},this.value)" style="${SEL}">${ADMIN_RANKS.map(r=>`<option value="${r}" ${u.role===r?'selected':''}>${r}</option>`).join('')}</select></td>
        <td style="padding:10px 14px"><select onchange="changeFaction(${u.id},this.value)" style="${SEL}">${ALL_FACTIONS.map(f=>`<option value="${f==='—'?'':f}" ${(u.faction||'')===(f==='—'?'':f)?'selected':''}>${f}</option>`).join('')}</select></td>
        <td style="padding:10px 14px"><button onclick="deleteUser(${u.id})" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;padding:5px 12px;border-radius:8px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:600">Удалить</button></td>
    </tr>`).join('');
};

window.changeRole = async function(id, role) {
    await db(`users?id=eq.${id}`, { method:'PATCH', body: JSON.stringify({ role }) });
    if (window.currentUser && window.currentUser.id === id) { window.currentUser.role = role; localStorage.setItem('nrp_user', JSON.stringify(window.currentUser)); updateAuthZone(); }
    notify('Роль обновлена');
};

window.changeFaction = async function(id, faction) {
    await db(`users?id=eq.${id}`, { method:'PATCH', body: JSON.stringify({ faction }) });
    if (window.currentUser && window.currentUser.id === id) { window.currentUser.faction = faction; localStorage.setItem('nrp_user', JSON.stringify(window.currentUser)); updateAuthZone(); }
    notify('Фракция обновлена');
};

window.deleteUser = async function(id) {
    if (!confirm('Удалить пользователя?')) return;
    await db(`users?id=eq.${id}`, { method:'DELETE' });
    notify('Пользователь удалён'); loadUsersTable();
};

// ─── OWNER PANEL ──────────────────────────────

function showOwnerPanelIfNeeded() {
    const panel = document.getElementById('owner-panel');
    if (!panel) return;
    if (isOwner(window.currentUser)) {
        panel.style.display = '';
        syncOwnerCheckboxes();
        loadOwnerExpiringDocs();
    } else {
        panel.style.display = 'none';
    }
}

function syncOwnerCheckboxes() {
    const f = window.siteFlags || DEFAULT_SITE_FLAGS;
    document.querySelectorAll('#owner-toggle-tabs input[data-flag-tab]').forEach(cb => {
        cb.checked = f.tabs ? f.tabs[cb.dataset.flagTab] !== false : true;
    });
    document.querySelectorAll('#owner-toggle-services input[data-flag-service]').forEach(cb => {
        cb.checked = f.services ? f.services[cb.dataset.flagService] !== false : true;
    });
    const regCb = document.getElementById('owner-toggle-registration');
    if (regCb) regCb.checked = f.registration_open !== false;
}

window.saveOwnerSettings = async function() {
    if (!isOwner(window.currentUser)) return notify('Нет доступа', false);
    const tabs = {};
    document.querySelectorAll('#owner-toggle-tabs input[data-flag-tab]').forEach(cb => { tabs[cb.dataset.flagTab] = cb.checked; });
    const services = {};
    document.querySelectorAll('#owner-toggle-services input[data-flag-service]').forEach(cb => { services[cb.dataset.flagService] = cb.checked; });
    const registration_open = document.getElementById('owner-toggle-registration')?.checked !== false;
    const flags = { tabs, services, registration_open };
    window.siteFlags = flags;
    try {
        const existing = await db('site_settings?id=eq.1');
        if (Array.isArray(existing) && existing.length) {
            await db('site_settings?id=eq.1', { method:'PATCH', body: JSON.stringify({ flags }) });
        } else {
            await db('site_settings', { method:'POST', body: JSON.stringify({ id:1, flags }) });
        }
    } catch(e) { console.warn('saveOwnerSettings error', e); }
    applySiteFlags();
    notify('Настройки сайта сохранены');
};

window.ownerRenameUser = async function() {
    if (!isOwner(window.currentUser)) return notify('Нет доступа', false);
    const curEl  = document.getElementById('owner-rename-current');
    const newEl  = document.getElementById('owner-rename-new');
    const cur = curEl.value.trim();
    const next = newEl.value.trim();
    if (!cur || !next) return notify('Заполните оба поля', false);
    const users = await db(`users?username=eq.${encodeURIComponent(cur)}`);
    if (!Array.isArray(users) || !users.length) return notify('Пользователь не найден', false);
    const clash = await db(`users?username=eq.${encodeURIComponent(next)}`);
    if (Array.isArray(clash) && clash.length) return notify('Этот никнейм уже занят', false);
    await db(`users?id=eq.${users[0].id}`, { method:'PATCH', body: JSON.stringify({ username: next }) });
    if (window.currentUser && window.currentUser.id === users[0].id) {
        window.currentUser.username = next;
        localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
        updateAuthZone();
    }
    curEl.value = ''; newEl.value = '';
    notify(`Никнейм изменён: ${cur} → ${next}`);
    loadUsersTable();
};

window.loadOwnerExpiringDocs = async function() {
    const el = document.getElementById('owner-expiring-docs');
    if (!el || !isOwner(window.currentUser)) return;
    el.innerHTML = '<div class="loading-text" style="opacity:0.5">Загрузка...</div>';
    try {
        const rows = await db('requests?status=eq.approved&expires_at=not.is.null&order=expires_at.asc');
        const soon = new Date(); soon.setDate(soon.getDate() + 5);
        const list = Array.isArray(rows) ? rows.filter(r => r.expires_at && new Date(r.expires_at) <= soon) : [];
        if (!list.length) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Нет истекающих документов</div>'; return; }
        const typeNames = { passport:'🪪 Паспорт', medbook:'🏥 Мед. книжка', license:'🔫 Лицензия' };
        el.innerHTML = list.map(r => {
            const exp = new Date(r.expires_at);
            const expired = exp < new Date();
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px"><span>${typeNames[r.type]||r.type} — <b>${escHtml(r.username||r.char_name||'—')}</b></span><span style="color:${expired?'#f87171':'#fbbf24'}">${expired?'⏰ Истёк':'⚠️ До'} ${exp.toLocaleDateString('ru-RU')}</span></div>`;
        }).join('');
    } catch(e) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Ошибка загрузки</div>'; }
};

window.copyProfileLink = function() {
    if (!window.currentUser) return notify('Войдите в аккаунт', false);
    const url = location.origin + location.pathname + '#profile';
    navigator.clipboard?.writeText(url).then(
        () => notify('Ссылка скопирована!'),
        () => notify('Не удалось скопировать', false)
    );
};

// ─── УВЕДОМЛЕНИЯ ПОЛЬЗОВАТЕЛЮ (напр. просьба сменить ник) ──
// Требуется таблица в Supabase: notifications (id, user_id, type text, text text, read bool default false, created_at timestamptz default now())

window.sendRenameRequest = async function() {
    if (!isOwner(window.currentUser)) return notify('Нет доступа', false);
    const uEl = document.getElementById('notify-target-username');
    const tEl = document.getElementById('notify-target-text');
    const username = uEl.value.trim();
    const text = tEl.value.trim() || 'Пожалуйста, смените ваш никнейм в соответствии с требованиями сервера.';
    if (!username) return notify('Введите никнейм игрока', false);
    const users = await db(`users?username=eq.${encodeURIComponent(username)}`);
    if (!Array.isArray(users) || !users.length) return notify('Пользователь не найден', false);
    try {
        const res = await db('notifications', { method:'POST', body: JSON.stringify({ user_id: users[0].id, type:'rename_request', text, read:false }) });
        if (!res || res.error) throw new Error('insert failed');
        notify('Запрос отправлен игроку ' + username);
        uEl.value = ''; tEl.value = '';
    } catch(e) {
        console.warn('sendRenameRequest error', e);
        notify('Ошибка отправки — проверьте таблицу notifications в Supabase', false);
    }
};

async function loadUserNotifications() {
    const container = document.getElementById('profile-notifications');
    if (!window.currentUser) { updateNotifyDot(false); if (container) container.innerHTML = ''; return; }
    try {
        const rows = await db(`notifications?user_id=eq.${window.currentUser.id}&read=eq.false&order=created_at.desc`);
        const list = Array.isArray(rows) ? rows : [];
        updateNotifyDot(list.length > 0);
        if (container) container.innerHTML = list.map(n => renderNotificationCard(n)).join('');
    } catch(e) { updateNotifyDot(false); }
}

function updateNotifyDot(show) {
    const d1 = document.getElementById('profile-notify-dot');
    const d2 = document.getElementById('profile-notify-dot-m');
    if (d1) d1.style.display = show ? '' : 'none';
    if (d2) d2.style.display = show ? '' : 'none';
}

function renderNotificationCard(n) {
    if (n.type === 'rename_request') {
        return `<div class="profile-card" style="border-color:rgba(251,191,36,0.35);background:rgba(251,191,36,0.05)">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:20px">✏️</span><div style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:1px;color:#fbbf24">Администрация просит сменить никнейм</div></div>
            <div style="color:var(--text);font-size:14px;margin-bottom:14px;line-height:1.6">${escHtml(n.text||'')}</div>
            <div class="form-group"><input type="text" id="notif-rename-${n.id}" placeholder="Новый никнейм" class="form-input"></div>
            <button class="form-submit" onclick="respondRenameRequest(${n.id})">Сменить никнейм</button>
        </div>`;
    }
    return `<div class="profile-card"><div style="color:var(--text);font-size:14px;line-height:1.6">${escHtml(n.text||'')}</div><button onclick="dismissNotification(${n.id})" style="margin-top:10px;background:none;border:none;color:var(--cyan);font-size:12px;cursor:pointer;letter-spacing:1px">ПОНЯТНО, СКРЫТЬ</button></div>`;
}

window.respondRenameRequest = async function(notifId) {
    const input = document.getElementById('notif-rename-' + notifId);
    const next = input?.value.trim();
    if (!next) return notify('Введите новый никнейм', false);
    const clash = await db(`users?username=eq.${encodeURIComponent(next)}`);
    if (Array.isArray(clash) && clash.length) return notify('Этот никнейм уже занят', false);
    await db(`users?id=eq.${window.currentUser.id}`, { method:'PATCH', body: JSON.stringify({ username: next }) });
    window.currentUser.username = next;
    localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
    await db(`notifications?id=eq.${notifId}`, { method:'PATCH', body: JSON.stringify({ read:true }) }).catch(()=>{});
    updateAuthZone();
    notify('Никнейм изменён на ' + next);
    renderProfile();
};

window.dismissNotification = async function(id) {
    try { await db(`notifications?id=eq.${id}`, { method:'PATCH', body: JSON.stringify({ read:true }) }); } catch(e) {}
    loadUserNotifications();
};

// ─── NEWS ─────────────────────────────────────

const TAG_STYLES    = { 'Важно':'tag-important', 'Обновление':'tag-update', 'Мероприятие':'tag-event', 'Свой Вариант':'tag-custom' };
const TAG_ICONS     = { 'Важно':'🔴', 'Обновление':'⚙️', 'Мероприятие':'🎉', 'Свой Вариант':'✏️' };
const TAG_PLACEHOLDERS = { 'Важно':'❗', 'Обновление':'⚙️', 'Мероприятие':'🎉', 'Свой Вариант':'✏️' };

window.handleNewsTagChange = function(sel) {
    const row = document.getElementById('news-custom-tag-row');
    if (row) row.style.display = sel.value === 'Свой Вариант' ? 'block' : 'none';
};

window.previewNewsImage = function() {
    const url = document.getElementById('news-image-url')?.value.trim();
    const preview = document.getElementById('news-img-preview');
    if (!preview) return;
    if (url) { preview.src = url; preview.style.display = 'block'; } else { preview.style.display = 'none'; }
};

window.handleNewsImageFile = function(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const urlInput = document.getElementById('news-image-url');
        const preview  = document.getElementById('news-img-preview');
        if (urlInput) urlInput.value = e.target.result;
        if (preview)  { preview.src = e.target.result; preview.style.display = 'block'; }
    };
    reader.readAsDataURL(file);
};

// FIX 1: Панель публикации видна только для Администрации (от Ассистента и выше) и ГТРК
window.loadNews = async function() {
    const feed = document.getElementById('news-feed');
    if (!feed) return;
    const adminNewsPanel = document.getElementById('admin-news-panel');
    if (adminNewsPanel) adminNewsPanel.style.display = canPublishNews(window.currentUser) ? '' : 'none';
    feed.innerHTML = '<div class="loading-text">Загрузка...</div>';
    const news = await db('news?order=created_at.desc');
    if (!Array.isArray(news) || !news.length) { feed.innerHTML = '<div class="loading-text" style="opacity:0.5">Новостей пока нет</div>'; return; }
    feed.innerHTML = news.map(n => {
        const tagLabel = n.custom_tag || n.tag;
        const tc   = TAG_STYLES[n.tag] || 'tag-custom';
        const ti   = TAG_ICONS[n.tag]  || '📌';
        const date = n.created_at ? new Date(n.created_at).toLocaleDateString('ru-RU') : '';
        const imgHtml = n.image_url
            ? `<img src="${escHtml(n.image_url)}" class="news-card-img" alt="" onerror="this.style.display='none'">`
            : `<div class="news-card-img-placeholder">${TAG_PLACEHOLDERS[n.tag]||'📰'}</div>`;
        const del = canPublishNews(window.currentUser) ? `<button onclick="deleteNews(${n.id})" style="background:none;border:none;color:#f87171;font-family:'Rajdhani',sans-serif;font-size:13px;cursor:pointer;padding:0">🗑 Удалить</button>` : '';
        return `<div class="news-card">${imgHtml}<div class="news-card-body"><span class="news-tag ${tc}">${ti} ${escHtml(tagLabel)}</span><div class="news-title">${escHtml(n.title)}</div><div class="news-text">${escHtml(n.text)}</div><div class="news-footer"><span class="news-date">${date}</span><span class="news-author">${n.author ? '@ ' + escHtml(n.author) : ''}</span></div>${del ? `<div style="margin-top:8px">${del}</div>` : ''}</div></div>`;
    }).join('');
};

window.createNews = async function() {
    if (!canPublishNews(window.currentUser)) return notify('Нет прав на публикацию', false);
    const title     = document.getElementById('news-title').value.trim();
    const tag       = document.getElementById('news-tag').value;
    const customTag = document.getElementById('news-custom-tag')?.value.trim();
    const text      = document.getElementById('news-text').value.trim();
    const imageUrl  = document.getElementById('news-image-url')?.value.trim() || null;
    if (!title || !text) return notify('Заполните заголовок и текст', false);
    await db('news', { method:'POST', body: JSON.stringify({ title, tag, custom_tag: tag === 'Свой Вариант' ? (customTag || 'Свой вариант') : null, text, image_url: imageUrl, author: window.currentUser?.username || null }) });
    document.getElementById('news-title').value = '';
    document.getElementById('news-text').value  = '';
    if (document.getElementById('news-image-url'))  document.getElementById('news-image-url').value = '';
    if (document.getElementById('news-custom-tag')) document.getElementById('news-custom-tag').value = '';
    const preview = document.getElementById('news-img-preview');
    if (preview) preview.style.display = 'none';
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
        const u=document.getElementById('passport-username').value.trim(), n=document.getElementById('passport-name').value.trim(), d=document.getElementById('passport-dob').value, job=document.getElementById('passport-job').value.trim(), gen=document.getElementById('passport-gender').value, bio=document.getElementById('passport-bio').value.trim(), adr=document.getElementById('passport-address').value.trim(), sgn=document.getElementById('passport-sign').value.trim();
        if (!u||!n||!d||!job||!gen) return notify('Заполните обязательные поля', false);
        data = { type:'passport', username:u, char_name:n, dob:d, address:job, reason:gen, note:bio, experience:adr, faction:sgn, status:'pending', user_id:window.currentUser?.id };
    } else if (type === 'medbook') {
        const u=document.getElementById('medbook-username').value.trim(), n=document.getElementById('medbook-name').value.trim(), dob=document.getElementById('medbook-dob').value, job=document.getElementById('medbook-job').value.trim(), pos=document.getElementById('medbook-position').value.trim(), gl=document.getElementById('medbook-goal').value.trim(), dis=document.getElementById('medbook-disease').value, nt=document.getElementById('medbook-note').value.trim();
        if (!u||!n||!job||!pos||!gl) return notify('Заполните обязательные поля', false);
        data = { type:'medbook', username:u, char_name:n, dob, address:job, reason:pos, note:gl+'|'+dis+(nt?'|'+nt:''), status:'pending', user_id:window.currentUser?.id };
    } else if (type === 'license') {
        const u=document.getElementById('license-username').value.trim(), n=document.getElementById('license-name').value.trim(), dob=document.getElementById('license-dob').value, job=document.getElementById('license-job').value.trim(), fac=document.getElementById('license-faction').value, rsn=document.getElementById('license-reason').value.trim(), sgn=document.getElementById('license-sign').value.trim();
        // FIX 4: Правильное получение мультиселекта — перебираем все options
        const wpnSelect = document.getElementById('license-weapons');
        const wpn = Array.from(wpnSelect.options).filter(o => o.selected).map(o => o.value).join(', ');
        if (!u||!n||!job||!rsn||!wpn) return notify('Выберите оружие и заполните поля', false);
        data = { type:'license', username:u, char_name:n, dob, address:job, faction:fac, reason:rsn, weapon_type:wpn, note:sgn, status:'pending', user_id:window.currentUser?.id };
    } else if (type === 'faction-join') {
        const u=document.getElementById('faction-username').value.trim(), rb=document.getElementById('faction-roblox').value.trim(), rn=document.getElementById('faction-realname').value.trim(), mb=document.getElementById('faction-medbook').value, fac=document.getElementById('faction-name').value, bio=document.getElementById('faction-bio').value.trim();
        if (!u||!rb||!rn) return notify('Заполните обязательные поля', false);
        data = { type:'faction_join', username:u, char_name:rn, faction:fac, reason:rb, note:mb, experience:bio, status:'pending', user_id:window.currentUser?.id };
    } else if (type === 'court') {
        const pl=document.getElementById('court-plaintiff').value.trim(), df=document.getElementById('court-defendant').value.trim(), cl=document.getElementById('court-claim').value.trim(), ev=document.getElementById('court-evidence').value.trim();
        if (!pl||!df||!cl) return notify('Заполните обязательные поля', false);
        data = { type:'court', username:pl, defendant:df, claim:cl, evidence:ev, status:'pending', user_id:window.currentUser?.id };
    } else if (type === 'government') {
        const u=document.getElementById('gov-username').value.trim(), t=document.getElementById('gov-type').value, tx=document.getElementById('gov-text').value.trim();
        if (!u||!tx) return notify('Заполните обязательные поля', false);
        data = { type:'government', username:u, request_type:t, text:tx, status:'pending', user_id:window.currentUser?.id };
    } else if (type === 'lawyer') {
        const u=document.getElementById('lawyer-username').value.trim(), s=document.getElementById('lawyer-situation').value, tx=document.getElementById('lawyer-text').value.trim();
        if (!u||!tx) return notify('Заполните обязательные поля', false);
        data = { type:'lawyer', username:u, situation:s, text:tx, status:'pending', user_id:window.currentUser?.id };
    }
    await db('requests', { method:'POST', body: JSON.stringify(data) });
    closeModal(type);
    notify('Заявка отправлена! Ожидайте рассмотрения.');
};

// ─── EXPIRY ───────────────────────────────────

function docExpiryLine(r) {
    if (!r.expires_at) return '';
    const exp = new Date(r.expires_at), diff = Math.ceil((exp - new Date()) / 86400000);
    if (diff < 0)  return `<span class="badge badge-rejected" style="margin-top:6px;display:inline-flex">⏰ Истёк ${exp.toLocaleDateString('ru-RU')}</span>`;
    if (diff <= 5) return `<span class="badge badge-pending" style="margin-top:6px;display:inline-flex">⚠️ До ${exp.toLocaleDateString('ru-RU')} (${diff} дн.)</span>`;
    return `<span class="badge badge-approved" style="margin-top:6px;display:inline-flex">📅 До ${exp.toLocaleDateString('ru-RU')}</span>`;
}

function expiryBadge(r) {
    if (!r.expires_at) return '';
    const exp = new Date(r.expires_at), diff = Math.ceil((exp - new Date()) / 86400000);
    if (diff < 0)  return `<span class="badge badge-rejected">⏰ Истёк</span>`;
    if (diff <= 5) return `<span class="badge badge-pending">⚠️ ${diff} дн.</span>`;
    return `<span class="badge badge-approved">📅 До ${exp.toLocaleDateString('ru-RU')}</span>`;
}

// ─── MY DOCS ──────────────────────────────────

window.loadMyDocs = async function() {
    const guestDiv = document.getElementById('mydocs-guest');
    const listDiv  = document.getElementById('mydocs-list');
    if (!window.currentUser) { if (guestDiv) guestDiv.style.display = ''; if (listDiv) listDiv.innerHTML = ''; return; }
    if (guestDiv) guestDiv.style.display = 'none';
    if (!listDiv) return;
    listDiv.innerHTML = '<div class="loading-text">Загрузка...</div>';
    const reqs = await db(`requests?user_id=eq.${window.currentUser.id}&order=created_at.desc`);
    if (!Array.isArray(reqs) || !reqs.length) { listDiv.innerHTML = '<div class="loading-text" style="opacity:0.5">У вас нет заявок</div>'; return; }
    const typeLabels = { passport:'🪪 Паспорт', medbook:'🏥 Мед. книжка', license:'🔫 Лицензия', faction_join:'🏛️ Вступление во фракцию', court:'⚖️ Судебный иск', government:'📋 Обращение в правительство', lawyer:'👨‍⚖️ Адвокат', opg_create:'💀 Создание ОПГ', opg_join:'💀 Вступление в ОПГ', mafia_create:'🤵 Создание Мафии', mafia_join:'🤵 Вступление в Мафию' };
    const typeIcons  = { passport:'🪪', medbook:'🏥', license:'🔫', faction_join:'🏛️', court:'⚖️', government:'📋', lawyer:'👨‍⚖️', opg_create:'💀', opg_join:'💀', mafia_create:'🤵', mafia_join:'🤵' };
    const canM = canManageDocs(window.currentUser);
    listDiv.innerHTML = reqs.map(r => {
        const sb  = r.status==='approved' ? '<span class="badge badge-approved">✓ Одобрено</span>' : r.status==='rejected' ? '<span class="badge badge-rejected">✕ Отклонено</span>' : '<span class="badge badge-pending">⏳ На рассмотрении</span>';
        const exp = r.status==='approved' ? expiryBadge(r) : '';
        const date = r.created_at ? new Date(r.created_at).toLocaleDateString('ru-RU') : '';
        const btns = canM ? `<div style="display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)"><button onclick="deleteRequest(${r.id},'mydocs')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer">🗑 Удалить</button>${r.status==='approved'?`<button onclick="setExpiry(${r.id},'mydocs')" style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);color:#fbbf24;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer">📅 Изменить срок</button>`:''}</div>` : '';
        return `<div class="doc-card" style="flex-direction:column;align-items:stretch;gap:0"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div style="display:flex;align-items:center;gap:14px"><div class="doc-icon">${typeIcons[r.type]||'📄'}</div><div><div style="font-weight:700;color:#fff;font-size:16px">${typeLabels[r.type]||r.type}</div><div style="color:var(--text);font-size:13px;margin-top:2px">${date} • ${escHtml(r.char_name||r.username||'')}</div></div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">${sb}${exp}</div></div>${btns}</div>`;
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
    const exp = new Date(); exp.setDate(exp.getDate() + parseInt(days));
    await db(`requests?id=eq.${id}`, { method:'PATCH', body: JSON.stringify({ expires_at: exp.toISOString() }) });
    notify(`Срок установлен до ${exp.toLocaleDateString('ru-RU')}`);
    if (section==='passports') loadPassports(); else loadMyDocs();
};

// ─── ADMIN REQUESTS ───────────────────────────

const REQUEST_TYPE_NAMES = { passport:'🪪 Паспорт', medbook:'🏥 Мед. книжка', license:'🔫 Лицензия', faction_join:'🏛️ Вступление во фракцию', court:'⚖️ Судебный иск', government:'📋 Правительство', lawyer:'👨‍⚖️ Адвокат', opg_create:'💀 Создание ОПГ', opg_join:'💀 Вступление в ОПГ', mafia_create:'🤵 Создание Мафии', mafia_join:'🤵 Вступление в Мафию' };

window._adminRequestsCache = [];

window.loadAdminRequests = async function() {
    const listEl = document.getElementById('admin-requests-list');
    const loadEl = document.getElementById('requests-loading');
    if (!isAdmin(window.currentUser)) return;
    if (loadEl) loadEl.style.display = '';
    if (listEl) listEl.innerHTML = '';
    const reqs = await db('requests?status=eq.pending&order=created_at.desc');
    if (loadEl) loadEl.style.display = 'none';
    window._adminRequestsCache = Array.isArray(reqs) ? reqs : [];
    const searchEl = document.getElementById('requests-search');
    const filterEl = document.getElementById('requests-filter');
    if (searchEl) searchEl.value = '';
    if (filterEl) filterEl.value = 'all';
    renderAdminRequestsList(window._adminRequestsCache);
};

function renderAdminRequestsList(reqs) {
    const listEl = document.getElementById('admin-requests-list');
    const countEl = document.getElementById('requests-count');
    if (!listEl) return;
    if (countEl) countEl.textContent = reqs.length + (reqs.length === 1 ? ' заявка' : ' заявок');
    if (!reqs.length) { listEl.innerHTML = '<div class="loading-text" style="opacity:0.5">Заявок не найдено</div>'; return; }
    listEl.innerHTML = reqs.map(r => {
        const date = r.created_at ? new Date(r.created_at).toLocaleDateString('ru-RU') : '';
        const details = Object.entries(r).filter(([k])=>!['id','type','status','user_id','created_at','expires_at'].includes(k)).map(([k,v])=>v?`<b>${k}:</b> ${escHtml(String(v))}`:null).filter(Boolean).join('<br>');
        return `<div class="request-card"><div class="request-type">${REQUEST_TYPE_NAMES[r.type]||r.type} • ${date}</div><div class="request-player">${escHtml(r.username||'—')}</div><div class="request-data">${details}</div><div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)"><label style="font-size:11px;color:var(--text);letter-spacing:1px;text-transform:uppercase;display:block;margin-bottom:6px">💰 Стоимость (UnbelievaBoat)</label><div style="display:flex;gap:8px;align-items:center"><input type="number" id="cost-${r.id}" placeholder="0" min="0" style="background:#0d1117;border:1px solid var(--border);color:#fff;padding:7px 12px;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:13px;width:120px;outline:none"><span style="color:var(--text);font-size:13px">€</span></div></div><div class="request-actions"><button class="btn-approve" onclick="reviewRequest(${r.id},'approved')">✓ Одобрить</button><button class="btn-reject" onclick="reviewRequest(${r.id},'rejected')">✕ Отклонить</button></div></div>`;
    }).join('');
}

window.filterRequests = function() {
    const q = (document.getElementById('requests-search')?.value || '').toLowerCase().trim();
    const type = document.getElementById('requests-filter')?.value || 'all';
    let list = window._adminRequestsCache || [];
    if (type !== 'all') {
        const typeKey = type.replace(/-/g, '_');
        list = list.filter(r => r.type === typeKey);
    }
    if (q) list = list.filter(r => (r.username||'').toLowerCase().includes(q) || (r.char_name||'').toLowerCase().includes(q));
    renderAdminRequestsList(list);
};

window.reviewRequest = async function(id, status) {
    const reqs = await db(`requests?id=eq.${id}`);
    const req  = reqs?.[0];
    if (!req) return notify('Заявка не найдена', false);
    const cost = document.getElementById('cost-' + id)?.value || '0';
    let expiresAt = null;
    if (status==='approved' && EXPIRY_DAYS_DEFAULT[req.type]) { const exp = new Date(); exp.setDate(exp.getDate() + EXPIRY_DAYS_DEFAULT[req.type]); expiresAt = exp.toISOString(); }
    await db(`requests?id=eq.${id}`, { method:'PATCH', body: JSON.stringify({ status, ...(expiresAt?{expires_at:expiresAt}:{}) }) });
    if (status === 'approved') await applyApprovalSideEffects(req);
    const webhook = WEBHOOK_BY_TYPE[req.type] || WEBHOOK_PASSPORT_LICENSE;
    const typeNames = { passport:'🪪 Паспорт', medbook:'🏥 Мед. книжка', license:'🔫 Лицензия', faction_join:'🏛️ Вступление во фракцию', court:'⚖️ Судебный иск', government:'📋 Правительство', lawyer:'👨‍⚖️ Адвокат', opg_create:'💀 Создание ОПГ', opg_join:'💀 Вступление в ОПГ', mafia_create:'🤵 Создание Мафии', mafia_join:'🤵 Вступление в Мафию' };
    const emoji = status==='approved' ? '✅' : '❌';
    const label = status==='approved' ? 'ОДОБРЕНО' : 'ОТКЛОНЕНО';
    const dataFields = [];
    if (req.char_name)   dataFields.push({ name:'📛 ФИО',            value:req.char_name,   inline:true });
    if (req.dob)         dataFields.push({ name:'🎂 Дата рождения',  value:req.dob,         inline:true });
    if (req.reason)      dataFields.push({ name:'ℹ️ Доп. инфо',      value:req.reason,      inline:true });
    if (req.address)     dataFields.push({ name:'💼 Место работы',   value:req.address,     inline:true });
    if (req.faction)     dataFields.push({ name:'🏛️ Фракция',        value:req.faction,     inline:true });
    if (req.weapon_type) dataFields.push({ name:'🔫 Оружие',         value:req.weapon_type, inline:false });
    if (req.note)        dataFields.push({ name:'📋 Примечание',     value:req.note,        inline:false });
    if (expiresAt)       dataFields.push({ name:'📅 Действителен до', value:new Date(expiresAt).toLocaleDateString('ru-RU'), inline:true });
    if (status==='approved' && cost && cost !== '0') dataFields.push({ name:'💰 Стоимость', value:`${cost}€ — \`/eco add ${req.username} ${cost}\``, inline:false });
    await sendDiscordWebhook(webhook, {
        title: `${emoji} ${typeNames[req.type]||req.type} — ${label}`,
        color: status==='approved' ? 0x22c55e : 0xef4444,
        fields: [{ name:'👤 Игрок', value:req.username||'—', inline:true }, { name:'👮 Администратор', value:window.currentUser.username, inline:true }, ...dataFields],
        footer: { text:`Novosibirsk RP • ID: ${id}` },
        timestamp: new Date().toISOString()
    });
    notify(status==='approved' ? 'Одобрено!' : 'Отклонено!');
    loadAdminRequests();
};

// FIX 6: При одобрении заявки на вступление во фракцию/ОПГ/Мафию — фракция сразу
// проставляется пользователю на сайте (аналогично ручному изменению в таблице пользователей)
async function applyApprovalSideEffects(req) {
    if (!req.user_id) return;
    try {
        let factionValue = null;
        if (req.type === 'faction_join') factionValue = req.faction || null;
        else if (req.type === 'opg_join' || req.type === 'opg_create') factionValue = 'ОПГ';
        else if (req.type === 'mafia_join' || req.type === 'mafia_create') factionValue = 'Мафия';
        if (!factionValue) return;
        await db(`users?id=eq.${req.user_id}`, { method:'PATCH', body: JSON.stringify({ faction: factionValue }) });
        if (window.currentUser && window.currentUser.id === req.user_id) {
            window.currentUser.faction = factionValue;
            localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
            updateAuthZone();
        }
    } catch(e) { console.warn('applyApprovalSideEffects error', e); }
}

// ─── DOCUMENTS VIEWER ─────────────────────────

function renderDocCard(r, fields, icon, section) {
    const expLine = docExpiryLine(r);
    const isExpired = r.expires_at && new Date(r.expires_at) < new Date();
    const statusBadge = isExpired ? '<span class="badge badge-rejected">⏰ Истёк</span>' : '<span class="badge badge-approved">✓ Действителен</span>';
    const canM = canManageDocs(window.currentUser);
    const btns = canM ? `<div style="display:flex;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)"><button onclick="deleteRequest(${r.id},'${section}')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer">🗑 Удалить</button><button onclick="setExpiry(${r.id},'${section}')" style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);color:#fbbf24;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer">📅 Изменить срок</button></div>` : '';
    return `<div class="doc-card" style="flex-direction:column;align-items:stretch;gap:0;${isExpired?'opacity:0.6':''}"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px"><div style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;color:#fff">${icon} ${escHtml(r.char_name||r.username)}</div><div style="text-align:right">${statusBadge}${expLine?'<br>'+expLine:''}</div></div><div style="color:var(--text);font-size:14px;line-height:1.9;margin-top:12px;border-top:1px solid var(--border);padding-top:12px">${fields}</div>${btns}</div>`;
}

window._passportsCache = { passports: [], licenses: [], medbooks: [] };

window.loadPassports = async function() {
    const listEl = document.getElementById('passports-list');
    const loadEl = document.getElementById('passports-loading');
    const countEl = document.getElementById('passports-count');
    const u = window.currentUser;
    if (!u) return;
    const canSeeAll = isAdmin(u) || isPolice(u);
    const canMedbok = isMedic(u);
    if (!canSeeAll && !canMedbok) { if (listEl) listEl.innerHTML = '<div class="empty"><div class="empty-icon">🔒</div><p>Нет доступа</p></div>'; if (countEl) countEl.textContent = ''; return; }
    if (loadEl) loadEl.style.display = '';
    const [passports, licenses, medbooks] = await Promise.all([
        canSeeAll ? db('requests?type=eq.passport&status=eq.approved&order=created_at.desc') : Promise.resolve([]),
        canSeeAll ? db('requests?type=eq.license&status=eq.approved&order=created_at.desc') : Promise.resolve([]),
        (canSeeAll || canMedbok) ? db('requests?type=eq.medbook&status=eq.approved&order=created_at.desc') : Promise.resolve([]),
    ]);
    window._passportsCache = {
        passports: Array.isArray(passports) ? passports : [],
        licenses:  Array.isArray(licenses)  ? licenses  : [],
        medbooks:  Array.isArray(medbooks)  ? medbooks  : [],
    };
    if (loadEl) loadEl.style.display = 'none';
    const searchEl = document.getElementById('passports-search');
    const filterEl = document.getElementById('passports-filter');
    if (searchEl) searchEl.value = '';
    if (filterEl) filterEl.value = 'all';
    renderPassportsList();
};

function renderPassportsList() {
    const listEl = document.getElementById('passports-list');
    const countEl = document.getElementById('passports-count');
    if (!listEl) return;
    const u = window.currentUser;
    const canSeeAll = isAdmin(u) || isPolice(u);
    const canMedbok = isMedic(u);
    const q = (document.getElementById('passports-search')?.value || '').toLowerCase().trim();
    const filterType = document.getElementById('passports-filter')?.value || 'all';
    const matchQ = r => !q || (r.username||'').toLowerCase().includes(q) || (r.char_name||'').toLowerCase().includes(q);
    const { passports, licenses, medbooks } = window._passportsCache;
    let html = '', total = 0;

    if (canSeeAll && (filterType === 'all' || filterType === 'passport')) {
        const list = passports.filter(matchQ);
        total += list.length;
        html += `<div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:3px;color:#fff;margin-bottom:16px">🪪 Паспорта граждан</div>`;
        html += !list.length ? '<div class="loading-text" style="opacity:0.5;margin-bottom:32px">Ничего не найдено</div>' : '<div style="display:grid;gap:12px;margin-bottom:40px">' + list.map(r=>renderDocCard(r,`<b>👤 Игрок:</b> ${escHtml(r.username)}<br><b>📛 ФИО:</b> ${escHtml(r.char_name||'—')}<br><b>🎂 Дата рождения:</b> ${r.dob||'—'}<br><b>⚧ Пол:</b> ${escHtml(r.reason||'—')}<br><b>💼 Место работы:</b> ${escHtml(r.address||'—')}<br><b>🏠 Адрес:</b> ${escHtml(r.experience||'—')}`,'🪪','passports')).join('') + '</div>';
    }
    if (canSeeAll && (filterType === 'all' || filterType === 'license')) {
        const list = licenses.filter(matchQ);
        total += list.length;
        html += `<div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:3px;color:#fff;margin-bottom:16px">🔫 Лицензии на оружие</div>`;
        html += !list.length ? '<div class="loading-text" style="opacity:0.5;margin-bottom:32px">Ничего не найдено</div>' : '<div style="display:grid;gap:12px;margin-bottom:40px">' + list.map(r=>renderDocCard(r,`<b>👤 Игрок:</b> ${escHtml(r.username)}<br><b>📛 ФИО:</b> ${escHtml(r.char_name||'—')}<br><b>🏛️ Фракция:</b> ${escHtml(r.faction||'—')}<br><b>🔫 Оружие:</b> ${escHtml(r.weapon_type||'—')}`,'🔫','passports')).join('') + '</div>';
    }
    if ((canSeeAll || canMedbok) && (filterType === 'all' || filterType === 'medbook')) {
        const list = medbooks.filter(matchQ);
        total += list.length;
        html += `<div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:3px;color:#fff;margin-bottom:16px">🏥 Медицинские книжки</div>`;
        html += !list.length ? '<div class="loading-text" style="opacity:0.5">Ничего не найдено</div>' : '<div style="display:grid;gap:12px">' + list.map(r=>renderDocCard(r,`<b>👤 Игрок:</b> ${escHtml(r.username)}<br><b>📛 ФИО:</b> ${escHtml(r.char_name||'—')}<br><b>💼 Место работы:</b> ${escHtml(r.address||'—')}<br><b>🏥 Болезнь:</b> ${escHtml(r.note||'—')}`,'🏥','passports')).join('') + '</div>';
    }
    if (countEl) countEl.textContent = total + (total === 1 ? ' документ' : ' документов');
    listEl.innerHTML = html;
}

window.filterPassports = function() { renderPassportsList(); };

// ─── RULES ────────────────────────────────────

const RULES_DATA = {
    // FIX 2: Полный текст всех правил Discord — каждый пункт с полным описанием
    discord: [
        { title:'Неадекватное поведение, токсичность', text:'Запрещено неадекватное поведение, токсичность, спам, флуд, агрессия, угрозы, оскорбление родных.', punishment:'Предупреждение → мут (30 мин – 24 ч) → кик → перм бан', color:'red' },
        { title:'Реклама сторонних проектов', text:'Запрещена реклама сторонних проектов, других платформ, ссылок или скам-ссылок.', punishment:'Предупреждение → мут (1 – 24 ч) → кик → перм бан', color:'red' },
        { title:'Выдавать себя за администратора', text:'Запрещено выдавать себя за администратора или модератора сервера Discord.', punishment:'Предупреждение → мут (1 – 24 ч) → кик → перм бан', color:'red' },
        { title:'Оскорбления и неуважение', text:'Запрещены оскорбления и неуважение к игрокам, администрации и модерации.', punishment:'Предупреждение → мут (1 – 24 ч) → кик → перм бан', color:'red' },
        { title:'Мат только в рамках РП', text:'Мат разрешён только в рамках РП и без оскорблений личности.', punishment:'Предупреждение → мут (30 мин – 24 ч) → кик → перм бан', color:'yellow' },
        { title:'Мешать другим участникам', text:'Запрещено кричать, перекрикивать, перебивать, включать музыку, мешать другим участникам играть.', punishment:'Предупреждение → мут (1 – 24 ч) → кик → перм бан', color:'red' },
        { title:'Политические и религиозные темы', text:'Запрещено обсуждение пропагандных, национальных, политических и религиозных конфликтов.', punishment:'Предупреждение → мут (1 – 24 ч) → кик → перм бан', color:'red' },
        { title:'Публикация приватных данных', text:'Запрещена публикация приватных данных: фотографии, контакты и т.д.', punishment:'Предупреждение → мут (12 – 24 ч) → кик → перм бан', color:'red' },
        { title:'Препятствовать работе администрации', text:'Запрещено препятствовать работе администрации и модерации: вмешательство, фейковые жалобы и тикеты.', punishment:'Предупреждение → мут (12 – 24 ч) → кик → перм бан', color:'red' },
        { title:'ℹ️ Общее положение', text:'Зайдя на сервер, ты автоматически соглашаешься с данным уставом и обязуешься соблюдать его. При нарушении правил 2–3 раза тебя ждёт бан на несколько дней, а за многократные нарушения — навсегда.\nПравила могут меняться — следите за новостями. Незнание не освобождает от ответственности.', punishment:'', color:'blue' },
    ],
    rp: [
        { title:'NON RP', text:'Неподобающее игровому миру поведение. Отыгрывайте роль максимально приближённо к реальной жизни. Для жалоб используйте знак /', punishment:'Бан от 2 дней до перм бана', color:'red' },
        { title:'Неподчинение старшему по званию', text:'Неподчинение командам старшего по званию', punishment:'1 раз — предупреждение, 2 раз — бан от 2 дней', color:'yellow' },
        { title:'Неадекватное поведение в суде', text:'Неадекватное поведение в суде', punishment:'1 раз — предупреждение, 2 раз — бан от 2 дней', color:'yellow' },
        { title:'Увольнение ради спасения', text:'Увольняться с работы ради спасения кого-то', punishment:'Бан от 3 дней', color:'red' },
        { title:'Не остановка при просьбе админа', text:'Не остановиться при просьбе администратора', punishment:'Бан от 2 дней', color:'red' },
        { title:'Перекрытие дороги', text:'Перекрывать дорогу машиной или телом', punishment:'1 раз — предупреждение, 2 раз — бан от 2 дней', color:'yellow' },
        { title:'Неподчинение полиции', text:'Не подчиняться указаниям полиции: сесть в полицейскую машину и т.д.', punishment:'Бан от 3 дней', color:'red' },
        { title:'Грабёж без полиции', text:'Грабить если полиции нет на сервере', punishment:'1 раз — предупреждение, 2 раз — бан от 4 дней', color:'yellow' },
        { title:'Притворяться админом', text:'Притворяться администратором', punishment:'Бан от 3 дней', color:'red' },
        { title:'Вмешательство в погони', text:'Участвовать в погонях или перестрелках если ты не пострадавший', punishment:'1 раз — предупреждение, 2 раз — бан от 2 дней', color:'yellow' },
        { title:'Троллинг и фейковые вызовы', text:'Заниматься троллингом, фейковыми вызовами без причины', punishment:'Бан от 5 дней', color:'red' },
        { title:'Бессмысленные действия', text:'Бег без причины, флуд сиренами, тараны, бессмысленные действия', punishment:'1 раз — предупреждение, 2 раз — бан от 2 дней', color:'yellow' },
        { title:'Тиминг', text:'Тиминг — полицейский не может помогать преступнику, скорая не должна помогать только преступникам', punishment:'Бан от 4 дней', color:'red' },
        { title:'Скутер при побеге', text:'Использование скутера во время побега от полиции', punishment:'1 раз — предупреждение, 2 раз — бан от 2 дней', color:'yellow' },
        { title:'Выход из игры в РП', text:'Выходить из игры во время RP процесса без весомой причины', punishment:'1 раз — предупреждение, 2 раз — бан от 2 дней', color:'yellow' },
        { title:'Грабёж свыше лимита', text:'Грабить у игрока больше 8К в день', punishment:'1 раз — предупреждение, 2 раз — бан от 3 дней', color:'yellow' },
        { title:'Преследование после ограбления', text:'Останавливать, угрожать, убивать и преследовать игрока после ограбления на сумму 8К', punishment:'1 раз — предупреждение, 2 раз — бан от 3 дней', color:'yellow' },
        { title:'Убийство ОПГ без причины', text:'Убивать ОПГшников без причины и преследовать их после ограбления на 8К', punishment:'1 раз — предупреждение, 2 раз — бан от 3 дней', color:'yellow' },
        { title:'КАФ без причины', text:'Проверять наручниками или арестовывать без причины', punishment:'1 раз — предупреждение, 2 раз — бан от 3 дней', color:'yellow' },
        { title:'Перестрелка ради фана', text:'Создавать перестрелку ради фана и убивать в большом количестве', punishment:'Бан от 4 дней', color:'red' },
        { title:'Цена выкупа', text:'Цена выкупа больше 18.000 Евро', punishment:'1 раз — предупреждение, 2 раз — бан от 2 дней', color:'yellow' },
        { title:'Размер ОПГ', text:'Больше 5 человек в ОПГ', punishment:'1 раз — предупреждение, 2 раз — бан от 3 дней', color:'yellow' },
        { title:'Убийство после лечения', text:'Убивать после лечения медика', punishment:'1 раз — предупреждение, 2 раз — бан от 2 дней', color:'yellow' },
        { title:'Неоплата штрафа', text:'Не оплата штрафа без розыска', punishment:'1 раз — предупреждение, 2 раз — бан от 2 дней', color:'yellow' },
        { title:'Блокировка машин', text:'Блокировать машины телом', punishment:'1 раз — предупреждение, 2 раз — бан от 2 дней', color:'yellow' },
        { title:'Игнорирование вызовов', text:'Не отвечать на вызовы диспетчера и игрока', punishment:'1 раз — предупреждение, 2 раз — бан от 2 дней', color:'yellow' },
        { title:'Бомбы на транспорте', text:'Клеить бомбы на транспортное средство и применять их как орудия убийства', punishment:'Бан от 4 дней', color:'red' },
    ],
    ic: [
        { num:'1',  title:'Поведение персонажа',       text:'Твой персонаж обязан вести себя как реальный человек. Запрещено играть супергероя, бога, нарочно вести себя нереалистично', punishment:'Бан 2 дня', color:'red' },
        { num:'2',  title:'Отыгрыш действий',          text:'Все ключевые действия персонажа отыгрываются через чат (/me, /do). Пример: /me достал кошелёк и передал деньги', punishment:'', color:'blue' },
        { num:'3',  title:'Совершеннолетие персонажа', text:'Твой персонаж должен быть совершеннолетним. RP детей и подростков без разрешения сервера — запрещён', punishment:'Бан 2 дня', color:'red' },
        { num:'4',  title:'Погоня окончена',           text:'Если преступник скрылся от полиции — полицейский прекращает задержание. Персонаж забывает номер, марку и цвет машины, и игрока которого преследовал', punishment:'', color:'blue' },
        { num:'5',  title:'Смерть персонажа',          text:'После смерти персонаж не помнит кто его убил и что произошло. Нельзя возвращаться на место смерти минимум 15 минут', punishment:'Бан 3 дня', color:'red' },
        { num:'6',  title:'IC жалобы',                 text:'IC-жалобы и разбирательства — через суд или мэрию, не в OOC-чате (Discord, микрофон, баги, реальная жизнь)', punishment:'', color:'blue' },
        { num:'7',  title:'Срыв мероприятий',          text:'Запрещено срывать мероприятия или ивенты', punishment:'Бан 4 дня + запрет на ивенты', color:'red' },
        { num:'8',  title:'NON RP SKINS',              text:'Запрещены скины которые слишком большие, маленькие или дают преимущество', punishment:'Предупреждение, бан 2 дня', color:'yellow' },
        { num:'9',  title:'SAVE ZONE',                 text:'Запрещены убийства и перестрелки в безопасных зонах: больница, полицейский участок, пожарная часть, суд, автобусная станция, СТО', punishment:'Предупреждение, бан 2 дня', color:'yellow' },
        { num:'10', title:'Save Live RP',              text:'Бойтесь за свою сохранность и делайте всё возможное чтобы выжить. Подчиняйтесь если вас окружили', punishment:'Бан 2 дня', color:'red' },
        { num:'11', title:'Cheating',                  text:'Использование читов — строжайший запрет', punishment:'Перм бан', color:'red' },
        { num:'12', title:'Токсичность на сервере',    text:'Токсичное и оскорбительное поведение в сторону игроков на сервере', punishment:'Бан 2 дня', color:'red' },
        { num:'13', title:'Spawn Kemp',                text:'Не выжидайте игроков на их спавне когда они не вышли из него', punishment:'Бан 2 дня', color:'red' },
        { num:'14', title:'MG (Metagaming)',            text:'Нельзя использовать информацию из Discord, стрима, OOC-чата если персонаж IC это не знает', punishment:'Бан 3 дня', color:'red' },
        { num:'15', title:'RDM (Random Deathmatch)',   text:'Убийство без причины и отыгровки', punishment:'Бан 2 дня', color:'red' },
        { num:'16', title:'VDM (Vehicle Deathmatch)',  text:'Убийство машиной без причины и RP-ситуации', punishment:'Бан 2 дня', color:'red' },
        { num:'17', title:'Раздражение структур',      text:'Нельзя специально раздражать полицию, медиков или другие государственные структуры ради внимания', punishment:'Бан 2 дня', color:'red' },
        { num:'18', title:'Powergaming',               text:'Запрещены невозможные действия или не давать другим реагировать. Пример: /me быстро обездвижил 3 человек и убежал', punishment:'Бан 2 дня', color:'red' },
        { num:'19', title:'Реальные угрозы в IC',      text:'RP — это игра. Любые реальные угрозы, даже сказанные IC — запрещены', punishment:'Бан 3 дня', color:'red' },
    ],
    uk: [
        { num:'1',  title:'Убийство (1 степень)',                  text:'Умышленное лишение жизни другого персонажа', punishment:'от 8 до 20 лет тюрьмы', color:'red' },
        { num:'2',  title:'Покушение на убийство (2 степень)',     text:'Попытка убить другого без успеха', punishment:'от 6 до 15 лет тюрьмы', color:'red' },
        { num:'3',  title:'Причинение тяжкого вреда здоровью',    text:'Серьёзные телесные повреждения, нанесённые умышленно', punishment:'от 6 до 10 лет тюрьмы', color:'red' },
        { num:'4',  title:'Побои / нападение без оружия',          text:'Избиение без использования оружия', punishment:'от 15 суток или исправительные работы', color:'yellow' },
        { num:'5',  title:'Кража',                                 text:'Похищение чужого имущества (без насилия)', punishment:'Зависит от квалификации', color:'yellow' },
        { num:'6',  title:'Разбой',                                text:'Грабёж с применением оружия или угроз', punishment:'от 5 до 15 лет тюрьмы', color:'red' },
        { num:'7',  title:'Неоплата штрафа',                      text:'Всё зависит от суммы общего штрафа', punishment:'от 6 до 10 лет тюрьмы', color:'yellow' },
        { num:'8',  title:'Хулиганство',                           text:'Грубое нарушение общественного порядка', punishment:'от 5 лет тюрьмы', color:'yellow' },
        { num:'9',  title:'Неподчинение полиции',                 text:'Отказ подчиняться приказам офицера', punishment:'от 15 суток или штраф 6000€', color:'yellow' },
        { num:'10', title:'Побег из-под стражи',                  text:'Попытка сбежать из-под ареста или тюрьмы', punishment:'от 4 лет тюрьмы', color:'red' },
        { num:'11', title:'Уход от погони',                       text:'Попытка скрыться от полиции на транспорте', punishment:'от 15 суток тюрьмы', color:'yellow' },
        { num:'12', title:'Нелегальное оружие',                   text:'Хранение или использование незарегистрированного оружия', punishment:'от 3 до 15 лет тюрьмы', color:'red' },
        { num:'13', title:'Опасное вождение',                     text:'Таран, дрифт, опасная езда', punishment:'Штраф 5000€', color:'yellow' },
        { num:'14', title:'Клевета',                               text:'Распространение заведомо ложных сведений', punishment:'от 5 лет тюрьмы', color:'yellow' },
        { num:'15', title:'Захват заложника',                     text:'Захват или удержание лица в качестве заложника', punishment:'от 5 до 8 лет тюрьмы', color:'red' },
        { num:'16', title:'Вандализм',                            text:'Осквернение или порча имущества', punishment:'от 2 лет тюрьмы', color:'yellow' },
        { num:'17', title:'Уход с места ДТП',                    text:'Покидание места Дорожно-Транспортного Происшествия', punishment:'Штраф 5000€ и от 2 лет тюрьмы', color:'yellow' },
        { num:'18', title:'Незаконное проникновение',             text:'Незаконное проникновение на охраняемый объект', punishment:'от 3 до 4 лет тюрьмы', color:'yellow' },
        { num:'19', title:'Получение взятки',                     text:'Получение должностным лицом взятки', punishment:'от 4 до 6 лет тюрьмы', color:'red' },
        { num:'20', title:'Дача взятки',                          text:'Дача взятки должностному лицу', punishment:'от 5 лет тюрьмы', color:'red' },
        { num:'21', title:'Превышение должностных полномочий',    text:'Действия должностного лица явно выходящие за пределы его полномочий', punishment:'от 6 до 8 лет тюрьмы', color:'red' },
        { num:'22', title:'Похищение человека',                   text:'Похищение человека', punishment:'от 5 лет тюрьмы', color:'red' },
        { num:'23', title:'Угрозы',                               text:'Угрозы насилием или физической расправой', punishment:'от 2 до 3 лет тюрьмы', color:'yellow' },
        { num:'24', title:'Мошенничество (скам)',                 text:'Скам на деньги', punishment:'Штраф 3000€ + вернуть деньги или 3 года тюрьмы', color:'red' },
        { num:'25', title:'Неподчинение и неоплата штрафа',       text:'Неподчинение и неоплата штрафа', punishment:'7 лет тюрьмы', color:'red' },
        { num:'26', title:'Соучастие в преступлении',             text:'Зависит от преступления, срок немного уменьшен', punishment:'Зависит от преступления', color:'yellow' },
        { num:'27', title:'Самоуправство',                        text:'Самовольное совершение действий правомерность которых оспаривается', punishment:'По решению суда', color:'yellow' },
    ],
    police: [
        { title:'Права задержанного', text:'Каждый задержанный имеет право: на один звонок (до 3 минут), на молчание, на адвоката, на расшифровку статей, на отказ от судебного заседания', color:'blue' },
        { title:'Основания для задержания', text:'1) Лицо застигнуто при совершении преступления\n2) Потерпевшие или очевидцы укажут на лицо как совершившее преступление\n3) На лице или его вещах обнаружены явные следы преступления', color:'blue' },
        { title:'Порядок задержания', text:'1) Представиться (имя, фамилия, звание, ведомство)\n2) Сказать причину задержания\n3) Разъяснить права\n4) Установить личность в участке\n5) Реализовать законные права задержанного\n6) Вызвать судью (тикет)', color:'blue' },
        { title:'Ожидание судьи и адвоката', text:'Если судья не прибыл в течение 5 минут — разрешается доставить подозреваемого в тюрьму. Сотрудник обязан ждать адвоката 5 минут после его вызова', color:'yellow' },
        { title:'Права защитника', text:'1) Конфиденциальный разговор с задержанным (не более 7 минут)\n2) Присутствовать при предъявлении обвинения\n3) Знакомиться с материалами уголовного дела\n4) Участвовать в допросе подозреваемого', color:'blue' },
        { title:'Судебное разбирательство', text:'Начинается только после начала заседания судьёй. Обязаны быть выслушаны обе стороны. Если ответчик не прибыл — суд рассматривает доказательства истца без него.', color:'blue' },
        { title:'Гражданский арест', text:'Сила при гражданском аресте соразмерна нарушению. После ареста — вызвать полицию или доставить преступника в суд.', color:'yellow' },
        { title:'Следственные действия', text:'Обыск, выемка, контроль и запись переговоров, допрос, проверка показаний на месте, осмотр', color:'blue' },
    ],
    admin: [
        { num:'1.1', title:'Лицо сервера', text:'Администрация/Модерация — лицо сервера. Каждый администратор обязан соблюдать нормы поведения, уважительно относиться к игрокам и коллегам', color:'blue' },
        { num:'1.2', title:'Равенство перед правилами', text:'Все администраторы равны перед правилами, независимо от ранга и стажа', color:'blue' },
        { num:'1.3', title:'Задача администрации', text:'Поддерживать RP-атмосферу, порядок и справедливость', color:'blue' },
        { num:'1.5', title:'Транспорт', text:'Администратор на сервере при использовании должностных полномочий обязан строго брать свою машину', color:'yellow' },
        { num:'2.1', title:'Злоупотребление полномочиями', text:'Запрещено злоупотребление полномочиями в личных целях: наказания «по знакомству», помощь друзьям, выдача преимуществ', punishment:'Предупреждение → понижение → снятие', color:'red' },
        { num:'2.2', title:'Провокации', text:'Запрещено провоцировать игроков или участвовать в конфликтах вне административных рамок', punishment:'Предупреждение → понижение', color:'red' },
        { num:'2.3', title:'Нейтралитет', text:'Администратор должен сохранять нейтралитет во всех RP-ситуациях. Личные симпатии не должны влиять на решения', color:'blue' },
        { num:'3.2', title:'Обращения игроков', text:'Не игнорируй обращения в репорт без причины', color:'yellow' },
        { num:'4.3', title:'Fly запрещён', text:'Запрещено использовать fly', punishment:'Предупреждение', color:'red' },
        { num:'4.5', title:'Строительство', text:'Не строй без согласования главного администратора', punishment:'Предупреждение → снятие', color:'red' },
        { num:'5.1', title:'Субординация', text:'Соблюдай субординацию — уважай старших по рангу и помогай младшим', color:'blue' },
        { num:'5.2', title:'Конфиденциальность', text:'Не выноси внутренние обсуждения и конфликты за пределы администрации', punishment:'Понижение ранга или снятие', color:'red' },
        { num:'6.1', title:'Ответственность', text:'Нарушение правил влечёт предупреждение, понижение или снятие с должности.', color:'red' },
    ],
    pdd: [
        { num:'1',  title:'Езда по встречной полосе',        text:'Движение строго по правой полосе', punishment:'Штраф 2000€ или 3000€ дискорд валютой', color:'red' },
        { num:'2',  title:'Обгон по двойной сплошной',       text:'Запрещён обгон по второй сплошной линии', punishment:'Штраф 2500€ или 3500€ дискорд валютой', color:'red' },
        { num:'3',  title:'Разворот не в положенном месте',  text:'Разворот разрешён только в специально отведённых местах', punishment:'Штраф 2000€ или 3000€ дискорд валютой', color:'yellow' },
        { num:'4',  title:'Езда по тротуарам',               text:'Запрещено движение по тротуарам', punishment:'Штраф 1000€ или 2000€ дискорд валютой', color:'yellow' },
        { num:'5',  title:'Езда на красный сигнал',          text:'Запрещено проезжать на красный сигнал светофора', punishment:'Штраф 1500€ или 2500€ дискорд валютой', color:'red' },
        { num:'6',  title:'Превышение скорости',             text:'Соблюдайте установленные скоростные ограничения', punishment:'Штраф 2000€ или 3000€ дискорд валютой', color:'yellow' },
        { num:'7',  title:'Езда с выключенными фарами',      text:'Фары должны быть включены в тёмное время суток', punishment:'Штраф 1700€ или 2700€ дискорд валютой', color:'yellow' },
        { num:'8',  title:'Неиспользование поворотников',    text:'Обязательно использовать поворотники при маневрировании', punishment:'Штраф 1000€ или 2000€ дискорд валютой', color:'yellow' },
        { num:'9',  title:'Несоблюдение знаков',             text:'Соблюдение знаков дорожного движения обязательно', punishment:'Штраф 1600€ или 2600€ дискорд валютой', color:'yellow' },
        { num:'10', title:'Виновник — патрульный полицейский', text:'Если виновник ДТП является патрульным полицейским', punishment:'Штраф от 1000€–4000€ + оплатить ремонт', color:'red' },
        { num:'11', title:'Остановка в неположенном месте',  text:'Запрещена остановка на железных путях, тоннелях, мостах или на остановках для автобусов', punishment:'Штраф 2500€ или 3500€ дискорд валютой', color:'red' },
        { num:'12', title:'Вождение в нетрезвом виде',       text:'Езда в алкогольном опьянении строго запрещена', punishment:'Арест на 15 суток', color:'red' },
        { num:'13', title:'Парковка в неположенном месте',   text:'Парковаться только в разрешённых местах', punishment:'Штраф 1500€ + машина на штраф-стоянку (ХАРС)', color:'yellow' },
        { num:'14', title:'Алкотест и обыск',                text:'Водитель обязан по требованию полиции или ФСБ пройти алкотест, наркотест и обыск', color:'blue' },
        { num:'15', title:'Предъявление документов',         text:'Водитель обязан показать документы при наличии весомых причин у сотрудника', color:'blue' },
        { num:'16', title:'Беспричинный сигнал',             text:'Запрещено сигналить без причины', punishment:'Штраф 1000€ или 2000€ дискорд валютой', color:'yellow' },
    ]
};

const RULE_COLORS = {
    red:    { bg:'rgba(239,68,68,0.06)',  border:'rgba(239,68,68,0.2)',  badge:'rgba(239,68,68,0.15)',  text:'#f87171' },
    yellow: { bg:'rgba(251,191,36,0.06)', border:'rgba(251,191,36,0.2)', badge:'rgba(251,191,36,0.15)', text:'#fbbf24' },
    blue:   { bg:'rgba(14,165,233,0.06)', border:'rgba(14,165,233,0.2)', badge:'rgba(14,165,233,0.15)', text:'#38bdf8' },
    green:  { bg:'rgba(34,197,94,0.06)',  border:'rgba(34,197,94,0.2)',  badge:'rgba(34,197,94,0.15)',  text:'#22c55e' },
};

// FIX 2: renderRuleCard теперь всегда показывает полный текст
function renderRuleCard(r) {
    const c = RULE_COLORS[r.color] || RULE_COLORS.blue;
    const num = r.num ? `<span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${c.text};background:${c.badge};padding:2px 8px;border-radius:6px;margin-right:8px">§${r.num}</span>` : '';
    const punishment = r.punishment ? `<div style="margin-top:8px;display:flex;align-items:flex-start;gap:8px"><span style="font-size:13px">⚠️</span><span style="font-size:13px;color:${c.text};font-weight:600">${escHtml(r.punishment)}</span></div>` : '';
    const titleHtml = r.title ? `<div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:${r.text?'6px':'0'}">${num}${escHtml(r.title)}</div>` : '';
    const bodyHtml  = r.text  ? `<div style="color:var(--text);font-size:14px;line-height:1.7;white-space:pre-line">${escHtml(r.text)}</div>` : '';
    return `<div style="background:${c.bg};border:1px solid ${c.border};border-radius:14px;padding:16px 18px;margin-bottom:10px"><div style="flex:1;min-width:200px">${titleHtml}${bodyHtml}${punishment}</div></div>`;
}

function renderRuleSection(key, targetId) {
    const el = document.getElementById(targetId);
    if (!el || el.dataset.loaded) return;
    const rules = RULES_DATA[key];
    if (!rules) return;
    el.innerHTML = rules.map(r => renderRuleCard(r)).join('');
    el.dataset.loaded = '1';
}

window.switchRules = function(section) {
    document.querySelectorAll('.rules-section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('[data-rules]').forEach(b => b.classList.remove('active'));
    const el = document.getElementById('rules-' + section);
    if (el) el.style.display = 'block';
    document.querySelectorAll(`[data-rules="${section}"]`).forEach(b => b.classList.add('active'));
    renderRuleSection(section, 'rules-' + section + '-list');
};

// ─── UTILS ────────────────────────────────────

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── INIT ─────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    updateAuthZone();
    renderProfile();
    loadNews();
    loadCriminalCounters();
    loadSiteSettings();

    document.getElementById('login-password')?.addEventListener('keydown', e => { if(e.key==='Enter') handleLogin(); });
    document.getElementById('reg-password2')?.addEventListener('keydown',  e => { if(e.key==='Enter') handleRegister(); });

    // FIX 4: Мультиселект — добавляем CSS чтобы выделение работало нормально
    const wpnSel = document.getElementById('license-weapons');
    if (wpnSel) {
        // Убираем атрибут size чтобы браузер сам определял высоту через CSS
        wpnSel.style.height = 'auto';
        wpnSel.style.overflowY = 'auto';
        wpnSel.style.maxHeight = '200px';
    }

    if (location.hash) readHash();
});
