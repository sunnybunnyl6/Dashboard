// 1. Initialize the Grid with specific settings
const grid = GridStack.init({
    float: true, 
    cellHeight: 60,
    margin: 10,
    resizable: { handles: 'all' }
});

// 2. Upgraded Add Row function (Uses event delegation so it never breaks)
document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('row-btn')) {
        const table = e.target.previousElementSibling.querySelector('table');
        const row = table.insertRow(-1);
        row.innerHTML = '<td contenteditable="true"></td><td contenteditable="true"></td>';
    }
});

function addBlock(type) {
    let content = '';
    let w = 4, h = 4;

    if (type === 'text') {
        content = `<input type="text" placeholder="Title" style="border:none; outline:none; font-weight:bold; font-size:1.2rem; width:85%;">
                   <textarea style="width:100%; flex-grow:1; border:none; outline:none; resize:none; margin-top:10px; font-family:inherit;" placeholder="Start typing..."></textarea>`;
        w = 3; h = 4;
    } 
    else if (type === 'table') {
        // ADDED: 'row-btn' class so the upgrade logic above can find it
        content = `<h3 contenteditable="true" style="margin:0; outline:none;">Untitled Table</h3>
                   <div style="overflow:auto; flex-grow:1;">
                    <table>
                        <tr><th>Item</th><th>Status</th></tr>
                        <tr><td contenteditable="true"></td><td contenteditable="true"></td></tr>
                    </table>
                   </div>
                   <button class="row-btn" style="margin-top:10px; border:1px dashed #ccc; background:none; width:100%; cursor:pointer;">+ Row</button>`;
        w = 4; h = 5;
    }
    else if (type === 'embed') {
        const url = prompt("Paste YouTube, Spotify, or Website URL:");
        if (!url) return;
        let cleanUrl = url;
        // Auto-fix for common embed types
        if(url.includes('://youtube.com')) cleanUrl = url.replace("watch?v=", "embed/");
        if(url.includes('spotify.com')) cleanUrl = url.replace("/playlist/", "/embed/playlist/");
        
        content = `<iframe src="${cleanUrl}"></iframe>`;
        w = 6; h = 5;
    } 
    else if (type === 'image') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = e => {
            const reader = new FileReader();
            reader.onload = ev => {
                const el = `<div><div class="grid-stack-item-content">
                                <button class="delete-btn" onclick="grid.removeWidget(this.parentElement.parentElement)">✕</button>
                                <img src="${ev.target.result}">
                            </div></div>`;
                grid.addWidget(el, {w: 4, h: 4});
            };
            reader.readAsDataURL(e.target.files);
        };
        input.click();
        return;
    }

    const el = `<div><div class="grid-stack-item-content">
                    <button class="delete-btn" onclick="grid.removeWidget(this.parentElement.parentElement)">✕</button>
                    ${content}
                </div></div>`;
    grid.addWidget(el, {w: w, h: h});
}

// 3. Save/Load stays the same as it's already quite robust
function saveDashboard() {
    const data = [];
    document.querySelectorAll('.grid-stack-item').forEach(el => {
        const node = el.gridstackNode;
        const innerHTML = el.querySelector('.grid-stack-item-content').innerHTML;
        data.push({ x: node.x, y: node.y, w: node.w, h: node.h, content: innerHTML });
    });
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'layout.json';
    a.click();
}

function loadDashboard(input) {
    const reader = new FileReader();
    reader.onload = function() {
        const data = JSON.parse(reader.result);
        grid.removeAll();
        data.forEach(item => {
            const el = `<div><div class="grid-stack-item-content">${item.content}</div></div>`;
            grid.addWidget(el, { x: item.x, y: item.y, w: item.w, h: item.h });
        });
    };
    reader.readAsText(input.files);
}

