// ========== SAMPLE DECKS (loaded on first visit) ==========
const SAMPLE_DECKS = {
    "APUSH": [
        { q: "What was the Proclamation of 1763?", a: "British order that prohibited colonial settlement west of the Appalachian Mountains after the French and Indian War" },
        { q: "What did the Stamp Act (1765) do?", a: "Taxed all printed materials in the colonies (newspapers, legal documents, playing cards)" },
        { q: "What was the Boston Massacre (1770)?", a: "British soldiers killed 5 colonists in Boston, used as propaganda by patriots like Samuel Adams" },
        { q: "What were the Intolerable Acts (1774)?", a: "Punitive laws passed after the Boston Tea Party: closed Boston Harbor, limited self-government, forced quartering of soldiers" },
        { q: "What was the significance of Lexington and Concord (1775)?", a: "First military engagements of the American Revolution — 'the shot heard round the world'" },
        { q: "Who wrote Common Sense (1776)?", a: "Thomas Paine — argued for complete independence from Britain, persuaded many colonists" },
        { q: "What was the Declaration of Independence based on?", a: "John Locke's natural rights philosophy — life, liberty, and the pursuit of happiness" },
        { q: "What was the Articles of Confederation?", a: "First US government (1781-1789) — weak central government, no power to tax, no executive branch" },
        { q: "What was Shays' Rebellion (1786)?", a: "Armed uprising by Massachusetts farmers over debt and taxes — showed weakness of Articles of Confederation" },
        { q: "What was the Great Compromise?", a: "Created a bicameral Congress: Senate (equal representation) and House of Representatives (based on population)" },
    ],
    "Korean": [
        { q: "Hello (formal)", a: "안녕하세요 (annyeonghaseyo)" },
        { q: "Thank you", a: "감사합니다 (gamsahamnida)" },
        { q: "Yes", a: "네 (ne)" },
        { q: "No", a: "아니요 (aniyo)" },
        { q: "I'm sorry", a: "죄송합니다 (joesonghamnida)" },
        { q: "Goodbye (to someone leaving)", a: "안녕히 가세요 (annyeonghi gaseyo)" },
        { q: "Goodbye (to someone staying)", a: "안녕히 계세요 (annyeonghi gyeseyo)" },
        { q: "Nice to meet you", a: "만나서 반갑습니다 (mannaseo bangapseumnida)" },
        { q: "What is your name?", a: "이름이 뭐예요? (ireumi mwoyeyo?)" },
        { q: "My name is ___", a: "제 이름은 ___ 입니다 (je ireumeun ___ imnida)" },
    ],
    "Calc AB": [
        { q: "What is the Power Rule?", a: "d/dx [xⁿ] = nxⁿ⁻¹" },
        { q: "What is the derivative of sin(x)?", a: "cos(x)" },
        { q: "What is the derivative of cos(x)?", a: "-sin(x)" },
        { q: "What is the derivative of eˣ?", a: "eˣ" },
        { q: "What is the derivative of ln(x)?", a: "1/x" },
        { q: "What is the Chain Rule?", a: "d/dx [f(g(x))] = f'(g(x)) · g'(x)" },
        { q: "What is the Product Rule?", a: "d/dx [f·g] = f'g + fg'" },
        { q: "What is the Quotient Rule?", a: "d/dx [f/g] = (f'g - fg') / g²" },
        { q: "Limit definition of a derivative?", a: "f'(x) = lim h→0 [f(x+h) - f(x)] / h" },
        { q: "What is the derivative of tan(x)?", a: "sec²(x)" },
    ],
    "Chemistry": [
        { q: "What are the products of combustion of a hydrocarbon?", a: "CO₂ + H₂O" },
        { q: "What is the pattern for a synthesis reaction?", a: "A + B → AB (two things combine into one)" },
        { q: "What is the pattern for decomposition?", a: "AB → A + B (one thing breaks into two or more)" },
        { q: "What is the pattern for single replacement?", a: "A + BC → AC + B (element swaps into a compound)" },
        { q: "What is the pattern for double replacement?", a: "AB + CD → AD + CB (two compounds swap partners)" },
        { q: "What is neutralization?", a: "Acid + Base → Water + Salt" },
        { q: "What does a negative ΔH mean?", a: "Exothermic reaction (energy is released)" },
        { q: "What does a positive ΔH mean?", a: "Endothermic reaction (energy is absorbed)" },
        { q: "What does increasing surface area do to reaction rate?", a: "Increases it — more area for collisions to happen" },
        { q: "What does a catalyst do?", a: "Lowers the activation energy — does NOT get used up in the reaction" },
    ],
};

const FOLDER_COLORS = ["#e94560", "#6c5ce7", "#00b894", "#fdcb6e", "#e17055", "#0984e3", "#d63031", "#00cec9"];

// ========== STATE ==========
let decks = {};
let currentDeckName = null;
let currentCards = [];
let currentIndex = 0;
let isFlipped = false;
let rightCount = 0;
let wrongCount = 0;
let wrongCards = [];
let reviewMode = false;
let stats = { streak: 0, bestStreak: 0, lastStudyDate: null };
let deckFolders = {};       // { "Korean": "Languages", ... }
let folderColors = {};      // { "Languages": "#6c5ce7", ... }
let deckStats = {};         // { "APUSH": { studied: 5, correct: 3 }, ... }
let currentFolder = "All";
let learnActive = false;
let learnState = {};
let sidebarOpen = false;
let markedCards = new Set(); // tracks which card indices have been marked in current session
let draggedDeckName = null;  // for drag-and-drop
let editingFolder = null;    // folder name being edited

// ========== LOCAL STORAGE ==========
function saveDecks() { localStorage.setItem("fc-decks", JSON.stringify(decks)); }
function loadDecks() {
    const saved = localStorage.getItem("fc-decks");
    if (saved) { decks = JSON.parse(saved); }
    else { decks = JSON.parse(JSON.stringify(SAMPLE_DECKS)); saveDecks(); }
}
function saveStats() { localStorage.setItem("fc-stats", JSON.stringify(stats)); }
function loadStats() {
    const saved = localStorage.getItem("fc-stats");
    if (saved) stats = JSON.parse(saved);
    const today = getTodayDate(), yesterday = getYesterdayDate();
    if (stats.lastStudyDate !== today && stats.lastStudyDate !== yesterday) stats.streak = 0;
    saveStats();
}
function saveDeckStats() { localStorage.setItem("fc-deck-stats", JSON.stringify(deckStats)); }
function loadDeckStats() {
    const saved = localStorage.getItem("fc-deck-stats");
    if (saved) deckStats = JSON.parse(saved);
}
function saveFolders() { localStorage.setItem("fc-folders", JSON.stringify(deckFolders)); }
function loadFolders() {
    const saved = localStorage.getItem("fc-folders");
    if (saved) deckFolders = JSON.parse(saved);
}
function saveFolderColors() { localStorage.setItem("fc-folder-colors", JSON.stringify(folderColors)); }
function loadFolderColors() {
    const saved = localStorage.getItem("fc-folder-colors");
    if (saved) folderColors = JSON.parse(saved);
}
function getTodayDate() { return new Date().toISOString().split("T")[0]; }
function getYesterdayDate() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split("T")[0]; }
function saveTheme(theme) { localStorage.setItem("fc-theme", theme); }
function loadTheme() { return localStorage.getItem("fc-theme") || "dark"; }

// ========== THEME ==========
function toggleTheme() {
    const html = document.documentElement;
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    document.getElementById("theme-toggle").textContent = next === "dark" ? "\u{1F4A1}" : "\u{2600}\u{FE0F}";
    saveTheme(next);
}
function applyTheme() {
    const theme = loadTheme();
    document.documentElement.setAttribute("data-theme", theme);
    document.getElementById("theme-toggle").textContent = theme === "dark" ? "\u{1F4A1}" : "\u{2600}\u{FE0F}";
}

// ========== SIDEBAR ==========
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    sidebarOpen = !sidebarOpen;
    sidebar.classList.toggle("open", sidebarOpen);
    if (overlay) overlay.classList.toggle("active", sidebarOpen);
}

function closeSidebar() {
    sidebarOpen = false;
    document.getElementById("sidebar").classList.remove("open");
    const overlay = document.getElementById("sidebar-overlay");
    if (overlay) overlay.classList.remove("active");
}

// ========== FOLDERS ==========
function getFolderNames() { return [...new Set(Object.values(deckFolders))].sort(); }
function getFolderColor(name) { return folderColors[name] || "#e94560"; }

function renderFolderBar() {
    const container = document.getElementById("sidebar-folders");
    const folderNames = getFolderNames();
    container.innerHTML = "";

    if (folderNames.length === 0) return;

    const allBtn = document.createElement("button");
    allBtn.className = "folder-btn" + (currentFolder === "All" ? " active" : "");
    allBtn.textContent = "All";
    allBtn.onclick = () => switchFolder("All");
    // Drop zone: remove folder
    allBtn.ondragover = (e) => { e.preventDefault(); };
    container.appendChild(allBtn);

    folderNames.forEach((name) => {
        const btn = document.createElement("button");
        btn.className = "folder-btn" + (currentFolder === name ? " active" : "");
        const color = getFolderColor(name);
        btn.innerHTML = '<span class="folder-color-dot" style="background:' + color + '"></span>' + escapeHtml(name);
        btn.onclick = () => switchFolder(name);
        btn.oncontextmenu = (e) => { e.preventDefault(); openFolderEdit(name); };
        // Drop zone
        btn.ondragover = (e) => { e.preventDefault(); btn.classList.add("drag-over"); };
        btn.ondragleave = () => { btn.classList.remove("drag-over"); };
        btn.ondrop = (e) => {
            e.preventDefault(); btn.classList.remove("drag-over");
            if (draggedDeckName) { deckFolders[draggedDeckName] = name; saveFolders(); renderAll(); }
        };
        container.appendChild(btn);
    });

    // "No Folder" drop zone
    const noBtn = document.createElement("span");
    noBtn.className = "folder-no-folder";
    noBtn.textContent = "No Folder";
    noBtn.ondragover = (e) => { e.preventDefault(); noBtn.classList.add("drag-over"); };
    noBtn.ondragleave = () => { noBtn.classList.remove("drag-over"); };
    noBtn.ondrop = (e) => {
        e.preventDefault(); noBtn.classList.remove("drag-over");
        if (draggedDeckName) { delete deckFolders[draggedDeckName]; saveFolders(); renderAll(); }
    };
    container.appendChild(noBtn);

    const newBtn = document.createElement("button");
    newBtn.className = "folder-new-btn";
    newBtn.textContent = "+ Folder";
    newBtn.onclick = () => {
        const name = prompt("Folder name:");
        if (name && name.trim()) {
            if (!folderColors[name.trim()]) folderColors[name.trim()] = FOLDER_COLORS[getFolderNames().length % FOLDER_COLORS.length];
            saveFolderColors();
            switchFolder(name.trim());
        }
    };
    container.appendChild(newBtn);
}

function switchFolder(name) {
    currentFolder = name;
    renderAll();
}

function getVisibleDeckNames() {
    return Object.keys(decks).filter((name) => {
        if (currentFolder === "All") return true;
        return (deckFolders[name] || "") === currentFolder;
    });
}

function populateFolderSelect() {
    const select = document.getElementById("deck-folder-select");
    const cur = deckFolders[currentDeckName] || "";
    const names = getFolderNames();
    select.innerHTML = '<option value="">None</option>';
    names.forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name; opt.textContent = name;
        if (name === cur) opt.selected = true;
        select.appendChild(opt);
    });
}

function assignDeckFolder() {
    const folder = document.getElementById("deck-folder-select").value;
    if (folder) deckFolders[currentDeckName] = folder;
    else delete deckFolders[currentDeckName];
    saveFolders(); renderAll();
}

function createFolderFromManage() {
    const name = prompt("New folder name:");
    if (!name || !name.trim()) return;
    deckFolders[currentDeckName] = name.trim();
    if (!folderColors[name.trim()]) folderColors[name.trim()] = FOLDER_COLORS[getFolderNames().length % FOLDER_COLORS.length];
    saveFolders(); saveFolderColors(); populateFolderSelect(); renderAll();
}

// ========== FOLDER EDIT (rename, color, delete) ==========
function openFolderEdit(folderName) {
    editingFolder = folderName;
    document.getElementById("folder-edit-name").value = folderName;
    renderColorPicker(getFolderColor(folderName));
    openModal("folder-edit-modal");
}

function renderColorPicker(selectedColor) {
    const container = document.getElementById("color-options");
    container.innerHTML = "";
    FOLDER_COLORS.forEach((color) => {
        const swatch = document.createElement("div");
        swatch.className = "color-swatch" + (color === selectedColor ? " selected" : "");
        swatch.style.background = color;
        swatch.onclick = () => {
            container.querySelectorAll(".color-swatch").forEach((s) => s.classList.remove("selected"));
            swatch.classList.add("selected");
        };
        container.appendChild(swatch);
    });
}

function saveFolderEdit() {
    const newName = document.getElementById("folder-edit-name").value.trim();
    if (!newName) return;
    const selectedSwatch = document.querySelector("#color-options .color-swatch.selected");
    const newColor = selectedSwatch ? selectedSwatch.style.background : getFolderColor(editingFolder);

    // Rename: update all decks that reference the old folder
    if (newName !== editingFolder) {
        for (const deckName in deckFolders) {
            if (deckFolders[deckName] === editingFolder) deckFolders[deckName] = newName;
        }
        delete folderColors[editingFolder];
        if (currentFolder === editingFolder) currentFolder = newName;
    }
    folderColors[newName] = newColor;
    saveFolders(); saveFolderColors();
    closeModal("folder-edit-modal");
    renderAll();
}

function deleteFolder() {
    if (!editingFolder) return;
    if (!confirm('Delete folder "' + editingFolder + '"? Decks will be moved out of the folder.')) return;
    for (const deckName in deckFolders) {
        if (deckFolders[deckName] === editingFolder) delete deckFolders[deckName];
    }
    delete folderColors[editingFolder];
    if (currentFolder === editingFolder) currentFolder = "All";
    saveFolders(); saveFolderColors();
    closeModal("folder-edit-modal");
    renderAll();
}

// ========== SIDEBAR DECK LIST (with drag) ==========
function renderSidebar() {
    const container = document.getElementById("sidebar-decks");
    container.innerHTML = "";
    getVisibleDeckNames().forEach((name) => {
        const item = document.createElement("div");
        item.className = "deck-item" + (name === currentDeckName ? " active" : "");
        item.draggable = true;
        item.innerHTML = '<span>' + escapeHtml(name) + '</span><span class="deck-item-count">' + decks[name].length + '</span>';
        item.onclick = () => { switchDeck(name); closeSidebar(); };
        // Drag events
        item.ondragstart = (e) => {
            draggedDeckName = name;
            item.classList.add("dragging");
            e.dataTransfer.effectAllowed = "move";
        };
        item.ondragend = () => { draggedDeckName = null; item.classList.remove("dragging"); };
        container.appendChild(item);
    });
}

// ========== HOME VIEW ==========
function renderHomeGrid() {
    const container = document.getElementById("home-deck-grid");
    container.innerHTML = "";
    getVisibleDeckNames().forEach((name) => {
        const card = document.createElement("div");
        card.className = "home-deck-card";
        card.onclick = () => { switchDeck(name); closeSidebar(); };
        const folder = deckFolders[name];
        const color = folder ? getFolderColor(folder) : null;
        card.innerHTML =
            '<span class="home-deck-card-name">' + escapeHtml(name) + '</span>' +
            '<div class="home-deck-card-info">' +
            '<span class="home-deck-card-count">' + decks[name].length + ' card' + (decks[name].length !== 1 ? 's' : '') + '</span>' +
            (folder ? '<span class="home-deck-card-folder" style="background:' + color + '22; color:' + color + '">' + escapeHtml(folder) + '</span>' : '') +
            '</div>';
        container.appendChild(card);
    });

    const newCard = document.createElement("div");
    newCard.className = "home-new-deck-card";
    newCard.textContent = "+ New Deck";
    newCard.onclick = () => openModal("create-deck-modal");
    container.appendChild(newCard);
}

function showHomeView() {
    exitLearnMode();
    currentDeckName = null;
    currentCards = [];
    document.getElementById("home-view").classList.remove("hidden");
    document.getElementById("study-view").classList.add("hidden");
    renderSidebar();
    renderHomeGrid();
}

function showStudyView() {
    document.getElementById("home-view").classList.add("hidden");
    document.getElementById("study-view").classList.remove("hidden");
    document.getElementById("study-deck-name").textContent = currentDeckName;
}

// Helper to re-render everything
function renderAll() {
    renderFolderBar();
    renderSidebar();
    renderHomeGrid();
}

// ========== DECK MANAGEMENT ==========
function switchDeck(name) {
    if (!decks[name]) return;
    exitLearnMode();
    currentDeckName = name; currentCards = decks[name]; currentIndex = 0;
    isFlipped = false; rightCount = 0; wrongCount = 0; wrongCards = []; reviewMode = false;
    markedCards = new Set();
    document.getElementById("right-count").textContent = 0;
    document.getElementById("wrong-count").textContent = 0;
    document.getElementById("review-label").style.display = "none";
    document.getElementById("review-btn").classList.remove("active");
    updateReviewButton(); renderSidebar(); showStudyView(); updateCard(); renderStats();
}

function createDeck() {
    const input = document.getElementById("new-deck-name");
    const name = input.value.trim();
    if (!name) return;
    if (decks[name]) { alert("A deck with this name already exists!"); return; }
    decks[name] = []; saveDecks();
    if (currentFolder !== "All") { deckFolders[name] = currentFolder; saveFolders(); }
    input.value = ""; closeModal("create-deck-modal"); switchDeck(name); openManageModal();
}

function deleteDeck() {
    if (!currentDeckName) return;
    if (!confirm('Delete "' + currentDeckName + '" and all its cards?')) return;
    delete deckFolders[currentDeckName]; saveFolders();
    delete deckStats[currentDeckName]; saveDeckStats();
    delete decks[currentDeckName]; saveDecks(); closeModal("manage-modal");
    showHomeView();
}

// ========== CARD MANAGEMENT ==========
function openManageModal() {
    if (!currentDeckName) return;
    document.getElementById("manage-deck-name").textContent = currentDeckName;
    populateFolderSelect(); renderCardList(); cancelEdit(); openModal("manage-modal");
}

function renderCardList() {
    const container = document.getElementById("card-list");
    const cards = decks[currentDeckName];
    if (cards.length === 0) { container.innerHTML = '<p class="empty-message">No cards yet. Add some below!</p>'; return; }
    container.innerHTML = cards.map((card, i) =>
        '<div class="card-list-item"><span class="card-list-text">' + (i + 1) + ". " + escapeHtml(card.q) +
        '</span><div class="card-list-actions"><button class="edit-btn" onclick="editCard(' + i +
        ')">Edit</button><button class="delete-btn" onclick="deleteCard(' + i + ')">Delete</button></div></div>'
    ).join("");
}

function saveCard() {
    const q = document.getElementById("card-question").value.trim();
    const a = document.getElementById("card-answer").value.trim();
    const editIndex = parseInt(document.getElementById("edit-card-index").value);
    if (!q || !a) return;
    if (editIndex >= 0) decks[currentDeckName][editIndex] = { q, a };
    else decks[currentDeckName].push({ q, a });
    saveDecks(); cancelEdit(); renderCardList(); renderSidebar(); renderHomeGrid();
    if (!reviewMode) { currentCards = decks[currentDeckName];
        if (currentIndex >= currentCards.length) currentIndex = Math.max(0, currentCards.length - 1);
        updateCard(); renderStats(); }
}

function editCard(index) {
    const card = decks[currentDeckName][index];
    document.getElementById("card-question").value = card.q;
    document.getElementById("card-answer").value = card.a;
    document.getElementById("edit-card-index").value = index;
    document.getElementById("card-form-title").textContent = "Editing Card " + (index + 1);
    document.getElementById("cancel-edit-btn").style.display = "inline-block";
    document.getElementById("card-question").focus();
}

function cancelEdit() {
    document.getElementById("card-question").value = "";
    document.getElementById("card-answer").value = "";
    document.getElementById("edit-card-index").value = "-1";
    document.getElementById("card-form-title").textContent = "Add New Card";
    document.getElementById("cancel-edit-btn").style.display = "none";
}

function deleteCard(index) {
    decks[currentDeckName].splice(index, 1); saveDecks(); renderCardList(); renderSidebar(); renderHomeGrid();
    if (!reviewMode) {
        if (currentIndex >= currentCards.length) currentIndex = Math.max(0, currentCards.length - 1);
        if (currentCards.length > 0) updateCard();
        else { document.getElementById("question").textContent = "No cards in this deck";
            document.getElementById("answer").textContent = "Add cards via Manage Deck";
            document.getElementById("total-cards").textContent = "0";
            document.getElementById("current-card").textContent = "0"; }
        renderStats();
    }
}

function escapeHtml(text) { const div = document.createElement("div"); div.textContent = text; return div.innerHTML; }

// ========== STUDY FUNCTIONS ==========
function flipCard() { if (currentCards.length === 0) return; isFlipped = !isFlipped; document.getElementById("flashcard").classList.toggle("flipped"); }

function updateCard() {
    if (currentCards.length === 0) {
        document.getElementById("question").textContent = "No cards in this deck";
        document.getElementById("answer").textContent = "Add cards via Manage Deck";
        document.getElementById("total-cards").textContent = "0";
        document.getElementById("current-card").textContent = "0"; return;
    }
    const card = currentCards[currentIndex];
    isFlipped = false; document.getElementById("flashcard").classList.remove("flipped");
    document.getElementById("question").textContent = card.q;
    document.getElementById("answer").textContent = card.a;
    document.getElementById("current-card").textContent = currentIndex + 1;
    document.getElementById("total-cards").textContent = currentCards.length;
}

function nextCard() { if (currentCards.length === 0) return; if (currentIndex < currentCards.length - 1) { currentIndex++; updateCard(); } }
function prevCard() { if (currentCards.length === 0) return; if (currentIndex > 0) { currentIndex--; updateCard(); } }

function markRight() {
    if (currentCards.length === 0) return;
    if (markedCards.has(currentIndex)) return; // already marked this card
    markedCards.add(currentIndex);
    rightCount++; document.getElementById("right-count").textContent = rightCount;
    recordStudy(true);
    nextCard();
}
function markWrong() {
    if (currentCards.length === 0) return;
    if (markedCards.has(currentIndex)) return; // already marked this card
    markedCards.add(currentIndex);
    wrongCount++;
    document.getElementById("wrong-count").textContent = wrongCount;
    const card = currentCards[currentIndex];
    if (!wrongCards.some((c) => c.q === card.q && c.a === card.a)) wrongCards.push(card);
    updateReviewButton(); recordStudy(false);
    nextCard();
}

function shuffleDeck() {
    if (currentCards.length === 0) return;
    for (let i = currentCards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [currentCards[i], currentCards[j]] = [currentCards[j], currentCards[i]]; }
    currentIndex = 0; markedCards = new Set(); updateCard();
}

// ========== REVIEW WRONG ==========
function toggleReviewMode() {
    if (reviewMode) { reviewMode = false; currentCards = decks[currentDeckName]; currentIndex = 0;
        markedCards = new Set();
        document.getElementById("review-label").style.display = "none";
        document.getElementById("review-btn").classList.remove("active"); updateCard();
    } else { if (wrongCards.length === 0) return; reviewMode = true; currentCards = [...wrongCards]; currentIndex = 0;
        markedCards = new Set();
        document.getElementById("review-label").style.display = "inline";
        document.getElementById("review-btn").classList.add("active"); updateCard(); }
}
function updateReviewButton() {
    document.getElementById("wrong-review-count").textContent = wrongCards.length;
    document.getElementById("review-btn").style.display = wrongCards.length > 0 ? "inline-block" : "none";
}

// ========== STATS ==========
function getDeckStat(deckName) {
    if (!deckStats[deckName]) deckStats[deckName] = { studied: 0, correct: 0 };
    return deckStats[deckName];
}

function recordStudy(correct) {
    const today = getTodayDate(), yesterday = getYesterdayDate();
    if (stats.lastStudyDate !== today) {
        stats.streak = (stats.lastStudyDate === yesterday) ? stats.streak + 1 : 1;
        stats.lastStudyDate = today;
    }
    if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
    saveStats();

    // Per-deck stats
    if (currentDeckName) {
        const ds = getDeckStat(currentDeckName);
        ds.studied++;
        if (correct) ds.correct++;
        saveDeckStats();
    }
    renderStats();
}

function renderStats() {
    document.getElementById("streak").textContent = stats.streak;
    document.getElementById("best-streak").textContent = stats.bestStreak;

    if (currentDeckName) {
        const ds = getDeckStat(currentDeckName);
        const total = decks[currentDeckName] ? decks[currentDeckName].length : 0;
        document.getElementById("deck-studied").textContent = ds.studied + " / " + total;
        document.getElementById("accuracy").textContent = ds.studied > 0
            ? Math.round((ds.correct / ds.studied) * 100) + "%" : "0%";
    } else {
        document.getElementById("deck-studied").textContent = "0 / 0";
        document.getElementById("accuracy").textContent = "0%";
    }
}

function resetDeckStats() {
    if (!currentDeckName) return;
    deckStats[currentDeckName] = { studied: 0, correct: 0 };
    saveDeckStats();
    renderStats();
}

// ========== LEARN MODE ==========
function startLearnMode() {
    if (!currentDeckName || currentCards.length < 2) {
        alert("Need at least 2 cards in the deck to start Learn Mode."); return;
    }
    learnActive = true;
    learnState = {
        queue: [...decks[currentDeckName]].sort(() => Math.random() - 0.5),
        wrongQueue: [], current: null, mode: "mc",
        hintsUsed: 0, revealed: [], totalCards: decks[currentDeckName].length,
        correctCount: 0, wrongCount: 0, round: 1,
    };
    document.getElementById("card-container").classList.add("hidden");
    document.getElementById("flip-hint").classList.add("hidden");
    document.getElementById("controls").classList.add("hidden");
    document.getElementById("score").classList.add("hidden");
    document.getElementById("action-buttons").classList.add("hidden");
    document.getElementById("progress-bar").classList.add("hidden");
    document.getElementById("learn-mode").classList.remove("hidden");
    showNextLearnCard();
}

function exitLearnMode() {
    learnActive = false;
    document.getElementById("learn-mode").classList.add("hidden");
    document.getElementById("card-container").classList.remove("hidden");
    document.getElementById("flip-hint").classList.remove("hidden");
    if (currentDeckName) {
        document.getElementById("controls").classList.remove("hidden");
        document.getElementById("score").classList.remove("hidden");
        document.getElementById("action-buttons").classList.remove("hidden");
        document.getElementById("progress-bar").classList.remove("hidden");
    }
}

function showNextLearnCard() {
    document.getElementById("learn-feedback").classList.add("hidden");
    document.getElementById("learn-results").classList.add("hidden");
    document.getElementById("learn-question-card").style.display = "flex";

    if (learnState.queue.length === 0) { showLearnResults(); return; }

    learnState.current = learnState.queue.shift();
    const allCards = decks[currentDeckName];
    const wordCount = learnState.current.a.trim().split(/\s+/).length;
    const canType = wordCount <= 3 && allCards.length >= 4;
    learnState.mode = (canType && Math.random() > 0.4) ? "type" : "mc";
    updateLearnProgress();
    document.getElementById("learn-question").textContent = learnState.current.q;

    if (learnState.mode === "mc") showMCMode();
    else showTypeMode();
}

function updateLearnProgress() {
    const done = learnState.totalCards - learnState.queue.length - 1;
    const pct = Math.round((done / learnState.totalCards) * 100);
    document.getElementById("learn-remaining").textContent = learnState.queue.length + 1;
    document.getElementById("learn-correct").textContent = learnState.correctCount;
    document.getElementById("learn-wrong").textContent = learnState.wrongCount;
    document.getElementById("learn-bar-fill").style.width = pct + "%";
    document.getElementById("learn-round-info").textContent = "(Round " + learnState.round + ")";
}

function showMCMode() {
    document.getElementById("learn-mc").classList.remove("hidden");
    document.getElementById("learn-type").classList.add("hidden");
    const correctAnswer = learnState.current.a;
    const allCards = decks[currentDeckName];
    const others = allCards.filter((c) => c.a !== correctAnswer).sort(() => Math.random() - 0.5);
    const wrongOpts = others.slice(0, 3).map((c) => c.a);
    const options = [correctAnswer, ...wrongOpts].sort(() => Math.random() - 0.5);
    const container = document.getElementById("mc-options");
    container.innerHTML = "";
    options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.className = "mc-option"; btn.textContent = opt;
        btn.onclick = () => selectMC(btn, opt === correctAnswer, correctAnswer);
        container.appendChild(btn);
    });
}

function selectMC(clickedBtn, isCorrect, correctAnswer) {
    const btns = document.querySelectorAll(".mc-option");
    btns.forEach((btn) => {
        btn.disabled = true;
        if (btn.textContent === correctAnswer) btn.classList.add("mc-correct");
    });
    if (!isCorrect) clickedBtn.classList.add("mc-wrong");
    setTimeout(() => handleLearnAnswer(isCorrect), 800);
}

function getTypeableInfo(answer) {
    const replacements = [
        [/₂/g, "2"], [/₃/g, "3"], [/₄/g, "4"],
        [/²/g, "2"], [/³/g, "3"], [/⁴/g, "4"],
        [/ⁿ/g, "n"], [/ⁿ⁻¹/g, "n-1"], [/ˣ/g, "x"],
        [/→/g, "->"], [/·/g, "*"], [/ΔH/g, "delta H"],
        [/\u00b2/g, "2"], [/\u00b3/g, "3"],
    ];
    const hasNonAscii = /[^\x00-\x7F]/.test(answer);
    const romanMatch = answer.match(/\(([a-zA-Z\s?!.]+)\)/);

    let simplified = answer;
    let notes = [];

    if (romanMatch && hasNonAscii) {
        simplified = romanMatch[1].trim();
        notes.push('Type the romanization: "' + simplified + '"');
    } else {
        for (const [pattern, replacement] of replacements) {
            if (pattern.test(simplified)) {
                simplified = simplified.replace(pattern, replacement);
            }
        }
        if (simplified !== answer) {
            notes.push('Type it as: "' + simplified + '"');
        }
    }

    return { simplified, note: notes.length > 0 ? notes[0] : null };
}

function showTypeMode() {
    document.getElementById("learn-mc").classList.add("hidden");
    document.getElementById("learn-type").classList.remove("hidden");
    const answer = learnState.current.a;
    learnState.hintsUsed = 0;
    learnState.revealed = new Array(answer.length).fill(false);
    learnState.typeableInfo = getTypeableInfo(answer);

    const noteEl = document.getElementById("type-accept-note");
    if (learnState.typeableInfo.note) {
        noteEl.textContent = learnState.typeableInfo.note;
        noteEl.classList.remove("hidden");
    } else {
        noteEl.classList.add("hidden");
    }

    updateLetterHint();
    document.getElementById("type-input").value = "";
    setTimeout(() => document.getElementById("type-input").focus(), 100);
}

function updateLetterHint() {
    const info = learnState.typeableInfo;
    const display = (info && info.note) ? info.simplified : learnState.current.a;

    if (learnState.revealed.length !== display.length) {
        learnState.revealed = new Array(display.length).fill(false);
    }

    let hint = "";
    for (let i = 0; i < display.length; i++) {
        if (display[i] === " ") hint += "  ";
        else if (learnState.revealed[i]) hint += display[i];
        else hint += "_";
        hint += " ";
    }
    document.getElementById("type-letter-hint").textContent = hint.trim() + "  (" + display.length + " chars)";
}

function getHint() {
    const answer = learnState.current.a;
    const unrevealed = [];
    for (let i = 0; i < answer.length; i++) {
        if (!learnState.revealed[i] && answer[i] !== " ") unrevealed.push(i);
    }
    if (unrevealed.length === 0) return;
    learnState.revealed[unrevealed[Math.floor(Math.random() * unrevealed.length)]] = true;
    learnState.hintsUsed++;
    updateLetterHint();
}

function submitTypedAnswer() {
    const input = document.getElementById("type-input").value.trim();
    if (!input) return;
    const correct = learnState.current.a;
    const simplified = learnState.typeableInfo ? learnState.typeableInfo.simplified : correct;
    const normalize = (s) => s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
    const normalInput = normalize(input);
    const isCorrect = normalInput === normalize(correct) || normalInput === normalize(simplified);
    handleLearnAnswer(isCorrect);
}

function handleLearnAnswer(isCorrect) {
    if (isCorrect) { learnState.correctCount++; recordStudy(true); }
    else { learnState.wrongCount++; learnState.wrongQueue.push(learnState.current); recordStudy(false); }
    showLearnFeedback(isCorrect);
}

function showLearnFeedback(isCorrect) {
    document.getElementById("learn-mc").classList.add("hidden");
    document.getElementById("learn-type").classList.add("hidden");
    document.getElementById("learn-feedback").classList.remove("hidden");
    const resultEl = document.getElementById("feedback-result");
    resultEl.textContent = isCorrect ? "Correct!" : "Wrong";
    resultEl.className = "feedback-result " + (isCorrect ? "feedback-correct" : "feedback-wrong");
    document.getElementById("feedback-correct-label").style.display = isCorrect ? "none" : "block";
    document.getElementById("feedback-answer").style.display = isCorrect ? "none" : "block";
    document.getElementById("feedback-answer").textContent = learnState.current.a;
    updateLearnProgress();
}

function nextLearnCard() { showNextLearnCard(); }

function showLearnResults() {
    document.getElementById("learn-mc").classList.add("hidden");
    document.getElementById("learn-type").classList.add("hidden");
    document.getElementById("learn-feedback").classList.add("hidden");
    document.getElementById("learn-question-card").style.display = "none";
    document.getElementById("learn-results").classList.remove("hidden");
    const total = learnState.correctCount + learnState.wrongCount;
    const accuracy = total > 0 ? Math.round((learnState.correctCount / total) * 100) : 0;
    document.getElementById("result-correct").textContent = learnState.correctCount;
    document.getElementById("result-wrong").textContent = learnState.wrongCount;
    document.getElementById("result-accuracy").textContent = accuracy + "%";
    document.getElementById("retry-count").textContent = learnState.wrongQueue.length;
    document.getElementById("retry-wrong-btn").style.display = learnState.wrongQueue.length > 0 ? "inline-block" : "none";
}

function retryWrongCards() {
    learnState.queue = [...learnState.wrongQueue].sort(() => Math.random() - 0.5);
    learnState.wrongQueue = []; learnState.totalCards = learnState.queue.length;
    learnState.correctCount = 0; learnState.wrongCount = 0; learnState.round++;
    document.getElementById("learn-results").classList.add("hidden");
    document.getElementById("learn-question-card").style.display = "flex";
    showNextLearnCard();
}

// ========== IMPORT / PASTE LIST ==========
function toggleImport() {
    const area = document.getElementById("import-area"); area.classList.toggle("hidden");
    if (!area.classList.contains("hidden")) document.getElementById("import-text").focus();
}

function parseImportText(text) {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) return [];
    const separators = ["\t", " - ", " : ", ": ", " = ", " | "];
    let bestSep = null, bestCount = 0;
    for (const sep of separators) { const count = lines.filter((l) => l.includes(sep)).length; if (count > bestCount) { bestCount = count; bestSep = sep; } }
    if (!bestSep || bestCount === 0) return [];
    const cards = [];
    for (const line of lines) {
        const idx = line.indexOf(bestSep); if (idx === -1) continue;
        const q = line.substring(0, idx).trim();
        const a = line.substring(idx + bestSep.length).trim();
        const cleanQ = q.replace(/^\d+[\.\)\-]\s*/, "").trim();
        if (cleanQ && a) cards.push({ q: cleanQ, a: a });
    }
    return cards;
}

function onImportInput() {
    const cards = parseImportText(document.getElementById("import-text").value);
    document.getElementById("import-preview").textContent = cards.length + " card" + (cards.length !== 1 ? "s" : "") + " detected";
}

function importCards() {
    const cards = parseImportText(document.getElementById("import-text").value);
    if (cards.length === 0) { alert("No cards detected. Make sure each line has a term and definition separated by:\n\n  tab, - , : , = , or |\n\nExample:\nphotosynthesis - the process plants use to convert sunlight into energy"); return; }
    for (const card of cards) decks[currentDeckName].push(card);
    saveDecks();
    document.getElementById("import-text").value = "";
    document.getElementById("import-preview").textContent = "0 cards detected";
    document.getElementById("import-area").classList.add("hidden");
    renderCardList(); renderSidebar(); renderHomeGrid();
    if (!reviewMode) { currentCards = decks[currentDeckName]; updateCard(); renderStats(); }
    alert("Imported " + cards.length + " cards!");
}

// ========== AI DEFINITIONS (no API key needed) ==========
function cleanTerm(term) {
    return term.replace(/^(what is |what are |what was |what were |what does |what did |who is |who was |who were |define |describe |explain )/i, "").replace(/\?$/, "").trim();
}
async function tryDictionaryAPI(term) {
    const cleaned = cleanTerm(term); if (cleaned.split(/\s+/).length > 3) return null;
    const response = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(cleaned.toLowerCase()));
    if (!response.ok) return null;
    const data = await response.json(); if (!data[0]?.meanings?.[0]?.definitions?.[0]) return null;
    const parts = [];
    for (const meaning of data[0].meanings.slice(0, 2)) {
        let entry = "(" + meaning.partOfSpeech + ") " + meaning.definitions[0].definition;
        if (meaning.definitions[0].example) entry += ' — e.g. "' + meaning.definitions[0].example + '"';
        parts.push(entry);
    }
    return parts.join("\n");
}
async function tryWikipediaAPI(term) {
    const cleaned = cleanTerm(term);
    let response = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(cleaned));
    if (!response.ok || (await response.clone().json()).type === "disambiguation") {
        const searchResp = await fetch("https://en.wikipedia.org/w/api.php?action=opensearch&limit=1&format=json&origin=*&search=" + encodeURIComponent(cleaned));
        if (!searchResp.ok) return null; const searchData = await searchResp.json();
        if (!searchData[1] || searchData[1].length === 0) return null;
        response = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(searchData[1][0]));
    }
    if (!response.ok) return null; const data = await response.json();
    if (!data.extract || data.type === "disambiguation") return null;
    const sentences = data.extract.match(/[^.!?]+[.!?]+/g);
    return sentences ? sentences.slice(0, 2).join(" ").trim() : data.extract;
}
async function tryWiktionaryAPI(term) {
    const cleaned = cleanTerm(term).toLowerCase(); if (cleaned.split(/\s+/).length > 3) return null;
    const response = await fetch("https://en.wiktionary.org/api/rest_v1/page/definition/" + encodeURIComponent(cleaned));
    if (!response.ok) return null; const data = await response.json();
    if (!data.en || data.en.length === 0) return null;
    const parts = [];
    for (const entry of data.en.slice(0, 2)) {
        if (entry.definitions && entry.definitions[0]) parts.push("(" + (entry.partOfSpeech || "") + ") " + entry.definitions[0].definition.replace(/<[^>]*>/g, ""));
    }
    return parts.length > 0 ? parts.join("\n") : null;
}
async function aiDefine() {
    const term = document.getElementById("card-question").value.trim();
    if (!term) { alert("Enter a term or question first!"); document.getElementById("card-question").focus(); return; }
    const btn = document.getElementById("ai-define-btn"); btn.textContent = "Searching..."; btn.disabled = true;
    try {
        let definition = await tryDictionaryAPI(term);
        if (!definition) definition = await tryWiktionaryAPI(term);
        if (!definition) { btn.textContent = "Searching Wikipedia..."; definition = await tryWikipediaAPI(term); }
        if (definition) document.getElementById("card-answer").value = definition;
        else alert("Couldn't find a definition for that term. Try rewording it or enter the answer manually.");
    } catch (err) { alert("Error: " + err.message); }
    finally { btn.textContent = "AI Define"; btn.disabled = false; }
}

// ========== UI HELPERS ==========
function openModal(id) { document.getElementById(id).classList.add("active"); const input = document.getElementById(id).querySelector("input, textarea"); if (input) setTimeout(() => input.focus(), 100); }
function closeModal(id) { document.getElementById(id).classList.remove("active"); }
function closeModalOnOverlay(e, id) { if (e.target === e.currentTarget) closeModal(id); }

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (document.querySelector(".modal-overlay.active")) return;

    if (learnActive) return;

    if (document.getElementById("study-view").classList.contains("hidden")) return;

    switch (e.key) {
        case " ": e.preventDefault(); flipCard(); break;
        case "ArrowRight": nextCard(); break;
        case "ArrowLeft": prevCard(); break;
        case "c": case "C": markRight(); break;
        case "w": case "W": markWrong(); break;
    }
});

// ========== INIT ==========
function init() {
    applyTheme(); loadDecks(); loadFolders(); loadFolderColors(); loadStats(); loadDeckStats(); renderStats();
    renderFolderBar(); renderSidebar(); renderHomeGrid();

    // Add sidebar overlay for mobile
    const overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    overlay.id = "sidebar-overlay";
    overlay.onclick = closeSidebar;
    document.body.appendChild(overlay);

    showHomeView();
}
init();
