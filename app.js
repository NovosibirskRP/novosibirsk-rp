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
    opg_create:   WEBHOOK_MEDBOOK,// ═══════════════════════════════════════════════
//  NOVOSIBIRSK RP — app.js v4.1 (bugfix)
// ═══════════════════════════════════════════════// ═══════════════════════════════════════════════
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

const WEBHOOK_PASSPORT_LICENSE  = "https://discord.com/api/webhooks/1512820632058986547/OniZFPqznfcU7vdI2vdRVWrpJ8k5JBL6v5BJZpLVLXYYa6p0TW5fs8TGuzklSAu18dlc";
const WEBHOOK_WEAPON_LICENSE    = "https://discord.com/api/webhooks/1528866353325539610/xIJdu9OOBBPPSuvFHTOVg3ngcleF_PBopE9z_b7POzsaWpsYl-iMIhpOx7h05VcMfbUc";
const WEBHOOK_DRIVING_LICENSE   = "https://discord.com/api/webhooks/1528866837515862066/FeZYEugNHW2axmpAa60Hn2sGZyApdxDG5giBr5uQvUCWwvFS4F39ekb7sb0TKA-tmqWA";
const WEBHOOK_MEDBOOK            = "https://discord.com/api/webhooks/1512820863924310270/8NT6tTfotF0iOlfavrKNVeSN4BF3Z1WgTDEa8EoVHZiVfgdrXdH8EfVqBc1qSrvTqZyQ";
const WEBHOOK_COURT              = "https://discord.com/api/webhooks/1528867564531486851/H4uDTOtXB-MT09zZbYtuj4MEUhOLoonBevimEMZHvTHBizfjvwud_Oupet9G0NSQupVA";

const WEBHOOK_BY_TYPE = {
    passport:        WEBHOOK_PASSPORT_LICENSE,
    license:         WEBHOOK_WEAPON_LICENSE,
    driving_license: WEBHOOK_DRIVING_LICENSE,
    medbook:         WEBHOOK_MEDBOOK,
    faction_join:    WEBHOOK_MEDBOOK,
    opg_create:      WEBHOOK_MEDBOOK,
    opg_join:        WEBHOOK_MEDBOOK,
    mafia_create:    WEBHOOK_MEDBOOK,
    mafia_join:      WEBHOOK_MEDBOOK,
    court:           WEBHOOK_COURT,
    government:      WEBHOOK_PASSPORT_LICENSE,
    lawyer:          WEBHOOK_MEDBOOK,
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

// Сроки действия документов и оплата за их оформление отменены по решению администрации.
const OPG_MAX   = 2;
const MAFIA_MAX = 1;

window.currentUser = JSON.parse(localStorage.getItem('nrp_user') || 'null');
window._siteToken = localStorage.getItem('nrp_token') || null;

// ─── SITE-ADMIN EDGE FUNCTION ─────────────────
// Все чувствительные действия (логин/регистрация, смена роли/фракции, сброс пароля,
// одобрение заявок, публикация/удаление новостей, настройки владельца) теперь идут
// не напрямую в Supabase анонимным ключом, а через Edge Function site-admin,
// которая проверяет права на сервере и пишет в базу через service_role.
async function callSiteApi(action, payload = {}) {
    const res = await fetch(SUPABASE_URL + '/functions/v1/site-admin', {
        method: 'POST',
        headers: H,
        body: JSON.stringify({ action, token: window._siteToken, ...payload })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Ошибка (${res.status})`);
    return data;
}

// ─── БЕЗОПАСНОСТЬ ПАРОЛЕЙ ─────────────────────
// Пароли больше не хранятся в открытом виде. Для каждого пароля генерируется
// случайная соль, и в базу пишется "соль$хэш" (SHA-256). Логин сравнивает хэши,
// а не сами пароли. Это не полноценный серверный bcrypt (сайт работает без
// собственного бэкенда, напрямую с Supabase), но пароли пользователей больше
// не читаются напрямую из базы — это уже совсем другой уровень защиты.
// Хеширование/проверка паролей больше не выполняются в браузере — это делает
// только Edge Function site-admin на сервере (через service_role), клиент
// присылает пароль только по HTTPS в момент логина/регистрации/смены пароля.

// Требования к паролю при регистрации: не даём выбрать слишком простой пароль.
const COMMON_WEAK_PASSWORDS = ['12345678','password','qwerty123','11111111','123456789','qwertyui','admin123','password1','1q2w3e4r','00000000'];
function checkPasswordStrength(p) {
    if (!p || p.length < 8) return { ok:false, reason:'Пароль должен быть не менее 8 символов' };
    if (!/[a-zа-я]/i.test(p) || !/[0-9]/.test(p)) return { ok:false, reason:'Пароль должен содержать и буквы, и цифры' };
    if (!/[A-ZА-Я]/.test(p) || !/[a-zа-я]/.test(p)) return { ok:false, reason:'Пароль должен содержать буквы разных регистров (заглавные и строчные)' };
    if (/^(.)\1+$/.test(p)) return { ok:false, reason:'Пароль не должен состоять из одного повторяющегося символа' };
    if (COMMON_WEAK_PASSWORDS.includes(p.toLowerCase())) return { ok:false, reason:'Этот пароль слишком распространён, выберите другой' };
    return { ok:true, reason:'' };
}

window.renderPasswordStrength = function() {
    const el = document.getElementById('reg-password-strength');
    if (!el) return;
    const p = document.getElementById('reg-password')?.value || '';
    if (!p) { el.textContent = 'Минимум 8 символов, буквы и цифры разных регистров'; el.style.color = 'var(--text)'; return; }
    const res = checkPasswordStrength(p);
    el.textContent = res.ok ? '✓ Пароль подходит' : '✕ ' + res.reason;
    el.style.color = res.ok ? '#4ade80' : '#f87171';
};

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
    services: { passport:true, medbook:true, license:true, 'driving-license':true, 'faction-join':true, court:true, government:true, lawyer:true, home:true, credit:true, 'opg-mafia':true },
    registration_open: true,
    banner: {
        active: true,
        label: 'ОБНОВЛЕНИЕ',
        version: 'Версия V3.15',
        infoLabel: 'ЧТО НОВОГО',
        info: 'Ювелирный магазин & Дальнобойщики',
        timerLabel: 'ДО ВЫХОДА',
        timerTarget: '2026-07-10T21:00:00+03:00'
    },
    // FIX 7: метаданные фракций (цвет / категория / статус "скоро"), редактируемые в панели владельца
    factionMeta: {}
};
window.siteFlags = DEFAULT_SITE_FLAGS;

const FACTION_CATEGORY_LABELS = { government:'ГОСУДАРСТВЕННАЯ', criminal:'КРИМИНАЛЬНАЯ', other:'ИНОЕ' };
const FACTION_CATEGORY_COLORS = { government:'#3b82f6', criminal:'#f87171', other:'#a855f7' };

async function loadSiteSettings() {
    try {
        const rows = await db('site_settings?key=eq.site_flags&select=value');
        if (Array.isArray(rows) && rows[0] && rows[0].value) {
            const flags = rows[0].value;
            window.siteFlags = Object.assign({}, DEFAULT_SITE_FLAGS, flags, {
                tabs: Object.assign({}, DEFAULT_SITE_FLAGS.tabs, flags.tabs || {}),
                services: Object.assign({}, DEFAULT_SITE_FLAGS.services, flags.services || {}),
                banner: Object.assign({}, DEFAULT_SITE_FLAGS.banner, flags.banner || {}),
                factionMeta: Object.assign({}, DEFAULT_SITE_FLAGS.factionMeta, flags.factionMeta || {})
            });
        } else {
            await db('site_settings', { method:'POST', body: JSON.stringify({ key:'site_flags', value: DEFAULT_SITE_FLAGS }) }).catch(()=>{});
        }
    } catch(e) { console.warn('site_settings load error', e); }
    applySiteFlags();
    renderUpdateBanner();
    fillBannerAdminForm();
    applyFactionMeta();
    loadFactionManager();
}

// ─── БАННЕР ОБНОВЛЕНИЙ (редактируется админами из профиля) ──
function renderUpdateBanner() {
    const b = (window.siteFlags && window.siteFlags.banner) || DEFAULT_SITE_FLAGS.banner;
    const container = document.getElementById('site-banner');
    if (!container) return;
    container.style.display = b.active === false ? 'none' : '';
    const elLabel = document.getElementById('banner-version-label');
    const elValue = document.getElementById('banner-version-value');
    const elInfoLabel = document.getElementById('banner-info-label');
    const elInfo = document.getElementById('banner-info-value');
    const elTimerLabel = document.getElementById('banner-timer-label');
    if (elLabel) elLabel.textContent = b.label || DEFAULT_SITE_FLAGS.banner.label;
    if (elValue) elValue.textContent = b.version || DEFAULT_SITE_FLAGS.banner.version;
    if (elInfoLabel) elInfoLabel.textContent = b.infoLabel || DEFAULT_SITE_FLAGS.banner.infoLabel;
    if (elInfo) elInfo.textContent = b.info || DEFAULT_SITE_FLAGS.banner.info;
    if (elTimerLabel) elTimerLabel.textContent = b.timerLabel || DEFAULT_SITE_FLAGS.banner.timerLabel;
    startUpdateCountdown(b.timerTarget || DEFAULT_SITE_FLAGS.banner.timerTarget);

    // Иконки блоков (необязательные — можно поменять эмодзи в каждом блоке)
    const icon1 = document.getElementById('banner-icon-1'); if (icon1) icon1.textContent = b.icon1 || '🚀';
    const icon2 = document.getElementById('banner-icon-2'); if (icon2) icon2.textContent = b.icon2 || '💎';
    const icon3 = document.getElementById('banner-icon-3'); if (icon3) icon3.textContent = b.icon3 || '⏳';

    // Показ/скрытие отдельных блоков баннера
    const s1 = document.getElementById('banner-section-1'); if (s1) s1.style.display = b.showSection1 === false ? 'none' : '';
    const s2 = document.getElementById('banner-section-2'); if (s2) s2.style.display = b.showSection2 === false ? 'none' : '';
    const s3 = document.getElementById('banner-section-3'); if (s3) s3.style.display = b.showSection3 === false ? 'none' : '';
    const d1 = document.getElementById('banner-divider-1'); if (d1) d1.style.display = b.showSection1 === false ? 'none' : '';
    const d2 = document.getElementById('banner-divider-2'); if (d2) d2.style.display = b.showSection2 === false ? 'none' : '';

    // Необязательная кнопка-ссылка (CTA) — 4-й, дополнительный блок баннера
    const ctaSection = document.getElementById('banner-section-cta');
    const ctaDivider = document.getElementById('banner-divider-cta');
    const ctaLink = document.getElementById('banner-cta-link');
    const showCta = !!(b.ctaText && b.ctaUrl);
    if (ctaSection) ctaSection.style.display = showCta ? '' : 'none';
    if (ctaDivider) ctaDivider.style.display = showCta ? '' : 'none';
    if (ctaLink && showCta) { ctaLink.textContent = b.ctaText; ctaLink.href = b.ctaUrl; }
}

function fillBannerAdminForm() {
    const b = (window.siteFlags && window.siteFlags.banner) || DEFAULT_SITE_FLAGS.banner;
    const activeEl = document.getElementById('banner-admin-active'); if (activeEl) activeEl.checked = b.active !== false;
    const set = (id, val) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = val || ''; };
    set('banner-admin-label', b.label);
    set('banner-admin-version', b.version);
    set('banner-admin-infolabel', b.infoLabel);
    set('banner-admin-info', b.info);
    set('banner-admin-timerlabel', b.timerLabel);
    set('banner-admin-icon1', b.icon1);
    set('banner-admin-icon2', b.icon2);
    set('banner-admin-icon3', b.icon3);
    set('banner-admin-cta-text', b.ctaText);
    set('banner-admin-cta-url', b.ctaUrl);
    const s1 = document.getElementById('banner-admin-show1'); if (s1) s1.checked = b.showSection1 !== false;
    const s2 = document.getElementById('banner-admin-show2'); if (s2) s2.checked = b.showSection2 !== false;
    const s3 = document.getElementById('banner-admin-show3'); if (s3) s3.checked = b.showSection3 !== false;
    if (b.timerTarget) {
        const el = document.getElementById('banner-admin-timer');
        if (el && document.activeElement !== el) {
            try { el.value = new Date(b.timerTarget).toISOString().slice(0,16); } catch(e){}
        }
    }
}

window.saveBannerSettings = async function() {
    if (!isAdmin(window.currentUser)) return notify('Нет доступа', false);
    const active = document.getElementById('banner-admin-active')?.checked !== false;
    const label = document.getElementById('banner-admin-label')?.value.trim() || DEFAULT_SITE_FLAGS.banner.label;
    const version = document.getElementById('banner-admin-version')?.value.trim() || DEFAULT_SITE_FLAGS.banner.version;
    const infoLabel = document.getElementById('banner-admin-infolabel')?.value.trim() || DEFAULT_SITE_FLAGS.banner.infoLabel;
    const info = document.getElementById('banner-admin-info')?.value.trim() || '';
    const timerLabel = document.getElementById('banner-admin-timerlabel')?.value.trim() || DEFAULT_SITE_FLAGS.banner.timerLabel;
    const timerRaw = document.getElementById('banner-admin-timer')?.value;
    const timerTarget = timerRaw ? new Date(timerRaw).toISOString() : null;
    const icon1 = document.getElementById('banner-admin-icon1')?.value.trim() || '🚀';
    const icon2 = document.getElementById('banner-admin-icon2')?.value.trim() || '💎';
    const icon3 = document.getElementById('banner-admin-icon3')?.value.trim() || '⏳';
    const ctaText = document.getElementById('banner-admin-cta-text')?.value.trim() || '';
    const ctaUrl = document.getElementById('banner-admin-cta-url')?.value.trim() || '';
    const showSection1 = document.getElementById('banner-admin-show1')?.checked !== false;
    const showSection2 = document.getElementById('banner-admin-show2')?.checked !== false;
    const showSection3 = document.getElementById('banner-admin-show3')?.checked !== false;
    const banner = { active, label, version, infoLabel, info, timerLabel, timerTarget, icon1, icon2, icon3, ctaText, ctaUrl, showSection1, showSection2, showSection3 };
    const newFlags = Object.assign({}, window.siteFlags, { banner });
    try {
        const existingRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.site_flags', { headers: H });
        const existing = await existingRes.json();
        let saveRes;
        if (Array.isArray(existing) && existing.length) {
            saveRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.site_flags', { method:'PATCH', headers: H, body: JSON.stringify({ value: newFlags }) });
        } else {
            saveRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings', { method:'POST', headers: H, body: JSON.stringify({ key:'site_flags', value: newFlags }) });
        }
        if (!saveRes.ok) {
            const errBody = await saveRes.text().catch(()=> '');
            console.error('saveBannerSettings: сервер отклонил сохранение', saveRes.status, errBody);
            return notify('Не сохранилось: сервер вернул ошибку ' + saveRes.status + '. Проверьте права (RLS) на таблицу site_settings в Supabase', false);
        }
        window.siteFlags = newFlags;
        renderUpdateBanner();
        notify('Баннер обновлён — уже виден всем на сайте');
    } catch(e) { console.error('saveBannerSettings error', e); notify('Не удалось сохранить баннер: ' + (e.message||e), false); }
};

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

// ─── УПРАВЛЕНИЕ ФРАКЦИЯМИ (цвет / категория / статус "скоро") ──
// Фракции, добавленные через админ-панель, теперь реально создают карточку
// на главной странице (в нужной категории), а не только сохраняют настройки "вслепую".
const FACTION_GRID_IDS = { government: 'grid-government', criminal: 'grid-criminal', other: 'grid-other' };

function getAllFactionCardNames() {
    return Array.from(document.querySelectorAll('.faction-card .faction-name'))
        .map(el => el.textContent.trim())
        .filter((v, i, arr) => v && arr.indexOf(v) === i);
}

function slugifyFactionName(name) {
    return 'custom-' + name.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/(^-|-$)/g, '');
}

// Создаёт недостающие карточки для фракций, которых ещё нет на странице (managed-факции)
function ensureManagedFactionCards(meta) {
    const existingNames = new Set(getAllFactionCardNames());
    Object.keys(meta).forEach(name => {
        if (existingNames.has(name)) return; // карточка уже есть на сайте — просто применим стили ниже
        const m = meta[name];
        const gridId = FACTION_GRID_IDS[m.category] || FACTION_GRID_IDS.other;
        const grid = document.getElementById(gridId);
        if (!grid) return;
        const slug = slugifyFactionName(name);
        if (document.getElementById('managed-card-' + slug)) return; // уже создана ранее
        const color = m.color || '#00f5ff';
        const card = document.createElement('div');
        card.className = 'faction-card animate-fade-in';
        card.id = 'managed-card-' + slug;
        card.dataset.managed = '1';
        card.innerHTML = `<div class="faction-icon" style="background:${color}14;border-color:${color}40">🏷️</div><div class="faction-name">${escHtml(name)}</div><div class="faction-desc">Фракция, добавленная администрацией сервера.</div><span class="faction-tag" style="color:${FACTION_CATEGORY_COLORS[m.category]||color};border-color:${(FACTION_CATEGORY_COLORS[m.category]||color)}40">${FACTION_CATEGORY_LABELS[m.category]||'ФРАКЦИЯ'}</span><div class="faction-arrow">→</div>`;
        card.setAttribute('onclick', m.soon ? `showComingSoon('faction-soon', ${JSON.stringify(name)})` : `requireAuth(function(){openModal('faction-join')})`);
        grid.appendChild(card);
    });
    // Показываем/прячем категорию "Другое" в зависимости от того, есть ли в ней карточки
    const otherCat = document.getElementById('other-factions-category');
    const otherGrid = document.getElementById('grid-other');
    if (otherCat && otherGrid) otherCat.style.display = otherGrid.children.length ? '' : 'none';
}

function applyFactionMeta() {
    const meta = (window.siteFlags && window.siteFlags.factionMeta) || {};
    ensureManagedFactionCards(meta);
    document.querySelectorAll('.faction-card').forEach(card => {
        const nameEl = card.querySelector('.faction-name');
        if (!nameEl) return;
        const name = nameEl.textContent.trim();
        const m = meta[name];
        if (!m) return;
        const icon = card.querySelector('.faction-icon');
        if (icon && m.color) {
            icon.style.background = m.color + '14';
            icon.style.borderColor = m.color + '40';
        }
        const tag = card.querySelector('.faction-tag');
        if (tag && m.category) {
            tag.textContent = FACTION_CATEGORY_LABELS[m.category] || tag.textContent;
            tag.style.color = FACTION_CATEGORY_COLORS[m.category] || '';
            tag.style.borderColor = (FACTION_CATEGORY_COLORS[m.category] || '') + '40';
        }
        // Сохраняем оригинальный onclick один раз, чтобы можно было включать/выключать "скоро" без потери формы вступления
        if (!card.dataset.originalOnclick) card.dataset.originalOnclick = card.getAttribute('onclick') || '';
        if (m.soon) {
            card.setAttribute('onclick', `showComingSoon('faction-soon', ${JSON.stringify(name)})`);
        } else if (card.dataset.originalOnclick) {
            card.setAttribute('onclick', card.dataset.originalOnclick);
        }
    });
}

window.loadFactionManager = function() {
    const body = document.getElementById('faction-manager-body');
    if (!body) return;
    const meta = (window.siteFlags && window.siteFlags.factionMeta) || {};
    const names = getAllFactionCardNames();
    // Показываем и фракции с карточками на сайте, и те, что были добавлены вручную, но пока без карточки
    const allNames = names.concat(Object.keys(meta).filter(n => !names.includes(n)));
    if (!allNames.length) { body.innerHTML = '<tr><td colspan="5" style="padding:14px;opacity:0.5">Фракций не найдено</td></tr>'; return; }
    body.innerHTML = allNames.map(name => {
        const m = meta[name] || { color:'#00f5ff', category:'government', soon:false };
        const safeId = name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_');
        return `<tr>
            <td style="padding:10px 12px;color:#fff">${escHtml(name)}</td>
            <td style="padding:10px 12px"><input type="color" id="fm-color-${safeId}" value="${m.color || '#00f5ff'}" style="width:40px;height:32px;border:none;border-radius:6px;background:none;cursor:pointer"></td>
            <td style="padding:10px 12px"><select id="fm-cat-${safeId}" class="form-input" style="padding:6px 10px;font-size:13px">
                <option value="government" ${m.category==='government'?'selected':''}>Государственная</option>
                <option value="criminal" ${m.category==='criminal'?'selected':''}>Криминальная</option>
                <option value="other" ${m.category==='other'?'selected':''}>Иное</option>
            </select></td>
            <td style="padding:10px 12px"><input type="checkbox" id="fm-soon-${safeId}" ${m.soon?'checked':''}></td>
            <td style="padding:10px 12px;white-space:nowrap">
                <button class="form-submit" style="padding:6px 12px;font-size:12px;margin:0 6px 0 0;display:inline-block;width:auto" onclick="saveManagedFaction(${JSON.stringify(name)}, '${safeId}')">Сохранить</button>
                <button style="background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);color:#f87171;padding:6px 10px;border-radius:8px;cursor:pointer;font-size:12px" onclick="deleteManagedFaction(${JSON.stringify(name)})">✕</button>
            </td>
        </tr>`;
    }).join('');
};

async function persistFactionMeta(newMeta) {
    const newFlags = Object.assign({}, window.siteFlags, { factionMeta: newMeta });
    try {
        const existingRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.site_flags', { headers: H });
        const existing = await existingRes.json();
        let saveRes;
        if (Array.isArray(existing) && existing.length) {
            saveRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.site_flags', { method:'PATCH', headers: H, body: JSON.stringify({ value: newFlags }) });
        } else {
            saveRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings', { method:'POST', headers: H, body: JSON.stringify({ key:'site_flags', value: newFlags }) });
        }
        if (!saveRes.ok) { notify('Не сохранилось: сервер вернул ошибку ' + saveRes.status, false); return false; }
        window.siteFlags = newFlags;
        applyFactionMeta();
        return true;
    } catch(e) { console.error(e); notify('Ошибка сохранения фракции', false); return false; }
}

window.saveManagedFaction = async function(name, safeId) {
    if (!isOwner(window.currentUser)) return notify('Нет доступа', false);
    const color = document.getElementById('fm-color-' + safeId)?.value || '#00f5ff';
    const category = document.getElementById('fm-cat-' + safeId)?.value || 'government';
    const soon = document.getElementById('fm-soon-' + safeId)?.checked || false;
    const meta = Object.assign({}, window.siteFlags.factionMeta);
    meta[name] = { color, category, soon };
    if (await persistFactionMeta(meta)) notify('Фракция «' + name + '» обновлена');
};

window.deleteManagedFaction = async function(name) {
    if (!isOwner(window.currentUser)) return notify('Нет доступа', false);
    if (!confirm('Убрать фракцию «' + name + '»? Если она была создана только через админ-панель, её карточка также будет удалена с главной страницы.')) return;
    const meta = Object.assign({}, window.siteFlags.factionMeta);
    delete meta[name];
    if (await persistFactionMeta(meta)) {
        const card = document.getElementById('managed-card-' + slugifyFactionName(name));
        if (card) card.remove();
        const otherCat = document.getElementById('other-factions-category');
        const otherGrid = document.getElementById('grid-other');
        if (otherCat && otherGrid) otherCat.style.display = otherGrid.children.length ? '' : 'none';
        notify('Фракция убрана');
        loadFactionManager();
    }
};

window.addManagedFaction = async function() {
    if (!isOwner(window.currentUser)) return notify('Нет доступа', false);
    const name = document.getElementById('faction-add-name')?.value.trim();
    const color = document.getElementById('faction-add-color')?.value || '#00f5ff';
    const category = document.getElementById('faction-add-category')?.value || 'government';
    const soon = document.getElementById('faction-add-soon')?.checked || false;
    if (!name) return notify('Введите название фракции', false);
    const meta = Object.assign({}, window.siteFlags.factionMeta);
    meta[name] = { color, category, soon };
    if (await persistFactionMeta(meta)) {
        notify('Фракция «' + name + '» создана и уже отображается на главной странице');
        document.getElementById('faction-add-name').value = '';
        loadFactionManager();
    }
};

async function db(path, opts) {
    let res;
    try {
        res = await fetch(SUPABASE_URL + '/rest/v1/' + path, { headers: H, ...opts });
    } catch (networkErr) {
        throw new Error('Нет связи с сервером. Проверьте интернет-соединение и попробуйте снова.');
    }
    let json = null;
    try { json = await res.json(); } catch (e) { json = null; }
    if (!res.ok) {
        const msg = (json && (json.message || json.hint || json.error_description || json.error)) || ('Ошибка сервера (' + res.status + ')');
        const err = new Error(msg);
        err.status = res.status;
        throw err;
    }
    return json;
}

// FIX: раньше кнопки форм не давали никакой обратной связи, пока идёт запрос —
// казалось, что «кнопка не нажимается». Теперь кнопка блокируется и показывает
// «Отправка...», а при ошибке — понятное сообщение вместо тишины.
function setModalBusy(modalId, busy, busyText) {
    const btn = document.querySelector('#modal-' + modalId + ' .form-submit');
    if (!btn) return;
    if (busy) {
        btn.dataset.origText = btn.dataset.origText || btn.textContent;
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'wait';
        btn.textContent = busyText || 'Отправка...';
    } else {
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.cursor = '';
        if (btn.dataset.origText) btn.textContent = btn.dataset.origText;
    }
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

const VALID_TABS = ['main','portal','news','rules','profile'];
// Команда теперь отображается прямо на главной странице — старые ссылки #team ведут на главную
const LEGACY_TAB_REDIRECTS = { team: 'main' };

window.navigateTo = function(tab, section) {
    tab = LEGACY_TAB_REDIRECTS[tab] || tab;
    let hash = '#' + tab;
    if (section) hash += '/' + section;
    history.pushState({ tab, section: section||null }, '', hash);
    switchTab(tab, false);
    if (section && tab === 'portal') setTimeout(() => switchPortal(section), 50);
};

function readHash() {
    const hash = location.hash.replace('#','');
    if (!hash) return;
    const [tabRaw, section] = hash.split('/');
    const tab = LEGACY_TAB_REDIRECTS[tabRaw] || tabRaw;
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
    if (tab === 'main')  { loadCriminalCounters(); loadTeamPublic(); }
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
    setModalBusy('opg-create', true);
    try {
        const existing = await db('criminal_gangs?type=eq.opg&status=eq.active');
        if (Array.isArray(existing) && existing.length >= OPG_MAX) return notify(`Лимит ОПГ (${OPG_MAX}) достигнут!`, false);
        const res = await db('criminal_gangs', { method:'POST', body: JSON.stringify({ type:'opg', name, description:desc, tag, founder:u, status:'active', created_by: window.currentUser?.id }) });
        if (!res || !res[0]) throw new Error('Сервер не подтвердил создание');
        await db('requests', { method:'POST', body: JSON.stringify({ type:'opg_create', username:u, char_name:name, note:desc, faction:tag, status:'pending', user_id: window.currentUser?.id }) });
        closeModal('opg-create'); notify('ОПГ «' + name + '» создана! Ожидайте подтверждения администрации.'); loadCriminalCounters();
    } catch (e) { notify('Ошибка при создании ОПГ: ' + (e.message||'неизвестная ошибка'), false); }
    finally { setModalBusy('opg-create', false); }
};

window.submitCreateMafia = async function() {
    const u = document.getElementById('mafia-create-username').value.trim();
    const name = document.getElementById('mafia-create-name').value.trim();
    const desc = document.getElementById('mafia-create-desc').value.trim();
    if (!u || !name) return notify('Заполните обязательные поля', false);
    setModalBusy('mafia-create', true);
    try {
        const existing = await db('criminal_gangs?type=eq.mafia&status=eq.active');
        if (Array.isArray(existing) && existing.length >= MAFIA_MAX) return notify(`Лимит Мафий (${MAFIA_MAX}) достигнут!`, false);
        const res = await db('criminal_gangs', { method:'POST', body: JSON.stringify({ type:'mafia', name, description:desc, tag:'', founder:u, status:'active', created_by: window.currentUser?.id }) });
        if (!res || !res[0]) throw new Error('Сервер не подтвердил создание');
        await db('requests', { method:'POST', body: JSON.stringify({ type:'mafia_create', username:u, char_name:name, note:desc, status:'pending', user_id: window.currentUser?.id }) });
        closeModal('mafia-create'); notify('Мафия «' + name + '» создана! Ожидайте подтверждения.'); loadCriminalCounters();
    } catch (e) { notify('Ошибка при создании: ' + (e.message||'неизвестная ошибка'), false); }
    finally { setModalBusy('mafia-create', false); }
};

window.submitJoinOpg = async function() {
    const u = document.getElementById('opg-join-username').value.trim();
    const gangId = document.getElementById('opg-join-select').value;
    const reason = document.getElementById('opg-join-reason').value.trim();
    if (!u || !gangId) return notify('Заполните все поля', false);
    setModalBusy('opg-join', true);
    try {
        await db('requests', { method:'POST', body: JSON.stringify({ type:'opg_join', username:u, note:reason, experience:String(gangId), status:'pending', user_id: window.currentUser?.id }) });
        closeModal('opg-join'); notify('Заявка на вступление в ОПГ отправлена!');
    } catch (e) { notify('Не удалось отправить заявку: ' + (e.message||'неизвестная ошибка'), false); }
    finally { setModalBusy('opg-join', false); }
};

window.submitJoinMafia = async function() {
    const u = document.getElementById('mafia-join-username').value.trim();
    const reason = document.getElementById('mafia-join-reason').value.trim();
    if (!u) return notify('Введите никнейм', false);
    setModalBusy('mafia-join', true);
    try {
        await db('requests', { method:'POST', body: JSON.stringify({ type:'mafia_join', username:u, note:reason, status:'pending', user_id: window.currentUser?.id }) });
        closeModal('mafia-join'); notify('Заявка на вступление в Мафию отправлена!');
    } catch (e) { notify('Не удалось отправить заявку: ' + (e.message||'неизвестная ошибка'), false); }
    finally { setModalBusy('mafia-join', false); }
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
        ['passport','medbook','license','dl','faction','court','gov','lawyer','opg-create','opg-join','mafia-create','mafia-join'].forEach(p => {
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
    trucker:   { icon:'🚛', title:'Дальнобойщик — скоро!', desc:'Перевозка грузов между городами, свой тягач и стабильный заработок. Устройство на работу откроется в ближайшем обновлении.' },
    busdriver: { icon:'🚌', title:'Водитель автобуса — скоро!', desc:'Городские маршруты, расписание и пассажиры. Устройство на работу откроется в ближайшем обновлении.' },
};

window.showComingSoon = function(key, factionName) {
    let info = COMING_SOON_INFO[key] || { icon:'🏗️', title:'Скоро!', desc:'Раздел в разработке.' };
    if (key === 'faction-soon') {
        info = { icon:'🚧', title:(factionName || 'Фракция') + ' — скоро откроется!', desc:'Вступление во фракцию «' + (factionName || '') + '» временно недоступно — набор откроется в ближайшем обновлении.' };
    }
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
    const dNick = document.getElementById('reg-discord-nick').value.trim();
    const dUserRaw = document.getElementById('reg-discord-username').value.trim().replace(/^@/, '');
    const dUser = dUserRaw.toLowerCase();
    const p  = document.getElementById('reg-password').value;
    const p2 = document.getElementById('reg-password2').value;
    if (!dUser || !p || !dNick) return notify('Заполните все поля, включая Discord Никнейм и Юзернейм', false);
    if (!/^[a-z0-9._]{2,32}$/.test(dUser)) return notify('Discord Юзернейм может содержать только латинские буквы, цифры, точку и подчёркивание', false);
    if (p !== p2) return notify('Пароли не совпадают', false);
    const pwCheck = checkPasswordStrength(p);
    if (!pwCheck.ok) return notify(pwCheck.reason, false);
    try {
        const res = await callSiteApi('register', { username: dUser, password: p, discord_nick: dNick });
        window.currentUser = res.user;
        window._siteToken = res.token;
        localStorage.setItem('nrp_user', JSON.stringify(res.user));
        localStorage.setItem('nrp_token', res.token);
        closeModal('auth'); updateAuthZone(); notify('Добро пожаловать, ' + dUser + '!'); navigateTo('profile');
    } catch (e) { notify('Ошибка регистрации: ' + (e.message||'неизвестная ошибка'), false); }
};

window.handleLogin = async function() {
    const u = document.getElementById('login-username').value.trim().replace(/^@/, '').toLowerCase();
    const p = document.getElementById('login-password').value;
    if (!u || !p) return notify('Заполните все поля', false);
    try {
        const res = await callSiteApi('login', { username: u, password: p });
        window.currentUser = res.user;
        window._siteToken = res.token;
        localStorage.setItem('nrp_user', JSON.stringify(res.user));
        localStorage.setItem('nrp_token', res.token);
        closeModal('auth'); updateAuthZone(); notify('Добро пожаловать, ' + u + '!'); renderProfile();
    } catch (e) { notify('Ошибка входа: ' + (e.message||'неизвестная ошибка'), false); }
};

window.logout = function() {
    localStorage.removeItem('nrp_user');
    localStorage.removeItem('nrp_token');
    window.currentUser = null;
    window._siteToken = null;
    updateAuthZone(); navigateTo('main'); notify('Вы вышли из аккаунта');
};

// FIX 3: В кнопке профиля показывается ник + роль + фракция
function updateAuthZone() {
    const zone = document.getElementById('auth-zone');
    updateDiscordMissingIndicators();
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
    if (pp) { pp.textContent = '••••••••'; pp.title = 'Пароль защищён и хранится в виде хэша — показать его нельзя, только сменить'; }
    const createdEl = document.getElementById('profile-created');
    if (createdEl) createdEl.textContent = window.currentUser.created_at ? new Date(window.currentUser.created_at).toLocaleDateString('ru-RU') : '—';
    const lastLoginEl = document.getElementById('profile-last-login');
    if (lastLoginEl) lastLoginEl.textContent = window.currentUser.last_login ? new Date(window.currentUser.last_login).toLocaleString('ru-RU') : '—';
    const bioEl = document.getElementById('profile-bio-input');
    if (bioEl) bioEl.value = window.currentUser.bio || '';
    const discordNickEl = document.getElementById('profile-discord-nick');
    if (discordNickEl) discordNickEl.value = window.currentUser.discord_nick || '';
    const discordIdEl = document.getElementById('profile-discord-id');
    if (discordIdEl) discordIdEl.value = window.currentUser.discord_id || '';
    updateDiscordMissingIndicators();

    // Значок ОПГ/Мафия, если пользователь состоит в криминальной организации
    const gangBadge = document.getElementById('profile-gang-badge');
    if (gangBadge) {
        if (faction === 'ОПГ' || faction === 'Мафия') { gangBadge.textContent = (faction === 'Мафия' ? '🤵 ' : '💀 ') + faction; gangBadge.style.display = 'inline-flex'; }
        else gangBadge.style.display = 'none';
    }

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

    const bannerP = document.getElementById('admin-banner-panel');
    if (bannerP) bannerP.style.display = isAdmin(window.currentUser) ? '' : 'none';
    if (isAdmin(window.currentUser)) fillBannerAdminForm();

    const discordReqP = document.getElementById('admin-discord-request-panel');
    if (discordReqP) discordReqP.style.display = isAdmin(window.currentUser) ? '' : 'none';

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
    notify('Пароль хранится в защищённом виде (хэш) и не может быть показан — используйте «Сменить пароль» ниже', false);
};

window.changePassword = async function() {
    const np = document.getElementById('new-password').value;
    const cp = document.getElementById('confirm-password').value;
    if (!np)       return notify('Введите новый пароль', false);
    if (np !== cp) return notify('Пароли не совпадают', false);
    const pwCheck = checkPasswordStrength(np);
    if (!pwCheck.ok) return notify(pwCheck.reason, false);
    try {
        await callSiteApi('changeOwnPassword', { newPassword: np });
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        notify('Пароль изменён!'); renderProfile();
    } catch (e) { notify('Не удалось изменить пароль: ' + (e.message||'неизвестная ошибка'), false); }
};

window.saveBio = async function() {
    const bioEl = document.getElementById('profile-bio-input');
    const bio = (bioEl?.value || '').trim().slice(0, 300);
    try {
        await callSiteApi('updateOwnProfile', { bio });
        window.currentUser.bio = bio;
        localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
        notify('О себе — сохранено');
    } catch(e) { notify('Не удалось сохранить: ' + (e.message||'неизвестная ошибка'), false); }
};

// ─── DISCORD ID (для автоматической выдачи ролей ботом) ──
window.saveDiscordId = async function() {
    const nickEl = document.getElementById('profile-discord-nick');
    const userEl = document.getElementById('profile-discord-id');
    const discordNick = (nickEl?.value || '').trim().slice(0, 60);
    const discordId = (userEl?.value || '').trim().replace(/^@/, '').slice(0, 40);
    if (nickEl) nickEl.value = discordNick;
    if (userEl) userEl.value = discordId;
    try {
        await callSiteApi('updateOwnProfile', { discord_nick: discordNick, discord_id: discordId });
        window.currentUser.discord_nick = discordNick;
        window.currentUser.discord_id = discordId;
        localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
        notify('Discord-данные сохранены');
        updateDiscordMissingIndicators();
    } catch(e) { console.error(e); notify('Не удалось сохранить: ' + (e.message||'неизвестная ошибка'), false); }
};

// FIX 8: показываем красную точку у кнопки "Профиль" и баннер внутри профиля,
// если у пользователя не заполнены Discord Никнейм или Юзернейм (актуально для тех, кто
// зарегистрировался до введения этого требования).
function updateDiscordMissingIndicators() {
    const u = window.currentUser;
    const missing = !!u && (!u.discord_nick || !u.discord_id);
    const dot1 = document.getElementById('profile-discord-missing-dot');
    const dot2 = document.getElementById('profile-discord-missing-dot-m');
    if (dot1) dot1.style.display = missing ? '' : 'none';
    if (dot2) dot2.style.display = missing ? '' : 'none';
    const banner = document.getElementById('discord-missing-banner');
    if (banner) banner.style.display = missing ? '' : 'none';
}

// ─── ПЕРСОНАЛИЗАЦИЯ: ЦВЕТ АКЦЕНТА ──────────────
const ACCENT_COLORS = ['#00f5ff', '#a855f7', '#22c55e', '#fbbf24', '#ef4444', '#f472b6'];

function applyAccentColor(color, save = true) {
    document.documentElement.style.setProperty('--cyan', color);
    if (save) localStorage.setItem('nrp_accent', color);
    document.querySelectorAll('.accent-swatch').forEach(s => s.style.outline = (s.dataset.color === color) ? '2px solid #fff' : 'none');
}

window.pickAccentColor = function(color) { applyAccentColor(color); notify('Цвет темы изменён'); };

(function initAccent() {
    const saved = localStorage.getItem('nrp_accent');
    if (saved) applyAccentColor(saved, false);
})();

// ─── USERS TABLE ──────────────────────────────

const SEL = `background:#1e293b;border:1px solid var(--border);color:#fff;padding:5px 8px;border-radius:8px;font-size:12px;font-family:'Rajdhani',sans-serif;max-width:160px`;

function rankIndex(role) {
    const i = ADMIN_RANKS.indexOf(role);
    return i === -1 ? 0 : i;
}

// Кэш paролей в открытом виде на этот сеанс — только для строк, где показ разрешён
window._usersCache = {};

window.loadUsersTable = async function() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" style="padding:20px;text-align:center;color:var(--text)">Загрузка...</td></tr>`;
    const users = await db('users?order=username.asc');
    if (!Array.isArray(users) || !users.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="padding:20px;text-align:center;color:var(--text)">Нет пользователей</td></tr>`; return;
    }
    window._usersCache = {};
    users.forEach(u => window._usersCache[u.id] = u);
    const viewerRank = rankIndex(window.currentUser?.role);
    tbody.innerHTML = users.map(u => {
        const targetRank = rankIndex(u.role);
        const canManagePassword = viewerRank > targetRank;
        // Пароли хранятся как хэш и больше не показываются администрации в открытом виде —
        // вместо просмотра доступен безопасный сброс на новый временный пароль.
        const passwordCell = canManagePassword
            ? `<span style="font-size:12px;color:#64748b">🔒 Хэш</span>
               <button onclick="resetUserPassword(${u.id})" style="background:none;border:none;color:var(--cyan);cursor:pointer;font-size:11px;margin-left:6px;text-decoration:underline">Сбросить</button>`
            : `<span style="font-size:12px;color:#334155">🔒 Скрыто</span>`;
        return `<tr>
        <td style="padding:10px 14px;font-weight:600;color:#fff">${escHtml(u.username)}</td>
        <td style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#94a3b8">${escHtml(u.discord_id||'—')}</td>
        <td style="padding:10px 14px;white-space:nowrap">${passwordCell}</td>
        <td style="padding:10px 14px" id="discord-check-${u.id}"><button onclick="checkUserInDiscord(${u.id})" style="background:rgba(0,245,255,0.08);border:1px solid rgba(0,245,255,0.25);color:var(--cyan);padding:4px 10px;border-radius:8px;cursor:pointer;font-size:11px">Проверить</button></td>
        <td style="padding:10px 14px"><select onchange="changeRole(${u.id},this.value)" style="${SEL}">${ADMIN_RANKS.map(r=>`<option value="${r}" ${u.role===r?'selected':''}>${r}</option>`).join('')}</select></td>
        <td style="padding:10px 14px"><select onchange="changeFaction(${u.id},this.value)" style="${SEL}">${ALL_FACTIONS.map(f=>`<option value="${f==='—'?'':f}" ${(u.faction||'')===(f==='—'?'':f)?'selected':''}>${f}</option>`).join('')}</select></td>
        <td style="padding:10px 14px"><button onclick="deleteUser(${u.id})" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;padding:5px 12px;border-radius:8px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:600">Удалить</button></td>
    </tr>`;
    }).join('');
};

window.resetUserPassword = async function(id) {
    const u = window._usersCache[id];
    if (!u) return;
    if (!confirm(`Сбросить пароль пользователя «${u.username}» и сгенерировать новый временный пароль?`)) return;
    try {
        const res = await callSiteApi('resetPassword', { id });
        notify(`Новый временный пароль для ${u.username}: ${res.tempPassword} — сообщите его игроку лично, он не сохранится нигде ещё раз`);
    } catch (e) { notify('Не удалось сбросить пароль: ' + (e.message||'неизвестная ошибка'), false); }
};

// FIX 9: проверка присутствия игрока на Discord-сервере через ту же Edge Function,
// что выдаёт роли — с флагом checkOnly, чтобы не выдавать роль, а только проверить.
window.checkUserInDiscord = async function(id) {
    const cell = document.getElementById('discord-check-' + id);
    const u = window._usersCache[id];
    if (!cell || !u) return;
    if (!u.discord_id) { cell.innerHTML = '<span style="color:#f87171;font-size:11px">Нет юзернейма</span>'; return; }
    cell.innerHTML = '<span style="color:var(--text);font-size:11px">Проверка...</span>';
    try {
        const res = await fetch(SUPABASE_URL + '/functions/v1/assign-discord-role', {
            method: 'POST',
            headers: H,
            body: JSON.stringify({ discordUsername: u.discord_id, checkOnly: true })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.found) {
            cell.innerHTML = '<span style="color:#4ade80;font-size:11px">✅ Есть на сервере</span>';
        } else {
            cell.innerHTML = `<span style="color:#f87171;font-size:11px" title="${escHtml(data.error||'')}">❌ Не найден</span> <button onclick="prefillDiscordFixRequest('${escHtml(u.username)}')" style="margin-left:6px;background:none;border:none;color:var(--cyan);cursor:pointer;font-size:11px;text-decoration:underline">Запросить исправление</button>`;
        }
    } catch(e) {
        cell.innerHTML = '<span style="color:#f87171;font-size:11px">Ошибка проверки</span>';
    }
};

window.prefillDiscordFixRequest = function(username) {
    const el = document.getElementById('discord-req-username');
    if (el) el.value = username;
    document.getElementById('admin-discord-request-panel')?.scrollIntoView({ behavior:'smooth', block:'center' });
};

window.changeRole = async function(id, role) {
    try {
        await callSiteApi('changeRole', { id, role });
        if (window.currentUser && window.currentUser.id === id) { window.currentUser.role = role; localStorage.setItem('nrp_user', JSON.stringify(window.currentUser)); updateAuthZone(); }
        notify('Роль обновлена');
    } catch (e) { notify('Не удалось обновить роль: ' + (e.message||'неизвестная ошибка'), false); }
};

window.changeFaction = async function(id, faction) {
    try {
        await callSiteApi('changeFaction', { id, faction });
        if (window.currentUser && window.currentUser.id === id) { window.currentUser.faction = faction; localStorage.setItem('nrp_user', JSON.stringify(window.currentUser)); updateAuthZone(); }
        notify('Фракция обновлена');
    } catch (e) { notify('Не удалось обновить фракцию: ' + (e.message||'неизвестная ошибка'), false); }
};

window.deleteUser = async function(id) {
    if (!confirm('Удалить пользователя?')) return;
    try {
        await callSiteApi('deleteUser', { id });
        notify('Пользователь удалён'); loadUsersTable();
    } catch (e) { notify('Не удалось удалить: ' + (e.message||'неизвестная ошибка'), false); }
};

// ─── УПРАВЛЕНИЕ ОПГ / МАФИЕЙ (удаление банд) ──
// Требуется таблица criminal_gangs (уже используется). Нужна лишь возможность DELETE для anon-ключа (см. SQL).

window.loadAdminGangs = async function() {
    const el = document.getElementById('admin-gangs-list');
    if (!el || !isAdmin(window.currentUser)) return;
    el.innerHTML = '<div class="loading-text" style="opacity:0.5">Загрузка...</div>';
    try {
        const gangs = await db('criminal_gangs?status=eq.active&order=type.asc,created_at.asc');
        if (!Array.isArray(gangs) || !gangs.length) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Нет активных ОПГ/Мафий</div>'; return; }
        el.innerHTML = gangs.map(g => `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;background:#0d1117;border:1px solid var(--border);border-radius:12px;padding:12px 16px;margin-bottom:8px">
            <div><span style="font-size:13px;color:var(--cyan);font-family:'JetBrains Mono',monospace;text-transform:uppercase">${g.type==='mafia'?'🤵 Мафия':'💀 ОПГ'}</span><div style="font-weight:700;color:#fff;font-size:15px">${escHtml(g.name)} ${g.tag?`<span style="font-size:11px;color:var(--cyan)">[${escHtml(g.tag)}]</span>`:''}</div><div style="color:var(--text);font-size:12px">Основатель: ${escHtml(g.founder||'—')}</div></div>
            <button onclick="deleteGang(${g.id})" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:7px 14px;border-radius:8px;cursor:pointer;white-space:nowrap">🗑 Расформировать</button>
        </div>`).join('');
    } catch(e) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Ошибка загрузки</div>'; }
};

window.deleteGang = async function(id) {
    if (!confirm('Расформировать эту организацию? Действие необратимо.')) return;
    try {
        await db(`criminal_gangs?id=eq.${id}`, { method:'DELETE' });
        notify('Организация расформирована');
    } catch(e) { notify('Ошибка удаления — проверьте права DELETE в Supabase', false); }
    loadAdminGangs();
    loadCriminalCounters();
};

// ─── УПРАВЛЕНИЕ СОСТАВОМ АДМИНИСТРАЦИИ (вкладка «Команда») ──
// Требуется таблица team_members в Supabase — см. SQL-скрипт.

const TEAM_STATUS_LABELS = {
    active:    { label: 'На месте',        color: '#22c55e', emoji: '🟢' },
    vacation:  { label: 'В отпуске',       color: '#38bdf8', emoji: '🏖' },
    absent:    { label: 'Отсутствует',     color: '#fbbf24', emoji: '⏸' },
    busy:      { label: 'Занят(а)',        color: '#a855f7', emoji: '⏳' },
    sick:      { label: 'На больничном',   color: '#f472b6', emoji: '🤒' },
    training:  { label: 'На стажировке',   color: '#0ea5e9', emoji: '🎓' },
    trial:     { label: 'Испытательный срок', color: '#eab308', emoji: '🧪' },
    suspended: { label: 'Временно отстранён(а)', color: '#f87171', emoji: '⛔' },
};

function teamStatusBadge(m) {
    const s = TEAM_STATUS_LABELS[m.status] || TEAM_STATUS_LABELS.active;
    if (m.status === 'active') return '';
    let range = '';
    if (m.status_until) range = ` до ${new Date(m.status_until).toLocaleDateString('ru-RU')}`;
    const note = m.status_note ? `: ${escHtml(m.status_note)}` : range;
    return `<span style="font-size:11px;background:${s.color}22;color:${s.color};border:1px solid ${s.color}55;padding:2px 8px;border-radius:6px;margin-left:6px;font-family:'JetBrains Mono',monospace;vertical-align:middle">${s.emoji} ${s.label}${note}</span>`;
}

window.loadTeamPublic = async function() {
    const el = document.getElementById('team-list');
    if (!el) return;
    el.innerHTML = '<div class="loading-text" style="opacity:0.5">Загрузка состава администрации...</div>';
    try {
        const members = await db('team_members?order=sort_order.asc,created_at.asc');
        if (!Array.isArray(members) || !members.length) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Состав администрации пока не заполнен</div>'; return; }
        el.innerHTML = members.map(m => {
            const color = m.color || '#00f5ff';
            const avatar = m.roblox_id ? `<img src="https://www.roblox.com/headshot-thumbnail/image?userId=${encodeURIComponent(m.roblox_id)}&width=100&height=100&format=png" style="width:60px;height:60px;border-radius:14px;border:2px solid ${color}66;object-fit:cover" onerror="this.style.display='none'">` : `<div style="width:60px;height:60px;border-radius:14px;border:2px solid ${color}66;background:${color}22;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:22px;color:${color}">${escHtml((m.name||'?').charAt(0).toUpperCase())}</div>`;
            const link = m.roblox_id ? `<a href="https://www.roblox.com/users/${encodeURIComponent(m.roblox_id)}/profile" target="_blank" style="background:${color}1a;border:1px solid ${color}55;color:${color};font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;letter-spacing:1px;padding:7px 14px;border-radius:9px;text-decoration:none;white-space:nowrap">Roblox →</a>` : '';
            return `<div style="background:var(--card);border:1px solid ${color}40;border-radius:18px;padding:20px;display:flex;align-items:center;gap:16px;${m.status!=='active'?'opacity:0.85':''}">${avatar}<div style="flex:1;min-width:0"><div style="font-family:'Bebas Neue',sans-serif;font-size:11px;letter-spacing:2px;color:${color};margin-bottom:3px">${escHtml((m.role_title||'').toUpperCase())}</div><div style="font-size:18px;font-weight:700;color:#fff">${escHtml(m.name||'')} ${teamStatusBadge(m)}</div></div>${link}</div>`;
        }).join('');
    } catch(e) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Не удалось загрузить состав команды — проверьте таблицу team_members в Supabase</div>'; }
};

window.loadAdminTeamManage = async function() {
    const el = document.getElementById('admin-team-list');
    if (!el || !isAdmin(window.currentUser)) return;
    el.innerHTML = '<div class="loading-text" style="opacity:0.5">Загрузка...</div>';
    try {
        const members = await db('team_members?order=sort_order.asc,created_at.asc');
        if (!Array.isArray(members) || !members.length) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Пока никого не добавили</div>'; return; }
        el.innerHTML = members.map(m => `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;background:#0d1117;border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:8px">
            <div style="flex:1;min-width:140px"><div style="font-weight:700;color:#fff;font-size:14px">${escHtml(m.name)}</div><div style="color:var(--text);font-size:12px">${escHtml(m.role_title||'')}</div></div>
            <select onchange="updateTeamMemberStatus(${m.id}, this.value)" style="${SEL}">
                <option value="active" ${m.status==='active'?'selected':''}>🟢 На месте</option>
                <option value="vacation" ${m.status==='vacation'?'selected':''}>🏖 В отпуске</option>
                <option value="absent" ${m.status==='absent'?'selected':''}>⏸ Отсутствует</option>
                <option value="busy" ${m.status==='busy'?'selected':''}>⏳ Занят(а)</option>
                <option value="sick" ${m.status==='sick'?'selected':''}>🤒 На больничном</option>
                <option value="training" ${m.status==='training'?'selected':''}>🎓 На стажировке</option>
                <option value="trial" ${m.status==='trial'?'selected':''}>🧪 Испытательный срок</option>
                <option value="suspended" ${m.status==='suspended'?'selected':''}>⛔ Временно отстранён(а)</option>
            </select>
            <button onclick="deleteTeamMember(${m.id})" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 12px;border-radius:8px;cursor:pointer">🗑 Убрать</button>
        </div>`).join('');
    } catch(e) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Ошибка загрузки — проверьте таблицу team_members</div>'; }
};

window.addTeamMember = async function() {
    if (!isAdmin(window.currentUser)) return notify('Нет доступа', false);
    const name  = document.getElementById('team-add-name')?.value.trim();
    const role  = document.getElementById('team-add-role')?.value.trim();
    const rid   = document.getElementById('team-add-roblox')?.value.trim();
    const color = document.getElementById('team-add-color')?.value || '#00f5ff';
    if (!name || !role) return notify('Укажите ник и должность', false);
    try {
        await db('team_members', { method:'POST', body: JSON.stringify({ name, role_title: role, roblox_id: rid || null, color, status:'active', sort_order: 100 }) });
        notify('Сотрудник добавлен в состав');
        ['team-add-name','team-add-role','team-add-roblox'].forEach(id => { const e = document.getElementById(id); if (e) e.value=''; });
        loadAdminTeamManage(); loadTeamPublic();
    } catch(e) { notify('Ошибка — проверьте таблицу team_members в Supabase', false); }
};

window.updateTeamMemberStatus = async function(id, status) {
    let status_note = null, status_until = null;
    if (status === 'vacation' || status === 'absent') {
        status_note = prompt('Комментарий к статусу (необязательно, например "13.07 – 21.07"):', '') || null;
    }
    try {
        await db(`team_members?id=eq.${id}`, { method:'PATCH', body: JSON.stringify({ status, status_note, status_until }) });
        notify('Статус обновлён');
    } catch(e) { notify('Ошибка обновления статуса', false); }
    loadAdminTeamManage(); loadTeamPublic();
};

window.deleteTeamMember = async function(id) {
    if (!confirm('Убрать сотрудника из состава команды?')) return;
    try {
        await db(`team_members?id=eq.${id}`, { method:'DELETE' });
        notify('Сотрудник убран из состава');
    } catch(e) { notify('Ошибка удаления', false); }
    loadAdminTeamManage(); loadTeamPublic();
};

// ─── OWNER PANEL ──────────────────────────────

function showOwnerPanelIfNeeded() {
    const panel = document.getElementById('owner-panel');
    if (!panel) return;
    if (isOwner(window.currentUser)) {
        panel.style.display = '';
        syncOwnerCheckboxes();
    } else {
        panel.style.display = 'none';
    }
    if (isAdmin(window.currentUser)) {
        loadAdminTeamManage();
        loadAdminGangs();
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
    // Сохраняем tabs/services/registration_open, но не затираем банер, который мог сохранить админ отдельно
    const flags = Object.assign({}, window.siteFlags, { tabs, services, registration_open });
    window.siteFlags = flags;
    try {
        await callSiteApi('saveOwnerSettings', { flags });
    } catch(e) { console.warn('saveOwnerSettings error', e); notify('Не удалось сохранить настройки: ' + (e.message||'неизвестная ошибка'), false); }
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
    try {
        await callSiteApi('renameUser', { current: cur, next });
        if (window.currentUser && window.currentUser.username === cur) {
            window.currentUser.username = next;
            localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
            updateAuthZone();
        }
        curEl.value = ''; newEl.value = '';
        notify(`Никнейм изменён: ${cur} → ${next}`);
        loadUsersTable();
    } catch (e) { notify('Не удалось переименовать: ' + (e.message||'неизвестная ошибка'), false); }
};

// FIX: удаление документов больше не привязано к срокам действия — сроки отменены полностью.

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

window.sendDiscordFixRequest = async function() {
    if (!isAdmin(window.currentUser)) return notify('Нет доступа', false);
    const uEl = document.getElementById('discord-req-username');
    const fEl = document.getElementById('discord-req-field');
    const mEl = document.getElementById('discord-req-message');
    const username = uEl?.value.trim();
    const field = fEl?.value || 'username';
    const fieldLabel = field === 'nick' ? 'Discord Никнейм' : 'Discord Юзернейм';
    const comment = mEl?.value.trim();
    if (!username) return notify('Введите ник игрока на сайте', false);
    const users = await db(`users?username=eq.${encodeURIComponent(username)}`);
    if (!Array.isArray(users) || !users.length) return notify('Пользователь не найден', false);
    const text = `Администрация не может найти вас в Discord. Пожалуйста, проверьте и исправьте: ${fieldLabel}.` + (comment ? ` Комментарий: ${comment}` : '');
    try {
        const res = await db('notifications', { method:'POST', body: JSON.stringify({ user_id: users[0].id, type:'discord_fix_request', text, field, read:false }) });
        const failed = !res || !Array.isArray(res) || !res.length || res.code || res.message;
        if (failed) { console.warn('sendDiscordFixRequest failed', res); return notify('Не удалось отправить: проверьте таблицу notifications в Supabase', false); }
        notify('Запрос отправлен игроку ' + username);
        if (uEl) uEl.value = ''; if (mEl) mEl.value = '';
    } catch(e) { console.warn('sendDiscordFixRequest error', e); notify('Ошибка отправки', false); }
};

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
        // FIX: PostgREST не возвращает { error: ... } — при ошибке ответ выглядит как
        // { message, code, details, hint } и НЕ является массивом. Раньше это ложно
        // считалось успехом, из-за чего уведомление «не приходило» на другой аккаунт.
        const failed = !res || !Array.isArray(res) || !res.length || res.code || res.message;
        if (failed) {
            console.warn('sendRenameRequest insert failed', res);
            return notify('Не удалось отправить: таблица notifications недоступна (проверьте SQL/RLS в Supabase)', false);
        }
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
    if (n.type === 'discord_fix_request') {
        const isNick = n.field === 'nick';
        return `<div class="profile-card" style="border-color:rgba(248,113,113,0.35);background:rgba(248,113,113,0.05)">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:20px">🛠️</span><div style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:1px;color:#f87171">Проверьте ваши Discord-данные</div></div>
            <div style="color:var(--text);font-size:14px;margin-bottom:14px;line-height:1.6">${escHtml(n.text||'')}</div>
            <div class="form-group"><input type="text" id="notif-discord-${n.id}" placeholder="${isNick ? 'Правильный Discord Никнейм' : 'Правильный Discord Юзернейм'}" class="form-input"></div>
            <button class="form-submit" onclick="respondDiscordFixRequest(${n.id}, '${isNick ? 'nick' : 'username'}')">Сохранить исправление</button>
        </div>`;
    }
    return `<div class="profile-card"><div style="color:var(--text);font-size:14px;line-height:1.6">${escHtml(n.text||'')}</div><button onclick="dismissNotification(${n.id})" style="margin-top:10px;background:none;border:none;color:var(--cyan);font-size:12px;cursor:pointer;letter-spacing:1px">ПОНЯТНО, СКРЫТЬ</button></div>`;
}

window.respondDiscordFixRequest = async function(notifId, field) {
    const input = document.getElementById('notif-discord-' + notifId);
    const next = input?.value.trim().replace(/^@/, '');
    if (!next) return notify('Введите значение', false);
    const patch = field === 'nick' ? { discord_nick: next } : { discord_id: next };
    try {
        await callSiteApi('updateOwnProfile', patch);
        Object.assign(window.currentUser, patch);
        localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
        await db(`notifications?id=eq.${notifId}`, { method:'PATCH', body: JSON.stringify({ read:true }) }).catch(()=>{});
        renderProfile();
        updateDiscordMissingIndicators();
        notify('Данные обновлены, спасибо!');
    } catch (e) { notify('Не удалось сохранить: ' + (e.message||'неизвестная ошибка'), false); }
};

window.respondRenameRequest = async function(notifId) {
    const input = document.getElementById('notif-rename-' + notifId);
    const next = input?.value.trim();
    if (!next) return notify('Введите новый никнейм', false);
    try {
        await callSiteApi('updateOwnProfile', { username: next });
        window.currentUser.username = next;
        localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
        await db(`notifications?id=eq.${notifId}`, { method:'PATCH', body: JSON.stringify({ read:true }) }).catch(()=>{});
        updateAuthZone();
        notify('Никнейм изменён на ' + next);
        renderProfile();
    } catch (e) { notify('Не удалось сохранить: ' + (e.message||'неизвестная ошибка'), false); }
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
    try {
        await callSiteApi('createNews', { title, tag, custom_tag: tag === 'Свой Вариант' ? (customTag || 'Свой вариант') : null, text, image_url: imageUrl });
        document.getElementById('news-title').value = '';
        document.getElementById('news-text').value  = '';
        if (document.getElementById('news-image-url'))  document.getElementById('news-image-url').value = '';
        if (document.getElementById('news-custom-tag')) document.getElementById('news-custom-tag').value = '';
        const preview = document.getElementById('news-img-preview');
        if (preview) preview.style.display = 'none';
        notify('Новость опубликована'); loadNews();
    } catch (e) { notify('Не удалось опубликовать: ' + (e.message||'неизвестная ошибка'), false); }
};

window.deleteNews = async function(id) {
    if (!confirm('Удалить новость?')) return;
    try {
        await callSiteApi('deleteNews', { id });
        notify('Удалено'); loadNews();
    } catch (e) { notify('Не удалось удалить: ' + (e.message||'неизвестная ошибка'), false); }
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
        // чекбоксы оружия лежат в #weapons-checkboxes — читаем отмеченные чекбоксы
        const wpnBox = document.getElementById('weapons-checkboxes');
        const wpn = wpnBox ? Array.from(wpnBox.querySelectorAll('input[type=checkbox]:checked')).map(o => o.value).join(', ') : '';
        if (!u||!n||!job||!rsn||!wpn) return notify('Заполните поля и отметьте хотя бы один вид оружия', false);
        data = { type:'license', username:u, char_name:n, dob, address:job, faction:fac, reason:rsn, weapon_type:wpn, note:sgn, status:'pending', user_id:window.currentUser?.id };
    } else if (type === 'driving-license') {
        const u=document.getElementById('dl-username').value.trim(), n=document.getElementById('dl-name').value.trim(), dob=document.getElementById('dl-dob').value, job=document.getElementById('dl-job').value.trim(), rsn=document.getElementById('dl-reason').value.trim(), sgn=document.getElementById('dl-sign').value.trim();
        const catBox = document.getElementById('dl-categories');
        const cats = catBox ? Array.from(catBox.querySelectorAll('input[type=checkbox]:checked')).map(o => o.value).join(', ') : '';
        if (!u||!n||!dob||!job||!rsn||!cats) return notify('Заполните поля и отметьте хотя бы одну категорию прав', false);
        data = { type:'driving_license', username:u, char_name:n, dob, address:job, reason:rsn, weapon_type:cats, note:sgn, status:'pending', user_id:window.currentUser?.id };
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
    setModalBusy(type, true);
    try {
        const res = await db('requests', { method:'POST', body: JSON.stringify(data) });
        if (!res || !res[0]) throw new Error('Сервер не подтвердил сохранение заявки');
        closeModal(type);
        notify('Заявка отправлена! Ожидайте рассмотрения.');
    } catch (e) {
        notify('Не удалось отправить заявку: ' + (e.message || 'неизвестная ошибка'), false);
    } finally {
        setModalBusy(type, false);
    }
};

// ─── MY DOCS ──────────────────────────────────
// FIX: сроки действия документов (паспорт/мед.книжка/лицензия) полностью отменены —
// все одобренные документы действуют бессрочно, без функций продления/просрочки.

window.loadMyDocs = async function() {
    const guestDiv = document.getElementById('mydocs-guest');
    const listDiv  = document.getElementById('mydocs-list');
    if (!window.currentUser) { if (guestDiv) guestDiv.style.display = ''; if (listDiv) listDiv.innerHTML = ''; return; }
    if (guestDiv) guestDiv.style.display = 'none';
    if (!listDiv) return;
    listDiv.innerHTML = '<div class="loading-text">Загрузка...</div>';
    const reqs = await db(`requests?user_id=eq.${window.currentUser.id}&order=created_at.desc`);
    if (!Array.isArray(reqs) || !reqs.length) { listDiv.innerHTML = '<div class="loading-text" style="opacity:0.5">У вас нет заявок</div>'; return; }
    const typeLabels = { passport:'🪪 Паспорт', medbook:'🏥 Мед. книжка', license:'🔫 Лицензия', driving_license:'🚗 Права на вождение', faction_join:'🏛️ Вступление во фракцию', court:'⚖️ Судебный иск', government:'📋 Обращение в правительство', lawyer:'👨‍⚖️ Адвокат', opg_create:'💀 Создание ОПГ', opg_join:'💀 Вступление в ОПГ', mafia_create:'🤵 Создание Мафии', mafia_join:'🤵 Вступление в Мафию' };
    const typeIcons  = { passport:'🪪', medbook:'🏥', license:'🔫', driving_license:'🚗', faction_join:'🏛️', court:'⚖️', government:'📋', lawyer:'👨‍⚖️', opg_create:'💀', opg_join:'💀', mafia_create:'🤵', mafia_join:'🤵' };
    const canM = canManageDocs(window.currentUser);
    listDiv.innerHTML = reqs.map(r => {
        const sb  = r.status==='approved' ? '<span class="badge badge-approved">✓ Одобрено</span>' : r.status==='rejected' ? '<span class="badge badge-rejected">✕ Отклонено</span>' : '<span class="badge badge-pending">⏳ На рассмотрении</span>';
        const date = r.created_at ? new Date(r.created_at).toLocaleDateString('ru-RU') : '';
        const btns = canM ? `<div style="display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)"><button onclick="deleteRequest(${r.id},'mydocs')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer">🗑 Удалить</button></div>` : '';
        return `<div class="doc-card" style="flex-direction:column;align-items:stretch;gap:0"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div style="display:flex;align-items:center;gap:14px"><div class="doc-icon">${typeIcons[r.type]||'📄'}</div><div><div style="font-weight:700;color:#fff;font-size:16px">${typeLabels[r.type]||r.type}</div><div style="color:var(--text);font-size:13px;margin-top:2px">${date} • ${escHtml(r.char_name||r.username||'')}</div></div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">${sb}</div></div>${btns}</div>`;
    }).join('');
};

window.deleteRequest = async function(id, section) {
    if (!confirm('Удалить этот документ?')) return;
    try {
        await callSiteApi('deleteRequest', { id });
        notify('Документ удалён');
        if (section==='passports') loadPassports(); else loadMyDocs();
    } catch (e) { notify('Не удалось удалить: ' + (e.message||'неизвестная ошибка'), false); }
};

// ─── ADMIN REQUESTS ───────────────────────────

const REQUEST_TYPE_NAMES = { passport:'🪪 Паспорт', medbook:'🏥 Мед. книжка', license:'🔫 Лицензия', driving_license:'🚗 Права на вождение', faction_join:'🏛️ Вступление во фракцию', court:'⚖️ Судебный иск', government:'📋 Правительство', lawyer:'👨‍⚖️ Адвокат', opg_create:'💀 Создание ОПГ', opg_join:'💀 Вступление в ОПГ', mafia_create:'🤵 Создание Мафии', mafia_join:'🤵 Вступление в Мафию' };

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
        return `<div class="request-card"><div class="request-type">${REQUEST_TYPE_NAMES[r.type]||r.type} • ${date}</div><div class="request-player">${escHtml(r.username||'—')}</div><div class="request-data">${details}</div><div class="request-actions"><button class="btn-approve" onclick="reviewRequest(${r.id},'approved')">✓ Одобрить</button><button class="btn-reject" onclick="reviewRequest(${r.id},'rejected')">✕ Отклонить</button></div></div>`;
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
    let res;
    try {
        res = await callSiteApi('reviewRequest', { id, status });
    } catch (e) { return notify('Не удалось обработать заявку: ' + (e.message||'неизвестная ошибка'), false); }
    const req = res.request;
    if (status === 'approved' && res.discordId && res.newFaction) {
        await assignDiscordRole(res.discordId, res.newFaction, res.oldFaction || null);
        if (window.currentUser && window.currentUser.id === req.user_id) {
            window.currentUser.faction = res.newFaction;
            localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
            updateAuthZone();
        }
    }
    const webhook = WEBHOOK_BY_TYPE[req.type] || WEBHOOK_PASSPORT_LICENSE;
    const typeNames = { passport:'🪪 Паспорт', medbook:'🏥 Мед. книжка', license:'🔫 Лицензия', driving_license:'🚗 Права на вождение', faction_join:'🏛️ Вступление во фракцию', court:'⚖️ Судебный иск', government:'📋 Правительство', lawyer:'👨‍⚖️ Адвокат', opg_create:'💀 Создание ОПГ', opg_join:'💀 Вступление в ОПГ', mafia_create:'🤵 Создание Мафии', mafia_join:'🤵 Вступление в Мафию' };
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

// Если название фракции на сайте отличается от точного названия роли в Discord — впишите соответствие сюда.
// Ключ — как фракция называется на сайте, значение — как называется роль в Discord (регистр не важен).
// Если фракция не указана в списке, бот попробует найти роль с точно таким же именем, как на сайте.
const DISCORD_ROLE_NAME_MAP = {
    // 'Патрульная Полиция (ДПС)': 'ДПС',
};

async function assignDiscordRole(discordUsername, factionValue, oldFactionValue) {
    if (!discordUsername || !factionValue) return;
    const roleName = DISCORD_ROLE_NAME_MAP[factionValue] || factionValue;
    const oldRoleName = oldFactionValue ? (DISCORD_ROLE_NAME_MAP[oldFactionValue] || oldFactionValue) : null;
    try {
        const res = await fetch(SUPABASE_URL + '/functions/v1/assign-discord-role', {
            method: 'POST',
            headers: H,
            body: JSON.stringify({ discordUsername, roleName, oldRoleName })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            console.warn('assignDiscordRole: не удалось выдать роль в Discord', data);
            notify('Заявка одобрена, но роль в Discord не выдалась: ' + (data.error || res.status), false);
        }
    } catch (e) {
        console.warn('assignDiscordRole error', e);
    }
}

// FIX 6: При одобрении заявки на вступление во фракцию/ОПГ/Мафию — фракция сразу
// проставляется пользователю на сайте (аналогично ручному изменению в таблице пользователей).
// Если у игрока указан ник Discord в профиле — сайт просит бота снять старую роль фракции
// (если она была) и выдать новую.
// applyApprovalSideEffects была перенесена в Edge Function actionReviewRequest
// (изменение фракции пользователя теперь происходит на сервере, а не из браузера).

// ─── DOCUMENTS VIEWER ─────────────────────────

function renderDocCard(r, fields, icon, section) {
    const statusBadge = '<span class="badge badge-approved">✓ Действителен (бессрочно)</span>';
    const canM = canManageDocs(window.currentUser);
    const btns = canM ? `<div style="display:flex;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)"><button onclick="deleteRequest(${r.id},'${section}')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer">🗑 Удалить</button></div>` : '';
    return `<div class="doc-card" style="flex-direction:column;align-items:stretch;gap:0"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px"><div style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;color:#fff">${icon} ${escHtml(r.char_name||r.username)}</div><div style="text-align:right">${statusBadge}</div></div><div style="color:var(--text);font-size:14px;line-height:1.9;margin-top:12px;border-top:1px solid var(--border);padding-top:12px">${fields}</div>${btns}</div>`;
}

window._passportsCache = { passports: [], licenses: [], drivingLicenses: [], medbooks: [] };

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
    const [passports, licenses, drivingLicenses, medbooks] = await Promise.all([
        canSeeAll ? db('requests?type=eq.passport&status=eq.approved&order=created_at.desc') : Promise.resolve([]),
        canSeeAll ? db('requests?type=eq.license&status=eq.approved&order=created_at.desc') : Promise.resolve([]),
        canSeeAll ? db('requests?type=eq.driving_license&status=eq.approved&order=created_at.desc') : Promise.resolve([]),
        (canSeeAll || canMedbok) ? db('requests?type=eq.medbook&status=eq.approved&order=created_at.desc') : Promise.resolve([]),
    ]);
    window._passportsCache = {
        passports: Array.isArray(passports) ? passports : [],
        licenses:  Array.isArray(licenses)  ? licenses  : [],
        drivingLicenses: Array.isArray(drivingLicenses) ? drivingLicenses : [],
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
    const { passports, licenses, drivingLicenses, medbooks } = window._passportsCache;
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
    if (canSeeAll && (filterType === 'all' || filterType === 'driving_license')) {
        const list = drivingLicenses.filter(matchQ);
        total += list.length;
        html += `<div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:3px;color:#fff;margin-bottom:16px">🚗 Права на вождение</div>`;
        html += !list.length ? '<div class="loading-text" style="opacity:0.5;margin-bottom:32px">Ничего не найдено</div>' : '<div style="display:grid;gap:12px;margin-bottom:40px">' + list.map(r=>renderDocCard(r,`<b>👤 Игрок:</b> ${escHtml(r.username)}<br><b>📛 ФИО:</b> ${escHtml(r.char_name||'—')}<br><b>🎂 Дата рождения:</b> ${r.dob||'—'}<br><b>💼 Место работы:</b> ${escHtml(r.address||'—')}<br><b>🚗 Категории:</b> ${escHtml(r.weapon_type||'—')}`,'🚗','passports')).join('') + '</div>';
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
    loadTeamPublic();
    loadSiteSettings();

    document.getElementById('login-password')?.addEventListener('keydown', e => { if(e.key==='Enter') handleLogin(); });
    document.getElementById('reg-password2')?.addEventListener('keydown',  e => { if(e.key==='Enter') handleRegister(); });

    if (location.hash) readHash();
});
window._updateCountdownInterval = null;
function startUpdateCountdown(targetIso) {
    if (window._updateCountdownInterval) { clearInterval(window._updateCountdownInterval); window._updateCountdownInterval = null; }
    const targetDate = new Date(targetIso || "2026-07-10T21:00:00+03:00").getTime();
    const timerElement = document.getElementById("countdown-timer");
    if (!timerElement) return;

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(interval);
            window._updateCountdownInterval = null;
            timerElement.innerHTML = "ОБНОВЛЕНИЕ ВЫШЛО! 🔥";
            timerElement.style.color = "#4ade80";
            timerElement.style.textShadow = "0 0 12px rgba(74, 222, 128, 0.5)";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let timerText = "";
        if (days > 0) timerText += `${days}д `;
        
        // Добавляем нули перед цифрами для красоты (например, 09ч 05м 02с)
        const formatNum = (num) => num < 10 ? '0' + num : num;
        
        timerText += `${formatNum(hours)}ч ${formatNum(minutes)}м ${formatNum(seconds)}с`;

        timerElement.innerHTML = timerText;
    }, 1000);
    window._updateCountdownInterval = interval;
}

const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const H = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
};

const WEBHOOK_PASSPORT_LICENSE  = "https://discord.com/api/webhooks/1512820632058986547/OniZFPqznfcU7vdI2vdRVWrpJ8k5JBL6v5BJZpLVLXYYa6p0TW5fs8TGuzklSAu18dlc";
const WEBHOOK_WEAPON_LICENSE    = "https://discord.com/api/webhooks/1528866353325539610/xIJdu9OOBBPPSuvFHTOVg3ngcleF_PBopE9z_b7POzsaWpsYl-iMIhpOx7h05VcMfbUc";
const WEBHOOK_DRIVING_LICENSE   = "https://discord.com/api/webhooks/1528866837515862066/FeZYEugNHW2axmpAa60Hn2sGZyApdxDG5giBr5uQvUCWwvFS4F39ekb7sb0TKA-tmqWA";
const WEBHOOK_MEDBOOK            = "https://discord.com/api/webhooks/1512820863924310270/8NT6tTfotF0iOlfavrKNVeSN4BF3Z1WgTDEa8EoVHZiVfgdrXdH8EfVqBc1qSrvTqZyQ";
const WEBHOOK_COURT              = "https://discord.com/api/webhooks/1528867564531486851/H4uDTOtXB-MT09zZbYtuj4MEUhOLoonBevimEMZHvTHBizfjvwud_Oupet9G0NSQupVA";

const WEBHOOK_BY_TYPE = {
    passport:        WEBHOOK_PASSPORT_LICENSE,
    license:         WEBHOOK_WEAPON_LICENSE,
    driving_license: WEBHOOK_DRIVING_LICENSE,
    medbook:         WEBHOOK_MEDBOOK,
    faction_join:    WEBHOOK_MEDBOOK,
    opg_create:      WEBHOOK_MEDBOOK,
    opg_join:        WEBHOOK_MEDBOOK,
    mafia_create:    WEBHOOK_MEDBOOK,
    mafia_join:      WEBHOOK_MEDBOOK,
    court:           WEBHOOK_COURT,
    government:      WEBHOOK_PASSPORT_LICENSE,
    lawyer:          WEBHOOK_MEDBOOK,
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

// Сроки действия документов и оплата за их оформление отменены по решению администрации.
const OPG_MAX   = 2;
const MAFIA_MAX = 1;

window.currentUser = JSON.parse(localStorage.getItem('nrp_user') || 'null');
window._siteToken = localStorage.getItem('nrp_token') || null;

// ─── SITE-ADMIN EDGE FUNCTION ─────────────────
// Все чувствительные действия (логин/регистрация, смена роли/фракции, сброс пароля,
// одобрение заявок, публикация/удаление новостей, настройки владельца) теперь идут
// не напрямую в Supabase анонимным ключом, а через Edge Function site-admin,
// которая проверяет права на сервере и пишет в базу через service_role.
async function callSiteApi(action, payload = {}) {
    const res = await fetch(SUPABASE_URL + '/functions/v1/site-admin', {
        method: 'POST',
        headers: H,
        body: JSON.stringify({ action, token: window._siteToken, ...payload })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Ошибка (${res.status})`);
    return data;
}

// ─── БЕЗОПАСНОСТЬ ПАРОЛЕЙ ─────────────────────
// Пароли больше не хранятся в открытом виде. Для каждого пароля генерируется
// случайная соль, и в базу пишется "соль$хэш" (SHA-256). Логин сравнивает хэши,
// а не сами пароли. Это не полноценный серверный bcrypt (сайт работает без
// собственного бэкенда, напрямую с Supabase), но пароли пользователей больше
// не читаются напрямую из базы — это уже совсем другой уровень защиты.
// Хеширование/проверка паролей больше не выполняются в браузере — это делает
// только Edge Function site-admin на сервере (через service_role), клиент
// присылает пароль только по HTTPS в момент логина/регистрации/смены пароля.

// Требования к паролю при регистрации: не даём выбрать слишком простой пароль.
const COMMON_WEAK_PASSWORDS = ['12345678','password','qwerty123','11111111','123456789','qwertyui','admin123','password1','1q2w3e4r','00000000'];
function checkPasswordStrength(p) {
    if (!p || p.length < 8) return { ok:false, reason:'Пароль должен быть не менее 8 символов' };
    if (!/[a-zа-я]/i.test(p) || !/[0-9]/.test(p)) return { ok:false, reason:'Пароль должен содержать и буквы, и цифры' };
    if (!/[A-ZА-Я]/.test(p) || !/[a-zа-я]/.test(p)) return { ok:false, reason:'Пароль должен содержать буквы разных регистров (заглавные и строчные)' };
    if (/^(.)\1+$/.test(p)) return { ok:false, reason:'Пароль не должен состоять из одного повторяющегося символа' };
    if (COMMON_WEAK_PASSWORDS.includes(p.toLowerCase())) return { ok:false, reason:'Этот пароль слишком распространён, выберите другой' };
    return { ok:true, reason:'' };
}

window.renderPasswordStrength = function() {
    const el = document.getElementById('reg-password-strength');
    if (!el) return;
    const p = document.getElementById('reg-password')?.value || '';
    if (!p) { el.textContent = 'Минимум 8 символов, буквы и цифры разных регистров'; el.style.color = 'var(--text)'; return; }
    const res = checkPasswordStrength(p);
    el.textContent = res.ok ? '✓ Пароль подходит' : '✕ ' + res.reason;
    el.style.color = res.ok ? '#4ade80' : '#f87171';
};

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
    services: { passport:true, medbook:true, license:true, 'driving-license':true, 'faction-join':true, court:true, government:true, lawyer:true, home:true, credit:true, 'opg-mafia':true },
    registration_open: true,
    banner: {
        active: true,
        label: 'ОБНОВЛЕНИЕ',
        version: 'Версия V3.15',
        infoLabel: 'ЧТО НОВОГО',
        info: 'Ювелирный магазин & Дальнобойщики',
        timerLabel: 'ДО ВЫХОДА',
        timerTarget: '2026-07-10T21:00:00+03:00'
    },
    // FIX 7: метаданные фракций (цвет / категория / статус "скоро"), редактируемые в панели владельца
    factionMeta: {}
};
window.siteFlags = DEFAULT_SITE_FLAGS;

const FACTION_CATEGORY_LABELS = { government:'ГОСУДАРСТВЕННАЯ', criminal:'КРИМИНАЛЬНАЯ', other:'ИНОЕ' };
const FACTION_CATEGORY_COLORS = { government:'#3b82f6', criminal:'#f87171', other:'#a855f7' };

async function loadSiteSettings() {
    try {
        const rows = await db('site_settings?key=eq.site_flags&select=value');
        if (Array.isArray(rows) && rows[0] && rows[0].value) {
            const flags = rows[0].value;
            window.siteFlags = Object.assign({}, DEFAULT_SITE_FLAGS, flags, {
                tabs: Object.assign({}, DEFAULT_SITE_FLAGS.tabs, flags.tabs || {}),
                services: Object.assign({}, DEFAULT_SITE_FLAGS.services, flags.services || {}),
                banner: Object.assign({}, DEFAULT_SITE_FLAGS.banner, flags.banner || {}),
                factionMeta: Object.assign({}, DEFAULT_SITE_FLAGS.factionMeta, flags.factionMeta || {})
            });
        } else {
            await db('site_settings', { method:'POST', body: JSON.stringify({ key:'site_flags', value: DEFAULT_SITE_FLAGS }) }).catch(()=>{});
        }
    } catch(e) { console.warn('site_settings load error', e); }
    applySiteFlags();
    renderUpdateBanner();
    fillBannerAdminForm();
    applyFactionMeta();
    loadFactionManager();
}

// ─── БАННЕР ОБНОВЛЕНИЙ (редактируется админами из профиля) ──
function renderUpdateBanner() {
    const b = (window.siteFlags && window.siteFlags.banner) || DEFAULT_SITE_FLAGS.banner;
    const container = document.getElementById('site-banner');
    if (!container) return;
    container.style.display = b.active === false ? 'none' : '';
    const elLabel = document.getElementById('banner-version-label');
    const elValue = document.getElementById('banner-version-value');
    const elInfoLabel = document.getElementById('banner-info-label');
    const elInfo = document.getElementById('banner-info-value');
    const elTimerLabel = document.getElementById('banner-timer-label');
    if (elLabel) elLabel.textContent = b.label || DEFAULT_SITE_FLAGS.banner.label;
    if (elValue) elValue.textContent = b.version || DEFAULT_SITE_FLAGS.banner.version;
    if (elInfoLabel) elInfoLabel.textContent = b.infoLabel || DEFAULT_SITE_FLAGS.banner.infoLabel;
    if (elInfo) elInfo.textContent = b.info || DEFAULT_SITE_FLAGS.banner.info;
    if (elTimerLabel) elTimerLabel.textContent = b.timerLabel || DEFAULT_SITE_FLAGS.banner.timerLabel;
    startUpdateCountdown(b.timerTarget || DEFAULT_SITE_FLAGS.banner.timerTarget);

    // Иконки блоков (необязательные — можно поменять эмодзи в каждом блоке)
    const icon1 = document.getElementById('banner-icon-1'); if (icon1) icon1.textContent = b.icon1 || '🚀';
    const icon2 = document.getElementById('banner-icon-2'); if (icon2) icon2.textContent = b.icon2 || '💎';
    const icon3 = document.getElementById('banner-icon-3'); if (icon3) icon3.textContent = b.icon3 || '⏳';

    // Показ/скрытие отдельных блоков баннера
    const s1 = document.getElementById('banner-section-1'); if (s1) s1.style.display = b.showSection1 === false ? 'none' : '';
    const s2 = document.getElementById('banner-section-2'); if (s2) s2.style.display = b.showSection2 === false ? 'none' : '';
    const s3 = document.getElementById('banner-section-3'); if (s3) s3.style.display = b.showSection3 === false ? 'none' : '';
    const d1 = document.getElementById('banner-divider-1'); if (d1) d1.style.display = b.showSection1 === false ? 'none' : '';
    const d2 = document.getElementById('banner-divider-2'); if (d2) d2.style.display = b.showSection2 === false ? 'none' : '';

    // Необязательная кнопка-ссылка (CTA) — 4-й, дополнительный блок баннера
    const ctaSection = document.getElementById('banner-section-cta');
    const ctaDivider = document.getElementById('banner-divider-cta');
    const ctaLink = document.getElementById('banner-cta-link');
    const showCta = !!(b.ctaText && b.ctaUrl);
    if (ctaSection) ctaSection.style.display = showCta ? '' : 'none';
    if (ctaDivider) ctaDivider.style.display = showCta ? '' : 'none';
    if (ctaLink && showCta) { ctaLink.textContent = b.ctaText; ctaLink.href = b.ctaUrl; }
}

function fillBannerAdminForm() {
    const b = (window.siteFlags && window.siteFlags.banner) || DEFAULT_SITE_FLAGS.banner;
    const activeEl = document.getElementById('banner-admin-active'); if (activeEl) activeEl.checked = b.active !== false;
    const set = (id, val) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = val || ''; };
    set('banner-admin-label', b.label);
    set('banner-admin-version', b.version);
    set('banner-admin-infolabel', b.infoLabel);
    set('banner-admin-info', b.info);
    set('banner-admin-timerlabel', b.timerLabel);
    set('banner-admin-icon1', b.icon1);
    set('banner-admin-icon2', b.icon2);
    set('banner-admin-icon3', b.icon3);
    set('banner-admin-cta-text', b.ctaText);
    set('banner-admin-cta-url', b.ctaUrl);
    const s1 = document.getElementById('banner-admin-show1'); if (s1) s1.checked = b.showSection1 !== false;
    const s2 = document.getElementById('banner-admin-show2'); if (s2) s2.checked = b.showSection2 !== false;
    const s3 = document.getElementById('banner-admin-show3'); if (s3) s3.checked = b.showSection3 !== false;
    if (b.timerTarget) {
        const el = document.getElementById('banner-admin-timer');
        if (el && document.activeElement !== el) {
            try { el.value = new Date(b.timerTarget).toISOString().slice(0,16); } catch(e){}
        }
    }
}

window.saveBannerSettings = async function() {
    if (!isAdmin(window.currentUser)) return notify('Нет доступа', false);
    const active = document.getElementById('banner-admin-active')?.checked !== false;
    const label = document.getElementById('banner-admin-label')?.value.trim() || DEFAULT_SITE_FLAGS.banner.label;
    const version = document.getElementById('banner-admin-version')?.value.trim() || DEFAULT_SITE_FLAGS.banner.version;
    const infoLabel = document.getElementById('banner-admin-infolabel')?.value.trim() || DEFAULT_SITE_FLAGS.banner.infoLabel;
    const info = document.getElementById('banner-admin-info')?.value.trim() || '';
    const timerLabel = document.getElementById('banner-admin-timerlabel')?.value.trim() || DEFAULT_SITE_FLAGS.banner.timerLabel;
    const timerRaw = document.getElementById('banner-admin-timer')?.value;
    const timerTarget = timerRaw ? new Date(timerRaw).toISOString() : null;
    const icon1 = document.getElementById('banner-admin-icon1')?.value.trim() || '🚀';
    const icon2 = document.getElementById('banner-admin-icon2')?.value.trim() || '💎';
    const icon3 = document.getElementById('banner-admin-icon3')?.value.trim() || '⏳';
    const ctaText = document.getElementById('banner-admin-cta-text')?.value.trim() || '';
    const ctaUrl = document.getElementById('banner-admin-cta-url')?.value.trim() || '';
    const showSection1 = document.getElementById('banner-admin-show1')?.checked !== false;
    const showSection2 = document.getElementById('banner-admin-show2')?.checked !== false;
    const showSection3 = document.getElementById('banner-admin-show3')?.checked !== false;
    const banner = { active, label, version, infoLabel, info, timerLabel, timerTarget, icon1, icon2, icon3, ctaText, ctaUrl, showSection1, showSection2, showSection3 };
    const newFlags = Object.assign({}, window.siteFlags, { banner });
    try {
        const existingRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.site_flags', { headers: H });
        const existing = await existingRes.json();
        let saveRes;
        if (Array.isArray(existing) && existing.length) {
            saveRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.site_flags', { method:'PATCH', headers: H, body: JSON.stringify({ value: newFlags }) });
        } else {
            saveRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings', { method:'POST', headers: H, body: JSON.stringify({ key:'site_flags', value: newFlags }) });
        }
        if (!saveRes.ok) {
            const errBody = await saveRes.text().catch(()=> '');
            console.error('saveBannerSettings: сервер отклонил сохранение', saveRes.status, errBody);
            return notify('Не сохранилось: сервер вернул ошибку ' + saveRes.status + '. Проверьте права (RLS) на таблицу site_settings в Supabase', false);
        }
        window.siteFlags = newFlags;
        renderUpdateBanner();
        notify('Баннер обновлён — уже виден всем на сайте');
    } catch(e) { console.error('saveBannerSettings error', e); notify('Не удалось сохранить баннер: ' + (e.message||e), false); }
};

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

// ─── УПРАВЛЕНИЕ ФРАКЦИЯМИ (цвет / категория / статус "скоро") ──
// Фракции, добавленные через админ-панель, теперь реально создают карточку
// на главной странице (в нужной категории), а не только сохраняют настройки "вслепую".
const FACTION_GRID_IDS = { government: 'grid-government', criminal: 'grid-criminal', other: 'grid-other' };

function getAllFactionCardNames() {
    return Array.from(document.querySelectorAll('.faction-card .faction-name'))
        .map(el => el.textContent.trim())
        .filter((v, i, arr) => v && arr.indexOf(v) === i);
}

function slugifyFactionName(name) {
    return 'custom-' + name.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/(^-|-$)/g, '');
}

// Создаёт недостающие карточки для фракций, которых ещё нет на странице (managed-факции)
function ensureManagedFactionCards(meta) {
    const existingNames = new Set(getAllFactionCardNames());
    Object.keys(meta).forEach(name => {
        if (existingNames.has(name)) return; // карточка уже есть на сайте — просто применим стили ниже
        const m = meta[name];
        const gridId = FACTION_GRID_IDS[m.category] || FACTION_GRID_IDS.other;
        const grid = document.getElementById(gridId);
        if (!grid) return;
        const slug = slugifyFactionName(name);
        if (document.getElementById('managed-card-' + slug)) return; // уже создана ранее
        const color = m.color || '#00f5ff';
        const card = document.createElement('div');
        card.className = 'faction-card animate-fade-in';
        card.id = 'managed-card-' + slug;
        card.dataset.managed = '1';
        card.innerHTML = `<div class="faction-icon" style="background:${color}14;border-color:${color}40">🏷️</div><div class="faction-name">${escHtml(name)}</div><div class="faction-desc">Фракция, добавленная администрацией сервера.</div><span class="faction-tag" style="color:${FACTION_CATEGORY_COLORS[m.category]||color};border-color:${(FACTION_CATEGORY_COLORS[m.category]||color)}40">${FACTION_CATEGORY_LABELS[m.category]||'ФРАКЦИЯ'}</span><div class="faction-arrow">→</div>`;
        card.setAttribute('onclick', m.soon ? `showComingSoon('faction-soon', ${JSON.stringify(name)})` : `requireAuth(function(){openModal('faction-join')})`);
        grid.appendChild(card);
    });
    // Показываем/прячем категорию "Другое" в зависимости от того, есть ли в ней карточки
    const otherCat = document.getElementById('other-factions-category');
    const otherGrid = document.getElementById('grid-other');
    if (otherCat && otherGrid) otherCat.style.display = otherGrid.children.length ? '' : 'none';
}

function applyFactionMeta() {
    const meta = (window.siteFlags && window.siteFlags.factionMeta) || {};
    ensureManagedFactionCards(meta);
    document.querySelectorAll('.faction-card').forEach(card => {
        const nameEl = card.querySelector('.faction-name');
        if (!nameEl) return;
        const name = nameEl.textContent.trim();
        const m = meta[name];
        if (!m) return;
        const icon = card.querySelector('.faction-icon');
        if (icon && m.color) {
            icon.style.background = m.color + '14';
            icon.style.borderColor = m.color + '40';
        }
        const tag = card.querySelector('.faction-tag');
        if (tag && m.category) {
            tag.textContent = FACTION_CATEGORY_LABELS[m.category] || tag.textContent;
            tag.style.color = FACTION_CATEGORY_COLORS[m.category] || '';
            tag.style.borderColor = (FACTION_CATEGORY_COLORS[m.category] || '') + '40';
        }
        // Сохраняем оригинальный onclick один раз, чтобы можно было включать/выключать "скоро" без потери формы вступления
        if (!card.dataset.originalOnclick) card.dataset.originalOnclick = card.getAttribute('onclick') || '';
        if (m.soon) {
            card.setAttribute('onclick', `showComingSoon('faction-soon', ${JSON.stringify(name)})`);
        } else if (card.dataset.originalOnclick) {
            card.setAttribute('onclick', card.dataset.originalOnclick);
        }
    });
}

window.loadFactionManager = function() {
    const body = document.getElementById('faction-manager-body');
    if (!body) return;
    const meta = (window.siteFlags && window.siteFlags.factionMeta) || {};
    const names = getAllFactionCardNames();
    // Показываем и фракции с карточками на сайте, и те, что были добавлены вручную, но пока без карточки
    const allNames = names.concat(Object.keys(meta).filter(n => !names.includes(n)));
    if (!allNames.length) { body.innerHTML = '<tr><td colspan="5" style="padding:14px;opacity:0.5">Фракций не найдено</td></tr>'; return; }
    body.innerHTML = allNames.map(name => {
        const m = meta[name] || { color:'#00f5ff', category:'government', soon:false };
        const safeId = name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_');
        return `<tr>
            <td style="padding:10px 12px;color:#fff">${escHtml(name)}</td>
            <td style="padding:10px 12px"><input type="color" id="fm-color-${safeId}" value="${m.color || '#00f5ff'}" style="width:40px;height:32px;border:none;border-radius:6px;background:none;cursor:pointer"></td>
            <td style="padding:10px 12px"><select id="fm-cat-${safeId}" class="form-input" style="padding:6px 10px;font-size:13px">
                <option value="government" ${m.category==='government'?'selected':''}>Государственная</option>
                <option value="criminal" ${m.category==='criminal'?'selected':''}>Криминальная</option>
                <option value="other" ${m.category==='other'?'selected':''}>Иное</option>
            </select></td>
            <td style="padding:10px 12px"><input type="checkbox" id="fm-soon-${safeId}" ${m.soon?'checked':''}></td>
            <td style="padding:10px 12px;white-space:nowrap">
                <button class="form-submit" style="padding:6px 12px;font-size:12px;margin:0 6px 0 0;display:inline-block;width:auto" onclick="saveManagedFaction(${JSON.stringify(name)}, '${safeId}')">Сохранить</button>
                <button style="background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);color:#f87171;padding:6px 10px;border-radius:8px;cursor:pointer;font-size:12px" onclick="deleteManagedFaction(${JSON.stringify(name)})">✕</button>
            </td>
        </tr>`;
    }).join('');
};

async function persistFactionMeta(newMeta) {
    const newFlags = Object.assign({}, window.siteFlags, { factionMeta: newMeta });
    try {
        const existingRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.site_flags', { headers: H });
        const existing = await existingRes.json();
        let saveRes;
        if (Array.isArray(existing) && existing.length) {
            saveRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.site_flags', { method:'PATCH', headers: H, body: JSON.stringify({ value: newFlags }) });
        } else {
            saveRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings', { method:'POST', headers: H, body: JSON.stringify({ key:'site_flags', value: newFlags }) });
        }
        if (!saveRes.ok) { notify('Не сохранилось: сервер вернул ошибку ' + saveRes.status, false); return false; }
        window.siteFlags = newFlags;
        applyFactionMeta();
        return true;
    } catch(e) { console.error(e); notify('Ошибка сохранения фракции', false); return false; }
}

window.saveManagedFaction = async function(name, safeId) {
    if (!isOwner(window.currentUser)) return notify('Нет доступа', false);
    const color = document.getElementById('fm-color-' + safeId)?.value || '#00f5ff';
    const category = document.getElementById('fm-cat-' + safeId)?.value || 'government';
    const soon = document.getElementById('fm-soon-' + safeId)?.checked || false;
    const meta = Object.assign({}, window.siteFlags.factionMeta);
    meta[name] = { color, category, soon };
    if (await persistFactionMeta(meta)) notify('Фракция «' + name + '» обновлена');
};

window.deleteManagedFaction = async function(name) {
    if (!isOwner(window.currentUser)) return notify('Нет доступа', false);
    if (!confirm('Убрать фракцию «' + name + '»? Если она была создана только через админ-панель, её карточка также будет удалена с главной страницы.')) return;
    const meta = Object.assign({}, window.siteFlags.factionMeta);
    delete meta[name];
    if (await persistFactionMeta(meta)) {
        const card = document.getElementById('managed-card-' + slugifyFactionName(name));
        if (card) card.remove();
        const otherCat = document.getElementById('other-factions-category');
        const otherGrid = document.getElementById('grid-other');
        if (otherCat && otherGrid) otherCat.style.display = otherGrid.children.length ? '' : 'none';
        notify('Фракция убрана');
        loadFactionManager();
    }
};

window.addManagedFaction = async function() {
    if (!isOwner(window.currentUser)) return notify('Нет доступа', false);
    const name = document.getElementById('faction-add-name')?.value.trim();
    const color = document.getElementById('faction-add-color')?.value || '#00f5ff';
    const category = document.getElementById('faction-add-category')?.value || 'government';
    const soon = document.getElementById('faction-add-soon')?.checked || false;
    if (!name) return notify('Введите название фракции', false);
    const meta = Object.assign({}, window.siteFlags.factionMeta);
    meta[name] = { color, category, soon };
    if (await persistFactionMeta(meta)) {
        notify('Фракция «' + name + '» создана и уже отображается на главной странице');
        document.getElementById('faction-add-name').value = '';
        loadFactionManager();
    }
};

async function db(path, opts) {
    let res;
    try {
        res = await fetch(SUPABASE_URL + '/rest/v1/' + path, { headers: H, ...opts });
    } catch (networkErr) {
        throw new Error('Нет связи с сервером. Проверьте интернет-соединение и попробуйте снова.');
    }
    let json = null;
    try { json = await res.json(); } catch (e) { json = null; }
    if (!res.ok) {
        const msg = (json && (json.message || json.hint || json.error_description || json.error)) || ('Ошибка сервера (' + res.status + ')');
        const err = new Error(msg);
        err.status = res.status;
        throw err;
    }
    return json;
}

// FIX: раньше кнопки форм не давали никакой обратной связи, пока идёт запрос —
// казалось, что «кнопка не нажимается». Теперь кнопка блокируется и показывает
// «Отправка...», а при ошибке — понятное сообщение вместо тишины.
function setModalBusy(modalId, busy, busyText) {
    const btn = document.querySelector('#modal-' + modalId + ' .form-submit');
    if (!btn) return;
    if (busy) {
        btn.dataset.origText = btn.dataset.origText || btn.textContent;
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'wait';
        btn.textContent = busyText || 'Отправка...';
    } else {
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.cursor = '';
        if (btn.dataset.origText) btn.textContent = btn.dataset.origText;
    }
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

const VALID_TABS = ['main','portal','news','rules','profile'];
// Команда теперь отображается прямо на главной странице — старые ссылки #team ведут на главную
const LEGACY_TAB_REDIRECTS = { team: 'main' };

window.navigateTo = function(tab, section) {
    tab = LEGACY_TAB_REDIRECTS[tab] || tab;
    let hash = '#' + tab;
    if (section) hash += '/' + section;
    history.pushState({ tab, section: section||null }, '', hash);
    switchTab(tab, false);
    if (section && tab === 'portal') setTimeout(() => switchPortal(section), 50);
};

function readHash() {
    const hash = location.hash.replace('#','');
    if (!hash) return;
    const [tabRaw, section] = hash.split('/');
    const tab = LEGACY_TAB_REDIRECTS[tabRaw] || tabRaw;
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
    if (tab === 'main')  { loadCriminalCounters(); loadTeamPublic(); }
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
    setModalBusy('opg-create', true);
    try {
        const existing = await db('criminal_gangs?type=eq.opg&status=eq.active');
        if (Array.isArray(existing) && existing.length >= OPG_MAX) return notify(`Лимит ОПГ (${OPG_MAX}) достигнут!`, false);
        const res = await db('criminal_gangs', { method:'POST', body: JSON.stringify({ type:'opg', name, description:desc, tag, founder:u, status:'active', created_by: window.currentUser?.id }) });
        if (!res || !res[0]) throw new Error('Сервер не подтвердил создание');
        await db('requests', { method:'POST', body: JSON.stringify({ type:'opg_create', username:u, char_name:name, note:desc, faction:tag, status:'pending', user_id: window.currentUser?.id }) });
        closeModal('opg-create'); notify('ОПГ «' + name + '» создана! Ожидайте подтверждения администрации.'); loadCriminalCounters();
    } catch (e) { notify('Ошибка при создании ОПГ: ' + (e.message||'неизвестная ошибка'), false); }
    finally { setModalBusy('opg-create', false); }
};

window.submitCreateMafia = async function() {
    const u = document.getElementById('mafia-create-username').value.trim();
    const name = document.getElementById('mafia-create-name').value.trim();
    const desc = document.getElementById('mafia-create-desc').value.trim();
    if (!u || !name) return notify('Заполните обязательные поля', false);
    setModalBusy('mafia-create', true);
    try {
        const existing = await db('criminal_gangs?type=eq.mafia&status=eq.active');
        if (Array.isArray(existing) && existing.length >= MAFIA_MAX) return notify(`Лимит Мафий (${MAFIA_MAX}) достигнут!`, false);
        const res = await db('criminal_gangs', { method:'POST', body: JSON.stringify({ type:'mafia', name, description:desc, tag:'', founder:u, status:'active', created_by: window.currentUser?.id }) });
        if (!res || !res[0]) throw new Error('Сервер не подтвердил создание');
        await db('requests', { method:'POST', body: JSON.stringify({ type:'mafia_create', username:u, char_name:name, note:desc, status:'pending', user_id: window.currentUser?.id }) });
        closeModal('mafia-create'); notify('Мафия «' + name + '» создана! Ожидайте подтверждения.'); loadCriminalCounters();
    } catch (e) { notify('Ошибка при создании: ' + (e.message||'неизвестная ошибка'), false); }
    finally { setModalBusy('mafia-create', false); }
};

window.submitJoinOpg = async function() {
    const u = document.getElementById('opg-join-username').value.trim();
    const gangId = document.getElementById('opg-join-select').value;
    const reason = document.getElementById('opg-join-reason').value.trim();
    if (!u || !gangId) return notify('Заполните все поля', false);
    setModalBusy('opg-join', true);
    try {
        await db('requests', { method:'POST', body: JSON.stringify({ type:'opg_join', username:u, note:reason, experience:String(gangId), status:'pending', user_id: window.currentUser?.id }) });
        closeModal('opg-join'); notify('Заявка на вступление в ОПГ отправлена!');
    } catch (e) { notify('Не удалось отправить заявку: ' + (e.message||'неизвестная ошибка'), false); }
    finally { setModalBusy('opg-join', false); }
};

window.submitJoinMafia = async function() {
    const u = document.getElementById('mafia-join-username').value.trim();
    const reason = document.getElementById('mafia-join-reason').value.trim();
    if (!u) return notify('Введите никнейм', false);
    setModalBusy('mafia-join', true);
    try {
        await db('requests', { method:'POST', body: JSON.stringify({ type:'mafia_join', username:u, note:reason, status:'pending', user_id: window.currentUser?.id }) });
        closeModal('mafia-join'); notify('Заявка на вступление в Мафию отправлена!');
    } catch (e) { notify('Не удалось отправить заявку: ' + (e.message||'неизвестная ошибка'), false); }
    finally { setModalBusy('mafia-join', false); }
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
        ['passport','medbook','license','dl','faction','court','gov','lawyer','opg-create','opg-join','mafia-create','mafia-join'].forEach(p => {
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
    trucker:   { icon:'🚛', title:'Дальнобойщик — скоро!', desc:'Перевозка грузов между городами, свой тягач и стабильный заработок. Устройство на работу откроется в ближайшем обновлении.' },
    busdriver: { icon:'🚌', title:'Водитель автобуса — скоро!', desc:'Городские маршруты, расписание и пассажиры. Устройство на работу откроется в ближайшем обновлении.' },
};

window.showComingSoon = function(key, factionName) {
    let info = COMING_SOON_INFO[key] || { icon:'🏗️', title:'Скоро!', desc:'Раздел в разработке.' };
    if (key === 'faction-soon') {
        info = { icon:'🚧', title:(factionName || 'Фракция') + ' — скоро откроется!', desc:'Вступление во фракцию «' + (factionName || '') + '» временно недоступно — набор откроется в ближайшем обновлении.' };
    }
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
    const dNick = document.getElementById('reg-discord-nick').value.trim();
    const dUserRaw = document.getElementById('reg-discord-username').value.trim().replace(/^@/, '');
    const dUser = dUserRaw.toLowerCase();
    const p  = document.getElementById('reg-password').value;
    const p2 = document.getElementById('reg-password2').value;
    if (!dUser || !p || !dNick) return notify('Заполните все поля, включая Discord Никнейм и Юзернейм', false);
    if (!/^[a-z0-9._]{2,32}$/.test(dUser)) return notify('Discord Юзернейм может содержать только латинские буквы, цифры, точку и подчёркивание', false);
    if (p !== p2) return notify('Пароли не совпадают', false);
    const pwCheck = checkPasswordStrength(p);
    if (!pwCheck.ok) return notify(pwCheck.reason, false);
    try {
        const res = await callSiteApi('register', { username: dUser, password: p, discord_nick: dNick });
        window.currentUser = res.user;
        window._siteToken = res.token;
        localStorage.setItem('nrp_user', JSON.stringify(res.user));
        localStorage.setItem('nrp_token', res.token);
        closeModal('auth'); updateAuthZone(); notify('Добро пожаловать, ' + dUser + '!'); navigateTo('profile');
    } catch (e) { notify('Ошибка регистрации: ' + (e.message||'неизвестная ошибка'), false); }
};

window.handleLogin = async function() {
    const u = document.getElementById('login-username').value.trim().replace(/^@/, '').toLowerCase();
    const p = document.getElementById('login-password').value;
    if (!u || !p) return notify('Заполните все поля', false);
    try {
        const res = await callSiteApi('login', { username: u, password: p });
        window.currentUser = res.user;
        window._siteToken = res.token;
        localStorage.setItem('nrp_user', JSON.stringify(res.user));
        localStorage.setItem('nrp_token', res.token);
        closeModal('auth'); updateAuthZone(); notify('Добро пожаловать, ' + u + '!'); renderProfile();
    } catch (e) { notify('Ошибка входа: ' + (e.message||'неизвестная ошибка'), false); }
};

window.logout = function() {
    localStorage.removeItem('nrp_user');
    localStorage.removeItem('nrp_token');
    window.currentUser = null;
    window._siteToken = null;
    updateAuthZone(); navigateTo('main'); notify('Вы вышли из аккаунта');
};

// FIX 3: В кнопке профиля показывается ник + роль + фракция
function updateAuthZone() {
    const zone = document.getElementById('auth-zone');
    updateDiscordMissingIndicators();
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
    if (pp) { pp.textContent = '••••••••'; pp.title = 'Пароль защищён и хранится в виде хэша — показать его нельзя, только сменить'; }
    const createdEl = document.getElementById('profile-created');
    if (createdEl) createdEl.textContent = window.currentUser.created_at ? new Date(window.currentUser.created_at).toLocaleDateString('ru-RU') : '—';
    const lastLoginEl = document.getElementById('profile-last-login');
    if (lastLoginEl) lastLoginEl.textContent = window.currentUser.last_login ? new Date(window.currentUser.last_login).toLocaleString('ru-RU') : '—';
    const bioEl = document.getElementById('profile-bio-input');
    if (bioEl) bioEl.value = window.currentUser.bio || '';
    const discordNickEl = document.getElementById('profile-discord-nick');
    if (discordNickEl) discordNickEl.value = window.currentUser.discord_nick || '';
    const discordIdEl = document.getElementById('profile-discord-id');
    if (discordIdEl) discordIdEl.value = window.currentUser.discord_id || '';
    updateDiscordMissingIndicators();

    // Значок ОПГ/Мафия, если пользователь состоит в криминальной организации
    const gangBadge = document.getElementById('profile-gang-badge');
    if (gangBadge) {
        if (faction === 'ОПГ' || faction === 'Мафия') { gangBadge.textContent = (faction === 'Мафия' ? '🤵 ' : '💀 ') + faction; gangBadge.style.display = 'inline-flex'; }
        else gangBadge.style.display = 'none';
    }

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

    const bannerP = document.getElementById('admin-banner-panel');
    if (bannerP) bannerP.style.display = isAdmin(window.currentUser) ? '' : 'none';
    if (isAdmin(window.currentUser)) fillBannerAdminForm();

    const discordReqP = document.getElementById('admin-discord-request-panel');
    if (discordReqP) discordReqP.style.display = isAdmin(window.currentUser) ? '' : 'none';

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
    notify('Пароль хранится в защищённом виде (хэш) и не может быть показан — используйте «Сменить пароль» ниже', false);
};

window.changePassword = async function() {
    const np = document.getElementById('new-password').value;
    const cp = document.getElementById('confirm-password').value;
    if (!np)       return notify('Введите новый пароль', false);
    if (np !== cp) return notify('Пароли не совпадают', false);
    const pwCheck = checkPasswordStrength(np);
    if (!pwCheck.ok) return notify(pwCheck.reason, false);
    try {
        await callSiteApi('changeOwnPassword', { newPassword: np });
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        notify('Пароль изменён!'); renderProfile();
    } catch (e) { notify('Не удалось изменить пароль: ' + (e.message||'неизвестная ошибка'), false); }
};

window.saveBio = async function() {
    const bioEl = document.getElementById('profile-bio-input');
    const bio = (bioEl?.value || '').trim().slice(0, 300);
    try {
        await callSiteApi('updateOwnProfile', { bio });
        window.currentUser.bio = bio;
        localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
        notify('О себе — сохранено');
    } catch(e) { notify('Не удалось сохранить: ' + (e.message||'неизвестная ошибка'), false); }
};

// ─── DISCORD ID (для автоматической выдачи ролей ботом) ──
window.saveDiscordId = async function() {
    const nickEl = document.getElementById('profile-discord-nick');
    const userEl = document.getElementById('profile-discord-id');
    const discordNick = (nickEl?.value || '').trim().slice(0, 60);
    const discordId = (userEl?.value || '').trim().replace(/^@/, '').slice(0, 40);
    if (nickEl) nickEl.value = discordNick;
    if (userEl) userEl.value = discordId;
    try {
        await callSiteApi('updateOwnProfile', { discord_nick: discordNick, discord_id: discordId });
        window.currentUser.discord_nick = discordNick;
        window.currentUser.discord_id = discordId;
        localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
        notify('Discord-данные сохранены');
        updateDiscordMissingIndicators();
    } catch(e) { console.error(e); notify('Не удалось сохранить: ' + (e.message||'неизвестная ошибка'), false); }
};

// FIX 8: показываем красную точку у кнопки "Профиль" и баннер внутри профиля,
// если у пользователя не заполнены Discord Никнейм или Юзернейм (актуально для тех, кто
// зарегистрировался до введения этого требования).
function updateDiscordMissingIndicators() {
    const u = window.currentUser;
    const missing = !!u && (!u.discord_nick || !u.discord_id);
    const dot1 = document.getElementById('profile-discord-missing-dot');
    const dot2 = document.getElementById('profile-discord-missing-dot-m');
    if (dot1) dot1.style.display = missing ? '' : 'none';
    if (dot2) dot2.style.display = missing ? '' : 'none';
    const banner = document.getElementById('discord-missing-banner');
    if (banner) banner.style.display = missing ? '' : 'none';
}

// ─── ПЕРСОНАЛИЗАЦИЯ: ЦВЕТ АКЦЕНТА ──────────────
const ACCENT_COLORS = ['#00f5ff', '#a855f7', '#22c55e', '#fbbf24', '#ef4444', '#f472b6'];

function applyAccentColor(color, save = true) {
    document.documentElement.style.setProperty('--cyan', color);
    if (save) localStorage.setItem('nrp_accent', color);
    document.querySelectorAll('.accent-swatch').forEach(s => s.style.outline = (s.dataset.color === color) ? '2px solid #fff' : 'none');
}

window.pickAccentColor = function(color) { applyAccentColor(color); notify('Цвет темы изменён'); };

(function initAccent() {
    const saved = localStorage.getItem('nrp_accent');
    if (saved) applyAccentColor(saved, false);
})();

// ─── USERS TABLE ──────────────────────────────

const SEL = `background:#1e293b;border:1px solid var(--border);color:#fff;padding:5px 8px;border-radius:8px;font-size:12px;font-family:'Rajdhani',sans-serif;max-width:160px`;

function rankIndex(role) {
    const i = ADMIN_RANKS.indexOf(role);
    return i === -1 ? 0 : i;
}

// Кэш paролей в открытом виде на этот сеанс — только для строк, где показ разрешён
window._usersCache = {};

window.loadUsersTable = async function() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" style="padding:20px;text-align:center;color:var(--text)">Загрузка...</td></tr>`;
    const users = await db('users?order=username.asc');
    if (!Array.isArray(users) || !users.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="padding:20px;text-align:center;color:var(--text)">Нет пользователей</td></tr>`; return;
    }
    window._usersCache = {};
    users.forEach(u => window._usersCache[u.id] = u);
    const viewerRank = rankIndex(window.currentUser?.role);
    tbody.innerHTML = users.map(u => {
        const targetRank = rankIndex(u.role);
        const canManagePassword = viewerRank > targetRank;
        // Пароли хранятся как хэш и больше не показываются администрации в открытом виде —
        // вместо просмотра доступен безопасный сброс на новый временный пароль.
        const passwordCell = canManagePassword
            ? `<span style="font-size:12px;color:#64748b">🔒 Хэш</span>
               <button onclick="resetUserPassword(${u.id})" style="background:none;border:none;color:var(--cyan);cursor:pointer;font-size:11px;margin-left:6px;text-decoration:underline">Сбросить</button>`
            : `<span style="font-size:12px;color:#334155">🔒 Скрыто</span>`;
        return `<tr>
        <td style="padding:10px 14px;font-weight:600;color:#fff">${escHtml(u.username)}</td>
        <td style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#94a3b8">${escHtml(u.discord_id||'—')}</td>
        <td style="padding:10px 14px;white-space:nowrap">${passwordCell}</td>
        <td style="padding:10px 14px" id="discord-check-${u.id}"><button onclick="checkUserInDiscord(${u.id})" style="background:rgba(0,245,255,0.08);border:1px solid rgba(0,245,255,0.25);color:var(--cyan);padding:4px 10px;border-radius:8px;cursor:pointer;font-size:11px">Проверить</button></td>
        <td style="padding:10px 14px"><select onchange="changeRole(${u.id},this.value)" style="${SEL}">${ADMIN_RANKS.map(r=>`<option value="${r}" ${u.role===r?'selected':''}>${r}</option>`).join('')}</select></td>
        <td style="padding:10px 14px"><select onchange="changeFaction(${u.id},this.value)" style="${SEL}">${ALL_FACTIONS.map(f=>`<option value="${f==='—'?'':f}" ${(u.faction||'')===(f==='—'?'':f)?'selected':''}>${f}</option>`).join('')}</select></td>
        <td style="padding:10px 14px"><button onclick="deleteUser(${u.id})" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;padding:5px 12px;border-radius:8px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:600">Удалить</button></td>
    </tr>`;
    }).join('');
};

window.resetUserPassword = async function(id) {
    const u = window._usersCache[id];
    if (!u) return;
    if (!confirm(`Сбросить пароль пользователя «${u.username}» и сгенерировать новый временный пароль?`)) return;
    try {
        const res = await callSiteApi('resetPassword', { id });
        notify(`Новый временный пароль для ${u.username}: ${res.tempPassword} — сообщите его игроку лично, он не сохранится нигде ещё раз`);
    } catch (e) { notify('Не удалось сбросить пароль: ' + (e.message||'неизвестная ошибка'), false); }
};

// FIX 9: проверка присутствия игрока на Discord-сервере через ту же Edge Function,
// что выдаёт роли — с флагом checkOnly, чтобы не выдавать роль, а только проверить.
window.checkUserInDiscord = async function(id) {
    const cell = document.getElementById('discord-check-' + id);
    const u = window._usersCache[id];
    if (!cell || !u) return;
    if (!u.discord_id) { cell.innerHTML = '<span style="color:#f87171;font-size:11px">Нет юзернейма</span>'; return; }
    cell.innerHTML = '<span style="color:var(--text);font-size:11px">Проверка...</span>';
    try {
        const res = await fetch(SUPABASE_URL + '/functions/v1/assign-discord-role', {
            method: 'POST',
            headers: H,
            body: JSON.stringify({ discordUsername: u.discord_id, checkOnly: true })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.found) {
            cell.innerHTML = '<span style="color:#4ade80;font-size:11px">✅ Есть на сервере</span>';
        } else {
            cell.innerHTML = `<span style="color:#f87171;font-size:11px" title="${escHtml(data.error||'')}">❌ Не найден</span> <button onclick="prefillDiscordFixRequest('${escHtml(u.username)}')" style="margin-left:6px;background:none;border:none;color:var(--cyan);cursor:pointer;font-size:11px;text-decoration:underline">Запросить исправление</button>`;
        }
    } catch(e) {
        cell.innerHTML = '<span style="color:#f87171;font-size:11px">Ошибка проверки</span>';
    }
};

window.prefillDiscordFixRequest = function(username) {
    const el = document.getElementById('discord-req-username');
    if (el) el.value = username;
    document.getElementById('admin-discord-request-panel')?.scrollIntoView({ behavior:'smooth', block:'center' });
};

window.changeRole = async function(id, role) {
    try {
        await callSiteApi('changeRole', { id, role });
        if (window.currentUser && window.currentUser.id === id) { window.currentUser.role = role; localStorage.setItem('nrp_user', JSON.stringify(window.currentUser)); updateAuthZone(); }
        notify('Роль обновлена');
    } catch (e) { notify('Не удалось обновить роль: ' + (e.message||'неизвестная ошибка'), false); }
};

window.changeFaction = async function(id, faction) {
    try {
        await callSiteApi('changeFaction', { id, faction });
        if (window.currentUser && window.currentUser.id === id) { window.currentUser.faction = faction; localStorage.setItem('nrp_user', JSON.stringify(window.currentUser)); updateAuthZone(); }
        notify('Фракция обновлена');
    } catch (e) { notify('Не удалось обновить фракцию: ' + (e.message||'неизвестная ошибка'), false); }
};

window.deleteUser = async function(id) {
    if (!confirm('Удалить пользователя?')) return;
    try {
        await callSiteApi('deleteUser', { id });
        notify('Пользователь удалён'); loadUsersTable();
    } catch (e) { notify('Не удалось удалить: ' + (e.message||'неизвестная ошибка'), false); }
};

// ─── УПРАВЛЕНИЕ ОПГ / МАФИЕЙ (удаление банд) ──
// Требуется таблица criminal_gangs (уже используется). Нужна лишь возможность DELETE для anon-ключа (см. SQL).

window.loadAdminGangs = async function() {
    const el = document.getElementById('admin-gangs-list');
    if (!el || !isAdmin(window.currentUser)) return;
    el.innerHTML = '<div class="loading-text" style="opacity:0.5">Загрузка...</div>';
    try {
        const gangs = await db('criminal_gangs?status=eq.active&order=type.asc,created_at.asc');
        if (!Array.isArray(gangs) || !gangs.length) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Нет активных ОПГ/Мафий</div>'; return; }
        el.innerHTML = gangs.map(g => `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;background:#0d1117;border:1px solid var(--border);border-radius:12px;padding:12px 16px;margin-bottom:8px">
            <div><span style="font-size:13px;color:var(--cyan);font-family:'JetBrains Mono',monospace;text-transform:uppercase">${g.type==='mafia'?'🤵 Мафия':'💀 ОПГ'}</span><div style="font-weight:700;color:#fff;font-size:15px">${escHtml(g.name)} ${g.tag?`<span style="font-size:11px;color:var(--cyan)">[${escHtml(g.tag)}]</span>`:''}</div><div style="color:var(--text);font-size:12px">Основатель: ${escHtml(g.founder||'—')}</div></div>
            <button onclick="deleteGang(${g.id})" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:7px 14px;border-radius:8px;cursor:pointer;white-space:nowrap">🗑 Расформировать</button>
        </div>`).join('');
    } catch(e) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Ошибка загрузки</div>'; }
};

window.deleteGang = async function(id) {
    if (!confirm('Расформировать эту организацию? Действие необратимо.')) return;
    try {
        await db(`criminal_gangs?id=eq.${id}`, { method:'DELETE' });
        notify('Организация расформирована');
    } catch(e) { notify('Ошибка удаления — проверьте права DELETE в Supabase', false); }
    loadAdminGangs();
    loadCriminalCounters();
};

// ─── УПРАВЛЕНИЕ СОСТАВОМ АДМИНИСТРАЦИИ (вкладка «Команда») ──
// Требуется таблица team_members в Supabase — см. SQL-скрипт.

const TEAM_STATUS_LABELS = {
    active:    { label: 'На месте',        color: '#22c55e', emoji: '🟢' },
    vacation:  { label: 'В отпуске',       color: '#38bdf8', emoji: '🏖' },
    absent:    { label: 'Отсутствует',     color: '#fbbf24', emoji: '⏸' },
    busy:      { label: 'Занят(а)',        color: '#a855f7', emoji: '⏳' },
    sick:      { label: 'На больничном',   color: '#f472b6', emoji: '🤒' },
    training:  { label: 'На стажировке',   color: '#0ea5e9', emoji: '🎓' },
    trial:     { label: 'Испытательный срок', color: '#eab308', emoji: '🧪' },
    suspended: { label: 'Временно отстранён(а)', color: '#f87171', emoji: '⛔' },
};

function teamStatusBadge(m) {
    const s = TEAM_STATUS_LABELS[m.status] || TEAM_STATUS_LABELS.active;
    if (m.status === 'active') return '';
    let range = '';
    if (m.status_until) range = ` до ${new Date(m.status_until).toLocaleDateString('ru-RU')}`;
    const note = m.status_note ? `: ${escHtml(m.status_note)}` : range;
    return `<span style="font-size:11px;background:${s.color}22;color:${s.color};border:1px solid ${s.color}55;padding:2px 8px;border-radius:6px;margin-left:6px;font-family:'JetBrains Mono',monospace;vertical-align:middle">${s.emoji} ${s.label}${note}</span>`;
}

window.loadTeamPublic = async function() {
    const el = document.getElementById('team-list');
    if (!el) return;
    el.innerHTML = '<div class="loading-text" style="opacity:0.5">Загрузка состава администрации...</div>';
    try {
        const members = await db('team_members?order=sort_order.asc,created_at.asc');
        if (!Array.isArray(members) || !members.length) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Состав администрации пока не заполнен</div>'; return; }
        el.innerHTML = members.map(m => {
            const color = m.color || '#00f5ff';
            const avatar = m.roblox_id ? `<img src="https://www.roblox.com/headshot-thumbnail/image?userId=${encodeURIComponent(m.roblox_id)}&width=100&height=100&format=png" style="width:60px;height:60px;border-radius:14px;border:2px solid ${color}66;object-fit:cover" onerror="this.style.display='none'">` : `<div style="width:60px;height:60px;border-radius:14px;border:2px solid ${color}66;background:${color}22;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:22px;color:${color}">${escHtml((m.name||'?').charAt(0).toUpperCase())}</div>`;
            const link = m.roblox_id ? `<a href="https://www.roblox.com/users/${encodeURIComponent(m.roblox_id)}/profile" target="_blank" style="background:${color}1a;border:1px solid ${color}55;color:${color};font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;letter-spacing:1px;padding:7px 14px;border-radius:9px;text-decoration:none;white-space:nowrap">Roblox →</a>` : '';
            return `<div style="background:var(--card);border:1px solid ${color}40;border-radius:18px;padding:20px;display:flex;align-items:center;gap:16px;${m.status!=='active'?'opacity:0.85':''}">${avatar}<div style="flex:1;min-width:0"><div style="font-family:'Bebas Neue',sans-serif;font-size:11px;letter-spacing:2px;color:${color};margin-bottom:3px">${escHtml((m.role_title||'').toUpperCase())}</div><div style="font-size:18px;font-weight:700;color:#fff">${escHtml(m.name||'')} ${teamStatusBadge(m)}</div></div>${link}</div>`;
        }).join('');
    } catch(e) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Не удалось загрузить состав команды — проверьте таблицу team_members в Supabase</div>'; }
};

window.loadAdminTeamManage = async function() {
    const el = document.getElementById('admin-team-list');
    if (!el || !isAdmin(window.currentUser)) return;
    el.innerHTML = '<div class="loading-text" style="opacity:0.5">Загрузка...</div>';
    try {
        const members = await db('team_members?order=sort_order.asc,created_at.asc');
        if (!Array.isArray(members) || !members.length) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Пока никого не добавили</div>'; return; }
        el.innerHTML = members.map(m => `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;background:#0d1117;border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:8px">
            <div style="flex:1;min-width:140px"><div style="font-weight:700;color:#fff;font-size:14px">${escHtml(m.name)}</div><div style="color:var(--text);font-size:12px">${escHtml(m.role_title||'')}</div></div>
            <select onchange="updateTeamMemberStatus(${m.id}, this.value)" style="${SEL}">
                <option value="active" ${m.status==='active'?'selected':''}>🟢 На месте</option>
                <option value="vacation" ${m.status==='vacation'?'selected':''}>🏖 В отпуске</option>
                <option value="absent" ${m.status==='absent'?'selected':''}>⏸ Отсутствует</option>
                <option value="busy" ${m.status==='busy'?'selected':''}>⏳ Занят(а)</option>
                <option value="sick" ${m.status==='sick'?'selected':''}>🤒 На больничном</option>
                <option value="training" ${m.status==='training'?'selected':''}>🎓 На стажировке</option>
                <option value="trial" ${m.status==='trial'?'selected':''}>🧪 Испытательный срок</option>
                <option value="suspended" ${m.status==='suspended'?'selected':''}>⛔ Временно отстранён(а)</option>
            </select>
            <button onclick="deleteTeamMember(${m.id})" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 12px;border-radius:8px;cursor:pointer">🗑 Убрать</button>
        </div>`).join('');
    } catch(e) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Ошибка загрузки — проверьте таблицу team_members</div>'; }
};

window.addTeamMember = async function() {
    if (!isAdmin(window.currentUser)) return notify('Нет доступа', false);
    const name  = document.getElementById('team-add-name')?.value.trim();
    const role  = document.getElementById('team-add-role')?.value.trim();
    const rid   = document.getElementById('team-add-roblox')?.value.trim();
    const color = document.getElementById('team-add-color')?.value || '#00f5ff';
    if (!name || !role) return notify('Укажите ник и должность', false);
    try {
        await db('team_members', { method:'POST', body: JSON.stringify({ name, role_title: role, roblox_id: rid || null, color, status:'active', sort_order: 100 }) });
        notify('Сотрудник добавлен в состав');
        ['team-add-name','team-add-role','team-add-roblox'].forEach(id => { const e = document.getElementById(id); if (e) e.value=''; });
        loadAdminTeamManage(); loadTeamPublic();
    } catch(e) { notify('Ошибка — проверьте таблицу team_members в Supabase', false); }
};

window.updateTeamMemberStatus = async function(id, status) {
    let status_note = null, status_until = null;
    if (status === 'vacation' || status === 'absent') {
        status_note = prompt('Комментарий к статусу (необязательно, например "13.07 – 21.07"):', '') || null;
    }
    try {
        await db(`team_members?id=eq.${id}`, { method:'PATCH', body: JSON.stringify({ status, status_note, status_until }) });
        notify('Статус обновлён');
    } catch(e) { notify('Ошибка обновления статуса', false); }
    loadAdminTeamManage(); loadTeamPublic();
};

window.deleteTeamMember = async function(id) {
    if (!confirm('Убрать сотрудника из состава команды?')) return;
    try {
        await db(`team_members?id=eq.${id}`, { method:'DELETE' });
        notify('Сотрудник убран из состава');
    } catch(e) { notify('Ошибка удаления', false); }
    loadAdminTeamManage(); loadTeamPublic();
};

// ─── OWNER PANEL ──────────────────────────────

function showOwnerPanelIfNeeded() {
    const panel = document.getElementById('owner-panel');
    if (!panel) return;
    if (isOwner(window.currentUser)) {
        panel.style.display = '';
        syncOwnerCheckboxes();
    } else {
        panel.style.display = 'none';
    }
    if (isAdmin(window.currentUser)) {
        loadAdminTeamManage();
        loadAdminGangs();
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
    // Сохраняем tabs/services/registration_open, но не затираем банер, который мог сохранить админ отдельно
    const flags = Object.assign({}, window.siteFlags, { tabs, services, registration_open });
    window.siteFlags = flags;
    try {
        await callSiteApi('saveOwnerSettings', { flags });
    } catch(e) { console.warn('saveOwnerSettings error', e); notify('Не удалось сохранить настройки: ' + (e.message||'неизвестная ошибка'), false); }
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
    try {
        await callSiteApi('renameUser', { current: cur, next });
        if (window.currentUser && window.currentUser.username === cur) {
            window.currentUser.username = next;
            localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
            updateAuthZone();
        }
        curEl.value = ''; newEl.value = '';
        notify(`Никнейм изменён: ${cur} → ${next}`);
        loadUsersTable();
    } catch (e) { notify('Не удалось переименовать: ' + (e.message||'неизвестная ошибка'), false); }
};

// FIX: удаление документов больше не привязано к срокам действия — сроки отменены полностью.

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

window.sendDiscordFixRequest = async function() {
    if (!isAdmin(window.currentUser)) return notify('Нет доступа', false);
    const uEl = document.getElementById('discord-req-username');
    const fEl = document.getElementById('discord-req-field');
    const mEl = document.getElementById('discord-req-message');
    const username = uEl?.value.trim();
    const field = fEl?.value || 'username';
    const fieldLabel = field === 'nick' ? 'Discord Никнейм' : 'Discord Юзернейм';
    const comment = mEl?.value.trim();
    if (!username) return notify('Введите ник игрока на сайте', false);
    const users = await db(`users?username=eq.${encodeURIComponent(username)}`);
    if (!Array.isArray(users) || !users.length) return notify('Пользователь не найден', false);
    const text = `Администрация не может найти вас в Discord. Пожалуйста, проверьте и исправьте: ${fieldLabel}.` + (comment ? ` Комментарий: ${comment}` : '');
    try {
        const res = await db('notifications', { method:'POST', body: JSON.stringify({ user_id: users[0].id, type:'discord_fix_request', text, field, read:false }) });
        const failed = !res || !Array.isArray(res) || !res.length || res.code || res.message;
        if (failed) { console.warn('sendDiscordFixRequest failed', res); return notify('Не удалось отправить: проверьте таблицу notifications в Supabase', false); }
        notify('Запрос отправлен игроку ' + username);
        if (uEl) uEl.value = ''; if (mEl) mEl.value = '';
    } catch(e) { console.warn('sendDiscordFixRequest error', e); notify('Ошибка отправки', false); }
};

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
        // FIX: PostgREST не возвращает { error: ... } — при ошибке ответ выглядит как
        // { message, code, details, hint } и НЕ является массивом. Раньше это ложно
        // считалось успехом, из-за чего уведомление «не приходило» на другой аккаунт.
        const failed = !res || !Array.isArray(res) || !res.length || res.code || res.message;
        if (failed) {
            console.warn('sendRenameRequest insert failed', res);
            return notify('Не удалось отправить: таблица notifications недоступна (проверьте SQL/RLS в Supabase)', false);
        }
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
    if (n.type === 'discord_fix_request') {
        const isNick = n.field === 'nick';
        return `<div class="profile-card" style="border-color:rgba(248,113,113,0.35);background:rgba(248,113,113,0.05)">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:20px">🛠️</span><div style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:1px;color:#f87171">Проверьте ваши Discord-данные</div></div>
            <div style="color:var(--text);font-size:14px;margin-bottom:14px;line-height:1.6">${escHtml(n.text||'')}</div>
            <div class="form-group"><input type="text" id="notif-discord-${n.id}" placeholder="${isNick ? 'Правильный Discord Никнейм' : 'Правильный Discord Юзернейм'}" class="form-input"></div>
            <button class="form-submit" onclick="respondDiscordFixRequest(${n.id}, '${isNick ? 'nick' : 'username'}')">Сохранить исправление</button>
        </div>`;
    }
    return `<div class="profile-card"><div style="color:var(--text);font-size:14px;line-height:1.6">${escHtml(n.text||'')}</div><button onclick="dismissNotification(${n.id})" style="margin-top:10px;background:none;border:none;color:var(--cyan);font-size:12px;cursor:pointer;letter-spacing:1px">ПОНЯТНО, СКРЫТЬ</button></div>`;
}

window.respondDiscordFixRequest = async function(notifId, field) {
    const input = document.getElementById('notif-discord-' + notifId);
    const next = input?.value.trim().replace(/^@/, '');
    if (!next) return notify('Введите значение', false);
    const patch = field === 'nick' ? { discord_nick: next } : { discord_id: next };
    try {
        await callSiteApi('updateOwnProfile', patch);
        Object.assign(window.currentUser, patch);
        localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
        await db(`notifications?id=eq.${notifId}`, { method:'PATCH', body: JSON.stringify({ read:true }) }).catch(()=>{});
        renderProfile();
        updateDiscordMissingIndicators();
        notify('Данные обновлены, спасибо!');
    } catch (e) { notify('Не удалось сохранить: ' + (e.message||'неизвестная ошибка'), false); }
};

window.respondRenameRequest = async function(notifId) {
    const input = document.getElementById('notif-rename-' + notifId);
    const next = input?.value.trim();
    if (!next) return notify('Введите новый никнейм', false);
    try {
        await callSiteApi('updateOwnProfile', { username: next });
        window.currentUser.username = next;
        localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
        await db(`notifications?id=eq.${notifId}`, { method:'PATCH', body: JSON.stringify({ read:true }) }).catch(()=>{});
        updateAuthZone();
        notify('Никнейм изменён на ' + next);
        renderProfile();
    } catch (e) { notify('Не удалось сохранить: ' + (e.message||'неизвестная ошибка'), false); }
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
    try {
        await callSiteApi('createNews', { title, tag, custom_tag: tag === 'Свой Вариант' ? (customTag || 'Свой вариант') : null, text, image_url: imageUrl });
        document.getElementById('news-title').value = '';
        document.getElementById('news-text').value  = '';
        if (document.getElementById('news-image-url'))  document.getElementById('news-image-url').value = '';
        if (document.getElementById('news-custom-tag')) document.getElementById('news-custom-tag').value = '';
        const preview = document.getElementById('news-img-preview');
        if (preview) preview.style.display = 'none';
        notify('Новость опубликована'); loadNews();
    } catch (e) { notify('Не удалось опубликовать: ' + (e.message||'неизвестная ошибка'), false); }
};

window.deleteNews = async function(id) {
    if (!confirm('Удалить новость?')) return;
    try {
        await callSiteApi('deleteNews', { id });
        notify('Удалено'); loadNews();
    } catch (e) { notify('Не удалось удалить: ' + (e.message||'неизвестная ошибка'), false); }
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
        // чекбоксы оружия лежат в #weapons-checkboxes — читаем отмеченные чекбоксы
        const wpnBox = document.getElementById('weapons-checkboxes');
        const wpn = wpnBox ? Array.from(wpnBox.querySelectorAll('input[type=checkbox]:checked')).map(o => o.value).join(', ') : '';
        if (!u||!n||!job||!rsn||!wpn) return notify('Заполните поля и отметьте хотя бы один вид оружия', false);
        data = { type:'license', username:u, char_name:n, dob, address:job, faction:fac, reason:rsn, weapon_type:wpn, note:sgn, status:'pending', user_id:window.currentUser?.id };
    } else if (type === 'driving-license') {
        const u=document.getElementById('dl-username').value.trim(), n=document.getElementById('dl-name').value.trim(), dob=document.getElementById('dl-dob').value, job=document.getElementById('dl-job').value.trim(), rsn=document.getElementById('dl-reason').value.trim(), sgn=document.getElementById('dl-sign').value.trim();
        const catBox = document.getElementById('dl-categories');
        const cats = catBox ? Array.from(catBox.querySelectorAll('input[type=checkbox]:checked')).map(o => o.value).join(', ') : '';
        if (!u||!n||!dob||!job||!rsn||!cats) return notify('Заполните поля и отметьте хотя бы одну категорию прав', false);
        data = { type:'driving_license', username:u, char_name:n, dob, address:job, reason:rsn, weapon_type:cats, note:sgn, status:'pending', user_id:window.currentUser?.id };
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
    setModalBusy(type, true);
    try {
        const res = await db('requests', { method:'POST', body: JSON.stringify(data) });
        if (!res || !res[0]) throw new Error('Сервер не подтвердил сохранение заявки');
        closeModal(type);
        notify('Заявка отправлена! Ожидайте рассмотрения.');
    } catch (e) {
        notify('Не удалось отправить заявку: ' + (e.message || 'неизвестная ошибка'), false);
    } finally {
        setModalBusy(type, false);
    }
};

// ─── MY DOCS ──────────────────────────────────
// FIX: сроки действия документов (паспорт/мед.книжка/лицензия) полностью отменены —
// все одобренные документы действуют бессрочно, без функций продления/просрочки.

window.loadMyDocs = async function() {
    const guestDiv = document.getElementById('mydocs-guest');
    const listDiv  = document.getElementById('mydocs-list');
    if (!window.currentUser) { if (guestDiv) guestDiv.style.display = ''; if (listDiv) listDiv.innerHTML = ''; return; }
    if (guestDiv) guestDiv.style.display = 'none';
    if (!listDiv) return;
    listDiv.innerHTML = '<div class="loading-text">Загрузка...</div>';
    const reqs = await db(`requests?user_id=eq.${window.currentUser.id}&order=created_at.desc`);
    if (!Array.isArray(reqs) || !reqs.length) { listDiv.innerHTML = '<div class="loading-text" style="opacity:0.5">У вас нет заявок</div>'; return; }
    const typeLabels = { passport:'🪪 Паспорт', medbook:'🏥 Мед. книжка', license:'🔫 Лицензия', driving_license:'🚗 Права на вождение', faction_join:'🏛️ Вступление во фракцию', court:'⚖️ Судебный иск', government:'📋 Обращение в правительство', lawyer:'👨‍⚖️ Адвокат', opg_create:'💀 Создание ОПГ', opg_join:'💀 Вступление в ОПГ', mafia_create:'🤵 Создание Мафии', mafia_join:'🤵 Вступление в Мафию' };
    const typeIcons  = { passport:'🪪', medbook:'🏥', license:'🔫', driving_license:'🚗', faction_join:'🏛️', court:'⚖️', government:'📋', lawyer:'👨‍⚖️', opg_create:'💀', opg_join:'💀', mafia_create:'🤵', mafia_join:'🤵' };
    const canM = canManageDocs(window.currentUser);
    listDiv.innerHTML = reqs.map(r => {
        const sb  = r.status==='approved' ? '<span class="badge badge-approved">✓ Одобрено</span>' : r.status==='rejected' ? '<span class="badge badge-rejected">✕ Отклонено</span>' : '<span class="badge badge-pending">⏳ На рассмотрении</span>';
        const date = r.created_at ? new Date(r.created_at).toLocaleDateString('ru-RU') : '';
        const btns = canM ? `<div style="display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)"><button onclick="deleteRequest(${r.id},'mydocs')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer">🗑 Удалить</button></div>` : '';
        return `<div class="doc-card" style="flex-direction:column;align-items:stretch;gap:0"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div style="display:flex;align-items:center;gap:14px"><div class="doc-icon">${typeIcons[r.type]||'📄'}</div><div><div style="font-weight:700;color:#fff;font-size:16px">${typeLabels[r.type]||r.type}</div><div style="color:var(--text);font-size:13px;margin-top:2px">${date} • ${escHtml(r.char_name||r.username||'')}</div></div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">${sb}</div></div>${btns}</div>`;
    }).join('');
};

window.deleteRequest = async function(id, section) {
    if (!confirm('Удалить этот документ?')) return;
    try {
        await callSiteApi('deleteRequest', { id });
        notify('Документ удалён');
        if (section==='passports') loadPassports(); else loadMyDocs();
    } catch (e) { notify('Не удалось удалить: ' + (e.message||'неизвестная ошибка'), false); }
};

// ─── ADMIN REQUESTS ───────────────────────────

const REQUEST_TYPE_NAMES = { passport:'🪪 Паспорт', medbook:'🏥 Мед. книжка', license:'🔫 Лицензия', driving_license:'🚗 Права на вождение', faction_join:'🏛️ Вступление во фракцию', court:'⚖️ Судебный иск', government:'📋 Правительство', lawyer:'👨‍⚖️ Адвокат', opg_create:'💀 Создание ОПГ', opg_join:'💀 Вступление в ОПГ', mafia_create:'🤵 Создание Мафии', mafia_join:'🤵 Вступление в Мафию' };

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
        return `<div class="request-card"><div class="request-type">${REQUEST_TYPE_NAMES[r.type]||r.type} • ${date}</div><div class="request-player">${escHtml(r.username||'—')}</div><div class="request-data">${details}</div><div class="request-actions"><button class="btn-approve" onclick="reviewRequest(${r.id},'approved')">✓ Одобрить</button><button class="btn-reject" onclick="reviewRequest(${r.id},'rejected')">✕ Отклонить</button></div></div>`;
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
    let res;
    try {
        res = await callSiteApi('reviewRequest', { id, status });
    } catch (e) { return notify('Не удалось обработать заявку: ' + (e.message||'неизвестная ошибка'), false); }
    const req = res.request;
    if (status === 'approved' && res.discordId && res.newFaction) {
        await assignDiscordRole(res.discordId, res.newFaction, res.oldFaction || null);
        if (window.currentUser && window.currentUser.id === req.user_id) {
            window.currentUser.faction = res.newFaction;
            localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
            updateAuthZone();
        }
    }
    const webhook = WEBHOOK_BY_TYPE[req.type] || WEBHOOK_PASSPORT_LICENSE;
    const typeNames = { passport:'🪪 Паспорт', medbook:'🏥 Мед. книжка', license:'🔫 Лицензия', driving_license:'🚗 Права на вождение', faction_join:'🏛️ Вступление во фракцию', court:'⚖️ Судебный иск', government:'📋 Правительство', lawyer:'👨‍⚖️ Адвокат', opg_create:'💀 Создание ОПГ', opg_join:'💀 Вступление в ОПГ', mafia_create:'🤵 Создание Мафии', mafia_join:'🤵 Вступление в Мафию' };
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

// Если название фракции на сайте отличается от точного названия роли в Discord — впишите соответствие сюда.
// Ключ — как фракция называется на сайте, значение — как называется роль в Discord (регистр не важен).
// Если фракция не указана в списке, бот попробует найти роль с точно таким же именем, как на сайте.
const DISCORD_ROLE_NAME_MAP = {
    // 'Патрульная Полиция (ДПС)': 'ДПС',
};

async function assignDiscordRole(discordUsername, factionValue, oldFactionValue) {
    if (!discordUsername || !factionValue) return;
    const roleName = DISCORD_ROLE_NAME_MAP[factionValue] || factionValue;
    const oldRoleName = oldFactionValue ? (DISCORD_ROLE_NAME_MAP[oldFactionValue] || oldFactionValue) : null;
    try {
        const res = await fetch(SUPABASE_URL + '/functions/v1/assign-discord-role', {
            method: 'POST',
            headers: H,
            body: JSON.stringify({ discordUsername, roleName, oldRoleName })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            console.warn('assignDiscordRole: не удалось выдать роль в Discord', data);
            notify('Заявка одобрена, но роль в Discord не выдалась: ' + (data.error || res.status), false);
        }
    } catch (e) {
        console.warn('assignDiscordRole error', e);
    }
}

// FIX 6: При одобрении заявки на вступление во фракцию/ОПГ/Мафию — фракция сразу
// проставляется пользователю на сайте (аналогично ручному изменению в таблице пользователей).
// Если у игрока указан ник Discord в профиле — сайт просит бота снять старую роль фракции
// (если она была) и выдать новую.
// applyApprovalSideEffects была перенесена в Edge Function actionReviewRequest
// (изменение фракции пользователя теперь происходит на сервере, а не из браузера).

// ─── DOCUMENTS VIEWER ─────────────────────────

function renderDocCard(r, fields, icon, section) {
    const statusBadge = '<span class="badge badge-approved">✓ Действителен (бессрочно)</span>';
    const canM = canManageDocs(window.currentUser);
    const btns = canM ? `<div style="display:flex;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)"><button onclick="deleteRequest(${r.id},'${section}')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer">🗑 Удалить</button></div>` : '';
    return `<div class="doc-card" style="flex-direction:column;align-items:stretch;gap:0"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px"><div style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;color:#fff">${icon} ${escHtml(r.char_name||r.username)}</div><div style="text-align:right">${statusBadge}</div></div><div style="color:var(--text);font-size:14px;line-height:1.9;margin-top:12px;border-top:1px solid var(--border);padding-top:12px">${fields}</div>${btns}</div>`;
}

window._passportsCache = { passports: [], licenses: [], drivingLicenses: [], medbooks: [] };

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
    const [passports, licenses, drivingLicenses, medbooks] = await Promise.all([
        canSeeAll ? db('requests?type=eq.passport&status=eq.approved&order=created_at.desc') : Promise.resolve([]),
        canSeeAll ? db('requests?type=eq.license&status=eq.approved&order=created_at.desc') : Promise.resolve([]),
        canSeeAll ? db('requests?type=eq.driving_license&status=eq.approved&order=created_at.desc') : Promise.resolve([]),
        (canSeeAll || canMedbok) ? db('requests?type=eq.medbook&status=eq.approved&order=created_at.desc') : Promise.resolve([]),
    ]);
    window._passportsCache = {
        passports: Array.isArray(passports) ? passports : [],
        licenses:  Array.isArray(licenses)  ? licenses  : [],
        drivingLicenses: Array.isArray(drivingLicenses) ? drivingLicenses : [],
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
    const { passports, licenses, drivingLicenses, medbooks } = window._passportsCache;
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
    if (canSeeAll && (filterType === 'all' || filterType === 'driving_license')) {
        const list = drivingLicenses.filter(matchQ);
        total += list.length;
        html += `<div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:3px;color:#fff;margin-bottom:16px">🚗 Права на вождение</div>`;
        html += !list.length ? '<div class="loading-text" style="opacity:0.5;margin-bottom:32px">Ничего не найдено</div>' : '<div style="display:grid;gap:12px;margin-bottom:40px">' + list.map(r=>renderDocCard(r,`<b>👤 Игрок:</b> ${escHtml(r.username)}<br><b>📛 ФИО:</b> ${escHtml(r.char_name||'—')}<br><b>🎂 Дата рождения:</b> ${r.dob||'—'}<br><b>💼 Место работы:</b> ${escHtml(r.address||'—')}<br><b>🚗 Категории:</b> ${escHtml(r.weapon_type||'—')}`,'🚗','passports')).join('') + '</div>';
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
    loadTeamPublic();
    loadSiteSettings();

    document.getElementById('login-password')?.addEventListener('keydown', e => { if(e.key==='Enter') handleLogin(); });
    document.getElementById('reg-password2')?.addEventListener('keydown',  e => { if(e.key==='Enter') handleRegister(); });

    if (location.hash) readHash();
});
window._updateCountdownInterval = null;
function startUpdateCountdown(targetIso) {
    if (window._updateCountdownInterval) { clearInterval(window._updateCountdownInterval); window._updateCountdownInterval = null; }
    const targetDate = new Date(targetIso || "2026-07-10T21:00:00+03:00").getTime();
    const timerElement = document.getElementById("countdown-timer");
    if (!timerElement) return;

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(interval);
            window._updateCountdownInterval = null;
            timerElement.innerHTML = "ОБНОВЛЕНИЕ ВЫШЛО! 🔥";
            timerElement.style.color = "#4ade80";
            timerElement.style.textShadow = "0 0 12px rgba(74, 222, 128, 0.5)";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let timerText = "";
        if (days > 0) timerText += `${days}д `;
        
        // Добавляем нули перед цифрами для красоты (например, 09ч 05м 02с)
        const formatNum = (num) => num < 10 ? '0' + num : num;
        
        timerText += `${formatNum(hours)}ч ${formatNum(minutes)}м ${formatNum(seconds)}с`;

        timerElement.innerHTML = timerText;
    }, 1000);
    window._updateCountdownInterval = interval;
}
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

// Сроки действия документов и оплата за их оформление отменены по решению администрации.
const OPG_MAX   = 2;
const MAFIA_MAX = 1;

window.currentUser = JSON.parse(localStorage.getItem('nrp_user') || 'null');

// ─── БЕЗОПАСНОСТЬ ПАРОЛЕЙ ─────────────────────
// Пароли больше не хранятся в открытом виде. Для каждого пароля генерируется
// случайная соль, и в базу пишется "соль$хэш" (SHA-256). Логин сравнивает хэши,
// а не сами пароли. Это не полноценный серверный bcrypt (сайт работает без
// собственного бэкенда, напрямую с Supabase), но пароли пользователей больше
// не читаются напрямую из базы — это уже совсем другой уровень защиты.
function randomSaltHex(len = 16) {
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPasswordForStorage(plain) {
    const salt = randomSaltHex();
    const hash = await sha256Hex(salt + ':' + plain);
    return salt + '$' + hash;
}

// Возвращает { ok, needsMigration } — needsMigration=true, если пароль в базе
// был ещё в старом (незащищённом) виде и его стоит перезаписать хэшем.
async function verifyStoredPassword(plain, stored) {
    if (!stored) return { ok: false, needsMigration: false };
    if (stored.includes('$')) {
        const [salt, hash] = stored.split('$');
        const check = await sha256Hex(salt + ':' + plain);
        return { ok: check === hash, needsMigration: false };
    }
    // Легаси: пароль хранился как обычный текст — сравниваем напрямую и помечаем на миграцию
    return { ok: stored === plain, needsMigration: stored === plain };
}

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
    registration_open: true,
    banner: {
        active: true,
        label: 'ОБНОВЛЕНИЕ',
        version: 'Версия V3.15',
        infoLabel: 'ЧТО НОВОГО',
        info: 'Ювелирный магазин & Дальнобойщики',
        timerLabel: 'ДО ВЫХОДА',
        timerTarget: '2026-07-10T21:00:00+03:00'
    },
    // FIX 7: метаданные фракций (цвет / категория / статус "скоро"), редактируемые в панели владельца
    factionMeta: {}
};
window.siteFlags = DEFAULT_SITE_FLAGS;

const FACTION_CATEGORY_LABELS = { government:'ГОСУДАРСТВЕННАЯ', criminal:'КРИМИНАЛЬНАЯ', other:'ИНОЕ' };
const FACTION_CATEGORY_COLORS = { government:'#3b82f6', criminal:'#f87171', other:'#a855f7' };

async function loadSiteSettings() {
    try {
        const rows = await db('site_settings?key=eq.site_flags&select=value');
        if (Array.isArray(rows) && rows[0] && rows[0].value) {
            const flags = rows[0].value;
            window.siteFlags = Object.assign({}, DEFAULT_SITE_FLAGS, flags, {
                tabs: Object.assign({}, DEFAULT_SITE_FLAGS.tabs, flags.tabs || {}),
                services: Object.assign({}, DEFAULT_SITE_FLAGS.services, flags.services || {}),
                banner: Object.assign({}, DEFAULT_SITE_FLAGS.banner, flags.banner || {}),
                factionMeta: Object.assign({}, DEFAULT_SITE_FLAGS.factionMeta, flags.factionMeta || {})
            });
        } else {
            await db('site_settings', { method:'POST', body: JSON.stringify({ key:'site_flags', value: DEFAULT_SITE_FLAGS }) }).catch(()=>{});
        }
    } catch(e) { console.warn('site_settings load error', e); }
    applySiteFlags();
    renderUpdateBanner();
    fillBannerAdminForm();
    applyFactionMeta();
    loadFactionManager();
}

// ─── БАННЕР ОБНОВЛЕНИЙ (редактируется админами из профиля) ──
function renderUpdateBanner() {
    const b = (window.siteFlags && window.siteFlags.banner) || DEFAULT_SITE_FLAGS.banner;
    const container = document.getElementById('site-banner');
    if (!container) return;
    container.style.display = b.active === false ? 'none' : '';
    const elLabel = document.getElementById('banner-version-label');
    const elValue = document.getElementById('banner-version-value');
    const elInfoLabel = document.getElementById('banner-info-label');
    const elInfo = document.getElementById('banner-info-value');
    const elTimerLabel = document.getElementById('banner-timer-label');
    if (elLabel) elLabel.textContent = b.label || DEFAULT_SITE_FLAGS.banner.label;
    if (elValue) elValue.textContent = b.version || DEFAULT_SITE_FLAGS.banner.version;
    if (elInfoLabel) elInfoLabel.textContent = b.infoLabel || DEFAULT_SITE_FLAGS.banner.infoLabel;
    if (elInfo) elInfo.textContent = b.info || DEFAULT_SITE_FLAGS.banner.info;
    if (elTimerLabel) elTimerLabel.textContent = b.timerLabel || DEFAULT_SITE_FLAGS.banner.timerLabel;
    startUpdateCountdown(b.timerTarget || DEFAULT_SITE_FLAGS.banner.timerTarget);

    // Иконки блоков (необязательные — можно поменять эмодзи в каждом блоке)
    const icon1 = document.getElementById('banner-icon-1'); if (icon1) icon1.textContent = b.icon1 || '🚀';
    const icon2 = document.getElementById('banner-icon-2'); if (icon2) icon2.textContent = b.icon2 || '💎';
    const icon3 = document.getElementById('banner-icon-3'); if (icon3) icon3.textContent = b.icon3 || '⏳';

    // Показ/скрытие отдельных блоков баннера
    const s1 = document.getElementById('banner-section-1'); if (s1) s1.style.display = b.showSection1 === false ? 'none' : '';
    const s2 = document.getElementById('banner-section-2'); if (s2) s2.style.display = b.showSection2 === false ? 'none' : '';
    const s3 = document.getElementById('banner-section-3'); if (s3) s3.style.display = b.showSection3 === false ? 'none' : '';
    const d1 = document.getElementById('banner-divider-1'); if (d1) d1.style.display = b.showSection1 === false ? 'none' : '';
    const d2 = document.getElementById('banner-divider-2'); if (d2) d2.style.display = b.showSection2 === false ? 'none' : '';

    // Необязательная кнопка-ссылка (CTA) — 4-й, дополнительный блок баннера
    const ctaSection = document.getElementById('banner-section-cta');
    const ctaDivider = document.getElementById('banner-divider-cta');
    const ctaLink = document.getElementById('banner-cta-link');
    const showCta = !!(b.ctaText && b.ctaUrl);
    if (ctaSection) ctaSection.style.display = showCta ? '' : 'none';
    if (ctaDivider) ctaDivider.style.display = showCta ? '' : 'none';
    if (ctaLink && showCta) { ctaLink.textContent = b.ctaText; ctaLink.href = b.ctaUrl; }
}

function fillBannerAdminForm() {
    const b = (window.siteFlags && window.siteFlags.banner) || DEFAULT_SITE_FLAGS.banner;
    const activeEl = document.getElementById('banner-admin-active'); if (activeEl) activeEl.checked = b.active !== false;
    const set = (id, val) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = val || ''; };
    set('banner-admin-label', b.label);
    set('banner-admin-version', b.version);
    set('banner-admin-infolabel', b.infoLabel);
    set('banner-admin-info', b.info);
    set('banner-admin-timerlabel', b.timerLabel);
    set('banner-admin-icon1', b.icon1);
    set('banner-admin-icon2', b.icon2);
    set('banner-admin-icon3', b.icon3);
    set('banner-admin-cta-text', b.ctaText);
    set('banner-admin-cta-url', b.ctaUrl);
    const s1 = document.getElementById('banner-admin-show1'); if (s1) s1.checked = b.showSection1 !== false;
    const s2 = document.getElementById('banner-admin-show2'); if (s2) s2.checked = b.showSection2 !== false;
    const s3 = document.getElementById('banner-admin-show3'); if (s3) s3.checked = b.showSection3 !== false;
    if (b.timerTarget) {
        const el = document.getElementById('banner-admin-timer');
        if (el && document.activeElement !== el) {
            try { el.value = new Date(b.timerTarget).toISOString().slice(0,16); } catch(e){}
        }
    }
}

window.saveBannerSettings = async function() {
    if (!isAdmin(window.currentUser)) return notify('Нет доступа', false);
    const active = document.getElementById('banner-admin-active')?.checked !== false;
    const label = document.getElementById('banner-admin-label')?.value.trim() || DEFAULT_SITE_FLAGS.banner.label;
    const version = document.getElementById('banner-admin-version')?.value.trim() || DEFAULT_SITE_FLAGS.banner.version;
    const infoLabel = document.getElementById('banner-admin-infolabel')?.value.trim() || DEFAULT_SITE_FLAGS.banner.infoLabel;
    const info = document.getElementById('banner-admin-info')?.value.trim() || '';
    const timerLabel = document.getElementById('banner-admin-timerlabel')?.value.trim() || DEFAULT_SITE_FLAGS.banner.timerLabel;
    const timerRaw = document.getElementById('banner-admin-timer')?.value;
    const timerTarget = timerRaw ? new Date(timerRaw).toISOString() : null;
    const icon1 = document.getElementById('banner-admin-icon1')?.value.trim() || '🚀';
    const icon2 = document.getElementById('banner-admin-icon2')?.value.trim() || '💎';
    const icon3 = document.getElementById('banner-admin-icon3')?.value.trim() || '⏳';
    const ctaText = document.getElementById('banner-admin-cta-text')?.value.trim() || '';
    const ctaUrl = document.getElementById('banner-admin-cta-url')?.value.trim() || '';
    const showSection1 = document.getElementById('banner-admin-show1')?.checked !== false;
    const showSection2 = document.getElementById('banner-admin-show2')?.checked !== false;
    const showSection3 = document.getElementById('banner-admin-show3')?.checked !== false;
    const banner = { active, label, version, infoLabel, info, timerLabel, timerTarget, icon1, icon2, icon3, ctaText, ctaUrl, showSection1, showSection2, showSection3 };
    const newFlags = Object.assign({}, window.siteFlags, { banner });
    try {
        const existingRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.site_flags', { headers: H });
        const existing = await existingRes.json();
        let saveRes;
        if (Array.isArray(existing) && existing.length) {
            saveRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.site_flags', { method:'PATCH', headers: H, body: JSON.stringify({ value: newFlags }) });
        } else {
            saveRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings', { method:'POST', headers: H, body: JSON.stringify({ key:'site_flags', value: newFlags }) });
        }
        if (!saveRes.ok) {
            const errBody = await saveRes.text().catch(()=> '');
            console.error('saveBannerSettings: сервер отклонил сохранение', saveRes.status, errBody);
            return notify('Не сохранилось: сервер вернул ошибку ' + saveRes.status + '. Проверьте права (RLS) на таблицу site_settings в Supabase', false);
        }
        window.siteFlags = newFlags;
        renderUpdateBanner();
        notify('Баннер обновлён — уже виден всем на сайте');
    } catch(e) { console.error('saveBannerSettings error', e); notify('Не удалось сохранить баннер: ' + (e.message||e), false); }
};

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

// ─── УПРАВЛЕНИЕ ФРАКЦИЯМИ (цвет / категория / статус "скоро") ──
// Фракции, добавленные через админ-панель, теперь реально создают карточку
// на главной странице (в нужной категории), а не только сохраняют настройки "вслепую".
const FACTION_GRID_IDS = { government: 'grid-government', criminal: 'grid-criminal', other: 'grid-other' };

function getAllFactionCardNames() {
    return Array.from(document.querySelectorAll('.faction-card .faction-name'))
        .map(el => el.textContent.trim())
        .filter((v, i, arr) => v && arr.indexOf(v) === i);
}

function slugifyFactionName(name) {
    return 'custom-' + name.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/(^-|-$)/g, '');
}

// Создаёт недостающие карточки для фракций, которых ещё нет на странице (managed-факции)
function ensureManagedFactionCards(meta) {
    const existingNames = new Set(getAllFactionCardNames());
    Object.keys(meta).forEach(name => {
        if (existingNames.has(name)) return; // карточка уже есть на сайте — просто применим стили ниже
        const m = meta[name];
        const gridId = FACTION_GRID_IDS[m.category] || FACTION_GRID_IDS.other;
        const grid = document.getElementById(gridId);
        if (!grid) return;
        const slug = slugifyFactionName(name);
        if (document.getElementById('managed-card-' + slug)) return; // уже создана ранее
        const color = m.color || '#00f5ff';
        const card = document.createElement('div');
        card.className = 'faction-card animate-fade-in';
        card.id = 'managed-card-' + slug;
        card.dataset.managed = '1';
        card.innerHTML = `<div class="faction-icon" style="background:${color}14;border-color:${color}40">🏷️</div><div class="faction-name">${escHtml(name)}</div><div class="faction-desc">Фракция, добавленная администрацией сервера.</div><span class="faction-tag" style="color:${FACTION_CATEGORY_COLORS[m.category]||color};border-color:${(FACTION_CATEGORY_COLORS[m.category]||color)}40">${FACTION_CATEGORY_LABELS[m.category]||'ФРАКЦИЯ'}</span><div class="faction-arrow">→</div>`;
        card.setAttribute('onclick', m.soon ? `showComingSoon('faction-soon', ${JSON.stringify(name)})` : `requireAuth(function(){openModal('faction-join')})`);
        grid.appendChild(card);
    });
    // Показываем/прячем категорию "Другое" в зависимости от того, есть ли в ней карточки
    const otherCat = document.getElementById('other-factions-category');
    const otherGrid = document.getElementById('grid-other');
    if (otherCat && otherGrid) otherCat.style.display = otherGrid.children.length ? '' : 'none';
}

function applyFactionMeta() {
    const meta = (window.siteFlags && window.siteFlags.factionMeta) || {};
    ensureManagedFactionCards(meta);
    document.querySelectorAll('.faction-card').forEach(card => {
        const nameEl = card.querySelector('.faction-name');
        if (!nameEl) return;
        const name = nameEl.textContent.trim();
        const m = meta[name];
        if (!m) return;
        const icon = card.querySelector('.faction-icon');
        if (icon && m.color) {
            icon.style.background = m.color + '14';
            icon.style.borderColor = m.color + '40';
        }
        const tag = card.querySelector('.faction-tag');
        if (tag && m.category) {
            tag.textContent = FACTION_CATEGORY_LABELS[m.category] || tag.textContent;
            tag.style.color = FACTION_CATEGORY_COLORS[m.category] || '';
            tag.style.borderColor = (FACTION_CATEGORY_COLORS[m.category] || '') + '40';
        }
        // Сохраняем оригинальный onclick один раз, чтобы можно было включать/выключать "скоро" без потери формы вступления
        if (!card.dataset.originalOnclick) card.dataset.originalOnclick = card.getAttribute('onclick') || '';
        if (m.soon) {
            card.setAttribute('onclick', `showComingSoon('faction-soon', ${JSON.stringify(name)})`);
        } else if (card.dataset.originalOnclick) {
            card.setAttribute('onclick', card.dataset.originalOnclick);
        }
    });
}

window.loadFactionManager = function() {
    const body = document.getElementById('faction-manager-body');
    if (!body) return;
    const meta = (window.siteFlags && window.siteFlags.factionMeta) || {};
    const names = getAllFactionCardNames();
    // Показываем и фракции с карточками на сайте, и те, что были добавлены вручную, но пока без карточки
    const allNames = names.concat(Object.keys(meta).filter(n => !names.includes(n)));
    if (!allNames.length) { body.innerHTML = '<tr><td colspan="5" style="padding:14px;opacity:0.5">Фракций не найдено</td></tr>'; return; }
    body.innerHTML = allNames.map(name => {
        const m = meta[name] || { color:'#00f5ff', category:'government', soon:false };
        const safeId = name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_');
        return `<tr>
            <td style="padding:10px 12px;color:#fff">${escHtml(name)}</td>
            <td style="padding:10px 12px"><input type="color" id="fm-color-${safeId}" value="${m.color || '#00f5ff'}" style="width:40px;height:32px;border:none;border-radius:6px;background:none;cursor:pointer"></td>
            <td style="padding:10px 12px"><select id="fm-cat-${safeId}" class="form-input" style="padding:6px 10px;font-size:13px">
                <option value="government" ${m.category==='government'?'selected':''}>Государственная</option>
                <option value="criminal" ${m.category==='criminal'?'selected':''}>Криминальная</option>
                <option value="other" ${m.category==='other'?'selected':''}>Иное</option>
            </select></td>
            <td style="padding:10px 12px"><input type="checkbox" id="fm-soon-${safeId}" ${m.soon?'checked':''}></td>
            <td style="padding:10px 12px;white-space:nowrap">
                <button class="form-submit" style="padding:6px 12px;font-size:12px;margin:0 6px 0 0;display:inline-block;width:auto" onclick="saveManagedFaction(${JSON.stringify(name)}, '${safeId}')">Сохранить</button>
                <button style="background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);color:#f87171;padding:6px 10px;border-radius:8px;cursor:pointer;font-size:12px" onclick="deleteManagedFaction(${JSON.stringify(name)})">✕</button>
            </td>
        </tr>`;
    }).join('');
};

async function persistFactionMeta(newMeta) {
    const newFlags = Object.assign({}, window.siteFlags, { factionMeta: newMeta });
    try {
        const existingRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.site_flags', { headers: H });
        const existing = await existingRes.json();
        let saveRes;
        if (Array.isArray(existing) && existing.length) {
            saveRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.site_flags', { method:'PATCH', headers: H, body: JSON.stringify({ value: newFlags }) });
        } else {
            saveRes = await fetch(SUPABASE_URL + '/rest/v1/site_settings', { method:'POST', headers: H, body: JSON.stringify({ key:'site_flags', value: newFlags }) });
        }
        if (!saveRes.ok) { notify('Не сохранилось: сервер вернул ошибку ' + saveRes.status, false); return false; }
        window.siteFlags = newFlags;
        applyFactionMeta();
        return true;
    } catch(e) { console.error(e); notify('Ошибка сохранения фракции', false); return false; }
}

window.saveManagedFaction = async function(name, safeId) {
    if (!isOwner(window.currentUser)) return notify('Нет доступа', false);
    const color = document.getElementById('fm-color-' + safeId)?.value || '#00f5ff';
    const category = document.getElementById('fm-cat-' + safeId)?.value || 'government';
    const soon = document.getElementById('fm-soon-' + safeId)?.checked || false;
    const meta = Object.assign({}, window.siteFlags.factionMeta);
    meta[name] = { color, category, soon };
    if (await persistFactionMeta(meta)) notify('Фракция «' + name + '» обновлена');
};

window.deleteManagedFaction = async function(name) {
    if (!isOwner(window.currentUser)) return notify('Нет доступа', false);
    if (!confirm('Убрать фракцию «' + name + '»? Если она была создана только через админ-панель, её карточка также будет удалена с главной страницы.')) return;
    const meta = Object.assign({}, window.siteFlags.factionMeta);
    delete meta[name];
    if (await persistFactionMeta(meta)) {
        const card = document.getElementById('managed-card-' + slugifyFactionName(name));
        if (card) card.remove();
        const otherCat = document.getElementById('other-factions-category');
        const otherGrid = document.getElementById('grid-other');
        if (otherCat && otherGrid) otherCat.style.display = otherGrid.children.length ? '' : 'none';
        notify('Фракция убрана');
        loadFactionManager();
    }
};

window.addManagedFaction = async function() {
    if (!isOwner(window.currentUser)) return notify('Нет доступа', false);
    const name = document.getElementById('faction-add-name')?.value.trim();
    const color = document.getElementById('faction-add-color')?.value || '#00f5ff';
    const category = document.getElementById('faction-add-category')?.value || 'government';
    const soon = document.getElementById('faction-add-soon')?.checked || false;
    if (!name) return notify('Введите название фракции', false);
    const meta = Object.assign({}, window.siteFlags.factionMeta);
    meta[name] = { color, category, soon };
    if (await persistFactionMeta(meta)) {
        notify('Фракция «' + name + '» создана и уже отображается на главной странице');
        document.getElementById('faction-add-name').value = '';
        loadFactionManager();
    }
};

async function db(path, opts) {
    let res;
    try {
        res = await fetch(SUPABASE_URL + '/rest/v1/' + path, { headers: H, ...opts });
    } catch (networkErr) {
        throw new Error('Нет связи с сервером. Проверьте интернет-соединение и попробуйте снова.');
    }
    let json = null;
    try { json = await res.json(); } catch (e) { json = null; }
    if (!res.ok) {
        const msg = (json && (json.message || json.hint || json.error_description || json.error)) || ('Ошибка сервера (' + res.status + ')');
        const err = new Error(msg);
        err.status = res.status;
        throw err;
    }
    return json;
}

// FIX: раньше кнопки форм не давали никакой обратной связи, пока идёт запрос —
// казалось, что «кнопка не нажимается». Теперь кнопка блокируется и показывает
// «Отправка...», а при ошибке — понятное сообщение вместо тишины.
function setModalBusy(modalId, busy, busyText) {
    const btn = document.querySelector('#modal-' + modalId + ' .form-submit');
    if (!btn) return;
    if (busy) {
        btn.dataset.origText = btn.dataset.origText || btn.textContent;
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'wait';
        btn.textContent = busyText || 'Отправка...';
    } else {
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.cursor = '';
        if (btn.dataset.origText) btn.textContent = btn.dataset.origText;
    }
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

const VALID_TABS = ['main','portal','news','rules','profile'];
// Команда теперь отображается прямо на главной странице — старые ссылки #team ведут на главную
const LEGACY_TAB_REDIRECTS = { team: 'main' };

window.navigateTo = function(tab, section) {
    tab = LEGACY_TAB_REDIRECTS[tab] || tab;
    let hash = '#' + tab;
    if (section) hash += '/' + section;
    history.pushState({ tab, section: section||null }, '', hash);
    switchTab(tab, false);
    if (section && tab === 'portal') setTimeout(() => switchPortal(section), 50);
};

function readHash() {
    const hash = location.hash.replace('#','');
    if (!hash) return;
    const [tabRaw, section] = hash.split('/');
    const tab = LEGACY_TAB_REDIRECTS[tabRaw] || tabRaw;
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
    if (tab === 'main')  { loadCriminalCounters(); loadTeamPublic(); }
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
    setModalBusy('opg-create', true);
    try {
        const existing = await db('criminal_gangs?type=eq.opg&status=eq.active');
        if (Array.isArray(existing) && existing.length >= OPG_MAX) return notify(`Лимит ОПГ (${OPG_MAX}) достигнут!`, false);
        const res = await db('criminal_gangs', { method:'POST', body: JSON.stringify({ type:'opg', name, description:desc, tag, founder:u, status:'active', created_by: window.currentUser?.id }) });
        if (!res || !res[0]) throw new Error('Сервер не подтвердил создание');
        await db('requests', { method:'POST', body: JSON.stringify({ type:'opg_create', username:u, char_name:name, note:desc, faction:tag, status:'pending', user_id: window.currentUser?.id }) });
        closeModal('opg-create'); notify('ОПГ «' + name + '» создана! Ожидайте подтверждения администрации.'); loadCriminalCounters();
    } catch (e) { notify('Ошибка при создании ОПГ: ' + (e.message||'неизвестная ошибка'), false); }
    finally { setModalBusy('opg-create', false); }
};

window.submitCreateMafia = async function() {
    const u = document.getElementById('mafia-create-username').value.trim();
    const name = document.getElementById('mafia-create-name').value.trim();
    const desc = document.getElementById('mafia-create-desc').value.trim();
    if (!u || !name) return notify('Заполните обязательные поля', false);
    setModalBusy('mafia-create', true);
    try {
        const existing = await db('criminal_gangs?type=eq.mafia&status=eq.active');
        if (Array.isArray(existing) && existing.length >= MAFIA_MAX) return notify(`Лимит Мафий (${MAFIA_MAX}) достигнут!`, false);
        const res = await db('criminal_gangs', { method:'POST', body: JSON.stringify({ type:'mafia', name, description:desc, tag:'', founder:u, status:'active', created_by: window.currentUser?.id }) });
        if (!res || !res[0]) throw new Error('Сервер не подтвердил создание');
        await db('requests', { method:'POST', body: JSON.stringify({ type:'mafia_create', username:u, char_name:name, note:desc, status:'pending', user_id: window.currentUser?.id }) });
        closeModal('mafia-create'); notify('Мафия «' + name + '» создана! Ожидайте подтверждения.'); loadCriminalCounters();
    } catch (e) { notify('Ошибка при создании: ' + (e.message||'неизвестная ошибка'), false); }
    finally { setModalBusy('mafia-create', false); }
};

window.submitJoinOpg = async function() {
    const u = document.getElementById('opg-join-username').value.trim();
    const gangId = document.getElementById('opg-join-select').value;
    const reason = document.getElementById('opg-join-reason').value.trim();
    if (!u || !gangId) return notify('Заполните все поля', false);
    setModalBusy('opg-join', true);
    try {
        await db('requests', { method:'POST', body: JSON.stringify({ type:'opg_join', username:u, note:reason, experience:String(gangId), status:'pending', user_id: window.currentUser?.id }) });
        closeModal('opg-join'); notify('Заявка на вступление в ОПГ отправлена!');
    } catch (e) { notify('Не удалось отправить заявку: ' + (e.message||'неизвестная ошибка'), false); }
    finally { setModalBusy('opg-join', false); }
};

window.submitJoinMafia = async function() {
    const u = document.getElementById('mafia-join-username').value.trim();
    const reason = document.getElementById('mafia-join-reason').value.trim();
    if (!u) return notify('Введите никнейм', false);
    setModalBusy('mafia-join', true);
    try {
        await db('requests', { method:'POST', body: JSON.stringify({ type:'mafia_join', username:u, note:reason, status:'pending', user_id: window.currentUser?.id }) });
        closeModal('mafia-join'); notify('Заявка на вступление в Мафию отправлена!');
    } catch (e) { notify('Не удалось отправить заявку: ' + (e.message||'неизвестная ошибка'), false); }
    finally { setModalBusy('mafia-join', false); }
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
    trucker:   { icon:'🚛', title:'Дальнобойщик — скоро!', desc:'Перевозка грузов между городами, свой тягач и стабильный заработок. Устройство на работу откроется в ближайшем обновлении.' },
    busdriver: { icon:'🚌', title:'Водитель автобуса — скоро!', desc:'Городские маршруты, расписание и пассажиры. Устройство на работу откроется в ближайшем обновлении.' },
};

window.showComingSoon = function(key, factionName) {
    let info = COMING_SOON_INFO[key] || { icon:'🏗️', title:'Скоро!', desc:'Раздел в разработке.' };
    if (key === 'faction-soon') {
        info = { icon:'🚧', title:(factionName || 'Фракция') + ' — скоро откроется!', desc:'Вступление во фракцию «' + (factionName || '') + '» временно недоступно — набор откроется в ближайшем обновлении.' };
    }
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
    const dNick = document.getElementById('reg-discord-nick').value.trim();
    const dUserRaw = document.getElementById('reg-discord-username').value.trim().replace(/^@/, '');
    const dUser = dUserRaw.toLowerCase();
    const p  = document.getElementById('reg-password').value;
    const p2 = document.getElementById('reg-password2').value;
    if (!dUser || !p || !dNick) return notify('Заполните все поля, включая Discord Никнейм и Юзернейм', false);
    if (!/^[a-z0-9._]{2,32}$/.test(dUser)) return notify('Discord Юзернейм может содержать только латинские буквы, цифры, точку и подчёркивание', false);
    if (p !== p2)     return notify('Пароли не совпадают', false);
    if (p.length < 4) return notify('Пароль минимум 4 символа', false);
    try {
        const exists = await db(`users?username=eq.${encodeURIComponent(dUser)}`);
        if (exists.length) return notify('Пользователь с таким Discord юзернеймом уже зарегистрирован', false);
        const passwordHash = await hashPasswordForStorage(p);
        const res = await db('users', { method:'POST', body: JSON.stringify({ username:dUser, password:passwordHash, role:'Пользователь', faction:'', discord_nick:dNick, discord_id:dUser }) });
        if (res && res[0]) {
            window.currentUser = res[0];
            localStorage.setItem('nrp_user', JSON.stringify(res[0]));
            closeModal('auth'); updateAuthZone(); notify('Добро пожаловать, ' + dUser + '!'); navigateTo('profile');
        } else notify('Ошибка регистрации (нужны колонки discord_nick и discord_id в таблице users)', false);
    } catch (e) { notify('Ошибка регистрации: ' + (e.message||'неизвестная ошибка'), false); }
};

window.handleLogin = async function() {
    const u = document.getElementById('login-username').value.trim().replace(/^@/, '').toLowerCase();
    const p = document.getElementById('login-password').value;
    if (!u || !p) return notify('Заполните все поля', false);
    try {
        const users = await db(`users?username=eq.${encodeURIComponent(u)}`);
        if (!users.length) return notify('Пользователь не найден', false);
        const check = await verifyStoredPassword(p, users[0].password);
        if (!check.ok) return notify('Неверный пароль', false);
        window.currentUser = users[0];
        localStorage.setItem('nrp_user', JSON.stringify(users[0]));
        closeModal('auth'); updateAuthZone(); notify('Добро пожаловать, ' + u + '!'); renderProfile();
        // Фиксируем время последнего входа
        db(`users?id=eq.${users[0].id}`, { method:'PATCH', body: JSON.stringify({ last_login: new Date().toISOString() }) }).catch(()=>{});
        // Если пароль ещё хранился в открытом виде — тихо переводим его на хэш при успешном входе
        if (check.needsMigration) {
            hashPasswordForStorage(p).then(hashed => {
                db(`users?id=eq.${users[0].id}`, { method:'PATCH', body: JSON.stringify({ password: hashed }) })
                    .then(() => { window.currentUser.password = hashed; localStorage.setItem('nrp_user', JSON.stringify(window.currentUser)); })
                    .catch(()=>{});
            });
        }
    } catch (e) { notify('Ошибка входа: ' + (e.message||'неизвестная ошибка'), false); }
};

window.logout = function() {
    localStorage.removeItem('nrp_user');
    window.currentUser = null;
    updateAuthZone(); navigateTo('main'); notify('Вы вышли из аккаунта');
};

// FIX 3: В кнопке профиля показывается ник + роль + фракция
function updateAuthZone() {
    const zone = document.getElementById('auth-zone');
    updateDiscordMissingIndicators();
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
    if (pp) { pp.textContent = '••••••••'; pp.title = 'Пароль защищён и хранится в виде хэша — показать его нельзя, только сменить'; }
    const createdEl = document.getElementById('profile-created');
    if (createdEl) createdEl.textContent = window.currentUser.created_at ? new Date(window.currentUser.created_at).toLocaleDateString('ru-RU') : '—';
    const lastLoginEl = document.getElementById('profile-last-login');
    if (lastLoginEl) lastLoginEl.textContent = window.currentUser.last_login ? new Date(window.currentUser.last_login).toLocaleString('ru-RU') : '—';
    const bioEl = document.getElementById('profile-bio-input');
    if (bioEl) bioEl.value = window.currentUser.bio || '';
    const discordNickEl = document.getElementById('profile-discord-nick');
    if (discordNickEl) discordNickEl.value = window.currentUser.discord_nick || '';
    const discordIdEl = document.getElementById('profile-discord-id');
    if (discordIdEl) discordIdEl.value = window.currentUser.discord_id || '';
    updateDiscordMissingIndicators();

    // Значок ОПГ/Мафия, если пользователь состоит в криминальной организации
    const gangBadge = document.getElementById('profile-gang-badge');
    if (gangBadge) {
        if (faction === 'ОПГ' || faction === 'Мафия') { gangBadge.textContent = (faction === 'Мафия' ? '🤵 ' : '💀 ') + faction; gangBadge.style.display = 'inline-flex'; }
        else gangBadge.style.display = 'none';
    }

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

    const bannerP = document.getElementById('admin-banner-panel');
    if (bannerP) bannerP.style.display = isAdmin(window.currentUser) ? '' : 'none';
    if (isAdmin(window.currentUser)) fillBannerAdminForm();

    const discordReqP = document.getElementById('admin-discord-request-panel');
    if (discordReqP) discordReqP.style.display = isAdmin(window.currentUser) ? '' : 'none';

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
    notify('Пароль хранится в защищённом виде (хэш) и не может быть показан — используйте «Сменить пароль» ниже', false);
};

window.changePassword = async function() {
    const np = document.getElementById('new-password').value;
    const cp = document.getElementById('confirm-password').value;
    if (!np)           return notify('Введите новый пароль', false);
    if (np.length < 4) return notify('Пароль минимум 4 символа', false);
    if (np !== cp)     return notify('Пароли не совпадают', false);
    try {
        const hashed = await hashPasswordForStorage(np);
        await db(`users?id=eq.${window.currentUser.id}`, { method:'PATCH', body: JSON.stringify({ password:hashed }) });
        window.currentUser.password = hashed;
        localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        notify('Пароль изменён!'); renderProfile();
    } catch (e) { notify('Не удалось изменить пароль: ' + (e.message||'неизвестная ошибка'), false); }
};

window.saveBio = async function() {
    const bioEl = document.getElementById('profile-bio-input');
    const bio = (bioEl?.value || '').trim().slice(0, 300);
    try {
        await db(`users?id=eq.${window.currentUser.id}`, { method:'PATCH', body: JSON.stringify({ bio }) });
        window.currentUser.bio = bio;
        localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
        notify('О себе — сохранено');
    } catch(e) { notify('Не удалось сохранить (нужна колонка bio в таблице users)', false); }
};

// ─── DISCORD ID (для автоматической выдачи ролей ботом) ──
window.saveDiscordId = async function() {
    const nickEl = document.getElementById('profile-discord-nick');
    const userEl = document.getElementById('profile-discord-id');
    const discordNick = (nickEl?.value || '').trim().slice(0, 60);
    const discordId = (userEl?.value || '').trim().replace(/^@/, '').slice(0, 40);
    if (nickEl) nickEl.value = discordNick;
    if (userEl) userEl.value = discordId;
    try {
        await db(`users?id=eq.${window.currentUser.id}`, { method:'PATCH', body: JSON.stringify({ discord_nick: discordNick, discord_id: discordId }) });
        window.currentUser.discord_nick = discordNick;
        window.currentUser.discord_id = discordId;
        localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
        notify('Discord-данные сохранены');
        updateDiscordMissingIndicators();
    } catch(e) { console.error(e); notify('Не удалось сохранить (нужны колонки discord_nick и discord_id в таблице users)', false); }
};

// FIX 8: показываем красную точку у кнопки "Профиль" и баннер внутри профиля,
// если у пользователя не заполнены Discord Никнейм или Юзернейм (актуально для тех, кто
// зарегистрировался до введения этого требования).
function updateDiscordMissingIndicators() {
    const u = window.currentUser;
    const missing = !!u && (!u.discord_nick || !u.discord_id);
    const dot1 = document.getElementById('profile-discord-missing-dot');
    const dot2 = document.getElementById('profile-discord-missing-dot-m');
    if (dot1) dot1.style.display = missing ? '' : 'none';
    if (dot2) dot2.style.display = missing ? '' : 'none';
    const banner = document.getElementById('discord-missing-banner');
    if (banner) banner.style.display = missing ? '' : 'none';
}

// ─── ПЕРСОНАЛИЗАЦИЯ: ЦВЕТ АКЦЕНТА ──────────────
const ACCENT_COLORS = ['#00f5ff', '#a855f7', '#22c55e', '#fbbf24', '#ef4444', '#f472b6'];

function applyAccentColor(color, save = true) {
    document.documentElement.style.setProperty('--cyan', color);
    if (save) localStorage.setItem('nrp_accent', color);
    document.querySelectorAll('.accent-swatch').forEach(s => s.style.outline = (s.dataset.color === color) ? '2px solid #fff' : 'none');
}

window.pickAccentColor = function(color) { applyAccentColor(color); notify('Цвет темы изменён'); };

(function initAccent() {
    const saved = localStorage.getItem('nrp_accent');
    if (saved) applyAccentColor(saved, false);
})();

// ─── USERS TABLE ──────────────────────────────

const SEL = `background:#1e293b;border:1px solid var(--border);color:#fff;padding:5px 8px;border-radius:8px;font-size:12px;font-family:'Rajdhani',sans-serif;max-width:160px`;

function rankIndex(role) {
    const i = ADMIN_RANKS.indexOf(role);
    return i === -1 ? 0 : i;
}

// Кэш paролей в открытом виде на этот сеанс — только для строк, где показ разрешён
window._usersCache = {};

window.loadUsersTable = async function() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" style="padding:20px;text-align:center;color:var(--text)">Загрузка...</td></tr>`;
    const users = await db('users?order=username.asc');
    if (!Array.isArray(users) || !users.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="padding:20px;text-align:center;color:var(--text)">Нет пользователей</td></tr>`; return;
    }
    window._usersCache = {};
    users.forEach(u => window._usersCache[u.id] = u);
    const viewerRank = rankIndex(window.currentUser?.role);
    tbody.innerHTML = users.map(u => {
        const targetRank = rankIndex(u.role);
        const canManagePassword = viewerRank > targetRank;
        // Пароли хранятся как хэш и больше не показываются администрации в открытом виде —
        // вместо просмотра доступен безопасный сброс на новый временный пароль.
        const passwordCell = canManagePassword
            ? `<span style="font-size:12px;color:#64748b">🔒 Хэш</span>
               <button onclick="resetUserPassword(${u.id})" style="background:none;border:none;color:var(--cyan);cursor:pointer;font-size:11px;margin-left:6px;text-decoration:underline">Сбросить</button>`
            : `<span style="font-size:12px;color:#334155">🔒 Скрыто</span>`;
        return `<tr>
        <td style="padding:10px 14px;font-weight:600;color:#fff">${escHtml(u.username)}</td>
        <td style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#94a3b8">${escHtml(u.discord_id||'—')}</td>
        <td style="padding:10px 14px;white-space:nowrap">${passwordCell}</td>
        <td style="padding:10px 14px" id="discord-check-${u.id}"><button onclick="checkUserInDiscord(${u.id})" style="background:rgba(0,245,255,0.08);border:1px solid rgba(0,245,255,0.25);color:var(--cyan);padding:4px 10px;border-radius:8px;cursor:pointer;font-size:11px">Проверить</button></td>
        <td style="padding:10px 14px"><select onchange="changeRole(${u.id},this.value)" style="${SEL}">${ADMIN_RANKS.map(r=>`<option value="${r}" ${u.role===r?'selected':''}>${r}</option>`).join('')}</select></td>
        <td style="padding:10px 14px"><select onchange="changeFaction(${u.id},this.value)" style="${SEL}">${ALL_FACTIONS.map(f=>`<option value="${f==='—'?'':f}" ${(u.faction||'')===(f==='—'?'':f)?'selected':''}>${f}</option>`).join('')}</select></td>
        <td style="padding:10px 14px"><button onclick="deleteUser(${u.id})" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;padding:5px 12px;border-radius:8px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:600">Удалить</button></td>
    </tr>`;
    }).join('');
};

window.resetUserPassword = async function(id) {
    const u = window._usersCache[id];
    if (!u) return;
    if (!confirm(`Сбросить пароль пользователя «${u.username}» и сгенерировать новый временный пароль?`)) return;
    const tempPassword = Math.random().toString(36).slice(-8);
    try {
        const hashed = await hashPasswordForStorage(tempPassword);
        await db(`users?id=eq.${id}`, { method:'PATCH', body: JSON.stringify({ password: hashed }) });
        notify(`Новый временный пароль для ${u.username}: ${tempPassword} — сообщите его игроку лично, он не сохранится нигде ещё раз`);
    } catch (e) { notify('Не удалось сбросить пароль: ' + (e.message||'неизвестная ошибка'), false); }
};

// FIX 9: проверка присутствия игрока на Discord-сервере через ту же Edge Function,
// что выдаёт роли — с флагом checkOnly, чтобы не выдавать роль, а только проверить.
window.checkUserInDiscord = async function(id) {
    const cell = document.getElementById('discord-check-' + id);
    const u = window._usersCache[id];
    if (!cell || !u) return;
    if (!u.discord_id) { cell.innerHTML = '<span style="color:#f87171;font-size:11px">Нет юзернейма</span>'; return; }
    cell.innerHTML = '<span style="color:var(--text);font-size:11px">Проверка...</span>';
    try {
        const res = await fetch(SUPABASE_URL + '/functions/v1/assign-discord-role', {
            method: 'POST',
            headers: H,
            body: JSON.stringify({ discordUsername: u.discord_id, checkOnly: true })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.found) {
            cell.innerHTML = '<span style="color:#4ade80;font-size:11px">✅ Есть на сервере</span>';
        } else {
            cell.innerHTML = `<span style="color:#f87171;font-size:11px" title="${escHtml(data.error||'')}">❌ Не найден</span> <button onclick="prefillDiscordFixRequest('${escHtml(u.username)}')" style="margin-left:6px;background:none;border:none;color:var(--cyan);cursor:pointer;font-size:11px;text-decoration:underline">Запросить исправление</button>`;
        }
    } catch(e) {
        cell.innerHTML = '<span style="color:#f87171;font-size:11px">Ошибка проверки</span>';
    }
};

window.prefillDiscordFixRequest = function(username) {
    const el = document.getElementById('discord-req-username');
    if (el) el.value = username;
    document.getElementById('admin-discord-request-panel')?.scrollIntoView({ behavior:'smooth', block:'center' });
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

// ─── УПРАВЛЕНИЕ ОПГ / МАФИЕЙ (удаление банд) ──
// Требуется таблица criminal_gangs (уже используется). Нужна лишь возможность DELETE для anon-ключа (см. SQL).

window.loadAdminGangs = async function() {
    const el = document.getElementById('admin-gangs-list');
    if (!el || !isAdmin(window.currentUser)) return;
    el.innerHTML = '<div class="loading-text" style="opacity:0.5">Загрузка...</div>';
    try {
        const gangs = await db('criminal_gangs?status=eq.active&order=type.asc,created_at.asc');
        if (!Array.isArray(gangs) || !gangs.length) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Нет активных ОПГ/Мафий</div>'; return; }
        el.innerHTML = gangs.map(g => `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;background:#0d1117;border:1px solid var(--border);border-radius:12px;padding:12px 16px;margin-bottom:8px">
            <div><span style="font-size:13px;color:var(--cyan);font-family:'JetBrains Mono',monospace;text-transform:uppercase">${g.type==='mafia'?'🤵 Мафия':'💀 ОПГ'}</span><div style="font-weight:700;color:#fff;font-size:15px">${escHtml(g.name)} ${g.tag?`<span style="font-size:11px;color:var(--cyan)">[${escHtml(g.tag)}]</span>`:''}</div><div style="color:var(--text);font-size:12px">Основатель: ${escHtml(g.founder||'—')}</div></div>
            <button onclick="deleteGang(${g.id})" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:7px 14px;border-radius:8px;cursor:pointer;white-space:nowrap">🗑 Расформировать</button>
        </div>`).join('');
    } catch(e) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Ошибка загрузки</div>'; }
};

window.deleteGang = async function(id) {
    if (!confirm('Расформировать эту организацию? Действие необратимо.')) return;
    try {
        await db(`criminal_gangs?id=eq.${id}`, { method:'DELETE' });
        notify('Организация расформирована');
    } catch(e) { notify('Ошибка удаления — проверьте права DELETE в Supabase', false); }
    loadAdminGangs();
    loadCriminalCounters();
};

// ─── УПРАВЛЕНИЕ СОСТАВОМ АДМИНИСТРАЦИИ (вкладка «Команда») ──
// Требуется таблица team_members в Supabase — см. SQL-скрипт.

const TEAM_STATUS_LABELS = {
    active:    { label: 'На месте',        color: '#22c55e', emoji: '🟢' },
    vacation:  { label: 'В отпуске',       color: '#38bdf8', emoji: '🏖' },
    absent:    { label: 'Отсутствует',     color: '#fbbf24', emoji: '⏸' },
    busy:      { label: 'Занят(а)',        color: '#a855f7', emoji: '⏳' },
    sick:      { label: 'На больничном',   color: '#f472b6', emoji: '🤒' },
    training:  { label: 'На стажировке',   color: '#0ea5e9', emoji: '🎓' },
    trial:     { label: 'Испытательный срок', color: '#eab308', emoji: '🧪' },
    suspended: { label: 'Временно отстранён(а)', color: '#f87171', emoji: '⛔' },
};

function teamStatusBadge(m) {
    const s = TEAM_STATUS_LABELS[m.status] || TEAM_STATUS_LABELS.active;
    if (m.status === 'active') return '';
    let range = '';
    if (m.status_until) range = ` до ${new Date(m.status_until).toLocaleDateString('ru-RU')}`;
    const note = m.status_note ? `: ${escHtml(m.status_note)}` : range;
    return `<span style="font-size:11px;background:${s.color}22;color:${s.color};border:1px solid ${s.color}55;padding:2px 8px;border-radius:6px;margin-left:6px;font-family:'JetBrains Mono',monospace;vertical-align:middle">${s.emoji} ${s.label}${note}</span>`;
}

window.loadTeamPublic = async function() {
    const el = document.getElementById('team-list');
    if (!el) return;
    el.innerHTML = '<div class="loading-text" style="opacity:0.5">Загрузка состава администрации...</div>';
    try {
        const members = await db('team_members?order=sort_order.asc,created_at.asc');
        if (!Array.isArray(members) || !members.length) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Состав администрации пока не заполнен</div>'; return; }
        el.innerHTML = members.map(m => {
            const color = m.color || '#00f5ff';
            const avatar = m.roblox_id ? `<img src="https://www.roblox.com/headshot-thumbnail/image?userId=${encodeURIComponent(m.roblox_id)}&width=100&height=100&format=png" style="width:60px;height:60px;border-radius:14px;border:2px solid ${color}66;object-fit:cover" onerror="this.style.display='none'">` : `<div style="width:60px;height:60px;border-radius:14px;border:2px solid ${color}66;background:${color}22;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:22px;color:${color}">${escHtml((m.name||'?').charAt(0).toUpperCase())}</div>`;
            const link = m.roblox_id ? `<a href="https://www.roblox.com/users/${encodeURIComponent(m.roblox_id)}/profile" target="_blank" style="background:${color}1a;border:1px solid ${color}55;color:${color};font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;letter-spacing:1px;padding:7px 14px;border-radius:9px;text-decoration:none;white-space:nowrap">Roblox →</a>` : '';
            return `<div style="background:var(--card);border:1px solid ${color}40;border-radius:18px;padding:20px;display:flex;align-items:center;gap:16px;${m.status!=='active'?'opacity:0.85':''}">${avatar}<div style="flex:1;min-width:0"><div style="font-family:'Bebas Neue',sans-serif;font-size:11px;letter-spacing:2px;color:${color};margin-bottom:3px">${escHtml((m.role_title||'').toUpperCase())}</div><div style="font-size:18px;font-weight:700;color:#fff">${escHtml(m.name||'')} ${teamStatusBadge(m)}</div></div>${link}</div>`;
        }).join('');
    } catch(e) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Не удалось загрузить состав команды — проверьте таблицу team_members в Supabase</div>'; }
};

window.loadAdminTeamManage = async function() {
    const el = document.getElementById('admin-team-list');
    if (!el || !isAdmin(window.currentUser)) return;
    el.innerHTML = '<div class="loading-text" style="opacity:0.5">Загрузка...</div>';
    try {
        const members = await db('team_members?order=sort_order.asc,created_at.asc');
        if (!Array.isArray(members) || !members.length) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Пока никого не добавили</div>'; return; }
        el.innerHTML = members.map(m => `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;background:#0d1117;border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:8px">
            <div style="flex:1;min-width:140px"><div style="font-weight:700;color:#fff;font-size:14px">${escHtml(m.name)}</div><div style="color:var(--text);font-size:12px">${escHtml(m.role_title||'')}</div></div>
            <select onchange="updateTeamMemberStatus(${m.id}, this.value)" style="${SEL}">
                <option value="active" ${m.status==='active'?'selected':''}>🟢 На месте</option>
                <option value="vacation" ${m.status==='vacation'?'selected':''}>🏖 В отпуске</option>
                <option value="absent" ${m.status==='absent'?'selected':''}>⏸ Отсутствует</option>
                <option value="busy" ${m.status==='busy'?'selected':''}>⏳ Занят(а)</option>
                <option value="sick" ${m.status==='sick'?'selected':''}>🤒 На больничном</option>
                <option value="training" ${m.status==='training'?'selected':''}>🎓 На стажировке</option>
                <option value="trial" ${m.status==='trial'?'selected':''}>🧪 Испытательный срок</option>
                <option value="suspended" ${m.status==='suspended'?'selected':''}>⛔ Временно отстранён(а)</option>
            </select>
            <button onclick="deleteTeamMember(${m.id})" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 12px;border-radius:8px;cursor:pointer">🗑 Убрать</button>
        </div>`).join('');
    } catch(e) { el.innerHTML = '<div class="loading-text" style="opacity:0.5">Ошибка загрузки — проверьте таблицу team_members</div>'; }
};

window.addTeamMember = async function() {
    if (!isAdmin(window.currentUser)) return notify('Нет доступа', false);
    const name  = document.getElementById('team-add-name')?.value.trim();
    const role  = document.getElementById('team-add-role')?.value.trim();
    const rid   = document.getElementById('team-add-roblox')?.value.trim();
    const color = document.getElementById('team-add-color')?.value || '#00f5ff';
    if (!name || !role) return notify('Укажите ник и должность', false);
    try {
        await db('team_members', { method:'POST', body: JSON.stringify({ name, role_title: role, roblox_id: rid || null, color, status:'active', sort_order: 100 }) });
        notify('Сотрудник добавлен в состав');
        ['team-add-name','team-add-role','team-add-roblox'].forEach(id => { const e = document.getElementById(id); if (e) e.value=''; });
        loadAdminTeamManage(); loadTeamPublic();
    } catch(e) { notify('Ошибка — проверьте таблицу team_members в Supabase', false); }
};

window.updateTeamMemberStatus = async function(id, status) {
    let status_note = null, status_until = null;
    if (status === 'vacation' || status === 'absent') {
        status_note = prompt('Комментарий к статусу (необязательно, например "13.07 – 21.07"):', '') || null;
    }
    try {
        await db(`team_members?id=eq.${id}`, { method:'PATCH', body: JSON.stringify({ status, status_note, status_until }) });
        notify('Статус обновлён');
    } catch(e) { notify('Ошибка обновления статуса', false); }
    loadAdminTeamManage(); loadTeamPublic();
};

window.deleteTeamMember = async function(id) {
    if (!confirm('Убрать сотрудника из состава команды?')) return;
    try {
        await db(`team_members?id=eq.${id}`, { method:'DELETE' });
        notify('Сотрудник убран из состава');
    } catch(e) { notify('Ошибка удаления', false); }
    loadAdminTeamManage(); loadTeamPublic();
};

// ─── OWNER PANEL ──────────────────────────────

function showOwnerPanelIfNeeded() {
    const panel = document.getElementById('owner-panel');
    if (!panel) return;
    if (isOwner(window.currentUser)) {
        panel.style.display = '';
        syncOwnerCheckboxes();
    } else {
        panel.style.display = 'none';
    }
    if (isAdmin(window.currentUser)) {
        loadAdminTeamManage();
        loadAdminGangs();
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
    // Сохраняем tabs/services/registration_open, но не затираем банер, который мог сохранить админ отдельно
    const flags = Object.assign({}, window.siteFlags, { tabs, services, registration_open });
    window.siteFlags = flags;
    try {
        const existing = await db('site_settings?key=eq.site_flags');
        if (Array.isArray(existing) && existing.length) {
            await db('site_settings?key=eq.site_flags', { method:'PATCH', body: JSON.stringify({ value: flags }) });
        } else {
            await db('site_settings', { method:'POST', body: JSON.stringify({ key:'site_flags', value: flags }) });
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

// FIX: удаление документов больше не привязано к срокам действия — сроки отменены полностью.

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

window.sendDiscordFixRequest = async function() {
    if (!isAdmin(window.currentUser)) return notify('Нет доступа', false);
    const uEl = document.getElementById('discord-req-username');
    const fEl = document.getElementById('discord-req-field');
    const mEl = document.getElementById('discord-req-message');
    const username = uEl?.value.trim();
    const field = fEl?.value || 'username';
    const fieldLabel = field === 'nick' ? 'Discord Никнейм' : 'Discord Юзернейм';
    const comment = mEl?.value.trim();
    if (!username) return notify('Введите ник игрока на сайте', false);
    const users = await db(`users?username=eq.${encodeURIComponent(username)}`);
    if (!Array.isArray(users) || !users.length) return notify('Пользователь не найден', false);
    const text = `Администрация не может найти вас в Discord. Пожалуйста, проверьте и исправьте: ${fieldLabel}.` + (comment ? ` Комментарий: ${comment}` : '');
    try {
        const res = await db('notifications', { method:'POST', body: JSON.stringify({ user_id: users[0].id, type:'discord_fix_request', text, field, read:false }) });
        const failed = !res || !Array.isArray(res) || !res.length || res.code || res.message;
        if (failed) { console.warn('sendDiscordFixRequest failed', res); return notify('Не удалось отправить: проверьте таблицу notifications в Supabase', false); }
        notify('Запрос отправлен игроку ' + username);
        if (uEl) uEl.value = ''; if (mEl) mEl.value = '';
    } catch(e) { console.warn('sendDiscordFixRequest error', e); notify('Ошибка отправки', false); }
};

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
        // FIX: PostgREST не возвращает { error: ... } — при ошибке ответ выглядит как
        // { message, code, details, hint } и НЕ является массивом. Раньше это ложно
        // считалось успехом, из-за чего уведомление «не приходило» на другой аккаунт.
        const failed = !res || !Array.isArray(res) || !res.length || res.code || res.message;
        if (failed) {
            console.warn('sendRenameRequest insert failed', res);
            return notify('Не удалось отправить: таблица notifications недоступна (проверьте SQL/RLS в Supabase)', false);
        }
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
    if (n.type === 'discord_fix_request') {
        const isNick = n.field === 'nick';
        return `<div class="profile-card" style="border-color:rgba(248,113,113,0.35);background:rgba(248,113,113,0.05)">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:20px">🛠️</span><div style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:1px;color:#f87171">Проверьте ваши Discord-данные</div></div>
            <div style="color:var(--text);font-size:14px;margin-bottom:14px;line-height:1.6">${escHtml(n.text||'')}</div>
            <div class="form-group"><input type="text" id="notif-discord-${n.id}" placeholder="${isNick ? 'Правильный Discord Никнейм' : 'Правильный Discord Юзернейм'}" class="form-input"></div>
            <button class="form-submit" onclick="respondDiscordFixRequest(${n.id}, '${isNick ? 'nick' : 'username'}')">Сохранить исправление</button>
        </div>`;
    }
    return `<div class="profile-card"><div style="color:var(--text);font-size:14px;line-height:1.6">${escHtml(n.text||'')}</div><button onclick="dismissNotification(${n.id})" style="margin-top:10px;background:none;border:none;color:var(--cyan);font-size:12px;cursor:pointer;letter-spacing:1px">ПОНЯТНО, СКРЫТЬ</button></div>`;
}

window.respondDiscordFixRequest = async function(notifId, field) {
    const input = document.getElementById('notif-discord-' + notifId);
    const next = input?.value.trim().replace(/^@/, '');
    if (!next) return notify('Введите значение', false);
    const patch = field === 'nick' ? { discord_nick: next } : { discord_id: next };
    await db(`users?id=eq.${window.currentUser.id}`, { method:'PATCH', body: JSON.stringify(patch) });
    Object.assign(window.currentUser, patch);
    localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
    await db(`notifications?id=eq.${notifId}`, { method:'PATCH', body: JSON.stringify({ read:true }) }).catch(()=>{});
    renderProfile();
    updateDiscordMissingIndicators();
    notify('Данные обновлены, спасибо!');
};

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
        // чекбоксы оружия лежат в #weapons-checkboxes — читаем отмеченные чекбоксы
        const wpnBox = document.getElementById('weapons-checkboxes');
        const wpn = wpnBox ? Array.from(wpnBox.querySelectorAll('input[type=checkbox]:checked')).map(o => o.value).join(', ') : '';
        if (!u||!n||!job||!rsn||!wpn) return notify('Заполните поля и отметьте хотя бы один вид оружия', false);
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
    setModalBusy(type, true);
    try {
        const res = await db('requests', { method:'POST', body: JSON.stringify(data) });
        if (!res || !res[0]) throw new Error('Сервер не подтвердил сохранение заявки');
        closeModal(type);
        notify('Заявка отправлена! Ожидайте рассмотрения.');
    } catch (e) {
        notify('Не удалось отправить заявку: ' + (e.message || 'неизвестная ошибка'), false);
    } finally {
        setModalBusy(type, false);
    }
};

// ─── MY DOCS ──────────────────────────────────
// FIX: сроки действия документов (паспорт/мед.книжка/лицензия) полностью отменены —
// все одобренные документы действуют бессрочно, без функций продления/просрочки.

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
        const date = r.created_at ? new Date(r.created_at).toLocaleDateString('ru-RU') : '';
        const btns = canM ? `<div style="display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)"><button onclick="deleteRequest(${r.id},'mydocs')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer">🗑 Удалить</button></div>` : '';
        return `<div class="doc-card" style="flex-direction:column;align-items:stretch;gap:0"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div style="display:flex;align-items:center;gap:14px"><div class="doc-icon">${typeIcons[r.type]||'📄'}</div><div><div style="font-weight:700;color:#fff;font-size:16px">${typeLabels[r.type]||r.type}</div><div style="color:var(--text);font-size:13px;margin-top:2px">${date} • ${escHtml(r.char_name||r.username||'')}</div></div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">${sb}</div></div>${btns}</div>`;
    }).join('');
};

window.deleteRequest = async function(id, section) {
    if (!confirm('Удалить этот документ?')) return;
    await db(`requests?id=eq.${id}`, { method:'DELETE' });
    notify('Документ удалён');
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
        return `<div class="request-card"><div class="request-type">${REQUEST_TYPE_NAMES[r.type]||r.type} • ${date}</div><div class="request-player">${escHtml(r.username||'—')}</div><div class="request-data">${details}</div><div class="request-actions"><button class="btn-approve" onclick="reviewRequest(${r.id},'approved')">✓ Одобрить</button><button class="btn-reject" onclick="reviewRequest(${r.id},'rejected')">✕ Отклонить</button></div></div>`;
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
    await db(`requests?id=eq.${id}`, { method:'PATCH', body: JSON.stringify({ status }) });
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

// Если название фракции на сайте отличается от точного названия роли в Discord — впишите соответствие сюда.
// Ключ — как фракция называется на сайте, значение — как называется роль в Discord (регистр не важен).
// Если фракция не указана в списке, бот попробует найти роль с точно таким же именем, как на сайте.
const DISCORD_ROLE_NAME_MAP = {
    // 'Патрульная Полиция (ДПС)': 'ДПС',
};

async function assignDiscordRole(discordUsername, factionValue, oldFactionValue) {
    if (!discordUsername || !factionValue) return;
    const roleName = DISCORD_ROLE_NAME_MAP[factionValue] || factionValue;
    const oldRoleName = oldFactionValue ? (DISCORD_ROLE_NAME_MAP[oldFactionValue] || oldFactionValue) : null;
    try {
        const res = await fetch(SUPABASE_URL + '/functions/v1/assign-discord-role', {
            method: 'POST',
            headers: H,
            body: JSON.stringify({ discordUsername, roleName, oldRoleName })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            console.warn('assignDiscordRole: не удалось выдать роль в Discord', data);
            notify('Заявка одобрена, но роль в Discord не выдалась: ' + (data.error || res.status), false);
        }
    } catch (e) {
        console.warn('assignDiscordRole error', e);
    }
}

// FIX 6: При одобрении заявки на вступление во фракцию/ОПГ/Мафию — фракция сразу
// проставляется пользователю на сайте (аналогично ручному изменению в таблице пользователей).
// Если у игрока указан ник Discord в профиле — сайт просит бота снять старую роль фракции
// (если она была) и выдать новую.
async function applyApprovalSideEffects(req) {
    if (!req.user_id) return;
    try {
        let factionValue = null;
        if (req.type === 'faction_join') factionValue = req.faction || null;
        else if (req.type === 'opg_join' || req.type === 'opg_create') factionValue = 'ОПГ';
        else if (req.type === 'mafia_join' || req.type === 'mafia_create') factionValue = 'Мафия';
        if (!factionValue) return;
        // Сначала узнаём, какая фракция была у игрока ДО одобрения — её роль нужно будет снять
        const beforeRows = await db(`users?id=eq.${req.user_id}&select=discord_id,faction`);
        const before = Array.isArray(beforeRows) && beforeRows[0] ? beforeRows[0] : {};
        const oldFaction = before.faction || null;
        const discordId = before.discord_id || null;

        await db(`users?id=eq.${req.user_id}`, { method:'PATCH', body: JSON.stringify({ faction: factionValue }) });
        if (window.currentUser && window.currentUser.id === req.user_id) {
            window.currentUser.faction = factionValue;
            localStorage.setItem('nrp_user', JSON.stringify(window.currentUser));
            updateAuthZone();
        }
        if (discordId) await assignDiscordRole(discordId, factionValue, oldFaction !== factionValue ? oldFaction : null);
    } catch(e) { console.warn('applyApprovalSideEffects error', e); }
}

// ─── DOCUMENTS VIEWER ─────────────────────────

function renderDocCard(r, fields, icon, section) {
    const statusBadge = '<span class="badge badge-approved">✓ Действителен (бессрочно)</span>';
    const canM = canManageDocs(window.currentUser);
    const btns = canM ? `<div style="display:flex;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)"><button onclick="deleteRequest(${r.id},'${section}')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer">🗑 Удалить</button></div>` : '';
    return `<div class="doc-card" style="flex-direction:column;align-items:stretch;gap:0"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px"><div style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;color:#fff">${icon} ${escHtml(r.char_name||r.username)}</div><div style="text-align:right">${statusBadge}</div></div><div style="color:var(--text);font-size:14px;line-height:1.9;margin-top:12px;border-top:1px solid var(--border);padding-top:12px">${fields}</div>${btns}</div>`;
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
    loadTeamPublic();
    loadSiteSettings();

    document.getElementById('login-password')?.addEventListener('keydown', e => { if(e.key==='Enter') handleLogin(); });
    document.getElementById('reg-password2')?.addEventListener('keydown',  e => { if(e.key==='Enter') handleRegister(); });

    if (location.hash) readHash();
});
window._updateCountdownInterval = null;
function startUpdateCountdown(targetIso) {
    if (window._updateCountdownInterval) { clearInterval(window._updateCountdownInterval); window._updateCountdownInterval = null; }
    const targetDate = new Date(targetIso || "2026-07-10T21:00:00+03:00").getTime();
    const timerElement = document.getElementById("countdown-timer");
    if (!timerElement) return;

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(interval);
            window._updateCountdownInterval = null;
            timerElement.innerHTML = "ОБНОВЛЕНИЕ ВЫШЛО! 🔥";
            timerElement.style.color = "#4ade80";
            timerElement.style.textShadow = "0 0 12px rgba(74, 222, 128, 0.5)";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let timerText = "";
        if (days > 0) timerText += `${days}д `;
        
        // Добавляем нули перед цифрами для красоты (например, 09ч 05м 02с)
        const formatNum = (num) => num < 10 ? '0' + num : num;
        
        timerText += `${formatNum(hours)}ч ${formatNum(minutes)}м ${formatNum(seconds)}с`;

        timerElement.innerHTML = timerText;
    }, 1000);
    window._updateCountdownInterval = interval;
}
