// Snapshot button logic
document.addEventListener('DOMContentLoaded', function() {
    const snapshotBtn = document.getElementById('snapshotBtn');
    if (snapshotBtn) {
        snapshotBtn.addEventListener('click', function() {
            const previewBox = document.getElementById('preview-box');
            if (typeof html2canvas !== 'function') {
                alert('Snapshot feature requires html2canvas.');
                return;
            }
            setTimeout(() => {
                html2canvas(previewBox, {backgroundColor: null, useCORS: true, logging: true, scale: 2}).then(canvas => {
                    // Show preview modal
                    let modal = document.getElementById('snapshot-modal');
                    if (!modal) {
                        modal = document.createElement('div');
                        modal.id = 'snapshot-modal';
                        modal.style.position = 'fixed';
                        modal.style.top = '0';
                        modal.style.left = '0';
                        modal.style.width = '100vw';
                        modal.style.height = '100vh';
                        modal.style.background = 'rgba(0,0,0,0.7)';
                        modal.style.display = 'flex';
                        modal.style.alignItems = 'center';
                        modal.style.justifyContent = 'center';
                        modal.style.zIndex = '9999';
                        modal.innerHTML = `
                            <div style="background:#fff;padding:24px;border-radius:8px;box-shadow:0 2px 16px #0005;text-align:center;max-width:90vw;max-height:90vh;overflow:auto;">
                                <h2 style='margin-top:0'>Preview Snapshot</h2>
                                <img id="snapshot-img" style="max-width:100%;max-height:50vh;border:1px solid #ccc;" />
                                <div style="margin-top:18px;">
                                    <button id="saveSnapshotBtn" style="margin-right:16px;">Save</button>
                                    <button id="cancelSnapshotBtn">Cancel</button>
                                </div>
                            </div>
                        `;
                        document.body.appendChild(modal);
                    }
                    const img = modal.querySelector('#snapshot-img');
                    img.src = canvas.toDataURL('image/png');
                    modal.style.display = 'flex';
                    // Save button
                    modal.querySelector('#saveSnapshotBtn').onclick = function() {
                        const link = document.createElement('a');
                        link.download = 'wallet-preview.png';
                        link.href = img.src;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        modal.style.display = 'none';
                    };
                    // Cancel button
                    modal.querySelector('#cancelSnapshotBtn').onclick = function() {
                        modal.style.display = 'none';
                    };
                });
            }, 100);
        });
    }
});



// Arrow key movement for active line
document.addEventListener('keydown', e => {
    if (dragActive && draggingIdx !== null && lines[draggingIdx]) {
        let moved = false;
        if (e.key === 'ArrowLeft') { lines[draggingIdx].x = Math.max(0, lines[draggingIdx].x - 1); moved = true; }
        if (e.key === 'ArrowRight') { lines[draggingIdx].x = Math.min(100, lines[draggingIdx].x + 1); moved = true; }
        if (e.key === 'ArrowUp') { lines[draggingIdx].y = Math.max(0, lines[draggingIdx].y - 1); moved = true; }
        if (e.key === 'ArrowDown') { lines[draggingIdx].y = Math.min(100, lines[draggingIdx].y + 1); moved = true; }
        if (moved) { updatePreview(); e.preventDefault(); }
    }
});
let draggingIdx = null;
let dragActive = false;
function toggleDrag(idx) {
    if (dragActive && draggingIdx === idx) {
        dragActive = false;
        draggingIdx = null;
        document.body.style.userSelect = '';
    } else {
        dragActive = true;
        draggingIdx = idx;
        document.body.style.userSelect = 'none';
    }
    renderLinesInputs();
}
// ...existing code...
// Font options (web-safe, cursive, and Google Fonts)
const fonts = [
    { name: 'Arial', css: 'Arial, sans-serif' },
    { name: 'Courier New', css: 'Courier New, Courier, monospace' },
    { name: 'Georgia', css: 'Georgia, serif' },
    { name: 'Impact', css: 'Impact, Charcoal, sans-serif' },
    { name: 'Lucida Console', css: 'Lucida Console, Monaco, monospace' },
    { name: 'Tahoma', css: 'Tahoma, Geneva, sans-serif' },
    { name: 'Times New Roman', css: 'Times New Roman, Times, serif' },
    { name: 'Trebuchet MS', css: 'Trebuchet MS, Helvetica, sans-serif' },
    { name: 'Verdana', css: 'Verdana, Geneva, sans-serif' },
    { name: 'Comic Sans MS', css: 'Comic Sans MS, cursive, sans-serif' },
    { name: 'Dancing Script', css: 'Dancing Script, cursive' },
    { name: 'Pacifico', css: 'Pacifico, cursive' },
    { name: 'Brush Script MT', css: 'Brush Script MT, cursive' },
];

// Optionally load Google Fonts for cursive fonts
const googleFonts = [
    'Dancing+Script:400,700',
    'Pacifico',
];
if (!document.getElementById('google-fonts')) {
    const link = document.createElement('link');
    link.id = 'google-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css?family=' + googleFonts.join('|').replace(/ /g, '+');
    document.head.appendChild(link);
}

function populateFontSelect(select) {
    fonts.forEach(font => {
        const option = document.createElement('option');
        option.value = font.css;
        option.textContent = font.name;
        select.appendChild(option);
    });
}

// Dynamic lines logic
const defaultFontSize = 2.0;
const minFontSize = 1.0;
const maxFontSize = 5.0;
const maxLines = 5;
let lines = [];

const linesContainer = document.getElementById('linesContainer');
const previewLines = document.getElementById('previewLines');
const entryGroup = document.getElementById('entry-group-template');
const textInput = document.getElementById('textInput');
const fontSelect = document.getElementById('fontSelect');
const fontMinus = document.getElementById('fontMinus');
const fontPlus = document.getElementById('fontPlus');
const fontSizeLabel = document.getElementById('fontSizeLabel');
const addLineBtn = document.getElementById('addLineBtn');

populateFontSelect(fontSelect);
let currentFontSize = defaultFontSize;
fontSizeLabel.textContent = currentFontSize.toFixed(1);

function updatePreview() {
    previewLines.innerHTML = '';
    previewLines.style.position = 'absolute';
    previewLines.style.left = '0';
    previewLines.style.top = '0';
    previewLines.style.width = '100%';
    previewLines.style.height = '100%';
    const n = lines.length;
    const spacing = 12; // percent spacing between lines
    const baseY = 50;
    const startY = baseY - ((n - 1) * spacing) / 2;
    lines.forEach((line, idx) => {
        const div = document.createElement('div');
        div.className = 'preview-line';
        div.style.fontFamily = line.font;
        div.style.fontSize = line.size + 'rem';
        div.textContent = line.text;
        div.style.position = 'absolute';
        // Use x and y for moved lines, otherwise center
        if (dragActive && draggingIdx === idx) {
            div.style.left = lines[idx].x + '%';
            div.style.top = lines[idx].y + '%';
        } else {
            div.style.left = '50%';
            div.style.top = (startY + idx * spacing) + '%';
        }
        div.style.transform = 'translate(-50%, -50%)';
        div.setAttribute('data-idx', idx);
        previewLines.appendChild(div);
    });
}

function addLine(text, font, size) {
    if (lines.length >= maxLines) return;
    lines.push({ text, font, size, x: 50, y: 50 });
    updatePreview();
    renderLinesInputs();
}

function removeLine(idx) {
    lines.splice(idx, 1);
    updatePreview();
    renderLinesInputs();
}

function renderLinesInputs() {
    linesContainer.innerHTML = '';
    lines.forEach((line, idx) => {
        const group = document.createElement('div');
        group.className = 'entry-group';

        const label = document.createElement('label');
        label.textContent = `Line ${idx + 1}`;
        group.appendChild(label);

        const input = document.createElement('input');
        input.type = 'text';
        input.value = line.text;
        input.placeholder = 'Type your text here';
        input.addEventListener('input', e => {
            lines[idx].text = e.target.value;
            updatePreview();
        });
        group.appendChild(input);

        const fontLabel = document.createElement('label');
        fontLabel.textContent = 'Font:';
        group.appendChild(fontLabel);

        const select = document.createElement('select');
        populateFontSelect(select);
        select.value = line.font;
        select.addEventListener('change', e => {
            lines[idx].font = e.target.value;
            updatePreview();
        });
        group.appendChild(select);

        const sizeDiv = document.createElement('div');
        sizeDiv.style.marginTop = '4px';
        const minusBtn = document.createElement('button');
        minusBtn.type = 'button';
        minusBtn.textContent = '-';
        minusBtn.addEventListener('click', () => {
            if (lines[idx].size > minFontSize) {
                lines[idx].size = Math.max(minFontSize, lines[idx].size - 0.1);
                renderLinesInputs();
                updatePreview();
            }
        });
        sizeDiv.appendChild(minusBtn);
        const sizeLabel = document.createElement('span');
        sizeLabel.style.margin = '0 8px';
        sizeLabel.textContent = lines[idx].size.toFixed(1);
        sizeDiv.appendChild(sizeLabel);
        const plusBtn = document.createElement('button');
        plusBtn.type = 'button';
        plusBtn.textContent = '+';
        plusBtn.addEventListener('click', () => {
            if (lines[idx].size < maxFontSize) {
                lines[idx].size = Math.min(maxFontSize, lines[idx].size + 0.1);
                renderLinesInputs();
                updatePreview();
            }
        });
        sizeDiv.appendChild(plusBtn);
        group.appendChild(sizeDiv);


    const moveBtn = document.createElement('button');
    moveBtn.type = 'button';
    moveBtn.textContent = (dragActive && draggingIdx === idx) ? 'Stop Move' : 'Move';
    moveBtn.style.marginLeft = '16px';
    moveBtn.addEventListener('click', () => toggleDrag(idx));
    group.appendChild(moveBtn);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.style.marginLeft = '24px';
    removeBtn.addEventListener('click', () => removeLine(idx));
    group.appendChild(removeBtn);

        linesContainer.appendChild(group);
    });
    // Hide the template entry if there are lines
    entryGroup.style.display = lines.length < maxLines ? '' : 'none';
}

addLineBtn.addEventListener('click', () => {
    if (lines.length < maxLines) {
        addLine(textInput.value, fontSelect.value, currentFontSize);
        textInput.value = '';
        fontSelect.value = fonts[0].css;
        currentFontSize = defaultFontSize;
        fontSizeLabel.textContent = currentFontSize.toFixed(1);
    }
});

fontMinus.addEventListener('click', () => {
    if (currentFontSize > minFontSize) {
        currentFontSize = Math.max(minFontSize, currentFontSize - 0.1);
        fontSizeLabel.textContent = currentFontSize.toFixed(1);
    }
});
fontPlus.addEventListener('click', () => {
    if (currentFontSize < maxFontSize) {
        currentFontSize = Math.min(maxFontSize, currentFontSize + 0.1);
        fontSizeLabel.textContent = currentFontSize.toFixed(1);
    }
});

// Initial state
renderLinesInputs();
updatePreview();