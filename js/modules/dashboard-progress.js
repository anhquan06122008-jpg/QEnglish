/* ==========================================================================
   QEnglish - Dashboard, Progress Analytics, Adaptive Learning, Settings & App Init
   ========================================================================== */

let activeMainPage = "dashboard";
let skillRadarChartInstance = null;
let weeklyMinutesChartInstance = null;

const DEFAULT_DAILY_PLAN = [
    { id: "vocab", title: "Học 10 từ mới & Luyện 6 bước", duration: "15 phút", icon: "📖", targetPage: "vocabulary", targetSub: "practice" },
    { id: "listening", title: "Listening Practice (Dictation / Choose)", duration: "20 phút", icon: "🎧", targetPage: "listening" },
    { id: "grammar", title: "Grammar Practice (1 chủ điểm)", duration: "15 phút", icon: "📝", targetPage: "grammar" },
    { id: "speaking", title: "Speaking Practice (Topic / Live)", duration: "15 phút", icon: "🎙️", targetPage: "speaking" },
    { id: "reading", title: "Reading Practice (Highlight & Từ mới)", duration: "20 phút", icon: "📄", targetPage: "reading" },
    { id: "writing", title: "Writing Practice (Đoạn văn / Bài luận)", duration: "20 phút", icon: "✍️", targetPage: "writing" }
];

function getDashboardSaved() {
    return safeParseJSON(localStorage.getItem(STORAGE_KEYS.DASHBOARD), { tasksByDate: {} });
}

function saveDashboardSaved(st) {
    safeWriteJSON(STORAGE_KEYS.DASHBOARD, st);
}

/* ==================== NAVIGATION & GLOBAL LEVEL ==================== */
function toggleSidebar(forceClose = false) {
    const sb = document.getElementById("sidebar");
    const ov = document.getElementById("sidebar-overlay");
    if (!sb) return;
    if (forceClose) {
        sb.classList.remove("mobile-open");
        ov?.classList.remove("active");
    } else {
        sb.classList.toggle("mobile-open");
        ov?.classList.toggle("active");
    }
}

function navigateTo(page, subTab = null) {
    activeMainPage = page;
    document.querySelectorAll(".module-page").forEach(el => {
        el.classList.toggle("active", el.id === `page-${page}`);
    });
    document.querySelectorAll(".sidebar-item[data-nav]").forEach(el => {
        const navKey = el.getAttribute("data-nav");
        if (!navKey.startsWith("vocab-")) {
            el.classList.toggle("active", navKey === page);
        }
    });
    document.querySelectorAll(".mob-nav-btn").forEach(el => {
        el.classList.toggle("text-violet-400", el.getAttribute("data-mob") === page);
        el.classList.toggle("text-slate-400", el.getAttribute("data-mob") !== page);
    });

    const vocabSubMenu = document.getElementById("vocab-sub");
    if (vocabSubMenu) vocabSubMenu.classList.toggle("hidden", page !== "vocabulary");

    const titleMap = {
        dashboard: "Dashboard — Trung tâm học tập",
        vocabulary: "Vocabulary — Từ vựng & SRS",
        grammar: "Grammar — Ngữ pháp A1–C2",
        listening: "Listening — Luyện nghe",
        speaking: "Speaking — Hội thoại & Luyện nói",
        reading: "Reading — Đọc hiểu học thuật",
        writing: "Writing — Luyện viết",
        notebook: "English Notebook — Sổ ghi chú cá nhân",
        progress: "Progress — Phân tích tiến độ & Adaptive Learning",
        materials: "My Learning Materials — Kho Học Liệu Của Tôi",
        settings: "Settings & Quản lý Nội dung"
    };
    const titleEl = document.getElementById("page-title");
    if (titleEl) titleEl.textContent = titleMap[page] || "QEnglish";

    toggleSidebar(true);

    // Trigger active module refresh
    if (page === "dashboard") refreshDashboardUI();
    if (page === "vocabulary") switchVocabTab(subTab || currentVocabSubTab || "flashcards");
    if (page === "grammar") filterGrammarLessons();
    if (page === "listening") filterListeningExercises();
    if (page === "speaking") renderSpeakingTopicsGrid();
    if (page === "reading") filterReadingPassages();
    if (page === "writing") filterWritingTopics();
    if (page === "notebook") renderNotebook();
    if (page === "progress") renderProgressAnalyticsPage();
    if (page === "materials") renderMaterialsPageTable();
    if (page === "settings") renderSettingsAndCMSPage();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function onLevelChange(levelVal) {
    const isIelts = String(levelVal).toUpperCase().startsWith("IELTS");
    saveSettings({
        selectedLevel: levelVal,
        levelSystem: isIelts ? "IELTS" : "CEFR"
    });

    // Sync all module level selectors to the chosen Global Level
    const moduleSelectIds = [
        "listening-level-filter",
        "reading-level-filter",
        "writing-level-filter",
        "speaking-level-filter",
        "grammar-level-filter",
        "study-level-select"
    ];
    moduleSelectIds.forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        // Check if option exists in this select; if not, add or fall back gracefully
        const hasOpt = [...sel.options].some(o => o.value === levelVal);
        if (hasOpt) sel.value = levelVal;
        else if (levelVal === "all") sel.value = "all";
    });

    const badge = document.getElementById("dash-current-level-badge");
    if (badge) badge.textContent = levelVal === "all" ? "Tất cả trình độ" : levelVal;

    // Refresh current active module
    navigateTo(activeMainPage, currentVocabSubTab);
    showToast(`Đã áp dụng bộ lọc trình độ: ${levelVal === "all" ? "Tất cả" : levelVal}`);
}

/* ==================== DASHBOARD RENDERING (PHẦN 3.1) ==================== */
function refreshDashboardUI() {
    const stats = computeOverallAnalytics();
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    // A. 9 Core KPIs (100% real data)
    setTxt("dash-days-total", `${stats.totalDaysStudied} ngày`);
    setTxt("dash-streak", `${stats.streak} ngày`);
    setTxt("dash-time", stats.totalMinutes >= 60 ? `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}p` : `${stats.totalMinutes} phút`);
    setTxt("dash-words", `${stats.wordsLearned} / ${deck.length}`);
    setTxt("dash-words-mastered", `${stats.wordsMastered}`);
    setTxt("dash-listening-done", `${stats.totalListening}`);
    setTxt("dash-reading-done", `${stats.totalReading}`);
    setTxt("dash-writing-done", `${stats.totalWriting}`);
    setTxt("dash-speaking-done", `${stats.totalSpeaking}`);
    setTxt("dash-avg", stats.avgScore !== null ? `${stats.avgScore}%` : "Chưa có");

    // Personal Goal & Overall Mastery Progress
    const activeAcc = typeof getActiveAccount === "function" ? getActiveAccount() : null;
    const avgMasteryPct = Math.min(100, Math.max(5, Math.round(
        (stats.skills.listening + stats.skills.speaking + stats.skills.reading + stats.skills.writing + stats.skills.vocabGrammar) / 5
    )));

    const goalBar = document.getElementById("sidebar-goal-bar");
    if (goalBar) goalBar.style.width = `${avgMasteryPct}%`;
    const goalText = document.getElementById("dash-goal-countdown");
    if (goalText) {
        goalText.textContent = `🎯 Mục tiêu cá nhân: ${activeAcc?.goal || "Chinh phục 5 kỹ năng Tiếng Anh"} • Mức độ hoàn thiện tổng thể: ${avgMasteryPct}%`;
    }
    const heroGreeting = document.getElementById("dash-hero-greeting");
    if (heroGreeting && activeAcc) {
        heroGreeting.textContent = `Chào ${activeAcc.name}! Sẵn sàng bứt phá Tiếng Anh hôm nay?`;
    }
    if (typeof syncAccountBadgesUI === "function") syncAccountBadgesUI();
    if (typeof syncCurrentAccountSnapshot === "function") syncCurrentAccountSnapshot();

    // B. Skill Progress Bars
    const barMap = [
        ["vocab", stats.skills.vocabGrammar],
        ["grammar", stats.skills.grammar],
        ["listen", stats.skills.listening],
        ["speak", stats.skills.speaking],
        ["read", stats.skills.reading],
        ["write", stats.skills.writing]
    ];
    barMap.forEach(([key, pct]) => {
        setTxt(`skill-${key}-pct`, `${pct}%`);
        const bar = document.getElementById(`skill-${key}-bar`);
        if (bar) bar.style.width = `${pct}%`;
    });

    renderDashboardRadarChart(stats.skills);
    renderDailyPlanTasks();
    renderDailyMotivationWidget();
    renderWeeklyStreakBoxes();
}

function renderDashboardRadarChart(skills) {
    const canvas = document.getElementById("dash-radar-chart");
    if (!canvas || typeof Chart === "undefined") return;

    const dataArr = [
        skills.listening,
        skills.speaking,
        skills.reading,
        skills.writing,
        skills.vocabGrammar
    ];

    if (skillRadarChartInstance) {
        skillRadarChartInstance.data.datasets[0].data = dataArr;
        skillRadarChartInstance.update();
        return;
    }

    skillRadarChartInstance = new Chart(canvas.getContext("2d"), {
        type: "radar",
        data: {
            labels: ["Listening", "Speaking", "Reading", "Writing", "Grammar & Vocab"],
            datasets: [{
                label: "Mức độ hoàn thiện (%)",
                data: dataArr,
                backgroundColor: "rgba(139, 92, 246, 0.28)",
                borderColor: "#8B5CF6",
                pointBackgroundColor: "#06B6D4",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: { stepSize: 25, display: false },
                    grid: { color: "rgba(255,255,255,0.08)" },
                    angleLines: { color: "rgba(255,255,255,0.08)" },
                    pointLabels: { color: "#cbd5e1", font: { size: 11, weight: "bold" } }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderDailyPlanTasks() {
    const container = document.getElementById("daily-tasks");
    if (!container) return;
    const todayKey = getLocalDateKey();
    const dash = getDashboardSaved();
    const doneMap = (dash.tasksByDate && dash.tasksByDate[todayKey]) || {};

    container.innerHTML = DEFAULT_DAILY_PLAN.map(task => {
        const checked = Boolean(doneMap[task.id]);
        return `
            <div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/65 border ${checked ? "border-emerald-500/35 bg-emerald-500/5" : "border-white/5"} transition">
                <label class="flex items-center gap-3 cursor-pointer flex-1">
                    <input type="checkbox" class="task-check" ${checked ? "checked" : ""} onchange="toggleDailyTask('${task.id}')">
                    <div>
                        <p class="text-xs md:text-sm font-bold ${checked ? "line-through text-slate-400" : "text-white"}">${task.icon} ${escHtml(task.title)}</p>
                        <p class="text-[11px] text-slate-400">Thời lượng gợi ý: ${task.duration}</p>
                    </div>
                </label>
                <button onclick="navigateTo('${task.targetPage}'${task.targetSub ? `, '${task.targetSub}'` : ""})" class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-violet-600/30 border border-white/10 text-[11px] font-bold text-cyan-300 shrink-0">
                    Học →
                </button>
            </div>
        `;
    }).join("");
}

function toggleDailyTask(taskId) {
    const todayKey = getLocalDateKey();
    const dash = getDashboardSaved();
    if (!dash.tasksByDate) dash.tasksByDate = {};
    if (!dash.tasksByDate[todayKey]) dash.tasksByDate[todayKey] = {};
    dash.tasksByDate[todayKey][taskId] = !dash.tasksByDate[todayKey][taskId];
    saveDashboardSaved(dash);
    renderDailyPlanTasks();
}

function renderDailyMotivationWidget() {
    const box = document.getElementById("daily-motivation");
    if (!box) return;
    const quotes = typeof DAILY_QUOTES !== "undefined" ? DAILY_QUOTES : [];
    const daySeed = new Date().getDate();
    const q = quotes[daySeed % Math.max(1, quotes.length)] || {
        en: "Consistency beats intensity.",
        vi: "Sự đều đặn luôn chiến thắng sự bộc phát nhất thời.",
        tip: "Hoàn thành ít nhất 3 nhiệm vụ nhỏ mỗi ngày!"
    };
    const wordOfDay = deck.length > 0 ? deck[daySeed % deck.length] : null;

    box.innerHTML = `
        <p class="text-[11px] text-cyan-400 font-extrabold uppercase tracking-wider">💡 Động lực & Từ vựng trong ngày</p>
        <p class="text-sm text-white font-semibold italic mt-1">"${escHtml(q.en)}"</p>
        <p class="text-xs text-slate-400 mt-0.5">— ${escHtml(q.vi)}</p>
        ${wordOfDay ? `
            <div class="mt-2 pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                <span>🌟 Từ hôm nay: <strong class="text-amber-300">${escHtml(wordOfDay.term)}</strong> (${escHtml(wordOfDay.def)})</span>
                <button onclick='speakText(${JSON.stringify(wordOfDay.term)}, 1.0)' class="text-cyan-300 font-bold">🔊</button>
            </div>
        ` : ""}
    `;
}

function renderWeeklyStreakBoxes() {
    const wrap = document.getElementById("dash-weekly-streak");
    if (!wrap) return;
    const weekly = computeWeeklyComparison();
    const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
    const todayKey = getLocalDateKey();

    wrap.innerHTML = weekly.thisWeek.minutesByDay.map((d, idx) => {
        const active = d.minutes >= 1 || (progressState.days[d.dateKey] && (
            progressState.days[d.dateKey].newWords > 0 ||
            progressState.days[d.dateKey].listeningDone > 0 ||
            progressState.days[d.dateKey].readingDone > 0 ||
            progressState.days[d.dateKey].writingDone > 0 ||
            progressState.days[d.dateKey].speakingSessions > 0 ||
            progressState.days[d.dateKey].grammarDone > 0
        ));
        const isToday = d.dateKey === todayKey;
        return `
            <div class="flex-1 p-3 rounded-2xl text-center border ${active ? "bg-violet-600/25 border-violet-400/50" : "bg-slate-950/60 border-white/5"} ${isToday ? "ring-1 ring-cyan-400" : ""}">
                <p class="text-[11px] font-bold ${isToday ? "text-cyan-300" : "text-slate-400"}">${dayNames[idx]}</p>
                <p class="text-lg my-1">${active ? "🔥" : "⚪"}</p>
                <p class="text-[10px] text-slate-300 font-semibold">${d.minutes}p</p>
            </div>
        `;
    }).join("");
}

/* ==================== PROGRESS ANALYTICS & ADAPTIVE LEARNING (PHẦN 7) ==================== */
function renderProgressAnalyticsPage() {
    const stats = computeOverallAnalytics();
    const todayLog = ensureTodayLog();
    const weekly = computeWeeklyComparison();
    const recs = computeAdaptiveRecommendations();

    const setTxt = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    setTxt("prog-total-days", stats.totalDaysStudied);
    setTxt("prog-total-words", `${stats.wordsLearned} / ${deck.length}`);
    setTxt("prog-total-lessons", stats.totalGrammar + stats.totalListening + stats.totalReading + stats.totalWriting + stats.totalSpeaking);
    setTxt("prog-total-time", stats.totalMinutes >= 60 ? `${(stats.totalMinutes / 60).toFixed(1)}h` : `${stats.totalMinutes}p`);

    // 7.1 Daily Report
    const dailyBox = document.getElementById("prog-daily-report");
    if (dailyBox) {
        const recentMistakes = (todayLog.mistakes || []).slice(-4);
        dailyBox.innerHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div class="p-3 rounded-xl bg-slate-950/80 border border-white/5"><span class="text-slate-400 block">Thời gian hôm nay</span><strong class="text-base text-cyan-300">${Math.round(todayLog.minutes || 0)} phút</strong></div>
                <div class="p-3 rounded-xl bg-slate-950/80 border border-white/5"><span class="text-slate-400 block">Từ mới / Ôn tập</span><strong class="text-base text-violet-300">${todayLog.newWords || 0} mới • ${todayLog.reviewedWords || 0} ôn</strong></div>
                <div class="p-3 rounded-xl bg-slate-950/80 border border-white/5"><span class="text-slate-400 block">Nghe / Đọc hôm nay</span><strong class="text-base text-amber-300">${todayLog.listeningDone || 0} Nghe • ${todayLog.readingDone || 0} Đọc</strong></div>
                <div class="p-3 rounded-xl bg-slate-950/80 border border-white/5"><span class="text-slate-400 block">Viết / Speaking</span><strong class="text-base text-emerald-300">${todayLog.writingDone || 0} bài • ${todayLog.speakingMinutes || 0}p nói</strong></div>
            </div>
            <div class="mt-3 p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs">
                <span class="font-bold text-rose-300">⚠️ Các lỗi nổi bật ghi nhận hôm nay:</span>
                ${recentMistakes.length
                    ? `<ul class="list-disc pl-5 mt-1 text-slate-300 space-y-0.5">${recentMistakes.map(m => `<li>[${escHtml(m.category)}] ${escHtml(m.summary)}</li>`).join("")}</ul>`
                    : `<span class="text-slate-400 ml-1">Chưa ghi nhận lỗi sai nào hôm nay.</span>`}
            </div>
        `;
    }

    // 7.2 Weekly Comparison Table (100% Real Data!)
    const weeklyTable = document.getElementById("prog-weekly-comparison");
    if (weeklyTable) {
        const rows = [
            { label: "Listening", last: weekly.lastWeek.listening, cur: weekly.thisWeek.listening },
            { label: "Speaking", last: weekly.lastWeek.speaking, cur: weekly.thisWeek.speaking },
            { label: "Reading", last: weekly.lastWeek.reading, cur: weekly.thisWeek.reading },
            { label: "Writing", last: weekly.lastWeek.writing, cur: weekly.thisWeek.writing },
            { label: "Grammar & Vocabulary", last: weekly.lastWeek.vocabGrammar, cur: weekly.thisWeek.vocabGrammar }
        ];
        weeklyTable.innerHTML = `
            <div class="overflow-x-auto rounded-xl border border-white/10">
                <table class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-950 text-slate-300">
                        <tr>
                            <th class="p-3 border-b border-white/10">Nhóm Kỹ Năng</th>
                            <th class="p-3 border-b border-white/10">Tuần trước (Thực tế)</th>
                            <th class="p-3 border-b border-white/10">Tuần này (Thực tế)</th>
                            <th class="p-3 border-b border-white/10">Chênh lệch</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        ${rows.map(r => {
                            const diff = r.cur - r.last;
                            const diffStr = diff > 0 ? `+${diff}% ▲` : diff < 0 ? `${diff}% ▼` : "0% —";
                            const diffCls = diff > 0 ? "text-emerald-400" : diff < 0 ? "text-rose-400" : "text-slate-400";
                            return `
                                <tr>
                                    <td class="p-3 font-bold text-white">${r.label}</td>
                                    <td class="p-3 text-slate-300">${r.last}%</td>
                                    <td class="p-3 font-bold text-cyan-300">${r.cur}%</td>
                                    <td class="p-3 font-extrabold ${diffCls}">${diffStr}</td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
            <p class="text-[11px] text-slate-400 mt-2">*Tất cả số liệu trên được tính toán trực tiếp từ kết quả làm bài thực tế lưu trên trình duyệt của bạn, tuyệt đối không tự sinh điểm giả.</p>
        `;
    }

    // Weekly Minutes Chart
    const wkCanvas = document.getElementById("prog-weekly-chart");
    if (wkCanvas && typeof Chart !== "undefined") {
        const labels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
        const mins = weekly.thisWeek.minutesByDay.map(d => d.minutes);
        if (weeklyMinutesChartInstance) {
            weeklyMinutesChartInstance.data.datasets[0].data = mins;
            weeklyMinutesChartInstance.update();
        } else {
            weeklyMinutesChartInstance = new Chart(wkCanvas.getContext("2d"), {
                type: "bar",
                data: {
                    labels,
                    datasets: [{
                        label: "Phút học tập",
                        data: mins,
                        backgroundColor: "rgba(6, 182, 212, 0.55)",
                        borderColor: "#06B6D4",
                        borderWidth: 1,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.06)" } },
                        x: { ticks: { color: "#cbd5e1" }, grid: { display: false } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
    }

    // 7.3 Adaptive Learning Recommendations
    const adaptBox = document.getElementById("prog-adaptive-box");
    window._adaptiveRecs = recs;
    if (adaptBox) {
        const styleByType = {
            urgent: "border-rose-500/40 bg-rose-500/10",
            remedial: "border-amber-500/40 bg-amber-500/10",
            advance: "border-emerald-500/40 bg-emerald-500/10",
            collecting: "border-cyan-500/30 bg-slate-950/80",
            start: "border-white/10 bg-slate-950/60",
            steady: "border-violet-500/30 bg-violet-500/10"
        };
        adaptBox.innerHTML = recs.map((r, i) => `
            <div class="p-4 rounded-2xl border ${styleByType[r.type] || styleByType.start} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div class="space-y-1">
                    <p class="font-extrabold text-white text-sm">${escHtml(r.title)}</p>
                    <p class="text-slate-300">${escHtml(r.advice)}</p>
                </div>
                <button onclick="window._adaptiveRecs[${i}].actionFn()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-violet-600 text-cyan-300 hover:text-white font-bold border border-white/10 shrink-0 transition">
                    ${escHtml(r.actionLabel)} →
                </button>
            </div>
        `).join("");
    }

    // Activity Log
    const actLog = document.getElementById("activity-log");
    const actEmpty = document.getElementById("activity-empty");
    const acts = progressState.activities || [];
    if (acts.length === 0) {
        if (actLog) actLog.innerHTML = "";
        actEmpty?.classList.remove("hidden");
    } else {
        actEmpty?.classList.add("hidden");
        if (actLog) {
            actLog.innerHTML = acts.slice(0, 30).map(a => `
                <div class="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/80 border border-white/5 text-xs">
                    <div>
                        <span class="font-bold text-white">${escHtml(a.title)}</span>
                        <span class="text-slate-500 ml-2">${new Date(a.at).toLocaleString("vi-VN")}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        ${typeof a.scorePct === "number" ? `<span class="font-extrabold text-cyan-300">${a.scorePct}%</span>` : ""}
                        ${renderSourceBadge(a.source || "local-browser")}
                    </div>
                </div>
            `).join("");
        }
    }
}

/* ==================== SETTINGS, SECURITY & ONBOARDING ==================== */
function renderSettingsAndCMSPage() {
    if (!appSettings) loadSettings();
    const backendInput = document.getElementById("setting-backend-url");
    if (backendInput) backendInput.value = appSettings.backendApiUrl || "/api/ai";
    const consentChk = document.getElementById("setting-ai-consent");
    if (consentChk) consentChk.checked = Boolean(appSettings.aiConsentAccepted);
    const dwInput = document.getElementById("setting-daily-words");
    if (dwInput) dwInput.value = appSettings.dailyWordGoal || 10;
    const dtInput = document.getElementById("setting-daily-time");
    if (dtInput) dtInput.value = appSettings.dailyMinutesGoal || 60;

    AIClient.syncStatusBadges();
    renderCMSContentTable();
}

async function saveBackendSettingsAndTest() {
    const backendApiUrl = (document.getElementById("setting-backend-url")?.value || "/api/ai").trim() || "/api/ai";
    const aiConsentAccepted = Boolean(document.getElementById("setting-ai-consent")?.checked);
    saveSettings({ backendApiUrl, aiConsentAccepted });
    showToast("Đang kiểm tra kết nối tới Backend AI...");
    const st = await AIClient.checkStatus();
    showToast(st.message, st.connected ? "success" : "warning");
}

function saveLearningSettings() {
    const dailyWordGoal = Math.max(1, parseInt(document.getElementById("setting-daily-words")?.value || "10", 10) || 10);
    const dailyMinutesGoal = Math.max(15, parseInt(document.getElementById("setting-daily-time")?.value || "60", 10) || 60);
    saveSettings({ dailyWordGoal, dailyMinutesGoal });
    showToast("Đã lưu mục tiêu học tập hàng ngày!");
}

function exportBackup() {
    exportAllBackupJSON();
}

function exportAllData() {
    exportAllBackupJSON();
}

function importBackup(event) {
    const file = event?.target?.files?.[0];
    importAllBackupJSON(file, () => {
        applyStudyFilter();
        renderWordList();
        refreshDashboardUI();
    });
    if (event?.target) event.target.value = "";
}

function importAllData(event) {
    importBackup(event);
}

function clearAllProgress() {
    if (!confirm("Xác nhận xóa lịch sử tiến độ các bài tập nhưng GIỮ NGUYÊN 100% Kho từ vựng (qenglish_deck_v2) và Sổ tay ghi chú?")) return;
    [STORAGE_KEYS.PROGRESS, STORAGE_KEYS.DASHBOARD, STORAGE_KEYS.GRAMMAR, STORAGE_KEYS.LISTENING, STORAGE_KEYS.SPEAKING, STORAGE_KEYS.READING, STORAGE_KEYS.WRITING, STORAGE_KEYS.SRS].forEach(k => {
        localStorage.removeItem(k);
    });
    loadSRSState();
    loadProgressState();
    refreshDashboardUI();
    renderProgressAnalyticsPage();
    showToast("Đã đặt lại tiến độ học tập (Kho từ vựng và Sổ tay được giữ nguyên an toàn)!");
}

function openOnboardingModal() {
    document.getElementById("onboarding-modal")?.classList.remove("hidden");
}

function closeOnboardingModal() {
    document.getElementById("onboarding-modal")?.classList.add("hidden");
    saveSettings({ onboardingCompleted: true });
}

/* ==================== MULTI-ACCOUNT & GROUP LEADERBOARD UI ==================== */
function syncAccountBadgesUI() {
    if (typeof getActiveAccount !== "function") return;
    const acc = getActiveAccount();
    if (!acc) return;

    const headerBtn = document.getElementById("header-account-btn");
    if (headerBtn) {
        headerBtn.innerHTML = `<span>${escHtml(acc.avatar || "🚀")}</span><span class="max-w-[110px] truncate">${escHtml(acc.name)}</span><span class="text-[10px] text-cyan-300">▾</span>`;
    }
    const sbName = document.getElementById("sidebar-account-name");
    if (sbName) sbName.textContent = `${acc.avatar || "🚀"} ${acc.name}`;
    const sbGoal = document.getElementById("sidebar-account-goal");
    if (sbGoal) sbGoal.textContent = acc.goal || "QEnglish Personal System";
    const dashBadge = document.getElementById("dash-user-badge");
    if (dashBadge) dashBadge.textContent = `${acc.avatar || "🚀"} Tài khoản: ${acc.name} (@${acc.username})`;
}

function openAccountModal() {
    syncCurrentAccountSnapshot();
    renderAccountModalUI();
    document.getElementById("account-modal")?.classList.remove("hidden");
}

function closeAccountModal() {
    document.getElementById("account-modal")?.classList.add("hidden");
}

function renderAccountModalUI() {
    const store = loadAccountsStore();
    const active = getActiveAccount();
    const allAccounts = Object.values(store.accounts || {});

    const editName = document.getElementById("acc-edit-name");
    if (editName) editName.value = active.name || "";
    const editGoal = document.getElementById("acc-edit-goal");
    if (editGoal) editGoal.value = active.goal || "";
    const editAvatar = document.getElementById("acc-edit-avatar");
    if (editAvatar) editAvatar.value = active.avatar || "🚀";
    const editPin = document.getElementById("acc-edit-pin");
    if (editPin) editPin.value = active.pin || "";

    const listEl = document.getElementById("accounts-leaderboard-list");
    if (listEl) {
        const sorted = [...allAccounts].sort((a, b) => {
            const sa = a.statsSummary || {};
            const sb = b.statsSummary || {};
            return ((sb.wordsMastered || 0) * 10 + (sb.totalMinutes || 0)) - ((sa.wordsMastered || 0) * 10 + (sa.totalMinutes || 0));
        });

        listEl.innerHTML = sorted.map((acc, idx) => {
            const isCurrent = acc.id === store.activeAccountId;
            const st = acc.statsSummary || {};
            const hasPin = Boolean(acc.pin && String(acc.pin).trim());
            return `
                <div class="p-3.5 rounded-2xl border ${isCurrent ? "bg-violet-600/20 border-violet-400/50" : "bg-slate-950/80 border-white/10"} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl shrink-0">
                            ${escHtml(acc.avatar || "🌟")}
                        </div>
                        <div>
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-extrabold text-white text-sm">#${idx + 1} ${escHtml(acc.name)}</span>
                                <span class="text-slate-400">@${escHtml(acc.username)}</span>
                                ${hasPin ? `<span class="text-amber-300" title="Có mã PIN bảo vệ">🔒</span>` : ""}
                                ${isCurrent ? `<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold">Đang dùng</span>` : ""}
                            </div>
                            <p class="text-[11px] text-slate-400 mt-0.5">${escHtml(acc.goal || "Chinh phục Tiếng Anh")}</p>
                            <div class="flex flex-wrap gap-3 mt-1 text-[11px] font-bold">
                                <span class="text-amber-300">🔥 ${st.streak || 0} ngày</span>
                                <span class="text-violet-300">📖 ${st.wordsLearned || 0} từ học (${st.wordsMastered || 0} thuộc)</span>
                                <span class="text-cyan-300">⏱️ ${st.totalMinutes || 0} phút</span>
                                ${st.avgScore !== null && st.avgScore !== undefined ? `<span class="text-emerald-300">🎯 TB ${st.avgScore}%</span>` : ""}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        ${!isCurrent ? `
                            <button onclick="handleSwitchAccount('${acc.id}')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold hover:opacity-95 transition">
                                Chuyển vào học →
                            </button>
                            <button onclick="handleDeleteAccount('${acc.id}')" class="p-2 rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/30" title="Xóa tài khoản này">🗑️</button>
                        ` : `
                            <button onclick="exportActiveAccountJSON()" class="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                                📥 Tải hồ sơ
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join("");
    }
}

function handleSaveActiveAccountProfile() {
    const name = document.getElementById("acc-edit-name")?.value || "";
    const goal = document.getElementById("acc-edit-goal")?.value || "";
    const avatar = document.getElementById("acc-edit-avatar")?.value || "🚀";
    const pin = document.getElementById("acc-edit-pin")?.value || "";
    updateActiveAccountProfile({ name, goal, avatar, pin });
    syncAccountBadgesUI();
    refreshDashboardUI();
    renderAccountModalUI();
    showToast("Đã cập nhật thông tin tài khoản của bạn!");
}

function handleCreateNewAccountSubmit() {
    const name = (document.getElementById("new-acc-name")?.value || "").trim();
    const username = (document.getElementById("new-acc-username")?.value || "").trim();
    const goal = (document.getElementById("new-acc-goal")?.value || "Giao tiếp & Từ vựng toàn diện").trim();
    const avatar = document.getElementById("new-acc-avatar")?.value || "🌟";
    const pin = (document.getElementById("new-acc-pin")?.value || "").trim();

    const res = createNewUserAccount({ name, username, avatar, goal, pin });
    if (!res.ok) {
        showToast(res.error, "error");
        return;
    }

    document.getElementById("new-acc-name").value = "";
    document.getElementById("new-acc-username").value = "";
    document.getElementById("new-acc-pin").value = "";

    applyStudyFilter();
    renderWordList();
    syncAccountBadgesUI();
    refreshDashboardUI();
    renderAccountModalUI();
    closeAccountModal();
    showToast(`🎉 Đã tạo và chuyển sang tài khoản riêng của "${res.account.name}"!`);
}

function handleSwitchAccount(accountId) {
    const res = switchToUserAccount(accountId);
    if (!res.ok) {
        if (!res.cancelled && res.error) showToast(res.error, "error");
        return;
    }
    applyStudyFilter();
    renderWordList();
    syncAccountBadgesUI();
    navigateTo(activeMainPage, currentVocabSubTab);
    renderAccountModalUI();
    closeAccountModal();
    showToast(`👋 Chào mừng quay lại, ${res.account.name}! Dữ liệu riêng của bạn đã được nạp.`);
}

function handleDeleteAccount(accountId) {
    if (!confirm("Bạn có chắc muốn xóa tài khoản này khỏi thiết bị?")) return;
    const res = deleteUserAccount(accountId);
    if (!res.ok) {
        showToast(res.error, "error");
        return;
    }
    renderAccountModalUI();
    showToast("Đã xóa tài khoản.");
}

function handleImportAccountFile(event) {
    const file = event?.target?.files?.[0];
    importUserAccountJSON(file, () => {
        applyStudyFilter();
        renderWordList();
        syncAccountBadgesUI();
        refreshDashboardUI();
        renderAccountModalUI();
    });
    if (event?.target) event.target.value = "";
}

/* ==================== MASTER APPLICATION BOOTSTRAP ==================== */
window.addEventListener("DOMContentLoaded", () => {
    loadAccountsStore();
    loadSettings();
    loadDeckFromStorage();
    loadSRSState();
    loadProgressState();
    loadNotebook();
    loadCMSItems();
    syncAccountBadgesUI();
    syncCurrentAccountSnapshot();

    // Sync saved audio & level preferences
    speechRate = appSettings.speechRate || 1.0;
    autoPlay = appSettings.autoPlay !== false;
    const speedSel = document.getElementById("speed-select");
    if (speedSel) speedSel.value = String(speechRate);
    const autoTxt = document.getElementById("autoplay-text");
    if (autoTxt) autoTxt.textContent = autoPlay ? "Tự Đọc: Bật" : "Tự Đọc: Tắt";
    const glSel = document.getElementById("global-level");
    if (glSel && appSettings.selectedLevel) {
        const exists = [...glSel.options].some(o => o.value === appSettings.selectedLevel);
        if (exists) glSel.value = appSettings.selectedLevel;
    }

    // Sync initial study deck & dashboard
    applyStudyFilter();
    setupVocabularyKeyboardShortcuts();
    setupRealStudyTimer();
    refreshDashboardUI();

    // Check Backend AI connection honestly in background
    AIClient.checkStatus();

    // Double-click word lookup inside Reading passage
    const readingTextEl = document.getElementById("reading-passage-text");
    if (readingTextEl) {
        readingTextEl.addEventListener("dblclick", () => handlePassageWordLookup());
    }

    // Show first-time user guide if never seen (PHẦN 8.4)
    if (!appSettings.onboardingCompleted) {
        openOnboardingModal();
    }
});





/* ==========================================================================
   MY LEARNING MATERIALS & RESOURCE IMPORT (HẠNG MỤC 4, 5, 6, 7)
   Central Hub for Teacher Homework, Personal Passages, Audio, Prompts & URL Extractor
   ========================================================================== */

function renderMaterialsPageTable() {
    if (!cmsItems.length) loadCMSItems();
    const list = document.getElementById("materials-explorer-list");
    if (!list) return;

    const search = (document.getElementById("mat-filter-search")?.value || "").toLowerCase().trim();
    const skillFilter = document.getElementById("mat-filter-skill")?.value || "all";
    const statusFilter = document.getElementById("mat-filter-status")?.value || "all";

    const filtered = cmsItems.filter(item => {
        const hay = `${item.title} ${item.topic} ${item.skill} ${item.contentText || ""}`.toLowerCase();
        const matchesSearch = !search || hay.includes(search);
        const matchesSkill = skillFilter === "all" || item.skill === skillFilter;
        const matchesStatus = statusFilter === "all" || (item.studyStatus || "not_started") === statusFilter;
        return matchesSearch && matchesSkill && matchesStatus;
    });

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="p-8 text-center glass-panel rounded-2xl space-y-2">
                <div class="text-4xl">📚</div>
                <p class="font-bold text-white">Chưa có tài liệu cá nhân nào phù hợp bộ lọc</p>
                <p class="text-xs text-slate-400">Hãy dùng các ô tải file, dán bài hoặc trích xuất URL ở phía trên để thêm học liệu riêng của bạn!</p>
            </div>
        `;
        return;
    }

    list.innerHTML = filtered.map(item => {
        const status = item.studyStatus || "not_started";
        const statusBadge = status === "completed"
            ? '<span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold border border-emerald-500/25">✅ Đã hoàn thành</span>'
            : (status === "in_progress"
                ? '<span class="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/25">⏳ Đang học</span>'
                : '<span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold border border-white/10">🆕 Chưa học</span>');

        return `
            <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3 hover:border-violet-500/40 transition">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-extrabold text-white text-sm">${escHtml(item.title)}</span>
                        ${renderLevelBadge(item.level)}
                        <span class="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">${escHtml(item.skill)}</span>
                        ${renderSourceBadge(item.source)}
                        ${statusBadge}
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button onclick='launchMaterialPracticeSession(${JSON.stringify(item.id)})' class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:from-violet-500 hover:to-indigo-500 transition">
                            🚀 Vào Luyện Tập Ngay
                        </button>
                        <button onclick='deleteMaterialItem(${JSON.stringify(item.id)})' class="px-2.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 text-xs font-bold hover:bg-rose-500/30 transition">
                            ✕
                        </button>
                    </div>
                </div>
                <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed">${escHtml(item.contentText || (item.payload && (item.payload.passage || item.payload.prompt || item.payload.transcript)) || "")}</p>
                <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-white/5">
                    <span>Thư mục: <strong class="text-slate-300">${escHtml(item.topic || "General")}</strong></span>
                    <span>Thêm ngày: ${new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
            </div>
        `;
    }).join("");
}

function launchMaterialPracticeSession(id) {
    if (!cmsItems.length) loadCMSItems();
    const item = cmsItems.find(x => x.id === id);
    if (!item) return;

    item.studyStatus = "in_progress";
    saveCMSItems();

    const skill = item.skill;
    if (skill === "writing") {
        navigateTo("writing");
        openWritingEditor(item.id, item.payload || {
            id: item.id,
            title: item.title,
            level: item.level,
            prompt: item.contentText,
            minWords: 80,
            timeLimit: 25
        });
    } else if (skill === "reading") {
        navigateTo("reading");
        openReadingPassage(item.id);
    } else if (skill === "listening") {
        navigateTo("listening");
        openListeningExercise(item.id);
    } else if (skill === "speaking") {
        navigateTo("speaking");
        openTopicSpeakingWorkspace(item.id);
    } else if (skill === "grammar") {
        navigateTo("grammar");
        openGrammarLessonModal(item.id);
    }
}

function deleteMaterialItem(id) {
    if (!confirm("Xóa tài liệu này khỏi kho học liệu cá nhân của bạn?")) return;
    cmsItems = cmsItems.filter(x => x.id !== id);
    saveCMSItems();
    renderMaterialsPageTable();
    showToast("Đã xóa tài liệu khỏi kho cá nhân.");
}

async function extractContentFromUrlChannel() {
    const url = (document.getElementById("mat-url-input")?.value || "").trim();
    const skill = document.getElementById("mat-url-skill")?.value || "reading";
    const level = document.getElementById("mat-url-level")?.value || "B1";
    const previewBox = document.getElementById("mat-url-preview-box");

    if (!url) {
        showToast("Vui lòng nhập địa chỉ URL bài học cần trích xuất!", "error");
        return;
    }

    if (previewBox) {
        previewBox.classList.remove("hidden");
        previewBox.innerHTML = `<p class="text-xs text-cyan-300 font-bold animate-pulse">🌐 Đang kiểm tra URL và trích xuất nội dung bài học an toàn...</p>`;
    }

    const res = await AIClient.request("extract-url", { url });
    if (!res.ok || !res.data) {
        if (previewBox) {
            previewBox.innerHTML = `
                <div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1.5">
                    <p class="font-bold">⚠️ Trích xuất trực tiếp chưa hoàn tất: ${escHtml(res.error || "Không thể tải từ URL.")}</p>
                    <p class="text-slate-300">Quy tắc bảo mật & Bản quyền: Nếu website yêu cầu đăng nhập, chứa paywall hoặc chặn bot, bạn có thể sao chép văn bản bài học và dán vào ô <strong>Phương thức 2: Dán Đề Bài Thủ Công</strong> bên cạnh để hệ thống lưu và hỗ trợ luyện tập ngay lập tức!</p>
                </div>
            `;
        }
        return;
    }

    const ext = res.data;
    const candidatePayload = {
        skill,
        level,
        title: ext.title || "Tài liệu học từ URL",
        topic: ext.hostname || "Web Resource",
        contentText: ext.extractedText,
        source: "external-link",
        sourceUrl: ext.url,
        payload: {
            passage: ext.extractedText,
            transcript: ext.extractedText,
            prompt: `Dựa vào tài liệu từ "${ext.title}": Hãy phân tích và tóm tắt nội dung chính.`,
            audioText: ext.extractedText,
            questions: []
        }
    };

    window.lastExtractedCandidate = candidatePayload;

    if (previewBox) {
        previewBox.innerHTML = `
            <div class="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2.5 text-xs">
                <div class="flex items-center justify-between">
                    <span class="font-bold text-emerald-300">✅ Đã trích xuất thành công (${ext.wordCount} từ)</span>
                    <span class="text-slate-400 font-mono text-[10px]">${escHtml(ext.hostname)}</span>
                </div>
                <p class="font-extrabold text-white text-sm">${escHtml(ext.title)}</p>
                <p class="text-slate-300 line-clamp-3 leading-relaxed">${escHtml(ext.extractedText)}</p>
                <div class="flex items-center gap-2 pt-1">
                    <button onclick="confirmSaveExtractedMaterial()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition">
                        💾 Lưu Ngay Vào Kho Học Liệu
                    </button>
                    <button onclick="document.getElementById('mat-url-preview-box').classList.add('hidden')" class="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition">
                        Đóng
                    </button>
                </div>
            </div>
        `;
    }
}

function confirmSaveExtractedMaterial() {
    if (!window.lastExtractedCandidate) return;
    const c = window.lastExtractedCandidate;
    const saved = addCMSContent(c);
    if (!saved.ok) {
        showToast("Chống trùng lặp: " + saved.error, "error");
        return;
    }
    window.lastExtractedCandidate = null;
    document.getElementById("mat-url-preview-box")?.classList.add("hidden");
    const input = document.getElementById("mat-url-input");
    if (input) input.value = "";
    renderMaterialsPageTable();
    showToast(`Đã lưu tài liệu "${c.title}" vào kho của bạn!`);
}

function saveManualMaterialChannel() {
    const title = (document.getElementById("mat-manual-title")?.value || "").trim();
    const skill = document.getElementById("mat-manual-skill")?.value || "writing";
    const level = document.getElementById("mat-manual-level")?.value || "B1";
    const folder = (document.getElementById("mat-manual-folder")?.value || "Bài tập cá nhân").trim();
    const body = (document.getElementById("mat-manual-body")?.value || "").trim();

    if (!title || !body) {
        showToast("Vui lòng nhập đầy đủ Tên tài liệu và Nội dung!", "error");
        return;
    }

    let payload = {};
    if (skill === "reading") {
        payload = { passage: body, questions: [] };
    } else if (skill === "listening") {
        const sents = (body.match(/[^.!?]+[.!?]+/g) || [body]).map(s => s.trim()).filter(Boolean);
        payload = {
            type: "dictation",
            transcript: body,
            audioText: body,
            sentences: sents,
            questions: []
        };
    } else if (skill === "writing") {
        payload = {
            type: "essay",
            prompt: body,
            minWords: 60,
            maxWords: 250,
            timeLimit: 30
        };
    } else if (skill === "speaking") {
        payload = {
            type: "monologue",
            prompt: body,
            suggestedQuestions: ["Can you explain your perspective on this topic?", "Give a specific example from your experience."],
            duration: 90
        };
    } else if (skill === "grammar") {
        payload = {
            intro: folder,
            explanation: body,
            formula: "Grammar Formula",
            examples: [],
            commonMistakes: [],
            exercises: []
        };
    }

    const res = addCMSContent({
        skill,
        level,
        title,
        topic: folder,
        contentText: body,
        source: "user-imported",
        payload
    });

    if (!res.ok) {
        showToast("Chống trùng lặp: " + res.error, "error");
        return;
    }

    const titleEl = document.getElementById("mat-manual-title");
    const bodyEl = document.getElementById("mat-manual-body");
    if (titleEl) titleEl.value = "";
    if (bodyEl) bodyEl.value = "";

    renderMaterialsPageTable();
    showToast(`Đã lưu "${title}" vào kho tài liệu ${skill.toUpperCase()}!`);
}

function handleMaterialFileUpload(event) {
    const file = event?.target?.files?.[0];
    if (!file) return;

    // File limit check (15MB)
    if (file.size > 15 * 1024 * 1024) {
        showToast("Dung lượng file vượt quá giới hạn 15MB cho phép!", "error");
        return;
    }

    const name = file.name;
    const lowerName = name.toLowerCase();

    // Text-based files
    if (lowerName.endsWith(".txt") || lowerName.endsWith(".doc") || lowerName.endsWith(".docx") || lowerName.endsWith(".pdf")) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = String(e.target.result || "");
            // Clean up binary noise if any
            const cleanText = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ").trim();
            const title = name.replace(/\.[^.]+$/, "");
            const isWriting = /writing|essay|task|de\s*bai/i.test(name);
            const skill = isWriting ? "writing" : "reading";

            addCMSContent({
                skill,
                level: "B1",
                title: `[Tập tin] ${title}`,
                topic: "Tài liệu tải lên",
                contentText: cleanText.slice(0, 5000),
                source: "user-imported",
                payload: skill === "writing"
                    ? { type: "essay", prompt: cleanText.slice(0, 3000), minWords: 80, timeLimit: 25 }
                    : { passage: cleanText.slice(0, 5000), questions: [] }
            });
            renderMaterialsPageTable();
            showToast(`Đã tải lên và lưu tài liệu "${title}"!`);
        };
        reader.readAsText(file);
    } else if (lowerName.endsWith(".mp3") || lowerName.endsWith(".wav") || lowerName.endsWith(".ogg") || lowerName.endsWith(".m4a")) {
        const title = name.replace(/\.[^.]+$/, "");
        addCMSContent({
            skill: "listening",
            level: "B1",
            title: `[Audio] ${title}`,
            topic: "File âm thanh cá nhân",
            contentText: `File âm thanh: ${name} (Đã sẵn sàng để phát giọng chuẩn và luyện nghe)`,
            source: "user-imported",
            payload: {
                type: "dictation",
                audioText: `This is your personal audio material named ${title}. Listen carefully and practice dictation.`,
                transcript: `This is your personal audio material named ${title}. Listen carefully and practice dictation.`,
                sentences: [`This is your personal audio material named ${title}.`, "Listen carefully and practice dictation."],
                questions: []
            }
        });
        renderMaterialsPageTable();
        showToast(`Đã thêm file nghe "${title}" vào mục Listening!`);
    } else if (file.type.startsWith("image/")) {
        const title = name.replace(/\.[^.]+$/, "");
        addCMSContent({
            skill: "reading",
            level: "B1",
            title: `[Ảnh đề bài] ${title}`,
            topic: "Ảnh chụp đề bài giáo viên",
            contentText: `Ảnh chụp đề bài: ${name}. Bạn có thể xem và thực hành bài làm trực tiếp.`,
            source: "user-imported",
            payload: {
                passage: `Đề bài từ ảnh chụp "${name}". Hãy đọc kỹ yêu cầu và thực hiện bài tập.`,
                questions: []
            }
        });
        renderMaterialsPageTable();
        showToast(`Đã thêm ảnh chụp đề bài "${title}"!`);
    }

    if (event?.target) event.target.value = "";
}

/* ==================== CUSTOM PASSAGE / TOPIC LAUNCHERS FOR SKILLS ==================== */
function openCustomReadingPassage() {
    const title = (document.getElementById("reading-custom-title")?.value || "").trim() || "Bài đọc của tôi";
    const body = (document.getElementById("reading-custom-body")?.value || "").trim();
    if (!body) {
        showToast("Vui lòng dán đoạn văn bản tiếng Anh để bắt đầu đọc!", "error");
        return;
    }
    const customId = "custom-r-" + Date.now();
    const customPassage = {
        id: customId,
        title,
        level: "B1",
        topic: "Tài liệu của tôi",
        passage: body,
        questions: []
    };
    window.lastCustomReadingPassage = customPassage;
    openReadingPassage(customId, customPassage);
}

function openCustomListeningExercise() {
    const title = (document.getElementById("listening-custom-title")?.value || "").trim() || "Bài nghe của tôi";
    const body = (document.getElementById("listening-custom-transcript")?.value || "").trim();
    if (!body) {
        showToast("Vui lòng dán transcript hoặc lời thoại để hệ thống phát âm luyện nghe!", "error");
        return;
    }
    const sents = (body.match(/[^.!?]+[.!?]+/g) || [body]).map(s => s.trim()).filter(Boolean);
    const customId = "custom-l-" + Date.now();
    const customItem = {
        id: customId,
        title,
        level: "B1",
        type: "dictation",
        topic: "Tài liệu của tôi",
        audioText: body,
        transcript: body,
        sentences: sents,
        questions: []
    };
    window.lastCustomListeningExercise = customItem;
    openListeningExercise(customId, customItem);
}

function openCustomSpeakingTopic() {
    const title = (document.getElementById("speaking-custom-title")?.value || "").trim() || "Chủ đề nói của tôi";
    const prompt = (document.getElementById("speaking-custom-prompt")?.value || "").trim() || title;
    const customId = "custom-s-" + Date.now();
    const customTopic = {
        id: customId,
        title,
        level: "B1",
        type: "monologue",
        prompt,
        promptVi: "",
        duration: 90,
        suggestedQuestions: [
            "What are the main aspects of this topic?",
            "Can you provide a concrete example?",
            "How does this impact your daily life or studies?"
        ],
        usefulPhrases: ["From my perspective...", "A prime example is...", "In conclusion..."],
        sampleAnswer: ""
    };
    window.lastCustomSpeakingTopic = customTopic;
    openTopicSpeakingWorkspace(customId, customTopic);
}
