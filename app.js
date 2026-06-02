// НАСТРОЙКИ
const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// 1. АВТОРИЗАЦИЯ
async function login(username, password) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${username}&password=eq.${password}`, { headers });
    const users = await res.json();
    if (users.length === 1) {
        localStorage.setItem('currentUser', JSON.stringify(users[0]));
        location.reload();
    } else {
        alert('Ошибка: неверный ник или пароль!');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

// 2. АДМИН-ПАНЕЛЬ И НОВОСТИ
async function loadEverything() {
    // Если юзер админ - показываем панель
    if (currentUser && currentUser.role === 'Разработчик') {
        const adminPanel = document.createElement('div');
        adminPanel.id = 'admin-news-panel';
        adminPanel.className = 'bg-red-900 p-4 mb-4';
        adminPanel.innerHTML = `<h3>Панель управления</h3><input id="n-title" placeholder="Заголовок"><button onclick="addNews()">Опубликовать</button>`;
        document.body.prepend(adminPanel);
    }
    
    // Загружаем новости
    const res = await fetch(`${SUPABASE_URL}/rest/v1/news?order=created_at.desc`, { headers });
    const news = await res.json();
    const feed = document.getElementById('news-feed');
    if (feed) feed.innerHTML = news.map(n => `<div><h3>${n.title}</h3><p>${n.text}</p></div>`).join('');
}

async function addNews() {
    const title = document.getElementById('n-title').value;
    await fetch(`${SUPABASE_URL}/rest/v1/news`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ title, text: '...', tag: 'Общее' })
    });
    location.reload();
}

// ЗАПУСК
document.addEventListener('DOMContentLoaded', loadEverything);
