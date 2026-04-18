// 1. Wait for the page to be ready before starting the grid
let grid;
document.addEventListener('DOMContentLoaded', function() {
    // Initializing the Gridstack engine
    grid = GridStack.init({
        float: true,          // Blocks stay where you drop them
        cellHeight: 70,       // Vertical size of one grid square
        margin: 10,           // Gap between tiles
        resizable: { handles: 'all' } // Resize from any side/corner
    });
    console.log("Grid is ready!");
});

// 2. The brain behind adding new tiles
function addBlock(type) {
    if (!grid) return alert("Dashboard is still loading...");

    let content = '';
    let w = 4, h = 4; // Default width and height

    if (type === 'text') {
        content = `<input type="text" placeholder="Title" style="border:none; outline:none; font-weight:bold; font-size:1.1rem; width:85%;">
                   <textarea style="width:100%; flex-grow:1; border:none; outline:none; resize:none; margin-top:10px;" placeholder="Start writing..."></textarea>`;
        w = 3; h = 4;
    } 
    else if (type === 'table') {
        content = `<h3 contenteditable="true" style="margin:0; outline:none;">Untitled Table</h3>
                   <div style="overflow:auto; flex-grow:1;">
                    <table style="width:100%; border-collapse:collapse; margin-top:10px;">
                        <tr><th style="border:1px solid #ddd; padding:8px;">Item</th><th style="border:1px solid #ddd; padding:8px;">Status</th></tr>
                        <tr><td contenteditable="true" style="border:1px solid #ddd; padding:8px;"></td><td contenteditable="true" style="border:1px solid #ddd; padding:8px;"></td></tr>
                    </table>
                   </div>
                   <button class="row-btn" style="margin-top:10px; border:1px dashed #ccc; background:none; width:100%; cursor:pointer;">+ Row</button>`;
        w = 4; h = 5;
    }
    else if (type === 'embed') {
        const url = prompt("Paste your link here (YouTube, Spotify, or Web):");
        if (!url) return;
        // Fixes YouTube/Spotify links automatically
        let cleanUrl = url.replace("watch?v=", "embed/").replace("playlist/", "embed/playlist/");
        content = `<iframe src="${cleanUrl}" style="width:100%; height:100%; border:none; border-radius:8px;"></iframe>`;
        w = 6; h = 5;
    }

    // Gridstack requires this specific <div> nesting to make items draggable
    const el = `<div>
                    <div class="grid-stack-item-content">
                        <button class="delete-btn" onclick="grid.removeWidget(this.parentElement.parentElement)">✕</button>
                        ${content}
                    </div>
                </div>`;
    
    grid.addWidget(el, {w: w, h: h});
}

// 3. Keep tables interactive by allowing row additions
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('row-btn')) {
        const table = e.target.previousElementSibling.querySelector('table');
        const row = table.insertRow(-1);
        row.innerHTML = '<td contenteditable="true" style="border:1px solid #ddd; padding:8px;"></td><td contenteditable="true" style="border:1px solid #ddd; padding:8px;"></td>';
    }
});
