// 1. Initialize the Grid Engine
const grid = GridStack.init({
    float: true,          // Blocks stay where you drop them
    cellHeight: 70,       // Height of one grid unit
    margin: 10,           // Space between blocks
    minRow: 1,
    resizable: { handles: 'all' } // Resize from any corner
});

// 2. Function to Add Different Blocks
function addBlock(type) {
    let content = '';
    let w = 4, h = 4;

    if (type === 'text') {
        content = `<input type="text" placeholder="Title" style="border:none; outline:none; font-weight:bold; font-size:1.2rem; width:80%;">
                   <textarea style="width:100%; flex-grow:1; border:none; outline:none; resize:none; margin-top:10px; font-family:inherit;" placeholder="Start typing..."></textarea>`;
        w = 3; h = 4;
    } 
    else if (type === 'table') {
        content = `<h3 contenteditable="true" style="margin:0; outline:none;">Untitled Table</h3>
                   <div style="overflow:auto; flex-grow:1;">
                    <table style="width:100%; border-collapse:collapse; margin-top:10px;">
                        <tr><th style="border:1px solid #eee; padding:8px; background:#f9f9f9;">Item</th><th style="border:1px solid #eee; padding:8px; background:#f9f9f9;">Status</th></tr>
                        <tr><td contenteditable="true" style="border:1px solid #eee; padding:8px;"></td><td contenteditable="true" style="border:1px solid #eee; padding:8px;"></td></tr>
                    </table>
                   </div>
                   <button onclick="addRow(this)" style="margin-top:10px; border:1px dashed #ccc; background:none; width:100%; cursor:pointer; padding:5px;">+ Add Row</button>`;
        w = 4; h = 5;
    }
    else if (type === 'embed') {
        const url = prompt("Paste YouTube, Spotify, or Website URL:");
        if (!url) return;
        let cleanUrl = url.replace("watch?v=", "embed/").replace("playlist/", "embed/playlist/");
        content = `<iframe src="${cleanUrl}" style="width:100%; height:100%; border:none; border-radius:8px;"></iframe>`;
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
                                <img src="${ev.target.result}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">
                            </div></div>`;
                grid.addWidget(el, {w: 4, h: 4});
            };
            reader.readAsDataURL(e.target.files[0]);
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

// 3. Helper function for Tables
function addRow(btn) {
    const table = btn.previousElementSibling.querySelector('table');
    const row = table.insertRow(-1);
    row.innerHTML = '<td contenteditable="true" style="border:1px solid #eee; padding:8px;"></td><td contenteditable="true" style="border:1px solid #eee; padding:8px;"></td>';
}

// 4. Save Logic (Downloads a JSON file)
function saveDashboard() {
    const data = [];
    document.querySelectorAll('.grid-stack-item').forEach(el => {
        const node = el.gridstackNode;
        const innerHTML = el.querySelector('.grid-stack-item-content').innerHTML;
        data.push({ x: node.x, y: node.y, w: node.w, h: node.h, content: innerHTML });
    });
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dashboard-layout.json';
    link.click();
}

// 5. Load Logic (Uploads a JSON file)
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
    reader.readAsText(input.files[0]);
}
