const SUPABASE_URL = "https://aygqlldisjyeljgmwmec.supabase.co";
const SUPABASE_KEY = "sb_publishable_fioN5iOmz3L-T8OurGPdYA_3IRN9K8n";
const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Функция загрузки таблицы (вызывается при входе в профиль)
async function loadUsersTable() {
    const tbody = document.getElementById('users-table-body');
    const adminPanel = document.getElementById('admin-news-panel');

    // Проверка прав
    if (!currentUser || (currentUser.role !== 'Разработчик' && currentUser.role !== 'Администратор')) {
        if (adminPanel) adminPanel.classList.add('hidden');
        return;
    }

    if (adminPanel) adminPanel.classList.remove('hidden');
    if (!tbody) return;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?order=username.asc`, { headers });
    const users = await res.json();

    tbody.innerHTML = users.map(user => `
        <tr class="border-b border-slate-800">
            <td class="py-2 text-white">${user.username}</td>
            <td class="py-2 text-slate-400">${user.role}</td>
            <td class="py-2">
                <button onclick="deleteUser(${user.id})" class="text-red-500 hover:text-red-400 text-xs">Удалить</button>
            </td>
        </tr>
    `).join('');
}

async function deleteUser(id) {
    if(!confirm('Удалить игрока?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'DELETE', headers });
    loadUsersTable();
}

// При переключении вкладок
function switchTab(tabName) {
    // ... твой код переключения ...
    
    // Если переключились на профиль — грузим админку
    if (tabName === 'profile') {
        loadUsersTable();
    }
}
