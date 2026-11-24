/* ==========================================================================
   QEnglish - Speaking V3 Module
   - Mode 1: Random Topic Conversation (AI selects topic)
   - Mode 2: Custom Topic Conversation (User selects topic, CEFR A1-C2, Difficulty, Style)
   - Mode 3: Topic Speaking & Cue Card (Preserved)
   - Manual Record-to-Send State Machine (IDLE -> RECORDING -> PROCESSING -> AI_SPEAKING -> READY / ERROR)
     Zero auto-send on silence pauses; continuous auto-restart keepalive until explicit SEND or CANCEL.
   - Real AI Voice Playback Speed (0.5x - 2.0x) wired live to SpeechSynthesis.
   - Full-session Speaking Evaluation (Grammar, Vocabulary, Fluency, Coherence, Pronunciation*, Corrections, Model Answer, Practice Plan).
   ========================================================================== */

let activeSpeakingMode = null; // 'random-conversation' | 'custom-conversation' | 'topic'
let activeSpeakingTopic = null;
let speakingTurns = []; // { role: 'interviewer'|'user', text, confidence, wordsUnclear, durationSec, at }
let activeContinuousRec = null;
let activeMediaRecorder = null;
let activeAudioChunks = [];
let lastRecordedAudioUrl = null;
let speakingStartTimeMs = 0;
let guidedStarterPool = [];
let guidedFollowUpIdx = 0;
let currentStarterObj = null;

// ==================== SPEAKING V3 CONVERSATION CONFIGURATION & STATE MACHINE ====================
const CUSTOM_TOPIC_SUGGESTIONS = [
    "My Daily Life",
    "Traveling Around the World",
    "Artificial Intelligence",
    "University Life",
    "My Future Career",
    "Technology and Social Media",
    "Environmental Protection",
    "Food and Culture"
];

const CONV_DIFFICULTY_OPTIONS = [
    { value: "easy", label: "Cơ bản (Easy — Câu ngắn, dễ hiểu)" },
    { value: "medium", label: "Trung bình (Medium — Giao tiếp tự nhiên)" },
    { value: "hard", label: "Nâng cao (Hard — Hỏi sâu, mở rộng ý)" }
];

const CONV_STYLE_OPTIONS = [
    { value: "Casual Conversation", label: "Casual Conversation (Trò chuyện tự nhiên)" },
    { value: "Academic Discussion", label: "Academic Discussion (Thảo luận học thuật)" },
    { value: "Interview", label: "Interview (Phỏng vấn)" },
    { value: "Debate", label: "Debate (Tranh biện)" }
];

// Active live conversation config
let activeConversationConfig = {
    mode: "random", // 'random' | 'custom'
    topic: "",
    level: "B1",
    difficulty: "medium",
    style: "Casual Conversation",
    language: "English",
    contextBriefVi: "",
    focusVocab: []
};

// Strict Conversation State Machine: IDLE | RECORDING | PROCESSING | AI_SPEAKING | READY | ERROR
const CONV_MAX_DURATION_SEC = 300; // 5 minutes safe browser memory cap
const CONV_WARN_DURATION_SEC = 270; // 4m30s gentle notice

let convState = "IDLE";
let convErrorInfo = null; // { title, detail, retryText, retryConfidence, retryDurationSec }
let convPendingRetryTurn = null; // Preserved user turn if send fails (ZERO data loss)

// Manual Recording Engine Internals
let convRecSessionId = 0;
let convRecInstance = null;
let convRecMediaStream = null;
let convRecMediaRecorder = null;
let convRecAudioChunks = [];
let convRecStoppingAction = null; // null | 'send' | 'cancel' | 'cap'
let convRecRestartTimer = null;
let convRecDurationTimer = null;
let convRecStartMs = 0;
let convRecElapsedSec = 0;
let convRecCapReached = false;
let convCommittedChunks = []; // Finalized text chunks preserved across SR keepalive restarts
let convSegmentFinal = "";
let convSegmentInterim = "";
let convConfidenceSum = 0;
let convConfidenceCount = 0;
let convSendFlushResolver = null;
let convSendLock = false;
let convNetworkListenersBound = false;

function getSpeakingState() {
    return safeReadJSON(STORAGE_KEYS.SPEAKING, { history: [] });
}

function saveSpeakingState(st) {
    safeWriteJSON(STORAGE_KEYS.SPEAKING, st);
}

function _getDefaultCefrLevel() {
    const lv = String(appSettings?.selectedLevel || "B1").trim().toUpperCase();
    return ["A1", "A2", "B1", "B2", "C1", "C2"].includes(lv) ? lv : "B1";
}

function _formatTimerMMSS(totalSec) {
    const s = Math.max(0, Math.floor(Number(totalSec) || 0));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
}

function _bindConversationNetworkListeners() {
    if (convNetworkListenersBound) return;
    convNetworkListenersBound = true;
    window.addEventListener("offline", () => {
        if (activeSpeakingMode !== "random-conversation" && activeSpeakingMode !== "custom-conversation") return;
        showToast("Mất kết nối mạng! Nội dung ghi âm của bạn vẫn được giữ an toàn.", "warning");
        if (convState === "RECORDING") {
            const noteEl = document.getElementById("conv-live-hint");
            if (noteEl) {
                noteEl.innerHTML = `<span class="text-amber-300 font-bold">⚠️ Mạng vừa bị ngắt. Bản ghi đã nhận diện vẫn được giữ — bạn có thể chờ kết nối lại rồi bấm GỬI.</span>`;
            }
        }
    });
    window.addEventListener("online", () => {
        if (activeSpeakingMode !== "random-conversation" && activeSpeakingMode !== "custom-conversation") return;
        showToast("Đã kết nối lại mạng!", "success");
        if (convState === "ERROR" && convPendingRetryTurn) {
            updateConvControlUI();
        }
    });
}

/* ==================== MODE ROUTING ==================== */
function startSpeakingMode(mode) {
    // Backward compatibility: 'conversation' maps to 'random-conversation'
    const normalizedMode = mode === "conversation" ? "random-conversation" : mode;
    stopActiveSpeakingCapture();
    stopSpeech();
    activeSpeakingMode = normalizedMode;
    document.getElementById("speaking-mode-cards")?.classList.add("hidden");

    if (normalizedMode === "random-conversation") {
        document.getElementById("speaking-topics-list")?.classList.add("hidden");
        document.getElementById("speaking-session")?.classList.remove("hidden");
        if (typeof LearningHub !== "undefined") LearningHub.setSkillOuterPanelsVisible("speaking", false);
        initRandomConversationSession();
    } else if (normalizedMode === "custom-conversation") {
        document.getElementById("speaking-topics-list")?.classList.add("hidden");
        document.getElementById("speaking-session")?.classList.remove("hidden");
        if (typeof LearningHub !== "undefined") LearningHub.setSkillOuterPanelsVisible("speaking", false);
        renderCustomTopicSetupScreen();
    } else {
        document.getElementById("speaking-session")?.classList.add("hidden");
        document.getElementById("speaking-topics-list")?.classList.remove("hidden");
        if (typeof LearningHub !== "undefined") LearningHub.setSkillOuterPanelsVisible("speaking", true);
        renderSpeakingTopicsGrid();
    }
}

function closeSpeakingTopics() {
    document.getElementById("speaking-topics-list")?.classList.add("hidden");
    document.getElementById("speaking-mode-cards")?.classList.remove("hidden");
    if (typeof LearningHub !== "undefined") LearningHub.setSkillOuterPanelsVisible("speaking", true);
}

function closeSpeakingSession() {
    stopActiveSpeakingCapture();
    stopSpeech();
    convState = "IDLE";
    convPendingRetryTurn = null;
    convErrorInfo = null;
    activeSpeakingMode = null;
    document.getElementById("speaking-session")?.classList.add("hidden");
    document.getElementById("speaking-topics-list")?.classList.add("hidden");
    document.getElementById("speaking-mode-cards")?.classList.remove("hidden");
    if (typeof LearningHub !== "undefined") LearningHub.setSkillOuterPanelsVisible("speaking", true);
}

function renderSpeakingTopicsGrid() {
    const lvFilter = document.getElementById("speaking-level-filter")?.value || "all";
    const grid = document.getElementById("speaking-topics-grid");
    if (!grid) return;

    const allTopics = getAllContentForSkill("speaking");
    const filtered = allTopics.filter(t => matchesSelectedLevel(t.level || "B1", lvFilter));

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full glass-panel rounded-2xl p-8 text-center space-y-3">
                <p class="font-bold text-white">Chưa có chủ đề Speaking cho cấp độ "${escHtml(lvFilter)}"</p>
                <button onclick="document.getElementById('speaking-level-filter').value='all'; renderSpeakingTopicsGrid();" class="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">Xem tất cả ${allTopics.length} chủ đề</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(t => `
        <div onclick='openTopicSpeakingWorkspace(${JSON.stringify(t.id)})' class="glass-card p-5 rounded-2xl cursor-pointer flex flex-col justify-between gap-4 transition">
            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        ${renderLevelBadge(t.level)}
                        <span class="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">${escHtml(t.type || "monologue")}</span>
                    </div>
                    <span class="text-xs text-slate-400">⏱ ~${t.duration || 90}s</span>
                </div>
                <h3 class="text-lg font-extrabold text-white">${escHtml(t.title)}</h3>
                <p class="text-xs text-slate-300">${escHtml(t.prompt)}</p>
                <p class="text-[11px] text-slate-400 italic">${escHtml(t.promptVi || "")}</p>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                <span class="text-slate-400">${(t.suggestedQuestions || []).length} câu hỏi gợi ý</span>
                <span class="font-bold text-violet-400">Chuẩn bị & Nói →</span>
            </div>
        </div>
    `).join("");
}

/* ==================== MODE 1: RANDOM TOPIC CONVERSATION ==================== */
function _pickRandomStarterFromBank(targetLv) {
    const allStarters = typeof CONVERSATION_STARTERS !== "undefined" ? CONVERSATION_STARTERS : [];
    const matched = allStarters.filter(s => String(s.level || "").toUpperCase() === targetLv);
    const pool = matched.length ? matched : allStarters;
    const prevId = currentStarterObj?.id;
    const filteredPool = pool.length > 1 && prevId ? pool.filter(s => s.id !== prevId) : pool;
    const chosen = filteredPool[Math.floor(Math.random() * Math.max(1, filteredPool.length))];
    return chosen || {
        id: "cs-default",
        question: "Hello! What would you do if you had one month of free time with no responsibilities?",
        level: targetLv,
        topic: "Free Time & Personal Goals",
        followUps: [
            "What do you enjoy most about spending time that way?",
            "Who would you like to share that experience with?",
            "How do you usually balance study and relaxation in daily life?"
        ]
    };
}

async function initRandomConversationSession() {
    _bindConversationNetworkListeners();
    stopActiveSpeakingCapture();
    stopSpeech();

    const targetLv = _getDefaultCefrLevel();
    const fallbackStarter = _pickRandomStarterFromBank(targetLv);
    currentStarterObj = fallbackStarter;
    guidedFollowUpIdx = 0;

    activeConversationConfig = {
        mode: "random",
        topic: fallbackStarter.topic || "Random Conversation",
        level: targetLv,
        difficulty: "medium",
        style: "Casual Conversation",
        language: "English",
        contextBriefVi: "AI tự chọn một chủ đề giao tiếp ngẫu nhiên và trò chuyện tự nhiên từng lượt cùng bạn.",
        focusVocab: []
    };

    // Start instantly with a random topic from the bank (zero wait), or allow user to click "Đổi chủ đề ngẫu nhiên"
    // If AI is connected, AI continues the entire dialogue dynamically on this topic!
    renderLiveConversationWorkspace(fallbackStarter.question);
}

async function rerollRandomConversationTopic() {
    stopActiveSpeakingCapture();
    stopSpeech();

    const targetLv = activeConversationConfig.level || _getDefaultCefrLevel();
    if (AIClient.status.connected && appSettings?.aiConsentAccepted) {
        const container = document.getElementById("speaking-content");
        if (container) {
            container.innerHTML = `
                <div class="glass-panel rounded-3xl p-8 text-center space-y-3 border border-violet-500/30">
                    <div class="text-3xl animate-spin inline-block">🌐</div>
                    <p class="text-sm font-extrabold text-white">AI đang chọn một chủ đề ngẫu nhiên mới (CEFR ${escHtml(targetLv)})...</p>
                    <p class="text-xs text-slate-400">Vui lòng đợi giây lát.</p>
                </div>
            `;
        }
        const res = await AIClient.request("speaking-start", {
            mode: "random",
            level: targetLv,
            difficulty: "medium",
            style: "Casual Conversation",
            language: "English"
        });
        if (res.ok && res.data && res.data.openingQuestion) {
            currentStarterObj = {
                id: "ai-rand-" + Date.now(),
                topic: res.data.topic || "Random Conversation",
                level: targetLv,
                question: res.data.openingQuestion,
                followUps: Array.isArray(res.data.fallbackFollowUps) ? res.data.fallbackFollowUps : []
            };
            guidedFollowUpIdx = 0;
            activeConversationConfig = {
                mode: "random",
                topic: currentStarterObj.topic,
                level: targetLv,
                difficulty: "medium",
                style: "Casual Conversation",
                language: "English",
                contextBriefVi: res.data.contextBriefVi || "AI vừa chọn ngẫu nhiên chủ đề giao tiếp mới cho bạn.",
                focusVocab: Array.isArray(res.data.focusVocab) ? res.data.focusVocab : []
            };
            renderLiveConversationWorkspace(currentStarterObj.question);
            return;
        }
    }

    initRandomConversationSession();
}

/* ==================== MODE 2: CUSTOM TOPIC CONVERSATION SETUP ==================== */
function renderCustomTopicSetupScreen() {
    _bindConversationNetworkListeners();
    stopActiveSpeakingCapture();
    stopSpeech();
    convState = "IDLE";

    const defaultLevel = activeConversationConfig.mode === "custom" && activeConversationConfig.level
        ? activeConversationConfig.level
        : _getDefaultCefrLevel();
    const savedTopic = activeConversationConfig.mode === "custom" ? (activeConversationConfig.topic || "") : "";
    const savedDiff = activeConversationConfig.difficulty || "medium";
    const savedStyle = activeConversationConfig.style || "Casual Conversation";
    const aiConnected = AIClient.status.connected;

    const container = document.getElementById("speaking-content");
    if (!container) return;

    container.innerHTML = `
        <div class="glass-panel rounded-3xl p-5 sm:p-8 border border-cyan-500/30 space-y-6 max-w-4xl mx-auto">
            <!-- Header -->
            <div class="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div class="space-y-1">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-wider">
                        🎯 Custom Topic Conversation
                    </span>
                    <h3 class="text-xl sm:text-2xl font-black text-white">Hội thoại theo chủ đề của tôi</h3>
                    <p class="text-xs text-slate-300">Tự nhập bất kỳ chủ đề nào hoặc chọn từ gợi ý bên dưới. AI sẽ mở đầu và bám sát đúng chủ đề bạn chọn trong suốt cuộc trò chuyện.</p>
                </div>
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border ${aiConnected ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" : "bg-amber-500/10 text-amber-300 border-amber-500/30"}">
                    <span class="w-2 h-2 rounded-full ${aiConnected ? "bg-emerald-400" : "bg-amber-400"}"></span>
                    ${aiConnected ? `AI Live (${escHtml(AIClient.status.provider || "Gemini")})` : "Offline Fallback"}
                </span>
            </div>

            <!-- Topic Input -->
            <div class="space-y-2.5">
                <label for="custom-conv-topic-input" class="block text-sm font-extrabold text-white">
                    Bạn muốn trò chuyện về chủ đề gì?
                </label>
                <input
                    id="custom-conv-topic-input"
                    type="text"
                    value="${escHtml(savedTopic)}"
                    maxlength="200"
                    placeholder="Nhập chủ đề muốn nói chuyện tại đây... (VD: Traveling to Japan, Starting a Startup...)"
                    oninput="syncCustomTopicChipHighlight(this.value)"
                    onkeydown="if(event.key==='Enter'){ event.preventDefault(); confirmAndStartCustomConversation(); }"
                    class="w-full bg-slate-950/90 border border-cyan-500/35 focus:border-cyan-400 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 transition"
                />
            </div>

            <!-- Suggested Topics -->
            <div class="space-y-2.5">
                <p class="text-xs font-extrabold uppercase tracking-wider text-slate-400">✨ Chủ đề gợi ý (bấm để chọn nhanh hoặc tự nhập chủ đề mới):</p>
                <div id="custom-topic-chips" class="flex flex-wrap gap-2">
                    ${CUSTOM_TOPIC_SUGGESTIONS.map(topic => {
                        const active = savedTopic.trim().toLowerCase() === topic.toLowerCase();
                        return `
                            <button
                                type="button"
                                data-topic-chip="${escHtml(topic)}"
                                onclick='selectCustomTopicSuggestion(${JSON.stringify(topic)})'
                                class="px-3.5 py-2 rounded-xl text-xs font-bold border transition ${active
                                    ? "bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/15"
                                    : "bg-slate-900/80 border-white/10 text-slate-300 hover:border-cyan-400/50 hover:text-white"}"
                            >
                                ${escHtml(topic)}
                            </button>
                        `;
                    }).join("")}
                </div>
            </div>

            <!-- Settings Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                <!-- CEFR Level -->
                <div class="p-3.5 rounded-2xl bg-slate-950/75 border border-white/10 space-y-1.5">
                    <label for="custom-conv-level" class="block text-[11px] font-extrabold uppercase text-violet-300">📊 Trình độ (CEFR)</label>
                    <select id="custom-conv-level" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-violet-400 cursor-pointer">
                        ${["A1", "A2", "B1", "B2", "C1", "C2"].map(lv => `<option value="${lv}" ${lv === defaultLevel ? "selected" : ""}>CEFR ${lv}</option>`).join("")}
                    </select>
                </div>

                <!-- Difficulty -->
                <div class="p-3.5 rounded-2xl bg-slate-950/75 border border-white/10 space-y-1.5">
                    <label for="custom-conv-difficulty" class="block text-[11px] font-extrabold uppercase text-amber-300">🎚️ Độ khó hội thoại</label>
                    <select id="custom-conv-difficulty" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400 cursor-pointer">
                        ${CONV_DIFFICULTY_OPTIONS.map(o => `<option value="${o.value}" ${o.value === savedDiff ? "selected" : ""}>${escHtml(o.label)}</option>`).join("")}
                    </select>
                </div>

                <!-- Style -->
                <div class="p-3.5 rounded-2xl bg-slate-950/75 border border-white/10 space-y-1.5">
                    <label for="custom-conv-style" class="block text-[11px] font-extrabold uppercase text-emerald-300">🎭 Phong cách</label>
                    <select id="custom-conv-style" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-400 cursor-pointer">
                        ${CONV_STYLE_OPTIONS.map(o => `<option value="${o.value}" ${o.value === savedStyle ? "selected" : ""}>${escHtml(o.label)}</option>`).join("")}
                    </select>
                </div>

                <!-- Response Language -->
                <div class="p-3.5 rounded-2xl bg-slate-950/75 border border-white/10 space-y-1.5">
                    <label for="custom-conv-lang" class="block text-[11px] font-extrabold uppercase text-cyan-300">🌐 Ngôn ngữ phản hồi</label>
                    <select id="custom-conv-lang" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-cyan-200 focus:outline-none cursor-pointer">
                        <option value="English" selected>English (Tiếng Anh)</option>
                    </select>
                </div>
            </div>

            <!-- Action Button -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
                <p class="text-[11px] text-slate-400">
                    💡 Bạn toàn quyền bấm <strong>Bấm để nói</strong> → suy nghĩ thoải mái → bấm <strong>GỬI</strong> khi nói xong.
                </p>
                <button
                    id="btn-confirm-custom-conv"
                    type="button"
                    onclick="confirmAndStartCustomConversation()"
                    class="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:brightness-110 active:scale-[0.99] text-white font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-cyan-600/25 transition flex items-center justify-center gap-2"
                >
                    <span>🚀</span>
                    <span>CONFIRM &amp; START CONVERSATION</span>
                </button>
            </div>
        </div>
    `;

    setTimeout(() => {
        const inp = document.getElementById("custom-conv-topic-input");
        if (inp) inp.focus();
    }, 60);
}

function selectCustomTopicSuggestion(topic) {
    const inp = document.getElementById("custom-conv-topic-input");
    if (inp) {
        inp.value = topic;
        inp.focus();
    }
    syncCustomTopicChipHighlight(topic);
}

function syncCustomTopicChipHighlight(val) {
    const clean = String(val || "").trim().toLowerCase();
    document.querySelectorAll("#custom-topic-chips [data-topic-chip]").forEach(btn => {
        const isMatch = String(btn.getAttribute("data-topic-chip") || "").trim().toLowerCase() === clean;
        btn.className = `px-3.5 py-2 rounded-xl text-xs font-bold border transition ${isMatch
            ? "bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/15"
            : "bg-slate-900/80 border-white/10 text-slate-300 hover:border-cyan-400/50 hover:text-white"}`;
    });
}

function _buildOfflineCustomOpening(topic, level, style) {
    const t = String(topic || "your chosen topic").trim();
    if (level === "A1" || level === "A2") {
        return {
            openingQuestion: `That's a great topic! Let's talk about ${t}. What do you like most about ${t}, and why?`,
            contextBriefVi: `Hội thoại theo chủ đề "${t}" ở trình độ ${level} (${style}).`,
            focusVocab: [],
            fallbackFollowUps: [
                `When do you usually think about or experience ${t}?`,
                `Can you share a simple example or story about ${t}?`,
                `Would you like to learn or explore more about ${t} in the future?`,
                `Why do you think ${t} is interesting to people?`
            ]
        };
    }
    if (style === "Debate") {
        return {
            openingQuestion: `Let's have a respectful debate about ${t}. What is your main viewpoint on ${t}, and what is the strongest argument supporting your stance?`,
            contextBriefVi: `Tranh biện chuyên sâu về chủ đề "${t}" (CEFR ${level}).`,
            focusVocab: [],
            fallbackFollowUps: [
                `How would you respond to someone who strongly disagrees with your view on ${t}?`,
                `What real-world evidence best illustrates your point about ${t}?`,
                `Are there any potential downsides or trade-offs regarding ${t}?`
            ]
        };
    }
    if (style === "Interview") {
        return {
            openingQuestion: `Welcome! Today we will discuss ${t}. To begin our interview, could you share your personal perspective or experience related to ${t}?`,
            contextBriefVi: `Phỏng vấn luyện nói về chủ đề "${t}" (CEFR ${level}).`,
            focusVocab: [],
            fallbackFollowUps: [
                `What is the biggest challenge or opportunity you see in ${t}?`,
                `Could you give a specific example to support your answer about ${t}?`,
                `How do you expect ${t} to evolve over the next few years?`
            ]
        };
    }
    if (style === "Academic Discussion") {
        return {
            openingQuestion: `That is a compelling subject for academic discussion: ${t}. To start, what key factors or trends make ${t} particularly significant today?`,
            contextBriefVi: `Thảo luận học thuật về chủ đề "${t}" (CEFR ${level}).`,
            focusVocab: [],
            fallbackFollowUps: [
                `What are the main causes or impacts associated with ${t}?`,
                `How does ${t} affect society or students in particular?`,
                `What practical solutions or future developments do you foresee regarding ${t}?`
            ]
        };
    }
    return {
        openingQuestion: `That's a really interesting topic! Let's talk about ${t}. To get started, what first drew your interest to ${t}, and what aspect would you like to explore most?`,
        contextBriefVi: `Hội thoại tự nhiên xoay quanh chủ đề "${t}" (CEFR ${level}).`,
        focusVocab: [],
        fallbackFollowUps: [
            `That's fascinating! Could you tell me a bit more about your thoughts or experience with ${t}?`,
            `What do you think is the most memorable or important part of ${t}?`,
            `If you had the chance to experience or improve something related to ${t}, what would you choose?`
        ]
    };
}

async function confirmAndStartCustomConversation() {
    const inp = document.getElementById("custom-conv-topic-input");
    const topic = String(inp?.value || "").trim();
    if (!topic) {
        showToast("Vui lòng nhập hoặc chọn một chủ đề trước khi bắt đầu!", "warning");
        inp?.focus();
        return;
    }

    const level = document.getElementById("custom-conv-level")?.value || "B1";
    const difficulty = document.getElementById("custom-conv-difficulty")?.value || "medium";
    const style = document.getElementById("custom-conv-style")?.value || "Casual Conversation";
    const language = document.getElementById("custom-conv-lang")?.value || "English";

    const btn = document.getElementById("btn-confirm-custom-conv");
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="animate-spin inline-block">⏳</span><span>AI đang phân tích chủ đề &amp; khởi tạo hội thoại...</span>`;
    }

    activeConversationConfig = {
        mode: "custom",
        topic,
        level,
        difficulty,
        style,
        language,
        contextBriefVi: "",
        focusVocab: []
    };

    let openingData = null;
    if (AIClient.status.connected && appSettings?.aiConsentAccepted) {
        const res = await AIClient.request("speaking-start", {
            mode: "custom",
            topic,
            level,
            difficulty,
            style,
            language
        });
        if (res.ok && res.data && res.data.openingQuestion) {
            openingData = res.data;
        }
    }

    if (!openingData) {
        openingData = _buildOfflineCustomOpening(topic, level, style);
    }

    activeConversationConfig.contextBriefVi = openingData.contextBriefVi || `Hội thoại bám sát chủ đề "${topic}" (${level} • ${style}).`;
    activeConversationConfig.focusVocab = Array.isArray(openingData.focusVocab) ? openingData.focusVocab : [];

    currentStarterObj = {
        id: "custom-conv-" + Date.now(),
        topic,
        level,
        question: openingData.openingQuestion,
        followUps: Array.isArray(openingData.fallbackFollowUps) && openingData.fallbackFollowUps.length
            ? openingData.fallbackFollowUps
            : _buildOfflineCustomOpening(topic, level, style).fallbackFollowUps
    };
    guidedFollowUpIdx = 0;

    renderLiveConversationWorkspace(openingData.openingQuestion);
}

/* ==================== SHARED LIVE CONVERSATION WORKSPACE (MODES 1 & 2) ==================== */
function renderLiveConversationWorkspace(openingQuestion) {
    speakingTurns = [];
    lastRecordedAudioUrl = null;
    convPendingRetryTurn = null;
    convErrorInfo = null;
    convState = "IDLE";

    const cfg = activeConversationConfig;
    const isCustom = cfg.mode === "custom";
    const aiConnected = AIClient.status.connected;
    const currentSpeedNorm = typeof normalizeSpeechRate === "function" ? normalizeSpeechRate(speechRate) : 1;
    const speedOptsHtml = (typeof SPEECH_RATE_OPTIONS !== "undefined" ? SPEECH_RATE_OPTIONS : [
        { value: 0.5, label: "0.5x (Rất chậm)" },
        { value: 0.75, label: "0.75x (Chậm)" },
        { value: 1, label: "1.0x (Chuẩn)" },
        { value: 1.25, label: "1.25x (Hơi nhanh)" },
        { value: 1.5, label: "1.5x (Nhanh)" },
        { value: 1.75, label: "1.75x (Rất nhanh)" },
        { value: 2, label: "2.0x (Cực nhanh)" }
    ]).map(o => `<option value="${o.value}" ${o.value === currentSpeedNorm ? "selected" : ""}>${escHtml(o.label)}</option>`).join("");

    const container = document.getElementById("speaking-content");
    if (!container) return;

    container.innerHTML = `
        <div class="space-y-4">
            <!-- Top Mode & Topic Context Banner -->
            <div class="p-4 rounded-2xl border ${isCustom ? "bg-cyan-500/10 border-cyan-500/30" : (aiConnected ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30")} text-xs space-y-2.5">
                <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center flex-wrap gap-2">
                        <span class="px-2.5 py-1 rounded-full font-extrabold text-[11px] ${isCustom ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30" : "bg-violet-500/20 text-violet-200 border border-violet-400/30"}">
                            ${isCustom ? "🎯 Custom Topic Conversation" : "🌐 Random Conversation"}
                        </span>
                        <span class="font-extrabold text-sm ${aiConnected ? "text-emerald-300" : "text-amber-300"}">
                            ${aiConnected
                                ? `🟢 AI Live (${escHtml(AIClient.status.provider || "Google Gemini")})`
                                : "🟡 Chế độ Dự phòng cục bộ (Chưa kết nối AI Backend)"}
                        </span>
                    </div>

                    <div class="flex items-center flex-wrap gap-2">
                        <!-- Synced AI Voice Speed Control inside Speaking workspace -->
                        <div class="flex items-center gap-1.5 bg-slate-950/90 px-2.5 py-1 rounded-xl border border-cyan-500/25" title="Tốc độ giọng nói của AI (áp dụng ngay lập tức)">
                            <span class="text-xs text-cyan-400">🔊</span>
                            <select data-speech-rate-select="1" onchange="updateSpeechRate(this.value)" class="bg-transparent text-xs font-bold text-cyan-300 focus:outline-none cursor-pointer">
                                ${speedOptsHtml}
                            </select>
                        </div>

                        ${isCustom
                            ? `<button type="button" onclick="renderCustomTopicSetupScreen()" class="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-[11px] font-bold text-cyan-300 transition">✏️ Đổi chủ đề</button>`
                            : `<button type="button" onclick="rerollRandomConversationTopic()" class="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-[11px] font-bold text-violet-300 transition">🎲 Đổi chủ đề ngẫu nhiên</button>`
                        }
                    </div>
                </div>

                <!-- Active Topic & Config Badges -->
                <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                    <span class="text-slate-400 font-semibold">Chủ đề:</span>
                    <span class="px-2.5 py-0.5 rounded-lg bg-slate-950/80 border border-white/10 text-white font-extrabold">${escHtml(cfg.topic || "General English")}</span>
                    ${renderLevelBadge(cfg.level || "B1")}
                    <span class="px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 text-[10px] font-bold text-slate-300">${escHtml(cfg.style)}</span>
                    <span class="px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 text-[10px] font-bold text-amber-300">Độ khó: ${escHtml(cfg.difficulty === "easy" ? "Cơ bản" : cfg.difficulty === "hard" ? "Nâng cao" : "Trung bình")}</span>
                    <span class="px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 text-[10px] font-bold text-cyan-300">${escHtml(cfg.language || "English")}</span>
                </div>

                ${cfg.contextBriefVi ? `<p class="text-[11px] text-slate-300">${escHtml(cfg.contextBriefVi)}</p>` : ""}

                ${(cfg.focusVocab && cfg.focusVocab.length) ? `
                    <div class="flex flex-wrap items-center gap-1.5">
                        <span class="text-[10px] font-bold text-slate-400 uppercase">Từ vựng gợi ý:</span>
                        ${cfg.focusVocab.map(w => `<button type="button" onclick='speakText(${JSON.stringify(w)})' class="px-2 py-0.5 rounded-lg bg-slate-950/80 border border-white/10 hover:border-cyan-400/40 text-[11px] text-cyan-200 transition">🔊 ${escHtml(w)}</button>`).join("")}
                    </div>
                ` : ""}
            </div>

            <!-- Chat Transcript Stream -->
            <div id="conv-messages" class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 max-h-80 sm:max-h-96 overflow-y-auto space-y-3"></div>

            <!-- MANUAL RECORD-TO-SEND CONTROL CENTER (PHẦN 2) -->
            <div id="conv-control-panel" class="p-5 sm:p-6 rounded-3xl bg-slate-950/85 border border-violet-500/25 flex flex-col items-center text-center space-y-4">
                <!-- Live State Pill + Timer -->
                <div id="conv-state-bar" class="flex flex-wrap items-center justify-center gap-2 min-h-[28px]"></div>

                <!-- Dynamic Main Control Area (IDLE/READY -> RECORDING [GỬI + HỦY] -> PROCESSING -> AI_SPEAKING -> ERROR) -->
                <div id="conv-primary-action" class="w-full flex flex-col items-center justify-center gap-3"></div>

                <!-- Animated Waveform (visible during RECORDING or AI_SPEAKING) -->
                <div id="conv-waveform" class="hidden flex items-center justify-center gap-1.5 h-8">
                    <span class="wave-bar" style="animation-delay:0s"></span>
                    <span class="wave-bar" style="animation-delay:0.15s"></span>
                    <span class="wave-bar" style="animation-delay:0.3s"></span>
                    <span class="wave-bar" style="animation-delay:0.45s"></span>
                    <span class="wave-bar" style="animation-delay:0.2s"></span>
                </div>

                <!-- Live Captured Speech Preview (visible during RECORDING) -->
                <div id="conv-live-preview-box" class="hidden w-full max-w-2xl p-3.5 rounded-2xl bg-slate-900/95 border border-emerald-500/30 text-left space-y-1.5">
                    <div class="flex items-center justify-between text-[11px]">
                        <span class="font-extrabold text-emerald-300">📝 Nội dung đang ghi nhận (chỉ gửi khi bạn bấm GỬI):</span>
                        <span id="conv-live-wordcount" class="text-slate-400 font-bold">0 từ</span>
                    </div>
                    <p id="conv-live-preview-text" class="text-sm text-white leading-relaxed min-h-[24px] break-words">
                        <span class="text-slate-500 italic">Đang lắng nghe giọng nói của bạn... Bạn có thể ngừng suy nghĩ 5s, 10s hoặc lâu hơn thoải mái.</span>
                    </p>
                </div>

                <!-- Error Recovery Banner (visible during ERROR) -->
                <div id="conv-error-box" class="hidden w-full max-w-2xl p-4 rounded-2xl bg-rose-500/10 border border-rose-500/35 text-left space-y-2.5"></div>

                <!-- Helper Hint -->
                <p id="conv-live-hint" class="text-xs text-slate-400 max-w-xl">
                    Bấm <strong>Bấm để nói</strong> để thu âm, suy nghĩ thoải mái không giới hạn khoảng lặng, sau đó bấm <strong class="text-emerald-300">GỬI</strong>. Khi muốn kết thúc buổi nói và chấm điểm toàn bộ, bấm <strong class="text-amber-300">Kết thúc &amp; Đánh giá</strong>.
                </p>

                <!-- Fallback Text Input + End & Evaluate Button -->
                <div class="flex flex-col sm:flex-row gap-2 w-full max-w-2xl pt-3 border-t border-white/10">
                    <input
                        id="conv-text-fallback"
                        type="text"
                        placeholder="Phương án dự phòng (nhập tiếng Anh nếu không dùng mic, hoặc gõ 'Please do')..."
                        onkeydown="if(event.key==='Enter')submitConversationTextTurn()"
                        class="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                    <div class="flex gap-2 shrink-0">
                        <button type="button" id="btn-conv-text-send" onclick="submitConversationTextTurn()" class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 transition">
                            Gửi văn bản
                        </button>
                        <button type="button" onclick="triggerPleaseDoEvaluation()" class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/35 text-xs font-extrabold text-amber-300 transition" title="Kết thúc hội thoại và đánh giá toàn bộ buổi nói">
                            ⏹ Kết thúc &amp; Đánh giá ("Please do")
                        </button>
                    </div>
                </div>
            </div>

            <div id="speaking-eval-output" class="hidden"></div>
        </div>
    `;

    if (typeof syncSpeedSelectorsUI === "function") syncSpeedSelectorsUI();

    appendConversationBubble("interviewer", openingQuestion);
    _playAiVoiceResponse(openingQuestion);
}

function appendConversationBubble(role, text) {
    speakingTurns.push({ role, text, at: Date.now() });
    const box = document.getElementById("conv-messages");
    if (!box) return;
    const isInterviewer = role === "interviewer";
    const div = document.createElement("div");
    div.className = `flex ${isInterviewer ? "justify-start" : "justify-end"}`;
    div.innerHTML = `
        <div class="max-w-[88%] sm:max-w-[82%] p-3.5 rounded-2xl text-xs space-y-1 ${isInterviewer ? "bg-slate-900 border border-white/10 text-slate-100" : "bg-gradient-to-r from-violet-600/85 to-indigo-600/85 text-white"}">
            <div class="flex items-center justify-between gap-3 text-[10px] opacity-80 font-bold">
                <span>${isInterviewer ? (AIClient.status.connected ? "🤖 AI Partner" : "📋 Guided Partner") : "🧑‍🎓 Bạn"}</span>
                <button type="button" onclick='speakText(${JSON.stringify(text)})' class="hover:text-cyan-300 transition" title="Nghe lại theo tốc độ hiện tại">🔊</button>
            </div>
            <p class="leading-relaxed text-sm break-words">${escHtml(text)}</p>
        </div>
    `;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

/* ==================== STATE MACHINE RENDERER ==================== */
function setConvState(newState, errorObj = null) {
    convState = newState;
    convErrorInfo = newState === "ERROR" ? errorObj : null;
    updateConvControlUI();
}

function updateConvControlUI() {
    const stateBar = document.getElementById("conv-state-bar");
    const primaryBox = document.getElementById("conv-primary-action");
    const waveEl = document.getElementById("conv-waveform");
    const previewBox = document.getElementById("conv-live-preview-box");
    const errorBox = document.getElementById("conv-error-box");
    const hintEl = document.getElementById("conv-live-hint");
    const textSendBtn = document.getElementById("btn-conv-text-send");

    if (!primaryBox || !stateBar) return;

    const rateLabel = typeof formatSpeechRateLabel === "function" ? formatSpeechRateLabel(speechRate) : `${speechRate}x`;

    // Reset visibility
    waveEl?.classList.add("hidden");
    previewBox?.classList.add("hidden");
    errorBox?.classList.add("hidden");
    if (textSendBtn) textSendBtn.disabled = (convState === "PROCESSING");

    if (convState === "IDLE" || convState === "READY") {
        stateBar.innerHTML = convState === "READY"
            ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-extrabold">✅ Sẵn sàng lượt nói tiếp theo</span>`
            : `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-slate-300 text-[11px] font-bold">🎙️ Sẵn sàng ghi âm</span>`;

        primaryBox.innerHTML = `
            <button
                id="conv-rec-btn"
                type="button"
                onclick="startManualConversationRecording()"
                class="w-28 h-28 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white font-black text-sm shadow-2xl shadow-violet-600/40 hover:scale-105 active:scale-95 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
                <span class="text-2xl">🎙️</span>
                <span id="conv-rec-label" class="text-xs font-extrabold">Bấm để nói</span>
            </button>
        `;

        if (hintEl) {
            hintEl.innerHTML = `Bấm <strong>Bấm để nói</strong> để bắt đầu ghi âm. Bạn có thể dừng suy nghĩ bao lâu tùy ý — hệ thống <strong>KHÔNG</strong> tự động gửi cho đến khi bạn bấm <strong class="text-emerald-300">GỬI</strong>.`;
        }
        return;
    }

    if (convState === "RECORDING") {
        stateBar.innerHTML = `
            <span class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/45 text-rose-300 text-xs font-black">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>🔴 ĐANG GHI ÂM...</span>
            </span>
            <span id="conv-rec-timer" class="px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-xs font-mono font-extrabold text-cyan-300">${_formatTimerMMSS(convRecElapsedSec)}</span>
        `;

        primaryBox.innerHTML = `
            <div class="w-full max-w-xl flex flex-col items-center gap-3">
                <button
                    id="conv-send-btn"
                    type="button"
                    onclick="confirmSendManualRecording()"
                    class="w-full py-4 px-6 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:brightness-110 active:scale-[0.99] text-white shadow-2xl shadow-emerald-600/35 transition flex flex-col items-center justify-center gap-1 cursor-pointer border border-emerald-300/30"
                >
                    <span class="text-base sm:text-lg font-black tracking-wide flex items-center gap-2">
                        <span>⬆️</span>
                        <span>GỬI</span>
                    </span>
                    <span class="text-[11px] font-semibold text-emerald-50/90">
                        Bạn có thể suy nghĩ bao lâu tùy ý trong giới hạn kỹ thuật của hệ thống.
                    </span>
                </button>
                <button
                    id="conv-cancel-btn"
                    type="button"
                    onclick="cancelManualConversationRecording()"
                    class="px-5 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-xs font-extrabold text-slate-300 hover:text-rose-300 transition flex items-center gap-1.5"
                >
                    <span>✕</span>
                    <span>HỦY lượt ghi âm này</span>
                </button>
            </div>
        `;

        waveEl?.classList.remove("hidden");
        previewBox?.classList.remove("hidden");
        _refreshLiveRecordingPreview();

        if (hintEl) {
            hintEl.innerHTML = convRecCapReached
                ? `<span class="text-amber-300 font-bold">⏱ Đã đạt giới hạn an toàn 5 phút cho 1 lượt ghi âm. Toàn bộ nội dung đã được giữ nguyên — hãy bấm GỬI hoặc HỦY.</span>`
                : `⏳ Khoảng lặng 5 giây, 10 giây hay lâu hơn sẽ <strong>KHÔNG</strong> làm dừng ghi âm. Chỉ gửi khi bạn bấm nút <strong class="text-emerald-300">⬆️ GỬI</strong>.`;
        }
        return;
    }

    if (convState === "PROCESSING") {
        stateBar.innerHTML = `
            <span class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-xs font-extrabold animate-pulse">
                <span class="animate-spin inline-block">⏳</span>
                <span>Đang gửi &amp; chờ AI xử lý...</span>
            </span>
        `;

        primaryBox.innerHTML = `
            <button
                type="button"
                disabled
                class="w-full max-w-md py-4 px-6 rounded-full bg-slate-900 border border-indigo-500/35 text-indigo-200 font-extrabold text-sm opacity-80 cursor-not-allowed flex items-center justify-center gap-2.5"
            >
                <span class="animate-spin inline-block">🤖</span>
                <span>AI đang phân tích và tạo phản hồi...</span>
            </button>
        `;

        if (hintEl) {
            hintEl.textContent = "Đang tạm khóa nút ghi âm để tránh gửi trùng. Vui lòng đợi AI phản hồi trong giây lát...";
        }
        return;
    }

    if (convState === "AI_SPEAKING") {
        stateBar.innerHTML = `
            <span class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-extrabold">
                <span>🔊</span>
                <span>AI đang phản hồi bằng giọng nói • <span data-speech-rate-label="1">${escHtml(rateLabel)}</span></span>
            </span>
        `;

        primaryBox.innerHTML = `
            <div class="flex flex-col items-center gap-3">
                <button
                    type="button"
                    disabled
                    class="w-28 h-28 rounded-full bg-slate-900 border-2 border-cyan-500/40 text-cyan-300 font-extrabold text-xs cursor-not-allowed flex flex-col items-center justify-center gap-1 opacity-85"
                >
                    <span class="text-2xl animate-pulse">🔊</span>
                    <span>AI đang nói...</span>
                </button>
                <button
                    type="button"
                    onclick="interruptAiVoiceToSpeak()"
                    class="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-[11px] font-bold text-slate-300 hover:text-white transition"
                >
                    ⏹ Dừng giọng AI để nói ngay
                </button>
            </div>
        `;

        waveEl?.classList.remove("hidden");
        if (hintEl) {
            hintEl.innerHTML = `Đang phát giọng AI ở tốc độ <strong class="text-cyan-300" data-speech-rate-label="1">${escHtml(rateLabel)}</strong>. Bạn có thể đổi tốc độ ngay lúc này mà không làm gián đoạn cuộc hội thoại. Sau khi AI nói xong, nút <strong>Bấm để nói</strong> sẽ tự mở lại.`;
        }
        return;
    }

    if (convState === "ERROR") {
        const info = convErrorInfo || { title: "Đã xảy ra lỗi", detail: "Vui lòng kiểm tra micro hoặc kết nối mạng rồi thử lại." };
        stateBar.innerHTML = `
            <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-extrabold">
                ❗ ${escHtml(info.title)}
            </span>
        `;

        primaryBox.innerHTML = `
            <button
                id="conv-rec-btn"
                type="button"
                onclick="startManualConversationRecording()"
                class="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white font-black text-xs shadow-xl hover:scale-105 active:scale-95 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
                <span class="text-xl">🎙️</span>
                <span id="conv-rec-label">Thử nói lại</span>
            </button>
        `;

        if (errorBox) {
            errorBox.classList.remove("hidden");
            const hasSavedTurn = Boolean(convPendingRetryTurn && convPendingRetryTurn.text);
            errorBox.innerHTML = `
                <div class="flex items-start gap-2.5 text-xs">
                    <span class="text-base">⚠️</span>
                    <div class="space-y-1.5 flex-1">
                        <p class="font-extrabold text-rose-300">${escHtml(info.title)}</p>
                        <p class="text-slate-200 leading-relaxed">${escHtml(info.detail)}</p>
                        ${hasSavedTurn ? `
                            <div class="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-slate-200 mt-1">
                                <span class="text-[10px] uppercase font-bold text-amber-300 block mb-0.5">Nội dung câu trả lời đã được bảo toàn:</span>
                                "${escHtml(convPendingRetryTurn.text)}"
                            </div>
                        ` : ""}
                        <div class="flex flex-wrap gap-2 pt-1">
                            ${hasSavedTurn ? `
                                <button type="button" onclick="retryPendingConversationTurn()" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition">
                                    🔄 Thử gửi lại câu vừa nói
                                </button>
                                <button type="button" onclick="movePendingTurnToFallbackInput()" class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs transition">
                                    ✏️ Chỉnh sửa trước khi gửi
                                </button>
                            ` : `
                                <button type="button" onclick="setConvState('READY')" class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition">
                                    🔄 Đóng thông báo &amp; Sẵn sàng
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }

        if (hintEl) {
            hintEl.textContent = "Bạn vẫn có thể gõ câu trả lời vào ô dự phòng bên dưới nếu thiết bị không có micro.";
        }
    }
}

/* ==================== MANUAL RECORDING ENGINE (SILENCE-PROOF) ==================== */
function _getCurrentRecordedTranscript() {
    const parts = [];
    for (const c of convCommittedChunks) {
        const clean = String(c || "").trim();
        if (clean) parts.push(clean);
    }
    const segFin = String(convSegmentFinal || "").trim();
    const segInt = String(convSegmentInterim || "").trim();
    if (segFin) parts.push(segFin);
    if (segInt) parts.push(segInt);
    return parts.join(" ").replace(/\s+/g, " ").trim();
}

function _commitActiveSegmentBuffers() {
    const segFin = String(convSegmentFinal || "").trim();
    const segInt = String(convSegmentInterim || "").trim();
    const toCommit = segFin || segInt;
    if (toCommit) {
        const prev = convCommittedChunks.length ? convCommittedChunks[convCommittedChunks.length - 1] : "";
        // Avoid exact duplicate tail on Android/Chromium restarts
        if (prev.toLowerCase() !== toCommit.toLowerCase()) {
            convCommittedChunks.push(toCommit);
        }
    }
    convSegmentFinal = "";
    convSegmentInterim = "";
}

function _refreshLiveRecordingPreview() {
    const previewTextEl = document.getElementById("conv-live-preview-text");
    const wordCountEl = document.getElementById("conv-live-wordcount");
    if (!previewTextEl) return;

    const committed = [...convCommittedChunks, convSegmentFinal].map(s => String(s || "").trim()).filter(Boolean).join(" ").trim();
    const interim = String(convSegmentInterim || "").trim();
    const combined = [committed, interim].filter(Boolean).join(" ").trim();

    if (!combined) {
        previewTextEl.innerHTML = `<span class="text-slate-500 italic">Đang lắng nghe giọng nói của bạn... Bạn có thể ngừng suy nghĩ 5s, 10s hoặc lâu hơn thoải mái.</span>`;
    } else {
        previewTextEl.innerHTML = `${escHtml(committed)}${committed && interim ? " " : ""}${interim ? `<span class="text-cyan-300/85 italic">${escHtml(interim)}</span>` : ""}`;
    }

    if (wordCountEl) {
        const wc = combined ? combined.split(/\s+/).filter(Boolean).length : 0;
        wordCountEl.textContent = `${wc} từ`;
    }
}

function _cleanupConvRecordingHandles(releaseMic = true) {
    if (convRecRestartTimer) {
        clearTimeout(convRecRestartTimer);
        convRecRestartTimer = null;
    }
    if (convRecDurationTimer) {
        clearInterval(convRecDurationTimer);
        convRecDurationTimer = null;
    }
    if (convRecInstance) {
        try {
            convRecInstance.onresult = null;
            convRecInstance.onerror = null;
            convRecInstance.onend = null;
            convRecInstance.abort();
        } catch (e) {}
        convRecInstance = null;
    }
    if (releaseMic) {
        if (convRecMediaRecorder && convRecMediaRecorder.state === "recording") {
            try { convRecMediaRecorder.stop(); } catch (e) {}
        }
        convRecMediaRecorder = null;
        if (convRecMediaStream) {
            try { convRecMediaStream.getTracks().forEach(t => t.stop()); } catch (e) {}
            convRecMediaStream = null;
        }
    }
}

function _startRecognitionKeepaliveSegment(sessionId) {
    if (sessionId !== convRecSessionId || convState !== "RECORDING" || convRecStoppingAction !== null || convRecCapReached) {
        return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    convRecInstance = rec;
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    convSegmentFinal = "";
    convSegmentInterim = "";

    rec.onresult = (ev) => {
        if (sessionId !== convRecSessionId) return;
        let finalParts = [];
        let interimParts = [];
        for (let i = 0; i < ev.results.length; i++) {
            const res = ev.results[i];
            const alt = res && res[0];
            if (!alt) continue;
            const txt = String(alt.transcript || "").trim();
            if (!txt) continue;
            if (res.isFinal) {
                finalParts.push(txt);
                if (typeof alt.confidence === "number" && alt.confidence > 0) {
                    convConfidenceSum += alt.confidence;
                    convConfidenceCount++;
                }
            } else {
                interimParts.push(txt);
            }
        }
        convSegmentFinal = finalParts.join(" ").trim();
        convSegmentInterim = interimParts.join(" ").trim();
        _refreshLiveRecordingPreview();
    };

    rec.onerror = (ev) => {
        if (sessionId !== convRecSessionId) return;
        const errCode = ev?.error || "";

        // CRITICAL: NEVER stop or auto-send on silence ("no-speech") or transient "aborted"!
        if (errCode === "no-speech" || errCode === "aborted") {
            return;
        }

        if (errCode === "not-allowed" || errCode === "service-not-allowed") {
            const preserved = _getCurrentRecordedTranscript();
            convRecStoppingAction = "cancel";
            _cleanupConvRecordingHandles(true);
            if (preserved) {
                convPendingRetryTurn = { text: preserved, confidence: 0.85, durationSec: Math.max(2, convRecElapsedSec) };
            }
            setConvState("ERROR", {
                title: "Chưa được cấp quyền Micro",
                detail: "Trình duyệt đang chặn quyền truy cập Microphone cho trang này. Hãy bấm biểu tượng ổ khóa trên thanh địa chỉ → Cho phép Microphone → rồi bấm Thử nói lại."
            });
            return;
        }

        if (errCode === "audio-capture") {
            const preserved = _getCurrentRecordedTranscript();
            convRecStoppingAction = "cancel";
            _cleanupConvRecordingHandles(true);
            if (preserved) {
                convPendingRetryTurn = { text: preserved, confidence: 0.85, durationSec: Math.max(2, convRecElapsedSec) };
            }
            setConvState("ERROR", {
                title: "Không tìm thấy thiết bị Micro",
                detail: "Không phát hiện thấy microphone hoặc micro đang bị ứng dụng khác chiếm dụng. Hãy kiểm tra thiết bị âm thanh rồi thử lại."
            });
            return;
        }

        if (errCode === "network") {
            const noteEl = document.getElementById("conv-live-hint");
            if (noteEl) {
                noteEl.innerHTML = `<span class="text-amber-300 font-bold">⚠️ Kết nối nhận diện giọng nói tạm chập chờn — hệ thống đang tự nối lại và vẫn giữ nguyên toàn bộ nội dung bạn đã nói.</span>`;
            }
        }
    };

    rec.onend = () => {
        if (sessionId !== convRecSessionId) return;

        // Commit whatever was recognized in this segment before either finalizing or restarting
        _commitActiveSegmentBuffers();
        _refreshLiveRecordingPreview();
        convRecInstance = null;

        // If user explicitly clicked GỬI, resolve the flush promise immediately
        if (convRecStoppingAction === "send") {
            if (typeof convSendFlushResolver === "function") {
                const r = convSendFlushResolver;
                convSendFlushResolver = null;
                r();
            }
            return;
        }

        // If cancelled or cap reached, stay stopped
        if (convRecStoppingAction === "cancel" || convRecCapReached) {
            return;
        }

        // CRITICAL SILENCE-KEEPALIVE:
        // Browser auto-ended recognition due to silence pause -> seamlessly restart on the SAME turn!
        if (convState === "RECORDING") {
            convRecRestartTimer = setTimeout(() => {
                _startRecognitionKeepaliveSegment(sessionId);
            }, 180);
        }
    };

    try {
        rec.start();
    } catch (err) {
        // Retry briefly if InvalidStateError during rapid restart
        if (convState === "RECORDING" && convRecStoppingAction === null) {
            convRecRestartTimer = setTimeout(() => {
                _startRecognitionKeepaliveSegment(sessionId);
            }, 350);
        }
    }
}

async function startManualConversationRecording() {
    // Strict guard: cannot start recording while already RECORDING, PROCESSING, or AI_SPEAKING
    if (convState === "RECORDING" || convState === "PROCESSING" || convState === "AI_SPEAKING") {
        return;
    }

    if (!isSpeechRecognitionSupported()) {
        setConvState("ERROR", {
            title: "Trình duyệt chưa hỗ trợ nhận diện giọng nói",
            detail: "Web Speech Recognition chưa khả dụng trên trình duyệt này. Vui lòng dùng Google Chrome / Microsoft Edge / Safari mới nhất, hoặc nhập trực tiếp vào ô dự phòng bên dưới."
        });
        return;
    }

    stopSpeech();
    _cleanupConvRecordingHandles(true);

    convRecSessionId++;
    const sessionId = convRecSessionId;
    convRecStoppingAction = null;
    convRecCapReached = false;
    convCommittedChunks = [];
    convSegmentFinal = "";
    convSegmentInterim = "";
    convConfidenceSum = 0;
    convConfidenceCount = 0;
    convRecAudioChunks = [];
    convRecStartMs = Date.now();
    convRecElapsedSec = 0;
    convPendingRetryTurn = null;
    convSendLock = false;

    // Immediately transition UI to RECORDING (Bấm để nói -> GỬI)
    setConvState("RECORDING");

    // Start duration timer (with transparent 5-min safety cap notice, NEVER auto-sending)
    convRecDurationTimer = setInterval(() => {
        if (sessionId !== convRecSessionId || convState !== "RECORDING") {
            clearInterval(convRecDurationTimer);
            convRecDurationTimer = null;
            return;
        }
        convRecElapsedSec = Math.floor((Date.now() - convRecStartMs) / 1000);
        const timerEl = document.getElementById("conv-rec-timer");
        if (timerEl) timerEl.textContent = _formatTimerMMSS(convRecElapsedSec);

        if (convRecElapsedSec === CONV_WARN_DURATION_SEC) {
            showToast("Bạn đã ghi âm 4 phút 30 giây (giới hạn an toàn tối đa 5 phút/lượt).", "warning");
        }
        if (convRecElapsedSec >= CONV_MAX_DURATION_SEC && !convRecCapReached) {
            convRecCapReached = true;
            _commitActiveSegmentBuffers();
            if (convRecInstance) {
                try { convRecInstance.stop(); } catch (e) {}
            }
            if (convRecMediaRecorder && convRecMediaRecorder.state === "recording") {
                try { convRecMediaRecorder.stop(); } catch (e) {}
            }
            if (convRecMediaStream) {
                try { convRecMediaStream.getTracks().forEach(t => t.stop()); } catch (e) {}
                convRecMediaStream = null;
            }
            updateConvControlUI();
            showToast("Đã đạt giới hạn 5 phút cho lượt này. Nội dung vẫn giữ nguyên — hãy bấm GỬI!", "warning");
        }
    }, 500);

    // Start continuous silence-proof SpeechRecognition
    _startRecognitionKeepaliveSegment(sessionId);

    // Optional local MediaRecorder capture (non-blocking: if exclusive mic device denies second handle, SR continues unaffected)
    if (isMediaRecorderSupported()) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (sessionId !== convRecSessionId || convState !== "RECORDING") {
                stream.getTracks().forEach(t => t.stop());
                return;
            }
            convRecMediaStream = stream;
            const mr = new MediaRecorder(stream);
            convRecMediaRecorder = mr;
            mr.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) convRecAudioChunks.push(e.data);
            };
            mr.start(1000);
        } catch (err) {
            if (err && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
                convRecStoppingAction = "cancel";
                _cleanupConvRecordingHandles(true);
                setConvState("ERROR", {
                    title: "Chưa được cấp quyền Micro",
                    detail: "Bạn đã từ chối hoặc trình duyệt đang chặn quyền Microphone. Hãy cấp quyền Micro trong cài đặt trình duyệt rồi bấm Thử nói lại."
                });
            }
            // Otherwise ignore non-fatal MediaRecorder errors while SpeechRecognition is running
        }
    }
}

async function confirmSendManualRecording() {
    // Strict anti-double-send guard
    if (convState !== "RECORDING" || convSendLock || convRecStoppingAction === "send") {
        return;
    }
    convSendLock = true;
    convRecStoppingAction = "send";

    const sendBtn = document.getElementById("conv-send-btn");
    const cancelBtn = document.getElementById("conv-cancel-btn");
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = `<span class="text-sm font-black flex items-center gap-2"><span class="animate-spin inline-block">⏳</span><span>Đang hoàn tất bản ghi...</span></span>`;
    }
    if (cancelBtn) cancelBtn.disabled = true;

    if (convRecRestartTimer) {
        clearTimeout(convRecRestartTimer);
        convRecRestartTimer = null;
    }
    if (convRecDurationTimer) {
        clearInterval(convRecDurationTimer);
        convRecDurationTimer = null;
    }

    // Flush final words cleanly via rec.stop() with bounded 450ms wait
    if (convRecInstance) {
        await new Promise((resolve) => {
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                convSendFlushResolver = null;
                resolve();
            };
            convSendFlushResolver = finish;
            setTimeout(finish, 450);
            try { convRecInstance.stop(); } catch (e) { finish(); }
        });
    }

    _commitActiveSegmentBuffers();
    const finalTranscript = _getCurrentRecordedTranscript();
    const durationSec = Math.max(1, Math.round((Date.now() - convRecStartMs) / 1000));
    const avgConfidence = convConfidenceCount > 0 ? (convConfidenceSum / convConfidenceCount) : 0.85;

    // Release mic & recorder cleanly
    _cleanupConvRecordingHandles(true);
    convRecStoppingAction = null;
    convSendLock = false;

    if (!finalTranscript) {
        showToast("Chưa ghi nhận được nội dung nói nào. Hãy bấm Bấm để nói và thử lại.", "warning");
        setConvState("READY");
        return;
    }

    await processUserConversationUtterance(finalTranscript, avgConfidence, durationSec);
}

function cancelManualConversationRecording() {
    if (convState !== "RECORDING") return;
    convRecStoppingAction = "cancel";
    convRecSessionId++;
    _cleanupConvRecordingHandles(true);
    convCommittedChunks = [];
    convSegmentFinal = "";
    convSegmentInterim = "";
    convRecAudioChunks = [];
    convRecStoppingAction = null;
    convSendLock = false;
    setConvState("READY");
    showToast("Đã hủy lượt ghi âm hiện tại.", "warning");
}

function interruptAiVoiceToSpeak() {
    stopSpeech();
    if (convState === "AI_SPEAKING") {
        setConvState("READY");
    }
}

function _playAiVoiceResponse(replyText) {
    if (!replyText || !String(replyText).trim()) {
        setConvState("READY");
        return;
    }
    setConvState("AI_SPEAKING");
    const started = speakText(replyText, null, () => {
        if (convState === "AI_SPEAKING") {
            setConvState("READY");
        }
    });
    if (!started) {
        setConvState("READY");
    }
}

async function submitConversationTextTurn() {
    if (convState === "PROCESSING") return;
    if (convState === "RECORDING") {
        cancelManualConversationRecording();
    }
    if (convState === "AI_SPEAKING") {
        stopSpeech();
    }
    const inp = document.getElementById("conv-text-fallback");
    const txt = String(inp?.value || "").trim();
    if (!txt) return;
    inp.value = "";
    await processUserConversationUtterance(txt, 0.92, Math.max(3, Math.round(txt.split(/\s+/).length / 2.2)));
}

function containsPleaseDoCommand(text) {
    const norm = normalizeWords(text);
    return norm === "please do" || /\bplease do\s*$/.test(norm);
}

async function retryPendingConversationTurn() {
    if (!convPendingRetryTurn || !convPendingRetryTurn.text) {
        setConvState("READY");
        return;
    }
    const saved = { ...convPendingRetryTurn };
    convPendingRetryTurn = null;
    await _sendTurnToAiAndRespond(saved.text, saved.confidence, saved.durationSec, true);
}

function movePendingTurnToFallbackInput() {
    const inp = document.getElementById("conv-text-fallback");
    if (inp && convPendingRetryTurn?.text) {
        inp.value = convPendingRetryTurn.text;
        inp.focus();
    }
    convPendingRetryTurn = null;
    setConvState("READY");
}

async function processUserConversationUtterance(rawText, confidence = 0.85, durationSec = 4) {
    const trimmed = String(rawText || "").trim();
    if (!trimmed) {
        setConvState("READY");
        return;
    }

    // Check if learner ended with or said "Please do"
    if (containsPleaseDoCommand(trimmed)) {
        const contentBeforeCmd = trimmed.replace(/\bplease\s+do[.!?]*\s*$/i, "").trim();
        if (contentBeforeCmd) {
            appendConversationBubble("user", contentBeforeCmd + " [Please do]");
            speakingTurns[speakingTurns.length - 1].text = contentBeforeCmd;
            speakingTurns[speakingTurns.length - 1].confidence = confidence;
            speakingTurns[speakingTurns.length - 1].durationSec = durationSec;
        }
        triggerPleaseDoEvaluation();
        return;
    }

    appendConversationBubble("user", trimmed);
    speakingTurns[speakingTurns.length - 1].confidence = confidence;
    speakingTurns[speakingTurns.length - 1].durationSec = durationSec;

    await _sendTurnToAiAndRespond(trimmed, confidence, durationSec, false);
}

async function _sendTurnToAiAndRespond(trimmedText, confidence, durationSec, isRetry) {
    setConvState("PROCESSING");

    // If user retried after a failed send, don't duplicate their user bubble if already last in speakingTurns
    if (isRetry) {
        const last = speakingTurns[speakingTurns.length - 1];
        if (!last || last.role !== "user" || last.text !== trimmedText) {
            appendConversationBubble("user", trimmedText);
            speakingTurns[speakingTurns.length - 1].confidence = confidence;
            speakingTurns[speakingTurns.length - 1].durationSec = durationSec;
        }
    }

    const cfg = activeConversationConfig;

    // Reply via real Backend AI if connected
    if (AIClient.status.connected && appSettings?.aiConsentAccepted) {
        if (!navigator.onLine) {
            convPendingRetryTurn = { text: trimmedText, confidence, durationSec };
            setConvState("ERROR", {
                title: "Không có kết nối Internet",
                detail: "Thiết bị đang ngoại tuyến nên chưa gửi được câu trả lời tới AI. Nội dung của bạn đã được giữ nguyên — hãy kết nối lại mạng rồi bấm Thử gửi lại."
            });
            return;
        }

        const res = await AIClient.request("speaking-chat", {
            mode: cfg.mode || "random",
            topic: cfg.topic || currentStarterObj?.topic || "General English",
            level: cfg.level || _getDefaultCefrLevel(),
            difficulty: cfg.difficulty || "medium",
            style: cfg.style || "Casual Conversation",
            language: cfg.language || "English",
            history: speakingTurns.slice(-16).map(t => ({ role: t.role, text: t.text }))
        });

        if (res.ok && res.data && res.data.reply) {
            convPendingRetryTurn = null;
            appendConversationBubble("interviewer", res.data.reply);
            _playAiVoiceResponse(res.data.reply);
            return;
        }

        // Preserve user turn on API error so ZERO data is lost
        convPendingRetryTurn = { text: trimmedText, confidence, durationSec };
        setConvState("ERROR", {
            title: "Lỗi phản hồi từ AI Backend",
            detail: res.error || "Không nhận được phản hồi từ máy chủ AI. Câu nói của bạn đã được bảo toàn — bấm Thử gửi lại để tiếp tục cuộc hội thoại."
        });
        return;
    }

    // Honest Guided Prompt progression when AI Backend is offline
    const followUps = currentStarterObj?.followUps || [];
    let nextPrompt = "";
    if (guidedFollowUpIdx < followUps.length) {
        nextPrompt = followUps[guidedFollowUpIdx++];
    } else {
        const topicLabel = cfg.topic ? ` about ${cfg.topic}` : "";
        nextPrompt = `Thank you for sharing your ideas${topicLabel}! Would you like to add one more detail, or press "Kết thúc & Đánh giá" so we can review your full speaking session?`;
    }
    convPendingRetryTurn = null;
    appendConversationBubble("interviewer", nextPrompt);
    _playAiVoiceResponse(nextPrompt);
}

/* ==================== MODE 3: TOPIC SPEAKING & CUE CARD (PRESERVED) ==================== */
function openTopicSpeakingWorkspace(topicId, customTopic = null) {
    const allTopics = getAllContentForSkill("speaking");
    const targetId = String(topicId || "");
    if (customTopic) window.lastCustomSpeakingTopic = customTopic;
    const t = customTopic || allTopics.find(x => x.id === topicId) ||
        (targetId.startsWith("custom-s-") ? window.lastCustomSpeakingTopic : null);
    if (!t) return;
    activeSpeakingMode = "topic";
    activeSpeakingTopic = t;
    speakingTurns = [];
    lastRecordedAudioUrl = null;

    document.getElementById("speaking-mode-cards")?.classList.add("hidden");
    document.getElementById("speaking-topics-list")?.classList.add("hidden");
    if (typeof LearningHub !== "undefined") LearningHub.setSkillOuterPanelsVisible("speaking", false);
    document.getElementById("speaking-session")?.classList.remove("hidden");

    const container = document.getElementById("speaking-content");
    container.innerHTML = `
        <div class="grid lg:grid-cols-2 gap-6">
            <!-- Left: Topic Cue Card & Suggested Questions -->
            <div class="space-y-4">
                <div class="flex items-center gap-2">
                    ${renderLevelBadge(t.level)}
                    <span class="text-xs font-bold text-cyan-400">🎯 Topic Speaking (~${t.duration || 90}s)</span>
                </div>
                <h3 class="text-2xl font-black text-white">${escHtml(t.title)}</h3>
                <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1.5">
                    <p class="text-sm font-semibold text-white">${escHtml(t.prompt)}</p>
                    <p class="text-xs text-slate-400">🇻🇳 ${escHtml(t.promptVi || "")}</p>
                </div>

                <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                    <p class="text-xs font-extrabold uppercase text-violet-300">❓ Câu hỏi gợi ý triển khai ý:</p>
                    <ul class="list-disc pl-5 text-xs text-slate-200 space-y-1.5">
                        ${(t.suggestedQuestions || []).map((q, idx) => `
                            <li>
                                <span class="font-semibold">${escHtml(q)}</span>
                                ${(t.suggestedQuestionsVi && t.suggestedQuestionsVi[idx]) ? `<span class="block text-slate-400 text-[11px]">→ ${escHtml(t.suggestedQuestionsVi[idx])}</span>` : ""}
                            </li>
                        `).join("")}
                    </ul>
                </div>

                <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                    <p class="text-xs font-extrabold uppercase text-amber-300">💬 Cụm từ hữu ích nên dùng:</p>
                    <div class="flex flex-wrap gap-1.5">
                        ${(t.usefulPhrases || []).map(p => `<button type="button" onclick='speakText(${JSON.stringify(p)})' class="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-[11px] text-amber-200 hover:border-amber-400/40">🔊 ${escHtml(p)}</button>`).join("")}
                    </div>
                    ${(t.suggestedVocab && t.suggestedVocab.length) ? `
                        <div class="pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                            ${t.suggestedVocab.map(v => `<button type="button" onclick='speakText(${JSON.stringify(v)})' class="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-[11px] text-cyan-200">📖 ${escHtml(v)}</button>`).join("")}
                        </div>
                    ` : ""}
                </div>

                ${(t.dialogueLines && t.dialogueLines.length) ? `
                    <div class="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/25 space-y-2">
                        <p class="text-xs font-extrabold uppercase text-cyan-300">🎭 Hội thoại mẫu tham khảo:</p>
                        <div class="space-y-1.5 text-xs">
                            ${t.dialogueLines.map(dl => `
                                <div class="p-2 rounded-xl bg-slate-900/80 border border-white/5 flex items-start justify-between gap-2">
                                    <p class="text-slate-200"><strong class="text-emerald-300">${escHtml(dl.speaker || "Speaker")}:</strong> ${escHtml(dl.text || "")}</p>
                                    <button type="button" onclick='speakText(${JSON.stringify(dl.text || "")})' class="text-cyan-300 shrink-0">🔊</button>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
            </div>

            <!-- Right: Recording Studio & Live Transcript -->
            <div class="p-6 rounded-3xl bg-slate-950/90 border border-violet-500/30 flex flex-col justify-between space-y-5">
                <div class="text-center space-y-2">
                    <p class="text-xs font-extrabold uppercase tracking-wider text-cyan-400">Phòng thu luyện nói cá nhân</p>
                    <p class="text-[11px] text-slate-400">🔒 File âm thanh của bạn chỉ lưu cục bộ trên trình duyệt để tự nghe lại, tuyệt đối không tự động tải lên dịch vụ bên ngoài.</p>
                </div>

                <div class="flex flex-col items-center space-y-4 py-2">
                    <button id="topic-rec-btn" type="button" onclick="toggleTopicRecording()" class="w-28 h-28 rounded-full bg-gradient-to-tr from-rose-600 via-violet-600 to-indigo-600 text-white font-black shadow-2xl shadow-violet-600/40 hover:scale-105 active:scale-95 transition flex flex-col items-center justify-center">
                        <span class="text-2xl">⏺</span>
                        <span id="topic-rec-label" class="text-xs mt-1">RECORD</span>
                    </button>
                    <div id="topic-waveform" class="hidden flex items-center justify-center gap-1.5 h-8">
                        <span class="wave-bar" style="animation-delay:0s"></span>
                        <span class="wave-bar" style="animation-delay:0.2s"></span>
                        <span class="wave-bar" style="animation-delay:0.4s"></span>
                        <span class="wave-bar" style="animation-delay:0.1s"></span>
                        <span class="wave-bar" style="animation-delay:0.3s"></span>
                    </div>
                    <p id="topic-rec-status" class="text-xs text-slate-300 text-center">Bấm <strong>RECORD</strong> để bắt đầu nói. Khi hoàn thành, hãy nói <strong class="text-amber-300">"Please do"</strong> (hoặc bấm nút Dừng &amp; Đánh giá).</p>
                    <audio id="topic-playback-audio" controls class="hidden w-full"></audio>
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-300 flex justify-between">
                        <span>Transcript nội dung bài nói (Tự động nhận diện hoặc nhập bổ sung):</span>
                        <span id="topic-word-counter" class="text-cyan-400">0 từ</span>
                    </label>
                    <textarea id="topic-transcript-box" rows="5" oninput="document.getElementById('topic-word-counter').textContent = countWordsInEssay(this.value) + ' từ'" placeholder="Nội dung giọng nói của bạn sẽ hiện trực tiếp tại đây..." class="w-full bg-slate-900 border border-white/10 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-violet-500"></textarea>
                    <button type="button" onclick="finishTopicSpeakingAndEvaluate()" class="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-lg">
                        ⏹ "Please do" — Dừng thu âm &amp; Đánh giá bài nói
                    </button>
                </div>
            </div>
        </div>

        <div id="speaking-eval-output" class="hidden mt-6"></div>
        <div id="speaking-qsets-bar" class="mt-6"></div>
        <div id="speaking-extra-qset-runner" class="hidden mt-4"></div>
    `;
    if (typeof LearningHub !== "undefined") {
        LearningHub.renderQuestionSetsBar("speaking", t.id, t.questions || [], "speaking-qsets-bar", {
            lessonTitle: t.title,
            lessonLevel: t.level || "B1",
            lessonContent: { title: t.title, prompt: t.prompt, suggestedQuestions: t.suggestedQuestions, usefulPhrases: t.usefulPhrases },
            onSelect: (setObj) => renderSpeakingExtraQuestionSet(setObj)
        });
        renderSpeakingExtraQuestionSet(LearningHub.getActiveQuestionSet("speaking", t.id, t.questions || []));
    }
}

function renderSpeakingExtraQuestionSet(setObj) {
    const runner = document.getElementById("speaking-extra-qset-runner");
    if (!runner || !activeSpeakingTopic || typeof LearningHub === "undefined") return;
    const qs = setObj?.questions || [];
    if (!qs.length) {
        runner.classList.add("hidden");
        runner.innerHTML = "";
        return;
    }
    const draft = LearningHub.getSetDraft("speaking", activeSpeakingTopic.id, setObj.id);
    runner.classList.remove("hidden");
    runner.innerHTML = `
        <div class="glass-panel rounded-3xl p-5 sm:p-6 border border-emerald-500/35 space-y-4 text-xs">
            <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
                <div>
                    <span class="text-[10px] font-extrabold uppercase text-emerald-300">🎙️ Câu hỏi luyện phản xạ nói • ${escHtml(setObj.label)}</span>
                    <h4 class="text-base font-black text-white mt-0.5">${escHtml(setObj.title || setObj.label)} (${qs.length} câu)</h4>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 font-bold">CEFR ${escHtml(setObj.cefrLevel || activeSpeakingTopic.level || "B1")}</span>
            </div>
            <div class="space-y-3">
                ${qs.map((q, qi) => LearningHub.renderGenericQuestionCard("speaking", activeSpeakingTopic.id, setObj.id, q, qi, qs.length, draft[q.id])).join("")}
            </div>
            <button type="button" onclick="LearningHub.submitStandaloneSet('speaking', ${JSON.stringify(String(activeSpeakingTopic.id))}, ${JSON.stringify(activeSpeakingTopic.title)}, ${JSON.stringify(activeSpeakingTopic.level || "B1")}, ${JSON.stringify(setObj.id)}, activeSpeakingTopic.questions || [])" class="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold shadow-lg">
                ✅ Nộp ${escHtml(setObj.label)} &amp; Lưu Lịch Sử
            </button>
            <div id="lh-set-result-speaking-${escHtml(activeSpeakingTopic.id)}" class="hidden"></div>
        </div>
    `;
}

async function toggleTopicRecording() {
    if (activeContinuousRec || (activeMediaRecorder && activeMediaRecorder.state === "recording")) {
        finishTopicSpeakingAndEvaluate();
        return;
    }

    speakingStartTimeMs = Date.now();
    const btnLbl = document.getElementById("topic-rec-label");
    const statusEl = document.getElementById("topic-rec-status");
    const waveEl = document.getElementById("topic-waveform");
    const transcriptArea = document.getElementById("topic-transcript-box");

    waveEl?.classList.remove("hidden");
    if (btnLbl) btnLbl.textContent = "DỪNG";
    if (statusEl) statusEl.innerHTML = `<span class="text-emerald-300 font-bold animate-pulse">🎙 Đang thu âm... Hãy nói tự nhiên, kết thúc bằng câu lệnh "Please do"!</span>`;

    if (isMediaRecorderSupported()) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            activeMediaRecorder = new MediaRecorder(stream);
            activeAudioChunks = [];
            activeMediaRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) activeAudioChunks.push(e.data); };
            activeMediaRecorder.onstop = () => {
                stream.getTracks().forEach(t => t.stop());
                if (activeAudioChunks.length > 0) {
                    lastRecordedAudioUrl = URL.createObjectURL(new Blob(activeAudioChunks, { type: activeMediaRecorder.mimeType || "audio/webm" }));
                    const aud = document.getElementById("topic-playback-audio");
                    if (aud) {
                        aud.src = lastRecordedAudioUrl;
                        aud.playbackRate = typeof normalizeSpeechRate === "function" ? normalizeSpeechRate(speechRate) : 1;
                        aud.classList.remove("hidden");
                    }
                }
            };
            activeMediaRecorder.start();
        } catch (err) {
            showToast("Không mở được MediaRecorder micro: " + err.message, "warning");
        }
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
        const rec = new SR();
        activeContinuousRec = rec;
        rec.lang = "en-US";
        rec.continuous = true;
        rec.interimResults = true;
        let finalTranscript = transcriptArea?.value ? transcriptArea.value.trim() + " " : "";
        const lowConfWords = [];

        rec.onresult = (ev) => {
            let interim = "";
            for (let i = ev.resultIndex; i < ev.results.length; i++) {
                const res = ev.results[i];
                const chunk = res[0].transcript;
                if (res.isFinal) {
                    finalTranscript += chunk.trim() + ". ";
                    if (res[0].confidence > 0 && res[0].confidence < 0.72) {
                        lowConfWords.push(chunk.trim());
                    }
                    if (containsPleaseDoCommand(chunk)) {
                        finalTranscript = finalTranscript.replace(/\bplease\s+do[.!?]*\s*$/i, "").trim();
                        if (transcriptArea) transcriptArea.value = finalTranscript;
                        finishTopicSpeakingAndEvaluate(lowConfWords);
                        return;
                    }
                } else {
                    interim += chunk;
                }
            }
            if (transcriptArea) {
                transcriptArea.value = (finalTranscript + interim).trim();
                document.getElementById("topic-word-counter").textContent = countWordsInEssay(transcriptArea.value) + " từ";
            }
        };
        rec.onerror = () => {};
        try { rec.start(); } catch (e) {}
    } else if (statusEl) {
        statusEl.textContent = "Trình duyệt không hỗ trợ tự chép lời (SpeechRecognition). Bạn vẫn đang thu âm tiếng thật và có thể gõ tóm tắt ý vào khung dưới để chấm ngữ pháp.";
    }
}

function stopActiveSpeakingCapture() {
    // Stop Conversation Manual Recorder cleanly
    convRecStoppingAction = "cancel";
    convRecSessionId++;
    _cleanupConvRecordingHandles(true);
    convRecStoppingAction = null;
    convSendLock = false;

    // Stop Topic Speaking Recorder cleanly
    if (activeContinuousRec) {
        try { activeContinuousRec.stop(); } catch (e) {}
        activeContinuousRec = null;
    }
    if (activeMediaRecorder && activeMediaRecorder.state === "recording") {
        try { activeMediaRecorder.stop(); } catch (e) {}
    }
    document.getElementById("topic-waveform")?.classList.add("hidden");
    document.getElementById("conv-waveform")?.classList.add("hidden");
    const btnLbl = document.getElementById("topic-rec-label");
    if (btnLbl) btnLbl.textContent = "RECORD";
}

function finishTopicSpeakingAndEvaluate(unclearWords = []) {
    stopActiveSpeakingCapture();
    const raw = (document.getElementById("topic-transcript-box")?.value || "").replace(/\bplease\s+do[.!?]*\s*$/i, "").trim();
    const elapsedSec = speakingStartTimeMs > 0 ? Math.max(5, Math.round((Date.now() - speakingStartTimeMs) / 1000)) : 30;
    speakingTurns = raw ? [{ role: "user", text: raw, confidence: 0.84, durationSec: elapsedSec, unclearWords }] : [];
    evaluateSpeakingSession(activeSpeakingTopic ? activeSpeakingTopic.title : "Topic Speaking", activeSpeakingTopic?.sampleAnswer || "");
}

function triggerPleaseDoEvaluation() {
    // If user clicked End & Evaluate while recording, preserve whatever they spoke so far!
    if (convState === "RECORDING") {
        _commitActiveSegmentBuffers();
        const partial = _getCurrentRecordedTranscript().replace(/\bplease\s+do[.!?]*\s*$/i, "").trim();
        if (partial) {
            appendConversationBubble("user", partial);
            speakingTurns[speakingTurns.length - 1].confidence = convConfidenceCount > 0 ? (convConfidenceSum / convConfidenceCount) : 0.85;
            speakingTurns[speakingTurns.length - 1].durationSec = Math.max(2, convRecElapsedSec);
        }
    }
    stopActiveSpeakingCapture();
    stopSpeech();
    if (activeSpeakingMode === "random-conversation" || activeSpeakingMode === "custom-conversation") {
        setConvState("READY");
    }
    const title = activeConversationConfig?.topic || currentStarterObj?.topic || "Live English Conversation";
    evaluateSpeakingSession(title, "");
}

/* ==================== COMPREHENSIVE FULL-SESSION SPEAKING EVALUATION (PHẦN 4) ==================== */
async function evaluateSpeakingSession(sessionTitle, sampleAnswer = "") {
    const userTurns = speakingTurns.filter(t => t.role === "user" && t.text.trim() !== "");
    const evalBox = document.getElementById("speaking-eval-output");
    if (!evalBox) return;

    if (userTurns.length === 0) {
        showToast("Chưa có nội dung nói nào để đánh giá! Hãy nói ít nhất 1 câu rồi bấm GỬI.", "warning");
        return;
    }

    const isConv = activeSpeakingMode === "random-conversation" || activeSpeakingMode === "custom-conversation";
    const evalMode = isConv ? (activeConversationConfig.mode || "random") : "topic";
    const evalLevel = isConv
        ? (activeConversationConfig.level || _getDefaultCefrLevel())
        : (activeSpeakingTopic?.level || _getDefaultCefrLevel());
    const evalStyle = isConv ? (activeConversationConfig.style || "Casual Conversation") : "Topic Monologue";
    const evalDifficulty = isConv ? (activeConversationConfig.difficulty || "medium") : "medium";

    const fullTranscript = userTurns.map(t => t.text.trim()).join(" ");
    const totalWords = countWordsInEssay(fullTranscript);
    const totalSec = userTurns.reduce((a, t) => a + (t.durationSec || 5), 0);
    const wpm = Math.round((totalWords / Math.max(totalSec, 1)) * 60);

    evalBox.classList.remove("hidden");
    evalBox.innerHTML = `<div class="p-5 rounded-2xl bg-slate-950 border border-violet-500/30 text-center text-xs text-violet-300 font-bold animate-pulse">🎙️ Đang đánh giá toàn bộ buổi hội thoại (${userTurns.length} lượt nói • Chủ đề: ${escHtml(sessionTitle)} • CEFR ${escHtml(evalLevel)})...</div>`;
    evalBox.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Try Backend AI first if connected — sends ALL turns + full conversation log
    let aiResult = null;
    if (AIClient.status.connected && appSettings?.aiConsentAccepted) {
        const res = await AIClient.request("speaking-eval", {
            mode: evalMode,
            topic: sessionTitle,
            level: evalLevel,
            difficulty: evalDifficulty,
            style: evalStyle,
            transcript: fullTranscript,
            conversationLog: speakingTurns.slice(-24).map(t => ({ role: t.role, text: t.text })),
            turnCount: userTurns.length,
            wpm
        });
        if (res.ok && res.data) aiResult = res.data;
    }

    // Local sentence-by-sentence grammar & natural expression analysis across ALL user turns
    const sentences = (fullTranscript.match(/[^.!?]+[.!?]*/g) || [fullTranscript]).map(s => s.trim()).filter(Boolean);
    const sentenceErrors = [];
    sentences.forEach(s => {
        const d = analyzeEnglishTextLocal(s);
        if (!d.isValid) {
            d.issues.forEach(iss => {
                if (iss.errorType === "Dấu câu" || iss.errorType === "Viết hoa") return;
                sentenceErrors.push({
                    wrongSentence: s,
                    where: iss.original,
                    why: iss.explanationVi,
                    fixedSentence: d.correctedText,
                    naturalWay: d.naturalTips[0] || `Nói gọn & tự nhiên hơn: "${d.correctedText}"`
                });
                autoLogMistake({
                    errorCategory: "Sai ngữ pháp",
                    wrongText: s,
                    correctText: d.correctedText,
                    explanation: `[Speaking] ${iss.explanationVi}`,
                    skill: "speaking"
                });
            });
        }
    });

    const avgConf = Math.round((userTurns.reduce((a, t) => a + (t.confidence || 0.82), 0) / userTurns.length) * 100);
    const fluencyScore = wpm >= 95 && wpm <= 155 ? 88 : wpm >= 65 ? 74 : 58;
    const grammarScore = Math.max(45, 92 - sentenceErrors.length * 10);
    const uniqueWordsRatio = new Set(normalizeWords(fullTranscript).split(" ").filter(Boolean)).size / Math.max(totalWords, 1);
    const vocabScore = Math.min(94, Math.round(55 + uniqueWordsRatio * 40 + (totalWords >= 40 ? 8 : 0)));
    const coherenceScore = totalWords >= 35 ? 80 : 62;
    const overallScore = aiResult?.overallScore || Math.round((avgConf + fluencyScore + grammarScore + vocabScore + coherenceScore) / 5);

    const finalErrors = Array.isArray(aiResult?.errors) ? aiResult.errors : sentenceErrors;
    const unclearWords = userTurns.flatMap(t => t.unclearWords || []);
    const practiceRecs = Array.isArray(aiResult?.practiceRecommendationsVi) && aiResult.practiceRecommendationsVi.length
        ? aiResult.practiceRecommendationsVi
        : [
            `Luyện mở rộng câu trả lời về chủ đề "${sessionTitle}" theo công thức Ý chính → Lý do → Ví dụ thực tế (chuẩn CEFR ${evalLevel}).`,
            "Luyện nối câu bằng các từ chuyển ý tự nhiên như 'For instance...', 'In addition...', 'From my perspective...'.",
            "Nghe lại các câu sửa chuẩn ở tốc độ 0.75x rồi shadowing lại ở tốc độ 1.0x để tăng phản xạ và độ trôi chảy."
        ];

    const modeBadgeText = evalMode === "custom"
        ? `🎯 Custom Topic • CEFR ${evalLevel} • ${evalStyle}`
        : (evalMode === "random" ? `🌐 Random Conversation • CEFR ${evalLevel}` : `📋 Topic Speaking • CEFR ${evalLevel}`);

    evalBox.innerHTML = `
        <div class="glass-panel rounded-3xl p-5 sm:p-8 space-y-6 border border-violet-500/35 text-xs">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                    <span class="text-amber-300 font-extrabold uppercase tracking-wider">📊 Báo cáo Đánh giá Toàn bộ Buổi Nói (${userTurns.length} lượt)</span>
                    <h4 class="text-xl font-black text-white mt-0.5">${escHtml(sessionTitle)}</h4>
                    <span class="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[11px] font-bold text-cyan-200">${escHtml(modeBadgeText)}</span>
                </div>
                <div class="flex items-center flex-wrap gap-2.5">
                    <span class="px-4 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 font-black text-base text-emerald-300">Điểm tổng hợp: ${overallScore}/100</span>
                    ${renderSourceBadge(aiResult ? "ai-generated" : "local-browser")}
                </div>
            </div>

            <!-- 5 Core Criteria -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div class="p-3 rounded-2xl bg-slate-950 border border-white/10 text-center">
                    <p class="text-slate-400 font-bold">Pronunciation*</p>
                    <p class="text-lg font-black text-cyan-300 mt-1">${aiResult?.pronunciationScore || avgConf}%</p>
                    <p class="text-[10px] text-slate-500">Độ rõ nhận diện từ</p>
                </div>
                <div class="p-3 rounded-2xl bg-slate-950 border border-white/10 text-center">
                    <p class="text-slate-400 font-bold">Fluency</p>
                    <p class="text-lg font-black text-violet-300 mt-1">${aiResult?.fluencyScore || fluencyScore}%</p>
                    <p class="text-[10px] text-slate-500">~${wpm} từ/phút</p>
                </div>
                <div class="p-3 rounded-2xl bg-slate-950 border border-white/10 text-center">
                    <p class="text-slate-400 font-bold">Grammar</p>
                    <p class="text-lg font-black text-emerald-300 mt-1">${aiResult?.grammarScore || grammarScore}%</p>
                    <p class="text-[10px] text-slate-500">${finalErrors.length} lỗi phát hiện</p>
                </div>
                <div class="p-3 rounded-2xl bg-slate-950 border border-white/10 text-center">
                    <p class="text-slate-400 font-bold">Vocabulary</p>
                    <p class="text-lg font-black text-amber-300 mt-1">${aiResult?.vocabularyScore || vocabScore}%</p>
                    <p class="text-[10px] text-slate-500">${totalWords} từ đã nói</p>
                </div>
                <div class="p-3 rounded-2xl bg-slate-950 border border-white/10 text-center col-span-2 md:col-span-1">
                    <p class="text-slate-400 font-bold">Coherence</p>
                    <p class="text-lg font-black text-indigo-300 mt-1">${aiResult?.coherenceScore || coherenceScore}%</p>
                    <p class="text-[10px] text-slate-500">Mạch lạc &amp; liên kết</p>
                </div>
            </div>

            <p class="text-[11px] text-amber-300/90 italic">*Lưu ý minh bạch: ${escHtml(aiResult?.transcriptHonestyNote || "Tiêu chí Pronunciation dựa trên độ rõ văn bản Speech-to-Text (SpeechRecognition), không phân tích sóng âm IPA chuyên sâu.")}</p>

            <!-- Topic & CEFR Alignment + Fluency Feedback -->
            ${(aiResult?.topicRelevanceFeedbackVi || aiResult?.fluencyFeedbackVi) ? `
                <div class="grid md:grid-cols-2 gap-3">
                    ${aiResult?.topicRelevanceFeedbackVi ? `
                        <div class="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 space-y-1">
                            <span class="font-extrabold uppercase text-cyan-300">🎯 Đánh giá bám sát chủ đề &amp; trình độ CEFR ${escHtml(evalLevel)}:</span>
                            <p class="text-slate-200 leading-relaxed">${escHtml(aiResult.topicRelevanceFeedbackVi)}</p>
                        </div>
                    ` : ""}
                    ${aiResult?.fluencyFeedbackVi ? `
                        <div class="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/25 space-y-1">
                            <span class="font-extrabold uppercase text-violet-300">⚡ Đánh giá độ trôi chảy &amp; diễn đạt:</span>
                            <p class="text-slate-200 leading-relaxed">${escHtml(aiResult.fluencyFeedbackVi)}</p>
                        </div>
                    ` : ""}
                </div>
            ` : ""}

            <!-- Full Transcript across ALL turns -->
            <div class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2">
                <span class="font-extrabold uppercase text-cyan-300">🗣️ Toàn bộ Transcript bạn đã nói (${userTurns.length} lượt):</span>
                <p class="text-sm text-slate-100 leading-relaxed">"${escHtml(fullTranscript)}"</p>
                ${unclearWords.length ? `<p class="text-amber-300">⚠️ Cụm từ máy nghe chưa rõ (cần phát âm chậm và rõ âm cuối hơn): <strong>${escHtml(unclearWords.join("; "))}</strong></p>` : ""}
            </div>

            <!-- Sentence-by-sentence Correction & Natural Expression -->
            <div class="space-y-2.5">
                <h5 class="font-extrabold uppercase text-rose-300">🔍 Phân tích lỗi sai cụ thể, cách sửa &amp; diễn đạt tự nhiên hơn:</h5>
                ${finalErrors.length > 0 ? finalErrors.map((err) => `
                    <div class="p-4 rounded-2xl bg-slate-950 border border-rose-500/25 space-y-1.5">
                        <p class="text-rose-300"><strong>Câu chưa chuẩn:</strong> "${escHtml(err.wrongSentence)}" ${err.where ? `(Lỗi tại: <code>${escHtml(err.where)}</code>)` : ""}</p>
                        <p class="text-slate-300"><strong>Vì sao sai:</strong> ${escHtml(err.why)}</p>
                        <p class="text-emerald-300 font-bold"><strong>Cách sửa chuẩn:</strong> "${escHtml(err.fixedSentence)}"</p>
                        <p class="text-cyan-300"><strong>Cách diễn đạt tự nhiên hơn:</strong> ${escHtml(err.naturalWay || err.fixedSentence)}</p>
                        <div class="pt-1 flex gap-2">
                            <button type="button" onclick='speakText(${JSON.stringify(err.fixedSentence)})' class="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold">🔊 Nghe câu chuẩn</button>
                            ${err.naturalWay && err.naturalWay !== err.fixedSentence ? `<button type="button" onclick='speakText(${JSON.stringify(err.naturalWay)})' class="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 font-bold">🔊 Nghe câu tự nhiên</button>` : ""}
                        </div>
                    </div>
                `).join("") : `
                    <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-semibold">
                        ✅ Không phát hiện lỗi ngữ pháp cơ bản trong transcript! Để nâng cấp bài nói lên cấp độ cao hơn, hãy sử dụng thêm các cụm chuyển ý như <em>"From my perspective...", "For instance...", "What stands out to me is..."</em>.
                    </div>
                `}
            </div>

            <!-- Model Answer -->
            ${(aiResult?.modelAnswer || aiResult?.sampleAnswer || sampleAnswer) ? `
                <div class="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                    <div class="flex items-center justify-between flex-wrap gap-2">
                        <span class="font-extrabold uppercase text-indigo-300">🌟 Câu trả lời tham khảo tự nhiên hơn (Model Answer):</span>
                        <button type="button" onclick='speakText(${JSON.stringify(aiResult?.modelAnswer || aiResult?.sampleAnswer || sampleAnswer)})' class="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-white font-bold">🔊 Nghe bài mẫu</button>
                    </div>
                    <p class="text-slate-200 leading-relaxed">${escHtml(aiResult?.modelAnswer || aiResult?.sampleAnswer || sampleAnswer)}</p>
                    ${(aiResult?.upgradePhrases && aiResult.upgradePhrases.length) ? `<p class="text-cyan-300"><strong>Cụm từ tự nhiên nên dùng:</strong> ${aiResult.upgradePhrases.map(p => escHtml(p)).join(" • ")}</p>` : ""}
                </div>
            ` : ""}

            <!-- Practice Recommendations -->
            <div class="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/25 space-y-2">
                <h5 class="font-extrabold uppercase text-emerald-300">🧭 Đề xuất nội dung cần luyện thêm:</h5>
                <ul class="list-disc pl-5 text-slate-200 space-y-1.5 leading-relaxed">
                    ${practiceRecs.map(rec => `<li>${escHtml(rec)}</li>`).join("")}
                </ul>
            </div>
        </div>
    `;

    // Save to Speaking History & Speaking Notebook
    const spState = getSpeakingState();
    spState.history.unshift({
        id: "spk-" + Date.now(),
        title: sessionTitle,
        mode: evalMode,
        level: evalLevel,
        transcript: fullTranscript,
        overallScore,
        wpm,
        turnCount: userTurns.length,
        at: new Date().toISOString()
    });
    saveSpeakingState(spState);

    addStructuredNote({
        type: "speaking",
        title: `Speaking: ${sessionTitle} (${overallScore}/100)`,
        important: finalErrors.length > 0,
        source: aiResult ? "ai-generated" : "local-browser",
        fields: {
            topic: sessionTitle,
            transcript: fullTranscript,
            feedback: `Điểm tổng hợp: ${overallScore}/100 | CEFR ${evalLevel} | Tốc độ: ~${wpm} WPM | ${userTurns.length} lượt nói`,
            improvements: finalErrors.map(e => `${e.wrongSentence} -> ${e.fixedSentence}`).join("\n") || "Phát âm rõ âm cuối và mở rộng ý bằng ví dụ."
        },
        content: fullTranscript
    }, true);

    logStudyMetrics(
        {
            speakingSessions: 1,
            speakingMinutes: Math.max(1, Math.round((totalSec / 60) * 10) / 10),
            scoreEntry: { skill: "speaking", scorePct: overallScore, level: evalLevel, title: sessionTitle }
        },
        { type: "speaking", skill: "speaking", title: `Hoàn thành Speaking: ${sessionTitle}`, scorePct: overallScore }
    );
    if (typeof LearningHub !== "undefined") {
        LearningHub.recordAttempt({
            skill: "speaking",
            sourceScope: "standalone",
            lessonId: activeSpeakingTopic?.id || (evalMode === "custom" ? "custom-conv" : "random-conv"),
            lessonTitle: sessionTitle,
            questionSetId: "set-1",
            questionSetLabel: evalMode === "custom" ? "Custom Topic Conversation" : (evalMode === "random" ? "Random Conversation" : "Luyện nói gốc"),
            exerciseType: evalMode === "topic" ? "topic_speaking" : (evalMode === "custom" ? "custom_conversation" : "live_conversation"),
            cefrLevel: evalLevel,
            score10: Math.round((overallScore / 10) * 10) / 10,
            scorePct: overallScore,
            correctCount: 1,
            totalCount: 1,
            durationSec: totalSec,
            userText: fullTranscript,
            aiFeedback: aiResult || {
                overviewVi: `Điểm tổng hợp: ${overallScore}/100 (~${wpm} WPM), phát hiện ${finalErrors.length} lỗi cần chỉnh sửa.`,
                errors: finalErrors
            }
        });
    }
    showToast("Đã hoàn thành đánh giá toàn bộ buổi nói và lưu vào Speaking Notebook!");
}
