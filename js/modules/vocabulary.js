/* ==========================================================================
   QEnglish - Vocabulary Module
   Preserves 100% legacy Flashcards, WordList, Quiz, Import & Management
   + Upgrades: Rich Vocabulary Bank, 6-Step Learning Flow & 5-State SRS
   ========================================================================== */

let activeStudyDeck = [];
let currentIndex = 0;
let isFlipped = false;
let currentCategoryFilter = "all";
let currentVocabLevelFilter = "all";
let currentStarFilter = false;
let currentVocabSubTab = "flashcards";

function switchVocabTab(subTab) {
    currentVocabSubTab = subTab || "flashcards";
    const tabs = ["flashcards", "wordlist", "quiz", "practice", "import", "srs"];
    tabs.forEach(t => {
        const panel = document.getElementById(`vsub-${t}`);
        const btn = document.getElementById(`vtab-${t}`);
        if (panel) panel.classList.toggle("hidden", t !== currentVocabSubTab);
        if (btn) {
            btn.className = t === currentVocabSubTab
                ? "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30"
                : "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5";
        }
    });

    // Update sidebar sub-item highlight
    document.querySelectorAll("[data-nav^='vocab-']").forEach(el => {
        el.classList.toggle("active", el.getAttribute("data-nav") === `vocab-${currentVocabSubTab}`);
    });

    if (currentVocabSubTab === "flashcards") applyStudyFilter();
    if (currentVocabSubTab === "wordlist") renderWordList();
    if (currentVocabSubTab === "quiz") initQuizSetupView();
    if (currentVocabSubTab === "practice") exitPractice();
    if (currentVocabSubTab === "srs") renderSRSDashboard();
}

// Legacy alias preserved so any external/inline switchTab('study'|'list'|'quiz'|'import'|'practice') still works!
function switchTab(legacyTab) {
    const map = { study: "flashcards", list: "wordlist", quiz: "quiz", import: "import", practice: "practice", srs: "srs" };
    navigateTo("vocabulary", map[legacyTab] || legacyTab);
}

/* ==================== 1. FLASHCARDS (PRESERVED + ENHANCED) ==================== */
function parseDaysInput(str) {
    if (!str || str.trim() === "" || str.trim().toLowerCase() === "all") return null;
    const set = new Set();
    str.split(",").forEach(p => {
        p = p.trim();
        if (p.includes("-")) {
            const [start, end] = p.split("-").map(n => parseInt(n.trim(), 10));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = Math.min(start, end); i <= Math.max(start, end); i++) set.add(i);
            }
        } else {
            const num = parseInt(p, 10);
            if (!isNaN(num)) set.add(num);
        }
    });
    return set.size > 0 ? set : null;
}

function getFilteredSubDeck(dayStr, limitVal, orderVal, levelFilter = "all") {
    const daySet = parseDaysInput(dayStr);
    let result = deck.filter(item => {
        const matchDay = !daySet || daySet.has(item.day || 1);
        const matchLv = !levelFilter || levelFilter === "all" || levelFilter.startsWith("IELTS") || String(item.level || "B1").toUpperCase() === levelFilter.toUpperCase();
        return matchDay && matchLv;
    });

    if (orderVal === "random") {
        result = [...result].sort(() => 0.5 - Math.random());
    } else {
        result = [...result].sort((a, b) => (a.day || 1) - (b.day || 1) || Number(a.id) - Number(b.id));
    }

    const limit = parseInt(limitVal, 10);
    if (!isNaN(limit) && limit > 0) {
        result = result.slice(0, limit);
    }
    return result;
}

function applyStudyFilter() {
    const dayEl = document.getElementById("study-day-input");
    const limEl = document.getElementById("study-limit-input");
    const ordEl = document.getElementById("study-order-select");
    const lvEl = document.getElementById("study-level-select");
    if (!dayEl || !limEl || !ordEl) return;

    activeStudyDeck = getFilteredSubDeck(
        dayEl.value,
        limEl.value,
        ordEl.value,
        lvEl ? lvEl.value : "all"
    );
    currentIndex = 0;
    isFlipped = false;
    const inner = document.getElementById("flashcard-inner");
    if (inner) inner.classList.remove("is-flipped");
    renderCurrentCard();
}

function playCurrentAudio(rateOverride = null) {
    if (activeStudyDeck.length > 0 && activeStudyDeck[currentIndex]) {
        speakText(activeStudyDeck[currentIndex].term, rateOverride);
    }
}

function playExampleAudio() {
    if (activeStudyDeck.length > 0 && activeStudyDeck[currentIndex] && activeStudyDeck[currentIndex].example) {
        speakText(activeStudyDeck[currentIndex].example);
    }
}

function flipCard() {
    if (activeStudyDeck.length === 0) return;
    isFlipped = !isFlipped;
    const cardInner = document.getElementById("flashcard-inner");
    if (cardInner) cardInner.classList.toggle("is-flipped", isFlipped);
}

function nextCard() {
    if (activeStudyDeck.length === 0) return;
    isFlipped = false;
    const inner = document.getElementById("flashcard-inner");
    if (inner) inner.classList.remove("is-flipped");
    currentIndex = (currentIndex + 1) % activeStudyDeck.length;
    renderCurrentCard();
    if (autoPlay) playCurrentAudio();
}

function prevCard() {
    if (activeStudyDeck.length === 0) return;
    isFlipped = false;
    const inner = document.getElementById("flashcard-inner");
    if (inner) inner.classList.remove("is-flipped");
    currentIndex = (currentIndex - 1 + activeStudyDeck.length) % activeStudyDeck.length;
    renderCurrentCard();
    if (autoPlay) playCurrentAudio();
}

function toggleStarCurrent() {
    if (activeStudyDeck.length === 0) return;
    const current = activeStudyDeck[currentIndex];
    current.starred = !current.starred;
    saveDeckToStorage();
    renderCurrentCard();
    showToast(current.starred ? "Đã đánh dấu sao (Từ khó)" : "Đã bỏ đánh dấu sao");
}

function renderCurrentCard() {
    const termEl = document.getElementById("card-term");
    const ipaEl = document.getElementById("card-ipa");
    const defEl = document.getElementById("card-definition");
    const counterEl = document.getElementById("card-counter");
    const exBox = document.getElementById("card-example-box");
    const catBadge = document.getElementById("card-category-badge");
    const progBar = document.getElementById("study-progress-bar");
    const starBtn = document.getElementById("btn-star-current");
    const metaRow = document.getElementById("card-extra-meta");
    if (!termEl) return;

    if (activeStudyDeck.length === 0) {
        termEl.textContent = "Trống";
        ipaEl.textContent = "";
        defEl.textContent = "Không có từ vựng phù hợp điều kiện lọc. Hãy đổi Ngày học hoặc chọn 'all'.";
        counterEl.textContent = "Thẻ 0 / 0";
        if (exBox) exBox.classList.add("hidden");
        if (metaRow) metaRow.innerHTML = "";
        if (progBar) progBar.style.width = "0%";
        return;
    }

    const card = activeStudyDeck[currentIndex];
    termEl.textContent = card.term;
    ipaEl.textContent = card.ipa || "/.../";
    defEl.textContent = card.def;

    if (exBox) {
        if (card.example && card.example.trim() !== "") {
            document.getElementById("card-example").textContent = `"${card.example}"`;
            exBox.classList.remove("hidden");
        } else {
            exBox.classList.add("hidden");
        }
    }

    if (metaRow) {
        const syn = card.synonyms ? `<span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">Đồng nghĩa: ${escHtml(card.synonyms)}</span>` : "";
        const ant = card.antonyms ? `<span class="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">Trái nghĩa: ${escHtml(card.antonyms)}</span>` : "";
        metaRow.innerHTML = syn + ant;
    }

    const catLabel = card.category === "STEM" ? "STEM / Vi Mạch" : card.category === "Campus" ? "Đại Học / Campus" : card.category;
    if (catBadge) {
        catBadge.textContent = `Ngày ${card.day || 1} • ${catLabel} • ${card.level || "B1"}`;
    }
    if (counterEl) counterEl.textContent = `Thẻ ${currentIndex + 1} / ${activeStudyDeck.length}`;
    if (progBar) progBar.style.width = `${((currentIndex + 1) / activeStudyDeck.length) * 100}%`;
    if (starBtn) {
        starBtn.innerHTML = card.starred
            ? `<i class="fa-solid fa-star text-amber-400 text-lg"></i>`
            : `<i class="fa-regular fa-star text-slate-400 text-lg"></i>`;
    }
}

function markCurrentCardSRS(known) {
    if (!activeStudyDeck.length) return;
    const card = activeStudyDeck[currentIndex];
    const st = recordWordSRSResult(card.id, known);
    const nextDays = SRS_INTERVALS_DAYS[st.step] || 1;
    showToast(known ? `Đã ghi nhận nhớ từ "${card.term}" (Ôn lại sau ${nextDays} ngày)` : `Đã đưa "${card.term}" vào danh sách Cần ôn sớm!`, known ? "success" : "warning");
    nextCard();
}

function saveCurrentCardToNotebook() {
    if (!activeStudyDeck.length) return;
    const c = activeStudyDeck[currentIndex];
    addStructuredNote({
        type: "vocabulary",
        title: `${c.term} — ${c.def}`,
        important: Boolean(c.starred),
        fields: {
            word: c.term,
            ipa: c.ipa || "",
            pos: c.pos || "noun",
            meaningVi: c.def || "",
            example: c.example || "",
            synonyms: c.synonyms || "",
            antonyms: c.antonyms || "",
            personalSentence: ""
        },
        content: `${c.term} ${c.ipa}: ${c.def}\nVí dụ: ${c.example}`
    });
}

/* ==================== 2. WORD LIST / VOCABULARY BANK ==================== */
function filterCategory(cat) {
    currentCategoryFilter = cat;
    document.querySelectorAll(".filter-btn").forEach(btn => {
        const isTarget = btn.getAttribute("data-cat") === cat || btn.id === `filter-btn-${cat}`;
        btn.className = isTarget
            ? "filter-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white shadow-md"
            : "filter-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-slate-400 border border-white/10 hover:text-white";
    });
    renderWordList();
}

function toggleStarOnlyFilter() {
    currentStarFilter = !currentStarFilter;
    const btn = document.getElementById("filter-btn-starred");
    if (btn) {
        btn.className = currentStarFilter
            ? "px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40"
            : "px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-slate-400 border border-white/10";
    }
    renderWordList();
}

function renderDynamicCategoryButtons() {
    const wrap = document.getElementById("dynamic-cat-filters");
    if (!wrap) return;
    const baseCats = ["STEM", "Campus"];
    const extraCats = [...new Set(deck.map(d => d.category).filter(c => c && !baseCats.includes(c)))];
    const allCats = ["all", ...baseCats, ...extraCats];
    wrap.innerHTML = allCats.map(c => {
        const active = currentCategoryFilter === c;
        const label = c === "all" ? "Tất cả" : c;
        return `<button onclick="filterCategory('${escHtml(c)}')" id="filter-btn-${escHtml(c)}" data-cat="${escHtml(c)}" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition ${active ? "bg-violet-600 text-white shadow-md" : "bg-slate-900 text-slate-400 border border-white/10 hover:text-white"}">${escHtml(label)}</button>`;
    }).join("");
}

function renderWordList() {
    const container = document.getElementById("word-list-container");
    if (!container) return;
    renderDynamicCategoryButtons();

    const search = (document.getElementById("search-input")?.value || "").toLowerCase().trim();
    const dayStr = document.getElementById("list-day-input")?.value || "";
    const lvFilter = document.getElementById("list-level-select")?.value || "all";
    const srsFilter = document.getElementById("list-srs-select")?.value || "all";
    const daySet = parseDaysInput(dayStr);

    const filtered = deck.filter(item => {
        const hay = `${item.term} ${item.ipa} ${item.def} ${item.synonyms || ""} ${item.antonyms || ""} ${item.category || ""}`.toLowerCase();
        const matchesSearch = !search || hay.includes(search);
        const matchesDay = !daySet || daySet.has(item.day || 1);
        const matchesCat = currentCategoryFilter === "all" || item.category === currentCategoryFilter;
        const matchesLv = lvFilter === "all" || String(item.level || "B1").toUpperCase() === lvFilter.toUpperCase();
        const matchesStar = !currentStarFilter || Boolean(item.starred);
        const srsStatus = classifyWordSRS(item.id);
        const matchesSRS = srsFilter === "all" || srsStatus === srsFilter;
        return matchesSearch && matchesDay && matchesCat && matchesLv && matchesStar && matchesSRS;
    });

    const summaryEl = document.getElementById("wordlist-filter-summary");
    if (summaryEl) {
        summaryEl.textContent = `Hiển thị ${filtered.length} / ${deck.length} từ vựng`;
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full glass-panel rounded-2xl text-center py-12 text-slate-400 space-y-2">
                <div class="text-4xl">📂</div>
                <p class="font-bold text-white">Không tìm thấy từ vựng phù hợp bộ lọc</p>
                <p class="text-xs text-slate-400">Thử xóa từ khóa tìm kiếm, chọn "Tất cả" hoặc thêm từ mới ở mục Nhập & Quản Lý.</p>
            </div>
        `;
        return;
    }

    const srsLabels = {
        new: { text: "Từ mới", cls: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20" },
        learning: { text: "Đang học", cls: "text-amber-300 bg-amber-500/10 border-amber-500/20" },
        due: { text: "Cần ôn tập", cls: "text-rose-300 bg-rose-500/10 border-rose-500/20" },
        mastered: { text: "Đã nhớ", cls: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" },
        leech: { text: "Hay sai", cls: "text-pink-300 bg-pink-500/15 border-pink-500/30" }
    };

    container.innerHTML = filtered.map((item, idx) => {
        const srsCat = classifyWordSRS(item.id);
        const srsBadge = srsLabels[srsCat] || srsLabels.new;
        const safeIdJson = JSON.stringify(item.id);
        return `
            <div class="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-3 transition duration-300">
                <div class="flex items-start justify-between gap-2">
                    <div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <h4 class="font-black text-xl text-white tracking-tight">${escHtml(item.term)}</h4>
                            ${renderLevelBadge(item.level || "B1")}
                            <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${item.category === "STEM" ? "bg-violet-500/10 text-violet-300 border border-violet-500/20" : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"}">
                                Ngày ${item.day || 1} • ${escHtml(item.category)}
                            </span>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${srsBadge.cls}">${srsBadge.text}</span>
                        </div>
                        <p class="text-xs font-mono text-cyan-400 mt-1 font-semibold">
                            ${escHtml(item.ipa)} ${item.pos ? `<span class="text-slate-400">(${escHtml(item.pos)})</span>` : ""}
                        </p>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        <button onclick="speakWordById(${escHtml(safeIdJson)}, 1.0)" class="p-2 rounded-lg hover:bg-white/5 text-cyan-400 hover:text-cyan-300 transition" title="Nghe chuẩn">🔊</button>
                        <button onclick="speakWordById(${escHtml(safeIdJson)}, 0.5)" class="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-cyan-300 transition text-xs" title="Nghe chậm 0.5x">🐢</button>
                        <button onclick="toggleStarItem(${escHtml(safeIdJson)})" class="p-2 rounded-lg hover:bg-white/5 ${item.starred ? "text-amber-400" : "text-slate-500"} hover:text-amber-300 transition" title="Đánh dấu từ khó">★</button>
                        <button onclick="saveWordIdToNotebook(${escHtml(safeIdJson)})" class="p-2 rounded-lg hover:bg-white/5 text-violet-300 hover:text-violet-200 transition text-xs" title="Lưu vào Sổ tay">📓</button>
                        <button onclick="deleteItem(${escHtml(safeIdJson)})" class="p-2 rounded-lg hover:bg-white/5 text-rose-400/80 hover:text-rose-300 transition" title="Xóa từ">🗑</button>
                    </div>
                </div>
                <div class="space-y-2">
                    <p class="text-sm font-extrabold text-amber-300">${escHtml(item.def)}</p>
                    ${(item.synonyms || item.antonyms) ? `
                        <div class="flex flex-wrap gap-2 text-[11px]">
                            ${item.synonyms ? `<span class="text-emerald-300/90"><strong>Syn:</strong> ${escHtml(item.synonyms)}</span>` : ""}
                            ${item.antonyms ? `<span class="text-rose-300/90"><strong>Ant:</strong> ${escHtml(item.antonyms)}</span>` : ""}
                        </div>
                    ` : ""}
                    ${item.example ? `
                        <div class="pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 cursor-pointer group/exitem" onclick="speakExampleById(${escHtml(safeIdJson)})">
                            <p class="text-xs text-slate-300 italic group-hover/exitem:text-cyan-300 transition font-medium">"${escHtml(item.example)}"</p>
                            <span class="text-cyan-400 text-xs shrink-0">🔊</span>
                        </div>
                    ` : ""}
                </div>
            </div>
        `;
    }).join("");
}

function speakWordById(id, rate = null) {
    const item = deck.find(d => String(d.id) === String(id));
    if (item) speakText(item.term, rate);
}

function speakExampleById(id) {
    const item = deck.find(d => String(d.id) === String(id));
    if (item && item.example) speakText(item.example);
}

function saveWordIdToNotebook(id) {
    const c = deck.find(d => String(d.id) === String(id));
    if (!c) return;
    addStructuredNote({
        type: "vocabulary",
        title: `${c.term} — ${c.def}`,
        important: Boolean(c.starred),
        fields: {
            word: c.term,
            ipa: c.ipa || "",
            pos: c.pos || "",
            meaningVi: c.def || "",
            example: c.example || "",
            synonyms: c.synonyms || "",
            antonyms: c.antonyms || "",
            personalSentence: ""
        },
        content: `${c.term} (${c.ipa}): ${c.def}\nVí dụ: ${c.example}`
    });
}

function toggleStarItem(id) {
    const item = deck.find(d => String(d.id) === String(id));
    if (item) {
        item.starred = !item.starred;
        saveDeckToStorage();
        renderWordList();
        showToast(item.starred ? `Đã đánh dấu sao "${item.term}"` : `Đã bỏ đánh dấu "${item.term}"`);
    }
}

function deleteItem(id) {
    const item = deck.find(d => String(d.id) === String(id));
    if (!item) return;
    if (confirm(`Bạn có chắc chắn muốn xóa từ vựng "${item.term}" không?`)) {
        deck = deck.filter(d => String(d.id) !== String(id));
        saveDeckToStorage();
        renderWordList();
        applyStudyFilter();
        showToast(`Đã xóa từ "${item.term}"!`);
    }
}

/* ==================== 3. QUIZ ENGINE (PRESERVED + ANSWER REVIEW) ==================== */
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let isFirstAttempt = true;
let quizHistoryLog = [];

function initQuizSetupView() {
    if (quizQuestions.length === 0 && deck.length >= 4) {
        startNewQuiz();
    }
}

function startNewQuiz() {
    const dayStr = document.getElementById("quiz-day-input")?.value || "";
    const limitVal = document.getElementById("quiz-limit-input")?.value || "10";
    const orderVal = document.getElementById("quiz-order-select")?.value || "random";

    if (deck.length < 4) {
        showToast("Kho từ cần ít nhất 4 từ vựng để tạo 4 đáp án trắc nghiệm!", "error");
        return;
    }

    quizQuestions = getFilteredSubDeck(dayStr, limitVal, orderVal);
    if (quizQuestions.length < 1) {
        showToast("Không có từ vựng nào khớp với Ngày đã chọn! Hãy nhập 'all' để kiểm tra toàn bộ.", "error");
        return;
    }

    document.getElementById("quiz-box")?.classList.remove("hidden");
    document.getElementById("quiz-result")?.classList.add("hidden");

    quizIndex = 0;
    quizScore = 0;
    quizHistoryLog = [];
    renderQuizQuestion();
}

function playQuizAudio() {
    if (quizQuestions.length > 0 && quizQuestions[quizIndex]) {
        speakText(quizQuestions[quizIndex].term);
    }
}

function renderQuizQuestion() {
    if (quizIndex >= quizQuestions.length) {
        showQuizResults();
        return;
    }

    isFirstAttempt = true;
    const current = quizQuestions[quizIndex];
    document.getElementById("quiz-score").textContent = `Điểm: ${quizScore}`;
    document.getElementById("quiz-progress-text").textContent = `Câu ${quizIndex + 1} / ${quizQuestions.length}`;
    document.getElementById("quiz-term").textContent = current.term;
    document.getElementById("quiz-ipa").textContent = current.ipa;
    document.getElementById("quiz-cat-badge").textContent = `Ngày ${current.day || 1} • ${current.category} • ${current.level || "B1"}`;

    const options = [current];
    let guard = 0;
    while (options.length < Math.min(4, deck.length) && guard < 200) {
        guard++;
        const rand = deck[Math.floor(Math.random() * deck.length)];
        if (!options.some(o => String(o.id) === String(rand.id))) options.push(rand);
    }
    options.sort(() => 0.5 - Math.random());

    const optionsContainer = document.getElementById("quiz-options");
    optionsContainer.innerHTML = options.map((opt) => `
        <button onclick='checkQuizAnswer(this, ${JSON.stringify(String(opt.id))}, ${JSON.stringify(String(current.id))})' class="quiz-opt-btn w-full p-4 rounded-2xl bg-slate-950 border border-white/10 font-bold text-left text-xs md:text-sm text-slate-200 transition flex items-center justify-between group hover:border-violet-500/50">
            <span>${escHtml(opt.def)}</span>
            <span class="text-slate-500 group-hover:text-violet-400">○</span>
        </button>
    `).join("");

    if (autoPlay) speakText(current.term);
}

function checkQuizAnswer(btn, optId, correctId) {
    const current = quizQuestions[quizIndex];
    const chosenItem = deck.find(d => String(d.id) === String(optId));

    if (String(optId) === String(correctId)) {
        btn.className = "quiz-opt-btn w-full p-4 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 font-extrabold text-left text-xs md:text-sm text-emerald-200 transition flex items-center justify-between shadow-lg shadow-emerald-500/10";
        btn.lastElementChild.textContent = "✅";
        document.querySelectorAll(".quiz-opt-btn").forEach(b => b.onclick = null);

        if (isFirstAttempt) {
            quizScore++;
            document.getElementById("quiz-score").textContent = `Điểm: ${quizScore}`;
            recordWordSRSResult(current.id, true);
            quizHistoryLog.push({ word: current.term, correctDef: current.def, firstTryCorrect: true, wrongPick: null });
        } else {
            recordWordSRSResult(current.id, false);
        }

        setTimeout(() => {
            quizIndex++;
            renderQuizQuestion();
        }, 750);
    } else {
        btn.className = "quiz-opt-btn w-full p-4 rounded-2xl bg-rose-500/20 border-2 border-rose-500 font-bold text-left text-xs md:text-sm text-rose-300 transition opacity-70 cursor-not-allowed";
        btn.lastElementChild.textContent = "❌";
        btn.onclick = null;
        if (isFirstAttempt) {
            isFirstAttempt = false;
            quizHistoryLog.push({
                word: current.term,
                correctDef: current.def,
                firstTryCorrect: false,
                wrongPick: chosenItem ? chosenItem.def : ""
            });
            autoLogMistake({
                errorCategory: "Dùng sai từ",
                wrongText: `${current.term} ≠ ${chosenItem ? chosenItem.def : ""}`,
                correctText: `${current.term} = ${current.def}`,
                explanation: `Nhầm nghĩa từ vựng "${current.term}" trong bài Trắc nghiệm.`,
                skill: "vocabulary"
            });
        }
        showToast("Chưa chính xác! Hãy chọn đáp án đúng.", "error");
    }
}

function showQuizResults() {
    document.getElementById("quiz-box")?.classList.add("hidden");
    const resEl = document.getElementById("quiz-result");
    resEl?.classList.remove("hidden");

    const pct = quizQuestions.length > 0 ? Math.round((quizScore / quizQuestions.length) * 100) : 0;
    document.getElementById("quiz-final-score").innerHTML =
        `Bạn đạt <span class="font-black text-amber-400 text-lg">${quizScore} / ${quizQuestions.length} (${pct}%)</span> câu đúng ngay từ lần chọn đầu tiên!`;

    const reviewWrap = document.getElementById("quiz-answer-review");
    if (reviewWrap) {
        reviewWrap.innerHTML = quizHistoryLog.map((h, i) => `
            <div class="p-3 rounded-xl border text-left text-xs ${h.firstTryCorrect ? "bg-emerald-500/10 border-emerald-500/25" : "bg-rose-500/10 border-rose-500/25"}">
                <div class="flex items-center justify-between font-bold">
                    <span class="text-white">${i + 1}. ${escHtml(h.word)}</span>
                    <span>${h.firstTryCorrect ? "✅ Đúng ngay" : "❌ Nhầm lần đầu"}</span>
                </div>
                ${!h.firstTryCorrect ? `<p class="text-rose-300 mt-1">Bạn đã chọn: ${escHtml(h.wrongPick)}</p>` : ""}
                <p class="text-emerald-300 mt-0.5">Nghĩa chuẩn: ${escHtml(h.correctDef)}</p>
            </div>
        `).join("");
    }

    logStudyMetrics(
        { scoreEntry: { skill: "vocabulary", scorePct: pct, level: appSettings?.selectedLevel || "B1", title: "Trắc nghiệm Từ vựng" } },
        { type: "quiz", skill: "vocabulary", title: `Hoàn thành Trắc nghiệm Từ vựng (${quizScore}/${quizQuestions.length})`, scorePct: pct }
    );
}

/* ==================== 4. IMPORT & VOCABULARY BANK MANAGEMENT ==================== */
function loadSampleImport() {
    const area = document.getElementById("import-textarea");
    if (area) area.value = SAMPLE_IMPORT_TEXT;
    const dayInput = document.getElementById("import-day-input");
    if (dayInput) dayInput.value = "2";
    showToast("Đã dán danh sách mẫu 16 từ học thuật!");
}

function addSingleVocabWord() {
    const term = (document.getElementById("single-term")?.value || "").trim();
    const ipa = (document.getElementById("single-ipa")?.value || "").trim();
    const pos = (document.getElementById("single-pos")?.value || "noun").trim();
    const def = (document.getElementById("single-def")?.value || "").trim();
    const example = (document.getElementById("single-example")?.value || "").trim();
    const synonyms = (document.getElementById("single-synonyms")?.value || "").trim();
    const antonyms = (document.getElementById("single-antonyms")?.value || "").trim();
    const category = (document.getElementById("single-category")?.value || "Campus").trim() || "Campus";
    const level = (document.getElementById("single-level")?.value || "B1").trim();
    const day = parseInt(document.getElementById("single-day")?.value || "1", 10) || 1;
    const starred = Boolean(document.getElementById("single-starred")?.checked);

    if (!term || !def) {
        showToast("Vui lòng nhập tối thiểu Từ tiếng Anh và Nghĩa tiếng Việt!", "error");
        return;
    }
    if (deck.some(d => d.term.toLowerCase() === term.toLowerCase())) {
        showToast(`Từ "${term}" đã có trong kho từ vựng của bạn!`, "warning");
        return;
    }

    const fallbackEx = DYNAMIC_EXAMPLE_TEMPLATES[0](term).en;
    deck.push(normalizeWordItem({
        id: Date.now() + Math.random(),
        day,
        term,
        ipa: ipa || `/.../ (${pos})`,
        pos,
        def,
        example: example || fallbackEx,
        category,
        level,
        synonyms,
        antonyms,
        starred,
        source: "user-imported"
    }));

    saveDeckToStorage();
    ["single-term", "single-ipa", "single-def", "single-example", "single-synonyms", "single-antonyms"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    showToast(`Đã thêm từ "${term}" (${level}) vào Kho từ vựng!`);
    renderWordList();
    applyStudyFilter();
}

function processBatchImport() {
    const text = (document.getElementById("import-textarea")?.value || "").trim();
    const selectedDay = parseInt(document.getElementById("import-day-input")?.value || "1", 10) || 1;
    const selectedCat = (document.getElementById("import-cat-select")?.value || "STEM").trim();
    const selectedLevel = (document.getElementById("import-level-select")?.value || "B1").trim();

    if (!text) {
        showToast("Vui lòng nhập danh sách từ vựng!", "error");
        return;
    }

    const lines = text.split("\n");
    let addedCount = 0;
    let skippedDup = 0;

    lines.forEach((line, index) => {
        if (!line.trim()) return;
        let exampleStr = "";
        let mainContent = line;
        if (line.includes("|")) {
            const exParts = line.split("|");
            mainContent = exParts[0].trim();
            exampleStr = exParts.slice(1).join("|").trim();
        }

        let term = "", ipa = "", def = "";
        if (mainContent.includes("-")) {
            const parts = mainContent.split("-");
            term = parts[0].trim();
            const rest = parts.slice(1).join("-").trim();
            const ipaMatch = rest.match(/\((.*?)\)/);
            if (ipaMatch) {
                ipa = ipaMatch[0];
                def = rest.replace(ipaMatch[0], "").trim();
            } else {
                def = rest;
            }
        } else {
            term = mainContent.trim();
        }

        if (!term) return;
        if (deck.some(d => d.term.toLowerCase() === term.toLowerCase() && (d.day || 1) === selectedDay)) {
            skippedDup++;
            return;
        }

        if (!exampleStr) {
            const tpl = DYNAMIC_EXAMPLE_TEMPLATES[index % DYNAMIC_EXAMPLE_TEMPLATES.length](term);
            exampleStr = tpl.en;
        }

        deck.push(normalizeWordItem({
            id: Date.now() + index + Math.random(),
            day: selectedDay,
            term,
            ipa: ipa || "/.../",
            def: def || term,
            example: exampleStr,
            category: selectedCat,
            level: selectedLevel,
            starred: false,
            source: "user-imported"
        }, index));
        addedCount++;
    });

    if (addedCount > 0) {
        saveDeckToStorage();
        const studyDay = document.getElementById("study-day-input");
        if (studyDay) studyDay.value = selectedDay.toString();
        applyStudyFilter();
        document.getElementById("import-textarea").value = "";
        showToast(`Đã thêm ${addedCount} từ vào Ngày ${selectedDay}${skippedDup ? ` (bỏ qua ${skippedDup} từ trùng)` : ""}!`);
        switchVocabTab("flashcards");
    } else if (skippedDup > 0) {
        showToast(`Tất cả ${skippedDup} từ đều đã tồn tại trong Ngày ${selectedDay}.`, "warning");
    } else {
        showToast("Không đọc được dòng từ vựng hợp lệ nào.", "error");
    }
}

function deleteSpecificDay() {
    const dayVal = parseInt(document.getElementById("delete-day-input")?.value || "", 10);
    if (isNaN(dayVal) || dayVal < 1) {
        showToast("Vui lòng nhập số ngày hợp lệ!", "error");
        return;
    }
    const matching = deck.filter(item => (item.day || 1) === dayVal);
    if (matching.length === 0) {
        showToast(`Không tìm thấy từ vựng nào thuộc Ngày ${dayVal}.`, "error");
        return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa ${matching.length} từ vựng thuộc Ngày ${dayVal} không?`)) return;

    deck = deck.filter(item => (item.day || 1) !== dayVal);
    saveDeckToStorage();
    renderWordList();
    applyStudyFilter();
    document.getElementById("delete-day-input").value = "";
    showToast(`Đã xóa ${matching.length} từ vựng thuộc Ngày ${dayVal}!`);
}

function restoreDefaultDeck() {
    const userAdded = deck.filter(w => !(Number(w.id) >= 1 && Number(w.id) <= 20));
    const msg = userAdded.length > 0
        ? `Khôi phục đầy đủ 20 từ gốc Ngày 1 và GIỮ NGUYÊN ${userAdded.length} từ bạn đã thêm?\n(Bấm OK để khôi phục an toàn không mất từ mới)`
        : "Khôi phục lại bộ 20 từ vựng mặc định Ngày 1?";
    if (!confirm(msg)) return;

    const existingMap = new Map(deck.map(w => [String(w.id), w]));
    const restoredDefaults = DEFAULT_DECK.map((d, i) => {
        const prev = existingMap.get(String(d.id));
        return normalizeWordItem({ ...d, starred: prev ? prev.starred : d.starred }, i);
    });
    deck = [...restoredDefaults, ...userAdded];
    saveDeckToStorage();
    renderWordList();
    applyStudyFilter();
    showToast("Đã khôi phục 20 từ gốc an toàn!");
}

function clearAllDeck() {
    if (!confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ danh sách từ hiện tại không? (Hệ thống sẽ lưu một bản dự phòng tự động trước khi xóa)")) return;
    safeWriteJSON("qenglish_pre_clear_backup_v1", { backedUpAt: new Date().toISOString(), deck });
    deck = [];
    saveDeckToStorage();
    renderWordList();
    applyStudyFilter();
    showToast("Đã xóa danh sách từ (có thể khôi phục 20 từ gốc bất kỳ lúc nào).");
}

/* ==================== 5. 6-STEP VOCABULARY LEARNING FLOW (PHẦN 3.2.B) ==================== */
const PR_SIX_STEPS = [
    "Bước 1: Nghe & Phát âm",
    "Bước 2: Viết nghĩa tiếng Việt",
    "Bước 3: Dịch ngược sang tiếng Anh",
    "Bước 4: Đặt câu & Sửa lỗi",
    "Bước 5: Gợi ý câu mở rộng (3–5 câu)",
    "Bước 6: Đọc lại câu hoàn chỉnh"
];

let prQueue = [];
let prIdx = 0;
let prStep = 0;
let prWrong = 0;
let prHadMistakeOnWord = false;
let prSentence = "";
let prTargetReadSentence = "";
let prSuggestedList = [];
let prRec = null;
let prChunks = [];

const prViNorm = s => String(s || "").normalize("NFC").toLowerCase().replace(/[.,;:!?()\/\[\]]/g, " ").replace(/\s+/g, " ").trim();
const prNoAccent = s => prViNorm(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
const prItem = () => prQueue[prIdx];

function startPractice() {
    const dayStr = document.getElementById("pr-day-input")?.value || "";
    const lim = Math.max(1, parseInt(document.getElementById("pr-limit-input")?.value || "5", 10) || 5);
    const set = parseDaysInput(dayStr);
    prQueue = deck.filter(d => !set || set.has(d.day || 1)).slice(0, lim);
    if (!prQueue.length) {
        showToast("Không có từ nào trong ngày đã chọn! Hãy nhập 'all' hoặc chọn ngày có từ.", "error");
        return;
    }
    prIdx = 0;
    prStep = 0;
    prHadMistakeOnWord = false;
    document.getElementById("pr-setup")?.classList.add("hidden");
    document.getElementById("pr-session")?.classList.remove("hidden");
    renderPractice();
}

function exitPractice() {
    if (prRec && prRec.state === "recording") {
        try { prRec.stop(); } catch (e) {}
    }
    stopSpeech();
    document.getElementById("pr-session")?.classList.add("hidden");
    document.getElementById("pr-setup")?.classList.remove("hidden");
}

function buildSuggestionsForWord(wordItem) {
    const enrich = (typeof VOCAB_ENRICHMENT_MAP !== "undefined" && VOCAB_ENRICHMENT_MAP[wordItem.term.toLowerCase()]) || null;
    const list = [];
    if (enrich && Array.isArray(enrich.extraExamples)) {
        enrich.extraExamples.forEach(ex => list.push(ex));
    }
    if (wordItem.example) {
        wordItem.example.split(" / ").filter(Boolean).forEach(exStr => {
            if (!list.some(x => x.en.toLowerCase() === exStr.trim().toLowerCase())) {
                list.push({
                    en: exStr.trim(),
                    vi: `Câu ví dụ sử dụng từ "${wordItem.term}" (${wordItem.def.replace(/\.$/, "")}).`,
                    structure: "Subject + Verb + Academic Context"
                });
            }
        });
    }
    let idx = 0;
    while (list.length < 4 && idx < DYNAMIC_EXAMPLE_TEMPLATES.length) {
        const gen = DYNAMIC_EXAMPLE_TEMPLATES[idx](wordItem.term);
        if (!list.some(x => x.en.toLowerCase() === gen.en.toLowerCase())) list.push(gen);
        idx++;
    }
    return list.slice(0, 5);
}

function renderPractice() {
    const it = prItem();
    if (!it) return prFinish();
    const card = document.getElementById("pr-card");
    if (!card) return;

    prWrong = 0;
    document.getElementById("pr-progress").textContent = `Từ ${prIdx + 1}/${prQueue.length} · ${PR_SIX_STEPS[prStep]}`;
    document.getElementById("pr-bar").style.width = Math.round(((prIdx * 6 + prStep) / (prQueue.length * 6)) * 100) + "%";

    const stepPills = `<div class="flex flex-wrap justify-center gap-1.5">${PR_SIX_STEPS.map((st, idx) =>
        `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold border ${idx === prStep ? "bg-violet-600 text-white border-violet-400" : idx < prStep ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-slate-950 text-slate-500 border-white/5"}">${idx + 1}</span>`
    ).join("")}</div>`;

    const fbBox = `<div id="pr-feedback" class="text-sm min-h-[28px] space-y-3"></div>`;
    const navButtons = (disableNext = false) => `
        <div class="flex justify-center gap-3 pt-2">
            <button onclick="prSkipStep()" class="px-5 py-2.5 rounded-2xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-bold text-slate-300 transition">Bỏ qua bước</button>
            <button id="pr-next" onclick="prNext()" ${disableNext ? "disabled" : ""} class="px-7 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-extrabold text-white shadow-lg transition">Bước tiếp theo →</button>
        </div>
    `;

    if (prStep === 0) {
        // BƯỚC 1: Nghe và phát âm (Chuẩn + Chậm + Micro SpeechRecognition + MediaRecorder)
        card.innerHTML = `
            ${stepPills}
            <div class="text-center space-y-2">
                <div class="flex items-center justify-center gap-2">${renderLevelBadge(it.level || "B1")}<span class="text-xs text-slate-400">${escHtml(it.pos || "vocab")}</span></div>
                <h3 class="text-4xl md:text-5xl font-black text-white tracking-tight">${escHtml(it.term)}</h3>
                <p class="text-lg font-mono text-cyan-400 font-bold">${escHtml(it.ipa || "/.../")}</p>
                <p class="text-xs text-slate-400">Nghe phát âm mẫu (chuẩn & chậm), sau đó bấm Micro đọc lại để kiểm tra nhận diện.</p>
            </div>
            <div class="flex flex-wrap justify-center gap-2.5">
                <button onclick="speakText(prItem().term, 1.0)" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 font-bold text-xs text-cyan-300 transition">🔊 Nghe mẫu (1.0x)</button>
                <button onclick="speakText(prItem().term, 0.5)" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 font-bold text-xs text-amber-300 transition">🐢 Nghe chậm (0.5x)</button>
                <button onclick="prPracticeRecognize(prItem().term)" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-bold text-xs text-white shadow-lg transition">🎙 Đọc bằng Micro</button>
                <button onclick="prToggleRec(this, 'pr-play')" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 font-bold text-xs text-slate-200 transition">⏺ Tự thu & nghe lại</button>
            </div>
            <audio id="pr-play" controls class="hidden w-full max-w-md mx-auto"></audio>
            ${fbBox}
            ${navButtons(false)}
        `;
        if (autoPlay) speakText(it.term, 1.0);
    } else if (prStep === 1) {
        // BƯỚC 2: Viết nghĩa tiếng Việt
        card.innerHTML = `
            ${stepPills}
            <div class="text-center space-y-2">
                <h3 class="text-4xl font-black text-white">${escHtml(it.term)}</h3>
                <p class="text-sm font-mono text-cyan-400">${escHtml(it.ipa || "")}</p>
                <p class="text-xs text-slate-400">Nhập nghĩa tiếng Việt của từ trên:</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto w-full">
                <input id="pr-ans" type="text" placeholder="Ví dụ: Chất bán dẫn..." onkeydown="if(event.key==='Enter')prCheckMeaning()" class="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500">
                <button onclick="prCheckMeaning()" class="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-bold text-xs text-white">Kiểm tra</button>
            </div>
            ${fbBox}
            ${navButtons(true)}
        `;
        setTimeout(() => document.getElementById("pr-ans")?.focus(), 50);
    } else if (prStep === 2) {
        // BƯỚC 3: Dịch ngược sang tiếng Anh
        card.innerHTML = `
            ${stepPills}
            <div class="text-center space-y-2">
                <p class="text-xs uppercase tracking-wider text-slate-400 font-bold">Nghĩa tiếng Việt</p>
                <h3 class="text-2xl md:text-3xl font-black text-amber-300">${escHtml(it.def)}</h3>
                <p class="text-xs text-slate-400">Nhập chính xác chính tả từ tiếng Anh tương ứng:</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto w-full">
                <input id="pr-ans" type="text" placeholder="Nhập từ tiếng Anh..." onkeydown="if(event.key==='Enter')prCheckWord()" class="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500">
                <button onclick="prCheckWord()" class="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-bold text-xs text-white">Kiểm tra chính tả</button>
            </div>
            ${fbBox}
            ${navButtons(true)}
        `;
        setTimeout(() => document.getElementById("pr-ans")?.focus(), 50);
    } else if (prStep === 3) {
        // BƯỚC 4: Đặt câu & Phân tích sửa lỗi sâu
        card.innerHTML = `
            ${stepPills}
            <div class="text-center space-y-1.5">
                <h3 class="text-3xl font-black text-white">${escHtml(it.term)} <span class="text-base font-normal text-amber-300">(${escHtml(it.def)})</span></h3>
                <p class="text-xs text-slate-400">Tự viết một câu tiếng Anh hoàn chỉnh có chứa từ <strong>"${escHtml(it.term)}"</strong>. Hệ thống sẽ kiểm tra từ vựng, chính tả, dấu câu, ngữ pháp và cách diễn đạt.</p>
            </div>
            <div class="max-w-2xl mx-auto w-full space-y-3">
                <textarea id="pr-ans" rows="3" placeholder="Ví dụ: Please review the course ${escHtml(it.term.toLowerCase())} carefully before Monday." class="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-violet-500">${escHtml(prSentence)}</textarea>
                <div class="flex flex-wrap justify-center gap-2.5">
                    <button onclick="prCheckSentence()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-bold text-xs text-white shadow-lg">🔍 Kiểm tra & Phân tích câu</button>
                    <button onclick="prCheckSentenceWithAI()" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-violet-500/30 hover:bg-slate-800 font-bold text-xs text-violet-300">🤖 Nhờ AI phân tích sâu (nếu đã kết nối)</button>
                </div>
            </div>
            ${fbBox}
            ${navButtons(!prSentence)}
        `;
    } else if (prStep === 4) {
        // BƯỚC 5: Gợi ý 3-5 câu ví dụ khác kèm nghĩa TV, cấu trúc & nghe mẫu
        prSuggestedList = buildSuggestionsForWord(it);
        card.innerHTML = `
            ${stepPills}
            <div class="text-center space-y-1">
                <h3 class="text-2xl font-black text-white">💡 Mở rộng 3–5 câu mẫu với "${escHtml(it.term)}"</h3>
                <p class="text-xs text-slate-400">Nghe từng câu, đối chiếu nghĩa tiếng Việt và ghi nhớ cấu trúc ngữ pháp đáng chú ý:</p>
            </div>
            <div class="space-y-3 max-w-2xl mx-auto w-full">
                ${prSuggestedList.map((sug, k) => `
                    <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1.5">
                        <div class="flex items-start justify-between gap-3">
                            <p class="text-sm font-bold text-white">${k + 1}. ${escHtml(sug.en)}</p>
                            <button onclick="speakText(prSuggestedList[${k}].en, 1.0)" class="px-3 py-1 rounded-lg bg-violet-600/20 text-cyan-300 text-xs font-bold shrink-0 hover:bg-violet-600/40">🔊 Nghe</button>
                        </div>
                        <p class="text-xs text-amber-200/90">🇻🇳 ${escHtml(sug.vi)}</p>
                        <p class="text-[11px] text-violet-300">📐 Cấu trúc: <code class="bg-slate-900 px-1.5 py-0.5 rounded">${escHtml(sug.structure)}</code></p>
                    </div>
                `).join("")}
            </div>
            ${navButtons(false)}
        `;
    } else {
        // BƯỚC 6: Đọc lại câu hoàn chỉnh bằng Micro & So sánh mức độ tương đồng
        prTargetReadSentence = prSentence || it.example || `I am learning the word ${it.term}.`;
        card.innerHTML = `
            ${stepPills}
            <div class="text-center space-y-2 max-w-2xl mx-auto">
                <p class="text-xs uppercase tracking-wider text-cyan-400 font-bold">Câu hoàn chỉnh để luyện đọc</p>
                <div id="pr-read-target-box" class="p-4 rounded-2xl bg-slate-950/90 border border-violet-500/30 text-lg md:text-2xl font-bold text-white leading-relaxed">
                    "${escHtml(prTargetReadSentence)}"
                </div>
                <p class="text-[11px] text-slate-400">ℹ️ Phân biệt rõ: Tính năng bên dưới sử dụng <strong>Web Speech Recognition</strong> để nhận diện từ bạn phát âm và đo độ khớp từ vựng (cần ≥ 80% để đạt), không chấm trọng âm IPA hay ngữ điệu chuyên sâu.</p>
            </div>
            <div class="flex flex-wrap justify-center gap-2.5">
                <button onclick="speakText(prTargetReadSentence, 1.0)" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 font-bold text-xs text-cyan-300">🔊 Nghe câu mẫu</button>
                <button onclick="speakText(prTargetReadSentence, 0.65)" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 font-bold text-xs text-amber-300">🐢 Nghe chậm</button>
                <button onclick="prPracticeReadSentence()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-extrabold text-xs text-white shadow-lg">🎙 Đọc câu bằng Micro</button>
                <button onclick="prToggleRec(this, 'pr-play-step6')" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 font-bold text-xs text-slate-200">⏺ Tự thu âm nghe lại</button>
            </div>
            <audio id="pr-play-step6" controls class="hidden w-full max-w-md mx-auto"></audio>
            ${fbBox}
            <div class="flex justify-center gap-3 pt-2">
                <button onclick="prNext(true)" class="px-5 py-2.5 rounded-2xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-bold text-slate-300">Hoàn thành từ này (Bỏ qua mic)</button>
                <button id="pr-next" onclick="prNext()" disabled class="px-7 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-40 text-xs font-extrabold text-white shadow-lg">Hoàn thành từ →</button>
            </div>
        `;
    }
}

function prUnlockNext(msgHtml) {
    const fb = document.getElementById("pr-feedback");
    if (fb) fb.innerHTML = msgHtml;
    const nxt = document.getElementById("pr-next");
    if (nxt) nxt.disabled = false;
}

async function prPracticeRecognize(targetWord) {
    const fb = document.getElementById("pr-feedback");
    if (!isSpeechRecognitionSupported()) {
        prUnlockNext(`<div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-center">Trình duyệt hiện tại không hỗ trợ nhận diện giọng nói tự động (hãy dùng Chrome hoặc Edge). Bạn hãy dùng nút <strong>⏺ Tự thu & nghe lại</strong> để đối chiếu với giọng mẫu nhé!</div>`);
        return;
    }
    if (fb) fb.innerHTML = `<p class="text-center text-cyan-300 font-bold animate-pulse">🎙 Đang lắng nghe... Hãy phát âm rõ từ "${escHtml(targetWord)}"</p>`;
    try {
        const alts = await recognizeSpeechOnce();
        const best = alts.reduce((bestSoFar, cur) => {
            const cmp = compareTranscriptToTarget(cur.transcript, targetWord);
            return cmp.similarity > bestSoFar.similarity ? { ...cmp, raw: cur.transcript } : bestSoFar;
        }, { similarity: -1, raw: alts[0]?.transcript || "" });

        if (best.similarity >= 80) {
            prUnlockNext(`<div class="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-1">
                <p class="text-emerald-300 font-bold">✅ Nhận diện giọng nói khớp (${best.similarity}%)!</p>
                <p class="text-xs text-slate-300">Máy nhận diện: "${escHtml(best.raw)}"</p>
            </div>`);
        } else {
            prHadMistakeOnWord = true;
            if (fb) fb.innerHTML = `<div class="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-center space-y-1">
                <p class="text-rose-300 font-bold">❌ Chưa khớp rõ (${Math.max(0, best.similarity)}%). Hãy nghe chậm 0.5x và đọc lại!</p>
                <p class="text-xs text-slate-300">Máy nghe thành: "${escHtml(best.raw)}"</p>
            </div>`;
        }
    } catch (err) {
        if (fb) fb.innerHTML = `<p class="text-center text-rose-300 text-xs">${escHtml(err)}</p>`;
    }
}

function prCheckMeaning() {
    const it = prItem();
    const u = document.getElementById("pr-ans")?.value || "";
    const alts = it.def.replace(/[()]/g, "/").split(/[\/;,]/).map(prViNorm).filter(Boolean);
    const uNorm = prViNorm(u);
    if (!uNorm) return;

    if (alts.some(a => a === uNorm || (uNorm.length >= 4 && a.includes(uNorm)))) {
        return prUnlockNext(`<p class="text-center text-emerald-300 font-bold">✅ Chính xác! Nghĩa đầy đủ: "${escHtml(it.def)}"</p>`);
    }
    if (alts.some(a => prNoAccent(a) === prNoAccent(u))) {
        return prUnlockNext(`<p class="text-center text-emerald-300 font-bold">✅ Đúng nghĩa! Lưu ý gõ đầy đủ dấu tiếng Việt nhé: "${escHtml(it.def)}"</p>`);
    }

    prWrong++;
    prHadMistakeOnWord = true;
    const firstHint = alts[0] || it.def;
    const hintMsg = prWrong >= 2
        ? `Gợi ý: Nghĩa tiếng Việt bắt đầu bằng <strong>"${escHtml(firstHint.split(" ").slice(0, 2).join(" "))}..."</strong>`
        : `Gợi ý chữ cái đầu: <strong>"${escHtml(firstHint.charAt(0).toUpperCase())}..."</strong>`;
    document.getElementById("pr-feedback").innerHTML = `<div class="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-center text-xs space-y-1">
        <p class="text-rose-300 font-bold">❌ Chưa đúng, hãy thử lại!</p>
        <p class="text-slate-300">${hintMsg}</p>
    </div>`;
}

function prCheckWord() {
    const it = prItem();
    const u = (document.getElementById("pr-ans")?.value || "").trim();
    if (!u) return;
    if (normalizeWords(u) === normalizeWords(it.term)) {
        speakText(it.term, 1.0);
        return prUnlockNext(`<p class="text-center text-emerald-300 font-bold">✅ Chính tả chính xác: "${escHtml(it.term)}"!</p>`);
    }
    prWrong++;
    prHadMistakeOnWord = true;
    const revealLen = Math.min(it.term.length, prWrong >= 2 ? 3 : 1);
    document.getElementById("pr-feedback").innerHTML = `<div class="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-center text-xs space-y-1">
        <p class="text-rose-300 font-bold">❌ Sai chính tả! Hãy nhập lại từ tiếng Anh.</p>
        <p class="text-slate-300">Gợi ý: Bắt đầu bằng <strong>"${escHtml(it.term.slice(0, revealLen))}..."</strong> (gồm ${it.term.length} ký tự).</p>
    </div>`;
}

function prCheckSentence() {
    const it = prItem();
    const s = (document.getElementById("pr-ans")?.value || "").trim();
    const fb = document.getElementById("pr-feedback");
    if (!s || !fb) return;

    const diag = analyzeEnglishTextLocal(s, { requiredWord: it.term });
    if (diag.isValid) {
        prSentence = s;
        const tipsHtml = diag.naturalTips.length
            ? `<div class="mt-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-xs text-cyan-200 text-left space-y-1">${diag.naturalTips.map(t => `<p>${escHtml(t)}</p>`).join("")}</div>`
            : "";
        prUnlockNext(`
            <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left space-y-2 max-w-2xl mx-auto">
                <p class="text-emerald-300 font-bold">✅ Câu sử dụng từ "${escHtml(it.term)}" đúng cấu trúc và dấu câu!</p>
                <p class="text-xs text-slate-300">Câu của bạn: <em>"${escHtml(s)}"</em></p>
                ${tipsHtml}
            </div>
        `);
    } else {
        prHadMistakeOnWord = true;
        diag.issues.forEach(iss => {
            autoLogMistake({
                errorCategory: iss.errorType.includes("chính tả") ? "Sai chính tả" : iss.errorType.includes("từ") ? "Dùng sai từ" : "Sai cấu trúc câu",
                wrongText: s,
                correctText: diag.correctedText,
                explanation: iss.explanationVi,
                skill: "vocabulary"
            });
        });
        fb.innerHTML = `
            <div class="p-4 rounded-2xl bg-slate-950/90 border border-rose-500/30 text-left space-y-3 max-w-2xl mx-auto">
                <div>
                    <span class="text-[10px] uppercase font-bold text-rose-400">Đánh dấu vị trí cần sửa trong câu:</span>
                    <div class="mt-1 p-3 rounded-xl bg-slate-900 text-base text-white">${diag.highlightedHtml}</div>
                </div>
                <div class="space-y-1.5">
                    <span class="text-[10px] uppercase font-bold text-amber-300">Giải thích chi tiết vì sao sai & cách khắc phục:</span>
                    <ul class="list-disc pl-5 space-y-1 text-xs text-rose-200">
                        ${diag.issues.map(e => `<li><strong>[${escHtml(e.errorType)}]</strong> ${escHtml(e.explanationVi)} ${e.suggestion ? `→ Đề xuất: <code class="text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded">${escHtml(e.suggestion)}</code>` : ""}</li>`).join("")}
                    </ul>
                </div>
                <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <span class="font-bold text-emerald-300">✨ Gợi ý câu đã chỉnh sửa:</span>
                    <span class="text-white ml-1">${escHtml(diag.correctedText)}</span>
                </div>
                ${diag.naturalTips.map(t => `<p class="text-xs text-cyan-300">${escHtml(t)}</p>`).join("")}
                <p class="text-[11px] text-slate-400">👉 Hãy tự sửa lại câu ở ô phía trên rồi bấm <strong>"Kiểm tra & Phân tích câu"</strong> lần nữa để ghi nhớ sâu!</p>
            </div>
        `;
    }
}

async function prCheckSentenceWithAI() {
    const it = prItem();
    const s = (document.getElementById("pr-ans")?.value || "").trim();
    if (!s) {
        showToast("Hãy viết câu trước khi gửi phân tích!", "error");
        return;
    }
    const fb = document.getElementById("pr-feedback");
    if (fb) fb.innerHTML = `<p class="text-center text-violet-300 text-xs animate-pulse">🤖 Đang gửi câu tới AI Backend để phân tích...</p>`;
    const res = await AIClient.request("sentence-check", { word: it.term, meaningVi: it.def, sentence: s, level: appSettings?.selectedLevel || "B1" });
    if (!res.ok) {
        showToast(res.error, "warning");
        prCheckSentence(); // Fallback transparently to local analyzer
        return;
    }
    const r = res.data;
    if (r.isCorrect) prSentence = s;
    prUnlockNext(`
        <div class="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-left space-y-2 max-w-2xl mx-auto text-xs">
            <div class="flex items-center justify-between">
                <span class="font-bold ${r.isCorrect ? "text-emerald-300" : "text-amber-300"}">${r.isCorrect ? "✅ AI Đánh giá: Câu hợp lý!" : "⚠️ AI Phát hiện điểm cần cải thiện"}</span>
                ${renderSourceBadge("ai-generated")}
            </div>
            <p class="text-slate-200"><strong>Nhận xét:</strong> ${escHtml(r.feedbackVi || "")}</p>
            ${r.correctedSentence ? `<p class="text-emerald-300"><strong>Câu sửa chuẩn:</strong> ${escHtml(r.correctedSentence)}</p>` : ""}
            ${r.naturalAlternative ? `<p class="text-cyan-300"><strong>Cách diễn đạt tự nhiên hơn:</strong> ${escHtml(r.naturalAlternative)}</p>` : ""}
        </div>
    `);
}

async function prPracticeReadSentence() {
    const fb = document.getElementById("pr-feedback");
    if (!isSpeechRecognitionSupported()) {
        prUnlockNext(`<div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-center">Trình duyệt này không hỗ trợ Web Speech Recognition (hãy dùng Chrome/Edge). Bạn hãy dùng nút <strong>⏺ Tự thu âm nghe lại</strong> rồi bấm Hoàn thành từ nhé.</div>`);
        return;
    }
    if (fb) fb.innerHTML = `<p class="text-center text-cyan-300 text-xs font-bold animate-pulse">🎙 Đang nghe bạn đọc cả câu... Hãy đọc trôi chảy và rõ từng từ.</p>`;
    try {
        const alts = await recognizeSpeechOnce(11000);
        let bestCmp = null;
        alts.forEach(a => {
            const cmp = compareTranscriptToTarget(a.transcript, prTargetReadSentence);
            if (!bestCmp || cmp.similarity > bestCmp.similarity) bestCmp = cmp;
        });

        const passed = bestCmp.similarity >= 80;
        const html = `
            <div class="p-4 rounded-2xl ${passed ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"} border text-left space-y-2 max-w-2xl mx-auto text-xs">
                <div class="flex items-center justify-between">
                    <span class="font-extrabold text-sm ${passed ? "text-emerald-300" : "text-rose-300"}">
                        ${passed ? "✅ Đạt độ khớp từ vựng!" : "❌ Chưa đạt ngưỡng 80% — Hãy đọc lại câu!"}
                    </span>
                    <span class="px-2.5 py-1 rounded-full bg-slate-900 font-black text-white">Tương đồng: ${bestCmp.similarity}%</span>
                </div>
                <p class="text-slate-300"><strong>Máy nghe được:</strong> "${escHtml(bestCmp.spokenText)}"</p>
                <p class="text-slate-200"><strong>Đối chiếu từng từ:</strong> ${bestCmp.wordDiffHtml}</p>
                ${bestCmp.missing.length ? `<p class="text-amber-300"><strong>Từ cần đọc rõ hơn:</strong> ${escHtml(bestCmp.missing.join(", "))}</p>` : ""}
                <p class="text-[11px] text-slate-400 italic">${escHtml(bestCmp.honestDisclaimer)}</p>
            </div>
        `;
        if (passed) {
            prUnlockNext(html);
        } else {
            prHadMistakeOnWord = true;
            if (fb) fb.innerHTML = html;
        }
    } catch (err) {
        if (fb) fb.innerHTML = `<p class="text-center text-rose-300 text-xs">${escHtml(err)}</p>`;
    }
}

async function prToggleRec(btn, audioId = "pr-play") {
    if (prRec && prRec.state === "recording") {
        prRec.stop();
        return;
    }
    if (!isMediaRecorderSupported()) {
        showToast("Trình duyệt không hỗ trợ ghi âm MediaRecorder.", "error");
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const rec = prRec = new MediaRecorder(stream);
        prChunks = [];
        rec.ondataavailable = e => { if (e.data && e.data.size > 0) prChunks.push(e.data); };
        rec.onstop = () => {
            stream.getTracks().forEach(t => t.stop());
            const a = document.getElementById(audioId);
            if (a) {
                a.src = URL.createObjectURL(new Blob(prChunks, { type: rec.mimeType || "audio/webm" }));
                a.classList.remove("hidden");
            }
            btn.textContent = "⏺ Thu lại (Lưu cục bộ)";
        };
        rec.start();
        btn.textContent = "⏹ Dừng thu";
    } catch (e) {
        showToast("Không mở được micro. Vui lòng cấp quyền micro trên trình duyệt.", "error");
    }
}

function prSkipStep() {
    prNext(true);
}

function prNext(skipped = false) {
    if (prStep < 5) {
        prStep++;
    } else {
        // Word completed through all 6 steps -> update SRS
        const finishedWord = prItem();
        if (finishedWord) {
            recordWordSRSResult(finishedWord.id, !prHadMistakeOnWord && !skipped);
        }
        prStep = 0;
        prIdx++;
        prSentence = "";
        prHadMistakeOnWord = false;
    }
    renderPractice();
}

function prFinish() {
    document.getElementById("pr-bar").style.width = "100%";
    document.getElementById("pr-progress").textContent = "Hoàn thành quy trình 6 bước!";
    logStudyMetrics(
        { scoreEntry: { skill: "vocabulary", scorePct: 100, level: appSettings?.selectedLevel || "B1", title: "Luyện Từ & Câu 6 bước" } },
        { type: "practice", skill: "vocabulary", title: `Hoàn thành quy trình 6 bước cho ${prQueue.length} từ vựng`, scorePct: 100 }
    );
    document.getElementById("pr-card").innerHTML = `
        <div class="text-center space-y-4 py-6">
            <div class="text-5xl">🏆</div>
            <h3 class="text-2xl font-black text-white">Tuyệt vời! Bạn đã hoàn thành quy trình 6 bước cho ${prQueue.length} từ</h3>
            <p class="text-sm text-slate-400">Lịch ôn tập ngắt quãng (SRS) của các từ vừa học đã được cập nhật tự động.</p>
            <div class="flex justify-center gap-3">
                <button onclick="exitPractice()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-bold text-xs text-white">Chọn lượt luyện mới</button>
                <button onclick="switchVocabTab('srs')" class="px-6 py-2.5 rounded-xl bg-slate-900 border border-white/10 font-bold text-xs text-cyan-300">Xem lịch SRS</button>
            </div>
        </div>
    `;
}

function addPracticeWords() {
    const text = (document.getElementById("pr-add-textarea")?.value || "").trim();
    const day = parseInt(document.getElementById("pr-day-input")?.value || "1", 10) || 1;
    if (!text) return showToast("Hãy dán danh sách từ trước!", "error");
    let added = 0;
    text.split("\n").forEach((line, idx) => {
        if (!line.trim()) return;
        const [main, ...exParts] = line.split("|");
        const parts = main.trim().split("-");
        const term = parts[0].trim();
        if (!term) return;
        const rest = parts.slice(1).join("-").trim();
        const ipaM = rest.match(/\((.*?)\)/);
        const def = ipaM ? (rest.replace(ipaM[0], "").trim() || term) : (rest || term);
        const example = exParts.join("|").trim() || DYNAMIC_EXAMPLE_TEMPLATES[idx % DYNAMIC_EXAMPLE_TEMPLATES.length](term).en;
        deck.push(normalizeWordItem({ id: Date.now() + idx + Math.random(), day, term, ipa: ipaM ? ipaM[0] : "/.../", def, example, category: "Campus", starred: false, source: "user-imported" }, idx));
        added++;
    });
    if (!added) return showToast("Không đọc được dòng nào, hãy kiểm tra định dạng.", "error");
    saveDeckToStorage();
    document.getElementById("pr-add-textarea").value = "";
    showToast(`Đã thêm ${added} từ vào Ngày ${day}!`);
}

/* ==================== 6. SPACED REPETITION SYSTEM UI (PHẦN 3.2.C) ==================== */
let srsQueue = [];
let srsIdx = 0;

function renderSRSDashboard() {
    const counts = getSRSSummary();
    const setEl = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    setEl("srs-new", counts.new);
    setEl("srs-learning", counts.learning);
    setEl("srs-review", counts.due);
    setEl("srs-mastered", counts.mastered);
    setEl("srs-leech", counts.leech);

    const listEl = document.getElementById("srs-schedule-table");
    if (listEl) {
        const sorted = [...deck].map(w => ({ word: w, srs: getWordSRS(w.id), cat: classifyWordSRS(w.id) }))
            .sort((a, b) => {
                const prio = { leech: 0, due: 1, learning: 2, new: 3, mastered: 4 };
                return (prio[a.cat] ?? 5) - (prio[b.cat] ?? 5);
            })
            .slice(0, 12);

        const badgeMap = {
            new: "bg-cyan-500/15 text-cyan-300",
            learning: "bg-amber-500/15 text-amber-300",
            due: "bg-rose-500/20 text-rose-300",
            mastered: "bg-emerald-500/15 text-emerald-300",
            leech: "bg-pink-500/20 text-pink-300"
        };
        const labelMap = { new: "Từ mới", learning: "Đang học", due: "Cần ôn tập", mastered: "Đã nhớ", leech: "Thường xuyên sai" };

        listEl.innerHTML = sorted.map(({ word, srs, cat }) => {
            const nextTxt = srs.nextReviewAt > 0
                ? (srs.nextReviewAt <= Date.now() ? "Đến hạn ngay bây giờ" : new Date(srs.nextReviewAt).toLocaleDateString("vi-VN"))
                : "Chưa học lần đầu";
            const intervalTxt = srs.step >= 0 ? `Chu kỳ ${SRS_INTERVALS_DAYS[srs.step]} ngày` : "Mới";
            return `
                <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-white/5 text-xs">
                    <div>
                        <span class="font-bold text-white">${escHtml(word.term)}</span>
                        <span class="text-slate-400 ml-2">${escHtml(word.def)}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[11px] text-slate-400 hidden sm:inline">${intervalTxt} • ${nextTxt}</span>
                        <span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] ${badgeMap[cat]}">${labelMap[cat]}</span>
                    </div>
                </div>
            `;
        }).join("");
    }
}

function startSRSReview() {
    const now = Date.now();
    // Priority: Leech (thường xuyên sai) -> Due (cần ôn) -> Learning -> New (up to daily goal)
    const leeches = deck.filter(w => classifyWordSRS(w.id, now) === "leech");
    const dues = deck.filter(w => classifyWordSRS(w.id, now) === "due");
    const news = deck.filter(w => classifyWordSRS(w.id, now) === "new").slice(0, appSettings?.dailyWordGoal || 10);
    const learnings = deck.filter(w => classifyWordSRS(w.id, now) === "learning").slice(0, 5);

    srsQueue = [...leeches, ...dues, ...news, ...learnings];
    if (srsQueue.length === 0) {
        srsQueue = deck.slice(0, 10);
    }
    if (srsQueue.length === 0) {
        showToast("Kho từ vựng hiện đang trống!", "error");
        return;
    }

    srsIdx = 0;
    const sessionEl = document.getElementById("srs-session");
    sessionEl?.classList.remove("hidden");
    renderSRSStep();
}

function renderSRSStep() {
    const sessionEl = document.getElementById("srs-session");
    if (!sessionEl) return;
    if (srsIdx >= srsQueue.length) {
        sessionEl.innerHTML = `
            <div class="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <div class="text-4xl">🎉</div>
                <h4 class="text-xl font-black text-white">Hoàn thành phiên ôn tập SRS (${srsQueue.length} từ)!</h4>
                <p class="text-xs text-slate-300">Những từ đúng đã được nâng chu kỳ (1 → 3 → 7 → 14 → 30 ngày). Những từ sai sẽ được nhắc ôn lại sớm hơn.</p>
                <button onclick="document.getElementById('srs-session').classList.add('hidden'); renderSRSDashboard();" class="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">Đóng phiên ôn</button>
            </div>
        `;
        renderSRSDashboard();
        return;
    }

    const w = srsQueue[srsIdx];
    const st = getWordSRS(w.id);
    const curInterval = st.step >= 0 ? `${SRS_INTERVALS_DAYS[st.step]} ngày` : "Từ mới";

    sessionEl.innerHTML = `
        <div class="p-6 rounded-2xl bg-slate-950/90 border border-violet-500/30 space-y-4">
            <div class="flex items-center justify-between text-xs text-slate-400">
                <span>Thẻ SRS ${srsIdx + 1} / ${srsQueue.length}</span>
                <span>Mức hiện tại: <strong class="text-cyan-300">${curInterval}</strong> (Đúng: ${st.correctCount} | Sai: ${st.wrongCount})</span>
            </div>
            <div class="text-center py-3 space-y-2">
                <p class="text-xs text-slate-400">Dịch sang tiếng Anh từ có nghĩa:</p>
                <h4 class="text-2xl font-black text-amber-300">${escHtml(w.def)}</h4>
                <p class="text-xs text-slate-500">Chủ đề: ${escHtml(w.category)} • Gợi ý chữ đầu: ${escHtml(w.term.charAt(0))}...</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input id="srs-answer-input" type="text" placeholder="Gõ từ tiếng Anh..." onkeydown="if(event.key==='Enter')submitSRSAnswer()" class="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500">
                <button onclick="submitSRSAnswer()" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold">Kiểm tra</button>
            </div>
            <div id="srs-step-feedback" class="text-center text-xs"></div>
        </div>
    `;
    setTimeout(() => document.getElementById("srs-answer-input")?.focus(), 50);
}

function submitSRSAnswer() {
    const w = srsQueue[srsIdx];
    const input = document.getElementById("srs-answer-input");
    const fb = document.getElementById("srs-step-feedback");
    if (!w || !input || !fb) return;

    const ok = normalizeWords(input.value) === normalizeWords(w.term);
    const updated = recordWordSRSResult(w.id, ok);
    speakText(w.term, 1.0);

    if (!ok) {
        autoLogMistake({
            errorCategory: "Sai chính tả",
            wrongText: input.value || "(bỏ trống)",
            correctText: `${w.term} (${w.def})`,
            explanation: `Quên hoặc gõ sai từ "${w.term}" trong phiên ôn tập ngắt quãng SRS.`,
            skill: "vocabulary"
        });
    }

    const nextDays = SRS_INTERVALS_DAYS[updated.step] || 1;
    fb.innerHTML = `
        <div class="mt-2 p-3 rounded-xl ${ok ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"} space-y-2">
            <p class="font-bold">${ok ? `✅ Chính xác! Chu kỳ tiếp theo: sau ${nextDays} ngày.` : `❌ Đáp án đúng là "${escHtml(w.term)}" (${escHtml(w.ipa)}). Hệ thống sẽ nhắc ôn lại sớm sau 4 giờ!`}</p>
            <button onclick="srsIdx++; renderSRSStep();" class="px-5 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs border border-white/10">Tiếp tục →</button>
        </div>
    `;
}

function setupVocabularyKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        const vocabPage = document.getElementById("page-vocabulary");
        if (!vocabPage || !vocabPage.classList.contains("active") || currentVocabSubTab !== "flashcards") return;
        if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
        if (e.code === "Space") { e.preventDefault(); flipCard(); }
        if (e.code === "ArrowRight") nextCard();
        if (e.code === "ArrowLeft") prevCard();
    });
}
