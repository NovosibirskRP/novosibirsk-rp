// Глобальное состояние приложения (Эмуляция базы данных на клиенте)
let currentUser = null;

// Стартовый массив базовых новостей сервера
let newsData = [
    {
        id: 1,
        title: "Глобальное обновление: Дорожная реформа",
        date: "02.06.2026",
        author: "Разработчики",
        tag: "Обновление",
        text: "Сегодня на дороги нашего города была добавлена новая дорожная техника, радары, конусы и сигнальные столбики (делиниаторы) для регулирования опасных участков движения. Медицинская служба также получила новые кареты скорой помощи Мерседес."
    },
    {
        id: 2,
        title: "Внимание! Повышенный паспортный контроль",
        date: "01.06.2026",
        author: "Мэрия",
        tag: "Важно",
        text: "В связи с участившимися нарушениями общественного порядка, УВД совместно с Правительством вводит усиленный режим несения службы. Сотрудники правоохранительных органов имеют право проверять документы и медицинские карты на всех блокпостах."
    }
];

// Инициализация при первой загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    renderNews();
});

// ФУНКЦИЯ 1: Переключение вкладок (Tabs / SPA логика)
function switchTab(tabName) {
    // Скрываем весь контент
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    // Убираем активный класс со всех кнопок навигации
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Показываем нужный блок и делаем кнопку активной
    const targetTab = document.getElementById(`tab-${tabName}`);
    const targetNavLink = document.getElementById(`nav-${tabName}`);
    
    if (targetTab) targetTab.classList.remove('hidden');
    if (targetNavLink) targetNavLink.classList.add('active');
}

// ФУНКЦИЯ 2: Управление Модальным окном авторизации
function openModal() {
    const modal = document.getElementById('auth-modal');
    const box = document.getElementById('modal-box');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    box.classList.remove('scale-95');
}

function closeModal() {
    const modal = document.getElementById('auth-modal');
    const box = document.getElementById('modal-box');
    modal.classList.add('opacity-0', 'pointer-events-none');
    box.classList.add('scale-95');
    // Очищаем форму
    document.getElementById('auth-login').value = '';
    document.getElementById('auth-password').value = '';
}

// ФУНКЦИЯ 3: Обработка входа (Эмуляция авторизации)
function handleAuth(event) {
    event.preventDefault(); // Запрещаем перезагрузку страницы
    
    const loginInput = document.getElementById('auth-login').value.trim();
    
    if(!loginInput) return;

    // Проверяем режим: если ник "Admin" — даем админа, иначе — обычный игрок
    if (loginInput.toLowerCase() === 'admin') {
        currentUser = { name: "Admin", role: "Администратор" };
    } else {
        currentUser = { name: loginInput, role: "Игрок" };
    }

    // Обновляем шапку сайта (Navbar)
    updateNavbar();
    // Проверяем, нужно ли показать админ-панель создания новостей
    checkAdminPermissions();
    // Закрываем окно
    closeModal();
}

// ФУНКЦИЯ 4: Обновление Навбара под вошедшего юзера
function updateNavbar() {
    const authZone = document.getElementById('auth-zone');
    
    if (currentUser) {
        const isAdmin = currentUser.role === "Администратор";
        const badgeColor = isAdmin ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
        
        authZone.innerHTML = `
            <div class="flex items-center space-x-3 bg-slate-950 border border-slate-800 rounded-2xl p-1.5 pr-4">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 uppercase text-sm">
                    ${currentUser.name.charAt(0)}
                </div>
                <div class="flex flex-col text-left">
                    <span class="text-sm font-bold text-white leading-none">${currentUser.name}</span>
                    <span class="text-[10px] uppercase tracking-wider border rounded px-1 mt-1 text-center font-semibold ${badgeColor}">
                        ${currentUser.role}
                    </span>
                </div>
                <button onclick="handleLogout()" class="text-slate-500 hover:text-red-400 pl-2 text-xs transition-colors duration-200">
                    Выйти
                </button>
            </div>
        `;
    } else {
        authZone.innerHTML = `
            <button onclick="openModal()" class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/25 active:scale-95">
                Войти
            </button>
        `;
    }
}

// ФУНКЦИЯ 5: Логаут (Выход из аккаунта)
function handleLogout() {
    currentUser = null;
    updateNavbar();
    checkAdminPermissions();
}

// ФУНКЦИЯ 6: Проверка прав на отображение Админ-панели новостей
function checkAdminPermissions() {
    const adminPanel = document.getElementById('admin-news-panel');
    if (currentUser && currentUser.role === "Администратор") {
        adminPanel.classList.remove('hidden');
    } else {
        adminPanel.classList.add('hidden');
    }
}

// ФУНКЦИЯ 7: Рендеринг (Вывод) списка новостей на экран
function renderNews() {
    const feed = document.getElementById('news-feed');
    feed.innerHTML = ''; // Очищаем старый вывод

    newsData.forEach(news => {
        // Определяем цвет тега
        let tagClass = "bg-slate-800 border-slate-700 text-slate-300";
        if(news.tag === "Важно") tagClass = "bg-red-500/10 border-red-500/20 text-red-400";
        if(news.tag === "Обновление") tagClass = "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
        if(news.tag === "Мероприятие") tagClass = "bg-purple-500/10 border-purple-500/20 text-purple-400";

        const card = document.createElement('div');
        card.className = "bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-all duration-300 animate-fade-in";
        card.innerHTML = `
            <div class="flex items-center justify-between gap-2">
                <span class="border px-2.5 py-0.5 rounded-lg text-xs font-bold ${tagClass}">${news.tag}</span>
                <span class="text-xs text-slate-500 font-medium">${news.date}</span>
            </div>
            <div class="space-y-2">
                <h3 class="text-xl font-bold text-white tracking-tight">${news.title}</h3>
                <p class="text-slate-400 text-sm leading-relaxed">${news.text}</p>
            </div>
            <div class="border-t border-slate-850 pt-3 text-xs text-slate-500 flex items-center gap-1.5">
                Автор публикации: <span class="text-slate-400 font-semibold">${news.author}</span>
            </div>
        `;
        feed.appendChild(card);
    });
}

// ФУНКЦИЯ 8: Динамическое создание новости администратором
function createNews() {
    const title = document.getElementById('news-title').value.trim();
    const tag = document.getElementById('news-tag').value;
    const text = document.getElementById('news-text').value.trim();

    if (!title || !text) {
        alert("Пожалуйста, заполните заголовок и текст публикации!");
        return;
    }

    // Формируем текущую дату в формате ДД.ММ.ГГГГ
    const today = new Date();
    const formattedDate = String(today.getDate()).padStart(2, '0') + '.' + String(today.getMonth() + 1).padStart(2, '0') + '.' + today.getFullYear();

    // Создаем новый объект новости
    const newPost = {
        id: Date.now(),
        title: title,
        date: formattedDate,
        author: currentUser ? currentUser.name : "Администрация",
        tag: tag,
        text: text
    };

    // Добавляем созданную новость в САМОЕ НАЧАЛО массива
    newsData.unshift(newPost);

    // Очищаем инпуты в админке
    document.getElementById('news-title').value = '';
    document.getElementById('news-text').value = '';

    // Перерисовываем ленту новостей, чтобы изменения появились мгновенно
    renderNews();
}
