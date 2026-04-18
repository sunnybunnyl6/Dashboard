// 1. Initialize Gridstack with a "Sleek" configuration
const grid = GridStack.init({
    float: true,          // Permissive dragging (no snapping to top)
    cellHeight: 60,       // Tight grid for precise layout
    margin: 12,           // Clean whitespace between tiles
    minRow: 1,
    resizable: { handles: 'all' }, // Modern resize from any edge
    animate: true         // Smooth movement transitions
});

// 2. The Universal "Add Block" Function
function addTile(type) {
    let content = '';
    let w = 4, h = 4; // Default sizing

    if (type === 'text') {
        content = `
            <input type="text" placeholder="Title" class="title" style="border:none; outline:none; font-weight:700; font-size:1.1rem; width:85%; background:transparent;">
            <textarea placeholder="Start writing..." style="width:100%; flex-grow:1; border:none; outline:none; resize:none; margin-top:10px; font-family:inherit; background:transparent;"></textarea>`;
        w = 3; h = 4;
    } 
    else if (type === 'embed') {
        const url = prompt("Paste YouTube, Spotify, or Website URL:");
        if (!url) return;
        
        // Auto-fix URL for YouTube and Spotify to ensure they work as embeds
        let cleanUrl = url.replace("watch?v=", "embed/").replace("playlist/", "embed/playlist/");
        content = `<iframe src="${cleanUrl}" style="width:100%; height:100%; border:none; border-radius:10px;"></iframe>`;
        w = 6; h = 5;
    } 
    else if (type === 'image') {
        // Trigger a local file upload automatically
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = e => {
            const reader = new FileReader();
            reader.onload = ev => {
                const el = `<div><div class="grid-stack-item-content">
                                <button class="delete-btn" onclick="grid.removeWidget(this.parentElement.parentElement)">✕</button>
                                <img src="${ev.target.result}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">
                            </div></div>`;
                grid.addWidget(el, {w: 4, h: 4});
            };
            reader.readAsDataURL(e.target.files[0]);
        };
        input.click();
        return; // Image is added inside the reader.onload
    }

    // Wrap the content in the standard Sleek Gridstack format
    const widgetHtml = `
        <div>
            <div class="grid-stack-item-content">
                <button class="delete-btn" onclick="grid.removeWidget(this.parentElement.parentElement)">✕</button>
                <div style="display:flex; flex-direction:column; height:100%;">
                    ${content}
                </div>
            </div>
        </div>`;
    
    grid.addWidget(widgetHtml, {w: w, h: h});
}

// 3. Save/Load Logic (The "Portable Dashboard")
function saveBoard() {
    const data = [];
    document.querySelectorAll('.grid-stack-item').forEach(el => {
        const node = el.gridstackNode;
        // Captures the text, titles, and images inside the block
        const body = el.querySelector('.grid-stack-item-content').innerHTML;
        data.push({ x: node.x, y: node.y, w: node.w, h: node.h, content: body });
    });
    
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'my-aesthetic-board.json';
    a.click();
}

function loadBoard(input) {
    const reader = new FileReader();
    reader.onload = function() {
        const data = JSON.parse(reader.result);
        grid.removeAll(); // Clear current board
        data.forEach(item => {
            const el = `<div><div class="grid-stack-item-content">${item.content}</div></div>`;
            grid.addWidget(el, { x: item.x, y: item.y, w: item.w, h: item.h });
        });
    };
    reader.readAsText(input.files[0]);
}
