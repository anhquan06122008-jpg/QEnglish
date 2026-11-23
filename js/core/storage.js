/* ==========================================================================
   QEnglish - Core Storage, Safe Migration, SRS, Analytics & Backup Engine
   RULE #1: DATA PRESERVATION FIRST — Never overwrite/destroy legacy keys!
   Compatible legacy keys: qenglish_deck_v2, qenglish_deck_v1, fpt_eng_deck_v3
   ========================================================================== */

const BASE_STORAGE_KEYS = {
    DECK_V2: "qenglish_deck_v2",
    DECK_V1: "qenglish_deck_v1",
    FPT_V3: "fpt_eng_deck_v3",
    LEGACY_SNAPSHOT: "qenglish_legacy_snapshot_v1",
    SRS: "qenglish_srs_v1",
    PROGRESS: "qenglish_progress_v1",
    DASHBOARD: "qenglish_dashboard_v1",
    GRAMMAR: "qenglish_grammar_v1",
    LISTENING: "qenglish_listening_v1",
    SPEAKING: "qenglish_speaking_v1",
    READING: "qenglish_reading_v1",
    WRITING: "qenglish_writing_v1",
    NOTEBOOK: "qenglish_notebook_v1",
    CMS: "qenglish_cms_v1",
    SETTINGS: "qenglish_settings_v1",
    PDF_STUDIO: "qenglish_pdf_studio_v1"
};

function getScopedStorageKey(baseKey) {
    const uid = typeof window !== "undefined" ? window.__QENGLISH_ACTIVE_UID : null;
    if (!uid) return baseKey;
    return `qenglish_u_${uid}::${baseKey}`;
}

const STORAGE_KEYS = {};
[
    "DECK_V2", "SRS", "PROGRESS", "DASHBOARD", "GRAMMAR",
    "LISTENING", "SPEAKING", "READING", "WRITING", "NOTEBOOK",
    "CMS", "SETTINGS", "PDF_STUDIO"
].forEach(prop => {
    Object.defineProperty(STORAGE_KEYS, prop, {
        enumerable: true,
        get: () => getScopedStorageKey(BASE_STORAGE_KEYS[prop])
    });
});
STORAGE_KEYS.DECK_V1 = BASE_STORAGE_KEYS.DECK_V1;
STORAGE_KEYS.FPT_V3 = BASE_STORAGE_KEYS.FPT_V3;
STORAGE_KEYS.LEGACY_SNAPSHOT = BASE_STORAGE_KEYS.LEGACY_SNAPSHOT;

const SRS_INTERVALS_DAYS = [1, 3, 7, 14, 30];

// Global state preserved for 100% compatibility with original vocabulary functions
let deck = [];
let srsState = {};
let progressState = null;
let dashboardState = null;
let notebookItems = [];
let cmsItems = [];
let appSettings = null;

function safeParseJSON(raw, fallback) {
    if (!raw || typeof raw !== "string") return fallback;
    try {
        const parsed = JSON.parse(raw);
        return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch (err) {
        console.warn("[QEnglish Storage] JSON parse warning:", err);
        return fallback;
    }
}

function safeWriteJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        if (
            typeof window !== "undefined" &&
            window.__QENGLISH_ACTIVE_UID &&
            !window.__QENGLISH_SUPPRESS_SYNC &&
            typeof CloudClient !== "undefined" &&
            key.startsWith(`qenglish_u_${window.__QENGLISH_ACTIVE_UID}::`)
        ) {
            CloudClient.scheduleCloudSync();
        }
        return true;
    } catch (err) {
        console.error("[QEnglish Storage] Write error for key " + key, err);
        if (typeof showToast === "function") {
            showToast("Bộ nhớ trình duyệt đầy hoặc bị chặn. Hãy Xuất Backup!", "error");
        }
        return false;
    }
}

function getLocalDateKey(dateObj = new Date()) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// Non-destructive backup BEFORE any upgrade/migration touches deck data
function ensureLegacyBackupSnapshot() {
    try {
        if (localStorage.getItem(BASE_STORAGE_KEYS.LEGACY_SNAPSHOT)) return;
        const v2 = localStorage.getItem(BASE_STORAGE_KEYS.DECK_V2);
        const v1 = localStorage.getItem(BASE_STORAGE_KEYS.DECK_V1);
        const fpt3 = localStorage.getItem(BASE_STORAGE_KEYS.FPT_V3);
        const nb = localStorage.getItem(BASE_STORAGE_KEYS.NOTEBOOK);
        const wr = localStorage.getItem(BASE_STORAGE_KEYS.WRITING);
        if (v2 || v1 || fpt3 || nb || wr) {
            const snapshot = {
                createdAt: new Date().toISOString(),
                note: "Automatic non-destructive pre-upgrade backup",
                qenglish_deck_v2: v2 ? safeParseJSON(v2, null) : null,
                qenglish_deck_v1: v1 ? safeParseJSON(v1, null) : null,
                fpt_eng_deck_v3: fpt3 ? safeParseJSON(fpt3, null) : null,
                qenglish_notebook_v1: nb ? safeParseJSON(nb, null) : null,
                qenglish_writing_v1: wr ? safeParseJSON(wr, null) : null
            };
            safeWriteJSON(BASE_STORAGE_KEYS.LEGACY_SNAPSHOT, snapshot);
        }
    } catch (e) {
        console.warn("[QEnglish] Snapshot skipped:", e);
    }
}

function isValidDeckArray(arr) {
    return Array.isArray(arr) && arr.every(it => it && typeof it === "object" && typeof it.term === "string" && it.term.trim() !== "");
}

function normalizeWordItem(item, indexFallback = 0) {
    const cleanTerm = String(item.term || "").trim();
    const enrich = (typeof VOCAB_ENRICHMENT_MAP !== "undefined" && VOCAB_ENRICHMENT_MAP[cleanTerm.toLowerCase()]) || {};
    const ipaRaw = item.ipa !== undefined ? String(item.ipa) : "/.../";
    // Detect POS from "(n)" in IPA if item.pos not explicitly set
    let detectedPos = item.pos || enrich.pos || "";
    if (!detectedPos) {
        const posMatch = ipaRaw.match(/\((n|v|adj|adv|prep|conj|phr)\)/i);
        if (posMatch) {
            const map = { n: "noun", v: "verb", adj: "adj", adv: "adv", prep: "prep", conj: "conj", phr: "phrase" };
            detectedPos = map[posMatch[1].toLowerCase()] || posMatch[1];
        }
    }
    return {
        // Core 8 sacred properties preserved identically!
        id: item.id !== undefined && item.id !== null ? item.id : (Date.now() + indexFallback + Math.random()),
        day: Number.isFinite(Number(item.day)) && Number(item.day) > 0 ? Number(item.day) : 1,
        term: cleanTerm,
        ipa: ipaRaw,
        def: item.def !== undefined && String(item.def).trim() !== "" ? String(item.def) : cleanTerm,
        example: item.example !== undefined ? String(item.example) : "",
        category: item.category ? String(item.category) : "STEM",
        starred: Boolean(item.starred),
        // Extended optional properties (backward-compatible)
        pos: detectedPos,
        level: item.level || enrich.level || "B1",
        synonyms: item.synonyms !== undefined ? String(item.synonyms) : (enrich.synonyms || ""),
        antonyms: item.antonyms !== undefined ? String(item.antonyms) : (enrich.antonyms || ""),
        source: item.source || (Number(item.id) >= 1 && Number(item.id) <= 50 ? "built-in" : "local-browser")
    };
}

function loadDeckFromStorage() {
    ensureLegacyBackupSnapshot();
    const isIsolatedAccount = Boolean(typeof window !== "undefined" && window.__QENGLISH_ACTIVE_UID);
    const rawV2 = localStorage.getItem(STORAGE_KEYS.DECK_V2);
    const rawV1 = isIsolatedAccount ? null : localStorage.getItem(BASE_STORAGE_KEYS.DECK_V1);
    const rawFpt = isIsolatedAccount ? null : localStorage.getItem(BASE_STORAGE_KEYS.FPT_V3);
    const syncFlagKey = getScopedStorageKey("qenglish_builtin_sync_v50");

    let loaded = null;
    for (const raw of [rawV2, rawV1, rawFpt]) {
        if (raw !== null) {
            const parsed = safeParseJSON(raw, null);
            if (parsed !== null && Array.isArray(parsed)) {
                if (parsed.length === 0 || isValidDeckArray(parsed)) {
                    loaded = parsed;
                    break;
                }
            }
        }
    }

    if (loaded === null) {
        // Brand-new isolated accounts ALWAYS start cleanly with 0 vocabulary words (never auto-seeded with 50+ built-in words).
        // Existing accounts (e.g., anhquan06122008@gmail.com with 229 words) load their saved Cloud/local deck intact.
        loaded = [];
        try { localStorage.setItem(syncFlagKey, "1"); } catch (e) {}
    } else {
        loaded = loaded.map((d, idx) => normalizeWordItem(d, idx));
        try { localStorage.setItem(syncFlagKey, "1"); } catch (e) {}
    }

    deck = loaded;
    saveDeckToStorage();
    return deck;
}

function saveDeckToStorage() {
    if (!Array.isArray(deck)) return;
    safeWriteJSON(STORAGE_KEYS.DECK_V2, deck);
    const navCount = document.getElementById("nav-count");
    if (navCount) navCount.textContent = deck.length;
    const subCount = document.getElementById("vtab-list-count");
    if (subCount) subCount.textContent = deck.length;
}

/* ==================== SETTINGS & GLOBAL LEVEL ==================== */
function getDefaultSettings() {
    return {
        levelSystem: "CEFR", // 'CEFR' or 'IELTS' — NEVER conflated!
        selectedLevel: "B1", // 'all', 'A1'..'C2', or 'IELTS 3.0'..'IELTS 9.0'
        dailyWordGoal: 10,
        dailyMinutesGoal: 60,
        speechRate: 1.0,
        autoPlay: true,
        backendApiUrl: "/api/ai",
        cloudSyncUrl: "",
        aiConsentAccepted: true,
        onboardingCompleted: false,
        programStart: "2026-11-04",
        programEnd: "2026-12-17"
    };
}

function loadSettings() {
    const saved = safeParseJSON(localStorage.getItem(STORAGE_KEYS.SETTINGS), {});
    appSettings = { ...getDefaultSettings(), ...saved };
    // Security guard: strip any accidental API key if ever imported from external JSON
    if ("apiKey" in appSettings) delete appSettings.apiKey;
    if ("aiApiKey" in appSettings) delete appSettings.aiApiKey;
    safeWriteJSON(STORAGE_KEYS.SETTINGS, appSettings);
    return appSettings;
}

function saveSettings(partial = {}) {
    appSettings = { ...(appSettings || getDefaultSettings()), ...partial };
    if ("apiKey" in appSettings) delete appSettings.apiKey;
    if ("aiApiKey" in appSettings) delete appSettings.aiApiKey;
    safeWriteJSON(STORAGE_KEYS.SETTINGS, appSettings);
    return appSettings;
}

/* ==================== SPACED REPETITION SYSTEM (SRS) ==================== */
function loadSRSState() {
    srsState = safeParseJSON(localStorage.getItem(STORAGE_KEYS.SRS), {});
    return srsState;
}

function saveSRSState() {
    safeWriteJSON(STORAGE_KEYS.SRS, srsState);
}

function getWordSRS(wordId) {
    const key = String(wordId);
    if (!srsState[key]) {
        return {
            step: -1, // -1 = new, 0=1d, 1=3d, 2=7d, 3=14d, 4=30d
            nextReviewAt: 0,
            lastReviewedAt: 0,
            correctCount: 0,
            wrongCount: 0,
            status: "new"
        };
    }
    return srsState[key];
}

function classifyWordSRS(wordId, nowMs = Date.now()) {
    const st = getWordSRS(wordId);
    if (st.step === -1 && st.correctCount === 0 && st.wrongCount === 0) return "new";
    if (st.wrongCount >= 3 && st.wrongCount >= st.correctCount) return "leech"; // Từ thường xuyên sai
    if (st.nextReviewAt > 0 && st.nextReviewAt <= nowMs) return "due"; // Cần ôn tập
    if (st.step >= 3) return "mastered"; // Đã nhớ (>= 14 ngày)
    return "learning"; // Đang học
}

function recordWordSRSResult(wordId, isCorrect) {
    const key = String(wordId);
    const cur = { ...getWordSRS(wordId) };
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    const isFirstStudy = cur.step === -1 && cur.correctCount === 0 && cur.wrongCount === 0;

    cur.lastReviewedAt = now;
    if (isCorrect) {
        cur.correctCount += 1;
        cur.step = Math.min(SRS_INTERVALS_DAYS.length - 1, cur.step + 1);
        const days = SRS_INTERVALS_DAYS[cur.step] || 1;
        cur.nextReviewAt = now + days * DAY_MS;
    } else {
        cur.wrongCount += 1;
        // Đưa từ vào danh sách cần ôn lại sớm hơn (trong vòng vài giờ / ngay hôm nay hoặc lùi về bậc 1 ngày)
        cur.step = Math.max(0, cur.step - 1);
        cur.nextReviewAt = now + 4 * 60 * 60 * 1000; // Ôn lại sớm sau 4 giờ (hoặc ngay trong phiên Cần ôn tập)
    }
    cur.status = classifyWordSRS(wordId, now);
    srsState[key] = cur;
    saveSRSState();

    // Log into real daily progress
    logStudyMetrics({
        newWords: isFirstStudy ? 1 : 0,
        reviewedWords: isFirstStudy ? 0 : 1
    });
    return cur;
}

function getSRSSummary() {
    const now = Date.now();
    const counts = { new: 0, learning: 0, due: 0, mastered: 0, leech: 0 };
    deck.forEach(w => {
        const cat = classifyWordSRS(w.id, now);
        counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
}

/* ==================== PROGRESS, ANALYTICS & ADAPTIVE LEARNING ==================== */
function getEmptyDayLog() {
    return {
        minutes: 0,
        newWords: 0,
        reviewedWords: 0,
        listeningDone: 0,
        readingDone: 0,
        writingDone: 0,
        speakingSessions: 0,
        speakingMinutes: 0,
        grammarDone: 0,
        scores: [], // { skill, scorePct, level, title, at }
        mistakes: [] // { category, summary, at }
    };
}

function loadProgressState() {
    const raw = safeParseJSON(localStorage.getItem(STORAGE_KEYS.PROGRESS), null);
    progressState = raw && typeof raw === "object" ? raw : {
        days: {},
        activities: [], // { id, type, skill, title, detail, scorePct, source, at }
        skillHistory: {
            vocabulary: [],
            grammar: [],
            listening: [],
            speaking: [],
            reading: [],
            writing: []
        }
    };
    if (!progressState.days) progressState.days = {};
    if (!Array.isArray(progressState.activities)) progressState.activities = [];
    if (!progressState.skillHistory) {
        progressState.skillHistory = { vocabulary: [], grammar: [], listening: [], speaking: [], reading: [], writing: [] };
    }
    return progressState;
}

function saveProgressState() {
    safeWriteJSON(STORAGE_KEYS.PROGRESS, progressState);
}

function ensureTodayLog(dateKey = getLocalDateKey()) {
    if (!progressState) loadProgressState();
    if (!progressState.days[dateKey]) {
        progressState.days[dateKey] = getEmptyDayLog();
    }
    return progressState.days[dateKey];
}

function logStudyMetrics(metrics = {}, activityEntry = null) {
    const today = ensureTodayLog();
    const numericFields = ["minutes", "newWords", "reviewedWords", "listeningDone", "readingDone", "writingDone", "speakingSessions", "speakingMinutes", "grammarDone"];
    numericFields.forEach(f => {
        if (typeof metrics[f] === "number" && !isNaN(metrics[f])) {
            today[f] = Math.max(0, Math.round(((today[f] || 0) + metrics[f]) * 10) / 10);
        }
    });

    if (metrics.scoreEntry && typeof metrics.scoreEntry.scorePct === "number") {
        const entry = { ...metrics.scoreEntry, at: new Date().toISOString() };
        today.scores.push(entry);
        const sk = entry.skill || "vocabulary";
        if (!progressState.skillHistory[sk]) progressState.skillHistory[sk] = [];
        progressState.skillHistory[sk].push(entry);
    }

    if (metrics.mistakeEntry) {
        today.mistakes.push({ ...metrics.mistakeEntry, at: new Date().toISOString() });
    }

    if (activityEntry) {
        progressState.activities.unshift({
            id: "act-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
            at: new Date().toISOString(),
            source: "local-browser",
            ...activityEntry
        });
        if (progressState.activities.length > 200) {
            progressState.activities = progressState.activities.slice(0, 200);
        }
    }

    saveProgressState();
    if (typeof refreshDashboardUI === "function") refreshDashboardUI();
}

// Active Study Timer — counts real active engagement every 30s (no fake time!)
let _lastInteractionTs = Date.now();
let _studyTimerListenersBound = false;
let _studyTimerIntervalId = null;

function stopRealStudyTimer() {
    if (_studyTimerIntervalId !== null) {
        clearInterval(_studyTimerIntervalId);
        _studyTimerIntervalId = null;
    }
}

function setupRealStudyTimer() {
    if (!_studyTimerListenersBound) {
        _studyTimerListenersBound = true;
        ["click", "keydown", "input", "touchstart"].forEach(ev => {
            window.addEventListener(ev, () => { _lastInteractionTs = Date.now(); }, { passive: true });
        });
    }
    stopRealStudyTimer();
    _studyTimerIntervalId = setInterval(() => {
        if (document.hidden || !window.__QENGLISH_ACTIVE_UID) return;
        // Only count if student interacted within the last 3 minutes
        if (Date.now() - _lastInteractionTs <= 180000) {
            logStudyMetrics({ minutes: 0.5 });
        }
    }, 30000);
}

function computeOverallAnalytics() {
    if (!progressState) loadProgressState();
    const dayKeys = Object.keys(progressState.days).sort();
    let totalDaysStudied = 0;
    let totalMinutes = 0;
    let totalListening = 0;
    let totalReading = 0;
    let totalWriting = 0;
    let totalSpeaking = 0;
    let totalGrammar = 0;
    let allScores = [];

    dayKeys.forEach(k => {
        const d = progressState.days[k];
        const hasActivity = (d.minutes >= 1) || d.newWords > 0 || d.reviewedWords > 0 || d.listeningDone > 0 || d.readingDone > 0 || d.writingDone > 0 || d.speakingSessions > 0 || d.grammarDone > 0;
        if (hasActivity) totalDaysStudied++;
        totalMinutes += d.minutes || 0;
        totalListening += d.listeningDone || 0;
        totalReading += d.readingDone || 0;
        totalWriting += d.writingDone || 0;
        totalSpeaking += d.speakingSessions || 0;
        totalGrammar += d.grammarDone || 0;
        if (Array.isArray(d.scores)) allScores = allScores.concat(d.scores);
    });

    // Current streak ending today or yesterday
    let streak = 0;
    const cursor = new Date();
    const todayKey = getLocalDateKey(cursor);
    const todayHas = progressState.days[todayKey] && (
        progressState.days[todayKey].minutes >= 1 ||
        progressState.days[todayKey].newWords > 0 ||
        progressState.days[todayKey].reviewedWords > 0 ||
        progressState.days[todayKey].listeningDone > 0 ||
        progressState.days[todayKey].readingDone > 0 ||
        progressState.days[todayKey].writingDone > 0 ||
        progressState.days[todayKey].speakingSessions > 0 ||
        progressState.days[todayKey].grammarDone > 0
    );
    if (!todayHas) cursor.setDate(cursor.getDate() - 1);
    while (true) {
        const k = getLocalDateKey(cursor);
        const d = progressState.days[k];
        const active = d && (d.minutes >= 1 || d.newWords > 0 || d.reviewedWords > 0 || d.listeningDone > 0 || d.readingDone > 0 || d.writingDone > 0 || d.speakingSessions > 0 || d.grammarDone > 0);
        if (active) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        } else {
            break;
        }
    }

    const srsCounts = getSRSSummary();
    const wordsLearned = deck.length - srsCounts.new;
    const wordsMastered = srsCounts.mastered;
    const avgScore = allScores.length > 0
        ? Math.round(allScores.reduce((acc, s) => acc + s.scorePct, 0) / allScores.length)
        : null;

    // Real skill progress percentages based on completed items & accuracy
    const grammarTotal = (typeof GRAMMAR_LESSONS !== "undefined" ? GRAMMAR_LESSONS.length : 18);
    const listeningTotal = getAllContentForSkill("listening").length || 12;
    const readingTotal = getAllContentForSkill("reading").length || 10;
    const writingTotal = getAllContentForSkill("writing").length || 15;
    const speakingTarget = 12; // 2 sessions/week * 6 weeks

    const grammarSaved = safeParseJSON(localStorage.getItem(STORAGE_KEYS.GRAMMAR), { completedIds: [] });
    const listeningSaved = safeParseJSON(localStorage.getItem(STORAGE_KEYS.LISTENING), { completedIds: [] });
    const readingSaved = safeParseJSON(localStorage.getItem(STORAGE_KEYS.READING), { completedIds: [] });
    const writingSaved = safeParseJSON(localStorage.getItem(STORAGE_KEYS.WRITING), { submissions: [] });

    const vocabPct = deck.length > 0 ? Math.min(100, Math.round((wordsLearned / deck.length) * 100)) : 0;
    const grammarPct = Math.min(100, Math.round(((grammarSaved.completedIds || []).length / grammarTotal) * 100));
    const vocabGrammarPct = Math.round((vocabPct + grammarPct) / 2);
    const listeningPct = Math.min(100, Math.round(((listeningSaved.completedIds || []).length / listeningTotal) * 100));
    const readingPct = Math.min(100, Math.round(((readingSaved.completedIds || []).length / readingTotal) * 100));
    const transCompletedCount = Array.isArray(writingSaved.translation?.completedIds)
        ? new Set(writingSaved.translation.completedIds.map(Number).filter(Number.isFinite)).size
        : 0;
    const transTotalLessons = (typeof TRANSLATION_80_LESSONS !== "undefined" && Array.isArray(TRANSLATION_80_LESSONS))
        ? TRANSLATION_80_LESSONS.length
        : 80;
    const uniqueWritingTopics = new Set((writingSaved.submissions || []).map(s => s.topicId)).size + transCompletedCount;
    const writingPct = Math.min(100, Math.round((uniqueWritingTopics / Math.max(writingTotal + transTotalLessons, 10)) * 100));
    const speakingPct = Math.min(100, Math.round((totalSpeaking / speakingTarget) * 100));

    // Real Writing 10-point & 4-criterion analytics (Writing Studio + Translation 80 Lessons)
    const transHistory = Array.isArray(writingSaved.translation?.history) ? writingSaved.translation.history : [];
    const gradedWritings = (writingSaved.submissions || []).filter(s => typeof s.totalScore10 === "number");
    const allGraded10 = [
        ...gradedWritings.map(s => s.totalScore10),
        ...transHistory.filter(h => typeof h.totalScore10 === "number").map(h => h.totalScore10)
    ];
    const writingAvg10 = allGraded10.length > 0
        ? Number((allGraded10.reduce((sum, v) => sum + v, 0) / allGraded10.length).toFixed(1))
        : null;
    const writingCriteriaAvg = { taskResponse: null, coherenceCohesion: null, lexicalResource: null, grammarAccuracy: null };
    ["taskResponse", "coherenceCohesion", "lexicalResource", "grammarAccuracy"].forEach(ck => {
        const vals = gradedWritings
            .map(s => Number(s.criteria?.[ck]?.scoreOutOf2_5))
            .filter(v => Number.isFinite(v));
        if (vals.length > 0) {
            writingCriteriaAvg[ck] = Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
        }
    });

    // Aggregate common mistake categories across Study logs + Notebook
    const mistakeCounts = {};
    dayKeys.forEach(k => {
        (progressState.days[k]?.mistakes || []).forEach(m => {
            const cat = m.category || "Khác";
            mistakeCounts[cat] = (mistakeCounts[cat] || 0) + 1;
        });
    });
    const topMistakeCategories = Object.entries(mistakeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([category, count]) => ({ category, count }));

    return {
        totalDaysStudied,
        streak,
        totalMinutes: Math.round(totalMinutes),
        wordsLearned,
        wordsMastered,
        srsCounts,
        totalListening,
        totalReading,
        totalWriting,
        totalSpeaking,
        totalGrammar,
        avgScore,
        writingSubmissionsCount: (writingSaved.submissions || []).length + transHistory.length,
        writingAvg10,
        writingCriteriaAvg,
        topMistakeCategories,
        skills: {
            vocabulary: vocabPct,
            grammar: grammarPct,
            vocabGrammar: vocabGrammarPct,
            listening: listeningPct,
            speaking: speakingPct,
            reading: readingPct,
            writing: writingPct
        }
    };
}

// Compute REAL Weekly Comparison (Last Week vs This Week — PHẦN 7.2)
function computeWeeklyComparison() {
    if (!progressState) loadProgressState();
    const now = new Date();
    // Monday of current week
    const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon .. 6 = Sun
    const startThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
    const startLastWeek = new Date(startThisWeek);
    startLastWeek.setDate(startLastWeek.getDate() - 7);

    function aggregateRange(startDate, numDays) {
        const agg = { listening: [], speaking: [], reading: [], writing: [], vocabGrammar: [], activitiesCount: { listening: 0, speaking: 0, reading: 0, writing: 0, vocabGrammar: 0 }, minutesByDay: [] };
        for (let i = 0; i < numDays; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const k = getLocalDateKey(d);
            const log = progressState.days[k] || getEmptyDayLog();
            agg.minutesByDay.push({ dateKey: k, minutes: Math.round(log.minutes || 0) });
            agg.activitiesCount.listening += log.listeningDone || 0;
            agg.activitiesCount.speaking += log.speakingSessions || 0;
            agg.activitiesCount.reading += log.readingDone || 0;
            agg.activitiesCount.writing += log.writingDone || 0;
            agg.activitiesCount.vocabGrammar += (log.newWords || 0) + (log.reviewedWords || 0) + (log.grammarDone || 0);
            (log.scores || []).forEach(sc => {
                if (sc.skill === "vocabulary" || sc.skill === "grammar") agg.vocabGrammar.push(sc.scorePct);
                else if (agg[sc.skill]) agg[sc.skill].push(sc.scorePct);
            });
        }
        const calcMetric = (scoresArr, countVal, targetCount) => {
            if (scoresArr.length > 0) {
                return Math.round(scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length);
            }
            if (countVal > 0) return Math.min(100, Math.round((countVal / targetCount) * 100));
            return 0;
        };
        return {
            minutesByDay: agg.minutesByDay,
            listening: calcMetric(agg.listening, agg.activitiesCount.listening, 5),
            speaking: calcMetric(agg.speaking, agg.activitiesCount.speaking, 4),
            reading: calcMetric(agg.reading, agg.activitiesCount.reading, 5),
            writing: calcMetric(agg.writing, agg.activitiesCount.writing, 3),
            vocabGrammar: calcMetric(agg.vocabGrammar, agg.activitiesCount.vocabGrammar, 30),
            rawCounts: agg.activitiesCount
        };
    }

    return {
        lastWeek: aggregateRange(startLastWeek, 7),
        thisWeek: aggregateRange(startThisWeek, 7)
    };
}

// Adaptive Learning Recommendations (PHẦN 7.3 — Never judge on a single test!)
function computeAdaptiveRecommendations() {
    if (!progressState) loadProgressState();
    const recs = [];
    const skillLabels = {
        vocabulary: "Vocabulary",
        grammar: "Grammar",
        listening: "Listening",
        speaking: "Speaking",
        reading: "Reading",
        writing: "Writing"
    };

    const srs = getSRSSummary();
    if (srs.due > 0 || srs.leech > 0) {
        recs.push({
            type: "urgent",
            skill: "vocabulary",
            title: `Có ${srs.due} từ đến hạn ôn SRS và ${srs.leech} từ hay sai`,
            advice: "Hệ thống ưu tiên đưa các từ trả lời sai về chu kỳ ôn ngắn. Hãy dành 5–10 phút ôn tập SRS trước khi học từ mới.",
            actionLabel: "Ôn tập SRS ngay",
            actionFn: () => { navigateTo("vocabulary", "srs"); }
        });
    }

    Object.keys(skillLabels).forEach(sk => {
        const hist = (progressState.skillHistory && progressState.skillHistory[sk]) || [];
        if (hist.length === 0) {
            recs.push({
                type: "start",
                skill: sk,
                title: `Chưa có dữ liệu luyện tập ${skillLabels[sk]}`,
                advice: `Hãy hoàn thành ít nhất 3 bài ${skillLabels[sk]} để hệ thống Adaptive Learning phân tích chính xác điểm mạnh/yếu của bạn.`,
                actionLabel: `Mở ${skillLabels[sk]}`,
                actionFn: () => { navigateTo(sk); }
            });
        } else if (hist.length < 3) {
            const avg = Math.round(hist.reduce((a, b) => a + b.scorePct, 0) / hist.length);
            recs.push({
                type: "collecting",
                skill: sk,
                title: `${skillLabels[sk]}: Đang thu thập dữ liệu (${hist.length}/3 bài — TB ${avg}%)`,
                advice: "Hệ thống không đánh giá năng lực chỉ dựa trên 1–2 bài đơn lẻ. Hãy làm thêm bài để nhận đề xuất điều chỉnh độ khó.",
                actionLabel: `Luyện tiếp ${skillLabels[sk]}`,
                actionFn: () => { navigateTo(sk); }
            });
        } else {
            const recent3 = hist.slice(-3);
            const avg3 = Math.round(recent3.reduce((a, b) => a + b.scorePct, 0) / recent3.length);
            if (avg3 < 60) {
                recs.push({
                    type: "remedial",
                    skill: sk,
                    title: `${skillLabels[sk]}: Cần củng cố nền tảng (TB 3 bài gần nhất: ${avg3}%)`,
                    advice: "Tỷ lệ chính xác dưới 60% qua nhiều lượt liên tiếp. Đề xuất: Giảm 1 bậc trình độ (ví dụ B1 → A2), xem lại Sổ Lỗi Sai (Mistake Notebook) và tăng thêm 1 bài luyện kỹ năng này hôm nay.",
                    actionLabel: `Ôn nền tảng ${skillLabels[sk]}`,
                    actionFn: () => { navigateTo(sk); }
                });
            } else if (avg3 >= 85) {
                recs.push({
                    type: "advance",
                    skill: sk,
                    title: `${skillLabels[sk]}: Phong độ xuất sắc (TB 3 bài gần nhất: ${avg3}%)`,
                    advice: "Bạn đã nắm vững trình độ hiện tại một cách ổn định. Bạn có thể thử thách bản thân với cấp độ cao hơn!",
                    actionLabel: `Thử thách bài khó hơn`,
                    actionFn: () => { navigateTo(sk); }
                });
            } else {
                recs.push({
                    type: "steady",
                    skill: sk,
                    title: `${skillLabels[sk]}: Đang tiến bộ đúng hướng (TB 3 bài gần nhất: ${avg3}%)`,
                    advice: "Duy trì nhịp độ luyện tập hiện tại và chú ý ghi chú lại các từ/cấu trúc mới sau mỗi bài.",
                    actionLabel: `Tiếp tục ${skillLabels[sk]}`,
                    actionFn: () => { navigateTo(sk); }
                });
            }
        }
    });

    return recs;
}

/* ==================== STRUCTURED ENGLISH NOTEBOOK (PHẦN 6) ==================== */
function loadNotebook() {
    notebookItems = safeParseJSON(localStorage.getItem(STORAGE_KEYS.NOTEBOOK), []);
    if (!Array.isArray(notebookItems)) notebookItems = [];
    return notebookItems;
}

function saveNotebook() {
    safeWriteJSON(STORAGE_KEYS.NOTEBOOK, notebookItems);
}

function addStructuredNote(noteObj, silent = false) {
    if (!notebookItems.length) loadNotebook();
    const now = new Date().toISOString();
    const entry = {
        id: noteObj.id || ("nb-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6)),
        type: noteObj.type || "vocabulary", // vocabulary | grammar | mistake | writing | speaking
        title: String(noteObj.title || "Ghi chú không tiêu đề").trim(),
        important: Boolean(noteObj.important),
        source: noteObj.source || "local-browser",
        fields: noteObj.fields || {},
        content: String(noteObj.content || "").trim(),
        createdAt: noteObj.createdAt || now,
        updatedAt: now
    };
    notebookItems.unshift(entry);
    saveNotebook();
    if (!silent && typeof showToast === "function") {
        showToast("Đã lưu vào English Notebook!");
    }
    return entry;
}

function autoLogMistake(mistakeData) {
    // Automatically logs learner errors into Mistake Notebook (PHẦN 6.1) + Today's analytics
    if (!notebookItems.length) loadNotebook();
    const normTitle = String(mistakeData.wrongText || "").trim().toLowerCase();
    // Avoid spamming exact identical mistake on same day
    const existing = notebookItems.find(n => n.type === "mistake" && (n.fields && String(n.fields.wrongText || "").trim().toLowerCase() === normTitle));
    if (existing) {
        existing.updatedAt = new Date().toISOString();
        existing.fields.occurrences = (existing.fields.occurrences || 1) + 1;
        saveNotebook();
    } else {
        addStructuredNote({
            type: "mistake",
            title: `[${mistakeData.errorCategory || "Ngữ pháp"}] ${String(mistakeData.wrongText || "").slice(0, 48)}`,
            important: true,
            source: mistakeData.source || "local-browser",
            fields: {
                errorCategory: mistakeData.errorCategory || "Sai ngữ pháp", // Sai chính tả | Sai ngữ pháp | Dùng sai từ | Sai cấu trúc câu | Phát âm chưa rõ
                wrongText: mistakeData.wrongText || "",
                correctText: mistakeData.correctText || "",
                explanation: mistakeData.explanation || "",
                skill: mistakeData.skill || "vocabulary",
                occurrences: 1
            },
            content: `Lỗi: ${mistakeData.wrongText}\nSửa: ${mistakeData.correctText}\nGiải thích: ${mistakeData.explanation}`
        }, true);
    }

    logStudyMetrics({
        mistakeEntry: {
            category: mistakeData.errorCategory || "Sai ngữ pháp",
            summary: `${mistakeData.wrongText} → ${mistakeData.correctText}`
        }
    });
}

/* ==================== LEARNING CONTENT MANAGEMENT (CMS - PHẦN 5) ==================== */
function loadCMSItems() {
    cmsItems = safeParseJSON(localStorage.getItem(STORAGE_KEYS.CMS), []);
    if (!Array.isArray(cmsItems)) cmsItems = [];
    return cmsItems;
}

function saveCMSItems() {
    safeWriteJSON(STORAGE_KEYS.CMS, cmsItems);
}

function textSimilarityBasic(a, b) {
    const s1 = String(a || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim().split(/\s+/).filter(Boolean);
    const s2 = String(b || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim().split(/\s+/).filter(Boolean);
    if (!s1.length || !s2.length) return 0;
    const set1 = new Set(s1);
    const set2 = new Set(s2);
    let inter = 0;
    set1.forEach(w => { if (set2.has(w)) inter++; });
    return inter / Math.max(set1.size, set2.size);
}

function getAllContentForSkill(skill) {
    if (!cmsItems.length) loadCMSItems();
    const custom = cmsItems.filter(it => it.skill === skill && it.status !== "archived").map(it => it.payload);
    if (skill === "grammar") return [...(typeof GRAMMAR_LESSONS !== "undefined" ? GRAMMAR_LESSONS : []), ...custom];
    if (skill === "listening") return [...(typeof LISTENING_EXERCISES !== "undefined" ? LISTENING_EXERCISES : []), ...custom];
    if (skill === "reading") return [...(typeof READING_PASSAGES !== "undefined" ? READING_PASSAGES : []), ...custom];
    if (skill === "writing") return [...(typeof WRITING_TOPICS !== "undefined" ? WRITING_TOPICS : []), ...custom];
    if (skill === "speaking") return [...(typeof SPEAKING_TOPICS !== "undefined" ? SPEAKING_TOPICS : []), ...custom];
    return custom;
}

// Anti-Duplication Check (PHẦN 5.3: Kiểm tra ID, Tiêu đề, Chủ đề + Trình độ, và Nội dung)
function checkContentDuplicate(candidate) {
    const existingAll = getAllContentForSkill(candidate.skill);
    const candId = String(candidate.id || "").trim().toLowerCase();
    const candTitle = String(candidate.title || "").trim().toLowerCase();
    const candTopic = String(candidate.topic || "").trim().toLowerCase();
    const candLevel = String(candidate.level || "").trim().toLowerCase();
    const candBody = String(candidate.contentText || "").trim();

    for (const item of existingAll) {
        if (candId && String(item.id || "").toLowerCase() === candId) {
            return { isDuplicate: true, reason: `Trùng ID bài học đã tồn tại ("${item.id}").` };
        }
        if (candTitle && String(item.title || "").trim().toLowerCase() === candTitle) {
            return { isDuplicate: true, reason: `Trùng tiêu đề bài học đã tồn tại ("${item.title}").` };
        }
        if (candTopic && candTitle && String(item.topic || "").trim().toLowerCase() === candTopic && String(item.level || "").toLowerCase() === candLevel && textSimilarityBasic(candTitle, item.title) >= 0.8) {
            return { isDuplicate: true, reason: `Đã có bài cùng Chủ đề ("${item.topic}") và Trình độ (${item.level}) với tiêu đề tương tự.` };
        }
        const existingBody = item.passage || item.transcript || item.prompt || item.explanation || "";
        if (candBody.length > 40 && existingBody.length > 40 && textSimilarityBasic(candBody, existingBody) >= 0.85) {
            return { isDuplicate: true, reason: `Nội dung trùng lặp trên 85% với bài "${item.title}".` };
        }
    }
    return { isDuplicate: false };
}

function addCMSContent(meta) {
    const dup = checkContentDuplicate(meta);
    if (dup.isDuplicate) {
        return { ok: false, error: dup.reason };
    }
    const now = new Date().toISOString();
    const record = {
        id: meta.id || (`cms-${meta.skill}-${Date.now()}`),
        title: meta.title,
        skill: meta.skill,
        levelSystem: meta.level.startsWith("IELTS") ? "IELTS" : "CEFR",
        level: meta.level,
        topic: meta.topic || "General",
        createdAt: now,
        updatedAt: now,
        source: meta.source || "user-imported", // user-imported | ai-generated | external-link
        status: meta.status || "published",
        payload: {
            ...meta.payload,
            id: meta.id || (`cms-${meta.skill}-${Date.now()}`),
            title: meta.title,
            level: meta.level,
            levelSystem: meta.level.startsWith("IELTS") ? "IELTS" : "CEFR",
            topic: meta.topic || "General",
            source: meta.source || "user-imported",
            createdAt: now
        }
    };
    cmsItems.unshift(record);
    saveCMSItems();
    return { ok: true, record };
}

/* ==================== LEVEL FILTERING HELPER (PHẦN 4) ==================== */
// Strictly separates CEFR (A1-C2) and IELTS (3.0-9.0) — NO fixed conversion formula!
function matchesSelectedLevel(itemLevel, filterValue) {
    if (!filterValue || filterValue === "all") return true;
    const itemLv = String(itemLevel || "B1").trim();
    const target = String(filterValue).trim();
    const itemIsIelts = itemLv.toUpperCase().startsWith("IELTS");
    const targetIsIelts = target.toUpperCase().startsWith("IELTS");
    // Never mix CEFR and IELTS when filtering!
    if (itemIsIelts !== targetIsIelts) return false;
    if (targetIsIelts) {
        // Exact IELTS band match, or if band has +/-0.5 proximity when exact band has 0 items handled by caller
        return itemLv.toUpperCase() === target.toUpperCase();
    }
    return itemLv.toUpperCase() === target.toUpperCase();
}

/* ==================== EXPORT & IMPORT BACKUP (PHẦN 10) ==================== */
function exportAllBackupJSON() {
    const payload = {
        app: "QEnglish Personal Learning System",
        schemaVersion: "2.0",
        exportedAt: new Date().toISOString(),
        data: {
            qenglish_deck_v2: deck,
            qenglish_srs_v1: srsState,
            qenglish_progress_v1: progressState,
            qenglish_dashboard_v1: safeParseJSON(localStorage.getItem(STORAGE_KEYS.DASHBOARD), {}),
            qenglish_grammar_v1: safeParseJSON(localStorage.getItem(STORAGE_KEYS.GRAMMAR), {}),
            qenglish_listening_v1: safeParseJSON(localStorage.getItem(STORAGE_KEYS.LISTENING), {}),
            qenglish_speaking_v1: safeParseJSON(localStorage.getItem(STORAGE_KEYS.SPEAKING), {}),
            qenglish_reading_v1: safeParseJSON(localStorage.getItem(STORAGE_KEYS.READING), {}),
            qenglish_writing_v1: safeParseJSON(localStorage.getItem(STORAGE_KEYS.WRITING), {}),
            qenglish_notebook_v1: notebookItems,
            qenglish_cms_v1: cmsItems,
            qenglish_settings_v1: appSettings
        }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QEnglish-Backup-${getLocalDateKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    if (typeof showToast === "function") showToast("Đã xuất file Backup JSON thành công!");
}

function importAllBackupJSON(file, onComplete) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const parsed = JSON.parse(String(ev.target.result || ""));
            if (!parsed || typeof parsed !== "object") {
                throw new Error("Cấu trúc JSON không hợp lệ.");
            }
            // Save pre-import safety backup first!
            safeWriteJSON("qenglish_pre_import_backup_v1", {
                backedUpAt: new Date().toISOString(),
                deck: deck,
                notebook: notebookItems,
                progress: progressState
            });

            // Support both full v2 backup AND raw array deck export
            if (Array.isArray(parsed)) {
                if (!isValidDeckArray(parsed)) throw new Error("Danh sách từ vựng trong file JSON không hợp lệ.");
                deck = parsed.map((d, idx) => normalizeWordItem(d, idx));
                saveDeckToStorage();
            } else if (parsed.data && typeof parsed.data === "object") {
                const d = parsed.data;
                if (Array.isArray(d.qenglish_deck_v2) && (d.qenglish_deck_v2.length === 0 || isValidDeckArray(d.qenglish_deck_v2))) {
                    deck = d.qenglish_deck_v2.map((it, idx) => normalizeWordItem(it, idx));
                    saveDeckToStorage();
                }
                const keyPairs = [
                    [BASE_STORAGE_KEYS.SRS, STORAGE_KEYS.SRS],
                    [BASE_STORAGE_KEYS.PROGRESS, STORAGE_KEYS.PROGRESS],
                    [BASE_STORAGE_KEYS.DASHBOARD, STORAGE_KEYS.DASHBOARD],
                    [BASE_STORAGE_KEYS.GRAMMAR, STORAGE_KEYS.GRAMMAR],
                    [BASE_STORAGE_KEYS.LISTENING, STORAGE_KEYS.LISTENING],
                    [BASE_STORAGE_KEYS.SPEAKING, STORAGE_KEYS.SPEAKING],
                    [BASE_STORAGE_KEYS.READING, STORAGE_KEYS.READING],
                    [BASE_STORAGE_KEYS.WRITING, STORAGE_KEYS.WRITING],
                    [BASE_STORAGE_KEYS.NOTEBOOK, STORAGE_KEYS.NOTEBOOK],
                    [BASE_STORAGE_KEYS.CMS, STORAGE_KEYS.CMS]
                ];
                keyPairs.forEach(([baseKey, scopedKey]) => {
                    if (d[baseKey] !== undefined) safeWriteJSON(scopedKey, d[baseKey]);
                });
                if (d.qenglish_settings_v1 && typeof d.qenglish_settings_v1 === "object") {
                    saveSettings(d.qenglish_settings_v1);
                }
            } else {
                throw new Error("File không đúng định dạng Backup của QEnglish.");
            }

            // Reload runtime states
            loadSRSState();
            loadProgressState();
            loadNotebook();
            loadCMSItems();
            loadSettings();
            if (typeof onComplete === "function") onComplete();
            if (typeof showToast === "function") showToast("Khôi phục dữ liệu từ Backup thành công!");
        } catch (err) {
            console.error("[Backup Import Error]", err);
            if (typeof showToast === "function") {
                showToast("Lỗi file Backup JSON: " + (err.message || "Không thể đọc file"), "error");
            }
        }
    };
    reader.onerror = () => {
        if (typeof showToast === "function") showToast("Không thể đọc file từ thiết bị.", "error");
    };
    reader.readAsText(file);
}

/* ==================== 9. MULTI-ACCOUNT & GROUP STUDY SYSTEM ==================== */
const ACCOUNTS_STORAGE_KEY = "qenglish_accounts_v1";
const USER_SCOPED_KEYS = [
    BASE_STORAGE_KEYS.DECK_V2,
    BASE_STORAGE_KEYS.SRS,
    BASE_STORAGE_KEYS.PROGRESS,
    BASE_STORAGE_KEYS.DASHBOARD,
    BASE_STORAGE_KEYS.GRAMMAR,
    BASE_STORAGE_KEYS.LISTENING,
    BASE_STORAGE_KEYS.SPEAKING,
    BASE_STORAGE_KEYS.READING,
    BASE_STORAGE_KEYS.WRITING,
    BASE_STORAGE_KEYS.NOTEBOOK,
    BASE_STORAGE_KEYS.CMS,
    BASE_STORAGE_KEYS.SETTINGS,
    BASE_STORAGE_KEYS.PDF_STUDIO
];

let accountsStore = null;

function loadAccountsStore() {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    const parsed = safeParseJSON(raw, null);
    if (parsed && parsed.activeAccountId && parsed.accounts && typeof parsed.accounts === "object") {
        accountsStore = parsed;
    } else {
        const primaryId = "acc-primary";
        const initialSnapshot = {};
        USER_SCOPED_KEYS.forEach(k => {
            const val = localStorage.getItem(k);
            if (val !== null) initialSnapshot[k] = val;
        });
        accountsStore = {
            activeAccountId: primaryId,
            accounts: {
                [primaryId]: {
                    id: primaryId,
                    name: "Học viên 1 (Chính)",
                    username: "member1",
                    avatar: "🚀",
                    goal: "Chinh phục 5 kỹ năng Tiếng Anh",
                    pin: "",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    statsSummary: { streak: 0, wordsLearned: 0, wordsMastered: 0, totalMinutes: 0, avgScore: null },
                    data: initialSnapshot
                }
            }
        };
        safeWriteJSON(ACCOUNTS_STORAGE_KEY, accountsStore);
    }
    return accountsStore;
}

function saveAccountsStore() {
    if (!accountsStore) return;
    safeWriteJSON(ACCOUNTS_STORAGE_KEY, accountsStore);
}

function getActiveAccount() {
    if (!accountsStore) loadAccountsStore();
    return accountsStore.accounts[accountsStore.activeAccountId] || Object.values(accountsStore.accounts)[0];
}

function syncCurrentAccountSnapshot() {
    if (!accountsStore) loadAccountsStore();
    const acc = getActiveAccount();
    if (!acc) return;

    const snap = {};
    USER_SCOPED_KEYS.forEach(k => {
        const val = localStorage.getItem(getScopedStorageKey(k));
        if (val !== null) snap[k] = val;
    });
    acc.data = snap;
    acc.updatedAt = new Date().toISOString();

    try {
        const st = computeOverallAnalytics();
        acc.statsSummary = {
            streak: st.streak || 0,
            wordsLearned: st.wordsLearned || 0,
            wordsMastered: st.wordsMastered || 0,
            totalMinutes: st.totalMinutes || 0,
            avgScore: st.avgScore
        };
    } catch (e) {}

    saveAccountsStore();
}

function reloadAllActiveAccountStates(options = {}) {
    if (!options.preserveTranslationState && typeof resetTranslationWorkspaceMemory === "function") {
        resetTranslationWorkspaceMemory();
    }
    loadSettings();
    loadDeckFromStorage();
    loadSRSState();
    loadProgressState();
    loadNotebook();
    loadCMSItems();
}

function createNewUserAccount({ name, username, avatar = "🌟", goal = "Giao tiếp & Từ vựng toàn diện", pin = "" }) {
    const cleanName = String(name || "").trim();
    if (!cleanName) return { ok: false, error: "Vui lòng nhập Tên hiển thị của tài khoản." };
    const cleanUser = String(username || cleanName).toLowerCase().replace(/[^a-z0-9_]/g, "") || ("user" + Date.now().toString().slice(-4));

    syncCurrentAccountSnapshot();

    const exists = Object.values(accountsStore.accounts).some(a => a.username === cleanUser);
    if (exists) {
        return { ok: false, error: `Tên tài khoản "@${cleanUser}" đã tồn tại. Hãy chọn tên khác hoặc bấm chuyển tài khoản!` };
    }

    const newId = "acc-" + Date.now();
    const freshDeck = [];

    // Clear user-scoped keys and initialize fresh default deck for the new member
    USER_SCOPED_KEYS.forEach(k => localStorage.removeItem(getScopedStorageKey(k)));
    safeWriteJSON(STORAGE_KEYS.DECK_V2, freshDeck);
    safeWriteJSON(STORAGE_KEYS.SETTINGS, { ...getDefaultSettings(), onboardingCompleted: true });

    const newAccSnapshot = {};
    USER_SCOPED_KEYS.forEach(k => {
        const v = localStorage.getItem(getScopedStorageKey(k));
        if (v !== null) newAccSnapshot[k] = v;
    });

    accountsStore.accounts[newId] = {
        id: newId,
        name: cleanName,
        username: cleanUser,
        avatar: avatar || "🌟",
        goal: String(goal || "Giao tiếp & Từ vựng toàn diện").trim(),
        pin: String(pin || "").trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statsSummary: { streak: 0, wordsLearned: 0, wordsMastered: 0, totalMinutes: 0, avgScore: null },
        data: newAccSnapshot
    };
    accountsStore.activeAccountId = newId;
    saveAccountsStore();

    reloadAllActiveAccountStates();
    syncCurrentAccountSnapshot();
    return { ok: true, account: accountsStore.accounts[newId] };
}

function switchToUserAccount(targetAccountId, enteredPin = null) {
    if (!accountsStore) loadAccountsStore();
    const target = accountsStore.accounts[targetAccountId];
    if (!target) return { ok: false, error: "Không tìm thấy tài khoản này." };
    if (targetAccountId === accountsStore.activeAccountId) return { ok: true, account: target };

    if (target.pin && String(target.pin).trim() !== "") {
        const pinToCheck = enteredPin !== null ? enteredPin : prompt(`🔒 Nhập mã PIN của tài khoản "${target.name}" (@${target.username}):`);
        if (pinToCheck === null) return { ok: false, cancelled: true };
        if (String(pinToCheck).trim() !== String(target.pin).trim()) {
            return { ok: false, error: "Mã PIN không chính xác!" };
        }
    }

    // 1. Save current account snapshot safely
    syncCurrentAccountSnapshot();

    // 2. Clear user-scoped keys and restore target account's keys
    USER_SCOPED_KEYS.forEach(k => localStorage.removeItem(getScopedStorageKey(k)));
    const targetData = target.data || {};
    Object.keys(targetData).forEach(k => {
        if (targetData[k] !== null && targetData[k] !== undefined) {
            localStorage.setItem(getScopedStorageKey(k), targetData[k]);
        }
    });

    // Ensure target has a valid v2 deck array (starts empty 0 words for new accounts)
    if (!localStorage.getItem(STORAGE_KEYS.DECK_V2)) {
        safeWriteJSON(STORAGE_KEYS.DECK_V2, []);
    }

    accountsStore.activeAccountId = targetAccountId;
    saveAccountsStore();

    reloadAllActiveAccountStates();
    syncCurrentAccountSnapshot();
    return { ok: true, account: target };
}

function updateActiveAccountProfile({ name, goal, avatar, pin }) {
    const acc = getActiveAccount();
    if (!acc) return;
    if (name && String(name).trim()) acc.name = String(name).trim();
    if (goal !== undefined) acc.goal = String(goal || "Chinh phục 5 kỹ năng Tiếng Anh").trim();
    if (avatar) acc.avatar = avatar;
    if (pin !== undefined) acc.pin = String(pin).trim();
    syncCurrentAccountSnapshot();
}

function deleteUserAccount(accountId) {
    if (!accountsStore) loadAccountsStore();
    const allIds = Object.keys(accountsStore.accounts);
    if (allIds.length <= 1) {
        return { ok: false, error: "Hệ thống cần giữ ít nhất 1 tài khoản hoạt động." };
    }
    if (accountId === accountsStore.activeAccountId) {
        return { ok: false, error: "Hãy chuyển sang tài khoản khác trước khi xóa tài khoản này." };
    }
    delete accountsStore.accounts[accountId];
    saveAccountsStore();
    return { ok: true };
}

function exportActiveAccountJSON() {
    syncCurrentAccountSnapshot();
    const acc = getActiveAccount();
    const payload = {
        format: "qenglish_account_profile_v1",
        exportedAt: new Date().toISOString(),
        account: acc
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qenglish-account-${acc.username || "profile"}-${getLocalDateKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    if (typeof showToast === "function") showToast(`Đã tải hồ sơ tài khoản "${acc.name}"!`);
}

function importUserAccountJSON(file, onComplete) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = JSON.parse(String(e.target?.result || ""));
            if (!parsed || parsed.format !== "qenglish_account_profile_v1" || !parsed.account) {
                throw new Error("File không phải định dạng Hồ sơ Tài khoản QEnglish.");
            }
            syncCurrentAccountSnapshot();
            const incoming = parsed.account;
            const id = incoming.id || ("acc-" + Date.now());
            accountsStore.accounts[id] = {
                ...incoming,
                id,
                updatedAt: new Date().toISOString()
            };
            saveAccountsStore();
            switchToUserAccount(id, incoming.pin || "");
            if (typeof onComplete === "function") onComplete();
            if (typeof showToast === "function") showToast(`Đã nhập và chuyển sang tài khoản "${incoming.name}"!`);
        } catch (err) {
            if (typeof showToast === "function") showToast("Lỗi nhập hồ sơ: " + err.message, "error");
        }
    };
    reader.readAsText(file);
}

/* ==================== 10. CLOUD WORKSPACE SNAPSHOTS & SAFE LEGACY MIGRATION ==================== */
function resetInMemoryWorkspaceState() {
    stopRealStudyTimer();
    deck = [];
    srsState = {};
    progressState = null;
    dashboardState = null;
    notebookItems = [];
    cmsItems = [];
    appSettings = null;
    accountsStore = null;
    if (typeof activeWritingTopic !== "undefined") activeWritingTopic = null;
    if (typeof resetTranslationWorkspaceMemory === "function") resetTranslationWorkspaceMemory();
    if (typeof resetPdfStudioMemory === "function") resetPdfStudioMemory();
    ["writing-evaluation", "writing-inline-check-box", "trans-feedback-panel", "speaking-eval-output", "grammar-coach-output", "listening-coach-output", "reading-coach-output", "vocab-coach-output", "dash-ai-assistant-output"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = "";
            el.classList.add("hidden");
        }
    });
    const transArea = document.getElementById("trans-english-textarea");
    if (transArea) transArea.value = "";
    const transHist = document.getElementById("trans-history-list");
    if (transHist) transHist.innerHTML = "";
    const transGrid = document.getElementById("trans-catalog-grid");
    if (transGrid) transGrid.innerHTML = "";
    const transSearch = document.getElementById("trans-search-input");
    if (transSearch) transSearch.value = "";
    const transLv = document.getElementById("trans-level-filter");
    if (transLv) transLv.value = "all";
    document.getElementById("trans-catalog-modal")?.classList.add("hidden");
    if (typeof setTranslationSubmitLoading === "function") setTranslationSubmitLoading(false);
}

function compactPdfStudioForCloud(rawPdfState) {
    if (!rawPdfState || typeof rawPdfState !== "object") return null;
    const docs = Array.isArray(rawPdfState.documents) ? rawPdfState.documents.slice(0, 20).map(d => ({
        ...d,
        // Keep compact page excerpts for cross-device "Xem nguồn PDF" text view without bloating cloud JSON
        pageExcerpts: d.pageExcerpts && typeof d.pageExcerpts === "object"
            ? Object.fromEntries(Object.entries(d.pageExcerpts).slice(0, 80).map(([p, txt]) => [p, String(txt || "").slice(0, 900)]))
            : {}
    })) : [];
    const courses = Array.isArray(rawPdfState.courses) ? rawPdfState.courses.slice(0, 20) : [];
    return {
        documents: docs,
        courses,
        activeCourseId: rawPdfState.activeCourseId || null,
        lastPosition: rawPdfState.lastPosition || null,
        updatedAt: rawPdfState.updatedAt || new Date().toISOString()
    };
}

function collectCurrentWorkspaceSnapshot() {
    const dashBase = safeParseJSON(localStorage.getItem(STORAGE_KEYS.DASHBOARD), { tasksByDate: {} }) || { tasksByDate: {} };
    const pdfRaw = safeParseJSON(localStorage.getItem(STORAGE_KEYS.PDF_STUDIO), null);
    const pdfCompact = compactPdfStudioForCloud(pdfRaw);
    const dashboardStateMerged = pdfCompact ? { ...dashBase, pdfStudio: pdfCompact } : dashBase;

    return {
        settings: appSettings || safeParseJSON(localStorage.getItem(STORAGE_KEYS.SETTINGS), getDefaultSettings()),
        deck_v2: Array.isArray(deck) && deck.length ? deck : safeParseJSON(localStorage.getItem(STORAGE_KEYS.DECK_V2), []),
        srs_state: srsState || safeParseJSON(localStorage.getItem(STORAGE_KEYS.SRS), {}),
        progress_state: progressState || safeParseJSON(localStorage.getItem(STORAGE_KEYS.PROGRESS), {}),
        dashboard_state: dashboardStateMerged,
        grammar_state: safeParseJSON(localStorage.getItem(STORAGE_KEYS.GRAMMAR), { completedIds: [], scores: {} }),
        listening_state: safeParseJSON(localStorage.getItem(STORAGE_KEYS.LISTENING), { completedIds: [], scores: {}, history: [] }),
        speaking_state: safeParseJSON(localStorage.getItem(STORAGE_KEYS.SPEAKING), { history: [] }),
        reading_state: safeParseJSON(localStorage.getItem(STORAGE_KEYS.READING), { completedIds: [], highlights: {}, notes: {}, scores: {} }),
        writing_state: safeParseJSON(localStorage.getItem(STORAGE_KEYS.WRITING), { drafts: {}, submissions: [] }),
        notebook: Array.isArray(notebookItems) ? notebookItems : safeParseJSON(localStorage.getItem(STORAGE_KEYS.NOTEBOOK), []),
        cms_items: Array.isArray(cmsItems) ? cmsItems : safeParseJSON(localStorage.getItem(STORAGE_KEYS.CMS), [])
    };
}

function applyWorkspaceSnapshotToLocal(snapshot, options = {}) {
    if (!snapshot || typeof snapshot !== "object") return;
    window.__QENGLISH_SUPPRESS_SYNC = true;
    try {
        if (snapshot.settings && typeof snapshot.settings === "object") {
            safeWriteJSON(STORAGE_KEYS.SETTINGS, { ...getDefaultSettings(), ...snapshot.settings });
        }
        if (Array.isArray(snapshot.deck_v2)) {
            safeWriteJSON(STORAGE_KEYS.DECK_V2, snapshot.deck_v2.map((w, i) => normalizeWordItem(w, i)));
        }
        if (snapshot.srs_state && typeof snapshot.srs_state === "object") {
            safeWriteJSON(STORAGE_KEYS.SRS, snapshot.srs_state);
        }
        if (snapshot.progress_state && typeof snapshot.progress_state === "object") {
            safeWriteJSON(STORAGE_KEYS.PROGRESS, snapshot.progress_state);
        }
        if (snapshot.dashboard_state && typeof snapshot.dashboard_state === "object") {
            safeWriteJSON(STORAGE_KEYS.DASHBOARD, snapshot.dashboard_state);
            if (snapshot.dashboard_state.pdfStudio && typeof snapshot.dashboard_state.pdfStudio === "object") {
                safeWriteJSON(STORAGE_KEYS.PDF_STUDIO, snapshot.dashboard_state.pdfStudio);
            }
        }
        if (snapshot.grammar_state && typeof snapshot.grammar_state === "object") {
            safeWriteJSON(STORAGE_KEYS.GRAMMAR, snapshot.grammar_state);
        }
        if (snapshot.listening_state && typeof snapshot.listening_state === "object") {
            safeWriteJSON(STORAGE_KEYS.LISTENING, snapshot.listening_state);
        }
        if (snapshot.speaking_state && typeof snapshot.speaking_state === "object") {
            safeWriteJSON(STORAGE_KEYS.SPEAKING, snapshot.speaking_state);
        }
        if (snapshot.reading_state && typeof snapshot.reading_state === "object") {
            safeWriteJSON(STORAGE_KEYS.READING, snapshot.reading_state);
        }
        if (snapshot.writing_state && typeof snapshot.writing_state === "object") {
            safeWriteJSON(STORAGE_KEYS.WRITING, snapshot.writing_state);
        }
        if (Array.isArray(snapshot.notebook)) {
            safeWriteJSON(STORAGE_KEYS.NOTEBOOK, snapshot.notebook);
        }
        if (Array.isArray(snapshot.cms_items)) {
            safeWriteJSON(STORAGE_KEYS.CMS, snapshot.cms_items);
        }
        reloadAllActiveAccountStates({ preserveTranslationState: Boolean(options.preserveFocusedEditor) });
    } finally {
        window.__QENGLISH_SUPPRESS_SYNC = false;
    }
}

function readScopedNamespaceSnapshot(prefix = "") {
    const k = (baseKey) => prefix ? `${prefix}${baseKey}` : baseKey;
    const rawDeck = safeParseJSON(localStorage.getItem(k(BASE_STORAGE_KEYS.DECK_V2)), null);
    return {
        settings: safeParseJSON(localStorage.getItem(k(BASE_STORAGE_KEYS.SETTINGS)), null) || {},
        deck_v2: Array.isArray(rawDeck) ? rawDeck : [],
        srs_state: safeParseJSON(localStorage.getItem(k(BASE_STORAGE_KEYS.SRS)), {}) || {},
        progress_state: safeParseJSON(localStorage.getItem(k(BASE_STORAGE_KEYS.PROGRESS)), { days: {}, activities: [], skillHistory: {} }) || { days: {}, activities: [], skillHistory: {} },
        dashboard_state: safeParseJSON(localStorage.getItem(k(BASE_STORAGE_KEYS.DASHBOARD)), { tasksByDate: {} }) || { tasksByDate: {} },
        grammar_state: safeParseJSON(localStorage.getItem(k(BASE_STORAGE_KEYS.GRAMMAR)), { completedIds: [], scores: {} }) || { completedIds: [], scores: {} },
        listening_state: safeParseJSON(localStorage.getItem(k(BASE_STORAGE_KEYS.LISTENING)), { completedIds: [], scores: {}, history: [] }) || { completedIds: [], scores: {}, history: [] },
        speaking_state: safeParseJSON(localStorage.getItem(k(BASE_STORAGE_KEYS.SPEAKING)), { history: [] }) || { history: [] },
        reading_state: safeParseJSON(localStorage.getItem(k(BASE_STORAGE_KEYS.READING)), { completedIds: [], highlights: {}, notes: {}, scores: {} }) || { completedIds: [], highlights: {}, notes: {}, scores: {} },
        writing_state: safeParseJSON(localStorage.getItem(k(BASE_STORAGE_KEYS.WRITING)), { drafts: {}, submissions: [] }) || { drafts: {}, submissions: [] },
        notebook: safeParseJSON(localStorage.getItem(k(BASE_STORAGE_KEYS.NOTEBOOK)), []) || [],
        cms_items: safeParseJSON(localStorage.getItem(k(BASE_STORAGE_KEYS.CMS)), []) || []
    };
}

function collectLegacyUnscopedSnapshot() {
    const base = readScopedNamespaceSnapshot("");
    const deckCandidates = [
        base.deck_v2,
        safeParseJSON(localStorage.getItem(BASE_STORAGE_KEYS.DECK_V1), null),
        safeParseJSON(localStorage.getItem(BASE_STORAGE_KEYS.FPT_V3), null)
    ];

    const legSnapObj = safeParseJSON(localStorage.getItem(BASE_STORAGE_KEYS.LEGACY_SNAPSHOT), null);
    if (legSnapObj && typeof legSnapObj === "object") {
        deckCandidates.push(legSnapObj.qenglish_deck_v2, legSnapObj.qenglish_deck_v1, legSnapObj.fpt_eng_deck_v3);
        if (Array.isArray(legSnapObj.qenglish_notebook_v1) && legSnapObj.qenglish_notebook_v1.length && !base.notebook.length) {
            base.notebook = legSnapObj.qenglish_notebook_v1;
        }
        if (legSnapObj.qenglish_writing_v1 && typeof legSnapObj.qenglish_writing_v1 === "object" && (!base.writing_state?.submissions?.length)) {
            base.writing_state = legSnapObj.qenglish_writing_v1;
        }
    }

    // Also inspect legacy unscoped multi-profile store (qenglish_accounts_v1)
    const oldAccounts = safeParseJSON(localStorage.getItem("qenglish_accounts_v1"), null);
    if (oldAccounts && oldAccounts.accounts && typeof oldAccounts.accounts === "object") {
        Object.values(oldAccounts.accounts).forEach(acc => {
            if (!acc || !acc.data) return;
            const dRaw = acc.data[BASE_STORAGE_KEYS.DECK_V2];
            const parsedD = typeof dRaw === "string" ? safeParseJSON(dRaw, null) : dRaw;
            if (Array.isArray(parsedD) && parsedD.length) deckCandidates.push(parsedD);
        });
    }

    const deckMap = new Map();
    deckCandidates.forEach(arr => {
        if (!Array.isArray(arr)) return;
        arr.forEach(w => {
            if (!w || typeof w !== "object" || !w.term) return;
            const key = String(w.term).trim().toLowerCase();
            if (!key) return;
            if (!deckMap.has(key)) deckMap.set(key, w);
        });
    });
    base.deck_v2 = Array.from(deckMap.values());
    return base;
}

function findSameEmailLocalAccountIds(userEmail, currentUid) {
    const cleanEmail = String(userEmail || "").trim().toLowerCase();
    if (!cleanEmail) return [];
    const found = new Set();

    // 1. Check registered local-mode auth accounts matching the exact email
    const localUsers = safeParseJSON(localStorage.getItem("qenglish_local_auth_users_v1"), {});
    Object.values(localUsers || {}).forEach(u => {
        if (!u || !u.id || u.id === currentUid) return;
        if (String(u.email || "").trim().toLowerCase() === cleanEmail) {
            found.add(u.id);
        }
    });

    // 2. Also scan localStorage keys matching qenglish_u_local-<sanitizedEmail>-*::qenglish_deck_v2
    const sanitized = cleanEmail.replace(/[^a-z0-9]/g, "");
    const localPrefix = `qenglish_u_local-${sanitized}-`;
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i) || "";
            if (key.startsWith(localPrefix) && key.endsWith(`::${BASE_STORAGE_KEYS.DECK_V2}`)) {
                const uid = key.slice("qenglish_u_".length, key.indexOf("::"));
                if (uid && uid !== currentUid) found.add(uid);
            }
        }
    } catch {}

    return Array.from(found);
}

function snapshotHasMeaningfulData(snap) {
    if (!snap || typeof snap !== "object") return false;
    const words = Array.isArray(snap.deck_v2) ? snap.deck_v2 : [];
    const hasCustomWords = words.length > 50 || words.some(w => Number(w.id) > 50 || w.starred || w.source === "user-imported" || w.source === "local-browser");
    const noteCount = Array.isArray(snap.notebook) ? snap.notebook.length : 0;
    const materialCount = Array.isArray(snap.cms_items) ? snap.cms_items.length : 0;
    const transHist = Array.isArray(snap.writing_state?.translation?.history) ? snap.writing_state.translation.history.length : 0;
    const transDrafts = snap.writing_state?.translation?.drafts
        ? Object.values(snap.writing_state.translation.drafts).filter(v => String(v || "").trim().length > 0).length
        : 0;
    const writingCount = (Array.isArray(snap.writing_state?.submissions) ? snap.writing_state.submissions.length : 0) + transHist + transDrafts;
    const daysCount = snap.progress_state?.days ? Object.keys(snap.progress_state.days).length : 0;
    const srsCount = snap.srs_state ? Object.keys(snap.srs_state).length : 0;
    return hasCustomWords || noteCount > 0 || writingCount > 0 || materialCount > 0 || daysCount > 0 || srsCount > 0;
}

function autoMigrateSameEmailLocalData(userId, userEmail) {
    if (!userId || String(userId).startsWith("local-")) return { migrated: false, addedWords: 0 };
    const localIds = findSameEmailLocalAccountIds(userEmail, userId);
    if (!localIds.length) return { migrated: false, addedWords: 0 };

    const mergedFlagKey = `qenglish_local_merged_sources_${userId}`;
    const alreadyMerged = new Set(safeParseJSON(localStorage.getItem(mergedFlagKey), []));
    const pendingIds = localIds.filter(id => !alreadyMerged.has(id));
    if (!pendingIds.length) return { migrated: false, addedWords: 0 };

    let currentSnap = collectCurrentWorkspaceSnapshot();
    const beforeWords = Array.isArray(currentSnap.deck_v2) ? currentSnap.deck_v2.length : 0;
    let didMerge = false;

    pendingIds.forEach(localUid => {
        const localSnap = readScopedNamespaceSnapshot(`qenglish_u_${localUid}::`);
        if (snapshotHasMeaningfulData(localSnap)) {
            currentSnap = typeof CloudClient !== "undefined"
                ? CloudClient.mergeSnapshotData(currentSnap, localSnap)
                : localSnap;
            didMerge = true;
        }
        alreadyMerged.add(localUid);
    });

    try {
        localStorage.setItem(mergedFlagKey, JSON.stringify(Array.from(alreadyMerged)));
    } catch {}

    if (didMerge) {
        applyWorkspaceSnapshotToLocal(currentSnap);
        const afterWords = Array.isArray(currentSnap.deck_v2) ? currentSnap.deck_v2.length : 0;
        if (typeof CloudClient !== "undefined") CloudClient.syncNow();
        return { migrated: true, totalWords: afterWords, addedWords: Math.max(0, afterWords - beforeWords) };
    }
    return { migrated: false, addedWords: 0 };
}

function detectLegacyUnscopedDataSummary(userId) {
    if (!userId) return null;
    if (localStorage.getItem(`qenglish_legacy_prompted_${userId}`)) return null;

    const legSnap = collectLegacyUnscopedSnapshot();
    if (!snapshotHasMeaningfulData(legSnap)) return null;

    const wordCount = Array.isArray(legSnap.deck_v2) ? legSnap.deck_v2.length : 0;
    const noteCount = Array.isArray(legSnap.notebook) ? legSnap.notebook.length : 0;
    const transLegacyHist = Array.isArray(legSnap.writing_state?.translation?.history) ? legSnap.writing_state.translation.history.length : 0;
    const transLegacyDrafts = legSnap.writing_state?.translation?.drafts
        ? Object.values(legSnap.writing_state.translation.drafts).filter(v => String(v || "").trim().length > 0).length
        : 0;
    const writingCount = (Array.isArray(legSnap.writing_state?.submissions) ? legSnap.writing_state.submissions.length : 0) + transLegacyHist + transLegacyDrafts;
    const materialCount = Array.isArray(legSnap.cms_items) ? legSnap.cms_items.length : 0;
    const daysCount = legSnap.progress_state?.days ? Object.keys(legSnap.progress_state.days).length : 0;

    return { wordCount, noteCount, writingCount, materialCount, daysCount };
}

function migrateLegacyUnscopedDataToCurrentUser(userId, userEmail = "") {
    if (!userId) return { ok: false };
    ensureLegacyBackupSnapshot();
    let currentSnap = collectCurrentWorkspaceSnapshot();
    const beforeWords = Array.isArray(currentSnap.deck_v2) ? currentSnap.deck_v2.length : 0;

    // 1. Merge any same-email local-mode accounts
    const localIds = findSameEmailLocalAccountIds(userEmail || window.__QENGLISH_AUTH_USER?.email || "", userId);
    localIds.forEach(localUid => {
        const localSnap = readScopedNamespaceSnapshot(`qenglish_u_${localUid}::`);
        if (snapshotHasMeaningfulData(localSnap)) {
            currentSnap = typeof CloudClient !== "undefined"
                ? CloudClient.mergeSnapshotData(currentSnap, localSnap)
                : localSnap;
        }
    });

    // 2. Merge unscoped pre-auth legacy data (v2, v1, fpt_v3, legacy snapshot, old accounts store)
    const legSnap = collectLegacyUnscopedSnapshot();
    if (snapshotHasMeaningfulData(legSnap)) {
        currentSnap = typeof CloudClient !== "undefined"
            ? CloudClient.mergeSnapshotData(currentSnap, legSnap)
            : legSnap;
    }

    const afterWords = Array.isArray(currentSnap.deck_v2) ? currentSnap.deck_v2.length : 0;
    applyWorkspaceSnapshotToLocal(currentSnap);
    localStorage.setItem(`qenglish_legacy_prompted_${userId}`, "migrated");
    if (typeof CloudClient !== "undefined") CloudClient.syncNow();
    return { ok: true, totalWords: afterWords, addedWords: Math.max(0, afterWords - beforeWords) };
}
