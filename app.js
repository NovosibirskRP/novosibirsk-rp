const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

let currentUser = null;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        currentUser = JSON.parse(saved);
        window.updateAuthZone();
    }
});

window.switchTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
    document.getElementById(`nav-${tab}`).classList.add('active');
};

window.openModal = () => document.getElementById('auth-modal').classList.remove('hidden');
window.closeModal = () => document.getElementById('auth-modal').classList.add('hidden');

window.handleAuthLogin = async (e) => {
    e.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(u)}&password=eq.${encodeURIComponent(p)}`, { headers });
    const users = await res.json();
    
    if (users.length === 1) {
        currentUser = users[0];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.closeModal();
        window.updateAuthZone();
        alert('Вход выполнен!');
    } else {
        alert('Ошибка: неверный ник или пароль!');
    }
};

window.updateAuthZone = () => {
    const zone = document.getElementById('auth-zone');
    if (currentUser) {
        zone.innerHTML = `<button onclick="window.handleLogout()" class="bg-red-600 px-6 py-2 rounded text-white font-bold">Выйти</button>`;
        document.getElementById('nav-profile')?.classList.remove('hidden');
    }
};

window.handleLogout = () => {
    localStorage.removeItem('currentUser');
    location.reload();
};
