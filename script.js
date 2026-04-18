// 1. Setup the Grid when the page loads
let grid;

window.onload = function() {
    grid = GridStack.init({
        float: true,          // Blocks stay exactly where you drop them
        cellHeight: 70,       // Height of one grid unit
        margin: 12,           // Clean space between blocks
        animate: true,        // Smooth sliding animations
        resizable: { handles: 'all' } // Can resize from any side
    });
    console.log("Grid ready to build!");
};

// 2. Add New Blocks (The xTiles way)
function addNewBlock(type) {
    if (!grid) return; // Safety check

    let htmlBody = '';
    let w = 4, h = 4;

    if (type === 'text') {
        htmlBody = `
            <input type="text" placeholder="Title" style="border:none; outline:none; font-weight:700; font-size:1.1rem; width:85%; background:transparent;">
            <textarea placeholder="Start writing..." style="width:100%; flex-grow:1; border:none; outline:none; resize:none; margin-top:10px; font-family:inherit; background:transparent;"></textarea>`;
        w = 3; h = 4;
    } 
    else if (type === 'embed') {
        const url = prompt("Paste YouTube or Spotify link:");
        if (!url) return;
        // Simple fix for common embed links
        const finalUrl = url.replace("watch?v=", "embed/").replace("playlist/", "embed/playlist/");
        htmlBody = `<iframe src="${finalUrl}" style="width:100%; height:100%; border:none; border-radius:8px;"></iframe>`;
        w = 6; h = 5;
    }
    else if (type === 'image') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = e => {
            const reader = new FileReader();
            reader.onload = ev => {
                grid.addWidget({
                    w: 4, h: 4,
                    content: `
                        <button class="delete-btn" onclick="grid.removeWidget(this.parentElement.parentElement)">✕</button>
                        <img src="${ev.target.result}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`
                });
            };
            reader.readAsDataURL(e.target.files[0]);
        };
        input.click();
        return;
    }

    // This is the specific way GridStack v10 wants new widgets
    grid.addWidget({
        w: w, 
        h: h,
        content: `
            <button class="delete-btn" onclick="grid.removeWidget(this.parentElement.parentElement)">✕</button>
            <div style="display:flex; flex-direction:column; height:100%;">
                ${htmlBody}
            </div>`
    });
}

// 3. Save the layout to a file
function saveBoard() {
    const data = grid.save(true); // Captures positions and inner HTML
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'my-dashboard.json';
    a.click();
}

// 4. Load a layout from a file
function loadBoard(input) {
    const reader = new FileReader();
    reader.onload = function() {
        const data = JSON.parse(reader.result);
        grid.removeAll(); 
        data.forEach(item => {
            grid.addWidget(item);
        });
    };
    reader.readAsText(input.files[0]);
}

