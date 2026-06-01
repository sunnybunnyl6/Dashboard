// ========== GLOBAL STATE ==========

let grid;
const STORAGE_KEY = 'dashboard_layout';
const THEME_KEY = 'dashboard_theme';
const TITLE_KEY = 'dashboard_title';
const COLOR_KEY = 'dashboard_color';

// ========== INITIALIZATION ==========

window.addEventListener('load', function() {
    // Initialize Grid
    grid = GridStack.init({
        float: true,
        cellHeight: 70,
        margin: 12,
        animate: true,
        resizable: { handles: 'all' },
        disableDrag: false,
        disableResize: false
    });

    // Load saved state
    loadTheme();
    loadTitle();
    loadAccentColor();
    loadBoard();

    // Set up auto-save
    grid.on('change', () => saveBoard());

    console.log("✨ Dashboard initialized!");
});

// ========== THEME MANAGEMENT ==========

function setTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === themeName);
    });
    localStorage.setItem(THEME_KEY, themeName);
}

function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    setTheme(saved);
}

function updateAccentColor(color) {
    document.documentElement.style.setProperty('--accent', color);
    localStorage.setItem(COLOR_KEY, color);
}

function loadAccentColor() {
    const saved = localStorage.getItem(COLOR_KEY) || '#6c5ce7';
    document.getElementById('accent-color').value = saved;
    updateAccentColor(saved);
}

// ========== TITLE MANAGEMENT ==========

function updateTitle(title) {
    const displayTitle = title || 'Dashboard';
    document.getElementById('title-display').textContent = displayTitle;
    document.getElementById('dashboard-title').value = title;
    localStorage.setItem(TITLE_KEY, title);
    document.title = displayTitle;
}

function loadTitle() {
    const saved = localStorage.getItem(TITLE_KEY) || 'Dashboard';
    updateTitle(saved);
}

// ========== GRID SIZE ==========

function updateGridSize(size) {
    document.getElementById('container').style.backgroundSize = `${size}px ${size}px`;
}

// ========== SETTINGS PANEL ==========

function toggleSettings() {
    document.getElementById('settings-panel').classList.toggle('open');
}

document.addEventListener('click', (e) => {
    const panel = document.getElementById('settings-panel');
    if (!panel.contains(e.target) && !e.target.closest('.icon-btn')) {
        panel.classList.remove('open');
    }
});

// ========== ADD WIDGETS ==========

function addNewBlock(type) {
    if (!grid) return;

    let content = '';
    let w = 4, h = 4;

    switch(type) {
        case 'text':
            content = createTextWidget();
            w = 4; h = 4;
            break;
        case 'embed':
            const url = prompt("Paste YouTube, Spotify, or embed link:");
            if (!url) return;
            content = createEmbedWidget(url);
            w = 6; h = 5;
            break;
        case 'image':
            handleImageUpload();
            return;
        case 'clock':
            content = createClockWidget();
            w = 3; h = 3;
            break;
        case 'weather':
            content = createWeatherWidget();
            w = 4; h = 4;
            break;
        case 'todo':
            content = createTodoWidget();
            w = 4; h = 5;
            break;
    }

    grid.addWidget({
        w: w,
        h: h,
        content: `
            <button class="delete-btn" onclick="grid.removeWidget(this.parentElement.parentElement)">✕</button>
            <div style="display:flex; flex-direction:column; height:100%;">
                ${content}
            </div>
        `
    });
}

// ========== WIDGET CREATORS ==========

function createTextWidget() {
    return `
        <input type="text" class="widget-title" placeholder="Note Title">
        <textarea placeholder="Start typing..."></textarea>
    `;
}

function createEmbedWidget(url) {
    const finalUrl = url
        .replace('watch?v=', 'embed/')
        .replace('youtu.be/', 'youtube.com/embed/')
        .replace('playlist?list=', 'embed/playlist/?list=');
    
    return `<iframe src="${finalUrl}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
}

function handleImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            grid.addWidget({
                w: 4, h: 4,
                content: `
                    <button class="delete-btn" onclick="grid.removeWidget(this.parentElement.parentElement)">✕</button>
                    <img src="${ev.target.result}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">
                `
            });
        };
        reader.readAsDataURL(e.target.files[0]);
    };
    input.click();
}

function createClockWidget() {
    return `
        <div class="clock-widget">
            <div id="clock-time">12:00:00</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);" id="clock-date">Jan 1</div>
        </div>
        <script>
            function updateClock() {
                const now = new Date();
                document.getElementById('clock-time').textContent = now.toLocaleTimeString();
                document.getElementById('clock-date').textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            updateClock();
            setInterval(updateClock, 1000);
        <\/script>
    `;
}

function createWeatherWidget() {
    return `
        <div class="weather-widget">
            <div>Enter your location to see weather</div>
            <input type="text" id="weather-location" placeholder="City name" style="padding: 8px; border: 1px solid var(--border); border-radius: 6px;">
            <button onclick="fetchWeather(this)" style="padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer;">Get Weather</button>
            <div id="weather-result" style="margin-top: 10px;"></div>
        </div>
    `;
}

function createTodoWidget() {
    return `
        <div class="todo-list">
            <div class="todo-input-row">
                <input type="text" id="todo-input" placeholder="Add a task..." style="padding: 8px;">
                <button class="todo-add-btn" onclick="addTodoItem(this.parentElement.parentElement)">Add</button>
            </div>
            <div id="todo-items"></div>
        </div>
        <script>
            document.getElementById('todo-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addTodoItem(document.querySelector('.todo-list'));
                }
            });
        <\/script>
    `;
}

// ========== UTILITY FUNCTIONS ==========

function addTodoItem(container) {
    const input = container.querySelector('#todo-input');
    const itemsContainer = container.querySelector('#todo-items');
    
    if (!input.value.trim()) return;
    
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item';
    todoItem.innerHTML = `
        <input type="checkbox">
        <input type="text" value="${input.value}" readonly style="background: transparent;">
        <button class="todo-delete" onclick="this.parentElement.remove(); saveBoard();">×</button>
    `;
    
    itemsContainer.appendChild(todoItem);
    input.value = '';
    saveBoard();
}

function fetchWeather(btn) {
    const location = btn.parentElement.querySelector('#weather-location').value;
    if (!location) return alert('Please enter a location');
    
    const result = btn.parentElement.querySelector('#weather-result');
    result.textContent = 'Loading...';
    
    // Using open-meteo free API (no key required)
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`)
        .then(r => r.json())
        .then(data => {
            if (!data.results?.[0]) {
                result.innerHTML = '<span style="color: var(--text-secondary);">Location not found</span>';
                return;
            }
            const { latitude, longitude, name, country } = data.results[0];
            
            return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`)
                .then(r => r.json())
                .then(weather => {
                    const temp = Math.round(weather.current.temperature_2m);
                    const code = weather.current.weather_code;
                    const emoji = getWeatherEmoji(code);
                    
                    result.innerHTML = `
                        <div style="font-size: 2rem;">${emoji}</div>
                        <div class="weather-temp">${temp}°F</div>
                        <div class="weather-desc">${name}, ${country}</div>
                    `;
                });
        })
        .catch(err => {
            result.innerHTML = '<span style="color: #ff6464;">Error fetching weather</span>';
            console.error(err);
        });
}

function getWeatherEmoji(code) {
    if (code === 0 || code === 1) return '☀️';
    if (code === 2) return '⛅';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌧️';
    if (code >= 85 && code <= 86) return '❄️';
    if (code >= 90 && code <= 99) return '⛈️';
    return '🌤️';
}

// ========== SAVE & LOAD ==========

function saveBoard() {
    if (!grid) return;
    
    const data = grid.save(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadBoard() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved || !grid) return;
    
    try {
        const data = JSON.parse(saved);
        grid.removeAll();
        data.forEach(item => {
            grid.addWidget(item);
        });
    } catch (e) {
        console.error('Error loading board:', e);
    }
}

// ========== EXPORT & IMPORT ==========

function exportBoard() {
    if (!grid) return;
    
    const data = {
        layout: grid.save(true),
        theme: localStorage.getItem(THEME_KEY),
        title: localStorage.getItem(TITLE_KEY),
        color: localStorage.getItem(COLOR_KEY),
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dashboard-${new Date().getTime()}.json`;
    a.click();
}

function importBoard(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            // Restore settings
            if (data.theme) setTheme(data.theme);
            if (data.title) updateTitle(data.title);
            if (data.color) updateAccentColor(data.color);
            
            // Restore layout
            if (data.layout && grid) {
                grid.removeAll();
                data.layout.forEach(item => {
                    grid.addWidget(item);
                });
            }
            
            alert('✅ Dashboard imported successfully!');
            toggleSettings();
        } catch (err) {
            alert('❌ Error importing dashboard: ' + err.message);
        }
    };
    reader.readAsText(file);
}

function clearBoard() {
    if (confirm('⚠️ Are you sure? This will delete all widgets.')) {
        if (grid) {
            grid.removeAll();
            saveBoard();
        }
    }
}
