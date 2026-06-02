// Официальный список должностей на проекте Novosibirsk RP
const PROJECT_ROLES = [
    "Игрок",
    "Патрульная Полиция (ДПС)",
    "ФСБ",
    "СОБР",
    "Верховный Суд",
    "Прокуратура",
    "Адвокатура",
    "ГТРК «Новосибирск»",
    "МЧС",
    "ОПГ",
    "ВИЦЕ МЭР",
    "МЭР",
    "Модерация",
    "Администрация",
    "Команда технического администрирования",
    "Секретарь",
    "Ассистент Главного Владельца",
    "Заместитель Главного Владельца",
    "Главный Владелец"
];

// 1. НАСТРОЙКА БАЗЫ ДАННЫХ ПОЛЬЗОВАТЕЛЕЙ
let appUsers = JSON.parse(localStorage.getItem('rp_users')) || [];
const userIndex = appUsers.findIndex(u => u.username.toUpperCase() === "RUBERS_SQ");

if (userIndex === -1) {
    appUsers.push({ username: "RUBERS_SQ", role: "Главный Владелец", password: "123" });
} else {
    appUsers[userIndex].role = "Главный Владелец";
}
localStorage.setItem('rp_users', JSON.stringify(appUsers));

// 2. ОБНОВЛЕНИЕ ДАННЫХ ТЕКУЩЕЙ СЕССИИ
let sessionUser = JSON.parse(sessionStorage.getItem('rp_current_session')) || null;

if (sessionUser && sessionUser.username.toUpperCase() === "RUBERS_SQ") {
    sessionUser.role = "Главный Владелец";
    sessionStorage.setItem('rp_current_session', JSON.stringify(sessionUser));
}

// НАЧАЛЬНЫЕ НОВОСТИ (ЕСЛИ ПУСТО)
if (!localStorage.getItem('rp_news')) {
    const defaultNews = [
        {
            id: 1,
            title: "Официальный запуск сайта Novosibirsk RP!",
            date: "02.06.2026",
            author: "RUBERS_SQ (Главный Владелец)",
            tag: "Важно",
            text: "Приветствуем игроков! Сайт успешно обновлен. Все панели управления и вкладки работают в штатном режиме."
        }
    ];
    localStorage.setItem('rp_news', JSON.stringify(defaultNews));
}

let appNews = JSON.parse(localStorage.getItem('rp_news'));

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    renderNews();
    updateNavbar();
    checkPermissions();
});

// ГЛОБАЛЬНАЯ ПРОВЕРКА АДМИН-ПРАВ
function hasAdminAccess() {
    if (!sessionUser) return false;
    const currentRole = sessionUser.role.toUpperCase();
    
    if (currentRole.includes("ГЛАВНЫЙ ВЛАДЕЛЕЦ") || currentRole === "ГЛАВНЫЙ ВЛАДЕЛЕЦ") {
        return true;
    }
    if (currentRole.includes("ЗАМЕСТИТЕЛЬ ГЛАВНОГО ВЛАДЕЛЕЦА") || currentRole.includes("ЗАМ")) {
        return true;
    }

    const altAdminRoles = ["АДМИНИСТРАЦИЯ", "МОДЕРАЦИЯ", "КОМАНДА ТЕХНИЧЕСКОГО АДМИНИСТРИРОВАНИЯ", "МЭР"];
    return altAdminRoles.some(r => currentRole.includes(r));
}

// Переключение вкладок сайта
function switchTab(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(tab => tab.classList.add('hidden'));

    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => link.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabName}`);
    const targetLink = document.getElementById(`nav-${tabName}`);
    
    if (targetTab) targetTab.classList.remove('hidden');
    if (targetLink) targetLink.classList.add('active');
}

// Показ кастомного тега в админке новостей
function toggleCustomTagInput() {
    const select = document.getElementById('news-tag-select');
    const customInput = document.getElementById('news-tag-custom');
    if (select && select.value === 'CUSTOM') {
        customInput.classList.remove('hidden');
    } else if (customInput) {
        customInput.classList.add('hidden');
    }
}

// Управление модальным окном авторизации
function openModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('hidden');
        toggleAuthForm('login');
    }
}

function closeModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
}

// Вход / Регистрация переключатель формы
function toggleAuthForm(mode) {
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const btnLogin = document.getElementById('tab-btn-login');
    const btnRegister = document.getElementById('tab-btn-register');

    if (mode === 'login') {
        if(formLogin) formLogin.classList.remove('hidden');
        if(formRegister) formRegister.classList.add('hidden');
        if(btnLogin) btnLogin.className = "flex-1 text-center py-2 text-sm font-bold rounded-lg text-cyan-400 bg-slate-900";
        if(btnRegister) btnRegister.className = "flex-1 text-center py-2 text-sm font-bold rounded-lg text-slate-400 hover:text-white";
    } else {
        if(formLogin) formLogin.classList.add('hidden');
        if(formRegister) formRegister.classList.remove('hidden');
        if(btnRegister) btnRegister.className = "flex-1 text-center py-2 text-sm font-bold rounded-lg text-cyan-400 bg-slate-900";
        if(btnLogin) btnLogin.className = "flex-1 text-center py-2 text-sm font-bold rounded-lg text-slate-400 hover:text-white";
    }
}

// Регистрация аккаунта
function handleAuthRegister(event) {
    event.preventDefault();
    const name = document.getElementById('reg-username').value.trim();
    const pass = document.getElementById('reg-password').value;

    if (appUsers.some(u => u.username.toLowerCase() === name.toLowerCase())) {
        alert("Этот никнейм занят!");
        return;
    }

    appUsers.push({ username: name, role: "Игрок", password: pass });
    localStorage.setItem('rp_users', JSON.stringify(appUsers));
    alert("Регистрация успешна!");
    toggleAuthForm('login');
}

// Логин в аккаунт
function handleAuthLogin(event) {
    event.preventDefault();
    const name = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value;

    const user = appUsers.find(u => u.username.toLowerCase() === name.toLowerCase() && u.password === pass);

    if (!user) {
        alert("Неверный никнейм или пароль!");
        return;
    }

    sessionUser = { username: user.username, role: user.role };
    sessionStorage.setItem('rp_current_session', JSON.stringify(sessionUser));

    updateNavbar();
    checkPermissions();
    closeModal();
}

// Выход из аккаунта
function handleLogout() {
    sessionUser = null;
    sessionStorage.removeItem('rp_current_session');
    updateNavbar();
    checkPermissions();
    switchTab('main');
}

// Смена собственного пароля
function changeOwnPassword() {
    const newPass = document.getElementById('profile-new-password').value;
    if(!newPass) return alert("Введите пароль!");

    appUsers = appUsers.map(u => {
        if(u.username.toLowerCase() === sessionUser.username.toLowerCase()) u.password = newPass;
        return u;
    });
    localStorage.setItem('rp_users', JSON.stringify(appUsers));
    document.getElementById('profile-new-password').value = '';
    alert("Пароль успешно изменен!");
    if(hasAdminAccess()) renderUsersTable();
}

// Динамический навбар
function updateNavbar() {
    const authZone = document.getElementById('auth-zone');
    const profileLink = document.getElementById('nav-profile');

    if (!authZone) return;

    if (sessionUser) {
        if (profileLink) profileLink.classList.remove('hidden');
        
        authZone.innerHTML = `
            <div class="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-2xl p-2 pr-4 shadow-md">
                <img src="photo_2026-05-26_23-01-05.jpg" alt="Аватар" class="w-9 h-9 rounded-xl object-cover border border-slate-700">
                <div class="flex flex-col text-left">
                    <span class="text-sm font-bold text-white leading-none">${sessionUser.username}</span>
                    <span class="text-[10px] text-blue-400 font-extrabold mt-1.5 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">${sessionUser.role}</span>
                </div>
                <button onclick="handleLogout()" class="text-slate-500 hover:text-red-400 pl-3 text-xs transition-colors font-medium">Выйти</button>
            </div>
        `;
    } else {
        if (profileLink) profileLink.classList.add('hidden');
        authZone.innerHTML = `
            <button onclick="openModal()" class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-300 shadow-lg">
                Войти
            </button>
        `;
    }
}

// Проверка прав на отображение админ-панелей
function checkPermissions() {
    const adminPanel = document.getElementById('admin-news-panel');
    const managementPanel = document.getElementById('management-panel');

    if (hasAdminAccess()) {
        if(adminPanel) adminPanel.classList.remove('hidden');
        if(managementPanel) managementPanel.classList.remove('hidden');
        renderUsersTable();
    } else {
        if(adminPanel) adminPanel.classList.add('hidden');
        if(managementPanel) managementPanel.classList.add('hidden');
    }
    // Перерисуем новости, чтобы кнопка "Удалить" появилась/исчезла вовремя
    renderNews();
}

// Рендеринг таблицы пользователей базы данных с кнопкой удаления
function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    appUsers.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-slate-850 text-slate-300 text-sm";

        let optionsHtml = '';
        PROJECT_ROLES.forEach(role => {
            const selected = user.role.toUpperCase() === role.toUpperCase() ? 'selected' : '';
            optionsHtml += `<option value="${role}" ${selected}>${role}</option>`;
        });

        tr.innerHTML = `
            <td class="py-3 px-2 font-bold text-white">${user.username}</td>
            <td class="py-3 px-2 text-cyan-400 font-mono select-all">${user.password}</td>
            <td class="py-3 px-2">
                <span class="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">${user.role}</span>
            </td>
            <td class="py-3 px-2">
                <select onchange="updateUserRole('${user.username}', this.value)" class="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2 py-1 text-slate-300 outline-none">
                    ${optionsHtml}
                </select>
            </td>
            <td class="py-3 px-2 text-right">
                <button onclick="deleteUser('${user.username}')" class="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-950 border border-red-500/20 text-xs font-bold px-3 py-1 rounded-lg transition-all">
                    Удалить аккаунт
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Функция удаления пользователя из базы данных
function deleteUser(username) {
    if (username.toUpperCase() === "RUBERS_SQ") {
        return alert("Нельзя удалить аккаунт Главного Владельца проекта!");
    }
    
    if (!confirm(`Вы действительно хотите навсегда удалить аккаунт ${username} из базы данных?`)) return;

    appUsers = appUsers.filter(u => u.username !== username);
    localStorage.setItem('rp_users', JSON.stringify(appUsers));

    if (sessionUser && sessionUser.username === username) {
        handleLogout();
    } else {
        renderUsersTable();
    }
    alert(`Аккаунт ${username} успешно удален!`);
}

// Обновление роли пользователя администратором
function updateUserRole(username, newRole) {
    appUsers = appUsers.map(u => {
        if(u.username === username) u.role = newRole;
        return u;
    });
    localStorage.setItem('rp_users', JSON.stringify(appUsers));
    
    if(sessionUser && sessionUser.username.toLowerCase() === username.toLowerCase()) {
        sessionUser.role = newRole;
        sessionStorage.setItem('rp_current_session', JSON.stringify(sessionUser));
        updateNavbar();
    }
    
    checkPermissions();
}

// ОТОБРАЖЕНИЕ ЛЕНТЫ НОВОСТЕЙ (Исправлено: Кнопка «Удалить» железно возвращена администраторам)
function renderNews() {
    const feed = document.getElementById('news-feed');
    if(!feed) return;
    feed.innerHTML = '';

    appNews.forEach(news => {
        const card = document.createElement('div');
        card.className = "bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4";
        
        // Проверяем, имеет ли текущий пользователь право удалять новости
        const deleteButtonHtml = hasAdminAccess() 
            ? `<button onclick="deleteNews(${news.id})" class="text-red-500 hover:text-red-400 font-bold transition-colors">Удалить</button>` 
            : '';

        card.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded-lg text-xs font-bold">${news.tag}</span>
                <span class="text-xs text-slate-500">${news.date}</span>
            </div>
            <div class="space-y-2">
                <h3 class="text-xl font-bold text-white">${news.title}</h3>
                <p class="text-slate-400 text-sm leading-relaxed">${news.text}</p>
            </div>
            <div class="border-t border-slate-850 pt-3 text-xs text-slate-500 flex items-center justify-between">
                <div>Автор: <span class="text-slate-400 font-semibold">${news.author}</span></div>
                ${deleteButtonHtml}
            </div>
        `;
        feed.appendChild(card);
    });
}

// Создание новости администрацией
function createNews() {
    const title = document.getElementById('news-title').value.trim();
    const selectTag = document.getElementById('news-tag-select').value;
    const customTag = document.getElementById('news-tag-custom').value.trim();
    const text = document.getElementById('news-text').value.trim();

    if (!title || !text) return alert("Заполните заголовок и текст публикации!");

    let finalTag = selectTag === 'CUSTOM' ? customTag : selectTag;
    if (!finalTag) return alert("Выберите или введите категорию!");

    const today = new Date();
    const formattedDate = String(today.getDate()).padStart(2, '0') + '.' + String(today.getMonth() + 1).padStart(2, '0') + '.' + today.getFullYear();

    appNews.unshift({
        id: Date.now(),
        title: title,
        date: formattedDate,
        author: sessionUser ? `${sessionUser.username} (${sessionUser.role})` : "Администрация",
        tag: finalTag,
        text: text
    });

    localStorage.setItem('rp_news', JSON.stringify(appNews));

    document.getElementById('news-title').value = '';
    document.getElementById('news-text').value = '';
    document.getElementById('news-tag-custom').value = '';
    document.getElementById('news-tag-select').value = 'Важно';
    toggleCustomTagInput();

    renderNews();
}

// Удаление постов
function deleteNews(id) {
    if(!confirm("Вы действительно хотите удалить выбранную новость?")) return;
    appNews = appNews.filter(n => n.id !== id);
    localStorage.setItem('rp_news', JSON.stringify(appNews));
    renderNews();
}