/* ==========================================================================
   QEnglish — Vietnamese-English Translation Writing Module (80 Lessons A1–C1)
   Split-screen desktop with draggable + keyboard resizer & Mobile 2-tab layout
   Strict No-Spoiler Rule: Model translation is NEVER shown before submission!
   Hardened via multi-agent Security, UI/UX & Education QA review.
   ========================================================================== */

let currentWritingHubMode = "translation"; // 'translation' | 'studio'
let currentTranslationLessonId = null;     // null until loaded so lastLessonId restores cleanly
let currentTranslationMobileTab = "vi";    // 'vi' | 'en'
let isTranslationSubmitting = false;
let transResizerInitialized = false;
let transGlobalHooksBound = false;
let transDraftSaveTimer = null;
let transPendingDraftText = null;
let transPendingDraftLessonId = null;
let translationRequestGen = 0;

// Module-scoped safe lookup state (prevents inline JS / XSS / apostrophe SyntaxErrors!)
let activeTransHints = [];
let activeTransModelText = "";
let activeTransDrills = [];
let activeTransHistoryList = [];
let activeTransWorkspaceRendered = false;

const TRANS_CATEGORY_META = {
    grammar_error: {
        label: "Lỗi sai ngữ pháp",
        badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        icon: "🔴"
    },
    unnatural_word: {
        label: "Từ vựng chưa tự nhiên",
        badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        icon: "🟠"
    },
    literal_translation: {
        label: "Lỗi dịch sát tiếng Việt",
        badgeClass: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40",
        icon: "🟣"
    },
    correct_but_unnatural: {
        label: "Đúng ngữ pháp nhưng chưa tự nhiên",
        badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/35",
        icon: "🔵"
    },
    valid_alternative: {
        label: "Chính xác & Tự nhiên (Chấp nhận nhiều cách dịch)",
        badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        icon: "🟢"
    }
};

function resetTranslationWorkspaceMemory() {
    flushPendingTranslationDraft();
    translationRequestGen++;
    currentTranslationLessonId = null;
    isTranslationSubmitting = false;
    activeTransHints = [];
    activeTransModelText = "";
    activeTransDrills = [];
    activeTransHistoryList = [];
    activeTransWorkspaceRendered = false;
    clearTimeout(transDraftSaveTimer);
    transDraftSaveTimer = null;
    transPendingDraftText = null;
    transPendingDraftLessonId = null;
}

function getAllTranslationLessons() {
    return typeof TRANSLATION_80_LESSONS !== "undefined" && Array.isArray(TRANSLATION_80_LESSONS)
        ? TRANSLATION_80_LESSONS
        : [];
}

function getTranslationLessonById(id) {
    const list = getAllTranslationLessons();
    return list.find(l => l.id === Number(id)) || list[0] || null;
}

function getTranslationState() {
    const wState = getWritingState();
    if (!wState.translation || typeof wState.translation !== "object") {
        wState.translation = {
            drafts: {},
            completedIds: [],
            scores: {},
            history: [],
            lastLessonId: 1,
            splitRatio: 50
        };
    }
    const t = wState.translation;
    if (!t.drafts || typeof t.drafts !== "object") t.drafts = {};
    if (!Array.isArray(t.completedIds)) t.completedIds = [];
    if (!t.scores || typeof t.scores !== "object") t.scores = {};
    if (!Array.isArray(t.history)) t.history = [];
    if (!Number.isFinite(Number(t.lastLessonId))) t.lastLessonId = 1;
    if (!Number.isFinite(Number(t.splitRatio))) t.splitRatio = 50;
    return t;
}

function saveTranslationState(tState) {
    const wState = getWritingState();
    wState.translation = tState;
    saveWritingState(wState);
}

/* ==================== WRITING HUB SUB-MODE SWITCHER ==================== */
function switchWritingHubMode(mode) {
    flushPendingTranslationDraft();
    currentWritingHubMode = mode === "studio" ? "studio" : "translation";
    document.getElementById("writing-mode-translation")?.classList.toggle("hidden", currentWritingHubMode !== "translation");
    document.getElementById("writing-mode-studio")?.classList.toggle("hidden", currentWritingHubMode !== "studio");

    document.querySelectorAll(".writing-hub-btn").forEach(btn => {
        const active = btn.getAttribute("data-wmode") === currentWritingHubMode;
        btn.setAttribute("aria-pressed", active ? "true" : "false");
        btn.className = `writing-hub-btn flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
            active
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                : "text-slate-300 hover:text-white hover:bg-white/5"
        }`;
    });

    const topSummary = document.getElementById("trans-top-summary");
    if (topSummary) {
        topSummary.textContent = currentWritingHubMode === "translation"
            ? "Lộ trình 80 bài A1–C1 • Chia đôi màn hình • Tự động lưu nháp"
            : "Writing Studio • Chấm 4 tiêu chí × 2.5đ • PEN301 / IELTS / CEFR";
    }

    if (currentWritingHubMode === "translation") {
        initTranslationWritingWorkspace({ preserveFeedback: true });
    } else if (typeof filterWritingTopics === "function") {
        filterWritingTopics();
    }
}

/* ==================== INITIALIZATION & RESIZABLE SPLIT PANE ==================== */
function bindTranslationGlobalLifecycleHooks() {
    if (transGlobalHooksBound) return;
    transGlobalHooksBound = true;

    window.addEventListener("beforeunload", () => {
        flushPendingTranslationDraft();
    });
    window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            flushPendingTranslationDraft();
        }
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const modal = document.getElementById("trans-catalog-modal");
            if (modal && !modal.classList.contains("hidden")) {
                closeTranslationCatalogModal();
            }
        }
    });
}

function initTranslationWritingWorkspace(options = {}) {
    const lessons = getAllTranslationLessons();
    if (!lessons.length) return;

    bindTranslationGlobalLifecycleHooks();
    const tState = getTranslationState();
    applyTranslationSplitRatio(tState.splitRatio || 50);
    initTranslationSplitResizer();

    const targetId = getTranslationLessonById(
        currentTranslationLessonId !== null ? currentTranslationLessonId : (tState.lastLessonId || 1)
    )?.id || 1;

    // Preserve active feedback report if returning to the same already-rendered lesson
    if (options.preserveFeedback && activeTransWorkspaceRendered && currentTranslationLessonId === targetId) {
        renderTranslationProgressSummary();
        renderTranslationHistoryList();
        return;
    }

    populateTranslationLessonSelect(targetId);
    selectTranslationLesson(targetId, { skipScroll: true, skipSaveLastId: true });
    renderTranslationProgressSummary();
    renderTranslationHistoryList();
    switchTranslationMobileTab(currentTranslationMobileTab || "vi");
    activeTransWorkspaceRendered = true;
}

function getSafeMaxSplitPercent(containerWidth) {
    if (!containerWidth || containerWidth <= 0) return 72;
    const maxPx = Math.max(220, containerWidth - 236); // 220px right pane + 14px resizer + 2px buffer
    const maxPct = Math.floor((maxPx / containerWidth) * 100);
    return Math.max(30, Math.min(72, maxPct));
}

function applyTranslationSplitRatio(percent) {
    const container = document.getElementById("trans-split-container");
    const maxPct = container ? getSafeMaxSplitPercent(container.getBoundingClientRect().width) : 72;
    const clamped = Math.max(28, Math.min(maxPct, Math.round((Number(percent) || 50) * 10) / 10));
    if (container) {
        container.style.setProperty("--trans-left-width", `${clamped}%`);
    }
    const resizer = document.getElementById("trans-resizer");
    if (resizer) {
        resizer.setAttribute("aria-valuenow", String(Math.round(clamped)));
        resizer.setAttribute("aria-valuemax", String(maxPct));
    }
    return clamped;
}

function initTranslationSplitResizer() {
    if (transResizerInitialized) return;
    const resizer = document.getElementById("trans-resizer");
    const container = document.getElementById("trans-split-container");
    if (!resizer || !container) return;
    transResizerInitialized = true;

    let dragging = false;
    let moved = false;
    let latestRatio = Number(getTranslationState().splitRatio) || 50;

    const updateFromClientX = (clientX) => {
        const rect = container.getBoundingClientRect();
        if (!rect.width) return;
        const pct = ((clientX - rect.left) / rect.width) * 100;
        latestRatio = applyTranslationSplitRatio(pct);
    };

    resizer.addEventListener("pointerdown", (e) => {
        if (window.innerWidth < 1024) return;
        dragging = true;
        moved = false;
        latestRatio = Number(getTranslationState().splitRatio) || 50;
        resizer.classList.add("dragging");
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        try { resizer.setPointerCapture(e.pointerId); } catch {}
        e.preventDefault();
    });

    resizer.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        moved = true;
        updateFromClientX(e.clientX);
    });

    const stopDrag = () => {
        if (!dragging) return;
        dragging = false;
        resizer.classList.remove("dragging");
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        if (moved) {
            const tState = getTranslationState();
            tState.splitRatio = latestRatio;
            saveTranslationState(tState);
        }
    };

    resizer.addEventListener("pointerup", stopDrag);
    resizer.addEventListener("pointercancel", stopDrag);

    resizer.addEventListener("dblclick", () => {
        latestRatio = applyTranslationSplitRatio(50);
        const tState = getTranslationState();
        tState.splitRatio = latestRatio;
        saveTranslationState(tState);
        showToast("Đã đặt lại tỷ lệ chia đôi màn hình 50/50.");
    });

    // Keyboard accessibility for splitter
    resizer.addEventListener("keydown", (e) => {
        if (window.innerWidth < 1024) return;
        const cur = Number(getTranslationState().splitRatio) || 50;
        let next = null;
        if (e.key === "ArrowLeft") next = cur - 4;
        else if (e.key === "ArrowRight") next = cur + 4;
        else if (e.key === "Home") next = 30;
        else if (e.key === "End") next = 70;
        else if (e.key === "Enter" || e.key === " ") next = 50;
        if (next !== null) {
            e.preventDefault();
            latestRatio = applyTranslationSplitRatio(next);
            const tState = getTranslationState();
            tState.splitRatio = latestRatio;
            saveTranslationState(tState);
        }
    });
}

/* ==================== MOBILE TAB SWITCHER (ZERO DATA LOSS) ==================== */
function switchTranslationMobileTab(tab) {
    currentTranslationMobileTab = tab === "en" ? "en" : "vi";
    const leftPane = document.getElementById("trans-pane-left");
    const rightPane = document.getElementById("trans-pane-right");
    if (leftPane && rightPane) {
        leftPane.classList.toggle("trans-mobile-hidden", currentTranslationMobileTab !== "vi");
        rightPane.classList.toggle("trans-mobile-hidden", currentTranslationMobileTab !== "en");
    }
    document.querySelectorAll(".trans-mobile-tab-btn").forEach(btn => {
        const active = btn.getAttribute("data-tmtab") === currentTranslationMobileTab;
        btn.setAttribute("aria-selected", active ? "true" : "false");
        btn.className = `trans-mobile-tab-btn py-2.5 rounded-xl text-xs font-extrabold transition ${
            active
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
        }`;
    });
}

/* ==================== FILTERING, SEARCH & LESSON NAVIGATION ==================== */
function getFilteredTranslationLessons() {
    const level = document.getElementById("trans-level-filter")?.value || "all";
    const q = (document.getElementById("trans-search-input")?.value || "").trim().toLowerCase();
    return getAllTranslationLessons().filter(l => {
        if (level !== "all" && l.level !== level) return false;
        if (!q) return true;
        const hay = `${l.id} bai ${l.id} ${l.title} ${l.level} ${(l.grammarFocus || []).join(" ")}`.toLowerCase();
        return hay.includes(q);
    });
}

function populateTranslationLessonSelect(selectedId) {
    const sel = document.getElementById("trans-lesson-select");
    if (!sel) return;
    const filtered = getFilteredTranslationLessons();
    const tState = getTranslationState();

    if (!filtered.length) {
        sel.innerHTML = `<option value="">Không tìm thấy bài phù hợp</option>`;
        return;
    }

    sel.innerHTML = filtered.map(l => {
        const done = tState.completedIds.includes(l.id);
        const scObj = tState.scores[String(l.id)];
        const scTxt = scObj && typeof scObj.bestScore === "number" ? ` (${scObj.bestScore}/10)` : (done ? " (Đã nộp)" : "");
        const mark = done ? "✅ " : "";
        return `<option value="${l.id}" ${l.id === Number(selectedId) ? "selected" : ""}>${mark}Bài ${l.id} [${l.level}] — ${escHtml(l.title)}${scTxt}</option>`;
    }).join("");
}

function onTranslationFilterChange() {
    const filtered = getFilteredTranslationLessons();
    if (!filtered.length) {
        populateTranslationLessonSelect(null);
        updateTranslationPrevNextButtons();
        return;
    }
    const stillVisible = filtered.some(l => l.id === Number(currentTranslationLessonId));
    const targetId = stillVisible ? currentTranslationLessonId : filtered[0].id;
    populateTranslationLessonSelect(targetId);
    if (!stillVisible) {
        selectTranslationLesson(targetId, { skipScroll: true });
    } else {
        updateTranslationPrevNextButtons();
    }
}

function updateTranslationPrevNextButtons() {
    const filtered = getFilteredTranslationLessons();
    const idx = filtered.findIndex(l => l.id === Number(currentTranslationLessonId));
    const prevBtn = document.getElementById("trans-prev-btn");
    const nextBtn = document.getElementById("trans-next-btn");
    if (prevBtn) prevBtn.disabled = idx <= 0;
    if (nextBtn) nextBtn.disabled = idx < 0 || idx >= filtered.length - 1;
}

function goPrevTranslationLesson() {
    const filtered = getFilteredTranslationLessons();
    const idx = filtered.findIndex(l => l.id === Number(currentTranslationLessonId));
    if (idx > 0) {
        selectTranslationLesson(filtered[idx - 1].id);
    }
}

function goNextTranslationLesson() {
    const filtered = getFilteredTranslationLessons();
    const idx = filtered.findIndex(l => l.id === Number(currentTranslationLessonId));
    if (idx >= 0 && idx < filtered.length - 1) {
        selectTranslationLesson(filtered[idx + 1].id);
    }
}

/* ==================== SINGLE LESSON RENDER (STRICTLY NO SPOILERS!) ==================== */
function selectTranslationLesson(lessonId, options = {}) {
    flushPendingTranslationDraft();
    const lesson = getTranslationLessonById(lessonId);
    if (!lesson) return;

    currentTranslationLessonId = lesson.id;
    activeTransWorkspaceRendered = true;
    const tState = getTranslationState();
    if (!options.skipSaveLastId && tState.lastLessonId !== lesson.id) {
        tState.lastLessonId = lesson.id;
        // Write lastLessonId locally without amplifying Cloud Sync on simple browsing
        const prevSuppress = window.__QENGLISH_SUPPRESS_SYNC;
        window.__QENGLISH_SUPPRESS_SYNC = true;
        try { saveTranslationState(tState); } finally { window.__QENGLISH_SUPPRESS_SYNC = prevSuppress; }
    }

    // Header & Metadata
    const numBadge = document.getElementById("trans-lesson-number-badge");
    if (numBadge) numBadge.textContent = `Bài ${lesson.id} / 80`;

    const lvBadge = document.getElementById("trans-lesson-level-badge");
    if (lvBadge) lvBadge.innerHTML = renderLevelBadge(lesson.level);

    const titleEl = document.getElementById("trans-lesson-title");
    if (titleEl) titleEl.textContent = lesson.title;

    const gramEl = document.getElementById("trans-lesson-grammar");
    if (gramEl) gramEl.textContent = (lesson.grammarFocus || []).join(" · ");

    // Left Pane: Vietnamese source & non-spoiling hints ONLY (safe index-based onclick!)
    const viEl = document.getElementById("trans-vietnamese-text");
    if (viEl) viEl.textContent = lesson.vietnameseText;

    const viWords = countWordsInEssay(lesson.vietnameseText);
    const viSents = splitSentencesClean(lesson.vietnameseText).length;
    const viStats = document.getElementById("trans-vi-stats");
    if (viStats) viStats.textContent = `${viWords} từ • ${viSents} câu`;

    activeTransHints = Array.isArray(lesson.hints) ? lesson.hints : [];
    const hintsEl = document.getElementById("trans-hints-list");
    if (hintsEl) {
        hintsEl.innerHTML = activeTransHints.map((h, idx) => `
            <li class="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/90 border border-white/10 hover:border-amber-400/40 transition">
                <div>
                    <span class="font-extrabold text-amber-300">${escHtml(h.en)}</span>
                    <span class="text-slate-400">: ${escHtml(h.vi)}</span>
                </div>
                <button type="button" onclick="insertTranslationHintByIdx(${idx})" class="px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold shrink-0">+ Chèn</button>
            </li>
        `).join("");
    }

    // Restore saved draft into Right Pane textarea
    const area = document.getElementById("trans-english-textarea");
    const savedDraft = tState.drafts[String(lesson.id)] || "";
    if (area) area.value = savedDraft;
    updateTranslationEditorStats(savedDraft);

    // STRICT NO-SPOILER GUARD: Always clear & hide evaluation/model answer until user submits!
    activeTransModelText = "";
    activeTransDrills = [];
    const fbPanel = document.getElementById("trans-feedback-panel");
    if (fbPanel) {
        fbPanel.innerHTML = "";
        fbPanel.classList.add("hidden");
    }

    updateTranslationStatusBadges(lesson.id, savedDraft, tState);

    const autosaveEl = document.getElementById("trans-autosave-indicator");
    if (autosaveEl) {
        autosaveEl.textContent = savedDraft.trim() ? "Đã khôi phục bản nháp tự động" : "Tự động lưu bản nháp";
    }

    populateTranslationLessonSelect(lesson.id);
    updateTranslationPrevNextButtons();
    if (!options.skipScroll) {
        document.getElementById("writing-mode-translation")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function updateTranslationStatusBadges(lessonId, draftText, tStateObj) {
    const tState = tStateObj || getTranslationState();
    const done = tState.completedIds.includes(Number(lessonId));
    const scObj = tState.scores[String(lessonId)];
    const hasDraft = Boolean(String(draftText || "").trim());

    const statusPill = document.getElementById("trans-lesson-status-pill");
    const submitStateText = document.getElementById("trans-submit-state-text");
    const draftBadge = document.getElementById("trans-draft-badge");

    if (done && scObj) {
        const scoreLabel = typeof scObj.bestScore === "number" ? `Cao nhất: ${scObj.bestScore}/10` : "Đã hoàn thành (Cục bộ)";
        if (statusPill) {
            statusPill.className = "px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-extrabold text-emerald-300";
            statusPill.textContent = `✅ ${scoreLabel}`;
        }
        if (submitStateText) submitStateText.textContent = `Đã nộp ${scObj.attempts || 1} lần • Bấm Nộp bài để chấm lượt mới`;
        if (draftBadge) {
            draftBadge.className = "px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-extrabold";
            draftBadge.textContent = hasDraft ? "Draft / Re-try" : "Completed";
        }
    } else {
        if (statusPill) {
            statusPill.className = hasDraft
                ? "px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-bold text-amber-300"
                : "px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-[11px] font-bold text-slate-300";
            statusPill.textContent = hasDraft ? "📝 Đang viết nháp" : "Chưa nộp";
        }
        if (submitStateText) submitStateText.textContent = "Bản dịch chưa được nộp";
        if (draftBadge) {
            draftBadge.className = "px-3 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-extrabold";
            draftBadge.textContent = "Draft";
        }
    }
}

/* ==================== DRAFT AUTO-SAVE (DEBOUNCED + FLUSH ON UNLOAD), HINT INSERT & CLEAR ==================== */
function splitSentencesClean(text) {
    const clean = String(text || "").trim();
    if (!clean) return [];
    // Protect common abbreviations & decimal numbers before splitting
    const protectedTxt = clean
        .replace(/\b(Mr|Mrs|Ms|Dr|Prof|St|e\.g|i\.e)\./gi, "$1<DOT>")
        .replace(/(\d)\.(\d)/g, "$1<DOT>$2");
    return (protectedTxt.match(/[^.!?\n]+[.!?]*/g) || [protectedTxt])
        .map(s => s.replace(/<DOT>/g, ".").trim())
        .filter(Boolean);
}

function updateTranslationEditorStats(text) {
    const wc = countWordsInEssay(text);
    const sc = splitSentencesClean(text).length;
    const statsEl = document.getElementById("trans-en-stats");
    if (statsEl) statsEl.textContent = `${wc} từ • ${sc} câu`;
}

function flushPendingTranslationDraft() {
    clearTimeout(transDraftSaveTimer);
    transDraftSaveTimer = null;
    if (transPendingDraftLessonId === null || transPendingDraftText === null) return;
    const lid = transPendingDraftLessonId;
    const txt = transPendingDraftText;
    transPendingDraftLessonId = null;
    transPendingDraftText = null;

    const tState = getTranslationState();
    tState.drafts[String(lid)] = txt;
    tState.lastLessonId = lid;
    saveTranslationState(tState);
}

function handleTranslationDraftInput(immediate = false) {
    const area = document.getElementById("trans-english-textarea");
    if (!area || currentTranslationLessonId === null) return;
    const text = area.value;
    updateTranslationEditorStats(text);
    updateTranslationStatusBadges(currentTranslationLessonId, text);

    transPendingDraftLessonId = currentTranslationLessonId;
    transPendingDraftText = text;

    const indicator = document.getElementById("trans-autosave-indicator");
    const markSaved = () => {
        flushPendingTranslationDraft();
        if (indicator) {
            const nowStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            indicator.textContent = `✓ Tự động lưu nháp lúc ${nowStr}`;
        }
    };

    if (immediate) {
        markSaved();
        return;
    }

    if (indicator) indicator.textContent = "Đang lưu nháp...";
    clearTimeout(transDraftSaveTimer);
    transDraftSaveTimer = setTimeout(markSaved, 220);
}

function saveTranslationDraftManual() {
    handleTranslationDraftInput(true);
    showToast("💾 Đã lưu bản nháp bài dịch của bạn!");
}

function clearTranslationEditorContent() {
    const area = document.getElementById("trans-english-textarea");
    if (!area) return;
    if (area.value.trim() && !confirm("Bạn có chắc muốn xóa toàn bộ nội dung đang viết trong bài này?")) {
        return;
    }
    area.value = "";
    handleTranslationDraftInput(true);
    activeTransModelText = "";
    activeTransDrills = [];
    const fbPanel = document.getElementById("trans-feedback-panel");
    if (fbPanel) {
        fbPanel.innerHTML = "";
        fbPanel.classList.add("hidden");
    }
    showToast("Đã xóa nội dung trình soạn thảo.");
}

function insertTranslationHintByIdx(idx) {
    const h = activeTransHints[idx];
    if (!h || !h.en) return;
    // Insert ONLY the clean primary English expression (never literal "A / B")
    const primaryPhrase = String(h.en).split("/")[0].trim();
    insertTranslationHint(primaryPhrase);
}

function insertTranslationHint(enPhrase) {
    const area = document.getElementById("trans-english-textarea");
    if (!area) return;
    const cleanPhrase = String(enPhrase || "").split("/")[0].trim();
    if (!cleanPhrase) return;

    // If textarea has not been focused yet and cursor is at 0 on a restored draft, append at end
    const isUnfocusedAtStart = document.activeElement !== area && area.selectionStart === 0 && area.selectionEnd === 0 && area.value.length > 0;
    const start = isUnfocusedAtStart
        ? area.value.length
        : (typeof area.selectionStart === "number" ? area.selectionStart : area.value.length);
    const end = isUnfocusedAtStart
        ? area.value.length
        : (typeof area.selectionEnd === "number" ? area.selectionEnd : area.value.length);

    const prefix = start > 0 && !/[\s(\["']$/.test(area.value.slice(0, start)) ? " " : "";
    area.value = area.value.slice(0, start) + prefix + cleanPhrase + area.value.slice(end);
    const newCursor = start + prefix.length + cleanPhrase.length;
    area.selectionStart = area.selectionEnd = newCursor;
    handleTranslationDraftInput(true);
    if (window.innerWidth >= 1024 || currentTranslationMobileTab === "en") {
        area.focus();
    } else {
        showToast(`Đã chèn "${cleanPhrase}" vào tab English Writing!`);
    }
}

/* ==================== 80-LESSON CATALOG MODAL ==================== */
function openTranslationCatalogModal() {
    const modal = document.getElementById("trans-catalog-modal");
    if (!modal) return;
    const tState = getTranslationState();
    const sub = document.getElementById("trans-catalog-subtitle");
    if (sub) sub.textContent = `Tiến độ: ${tState.completedIds.length}/80 bài đã hoàn thành — Bản dịch mẫu chỉ mở khóa sau khi nộp bài`;
    renderTranslationCatalogList("all");
    modal.classList.remove("hidden");
    const activeBtn = modal.querySelector('[data-active-lesson="true"]');
    if (activeBtn) {
        setTimeout(() => activeBtn.scrollIntoView({ block: "center", behavior: "smooth" }), 50);
    }
}

function closeTranslationCatalogModal() {
    document.getElementById("trans-catalog-modal")?.classList.add("hidden");
}

function renderTranslationCatalogList(levelFilter = "all") {
    document.querySelectorAll(".trans-cat-lv-btn").forEach(btn => {
        const active = btn.getAttribute("data-clv") === levelFilter;
        btn.className = `trans-cat-lv-btn px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
            active
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow"
                : "bg-slate-900 text-slate-300 border border-white/10 hover:text-white"
        }`;
    });

    const grid = document.getElementById("trans-catalog-grid");
    if (!grid) return;
    const tState = getTranslationState();
    const list = getAllTranslationLessons().filter(l => levelFilter === "all" || l.level === levelFilter);

    grid.innerHTML = list.map(l => {
        const done = tState.completedIds.includes(l.id);
        const hasDraft = Boolean((tState.drafts[String(l.id)] || "").trim());
        const scObj = tState.scores[String(l.id)];
        const active = l.id === Number(currentTranslationLessonId);
        return `
            <button type="button" data-active-lesson="${active ? "true" : "false"}" onclick="jumpToTranslationLessonFromCatalog(${l.id})" class="text-left p-3.5 rounded-2xl border transition space-y-1.5 ${
                active
                    ? "bg-violet-600/20 border-violet-400/60"
                    : (done ? "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400/60" : "bg-slate-950/85 border-white/10 hover:border-violet-500/40")
            }">
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1.5">
                        <span class="text-[11px] font-extrabold text-slate-400">#${l.id}</span>
                        ${renderLevelBadge(l.level)}
                    </div>
                    <span class="text-[11px] font-extrabold ${done ? "text-emerald-300" : (hasDraft ? "text-amber-300" : "text-slate-500")}">
                        ${done ? (typeof scObj?.bestScore === "number" ? `✅ ${scObj.bestScore}/10` : "✅ Đã nộp") : (hasDraft ? "📝 Nháp" : "Chưa làm")}
                    </span>
                </div>
                <p class="text-xs font-extrabold text-white line-clamp-1">${escHtml(l.title)}</p>
                <p class="text-[11px] text-slate-400 line-clamp-1">${escHtml((l.grammarFocus || []).join(" · "))}</p>
            </button>
        `;
    }).join("");
}

function jumpToTranslationLessonFromCatalog(lessonId) {
    const levelSel = document.getElementById("trans-level-filter");
    const searchEl = document.getElementById("trans-search-input");
    if (levelSel) levelSel.value = "all";
    if (searchEl) searchEl.value = "";
    closeTranslationCatalogModal();
    selectTranslationLesson(lessonId);
}

/* ==================== SUBMISSION & INTELLIGENT GRADING ==================== */
function setTranslationSubmitLoading(loading) {
    isTranslationSubmitting = loading;
    const btn = document.getElementById("trans-submit-btn");
    if (btn) {
        btn.disabled = loading;
        btn.classList.toggle("opacity-60", loading);
        btn.textContent = loading ? "⏳ ĐANG CHẤM BÀI & PHÂN TÍCH TỪNG CÂU..." : "✨ NỘP BÀI VÀ CHẤM ĐIỂM";
    }
}

async function submitTranslationLesson() {
    if (isTranslationSubmitting) return;
    const lesson = getTranslationLessonById(currentTranslationLessonId);
    if (!lesson) return;

    const area = document.getElementById("trans-english-textarea");
    const userTranslation = (area?.value || "").trim();
    const wc = countWordsInEssay(userTranslation);
    const viWc = countWordsInEssay(lesson.vietnameseText);
    const minRequiredWords = Math.max(8, Math.min(25, Math.floor(viWc * 0.22)));

    if (wc < minRequiredWords) {
        if (window.innerWidth < 1024 && currentTranslationMobileTab !== "en") {
            switchTranslationMobileTab("en");
            setTimeout(() => area?.focus(), 60);
        }
        showToast(`Bản dịch quá ngắn (cần tối thiểu ${minRequiredWords} từ cho bài cấp độ ${lesson.level} để chấm bài & mở khóa bản mẫu)!`, "error");
        return;
    }

    handleTranslationDraftInput(true);

    // Capture session identity to prevent cross-account or cross-lesson async race conditions
    const reqUid = window.__QENGLISH_ACTIVE_UID;
    const reqGen = ++translationRequestGen;
    const reqLessonId = lesson.id;

    const fbPanel = document.getElementById("trans-feedback-panel");
    if (fbPanel) {
        fbPanel.classList.remove("hidden");
        fbPanel.innerHTML = `
            <div class="glass-panel p-6 rounded-3xl border border-violet-500/35 text-center space-y-2 text-xs">
                <p class="text-sm font-extrabold text-violet-300 animate-pulse">⏳ Đang chấm điểm thang 10, so sánh từng câu & tạo 3 bài tập theo lỗi sai...</p>
                <p class="text-slate-400">Hệ thống đang phân loại lỗi ngữ pháp, từ vựng, lỗi dịch sát tiếng Việt và chấp nhận các cách diễn đạt hợp lệ khác nhau.</p>
            </div>
        `;
    }

    setTranslationSubmitLoading(true);
    let aiRes;
    try {
        aiRes = await AIClient.request("translation-eval", {
            lessonId: lesson.id,
            title: lesson.title,
            level: lesson.level,
            grammarFocus: lesson.grammarFocus,
            vietnameseText: lesson.vietnameseText,
            hints: lesson.hints,
            userTranslation,
            referenceSample: lesson.sampleTranslation
        });
    } finally {
        if (reqGen === translationRequestGen) {
            setTranslationSubmitLoading(false);
        }
    }

    // Abort safely if user logged out, switched accounts, or workspace reset mid-request!
    if (reqUid !== window.__QENGLISH_ACTIVE_UID || reqGen !== translationRequestGen) {
        return;
    }

    let evalMode = "local";
    let report;
    if (aiRes && aiRes.ok && aiRes.data) {
        evalMode = "ai";
        report = aiRes.data;
        if (!report.modelTranslation || !String(report.modelTranslation).trim()) {
            report.modelTranslation = lesson.sampleTranslation;
        }
        // Guarantee strictly 3 practice exercises even if upstream LLM returns fewer
        if (!Array.isArray(report.practiceExercises) || report.practiceExercises.length < 3) {
            const fallbackDrills = buildFallbackTranslationDrills(lesson, [], splitSentencesClean(lesson.vietnameseText), splitSentencesClean(lesson.sampleTranslation));
            report.practiceExercises = [...(report.practiceExercises || []), ...fallbackDrills].slice(0, 3);
        }
    } else {
        report = buildLocalTranslationEvaluation(lesson, userTranslation, aiRes?.error || "");
    }

    persistTranslationSubmission(lesson, userTranslation, report, evalMode);
    renderTranslationProgressSummary();
    renderTranslationHistoryList();

    // Only render feedback onto the active lesson pane if user is still viewing that same lesson
    if (currentTranslationLessonId === reqLessonId) {
        renderTranslationFeedback(lesson, userTranslation, report, evalMode);
        populateTranslationLessonSelect(lesson.id);

        const statusPill = document.getElementById("trans-lesson-status-pill");
        const submitStateText = document.getElementById("trans-submit-state-text");
        const draftBadge = document.getElementById("trans-draft-badge");
        const scoreTxt = typeof report.totalScore10 === "number" ? `${report.totalScore10}/10` : "Đã chấm cục bộ";
        if (statusPill) {
            statusPill.className = "px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-extrabold text-emerald-300";
            statusPill.textContent = `✅ ${scoreTxt}`;
        }
        if (submitStateText) submitStateText.textContent = `Đã nộp thành công • Kết quả: ${scoreTxt}`;
        if (draftBadge) {
            draftBadge.className = "px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-extrabold";
            draftBadge.textContent = "Submitted";
        }
        fbPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

/* ==================== HONEST LOCAL DIAGNOSTIC FALLBACK (NO FAKE AI 10/10) ==================== */
const VIETNAMESE_LITERAL_RULES = [
    {
        id: "very-like",
        regex: /\bvery\s+(like|love|enjoy|hate|want|hope)\b/i,
        category: "literal_translation",
        tag: "Dịch sát tiếng Việt",
        explanationVi: "Tiếng Việt nói 'rất thích', nhưng tiếng Anh không dùng 'very like/love'. Hãy dùng 'really like' hoặc 'like ... very much'.",
        fixFn: s => s.replace(/\bvery\s+(like|love|enjoy|hate|want|hope)\b/ig, "really $1"),
        drillPrompt: "Dịch câu sau sang tiếng Anh tự nhiên (tránh lỗi 'very like'):",
        drillSource: "Tôi rất thích đọc sách vào cuối tuần.",
        drillAnswer: "I really like reading books on weekends.",
        forbiddenPattern: /\bvery\s+(like|love|enjoy)\b/i
    },
    {
        id: "because-so",
        regex: /\b(because|since)\b[^.!?]*,\s*so\s+(?!that\b)(?:i|we|you|he|she|they|it|my|our|the|there)\b/i,
        category: "literal_translation",
        tag: "Lỗi dịch sát (vì... nên...)",
        explanationVi: "Trong tiếng Anh, không dùng đồng thời cả 'because/since' và 'so' trong cùng một câu ghép (chỉ giữ một từ nối).",
        fixFn: s => s.replace(/,\s*so\s+(?=(?:i|we|you|he|she|they|it|my|our|the|there)\b)/i, ", "),
        drillPrompt: "Sửa lỗi dùng thừa 'because ... so ...' trong câu sau:",
        drillSource: "Because it rained heavily, so we stayed at home.",
        drillAnswer: "Because it rained heavily, we stayed at home.",
        forbiddenPattern: /\bbecause\b[^.!?]*\bso\b/i
    },
    {
        id: "although-but",
        regex: /\b(although|though|even though)\b[^.!?]*,\s*but\s+(?!also\b)/i,
        category: "literal_translation",
        tag: "Lỗi dịch sát (dù... nhưng...)",
        explanationVi: "Trong tiếng Anh, không dùng cả 'although/though' và 'but' trong cùng một câu.",
        fixFn: s => s.replace(/,\s*but\s+(?!also\b)/i, ", "),
        drillPrompt: "Sửa lỗi dùng thừa 'although ... but ...' trong câu sau:",
        drillSource: "Although he was tired, but he finished his homework.",
        drillAnswer: "Although he was tired, he finished his homework.",
        forbiddenPattern: /\b(although|though)\b[^.!?]*\bbut\b/i
    },
    {
        id: "go-to-home",
        regex: /\b(go|goes|went|come|came|return|returned)\s+to\s+home\b/i,
        category: "grammar_error",
        tag: "Giới từ",
        explanationVi: "Trước 'home' với động từ chuyển động 'go/come/return' không dùng giới từ 'to' (dùng 'go home').",
        fixFn: s => s.replace(/\b(go|goes|went|come|came|return|returned)\s+to\s+home\b/ig, "$1 home"),
        drillPrompt: "Sửa lỗi giới từ với 'home' trong câu sau:",
        drillSource: "After class, I usually go to home early.",
        drillAnswer: "After class, I usually go home early.",
        forbiddenPattern: /\bto\s+home\b/i
    },
    {
        id: "open-close-light",
        regex: /\b(open|close)(?:s|ed)?\s+the\s+light(s)?\b/i,
        category: "literal_translation",
        tag: "Dịch sát tiếng Việt",
        explanationVi: "Tiếng Anh dùng 'turn on / switch on' (bật đèn) và 'turn off / switch off' (tắt đèn), không dùng 'open/close the light'.",
        fixFn: s => s.replace(/\bopen(s|ed)?\s+the\s+light(s)?\b/ig, "turn$1 on the light$2").replace(/\bclose(s|ed)?\s+the\s+light(s)?\b/ig, "turn$1 off the light$2"),
        drillPrompt: "Dịch câu sau tự nhiên (tránh 'open/close the light'):",
        drillSource: "Hãy tắt đèn trước khi rời khỏi phòng.",
        drillAnswer: "Please turn off the lights before leaving the room.",
        forbiddenPattern: /\b(open|close)\s+the\s+light/i
    },
    {
        id: "by-foot",
        regex: /\bby\s+foot\b/i,
        category: "unnatural_word",
        tag: "Giới từ phương tiện",
        explanationVi: "Đi bộ trong tiếng Anh dùng 'on foot' (hoặc động từ 'walk'), không dùng 'by foot'.",
        fixFn: s => s.replace(/\bby\s+foot\b/ig, "on foot"),
        drillPrompt: "Sửa lỗi giới từ phương tiện trong câu sau:",
        drillSource: "I often go to school by foot.",
        drillAnswer: "I often go to school on foot.",
        forbiddenPattern: /\bby\s+foot\b/i
    },
    {
        id: "family-have",
        regex: /\bmy\s+family\s+have\s+(?:\d+|two|three|four|five|six|seven|many)\s+(?:people|members)\b/i,
        category: "grammar_error",
        tag: "Hòa hợp chủ ngữ – động từ",
        explanationVi: "Khi nói số thành viên trong gia đình, dùng 'My family has ... people' hoặc tự nhiên hơn là 'There are ... people in my family'.",
        fixFn: s => s.replace(/\bmy\s+family\s+have\b/ig, "my family has"),
        drillPrompt: "Sửa lỗi hòa hợp chủ – vị trong câu sau:",
        drillSource: "My family have four people.",
        drillAnswer: "My family has four people.",
        forbiddenPattern: /\bmy\s+family\s+have\b/i
    },
    {
        id: "make-me-very",
        regex: /\b(make|makes|made)\s+me\s+(feel\s+)?very\s+(happy|sad|tired|excited)\b/i,
        category: "correct_but_unnatural",
        tag: "Diễn đạt tự nhiên",
        explanationVi: "Câu đúng ngữ pháp nhưng hơi chịu ảnh hưởng tiếng Việt; hãy dùng gọn hơn như 'makes me really happy' hoặc 'leaves me exhausted'.",
        fixFn: s => s.replace(/\b(make|makes|made)\s+me\s+(?:feel\s+)?very\s+(happy|sad|tired|excited)\b/ig, "$1 me really $2"),
        drillPrompt: "Viết lại câu sau sang cách diễn đạt tự nhiên hơn:",
        drillSource: "This trip makes me feel very happy.",
        drillAnswer: "This trip makes me really happy.",
        forbiddenPattern: /\bmakes?\s+me\s+feel\s+very\s+happy\b/i
    }
];

function buildFallbackTranslationDrills(lesson, triggeredDrills, viSents, sampleSents) {
    const exercises = [];
    const seenKeys = new Set();

    // 1. Add deduplicated drills from real errors caught in learner's attempt
    for (const d of (triggeredDrills || [])) {
        if (exercises.length >= 3) break;
        const key = d.ruleId || d.sourceVietnamese;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        exercises.push({ id: exercises.length + 1, ...d });
    }

    // 2. Pair each hint with the ACTUAL sentence in the lesson that contains that hint/concept
    const hints = lesson.hints || [];
    for (const h of hints) {
        if (exercises.length >= 3) break;
        const cleanEn = String(h.en || "").split("/")[0].trim();
        const cleanVi = String(h.vi || "").split("/")[0].trim();
        if (!cleanEn) continue;
        // Find matching sentence index in sampleSents or viSents
        let matchIdx = sampleSents.findIndex(s => s.toLowerCase().includes(cleanEn.toLowerCase()));
        if (matchIdx === -1 && cleanVi) {
            matchIdx = viSents.findIndex(s => s.toLowerCase().includes(cleanVi.toLowerCase()));
        }
        if (matchIdx === -1) matchIdx = exercises.length % Math.max(1, viSents.length);
        const key = `hint-${cleanEn.toLowerCase()}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);

        exercises.push({
            id: exercises.length + 1,
            focusAreaVi: `Vận dụng cụm từ "${cleanEn}"`,
            promptVi: `Dịch câu sau sang tiếng Anh tự nhiên (có thể dùng "${cleanEn}"):`,
            sourceVietnamese: viSents[matchIdx] || lesson.vietnameseText,
            hint: `${cleanEn} (${h.vi})`,
            expectedAnswer: sampleSents[matchIdx] || lesson.sampleTranslation,
            explanationVi: `Chú ý kết hợp cụm từ "${cleanEn}" đúng ngữ cảnh và trọng tâm: ${(lesson.grammarFocus || []).join(", ")}.`,
            forbiddenPattern: null
        });
    }

    // 3. Guarantee strictly 3 exercises
    while (exercises.length < 3) {
        const idx = exercises.length;
        const gList = lesson.grammarFocus || ["Luyện dịch tự nhiên"];
        exercises.push({
            id: idx + 1,
            focusAreaVi: gList[idx % gList.length],
            promptVi: "Dịch lại câu sau sang tiếng Anh tự nhiên:",
            sourceVietnamese: viSents[idx % Math.max(1, viSents.length)] || lesson.vietnameseText,
            hint: "",
            expectedAnswer: sampleSents[idx % Math.max(1, sampleSents.length)] || lesson.sampleTranslation,
            explanationVi: "Đối chiếu thì, giới từ và cách diễn đạt tự nhiên với câu tham khảo.",
            forbiddenPattern: null
        });
    }

    return exercises.slice(0, 3);
}

function buildLocalTranslationEvaluation(lesson, userTranslation, aiOfflineReason) {
    const viSents = splitSentencesClean(lesson.vietnameseText);
    const enSents = splitSentencesClean(userTranslation);
    const sampleSents = splitSentencesClean(lesson.sampleTranslation);

    const sentenceComparisons = [];
    const triggeredDrills = [];
    let grammarIssueCount = 0;
    let literalCount = 0;
    let styleCount = 0;

    // Avoid false-positive "missing sentence" flags if learner naturally combined sentences
    const totalRows = Math.max(viSents.length, enSents.length);
    for (let i = 0; i < totalRows; i++) {
        const viS = viSents[i] || "(Câu bổ sung)";
        const enS = enSents[i] || "";
        const refS = sampleSents[i] || "";

        if (!enS) {
            const learnerTotalWords = countWordsInEssay(userTranslation);
            const refTotalWords = countWordsInEssay(lesson.sampleTranslation);
            const likelyMerged = learnerTotalWords >= Math.floor(refTotalWords * 0.72);
            if (!likelyMerged) grammarIssueCount++;
            sentenceComparisons.push({
                vietnameseSentence: viS,
                userSentence: likelyMerged ? "(Có thể bạn đã gộp ý vào câu trước)" : "(Bạn chưa dịch câu này)",
                suggestedSentence: refS || "Hãy bổ sung câu dịch tiếng Anh cho ý này.",
                category: likelyMerged ? "valid_alternative" : "grammar_error",
                issueTags: [likelyMerged ? "Gộp câu" : "Thiếu ý"],
                explanationVi: likelyMerged
                    ? "Số câu tiếng Anh ít hơn số câu tiếng Việt do bạn có thể đã gộp ý. Hãy đối chiếu với câu tham khảo bên dưới để chắc chắn không bỏ sót thông tin."
                    : "Đoạn dịch hiện đang thiếu nội dung tương ứng với câu tiếng Việt này.",
                alternativeAcceptedNoteVi: ""
            });
            continue;
        }

        const localDiag = typeof analyzeEnglishTextLocal === "function"
            ? analyzeEnglishTextLocal(enS)
            : { isValid: true, correctedText: enS, issues: [] };

        // Filter out false-positive capitalization alerts on Vietnamese proper nouns after commas
        const filteredLocalIssues = (localDiag.issues || []).filter(iss => {
            if (iss.errorType === "Viết hoa & Dấu câu" && /chữ hoa giữa câu/i.test(iss.explanationVi || "")) {
                return false;
            }
            return true;
        });

        const matchedRule = VIETNAMESE_LITERAL_RULES.find(r => r.regex.test(enS));

        if (matchedRule) {
            if (matchedRule.category === "literal_translation") literalCount++;
            else if (matchedRule.category === "grammar_error") grammarIssueCount++;
            else styleCount++;

            const suggested = matchedRule.fixFn(filteredLocalIssues.length ? (localDiag.correctedText || enS) : enS);
            const extraExp = filteredLocalIssues.length ? " " + filteredLocalIssues.map(x => x.explanationVi).join(" ") : "";
            sentenceComparisons.push({
                vietnameseSentence: viS,
                userSentence: enS,
                suggestedSentence: suggested,
                category: matchedRule.category,
                issueTags: [matchedRule.tag],
                explanationVi: matchedRule.explanationVi + extraExp,
                alternativeAcceptedNoteVi: refS ? `Tham khảo thêm một cách diễn đạt tự nhiên: "${refS}"` : ""
            });
            triggeredDrills.push({
                ruleId: matchedRule.id,
                focusAreaVi: matchedRule.tag,
                promptVi: matchedRule.drillPrompt,
                sourceVietnamese: matchedRule.drillSource,
                hint: "",
                expectedAnswer: matchedRule.drillAnswer,
                explanationVi: matchedRule.explanationVi,
                forbiddenPattern: matchedRule.forbiddenPattern || null
            });
        } else if (filteredLocalIssues.length > 0) {
            grammarIssueCount++;
            const firstIss = filteredLocalIssues[0];
            sentenceComparisons.push({
                vietnameseSentence: viS,
                userSentence: enS,
                suggestedSentence: localDiag.correctedText || enS,
                category: "grammar_error",
                issueTags: [firstIss.errorType || "Ngữ pháp / Chính tả"],
                explanationVi: filteredLocalIssues.map(x => x.explanationVi).join(" "),
                alternativeAcceptedNoteVi: refS ? `Tham khảo cách diễn đạt bản mẫu: "${refS}"` : ""
            });
            triggeredDrills.push({
                ruleId: `local-${i}-${firstIss.errorType}`,
                focusAreaVi: firstIss.errorType || "Sửa lỗi ngữ pháp & chính tả",
                promptVi: "Sửa lại câu sau cho đúng ngữ pháp và chính tả:",
                sourceVietnamese: enS,
                hint: "",
                expectedAnswer: localDiag.correctedText || enS,
                explanationVi: firstIss.explanationVi,
                forbiddenPattern: null,
                mustDifferFrom: enS
            });
        } else {
            // Do NOT penalize valid alternative phrasing!
            const sim = refS && typeof textSimilarityBasic === "function"
                ? textSimilarityBasic(enS.toLowerCase(), refS.toLowerCase())
                : 0.5;
            const isShort = countWordsInEssay(enS) < Math.max(4, Math.floor(countWordsInEssay(refS) * 0.45));
            sentenceComparisons.push({
                vietnameseSentence: viS,
                userSentence: enS,
                suggestedSentence: refS || enS,
                category: isShort ? "correct_but_unnatural" : "valid_alternative",
                issueTags: isShort ? ["Thiếu chi tiết / Có thể mở rộng"] : ["Hợp lệ (Cục bộ)"],
                explanationVi: isShort
                    ? "Câu không có lỗi quy tắc cơ bản, nhưng hơi ngắn so với lượng thông tin của câu tiếng Việt gốc."
                    : "Không phát hiện lỗi quy tắc cơ bản. Nhiều cách dịch khác bản mẫu vẫn hoàn toàn hợp lệ (hãy kết nối AI Backend để chấm sâu sắc hơn về ngữ nghĩa & sắc thái từ).",
                alternativeAcceptedNoteVi: sim < 0.75 && refS
                    ? "Không bị trừ điểm chỉ vì diễn đạt khác bản mẫu — hãy đối chiếu bản mẫu để học thêm collocations tự nhiên."
                    : ""
            });
        }
    }

    const exercises = buildFallbackTranslationDrills(lesson, triggeredDrills, viSents, sampleSents);
    const hints = lesson.hints || [];
    const usedHints = hints.filter(h => {
        const opts = String(h.en || "").split("/").map(x => x.trim().toLowerCase()).filter(Boolean);
        return opts.some(opt => userTranslation.toLowerCase().includes(opt));
    });

    return {
        isLocalFallback: true,
        offlineNotice: aiOfflineReason || "AI Backend chưa được kết nối.",
        totalScore10: null, // Strictly honest: never fabricate a 10/10 semantic AI score offline!
        scorePct: Math.max(40, Math.min(95, 85 - grammarIssueCount * 8 - literalCount * 7 - styleCount * 4)),
        criteria: null,
        overviewVi: `Chế độ phân tích cục bộ đã kiểm tra ${enSents.length}/${viSents.length} câu, phát hiện ${grammarIssueCount} lỗi quy tắc/thiếu câu và ${literalCount} dấu hiệu dịch sát tiếng Việt; bạn đã vận dụng ${usedHints.length}/${hints.length} từ gợi ý. Kết nối AI Backend (GEMINI_API_KEY / OPENAI_API_KEY) để chấm điểm ngữ nghĩa thang 10 đầy đủ.`,
        strengthsVi: [
            `Hoàn thành ${enSents.length}/${viSents.length} câu của bài "${lesson.title}".`,
            usedHints.length ? `Đã áp dụng tốt từ gợi ý: ${usedHints.map(h => h.en.split("/")[0].trim()).join(", ")}.` : "Đã tự diễn đạt độc lập bằng vốn từ cá nhân."
        ],
        keyIssuesVi: [
            grammarIssueCount > 0 ? `Có ${grammarIssueCount} câu cần rà lại lỗi ngữ pháp/chính tả hoặc thiếu ý.` : "Không phát hiện lỗi quy tắc cơ bản.",
            literalCount > 0 ? `Có ${literalCount} chỗ có dấu hiệu dịch sát từ tiếng Việt.` : "Chưa phát hiện mẫu lỗi dịch sát từ phổ biến."
        ],
        sentenceComparisons,
        modelTranslation: lesson.sampleTranslation,
        practiceExercises: exercises
    };
}

/* ==================== RENDER POST-SUBMISSION REPORT (ZERO INLINE JS XSS!) ==================== */
function speakCurrentModelTranslation() {
    if (!activeTransModelText) return;
    if (typeof speakText === "function") speakText(activeTransModelText, 0.95);
}

function renderTranslationFeedback(lesson, userTranslation, r, evalMode) {
    const panel = document.getElementById("trans-feedback-panel");
    if (!panel) return;
    panel.classList.remove("hidden");

    const isAi = evalMode === "ai";
    const critList = r.criteria
        ? [r.criteria.accuracy, r.criteria.grammar, r.criteria.vocabulary, r.criteria.naturalness].filter(Boolean)
        : [];
    const comps = Array.isArray(r.sentenceComparisons) ? r.sentenceComparisons : [];
    activeTransDrills = Array.isArray(r.practiceExercises) ? r.practiceExercises.slice(0, 3) : [];
    activeTransModelText = r.modelTranslation || lesson.sampleTranslation || "";

    panel.innerHTML = `
        <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-violet-500/35 space-y-6 text-xs">
            <!-- 1. Score Header & Honest Mode Banner -->
            <div class="p-4 rounded-2xl ${isAi ? "bg-violet-500/15 border-violet-500/35" : "bg-amber-500/10 border-amber-500/30"} border flex flex-wrap items-center justify-between gap-4">
                <div class="space-y-1 max-w-2xl">
                    <p class="text-sm font-extrabold ${isAi ? "text-violet-200" : "text-amber-300"}">
                        ${isAi
                            ? `🤖 Kết Quả Chấm Dịch AI — Bài ${lesson.id}: ${escHtml(lesson.title)}`
                            : `🛠️ Phân Tích Cục Bộ (AI Backend chưa kết nối) — Bài ${lesson.id}: ${escHtml(lesson.title)}`}
                    </p>
                    <p class="text-slate-300 leading-relaxed">${escHtml(r.overviewVi || "")}</p>
                    ${!isAi ? `<p class="text-[11px] text-amber-200">ℹ️ ${escHtml(r.offlineNotice || "AI Backend chưa kết nối.")} — Hệ thống không bịa điểm AI 10/10 khi fallback cục bộ. Bản dịch mẫu và 3 câu luyện tập đã được mở khóa sau khi bạn nộp bài.</p>` : ""}
                </div>
                <div class="flex items-center gap-3 shrink-0">
                    <div class="px-5 py-3 rounded-2xl bg-slate-950 border border-white/15 text-center">
                        <span class="text-[10px] uppercase font-bold text-slate-400 block">${isAi ? "Điểm tổng (/10)" : "Chỉ số kỹ thuật"}</span>
                        <span class="text-2xl font-black text-cyan-300">
                            ${typeof r.totalScore10 === "number" ? `${r.totalScore10} / 10` : `${r.scorePct || 0}%`}
                        </span>
                    </div>
                    ${renderSourceBadge(isAi ? "ai-generated" : "local-browser")}
                </div>
            </div>

            <!-- 4 Criteria Breakdown (AI Mode) -->
            ${critList.length > 0 ? `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    ${critList.map(c => {
                        const pct = Math.min(100, Math.round(((Number(c.scoreOutOf2_5) || 0) / 2.5) * 100));
                        return `
                            <div class="p-3.5 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2">
                                <div class="flex items-center justify-between gap-2">
                                    <span class="font-extrabold text-white text-[11px]">${escHtml(c.label)}</span>
                                    <span class="font-black text-cyan-300">${c.scoreOutOf2_5}/2.5</span>
                                </div>
                                <div class="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-violet-500 to-cyan-400" style="width:${pct}%"></div>
                                </div>
                                <p class="text-[11px] text-slate-300 leading-relaxed">${escHtml(c.feedbackVi || "")}</p>
                            </div>
                        `;
                    }).join("")}
                </div>
            ` : ""}

            <!-- 2. Sentence-by-Sentence Comparison & 5-Category Error Classification -->
            <div class="space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <h4 class="text-sm font-extrabold text-white">🔍 So Sánh & Sửa Lỗi Từng Câu (Phân loại 5 nhóm minh bạch)</h4>
                    <span class="text-[11px] text-emerald-300 font-semibold">✓ Chấp nhận nhiều cách dịch hợp lệ</span>
                </div>
                <div class="space-y-3">
                    ${comps.map((c, idx) => {
                        const meta = TRANS_CATEGORY_META[c.category] || TRANS_CATEGORY_META.grammar_error;
                        return `
                            <div class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2.5">
                                <div class="flex flex-wrap items-center justify-between gap-2">
                                    <span class="font-extrabold text-slate-300">Câu ${idx + 1}</span>
                                    <div class="flex flex-wrap items-center gap-1.5">
                                        <span class="px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold ${meta.badgeClass}">${meta.icon} ${escHtml(meta.label)}</span>
                                        ${(c.issueTags || []).map(tag => `<span class="px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 text-[10px] text-slate-300 font-bold">${escHtml(tag)}</span>`).join("")}
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                    <div class="p-3 rounded-xl bg-slate-900/70 border border-white/5 space-y-1">
                                        <span class="text-[10px] uppercase font-bold text-slate-400">🇻🇳 Câu gốc tiếng Việt</span>
                                        <p class="text-slate-200 leading-relaxed">${escHtml(c.vietnameseSentence)}</p>
                                    </div>
                                    <div class="p-3 rounded-xl bg-slate-900/70 border border-white/5 space-y-1">
                                        <span class="text-[10px] uppercase font-bold text-amber-300">✏️ Câu bạn đã dịch</span>
                                        <p class="text-white leading-relaxed">${escHtml(c.userSentence)}</p>
                                    </div>
                                </div>
                                ${c.suggestedSentence ? `
                                    <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                                        <span class="text-[10px] uppercase font-bold text-emerald-300">✨ Đề xuất tự nhiên hơn</span>
                                        <p class="text-emerald-100 font-semibold leading-relaxed">${escHtml(c.suggestedSentence)}</p>
                                    </div>
                                ` : ""}
                                ${c.explanationVi ? `<p class="text-slate-300 leading-relaxed">💡 <strong>Giải thích:</strong> ${escHtml(c.explanationVi)}</p>` : ""}
                                ${c.alternativeAcceptedNoteVi ? `<p class="text-[11px] text-emerald-300 italic">🌿 ${escHtml(c.alternativeAcceptedNoteVi)}</p>` : ""}
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>

            <!-- 3. Natural Model Translation (Unlocked ONLY after submission!) -->
            <div class="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/35 space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <h4 class="text-sm font-extrabold text-emerald-300">🌟 Bản Dịch Mẫu Tự Nhiên (Đã mở khóa sau khi nộp)</h4>
                    <button type="button" onclick="speakCurrentModelTranslation()" class="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/35 text-emerald-200 text-xs font-bold transition">🔊 Nghe đọc bản mẫu</button>
                </div>
                <p id="trans-model-answer-text" class="text-sm text-emerald-50 leading-7 whitespace-pre-line">${escHtml(activeTransModelText)}</p>
                <p class="text-[11px] text-slate-400">Lưu ý: Đây là một phiên bản tự nhiên đúng ngữ cảnh để tham khảo — nhiều cách diễn đạt tiếng Anh chuẩn xác khác vẫn được công nhận.</p>
            </div>

            <!-- 4. Strictly 3 Targeted Practice Exercises based on Learner's Mistakes -->
            <div class="p-5 rounded-2xl bg-violet-950/25 border border-violet-500/35 space-y-3.5">
                <div>
                    <h4 class="text-sm font-extrabold text-violet-200">🎯 3 Câu Luyện Tập Nhanh Theo Lỗi Bạn Vừa Gặp</h4>
                    <p class="text-[11px] text-slate-400">Viết bản tiếng Anh của bạn và bấm Kiểm tra (hoặc nhấn Enter) để củng cố ngay lỗi sai vừa phát hiện.</p>
                </div>
                <div class="space-y-3">
                    ${activeTransDrills.map((ex, idx) => `
                        <div class="trans-drill-card p-3.5 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <span class="font-extrabold text-cyan-300">Câu luyện tập ${idx + 1}/3 — ${escHtml(ex.focusAreaVi || "Luyện sửa lỗi")}</span>
                                ${ex.hint ? `<span class="text-[11px] text-amber-300 font-semibold">Gợi ý: ${escHtml(ex.hint)}</span>` : ""}
                            </div>
                            <p class="text-slate-300">${escHtml(ex.promptVi || "")}</p>
                            <p class="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-white font-semibold">${escHtml(ex.sourceVietnamese || "")}</p>
                            <div class="flex flex-wrap gap-2">
                                <input type="text" aria-label="Nhập câu trả lời luyện tập ${idx + 1}" onkeydown="if(event.key==='Enter'){event.preventDefault();checkTranslationPracticeExercise(this.nextElementSibling, ${idx});}" placeholder="Nhập câu tiếng Anh của bạn..." class="flex-1 min-w-[200px] bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-400">
                                <button type="button" onclick="checkTranslationPracticeExercise(this, ${idx})" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition">Kiểm tra</button>
                            </div>
                            <div class="trans-drill-fb hidden text-[11px]"></div>
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>
    `;
}

function checkTranslationPracticeExercise(btnEl, drillIdx) {
    const ex = activeTransDrills[Number(drillIdx)];
    if (!ex || !btnEl) return;
    const card = btnEl.closest(".trans-drill-card");
    const input = card?.querySelector("input");
    const fb = card?.querySelector(".trans-drill-fb");
    if (!input || !fb) return;

    const ans = input.value.trim();
    if (!ans) {
        showToast("Hãy nhập câu trả lời của bạn trước khi kiểm tra!", "warning");
        return;
    }

    const expectedAnswer = String(ex.expectedAnswer || "");
    const explanationVi = String(ex.explanationVi || "");
    const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9\s']/g, "").replace(/\s+/g, " ").trim();

    // Prevent faulty unchanged sentences from passing word-overlap checks!
    const stillHasForbidden = ex.forbiddenPattern instanceof RegExp && ex.forbiddenPattern.test(ans);
    const unchangedBroken = Boolean(ex.mustDifferFrom) && norm(ans) === norm(ex.mustDifferFrom);
    const unchangedSource = norm(ex.sourceVietnamese) === norm(ans) && norm(ex.sourceVietnamese) !== norm(expectedAnswer);

    let isGood = false;
    if (!stillHasForbidden && !unchangedBroken && !unchangedSource) {
        if (norm(ans) === norm(expectedAnswer)) {
            isGood = true;
        } else {
            const sim = typeof textSimilarityBasic === "function"
                ? textSimilarityBasic(norm(ans), norm(expectedAnswer))
                : 0;
            isGood = sim >= 0.72;
        }
    }

    fb.classList.remove("hidden");
    if (stillHasForbidden || unchangedBroken || unchangedSource) {
        fb.innerHTML = `<div class="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-200 space-y-1">
            <p class="font-extrabold">⚠️ Lỗi mục tiêu vẫn chưa được sửa trong câu trả lời của bạn!</p>
            <p class="text-white font-semibold">Đáp án tham khảo: "${escHtml(expectedAnswer)}"</p>
            ${explanationVi ? `<p class="text-slate-300">💡 ${escHtml(explanationVi)}</p>` : ""}
        </div>`;
        return;
    }

    fb.innerHTML = isGood
        ? `<div class="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 space-y-1">
               <p class="font-extrabold">✅ Rất tốt! Bạn đã sửa/dịch chính xác và tự nhiên.</p>
               <p class="text-slate-200">Đáp án tham khảo: <strong>"${escHtml(expectedAnswer)}"</strong></p>
               ${explanationVi ? `<p class="text-slate-300">💡 ${escHtml(explanationVi)}</p>` : ""}
           </div>`
        : `<div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
               <p class="font-extrabold">💡 Hãy đối chiếu với đáp án tham khảo (nhiều cách dịch đúng ngữ pháp khác vẫn hợp lệ):</p>
               <p class="text-white font-semibold">"${escHtml(expectedAnswer)}"</p>
               ${explanationVi ? `<p class="text-slate-300">${escHtml(explanationVi)}</p>` : ""}
           </div>`;
}

/* ==================== PERSISTENCE, PROGRESS & CLOUD SYNC ==================== */
function persistTranslationSubmission(lesson, userTranslation, report, evalMode) {
    const tState = getTranslationState();
    const lidKey = String(lesson.id);
    const nowIso = new Date().toISOString();

    if (!tState.completedIds.includes(lesson.id)) {
        tState.completedIds.push(lesson.id);
        tState.completedIds.sort((a, b) => a - b);
    }

    const prevScoreObj = tState.scores[lidKey] || {};
    const newScore10 = typeof report.totalScore10 === "number" ? report.totalScore10 : null;
    const prevBest = typeof prevScoreObj.bestScore === "number" ? prevScoreObj.bestScore : null;
    const bestScore = (newScore10 !== null && prevBest !== null)
        ? Math.max(newScore10, prevBest)
        : (newScore10 ?? prevBest);

    tState.scores[lidKey] = {
        latestScore: newScore10,
        bestScore,
        attempts: (prevScoreObj.attempts || 0) + 1,
        evalMode,
        updatedAt: nowIso
    };

    // Strip RegExp objects before JSON serialization in history
    const serializableReport = {
        ...report,
        practiceExercises: (report.practiceExercises || []).map(ex => ({
            ...ex,
            forbiddenPattern: undefined
        }))
    };

    const record = {
        id: `trans-${lesson.id}-${Date.now()}`,
        lessonId: lesson.id,
        title: lesson.title,
        level: lesson.level,
        userTranslation,
        wordCount: countWordsInEssay(userTranslation),
        totalScore10: newScore10,
        scorePct: report.scorePct ?? 75,
        evalMode,
        report: serializableReport,
        at: nowIso
    };

    tState.history.unshift(record);
    if (tState.history.length > 80) tState.history = tState.history.slice(0, 80);
    saveTranslationState(tState);

    // Log up to 3 real mistakes per submission (skip synthetic placeholder rows!)
    const realMistakes = (report.sentenceComparisons || []).filter(c =>
        c.category &&
        c.category !== "valid_alternative" &&
        c.userSentence &&
        !/^\(/.test(c.userSentence.trim()) &&
        c.suggestedSentence
    ).slice(0, 3);

    realMistakes.forEach(c => {
        autoLogMistake({
            errorCategory: (TRANS_CATEGORY_META[c.category]?.label) || "Lỗi dịch Việt–Anh",
            wrongText: c.userSentence,
            correctText: c.suggestedSentence,
            explanation: c.explanationVi || "",
            skill: "writing"
        });
    });

    // Sync to Supabase user_writing_submissions table if Cloud mode active
    if (typeof CloudClient !== "undefined" && typeof CloudClient.syncWritingSubmissionRecord === "function") {
        CloudClient.syncWritingSubmissionRecord({
            id: record.id,
            topicId: `trans-lesson-${lesson.id}`,
            title: `[Dịch Việt-Anh #${lesson.id}] ${lesson.title}`,
            gradingMode: "vi_en_translation",
            level: lesson.level,
            prompt: lesson.vietnameseText,
            originalText: userTranslation,
            wordCount: record.wordCount,
            totalScore10: newScore10,
            scorePct: record.scorePct,
            criteria: report.criteria || {},
            aiReport: serializableReport,
            evalMode,
            at: nowIso
        });
    }

    // Update global QEnglish progress metrics (only push scoreEntry when real AI score exists!)
    const metricPatch = { writingDone: 1 };
    if (newScore10 !== null) {
        metricPatch.scoreEntry = {
            skill: "writing",
            scorePct: Math.round(newScore10 * 10),
            level: lesson.level,
            title: `Dịch #${lesson.id}: ${lesson.title}`
        };
    }
    logStudyMetrics(
        metricPatch,
        {
            type: "writing",
            skill: "writing",
            title: `Luyện dịch #${lesson.id}: ${lesson.title}${newScore10 !== null ? ` (${newScore10}/10)` : ""}`,
            scorePct: newScore10 !== null ? Math.round(newScore10 * 10) : null
        }
    );

    showToast(
        newScore10 !== null
            ? `🎉 Đã chấm bài #${lesson.id}: ${newScore10}/10 điểm! Bản dịch mẫu và 3 câu luyện tập đã mở khóa.`
            : `✅ Đã nộp bài #${lesson.id}! Bản dịch mẫu và 3 câu luyện tập đã mở khóa.`
    );
}

function renderTranslationProgressSummary() {
    const tState = getTranslationState();
    const total = getAllTranslationLessons().length || 80;
    const doneCount = new Set(tState.completedIds.map(Number).filter(Number.isFinite)).size;
    const pct = Math.round((doneCount / total) * 100);

    const badge = document.getElementById("trans-progress-badge");
    if (badge) badge.textContent = `${doneCount} / ${total} bài đã hoàn thành (${pct}%)`;

    const bar = document.getElementById("trans-progress-bar");
    if (bar) bar.style.width = `${pct}%`;

    const scoredVals = Object.values(tState.scores || {})
        .map(s => (typeof s?.bestScore === "number" ? s.bestScore : null))
        .filter(v => v !== null);
    const avgBadge = document.getElementById("trans-avg-score-badge");
    if (avgBadge) {
        if (scoredVals.length > 0) {
            const avg = Math.round((scoredVals.reduce((a, b) => a + b, 0) / scoredVals.length) * 10) / 10;
            avgBadge.textContent = `TB AI: ${avg} / 10`;
        } else {
            avgBadge.textContent = "TB AI: Chưa có";
        }
    }
}

function renderTranslationHistoryList() {
    const container = document.getElementById("trans-history-list");
    const countEl = document.getElementById("trans-history-count");
    if (!container) return;

    const tState = getTranslationState();
    activeTransHistoryList = (tState.history || []).slice(0, 15);
    if (countEl) countEl.textContent = `${(tState.history || []).length} lượt nộp`;

    if (!activeTransHistoryList.length) {
        container.innerHTML = `<p class="text-xs text-slate-400">Chưa có bài dịch nào được nộp. Hãy chọn một bài ở trên, nhập bản dịch và bấm Nộp bài để xem kết quả!</p>`;
        return;
    }

    container.innerHTML = activeTransHistoryList.map((item, idx) => `
        <div class="p-3.5 rounded-xl bg-slate-950/85 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div class="space-y-0.5">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-extrabold text-white">Bài ${item.lessonId}: ${escHtml(item.title)}</span>
                    ${renderLevelBadge(item.level)}
                    ${renderSourceBadge(item.evalMode === "ai" ? "ai-generated" : "local-browser")}
                </div>
                <p class="text-[11px] text-slate-400">${item.wordCount || 0} từ • ${new Date(item.at).toLocaleString("vi-VN")}</p>
            </div>
            <div class="flex items-center gap-2.5">
                <span class="font-black text-cyan-300">${typeof item.totalScore10 === "number" ? `${item.totalScore10} / 10` : `${item.scorePct || 0}% (Cục bộ)`}</span>
                <button type="button" onclick="openTranslationHistoryByIdx(${idx})" class="px-3 py-1.5 rounded-lg bg-violet-600/25 hover:bg-violet-600/40 border border-violet-400/35 text-violet-200 font-bold transition">Xem kết quả</button>
            </div>
        </div>
    `).join("");
}

function openTranslationHistoryByIdx(idx) {
    const rec = activeTransHistoryList[Number(idx)];
    if (!rec) return;
    const lesson = getTranslationLessonById(rec.lessonId);
    if (!lesson) return;

    selectTranslationLesson(lesson.id, { skipScroll: true });
    const area = document.getElementById("trans-english-textarea");
    if (area) area.value = rec.userTranslation || "";
    updateTranslationEditorStats(rec.userTranslation || "");

    if (rec.report) {
        renderTranslationFeedback(lesson, rec.userTranslation || "", rec.report, rec.evalMode || "local");
        document.getElementById("trans-feedback-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}
